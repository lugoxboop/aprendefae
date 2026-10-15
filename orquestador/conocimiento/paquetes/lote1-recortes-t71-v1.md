# Lote 1 · Recortes · T7-1: A1, A3 y A4

Célula C · Near · 15 de octubre de 2026. Se aplica la barra de `enganche.md`:
- **B1:** como mucho 40 palabras antes de la figura o de la interacción.
- **B2:** como mucho 60 palabras visibles por pantalla.
- **B3:** al menos la mitad de las pantallas tiene una acción.

Cada pieza abre con el caso, no con la teoría. Las correcciones de «respuesta regalada» que pidió Mello en estas tres piezas también van aplicadas.

**Cómo se mide** (con un script, no a ojo)
- **«Antes de tocar»:** todo lo que se lee antes de la primera interacción, incluidos los textos de la figura (tablas, fichas, rótulos).
- **«Máx. visible»:** lo de antes, más las opciones o líneas, más el estado más largo. Ese estado puede ser la pista del primer error, el error o el acierto. Solo se cuentan sus dos primeras frases.
- **No se cuenta:** lo plegado tras «¿Por qué?», ni los pies ni los botones.
- **Lo que no es palabra:** los «·» no cuentan; cada cifra cuenta como una palabra.
- **Cifras de Misa para comparar:** salen de `c7-medicion-320-375.md`. Esa medida cuenta todo lo visible en el primer estado.

**Correcciones de Mello aplicadas**

| Pieza | Lo que señaló Mello | Cómo queda |
| --- | --- | --- |
| A1 | P3 daba la respuesta de P4; unas 280 palabras y 4 pantallas antes de decidir; el error de P4 nombraba «Compras». | Abre con La Reventa en la P1, con 31 palabras antes de tocar. La explicación de P3 pasa a ser la retroalimentación de quien elige Inventario. Ningún error nombra Compras. Las pantallas `lo-que-ya-sabes`, `el-conteo-al-final` y `la-consecuencia` salen. |
| A3 | P8 preguntaba el porqué justo después de leerlo; P7 tenía 6 tarjetas, unas 100 palabras. | La P8 pasa a ser una inferencia sobre la tabla, antes de leer el porqué: «Cuando los precios suben, ¿con qué método lo vendido queda más caro?». Las tarjetas se abren una por método, en su propia pantalla. La refutación va aparte. |
| A4 | P1 daba la respuesta de P4; la ficha tenía 10 operaciones y la tabla 6 asientos resueltos antes de decidir; la idea fuerte llegaba al final. | Abre con una apuesta: «¿Con qué método crees que sale más utilidad?». La regla de los lados sale de la P1. La ficha muestra solo totales, con las 10 operaciones plegadas. Los otros asientos del cierre van plegados. Cada utilidad se define al tocar su fila. La apuesta se compara al final. |
| A4 | La P5 daba la fórmula y después preguntaba el costo. | Ya no se da la fórmula antes. La pista orienta: «Falta quitar algo». La fórmula queda en el acierto y en el resumen. |

**Lo nuevo que tiene que construir Misa** (la mecánica es suya; aquí va lo que la pantalla necesita)
- **A3 · P1 `el-problema`:** una figura con la pila de unidades: 10 a $20.000 y 30 a $25.000; salen 35 y quedan 5.
- **A3 · P7 `a-favor-y-en-contra`:** tres tarjetas cerradas. Al tocar una se abre esa sola, con «A favor» y «En contra».
- **A4 · P1 `la-apuesta`:** una predicción sin calificar y sin puntos. Se guarda lo que eligió el estudiante. En la P6, la columna de su apuesta va marcada con borde, sin texto, y el acierto se compara con ella.
- **A4 · P5 `las-utilidades`:** el estado de resultados en filas. Al tocar una utilidad se abre su definición, una a la vez.
- **A4 · P3 `el-cierre`:** el nombre «Inventario de mercancías» va una sola vez, arriba de sus dos líneas (B5: un texto no se repite en la pantalla).

