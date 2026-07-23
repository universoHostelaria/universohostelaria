import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import BlogRowActions from './BlogRowActions'

export default async function AdminBlogPage() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, category, published, published_at, cover_image')
    .order('published_at', { ascending: false })

  return (
    <>
      <div className="adm-row-between">
        <div>
          <h1 className="adm-h1">Blog</h1>
          <p className="adm-sub">{(posts?.length ?? 0)} artículos.</p>
        </div>
        <Link href="/admin/blog/new" className="adm-btn">+ Nuevo artículo</Link>
      </div>

      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}></th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(posts ?? []).map((p) => (
              <tr key={p.slug}>
                <td>
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="adm-thumb" src={p.cover_image} alt="" style={{ width: 52, height: 34, borderRadius: 5 }} />
                  ) : (
                    <div className="adm-thumb" style={{ width: 52, height: 34, borderRadius: 5 }} />
                  )}
                </td>
                <td>
                  <Link href={`/admin/blog/${p.slug}`} style={{ color: 'var(--adm-text)', fontWeight: 600, textDecoration: 'none' }}>{p.title}</Link>
                  <div className="adm-muted" style={{ fontSize: 11.5 }}>/blog/{p.slug}</div>
                </td>
                <td className="adm-muted">{p.category ?? '—'}</td>
                <td className="adm-muted">{new Date(p.published_at).toLocaleDateString('es-ES')}</td>
                <td>
                  <span className={`adm-pill ${p.published ? 'adm-pill-on' : 'adm-pill-off'}`}>
                    {p.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td><BlogRowActions slug={p.slug} published={p.published} /></td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && (
              <tr><td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: 40 }}>Aún no hay artículos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
