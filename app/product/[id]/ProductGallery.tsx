'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from './product.module.css'

type Badge = { label: string; cls: string }

export default function ProductGallery({
  images,
  name,
  badges,
}: {
  images: string[]
  name: string
  badges: Badge[]
}) {
  const imgs = images.filter(Boolean)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const go = useCallback(
    (dir: number) => setActive((a) => (imgs.length ? (a + dir + imgs.length) % imgs.length : 0)),
    [imgs.length]
  )

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, go])

  if (!imgs.length) {
    return (
      <div className={styles.gallery}>
        <div className={styles.mainImg}>
          <div className={styles.imgPlaceholder}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="10" y="15" width="60" height="40" rx="6" stroke="#CCCCCC" strokeWidth="2" />
              <path d="M10 55h60" stroke="#CCCCCC" strokeWidth="2" />
              <rect x="28" y="55" width="8" height="14" rx="3" fill="#CCCCCC" />
              <rect x="44" y="55" width="8" height="14" rx="3" fill="#CCCCCC" />
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      <button className={styles.mainImg} onClick={() => setLightbox(true)} aria-label="Ampliar imagen">
        {imgs.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${name} — imagen ${i + 1}`}
            fill
            sizes="(max-width:768px) 100vw, 55vw"
            className={`${styles.mainImgEl} ${i === active ? styles.mainImgActive : ''}`}
            priority={i === 0}
          />
        ))}
        <span className={styles.zoomHint} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div className={styles.badges}>
          {badges.map((b) => (
            <span key={b.label} className={`badge ${b.cls}`}>{b.label}</span>
          ))}
        </div>
      </button>

      {imgs.length > 1 && (
        <div className={styles.thumbs}>
          {imgs.map((src, i) => (
            <button
              key={src}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="90px" className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(false)}>
          <button className={styles.lbClose} aria-label="Cerrar">×</button>
          {imgs.length > 1 && (
            <button className={`${styles.lbNav} ${styles.lbPrev}`} onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Anterior">‹</button>
          )}
          <div className={styles.lbStage} onClick={(e) => e.stopPropagation()}>
            <Image src={imgs[active]} alt={`${name} — imagen ${active + 1}`} fill sizes="90vw" className={styles.lbImg} />
          </div>
          {imgs.length > 1 && (
            <button className={`${styles.lbNav} ${styles.lbNext}`} onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Siguiente">›</button>
          )}
          {imgs.length > 1 && <div className={styles.lbCount}>{active + 1} / {imgs.length}</div>}
        </div>
      )}
    </div>
  )
}
