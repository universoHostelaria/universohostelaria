'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/content', label: 'Contenido (Home)' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/orders', label: 'Pedidos' },
]

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  const isActive = (l: (typeof LINKS)[number]) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href)

  return (
    <aside className="adm-sidebar">
      <div className="adm-logo">
        Universo Hostelería
        <span>Panel de administración</span>
      </div>
      <nav className="adm-nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l) ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="adm-spacer" />
      <div className="adm-foot-user">{email}</div>
      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={signOut}>
        Cerrar sesión
      </button>
      <Link href="/" className="adm-back" style={{ marginTop: 10 }} target="_blank">
        Ver sitio ↗
      </Link>
    </aside>
  )
}
