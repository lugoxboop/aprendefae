# Línea base medida de T2 «Las cuentas, el debe y el haber» (issue #471, punto 1)

Célula C · Misa · 23 de octubre de 2026. Solo se midió; no se cambió código de `src/`.

## Alcance (ids leídos de `src/data/subjects.js`, tema `cuentas-debe-haber`)

- **Aprender (5):** `cu-a1-anatomia-de-una-cuenta`, `cu-a2-dos-familias`, `cu-a5-debe-y-haber`, `cu-a3-partida-doble`, `cu-a4-diario-y-mayor` (en ese orden en la página; vista `CuentasDebeHaberView.jsx`, cada una en su `section[data-pieza]`).
- **Hacer (7):** `cu-izquierda-o-derecha`, `cu-de-que-familia`, `cu-cuadro-dinamicas`, `cu-debita-o-acredita`, `cu-saldo-de-la-cuenta`, `cu-arma-el-asiento`, `cu-asiento-compuesto`.
- **El Ciclo Completo (`ciclo-completo`, desafío):** etapas 1 Diario, 2 Mayor, 3 Saldos, 4 Estado de situación financiera (`ciclo/EtapasDelCiclo.jsx`). Se añaden como contexto la portada, el cierre y el camino de Hacer.

## Tabla

Cada celda es **hallazgos / elementos medidos** (suma de los estados recorridos). «Est.» = estados medidos (pantallas distintas). 320 y 375 dieron **los mismos recuentos** en todas las filas salvo las marcadas con `→` (375); los tamaños de detalle sí cambian entre anchos, así que no es la misma medida repetida.

- **Contraste** (`contraste.mjs`): textos bajo 4,5:1 (o 3:1 si es grande).
- **< 12 px** (`piso-de-12.mjs`): textos bajo 12 px; entre paréntesis, cuántos tienen forma de cejilla (rótulo corto en mayúsculas). Desborde horizontal: **0 en todas las filas**, sin scroll horizontal.
- **Toque < 44** (`blanco-de-toque.mjs`): controles pequeños; entre paréntesis, tapados (otro elemento recibe el toque).
- **Ficha** (`ficha-tapa.mjs`): elementos tapados por la píldora de FP / elementos revisados; «con ficha» = posiciones en las que la ficha estaba pintada sobre las medidas.

| Pieza | Est. | Contraste | < 12 px | Toque < 44 | Ficha (con ficha) |
|---|---|---|---|---|---|
| A · cu-a1 anatomía | 15 | 0 / 683 | 8 (8) / 831 | 14 (7) / 266 | 0 / 1193 (15 de 45) |
| A · cu-a2 dos familias | 9 | 0 / 509 | 7 (7) / 603 | 8 (5) / 104 | 0 / 645 (9 de 27) |
| A · cu-a5 debe y haber | 13 | 1 / 614 | 14 (10) / 767 | 11 (6) / 294 | 0 / 1011 (13 de 39) |
| A · cu-a3 partida doble | 12 | 0 / 405 | 8 (8) / 553 | 11 (7) / 178 | 0 / 649 (12 de 36) |
| A · cu-a4 diario y mayor | 9 | 1 / 303 | 9 (8) / 389 | 8 (5) / 105 | 0 / 483 (9 de 27) |
| H · cu-izquierda-o-derecha | 7 | 0 / 168 | 6 (6) / 163 | 5 (1) / 36 | 0 / 548 (14 de 21) |
| H · cu-de-que-familia | 14 | 1 / 350 | 12 (7) / 396 | 4 → 7 (1) / 80 | 0 / 1286 (28 de 42) |
| H · cu-cuadro-dinamicas | 5 | 0 / 198 | 9 (8) / 117 | 7 (5) / 23 | 0 / 708 (10 de 15) |
| H · cu-debita-o-acredita | 8 | 0 / 218 | 9 (8) / 204 | 4 (1) / 42 | 0 / 664 (16 de 24) |
| H · cu-saldo-de-la-cuenta | 4 | 0 / 113 | 11 (7) / 111 | 1 (1) / 21 | 0 / 306 (8 de 12) |
| H · cu-arma-el-asiento | 14 | 1 / 322 | 9 (6) / 417 | 15 (3) / 119 | 0 / 1644 (28 de 42) |
| H · cu-asiento-compuesto | 14 | 2 / 592 | **30** (8) / 586 | 8 (6) / 184 | 0 / 1389 (28 de 42) |
| C · etapa 1 Diario | 4 | 2 / 180 | **32** (14) / 235 | 14 (1) / 24 | 0 / 584 (8 de 12) |
| C · etapa 2 Mayor | 4 | 3 / 190 | 20 (11) / 224 | 2 (1) / 28 | 0 / 616 (8 de 12) |
| C · etapa 3 Saldos | 4 | 3 / 218 | 20 (9) / 210 | 2 (1) / 17 | 0 / 600 (8 de 12) |
| C · etapa 4 Estado | 4 | 3 / 179 | **32** (15) / 194 | 3 (1) / 24 | 0 / 586 (8 de 12) |
| *ciclo · portada* | 1 | 0 / 26 | 6 (6) / 26 | 1 (1) / 3 | 0 / 54 (2 de 3) |
| *ciclo · cierre* | 1 | **8** / 33 | 14 (10) / 30 | 4 (1) / 5 | 0 / 78 (2 de 3) |
| *camino de Hacer* | 1 | 0 / 25 | 1 (1) / 25 | 6 → 0 (1 → 0) / 9 | 0 / 72 (2 de 3) |

