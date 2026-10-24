# LOTE T2-1 · Célula C · Near → L
T2 «Las cuentas, el debe y el haber» (`cuentas-debe-haber`) · 23-oct 10:44 (Bogotá)

> **Nota de L (23-oct, 11:20).** Copia fiel de la entrega de Near. Decisiones de L encima de este archivo, en `c-t2-1-decisiones-l.md`: la forma de las tres Hacer nuevas es la de Watari (`c-t2-1-watari-tres-hacer.html`), con sus ids, y los bancos de N-1, N-2 y N-3 de abajo se rehacen sobre esa forma en el lote T2-2.

**Regla dura cumplida: solo se agrega.**
- Las slides van como datos nuevos, en `src/data/contabilidadAprenderSlides.js` [CONSTRUCCIÓN, para Erwin]. Los objetos actuales de CuatroCapas no se tocan.
- Las Hacer nuevas llevan ids nuevos.
- En `subtemas.js` solo se agregan entradas. Ningún campo `subtema` existente cambia de nombre.

**Medición.**
- INFLESZ con `npm run -s inflesz`; piso 66 para este lote.
- Los textos de menos de 10 palabras están exentos, y lo `textual: true` no se mide ni se reescribe.
- Todas las pantallas tienen 60 palabras o menos. Mínimo del lote: 66,4 (P3·2).

---

## 1 · Hilo de las 5 Aprender como presentación

**Orden y movimientos.**
- El orden queda **A1 → A2 → A5 → A3 → A4**, igual que hoy. A5 ya anuncia que la siguiente es la partida doble, así que no se reordena.
- **Mover · A5 capa 1 → fuera.** Repetía la definición de cuenta, debe, haber, movimientos y saldo, que ya vive en A1.
- **Mover · A5 segmento «saldo» → fuera.** Repetía el 1.500 − 150 = 1.350 de A1.
- **Mover · gastos e ingresos (exploración de A5) → pantalla propia en P3.** Así la idea de que gastos e ingresos mueven el patrimonio llega antes de las dos reglas de P4.
- **Mover · asiento simple y compuesto → última pantalla de P4.** Queda pegado a la igualdad del debe y el haber, que es lo que N-3 practica.

**Cambios de redacción en todas las piezas.**

| campo | viejo | nuevo |
|---|---|---|
| trato | usted | tú |
| A2 «dueños» | dueños | socios |
| A2 alcance | «Todas las cuentas del mundo… dos familias» | «Las cuentas reales… / Las cuentas nominales…» (sin universal) |
| A3 tono | «único mandamiento» | «Primera regla / Segunda regla» |
| A1 movimientos | débito / crédito | movimiento del debe / del haber |
| A5 capa 4 | 4 opciones de largo muy dispar | opciones que difieren en una palabra (ver P3·cierre) |

**Cifras.** Todas salen del repo (DATOS_VERIFICADOS):
- Caja 1.000 + 500 − 150
- Caleja cal-2, cal-3 y cal-6
- cu6-pagare, p. 89
- Lavado ene-02 a ene-12 y ene-03

No hay escenarios simulados.

---

### P1 · `cu-a1-anatomia-de-una-cuenta` · De qué está hecha una cuenta

| # | título | texto | pal. | INFLESZ |
|---|---|---|---|---|
| 1 | ¿De qué lado? | Esta es la cuenta Caja del ejemplo del libro. Entraron $1.000 y $500, y salieron $150. ¿De qué lado pondrías lo que entra? | 23 | 82,7 |
| 2 | Una raya, dos lados | **[textual]** Cuenta: «un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio». + La raya parte la cuenta en dos. Así se ve cada movimiento por separado: lo que suma de un lado y lo que resta del otro. | 26 + textual (≈50) | 95,6 |
| 3 | Debe y haber | El lado izquierdo se llama debe y el derecho, haber. Son nombres de lugar, como izquierda y derecha. No dicen si algo sube o baja. | 25 | 88,9 |
| 4 | Movimientos | Suma cada lado por separado. En Caja, el debe suma $1.500 y el haber, $150. Cada suma es el movimiento de ese lado. | 23 | 80,0 |
| 5 | El saldo | El saldo es la diferencia entre los dos movimientos: $1.350. Va del lado del movimiento mayor. ¿Dónde lo pones? | 19 | 82,5 |
| 6 | Lado no es juicio | Que el saldo quede en el debe no dice si es bueno o malo. Dice de qué lado pesó más la cuenta. Lo que significa depende del tipo de cuenta. | 30 | 99,2 |

