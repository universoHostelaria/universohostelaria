'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { togglePublished, deletePost } from './actions'

export default function BlogRowActions({ slug, published }: { slug: string; published: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function onToggle() {
    startTransition(async () => { await togglePublished(slug, !published); router.refresh() })
  }
  function onDelete() {
    if (!confirm('¿Eliminar este artículo? No se puede deshacer.')) return
    startTransition(async () => { await deletePost(slug); router.refresh() })
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      <a href={`/blog/${slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">Ver</a>
      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={onToggle} disabled={pending}>
        {published ? 'Despublicar' : 'Publicar'}
      </button>
      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={onDelete} disabled={pending}>Eliminar</button>
    </div>
  )
}
