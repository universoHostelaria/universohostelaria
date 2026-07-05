'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { restoreFullCatalog } from './actions'

export default function RestoreCampaignButton({ hiddenCount }: { hiddenCount: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (hiddenCount === 0) return null

  function onRestore() {
    if (!confirm(`Reactivar los ${hiddenCount} productos ocultados por la campaña y mostrar todo el catálogo de nuevo?`)) return
    startTransition(async () => {
      await restoreFullCatalog()
      router.refresh()
    })
  }

  return (
    <div className="adm-card" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderColor: 'var(--adm-blue)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Modo campaña activo</div>
        <div className="adm-muted" style={{ fontSize: 12.5 }}>
          {hiddenCount.toLocaleString('es-ES')} productos están ocultos (en borrador). Solo se muestran los destacados de la campaña.
        </div>
      </div>
      <button className="adm-btn adm-btn-ghost" onClick={onRestore} disabled={pending}>
        {pending ? 'Restaurando…' : 'Restaurar catálogo completo'}
      </button>
    </div>
  )
}
