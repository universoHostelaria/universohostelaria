import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ui/ProductCard'
import styles from './page.module.css'

async function getFeaturedProducts() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .not('img_url', 'is', null)
    .limit(4)
    .order('is_new', { ascending: false })
  return data || []
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <>
      {/* ANNOUNCEMENT */}
      <div className={styles.ann}>
        <strong>Nuevo:</strong> 15+ fabricantes, 10.000+ productos en un solo lugar &nbsp;·&nbsp;
        <Link href="/#especialista">Habla hoy con nuestro especialista →</Link>
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <h1 className={styles.heroTitle}>
            GRAN<br />HOSTELERÍA<br />
            <span className={styles.blue}>EMPIEZA<br />AQUÍ.</span>
          </h1>
          <p className={styles.heroSub}>
            Más de <strong>10.000 productos</strong> de <strong>15+ fabricantes</strong> europeos.
            Elige, compara y pide directo — con un especialista cuando lo necesites.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/catalog" className="btn btn-dark btn-lg">
              Ver el catálogo
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/#especialista" className={styles.ghost}>
              Hablar con el especialista
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className={styles.heroNums}>
            <div><div className={styles.numVal}>10K<span>+</span></div><div className={styles.numLabel}>Productos</div></div>
            <div><div className={styles.numVal}>15<span>+</span></div><div className={styles.numLabel}>Fabricantes</div></div>
            <div><div className={styles.numVal}>15<span>años</span></div><div className={styles.numLabel}>Experiencia</div></div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className={styles.trust}>
        <div className={styles.trustInner}>
          {['15+ fabricantes curados','Entrega en toda España','Especialista dedicado','Envío gratis desde 300 €','15 años en el mercado'].map(t => (
            <div key={t} className={styles.trustItem}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className={styles.sectionHeader}>
          <div>
            <div className="eyebrow">Categorías</div>
            <h2 className={`${styles.sTitle} heading`}>ENCUENTRA<br />LO QUE <span className={styles.blue}>NECESITAS.</span></h2>
          </div>
          <Link href="/catalog" className="btn btn-ol">Ver catálogo completo</Link>
        </div>
        <div className={styles.catGrid}>
          {[
            {name:'SILLAS',count:'+480',slug:'Sillas',n:'01'},
            {name:'MESAS',count:'+240',slug:'Mesas',n:'02'},
            {name:'TABURETES',count:'+180',slug:'Taburetes',n:'03'},
            {name:'EXTERIOR',count:'+320',slug:'Exterior',n:'04',uso:true},
            {name:'SILLONES',count:'+150',slug:'Sillones',n:'05'},
            {name:'SOMBRILLAS',count:'+90',slug:'Sombrillas',n:'06'},
            {name:'LOUNGE',count:'+200',slug:'Sofás',n:'07'},
          ].map(c => (
            <Link
              key={c.slug}
              href={c.uso ? `/catalog?uso=Exterior` : `/catalog?category=${c.slug}`}
              className={styles.catCard}
            >
              <div className={styles.catNum}>{c.n}</div>
              <div className={styles.catName}>{c.name}</div>
              <div className={styles.catCount}>{c.count} referencias</div>
              <div className={styles.catArrow}>→</div>
            </Link>
          ))}
          <Link href="/catalog" className={`${styles.catCard} ${styles.catFeatured}`}>
            <div className={styles.catNum}>10K+</div>
            <div className={styles.catName}>VER TODO</div>
            <div className={styles.catCount}>Todo el catálogo</div>
            <div className={styles.catArrow}>→</div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section style={{borderTop:'1px solid #E8E8E8'}}>
          <div className="section">
            <div className={styles.sectionHeader}>
              <div>
                <div className="eyebrow">Selección</div>
                <h2 className={`${styles.sTitle} heading`}>PRODUCTOS <span className={styles.blue}>DESTACADOS</span></h2>
              </div>
              <Link href="/catalog" className="btn btn-ol">Ver todos</Link>
            </div>
            <div className={styles.prodGrid}>
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* SPECIALIST CTA */}
      <section style={{borderTop:'1px solid #E8E8E8'}}>
        <div className="section" id="especialista">
          <div className={styles.specCard}>
            <div className={styles.specLeft}>
              <div className={styles.specTag}>Servicio gratuito</div>
              <h2 className={`${styles.specTitle} heading`}>TU PROYECTO.<br />NUESTRO <span className={styles.blue2}>ESPECIALISTA.</span></h2>
              <p className={styles.specDesc}>¿Abres un restaurante? ¿Renuevas la terraza? Reserva una cita y lo resolvemos juntos. Sin compromiso, sin letra pequeña.</p>
              <div className={styles.specFeats}>
                {[
                  'Colores, materiales y acabados a medida',
                  'Planificación de plazos y preparación del pedido',
                  'Videollamada, teléfono o visita en Barcelona',
                  '15 años de experiencia en proyectos de hostelería',
                ].map(f => (
                  <div key={f} className={styles.specFeat}><span className={styles.specDot}/>{f}</div>
                ))}
              </div>
              <Link href="mailto:hola@universohosteleria.es" className={styles.specBtn}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
                  <path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Reservar cita gratuita
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{borderTop:'1px solid #E8E8E8'}}>
        <div className="section" id="como-funciona">
          <div className="eyebrow">Proceso</div>
          <h2 className={`${styles.sTitle} heading`}>4 PASOS.<br /><span className={styles.blue}>TAN FÁCIL.</span></h2>
          <div className={styles.howGrid}>
            {[
              {n:'01',icon:'🔍',t:'EXPLORA',d:'10.000+ productos de 15+ fabricantes. Filtra, compara, guarda favoritos.'},
              {n:'02',icon:'📅',t:'HABLA CON EL ESPECIALISTA',d:'Cita gratuita para afinar plazos, colores y cantidades.'},
              {n:'03',icon:'✓',t:'CONFIRMA EL PEDIDO',d:'Factura proforma directa al fabricante. Sin sorpresas.'},
              {n:'04',icon:'📦',t:'RECIBE EN TU LOCAL',d:'Entrega coordinada en toda España. Te acompañamos hasta el final.'},
            ].map(s => (
              <div key={s.n} className={styles.howStep}>
                <div className={styles.howNum}>{s.n}</div>
                <div className={styles.howIcon}>{s.icon}</div>
                <div className={styles.howTitle}>{s.t}</div>
                <p className={styles.howDesc}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPLIERS */}
      <div className={styles.suppliers} id="proveedores">
        <div className={styles.suppInner}>
          <span className={styles.suppLabel}>NUESTROS FABRICANTES</span>
          <div className={styles.suppLogos}>
            {['Tilia · Romero','Arkimueble','Romero'].map(s => (
              <div key={s} className={styles.suppItem}>
                <div className={styles.suppBadge}>{s[0]}</div>
                <span className={styles.suppName}>{s}</span>
              </div>
            ))}
            <div className={styles.suppItem}>
              <div className={styles.suppBadge} style={{fontSize:'13px',color:'#AAA'}}>+12</div>
              <span className={styles.suppName}>Más marcas</span>
            </div>
          </div>
          <Link href="/catalog" className="btn btn-ol" style={{flexShrink:0,fontSize:'13px'}}>Ver todos los fabricantes</Link>
        </div>
      </div>
    </>
  )
}
