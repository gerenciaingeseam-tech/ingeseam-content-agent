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
 * Obtiene el ID del perfil personal del usuario autenticado.
 */
async function getLinkedInPersonId(accessToken: string): Promise<string> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`LinkedIn userinfo error: ${res.status}`)
  const data = await res.json()
  return data.sub as string
}

/**
 * Sube una imagen desde URL a LinkedIn y retorna el asset URN.
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  authorUrn: string,
  imageUrl: string
): Promise<string | null> {
  try {
    // 1. Registrar el upload
    const registerRes = await fetch(
      `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorUrn,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            }],
          },
        }),
      }
    )
    if (!registerRes.ok) return null
    const registerData = await registerRes.json()
    const uploadUrl = registerData.value?.uploadMechanism?.[
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
    ]?.uploadUrl
    const assetUrn = registerData.value?.asset

    if (!uploadUrl || !assetUrn) return null

    // 2. Descargar imagen desde WordPress
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const imgBuffer = await imgRes.arrayBuffer()

    // 3. Subir imagen a LinkedIn
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
      },
      body: imgBuffer,
    })
    if (!uploadRes.ok) return null

    return assetUrn as string
  } catch {
    return null
  }
}

/**
 * Publica un post en LinkedIn.
 * Si hay blogUrl, usa tipo ARTICLE para que LinkedIn scrapee la imagen automáticamente.
 */
export async function publishToLinkedInCompanyPage(
  accessToken: string,
  orgId: string,
  text: string,
  imageUrl?: string | null,
  blogUrl?: string | null
): Promise<string> {
  const personId = await getLinkedInPersonId(accessToken)
  const authorUrn = `urn:li:person:${personId}`

  // Con blogUrl → ARTICLE (LinkedIn scrapea og:image del blog automáticamente)
  // Sin blogUrl → NONE (solo texto)
  const shareContent = blogUrl
    ? {
        shareCommentary: { text },
        shareMediaCategory: 'ARTICLE',
        media: [{
          status: 'READY',
          originalUrl: blogUrl,
        }],
      }
    : {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      }

  const body = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': shareContent,
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

  const postId = res.headers.get('x-restli-id') ?? `urn:li:ugcPost:${Date.now()}`
  return postId
}

// ─── Estado de conexión ───────────────────────────────────────────────────────

export async function isLinkedInConnected(): Promise<boolean> {
  const token = await getLinkedInToken()
  return !!token
}
