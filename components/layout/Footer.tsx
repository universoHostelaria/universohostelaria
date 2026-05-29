import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <div className={styles.brand}>Universo Hostelería</div>
          <p className={styles.desc}>
            El mayor marketplace de mobiliario para hostelería en España.
            15+ fabricantes, 10.000+ productos, un especialista para ti.
          </p>
          <div className={styles.contact}>
            <span>📍</span> Barcelona, España
          </div>
          <div className={styles.contact}>
            <span>✉️</span> hola@universohosteleria.es
          </div>
        </div>
        <div>
          <div className={styles.colLabel}>Catálogo</div>
          <ul className={styles.links}>
            <li><Link href="/catalog?category=Sillas">Sillas</Link></li>
            <li><Link href="/catalog?category=Mesas">Mesas</Link></li>
            <li><Link href="/catalog?category=Taburetes">Taburetes</Link></li>
            <li><Link href="/catalog?uso=Exterior">Exterior</Link></li>
            <li><Link href="/catalog?category=Sillones">Sillones</Link></li>
          </ul>
        </div>
        <div>
          <div className={styles.colLabel}>Empresa</div>
          <ul className={styles.links}>
            <li><Link href="/#nosotros">Sobre nosotros</Link></li>
            <li><Link href="/#proveedores">Fabricantes</Link></li>
            <li><Link href="/#como-funciona">Cómo funciona</Link></li>
          </ul>
        </div>
        <div>
          <div className={styles.colLabel}>Soporte</div>
          <ul className={styles.links}>
            <li><Link href="/#especialista">Cita con especialista</Link></li>
            <li><Link href="mailto:hola@universohosteleria.es">Contacto</Link></li>
            <li><Link href="/legal">Aviso legal</Link></li>
            <li><Link href="/privacidad">Privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Universo Hostelería · Barcelona</span>
        <span>El mayor marketplace de mobiliario para hostelería en España</span>
      </div>
    </footer>
  )
}
