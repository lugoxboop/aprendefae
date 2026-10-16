"""
SONDA DE ENGANCHE · B1-B5 (Shibukawa, 15 oct 2026)

Uso:  node enganche_clave.mjs [<raíz-del-build>] > clave.json
      python3 enganche.py [<dir-de-la-sonda>] <puerto-vite> <salida.json> <pieza> [<pieza> ...] --clave=clave.json
      pieza = A0 | A1 | A2 | A3 | A4 | A5 | H1 | ... | H8   (Hacer necesita la clave; Aprender no)
Ver README.md.

Mide a 320 px, tal como lo ve el estudiante (enganche_mide.js), cada pantalla de Aprender
(en las elecciones: al llegar y tras el acierto) y cada tarjeta de Hacer (todas, de todas las
etapas: al llegar, tras acertar y, en una segunda partida con la misma semilla, tras fallar). Después juzga contra la barra:

 B1 figura o interacción en los primeros 280 px de la tarjeta, y <= 40 palabras antes
 B2 Aprender: <= 60 palabras por pantalla
 B3 Aprender: >= la mitad de las pantallas con una acción que cambia la figura
    Hacer: la decisión mueve algo en una figura con significado (no radio)
 B4 el acierto no se pinta en teal ni en ámbar
 B5 ninguna frase (>= 5 palabras) dos veces en la misma pantalla

Sale con código 1 si alguna pieza FALLA (para usarla como guardia).

Aprender con figura operable (rediseño de enganche de A0 y A1, 15 oct 2026): la pantalla no es una
elección de radios, así que la sonda no adivina qué tocar. Lo lee de enganche_planes.json: por pieza y
pantalla, los gestos (tocar, arrastrar, esperar), el momento que se mide tras cada uno y el veredicto que
tiene que dar. Una pantalla cuya figura trae controles y no tiene plan es «no medida» (código 2). La
medición (enganche_mide.js) y el juicio (juzga) no cambian.
"""
import sys, os, json, re, time, base64
# <dir-de-la-sonda> es opcional: si el primer argumento no es un directorio, la sonda usa el suyo
_AQUI = os.path.dirname(os.path.abspath(__file__))
if len(sys.argv) < 2 or not os.path.isdir(sys.argv[1]): sys.argv.insert(1, _AQUI)
sys.path.insert(0, sys.argv[1])
from base import *
D = sys.argv[1]; PORT = sys.argv[2]; SALIDA = sys.argv[3]
PIEZAS = [a for a in sys.argv[4:] if not a.startswith("--clave=") and not a.startswith("--tema=")]
_cl = [a.split("=", 1)[1] for a in sys.argv[4:] if a.startswith("--clave=")]
CLAVE = json.load(open(_cl[0])) if _cl else {}
U = f"http://localhost:{PORT}"
MIDE = open(D + "/enganche_mide.js").read()
PLANES = json.load(open(D + "/enganche_planes.json")) if os.path.isfile(D + "/enganche_planes.json") else {}
FIG = "figure, [data-par], [data-tabla-h7], [data-lado-h7]"  # el par y la tabla de H7/H8 cuentan como figura con significado

def b64(o): return base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip("=")
exp = int(time.time()) + 3600
jwt = b64({"alg": "HS256", "typ": "JWT"}) + "." + b64({"sub": "00000000-0000-0000-0000-000000000001", "exp": exp, "role": "authenticated", "aud": "authenticated"}) + ".f"
USER = {"id": "00000000-0000-0000-0000-000000000001", "aud": "authenticated", "role": "authenticated", "email": "p@s.test", "app_metadata": {}, "user_metadata": {}, "created_at": "2026-10-01T00:00:00Z"}
SES = {"access_token": jwt, "token_type": "bearer", "expires_in": 3600, "expires_at": exp, "refresh_token": "r", "user": USER}

