"""Efectos y música del microvideo, hechos por código (numpy). Son originales:
no salen de ninguna biblioteca, así que no arrastran licencia de terceros.
Uso: python3 sonido/sintetiza.py  → escribe public/sfx/*.wav"""
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)

def guarda(nombre, y, pico=0.9):
    y = np.asarray(y, float)
    if y.ndim == 1: y = np.stack([y, y], 1)
    y = y / (np.abs(y).max() + 1e-9) * pico
    with wave.open(os.path.join(OUT, nombre + ".wav"), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())

def T(d): return np.arange(int(d * SR)) / SR
def env(t, a, r): return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def ruido(n): return rng.standard_normal(n)
def pasabajo(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i, v in enumerate(x): z = (1 - a) * v + a * z; y[i] = z
    return y
def pasaalto(x, fc): return x - pasabajo(x, fc)
def barre(f0, f1, d, curva=1.0):
    t = T(d); f = f0 + (f1 - f0) * (t / d) ** curva
    return np.sin(2 * np.pi * np.cumsum(f) / SR), t
def mezcla(d, eventos):
    y = np.zeros(int(d * SR) + SR)
    for t0, s, g in eventos:
        i = int(t0 * SR); y[i:i + len(s)] += s[:len(y) - i] * g
    return y[:int(d * SR)]

# ── efectos ──
def pop(f0=420, f1=900, d=0.11):
    s, t = barre(f0, f1, d); return s * env(t, 0.004, 0.03)
def toc(f=520, d=0.16, cuerpo=0.5):
    t = T(d)
    s = np.sin(2*np.pi*f*t) * np.exp(-t/0.03) + cuerpo*np.sin(2*np.pi*f*0.5*t) * np.exp(-t/0.05)
    s[:300] += pasaalto(ruido(300), 1500) * 0.5 * np.linspace(1, 0, 300)
    return s
def tiza(d=0.32, golpes=3):
    t = T(d); n = pasaalto(pasabajo(ruido(len(t)), 5200), 1800)
    e = np.zeros(len(t))
    for k in range(golpes):
        c = (k + 0.5) / golpes * d; e += np.exp(-((t - c) / (d / golpes / 2.6)) ** 2)
    return n * e * (1 + 0.5 * np.sin(2 * np.pi * 47 * t))
def barrido(d=0.34, f=1400):
    t = T(d); n = ruido(len(t)); e = np.sin(np.pi * t / d) ** 2
    y = np.zeros(len(t)); z = 0
    fc = f * (0.4 + 1.4 * np.sin(np.pi * t / d)); a = np.exp(-2 * np.pi * fc / SR)
    for i in range(len(t)): z = (1 - a[i]) * n[i] + a[i] * z; y[i] = z
    return pasaalto(y, 250) * e
def moneda(f=2300):
    t = T(0.3)
    return (np.sin(2*np.pi*f*t) + 0.6*np.sin(2*np.pi*f*1.51*t) + 0.3*np.sin(2*np.pi*f*2.27*t)) * np.exp(-t/0.06)
def campana(notas=(1046.5, 1318.5, 1568), d=1.2):
    y = np.zeros(int(d * SR))
    for k, f in enumerate(notas):
        t = T(d - k * 0.09); s = (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*f*2.01*t) + 0.15*np.sin(2*np.pi*f*3.0*t)) * env(t, 0.003, 0.3)
        y[int(k * 0.09 * SR):int(k * 0.09 * SR) + len(s)] += s
    return y

