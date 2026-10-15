# Lote 2 · Pistas para el primer error · Aprender de T7 y N2 de T5

Célula C · Near · 15 de octubre de 2026. Las preguntas salen de los datos publicados en main (`src/data`, commit 22c472d), no de los paquetes.

**Qué trae**
- Son 80 pistas en 22 piezas (21 de T7 y N2 de T5): 56 son para preguntas de elección y 24 para líneas de Debe o Haber. Esas 24 cubren 28 líneas, porque en T7-2 A1 las cinco líneas de una pantalla comparten una sola pista.
- Ninguna pasa de 20 palabras y todas tienen 10 o más, así que a todas se les aplica INFLESZ. Las 80 dan 65 o más con `npm run inflesz`; la más baja da 67,2.
- Ninguna nombra la respuesta. Algunas descartan un error con nombre, como «no es el punto medio». La respuesta con su porqué sigue en la retroalimentación que ya existe, que ahora sale en el segundo error.
- La pista de A1 P4 es la que propuso Mello, tal cual.
- **Cómo encontrar cada pregunta:** la pantalla va con su índice en `pantallas` (la portada es P0) y con su `id`. Si el lote 1 cambia el orden de las pantallas, Misa ubica cada pista por el `id`.
- Las de Debe o Haber se apoyan en la regla del Tema 2: de qué lado sube o baja un activo, un pasivo, un ingreso o un costo. Preguntan por ese lado; no lo dicen.

**² = la pregunta tiene dos opciones** (34 ítems: 10 preguntas y las 24 pistas de Debe o Haber). Ahí, después del primer error, el segundo intento ya no se puede fallar, y la pista queda como una explicación, no como un reto. Esto lo decide L con Misa, más abajo.

### t7-1-a1-la-cuenta-que-no-se-mueve · La cuenta que no se mueve

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P4 · `pregunta-compra` | «¿En qué cuenta se anota en el debe el costo de la mercancía, $5.000.000?» | «Busca la cuenta que recoge lo comprado en el periodo.» | 10 | 84,7 |
| P5 · `pregunta-conteo` | «Llega el último día del periodo. La Reventa hace el conteo físico de la mercancía que quedó en su bodega. ¿Qué cuenta se pone al día con ese conteo?» | «El conteo dice cuánto vale lo que quedó en la bodega. Piensa en qué cuenta estuvo quieta todo el periodo.» | 20 | 84,7 |

### t7-1-a2-la-factura-completa · La factura completa

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `base-de-la-retencion` ² | «¿Sobre qué valor se calcula la retención?» | «Piensa si el IVA es parte de lo que vale la mercancía o es un impuesto aparte.» | 17 | 87,2 |
| P3 · `lados-de-la-compra` · iva ² | Línea «IVA por pagar · $800.000» (Debe o Haber) | «Este IVA baja lo que la empresa le debe al Estado. ¿De qué lado baja un pasivo?» | 17 | 92,1 |
| P3 · `lados-de-la-compra` · retencion ² | Línea «Retención en la fuente por pagar · $175.000» (Debe o Haber) | «La Reventa se quedó con ese dinero y ahora se lo debe al Estado. ¿Esa deuda sube o baja?» | 19 | 85,9 |
| P3 · `lados-de-la-compra` · proveedores ² | Línea «Cuentas por pagar – proveedores · $?» (Debe o Haber) | «La Reventa queda debiendo la factura. ¿Esa deuda sube o baja?» | 11 | 76,7 |
| P4 · `la-venta` · iva ² | Línea «IVA por pagar · $320.000» (Debe o Haber) | «Ahora La Reventa cobra el IVA y se lo debe al Estado. ¿Esa deuda sube o baja?» | 17 | 88,4 |
| P4 · `la-venta` · anticipo ² | Línea «Anticipo fiscal · $70.000» (Debe o Haber) | «Para La Reventa, ese dinero es un impuesto que ya pagó por adelantado. Es algo a su favor.» | 18 | 83,6 |
| P4 · `la-venta` · ingresos ² | Línea «Ingresos por ventas · $2.000.000» (Debe o Haber) | «La venta es un ingreso. Recuerda de qué lado aumenta un ingreso.» | 12 | 86,6 |
| P4 · `la-venta` · clientes ² | Línea «Cuentas por cobrar – clientes · $?» (Debe o Haber) | «El cliente le queda debiendo a La Reventa. ¿Eso es algo que La Reventa debe o que le deben?» | 19 | 95,7 |
| P5 · `lado-a-lado` | «¿Por qué la retención va al haber en la compra y al debe en la venta?» | «Fíjate en quién descuenta la retención en cada caso: ¿La Reventa o su cliente?» | 14 | 81,6 |

