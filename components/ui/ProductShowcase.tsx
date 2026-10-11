'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Product } from '@/lib/supabase'
import type { ShowcaseItem } from '@/lib/home-content'
import { priceConIva, formatEUR } from '@/lib/price'
import { supplierName } from '@/lib/seo'
import { getVariants, normalizeGrid } from '@/lib/variants'
import { useCart } from './CartContext'
import styles from './ProductShowcase.module.css'

type Entry = { item: ShowcaseItem; product: Product }

// Vitrina de la home: un bloque por producto con su foto ambientada de fondo.
// «Añadir al pedido» mete 1 unidad y abre el carrito directamente (sin pasos intermedios).
export default function ProductShowcase({ entries }: { entries: Entry[] }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  if (!entries.length) return null

  return (
    <div className={styles.grid}>
      {entries.map(({ item, product: p }, i) => {
        const price = priceConIva(p.price)
        const href = `/product/${p.id}`
        const hasVariants = !!(normalizeGrid(p.variants) ?? getVariants(p.id))
        return (
          <article key={p.id} className={`${styles.tile} ${i < 2 ? styles.big : ''}`}>
            <Image
              src={item.image || p.img_url || ''}
              alt={`${p.name} en un local de hostelería`}
              fill
              sizes={i < 2 ? '(max-width: 760px) 100vw, 50vw' : '(max-width: 760px) 100vw, 33vw'}
              className={styles.img}
              priority={i < 2}
            />
            <div className={styles.shade} />
            {/* Toda la tarjeta lleva a la ficha; los botones quedan por encima */}
            <Link href={href} className={styles.cover} aria-label={`Ver ${p.name}`} />

            <div className={styles.top}>
              {p.category && <span className={styles.chip}>{p.category}</span>}
              {p.uso === 'Exterior' && <span className={styles.chip}>Exterior</span>}
            </div>

            <div className={styles.body}>
              {p.supplier_id && <div className={styles.supplier}>{supplierName(p.supplier_id)}</div>}
              <h3 className={styles.name}>{p.name}</h3>
              {item.tagline && <p className={styles.tagline}>{item.tagline}</p>}
              <div className={styles.foot}>
                <div className={styles.price}>
                  {price ? (
                    <>
                      {hasVariants && <span className={styles.from}>Desde</span>}
                      {formatEUR(price)}
                      <small>IVA incl.</small>
                    </>
                  ) : (
                    <span className={styles.ask}>Precio a consultar</span>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.add}
                    onClick={() => { addItem(p, 1); setAdded(p.id); setTimeout(() => setAdded(null), 1600) }}
                  >
                    {added === p.id ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Añadido
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        Añadir al pedido
                      </>
                    )}
                  </button>
                  <Link href={href} className={styles.more}>
                    Ver ficha
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
