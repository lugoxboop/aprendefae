# Recorte de objetos de Gemini sobre verde croma (guia-estilo-imagenes.md, «Objetos ilustrados»).
# uso: croma.py entrada salida.webp [alto_px] [k_bajo] [k_alto]
import sys
import numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
alto = int(sys.argv[3]) if len(sys.argv) > 3 else 0
lo = float(sys.argv[4]) if len(sys.argv) > 4 else 25
hi = float(sys.argv[5]) if len(sys.argv) > 5 else 140
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
R, G, B = im[..., 0], im[..., 1], im[..., 2]
d = G - np.maximum(R, B)
a = 1 - np.clip((d - lo) / (hi - lo), 0, 1)
G2 = np.minimum(G, np.maximum(R, B) + np.clip(d, 0, lo))  # despill
out = np.dstack([R, G2, B, a * 255]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(out, 'RGBA')
bbox = img.getchannel('A').point(lambda v: 255 if v > 120 else 0).getbbox()
img = img.crop(bbox)
if alto:
    w = round(img.width * alto / img.height)
    img = img.resize((w, alto), Image.LANCZOS)
img.save(dst, quality=88, method=6)
print(dst, img.size)
