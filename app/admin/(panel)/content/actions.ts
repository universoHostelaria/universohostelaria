'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import type { HomeContent } from '@/lib/home-content'

const BUCKET = 'site-images'

// Salva o conteúdo da home (objeto completo) em site_content(key='home').
export async function saveHomeContent(data: HomeContent) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('site_content').upsert({
    key: 'home',
    section: 'home',
    label: 'Home',
    data,
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  return { ok: true }
}

// Faz upload de uma imagem do site e devolve a URL pública.
export async function uploadSiteImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  const file = fd.get('file') as File | null
  const slot = String(fd.get('slot') || 'img')
  if (!file || file.size === 0) return { error: 'Arquivo vazio' }

  const supabase = createClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `home/${slot}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}