**Ids nuevos o que cambian:** A3 `la-recomendacion` (pregunta nueva) y `la-refutacion` (nueva, sale de la vieja `a-favor-y-en-contra`); A4 `la-apuesta` y `las-utilidades`. Las preguntas que siguen iguales conservan su id, así las pistas del lote 2 siguen ubicadas.

**Lo que esto cambia del lote 2 y de su anexo** (los textos nuevos ganan)

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| Pista · A3 `peps` | «Con PEPS, las primeras unidades que entraron son las primeras que salen. ¿Cuáles se quedan?» | «Con PEPS salen primero las primeras que entraron. ¿Cuáles se quedan?» |
| Pista · A3 `ueps` | «Con UEPS, salen primero las últimas que entraron. Piensa cuáles se quedan sin salir.» | «Con UEPS salen primero las últimas que entraron. ¿Cuáles se quedan?» |
| Pista · A3 `lado-a-lado` | «Mira de qué compra son las unidades que quedan con PEPS, y cuánto costó esa compra.» | «¿De qué compra son las 5 que quedan con PEPS, y cuánto costó?» |
| Pista · A3 `la-recomendacion` | (la de la pregunta vieja) | «Mira la tabla anterior: ¿con qué método lo que queda vale menos? Ese costo no desaparece.» |
| Pista · A4 `el-cierre` · quitar | «Ese valor ya no es lo que hay, así que sale de la cuenta. ¿De qué lado baja un activo?» | «Ese valor sale de la cuenta. ¿De qué lado baja un activo?» |
| Pista · A4 `lado-a-lado` | «Si queda más en la bodega, ¿sale más o menos costo hacia lo vendido? Sigue ese efecto hasta la utilidad.» | «Si queda más en la bodega, ¿lo vendido lleva más o menos costo?» |
| Anexo · A3 `peps` y `ueps` · tercera opción | «De los dos grupos, con un costo promedio» | «De los dos, con un costo promedio» |
| Anexo · A3 `peps` · su retroalimentación | «Eso hace el promedio ponderado, que viene después. PEPS no mezcla: toma las unidades en el orden en que entraron.» | «Eso es el promedio ponderado. PEPS no mezcla.» |
| Anexo · A3 `ueps` · su retroalimentación | «Eso hace el promedio ponderado, que viene después. UEPS no mezcla: toma las unidades en orden, desde la última que entró.» | «Eso es el promedio ponderado. UEPS no mezcla.» |

## t7-1-a1-la-cuenta-que-no-se-mueve · «La cuenta que no se mueve»

**Medida.** Antes: 4 pantallas de lectura antes de decidir; Misa midió 50 palabras en la primera y 204 en la más cargada. Ahora: 4 pantallas, 2 con acción. Ninguna pasa de 40 palabras antes de tocar ni de 60 visibles. Todos los textos de 10 palabras o más dan 65 o más en INFLESZ; el mínimo es 66,0.

| # | Pantalla | Antes de tocar | Máx. visible | Estado más largo |
| --- | --- | --- | --- | --- |
| P0 | `portada` (portada) | 19 | 19 | — |
| P1 | `pregunta-compra` (pregunta) | 31 | 59 | acierto |
| P2 | `pregunta-conteo` (pregunta) | 25 | 55 | pista (1.er error) |
| P3 | `resumen` (resumen) | 32 | 32 | — |

**P0 · `portada`** (portada)
- «Vas a ver a qué cuenta va la compra de mercancía cuando nadie lleva el inventario día a día.» (82,9)

