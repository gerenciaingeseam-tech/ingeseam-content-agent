import { db } from '@/lib/db'

const META_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth'
const META_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token'
const GRAPH_BASE = 'https://graph.facebook.com/v19.0'

// Imagen fallback pública si el blog no tiene imagen destacada
const FALLBACK_IMAGE_URL = 'https://www.ingeseam.com/wp-content/uploads/ingeseam-og.jpg'

const SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_read_engagement',
  'pages_show_list',
].join(',')

// ─── OAuth ────────────────────────────────────────────────────────────────────

export function getInstagramAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: 'code',
    state: crypto.randomUUID(),
  })
  return `${META_AUTH_URL}?${params.toString()}`
}

export async function exchangeInstagramCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string }> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  })

  const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Meta token error: ${res.status} — ${text}`)
  }

  const data = await res.json()
  return { accessToken: data.access_token }
}

// ─── Guardar / cargar token ───────────────────────────────────────────────────

export async function saveInstagramToken(
  accessToken: string,
  igUserId: string
): Promise<void> {
  await Promise.all([
    db.setting.upsert({
      where: { key: 'instagram_access_token' },
      create: { key: 'instagram_access_token', value: accessToken },
      update: { value: accessToken },
    }),
    db.setting.upsert({
      where: { key: 'instagram_user_id' },
      create: { key: 'instagram_user_id', value: igUserId },
      update: { value: igUserId },
    }),
  ])
}

export async function getInstagramCredentials(): Promise<{
  accessToken: string | null
  igUserId: string | null
}> {
  const [tokenSetting, userIdSetting] = await Promise.all([
    db.setting.findUnique({ where: { key: 'instagram_access_token' } }),
    db.setting.findUnique({ where: { key: 'instagram_user_id' } }),
  ])
  return {
    accessToken: tokenSetting?.value ?? null,
    igUserId: userIdSetting?.value ?? null,
  }
}

// ─── Obtener IG User ID desde Page Access Token ───────────────────────────────

export async function getInstagramUserId(
  pageAccessToken: string,
  pageId: string
): Promise<string> {
  const res = await fetch(
    `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
  )
  const data = await res.json()
  if (!data.instagram_business_account?.id) {
    throw new Error('No se encontró cuenta de Instagram Business conectada a esta página de Facebook')
  }
  return data.instagram_business_account.id
}

export async function getPageId(userAccessToken: string): Promise<string> {
  const res = await fetch(
    `${GRAPH_BASE}/me/accounts?access_token=${userAccessToken}`
  )
  const data = await res.json()
  if (!data.data?.[0]?.id) {
    throw new Error('No se encontró página de Facebook. Asegúrate de tener una página administrada.')
  }
  return data.data[0].id
}

export async function getPageAccessToken(
  userAccessToken: string,
  pageId: string
): Promise<string> {
  const res = await fetch(
    `${GRAPH_BASE}/${pageId}?fields=access_token&access_token=${userAccessToken}`
  )
  const data = await res.json()
  return data.access_token ?? userAccessToken
}

// ─── Publicación en 2 pasos ───────────────────────────────────────────────────

/**
 * Publica un post en Instagram Business Account.
 * Requiere una imagen pública (featuredImage del blog o fallback).
 * Proceso en 2 pasos: crear container → publicar container.
 */
export async function publishToInstagramBusiness(
  accessToken: string,
  igUserId: string,
  caption: string,
  imageUrl?: string | null
): Promise<string> {
  const finalImageUrl = imageUrl || FALLBACK_IMAGE_URL

  // Paso 1: Crear media container
  const createRes = await fetch(
    `${GRAPH_BASE}/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: finalImageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  )

  if (!createRes.ok) {
    const error = await createRes.text()
    throw new Error(`Instagram create container error: ${createRes.status} — ${error}`)
  }

  const { id: creationId } = await createRes.json()

  // Paso 2: Publicar container
  const publishRes = await fetch(
    `${GRAPH_BASE}/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    }
  )

  if (!publishRes.ok) {
    const error = await publishRes.text()
    throw new Error(`Instagram publish error: ${publishRes.status} — ${error}`)
  }

  const { id: postId } = await publishRes.json()
  return postId
}

// ─── Estado de conexión ───────────────────────────────────────────────────────

export async function isInstagramConnected(): Promise<boolean> {
  const { accessToken, igUserId } = await getInstagramCredentials()
  return !!(accessToken && igUserId)
}
