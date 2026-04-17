import styles from './Audience.module.css'

const segments = [
  {
    label: 'Hoteles & Hostales',
    desc: 'Crea ambientes memorables que generan reseñas de cinco estrellas. Cada detalle del mobiliario refleja el nivel de tu marca.',
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  },
  {
    label: 'Restaurantes & Bares',
    desc: 'Sillas que aguantan el turno del mediodía y las noches de viernes. Estética que se convierte en parte de la experiencia.',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
  {
    label: 'Espacios para eventos',
    desc: 'Versatilidad y durabilidad para los escenarios más exigentes. Mobiliario que transforma cualquier espacio.',
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  },
  {
    label: 'Airbnb & Apartamentos',
    desc: 'Destaca en las plataformas con un interiorismo que enamora desde la primera foto. Calidad premium al precio adecuado.',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  },
]

export default function Audience() {
  return (
    <section className={styles.section} id="para-quien">
      <div className={styles.inner}>
        <div className={styles.textSide}>
          <div className={`${styles.label} reveal`}>
            <span className={styles.labelLine} />
            Nuestro cliente ideal
          </div>
          <h2 className={`${styles.title} reveal stagger-1`}>
            Hecho para los que<br />
            <em>viven de la hospitalidad</em>
          </h2>
          <p className={`${styles.desc} reveal stagger-2`}>
            No vendemos muebles genéricos. Equipamos espacios donde la experiencia del huésped es el negocio. Si tu espacio es tu producto, necesitás mobiliario que lo respalde.
          </p>
          <a href="https://www.universohosteleria.com/tienda/" className={`${styles.cta} reveal stagger-3`} target="_blank" rel="noopener noreferrer">
            Ver el catálogo completo
          </a>
        </div>

        <div className={styles.cardGrid}>
          {segments.map((s, i) => (
            <div key={s.label} className={`${styles.card} reveal stagger-${i + 1}`}>
              <div className={styles.cardImg}>
                <img src={s.img} alt={s.label} loading="lazy" />
                <div className={styles.cardOverlay} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardLabel}>{s.label}</h3>
                <p className={styles.cardDesc}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
