import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const post = await db.socialPost.findUnique({
    where: { id },
    include: { blogPost: true, publishLog: true },
  })

  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
  return NextResponse.json({ data: { post } })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const post = await db.socialPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  if (post.status === 'PUBLISHED') {
    return NextResponse.json({ error: 'No se puede eliminar un post publicado' }, { status: 400 })
  }

  // Eliminar logs relacionados primero
  await db.publishLog.deleteMany({ where: { socialPostId: id } })
  await db.socialPost.delete({ where: { id } })

  return NextResponse.json({ data: { deleted: true } })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { linkedinText, instagramText, hashtags, scheduledFor } = body

  const post = await db.socialPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  if (post.status === 'PUBLISHED') {
    return NextResponse.json({ error: 'No se puede editar un post ya publicado' }, { status: 400 })
  }

  const updated = await db.socialPost.update({
    where: { id },
    data: {
      ...(linkedinText !== undefined && { linkedinText }),
      ...(instagramText !== undefined && { instagramText }),
      ...(hashtags !== undefined && { hashtags }),
      ...(scheduledFor !== undefined && { scheduledFor: new Date(scheduledFor) }),
    },
    include: { blogPost: true },
  })

  return NextResponse.json({ data: { post: updated } })
}
