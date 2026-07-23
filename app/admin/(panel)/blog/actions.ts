'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

const BUCKET = 'site-images'

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 70)
}

function estimateReadingMin(md: string) {
  const words = (md || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function readFields(fd: FormData) {
  const content = String(fd.get('content') || '')
  const kw = String(fd.get('keywords') || '').split(',').map((k) => k.trim()).filter(Boolean)
  return {
    title: String(fd.get('title') || '').trim(),
    excerpt: String(fd.get('excerpt') || '').trim() || null,
    content: content || null,
    category: String(fd.get('category') || '').trim() || null,
    author: String(fd.get('author') || '').trim() || 'Universo Hostelería',
    meta_title: String(fd.get('meta_title') || '').trim() || null,
    meta_description: String(fd.get('meta_description') || '').trim() || null,
    keywords: kw.length ? kw : null,
    cover_image: String(fd.get('cover_image') || '').trim() || null,
    reading_min: estimateReadingMin(content),
    published: fd.get('published') === 'on',
    updated_at: new Date().toISOString(),
  }
}

async function uploadCover(supabase: ReturnType<typeof createClient>, file: File, slug: string) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `blog/${slug}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined })
  if (error) throw new Error('Error al subir portada: ' + error.message)
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function createPost(fd: FormData) {
  const supabase = createClient()
  const title = String(fd.get('title') || '').trim()
  if (!title) throw new Error('El título es obligatorio')
  const slug = String(fd.get('slug') || '').trim() || slugify(title)
  const row: Record<string, unknown> = { slug, ...readFields(fd), published_at: new Date().toISOString() }

  const file = fd.get('cover_file') as File | null
  if (file && file.size > 0) row.cover_image = await uploadCover(supabase, file, slug)

  const { error } = await supabase.from('blog_posts').insert(row)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog'); revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function updatePost(slug: string, fd: FormData) {
  const supabase = createClient()
  const row: Record<string, unknown> = readFields(fd)
  const file = fd.get('cover_file') as File | null
  if (file && file.size > 0) row.cover_image = await uploadCover(supabase, file, slug)

  const { error } = await supabase.from('blog_posts').update(row).eq('slug', slug)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog'); revalidatePath('/blog'); revalidatePath(`/blog/${slug}`)
  redirect('/admin/blog')
}

export async function togglePublished(slug: string, published: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('blog_posts').update({ published }).eq('slug', slug)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog'); revalidatePath('/blog')
}

export async function deletePost(slug: string) {
  const supabase = createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('slug', slug)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/blog'); revalidatePath('/blog')
}
