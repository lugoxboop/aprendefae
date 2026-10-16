# Lote 1 · entrega 4: error de fondo de la NIC 2 y fusión A7 + A8 de T7-3

Célula C · Near · 15 de octubre de 2026. Primero va el error de fondo que encontró Mello y después la pieza fusionada, como ordenó L.

## 1. El error de fondo: «almacenamiento»

La p. 258 suma al costo de adquisición el almacenamiento solo como uno de los costos **«directamente atribuibles a la adquisición»**. Las piezas lo resumieron como «lo que cuesta guardarla», sin ese límite. Así parece que guardar la mercancía mes a mes, por ejemplo el arriendo de la bodega, también sería costo, y el libro no dice eso.

**Correcciones en los datos publicados** (`src/data/contabilidadT7_3_a7.js`). Valen si Misa construye antes de la pieza fusionada de abajo; si no, la pieza fusionada ya las trae.

| Línea | Viejo | Nuevo |
| --- | --- | --- |
| 134 | «El costo de adquisición incluye el precio de compra, lo que cuesta traer la mercancía y lo que cuesta guardarla.» | La frase sale de la pantalla. Lo que se suma pasa a la figura del acierto (abajo), con el límite. |
| 143 y 145 (opciones) | «El transporte» · «El almacenamiento» | «El transporte hasta la bodega» · «El bodegaje en la aduana mientras llega» |
| 143 y 145 (su retroalimentación) | «El transporte y el almacenamiento se suman al costo. Lo que se resta es el descuento comercial.» | «Eso se suma al costo: hace parte de adquirir la mercancía.» |
| 147 (acierto) | «Así es. El descuento comercial se resta. El transporte y el almacenamiento se suman al costo.» | «Así es: el descuento comercial se resta.», con la figura de lo que se suma y lo que se resta. |
| 157 (resumen) | «El costo suma el precio, el transporte, el almacenamiento y los impuestos que no se recuperan.» | «El costo suma lo que es parte de adquirir la mercancía y resta los descuentos comerciales.» |

**Correcciones en mis entregas de hoy**

| Dónde | Viejo | Nuevo |
| --- | --- | --- |
| Entrega 2 · `el-costo` · figura del acierto | «Se suma: precio de compra, transporte, almacenamiento, aranceles e impuestos que no se recuperan» | «Se suma: precio, transporte, aranceles, impuestos que no se recuperan y otros costos de adquirirla» |
| Entrega 2 · `el-costo` · «¿Por qué?» | (no decía el límite) | «Lo que se paga por guardarla entra solo si es parte de la compra.» · «El libro: «directamente atribuibles a la adquisición».» (p. 258, en el pie) · [CONSTRUCCIÓN] «Guardarla después, mes a mes, ya no es parte de adquirirla.» |
| Entrega 2 · resumen | «El costo suma lo que hace falta para tener la mercancía, y resta los descuentos comerciales.» | «El costo suma lo que es parte de adquirir la mercancía y resta los descuentos comerciales.» |
| Lote 2 · pista de `el-costo` | «El costo sube con lo que hace falta para tener la mercancía. ¿Cuál de estos lo hace bajar?» | «El costo sube con lo que hace parte de adquirir la mercancía. ¿Cuál de estos lo hace bajar?» |

**Lo que no cambio**
- **T7-1 H5, «El bodegaje que se paga en la aduana…».** Está bien: es bodegaje mientras se adquiere la mercancía importada (p. 208), y es el caso que propone Mello.
- **T7-3 H6.** No la toco, porque L la retiró.

**[CONSTRUCCIÓN]** «Guardarla después, mes a mes, ya no es parte de adquirirla» es mía. Sale del límite de la p. 258, pero el libro no da ese ejemplo. Por eso va marcada y plegada.

## 2. La fusión: A7 «La NIC 2 del libro: el costo» + A8 «fórmulas y revelación»

- **Queda una sola pieza:** id `t7-3-nic2-costo` (el de A7), título «La NIC 2 del libro». A8 (`t7-3-nic2-formulas`) sale de la lista.
- **Fuentes:** une las pantallas de las entregas 2 de A7 y de A8, con el error de arriba corregido. La lista de lo que la norma pide informar, que en A8 era una pantalla de lectura, pasa plegada al resumen («Ver lo que la norma pide informar»).
- **La portada:** se acorta para que la frase obligatoria de la NIC 2 quepa con ella: 33 palabras en total.

## t7-3-nic2-costo · «La NIC 2 del libro»

**Medida.** Antes: A7 tenía 6 pantallas y A8 tenía 6; Misa midió 71 y 67 palabras antes de tocar, y 207 y 251 en la más cargada. Ahora: 9 pantallas, 7 con acción. Ninguna pasa de 40 palabras antes de tocar ni de 60 visibles. Todos los textos de 10 palabras o más dan 65 o más en INFLESZ; el mínimo es 65,8.

