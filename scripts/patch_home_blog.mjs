import { createClient } from '@supabase/supabase-js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })

const { data: row } = await s.from('site_content').select('data').eq('key', 'home').maybeSingle()
if (!row) { console.log('sin fila home'); process.exit(0) }
const d = row.data

// nav: añadir Blog si falta
d.nav = d.nav || {}
d.nav.links = d.nav.links || []
if (!d.nav.links.some((l) => l.href === '/blog')) d.nav.links.push({ label: 'Blog', href: '/blog' })

// footer: Blog -> /blog
for (const col of d.footer?.cols || []) {
  for (const l of col.links || []) {
    if (l.label === 'Blog') l.href = '/blog'
  }
}

const { error } = await s.from('site_content').update({ data: d, updated_at: new Date().toISOString() }).eq('key', 'home')
console.log(error ? '❌ ' + error.message : '✅ home actualizado (nav + footer Blog -> /blog)')
