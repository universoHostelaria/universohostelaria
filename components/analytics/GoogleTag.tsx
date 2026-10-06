'use client'
import Script from 'next/script'
import { useEffect } from 'react'
import { GADS_ID, CONSENT_KEY, gtag, grantConsent } from '@/lib/analytics'

// Google tag con Consent Mode v2: todo denegado por defecto hasta que el usuario acepte.
export default function GoogleTag() {
  useEffect(() => {
    try { if (localStorage.getItem(CONSENT_KEY) === 'granted') grantConsent() } catch {}
    // Clic en WhatsApp = contacto (conversión secundaria)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href*="wa.me"]')
      if (a) gtag('event', 'whatsapp_click', { page_path: location.pathname })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <Script id="gtag-consent" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
          analytics_storage: 'denied', wait_for_update: 500
        });
        gtag('js', new Date());
        gtag('config', '${GADS_ID}');
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`} strategy="afterInteractive" />
    </>
  )
}
