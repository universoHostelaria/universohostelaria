'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/lib/supabase'

type Supplier = { id: string; name: string }

type Props = {
  product?: Product
  suppliers: Supplier[]
  action: (fd: FormData) => Promise<void>
}

export default function ProductForm({ product, suppliers, action }: Props) {
  const isEdit = !!product
  const [preview, setPreview] = useState<string | null>(product?.img_url ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(fd: FormData) {
    setSaving(true)
    setError('')
    try {
      await action(fd)
    } catch (e) {
      // redirect() lança NEXT_REDIRECT — não é erro real.
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('NEXT_REDIRECT')) return
      setError(msg)
      setSaving(false)
    }
  }

  return (
    <form action={onSubmit}>
      <Link href="/admin/products" className="adm-back">← Volver a productos</Link>
      <div className="adm-row-between">
        <h1 className="adm-h1">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>
        <button className="adm-btn" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {error && <div className="adm-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Coluna principal */}
        <div className="adm-card">
          <div className="adm-field">
            <label>Nombre *</label>
            <input name="name" className="adm-input" defaultValue={product?.name ?? ''} required />
          </div>

          {!isEdit && (
            <div className="adm-field">
              <label>ID (opcional — se genera automáticamente)</label>
              <input name="id" className="adm-input" placeholder="ej: silla-lima-azul" />
            </div>
          )}

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Categoría</label>
              <input name="category" className="adm-input" defaultValue={product?.category ?? ''} />
            </div>
            <div className="adm-field">
              <label>Uso</label>
              <input name="uso" className="adm-input" defaultValue={product?.uso ?? ''} placeholder="Interior / Exterior" />
            </div>
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Material</label>
              <input name="material" className="adm-input" defaultValue={product?.material ?? ''} />
            </div>
            <div className="adm-field">
              <label>Fabricante</label>
              <select name="supplier_id" className="adm-select" defaultValue={product?.supplier_id ?? ''}>
                <option value="">—</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="adm-field">
            <label>Características</label>
            <textarea name="features" className="adm-textarea" defaultValue={product?.features ?? ''} />
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Dimensiones</label>
              <input name="dimensions_raw" className="adm-input" defaultValue={product?.dimensions_raw ?? ''} placeholder="Alto × Ancho × Profundo" />
            </div>
            <div className="adm-field">
              <label>Peso (kg)</label>
              <input name="weight_kg" className="adm-input" defaultValue={product?.weight_kg ?? ''} />
            </div>
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Alto asiento</label>
              <input name="alto_asiento" className="adm-input" defaultValue={product?.alto_asiento ?? ''} />
            </div>
            <div className="adm-field">
              <label>Modelo</label>
              <input name="modelo" className="adm-input" defaultValue={product?.modelo ?? ''} />
            </div>
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Código interno</label>
              <input name="cod_interno" className="adm-input" defaultValue={product?.cod_interno ?? ''} />
            </div>
            <div className="adm-field">
              <label>Código comercial</label>
              <input name="cod_comercial" className="adm-input" defaultValue={product?.cod_comercial ?? ''} />
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="adm-card">
            <div className="adm-field" style={{ marginBottom: 12 }}>
              <label>Imagen</label>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 10, aspectRatio: '1', objectFit: 'cover', background: 'var(--adm-bg)' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: 'var(--adm-bg)', marginBottom: 10 }} />
              )}
              <input
                type="file"
                name="image_file"
                accept="image/*"
                className="adm-input"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPreview(URL.createObjectURL(f))
                }}
              />
            </div>
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <label>…o URL de imagen</label>
              <input name="img_url" className="adm-input" defaultValue={product?.img_url ?? ''} placeholder="https://…" />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-field">
              <label>Precio (€)</label>
              <input name="price" type="text" inputMode="decimal" className="adm-input" defaultValue={product?.price ?? ''} />
            </div>
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <label>Texto de precio</label>
              <input name="price_display" className="adm-input" defaultValue={product?.price_display ?? ''} placeholder="ej: Desde 89 € / Consultar" />
            </div>
          </div>

          <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label className="adm-check">
              <input type="checkbox" name="active" defaultChecked={product ? product.active : true} /> Activo (visible en el sitio)
            </label>
            <label className="adm-check">
              <input type="checkbox" name="is_new" defaultChecked={product?.is_new ?? false} /> Marcar como Nuevo
            </label>
            <label className="adm-check">
              <input type="checkbox" name="catas_certified" defaultChecked={product?.catas_certified ?? false} /> Certificado CATAS
            </label>
          </div>
        </div>
      </div>
    </form>
  )
}
