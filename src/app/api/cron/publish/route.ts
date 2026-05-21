import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getLinkedInToken, getLinkedInOrgId, publishToLinkedInCompanyPage } from '@/lib/linkedin'
import { getInstagramCredentials, publishToInstagramBusiness } from '@/lib/instagram'

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

  // Posts APPROVED con scheduledFor <= ahora
  const now = new Date()
  const posts = await db.socialPost.findMany({
    where: {
      status: 'APPROVED',
      scheduledFor: { lte: now },
    },
    include: { blogPost: true },
  })

  if (posts.length === 0) {
    return NextResponse.json({ data: { published: 0, message: 'Sin posts programados para ahora' } })
  }

  const linkedinToken = await getLinkedInToken()
  const orgId = await getLinkedInOrgId()
  const { accessToken: igToken, igUserId } = await getInstagramCredentials()

  let published = 0

  for (const post of posts) {
    type LogEntry = {
      socialPostId: string
      platform: 'LINKEDIN' | 'INSTAGRAM'
      success: boolean
      errorMessage?: string
      responseData?: object
    }
    const logs: LogEntry[] = []
    let linkedinPostId: string | null = null
    let instagramPostId: string | null = null
    let failed = false

    // LinkedIn
    if (linkedinToken && orgId) {
      try {
        linkedinPostId = await publishToLinkedInCompanyPage(linkedinToken, orgId, post.linkedinText, post.blogPost.featuredImage)
        logs.push({ socialPostId: post.id, platform: 'LINKEDIN', success: true, responseData: { postId: linkedinPostId } })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error LinkedIn'
        logs.push({ socialPostId: post.id, platform: 'LINKEDIN', success: false, errorMessage: msg })
        failed = true
      }
    }

    // Si LinkedIn falló, no publicar Instagram
    if (!failed && igToken && igUserId) {
      try {
        const caption = `${post.instagramText}\n\n${post.hashtags.join(' ')}`
        instagramPostId = await publishToInstagramBusiness(igToken, igUserId, caption, post.blogPost.featuredImage)
        logs.push({ socialPostId: post.id, platform: 'INSTAGRAM', success: true, responseData: { postId: instagramPostId } })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error Instagram'
        logs.push({ socialPostId: post.id, platform: 'INSTAGRAM', success: false, errorMessage: msg })
      }
    }

    if (!failed) {
      await db.socialPost.update({
        where: { id: post.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: now,
          ...(linkedinPostId && { linkedinPostId }),
          ...(instagramPostId && { instagramPostId }),
        },
      })
      published++
    }

    await db.publishLog.createMany({ data: logs })
    console.log(`[cron/publish] Post ${post.id}: ${failed ? 'FAILED' : 'PUBLISHED'}`)
  }

  return NextResponse.json({ data: { published, total: posts.length } })
}
