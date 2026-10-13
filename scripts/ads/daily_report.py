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
def env(name):
    if os.environ.get(name):
        return os.environ[name]
    for line in open(os.path.join(ROOT, ".env.local")):
        if line.startswith(name + "="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def access_token():
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
def orders(since_utc, until_utc):
    url, key = env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_KEY")
    q = urllib.parse.urlencode([
        ("select", "created_at,items,total_estimado,contacto_email"),
        ("created_at", f"gte.{since_utc}"), ("created_at", f"lt.{until_utc}"),
        ("order", "created_at.asc"),
    ])
    req = urllib.request.Request(f"{url}/rest/v1/orders?{q}", headers={"apikey": key, "Authorization": f"Bearer {key}"})
    rows = json.load(urllib.request.urlopen(req))
    # Fuera pruebas internas; sin datos personales en el informe
    rows = [r for r in rows if not str(r.get("contacto_email", "")).lower().endswith("@flowcode.cc")]
    return [{"fecha": r["created_at"][:16].replace("T", " "), "productos": [f'{i.get("name")} × {i.get("qty")}' for i in r.get("items") or []],
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
        "pedidos_web_acumulado": len(orders(s_acc, e)),
    }


# ── HTML del email ───────────────────────────────────────────────────
# Diseño pensado para clientes de correo (tablas + estilos en línea). Al final todo
# carácter no ASCII se convierte en entidad HTML (&#243;…) para que los acentos se
# vean bien aunque el correo no declare el juego de caracteres.
GROUPS_ES = {"Sillas hostelería": "Sillas", "Mesas hostelería": "Mesas", "Sillones hostelería": "Sillones"}
DEVICES_ES = {"MOBILE": "Móvil", "DESKTOP": "Ordenador", "TABLET": "Tablet", "CONNECTED_TV": "TV", "OTHER": "Otros"}
STATUS_ES = {"ELIGIBLE": "Activa", "LEARNING": "Activa, en aprendizaje", "PAUSED": "Pausada",
             "LIMITED": "Activa, limitada", "NOT_ELIGIBLE": "No apta", "PENDING": "Pendiente"}
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
    return (f'<tr><td style="padding:30px 32px 10px;font-family:{FONT};font-size:12px;font-weight:700;'
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


def data_table(headers, rows, first_wide=True):
    th = "".join(
        f'<td style="padding:0 0 8px;font-family:{FONT};font-size:11px;font-weight:600;color:{MUTED};'
        f'text-align:{"left" if i == 0 else "right"};border-bottom:1px solid {LINE}">{h}</td>' for i, h in enumerate(headers))
    trs = ""
    for row in rows:
        trs += "<tr>" + "".join(
            f'<td style="padding:10px 0;font-family:{FONT};font-size:14px;color:{INK};'
            f'text-align:{"left" if i == 0 else "right"};border-bottom:1px solid {LINE}">{c}</td>' for i, c in enumerate(row)) + "</tr>"
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{th}</tr>{trs}</table>'


def wrap(inner):
    return f'<tr><td style="padding:0 32px">{inner}</td></tr>'


def headline(data):
    dm, ped = data["dia_metricas"], len(data["pedidos_web_dia"])
    if not dm["impresiones"]:
        return "Ayer el anuncio no se mostró."
    partes = [f'{num(dm["clics"])} {"clic" if dm["clics"] == 1 else "clics"} por {money(dm["coste"])}']
    partes.append("sin solicitudes en la web todavía" if not ped else f'{ped} {"solicitud" if ped == 1 else "solicitudes"} en la web')
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
    rows.append(f'<tr><td style="padding:0 26px">'
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

    # Por producto
    grupos = [[GROUPS_ES.get(g, g), num(v["impresiones"]), num(v["clics"]), money(v["coste"])]
              for g, v in sorted(data["grupos_dia"].items(), key=lambda x: -x[1]["impresiones"])]
    if grupos:
        rows.append(title("Por producto"))
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
           '<title>Informe Google Ads</title></head>'
           f'<body style="margin:0;padding:0;background:#EFEFEC">'
           f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEFEC"><tr><td align="center" style="padding:24px 12px">'
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--day", default="yesterday", help="yesterday | today | AAAA-MM-DD")
    ap.add_argument("--out", help="ruta base: escribe <base>.json con las cifras")
    ap.add_argument("--render", help="ruta base ya generada: escribe <base>.html y <base>.txt con las sugerencias")
    ap.add_argument("--sugerencias", help='JSON con [{"titulo": "...", "texto": "..."}] (en español)')
    ap.add_argument("--nota", help="aviso opcional bajo la cabecera")
    a = ap.parse_args()

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
