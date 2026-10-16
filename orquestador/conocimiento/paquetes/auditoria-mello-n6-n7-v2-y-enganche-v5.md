# Auditoría · N6 v2, N7 v2 (T5) y Patrón de enganche C: A1 v4 y A7 rehecha

Mello → L · 15 de octubre de 2026

**Fuentes que crucé:**
- **El libro.** Releí la p. 193 sobre la imagen, porque el OCR había perdido el párrafo de la compra. El libro dice:
  - La compra suma, «además del precio que se paga por la misma, los gastos en que se incurre para el proceso de la compra».
  - Lo que rinde la inversión se anota «cuando se recibe»: a ingresos por dividendos si viene de acciones, y a interés si viene de «cualquier otro título valor».
- **El canon:** la decisión de corte v1.1 y el registro 5c que Near adjunta.
- **El artefacto, en la versión que trae publicada:** el encabezado dice v5 y la sección de A7, v4. El código que se ejecuta es idéntico, letra por letra, al código de referencia publicado de A1, A7 y A4, y jugué A1 en un DOM simulado.

| Pieza | Veredicto |
| --- | --- |
| N6 «Lo que el ejemplo no trae» v2 | **PASA CON CORRECCIONES** (una falsedad: «lo que se paga después, no») |
| N7 «¿A qué cuenta va?» v2 | **PASA CON CORRECCIONES** (los 10 aciertos se sostienen con un cambio) |
| A1 v4 | **Las 7 correcciones están aplicadas.** Queda un fallo que se me pasó en la primera auditoría: mover el día hacia atrás. |
| A7 rehecha | **PASA CON CORRECCIONES** (una falsedad: la hoja vuela en el caso 1) |

---

## 1. Cifras de N6 y N7 y registro 5c: pasan

- **Las 40 filas del registro**, recalculadas con código: 0 errores. Ninguna cifra se repite entre piezas.
- **Ninguna cifra construida** está en la lista prohibida ni en mi lista de cifras del libro (pp. 191-198, el banco y pp. 206-275).
- **Las cuentas cuadran:** 1.210.000 + 18.000 = 1.228.000 · 2.150.000 + 34.000 = 2.184.000 · 58.000 + 31.000 = 89.000.
- **Los nombres son nuevos:** Yarumo y Guayacán no aparecen en el repo.
- **INFLESZ.** Medí con mi estimador los textos declarados de las dos piezas: todos dan 65 o más. El más justo es el hecho 3 de N7, con 65,6, y lo reemplazo en la corrección N7-1.

---

## 2. N6 «Lo que el ejemplo no trae» v2: PASA CON CORRECCIONES

### Lo que pasa

- **Gastos al costo.** La cita es literal (p. 193), y el error típico se pregunta antes de dar la regla.
- **Dividendo solo cuando llega**, Caja contra Ingresos por dividendos. No hay dividendos por cobrar ni dividendo por acción.
- **Con gastos, la pieza no trae** interés, costo por título ni venta.
- **El descuento va en una línea** que remite a `b5-t5-a1`.
- **E8.** La factura muestra los dos renglones sin su suma.
- **El hueco del depósito se dice en pantalla**, sin inventar a qué cuenta va.
- **«Las acciones dan dividendo, no interés»** está en la p. 193.

### Correcciones (obligatorias)

**N6-1 · Falsedad: la condición del libro cambia por una de tiempo (p. 193, regla C7).**
- El libro suma los gastos «para el proceso de la compra»; la condición es para qué se pagó el gasto, no cuándo.
- La pieza enseña otra cosa: la opción correcta dice «No: vino después.», el resumen dice «Lo que se paga después, no.» y la pista empieza por «cuándo pasó».
- Eso es falso como regla: una comisión de la compra que se paga días después sí va al costo.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| P2, opción correcta | «No: no fue para comprarlas.» | 5 | no aplica |
| P2, pista | «Piensa para qué se pagó ese gasto. ¿Hizo falta para comprar las acciones?» | 13 | 85,3 |
| P2, 2.º error | «No se suma. El libro solo suma los gastos del proceso de la compra, y este se pagó por guardarlas.» | 20 | 97,2 |
| P4, resumen (línea 1) | «Los gastos del proceso de la compra van al costo de la inversión. Lo que se paga por otra cosa, como guardarlas, no.» | 23 | 97,8 |

