"""
SONDA DE ENGANCHE · B1-B5 · CÉLULA B (copia de la de Shibukawa, scripts/t4/sonda-enganche; 15 oct 2026)

Uso:  node --import ./scripts/cargador-jsx.mjs scripts/b5/sonda-enganche/enganche_clave.mjs > clave.json
      python3 enganche.py [<dir-de-la-sonda>] <puerto-vite> <salida.json> <pieza> [<pieza> ...] --clave=clave.json [--anchos=320,375]
      pieza = T5A1 | T5A3 | T6A1 ... T6A5   (Aprender: la pieza k de la página del tema)
            | b5-t5-a1 | b5-t5-a2 | b5-t6-a1 ... b5-t6-a6   (Hacer; b5-t6-a7 se retiró en el lote 4 y b5-t6-a5 se fundió en a2 en el 6b)
Ver README.md.

Lo que cambia frente a la de D es el recorrido, no la medición ni la barra:
 · Aprender: cada capa del Panel (CuatroCapas) es una tarjeta. Capa 1 se lee; capa 2 se recorre paso a
   paso y, en la parada, se elige la opción buena; capa 3 abre cada caja y elige la buena; capa 4 prueba
   las frases en orden. B3 cuenta por capa: una capa «tiene acción» si una elección cambia su figura.
 · Hacer: la mesa del diario (a2 con sus preguntas, a3, t5-a2), la elección y las casillas (a4, a6) y
   las fichas a un nivel (t5-a1, t6-a1, lote 6a). Cada tarjeta, una vez bien y otra mal con la misma semilla.
 · La figura de B no es un <figure>: son la escena, la cuenta T, el tablero, la mesa, el asiento mínimo,
   la cuenta que se llena, los cajones del tiempo, el estante con cajones y el registro (FIG, abajo).
Mide sin barra de desplazamiento, como un teléfono, a cada ancho de --anchos (por defecto 320 y 375).

 B1 figura o interacción en los primeros 280 px de la tarjeta, y <= 40 palabras antes
 B2 Aprender: <= 60 palabras por vista
 B3 Aprender: >= la mitad de las capas con una acción que cambia la figura
    Hacer: la decisión mueve algo en una figura con significado, y distinto según acierte o falle
 B4 el acierto no se pinta en teal ni en ámbar
 B5 ninguna frase (>= 5 palabras) dos veces en la misma vista

Sale con 0 si todo PASA, 1 si algo FALLA y 2 si la sonda no pudo medir algo.
"""
import sys, os, json, re, time, base64
# <dir-de-la-sonda> es opcional: si el primer argumento no es un directorio, la sonda usa el suyo
_AQUI = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) < 2 or not os.path.isdir(sys.argv[1]): sys.argv.insert(1, _AQUI)
sys.path.insert(0, sys.argv[1])
from base import *
D = sys.argv[1]; PORT = sys.argv[2]; SALIDA = sys.argv[3]; PIEZAS = [a for a in sys.argv[4:] if not a.startswith("--")]
_cl = [a.split("=", 1)[1] for a in sys.argv[4:] if a.startswith("--clave=")]
CLAVE = json.load(open(_cl[0])) if _cl else {}
_an = [a.split("=", 1)[1] for a in sys.argv[4:] if a.startswith("--anchos=")]
ANCHOS = [int(x) for x in (_an[0] if _an else "320,375").split(",")]
U = f"http://localhost:{PORT}"
MIDE = open(D + "/enganche_mide.js").read()
# B no usa <figure>: estas son sus figuras con significado (la de D sigue valiendo si alguna vez aparece)
# Lote 6c: en las fichas a un nivel, la ficha es lo que se juega (vuela a su cajón), y así la mide la réplica
# de Mai («fichas unos 126»): cuenta como figura.
FIG = ("figure, [data-escena], [data-cuenta-t], [data-tablero], [data-mesa], [data-asiento-minimo], [data-cuenta-que-se-llena], "
       "[data-cajones-del-tiempo], [data-estante]:has([data-cajon]), [data-registro], [data-ficha]")

def b64(o): return base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip("=")
exp = int(time.time()) + 3600
jwt = b64({"alg": "HS256", "typ": "JWT"}) + "." + b64({"sub": "00000000-0000-0000-0000-000000000001", "exp": exp, "role": "authenticated", "aud": "authenticated"}) + ".f"
USER = {"id": "00000000-0000-0000-0000-000000000001", "aud": "authenticated", "role": "authenticated", "email": "p@s.test", "app_metadata": {}, "user_metadata": {}, "created_at": "2026-10-01T00:00:00Z"}
SES = {"access_token": jwt, "token_type": "bearer", "expires_in": 3600, "expires_at": exp, "refresh_token": "r", "user": USER}

