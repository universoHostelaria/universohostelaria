import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getPost, renderMarkdown } from '@/lib/blog'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import styles from '../blog.module.css'

export const revalidate = 300

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Artículo no encontrado' }
  const url = `/blog/${post.slug}`
  const desc = post.meta_description || post.excerpt || undefined
  return {
    title: post.meta_title || post.title,
    description: desc,
    keywords: post.keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.meta_title || post.title,
      description: desc,
      url,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: desc,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const html = renderMarkdown(post.content)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: post.author || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'es-ES',
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />

      <div className={styles.bc}>
        <Link href="/">Inicio</Link><span>/</span>
        <Link href="/blog">Blog</Link><span>/</span>
      </div>

      <article className={styles.article}>
        {post.category && <div className={styles.artCat}>{post.category}</div>}
        <h1 className={styles.artTitle}>{post.title}</h1>
        <div className={styles.artMeta}>
          <span>{post.author || SITE_NAME}</span>
          <span>·</span>
          <span>{fmtDate(post.published_at)}</span>
          <span>·</span>
          <span>{post.reading_min ?? 5} min de lectura</span>
        </div>

        {post.cover_image && (
          <div className={styles.cover}>
            <Image src={post.cover_image} alt={post.title} fill sizes="(max-width:760px) 100vw, 760px" className={styles.coverEl} priority />
          </div>
        )}

        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />

        <div className={styles.cta}>
          <div>
            <div className={styles.ctaTitle}>¿LISTO PARA EQUIPAR TU NEGOCIO?</div>
            <div className={styles.ctaP}>Explora el catálogo o habla con un especialista sin compromiso.</div>
          </div>
          <Link href="/catalog" className={styles.ctaBtn}>Ver el catálogo</Link>
        </div>

        <Link href="/blog" className={styles.backLink}>← Volver al blog</Link>
      </article>

      <Footer />
    </>
  )
}