| # | Pantalla | Antes de tocar | Máx. visible | Estado más largo |
| --- | --- | --- | --- | --- |
| P0 | `portada` (portada) | 38 | 38 | — |
| P1 | `que-es` (eleccion) | 30 | 59 | pista (1.er error) |
| P2 | `como-se-mide` (eleccion) | 39 | 59 | acierto |
| P3 | `el-costo` (eleccion) | 15 | 58 | acierto |
| P4 | `formulas` (eleccion) | 29 | 53 | error · FIFO |
| P5 | `la-que-falta` (eleccion) | 27 | 48 | pista (1.er error) |
| P6 | `sistemas` (eleccion) | 33 | 59 | pista (1.er error) |
| P7 | `gasto` (eleccion) | 15 | 51 | acierto |
| P8 | `resumen` (resumen) | 0 | 60 | — |

**P0 · `portada`** (portada)
- «Vas a ver qué trae el libro de la NIC 2 sobre los inventarios.» (94,9)
- «Lo que ves aquí de la NIC 2 es lo que trae el libro. No lo tomes como el texto vigente de la norma.» (101,4)

**P1 · `que-es`** (eleccion)
- «La NIC 2 es una norma de contabilidad para muchos países. Habla de los inventarios.» (70,6)
- «Una tienda tiene estas tres cosas. ¿Cuál es inventario, según la NIC 2 del libro?» (87,2)
- Opciones o líneas: «La mercancía que tiene para vender» · «El computador de la oficina» · «El local donde vende»
- *pista (1.er error):* «Piensa en cuál de las tres se tiene para venderla en la operación normal.» (90,5)
- *error · computador:* «El computador no se vende ni se gasta en producir.» (90,9)
- *error · local:* «El local no se tiene para venderlo. Es donde la tienda trabaja.» (91,8)
- *acierto:* «Así es: se tiene para venderla en la operación normal.» (78,5)
  - ¿Por qué? (plegado): «Según el libro, también son inventarios lo que está en producción para esa venta y los materiales que se van a gastar en producir. Según el libro, esta NIC 2 cambió una versión de 1993 y vale desde el 1 de enero de 2005.» (71,6)

**P2 · `como-se-mide`** (eleccion) · figura: renglones: precio esperado − lo que cuesta vender = valor neto realizable. La marca «Ejemplo que no es del libro» pasa al pie.
- «Un inventario se mide al costo o al valor neto realizable: el menor de los dos.» (81,8)
- «Precio esperado de venta $610.000» (no aplica)
- «− Lo que cuesta vender $60.000» (no aplica)
- «= Valor neto realizable $550.000» (no aplica)
- «Esa mercancía costó $580.000. ¿Por qué valor se mide?» (no aplica)
- Opciones o líneas: «$580.000» · «$550.000» · «$610.000»
- *pista (1.er error):* «La NIC 2 del libro pide el menor de dos valores. ¿Cuáles son esos dos aquí?» (93,7)
- *error · $580.000:* «Ese es el costo. Compáralo con el valor neto realizable.» (71,0)
- *error · $610.000:* «$610.000 es el precio esperado. La norma compara el costo con el valor neto realizable.» (70,6)
- *acierto:* «Así es: el menor es el valor neto realizable.» (no aplica) Figura: «Costo $580.000 Valor neto realizable $550.000 El menor».
  - ¿Por qué? (plegado): «El valor neto realizable es el precio al que se espera vender, menos lo que falta gastar para terminar el producto y para venderlo.» (66,0)

**P3 · `el-costo`** (eleccion) · figura: en el acierto: dos columnas, «Se suma» y «Se resta»
- «Una tienda compra mercancía. ¿Cuál de estos se resta para hallar su costo de adquisición?» (78,9)
- Opciones o líneas: «El transporte hasta la bodega» · «Un descuento comercial» · «El bodegaje en la aduana mientras llega»
- *pista (1.er error):* «El costo sube con lo que hace parte de adquirir la mercancía. ¿Cuál de estos lo hace bajar?» (94,0)
- *error · transporte o bodegaje:* «Eso se suma al costo: hace parte de adquirir la mercancía.» (76,9)
- *acierto:* «Así es: el descuento comercial se resta.» (no aplica) Figura: «Se suma: precio, transporte, aranceles, impuestos que no se recuperan y otros costos de adquirirla Se resta: descuentos comerciales y rebajas».
  - ¿Por qué? (plegado): «Lo que se paga por guardarla entra solo si es parte de la compra. El libro: «directamente atribuibles a la adquisición». Guardarla después, mes a mes, ya no es parte de adquirirla. Los aranceles son los impuestos que se pagan por traer mercancía de otro país. Si la empresa fabrica lo que vende, también suma lo que le cuesta convertir los materiales en productos. El libro lo llama costos de transformación.» (81,8)

