---
id: c7-enganche-b1-b2
titulo: La barra de enganche B1 y B2 sobre las piezas de la Célula C
procedencia: medicion
---

# B1 y B2 sobre las piezas de la Célula C (15 de octubre de 2026)

Medido por la Célula C sobre main (d5a5c08), con las pruebas que trae este
mismo cambio. La barra está en `enganche.md`.

- **B1 · Primero la figura.** A 320 px, la figura o la interacción empieza en
  los primeros 280 px de la tarjeta y el texto antes de ella no pasa de 40
  palabras. Lo midió `scripts/t7/canon-b1.mjs`, en Chromium, con las fuentes
  del sitio. Cada pantalla de Aprender se mide al llegar, y cada Hacer, en su
  apertura.
- **B2 · Presupuesto de texto.** Como mucho 60 palabras visibles por pantalla
  de Aprender. Lo midió `canon-enganche.test.mjs`, en JSDOM y dentro de CI.
  Cada pantalla se mide al llegar, al fallar y al acertar, y aquí sale el
  estado con más palabras.
  - Hay dos columnas: la de main de hoy y la de main con el «¿Por qué?» plegado
    (#232), porque lo plegado no cuenta.

**Qué se cuenta.** Es una convención de la célula; la barra no la detalla.
- Cuenta lo que el estudiante tiene que leer: párrafos, objetivo, consigna,
  pregunta, opciones y retroalimentación.
- No cuenta:
  - el rótulo y el título del marco;
  - los botones de interfaz;
  - el pie de fuente;
  - lo que solo oye el lector de pantalla;
  - lo oculto, que es como va lo plegado.
- El texto de las figuras va aparte.

**Lectura rápida.**
- B1 no se cumple en 158 de 180 medidas: en 86 pantallas no hay figura
  ni interacción, y en el resto la figura llega tarde o detrás de demasiado
  texto.
- B2 no se cumple en 85 de 158 pantallas. Con el plegado bajan a 83. El
  plegado ayuda poco porque casi todo bloque tiene 2 frases o menos: el
  exceso viene de sumar párrafos. Eso lo arreglan los recortes de Near, no la
  interfaz.


## Pieza por pieza

Una ✗ marca lo que no cumple. «—» quiere decir que la pantalla no tiene figura ni interacción.


### T7-1 · Aprender · `t7-1-a1-la-cuenta-que-no-se-mueve`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 29 | ≤ 60 | ≤ 60 |
| lo-que-ya-sabes | 282 px ✗ | 56 ✗ | ≤ 60 | ≤ 60 |
| el-conteo-al-final | 364 px ✗ | 66 ✗ | 66 ✗ (al llegar) | ≤ 60 |
| la-consecuencia | 398 px ✗ | 91 ✗ | 91 ✗ (al llegar) | ≤ 60 |
| pregunta-compra | 365 px ✗ | 55 ✗ | 151 ✗ (al acertar) | 122 ✗ (al acertar) |
| pregunta-conteo | 184 px | 29 | 94 ✗ (al acertar) | 82 ✗ (al acertar) |
| resumen | 294 px ✗ | 43 ✗ | ≤ 60 | ≤ 60 |

### T7-1 · Aprender · `t7-1-a2-la-factura-completa`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 30 | ≤ 60 | ≤ 60 |
| dos-impuestos | — ✗ | 120 ✗ | 120 ✗ (al llegar) | 108 ✗ (al llegar) |
| base-de-la-retencion | 471 px ✗ | 66 ✗ | 103 ✗ (al fallar) | 103 ✗ (al fallar) |
| lados-de-la-compra | 148 px | 17 | ≤ 60 | ≤ 60 |
| la-venta | 607 px ✗ | 85 ✗ | 85 ✗ (al llegar) | 85 ✗ (al llegar) |
| lado-a-lado | 346 px ✗ | 42 ✗ | 120 ✗ (al fallar) | 120 ✗ (al fallar) |
| resumen | — ✗ | 82 ✗ | 82 ✗ (al llegar) | 82 ✗ (al llegar) |

### T7-1 · Aprender · `t7-1-a3-tres-formas`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 25 | ≤ 60 | ≤ 60 |
| el-problema | — ✗ | 47 ✗ | ≤ 60 | ≤ 60 |
| los-datos | — ✗ | 85 ✗ | 85 ✗ (al llegar) | 85 ✗ (al llegar) |
| peps | 353 px ✗ | 59 ✗ | 106 ✗ (al acertar) | 97 ✗ (al fallar) |
| ueps | 353 px ✗ | 55 ✗ | 100 ✗ (al acertar) | 93 ✗ (al fallar) |
| promedio-ponderado | 453 px ✗ | 74 ✗ | 110 ✗ (al fallar) | 99 ✗ (al acertar) |
| lado-a-lado | 568 px ✗ | 62 ✗ | 125 ✗ (al fallar) | 107 ✗ (al fallar) |
| a-favor-y-en-contra | 1036 px ✗ | 182 ✗ | 250 ✗ (al acertar) | 238 ✗ (al acertar) |
| la-recomendacion | 557 px ✗ | 105 ✗ | 157 ✗ (al acertar) | 157 ✗ (al acertar) |
| resumen | — ✗ | 84 ✗ | 84 ✗ (al llegar) | 84 ✗ (al llegar) |

### T7-1 · Aprender · `t7-1-a4-el-cierre-en-periodico`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 34 | ≤ 60 | ≤ 60 |
| lo-que-falta-al-cierre | — ✗ | 56 ✗ | ≤ 60 | ≤ 60 |
| los-datos-de-san-calixto | — ✗ | 128 ✗ | 128 ✗ (al llegar) | 124 ✗ (al llegar) |
| las-1100-unidades | — ✗ | 89 ✗ | 89 ✗ (al llegar) | 89 ✗ (al llegar) |
| el-cierre | 777 px ✗ | 75 ✗ | 83 ✗ (al llegar) | 83 ✗ (al llegar) |
| el-costo-de-lo-vendido | 276 px | 42 ✗ | 70 ✗ (al acertar) | 70 ✗ (al acertar) |
| las-utilidades | — ✗ | 161 ✗ | 161 ✗ (al llegar) | 161 ✗ (al llegar) |
| lado-a-lado | 1143 px ✗ | 129 ✗ | 156 ✗ (al fallar) | 145 ✗ (al fallar) |
| resumen | — ✗ | 59 ✗ | ≤ 60 | ≤ 60 |

### T7-1 · Aprender · `t7-1-a5-importados-y-fletes`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 21 | ≤ 60 | ≤ 60 |
| la-regla-del-costo | — ✗ | 39 | ≤ 60 | ≤ 60 |
| importados | 429 px ✗ | 75 ✗ | 119 ✗ (al acertar) | 119 ✗ (al acertar) |
| fob-cif-cyf | 531 px ✗ | 102 ✗ | 151 ✗ (al fallar) | 151 ✗ (al fallar) |
| flete-del-comprador | 791 px ✗ | 145 ✗ | 237 ✗ (al acertar) | 237 ✗ (al acertar) |
| flete-del-vendedor | 693 px ✗ | 114 ✗ | 189 ✗ (al acertar) | 181 ✗ (al acertar) |
| lado-a-lado | 378 px ✗ | 37 | 80 ✗ (al acertar) | 78 ✗ (al fallar) |
| resumen | — ✗ | 51 ✗ | ≤ 60 | ≤ 60 |

### T7-1 · Aprender · `t7-1-a6-devoluciones-en-periodico`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 13 | ≤ 60 | ≤ 60 |
| que-es-una-devolucion | — ✗ | 70 ✗ | 70 ✗ (al llegar) | 70 ✗ (al llegar) |
| dos-cuentas-propias | 509 px ✗ | 86 ✗ | 133 ✗ (al fallar) | 127 ✗ (al fallar) |
| el-caso | — ✗ | 176 ✗ | 176 ✗ (al llegar) | 176 ✗ (al llegar) |
| cuanto-se-reversa | 124 px | 11 | ≤ 60 | ≤ 60 |
| libro-del-comprador | 267 px | 25 | ≤ 60 | ≤ 60 |
| libro-del-vendedor | 244 px | 26 | ≤ 60 | ≤ 60 |
| lado-a-lado | 593 px ✗ | 58 ✗ | 107 ✗ (al acertar) | 107 ✗ (al acertar) |
| resumen | — ✗ | 46 ✗ | ≤ 60 | ≤ 60 |

### T7-1 · Aprender · `t7-1-a7-control-interno`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 12 | ≤ 60 | ≤ 60 |
| por-que-cuidarlo | — ✗ | 34 | ≤ 60 | ≤ 60 |
| al-recibir | 406 px ✗ | 80 ✗ | 125 ✗ (al acertar) | 125 ✗ (al acertar) |
| controles-de-seguridad | 686 px ✗ | 113 ✗ | 149 ✗ (al fallar) | 149 ✗ (al fallar) |
| resumen | — ✗ | 51 ✗ | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a1-la-cuenta-que-si-se-mueve`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 22 | ≤ 60 | ≤ 60 |
| repaso-del-periodico | — ✗ | 58 ✗ | ≤ 60 | ≤ 60 |
| el-permanente | — ✗ | 129 ✗ | 129 ✗ (al llegar) | 129 ✗ (al llegar) |
| la-lista-del-libro | 213 px | 33 | 88 ✗ (al llegar) | 88 ✗ (al llegar) |
| lo-que-falta-de-la-lista | — ✗ | 54 ✗ | ≤ 60 | ≤ 60 |
| el-conteo-en-el-permanente | 124 px | 9 | ≤ 60 | ≤ 60 |
| resumen | — ✗ | 56 ✗ | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a2-la-venta-en-dos-asientos`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 18 | ≤ 60 | ≤ 60 |
| la-compra | 776 px ✗ | 129 ✗ | 233 ✗ (al acertar) | 227 ✗ (al acertar) |
| la-venta | — ✗ | 198 ✗ | 198 ✗ (al llegar) | 198 ✗ (al llegar) |
| el-segundo-asiento | 215 px | 21 | ≤ 60 | ≤ 60 |
| por-que-dos-asientos | 146 px | 14 | 63 ✗ (al fallar) | 63 ✗ (al fallar) |
| en-el-estado-de-resultados | — ✗ | 86 ✗ | 86 ✗ (al llegar) | 86 ✗ (al llegar) |
| resumen | — ✗ | 51 ✗ | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a3-el-kardex`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 12 | ≤ 60 | ≤ 60 |
| que-es | — ✗ | 66 ✗ | 66 ✗ (al llegar) | 66 ✗ (al llegar) |
| los-datos | — ✗ | 53 ✗ | ≤ 60 | ≤ 60 |
| peps | 255 px | 38 | 96 ✗ (al acertar) | 92 ✗ (al fallar) |
| ueps | 312 px ✗ | 59 ✗ | 109 ✗ (al acertar) | 106 ✗ (al fallar) |
| promedio | 444 px ✗ | 80 ✗ | 107 ✗ (al fallar) | 107 ✗ (al fallar) |
| lado-a-lado | 729 px ✗ | 91 ✗ | 124 ✗ (al acertar) | 112 ✗ (al acertar) |
| resumen | — ✗ | 40 | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a4-san-calixto`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 15 | ≤ 60 | ≤ 60 |
| los-datos | — ✗ | 70 ✗ | 70 ✗ (al llegar) | 70 ✗ (al llegar) |
| peps | 124 px | 12 | ≤ 60 | ≤ 60 |
| ueps | 153 px | 18 | 69 ✗ (al fallar) | 69 ✗ (al fallar) |
| promedio | 196 px | 28 | 61 ✗ (al acertar) | 61 ✗ (al acertar) |
| que-cambia | 456 px ✗ | 70 ✗ | 126 ✗ (al fallar) | 110 ✗ (al fallar) |
| el-cierre | 491 px ✗ | 72 ✗ | 110 ✗ (al acertar) | 110 ✗ (al acertar) |
| resumen | — ✗ | 43 ✗ | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a5-fletes`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 13 | ≤ 60 | ≤ 60 |
| la-regla | — ✗ | 34 | ≤ 60 | ≤ 60 |
| lo-asume-el-comprador | 701 px ✗ | 103 ✗ | 168 ✗ (al acertar) | 168 ✗ (al acertar) |
| lo-asume-el-vendedor | 637 px ✗ | 101 ✗ | 130 ✗ (al acertar) | 130 ✗ (al acertar) |
| el-asiento-del-costo | 215 px | 22 | ≤ 60 | ≤ 60 |
| frente-al-periodico | 203 px | 34 | 74 ✗ (al fallar) | 74 ✗ (al fallar) |
| resumen | — ✗ | 44 ✗ | ≤ 60 | ≤ 60 |

### T7-2 · Aprender · `t7-2-a6-devoluciones`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 15 | ≤ 60 | ≤ 60 |
| que-es | — ✗ | 29 | ≤ 60 | ≤ 60 |
| libro-del-comprador | 981 px ✗ | 125 ✗ | 173 ✗ (al acertar) | 173 ✗ (al acertar) |
| libro-del-vendedor | 1091 px ✗ | 98 ✗ | 107 ✗ (al llegar) | 107 ✗ (al llegar) |
| frente-al-periodico | 168 px | 22 | 63 ✗ (al fallar) | 63 ✗ (al fallar) |
| resumen | — ✗ | 43 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-descuento-comercial`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 17 | ≤ 60 | ≤ 60 |
| repaso | — ✗ | 214 ✗ | 214 ✗ (al llegar) | 188 ✗ (al llegar) |
| dos-clases | 451 px ✗ | 94 ✗ | 116 ✗ (al fallar) | 101 ✗ (al fallar) |
| no-se-registra | — ✗ | 30 | ≤ 60 | ≤ 60 |
| ejemplo | 689 px ✗ | 98 ✗ | 206 ✗ (al acertar) | 188 ✗ (al acertar) |
| resumen | — ✗ | 48 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-descuentos-en-cadena`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 15 | ≤ 60 | ≤ 60 |
| en-cadena | — ✗ | 58 ✗ | ≤ 60 | ≤ 60 |
| ejemplo | 573 px ✗ | 82 ✗ | 108 ✗ (al acertar) | 85 ✗ (al acertar) |
| pasos | 204 px | 29 | 91 ✗ (al acertar) | 82 ✗ (al acertar) |
| atajo | 387 px ✗ | 74 ✗ | 74 ✗ (al llegar) | 74 ✗ (al llegar) |
| asiento | — ✗ | 115 ✗ | 115 ✗ (al llegar) | 115 ✗ (al llegar) |
| resumen | — ✗ | 46 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-descuento-condicionado`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 14 | ≤ 60 | ≤ 60 |
| que-es | 408 px ✗ | 76 ✗ | 105 ✗ (al fallar) | 105 ✗ (al fallar) |
| un-gasto | — ✗ | 35 | ≤ 60 | ≤ 60 |
| condiciones | 521 px ✗ | 104 ✗ | 124 ✗ (al fallar) | 124 ✗ (al fallar) |
| ejemplo | 961 px ✗ | 163 ✗ | 187 ✗ (al llegar) | 170 ✗ (al llegar) |
| cual-le-toca | 168 px | 23 | ≤ 60 | ≤ 60 |
| sobre-que | 102 px | 7 | 102 ✗ (al acertar) | 102 ✗ (al acertar) |
| resumen | — ✗ | 50 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-descuento-en-dos-libros`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 15 | ≤ 60 | ≤ 60 |
| quien-compra | 330 px ✗ | 59 ✗ | ≤ 60 | ≤ 60 |
| repaso | — ✗ | 75 ✗ | 75 ✗ (al llegar) | 75 ✗ (al llegar) |
| el-pago | 168 px | 21 | 103 ✗ (al acertar) | 103 ✗ (al acertar) |
| cierre | 506 px ✗ | 65 ✗ | 140 ✗ (al acertar) | 134 ✗ (al acertar) |
| no-operacional | — ✗ | 40 | ≤ 60 | ≤ 60 |
| permanente | — ✗ | 46 ✗ | ≤ 60 | ≤ 60 |
| resumen | — ✗ | 46 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-sobrantes-y-faltantes`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 18 | ≤ 60 | ≤ 60 |
| el-conteo | — ✗ | 135 ✗ | 135 ✗ (al llegar) | 135 ✗ (al llegar) |
| sobrante | 702 px ✗ | 100 ✗ | 130 ✗ (al acertar) | 122 ✗ (al acertar) |
| faltante | 307 px ✗ | 56 ✗ | 97 ✗ (al acertar) | 92 ✗ (al acertar) |
| la-lista | — ✗ | 24 | ≤ 60 | ≤ 60 |
| resumen | — ✗ | 50 ✗ | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-provision-inventarios`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 16 | ≤ 60 | ≤ 60 |
| que-es | — ✗ | 94 ✗ | 94 ✗ (al llegar) | 94 ✗ (al llegar) |
| ejemplo | — ✗ | 57 ✗ | ≤ 60 | ≤ 60 |
| la-perdida | 124 px | 11 | 61 ✗ (al acertar) | 61 ✗ (al acertar) |
| resumen | — ✗ | 36 | ≤ 60 | ≤ 60 |

### T7-3 · Aprender · `t7-3-nic2-costo`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 48 ✗ | ≤ 60 | ≤ 60 |
| la-norma | — ✗ | 90 ✗ | 90 ✗ (al llegar) | 90 ✗ (al llegar) |
| que-es | — ✗ | 113 ✗ | 113 ✗ (al llegar) | 113 ✗ (al llegar) |
| como-se-mide | 471 px ✗ | 96 ✗ | 135 ✗ (al fallar) | 135 ✗ (al fallar) |
| el-costo | 776 px ✗ | 158 ✗ | 183 ✗ (al fallar) | 183 ✗ (al fallar) |
| resumen | — ✗ | 76 ✗ | 76 ✗ (al llegar) | 76 ✗ (al llegar) |

### T7-3 · Aprender · `t7-3-nic2-formulas`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 43 ✗ | ≤ 60 | ≤ 60 |
| sistemas | — ✗ | 128 ✗ | 128 ✗ (al llegar) | 128 ✗ (al llegar) |
| formulas | 965 px ✗ | 198 ✗ | 227 ✗ (al acertar) | 227 ✗ (al acertar) |
| gasto | — ✗ | 75 ✗ | 75 ✗ (al llegar) | 75 ✗ (al llegar) |
| revelar | — ✗ | 85 ✗ | 85 ✗ (al llegar) | 85 ✗ (al llegar) |
| resumen | — ✗ | 77 ✗ | 77 ✗ (al llegar) | 77 ✗ (al llegar) |

### T5 · Aprender · `t5-a1-cuidar-las-inversiones`

| Pantalla | B1: empieza a | B1: palabras antes | B2: palabras (main) | B2: con plegado |
| --- | --- | --- | --- | --- |
| portada | — ✗ | 12 | ≤ 60 | ≤ 60 |
| por-que-revisar | — ✗ | 41 ✗ | ≤ 60 | ≤ 60 |
| verificar | — ✗ | 60 ✗ | ≤ 60 | ≤ 60 |
| examinar | — ✗ | 26 | ≤ 60 | ≤ 60 |
| confirmar | — ✗ | 43 ✗ | ≤ 60 | ≤ 60 |
| comprobar | — ✗ | 27 | ≤ 60 | ≤ 60 |
| practica | 146 px | 15 | ≤ 60 | ≤ 60 |
| resumen | — ✗ | 52 ✗ | ≤ 60 | ≤ 60 |

### T7-1 · Hacer · `t7-1-que-cuenta-se-mueve`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 301 px ✗ | 47 ✗ |

### T7-1 · Hacer · `t7-1-arma-la-factura`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 860 px ✗ | 153 ✗ |

### T7-1 · Hacer · `t7-1-cuanto-vale-lo-que-sobro`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 598 px ✗ | 82 ✗ |

### T7-1 · Hacer · `t7-1-cierra-el-mes`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 696 px ✗ | 119 ✗ |

### T7-1 · Hacer · `t7-1-costo-o-gasto`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 307 px ✗ | 38 |

### T7-1 · Hacer · `t7-1-devolucion-dos-libros`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 1246 px ✗ | 198 ✗ |

### T7-1 · Hacer · `t7-1-que-control-falta`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 358 px ✗ | 68 ✗ |

### T7-2 · Hacer · `t7-2-debe-o-haber`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 301 px ✗ | 53 ✗ |

### T7-2 · Hacer · `t7-2-dos-asientos`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 761 px ✗ | 122 ✗ |

### T7-2 · Hacer · `t7-2-llena-el-kardex`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 463 px ✗ | 88 ✗ |

### T7-2 · Hacer · `t7-2-periodico-o-permanente`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 343 px ✗ | 54 ✗ |

### T7-2 · Hacer · `t7-2-flete-y-devolucion`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 541 px ✗ | 101 ✗ |

### T7-3 · Hacer · `t7-3-descuento-en-factura`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 739 px ✗ | 127 ✗ |

### T7-3 · Hacer · `t7-3-cadena-de-descuentos`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 800 px ✗ | 139 ✗ |

### T7-3 · Hacer · `t7-3-comercial-o-condicionado`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 289 px ✗ | 45 ✗ |

### T7-3 · Hacer · `t7-3-pago-a-tiempo`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 855 px ✗ | 138 ✗ |

### T7-3 · Hacer · `t7-3-ajuste-por-conteo`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 654 px ✗ | 71 ✗ |

### T7-3 · Hacer · `t7-3-que-entra-al-costo`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 351 px ✗ | 62 ✗ |

### T7-3 · Hacer · `t7-3-costo-o-vnr`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 676 px ✗ | 109 ✗ |

### T5 · Hacer · `t5-temporal-o-largo-plazo`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 489 px ✗ | 105 ✗ |

### T5 · Hacer · `t5-revision-que-falta`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 289 px ✗ | 44 ✗ |

### T5 · Hacer · `t5-el-interes-del-periodo`

| Pantalla | B1: empieza a | B1: palabras antes |
| --- | --- | --- |
| apertura | 369 px ✗ | 58 ✗ |

## La respuesta regalada (lote 2, #229)

Esta lista viene de la prueba `escalera-ayuda.test.mjs`, en main. La regla es
que la cadena de la opción correcta no aparezca en las 2 pantallas anteriores.
Hay dos excepciones: lo que es dato (el enunciado, la ficha, las figuras) y
las opciones.

Son 9 preguntas de 6 piezas, con 19 coincidencias. Cada una va con su
respuesta correcta y el texto donde aparece. Las marcadas «(débil)» tienen una
respuesta de una o dos palabras: puede ser una coincidencia sin regalo, y la
revisión debe confirmarla.

1. **T7-1 · A1 `t7-1-a1-la-cuenta-que-no-se-mueve` · pregunta-conteo.** Correcta: «Inventario de mercancías».
   - pregunta-compra, acierto: «… Inventario de mercancías no se toca. …»
   - la-consecuencia, párrafo 1: «… Por eso Inventario de mercancías no puede estar al día durante el periodo: no se mueve hasta el cierre.»
   - la-consecuencia, párrafo 2: «… Pero no va al debe de su cuenta de activo, Inventario de mercancías, sino al de otra cuenta. …»
2. **T7-3 · A1 `t7-3-descuento-comercial` · dos-clases.** Correcta: «Comercial».
   - portada, objetivo: «Al terminar, sabrás qué es un descuento comercial y cómo se registra una venta que lo tiene.»
3. **T7-3 · A2 `t7-3-descuentos-en-cadena` · ejemplo.** Correcta: «No» (débil).
   - en-cadena, párrafo: «Cada descuento se calcula sobre el saldo que dejó el anterior, no sobre el precio de lista.»
4. **T7-3 · A3 `t7-3-descuento-condicionado` · cual-le-toca.** Correcta: «15 %».
   - condiciones, párrafo: «15/10 quiere decir que el cliente recibe un descuento del 15 % si paga a los diez días.»
   - condiciones y ejemplo, campo «lleva»: «15 %».
5. **T7-3 · A3 `t7-3-descuento-condicionado` · sobre-que.** Correcta: «$3.990.000».
   - ejemplo, después: «… Por eso se factura $3.990.000.»
   - ejemplo, después: «Sobre $3.990.000, el IVA es de $638.400 …»
6. **T7-3 · A4 `t7-3-descuento-en-dos-libros` · el-pago.** Correcta: «Haber» (débil).
   - repaso, párrafo: «… va al haber de Retención en la fuente por pagar.»
   - repaso, lado de las líneas: «haber».
7. **T7-3 · A4 `t7-3-descuento-en-dos-libros` · cierre.** Correcta: «Haber».
   - el-pago, acierto: «Así es. Santa Martha recibe el descuento, así que la cuenta va al haber.»
   - el-pago, después: «… Va al debe cuando la empresa da el descuento, y al haber cuando lo recibe.»
   - el-pago y repaso, lado de las líneas: «haber». Este caso es el regalo más directo.
8. **T7-3 · A5 `t7-3-sobrantes-y-faltantes` · faltante.** Correcta: «Haber» (débil).
   - sobrante, párrafo: «… el sobrante va al debe de Inventario de mercancías y al haber de Costo de mercancía vendida.»
   - sobrante, lado: «haber».
9. **T7-3 · A6 `t7-3-provision-inventarios` · la-perdida.** Correcta: «Provisión para inventarios».
   - ejemplo, cuenta: «Provisión para inventarios».
   - que-es, párrafo: «… y al haber de Provisión para inventarios.»
   - que-es, párrafo: «Lo perdido va al debe de Provisión para inventarios y al haber de Inventario de mercancías.»

**Lo que la prueba no cubre todavía.** Las pantallas de lados (Debe o Haber
por línea) no son preguntas de opción, así que la prueba no las mide.
