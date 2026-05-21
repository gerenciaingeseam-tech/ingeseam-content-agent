import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generatePostPair } from '@/lib/generator'
import { resolveServiceUrl } from '@/lib/service-mapper'
import { sendWeeklyReviewEmail, type GeneratedPostSummary } from '@/lib/email'
import { subDays, nextMonday, nextWednesday, nextFriday, isMonday } from 'date-fns'
import type { PostAngle, PostFormat } from '@/lib/prompts'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

/**
 * Calcula las fechas de publicación L/M/V de esta semana (o la siguiente).
 * Los posts se programan a las 8am COT (13:00 UTC).
 */
function getPublishDates(): [Date, Date, Date] {
  const now = new Date()
  const hour = 13 // 8am COT = 13:00 UTC

  let monday: Date
  if (isMonday(now)) {
    monday = new Date(now)
  } else {
    monday = nextMonday(now)
  }

  const wednesday = nextWednesday(monday)
  const friday = nextFriday(monday)

  monday.setUTCHours(hour, 0, 0, 0)
  wednesday.setUTCHours(hour, 0, 0, 0)
  friday.setUTCHours(hour, 0, 0, 0)

  return [monday, wednesday, friday]
}

// Secuencia de ángulos rotativos para variedad
const WEEKLY_ANGLES: PostAngle[] = ['ERROR_COMUN', 'TIP_TECNICO', 'DATO_IMPACTANTE']
const WEEKLY_FORMATS: PostFormat[] = ['SHORT', 'LONG', 'SHORT']

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const cutoff = subDays(new Date(), 14)

    // Blogs sin post PUBLISHED en los últimos 14 días
    const blogs = await db.blogPost.findMany({
      orderBy: { wpPublishedAt: 'desc' },
      where: {
        socialPosts: {
          none: {
            status: 'PUBLISHED',
            publishedAt: { gte: cutoff },
          },
        },
      },
      take: 3,
    })

    if (blogs.length === 0) {
      // Si todos fueron usados, tomar los 3 más recientes igual
      const fallbackBlogs = await db.blogPost.findMany({
        orderBy: { wpPublishedAt: 'desc' },
        take: 3,
      })
      if (fallbackBlogs.length === 0) {
        return NextResponse.json({ data: { generated: 0, message: 'No hay blogs sincronizados' } })
      }
      blogs.push(...fallbackBlogs)
    }

    const [mondayDate, wednesdayDate, fridayDate] = getPublishDates()
    const publishDates = [mondayDate, wednesdayDate, fridayDate]

    const generated: string[] = []
    const summaries: GeneratedPostSummary[] = []

    for (let i = 0; i < Math.min(blogs.length, 3); i++) {
      const blog = blogs[i]
      const angle = WEEKLY_ANGLES[i]
      const format = WEEKLY_FORMATS[i]
      const scheduledFor = publishDates[i]

      if (!blog.serviceUrl) {
        const serviceUrl = await resolveServiceUrl(blog.categories)
        await db.blogPost.update({ where: { id: blog.id }, data: { serviceUrl } })
        blog.serviceUrl = serviceUrl
      }

      const { linkedinText, instagramText, hashtags } = await generatePostPair(blog, format, angle)

      const post = await db.socialPost.create({
        data: {
          blogPostId: blog.id,
          status: 'DRAFT',
          linkedinText,
          instagramText,
          hashtags,
          blogUrl: blog.url,
          serviceUrl: blog.serviceUrl,
          scheduledFor,
          generationNotes: `Auto | Formato: ${format} | Ángulo: ${angle}`,
        },
      })

      generated.push(post.id)
      summaries.push({
        id: post.id,
        blogTitle: blog.title,
        angle,
        format,
        linkedinPreview: linkedinText,
      })

      console.log(`[cron/generate] Post ${i + 1}/3: "${blog.title}" | ${format} | ${angle} → programado ${scheduledFor.toISOString()}`)
    }

    // Enviar email de notificación
    if (summaries.length > 0) {
      await sendWeeklyReviewEmail(summaries)
    }

    return NextResponse.json({
      data: {
        generated: generated.length,
        postIds: generated,
        scheduledDates: {
          monday: mondayDate.toISOString(),
          wednesday: wednesdayDate.toISOString(),
          friday: fridayDate.toISOString(),
        },
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[cron/generate] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
