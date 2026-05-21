import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { fetchWordPressBlogs, syncBlogsToDatabase } from '@/lib/wordpress'

export async function POST() {
  // Verificar autenticación
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const wpPosts = await fetchWordPressBlogs(20)
    const result = await syncBlogsToDatabase(wpPosts)

    return NextResponse.json({
      data: {
        message: `Sincronización completada`,
        synced: result.synced,
        created: result.created,
        updated: result.updated,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[blogs/sync] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
