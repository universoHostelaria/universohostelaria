'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toggleActive, deleteProduct } from './actions'

export default function ProductRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => {
      await toggleActive(id, !active)
      router.refresh()
    })
  }

  function onDelete() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      await deleteProduct(id)
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={onToggle} disabled={pending}>
        {active ? 'Ocultar' : 'Activar'}
      </button>
      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={onDelete} disabled={pending}>
        Eliminar
      </button>
    </div>
  )
}
