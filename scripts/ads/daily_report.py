#!/usr/bin/env python3
"""
Informe diario de Google Ads (en español) para Universo Hostelería.

Lee los datos de la API de Google Ads (REST) y los pedidos de la web (Supabase)
y genera:
  - un JSON con todas las cifras (para que quien redacte añada sugerencias)
  - un HTML de email listo, con el marcador <!--SUGERENCIAS--> donde van las sugerencias

Credenciales (mismas que scripts/ads/create_search_campaign.py):
  GOOGLE_ADS_DEVELOPER_TOKEN, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_URL  (.env.local)
  ~/.config/gcloud/application_default_credentials.json  (OAuth, scope adwords)

Uso:
  python3 scripts/ads/daily_report.py --out .ads-reports/2026-10-14          # cifras de ayer -> .json
  python3 scripts/ads/daily_report.py --day today --out /tmp/hoy             # hoy, datos parciales
  python3 scripts/ads/daily_report.py --render .ads-reports/2026-10-14 \
      --sugerencias .ads-reports/2026-10-14.sugerencias.json                  # -> .html y .txt del email
Salida con error (código 2) y mensaje claro si el login de Google ha caducado.
"""
import argparse
import datetime as dt
import html
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

API = "https://googleads.googleapis.com/v25"
CUSTOMER = "7957669168"
TZ = ZoneInfo("America/Sao_Paulo")  # zona horaria de la cuenta de Google Ads
LAUNCH = dt.date(2026, 10, 12)      # primer día con impresiones
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")


# ── credenciales ─────────────────────────────────────────────────────
ALIASES = {"NEXT_PUBLIC_SUPABASE_URL": "SUPABASE_URL"}