El caso puede seguir pasando «un año después»: es un dato del caso, no la regla.

**N6-2 · P3 se resuelve emparejando palabras (regla 9 de Mello).**
- El caso dice «reparte **dividendos**» y la opción correcta es «Ingresos por **dividendos**». La pista también usa la palabra.
- N7 ya resolvió esto. Que N6 lo haga también, para que la pregunta de P3 pida decidir entre dividendo e interés.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| P3, caso | «Más tarde, la empresa de esas acciones reparte entre sus dueños una parte de lo que ganó. A Yarumo le llega su parte en efectivo.» | 25 | 82,2 |
| P3, pista | «Lo que llega no devuelve parte de lo invertido: es lo que las acciones rindieron.» | 15 | 83,8 |
| P3, acierto | «Así es. Eso es un dividendo y se anota cuando llega: Caja se debita y se acredita Ingresos por dividendos.» | 20 | 72,2 |
| P0, portada | «Yarumo compra acciones y paga gastos para hacer la compra. Después, las acciones le dan algo. Vas a ver a qué cuenta va cada cosa.» | 25 | 93,8 |

La palabra «dividendo» ya está enseñada: la p. 192 la da, y `b5-t5-a2` también.

---

## 3. N7 «¿A qué cuenta va?» v2: PASA CON CORRECCIONES

### Lo que pasa

- **Sin venta ni descuento.**
- **Con gastos, sin interés ni costo por título.** El interés sale de títulos que Guayacán ya tenía.
- **Todo rendimiento se anota al recibirse.**
- **El cruce de interés y dividendo** es el criterio de la p. 193: acciones dan dividendo; el CDT y el bono, interés.
- **«Pagó con un cheque»** lleva a Bancos sin nombrarlo.
- **Los distractores son defendibles y ninguno es también correcto.**
- **Ninguna pista nombra la cuenta.**

### Corrección (obligatoria) y los 10 aciertos

**N7-1 · Tres líneas iguales en tres hechos seguidos.**
- Los hechos 2, 3 y 4 tienen la misma línea: Caja al debe. El libro de arriba deja a la vista el asiento anterior (C8).
- Así, la segunda y la tercera se copian. De 10 aciertos, solo 8 son decisiones distintas.
- **Corrección:** en el hecho 3, el dividendo llega por transferencia. La línea correcta pasa a ser Bancos al debe, con Caja e Inversiones – títulos como distractores.
- Así cada hecho decide entre Caja y Bancos. Además, el hecho 3 ya no nombra el banco: «transferencia» no es la palabra de la cuenta.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Hecho 3 | «La empresa de las acciones que compró Guayacán reparte dinero entre sus dueños. A Guayacán le pagan $75.000 con una transferencia.» | 21 | 68,8 |
| Línea $75.000, correcta | Bancos · Debe (distractores: Caja · Inversiones – títulos) | — | — |
| Pista (1.er error) | «Esta vez no le dan efectivo. ¿A qué cuenta llega una transferencia?» | 12 | 86,6 |
| Respuesta (2.º error) | «Una transferencia entra a Bancos. Un activo que aumenta va al debe.» | 12 | 81,4 |

- **Con N7-1, los 10 aciertos se sostienen:** 1 casilla, más 2 + 2 + 2 + 3 líneas, y cada una es una decisión propia.
- **Quitar la segunda compra está bien:** repetía la primera.
- **La migración 0114** todavía no ha corrido, así que el número se puede corregir; lo ejecuta Erwin.

---

## 4. A1 v4: correcciones aplicadas

Lo verifiqué leyendo el código y jugando la pieza en un DOM simulado.

| # | Corrección | Estado |
| --- | --- | --- |
| 1 | Al cierre, Haber 30 abr 4.000.000 y Debe 30 abr 2.500.000, sin tachados | ✓ (0 tachados en todos los estados) |
| 2 | El libro sigue al día: Compras desde el 16, el cierre solo el 30 | ✓ (día 15: Compras vacía; día 1 en la pantalla 6: sin cierre) |
| 3 | E8: el conteo sin el total | ✓ «5 cajas · $500.000 cada una» |
| 4 | «Sin contar», el mensaje de venta y el texto de la pantalla 6 | ✓ |
| 5 | La tercera cuenta, «se aparta de la norma», y tocar la cuenta del cierre antes del valor | ✓ |
| 6 | Las retros del valor | ✓ |
| 7 | Un solo costo unitario | ✓ |
| — | La escalera de ayuda en las tres preguntas | ✓ |

