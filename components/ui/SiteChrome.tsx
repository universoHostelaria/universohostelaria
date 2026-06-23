'use client'

import { usePathname } from 'next/navigation'
import CartDrawer from '@/components/ui/CartDrawer'
import CartButton from '@/components/ui/CartButton'

// Elementos flutuantes do site público (carrinho). Não aparecem no /admin.
export default function SiteChrome() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return (
    <>
      <CartDrawer />
      <CartButton />
    </>
  )
}
