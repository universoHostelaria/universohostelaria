import { marked } from 'marked'
import { supabase } from '@/lib/supabase'

export type BlogPost = {
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  author: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  reading_min: number | null
  published: boolean
  published_at: string
  updated_at: string
}

marked.setOptions({ gfm: true, breaks: false })

// Renderiza el Markdown del artículo a HTML.
export function renderMarkdown(md: string | null): string {
  if (!md) return ''
  return marked.parse(md) as string
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  return (data as BlogPost[]) || []
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  return (data as BlogPost) || null
}
