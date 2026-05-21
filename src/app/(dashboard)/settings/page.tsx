import { db } from '@/lib/db'
import { isLinkedInConnected } from '@/lib/linkedin'
import { isInstagramConnected } from '@/lib/instagram'
import { SettingsConnections } from '@/app/(dashboard)/settings/components/SettingsConnections'
import { SettingsBrandVoice } from '@/app/(dashboard)/settings/components/SettingsBrandVoice'
import { SettingsServiceMap } from '@/app/(dashboard)/settings/components/SettingsServiceMap'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [linkedinConnected, instagramConnected, serviceMapSetting, brandVoiceSetting] = await Promise.all([
    isLinkedInConnected(),
    isInstagramConnected(),
    db.setting.findUnique({ where: { key: 'service_map' } }),
    db.setting.findUnique({ where: { key: 'brand_voice' } }),
  ])

  const serviceMap = serviceMapSetting?.value
    ? JSON.parse(serviceMapSetting.value)
    : {}

  const brandVoice = brandVoiceSetting?.value ?? ''

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Configuración</h2>
        <p className="text-[#64748B] text-sm mt-1">
          Voz de marca, mapeo de servicios y conexiones con redes sociales
        </p>
      </div>

      <SettingsConnections
        linkedinConnected={linkedinConnected}
        instagramConnected={instagramConnected}
      />

      <SettingsBrandVoice initialValue={brandVoice} />

      <SettingsServiceMap initialMap={serviceMap} />
    </div>
  )
}
