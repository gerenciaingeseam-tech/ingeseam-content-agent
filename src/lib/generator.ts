import Anthropic from '@anthropic-ai/sdk'
import {
  buildLinkedInPrompt,
  buildInstagramPrompt,
  type PostFormat,
  type PostAngle,
} from '@/lib/prompts'
import type { BlogPost, GeneratedPostPair } from '@/types'

const MODEL = 'claude-opus-4-5'

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wÀ-ɏ]+/g) ?? []
  return [...new Set(matches)]
}

function separateHashtags(text: string): { body: string; hashtags: string[] } {
  const lines = text.split('\n')
  const hashtagLines: string[] = []
  const bodyLines: string[] = []

  for (const line of lines) {
    const words = line.trim().split(/\s+/)
    const allHashtags = words.every((w) => w.startsWith('#') || w === '')
    if (allHashtags && line.trim().length > 0) {
      hashtagLines.push(line)
    } else {
      bodyLines.push(line)
    }
  }

  const hashtags = extractHashtags(hashtagLines.join(' '))
  const body = bodyLines.join('\n').trim()
  return { body, hashtags }
}

/**
 * Genera un par de posts (LinkedIn + Instagram) para un blog dado.
 * Permite especificar formato (corto/largo) y ángulo temático.
 */
export async function generatePostPair(
  blog: BlogPost,
  format: PostFormat = 'SHORT',
  angle: PostAngle = 'ERROR_COMUN'
): Promise<GeneratedPostPair> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const serviceUrl = blog.serviceUrl ?? 'https://www.ingeseam.com/servicios'

  const userMessage = `
Blog de INGESEAM para el que debes crear el post:

Título: "${blog.title}"
URL del blog: ${blog.url}
URL del servicio relacionado: ${serviceUrl}
Extracto del contenido:
${blog.excerpt}

Instrucciones:
- Genera el post siguiendo EXACTAMENTE la estructura del sistema.
- Incluye las dos URLs tal como aparecen arriba (sin modificar, sin acortar).
- El ángulo es: ${angle} — aplica ese enfoque en el hook y desarrollo.
- La longitud debe cumplir el rango indicado para el formato seleccionado.
`.trim()

  // Generación paralela LinkedIn + Instagram
  const [linkedinResponse, instagramResponse] = await Promise.all([
    client.messages.create({
      model: MODEL,
      max_tokens: format === 'LONG' ? 1000 : 600,
      system: buildLinkedInPrompt(format, angle),
      messages: [{ role: 'user', content: userMessage }],
    }),
    client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: buildInstagramPrompt(angle),
      messages: [{ role: 'user', content: userMessage }],
    }),
  ])

  const linkedinText =
    linkedinResponse.content[0].type === 'text'
      ? linkedinResponse.content[0].text.trim()
      : ''

  const instagramRaw =
    instagramResponse.content[0].type === 'text'
      ? instagramResponse.content[0].text.trim()
      : ''

  const { body: instagramText, hashtags } = separateHashtags(instagramRaw)

  return { linkedinText, instagramText, hashtags }
}
