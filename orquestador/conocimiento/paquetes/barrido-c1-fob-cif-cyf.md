Para L

# Barrido C1: T7-1 A5 `fob-cif-cyf`, T7-1 A6 `dos-cuentas-propias` y T7-2 A2 `la-compra`

**Resumen.**
- **A6 y la-compra ya estaban cubiertas** por entregas que no se han construido: A6 por la entrega 7 y la-compra por la entrega 6. Abajo copio la versión que ya entregué y la comprobación de C1. No las rehago.
- **A5 sí la rehago.** En mi entrega 7 ya era un caso, pero seguía resolviéndose por palabras: la ficha «FOB: libre a bordo» frente a «hasta subir la mercancía al buque». Va con la línea del viaje que propusiste.

**Cómo cuento.** Cuento todo lo que se ve a la vez: el texto, los rótulos de la figura, las opciones y el mensaje. INFLESZ, con `npm run inflesz`.

---

## 1. T7-1 A5 · `fob-cif-cyf` → «El viaje de la compra» (rehecha)

**Figura (C8).** Es una línea con los cinco tramos del viaje, de la bodega del vendedor a la del comprador. Sigue en pantalla durante los dos pasos. Al resolver cada paso, cada tramo queda marcado con quién lo paga.

| Tramo (rótulo) | Palabras |
| --- | --- |
| «Transporte al puerto» | 3 |
| «Subir al buque» | 3 |
| «Flete del buque» | 3 |
| «Seguro en el mar» | 4 |
| «Transporte a la bodega» | 4 |
| Leyenda que aparece al resolver: «Vendedor» · «Comprador» | 2 |

**[CONSTRUCCIÓN]** Los tramos son genéricos. El libro (p. 228) define las tres condiciones, pero no trae un viaje con tramos.

**Un límite del libro que la pantalla respeta.**
- Solo FOB fija un punto en el viaje: «hasta que la mercancía está a bordo del buque».
- C&F reparte por conceptos: el costo y el flete van por cuenta del vendedor, y el seguro por cuenta del comprador.
- CIF deja el punto al contrato.

Por eso FOB se juega sobre la línea, C&F se juega por concepto y CIF va en una frase. No le invento a CIF un punto en la línea: sería un HUECO llenado a ojo.

### Paso 1 · FOB (se tocan varios tramos y luego «Comprobar»)

| Campo | Texto | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto | «FOB quiere decir «libre a bordo». Una compra al exterior se pacta FOB. Toca los tramos que paga el comprador.» | 20 | 94,3 |
| Correctos | «Flete del buque» · «Seguro en el mar» · «Transporte a la bodega» | — | — |
| Pista (1.er error, si le faltó alguno) | «Piensa en qué punto del viaje la mercancía queda «a bordo». ¿Quién paga desde ahí?» | 15 | 91,3 |
| Retro (1.er error, si tocó «Transporte al puerto» o «Subir al buque») | «Ese tramo va antes de que la mercancía esté a bordo: lo paga el vendedor.» | 15 | 83,8 |
| 2.º error | «El vendedor paga hasta que la mercancía está a bordo. Desde ahí paga el comprador.» | 15 | 78,9 |
| Acierto | «Así es: con FOB, el vendedor paga hasta que la mercancía está a bordo. El resto va al costo del comprador.» | 21 | 92,5 |

- «El resto va al costo del comprador» une el caso con lo que el estudiante acaba de ver en `importados`: todo gasto directo para tener la mercancía se suma al costo.
- El estudiante no busca la palabra «bordo» en una opción. Tiene que decidir qué tramos van después de ese punto.

### Paso 2 · C&F (se toca un tramo; la figura sigue con lo del paso 1)

| Campo | Texto | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Texto (reemplaza al del paso 1) | «Ahora es C&F: «costo y flete». ¿Qué tramo pasa al vendedor?» | 11 | 97,0 |
| Correcto | «Flete del buque» | — | — |
| Pista (1.er error) | «Busca en «costo y flete» qué gasto del viaje se nombra.» | 11 | 99,6 |
| Retro (si tocó «Seguro en el mar») | «El seguro no está en «costo y flete»: sigue siendo del comprador.» | 12 | 85,8 |
| 2.º error | «Pasa el flete del buque. El seguro sigue siendo del comprador.» | 11 | 88,1 |
| Acierto | «Así es: el flete pasa al vendedor, y el seguro sigue siendo del comprador. Con CIF, el vendedor paga todo hasta el punto que fije el contrato.» | 27 | 84,9 |

**Conteo a la vista**

| Momento | Cuenta | Total |
| --- | --- | --- |
| Paso 1, antes de tocar (B1 ≤ 40) | 20 + 17 | **37** |
| Paso 1, primer error | 37 + 15 | **52** |
| Paso 1, segundo error | 37 + 15 + 2 | **54** |
| Paso 1, acierto | 37 + 21 + 2 | **60** |
| Paso 2, antes de tocar | 11 + 17 + 2 | **30** |
| Paso 2, primer error | 30 + 12 | **42** |
| Paso 2, acierto | 30 + 27 | **57** |

