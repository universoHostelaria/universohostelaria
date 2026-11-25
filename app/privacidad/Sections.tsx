'use client'
import { useEffect, useState } from 'react'
import { CONSENT_KEY } from '@/lib/analytics'
import styles from './privacidad.module.css'

// Secciones plegadas por defecto; se abre la que indique el enlace (#privacidad o #cookies).
export default function Sections() {
  const [hash, setHash] = useState('')
  const [reset, setReset] = useState(false)
  useEffect(() => {
    const read = () => setHash(location.hash.slice(1))
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [])

  const resetConsent = () => {
    try { localStorage.removeItem(CONSENT_KEY) } catch {}
    setReset(true)
    setTimeout(() => location.reload(), 600)
  }

  return (
    <div className={styles.sections}>
      <details id="privacidad" className={styles.item} open={hash === 'privacidad' || undefined}>
        <summary>Política de privacidad</summary>
        <div className={styles.body}>
          <h3>Quién trata tus datos</h3>
          <p>Universo Hostelería (Barcelona). Contacto: <a href="mailto:hola@universohosteleria.es">hola@universohosteleria.es</a>.</p>

          <h3>Qué datos recogemos</h3>
          <p>Los que nos das al pedir un presupuesto: nombre, teléfono y, si quieres, email, nombre del negocio, ciudad y comentarios, junto con los productos que te interesan. Si nos escribes por WhatsApp o por email, también los datos de esa conversación.</p>

          <h3>Para qué los usamos</h3>
          <p>Para preparar y enviarte el presupuesto, resolver tus dudas y, si decides comprar, gestionar el pedido y la entrega. No te enviaremos publicidad sin tu permiso.</p>

          <h3>Base legal</h3>
          <p>Tu solicitud (aplicación de medidas precontractuales) y, en su caso, el contrato de compra.</p>

          <h3>Con quién los compartimos</h3>
          <p>Con los proveedores técnicos que hacen funcionar la web (alojamiento, base de datos y envío de emails), y, solo si haces un pedido, con el fabricante y el transportista necesarios para servirlo. No vendemos tus datos.</p>

          <h3>Cuánto tiempo los guardamos</h3>
          <p>Mientras tratamos tu solicitud y, si compras, durante los plazos que exige la ley. Las solicitudes sin respuesta se eliminan pasados 2 años.</p>

          <h3>Tus derechos</h3>
          <p>Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad de tus datos escribiendo a <a href="mailto:hola@universohosteleria.es">hola@universohosteleria.es</a>. Si no quedas conforme, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
        </div>
      </details>

      <details id="cookies" className={styles.item} open={hash === 'cookies' || undefined}>
        <summary>Política de cookies</summary>
        <div className={styles.body}>
          <h3>Necesarias (siempre activas)</h3>
          <p>Guardamos en tu navegador el contenido de tu pedido y tu elección sobre las cookies. No sirven para identificarte.</p>

          <h3>Medición de campañas (solo si aceptas)</h3>
          <p>Usamos Google Ads para saber si nuestros anuncios funcionan: cuántas visitas llegan desde un anuncio y cuántas acaban en una solicitud o un mensaje. Hasta que no pulsas «Aceptar» no se guarda ninguna cookie de este tipo. Duran como máximo 13 meses.</p>

          <h3>Cambiar tu elección</h3>
          <p>Puedes volver a decidir cuando quieras. También puedes borrar las cookies desde la configuración de tu navegador.</p>
          <button type="button" className={styles.resetBtn} onClick={resetConsent} disabled={reset}>
            {reset ? 'Listo, volverás a ver el aviso' : 'Cambiar preferencias de cookies'}
          </button>
        </div>
      </details>
    </div>
  )
}
