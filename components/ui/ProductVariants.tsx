'use client'

import { useState } from 'react'
import type { VariantGrid } from '@/lib/variants'
import { priceConIva, formatEUR } from '@/lib/price'
import styles from './ProductVariants.module.css'

export default function ProductVariants({ variants: v }: { variants: VariantGrid }) {
  const [size, setSize] = useState(v.defaultSize)
  const [finish, setFinish] = useState(v.defaultFinish)

  const base = v.prices[size]?.[finish] ?? null
  const final = priceConIva(base)
  const finishLabel = v.finishes.find((f) => f.key === finish)?.label ?? finish

  return (
    <section className={styles.wrap}>
      <hr className="divider" style={{ marginBottom: 48 }} />
      <div className="eyebrow">Acabados y medidas</div>
      <h2 className={styles.title}>
        ELIGE TU <span>COMBINACIÓN</span>
      </h2>

      {/* Resumen de la selección */}
      <div className={styles.selected}>
        <div className={styles.selLeft}>
          <span className={styles.selLabel}>Seleccionado</span>
          <span className={styles.selCombo}>
            {size} <i>·</i> {finishLabel}
          </span>
        </div>
        <div className={styles.selRight}>
          {final ? (
            <>
              <span className={styles.selPrice}>{formatEUR(final)}</span>
              <span className={styles.selNote}>IVA incluido · {formatEUR(base!)} sin IVA</span>
            </>
          ) : (
            <span className={styles.selPrice}>Consultar</span>
          )}
        </div>
      </div>

      {/* Leyenda de acabados */}
      <div className={styles.legend}>
        {v.finishes.map((f) => (
          <button
            key={f.key}
            className={`${styles.chip} ${f.key === finish ? styles.chipOn : ''}`}
            onClick={() => setFinish(f.key)}
          >
            <span className={styles.chipName}>{f.label}</span>
            <span className={styles.chipDesc}>{f.desc}</span>
          </button>
        ))}
      </div>

      {/* Matriz medida × acabado */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSize}>Medida (cm)</th>
              {v.finishes.map((f) => (
                <th key={f.key} className={f.key === finish ? styles.thOn : ''}>{f.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.sizes.map((s) => (
              <tr key={s} className={s === size ? styles.rowOn : ''}>
                <td className={styles.tdSize}>{s}</td>
                {v.finishes.map((f) => {
                  const p = v.prices[s]?.[f.key] ?? null
                  const pc = priceConIva(p)
                  const on = s === size && f.key === finish
                  return (
                    <td key={f.key} className={styles.td}>
                      {pc ? (
                        <button
                          className={`${styles.cell} ${on ? styles.cellOn : ''}`}
                          onClick={() => { setSize(s); setFinish(f.key) }}
                          aria-pressed={on}
                        >
                          {formatEUR(pc)}
                        </button>
                      ) : (
                        <span className={styles.na}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {v.note && <p className={styles.note}>{v.note}</p>}
    </section>
  )
}