# ───────────── Lo que cada tema pone: nada de esto vive ya en la sonda ─────────────
# `--tema=<sigla>` elige la entrada de temas.json. Sin él, t4: la sonda nació ahí
# y las órdenes que ya existen no se enteran del cambio.
TEMA = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--tema=")), "t4")
_TEMAS = json.load(open(os.path.join(_AQUI, "temas.json"), encoding="utf-8"))
if TEMA not in _TEMAS or TEMA.startswith("_"):
    disponibles = ", ".join(k for k in _TEMAS if not k.startswith("_"))
    print(f"no conozco el tema «{TEMA}». Los que hay: {disponibles}. Se añade uno en temas.json.", file=sys.stderr)
    sys.exit(2)  # 2 es «no medí», el mismo código que cuando la sonda no adivina (README)
_T = _TEMAS[TEMA]
RUTA = _T["ruta"]; PREFIJO = _T["prefijo"]; APRENDER = _T["aprender"]; HACER = _T["hacer"]

def abrir(b, ruta, sem=7):
    ctx, pg, errs = pagina(b, 320, False)
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

# ───────────────────────────── Aprender ─────────────────────────────
class SinClave(Exception): pass

# ¿La figura de esta pantalla trae algo que tocar? (sin plan, la sonda no lo adivina: código 2)
CONTROLES_FIG = """(r) => [...document.querySelectorAll(r + ' figure button, ' + r + ' figure [role=slider], ' + r + ' figure input')]
  .filter((e) => { const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden'; }).length"""

def jugar_plan(pg, R, pid_p, plan, llegada, regs):
    """Juega los gestos del plan de una pantalla y mide tras cada uno. La acción cambia la figura si el DOM de la
    figura medido tras algún gesto difiere del de la llegada. Cada gesto con «veredicto» lo comprueba."""
    cambio = False
    for paso in plan:
        if "click" in paso:
            loc = pg.locator(f"{R} {paso['click']}")
            if loc.count() == 0: raise SinClave(f"{pid_p}: el plan toca {paso['click']!r} y no está")
            loc.first.click()
        if "arrastra" in paso:
            bx = pg.locator(f"{R} {paso['arrastra']}").first.bounding_box()
            x0 = bx["x"] + 2; y0 = bx["y"] + bx["height"] / 2
            pg.mouse.move(x0, y0); pg.mouse.down(); pg.mouse.move(x0 + bx["width"] * paso["hasta"], y0, steps=8); pg.mouse.up()
        pg.wait_for_timeout(paso.get("espera", 120))
        if "mide" in paso:
            m = mide(pg, R); m.update(pantalla=pid_p, momento=paso["mide"], eleccion=False)
            if "veredicto" in paso:
                v = pg.evaluate(f"(()=>{{const xs=document.querySelectorAll('{R} [data-mensaje], {R} [data-panel]'); const p=xs[xs.length-1]; return p? (p.dataset.mensaje||p.dataset.panel): null}})()")
                if v != paso["veredicto"]: raise SinClave(f"{pid_p} · {paso['mide']}: el plan esperaba «{paso['veredicto']}» y la pantalla dio «{v}»")
            if bool(llegada["figHTML"]) and m["figHTML"] != llegada["figHTML"]: cambio = True
            regs.append(m)
    for r in regs:
        if r["pantalla"] == pid_p: r["figuraCambiaConLaAccion"] = cambio

