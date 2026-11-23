# T1 · Demanda agregada — construcción (rama `macro26-t1`)

Fuente: `disenos/t1-demanda-agregada.md` (Gen, 22-nov). Código en `src/macro2026/`.
Vista previa sin publicar: `#/macro-2026` (índice) y `#/macro-2026/<id>` (una pieza).
`?semilla=N` al final de la dirección fija el sorteo (videos y sondas).

## Casillas

- [x] Infraestructura común (colores-da, modelo-da, azar, ui, GraficaDA, carrito, textos, catálogo, vista previa)
- [x] A1 · El carrito de la economía
- [x] H1 · Llena el carrito
- [x] A2 · El vaso de la renta
- [x] A3 · El columpio de la tasa
- [x] A4 · Los que no miran la renta
- [x] H4 · Lo que oyó el empresario
- [x] A5 · Bisagra y ascensor
- [x] H3 · ¿Gira o sube?
- [x] A6 · El eco del multiplicador
- [x] H2 · Arma la fórmula
- [x] H5 · La libreta de la analista
- [x] H6 · Lleva la economía a la meta
- [x] Migración de las 6 Hacer (en espera en `supabase/macro2026-pendientes/`)
- [x] Pruebas (`src/macro2026/__tests__/`, 28)
- [x] Videos a 320 y 375 (`/mnt/project-files/macro-2026/videos/t1/`, 24)
- [x] Interruptor de publicación por pieza (`PUBLICADAS_T1` en `catalogo.js`)

## Decisiones reversibles tomadas al construir (lo ambiguo o imposible)

1. **Colores C, I, G, XN** (§0 los deja al constructor): C `--warning` #f2c14e,
   I `--success` #4fc2b2, G `--accent` #6f86ff, XN `--ink` #f4f5f7 (tema oscuro de
   planck.css). Luminancias 0,57 / 0,43 / 0,27 / 0,91: se separan también sin
   ver color. Contraste contra #0E1B2E medido en `__tests__/t1-modelo-y-bancos.test.mjs`.
2. **Sin publicar ≠ sin migración aplicada.** La migración de las 6 Hacer no va
   a `supabase/migrations/` todavía: allí la prueba `catalogo.test.mjs` y el
   guardián exigen que la actividad esté en `subjects.js`, y declararla en
   `subjects.js` la pondría en el camino de los estudiantes. Espera en
   `supabase/macro2026-pendientes/` y se mueve al publicar (ver «Al publicar»).
3. **Vista previa sin servidor.** Las Hacer cierran con la pantalla de resumen
   común (`shared/PantallaResumen.jsx`) alimentada con los FP que calcula el motor
   (`calcularFP`), sin escribir nada y sin estrellas de opinión.
4. **A1:** C, I y G no tienen cifras en la especificación; los bloques usan
   tamaños de dibujo (C 120, I 70, G 85, XN 20 en P2; en P3 XN = X − M con
   los deslizadores). P4 deja encoger cada bloque hasta 0 y volver a su tamaño.
   «Siguiente» solo se bloquea donde lo pide la especificación (P2, las cuatro manos).
5. **H1:** si el segundo intento también yerra, la ficha va sola a su mano
   correcta, con la retro a la vista, y se pasa a la siguiente (la
   especificación no dice qué pasa tras dos errores).

6. **Número 0270.** Cae en el rango de la Célula E (0250–0299, último usado
   0257). El guardián rechaza cualquier número fuera de los rangos (0300 no
   pasa), así que se queda 0270; hay que avisarlo a E antes de publicar.
7. **H3:** el banco no da magnitudes; los `cambio` son ilustrativos y
   coherentes con el modelo (h3-7 usa c = 0,65; h3-8 TR −100). c también entra
   en el arranque (c·TR), por eso la prueba admite un salto de arranque < 10.
   Mover un asa devuelve la otra a su sitio: una sola decisión por titular.
8. **H5:** la consigna tiene 7 palabras, no 6 como dice §4. Se dejó el texto
   tal cual; la prueba espera 7.
