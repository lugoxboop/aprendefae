"""
SEPARAR LAS CARAS EN OJOS, NARIZ Y BOCA (23-nov).

Mateo: «la carita del hámster está por encima de la otra»: la nariz venía
pintada en la cabeza Y otra vez en cada boca (y el hámster traía además la
boca pintada en la cabeza), así que al cambiar de cara se veían dos narices y
dos bocas. El hurón traía la cara entera (antifaz, ojos, nariz y boca) en una
sola pieza por ánimo, encima de una cabeza que ya tenía antifaz y nariz.

Este script deja cada rasgo en su capa, recortado del MISMO arte (sin cambiar
el estilo):
  · nariz.webp            la nariz sola, sacada de la cabeza;
  · cabeza(_p,_f).webp    la cabeza sin nariz (y sin boca en el hámster),
                          rellenada con el pelaje de alrededor;
  · boca_*.webp           las bocas sin la nariz que traían encima
                          (mismo lienzo: no cambia su tamaño);
  · hámster: boca_tranquila.webp (la que traía pintada la cabeza);
  · hurón: ojo_i/ojo_d, feliz_i/feliz_d, triste_i/triste_d, racha_i/racha_d y
    boca_abierta/boca_triste, recortados de sus caras enteras.
Imprime dónde va cada nariz y cuánto hay que correr cada boca para que cuelgue
justo bajo la nariz de la cabeza (px del kit = 2 × px del webp).

  python3 scripts/mascotas/separar-caras.py public/mascotas
Se corre UNA vez sobre las piezas originales (guarda copia en <esp>/.orig/).
"""
import json, os, shutil, sys
import numpy as np
from PIL import Image
import cv2
from scipy.ndimage import binary_fill_holes

RAIZ = sys.argv[1] if len(sys.argv) > 1 else "public/mascotas"
ESPECIES = ["zorro", "gato", "perro", "conejo", "huron", "panda", "hamster"]
BOCAS = {
    "zorro": ["boca_abierta", "boca_sonrisa"],
    "gato": ["boca_abierta", "boca_feliz", "boca_sonrisa", "boca_triste"],
    "hamster": ["boca_abierta", "boca_sonrisa", "boca_triste"],
    "conejo": ["boca_abierta", "boca_sonrisa"],
}


def cargar(esp, n):
    orig = f"{RAIZ}/{esp}/.orig/{n}.webp"
    p = orig if os.path.exists(orig) else f"{RAIZ}/{esp}/{n}.webp"
    return np.array(Image.open(p).convert("RGBA")).astype(np.float32) / 255


def respaldar(esp, n):
    d = f"{RAIZ}/{esp}/.orig"
    os.makedirs(d, exist_ok=True)
    src = f"{RAIZ}/{esp}/{n}.webp"
    if os.path.exists(src) and not os.path.exists(f"{d}/{n}.webp"):
        shutil.copy(src, f"{d}/{n}.webp")


def guardar(a, esp, n, sin_perdida=False):
    respaldar(esp, n)
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8), "RGBA")
    if sin_perdida:
        im.save(f"{RAIZ}/{esp}/{n}.webp", "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(f"{RAIZ}/{esp}/{n}.webp", "WEBP", quality=90, method=6)


def hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a[..., :3].max(2); mn = a[..., :3].min(2); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    h = np.where(d < 1e-6, 0, h)
    return h, s, mx


def rosa(a):
    h, s, v = hsv(a)
    return (((h >= 330) | (h < 22)) & (s > 0.18) & (v > 0.55) & (a[..., 3] > 0.3))


def oscuro(a, lim=0.5):
    _, _, v = hsv(a)
    return (v < lim) & (a[..., 3] > 0.3)


def componentes(m):
    n, lb, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), connectivity=8)
    return n, lb, st


def nariz_de_cabeza(a, esp):
    """La máscara de la nariz: la mancha de color de nariz más grande en el
    centro de la cara que no toca el borde de la zona (eso es contorno o
    manchas del antifaz/panda)."""
    H, W = a.shape[:2]
    x0, x1, y0, y1 = int(W * 0.3), int(W * 0.7), int(H * 0.35), int(H * 0.88)
    zona = np.zeros((H, W), bool); zona[y0:y1, x0:x1] = True
    if esp in ("conejo", "huron", "hamster"):
        base = rosa(a)
    else:
        base = oscuro(a, 0.45)
    m = base & zona
    n, lb, st = componentes(m)
    mejor, area = 0, 0
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if x <= x0 or y <= y0 or x + w >= x1 or y + h >= y1:
            continue
        if ar > area:
            mejor, area = i, ar
    nar = lb == mejor
    # el contorno oscuro y el borde suave alrededor
    crece = cv2.dilate(nar.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2 if esp in ("conejo", "huron", "hamster") else 1).astype(bool)
    _, s, v = hsv(a)
    borde = crece & ~nar & ((v < 0.62) | rosa(a))
    return binary_fill_holes(nar | borde)


