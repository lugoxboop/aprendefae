# LOTE T2-2 · Célula C · Near → L
T2 «Las cuentas, el debe y el haber» (`cuentas-debe-haber`) · 2026-10-23 11:25 (Bogotá)

Lo leí en el artefacto de Watari, en `c-t2-1-mello-linea-base.md` (§2, §3 y las confusiones de S9) y en `c-t2-1-decisiones-l.md`, siempre en origin/main.

**Medición.**
- INFLESZ con `npm run -s inflesz`. Ningún texto de 10 palabras o más baja de 65; el mínimo del lote es 66,4.
- Lo `textual: true` no se mide ni se reescribe.
- Ninguna slide pasa de 40 palabras de texto (S2), y ninguna pantalla de Hacer pasa de 60 palabras visibles (H8).

**No borrar.**
- Todo es nuevo: `contabilidadAprenderSlides.js`, tres ids nuevos y entradas nuevas en `contabilidadT2Subtemas.js`.
- Ningún objeto, banco ni campo `subtema` existente cambia.
- **Parada anunciada (H10):** si los tres ids necesitan una fila en el catálogo de FP del servidor, eso es una migración. La corre Mateo y la revisa Levi. No la escribo yo.

---

## 1 · Las tres Hacer nuevas, sobre la forma de Watari

Las tres siguen el dialecto de Hacer (H7):
- Un intento por caso.
- «Correcto», «No va aquí» e «Iba aquí» a los 0,7 s.
- Primero la consecuencia en el objeto y después el veredicto (C4).
- Se barajan por intento (D8).

Ningún retro da la respuesta en seco: cada uno nombra la confusión o dice lo que pasaría.

### 1.1 · Cuadra por valor · `cu-cuadra-por-valor` · Medio · 8.º Hacer

- **Objetivo (H1):** «Al terminar, sabrás comprobar que un asiento cuadra por el valor de sus dos lados, no por el número de cuentas.» (21 pal. · 85,0)
- **Consignas:**
  - completar: «Escribe el valor que hace que el debe y el haber sumen lo mismo.» (14 · 94,9)
  - juzgar: «¿Este asiento cuadra?» (exento)
  - encontrar: «Toca el renglón que descuadra el asiento.» (exento)
- **Partida:** 8 casos, 3 de completar, 2 de juzgar y 3 de encontrar. El orden se baraja dentro de cada tipo.
- **Trampas de Watari:**
  - 3 contra 1 que sí cuadra: K3.
  - 2 contra 2 que no cuadra: J2.
  - Error en el monto, no en el número de líneas: J2 y E3.
- **Errores de Mello:**
  - Monto traspuesto: J2 y E3. La diferencia se divide por 9.
  - Lado contrario: E1. La diferencia es el doble del renglón.
  - Renglón omitido: J1. Un lado se queda corto en un renglón entero.
  - Renglón duplicado: E2. Un lado se pasa en un renglón, y la cuenta aparece dos veces.
- **E8:** en juzgar y en encontrar las columnas se dibujan solo después de la decisión, para que la figura no muestre la diferencia antes de tiempo. En completar, la columna crece al teclear, pero solo como «Tu cifra», hasta «Comprobar» (C4-1).
- **Fuentes (H2):**
  - Lavado: pp. 98-101.
  - COMPUESTAS_SUELTAS (cu10): «Basado en el libro», como ya lo marca el repo.
  - Caleja: el repo no trae la página. **HUECO:** que Mello la busque, o queda «Basado en el libro».

**Completar** (`{ correcta, distractores: [{ valor, retro }] }`)

| # | asiento (▢ = hueco) | correcta | distractor → retro | porqué del acierto |
|---|---|---|---|---|
| K1 | cu10-computador-mitad · Equipo de computación 1.500.000 / Caja 750.000 + Cuentas por pagar ▢ | 750.000 | 1.500.000 → «Copiaste el total del debe. Así el haber se pasa en $750.000: resta lo que ya pone Caja.» (18 · 94,0) · 2.250.000 → «Sumaste Caja en vez de restarla. Así el haber se pasa en $1.500.000.» (13 · 90,1) | «El debe suma $1.500.000. En el haber ya hay $750.000 de Caja, así que la deuda es $750.000.» (18 · 94,0) |
| K2 | Lavado ene-12 · Muebles y enseres 2.500 / Bancos ▢ + Cuentas por pagar 2.000 | 500 | 2.500 → «Copiaste el total del debe. Así el haber se pasa en $2.000: resta lo que ya pone Cuentas por pagar.» (20 · 94,0) · 4.500 → «Sumaste Cuentas por pagar en vez de restarla. Así el haber se pasa en $4.000.» (15 · 91,3) | «El debe suma $2.500. En el haber ya hay $2.000 de Cuentas por pagar, así que Bancos es $500.» (19 · 92,4) |
| K3 | **Trampa 3 contra 1.** Bancos 5.000 + Caja 1.000 + Equipo de computación 2.000 / Acciones ▢. «Basado en el libro»: une los aportes de Lavado del 2 y del 25 de enero; el aporte de Equipo de computación $2.000 es construido. | 8.000 | 5.000 → «Igualaste línea con línea. Así el haber se queda corto en $3.000: suma las tres cuentas del debe.» (18 · 80,2) · 6.000 → «Sumaste solo dos cuentas del debe. Así el haber se queda corto en $2.000.» (14 · 88,6) | «Tres cuentas contra una, y cuadra. El debe suma $8.000, así que Acciones es $8.000.» (15 · 83,0) |

**Juzgar** (`{ cuadra, porqué, retro de la opción mala }`)

