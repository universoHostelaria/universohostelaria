# Universo Hostelería

Marketplace de mobiliario para hostelería — Next.js 14 + Supabase + Vercel.

## Stack

- **Frontend** — Next.js 14 (App Router, Server Components)
- **Base de datos** — Supabase (PostgreSQL)
- **Imágenes** — Supabase Storage
- **Deploy** — Vercel
- **CSS** — CSS Modules (sin Tailwind, sin librerías de UI)

---

## Primeros pasos

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USER/universo-hosteleria.git
cd universo-hosteleria
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (región: Europe Frankfurt)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Storage** → **New bucket** → nombre: `product-images` → marcar **Public** → Create
4. Copia las keys desde **Settings > API**

### 3. Variables de entorno

```bash
cp .env.local.example .env.local
# Edita .env.local con tus valores de Supabase
```

### 4. Importar productos e imágenes (seed)

```bash
# Coloca estos ficheros en scripts/:
# - extracted_images/   (carpeta con las .webp — viene en el zip)
# - products_final.json (los 2424 productos normalizados)

npm run seed
# ~5-10 min para 2424 productos + 2117 imágenes
```

### 5. Desarrollo local

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy en Vercel

### Opción A — GitHub (recomendado)

1. Sube el proyecto a GitHub
2. En [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. En **Environment Variables** añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** — listo ✅

### Opción B — CLI

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

---

## Estructura del proyecto

```
universo-hosteleria/
├── app/
│   ├── page.tsx              # Homepage
│   ├── page.module.css
│   ├── layout.tsx            # Root layout (Navbar + Footer)
│   ├── globals.css           # Design system tokens
│   ├── catalog/
│   │   ├── page.tsx          # Catalog page (SSR)
│   │   ├── CatalogClient.tsx # Interactive filters (Client)
│   │   └── catalog.module.css
│   └── product/[id]/
│       ├── page.tsx          # Product detail (SSR)
│       └── product.module.css
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx + .module.css
│   │   └── Footer.tsx + .module.css
│   └── ui/
│       └── ProductCard.tsx + .module.css
├── lib/
│   └── supabase.ts           # Supabase client + types + query helpers
├── scripts/
│   ├── seed.mjs              # Seed script (upload images + insert products)
│   ├── extracted_images/     # ← place .webp files here (gitignored)
│   └── products_final.json   # ← place JSON here (gitignored)
├── supabase/
│   └── schema.sql            # Database schema
├── public/
│   └── logo.png              # Official logo
└── .env.local.example        # Env template
```

---

## Datos

| Fornecedor | Produtos | Com imagem |
|---|---|---|
| Tilia · Romero | 234 | 45 |
| Arkimueble | 331 | 40 |
| Romero | 1.859 | 1.743 |
| **Total** | **2.424** | **1.828 (75%)** |

> Para 100% de cobertura de imágenes pide a Tilia y Arkimueble sus packs de imágenes de producto.

---

## Páginas disponibles

| Ruta | Descripción |
|---|---|
| `/` | Homepage con hero, categorías, productos destacados, especialista |
| `/catalog` | Catálogo completo con filtros, búsqueda, paginación, toggle vista |
| `/product/[id]` | Ficha de producto con specs, galería, CTAs, productos relacionados |

---

## Design System

Fuentes: **Bebas Neue** (headings) + **Inter** (body)  
Colores: `#0D0D0D` negro · `#2B6FD4` azul · `#FFFFFF` blanco  
Ver `app/globals.css` para todos los tokens CSS.
