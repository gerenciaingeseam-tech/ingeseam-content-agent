'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Props {
  linkedinConnected: boolean
  instagramConnected: boolean
}

function ConnectionsInner({ linkedinConnected, instagramConnected }: Props) {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-5">
      <h3 className="font-semibold text-[#0F172A] text-base">Conexiones con Redes Sociales</h3>

      {success === 'linkedin_connected' && (
        <div className="bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-md px-4 py-2 text-sm text-[#16A34A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          LinkedIn conectado correctamente
        </div>
      )}
      {error && (
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-md px-4 py-2 text-sm text-[#DC2626] flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Error al conectar: {error.replace(/_/g, ' ')}
        </div>
      )}

      {/* LinkedIn */}
      <div className="flex items-center justify-between py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0A66C2]/10 flex items-center justify-center">
            <span className="text-[#0A66C2] font-bold">in</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">LinkedIn</p>
            <p className="text-xs text-[#64748B]">Página de empresa INGESEAM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {linkedinConnected ? (
            <span className="flex items-center gap-1 text-xs text-[#16A34A] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#DC2626]">
              <XCircle className="w-3.5 h-3.5" />
              Desconectado
            </span>
          )}
          <Link href="/api/oauth/linkedin">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10"
            >
              <ExternalLink className="w-3 h-3" />
              {linkedinConnected ? 'Reconectar' : 'Conectar'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Instagram */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center"
            style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366)' }}
          >
            <span className="text-white font-bold text-xs">IG</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Instagram</p>
            <p className="text-xs text-[#64748B]">Cuenta business INGESEAM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {instagramConnected ? (
            <span className="flex items-center gap-1 text-xs text-[#16A34A] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#DC2626]">
              <XCircle className="w-3.5 h-3.5" />
              Desconectado
            </span>
          )}
          <Link href="/api/oauth/instagram">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1 border-[#E1306C] text-[#E1306C] hover:bg-[#E1306C]/10"
            >
              <ExternalLink className="w-3 h-3" />
              {instagramConnected ? 'Reconectar' : 'Conectar'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SettingsConnections(props: Props) {
  return (
    <Suspense fallback={<div className="h-40 bg-white border border-[#E2E8F0] rounded-lg animate-pulse" />}>
      <ConnectionsInner {...props} />
    </Suspense>
  )
}
