import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { generatePostPair } from '@/lib/generator'
import { resolveServiceUrl } from '@/lib/service-mapper'

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let blogPostId: string
  try {
    const body = await request.json()
    blogPostId = body.blogPostId
    if (!blogPostId) throw new Error('blogPostId requerido')
  } catch {
    return NextResponse.json({ error: 'Body inválido — se requiere blogPostId' }, { status: 400 })
  }

  // Obtener blog
  const blog = await db.blogPost.findUnique({ where: { id: blogPostId } })
  if (!blog) {
    return NextResponse.json({ error: 'Blog no encontrado' }, { status: 404 })
  }

  // Resolver URL del servicio si no está asignada
  if (!blog.serviceUrl) {
    const serviceUrl = await resolveServiceUrl(blog.categories)
    await db.blogPost.update({
      where: { id: blog.id },
      data: { serviceUrl },
    })
    blog.serviceUrl = serviceUrl
  }

  try {
    // Generar con Claude
    const { linkedinText, instagramText, hashtags } = await generatePostPair(blog)

    // Guardar borrador en DB
    const socialPost = await db.socialPost.create({
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

    return NextResponse.json({ data: { post: socialPost } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando contenido'
    console.error('[api/generate] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
