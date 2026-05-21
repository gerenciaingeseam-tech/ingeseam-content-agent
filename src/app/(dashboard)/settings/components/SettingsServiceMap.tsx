'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Plus, Trash2, Loader2 } from 'lucide-react'

interface Entry { category: string; url: string }

const DEFAULTS: Entry[] = [
  { category: 'aguas-residuales', url: 'https://www.ingeseam.com/caracterizacion-vertimientos' },
  { category: 'iso-14001', url: 'https://www.ingeseam.com/iso-14001' },
  { category: 'residuos-peligrosos', url: 'https://www.ingeseam.com/residuos-peligrosos' },
  { category: 'permiso-ambiental', url: 'https://www.ingeseam.com/permisos-ambientales' },
]

export function SettingsServiceMap({ initialMap }: { initialMap: Record<string, string> }) {
  const initialEntries: Entry[] = Object.keys(initialMap).length
    ? Object.entries(initialMap).map(([category, url]) => ({ category, url: url as string }))
    : DEFAULTS

  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(i: number, field: keyof Entry, val: string) {
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }

  function remove(i: number) {
    setEntries((prev) => prev.filter((_, idx) => idx !== i))
  }

  function add() {
    setEntries((prev) => [...prev, { category: '', url: '' }])
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    const map = Object.fromEntries(entries.filter(e => e.category).map(e => [e.category, e.url]))
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'service_map', value: JSON.stringify(map) }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm space-y-4">
      <div>
        <h3 className="font-semibold text-[#0F172A] text-base">Mapeo Blogs → Servicios</h3>
        <p className="text-xs text-[#64748B] mt-1">
          Categoría de WordPress → URL del servicio en ingeseam.com. Usado al generar posts.
        </p>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#64748B] px-1">
          <span>Categoría WordPress</span>
          <span>URL del Servicio</span>
        </div>
        {entries.map((entry, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 items-center">
            <Input
              value={entry.category}
              onChange={(e) => update(i, 'category', e.target.value)}
              placeholder="ej: aguas-residuales"
              className="text-xs h-8 border-[#E2E8F0]"
            />
            <div className="flex gap-1">
              <Input
                value={entry.url}
                onChange={(e) => update(i, 'url', e.target.value)}
                placeholder="https://www.ingeseam.com/..."
                className="text-xs h-8 border-[#E2E8F0] flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[#DC2626] hover:bg-[#DC2626]/10"
                onClick={() => remove(i)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs border-[#E2E8F0] text-[#64748B]"
          onClick={add}
        >
          <Plus className="w-3 h-3" />
          Agregar fila
        </Button>
        <Button
          onClick={save}
          disabled={saving}
          size="sm"
          className="gap-2 text-white"
          style={{ backgroundColor: '#1B3A6B' }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar mapa
        </Button>
        {saved && <span className="text-xs text-[#16A34A]">✓ Guardado</span>}
      </div>
    </section>
  )
}
