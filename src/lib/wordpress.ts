import { db } from '@/lib/db'
import type { WPPost } from '@/types'

const WP_BASE_URL = process.env.WORDPRESS_URL ?? 'https://www.ingeseam.com'

/**
 * Obtiene los posts publicados desde WordPress REST API.
 * No requiere autenticación — blogs públicos.
 */
export async function fetchWordPressBlogs(perPage = 20): Promise<WPPost[]> {
  const url = `${WP_BASE_URL}/wp-json/wp/v2/posts?per_page=${perPage}&status=publish&_embed=true&orderby=date&order=desc`

  const res = await fetch(url, {
    next: { revalidate: 0 }, // Sin cache — siempre fresco
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

/**
 * Extrae las categorías y tags del post embebido de WP.
 */
function extractTerms(post: WPPost): { categories: string[]; tags: string[] } {
  const terms = post._embedded?.['wp:term'] ?? []
  const categories: string[] = []
  const tags: string[] = []

  terms.forEach((termGroup) => {
    termGroup.forEach((term) => {
      // taxonomy: 'category' o 'post_tag'
      if (term.slug && categories.length === 0 && termGroup[0]?.slug === term.slug) {
        // Primer grupo = categorías (heurística)
      }
      // Guardamos todos los slugs — el service mapper los usará
      if (!categories.includes(term.slug)) {
        categories.push(term.slug)
      }
    })
  })

  return { categories, tags }
}

/**
 * Limpia HTML de excerpts y contenido para almacenar texto plano.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Sincroniza los blogs de WordPress a la base de datos.
 * Hace upsert usando wpId como clave única.
 */
export async function syncBlogsToDatabase(posts: WPPost[]): Promise<{
  synced: number
  created: number
  updated: number
}> {
  let created = 0
  let updated = 0

  for (const post of posts) {
    const { categories, tags } = extractTerms(post)
    const featuredImage =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null

    const excerpt = stripHtml(post.excerpt?.rendered ?? '')
    const content = stripHtml(post.content?.rendered ?? '')

    const existing = await db.blogPost.findUnique({
      where: { wpId: post.id },
    })

    const data = {
      wpId: post.id,
      title: post.title.rendered,
      url: post.link,
      excerpt: excerpt.slice(0, 500), // máx 500 chars del excerpt
      content: content.slice(0, 5000), // máx 5000 chars del contenido
      categories,
      tags,
      featuredImage,
      wpPublishedAt: new Date(post.date),
      syncedAt: new Date(),
    }

    if (existing) {
      await db.blogPost.update({ where: { wpId: post.id }, data })
      updated++
    } else {
      await db.blogPost.create({ data })
      created++
    }
  }

  return { synced: posts.length, created, updated }
}
