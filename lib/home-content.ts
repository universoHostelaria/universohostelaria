// ─────────────────────────────────────────────────────────────
// Conteúdo editável da HOME.
// DEFAULT_HOME_CONTENT = valores atuais (fallback). O CMS grava
// overrides em site_content(key='home'); getHomeContent() faz o
// deep-merge do banco por cima destes padrões.
// ─────────────────────────────────────────────────────────────

export type Link = { label: string; href: string }
export type Stat = { val: string; sup: string; label: string }
export type CatCard = { n: string; name: string; count: string; href: string }
export type WhyItem = { num: string; title: string; desc: string }
export type Step = { num: string; title: string; desc: string }
export type SupItem = { badge: string; name: string; href: string }
export type FooterCol = { label: string; links: Link[] }

export type HomeContent = {
  seo: { title: string; description: string }
  whatsappUrl: string
  logo: string
  nav: { links: Link[]; searchText: string; ctaLabel: string }
  announcement: { textHtml: string; linkLabel: string }
  hero: {
    image: string
    titleHtml: string
    subtitleHtml: string
    cta1: Link
    cta2Label: string
    stats: Stat[]
  }
  trust: string[]
  categories: { eyebrow: string; titleHtml: string; ctaLabel: string; ctaHref: string; cards: CatCard[] }
  featured: { eyebrow: string; titleHtml: string; ctaLabel: string; ctaHref: string }
  break1Image: string
  why: { eyebrow: string; titleHtml: string; items: WhyItem[] }
  split: { image: string; eyebrow: string; titleHtml: string; text: string; ctaLabel: string; ctaHref: string }
  specialist: { image: string; tag: string; titleHtml: string; text: string; features: string[]; ctaLabel: string }
  break2Image: string
  suppliers: { label: string; items: SupItem[]; ctaLabel: string; ctaHref: string }
  how: { eyebrow: string; titleHtml: string; steps: Step[] }
  footer: {
    name: string
    desc: string
    location: string
    email: string
    cols: FooterCol[]
    copyright: string
    tagline: string
  }
}

const WA =
  'https://wa.me/34665953186?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20con%20un%20especialista%20de%20Universo%20Hostelería.'

