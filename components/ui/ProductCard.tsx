'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'
import { priceConIva, formatEUR } from '@/lib/price'
import { trackWhatsApp } from '@/lib/analytics'
import { waProductUrl } from '@/lib/whatsapp'
import AddToCartModal from './AddToCartModal'
import styles from './ProductCard.module.css'

type Props = { product: Product; view?: 'grid' | 'list' }

export default function ProductCard({ product: p, view = 'grid' }: Props) {
  const isListView = view === 'list'
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Link href={`/product/${p.id}`} className={`${styles.card} ${isListView ? styles.listView : ''}`}>
        <div className={styles.imgWrap}>
          {p.img_url ? (
            <Image src={p.img_url} alt={p.name} fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={styles.img} />
          ) : (
            <div className={styles.imgPlaceholder}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="10" width="32" height="22" rx="4" stroke="#CCCCCC" strokeWidth="1.5"/>
                <path d="M8 32h32" stroke="#CCCCCC" strokeWidth="1.5"/>
                <rect x="16" y="32" width="4" height="8" rx="2" fill="#CCCCCC"/>
                <rect x="28" y="32" width="4" height="8" rx="2" fill="#CCCCCC"/>
              </svg>
            </div>
          )}
          <div className={styles.badges}>
            {p.is_new && <span className="badge badge-black">Nuevo</span>}
            {p.uso === 'Exterior' && <span className="badge badge-green">Outdoor</span>}
            {p.catas_certified && <span className="badge badge-blue">CATAS</span>}
          </div>
        </div>
        <div className={styles.info}>
          {p.category && <div className={styles.supplier}>{p.category}</div>}
          <div className={styles.name}>{p.name}</div>
          <div className={styles.dims}>{isListView ? `${p.category} · ${p.material} · ${p.dimensions_raw || '—'}` : (p.dimensions_raw || p.category)}</div>
          <div className={styles.footer}>
            <div className={styles.priceWrap}>
              <div className={priceConIva(p.price) ? styles.price : styles.priceAsk}>{priceConIva(p.price) ? formatEUR(priceConIva(p.price)!) : p.price_display}</div>
              <div className={styles.priceNote}>{priceConIva(p.price) ? 'IVA incluido' : ''}</div>
            </div>
            <div className={styles.actions}>
              {/* Dentro del <Link> de la tarjeta no puede ir otro <a>: botón que abre WhatsApp */}
              <button className={styles.waBtn}
                onClick={e => {
                  e.preventDefault(); e.stopPropagation()
                  trackWhatsApp(location.pathname)
                  window.open(waProductUrl(p), '_blank', 'noopener')
                }}
                aria-label="Pedir presupuesto por WhatsApp" title="Pedir presupuesto por WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.5 3.5 0 0 0-1.1 2.6 6 6 0 0 0 1.3 3.2 13.8 13.8 0 0 0 5.3 4.7c2 .8 2.7.9 3.7.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.1-.3-.2-.6-.3zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/>
                </svg>
              </button>
              <button className={styles.addBtn}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setShowModal(true) }}
                aria-label="Añadir al pedido">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>
      {showModal && <AddToCartModal product={p} onClose={() => setShowModal(false)} />}
    </>
  )
}
