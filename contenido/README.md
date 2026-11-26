# contenido/ — el pipeline de Instagram de Nino

Todo lo mecánico del Instagram de AprendeFAE vive aquí: voz, render, subida, publicación,
métricas y tendencias. Nino piensa lo creativo y revisa; los scripts hacen el resto.

## Dónde corre (y por qué)

| Paso | Dónde | Por qué |
|---|---|---|
| Voz (ElevenLabs), bucket y subida (Supabase), publicar y métricas (Meta) | **GitHub Actions** (`.github/workflows/contenido.yml`) | El shell de la nube de Claude **no tiene salida** a `api.elevenlabs.io`, a `*.supabase.co` ni a `graph.facebook.com` (medido el 2026-11-26: el proxy los rechaza). Actions sí, y ahí viven los secretos. |
| Animar y revisar cuadro por cuadro | **Shell de la nube** (o cualquier PC) | Remotion y Chromium funcionan local; así se itera rápido sin gastar Actions. |
| Render final | **Actions** (el mismo código) | Para subir el mp4 al bucket sin que pase por el repositorio. |

Los videos terminados **nunca** van al repositorio: van al bucket público `instagram-publico`.
La voz (mp3 + `tiempos-<voz>.json`) sí se guarda en la rama: es la fuente de la pieza y pesa poco.

## Cómo se pide un trabajo

Se edita `contenido/pedido.json` y se empuja (a una rama `claude/**` o a `main`):

```json
{ "n": 7, "pieza": "prueba-01", "voz": "jessica", "acciones": ["voz", "render", "subir"] }
```

- `n` es solo un contador: cámbialo para volver a disparar el mismo pedido.
- `acciones`, en este orden: `diagnostico` (qué secretos existen y qué permisos tiene la clave de voz),
  `voces` (renueva la lista de voces de confianza), `bucket` (crea el bucket si falta), `voz`,
  `render` (mp4 + portada), `subir` (al bucket; el enlace queda en el resumen del run y en `registro/`).
- `voz`: alias de la lista de confianza (`voz.json`) o `todas` para generar la pieza con cada voz y comparar.
- Cuando el workflow esté en `main`, también se lanza a mano desde la pestaña Actions (workflow_dispatch).

Lo generado vuelve solo a la rama en un commit de `nino-contenido[bot]`: hay que hacer `git pull`.

## Los scripts (`contenido/scripts/`, Node 20+, sin dependencias)

| Script | Qué hace |
|---|---|
| `voces.mjs [--nombres "A,B"]` | Con `--nombres` fija las voces que eligió Mateo (en `pedido.json`: `voces_nombres`). Sin él, lista las voces **en tendencia** de la biblioteca de ElevenLabs (español latino), elige 3 (al menos una de mujer), las agrega a la cuenta y las deja en `voz.json`. Sin el permiso `voices_read` deja 3 prediseñadas provisionales. |
| `voz.mjs <pieza> [alias\|todas]` | Sin alias, **rota** entre las voces de confianza (cada pieza nueva usa la siguiente; Mateo, 26-nov). Genera el guion **completo en una sola llamada** a `with-timestamps`, y escribe `estudio/public/voz/<pieza>-<alias>.mp3` y `estudio/src/piezas/<pieza>/tiempos-<alias>.json` (inicio y fin de cada frase y palabra). Comprueba que el final no se cortó. Si el guion no cambió, no gasta cupo. Prueba los modelos de `voz.json` en cascada (hoy: `eleven_v3`, luego `eleven_multilingual_v2`). |
| `cupo.mjs` | Caracteres usados del mes; aviso al 80 %. Necesita el permiso `user_read`. |
| `bucket.mjs` | Crea el bucket público `instagram-publico` (máx. 50 MB, solo mp4/jpg/png). Idempotente. |
| `subir.mjs <archivo> <ruta>` | Sube al bucket y comprueba que el enlace público responde. |
| `publicar.mjs <url.mp4> <pie.txt>` | Publica un Reel por la Graph API: contenedor → espera → publicar → comprobar. 3 intentos. **Esperando a Meta.** |
| `metricas.mjs` | Métricas por pieza a 24 h, 72 h y 7 días + seguidores → `metricas/`. **Esperando a Meta.** |
| `tendencias.mjs` | Hashtags (`ig_hashtag_search` → `top_media`, tope 30/semana) y Business Discovery de `tendencias/fuentes.json`. **Esperando a Meta.** |

Claves (solo como secretos de GitHub, nunca en el repo ni en un mensaje): `ELEVENLABS_API_KEY`,
`VITE_SUPABASE_URL` + `SUPABASE_ACCESS_TOKEN` (de ahí se obtiene la clave de servicio, enmascarada),
y cuando llegue Meta: `IG_ACCESS_TOKEN`, `IG_USER_ID`.

## El estudio (`contenido/estudio/`, Remotion)

Parte del motor de Jane (`orquestador/conocimiento/jane/microvideos/macro/`), **copiado** en
`src/comun/` para que los cambios de las clases no rompan el Instagram. Añadidos de Nino:
`Reel.jsx` (subtítulos de 1-4 palabras con la palabra que suena en mango, dentro de la zona segura;
plantilla de zonas con la prop `zonas`), y en `tiempo.js` las opciones `recorta` (quita los
silencios largos de la voz) y `ritmo` (acelera la voz sin cambiar el tono).

```sh
cd contenido/estudio && npm install
python3 sonido/sintetiza.py                       # música original (lofi.wav), sin licencia que pagar
ZONAS=1 node cuadros.mjs prueba-01 cuadros/a 1    # cuadros cada 1 s con la plantilla de zonas seguras
python3 herramientas/hoja.py cuadros/a cuadros/hoja.jpg 8
node render.mjs prueba-01 salida/prueba-01.mp4    # Reel completo
node portada.mjs prueba-01 salida/portada.jpg 0.6 # portada
```

Cada pieza es una carpeta `src/piezas/<id>/` con `guion.txt` (una frase = una escena),
`tiempos-<voz>.json` (lo genera la voz), `tiempos.js` (qué voz usa) y `Video.jsx`; se registra en `src/index.jsx`.
Efectos: los sintetizados del motor de Jane (`public/sfx/`, originales). Mascotas: `public/mascotas` del sitio.

## Pendiente

- **Permisos de la clave de ElevenLabs**: hoy solo puede generar voz. Para elegir voces por tendencia y
  vigilar el cupo necesita `voices_read`, `voices_write`, `models_read` y `user_read`.
- **Meta**: token y `IG_USER_ID` como secretos; luego `publicar`, `metricas` y `tendencias` se prueban de verdad.
- La rutina programada (6:30 radar, 7:30 ideas, noche métricas, lunes informe) la monta el coordinador.
