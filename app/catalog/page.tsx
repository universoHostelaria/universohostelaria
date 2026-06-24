import { Suspense } from 'react'
import { getFilterOptions } from '@/lib/supabase'
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
export const revalidate = 3600

export default async function CatalogPage() {
  const filters = await getFilterOptions()
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{padding:'80px 32px',textAlign:'center',color:'#AAA'}}>Cargando catálogo…</div>}>
        <CatalogClient filterOptions={filters} />
      </Suspense>
      <Footer />
    </>
  )
}
