"""
Brazos colgando (20-nov) y cuerpo nuevo del conejo.

Mateo (19-nov): «los brazos siguen como salidos». Los brazos del primer kit
venían dibujados para otra pose (el del perro, doblado hacia arriba), así que
ningún ajuste de posición los hacía ver naturales. Gemini dibujó una pareja
nueva por especie: relajada, colgando, casi recta. Y un torso nuevo del conejo
con patitas redondas de frente (las de antes «se veían muy raras»).

  python3 scripts/mascotas/brazos-colgando.py <carpeta-con-las-hojas> public/mascotas

Hojas esperadas en la carpeta: <especie>_brazos.jpg, conejo_torso.jpg y perro_torso.png.
Por pieza escribe, como separar-pelaje.py, el original, el pelaje en grises
(_p, sin pérdida) y lo fijo (_f), al 50 %, y añade sus medidas a
src/mascota/marionetas-piezas.js sin tocar la rampa de cada especie.

Nombres nuevos (los de antes se quedan, no se borra nada):
  bc_d  el brazo que se ve a la IZQUIERDA de la pantalla (el derecho de la mascota)
  bc_i  el que se ve a la derecha
  torso_n  el cuerpo nuevo del conejo y el del perro
"""
import json, os, re, sys
import cv2, numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes

SRC, OUT = sys.argv[1], sys.argv[2]
K = 0.5  # las piezas se guardan al 50 % de su tamaño en px del kit

# especie: (hoja, alto en px del kit, pelaje blanco)
BRAZOS = {
    "perro": ("perro_brazos.jpg", 150, False),
    "gato": ("gato_brazos.jpg", 150, False),
    "conejo": ("conejo_brazos.jpg", 122, True),
    "huron": ("huron_brazos.jpg", 138, False),
    "hamster": ("hamster_brazos.jpg", 112, False),
    "zorro": ("zorro_brazos.jpg", 150, False),
}
# Cuerpos nuevos, alto en px del kit. El del perro (20-nov): el primero era el
# torso del kit con los brazos borrados a mano y quedó torcido.
TORSOS = {
    "conejo": ("conejo_torso.jpg", "torso_n", 210, True),
    "perro": ("perro_torso.png", "torso_n", 270, False),
}


def componentes(path):
    im = cv2.imread(path).astype(np.float32)
    d = 255 - im.min(axis=2)
    m = cv2.morphologyEx((d > 28).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    return im, d, lab, [i for i in range(1, n) if st[i, 4] > 150], st


def recorte(im, d, lab, i, st):
    """La pieza con fondo transparente (lo mismo que recortar.py)."""
    x, y, w, h = st[i, :4]
    p = 6
    x0, y0, x1, y1 = max(0, x - p), max(0, y - p), x + w + p, y + h + p
    sub = lab[y0:y1, x0:x1]
    comp = sub == i
    f = binary_fill_holes(comp)
    filled = cv2.dilate(f.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    inner = cv2.erode(f.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    a = np.where(inner, 1.0, np.clip(d[y0:y1, x0:x1] / 90.0, 0, 1)) * filled
    c = im[y0:y1, x0:x1]
    aa = np.maximum(a, 1e-3)[..., None]
    col = np.clip((c - (1 - aa) * 255) / aa, 0, 255)
    return np.dstack([col[..., ::-1], a * 255]).astype(np.uint8)  # RGBA


def hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a[..., :3].max(2); mn = a[..., :3].min(2); dd = mx - mn
    s = np.where(mx > 0, dd / np.maximum(mx, 1e-6), 0)
    q = np.maximum(dd, 1e-6)
    h = np.where(mx == r, ((g - b) / q) % 6, np.where(mx == g, (b - r) / q + 2, (r - g) / q + 4)) * 60
    return np.where(dd < 1e-6, 0, h), s, mx


def guardar(arr, path, w, h, q=82):
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8), "RGBA").resize(
        (max(1, round(w * K)), max(1, round(h * K))), Image.LANCZOS)
    if q == "LL":
        im.save(path, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(path, "WEBP", quality=q, method=6)


def pieza(rgba, alto, blanco, od, nombre):
    """Escala la pieza a su alto en px del kit y la separa en pelaje y fijo."""
    H0, W0 = rgba.shape[:2]
    W, H = round(W0 * alto / H0), alto
    # Se trabaja al doble del tamaño final del kit: bordes limpios al reducir.
    big = cv2.resize(rgba, (W * 2, H * 2), interpolation=cv2.INTER_AREA)
    a = big.astype(np.float32) / 255
    al = a[..., 3]
    h, s, v = hsv(a)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    rosa = ((h >= 330) | (h < 14)) & (s > .15) & (v > .45)
    fur = (v > .25) & ~rosa
    if not blanco:
        fur &= ~((s < .06) & (v > .88))  # la patita blanca o crema no se tiñe
    guardar(a, f"{od}/{nombre}.webp", W, H)
    L8 = cv2.medianBlur((L * 255).astype(np.uint8), 5).astype(np.float32) / 255
    L = np.where(cv2.erode(fur.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0, L8, L)
    for _ in range(3 if blanco else 1):
        L = cv2.bilateralFilter(L.astype(np.float32), 9, 0.04 if blanco else 0.06, 5)
    bajo = cv2.dilate(fur.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    p = np.dstack([L, L, L, al * bajo]); f = a.copy(); f[..., 3] = al * (~fur)
    guardar(p, f"{od}/{nombre}_p.webp", W, H, "LL")
    guardar(f, f"{od}/{nombre}_f.webp", W, H)
    return [W, H, 1]


nuevas = {}
for sp, (hoja, alto, blanco) in BRAZOS.items():
    path = os.path.join(SRC, hoja)
    if not os.path.exists(path):
        print(sp, "sin hoja: se queda con sus brazos de antes")
        continue
    im, d, lab, ids, st = componentes(path)
    # La pareja colgando: las dos piezas altas (el perro trae además dos levantadas).
    altas = sorted([i for i in ids if st[i, 3] > 400], key=lambda i: st[i, 0])[:2]
    od = os.path.join(OUT, sp)
    for nombre, i in zip(("bc_d", "bc_i"), altas):
        nuevas.setdefault(sp, {})[nombre] = pieza(recorte(im, d, lab, i, st), alto, blanco, od, nombre)
for sp, (hoja, nombre, alto, blanco) in TORSOS.items():
    path = os.path.join(SRC, hoja)
    if not os.path.exists(path):
        continue
    im, d, lab, ids, st = componentes(path)
    i = max(ids, key=lambda i: st[i, 4])
    nuevas.setdefault(sp, {})[nombre] = pieza(recorte(im, d, lab, i, st), alto, blanco, os.path.join(OUT, sp), nombre)

# Las medidas, dentro de marionetas-piezas.js (la rampa de cada especie no cambia).
js_path = "src/mascota/marionetas-piezas.js"
lineas = open(js_path).read().split("\n")
for sp, piezas in nuevas.items():
    ini = lineas.index(f"  {sp}: {{")
    fin = lineas.index("    },", ini)  # el cierre de su bloque `piezas`
    for nombre, med in piezas.items():
        nueva = f"      {nombre}: {json.dumps(med)},"
        ya = [k for k in range(ini, fin) if lineas[k].startswith(f"      {nombre}: ")]
        if ya:
            lineas[ya[0]] = nueva
        else:
            lineas.insert(fin, nueva); fin += 1
open(js_path, "w").write("\n".join(lineas))
print(json.dumps(nuevas))
