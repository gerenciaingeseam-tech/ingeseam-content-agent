import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

// Mapa de rutas a títulos para el Header
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/posts': 'Posts',
  '/blogs': 'Biblioteca de Blogs',
  '/calendar': 'Calendario',
  '/settings': 'Configuración',
}

function getTitleFromPathname(pathname: string): string {
  // Match exacto primero
  if (pageTitles[pathname]) return pageTitles[pathname]
  // Si es una sub-ruta (ej: /posts/abc)
  const base = '/' + pathname.split('/')[1]
  return pageTitles[base] ?? 'Dashboard'
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      {/* Main content — desplazado 240px por el sidebar fijo */}
      <div className="ml-60 flex flex-col min-h-screen">
        <Header title="Dashboard" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