**P1 · `pregunta-compra`** (pregunta) · figura: F4 (c · ei · eg · a)
- «La Reventa usa el sistema periódico. No mira su mercancía cada día, sino al final.» (70,6)
- «El 16 de abril compra mercancía por $5.000.000, a crédito.» (66,0)
- «¿A qué cuenta va al debe?» (no aplica)
- Opciones o líneas: «Inventario de mercancías» · «Compras» · «Gastos de administración y ventas»
- *pista (1.er error):* «Busca la cuenta que recoge lo comprado en el periodo.» (84,7)
- *error · Inventario de mercancías:* «Esa sería la regla del Tema 2. En el periódico no se cumple.» (85,3)
  - ¿Por qué? (plegado): «Al vender, nadie anota lo que costó la mercancía que salió. Por eso Inventario de mercancías no puede estar al día, y se queda quieta hasta el cierre.» (79,4)
- *error · Gastos de administración y ventas:* «Esta mercancía no es un gasto. Se compró para volver a venderla.» (86,6)
- *acierto:* «Así es: va al debe de Compras. Inventario de mercancías no se toca.» (90,1) Figura: «16 de abril · Compras · Debe · $5.000.000».
  - ¿Por qué? (plegado): «Como la compra no va al debe de su cuenta de activo, el libro dice que este registro se aparta de la norma. La otra parte del asiento la armas en «La factura completa».» (85,4)

**P2 · `pregunta-conteo`** (pregunta) · figura: F5 (c · ec · en · a)
- «Llega el último día del periodo. La Reventa mira la bodega y anota lo que quedó.» (82,0)
- «¿Qué cuenta se pone al día con ese conteo?» (no aplica)
- Opciones o líneas: «Inventario de mercancías» · «Compras» · «Ninguna: el conteo no se registra»
- *pista (1.er error):* «El conteo dice cuánto vale lo que quedó en la bodega. Piensa en qué cuenta estuvo quieta todo el periodo.» (84,7)
- *error · Compras:* «Compras recoge lo que se compró en el periodo, no lo que quedó.» (98,0)
- *error · Ninguna:* «Sí se registra. Sin el conteo, la cuenta seguiría con el valor del inicio.» (88,6)
- *acierto:* «Exacto: el conteo pone al día Inventario de mercancías. Esa es la cifra del estado de situación financiera.» (62,9)
  - ¿Por qué? (plegado): «Cómo se le pone precio a lo que quedó lo verás en «Tres formas de ponerle precio a lo que quedó».» (93,9)

**P3 · `resumen`** (resumen) · figura: F6
- «En el periódico, las compras van a Compras.» (no aplica)
- «Inventario de mercancías se queda quieta durante el periodo.» (no aplica)
- «Al cierre, el conteo la pone al día.» (no aplica)
- «Siguiente: la factura completa de esta compra.» (no aplica)

## t7-1-a3-tres-formas · «Tres formas de ponerle precio a lo que quedó»

**Medida.** Antes: 11 pantallas; Misa midió 47 en la primera y 272 en la más cargada. Ahora: 10 pantallas, 7 con acción. Ninguna pasa de 40 palabras antes de tocar ni de 60 visibles. Todos los textos de 10 palabras o más dan 65 o más en INFLESZ; el mínimo es 71,6.

| # | Pantalla | Antes de tocar | Máx. visible | Estado más largo |
| --- | --- | --- | --- | --- |
| P0 | `portada` (portada) | 22 | 22 | — |
| P1 | `el-problema` (lectura) | 36 | 36 | — |
| P2 | `peps` (eleccion) | 26 | 55 | pista (1.er error) |
| P3 | `ueps` (eleccion) | 30 | 59 | pista (1.er error) |
| P4 | `promedio-ponderado` (eleccion) | 31 | 53 | pista (1.er error) |
| P5 | `lado-a-lado` (eleccion) | 32 | 59 | pista (1.er error) |
| P6 | `la-recomendacion` (eleccion) | 34 | 58 | pista (1.er error) |
| P7 | `a-favor-y-en-contra` (tarjetas) | 22 | 48 | abierta · PEPS |
| P8 | `la-refutacion` (eleccion) | 19 | 57 | pista (1.er error) |
| P9 | `resumen` (lectura) | 40 | 40 | — |

