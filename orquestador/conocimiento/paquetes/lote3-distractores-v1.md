# Lote 3 · Distractores de cuenta en los 9 Hacer calcados

Célula C · Near · 15 de octubre de 2026. Las líneas salen de los datos publicados en main. N5 todavía no está en main, así que sus líneas salen de la rama `feat/conta-c5-t5-gano-o-perdio`.

**Qué trae**
- **44 líneas, cada una con 2 cuentas distractoras y una retroalimentación propia para cada una: 88 textos.** El asiento de venta en periódico es igual en T7-1 H2 y en T7-3 H1, así que se escribe una vez y vale para las dos piezas. Contadas las dos piezas, son 48 líneas.
- **Nombres de cuenta.** Todos son nombres que el estudiante ya ve en T7 o en T5 (regla 8), con la raya «–» donde la lleva el canon. En T7 la cuenta del efectivo se llama «Caja o Bancos». En T5 se llaman «Caja» y «Bancos», como las publicó B.
- **Ninguna retroalimentación nombra la cuenta correcta de su línea.** Lo comprobé con un script contra las 88. Algunas sí nombran la cuenta de otra línea, por ejemplo «el dinero que entra va en otra línea». Eso orienta y no regala la línea que se está resolviendo.
- **Medidas:** las 88 tienen 10 palabras o más y dan 65 o más en `npm run inflesz`; la más baja da 69,1.
- **Cómo eligen el distractor.** Cada uno viene de una confusión que el tema produce: el sistema equivocado (Compras en el permanente), el libro equivocado (Devoluciones de ventas en el libro de quien compra), el impuesto equivocado (16 % contra 3,5 %), el momento equivocado (la venta en el asiento del pago) o la cuenta hermana (ganancia contra pérdida).
- **La retroalimentación del lado no cambia.** La que ya existe por línea sigue para cuando el estudiante elige bien la cuenta y falla el lado.

**Dos casos que conviene que Misa sepa**
- **N4, línea Caja.** En T5 solo hay seis cuentas, y Bancos no sirve de distractor: recibir el interés en Bancos sería defendible. Por eso el segundo distractor es «Ingresos por intereses», la cuenta de la otra línea, y su texto explica el lado.
- **T7-3 H4, línea Caja o Bancos de Bambú.** No usé Anticipo fiscal porque esa venta sí tuvo retención, y el distractor quedaría discutible. Usé IVA por pagar, que el descuento condicionado no toca.

### T7-1 H2 · `t7-1-arma-la-factura` · asiento de la compra (La Ceiba, periódico)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `asiento-compra` | Compras · D · $3.200.000 | Inventario de mercancías | «En el periódico, Inventario de mercancías no se mueve con cada compra. Se queda quieta hasta el cierre.» | 80,2 |
| `asiento-compra` | Compras · D · $3.200.000 | Gastos de administración y ventas | «La Ceiba compró esta mercancía para volver a venderla. No es un gasto de la operación del mes.» | 87,1 |
| `asiento-compra` | IVA por pagar · D · $512.000 | Retención en la fuente por pagar | «La retención se calcula al 3,5 %, y este valor no sale de esa tarifa. Revisa con qué tarifa sale.» | 79,3 |
| `asiento-compra` | IVA por pagar · D · $512.000 | Anticipo fiscal | «Anticipo fiscal aparece cuando a la empresa le descuentan la retención, y eso pasa al vender. Aquí La Ceiba compra.» | 69,1 |
| `asiento-compra` | Retención en la fuente por pagar · H · $112.000 | Anticipo fiscal | «Anticipo fiscal es la retención que le descuentan a la empresa cuando vende. En la compra, es La Ceiba quien la descuenta.» | 88,2 |
| `asiento-compra` | Retención en la fuente por pagar · H · $112.000 | IVA por pagar | «El IVA de esta compra se calcula al 16 %, y este valor no sale de esa tarifa. Revisa con qué tarifa sale.» | 82,6 |
| `asiento-compra` | Cuentas por pagar – proveedores · H · $3.600.000 | Caja o Bancos | «La compra fue a crédito, así que todavía no sale dinero. Lo que aparece es una deuda.» | 81,1 |
| `asiento-compra` | Cuentas por pagar – proveedores · H · $3.600.000 | Cuentas por cobrar – clientes | «Esa cuenta es lo que a la empresa le deben sus clientes. En esta compra, nadie le queda debiendo a La Ceiba.» | 96,7 |

