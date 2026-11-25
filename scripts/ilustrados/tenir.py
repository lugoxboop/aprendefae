"""Tiñe un objeto gris recortado (WebP con alfa) a un tono, conservando el
contorno oscuro y los brillos. Uso: tenir.py entrada.webp salida.webp #rrggbb
Lote 3 (25-nov): un solo buzón gris de Gemini, teñido por tributo."""
import sys
from PIL import Image
src, dst, tono = sys.argv[1], sys.argv[2], sys.argv[3].lstrip('#')
t = [int(tono[i:i + 2], 16) / 255 for i in (0, 2, 4)]
im = Image.open(src).convert('RGBA')
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        if lum < 0.3:  # contorno: se queda oscuro
            continue
        k = 0.25 + 0.9 * lum
        brillo = max(0, lum - 0.88) / 0.12  # los brillos blancos siguen blancos
        out = [min(1, c * k) * (1 - brillo) + brillo for c in t]
        px[x, y] = (*[int(v * 255) for v in out], a)
im.save(dst, 'WEBP', quality=90, method=6)
print(dst, im.size)
