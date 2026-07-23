/**
 * Seed de 5 artículos SEO (ES) en blog_posts. Idempotente (upsert).
 * Requiere que exista la tabla blog_posts (supabase/blog.sql).
 * Run: node scripts/seed_blog.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '../.env.local') })

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
const IMG = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/campaign`

const words = (t) => t.split(/\s+/).filter(Boolean).length
const rmin = (t) => Math.max(1, Math.round(words(t) / 200))

const posts = [
  {
    slug: 'como-elegir-sillas-para-bar-o-restaurante',
    title: 'Cómo elegir sillas para tu bar o restaurante',
    category: 'Guías',
    cover_image: `${IMG}/silla-shell-0.jpg`,
    excerpt: 'Comodidad, materiales, resistencia y estilo: la guía completa para acertar con las sillas de tu local de hostelería en España.',
    meta_title: 'Cómo elegir sillas para bar o restaurante | Guía 2026',
    meta_description: 'Guía práctica para elegir sillas de hostelería: comodidad, materiales, resistencia (CATAS), medidas y estilo para bares, restaurantes y hoteles en España.',
    keywords: ['sillas para hostelería', 'sillas para bares', 'sillas para restaurantes', 'sillas de hostelería', 'mobiliario de hostelería'],
    content: `La silla es el mueble que más veces se usa en un local de hostelería y, a la vez, el que más sufre. Elegir bien no es solo una cuestión de estética: afecta a la comodidad de tus clientes, a la rotación de mesas y al gasto que tendrás en reposiciones dentro de dos o tres años. En esta guía te explicamos, paso a paso, cómo elegir sillas para un **bar o restaurante** sin equivocarte.

## 1. La comodidad manda

Un cliente cómodo se queda más, consume más y vuelve. Pero "cómodo" no significa lo mismo en todos los locales:

- En un **bar de tapas** o cafetería con alta rotación, buscas una silla cómoda para 30–60 minutos, ligera y fácil de mover.
- En un **restaurante de sobremesa**, la comodidad para estancias largas es prioritaria: respaldo con buen apoyo lumbar y, a menudo, asiento tapizado.

Fíjate siempre en la **altura del asiento** (42–47 cm es el estándar para mesas de 74–76 cm) y en que el respaldo acompañe la espalda.

## 2. Materiales según el uso

El material define la durabilidad, el mantenimiento y el ambiente:

- **Madera**: cálida y atemporal, ideal para interiores con carácter. Requiere un acabado resistente a la humedad y la limpieza frecuente.
- **Metal**: muy resistente y de estética industrial o moderna. Perfecto para alta rotación.
- **Polipropileno y técnicos**: ligeros, apilables y fáciles de limpiar; una gran opción calidad-precio.
- **Tapizado**: máxima comodidad y elegancia. Elige tejidos técnicos o símil piel fáciles de limpiar si hay comida de por medio.

> Consejo: para exterior, no vale cualquier silla. Necesitas materiales tratados contra UV, lluvia y humedad. Míralo en nuestra guía de [mobiliario de terraza](/blog/mobiliario-de-terraza-para-hosteleria).

## 3. Resistencia y certificaciones

El mobiliario de hostelería trabaja mucho más que el doméstico. Busca sillas pensadas para **uso profesional (uso contract)** y, si puedes, con certificación **CATAS**, que testa la resistencia estructural para entornos exigentes. Es la diferencia entre reponer sillas cada año o que te duren muchos.

## 4. Medidas y aprovechamiento del espacio

Antes de comprar, mide:

- **Ancho por comensal**: reserva unos 55–60 cm por silla para que nadie choque codos.
- **Paso entre mesas**: deja al menos 45 cm para circular con la silla ocupada.
- **Apilabilidad**: si montas y desmontas terraza o eventos, las sillas apilables te ahorran mucho espacio y tiempo.

## 5. Estilo y coherencia

La silla es un elemento visual clave. Elige un modelo coherente con tu identidad y combínalo con las mesas. No hace falta que todo sea idéntico: mezclar dos modelos que dialoguen aporta personalidad, siempre dentro de una misma línea de color y material.

En nuestro catálogo puedes ver modelos como la [Silla Shell](/product/TR0006), la [Silla Helena](/product/TR0032) o la nueva [Silla Sonora](/product/silla-sonora), todas pensadas para hostelería.

## En resumen

Prioriza la **comodidad** para tu tipo de local, elige el **material** según interior o exterior, exige **resistencia profesional**, respeta las **medidas** y cuida el **estilo**. Con eso, aciertas.

¿Quieres ayuda para elegir? Explora todas las [sillas para hostelería](/catalog?category=Sillas) o habla con un especialista sin compromiso.`,
  },
  {
    slug: 'mesas-para-hosteleria-materiales-medidas-mantenimiento',
    title: 'Mesas para hostelería: materiales, medidas y mantenimiento',
    category: 'Guías',
    cover_image: `${IMG}/mesa-3020-9.jpg`,
    excerpt: 'Tableros, bases, medidas y cuidados: cómo elegir mesas resistentes y prácticas para bares, restaurantes y terrazas.',
    meta_title: 'Mesas para hostelería: materiales, medidas y mantenimiento',
    meta_description: 'Cómo elegir mesas para hostelería: tipos de tablero (compacto, melamina, madera), bases, medidas por comensal y mantenimiento para bares y restaurantes en España.',
    keywords: ['mesas para hostelería', 'mesas para bares', 'mesas para restaurantes', 'mesas de terraza', 'tablero compacto'],
    content: `La mesa es el centro de la experiencia en tu local. Una buena mesa aguanta años de uso intensivo, se limpia en segundos y encaja con el espacio. Te contamos todo lo que necesitas saber para elegir **mesas para hostelería**.

## 1. El tablero: el elemento clave

El tablero es lo que más se ve y más sufre. Los más habituales:

- **Compacto (HPL)**: altísima resistencia a golpes, calor, humedad y rayaduras. Apto para interior y exterior. Es la opción más recomendable para alta rotación.
- **Melamina**: buena relación calidad-precio para interior, con mucha variedad de acabados (madera, colores lisos).
- **Madera maciza o chapada**: la más cálida y elegante, para locales que buscan carácter. Requiere más mantenimiento.
- **Cerámica y piedra**: muy resistentes y premium, con un peso considerable.

## 2. La base: estabilidad ante todo

Una mesa que baila arruina la experiencia. Elige bases con buen peso y regatones regulables para compensar suelos irregulares. Las **bases de pedestal central** (como la de nuestra [Mesa 3020](/product/RM1805)) liberan espacio para las piernas y facilitan sentar a más comensales.

## 3. Medidas por comensal

Como referencia, reserva:

- **60 × 60 cm** para 2 personas.
- **70 × 70 cm** para 2–4 personas cómodas.
- **80 × 80 cm o más** para 4 personas.
- Mesas rectangulares **120 × 80 cm** para 4–6.

La **altura estándar** es de 74–76 cm para mesa de comedor y 105–110 cm para mesa alta de bar.

## 4. Interior vs exterior

Para **terraza**, el tablero debe ser compacto o tratado, y la base de aluminio o acero con tratamiento anticorrosión. No uses melamina a la intemperie: se hincha con la humedad. Consulta nuestra guía de [mobiliario de exterior](/blog/mobiliario-de-terraza-para-hosteleria).

## 5. Mantenimiento

- Limpia con paño húmedo y jabón neutro; evita abrasivos en tableros brillantes.
- Revisa y aprieta la tornillería de la base cada pocos meses.
- Ajusta los regatones si la mesa cojea antes de que se agrave.

## En resumen

Elige el **tablero** según el uso (compacto para lo más exigente), una **base estable**, las **medidas** correctas por comensal y materiales aptos para exterior si van a la terraza. Un buen mantenimiento hará el resto.

Explora todas las [mesas para hostelería](/catalog?category=Mesas) o pide asesoramiento a un especialista.`,
  },
  {
    slug: 'mobiliario-de-terraza-para-hosteleria',
    title: 'Mobiliario de terraza para hostelería: resistencia y estilo en exterior',
    category: 'Guías',
    cover_image: `${IMG}/sillon-luigi-0.jpg`,
    excerpt: 'La terraza puede ser tu zona más rentable. Cómo elegir mobiliario de exterior que aguante sol, lluvia y uso intensivo sin perder estilo.',
    meta_title: 'Mobiliario de terraza para hostelería | Guía de exterior',
    meta_description: 'Guía para elegir mobiliario de terraza para hostelería: materiales resistentes a UV y lluvia, apilabilidad y estilo para bares y restaurantes en España.',
    keywords: ['mobiliario de terraza', 'mobiliario de exterior', 'muebles de terraza para hostelería', 'sillas de exterior', 'terraza bar restaurante'],
    content: `En España, la terraza es muchas veces la zona más rentable de un local. Pero el mobiliario de exterior vive una vida dura: sol, lluvia, cambios de temperatura, humedad y un uso constante. Elegir bien es clave para que dure y siga presentable temporada tras temporada.

## 1. Materiales que aguantan la intemperie

- **Aluminio**: ligero, no se oxida y es muy manejable para montar y recoger la terraza a diario.
- **Acero con tratamiento anticorrosión**: más robusto y estable.
- **Cuerda náutica y fibras técnicas**: estética actual y gran resistencia a UV; muy usadas en sillones lounge como el [Sillón Luigi](/product/RM2331).
- **Polipropileno de exterior**: económico, apilable y resistente.
- **Tableros compactos (HPL)**: la mejor opción para las mesas de terraza.

Evita la madera sin tratar y la melamina: no resisten la humedad.

## 2. Resistencia al sol y al agua

Fíjate en que los materiales lleven **tratamiento anti-UV** (para que no se decoloren) y que los tejidos sean de secado rápido y antimoho. Los tornillos y estructuras deben ser inoxidables.

## 3. Practicidad del día a día

- **Apilabilidad**: sillas y sillones que se apilan te ahorran espacio al cerrar.
- **Peso equilibrado**: suficientemente estable para el viento, pero manejable para el personal.
- **Regatones regulables** en las mesas para nivelar suelos de terraza irregulares.

## 4. Estilo que invita a sentarse

La terraza es tu escaparate en la calle. Un conjunto cuidado y coherente atrae clientes. Juega con colores neutros y un par de toques de color, y mantén una línea común entre sillas, mesas y sombrillas.

## 5. Piensa en el conjunto

No compres solo sillas: piensa en mesas, sombrillas y elementos lounge como un sistema. La coherencia visual y la comodidad hacen que el cliente se quede "una copa más".

## En resumen

Prioriza **materiales de exterior tratados**, **resistencia a UV y agua**, **apilabilidad** y un **estilo coherente**. Tu terraza trabajará todo el año.

Descubre nuestra selección de [mobiliario de exterior](/catalog?uso=Exterior) o habla con un especialista para diseñar tu terraza.`,
  },
  {
    slug: 'como-equipar-un-restaurante-desde-cero',
    title: 'Cómo equipar un restaurante desde cero: mobiliario paso a paso',
    category: 'Guías',
    cover_image: `${IMG}/silla-helena-0.jpg`,
    excerpt: 'Abres un restaurante y no sabes por dónde empezar con el mobiliario. Este es el plan paso a paso para acertar y ajustar el presupuesto.',
    meta_title: 'Cómo equipar un restaurante desde cero | Guía de mobiliario',
    meta_description: 'Guía paso a paso para equipar un restaurante con mobiliario: aforo, distribución, sillas, mesas, zona de barra y presupuesto. Para hostelería en España.',
    keywords: ['equipar un restaurante', 'mobiliario para restaurantes', 'abrir un restaurante', 'mobiliario de hostelería', 'aforo restaurante'],
    content: `Abrir un restaurante es emocionante y abrumador a partes iguales. El mobiliario es una de las inversiones que más condiciona la experiencia del cliente y la rentabilidad por metro cuadrado. Aquí tienes un plan claro para equiparlo **desde cero**.

## 1. Empieza por el aforo y la distribución

Antes de elegir un solo mueble, define cuántos comensales quieres sentar y cómo se moverán tus clientes y tu personal:

- Reserva **1,2–1,5 m² por comensal** en sala (incluyendo pasos).
- Deja **45–60 cm** de paso entre mesas.
- Define zonas: sala principal, barra, terraza y, si aplica, reservados.

## 2. Elige las mesas como base del layout

Las mesas marcan la capacidad. Combina formatos: mesas de 2 (60×60) que se puedan **unir** para grupos, y alguna mesa alta para espera o barra. Prioriza **tableros compactos** por su resistencia. Consulta la guía de [mesas para hostelería](/blog/mesas-para-hosteleria-materiales-medidas-mantenimiento).

## 3. Las sillas: comodidad y coherencia

Elige sillas cómodas para la duración media de tu servicio y coherentes con tu concepto. Mezclar dos modelos afines aporta carácter. Revisa cómo [elegir sillas](/blog/como-elegir-sillas-para-bar-o-restaurante) para tu tipo de local.

## 4. No olvides la barra

Si tienes barra, necesitarás **taburetes** a la altura correcta (asiento a ~75 cm para barra de ~105–110 cm). Elige modelos con reposapiés y, si hay espera, cómodos. Mira nuestra guía de [taburetes de bar](/blog/taburetes-de-bar-como-elegir).

## 5. Terraza: tu metro cuadrado más rentable

Si dispones de exterior, equípalo con [mobiliario de terraza](/catalog?uso=Exterior) resistente desde el día uno. Suele amortizarse rápido.

## 6. Ajusta el presupuesto con cabeza

- Compra a **precio directo de fábrica** cuando puedas: evitas comisiones intermedias.
- Prioriza **resistencia**: lo barato que se rompe en un año sale caro.
- Empieza por lo esencial y amplía por fases si hace falta.

## En resumen

Define **aforo y distribución**, elige **mesas** como base, **sillas** cómodas y coherentes, no olvides la **barra** ni la **terraza**, y ajusta el **presupuesto** priorizando durabilidad.

¿Vas a equipar tu restaurante? Explora el [catálogo completo](/catalog) o reserva una cita con un especialista que te acompañe en todo el proceso.`,
  },
  {
    slug: 'taburetes-de-bar-como-elegir',
    title: 'Taburetes de bar: altura, materiales y cómo elegir el ideal',
    category: 'Guías',
    cover_image: `${IMG}/taburete-theo-bar-0.jpg`,
    excerpt: 'La altura correcta, el material adecuado y el detalle del reposapiés: todo lo que necesitas para elegir taburetes de bar sin fallar.',
    meta_title: 'Taburetes de bar: cómo elegir altura y material | Guía',
    meta_description: 'Cómo elegir taburetes de bar para hostelería: altura correcta según la barra, materiales, reposapiés y estilo. Guía para bares y restaurantes en España.',
    keywords: ['taburetes de bar', 'taburetes para hostelería', 'taburetes altos', 'mobiliario de barra', 'taburete bar restaurante'],
    content: `El taburete es el rey de la barra. Un taburete bien elegido invita a quedarse; uno mal medido resulta incómodo y se nota enseguida. Esta guía te ayuda a acertar con los **taburetes de bar** para tu local.

## 1. La altura lo es todo

El error más común es no coordinar la altura del taburete con la de la barra. La regla:

- Deja **25–30 cm** entre el asiento del taburete y la parte inferior de la barra.
- **Barra estándar (~90 cm)** → taburete con asiento a ~65 cm.
- **Barra alta (~105–110 cm)** → taburete con asiento a ~75–80 cm.

Si dudas, mide tu barra antes de comprar. Un taburete regulable puede ser útil, pero los fijos suelen ser más estables para uso intensivo.

## 2. Con o sin respaldo

- **Sin respaldo**: ocupan menos, se recogen bajo la barra y agilizan la rotación.
- **Con respaldo**: más cómodos para estancias largas, ideales en gastrobares y coctelerías.

## 3. El reposapiés, imprescindible

Un buen **reposapiés** cambia por completo la comodidad. Comprueba que sea robusto (recibe mucho uso) y que esté a una altura natural.

## 4. Materiales

Igual que en las sillas: **metal** para resistencia, **madera** para calidez, **tapizado** para comodidad y estilo. Para exterior, materiales tratados. Modelos como el [Taburete Theo Bar](/product/taburete-theo-bar) o el [Taburete Breda](/product/taburete-breda) combinan estructura metálica resistente con asiento tapizado.

## 5. Estabilidad y mantenimiento

La base debe ser estable (mejor con peso) y con regatones que protejan el suelo y eviten balanceos. Revisa la tornillería periódicamente: la barra es zona de uso intenso.

## En resumen

Coordina la **altura** con tu barra, decide **con o sin respaldo**, exige un buen **reposapiés**, elige el **material** según uso y cuida la **estabilidad**. Así aciertas con la barra.

Descubre todos los [taburetes de bar](/catalog?category=Taburetes) o habla con un especialista para tu proyecto.`,
  },
]

async function main() {
  // fecha base escalonada (más reciente primero)
  const base = Date.parse('2026-07-20T09:00:00Z')
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i]
    const publishedAt = new Date(base - i * 86400000 * 3).toISOString()
    const row = { ...p, reading_min: rmin(p.content), published: true, published_at: publishedAt, updated_at: new Date().toISOString() }
    const { error } = await s.from('blog_posts').upsert(row, { onConflict: 'slug' })
    console.log(error ? `❌ ${p.slug}: ${error.message}` : `✅ ${p.title} (${rmin(p.content)} min)`)
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
