import styles from './CTA.module.css'

export default function CTA() {
  return (
    <section className={styles.section} id="contacto">
      <div className={styles.inner}>
        <div className={`${styles.badge} reveal`}>
          <span>(+34) 722 16 77 60</span>
        </div>

        <h2 className={`${styles.title} reveal stagger-1`}>
          ¿Listo para elevar<br />
          <em>la experiencia de tus huéspedes?</em>
        </h2>

        <p className={`${styles.sub} reveal stagger-2`}>
          Nuestros curadores están disponibles para ayudarte a elegir el mobiliario perfecto para tu espacio. Sin compromiso, con criterio.
        </p>

        <div className={`${styles.actions} reveal stagger-3`}>
          <a href="https://www.universohosteleria.com/tienda/" className={styles.primary} target="_blank" rel="noopener noreferrer">
            Explorar catálogo
          </a>
          <a href="https://www.universohosteleria.com/contacto/" className={styles.secondary} target="_blank" rel="noopener noreferrer">
            Hablar con un curador
          </a>
        </div>

        <div className={`${styles.details} reveal stagger-4`}>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>✉</span>
            <a href="mailto:hola@universohosteleria.es">hola@universohosteleria.es</a>
          </div>
          <span className={styles.sep}>·</span>
          <div className={styles.detail}>
            <span className={styles.detailIcon}>☎</span>
            <a href="tel:+34722167760">(+34) 722 16 77 60</a>
          </div>
          <span className={styles.sep}>·</span>
          <div className={styles.detail}>
            <span>Entrega 48/72h · Envío gratis +300€</span>
          </div>
        </div>
      </div>

      <div className={styles.decoration}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.grid} />
      </div>
    </section>
  )
}
