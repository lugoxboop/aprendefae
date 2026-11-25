# Recorte de una HOJA de Gemini (varios objetos sobre verde croma) en piezas.
# uso: hoja.py hoja.jpg salida_base [filas]   -> salida_base-1.webp, -2.webp ... (izq→der, arriba→abajo)
import sys
import numpy as np
from PIL import Image
src, base = sys.argv[1], sys.argv[2]
filas = int(sys.argv[3]) if len(sys.argv) > 3 else 1
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
R, G, B = im[..., 0], im[..., 1], im[..., 2]
d = G - np.maximum(R, B)
lo, hi = 25, 140
a = 1 - np.clip((d - lo) / (hi - lo), 0, 1)
G2 = np.minimum(G, np.maximum(R, B) + np.clip(d, 0, lo))
rgba = np.dstack([R, G2, B, a * 255]).clip(0, 255).astype(np.uint8)
mask = a > 0.5

def tramos(v, minimo=6, hueco=8):
    """Tramos con contenido a lo largo de un eje, separados por huecos vacíos."""
    out, ini, vacio = [], None, 0
    for i, x in enumerate(v):
        if x:
            if ini is None: ini = i
            vacio = 0
        elif ini is not None:
            vacio += 1
            if vacio >= hueco:
                fin = i - vacio + 1
                if fin - ini >= minimo: out.append((ini, fin))
                ini, vacio = None, 0
    if ini is not None and len(v) - ini >= minimo: out.append((ini, len(v)))
    return out

n = 0
cajas = []
filas_t = tramos(mask.sum(1) > 2) if filas > 1 else [(0, mask.shape[0])]
for (y0, y1) in filas_t:
    for (x0, x1) in tramos(mask[y0:y1].sum(0) > 2):
        sub = mask[y0:y1, x0:x1]
        ys = np.where(sub.sum(1) > 0)[0]
        pieza = Image.fromarray(rgba[y0 + ys[0]:y0 + ys[-1] + 1, x0:x1], 'RGBA')
        n += 1
        pieza.save(f'{base}-{n}.webp', quality=88, method=6)
        cajas.append([int(x0), int(y0 + ys[0]), int(x1), int(y0 + ys[-1] + 1)])
        print(f'{base}-{n}.webp', pieza.size)
import json
json.dump(cajas, open(f'{base}-cajas.json', 'w'))
