import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ingeseam-content-agent.vercel.app'
const OWNER_EMAIL = 'gerencia.ingeseam@gmail.com'

export interface GeneratedPostSummary {
  id: string
  blogTitle: string
  angle: string
  format: string
  linkedinPreview: string
}

/**
 * Envía el email de notificación semanal del lunes.
 * Informa al propietario que los borradores de la semana están listos para revisar.
 */
export async function sendWeeklyReviewEmail(posts: GeneratedPostSummary[]): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY no configurado — omitiendo notificación')
    return
  }

  const postsHtml = posts
    .map(
      (p, i) => `
      <tr style="background:${i % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}">
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0">
          <strong style="color:#0F172A;font-size:13px">${p.blogTitle}</strong><br/>
          <span style="color:#64748B;font-size:12px">${p.format} · ${p.angle}</span><br/>
          <span style="color:#94A3B8;font-size:12px;font-style:italic">"${p.linkedinPreview.slice(0, 100)}…"</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #E2E8F0;text-align:center">
          <a href="${APP_URL}/posts/${p.id}"
             style="background:#1A8F8A;color:#FFFFFF;padding:6px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">
            Revisar
          </a>
        </td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:#1B3A6B;padding:24px 32px">
      <p style="margin:0;color:#FFFFFF;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.7">INGESEAM Content Agent</p>
      <h1 style="margin:8px 0 0;color:#FFFFFF;font-size:22px;font-weight:700">
        📋 ${posts.length} post${posts.length > 1 ? 's' : ''} listo${posts.length > 1 ? 's' : ''} para revisar
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#0F172A;font-size:15px;margin:0 0 8px">Buenos días,</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px">
        El agente generó el contenido de esta semana para LinkedIn e Instagram.
        Revisa, edita si lo deseas y aprueba para publicar según el calendario.
      </p>

      <!-- Posts table -->
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #E2E8F0">
        <thead>
          <tr style="background:#1B3A6B">
            <th style="padding:10px 16px;text-align:left;color:#FFFFFF;font-size:12px;font-weight:600">Post</th>
            <th style="padding:10px 16px;text-align:center;color:#FFFFFF;font-size:12px;font-weight:600;width:100px">Acción</th>
          </tr>
        </thead>
        <tbody>${postsHtml}</tbody>
      </table>

      <!-- CTA principal -->
      <div style="text-align:center;margin-top:28px">
        <a href="${APP_URL}/posts?status=DRAFT"
           style="background:#1B3A6B;color:#FFFFFF;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          Ver todos los borradores →
        </a>
      </div>

      <p style="color:#94A3B8;font-size:12px;text-align:center;margin-top:24px">
        Una vez aprobados, el agente los publicará en LinkedIn e Instagram<br/>
        según el calendario: Lunes · Miércoles · Viernes
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;padding:16px 32px;border-top:1px solid #E2E8F0">
      <p style="margin:0;color:#94A3B8;font-size:11px;text-align:center">
        INGESEAM Content Agent · Bogotá, Colombia ·
        <a href="${APP_URL}/settings" style="color:#1A8F8A;text-decoration:none">Configuración</a>
      </p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: 'INGESEAM Content Agent <onboarding@resend.dev>',
    to: OWNER_EMAIL,
    subject: `📋 ${posts.length} posts listos para revisar — Semana ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`,
    html,
  })

  console.log(`[email] Notificación enviada a ${OWNER_EMAIL} con ${posts.length} posts`)
}