**Lo que ve y toca el estudiante, pantalla por pantalla.**
1. VE una T vacía con tres fichas ($1.000, $500, $150) cuando arrastra la primera a un lado, y eso explica que la cuenta tiene dos lugares antes de tener nombres.
2. VE la raya partir la T y las fichas quedar en dos columnas cuando suelta las tres, y eso explica para qué sirve la raya.
3. VE aparecer «debe» y «haber» sobre las columnas cuando toca cada lado, y eso explica que son nombres de lugar.
4. VE el total de cada columna cuando toca «sumar», y eso explica qué es un movimiento.
5. VE el 1.350 flotando cuando lo arrastra al debe (si lo suelta en el haber, la T se inclina y no lo acepta), y eso explica que el saldo va del lado del movimiento mayor.
6. VE la misma T con la etiqueta «Activo» y luego «Pasivo» cuando cambia el tipo, y eso explica que el lado del saldo se lee según la familia, lo que abre P2.

**Cierre.**
- Pregunta: «Una cuenta tiene $50 en el debe y $30 en el haber. ¿Cuánto es el saldo y de qué lado va?» (21 pal. · 98,4)
- Respuesta: «$20, en el debe. Es la diferencia entre los dos movimientos, y va del lado del más grande.» (18 · 94,0)

---

### P2 · `cu-a2-dos-familias` · Las dos familias de cuentas

| # | título | texto | pal. | INFLESZ |
|---|---|---|---|---|
| 1 | El día después | Llega el cierre del año. ¿Cuál de estas dos cuentas sigue con su saldo al día siguiente: Caja o Ingresos por servicios? | 22 | 91,1 |
| 2 | Las reales | Las cuentas reales, o de balance, muestran lo que la empresa tiene, sus deudas y lo que es de los socios: activo, pasivo y patrimonio. Su saldo pasa de un año al otro. | 33 | 86,5 |
| 3 | Las nominales | Las cuentas nominales, o de resultados, nacen de lo que pasa en el periodo: ingresos, gastos y costos. Al cierre vuelven a cero. Por eso también se llaman transitorias. | 29 | 83,3 |
| 4 | Tres nominales | Toca cada tarjeta para ver un ejemplo del tema. **[textual]** Ingresos: «los valores que recibe una empresa por la venta de bienes o servicios». Gastos: «los desembolsos necesarios para generar los ingresos» (salarios, arriendos). Costos: «desembolsos capitalizables» (costo de ventas). | 9 + textual (≈35) | exento |
| 5 | Una sola pregunta | La pregunta que decide la familia es una sola: ¿el saldo sigue después del cierre? Si sigue, la cuenta es real. Si vuelve a cero, es nominal. Ordena estas seis. | 30 | 91,3 |

**Lo que ve y toca el estudiante, pantalla por pantalla.**
1. VE Caja e Ingresos por servicios con saldo el 31 de diciembre cuando toca «pasar al 1 de enero», y eso explica que una cuenta guarda su saldo y la otra queda en cero.
2. VE Caja, Cuentas por pagar y Aportes sociales cruzar al año nuevo con su saldo cuando avanza el calendario, y eso explica por qué se llaman reales.
3. VE Ingresos por servicios, Gastos de operación y Costo de ventas bajar a cero cuando avanza el calendario, y eso explica el nombre «transitorias».
4. VE la definición textual y un ejemplo cuando voltea cada tarjeta, y eso explica qué entra en cada nominal.
5. VE dos cajas, «sigue» y «vuelve a cero», cuando arrastra seis cuentas (Bancos, Maquinaria, Obligaciones financieras, Ingresos por servicios, Gastos de operación, Costo de ventas), y eso explica que la familia se decide con una sola pregunta.

