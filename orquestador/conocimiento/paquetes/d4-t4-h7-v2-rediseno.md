**T4 · H7 «Concilia la cuenta» (con H6 dentro) · versión 2: el rediseño de enganche.**
- **Este archivo es la versión vigente de H7.** Sustituye `d4-t4-h7-v1.md`, `d4-t4-h6-v1.md` y la parte de H7 de `d4-t4-h7-h8-serie2.md` y de `d4-t4-asi-se-juega-v1.md`. **H6 «¿Quién se enteró primero?» se funde aquí** (corte de Yujiro): elegir la libreta es decidir quién no tiene la partida; sus ocho partidas salen. Mismo `activity_id` (`t4-concilia-la-cuenta`, migración 0206, sin cambios) y mismos ítems (`s1-1`…`s2-9`, `saldo-banco`, `saldo-libros`). **Cambian dos cifras de la serie 1:** el cheque a Mario Sánchez (310.500) y el extracto (1.874.400).
- **Objetivo (D2, 16 oct 2026):** se ve antes de empezar, en el Encabezado compartido (su prop `objetivo`), sobre la consigna: «Conciliar llevando cada partida al lado correcto.» Texto de Katsumi (16 oct): el de antes pasaba de 8 palabras.
- Por qué: la pieza publicada en la pila fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`; diagnóstico de Shibukawa, `celula-d/shibukawa-diagnostico-enganche.md`).
- Diseño: Hanayama (`celula-d/hanayama-h7-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-hacer.md`, 15 oct 2026), copiados aquí tal cual. Aprobados por Yujiro en su corte de calidad (`celula-d/corte-calidad.md`, «Hacer que quedan» y «Texto de los Hacer»).
- El código lee estos textos de `src/data/contabilidadT4H7.js`; una prueba (`src/contabilidad/__tests__/t4-h7-*.test.mjs`) compara cada uno contra este archivo, letra por letra.
- Lo que cambia frente a la v1, para todas las piezas: `d4-t4-hacer-v2-cambios.md`.

## H7 «Concilia la cuenta» · `t4-concilia-la-cuenta` (con H6 dentro)

**Consigna** (16 pal. · INFLESZ 85,7; tope 26): Manda cada partida a la libreta que todavía no la tiene, al Más o al Menos.

Renglones a 320 y a 375: 2 (capturas; la figura queda a 181 px).

### Partidas (las mismas para H7 y para H8; el monto va aparte)

| Serie · id | Tipo · va a | Monto | Partida | Conteo | Renglones 320 / 375 (tope 4) |
|---|---|---|---|---|---|
| 1 · H7-1 | cheque · banco:menos | 184.500 | La empresa le giró un cheque a Andrés Pardo, y él todavía no lo ha cobrado. | 16 pal. · INFLESZ 85,7 | 3 / 2 |
| 1 · H7-4 | consignacion · banco:mas | 1.265.000 | El 30 de septiembre, la empresa hizo una consignación. El banco la abona al día siguiente. | 16 pal. · INFLESZ 70,3 | 3 / 3 |
| 1 · H7-5 | nc · libros:mas | 528.000 | La clienta Gloria Ruiz pagó su factura: consignó la plata directo en el banco. | 14 pal. · INFLESZ 81,6 | 3 / 2 |
| 1 · H7-7 | nd · libros:menos | 38.900 | El banco le cobró a la empresa una chequera. | 9 pal. | 2 / 2 |
| 1 · H7-2 | cheque · banco:menos | 92.700 | La empresa le giró un cheque a Lucía Ortiz, y ella todavía no lo ha cobrado. | 16 pal. · INFLESZ 77,9 | 3 / 2 |
| 1 · H7-6 | nc · libros:mas | 61.200 | El banco abonó en la cuenta los intereses de una inversión de la empresa. | 14 pal. · INFLESZ 77,1 | 3 / 3 |
| 1 · H7-8 | nd · libros:menos | 127.400 | El banco le cobró a la empresa los intereses de un sobregiro. | 12 pal. · INFLESZ 80,6 | 2 / 2 |
| 1 · H7-3 | cheque · banco:menos | 310.500 | La empresa le giró un cheque a Mario Sánchez, y él todavía no lo ha cobrado. | 16 pal. · INFLESZ 85,7 | 3 / 2 |
| 1 · H7-9 | nd · libros:menos | 356.000 | El banco devolvió el cheque con el que el cliente Pedro Silva había pagado. | 14 pal. · INFLESZ 81,6 | 3 / 2 |
| 2 · H7-1 | cheque · banco:menos | 265.300 | La empresa le giró un cheque a Carolina Méndez, y ella todavía no lo ha cobrado. | 16 pal. · INFLESZ 74 | 3 / 2 |
| 2 · H7-4 | consignacion · banco:mas | 947.500 | El 31 de octubre, la empresa hizo una consignación. El banco la abona al día siguiente. | 16 pal. · INFLESZ 70,3 | 3 / 3 |
| 2 · H7-5 | nc · libros:mas | 713.400 | El cliente Tomás Acosta pagó su factura: consignó la plata directo en el banco. | 14 pal. · INFLESZ 72,7 | 3 / 3 |
| 2 · H7-7 | nd · libros:menos | 46.200 | El banco le cobró a la empresa una chequera. | 9 pal. | 2 / 2 |
| 2 · H7-2 | cheque · banco:menos | 118.900 | La empresa le giró un cheque a Felipe Rojas, y él todavía no lo ha cobrado. | 16 pal. · INFLESZ 81,8 | 3 / 2 |
| 2 · H7-6 | nc · libros:mas | 84.700 | El banco abonó en la cuenta los intereses de una inversión de la empresa. | 14 pal. · INFLESZ 77,1 | 3 / 3 |
| 2 · H7-8 | nd · libros:menos | 173.800 | El banco le cobró a la empresa los intereses de un sobregiro. | 12 pal. · INFLESZ 80,6 | 2 / 2 |
| 2 · H7-3 | cheque · banco:menos | 402.600 | La empresa le giró un cheque a Natalia Vega, y ella todavía no lo ha cobrado. | 16 pal. · INFLESZ 77,9 | 3 / 2 |
| 2 · H7-9 | nd · libros:menos | 291.500 | El banco devolvió el cheque con el que la clienta Sofía Cárdenas había pagado. | 14 pal. · INFLESZ 72,7 | 3 / 2 |

H7-9 (cheque devuelto) ocupaba 5 renglones; ahora ocupa los de la tabla.

**Rótulos:** el par «el banco» y «los libros»; las libretas «El banco · extracto» y «Los libros · de la empresa», con «Más» y «Menos»; los campos «Saldo conciliado del banco» y «Saldo conciliado de los libros». Todos aprobados; sin cambios.

**Marcas:** en las secciones, «✓ Correcto», «✗ No va aquí» e «Iba aquí» (las de H1). En los **campos de cifra**, las mismas, «✓ Correcto» y «✗ No va aquí», y bajo cada campo errado, a los 0,7 s, «Iba aquí: {valor}» con el saldo conciliado ($1.240.000): la fase 2 no tiene reintento (prompt maestro §4.2; lote de Katsumi, 16 oct).

### Devoluciones de la fase 1 (por tipo de partida)

Pie: «Basado en el libro, p. 190. Cifras construidas». Los errores son los del paquete.

| Tipo | Caso | Texto | Conteo |
|---|---|---|---|
| cheque | Acierto | Correcto. La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando lo cobren, va a salir: se le resta al saldo del banco. | 27 pal. · INFLESZ 98,6 |
| cheque | Si va a banco:mas | Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir. | 21 pal. · INFLESZ 89,5 |
| cheque | Si va a libros:menos | Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces. | 19 pal. · INFLESZ 89,1 |
| cheque | Si va a libros:mas | Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar. | 18 pal. · INFLESZ 90,5 |
| consignacion | Acierto | Correcto. La empresa ya la anotó, y el banco la va a abonar. Esa plata va a entrar: se le suma al saldo del banco. | 25 pal. · INFLESZ 98,8 |
| consignacion | Si va a banco:menos | Restarla del banco sería decir que esa plata va a salir. Pero la empresa la llevó al banco: va a entrar. | 21 pal. · INFLESZ 89,5 |
| consignacion | Si va a libros:mas | Los libros ya la sumaron el día que se consignó. Sumarla otra vez sería contarla dos veces. | 17 pal. · INFLESZ 84,7 |
| consignacion | Si va a libros:menos | Los libros ya tienen esta consignación, y restarla la borraría. La plata sí se consignó. | 15 pal. · INFLESZ 78,9 |
| nc | Acierto | Correcto. Es una nota crédito del banco: el banco ya sumó esa plata y los libros todavía no. Se le suma al saldo de los libros. | 26 pal. · INFLESZ 92,7 |
| nc | Si va a libros:menos | Restar sería decir que la empresa perdió esa plata. Una nota crédito del banco hace lo contrario. | 17 pal. · INFLESZ 73,7 |
| nc | Si va a banco:mas | El banco ya tiene esta nota: fue él quien la hizo. Sumarla en su lado sería contarla dos veces. | 19 pal. · INFLESZ 92,4 |
| nc | Si va a banco:menos | El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros. | 19 pal. · INFLESZ 95,7 |
| nd | Acierto | Correcto. Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros. | 32 pal. · INFLESZ 93 |
| nd | Si va a libros:mas | Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario. | 20 pal. · INFLESZ 84,7 |
| nd | Si va a banco:menos | El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces. | 19 pal. · INFLESZ 92,4 |
| nd | Si va a banco:mas | El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros. | 19 pal. · INFLESZ 95,7 |

### Fase 2, los saldos

Pie: «Formato y signos del libro, p. 190. Cifras construidas». Botón «Comprobar»; aviso «Escribe los dos saldos antes de comprobar.» (no gasta el intento). Lector del par: «El banco: {x}. Los libros: {y}.», y «Son iguales.» solo si lo son.

| Serie | Lo que escribe | Texto | Conteo |
|---|---|---|---|
| 1 | Los dos, 2.551.700 | Correcto. Los dos saldos dan lo mismo. Nadie se equivocó: a cada lado le faltaba anotar algo. | 17 pal. · INFLESZ 83,9 |
| 1 | Los dos iguales, pero otra cifra | Los dos lados coinciden entre sí, pero la cuenta no es la del ejercicio. Repasa las sumas. | 17 pal. · INFLESZ 92,1 |
| 1 | Banco = 1.197.100 | Ese saldo resta lo que va a entrar y suma lo que va a salir. Mira cada partida del banco. | 20 pal. · INFLESZ 100,3 |
| 1 | Banco = 3.139.400 | A ese saldo le faltan los cheques que nadie ha cobrado. Esa plata ya está comprometida. | 16 pal. · INFLESZ 82 |
| 1 | Banco = 1.286.700 | A ese saldo le falta la consignación del 30. Esa plata ya es de la empresa. | 16 pal. · INFLESZ 89,8 |
| 1 | Libros = 2.417.900 | Ese saldo resta lo que el banco abonó y suma lo que el banco cobró. Mira qué hace cada nota. | 20 pal. · INFLESZ 94,0 |
| 1 | Libros = 3.074.000 | A ese saldo le faltan las notas débito del banco: la plata que el banco ya cobró. | 17 pal. · INFLESZ 90,9 |
| 1 | Libros = 1.962.500 | A ese saldo le faltan las notas crédito del banco: la plata que el banco ya abonó. | 17 pal. · INFLESZ 87,2 |
| 1 | Cualquier otra | Tu cuenta se saltó una partida o la sumó cuando restaba. Repasa el Más y el Menos de cada libreta. | 20 pal. · INFLESZ 87,8 |
| 2 | Los dos, 3.377.500 | Correcto. Los dos saldos dan lo mismo. Nadie se equivocó: a cada lado le faltaba anotar algo. | 17 pal. · INFLESZ 83,9 |
| 2 | Los dos iguales, pero otra cifra | Los dos lados coinciden entre sí, pero la cuenta no es la del ejercicio. Repasa las sumas. | 17 pal. · INFLESZ 92,1 |
| 2 | Banco = 3.056.100 | Ese saldo resta lo que va a entrar y suma lo que va a salir. Mira cada partida del banco. | 20 pal. · INFLESZ 100,3 |
| 2 | Banco = 4.164.300 | A ese saldo le faltan los cheques que nadie ha cobrado. Esa plata ya está comprometida. | 16 pal. · INFLESZ 82 |
| 2 | Banco = 2.430.000 | A ese saldo le falta la consignación del 31. Esa plata ya es de la empresa. | 16 pal. · INFLESZ 89,8 |
| 2 | Libros = 2.804.300 | Ese saldo resta lo que el banco abonó y suma lo que el banco cobró. Mira qué hace cada nota. | 20 pal. · INFLESZ 94,0 |
| 2 | Libros = 3.889.000 | A ese saldo le faltan las notas débito del banco: la plata que el banco ya cobró. | 17 pal. · INFLESZ 90,9 |
| 2 | Libros = 2.579.400 | A ese saldo le faltan las notas crédito del banco: la plata que el banco ya abonó. | 17 pal. · INFLESZ 87,2 |
| 2 | Cualquier otra | Tu cuenta se saltó una partida o la sumó cuando restaba. Repasa el Más y el Menos de cada libreta. | 20 pal. · INFLESZ 87,8 |

«Mira en la tabla… y vuelve a hacer la cuenta» pasa a «Mira en las libretas qué suma y qué resta en cada lado»: ya no hay tabla, y con un intento no se vuelve a hacer.

### Botones, cierre

- «Siguiente paso» (entre partidas y hacia los saldos: el contador dice «Paso n de 10»), «Comprobar», «Ver mi resumen», «Otra vez» (prompt maestro §4.3; lote de Katsumi, 16 oct).
- **Resumen:** «N de 9 partidas al primer toque.»
- **Cierre, serie 1** (23 pal. · INFLESZ 81,6): El saldo del banco y el de los libros dan $2.551.700. Ese es el saldo verdadero de la cuenta de Comercializadora Los Cerezos.
- **Cierre, serie 2** (23 pal. · INFLESZ 87): El saldo del banco y el de los libros dan $3.377.500. Ese es el saldo verdadero de la cuenta de Distribuidora El Mirador.
- **Pie del cierre:** «Formato y signos del libro, p. 190. Cifras construidas»

### «Así se juega»

| Lugar | Texto | Conteo |
|---|---|---|
| Paso 1 | Lee la partida. | 3 pal. |
| Paso 2 | ¿Quién no la tiene todavía? | 5 pal. |
| Paso 3 | Si suma, al Más; si resta, al Menos. | 8 pal. |
| Ejemplo (partida, 12.000; el par de la demo: el banco 640.000, los libros 652.000) | El banco le descontó a la empresa la comisión por manejar la cuenta. | 13 pal. · INFLESZ 83,6 |
| Acierto del ejemplo (Menos de los libros) | Correcto. El banco ya la descontó, y los libros todavía no: va al Menos de los libros. | 17 pal. · INFLESZ 95,7 |
| Texto alternativo (`alt`) | El banco descontó una comisión de $12.000. Los libros todavía no la tienen, así que la partida va al Menos de los libros. | 23 pal. · INFLESZ 84,3 |

El par de la demo lleva cifras propias, construidas: con las de la serie, la demo mostraría los datos de la partida.

### Medido (sonda)

- **H7, 320 px** (48 estados medidos): **30 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **H7, 375 px** (48 estados medidos): **30 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **Así se juega, 320 px** (2 estados medidos): **36 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)
- **Así se juega, 375 px** (2 estados medidos): **36 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)

**Página:** p. 190 (la presentación de la conciliación y sus signos). Todo construido.

Las cifras de las dos series (y la prueba de que solo los signos correctos llegan al saldo conciliado) están en `d4-t4-hacer-v2-cambios.md`, «Cifras».
