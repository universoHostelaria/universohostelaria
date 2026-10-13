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
  python3 scripts/ads/daily_report.py                 # día = ayer (zona de la cuenta)
  python3 scripts/ads/daily_report.py --day today     # hoy, datos parciales
  python3 scripts/ads/daily_report.py --out /tmp/informe   # escribe informe.json e informe.html
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
GROUPS_ES = {"Sillas hostelería": "Sillas", "Mesas hostelería": "Mesas", "Sillones hostelería": "Sillones"}
DEVICES_ES = {"MOBILE": "Móvil", "DESKTOP": "Ordenador", "TABLET": "Tablet", "CONNECTED_TV": "TV", "OTHER": "Otros"}
STATUS_ES = {"ELIGIBLE": "Activa", "LEARNING": "Activa · en aprendizaje", "PAUSED": "Pausada",
             "LIMITED": "Activa · limitada", "NOT_ELIGIBLE": "No apta", "PENDING": "Pendiente"}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def money(v):
    return "—" if v is None else f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def num(v):
    return f"{int(v):,}".replace(",", ".")


def fecha_es(iso):
    d = dt.date.fromisoformat(iso)
    return f"{d.day} de {MESES[d.month - 1]} de {d.year}"


def kpi(label, value, sub=""):
    return (f'<td style="padding:14px 12px;background:#F5F5F3;border-radius:10px;width:25%;vertical-align:top">'
            f'<div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#888">{label}</div>'
            f'<div style="font-size:24px;font-weight:700;color:#0D0D0D;margin-top:4px">{value}</div>'
            f'<div style="font-size:11.5px;color:#888;margin-top:2px">{sub}</div></td>')


def table(headers, rows, align=None):
    align = align or ["left"] + ["right"] * (len(headers) - 1)
    th = "".join(f'<th style="text-align:{a};font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#999;padding:8px 10px;border-bottom:2px solid #EEE">{h}</th>' for h, a in zip(headers, align))
    tr = "".join("<tr>" + "".join(f'<td style="text-align:{a};font-size:13px;color:#333;padding:8px 10px;border-bottom:1px solid #F0F0F0">{c}</td>' for c, a in zip(row, align)) + "</tr>" for row in rows)
    return f'<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 4px">{th and "<tr>" + th + "</tr>"}{tr}</table>'


def section(title, inner):
    return (f'<div style="margin:26px 0 0"><div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;'
            f'color:#2B6FD4;margin-bottom:8px">{title}</div>{inner}</div>')


