import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)

// ── Types ──────────────────────────────────────────────────────
export type Product = {
  id:               string
  supplier_id:      string
  name:             string
  category:         string | null
  uso:              string | null
  material:         string | null
  features:         string | null
  dimensions_raw:   string | null
  weight_kg:        string | null
  price:            number | null
  price_display:    string
  is_new:           boolean
  catas_certified:  boolean
  img_url:          string | null
  cod_interno:      string | null
  cod_comercial:    string | null
  alto_asiento:     string | null
  modelo:           string | null
  source:           string | null
  active:           boolean
  created_at:       string
}

export type FilterState = {
  category:  string[]
  uso:       string[]
  material:  string[]
  isNew:     boolean
  priceMin:  number
  priceMax:  number | null
  search:    string
}

// ── Query helpers ──────────────────────────────────────────────

export async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .not('img_url', 'is', null)       // only products WITH images
    .order('is_new', { ascending: false })
    .limit(4)
  return data || []
}

export async function getProducts(
  filters: Partial<FilterState> = {},
  page = 1,
  perPage = 24
) {
  let q = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('active', true)
    .not('img_url', 'is', null)       // only products WITH images

  if (filters.category?.length)  q = q.in('category', filters.category)
  if (filters.uso?.length)       q = q.in('uso', filters.uso)
  if (filters.material?.length)  q = q.in('material', filters.material)
  if (filters.isNew)             q = q.eq('is_new', true)
  if (filters.priceMin)          q = q.gte('price', filters.priceMin)
  if (filters.priceMax)          q = q.lte('price', filters.priceMax)
  if (filters.search)            q = q.ilike('name', `%${filters.search}%`)

  if (filters.category?.length === 0 && !filters.search) {
    q = q.order('name')
  } else {
    q = q.order('name')
  }

  q = q.range((page - 1) * perPage, page * perPage - 1)
  return q
}

export async function getProduct(id: string) {
  return supabase.from('products').select('*').eq('id', id).single()
}

export async function getRelatedProducts(id: string, category: string | null) {
  return supabase
    .from('products')
    .select('*')
    .eq('category', category ?? '')
    .eq('active', true)
    .not('img_url', 'is', null)
    .neq('id', id)
    .limit(3)
}

export async function getFilterOptions() {
  const { data } = await supabase
    .from('products')
    .select('category, uso, material')
    .eq('active', true)
    .not('img_url', 'is', null)

  const cats = [...new Set(data?.map(p => p.category).filter(Boolean))].sort()
  const uses = [...new Set(data?.map(p => p.uso).filter(Boolean))].sort()
  const mats = [...new Set(data?.map(p => p.material).filter(Boolean))].sort()
  return { categories: cats as string[], uses: uses as string[], materials: mats as string[] }
}
