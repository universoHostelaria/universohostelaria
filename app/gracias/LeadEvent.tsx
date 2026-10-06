'use client'
import { useEffect } from 'react'
import { trackLead } from '@/lib/analytics'

// Dispara la conversión una sola vez por solicitud (ni StrictMode ni recargas la duplican).
export default function LeadEvent({ refId }: { refId: string | null }) {
  useEffect(() => {
    const key = `uh_lead_${refId ?? 'noref'}`
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1') } catch {}
    trackLead(refId)
  }, [refId])
  return null
}
