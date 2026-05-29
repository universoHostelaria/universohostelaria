'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/supabase'
import ProductCard from '@/components/ui/ProductCard'
import styles from './catalog.module.css'

type FilterOptions = { categories: string[]; uses: string[]; materials: string[] }

const PER_PAGE = 24

export default function CatalogClient({ filterOptions }: { filterOptions: FilterOptions }) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<4|2|'list'>(4)

  // Filters
  const [selCat,  setSelCat]  = useState<string[]>([])
  const [selUso,  setSelUso]  = useState<string[]>([])
  const [selMat,  setSelMat]  = useState<string[]>([])
  const [isNew,   setIsNew]   = useState(false)
  const [priceMax,setPriceMax]= useState<number|null>(null)
  const [search,  setSearch]  = useState('')
  const [sort,    setSort]    = useState('name')
  const [openDD,  setOpenDD]  = useState<string|null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('products').select('*', { count: 'exact' }).eq('active', true).not('img_url', 'is', null)
    if (selCat.length)  q = q.in('category', selCat)
    if (selUso.length)  q = q.in('uso', selUso)
    if (selMat.length)  q = q.in('material', selMat)
    if (isNew)          q = q.eq('is_new', true)
    if (priceMax)       q = q.lte('price', priceMax)
    if (search)         q = q.ilike('name', `%${search}%`)

    if (sort === 'price_asc')  q = q.order('price', { ascending: true, nullsFirst: false })
    else if (sort === 'price_desc') q = q.order('price', { ascending: false, nullsFirst: false })
    else q = q.order('name')

    q = q.range((page-1)*PER_PAGE, page*PER_PAGE-1)
    const { data, count } = await q
    setProducts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [selCat, selUso, selMat, isNew, priceMax, search, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Reset page on filter change
  const resetPage = () => setPage(1)

  const toggleArr = (arr: string[], val: string, set: (v:string[])=>void) => {
    set(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val])
    resetPage()
  }

  const totalPages = Math.ceil(total / PER_PAGE)
  const activeFiltersCount = selCat.length + selUso.length + selMat.length + (isNew?1:0) + (priceMax?1:0)

  // Inject specialist card every 12 items
  const gridItems: (Product | 'specialist')[] = []
  products.forEach((p, i) => {
    if (i > 0 && i % 12 === 0) gridItems.push('specialist')
    gridItems.push(p)
  })

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.bc}>
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span>Catálogo</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className="eyebrow">Todo el catálogo</div>
          <h1 className={styles.h1}>MÁS DE <span>10.000</span><br/>PRODUCTOS.</h1>
        </div>
        <div className={styles.resultCount}>
          Mostrando <strong>{loading ? '…' : total}</strong> productos
        </div>
      </div>

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterBarInner}>

          {/* Search */}
          <div className={styles.searchWrap}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Buscar producto…"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage() }}
            />
          </div>

          <div className={styles.filterSep}/>

          {/* Category */}
          <Dropdown
            label="Categoría" id="cat" open={openDD==='cat'}
            onToggle={() => setOpenDD(openDD==='cat'?null:'cat')}
            active={selCat.length > 0}
          >
            {filterOptions.categories.map(v => (
              <DropOption key={v} label={v} checked={selCat.includes(v)}
                onChange={() => toggleArr(selCat, v, setSelCat)} />
            ))}
          </Dropdown>

          {/* Interior / Exterior */}
          <Dropdown
            label="Interior / Exterior" id="uso" open={openDD==='uso'}
            onToggle={() => setOpenDD(openDD==='uso'?null:'uso')}
            active={selUso.length > 0}
          >
            {filterOptions.uses.map(v => (
              <DropOption key={v} label={v} checked={selUso.includes(v)}
                onChange={() => toggleArr(selUso, v, setSelUso)} />
            ))}
          </Dropdown>

          {/* Material */}
          <Dropdown
            label="Material" id="mat" open={openDD==='mat'}
            onToggle={() => setOpenDD(openDD==='mat'?null:'mat')}
            active={selMat.length > 0}
          >
            {filterOptions.materials.map(v => (
              <DropOption key={v} label={v} checked={selMat.includes(v)}
                onChange={() => toggleArr(selMat, v, setSelMat)} />
            ))}
          </Dropdown>

          {/* Precio */}
          <Dropdown
            label={priceMax ? `Hasta ${priceMax} €` : 'Precio'} id="price"
            open={openDD==='price'} onToggle={() => setOpenDD(openDD==='price'?null:'price')}
            active={!!priceMax}
          >
            <div className={styles.priceSlider}>
              <input type="range" min={0} max={1000} step={10}
                value={priceMax ?? 1000}
                onChange={e => { setPriceMax(Number(e.target.value)); resetPage() }}/>
              <div className={styles.priceLabels}>
                <span>0 €</span><span>{priceMax ?? 1000} €</span>
              </div>
            </div>
          </Dropdown>

          {/* Novedades */}
          <button
            className={`${styles.filterPill} ${isNew ? styles.active : ''}`}
            onClick={() => { setIsNew(!isNew); resetPage() }}
          >✦ Novedades</button>

          <div className={styles.filterSep}/>

          {/* Sort */}
          <select className={styles.sortSelect} value={sort}
            onChange={e => { setSort(e.target.value); resetPage() }}>
            <option value="name">Nombre A–Z</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>

          {/* View toggle */}
          <div className={styles.viewToggle}>
            {([4,2,'list'] as const).map(v => (
              <button key={v} className={`${styles.viewBtn} ${view===v?styles.viewActive:''}`}
                onClick={() => setView(v)} title={`Vista ${v}`}>
                {v === 4 ? '▦' : v === 2 ? '▣' : '☰'}
              </button>
            ))}
          </div>

        </div>
        {/* Close overlay */}
        {openDD && <div className={styles.overlay} onClick={() => setOpenDD(null)}/>}
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className={styles.activeFilt}>
          <div className={styles.activeFiltInner}>
            {selCat.map(v => <FilterTag key={v} label={v} onRemove={() => toggleArr(selCat,v,setSelCat)}/>)}
            {selUso.map(v => <FilterTag key={v} label={v} onRemove={() => toggleArr(selUso,v,setSelUso)}/>)}
            {selMat.map(v => <FilterTag key={v} label={v} onRemove={() => toggleArr(selMat,v,setSelMat)}/>)}
            {isNew && <FilterTag label="Novedades" onRemove={() => setIsNew(false)}/>}
            {priceMax && <FilterTag label={`Hasta ${priceMax} €`} onRemove={() => setPriceMax(null)}/>}
            <button className={styles.clearAll} onClick={() => {
              setSelCat([]); setSelUso([]); setSelMat([]); setIsNew(false); setPriceMax(null); resetPage()
            }}>Limpiar todo</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className={styles.body}>
        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({length:8}).map((_,i) => <div key={i} className={styles.skeleton}/>)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>SIN RESULTADOS</div>
            <p>Prueba cambiando los filtros o <Link href="https://wa.me/34665953186?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20con%20un%20especialista." target="_blank" rel="noopener noreferrer" style={{color:'#2B6FD4'}}>habla con el especialista</Link>.</p>
          </div>
        ) : (
          <div className={`${styles.grid} ${
            view === 4 ? styles.grid4 :
            view === 2 ? styles.grid2 :
            styles.gridList
          }`}>
            {gridItems.map((item, i) =>
              item === 'specialist' ? (
                <SpecialistCard key={`spec-${i}`} />
              ) : (
                <ProductCard key={item.id} product={item} view={view === 'list' ? 'list' : 'grid'} />
              )
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pgBtn} disabled={page===1} onClick={() => setPage(p=>p-1)}>←</button>
            {Array.from({length: totalPages}, (_,i) => i+1)
              .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
              .reduce((acc: (number|'...')[], p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p,i) => p === '...' ? (
                <span key={i} style={{color:'#AAA',padding:'0 4px'}}>…</span>
              ) : (
                <button key={p} className={`${styles.pgBtn} ${p===page?styles.pgActive:''}`}
                  onClick={() => { setPage(p as number); window.scrollTo({top:0,behavior:'smooth'}) }}>{p}</button>
              ))
            }
            <button className={styles.pgBtn} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>→</button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────
function Dropdown({ label, id, open, onToggle, active, children }:
  { label:string; id:string; open:boolean; onToggle:()=>void; active:boolean; children:React.ReactNode }) {
  return (
    <div style={{position:'relative'}}>
      <button className={`${styles.filterPill} ${active?styles.active:''} ${open?styles.open:''}`} onClick={onToggle}>
        {label}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className={styles.dropPanel}>
          <div className={styles.dropTitle}>{label}</div>
          {children}
        </div>
      )}
    </div>
  )
}

