# Lote C2 · C1 · C7 de la Célula B · ENTREGA AUDITADA · tal como llegó

Guardada por la construcción (Célula B) el 15-oct-2026, letra por letra, desde la versión final de Futaba con el PASA de Shoko. La prueba b5-escalera-ayuda.test.mjs compara los datos de las piezas con esta entrega. Lo que sigue a la raya es la entrega, sin cambios.

---

# Futaba · versión final de C2, C1 y C7 (con PASA de Shoko; sus correcciones ya aplicadas). Lista para construir.

Las cifras entre paréntesis son estimación de INFLESZ de Futaba (no van en pantalla).

## C2 · Escalera de ayuda

Al primer error sale la pista. Al segundo, la devolución que ya existe y después el texto que se revela.

### Pistas
| Pieza | Caja o parada | Pista |
|---|---|---|
| T5 A1 | Paquete A | Revisa las dos condiciones, una por una, con lo que dice la descripción del paquete. |
| T5 A1 | Paquete B | Piensa quién le compraría estas acciones a la empresa si las quisiera vender mañana. |
| T5 A2 | Ventas A y B | Compara lo que recibió con lo que le costaron los títulos que vendió. |
| T5 A2 | Parada | El interés lo pagan los títulos que la empresa todavía tiene, no los que ya vendió. |
| T6 A1 | Taller (servicio a crédito) | Después de esto, ¿el cliente ya pagó o quedó debiendo algo? |
| T6 A1 | Paga la mitad | Piensa en cuánto debe el cliente justo después de pagar esa parte. |
| T6 A1 | Cheque | Si el banco no le pagó el cheque, ¿el cliente sí canceló su deuda? |
| T6 A1 | Devolución | ¿Tiene que pagar el cliente lo que ya regresó? |
| T6 A1 | Descuento | Un descuento sobre una deuda, ¿qué le hace a lo que el cliente tiene que pagar? |
| T6 A1 | Contado | Si paga en el mismo momento, ¿queda alguna deuda por anotar? |
| T6 A2 | Anulación directa | Pregúntate si este método anota algo antes de que una deuda se dé por perdida. |
| T6 A2 | Provisiones | Este método estima la pérdida antes de saber qué deuda se va a perder. |
| T6 A3 | Diciembre de 2007 | Mira el asiento que la crea: el gasto va al Debe. ¿Y la provisión? |
| T6 A3 | Marzo (la pregunta aprobada) | Compara lo que había en la provisión con lo que se castigó. ¿Cuál es mayor? |
| T6 A3 | Diciembre siguiente | Mira de qué saldo parte la T antes de este registro. |
| T6 A3 | Parada | Recuerda en qué momento del ejemplo se anotó el gasto de la provisión. |
| T6 A4 | Caso b | Fíjate en lo que promete el cliente sobre el resto de la deuda. |
| T6 A4 | Caso c | Fíjate en lo que avisa el cliente sobre el resto de la deuda. |
| T6 A4 | Parada | La deuda ya salió de Cuentas por cobrar – clientes. ¿Se puede cobrar algo que no está? |
| T6 A5 | 1 mes de vencida | Busca el grupo cuyo rango incluye un mes y mira qué decidió el ejemplo para él. |
| T6 A5 | 5 meses de vencida | Cinco meses pasan de tres. ¿Pasan también de seis? |
| T6 A5 | 10 meses de vencida | Diez meses pasan de seis. ¿Pasan también de un año? |
| T6 A5 | 20 meses de vencida | Un año tiene doce meses. Compara. |
| T6 A5 | Parada | El 5 % es la mitad del 10 %. Primero saca el 10 % de $340.000. |

El caso a de T6 A4 ya no lleva pista, porque queda como ejemplo (C1-11).

### Terceras opciones (con dos opciones el segundo error no puede pasar)
| Pieza | Pregunta | Opción nueva | Devolución al segundo error |
|---|---|---|---|
| T5 A2 | Ventas A y B | Ni ganancia ni pérdida | La de cada caja (C1-2) |
| T6 A2 | Anulación directa | Cuando se vende a crédito | No: con este método no se anota nada antes. El gasto llega cuando la deuda se pierde. |
| T6 A2 | Provisiones | Cuando se vende a crédito | No: al vender todavía no se sabe qué parte se va a perder. Eso se estima al cierre. |
| T6 A3 | Diciembre de 2007 | En ninguna: es solo un cálculo | Es un cálculo, pero se anota con un asiento: la provisión sube por el Haber. |
| T6 A3 | Parada | Sí, por la parte que la provisión no cubre | No: el gasto ya se anotó al crear la provisión, aunque esta se quede corta. |
| T6 A4 | Parada | Un ingreso por la deuda recuperada | No hay ningún ingreso: primero se revive la deuda y después se anota el pago. |

