"""La mezcla final de un microvideo: la voz manda.

Uso:
  python3 sonido/mezcla.py --voz voz.mp3 --fx fx.wav --musica sonido/musica/<pista>.mp3 \
      --video video.mp4 --salida final.mp4 [--informe informe.json]
  python3 sonido/mezcla.py --medir --voz voz.mp3 --fondo fondo.wav   (solo mide una mezcla vieja)

Reglas (pedido de Mateo, 26-nov-2026: «que los FX no estén más fuertes que la voz»):
  1. La voz se normaliza a -18 LUFS y la mezcla final a -16 LUFS (estándar para celular).
  2. Ningún efecto suena más fuerte que la voz: en cada instante el efecto queda al menos
     FX_BAJO_VOZ dB por debajo del nivel de la voz a su alrededor (o del nivel típico de la voz
     cuando nadie habla). Se mide en ventanas de 50 ms, así que también cubre golpes cortos.
  3. La música va MUSICA_HABLA dB debajo de la voz mientras se habla y sube a MUSICA_PAUSA
     en las pausas, con rampas suaves; entra y sale con fundido.
  4. Un limitador deja el pico final en -1,5 dBFS (margen para el AAC).
El informe dice cuántos momentos de 400 ms tenían el fondo (efectos + música) más fuerte que
la voz, antes y después.
"""
import argparse, json, subprocess, tempfile, os
import numpy as np
import pyloudnorm as pyln
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

SR = 44100
VOZ_LUFS = -18.0
FINAL_LUFS = -16.0
FX_BAJO_VOZ = 6.0      # dB que el efecto queda debajo de la voz, como mínimo
FX_MEDIO = 12.0        # dB debajo de la voz a los que se lleva el efecto típico
MUSICA_HABLA = 21.0    # dB de la música debajo de la voz mientras se habla
MUSICA_PAUSA = 12.0    # dB de la música debajo de la voz en las pausas


def lee(f, canales=2):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", str(canales), "-ar", str(SR), "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, canales).astype(np.float64)


def ajusta(x, n):
    if len(x) >= n: return x[:n]
    return np.vstack([x, np.zeros((n - len(x), x.shape[1]))])


def env_db(x, win_s):
    """nivel RMS (dB) por muestra, en ventana deslizante centrada"""
    m = x.mean(axis=1) if x.ndim > 1 else x
    p = uniform_filter1d(m * m, size=max(1, int(win_s * SR)), mode="nearest")
    return 10 * np.log10(p + 1e-12)


def suaviza_ganancia(g_db, ataque_s=0.005, suelta_s=0.18):
    """la ganancia baja casi al instante y sube despacio (como un compresor)"""
    g = minimum_filter1d(g_db, size=int(0.06 * SR), mode="nearest")  # ve venir el golpe
    a = np.exp(-1 / (suelta_s * SR))
    out = np.empty_like(g)
    acc = g[0]
    # un polo por bloques de 64 muestras: rápido y suficiente
    paso = 64
    for i in range(0, len(g), paso):
        obj = g[i:i + paso].min()
        acc = obj if obj < acc else obj + (acc - obj) * (a ** paso)
        out[i:i + paso] = acc
    return uniform_filter1d(out, size=int(ataque_s * SR) + 1, mode="nearest")


def actividad_voz(voz):
    e = env_db(voz, 0.05)
    tipico = np.percentile(e[e > e.max() - 40], 70)
    activa = e > tipico - 18
    # se considera «hablando» lo que está a menos de 0,25 s de una sílaba
    activa = maximum_filter1d(activa.astype(np.uint8), size=int(0.5 * SR)) > 0
    return e, tipico, activa


def informe_fondo(voz, fondo, etiqueta):
    """momentos en que el fondo suena más fuerte que la voz. Se compara igual con igual: nivel
    momentáneo (ventanas de 400 ms, como el medidor EBU R128) del fondo contra el de la voz; en
    las pausas, contra el nivel típico de la voz en ese video."""
    paso = int(0.1 * SR)
    ev = env_db(voz, 0.4)[::paso]
    ef = env_db(fondo, 0.4)[::paso]
    _, _, activa = actividad_voz(voz)
    act = activa[::paso]
    tipico = float(np.median(ev[act]))
    ref = np.where(act, np.maximum(ev, tipico - 10), tipico)
    exceso = ef - ref
    malos = exceso > 0
    momentos = int(np.sum(np.diff(np.concatenate([[0], malos.astype(int)])) == 1))
    return {"etiqueta": etiqueta, "momentos_fondo_sobre_voz": momentos,
            "segundos_fondo_sobre_voz": round(float(malos.sum() * 0.1), 1),
            "peor_exceso_db": round(float(exceso.max()), 1),
            "fondo_medio_bajo_voz_db": round(float(tipico - np.median(ef[act])), 1)}


