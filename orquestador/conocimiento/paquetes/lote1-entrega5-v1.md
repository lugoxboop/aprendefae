# Lote 1 · entrega 5: las otras dos fusiones

Célula C · Near · 15 de octubre de 2026.
- **T7-2:** A5 y A6 quedan en una sola pieza.
- **T5:** N2 entra en N3.

Las dos fusiones cumplen la barra B1 y B2, y medí el INFLESZ con la herramienta oficial.

## 1. T7-2 · «Fletes y devoluciones en permanente» (id `t7-2-a5-fletes`)

- **Ids.** Queda el id de A5. `t7-2-a6-devoluciones` sale de la lista. Es Aprender, así que no toca FP.
- **Lo que une las dos.** En el permanente no existe Compras. Por eso, el flete del comprador y la devolución de compras van a Inventario de mercancías. La pantalla `frente-al-periodico` pregunta ahora por los dos casos a la vez.
- **Lo que sale.** El asiento del costo de la venta de La Popa (`el-asiento-del-costo`) ya lo enseña y lo practica A2. Además traía el texto circular que señaló Mello («tiene saldo deudor: va al debe»).
- **Nombres.** «Gasto de venta – fletes» y, en prosa, «gasto de venta», como dice el nombre de la cuenta. Ver el punto de «gasto de ventas» en la próxima entrega.
- **Cambio al lote 2:** la pista de `frente-al-periodico` pasa a ser «¿A qué cuenta fue la compra en el permanente?».

**Medida.** Antes: A5 tenía 7 pantallas y A6 tenía 6; Misa midió 184 y 189 palabras en la más cargada. Ahora: 7 pantallas, 5 con acción. Ninguna pasa de 40 palabras antes de tocar ni de 60 visibles. Todos los textos de 10 palabras o más dan 65 o más en INFLESZ; el mínimo es 65,6.

| # | Pantalla | Antes de tocar | Máx. visible | Estado más largo |
| --- | --- | --- | --- | --- |
| P0 | `portada` (portada) | 16 | 16 | — |
| P1 | `lo-asume-el-comprador` (eleccion) | 23 | 53 | acierto |
| P2 | `lo-asume-el-vendedor` (eleccion) | 25 | 53 | pista (1.er error) |
| P3 | `libro-del-comprador` (eleccion) | 28 | 53 | pista (1.er error) |
| P4 | `libro-del-vendedor` (lados) | 29 | 56 | pista · costo (1.er error) |
| P5 | `frente-al-periodico` (eleccion) | 28 | 54 | error · no se registran |
| P6 | `resumen` (resumen) | 0 | 54 | — |

**P0 · `portada`** (portada)
- «Vas a ver qué pasa con un flete y con una devolución en el sistema permanente.» (85,7)

**P1 · `lo-asume-el-comprador`** (eleccion)
- «Santa Martha usa el permanente. Compra mercancía y paga $650.000 de flete para traerla a su bodega.» (66,4)
- «¿A qué cuenta va el flete?» (no aplica)
- Opciones o líneas: «Inventario de mercancías (fletes)» · «Compras (fletes)» · «Gasto de venta – fletes»
- *pista (1.er error):* «En el permanente, este flete sigue siendo parte del costo. ¿Qué cuenta guarda ese costo en este sistema?» (80,2)
- *error · Compras (fletes):* «Compras es la cuenta del periódico. En el permanente no se usa.» (91,8)
- *error · Gasto de venta:* «Ese es el flete que asume quien vende. Aquí lo asume quien compra.» (90,1)
- *acierto:* «Así es: el flete se suma al costo de la mercancía.» (93,9) Figura: «Inventario de mercancías $7.500.000 Inventario de mercancías (fletes) $650.000».
  - ¿Por qué? (plegado): «Todo gasto directo que hace falta para tener la mercancía lista para la venta forma parte de su costo.» (69,8)

**P2 · `lo-asume-el-vendedor`** (eleccion)
- «Otro caso: el flete lo asume La Popa, que vende. Lleva la mercancía hasta Santa Martha y paga $650.000.» (79,3)
- «¿A qué cuenta va ese flete?» (no aplica)
- Opciones o líneas: «Gasto de venta – fletes» · «Compras (fletes)» · «Inventario de mercancías (fletes)»
- *pista (1.er error):* «La Popa ya vendió esa mercancía. El flete no se suma al costo de nada que le quede.» (97,5)
- *error · Compras (fletes):* «La Popa no está comprando: está vendiendo.» (no aplica)
- *error · Inventario (fletes):* «Ese flete no trae mercancía a la bodega de La Popa: la lleva al cliente.» (83,8)
- *acierto:* «Así es: para quien vende, el flete es un gasto de venta, en los dos sistemas.» (97,4)

