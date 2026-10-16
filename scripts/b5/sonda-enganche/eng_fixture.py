"""AUTOCOMPROBACIÓN de la sonda de enganche. Uso: python3 eng_fixture.py [<dir-de-la-sonda>]  (por defecto, la carpeta de este archivo)
Arma tarjetas sintéticas en una página en blanco (sin la app) a 320 px, las mide con enganche_mide.js
y las juzga con la misma función `juzga` de enganche.py.
Cada caso declara qué reglas TIENEN que salir. El caso que cumple debe dar PASA; cada rotura,
FALLA exactamente en su regla y en ninguna otra. Sale con 0 si todos los casos dan lo esperado y con 1 si no."""
import sys, os
D0 = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
src = open(D0 + "/enganche.py").read().split('if __name__ == "__main__":')[0]
sys.argv = [sys.argv[0], D0, "0", "/dev/null"]; exec(src)

def tarjeta_aprender(pre=12, pad=0, extra=0, teal=False, dup=False, cambia=True):
    d = "<p>La caja menor se repone con un cheque.</p>" * (2 if dup else 1)
    ok = "#2A9D8F" if teal else "#B8C4D4"
    js = ("document.getElementById('saldo').textContent='Saldo 50';" if cambia else "")
    return f"""<section style="padding:14px"><div data-pieza="x" data-pantalla="p"><p>{' '.join(['palabra'] * pre)}</p>
<div style="height:{pad}px"></div><figure data-figura="t"><svg width="200" height="60"></svg><span id="saldo">Saldo 100</span></figure>{d}<p>{' '.join(['texto'] * extra)}</p>
<div data-eleccion="p" data-estado="colocando"><button data-opcion="a" onclick="{js} this.insertAdjacentHTML('afterend','<div data-mensaje=acierto style=&quot;border:1px solid {ok}&quot;>Correcto.</div>')">Opción</button></div></div></section>"""

def tarjeta_hacer(respuesta, figura="responde", fila_teal=False):
    # una tarjeta de Hacer con un saldo en una figura y dos destinos; «respuesta» es lo que toca el estudiante
    nuevo = {"responde": {"a": "Saldo 50", "b": "Saldo 150"}, "revela": {"a": "Saldo 50", "b": "Saldo 50"}, "nada": {"a": "Saldo 100", "b": "Saldo 100"}}[figura]
    fila = f'<div data-fila-asiento="0" style="border:1px solid {"#2A9D8F" if fila_teal else "#B8C4D4"}"><span>Bancos</span><button style="color:#E9C46A;border:1px solid #E9C46A">Haber</button></div>'
    return f"""<section style="padding:14px"><div data-t4-hx><p>Toca el destino.</p>
<figure data-figura="t"><span id="saldo">Saldo 100</span></figure>
<span data-opcion="a"><button onclick="document.getElementById('saldo').textContent='{nuevo['a']}'; document.getElementById('r').innerHTML='<div data-panel=acierto style=&quot;border:1px solid #B8C4D4&quot;>Correcto.</div>' + document.getElementById('fila').innerHTML">Destino A</button></span>
<span data-opcion="b"><button onclick="document.getElementById('saldo').textContent='{nuevo['b']}'; document.getElementById('r').innerHTML='<div data-panel=error style=&quot;border:1px solid #E76F51&quot;>Incorrecto.</div>'">Destino B</button></span>
<div id="r"></div></div><template id="fila">{fila if fila_teal else ''}</template></section>"""

def mide_aprender(pg, html):
    pg.set_content(html)
    m0 = pg.evaluate(MIDE, {"raiz": '[data-pieza="x"]', "figura": FIG}); m0.update(pantalla="p", momento="al llegar", carta="p", grupo="capa 2")
    pg.click("[data-opcion]"); pg.wait_for_timeout(30)
    m1 = pg.evaluate(MIDE, {"raiz": '[data-pieza="x"]', "figura": FIG}); m1.update(pantalla="p", momento="acierto", carta="p", grupo="capa 2", veredicto="acierto")
    m0["figuraCambiaConLaAccion"] = m1["figuraCambiaConLaAccion"] = bool(m0["figHTML"]) and m0["figHTML"] != m1["figHTML"]
    return juzga("T6A1", [m0, m1])  # B: una sigla de Aprender de la Célula B; B3 se cuenta por capa

def mide_hacer(pg, **kw):
    regs = []
    for modo, op in (("bien", "a"), ("mal", "b")):
        pg.set_content(tarjeta_hacer(op, **kw))
        m0 = pg.evaluate(MIDE, {"raiz": "[data-t4-hx]", "figura": FIG}); m0.update(pantalla="tarjeta · 1", momento="al llegar", carta="c1")
        pg.click(f'[data-opcion="{op}"] button'); pg.wait_for_timeout(30)
        m1 = pg.evaluate(MIDE, {"raiz": "[data-t4-hx]", "figura": FIG})
        m1.update(pantalla="tarjeta · 1", momento="tras acertar" if modo == "bien" else "tras fallar", carta="c1", veredicto="acierto" if modo == "bien" else "error")
        m1["figuraCambiaConLaAccion"] = m0["figHTML"] != m1["figHTML"]
        if modo == "bien": regs.append(m0)
        regs.append(m1)
    return juzga("H9", regs)

CASOS = [
    ("Aprender · cumple", lambda pg: mide_aprender(pg, tarjeta_aprender()), set()),
    ("Aprender · figura a 400 px", lambda pg: mide_aprender(pg, tarjeta_aprender(pad=400)), {"B1"}),
    ("Aprender · 45 palabras antes", lambda pg: mide_aprender(pg, tarjeta_aprender(pre=45)), {"B1"}),
    ("Aprender · 70 palabras más", lambda pg: mide_aprender(pg, tarjeta_aprender(extra=70)), {"B2"}),
    ("Aprender · la acción no cambia nada", lambda pg: mide_aprender(pg, tarjeta_aprender(cambia=False)), {"B3"}),
    ("Aprender · acierto en teal", lambda pg: mide_aprender(pg, tarjeta_aprender(teal=True)), {"B4"}),
    ("Aprender · frase duplicada", lambda pg: mide_aprender(pg, tarjeta_aprender(dup=True)), {"B5"}),
    ("Hacer · cumple", lambda pg: mide_hacer(pg), set()),
    ("Hacer · la figura no se mueve", lambda pg: mide_hacer(pg, figura="nada"), {"B3"}),
    ("Hacer · la figura revela igual", lambda pg: mide_hacer(pg, figura="revela"), {"B3"}),
    ("Hacer · fila del Haber en teal", lambda pg: mide_hacer(pg, fila_teal=True), {"B4"}),
    ("Sin medir nada", lambda pg: juzga("H9", []), {"SONDA"}),
]
malos = 0
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 320, "height": 800})
    for nombre, fn, esperado in CASOS:
        reglas = {f[0] for f in fn(pg)}
        bien = reglas == esperado
        malos += not bien
        print(f"{'ok ' if bien else 'MAL'}  {nombre:38} esperado {sorted(esperado) or 'PASA'}  salió {sorted(reglas) or 'PASA'}")
    b.close()
print(f"\n{len(CASOS) - malos} de {len(CASOS)} casos como se esperaba")
sys.exit(1 if malos else 0)
