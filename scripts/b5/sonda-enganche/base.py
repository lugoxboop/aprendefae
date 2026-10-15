import json, sys
from playwright.sync_api import sync_playwright
import os
# Sora e Inter en woff2 (paquetes @fontsource 5.3.0), servidas en local para medir con la fuente de producción.
# Por defecto en .sonda-fuentes/ junto a este archivo (lo llena fuentes.sh; no se sube al repo).
# SONDA_FUENTES=/ruta las toma de otro directorio con la misma forma.
F = os.environ.get("SONDA_FUENTES", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".sonda-fuentes"))
def _hay_fuentes():
    return all(os.path.isfile(f"{F}/fontsource-{fam}-5.3.0/package/files/{fam}-latin-400-normal.woff2") for fam in ("sora", "inter"))
def ruta(route):
    u = route.request.url
    if "/__f/" in u:
        fam, w = u.split("/__f/")[1].split("/"); w = w.split(".")[0]
        base = F+("/fontsource-sora-5.3.0/package/files/sora-latin-" if fam=="Sora" else "/fontsource-inter-5.3.0/package/files/inter-latin-")
        return route.fulfill(status=200, content_type="font/woff2", body=open(base+w+"-normal.woff2","rb").read())
    if "fonts.googleapis.com" in u:
        css=""
        for fam, ws in [("Sora",[300,400,600,700,800]),("Inter",[400,500,600,700])]:
            for w in ws: css += f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(/__f/{fam}/{w}.woff2) format('woff2');}}\n"
        return route.fulfill(status=200, content_type="text/css", body=css)
    if "localhost" in u: return route.continue_()
    return route.abort()
def pagina(b, w, reduce=False):
    # sin las fuentes de producción las Y no valen: es «no medido» (código 2), no un PASA ni un FALLA
    if not _hay_fuentes(): raise RuntimeError(f"faltan las fuentes en {F}: corre scripts/b5/sonda-enganche/fuentes.sh")
    ctx = b.new_context(viewport={"width": w, "height": 800}, device_scale_factor=2, reduced_motion="reduce" if reduce else "no-preference")
    pg = ctx.new_page(); pg.route("**/*", ruta)
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append("console."+m.type+": "+m.text) if m.type in ("error",) else None)
    return ctx, pg, errs
