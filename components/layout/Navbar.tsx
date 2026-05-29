'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Universo Hostelería" width={34} height={34} priority />
          <div>
            <div className={styles.logoName}>Universo Hostelería</div>
            <div className={styles.logoSub}>Barcelona · España</div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          <li><Link href="/catalog">Catálogo</Link></li>
          <li><Link href="/catalog?category=Sillas">Sillas</Link></li>
          <li><Link href="/catalog?category=Mesas">Mesas</Link></li>
          <li><Link href="/catalog?uso=Exterior">Exterior</Link></li>
          <li><Link href="/#proveedores">Proveedores</Link></li>
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link href="/catalog" className={styles.searchBtn} aria-label="Buscar productos">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>Buscar productos…</span>
          </Link>
          <Link href="/#especialista" className="btn btn-dark" style={{fontSize:'13px',padding:'10px 18px'}}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/>
              <path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Reservar cita
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/catalog" onClick={() => setMenuOpen(false)}>Catálogo completo</Link>
          <Link href="/catalog?category=Sillas" onClick={() => setMenuOpen(false)}>Sillas</Link>
          <Link href="/catalog?category=Mesas" onClick={() => setMenuOpen(false)}>Mesas</Link>
          <Link href="/catalog?uso=Exterior" onClick={() => setMenuOpen(false)}>Exterior</Link>
          <Link href="/#especialista" onClick={() => setMenuOpen(false)}>Reservar cita</Link>
        </div>
      )}
    </nav>
  )
}