export const DEFAULT_HOME_CONTENT: HomeContent = {
  seo: {
    title: 'Universo Hostelería — Mobiliario profesional para hostelería',
    description:
      'El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos.',
  },
  whatsappUrl: WA,
  logo: '',
  nav: {
    links: [
      { label: 'Catálogo', href: '/catalog' },
      { label: 'Sillas & Taburetes', href: '/catalog?category=Sillas' },
      { label: 'Mesas', href: '/catalog?category=Mesas' },
      { label: 'Exterior', href: '/catalog?uso=Exterior' },
    ],
    searchText: 'Buscar en 10.000+ productos…',
    ctaLabel: 'Reservar cita',
  },
  announcement: {
    textHtml: '<strong>Nuevo:</strong> 15+ fabricantes, 10.000+ productos en un solo lugar',
    linkLabel: 'Habla hoy con nuestro especialista →',
  },
  hero: {
    image: '',
    titleHtml: 'GRAN<br />HOSTELERÍA<br /><span class="blue">EMPIEZA<br />AQUÍ.</span>',
    subtitleHtml:
      'Más de <strong>10.000 productos</strong> de <strong>15+ fabricantes</strong> europeos. Elige, compara y pide directo — con un especialista cuando lo necesites.',
    cta1: { label: 'Ver el catálogo', href: '/catalog' },
    cta2Label: 'Hablar con el especialista',
    stats: [
      { val: '10K', sup: '+', label: 'Productos' },
      { val: '15', sup: '+', label: 'Fabricantes' },
      { val: '15', sup: 'años', label: 'De experiencia' },
    ],
  },
  trust: [
    '15+ fabricantes curados',
    'Entrega en toda España',
    'Especialista dedicado',
    'Envío gratis desde 300 €',
    '15 años en el mercado',
  ],
  categories: {
    eyebrow: 'Categorías',
    titleHtml: 'ENCUENTRA<br />LO QUE <span class="blue">NECESITAS.</span>',
    ctaLabel: 'Ver catálogo completo',
    ctaHref: '/catalog',
    cards: [
      { n: '01', name: 'SILLAS', count: '+480 referencias', href: '/catalog?category=Sillas' },
      { n: '02', name: 'MESAS', count: '+240 referencias', href: '/catalog?category=Mesas' },
      { n: '03', name: 'TABURETES', count: '+180 referencias', href: '/catalog?category=Taburetes' },
      { n: '04', name: 'EXTERIOR', count: '+320 referencias', href: '/catalog?uso=Exterior' },
      { n: '05', name: 'SILLONES', count: '+150 referencias', href: '/catalog?category=Sillones' },
      { n: '06', name: 'SOMBRILLAS', count: '+90 referencias', href: '/catalog?category=Sombrillas' },
      { n: '07', name: 'LOUNGE', count: '+200 referencias', href: '/catalog?category=Sofás' },
      { n: '10K+', name: 'VER TODO', count: 'Todo el catálogo', href: '/catalog' },
    ],
  },
  featured: {
    eyebrow: 'Selección',
    titleHtml: 'PRODUCTOS <span class="blue">DESTACADOS</span>',
    ctaLabel: 'Ver todos',
    ctaHref: '/catalog',
  },
  break1Image: '',
  why: {
    eyebrow: 'Por qué elegirnos',
    titleHtml: 'EL PODER<br />DE <span class="blue">ELEGIR SOLO.</span>',
    items: [
      {
        num: '15+',
        title: 'FABRICANTES EN UN SOLO LUGAR',
        desc: 'Accede a los mejores fabricantes europeos sin buscarlos uno a uno. Todo curado, todo comparado, todo en un solo sitio. Tú eliges con criterio, no con suerte.',
      },
      {
        num: '0€',
        title: 'DE COMISIONES EXTRA',
        desc: 'Precio directo del fabricante a tu local. Sin capas, sin markups ocultos, sin tener que pasar por nadie. Tu presupuesto va íntegro al mobiliario.',
      },
      {
        num: '360°',
        title: 'ACOMPAÑAMIENTO TOTAL',
        desc: 'Desde la primera búsqueda hasta la instalación: colores, plazos, volúmenes, configuración de espacios. Un especialista real responde tus dudas.',
      },
    ],
  },
  split: {
    image: '',
    eyebrow: 'Exterior & Terraza',
    titleHtml: 'MUEBLES<br />QUE <span class="blue">AGUANTAN</span><br />TODO.',
    text: 'UV, lluvia, sal marina, el mal humor de los lunes. Nuestra selección de exterior está testada para entornos hosteleros exigentes. Calidad que no pide mantenimiento.',
    ctaLabel: 'Ver colección exterior',
    ctaHref: '/catalog?uso=Exterior',
  },
  specialist: {
    image: '',
    tag: 'Servicio gratuito',
    titleHtml: 'TU PROYECTO.<br />NUESTRO <span class="blue">ESPECIALISTA.</span>',
    text: '¿Abres un restaurante? ¿Renuevás la terraza? Reserva una cita y lo resolvemos juntos. Sin compromiso, sin letra pequeña.',
    features: [
      'Colores, materiales y acabados a medida',
      'Planificación de plazos y preparación del pedido',
      'Videollamada, teléfono o visita en Barcelona',
      '15 años de experiencia en proyectos de hostelería',
    ],
    ctaLabel: 'Reservar cita gratuita',
  },
  break2Image: '',
  suppliers: {
    label: 'NUESTROS FABRICANTES',
    items: [
      { badge: 'T', name: 'Tilia', href: '/catalog' },
      { badge: 'R', name: 'Romero', href: '/catalog' },
      { badge: 'A', name: 'Arkimueble', href: '/catalog' },
      { badge: '+12', name: 'Más marcas', href: '/catalog' },
    ],
    ctaLabel: 'Ver todos los fabricantes',
    ctaHref: '/catalog',
  },
  how: {
    eyebrow: 'Proceso',
    titleHtml: '4 PASOS.<br /><span class="blue">TAN FÁCIL.</span>',
    steps: [
      { num: '01', title: 'EXPLORA', desc: '10.000+ productos de 15+ fabricantes. Filtra, compara, guarda favoritos.' },
      { num: '02', title: 'HABLA CON EL ESPECIALISTA', desc: 'Cita gratuita para afinar plazos, colores y cantidades.' },
      { num: '03', title: 'CONFIRMA EL PEDIDO', desc: 'Factura proforma directa al fabricante. Sin sorpresas.' },
      { num: '04', title: 'RECIBE EN TU LOCAL', desc: 'Entrega coordinada en toda España. Te acompañamos hasta el final.' },
    ],
  },
  footer: {
    name: 'Universo Hostelería',
    desc: 'El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos, un especialista para ti.',
    location: 'Barcelona, España',
    email: 'hola@universohosteleria.es',
    cols: [
      {
        label: 'CATÁLOGO',
        links: [
          { label: 'Sillas', href: '/catalog?category=Sillas' },
          { label: 'Mesas', href: '/catalog?category=Mesas' },
          { label: 'Taburetes', href: '/catalog?category=Taburetes' },
          { label: 'Exterior', href: '/catalog?uso=Exterior' },
          { label: 'Lounge', href: '/catalog?category=Sofás' },
        ],
      },
      {
        label: 'EMPRESA',
        links: [
          { label: 'Sobre nosotros', href: '/#especialista' },
          { label: 'Fabricantes', href: '/catalog' },
          { label: 'Cómo funciona', href: '/#como-funciona' },
          { label: 'Blog', href: '/' },
        ],
      },
      {
        label: 'SOPORTE',
        links: [
          { label: 'Cita con especialista', href: '/#especialista' },
          { label: 'Contacto', href: 'mailto:hola@universohosteleria.es' },
          { label: 'Envíos', href: '/#como-funciona' },
          { label: 'Aviso legal', href: '/' },
          { label: 'Privacidad', href: '/' },
        ],
      },
    ],
    copyright: '© 2026 Universo Hostelería · Barcelona',
    tagline: 'El mayor marketplace de mobiliario para hostelería en España',
  },
}

// Deep-merge: objetos planos recursivos; arrays e primitivos = override
// substitui o default quando presente.
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : (override as T))
  }
  const out: Record<string, unknown> = { ...base }
  for (const key of Object.keys(override)) {
    const o = override[key]
    if (o === undefined) continue
    out[key] = isPlainObject((base as Record<string, unknown>)[key])
      ? deepMerge((base as Record<string, unknown>)[key], o)
      : o
  }
  return out as T
}
