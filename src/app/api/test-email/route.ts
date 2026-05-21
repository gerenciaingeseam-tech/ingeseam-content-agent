import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sendWeeklyReviewEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await sendWeeklyReviewEmail([
      {
        id: 'test-id-1',
        blogTitle: 'Permiso de vertimientos en Colombia',
        angle: 'ERROR_COMUN',
        format: 'SHORT',
        linkedinText: 'La mayoría de empresas cometen este error con sus vertimientos. La Resolución 0631 establece parámetros específicos...',
      },
      {
        id: 'test-id-2',
        blogTitle: 'Caracterización de aguas residuales industriales',
        angle: 'TIP_TECNICO',
        format: 'LONG',
        linkedinText: '3 parámetros que las empresas suelen omitir en su caracterización de vertimientos...',
      },
      {
        id: 'test-id-3',
        blogTitle: 'ISO 14001: requisitos para empresas colombianas',
        angle: 'DATO_IMPACTANTE',
        format: 'SHORT',
        linkedinText: 'El 60% de las sanciones ambientales en Colombia se originan en errores documentales...',
      },
    ])

    return NextResponse.json({ data: { sent: true, to: 'gerencia.ingeseam@gmail.com' } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
