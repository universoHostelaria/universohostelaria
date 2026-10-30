/* eslint-disable @next/next/no-img-element */
// Crédito «Web hecha por FlowCode» para el pie de página (fondo oscuro).
export default function FlowcodeCredit() {
  return (
    <a
      href="https://www.flowcode.cc"
      target="_blank"
      rel="noopener"
      className="fc-credit"
      aria-label="Web hecha por FlowCode"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: 11 }}
    >
      <span>Web hecha por</span>
      <img
        src="/flowcode-logo.svg"
        alt="FlowCode"
        width={78}
        height={13}
        style={{ height: 13, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
      />
    </a>
  )
}
