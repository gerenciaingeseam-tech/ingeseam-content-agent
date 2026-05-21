'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react'
import type { PostStatus } from '@/types'

interface ApproveRejectBarProps {
  postId: string
  status: PostStatus
  onStatusChange?: (status: PostStatus) => void
}

export function ApproveRejectBar({ postId, status, onStatusChange }: ApproveRejectBarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | 'publish' | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  async function callApi(action: 'approve' | 'reject' | 'publish', body?: object) {
    setLoading(action)
    setMessage(null)
    try {
      const res = await fetch(`/api/posts/${postId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage({ text: json.error ?? 'Error desconocido', ok: false })
      } else {
        const newStatus: PostStatus =
          action === 'approve' ? 'APPROVED' :
          action === 'reject' ? 'REJECTED' : 'PUBLISHED'
        setMessage({
          text: action === 'approve' ? '✓ Post aprobado' :
                action === 'reject' ? '✓ Post rechazado' : '✓ Publicado en LinkedIn e Instagram',
          ok: true,
        })
        onStatusChange?.(newStatus)
        router.refresh()
      }
    } catch {
      setMessage({ text: 'Error de conexión', ok: false })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-[#E2E8F0] shadow-md z-20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
        {/* Estado actual */}
        <div className="flex-1">
          {message && (
            <p className={`text-sm font-medium ${message.ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {message.text}
            </p>
          )}
        </div>

        {/* Botón Rechazar */}
        {(status === 'DRAFT' || status === 'APPROVED') && (
          <AlertDialog>
            <AlertDialogTrigger
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors disabled:opacity-50"
              disabled={loading !== null}
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Rechazar este borrador?</AlertDialogTitle>
                <AlertDialogDescription>
                  El post quedará marcado como Rechazado. Puedes agregar una nota opcional.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Nota opcional (ej: revisar tono, cambiar CTA...)"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="mt-2 text-sm"
                rows={3}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                  onClick={() => callApi('reject', { note: rejectNote })}
                >
                  Sí, rechazar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Botón Aprobar */}
        {status === 'DRAFT' && (
          <Button
            className="gap-2 text-white"
            style={{ backgroundColor: '#1A8F8A' }}
            onClick={() => callApi('approve')}
            disabled={loading !== null}
          >
            {loading === 'approve' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Aprobar
          </Button>
        )}

        {/* Botón Publicar */}
        {status === 'APPROVED' && (
          <Button
            className="gap-2 bg-[#1B3A6B] hover:bg-[#152d54] text-white"
            onClick={() => callApi('publish')}
            disabled={loading !== null}
          >
            {loading === 'publish' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publicar ahora
          </Button>
        )}

        {status === 'PUBLISHED' && (
          <span className="text-sm font-medium text-[#16A34A] flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Publicado en LinkedIn e Instagram
          </span>
        )}

        {status === 'REJECTED' && (
          <span className="text-sm text-[#DC2626]">Post rechazado</span>
        )}
      </div>
    </div>
  )
}