**P0 · `portada`** (portada)
- «Vas a ponerle precio a lo que quedó en la bodega de tres formas, y a ver por qué dan cifras distintas.» (94,2)

**P1 · `el-problema`** (lectura) · figura: nueva: la pila de 10 a $20.000 y 30 a $25.000; salen 35, quedan 5
- «Inicio: 10 unidades a $20.000» (no aplica)
- «Compras: 30 unidades a $25.000» (no aplica)
- «Mira lo que tenía un negocio. Vendió 35 y le quedan 5.» (81,4)
- «El conteo no dice qué precio tienen. El libro da tres métodos para ponérselo.» (84,1)

**P2 · `peps`** (eleccion)
- «Método PEPS» (no aplica)
- «PEPS: primeras en entrar, primeras en salir. Lo primero que se compró es lo primero que se vende.» (94,0)
- «¿De qué grupo son las 5?» (no aplica)
- Opciones o líneas: «De las compradas, a $25.000» · «De las del inicio, a $20.000» · «De los dos, con un costo promedio»
- *pista (1.er error):* «Con PEPS salen primero las primeras que entraron. ¿Cuáles se quedan?» (88,1)
- *error · del inicio:* «Las del inicio fueron las primeras en entrar: salieron primero.» (72,2)
- *error · promedio:* «Eso es el promedio ponderado. PEPS no mezcla.» (no aplica)
- *acierto:* «Así es.» (no aplica) Figura: «Inventario final = 5 × $25.000 = $125.000».

**P3 · `ueps`** (eleccion)
- «Método UEPS (no válido bajo NIIF)» (no aplica)
- «UEPS: últimas en entrar, primeras en salir. Lo último que se compró es lo primero que se vende.» (94,0)
- «¿De qué grupo son las 5?» (no aplica)
- Opciones o líneas: «De las del inicio, a $20.000» · «De las compradas, a $25.000» · «De los dos, con un costo promedio»
- *pista (1.er error):* «Con UEPS salen primero las últimas que entraron. ¿Cuáles se quedan?» (88,1)
- *error · compradas:* «Las compradas fueron las últimas en entrar: salieron primero.» (no aplica)
- *error · promedio:* «Eso es el promedio ponderado. UEPS no mezcla.» (no aplica)
- *acierto:* «Así es.» (no aplica) Figura: «Inventario final = 5 × $20.000 = $100.000».

**P4 · `promedio-ponderado`** (eleccion)
- «Promedio ponderado» (no aplica)
- «Este método no elige un grupo. Junta las 40 unidades, que costaron $950.000, y le da a cada una el mismo costo.» (76,9)
- «¿Cuál es el costo de cada unidad?» (no aplica)
- Opciones o líneas: «$23.750» · «$22.500» · «$25.000»
- *pista (1.er error):* «No es el punto medio entre los dos precios. Cada precio pesa según las unidades compradas a ese precio.» (85,9)
- *error · $22.500:* «Ese es el punto medio entre $20.000 y $25.000. Pero hay más unidades a $25.000 que a $20.000.» (80,2)
- *error · $25.000:* «Ese es el precio de la última compra. El promedio junta las 40 unidades.» (79,7)
- *acierto:* «Así es: $950.000 ÷ 40 = $23.750.» (no aplica) Figura: «Inventario final = 5 × $23.750 = $118.750».

