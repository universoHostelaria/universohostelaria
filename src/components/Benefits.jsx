import styles from './Benefits.module.css'

const benefits = [
  {
    num: '01',
    title: 'Acceso directo a fabricantes',
    desc: 'Sin intermediarios. Comprás directamente de los mejores fabricantes europeos, con precios de mayorista y calidad de exportación.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L25 8.5V19.5L14 25L3 19.5V8.5L14 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M14 3v22M3 8.5l11 5.5 11-5.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
  },
  {
    num: '02',
    title: 'Envío gratuito a partir de 300€',
    desc: 'Con pedidos desde 300€, el envío corre por nuestra cuenta. Ahorrás en logística y recibís en 48/72 horas.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="10" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M21 14h2.5l2.5 3v5h-5V14Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <circle cx="8" cy="22" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="20" cy="22" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M3 14h18" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    )
  },
  {
    num: '03',
    title: 'Calidad que se nota y se queda',
    desc: 'Mobiliario construido para resistir el uso diario de la hostelería. Materiales premium, acabados duraderos, estética que impresiona.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l2.9 6.1 6.6.9-4.8 4.7 1.1 6.6L14 19.3l-5.8 3 1.1-6.6L4.5 11l6.6-.9L14 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    num: '04',
    title: 'Asesoría de curadores expertos',
    desc: 'No estás solo. Nuestro equipo te acompaña para elegir lo que mejor encaja con tu espacio, estilo y presupuesto.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    )
  }
]

export default function Benefits() {
  return (
    <section className={styles.section} id="beneficios">
      <div className={styles.header}>
        <div className={`${styles.label} reveal`}>
          <span className={styles.labelLine} />
          Por qué elegirnos
        </div>
        <h2 className={`${styles.title} reveal stagger-1`}>
          Todo lo que tu negocio<br />
          <em>necesita para brillar</em>
        </h2>
      </div>

      <div className={styles.grid}>
        {benefits.map((b, i) => (
          <div key={b.num} className={`${styles.card} reveal stagger-${i + 1}`}>
            <div className={styles.cardTop}>
              <span className={styles.num}>{b.num}</span>
              <span className={styles.icon}>{b.icon}</span>
            </div>
            <h3 className={styles.cardTitle}>{b.title}</h3>
            <p className={styles.cardDesc}>{b.desc}</p>
          </div>
        ))}
      </div>

      <div className={`${styles.cta} reveal`}>
        <a href="https://www.universohosteleria.com/contacto/" className={styles.ctaLink} target="_blank" rel="noopener noreferrer">
          Hablar con un especialista
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  )
}
