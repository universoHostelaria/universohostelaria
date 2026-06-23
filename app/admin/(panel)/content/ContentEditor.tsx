'use client'

import { useState, useTransition } from 'react'
import { saveHomeContent, uploadSiteImage } from './actions'
import type { HomeContent } from '@/lib/home-content'

export default function ContentEditor({ initial }: { initial: HomeContent }) {
  const [c, setC] = useState<HomeContent>(initial)
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Aplica uma mutação imutável ao conteúdo.
  function patch(fn: (draft: HomeContent) => void) {
    const next = structuredClone(c)
    fn(next)
    setC(next)
  }

  function save() {
    setMsg(null)
    startTransition(async () => {
      const r = await saveHomeContent(c)
      setMsg(r.ok ? { ok: true, text: 'Guardado. La home se actualizó.' } : { ok: false, text: r.error || 'Error' })
    })
  }

  return (
    <>
      <div className="adm-row-between" style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--adm-bg)', paddingTop: 4 }}>
        <div>
          <h1 className="adm-h1">Contenido de la Home</h1>
          <p className="adm-sub">Edita textos e imágenes. Los cambios se publican al guardar.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="/" target="_blank" className="adm-btn adm-btn-ghost">Ver home ↗</a>
          <button className="adm-btn" onClick={save} disabled={pending}>{pending ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </div>

      {msg && <div className={msg.ok ? 'adm-ok' : 'adm-error'}>{msg.text}</div>}

      {/* SEO + GLOBAL */}
      <Section title="General / SEO">
        <Text label="Título SEO (pestaña/Google)" v={c.seo.title} on={(v) => patch((d) => { d.seo.title = v })} />
        <Area label="Descripción SEO" v={c.seo.description} on={(v) => patch((d) => { d.seo.description = v })} />
        <Text label="Enlace de WhatsApp (todos los botones de cita)" v={c.whatsappUrl} on={(v) => patch((d) => { d.whatsappUrl = v })} />
        <Img label="Logo" slot="logo" v={c.logo} on={(v) => patch((d) => { d.logo = v })} />
      </Section>

      {/* NAV */}
      <Section title="Navegación (menú superior)">
        <Text label="Texto del buscador" v={c.nav.searchText} on={(v) => patch((d) => { d.nav.searchText = v })} />
        <Text label="Botón de cita" v={c.nav.ctaLabel} on={(v) => patch((d) => { d.nav.ctaLabel = v })} />
        <ArrEditor
          label="Enlaces del menú"
          items={c.nav.links}
          onAdd={() => patch((d) => { d.nav.links.push({ label: 'Nuevo', href: '/' }) })}
          onDel={(i) => patch((d) => { d.nav.links.splice(i, 1) })}
          render={(l, i) => (
            <Row>
              <Text label="Texto" v={l.label} on={(v) => patch((d) => { d.nav.links[i].label = v })} />
              <Text label="Enlace" v={l.href} on={(v) => patch((d) => { d.nav.links[i].href = v })} />
            </Row>
          )}
        />
      </Section>

      {/* ANUNCIO */}
      <Section title="Barra de anuncio">
        <Area label="Texto (admite HTML, ej. <strong>)" v={c.announcement.textHtml} on={(v) => patch((d) => { d.announcement.textHtml = v })} html />
        <Text label="Texto del enlace" v={c.announcement.linkLabel} on={(v) => patch((d) => { d.announcement.linkLabel = v })} />
      </Section>

      {/* HERO */}
      <Section title="Hero (cabecera principal)">
        <Img label="Imagen del hero" slot="hero" v={c.hero.image} on={(v) => patch((d) => { d.hero.image = v })} />
        <Area label="Título (HTML: usa <br/> y <span class='blue'>…</span> para el azul)" v={c.hero.titleHtml} on={(v) => patch((d) => { d.hero.titleHtml = v })} html />
        <Area label="Subtítulo (HTML)" v={c.hero.subtitleHtml} on={(v) => patch((d) => { d.hero.subtitleHtml = v })} html />
        <Row>
          <Text label="Botón 1 — texto" v={c.hero.cta1.label} on={(v) => patch((d) => { d.hero.cta1.label = v })} />
          <Text label="Botón 1 — enlace" v={c.hero.cta1.href} on={(v) => patch((d) => { d.hero.cta1.href = v })} />
        </Row>
        <Text label="Botón 2 — texto (lleva a WhatsApp)" v={c.hero.cta2Label} on={(v) => patch((d) => { d.hero.cta2Label = v })} />
        <ArrEditor
          label="Estadísticas (3 números)"
          items={c.hero.stats}
          onAdd={() => patch((d) => { d.hero.stats.push({ val: '', sup: '', label: '' }) })}
          onDel={(i) => patch((d) => { d.hero.stats.splice(i, 1) })}
          render={(s, i) => (
            <Row3>
              <Text label="Número" v={s.val} on={(v) => patch((d) => { d.hero.stats[i].val = v })} />
              <Text label="Sufijo (+, años…)" v={s.sup} on={(v) => patch((d) => { d.hero.stats[i].sup = v })} />
              <Text label="Etiqueta" v={s.label} on={(v) => patch((d) => { d.hero.stats[i].label = v })} />
            </Row3>
          )}
        />
      </Section>

      {/* TRUST */}
      <Section title="Barra de confianza (5 ítems)">
        <ArrEditor
          label="Ítems"
          items={c.trust}
          onAdd={() => patch((d) => { d.trust.push('Nuevo ítem') })}
          onDel={(i) => patch((d) => { d.trust.splice(i, 1) })}
          render={(t, i) => <Text label={`Ítem ${i + 1}`} v={t} on={(v) => patch((d) => { d.trust[i] = v })} />}
        />
      </Section>

      {/* CATEGORIES */}
      <Section title="Categorías">
        <Row>
          <Text label="Eyebrow" v={c.categories.eyebrow} on={(v) => patch((d) => { d.categories.eyebrow = v })} />
          <Text label="Botón — texto" v={c.categories.ctaLabel} on={(v) => patch((d) => { d.categories.ctaLabel = v })} />
        </Row>
        <Area label="Título (HTML)" v={c.categories.titleHtml} on={(v) => patch((d) => { d.categories.titleHtml = v })} html />
        <ArrEditor
          label="Tarjetas (la última se muestra destacada)"
          items={c.categories.cards}
          onAdd={() => patch((d) => { d.categories.cards.push({ n: '', name: '', count: '', href: '/catalog' }) })}
          onDel={(i) => patch((d) => { d.categories.cards.splice(i, 1) })}
          render={(card, i) => (
            <>
              <Row3>
                <Text label="Número" v={card.n} on={(v) => patch((d) => { d.categories.cards[i].n = v })} />
                <Text label="Nombre" v={card.name} on={(v) => patch((d) => { d.categories.cards[i].name = v })} />
                <Text label="Subtexto" v={card.count} on={(v) => patch((d) => { d.categories.cards[i].count = v })} />
              </Row3>
              <Text label="Enlace" v={card.href} on={(v) => patch((d) => { d.categories.cards[i].href = v })} />
            </>
          )}
        />
      </Section>

      {/* FEATURED */}
      <Section title="Productos destacados (cabecera)">
        <Row>
          <Text label="Eyebrow" v={c.featured.eyebrow} on={(v) => patch((d) => { d.featured.eyebrow = v })} />
          <Text label="Botón — texto" v={c.featured.ctaLabel} on={(v) => patch((d) => { d.featured.ctaLabel = v })} />
        </Row>
        <Area label="Título (HTML)" v={c.featured.titleHtml} on={(v) => patch((d) => { d.featured.titleHtml = v })} html />
        <p className="adm-muted" style={{ fontSize: 12 }}>Los productos mostrados salen del catálogo (los marcados como destacados/nuevos con imagen).</p>
      </Section>

      {/* IMAGE BREAKS */}
      <Section title="Imágenes de ancho completo">
        <Img label="Imagen 1 (entre destacados y «por qué»)" slot="break1" v={c.break1Image} on={(v) => patch((d) => { d.break1Image = v })} />
        <Img label="Imagen 2 (tumbonas, antes de fabricantes)" slot="break2" v={c.break2Image} on={(v) => patch((d) => { d.break2Image = v })} />
      </Section>

      {/* WHY */}
      <Section title="Por qué elegirnos">
        <Text label="Eyebrow" v={c.why.eyebrow} on={(v) => patch((d) => { d.why.eyebrow = v })} />
        <Area label="Título (HTML)" v={c.why.titleHtml} on={(v) => patch((d) => { d.why.titleHtml = v })} html />
        <ArrEditor
          label="Ítems"
          items={c.why.items}
          onAdd={() => patch((d) => { d.why.items.push({ num: '', title: '', desc: '' }) })}
          onDel={(i) => patch((d) => { d.why.items.splice(i, 1) })}
          render={(w, i) => (
            <>
              <Row>
                <Text label="Número/destacado" v={w.num} on={(v) => patch((d) => { d.why.items[i].num = v })} />
                <Text label="Título" v={w.title} on={(v) => patch((d) => { d.why.items[i].title = v })} />
              </Row>
              <Area label="Descripción" v={w.desc} on={(v) => patch((d) => { d.why.items[i].desc = v })} />
            </>
          )}
        />
      </Section>

      {/* SPLIT */}
      <Section title="Bloque «Exterior & Terraza»">
        <Img label="Imagen" slot="split" v={c.split.image} on={(v) => patch((d) => { d.split.image = v })} />
        <Row>
          <Text label="Eyebrow" v={c.split.eyebrow} on={(v) => patch((d) => { d.split.eyebrow = v })} />
          <Text label="Botón — texto" v={c.split.ctaLabel} on={(v) => patch((d) => { d.split.ctaLabel = v })} />
        </Row>
        <Area label="Título (HTML)" v={c.split.titleHtml} on={(v) => patch((d) => { d.split.titleHtml = v })} html />
        <Area label="Texto" v={c.split.text} on={(v) => patch((d) => { d.split.text = v })} />
        <Text label="Botón — enlace" v={c.split.ctaHref} on={(v) => patch((d) => { d.split.ctaHref = v })} />
      </Section>

      {/* SPECIALIST */}
      <Section title="Especialista">
        <Img label="Imagen" slot="specialist" v={c.specialist.image} on={(v) => patch((d) => { d.specialist.image = v })} />
        <Row>
          <Text label="Etiqueta (tag)" v={c.specialist.tag} on={(v) => patch((d) => { d.specialist.tag = v })} />
          <Text label="Botón — texto (WhatsApp)" v={c.specialist.ctaLabel} on={(v) => patch((d) => { d.specialist.ctaLabel = v })} />
        </Row>
        <Area label="Título (HTML)" v={c.specialist.titleHtml} on={(v) => patch((d) => { d.specialist.titleHtml = v })} html />
        <Area label="Texto" v={c.specialist.text} on={(v) => patch((d) => { d.specialist.text = v })} />
        <ArrEditor
          label="Lista de ventajas"
          items={c.specialist.features}
          onAdd={() => patch((d) => { d.specialist.features.push('Nueva ventaja') })}
          onDel={(i) => patch((d) => { d.specialist.features.splice(i, 1) })}
          render={(f, i) => <Text label={`Ventaja ${i + 1}`} v={f} on={(v) => patch((d) => { d.specialist.features[i] = v })} />}
        />
      </Section>

      {/* SUPPLIERS */}
      <Section title="Fabricantes (barra)">
        <Row>
          <Text label="Etiqueta" v={c.suppliers.label} on={(v) => patch((d) => { d.suppliers.label = v })} />
          <Text label="Botón — texto" v={c.suppliers.ctaLabel} on={(v) => patch((d) => { d.suppliers.ctaLabel = v })} />
        </Row>
        <Text label="Botón — enlace" v={c.suppliers.ctaHref} on={(v) => patch((d) => { d.suppliers.ctaHref = v })} />
        <ArrEditor
          label="Logos / iniciales"
          items={c.suppliers.items}
          onAdd={() => patch((d) => { d.suppliers.items.push({ badge: '', name: '', href: '/catalog' }) })}
          onDel={(i) => patch((d) => { d.suppliers.items.splice(i, 1) })}
          render={(s, i) => (
            <Row3>
              <Text label="Inicial/badge" v={s.badge} on={(v) => patch((d) => { d.suppliers.items[i].badge = v })} />
              <Text label="Nombre" v={s.name} on={(v) => patch((d) => { d.suppliers.items[i].name = v })} />
              <Text label="Enlace" v={s.href} on={(v) => patch((d) => { d.suppliers.items[i].href = v })} />
            </Row3>
          )}
        />
      </Section>

      {/* HOW */}
      <Section title="Proceso (4 pasos)">
        <Text label="Eyebrow" v={c.how.eyebrow} on={(v) => patch((d) => { d.how.eyebrow = v })} />
        <Area label="Título (HTML)" v={c.how.titleHtml} on={(v) => patch((d) => { d.how.titleHtml = v })} html />
        <ArrEditor
          label="Pasos"
          items={c.how.steps}
          onAdd={() => patch((d) => { d.how.steps.push({ num: '', title: '', desc: '' }) })}
          onDel={(i) => patch((d) => { d.how.steps.splice(i, 1) })}
          render={(s, i) => (
            <>
              <Row>
                <Text label="Número" v={s.num} on={(v) => patch((d) => { d.how.steps[i].num = v })} />
                <Text label="Título" v={s.title} on={(v) => patch((d) => { d.how.steps[i].title = v })} />
              </Row>
              <Area label="Descripción" v={s.desc} on={(v) => patch((d) => { d.how.steps[i].desc = v })} />
            </>
          )}
        />
      </Section>

      {/* FOOTER */}
      <Section title="Pie de página">
        <Row>
          <Text label="Nombre" v={c.footer.name} on={(v) => patch((d) => { d.footer.name = v })} />
          <Text label="Ubicación" v={c.footer.location} on={(v) => patch((d) => { d.footer.location = v })} />
        </Row>
        <Area label="Descripción" v={c.footer.desc} on={(v) => patch((d) => { d.footer.desc = v })} />
        <Text label="Email" v={c.footer.email} on={(v) => patch((d) => { d.footer.email = v })} />
        <Row>
          <Text label="Copyright" v={c.footer.copyright} on={(v) => patch((d) => { d.footer.copyright = v })} />
          <Text label="Tagline (derecha)" v={c.footer.tagline} on={(v) => patch((d) => { d.footer.tagline = v })} />
        </Row>
        <ArrEditor
          label="Columnas de enlaces"
          items={c.footer.cols}
          onAdd={() => patch((d) => { d.footer.cols.push({ label: 'NUEVA', links: [] }) })}
          onDel={(i) => patch((d) => { d.footer.cols.splice(i, 1) })}
          render={(col, i) => (
            <>
              <Text label="Título de columna" v={col.label} on={(v) => patch((d) => { d.footer.cols[i].label = v })} />
              <ArrEditor
                label="Enlaces"
                items={col.links}
                onAdd={() => patch((d) => { d.footer.cols[i].links.push({ label: 'Nuevo', href: '/' }) })}
                onDel={(j) => patch((d) => { d.footer.cols[i].links.splice(j, 1) })}
                render={(l, j) => (
                  <Row>
                    <Text label="Texto" v={l.label} on={(v) => patch((d) => { d.footer.cols[i].links[j].label = v })} />
                    <Text label="Enlace" v={l.href} on={(v) => patch((d) => { d.footer.cols[i].links[j].href = v })} />
                  </Row>
                )}
              />
            </>
          )}
        />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0 40px' }}>
        <button className="adm-btn" onClick={save} disabled={pending}>{pending ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
    </>
  )
}

// ── Componentes auxiliares ──────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="adm-card" style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 15, margin: '0 0 16px' }}>{title}</h2>
      {children}
    </div>
  )
}