# Aprender: la pieza k de la página del tema (el Panel que sigue al rótulo «PIEZA k DE N»)
APRENDER = {"T5A1": ("/#/activos-financieros", 1), "T5A3": ("/#/activos-financieros", 3),
            "T6A1": ("/#/cuentas-por-cobrar", 1), "T6A2": ("/#/cuentas-por-cobrar", 2), "T6A3": ("/#/cuentas-por-cobrar", 3),
            "T6A4": ("/#/cuentas-por-cobrar", 4), "T6A5": ("/#/cuentas-por-cobrar", 5)}
T5H, T6H = "/#/activos-financieros/hacer", "/#/cuentas-por-cobrar/hacer"
HACER = {"b5-t5-a1": (T5H, "¿Qué renta da este título?"), "b5-t5-a2": (T5H, "El cierre completo de Santa Pacha"),
         "b5-t6-a1": (T6H, "¿Clientes o otra cuenta por cobrar?"), "b5-t6-a2": (T6H, "La provisión de El Torito"),
         "b5-t6-a3": (T6H, "Cuando la deuda castigada vuelve"), "b5-t6-a4": (T6H, "¿Qué se debita?"),
         "b5-t6-a6": (T6H, "Provisión por edades")}

def abrir(b, ruta, sem=7, ancho=320):
    ctx, pg, errs = pagina(b, ancho, False)
    pg.set_default_timeout(30000)  # un selector que no aparece en 30 s es un tropiezo de la sonda (código 2)
    def sb(route):
        u = route.request.url
        if "/rest/v1/rpc/registrar_fp" in u: return route.fulfill(status=200, content_type="application/json", body=json.dumps({"fp_awarded": 0, "repeat_index": 0}))
        if "/auth/v1/user" in u: return route.fulfill(status=200, content_type="application/json", body=json.dumps(USER))
        if "/rest/v1/profiles" in u:
            perf = {"user_id": USER["id"], "nickname": "shibu", "full_name": "P"}
            return route.fulfill(status=200, content_type="application/json", body=json.dumps(perf if "vnd.pgrst.object" in route.request.headers.get("accept", "") else [perf]))
        return route.fulfill(status=200, content_type="application/json", body="[]")
    pg.route("http://fake.supabase.test/**", sb)
    pg.add_init_script("(()=>{let s=%d; Math.random=()=>{s=(s*1103515245+12345)%%2147483648; return s/2147483648;};})();" % sem)
    pg.add_init_script(f"try{{localStorage.setItem('aprendefae-auth', {json.dumps(json.dumps(SES))});}}catch(e){{}}")
    pg.goto(U + ruta); pg.wait_for_load_state("networkidle", timeout=60000); pg.wait_for_timeout(800)
    return ctx, pg, errs

def mide(pg, raiz, tarjeta=None):
    pg.wait_for_timeout(260)  # deja terminar fundidos de 120-200 ms
    return pg.evaluate(MIDE, {"raiz": raiz, "tarjeta": tarjeta, "figura": FIG})

class SinClave(Exception): pass