| # | hecho y asiento mostrado | respuesta | porqué | retro de «Cuadra» |
|---|---|---|---|---|
| J1 | **Omitido.** «Un socio aporta un vehículo de $2.000.000 y $1.000.000 en efectivo.» Se muestra: Flota y equipo de transporte 2.000.000 / Aportes sociales 3.000.000. Basado en cu10-socio-vehiculo; falta la línea de Caja. | No cuadra | «Falta un renglón. La diferencia es $1.000.000, justo el efectivo que aportó el socio y nadie anotó.» (17 · 73,7) | «Una cuenta contra una parece pareja. Pero el debe suma $2.000.000 y el haber, $3.000.000.» (15 · 70,6) |
| J2 | **Trampa 2 contra 2 + traspuesto.** «Caleja compra a crédito un computador por $25.000 y maquinaria por $50.000 con un préstamo bancario» (textos de cal-2 y cal-3, en un solo asiento). Se muestra: Equipo de computación **52.000** + Maquinaria 50.000 / Cuentas por pagar 25.000 + Obligaciones financieras 50.000. Lo construido es el 52.000. | No cuadra | «La diferencia es $27.000, y se divide justo por 9. Es la señal de dos cifras invertidas: 52.000 por 25.000.» (20 · 75,4) | «Dos contra dos parece parejo. Pero el debe suma $102.000 y el haber, $75.000.» (14 · 79,7) |

**Encontrar** (`{ línea, retro por cada línea mala }`; el hecho va arriba, para que se resuelva solo con lo que dice, H3)

| # | hecho y asiento mostrado | línea correcta | porqué | retro por línea mala |
|---|---|---|---|---|
| E1 | **Lado contrario.** Lavado ene-04: «Compra un vehículo de $4.800: paga $800 desde Bancos y firma letras por $4.000.» Se muestra: Flota y equipo de transporte 4.800 D · **Bancos 800 D** · Letras por pagar 4.000 H. | Bancos | «Bancos pagó, así que baja y va al haber. En el debe deja $1.600 de más, el doble de $800.» (20 · 97,2) | Flota → «Flota sí va en el debe: es lo que compraste. El que sobra en el debe es el pago.» (19 · 112,1) · Letras → «Letras por pagar está bien: la deuda nueva va al haber. Mira el pago desde Bancos.» (16 · 97,6) |
| E2 | **Duplicado.** Caleja cal-5: «Los socios aportan un local comercial de $100.000.» Se muestra: Local comercial 100.000 D · **Local comercial 100.000 D** · Aportes sociales 100.000 H. | Cualquiera de las dos de Local comercial (se aceptan ambas) | «Local comercial está dos veces. La diferencia es igual a un renglón: es la señal de un duplicado.» (18 · 87,1) | Aportes sociales → «Aportes sociales está bien. Lo que sobra es un renglón repetido: busca la cuenta que aparece dos veces.» (18 · 80,2) |
| E3 | **Traspuesto.** Lavado ene-18: «Paga $250 de Cuentas por pagar desde Bancos.» Se muestra: Cuentas por pagar 250 D · **Bancos 520 H**. | Bancos | «Bancos dice $520 y el pago fue de $250. La diferencia, $270, se divide por 9: son cifras invertidas.» (19 · 69,5) | Cuentas por pagar → «Cuentas por pagar tiene los $250 del pago. La cifra que no coincide con el hecho es la de Bancos.» (20 · 100,3) |

Para cada caso, el aviso de error que pinta la figura usa la frase de Watari: «Faltan $X en el {lado}: las dos columnas no llegan a la misma altura.» La cifra sale del dato; no se escribe a mano.

### 1.2 · Del diario al mayor · `cu-del-diario-al-mayor` · Medio · 9.º Hacer

- **Objetivo:** «Al terminar, sabrás llevar cada renglón del diario a su cuenta del mayor, y encontrar de dónde salió.» (18 · 81,5)
- **Consignas:**
  - destino: «Toca la cuenta del mayor donde va el renglón marcado.» (la de Watari)
  - origen: «Toca el renglón del diario de donde salió esta línea del mayor.» (12 · 85,8)
- **Datos:** Lavado, pp. 98-101 (CORTE_SET_A), recortado al tope de Watari de 4 cuentas y 7 renglones.
  - ene-03 sale: con cualquier otro asiento pasa de 4 cuentas. Además lo usan las Aprender (P4·8 y P5·5), así que fuera de aquí no se cruza con nada.
  - Quedan dos casos. Cada partida juega uno y se alternan por intento (D8). Cada caso tiene 5 destino y 2 origen.
  - Los destino van en orden de fecha, como en el diario. Los origen se barajan.
- **Sin saldo,** como decidiste: lo practica «El saldo de la cuenta».
- **Errores de Mello que cubre:**
  - Agrupar por fecha en lugar de por cuenta: retro tipo A.
  - Cambiar la columna: no aplica, porque el lado no se elige (Watari). Lo cubre P5·5 en Aprender.
- **Porqué del acierto en destino (uno para todos):** «En el diario, este valor es de esta cuenta. El mayor lo guarda en su T, del mismo lado.» (19 · 105,5)
- **Retros en destino:** salen de una regla. Cada cuenta mala lleva el suyo, con el nombre puesto. Medí el peor caso de cada plantilla, con el nombre más largo.
  - **A**, otra cuenta del mismo asiento: «Así, {cuenta} se queda con un renglón de su vecino de asiento. El mayor junta por cuenta, no por fecha.» (24 · 91,0 con Flota y equipo de transporte)
  - **B**, una cuenta que no está en ese asiento: «Así, {cuenta} tendría un valor de un asiento donde no aparece.» (15 · 67,2 con Flota y equipo de transporte)
  - **C**, una cuenta con la misma cifra: «Así, {cuenta} se queda con un valor solo porque la cifra es igual. Busca la cuenta, no el número.» (19 · 92,4)
