import { getFilterOptions, getProducts } from '@/lib/supabase'
import CatalogClient from './CatalogClient'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Catálogo de mobiliario para hostelería',
  description:
    'Explora mobiliario profesional para hostelería: sillas, mesas, taburetes, sillones y mobiliario de exterior de 15+ fabricantes europeos. Precio directo de fábrica y entrega en toda España.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'Catálogo de mobiliario para hostelería',
    description:
      'Sillas, mesas, taburetes y mobiliario de exterior para bares, restaurantes y hoteles. 15+ fabricantes europeos, entrega en toda España.',
    url: '/catalog',
    type: 'website',
  },
}
export const revalidate = 60

type Props = { searchParams: Record<string, string | string[] | undefined> }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export default async function CatalogPage({ searchParams }: Props) {
  const category = one(searchParams.category)
  const uso = one(searchParams.uso)
  const search = one(searchParams.search) || one(searchParams.q)
  const [filters, { data, count }] = await Promise.all([
    getFilterOptions(),
    getProducts({ category: category ? [category] : [], uso: uso ? [uso] : [], search }),
  ])
  return (
    <>
      <Navbar />
      <CatalogClient
        filterOptions={filters}
        initial={{ category, uso, search, products: data ?? [], total: count ?? 0 }}
      />
      <Footer />
    </>
  )
}
