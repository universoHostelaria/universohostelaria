'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import type { CartItem } from './CartContext'
import styles from './SolicitudModal.module.css'

type Props = { onClose: () => void }

type Step = 'empresa' | 'confirma' | 'enviado'

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
  const [step, setStep]     = useState<Step>('empresa')
  const [form, setForm]     = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validateStep1 = () => {
    const errs: Partial<FormData> = {}
    if (!form.empresa_nombre.trim()) errs.empresa_nombre = 'Campo obligatorio'
    if (!form.contacto_nombre.trim()) errs.contacto_nombre = 'Campo obligatorio'
    if (!form.contacto_email.trim() || !form.contacto_email.includes('@'))
      errs.contacto_email = 'Email válido requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
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
      setOrderId(data.id)
      setStep('enviado')
      clearCart()
    } catch (err) {
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {step !== 'enviado' && (
              <div className={styles.steps}>
                <div className={`${styles.step} ${step === 'empresa' ? styles.stepActive : styles.stepDone}`}>
                  <span>1</span> Datos
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step === 'confirma' ? styles.stepActive : step === 'enviado' ? styles.stepDone : ''}`}>
                  <span>2</span> Confirmación
                </div>
              </div>
            )}
            {step === 'enviado' && (
              <div className={styles.headerTitle}>Solicitud enviada</div>
            )}
          </div>
          {step !== 'enviado' && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* STEP 1 — Datos empresa */}
        {step === 'empresa' && (
          <div className={styles.body}>
            <div className={styles.sectionLabel}>Empresa</div>
            <div className={styles.row}>
              <Field label="Nombre de la empresa *" error={errors.empresa_nombre}>
                <input value={form.empresa_nombre} onChange={e => set('empresa_nombre', e.target.value)}
                  placeholder="Restaurante El Muelle S.L." className={errors.empresa_nombre ? styles.inputError : ''} />
              </Field>
              <Field label="CIF / NIF" error={errors.empresa_cif}>
                <input value={form.empresa_cif} onChange={e => set('empresa_cif', e.target.value)}
                  placeholder="B12345678" />
              </Field>
            </div>
            <Field label="Dirección de entrega" error={errors.empresa_direccion}>
              <input value={form.empresa_direccion} onChange={e => set('empresa_direccion', e.target.value)}
                placeholder="Calle Mayor 123, Local 2" />
            </Field>
            <div className={styles.row}>
              <Field label="Ciudad" error={errors.empresa_ciudad}>
                <input value={form.empresa_ciudad} onChange={e => set('empresa_ciudad', e.target.value)}
                  placeholder="Barcelona" />
              </Field>
              <Field label="Código postal" error={errors.empresa_cp}>
                <input value={form.empresa_cp} onChange={e => set('empresa_cp', e.target.value)}
                  placeholder="08001" />
              </Field>
            </div>

            <div className={styles.sectionLabel} style={{marginTop: 20}}>Responsable del pedido</div>
            <Field label="Nombre completo *" error={errors.contacto_nombre}>
              <input value={form.contacto_nombre} onChange={e => set('contacto_nombre', e.target.value)}
                placeholder="María García López" className={errors.contacto_nombre ? styles.inputError : ''} />
            </Field>
            <div className={styles.row}>
              <Field label="Email *" error={errors.contacto_email}>
                <input type="email" value={form.contacto_email} onChange={e => set('contacto_email', e.target.value)}
                  placeholder="maria@restaurante.com" className={errors.contacto_email ? styles.inputError : ''} />
              </Field>
              <Field label="Teléfono" error={errors.contacto_telefono}>
                <input type="tel" value={form.contacto_telefono} onChange={e => set('contacto_telefono', e.target.value)}
                  placeholder="+34 600 000 000" />
              </Field>
            </div>
            <Field label="Notas adicionales">
              <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
                placeholder="Plazos de entrega, condiciones especiales, etc." rows={3} />
            </Field>
          </div>
        )}

        {/* STEP 2 — Confirmación */}
        {step === 'confirma' && (
          <div className={styles.body}>
            <div className={styles.confirmSection}>
              <div className={styles.sectionLabel}>Tu pedido ({items.length} producto{items.length > 1 ? 's' : ''})</div>
              {items.map(i => (
                <div key={i.product.id} className={styles.confirmItem}>
                  {i.product.img_url && (
                    <img src={i.product.img_url} alt={i.product.name} className={styles.confirmImg} />
                  )}
                  <div className={styles.confirmInfo}>
                    <div className={styles.confirmSupplier}>{supplierName(i.product.supplier_id)}</div>
                    <div className={styles.confirmName}>{i.product.name}</div>
                    <div className={styles.confirmQty}>{i.quantity} ud</div>
                  </div>
                  <div className={styles.confirmPrice}>
                    {i.product.price
                      ? `${(i.product.price * i.quantity).toFixed(2).replace('.', ',')} €`
                      : 'A consultar'}
                    <small>+IVA</small>
                  </div>
                </div>
              ))}
              {total > 0 && (
                <div className={styles.confirmTotal}>
                  <span>Total estimado</span>
                  <strong>{total.toFixed(2).replace('.', ',')} € <small>+ IVA</small></strong>
                </div>
              )}
            </div>

            <div className={styles.confirmSection}>
              <div className={styles.sectionLabel}>Datos de contacto</div>
              <div className={styles.confirmData}>
                <div><span>Empresa</span><strong>{form.empresa_nombre}</strong></div>
                {form.empresa_cif && <div><span>CIF/NIF</span><strong>{form.empresa_cif}</strong></div>}
                {form.empresa_direccion && <div><span>Dirección</span><strong>{form.empresa_direccion}, {form.empresa_ciudad} {form.empresa_cp}</strong></div>}
                <div><span>Responsable</span><strong>{form.contacto_nombre}</strong></div>
                <div><span>Email</span><strong>{form.contacto_email}</strong></div>
                {form.contacto_telefono && <div><span>Teléfono</span><strong>{form.contacto_telefono}</strong></div>}
              </div>
            </div>

            <p className={styles.disclaimer}>
              Nuestro especialista revisará tu solicitud y te enviará una oferta personalizada con precios, plazos y condiciones en menos de 24h hábiles.
            </p>
          </div>
        )}

        {/* STEP 3 — Enviado */}
        {step === 'enviado' && (
          <div className={styles.body}>
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#16A34A"/>
                  <path d="M8 16l5.5 5.5L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className={styles.successTitle}>Solicitud enviada</h2>
              <p className={styles.successText}>
                Hemos recibido tu solicitud correctamente. Nuestro especialista la revisará y te contactará en menos de <strong>24 horas hábiles</strong> con una oferta personalizada.
              </p>
              {orderId && (
                <div className={styles.orderId}>
                  Ref. solicitud: <strong>{orderId.slice(0, 8).toUpperCase()}</strong>
                </div>
              )}
              <p className={styles.successEmail}>
                Se enviará un resumen a <strong>{form.contacto_email}</strong>
              </p>
              <button className={styles.doneBtn} onClick={onClose}>Cerrar</button>
            </div>
          </div>
        )}

        {/* Footer */}
        {step !== 'enviado' && (
          <div className={styles.footer}>
            {step === 'empresa' ? (
              <>
                <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={() => { if (validateStep1()) setStep('confirma') }}>
                  Continuar
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button className={styles.btnSecondary} onClick={() => setStep('empresa')}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Volver
                </button>
                <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Enviando…' : 'Confirmar solicitud'}
                  {!loading && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        )}
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
