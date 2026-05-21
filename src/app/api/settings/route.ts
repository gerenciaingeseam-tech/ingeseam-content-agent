import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key) {
    const setting = await db.setting.findUnique({ where: { key } })
    return NextResponse.json({ data: { setting } })
  }

  const settings = await db.setting.findMany()
  // Ocultar tokens sensibles
  const safe = settings.map((s) => ({
    ...s,
    value: s.key.includes('token') || s.key.includes('secret')
      ? '••••••••'
      : s.value,
  }))
  return NextResponse.json({ data: { settings: safe } })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { key, value } = body

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key y value son requeridos' }, { status: 400 })
  }

  const setting = await db.setting.upsert({
    where: { key },
    create: { key, value: String(value) },
    update: { value: String(value) },
  })

  return NextResponse.json({ data: { setting } })
}
