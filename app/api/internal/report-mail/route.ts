import { NextRequest, NextResponse } from 'next/server'

// Envío del informe diario de Google Ads (lo llama el GitHub Action).
// Autorización: la clave service_role de Supabase en "Authorization: Bearer …".
// Se valida contra Supabase (endpoint de admin), así no hace falta otro secreto en Vercel.
// Solo envía a destinatarios de esta lista.
const ALLOWED_TO = new Set(['lucas.carmo@flowcode.cc', 'hugo.carmo@flowcode.cc'])

async function isServiceRole(key: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !key) return false
  const r = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  return r.ok
}

export async function POST(req: NextRequest) {
  const key = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!(await isServiceRole(key))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { to, subject, html, text } = await req.json().catch(() => ({}))
  const recipients: string[] = (Array.isArray(to) ? to : [to]).map((x: unknown) => String(x).trim().toLowerCase()).filter(Boolean)
  if (!recipients.length || recipients.some((r) => !ALLOWED_TO.has(r))) {
    return NextResponse.json({ error: 'Destinatario no permitido' }, { status: 400 })
  }
  if (!subject || !html) return NextResponse.json({ error: 'Falta subject o html' }, { status: 400 })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return NextResponse.json({ error: 'Email no configurado' }, { status: 500 })

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Universo Hostelería · Informes <pedidos@universohosteleria.es>',
      to: recipients,
      reply_to: 'lucas.carmo@flowcode.cc',
      subject: String(subject).slice(0, 200),
      html: String(html),
      text: text ? String(text) : undefined,
    }),
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) return NextResponse.json({ error: 'Resend', detail: body }, { status: 502 })
  return NextResponse.json({ ok: true, id: body.id, to: recipients })
}
