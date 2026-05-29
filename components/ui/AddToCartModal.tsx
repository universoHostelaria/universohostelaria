'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import type { Product } from '@/lib/supabase'
import styles from './AddToCart.module.css'

type Props = { product: Product; onClose: () => void }

export default function AddToCartModal({ product: p, onClose }: Props) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  const supplierName =
    p.supplier_id === 'tilia_romero' ? 'Tilia · Romero' :
    p.supplier_id === 'arkimueble'   ? 'Arkimueble' : 'Romero'

  const handleAdd = () => {
    addItem(p, qty)
    onClose()
  }

  const unitPrice = p.price
  const totalPrice = unitPrice ? unitPrice * qty : null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.product}>
          {p.img_url && (
            <div className={styles.img}>
              <img src={p.img_url} alt={p.name} />
            </div>
          )}
          <div className={styles.info}>
            <div className={styles.supplier}>{supplierName}</div>
            <div className={styles.name}>{p.name}</div>
            {p.dimensions_raw && <div className={styles.dims}>{p.dimensions_raw}</div>}
          </div>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Precio unitario</span>
          <span className={styles.priceVal}>
            {unitPrice ? `${unitPrice.toFixed(2).replace('.', ',')} €` : 'A consultar'}
            {unitPrice && <small> + IVA</small>}
          </span>
        </div>

        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>Cantidad</span>
          <div className={styles.qtyCtrl}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
        </div>

        {totalPrice !== null && qty > 1 && (
          <div className={styles.totalRow}>
            <span>Total ({qty} ud)</span>
            <span className={styles.totalVal}>{totalPrice.toFixed(2).replace('.', ',')} € <small>+ IVA</small></span>
          </div>
        )}

        <button className={styles.addBtn} onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h2l2.5 9h9l2-6H6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="14.5" r="1.5" fill="white"/>
            <circle cx="13.5" cy="14.5" r="1.5" fill="white"/>
          </svg>
          Añadir al pedido
        </button>
      </div>
    </>
  )
}
