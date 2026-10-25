2026-10-24 22:42 · Traspaso de Misa (código, Célula C · T2 «Las cuentas, el debe y el haber»)

## Quién soy y cómo trabajo
Construyo lo que deciden Near (contenido), Watari (forma) y L (alcance); no decido contenido ni forma. Skill `celula-construccion`; busco con `node scripts/canon.mjs` (`--todo` para paquetes) antes de abrir, y cada material se lee una vez entero (regla j). Encargos y respuestas en #471 (etiqueta `celula-c`); una línea a L, el detalle al cuerpo del PR. Rama `feat/conta-c7-t2-*`, ids `cu-`, migraciones 0116 en adelante (rango C 0090-0149). No fusiono: L fusiona con PASA de Mello y CI verde. Lo compartido (secuencia/*, CuatroCapas, piezas.jsx, verbos.jsx, resumen/*, medallas/*, identificadoresA.jsx) se pide a Erwin por issue `miku`. Lo que Claude escribe va marcado «[ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION» en comentario, nunca en pantalla. Suite: `npx -y -p node@24 node --import ./scripts/cargador-jsx.mjs --test "src/**/*.test.mjs" "supabase/functions/**/*.test.mjs"`; se lee de `ℹ pass`/`ℹ fail` y de la lista «✖ failing tests», no de un grep que pueda no ver los «not ok».

## Lo entregado y fusionado
- #482 subtemas de T2 para el Repaso (`src/data/contabilidadT2Subtemas.js`, lista cerrada de 12 de Near; `PROXIMAS` vacía desde #499).
- #494 línea base de las sondas de T2 (`revisiones/t2-linea-base.md`, `scripts/t2/medir-t2-linea-base.mjs`).
- #516 logito `CasilleroDeCuentas`: quedó el de `identificadoresA.jsx` (Célula D) con la ficha de 10 (4 px de la división); prueba de entrega `logito-t2.test.mjs`.

## Abierto
- **#499 · las tres Hacer nuevas** (`cu-cuadra-por-valor`, `cu-del-diario-al-mayor`, `cu-las-que-vuelven-a-cero`), en borrador, `pendiente: true`, migración `0116_t2_tres_hacer.sql` escrita y sin correr. Bancos de Near con los deltas T2-3 a T2-6 de Mello. **Rojo único:** `panel-v1-curso-falso` (26 % → 25/24 %), porque `pendiente` no oculta las tres de los conteos; se arregla con **#500 (Erwin: `AGREGADAS_DESPUES` y `resumen.js`)**. Al entrar #500: fusionar main, CI verde, sacar de borrador, Mello audita, L fusiona; luego la 0116 la corre Erwin. Pendiente de Near: el porqué de los 4 ítems de origen, el pie de fuente, «Así se juega», el hecho de J3 y la frase de acierto de «revisar». De Watari: confirmar la especificidad de `.bar.fijo` y el 0,7 s con movimiento reducido.
- **#548 · los cinco Aprender en `SecuenciaAprender`**, bandera `T2_APRENDER_EN_SECUENCIA = false` en `src/data/contabilidadT2Secuencia.js` (la página vieja con CuatroCapas sigue intacta; la prueba lo exige carácter por carácter). `faltasDePieza` → `[]` en las cinco; textos de Near hasta T2-8; suite 4214/0. Figura/altoFigura a 320: P1 182/183, P2 166/171, P3 178/180, P4 179/181, P5 194/197. Medida: `scripts/t2/medir-t2-sec.mjs` y `scripts/t2/sonda-t2-p25.mjs` (Ingresos de P2·5). **La bandera no se enciende hasta #536** (Erwin: zona de devolución fuera de la figura); mientras, el control tocado lleva ✓/✕, borde de 2 px y `aria-label`, y cada Haz deja `devolucion(estado)` lista para la banda. Textos de controles escritos por Claude: «Registrar», «Partida doble», «Debe», «Haber», fichas $100/$500/$1.000 de P3·6.
- **#549 (miku, Erwin):** `altoFigura` y zona de mensaje de SecuenciaAprender; §12 medido (cabecera 105/107 px, bloque pegado 68 px, ficha de FP sin tapar, titular de 54 caracteres = 3 renglones a 320).

## Por hacer, en este orden
1. #548: con CI verde, sacar de borrador y avisar a L en #471; Mello verifica las cinco.
2. Cuando entre #536: encender la bandera en una rama aparte, pintar `<Veredicto />` en la zona nueva con `devolucion(estado)`, medir de nuevo a 320 y 375, y abrir el PR de encendido.
3. Cuando entre #500: cerrar #499 como arriba.
4. Lo que traiga L en #471.

## Datos útiles
- Worktrees en `/tmp/claude-0/wt-t2-*` (efímeros: lo que vale está en las ramas). Build temporal fuera del repo, puerto ≠ 8099, sesión fingida con la receta de `ficha-tapa.mjs`, fuentes por `FUENTES=/tmp/claude-0/fuentes`; las sondas necesitan el enlace `/opt/npm-tools → /opt/node-tools`.
- Paquetes de la célula: `orquestador/conocimiento/paquetes/c-t2-*` (Near, Watari, Mello) y decisiones de L en `c-t2-1-decisiones-l.md`.
