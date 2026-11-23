# Guía de estilo de imágenes (Gemini)

Para que todas las imágenes que pidan a Gemini **Gen y los generales (Miku,
Erwin, Magno)** salgan **coherentes entre sí**. Es la referencia fija: antes de
pedir una imagen, el agente lee esta guía y la cumple; cuando cierra la
descripción definitiva de un personaje, la **anota aquí** para que la próxima
vez salga igual.

## Flujo (cualquier agente)
Gen y los generales pueden pedirle imágenes a Gemini desde el navegador de los
agentes, sin que Mateo descargue nada:
1. **Pide** en Gemini con una descripción precisa + el **estilo bloqueado** de
   esta guía (misma paleta de marca, mismo trazo, misma descripción por
   personaje), para que todas salgan iguales.
2. **Mascotas que se animan:** pídelas **por partes** (cabeza, cuerpo, patas,
   cola) o en varias poses, con fondo transparente o liso, **no una foto**.
3. **Descarga** desde Gemini, saca la imagen de `Descargas/Imagenes-agentes`,
   **revísala** (que se vea bien y respete el estilo) y **súbela** al proyecto
   con un nombre claro.
4. Si **Gemini falla** o la página cambia: reintenta 2 veces; si sigue, avisa en
   una línea y sigue con otra tarea.
5. En lo **animado**, se mantiene la regla de evidencia visual (video a 320 y
   375 px, verificador aparte).

## Reglas fijas para todas las imágenes
- **Paleta:** la del kit de marca (`orquestador/conocimiento/marca-planck.md`):
  grafito `#121418`, azul `#2747F5` (claro) / `#6F86FF` (oscuro); **coral solo
  para error**, nunca de relleno. Nada de clichés de gamificación (trofeos,
  coronas, cofres, gemas).
- **Trazo:** el mismo estilo de línea y acabado en todas (defínelo una vez abajo
  y no lo cambies entre personajes).
- **Fondo:** transparente o liso, **nunca una foto o una escena cargada**.
- **Fidelidad:** una imagen nunca puede implicar algo conceptualmente falso del
  tema (regla del Kit).

## Mascotas que se animan (marionetas)
Las 7 especies son marionetas de piezas (ver `src/mascota/marionetas.js`): se
animan por partes. Por eso, para una mascota:
- Pide el personaje **por partes** (cabeza, cuerpo, patas, cola) **o** en varias
  poses, con **fondo transparente o liso** — **no una sola foto**.
- Cada parte/pose debe encajar con las demás (misma escala, mismo trazo, misma
  paleta de la especie).

### Las 7 especies
Panda · conejo · hurón · zorro · gato · perro · hámster.

La descripción visual exacta de cada especie (proporciones, pelaje, rasgos)
vive hoy en `src/mascota/marionetas.js` y `public/mascotas/`. Aquí Gen deja, por
especie, la **descripción bloqueada** que le pasa a Gemini (una vez la fija),
para que no cambie entre pedidos:

| Especie | Descripción bloqueada para Gemini (Gen la llena al fijarla) |
|---|---|
| Panda |  |
| Conejo |  |
| Hurón |  |
| Zorro |  |
| Gato |  |
| Perro |  |
| Hámster |  |

## Elenco de Macroeconomía 2026 (fijado por Gen el 23-nov)

Los personajes de las piezas `da26-`, `pe26-`, `pf26-`, `pm26-` y `pc26-`.
Sus nombres dicen **qué son**, nunca qué opinan: por eso la cara es
**neutra** (sin sonrisa ni ceño). Una expresión podría regalar la respuesta.

### Estilo bloqueado (se pega igual al inicio de cada pedido)
> Ilustración vectorial plana de un solo personaje, de cuerpo entero, de pie y
> de frente, ligeramente de tres cuartos. Proporciones adultas realistas pero
> simplificadas (cabeza = 1/7 del cuerpo), universitario, nada infantil.
> Contorno uniforme y redondeado de grosor medio en azul muy oscuro #121418.
> Rellenos planos, sin degradados, sin sombras, sin texturas. Paleta
> restringida: azul #2747F5, azul claro #6F86FF, gris azulado #C9D1E4, blanco
> #FFFFFF, piel en tonos planos variados. Sin rojo ni coral. Expresión facial
> neutra y tranquila, boca recta, sin sonrisa ni ceño. Sin texto, sin logos,
> sin marcas. Fondo blanco liso #FFFFFF, sin suelo ni sombra proyectada, con
> margen alrededor. Formato cuadrado.

Gen quita el fondo blanco al revisar y guarda un PNG transparente. El blanco
del personaje no se pierde porque queda encerrado por el contorno.

### Descripción bloqueada por personaje (se agrega tras el estilo)
| Archivo | Personaje | Descripción para Gemini | Dónde aparece |
|---|---|---|---|
| `empresario.png` | El empresario | Hombre de unos 45 años, camisa azul #2747F5 remangada y pantalón gris azulado. Sostiene un periódico doblado bajo el brazo. | T1 H4 |
| `analista.png` | La analista | Mujer de unos 30 años, cabello recogido, blazer azul claro #6F86FF y blusa blanca. Sostiene una libreta abierta y un lápiz. | T1 H5 |
| `autoridad-economica.png` | La autoridad económica | Persona de unos 50 años, de género ambiguo, traje sobrio gris azulado y corbata azul #2747F5. Sostiene una carpeta cerrada. | T2 A5 |
| `profesor.png` | El profesor | Hombre de unos 55 años con gafas, suéter azul #2747F5 sobre camisa blanca. Una mano levantada, como quien hace una pregunta. | T3 H |
| `familia.png` | Familia | Una madre, un padre y una niña de unos 8 años, de pie juntos. Ropa casual en azul, azul claro y blanco. | T3 A |
| `inversionista.png` | Inversionista | Mujer de unos 40 años, traje azul #2747F5, sostiene una tableta. | T3 A, T5 |
| `exportadora-flores.png` | Exportadora de flores | Mujer de unos 35 años, delantal azul claro #6F86FF, carga una caja de cartón abierta con flores blancas y azules. | T5 H4, T5 A |
| `importadora-celulares.png` | Importadora de celulares | Hombre de unos 30 años, chaqueta gris azulada, carga una caja de cartón con celulares. | T5 H4, T5 A |
| `viajero.png` | Viajero | Persona joven con mochila y maleta de ruedas azul #2747F5. | T5 A |
| `deudor-externo.png` | Quien paga deuda externa | Hombre de unos 50 años, camisa blanca y corbata azul, sostiene un sobre grande. | T5 A |

Se guardan en `public/macro2026/personajes/`. Pesan como máximo 120 KB cada
uno y miden 512 × 512 px.

## Dónde quedan las imágenes
- Gemini descarga a la carpeta **Descargas/Imagenes-agentes** del computador.
- Gen revisa la imagen (que se vea bien y respete esta guía) y la sube al
  proyecto con un **nombre claro** (p. ej. `panda-cabeza.png`, `zorro-pose-saludo.png`).
- **Derechos de autor:** a este repositorio (público) van las imágenes propias
  generadas; nunca los originales de terceros.
