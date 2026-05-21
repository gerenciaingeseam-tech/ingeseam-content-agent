import type { BlogPost, SocialPost, Setting, PublishLog, PostStatus, Platform } from '@prisma/client'

// Re-exportar tipos de Prisma para uso en la app
export type { BlogPost, SocialPost, Setting, PublishLog, PostStatus, Platform }

// Tipo con relaciones incluidas
export type SocialPostWithBlog = SocialPost & {
  blogPost: BlogPost
}

export type SocialPostWithLogs = SocialPost & {
  blogPost: BlogPost
  publishLog: PublishLog[]
}

// Respuesta generada por Claude
export interface GeneratedPostPair {
  linkedinText: string
  instagramText: string
  hashtags: string[]
}

// Configuración de la app
export interface AppSettings {
  brandVoice: string
  baseHashtags: string[]
  companyName: string
  targetRegion: string
  serviceMap: ServiceMapEntry[]
  linkedinAccessToken?: string
  linkedinOrgId?: string
  instagramAccessToken?: string
  instagramUserId?: string
}

export interface ServiceMapEntry {
  category: string
  serviceUrl: string
}

// Respuesta de WordPress REST API
export interface WPPost {
  id: number
  title: { rendered: string }
  link: string
  excerpt: { rendered: string }
  content: { rendered: string }
  date: string
  categories: number[]
  tags: number[]
  _embedded?: {
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>
    'wp:featuredmedia'?: Array<{ source_url: string }>
  }
}

// Respuesta de API consistente
export type ApiSuccess<T> = { data: T }
export type ApiError = { error: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
