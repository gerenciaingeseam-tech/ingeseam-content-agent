# INGESEAM Content Agent

Herramienta interna para generar, revisar y publicar contenido en LinkedIn e Instagram
para INGESEAM (consultoría ambiental, Bogotá, Colombia). 3 posts/semana semi-automatizados.

## Commands

- `npm run dev` — Servidor de desarrollo en localhost:3000
- `npm run build` — Build de producción
- `npm run lint` — Linting con ESLint
- `npx prisma db push` — Push del schema a Supabase
- `npx prisma generate` — Regenerar cliente Prisma tipado
- `npx prisma studio` — UI visual para explorar la base de datos

## Tech Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Supabase (PostgreSQL)
+ Prisma + Supabase Auth + Claude API (claude-3-5-sonnet) + LinkedIn API v2
+ Instagram Graph API + Vercel Cron Jobs

## Architecture

### Directory Structure
- `src/app/(dashboard)/` — Rutas protegidas del dashboard (posts, blogs, calendar, settings)
- `src/app/api/` — API routes: blogs, posts, generate, oauth, cron
- `src/components/posts/` — PostEditor, LinkedInPreview, InstagramPreview, ApproveRejectBar
- `src/components/layout/` — Sidebar (azul marino #1B3A6B) + Header
- `src/lib/` — Clientes y lógica: db.ts, wordpress.ts, generator.ts, linkedin.ts, instagram.ts
- `prisma/schema.prisma` — Schema completo: blog_posts, social_posts, settings, publish_log

### Data Flow
- Cron (Vercel) → `/api/cron/generate` → `lib/wordpress.ts` → `lib/generator.ts` (Claude API) → Supabase DB
- Usuario → Dashboard → `/posts/[id]` → Edita → Aprueba → `/api/posts/[id]/approve`
- Usuario → "Publicar" → `/api/posts/[id]/publish` → `lib/linkedin.ts` + `lib/instagram.ts` → RRSS

### Key Patterns
- Server Components por defecto. "use client" SOLO en PostEditor, formularios con estado local, y Calendar.
- Todas las queries a la DB pasan por `lib/db.ts` (cliente Prisma singleton).
- Los tokens OAuth de LinkedIn e Instagram se guardan encriptados en la tabla `settings`.
- Los endpoints de cron verifican `Authorization: Bearer {CRON_SECRET}` en el header.
- El mapeo categoría WordPress → URL de servicio está en la tabla `settings` con key "service_map".

## Code Organization Rules

1. **Un componente por archivo.** Máximo 300 líneas. Si supera, extraer sub-componentes.
2. **Path alias:** Usar `@/` para imports desde `src/`. Nunca rutas relativas `../../`.
3. **Server Components por defecto.** Agregar `"use client"` solo cuando hay interactividad real (estado, eventos).
4. **Respuestas de API consistentes:** `{ data: T }` para éxito, `{ error: string }` para error.
5. **Colocar componentes page-specific junto a su página** en `app/(dashboard)/[route]/components/`.

## Design System

### Colors
- Primary: `#1B3A6B` — Sidebar, botones primarios, headers principales
- Accent (teal): `#1A8F8A` — Posts aprobados, links activos, CTAs secundarios
- Background: `#F8FAFC` — Fondo de páginas
- Surface: `#FFFFFF` — Tarjetas, paneles, inputs
- Text: `#0F172A` — Texto principal
- Muted: `#64748B` — Texto secundario, metadata
- Border: `#E2E8F0` — Bordes de tarjetas
- Destructive: `#DC2626` — Rechazar, errores
- Success: `#16A34A` — Publicado, confirmaciones

### Typography
- Fuente: Inter (Google Fonts — `next/font/google`)
- Headings: 700 / 600
- Body: 400, 16px
- Meta/small: 400, 14px

### Style
- Border radius: 6px inputs, 8px cards, 12px modals
- Sombras: `shadow-sm` cards, `shadow-md` modals
- Espaciado base: 4px (escala: 4, 8, 12, 16, 24, 32, 48)
- Sidebar ancho fijo: 240px

## Environment Variables

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL Transaction pooler URI |
| `DIRECT_URL` | Supabase PostgreSQL Direct connection URI |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo server-side) |
| `ANTHROPIC_API_KEY` | API Key de Anthropic Claude |
| `WORDPRESS_URL` | `https://www.ingeseam.com` |
| `LINKEDIN_CLIENT_ID` | Client ID de la app LinkedIn |
| `LINKEDIN_CLIENT_SECRET` | Client Secret de la app LinkedIn |
| `LINKEDIN_ORG_ID` | ID numérico de la página de empresa LinkedIn |
| `META_APP_ID` | App ID de Meta for Developers |
| `META_APP_SECRET` | App Secret de Meta for Developers |
| `CRON_SECRET` | Token secreto para proteger /api/cron/* |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app en Vercel |

## Reglas No Negociables

1. NUNCA commitear archivos `.env` o `.env.local`. Solo `.env.example` con placeholders.
2. Todos los tokens OAuth (LinkedIn, Instagram) se guardan en la tabla `settings`, nunca en variables de entorno en runtime.
3. Los endpoints `/api/cron/*` DEBEN verificar el header `Authorization: Bearer {CRON_SECRET}` antes de ejecutar cualquier lógica.
4. TypeScript strict mode activado. Cero `any` types. Si necesitas escape, usar `unknown` con type guard.
5. La publicación en RRSS SOLO ocurre cuando `status === 'APPROVED'`. Verificar en el backend, no solo en el frontend.