# ───────────────────────────── Aprender ─────────────────────────────
def aprender(b, sigla, ancho, clave):
    """Recorre las cuatro capas de la pieza. Cada capa es una tarjeta (su <section data-capa>)."""
    ruta, k = APRENDER[sigla]; K = clave["aprender"][sigla]
    ctx, pg, errs = abrir(b, ruta, ancho=ancho)
    pg.wait_for_selector("[data-capa]", timeout=20000); pg.wait_for_timeout(500)
    if not pg.evaluate("""(k) => { const p = [...document.querySelectorAll('p')].find((p) => new RegExp('^PIEZA ' + k + ' DE', 'i').test(p.textContent.trim()));
        const s = p && p.nextElementSibling; if (!s || !s.querySelector('[data-capa]')) return false; s.setAttribute('data-sonda-pieza', String(k)); return true; }""", k):
        raise SinClave(f"{sigla}: no encontré la pieza {k} en {ruta}")
    regs = []
    cap = lambda n: f'[data-sonda-pieza="{k}"] [data-capa="{n}"]'
    def med(n, pantalla, momento):
        m = mide(pg, cap(n)); m.update(pantalla=pantalla, momento=momento, grupo=f"capa {n}"); regs.append(m); return m
    def ver(sel):
        pg.locator(sel).first.scroll_into_view_if_needed(); pg.wait_for_timeout(150)
    hay = lambda sel: pg.locator(sel).count() > 0

    # Capa 1: se lee
    ver(cap(1)); med(1, "capa 1", "lectura")

    # Capa 2: paso a paso; en la parada, la opción buena de la clave
    ver(cap(2)); vistos = set()
    for i in range(40):
        paso = norm(pg.evaluate("(s) => { const e = document.querySelector(s); return e ? e.textContent : null; }", f"{cap(2)} [data-paso-de]")) or f"paso {i + 1}"
        if hay(f"{cap(2)} [data-parada]"):
            pant = f"capa 2 · {paso} (parada)"
            m0 = med(2, pant, "al llegar")
            if not K.get("parada"): raise SinClave(f"{sigla}: la capa 2 tiene parada y la clave no")
            pg.locator(f'{cap(2)} [data-parada] [data-opcion="{K["parada"]}"]').click(); pg.wait_for_timeout(350)
            m1 = med(2, pant, "acierto")
            m1["veredicto"] = "error" if hay(f"{cap(2)} [data-devolucion]") else "acierto"
            m0["figuraCambiaConLaAccion"] = m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]
        else:
            if paso in vistos: break
            med(2, f"capa 2 · {paso}", "lectura")
        vistos.add(paso)
        sig = pg.locator(f"{cap(2)} [data-siguiente]")
        if sig.count() == 0 or sig.first.is_disabled() or sig.first.get_attribute("aria-disabled") == "true": break
        sig.first.click(); pg.wait_for_timeout(450)

    # Capa 3: cada caja, en orden (algunas aparecen tras decidir la anterior); si decide, la opción buena
    ver(cap(3)); med(3, "capa 3", "al llegar"); hechas = []
    for _ in range(12):
        ids = pg.evaluate("(s) => [...document.querySelectorAll(s)].map((e) => e.dataset.hecho)", f"{cap(3)} [data-hecho]")
        pend = [x for x in ids if x not in hechas]
        if not pend: break
        cid = pend[0]; hechas.append(cid); C = f'{cap(3)} [data-hecho="{cid}"]'
        ab = pg.locator(f'{C} button[aria-expanded="false"]')
        if ab.count(): ab.first.click(); pg.wait_for_timeout(350)
        ver(C)
        if pg.get_attribute(C, "data-decidida") != "no":
            med(3, f"capa 3 · {cid}", "lectura"); continue
        if cid not in K["cajas"]: raise SinClave(f"{sigla}: caja sin clave: {cid}")
        m0 = med(3, f"capa 3 · {cid}", "al llegar")
        pg.locator(f'{C} [data-opcion="{K["cajas"][cid]}"]').click(); pg.wait_for_timeout(400)
        m1 = med(3, f"capa 3 · {cid}", "acierto")
        m1["veredicto"] = "error" if hay(f"{C} [data-devolucion]") else "acierto"
        m0["figuraCambiaConLaAccion"] = m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]

    # Capa 4: las frases en orden hasta la correcta («Otra vez» tras cada error)
    ver(cap(4)); m0 = med(4, "capa 4", "al llegar")
    ids = pg.evaluate("(s) => [...document.querySelectorAll(s)].map((e) => e.dataset.opcion)", f"{cap(4)} [data-una-frase] [data-opcion]")
    for oid in ids:
        pg.locator(f'{cap(4)} [data-una-frase] [data-opcion="{oid}"]').click(); pg.wait_for_timeout(350)
        dev = pg.get_attribute(f"{cap(4)} [data-devolucion]", "data-devolucion")
        if dev == "incorrecta":
            med(4, "capa 4", "error"); pg.locator(f"{cap(4)} [data-otra-vez]").click(); pg.wait_for_timeout(250); continue
        m1 = med(4, "capa 4", "acierto"); m1["veredicto"] = "acierto" if dev == "correcta" else dev
        m0["figuraCambiaConLaAccion"] = m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]
        break
    ctx.close()
    return regs, errs

