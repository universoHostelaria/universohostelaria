import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = createClient()

  const [products, active, suppliers, orders, pending] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { num: products.count ?? 0, label: 'Productos totales', href: '/admin/products' },
    { num: active.count ?? 0, label: 'Productos activos', href: '/admin/products' },
    { num: suppliers.count ?? 0, label: 'Fabricantes', href: '/admin/products' },
    { num: pending.count ?? 0, label: 'Pedidos pendientes', href: '/admin/orders' },
    { num: orders.count ?? 0, label: 'Pedidos totales', href: '/admin/orders' },
  ]

  return (
    <>
      <div className="adm-row-between">
        <div>
          <h1 className="adm-h1">Dashboard</h1>
          <p className="adm-sub">Resumen del sitio.</p>
        </div>
        <Link href="/admin/products/new" className="adm-btn">+ Nuevo producto</Link>
      </div>

      <div className="adm-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="adm-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="adm-stat-num">{s.num.toLocaleString('es-ES')}</div>
            <div className="adm-stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="adm-card" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 15, margin: '0 0 12px' }}>Accesos rápidos</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/products" className="adm-btn adm-btn-ghost">Gestionar productos</Link>
          <Link href="/admin/content" className="adm-btn adm-btn-ghost">Editar la home</Link>
          <Link href="/admin/orders" className="adm-btn adm-btn-ghost">Ver pedidos</Link>
        </div>
      </div>
    </>
  )
}
