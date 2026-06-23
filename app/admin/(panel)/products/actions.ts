'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

const BUCKET = 'product-images'

// Campos editáveis de um produto (mapeiam a tabela products).
const FIELDS = [
  'supplier_id', 'name', 'category', 'uso', 'material', 'features',
  'dimensions_raw', 'weight_kg', 'price_display', 'cod_interno',
  'cod_comercial', 'alto_asiento', 'modelo', 'source',
] as const

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
}

function parsePrice(raw: FormDataEntryValue | null): number | null {
  if (!raw) return null
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

// Lê os campos comuns do FormData para um objeto de produto.
function readFields(fd: FormData) {
  const row: Record<string, unknown> = {}
  for (const f of FIELDS) {
    const v = fd.get(f)
    row[f] = v === null || v === '' ? null : String(v)
  }
  row.price = parsePrice(fd.get('price'))
  row.is_new = fd.get('is_new') === 'on'
  row.catas_certified = fd.get('catas_certified') === 'on'
  row.active = fd.get('active') === 'on'
  const img = fd.get('img_url')
  if (img) row.img_url = String(img)
  return row
}

// Faz upload de uma imagem (File) e devolve a URL pública, ou null.
async function uploadImage(supabase: ReturnType<typeof createClient>, file: File, id: string) {
  if (!file || file.size === 0) return null
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `products/${id}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined })
  if (error) throw new Error('Error al subir imagen: ' + error.message)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createProduct(fd: FormData) {
  const supabase = createClient()
  const name = String(fd.get('name') || '').trim()
  if (!name) throw new Error('El nombre es obligatorio')

  const id = (String(fd.get('id') || '').trim() || `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`)
  const row: Record<string, unknown> = { id, ...readFields(fd) }

  const file = fd.get('image_file') as File | null
  if (file && file.size > 0) {
    row.img_url = await uploadImage(supabase, file, id)
  }

  const { error } = await supabase.from('products').insert(row)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath('/catalog')
  redirect('/admin/products')
}

export async function updateProduct(id: string, fd: FormData) {
  const supabase = createClient()
  const row = readFields(fd)

  const file = fd.get('image_file') as File | null
  if (file && file.size > 0) {
    row.img_url = await uploadImage(supabase, file, id)
  }

  const { error } = await supabase.from('products').update(row).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/product/${id}`)
  revalidatePath('/catalog')
  redirect('/admin/products')
}

export async function toggleActive(id: string, active: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('products').update({ active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/catalog')
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/products')
  revalidatePath('/catalog')
}
