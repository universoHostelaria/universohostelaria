import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/ui/CartContext'
import SiteChrome from '@/components/ui/SiteChrome'

export const metadata: Metadata = {
  title: 'Universo Hostelería — Mobiliario profesional para hostelería',
  description: 'El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos.',
  metadataBase: new URL('https://universohostelaria.es'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FFFFFF', colorScheme: 'light' }}>
        <CartProvider>
          {children}
          <SiteChrome />
        </CartProvider>
      </body>
    </html>
  )
}
