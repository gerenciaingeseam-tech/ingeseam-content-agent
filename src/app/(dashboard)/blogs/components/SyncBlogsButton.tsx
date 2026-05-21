'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2 } from 'lucide-react'

export function SyncBlogsButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/blogs/sync', { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        setResult(`Error: ${json.error}`)
      } else {
        const { synced, created, updated } = json.data
        setResult(`✓ ${synced} blogs · ${created} nuevos · ${updated} actualizados`)
        router.refresh()
      }
    } catch {
      setResult('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleSync}
        disabled={loading}
        className="gap-2 text-white"
        style={{ backgroundColor: '#1B3A6B' }}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Sincronizando...' : 'Sincronizar Blogs'}
      </Button>

      {result && (
        <p className="text-xs flex items-center gap-1 text-[#16A34A]">
          <CheckCircle2 className="w-3 h-3" />
          {result}
        </p>
      )}
    </div>
  )
}
