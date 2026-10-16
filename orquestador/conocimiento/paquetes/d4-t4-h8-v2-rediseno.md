**T4 · H8 «¿Se asienta o no?» · versión 2: el rediseño de enganche.**
- **Este archivo es la versión vigente de H8.** Sustituye `d4-t4-h8-v1.md`, la parte de H8 de `d4-t4-h7-h8-serie2.md` y la de `d4-t4-asi-se-juega-v1.md`. Mismo `activity_id` (`t4-se-asienta-o-no`, migración 0207, que ya corrió en producción y no cambia) y mismos ítems (`s1-1`…, `asiento-s1-5`…, `saldo-mayor`). Con las cifras nuevas de la serie 1 (las de `d4-t4-h7-v2-rediseno.md`), el mayor solo llega a 2.551.700 con todas las decisiones buenas.
- **Objetivo (D2, 16 oct 2026):** se ve antes de empezar, en el Encabezado compartido (su prop `objetivo`), sobre la consigna: «Elegir qué partidas de la conciliación se asientan, armar los asientos y llegar al saldo del mayor.»
- **Lote B (16 oct 2026), Katsumi:** en los aciertos H7-7 y H7-8 el «:» pasa a punto («La chequera es un gasto. …», «Los intereses de sobregiro son un gasto. …»); sin «Correcto.» suben de 63,8 y 63,1 a 70,8 y 70,6.
- Por qué: la pieza publicada en la pila fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`; diagnóstico de Shibukawa, `celula-d/shibukawa-diagnostico-enganche.md`).
- Diseño: Hanayama (`celula-d/hanayama-h8-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-hacer.md`, 15 oct 2026), copiados aquí tal cual. Aprobados por Yujiro en su corte de calidad (`celula-d/corte-calidad.md`, «Hacer que quedan» y «Texto de los Hacer»).
- El código lee estos textos de `src/data/contabilidadT4H8.js`; una prueba (`src/contabilidad/__tests__/t4-h8-*.test.mjs`) compara cada uno contra este archivo, letra por letra.
- Lo que cambia frente a la v1, para todas las piezas: `d4-t4-hacer-v2-cambios.md`.

## H8 «¿Se asienta o no?» · `t4-se-asienta-o-no`

**Consigna** (14 pal. · INFLESZ 72,7; tope 25, mejor en 2 renglones): Decide qué partidas se asientan, arma cada asiento y saca el saldo del mayor.

Renglones a 320 y a 375: 2 (capturas; la figura queda a 181 px).

**Partidas:** las de H7 (tabla de arriba), en las etapas 1 y 2.

**Rótulos de etapa** (sin contador desde el bloque P2 de Hanayama, §5.1: el contador es «Paso n de 15»; Sora 600 14 #F8F9FA): «¿Se asienta?» · «Los asientos» · «El mayor».

**Bandejas** (renglones fijos de Hanayama, los apruebo): «Se asienta / en los libros» y «No se asienta / lo arregla / el banco».

**Cuentas del tablero** (renglones fijos, sin cambios): «Bancos» · «Cuentas por cobrar – clientes» · «Ingresos por intereses» · «Gastos financieros – chequera» · «Gasto interés». *«Caja» salió con el bloque P2 de Hanayama (⛔3, decisión de Yujiro, 16 oct): con seis cuentas, a 320×568 las marcas de arriba quedaban fuera de la ventana, y ninguna nota del banco toca Caja.*

**Mayor:** «Bancos · 30 de septiembre» (serie 2: «Bancos · 31 de octubre»), primera línea «Saldo» con el saldo de los libros, pie «Saldo». **Campo:** «Saldo de Bancos en el mayor». **Par:** «los libros» antes del acierto; «el mayor» = «el banco» con él.

**Lector del par** (texto pendiente, ya puesto): antes del acierto «Los libros: {y}.»; con el acierto «El banco: {x}. El mayor: {y}. Son iguales.».

**Marcas:** bandejas y mitades como en H7 («✓ Correcto», «✗ No va aquí», «Iba aquí»); el saldo al pie del mayor, «✓ Correcto» o «✗ No va aquí», y con el error, a los 0,7 s, «Iba aquí: {valor}» bajo el campo, con el saldo del mayor ($1.240.000): la etapa 3 no tiene reintento (prompt maestro §4.2; decisión de Yujiro, 16 oct).

### Etapa 1 · ¿Se asienta? (por tipo; pie: «Basado en el libro, p. 190. Cifras construidas»)

| Tipo | Va a | Acierto | Error |
|---|---|---|---|
| cheque | no-se-asienta | Correcto. La empresa ya lo anotó al girarlo. Que el banco todavía no lo haya pagado no cambia nada en sus libros. (22 pal. · INFLESZ 86,2) | Asentarlo otra vez lo dejaría anotado dos veces en los libros. Piensa en qué le falta a la empresa, no al banco. (22 pal. · INFLESZ 85,4) |
| consignacion | no-se-asienta | Correcto. La empresa la anotó el día que consignó. Al banco le falta abonarla, pero eso no se corrige en los libros de la empresa. (25 pal. · INFLESZ 83,9) | Esa consignación ya está en los libros de la empresa. Lo que falta es del lado del banco, y el banco lo hará solo. (24 pal. · INFLESZ 96,2) |
| nc | se-asienta | Correcto. El banco ya sumó esa plata, y los libros de la empresa todavía no la tienen. Por eso se asienta. (21 pal. · INFLESZ 90,1) | Si no se asienta, los libros de la empresa se quedan sin una plata que ya está en su cuenta. (20 pal. · INFLESZ 93,4) |
| nd | se-asienta | Correcto. El banco ya le quitó esa plata a la empresa, y sus libros todavía no lo saben. Por eso se asienta. (22 pal. · INFLESZ 91,9) | Si no se asienta, los libros de la empresa siguen contando una plata que el banco ya le quitó. (19 pal. · INFLESZ 86,2) |

### Etapa 2 · Los asientos (pie: «Basado en el libro, p. 191. Cifras construidas»)

Orden de las reglas (paquete): sin Bancos; Bancos al lado contrario; la cuenta; lados al revés. Las 19 combinaciones equivocadas de cada asiento caen en una regla con mensaje (script).

| Regla | Nota crédito | Nota débito |
|---|---|---|
| Sin Bancos | La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse. (22 pal. · INFLESZ 91,1) | La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse. (22 pal. · INFLESZ 91,1) |
| Bancos al lado contrario | Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja? (19 pal. · INFLESZ 95,7) | Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja? (19 pal. · INFLESZ 95,7) |

**Serie 1**

| Partida | Caso | Texto | Conteo |
|---|---|---|---|
| H7-5 | Acierto (Bancos / Cuentas por cobrar – clientes) | Correcto. La plata entró al banco, así que Bancos se debita. Y Gloria Ruiz ya no debe esa factura: Cuentas por cobrar – clientes se acredita. | 25 pal. · INFLESZ 86,4 |
| | Usó Ingresos por intereses | Esa cuenta es para lo que rinde una inversión. Aquí un cliente pagó una factura que debía. | 17 pal. · INFLESZ 77,4 |
| | Usó Gastos financieros – chequera | Gloria Ruiz pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió con ese pago. | 20 pal. · INFLESZ 90,9 |
| | Usó Gasto interés | Aquí nadie pagó intereses: un cliente pagó una factura que debía. Piensa en qué cambió con ese pago. | 18 pal. · INFLESZ 73,2 |
| | Lados al revés | Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. Lo que debe el cliente baja, así que va al haber. | 25 pal. · INFLESZ 103,8 |
| H7-6 | Acierto (Bancos / Ingresos por intereses) | Correcto. La plata entró al banco: Bancos va al debe. Y es lo que ganó la empresa: Ingresos por intereses va al haber. | 23 pal. · INFLESZ 93,5 |
| | Usó Cuentas por cobrar – clientes | Nadie le debía esto a la empresa: es lo que rindió su inversión. Es un ingreso. | 16 pal. · INFLESZ 93,7 |
| | Usó Gasto interés | Esos intereses los ganó la empresa, no los pagó. Un interés ganado es un ingreso. | 15 pal. · INFLESZ 78,9 |
| | Usó Gastos financieros – chequera | Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana. | 24 pal. · INFLESZ 96,2 |
| | Lados al revés | Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. El ingreso va al haber. | 19 pal. · INFLESZ 102,1 |
| H7-7 | Acierto (Gastos financieros – chequera / Bancos) | Correcto. La chequera es un gasto. Gastos financieros – chequera se debita y Bancos se acredita. | 15 pal. · INFLESZ 68,9 |
| | Usó Gasto interés | Una chequera no es un interés: es lo que cobra el banco por los cheques. Tiene su propia cuenta de gasto. | 21 pal. · INFLESZ 98,4 |
| | Usó Cuentas por cobrar – clientes | Ningún cliente tiene que ver aquí: el banco cobró por un servicio suyo. Es un gasto de la empresa. | 19 pal. · INFLESZ 92,4 |
| | Usó Ingresos por intereses | La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga. | 22 pal. · INFLESZ 93,9 |
| | Lados al revés | Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber. | 19 pal. · INFLESZ 105,4 |
| H7-8 | Acierto (Gasto interés / Bancos) | Correcto. Los intereses de sobregiro son un gasto. Gasto interés se debita y Bancos se acredita. | 16 pal. · INFLESZ 69,1 |
| | Usó Ingresos por intereses | Estos intereses los cobró el banco, no los ganó la empresa. Un interés que se paga es un gasto. | 19 pal. · INFLESZ 92,4 |
| | Usó Gastos financieros – chequera | Esa cuenta es la del cobro de la chequera. Esto es un interés, y tiene su propia cuenta. | 18 pal. · INFLESZ 97,5 |
| | Usó Cuentas por cobrar – clientes | El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga. | 23 pal. · INFLESZ 78,9 |
| | Lados al revés | Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber. | 19 pal. · INFLESZ 105,4 |
| H7-9 | Acierto (Cuentas por cobrar – clientes / Bancos) | Correcto. El pago de Pedro Silva nunca llegó, así que vuelve a deber: Cuentas por cobrar – clientes se debita y Bancos se acredita. | 23 pal. · INFLESZ 81,6 |
| | Usó Gastos financieros – chequera | La empresa no perdió esa plata: Pedro Silva todavía la debe. Su deuda vuelve a subir. | 16 pal. · INFLESZ 82 |
| | Usó Gasto interés | La empresa no perdió esa plata: Pedro Silva todavía la debe. Su deuda vuelve a subir. | 16 pal. · INFLESZ 82 |
| | Usó Ingresos por intereses | Aquí no entra nada: el banco devolvió un cheque. Lo que sube es lo que el cliente debe. | 18 pal. · INFLESZ 97,5 |
| | Lados al revés | Las cuentas están bien, pero al revés. Lo que debe el cliente sube, así que va al debe. Bancos baja, así que va al haber. | 25 pal. · INFLESZ 103,8 |

**Serie 2**

| Partida | Caso | Texto | Conteo |
|---|---|---|---|
| H7-5 | Acierto (Bancos / Cuentas por cobrar – clientes) | Correcto. La plata entró al banco, así que Bancos se debita. Y Tomás Acosta ya no debe esa factura: Cuentas por cobrar – clientes se acredita. | 25 pal. · INFLESZ 81,4 |
| | Usó Ingresos por intereses | Esa cuenta es para lo que rinde una inversión. Aquí un cliente pagó una factura que debía. | 17 pal. · INFLESZ 77,4 |
| | Usó Gastos financieros – chequera | Tomás Acosta pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió con ese pago. | 20 pal. · INFLESZ 84,7 |
| | Usó Gasto interés | Aquí nadie pagó intereses: un cliente pagó una factura que debía. Piensa en qué cambió con ese pago. | 18 pal. · INFLESZ 73,2 |
| | Lados al revés | Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. Lo que debe el cliente baja, así que va al haber. | 25 pal. · INFLESZ 103,8 |
| H7-6 | Acierto (Bancos / Ingresos por intereses) | Correcto. La plata entró al banco: Bancos va al debe. Y es lo que ganó la empresa: Ingresos por intereses va al haber. | 23 pal. · INFLESZ 93,5 |
| | Usó Cuentas por cobrar – clientes | Nadie le debía esto a la empresa: es lo que rindió su inversión. Es un ingreso. | 16 pal. · INFLESZ 93,7 |
| | Usó Gasto interés | Esos intereses los ganó la empresa, no los pagó. Un interés ganado es un ingreso. | 15 pal. · INFLESZ 78,9 |
| | Usó Gastos financieros – chequera | Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana. | 24 pal. · INFLESZ 96,2 |
| | Lados al revés | Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. El ingreso va al haber. | 19 pal. · INFLESZ 102,1 |
| H7-7 | Acierto (Gastos financieros – chequera / Bancos) | Correcto. La chequera es un gasto. Gastos financieros – chequera se debita y Bancos se acredita. | 15 pal. · INFLESZ 68,9 |
| | Usó Gasto interés | Una chequera no es un interés: es lo que cobra el banco por los cheques. Tiene su propia cuenta de gasto. | 21 pal. · INFLESZ 98,4 |
| | Usó Cuentas por cobrar – clientes | Ningún cliente tiene que ver aquí: el banco cobró por un servicio suyo. Es un gasto de la empresa. | 19 pal. · INFLESZ 92,4 |
| | Usó Ingresos por intereses | La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga. | 22 pal. · INFLESZ 93,9 |
| | Lados al revés | Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber. | 19 pal. · INFLESZ 105,4 |
| H7-8 | Acierto (Gasto interés / Bancos) | Correcto. Los intereses de sobregiro son un gasto. Gasto interés se debita y Bancos se acredita. | 16 pal. · INFLESZ 69,1 |
| | Usó Ingresos por intereses | Estos intereses los cobró el banco, no los ganó la empresa. Un interés que se paga es un gasto. | 19 pal. · INFLESZ 92,4 |
| | Usó Gastos financieros – chequera | Esa cuenta es la del cobro de la chequera. Esto es un interés, y tiene su propia cuenta. | 18 pal. · INFLESZ 97,5 |
| | Usó Cuentas por cobrar – clientes | El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga. | 23 pal. · INFLESZ 78,9 |
| | Lados al revés | Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber. | 19 pal. · INFLESZ 105,4 |
| H7-9 | Acierto (Cuentas por cobrar – clientes / Bancos) | Correcto. El pago de Sofía Cárdenas nunca llegó, así que vuelve a deber: Cuentas por cobrar – clientes se debita y Bancos se acredita. | 23 pal. · INFLESZ 76,2 |
| | Usó Gastos financieros – chequera | La empresa no perdió esa plata: Sofía Cárdenas todavía la debe. Su deuda vuelve a subir. | 16 pal. · INFLESZ 74,2 |
| | Usó Gasto interés | La empresa no perdió esa plata: Sofía Cárdenas todavía la debe. Su deuda vuelve a subir. | 16 pal. · INFLESZ 74,2 |
| | Usó Ingresos por intereses | Aquí no entra nada: el banco devolvió un cheque. Lo que sube es lo que el cliente debe. | 18 pal. · INFLESZ 97,5 |
| | Lados al revés | Las cuentas están bien, pero al revés. Lo que debe el cliente sube, así que va al debe. Bancos baja, así que va al haber. | 25 pal. · INFLESZ 103,8 |

### Etapa 3 · El mayor (pie: «Basado en el libro, pp. 190-191. Cifras construidas»)

| Serie | Lo que escribe | Texto | Conteo |
|---|---|---|---|
| 1 | 2.551.700 | Correcto. Y fíjate: el extracto decía $1.874.400. Si le sumas la consignación pendiente y le restas los cheques sin cobrar, también da $2.551.700. Es el saldo conciliado: los libros ya dicen la verdad. | 33 pal. · INFLESZ 81,5 |
| 1 | 3.074.000 | Ese saldo tiene las notas crédito, pero no las débito. Al mayor le falta lo que el banco descontó. | 19 pal. · INFLESZ 89,1 |
| 1 | 1.962.500 | Ese saldo tiene las notas débito, pero no las crédito. Al mayor le falta lo que el banco abonó. | 19 pal. · INFLESZ 89,1 |
| 1 | 3.229.000 | Ese saldo mete partidas que la empresa ya tenía. Al mayor solo entran las notas del banco. | 17 pal. · INFLESZ 84,7 |
| 1 | Cualquier otra | Tu saldo se saltó un asiento o lo puso del otro lado. Repasa el debe y el haber del mayor. | 20 pal. · INFLESZ 97,2 |
| 2 | 3.377.500 | Correcto. Y fíjate: el extracto decía $3.216.800. Si le sumas la consignación pendiente y le restas los cheques sin cobrar, también da $3.377.500. Es el saldo conciliado: los libros ya dicen la verdad. | 33 pal. · INFLESZ 81,5 |
| 2 | 3.889.000 | Ese saldo tiene las notas crédito, pero no las débito. Al mayor le falta lo que el banco descontó. | 19 pal. · INFLESZ 89,1 |
| 2 | 2.579.400 | Ese saldo tiene las notas débito, pero no las crédito. Al mayor le falta lo que el banco abonó. | 19 pal. · INFLESZ 89,1 |
| 2 | 3.538.200 | Ese saldo mete partidas que la empresa ya tenía. Al mayor solo entran las notas del banco. | 17 pal. · INFLESZ 84,7 |
| 2 | Cualquier otra | Tu saldo se saltó un asiento o lo puso del otro lado. Repasa el debe y el haber del mayor. | 20 pal. · INFLESZ 97,2 |

### Botones, avisos, cierre

- «Siguiente paso» (los cuatro avances: el contador dice «Paso n de 15»), «Comprobar» (etapas 2 y 3), «Ver mi resumen», «Otra vez» (prompt maestro §4.3; lote de Katsumi, 16 oct). Avisos: «Pon una cuenta al debe y la otra al haber.» y «Escribe el saldo antes de comprobar.»; no gastan el intento.
- **Resumen:** «N de 15 al primer intento.»
- **Cierre** (25 pal. · INFLESZ 89,7): La empresa no corrige lo que el banco no sabe: eso lo arregla el tiempo. Corrige lo que ella no sabía: las notas del banco.
- **Pie del cierre:** «Basado en el libro, pp. 190-191. Cifras construidas»

### «Así se juega»

| Lugar | Texto | Conteo |
|---|---|---|
| Paso 1 | ¿Les falta a los libros? | 5 pal. |
| Paso 2 | Si les falta, se asienta. | 5 pal. |
| Paso 3 | El mayor da el saldo final. | 6 pal. |
| Ejemplo (partida, 50.000) | La empresa giró un cheque, y nadie lo ha cobrado todavía. | 11 pal. · INFLESZ 76,9 |
| Acierto del ejemplo («No se asienta») | Correcto. La empresa ya lo anotó al girarlo: a sus libros no les falta nada. | 15 pal. · INFLESZ 91,3 |
| Texto alternativo (`alt`) | Un cheque de $50.000 que nadie ha cobrado va a «No se asienta», porque la empresa ya lo anotó al girarlo. | 21 pal. · INFLESZ 79 |

Los pasos del paquete («Primero, decide qué partidas se asientan.»…) repetían la consigna nueva casi palabra por palabra (B5). Los reescribí, y los de las cuatro piezas son más cortos que los del paquete para que lleguen menos palabras antes del ejemplo.

### Medido (sonda)

- **H8, 320 px** (68 estados medidos): **29 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **H8, 375 px** (68 estados medidos): **29 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **Así se juega, 320 px** (2 estados medidos): **34 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)
- **Así se juega, 375 px** (2 estados medidos): **34 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)

**Páginas:** p. 190 (qué se asienta: solo lo que afecta los libros de la empresa), p. 191 (los asientos de ajuste y el mayor de Bancos). Todo construido.
