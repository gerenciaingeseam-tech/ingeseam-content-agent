import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { exchangeLinkedInCode, saveLinkedInToken } from '@/lib/linkedin'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    console.error('[linkedin/callback] Error OAuth:', error)
    return NextResponse.redirect(
      new URL('/settings?error=linkedin_auth_failed', request.url)
    )
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectUri = `${appUrl}/api/oauth/linkedin/callback`
    const { accessToken } = await exchangeLinkedInCode(code, redirectUri)
    await saveLinkedInToken(accessToken)

    return NextResponse.redirect(
      new URL('/settings?success=linkedin_connected', request.url)
    )
  } catch (err) {
    console.error('[linkedin/callback] Error intercambiando código:', err)
    return NextResponse.redirect(
      new URL('/settings?error=linkedin_token_failed', request.url)
    )
  }
}