**P5 · `lado-a-lado`** (eleccion) · figura: tabla de 3 filas: método · quedan · valen
- «Método · Quedan · Valen» (no aplica)
- «PEPS · 5 de las compradas · $125.000» (no aplica)
- «UEPS (no válido bajo NIIF) · 5 del inicio · $100.000» (73,2)
- «Promedio ponderado · 5 mezcladas · $118.750» (no aplica)
- «¿Por qué PEPS da el valor más alto aquí?» (no aplica)
- Opciones o líneas: «Son de la compra más cara.» · «PEPS siempre da más.» · «Con PEPS quedan más.»
- *pista (1.er error):* «¿De qué compra son las 5 que quedan con PEPS, y cuánto costó?» (102,8)
- *error · siempre:* «No siempre: aquí el precio subió de $20.000 a $25.000.» (78,5)
- *error · más unidades:* «Con los tres quedan las mismas 5 unidades.» (no aplica)
- *acierto:* «Exacto: son las mismas 5 unidades, con otro precio.» (no aplica)

**P6 · `la-recomendacion`** (eleccion)
- «Lo que queda y lo vendido se reparten el mismo costo: $950.000. Si lo que queda vale menos, lo vendido vale más.» (91,1)
- «Cuando los precios suben, ¿con qué método lo vendido queda más caro?» (85,8)
- Opciones o líneas: «PEPS» · «UEPS (no válido bajo NIIF)» · «Promedio ponderado»
- *pista (1.er error):* «Mira la tabla anterior: ¿con qué método lo que queda vale menos? Ese costo no desaparece.» (78,1)
- *error · PEPS:* «Con PEPS, lo que queda se lleva los precios altos, y lo vendido, los bajos.» (100,5)
- *error · promedio:* «El promedio queda en medio: ni el más caro ni el más barato.» (98,0)
- *acierto:* «Así es. Más costo de lo vendido deja menos utilidad, y menos impuesto de renta.» (83,0)
  - ¿Por qué? (plegado): «El impuesto de renta es el que se calcula sobre la utilidad. Por eso el libro recomienda UEPS en épocas de inflación, cuando los precios suben, y PEPS en épocas de deflación, cuando bajan.» (78,1)

**P7 · `a-favor-y-en-contra`** (tarjetas) · figura: tres tarjetas cerradas; se abre una a la vez
- «Toca cada método para ver qué dice el libro a favor y en contra.» (90,5)
- «PEPS» (no aplica)
- «UEPS (no válido bajo NIIF)» (no aplica)
- «Promedio ponderado» (no aplica)
- *abierta · PEPS:* «A favor Lo que queda lleva los costos más recientes. En contra Si los precios suben, la utilidad sale mayor, y el libro la llama ficticia.» (88,4)
- *abierta · UEPS:* «A favor Si los precios suben, lo vendido sale más caro y el impuesto de renta baja. En contra Lo que queda lleva costos antiguos.» (89,7)
- *abierta · promedio:* «A favor Si los precios no cambian de golpe, limita las distorsiones. En contra Lo que queda guarda parte de los costos antiguos.» (89,7)

**P8 · `la-refutacion`** (eleccion)
- «Alguien dice: «UEPS no tiene sentido: la tienda vende primero lo que llegó primero». ¿Qué le responde el libro?» (85,9)
- Opciones o líneas: «Que UEPS sigue el orden de los costos.» · «Que la tienda debe vender lo último primero.» · «Que tiene razón.»
- *pista (1.er error):* «Piensa si estos métodos dicen cómo sale la mercancía de la bodega o solo cómo se le pone precio.» (73,1)
- *error · vender lo último:* «El libro dice lo contrario: el método no tiene que seguir el manejo de la mercancía.» (77,9)
- *error · tiene razón:* «El libro reconoce que muchos lo creen, y aun así defiende el método.» (78,8)
- *acierto:* «Exacto: el método no tiene que seguir el orden de las cajas.» (91,0)

**P9 · `resumen`** (lectura) · figura: la tabla de P5, sin la pregunta
- «Las mismas 5 unidades, con tres precios distintos.» (no aplica)
- «PEPS deja lo más reciente y UEPS, lo más antiguo. El promedio queda en medio.» (99,7)
- «El libro recomienda UEPS cuando los precios suben y PEPS cuando bajan.» (85,8)
- «Siguiente: «El cierre en periódico».» (no aplica)

