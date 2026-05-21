import { db } from '@/lib/db'

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'

const SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ')

// ─── OAuth ────────────────────────────────────────────────────────────────────

export function getLinkedInAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state: crypto.randomUUID(),
  })
  return `${LINKEDIN_AUTH_URL}?${params.toString()}`
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  })

  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LinkedIn token error: ${res.status} — ${text}`)
  }

  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

// ─── Guardar / cargar token ───────────────────────────────────────────────────

export async function saveLinkedInToken(accessToken: string): Promise<void> {
  await db.setting.upsert({
    where: { key: 'linkedin_access_token' },
    create: { key: 'linkedin_access_token', value: accessToken },
    update: { value: accessToken },
  })
}

export async function getLinkedInToken(): Promise<string | null> {
  const setting = await db.setting.findUnique({
    where: { key: 'linkedin_access_token' },
  })
  return setting?.value ?? null
}

export async function getLinkedInOrgId(): Promise<string | null> {
  // Primero buscar en settings (si fue configurado manualmente)
  const setting = await db.setting.findUnique({
    where: { key: 'linkedin_org_id' },
  })
  if (setting?.value) return setting.value
  // Fallback a variable de entorno
  return process.env.LINKEDIN_ORG_ID ?? null
}

// ─── Publicación ──────────────────────────────────────────────────────────────

/**
 * Publica un post de texto en la página de empresa de LinkedIn.
 * Retorna el URN del post creado.
 */
export async function publishToLinkedInCompanyPage(
  accessToken: string,
  orgId: string,
  text: string
): Promise<string> {
  const body = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  const res = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`LinkedIn publish error: ${res.status} — ${error}`)
  }

  // LinkedIn retorna el ID del post en el header 'x-restli-id'
  const postId = res.headers.get('x-restli-id') ?? `urn:li:ugcPost:${Date.now()}`
  return postId
}

// ─── Estado de conexión ───────────────────────────────────────────────────────

export async function isLinkedInConnected(): Promise<boolean> {
  const token = await getLinkedInToken()
  return !!token
}