### Venta en periódico: T7-1 H2 · `asiento-venta` (La Ceiba) y T7-3 H1 · `asiento` (Guadua). Mismas líneas y mismos textos en las dos.

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Cuentas por cobrar – clientes · D · $5.400.000 · 2.029.500 | Caja o Bancos | «La venta fue a crédito, así que el cliente todavía no paga. No entra dinero.» | 87,2 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Cuentas por cobrar – clientes · D · $5.400.000 · 2.029.500 | Cuentas por pagar – proveedores | «Esa cuenta es lo que la empresa debe. Con esta venta, la empresa no queda debiendo nada.» | 88,4 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Anticipo fiscal · D · $168.000 · 63.140 | Retención en la fuente por pagar | «Esa cuenta es para la retención que la empresa descuenta cuando compra. Aquí el que descuenta es el cliente.» | 82,6 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Anticipo fiscal · D · $168.000 · 63.140 | IVA por pagar | «Este valor sale al 3,5 %, no al 16 %. No es el IVA.» | 97,0 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | IVA por pagar · H · $768.000 · 288.640 | Anticipo fiscal | «Anticipo fiscal va con la retención, que sale al 3,5 %. Este valor sale al 16 %.» | 78,9 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | IVA por pagar · H · $768.000 · 288.640 | Retención en la fuente por pagar | «Esa cuenta es para la retención que la empresa descuenta cuando compra. Y este valor sale al 16 %.» | 80,2 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Ingresos por ventas · H · $4.800.000 · 1.804.000 | Inventario de mercancías | «En el periódico, la venta no toca Inventario de mercancías. Esa cuenta solo se pone al día al cierre.» | 79,3 |
| `asiento-venta (T7-1 H2) · asiento (T7-3 H1)` | Ingresos por ventas · H · $4.800.000 · 1.804.000 | Compras | «Compras recoge lo que la empresa compra para vender. Aquí la empresa vende.» | 75,7 |