def render(data):
    c, dm, ac, cuota = data["campana"], data["dia_metricas"], data["acumulado"], data["cuota_impresiones"]
    estado = STATUS_ES.get(c["estado_principal"], c["estado_principal"] or "—")
    pedidos = len(data["pedidos_web_dia"])

    kpis = ("<table width='100%' cellpadding='0' cellspacing='6' style='border-collapse:separate'><tr>"
            + kpi("Impresiones", num(dm["impresiones"]), "veces que se vio el anuncio")
            + kpi("Clics", num(dm["clics"]), f'CTR {dm["ctr"]:.1f} %'.replace(".", ","))
            + kpi("Inversión", money(dm["coste"]), f'de {money(c["presupuesto_diario"])} al día')
            + kpi("Solicitudes web", str(pedidos), f'conversiones Google: {dm["conversiones"]:g}'.replace(".", ","))
            + "</tr></table>")

    grupos = [[GROUPS_ES.get(g, g), num(v["impresiones"]), num(v["clics"]), money(v["coste"]),
               num(data["grupos_acumulado"].get(g, {}).get("clics", 0))]
              for g, v in sorted(data["grupos_dia"].items(), key=lambda x: -x[1]["impresiones"])]
    terminos = [[html.escape(t["termino"]), GROUPS_ES.get(t["grupo"], t["grupo"]), num(t["impresiones"]), num(t["clics"]), money(t["coste"])]
                for t in data["terminos_7_dias"][:12]]
    disp = [[DEVICES_ES.get(k, k), num(v["impresiones"]), num(v["clics"])] for k, v in
            sorted(data["dispositivos_dia"].items(), key=lambda x: -x[1]["impresiones"]) if v["impresiones"]]

    cuota_txt = ""
    if cuota["obtenida_pct"] is not None and dm["impresiones"]:
        cuota_txt = (f'<p style="font-size:13px;color:#555;margin:10px 0 0">El anuncio apareció en el <b>{cuota["obtenida_pct"]:.0f} %</b> de las búsquedas posibles. '
                     f'Se perdió un <b>{cuota["perdida_por_presupuesto_pct"]:.0f} %</b> por presupuesto y un <b>{cuota["perdida_por_ranking_pct"]:.0f} %</b> por posición.</p>')

    body = (
        '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff">'
        '<div style="background:#0D0D0D;padding:22px 26px">'
        '<div style="font-size:19px;font-weight:700;letter-spacing:.03em;color:#fff">UNIVERSO HOSTELERÍA</div>'
        f'<div style="font-size:12.5px;color:rgba(255,255,255,.6);margin-top:4px">Informe diario de Google Ads · {fecha_es(data["dia"])}</div></div>'
        '<div style="padding:4px 26px 26px">'
        + section("Resumen del día", kpis + cuota_txt
                  + f'<p style="font-size:13px;color:#555;margin:10px 0 0">Estado de la campaña: <b>{estado}</b>.</p>')
        + section("Acumulado desde el lanzamiento",
                  f'<p style="font-size:13.5px;color:#333;margin:0">Desde el {fecha_es(data["desde_lanzamiento"])}: '
                  f'<b>{num(ac["impresiones"])}</b> impresiones, <b>{num(ac["clics"])}</b> clics, <b>{money(ac["coste"])}</b> invertidos, '
                  f'<b>{data["pedidos_web_acumulado"]}</b> solicitudes recibidas en la web. Coste medio por clic: <b>{money(ac["cpc_medio"])}</b>.</p>')
        + section("Por producto (hoy)", table(["Grupo", "Impresiones", "Clics", "Inversión", "Clics acumulados"], grupos) if grupos else '<p style="font-size:13px;color:#888">Sin actividad.</p>')
        + section("Dispositivos (hoy)", table(["Dispositivo", "Impresiones", "Clics"], disp) if disp else '<p style="font-size:13px;color:#888">Sin actividad.</p>')
        + section("Qué buscó la gente (últimos 7 días)",
                  table(["Búsqueda", "Grupo", "Impr.", "Clics", "Coste"], terminos) if terminos else
                  '<p style="font-size:13px;color:#888">Google aún no muestra términos (tarda 1–2 días o el volumen es bajo).</p>')
        + section("Sugerencias de mejora", "<!--SUGERENCIAS-->")
        + '<p style="font-size:11.5px;color:#999;margin:28px 0 0;border-top:1px solid #EEE;padding-top:12px">'
          'Importes en reales brasileños (moneda de la cuenta de Google Ads). Las «solicitudes web» son las peticiones de presupuesto '
          'recibidas en universohosteleria.es (sin pruebas internas). Informe generado automáticamente por FlowCode.</p>'
        '</div></div>'
    )
    return body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--day", default="yesterday", help="yesterday | today | AAAA-MM-DD")
    ap.add_argument("--out", help="ruta base de salida (sin extensión)")
    a = ap.parse_args()
    today = dt.datetime.now(TZ).date()
    day = today - dt.timedelta(days=1) if a.day == "yesterday" else today if a.day == "today" else dt.date.fromisoformat(a.day)
    data = collect(day)
    out_html = render(data)
    if a.out:
        json.dump(data, open(a.out + ".json", "w"), ensure_ascii=False, indent=1)
        open(a.out + ".html", "w").write(out_html)
        print(f"OK {a.out}.json {a.out}.html")
    else:
        print(json.dumps(data, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
