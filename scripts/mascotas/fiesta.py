"""
Piezas de FIESTA (20-nov): objetos que la mascota sostiene y caras nuevas.

Mateo: «necesitamos muchas animaciones». Gemini dibujó dos hojas comunes a
las seis especies (conversación «Chibi Fox Model Sheet»):
  objetos.jpg  micrófono, globo, trofeo, birrete, cornetín, banderita, maraca, megáfono
  caras.jpg    boca cantando, boca de risa, boca de asombro, ojos guiñando (> y <),
               ojo con brillo, ojos de corazón, ojos de estrella, rubores

  python3 scripts/mascotas/fiesta.py <carpeta-con-las-hojas> public/mascotas/fiesta

Escribe cada pieza al 50 % (como las demás) y src/mascota/fiesta-piezas.js con
su tamaño en px de la hoja. No se tiñen: son iguales para todas las especies.
"""
import json, os, sys
import cv2, numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes

SRC, OUT = sys.argv[1], sys.argv[2]
K = 0.5
HOJAS = {
    "objetos.jpg": ["microfono", "globo", "trofeo", "birrete", "cornetin", "banderita", "maraca", "megafono"],
    "caras.jpg": ["boca_o", "boca_risa", "boca_asombro", "guino_i", "guino_d", "ojo_brillo",
                  "corazon_i", "corazon_d", "estrella_i", "estrella_d", "rubor_i", "rubor_d"],
}
os.makedirs(OUT, exist_ok=True)
medidas = {}
for hoja, nombres in HOJAS.items():
    im = cv2.imread(os.path.join(SRC, hoja)).astype(np.float32)
    d = 255 - im.min(axis=2)
    m = cv2.morphologyEx((d > 20).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    ids = sorted([i for i in range(1, n) if st[i, 4] > 150], key=lambda i: (st[i, 1] // 120, st[i, 0]))
    assert len(ids) == len(nombres), f"{hoja}: {len(ids)} piezas, se esperaban {len(nombres)}"
    for nombre, i in zip(nombres, ids):
        x, y, w, h = st[i, :4]
        p = 6
        x0, y0, x1, y1 = max(0, x - p), max(0, y - p), x + w + p, y + h + p
        comp = lab[y0:y1, x0:x1] == i
        f = binary_fill_holes(comp)
        lleno = cv2.dilate(f.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        dentro = cv2.erode(f.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        # Los rubores son difuminados: su borde suave es el alfa, no un contorno.
        suave = nombre.startswith("rubor")
        a = np.clip(d[y0:y1, x0:x1] / (60.0 if suave else 90.0), 0, 1) * lleno
        if not suave:
            a = np.where(dentro, 1.0, a) * lleno
        c = im[y0:y1, x0:x1]
        aa = np.maximum(a, 1e-3)[..., None]
        col = np.clip((c - (1 - aa) * 255) / aa, 0, 255)
        rgba = np.dstack([col[..., ::-1], a * 255]).astype(np.uint8)
        H, W = rgba.shape[:2]
        Image.fromarray(rgba, "RGBA").resize((max(1, round(W * K)), max(1, round(H * K))), Image.LANCZOS) \
            .save(f"{OUT}/{nombre}.webp", "WEBP", quality=86, method=6)
        medidas[nombre] = [int(W), int(H)]

js = ["/*", " * GENERADO por scripts/mascotas/fiesta.py: no se edita a mano.",
      " * Las piezas de fiesta (objetos y caras nuevas), comunes a las seis especies:",
      " * tamaño en px de la hoja de Gemini [ancho, alto]. Viven en public/mascotas/fiesta/.",
      " */", "export const FIESTA = {"]
js += [f"  {k}: {json.dumps(v)}," for k, v in medidas.items()]
js.append("};")
open("src/mascota/fiesta-piezas.js", "w").write("\n".join(js) + "\n")
print(json.dumps(medidas))
