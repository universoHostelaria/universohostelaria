import { ImageResponse } from 'next/og'

export const alt = 'Universo Hostelería — Mobiliario profesional para hostelería'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagem OpenGraph default (home, catálogo e cualquier página sin OG propia).
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f1115 0%, #1b2230 60%, #14223a 100%)',
          padding: '72px 80px',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#2f6df6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            U
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Universo Hostelería</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Mobiliario profesional
          </div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
            <span style={{ marginRight: 22 }}>para</span>
            <span style={{ color: '#5b95ff' }}>hostelería</span>
            <span>.</span>
          </div>
          <div style={{ fontSize: 30, color: '#aab3c5', marginTop: 26, fontWeight: 500 }}>
            Sillas · Mesas · Taburetes · Terraza · Exterior
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['15+ fabricantes europeos', 'Precio directo de fábrica', 'Entrega en toda España'].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 24,
                color: '#dfe5ef',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999,
                padding: '10px 22px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