- **Retros en origen:**
  - **oA**, la misma cuenta en otra fecha: «Ese renglón es de {cuenta}, pero del {fecha}. Mira la fecha de la línea del mayor.» (20 · 90,9)
  - **oB**, el mismo día y otra cuenta: «Ese renglón es del mismo día, pero de {cuenta}. La línea del mayor es de {cuenta del mayor}.» (20 · 90,9 en el peor caso)
  - **oC**, la misma cifra y otra cuenta: «Tiene la misma cifra, pero es de {cuenta}. Busca la cuenta, no solo el valor.» (17 · 88,4)
  - **oD**, ni la cuenta ni la fecha: «Ese renglón es de {cuenta}, del {fecha}: no coinciden ni la cuenta ni la fecha.» (19 · 76,4 en el peor caso)

**Caso A · Lavado, 2 y 4 de enero.** Las cuentas del mayor son Bancos, Acciones, Flota y equipo de transporte y Letras por pagar. Bancos sale en los dos lados, en fechas distintas, y ene-04 es compuesto.

| # | tipo | ítem | respuesta | cuentas o renglones malos → retro |
|---|---|---|---|---|
| 1 | destino | 2 ene · Bancos · Debe · 5.000 | Bancos | Acciones → C · Flota → B · Letras → B |
| 2 | destino | 2 ene · Acciones · Haber · 5.000 | Acciones | Bancos → C · Flota → B · Letras → B |
| 3 | destino | 4 ene · Flota y equipo de transporte · Debe · 4.800 | Flota | Bancos → A · Letras → A · Acciones → B |
| 4 | destino | 4 ene · Bancos · Haber · 800 | Bancos | Flota → A · Letras → A · Acciones → B |
| 5 | destino | 4 ene · Letras por pagar · Haber · 4.000 | Letras | Flota → A · Bancos → A · Acciones → B |
| 6 | origen | Mayor: Bancos · haber · 4 ene · $800 | renglón 4 | r1 → oA · r3 → oB · r5 → oB · r2 → oD |
| 7 | origen | Mayor: Bancos · debe · 2 ene · $5.000 | renglón 1 | r2 → oC · r4 → oA · r3 → oD · r5 → oD |

Cierre del caso, sin calificación: «El diario suma $9.800 en el debe y $9.800 en el haber. El mayor suma lo mismo: son los mismos datos.» (21 · 95,5). Es la comprobación final que pide Mello.

**Caso B · Lavado, 8 y 12 de enero.** Las cuentas del mayor son Equipo de computación, Cuentas por pagar, Muebles y enseres y Bancos. Cuentas por pagar sale dos veces, del mismo lado y en fechas distintas: es la trampa de agrupar por fecha.

| # | tipo | ítem | respuesta | cuentas o renglones malos → retro |
|---|---|---|---|---|
| 1 | destino | 8 ene · Equipo de computación · Debe · 2.000 | Equipo de computación | Cuentas por pagar → A · Muebles → B · Bancos → B |
| 2 | destino | 8 ene · Cuentas por pagar · Haber · 2.000 | Cuentas por pagar | Equipo → A · Muebles → B · Bancos → B |
| 3 | destino | 12 ene · Muebles y enseres · Debe · 2.500 | Muebles y enseres | Bancos → A · Cuentas por pagar → A · Equipo → B |
| 4 | destino | 12 ene · Bancos · Haber · 500 | Bancos | Muebles → A · Cuentas por pagar → A · Equipo → B |
| 5 | destino | 12 ene · Cuentas por pagar · Haber · 2.000 | Cuentas por pagar | Muebles → A · Bancos → A · Equipo → C |
| 6 | origen | Mayor: Cuentas por pagar · haber · 12 ene · $2.000 | renglón 5 | r2 → oA («…pero del 8 de enero…», 20 · 90,9) · r1 → oC · r3 → oB · r4 → oB |
| 7 | origen | Mayor: Bancos · haber · 12 ene · $500 | renglón 4 | r3 → oB («…pero de Muebles y enseres…», 18 · 94,0) · r5 → oB · r1 → oD · r2 → oD |

Cierre del caso: «El diario suma $4.500 en el debe y $4.500 en el haber. El mayor suma lo mismo: son los mismos datos.» (21 · 95,5)

### 1.3 · Las que vuelven a cero · `cu-las-que-vuelven-a-cero` · Fácil · 10.º Hacer

- **Objetivo:** «Al terminar, sabrás qué cuentas vuelven a cero en el cierre y cuáles pasan al año siguiente con su saldo.» (20 · 84,0)
- **Rótulo:** «Escenario simulado» (exento). Va en la ceja de cada pantalla, porque los saldos no son del libro.
- **Consigna:** «Llega el cierre de 20X1. ¿Qué pasa con {cuenta}?» (12 · 75,2 con la cuenta de nombre más largo)
- **Opciones (binaria):** «Vuelve a cero en el cierre» · «Pasa al año siguiente con su saldo».
- **Decisión mía (reversible): cierre de año, no de mes.**
  - La maqueta de Watari cierra marzo y pasa a abril. Las nominales vuelven a cero en el cierre del ejercicio, y A2 ya dice «Al cierre del año».
  - Un cierre mensual en cero exageraría lo que hace el libro.
  - Por eso cambian `mes: "diciembre de 20X1"` y `mesSiguiente: "enero de 20X2"`, y en la opción dice «año» donde decías «mes». La forma de Watari no cambia.
- **Caso:** Lavado de Autos Mateo S.A., con 8 cuentas (Watari pide de 6 a 8): 2 ingresos, 1 gasto, 1 costo y 4 reales, entre ellas un pasivo.
  - Cada cuenta lleva su porqué y solo el retro de la opción mala que le toca.
  - La familia se nombra en el retro, como pediste.

