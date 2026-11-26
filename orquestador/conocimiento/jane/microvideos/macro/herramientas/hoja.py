"""Hoja de contacto: junta los cuadros de una carpeta en una rejilla con su tiempo.
Uso: python3 herramientas/hoja.py <carpeta> <salida.jpg> [columnas]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1:3]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
fs = sorted(glob.glob(os.path.join(d, "t*.jpg")))
ims = [Image.open(f) for f in fs]; w, h = ims[0].size
S = Image.new("RGB", (cols * w, ((len(ims) + cols - 1) // cols) * (h + 22)), "white"); dr = ImageDraw.Draw(S)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * w, (i // cols) * (h + 22); S.paste(im, (x, y)); dr.text((x + 4, y + h + 4), os.path.basename(f)[1:-4] + " s", fill="black")
S.save(out, quality=85); print(out, S.size)
