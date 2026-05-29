'use client'
import { useState } from 'react'
import { useCart } from './CartContext'
import SolicitudModal from './SolicitudModal'
import styles from './CartDrawer.module.css'

const WA = 'https://wa.me/34665953186?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20con%20un%20especialista%20de%20Universo%20Hostelería.'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } = useCart()
  const [showSolicitud, setShowSolicitud] = useState(false)

  if (!isOpen) return null

  const supplierName = (id: string) =>
    id === 'tilia_romero' ? 'Tilia · Romero' :
    id === 'arkimueble'   ? 'Arkimueble' : 'Romero'

  return (
    <>
      <div className={styles.overlay} onClick={closeCart} />
      <div className={styles.drawer}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M2 3h2l2.5 9h9l2-6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="16.5" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="16.5" r="1.5" fill="currentColor"/>
            </svg>
            <span>Tu pedido</span>
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </div>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M6 9h6l7.5 27h27l6-18H18" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="27" cy="39" r="3" fill="#CCCCCC"/>
                <circle cx="39" cy="39" r="3" fill="#CCCCCC"/>
              </svg>
              <p>Tu pedido está vacío</p>
              <span>Añade productos desde el catálogo</span>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className={styles.item}>
                <div className={styles.itemImg}>
                  {item.product.img_url
                    ? <img src={item.product.img_url} alt={item.product.name} />
                    : <div className={styles.itemImgPlaceholder}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="14" rx="2" stroke="#CCC" strokeWidth="1.3"/>
                          <circle cx="9" cy="10" r="2" stroke="#CCC" strokeWidth="1.3"/>
                          <path d="M3 17l5-4 4 3 3-2 6 3" stroke="#CCC" strokeWidth="1.3" strokeLinejoin="round"/>
                        </svg>
                      </div>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemSupplier}>{supplierName(item.product.supplier_id)}</div>
                  <div className={styles.itemName}>{item.product.name}</div>
                  {item.product.price ? (
                    <div className={styles.itemPrice}>
                      {(item.product.price * item.quantity).toFixed(2).replace('.', ',')} €{' '}
                      <span>+ IVA</span>
                    </div>
                  ) : (
                    <div className={styles.itemPrice}>Precio a consultar</div>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qtyCtrl}>
                    <button onClick={() => updateQty(item.product.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.product.id)} aria-label="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            {total > 0 && (
              <div className={styles.totalRow}>
                <span>Total estimado</span>
                <span className={styles.totalVal}>
                  {total.toFixed(2).replace('.', ',')} € <small>+ IVA</small>
                </span>
              </div>
            )}
            <p className={styles.footerNote}>
              Nuestro especialista revisará tu solicitud y te enviará una oferta con precios y plazos.
            </p>
            <button className={styles.btnWa} onClick={() => window.open(WA, '_blank')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hablar con nuestro especialista
            </button>
            <button className={styles.btnEmail} onClick={() => { closeCart(); setShowSolicitud(true) }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1.5 6l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              Enviar solicitud
            </button>
          </div>
        )}
      </div>

      {showSolicitud && (
        <SolicitudModal onClose={() => setShowSolicitud(false)} />
      )}
    </>
  )
}
