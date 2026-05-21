'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'

interface GeneratePostButtonProps {
  blogPostId: string
  disabled?: boolean
}

export function GeneratePostButton({ blogPostId, disabled }: GeneratePostButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogPostId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error generando post')
      } else {
        setDone(true)
        router.refresh()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs text-[#16A34A] font-medium">
        <CheckCircle2 className="w-3 h-3" />
        Borrador creado
      </span>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        className="text-xs h-7 px-3 text-white"
        style={{ backgroundColor: disabled ? '#94A3B8' : '#1A8F8A' }}
        disabled={disabled || loading}
        onClick={handleGenerate}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3 mr-1" />
        )}
        {loading ? 'Generando...' : disabled ? 'Ya publicado' : 'Generar post'}
      </Button>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
}
