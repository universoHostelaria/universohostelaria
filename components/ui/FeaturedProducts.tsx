'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import ProductCard from './ProductCard'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .not('img_url', 'is', null)
      .order('is_new', { ascending: false })
      .limit(4)
      .then(({ data }) => setProducts(data || []))
  }, [])

  if (products.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
