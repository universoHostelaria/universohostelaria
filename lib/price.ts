// Utilidades de precio. Los precios en BD son SIN IVA; mostramos el final con IVA.
export const IVA = 0.21

export function formatEUR(v: number): string {
  return (
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) +
    ' €'
  )
}

// Precio con IVA incluido, o null si no hay precio numérico (p.ej. "Consultar").
export function priceConIva(price: number | null | undefined): number | null {
  return typeof price === 'number' && price > 0 ? price * (1 + IVA) : null
}
