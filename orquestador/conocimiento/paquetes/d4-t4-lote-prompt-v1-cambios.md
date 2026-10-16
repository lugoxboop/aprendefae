**T4 · Lote del prompt maestro, parte de texto (16 oct 2026): qué cambia en los paquetes vigentes.**
- Autora: Katsumi (`celula-d/katsumi-texto-lote-prompt.md`). Lo pide el prompt maestro de los diseñadores (§3, §4.2, §4.3 y §5.4). Lo aplica Yujiro en el #308; la decisión de H8 etapa 3 es suya.
- Los textos nuevos ya están en su paquete vigente (`d4-t4-a2-v3`, `-a3-v4`, `-a4-v4`, `-a5-v3`, `-h1-v2`, `-h4-v2`, `-h7-v2` y `-h8-v2`), con su INFLESZ medido por `src/herramientas/inflesz.js`. Aquí queda lo que no tiene sitio en ellos y la razón de cada cambio.

## Literales (§4.2)

- En todo T4 la marca es «✓ Correcto», «✗ No va aquí» o «Iba aquí». Salen «✓ Bien» y «✗ Mal» (`MARCA_CASILLA`, que usaban las casillas de A0 P3, las opciones de Aprender y los tableros de A2 P5, A3 P4 y A3 P7) y «✗ Cifra errada» (los campos de cifra de H7 y H8). El lector oye la misma palabra («…: No va aquí»).
- A4 P2: el botón mal tocado lleva la pastilla «✗ No va aquí», no solo el ✗.
- H7 fase 2 y H8 etapa 3, sin reintento: con el error, a los 0,7 s, debajo de cada campo errado se lee «Iba aquí: {valor}», con el saldo en formato $1.240.000. En H8 el texto del error sigue sin decir el saldo: lo dice solo la revelación (decisión de Yujiro por el §4.2; Katsumi había propuesto no revelar).

## Mensajes de error (§4.2: nombrar el error probable)

- Hacer: tres de H1, cuatro de H4 (pregunta 4), uno de H7 (fase 2, «cualquier otra») y uno de H8 (etapa 3, «cualquier otra»). Sale «Revisa» de los tres errores de H7 que lo traían.
- Aprender: A2 P5 (los cuatro errores) y A3 P3 y P5 (un error cada uno), más cortos para que quepa «No va aquí».

## Glosas de A0 P3 (`FILAS_A0`)

Las tres pastillas «No va aquí» suman seis palabras, así que tres glosas se acortan con el mismo sentido: Mercancía, «se cobra este mes» (antes «se vende y se cobra / este mes»); Edificio de la oficina, «dura años» (antes «se usa por años»); Deuda de un cliente, «a tres años» (antes «vence en tres años»). La mercancía y el edificio salen también en P0 y P6.

## Contador y botón (§4.3)

- H4: el rótulo «PREGUNTA n» pasa a «Paso n de N» (N = 2 si cuadra, 4 si no), y dentro de la ronda el botón es «Siguiente paso». Entre rondas, «Siguiente ronda».
- H7 y H8 son un solo caso y su contador ya dice «Paso n de N»: todos los avances son «Siguiente paso», y «Comprobar los saldos» y «Comprobar el saldo» pasan a «Comprobar».
- El último botón sigue siendo «Ver mi resumen».

## Pruebas

`src/contabilidad/__tests__/t4-literales.test.mjs` falla si vuelve a una cadena de T4 (datos y componentes, sin comentarios) «Bien» o «Mal» como marca, «Correcta», «Revisa» o «Cifra errada». Con el código de antes del lote sale roja en cinco archivos.