### Lo que hay detrás de las cifras (320 px)

- **Contraste.** Lo peor: `—` a 2,6:1 (14 px) en el Mayor de las etapas 2-3; `·` a 1,83:1 (11 px) en cu-a4; «Toca una cuenta de abajo» a 3,68:1 (13 px) en la etapa 1; el resto entre 3,9 y 4,31:1: rótulos de 9,5-11 px («ETAPA n» del cierre a 4,15:1; resúmenes «9 asientos», «11 cuentas», «cuadrado» de `Superficie` a 4,31:1; «devolver al estante» a 4,08:1).
- **< 12 px.** Tamaño mínimo medido: 9,5 px (fechas «Ene 2…» del diario del ciclo, chips de cu-de-que-familia, «devolver al estante»). Lo que más pesa en el ciclo y en cu-asiento-compuesto son cifras y nombres de cuenta a 10,5-11,5 px de las hojas (`Escritorio.jsx`) y del estante. En Aprender casi todo son cejillas.
- **Toque < 44.** En Aprender, los puntos del contador de términos de la capa 1 (28×44, separados 28 px: se tapan entre sí), «Siguiente» de la capa 1 (99×42) y botones de exploración de 35-42 px de alto. En Hacer, fichas de 35 px de alto, «AL DEBE»/«AL HABER» de 26 px y «devolver al estante» de 20 px (cu-asiento-compuesto), «Poner un nombre…» 107×28 (cu-arma-el-asiento), las 13 cuentas del constructor de asientos a 36 px (etapa 1) y las cabeceras plegables «LIBRO DIARIO / LIBRO MAYOR» de 17 px de alto (etapas 2-4 y cierre). «Volver al camino» (164×40, tapado por su contenedor) sale en todas las filas de Hacer y del ciclo: es la cabecera común de la vista, se cuenta en cada fila.
- **Ficha.** Cero tapados en todo lo medido, con la ficha pintada (sesión fingida) en todas las filas.

## Cómo se midió

