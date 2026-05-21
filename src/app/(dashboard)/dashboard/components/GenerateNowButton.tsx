'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

export function GenerateNowButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/cron/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}`,
        },
      })
      const json = await res.json()

      if (!res.ok) {
        setMessage(`Error: ${json.error ?? 'No se pudo generar'}`)
      } else {
        setMessage(`✓ ${json.data?.generated ?? 0} borradores generados`)
        router.refresh()
      }
    } catch {
      setMessage('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        variant="outline"
        className="gap-2 border-[#1A8F8A] text-[#1A8F8A] hover:bg-[#1A8F8A]/10"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'Generando...' : 'Generar ahora'}
      </Button>
      {message && (
        <p className="text-xs text-[#64748B]">{message}</p>
      )}
    </div>
  )
}