# ───────────────────────────── Hacer ─────────────────────────────
norm = lambda s: re.sub(r"\s+", " ", s or "").strip()
FINAL = ("Ver mi resumen", "Ver resultado", "Ver el resultado")
MARCO = """() => { const e = document.querySelector('[data-hecho], [data-ficha], [data-parte]'); if (!e) return false;
  let s = e.closest('section'); while (s && s.hasAttribute('data-parte')) s = s.parentElement.closest('section');
  document.querySelectorAll('[data-sonda-marco]').forEach((x) => x.removeAttribute('data-sonda-marco'));
  if (!s) return false; s.setAttribute('data-sonda-marco', ''); return true; }"""
VEREDICTO = """() => { const m = document.querySelector('[data-sonda-marco]'); if (!m) return null;
  const p = m.querySelector('[data-panel]'); if (p) return p.dataset.panel;
  const r = [...m.querySelectorAll('[role="status"]')].map((e) => e.textContent.trim()).find((t) => /^(Correcto|Incorrecto):/.test(t));
  if (r) return r.startsWith('Correcto') ? 'acierto' : 'error';
  if (m.querySelector('[data-estado="incorrecta"]')) return 'error';
  if (m.querySelector('[data-estado-destino="error"]')) return 'error';   // lote 6c: a6, los cajones del eje son las opciones (estándar de Hacer)
  if (m.querySelector('[data-estado-destino="correcto"]')) return 'acierto';
  if (m.querySelector('[data-estado="correcta"]')) return 'acierto';
  return null; }"""

def hacer(b, sid, modo, clave, ancho):
    """Juega la partida entera con la clave: «bien» responde todo bien; «mal», todo mal con el mismo gesto.
    Mide cada tarjeta al llegar y tras responder. La misma semilla en los dos modos: las mismas tarjetas, en el mismo orden."""
    ruta, nombre = HACER[sid]; K = clave["hacer"][sid]; mec = K["mecanica"]
    ctx, pg, errs = abrir(b, ruta, sem=7, ancho=ancho)
    pg.locator("span:visible", has_text=nombre).first.click()
    pg.wait_for_selector("[data-asi-se-juega], [data-hecho], [data-ficha], [data-parte]", state="attached", timeout=10000); pg.wait_for_timeout(500)
    regs = []
    if modo == "bien" and pg.locator("[data-asi-se-juega]:visible").count():
        m = mide(pg, "[data-asi-se-juega]"); m.update(pantalla="así se juega", momento="así se juega", carta="así se juega"); regs.append(m)
    for _ in range(12):
        if pg.locator("[data-asi-se-juega]:visible").count() == 0: break
        bs = pg.locator("[data-asi-se-juega] button:visible", has_text="Siguiente")
        if bs.count() == 0: break
        bs.last.click(); pg.wait_for_timeout(450)
    pg.wait_for_selector("[data-hecho], [data-ficha], [data-parte]", state="visible", timeout=10000); pg.wait_for_timeout(300)
    R = "[data-sonda-marco]"
    def boton(textos):
        bs = [x for x in pg.locator(f"{R} button:visible").all() if x.inner_text().strip() in textos]
        if not bs: return None
        t = bs[-1].inner_text().strip(); bs[-1].click(); pg.wait_for_timeout(450); return t
    # lote 6c: el ejemplo resuelto de las mesas es su propio paso, con «Empezar»; se mide al llegar y se sigue
    if pg.locator("[data-ejemplo-resuelto]:visible").count():
        pg.evaluate(MARCO)
        if modo == "bien":
            m = mide(pg, R); m.update(pantalla="ejemplo resuelto", momento="al llegar", carta="ejemplo"); regs.append(m)
        pg.locator("[data-boton-empezar] button").first.click(); pg.wait_for_timeout(450)
    k = 0
    for _ in range(40):
        if not pg.evaluate(MARCO): break
        k += 1
        if mec == "mesa":
            carta = pg.get_attribute('section[data-estado-parte="activa"]', "data-parte")
        elif mec in ("clasifica", "cajones"):
            carta = pg.get_attribute(f"{R} [data-ficha]", "data-ficha")
        else:
            carta = pg.get_attribute(f"{R} [data-hecho]", "data-hecho")
        grupo = K["partes"] if mec == "mesa" else K["tarjetas"]
        if carta not in grupo: raise SinClave(f"{sid}: tarjeta sin clave: {carta!r}")
        resp = grupo[carta][modo]; pantalla = f"tarjeta {k} · {carta}"
        m0 = mide(pg, R); m0.update(pantalla=pantalla, momento="al llegar", carta=carta)
        if modo == "bien": regs.append(m0)
        if mec == "mesa":
            P = f'section[data-parte="{carta}"]'
            if grupo[carta].get("pregunta"):   # lote 6b: las preguntas de a2, cifra escrita
                pg.locator(f'{P} input[data-campo-cifra="{carta}"]').first.fill(str(resp)); pg.wait_for_timeout(60)
                resp = []
            for cuenta, lado, valor in resp:
                pg.locator(f'{P} [data-sacar="{cuenta}:{lado}"]').first.click(); pg.wait_for_timeout(120)
                pg.locator(f'{P} input[data-campo-cifra="{cuenta}"]').first.fill(str(valor)); pg.wait_for_timeout(60)
            pg.locator(f"{P} [data-confirmar-parte]").first.click(); pg.wait_for_timeout(450)
        elif mec == "clasifica":
            for intento in range(2):
                pg.locator(f'{R} [data-nivel1="{resp["n1"]}"]').click(); pg.wait_for_timeout(150)
                if resp["n2"]: pg.locator(f'{R} [data-nivel2="{resp["n2"]}"]').click(); pg.wait_for_timeout(100)
                pg.locator(f"{R} [data-boton-colocar] button").click(); pg.wait_for_timeout(450)
                if pg.locator(f"{R} [data-boton-avanzar]").count(): break   # sin segundo intento: ya hay veredicto
        elif mec == "cajones":
            # lote 6a: tocar un cajón coloca la ficha; tras un primer fallo, el siguiente de la clave
            for cl in resp:
                if pg.locator(f"{R} [data-boton-avanzar]").count(): break
                pg.locator(f'{R} [data-cajon="{cl}"]').click(); pg.wait_for_timeout(450)
        else:
            # las opciones van debajo del hecho, no dentro: se buscan en el Marco
            pg.locator(f'{R} button:has([data-opcion="{resp}"])').first.click(); pg.wait_for_timeout(450)
        pg.evaluate(MARCO)
        m1 = mide(pg, R); m1.update(pantalla=pantalla, momento="tras acertar" if modo == "bien" else "tras fallar", carta=carta)
        m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]
        # ¿el juego tomó la respuesta como se esperaba? Sin esto, una clave rota daría colores de otro estado.
        m1["veredicto"] = pg.evaluate(VEREDICTO)
        regs.append(m1)
        if mec in ("clasifica", "cajones"):
            av = pg.locator(f"{R} [data-boton-avanzar] button"); t = av.inner_text().strip() if av.count() else None
            if t: av.click(); pg.wait_for_timeout(450)
        else:
            t = boton(("Siguiente asiento", "Siguiente") + FINAL)
        if t is None: raise SinClave(f"{sid}: no encontré cómo seguir tras {pantalla}")
        if t in FINAL: break
    ctx.close()
    return regs, errs