guarda("pop", pop(), 0.8)
guarda("pop-suave", pop(300, 520, 0.14), 0.6)
guarda("toc", toc(), 0.85)
guarda("toc-grave", toc(190, 0.3, 0.9), 0.9)
guarda("tiza", tiza(), 0.6)
guarda("tiza-larga", tiza(1.25, 9), 0.6)
guarda("barrido", barrido(), 0.7)
guarda("barrido-lento", barrido(1.3, 900), 0.6)
guarda("monedas", mezcla(0.6, [(0, moneda(2300), 1), (0.09, moneda(2750), 0.8), (0.2, moneda(2050), 0.7)]), 0.6)
guarda("campana", campana(), 0.6)
guarda("burbuja", mezcla(0.5, [(0, pop(250, 600, 0.09), 0.7), (0.12, pop(330, 760, 0.09), 0.8), (0.24, pop(420, 1000, 0.12), 1)]), 0.7)
# letrero: giro de tabla + golpecito
guarda("letrero", mezcla(0.5, [(0, barrido(0.2, 2200), 0.6), (0.2, toc(330, 0.2, 0.8), 1)]), 0.85)
# golpe cómico (tres mil): bombo + resorte que baja
s, t = barre(620, 170, 0.5, 0.6)
bombo, tb = barre(140, 45, 0.3)
guarda("golpe", mezcla(0.7, [(0, bombo * np.exp(-tb / 0.09), 1.2), (0.03, s * env(t, 0.01, 0.16) * (1 + 0.3 * np.sin(2*np.pi*28*t)), 0.7)]), 0.95)
# pasos al trote
guarda("pasos", mezcla(1.3, [(k * 0.2, toc(150 + 25 * (k % 2), 0.12, 1.0) + 0.3 * pasabajo(ruido(int(0.12 * SR)), 900)[:int(0.12*SR)] * np.exp(-T(0.12)/0.03), 0.8) for k in range(6)]), 0.6)
# deslizamiento suave (el mango sobre la recta)
s, t = barre(380, 760, 0.9, 1.3)
guarda("desliza", s * np.sin(np.pi * t / 0.9) ** 1.5 * 0.8 + 0.25 * barrido(0.9, 1800), 0.5)
# suspiro: aire que cae
t = T(0.8); n = pasabajo(ruido(len(t)), 1400)
guarda("suspiro", pasaalto(n, 300) * np.sin(np.pi * (t / 0.8) ** 0.6) ** 2 * (1.2 - t), 0.5)
# rebobinado: cinta que retrocede
s, t = barre(300, 1900, 0.55, 1.6)
guarda("rebobina", (s * (0.5 + 0.5 * np.sign(np.sin(2*np.pi*34*t))) * 0.5 + 0.5 * barrido(0.55, 2600)) * np.minimum(1, (0.55 - t) / 0.05), 0.7)
# camión: motor que llega y frena
t = T(1.7); f = 62 + 26 * np.exp(-t / 0.5)
ph = 2 * np.pi * np.cumsum(f) / SR
motor = (np.sign(np.sin(ph)) * 0.4 + np.sin(ph * 2) * 0.4 + np.sin(ph * 0.5) * 0.5)
motor = pasabajo(motor + 0.25 * ruido(len(t)), 520) * np.minimum(1, t / 0.15) * np.minimum(1, (1.7 - t) / 0.5)
freno, tf = barre(1900, 1350, 0.28)
bocina = (np.sign(np.sin(2*np.pi*392*T(0.16))) + np.sign(np.sin(2*np.pi*494*T(0.16)))) * 0.2
guarda("camion", mezcla(1.9, [(0, motor, 1), (1.0, pasabajo(freno * env(tf, 0.03, 0.12), 3000), 0.12), (1.3, pasabajo(bocina, 2400), 0.5), (1.5, pasabajo(bocina, 2400), 0.5)]), 0.75)
# sorbo: burbujitas que suben
guarda("sorbo", mezcla(0.8, [(k * 0.05, pop(500 + 40 * k + rng.uniform(-60, 60), 800 + 60 * k, 0.05), 0.5 + 0.03 * k) for k in range(12)]), 0.5)


# ── efectos nuevos de los microvideos de Macro (2026-11-26) ──
def agua(d=1.2):
    t = T(d); n = pasabajo(ruido(len(t)), 2600)
    burb = mezcla(d, [(rng.uniform(0, d - 0.06), pop(rng.uniform(500, 1100), rng.uniform(900, 1600), 0.05), 0.25) for _ in range(int(14 * d))])
    return (pasaalto(n, 300) * 0.8 + burb) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.2)
guarda("agua", agua(), 0.55)
guarda("gotas", mezcla(0.9, [(k * 0.27, pop(700 + 80 * k, 1500 + 90 * k, 0.07), 0.9) for k in range(3)]), 0.6)
s_, t_ = barre(500, 150, 0.9, 0.7)
guarda("desague", pasabajo(agua(0.9), 900) * 0.8 + s_ * env(t_, 0.05, 0.4) * 0.25, 0.55)
def bocina(f=110, d=1.2):
    t = T(d); s = np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*2*f*t) + 0.3*np.sin(2*np.pi*3*f*t) + 0.2*np.sin(2*np.pi*4.02*f*t)
    return pasabajo(s, 1200) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.3)
