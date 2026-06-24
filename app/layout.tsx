import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/ui/CartContext'
import SiteChrome from '@/components/ui/SiteChrome'
import { SITE_URL, SITE_NAME, SITE_LOCALE, SECTOR_KEYWORDS, organizationJsonLd, websiteJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Universo Hostelería — Mobiliario para bares, restaurantes y hoteles',
    template: '%s | Universo Hostelería',
  },
  description:
    'Marketplace de mobiliario profesional para hostelería en España: sillas, mesas, taburetes y mobiliario de exterior de 15+ fabricantes europeos. Precio directo de fábrica y entrega en toda España.',
  keywords: SECTOR_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'Universo Hostelería — Mobiliario para bares, restaurantes y hoteles',
    description:
      'Sillas, mesas, taburetes y mobiliario de exterior para hostelería. 15+ fabricantes europeos, precio directo de fábrica, entrega en toda España.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universo Hostelería — Mobiliario para hostelería',
    description:
      'Sillas, mesas, taburetes y mobiliario de exterior para bares, restaurantes y hoteles. Entrega en toda España.',
  },
  category: 'shopping',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="color-scheme" content="light only" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
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
