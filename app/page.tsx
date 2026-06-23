/* eslint-disable @next/next/no-img-element */
import './homepage.css'
import FeaturedProducts from '@/components/ui/FeaturedProducts'
import { getHomeContent } from '@/lib/home-content-server'

export const revalidate = 60

export async function generateMetadata() {
  const c = await getHomeContent()
  return { title: c.seo.title, description: c.seo.description }
}

// ── SVGs decorativos (fixos no layout, indexados por posição) ──
const TRUST_ICONS = [
  <svg key={0} width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l2 4 4.5.65-3.25 3.15.77 4.47L8 11.5l-4.02 2.22.77-4.47L1.5 6.15l4.5-.65z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  <svg key={1} width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 8h12M8 2c-2 2-3 4-3 6s1 4 3 6M8 2c2 2 3 4 3 6s-1 4-3 6" stroke="currentColor" strokeWidth="1.3"/></svg>,
  <svg key={2} width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 1 1 0 10A5 5 0 0 1 8 1zm0 11c-3.3 0-6 1.3-6 2.5V15h12v-.5c0-1.2-2.7-2.5-6-2.5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  <svg key={3} width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3"/></svg>,
  <svg key={4} width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
]

const HOW_ICONS = [
  <svg key={0} width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  <svg key={1} width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8h14M6 2v4M12 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  <svg key={2} width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key={3} width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="6.5" width="15" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 6.5V5a4.5 4.5 0 0 1 9 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
]

