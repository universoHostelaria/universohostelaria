'use client'
import { useEffect, useState } from 'react'
import { CONSENT_KEY, grantConsent } from '@/lib/analytics'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem(CONSENT_KEY)) setOpen(true) } catch { setOpen(true) }
  }, [])
  if (!open) return null

  const choose = (v: 'granted' | 'denied') => {
    try { localStorage.setItem(CONSENT_KEY, v) } catch {}
    if (v === 'granted') grantConsent()
    setOpen(false)
  }

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <p className={styles.text}>
        Usamos cookies propias y de terceros (Google) para medir el rendimiento de nuestras campañas.
        Puedes aceptarlas o seguir navegando solo con las necesarias.
      </p>
      <div className={styles.actions}>
        <button className={styles.reject} onClick={() => choose('denied')}>Solo necesarias</button>
        <button className={styles.accept} onClick={() => choose('granted')}>Aceptar</button>
      </div>
    </div>
  )
}
