import { SITE_URL } from '@/lib/seo'

export const WA_NUMBER = '34665953186'

// Enlace de WhatsApp con el producto ya escrito en el mensaje
export function waProductUrl(p: { id: string; name: string }) {
  const text = `Hola, me interesa «${p.name}» (${SITE_URL}/product/${p.id}). ¿Me podéis pasar presupuesto?`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}