**P4 · `formulas`** (eleccion)
- «Según la NIC 2 del libro, hay tres fórmulas del costo. Las ves aquí abajo.» (91,3)
- «Una joyería vende anillos hechos a mano, cada uno distinto. ¿Qué fórmula le sirve?» (66,3)
- Opciones o líneas: «Identificación específica» · «FIFO» · «Promedio ponderado»
- *pista (1.er error):* «Fíjate en si los anillos se pueden cambiar uno por otro.» (88,2)
- *error · FIFO:* «FIFO sirve cuando las unidades son iguales y se pueden cambiar una por otra. Aquí cada anillo es distinto.» (72,7)
- *error · promedio:* «El promedio les da el mismo costo a unidades iguales. Aquí cada anillo es distinto.» (70,6)
- *acierto:* «Así es: cada anillo lleva su propio costo.» (no aplica)
  - ¿Por qué? (plegado): «Según el libro, esta fórmula se usa para productos que no se pueden cambiar uno por otro, porque cada uno es distinto.» (71,6)

**P5 · `la-que-falta`** (eleccion)
- «En otras partes del libro, FIFO se llama PEPS.» (no aplica)
- «¿Cuál de los métodos que ya viste no está en la lista de la NIC 2 del libro?» (98,8)
- Opciones o líneas: «PEPS» · «UEPS (no válido bajo NIIF)» · «Promedio ponderado»
- *pista (1.er error):* «Recuerda que uno de los métodos que viste no es válido bajo NIIF.» (88,4)
- *error · PEPS:* «PEPS sí está: es FIFO con otro nombre.» (no aplica)
- *error · promedio:* «El promedio ponderado sí está: es la tercera fórmula.» (no aplica)
- *acierto:* «Así es: UEPS no está en la lista.» (no aplica)
  - ¿Por qué? (plegado): «La empresa usa la misma fórmula para los inventarios que se parecen en su naturaleza y en su uso.» (69,8)

**P6 · `sistemas`** (eleccion)
- «El libro nombra dos sistemas que sirven si se acercan al costo: el costo estándar y el de los minoristas.» (80,9)
- «Un supermercado vende miles de artículos que se venden rápido. ¿Cuál le sirve?» (75,7)
- Opciones o líneas: «El costo estándar» · «El método de los minoristas» · «La identificación específica»
- *pista (1.er error):* «Busca el que el libro pone para tiendas con muchos artículos que se venden rápido.» (79,7)
- *error · costo estándar:* «El libro no lo describe más. Para tiendas con muchos artículos, recomienda el otro.» (79,7)
- *error · identificación:* «Esa fórmula es para productos que son todos distintos. Aquí hay miles de artículos iguales.» (66,4)
- *acierto:* «Así es: el libro lo pone para tiendas con muchos artículos que se venden rápido.» (79,7)
  - ¿Por qué? (plegado): «Los minoristas son las tiendas que le venden al público. En ese método, el costo se halla restándole al precio de venta un porcentaje de margen bruto: la parte del precio que la tienda gana sobre lo que le costó la mercancía.» (77,6)

**P7 · `gasto`** (eleccion)
- «Una tienda vende mercancía en marzo. ¿Cuándo se vuelve gasto el valor de esa mercancía?» (74,7)
- Opciones o líneas: «En marzo, con los ingresos de esa venta» · «Cuando la tienda la compró» · «Nunca: el inventario no se vuelve gasto»
- *pista (1.er error):* «Piensa en qué momento la mercancía deja de ser de la tienda.» (91,0)
- *error · al comprar:* «Al comprarla, la mercancía es un activo: todavía no es gasto.» (71,2)
- *error · nunca:* «Sí se vuelve gasto: cuando se vende, deja de ser un activo.» (96,2)
- *acierto:* «Así es: el gasto se reconoce en el mismo periodo que los ingresos de la venta.» (85,7)
  - ¿Por qué? (plegado): «Si el inventario se rebaja hasta su valor neto realizable, o se pierde, eso se reconoce en el periodo en que pasa.» (65,9)

**P8 · `resumen`** (resumen) · figura: «Costo o valor neto realizable: el menor» y las tres fórmulas como fichas
- «El menor de los dos» (no aplica)
- «Identificación específica» (no aplica)
- «FIFO» (no aplica)
- «Promedio ponderado» (no aplica)
- «El inventario se mide por el menor entre el costo y el valor neto realizable.» (75,5)
- «El costo suma lo que es parte de adquirir la mercancía y resta los descuentos comerciales.» (74,0)
- «UEPS no está entre las fórmulas de la NIC 2 del libro.» (96,2)
- «Ver lo que la norma pide informar» (no aplica)