### T7-1 H6 · `t7-1-devolucion-dos-libros` (La Garza compra, El Nogal vende; periódico)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `libro-garza` | Cuentas por pagar – proveedores · D · $956.250 | Cuentas por cobrar – clientes | «Esa cuenta es lo que a la empresa le deben sus clientes. La Garza es la que compró.» | 107,8 |
| `libro-garza` | Cuentas por pagar – proveedores · D · $956.250 | Caja o Bancos | «La compra fue a crédito y nadie devuelve dinero. Lo que cambia es una deuda.» | 91,3 |
| `libro-garza` | Retención en la fuente por pagar · D · $29.750 | Anticipo fiscal | «Anticipo fiscal es del libro de quien vende. La Garza compró: ella fue la que descontó la retención.» | 90,5 |
| `libro-garza` | Retención en la fuente por pagar · D · $29.750 | IVA por pagar | «Este valor sale al 3,5 % de lo devuelto, no al 16 %. No es el IVA.» | 95,5 |
| `libro-garza` | IVA por pagar · H · $136.000 | Retención en la fuente por pagar | «Este valor sale al 16 % de lo devuelto. La retención sale al 3,5 %.» | 80,5 |
| `libro-garza` | IVA por pagar · H · $136.000 | Anticipo fiscal | «Anticipo fiscal es del libro de quien vende, y va con la retención, no con este impuesto.» | 87,2 |
| `libro-garza` | Devoluciones de compras · H · $850.000 | Compras | «El libro no resta la devolución directo de Compras. La anota aparte, para saber cuánto se devolvió.» | 73,7 |
| `libro-garza` | Devoluciones de compras · H · $850.000 | Devoluciones de ventas | «Esa cuenta es del libro de quien vendió. La Garza es la que compró.» | 110,8 |
| `libro-nogal` | Devoluciones de ventas · D · $850.000 | Ingresos por ventas | «El libro no resta la devolución directo de la venta. La anota aparte, para saber cuánto se devolvió.» | 76,7 |
| `libro-nogal` | Devoluciones de ventas · D · $850.000 | Devoluciones de compras | «Esa cuenta es del libro de quien compró. El Nogal es el que vendió.» | 110,8 |
| `libro-nogal` | IVA por pagar · D · $136.000 | Anticipo fiscal | «Anticipo fiscal va con la retención, que sale al 3,5 %. Este valor sale al 16 % de lo devuelto.» | 80,2 |
| `libro-nogal` | IVA por pagar · D · $136.000 | Retención en la fuente por pagar | «Esa cuenta es del libro de quien compra. Y este valor sale al 16 %, no al 3,5 %.» | 95,7 |
| `libro-nogal` | Anticipo fiscal · H · $29.750 | Retención en la fuente por pagar | «Esa cuenta es del libro de quien compra. A El Nogal le descontaron la retención: no la descontó él.» | 95,7 |
| `libro-nogal` | Anticipo fiscal · H · $29.750 | IVA por pagar | «Este valor sale al 3,5 % de lo devuelto, no al 16 %. No es el IVA.» | 95,5 |
| `libro-nogal` | Cuentas por cobrar – clientes · H · $956.250 | Cuentas por pagar – proveedores | «Esa cuenta es lo que la empresa debe. El Nogal no le debe nada a nadie en este hecho.» | 99,0 |
| `libro-nogal` | Cuentas por cobrar – clientes · H · $956.250 | Caja o Bancos | «La venta fue a crédito y nadie devuelve dinero. Lo que cambia es una deuda.» | 91,3 |

### T7-2 H2 · `t7-2-dos-asientos` (El Arrayán, permanente)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `primer-asiento` | Cuentas por cobrar – clientes · D · $6.300.000 | Caja o Bancos | «La venta fue a crédito, así que el cliente todavía no paga. No entra dinero.» | 87,2 |
| `primer-asiento` | Cuentas por cobrar – clientes · D · $6.300.000 | Cuentas por pagar – proveedores | «Esa cuenta es lo que la empresa debe. Con esta venta, la empresa no queda debiendo nada.» | 88,4 |
| `primer-asiento` | Anticipo fiscal · D · $196.000 | Retención en la fuente por pagar | «Esa cuenta es para la retención que la empresa descuenta cuando compra. Aquí el que descuenta es el cliente.» | 82,6 |
| `primer-asiento` | Anticipo fiscal · D · $196.000 | IVA por pagar | «Este valor sale al 3,5 %, no al 16 %. No es el IVA.» | 97,0 |
| `primer-asiento` | IVA por pagar · H · $896.000 | Anticipo fiscal | «Anticipo fiscal va con la retención, que sale al 3,5 %. Este valor sale al 16 %.» | 78,9 |
| `primer-asiento` | IVA por pagar · H · $896.000 | Retención en la fuente por pagar | «Esa cuenta es para la retención que la empresa descuenta cuando compra. Y este valor sale al 16 %.» | 80,2 |
| `primer-asiento` | Ingresos por ventas · H · $5.600.000 | Inventario de mercancías | «Inventario de mercancías sí se mueve en esta venta, pero en el segundo asiento y por el costo. Este valor es el precio.» | 84,3 |
| `primer-asiento` | Ingresos por ventas · H · $5.600.000 | Costo de mercancía vendida | «Esa cuenta guarda lo que costó lo vendido, no el precio al que se vendió.» | 96,3 |
| `asiento-del-costo` | Costo de mercancía vendida · D · $3.780.000 | Compras | «Compras es la cuenta del periódico. El Arrayán usa el permanente, y ahí no se usa.» | 85,9 |
| `asiento-del-costo` | Costo de mercancía vendida · D · $3.780.000 | Ingresos por ventas | «El precio de la venta ya se anotó en el primer asiento. Este segundo asiento va por lo que costó.» | 94,0 |
| `asiento-del-costo` | Inventario de mercancías · H · $3.780.000 | Compras | «Compras es la cuenta del periódico. El Arrayán usa el permanente, y ahí no se usa.» | 85,9 |
| `asiento-del-costo` | Inventario de mercancías · H · $3.780.000 | Cuentas por cobrar – clientes | «Lo que debe el cliente ya se anotó en el primer asiento, por el precio. Este asiento va por el costo.» | 98,4 |

