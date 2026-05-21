import Anthropic from '@anthropic-ai/sdk'
import { LINKEDIN_SYSTEM_PROMPT, INSTAGRAM_SYSTEM_PROMPT } from '@/lib/prompts'
import type { BlogPost, GeneratedPostPair } from '@/types'

const MODEL = 'claude-3-5-sonnet-20241022'

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wÀ-ɏ]+/g) ?? []
  return [...new Set(matches)]
}

function separateHashtags(text: string): { body: string; hashtags: string[] } {
  const lines = text.split('\n')
  const hashtagLines: string[] = []
  const bodyLines: string[] = []

  for (const line of lines) {
    if (line.trim().startsWith('#') || (line.includes('#') && line.trim().split(' ').every(w => w.startsWith('#')))) {
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
 * Usa Claude claude-3-5-sonnet con prompts especializados para la voz de INGESEAM.
 */
export async function generatePostPair(blog: BlogPost): Promise<GeneratedPostPair> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const serviceUrl = blog.serviceUrl ?? 'https://www.ingeseam.com/servicios'

  const userMessage = `
Blog de INGESEAM para el que debes crear el post:

Título: "${blog.title}"
URL del blog: ${blog.url}
URL del servicio relacionado: ${serviceUrl}
Extracto: ${blog.excerpt}

Genera el post completo siguiendo exactamente las instrucciones del sistema. Incluye ambas URLs tal como aparecen arriba.
`.trim()

  // Generación paralela LinkedIn + Instagram
  const [linkedinResponse, instagramResponse] = await Promise.all([
    client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: LINKEDIN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
    client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: INSTAGRAM_SYSTEM_PROMPT,
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

  return {
    linkedinText,
    instagramText,
    hashtags,
  }
}
