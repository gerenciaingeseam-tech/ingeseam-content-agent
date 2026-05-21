import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generatePostPair } from '@/lib/generator'
import { resolveServiceUrl } from '@/lib/service-mapper'
import { subDays } from 'date-fns'

function verifyCronSecret(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Blogs sin social_post PUBLISHED en los últimos 14 días
    const cutoff = subDays(new Date(), 14)

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
      return NextResponse.json({ data: { generated: 0, message: 'Sin blogs nuevos para procesar' } })
    }

    const generated: string[] = []

    for (const blog of blogs) {
      // Resolver servicio si no tiene asignado
      if (!blog.serviceUrl) {
        const serviceUrl = await resolveServiceUrl(blog.categories)
        await db.blogPost.update({ where: { id: blog.id }, data: { serviceUrl } })
        blog.serviceUrl = serviceUrl
      }

      const { linkedinText, instagramText, hashtags } = await generatePostPair(blog)

      const post = await db.socialPost.create({
        data: {
          blogPostId: blog.id,
          status: 'DRAFT',
          linkedinText,
          instagramText,
          hashtags,
          blogUrl: blog.url,
          serviceUrl: blog.serviceUrl,
        },
      })

      generated.push(post.id)
      console.log(`[cron/generate] Borrador creado: ${post.id} para blog "${blog.title}"`)
    }

    return NextResponse.json({
      data: { generated: generated.length, postIds: generated },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[cron/generate] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
