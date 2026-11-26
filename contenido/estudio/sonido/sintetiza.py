"""Música y efectos ORIGINALES de Nino, sintetizados por código (no arrastran licencia).
python3 sonido/sintetiza.py → public/sfx/lofi.wav (fondo nocturno, 84 bpm, 32 s).
Mismo enfoque que sonido/sintetiza.py del motor de Jane."""
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
def T(d): return np.arange(int(d * SR)) / SR
def guarda(nombre, y, pico=0.8):
    y = y / (np.max(np.abs(y)) + 1e-9) * pico
    if y.ndim == 1: y = np.stack([y, y], 1)
    os.makedirs("public/sfx", exist_ok=True)
    with wave.open(f"public/sfx/{nombre}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
def pasabajo(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = (1 - a) * x[i] + a * z; y[i] = z
    return y
def nota(n): return 440 * 2 ** ((n - 69) / 12)
def rhodes(f, d):
    t = T(d); env = np.exp(-t / 1.6) * np.minimum(1, t / 0.01)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.2 * t)
    return (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t)*np.exp(-t/0.4) + 0.12*np.sin(2*np.pi*3*f*t)*np.exp(-t/0.2)) * env * trem
def bombo(d=0.35):
    t = T(d); f = 50 + 70 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
def hat(d=0.06):
    r = rng.standard_normal(int(d * SR)); r = r - pasabajo(r, 6000)
    return r * np.exp(-T(d) / 0.015)
DUR, BPM = 32.0, 84
neg = 60 / BPM
y = np.zeros(int(DUR * SR) + SR)
def pon(t0, s, g):
    i = int(t0 * SR); y[i:i + len(s)] += s[:len(y) - i] * g
ACORDES = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]  # Fmaj7 Em7 Dm7 Cmaj7
c = 0; t0 = 0.0
while t0 < DUR:
    ac = ACORDES[c % 4]
    for k, n in enumerate(ac): pon(t0 + k * 0.025, rhodes(nota(n), 4 * neg), 0.22)
    pon(t0, rhodes(nota(ac[0] - 12), 4 * neg), 0.3)
    mel = [ac[3] + 12, ac[2] + 12, ac[1] + 12, ac[2] + 12]
    for b in range(4):
        tb = t0 + b * neg
        pon(tb, bombo(), 0.5 if b in (0, 2) else 0.0)
        pon(tb + neg / 2, hat(), 0.12); pon(tb, hat(), 0.07)
        if b in (1, 3): pon(tb, hat(0.12), 0.1)
        if (c + b) % 3 == 0: pon(tb + neg * 0.5, rhodes(nota(mel[b]), neg * 1.5) * 0.6, 0.12)
    t0 += 4 * neg; c += 1
y = pasabajo(y[:int(DUR * SR)], 4200)
crep = (rng.random(len(y)) > 0.9996) * rng.standard_normal(len(y)) * 0.25
y = y + crep + 0.004 * pasabajo(rng.standard_normal(len(y)), 1200)
d = int(0.013 * SR); der = np.concatenate([np.zeros(d), y[:-d]])
guarda("lofi", np.stack([y, 0.85 * y + 0.15 * der], 1), 0.7)
print("lofi.wav listo")