def aprender(b, sigla):
    pid = APRENDER[sigla]; R = f'[data-pieza="{pid}"]'
    ctx, pg, errs = abrir(b, RUTA)
    pg.wait_for_selector(R, timeout=20000); pg.wait_for_timeout(400)
    regs = []
    for _ in range(20):
        pid_p = pg.evaluate(f"document.querySelector('{R}').dataset.pantalla")
        est = pg.evaluate(f"(document.querySelector('{R} [data-eleccion]')||{{}}).dataset?.estado||null")
        plan = PLANES.get(pid, {}).get(pid_p)
        m = mide(pg, R); m.update(pantalla=pid_p, momento="al llegar" if (est or plan) else "lectura", eleccion=bool(est))
        regs.append(m)
        if plan is not None:
            jugar_plan(pg, R, pid_p, plan, m, regs)
        elif not est and pg.evaluate(CONTROLES_FIG, R):
            raise SinClave(f"{pid_p}: la figura trae controles y enganche_planes.json no dice cómo jugarla")
        if est == "colocando":
            fig0 = m["figHTML"]
            ids = pg.evaluate(f"[...document.querySelectorAll('{R} [data-opcion]')].map(e=>e.dataset.opcion)")
            hecho = None
            for oid in ids:  # por id: «Probar otra» rebaraja, así que el índice no sirve
                pg.locator(f'{R} [data-opcion="{oid}"]').click(); pg.wait_for_timeout(80)
                pg.locator(f'{R} [data-boton="confirmar"]').click(); pg.wait_for_timeout(200)
                e2 = pg.evaluate(f"document.querySelector('{R} [data-eleccion]').dataset.estado")
                if e2 == "error":
                    me = mide(pg, R); me.update(pantalla=pid_p, momento="error", eleccion=True); regs.append(me)
                    pg.locator(f'{R} [data-boton="probar-otra"]').click(); pg.wait_for_timeout(150); continue
                hecho = mide(pg, R); hecho.update(pantalla=pid_p, momento="acierto", eleccion=True); regs.append(hecho); break
            # ¿la acción cambió la figura?
            regs[-1]["figuraCambiaConLaAccion"] = bool(fig0) and hecho is not None and hecho["figHTML"] != fig0
            for r in regs:
                if r["pantalla"] == pid_p and r["momento"] == "al llegar": r["figuraCambiaConLaAccion"] = regs[-1]["figuraCambiaConLaAccion"]
        bt = pg.locator(f'{R} [data-boton="seguir"], {R} [data-boton="empezar"]')
        if bt.count() == 0: break
        bt.first.click(); pg.wait_for_timeout(200)
    ctx.close()
    return regs, errs

# ───────────────────────────── Hacer ─────────────────────────────
SIGUIENTE = ("Siguiente hecho", "Siguiente caso", "Siguiente operación", "Siguiente pregunta", "Siguiente ronda", "Siguiente paso",
             "Siguiente partida", "Siguiente asiento", "Ir a los saldos", "Ir a los asientos", "Ir al mayor")
norm = lambda s: re.sub(r"\s+", " ", s or "").strip()
exacto = lambda s: re.compile(r"^\s*" + r"\s+".join(re.escape(p) for p in norm(s).split(" ")) + r"\s*$")

