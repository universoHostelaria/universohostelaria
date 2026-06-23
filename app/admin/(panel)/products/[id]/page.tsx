import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProductForm from '../ProductForm'
import { updateProduct } from '../actions'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: product }, { data: suppliers }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('suppliers').select('id, name').order('name'),
  ])

  if (!product) notFound()

  const action = updateProduct.bind(null, params.id)
  return <ProductForm product={product} suppliers={suppliers ?? []} action={action} />
}
