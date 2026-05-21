'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Calendar,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/posts',
    label: 'Posts',
    icon: FileText,
  },
  {
    href: '/blogs',
    label: 'Blogs',
    icon: BookOpen,
  },
  {
    href: '/calendar',
    label: 'Calendario',
    icon: Calendar,
  },
  {
    href: '/settings',
    label: 'Configuración',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-30" style={{ backgroundColor: '#1B3A6B' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">I</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">INGESEAM</p>
          <p className="text-white/60 text-xs leading-tight">Content Agent</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { backgroundColor: '#1A8F8A' } : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs">v1.0 · Bogotá, Colombia</p>
      </div>
    </aside>
  )
}
