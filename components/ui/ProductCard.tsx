'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'
import AddToCartModal from './AddToCartModal'
import styles from './ProductCard.module.css'

type Props = { product: Product; view?: 'grid' | 'list' }

export default function ProductCard({ product: p, view = 'grid' }: Props) {
  const isListView = view === 'list'
  const [showModal, setShowModal] = useState(false)

  const supplierName =
    p.supplier_id === 'tilia_romero' ? 'Tilia · Romero' :
    p.supplier_id === 'arkimueble'   ? 'Arkimueble' : 'Romero'

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
          <div className={styles.supplier}>{supplierName}</div>
          <div className={styles.name}>{p.name}</div>
          <div className={styles.dims}>{isListView ? `${p.category} · ${p.material} · ${p.dimensions_raw || '—'}` : (p.dimensions_raw || p.category)}</div>
          <div className={styles.footer}>
            <div>
              <div className={styles.price}>{p.price_display}</div>
              <div className={styles.priceNote}>+ IVA</div>
            </div>
            <button className={styles.addBtn}
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowModal(true) }}
              aria-label="Añadir al pedido">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </Link>
      {showModal && <AddToCartModal product={p} onClose={() => setShowModal(false)} />}
    </>
  )
}