| # | cuenta | clase | saldo | correcta | porqué | retro de la opción mala |
|---|---|---|---|---|---|---|
| 1 | Ingresos por servicios | nominal | $12.000 | Vuelve a cero | «Es un ingreso: mide lo que la empresa ganó en el año. Al cierre, su saldo pasa a Ganancias y pérdidas.» (21 · 92,5) | si la pasa: «Así, 20X2 empezaría con ingresos que hizo 20X1. Es un ingreso, y se cierra.» (14 · 69,8) |
| 2 | Cuentas por cobrar | real | $3.000 | Pasa | «Es lo que los clientes te deben. Esa plata sigue por cobrar el 1 de enero.» (16 · 97,6) | si la pone en cero: «Así, los clientes dejarían de deberte el 1 de enero. Es un activo, y su saldo pasa.» (17 · 81,1) **Trampa de Near** |
| 3 | Gastos de operación | nominal | $5.000 | Vuelve a cero | «Es un gasto del año. Se cierra aunque haya tenido muchos movimientos.» (12 · 81,4) | si la pasa: «Que se mueva mucho no la deja abierta. Es un gasto: mide el año y vuelve a cero.» (18 · 100,9) **S9 de A2: transitoria no es «poco usada»** |
| 4 | Documentos por pagar | real | $2.500 | Pasa | «Es una deuda firmada. La deuda no se borra con el cierre: sigue en 20X2.» (15 · 92,1) | si la pone en cero: «Así, la deuda desaparecería con el cierre. Es un pasivo, y su saldo pasa.» (14 · 79,7) **Trampa de Near** |
| 5 | Ingresos por ventas | nominal | $8.000 | Vuelve a cero | «Es un ingreso del año. Su saldo se va a Ganancias y pérdidas y la cuenta queda en $0.» (19 · 95,7) | si la pasa: «Así, las ventas de 20X1 se sumarían a las de 20X2. Un ingreso mide un solo año.» (17 · 80,6) |
| 6 | Gastos pagados por anticipado | real | $1.200 | Pasa | «Su nombre dice gastos, pero es un activo: un servicio que ya pagaste y aún no usas. Sigue el 1 de enero.» (22 · 85,4) | si la pone en cero: «Así, perderías un servicio que ya pagaste y aún no usas. Es un activo, no un gasto.» (17 · 88,4) **Trampa de Mello: anticipo = activo** |
| 7 | Costo de ventas | nominal | $4.500 | Vuelve a cero | «Es un costo: lo que costó lo que se vendió en el año. Se cierra como los gastos.» (18 · 111,3) | si la pasa: «Así, 20X2 cargaría con lo que costó vender en 20X1. Es un costo, y se cierra.» (16 · 84,7) |
| 8 | Caja | real | $6.000 | Pasa | «Es el dinero que hay en la caja, también el que cobraste. Cobrar no es un ingreso: es Caja, y su saldo pasa.» (23 · 100,5) | si la pone en cero: «Así, en 20X2 Caja diría $0, y el dinero sigue ahí. Lo cobrado es Caja, no un ingreso.» (18 · 75,4) **Trampa de Mello: cobro = Caja** |

- **Texto final (el puente con el desafío):** «El cierre deja la utilidad del año, $10.500, lista para pasar al patrimonio. Con eso empieza El Ciclo Completo.» (19 · 69,5)
  - Las cuentas: ingresos $20.000 − gastos y costos $9.500 = $10.500. La figura de Watari muestra esa suma, pero no se califica (E8).
- **HUECO · nombre:** «Gastos pagados por anticipado» no está en los datos de T2. Es el nombre del PUC (1705), y T6 usa «Anticipos y avances» para otra cosa. Que Mello confirme el nombre del libro. Si no aparece, el ítem cambia de nombre pero sigue siendo un activo.
- **«Costo de ventas»**, como pediste. El choque con «Costo de mercancía vendida» de T7 sigue anotado para Erwin.

---

## 2 · Aprender en slides, con S1-S13

**Lo que cambia frente a T2-1:**
- Cada pieza abre con una slide de objetivo (S1).
- Las slides se marcan como **[lee]**, **[toca]** o **[decide]**. Nunca hay más de 2 [lee] seguidas (S3), y la primera decisión llega antes de 40 palabras en las cinco piezas.
- Cada pieza trae sus dos confusiones de S9, cada una con su pista (primer error) y su devolución (segundo error). En Aprender no hay «Iba aquí» (S5).
- En P3·1 sale «5 de mayo» (S10).

**Movimientos (C1 entre Aprender y Hacer):**
- P5 deja de mostrar ene-02, ene-04 y ene-08, y solo enseña con ene-03 y el asiento del 1 de julio. ene-02 y ene-04 son ahora respuestas de «Del diario al mayor» y de «Cuadra por valor».
- P4 cierra con una pregunta general, no con las sumas de un asiento.
- P2·7 cambia Gastos de operación por Gastos de administración y ventas, porque P2·6 ya resuelve Gastos de operación.
- P2·4, la de gasto contra costo, va **antes** de las tarjetas, porque la tarjeta de Costos daría la respuesta.

### P1 · `cu-a1-anatomia-de-una-cuenta` · De qué está hecha una cuenta
**S9:** «debe = aumenta» (P1·6) y «el saldo va del lado del último valor» (P1·5).

