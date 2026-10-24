DISEÑO: Medición de los titulares, apoyos y rótulos de Futaba — las 44 pantallas de T1

De: Mai · 24-oct-2026 · Para Sakuta, Kaede y Futaba. Material medido:
`fichas/b-t1-aprender-titulares-futaba.md` (24-oct), leído de una pasada. Marco de referencia:
`fichas/b-t1-aprender-secuencia-forma-mai.md` §2.

## 0 · Dónde y con qué medí

Réplica del cromo de la vista armada con el `src/` de main (el zip no trae `package.json`, así que
no corrí la app), Chromium headless con Playwright, Inter y Sora de @fontsource 5.3.0, **320×568 y
375×667**. Cada texto medido en su zona y a su ancho real: titular Sora 17/700 en 258 y 313 px;
apoyo y pasos Inter 14/22; razón Inter 12/16; rótulos Inter 13/600 dentro de un botón de 44 con
relleno de 8 × 10 y borde de 2. **Desplazamiento real = alto del documento − ventana − 69** (el
bloque pegado es `sticky` y siempre está a la vista). Lo medí yo, hoy.

## 1 · El resultado, de una

**Los 44 titulares caben en dos renglones y los 43 apoyos, los 15 pasos y las 4 razones caben en
tres, a los dos anchos.** Futaba cumplió los tres topes. **Todo lo que falla son rótulos, y falla
solo a 320**, salvo uno que falla también a 375. Son cinco rótulos y las cuatro pantallas de
capa 4.

| | Medidos | Se pasan |
|---|---|---|
| Titulares | 44 | 0 |
| Apoyos | 43 | 0 |
| Textos de paso | 15 | 0 |
| Razones y pies | 4 | 0 |
| Rótulos de parada (fila de tres) | 30 | **5** |
| Rótulos de parada (fila de dos) | 6 | 0 |
| Frases de capa 4 | 16 | **las 4 pantallas** |

## 2 · Lo que no cabe, con la medida y el texto más largo que sí cabe

Todo está medido, también lo que propongo. La columna de la fila de tres mide **80,7 px a 320**
(hueco de texto 60,7) y **99 a 375** (79,0). El alto del bloque lo fija **el rótulo más alto**, y
el tope es **54 px, dos renglones** (§3.1).

| Pantalla | Lo que no cabe | Qué pasa, medido | Lo más largo que sí cabe (medido) |
|---|---|---|---|
| **a1 · 9** | «Los administradores» | **Se sale de la columna a 320 y a 375:** la palabra «administradores» mide **102 px** y el hueco es de 60,7 / 79,0. El texto se desborda del botón | **«Los jefes»** (44 px, un renglón). Es la palabra que ya usa la pieza: el titular de a1·10 es «Los jefes deciden». Segunda opción: «Los que mandan» (54, dos renglones) |
| **a3 · 8** | «La película: todo el año» | **88 px, cuatro renglones.** El bloque se va a 88 y la pantalla se desplaza **67 px** (tope 40) | **«La película»** (54, dos renglones). También cabe «Todo el año» (54) |
| **a3 · 8** | «Comparar las dos fotos» | **71 px, tres renglones.** Aunque se arregle el anterior, este deja el bloque en 71 y la pantalla en **50 px** de desplazamiento | **«Las dos fotos»** (54, dos renglones). El tercero, «Una foto», ya cabe (44) |
| **a2 · 6** y **a2 · 7** | «Uno sube, otro baja» | **71 px, tres renglones** → **50 px** de desplazamiento. «Sube uno, baja otro» y «Uno sube y otro baja» miden lo mismo | **«Van al revés»** (54, dos renglones) o **«Al revés»** (44, un renglón). «Sube y baja» también cabe (54), pero se parece demasiado a «Crecen los dos» |
| **a4 · 3** | «Financiación» | **Se sale a 320** (la palabra mide 79,7 y el hueco 60,7); a 375 cabe | **No hace falta cambiar el texto: cambio la figura.** Los tres carriles van **apilados, en bandas de 44 px a todo el ancho**, no en fila de tres. Es lo que debieron ser desde el principio —un carril es una banda por donde se mueve la plata— y corrijo mi §8.2, que no decía la dirección. Con 258 px de ancho, «Financiación» cabe de sobra |
| **Las cuatro de capa 4** (N·3, a2·9, a3·9, a4·9) | Las cuatro frases publicadas, apiladas | Bloque de **234 · 251 · 224 · 234 px** a 320. Con la figura reducida a una franja de 44 y la razón en tres renglones, la pantalla mide 783 y se desplaza **146 px**. **A 375 cabe sin desplazar** (730, cero) | **No hay texto más corto que ofrecer:** son las frases publicadas, y la op1 ya la corrigió la auditoría de base. Lo resuelvo con una excepción declarada (§4), no acortando |

Confirmo lo que avisó Futaba: **las frases de capa 4 van apiladas y no en fila** —la regla de la
fila es solo para las paradas— y ninguna de las otras juntas quedó con dos ideas.

