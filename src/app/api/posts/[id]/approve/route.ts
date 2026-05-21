import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const post = await db.socialPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  if (post.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Solo se pueden aprobar borradores' }, { status: 400 })
  }

  const updated = await db.socialPost.update({
    where: { id },
    data: { status: 'APPROVED' },
  })

  return NextResponse.json({ data: { post: updated } })
}
