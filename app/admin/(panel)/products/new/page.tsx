import { createClient } from '@/lib/supabase-server'
import ProductForm from '../ProductForm'
import { createProduct } from '../actions'

export default async function NewProductPage() {
  const supabase = createClient()
  const { data: suppliers } = await supabase.from('suppliers').select('id, name').order('name')
  return <ProductForm suppliers={suppliers ?? []} action={createProduct} />
}