## t7-1-a4-el-cierre-en-periodico · «El cierre en periódico»

**Medida.** Antes: 4 pantallas antes de decidir; Misa midió 54 en la primera y 145 en la más cargada, sin poder pasar de la P4. Ahora: 8 pantallas, 5 con acción. Ninguna pasa de 40 palabras antes de tocar ni de 60 visibles. Todos los textos de 10 palabras o más dan 65 o más en INFLESZ; el mínimo es 72,2.

| # | Pantalla | Antes de tocar | Máx. visible | Estado más largo |
| --- | --- | --- | --- | --- |
| P0 | `portada` (portada) | 18 | 18 | — |
| P1 | `la-apuesta` (prediccion) | 34 | 51 | después de elegir (sin calificar) |
| P2 | `los-datos-de-san-calixto` (lectura) | 36 | 36 | — |
| P3 | `el-cierre` (lados) | 26 | 57 | pista · quitar (1.er error) |
| P4 | `el-costo-de-lo-vendido` (eleccion) | 18 | 40 | error · $17.460.000 |
| P5 | `las-utilidades` (tocar-filas) | 35 | 55 | abierta · antes de impuestos |
| P6 | `lado-a-lado` (eleccion) | 34 | 59 | pista (1.er error) |
| P7 | `resumen` (lectura) | 36 | 36 | — |

**P0 · `portada`** (portada)
- «Vas a cerrar el mes de San Calixto y a ver por qué el método cambia la utilidad.» (95,4)

**P1 · `la-apuesta`** (prediccion) · figura: tabla de 3 filas: método · valor de las 1.100
- «A San Calixto le quedaron 1.100 unidades en febrero. Su valor cambia con el método:» (74,7)
- «PEPS $1.518.000» (no aplica)
- «UEPS (no válido bajo NIIF) $1.430.000» (no aplica)
- «Promedio ponderado $1.463.846» (no aplica)
- «¿Con qué método crees que sale más utilidad?» (no aplica)
- Opciones o líneas: «PEPS» · «UEPS» · «Promedio ponderado» · «Igual con los tres»
- *después de elegir (sin calificar):* «Guardamos tu apuesta. La compruebas al final del cierre.» (no aplica)

**P2 · `los-datos-de-san-calixto`** (lectura) · figura: ficha de totales; las 10 operaciones, plegadas
- «Estos son los totales de febrero.» (no aplica)
- «Inventario inicial: 5.200 unidades, $6.760.000» (no aplica)
- «Compras: 13.000 unidades, $17.460.000» (no aplica)
- «Ventas: 17.100 unidades, $45.793.000» (no aplica)
- «Gastos de administración y ventas: $12.000.000» (no aplica)
- «Quedan, según el conteo: 1.100 unidades» (no aplica)
- «Ver las operaciones del mes» (no aplica)

**P3 · `el-cierre`** (lados)
- «Inventario de mercancías se quedó todo el mes con el valor del inicio. Al cierre se pone al día.» (89,1)
- «Toca Debe o Haber en cada línea.» (no aplica)
- Opciones o líneas: «Inventario de mercancías» · «Quitar el inventario inicial · $6.760.000» · «Colocar el inventario final · $1.463.846» · «Ver los otros asientos del cierre»
- *pista · quitar (1.er error):* «Ese valor sale de la cuenta. ¿De qué lado baja un activo?» (97,0)
- *error · quitar:* «Quitar ese valor hace que el activo baje: va al haber.» (88,2)
  - ¿Por qué? (plegado): «La otra parte va al debe de Ganancias y pérdidas.» (90,9)
- *error · colocar:* «Colocar ese valor hace que el activo suba: va al debe.» (82,6)
  - ¿Por qué? (plegado): «La otra parte va al haber de Ganancias y pérdidas.» (90,9)
