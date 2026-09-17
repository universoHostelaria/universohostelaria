// Tablas de variantes (acabado × medida → precio SIN IVA) por producto.
// Fuente de verdad: columna products.variants (jsonb), editable desde el CMS.
// Aquí vive además una tabla por defecto (fallback/seed) por producto.

export type Finish = { key: string; label: string; desc: string }

export type VariantGrid = {
  sizes: string[]
  finishes: Finish[]
  // prices[size][finishKey] = precio sin IVA; null = no disponible
  prices: Record<string, Record<string, number | null>>
  defaultSize: string
  defaultFinish: string
  note?: string
}

// Descripción por defecto de acabados conocidos (se rellena sola en el CMS)
const FINISH_DESC: Record<string, string> = {
  'melamina': 'Económico y resistente',
  'werzalit': 'Resina, apto exterior',
  'compact b.': 'HPL, máxima resistencia',
  'compact p.': 'HPL premium',
  'chapado': 'Madera natural',
}

export function finishKey(label: string): string {
  return (
    label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '') || 'x'
  )
}
function finishDesc(label: string): string {
  return FINISH_DESC[label.toLowerCase().trim()] ?? ''
}

const MESA_3020: VariantGrid = {
  sizes: ['Ø60', 'Ø70', 'Ø80', '60×60', '70×70', '80×80', '90×90'],
  finishes: [
    { key: 'melamina', label: 'Melamina', desc: 'Económico y resistente' },
    { key: 'werzalit', label: 'Werzalit', desc: 'Resina, apto exterior' },
    { key: 'compactb', label: 'Compact B.', desc: 'HPL, máxima resistencia' },
    { key: 'compactp', label: 'Compact P.', desc: 'HPL premium' },
    { key: 'chapado', label: 'Chapado', desc: 'Madera natural' },
  ],
  prices: {
    'Ø60':   { melamina: 140, werzalit: 144, compactb: 187, compactp: 192, chapado: 207 },
    'Ø70':   { melamina: 148, werzalit: 150, compactb: 206, compactp: 220, chapado: 225 },
    'Ø80':   { melamina: null, werzalit: null, compactb: 245, compactp: 250, chapado: 265 },
    '60×60': { melamina: 116, werzalit: 164, compactb: 179, compactp: 184, chapado: 165 },
    '70×70': { melamina: 125, werzalit: 185, compactb: 198, compactp: 212, chapado: 185 },
    '80×80': { melamina: 137, werzalit: 196, compactb: 237, compactp: 242, chapado: 213 },
    '90×90': { melamina: 149, werzalit: null, compactb: 361, compactp: 374, chapado: null },
  },
  defaultSize: '60×60',
  defaultFinish: 'melamina',
  note: 'Base 40×40 cm para tableros hasta 80×80; base 60×60 cm para 90×90. Pintura estándar en blanco o negro (otros colores +9 €).',
}

const DEFAULTS: Record<string, VariantGrid> = { RM1825: MESA_3020, RM1805: MESA_3020 }

// Tabla por defecto (fallback cuando la BD no tiene variants)
export function getVariants(productId: string): VariantGrid | null {
  return DEFAULTS[productId] ?? null
}

// Valida/normaliza el jsonb que viene de la BD
export function normalizeGrid(x: unknown): VariantGrid | null {
  if (!x || typeof x !== 'object') return null
  const g = x as Partial<VariantGrid>
  if (!Array.isArray(g.sizes) || !Array.isArray(g.finishes) || !g.prices || typeof g.prices !== 'object') return null
  if (!g.sizes.length || !g.finishes.length) return null
  const finishes: Finish[] = (g.finishes as Partial<Finish>[]).map((f) => ({
    key: String(f.key ?? ''), label: String(f.label ?? ''), desc: String(f.desc ?? ''),
  }))
  return {
    sizes: g.sizes.map(String),
    finishes,
    prices: g.prices as VariantGrid['prices'],
    defaultSize: String(g.defaultSize ?? g.sizes[0]),
    defaultFinish: String(g.defaultFinish ?? finishes[0].key),
    note: g.note ? String(g.note) : undefined,
  }
}

// CMS: grid -> CSV. Primera fila = acabados; cada fila = medida + precios sin IVA.
export function gridToCsv(g: VariantGrid): string {
  const head = ['Medida', ...g.finishes.map((f) => f.label)].join(', ')
  const rows = g.sizes.map((s) =>
    [s, ...g.finishes.map((f) => { const p = g.prices[s]?.[f.key]; return p == null ? '-' : String(p) })].join(', ')
  )
  return [head, ...rows].join('\n')
}

// CMS: CSV -> grid ('-' o vacío = no disponible). Acepta separadores , ; o tab.
export function csvToGrid(csv: string, note?: string): VariantGrid | null {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const split = (l: string) => l.split(/[,;\t]/).map((c) => c.trim())
  const head = split(lines[0]).slice(1).filter(Boolean)
  if (!head.length) return null
  const finishes: Finish[] = head.map((label) => ({ key: finishKey(label), label, desc: finishDesc(label) }))
  const sizes: string[] = []
  const prices: VariantGrid['prices'] = {}
  for (const line of lines.slice(1)) {
    const cells = split(line)
    const size = cells[0]
    if (!size) continue
    sizes.push(size)
    prices[size] = {}
    finishes.forEach((f, i) => {
      const raw = (cells[i + 1] ?? '').replace('€', '').replace(',', '.').trim()
      const n = raw === '' || raw === '-' ? NaN : parseFloat(raw)
      prices[size][f.key] = Number.isFinite(n) && n > 0 ? n : null
    })
  }
  if (!sizes.length) return null
  let defaultSize = sizes[0]
  let defaultFinish = finishes[0].key
  outer: for (const s of sizes) for (const f of finishes) if (prices[s][f.key] != null) { defaultSize = s; defaultFinish = f.key; break outer }
  return { sizes, finishes, prices, defaultSize, defaultFinish, note: note || undefined }
}