def hacer(b, sigla, modo, clave):
    """Juega la partida entera con la clave: modo «bien» responde todo bien; «mal», todo mal con el mismo gesto.
    Mide cada tarjeta al llegar y tras responder. La misma semilla en los dos modos: las mismas tarjetas, en el mismo orden."""
    n = sigla.lower(); R = f"[data-{PREFIJO}-{n}]"; K = clave[sigla]
    ctx, pg, errs = abrir(b, RUTA + "/hacer", sem=7)
    pg.locator("span:visible", has_text=HACER[sigla]).first.click()
    pg.wait_for_selector(f"[data-{PREFIJO}-{n}-demo], {R}", state="attached", timeout=10000); pg.wait_for_timeout(500)
    regs = []
    if modo == "bien" and pg.locator(f"[data-{PREFIJO}-{n}-demo]").count():
        m = mide(pg, f"[data-{PREFIJO}-{n}-demo]"); m.update(pantalla="así se juega", momento="así se juega", carta="así se juega"); regs.append(m)
    for _ in range(20):
        if pg.locator(f"{R}:visible").count() == 1 and pg.locator(f"[data-{PREFIJO}-{n}-demo]:visible").count() == 0: break
        bs = [x for x in pg.locator("button:visible").all() if x.inner_text().strip() == "Siguiente"]
        if not bs: break
        bs[-1].click(); pg.wait_for_timeout(450)
    pg.wait_for_selector(R, state="visible", timeout=10000); pg.wait_for_timeout(300)
    texto = lambda sel: norm(pg.evaluate("(s)=>{const e=document.querySelector(s); return e? e.textContent: null}", f"{R} {sel}"))
    def boton(rx):
        bs = [x for x in pg.locator("button:visible").all() if rx(x.inner_text().strip())]
        if not bs: return None
        t = bs[-1].inner_text().strip(); bs[-1].click(); pg.wait_for_timeout(320); return t
    k = 0; etapa_prev = None
    for _ in range(60):
        ds = pg.evaluate(f"(()=>{{const r=document.querySelector('{R}'); return r? {{etapa:r.dataset.etapa||r.dataset.fase||null, serie:r.dataset.serie||null}}: null}})()")
        if ds is None: break
        etapa = (f"etapa {ds['etapa']}" if sigla == "H8" else f"fase {ds['etapa']}") if ds["etapa"] else "tarjeta"
        if etapa != etapa_prev: k = 0; etapa_prev = etapa
        k += 1
        campos = pg.locator(f"{R} [data-campo] input:visible").count()
        constr = pg.locator(f"{R} [data-constructor]:visible").count()
        if campos:
            carta = f"saldos {ds['serie']}"; resp = K["saldos"][ds["serie"]][modo]
        elif constr:
            sel = K.get("notaTarjeta") if sigla == "H8" else K["tarjeta"]
            carta = texto(sel); grupo = K["notas"] if sigla == "H8" else K["items"]
            if carta not in grupo: raise SinClave(f"{sigla}: tarjeta sin clave: {carta!r}")
            resp = grupo[carta][modo]
        else:
            carta = texto(K["tarjeta"])
            if sigla == "H4": carta = f"{carta}::{pg.evaluate(f'document.querySelector(`{R} [data-tarjeta-pregunta]`).dataset.tarjetaPregunta')}"
            if K.get("porEtapa"): carta = f"{ds['etapa']}::{carta}"  # H8: la misma partida en la etapa 1 y en la 2
            if carta not in K["items"]: raise SinClave(f"{sigla}: tarjeta sin clave: {carta!r}")
            resp = K["items"][carta][modo]
        pantalla = f"{etapa} · {k}"
        m0 = mide(pg, R); m0.update(pantalla=pantalla, momento="al llegar", carta=carta)
        if modo == "bien": regs.append(m0)
        if "opcion" in resp:
            pg.locator(f'{R} [data-opcion="{resp["opcion"]}"] button').click(); pg.wait_for_timeout(300)
        elif "destino" in resp:
            # el cajón como tablero (H1 rediseñado): un toque en el destino; en el error la plata llega
            # a su sitio a los 0,7 s, así que se espera a que la figura quede quieta antes de medir
            pg.locator(f'{R} [data-destino="{resp["destino"]}"]').click(); pg.wait_for_timeout(900)
        elif "toques" in resp:
            # los Hacer rediseñados (tablero, regla, libretas, bandejas): los toques del gesto mínimo, en orden,
            # y «Comprobar» si va; en el error lo que iba se escribe a los 0,7 s: se espera a que la figura quede quieta
            for sel in resp["toques"]:
                loc = pg.locator(f"{R} {sel}")
                if loc.count() == 0: raise SinClave(f"{sigla}: el toque {sel!r} no está en {pantalla}")
                loc.first.click(); pg.wait_for_timeout(80)
            if resp.get("comprobar") and not boton(lambda t: t == "Comprobar"): raise SinClave(f"{sigla}: sin «Comprobar» en {pantalla}")
            pg.wait_for_timeout(900)
        elif "asiento" in resp:
            for i, linea in enumerate(resp["asiento"]):
                cuenta, lado = linea[0], linea[1]
                pg.locator(f"{R} [data-constructor] button").filter(has_text=exacto(cuenta)).last.click(); pg.wait_for_timeout(70)
                fila = pg.locator(f'{R} [data-fila-asiento="{i}"]')
                fila.locator("button").filter(has_text=exacto(lado)).click(); pg.wait_for_timeout(50)
                if len(linea) > 2: fila.locator("input").fill(str(linea[2]))
            pg.wait_for_timeout(100)
            if not boton(lambda t: t in ("Comprobar", "Confirmar el asiento")): raise SinClave(f"{sigla}: sin botón para comprobar el asiento en {pantalla}")
        else:
            for nombre, v in resp["campos"].items(): pg.locator(f'{R} [data-campo="{nombre}"] input').fill(str(v))
            if not boton(lambda t: t.startswith("Comprobar")): raise SinClave(f"{sigla}: sin botón para comprobar los saldos")
        m1 = mide(pg, R); m1.update(pantalla=pantalla, momento="tras acertar" if modo == "bien" else "tras fallar", carta=carta)
        m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]
        # ¿el juego tomó la respuesta como se esperaba? Sin esto, una clave rota daría colores de otro estado.
        m1["veredicto"] = pg.evaluate(f"(()=>{{const p=document.querySelector('{R} [data-panel], {R} [data-mensaje]'); return p? (p.dataset.panel||p.dataset.mensaje): null}})()")
        regs.append(m1)
        t = boton(lambda t: t in SIGUIENTE or t == "Ver mi resumen")
        if t is None: raise SinClave(f"{sigla}: no encontré cómo seguir tras {pantalla}")
        if t == "Ver mi resumen": break
    ctx.close()
    return regs, errs

