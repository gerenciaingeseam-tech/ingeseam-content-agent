'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  postId: string
  currentImage: string | null
  onImageChange: (url: string | null) => void
}

export function ImageUploader({ postId, currentImage, onImageChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('postId', postId)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al subir imagen')
      } else {
        onImageChange(json.data.url)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    onImageChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#0F172A]">Imagen del post</p>

      {currentImage ? (
        <div className="relative group rounded-lg overflow-hidden border border-[#E2E8F0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Imagen del post"
            className="w-full h-36 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-xs h-7 gap-1"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-3 h-3" />
              Cambiar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-[#DC2626] text-xs h-7 gap-1"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center cursor-pointer hover:border-[#1A8F8A] hover:bg-[#1A8F8A]/5 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#1A8F8A] animate-spin" />
              <p className="text-xs text-[#64748B]">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#64748B] opacity-50" />
              <p className="text-xs text-[#64748B]">
                Arrastra una imagen o <span className="text-[#1A8F8A] font-medium">haz clic aquí</span>
              </p>
              <p className="text-xs text-[#94A3B8]">JPG, PNG, WebP — máx 5MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-[#DC2626]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
