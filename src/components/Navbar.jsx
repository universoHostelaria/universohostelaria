import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="https://www.universohosteleria.com" className={styles.logo}>
        <span className={styles.logoText}>Universo</span>
        <span className={styles.logoDot}>·</span>
        <span className={styles.logoSub}>Hostelería</span>
      </a>

      <div className={styles.links}>
        <a href="#beneficios" className={styles.link}>Beneficios</a>
        <a href="#catalogo" className={styles.link}>Catálogo</a>
        <a href="#contacto" className={styles.link}>Contacto</a>
      </div>

      <div className={styles.ctas}>
        <a href="https://www.universohosteleria.com/tienda/" className={styles.ctaSecondary} target="_blank" rel="noopener noreferrer">
          Ver productos
        </a>
        <a href="https://www.universohosteleria.com/contacto/" className={styles.ctaPrimary} target="_blank" rel="noopener noreferrer">
          Hablar con un experto
        </a>
      </div>

      <button
        className={`${styles.burger} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        <a href="#beneficios" onClick={() => setMenuOpen(false)}>Beneficios</a>
        <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
        <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
        <a href="https://www.universohosteleria.com/tienda/" target="_blank" rel="noopener noreferrer">Ver productos</a>
        <a href="https://www.universohosteleria.com/contacto/" target="_blank" rel="noopener noreferrer" className={styles.mobilePrimary}>Hablar con un experto</a>
      </div>
    </nav>
  )
}
