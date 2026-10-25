# T4 · Auditoría de Shibukawa del #488 (Vara 2), 25 oct 2026: NO PASA, con una corrección común y dos sueltas

Copia del comentario del PR (https://github.com/lugoxboop/aprendefae/pull/488#issuecomment-6391981884), para que los textos nuevos tengan fuente en el repo. La prueba `t4-slides` busca aquí, como en el hilo de Katsumi.

## Correcciones

1. **Baki, una sola para las seis piezas, en `comun.jsx`.** Al montar cada pantalla y cada vez que cambie la devolución, `d = banda.bottom − (innerHeight − alto de [data-navegacion])`; si `d > 0`, `window.scrollBy({ top: d, behavior: "instant" })`. Vara: `bajoNav` en 0.
2. **A4 p1:** «Bancos es la plata de la empresa en el banco.» pasa al principio de la banda de A4 p2. Si p1 aún no baja a 8 líneas a 320, decide Katsumi qué más sale.
3. **A1 p5:** el texto queda «Escenario simulado. Andrés cobra y anota. ¿Qué control faltó?». En el caso B, «Lucía» en lugar de «Andrés».
4. **Katsumi:** la razón de «Siguiente» apagado pasa de «Responde para seguir.» a «Decide para seguir.».

## Condiciones para fusionar sin volver a auditoría

- (a) `medir-slides.mjs` en los dos casos y los dos anchos, con `bajoNav` en 0 en las 144 filas y A4 p1 en ≤ 8 líneas (titular más banda) a 320.
- (b) Captura de A1 p5 con el rótulo visible.
- (c) A8 (D9), a 375: captura antes de la acción y unos 300 ms después en A0 p1, A1 p3, A2 p2, A3 p2, A4 p1 y A5 p2. A7 (D6): `medir-slides.mjs` mide los ms del clic a `[data-palabra]` en el primer error y en el acierto de cada Haz a 320; máximo < 500. C2: captura a 320 del segundo error en A1 p4 con el porqué visible.
- (d) Katsumi justifica en una línea las dos mecánicas en su 4.º uso o más.

## Katsumi: la condición (d) y los textos de las correcciones (25 oct)

Copia de su comentario (https://github.com/lugoxboop/aprendefae/pull/488#issuecomment-6392256839).

- **Tres opciones en fichas: se sostiene.** Cambia en cada pantalla la figura que reacciona y lo que se decide.
- **Llevar la tarjeta al debe o al haber: se sostiene en seis pantallas, no en A5 p5**, que repetía A5 p3. Mecánica nueva en A5 p5: Bancos aparece ya puesto en su lado, y cada nota se lleva a su contrapartida entre tres cuentas (las cinco de la p. 191, con sus nombres publicados; cada nota muestra la correcta y dos de las otras), con la rejilla de A3 p5 y la cuenta sola, sin el lado. No duplica a H8.

| Pieza | Pantalla | Texto | Palabras · INFLESZ |
|---|---|---|---|
| A5 | p5 · pregunta | Bancos ya está en su lado. ¿Con qué otra cuenta se asienta cada nota? | 14 · 97,5 |
| A5 | p5 · error | Esa cuenta es de otra nota. ¿Por qué se movió esta plata? | 12 · 102,2 |
| A5 | p5 · porqué del segundo error (reemplaza el del lote 4) | La otra cuenta dice por qué se movió la plata: un cobro, un ingreso o un gasto. | 17 · 94,6 |

A4 p1: con «Bancos es la plata…» pasado a p2, la pantalla queda en 7 líneas a 320 (medido), así que sus recortes de A4 p1 no hacen falta. A1 p5: de acuerdo con «Escenario simulado. Andrés cobra y anota. ¿Qué control faltó?» (Lucía en el caso B).
