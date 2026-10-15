**MELLO → L · Pistas del lote 2 (en main, #249), terceras opciones y distractores de cuenta del lote 3**

Medí con mi estimador cada texto de reemplazo y todos dan 65 o más. Antes de fusionar, hay que pasarlos por `npm run inflesz`.

**Balance:**
- **Pistas:** 13 de 80 delatan la respuesta. Cuatro lo hacen con una palabra, una con la frase que la pieza usa para describir la cuenta y ocho al descartar los demás distractores.
- **Terceras opciones:** pasan las 10. Ninguna es absurda y ninguna es también correcta.
- **Distractores de cuenta:** dos retroalimentaciones enseñan algo falso, una toma partido en el hueco que sigue abierto con el profesor y una usa «reservó». Los nombres de cuenta cumplen la regla 8 en las 88.

Las pistas de Debe o Haber (²) explican el lado, como decidiste en la opción (a). Ahí está bien que orienten, así que no las cuento como fallas.

---

### Pistas que corregir (parche sobre main)

**Delatan con una palabra o con la frase que define la cuenta:**

| Pieza · pregunta | Problema | Pista nueva |
| --- | --- | --- |
| T7-1 A1 · `pregunta-compra` | «Lo comprado» lleva directo a «Compras». **La había propuesto yo, y era un error.** | «En el periódico, ¿qué cuenta junta en el periodo la mercancía que se trae para vender?» |
| T7-1 A1 · `pregunta-conteo` | «La cuenta que estuvo quieta» es la frase con que la pieza describe la respuesta | «El conteo dice cuánto vale lo que quedó en la bodega. ¿Qué cuenta debería mostrar ese valor?» |
| T7-1 A5 · `flete-del-comprador` | «Lo suma a lo comprado» lleva a «Compras (fletes)» | «Para Santa Martha, este flete es parte del costo de su mercancía. Piensa qué cuenta guarda ese costo en el periódico.» |
| T7-1 A7 · `al-recibir` | «La factura y la orden de compra» es casi el texto de la opción correcta | «El libro pide que el control empiece lo antes posible. ¿Cuál de estos momentos llega primero?» |
| T7-2 A2 · `la-compra` | «Qué cuenta deja de estar quieta» es el título de A1 de T7-2 | «La mercancía que se compra es un activo. En el permanente se anota apenas entra.» |

**Delatan porque descartan los demás distractores** (después del primer error solo queda la correcta):

| Pieza · pregunta | Lo que descarta | Pista nueva |
| --- | --- | --- |
| T7-1 A5 · `importados` | «no en gastos de oficina» | «El costo incluye todo lo que hay que pagar para tener lista la mercancía. ¿Cuál de estos lo cumple?» |
| T7-1 A5 · `lado-a-lado` | el valor y la forma de pago, que son los dos distractores | «Compara las dos columnas de la tabla: ¿qué dato cambia de una a otra?» |
| T7-2 A4 · `el-cierre` | describe la opción correcta | «Piensa qué cuenta ya está al día cuando llega el cierre en el permanente.» |
| T7-2 A5 · `frente-al-periodico` | «se suma al costo» descarta «pasa a ser gasto», y «qué es lo distinto» descarta «no cambia nada» | «Compara la cuenta donde va ese flete en el periódico con las cuentas que existen en el permanente.» |
| T7-2 A6 · `frente-al-periodico` | dice con otras palabras la opción correcta | «Piensa qué cuentas existen en el permanente y cuáles no.» |
| T7-3 condicionado · `que-es` | descarta «el comercial» y «los dos» | «Un descuento se registra cuando se sabe cuánto es. ¿Cuándo se sabe cada uno?» |
| T7-3 condicionado · `sobre-que` | descarta $4.488.750 y $4.200.000 | «Piensa qué parte de lo que debe Santa Martha es de la mercancía y qué parte es de otra cosa.» |
| T7-3 sobrantes · `sobrante` | «la diferencia» deja solo $30.000 | «El sobrante no es todo lo que hay en la bodega. ¿Qué parte de lo contado es?» |

**T7-3 dos libros · `el-pago`:** «Recuerda de qué lado lo anota quien lo recibe» pide recordar algo que nunca se enseñó. Va el reemplazo que ya di en los recortes: «Para quien vende, la cuenta fue al debe. Santa Martha está del otro lado del negocio.»

---

### Distractores de cuenta que corregir

**T7-3 H5 «Ajuste por conteo», cuatro cambios:**

1. **Línea Inventario (H) del faltante de Olmo, distractor «Provisión para inventarios».** La retroalimentación («La provisión se usa cuando llega una pérdida que ya se había estimado. Este faltante es un ajuste por el conteo») inventa la regla que separa el faltante de la provisión. Ese es justo el hueco abierto con el profesor, y el libro no da esa regla.
   - Cambia el distractor a «Devoluciones de compras».
   - Retroalimentación: «Olmo no le devolvió nada a un proveedor. La mercancía faltó en el conteo.» (79,7)
2. **Línea Inventario (H) de la pérdida real de Pino, distractor «Costo de mercancía vendida».** Dice «Esta mercancía no se vendió: se perdió», y eso contradice lo que la pieza califica dos ítems antes: el faltante de Olmo va al Costo aunque no se vendió.
   - Cambia el distractor a «Gasto provisiones – inventarios».
   - Retroalimentación: «Ese gasto ya se anotó al estimar la provisión. Ahora sale de los libros la mercancía perdida.» (73,7)
3. **Línea Provisión (D) de Pino, distractor «Costo de mercancía vendida».** Dice «lo que se reservó», y «reservar» es otra cosa en contabilidad.
   - Retroalimentación: «Esta pérdida ya se había estimado con una provisión, y se carga a esa provisión.» (67,2)
   - Este distractor solo deja de ser defendible si Pino ya no dice «por un faltante». Ese cambio sigue pendiente.

**T5 N4, línea Caja.** El segundo distractor, «Ingresos por intereses», le dice al estudiante la cuenta de la otra línea.
- Cambia a «Ingresos financieros – ganancia en venta de títulos».
- Retroalimentación: «No se vendió ningún título. Este valor es el dinero que entra por el interés.» (91,3)
- Así la línea de ingresos conserva sus dos distractores.

**Necesito que Misa me confirme una cosa:** las líneas de cada asiento se comprueban todas juntas, con un solo «Comprobar». Varias retroalimentaciones nombran la cuenta de otra línea (por ejemplo «el dinero que entra va en otra línea», o T7-3 H4 «lo que Bambú paga de verdad»). Si las líneas se resuelven una por una, esas regalan la siguiente.

**Defendible solo fuera del libro, se queda:** T7-3 H4, línea Descuento comercial condicionado de Totumo, distractor «Ingresos por ventas». Bajo la NIIF 15 vigente, un descuento por pronto pago sí rebaja el ingreso. La retroalimentación dice «El libro no resta…», que es exacto, así que no cambio nada.

---

### Casilla numérica y redundancias

- **Casilla numérica:** el criterio de Near es correcto. Cuando el objetivo es calcular, va casilla. Cuando el objetivo es un concepto, se queda la elección, porque sus opciones son errores con nombre.
- **Redundancias:** quitaría los tres ítems (los ítems 4 y 6 de T7-1 H6 y el ítem 4 de T7-3 H1), porque la mesa nueva los pregunta otra vez. Cambian los aciertos y las migraciones, así que lo decide Erwin.