### T7-2 H5 · `t7-2-flete-y-devolucion` · segundo asiento de la devolución de ventas (Mangle, permanente)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `devolucion-de-ventas` | Inventario de mercancías · D · $490.000 | Devoluciones de ventas | «Devoluciones de ventas va en el primer asiento, por el precio. Este segundo asiento va por el costo.» | 83,6 |
| `devolucion-de-ventas` | Inventario de mercancías · D · $490.000 | Compras | «Compras es la cuenta del periódico. Mangle usa el permanente, y ahí no se usa.» | 87,2 |
| `devolucion-de-ventas` | Costo de mercancía vendida · H · $490.000 | Devoluciones de ventas | «Devoluciones de ventas va en el primer asiento, por el precio. Este segundo asiento va por el costo.» | 83,6 |
| `devolucion-de-ventas` | Costo de mercancía vendida · H · $490.000 | Ingresos por ventas | «Este asiento no toca el precio de la venta. Va por lo que le costó a Mangle la mercancía.» | 99,0 |

### T7-3 H4 · `t7-3-pago-a-tiempo` (Totumo vende, Bambú compra; periódico)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `libro-de-totumo` | Caja o Bancos · D · $2.121.175 | Cuentas por cobrar – clientes | «Bambú pagó, así que entra dinero. Lo que el cliente debe no sube con un pago.» | 97,6 |
| `libro-de-totumo` | Caja o Bancos · D · $2.121.175 | Ingresos por ventas | «La venta ya se anotó el 3 de octubre. Este hecho es el pago.» | 93,0 |
| `libro-de-totumo` | Descuento comercial condicionado · D · $78.200 | Ingresos por ventas | «El libro no resta este descuento directo de la venta. Lo anota en una cuenta propia.» | 85,9 |
| `libro-de-totumo` | Descuento comercial condicionado · D · $78.200 | Gastos de administración y ventas | «El libro tiene una cuenta propia para este descuento. No lo mezcla con los gastos del mes.» | 95,7 |
| `libro-de-totumo` | Cuentas por cobrar – clientes · H · $2.199.375 | Cuentas por pagar – proveedores | «Esa cuenta es lo que la empresa debe. Totumo no queda debiendo nada con este pago.» | 85,9 |
| `libro-de-totumo` | Cuentas por cobrar – clientes · H · $2.199.375 | Caja o Bancos | «El dinero que entra va en otra línea, por $2.121.175. Esta línea va por $2.199.375.» | 83,0 |
| `libro-de-bambu` | Cuentas por pagar – proveedores · D · $2.199.375 | Cuentas por cobrar – clientes | «Esa cuenta es del libro de Totumo, que vendió. Bambú es quien compró.» | 99,7 |
| `libro-de-bambu` | Cuentas por pagar – proveedores · D · $2.199.375 | Compras | «La compra ya se anotó el 3 de octubre. Este hecho es el pago.» | 93,0 |
| `libro-de-bambu` | Descuento comercial condicionado · H · $78.200 | Compras | «El libro no resta este descuento directo de Compras. Lo anota en una cuenta propia.» | 83,0 |
| `libro-de-bambu` | Descuento comercial condicionado · H · $78.200 | Devoluciones de compras | «Bambú no le devolvió mercancía a nadie. Esto es una rebaja por pagar a tiempo.» | 83,0 |
| `libro-de-bambu` | Caja o Bancos · H · $2.121.175 | Cuentas por pagar – proveedores | «Esta línea va por $2.121.175, lo que Bambú paga de verdad. La deuda baja por otro valor.» | 92,1 |
| `libro-de-bambu` | Caja o Bancos · H · $2.121.175 | IVA por pagar | «El IVA ya se anotó con la compra, y el descuento no lo toca. El pago no lo cambia.» | 105,5 |