def boca_de_hamster(a, nariz):
    """La boca «w» que la cabeza del hámster trae pintada bajo la nariz."""
    H, W = a.shape[:2]
    ys, xs = np.nonzero(nariz)
    y0 = ys.max() - 1
    zona = np.zeros((H, W), bool); zona[y0:int(H * 0.8), int(W * 0.3):int(W * 0.7)] = True
    m = oscuro(a, 0.62) & zona & ~nariz
    m = cv2.dilate(m.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & zona & ~nariz
    _, _, v = hsv(a)
    return m & (v < 0.85)


def rellenar(a, mascara, crece=2):
    """Rellena la máscara con lo de alrededor (inpaint), sin tocar el alfa."""
    m = cv2.dilate(mascara.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=crece)
    rgb = (a[..., :3] * 255).astype(np.uint8)
    out = cv2.inpaint(rgb, m, 4, cv2.INPAINT_TELEA).astype(np.float32) / 255
    b = a.copy(); b[..., :3] = out
    return b, m.astype(bool)


def recorte(a, mascara, pad=2):
    """La pieza = los píxeles de la máscara, en su caja. Devuelve (pieza, x, y)."""
    ys, xs = np.nonzero(mascara)
    x0, y0 = max(xs.min() - pad, 0), max(ys.min() - pad, 0)
    x1, y1 = min(xs.max() + pad + 1, a.shape[1]), min(ys.max() + pad + 1, a.shape[0])
    p = a[y0:y1, x0:x1].copy()
    m = cv2.GaussianBlur(mascara.astype(np.float32), (3, 3), 0)[y0:y1, x0:x1]
    p[..., 3] = p[..., 3] * np.clip(m * 1.6, 0, 1)
    return p, int(x0), int(y0)


def pie(m):
    """Centro de abajo de una máscara (x, y) en px del webp."""
    ys, xs = np.nonzero(m)
    return float(xs.mean()), float(ys.max())


def nariz_de_boca(a, esp):
    """La nariz que trae encima una boca: la mancha rosa (o café) de arriba."""
    H, W = a.shape[:2]
    if esp in ("conejo", "hamster"):
        base = binary_fill_holes(rosa(a))
    else:
        h, s, v = hsv(a)
        base = (v < 0.5) & (s > 0.25) & (a[..., 3] > 0.3) & ((h < 40) | (h > 330))
    # sin las rayas finas de la boca: la nariz es una mancha llena
    base = cv2.morphologyEx(binary_fill_holes(base).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
    n, lb, st = componentes(base)
    cand = [i for i in range(1, n) if st[i, 1] < H * 0.45 and st[i, 4] > 6]
    if not cand:
        return None
    i = min(cand, key=lambda k: st[k, 1])
    # la nariz entera: el casco convexo de la mancha (con su brillo y su
    # contorno), sin bajar más allá de su punta, para no comerse la boca
    pts = cv2.findNonZero((lb == i).astype(np.uint8))
    casco = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(casco, cv2.convexHull(pts), 1)
    nar = cv2.dilate(casco, np.ones((3, 3), np.uint8), iterations=2).astype(bool)
    ys, _ = np.nonzero(casco)
    nar[ys.max() + 2:, :] = False
    return nar


datos = {}
for esp in ESPECIES:
    d = {}
    cab = cargar(esp, "cabeza")
    nar = nariz_de_cabeza(cab, esp)
    pz, nx, ny = recorte(cab, nar)
    guardar(pz, esp, "nariz")
    d["nariz"] = [nx * 2, ny * 2, pz.shape[1] * 2, pz.shape[0] * 2]
    quitar = nar.copy()
    if esp == "hamster":
        bm = boca_de_hamster(cab, nar)
        bp, bx, by = recorte(cab, bm)
        guardar(bp, esp, "boca_tranquila")
        d["boca_tranquila"] = [bx * 2, by * 2, bp.shape[1] * 2, bp.shape[0] * 2]
        quitar |= bm
    pnx, pny = pie(nar)
    d["pie_nariz"] = [round(pnx * 2, 1), round(pny * 2, 1)]
    nueva, m = rellenar(cab, quitar)
    guardar(nueva, esp, "cabeza")
    if os.path.exists(f"{RAIZ}/{esp}/cabeza_p.webp"):
        p = cargar(esp, "cabeza_p")
        p2, _ = rellenar(p, quitar)
        p2[..., 3] = np.where(m, cab[..., 3], p2[..., 3])
        guardar(p2, esp, "cabeza_p", sin_perdida=True)
        f = cargar(esp, "cabeza_f")
        f[..., 3] = np.where(m, 0, f[..., 3])
        guardar(f, esp, "cabeza_f")
    # las bocas sin su nariz: cuánto correrlas para que cuelguen de la nariz
    d["bocas"] = {}
    for b in BOCAS.get(esp, []):
        a = cargar(esp, b)
        bn = nariz_de_boca(a, esp)
        if bn is None:
            print("  sin nariz:", esp, b); continue
        bx, byy = pie(bn)
        a[..., 3] = np.where(bn, 0, a[..., 3])
        guardar(a, esp, b)
        d["bocas"][b] = [round(bx * 2, 1), round(byy * 2, 1)]
    datos[esp] = d
    print(esp, json.dumps(d))
json.dump(datos, open("/tmp/separar-caras.json", "w"), indent=1)


# ── El hurón: ojos y boca recortados de sus caras enteras ─────────────────
HURON = {"cara_tranquila": ("ojo", None), "cara_feliz": ("feliz", "boca_abierta"),
         "cara_triste": ("triste", "boca_triste"), "cara_racha": ("racha", None)}
hur = {}
for cara, (ojo, boca) in HURON.items():
    a = cargar("huron", cara)
    H, W = a.shape[:2]
    h, s, v = hsv(a)
    al = a[..., 3] > 0.3
    # el antifaz: el café más común de la pieza
    cafe = al & (v > 0.25) & (v < 0.55) & (s > 0.12) & (s < 0.45)
    ref = np.median(a[cafe][:, :3], axis=0)
    dist = np.sqrt(((a[..., :3] - ref) ** 2).sum(2))
    rasgo = al & (dist > 0.16)
    n, lb, st = componentes(rosa(a))
    cand = [i for i in range(1, n) if st[i, 4] > 4 and abs(st[i, 0] + st[i, 2] / 2 - W / 2) < W * 0.15]
    i = min(cand, key=lambda k: st[k, 1])  # la nariz: la mancha rosa más alta del centro
    nx0, ny0, nw, nh = st[i, 0], st[i, 1], st[i, 2], st[i, 3]
    nx1, ny1 = nx0 + nw, ny0 + nh
    sin_nariz = ~cv2.dilate((lb == i).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(bool)
    rasgo &= sin_nariz
    n2, lb2, st2 = componentes(rasgo)
    rasgo &= np.isin(lb2, [k for k in range(1, n2) if st2[k, 4] >= 10])
    oscuros = rasgo & (v < 0.45)
    for lado, (xa, xb) in (("i", (0, nx0 - 1)), ("d", (nx1 + 1, W))):
        zona = np.zeros((H, W), bool); zona[:ny0, xa:xb] = True
        m = oscuros & zona
        ys, xs = np.nonzero(m)
        caja = np.zeros((H, W), bool); caja[max(ys.min() - 2, 0):ys.max() + 3, max(xs.min() - 2, 0):xs.max() + 3] = True
        pz, x, y = recorte(a, caja & rasgo, pad=1)
        guardar(pz, "huron", f"{ojo}_{lado}")
        hur[f"{ojo}_{lado}"] = [x * 2, y * 2]
    if boca:
        zona = np.zeros((H, W), bool); zona[ny1:, max(int(nx0 - nw * 1.6), 0):int(nx1 + nw * 1.6)] = True
        rojo = ((h >= 330) | (h < 30)) & (s > 0.2) & al
        lineas = (oscuros | rojo) & zona
        ys, xs = np.nonzero(lineas)
        caja = np.zeros((H, W), bool); caja[ys.min():ys.max() + 1, xs.min():xs.max() + 1] = True
        m = caja & (oscuros | rojo | (rasgo & (v > 0.85) & binary_fill_holes(cv2.dilate(lineas.astype(np.uint8), np.ones((3, 3), np.uint8)))))
        pz, x, y = recorte(a, m, pad=1)
        guardar(pz, "huron", boca)
        hur[boca] = [x * 2, y * 2]
print("huron caras", json.dumps(hur))


# ── Las medidas nuevas en marionetas-piezas.js (px del kit = 2 × webp) ────
NUEVAS = {e: ["nariz"] for e in ESPECIES}
NUEVAS["hamster"].append("boca_tranquila")
NUEVAS["huron"] += [f"{o}_{l}" for o in ("ojo", "feliz", "triste", "racha") for l in "id"] + ["boca_abierta", "boca_triste"]
js = open("src/mascota/marionetas-piezas.js").read()
for esp, nombres in NUEVAS.items():
    ini = js.index(f"  {esp}: {{")
    cab = js.index("piezas: {", ini) + len("piezas: {")
    for n in nombres:
        w, h = Image.open(f"{RAIZ}/{esp}/{n}.webp").size
        linea = f"\n      {n}: [{w * 2}, {h * 2}, 0],"
        fin = js.index("\n    }", cab)
        bloque = js[cab:fin]
        import re
        if re.search(rf"\n      {n}: \[", bloque):
            js = js[:cab] + re.sub(rf"\n      {n}: \[[^\]]*\],", linea, bloque) + js[fin:]
        else:
            js = js[:cab] + linea + js[cab:]
open("src/mascota/marionetas-piezas.js", "w").write(js)
print("medidas escritas")