def mezcla(a):
    voz = lee(a.voz, 1)
    fx = lee(a.fx, 2)
    n = len(voz)
    fx = ajusta(fx, n)
    med = pyln.Meter(SR)
    voz *= 10 ** ((VOZ_LUFS - med.integrated_loudness(voz[:, 0])) / 20)
    ev, tipico, activa = actividad_voz(voz)
    ev_alrededor = maximum_filter1d(env_db(voz, 0.3), size=int(0.6 * SR))
    ref = np.where(activa, ev_alrededor, tipico)

    # efectos: primero al nivel típico (FX_MEDIO debajo de la voz), luego el tope por instante
    efx = env_db(fx, 0.05)
    sonando = efx > efx.max() - 30
    if sonando.any():
        fx *= 10 ** ((tipico - FX_MEDIO - np.percentile(efx[sonando], 90)) / 20)
    efx = env_db(fx, 0.05)
    g = np.minimum(0, (ref - FX_BAJO_VOZ) - efx)
    fx *= (10 ** (suaviza_ganancia(g) / 20))[:, None]

    # música
    mu = ajusta(lee(a.musica, 2), n)
    mu /= 10 ** (med.integrated_loudness(mu) / 20) / 10 ** (VOZ_LUFS / 20)  # a -16 LUFS
    habla = uniform_filter1d(activa.astype(float), size=int(0.7 * SR), mode="nearest")
    g_mu = -(MUSICA_PAUSA + (MUSICA_HABLA - MUSICA_PAUSA) * habla)
    t = np.arange(n) / SR
    fundido = np.clip(t / 0.6, 0, 1) * np.clip((t[-1] - t) / 1.4, 0, 1)
    mu *= (10 ** (g_mu / 20) * fundido)[:, None]

    total = voz + fx + mu  # la voz mono va a los dos canales
    total *= 10 ** ((FINAL_LUFS - med.integrated_loudness(total)) / 20)
    pico = np.abs(total).max()
    lim = 10 ** (-1.5 / 20)
    if pico > lim:
        # limitador suave: solo baja los picos que pasan de -1 dBFS
        e = maximum_filter1d(np.abs(total).max(axis=1), size=int(0.01 * SR))
        gl = np.minimum(1, lim / np.maximum(e, 1e-9))
        gl = uniform_filter1d(minimum_filter1d(gl, size=int(0.01 * SR)), size=int(0.004 * SR) + 1)
        total *= gl[:, None]

    inf = {"despues": informe_fondo(voz, fx + mu, "después"),
           "lufs_final": round(med.integrated_loudness(total), 1), "musica": os.path.basename(a.musica)}
    with tempfile.TemporaryDirectory() as d:
        w = os.path.join(d, "m.f32")
        total.astype(np.float32).tofile(w)
        cmd = ["ffmpeg", "-y", "-v", "error"]
        if a.video:
            cmd += ["-i", a.video]
        cmd += ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", w]
        if a.video:
            cmd += ["-map", "0:v", "-map", "1:a", "-c:v", "copy", "-movflags", "+faststart"]
        cmd += ["-c:a", "aac", "-b:a", "128k", "-shortest", a.salida]
        subprocess.run(cmd, check=True)
    return inf


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--voz", required=True); p.add_argument("--fx"); p.add_argument("--musica")
    p.add_argument("--video"); p.add_argument("--salida"); p.add_argument("--informe")
    p.add_argument("--medir", action="store_true"); p.add_argument("--fondo", nargs="*")
    a = p.parse_args()
    if a.medir:
        voz = lee(a.voz, 1)
        fondo = sum(ajusta(lee(f, 2), len(voz)) for f in a.fondo)
        r = informe_fondo(voz, fondo, "antes")
    else:
        r = mezcla(a)
    print(json.dumps(r, ensure_ascii=False))
    if a.informe:
        with open(a.informe, "w") as f: json.dump(r, f, ensure_ascii=False, indent=1)
