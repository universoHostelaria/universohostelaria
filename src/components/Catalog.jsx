import styles from './Catalog.module.css'

const categories = [
  { name: 'Sillas', count: '241', url: 'https://www.universohosteleria.com/categoria-producto/sillas/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/SillaEmma1-scaled.jpg' },
  { name: 'Mesas', count: '+1.400', url: 'https://www.universohosteleria.com/categoria-producto/mesas/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/MesaValencia4-scaled.jpg' },
  { name: 'Sillones', count: '139', url: 'https://www.universohosteleria.com/categoria-producto/sillon/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/TumbonaBari2-scaled.jpg' },
  { name: 'Sofás', count: '39', url: 'https://www.universohosteleria.com/categoria-producto/sofas/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/TumbonaCancun2-1-scaled.jpg' },
  { name: 'Taburetes', count: '178', url: 'https://www.universohosteleria.com/categoria-producto/taburetes/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/SillaEmma1-scaled.jpg' },
  { name: 'Tumbonas', count: '9', url: 'https://www.universohosteleria.com/categoria-producto/tumbonas/', img: 'https://www.universohosteleria.com/wp-content/uploads/2024/11/TumbonaBari4-300x300.png' },
]

export default function Catalog() {
  return (
    <section className={styles.section} id="catalogo">
      <div className={styles.header}>
        <div className={`${styles.label} reveal`}>
          <span className={styles.labelLine} />
          Catálogo
        </div>
        <div className={styles.headerRow}>
          <h2 className={`${styles.title} reveal stagger-1`}>
            Más de 2.000 referencias<br />
            <em>para equipar tu espacio</em>
          </h2>
          <a href="https://www.universohosteleria.com/tienda/" className={`${styles.viewAll} reveal stagger-2`} target="_blank" rel="noopener noreferrer">
            Ver toda la tienda →
          </a>
        </div>
      </div>

      <div className={styles.list}>
        {categories.map((cat, i) => (
          <a key={cat.name} href={cat.url} className={`${styles.item} reveal stagger-${i % 3 + 1}`} target="_blank" rel="noopener noreferrer">
            <div className={styles.itemImg}>
              <img src={cat.img} alt={cat.name} loading="lazy" />
            </div>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{cat.name}</span>
              <span className={styles.itemCount}>{cat.count} productos</span>
            </div>
            <span className={styles.arrow}>→</span>
          </a>
        ))}
      </div>
    </section>
  )
}