# ───────────────────────────── Juicio ─────────────────────────────
def juzga(sigla, regs):
    tipo = "Aprender" if sigla.startswith("A") else "Hacer"
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
        pantallas = sorted({r["pantalla"] for r in regs})
        con = {r["pantalla"] for r in regs if r.get("figuraCambiaConLaAccion")}
        if len(con) * 2 < len(pantallas): fallos.append(("B3", "pieza", f"{len(con)} de {len(pantallas)} pantallas con acción que cambia la figura"))
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
            if s in APRENDER:
                try:
                    regs, errs = aprender(b, s)
                except Exception as e:
                    regs, errs = [], [f"SONDA: {type(e).__name__}: {str(e).splitlines()[0][:200]}"]
            else:
                try:
                    regs, errs = hacer(b, s, "bien", CLAVE)
                    r2, e2 = hacer(b, s, "mal", CLAVE)
                    regs += [r for r in r2 if r["momento"] == "tras fallar"]; errs += e2
                except Exception as e:  # cualquier tropiezo de la sonda es «no medido» (código 2), nunca un FALLA ni un PASA
                    regs, errs = [], [f"SONDA: {type(e).__name__}: {str(e).splitlines()[0][:200]}"]
            for r in regs: r.pop("figHTML", None)
            res[s] = {"regs": regs, "errs": errs, "fallos": juzga(s, regs) + [("SONDA", "pieza", e) for e in errs if e.startswith("SONDA")]}
            sonda = [f for f in res[s]["fallos"] if f[0] == "SONDA"]
            sonda.sort(key=lambda f: f[1] == "pieza" and not f[2].startswith("SONDA"))  # primero el tropiezo de la sonda (p. ej. faltan las fuentes)
            print(s, "SIN MEDIR (la sonda tropezó: " + str(sonda[0][2])[:90] + ")" if sonda else ("FALLA" if res[s]["fallos"] else "PASA"), len(res[s]["fallos"]), flush=True)
        b.close()
    json.dump(res, open(SALIDA, "w"), ensure_ascii=False, indent=1)
    # 0: todas PASAN · 1: alguna FALLA la barra · 2: la sonda no pudo medir algo (eso no es un PASA ni un FALLA)
    if any(f[0] == "SONDA" for v in res.values() for f in v["fallos"]): sys.exit(2)
    sys.exit(1 if any(v["fallos"] for v in res.values()) else 0)
