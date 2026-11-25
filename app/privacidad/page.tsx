import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Sections from './Sections'
import styles from './privacidad.module.css'

export const metadata: Metadata = {
  title: 'Privacidad y cookies',
  description: 'Cómo tratamos tus datos y qué cookies usa la web de Universo Hostelería.',
  alternates: { canonical: '/privacidad' },
}

export default function PrivacidadPage() {
  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <div className="eyebrow">Información legal</div>
        <h1 className={styles.title}>Privacidad y cookies</h1>
        <p className={styles.lead}>
          Usamos tus datos solo para responder a tus solicitudes de presupuesto. Si tienes cualquier duda,
          escríbenos a <a href="mailto:hola@universohosteleria.es">hola@universohosteleria.es</a>.
        </p>
        <Sections />
        <p className={styles.updated}>Última actualización: noviembre de 2026</p>
      </main>
      <Footer />
    </>
  )
}
