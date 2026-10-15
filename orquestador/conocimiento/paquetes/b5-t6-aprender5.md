# b5-t6-aprender5 · «Cómo se calcula la provisión» · paquete

Célula B · T6 · Aprender 5 · pieza `b5-t6-a5-como-se-calcula-la-provision` · análisis de vencimiento con un escenario simulado.

Pieza nueva por decisión de Mateo: la tabla de la p. 201 no se consiguió, y Mateo autorizó una fuente externa, el Decreto 1625 de 2016, art. 1.2.1.18.21 (provisión general del 5 %, 10 % y 15 %).

Lo que ve el estudiante sale de aquí, letra por letra. Precedencia (Sakuta, contenido con PASA de Shoko):

1. **(0)** las decisiones de Sakuta, que mandan sobre el texto pegado;
2. **(1) Futaba · versión que manda**, pegada tal cual;
3. **(2) Mai · guía de diseño v1**, hecha sobre esa versión (los 66 textos y los 27 rótulos cotejados).

## (0) Decisiones que mandan sobre el texto pegado

- **El pie del término 1 es «Basado en el libro, pp. 200-201»** (Sakuta). La tabla de (1) dice «Basado en el libro, p. 200».
- Lo que no se pinta: las marcas ✎, la columna «Estim.» con sus cifras de legibilidad, la columna «Resalta» (es diseño, no texto), las cifras entre paréntesis tras el objetivo, las consignas y la pregunta, y las secciones «Inventario por estados», «Kit» y «Fuera de la pieza».
- La cita del término 1 lleva su página al final, como en las otras piezas (guía de A4 §2): «Lo primero que se deba hacer para realizar el ajuste por cuentas incobrables a diciembre 31 es calcular la probable pérdida de cartera con base en el porcentaje de pérdida establecido por la empresa.» (p. 201)
- «Deterioro de cartera»: hueco marcado (Shoko). La pieza no lo nombra.
- La tabla de la p. 201 no aporta ninguna cifra, cliente ni porcentaje.
- **La nota del término 2 de T6 · A2 (recomendada de Shoko) NO entra en esta rama.** Toca una pieza ya fusionada: espera la decisión de Sakuta.
- Del texto pegado se quitaron las líneas de la interfaz del chat («Claude ha respondido:», «Ejecutó…», «Leído…», la lista de archivos), que no son de Futaba ni de Mai. En (2), las tablas que repiten textos de (1) se resumen: los textos y los pies son los de (1); se conservan las medidas, las decisiones y los rótulos.

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

## (2) Mai · guía de diseño v1 de T6 · Aprender 5 (pegada tal cual, salvo lo dicho en (0))

Sakuta: la guía de T6 A5 está lista para Kaede, completa y armada directamente sobre la versión que manda, así que no hay anexo aparte. Tiene el paso nuevo (11 pasos), los cuatro tipos de pie y tu pie del término 1. Los 66 textos y los 27 rótulos coinciden letra por letra.

Rótulo fijo: es la primera línea dentro de la tabla, en las capas 2 y 3. Nunca se atenúa, y en los pasos 2 a 8 el desplazamiento busca que se vea junto con lo resaltado.
El pie de la norma no se parece al del libro. Hay cuatro tipos con tres formas:
el libro va en texto llano;
el escenario, en caja redondeada del color del rótulo;
la norma, en caja de esquinas rectas;
el tipo mixto deja cada fuente en su forma.
Los pies en caja miden lo mismo que el llano, así que cambiar de pie no mueve «Siguiente».
El «%» nunca se separa de su número. A 320 se partía «Al 5 / %».

Un límite que no puedo cerrar con diseño: a 320×568 con cabecera de 56, la tabla (285 px) no cabe en el hueco útil (239).

En los modos A y B, en el paso 8 se ve la suma pero el rótulo queda fuera de la ventana.
En el modo C se ven los dos, pero «Siguiente» queda bajo el borde en los pasos 4 a 8.
En las demás ventanas y cabeceras probadas, el rótulo se ve siempre.
El bloque de control crece porque el paso 4 ocupa 4 líneas a 320 y el pie del decreto, 2. Si Futaba acorta el paso 4, el bloque baja 20 px.

Dos cosas para Futaba, sin bloquear: el paso 3 dice «los cuatro porcentajes», pero el grupo 1 no tiene porcentaje escrito; resalto tres y no dibujo un «0 %» que no está en el texto. La otra es el largo del paso 4, que fija el alto del bloque.

