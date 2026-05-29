import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Universo Hostelería — Mobiliario profesional',
  description: 'El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos.',
  metadataBase: new URL('https://universohosteleria.es'),
  openGraph: {
    title: 'Universo Hostelería',
    description: 'Mobiliario para hostelería directo del fabricante.',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