guarda("bocina", bocina(), 0.6)
guarda("bocina-grave", bocina(78, 1.4), 0.6)
t_ = T(0.5); guarda("papel", pasaalto(pasabajo(ruido(len(t_)), 6000), 1500) * (np.abs(np.sin(2*np.pi*9*t_)) ** 3) * np.sin(np.pi * t_ / 0.5), 0.5)
guarda("sello", mezcla(0.4, [(0, toc(120, 0.25, 1.2), 1), (0, pasabajo(ruido(int(0.05 * SR)), 1500) * np.exp(-T(0.05) / 0.01), 0.6)]), 0.85)
guarda("ding", campana((1318.5,), 1.0), 0.6)
guarda("ding-doble", campana((1318.5, 1046.5), 1.2), 0.6)
t_ = T(0.6); f_ = 180 + 40 * np.sin(2*np.pi*7*t_)
guarda("crujido", np.sign(np.sin(2*np.pi*np.cumsum(f_)/SR)) * (np.abs(np.sin(2*np.pi*23*t_)) > 0.6) * np.sin(np.pi * t_ / 0.6) * 0.6 + 0.2 * pasabajo(ruido(len(t_)), 800), 0.45)
def eco(d=2.4):
    y = np.zeros(int(d * SR)); b = pop(300, 600, 0.18)
    for k in range(6):
        i = int(k * 0.36 * SR); s = pasabajo(b, 3000 / (1 + k)) * (0.6 ** k); y[i:i + len(s)] += s[:len(y) - i]
    return y
guarda("eco", eco(), 0.6)
t_ = T(1.8); guarda("trueno", pasabajo(ruido(len(t_)), 180) * env(t_, 0.08, 0.6) * (1 + 0.5 * np.sin(2*np.pi*3*t_)), 0.6)
guarda("candado", mezcla(0.4, [(0, toc(900, 0.08, 0.2), 0.7), (0.08, toc(1400, 0.1, 0.1), 0.9)]), 0.7)
guarda("firma", tiza(0.6, 4), 0.45)
guarda("redoble", mezcla(1.0, [(k * 0.045, toc(200, 0.06, 0.6) * (0.4 + 0.6 * k / 22), 1) for k in range(22)]), 0.6)
t_ = T(2.0); guarda("viento", pasabajo(ruido(len(t_)), 500) * (0.6 + 0.4 * np.sin(2*np.pi*0.7*t_)) * np.sin(np.pi * t_ / 2.0), 0.4)
s_, t_ = barre(200, 520, 0.7, 1.0); guarda("sube", s_ * np.sin(np.pi * t_ / 0.7) + 0.2 * barrido(0.7, 1500), 0.45)
s_, t_ = barre(520, 180, 0.7, 1.0); guarda("baja", s_ * np.sin(np.pi * t_ / 0.7) + 0.2 * barrido(0.7, 1200), 0.45)
t_ = T(1.2); f_ = 70 + 10 * np.sin(2*np.pi*0.8*t_)
guarda("grua", pasabajo(np.sign(np.sin(2*np.pi*np.cumsum(f_)/SR)) * 0.4 + 0.3 * ruido(len(t_)), 700) * np.minimum(1, t_ / 0.1) * np.minimum(1, (1.2 - t_) / 0.2), 0.5)
guarda("tijera", mezcla(0.3, [(0, toc(2600, 0.06, 0.1), 0.8), (0.1, toc(3000, 0.07, 0.1), 1)]), 0.6)
guarda("caja", mezcla(0.9, [(0, moneda(1800), 0.7), (0.15, toc(700, 0.15, 0.4), 0.6), (0.3, campana((2093,), 0.6), 0.6)]), 0.6)
guarda("whoosh", barrido(0.5, 2200), 0.6)

# ── música: ukelele y marimba, alegre y sencilla ──
BPM = 104; NEG = 60 / BPM
def nota(n): return 440 * 2 ** ((n - 69) / 12)
def cuerda(f, d, brillo=0.5):
    N = int(SR / f); buf = pasabajo(ruido(N), 2500 + 6000 * brillo); n = int(d * SR); y = np.empty(n)
    for i in range(n):
        y[i] = buf[i % N]; buf[i % N] = 0.996 * 0.5 * (buf[i % N] + buf[(i + 1) % N])
    return y * np.minimum(1, (d - T(d)) / 0.05)
