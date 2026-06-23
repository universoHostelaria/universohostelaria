'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import '../admin.css'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : error.message
      )
      setLoading(false)
      return
    }

    const next = params.get('next') || '/admin'
    router.replace(next)
    router.refresh()
  }

  return (
    <div className="adm-body">
      <div className="adm-login-wrap">
        <form className="adm-login-card" onSubmit={handleSubmit}>
          <h1>Universo Hostelería</h1>
          <p>Panel de administración</p>

          {error && <div className="adm-error">{error}</div>}

          <div className="adm-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="adm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="adm-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="adm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="adm-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