**A1-N1 · Falsedad: mover el día hacia atrás narra hechos que no ocurrieron.** Se me pasó en la primera auditoría; es el mismo fallo que el F1 de A4.

| Si el estudiante | La pieza dice |
| --- | --- |
| Vuelve del día 9 al 5 | «Llegaron 3 cajas.», y las cajas caen desde arriba como si fueran una compra |
| Vuelve del día 16 al 15 | El mensaje de una venta, «Salió mercancía. Se anota lo cobrado…», y el candado late, aunque lo que se deshace es la compra |
| Va del 1 al 16 de un salto | Solo el mensaje de la venta, aunque también llegó la compra |

**Corrección:** en `mover()`, si `d < s.dia` o si el salto cruza más de un hecho:
- `s.msg = ''`;
- las cajas aparecen o se van sin animación;
- el candado no late.

Los mensajes y las animaciones quedan solo para avanzar hasta el hecho siguiente.

**Menor:** «Gastos no guarda mercancía. Lo que quedó va a otra cuenta.» es un texto de Watari (11 palabras; INFLESZ 93,7) y pasa.

---

## 5. A7 rehecha: PASA CON CORRECCIONES

### Lo que pasa

- **La caja solo recorre Recepción → Bodega → Salida.**
- **Contabilidad cuelga de Recepción con un trazo punteado.** Lo que le llega es la hoja «Informe de recepción · si todo llegó bien» (p. 208).
- **Conteos cuelga de Bodega**, con «Cada cierto tiempo» y «Contar y comparar, también al azar». Las seis medidas de la p. 209 quedan nombradas.
- **Si el estudiante toca una estación fuera de la línea, la caja no va hasta ella.** En el caso 3, al acertar, la caja se queda en Bodega: es la mercancía que se cuenta.
- **El caso 1** ya no tiene caja fantasma, y la ficha dice «Diferencia: 20 cajas».
- **Las glosas están, y la escalera funciona:** el segundo error marca la estación correcta.

### Correcciones

**A7-1 · Falsedad: la hoja del informe vuela en el caso 1 (obligatoria; p. 208).**
- En el código, `ponerY()` lanza la hoja hacia Contabilidad cada vez que la caja cruza Recepción, sin mirar la pantalla.
- En el caso 1, la caja da vueltas sin parar mientras el estudiante decide. En cada vuelta sale un informe de recepción para una mercancía que no llegó bien, porque la factura no coincide con la orden. Lo mismo pasa si toca Bodega o Salida, porque la caja cruza Recepción.
- El libro hace el informe solo «después de que la mercancía se haya recibido a satisfacción», y el propio rótulo de la hoja lo dice.
- **Corrección:** en la pantalla del caso 1 (`p2`), la hoja nunca vuela: ni antes ni después de acertar. Una condición en `ponerY`: `PANTALLAS[s.p].id !== 'p2'`. En las demás pantallas sigue igual.

**A7-2 · El caso 3 todavía es el texto que yo mismo retiré (obligatoria).** En mi auditoría de la entrega D, el caso 3 de A7 chocaba con el nuevo `falta-mercancia` de H7. Va el reemplazo, con su ficha y los mensajes que dependían del texto viejo:

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Caso 3 | «La tienda abrió hace dos años. Desde entonces, lo que hay en la bodega solo se sabe por los libros.» | 20 | 97,2 |
| Ficha | «Solo lo dicen los libros» (24 caracteres; no dice «contar», para no emparejar con la estación) | — | — |
| Error en Recepción | «Recibir bien no dice cuánto queda dos años después.» | 9 | no aplica |
| Error en Bodega | «Techo y puertas cuidan la mercancía, pero nadie la ha contado.» | 11 | 76,9 |

El acierto, la pista y los errores de Contabilidad y Salida se quedan como están.

**Menor (solo en la ficha técnica, no en la pieza):** en «Las seis medidas de la p. 209», la factura contra la orden y el informe de recepción son de la p. 208.

---

## 6. Nota

A4 ya está en esta misma publicación como «corregida». No la audito aquí, porque L la anunció para la v5: va en mi siguiente entrega si L la manda.