**Cierre.**
- Pregunta: «Salarios por pagar y el gasto en salarios hablan de lo mismo. ¿Por qué el primero es real y el segundo, nominal?» (22 · 91,1)
- Respuesta: «Salarios por pagar es una deuda: sigue ahí después del cierre. El gasto mide lo del periodo y vuelve a cero.» (21 · 89,5)

---

### P3 · `cu-a5-debe-y-haber` · El debe y el haber

| # | título | texto | pal. | INFLESZ |
|---|---|---|---|---|
| 1 | Mismo lado, mismo monto | El 5 de mayo, Caleja hace dos registros de $50.000, los dos en el debe: uno en Maquinaria y otro en Aportes sociales. ¿Las dos cuentas reaccionan igual? | 28 | 74,9 |
| 2 | Efectos opuestos | Maquinaria pasa de $0 a $50.000. Aportes sociales baja de $400.000 a $350.000. El mismo monto y el mismo lado tienen efectos opuestos. | 23 | 66,4 |
| 3 | Dónde vive cada cuenta | Cada cuenta crece por el lado en que vive dentro de la ecuación. El activo vive a la izquierda y crece por el debe. El pasivo y el patrimonio viven a la derecha y crecen por el haber. | 38 | 90,9 |
| 4 | La trampa | Ojo con una trampa. Con un préstamo de $500, la Caja pasa de $1.000 a $1.500 y nace una deuda de $500. Los dos lados de la ecuación suben juntos. | 30 | 86,8 |
| 5 | Gastos e ingresos | Gastos e ingresos mueven el patrimonio. Un gasto lo baja, y por eso va al debe. Un ingreso lo sube, y va al haber. Suelta una ficha en cada uno. | 30 | 95,5 |
| 6 | Prueba tú | Ahora prueba tú. Suelta fichas de $100, $500 y $1.000 en cualquier lado de estas cuatro cuentas y mira qué pasa con cada saldo. | 24 | 80,6 |

**HUECO (P3·1).** El repo trae cal-3 y cal-6 sin fecha. «5 de mayo» es [CONSTRUCCIÓN]: si Mello no la encuentra en el libro, sale la fecha y queda «Caleja hace dos registros…» (el puntaje sube).

**Lo que ve y toca el estudiante, pantalla por pantalla.**
1. VE dos T con $50.000 en el debe cuando elige «sí, igual» o «no», y eso explica que la predicción se pone a prueba en la siguiente pantalla.
2. VE el saldo de Maquinaria subir y el de Aportes sociales bajar cuando toca «registrar», y eso explica que el lado solo no decide.
3. VE la ecuación A = P + Pt con cada cuenta en su lado cuando arrastra Maquinaria y Aportes sociales a su casa, y eso explica la causa.
4. VE subir a la vez Caja (activo) y Documentos por pagar (pasivo) cuando registra el pagaré de cu6 (p. 89), y eso explica que el aumento de una deuda no es una pérdida de caja.
5. VE el patrimonio bajar con Gastos de operación y subir con Ingresos por servicios (p. 113) cuando suelta una ficha en cada uno, y eso explica por qué el gasto va al debe y el ingreso al haber.
6. VE los cuatro saldos moverse en vivo (Caja 1.500, Aportes sociales 400.000, Gastos de operación 0, Ingresos por servicios 0) cuando suelta fichas de $100, $500 y $1.000, y eso explica la regla en su propia mano.

**Cierre.**
- Pregunta: «Los dos registros eran de $50.000 en el debe. ¿Por qué Maquinaria subió y Aportes sociales bajó?» (17 · 81,1)
- Respuesta: «Maquinaria es activo y vive a la izquierda: crece por el debe. Aportes sociales es patrimonio: vive a la derecha y baja por el debe.» (25 · 77,2)
- Opciones de capa 4, cada una difiere en una palabra y la correcta es la b:
  - a) «Porque Maquinaria vive a la **derecha**.»
  - b) «Porque Maquinaria vive a la **izquierda**.»
  - c) «Porque Maquinaria vive en el **haber**.»
- Retro de la a y la c: «Confundiste dónde vive con dónde se anota. El activo vive a la izquierda.»

---

### P4 · `cu-a3-partida-doble` · La partida doble y las dos reglas