| # | tipo | título | texto | pal. · INFLESZ | VE ___ cuando ___, y eso explica ___ |
|---|---|---|---|---|---|
| 0 | [lee] | Objetivo | Al terminar, sabrás leer una cuenta T: sus dos lados, sus movimientos y su saldo. | 15 · 83,8 | VE el objetivo solo, con «Empezar», cuando abre la pieza, y eso explica qué se lleva. |
| 1 | [decide] | ¿De qué lado? | Esta es la cuenta Caja del ejemplo del libro. Entraron $1.000 y $500, y salieron $150. ¿De qué lado pondrías lo que entra? · opciones «Izquierda» / «Derecha» | 23 · 82,7 | VE una T vacía y tres fichas cuando suelta la primera a un lado, y eso explica que la cuenta tiene dos lugares antes de tener nombres. |
| 2 | [lee] | Qué es una cuenta | **[textual]** Cuenta: «un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio». | textual (23) | VE la definición del libro sobre la T que armó, cuando avanza, y eso explica qué registra. |
| 3 | [lee] | Debe y haber | La raya parte la cuenta en dos. El lado izquierdo se llama debe y el derecho, haber. Son nombres de lugar: no dicen si algo sube o baja. | 28 · 97,4 | VE aparecer «debe» y «haber» sobre las columnas cuando avanza, y eso explica que son nombres de lugar. |
| 4 | [toca] | Movimientos | Suma cada lado por separado. En Caja, el debe suma $1.500 y el haber, $150. Cada suma es el movimiento de ese lado. | 23 · 80,0 | VE el total de cada columna cuando toca «sumar», y eso explica qué es un movimiento. |
| 5 | [decide] | El saldo | El saldo es la diferencia entre los dos movimientos: $1.350. El último valor que anotaste fue al haber. ¿De qué lado va el saldo? · «En el debe» / «En el haber» | 24 · 87,2 | VE el 1.350 caer del lado del movimiento mayor (si elige el haber, la T se inclina hacia el debe) cuando decide, y eso explica que el saldo no sigue al último valor. |
| 6 | [decide] | Debe no es subir | El 18 de enero, Lavado de Autos Mateo le paga $250 a un proveedor. Lo anota en el debe de Cuentas por pagar. ¿La deuda sube o baja? · «Sube» / «Baja» | 28 · 84,0 | VE la T de Cuentas por pagar perder $250 cuando decide, y eso explica que el debe es un lugar y que su efecto depende de la cuenta. |

- **Pistas y devoluciones:**
  - P1·5: pista «Pista: compara las dos sumas. ¿Cuál es más grande?» (exento) · devolución «Seguiste el último valor. El saldo va del lado del movimiento mayor, y ese es el debe.» (17 · 88,4)
  - P1·6: pista «Pista: después de pagar, ¿le debes más o menos al proveedor?» (11 · 88,2) · devolución «Leíste el debe como aumento. El debe es un lugar: en una deuda, lo que va al debe la baja.» (20 · 97,2)
- **Cierre:** «Una cuenta tiene $50 en el debe y $30 en el haber. ¿Cuánto es el saldo y de qué lado va?» (21 · 98,4) → «$20, en el debe. Es la diferencia entre los dos movimientos, y va del lado del más grande.» (18 · 94,0)
- **Datos:** el ejemplo de Caja es de la pieza actual, y ene-18 es de Lavado (pp. 98-101).

### P2 · `cu-a2-dos-familias` · Las dos familias de cuentas
**S9:** «transitoria = la que se usa poco» (P2·6) y gasto contra costo (P2·4).

| # | tipo | título | texto | pal. · INFLESZ | VE ___ cuando ___, y eso explica ___ |
|---|---|---|---|---|---|
| 0 | [lee] | Objetivo | Al terminar, sabrás decir si una cuenta es real o nominal con una sola pregunta. | 15 · 75,5 | VE el objetivo y «Empezar», y eso explica la meta. |
| 1 | [decide] | El día después | Llega el cierre del año. ¿Cuál de estas dos cuentas sigue con su saldo al día siguiente: Caja o Ingresos por servicios? | 22 · 91,1 | VE las dos cuentas cruzar al 1 de enero, una con saldo y otra en $0, cuando elige, y eso explica que hay dos familias. |
| 2 | [lee] | Las reales | Las cuentas reales, o de balance, muestran lo que la empresa tiene, sus deudas y lo que es de los socios: activo, pasivo y patrimonio. Su saldo pasa de un año al otro. | 33 · 86,5 | VE Caja, Cuentas por pagar y Aportes sociales cruzar con su saldo cuando avanza, y eso explica por qué se llaman reales. |
| 3 | [lee] | Las nominales | Las cuentas nominales, o de resultados, nacen de lo que pasa en el periodo: ingresos, gastos y costos. Al cierre vuelven a cero. Por eso también se llaman transitorias. | 29 · 83,3 | VE Ingresos por servicios bajar a cero cuando avanza, y eso explica el nombre «transitorias». |
| 4 | [decide] | ¿Gasto o costo? | Vendes una mercancía. Lo que te costó esa mercancía, ¿es un gasto o un costo? · «Es un gasto» / «Es un costo» | 15 · 87,2 | VE el valor de la mercancía caer en el cajón «Costos» cuando decide, y eso explica que lo que costó lo vendido no es un gasto. |
| 5 | [toca] | Tres nominales | Toca cada tarjeta para ver un ejemplo del tema. **[textual]** Ingresos: «los valores que recibe una empresa por la venta de bienes o servicios». Gastos: «los desembolsos necesarios para generar los ingresos». Costos: «desembolsos capitalizables». | 9 + textual | VE la definición del libro y un ejemplo cuando voltea cada tarjeta (salarios y arriendos; costo de ventas), y eso confirma lo que decidió en P2·4. |
| 6 | [decide] | ¿Se cierra igual? | Gastos de operación se mueve casi todos los días. ¿Se cierra igual al final del año? · «Sí, se cierra» / «No, sigue abierta» | 16 · 89,8 | VE Gastos de operación, llena de movimientos, vaciarse el 31 de diciembre cuando decide, y eso explica que se cierra porque mide el año. |
| 7 | [toca] | Una sola pregunta | La pregunta que decide la familia es una sola: ¿el saldo sigue después del cierre? Si sigue, la cuenta es real. Si vuelve a cero, es nominal. Ordena estas seis. | 30 · 91,3 | VE dos cajones, «sigue» y «vuelve a cero», cuando arrastra Bancos, Maquinaria, Obligaciones financieras, Ingresos por servicios, Gastos de administración y ventas y Costo de ventas, y eso explica la regla. |