9. **Contraste de las letras C/I/G/XN:** el azul de G como texto daba 4,01:1.
   Las letras van en pastilla (fondo del color, letra #121418) en A1, H1 y
   A6; en el SVG del carrito las letras usan la tinta común.
10. **Etiquetas añadidas sin cambiar texto de la especificación:** «Meta: N»
    en H6, «El empresario oyó:» en H4, «Cobra…» en los ecos de A6, cifras de
    dibujo de X y M en A4.
11. **Movimiento:** las rectas del SVG se animan con requestAnimationFrame
    (interpolando la pendiente y el arranque), no con transform de CSS, para
    que la recta gire sobre su punto y no se deforme. Con movimiento reducido
    saltan al valor final.
12. **Publicación por partes (Mateo, 22-nov).** `PUBLICADAS_T1` en
    `catalogo.js` es el interruptor, uno por pieza. Una Aprender no lleva fila
    en `actividad_catalogo` ni FP, así que se publica sola. Una prueba exige
    que subjects.js y supabase/migrations declaren exactamente lo anotado ahí.

## Mediciones (sondas sobre `dist` servido en 8099, todas las pantallas)

El contraste usa el MEDIR de `scripts/contraste.mjs` tal cual. Las Hacer se
miden al inicio y con la retro de error a la vista.

| | 320 | 375 |
|---|---|---|
| Fallos de contraste | 0 | 0 |
| Letra mínima | 12 px | 12 px |
| Toques < 44 px | 0 | 0 |
| Desborde horizontal | 0 | 0 |
| B1 máx. (figura − tarjeta) | A* 41 · H1 64 · H2 82 · H3 137 · H4 179 · H5 64 · H6 150 | H4 138 · H5 43 · H6 129 |

Límite: la sonda de contraste no lee el `fill` del SVG; el texto SVG se
revisó a mano (tinta común y tinta 2).

## Al publicar (por partes, cuando Mateo apruebe cada pieza)

**Solo las Aprender (A1–A6):** anotar sus ids en `PUBLICADAS_T1`, declararlas
en `SUBJECTS.macroeconomia.topics[demanda-agregada].actividades` y montarlas en
la vista del tema. No llevan migración.

**Cada Hacer, cuando le toque:**

1. Pasar a `supabase/migrations/` la parte de `0270_*.sql` con las filas de
   las Hacer que se publican (solo esas: la prueba lo exige) y anotar sus ids
   en `PUBLICADAS_T1`.
2. Declararlas en `SUBJECTS.macroeconomia.topics[demanda-agregada].actividades`
   con la `clasificacion` de `src/macro2026/demanda-agregada/catalogo.js`.
3. Montar las piezas en la vista del tema y conectar `onTerminar` a
   `registrarActividadCompletada` (el resultado ya trae `pct`, `detalle` con
   `item`/`ok`/`subtemas` y `duracionMs`).

## Lote 2 (23-nov-2026): las 6 Hacer, publicadas

Hecho en la rama `macro26-lote2` (desde main, con `macro26-t2` fusionada).

- `0270_da26_t1_demanda_agregada.sql` pasó entera a `supabase/migrations/`.
  Su línea de deshacer, comentada, dice `like 'da26-h%'`: con la lista de ids
  la prueba del catálogo la leía como un borrado real, aunque esté en un
  comentario.
- `PUBLICADAS_T1` tiene las 12. `subjects.js` declara las 6 Hacer con la
  `clasificacion` del catálogo.
- **Vista única `src/macro2026/TemaMacro2026.jsx`** para todo tema del Macro
  nuevo; sustituye a `TemaDemandaAgregada.jsx`. Aprender es una lista y luego
  la pieza. Hacer usa `CaminoHacer`, que es compartido y no se tocó, más
  `useCompletadas`. El reto llama a `registrarActividadCompletada` como en
  Contabilidad, y el FP lo da el servidor, una sola vez. Al cerrar sale
  `PantallaResumen`. Sin cuenta, `pedirCuenta`. Si la pantalla no se puede
  enseñar, sale el cierre de siempre (`data-cierre-macro2026`).
- Las filas de volver usan `fae-cabecera-titulo`.
- `FORMATO_MACRO` pone las 6 en X de N: el % de cada una es aciertos entre
  ítems del `detalle`.
- Las etiquetas del panel docente están en `src/macro2026/etiquetas.js`, junto
  a los bancos. `etiquetasItem.js` las suma a `REGLAS`.
- Medallas: las 6 **no** van a `AGREGADAS_DESPUES`. Son la materia nueva, no
  un añadido a la de antes. Quien ganó «Macroeconomía al día» antes del retiro
  la conserva por `GANADAS_ANTES_DEL_RETIRO`. Quien no, necesita las 6. La
  prueba ahora cuenta las cifras en vez de fijarlas.
- `camino-sin-cambios`: la foto se rehízo con las 6 variantes nuevas. Antes se
  pesaron solo las 18 de Pensamiento Estratégico, que dieron las mismas huellas.
  Las 12 que cambian lo hacen por los ids de `useId`, igual que el 22-nov.
- **Navegación.** La vista usa el `navegar` de App, que le llega por la prop
  `onIr`. No cambia el hash a mano. CaminoHacer abre cada nodo dentro de una
  transición, y mientras esta dura `useRuta` no atiende `hashchange`: con el
  hash a mano, la dirección cambiaba y la pantalla no (el reto no abría desde
  el camino). Lo fija `src/macro2026/__tests__/tema-navega.test.mjs`.
- La fila de volver del reto dice «‹ Retos». Con «‹ Retos de Demanda
  agregada» (252 px) la página desbordaba 36 px a 320.
- **Medido** con `sonda-cabecera.mjs`, a 320 y 375, en 7 pantallas: las dos
  listas, el camino, A1, H1, H5 y A5 de T2. Ninguna fila de volver queda bajo
  la pastilla de FP; el hueco es de 53 px en todas. Desborde 0. Ningún aviso
  de carga.
- **Video** `/mnt/project-files/macro-2026/videos/lote2-portada-375.webm`,
  con la sesión de prueba. Recorre la portada, Macro y T1: abre A1 y completa
  H1 con un error al principio. Sale 7 de 8 (88 %) y 9 FP: base 10 × 0,875 =
  8,75, que redondea a 9, igual que `calcularFP`. Luego va a T2 y completa
  A1. Sin errores de página.
