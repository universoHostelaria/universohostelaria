/**
 * UNIVERSO HOSTELERÍA — High Quality Re-seed
 * Re-uploads all images at 100% quality (lossless WebP)
 * Run: node scripts/seed_hq.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const BUCKET = 'product-images'
const IMAGES_DIR = join(__dirname, 'extracted_images')

console.log('Re-uploading images at 100% quality...')
console.log('Note: Use PNG files for lossless quality, or re-extract from xlsx with quality=100\n')

const files = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
console.log(`Found ${files.length} images`)

let ok = 0, fail = 0
for (let i = 0; i < files.length; i++) {
  const filename = files[i]
  const storagePath = `products/${filename}`
  try {
    const data = readFileSync(join(IMAGES_DIR, filename))
    const mime = filename.endsWith('.png') ? 'image/png' : 
                 filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, data, {
      contentType: mime, upsert: true
    })
    if (error) throw error
    ok++
  } catch(e) { fail++; if (fail < 5) console.error(`  Error ${filename}:`, e.message) }
  if ((i+1) % 200 === 0) console.log(`  ${i+1}/${files.length}...`)
}
console.log(`\nDone: ${ok} uploaded, ${fail} failed`)
