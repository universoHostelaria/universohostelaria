/**
 * UNIVERSO HOSTELERÍA — Migração da HOME
 * Extrai as 6 imagens base64 de app/page.tsx, sobe pro Storage
 * (bucket site-images) e grava as URLs em site_content(key='home').
 * Roda uma vez:  node scripts/migrate_home.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
)

const BUCKET = 'site-images'

// const IMG_X  ->  caminho no content
const MAP = {
  IMG_LOGO: 'logo',
  IMG_LIMA: 'hero.image',
  IMG_BERNA: 'specialist.image',
  IMG_BERNA_CU: 'break1Image',
  IMG_TUMBONAS: 'break2Image',
  IMG_TERRAZA: 'split.image',
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }

function setPath(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

async function main() {
  const src = readFileSync(join(__dirname, '../app/page.tsx'), 'utf8')

  // pega o conteúdo do site_content existente (se houver) p/ preservar edições
  const { data: existing } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', 'home')
    .maybeSingle()
  const content = existing?.data ?? {}

  for (const [name, path] of Object.entries(MAP)) {
    const re = new RegExp(`const ${name}\\s*=\\s*"(data:(image\\/[a-z]+);base64,([A-Za-z0-9+/=]+))"`)
    const m = src.match(re)
    if (!m) {
      console.warn(`⚠️  ${name} não encontrado em page.tsx — pulando`)
      continue
    }
    const mime = m[2]
    const b64 = m[3]
    const ext = EXT[mime] || 'jpg'
    const buf = Buffer.from(b64, 'base64')
    const file = `home/${path.replace(/\./g, '_')}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, buf, { contentType: mime, upsert: true })
    if (error) {
      console.error(`❌ ${name}: ${error.message}`)
      continue
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(file)
    setPath(content, path, data.publicUrl)
    console.log(`✅ ${name} → ${file} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
  }

  const { error } = await supabase
    .from('site_content')
    .upsert({ key: 'home', section: 'home', label: 'Home', data: content, updated_at: new Date().toISOString() })
  if (error) {
    console.error('❌ upsert site_content:', error.message)
    process.exit(1)
  }
  console.log('\n✅ site_content(home) atualizado com as URLs das imagens.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
