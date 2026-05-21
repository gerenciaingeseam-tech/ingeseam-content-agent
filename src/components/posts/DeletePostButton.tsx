'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Trash2, Loader2 } from 'lucide-react'

interface DeletePostButtonProps {
  postId: string
  compact?: boolean
}

export function DeletePostButton({ postId, compact = false }: DeletePostButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={`inline-flex items-center gap-1 text-xs font-medium text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors rounded-md px-2 py-1.5 ${compact ? '' : 'border border-[#DC2626]/30'}`}
        disabled={loading}
      >
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <Trash2 className="w-3 h-3" />
        }
        {!compact && 'Eliminar'}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este post?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El borrador será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            onClick={handleDelete}
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