| # | título | texto | pal. | INFLESZ |
|---|---|---|---|---|
| 1 | Una sola línea | Caleja compra un equipo a crédito, por $25.000. Si solo anotas el equipo, ¿los dos lados de la ecuación quedan iguales? | 21 | 74,7 |
| 2 | Partida doble | Por eso el equipo no basta. Mira la regla que da nombre a esta pieza: **[textual]** Partida doble: «cualquier transacción siempre se debe registrar dos veces, una vez en el debe de una cuenta y otra vez en el haber de otra cuenta». | 15 + textual (≈42) | 95,5 |
| 3 | La balanza | Activos = Pasivos + Patrimonio. El equipo sube el activo y la deuda con el proveedor sube el pasivo. Con los dos registros, la balanza vuelve a nivel. | 28 | 76,0 |
| 4 | Primera regla | Primera regla: activos, gastos y costos aumentan por el debe y disminuyen por el haber. Su saldo suele quedar en el debe. | 22 | 82,6 |
| 5 | Segunda regla | Segunda regla: pasivos, patrimonio e ingresos aumentan por el haber y disminuyen por el debe. Su saldo suele quedar en el haber. Lleva cada familia a su grupo. | 28 | 77,4 |
| 6 | Simple o compuesto | Un asiento simple toca dos cuentas, y uno compuesto, más de dos. En los dos, la suma del debe tiene que ser igual a la del haber. | 27 | 101,0 |

**Nota sobre P4.** El dato es cal-2, «Equipo de computación». Toda la pieza dice «equipo», nunca «computador»: un término, un nombre.

**Lo que ve y toca el estudiante, pantalla por pantalla.**
1. VE una balanza A | P + Pt inclinarse cuando anota solo Equipo de computación $25.000, y eso explica que una sola línea desnivela.
2. VE aparecer la segunda línea, Cuentas por pagar en el haber, cuando lee la definición, y eso explica la partida doble.
3. VE la balanza volver a nivel cuando arrastra Cuentas por pagar a su lado, y eso explica que la igualdad viene de la ecuación.
4. VE el grupo «crece por el debe» llenarse con Activos, Gastos y Costos cuando los suelta allí, y eso explica la primera regla.
5. VE el grupo «crece por el haber» llenarse con Pasivos, Patrimonio e Ingresos cuando los suelta (si una familia cae mal, rebota al centro), y eso explica la segunda regla.
6. VE el asiento ene-03 de Lavado (cuatro líneas) con un contador de debe y haber cuando lo arma, y eso explica que lo que se iguala son las sumas, no el número de cuentas.

**Cierre.**
- Pregunta: «El 3 de enero, Lavado de Autos Mateo registra dos cuentas en el debe y dos en el haber. ¿Qué tiene que ser igual?» (24 · 91,0)
- Respuesta: «La suma de cada lado: $10.000 en el debe y $10.000 en el haber. El número de cuentas puede ser distinto.» (21 · 89,5)

---

### P5 · `cu-a4-diario-y-mayor` · Del diario al mayor

| # | título | texto | pal. | INFLESZ |
|---|---|---|---|---|
| 1 | ¿Por fecha o por cuenta? | Lavado de Autos Mateo anotó nueve hechos en enero. Quieres saber cuánto quedó en Bancos. ¿Qué te sirve más: verlos por fecha o agrupados por cuenta? | 26 | 80,8 |
| 2 | El diario | El libro diario anota cada hecho en orden de fecha, apenas ocurre. Por eso se le llama libro de registro de asientos originales. Sus columnas son fecha, detalle, debe y haber. | 31 | 73,9 |
| 3 | Cómo se escribe | En el detalle va primero la cuenta del debe. Debajo, un poco a la derecha, va la del haber, con una explicación corta. | 23 | 87,0 |
| 4 | El mayor | Después del diario viene el mayor. Allí cada cuenta tiene su propia T y junta todo lo que le pasó en el mes. **[textual]** Libro mayor: «el más importante en cualquier contabilidad». | 23 + textual | 100,5 |
| 5 | Mayorizar | Mayorizar es pasar cada valor del diario a su cuenta del mayor: lo del debe al debe y lo del haber al haber. No se calcula nada nuevo. Lleva estos tres valores a Bancos. | 34 | 92,9 |
| 6 | Dos preguntas | El diario responde qué pasó el 3 de enero. El mayor responde cómo quedó Bancos. Son los mismos datos, ordenados de dos formas. | 23 | 82,7 |

