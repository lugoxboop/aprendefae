---
id: microvideo-ley-demanda
titulo: Microvideo de prueba — La ley de la demanda (Macroeconomía)
procedencia: encargo de Mateo, 2026-11-25; Jane
estado: v2 en revisión de Mateo. NO publicado, no visible a estudiantes.
---

# La ley de la demanda (prueba)

- **Video:** no vive en el repo. Está en el almacenamiento del proyecto:
  `/mnt/project-files/jane/microvideos/ley-demanda-v2.mp4` (1080 × 1920, 30 fps, 44 s, H.264 + AAC).
- **Una idea:** si el precio sube, baja la cantidad demandada (ceteris
  paribus); y eso es moverse **sobre** la curva, no mover la curva.
- **Fuente:** el material de Macro 2026 del profesor (fichas 1–5) no trae la
  ley de la demanda micro; la definición sigue el manual estándar (Mankiw,
  *Principios de economía*, cap. 4, en paráfrasis: con todo lo demás constante,
  si sube el precio de un bien, baja su cantidad demandada). **Pendiente:**
  confirmar con la fuente del profesor si el curso la trae. Conecta con la ficha 1,
  G7 (giros y desplazamientos de la curva de DA) y su ejercicio *ceteris paribus*.

## Los datos (una sola recta: P = 3.500 − 500·Q)

| Precio | Compradores con mango (Q) |
|---|---|
| $1.000 | 5 |
| $2.000 | 3 |
| $3.000 | 1 |
| $1.500 | 4 |

## Guion en cadena (cada frase = una escena)

| s | Voz | Lo que se ve |
|---|---|---|
| 0,3 | Si el mango sube, ¿lo queremos menos? | **Gancho.** El letrero salta de $1.000 a $3.000; las cinco mascotas miran el letrero. |
| 2,8 | Lo queremos igual. | Miran los mangos del mostrador, que brillan: las ganas no cambian. |
| 4,2 | Pero compramos menos. | Cuatro dan un paso atrás y se apagan; queda una. |
| 6,5 | A mil pesos, cinco compradores se llevan un mango cada uno. | El hurón vendedor voltea el letrero a $1.000; vuelven las cinco y cada una recibe su mango. Aparece el punto (5; $1.000). |
| 10,8 | Sube a dos mil. Dos se retiran. Se venden tres mangos. | Letrero a $2.000; panda y perro se van. El punto baja por la recta a (3; $2.000) y deja el anterior marcado. |
| 15,5 | A tres mil pesos, solo compra uno. | $3.000; zorro y coneja se van; queda la gata. Punto (1; $3.000). |
| 18,4 | Baja a mil quinientos, y vuelven: cuatro mangos. | $1.500; vuelven zorro, panda y perro con mango. Punto (4; $1.500). |
| 22,3 | Unimos los puntos: esa es la curva de demanda. Baja hacia la derecha. | El mercado se atenúa; la recta une los cuatro puntos, aparece «D», una flecha recorre la curva hacia abajo. |
| 27,5 | Precio más alto, menor cantidad demandada, si todo lo demás sigue igual: la ley de la demanda. | El punto sube a $3.000: flecha ↑ en el precio, ← en la cantidad; rótulos «ceteris paribus» y «Ley de la demanda». |
| 34,3 | Ojo, el precio no movió la curva. Nos movimos sobre ella. | La curva late en su sitio; el punto se desliza por ella de un extremo a otro. |
| 38,5 | En la actividad, decides tú: ¿se mueve la curva, o te mueves sobre ella? | Vuelve el mercado completo; dos tarjetas: una curva que se desplaza / un punto que se mueve sobre la curva. |

Los tiempos salen del audio medido (`fuente/src/frases.json`), no de cálculo.

## Checklist del microvideo

- [x] Una sola idea
- [x] Gancho en los primeros 3 s (la pregunta termina en 2,4 s)
- [x] Cada frase = una escena
- [x] Las mascotas actúan, el narrador explica (ninguna habla)
- [x] Subtítulos sincronizados (tiempo medido por frase; voz transcrita y comparada)
- [x] Nada conceptualmente falso (cuatro pares sobre una sola recta de pendiente negativa; el precio mueve el punto, no la curva)
- [x] Dentro de la marca (tokens oscuros de Macro 2026, Sora + Inter, sin coral, sin clichés)
- [x] Revisado cuadro por cuadro a 320 y 375 px, y verificado por otro agente
- [x] Conecta con la actividad del tema (cierre: ¿se mueve la curva o te mueves sobre ella?)

## Cómo se reconstruye

```sh
cd fuente && npm install
node gen-mascotas.mjs           # SVG de las marionetas del repo → src/mascotas.json
cp -r ../../../../../../public/mascotas public/   # piezas de las mascotas
# voz: ver ../../voz-narrador.md; luego, desde fuente/voz:
python3 tts2.py ef_dora ../public/audio 1.0 && cp ../public/audio/frases.json ../src/
# fuentes: copiar a public/fonts los woff2 de @fontsource/inter (500, 600, 700) y @fontsource/sora (600, 700)
npx remotion render src/index.jsx LeyDemanda salida/ley-demanda.mp4 --codec=h264 --crf=20 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

Herramientas: Remotion 4 (gratis para empresas de hasta 3 personas), voz
Kokoro-82M (Apache-2.0, ver `../../voz-narrador.md`).
