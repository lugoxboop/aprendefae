# Medición a 320 y 375 px de las 44 piezas de la Célula C (T7 y T5)

Célula C · Misa · 15 de octubre de 2026. Encargo de L, dentro de la revisión de calidad que pidió Mateo a las cinco células: medir de forma automática todo lo publicado, con el método de `herramientas.md`, **sin cambiar código**. Son las 44 piezas: T7-1 (14), T7-2 (11), T7-3 (15) y las 4 de la Célula C en T5 (N2, N1, N3 y N4).

## Procedencia (los cuatro datos de `herramientas.md`)

1. **Caja.** Todo se mide dentro de la **raíz de la pieza**: en Hacer, el juego que la vista abre (el elemento que sigue a «‹ Volver al camino»); en Aprender, la pieza que sigue a su rótulo «PIEZA n DE N». El desborde, en cambio, se mide en la **página entera**.
2. **Pantalla.** Local, no producción. Build de `main` en `ec49451` (antes de #199) con las claves de mentira de `herramientas.md`, `dist` servido con `python3 -m http.server`. Chromium 141 sin interfaz (`/opt/pw-browsers/chromium`), con Playwright 1.56.
3. **Ancho.** `viewport` de Playwright de 320 × 820 y de 375 × 820. Comprobado con `window.innerWidth`, que dio 320 y 375.
4. **Fuente.** Cargada. Sora e Inter son los mismos archivos de Google Fonts que pide el sitio, descargados y servidos desde disco al navegador. Cada medida se tomó después de `document.fonts.ready`.

**Lo medido es `main` antes de #199.** #199 arregla el título del tema a 320 px. El título vive fuera de la raíz de la pieza, así que no cambia ninguna cifra de esta tabla.

## Cómo se recorre

Un guion entra a cada pieza por su URL (`#/<tema>/hacer/<id>` o `#/<tema>/aprender`) y la juega sola. En cada paso hace lo primero que pueda de esta lista:

1. avanzar con «Empezar», «Seguir», «Siguiente…» o «Ver mi resumen»;
2. llenar los campos vacíos;
3. elegir Debe o Haber en cada línea;
4. confirmar con «Comprobar» o «Confirmar»;
5. tocar una opción que todavía no haya probado en esa pregunta.

Cada estado nuevo de la raíz cuenta como una **pantalla** y se mide. El orden de las opciones es al azar, así que el número de pantallas vistas cambia entre 320 y 375: con un orden distinto, el guion acierta o falla en otro intento y pasa por otros estados.

Qué se mide en cada pantalla:

- **Desborde horizontal:** `scrollWidth − clientWidth` del documento, y los elementos visibles cuyo borde derecho pasa del ancho de la ventana (o el izquierdo de 0). Se excluyen los `fae-mesh-blob` del fondo, que se salen a propósito.
- **Letra mínima:** el `font-size` más chico de los textos visibles de la raíz. Se excluye el rótulo y el título del marco compartido (`Panel`: `section > header`), que son cromo de la plataforma.
- **Palabras:** las palabras visibles de la raíz. «Antes de tocar» es la primera pantalla; «máx.» es la pantalla con más palabras de toda la pieza.
- **Cifras de 7 o más dígitos** (con punto de miles, como 1.463.846): se cuentan si su texto se parte en dos renglones o si se sale de su caja o de la ventana.

## Resultado en una línea

- **Desborde horizontal:** cero en las 44 piezas, a 320 y a 375.
- **Cifras de 7 o más dígitos:** ninguna se parte ni se sale.
- **Letra mínima:** baja de 12 px en 26 piezas. Los textos más chicos son, en casi todos los casos, de componentes compartidos (detalle abajo).
- **Recorrido:** el guion no pasó de la primera pantalla de interacción en 6 piezas a los dos anchos, y en otras 2 solo a 375 (detalle abajo).

## Tabla

Letra mínima: el valor a 320 · 375 y, entre comillas, el texto donde se encontró. «Palabras» y «máx.»: un solo número cuando coinciden en los dos anchos.

### T7-1 · `inventarios-periodico`

| # | Pieza | Clase | Pantallas vistas 320 · 375 | Recorrido | Desborde 320 · 375 | Letra mínima 320 · 375 | Palabras antes de tocar | Máx. palabras en una pantalla | Cifras ≥ 7 díg. partidas o fuera |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | La cuenta que no se mueve (`t7-1-a1-la-cuenta-que-no-se-mueve`) | Aprender | 15 · 11 | completo (resumen final, sin botón) | 0 · 0 | 11.5 · 11.5 px («Basado en el libro, pp. 209 ») | 50 | 204 | ninguna |
| 2 | La factura completa (`t7-1-a2-la-factura-completa`) | Aprender | 6 · 6 | **no pasó**: ubicar fichas de valor en sus huecos | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 210-») | 46 | 136 | ninguna |
| 3 | ¿Qué cuenta se mueve? (`t7-1-que-cuenta-se-mueve`) | Hacer | 13 · 13 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 79 · 78 | 125 | ninguna |
| 4 | Arma la factura (`t7-1-arma-la-factura`) | Hacer | 17 · 16 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 169 | 259 | ninguna |
| 5 | Tres formas de ponerle precio a lo que quedó (`t7-1-a3-tres-formas`) | Aprender | 27 · 20 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 215-») | 47 | 272 | ninguna |
| 6 | ¿Cuánto vale lo que sobró? (`t7-1-cuanto-vale-lo-que-sobro`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («MÉTODO PEPS») | 100 | 131 | ninguna |
| 7 | El cierre en periódico (`t7-1-a4-el-cierre-en-periodico`) | Aprender | 5 · 5 | **no pasó**: ubicar fichas de valor en sus huecos | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 207-») | 54 | 145 | ninguna |
| 8 | Cierra el mes (`t7-1-cierra-el-mes`) | Hacer | 2 · 2 | **no pasó**: tocar cifras para armar la tabla | 0 · 0 | 11 · 11 px («CIFRAS») | 193 | 193 | ninguna |
| 9 | Importados y fletes (`t7-1-a5-importados-y-fletes`) | Aprender | 24 · 20 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 208 ») | 39 | 253 | ninguna |
| 10 | ¿Costo o gasto? (`t7-1-costo-o-gasto`) | Hacer | 17 · 17 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 65 | 217 · 218 | ninguna |
| 11 | Devoluciones en periódico (`t7-1-a6-devoluciones-en-periodico`) | Aprender | 13 · 9 | **no pasó**: ubicar fichas de valor en sus huecos | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 230-») | 29 | 195 | ninguna |
| 12 | La devolución en dos libros (`t7-1-devolucion-dos-libros`) | Hacer | 15 · 15 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 219 | 314 | ninguna |
| 13 | Control interno de los inventarios (`t7-1-a7-control-interno`) | Aprender | 14 · 12 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 208-») | 30 | 168 | ninguna |
| 14 | ¿Qué control falta? (`t7-1-que-control-falta`) | Hacer | 13 · 13 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 101 | 125 · 126 | ninguna |

