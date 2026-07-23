import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/seo'
import { getPublishedPosts } from '@/lib/blog'

export const revalidate = 3600

// Busca todos os produtos ativos paginando (Supabase limita ~1000/consulta).
async function getAllActiveProducts() {
  const PAGE = 1000
  const rows: { id: string; created_at: string }[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('active', true)
      .order('id')
      .range(from, from + PAGE - 1)
    if (error || !data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const products = await getAllActiveProducts()
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const posts = await getPublishedPosts()
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [...staticPages, ...productPages, ...postPages]
}