# ───────────────────────────── Juicio ─────────────────────────────
def juzga(sigla, regs):
    tipo = "Aprender" if sigla.split("@")[0] in APRENDER else "Hacer"
    fallos = []
    if not [r for r in regs if r["momento"] != "así se juega"]:
        return [("SONDA", "pieza", "no se midió ninguna pantalla: un resultado vacío no es un PASA")]
    llegadas = [r for r in regs if r["momento"] in ("lectura", "al llegar")]  # «así se juega» solo cuenta para B5
    for r in llegadas:
        p0 = r["primeroY"]
        if p0 is None or p0 > 280: fallos.append(("B1", r["pantalla"], f"nada que ver ni tocar hasta {p0} px"))
        elif r["palabrasAntes"] > 40: fallos.append(("B1", r["pantalla"], f"{r['palabrasAntes']} palabras antes de la figura"))
    if tipo == "Aprender":
        for r in regs:
            if r["palabras"] > 60: fallos.append(("B2", f"{r['pantalla']} ({r['momento']})", f"{r['palabras']} palabras"))
        # B: se cuenta por capa (la capa 2 tiene muchos pasos, pero es una sola tarjeta)
        capas = sorted({r["grupo"] for r in regs})
        con = {r["grupo"] for r in regs if r.get("figuraCambiaConLaAccion")}
        if len(con) * 2 < len(capas): fallos.append(("B3", "pieza", f"{len(con)} de {len(capas)} capas con una acción que cambia la figura ({', '.join(sorted(con)) or 'ninguna'})"))
        for r in regs:
            if r["momento"] == "acierto" and r.get("veredicto") != "acierto": fallos.append(("SONDA", r["pantalla"], f"la clave no dio un acierto (veredicto {r.get('veredicto')})"))
    else:
        llegan = [r for r in regs if r["momento"] == "al llegar"]
        if not llegan: fallos.append(("SONDA", "pieza", "no se midió ninguna tarjeta"))
        mal = {r["carta"]: r for r in regs if r["momento"] == "tras fallar"}
        for r in regs:
            if r["momento"] != "tras acertar": continue
            if r.get("veredicto") != "acierto": fallos.append(("SONDA", r["pantalla"], f"la clave no dio un acierto (veredicto {r.get('veredicto')})"))
            otra = mal.get(r["carta"])
            if otra is None: fallos.append(("SONDA", r["pantalla"], "falta la misma tarjeta en la partida mal")); continue
            if otra.get("veredicto") != "error": fallos.append(("SONDA", r["pantalla"], f"la respuesta mala no dio error (veredicto {otra.get('veredicto')})"))
            r["figuraDependeDeLaDecision"] = bool(r.get("figTexto")) and r.get("figTexto") != otra.get("figTexto")
            if not r.get("figuraCambiaConLaAccion"):
                fallos.append(("B3", r["pantalla"], f"{r['mecanica']}: la decisión no mueve ninguna figura"))
            elif not r["figuraDependeDeLaDecision"]:
                r["soloRevela"] = True
                fallos.append(("B3", r["pantalla"], f"{r['mecanica']}: la figura cambia igual acierte o falle (revela, no responde)"))
    for r in regs:
        if r["momento"].startswith("tras"):
            for f in r.get("filas", []):
                if f["lado"] == "Haber" and "teal" in f["tonos"]: fallos.append(("B4", f"{r['pantalla']} ({r['momento']})", f"fila al haber «{f['txt'][:30]}» con borde teal tras el veredicto"))
        for mk in r["marcadores"]:
            if mk["tonos"]: fallos.append(("B4", f"{r['pantalla']} ({r['momento']})", f"acierto «{mk['txt'][:40]}» en {'+'.join(mk['tonos'])}"))
        for d in r["repetidos"]:
            fallos.append(("B5", f"{r['pantalla']} ({r['momento']})", f"«{d['frase'][:60]}» ×{d['veces']}"))
    # quitar duplicados exactos
    vis = []; [vis.append(f) for f in fallos if f not in vis]
    return vis

