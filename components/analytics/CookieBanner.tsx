'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CONSENT_KEY, grantConsent } from '@/lib/analytics'
import styles from './CookieBanner.module.css'

// Aviso discreto: sin aceptación, Consent Mode queda denegado y Google Ads casi no ve conversiones.
export default function CookieBanner() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    try { if (!localStorage.getItem(CONSENT_KEY)) setOpen(true) } catch { setOpen(true) }
  }, [])
  if (!open || pathname?.startsWith('/admin')) return null

  const choose = (v: 'granted' | 'denied') => {
    try { localStorage.setItem(CONSENT_KEY, v) } catch {}
    if (v === 'granted') grantConsent()
    setOpen(false)
  }

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
      <p className={styles.text}>Usamos cookies para medir nuestras campañas.</p>
      <button className={styles.accept} onClick={() => choose('granted')}>Aceptar</button>
      <button className={styles.close} onClick={() => choose('denied')} aria-label="Solo cookies necesarias" title="Solo necesarias">×</button>
    </div>
  )
}