- **Pistas y devoluciones:**
  - P2·4: pista «Pista: piensa si es lo que gastaste para vender o lo que valía lo vendido.» (15 · 88,0) · devolución «Lo tomaste por un gasto. El libro lo llama costo de ventas: es lo que costó lo que vendiste.» (19 · 102,2)
  - P2·6: pista «Pista: la familia no depende de cuánto se use la cuenta.» (11 · 88,2) · devolución «Pensaste que transitoria es la que se usa poco. Se cierra porque mide el año, no por su uso.» (19 · 95,7)
- **Cierre:** «Salarios por pagar y el gasto en salarios hablan de lo mismo. ¿Por qué el primero es real y el segundo, nominal?» (22 · 91,1) → «Salarios por pagar es una deuda: sigue ahí después del cierre. El gasto mide lo del periodo y vuelve a cero.» (21 · 89,5)
- **Fidelidad:** ya no dice «todas las cuentas del mundo». Mello señaló las cuentas de orden (clases 8 y 9 del PUC); el texto nuevo no hace ninguna afirmación universal.

### P3 · `cu-a5-debe-y-haber` · El debe y el haber
**S9:** A5 ya tenía las suyas y no se pierden: el mismo lado con efectos opuestos (P3·1-2) y el préstamo que no es ganancia (P3·4, que ahora es una decisión).

| # | tipo | título | texto | pal. · INFLESZ | VE ___ cuando ___, y eso explica ___ |
|---|---|---|---|---|---|
| 0 | [lee] | Objetivo | Al terminar, sabrás por qué el mismo lado sube unas cuentas y baja otras. | 14 · 86,0 | VE el objetivo y «Empezar». |
| 1 | [decide] | Mismo lado, mismo monto | Caleja hace dos registros de $50.000, los dos en el debe: uno en Maquinaria y otro en Aportes sociales. ¿Las dos cuentas reaccionan igual? · «Sí, igual» / «No, distinto» | 24 · 75,4 | VE dos T con $50.000 en el debe cuando predice, y eso explica que la predicción se prueba enseguida. |
| 2 | [lee] | Efectos opuestos | Maquinaria pasa de $0 a $50.000. Aportes sociales baja de $400.000 a $350.000. El mismo monto y el mismo lado tienen efectos opuestos. | 23 · 66,4 | VE un saldo subir y el otro bajar cuando avanza, y eso explica que el lado solo no decide. |
| 3 | [toca] | Dónde vive cada cuenta | Cada cuenta crece por el lado en que vive dentro de la ecuación. El activo vive a la izquierda y crece por el debe. El pasivo y el patrimonio viven a la derecha y crecen por el haber. | 38 · 90,9 | VE la ecuación A = P + Pt cuando arrastra Maquinaria y Aportes sociales a su casa, y eso explica la causa. |
| 4 | [decide] | La trampa | Con un préstamo de $500, la Caja pasa de $1.000 a $1.500. ¿La empresa ganó $500? · «Sí, ganó $500» / «No, nació una deuda» | 16 · 78,1 | VE subir a la vez Caja y Documentos por pagar (cu6-pagare, p. 89) cuando decide, y eso explica que entrar plata no es ganar. |
| 5 | [toca] | Gastos e ingresos | Gastos e ingresos mueven el patrimonio. Un gasto lo baja, y por eso va al debe. Un ingreso lo sube, y va al haber. Suelta una ficha en cada uno. | 30 · 95,5 | VE el patrimonio bajar con Gastos de operación y subir con Ingresos por servicios (p. 113) cuando suelta las fichas, y eso explica el lado de cada uno. |
| 6 | [toca] | Prueba tú | Ahora prueba tú. Suelta fichas de $100, $500 y $1.000 en cualquier lado de estas cuatro cuentas y mira qué pasa con cada saldo. | 24 · 80,6 | VE moverse en vivo los cuatro saldos de la exploración actual cuando suelta fichas, y eso explica la regla en su mano. |

- **Pista y devolución:** P3·4: pista «Pista: mira qué más aparece cuando entra el préstamo.» (exento) · devolución «Viste entrar plata y pensaste en ganancia. Nace una deuda de $500: los dos lados de la ecuación suben juntos.» (20 · 81,6)
- **Cierre:** «Los dos registros eran de $50.000 en el debe. ¿Por qué Maquinaria subió y Aportes sociales bajó?» (17 · 81,1) → «Maquinaria es activo y vive a la izquierda: crece por el debe. Aportes sociales es patrimonio: vive a la derecha y baja por el debe.» (25 · 77,2)
  - Opciones, que difieren en una palabra: «Porque Maquinaria vive a la derecha» / «…a la izquierda» / «…en el haber».
  - Devolución de la a y la c: «Confundiste dónde vive con dónde se anota. El activo vive a la izquierda.»
- **Datos:** cal-3 y cal-6 salen de CALEJA, sin fecha, como los trae el repo (S10).

### P4 · `cu-a3-partida-doble` · La partida doble y las dos reglas
**S9:** «el debe siempre suma» (P4·6, el mismo pago en el debe de un pasivo y en el haber de un activo) y «asiento compuesto = descuadrado» (P4·8).