### t7-1-a3-tres-formas · Tres formas de ponerle precio a lo que quedó

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `peps` ² | «Con PEPS, ¿de qué grupo son las 5 unidades que quedaron?» | «Con PEPS, las primeras unidades que entraron son las primeras que salen. ¿Cuáles se quedan?» | 15 | 87,2 |
| P4 · `ueps` ² | «Con UEPS, ¿de qué grupo son las 5 unidades que quedaron?» | «Con UEPS, salen primero las últimas que entraron. Piensa cuáles se quedan sin salir.» | 14 | 88,6 |
| P5 · `promedio-ponderado` | «¿Cuál es el costo unitario promedio?» | «No es el punto medio entre los dos precios. Cada precio pesa según las unidades compradas a ese precio.» | 19 | 85,9 |
| P6 · `lado-a-lado` | «¿Por qué PEPS da el valor más alto en este ejemplo?» | «Mira de qué compra son las unidades que quedan con PEPS, y cuánto costó esa compra.» | 16 | 89,6 |
| P7 · `a-favor-y-en-contra` | «Alguien dice: «UEPS no tiene sentido, porque la tienda vende primero lo que llegó primero». ¿Qué responde el libro?» | «Piensa si estos métodos dicen cómo sale la mercancía de la bodega o solo cómo se le pone precio.» | 19 | 73,1 |
| P8 · `la-recomendacion` | «Según el libro, ¿por qué conviene UEPS cuando los precios suben?» | «Si los precios suben, ¿qué costos le tocan a lo vendido con UEPS? Sigue el efecto hasta el impuesto.» | 19 | 95,7 |

### t7-1-a4-el-cierre-en-periodico · El cierre en periódico

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P4 · `el-cierre` · inicial ² | Línea «Inventario de mercancías» (Debe o Haber) | «Ese valor ya no es lo que hay, así que sale de la cuenta. ¿De qué lado baja un activo?» | 20 | 106,5 |
| P4 · `el-cierre` · final ² | Línea «Inventario de mercancías» (Debe o Haber) | «Ese valor es lo que hay hoy, así que entra a la cuenta. ¿De qué lado sube un activo?» | 19 | 105,5 |
| P5 · `el-costo-de-lo-vendido` | «Con el promedio ponderado, ¿cuál es el costo de la mercancía vendida?» | «Lo vendido no es todo lo que la empresa tuvo para vender. Falta quitar algo.» | 15 | 91,3 |
| P7 · `lado-a-lado` | «Con PEPS, el inventario final es el más alto. ¿Qué pasa con su costo de la mercancía vendida y con su utilidad?» | «Si queda más en la bodega, ¿sale más o menos costo hacia lo vendido? Sigue ese efecto hasta la utilidad.» | 20 | 81,6 |

### t7-1-a5-importados-y-fletes · Importados y fletes

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `importados` | «Una empresa trae mercancía del exterior. ¿Cuál de estos gastos forma parte del costo de esa mercancía?» | «Piensa en lo que hay que pagar para tener la mercancía en la bodega, no en gastos de oficina.» | 19 | 82,9 |
| P3 · `fob-cif-cyf` | «Una compra al exterior se pacta FOB. ¿Hasta dónde corre el vendedor con los gastos?» | «Vuelve a la definición de FOB. El vendedor corre con los gastos hasta un punto del viaje. ¿Cuál?» | 18 | 100,5 |
| P4 · `flete-del-comprador` | «¿En qué cuenta se anota en el debe el flete de $650.000?» | «Santa Martha paga el flete para traer su mercancía. Busca la cuenta que lo suma a lo comprado.» | 18 | 87,1 |
| P5 · `flete-del-vendedor` | «¿En qué cuenta anota La Popa el flete de $650.000?» | «Para La Popa, esa mercancía ya se vendió. Ese flete no le suma costo a nada que vaya a vender.» | 20 | 90,9 |
| P6 · `lado-a-lado` | «¿Qué decide si el flete es parte del costo o es un gasto?» | «Los dos fletes valían lo mismo y se pagaron igual. ¿Qué cambió entre Santa Martha y La Popa?» | 18 | 94,0 |

