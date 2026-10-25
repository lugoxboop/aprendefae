# Ranking por materia · Zonas para la decoración (Hanayama, 24 oct 2026)

Lo copió Yujiro desde el chat de Hanayama (claude.ai/chat/930849c0-7d5d-431e-a1b2-30f3e19b19dc), porque su sesión no puede hacer push. El banco (`scripts/decoracion/harness-ranking/`) y el medidor (`scripts/decoracion/medir-ranking-hanayama.mjs`) solo existen en su copia local. Hay que reconstruirlos al construir.

> **Cómo leer esto.** Hanayama lo midió antes de recibir el lenguaje de Ukyo (#545). Ukyo fija **una banda propia de 72 px (56 bajo 375) entre el título y la primera fila**, en lugar de las tres zonas de abajo. Las **medidas de la tabla (§1)** y los **avisos (§6)** siguen valiendo. Las zonas (§2-§3) quedan de referencia hasta que Hanayama las cruce con la banda de Ukyo. Además, desde el 24 oct a las 19:05 el alcance son las tres materias, Pensamiento Estratégico incluido.

**Origen de las cifras [fuente]**
- Medido en Chromium (Playwright 1.63), con Inter y Sora de fontsource 5.3.0, sobre main 3723377.
- `RankingFP` se montó tal cual dentro de la columna del índice del tema (relleno lateral de 24 px, caja de 560 px como máximo).
- Filas de prueba con apodos reales de hasta 20 caracteres y el botón de ánimo forzado en las filas ajenas, que es el peor caso.
- Coordenadas relativas a la esquina superior izquierda de la tarjeta. W = 272 a 320 px y 327 a 375 px. El contenido va de x = 17 a x = W − 17.

## 1. Lo que mide la tabla hoy

| Bloque | 320 | 375 |
|---|---|---|
| Tarjeta (x, y, ancho) | 24, 24, 272 | 24, 24, 327 |
| Título «Ranking de Contabilidad» (Sora 16/700) | 17, 18, 199 × 21 | igual |
| Título «Ranking de Macroeconomía» | 224 de ancho: cabe en una línea | igual |
| Nota «Solo esta materia» | 17, 54, 102 × 15, en la segunda línea | igual |
| Pestañas Diario / Semanal / De semestre | 17, 86, **262** × 62 | 17, 86, 282 × 54 |
| Primera fila | y = 163; 238 × 58 | y = 156; 293 × 58 |
| Paso entre filas | 60 (58 + 2) | igual |
| Mensaje de vacío / «Entrar» | y = 163; mensaje de 39 de alto | y = 156 |

**Alto de la tarjeta (320 / 375)**

| Estado | Alto |
|---|---|
| Sin sesión | 280 / 272 |
| 0 jugadores | 224 / 216 |
| 1 jugador | 238 / 231 |
| 3 jugadores | 358 / 351 |
| 10 jugadores | 778 / 771 |
| 10 jugadores y tu fila fuera | 870 / 863 |
| Empates (30 filas) | 1978 / 1971 |

- **Hueco de la página sobre la tarjeta:** `clamp(24px, 4vh, 44px)`, que da 24 a 320×568 y 27 a 375×667.
- **Dentro de las filas no cabe nada.** No existe un bloque de «podio»: los tres primeros puestos solo cambian el color de su número.

## 2. Las tres zonas que propuso (antes de la banda de Ukyo)

| Zona | Caja a 320 (x, y, ancho, alto) | Caja a 375 | Piezas |
|---|---|---|---|
| Z1 · borde superior, por fuera de la tarjeta, en el hueco de la página | 18, −22, 236, 22 | 18, −25, 291, 25 | hasta 2 |
| Z2 · cabecera, junto a la nota (`top: 43; right: 17; height: 39; width: calc(100% − 148px)`) | 131, 43, 124, 39 | 131, 43, 179, 39 | 1 a 320; 2 a 375 |
| Z3 · piso: franja nueva de 12 + 56 px al final de la tarjeta | 17, último + 12, 238, 56 | 17, último + 12, 293, 56 | hasta 3 a 320; 4 a 375 |

En las tres zonas la caja es el sobre del movimiento (`contain: paint`), lleva `aria-hidden` y `pointer-events: none`, y queda a 4 px o más de cualquier toque.

**Reparto por estado.** En sin sesión, 0, 1 y 3 jugadores: Z1 = 1 y Z3 = 2. Con la tabla llena: Z1 = 1, Z2 = 1 y Z3 = 2. En una misma pantalla nunca se ven más de 3 piezas.

## 3. Movimiento y color

- Cada pieza tiene una pose quieta que se entiende sola. Solo se animan `transform` y `opacity`, con la curva de la casa.
- Un bucle solo entra si Ukyo lo aprueba con su coste medido (ver su §7).
- Colores: neutros, con un solo elemento en ámbar como énfasis. Ni coral ni teal (en Contabilidad el teal significa Debe).

## 6. Avisos sobre la tabla (compartida; van a Erwin en #556 y #546)

1. **A 320 no se ve ningún nombre.** Con el botón de ánimo, el apodo mide 0 px en todas las filas ajenas (con apodos de 4 a 20 caracteres). A 375 mide 39-62 px y se corta con «…».
2. **Las pestañas a 320** miden 262 en un contenido de 238: se salen 7 px. «De semestre» parte en dos renglones.
3. **El botón de ánimo mide 27 px de alto**, por debajo de los 44 que pide el toque.
4. **Colores fuera de rol:** coral en el número 1 y en el contador de ánimo; teal en el 2.º y 3.º puesto y en tu fila, que en Contabilidad choca con Debe.
5. **Primero el aviso 1.** Si la decoración entra antes, la tabla sigue sin nombres a 320.

## 7. Lo que no se verificó

- No se probó en un teléfono real ni con `FondoMateria` detrás.
- No hay medidas por encima de 375.
- No se midieron los estados «Cargando…» y de error.
- El banco no usa una sesión real: el `AuthContext` es falso.