- `main` en **22481d01** («estado: L toma T2 y reparte el lote T2-1»), rama `feat/conta-c7-t2-linea-base` sin cambios en `src/`.
- Build: `VITE_SUPABASE_URL=https://x.supabase.co VITE_SUPABASE_ANON_KEY=x npx vite build` (el dominio `*.supabase.co` es el que interceptan las sondas); `dist` servido con `python3 -m http.server 8099 --bind 127.0.0.1`.
- Guion: `node scripts/t2/medir-t2-linea-base.mjs 320 375 --json=<salida>` (Chromium `/opt/pw-browsers/chromium`, Playwright de `/opt/node-tools`). **No reescribe la medida:** lee el texto de las cuatro sondas y ejecuta su función (`MEDIR`, `MIRA`, `medirPantalla`, la de `blanco-de-toque`), con tres retoques comprobados (si un ancla no aparece exactamente una vez, no mide): raíz = alcance de la pieza (`section[data-pieza]` en Aprender; contenedor de la vista en Hacer y ciclo, que incluye la cabecera), contador de elementos medidos, y nada más. Las ventanas son las de cada sonda: 1400 de alto para contraste y piso, 760 para ficha (en la cima de la página y arriba/abajo del alcance), y tan alta como la página para el toque.
- **Sesión fingida** con la receta de `ficha-tapa.mjs`: sesión en `localStorage["aprendefae-auth"]` y respuestas locales a `/auth/v1/user`, `profiles` (apodo largo, 987 654 FP: el peor ancho de ficha) y `registrar_fp`; el resto de `*.supabase.co` responde `[]`. Comprobado: la ficha se pintó en todas las filas.
- Fuentes Inter y Sora servidas desde `/tmp/claude-0/fuentes` por `route`; `document.fonts.check` dio verdadero en todas las filas. `Math.random` con semilla fija.
- Recorrido: entrada por hash (`#/cuentas-debe-haber/aprender` y `…/hacer`). Aprender: estado inicial, cada «Siguiente/Continuar» de la pieza y hasta seis toques en las capas 3 y 4. Hacer: nodo → «Empezar» → «Así se juega» → «Siguiente» → inicio → hasta doce jugadas genéricas (llenar campos con 1000, enviar si se puede, si no tocar el siguiente control sin probar); solo se mide una jugada si cambia la pantalla. Ciclo: se juega entero (sin buscar acertar) y en cada etapa se mide el 1.er ítem antes y después de responder, el 2.º después y el último después.
- Referencia: las sondas de serie sobre el tema completo (sin el guion) dieron a 320 y 375: contraste 0 en 30 pantallas de Aprender y 0 en 7 de Hacer (`--partidas`); ficha 0 (Hacer 1 pantalla con ficha de 3; Aprender 26 de 52); piso-de-12 `SOLO=T2` 19 textos < 12 px, todos con forma de cejilla; blanco-de-toque en el camino 6 pequeños a 320 y 0 a 375, en Aprender 46 pequeños y 30 tapados. Esas corridas van **sin sesión**, salvo ficha-tapa, y en Hacer apenas pasan del camino: por eso no sirven como línea base por pieza. Para correrlas aquí hubo que enlazar `/opt/npm-tools → /opt/node-tools` (la ruta que importan las sondas no existe en esta máquina); ese enlace está fuera del repo.

## Lo que no se pudo medir y por qué

- **Ficha en las piezas 2-5 de Aprender:** la ficha solo existe con `scrollY ≤ 48` (`AccountControl.jsx`, `UMBRAL_FICHA`). En las posiciones de esas piezas no se pinta, y en la cima de la página quedan fuera de la pantalla. Su «0» es «no puede tapar por diseño», no un tapado medido.
- **Pantallas de retroalimentación en cu-saldo-de-la-cuenta, cu-arma-el-asiento y cu-asiento-compuesto:** el guion genérico no llegó a un veredicto (no hay `data-fallo` ni `data-estado` correcta/incorrecta). Esas pantallas quedan **sin medir**; para medirlas hace falta un guion que juegue cada mecánica (cifra + lado; nombres + valores; asiento cuadrado). cu-cuadro-dinamicas solo cambió la pantalla 3 veces.
- **Capas 3 y 4 de Aprender:** solo los estados que alcanzan seis toques genéricos por capa; no se recorrieron todas las ramas de cada exploración.
- **Ciclo:** solo los ítems 1.º, 2.º y último de cada etapa, y respuestas sin buscar acertar (el estado de acierto de cada etapa puede no estar entre los medidos). Los ítems intermedios se jugaron, pero no se midieron.
- Las cuatro sondas no miran texto sobre imágenes o degradados ni controles deshabilitados. Hubo 1 texto (cu-a5) y 3 (cu-izquierda-o-derecha) con color transparente que la sonda de contraste no puede medir.