### T7-3 H5 · `t7-3-ajuste-por-conteo` (Olmo, permanente)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `ajuste-sobrante` | Inventario de mercancías · D · $36.000 | Compras | «Olmo no compró nada: la mercancía apareció en el conteo. Además, usa el permanente, y ahí Compras no se usa.» | 72,2 |
| `ajuste-sobrante` | Inventario de mercancías · D · $36.000 | Provisión para inventarios | «La provisión es para pérdidas que se estiman. Aquí no falta mercancía: sobra.» | 70,9 |
| `ajuste-sobrante` | Costo de mercancía vendida · H · $36.000 | Ingresos por ventas | «No hubo ninguna venta. El sobrante no es un ingreso por vender.» | 91,8 |
| `ajuste-sobrante` | Costo de mercancía vendida · H · $36.000 | Gasto provisiones – inventarios | «Ese gasto se anota al estimar pérdidas antes de que pasen. Aquí no se estima nada: se ajusta lo que dio el conteo.» | 81,6 |
| `ajuste-faltante` | Costo de mercancía vendida · D · $44.000 | Gasto provisiones – inventarios | «Ese gasto se anota al estimar pérdidas antes de que pasen. Este faltante ya salió en el conteo.» | 80,2 |
| `ajuste-faltante` | Costo de mercancía vendida · D · $44.000 | Gastos de administración y ventas | «El libro no manda el faltante a los gastos del mes.» | 105,2 |
| `ajuste-faltante` | Inventario de mercancías · H · $44.000 | Provisión para inventarios | «La provisión se usa cuando llega una pérdida que ya se había estimado. Este faltante es un ajuste por el conteo.» | 74,7 |
| `ajuste-faltante` | Inventario de mercancías · H · $44.000 | Compras | «Olmo usa el permanente, y ahí Compras no se usa.» | 84,7 |
| `perdida-real` | Provisión para inventarios · D · $185.000 | Gasto provisiones – inventarios | «Ese gasto ya se anotó cuando se hizo la provisión. Anotarlo otra vez lo pondría dos veces.» | 81,1 |
| `perdida-real` | Provisión para inventarios · D · $185.000 | Costo de mercancía vendida | «Esta pérdida ya se había estimado. Se cubre con lo que se reservó para eso.» | 83,0 |
| `perdida-real` | Inventario de mercancías · H · $185.000 | Provisión para inventarios | «La provisión cubre la pérdida, pero no saca de los libros la mercancía que se perdió.» | 81,8 |
| `perdida-real` | Inventario de mercancías · H · $185.000 | Costo de mercancía vendida | «Esta mercancía no se vendió: se perdió. Y esa pérdida ya se había estimado.» | 75,2 |