**Lo que ve y toca el estudiante, pantalla por pantalla.**
1. VE los nueve asientos de Lavado en desorden cuando elige «por fecha» o «por cuenta», y eso explica que hay dos formas de ordenar los mismos datos.
2. VE el diario armarse fila a fila con los primeros cuatro hechos (diarioDeEjemplo) cuando toca «siguiente», y eso explica el orden de fecha.
3. VE el asiento del 1 de julio (Caja 2000 / Aportes sociales 2000), con la cuenta del haber corrida a la derecha, cuando lo toca, y eso explica la forma del detalle.
4. VE el mismo enero repartido en T por cuenta cuando toca «ver mayor», y eso explica qué junta el mayor.
5. VE los valores de Bancos (5.000 en el debe; 2.000 y 800 en el haber) viajar del diario a la T de Bancos cuando los arrastra, y eso explica que mayorizar copia el lado.
6. VE el diario y el mayor uno junto al otro, con la línea ene-03 iluminada en los dos, cuando la toca, y eso explica que son los mismos datos.

**Cierre.**
- Pregunta: «¿En cuál de los dos libros se registra primero un hecho, y por qué?» (14 · 103,8)
- Respuesta: «En el diario. Es el registro de los asientos originales, en orden de fecha. El mayor viene después y ordena esos datos por cuenta.» (24 · 87,2)

---

## 2 · Hacer nuevas para T2 (tres)

**Por qué tres.** Cada una cubre una de las brechas que viste:

| brecha | Hacer | por qué no alcanza lo que ya hay |
|---|---|---|
| Del diario al mayor no tiene Hacer | N-1 | La etapa 2 del desafío es Experto y no da práctica previa. |
| Las nominales no se practican | N-2 | cu2 solo tiene cuentas reales. |
| La igualdad debe = haber no se verifica | N-3 | cu6 y cu10 arman asientos, pero nunca piden el valor que nivela. |

**Revividas.**
- N-1 rediseña «La mayorización», que se retiró. El problema era que el estudiante solo leía el mayor ya armado. Ahora decide el lado de cada línea, el mayor crece en pantalla (C8) y el saldo se escribe en una casilla.
- «Cuadra o no cuadra» **no** se revive: N-3 mide la igualdad de las sumas sin errores inventados.

**Kit.**
- Las tres tienen su primera decisión en la pantalla 1, con menos de 60 palabras.
- Las retros nombran el error probable, y la regla del segundo error de Miku aplica: se muestra la respuesta con su porqué.
- Todas las cifras salen de LAVADO_DE_AUTOS y COMPUESTAS_SUELTAS.

### N-1 · Pásalo al mayor · `cu-pasalo-al-mayor`
- **Subtema:** Libro mayor y mayorización · **Nivel:** Medio (25 FP)
- **Mecánica:** cada línea del diario de Lavado (CORTE_SET_A) se arrastra a su T y a su lado, el mayor crece en pantalla y al final se escribe el saldo de dos cuentas en casillas.
- **Texto de entrada:** «Este es el diario de Lavado de Autos Mateo del 2 al 12 de enero. Lleva cada valor a su cuenta del mayor, en el mismo lado.» (27 · 84,9)
- **Porqués:**
  - [D] «En el diario este valor está en el debe. Al mayorizar, pasa al debe de su cuenta. El lado no cambia.» (21 · 99,0)
  - [H] «En el diario este valor está en el haber. Al mayorizar, pasa al haber de su cuenta. El lado no cambia.» (21 · 99,0)
- **Retro de error (lado cambiado):** «Lo pusiste en el otro lado. Mayorizar no decide el lado: lo copia del diario.» (15 · 87,2)