### T7-2 · `inventarios-permanente`

| # | Pieza | Clase | Pantallas vistas 320 · 375 | Recorrido | Desborde 320 · 375 | Letra mínima 320 · 375 | Palabras antes de tocar | Máx. palabras en una pantalla | Cifras ≥ 7 díg. partidas o fuera |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | La cuenta que sí se mueve (`t7-2-a1-la-cuenta-que-si-se-mueve`) | Aprender | 5 · 5 | **no pasó**: pares Debe/Haber fuera de un bloque `data-linea` | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 207-») | 43 | 162 | ninguna |
| 2 | ¿Debe o haber? (`t7-2-debe-o-haber`) | Hacer | 15 · 15 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 69 · 66 | 91 | ninguna |
| 3 | La venta en dos asientos (`t7-2-a2-la-venta-en-dos-asientos`) | Aprender | 13 · 19 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 234-») | 36 | 251 | ninguna |
| 4 | Arma los dos asientos (`t7-2-dos-asientos`) | Hacer | 9 · 9 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 142 | 219 | ninguna |
| 5 | El kárdex (`t7-2-a3-el-kardex`) | Aprender | 24 · 20 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 237-») | 27 | 197 | ninguna |
| 6 | Llena el kárdex (`t7-2-llena-el-kardex`) | Hacer | 39 · 39 | **no pasó**: elegir método y tocar celdas del kárdex | 0 · 0 | 11 · 11 px («era esta») | 139 | 205 | ninguna |
| 7 | San Calixto en permanente (`t7-2-a4-san-calixto`) | Aprender | 31 · 26 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 238-») | 32 | 207 | ninguna |
| 8 | ¿Periódico o permanente? (`t7-2-periodico-o-permanente`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 111 | 138 · 136 | ninguna |
| 9 | Fletes en permanente (`t7-2-a5-fletes`) | Aprender | 18 · 8 | 320: completo (resumen final, sin botón) · 375: **no pasó**: pares Debe/Haber fuera de un bloque `data-linea` | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 245-») | 29 | 184 | ninguna |
| 10 | Devoluciones en permanente (`t7-2-a6-devoluciones`) | Aprender | 14 · 10 | 320: completo (resumen final, sin botón) · 375: **no pasó**: pares Debe/Haber fuera de un bloque `data-linea` | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 246-») | 31 | 189 | ninguna |
| 11 | Flete y devolución (`t7-2-flete-y-devolucion`) | Hacer | 13 · 13 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 126 | 175 | ninguna |