def env(name):
    for n in (name, ALIASES.get(name)):
        if n and os.environ.get(n):
            return os.environ[n]
    path = os.path.join(ROOT, ".env.local")
    if os.path.exists(path):
        for line in open(path):
            if line.startswith(name + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def access_token():
    if os.environ.get("GOOGLE_ADS_REFRESH_TOKEN"):
        adc = {"client_id": os.environ["GOOGLE_ADS_CLIENT_ID"], "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
               "refresh_token": os.environ["GOOGLE_ADS_REFRESH_TOKEN"]}
    else:
        adc = json.load(open(os.path.expanduser("~/.config/gcloud/application_default_credentials.json")))
    data = urllib.parse.urlencode({
        "client_id": adc["client_id"], "client_secret": adc["client_secret"],
        "refresh_token": adc["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    try:
        return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", data=data))["access_token"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "invalid_grant" in body:
            print("ERROR_LOGIN: el login de Google Ads ha caducado. Hay que repetir el login OAuth "
                  "(gcloud auth application-default login con el cliente «UH ADS») o publicar la app OAuth.", file=sys.stderr)
            sys.exit(2)
        raise


def gaql(token, dev, query):
    req = urllib.request.Request(
        f"{API}/customers/{CUSTOMER}/googleAds:search",
        data=json.dumps({"query": query}).encode(),
        headers={"Authorization": f"Bearer {token}", "developer-token": dev, "Content-Type": "application/json"},
    )
    rows, page = [], None
    while True:
        if page:
            req.data = json.dumps({"query": query, "pageToken": page}).encode()
        try:
            res = json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as e:
            print("ERROR_API:", e.read().decode()[:800], file=sys.stderr)
            sys.exit(3)
        rows += res.get("results", [])
        page = res.get("nextPageToken")
        if not page:
            return rows


def m(row, key, default=0):
    v = row.get("metrics", {}).get(key, default)
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def metrics_block(rows):
    imp = sum(m(r, "impressions") for r in rows)
    clk = sum(m(r, "clicks") for r in rows)
    cost = sum(m(r, "costMicros") for r in rows) / 1e6
    conv = sum(m(r, "conversions") for r in rows)
    return {
        "impresiones": int(imp), "clics": int(clk), "coste": round(cost, 2), "conversiones": round(conv, 2),
        "ctr": round(clk / imp * 100, 2) if imp else 0.0,
        "cpc_medio": round(cost / clk, 2) if clk else 0.0,
        "coste_por_conversion": round(cost / conv, 2) if conv else None,
    }


# ── pedidos de la web (Supabase) ─────────────────────────────────────
TEST_WORDS = {"teste", "test", "prueba", "testing"}


def is_test_order(r):
    """Pruebas internas: email del equipo o nombres/emails tipo «teste», «test», «prueba»."""
    email = str(r.get("contacto_email") or "").lower().strip()
    if email.endswith("@flowcode.cc") or email.split("@")[0] in TEST_WORDS:
        return True
    return any(str(r.get(k) or "").lower().strip() in TEST_WORDS for k in ("empresa_nombre", "contacto_nombre"))

def orders(since_utc, until_utc):
    url, key = env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_KEY")
    q = urllib.parse.urlencode([
        ("select", "created_at,items,total_estimado,contacto_email,contacto_nombre,empresa_nombre"),
        ("created_at", f"gte.{since_utc}"), ("created_at", f"lt.{until_utc}"),
        ("order", "created_at.asc"),
    ])
    req = urllib.request.Request(f"{url}/rest/v1/orders?{q}", headers={"apikey": key, "Authorization": f"Bearer {key}"})
    rows = json.load(urllib.request.urlopen(req))
    # Fuera pruebas internas; sin datos personales en el informe
    rows = [r for r in rows if not is_test_order(r)]
    return [{"fecha": r["created_at"][:16].replace("T", " "),
             "dia_local": dt.datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")).astimezone(TZ).date().isoformat(),
             "productos": [f'{i.get("name")} × {i.get("qty")}' for i in r.get("items") or []],
             "total_sin_iva": r.get("total_estimado")} for r in rows]


def day_bounds_utc(d):
    start = dt.datetime.combine(d, dt.time.min, TZ).astimezone(dt.timezone.utc)
    end = start + dt.timedelta(days=1)
    return start.strftime("%Y-%m-%dT%H:%M:%SZ"), end.strftime("%Y-%m-%dT%H:%M:%SZ")


# ── recogida ─────────────────────────────────────────────────────────
def collect(day):
    dev = env("GOOGLE_ADS_DEVELOPER_TOKEN")
    tok = access_token()
    d, acc_from = day.isoformat(), max(LAUNCH, day - dt.timedelta(days=60)).isoformat()
    w7 = (day - dt.timedelta(days=6)).isoformat()

    camp = gaql(tok, dev, f"""
      SELECT campaign.name, campaign.status, campaign.primary_status, campaign.primary_status_reasons,
             campaign_budget.amount_micros, metrics.impressions, metrics.clicks, metrics.cost_micros,
             metrics.conversions, metrics.search_impression_share, metrics.search_budget_lost_impression_share,
             metrics.search_rank_lost_impression_share
      FROM campaign WHERE segments.date = '{d}'""")
    camp_info = gaql(tok, dev, """
      SELECT campaign.name, campaign.status, campaign.primary_status, campaign.primary_status_reasons,
             campaign_budget.amount_micros FROM campaign""")
    acc = gaql(tok, dev, f"""
      SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM campaign WHERE segments.date BETWEEN '{acc_from}' AND '{d}'""")
    ag_day = gaql(tok, dev, f"""
      SELECT ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM ad_group WHERE segments.date = '{d}'""")
    ag_acc = gaql(tok, dev, f"""
      SELECT ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM ad_group WHERE segments.date BETWEEN '{acc_from}' AND '{d}'""")
    dev_day = gaql(tok, dev, f"""
      SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros
      FROM campaign WHERE segments.date = '{d}'""")
    terms = gaql(tok, dev, f"""
      SELECT search_term_view.search_term, ad_group.name, metrics.impressions, metrics.clicks,
             metrics.cost_micros, metrics.conversions
      FROM search_term_view WHERE segments.date BETWEEN '{w7}' AND '{d}'
      ORDER BY metrics.impressions DESC LIMIT 40""")
    kws = gaql(tok, dev, f"""
      SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
             ad_group_criterion.quality_info.quality_score, ad_group_criterion.system_serving_status,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM keyword_view WHERE segments.date BETWEEN '{acc_from}' AND '{d}'
      ORDER BY metrics.cost_micros DESC LIMIT 60""")
    daily = gaql(tok, dev, f"""
      SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.all_conversions
      FROM campaign WHERE segments.date BETWEEN '{LAUNCH.isoformat()}' AND '{d}'""")
    conv_by = gaql(tok, dev, f"""
      SELECT segments.conversion_action_name, metrics.all_conversions
      FROM campaign WHERE segments.date BETWEEN '{LAUNCH.isoformat()}' AND '{d}'""")
    negs = gaql(tok, dev, """
      SELECT campaign_criterion.keyword.text FROM campaign_criterion
      WHERE campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'""")
    bid = gaql(tok, dev, "SELECT campaign.target_spend.cpc_bid_ceiling_micros FROM campaign")
    ads = gaql(tok, dev, """
      SELECT ad_group.name, ad_group_ad.ad_strength, ad_group_ad.primary_status,
             ad_group_ad.policy_summary.approval_status FROM ad_group_ad""")

    def by(rows, key_fn):
        out = {}
        for r in rows:
            out.setdefault(key_fn(r), []).append(r)
        return {k: metrics_block(v) for k, v in out.items()}

    c0 = camp[0] if camp else {}
    ci = camp_info[0] if camp_info else {}
    s, e = day_bounds_utc(day)
    s_acc, _ = day_bounds_utc(dt.date.fromisoformat(acc_from))
    return {
        "dia": d,
        "desde_lanzamiento": acc_from,
        "moneda": "BRL",
        "campana": {
            "nombre": ci.get("campaign", {}).get("name"),
            "estado": ci.get("campaign", {}).get("status"),
            "estado_principal": ci.get("campaign", {}).get("primaryStatus"),
            "motivos": ci.get("campaign", {}).get("primaryStatusReasons", []),
            "presupuesto_diario": int(ci.get("campaignBudget", {}).get("amountMicros", 0)) / 1e6,
        },
        "dia_metricas": metrics_block(camp),
        "cuota_impresiones": {
            "obtenida_pct": round(m(c0, "searchImpressionShare") * 100, 1) if c0 else None,
            "perdida_por_presupuesto_pct": round(m(c0, "searchBudgetLostImpressionShare") * 100, 1) if c0 else None,
            "perdida_por_ranking_pct": round(m(c0, "searchRankLostImpressionShare") * 100, 1) if c0 else None,
        },
        "acumulado": metrics_block(acc),
        "grupos_dia": by(ag_day, lambda r: r["adGroup"]["name"]),
        "grupos_acumulado": by(ag_acc, lambda r: r["adGroup"]["name"]),
        "dispositivos_dia": by(dev_day, lambda r: r["segments"]["device"]),
        "terminos_7_dias": [{
            "termino": r["searchTermView"]["searchTerm"], "grupo": r["adGroup"]["name"],
            "impresiones": int(m(r, "impressions")), "clics": int(m(r, "clicks")),
            "coste": round(m(r, "costMicros") / 1e6, 2), "conversiones": m(r, "conversions"),
        } for r in terms],
        "palabras_clave_acumulado": [{
            "grupo": r["adGroup"]["name"], "texto": r["adGroupCriterion"]["keyword"]["text"],
            "concordancia": r["adGroupCriterion"]["keyword"]["matchType"],
            "nivel_calidad": r["adGroupCriterion"].get("qualityInfo", {}).get("qualityScore"),
            "estado": r["adGroupCriterion"].get("systemServingStatus"),
            "impresiones": int(m(r, "impressions")), "clics": int(m(r, "clicks")),
            "coste": round(m(r, "costMicros") / 1e6, 2), "conversiones": m(r, "conversions"),
        } for r in kws if m(r, "impressions") > 0],
        "anuncios": [{
            "grupo": r["adGroup"]["name"], "fuerza": r["adGroupAd"].get("adStrength"),
            "estado": r["adGroupAd"].get("primaryStatus"),
            "aprobacion": r["adGroupAd"].get("policySummary", {}).get("approvalStatus"),
        } for r in ads],
        "pedidos_web_dia": orders(s, e),
        "pedidos_web_acumulado": len(pedidos_all := orders(day_bounds_utc(LAUNCH)[0], e)),
        "serie_diaria": [{
            "fecha": r["segments"]["date"], "impresiones": int(m(r, "impressions")), "clics": int(m(r, "clicks")),
            "coste": round(m(r, "costMicros") / 1e6, 2), "contactos_google": round(m(r, "allConversions"), 1),
            "solicitudes_web": sum(1 for o in pedidos_all if o["dia_local"] == r["segments"]["date"]),
        } for r in sorted(daily, key=lambda r: r["segments"]["date"])],
        "contactos_por_tipo": {k: v for k, v in (
            (name, round(sum(m(r, "allConversions") for r in conv_by if r["segments"]["conversionActionName"] == name), 1))
            for name in {r["segments"]["conversionActionName"] for r in conv_by}) if v},
        "negativas": sorted({r["campaignCriterion"]["keyword"]["text"].lower() for r in negs}),
        "cpc_maximo": int(bid[0]["campaign"].get("targetSpend", {}).get("cpcBidCeilingMicros", 0)) / 1e6 if bid else None,
    }


# ── HTML del email ───────────────────────────────────────────────────
# Diseño pensado para clientes de correo (tablas + estilos en línea). Al final todo
# carácter no ASCII se convierte en entidad HTML (&#243;…) para que los acentos se
# vean bien aunque el correo no declare el juego de caracteres.
GROUPS_ES = {"Sillas hostelería": "Sillas", "Mesas hostelería": "Mesas", "Sillones hostelería": "Sillones"}
DEVICES_ES = {"MOBILE": "Móvil", "DESKTOP": "Ordenador", "TABLET": "Tablet", "CONNECTED_TV": "TV", "OTHER": "Otros"}
STATUS_ES = {"ELIGIBLE": "Activa", "LEARNING": "Activa, en aprendizaje", "PAUSED": "Pausada",
             "LIMITED": "Activa, limitada", "NOT_ELIGIBLE": "No apta", "PENDING": "Pendiente"}
CONTACT_ES = {"Clic en WhatsApp": "WhatsApp", "Enviar formulário de lead": "Formulario web", "Clicks to call": "Clic en llamar", "Llamada desde el anuncio (30 s o más)": "Llamadas",
              "Lead form - Submit": "Formulario del anuncio", "Local actions - Directions": "Cómo llegar"}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

INK, MUTED, LINE, SOFT, BLUE, BLUE_SOFT = "#111111", "#6B6B6B", "#ECECEA", "#F6F6F4", "#2B6FD4", "#EAF1FB"
FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"


def money(v):
    return "—" if v is None else f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def num(v):
    return f"{int(v):,}".replace(",", ".")


def pct(v, dec=0):
    return (f"{v:.{dec}f}".replace(".", ",") + " %") if v is not None else "—"


def fecha_es(iso, year=True):
    d = dt.date.fromisoformat(iso)
    return f"{d.day} de {MESES[d.month - 1]}" + (f" de {d.year}" if year else "")


def esc(s):
    return html.escape(str(s))


def title(t):
    return (f'<tr><td class="px" style="padding:30px 32px 10px;font-family:{FONT};font-size:12px;font-weight:700;'
            f'letter-spacing:1.4px;text-transform:uppercase;color:{BLUE}">{t}</td></tr>')


def kpi_cell(label, value, sub):
    return (f'<td width="50%" valign="top" style="padding:6px">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{SOFT};border-radius:12px">'
            f'<tr><td style="padding:16px 18px;font-family:{FONT}">'
            f'<div style="font-size:12px;color:{MUTED}">{label}</div>'
            f'<div style="font-size:26px;line-height:32px;font-weight:700;color:{INK};margin-top:4px;white-space:nowrap">{value}</div>'
            f'<div style="font-size:12px;color:{MUTED};margin-top:2px">{sub}</div>'
            f'</td></tr></table></td>')


def bar(parts):
    """parts = [(pct, color)] que suman ≤ 100; barra horizontal con tablas."""
    cells = "".join(f'<td width="{max(p, 0.5):.1f}%" style="background:{c};height:10px;font-size:0;line-height:0">&nbsp;</td>' for p, c in parts if p > 0)
    rest = 100 - sum(p for p, _ in parts)
    if rest > 0.5:
        cells += f'<td width="{rest:.1f}%" style="background:{LINE};height:10px;font-size:0;line-height:0">&nbsp;</td>'
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:6px;overflow:hidden"><tr>{cells}</tr></table>'


def data_table(headers, rows, first_wide=True, compact=False):
    fs = "13px" if compact else "14px"
    def cell(i, c, head=False):
        pad = "0 0 8px" if head else "10px 0"
        left = "" if i == 0 else ";padding-left:8px"
        nowrap = "white-space:nowrap;" if (i > 0 or compact) else ""
        style = (f'padding:{pad}{left};font-family:{FONT};{nowrap}text-align:{"left" if i == 0 else "right"};'
                 + (f'font-size:11px;font-weight:600;color:{MUTED};border-bottom:1px solid {LINE}' if head
                    else f'font-size:{fs};color:{INK};border-bottom:1px solid {LINE}'))
        return f'<td style="{style}">{c}</td>'
    th = "".join(cell(i, h, True) for i, h in enumerate(headers))
    trs = "".join("<tr>" + "".join(cell(i, c) for i, c in enumerate(row)) + "</tr>" for row in rows)
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{th}</tr>{trs}</table>'


def wrap(inner):
    return f'<tr><td class="px" style="padding:0 32px">{inner}</td></tr>'


def headline(data):
    dm, ped = data["dia_metricas"], len(data["pedidos_web_dia"])
    if not dm["impresiones"]:
        return "Ayer el anuncio no se mostró."
    partes = [f'{num(dm["clics"])} {"clic" if dm["clics"] == 1 else "clics"} por {money(dm["coste"])}']
    if ped:
        partes.append(f'{ped} {"solicitud" if ped == 1 else "solicitudes"} en la web')
    elif data.get("pedidos_web_acumulado"):
        partes.append("ninguna solicitud en la web ese día")
    else:
        partes.append("sin solicitudes en la web todavía")
    return f'{partes[0]}, {partes[1]}.'


def render(data, sugerencias=None, nota=None):
    c, dm, ac, cu = data["campana"], data["dia_metricas"], data["acumulado"], data["cuota_impresiones"]
    estado = STATUS_ES.get(c["estado_principal"], c["estado_principal"] or "—")
    ped_dia = len(data["pedidos_web_dia"])
    budget = c["presupuesto_diario"] or 0
    uso = min(100, dm["coste"] / budget * 100) if budget else 0

    rows = []
    # Cabecera
    rows.append(
        f'<tr><td style="background:{INK};padding:28px 32px;border-radius:16px 16px 0 0;font-family:{FONT}">'
        f'<div style="font-size:12px;letter-spacing:1.6px;color:#9A9A9A;text-transform:uppercase">Universo Hosteler&iacute;a · Google Ads</div>'
        f'<div style="font-size:26px;line-height:32px;font-weight:700;color:#FFFFFF;margin-top:8px">Informe del {fecha_es(data["dia"], year=False)}</div>'
        f'<div style="font-size:14px;color:#CFCFCF;margin-top:6px">{headline(data)}</div></td></tr>')
    if nota:
        rows.append(f'<tr><td style="background:{BLUE_SOFT};padding:12px 32px;font-family:{FONT};font-size:13px;line-height:19px;color:#1A4FA0">{esc(nota)}</td></tr>')

    # KPIs 2×2
    rows.append(title("Resumen del día"))
    rows.append(f'<tr><td class="pxk" style="padding:0 26px">'
                f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
                f'<tr>{kpi_cell("Veces que se vio el anuncio", num(dm["impresiones"]), "impresiones")}'
                f'{kpi_cell("Personas que hicieron clic", num(dm["clics"]), pct(dm["ctr"], 1) + " de quienes lo vieron")}</tr>'
                f'<tr>{kpi_cell("Inversión", money(dm["coste"]), "de " + money(budget) + " al día")}'
                f'{kpi_cell("Solicitudes en la web", str(ped_dia), "coste por clic " + money(dm["cpc_medio"]))}</tr>'
                f'</table></td></tr>')

    # Barras: presupuesto y alcance
    alc = ""
    if cu["obtenida_pct"] is not None and dm["impresiones"]:
        alc = (f'<div style="font-family:{FONT};font-size:14px;color:{INK};margin:22px 0 8px">'
               f'Apareci&oacute; en el <b>{pct(cu["obtenida_pct"])}</b> de las b&uacute;squedas posibles</div>'
               + bar([(cu["obtenida_pct"], BLUE), (cu["perdida_por_presupuesto_pct"], "#9DB9E6")])
               + f'<div style="font-family:{FONT};font-size:12px;color:{MUTED};margin-top:8px">'
                 f'<span style="color:{BLUE}">&#9632;</span> mostrado &nbsp; <span style="color:#9DB9E6">&#9632;</span> perdido por presupuesto ({pct(cu["perdida_por_presupuesto_pct"])}) &nbsp; '
                 f'<span style="color:#CFCFCF">&#9632;</span> perdido por posici&oacute;n ({pct(cu["perdida_por_ranking_pct"])})</div>')
    rows.append(wrap(
        f'<div style="font-family:{FONT};font-size:14px;color:{INK};margin:14px 0 8px">Presupuesto del día usado: <b>{pct(uso)}</b></div>'
        + bar([(uso, INK)]) + alc
        + f'<div style="font-family:{FONT};font-size:13px;color:{MUTED};margin-top:16px">Estado de la campa&ntilde;a: <b style="color:{INK}">{estado}</b></div>'))

    # Acumulado
    rows.append(title(f'Desde el lanzamiento ({fecha_es(data["desde_lanzamiento"], year=False)})'))
    rows.append(wrap(data_table(["", "Total"], [
        ["Impresiones", num(ac["impresiones"])], ["Clics", num(ac["clics"])],
        ["Inversión", money(ac["coste"])], ["Coste medio por clic", money(ac["cpc_medio"])],
        ["Solicitudes en la web", str(data["pedidos_web_acumulado"])],
    ])))

    # Día a día desde el lanzamiento
    serie = data.get("serie_diaria") or []
    if serie:
        rows.append(title("Día a día"))
        dias = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
        filas = []
        for r in serie:
            d = dt.date.fromisoformat(r["fecha"])
            filas.append([f'{dias[d.weekday()]} {d.day}/{d.month}', num(r["impresiones"]), num(r["clics"]), money(r["coste"]),
                          f'{r["contactos_google"]:g}'.replace(".", ","), str(r["solicitudes_web"])])
        tot = [f'<b>Total</b>', f'<b>{num(sum(r["impresiones"] for r in serie))}</b>', f'<b>{num(sum(r["clics"] for r in serie))}</b>',
               f'<b>{money(sum(r["coste"] for r in serie))}</b>', f'<b>{sum(r["contactos_google"] for r in serie):g}</b>'.replace(".", ","),
               f'<b>{sum(r["solicitudes_web"] for r in serie)}</b>']
        rows.append(wrap(data_table(["Día", "Impr.", "Clics", "Gasto", "Contac.", "Solic."], filas + [tot], compact=True)))
        tipos = data.get("contactos_por_tipo") or {}
        tipos_txt = " &#183; ".join(f'{CONTACT_ES.get(k, k)}: {v:g}' for k, v in tipos.items()) or "ninguno todav&iacute;a"
        rows.append(wrap(f'<div style="font-family:{FONT};font-size:12.5px;line-height:19px;color:{MUTED};margin-top:10px">'
                         f'Contac. = contactos registrados por Google Ads (formulario, WhatsApp, llamadas y clics en llamar). '
                         f'Solic. = pedidos de presupuesto recibidos en la web. Contactos por tipo: {tipos_txt}.</div>'))

    # Por producto
    grupos = [[GROUPS_ES.get(g, g), num(v["impresiones"]), num(v["clics"]), money(v["coste"])]
              for g, v in sorted(data["grupos_dia"].items(), key=lambda x: -x[1]["impresiones"])]
    if grupos:
        rows.append(title("Por producto (" + fecha_es(data["dia"], year=False) + ")"))
        rows.append(wrap(data_table(["Grupo", "Impresiones", "Clics", "Inversión"], grupos)))

    # Dispositivos (en una línea)
    disp = [(DEVICES_ES.get(k, k), v) for k, v in sorted(data["dispositivos_dia"].items(), key=lambda x: -x[1]["impresiones"]) if v["impresiones"]]
    if disp:
        tot = sum(v["impresiones"] for _, v in disp) or 1
        txt = " · ".join(f'{n} {pct(v["impresiones"] / tot * 100)}' for n, v in disp)
        rows.append(wrap(f'<div style="font-family:{FONT};font-size:13px;color:{MUTED};margin-top:14px">Dispositivos (impresiones): {txt}</div>'))

    # Búsquedas (agrupadas por término)
    agg = {}
    for t in data["terminos_7_dias"]:
        a = agg.setdefault(t["termino"], {"impresiones": 0, "clics": 0, "coste": 0.0})
        a["impresiones"] += t["impresiones"]; a["clics"] += t["clics"]; a["coste"] += t["coste"]
    terms = sorted(agg.items(), key=lambda x: (-x[1]["clics"], -x[1]["impresiones"]))[:10]
    rows.append(title("Qué buscó la gente (7 días)"))
    if terms:
        rows.append(wrap(data_table(["Búsqueda", "Impr.", "Clics"], [[esc(k), num(v["impresiones"]), num(v["clics"])] for k, v in terms])))
    else:
        rows.append(wrap(f'<div style="font-family:{FONT};font-size:13px;color:{MUTED}">Google a&uacute;n no muestra b&uacute;squedas (tarda 1&ndash;2 d&iacute;as).</div>'))

    # Sugerencias
    rows.append(title("Sugerencias de mejora"))
    if sugerencias:
        items = ""
        for i, s in enumerate(sugerencias, 1):
            items += (f'<tr><td valign="top" width="34" style="padding:0 0 16px">'
                      f'<div style="width:26px;height:26px;border-radius:13px;background:{BLUE};color:#fff;font-family:{FONT};'
                      f'font-size:13px;font-weight:700;line-height:26px;text-align:center">{i}</div></td>'
                      f'<td valign="top" style="padding:2px 0 16px;font-family:{FONT};font-size:14px;line-height:21px;color:#333">'
                      f'<b style="color:{INK}">{esc(s["titulo"])}</b><br>{esc(s["texto"])}</td></tr>')
        rows.append(wrap(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{items}</table>'
                         f'<div style="font-family:{FONT};font-size:12px;color:{MUTED}">Son propuestas: no se cambia nada en la campa&ntilde;a sin vuestra confirmaci&oacute;n.</div>'))
    else:
        rows.append(wrap("<!--SUGERENCIAS-->"))

    # Pie
    rows.append(f'<tr><td style="padding:28px 32px 30px"><div style="border-top:1px solid {LINE};padding-top:14px;font-family:{FONT};'
                f'font-size:11.5px;line-height:17px;color:#9A9A9A">Importes en reales brasile&ntilde;os (moneda de la cuenta de Google Ads). '
                f'Las solicitudes son peticiones de presupuesto recibidas en universohosteleria.es, sin pruebas internas. '
                f'Informe autom&aacute;tico de FlowCode.</div></td></tr>')

    doc = ('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           '<title>Informe Google Ads</title>'
           '<style>@media (max-width:400px){.px{padding-left:18px!important;padding-right:18px!important}'
           '.pxk{padding-left:12px!important;padding-right:12px!important}.outer{padding:12px 6px!important}}</style></head>'
           f'<body style="margin:0;padding:0;background:#EFEFEC">'
           f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEFEC"><tr><td class="outer" align="center" style="padding:24px 12px">'
           f'<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:16px">'
           + "".join(rows) + '</table></td></tr></table></body></html>')
    # Acentos a prueba de cualquier cliente de correo
    return doc.encode("ascii", "xmlcharrefreplace").decode("ascii")


def render_text(data, sugerencias):
    c, dm, ac = data["campana"], data["dia_metricas"], data["acumulado"]
    lines = [f'Informe Google Ads · Universo Hostelería · {fecha_es(data["dia"])}', "", headline(data), "",
             f'Impresiones: {num(dm["impresiones"])} · Clics: {num(dm["clics"])} ({pct(dm["ctr"], 1)}) · Inversión: {money(dm["coste"])} de {money(c["presupuesto_diario"])} · Solicitudes web: {len(data["pedidos_web_dia"])}',
             f'Desde el lanzamiento: {num(ac["impresiones"])} impresiones, {num(ac["clics"])} clics, {money(ac["coste"])}, {data["pedidos_web_acumulado"]} solicitudes.', "",
             "Sugerencias de mejora:"]
    lines += [f'{i}. {s["titulo"]} {s["texto"]}' for i, s in enumerate(sugerencias or [], 1)]
    lines += ["", "Son propuestas: no se cambia nada en la campaña sin vuestra confirmación."]
    return "\n".join(lines)


# ── Sugerencias automáticas (reglas) ────────────────────────────────
# Señales en búsquedas que no encajan con el catálogo (sillas, mesas y sillones de hostelería)
IRRELEVANT = ["segunda mano", "usad", "wallapop", "milanuncios", "ikea", "gratis", "alquiler", "empleo", "trabajo",
              "curso", "liquidaci", "outlet", "taburete", "alta", "catering", "sof", "cama", "colchon", "oficina",
              "escritorio", "gaming", "infantil", "niño", "jardin", "jardín", "diy", "bricolaje", "segunda"]


def sugerencias_auto(data):
    """Devuelve 3–5 sugerencias en español, priorizadas, a partir de las cifras."""
    out = []  # (prioridad, titulo, texto)
    dm, ac, cu = data["dia_metricas"], data["acumulado"], data["cuota_impresiones"]
    serie = data.get("serie_diaria") or []
    contactos = sum(r["contactos_google"] for r in serie)
    solicitudes = data.get("pedidos_web_acumulado", 0)
    negs = set(data.get("negativas") or [])
    cpc_max = data.get("cpc_maximo")

    # 1) Contactos
    tipos_all = data.get("contactos_por_tipo") or {}
    reales = sum(v for k, v in tipos_all.items() if k != "Clicks to call")  # el clic en llamar no garantiza llamada
    if solicitudes or reales:
        SING = {"WhatsApp": ("clic en WhatsApp", "clics en WhatsApp"), "Llamadas": ("llamada de 30 s o más", "llamadas de 30 s o más"), "Clic en llamar": ("clic en el botón de llamar del anuncio (no garantiza que la llamada se hiciera)", "clics en el botón de llamar del anuncio (no garantizan que la llamada se hiciera)"),
                "Formulario web": ("formulario enviado", "formularios enviados"), "Formulario del anuncio": ("formulario del anuncio", "formularios del anuncio"),
                "Cómo llegar": ("consulta de cómo llegar", "consultas de cómo llegar")}
        partes = [f'{v:g} {SING.get(CONTACT_ES.get(k, k), (k, k))[0 if v == 1 else 1]}' for k, v in (data.get("contactos_por_tipo") or {}).items()]
        if solicitudes:
            partes.append(f'{solicitudes} {"solicitud" if solicitudes == 1 else "solicitudes"} en la web')
        out.append((1, "Hay contactos: hay que responder rápido.",
                    'Desde el lanzamiento: ' + " y ".join(partes) + '. Responder en menos de una hora multiplica las opciones de venta.'))
    elif ac["clics"] >= 50:
        llamar = tipos_all.get("Clicks to call", 0)
        extra = f' (solo {llamar:g} clic en el botón de llamar, que no garantiza una llamada)' if llamar else ''
        out.append((1, "Muchos clics y aún ningún contacto.",
                    f'{num(ac["clics"])} clics desde el lanzamiento sin solicitudes ni mensajes registrados{extra}. Conviene revisar la página a la que llega '
                    'cada anuncio (más fotos, precio claro y botón de WhatsApp visible) y simplificar el formulario de pedido.'))

    # 2) Presupuesto vs posición
    if cu.get("perdida_por_presupuesto_pct") and cu["perdida_por_presupuesto_pct"] >= 40:
        out.append((2, "El presupuesto limita el alcance.",
                    f'El anuncio se perdió el {pct(cu["perdida_por_presupuesto_pct"])} de las búsquedas por falta de presupuesto. '
                    'Si los contactos acompañan, subir el presupuesto diario es la forma más directa de crecer.'))
    elif cu.get("perdida_por_ranking_pct") and cu["perdida_por_ranking_pct"] >= 50:
        txt = f'Se perdió el {pct(cu["perdida_por_ranking_pct"])} de las búsquedas por posición (otros anunciantes pujan más o tienen anuncios más relevantes). '
        txt += (f'El clic máximo está en {money(cpc_max)}. ' if cpc_max else '') + 'Si en unos días sigue así, proponemos subirlo un poco más o concentrar el presupuesto en las palabras que mejor funcionan.'
        out.append((3, "La posición es lo que más limita.", txt))

    # 3) Búsquedas irrelevantes con clics y aún no bloqueadas
    malas = {}
    for t in data["terminos_7_dias"]:
        term = t["termino"].lower()
        hit = next((w for w in IRRELEVANT if w in term), None)
        if hit and t["clics"] > 0 and not any(n in term for n in negs):
            malas[t["termino"]] = malas.get(t["termino"], 0) + t["clics"]
    if malas:
        lista = ", ".join(f'«{k}»' for k in list(malas)[:4])
        out.append((2, "Bloquear búsquedas que no encajan.",
                    f'Hubo clics en búsquedas que no corresponden al catálogo: {lista}. Proponemos añadirlas como palabras negativas.'))

    # 4) Reparto entre grupos
    ga = data.get("grupos_acumulado") or {}
    tot = sum(v["coste"] for v in ga.values()) or 0
    if tot:
        g, v = max(ga.items(), key=lambda x: x[1]["coste"])
        share = v["coste"] / tot * 100
        if share >= 65:
            out.append((4, f'{GROUPS_ES.get(g, g)}: casi toda la inversión.',
                        f'El {pct(share)} de la inversión y {num(v["clics"])} clics van a {GROUPS_ES.get(g, g).lower()}. '
                        'Conviene que ese anuncio lleve a la página más convincente (por ejemplo, la ficha del modelo más vendido).'))
        for g2, v2 in ga.items():
            if v2["impresiones"] < 30 and len(serie) >= 7:
                out.append((5, f'{GROUPS_ES.get(g2, g2)}: casi sin búsquedas.',
                            f'Solo {num(v2["impresiones"])} impresiones desde el lanzamiento. Proponemos ampliar sus palabras clave o mover ese presupuesto a los grupos que funcionan.'))

    # 5) Tendencia del CTR (últimos 3 días vs 3 anteriores)
    if len(serie) >= 6:
        def ctr(rs):
            i = sum(r["impresiones"] for r in rs); return (sum(r["clics"] for r in rs) / i * 100) if i else 0
        a, b = ctr(serie[-3:]), ctr(serie[-6:-3])
        if b and a < b * 0.7:
            out.append((4, "Baja el interés por el anuncio.",
                        f'El porcentaje de clics bajó de {pct(b, 1)} a {pct(a, 1)} en los últimos días. Proponemos renovar títulos y textos del anuncio.'))
        elif b and a > b * 1.3:
            out.append((6, "Sube el interés por el anuncio.", f'El porcentaje de clics pasó de {pct(b, 1)} a {pct(a, 1)}. Buena señal: mantener los textos actuales.'))

    # 6) Móvil
    dd = data.get("dispositivos_dia") or {}
    ti = sum(v["impresiones"] for v in dd.values())
    if ti and dd.get("MOBILE", {}).get("impresiones", 0) / ti >= 0.85:
        out.append((6, "Casi todo llega desde el móvil.",
                    f'El {pct(dd["MOBILE"]["impresiones"] / ti * 100)} de las impresiones fue en móvil: la web y el botón de WhatsApp en móvil son clave.'))

    # 7) Estrategia de puja
    if contactos >= 15:
        out.append((3, "Ya hay datos para pujar por contactos.",
                    f'Con {contactos:g} contactos registrados, proponemos pasar de «maximizar clics» a «maximizar conversiones», para que Google busque contactos y no solo visitas.'))

    # Relleno para tener siempre al menos 3
    if len(out) < 3:
        out.append((7, "Seguir acumulando datos.", f'Con {num(ac["clics"])} clics aún es pronto para cambios grandes; revisaremos las búsquedas cada pocos días.'))
    if len(out) < 3:
        out.append((8, "Revisar los contactos de WhatsApp.", "Si alguien escribe por WhatsApp mencionando el anuncio, avisadnos para cruzarlo con la campaña."))

    out.sort(key=lambda x: x[0])
    seen, final = set(), []
    for _, t, x in out:
        if t not in seen:
            seen.add(t); final.append({"titulo": t, "texto": x})
    return final[:5]


# ── Envío (ruta interna de la web, que usa Resend) ──────────────────
SITE = os.environ.get("SITE_URL", "https://www.universohosteleria.es")


def send(to, subject, html_body, text_body):
    key = env("SUPABASE_SERVICE_KEY")
    req = urllib.request.Request(f"{SITE}/api/internal/report-mail", method="POST",
                                 data=json.dumps({"to": to, "subject": subject, "html": html_body, "text": text_body}).encode(),
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    try:
        res = json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print("ERROR_ENVIO:", e.code, e.read().decode()[:500], file=sys.stderr)
        sys.exit(4)
    print("ENVIADO", res)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--day", default="yesterday", help="yesterday | today | AAAA-MM-DD")
    ap.add_argument("--out", help="ruta base: escribe <base>.json con las cifras")
    ap.add_argument("--render", help="ruta base ya generada: escribe <base>.html y <base>.txt con las sugerencias")
    ap.add_argument("--sugerencias", help='JSON con [{"titulo": "...", "texto": "..."}] (en español)')
    ap.add_argument("--nota", help="aviso opcional bajo la cabecera")
    ap.add_argument("--auto", action="store_true", help="cifras + sugerencias automáticas + HTML/TXT")
    ap.add_argument("--send", action="store_true", help="con --auto: envía el email")
    ap.add_argument("--to", default=os.environ.get("REPORT_TO", "lucas.carmo@flowcode.cc"), help="destinatarios separados por comas")
    ap.add_argument("--notify-failure", help="envía solo a lucas.carmo un aviso de fallo con este texto")
    a = ap.parse_args()

    if a.notify_failure:
        msg = html.escape(a.notify_failure)
        send(["lucas.carmo@flowcode.cc"], "Informe Google Ads UH no generado",
             f'<p style="font-family:Arial,sans-serif;font-size:14px">El informe diario no se ha podido generar.</p><pre style="white-space:pre-wrap">{msg}</pre>',
             "El informe diario no se ha podido generar.\n\n" + a.notify_failure)
        return

    if a.auto:
        today = dt.datetime.now(TZ).date()
        day = today - dt.timedelta(days=1) if a.day == "yesterday" else today if a.day == "today" else dt.date.fromisoformat(a.day)
        data = collect(day)
        sug = sugerencias_auto(data)
        html_body, text_body = render(data, sug, a.nota), render_text(data, sug)
        base = a.out or os.path.join(ROOT, ".ads-reports", day.isoformat())
        os.makedirs(os.path.dirname(base), exist_ok=True)
        json.dump(data, open(base + ".json", "w"), ensure_ascii=False, indent=1)
        json.dump(sug, open(base + ".sugerencias.json", "w"), ensure_ascii=False, indent=1)
        open(base + ".html", "w").write(html_body)
        open(base + ".txt", "w").write(text_body)
        print(f"OK {base}.html · sugerencias: " + " | ".join(x["titulo"] for x in sug))
        if a.send:
            d = dt.date.fromisoformat(data["dia"])
            send([x.strip() for x in a.to.split(",") if x.strip()],
                 f'Informe Google Ads · Universo Hostelería · {d.day} de {MESES[d.month - 1]}', html_body, text_body)
        return

    if a.render:
        data = json.load(open(a.render + ".json"))
        sug = json.load(open(a.sugerencias)) if a.sugerencias else None
        open(a.render + ".html", "w").write(render(data, sug, a.nota))
        open(a.render + ".txt", "w").write(render_text(data, sug))
        print(f"OK {a.render}.html {a.render}.txt")
        return

    today = dt.datetime.now(TZ).date()
    day = today - dt.timedelta(days=1) if a.day == "yesterday" else today if a.day == "today" else dt.date.fromisoformat(a.day)
    data = collect(day)
    if a.out:
        json.dump(data, open(a.out + ".json", "w"), ensure_ascii=False, indent=1)
        print(f"OK {a.out}.json")
    else:
        print(json.dumps(data, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