| # | ítem (línea del diario) | respuesta | porqué |
|---|---|---|---|
| 1 | ene-02 · Bancos 5.000 | T Bancos · debe | [D] |
| 2 | ene-02 · Acciones 5.000 | T Acciones · haber | [H] |
| 3 | ene-03 · Construcciones y edificaciones 6.000 | T Construcciones y edificaciones · debe | [D] |
| 4 | ene-03 · Terrenos 4.000 | T Terrenos · debe | [D] |
| 5 | ene-03 · Bancos 2.000 | T Bancos · haber | [H] |
| 6 | ene-03 · Hipoteca por pagar 8.000 | T Hipoteca por pagar · haber | [H] |
| 7 | ene-04 · Flota y equipo de transporte 4.800 | T Flota y equipo de transporte · debe | [D] |
| 8 | ene-04 · Bancos 800 | T Bancos · haber | [H] |
| 9 | ene-04 · Letras por pagar 4.000 | T Letras por pagar · haber | [H] |
| 10 | ene-08 · Equipo de computación 2.000 | T Equipo de computación · debe | [D] |
| 11 | ene-08 · Cuentas por pagar 2.000 | T Cuentas por pagar · haber | [H] |
| 12 | ene-12 · Muebles y enseres 2.500 | T Muebles y enseres · debe | [D] |
| 13 | ene-12 · Bancos 500 | T Bancos · haber | [H] |
| 14 | ene-12 · Cuentas por pagar 2.000 | T Cuentas por pagar · haber | [H] |
| 15 | Casilla: saldo de Bancos | $1.700 · debe | «Bancos suma $5.000 en el debe y $3.300 en el haber. La diferencia es $1.700 y queda en el debe.» (20 · 87,8) |
| 16 | Casilla: saldo de Cuentas por pagar | $4.000 · haber | «Cuentas por pagar suma $4.000 en el haber y nada en el debe. Su saldo es $4.000, en el haber.» (20 · 97,2) |

[CONSTRUCCIÓN, para Erwin]
- Los saldos se validan con `mayorConSaldos(mayorizar(CORTE_SET_A))`, no a mano.
- Las casillas usan CasillaCifra (ya existe en T7).
- Las T se generan solo para las 9 cuentas del corte.

### N-2 · ¿Se queda o se cierra? · `cu-se-queda-o-se-cierra`
- **Subtema:** [regla] por `familia` del ítem · **Nivel:** Fácil (10 FP)
- **Mecánica:** el 31 de diciembre cada cuenta va a «Se queda» o «Se cierra». Luego se elige su familia, y al final el cierre barre las nominales a cero en pantalla.
- **Texto de entrada:** «Es 31 de diciembre y se cierra el año. Mira cada cuenta y decide: ¿su saldo se queda para el año que viene o se cierra?» (26 · 90,8)
- **Porqués:**
  - [nom] «Mide lo que pasó en este año. Al cierre vuelve a cero y el año que viene empieza de nuevo.» (20 · 97,2)
  - [real] «Muestra algo que la empresa tiene o una deuda que sigue viva. Eso sigue ahí el 1 de enero, así que su saldo se queda.» (25 · 84,7)
- **Retro de error:** «Te fijaste en el nombre y no en el tiempo. Pregúntate si eso sigue ahí el 1 de enero.» (19 · 89,1). Apunta a la trampa de Cuentas por cobrar y Documentos por pagar, que suenan a movimiento.
- **Pantalla de cierre:** «Ahora mira el cierre: las cuentas que se cierran vuelven a cero. Las que se quedan pasan con su saldo al año nuevo.» (23 · 97,8)

| # | ítem | respuesta 1 | respuesta 2 (familia) | porqué |
|---|---|---|---|---|
| 1 | Ingresos por servicios | Se cierra | Ingresos | [nom] |
| 2 | Cuentas por cobrar | Se queda | Activo | [real] |
| 3 | Gastos de operación | Se cierra | Gastos | [nom] |
| 4 | Hipoteca por pagar | Se queda | Pasivo | [real] |
| 5 | Ingresos por ventas | Se cierra | Ingresos | [nom] |
| 6 | Maquinaria | Se queda | Activo | [real] |
| 7 | Gastos de administración y ventas | Se cierra | Gastos | [nom] |
| 8 | Documentos por pagar | Se queda | Pasivo | [real] |
| 9 | Costo de ventas | Se cierra | Costos | [nom] |
| 10 | Muebles y enseres | Se queda | Activo | [real] |

