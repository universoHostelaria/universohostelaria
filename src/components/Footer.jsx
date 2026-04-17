import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <a href="https://www.universohosteleria.com" className={styles.logo}>
            <span className={styles.logoText}>Universo</span>
            <span className={styles.logoDot}>·</span>
            <span className={styles.logoSub}>Hostelería</span>
          </a>
          <p className={styles.tagline}>
            Mobiliario premium para la industria<br />de la hospitalidad.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <span className={styles.colTitle}>Catálogo</span>
            <a href="https://www.universohosteleria.com/categoria-producto/sillas/" target="_blank" rel="noopener noreferrer">Sillas</a>
            <a href="https://www.universohosteleria.com/categoria-producto/mesas/" target="_blank" rel="noopener noreferrer">Mesas</a>
            <a href="https://www.universohosteleria.com/categoria-producto/sillon/" target="_blank" rel="noopener noreferrer">Sillones</a>
            <a href="https://www.universohosteleria.com/categoria-producto/taburetes/" target="_blank" rel="noopener noreferrer">Taburetes</a>
            <a href="https://www.universohosteleria.com/categoria-producto/sofas/" target="_blank" rel="noopener noreferrer">Sofás</a>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Empresa</span>
            <a href="https://www.universohosteleria.com/" target="_blank" rel="noopener noreferrer">Inicio</a>
            <a href="https://www.universohosteleria.com/tienda/" target="_blank" rel="noopener noreferrer">Tienda</a>
            <a href="https://www.universohosteleria.com/contacto/" target="_blank" rel="noopener noreferrer">Contacto</a>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Legal</span>
            <a href="https://www.universohosteleria.com/aviso-legal/" target="_blank" rel="noopener noreferrer">Aviso legal</a>
            <a href="https://www.universohosteleria.com/politica-privacidad/" target="_blank" rel="noopener noreferrer">Privacidad</a>
            <a href="https://www.universohosteleria.com/politica-cookies/" target="_blank" rel="noopener noreferrer">Cookies</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© {new Date().getFullYear()} Universo Hostelería · Todos los derechos reservados.</span>
        <div className={styles.contact}>
          <a href="tel:+34722167760">(+34) 722 16 77 60</a>
          <span>·</span>
          <a href="mailto:hola@universohosteleria.es">hola@universohosteleria.es</a>
        </div>
      </div>
    </footer>
  )
}
