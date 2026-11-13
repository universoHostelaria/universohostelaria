'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'
import type { CartItem } from './CartContext'
import { priceConIva, formatEUR, IVA } from '@/lib/price'
import styles from './SolicitudModal.module.css'

type Props = { onClose: () => void }

type FormData = {
  empresa_nombre:    string
  empresa_cif:       string
  empresa_direccion: string
  empresa_ciudad:    string
  empresa_cp:        string
  contacto_nombre:   string
  contacto_email:    string
  contacto_telefono: string
  notas:             string
}

const EMPTY: FormData = {
  empresa_nombre: '', empresa_cif: '', empresa_direccion: '',
  empresa_ciudad: '', empresa_cp: '',
  contacto_nombre: '', contacto_email: '', contacto_telefono: '',
  notas: '',
}

const supplierName = (id: string) =>
  id === 'tilia_romero' ? 'Tilia · Romero' :
  id === 'arkimueble'   ? 'Arkimueble' : 'Romero'

export default function SolicitudModal({ onClose }: Props) {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm]     = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  const [showEmpresa, setShowEmpresa] = useState(false)

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  // Formulario corto: solo nombre y teléfono son obligatorios; el resto, opcional
  const validate = () => {
    const errs: Partial<FormData> = {}
    if (!form.contacto_nombre.trim()) errs.contacto_nombre = 'Campo obligatorio'
    if (form.contacto_telefono.replace(/\D/g, '').length < 9) errs.contacto_telefono = 'Teléfono válido requerido'
    if (form.contacto_email.trim() && !form.contacto_email.includes('@')) errs.contacto_email = 'Email no válido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        items: items.map(i => ({
          product_id: i.product.id,
          name:       i.product.name,
          supplier:   supplierName(i.product.supplier_id),
          qty:        i.quantity,
          color:      (i as CartItem & { color?: string }).color,
          price:      i.product.price,
          subtotal:   i.product.price ? i.product.price * i.quantity : null,
        })),
      }
      const res  = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      clearCart()
      // Página de confirmación (URL propia para medir la conversión en Google Ads)
      const ref = String(data.id ?? '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
      onClose()
      router.push(ref ? `/gracias?ref=${ref}` : '/gracias')
    } catch (err) {
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const units = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>

        <div className={styles.header}>
          <div className={styles.headerTitle}>Pedir presupuesto</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {/* Resumen compacto del pedido */}
          <div className={styles.confirmSection}>
            <div className={styles.sectionLabel}>Tu pedido · {units} ud</div>
            {items.map(i => (
              <div key={i.product.id} className={styles.confirmItem}>
                {i.product.img_url && (
                  <img src={i.product.img_url} alt={i.product.name} className={styles.confirmImg} width={44} height={44} />
                )}
                <div className={styles.confirmInfo}>
                  <div className={styles.confirmName}>{i.product.name}</div>
                  <div className={styles.confirmQty}>{i.quantity} ud</div>
                </div>
                <div className={styles.confirmPrice}>
                  {priceConIva(i.product.price)
                    ? formatEUR(priceConIva(i.product.price)! * i.quantity)
                    : 'A consultar'}
                </div>
              </div>
            ))}
            {total > 0 && (
              <div className={styles.confirmTotal}>
                <span>Total estimado</span>
                <strong>{formatEUR(total * (1 + IVA))} <small>IVA incl.</small></strong>
              </div>
            )}
          </div>

          <div className={styles.sectionLabel}>Te enviamos el presupuesto en menos de 24 h</div>
          <Field label="Nombre *" error={errors.contacto_nombre}>
            <input value={form.contacto_nombre} onChange={e => set('contacto_nombre', e.target.value)}
              autoComplete="name" placeholder="María García" className={errors.contacto_nombre ? styles.inputError : ''} />
          </Field>
          <Field label="Teléfono / WhatsApp *" error={errors.contacto_telefono}>
            <input type="tel" inputMode="tel" autoComplete="tel" value={form.contacto_telefono}
              onChange={e => set('contacto_telefono', e.target.value)}
              placeholder="+34 600 000 000" className={errors.contacto_telefono ? styles.inputError : ''} />
          </Field>
          <Field label="Email (opcional)" error={errors.contacto_email}>
            <input type="email" inputMode="email" autoComplete="email" value={form.contacto_email}
              onChange={e => set('contacto_email', e.target.value)}
              placeholder="maria@restaurante.com" className={errors.contacto_email ? styles.inputError : ''} />
          </Field>

          {showEmpresa ? (
            <>
              <div className={styles.row}>
                <Field label="Nombre del negocio">
                  <input value={form.empresa_nombre} onChange={e => set('empresa_nombre', e.target.value)}
                    autoComplete="organization" placeholder="Restaurante El Muelle" />
                </Field>
                <Field label="CIF / NIF">
                  <input value={form.empresa_cif} onChange={e => set('empresa_cif', e.target.value)} placeholder="B12345678" />
                </Field>
              </div>
              <div className={styles.row}>
                <Field label="Ciudad">
                  <input value={form.empresa_ciudad} onChange={e => set('empresa_ciudad', e.target.value)}
                    autoComplete="address-level2" placeholder="Barcelona" />
                </Field>
                <Field label="Código postal">
                  <input value={form.empresa_cp} onChange={e => set('empresa_cp', e.target.value)}
                    inputMode="numeric" autoComplete="postal-code" placeholder="08001" />
                </Field>
              </div>
              <Field label="Comentarios">
                <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
                  placeholder="Colores, plazos, número de mesas…" rows={2} />
              </Field>
            </>
          ) : (
            <button type="button" className={styles.moreBtn} onClick={() => setShowEmpresa(true)}>
              + Añadir negocio, ciudad o comentarios (opcional)
            </button>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar solicitud'}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

function Field({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}