**Notas sobre N-2.**
- Las cuentas reales no repiten las de cu2. Las cinco nominales vienen de cu3, cu4 y la definición textual de Costos.
- **HUECO · nombre cruzado:** T2 dice «Costo de ventas» (textual de A2 y `contabilidad.js`), y el canon de T7 dice «Costo de mercancía vendida».
- Mi decisión: N-2 usa «Costo de ventas», porque así está en T2.
- Lo paso a ti y a Erwin como conflicto entre temas. No toco T7.
- No hay ítem de Patrimonio: el banco tiene 10 ítems y Aportes sociales ya está en cu1 y cu2. Si Mello lo pide, se agrega Acciones como ítem 11 (Se queda · Patrimonio · [real]).

### N-3 · La línea que falta · `cu-la-linea-que-falta`
- **Subtema:** Partida doble: igualdad del debe y el haber · **Nivel:** Medio (25 FP)
- **Mecánica:** un asiento compuesto real aparece con un valor oculto. El estudiante escribe el valor que iguala la suma del debe con la del haber, y un contador de cada lado se nivela en vivo.
- **Texto de entrada:** «A cada asiento le falta un valor. Escribe el que hace que la suma del debe sea igual a la del haber.» (22 · 96,7)
- **Retro de error (copió un valor visible):** «Copiaste un valor del asiento. Suma primero un lado y réstale lo que ya hay en el otro.» (18 · 94,0)

| # | ítem (asiento con hueco) | respuesta | porqué |
|---|---|---|---|
| 1 | ene-03 · Construcciones y edificaciones 6.000 + Terrenos 4.000 / Bancos 2.000 + Hipoteca por pagar ▢ | 8.000 | «El debe suma $10.000. En el haber ya hay $2.000 de Bancos, así que la hipoteca es $8.000.» (18 · 87,1) |
| 2 | ene-04 · Flota y equipo de transporte 4.800 / Bancos 800 + Letras por pagar ▢ | 4.000 | «El debe suma $4.800. En el haber ya hay $800 de Bancos, así que las letras son $4.000.» (18 · 94,0) |
| 3 | ene-12 · Muebles y enseres 2.500 / Bancos ▢ + Cuentas por pagar 2.000 | 500 | «El debe suma $2.500. En el haber ya hay $2.000 de Cuentas por pagar, así que Bancos es $500.» (19 · 92,4) |
| 4 | cu10-computador-mitad · Equipo de computación 1.500.000 / Caja 750.000 + Cuentas por pagar ▢ | 750.000 | «El debe suma $1.500.000. En el haber ya hay $750.000 de Caja, así que la deuda es $750.000.» (18 · 94,0) |
| 5 | cu10-socio-vehiculo · Flota y equipo de transporte 2.000.000 + Caja 1.000.000 / Aportes sociales ▢ | 3.000.000 | «El debe suma $3.000.000: el vehículo y la Caja. Todo eso lo aporta el socio, en el haber.» (18 · 87,1) |

**Notas sobre N-3.**
- Orden de la escalera C2: tres asientos de Lavado (miles) y luego dos de cu10 (millones). El hueco está en el haber en 1, 2, 4 y 5, y en la línea del medio en 3, para que no se vuelva rutina.
- [CONSTRUCCIÓN] El hueco usa CasillaCifra, y la validación compara la suma del debe con la del haber del asiento, no un número fijo.

---

## 3 · Subtemas para el Repaso diario

### Lista cerrada de T2 (12)
1. Estructura de la cuenta T
2. Clasificación de cuentas reales
3. Clasificación de cuentas nominales
4. Reglas de registro por familia
5. Reglas de registro aplicadas
6. Cálculo del saldo
7. Partida doble: igualdad del debe y el haber
8. Asiento contable simple
9. Asiento compuesto
10. Libro diario y asientos contables
11. Libro mayor y mayorización
12. Construcción del estado de situación financiera

### Mapeo (formato de Macro)

