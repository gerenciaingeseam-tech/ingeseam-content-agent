'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, CheckCircle2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ANGLE_LABELS, FORMAT_LABELS, type PostAngle, type PostFormat } from '@/lib/prompts'

interface GeneratePostButtonProps {
  blogPostId: string
  disabled?: boolean
}

const ANGLES = Object.entries(ANGLE_LABELS) as [PostAngle, string][]
const FORMATS = Object.entries(FORMAT_LABELS) as [PostFormat, string][]

export function GeneratePostButton({ blogPostId, disabled }: GeneratePostButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [format, setFormat] = useState<PostFormat>('SHORT')
  const [angle, setAngle] = useState<PostAngle>('ERROR_COMUN')
  const [open, setOpen] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setDone(false)
    setOpen(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogPostId, format, angle }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error generando post')
      } else {
        setDone(true)
        setTimeout(() => setDone(false), 4000)
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
      <div className="flex items-center gap-1">
        {/* Botón principal */}
        <Button
          type="button"
          size="sm"
          className="text-xs h-7 px-3 text-white rounded-r-none"
          style={{ backgroundColor: disabled ? '#94A3B8' : '#1A8F8A' }}
          disabled={disabled || loading}
          onClick={handleGenerate}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          {loading ? 'Generando...' : 'Generar post'}
        </Button>

        {/* Dropdown de opciones */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              className="text-xs h-7 px-1.5 text-white rounded-l-none border-l border-[#178a85]"
              style={{ backgroundColor: '#1A8F8A' }}
              disabled={disabled || loading}
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-3 space-y-3">
            {/* Formato */}
            <div>
              <DropdownMenuLabel className="text-xs font-semibold text-[#0F172A] px-0 pb-1">
                Formato
              </DropdownMenuLabel>
              <div className="space-y-1">
                {FORMATS.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                      format === key
                        ? 'bg-[#1A8F8A]/10 text-[#1A8F8A] font-medium'
                        : 'hover:bg-[#F8FAFC] text-[#64748B]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Ángulo */}
            <div>
              <DropdownMenuLabel className="text-xs font-semibold text-[#0F172A] px-0 pb-1">
                Ángulo temático
              </DropdownMenuLabel>
              <div className="space-y-1">
                {ANGLES.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setAngle(key)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                      angle === key
                        ? 'bg-[#1B3A6B]/10 text-[#1B3A6B] font-medium'
                        : 'hover:bg-[#F8FAFC] text-[#64748B]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            <Button
              className="w-full text-xs h-7 text-white gap-1"
              style={{ backgroundColor: '#1A8F8A' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              <Sparkles className="w-3 h-3" />
              Generar con estas opciones
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && <p className="text-xs text-[#DC2626]">{error}</p>}

      {/* Resumen de configuración actual */}
      <p className="text-xs text-[#94A3B8]">
        {FORMAT_LABELS[format].split(' ')[0]} · {ANGLE_LABELS[angle]}
      </p>
    </div>
  )
}