function DropOption({ label, checked, onChange }: { label:string; checked:boolean; onChange:()=>void }) {
  return (
    <div className={`${styles.dropOpt} ${checked?styles.dropSelected:''}`} onClick={onChange}>
      <div className={styles.dropCheck}>
        {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l3 3 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      {label}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label:string; onRemove:()=>void }) {
  return (
    <span className={styles.filtTag}>
      {label}
      <button onClick={onRemove} aria-label="Quitar filtro">×</button>
    </span>
  )
}

function SpecialistCard() {
  return (
    <div className={styles.specCard}>
      <div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'13px',letterSpacing:'.1em',color:'rgba(255,255,255,.3)',marginBottom:'8px'}}>SERVICIO GRATUITO</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(28px,3vw,40px)',letterSpacing:'.02em',color:'#fff',lineHeight:'.96',marginBottom:'10px'}}>
          ¿NO ENCUENTRAS<br/>LO QUE BUSCAS? <span style={{color:'#7EB3F5'}}>HABLAMOS.</span>
        </div>
        <p style={{fontSize:'13.5px',color:'rgba(255,255,255,.5)',lineHeight:'1.6',fontWeight:300,maxWidth:'420px'}}>
          Un especialista te ayuda a encontrar el mobiliario ideal para tu proyecto.
        </p>
      </div>
      <Link href="https://wa.me/34665953186?text=Hola%2C%20me%20gustar%C3%ADa%20hablar%20con%20un%20especialista." target="_blank" rel="noopener noreferrer" className={styles.specBtn}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
          <path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        Reservar cita gratuita
      </Link>
    </div>
  )
}