Kaede tiene que revisar cómo pinta CuatroCapas el pie de cada término de la capa 1. Si el componente no lo admite, va a Erwin.

Guía de diseño · T6 · Aprender 5 · «Cómo se calcula la provisión» · v1

De: Mai · 14-oct-2026 · Para Kaede.
Contenido: la versión que manda de Futaba, que pasó con Shoko, con un cambio de Sakuta: el pie del término 1 es «Basado en el libro, pp. 200-201».
Forma: CuatroCapas. Las capas 1 y 4 son compartidas y no se tocan; las capas 2 y 3 son máquinas mías.
Prototipo: prototipo-T6-aprender5.html, con ?modo=A|B|C y ?cab=N.

Base: la máquina de T6 A3, con su paleta, tipografía, controles, pegado y cajas. Aquí solo se describe lo propio de esta pieza; lo que no se nombra es igual que en T6 A3.

Lo propio de esta pieza:

el rótulo fijo «Escenario simulado · no es la tabla del libro» (§2);
cuatro tipos de pie que no se mezclan (§3);
una tabla de grupos en la escena (§5).
0 · De dónde sale cada cifra
[M] Medido en mi prototipo:
Chromium 141.0.7390.37 headless, en ventanas de 320×900 y 375×900, escala 1:1, con y sin movimiento reducido. Los dos modos dan las mismas medidas.
Inter y Sora de @fontsource 5.3.0.
Pegado probado a 375×667 y 320×568, con cabecera simulada de 0 y de 56 [E].
[C] calculado · [S] copiado de código publicado · [R] réplica supuesta · [D] decisión mía · [E] estimación.
Siempre se dan 320 · 375. Anchos útiles: 258 · 313.
1 · Paleta y significados

La de T6 A3, sin nada nuevo:

Teal = «se debita» y ámbar = «se acredita», en cápsula y solo donde el paso lo dice.
Resalte: borde 2 nodo y relleno navy.
Coral: no se usa.
El «%» se puede usar en esta pieza: es contenido de Futaba que pasó con Shoko. La regla de no usar «%» era de Macro.
2 · El rótulo fijo «Escenario simulado · no es la tabla del libro» [D]
Dónde va: es la primera línea dentro de la tabla del ejemplo, en las capas 2 y 3. No es una nota aparte; es parte de la tabla, así que va donde ella vaya.
Forma: caja de radio 8, borde 1 nodo al 60 %, relleno 2 / 8, sin fondo. Texto Inter 12/600 en nodo (#CBDCF2): 11,31–12,88:1 sobre el Panel [C].
Ocupa 2 líneas a 320 y 1 a 375.
Alto: 38,38 · 22,19 [M].
Nunca se atenúa ni se oculta: cuando la escena atenúa lo no resaltado, el rótulo conserva su color. Aparece con la tabla (paso 2) y se queda.
Con la tabla a la vista, el rótulo también [D]:
En los pasos 2 a 8, el desplazamiento busca que se vean a la vez lo resaltado y el rótulo.
Si los dos no caben, manda lo resaltado.
Es la regla de prioridad de T6 A2, con el rótulo al final de la lista (prueba en la §5.6).
Es distinto de un pie: dice «· no es la tabla del libro», está dentro de la tabla y ocupa una línea propia.
3 · Cuatro tipos de pie, que no se mezclan [D]

Hay cuatro tipos y tres formas. El pie de la norma no se parece al del libro.

Tipo	Texto	Forma	Por qué esa forma
1 · Libro	«Basado en el libro, p. N» · «Libro, p. N»	texto llano, Inter 12/1,4, secundario (el estilo publicado [R])	es el de toda la plataforma
2 · Escenario	«Escenario simulado»	caja redondeada (radio 8), borde 1 nodo al 60 %, Inter 12/600 nodo, relleno 0 / 6	es la misma familia del rótulo fijo: el pie y el rótulo hablan del mismo ejemplo
3 · Norma	«Fuente del porcentaje: Decreto 1625 de 2016»	caja de esquinas rectas (radio 0), borde 1 neutro, Inter 12/400 en texto (#F8F9FA), relleno 0 / 6	es la única forma con esquinas rectas; tampoco tiene el color ni el peso del pie 2
4 · Norma y libro	«Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21 · Libro, p. 201»	la parte de la norma en su caja recta, y « · Libro, p. 201» como texto llano a continuación	cada fuente conserva su forma; el tipo 4 no inventa una forma nueva

Cómo se distinguen:

Tipo 1 frente a tipo 3: el 3 tiene caja recta, color de texto más claro y la palabra «Fuente». El 1 es texto llano secundario que dice «Libro».
Tipo 2 frente a tipo 3: esquinas redondeadas frente a rectas, nodo 600 frente a texto 400, «Escenario» frente a «Fuente». Ninguno se distingue solo por el color.

Medidas [M]:

Las cajas de los tipos 2 y 3 usan un interlineado de 14,8 px. Con el borde de 1, miden 16,8 de alto, igual que el pie llano: cambiar de tipo de pie no mueve «Siguiente».
El tipo 3 ocupa 2 líneas a 320 (31,59) y 1 a 375. El texto mide 250,46 y, con la caja, no cabe en 258.
El pie de la capa 2 se reserva al mayor: 31,59 · 16,8. Es nuevo en la serie.

Dónde va cada tipo:

capa 1: pies de los términos 1, 2 y 3, tipo 1; término 4, tipo 4 sin libro (solo la caja); nota del término 4, tipo 4;
capa 2: el pie de cada paso (§5.3);
capa 3: caja 1, tipo 2; cajas 2 a 4, tipo 3; bloque final, tipo 2.

Los pies de la capa 1 los pinta CuatroCapas [R] (§8).

4 · Título, objetivo y capa 1 (la pinta CuatroCapas)

Título: «Cómo se calcula la provisión». Lo mide Kaede.

Objetivo (4 · 3 líneas): «Vas a ver cómo se calcula la provisión: se agrupan las deudas según su vencimiento y a cada grupo se le aplica un porcentaje.»

Las líneas y los pies de cada término, en la tabla de la guía (los textos, los de la versión que manda): término 1, 5 · 4 líneas, pie «Basado en el libro, pp. 200-201» (1); la cita, 7 · 5, la página va dentro de la cita; término 2, 4 · 3, «Basado en el libro, p. 201» (1); término 3, 7 · 6, «Basado en el libro, pp. 200-202» (1); término 4, 9 · 7, «Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21» (4, solo la caja): 2 · 1 líneas; nota del término 4, 5 · 4, «Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21 · Libro, p. 201» (4): 51,8 · 39.
Regla tipográfica [D], para toda la pieza: el «%» nunca se separa de su número. Va con un espacio que no se parte (U+00A0) entre la cifra y el «%», en todos los textos. No cambia el texto, solo dónde puede partirse la línea. Sin esa regla, a 320 se partía «Al 5 / %».
La cita lleva «cartera» y «se deba», literales del libro.
5 · Capa 2 · «Mírelo funcionar»
5.1 La idea [D]: una tarjeta, y la tabla del ejemplo en el centro

Es un solo momento («31 de diciembre»), con cinco piezas de arriba abajo:

hecho «Lo que le deben sus clientes» / «$1.000.000»;
la tabla del ejemplo: el rótulo fijo, cuatro grupos y la suma;
anotación «Gasto provisiones – cuentas incobrables» «$55.000» [se debita];
anotación «Provisión para deudas incobrables» «$55.000» [se acredita];
hecho «El valor neto» / «$945.000».

La escena reserva todo desde el principio: lo que aún no apareció ocupa su sitio, invisible. La escena mide lo mismo en los 12 estados y nada salta.

5.2 La tabla del ejemplo [D]
Contenedor: borde 1 neutro, radio 10, relleno 6 / 8 / 8.
Primera línea: el rótulo fijo (§2).
Debajo, una fila por grupo.
Al final, la suma bajo un filete neutro, como un total.
Fila de grupo: borde 2 transparente para poder resaltarse sin moverse, relleno 3 / 4, −6 de margen. Tiene dos líneas:
Línea 1: el nombre del grupo, Sora 12,5/600.
Línea 2: a la izquierda, lo que suma el grupo (Sora 12,5/600, tabular, sin partir). A la derecha, el porcentaje y el resultado (Inter 12, sin partir).
Grupo (nombre = caja de la capa 3)	Suma	Porcentaje (aparece en el paso 3)	Resultado
«Vigentes o hasta 3 meses»	«$400.000»	—	«no se provisiona nada»
«Más de 3 hasta 6 meses»	«$200.000»	«Al 5 %»	«son $10.000»
«Más de 6 meses hasta 1 año»	«$300.000»	«Al 10 %»	«son $30.000»
«Más de 1 año»	«$100.000»	«Al 15 %»	«son $15.000»
Suma (bajo el filete)	«$55.000»		
El porcentaje es una pastilla: Inter 12/600, radio 6, relleno 0 / 5. Resaltada lleva contorno de 2 nodo y relleno navy, así que resaltar no cambia el alto.
La suma muestra solo «$55.000». La cuenta entera («$10.000 + $30.000 + $15.000 = $55.000») va en el texto del paso 8. Dentro de la tabla, a 320, se salía del contenedor.
Los nombres de los grupos son los de las cajas de la capa 3: las dos capas llaman igual a cada grupo.

Medidas [M]:

Fila: 47,5 · 47,5. Cada línea de la fila ocupa 1 línea.
Suma: 27,25.
Tabla: 285,63 · 269,44.
5.3 Estados, con su texto literal

Paso · resaltado («Resalta» de Futaba) · lo que aparece · pie (los textos y los pies, los de la versión que manda):
1 · lo que deben los clientes (el hecho) · el hecho · «Escenario simulado» (2 · 1 / 1)
2 · los cuatro grupos (las cuatro filas) · la tabla, con el rótulo y los nombres · «Basado en el libro, p. 200» (1 · 1 / 1)
3 · los porcentajes (las tres pastillas) · «Al 5 %», «Al 10 %», «Al 15 %» · «Escenario simulado» (2 · 1 / 1)
4 · grupo 1 · «$400.000» · «no se provisiona nada» · «Escenario simulado» (2 · 1 / 1)
5 · grupo 2 · «$200.000» · «son $10.000» · «Fuente del porcentaje: Decreto 1625 de 2016» (3 · 2 / 1)
6 · grupo 3 · «$300.000» · «son $30.000» · (3 · 2 / 1)
7 · grupo 4 · «$100.000» · «son $15.000» · (3 · 2 / 1)
8 · la suma · «$55.000» · «Escenario simulado» (2 · 1 / 1)
9 · Gasto provisiones – cuentas incobrables · la anotación [se debita] · «Basado en el libro, p. 202» (1)
10 · Provisión para deudas incobrables · la anotación [se acredita] · «Basado en el libro, p. 202» (1)
11 · el valor neto · el hecho «El valor neto» / «$945.000» · «Basado en el libro, p. 202» (1)
Cierre · nada · — · (Sora 14/600) · «Basado en el libro, pp. 200-201» (1)

Decisiones [D]:

Paso 3 (Futaba dice «los cuatro porcentajes»): se resaltan tres pastillas. El grupo 1 no tiene porcentaje en ningún texto; su «no se provisiona nada» llega en el paso 4. No dibujo «0 %» porque no está escrito. Si Futaba quiere cuatro, necesito el texto del cuarto.
Pasos 4 a 7: la fila entera se resalta, y su suma y su resultado aparecen en ese mismo paso.
Paso 10: «por el mismo valor» lleva el «$55.000» del paso anterior, como en las otras piezas.
Contador: «Paso N de 11». Los controles son iguales que en T6 A3.

Reservas y alturas [M] (320 · 375): escena, igual en los 12 estados, 590,05 · 541,36; texto reservado (paso 4), 86,75 · 65,06; pie reservado, 31,59 · 16,8; bloque de control, 257,34 · 220,86; «Siguiente», desde la cima de la escena (igual en los 12), 803,39 · 718,22; máquina sin pegar, 847,39 · 762,22.

El bloque crece a 320 por dos razones: el paso 4 ocupa 4 líneas y el pie de la norma, 2. Ninguna de las dos es de diseño. Si Futaba acorta el paso 4 a 3 líneas, el bloque baja 20.

5.4 Duraciones (3000 + 450 ms por palabra) [S, conteo C]
Paso	1	2	3	4	5	6	7	8	9	10	11
Palabras	14	8	16	22	18	19	14	8	9	11	9
ms	9300	6600	10 200	12 900	11 100	11 550	9300	6600	7050	7950	7050

Del paso 1 al cierre: 99,6 s [C].

5.5 Movimiento

Igual que T6 A3: resalte en 200 ms; aparición en 240 ms. Con movimiento reducido no hay transiciones y el estado final es el mismo [M].

5.6 Pegado y la prueba del rótulo

Es el sistema de T6 A3 (A / B / C con la regla D.3), con un cambio [D]: el desplazamiento busca la unión de lo resaltado y del rótulo (pasos 2 a 8); si no cabe, manda lo resaltado.

Prueba [M], en el modo que elige la regla para cada entorno: normal → A, overflow → B, overflow + transform → C.
375×667 (cabecera 0 y 56): lo resaltado, «Siguiente» y el rótulo, siempre visibles.
320×568 (cabecera 0): los tres, siempre visibles.
320×568 (cabecera 56, modos A y B): lo resaltado y «Siguiente», siempre; el rótulo, visible salvo en el paso 8.
320×568 (cabecera 56, modo C): lo resaltado y el rótulo, siempre; «Siguiente», bajo el borde en los pasos 4 a 8.

El límite, dicho claro: a 320×568 con cabecera de 56, la tabla (285,63) no cabe en el hueco útil (238,66). En A y B, paso 8: la suma se ve y el rótulo queda arriba, fuera de la ventana. Manda lo resaltado. En C: el rótulo y lo resaltado se ven, y «Siguiente» queda abajo. Es el último recurso, como en las otras piezas. Para cerrarlo haría falta un bloque más bajo (el paso 4 en 3 líneas) o una cabecera real menor de 56. Kaede mide la real (§8).
6 · Capa 3 · «Ahora pruebe usted» · tablero de los cuatro grupos
6.1 Estructura [D]

De arriba abajo: consigna (Sora 14/1,55), 2 / 2 líneas: «Toca cada grupo y mira cuánto se provisiona por él.»; a 12 px, el tablero, que empieza con el rótulo fijo; debajo, las cuatro cajas, con el chevrón reservado; a 16 px, el bloque final.

El tablero (el de T6 A4, en una columna):

Contenedor: borde 1 neutro, radio 12, relleno 8 / 10 / 10, aria-live. Kaede lo construye como <table>.
Primera línea: el rótulo fijo.
Cabecera de columna: «Se provisiona», en Inter 12 secundario.
Una fila por grupo: el nombre (Sora 13/600) y la celda.
Celda: 104 de ancho, alto mínimo 36, radio 8.
Vacía hasta abrir su caja.
Llena: Sora 15/700, borde 2 nodo y relleno navy.
Al abrir las cuatro aparece la fila «La provisión» · «$55.000», bajo un filete. «La provisión» sale del texto final.
Orden libre: los grupos no se acumulan entre sí.
6.2 Estados, con su texto literal

Altos a 320 / 375 [M].

INICIAL: tablero con las celdas vacías, 250,56 / 234,38. Cajas cerradas: «Vigentes o hasta 3 meses · $400.000», 63,78 / 63,78; «Más de 3 hasta 6 meses · $200.000», 63,78 / 46; «Más de 6 meses hasta 1 año · $300.000», 63,78 / 63,78; «Más de 1 año · $100.000», 46 / 46. Capa: 635,58 / 601,61.

Cada caja abierta (las revelaciones y los pies, los de la versión que manda) y su celda: Vigentes o hasta 3 meses, 4 / 3 líneas, pie (2), caja abierta 194,33 / 154,86, celda «$0»; Más de 3 hasta 6 meses, 2 / 1, pie (3) 2 / 1 líneas, 165,75 / 111,48, celda «$10.000»; Más de 6 meses hasta 1 año, 2 / 1, (3), 165,75 / 111,48, celda «$30.000»; Más de 1 año, 2 / 1, (3), 147,97 / 111,48, celda «$15.000».

LAS CUATRO ABIERTAS: fila «La provisión» · «$55.000». Tablero: 299,56 / 283,38. Bloque final (5 / 4 líneas · 159,23 / 137,55), con su pie «Escenario simulado» (tipo 2). Capa con todo abierto [M]: 1296,27 · 1073,91.

No hay puntaje ni color de acierto o de error.

7 · Capa 4 · «En una frase» · UnaFrase, sin cambios

Pregunta (4 / 3 · 81,19 / 60,89). Las cuatro opciones ocupan 1 línea a los dos anchos, también elegidas. La correcta no se delata [M]. En las devoluciones, el «%» tampoco se separa de su número (§4).

8 · Lo que Kaede mide en el sitio
1 · Regla del pegado, prueba paso a paso y rótulo junto a la tabla (§5.6), a 375×667 y 320×568, con la cabecera real, del paso 1 al cierre. Si no coincide, me pasa el modo, la cabecera y los fallos.
2 · Alto reservado de la escena (min-height en vivo), a 320 y 375, en los 12: 590,05 · 541,36. «Siguiente» debe quedar en el mismo top en los 12.
3 · Alto reservado del texto y del pie, en los 12: 86,75 + 31,59 · 65,06 + 16,8.
4 · Máquina sin pegar, de la escena al fondo de los botones: 847,39 · 762,22.
5 · «%» pegado a su número (Range.getClientRects), a 320, pasos 4 a 7, capas 1, 3 y 4: nunca se parte.
6 · Pies tipo 2 y 3 al alto del pie llano, a 320 y 375, pasos 1 a 3: 16,8 en una línea.
7 · Cómo pinta CuatroCapas el pie de un término (términos 1 a 4 y nota 4), en el código. Réplica [R]: pie bajo la definición; en la nota, dentro de su caja. Si no admite pies por término, va a Erwin: es del componente.
8 · Título: tamaño y ancho a 320 y 375; lo mide Kaede.
9 · Accesibilidad
Debe y Haber nunca van solo en color: cápsulas con palabra.
Los tipos de pie no se distinguen por color: el libro es texto llano y la norma va en caja recta; el escenario va en caja redondeada; cada uno empieza con una palabra distinta («Libro» / «Basado», «Escenario», «Fuente»).
El rótulo fijo se lee al principio de la tabla, en la escena (aria-hidden, como toda la escena) y en el tablero de la capa 3, que sí se lee.
Lectores de pantalla: aria-live en el texto del paso, las revelaciones, el tablero y el bloque final. El tablero se lee como tabla.
Objetivo táctil: 44 o más [M].
Movimiento reducido y sin recortes a 320 ni a 375 [M]. Nada baja de 12 px.
Glifos: ninguno nuevo.
10 · Rótulos de la escena

Todos son fragmentos literales. Comprobado por script [M]: los 27 coinciden.

Rótulo	Sale de
«31 de diciembre» · «Lo que le deben sus clientes» · «$1.000.000»	paso 1
«Escenario simulado · no es la tabla del libro»	rótulo fijo de Futaba
«Vigentes o hasta 3 meses» · «Más de 3 hasta 6 meses» · «Más de 6 meses hasta 1 año» · «Más de 1 año»	nombres de las cajas de la capa 3
«Al 5 %» · «Al 10 %» · «Al 15 %»	pasos 5, 6 y 7
«$400.000» · «no se provisiona nada»	paso 4
«$200.000» · «son $10.000» / «$300.000» · «son $30.000» / «$100.000» · «son $15.000»	pasos 5, 6 y 7
«$55.000»	paso 8
«Gasto provisiones – cuentas incobrables» · «Provisión para deudas incobrables» · «se debita» · «se acredita»	pasos 9 y 10
«El valor neto» · «$945.000»	paso 11
11 · Comprobación de textos

Un script cotejó los 66 textos de la pieza, pies incluidos, contra la versión que manda: los 66 coinciden. El pie del término 1 es el de Sakuta.

12 · ME FALTA
Para Futaba, sin bloqueo: el paso 3 resalta «los cuatro porcentajes», pero el grupo 1 no tiene porcentaje escrito, así que resalto tres (§5.3); el paso 4 ocupa 4 líneas a 320 y es el que fija el alto del bloque (§5.3).
Lo que Kaede mide en el sitio (§8), sobre todo el n.º 7: cómo pinta CuatroCapas el pie de un término.
Si Shoko cambia algún texto, rehago lo que toque.

## (3) Shoko · revisión de la guía de Mai: PASA CON CONDICIONES (resumen fiel)

Pasan los textos (los 66), los rótulos (los 27), que nada dibujado deje de existir (tres pastillas en el paso 3, sin «0 %»), que nada delate la respuesta y que el pie de la norma no se confunda con «Libro». Las condiciones las verifica Kaede en el sitio:

1. **Pies de la capa 1.** Si CuatroCapas no admite pies por término, va a Erwin, y la capa 1 no se publica sin el pie del Decreto. Lo que no puede pasar: que la referencia al Decreto 1625 quede en el bloque rotulado «Así lo dice el libro».
2. **El rótulo fijo, a la vista.** Si con la cabecera real el rótulo desaparece en algún paso con el pie del Decreto (pasos 5 a 7), la pieza NO PASA hasta rediseñar.
3. **El lector de pantalla.** El pie de cada paso tiene que leerse junto con su texto; lo mínimo es que el paso 2 anuncie el rótulo una vez, cuando aparece la tabla.

Recomendada, para Futaba: el «Resalta» del paso 3 pasa a «Los tres porcentajes» (no cambia nada visible).