### T5 N4 · `t5-el-interes-del-periodo` (Caoba)

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `asiento-del-cobro` | Caja · D · $432.000 | Inversiones – títulos | «El interés no cambia la inversión: Caoba sigue con los mismos títulos.» | 75,4 |
| `asiento-del-cobro` | Caja · D · $432.000 | Ingresos por intereses | «Esa cuenta sí se mueve en este cobro, pero en la otra línea. Un ingreso que aumenta no va al debe.» | 92,5 |
| `asiento-del-cobro` | Ingresos por intereses · H · $432.000 | Ingresos financieros – ganancia en venta de títulos | «Esa cuenta es para lo que se gana al vender títulos por más de lo que costaron. Aquí no se vendió nada.» | 96,7 |
| `asiento-del-cobro` | Ingresos por intereses · H · $432.000 | Inversiones – títulos | «El interés no aumenta la inversión: Caoba sigue con los mismos títulos.» | 70,2 |

### T5 N5 · `t5-gano-o-perdio` (Acacia) · los asientos de los ítems 5 y 7

| Asiento | Línea correcta | Distractor | Por qué no es esa | INFLESZ |
| --- | --- | --- | --- | --- |
| `asiento-con-ganancia` | Caja · D · $2.970.000 | Inversiones – títulos | «Esa cuenta sale por lo que costaron las acciones. Este valor es lo que entra por venderlas.» | 92,1 |
| `asiento-con-ganancia` | Caja · D · $2.970.000 | Ingresos financieros – ganancia en venta de títulos | «La ganancia es solo la diferencia, $165.000. Este valor es todo lo que Acacia recibe.» | 74,7 |
| `asiento-con-ganancia` | Inversiones – títulos · H · $2.805.000 | Caja | «Caja va por lo que pagan por las acciones, no por lo que costaron.» | 103,8 |
| `asiento-con-ganancia` | Inversiones – títulos · H · $2.805.000 | Gastos financieros – pérdida en venta de títulos | «Acacia vendió por más de lo que le costaron: en esta venta no hay pérdida.» | 92,2 |
| `asiento-con-ganancia` | Ingresos financieros – ganancia en venta de títulos · H · $165.000 | Ingresos por intereses | «Las acciones no pagaron ningún interés. Esta diferencia sale de la venta.» | 71,0 |
| `asiento-con-ganancia` | Ingresos financieros – ganancia en venta de títulos · H · $165.000 | Gastos financieros – pérdida en venta de títulos | «Recibió más de lo que le costaron, así que la diferencia no es una pérdida.» | 83,8 |
| `asiento-con-perdida` | Caja · D · $1.540.000 | Inversiones – títulos | «Esa cuenta sale por lo que costaron las acciones. Este valor es lo que entra por venderlas.» | 92,1 |
| `asiento-con-perdida` | Caja · D · $1.540.000 | Gastos financieros – pérdida en venta de títulos | «La pérdida es solo la diferencia, $245.000. Este valor es todo lo que Acacia recibe.» | 74,7 |
| `asiento-con-perdida` | Gastos financieros – pérdida en venta de títulos · D · $245.000 | Ingresos financieros – ganancia en venta de títulos | «Vendió por menos de lo que le costaron, así que la diferencia no es una ganancia.» | 85,7 |
| `asiento-con-perdida` | Gastos financieros – pérdida en venta de títulos · D · $245.000 | Ingresos por intereses | «Las acciones no pagaron ningún interés. Esta diferencia sale de la venta.» | 71,0 |
| `asiento-con-perdida` | Inversiones – títulos · H · $1.785.000 | Caja | «Caja va por lo que pagan por las acciones, no por lo que costaron.» | 103,8 |
| `asiento-con-perdida` | Inversiones – títulos · H · $1.785.000 | Ingresos financieros – ganancia en venta de títulos | «Esta venta no dejó ganancia, y este valor es lo que costaron las acciones.» | 81,6 |

---

## Ítems de «¿cuánto es X?» que pasan a casilla numérica