### t7-1-a6-devoluciones-en-periodico · Devoluciones en periódico

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `dos-cuentas-propias` | «¿Por qué la devolución no se anota directo en Ingresos por ventas o en Compras?» | «Piensa qué dato perdería la gerencia si la devolución se restara directo de la venta.» | 15 | 67,2 |
| P4 · `cuanto-se-reversa` | «La devolución es de $2.400.000. ¿Cuánto IVA se devuelve con ella?» | «El IVA va con la mercancía. Si vuelve solo una parte, ¿cuánto IVA vuelve con ella?» | 16 | 89,8 |
| P5 · `libro-del-comprador` · proveedores ² | Línea «Cuentas por pagar – proveedores» (Debe o Haber) | «Dajema ahora le debe menos al proveedor. ¿De qué lado baja un pasivo?» | 13 | 75,7 |
| P5 · `libro-del-comprador` · retencion ² | Línea «Retención en la fuente por pagar» (Debe o Haber) | «La retención que Dajema descontó también baja con la devolución. ¿De qué lado baja un pasivo?» | 16 | 78,1 |
| P5 · `libro-del-comprador` · iva ² | Línea «IVA por pagar» (Debe o Haber) | «En la compra, este IVA fue al debe. La devolución lo reversa.» | 12 | 91,8 |
| P5 · `libro-del-comprador` · devoluciones ² | Línea «Devoluciones de compras» (Debe o Haber) | «Esta cuenta hace lo contrario de Compras. ¿De qué lado iba Compras?» | 12 | 91,8 |
| P6 · `libro-del-vendedor` · devoluciones ² | Línea «Devoluciones de ventas» (Debe o Haber) | «Esta cuenta hace lo contrario de Ingresos por ventas. ¿De qué lado iba la venta?» | 15 | 91,3 |
| P6 · `libro-del-vendedor` · iva ² | Línea «IVA por pagar» (Debe o Haber) | «El Tajamar ya no le debe al Estado el IVA de lo devuelto. ¿De qué lado baja un pasivo?» | 19 | 95,7 |
| P6 · `libro-del-vendedor` · anticipo ² | Línea «Anticipo fiscal» (Debe o Haber) | «El anticipo era algo a favor de El Tajamar. Con la devolución, ese valor baja.» | 15 | 78,9 |
| P6 · `libro-del-vendedor` · clientes ² | Línea «Cuentas por cobrar – clientes» (Debe o Haber) | «El cliente ahora le debe menos a El Tajamar. ¿De qué lado baja un activo?» | 15 | 91,3 |
| P7 · `lado-a-lado` | «¿Qué tienen en común los dos registros de la devolución?» | «Mira qué cuenta usó cada libro para la devolución, y si quedó del mismo lado que el registro original.» | 19 | 69,8 |

### t7-1-a7-control-interno · Control interno de los inventarios

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `al-recibir` | «Llega un pedido a una ferretería. La orden de compra pedía 80 cajas de tornillos, y la factura cobra 100. ¿Cuándo se debe notar la diferencia?» | «Piensa en qué momento están a la mano, al mismo tiempo, la factura y la orden de compra.» | 18 | 88,5 |
| P3 · `controles-de-seguridad` | «Un empleado de la bodega entrega 10 cajas a otra área porque alguien se las pidió de palabra. ¿Qué control no se cumplió?» | «El problema es cómo salió la mercancía de la bodega. Busca el control que decide quién puede sacarla.» | 18 | 80,2 |

