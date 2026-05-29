'use client'
import { useCart } from './CartContext'
import styles from './CartButton.module.css'

export default function CartButton() {
  const { count, openCart } = useCart()
  if (count === 0) return null
  return (
    <button className={styles.btn} onClick={openCart} aria-label="Ver pedido">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 3h2l2.5 9h9l2-6H6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="16.5" r="1.5" fill="white"/>
        <circle cx="15" cy="16.5" r="1.5" fill="white"/>
      </svg>
      <span className={styles.label}>Ver pedido</span>
      <span className={styles.badge}>{count}</span>
    </button>
  )
}
