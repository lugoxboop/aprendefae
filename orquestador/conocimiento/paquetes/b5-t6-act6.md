# b5-t6-act6 · «Provisión por edades» · paquete

Célula B · T6 · Hacer · `b5-t6-a6`. Mecánica de casillas en orden, la de b5-t6-a5. Escenario simulado: rótulo fijo, registro de cifras construidas y lista negra (Sakuta).

Lo que ve el estudiante sale de aquí, letra por letra. Precedencia (Sakuta): la versión de Futaba de abajo; la auditoría de Shoko y la hoja corta de Mai, cuando lleguen, mandan sobre ella y se añaden como secciones nuevas.

## (0) Decisiones

- FP y dificultad, de Sakuta: difícil · 50 FP.
- Lo que no se pinta: las cifras de legibilidad («Estim.» y las que van entre paréntesis), las columnas «Pág.» y las notas de trabajo de Futaba (las que empiezan «Sobre …»), la «Comprobación», el «Inventario por estados» y el «Kit».
- Del texto pegado se quitaron las líneas de la interfaz del chat.

## (1) Futaba · versión entregada (pegada tal cual)

b5-t6-a6 · «Provisión por edades». Casillas en orden: primero se ubican tres deudas en su grupo y después se calcula cada provisión, el total y el valor neto. Caso construido NUEVO con 5/10/15 % del Decreto, rótulo «Escenario simulado · no es la tabla del libro», cifras cruzadas contra el capítulo y contra T6 A5. Difícil.

b5-t6-a6 · «Provisión por edades»

Patrón: casillas en orden, como a5, con 8 casillas. Dificultad propuesta: difícil: hay que ubicar cada deuda en su grupo, incluido un caso en el límite, y después calcular.

Rótulo fijo en pantalla: «Escenario simulado · no es la tabla del libro».

Pies de fuente:

En los porcentajes: «Fuente del porcentaje: Decreto 1625 de 2016».
En las cifras y en la decisión de usar esos porcentajes: «Escenario simulado».

Cruce de cifras. Busqué las 10 cifras correctas (1.400.000, 620.000, 560.000, 160.000, 60.000, 28.000, 16.000, 9.000, 53.000 y 1.347.000) en tres lugares:

todo el capítulo, con OCR;
las tablas de las pp. 201 y 269, a mano;
las cifras de T6 A5.

Ninguna aparece. Cinco distractores sí aparecen en el libro como cifras sueltas de otros temas: 2.800, 8.000, 24.000, 6.000 y 84.000. Son opciones erradas, así que no le regalan ningún resultado a nadie.

Campo	Texto literal	Estim.
Consigna	Ubica cada deuda en su grupo y calcula la provisión.	<10
Regla fija (tabla)	Vigentes o hasta 3 meses: 0 % · Más de 3 hasta 6 meses: 5 % · Más de 6 meses hasta 1 año: 10 % · Más de 1 año: 15 %	—
Nota bajo la regla	En este ejemplo, la empresa usa como suyos los porcentajes de la norma de renta.	76
Así se juega, 1	Primero, ubica cada deuda en su grupo según los meses que lleva vencida.	74
Así se juega, 2	Después, calcula la provisión de cada grupo, el total y el valor neto.	84
Así se juega, 3	Cada casilla tiene un solo intento. Si te equivocas, verás la razón y el valor correcto.	78
Tutorial	Una deuda lleva nueve meses vencida: va en el grupo de más de seis meses hasta un año, al 10 %.	84
Datos de la parte 2 (tabla)	Lo que deben los clientes al 31 de diciembre: $1.400.000 · Vigentes o hasta 3 meses: $620.000 · Más de 3 hasta 6 meses: $560.000 · Más de 6 meses hasta 1 año: $160.000 · Más de 1 año: $60.000	—
Cierre	Primero se ubica cada deuda en su grupo por los meses que lleva vencida. Después, cada grupo con su porcentaje, y la suma es la provisión.	84
Texto alternativo	Actividad de casillas. Primero ubicas tres deudas en su grupo según los meses que llevan vencidas. Después calculas la provisión de tres grupos, el total y el valor neto. Tienes un intento por casilla; si fallas, se muestra la razón y el valor correcto.	83
Parte 1 · Ubicar la deuda

Las opciones son los cuatro grupos de la regla.

#	Enunciado	✓	Error si elige otro
1	Una deuda lleva 2 meses vencida.	Vigentes o hasta 3 meses	G1 si elige «más de 3 hasta 6» · G0 si elige cualquier otro
2	Una deuda lleva exactamente 6 meses vencida.	Más de 3 hasta 6 meses	G2 si elige «más de 6 meses hasta 1 año» · G0 si elige cualquier otro
3	Una deuda lleva 14 meses vencida.	Más de 1 año	G3 si elige «más de 6 meses hasta 1 año» · G0 si elige cualquier otro