### t7-2-a1-la-cuenta-que-si-se-mueve · La cuenta que sí se mueve

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `la-lista-del-libro` · las 5 líneas ² | Las cinco líneas: «El costo de la mercancía que la empresa compra.» · «El costo de la mercancía que le devuelven los clientes.» · «El costo de la mercancía que la empresa vende.» · «El costo de la mercancía que la empresa le devuelve a sus proveedores.» · «El valor de la mercancía que la empresa usa para su propio consumo.» | «Pregúntate si la mercancía entra a la bodega o sale de ella. Inventario de mercancías es un activo.» | 18 | 69,8 |
| P5 · `el-conteo-en-el-permanente` | «En el permanente, ¿para qué sirve el conteo físico?» | «En el permanente, el saldo ya está al día después de cada venta. ¿Qué le queda por hacer al conteo?» | 20 | 94,0 |

### t7-2-a2-la-venta-en-dos-asientos · La venta en dos asientos

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P1 · `la-compra` | «¿En qué cuenta va al debe el costo de la mercancía, $5.000.000?» | «Ahora la empresa usa el permanente. Recuerda qué cuenta deja de estar quieta en este sistema.» | 16 | 70,3 |
| P3 · `el-segundo-asiento` · costo ² | Línea «Costo de mercancía vendida» (Debe o Haber) | «Es lo que costó lo vendido, y ese costo aumenta. ¿De qué lado aumenta un costo?» | 16 | 93,7 |
| P3 · `el-segundo-asiento` · inventario ² | Línea «Inventario de mercancías» (Debe o Haber) | «Sale mercancía de la bodega. ¿De qué lado baja un activo?» | 11 | 82,4 |
| P4 · `por-que-dos-asientos` | «¿Por qué en el permanente hay un segundo asiento, y en el periódico no?» | «Piensa en cuándo se anota lo que costó lo vendido en cada sistema: ¿en cada venta o al cierre?» | 19 | 82,9 |

### t7-2-a3-el-kardex · El kárdex

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `peps` | «Con PEPS, ¿qué unidades salen en la venta del 9 de julio?» | «Con PEPS sale primero lo más antiguo. Empieza por lo que había al inicio y sigue en orden de fechas.» | 20 | 90,9 |
| P4 · `ueps` | «Con UEPS, ¿de dónde salen las 35 unidades del 20 de julio?» | «Con UEPS sale primero lo último que entró antes de esa venta. Mira cuál fue la compra más reciente.» | 19 | 92,4 |
| P5 · `promedio` | «Después de la compra del 14 de julio, ¿cuál es el nuevo costo promedio?» | «Junta el valor del saldo con el de la compra, y divide entre todas las unidades que hay ahora.» | 19 | 82,9 |
| P6 · `lado-a-lado` | «¿Qué método da el mismo inventario final en los dos sistemas, en este caso?» | «Piensa en qué método el orden de salida no depende de cuándo se hizo cada venta.» | 16 | 81,8 |

### t7-2-a4-san-calixto · San Calixto en permanente

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `peps` | «Con PEPS, ¿de dónde salen las 4.500 unidades del 6 de febrero?» | «Con PEPS sale primero lo más antiguo. ¿Alcanza lo que había al inicio para cubrir las 4.500?» | 17 | 81,1 |
| P3 · `ueps` | «Con UEPS, ¿de dónde salen las 4.500 unidades del 6 de febrero?» | «Con UEPS sale primero lo último que entró antes del 6 de febrero. Lo que llegó después aún no existe.» | 20 | 84,7 |
| P4 · `promedio` | «El 12 de febrero llegan 2.500 unidades a $1.350, más caras que el promedio de ese día. ¿Qué pasa con el costo promedio?» | «Si llega mercancía más cara que el promedio que había, ¿hacia dónde se mueve ese promedio?» | 16 | 70,1 |
| P5 · `que-cambia` | «Con UEPS, ¿por qué quedan 400 unidades del inicio y 700 del 25 de febrero?» | «Recorre el kárdex por fechas: cada venta solo podía usar lo que ya había llegado.» | 15 | 71,4 |
| P6 · `el-cierre` | «¿Qué asientos del cierre no hacen falta en el permanente?» | «En el periódico, unos asientos del cierre ponían al día el inventario. Busca esos.» | 14 | 70,8 |

