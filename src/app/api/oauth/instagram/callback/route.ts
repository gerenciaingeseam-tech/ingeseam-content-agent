import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {
  exchangeInstagramCode,
  getPageId,
  getPageAccessToken,
  getInstagramUserId,
  saveInstagramToken,
} from '@/lib/instagram'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/settings?error=instagram_auth_failed', request.url)
    )
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/api/oauth/instagram/callback`

    // 1. Obtener user access token
    const { accessToken: userToken } = await exchangeInstagramCode(code, redirectUri)

    // 2. Obtener página de Facebook
    const pageId = await getPageId(userToken)

    // 3. Obtener page access token (long-lived)
    const pageToken = await getPageAccessToken(userToken, pageId)

    // 4. Obtener IG User ID conectado a esa página
    const igUserId = await getInstagramUserId(pageToken, pageId)

    // 5. Guardar en DB
    await saveInstagramToken(pageToken, igUserId)

    return NextResponse.redirect(
      new URL('/settings?success=instagram_connected', request.url)
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[instagram/callback] Error:', msg)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(msg)}`, request.url)
    )
  }
}
