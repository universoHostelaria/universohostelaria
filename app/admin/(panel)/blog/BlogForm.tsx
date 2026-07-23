'use client'

import { useState } from 'react'
import Link from 'next/link'
import { marked } from 'marked'
import type { BlogPost } from '@/lib/blog'

type Props = {
  post?: BlogPost
  action: (fd: FormData) => Promise<void>
}

export default function BlogForm({ post, action }: Props) {
  const isEdit = !!post
  const [content, setContent] = useState(post?.content ?? '')
  const [cover, setCover] = useState<string | null>(post?.cover_image ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  async function onSubmit(fd: FormData) {
    setSaving(true); setError('')
    try {
      await action(fd)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('NEXT_REDIRECT')) return
      setError(msg); setSaving(false)
    }
  }

  return (
    <form action={onSubmit}>
      <Link href="/admin/blog" className="adm-back">← Volver al blog</Link>
      <div className="adm-row-between">
        <h1 className="adm-h1">{isEdit ? 'Editar artículo' : 'Nuevo artículo'}</h1>
        <button className="adm-btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>

      {error && <div className="adm-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div className="adm-card">
          <div className="adm-field">
            <label>Título *</label>
            <input name="title" className="adm-input" defaultValue={post?.title ?? ''} required />
          </div>
          {!isEdit && (
            <div className="adm-field">
              <label>Slug (URL — opcional, se genera del título)</label>
              <input name="slug" className="adm-input" placeholder="ej: como-elegir-sillas-hosteleria" />
            </div>
          )}
          <div className="adm-field">
            <label>Extracto (resumen corto para la lista y meta)</label>
            <textarea name="excerpt" className="adm-textarea" defaultValue={post?.excerpt ?? ''} />
          </div>

          <div className="adm-field" style={{ marginBottom: 6 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Contenido (Markdown)</span>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setPreview((p) => !p)}>
                {preview ? 'Editar' : 'Vista previa'}
              </button>
            </label>
            {preview ? (
              <div
                className="adm-input"
                style={{ minHeight: 320, lineHeight: 1.6, overflow: 'auto' }}
                dangerouslySetInnerHTML={{ __html: marked.parse(content || '_Nada que previsualizar._') as string }}
              />
            ) : (
              <textarea
                name="content"
                className="adm-textarea"
                style={{ minHeight: 320, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            )}
            {preview && <input type="hidden" name="content" value={content} />}
          </div>
          <p className="adm-muted" style={{ fontSize: 12 }}>
            Markdown: <code>## Título</code>, <code>### Subtítulo</code>, <code>**negrita**</code>,
            <code>- lista</code>, <code>[enlace](/catalog)</code>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="adm-check">
              <input type="checkbox" name="published" defaultChecked={post ? post.published : true} /> Publicado
            </label>
            <div className="adm-field" style={{ margin: 0 }}>
              <label>Categoría</label>
              <input name="category" className="adm-input" defaultValue={post?.category ?? 'Guías'} placeholder="Guías / Consejos" />
            </div>
            <div className="adm-field" style={{ margin: 0 }}>
              <label>Autor</label>
              <input name="author" className="adm-input" defaultValue={post?.author ?? 'Universo Hostelería'} />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-field" style={{ marginBottom: 10 }}>
              <label>Portada</label>
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 10, aspectRatio: '16/9', objectFit: 'cover', background: 'var(--adm-bg)' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 8, background: 'var(--adm-bg)', marginBottom: 10 }} />
              )}
              <input type="file" name="cover_file" accept="image/*" className="adm-input"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setCover(URL.createObjectURL(f)) }} />
            </div>
            <div className="adm-field" style={{ margin: 0 }}>
              <label>…o URL de portada</label>
              <input name="cover_image" className="adm-input" defaultValue={post?.cover_image ?? ''} placeholder="https://…" />
            </div>
          </div>

          <div className="adm-card">
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--adm-muted)', marginBottom: 10 }}>SEO</div>
            <div className="adm-field">
              <label>Meta title (opcional)</label>
              <input name="meta_title" className="adm-input" defaultValue={post?.meta_title ?? ''} />
            </div>
            <div className="adm-field">
              <label>Meta description</label>
              <textarea name="meta_description" className="adm-textarea" defaultValue={post?.meta_description ?? ''} />
            </div>
            <div className="adm-field" style={{ margin: 0 }}>
              <label>Keywords (separadas por comas)</label>
              <input name="keywords" className="adm-input" defaultValue={post?.keywords?.join(', ') ?? ''} />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
