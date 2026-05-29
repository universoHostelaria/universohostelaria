import { Suspense } from 'react'
import { getFilterOptions } from '@/lib/supabase'
import CatalogClient from './CatalogClient'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Catálogo — Universo Hostelería' }
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
