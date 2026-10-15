---
id: e5-indice-banco
titulo: Índice del banco de ejercicios del capítulo 5 (pp. 262-274)
procedencia: medido
celula: E · Hajime no Ippo
autor: Kamogawa
fecha: 2026-10-14
---

# Índice del banco de ejercicios del capítulo 5

> **PROCEDENCIA.** Cada enunciado se leyó en el PDF del capítulo 5, en la página
> impresa. Cada cifra que aparece aquí se **calculó con código**, no a ojo (el
> script va en el anexo y se puede correr). El inventario de lo que la
> plataforma enseña se levantó sobre `src/data/subjects.js` y los archivos de
> datos de cada pieza en `main` @ `9688e0b` (14 oct 2026, noche; T7 cerrado entero), **no** sobre
> títulos ni memoria.
>
> **Este índice ya se rehízo una vez.** La primera versión se levantó sobre
> `main` @ `4f1dbd0`, media hora antes. Entre las dos entró T7-3 completo
> (#130) y cambió el estado de ocho filas. Se vuelve a medir cada vez que entre
> un tema ajeno; un índice viejo dice «espera» de algo que ya llegó.
>
> **No verificado por mí:** que `main` @ `9688e0b` sea lo que está desplegado
> en aprendefae.com. Aquí «publicado» quiere decir «está en el catálogo de
> `main`». Takamura lo coteja contra el paquete desplegado.

## Para qué sirve este archivo

Decide el orden de todo lo que construye la Célula E. Para cada ejercicio dice
qué secciones del libro necesita para resolverse, cuál es la **última** de
ellas, a qué tema de la plataforma corresponde, y si ese tema ya enseña lo que
el ejercicio exige. Un ejercicio se construye solo cuando todo lo suyo está
enseñado. Lo que no, queda aquí con su número y lo que le falta.

Cita según `fuente.md`: **bloque + número + página** («el 3 del bloque D,
p. 268»).

## La fórmula de pliegos, comprobada

`fuente.md` pide comprobarla una vez antes de confiar en ella. Abierto el
pliego 44: páginas impresas 262 y 263. Pliego 50: 274 y 275. La fórmula
(pliego n = pp. 2n+174 y 2n+175) se cumple en los dos extremos del banco.

## Cómo está hecho el banco

| Bloque | Qué es | Páginas | Ejercicios |
|---|---|---|---|
| A | Temas de discusión | 262 | 5 |
| B | Preguntas sobre el capítulo | 262-263 | 10 |
| C | Selección múltiple con respuesta única | 263-266 | 10 |
| D | Ejercicios de aplicación | 266-274 | 6 |

**31 ejercicios.** A y B son preguntas abiertas: no tienen respuesta única en
el libro y no se califican tal cual. C trae cuatro opciones y una respuesta
calculable. D son casos completos de varias transacciones.

## Qué enseña hoy la plataforma del capítulo 5

Levantado de los archivos de datos, no de los títulos.

| Tema | Sección | En `main` | Lo que enseña de verdad (comprobado en el archivo) |
|---|---|---|---|
| T4 · Efectivo, caja menor y bancos | §5.1-5.2, pp. 179-190 | **nada** | Ningún archivo nombra «caja menor» ni «conciliación». Célula D. |
| T5 · Activos financieros temporales | §5.3, pp. 191-195 | Aprender ×2, Hacer ×2 | Renta fija con interés y con descuento, valor de redención (`contabilidadT5Pieza1.js` l. 68); el criterio de «un año o un ciclo» **solo para activos financieros** (l. 42); los tres momentos de una inversión. |
| T6 · Cuentas por cobrar | §5.4, pp. 195-206 | Aprender ×4, Hacer ×3 | Provisión para deudas incobrables y su asiento (`contabilidadT6Pieza3.js` l. 22-23), la provisión de un año al siguiente, el castigo con provisión (`contabilidadT6Act3.js`), la cuenta castigada que se recupera. |
| T7-1 · Inventarios I, periódico | §5.5, pp. 207-232 | Aprender ×7, Hacer ×7 | Compras, IVA 16 %, retención 3,5 %, PEPS/UEPS/promedio ponderado, costo de mercancía disponible y cierre contra Ganancias y pérdidas (`contabilidadT7_1_ap4.js` l. 190-196), fletes, devoluciones de ventas y de compras (`contabilidadT7_1_a6.js` l. 149-151), control interno. |
| T7-2 · Inventarios II, permanente | §5.5, pp. 233-248 | Aprender ×6, Hacer ×5 | Inventario que sí se mueve, la venta en dos asientos, kárdex con los tres métodos, San Calixto en permanente, fletes y devoluciones en permanente, y su Hacer «Flete y devolución». |
| T7-3 · Descuentos, inventario físico y NIC 2 | §5.5-5.6, pp. 248-261 | Aprender ×8, Hacer ×7 | Descuento comercial y en cadena; **descuento condicionado** y su registro en los dos libros (`contabilidadT7_3_a3.js`, `_a4.js`, Hacer «Pagó a tiempo»); sobrantes y faltantes; provisión para inventarios; NIC 2, costo y valor neto realizable. |
| Temas 1-3 | caps. 1-4 | publicados | Activo corriente y no corriente **solo con Caja, Bancos y activos fijos** (`contabilidad.js` l. 321-332); ajustes acumulados y diferidos, seguros pagados por anticipado (`contabilidadTema3Act5.js`); cierre del periodo. |

**Cómo cuenta los días T7-3, porque decide D.6:** sin el día inicial, y el
descuento aplica también el mismo día del límite. «Del 25 de mayo al 4 de junio
pasaron diez días» (`contabilidadT7_3_a3.js` l. 188); del 3 al 23 de octubre son
veinte y con 4/20 «le toca el 4 %» (`contabilidadT7_3_h4.js` l. 139). Es la
convención que `fuente.md` tiene abierta con el profesor («conteo de días»,
p. 197); el repaso la consume tal como está publicada y no la decide.

**Lo que ningún tema publicado enseña y el banco exige:**

1. **Caja menor y conciliación bancaria** (T4, sin construir).
2. **El criterio general de activo corriente** —«convertirse en dinero en
   efectivo en un periodo inferior a un año», p. 178—. Ver «Lo que sube a
   Erwin»: las pp. 177-178 son de la Célula D.
3. **El ajuste por depreciación.** `grep deprecia` en los datos de
   Contabilidad devuelve una sola línea: una retroalimentación del Tema 2 que
   dice que el terreno no se deprecia. Ningún asiento. La comprobación podía
   fallar: el mismo `grep` sí encuentra «seguro» en cinco archivos.
4. **Separar el IVA de un precio «IVA incluido».** No aparece en ningún
   ejemplo del capítulo 5 ni en ningún archivo de datos.
5. **El IVA en la compra de un activo fijo.** La p. 210 saca terrenos,
   maquinaria y equipos de la cuenta Compras; ningún ejemplo del capítulo
   muestra cómo se registra esa compra con IVA.
6. **Una devolución dentro del promedio ponderado**, y **un descuento
   condicionado sobre una factura a la que ya se le devolvió una parte.**
   Ningún ejemplo del libro hace ninguna de las dos.

## El índice, ejercicio por ejercicio

Estados: **LISTO** (todo lo que necesita está en `main`) · **PARCIAL** (una
parte se puede construir hoy, se dice cuál) · **ESPERA** (le falta una pieza,
se dice cuál) · **ABIERTO** (depende de una pregunta al profesor) · **NO SE
CALIFICA** (pregunta abierta del libro).

### Bloque A · Temas de discusión, p. 262

| Ej. | Qué pide | Secciones que necesita | Última → tema | Estado |
|---|---|---|---|---|
| A.1 | Discutir si el activo corriente es más importante que el no corriente | Intro cap. 5, pp. 178-179 | intro → T4 (Célula D) | NO SE CALIFICA · ESPERA T4 |
| A.2 | Implicaciones del método de valoración en utilidad e impuestos | §5.5, pp. 215-218 y 226-227 | §5.5 → T7-1 | NO SE CALIFICA · el contenido está (AP3, AP4) |
| A.3 | Por qué hace falta gestionar la cartera | §5.4, pp. 198-199 | §5.4 → T6 | NO SE CALIFICA · el contenido está |
| A.4 | Por qué se dice que el sistema periódico rompe la regla de registro de los activos | §5.5, p. 212 | §5.5 → T7-1 | NO SE CALIFICA · el contenido está (AP1) |
| A.5 | Discutir si el método de valoración importa, dado que las unidades físicas son las mismas | §5.5, p. 227 (conclusión 5) | §5.5 → T7-1 | NO SE CALIFICA · el contenido está |

### Bloque B · Preguntas sobre el capítulo, pp. 262-263

| Ej. | Qué pide | Secciones | Última → tema | Estado |
|---|---|---|---|---|
| B.1 | Qué activos son corrientes, con ejemplos | intro, p. 178 | intro → T4 (Célula D) | NO SE CALIFICA · ESPERA T4 |
| B.2 | Procedimientos de control del efectivo | §5.1, pp. 179-180 | §5.1 → T4 | NO SE CALIFICA · ESPERA T4 |
| B.3 | Para qué un fondo de caja menor | §5.1, p. 181 | §5.1 → T4 | NO SE CALIFICA · ESPERA T4 |
| B.4 | Por qué el saldo en libros no coincide con el extracto | §5.2, p. 188 | §5.2 → T4 | NO SE CALIFICA · ESPERA T4 |
| B.5 | Qué significa seguir mostrando cartera irrecuperable | §5.4, pp. 198-200 | §5.4 → T6 | NO SE CALIFICA · el contenido está |
| B.6 | Qué es inventario desde lo financiero | §5.5 p. 207 y §5.6 p. 257 | §5.6 → T7-3 | NO SE CALIFICA · el contenido está (NIC 2) |
| B.7 | Métodos de valoración y ventajas de cada uno | §5.5, pp. 215-218 | §5.5 → T7-1 | NO SE CALIFICA · el contenido está (AP3) |
| B.8 | Por qué el promedio ponderado se acercaría más al valor real del inventario | §5.5, p. 218 | §5.5 → T7-1 | NO SE CALIFICA · errata E-3: la premisa no está en la página |
| B.9 | Descuento comercial frente a financiero | §5.5, pp. 248 y 251 | §5.5 → T7-3 | NO SE CALIFICA · el contenido está |
| B.10 | Fletes y su registro según el sistema | §5.5, pp. 227-229 y 245 | §5.5 → T7-2 | NO SE CALIFICA · el contenido está (T7-1 A5, T7-2 A5) |

### Bloque C · Selección múltiple, pp. 263-266

La respuesta de cada uno se **calculó**, no se tomó de ninguna clave: el libro
no trae clave.

| Ej. | Qué evalúa | Respuesta calculada | Secciones | Última → tema | Estado |
|---|---|---|---|---|---|
| C.1 | Qué grupo es activo corriente | **d** | intro p. 178 | intro → T4 (Célula D) | ESPERA T4 · el Tema 2 solo clasifica Caja, Bancos y activos fijos; la b se separa de la d por «largo / corto plazo» en cuentas por cobrar, que nadie enseña |
| C.2 | Saldo correcto en libros de Bancos | **b · $5.800** = 5.000 − 400 + 1.200 | §5.2, pp. 188-191 | §5.2 → T4 | ESPERA T4 |
| C.3 | Qué son las inversiones con descuento | **c** | §5.3, p. 193 | §5.3 → T5 | **LISTO** (`contabilidadT5Pieza1.js` l. 68) |
| C.4 | Interés de $520.000 al 18 % del 1-mar al 30-jun | libro: **d · $31.460** (121 días / 360) | §5.3, p. 194 | §5.3 → T5 | **ABIERTO** · pregunta 2 de `fuente.md`: el ejemplo de la p. 194 cuenta por meses y daría $31.200, que no está entre las opciones. La a ($31.029) es 121/365. No entra hasta que conteste el profesor |
| C.5 | Asiento del castigo con el método de provisión | **c** | §5.4, p. 200 | §5.4 → T6 | **LISTO** (`contabilidadT6Pieza3.js` y `contabilidadT6Act2.js`, el castigo contra la provisión) |
| C.6 | Qué produce PEPS frente a los otros | **c** | §5.5, pp. 215 y 227 | §5.5 → T7-1 | **LISTO** (AP3, AP4) |
| C.7 | Devolución de ventas en permanente | libro: **b** | §5.5, pp. 247-248 | §5.5 → T7-2 | **PARCIAL** · errata E-2: con el asiento de la p. 248 la **a** también es cierta. Entra solo con el enunciado ajustado y marcado |
| C.8 | Costo de la mercancía vendida | **a · $3.400** = 500 + 4.000 − 300 − 800 | §5.5, pp. 214 y 230 | §5.5 → T7-1 | **LISTO** (AP4 + A6). Las devoluciones de ventas ($1.000) y las ventas ($11.400) son distractores: no entran al costo |
| C.9 | Inventario final con promedio ponderado | **d · $526** = 25 u × $21,04 | §5.5, pp. 218-220 | §5.5 → T7-1 | **LISTO** (AP3). 250 u disponibles, $5.260 de costo, 225 vendidas |
| C.10 | Cómo sale de los libros el inventario inicial en periódico | **c** | §5.5, p. 225 | §5.5 → T7-1 | **LISTO** (AP4) |

### Bloque D · Ejercicios de aplicación, pp. 266-274

| Ej. | Caso | Secciones | Última → tema | Estado |
|---|---|---|---|---|
| D.1 | Tabo Racho S. A., conciliación a sep-30, pp. 266-268 | §5.2, pp. 187-191 | §5.2 → T4 | ESPERA T4. **Cuadra**: los dos lados concilian en **$6.843.000**. Trae algo que el ejemplo del libro no muestra: un error de la propia empresa (cheque de $876.500 registrado por $687.500, diferencia $189.000). La p. 188 lo nombra como causa y ningún ejemplo resuelve su asiento |
| D.2 | La Trompeta Ltda., caja menor de $1.600.000, p. 268 | §5.1, pp. 181-186 | §5.1 → T4 | ESPERA T4. Gastos **$1.531.200**; efectivo esperado **$68.800**; caso 1 ($68.000): faltante **$800**; caso 2 ($70.200): sobrante **$1.400**. El enunciado no dice si el faltante va al cajero o al gasto: la p. 183 da los dos caminos |
| D.3 | El Toro Negro, provisión, castigo y recuperación, pp. 268-269 | §5.4, pp. 199-206 | §5.4 → T6 | **LISTO** desde #136. Historia: estuvo PARCIAL porque el T6 daba la provisión hecha (hallazgo de Takamura) y la p. 201 no aparece; la pieza 5 del T6, «Cómo se calcula la provisión», enseña ahora el método por grupos, así que r5-2 pide el cálculo con los porcentajes del ejercicio y solo los totales por grupo. Errata E-1 resuelta. Provisión **$2.283.400**. Los castigos de marzo suman **$2.450.000** y superan la provisión en **$166.600**: es el caso de la provisión subestimada de las pp. 202-203, que el T6 enseña en su pieza 3 |
| D.4 | Comercializadora Mate Ltda., marzo, periódico y promedio, pp. 269-271 | §5.5 completo, pp. 210-254 | condicionado p. 252 → T7-3 | **PARCIAL**: ver abajo |
| D.5 | Distribuciones Ltda., marzo, permanente y PEPS, con ajustes, pp. 271-273 | §5.5 + ajustes del cap. 4 + depreciación | depreciación → **ningún tema** | ESPERA. El balance de febrero **cuadra** ($9.920.000 = $2.718.000 + $7.202.000) y el inventario coincide (300 × $2.600 = $780.000) |
| D.6 | Comercializadora Barranquilla Ltda., septiembre, los dos sistemas, pp. 273-274 | §5.5 completo | condicionado p. 252 → T7-3 | **PARCIAL**: ver abajo |

#### Lo que bloquea D.4, D.5 y D.6

| Hueco | D.4 | D.5 | D.6 | Quién lo destapa |
|---|---|---|---|---|
| Precio «IVA incluido» | 2-mar, 7-mar | 22-mar | — | **Nadie: no está en el capítulo** |
| IVA en compra de activo fijo | 5-mar (estantería) | 3-mar (muebles) | — | **Nadie: no está en el capítulo** |
| Ajuste por depreciación | — | edificio y equipo | — | **Nadie en el curso publicado** |
| Suministros (cuenta y ajuste) | — | 20-mar y ajuste | — | El patrón es el diferido del T3; la cuenta «Suministros» no está en ningún archivo |
| Devolución dentro del promedio ponderado | 28-mar | — | 8-sep, 15-sep | Ningún ejemplo del libro |
| Condicionado sobre una factura con devolución parcial | — | — (ver nota) | 8-sep → 17-sep; 15-sep → 25-sep | Ningún ejemplo del libro |
| ¿Lleva IVA y retención? | lo dice | lo dice | **el enunciado no lo dice** | Pregunta al profesor |

Nota a D.5: la devolución del 18 de marzo es de la compra del 15, y el pago del
30 es de la compra del 2. No se cruzan. Lo que sí pide es aplicar 10/30 a un
pago hecho el día 28 contado sin el inicial, que la convención publicada ya
cubre.

**D.4 PARCIAL, en concreto:** con lo publicado hoy se pueden armar los asientos
del 1, 10, 15, 20, 25 y 31 de marzo (compra y venta con descuento comercial,
compra con condición 5/15 sin pago todavía, fletes en compras y en ventas,
devolución de ventas), todos con cifras del libro. No el 2, 5 ni 7 (IVA
incluido y activo fijo), ni el 28 (devolución de una compra con descuento: el
valor unitario neto lo deduciríamos nosotros). El estado de resultados de marzo
no, porque necesita todas las transacciones.

**D.6 PARCIAL, en concreto:** la compra de contado del 25 de septiembre (20 %
comercial y flete de $968.750) y la venta del 28 (8 % comercial y flete de
$1.200.000) no tocan ninguna devolución. Pero el enunciado no dice si hay IVA:
**si el libro no lo dice, no se escribe**. Se construyen sin IVA ni retención,
como trae el enunciado, y la pregunta sube al profesor. Hasta que conteste,
D.6 no se publica.

## Erratas y huecos que este índice encontró

| Id | Página | Qué | Cómo se comprobó | Decisión de la célula |
|---|---|---|---|---|
| E-1 | 269 | La fila de la **Cía. Negra** imprime un total de **$3.350.000**; sus celdas suman **$3.550.000**. Las siete columnas y el total general ($38.230.000) cuadran con 3.550.000; la suma de los totales de fila impresos da $38.030.000 | Página rasterizada a 300 ppp, tabla recortada y leída; sumas por código | La errata está en el total de la fila, no en las celdas. **D.3 se construye sobre las columnas**, que es lo que usa la provisión, y no muestra el total de la fila Negra. Ninguna cifra se inventa |
| E-2 | 265 / 248 | En C.7 el libro pide «la» respuesta, pero el asiento de la p. 248 debita **las dos**: Devoluciones de ventas (por el precio) e Inventario de mercancías (por el costo) | Lectura de la p. 248 | C.7 no entra tal cual. Si entra, la pregunta especifica «por el valor de venta» y va marcada como ajustada por la célula |
| E-3 | 218 / 263 | B.8 da por hecho algo que la p. 218 no dice | Lectura de la p. 218 | B.8 no se usa como pregunta calificada |
| E-4 | 189 / 190 | El ejemplo resuelto de conciliación lista el cheque n.° **146** de Laura García en la p. 189 y el n.° **145** en la p. 190 | Lectura de las dos páginas | **No es nuestro:** es del T4. Se le reporta a Erwin para la Célula D |

## Lo que se construye primero

Por el orden del libro dentro de lo LISTO, en lotes que la célula pueda hacer
bien:

| Pieza | Ejercicios | Temas que la sostienen | Mecánica (decisión de Kamogawa) | Dificultad · FP |
|---|---|---|---|---|
| `r5-1` | C.3, C.5, C.6, C.8, C.9, C.10 | T5, T6, T7-1 | Repaso cruzado: seis preguntas que saltan de tema; el estudiante sabe de qué le hablan por la escena, no por un rótulo. Opciones en orden aleatorio en cada intento | Medio · 25 |
| `r5-2` | D.3 completo | T6 | Siete ítems: calcula la provisión por grupos (a0); el ajuste (a); los dos castigos y el saldo de la provisión (b); revive y cobra a la Cía. Roja (c) | Difícil · 50 |
| `r5-3` | D.4: las seis transacciones de «r5-3 · decisiones» (ocho asientos) | T7-1, T7-3 | Diario de la Comercializadora Mate, un asiento por pantalla, con el armador de r5-2 | Experto · 90 |
| `r5-4` | D.6, solo el sistema periódico | T7-1, T7-3 | Diario de Comercializadora Barranquilla, con datos declarados (ver «r5-4 · decisiones») | Experto · 90 |
| `r5-5` | D.6, el kárdex del sistema permanente | T7-2 | Pendiente de diagnóstico propio: la diferencia de costo entre los dos sistemas necesita una pantalla que la explique | — |

Lo demás espera. Al entrar cada pieza ajena, se reabre su fila aquí.

## Lo que se escaló, y cómo quedó

Todo esto ya lo resolvió Erwin la noche del 14 de octubre; queda aquí para que
nadie lo vuelva a descubrir.

1. **Las pp. 177-178 son de la Célula D** (qué es un activo corriente y el
   criterio de un año). C.1, A.1 y B.1 dependen de T4 y se construyen cuando D
   publique, no antes.
2. **Errata E-4**, registrada en `fuente.md` sin confirmar y pasada a la
   Célula D.
3. **Preguntas al profesor**, en la lista de `fuente.md`: el IVA incluido, el
   IVA en la compra de un activo fijo y la depreciación de D.4 y D.5; si los
   «clientes varios» de D.4 practican retención; la retención de IVA de un
   gran contribuyente; si D.6 lleva IVA; y el C.4.
4. **La provisión por edades ya se enseña.** La p. 201 no aparece, pero la Célula B
   publicó en el Tema 6 «Cómo se calcula la provisión» (#136): grupos por
   vencimiento, el porcentaje que fija la empresa y la suma, con el Decreto 1625
   de 2016, art. 1.2.1.18.21 como referencia. Con eso **D.3 vuelve a LISTO** y
   r5-2 gana la etapa (a0) «Calcula la provisión» con los porcentajes del propio
   ejercicio (los de la empresa, no los del decreto) y solo los totales por
   grupo: la fila de la Cía. Negra (errata E-1) no aparece.
5. **Íconos** de tema, `r5-1` y `r5-2`: reservados por Erwin con los significados
   de Itagaki; los dibuja Xeno.

## r5-3 · decisiones de Kamogawa sobre D.4

Diagnóstico de Miyata, cifras verificadas en código. Entran las seis
transacciones sin IVA incluido ni activo fijo: 1, 10, 15 (compra y flete), 20,
25 y 31 (venta y flete) de marzo, ocho asientos, Experto · 90 FP. Datos
**declarados por la célula**, visibles en el enunciado y subidos al profesor:

- Los «clientes varios» no practican retención (la plataforma siempre dio esa
  retención como dato del ejercicio, y el libro no la da aquí).
- No se aplica retención de IVA (ninguna pieza publicada la enseña; búsqueda
  de «gran contribuyente», «retención de IVA» y «reteIVA» vacía, con control
  positivo).
- Los descuentos del 15 y del 31 son comerciales: el libro escribe las
  condiciones cuando el descuento es condicionado (el 25 trae «5/15, n/30»), y
  estos dos no las traen.
- El flete de ventas va a «Gasto de venta – fletes» con retención del 1 %,
  como lo enseña Inventarios I (`contabilidadT7_1_a5.js`, libro p. 229).
- En el flete del 15 se aceptan como correctas «Compras (fletes)» y «Compras»
  (asiento completo con una o con la otra, nunca mezclado): las dos son
  defendibles en el periódico. Los dos fletes se declaran visibles: el servicio
  vale $240.000 / $200.000 y sobre ese valor se calcula la retención.
- Hoja de doce cuentas fija, sin Bancos ni IVA descontable. Cada asiento: un
  hecho de hasta 90 caracteres más hasta 5 renglones «etiqueta · valor».

## r5-4 · decisiones de Kamogawa sobre D.6

Diagnóstico de Miyata. Solo el periódico; el permanente va aparte (r5-5).
Datos declarados y visibles:

- El enunciado no trae IVA ni retención en ninguna parte: se arma sin ellos y
  se dice en pantalla.
- «5 %» es comercial; «10/15» y «5/15» son condicionados.
- Nadie enseña a descontar sobre una factura con devolución parcial: el hecho
  da el saldo de la factura ya restada la devolución ($9.395.500 y
  $52.200.000) y el estudiante aplica el descuento sobre ese saldo.
- El pago del 17 y el cobro del 25 caen a los 15 días: con el conteo publicado
  (sin el día inicial, y el descuento aplica el día del límite) ganan el
  descuento. La convención sigue abierta con el profesor en `fuente.md`.
- La venta del 10 no dice «clientes varios»: se toma como un solo cliente.

## Anexo · el script del cuadre

Se corre con `python3 -I`. Las cifras de arriba salen de aquí.

```python
cols=["vig","1-30","31-60","61-120","121-180","181-360",">360"]
t={"Roja":(3950000,[0,0,1000000,2000000,0,950000,0]),
"Blanca":(5200000,[4100000,1100000,0,0,0,0,0]),
"Azul":(2980000,[1800000,280000,400000,500000,0,0,0]),
"Negra":(3350000,[0,0,0,150000,700000,1200000,1500000]),
"Rosa":(3450000,[2000000,1450000,0,0,0,0,0]),
"Marron":(8200000,[5000000,2300000,900000,0,0,0,0]),
"Verde":(10900000,[0,3200000,4500000,2050000,1150000,0,0])}
imp={"vig":12900000,"1-30":8330000,"31-60":6800000,"61-120":4700000,
"121-180":1850000,"181-360":2150000,">360":1500000}
for k,(tot,c) in t.items():
    if sum(c)!=tot: print(k,"impreso",tot,"suma",sum(c))   # Negra 3350000 / 3550000
pct=[0,.03,.03,.10,.12,.25,.40]
print(sum(round(imp[c]*p) for c,p in zip(cols,pct)))      # 2283400
print(5000-400+1200)                                        # C.2 5800
print(520000*.18*121/360, 520000*.18*4/12)                  # C.4 31460 / 31200
print(500+4000-300-800)                                     # C.8 3400
u=250; c=70*18+100*20+80*25; print((u-225)*c/u)            # C.9 526
g=[154000,235000,98300,243100,107200,314100,147500,232000]
print(1600000-sum(g))                                       # D.2 68800
ch=[156000,203000,97000,125000,435000,102000,923000]
print(3921000+3759000+1204000-sum(ch),                      # D.1 6843000
      6698500+326000+831000+224000-283500-236000-528000-(876500-687500))
```
