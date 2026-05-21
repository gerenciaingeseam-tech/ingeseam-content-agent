'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md px-4">
        {/* Logo + nombre */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{ backgroundColor: '#1B3A6B' }}
          >
            <span className="text-white font-bold text-2xl">I</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">INGESEAM</h1>
          <p className="text-[#64748B] text-sm mt-1">Content Agent</p>
        </div>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#0F172A]">Iniciar sesión</CardTitle>
            <CardDescription className="text-[#64748B]">
              Accede a tu panel de contenido
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0F172A]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="gerencia.ingeseam@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-[#E2E8F0] focus-visible:ring-[#1A8F8A]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0F172A]">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-[#E2E8F0] focus-visible:ring-[#1A8F8A]"
                />
              </div>

              {error && (
                <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#1B3A6B] hover:bg-[#152d54] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#64748B] mt-6">
          INGESEAM Content Agent — Uso interno
        </p>
      </div>
    </div>
  )
}
