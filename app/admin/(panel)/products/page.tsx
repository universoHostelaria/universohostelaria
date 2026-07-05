import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import ProductRowActions from './ProductRowActions'
import RestoreCampaignButton from './RestoreCampaignButton'
import { countHiddenByCampaign } from './actions'

const PER_PAGE = 30

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = createClient()
  const q = (searchParams.q ?? '').trim()
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)

  let query = supabase
    .from('products')
    .select('id, name, category, supplier_id, price_display, img_url, active', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) query = query.or(`name.ilike.%${q}%,id.ilike.%${q}%,category.ilike.%${q}%`)

  query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
  const [{ data: products, count }, hiddenCount] = await Promise.all([query, countHiddenByCampaign()])

  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))

  const buildHref = (p: number) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (p > 1) sp.set('page', String(p))
    const s = sp.toString()
    return `/admin/products${s ? `?${s}` : ''}`
  }

  return (
    <>
      <div className="adm-row-between">
        <div>
          <h1 className="adm-h1">Productos</h1>
          <p className="adm-sub">{total.toLocaleString('es-ES')} productos en total.</p>
        </div>
        <Link href="/admin/products/new" className="adm-btn">+ Nuevo producto</Link>
      </div>

      <RestoreCampaignButton hiddenCount={hiddenCount} />

      <form className="adm-toolbar" action="/admin/products" method="get">
        <input name="q" className="adm-input" placeholder="Buscar por nombre, ID o categoría…" defaultValue={q} />
        <button className="adm-btn adm-btn-ghost">Buscar</button>
        {q && <Link href="/admin/products" className="adm-back" style={{ margin: 0 }}>Limpiar</Link>}
      </form>

      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td>
                  {p.img_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="adm-thumb" src={p.img_url} alt="" />
                  ) : (
                    <div className="adm-thumb" />
                  )}
                </td>
                <td>
                  <Link href={`/admin/products/${p.id}`} style={{ color: 'var(--adm-text)', fontWeight: 600, textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                  <div className="adm-muted" style={{ fontSize: 11.5 }}>{p.id}</div>
                </td>
                <td className="adm-muted">{p.category ?? '—'}</td>
                <td className="adm-muted">{p.price_display || '—'}</td>
                <td>
                  <span className={`adm-pill ${p.active ? 'adm-pill-on' : 'adm-pill-off'}`}>
                    {p.active ? 'Activo' : 'Oculto'}
                  </span>
                </td>
                <td>
                  <ProductRowActions id={p.id} active={p.active} />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: 40 }}>
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 18, justifyContent: 'center' }}>
          {page > 1 && <Link href={buildHref(page - 1)} className="adm-btn adm-btn-ghost adm-btn-sm">← Anterior</Link>}
          <span className="adm-muted" style={{ fontSize: 13 }}>Página {page} de {pages}</span>
          {page < pages && <Link href={buildHref(page + 1)} className="adm-btn adm-btn-ghost adm-btn-sm">Siguiente →</Link>}
        </div>
      )}
    </>
  )
}