### t7-2-a5-fletes · Fletes en permanente

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `lo-asume-el-comprador` | «En el permanente, ¿a qué cuenta va el flete de $650.000 que asume Santa Martha?» | «En el permanente, este flete sigue siendo parte del costo. ¿Qué cuenta guarda ese costo en este sistema?» | 18 | 80,2 |
| P3 · `lo-asume-el-vendedor` | «¿A qué cuenta va el flete que asume La Popa?» | «La Popa ya vendió esa mercancía. El flete no se suma al costo de nada que le quede.» | 18 | 97,5 |
| P4 · `el-asiento-del-costo` · costo ² | Línea «Costo de mercancía vendida» (Debe o Haber) | «Es el costo de lo que salió con la venta. ¿De qué lado aumenta un costo?» | 16 | 109,3 |
| P4 · `el-asiento-del-costo` · inventario ² | Línea «Inventario de mercancías» (Debe o Haber) | «La mercancía sale de la bodega. ¿De qué lado baja un activo?» | 12 | 86,6 |
| P5 · `frente-al-periodico` | «En el periódico, el flete que asume el comprador va a Compras (fletes). ¿Qué cambia en el permanente?» | «En los dos sistemas, ese flete se suma al costo. ¿Qué es lo distinto entre uno y otro?» | 18 | 97,5 |

### t7-2-a6-devoluciones · Devoluciones en permanente

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `libro-del-comprador` | «¿A qué cuenta va, en el haber, el valor de las 300 unidades devueltas?» | «En el permanente, la compra entró a una cuenta. La devolución saca la mercancía de esa misma cuenta.» | 18 | 76,7 |
| P3 · `libro-del-vendedor` · inventario ² | Línea «Inventario de mercancías» (Debe o Haber) | «Vuelve mercancía a la bodega. ¿De qué lado sube un activo?» | 11 | 82,4 |
| P3 · `libro-del-vendedor` · costo ² | Línea «Costo de mercancía vendida» (Debe o Haber) | «Lo devuelto ya no es una venta, así que su costo baja. ¿De qué lado baja un costo?» | 18 | 100,9 |
| P4 · `frente-al-periodico` | «En el periódico, la devolución de compras va a Devoluciones de compras. ¿Por qué en el permanente va a Inventario de mercancías?» | «Mira a qué cuenta fue la compra en el permanente. La devolución reversa ese mismo registro.» | 16 | 78,1 |

### t7-3-descuento-comercial · El descuento comercial

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `dos-clases` ² | «Un proveedor le rebaja el 10 % del precio de lista a un cliente, sin pedirle nada a cambio, y lo escribe en la factura. ¿Qué clase de descuento es?» | «Fíjate si el cliente tiene que cumplir algo para recibir la rebaja.» | 12 | 75,4 |
| P4 · `ejemplo` | «¿Sobre qué valor se calculan el IVA y la retención?» | «Piensa en qué valor queda en la factura después de la rebaja comercial.» | 13 | 83,6 |

### t7-3-descuentos-en-cadena · Descuentos en cadena

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `ejemplo` ² | «5 % más 8 % más 10 % suman 23 %. ¿San Calixto le rebaja el 23 % del precio de lista?» | «En una cadena, cada descuento se calcula sobre lo que dejó el anterior, no sobre el precio de lista.» | 19 | 76,4 |
| P3 · `pasos` ² | «¿Sobre qué valor se calcula el segundo descuento, el del 8 %?» | «El primer descuento ya rebajó el precio. ¿Sobre qué valor queda el siguiente?» | 13 | 85,3 |

