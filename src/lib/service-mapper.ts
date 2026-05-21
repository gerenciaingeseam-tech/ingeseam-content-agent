import { db } from '@/lib/db'

/**
 * Mapeo por defecto: slug de categoría WordPress → URL del servicio en ingeseam.com
 * Se puede sobreescribir desde la pantalla de Configuración.
 */
const DEFAULT_SERVICE_MAP: Record<string, string> = {
  'aguas-residuales': 'https://www.ingeseam.com/caracterizacion-vertimientos',
  'vertimientos': 'https://www.ingeseam.com/caracterizacion-vertimientos',
  'iso-14001': 'https://www.ingeseam.com/iso-14001',
  'sistema-gestion-ambiental': 'https://www.ingeseam.com/iso-14001',
  'residuos-peligrosos': 'https://www.ingeseam.com/residuos-peligrosos',
  'respel': 'https://www.ingeseam.com/residuos-peligrosos',
  'permiso-ambiental': 'https://www.ingeseam.com/permisos-ambientales',
  'licencia-ambiental': 'https://www.ingeseam.com/licencia-ambiental',
  'monitoreo': 'https://www.ingeseam.com/monitoreo-ambiental',
  'ruido': 'https://www.ingeseam.com/ruido-ambiental',
  'aire': 'https://www.ingeseam.com/calidad-aire',
  'suelos': 'https://www.ingeseam.com/suelos',
  'flora': 'https://www.ingeseam.com/flora-fauna',
  'fauna': 'https://www.ingeseam.com/flora-fauna',
}

const FALLBACK_URL = 'https://www.ingeseam.com/servicios'

/**
 * Dado un array de categorías/tags del blog, retorna la URL del servicio más relevante.
 * Primero busca en la tabla settings (configuración del usuario),
 * luego en el mapa por defecto.
 */
export async function resolveServiceUrl(categories: string[]): Promise<string> {
  // Cargar mapa personalizado desde settings
  const setting = await db.setting.findUnique({ where: { key: 'service_map' } })
  let customMap: Record<string, string> = {}

  if (setting?.value) {
    try {
      customMap = JSON.parse(setting.value)
    } catch {
      // Si falla el parse, usar solo el mapa por defecto
    }
  }

  const combinedMap = { ...DEFAULT_SERVICE_MAP, ...customMap }

  for (const category of categories) {
    const normalized = category.toLowerCase()
    if (combinedMap[normalized]) {
      return combinedMap[normalized]
    }
    // Búsqueda parcial
    const match = Object.keys(combinedMap).find((key) =>
      normalized.includes(key) || key.includes(normalized)
    )
    if (match) return combinedMap[match]
  }

  return FALLBACK_URL
}
