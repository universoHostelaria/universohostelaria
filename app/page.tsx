/* eslint-disable @next/next/no-img-element */
import { IMG_LOGO, IMG_LIMA, IMG_BERNA, IMG_BERNA_CU, IMG_TUMBONAS, IMG_TERRAZA } from './homeImages'

export const metadata = {
  title: 'Universo Hostelería — Mobiliario profesional para hostelería',
  description: 'El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos.',
}

export default function HomePage() {
  return (
    <>
      <style>{`

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2B6FD4;
  --blue-dark:#1A4FA0;
  --black:#0D0D0D;
  --white:#FFFFFF;
  --hero-bg:#D2D2D2;
  --gray-1:#E8E8E8;
  --gray-2:#AAAAAA;
  --gray-3:#555;
  --heading:'Bebas Neue',sans-serif;
  --body:'Inter',system-ui,sans-serif;
  --r:10px;
  --r-lg:18px;
}
html{scroll-behavior:smooth}
body{font-family:var(--body);color:var(--black);background:var(--white);-webkit-font-smoothing:antialiased;overflow-x:hidden}

/* ANN */
.ann{background:var(--black);color:rgba(255,255,255,.8);text-align:center;padding:10px 20px;font-size:12.5px;letter-spacing:.02em}
.ann strong{color:#fff;font-weight:500}
.ann a{color:rgba(255,255,255,.55);text-decoration:underline;text-underline-offset:2px}

/* NAV */
nav{background:#fff;border-bottom:1px solid var(--gray-1);position:sticky;top:0;z-index:500}
.nav-w{max-width:1360px;margin:0 auto;padding:0 32px;height:66px;display:flex;align-items:center;gap:36px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.logo img{width:34px;height:34px;object-fit:contain}
.logo-copy{display:flex;flex-direction:column;line-height:1}
.logo-name{font-family:var(--heading);font-size:17px;color:var(--black);letter-spacing:.02em;line-height:1.1}
.logo-sub{font-size:9px;font-weight:400;color:var(--gray-2);letter-spacing:.1em;text-transform:uppercase;margin-top:2px}
.nav-links{display:flex;gap:26px;list-style:none}
.nav-links a{font-size:13px;color:var(--gray-3);text-decoration:none;transition:color .15s}
.nav-links a:hover{color:var(--black)}
.nav-r{margin-left:auto;display:flex;align-items:center;gap:10px}
.srch{display:flex;align-items:center;gap:8px;background:#F5F5F3;border:1.5px solid transparent;border-radius:8px;padding:9px 14px;font-size:12.5px;color:var(--gray-2);cursor:text;transition:all .2s;width:220px;font-family:var(--body)}
.srch:hover{border-color:var(--gray-1);background:#fff}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:8px;font-family:var(--body);font-size:13.5px;font-weight:500;text-decoration:none;border:none;cursor:pointer;transition:all .2s;white-space:nowrap}
.btn-dark{background:var(--black);color:#fff}
.btn-dark:hover{background:#222;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.2)}
.btn-blue{background:var(--blue);color:#fff}
.btn-blue:hover{background:var(--blue-dark);transform:translateY(-1px);box-shadow:0 4px 14px rgba(43,111,212,.3)}
.btn-ol{background:transparent;color:var(--black);border:1.5px solid var(--gray-1)}
.btn-ol:hover{border-color:var(--black)}
.ghost{background:none;border:none;color:var(--black);font-family:var(--body);font-size:14px;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0;text-decoration:none;transition:gap .2s}
.ghost:hover{gap:10px}

/* HERO — seamless with image bg */
.hero{position:relative;min-height:88svh;overflow:hidden;display:flex;align-items:center;background:var(--hero-bg)}
.hero-img-side{position:absolute;right:0;top:0;height:100%;width:55%;object-fit:cover;object-position:center center;display:block}
/* Fade the image into the solid bg color on the left */
.hero-fade{position:absolute;inset:0;background:linear-gradient(to right, #D2D2D2 28%, #D2D2D2 36%, rgba(210,210,210,0.6) 58%, rgba(210,210,210,0) 75%);z-index:1;pointer-events:none}
.hero-body{position:relative;z-index:2;max-width:1360px;margin:0 auto;padding:80px 32px;width:100%;max-width:560px;margin-left:max(32px, calc(50vw - 640px))}
.hero-tag{display:inline-flex;align-items:center;gap:8px;border:1.5px solid rgba(0,0,0,.15);border-radius:100px;padding:6px 14px;font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--gray-3);margin-bottom:24px;background:rgba(255,255,255,.5)}
.hero-tag-dot{width:6px;height:6px;background:var(--blue);border-radius:50%}
h1{font-family:var(--heading);font-size:clamp(64px,8.5vw,112px);line-height:.92;letter-spacing:.02em;color:var(--black);margin-bottom:22px}
h1 .blue{color:var(--blue)}
.hero-sub{font-size:16px;color:#444;line-height:1.65;max-width:400px;margin-bottom:36px;font-weight:300}
.hero-sub strong{color:var(--black);font-weight:500}
.hero-ctas{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:48px}
.hero-ctas .btn{padding:13px 26px;font-size:14.5px;border-radius:9px}
.hero-nums{display:flex;gap:36px;flex-wrap:wrap}
.hnum-val{font-family:var(--heading);font-size:34px;color:var(--black);line-height:1;letter-spacing:.02em}
.hnum-val span{font-size:18px;color:var(--blue)}
.hnum-label{font-size:11px;color:#777;margin-top:2px;letter-spacing:.03em}

/* TRUST */
.trust{border-top:1px solid var(--gray-1);border-bottom:1px solid var(--gray-1);background:#fff}
.trust-w{max-width:1360px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.ti{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--gray-3)}
.ti svg{color:var(--blue);flex-shrink:0}

/* SECTION COMMONS — fundo branco uniforme */
.sec{max-width:1360px;margin:0 auto;padding:88px 32px}
.eyebrow{font-family:var(--heading);font-size:14px;letter-spacing:.12em;color:var(--blue);margin-bottom:10px}
.stitle{font-family:var(--heading);font-size:clamp(42px,4.5vw,64px);line-height:.96;letter-spacing:.02em;color:var(--black);margin-bottom:10px}
.stitle .blue{color:var(--blue)}
.ssub{font-size:15px;color:var(--gray-2);font-weight:300;line-height:1.6;max-width:480px}
.sh{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:44px;gap:24px}

/* DIVIDER */
.div-line{border:none;border-top:1px solid var(--gray-1);margin:0}

/* CATEGORIES */
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.cat-card{background:#F5F5F3;border-radius:var(--r-lg);padding:26px 22px;text-decoration:none;color:var(--black);display:block;transition:all .22s;border:1.5px solid transparent;position:relative;overflow:hidden;min-height:168px}
.cat-card:hover{border-color:var(--blue);background:#fff;transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.07)}
.cat-n{font-family:var(--heading);font-size:12px;letter-spacing:.08em;color:var(--gray-2);margin-bottom:24px}
.cat-name{font-family:var(--heading);font-size:28px;letter-spacing:.02em;line-height:1;margin-bottom:6px}
.cat-count{font-size:12px;color:var(--gray-2)}
.cat-arr{position:absolute;right:18px;bottom:18px;width:30px;height:30px;background:var(--black);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateX(-5px);transition:all .2s}
.cat-card:hover .cat-arr{opacity:1;transform:translateX(0)}
.cat-feat{background:var(--black);border-color:var(--black)}
.cat-feat .cat-n,.cat-feat .cat-count{color:rgba(255,255,255,.3)}
.cat-feat .cat-name{color:#fff}
.cat-feat .cat-arr{background:var(--blue);opacity:1;transform:translateX(0)}
.cat-feat:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.2)}

/* PRODUCTS */
.prod-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pc{background:#fff;border:1.5px solid var(--gray-1);border-radius:var(--r-lg);overflow:hidden;transition:all .22s;cursor:pointer}
.pc:hover{border-color:rgba(0,0,0,.14);transform:translateY(-4px);box-shadow:0 14px 44px rgba(0,0,0,.09)}
.pi{aspect-ratio:3/4;background:#F5F5F3;position:relative;overflow:hidden}
.pi img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.25,.46,.45,.94)}
.pc:hover .pi img{transform:scale(1.05)}
.pbadge{position:absolute;top:10px;left:10px;font-size:9.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:100px}
.pnew{background:var(--black);color:#fff}
.pout{background:#16A34A;color:#fff}
.pwish{position:absolute;top:10px;right:10px;width:32px;height:32px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--gray-1);cursor:pointer;opacity:0;transition:opacity .2s;color:var(--gray-2)}
.pc:hover .pwish{opacity:1}
.pinfo{padding:15px 17px 18px}
.psup{font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--gray-2);margin-bottom:3px}
.pname{font-family:var(--heading);font-size:20px;letter-spacing:.02em;margin-bottom:3px;line-height:1.1}
.pdims{font-size:11.5px;color:var(--gray-2);margin-bottom:12px}
.pfoot{display:flex;align-items:center;justify-content:space-between}
.pprice{font-family:var(--heading);font-size:22px;letter-spacing:.02em}
.pprice-note{font-size:10px;color:var(--gray-2);margin-top:1px;font-weight:300}
.padd{width:34px;height:34px;background:var(--black);color:#fff;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0}
.padd:hover{background:var(--blue);transform:scale(1.08)}

/* FULL-WIDTH IMAGE BREAK */
.img-break{width:100%;overflow:hidden;line-height:0}
.img-break img{width:100%;height:520px;object-fit:cover;object-position:center 40%;display:block}

/* WHY */
.why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--gray-1);border-radius:20px;overflow:hidden;margin-top:48px}
.wi{background:#fff;padding:40px 34px}
.wi-num{font-family:var(--heading);font-size:60px;color:var(--gray-1);line-height:1;margin-bottom:14px;letter-spacing:.02em}
.wi-title{font-family:var(--heading);font-size:24px;letter-spacing:.02em;margin-bottom:10px;line-height:1}
.wi-desc{font-size:14px;color:var(--gray-3);line-height:1.65;font-weight:300}

/* TWO-COL IMAGE + TEXT */
.split{display:grid;grid-template-columns:1fr 1fr;gap:0;overflow:hidden;border-radius:20px}
.split-img{overflow:hidden;line-height:0}
.split-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.split:hover .split-img img{transform:scale(1.03)}
.split-text{background:#F5F5F3;padding:56px 52px;display:flex;flex-direction:column;justify-content:center}
.split-text .eyebrow{margin-bottom:12px}
.split-text .stitle{font-size:clamp(36px,3.5vw,54px)}
.split-text p{font-size:15px;color:var(--gray-3);line-height:1.7;font-weight:300;margin-top:16px;max-width:380px}
.split-text .btn{margin-top:32px;width:fit-content}

/* SPEC */
.spec-wrap{border-radius:20px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;min-height:480px}
.spec-l{background:var(--black);padding:60px 52px;display:flex;flex-direction:column;justify-content:flex-end;position:relative;overflow:hidden}
.spec-orbit{position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;border:1.5px solid rgba(43,111,212,.2)}
.spec-orbit2{position:absolute;top:-20px;right:-20px;width:160px;height:160px;border-radius:50%;border:1.5px solid rgba(43,111,212,.12)}
.spec-tag{display:inline-flex;align-items:center;gap:7px;background:rgba(43,111,212,.15);color:#7EB3F5;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:22px;width:fit-content}
.spec-h{font-family:var(--heading);font-size:clamp(42px,3.8vw,58px);line-height:.96;letter-spacing:.02em;color:#fff;margin-bottom:16px}
.spec-h .blue{color:#7EB3F5}
.spec-p{font-size:14.5px;color:rgba(255,255,255,.5);line-height:1.7;max-width:380px;margin-bottom:26px;font-weight:300}
.spec-feats{display:flex;flex-direction:column;gap:8px;margin-bottom:32px}
.sf{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(255,255,255,.6)}
.sd{width:5px;height:5px;background:var(--blue);border-radius:50%;flex-shrink:0}
.spec-btn{display:inline-flex;align-items:center;gap:9px;background:var(--blue);color:#fff;padding:14px 26px;border-radius:9px;font-size:14px;font-weight:500;font-family:var(--body);border:none;cursor:pointer;transition:all .2s;width:fit-content;text-decoration:none}
.spec-btn:hover{background:var(--blue-dark);transform:translateY(-2px);box-shadow:0 8px 24px rgba(43,111,212,.35)}
.spec-r{background:#F0EEE8;display:flex;align-items:center;justify-content:center;overflow:hidden}
.spec-r img{width:100%;height:100%;object-fit:cover;object-position:center}

/* SUPPLIERS */
.sup-bar{border-top:1px solid var(--gray-1);border-bottom:1px solid var(--gray-1);padding:40px 0;background:#fff}
.sup-w{max-width:1360px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:44px;flex-wrap:wrap}
.sup-label{font-family:var(--heading);font-size:13px;letter-spacing:.1em;color:var(--gray-2);white-space:nowrap}
.sup-logos{display:flex;align-items:center;gap:36px;flex:1;flex-wrap:wrap}
.sup-item{display:flex;flex-direction:column;align-items:center;gap:5px;text-decoration:none;transition:opacity .2s;opacity:.45}
.sup-item:hover{opacity:1}
.sup-badge{width:52px;height:52px;border-radius:12px;border:1.5px solid var(--gray-1);display:flex;align-items:center;justify-content:center;font-family:var(--heading);font-size:20px;color:var(--black);background:#fff;letter-spacing:.02em}
.sup-name{font-size:10px;font-weight:600;letter-spacing:.06em;color:var(--gray-3);text-transform:uppercase}

/* HOW */
.how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--gray-1);border-radius:20px;overflow:hidden;margin-top:44px}
.hs{background:#fff;padding:36px 26px}
.hs-num{font-family:var(--heading);font-size:52px;color:var(--gray-1);line-height:1;margin-bottom:16px;letter-spacing:.02em}
.hs-icon{width:42px;height:42px;background:#EBF2FD;border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--blue);margin-bottom:14px}
.hs-title{font-family:var(--heading);font-size:20px;letter-spacing:.02em;margin-bottom:7px}
.hs-desc{font-size:13px;color:var(--gray-3);line-height:1.65;font-weight:300}

/* FOOTER */
footer{background:var(--black)}
.ft{max-width:1360px;margin:0 auto;padding:56px 32px 40px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:44px;border-bottom:1px solid rgba(255,255,255,.07)}
.fb-name{font-family:var(--heading);font-size:20px;color:#fff;letter-spacing:.02em;margin-bottom:10px}
.fb-desc{font-size:13px;color:rgba(255,255,255,.35);line-height:1.7;max-width:260px;margin-bottom:18px;font-weight:300}
.fb-c{font-size:12px;color:rgba(255,255,255,.3);display:flex;align-items:center;gap:7px;margin-bottom:6px}
.fc-label{font-family:var(--heading);font-size:12px;letter-spacing:.1em;color:rgba(255,255,255,.2);margin-bottom:16px}
.fl{list-style:none;display:flex;flex-direction:column;gap:11px}
.fl a{font-size:13px;color:rgba(255,255,255,.45);text-decoration:none;font-weight:300;transition:color .15s}
.fl a:hover{color:#fff}
.fb{max-width:1360px;margin:0 auto;padding:22px 32px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.2);flex-wrap:wrap;gap:8px}

/* RESPONSIVE */
@media(max-width:1100px){
  .nav-links,.srch{display:none}
  .cat-grid{grid-template-columns:repeat(2,1fr)}
  .prod-grid{grid-template-columns:repeat(2,1fr)}
  .how-grid{grid-template-columns:repeat(2,1fr)}
  .why-grid{grid-template-columns:1fr 1fr}
  .spec-wrap,.split{grid-template-columns:1fr}
  .spec-r{display:none}
  .ft{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
  .hero-body{max-width:100%;padding:56px 20px}
  .hero-img-side{width:100%;opacity:.2}
  .hero-fade{background:rgba(210,210,210,.7)}
  h1{font-size:72px}
  .cat-grid{grid-template-columns:1fr 1fr}
  .prod-grid{grid-template-columns:1fr 1fr}
  .how-grid,.why-grid{grid-template-columns:1fr}
  .sec{padding:60px 20px}
  .img-break img{height:320px}
  .ft{grid-template-columns:1fr;padding:40px 20px 28px}
  .fb{padding:18px 20px}
  .hero-nums{gap:22px}
}

/* ANIMATIONS */
@keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.hero-tag{animation:up .45s ease forwards .1s;opacity:0}
h1{animation:up .55s ease forwards .2s;opacity:0}
.hero-sub{animation:up .5s ease forwards .32s;opacity:0}
.hero-ctas{animation:up .5s ease forwards .42s;opacity:0}
.hero-nums{animation:up .5s ease forwards .52s;opacity:0}

      `}</style>
<div className="ann"><strong>Nuevo:</strong> 15+ fabricantes, 10.000+ productos en un solo lugar &nbsp;·&nbsp; <a href="/#especialista">Habla hoy con nuestro especialista →</a></div>

<nav>
  <div className="nav-w">
    <a href="#" className="logo">
      <img src={IMG_LOGO} alt="Universo Hostelería" />
      <div className="logo-copy">
        <span className="logo-name">Universo Hostelería</span>
        <span className="logo-sub">Barcelona · España</span>
      </div>
    </a>
    <ul className="nav-links">
      <li><a href="#">Catálogo</a></li>
      <li><a href="#">Sillas &amp; Taburetes</a></li>
      <li><a href="#">Mesas</a></li>
      <li><a href="#">Exterior</a></li>
      <li><a href="#">Proveedores</a></li>
      <li><a href="#">Nosotros</a></li>
    </ul>
    <div className="nav-r">
      <div className="srch">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        Buscar en 10.000+ productos…
      </div>
      <a href="/#especialista" className="btn btn-dark" style="font-size:13px;padding:10px 18px">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
        Reservar cita
      </a>
    </div>
  </div>
</nav>

<!-- HERO — seamless bg match with Lima Sillon -->
<section className="hero">
  <img className="hero-img-side" src={IMG_LIMA} alt="Sillón Lima — Arkimueble" />
  <div className="hero-fade"></div>
  <div className="hero-body">
    <h1>GRAN<br />HOSTELERÍA<br /><span className="blue">EMPIEZA<br />AQUÍ.</span></h1>
    <p className="hero-sub">Más de <strong>10.000 productos</strong> de <strong>15+ fabricantes</strong> europeos. Elige, compara y pide directo — con un especialista cuando lo necesites.</p>
    <div className="hero-ctas">
      <a href="/catalog" className="btn btn-dark" style="padding:13px 26px;font-size:14.5px;border-radius:9px">
        Ver el catálogo
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
      <a href="/#especialista" className="ghost">
        Hablar con el especialista
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>
    </div>
    <div className="hero-nums">
      <div><div className="hnum-val">10K<span>+</span></div><div className="hnum-label">Productos</div></div>
      <div><div className="hnum-val">15<span>+</span></div><div className="hnum-label">Fabricantes</div></div>
      <div><div className="hnum-val">15<span>años</span></div><div className="hnum-label">De experiencia</div></div>
    </div>
  </div>
</section>

<!-- TRUST -->
<div className="trust">
  <div className="trust-w">
    <div className="ti"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l2 4 4.5.65-3.25 3.15.77 4.47L8 11.5l-4.02 2.22.77-4.47L1.5 6.15l4.5-.65z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>15+ fabricantes curados</div>
    <div className="ti"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 8h12M8 2c-2 2-3 4-3 6s1 4 3 6M8 2c2 2 3 4 3 6s-1 4-3 6" stroke="currentColor" strokeWidth="1.3"/></svg>Entrega en toda España</div>
    <div className="ti"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1a5 5 0 1 1 0 10A5 5 0 0 1 8 1zm0 11c-3.3 0-6 1.3-6 2.5V15h12v-.5c0-1.2-2.7-2.5-6-2.5z" stroke="currentColor" strokeWidth="1.3"/></svg>Especialista dedicado</div>
    <div className="ti"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3"/></svg>Envío gratis desde 300&nbsp;€</div>
    <div className="ti"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>15 años en el mercado</div>
  </div>
</div>

<!-- CATEGORIES -->
<div id="catalogo">
<div className="sec">
  <div className="sh">
    <div>
      <div className="eyebrow">Categorías</div>
      <h2 className="stitle">ENCUENTRA<br />LO QUE <span className="blue">NECESITAS.</span></h2>
    </div>
    <a href="#" className="btn btn-ol" style="flex-shrink:0">Ver catálogo completo</a>
  </div>
  <div className="cat-grid">
    <a href="#" className="cat-card"><div className="cat-n">01</div><div className="cat-name">SILLAS</div><div className="cat-count">+480 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">02</div><div className="cat-name">MESAS</div><div className="cat-count">+240 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">03</div><div className="cat-name">TABURETES</div><div className="cat-count">+180 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">04</div><div className="cat-name">EXTERIOR</div><div className="cat-count">+320 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">05</div><div className="cat-name">SILLONES</div><div className="cat-count">+150 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">06</div><div className="cat-name">SOMBRILLAS</div><div className="cat-count">+90 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card"><div className="cat-n">07</div><div className="cat-name">LOUNGE</div><div className="cat-count">+200 referencias</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
    <a href="#" className="cat-card cat-feat"><div className="cat-n">10K+</div><div className="cat-name">VER TODO</div><div className="cat-count">Todo el catálogo</div><div className="cat-arr"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></a>
  </div>
</div>
</div>

<hr className="div-line" />

<!-- FEATURED PRODUCTS -->
<div className="sec">
  <div className="sh">
    <div>
      <div className="eyebrow">Selección</div>
      <h2 className="stitle">PRODUCTOS <span className="blue">DESTACADOS</span></h2>
    </div>
    <a href="#" className="btn btn-ol" style="flex-shrink:0">Ver todos</a>
  </div>
  <div className="prod-grid">
    <div className="pc">
      <div className="pi"><img src={IMG_LIMA} alt="Lima Sillón" /><span className="pbadge pnew">Nuevo</span><button className="pwish"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 10 2 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 14 5.5C14 10 8 13.5 8 13.5z" stroke="currentColor" strokeWidth="1.4"/></svg></button></div>
      <div className="pinfo"><div className="psup">Arkimueble</div><div className="pname">Lima Sillón</div><div className="pdims">Exterior · Aluminio + tapizado</div><div className="pfoot"><div><div className="pprice">Consultar</div><div className="pprice-note">precio mayorista</div></div><button className="padd"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></button></div></div>
    </div>
    <div className="pc">
      <div className="pi"><img src={IMG_BERNA} alt="Berna Mesa con sillas" /><span className="pbadge pout">Interior</span><button className="pwish"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 10 2 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 14 5.5C14 10 8 13.5 8 13.5z" stroke="currentColor" strokeWidth="1.4"/></svg></button></div>
      <div className="pinfo"><div className="psup">Tilia · Romero</div><div className="pname">Berna — Mesa + Sillas</div><div className="pdims">Colección completa disponible</div><div className="pfoot"><div><div className="pprice">Desde 119 €</div><div className="pprice-note">+ IVA por unidad</div></div><button className="padd"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></button></div></div>
    </div>
    <div className="pc">
      <div className="pi"><img src={IMG_TUMBONAS} alt="Tumbonas exterior" /><span className="pbadge pout">Exterior</span><button className="pwish"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 10 2 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 14 5.5C14 10 8 13.5 8 13.5z" stroke="currentColor" strokeWidth="1.4"/></svg></button></div>
      <div className="pinfo"><div className="psup">Arkimueble</div><div className="pname">Tumbonas Rattan</div><div className="pdims">Exterior · Resistente UV</div><div className="pfoot"><div><div className="pprice">Consultar</div><div className="pprice-note">precio mayorista</div></div><button className="padd"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></button></div></div>
    </div>
    <div className="pc">
      <div className="pi"><img src={IMG_TERRAZA} alt="Terraza con vistas al mar" /><span className="pbadge pout">Exterior</span><button className="pwish"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 13.5S2 10 2 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 14 5.5C14 10 8 13.5 8 13.5z" stroke="currentColor" strokeWidth="1.4"/></svg></button></div>
      <div className="pinfo"><div className="psup">Tilia · Romero</div><div className="pname">Colección Terraza</div><div className="pdims">Mesa + sillas · Aluminio lacado</div><div className="pfoot"><div><div className="pprice">Desde 264 €</div><div className="pprice-note">+ IVA por unidad</div></div><button className="padd"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg></button></div></div>
    </div>
  </div>
</div>

<!-- FULL WIDTH IMAGE BREAK 1 — Berna cuerdas exterior -->
<div className="img-break">
  <img src={IMG_BERNA_CU} alt="Colección Berna exterior — Universo Hostelería" />
</div>

<!-- WHY -->
<hr className="div-line" />
<div className="sec">
  <div className="eyebrow">Por qué elegirnos</div>
  <h2 className="stitle">EL PODER<br />DE <span className="blue">ELEGIR SOLO.</span></h2>
  <div className="why-grid">
    <div className="wi"><div className="wi-num">15+</div><div className="wi-title">FABRICANTES EN UN SOLO LUGAR</div><p className="wi-desc">Accede a los mejores fabricantes europeos sin buscarlos uno a uno. Todo curado, todo comparado, todo en un solo sitio. Tú eliges con criterio, no con suerte.</p></div>
    <div className="wi"><div className="wi-num">0€</div><div className="wi-title">DE COMISIONES EXTRA</div><p className="wi-desc">Precio directo del fabricante a tu local. Sin capas, sin markups ocultos, sin tener que pasar por nadie. Tu presupuesto va íntegro al mobiliario.</p></div>
    <div className="wi"><div className="wi-num">360°</div><div className="wi-title">ACOMPAÑAMIENTO TOTAL</div><p className="wi-desc">Desde la primera búsqueda hasta la instalación: colores, plazos, volúmenes, configuración de espacios. Un especialista real responde tus dudas.</p></div>
  </div>
</div>

<!-- SPLIT — terraza -->
<hr className="div-line" />
<div className="sec" style="padding-top:0;padding-bottom:0">
  <div className="split">
    <div className="split-img"><img src={IMG_TERRAZA} alt="Terraza con mobiliario Universo Hostelería" /></div>
    <div className="split-text">
      <div className="eyebrow">Exterior &amp; Terraza</div>
      <h2 className="stitle">MUEBLES<br />QUE <span className="blue">AGUANTAN</span><br />TODO.</h2>
      <p>UV, lluvia, sal marina, el mal humor de los lunes. Nuestra selección de exterior está testada para entornos hosteleros exigentes. Calidad que no pide mantenimiento.</p>
      <a href="#" className="btn btn-dark">Ver colección exterior</a>
    </div>
  </div>
</div>

<!-- SPECIALIST -->
<hr className="div-line" />
<div className="sec" id="especialista">
  <div className="spec-wrap">
    <div className="spec-l">
      <div className="spec-orbit"></div><div className="spec-orbit2"></div>
      <div className="spec-tag">Servicio gratuito</div>
      <h2 className="spec-h">TU PROYECTO.<br />NUESTRO <span className="blue">ESPECIALISTA.</span></h2>
      <p className="spec-p">¿Abres un restaurante? ¿Renuevás la terraza? Reserva una cita y lo resolvemos juntos. Sin compromiso, sin letra pequeña.</p>
      <div className="spec-feats">
        <div className="sf"><span className="sd"></span>Colores, materiales y acabados a medida</div>
        <div className="sf"><span className="sd"></span>Planificación de plazos y preparación del pedido</div>
        <div className="sf"><span className="sd"></span>Videollamada, teléfono o visita en Barcelona</div>
        <div className="sf"><span className="sd"></span>15 años de experiencia en proyectos de hostelería</div>
      </div>
      <a href="#" className="spec-btn">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M2 7h12M5 2v4M11 2v4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
        Reservar cita gratuita
      </a>
    </div>
    <div className="spec-r">
      <img src={IMG_BERNA} alt="Colección Berna" />
    </div>
  </div>
</div>

<!-- FULL WIDTH IMAGE BREAK 2 — tumbonas -->
<div className="img-break" style="padding:0 32px 0">
  <img src={IMG_TUMBONAS} alt="Tumbonas exterior — Universo Hostelería" style="border-radius:20px" />
</div>

<!-- SUPPLIERS -->
<div className="sup-bar" style="margin-top:80px">
  <div className="sup-w">
    <span className="sup-label">NUESTROS FABRICANTES</span>
    <div className="sup-logos">
      <a href="#" className="sup-item"><div className="sup-badge">T</div><span className="sup-name">Tilia</span></a>
      <a href="#" className="sup-item"><div className="sup-badge">R</div><span className="sup-name">Romero</span></a>
      <a href="#" className="sup-item"><div className="sup-badge">A</div><span className="sup-name">Arkimueble</span></a>
      <a href="#" className="sup-item"><div className="sup-badge" style="font-size:13px;color:var(--gray-2)">+12</div><span className="sup-name">Más marcas</span></a>
    </div>
    <a href="#" className="btn btn-ol" style="font-size:13px;flex-shrink:0">Ver todos los fabricantes</a>
  </div>
</div>

<!-- HOW -->
<div className="sec">
  <div className="eyebrow">Proceso</div>
  <h2 className="stitle">4 PASOS.<br /><span className="blue">TAN FÁCIL.</span></h2>
  <div className="how-grid">
    <div className="hs"><div className="hs-num">01</div><div className="hs-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div><div className="hs-title">EXPLORA</div><p className="hs-desc">10.000+ productos de 15+ fabricantes. Filtra, compara, guarda favoritos.</p></div>
    <div className="hs"><div className="hs-num">02</div><div className="hs-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8h14M6 2v4M12 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div><div className="hs-title">HABLA CON EL ESPECIALISTA</div><p className="hs-desc">Cita gratuita para afinar plazos, colores y cantidades.</p></div>
    <div className="hs"><div className="hs-num">03</div><div className="hs-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="hs-title">CONFIRMA EL PEDIDO</div><p className="hs-desc">Factura proforma directa al fabricante. Sin sorpresas.</p></div>
    <div className="hs"><div className="hs-num">04</div><div className="hs-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="6.5" width="15" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 6.5V5a4.5 4.5 0 0 1 9 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg></div><div className="hs-title">RECIBE EN TU LOCAL</div><p className="hs-desc">Entrega coordinada en toda España. Te acompañamos hasta el final.</p></div>
  </div>
</div>

<footer>
  <div className="ft">
    <div>
      <div className="fb-name">Universo Hostelería</div>
      <p className="fb-desc">El mayor marketplace de mobiliario para hostelería en España. 15+ fabricantes, 10.000+ productos, un especialista para ti.</p>
      <div className="fb-c"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1a4.5 4.5 0 0 1 4.5 4.5c0 3.5-4.5 8-4.5 8s-4.5-4.5-4.5-8A4.5 4.5 0 0 1 7 1z" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/></svg>Barcelona, España</div>
      <div className="fb-c"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/><path d="M1.5 5.5l5.5 3.5 5.5-3.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.2"/></svg>hola@universohosteleria.es</div>
    </div>
    <div><div className="fc-label">CATÁLOGO</div><ul className="fl"><li><a href="#">Sillas</a></li><li><a href="#">Mesas</a></li><li><a href="#">Taburetes</a></li><li><a href="#">Exterior</a></li><li><a href="#">Lounge</a></li></ul></div>
    <div><div className="fc-label">EMPRESA</div><ul className="fl"><li><a href="#">Sobre nosotros</a></li><li><a href="#">Fabricantes</a></li><li><a href="#">Cómo funciona</a></li><li><a href="#">Blog</a></li></ul></div>
    <div><div className="fc-label">SOPORTE</div><ul className="fl"><li><a href="#">Cita con especialista</a></li><li><a href="#">Contacto</a></li><li><a href="#">Envíos</a></li><li><a href="#">Aviso legal</a></li><li><a href="#">Privacidad</a></li></ul></div>
  </div>
  <div className="fb">
    <span>© 2026 Universo Hostelería · Barcelona</span>
    <span>El mayor marketplace de mobiliario para hostelería en España</span>
  </div>
</footer>
    </>
  )
}