**Criterio.** Pasa a casilla el ítem cuyo objetivo es la cuenta numérica: el estudiante escribe la cifra. Se queda en elección el ítem cuyo objetivo es un concepto, porque sus opciones son los errores con nombre: costo o precio, todo o una parte, qué base.

**Recomendación para Misa.** Los distractores de cada ítem que pasa a casilla ya tienen retroalimentación propia. Si el estudiante escribe uno de esos valores, que salga su texto; si escribe cualquier otro, que salga la pista. Así no se pierden los errores con nombre.

**Siete dígitos.** Ninguna cifra que se escribe pasa de 7 dígitos; la más alta es $6.300.000 (T7-2 H2, ítem 1).

| Pieza | Pasan a casilla | Se quedan en elección, y por qué |
| --- | --- | --- |
| T7-1 H2 `t7-1-arma-la-factura` | 1 IVA ($512.000) · 2 retención ($112.000) · 3 lo que debe al proveedor ($3.600.000) · 5 lo que debe el cliente ($5.400.000) | — |
| T7-1 H6 `t7-1-devolucion-dos-libros` | 3 cuánto baja la deuda ($956.250) | 1 y 2 (cuánto IVA y cuánta retención se reversan): el objetivo es «solo la parte de lo devuelto», contra todo o nada. |
| T7-2 H2 `t7-2-dos-asientos` | 1 lo que debe el cliente ($6.300.000) | 3 (valor del segundo asiento): el objetivo es costo contra precio. |
| T7-2 H5 `t7-2-flete-y-devolucion` | 2 pago a la transportadora ($376.200) · 5 cuánto baja la deuda ($922.500) | 1, 3 y 4 piden la cuenta de un hecho que no tiene asiento en la pieza, así que no se repiten con la mesa. |
| T7-3 H1 `t7-3-descuento-en-factura` | 1 valor a facturar ($1.804.000) · 2 IVA ($288.640) · 3 lo que debe el cliente ($2.029.500) | Ver la redundancia del ítem 4, abajo. |
| T7-3 H4 `t7-3-pago-a-tiempo` | 1 lo facturado ($1.955.000) · 3 el descuento ($78.200) · 4 el pago ($2.121.175) | 2 (qué descuento le toca: un porcentaje que sale de la fecha) y 7 (el lado del cierre). |
| T7-3 H5 `t7-3-ajuste-por-conteo` | 2 el sobrante ($36.000) · 5 el faltante ($44.000) | 1 (¿sobrante o faltante?), 4 (¿el costo sube o baja?) y 7 (la cuenta de la estimación, que no tiene asiento en la pieza). |
| T5 N4 `t5-el-interes-del-periodo` | 2 primer trimestre ($432.000) · 5 segundo trimestre ($228.000) | 1 (cada cuánto se cobra) y 4 (la base: es el concepto de la pieza). |
| T5 N5 `t5-gano-o-perdio` | 1 cuánto recibe ($2.970.000) · 2 cuánto costaron ($2.805.000) | 3 y 6 (¿ganó o perdió?) y 4 (sale por el costo y no por lo recibido: es la regla de la pieza). |

## Redundancias que la mesa nueva crea (decide L)

Cuando cada línea del asiento pide la cuenta, tres ítems de elección preguntan lo mismo que la mesa justo después:
- **T7-1 H6, ítems 4 y 6** («¿A qué cuenta va la devolución de $850.000?», en cada libro). Las líneas Devoluciones de compras y Devoluciones de ventas de la mesa piden exactamente eso.
- **T7-3 H1, ítem 4** («¿Por qué valor va Ingresos por ventas?»). Su respuesta es la del ítem 1 ($1.804.000), y la mesa la muestra en la línea.

**L: ¿se quitan esos tres ítems?** Yo los quitaría. H6 baja de 13 a 11 aciertos y T7-3 H1 pierde un acierto. Las migraciones de esas dos piezas tendrían que actualizar los aciertos, y eso va a Erwin.