def marimba(f, d=0.6):
    t = T(d); return (np.sin(2*np.pi*f*t) * np.exp(-t/0.18) + 0.35 * np.sin(2*np.pi*f*4*t) * np.exp(-t/0.04))
def bajo(f, d):
    t = T(d); return (np.sin(2*np.pi*f*t) + 0.3 * np.sin(2*np.pi*2*f*t)) * env(t, 0.01, 0.35)
def shaker(d=0.07):
    return pasaalto(ruido(int(d * SR)), 5000) * np.exp(-T(d) / 0.02)
ACORDES = {"C": [60, 64, 67, 72], "Am": [57, 60, 64, 69], "F": [53, 57, 60, 65], "G": [55, 59, 62, 67], "Dm": [50, 57, 62, 65], "Em": [52, 55, 59, 64]}
CACHE = {}
def rasgueo(ac, abajo=True, d=0.5):
    k = (ac, abajo)
    if k not in CACHE:
        y = np.zeros(int(d * SR) + 4000); ns = ACORDES[ac] if abajo else ACORDES[ac][::-1]
        for i, n in enumerate(ns):
            s = cuerda(nota(n + 12), d, 0.45); o = int(i * 0.014 * SR); y[o:o + len(s)] += s * (0.9 if abajo else 0.6)
        CACHE[k] = y
    return CACHE[k]
A = ["C", "Am", "F", "G"]; B = ["F", "G", "Em", "Am", "Dm", "G", "C", "C"]
MEL_A = [(0, 76), (1, 79), (1.5, 76), (2, 72), (3, 74), (4, 76), (5, 72), (5.5, 69), (6, 72), (8, 77), (9, 81), (9.5, 77), (10, 72), (11, 76), (12, 74), (13, 79), (14, 74), (15, 71)]
MEL_B = [(0, 81), (1, 77), (2, 84), (3, 81), (4, 83), (5, 79), (6, 74), (7, 79), (8, 79), (9, 76), (10, 71), (11, 76), (12, 76), (13, 72), (14, 69), (15, 72)]
def compas_ev(t0, ac, con_mel=None, lleno=True):
    ev = []
    patron = [(0, True, 1.0), (1, True, 0.7), (1.5, False, 0.55), (2.5, False, 0.55), (3, True, 0.8), (3.5, False, 0.5)]
    for b, abajo, g in patron: ev.append((t0 + b * NEG, rasgueo(ac, abajo), 0.32 * g))
    raiz = nota(ACORDES[ac][0] - 12)
    ev.append((t0, bajo(raiz, NEG * 1.6), 0.5)); ev.append((t0 + 2.5 * NEG, bajo(raiz * 1.5, NEG), 0.32))
    if lleno:
        for k in range(8): ev.append((t0 + k * NEG / 2, shaker(), 0.10 if k % 2 else 0.05))
    return ev
def musica(dur):
    ev = []; t = 0.0; n = 0
    forma = ["A", "A", "B", "A"]
    while t < dur:
        sec = forma[(n // 1) % 4]; prog = A * 2 if sec == "A" else B; mel = MEL_A if sec == "A" else MEL_B
        primera = n == 0
        for i, ac in enumerate(prog):
            ev += compas_ev(t + i * 4 * NEG, ac, lleno=not primera or i >= 4)
        # la melodía de marimba entra en la segunda vuelta
        if not primera:
            for rep in range(2 if sec == "A" else 1):
                for b, nn in mel:
                    ev.append((t + rep * 16 * NEG + b * NEG * (1 if sec == "A" else 2), marimba(nota(nn)), 0.20))
        t += len(prog) * 4 * NEG; n += 1
    y = mezcla(dur, [(a, s, g) for a, s, g in ev if a < dur])
    y = np.tanh(y * 1.3)
    # estéreo suave
    d = int(0.011 * SR); der = np.concatenate([np.zeros(d), y[:-d]])
    return np.stack([y * 0.9 + der * 0.25, der * 0.9 + y * 0.25], 1)
import sys
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 80
guarda("musica", musica(DUR), 0.75)
print("listo", sorted(os.listdir(OUT)))
