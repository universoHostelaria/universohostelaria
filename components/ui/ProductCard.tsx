'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/supabase'
import styles from './ProductCard.module.css'

type Props = { product: Product; view?: 'grid' | 'list' }

export default function ProductCard({ product: p, view = 'grid' }: Props) {
  const isListView = view === 'list'

  return (
    <Link href={`/product/${p.id}`} className={`${styles.card} ${isListView ? styles.listView : ''}`}>
      {/* Image */}
      <div className={styles.imgWrap}>
        {p.img_url ? (
          <Image
            src={p.img_url}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.img}
          />
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

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.supplier}>{p.supplier_id?.replace('_',' ').replace('tilia romero','Tilia · Romero').replace('arkimueble','Arkimueble').replace('romero','Romero')}</div>
        <div className={styles.name}>{p.name}</div>
        {!isListView && <div className={styles.dims}>{p.dimensions_raw || p.category}</div>}
        {isListView && (
          <div className={styles.dims}>{p.category} · {p.material} · {p.dimensions_raw || '—'}</div>
        )}
        <div className={styles.footer}>
          <div>
            <div className={styles.price}>{p.price_display}</div>
            <div className={styles.priceNote}>+ IVA</div>
          </div>
          <button
            className={styles.addBtn}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              const btn = e.currentTarget
              btn.innerHTML = '✓'
              btn.style.background = '#16A34A'
              setTimeout(() => {
                btn.innerHTML = '+'
                btn.style.background = ''
              }, 1400)
            }}
            aria-label="Añadir al pedido"
          >+</button>
        </div>
      </div>
    </Link>
  )
}