function Text({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      <input className="adm-input" value={v} onChange={(e) => on(e.target.value)} />
    </div>
  )
}

function Area({ label, v, on, html }: { label: string; v: string; on: (v: string) => void; html?: boolean }) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      <textarea className="adm-textarea" value={v} onChange={(e) => on(e.target.value)} style={html ? { fontFamily: 'monospace', fontSize: 12.5 } : undefined} />
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="adm-field-row">{children}</div>
}
function Row3({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>{children}</div>
}

function Img({ label, slot, v, on }: { label: string; slot: string; v: string; on: (v: string) => void }) {
  const [busy, setBusy] = useState(false)
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    const fd = new FormData()
    fd.set('file', f)
    fd.set('slot', slot)
    const r = await uploadSiteImage(fd)
    setBusy(false)
    if (r.url) on(r.url)
    else alert(r.error || 'Error al subir')
  }
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {v ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v} alt="" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, background: 'var(--adm-bg)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 120, height: 80, borderRadius: 8, background: 'var(--adm-bg)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <input type="file" accept="image/*" className="adm-input" onChange={onFile} disabled={busy} />
          <input className="adm-input" style={{ marginTop: 8 }} value={v} onChange={(e) => on(e.target.value)} placeholder="…o pega una URL" />
          {busy && <div className="adm-muted" style={{ fontSize: 12, marginTop: 4 }}>Subiendo…</div>}
        </div>
      </div>
    </div>
  )
}

function ArrEditor<T>({
  label, items, onAdd, onDel, render,
}: {
  label: string
  items: T[]
  onAdd: () => void
  onDel: (i: number) => void
  render: (item: T, i: number) => React.ReactNode
}) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ border: '1px solid var(--adm-border)', borderRadius: 8, padding: 12, position: 'relative' }}>
            <button
              type="button"
              className="adm-btn adm-btn-danger adm-btn-sm"
              style={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => onDel(i)}
            >
              ✕
            </button>
            {render(item, i)}
          </div>
        ))}
      </div>
      <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" style={{ marginTop: 10 }} onClick={onAdd}>+ Añadir</button>
    </div>
  )
}
