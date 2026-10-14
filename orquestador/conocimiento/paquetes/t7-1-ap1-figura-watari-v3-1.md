CÉLULA C · T7-1 · AP1 «LA CUENTA QUE NO SE MUEVE» · PARA MISA · AUDITORÍA: MELLO
Dos columnas del periodo

La figura de la pieza 1, versión 3, con los textos definitivos de la v5 de Near, aprobada por Mello. Columnas: Inventario de mercancías y la cuenta que recibe la compra. Filas: inicio, durante el periodo y cierre. Inventario solo tiene valor al inicio y al cierre; durante el periodo no se mueve, y la compra entra en Compras como una línea con monto.

Watari · 13 de octubre de 2026
Texto: v5 de Near, aprobada por Mello (PASA)
Figura v3.1: correcciones de Mello (PASA CON CORRECCIONES)
Qué cambió
La forma
Pantalla por pantalla
Reglas
Textos
Medidas
Pendientes
Qué es mío y qué no
La figura es mía. La ficha de los cinco datos, las opciones, los mensajes y los botones son componentes existentes: salen en recuadros grises de borde sólido con su nombre y con el texto literal de la v5, solo para ubicar la figura y medir la pantalla. El texto sin corchetes es literal de la v5. Lo que va en ⟦N·…⟧ aún no tiene texto de Near.
01
Frente a «La foto y la película»

L revisó en main LaFotoYLaPelicula.jsx y LineaDelTiempo.jsx y decidió: las filas de inicio, durante y cierre se quedan, porque significan lo mismo que en el Tema 1 (Inventario tiene valor en dos fechas, como una foto; Compras recoge lo que pasa en el periodo, como la película). Lo que no se copia son sus signos.

SIGNO DEL TEMA 1 · NO SE COPIA
Caja punteada de foto no tomada

Aquí no hay ningún borde punteado ni discontinuo. La celda de Inventario durante el periodo es texto suelto, «No se mueve», sin recuadro. El conteo pendiente del cierre también es texto suelto («Conteo físico» en gris) y solo al acertar la pantalla 5 se vuelve tarjeta.

SIGNO DEL TEMA 1 · NO SE COPIA
Banda gris que se llena de arriba abajo

La celda de Compras no se llena. Lo que entra son líneas con monto: «16 de abril», «DEBE» en teal y 5.000.000. Debajo, una línea de texto suelto para el resto de compras, sin cifra.

SIGNO DEL TEMA 1 · NO SE COPIA
Fechas de calendario y cajas de 11 px

Rótulos de fila: «Inicio», «Durante el periodo», «Cierre». Ninguna fecha. Las tarjetas tienen radio de 6 px, borde de 1 px y fondo transparente, sin los rótulos «lo que tiene» ni «lo que debe». Son dos columnas, no una.

02
La forma
Dos columnas, dos cuentas

«Inventario de mercancías» a la izquierda; a la derecha, «Otra cuenta» y luego «Compras». Mismo ancho, separación de 8 px, nombre en Sora 600 de 13 px sobre una raya de 1 px #B8C4D4. Los encabezados se alinean por abajo: las dos rayas quedan a la misma altura aunque «Inventario de mercancías» ocupe dos líneas.

Tres filas