### t7-3-descuento-condicionado · El descuento condicionado

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P1 · `que-es` ² | «¿Cuál de los dos descuentos se registra en la contabilidad?» | «El comercial ya viene restado en la factura. ¿Cuál de los dos ocurre después de facturar?» | 16 | 89,8 |
| P3 · `condiciones` | «Si el cliente paga a los treinta días, ¿qué descuento condicionado recibe?» | «Lee la condición que tiene el plazo de treinta días. ¿Trae algún porcentaje?» | 13 | 80,5 |
| P5 · `cual-le-toca` | «El 4 de junio, Santa Martha paga. Del 25 de mayo al 4 de junio pasaron diez días. ¿Qué descuento condicionado le toca?» | «Calcula los días que pasaron y compáralos con el plazo de cada condición, de la más corta en adelante.» | 19 | 73,1 |
| P6 · `sobre-que` | «¿Sobre qué valor se calcula el 15 %?» | «El descuento condicionado no toca el IVA. Y la rebaja comercial ya se restó antes.» | 15 | 78,9 |

### t7-3-descuento-en-dos-libros · El descuento en los dos libros

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `el-pago` ² | «El 4 de junio, Santa Martha paga y recibe el descuento. ¿A qué lado va Descuento comercial condicionado en su libro?» | «Santa Martha es quien recibe el descuento. Recuerda de qué lado lo anota quien lo recibe.» | 16 | 85,9 |
| P4 · `cierre` ² | «En el libro de San Calixto, la cuenta tenía saldo en el debe. ¿A qué lado va para cerrarla?» | «Para dejar una cuenta en cero, su saldo se anota en el lado contrario al que tiene.» | 17 | 83,6 |

### t7-3-sobrantes-y-faltantes · Sobrantes y faltantes

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `sobrante` | «¿Cuánto es el sobrante?» | «El sobrante es la diferencia entre lo que hay en la bodega y lo que dicen los libros.» | 18 | 91,9 |
| P3 · `faltante` ² | «En el ajuste por faltante, ¿a qué lado va Inventario de mercancías?» | «Si falta mercancía, el inventario de los libros tiene que bajar. ¿De qué lado baja un activo?» | 17 | 84,7 |

### t7-3-provision-inventarios · La provisión para inventarios

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `la-perdida` | «Llega la pérdida real de $230.000. ¿Qué cuenta va al debe?» | «El gasto ya se anotó cuando se hizo la provisión. ¿Qué cuenta se usa ahora para cubrir la pérdida?» | 19 | 85,9 |

### t7-3-nic2-costo · La NIC 2 del libro: el costo

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P3 · `como-se-mide` | «Esa mercancía costó $580.000. ¿Por qué valor se mide, según la NIC 2 del libro?» | «La NIC 2 del libro pide el menor de dos valores. ¿Cuáles son esos dos aquí?» | 16 | 93,7 |
| P4 · `el-costo` | «¿Cuál de estos se resta para hallar el costo de adquisición?» | «El costo sube con lo que hace falta para tener la mercancía. ¿Cuál de estos lo hace bajar?» | 18 | 94,0 |

### t7-3-nic2-formulas · La NIC 2 del libro: fórmulas y revelación

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P2 · `formulas` | «¿Cuántas fórmulas del costo nombra la NIC 2 del libro?» | «Recuerda que uno de los métodos que viste no es válido bajo NIIF.» | 13 | 88,4 |

### t5-a1-cuidar-las-inversiones · Cómo se cuidan las inversiones

| Pantalla | Pregunta | Pista (primer error) | Palabras | INFLESZ |
| --- | --- | --- | --- | --- |
| P6 · `practica` | «La empresa guarda un CDT, pero nadie sabe cuándo vence. ¿Qué acción del libro falta?» | «Piensa si el problema está en un dato del CDT, en un movimiento o en algo que no ha terminado.» | 20 | 87,2 |

**Decisión para L (y Misa)**

**En las preguntas de dos opciones (²), ¿qué pasa con el primer error?**
- (a) Sale la pista y el segundo intento no suma puntos, solo cierra la pregunta.
- (b) Sale directo la respuesta con su porqué, sin pista.
- (c) Cada una pasa a tres opciones, como hizo Mello con la base de la retención de A2 (5.000.000 · 5.800.000 · 5.625.000). Las líneas de Debe o Haber no pueden tener tres opciones.

Yo iría con (c) en las 10 preguntas y con (a) en las líneas.
