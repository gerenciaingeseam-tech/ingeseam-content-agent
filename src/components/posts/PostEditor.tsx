'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { LinkedInPreview } from '@/components/posts/LinkedInPreview'
import { InstagramPreview } from '@/components/posts/InstagramPreview'
import { ApproveRejectBar } from '@/components/posts/ApproveRejectBar'
import { StatusBadge } from '@/components/posts/StatusBadge'
import { ImageUploader } from '@/components/posts/ImageUploader'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Save, RefreshCw } from 'lucide-react'
import type { SocialPostWithBlog, PostStatus } from '@/types'
import Link from 'next/link'

interface PostEditorProps {
  post: SocialPostWithBlog
}

const MAX_LINKEDIN = 3000
const MAX_INSTAGRAM = 2200

export function PostEditor({ post }: PostEditorProps) {
  const [linkedinText, setLinkedinText] = useState(post.linkedinText)
  const [instagramText, setInstagramText] = useState(post.instagramText)
  const [hashtags] = useState(post.hashtags)
  const [status, setStatus] = useState<PostStatus>(post.status)
  // customImageUrl sobreescribe la imagen del blog al publicar
  const [customImage, setCustomImage] = useState<string | null>(
    (post as typeof post & { customImageUrl?: string | null }).customImageUrl ?? null
  )
  const activeImage = customImage ?? post.blogPost.featuredImage
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEditable = status === 'DRAFT' || status === 'APPROVED'

  const autoSave = useCallback(
    async (linkedin: string, instagram: string) => {
      if (!isEditable) return
      setSaving(true)
      try {
        await fetch(`/api/posts/${post.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkedinText: linkedin, instagramText: instagram }),
        })
        setSavedAt(new Date())
      } finally {
        setSaving(false)
      }
    },
    [post.id, isEditable]
  )

  // Debounce auto-save — 1.5 segundos después del último cambio
  useEffect(() => {
    if (!isEditable) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      autoSave(linkedinText, instagramText)
    }, 1500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [linkedinText, instagramText, autoSave, isEditable])

  return (
    <div className="pb-20">
      {/* Header del editor */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={status} />
            {saving && (
              <span className="text-xs text-[#64748B] flex items-center gap-1">
                <Save className="w-3 h-3 animate-pulse" />
                Guardando...
              </span>
            )}
            {savedAt && !saving && (
              <span className="text-xs text-[#16A34A]">
                ✓ Guardado
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] leading-snug truncate">
            {post.blogPost.title}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <Link
              href={post.blogUrl}
              target="_blank"
              className="text-xs text-[#1A8F8A] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Ver blog
            </Link>
            {post.serviceUrl && (
              <Link
                href={post.serviceUrl}
                target="_blank"
                className="text-xs text-[#64748B] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver servicio
              </Link>
            )}
          </div>
        </div>

        <Link
          href="/posts"
          className="text-xs text-[#64748B] hover:text-[#1B3A6B] flex items-center gap-1 ml-4"
        >
          <RefreshCw className="w-3 h-3" />
          Volver a posts
        </Link>
      </div>

      {/* Imagen compartida LinkedIn + Instagram */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            <span className="text-[#0A66C2] font-bold text-xs bg-[#0A66C2]/10 px-1.5 py-0.5 rounded">in</span>
            <span className="text-[#E1306C] font-bold text-xs bg-[#E1306C]/10 px-1.5 py-0.5 rounded">IG</span>
          </div>
          <p className="text-sm font-medium text-[#0F172A]">Imagen del post</p>
          <p className="text-xs text-[#64748B]">— se usa en LinkedIn y en Instagram</p>
        </div>
        <ImageUploader
          postId={post.id}
          currentImage={activeImage}
          onImageChange={setCustomImage}
        />
      </div>

      {/* Editor split view */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── LinkedIn ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#0A66C2]/10 flex items-center justify-center">
                <span className="text-[#0A66C2] font-bold text-xs">in</span>
              </div>
              <h3 className="font-semibold text-sm text-[#0F172A]">LinkedIn</h3>
            </div>
            <span className={`text-xs ${linkedinText.length > MAX_LINKEDIN ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
              {linkedinText.length} / {MAX_LINKEDIN}
            </span>
          </div>

          {isEditable ? (
            <Textarea
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              className="min-h-[140px] text-sm font-mono border-[#E2E8F0] focus-visible:ring-[#0A66C2] resize-none"
              placeholder="Texto del post de LinkedIn..."
            />
          ) : (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3 text-sm text-[#64748B] min-h-[80px]">
              <p className="text-xs mb-1 text-[#94A3B8]">Solo lectura — estado: {status}</p>
              <p className="whitespace-pre-wrap">{linkedinText.slice(0, 120)}…</p>
            </div>
          )}

          <LinkedInPreview text={linkedinText} />
        </div>

        {/* ── Instagram ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#E1306C]/10 flex items-center justify-center">
                <span className="text-[#E1306C] font-bold text-xs">IG</span>
              </div>
              <h3 className="font-semibold text-sm text-[#0F172A]">Instagram</h3>
            </div>
            <span className={`text-xs ${instagramText.length > MAX_INSTAGRAM ? 'text-[#DC2626]' : 'text-[#64748B]'}`}>
              {instagramText.length} / {MAX_INSTAGRAM}
            </span>
          </div>

          {isEditable ? (
            <Textarea
              value={instagramText}
              onChange={(e) => setInstagramText(e.target.value)}
              className="min-h-[140px] text-sm font-mono border-[#E2E8F0] focus-visible:ring-[#E1306C] resize-none"
              placeholder="Caption de Instagram..."
            />
          ) : (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-3 text-sm text-[#64748B] min-h-[80px]">
              <p className="text-xs mb-1 text-[#94A3B8]">Solo lectura — estado: {status}</p>
              <p className="whitespace-pre-wrap">{instagramText.slice(0, 120)}…</p>
            </div>
          )}

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs text-[#0095F6] bg-[#0095F6]/10 border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <InstagramPreview
            text={instagramText}
            hashtags={hashtags}
            featuredImage={activeImage}
          />
        </div>
      </div>

      {/* Barra de acciones fija */}
      <ApproveRejectBar
        postId={post.id}
        status={status}
        onStatusChange={setStatus}
      />
    </div>
  )
}
