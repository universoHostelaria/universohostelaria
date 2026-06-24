// ─────────────────────────────────────────────────────────────
// Configuração central de SEO (setor: mobiliario de hostelería).
// ─────────────────────────────────────────────────────────────

export const SITE_URL = 'https://universohostelaria.es'
export const SITE_NAME = 'Universo Hostelería'
export const SITE_LOCALE = 'es_ES'

// Palavras-chave do setor em espanhol (España).
export const SECTOR_KEYWORDS = [
  'mobiliario de hostelería',
  'muebles para hostelería',
  'mobiliario para bares',
  'mobiliario para restaurantes',
  'mobiliario para hoteles',
  'sillas para hostelería',
  'sillas para bares y restaurantes',
  'mesas para hostelería',
  'mesas de terraza',
  'taburetes de bar',
  'sillones para hostelería',
  'mobiliario de exterior',
  'mobiliario de terraza',
  'mobiliario contract',
  'equipamiento para hostelería',
  'muebles de terraza profesionales',
  'mobiliario hostelería España',
]

export const SUPPLIER_NAMES: Record<string, string> = {
  tilia_romero: 'Tilia · Romero',
  arkimueble: 'Arkimueble',
  romero: 'Romero',
}

export function supplierName(id: string | null | undefined): string {
  if (!id) return SITE_NAME
  return SUPPLIER_NAMES[id] ?? SITE_NAME
}

// JSON-LD da organização (presente em todas as páginas).
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Marketplace de mobiliario profesional para hostelería en España: sillas, mesas, taburetes y mobiliario de exterior de fabricantes europeos.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Barcelona',
      addressCountry: 'ES',
    },
    areaServed: 'ES',
    sameAs: [] as string[],
  }
}

// JSON-LD do site + caixa de busca (sitelinks search box).
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-ES',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
