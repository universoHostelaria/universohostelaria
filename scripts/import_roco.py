#!/usr/bin/env python3
"""Importa la línea Romero Contract (catálogo «CAT ROCO 26») como productos.

Precio de venta sin IVA = tarifa × 0,65 (−35 %, confirmado por el cliente el
17/11/2026). Con varios niveles de tela, `price` es el nivel más barato y los
demás van escritos en la descripción. Los datos de cada modelo están copiados
a mano del PDF (el índice del catálogo trae páginas erróneas).

Uso:
  python3 scripts/import_roco.py --pdf "CAT ROCO 26-LOW.pdf" --sheet   # hoja de revisión de fotos
  python3 scripts/import_roco.py --pdf ... --apply                      # sube fotos e inserta (inactivos)
  python3 scripts/import_roco.py --activate                             # los publica
"""
import argparse, glob, io, json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, ".catalog-import", "roco")
BUCKET_DIR = "roco"
DESC = 0.65
IVA = 1.21

METAL = "Estructura metálica pintada según carta de colores."
HAYA = "Armazón de madera de haya barnizada (nogal, miel o natural)."
TELA = "Tapizado según carta de telas o tela del cliente."
ALU = "Armazón de aluminio color antracita."
PP2 = "Polipropileno en 2 piezas; carcasa y estructura en tonos que contrastan (gris cálido, negro, sand o menta)."

