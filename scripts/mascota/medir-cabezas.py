"""
MIDE LA SILUETA DE CADA CABEZA (19-nov) y escribe src/mascota/siluetas-cabeza.js.
Para cada especie: el borde izquierdo y derecho de la cabeza cada 5 % de su
alto, y el tope del cráneo, en px del kit. Con eso los accesorios se ajustan a
la forma real de cada cabeza (no a una caja): el gorro abraza el ancho de la
frente, los audífonos caen a los lados de la cara.

  python3 scripts/mascota/medir-cabezas.py
"""
from PIL import Image
import numpy as np, re, json, pathlib
raiz = pathlib.Path(__file__).resolve().parents[2]
piezas = (raiz / "src/mascota/marionetas-piezas.js").read_text()
out = {}
for esp in ["zorro", "gato", "perro", "hamster", "conejo", "huron", "panda"]:
    kw, kh = map(int, re.search(esp + r": \{[\s\S]*?cabeza: \[(\d+), (\d+)", piezas).groups())
    im = np.array(Image.open(raiz / f"public/mascotas/{esp}/cabeza.webp").convert("RGBA"))
    a = im[:, :, 3] > 60
    h, w = a.shape
    sx, sy = kw / w, kh / h
    bordes = []
    for k in range(21):
        y = min(h - 1, int(round(k / 20 * (h - 1))))
        fila = np.where(a[y])[0]
        bordes.append([round(fila[0] * sx), round(fila[-1] * sx)] if len(fila) else None)
    top = int(np.where(a[:, w // 2])[0][0] * sy)
    out[esp] = {"tope": top, "bordes": bordes}
js = (
    "/*\n * GENERADO por scripts/mascota/medir-cabezas.py: no se edita a mano.\n"
    " * La silueta de cada cabeza en px del kit: `tope` (y del cráneo en el centro)\n"
    " * y `bordes` [x izquierda, x derecha] cada 5 % del alto (21 filas, 0 a 100 %).\n */\n"
    "export const SILUETAS = " + json.dumps(out, separators=(",", ":")).replace('},"', '},\n  "').replace('{"zorro"', '{\n  "zorro"') + ";\n"
)
(raiz / "src/mascota/siluetas-cabeza.js").write_text(js)
print(js[:600])