La capa 4 (UnaFrase) es compartida: su pista le toca a Erwin. Las preguntas nuevas de capa 4 (abajo) sí son contenido nuestro.

## C1 · La respuesta en la pantalla anterior

Para las paradas de T6 A4 y T6 A5: comprobar que los rótulos «Primero se revive la deuda» y «son $17.000» no aparecen antes de su paso.

### C1-1 · T5 A1 · capa 4 (pie «Escenario simulado»)
Pregunta: «Una empresa compra bonos que se venden fácil, pero piensa guardarlos cinco años. Su ciclo de operaciones dura menos de un año. ¿Son un activo financiero temporal?»
| Opción | ✓ | Devolución |
|---|---|---|
| No: no se volverán efectivo en un año. | ✓ | Correcto. Cumplen la primera condición, pero no la segunda: no están destinados a volverse efectivo en un año o en un ciclo de operaciones. |
| Sí: se venden fácil, y con eso basta. | | No es esa. Venderse fácil es solo la primera condición. También tienen que estar destinados a volverse efectivo pronto. |
| Sí: los bonos suelen estar entre los temporales. | | No es esa. El tipo de documento no decide solo: también tienen que cumplir las dos condiciones. |
| No: los bonos nunca son activos temporales. | | No es esa. Los bonos sí pueden ser temporales, si cumplen las dos condiciones. Aquí falla la segunda. |

### C1-2 · T5 A2 · capa 3 (pie de las cajas «Escenario simulado»)
Consigna: «Toca cada venta y decide si dejó ganancia o pérdida. Después, mira cómo se acredita la inversión.»
Opciones: Ganancia · Pérdida · Ni ganancia ni pérdida.
- Venta A, «Costó $650 cada uno · Se vende a $690». Correcta: Ganancia.
  - Revela: «Recibió más de lo que costaron: es ganancia. Inversiones – títulos se acredita por el costo, no por lo recibido.»
  - Al segundo error: «Los vende a $690 y le costaron $650: recibe más de lo que pagó, así que es ganancia.»
- Venta B, «Costó $1.150 cada uno · Se vende a $1.060». Correcta: Pérdida.
  - Revela: «Recibió menos de lo que costaron: es pérdida. Inversiones – títulos también se acredita por el costo.»
  - Al segundo error: «Los vende a $1.060 y le costaron $1.150: recibe menos de lo que pagó, así que es pérdida.»
- El texto final no cambia y sigue con su pie de las pp. 194-195.

### C1-3 · T5 A2 · capa 4 (pie «Escenario simulado»)
Pregunta: «Una empresa vende 260 títulos. Cada uno le costó $850. Le pagan $273.000. ¿Por cuánto se acredita la inversión?»
| Opción | ✓ | Devolución |
|---|---|---|
| Por $221.000, lo que costaron los 260 títulos. | ✓ | Correcto. Inversiones – títulos se acredita por lo que costaron los títulos vendidos: 260 × $850 = $221.000. Lo que recibió de más es la ganancia. |
| Por $273.000, lo que recibió por la venta. | | No es esa. Los $273.000 entran a Caja. La inversión se acredita por lo que costó, y la diferencia es la ganancia. |
| Por $52.000, la ganancia que dejó la venta. | | No es esa. Los $52.000 son la ganancia y van a su propia cuenta. La inversión se acredita por lo que costaron los títulos. |
| Por $850, lo que costó cada título. | | No es esa. Ese es el costo de un solo título. Vendió 260: multiplica. |

Al registro de cifras construidas (T5): $650, $690, $1.060, $1.150, 260, $850, $221.000, $273.000 y $52.000.

