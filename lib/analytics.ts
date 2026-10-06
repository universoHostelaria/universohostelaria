// Google Ads (gtag.js) — ID de la etiqueta y helpers de eventos.
export const GADS_ID = 'AW-18495865106'
// Etiqueta de la acción de conversión "Enviar formulario de lead" (Google Ads → Conversiones → snippet de evento).
export const GADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GADS_LEAD_LABEL ?? 'ARDJCI_4jZIdEJKCwvNE'

export const CONSENT_KEY = 'uh_consent'

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

export function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(args)
}

export function grantConsent() {
  gtag('consent', 'update', {
    ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted',
  })
}

// Lead enviado (página /gracias)
export function trackLead(ref?: string | null) {
  gtag('event', 'generate_lead', { lead_ref: ref ?? undefined })
  if (GADS_LEAD_LABEL) gtag('event', 'conversion', { send_to: `${GADS_ID}/${GADS_LEAD_LABEL}`, value: 1.0, currency: 'BRL' })
}
