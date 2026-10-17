# D8 · Segunda vuelta de los 7 Hacer de B (Futaba, 17-oct) — registro del lote 18

Encargo de Sakuta: Shoko dejó los 7 Hacer de B en Básico por D8 (la segunda vuelta era idéntica). La primera vuelta es la de hoy; desde la segunda se alterna con la variante. Las fichas usan dos mazos fijos. Todo rotulado «Escenario simulado».

**Dónde vive cada cosa (lo de Futaba, tal cual, en el código):**

| Pieza | Variante | Archivo |
|---|---|---|
| b5-t5-a1 | dos mazos fijos (vuelta 1 y vuelta 2) y cuatro fichas nuevas (nv-capital, nv-empresa, nv-trimestre, nv-redime) | `src/data/contabilidadT5Act1.js` (`FICHAS_V2_T5_ACT1`, `MAZOS_T5_ACT1`) |
| b5-t5-a2 | Comercializadora El Roble | `src/data/b5SegundaVuelta.js` |
| b5-t6-a1 | ocho fichas nuevas, en su orden (vuelta 1: las 8 de hoy) | `src/data/contabilidadT6Act1.js` (`FICHAS_V2_T6_ACT1`) |
| b5-t6-a2 | Distribuidora La Ceiba y Hernán Ríos | `src/data/b5SegundaVuelta.js` |
| b5-t6-a3 | La Ceiba y Hernán Ríos, deuda castigada de $112.000 | `src/data/b5SegundaVuelta.js` |
| b5-t6-a4 | diez hechos nuevos, mismo reparto y mismos mapas de error | `src/data/contabilidadT6Act4.js` (`HECHOS_V2_T6_ACT4`) |
| b5-t6-a6 | segunda cartera ($2.040.000) y tres deudas (3, 12 y 25 meses) | `src/data/contabilidadT6Act6.js` (`*_V2_T6_ACT6`) |

**Lo que Futaba dejó «de hoy»** se reusa con los cambios de la variante, aplicados por código (`conCambios`, en `src/contabilidad/b5Vuelta.js`), nunca copiado a mano:
- t5-a2: «agosto» → «junio», «noviembre» → «septiembre», «Santa Pacha» → «El Roble», «625 títulos» → «600 títulos».
- t6-a2 y t6-a3: «Pablo Moncayo» → «Hernán Ríos», «El Torito (Currambero)» → «La Ceiba», «en/de marzo» → «en/de abril», «en diciembre de 2007» → «en el primer diciembre».
- t6-a6: el G0 con la plantilla de hoy, con N = 3, 12 o 25.

INFLESZ (Futaba, `npm run inflesz`): todo lo de 10 palabras o más, ≥ 65. Cifras cruzadas contra el capítulo (pp. 176-275) y las tablas de las pp. 201 y 269: ninguna coincide.
