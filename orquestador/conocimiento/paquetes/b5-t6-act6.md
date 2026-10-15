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

Id	Campo	Texto nuevo (literal)	Pie	Motivo
Regla fija · fila 1	Tabla	Vigentes o hasta 3 meses: no se provisiona, en este ejemplo	Escenario simulado	Obligatoria 1: el 0 % no es del Decreto.
Regla fija · filas 2 a 4	Tabla	Sin cambios: 5 %, 10 % y 15 %	Fuente del porcentaje: Decreto 1625 de 2016	—
Casilla 7	Distractor	$44.000 (28.000 + 16.000) → P7, en lugar de $1.347.000	—	Obligatoria 2: la casilla 7 ya no delata la casilla 8.
P7 · falta un grupo	Devolución	Te falta un grupo. Suma la provisión de los tres grupos que sí la llevan. (108)	—	Error nuevo.
P3	—	Se elimina. Ya no hay ninguna opción que la use.	—	—

La casilla 7 queda así: ✓ $53.000 · ✗ $44.000 (P7) · ✗ $84.000 (P4).

Cruce, rehecho:

La búsqueda de las cifras de a6 ya excluía las cifras de T6 A5 que van en el PR #136: 1.300.000, 460.000, 340.000, 360.000, 140.000, 17.000, 36.000, 21.000, 74.000, 1.226.000, 380.000, 19.000, 38.000 y 57.000. Ninguna coincide.
El distractor nuevo, $44.000, no aparece en el capítulo ni en T6 A5.

Para Kaede: la parte 1 tiene cuatro opciones por casilla, una por grupo. Confirma que la mecánica de la Escalera las admite. Si solo admite tres, quito el grupo más lejano de cada casilla: para la deuda de 2 meses, «más de 1 año»; para las de 6 y 14 meses, «vigentes o hasta 3 meses».

Kaede: la admite (CasillasEnOrden acepta cualquier número de opciones por casilla); quedan las cuatro.


## (3) Futaba · entrega 1 de calidad: G0 por casilla (versión final, con PASA de Shoko; pegada tal cual)

En a6, G0 deja de ser un solo texto: va uno por cada pareja de casilla y opción. La clave es de Kaede, «G0-{casilla}-{grupo}».
Clave · casilla · opción elegida	Campo	Devolución
G0-u1-g3 · u1 (2 meses) · Más de 6 meses hasta 1 año	Devolución	Ese grupo es para deudas de más de seis meses hasta un año. Esta lleva 2 meses vencida.
G0-u1-g4 · u1 · Más de 1 año	Devolución	Ese grupo es para deudas de más de un año. Esta lleva 2 meses vencida.
G0-u2-g1 · u2 (6 meses) · Vigentes o hasta 3 meses	Devolución	Ese grupo es para deudas vigentes o de hasta tres meses. Esta lleva 6 meses vencida.
G0-u2-g4 · u2 · Más de 1 año	Devolución	Ese grupo es para deudas de más de un año. Esta lleva 6 meses vencida.
G0-u3-g1 · u3 (14 meses) · Vigentes o hasta 3 meses	Devolución	Ese grupo es para deudas vigentes o de hasta tres meses. Esta lleva 14 meses vencida.
G0-u3-g2 · u3 · Más de 3 hasta 6 meses	Devolución	Ese grupo es para deudas de más de tres hasta seis meses. Esta lleva 14 meses vencida.
