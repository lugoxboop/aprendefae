"""Mide la voz: transcribe el mp3 con faster-whisper (palabra por palabra) y
reparte las palabras medidas entre las frases del guion (una frase = una escena).
Uso: python3 -I herramientas/alinea.py <voz.mp3> <guion.txt> <salida tiempos.json> [modelo]
Imprime también lo que oyó, para comparar con el guion (que no falte el final)."""
import sys, json, re, unicodedata, difflib
from faster_whisper import WhisperModel
mp3, guion, salida = sys.argv[1:4]
modelo = sys.argv[4] if len(sys.argv) > 4 else "/tmp/claude-0/wm/model"
frases = [l.strip() for l in open(guion, encoding="utf-8") if l.strip()]
def limpia(w): return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", w.lower()))
m = WhisperModel(modelo, device="cpu", compute_type="int8")
import subprocess, numpy as np
pcm = subprocess.run(["ffmpeg","-v","quiet","-i",mp3,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
segs, info = m.transcribe(audio, language="es", word_timestamps=True, beam_size=5)
oidas = [w for s in segs for w in s.words]
print("DURACIÓN", round(info.duration, 2))
print("OÍDO:", " ".join(w.word.strip() for w in oidas))
# palabras del guion, con su frase
gw = [(i, w) for i, f in enumerate(frases) for w in f.split()]
a = [limpia(w) for _, w in gw]; b = [limpia(w.word) for w in oidas]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t = [None] * len(gw)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): t[i1 + k] = (oidas[j1 + k].start, oidas[j1 + k].end)
    elif tag == "replace":  # repartir el tramo
        s0, s1 = oidas[j1].start, oidas[j2 - 1].end
        n = i2 - i1
        for k in range(n): t[i1 + k] = (s0 + (s1 - s0) * k / n, s0 + (s1 - s0) * (k + 1) / n)
# huecos: interpolar
for k in range(len(t)):
    if t[k] is None:
        prev = next((t[j] for j in range(k - 1, -1, -1) if t[j]), (0, 0))
        nxt = next((t[j] for j in range(k + 1, len(t)) if t[j]), (prev[1] + 0.3, prev[1] + 0.3))
        t[k] = (prev[1], max(prev[1], nxt[0]))
faltan = sum(1 for tag, i1, i2, *_ in sm.get_opcodes() if tag == "delete" for _ in range(i2 - i1))
esc = []
for i, f in enumerate(frases):
    ps = [{"w": w, "ini": round(t[k][0], 2), "fin": round(t[k][1], 2)} for k, (j, w) in enumerate(gw) if j == i]
    esc.append({"ini": ps[0]["ini"], "fin": ps[-1]["fin"], "texto": f, "palabras": ps})
json.dump({"audio": "narracion.mp3", "duracion": round(info.duration, 2), "escenas": esc}, open(salida, "w"), ensure_ascii=False)
print("PALABRAS DEL GUION SIN OÍR:", faltan, "de", len(gw))
for e in esc: print(f'{e["ini"]:6.2f}-{e["fin"]:6.2f}  {e["texto"][:70]}')