| # | tipo | título | texto | pal. · INFLESZ | VE ___ cuando ___, y eso explica ___ |
|---|---|---|---|---|---|
| 0 | [lee] | Objetivo | Al terminar, sabrás por qué todo hecho se anota dos veces y qué tiene que ser igual. | 17 · 90,9 | VE el objetivo y «Empezar». |
| 1 | [decide] | Una sola línea | Caleja compra un equipo a crédito, por $25.000. Si solo anotas el equipo, ¿los dos lados de la ecuación quedan iguales? · «Sí, quedan iguales» / «No, quedan distintos» | 21 · 74,7 | VE la balanza A \| P + Pt inclinarse cuando anota solo Equipo de computación, y eso explica que una línea desnivela. |
| 2 | [lee] | Partida doble | Mira la regla que da nombre a esta pieza: **[textual]** Partida doble: «cualquier transacción siempre se debe registrar dos veces, una vez en el debe de una cuenta y otra vez en el haber de otra cuenta». | 8 + textual (35) | VE aparecer la segunda línea, Cuentas por pagar en el haber, cuando lee la regla, y eso explica la partida doble. |
| 3 | [toca] | La balanza | Activos = Pasivos + Patrimonio. El equipo sube el activo y la deuda con el proveedor sube el pasivo. Con los dos registros, la balanza vuelve a nivel. | 28 · 76,0 | VE la balanza nivelarse cuando arrastra Cuentas por pagar a su lado, y eso explica que la igualdad viene de la ecuación. |
| 4 | [lee] | Primera regla | Primera regla: activos, gastos y costos aumentan por el debe y disminuyen por el haber. Su saldo suele quedar en el debe. | 22 · 82,6 | VE el grupo «crece por el debe» con sus tres familias cuando avanza, y eso explica la primera regla. |
| 5 | [toca] | Segunda regla | Segunda regla: pasivos, patrimonio e ingresos aumentan por el haber y disminuyen por el debe. Su saldo suele quedar en el haber. Lleva cada familia a su grupo. | 28 · 77,4 | VE rebotar al centro una familia mal puesta cuando arrastra las seis, y eso explica la segunda regla. |
| 6 | [decide] | Un pago, dos bajas | El 30 de enero, Lavado paga $400 de la hipoteca: Hipoteca por pagar va al debe y Bancos, al haber. ¿Cuál de las dos baja? · «Baja solo Bancos» / «Baja solo la hipoteca» / «Bajan las dos» | 25 · 82,2 | VE bajar las dos T cuando decide, y eso explica que el debe resta en un pasivo y el haber resta en un activo. |
| 7 | [lee] | Simple o compuesto | Un asiento simple toca dos cuentas, y uno compuesto, más de dos. En los dos, la suma del debe tiene que ser igual a la del haber. | 27 · 101,0 | VE un asiento de dos líneas y uno de cuatro, lado a lado, cuando avanza, y eso explica la diferencia. |
| 8 | [decide] | ¿Muchas cuentas descuadran? | El 3 de enero, Lavado anota cuatro cuentas: dos en el debe y dos en el haber. ¿Tener tantas cuentas lo descuadra? · «Sí, lo descuadra» / «No lo descuadra» | 22 · 85,4 | VE el contador de cada lado llegar a $10.000 cuando decide, y eso explica que se igualan las sumas, no las cuentas. |

- **Pistas y devoluciones:**
  - P4·6: pista «Pista: después de pagar, mira cuánto debes y cuánto tienes en el banco.» (13 · 88,4) · devolución de «solo Bancos»: «Pensaste que el debe siempre suma. En un pasivo, el debe resta: la hipoteca también baja.» (16 · 82,0) · devolución de «solo la hipoteca»: «Bancos es un activo y va al haber: también baja. Pagar deja menos deuda y menos plata.» (17 · 92,1)
  - P4·8: pista «Pista: suma cada lado antes de contar las cuentas.» (exento) · devolución «Creíste que un asiento compuesto viene descuadrado. Cuadra si las sumas son iguales: $10.000 y $10.000.» (16 · 66,4)
- **Cierre:** «¿Por qué un asiento con tres cuentas puede cuadrar igual que uno con dos?» (14 · 99,4) → «Porque lo que se iguala es la suma de cada lado, no el número de cuentas.» (16 · 93,5)
- **Datos:** cal-2 (el texto del repo dice «computador»; la cuenta es Equipo de computación), ene-03 y ene-30 son de Lavado (pp. 98-101).
- **Nota para Mello:** J2 de «Cuadra por valor» usa cal-2 con la cifra invertida. Que P4·1 muestre el 25.000 no da la respuesta de J2, que se resuelve sumando.

### P5 · `cu-a4-diario-y-mayor` · Del diario al mayor
**S9:** «mayorizar cambia la columna» (P5·5) y «el mayor va por fecha, no por cuenta» (P5·6).

| # | tipo | título | texto | pal. · INFLESZ | VE ___ cuando ___, y eso explica ___ |
|---|---|---|---|---|---|
| 0 | [lee] | Objetivo | Al terminar, sabrás anotar un hecho en el diario y pasarlo al mayor sin cambiar su lado. | 17 · 83,6 | VE el objetivo y «Empezar». |
| 1 | [decide] | ¿Por fecha o por cuenta? | Lavado de Autos Mateo anotó nueve hechos en enero. Quieres saber cuánto quedó en Bancos. ¿Qué te sirve más: verlos por fecha o agrupados por cuenta? · «Verlos por fecha» / «Verlos por cuenta» | 26 · 80,8 | VE los nueve asientos reordenarse según lo que elige, y eso explica que hay dos formas de ordenar los mismos datos. |
| 2 | [lee] | El diario | El libro diario anota cada hecho en orden de fecha, apenas ocurre. Por eso se le llama libro de registro de asientos originales. Sus columnas son fecha, detalle, debe y haber. | 31 · 73,9 | VE el diario con el asiento del 3 de enero cuando avanza, y eso explica sus columnas. |
| 3 | [toca] | Cómo se escribe | En el detalle va primero la cuenta del debe. Debajo, un poco a la derecha, va la del haber, con una explicación corta. | 23 · 87,0 | VE correrse a la derecha la cuenta del haber cuando toca el asiento del 1 de julio (Caja 2000 / Aportes sociales 2000), y eso explica la forma del detalle. |
| 4 | [lee] | El mayor | Después del diario viene el mayor. Allí cada cuenta tiene su propia T y junta todo lo que le pasó en el mes. **[textual]** Libro mayor: «el más importante en cualquier contabilidad». | 23 · 100,5 + textual | VE las cuatro T vacías de las cuentas del 3 de enero cuando avanza, y eso explica qué junta el mayor. |
| 5 | [toca] | Mayorizar | Mayorizar es pasar cada valor del diario a su cuenta del mayor: lo del debe al debe y lo del haber al haber. No se calcula nada nuevo. Lleva las cuatro líneas del 3 de enero. | 36 · 89,3 | VE cada valor de ene-03 viajar a su T, del mismo lado, cuando lo arrastra (si lo suelta del otro lado, rebota), y eso explica que mayorizar copia el lado. |
| 6 | [decide] | Dos preguntas | El diario responde qué pasó el 3 de enero. ¿Qué pregunta responde el mayor? · «¿Qué pasó en cada fecha?» / «¿Cómo quedó cada cuenta?» | 14 · 79,7 | VE el diario y el mayor uno junto al otro, con ene-03 encendido en los dos, cuando decide, y eso explica que son los mismos datos ordenados de dos formas. |