**P3 · `libro-del-comprador`** (eleccion)
- «Santa Martha le compró a Tierra Bomba. Le devuelve 300 unidades que le llegaron mal.» (78,9)
- «¿A qué cuenta va, en el haber, el valor de las 300 devueltas?» (98,0)
- Opciones o líneas: «Inventario de mercancías» · «Devoluciones de compras» · «Compras»
- *pista (1.er error):* «En el permanente, la compra entró a una cuenta. La devolución saca la mercancía de esa misma cuenta.» (76,7)
- *error · Devoluciones de compras:* «Esa cuenta es del periódico. Aquí la devolución reversa la compra en su misma cuenta.» (74,7)
- *error · Compras:* «En el permanente no existe Compras.» (no aplica)
- *acierto:* «Así es: la mercancía vuelve al proveedor y el inventario baja.» (65,6) Figura: «300 × $8.000 = $2.400.000».
  - ¿Por qué? (plegado): «Ver el asiento completo de la devolución.» (no aplica)

**P4 · `libro-del-vendedor`** (lados)
- «Tierra Bomba vendió y recibe la devolución. Cada unidad le costó $3.200. Ya anotó lo que dejó de cobrar; falta el costo.» (80,6)
- «Toca Debe o Haber en cada línea.» (no aplica)
- Opciones o líneas: «Inventario de mercancías $960.000» · «Costo de mercancía vendida $960.000»
- *pista · costo (1.er error):* «Lo devuelto ya no es una venta, así que su costo baja. ¿De qué lado baja un costo?» (100,9)
- *error · inventario:* «Vuelve mercancía a la bodega, así que el activo aumenta: va al debe.» (74,0)
- *error · costo:* «Se reversa el costo de lo que volvió: baja, y va al haber.» (102,8)
- *acierto:* «Así es: vuelven $960.000 al inventario.» (no aplica) Figura: «300 × $3.200 = $960.000».
  - ¿Por qué? (plegado): «El primer asiento va a Devoluciones de ventas, que se resta de Ingresos por ventas en el estado de resultados. Ver los dos asientos de Tierra Bomba.» (82,6)

**P5 · `frente-al-periodico`** (eleccion)
- «En el periódico, ese flete va a Compras (fletes) y la devolución, a Devoluciones de compras. ¿Por qué en el permanente las dos van a Inventario de mercancías?» (77,1)
- Opciones o líneas: «Porque no existe Compras.» · «Porque las dos son gastos.» · «Porque no se registran aparte.»
- *pista (1.er error):* «¿A qué cuenta fue la compra en el permanente?» (no aplica)
- *error · gastos:* «El flete del comprador sigue siendo costo.» (no aplica)
- *error · no se registran:* «Sí se registran, pero en la cuenta donde se anotó la compra.» (91,0)
- *acierto:* «Exacto: todo lo de la compra va a la cuenta del inventario.» (91,0)

**P6 · `resumen`** (resumen) · figura: tres fichas: flete del comprador, flete del vendedor y devolución
- «Flete del comprador: inventario» (no aplica)
- «Flete del vendedor: gasto» (no aplica)
- «Devolución: inventario» (no aplica)
- «En el permanente, el flete del comprador y la devolución de compras van a Inventario de mercancías.» (68,9)
- «El flete del vendedor es un gasto de venta, en los dos sistemas.» (98,0)
- «Si se devuelve una venta, hay un segundo asiento: el costo vuelve al inventario.» (72,7)

## 2. T5 · N3 «¿Qué revisión falta?», con lo de N2 adentro

- **Ids.** N2 (`t5-a1-cuidar-las-inversiones`) sale de la lista. Es Aprender, sin FP. N3 se queda sola, con las cuatro acciones como opciones fijas y una glosa de una línea para cada una.
- **Aciertos.** Siguen siendo 5, así que la migración 0111 no cambia.
  - El caso del fondo fiduciario no medía nada, porque se resolvía con el nombre (regla 9 de Mello). Pasa a ser el ejemplo resuelto y no da puntos.
  - Para conservar los 5 aciertos entra un caso nuevo, una venta que todavía no termina [CONSTRUCCIÓN]. Así Confirmar queda con dos casos, Verificar con dos y Examinar con uno.
