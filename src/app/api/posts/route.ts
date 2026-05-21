import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import type { PostStatus } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as PostStatus | null

  const posts = await db.socialPost.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { blogPost: true },
  })

  return NextResponse.json({ data: { posts } })
}