- **Pistas y devoluciones:**
  - P5·5: pista «Pista: mira en qué columna del diario está el valor.» (10 · 90,9) · devolución «Cambiaste la columna. Mayorizar no elige el lado: lo copia tal cual del diario.» (14 · 84,1)
  - P5·6: pista «Pista: recuerda cómo agrupa el mayor los valores.» (exento) · devolución «Le diste al mayor el orden del diario. El mayor ordena por cuenta, no por fecha.» (16 · 101,5)
- **Cierre:** «¿En cuál de los dos libros se registra primero un hecho, y por qué?» (14 · 103,8) → «En el diario. Es el registro de los asientos originales, en orden de fecha. El mayor viene después y ordena esos datos por cuenta.» (24 · 87,2)
- **Datos:** asientoDeEjemplo (1 de julio) y ene-03 (pp. 98-101).

**S12 y S13** son de forma: los cumple el componente de Erwin con el patrón de Ukyo. Aquí solo hay datos: cada pieza es su propia secuencia, con «Siguiente pieza» al final.

---

## 3 · Subtemas del Repaso diario

La lista cerrada de 12 queda como estaba. Este es el mapeo con los ids nuevos, para `src/data/contabilidadT2Subtemas.js` (#482). Lo conecta Erwin.

| actividad / etapa | tipo | subtema |
|---|---|---|
| `cu-izquierda-o-derecha` | [fijo] | Estructura de la cuenta T |
| `cu-de-que-familia` | [fijo] | Clasificación de cuentas reales |
| `cu-cuadro-dinamicas` | [fijo] | Reglas de registro por familia |
| `cu-debita-o-acredita` | [fijo] | Reglas de registro aplicadas |
| `cu-saldo-de-la-cuenta` | [fijo] | Cálculo del saldo |
| `cu-arma-el-asiento` | [fijo] | Asiento contable simple |
| `cu-asiento-compuesto` | [fijo] | Asiento compuesto |
| `cu-cuadra-por-valor` | [fijo] | Partida doble: igualdad del debe y el haber |
| `cu-del-diario-al-mayor` | [fijo] | Libro mayor y mayorización |
| `cu-las-que-vuelven-a-cero` | [regla] por `clase` | real → Clasificación de cuentas reales · nominal → Clasificación de cuentas nominales |
| `ciclo-completo:1` | [fijo] | Libro diario y asientos contables |
| `ciclo-completo:2` | [fijo] | Libro mayor y mayorización |
| `ciclo-completo:3` | [fijo] | Cálculo del saldo |
| `ciclo-completo:4` | [fijo] | Construcción del estado de situación financiera |

Los nombres de las cuatro etapas son los de `DESAFIO.pesos[].subtema`, letra por letra.

```js
// src/data/contabilidadT2Subtemas.js · T2 cuentas-debe-haber · solo se agrega
export const T2_SUBTEMAS = [
  "Estructura de la cuenta T",
  "Clasificación de cuentas reales",
  "Clasificación de cuentas nominales",
  "Reglas de registro por familia",
  "Reglas de registro aplicadas",
  "Cálculo del saldo",
  "Partida doble: igualdad del debe y el haber",
  "Asiento contable simple",
  "Asiento compuesto",
  "Libro diario y asientos contables",
  "Libro mayor y mayorización",
  "Construcción del estado de situación financiera",
];
export const T2_SUBTEMA_FIJO = {
  "cu-izquierda-o-derecha": "Estructura de la cuenta T",
  "cu-de-que-familia": "Clasificación de cuentas reales",
  "cu-cuadro-dinamicas": "Reglas de registro por familia",
  "cu-debita-o-acredita": "Reglas de registro aplicadas",
  "cu-saldo-de-la-cuenta": "Cálculo del saldo",
  "cu-arma-el-asiento": "Asiento contable simple",
  "cu-asiento-compuesto": "Asiento compuesto",
  "cu-cuadra-por-valor": "Partida doble: igualdad del debe y el haber",
  "cu-del-diario-al-mayor": "Libro mayor y mayorización",
  "ciclo-completo:1": "Libro diario y asientos contables",
  "ciclo-completo:2": "Libro mayor y mayorización",
  "ciclo-completo:3": "Cálculo del saldo",
  "ciclo-completo:4": "Construcción del estado de situación financiera",
};
export const T2_SUBTEMA_REGLA = {
  "cu-las-que-vuelven-a-cero": {
    campo: "clase",
    real: "Clasificación de cuentas reales",
    nominal: "Clasificación de cuentas nominales",
  },
};
```

---

**HUECO abiertos, todos reversibles:**
1. La página de Caleja (cal-2, cal-3 y cal-5): le toca a Mello.
2. El nombre «Gastos pagados por anticipado» en el libro: le toca a Mello.
3. «Costo de ventas» contra «Costo de mercancía vendida»: le toca a Erwin.
4. El cierre anual en lugar del mensual en «Las que vuelven a cero»: lo decidí yo, y se deshace cambiando dos campos.
