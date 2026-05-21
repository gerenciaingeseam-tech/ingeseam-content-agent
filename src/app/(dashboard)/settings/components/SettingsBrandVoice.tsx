'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'

export function SettingsBrandVoice({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(
    initialValue ||
      'Consultoría ambiental formal y técnica. Audiencia: gerentes e ingenieros colombianos. Normativa: IDEAM, ANLA, Decreto 1076.'
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'brand_voice', value }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-[#0F172A] text-base">Voz de Marca</h3>
      <p className="text-xs text-[#64748B]">
        Contexto que Claude usa al generar cada post. Describe el tono, audiencia y normativa relevante.
      </p>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="text-sm border-[#E2E8F0] focus-visible:ring-[#1A8F8A]"
      />
      <div className="flex items-center gap-3">
        <Button
          onClick={save}
          disabled={saving}
          size="sm"
          className="gap-2 text-white"
          style={{ backgroundColor: '#1B3A6B' }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar
        </Button>
        {saved && <span className="text-xs text-[#16A34A]">✓ Guardado</span>}
      </div>
    </section>
  )
}
