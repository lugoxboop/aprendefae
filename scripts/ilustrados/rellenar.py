# Recorte de objetos de Gemini sobre verde croma (guia-estilo-imagenes.md, «Objetos ilustrados»).
# Para objetos con interior verdoso (un billete verde): todo lo que el contorno
# encierra vuelve a ser opaco y su verde se lleva hacia un tono dado.
# uso: rellenar.py pieza.webp [#rrggbb] [original.jpg x0 y0]
# Con el original, el interior se toma de sus píxeles (sin el ruido del recorte).
import sys
from collections import deque
import numpy as np
from PIL import Image

p = sys.argv[1]
tono = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else None  # '-' = conservar los colores del original
im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
h, w = im.shape[:2]
a = im[..., 3]
fuera = np.zeros((h, w), bool)
q = deque()
for x in range(w):
    for y in (0, h - 1):
        if a[y, x] < 128 and not fuera[y, x]:
            fuera[y, x] = True; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if a[y, x] < 128 and not fuera[y, x]:
            fuera[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and not fuera[ny, nx] and a[ny, nx] < 128:
            fuera[ny, nx] = True; q.append((ny, nx))
dentro = ~fuera
if len(sys.argv) > 5:
    o = np.asarray(Image.open(sys.argv[3]).convert('RGB')).astype(np.float32)
    x0, y0 = int(sys.argv[4]), int(sys.argv[5])
    orig = o[y0:y0 + h, x0:x0 + w]
    for c in range(3):
        im[..., c] = np.where(dentro, orig[..., c], im[..., c])
    a = np.where(dentro, 0, a)  # todo el interior se retiñe
if tono:
    t = np.array([int(tono[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
    lum = (im[..., 0] * .3 + im[..., 1] * .59 + im[..., 2] * .11) / 255
    verdoso = dentro & (a < 250)
    for c in range(3):
        im[..., c] = np.where(verdoso, np.clip(t[c] * (0.2 + 0.95 * lum), 0, 255), im[..., c])
im[..., 3] = np.where(dentro, 255, a)
Image.fromarray(im.clip(0, 255).astype(np.uint8), 'RGBA').save(p, quality=88, method=6)
print(p, 'relleno')
