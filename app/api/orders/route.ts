import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Save to Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert({
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
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Error al guardar el pedido' }, { status: 500 })
    }

    // Build email notification for vendor
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

ID Solicitud: ${data.id}
Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}

---
Ver todas las solicitudes en el dashboard de Supabase.
    `.trim()

    // Send email via Resend (if configured) or fallback to mailto
    // Using fetch to Resend API
    const RESEND_KEY = process.env.RESEND_API_KEY
    const VENDOR_EMAIL = process.env.VENDOR_EMAIL || 'hola@universohosteleria.es'

    if (RESEND_KEY) {
      await fetch('https://api.resend.com/emails', {
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
          text: emailBody,
        }),
      })
    }

    return NextResponse.json({ success: true, id: data.id })

  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
