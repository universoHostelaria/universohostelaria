'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import type { Product } from '@/lib/supabase'
import { priceConIva, formatEUR } from '@/lib/price'
import { waProductUrl } from '@/lib/whatsapp'
import styles from './ProductActions.module.css'

type Props = { product: Product }

export default function ProductActions({ product: p }: Props) {
  const { addItem } = useCart()
  const [qty,   setQty]   = useState(1)
  const [color, setColor] = useState('')
  const [added, setAdded] = useState(false)

  const unitPrice = p.price
  const unitConIva = priceConIva(p.price)

  const handleAdd = () => {
    const productWithColor = color
      ? { ...p, name: `${p.name} (${color})` }
      : p
    addItem(productWithColor, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
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
        {unitConIva && qty > 0 && (
          <span className={styles.subtotal}>
            = {formatEUR(unitConIva * qty)} <small>IVA incl.</small>
          </span>
        )}
      </div>

      {/* Color / Acabado */}
      <div className={styles.colorRow}>
        <span className={styles.label}>Color / Acabado</span>
        <input
          className={styles.colorInput}
          value={color}
          onChange={e => setColor(e.target.value)}
          placeholder="Ej: Negro mate, Blanco arena, Teka..."
        />
      </div>

      {/* Price */}
      <div className={styles.priceBlock}>
        <div className={styles.price}>{unitConIva ? formatEUR(unitConIva) : p.price_display}</div>
        <div className={styles.priceNote}>
          {unitConIva ? `IVA incluido · ${formatEUR(unitPrice!)} sin IVA` : 'Consultar precio · IVA aparte'}
        </div>
      </div>

      {/* CTA — single button */}
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

      {/* Presupuesto directo por WhatsApp (el clic se mide en GoogleTag) */}
      <a className={styles.btnWa} href={waProductUrl(p)} target="_blank" rel="noopener noreferrer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6 6 6 0 0 0 1.3 3.2 13.8 13.8 0 0 0 5.3 4.7c2 .8 2.7.9 3.7.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/>
        </svg>
        Pedir presupuesto por WhatsApp
      </a>

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
  )
}