## 3 · Dos reglas que salen de esta pasada (y que no había que adivinar)

### 3.1 En una pantalla Haz, la razón reserva tres renglones, y por eso la fila tope es de 54

La pista del primer error son hasta 20 palabras, y 20 palabras miden **tres renglones a 320**
(dos a 375). Como nada puede saltar cuando aparece, **la zona de razón reserva 48 px en toda
pantalla Haz**, no 16. Con esa reserva, el presupuesto a 320×568 queda así [fuente, réplica]:

| Pantalla | Alto del documento | Desplazamiento real | ¿Pasa? |
|---|---|---|---|
| Míralo (figura 184, apoyo de 2 renglones) | 628 | **0** | ✓ |
| Haz, fila de **44** | 660 | 23 | ✓ |
| Haz, fila de **54** (dos renglones) | 670 | **33** | ✓ |
| Haz, fila de **71** (tres renglones) | 687 | 50 | ✗ |
| Haz, fila de **88** (cuatro renglones) | 704 | 67 | ✗ |

**Queda escrito el margen: 7 px.** Cualquier cosa que crezca más de 7 px en una pantalla Haz de
320 se pasa de los 40. A 375 ninguna de las cinco se desplaza.

### 3.2 En la fila de tres manda la palabra más larga, no el rótulo

Un rótulo se sale de la columna cuando **una sola palabra pasa de 60,7 px a 320** (≈ 11
caracteres en Inter 13/600), aunque el rótulo entero sea corto: «Administradores» mide 103,8 px él
solo y «Financiación», 79,7. **El tope de 20 caracteres que les di no basta: hay que mirar la
palabra más larga.** A 375 el hueco es de 79,0 px (≈ 14 caracteres).

## 4 · La excepción declarada: la pantalla «En una frase»

Las cuatro pantallas de capa 4 **no caben a 320×568 y no es culpa del texto**: cuatro opciones
publicadas de una o dos líneas suman de 224 a 251 px, y ningún recorte de la figura alcanza.
Decido, y queda escrito:

- **En la pantalla de capa 4 la figura baja a una franja de 44 px** con el modelo en su estado
  final. Es la única pantalla de la pieza donde la reserva de 184 no se respeta, y se puede
  porque ahí el modelo ya no se opera: solo acompaña a la frase.
- **Esa pantalla se desplaza 146 px a 320** y cero a 375. La figura queda a 111 px de la cima del
  Panel y **la primera frase, a 324, por encima del bloque pegado**: lo que cae bajo el pliegue son
  las frases 3 y 4, que es lo que uno espera desplazar en una lista de cuatro.
- **Para Ukyo y Miku:** el patrón dice 40 px de desplazamiento como tope y no contempla una
  pantalla de cuatro opciones de texto publicado. O la capa 4 se declara excepción en
  `aprender-secuencia-v1`, o deja de ser una pantalla de la secuencia. Lo apunto para que no se
  descubra cuatro células más tarde.

## 5 · Lo que ya no hay que volver a medir

Para no abrir otra vez ni la ficha de Futaba ni la réplica:

| Zona | Tope a 320 | Tope a 375 | Lo más grande que entregó Futaba |
|---|---|---|---|
| Titular | 2 renglones · 44,2 px | 2 renglones | 2 renglones (a1·1, a1·3, a1·9, a2·4, a2·5, a2·8, a3·3, a3·6, a4·2…) |
| Apoyo y texto de paso | 3 renglones · 66 px | 3 renglones | 3 renglones (a1·1, a1·4, a3·2 paso 1, a3·6…) |
| Razón o pista | 3 renglones · 48 px | 2 renglones | 20 palabras, justo en el tope |
| Rótulo en fila de tres | 2 renglones · 54 px, ninguna palabra de más de 60,7 px | 2 renglones, 79,0 px | ver §2 |
| Rótulo en fila de dos (columna 125 a 320) | 2 renglones | 2 renglones | «Explica una línea» (54) — cabe |
| Frases de capa 4, apiladas | sin tope: la pantalla se desplaza | — | 251 px (a2·9) |

**Lo que queda pendiente de medir, y no es texto:** la cita con los siete verbos (a1·2, componente
`verbos.jsx`), la torre con sus rótulos (cu0-a2) y los tres informes con las cinco flechas
(cu0-a4). Son figuras, no textos, y las mido cuando Kaede las tenga armadas: si alguna pasa de
144 px, sube la reserva de la figura y hay que volver a correr la tabla de §3.1.

**Una cosa que leí y no es de diseño:** Futaba apunta que partir la pieza nueva por adentro y
afuera vuelve a enseñar lo que la auditoría de base le quitó a la capa 3 de t1-1. No cambia
ninguna medida de este archivo; es de Shoko.

## 6 · Kaede, en corto

Los cinco rótulos de §2 se construyen con el texto de la última columna —menos los carriles de
a4·3, que no cambian de texto sino de disposición—; la zona de razón reserva 48 px en toda
pantalla Haz; y la pantalla de capa 4 lleva figura de 44 y se desplaza.