### T7-3 · `inventarios-descuentos-nic2`

| # | Pieza | Clase | Pantallas vistas 320 · 375 | Recorrido | Desborde 320 · 375 | Letra mínima 320 · 375 | Palabras antes de tocar | Máx. palabras en una pantalla | Cifras ≥ 7 díg. partidas o fuera |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | El descuento comercial (`t7-3-descuento-comercial`) | Aprender | 12 · 12 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 248-») | 36 | 241 | ninguna |
| 2 | Descuento en la factura (`t7-3-descuento-en-factura`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 144 | 238 | ninguna |
| 3 | Descuentos en cadena (`t7-3-descuentos-en-cadena`) | Aprender | 11 · 9 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 249-») | 34 | 141 | ninguna |
| 4 | La cadena de descuentos (`t7-3-cadena-de-descuentos`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 156 | 264 · 273 | ninguna |
| 5 | El descuento condicionado (`t7-3-descuento-condicionado`) | Aprender | 18 · 16 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 251-») | 33 | 259 | ninguna |
| 6 | El descuento en los dos libros (`t7-3-descuento-en-dos-libros`) | Aprender | 12 · 14 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 253-») | 37 | 162 | ninguna |
| 7 | ¿Comercial o condicionado? (`t7-3-comercial-o-condicionado`) | Hacer | 15 · 15 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 60 | 82 | ninguna |
| 8 | Pagó a tiempo (`t7-3-pago-a-tiempo`) | Hacer | 15 · 15 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 154 | 281 | ninguna |
| 9 | Sobrantes y faltantes (`t7-3-sobrantes-y-faltantes`) | Aprender | 8 · 10 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 254-») | 37 | 164 | ninguna |
| 10 | La provisión para inventarios (`t7-3-provision-inventarios`) | Aprender | 8 · 10 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, p. 256») | 36 | 114 | ninguna |
| 11 | Ajuste por conteo (`t7-3-ajuste-por-conteo`) | Hacer | 17 · 17 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 86 | 149 | ninguna |
| 12 | La NIC 2 del libro: el costo (`t7-3-nic2-costo`) | Aprender | 14 · 10 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 256-») | 71 | 207 · 205 | ninguna |
| 13 | ¿Entra al costo? (`t7-3-que-entra-al-costo`) | Hacer | 15 · 15 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 81 | 104 | ninguna |
| 14 | ¿Costo o valor neto realizable? (`t7-3-costo-o-vnr`) | Hacer | 13 · 13 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («CASO 1») | 129 | 201 · 205 | ninguna |
| 15 | La NIC 2 del libro: fórmulas y revelación (`t7-3-nic2-formulas`) | Aprender | 11 · 7 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, pp. 259-») | 67 | 251 | ninguna |