**C1.** Nada de lo que se responde está escrito antes de la pregunta:
- «a bordo» viene en el nombre de la condición, que es justo lo que hay que aplicar a los tramos;
- «flete» viene en el nombre «costo y flete», y hay que encontrarlo entre cinco tramos.

**C7.** El límite de C&F («el seguro, por cuenta del comprador») y el de CIF («hasta el punto que indique el contrato») quedan a la vista en el acierto, no plegados.

**Pie:** «Basado en el libro, p. 228».

| Campo | Viejo (publicado) | Nuevo |
| --- | --- | --- |
| Párrafos | Los cuatro párrafos con las definiciones de FOB, CIF y C&F | Salen. Las definiciones llegan con los aciertos. |
| Pregunta | «Una compra al exterior se pacta FOB. ¿Hasta dónde corre el vendedor con los gastos?» | Paso 1: tocar los tramos del comprador. Paso 2: tocar el tramo que cambia con C&F. |
| Opciones | Tres frases; la correcta, copiada del párrafo 2 | Los cinco tramos de la figura |
| Errores | «Esa es la condición CIF…» · «Esa es la condición C&F…» | Una pista y una retro propias en cada paso, y la respuesta en el segundo error |
| Mi entrega 7 (P2) | Tres fichas con el nombre de cada condición y el caso «hasta subir la mercancía al buque» | La reemplaza esta versión |

**Para Misa:** la figura es nueva: una línea de 5 tramos, con selección múltiple en el paso 1 y un solo toque en el paso 2. Es Aprender: no da FP.

---

## 2. T7-1 A6 · `dos-cuentas-propias`: ya cubierta por la entrega 7

En la entrega 7, el párrafo de la razón ya no está y la pantalla es un caso:

| Campo | Texto (entrega 7) | INFLESZ |
| --- | --- | --- |
| Caso | «El contador de El Tajamar no quiere usar Devoluciones de ventas. Quiere restar la devolución de Ingresos por ventas.» | 65 o más (medido en la entrega 7) |
| Pregunta | «¿Qué deja de saber la gerencia?» | no aplica |
| Opciones | «Cuánto se devolvió en el periodo» (correcta) · «Cuánto le debe el cliente» · «Cuánto IVA cobró» | — |
| Pista | «Piensa qué número se pierde si todo queda mezclado en una sola cuenta.» | — |
| Errores | «Eso sigue a la vista en Cuentas por cobrar – clientes.» · «El IVA se reversa aparte, en IVA por pagar.» | — |
| Acierto | «Así es: con una cuenta aparte, la gerencia ve cuánto se devolvió.» | — |

**C1:** «cuánto se devolvió» no aparece antes de la pregunta en esta pantalla, ni en las dos anteriores (los libros del comprador y del vendedor). B1 y B2 se cumplen: 25 palabras antes de tocar y como máximo 52 a la vista.

**Un ajuste por C7.** En la entrega 7, el acierto pliega tres líneas: cómo resta cada cuenta de devoluciones y que las dos se cierran contra Ganancias y pérdidas. No son condiciones que limiten una regla, así que pueden seguir plegadas. Si Mello las lee como condición, la línea del estado de resultados no cabe tal cual: la pantalla pasaría de 51 a 65 palabras. En ese caso, el acierto pasaría a ser «Así es: aparte se ve cuánto se devolvió. En el estado de resultados, esa cuenta resta de Ingresos por ventas.» (20 palabras · 81,6). Así la pantalla queda en 59.

---

## 3. T7-2 A2 · `la-compra`: ya cubierta por la entrega 6

En la entrega 6, el párrafo con la regla ya no está. La pantalla queda así:

| Campo | Texto (entrega 6) |
| --- | --- |
| Texto | «Ahora La Reventa usa el sistema permanente.» · «El 16 de abril compra mercancía por $5.000.000, a crédito.» |
| Pregunta | «¿A qué cuenta va al debe?» |
| Opciones | «Inventario de mercancías» (correcta) · «Compras» · «Costo de mercancía vendida» |
| Pista | «Ahora la empresa usa el permanente. Recuerda qué cuenta deja de estar quieta en este sistema.» |
| Errores | «Compras es la cuenta del periódico. En el permanente no se usa.» · «Esa cuenta se usa al vender, no al comprar.» |
| Acierto | «Así es: un activo que aumenta va al debe de su cuenta.» Debajo, el asiento de la compra con sus cuatro líneas. |

La regla llega con el acierto, como pides. Hay una diferencia con lo publicado: la pista de la entrega 6 no es la de main («La mercancía que se compra es un activo. En el permanente se anota apenas entra.»).
- **Cualquiera de las dos sirve.** Las dos orientan sin nombrar la cuenta.
- **Me inclino por la de main**, porque nombra «activo» y el acierto cierra con «un activo que aumenta». Decide Misa al construir; para mí da igual.

**C1:** «Inventario de mercancías» no está en esta pantalla antes de la pregunta. La pantalla anterior es la portada, que tampoco lo nombra.
