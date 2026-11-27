"""Como alinea.py, pero con la transcripción palabra por palabra que ya trae ElevenLabs
(sonido/narraciones/<id>.palabras.json, acción «narrar» de eleven.mjs): no necesita Whisper.
Uso: python3 -I herramientas/alinea_scribe.py <palabras.json> <guion.txt> <salida tiempos.json> <audio en public/> <duración>"""
import sys, json, re, unicodedata, difflib
pj, guion, salida, audio, dur = sys.argv[1:6]
frases = [l.strip() for l in open(guion, encoding="utf-8") if l.strip()]
def limpia(w): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", w.lower()))
oidas = json.load(open(pj, encoding="utf-8"))["palabras"]
gw = [(i, w) for i, f in enumerate(frases) for w in f.split()]
a = [limpia(w) for _, w in gw]; b = [limpia(w["w"]) for w in oidas]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t = [None] * len(gw)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): t[i1 + k] = (oidas[j1 + k]["ini"], oidas[j1 + k]["fin"])
    elif tag == "replace":
        s0, s1 = oidas[j1]["ini"], oidas[j2 - 1]["fin"]; n = i2 - i1
        for k in range(n): t[i1 + k] = (s0 + (s1 - s0) * k / n, s0 + (s1 - s0) * (k + 1) / n)
for k in range(len(t)):
    if t[k] is None:
        prev = next((t[j] for j in range(k - 1, -1, -1) if t[j]), (0, 0))
        nxt = next((t[j] for j in range(k + 1, len(t)) if t[j]), (prev[1] + 0.3, prev[1] + 0.3))
        t[k] = (prev[1], max(prev[1], nxt[0]))
esc = []
for i, f in enumerate(frases):
    ps = [{"w": w, "ini": round(t[k][0], 2), "fin": round(t[k][1], 2)} for k, (j, w) in enumerate(gw) if j == i]
    esc.append({"ini": ps[0]["ini"], "fin": ps[-1]["fin"], "texto": f, "palabras": ps})
json.dump({"audio": audio, "duracion": float(dur), "escenas": esc}, open(salida, "w"), ensure_ascii=False)
for e in esc: print(f'{e["ini"]:6.2f}-{e["fin"]:6.2f}  {e["texto"][:70]}')
