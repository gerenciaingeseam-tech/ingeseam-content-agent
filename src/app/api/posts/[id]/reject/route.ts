import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const note = body.note ?? ''

  const post = await db.socialPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })

  const updated = await db.socialPost.update({
    where: { id },
    data: {
      status: 'REJECTED',
      ...(note && { generationNotes: note }),
    },
  })

  return NextResponse.json({ data: { post: updated } })
}