if __name__ == "__main__":
    res = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for s in PIEZAS:
            for w in ANCHOS:
                key = f"{s}@{w}"
                try:
                    if s in APRENDER:
                        regs, errs = aprender(b, s, w, CLAVE)
                    else:
                        regs, errs = hacer(b, s, "bien", CLAVE, w)
                        r2, e2 = hacer(b, s, "mal", CLAVE, w)
                        regs += [r for r in r2 if r["momento"] == "tras fallar"]; errs += e2
                except Exception as e:  # cualquier tropiezo de la sonda es «no medido» (código 2), nunca un FALLA ni un PASA
                    regs, errs = [], [f"SONDA: {type(e).__name__}: {str(e).splitlines()[0][:200]}"]
                for r in regs: r.pop("figHTML", None)
                res[key] = {"regs": regs, "errs": errs, "fallos": juzga(key, regs) + [("SONDA", "pieza", e) for e in errs if e.startswith("SONDA")]}
                sonda = [f for f in res[key]["fallos"] if f[0] == "SONDA"]
                sonda.sort(key=lambda f: f[1] == "pieza" and not f[2].startswith("SONDA"))  # primero el tropiezo de la sonda (p. ej. faltan las fuentes)
                print(key, "SIN MEDIR (la sonda tropezó: " + str(sonda[0][2])[:90] + ")" if sonda else ("FALLA" if res[key]["fallos"] else "PASA"), len(res[key]["fallos"]), flush=True)
        b.close()
    json.dump(res, open(SALIDA, "w"), ensure_ascii=False, indent=1)
    # 0: todas PASAN · 1: alguna FALLA la barra · 2: la sonda no pudo medir algo (eso no es un PASA ni un FALLA)
    if any(f[0] == "SONDA" for v in res.values() for f in v["fallos"]): sys.exit(2)
    sys.exit(1 if any(v["fallos"] for v in res.values()) else 0)