### C1-4 · T6 A1 · capa 3
| Caja | Hecho | Revela | Al segundo error | Pie |
|---|---|---|---|---|
| Venta (sigue con c5) | Un taller le arregla el carro a un cliente a crédito: le da 30 días para pagar. | Sube: se debita. El cliente queda debiendo el arreglo. | La de hoy | Basado en el libro, p. 197 |
| Pago | Un cliente paga la mitad de lo que debe. | Baja: se acredita, pero solo por lo que pagó. El resto lo sigue debiendo. | Lo que pagó ya no lo debe; el resto lo sigue debiendo. | Libro, p. 197 |
| Cheque | El cheque con el que un cliente pagó su factura rebota: el banco no lo paga. | La de hoy | La de hoy | La de hoy |
| Devolución | Llegan de vuelta unas cajas de un pedido que el cliente aún no paga. | La de hoy | La de hoy | La de hoy |
| Descuento | Un cliente recibe un descuento sobre la factura que todavía no ha pagado. | La de hoy | La de hoy | La de hoy |
| Contado | La de hoy | La de hoy | La de hoy | La de hoy |

### C1-5 · T6 A1 · capa 4 (pie «Basado en el libro, p. 197»)
Pregunta: «Un cliente compra a crédito y, antes de pagar, devuelve toda la mercancía. ¿Cuánto debe al final?»
| Opción | ✓ | Devolución |
|---|---|---|
| Nada: la deuda subió con la venta y bajó con la devolución. | ✓ | Correcto. La venta a crédito hizo subir la deuda, y la devolución la hizo bajar por el mismo valor. |
| Lo mismo que compró: la devolución no cambia la deuda. | | No es esa. Lo que devuelve antes de pagar ya no lo tiene que pagar: la deuda baja. |
| El doble: la devolución también se debita. | | No es esa. La devolución hace bajar lo que debe el cliente, así que se acredita. |
| Nada, pero se anota un ingreso por la devolución. | | No es esa. La deuda sí queda en nada, pero una devolución no es un ingreso: es una devolución de ventas. |

### C1-6 y C1-7 · T6 A2
- Capa 2: se elimina el paso 10. (Mai ajusta la escena: si la escena del paso 10 no aporta nada nuevo, basta con quitarlo.)
- Cierre de la capa 2: «Con la anulación directa, la deuda se borra sin dejar información aparte.»
- Consigna de la capa 3: «Toca cada método y decide cuándo aparece el gasto. Después, mira la razón.»
- Texto que revela la caja de provisiones: «Al cerrar el periodo se estima qué parte no se recuperará, y ese valor se anota como gasto desde ya. El gasto aparece antes de saber qué deuda se pierde.»

### C1-8 · T6 A3 · capa 3
- Marzo: se queda la pregunta aprobada, como está hoy. Solo se le suma su pista.
- Diciembre siguiente: «¿El registro es mayor, menor o igual a lo que pide el análisis?» Opciones: Mayor ✓ · Igual · Menor.
  - Si elige «Igual»: «$153.400 es el saldo que debe quedar. Para llegar ahí, también hay que cubrir lo que faltó en marzo.»
  - Si elige «Menor»: «Lo que faltó en marzo se suma, no se resta.»
- El texto que se revela y la T no cambian.

### C1-9 · T6 A3 · capa 4 (pie «Basado en el libro, p. 203»)
Pregunta: «Si en marzo el castigo hubiera sido menor que la provisión, ¿qué se haría en diciembre?»
| Opción | ✓ | Devolución |
|---|---|---|
| Lo que sobró se resta de lo que pide el análisis. | ✓ | Correcto. Si la provisión quedó sobrestimada, se hace lo contrario que en el ejemplo: lo que sobró se resta de la provisión que pide el análisis. |
| Lo que sobró se suma a lo que pide el análisis. | | No es esa. Lo que faltó se suma. Si sobró, se hace lo contrario: se resta. |
| Se registra solo lo que pide el análisis. | | No es esa. Lo que sobró sigue en la provisión. Por eso se descuenta del registro del año. |
| Lo que sobró sale de la provisión y entra a Caja. | | No es esa. La provisión no es plata: no sale ni entra nada de Caja. |

