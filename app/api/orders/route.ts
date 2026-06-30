import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Use service key server-side so we can bypass RLS for reading
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      empresa_nombre,
      empresa_cif,
      empresa_direccion,
      empresa_ciudad,
      empresa_cp,
      contacto_nombre,
      contacto_email,
      contacto_telefono,
      items,
      notas,
    } = body

    // Validate required fields
    if (!empresa_nombre || !contacto_nombre || !contacto_email || !items?.length) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Calculate total
    const total_estimado = items.reduce(
      (sum: number, item: { price?: number; qty: number }) =>
        sum + (item.price ?? 0) * item.qty,
      0
    )

    // Generate ID manually — avoids needing a SELECT policy for anon
    // (Supabase does INSERT ... RETURNING by default, which requires SELECT permission)
    const orderId = randomUUID()

    // Save to Supabase — no .select() to avoid RLS SELECT requirement
    const { error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        empresa_nombre,
        empresa_cif,
        empresa_direccion,
        empresa_ciudad,
        empresa_cp,
        contacto_nombre,
        contacto_email,
        contacto_telefono,
        items,
        total_estimado: total_estimado > 0 ? total_estimado : null,
        notas,
        status: 'pending',
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Error al guardar el pedido' }, { status: 500 })
    }

    // Build email notification for vendor — plain text fallback
    const itemsText = items.map((i: {
      name: string; qty: number; color?: string;
      price?: number; subtotal?: number
    }) =>
      `• ${i.name} × ${i.qty} ud${i.color ? ` (${i.color})` : ''} — ${
        i.price ? `${(i.price * i.qty).toFixed(2)} € + IVA` : 'precio a consultar'
      }`
    ).join('\n')

    const emailBody = `
NUEVA SOLICITUD DE PEDIDO — Universo Hostelería
================================================

EMPRESA
Nombre:    ${empresa_nombre}
CIF/NIF:   ${empresa_cif || '—'}
Dirección: ${empresa_direccion || '—'}
Ciudad:    ${empresa_ciudad || '—'} ${empresa_cp || ''}

RESPONSABLE
Nombre:    ${contacto_nombre}
Email:     ${contacto_email}
Teléfono:  ${contacto_telefono || '—'}

PRODUCTOS SOLICITADOS
${itemsText}

${total_estimado > 0 ? `TOTAL ESTIMADO: ${total_estimado.toFixed(2)} € + IVA` : ''}

${notas ? `NOTAS: ${notas}` : ''}

ID Solicitud: ${orderId}
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}

---
Ver todas las solicitudes en el dashboard de Supabase.
    `.trim()

    // HTML version — organized table layout
    const itemsHtml = items.map((i: {
      name: string; qty: number; color?: string;
      price?: number
    }) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #E8E8E8;font-size:13px;color:#0D0D0D">
          ${i.name}${i.color ? ` <span style="color:#AAAAAA">(${i.color})</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #E8E8E8;font-size:13px;color:#555;text-align:center">${i.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #E8E8E8;font-size:13px;color:#0D0D0D;text-align:right;font-weight:600">
          ${i.price ? `${(i.price * i.qty).toFixed(2)} €` : 'Consultar'}
        </td>
      </tr>`).join('')

    const emailHtml = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#FFFFFF">
  <div style="background:#0D0D0D;padding:24px 28px">
    <div style="font-family:Georgia,serif;font-size:20px;letter-spacing:0.02em;color:#FFFFFF;font-weight:700">UNIVERSO HOSTELERÍA</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px">Nueva solicitud de pedido</div>
  </div>

  <div style="padding:24px 28px">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#AAAAAA;padding-bottom:10px">Empresa</td></tr>
      <tr><td style="font-size:14px;color:#0D0D0D;padding:3px 0"><strong>${empresa_nombre}</strong></td></tr>
      ${empresa_cif ? `<tr><td style="font-size:13px;color:#555;padding:2px 0">CIF/NIF: ${empresa_cif}</td></tr>` : ''}
      ${empresa_direccion ? `<tr><td style="font-size:13px;color:#555;padding:2px 0">${empresa_direccion}, ${empresa_ciudad || ''} ${empresa_cp || ''}</td></tr>` : ''}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#AAAAAA;padding-bottom:10px">Responsable</td></tr>
      <tr><td style="font-size:14px;color:#0D0D0D;padding:3px 0"><strong>${contacto_nombre}</strong></td></tr>
      <tr><td style="font-size:13px;color:#555;padding:2px 0">${contacto_email}${contacto_telefono ? ` · ${contacto_telefono}` : ''}</td></tr>
    </table>

    <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#AAAAAA;padding-bottom:10px">Productos solicitados</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E8;border-radius:8px;overflow:hidden;margin-bottom:8px">
      <tr style="background:#F5F5F3">
        <td style="padding:8px 12px;font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#AAAAAA">Producto</td>
        <td style="padding:8px 12px;font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#AAAAAA;text-align:center">Cant.</td>
        <td style="padding:8px 12px;font-size:10px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#AAAAAA;text-align:right">Subtotal</td>
      </tr>
      ${itemsHtml}
    </table>

    ${total_estimado > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr>
        <td style="padding:12px;text-align:right;font-size:13px;color:#555">Total estimado</td>
        <td style="padding:12px;text-align:right;font-size:20px;font-weight:700;color:#0D0D0D;width:100px">${total_estimado.toFixed(2)} € <span style="font-size:11px;color:#AAAAAA;font-weight:400">+ IVA</span></td>
      </tr>
    </table>` : ''}

    ${notas ? `
    <div style="background:#F5F5F3;border-radius:8px;padding:12px 14px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:600;color:#AAAAAA;margin-bottom:4px">NOTAS</div>
      <div style="font-size:13px;color:#0D0D0D">${notas}</div>
    </div>` : ''}

    <div style="border-top:1px solid #E8E8E8;padding-top:16px;font-size:12px;color:#AAAAAA">
      Ref. solicitud: <strong style="color:#0D0D0D">${orderId.slice(0,8).toUpperCase()}</strong><br/>
      ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
    </div>
  </div>
</div>`.trim()


    // Send email via Resend
    const RESEND_KEY = process.env.RESEND_API_KEY
    const VENDOR_EMAIL = process.env.VENDOR_EMAIL || 'uh.dev@flowcode.cc'

    if (RESEND_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Universo Hostelería <pedidos@universohosteleria.es>',
          to: [VENDOR_EMAIL],
          reply_to: contacto_email,
          subject: `Nueva solicitud: ${empresa_nombre} — ${items.length} producto${items.length > 1 ? 's' : ''}`,
          html: emailHtml,
          text: emailBody,
        }),
      })

      if (!resendRes.ok) {
        const errText = await resendRes.text()
        console.error('Resend error:', errText)
        // Don't fail the whole request — order is already saved in Supabase
      }
    }

    return NextResponse.json({ success: true, id: orderId })

  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