La casilla 2 es el caso límite. La norma dice «sin exceder de 6 meses», así que seis meses justos van al 5 %. Es la misma frontera que ya usan T6 A5 y su capa 3 («Más de 3 hasta 6 meses»).

Parte 2 · Calcular
#	Enunciado literal	✓	✗ → tipo	✗ → tipo
4	¿Cuánta provisión lleva el grupo de más de tres hasta seis meses? (96)	$28.000	$56.000 → P1	$2.800 → P2
5	¿Cuánta provisión lleva el grupo de más de seis meses hasta un año? (93)	$16.000	$8.000 → P1	$24.000 → P1
6	¿Cuánta provisión lleva el grupo de más de un año? (97)	$9.000	$6.000 → P1	$900 → P2
7	¿Cuál es el total de la provisión?	$53.000	$1.347.000 → P3	$84.000 → P4
8	¿Cuál es el valor neto de lo que deben los clientes? (111)	$1.347.000	$1.400.000 → P5	$1.453.000 → P6

Comprobación:

620.000 + 560.000 + 160.000 + 60.000 = 1.400.000.
5 % de 560.000 = 28.000; 10 % de 160.000 = 16.000; 15 % de 60.000 = 9.000.
28.000 + 16.000 + 9.000 = 53.000.
1.400.000 − 53.000 = 1.347.000.
El distractor P4 sale de aplicar el 5 % también al primer grupo: 31.000 + 53.000 = 84.000.
Errores por tipo
Tipo	Texto literal	Estim.
G1	Dos meses no pasan de tres: va con las vigentes y las de hasta tres meses.	105
G2	El grupo del 5 % llega hasta seis meses, sin pasar de seis. Seis meses justos todavía caben ahí.	87
G3	Catorce meses ya pasan de un año: va en el grupo de más de un año.	101
G0	Mira cuántos meses lleva vencida y busca el grupo que los cubre.	86
P1 · porcentaje de otro grupo	Ese es el porcentaje de otro grupo. Mira el rango del grupo y usa su porcentaje.	86
P2 · un cero de más o de menos	Revisa la cuenta: te sobra o te falta un cero.	97
P3 · confunde con el neto	Ese es el valor neto. La provisión es solo la suma de lo calculado en cada grupo.	92
P4 · provisiona el primer grupo	Las vigentes y las de hasta tres meses no llevan provisión en este ejemplo. Suma solo los otros tres grupos.	91
P5 · no resta	Falta restar la provisión: el valor neto es lo que deben los clientes menos la provisión.	86
P6 · suma	La provisión no se suma: se resta.	<10

Sobre P4: dice «en este ejemplo», porque no provisionar ese grupo es una decisión del escenario, no una regla de la norma. Es el mismo criterio que Shoko pidió para T6 A5.

Inventario por estados
Estado	Lo que ve
Inicial	Rótulo, consigna, regla fija con su nota, «Así se juega» y el tutorial
Parte 1	Tres casillas, una por deuda, con los cuatro grupos como opciones
Parte 2	La tabla de datos y cinco casillas con tres opciones cada una
Error	La devolución del tipo y el valor correcto revelado
Acierto	✓ en la casilla
Reintento y segundo fallo	N/A: un intento por casilla
Cierre	El texto de cierre y el porcentaje (aciertos ÷ 8 × 100)

Para Kaede: en a5 y a6 la mecánica de casillas tiene que revelar el valor correcto después de un error, igual que «La Escalera del Encaje». En a6 eso es indispensable, porque el total y el valor neto dependen de las casillas anteriores.

## (2) Futaba · líneas que cambian, con PASA de Shoko (pegadas tal cual)

Mandan sobre (1). Decisión de Sakuta: se aplican tal cual, por actividad e id. Del texto pegado se quitaron las líneas de la interfaz del chat.

b5-t6-a6 · «Provisión por edades»
Id	Campo	Texto nuevo (literal)
Regla fija, fila 1	Texto	Vigentes o hasta 3 meses: no se provisiona, en este ejemplo
Regla fija, fila 1	Pie	Escenario simulado
Regla fija, filas 2 a 4	Pie	Fuente del porcentaje: Decreto 1625 de 2016
7	Opciones	$53.000	$44.000 → P7	$84.000 → P4
P7 · falta un grupo	Error	Te falta un grupo. Suma la provisión de los tres grupos que sí la llevan.
P3	Error	Se retira.

El 0 % no es del Decreto: la fila 1 lleva el pie del escenario. Las filas 2 a 4 no cambian (5 %, 10 % y 15 %). En la casilla 7, el distractor $44.000 (28.000 + 16.000) sustituye a $1.347.000.
