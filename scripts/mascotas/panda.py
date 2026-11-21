"""
El panda, séptima mascota (21-nov). Mateo: «pídele a Gemini diseños para hacer
un panda e integrarlo». Gemini dibujó tres hojas en «Chibi Fox Model Sheet»:
el personaje, las piezas del cuerpo y las de la cara.

  python3 scripts/mascotas/recortar.py cuerpo.jpg '{"0":"torso","1":"cabeza","2":"bc_d","3":"oreja_i","4":"oreja_d","5":"bc_i","6":"cola"}' <recortes>
  python3 scripts/mascotas/recortar.py cara.jpg '{"0":"ojo_i","1":"ojo_d","2":"feliz_i","3":"feliz_d","5":"triste_i","6":"triste_d","8":"racha_i","7":"racha_d","9":"boca_sonrisa","10":"boca_abierta","12":"lagrima","13":"boca_triste"}' <recortes>
  python3 scripts/mascotas/panda.py <recortes> public/mascotas/panda

Lo distinto del panda: lo que se TIÑE es lo negro (orejas, manchas de los
ojos, hombros, brazos y piernas), no lo blanco. Con «chocolate» sale un panda
café y blanco, como el panda de Qinling, que existe de verdad. El blanco, el
contorno, los rubores y la cara no cambian.

Escribe cada pieza al 50 % (original, _p en grises sin pérdida, _f fijo) y
añade el bloque `panda` a src/mascota/marionetas-piezas.js (o lo reemplaza).
"""
import json, os, shutil, sys
import cv2, numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
K = 0.5
CUERPO = "torso cabeza oreja_i oreja_d cola bc_d bc_i".split()
CARA = "ojo_i ojo_d feliz_i feliz_d triste_i triste_d racha_i racha_d boca_sonrisa boca_abierta boca_triste lagrima".split()
# La cara de Gemini vino grande para la cabeza: cada pieza se reduce a su
# tamaño sobre las manchas (los ojos, al ancho de la mancha: 85 px). Los brazos
# y la colita también venían grandes; el derecho, además, más corto: los dos
# quedan de 164 px.
ESCALA = {"ojo_i": .72, "ojo_d": .72, "triste_i": .72, "triste_d": .72, "racha_i": .72, "racha_d": .72,
          "bc_d": .75, "bc_i": .815, "cola": .7,
          "feliz_i": .8, "feliz_d": .8, "boca_sonrisa": .5, "boca_abierta": .5, "boca_triste": .45, "lagrima": .35}
# Los ojos cerrados son una rayita café: sobre la mancha negra no se verían.
# En el panda van color crema, como el blanco de su cara.
CLAROS = ("feliz_i", "feliz_d")
os.makedirs(OUT, exist_ok=True)


def guardar(arr, path, w, h, sin_perdida=False):
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8), "RGBA").resize(
        (max(1, round(w * K)), max(1, round(h * K))), Image.LANCZOS)
    if sin_perdida:
        im.save(path, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(path, "WEBP", quality=82, method=6)


piezas, Ls = {}, []
for n in CUERPO + CARA:
    im = Image.open(f"{SRC}/{n}.png").convert("RGBA")
    if n in ESCALA:
        im = im.resize((round(im.width * ESCALA[n]), round(im.height * ESCALA[n])), Image.LANCZOS)
    a = np.array(im).astype(np.float32) / 255
    if n in CLAROS:
        a[..., :3] = np.array([0.98, 0.95, 0.88])
    H, W = a.shape[:2]
    al = a[..., 3]
    mx, mn = a[..., :3].max(2), a[..., :3].min(2)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    guardar(a, f"{OUT}/{n}.webp", W, H)
    tin = False
    if n in CUERPO:
        # El pelo negro: gris oscuro y sin color. El contorno es más negro (v < .13).
        fur = (mx > .13) & (mx < .6) & (s < .25) & (al > .5)
        fur = cv2.morphologyEx(fur.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
        tin = fur.sum() > 40
    if tin:
        L8 = cv2.medianBlur((L * 255).astype(np.uint8), 5).astype(np.float32) / 255
        L = np.where(cv2.erode(fur.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0, L8, L)
        L = cv2.bilateralFilter(L.astype(np.float32), 9, 0.06, 5)
        bajo = cv2.dilate(fur.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool) & (mx > .1)
        p = np.dstack([L, L, L, al * bajo])
        f = a.copy(); f[..., 3] = al * ~bajo
        guardar(p, f"{OUT}/{n}_p.webp", W, H, True)
        guardar(f, f"{OUT}/{n}_f.webp", W, H)
        Ls.append(L[fur & (al > .9)])
    piezas[n] = [int(W), int(H), 1 if tin else 0]

# La llama de la racha es la misma de todas: la del perro.
shutil.copy(os.path.join(os.path.dirname(OUT), "perro", "llama.webp"), f"{OUT}/llama.webp")
piezas["llama"] = [74, 88, 0]

Ls = np.concatenate(Ls)
c1, c2 = float(np.quantile(Ls, .5)), float(np.quantile(Ls, .97))
rampa = [round(x, 3) for x in (c1 * .55, c1 * .8, c1, max(c2, c1 + .06))]

js_path = "src/mascota/marionetas-piezas.js"
lineas = open(js_path).read().rstrip("\n").split("\n")
if "  panda: {" in lineas:
    ini = lineas.index("  panda: {")
    fin = lineas.index("  },", ini)
    del lineas[ini:fin + 1]
bloque = ["  panda: {", f"    rampa: {json.dumps(rampa)},", "    piezas: {"]
bloque += [f"      {k}: {json.dumps(v)}," for k, v in piezas.items()]
bloque += ["    },", "  },"]
cierre = len(lineas) - 1 - lineas[::-1].index("};")
lineas[cierre:cierre] = bloque
open(js_path, "w").write("\n".join(lineas) + "\n")
print(rampa, len(piezas), "piezas", round(sum(os.path.getsize(f"{OUT}/{f}") for f in os.listdir(OUT)) / 1024), "KB")