| actividad / etapa | tipo | subtema |
|---|---|---|
| `cu-izquierda-o-derecha` | [fijo] | Estructura de la cuenta T |
| `cu-de-que-familia` | [fijo] | Clasificación de cuentas reales |
| `cu-cuadro-dinamicas` | [fijo] | Reglas de registro por familia |
| `cu-debita-o-acredita` | [fijo] | Reglas de registro aplicadas |
| `cu-saldo-de-la-cuenta` | [fijo] | Cálculo del saldo |
| `cu-arma-el-asiento` | [fijo] | Asiento contable simple |
| `cu-asiento-compuesto` | [fijo] | Asiento compuesto |
| `ciclo-completo:1` El Libro Diario | [fijo] | Libro diario y asientos contables |
| `ciclo-completo:2` La Mayorización | [fijo] | Libro mayor y mayorización |
| `ciclo-completo:3` Los Saldos | [fijo] | Cálculo del saldo |
| `ciclo-completo:4` El Estado de Situación Financiera | [fijo] | Construcción del estado de situación financiera |
| `cu-pasalo-al-mayor` (N-1) | [fijo] | Libro mayor y mayorización |
| `cu-se-queda-o-se-cierra` (N-2) | [regla] `familia` | Activo, Pasivo, Patrimonio → Clasificación de cuentas reales · Ingresos, Gastos, Costos → Clasificación de cuentas nominales |
| `cu-la-linea-que-falta` (N-3) | [fijo] | Partida doble: igualdad del debe y el haber |

**Cómo encaja con lo que ya existe.**
- Las cuatro etapas del desafío usan **los mismos nombres** que ya tiene `DESAFIO.pesos[].subtema`. Así el progreso guardado de los estudiantes no queda huérfano.
- `cu-cuadro-dinamicas` hoy dice «Reglas de registro» en su banco. En el Repaso queda «Reglas de registro por familia» **solo en `subtemas.js`**, que es nuevo; el campo del banco no se toca.
- **HUECO (para Erwin):** si el Repaso lee el subtema del banco y no de `subtemas.js`, se deja «Reglas de registro» y la lista cerrada usa ese nombre. Yo me quedo con lo que no mueva datos.
- Los subtemas de las piezas Aprender («Estructura de la cuenta T», «Clasificación de cuentas», …) no se renombran.
- «Clasificación de cuentas» de A2 cubre los subtemas 2 y 3 de la lista. No es un conflicto: Aprender no entra al Repaso.

**Código para `src/repaso/subtemas.js`** (solo se agrega):

```js
// T2 · cuentas-debe-haber
Object.assign(SUBTEMA_FIJO, {
"cu-izquierda-o-derecha": "Estructura de la cuenta T",
"cu-de-que-familia": "Clasificación de cuentas reales",
"cu-cuadro-dinamicas": "Reglas de registro por familia",
"cu-debita-o-acredita": "Reglas de registro aplicadas",
"cu-saldo-de-la-cuenta": "Cálculo del saldo",
"cu-arma-el-asiento": "Asiento contable simple",
"cu-asiento-compuesto": "Asiento compuesto",
"ciclo-completo:1": "Libro diario y asientos contables",
"ciclo-completo:2": "Libro mayor y mayorización",
"ciclo-completo:3": "Cálculo del saldo",
"ciclo-completo:4": "Construcción del estado de situación financiera",
"cu-pasalo-al-mayor": "Libro mayor y mayorización",
"cu-la-linea-que-falta": "Partida doble: igualdad del debe y el haber",
});
SUBTEMA_REGLA["cu-se-queda-o-se-cierra"] = {
Activo: "Clasificación de cuentas reales",
Pasivo: "Clasificación de cuentas reales",
Patrimonio: "Clasificación de cuentas reales",
Ingresos: "Clasificación de cuentas nominales",
Gastos: "Clasificación de cuentas nominales",
Costos: "Clasificación de cuentas nominales",
};
```

---

**Para Watari y Mello.**
- Watari diseña las tres brechas en paralelo. Si su mecánica choca con N-1, N-2 o N-3, manda la de Watari y yo ajusto los bancos.
- Mello: la línea de base de T2 se puede correr sobre este archivo.
