# b5-t6-aprender5 · «Cómo se calcula la provisión» · paquete

Célula B · T6 · Aprender 5 · pieza `b5-t6-a5-como-se-calcula-la-provision` · análisis de vencimiento con un escenario simulado.

Pieza nueva por decisión de Mateo: la tabla de la p. 201 no se consiguió, y Mateo autorizó una fuente externa, el Decreto 1625 de 2016, art. 1.2.1.18.21 (provisión general del 5 %, 10 % y 15 %).

Lo que ve el estudiante sale de aquí, letra por letra. Precedencia (Sakuta, contenido con PASA de Shoko):

1. **(0)** las decisiones de Sakuta, que mandan sobre el texto pegado;
2. **(1) Futaba · versión que manda**, pegada tal cual.

## (0) Decisiones que mandan sobre el texto pegado

- **El pie del término 1 es «Basado en el libro, pp. 200-201»** (Sakuta). La tabla de (1) dice «Basado en el libro, p. 200».
- Lo que no se pinta: las marcas ✎, la columna «Estim.» con sus cifras de legibilidad, la columna «Resalta» (es diseño, no texto), las cifras entre paréntesis tras el objetivo, las consignas y la pregunta, y las secciones «Inventario por estados», «Kit» y «Fuera de la pieza».
- La cita del término 1 lleva su página al final, como en las otras piezas (guía de A4 §2): «Lo primero que se deba hacer para realizar el ajuste por cuentas incobrables a diciembre 31 es calcular la probable pérdida de cartera con base en el porcentaje de pérdida establecido por la empresa.» (p. 201)
- «Deterioro de cartera»: hueco marcado (Shoko). La pieza no lo nombra.
- La tabla de la p. 201 no aporta ninguna cifra, cliente ni porcentaje.
- **La nota del término 2 de T6 · A2 (recomendada de Shoko) NO entra en esta rama.** Toca una pieza ya fusionada: espera la decisión de Sakuta.
- Del texto pegado se quitaron dos líneas de la interfaz del chat («Claude ha respondido:» y «Ejecutó 2 comandos»), que no son de Futaba.

**Ids:**

- La pieza es `b5-t6-a5-como-se-calcula-la-provision`. Aprender no paga: no va al catálogo.
- Las opciones de la capa 4 son `b5-t6-a5-veinte`, `-diez`, `-treinta` y `-nada`.
- Los grupos de la capa 3 son `g1`, `g2`, `g3` y `g4`.

## (1) Futaba · T6 · Aprender 5, versión que manda (pegada tal cual)

Sakuta: va la pieza completa como versión que manda. ✎ marca lo que cambió frente a la v1. Las cifras de legibilidad son estimación mía, y todo texto de 10 o más palabras queda en 66 o más.

T6 · APRENDER 5 · «Cómo se calcula la provisión» · versión que manda

Rótulo fijo en pantalla durante las capas 2 y 3: «Escenario simulado · no es la tabla del libro».

Pies de fuente que ve el estudiante. Hay cuatro tipos y nunca se mezclan:

«Basado en el libro, p. N»: lo que dice el texto del libro.
«Escenario simulado»: las cifras y las decisiones del ejemplo.
«Fuente del porcentaje: Decreto 1625 de 2016»: los porcentajes de la norma, aplicados en el ejemplo.
«Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21 · Libro, p. 201»: solo en la nota del término 4, porque ahí hablan las dos fuentes.

TÍTULO: Cómo se calcula la provisión

OBJETIVO: Vas a ver cómo se calcula la provisión: se agrupan las deudas según su vencimiento y a cada grupo se le aplica un porcentaje. (71)

Capa 1 · Primero, los nombres
#	Término	Texto literal	Pie	Estim.
1 ✎	Análisis de vencimiento	Al cierre, la empresa agrupa lo que le deben sus clientes. Separa las deudas vigentes de las vencidas, y a estas según cuánto tiempo llevan vencidas.	Basado en el libro, p. 200	81
1 · Así lo dice el libro	—	«Lo primero que se deba hacer para realizar el ajuste por cuentas incobrables a diciembre 31 es calcular la probable pérdida de cartera con base en el porcentaje de pérdida establecido por la empresa.»	(p. 201)	cita
2	Un porcentaje por grupo	A cada grupo se le aplica el porcentaje que la empresa espera perder. Los porcentajes los fija la propia empresa.	Basado en el libro, p. 201	75
3	La provisión	Se suman los cálculos de todos los grupos. Ese total es la provisión. Se anota como ya viste: se debita Gasto provisiones – cuentas incobrables y se acredita Provisión para deudas incobrables.	Basado en el libro, pp. 200-202	68
4	Una referencia colombiana	En Colombia, la norma del impuesto de renta trae una provisión general con tres porcentajes. Es el 5 % para deudas con más de tres meses de vencidas, sin pasar de seis. Es el 10 % para más de seis meses, sin pasar de un año. Y es el 15 % para más de un año.	Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21	93
4 · Nota ✎	—	Esos porcentajes son el máximo que la empresa puede restar como gasto al calcular su impuesto de renta. No son una regla para todas las empresas: cada una fija los suyos.	Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21 · Libro, p. 201	75
Capa 2 · Mírelo funcionar
#	Texto literal	Pie	Resalta	Estim.
1	El 31 de diciembre, una empresa revisa lo que le deben sus clientes: $1.000.000.	Escenario simulado	Lo que deben los clientes	73
2	Agrupa las deudas según cuánto tiempo llevan vencidas.	Basado en el libro, p. 200	Los cuatro grupos	<10
3 ✎ nuevo	En este ejemplo, la empresa decide usar como suyos los porcentajes de la norma de renta.	Escenario simulado	Los cuatro porcentajes	70
4 ✎	Las que están vigentes o llevan hasta tres meses de vencidas suman $400.000. En este ejemplo, por ellas no se provisiona nada.	Escenario simulado	Grupo 1	80
5	Las que llevan más de tres meses, sin pasar de seis, suman $200.000. Al 5 %, son $10.000.	Fuente del porcentaje: Decreto 1625 de 2016	Grupo 2	99
6	Las que llevan más de seis meses, sin pasar de un año, suman $300.000. Al 10 %, son $30.000.	Fuente del porcentaje: Decreto 1625 de 2016	Grupo 3	98
7	Las que llevan más de un año suman $100.000. Al 15 %, son $15.000.	Fuente del porcentaje: Decreto 1625 de 2016	Grupo 4	95
8	Cálculo: $10.000 + $30.000 + $15.000 = $55.000.	Escenario simulado	La suma	<10
9	Se debita Gasto provisiones – cuentas incobrables por $55.000.	Basado en el libro, p. 202	Gasto provisiones – cuentas incobrables	<10
10	Y se acredita Provisión para deudas incobrables, por el mismo valor.	Basado en el libro, p. 202	Provisión para deudas incobrables	66
11	Cálculo: $1.000.000 − $55.000 = $945.000, el valor neto.	Basado en el libro, p. 202	El valor neto	<10
Cierre	Cada grupo con su porcentaje, y la suma de todos es la provisión.	Basado en el libro, pp. 200-201	—	88

