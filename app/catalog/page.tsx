import { Suspense } from 'react'
import { getFilterOptions } from '@/lib/supabase'
import CatalogClient from './CatalogClient'

export const metadata = { title: 'Catálogo — Universo Hostelería' }
export const revalidate = 3600 // ISR: revalidate every hour

export default async function CatalogPage() {
  const filters = await getFilterOptions()

  return (
    <Suspense fallback={<div style={{padding:'80px 32px',textAlign:'center',color:'#AAA'}}>Cargando catálogo…</div>}>
      <CatalogClient filterOptions={filters} />
    </Suspense>
  )
}