- *acierto:* «Así es: ahora la cuenta tiene el valor del conteo.» (84,7)
  - ¿Por qué? (plegado): «Esa es la cifra del estado de situación financiera. El libro hace este cierre con el promedio ponderado.» (73,2)

**P4 · `el-costo-de-lo-vendido`** (eleccion)
- «Inventario inicial + compras = $24.220.000» (no aplica)
- «Quedaron $1.463.846, con el promedio ponderado.» (no aplica)
- «¿Cuál fue el costo de la mercancía vendida?» (no aplica)
- Opciones o líneas: «$22.756.154» · «$24.220.000» · «$17.460.000»
- *pista (1.er error):* «Lo vendido no es todo lo que la empresa tuvo para vender. Falta quitar algo.» (91,3)
- *error · $24.220.000:* «Eso es todo lo que hubo para vender. Falta quitar lo que quedó.» (99,7)
- *error · $17.460.000:* «Eso es solo lo comprado en el mes. Falta lo que había al inicio, y quitar lo que quedó.» (99,0)
- *acierto:* «Así es: $24.220.000 − $1.463.846 = $22.756.154. En el periódico, este costo se halla al cierre, no venta por venta.» (80,2)

**P5 · `las-utilidades`** (tocar-filas) · figura: estado de resultados de 6 filas; cada utilidad se abre al tocarla
- «Toca cada utilidad para ver qué es.» (no aplica)
- «Ingresos por ventas $45.793.000» (no aplica)
- «− Costo de mercancía vendida $22.756.154» (no aplica)
- «= Utilidad bruta en ventas $23.036.846» (no aplica)
- «− Gastos de administración y ventas $12.000.000» (no aplica)
- «= Utilidad operacional $11.036.846» (no aplica)
- «= Utilidad antes de impuestos $11.036.846» (no aplica)
- *abierta · bruta:* «Lo que queda de las ventas cuando se les resta el costo de la mercancía vendida.» (89,6)
- *abierta · operacional:* «Lo que queda de la utilidad bruta cuando se le restan los gastos de administración y ventas.» (79,9)
- *abierta · antes de impuestos:* «Todavía no tiene restado el impuesto de renta. Aquí no hay otros ingresos ni gastos: es igual a la operacional.» (72,2)

**P6 · `lado-a-lado`** (eleccion) · figura: tabla de 3 filas por 3 métodos; la columna de la apuesta va marcada con borde, sin texto
- «PEPS · UEPS (no válido bajo NIIF) · Promedio» (no aplica)
- «Inventario final 1.518.000 1.430.000 1.463.846» (no aplica)
- «Costo de mercancía vendida 22.702.000 22.790.000 22.756.154» (no aplica)
- «Utilidad antes de impuestos 11.091.000 11.003.000 11.036.846» (no aplica)
- «¿Y el costo y la utilidad de PEPS?» (no aplica)
- Opciones o líneas: «Costo menor, utilidad mayor» · «Costo mayor, utilidad mayor» · «Iguales en los tres»
- *pista (1.er error):* «Si queda más en la bodega, ¿lo vendido lleva más o menos costo?» (93,2)
- *error · costo mayor:* «Si se resta más inventario final, el costo baja.» (no aplica)
- *error · iguales:* «Ventas, compras y gastos sí son iguales. El inventario final no.» (88,1)
- *acierto:* «Así es: más inventario final, menos costo y más utilidad.» (72,2)
  - ¿Por qué? (plegado): «Ventas, compras y gastos son iguales con los tres métodos. Lo único que cambia es el inventario final. ¿Coincide con tu apuesta?» (86,2)

**P7 · `resumen`** (lectura) · figura: la cuenta en una línea: inicio + compras − final = costo de lo vendido
- «Inicio + compras − final = costo de lo vendido» (75,2)
- «Al cierre, el inventario inicial sale por el haber y el final entra por el debe.» (85,7)
- «Más inventario final da menos costo y más utilidad.» (no aplica)
- «Siguiente: «Importados y fletes».» (no aplica)