Comprobación:

400.000 + 200.000 + 300.000 + 100.000 = 1.000.000.
10.000 + 30.000 + 15.000 = 55.000.
1.000.000 − 55.000 = 945.000.
Capa 3 · Ahora pruebe usted

Consigna: Toca cada grupo y mira cuánto se provisiona por él. (85)

Caja (rótulo ✎)	Al tocarla (literal)	Pie	Estim.
Vigentes o hasta 3 meses · $400.000	✎ En este ejemplo, por las deudas vigentes o con hasta tres meses de vencidas no se provisiona nada: $0.	Escenario simulado	73
Más de 3 hasta 6 meses · $200.000	Al 5 %, los $200.000 dan $10.000.	Fuente del porcentaje: Decreto 1625 de 2016	<10
Más de 6 meses hasta 1 año · $300.000	Al 10 %, los $300.000 dan $30.000.	Fuente del porcentaje: Decreto 1625 de 2016	<10
Más de 1 año · $100.000	Al 15 %, los $100.000 dan $15.000.	Fuente del porcentaje: Decreto 1625 de 2016	<10
Cuando tocó las cuatro	La provisión es la suma de los cuatro grupos: $55.000. Mientras más tiempo lleva vencido un grupo, mayor es su porcentaje en este ejemplo.	Escenario simulado	81
Capa 4 · En una frase

Pregunta: Una deuda de $200.000 lleva ocho meses vencida. Con los porcentajes del ejemplo, ¿cuánto se provisiona por ella? (70)

Opción	¿Correcta?	Devolución literal	Estim.
$20.000	✓	Correcto. Ocho meses es más de seis y no pasa de un año: le toca el 10 %. El 10 % de $200.000 es $20.000.	96
$10.000	✗	✎ No es esa. Ese sería el 5 %, que es para deudas de más de tres hasta seis meses. Ocho meses ya pasó de seis.	103
$30.000	✗	No es esa. Ese sería el 15 %, que es para deudas de más de un año. Ocho meses no llega a un año.	102
Nada	✗	No es esa. Una deuda con más de tres meses de vencida sí entra en la provisión del ejemplo.	99
Inventario por estados
Estado	Lo que ve el estudiante
Entrada	Título y objetivo
Capa 1	Los 4 términos, la cita del término 1 y la nota del término 4
Capa 2	El rótulo fijo, los 11 pasos con su pie y su resaltado, y el cierre
Capa 3	Consigna y cuatro cajas cerradas → cada una se abre con su pie → texto final cuando se abrieron las cuatro
Capa 4	Pregunta, cuatro opciones barajadas, la devolución en el recuadro neutro y «Probar otra»
Texto alternativo	N/A: la escena va oculta y se anuncia el texto
Reintento y segundo fallo	N/A: «Probar otra» sin límite
Fin	N/A: no hay nada después de la capa 4
Kit (contenido)
Dimensión	Nivel
D1	Medio
D2	Básico
D3	Medio
D4	Básico, por el componente
D6	Avanzado
D8	Básico
D13	Medio en mi estimación
D9 y D10	No evaluables

Nivel: Básico.

Fuera de la pieza
«Deterioro de cartera»: HUECO marcado, como recomendó Shoko, hasta que el profesor diga si se enseña. La pieza es correcta sin el término: el artículo del decreto se sigue llamando «provisión general».
La tabla de la p. 201: no se usa ninguna cifra, cliente ni porcentaje. La cita del término 1 es del texto de la p. 201, no de la tabla.
T6 A2 · la nota del término 2 (recomendada de Shoko)

Antes: «En la tabla del libro (p. 201), las columnas se llaman “Cuentas vigentes” y “Cuentas vencidas”. Una cuenta vigente…»

Ahora: «En el análisis de vencimiento, las deudas se separan en vigentes y vencidas. Una deuda vigente todavía está dentro de su plazo de pago. Una vencida ya lo pasó.» (75)

Ya no remite a una tabla que el estudiante no ve.
Sigue sin decir desde qué fecha se cuentan los días.
Dice «deuda» en vez de «cuenta», con el mismo criterio de «castigar la deuda».
Fuente interna: «análisis de vencimiento» sale de la p. 200. Las palabras «vigente» y «vencida» son las de los encabezados de la p. 201, sin ninguna de sus cifras.
