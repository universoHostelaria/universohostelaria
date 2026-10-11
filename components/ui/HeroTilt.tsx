'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import styles from './HeroTilt.module.css'

type Props = { image: string; alt: string; caption: string; captionSub: string; href: string }

// Producto del hero que se inclina siguiendo el ratón (perspectiva + sombra que se desplaza).
// Solo con ratón: en táctil o con «reducir movimiento» se queda quieto.
export default function HeroTilt({ image, alt, caption, captionSub, href }: Props) {
  const stage = useRef<HTMLDivElement>(null)
  const item = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = stage.current
    const hero = el?.closest('section') as HTMLElement | null
    if (!el || !hero) return
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canHover || reduce) return

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0
    const tick = () => {
      // Interpolación suave hacia la posición objetivo
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      if (item.current) {
        item.current.style.transform =
          `perspective(1300px) rotateY(${x * 18}deg) rotateX(${-y * 10}deg) translate3d(${x * 18}px, ${y * 10}px, 0)`
      }
      if (shadow.current) {
        shadow.current.style.transform = `translateX(${-x * 34}px) scaleX(${1 - Math.abs(x) * 0.14})`
        shadow.current.style.opacity = String(0.8 - y * 0.2)
      }
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(tick)
      else raf = 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick) }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const h = hero.getBoundingClientRect()
      // -1..1: posición del ratón en todo el hero respecto al centro del producto
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (h.width * 0.42)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (h.height * 0.5)))
      kick()
    }
    const onLeave = () => { tx = 0; ty = 0; kick() }
    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={stage} className={styles.stage}>
      <div className={styles.anchor}>
        <div className={styles.floor} ref={shadow} aria-hidden="true" />
        <div ref={item} className={styles.item}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={alt} className={styles.img} fetchPriority="high" />
        </div>
      </div>
      {caption && (
        <Link href={href || '/catalog'} className={styles.caption}>
          <i aria-hidden="true" />
          <b>{caption}</b>
          {captionSub && <span>{captionSub}</span>}
        </Link>
      )}
    </div>
  )
}