const CAT_ARROW = (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

export default async function HomePage() {
  const c = await getHomeContent()

  return (
    <>
      <div className="ann">
        <span dangerouslySetInnerHTML={{ __html: c.announcement.textHtml }} />
        {'  ·  '}
        <a href={c.whatsappUrl} target="_blank" rel="noopener noreferrer">{c.announcement.linkLabel}</a>
      </div>

      <nav>
        <div className="nav-w">
          <a href="/" className="logo">
            {c.logo && <img src={c.logo} alt="Universo Hostelería" />}
            <div className="logo-copy">
              <span className="logo-name">Universo Hostelería</span>
              <span className="logo-sub">Barcelona · España</span>
            </div>
          </a>
          <ul className="nav-links">
            {c.nav.links.map((l, i) => (
              <li key={i}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
          <div className="nav-r">
            <div className="srch">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {c.nav.searchText}
            </div>
            <a href={c.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark" style={{ fontSize: '13px', padding: '10px 18px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {c.nav.ctaLabel}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        {c.hero.image && <img className="hero-img-side" src={c.hero.image} alt="Sillón Lima — Arkimueble" />}
        <div className="hero-fade"></div>
        <div className="hero-body">
          <h1 dangerouslySetInnerHTML={{ __html: c.hero.titleHtml }} />
          <p className="hero-sub" dangerouslySetInnerHTML={{ __html: c.hero.subtitleHtml }} />
          <div className="hero-ctas">
            <a href={c.hero.cta1.href} className="btn btn-dark" style={{ padding: '13px 26px', fontSize: '14.5px', borderRadius: '9px' }}>
              {c.hero.cta1.label}
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href={c.whatsappUrl} target="_blank" rel="noopener noreferrer" className="ghost">
              {c.hero.cta2Label}
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
          <div className="hero-nums">
            {c.hero.stats.map((s, i) => (
              <div key={i}><div className="hnum-val">{s.val}<span>{s.sup}</span></div><div className="hnum-label">{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <div className="trust">
        <div className="trust-w">
          {c.trust.map((t, i) => (
            <div className="ti" key={i}>{TRUST_ICONS[i] ?? TRUST_ICONS[0]}{t}</div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div id="catalogo">
        <div className="sec">
          <div className="sh">
            <div>
              <div className="eyebrow">{c.categories.eyebrow}</div>
              <h2 className="stitle" dangerouslySetInnerHTML={{ __html: c.categories.titleHtml }} />
            </div>
            <a href={c.categories.ctaHref} className="btn btn-ol" style={{ flexShrink: '0' }}>{c.categories.ctaLabel}</a>
          </div>
          <div className="cat-grid">
            {c.categories.cards.map((card, i) => (
              <a key={i} href={card.href} className={`cat-card${i === c.categories.cards.length - 1 ? ' cat-feat' : ''}`}>
                <div className="cat-n">{card.n}</div>
                <div className="cat-name">{card.name}</div>
                <div className="cat-count">{card.count}</div>
                <div className="cat-arr">{CAT_ARROW}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <hr className="div-line" />

      {/* FEATURED */}
      <div className="sec">
        <div className="sh">
          <div>
            <div className="eyebrow">{c.featured.eyebrow}</div>
            <h2 className="stitle" dangerouslySetInnerHTML={{ __html: c.featured.titleHtml }} />
          </div>
          <a href={c.featured.ctaHref} className="btn btn-ol" style={{ flexShrink: '0' }}>{c.featured.ctaLabel}</a>
        </div>
        <FeaturedProducts />
      </div>

      {/* IMAGE BREAK 1 */}
      {c.break1Image && (
        <div className="img-break">
          <img src={c.break1Image} alt="Colección Berna exterior — Universo Hostelería" />
        </div>
      )}

      {/* WHY */}
      <hr className="div-line" />
      <div className="sec">
        <div className="eyebrow">{c.why.eyebrow}</div>
        <h2 className="stitle" dangerouslySetInnerHTML={{ __html: c.why.titleHtml }} />
        <div className="why-grid">
          {c.why.items.map((w, i) => (
            <div className="wi" key={i}>
              <div className="wi-num">{w.num}</div>
              <div className="wi-title">{w.title}</div>
              <p className="wi-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SPLIT */}
      <hr className="div-line" />
      <div className="sec" style={{ paddingTop: '0', paddingBottom: '0' }}>
        <div className="split">
          <div className="split-img">{c.split.image && <img src={c.split.image} alt="Terraza con mobiliario Universo Hostelería" />}</div>
          <div className="split-text">
            <div className="eyebrow">{c.split.eyebrow}</div>
            <h2 className="stitle" dangerouslySetInnerHTML={{ __html: c.split.titleHtml }} />
            <p>{c.split.text}</p>
            <a href={c.split.ctaHref} className="btn btn-dark">{c.split.ctaLabel}</a>
          </div>
        </div>
      </div>

      {/* SPECIALIST */}
      <hr className="div-line" />
      <div className="sec" id="especialista">
        <div className="spec-wrap">
          <div className="spec-l">
            <div className="spec-orbit"></div><div className="spec-orbit2"></div>
            <div className="spec-tag">{c.specialist.tag}</div>
            <h2 className="spec-h" dangerouslySetInnerHTML={{ __html: c.specialist.titleHtml }} />
            <p className="spec-p">{c.specialist.text}</p>
            <div className="spec-feats">
              {c.specialist.features.map((f, i) => (
                <div className="sf" key={i}><span className="sd"></span>{f}</div>
              ))}
            </div>
            <a href={c.whatsappUrl} target="_blank" rel="noopener noreferrer" className="spec-btn">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {c.specialist.ctaLabel}
            </a>
          </div>
          <div className="spec-r">
            {c.specialist.image && <img src={c.specialist.image} alt="Colección Berna" />}
          </div>
        </div>
      </div>

      {/* IMAGE BREAK 2 */}
      {c.break2Image && (
        <div className="img-break" style={{ padding: '0 32px 0' }}>
          <img src={c.break2Image} alt="Tumbonas exterior — Universo Hostelería" style={{ borderRadius: '20px' }} />
        </div>
      )}

      {/* SUPPLIERS */}
      <div className="sup-bar" style={{ marginTop: '80px' }}>
        <div className="sup-w">
          <span className="sup-label">{c.suppliers.label}</span>
          <div className="sup-logos">
            {c.suppliers.items.map((s, i) => (
              <a key={i} href={s.href} className="sup-item">
                <div className="sup-badge" style={s.badge.length > 1 ? { fontSize: '13px', color: 'var(--gray-2)' } : undefined}>{s.badge}</div>
                <span className="sup-name">{s.name}</span>
              </a>
            ))}
          </div>
          <a href={c.suppliers.ctaHref} className="btn btn-ol" style={{ fontSize: '13px', flexShrink: '0' }}>{c.suppliers.ctaLabel}</a>
        </div>
      </div>

      {/* HOW */}
      <div className="sec">
        <div className="eyebrow">{c.how.eyebrow}</div>
        <h2 className="stitle" dangerouslySetInnerHTML={{ __html: c.how.titleHtml }} />
        <div className="how-grid">
          {c.how.steps.map((step, i) => (
            <div className="hs" key={i}>
              <div className="hs-num">{step.num}</div>
              <div className="hs-icon">{HOW_ICONS[i] ?? HOW_ICONS[0]}</div>
              <div className="hs-title">{step.title}</div>
              <p className="hs-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <div className="ft">
          <div>
            <div className="fb-name">{c.footer.name}</div>
            <p className="fb-desc">{c.footer.desc}</p>
            <div className="fb-c"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1a4.5 4.5 0 0 1 4.5 4.5c0 3.5-4.5 8-4.5 8s-4.5-4.5-4.5-8A4.5 4.5 0 0 1 7 1z" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/></svg>{c.footer.location}</div>
            <div className="fb-c"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/><path d="M1.5 5.5l5.5 3.5 5.5-3.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/></svg>{c.footer.email}</div>
          </div>
          {c.footer.cols.map((col, i) => (
            <div key={i}>
              <div className="fc-label">{col.label}</div>
              <ul className="fl">
                {col.links.map((l, j) => (
                  <li key={j}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="fb">
          <span>{c.footer.copyright}</span>
          <span>{c.footer.tagline}</span>
        </div>
      </footer>
    </>
  )
}
