"""Tablas de la sonda de enganche. Uso: python3 eng_tablas.py salida1.json [salida2.json ...] > tablas.md
Aprender: una fila por vista (al llegar o lectura, y tras el acierto).
Hacer: una fila por tarjeta, con lo que se ve al llegar, tras acertar y tras fallar."""
import json, sys

def neg(n, lim):
    return "—" if n is None else (f"**{n}**" if n > lim else str(n))

def dup(x):
    if not x["repetidos"]: return "no"
    s = "; ".join(f"«{d['frase'][:34]}…» ×{d['veces']}" for d in x["repetidos"][:2])
    return s + (f" (+{len(x['repetidos']) - 2})" if len(x["repetidos"]) > 2 else "")

def color(x):
    marc = [m for m in x["marcadores"] if m["tonos"]]
    filas = [f for f in x.get("filas", []) if f["lado"] == "Haber" and "teal" in f["tonos"]]
    out = []
    if marc: out.append("**" + "+".join(sorted({t for m in marc for t in m["tonos"]})) + "**")
    if filas: out.append("**fila del Haber en teal**")
    return " ".join(out) or "no"

def aprender(v):
    o = ["| Pantalla | Momento | Palabras | Y figura | Y interacción | Palabras antes | Acción → figura | Mecánica | Acierto en teal/ámbar | Duplicado |",
         "|---|---|---|---|---|---|---|---|---|---|"]
    for x in v["regs"]:
        if x["momento"] == "error": continue
        acc = "—" if x["mecanica"].startswith("ninguna") else ("sí" if x.get("figuraCambiaConLaAccion") else "no")
        col = color(x) if x["momento"] == "acierto" else "—"
        o.append(f"| {x['pantalla']} | {x['momento']} | {neg(x['palabras'], 60)} | {neg(x['figY'], 280)} | {neg(x['interY'], 280)} | {neg(x['palabrasAntes'], 40)} | {acc} | {x['mecanica']} | {col} | {dup(x)} |")
    return "\n".join(o)

def hacer(v):
    o = ["| Tarjeta | Palabras al llegar | Y figura | Y interacción | Palabras antes | Mecánica | La decisión → figura | Color tras acertar | Color tras fallar («era esta») | Duplicado |",
         "|---|---|---|---|---|---|---|---|---|---|"]
    demo = [x for x in v["regs"] if x["momento"] == "así se juega"]
    if demo:
        x = demo[0]
        o.append(f"| así se juega | {x['palabras']} | {neg(x['figY'], 280)} | {neg(x['interY'], 280)} | {neg(x['palabrasAntes'], 40)} | (demo) | — | — | — | {dup(x)} |")
    ok = {x["pantalla"]: x for x in v["regs"] if x["momento"] == "tras acertar"}
    mal = {x["pantalla"]: x for x in v["regs"] if x["momento"] == "tras fallar"}
    for x in [x for x in v["regs"] if x["momento"] == "al llegar"]:
        a, m = ok.get(x["pantalla"], {}), mal.get(x["pantalla"], {})
        dec = "responde" if a.get("figuraCambiaConLaAccion") and a.get("figuraDependeDeLaDecision") else ("revela (igual acierte o falle)" if a.get("soloRevela") else "no se mueve")
        d = dup(x) if x["repetidos"] else (dup(a) if a and a["repetidos"] else "no")
        o.append(f"| {x['pantalla']} | {x['palabras']} | {neg(x['figY'], 280)} | {neg(x['interY'], 280)} | {neg(x['palabrasAntes'], 40)} | {x['mecanica']} | {dec} | {color(a) if a else '—'} | {color(m) if m else '—'} | {d} |")
    return "\n".join(o)

for f in sys.argv[1:]:
    for s, v in json.load(open(f)).items():
        print(f"\n### {s}\n")
        if not v["regs"]:
            print(f"**SIN MEDIR**: {v['errs']}"); continue
        print(aprender(v) if s.startswith("A") else hacer(v))
        tipos = {}
        for a in v["fallos"]: tipos.setdefault(a[0], 0); tipos[a[0]] += 1
        print("\nFallos de la sonda por regla: " + ", ".join(f"{k} ×{n}" for k, n in sorted(tipos.items())))
