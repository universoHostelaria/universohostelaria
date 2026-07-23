import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getPublishedPosts } from '@/lib/blog'
import styles from './blog.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Blog — Guías de mobiliario para hostelería',
  description:
    'Guías y consejos para equipar bares, restaurantes y hoteles: cómo elegir sillas, mesas, taburetes y mobiliario de exterior para hostelería en España.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog de Universo Hostelería — Guías de mobiliario para hostelería',
    description:
      'Guías prácticas para equipar tu bar, restaurante u hotel con el mobiliario adecuado.',
    url: '/blog',
    type: 'website',
  },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Navbar />
      <div className={styles.wrap}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Blog</div>
          <h1 className={styles.h1}>GUÍAS PARA <span className={styles.blue}>EQUIPAR TU NEGOCIO.</span></h1>
          <p className={styles.lead}>
            Todo lo que necesitas saber para elegir el mobiliario de tu bar, restaurante u hotel:
            materiales, medidas, mantenimiento y tendencias del sector en España.
          </p>
        </header>

        {posts.length === 0 ? (
          <p style={{ color: '#888', paddingBottom: 80 }}>Aún no hay artículos publicados.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={styles.card}>
                <div className={styles.cardImg}>
                  {p.cover_image && (
                    <Image src={p.cover_image} alt={p.title} fill sizes="(max-width:640px) 100vw, 380px" className={styles.cardImgEl} />
                  )}
                </div>
                <div className={styles.cardBody}>
                  {p.category && <div className={styles.cat}>{p.category}</div>}
                  <h2 className={styles.cardTitle}>{p.title}</h2>
                  <p className={styles.cardExcerpt}>{p.excerpt}</p>
                  <div className={styles.meta}>
                    <span>{fmtDate(p.published_at)}</span>
                    <span>·</span>
                    <span>{p.reading_min ?? 5} min de lectura</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
