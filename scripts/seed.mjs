/**
 * UNIVERSO HOSTELERÍA — Seed Script
 * ==================================
 * Uploads images + inserts products into Supabase.
 *
 * SETUP:
 *   1. Copy .env.local.example → .env.local and fill in your keys
 *   2. Place extracted_images/ folder and products_final.json in scripts/
 *   3. Run: npm run seed
 *
 * REQUIRES:
 *   npm install @supabase/supabase-js dotenv
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY  // service_role key required for storage
const BUCKET       = 'product-images'
const IMAGES_DIR   = join(__dirname, 'extracted_images')
const PRODUCTS_JSON = join(__dirname, 'products_final.json')

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
console.log('✅  Connected to Supabase:', SUPABASE_URL)

// ── 1. UPLOAD IMAGES ─────────────────────────────────────────
async function uploadImages() {
  console.log('\n📸  Uploading images…')
  let files
  try { files = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp')) }
  catch { console.warn('   ⚠️  extracted_images/ folder not found — skipping image upload'); return {} }

  console.log(`   Found ${files.length} images`)
  const urlMap = {}
  let ok = 0, fail = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filePath = join(IMAGES_DIR, filename)
    const storagePath = `products/${filename}`

    try {
      const data = readFileSync(filePath)
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, data, {
        contentType: 'image/webp', upsert: true,
      })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      urlMap[filename] = publicUrl
      ok++
    } catch (e) {
      fail++
    }

    if ((i + 1) % 200 === 0) console.log(`   Uploaded ${i+1}/${files.length}…`)
  }

  console.log(`   ✅  ${ok} uploaded, ${fail} failed`)
  return urlMap
}

// ── 2. INSERT PRODUCTS ────────────────────────────────────────
async function insertProducts(urlMap) {
  console.log('\n📦  Inserting products…')
  let products
  try { products = JSON.parse(readFileSync(PRODUCTS_JSON, 'utf-8')) }
  catch { console.error('   ❌  products_final.json not found in scripts/'); process.exit(1) }

  console.log(`   Total: ${products.length} products`)

  const BATCH = 100
  let ok = 0, fail = 0

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH).map(p => ({
      id:              p.id,
      supplier_id:     p.source === 'tilia_romero' ? 'tilia_romero'
                     : p.source === 'arkimueble'   ? 'arkimueble'
                     : 'romero',
      name:            p.name,
      category:        p.category || null,
      uso:             p.uso || null,
      material:        p.material || null,
      features:        p.features || null,
      dimensions_raw:  p.dimensions_raw || null,
      weight_kg:       p.weight_kg || null,
      price:           p.price || null,
      price_display:   p.price_display || 'Consultar',
      is_new:          p.is_new || false,
      catas_certified: p.catas || false,
      img_url:         p.img_file ? (urlMap[p.img_file] || null) : null,
      cod_interno:     p.cod_interno || null,
      cod_comercial:   p.cod_comercial || null,
      alto_asiento:    p.alto_asiento || null,
      modelo:          p.modelo || null,
      source:          p.source || null,
      active:          true,
    }))

    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' })
    if (error) { console.error(`   ❌  Batch ${Math.floor(i/BATCH)+1}:`, error.message); fail += batch.length }
    else ok += batch.length

    if ((i + BATCH) % 500 === 0) console.log(`   Inserted ${Math.min(i+BATCH, products.length)}/${products.length}…`)
  }

  console.log(`   ✅  ${ok} inserted, ${fail} failed`)
}

// ── RUN ───────────────────────────────────────────────────────
const urlMap = await uploadImages()
await insertProducts(urlMap)
console.log('\n🎉  Seed complete! Your Supabase database is ready.\n')