### T5 · `activos-financieros`

| # | Pieza | Clase | Pantallas vistas 320 · 375 | Recorrido | Desborde 320 · 375 | Letra mínima 320 · 375 | Palabras antes de tocar | Máx. palabras en una pantalla | Cifras ≥ 7 díg. partidas o fuera |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | ¿Temporal o a largo plazo? (`t5-temporal-o-largo-plazo`) | Hacer | 19 · 19 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 128 | 159 | ninguna |
| 4 | Cómo se cuidan las inversiones (`t5-a1-cuidar-las-inversiones`) | Aprender | 11 · 11 | completo (resumen final, sin botón) | 0 · 0 | 12 · 12 px («Basado en el libro, p. 193») | 28 | 70 | ninguna |
| 5 | ¿Qué revisión falta? (`t5-revision-que-falta`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 11 · 11 px («era esta») | 75 | 103 | ninguna |
| 7 | El interés del periodo (`t5-el-interes-del-periodo`) | Hacer | 11 · 11 | completo (pantalla de cierre) | 0 · 0 | 10 · 10 px («DEBE») | 80 | 118 · 119 | ninguna |

## Textos de menos de 12 px, por componente

Están ordenados según de quién es el componente, porque eso decide quién lo arregla:

| Tamaño | Texto | Componente | De quién |
| --- | --- | --- | --- |
| 10 px | «DEBE» · «HABER» del asiento con sus sumas | `AsientoEnLineas` (`libros/piezas.jsx`, línea 229) | compartido |
| 10,5 px | «COMPRADOR» · «VENDEDOR» (rótulo del asiento) | `AsientoEnLineas`, con el rótulo que le pasa `t7/DevolucionDosLibros.jsx` | compartido |
| 11,5 px | «Pregunta 3 de 9», «Hecho», «Caso», «Parte» | `Pulsos` (`corazon/juego.jsx`) | compartido |
| 11 px | «RESULTADO», «era esta» | el cierre y la opción revelada de los Hacer | compartido |
| 11 px | encabezado de ítem: «COMPRA», «VENTA», «HECHO 1», «CASO 1» | `TarjetaPregunta` (`t7/hacerT7.jsx`) | Célula C |
| 11 px | «MÉTODO PEPS», «LIBRO DE EL NOGAL», «CIFRAS» | rótulos de figuras y tablas de T7 | Célula C |
| 11,5 px | «Basado en el libro, p. …» de T7-1 · A1 | `t7/LaCuentaQueNoSeMueve.jsx` | Célula C |

En las piezas de Aprender, salvo T7-1 · A1, nada baja de 12 px: el pie va a 12.

## Donde el recorrido automático no pasó

No es una falla de la pieza: es el guion, que no sabe hacer el gesto. Lo medido en esas piezas son las pantallas anteriores al gesto. Lo que viene después hay que revisarlo a mano.

| Pieza | Gesto que el guion no hace |
| --- | --- |
| T7-1 · A2 «La factura completa», A4 «El cierre en periódico», A6 «Devoluciones en periódico» | Tocar una ficha de valor y después el hueco donde va |
| T7-1 · H4 «Cierra el mes» | Tocar las cifras para armar la tabla de los tres métodos |
| T7-2 · H3 «Llena el kárdex» | Elegir un método y tocar las celdas del kárdex |
| T7-2 · A1 «La cuenta que sí se mueve»; A5 y A6, solo a 375 | Pares Debe/Haber que no están dentro de un bloque `data-linea` |

## Lo que esta medición no mira

- **El alto:** cuánto hay que desplazarse en cada pantalla.
- **El contraste.**
- **El tamaño de los blancos táctiles.**
- **Producción:** desde el contenedor de Misa no se puede abrir aprendefae.com, porque el proxy rechaza la conexión. Lo medido es el mismo commit que estaba desplegado (`ec49451`) servido en local, no la página real.
