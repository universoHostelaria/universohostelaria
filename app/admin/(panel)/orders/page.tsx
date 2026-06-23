import { createClient } from '@/lib/supabase-server'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  quoted: 'Presupuestado',
  closed: 'Cerrado',
}

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <>
      <h1 className="adm-h1">Pedidos</h1>
      <p className="adm-sub">Solicitudes de pedido recibidas.</p>

      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Items</th>
              <th>Total est.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => {
              const items = Array.isArray(o.items) ? o.items : []
              return (
                <tr key={o.id}>
                  <td className="adm-muted">{new Date(o.created_at).toLocaleDateString('es-ES')}</td>
                  <td style={{ fontWeight: 600 }}>{o.empresa_nombre}</td>
                  <td className="adm-muted">
                    {o.contacto_nombre}
                    <div style={{ fontSize: 11.5 }}>{o.contacto_email}</div>
                  </td>
                  <td className="adm-muted">{items.length} producto(s)</td>
                  <td className="adm-muted">{o.total_estimado ? `${o.total_estimado} €` : '—'}</td>
                  <td>
                    <span className="adm-pill adm-pill-on">{STATUS_LABEL[o.status] ?? o.status}</span>
                  </td>
                </tr>
              )
            })}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: 40 }}>
                  Aún no hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