# (slug, nombre, categoría, uso, material, descripción, medidas, alto asiento,
#  precios de tarifa [(etiqueta, precio)], página izquierda del PDF)
MODELS = [
    # ── Sillas
    ("charles", "Silla Charles", "Sillas", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "81×48×50", "48", [("Nivel 1", 287), ("Nivel 2", 304), ("Nivel 3", 310)], 12),
    ("theo", "Silla Theo", "Sillas", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados. Taburete a juego: Theo Bar.", "85×47×50", "45", [("Nivel 1", 315), ("Nivel 2", 336), ("Nivel 3", 346)], 14),
    ("devon", "Silla Devon", "Sillas", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados. Taburete a juego: Devon Bar.", "85×47×51", "49", [("Nivel 1", 504), ("Nivel 2", 519), ("Nivel 3", 526)], 18),
    ("jason", "Silla Jasón", "Sillas", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "84×51×50", "46", [("Nivel 1", 399), ("Nivel 2", 420), ("Nivel 3", 430)], 20),
    ("hermes", "Silla Hermes", "Sillas", "Interior", "Madera de haya", f"{HAYA} Asiento y respaldo tapizados.", "86×50×50", "45", [("Nivel 1", 472), ("Nivel 2", 495), ("Nivel 3", 506)], 22),
    ("chicago-silla", "Silla Chicago", "Sillas", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento de rejilla o tapizado.", "84×54×52", "45", [("Nivel 1", 376), ("Nivel 2", 382), ("Nivel 3", 392), ("Rejilla", 469)], 24),
    ("yucatan", "Silla Yucatán", "Sillas", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento de madera o tapizado.", "84×49×45", "46", [("Nivel 1", 393), ("Nivel 2", 399), ("Nivel 3", 408)], 28),
    ("tampico", "Silla Tampico", "Sillas", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento de madera o tapizado. Taburete a juego: Tampico Bar.", "82×54×48", "47", [("Asiento de madera", 321), ("Nivel 1", 343), ("Nivel 2", 348), ("Nivel 3", 355)], 30),
    ("1206", "Silla 1206", "Sillas", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento y respaldo de cuerda sintética imitación enea, color natural. Sillón y taburete a juego: 2206 y 5206.", "85×45×56", "45", [("Precio", 117)], 32),
    ("duo", "Silla Dúo", "Sillas", "Interior", "Polipropileno", f"{PP2} Opción de asiento y respaldo tapizados.", "84×46×42", "45", [("Polipropileno", 120), ("Tapizado nivel 1", 153), ("Tapizado nivel 2", 161), ("Tapizado nivel 3", 165)], 34),
    ("ali", "Silla Ali", "Sillas", "Interior", "Polipropileno", f"{PP2} Opción de asiento y respaldo tapizados.", "84×46×42", "45", [("Polipropileno", 119), ("Tapizado nivel 1", 145), ("Tapizado nivel 2", 153), ("Tapizado nivel 3", 156)], 36),
    # ── Sillones y sofás
    ("vincent", "Sillón Vincent", "Sillones", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "79×52×54", "48", [("Nivel 1", 269), ("Nivel 2", 284), ("Nivel 3", 291)], 40),
    ("parma", "Sillón Parma", "Sillones", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "70×57×65", "48", [("Nivel 1", 757), ("Nivel 2", 787), ("Nivel 3", 801)], 46),
    ("teseo", "Sillón Teseo", "Sillones", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "89×51×50", "46", [("Nivel 1", 318), ("Nivel 2", 338), ("Nivel 3", 349)], 48),
    ("hera", "Sillón Hera", "Sillones", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "89×51×52", "46", [("Nivel 1", 348), ("Nivel 2", 371), ("Nivel 3", 381)], 50),
    ("gea", "Sillón Gea", "Sillones", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados.", "86×52×53", "47", [("Nivel 1", 353), ("Nivel 2", 377), ("Nivel 3", 389)], 52),
    ("shell-2t", "Sillón Shell", "Sillones", "Interior", "Metal y tapizado", "Sillón tapizado con armazón de tubo de acero pintado. También con armazón de varilla o imitación madera (consultar).", "80×50×50", "46", [("Nivel 1", 216), ("Nivel 2", 246), ("Nivel 3", 260)], 54),
    ("chicago", "Sillón Chicago", "Sillones", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento de rejilla o tapizado.", "84×58×52", "44", [("Nivel 1", 407), ("Nivel 2", 413), ("Nivel 3", 422), ("Rejilla", 469)], 58),
    ("tacoma", "Sillón Tacoma", "Sillones", "Interior", "Madera de haya", f"{HAYA} Asiento tapizado.", "86×69×65", "47", [("Nivel 1", 663), ("Nivel 2", 690), ("Nivel 3", 712)], 60),
    ("durango", "Sillón Durango", "Sillones", "Interior", "Madera de haya", f"{HAYA} Asiento tapizado.", "80×46×56", "46", [("Nivel 1", 468), ("Nivel 2", 489), ("Nivel 3", 498)], 62),
    ("laredo", "Sillón Laredo", "Sillones", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento tapizado.", "83×61×63", "46", [("Nivel 1", 774), ("Nivel 2", 780), ("Nivel 3", 789)], 64),
    ("pensacola", "Sillón Pensacola", "Sillones", "Interior", "Madera de haya y piel", f"{HAYA} Asiento y respaldo tapizados en piel.", "71×79×65", "39", [("Piel", 1028)], 66),
    ("lola-lounge", "Sillón Lola Lounge", "Sillones", "Interior", "Metal y tapizado", "Tubo de acero conificado pintado en negro. Tapizado según carta de telas o tela del cliente.", "70×55×74", "44", [("Nivel 1", 731), ("Nivel 2", 764), ("Nivel 3", 779)], 68),
    ("lola-sofa", "Sofá Lola", "Sillones", "Interior", "Metal y tapizado", "Sofá de tubo de acero conificado pintado en negro. Tapizado según carta de telas o tela del cliente.", "72×56×140", "44", [("Nivel 1", 1066), ("Nivel 2", 1126), ("Nivel 3", 1154)], 68),
    ("2203", "Sillón 2203", "Sillones", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento de lamas de aluminio con cojín antracita; respaldo de cuerda sintética antracita. Taburete a juego: 5203.", "76×51×55", "45", [("Precio", 200)], 74),
    ("2204", "Sillón 2204", "Sillones", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento y respaldo de cuerda sintética imitación enea, color natural. Taburete a juego: 5204.", "78×51×57", "44", [("Precio", 161)], 76),
    ("2206", "Sillón 2206", "Sillones", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento y respaldo de cuerda sintética imitación enea, color natural. Silla y taburete a juego: 1206 y 5206.", "83×51×55", "44", [("Precio", 136)], 76),
    ("ares", "Sillón Ares", "Sillones", "Exterior", "Aluminio y cuerda", "Armazón de aluminio con asiento y respaldo de cuerda sintética. Acabados antracita/antracita o blanco/marrón.", "85×66×64", "43", [("Precio", 305)], 78),
    ("atra", "Sillón Atra", "Sillones", "Interior", "Polipropileno", "Sillón de polipropileno en 2 piezas. Acabados sand, gris cálido, negro, menta y azul/blanco.", "83×54×60", "47", [("Precio", 135)], 80),
    ("duo-sillon", "Sillón Dúo", "Sillones", "Interior", "Polipropileno", f"{PP2} Opción de asiento y respaldo tapizados. Taburete a juego: Dúo Bar.", "84×46×42", "45", [("Polipropileno", 125), ("Tapizado nivel 1", 158), ("Tapizado nivel 2", 166), ("Tapizado nivel 3", 170)], 82),
    ("ali-sillon", "Sillón Ali", "Sillones", "Interior", "Polipropileno", f"{PP2} Opción de asiento y respaldo tapizados.", "84×46×54", "45", [("Polipropileno", 122), ("Tapizado nivel 1", 155), ("Tapizado nivel 2", 163), ("Tapizado nivel 3", 167)], 84),
    ("eva", "Sillón Eva", "Sillones", "Exterior", "Polipropileno y cuerda", "Carcasa y patas de polipropileno reforzado con fibra de vidrio y tejido de cuerda de nailon de alta resistencia. Antracita/gris o blanco/beige.", "83×42×56", "45", [("Precio", 210)], 86),
    # ── Taburetes (dos alturas, barra y confort, al mismo precio)
    ("devon-bar", "Taburete Devon Bar", "Taburetes", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados. Dos alturas: barra y confort. Silla a juego: Devon.", "112×48×53", "75", [("Nivel 1", 600), ("Nivel 2", 614), ("Nivel 3", 621)], 92),
    ("shell-bar", "Taburete Shell Bar", "Taburetes", "Interior", "Metal y tapizado", f"{METAL} Asiento y respaldo tapizados. Dos alturas: barra y confort. Versión sillón (Shell 2T) desde 244 € de tarifa.", "110×59×43", "75", [("Nivel 1", 187), ("Nivel 2", 238), ("Nivel 3", 250)], 94),
    ("tampico-bar", "Taburete Tampico Bar", "Taburetes", "Interior", "Madera de haya y rejilla", f"{HAYA} Respaldo de rejilla natural; asiento de madera o tapizado. Dos alturas: barra y confort.", "112×56×48", "76", [("Asiento de madera", 590), ("Nivel 1", 612), ("Nivel 2", 618), ("Nivel 3", 627)], 96),
    ("toluca-bar", "Taburete Toluca Bar", "Taburetes", "Interior", "Madera de haya", f"{HAYA} Asiento y respaldo tapizados. Dos alturas: barra y confort.", "97×54×43", "76", [("Nivel 1", 544), ("Nivel 2", 547), ("Nivel 3", 557)], 98),
    ("5203", "Taburete 5203", "Taburetes", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento de lamas de aluminio con cojín antracita; respaldo de cuerda sintética. Sillón a juego: 2203.", "107×58×50", "80", [("Confort", 197), ("Barra", 200)], 100),
    ("5204", "Taburete 5204", "Taburetes", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento de lamas de aluminio con cojín; respaldo de cuerda sintética imitación enea. Sillón a juego: 2204.", "107×58×50", "80", [("Confort", 197), ("Barra", 200)], 102),
    ("5206", "Taburete 5206", "Taburetes", "Exterior", "Aluminio y cuerda", f"{ALU} Asiento y respaldo de cuerda sintética imitación enea, color natural. Silla y sillón a juego: 1206 y 2206.", "110×51×44", "80", [("Confort", 167), ("Barra", 172)], 104),
    ("duo-bar", "Taburete Dúo Bar", "Taburetes", "Interior", "Polipropileno", "Taburete de polipropileno en 2 piezas (gris cálido, negro, sand o menta). Opción de asiento tapizado. Alturas de asiento 65 y 75 cm.", None, "65 / 75", [("Polipropileno", 132), ("Tapizado nivel 1", 149), ("Tapizado nivel 2", 152), ("Tapizado nivel 3", 154)], 106),
    # ── Bancos y pufs
    ("chicago-banqueta", "Banqueta Chicago", "Bancos y pufs", "Interior", "Madera de haya y rejilla", f"{HAYA} Asiento de rejilla natural o tapizado.", "46×45×54", None, [("Nivel 1", 315), ("Nivel 2", 321), ("Nivel 3", 330), ("Rejilla", 361)], 70),
    ("chicago-banco", "Banco Chicago 2 plazas", "Bancos y pufs", "Interior", "Madera de haya y rejilla", f"{HAYA} Asiento de rejilla natural o tapizado.", "46×45×120", None, [("Nivel 1", 407), ("Nivel 2", 413), ("Nivel 3", 422), ("Rejilla", 469)], 70),
    ("puf", "Puf", "Bancos y pufs", "Interior", "Aluminio y tapizado", "Puf con armazón de aluminio, tapizado según carta de telas o tela del cliente. También en 65 cm de alto y en versión doble (Puf 2).", "45×43", None, [("Nivel 1", 174), ("Nivel 2", 195), ("Nivel 3", 197)], 72),
]


def eur(v):
    return f"{v:,.2f} €".replace(",", "X").replace(".", ",").replace("X", ".")


def venta(t):
    return round(t * DESC, 2)


def con_iva(t):
    return round(venta(t) * IVA + 1e-9, 2)


def row(m, images):
    slug, name, cat, uso, mat, desc, dims, seat, prices, _ = m
    base = min(p for _, p in prices)
    if len(prices) > 1:
        opts = " · ".join(f"{lbl.lower()} {eur(con_iva(p))}" for lbl, p in prices)
        desc = f"{desc} Precio según acabado (IVA incl.): {opts}."
    return {
        "id": f"rc-{slug}", "supplier_id": "romero", "source": "romero_contract", "name": name,
        "category": cat, "uso": uso, "material": mat, "features": desc,
        "dimensions_raw": f"{dims} cm" if dims else None, "alto_asiento": f"{seat} cm" if seat else None,
        "price": venta(base), "price_display": eur(con_iva(base)), "is_new": False, "catas_certified": False,
        "img_url": images[0] if images else None, "images": images or None,
        "active": False, "hidden_by_campaign": False,
    }


# ── Fotos: ambiente = mayor imagen RGB de la página izquierda; producto = imágenes
#    RGB grandes de la derecha (fondo blanco). Las muestras de tela (≈213×262) se descartan.
def page_images(page, min_side):
    from PIL import Image
    out = []
    for f in sorted(glob.glob(os.path.join(WORK, "raw", f"i-{page:03d}-*.png"))):
        im = Image.open(f)
        if im.mode in ("L", "1", "LA"):        # máscaras / sombras
            continue
        if min(im.size) >= min_side:
            out.append((im.size[0] * im.size[1], f))
    return [f for _, f in sorted(out, reverse=True)]


# Modelos que comparten página y cuya foto de producto es de otro modelo
ONLY_AMBIENT = {"lola-lounge"}


def pick(m):
    left = m[9]
    amb = page_images(left, 600)[:1]
    prod = [] if m[0] in ONLY_AMBIENT else page_images(left + 1, 500)[:2]
    return amb + prod


def mask_for(path):
    """pdfimages escribe la máscara de transparencia (smask) como el archivo siguiente, en gris."""
    from PIL import Image
    d, name = os.path.split(path)
    pre, page, num = name[:-4].split("-")
    nxt = os.path.join(d, f"{pre}-{page}-{int(num) + 1:03d}.png")
    if os.path.exists(nxt):
        mk = Image.open(nxt)
        if mk.mode == "L":
            return mk


def extract(pdf):
    os.makedirs(os.path.join(WORK, "raw"), exist_ok=True)
    pages = sorted({m[9] for m in MODELS} | {m[9] + 1 for m in MODELS})
    subprocess.run(["pdfimages", "-png", "-p", "-f", str(pages[0]), "-l", str(pages[-1]), pdf,
                    os.path.join(WORK, "raw", "i")], check=True, stderr=subprocess.DEVNULL)


def flatten(path):
    """RGB sobre fondo blanco (aplicando la máscara si la hay) y recortado al producto."""
    from PIL import Image
    im = Image.open(path).convert("RGB")
    mk = mask_for(path)
    if mk is not None:
        mk = mk.resize(im.size)
        white = Image.new("RGB", im.size, "white")
        white.paste(im, (0, 0), mk)
        im = white
        box = mk.point(lambda v: 255 if v > 20 else 0).getbbox()
        if box:
            pad = int(max(im.size) * 0.04)
            im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
    return im


def to_jpeg(path):
    im = flatten(path)
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=84, optimize=True)
    return buf.getvalue()


def sheet():
    from PIL import Image, ImageDraw
    W, cols = 200, 4
    rows = []
    for m in MODELS:
        rows.append((m[1], pick(m)))
    canvas = Image.new("RGB", (W * cols, len(rows) * (W + 20)), "white")
    d = ImageDraw.Draw(canvas)
    for r, (name, files) in enumerate(rows):
        y = r * (W + 20)
        d.text((4, y + 4), name, fill="black")
        for c, f in enumerate(files[:cols - 1]):
            im = flatten(f)
            im.thumbnail((W - 6, W - 6))
            canvas.paste(im, ((c + 1) * W, y + 10))
    out = os.path.join(WORK, "revision.jpg")
    canvas.save(out, quality=70)
    print(out)


def env():
    vals = {}
    for line in open(os.path.join(ROOT, ".env.local")):
        if "=" in line and not line.startswith("#"):
            k, v = line.strip().split("=", 1)
            vals[k] = v.strip('"\'')
    url = vals.get("NEXT_PUBLIC_SUPABASE_URL") or vals.get("SUPABASE_URL")
    key = vals.get("SUPABASE_SERVICE_KEY") or vals.get("SUPABASE_SERVICE_ROLE_KEY")
    return url, key


def http(method, url, key, body=None, ctype="application/json", extra=None):
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": ctype, **(extra or {})}
    data = body if isinstance(body, (bytes, type(None))) else json.dumps(body).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers, method=method)) as r:
        return r.status


def apply():
    url, key = env()
    rows = []
    for m in MODELS:
        imgs = []
        for i, f in enumerate(pick(m)):
            path = f"{BUCKET_DIR}/{m[0]}-{i}.jpg"
            http("POST", f"{url}/storage/v1/object/product-images/{path}", key, to_jpeg(f), "image/jpeg", {"x-upsert": "true"})
            imgs.append(f"{url}/storage/v1/object/public/product-images/{path}")
        rows.append(row(m, imgs))
    http("POST", f"{url}/rest/v1/products", key, rows, extra={"Prefer": "resolution=merge-duplicates,return=minimal"})
    for r in rows:
        print(f"{r['id']:22} {r['category']:14} {r['price_display']:>11}  fotos={len(r['images'] or [])}")
    print(f"{len(rows)} productos insertados como borrador (active=false)")


def activate():
    url, key = env()
    ids = ",".join(f"rc-{m[0]}" for m in MODELS)
    http("PATCH", f"{url}/rest/v1/products?id=in.({ids})", key, {"active": True}, extra={"Prefer": "return=minimal"})
    print(f"{len(MODELS)} productos publicados")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf")
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--activate", action="store_true")
    a = ap.parse_args()
    if a.pdf:
        extract(a.pdf)
    if a.sheet:
        sheet()
    if a.apply:
        apply()
    if a.activate:
        activate()
