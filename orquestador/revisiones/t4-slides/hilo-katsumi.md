# T4 · Hilo lógico de A0-A5 como presentación (Katsumi, 23 oct 2026)

Fuente: chat de Katsumi (claude.ai/chat/a544b14e-bd46-4e97-b22a-5decfeda0c99). Base: commit 43ecd43; los seis archivos de datos son idénticos a los de 35f9b72. Medido con `npm run inflesz` (las seis frases de control dan bien).
Se juzga con la Vara 2 de `orquestador/revisiones/panel-docente/aceptacion.md`. El patrón visual es el de Ukyo (#470); el componente compartido de secuencia es de Erwin.

Con la Vara 2 como está, A0 a A4 fallaban en automático porque ninguna tenía una decisión en la pantalla 1 (solo A5 la tenía). Por eso no se repartió texto en más pantallas: se reconstruyó. Cada pantalla 1 lleva ahora una decisión de predicción que comprueba la figura existente. El texto aprobado se mueve pero no cambia. Lo marcado **NUEVO** es texto de Katsumi, sin copia del libro. En las pantallas con acción pero sin pregunta (pista, pagar, contar), el «acierto» es completar la acción, y «Seguir» sale solo después.

## A0 · El activo corriente (6 pantallas)

| n | La idea | Acción o lectura | Texto en pantalla (palabras · INFLESZ) | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Corriente es volverse plata antes de un año | Acción · **decisión** | Objetivo + **NUEVO** «¿Qué se vuelve plata antes de un año? Marca cada fila.» / con el acierto: «Un activo es corriente si se vuelve plata antes de un año.» (29 · 85,7) | El juego de «cual-cruza» (mercancía, deuda, edificio), ahora en primer lugar; «Pasar el año» comprueba. Absorbe a «la-prueba» | p. 178 |
| 2 | El efectivo ya es plata | Acción | El libro empieza por el efectivo, en caja y en bancos. Pasa el año. / Nada cambia: ya era plata. Por eso va primero. (23 · 92,7) | Pista: caja y bancos | pp. 178-179 |
| 3 | Hay otros tres corrientes | Acción | El libro nombra otros tres. ¿Se vuelven plata antes de la raya? (12 · 102,2) | Pista: inversiones, cartera, inventarios | p. 178 |
| 4 | Los fijos no se vuelven plata | Acción | El libro nombra los activos fijos… / Van en el activo no corriente. (23 · 85,4) | Pista: los cuatro fijos cruzan | pp. 178-179 |
| 5 | Lo que se consume también es corriente | Acción · **decisión** | **NUEVO** «¿De qué lado de la raya va el arriendo de seis meses?» / con el acierto: «El Tema 2 añade un caso: también es corriente lo que se consume dentro del año. Pasa el año.» (31 · 94,0) | **NUEVO**: juego de una fila (el arriendo); al pasar el año, «se consumió» | Tema 2 y p. 178 |
| 6 | Para qué sirve separarlos (capa 4) | Lectura | Con lo corriente se pagan deudas. / Corriente: se vuelve plata o se consume antes de un año. Los fijos ayudan a producirla. / Siguiente: «La caja». (25 · 86,0) | Figura quieta en el mes 12 | pp. 178-179 |

Textos NUEVO de devolución y aviso en A0:
- Error de la pantalla 5: «No se vuelve plata, pero ¿qué le pasa dentro del año?» (99,6).
- Aviso de la pantalla 5: «Marca la fila primero.»
- La pantalla 1 conserva sus errores aprobados: «¿Qué se volvió plata?» y «Te deben, sí. ¿Pero cuándo pagan?».

## A1 · La caja (6 pantallas)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Cobrar mete plata por el debe | Acción · **decisión** | Objetivo + «En el Tema 2 la plata ya iba en dos cuentas.» + «Sus Servicios arregla computadores, y hoy los clientes le pagan de contado.» + **NUEVO** «¿Por dónde entra esa plata a Caja?» (37 · 84,8) | El cajón con las glosas de Caja y Bancos (absorbe a «dos-cuentas»). La tarjeta del cobro va a debe, haber o «no se mueve»; el asiento sale con el acierto | p. 179, p. 180 y Tema 2 |
| 2 | Consignar saca la plata de Caja | Acción · **decisión** | Ese día, la plata va al banco. ¿Qué le pasa a Caja? (12 · 107,4) | La consignación va a un destino | p. 180 |
| 3 | Caja tiene dos salidas | Acción | El libro lleva esa plata al banco. Supón que también pudieras pagar con ella. Prueba las dos. (17 · 94,9) | Prueba las dos salidas | p. 180 |
| 4 | La caja también guarda cheques | Acción · **decisión** | Para el libro, la caja también guarda cheques. Manda cada uno a su sitio. (14 · 93,0) | Dos cheques | pp. 179, 180 y 187 |
| 5 | Sin separar funciones se escapa plata | Acción · **decisión** | Andrés cobra y anota. ¿Qué control faltó? (7) | Tres tarjetas | pp. 179-180 · Escenario simulado |
| 6 | Cada control tapa una fuga (capa 4) | Acción | Toca cada control… / Cada control tapa una fuga distinta. / Siguiente: «El fondo fijo». (18 · 76,2) | Siete controles | pp. 179-180 |

Textos NUEVO de devolución en A1 (pantalla 1):
- Error «haber»: se reúsa el aprobado de los cheques, «Aquí la empresa recibe, no paga.».
- Error «no se mueve»: «Le pagan de contado: esa plata no pasó por el banco.» (93,9).

## A2 · El fondo fijo (7 pantallas)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Pagar no cambia la suma del fondo | Acción · **decisión** | Objetivo + **NUEVO** «Pagas un gasto con el fondo. ¿Qué pasa con la suma de billetes y soportes?» / con el acierto: «Paga y repón» + «Fondo fijo para gastos pequeños: al reponerlo, vuelve a su cifra.» (36 · 85,3) | **NUEVO**: tres opciones, «Sigue igual», «Baja» y «Sube». Luego, el sobre de siempre: «Pagar un gasto» y «Reponer» | p. 181 |
| 2 | El fondo se abre con un cheque de Bancos | Acción | El 1 de mayo, Sus Servicios abre el fondo de Rosa Primorosa con un cheque. Tócalo. (16 · 82,0) | El cheque llena el sobre | pp. 181 y 183 |
| 3 | Cada gasto deja su soporte | Acción | En mayo, Rosa paga con el fondo y guarda cada soporte… (16 · 81,8) | Paga los ocho gastos | p. 184 |
| 4 | Gastado más lo que queda da el fondo | Acción · **decisión** | ¿Cuánto debería quedarle a Rosa en billetes? (7) | Tres cifras | p. 184 |
| 5 | Reponer lo gastado es el reembolso | Acción | Reponer lo gastado es el reembolso… Tócalo. (20 · 78,7) | Cheque de 478.100 | pp. 182 y 184 |
| 6 | El reembolso no mueve Caja menor | Acción · **decisión** | Los gastos de oficina van a Gastos generales. ¿Qué mueve el reembolso? (12 · 76,2) | El libro con cuatro cuentas | pp. 182 y 184 |
| 7 | Solo subir o bajar mueve Caja menor (capa 4) | Acción | Fondo corto: se sube. Plata quieta: se baja. / Reponerlo no mueve Caja menor. / Siguiente: «El arqueo». (16 · 78,2) | Subir o bajar | p. 182 · Cifras construidas |

Textos NUEVO de devolución en A2 (pantalla 1):
- Error «Baja»: «Salen billetes, sí. ¿Qué entra al sobre a cambio?»
- Error «Sube»: «¿Entra plata nueva al sobre cuando pagas un gasto?»

## A3 · El arqueo (8 pantallas)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Soportes más efectivo deben dar el fondo | Acción · **decisión** | Objetivo + **NUEVO** «Toca «Contar la caja». ¿Qué muestra el arqueo?» / con el acierto: «En un arqueo, soportes más efectivo deben dar el fondo.» (25 · 86,0) | «Contar la caja» muestra 21.900. **NUEVO**: las pastillas Falta, Cuadra y Sobra; la aguja sale con el acierto | pp. 182 y 184 |
| 2 | Pasarse es sobrante y quedarse corto es faltante | Acción | Mueve la plata de la caja… (17 · 103,1) | El control mueve la aguja | pp. 183-185 |
| 3 | Leer un sobrante | Acción · **decisión** | En la caja hay $24.000. ¿Qué muestra el arqueo? (9) | Pastillas | p. 185 |
| 4 | El sobrante achica el cheque | Acción · **decisión** | ¿Por cuánto sale el reembolso? (5) | Tres cheques | p. 185 |
| 5 | El sobrante es un ingreso no operacional | Acción · **decisión** | ¿A qué cuenta y a qué lado van los $2.100? (10 · 109,6) | Ficha | pp. 183 y 185 |
| 6 | El faltante agranda el cheque | Acción · **decisión** | Con $15.200 en caja, ¿por cuánto sale? (7) | Tres cheques | pp. 185-186 |
| 7 | Si se le cobra, Rosa queda debiendo | Acción · **decisión** | Es representativo: Sus Servicios le cobra los $6.700 a Rosa. (10 · 66,0) | Ficha | p. 186 |
| 8 | Quién paga lo decide la empresa (capa 4) | Acción | Quién paga los $6.700 lo decide la empresa. / Siguiente: «Bancos y notas del banco». (14 · 84,1) | El interruptor | p. 183 |

Textos NUEVO de devolución en A3 (pantalla 1), calcados de los aprobados de la pantalla 3:
- Error «falta»: «Para faltar, la suma tendría que quedar bajo $500.000.»
- Error «sobra»: «Para sobrar, la suma tendría que pasar de $500.000.»

## A4 · Bancos y notas del banco (5 pantallas)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Consignar sube Bancos y girar la baja | Acción · **decisión** | Objetivo + «Toca «Consignar».» / «Bancos es la plata de la empresa en el banco.» / «Girar un cheque es firmarlo para que el banco pague con esa plata.» + **NUEVO** «¿Sube o baja Bancos?» (36 · 90,6) | Consignar (876.000) sube por el debe. **NUEVO**: el cheque de 398.200 va a «Sube» o «Baja» antes de bajar. Sale el rótulo «Prueba las dos» (acorte) | pp. 186-187 |
| 2 | Las notas del banco restan o suman | Acción | Con una nota débito, el banco le resta a la cuenta… (19 · 79,6) | Llega el extracto | pp. 187-188 |
| 3 | Cada movimiento sube o baja Bancos | Acción · **decisión** | ¿Sube o baja Bancos con cada uno? (7) | Siete tarjetas | pp. 186-187 |
| 4 | Cada libreta anota a su tiempo | Acción · **decisión** | Lleva cada causa a quien ya la anotó. (8) | Seis causas | p. 188 |
| 5 | Conciliar es ver qué le falta a cada una (capa 4) | Acción · **decisión** | ¿Qué ignora la empresa? / Cada libreta anota… Conciliar es ver qué falta. / Siguiente: «San Calixto». (22 · 79,6) | Toca el renglón | pp. 187-190 |

Texto NUEVO de devolución en A4 (pantalla 1):
- Error «Sube»: «¿El banco le pone plata a la cuenta o se la saca?» (106,6).

## A5 · San Calixto (6 pantallas, sin cambios)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Ningún saldo es el verdadero todavía | Acción · **decisión** | Objetivo + San Calixto, 31 de marzo. ¿Cuál es el saldo verdadero? (17 · 83,9) | El par y tres opciones | p. 189 |
| 2 | Al banco le falta lo que la empresa anotó | Acción · **decisión** | Primero, el lado del banco… (16 · 81,8) | Cinco partidas a Más o Menos | pp. 189-190 |
| 3 | A la empresa le faltan las notas | Acción · **decisión** | Ahora el lado de la empresa… (16 · 81,8) | Cinco notas; sale el «=» | pp. 189-190 |
| 4 | Solo se asienta lo que le falta a la empresa | Acción · **decisión** | Lo que importa es dejar Bancos en su valor verdadero… ¿Y este cheque? (21 · 86,6) | Se asienta / No se asienta | p. 190 |
| 5 | Cada nota mueve Bancos a un lado | Acción · **decisión** | Cada nota mueve Bancos. ¿Al debe o al haber? (9) | Una nota a la vez | p. 191 |
| 6 | Los dos lados llegan al mismo saldo (capa 4) | Acción | Pasa las notas al mayor. / Los dos lados llegan… (20 · 87,8) | «Asentar las cinco notas» | p. 191 |

## Para Baki y Hanayama

- **Líneas a 320 px:** es una estimación de unos 36 caracteres por línea. Las pantallas con más texto son la 1 de A1, A2 y A4, con unos 200 caracteres (unas 6 líneas). Hay que confirmarlo en captura.
- **Pantallas fusionadas:** «la-prueba» (A0) y «dos-cuentas» (A1) dejan de ser pantallas aparte. Sus textos pasan intactos a la pantalla 1, y los ids `t4-` no cambian. **Parada a confirmar por Baki:** que el progreso no guarde el índice de pantalla. Si lo guarda, mover pantallas cambia el punto donde retoma el estudiante, y eso sería parada.
- **Variante B (D8):** las pantallas 1 nuevas aplican igual al caso B, con sus cifras: 600.000 para A2 y 75.700 para A3.
- **Término:** la fila del arriendo dice «por adelantado» y el vocabulario fijado es «por anticipado». Se cambia porque es un sinónimo y no cambia el sentido.

## Resumen por Aprender

| Aprender | Pantallas | % con acción | Decisión en la pantalla 1 | Decisiones distintas | CAMBIA SENTIDO |
|---|---|---|---|---|---|
| A0 | 6 | 83 % | Sí | 2 | ninguna |
| A1 | 6 | 100 % | Sí | 2 | ninguna |
| A2 | 7 | 100 % | Sí | 3 | ninguna |
| A3 | 8 | 100 % | Sí | 3 | ninguna |
| A4 | 5 | 100 % | Sí | 3 | ninguna |
| A5 | 6 | 100 % | Sí | 4 | ninguna |

Ninguna pieza tiene dos pantallas de lectura seguidas. Todo texto de 10 palabras o más mide 65 o más, y la copia contra el libro da 0.

## Preauditoría en papel de Shibukawa (23 oct)

Vara para «acción sin decisión»: es acción real si el estudiante elige entre dos o más opciones, o si mueve un modelo cuyo resultado depende de lo que hace. Un toque con un solo resultado posible (una pista, «Tócalo», «Pasa el año», tocar para revelar) es **lectura con botón**, y para A3 cuenta como lectura.

- **A0 · FALLA:** p2, p3 y p4 son tres lecturas con botón seguidas. La acción real llega solo al 33 % y hay una sola decisión distinta, porque p5 repite la de p1 sobre otro caso. Además p3 y p4 sobran. Corrección: fundir p2 a p4 en una pantalla con una decisión distinta (p. ej., ordenar los corrientes de más a menos cerca de la plata, con el efectivo primero, p. 178). → Katsumi.
- **A1 · PASA en papel** (3 decisiones distintas, 83 % de acción). En captura: la salida «pagar» de p3 tiene que mostrar por qué el libro no paga con la caja.
- **A2 · FALLA:** p2 y p3 son lecturas seguidas y la acción real llega al 57 %. Corrección literal en p2: «El 1 de mayo, Sus Servicios abre el fondo de Rosa Primorosa con un cheque. ¿De qué cuenta sale?», con las fichas Bancos, Caja y Caja menor. Si mide 65 o más, pasa sin volver a revisión.
- **A3 · PASA en papel** (3 decisiones distintas; las cifras cuadran).
- **A4 · PASA en papel** (2 decisiones distintas, no 3; 80 % de acción).
- **A5 · PASA en papel** (4 decisiones distintas).
- **Transversal:**
  - A1 y A10 deben medirse con el texto literal en las pantallas con «…».
  - La mecánica «¿por qué lado se mueve la cuenta?» ya va en su 4.º uso o más (A1 p1-p2, A4 p1 y p3, A5 p5): Katsumi tiene que justificarla.
  - A2 p7 debe decir en pantalla «Basado en el libro, p. 182».
  - La parada de Baki sobre el índice de progreso tiene que cerrarse con evidencia antes de fusionar A0 y A1.

## Lote 2 de Katsumi (23 oct): correcciones tras la preauditoría. SUSTITUYE las tablas de A0, A2 p2 y A4 p1 de arriba

### A0 · El activo corriente (4 pantallas; antes eran 6)

| n | La idea | Acción o lectura | Texto en pantalla (palabras · INFLESZ) | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Corriente es volverse plata antes de un año; lo fijo no | **Decisión** | Objetivo + **NUEVO** «¿Qué se vuelve plata antes de un año? Marca cada fila.» / con el acierto: «Un activo es corriente si se vuelve plata antes de un año.» + «Los fijos, como el edificio, se usan por años para trabajar: van en el activo no corriente.» (46 · 83,9) | Juego de «cual-cruza» con mercancía, deuda y edificio. Absorbe la antigua p4, cuyo texto se acorta sin cambiar lo que dice | pp. 177-179 |
| 2 | Entre los corrientes, el efectivo va primero porque ya es plata | **Decisión** | **NUEVO** «Cuatro activos corrientes. ¿Cuál está más cerca de ser plata?» / con el acierto: «El libro empieza por el efectivo, en caja y en bancos: ya era plata. Por eso va primero.» (28 · 90,8) | **NUEVO**: cuatro filas, se toca una (Efectivo en caja y bancos, Inversiones a corto plazo, Cartera, Inventarios). Con el acierto, el año pasa solo y las otras tres se vuelven plata. Funde las antiguas p2 y p3 | p. 178 |
| 3 | Lo prepagado es corriente porque se consume, no porque se vuelva plata | **Decisión** | **NUEVO** «Arriendo pagado por anticipado, seis meses. ¿Qué le pasa antes de la raya?» / con el acierto: «El Tema 2 añade un caso: también es corriente lo que se consume dentro del año.» (29 · 81,2) | **NUEVO**: tres opciones (Se vuelve plata, Se consume, Sigue igual); al pasar el año, la fila muestra «se consumió» | Tema 2 y p. 178 |
| 4 | Para qué sirve separarlos (capa 4) | Lectura | Con lo corriente se pagan deudas. / Corriente: se vuelve plata o se consume antes de un año. Los fijos ayudan a producirla. / Siguiente: «La caja». (25 · 86,0) | Figura quieta en el mes 12 | pp. 178-179 |

Devoluciones NUEVO de A0:
- p2 · Inversiones: «Una inversión todavía hay que venderla para tener la plata.» (66,0)
- p2 · Cartera: «La cartera es plata que todavía te deben los clientes.» (84,7)
- p2 · Inventarios: «La mercancía primero se vende y después se cobra.»
- p3 · Se vuelve plata: «Nadie te devuelve ese arriendo: lo vas usando mes a mes.» (88,2)
- p3 · Sigue igual: «Cada mes que pasa, ya usaste una parte de ese arriendo.» (82,6)

No se pide ordenar los cuatro corrientes. Que la p. 178 los ordene por cercanía a la plata no está verificado, y los meses de la figura son supuestos; la decisión solo pide cuál va primero, que sí está en el libro.

### A2 p2

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 2 | El fondo se abre con plata de Bancos | **Decisión** | «El 1 de mayo, Sus Servicios abre el fondo de Rosa Primorosa con un cheque. ¿De qué cuenta sale?» (19 · 89,1) | Fichas Bancos, Caja y Caja menor; con el acierto, el cheque llena el sobre | pp. 181 y 183 |

Devoluciones: acierto, «Bancos baja y Caja menor sube: el fondo queda abierto.» (89,7) · error Caja, «¿Quién paga un cheque: la caja o el banco?» · error Caja menor, «Caja menor es adonde llega la plata. ¿De dónde sale?» (78,5). A2 queda con 71 % de acción real; p3 y p5 son lecturas con botón y no quedan seguidas.

### A4 p1 (pasa a otra mecánica: el cálculo del saldo)

| n | La idea | Acción o lectura | Texto en pantalla | Qué ve o toca | Fuente |
|---|---|---|---|---|---|
| 1 | Bancos sube con lo que se consigna y baja con lo que se gira | **Decisión** | Objetivo + «Bancos es la plata de la empresa en el banco.» + «Girar un cheque es firmarlo para que el banco pague con esa plata.» + **NUEVO** «Bancos arranca en cero. Consignas $876.000 y giras un cheque de $398.200. ¿Cuánto queda?» (44 · 87,6) | **NUEVO**: tres saldos (477.800, 1.274.200 y 398.200). Con el acierto, la cuenta anima el debe 876.000, el haber 398.200 y el saldo | Basado en el libro, pp. 186-187 (el «arranca en cero» es construcción y lo dice el texto) |

Devoluciones: error 1.274.200, «Sumaste el cheque, pero con él la plata sale de la cuenta.» (96,2) · error 398.200, «Ese es el cheque. ¿Cuánto queda de lo consignado?». Con este cambio, la mecánica «¿por qué lado se mueve la cuenta?» queda en tres usos.

### Texto literal de las pantallas que llevaban «…»

| Pantalla | Texto | Palabras · INFLESZ |
|---|---|---|
| A1 p6 | Toca cada control: se enciende lo que vigila. / Cada control tapa una fuga distinta. / Siguiente: «El fondo fijo». | 18 · 76,2 |
| A2 p3 | En mayo, Rosa paga con el fondo y guarda cada soporte: la factura o el recibo. | 16 · 81,8 |
| A2 p5 | Reponer lo gastado es el reembolso. El 31 de mayo, Rosa entrega los soportes y le hacen un cheque. Tócalo. | 20 · 78,7 |
| A3 p2 | Mueve la plata de la caja. Si la suma pasa del fondo, sobra; si no llega, falta. | 17 · 103,1 |
| A4 p2 | Con una nota débito, el banco le resta a la cuenta; con una nota crédito, le abona: le suma. | 19 · 79,6 |
| A4 p5 | ¿Qué ignora la empresa? / Cada libreta anota lo que la otra todavía no sabe. Conciliar es ver qué falta. / Siguiente: «San Calixto». | 22 · 79,6 |
| A5 p2 | Primero, el lado del banco: lo que la empresa ya anotó y el banco todavía no. | 16 · 81,8 |
| A5 p3 | Ahora el lado de la empresa: las notas del banco que sus libros todavía no tienen. | 16 · 81,8 |
| A5 p4 | Lo que importa es dejar Bancos en su valor verdadero: la empresa solo asienta lo que le falta. ¿Y este cheque? | 21 · 86,6 |
| A5 p6 | Pasa las notas al mayor. / Los dos lados llegan al mismo saldo conciliado; solo se asientan las notas del banco. | 20 · 87,8 |

Resumen: A0 queda en 4 pantallas, 3 decisiones distintas y 75 % de acción real. A2 queda en 7 pantallas, 4 decisiones y 71 %. A4 queda en 5 pantallas, 3 decisiones y 80 %. No hay lecturas seguidas ni nada que CAMBIE SENTIDO.

## Respuestas de Ukyo para los slides de T4 (#470, §16)
- Reserva de figura por pieza, con tope de 220 px a 320 y de 319 a 375; el apoyo va debajo y puede desbordar hasta 40 px.
- El objetivo D2 es el titular de la pantalla 1. El pie «Basado en el libro, pp. …» aparece una sola vez, en el Cierre.
- Una pantalla de un solo control es Haz si exige una respuesta válida y Míralo si solo explora. Todas cuentan para B3.
- La clave de persistencia es `tema/pieza/caso`.
- En la célula se adopta C2: al segundo error se muestra lo correcto y se libera «Siguiente».

## Lote 4 de Katsumi (24 oct): el «porqué» del segundo error (C2), la razón de «Pagar» y el Cierre de A4

Las cifras son las del caso 1. En el caso B se cambian por las suyas con las mismas plantillas, y «Rosa» pasa a ser la persona del caso B. En los juegos de varias tarjetas (A0 p1, A1 p4, A4 p3 y p4, A5 p2, p3 y p5), el porqué sale para la tarjeta que falló dos veces, y esa tarjeta pasa sola a su lugar. Por eso cada texto enuncia la regla general.

| Pieza | Pantalla | Porqué del segundo error | Palabras · INFLESZ |
|---|---|---|---|
| A0 | p1 | Corriente es lo que se vuelve plata antes de la raya. Lo que tarda años en pagarse, o dura años, cruza. | 21 · 95,5 |
| A0 | p2 | El efectivo, en caja y en bancos, ya es plata. Los otros tres todavía tienen que venderse o cobrarse. | 19 · 85,9 |
| A0 | p3 | Se consume. El arriendo no vuelve como plata: la empresa lo va usando mes a mes, y en seis meses se acaba. | 22 · 93,9 |
| A1 | p1 | Va al debe de Caja. Cobrar de contado mete plata en la caja, y lo que entra a Caja va por el debe. | 23 · 103,2 |
| A1 | p2 | Va al haber de Caja. Consignar saca la plata de la caja y la lleva al banco: Caja baja y Bancos sube. | 22 · 96,7 |
| A1 | p4 | El cheque que le dan entra a la caja, por el debe. El cheque propio lo paga el banco: Caja no se mueve. | 23 · 105,9 |
| A1 | p5 | Separar funciones. Si quien cobra también anota, puede quedarse plata sin anotarla, y al contar, caja y libro cuadran. | 19 · 72,7 |
| A2 | p1 | Sigue igual. Al pagar salen billetes, pero entra un soporte por el mismo valor, y la suma sigue dando el fondo. | 21 · 86,6 |
| A2 | p2 | Sale de Bancos. Un cheque lo paga el banco: la plata llega a Caja menor y el fondo queda abierto. | 20 · 94,0 |
| A2 | p4 | Quedan $21.900: el fondo es de $500.000 y ya salieron $478.100 en gastos. | 13 · 78,8 |
| A2 | p6 | Gastos generales al debe y Bancos al haber: el gasto va al debe y la plata sale del banco. Caja menor no se mueve. | 24 · sin medir (Baki lo mide) |
| A3 | p1 | Cuadra. Soportes por $478.100 más $21.900 en caja dan $500.000, justo el fondo. | 13 · 80,5 |
| A3 | p3 | Sobra. $478.100 más $24.000 dan $502.100: la suma pasa del fondo por $2.100. | 13 · 80,5 |
| A3 | p4 | Sale por $476.000. Los $2.100 que sobran ya están en la caja, así que el cheque repone lo gastado menos eso. | 21 · 86,6 |
| A3 | p5 | Al haber de Ingresos no operacionales – sobrante de caja menor. Es un ingreso, y un ingreso sube por el haber. | 20 · 78,5 |
| A3 | p6 | Sale por $484.800. El cheque repone lo gastado y también los $6.700 que faltan en la caja. | 17 · 88,4 |
| A3 | p7 | Al debe de Cuentas por cobrar – empleados. Rosa le queda debiendo a la empresa, y una cuenta por cobrar sube por el debe. | 23 · 87,0 |
| A4 | p1 | Quedan $477.800. Consignar $876.000 sube Bancos y girar el cheque de $398.200 la baja. | 14 · 75,2 |
| A4 | p3 | Bancos sube con lo que pone plata en la cuenta y baja con lo que la saca. | 17 · 101,9 |
| A4 | p4 | Lo anota primero quien lo hace: la empresa, sus cheques, depósitos y errores; el banco, sus notas y sus errores. | 20 · 71,6 |
| A4 | p5 | Caso 1: La nota débito. El banco ya la cobró, pero la empresa se entera cuando llega el extracto. · Caso B: La nota crédito. El banco ya la abonó, pero la empresa se entera cuando llega el extracto. | 17 · 84,7 / 17 · 81,1 |
| A5 | p1 | Ninguno todavía. Al extracto le falta lo que la empresa anotó, y a los libros, las notas del banco. | 19 · 85,9 |
| A5 | p2 | Los cheques sin cobrar van a Menos, porque el banco aún no los paga. La consignación sin abonar va a Más. | 21 · 98,4 |
| A5 | p3 | Las notas crédito van a Más, porque el banco abonó. Las notas débito van a Menos, porque el banco cobró. | 20 · 90,9 |
| A5 | p4 | No se asienta. La empresa lo anotó al girarlo, y asentarlo otra vez lo dejaría doble en sus libros. | 19 · 79,3 |
| A5 | p5 | Si la plata entró a la cuenta, Bancos va al debe. Si salió, va al haber. | 16 · 109,3 |

**A1 p3, la razón de la salida «Pagar»** (va en la banda): «Pagar también saca plata por el haber. Pero el libro pide consignar cada día lo que se recibe y limita los pagos en efectivo.» (24 · 80,6). Fuente: p. 180 y los controles 2 y 3 de las pp. 179-180, ya incluidos en el paquete aprobado de H2. El texto no dice que esté prohibido pagar con esa plata, porque el libro no lo dice: solo lo limita.

**A4 sigue sin pantalla de Cierre.** La p5 ya cierra con su frase al acertar. Una pantalla extra solo de lectura sobraría (criterio A5 de la Vara 2) y bajaría el porcentaje de acción de la pieza.
