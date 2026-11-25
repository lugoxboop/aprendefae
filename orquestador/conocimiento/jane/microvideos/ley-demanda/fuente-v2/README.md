# «El mango de Toby» — fuente del microvideo (estándar de video v2)

Remotion 4, vertical 1080 × 1920, 30 fps, 74,8 s. **No está publicado**: el MP4
se entrega a Mateo para aprobar y vive en
`/mnt/project-files/jane/microvideos/ley-demanda-v2/`, nunca en el repo.

## Cómo se arma

```sh
npm install
node gen-mascotas.mjs               # src/mascotas.json (marionetas del repo)
cp -r ../../../../../../public/mascotas public/mascotas
python3 sonido/sintetiza.py 76      # public/sfx/*.wav (efectos y música)
# public/audio/narracion.mp3: la voz de Brian (ElevenLabs), ver ../../../voz-narrador.md
node cuadros.mjs /tmp/cuadros 2 10 30 60    # cuadros sueltos para revisar
node render.mjs salida/el-mango-de-toby.mp4
```

## Dónde está cada cosa

| Archivo | Qué tiene |
|---|---|
| `src/tiempos.json` | La voz medida con faster-whisper: inicio y fin de cada frase y de cada palabra. |
| `src/tiempo.js` | Convierte la voz en la línea de tiempo del video (pausas entre frases, subtítulos). |
| `src/guion.js` | La partitura: cortes entre planos, precios, mangos que caen, efectos de sonido. |
| `src/Escenas.jsx` | Los cuatro planos: gancho, calle, puesto de Rufo y pizarra grande. |
| `src/Video.jsx` | Transiciones, rótulo del día, subtítulos, voz, música con *ducking* y efectos. |
| `sonido/sintetiza.py` | Efectos y música hechos por código (originales, sin licencia de terceros). |
| `public/art/` | Fondos y objetos dibujados con Gemini (calle, puesto, camión, canasta, mango, jugo, monedas). |

## Lo que hay que saber

- **Datos:** 5, 3, 1 y 4 mangos a $1.000, $2.000, $3.000 y $1.500. Los cuatro
  puntos caen en la recta P = 3.500 − 500·Q. La recta nunca se mueve; se mueve
  el mango sobre ella.
- **Voz:** plan gratuito de ElevenLabs, sin licencia comercial. Lleva el crédito
  «Voz: elevenlabs.io». Antes de publicar a estudiantes se avisa a Mateo.
- **Sonido:** Pixabay y Freesound están bloqueados desde la nube, así que los
  efectos y la música se sintetizan en `sonido/sintetiza.py`.
- La narración original salió sin la última pregunta (el cuadro de texto la
  cortó); se regrabó solo esa frase y se empalmó en el segundo 63,17.
