#!/usr/bin/env python3
"""
Crea la campaña de Búsqueda de Universo Hostelería en Google Ads (API REST).

- Todo se crea en PAUSA: no gasta nada hasta activarlo en el panel.
- Por defecto solo VALIDA (validateOnly): no crea nada. Usa --apply para crear.
- Una sola petición atómica (GoogleAdsService.Mutate): o se crea todo o nada.

Credenciales:
  GOOGLE_ADS_DEVELOPER_TOKEN  (.env.local)
  ~/.config/gcloud/application_default_credentials.json  (OAuth, scope adwords)

Uso:
  python3 scripts/ads/create_search_campaign.py --customer 7957669168 --daily-budget 20
  python3 scripts/ads/create_search_campaign.py --customer 7957669168 --daily-budget 20 --apply
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://googleads.googleapis.com/v25"
SITE = "https://www.universohosteleria.es"

SPAIN = "geoTargetConstants/2724"
SPANISH = "languageConstants/1003"

CAMPAIGN_NAME = "UH | Search | Mobiliario hostelería | ES"

# ── Grupos de anuncios ───────────────────────────────────────────────
# Palabras clave en concordancia de frase y exacta. Landing = página más específica.
AD_GROUPS = [
    {
        "name": "Sillas hostelería",
        "url": f"{SITE}/catalog?category=Sillas",
        "path": ["sillas", "hosteleria"],
        "keywords": [
            "sillas para hostelería", "sillas hostelería", "sillas para bar",
            "sillas para restaurante", "sillas para cafetería",
            "sillas apilables hostelería", "sillas polipropileno hostelería",
            "comprar sillas para bar", "sillas de bar baratas",
        ],
        "headlines": [
            "Sillas para Hostelería",
            "Sillas para Bar y Restaurante",
            "Desde 38,96 € IVA Incluido",
            "Sillas Apilables Resistentes",
            "Polipropileno Reforzado",
            "Precio Directo de Fábrica",
            "Entrega en Toda España",
            "Hasta 8 Colores Disponibles",
            "Pide tu Presupuesto Gratis",
            "Universo Hostelería",
            "Fabricantes Europeos",
            "Ideales para Uso Intensivo",
            "Asesoramiento sin Coste",
            "Silla Agua y Silla M1110",
            "Equipa tu Local Hoy",
        ],
        "descriptions": [
            "Sillas apilables para bares, restaurantes y cafeterías. Precio de fábrica.",
            "Polipropileno con fibra de vidrio: ligeras, resistentes y fáciles de limpiar.",
            "Elige modelo y color, y recibe tu presupuesto en menos de 24 horas.",
            "Entrega en toda España. Precios con IVA incluido. Pide presupuesto sin compromiso.",
        ],
    },
    {
        "name": "Mesas hostelería",
        "url": f"{SITE}/product/RM1825",
        "path": ["mesas", "hosteleria"],
        "keywords": [
            "mesas para hostelería", "mesas hostelería", "mesas para bar",
            "mesas de bar", "mesas para restaurante", "mesas para cafetería",
            "mesas de bar cuadradas", "mesas de bar redondas", "comprar mesas para bar",
        ],
        "headlines": [
            "Mesas para Hostelería",
            "Mesas para Bar y Restaurante",
            "Desde 98,25 € IVA Incluido",
            "Redondas o Cuadradas",
            "Melamina, Compact o Werzalit",
            "Elige Acabado y Medida",
            "Precio Directo de Fábrica",
            "Entrega en Toda España",
            "Pide tu Presupuesto Gratis",
            "Universo Hostelería",
            "Mesa 3020 para Hostelería",
            "Base de Hierro Resistente",
            "Fabricantes Europeos",
            "Asesoramiento sin Coste",
            "Equipa tu Local Hoy",
        ],
        "descriptions": [
            "Mesa 3020 con base de hierro y tablero a elegir. De Ø60 a 90×90 cm.",
            "Consulta todos los acabados y medidas con su precio final en la web.",
            "Melamina, Werzalit, Compact o chapado. Precio directo de fábrica, IVA incluido.",
            "Entrega en toda España. Recibe tu presupuesto en menos de 24 horas.",
        ],
    },
    {
        "name": "Sillones hostelería",
        "url": f"{SITE}/catalog?category=Sillones",
        "path": ["sillones", "hosteleria"],
        "keywords": [
            "sillones para hostelería", "sillones hostelería", "sillones para restaurante",
            "sillones para hotel", "butacas para hotel", "butacas hostelería",
            "sillones de madera para restaurante", "butacas para restaurante",
        ],
        "headlines": [
            "Sillones para Hostelería",
            "Sillones para Hotel y Bar",
            "Butacas para Hostelería",
            "Madera Maciza de Sungkay",
            "Sillón Lenox y Sillón Berna",
            "Precio Directo de Fábrica",
            "Entrega en Toda España",
            "Pide tu Presupuesto Gratis",
            "Universo Hostelería",
            "Diseño para tu Local",
            "Fabricantes Europeos",
            "Asesoramiento sin Coste",
            "Calidad Profesional",
            "Equipa tu Local Hoy",
            "Precios con IVA Incluido",
        ],
        "descriptions": [
            "Sillones y butacas para hoteles, restaurantes y lounges. Precio de fábrica.",
            "Madera maciza y tapizados de calidad profesional, pensados para uso intensivo.",
            "Te asesoramos sin coste y recibes tu presupuesto en menos de 24 horas.",
            "Entrega en toda España. Precios con IVA incluido. Pide presupuesto sin compromiso.",
        ],
    },
]

# Búsquedas que no queremos pagar (concordancia amplia negativa, nivel campaña)
NEGATIVES = [
    "segunda mano", "usadas", "usada", "usados", "wallapop", "milanuncios", "ikea",
    "gratis", "alquiler", "alquilar", "empleo", "trabajo", "curso", "plano", "dibujo",
    "bricolaje", "diy", "casera", "caseras", "infantil", "niños", "gaming", "oficina",
    "escritorio", "jardín casa", "pdf",
]

SITELINKS = [
    ("Ver Catálogo", "Todos nuestros productos", "Precios con IVA incluido", "/catalog"),
    ("Mesas de Bar", "Todos los acabados y medidas", "Mesa 3020 desde 98,25 €", "/product/RM1825"),
    ("Sillas de Hostelería", "Apilables y resistentes", "Desde 38,96 €", "/catalog?category=Sillas"),
    ("Sillones y Butacas", "Para hoteles y restaurantes", "Madera maciza y tapizados", "/catalog?category=Sillones"),
]
CALLOUTS = [
    "Precio de Fábrica", "Entrega en Toda España", "IVA Incluido",
    "Asesoramiento Gratuito", "Presupuesto en 24 h", "Fabricantes Europeos",
]

LIMITS = {"headline": 30, "description": 90, "path": 15, "sitelink": 25, "sitelink_desc": 35, "callout": 25}


def check_lengths():
    errs = []
    for g in AD_GROUPS:
        for h in g["headlines"]:
            if len(h) > LIMITS["headline"]:
                errs.append(f"[{g['name']}] título {len(h)}>30: {h}")
        for d in g["descriptions"]:
            if len(d) > LIMITS["description"]:
                errs.append(f"[{g['name']}] descripción {len(d)}>90: {d}")
        for p in g["path"]:
            if len(p) > LIMITS["path"]:
                errs.append(f"[{g['name']}] ruta {len(p)}>15: {p}")
        if not (3 <= len(g["headlines"]) <= 15 and 2 <= len(g["descriptions"]) <= 4):
            errs.append(f"[{g['name']}] nº de títulos/descripciones fuera de rango")
    for t, d1, d2, _ in SITELINKS:
        if len(t) > LIMITS["sitelink"]:
            errs.append(f"sitelink {len(t)}>25: {t}")
        for d in (d1, d2):
            if len(d) > LIMITS["sitelink_desc"]:
                errs.append(f"sitelink desc {len(d)}>35: {d}")
    for c in CALLOUTS:
        if len(c) > LIMITS["callout"]:
            errs.append(f"callout {len(c)}>25: {c}")
    return errs


def load_env_token():
    tok = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")
    if tok:
        return tok
    path = os.path.join(os.path.dirname(__file__), "..", "..", ".env.local")
    for line in open(path):
        if line.startswith("GOOGLE_ADS_DEVELOPER_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("Falta GOOGLE_ADS_DEVELOPER_TOKEN")


def access_token():
    adc = json.load(open(os.path.expanduser("~/.config/gcloud/application_default_credentials.json")))
    data = urllib.parse.urlencode({
        "client_id": adc["client_id"], "client_secret": adc["client_secret"],
        "refresh_token": adc["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", data=data))["access_token"]


def build_operations(cid, daily_budget, max_cpc):
    rn = lambda kind, tid: f"customers/{cid}/{kind}/{tid}"  # noqa: E731
    ops = []
    budget = rn("campaignBudgets", -1)
    campaign = rn("campaigns", -2)

    ops.append({"campaignBudgetOperation": {"create": {
        "resourceName": budget,
        "name": f"{CAMPAIGN_NAME} | presupuesto",
        "amountMicros": str(int(round(daily_budget * 1_000_000))),
        "deliveryMethod": "STANDARD",
        "explicitlyShared": False,
    }}})

    ops.append({"campaignOperation": {"create": {
        "resourceName": campaign,
        "name": CAMPAIGN_NAME,
        "status": "PAUSED",
        "advertisingChannelType": "SEARCH",
        "campaignBudget": budget,
        # Fase de validación sin historial de conversiones: maximizar clics con CPC máximo
        "targetSpend": {"cpcBidCeilingMicros": str(int(round(max_cpc * 1_000_000)))},
        "networkSettings": {
            "targetGoogleSearch": True, "targetSearchNetwork": False,
            "targetContentNetwork": False, "targetPartnerSearchNetwork": False,
        },
        # Solo personas EN España (no "interesadas en")
        "geoTargetTypeSetting": {"positiveGeoTargetType": "PRESENCE", "negativeGeoTargetType": "PRESENCE"},
        "containsEuPoliticalAdvertising": "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
    }}})

    ops.append({"campaignCriterionOperation": {"create": {"campaign": campaign, "location": {"geoTargetConstant": SPAIN}}}})
    ops.append({"campaignCriterionOperation": {"create": {"campaign": campaign, "language": {"languageConstant": SPANISH}}}})
    for n in NEGATIVES:
        ops.append({"campaignCriterionOperation": {"create": {
            "campaign": campaign, "negative": True, "keyword": {"text": n, "matchType": "BROAD"}}}})

    tid = -100
    for g in AD_GROUPS:
        ag = rn("adGroups", tid); tid -= 1
        ops.append({"adGroupOperation": {"create": {
            "resourceName": ag, "campaign": campaign, "name": g["name"],
            "status": "ENABLED", "type": "SEARCH_STANDARD",
        }}})
        for kw in g["keywords"]:
            for mt in ("PHRASE", "EXACT"):
                ops.append({"adGroupCriterionOperation": {"create": {
                    "adGroup": ag, "status": "ENABLED", "keyword": {"text": kw, "matchType": mt}}}})
        rsa = {
            "headlines": [{"text": h} for h in g["headlines"]],
            "descriptions": [{"text": d} for d in g["descriptions"]],
            "path1": g["path"][0], "path2": g["path"][1],
        }
        # Títulos sin fijar: rotación libre, Google aprende qué combinación funciona
        ops.append({"adGroupAdOperation": {"create": {
            "adGroup": ag, "status": "ENABLED",
            "ad": {"finalUrls": [g["url"]], "responsiveSearchAd": rsa},
        }}})

    for text, d1, d2, path in SITELINKS:
        a = rn("assets", tid); tid -= 1
        ops.append({"assetOperation": {"create": {
            "resourceName": a, "finalUrls": [SITE + path],
            "sitelinkAsset": {"linkText": text, "description1": d1, "description2": d2},
        }}})
        ops.append({"campaignAssetOperation": {"create": {"campaign": campaign, "asset": a, "fieldType": "SITELINK"}}})
    for text in CALLOUTS:
        a = rn("assets", tid); tid -= 1
        ops.append({"assetOperation": {"create": {"resourceName": a, "calloutAsset": {"calloutText": text}}}})
        ops.append({"campaignAssetOperation": {"create": {"campaign": campaign, "asset": a, "fieldType": "CALLOUT"}}})
    return ops


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--customer", required=True, help="ID de la cuenta, sin guiones")
    ap.add_argument("--login-customer", help="ID de la MCC si la cuenta está vinculada")
    ap.add_argument("--daily-budget", type=float, required=True, help="presupuesto diario en la moneda de la cuenta")
    ap.add_argument("--max-cpc", type=float, default=None, help="CPC máximo (por defecto = 25%% del diario)")
    ap.add_argument("--apply", action="store_true", help="crear de verdad (sin esto solo valida)")
    a = ap.parse_args()

    errs = check_lengths()
    if errs:
        print("\n".join(errs)); sys.exit("Textos fuera de límite")

    cid = a.customer.replace("-", "")
    max_cpc = a.max_cpc if a.max_cpc is not None else round(a.daily_budget * 0.25, 2)
    ops = build_operations(cid, a.daily_budget, max_cpc)

    headers = {
        "Authorization": f"Bearer {access_token()}",
        "developer-token": load_env_token(),
        "Content-Type": "application/json",
    }
    if a.login_customer:
        headers["login-customer-id"] = a.login_customer.replace("-", "")
    body = {"mutateOperations": ops, "validateOnly": not a.apply, "partialFailure": False}
    req = urllib.request.Request(f"{API}/customers/{cid}/googleAds:mutate",
                                 data=json.dumps(body).encode(), headers=headers, method="POST")
    mode = "CREAR (en pausa)" if a.apply else "VALIDAR (no crea nada)"
    print(f"{mode} · cuenta {cid} · {len(ops)} operaciones · diario {a.daily_budget} · CPC máx {max_cpc}")
    try:
        res = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        err = json.loads(e.read().decode() or "{}")
        for d in err.get("error", {}).get("details", []):
            for x in d.get("errors", []):
                loc = ".".join(f.get("fieldName", "") + (f"[{f['index']}]" if "index" in f else "")
                               for f in x.get("location", {}).get("fieldPathElements", []))
                print(f"- {x.get('message')}  [{list(x.get('errorCode', {}).values())}]  {loc}")
        print(err.get("error", {}).get("message", ""))
        sys.exit(1)
    if a.apply:
        made = [list(r.values())[0].get("resourceName") for r in res.get("mutateOperationResponses", [])]
        print("Creado:", next((m for m in made if m and "/campaigns/" in m), "?"))
    else:
        print("OK: la API acepta toda la campaña.")


if __name__ == "__main__":
    main()