«Inicio», «Durante el periodo» y «Cierre», cada rótulo a todo lo ancho (Inter 500, 12 px, #A8B6C8), 12 px entre filas.

Tarjeta o texto suelto

Lo que tiene valor o está anotado es una tarjeta de borde sólido de 1 px #B8C4D4, radio 6: el valor del inicio, la compra y el conteo físico. Lo demás es texto suelto de 13 px en #A8B6C8, sin recuadro.

La compra

«16 de abril» (12 px), «DEBE» en #2A9D8F (600, 12 px, mayúsculas) y 5.000.000 (Inter 500, 15 px, tabular). Con menos de 130 px de línea, el monto baja a la línea siguiente, a la derecha.

03
Pantalla por pantalla

Trece estados con el texto de la v5. Elige uno: se ve a 375 y a 320.

PANTALLA 0 · INICIAL

Sin figura: cualquier versión adelantaría una respuesta.

PANTALLA 1

Solo la columna «Inventario de mercancías» y la fila «Inicio», con la tarjeta «Valor del inicio del periodo».

PANTALLA 2

Se agregan «Durante el periodo», con «No se mueve hasta el cierre» señalado, y «Cierre», con «Conteo físico» en gris, sin tarjeta.

PANTALLA 3

Aparece la segunda columna, «Otra cuenta», vacía. «No se mueve hasta el cierre» sigue señalado. Desde aquí, «Conteo físico» va centrado en la fila «Cierre», bajo ninguna columna.

PANTALLA 4 · COLOCANDO

Sobre la figura, la tarjeta de la factura con el rótulo «La compra», «16 de abril» y 5.000.000. Se señala «Durante el periodo». Ninguna columna tiene la compra todavía.

PANTALLA 4 · ERROR INVENTARIO

Como el colocando, y se señala «No se mueve hasta el cierre»: es lo que explica el mensaje. La compra no se dibuja dentro de Inventario.

PANTALLA 4 · ERROR GASTOS

Igual que el colocando. La figura no tiene columna de gastos; el mensaje hace el trabajo.

PANTALLA 4 · ACIERTO

La factura desaparece. «Otra cuenta» pasa a «Compras» y recibe la tarjeta «16 de abril · DEBE · 5.000.000», señalada, con fundido de 120 ms, y debajo «Las demás compras del periodo». Inventario no cambia.

PANTALLA 5 · COLOCANDO

Se señala «Cierre». «Conteo físico» sigue centrado en esa fila, bajo ninguna columna: dibujarlo bajo Inventario sería la respuesta de la pregunta.

PANTALLA 5 · ERROR COMPRAS

Se señala «Cierre», y «Conteo físico» pasa bajo Inventario, señalado: el mensaje ya explica que el conteo va ahí, no a Compras.

PANTALLA 5 · ERROR NINGUNA

Igual que el error Compras: «Conteo físico» bajo Inventario, señalado. Ahí es donde el conteo sí se registra.

PANTALLA 5 · ACIERTO

«Conteo físico» pasa a tarjeta: «Al día con el conteo físico», señalada, con fundido de 120 ms. «No se mueve hasta el cierre» se queda, porque sigue siendo cierto. Compras no cambia.

PANTALLA 6 · RESUMEN

Figura completa, sin nada señalado, bajo las líneas del resumen.

04
Reglas de la figura
La pantalla 0 no lleva figura; la 1 sí

En la 0, cualquier figura adelantaría una respuesta. En la 1 aparece solo la columna «Inventario de mercancías» con la fila «Inicio» y su tarjeta «Valor del inicio del periodo»: muestra que la cuenta es un activo y tiene un valor, que es lo que dice el texto. La pantalla 2 agrega las filas del periodo y del cierre. Son 12 estados con figura, uno por cada texto alternativo de Near.

La otra cuenta no se nombra antes de tiempo

No existe en la pantalla 2. Aparece en la 3 como «Otra cuenta», que es como la llama la pantalla 3 («al de otra cuenta»). Se llama «Compras» desde el acierto de la pantalla 4. La columna no cambia de lugar ni de ancho.

La figura no dibuja la respuesta mientras se pregunta

Corrección de Mello. Desde la pantalla 3, el conteo pendiente va centrado en la fila «Cierre», bajo ninguna de las dos columnas. Así la pregunta de la pantalla 5 («¿qué cuenta se pone al día con ese conteo?») no llega contestada. Pasa bajo Inventario en los errores de la 5, donde el mensaje ya lo explica, y como tarjeta en el acierto.

Ninguna respuesta equivocada se dibuja

En los errores, la compra no aparece dentro de Inventario, ni tachada: una imagen así se recuerda. La factura sigue arriba, sin anotar, y la figura señala lo que el mensaje explica. Sin coral en la figura.

Señalar es blanco y negrita

Lo que la pantalla señala pasa de #A8B6C8 a #F8F9FA en 600. No cambian el borde ni el tamaño.

Movimiento

La compra (acierto de la 4) y el conteo (acierto de la 5) aparecen con un fundido de 120 ms, solo en la pantalla en que aparecen. Nada se desplaza. Con «movimiento reducido», sin fundido.

Sin íconos ni signos prestados

La figura no usa la X ni el Check. Del Tema 1 conserva el sentido de las tres filas, por decisión de L, y ninguno de sus signos. No usa signos del Tema 2 (marcador de saldo, arcos, anclajes, colectores, balanza) ni muestra saldos.

Para el lector de pantalla

Es una tabla: las cuentas son encabezados de columna y «Inicio», «Durante el periodo» y «Cierre» son encabezados de fila. Cada estado lleva su texto alternativo ⟦N·fig-alt-F…⟧, enlazado con aria-describedby.

05
Textos

Todos los textos de la figura están puestos. Arriba, los doce textos alternativos de Near, uno por estado. Abajo, los textos visibles de la figura.

TEXTO ALTERNATIVO (NEAR)	ESTADO	INFLESZ OFICIAL
«Una columna con la cuenta Inventario de mercancías. Muestra el valor que tenía al inicio del periodo.»	Pantalla 1	70,1
«La misma columna de Inventario de mercancías. Mientras la tienda vende, la cuenta sigue mostrando el valor del inicio.»	Pantalla 2	por medir
«Dos columnas. Inventario de mercancías sigue con el valor del inicio del periodo. Al lado aparece otra cuenta, todavía sin nombre y sin valores.»	Pantalla 3	69,0
«Inventario de mercancías sigue con el valor del inicio del periodo. Al lado, la otra cuenta espera la compra del 16 de abril.»	Pantalla 4 · colocando	76,2
«La compra no entra en Inventario de mercancías. Esa cuenta sigue con el valor del inicio del periodo.»	Pantalla 4 · error Inventario	80,2
«La compra no va a un gasto. La otra cuenta sigue esperando la compra del 16 de abril.»	Pantalla 4 · error Gastos	por medir
«La otra cuenta ahora se llama Compras. Tiene una línea: 16 de abril, debe, $5.000.000. Debajo hay una línea sin cifra para las demás compras del periodo. Inventario de mercancías sigue igual.»	Pantalla 4 · acierto	68,4
«Es el último día del periodo. Compras tiene la compra del 16 de abril y las demás. Inventario de mercancías sigue con el valor del inicio.»	Pantalla 5 · colocando	83,2
«Compras guarda lo que se compró en el periodo. Lo que quedó en la bodega no va ahí.»	Pantalla 5 · error Compras	104,4
«Sin el conteo, Inventario de mercancías no cambia. Seguiría con el valor del inicio del periodo.»	Pantalla 5 · error Ninguna	70,3
«Con el conteo físico, Inventario de mercancías se pone al día con el valor del inventario final. Compras no cambia.»	Pantalla 5 · acierto	75,4
«Durante el periodo, las compras van a Compras e Inventario de mercancías no se mueve. Al cierre, el conteo lo pone al día.»	Pantalla 6 · resumen	84,3
LITERAL EN LA FIGURA	DE DÓNDE SALE
«Inventario de mercancías» · «Compras»	Nombres de cuenta de la pieza
«Otra cuenta»	Pantalla 3: «al de otra cuenta». Confirmado por Near
«Inicio» · «Durante el periodo» · «Cierre»	Rótulos de fila que fijó L
«Valor del inicio del periodo»	Error «Ninguna» de la pantalla 5: «el valor del inicio del periodo». Confirmado por Near
«No se mueve hasta el cierre»	Etiqueta de Near (cambió «No se mueve», que deja de ser cierto en el acierto de la pantalla 5). Va en la fila «Durante el periodo» en todos los estados
«Al día con el conteo físico»	Etiqueta de Near para el acierto de la pantalla 5. Va en la tarjeta del cierre, que es lo que cambia en ese acierto. En la fila del periodo diría que la cuenta estuvo al día durante el periodo, que es lo que la pieza niega
«Las demás compras del periodo»	Línea de Near, sin cifra, bajo la compra, desde el acierto de la pantalla 4
«16 de abril» · «Debe» · «5.000.000»	La línea del acierto, «16 de abril · Compras · Debe $5.000.000», repartida en la tarjeta, sin «$» como todas las cifras de la célula
«Conteo físico»	Pantallas 2 y 5. En gris y sin tarjeta mientras está pendiente; desde la pantalla 3, centrado en la fila «Cierre» y bajo ninguna columna; pasa a la tarjeta «Al día con el conteo físico» bajo Inventario en el acierto de la 5
«La compra»	Rótulo de la tarjeta de la factura, en el colocando y los errores de la pantalla 4. Texto de interfaz [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN] hasta que Near lo confirme
«Momento» (solo lector de pantalla)	Interfaz
06
Medidas y de dónde salen
MEDIDO EN PROTOTIPO

Prototipo local de Watari, que es esta misma página, no la plataforma desplegada. Chromium 141.0.7390.37 sin interfaz (Playwright 1.56), ventanas de 375×900 y 320×900. Medido con getBoundingClientRect y Range.getBoundingClientRect, después de document.fonts.load y document.fonts.ready, con Inter 400/500/600/700 y Sora 600/700 cargadas (@fontsource 5.3.0). Diferencia conocida: la plataforma las carga desde Google Fonts (src/styles/global.css, línea 1). Medido con los textos de la v5: los 52 textos entre comillas de la v5 coinciden letra por letra con lo que está en pantalla, salvo la línea «16 de abril · Compras · Debe $5.000.000», que va repartida en la tarjeta. El único marcador visible ocupa su lugar. 13 de octubre de 2026.

Dos anchos que no son el mismo: 167,5 / 140 frente a 124,5 / 97
167,5 px a 375 y 140 a 320 es el ancho de cada columna de esta figura, borde a borde, en una ventana de 375 o 320 con mi margen estimado de 16 px por lado (contenido de 343 o 288). Sale de dividir ese contenido en dos columnas con 8 px entre ellas. 124,5 a 375 y 97 a 320 es el ancho útil de la casilla de Xeno (dentro del borde, con los 2 px ya restados), calculado por Xeno para su componente de una cuenta con su monto. Son elementos distintos. Esta figura no usa la casilla de Xeno: no es una casilla, y Erwin decidió que no se reutiliza. Dentro de mis columnas, la medida que cuenta para una cifra es el ancho de la línea de la compra: 146 px a 375 y 118 a 320.
QUÉ	CIFRA	PROCEDENCIA
Contenido de la actividad con el margen de 16 px, a ventana de 375 · 320	343 · 288 px	ESTIMACIÓN · WATARI el margen; MEDIDO el resultado
Ancho de cada columna de la figura, borde a borde, a ventana de 375 · 320	167,5 · 140 px	MEDIDO EN PROTOTIPO no es la casilla de Xeno
Línea de la compra (dentro de la tarjeta), a ventana de 375 · 320	146 · 118 px	MEDIDO EN PROTOTIPO
«DEBE» (600, 12 px) + 8 px + «5.000.000» (500, 15 px)	34 + 8 + 76,09 = 118,09 px	MEDIDO EN PROTOTIPO
Resultado: a 375 una línea con 28 px de holgura; a 320 el monto baja a la segunda línea (corte en 129 px de línea)	corte 129 px	DECISIÓN WATARI comprobado en las dos ventanas
Remisión de la pantalla 4 con el título «La factura completa», a 375 · 320	2 · 3 líneas; 40,59 · 60,89 px de alto	MEDIDO EN PROTOTIPO con el texto de la v5; sin desborde
Remisión de la pantalla 5 con «Tres formas de ponerle precio a lo que quedó», a 375 · 320	2 · 3 líneas; 40,59 · 60,89 px de alto	MEDIDO EN PROTOTIPO con el texto de la v5; sin desborde
Alto de la figura, 375 · 320: pantalla 2 · 4 colocando · 4 acierto · 6	262 · 262 / 309 · 309 / 284 · 300 / 326 · 359 px	MEDIDO EN PROTOTIPO
Alto de la pantalla más alta: a 375, la 4 · error Inventario; a 320, la 4 · acierto	1295 · 1407 px	ESTIMACIÓN · WATARI incluye componentes existentes dibujados por mí
Rayas bajo los encabezados: a la misma altura a 375 y a 320 (encabezados de 40,78 y 23,89 px de alto)	diferencia 0 px	MEDIDO EN PROTOTIPO pantallas 3 y 5
«Conteo físico» pendiente, centrado en la fila del cierre: centro del texto frente a centro de la figura	diferencia 0 px	MEDIDO EN PROTOTIPO pantallas 3 y 5, a 375 y 320
Desborde horizontal, elementos fuera de la actividad, puntos suspensivos, en 13 pantallas × 2 anchos	0 de 26	MEDIDO EN PROTOTIPO
Contraste sobre #0E1B2E: texto · secundario · borde · debe	16,4 · 8,39 · 9,78 · 5,20	CALCULADO fórmula de WCAG 2.1
07
Lo que queda, y qué pasa con cada respuesta
Auditoría de Mello. Recibe el paquete como archivos: capturas de los 13 estados a 375 y a 320, medidas, anchos, diferencias con el Tema 1 y la tabla de estados con sus textos alternativos.
Misa construye AP1 cuando Mello apruebe la figura. En la vista previa desplegada comprueba a 375 y a 320 que «DEBE» y el monto no se tocan y que la página no se desplaza de lado.