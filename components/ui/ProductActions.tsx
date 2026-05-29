'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import SolicitudModal from './SolicitudModal'
import type { Product } from '@/lib/supabase'
import styles from './ProductActions.module.css'

const WA = 'https://wa.me/34665953186?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20con%20un%20especialista%20de%20Universo%20Hostelería.'

type Props = { product: Product }

export default function ProductActions({ product: p }: Props) {
  const { addItem, openCart } = useCart()
  const [qty,   setQty]   = useState(1)
  const [color, setColor] = useState('')
  const [added, setAdded] = useState(false)
  const [showSolicitud, setShowSolicitud] = useState(false)

  const unitPrice  = p.price
  const totalPrice = unitPrice ? unitPrice * qty : null

  const handleAdd = () => {
    // Attach color note to product before adding
    const productWithColor = color
      ? { ...p, name: `${p.name}${color ? ` (${color})` : ''}` }
      : p
    addItem(productWithColor, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className={styles.wrap}>

        {/* Quantity */}
        <div className={styles.row}>
          <span className={styles.label}>Cantidad</span>
          <div className={styles.qtyCtrl}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <input
              type="number" value={qty} min={1}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          {unitPrice && qty > 0 && (
            <span className={styles.subtotal}>
              = {(unitPrice * qty).toFixed(2).replace('.', ',')} € <small>+ IVA</small>
            </span>
          )}
        </div>

        {/* Color / Acabado — free text */}
        <div className={styles.colorRow}>
          <span className={styles.label}>Color / Acabado</span>
          <input
            className={styles.colorInput}
            value={color}
            onChange={e => setColor(e.target.value)}
            placeholder="Ej: Negro mate, Blanco arena, Teka..."
          />
        </div>

        {/* Price display */}
        <div className={styles.priceBlock}>
          <div className={styles.price}>{p.price_display}</div>
          <div className={styles.priceNote}>Precio mayorista · IVA no incluido</div>
        </div>

        {/* CTAs */}
        <div className={styles.ctaStack}>
          <button
            className={`${styles.btnAdd} ${added ? styles.btnAdded : ''}`}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Añadido al pedido
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 3h2l2.5 8h8l1.5-5H5.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="13.5" r="1.5" fill="white"/>
                  <circle cx="13" cy="13.5" r="1.5" fill="white"/>
                </svg>
                Añadir al pedido
              </>
            )}
          </button>
          <div className={styles.ctaOr}>o</div>
          <button className={styles.btnWa} onClick={() => window.open(WA, '_blank')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Hablar con nuestro especialista
          </button>
          <button className={styles.btnSolicitud} onClick={() => setShowSolicitud(true)}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
              <path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Enviar solicitud
          </button>
        </div>

        {/* Trust */}
        <div className={styles.trust}>
          {[
            'Entrega coordinada en toda España',
            'Precio directo de fabricante',
            'Especialista disponible para tu proyecto',
          ].map(t => (
            <div key={t} className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="#2B6FD4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>

      {showSolicitud && <SolicitudModal onClose={() => setShowSolicitud(false)} />}
    </>
  )
}
