import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, getProduct, getRelatedProducts } from '@/lib/supabase'
import ProductCard from '@/components/ui/ProductCard'
import styles from './product.module.css'

export const revalidate = 3600

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const { data } = await getProduct(params.id)
  if (!data) return { title: 'Producto — Universo Hostelería' }
  return {
    title: `${data.name} — Universo Hostelería`,
    description: `${data.name} de ${data.supplier_id}. ${data.dimensions_raw || ''}`,
  }
}

export default async function ProductPage({ params }: Props) {
  const [{ data: product }, { data: related }] = await Promise.all([
    getProduct(params.id),
    supabase.from('products').select('id').eq('active', true).neq('id', params.id).limit(1)
      .then(async r => {
        const { data: p } = await getProduct(params.id)
        return getRelatedProducts(params.id, p?.category ?? null)
      }),
  ])

  if (!product) notFound()

  const supplierName =
    product.supplier_id === 'tilia_romero' ? 'Tilia · Romero' :
    product.supplier_id === 'arkimueble'   ? 'Arkimueble' : 'Romero'

  const specs = [
    { key: 'Dimensiones', val: product.dimensions_raw, sub: 'Alto × Ancho × Profundo (cm)' },
    { key: 'Peso', val: product.weight_kg, sub: 'Por unidad sin embalaje' },
    { key: 'Material', val: product.material, sub: '' },
    { key: 'Uso', val: product.uso, sub: 'Apto para hostelería' },
    product.catas_certified ? { key: 'Certificación', val: 'CATAS', sub: 'Testado para uso profesional' } : null,
    { key: 'Fabricante', val: supplierName, sub: '+15 años en hostelería' },
    product.cod_interno ? { key: 'Código interno', val: product.cod_interno, sub: '' } : null,
    product.modelo ? { key: 'Modelo', val: product.modelo, sub: '' } : null,
  ].filter(Boolean) as {key:string;val:string|null;sub:string}[]

  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.bc}>
        <Link href="/">Inicio</Link><span>/</span>
        <Link href="/catalog">Catálogo</Link><span>/</span>
        <Link href={`/catalog?category=${product.category}`}>{product.category}</Link><span>/</span>
        <span className={styles.bcCur}>{product.name}</span>
      </div>

      {/* Product section */}
      <div className={styles.productWrap}>

        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImg}>
            {product.img_url ? (
              <Image src={product.img_url} alt={product.name} fill
                sizes="(max-width:768px) 100vw, 55vw"
                className={styles.mainImgEl} priority />
            ) : (
              <div className={styles.imgPlaceholder}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <rect x="10" y="15" width="60" height="40" rx="6" stroke="#CCCCCC" strokeWidth="2"/>
                  <path d="M10 55h60" stroke="#CCCCCC" strokeWidth="2"/>
                  <rect x="28" y="55" width="8" height="14" rx="3" fill="#CCCCCC"/>
                  <rect x="44" y="55" width="8" height="14" rx="3" fill="#CCCCCC"/>
                </svg>
              </div>
            )}
            <div className={styles.badges}>
              {product.is_new && <span className="badge badge-black">Nuevo</span>}
              {product.uso === 'Exterior' && <span className="badge badge-green">Outdoor</span>}
              {product.catas_certified && <span className="badge badge-blue">CATAS</span>}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className={styles.infoPanel}>
          <div className={styles.supplier}>{supplierName}</div>
          <h1 className={styles.productTitle}>{product.name}</h1>
          {product.cod_interno && <div className={styles.ref}>Ref. {product.cod_interno}</div>}

          {/* Price */}
          <div className={styles.priceBlock}>
            <div className={styles.price}>{product.price_display}</div>
            <div className={styles.priceNote}>
              Precio mayorista · IVA no incluido
            </div>
          </div>

          {/* CTAs */}
          <div className={styles.ctaStack}>
            <Link href={`mailto:hola@universohosteleria.es?subject=Solicitud de pedido — ${product.name}&body=Producto: ${product.name}%0ARef: ${product.id}%0ACantidad: `}
              className={`btn btn-dark btn-lg ${styles.ctaFull}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
                <path d="M2 7h12" stroke="white" strokeWidth="1.4"/>
              </svg>
              Enviar solicitud de pedido
            </Link>
            <div className={styles.ctaOr}>o</div>
            <Link href="/#especialista" className={`btn btn-blue btn-lg ${styles.ctaFull}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1a5 5 0 1 1 0 10A5 5 0 0 1 8 1zm0 11c-3.3 0-6 1.3-6 2.5V15h12v-.5c0-1.2-2.7-2.5-6-2.5z" stroke="white" strokeWidth="1.4"/>
              </svg>
              Hablar con el especialista
            </Link>
          </div>

          {/* Trust */}
          <div className={styles.trust}>
            {['Entrega coordinada en toda España','Precio directo de fabricante','Especialista disponible para tu proyecto'].map(t => (
              <div key={t} className={styles.trustItem}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="#2B6FD4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className={styles.specsWrap}>
        <hr className="divider" style={{marginBottom:'48px'}}/>
        <div className="eyebrow">Especificaciones</div>
        <h2 className={styles.specsTitle}>FICHA <span style={{color:'#2B6FD4'}}>TÉCNICA</span></h2>
        <div className={styles.specsGrid}>
          {specs.filter(s => s.val).map(s => (
            <div key={s.key} className={styles.specItem}>
              <span className={styles.specKey}>{s.key}</span>
              <span className={styles.specVal}>{s.val}</span>
              {s.sub && <span className={styles.specSub}>{s.sub}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className={styles.relatedWrap}>
          <hr className="divider" style={{marginBottom:'48px'}}/>
          <div className={styles.relatedHeader}>
            <div>
              <div className="eyebrow">Colección</div>
              <h2 className={styles.specsTitle}>COMPLETA <span style={{color:'#2B6FD4'}}>TU ESPACIO</span></h2>
            </div>
            <Link href={`/catalog?category=${product.category}`} className="btn btn-ol">Ver toda la colección</Link>
          </div>
          <div className={styles.relatedGrid}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Specialist strip */}
      <div className={styles.strip}>
        <div className={styles.stripInner}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'13px',letterSpacing:'.1em',color:'rgba(255,255,255,.35)',marginBottom:'8px'}}>SERVICIO GRATUITO</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(28px,3vw,42px)',letterSpacing:'.02em',color:'#fff',lineHeight:'.96',marginBottom:'10px'}}>
              ¿DUDAS CON ESTE<br/>PRODUCTO? <span style={{color:'#7EB3F5'}}>HABLAMOS.</span>
            </div>
            <p style={{fontSize:'14px',color:'rgba(255,255,255,.5)',fontWeight:300,marginTop:'10px',maxWidth:'480px',lineHeight:'1.6'}}>
              Colores, cantidades, plazos de entrega, configuración del espacio.
            </p>
          </div>
          <Link href="/#especialista" className={styles.stripBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
              <path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Reservar cita gratuita
          </Link>
        </div>
      </div>
    </>
  )
}
