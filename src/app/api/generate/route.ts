import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { generatePostPair } from '@/lib/generator'
import { resolveServiceUrl } from '@/lib/service-mapper'
import type { PostFormat, PostAngle } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let blogPostId: string
  let format: PostFormat = 'SHORT'
  let angle: PostAngle = 'ERROR_COMUN'

  try {
    const body = await request.json()
    blogPostId = body.blogPostId
    if (!blogPostId) throw new Error('blogPostId requerido')
    if (body.format) format = body.format as PostFormat
    if (body.angle) angle = body.angle as PostAngle
  } catch {
    return NextResponse.json({ error: 'Body inválido — se requiere blogPostId' }, { status: 400 })
  }

  const blog = await db.blogPost.findUnique({ where: { id: blogPostId } })
  if (!blog) return NextResponse.json({ error: 'Blog no encontrado' }, { status: 404 })

  if (!blog.serviceUrl) {
    const serviceUrl = await resolveServiceUrl(blog.categories)
    await db.blogPost.update({ where: { id: blog.id }, data: { serviceUrl } })
    blog.serviceUrl = serviceUrl
  }

  try {
    const { linkedinText, instagramText, hashtags } = await generatePostPair(blog, format, angle)

    const socialPost = await db.socialPost.create({
      data: {
        blogPostId: blog.id,
        status: 'DRAFT',
        linkedinText,
        instagramText,
        hashtags,
        blogUrl: blog.url,
        serviceUrl: blog.serviceUrl,
        generationNotes: `Formato: ${format} | Ángulo: ${angle}`,
      },
    })

    return NextResponse.json({ data: { post: socialPost } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando contenido'
    console.error('[api/generate] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
