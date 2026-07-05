/**
 * Campaña: sube las fotos (optimizadas) al Storage y monta los ~15
 * productos destacados (imagen principal + galería). NO oculta nada.
 * Run: node scripts/campaign_products.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'
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

const BUCKET = 'product-images'
const IMGS = '/private/tmp/claude-501/-Users-lukeskywalker-universohostelaria/3dc2c929-9536-44bb-9e42-b65846b9b9af/scratchpad/imgs'
const TMP = join(IMGS, 'opt')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

// Busca el archivo en z1 o z2
function resolveSrc(name) {
  for (const z of ['z1', 'z2']) {
    const p = join(IMGS, z, name)
    if (existsSync(p)) return p
  }
  throw new Error('No encontrado: ' + name)
}

// Optimiza (max 1600px, JPEG q80) y devuelve buffer
let seq = 0
function optimize(name) {
  const src = resolveSrc(name)
  const out = join(TMP, `o${seq++}.jpg`)
  execSync(`sips -Z 1600 -s format jpeg -s formatOptions 80 ${JSON.stringify(src)} --out ${JSON.stringify(out)}`, { stdio: 'ignore' })
  return readFileSync(out)
}

async function uploadImages(slug, files) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const buf = optimize(files[i])
    const path = `campaign/${slug}-${i}.jpg`
    const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { upsert: true, contentType: 'image/jpeg' })
    if (error) throw new Error(`${slug} img${i}: ${error.message}`)
    urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
  }
  return urls
}

// ── MANIFEST ────────────────────────────────────────────────────
// images = [principal, ...galería]. img_url = principal.
const M = [
  // MESAS (existentes)
  { id:'RM1805', slug:'mesa-3020', name:'Mesa 3020', category:'Mesas', uso:'Interior',
    main:'3020_melamina.roble.png',
    gallery:['3020_melamina.blanco.png','3020_melamina.negro.png','3020_melamina.nogal.png','3020_negro_compact_marmol_negro_80x80.png','3020_negro_compact_marmol_blanco_80x80.png','3020_negro_compact_olivo_90x90.png','3020_negro_compact_pino_viejo_70x70.png','3020_sin.tacos_compact.corten.png','ambiente_3020_shell_2.png'] },
  { id:'RM0735', slug:'mesa-plegable-311', name:'Mesa Plegable 311', category:'Mesas', uso:'Exterior',
    main:'311_ambiente.png',
    gallery:['311_88x88_ambiente.png','311_200x90_ambiente.png','M311_182X74_AMBIENTE.png'] },
  { id:'RM1428', slug:'mesa-414', name:'Mesa 414', category:'Mesas', uso:'Interior',
    main:'productos-414PL_mesa.png',
    gallery:['M414_blanco_compact_negro.png','M414_negro_compact_negro.png','414_blanco_compact_roble_provenzal.png'] },

  // SILLAS (existentes)
  { id:'RM0588', slug:'silla-viena-103', name:'Silla Viena 103', category:'Sillas', uso:'Interior',
    main:'103, 3020, 2163_v2.png', gallery:[] },
  { id:'TR0032', slug:'silla-helena', name:'Silla Helena', category:'Sillas', uso:'Interior',
    main:'Helen_ambiente.png', gallery:['helen_hotel.png'] },
  { id:'TR0006', slug:'silla-shell', name:'Silla Shell', category:'Sillas', uso:'Interior',
    main:'ambiente shell.png', gallery:['ambiente_3020_shell_2.png','ambiente shell bar.png','Ambiente Shells.png'] },

  // SILLONES
  { id:'RM2331', slug:'sillon-luigi', name:'Sillón Luigi', category:'Sillones', uso:'Exterior',
    main:'Luigi_sillon_ambiente.jpg', gallery:['Luigi_Bar_ambiente.jpg','Luigi_Ivy_ambiente (2).png','Luigi_Bar_ambiente_2.png'] },

  // TABURETES (existentes) — corrige categoría de 'Otros' a 'Taburetes'
  { id:'RM2210', slug:'taburete-5163', name:'Taburete 5163', category:'Taburetes', uso:'Interior',
    main:'M5163_AMBIENTE.png', gallery:[] },
  { id:'RM2217', slug:'taburete-5551', name:'Taburete 5551', category:'Taburetes', uso:'Interior',
    main:'5551 colores.jpg', gallery:[] },

  // NUEVOS (crear, precio Consultar)
  { new:true, id:'silla-sonora', slug:'silla-sonora', name:'Silla Sonora', category:'Sillas', uso:'Interior',
    main:'Sonora ambiente.png', gallery:['SONORA_silla_Frontal.jpg','SONORA_silla_Perfil.jpg','SONORA_silla_Trasera.jpg','SONORA (002).jpg'] },
  { new:true, id:'silla-walter', slug:'silla-walter', name:'Silla Walter', category:'Sillas', uso:'Interior',
    main:'walter.png', gallery:['imagen sillla walter.png'] },
  { new:true, id:'silla-atlanta', slug:'silla-atlanta', name:'Silla Atlanta', category:'Sillas', uso:'Interior',
    main:'Atlanta_Ambiente1.png', gallery:['Atlanta_ambiente2.png','Atlanta_ambiente3.png','Atlanta_ambiente4.jpg'] },
  { new:true, id:'sillon-mies', slug:'sillon-mies', name:'Sillón Mies', category:'Sillones', uso:'Interior',
    main:'Mies_ambiente1.png', gallery:['Mies_3076.png','Mies_ambiente2.jpeg','Mies_ambiente.png'] },
  { new:true, id:'taburete-breda', slug:'taburete-breda', name:'Taburete Breda', category:'Taburetes', uso:'Interior',
    main:'Breda_Ambiente3.png', gallery:['BREDA_Arm.Negro.Tap.Tender903.png','BREDA_Arm.Negro.Tap.Cross88050.png','Breda _Ambiente4.png','BREDA_Arm.Negro.Tap.Tender600.png'] },
  { new:true, id:'taburete-theo-bar', slug:'taburete-theo-bar', name:'Taburete Theo Bar', category:'Taburetes', uso:'Interior',
    main:'ambiente_theo_theo_bar.png', gallery:['THEO BAR_Ambiente1.png','THEO BAR_Ambiente2.png','Theo Bar ambiente.png'] },
]

async function main() {
  const ids = []
  for (const p of M) {
    const files = [p.main, ...p.gallery]
    const urls = await uploadImages(p.slug, files)
    const row = {
      name: p.name, category: p.category, uso: p.uso,
      img_url: urls[0], images: urls,
      active: true, hidden_by_campaign: false,
    }
    if (p.new) {
      Object.assign(row, {
        id: p.id, supplier_id: null, is_new: true, catas_certified: false,
        price: null, price_display: 'Consultar precio', source: 'campaign',
      })
      const { error } = await supabase.from('products').insert(row)
      if (error && !error.message.includes('duplicate')) throw new Error(`${p.id}: ${error.message}`)
      if (error) { // ya existe -> update
        const { error: e2 } = await supabase.from('products').update(row).eq('id', p.id)
        if (e2) throw new Error(`${p.id} upd: ${e2.message}`)
      }
    } else {
      const { error } = await supabase.from('products').update(row).eq('id', p.id)
      if (error) throw new Error(`${p.id}: ${error.message}`)
    }
    ids.push(p.id)
    console.log(`✅ ${p.name.padEnd(22)} (${p.id})  ${urls.length} imgs`)
  }
  console.log('\nIDs de la campaña (' + ids.length + '):')
  console.log(ids.join(','))
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