### C1-11 y C1-12 · T6 A4 · capa 3 (con C7-5 aplicado)
- Caso a: su fila del tablero ya viene llena, con el rótulo «Ejemplo». Ya no se pregunta.
- Consigna: «El caso a ya lo viste. Toca los casos b y c, y decide cuánto se revive. Después, mira cuánta plata entra a Caja.»
- Caso b: texto que se revela: «Se revive toda la deuda: $180.000. A Caja entran $100.000.» Si elige $80.000: «Como va a pagar el resto, la deuda vuelve completa, no solo lo que falta.»
- Caso c: nombre de la caja: «c · Abona $100.000 y avisa que ya no puede pagar más». Si elige $180.000: «Como ya no puede pagar más, solo vuelve lo que abonó.»

### C1-14 · T6 A5 · capa 3
Consigna: «Toca cada deuda y decide qué porcentaje le toca. Después, mira cuánto da su grupo.»
Tablero: al abrir cada caja se llena la fila de su grupo.
| Caja | Opciones | ✓ | Revela |
|---|---|---|---|
| Una deuda con 1 mes de vencida | Nada · 5 % · 10 % | Nada | Un mes no pasa de tres: va con las vigentes y las de hasta tres meses. En este ejemplo, ese grupo no se provisiona. |
| Una deuda con 5 meses de vencida | Nada · 5 % · 10 % | 5 % | Cinco meses pasan de tres y no de seis: le toca el 5 %. Su grupo da $17.000. |
| Una deuda con 10 meses de vencida | 5 % · 10 % · 15 % | 10 % | Diez meses pasan de seis y no de un año: le toca el 10 %. Su grupo da $36.000. |
| Una deuda con 20 meses de vencida | 5 % · 10 % · 15 % | 15 % | Veinte meses pasan de un año: le toca el 15 %. Su grupo da $21.000. |
Las devoluciones del segundo error y los pies son los de hoy.

## C7 · El resumen que borra el límite
| # | Término | Texto final | Estado |
|---|---|---|---|
| C7-1 | T5 A1 · Título valor | Es un documento. Los títulos valores negociables sirven para captar recursos y moverlos entre quienes invierten. En el libro, los valores son clases de títulos valores. Por ejemplo, los de renta variable o los negociables. | Corregida |
| C7-2 | T5 A2 · El rendimiento | (sin cambio) | PASA |
| C7-3 | T6 A2 · Cuentas incobrables | (sin cambio) | PASA |
| C7-4 | T6 A1 · Cuentas por cobrar | (sin cambio) | PASA |
| C7-5 | «no pagará más» → «ya no puede pagar más» | Ver tabla abajo | Se aplica |
| C7-6 | T6 A5 · nota del término 4 | Esos porcentajes son el máximo que una empresa obligada a llevar contabilidad puede restar como gasto al calcular su impuesto de renta. Solo valen si usa este método. No son una regla para todas las empresas: cada una fija los suyos. | Corregida |

Pie de C7-6: «Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21, y DIAN, Concepto 534 de 2026 · Libro, p. 201». (La condición de llevar contabilidad la verificó Shoko en el Concepto 534 de 2026 de la DIAN, párrafos 4 y 11.)

### C7-5 · Reemplazos
| Archivo | Dónde | Hoy | Queda |
|---|---|---|---|
| contabilidadT6Pieza4.js | Término 5 | «avisa que no pagará más» | «avisa que ya no puede pagar más» |
| contabilidadT6Pieza4.js | Nombre de la caja c | «c · Abona $100.000 y avisa que no pagará más» | «c · Abona $100.000 y avisa que ya no puede pagar más» |
| contabilidadT6Pieza4.js | Devolución de la caja c, si elige $180.000 | «Como no pagará más, solo vuelve lo que abonó.» | «Como ya no puede pagar más, solo vuelve lo que abonó.» |
| contabilidadT6Pieza4.js | Capa 4, devolución de «Siguen castigados» | «…cuando avisa que no pagará más…» | «…cuando avisa que ya no puede pagar más…» |
| contabilidadT6Act3.js | Hecho de la parte 5 | «…abona $100.000 y avisa que no pagará más.» | «…abona $100.000 y avisa que ya no puede pagar más.» |
| contabilidadT6Act3.js | B·C14 de la parte 5 | «…Pablo Moncayo avisa que no pagará más. Por eso…» | «…Pablo Moncayo avisa que ya no puede pagar más. Por eso…» |
| paquetes b5-t6-aprender4.md, b5-t6-act3.md y b5-recorrido-t5-t6.md | Varias líneas | Las mismas cadenas | Las mismas, reemplazadas |
