import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  const marqueeRef = useRef(null)
  const parallaxRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (parallaxRef.current) {
        const scrollY = window.scrollY
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.35}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const marqueeText = 'Mobiliario Premium · Entrega Grátis +300€ · Acceso Directo a Fabricantes · Hostelería de Alto Nivel · '

  return (
    <section className={styles.hero}>
      {/* Background texture */}
      <div className={styles.bg} />

      {/* Vertical side labels */}
      <div className={styles.sideLabel}>
        <span>Hoteles · Hostales · Eventos · Airbnb</span>
      </div>

      {/* Main content */}
      <div className={styles.content} ref={parallaxRef}>
        <div className={`${styles.eyebrow} reveal`}>
          <span className={styles.line} />
          <span>Acceso directo a fabricantes premium</span>
        </div>

        <h1 className={styles.headline}>
          <span className={`${styles.hLine} reveal stagger-1`}>El espacio</span>
          <span className={`${styles.hLineItalic} reveal stagger-2`}>que transforma</span>
          <span className={`${styles.hLine} reveal stagger-3`}>huéspedes en fans.</span>
        </h1>

        <p className={`${styles.sub} reveal stagger-4`}>
          Mobiliario y equipamiento de calidad superior, directo de fabricantes europeos. Diseñado para hoteles, hostales y espacios de hospitalidad que no aceptan lo mediocre.
        </p>

        <div className={`${styles.ctaGroup} reveal stagger-5`}>
          <a href="https://www.universohosteleria.com/tienda/" className={styles.ctaPrimary} target="_blank" rel="noopener noreferrer">
            Explorar catálogo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="https://www.universohosteleria.com/contacto/" className={styles.ctaSecondary} target="_blank" rel="noopener noreferrer">
            Hablar con un curador
          </a>
        </div>

        <div className={`${styles.stats} reveal stagger-5`}>
          <div className={styles.stat}>
            <span className={styles.statNum}>+2.000</span>
            <span className={styles.statLabel}>productos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>48/72h</span>
            <span className={styles.statLabel}>entrega</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>Gratis</span>
            <span className={styles.statLabel}>envío +300€</span>
          </div>
        </div>
      </div>

      {/* Right image collage */}
      <div className={styles.imageArea}>
        <div className={`${styles.imgCard} ${styles.imgCard1} reveal-right stagger-2`}>
          <img src="https://www.universohosteleria.com/wp-content/uploads/2024/11/SillaEmma1-scaled.jpg" alt="Silla Emma" loading="lazy" />
        </div>
        <div className={`${styles.imgCard} ${styles.imgCard2} reveal-right stagger-3`}>
          <img src="https://www.universohosteleria.com/wp-content/uploads/2024/11/MesaValencia4-scaled.jpg" alt="Mesa Valencia" loading="lazy" />
        </div>
        <div className={`${styles.imgCard} ${styles.imgCard3} reveal-right stagger-4`}>
          <img src="https://www.universohosteleria.com/wp-content/uploads/2024/11/TumbonaCancun2-1-scaled.jpg" alt="Tumbona Cancún" loading="lazy" />
        </div>
        <div className={styles.imgAccent} />
      </div>

      {/* Marquee */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marquee} ref={marqueeRef}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        <span>scroll</span>
      </div>
    </section>
  )
}
