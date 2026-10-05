import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './gracias.module.css'

export const metadata: Metadata = {
  title: 'Solicitud enviada',
  description: 'Hemos recibido tu solicitud de presupuesto. Te contactaremos en menos de 24 horas hábiles.',
  robots: { index: false, follow: false },
}

type Props = { searchParams: { ref?: string } }

export default function GraciasPage({ searchParams }: Props) {
  // Solo aceptamos una referencia corta alfanumérica (evita inyectar texto arbitrario)
  const ref = /^[A-Z0-9]{4,12}$/.test(searchParams.ref ?? '') ? searchParams.ref : null

  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <div className={styles.icon}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#16A34A" />
            <path d="M8 16l5.5 5.5L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="eyebrow">Solicitud enviada</div>
        <h1 className={styles.title}>
          ¡GRACIAS! <span style={{ color: '#2B6FD4' }}>YA LA TENEMOS.</span>
        </h1>
        <p className={styles.text}>
          Hemos recibido tu solicitud correctamente. Nuestro especialista la revisará y te contactará en menos de{' '}
          <strong>24 horas hábiles</strong> con una oferta personalizada.
        </p>
        {ref && (
          <div className={styles.ref}>
            Ref. solicitud: <strong>{ref}</strong>
          </div>
        )}
        <div className={styles.actions}>
          <Link href="/catalog" className="btn btn-ol">Seguir viendo el catálogo</Link>
          <Link
            href="https://wa.me/34665953186?text=Hola%2C%20acabo%20de%20enviar%20una%20solicitud%20de%20presupuesto%20en%20la%20web."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.wa}
          >
            ¿Tienes prisa? Escríbenos por WhatsApp
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
