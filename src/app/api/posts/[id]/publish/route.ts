import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import {
  getLinkedInToken,
  getLinkedInOrgId,
  publishToLinkedInCompanyPage,
} from '@/lib/linkedin'
import {
  getInstagramCredentials,
  publishToInstagramBusiness,
} from '@/lib/instagram'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const post = await db.socialPost.findUnique({
    where: { id },
    include: { blogPost: true },
  })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  // REGLA CRÍTICA: solo publicar si está APPROVED
  if (post.status !== 'APPROVED') {
    return NextResponse.json(
      { error: 'Solo se pueden publicar posts con estado APPROVED' },
      { status: 400 }
    )
  }

  let linkedinPostId: string | null = null
  let instagramPostId: string | null = null

  type LogEntry = {
    socialPostId: string
    platform: 'LINKEDIN' | 'INSTAGRAM'
    success: boolean
    errorMessage?: string
    responseData?: object
  }
  const logs: LogEntry[] = []

  // ─── LinkedIn ────────────────────────────────────────────────────────────
  const linkedinToken = await getLinkedInToken()
  const orgId = await getLinkedInOrgId()

  if (linkedinToken && orgId) {
    try {
      linkedinPostId = await publishToLinkedInCompanyPage(
        linkedinToken, orgId, post.linkedinText, post.blogPost.featuredImage
      )
      logs.push({
        socialPostId: id, platform: 'LINKEDIN', success: true,
        responseData: { postId: linkedinPostId },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error LinkedIn'
      logs.push({ socialPostId: id, platform: 'LINKEDIN', success: false, errorMessage: msg })
      await db.publishLog.createMany({ data: logs })
      // Si LinkedIn falla → no publicar Instagram (regla del blueprint)
      return NextResponse.json({ error: `LinkedIn falló: ${msg}` }, { status: 500 })
    }
  } else {
    logs.push({
      socialPostId: id, platform: 'LINKEDIN', success: false,
      errorMessage: 'LinkedIn no conectado — ir a Configuración',
    })
  }

  // ─── Instagram ───────────────────────────────────────────────────────────
  const { accessToken: igToken, igUserId } = await getInstagramCredentials()

  if (igToken && igUserId) {
    try {
      const caption = `${post.instagramText}\n\n${post.hashtags.join(' ')}`
      instagramPostId = await publishToInstagramBusiness(
        igToken, igUserId, caption, post.blogPost.featuredImage
      )
      logs.push({
        socialPostId: id, platform: 'INSTAGRAM', success: true,
        responseData: { postId: instagramPostId },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error Instagram'
      logs.push({ socialPostId: id, platform: 'INSTAGRAM', success: false, errorMessage: msg })
      // Instagram falla pero LinkedIn ya publicó — registrar error, dejar como publicado
      console.error('[publish] Instagram error (LinkedIn ya publicó):', msg)
    }
  } else {
    logs.push({
      socialPostId: id, platform: 'INSTAGRAM', success: false,
      errorMessage: 'Instagram no conectado — ir a Configuración',
    })
  }

  // ─── Actualizar estado ────────────────────────────────────────────────────
  await db.socialPost.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      ...(linkedinPostId && { linkedinPostId }),
      ...(instagramPostId && { instagramPostId }),
    },
  })

  await db.publishLog.createMany({ data: logs })

  return NextResponse.json({
    data: { success: true, linkedinPostId, instagramPostId },
  })
}