- **Escalera de ayuda, como pide Mello.** Al primer error sale la pista; al segundo, la respuesta con su porqué. **Decisión mía, que se puede deshacer: solo suma el primer intento**, como en el resto de los Hacer de la célula.
- **Ninguna retroalimentación nombra la acción correcta de su caso.** Cada distractor tiene su propio texto. El ítem 4 conserva la corrección de Mello: «Nadie sabe si esa compra sigue en curso».

**Consigna:** «Cada caso muestra un riesgo con las inversiones. Elige la acción del libro que hace falta. Si fallas, verás una pista y tendrás otro intento.» (83,9)

**Opciones fijas, cada una con su glosa de una línea** (regla fija en pantalla, como en `EligeUnaOpcion`):

- **Verificar cada inversión:** «Revisar los datos de cada documento: quién lo emitió, el precio, cuándo vence y el número.» (74,0)
- **Examinar las compras y las ventas:** «Revisar el movimiento de compra y venta de inversiones.» (no aplica)
- **Confirmar las operaciones en tránsito:** «Revisar las operaciones que empezaron y aún no terminan.» (no aplica) *[CONSTRUCCIÓN: el libro no define «en tránsito»]*
- **Comprobar los fondos fiduciarios:** «Revisar que existan, cuando la inversión los pida.» (no aplica)

**Ejemplo resuelto («Así se juega», no da puntos):** «Una inversión pide un fondo fiduciario, y nadie ha visto que ese fondo exista.» (68,2) → Comprobar. Nota: «La acción es comprobar. El libro solo la nombra: no explica qué es un fondo fiduciario.» (89,8). **HUECO:** el libro solo da el nombre; por eso este caso enseña la acción, pero no se califica (regla 9 de Mello).

**Pista del primer error, la misma en los cinco casos:** «¿El problema está en un dato de un documento, en un movimiento o en algo sin terminar?» (79,9)

| # | Caso | Correcta | Acierto | Si elige Verificar | Si elige Examinar | Si elige Confirmar | Si elige Comprobar |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | «La empresa guarda unos bonos, pero nadie ha revisado quién los emitió ni cuándo vencen.» (71,4) | Verificar | «Así es: el emisor y el vencimiento son datos que se revisan al verificar.» (77,1) | — | «Aquí no hay compras ni ventas que revisar. Lo que falta son datos de un documento.» (93,7) | «Los bonos ya están en la empresa: no hay nada en tránsito.» (96,2) | «El caso no habla de un fondo fiduciario.» (no aplica) |
| 2 | «En la caja fuerte hay un título, pero nadie ha comparado su número de serie con el de los registros.» (80,9) | Verificar | «Así es: el número de serie es uno de los datos que se verifican.» (90,5) | — | «No se trata de un movimiento de compra o venta, sino de un dato del título.» (89,6) | «El título ya está en la caja fuerte: no está en tránsito.» (91,0) | «El caso no habla de un fondo fiduciario.» (no aplica) |
| 3 | «Durante el año hubo muchas compras y ventas de acciones. Nadie ha revisado ese movimiento.» (66,4) | Examinar | «Así es: el libro pide revisar el movimiento de compra y venta.» (80,6) | «Verificar mira los datos de un documento. Aquí falta revisar todo lo que se compró y vendió.» (77,4) | — | «Esas compras y ventas ya terminaron: no están en tránsito.» (78,5) | «El caso no habla de un fondo fiduciario.» (no aplica) |
| 4 | «La empresa pagó unos bonos hace tres días y el documento no ha llegado. Nadie sabe si esa compra sigue en curso.» (82,6) | Confirmar | «Así es: una compra que empezó y no ha terminado está en tránsito.» (78,8) | «Aún no hay un documento que se pueda verificar: la compra no ha terminado.» (77,1) | «No se trata del movimiento del año, sino de una compra que no ha terminado.» (83,8) | — | «El caso no habla de un fondo fiduciario.» (no aplica) |
| 5 | «La empresa vendió unas acciones el viernes. El dinero aún no le llega, y nadie sabe si la venta se va a completar.» (89,7) | Confirmar | «Así es: una venta que no ha terminado también está en tránsito.» (80,6) | «El problema no es un dato del título, sino una venta que no ha terminado.» (83,8) | «No se trata del movimiento del año, sino de una venta que no ha terminado.» (83,8) | — | «El caso no habla de un fondo fiduciario.» (no aplica) |
