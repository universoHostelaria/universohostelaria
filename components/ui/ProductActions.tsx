'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import type { Product } from '@/lib/supabase'
import styles from './ProductActions.module.css'

type Props = { product: Product }

export default function ProductActions({ product: p }: Props) {
  const { addItem } = useCart()
  const [qty,   setQty]   = useState(1)
  const [color, setColor] = useState('')
  const [added, setAdded] = useState(false)

  const unitPrice = p.price

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
        {unitPrice && qty > 0 && (
          <span className={styles.subtotal}>
            = {(unitPrice * qty).toFixed(2).replace('.', ',')} € <small>+ IVA</small>
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
        <div className={styles.price}>{p.price_display}</div>
        <div className={styles.priceNote}>Precio mayorista · IVA no incluido</div>
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
