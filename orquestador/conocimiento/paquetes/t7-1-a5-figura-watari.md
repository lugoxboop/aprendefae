# Figura de A5 · Watari (13 de octubre de 2026) · extracto de texto

Fuente: https://claude.ai/artifact/2WjBGm3vptbbKMDZtn9njx (versión 1791952320-796d). Texto copiado de la guía, sin el CSS ni el código de la maqueta.

Célula C · T7-1 · A5 «Importados y fletes» · Para Misa · Auditoría: Mello
El flete, lado a lado
Las figuras de A5. Dos casos del libro que se distinguen en quién asume el flete: Santa Martha (el comprador) y La Popa (el vendedor). Con el acierto de las pantallas 4 y 5 aparecen sus asientos del 18 de marzo, en lectura. En la 6, los dos casos se comparan lado a lado.
Watari · 13 de octubre de 2026
Texto: v1 de Near con los cambios de la v2 (Mello: PASA CON CORRECCIONES, atendidas)
Nombres de cuenta: regla 8 de la decisión de corte
Patrón: tabular v3.2
Para Misa, en una línea
Nada nuevo que construir. Los asientos son el modo lectura del patrón tabular (el de RESUMEN), con borde de tarjeta, y la tabla es el «Lado a lado» de AP2 y A6, con texto en las celdas. A5 es de Aprender y no tiene casillas: las tres preguntas de cuenta son de opción. La ficha, las opciones, los mensajes y los botones son componentes existentes.

## Decisiones de diseño

**Los asientos llegan con el acierto** En las pantallas 4 y 5 la pregunta es en qué cuenta va el flete; el asiento la respondería. Por eso aparece al acertar, debajo del mensaje y antes de «Seguir», con el fundido de 120 ms del patrón (sin fundido con «movimiento reducido»). En los errores no aparece.

**Una tarjeta con los dos asientos** Como en la tabla de Near: el de la compra o la venta, con sus sumas (8.700.000 = 8.700.000), y debajo, tras una raya doble, el del flete, sin sumas. Arriba la fecha, «18 de marzo», y DEBE | HABER en teal y ámbar. Cada línea: la cuenta a lo ancho (14 px) y, debajo, la cifra en su columna; las del haber con sangría de 24 px, como el libro diario.

**«Caja o Bancos»** Con la regla 8 de la v9, en las dos tarjetas. Es una sola cuenta escrita así; no se parte en dos líneas de asiento.

**Lado a lado en la pantalla 6** La tabla de Near: columnas «Santa Martha» y «La Popa»; filas «Quién asume el flete», «Valor del flete» y «Cuenta». Las dos columnas quedan una al lado de la otra también a 320 (113 px cada una, medido). Sin color de debe o haber: aquí no se comparan lados.

**Encabezados sin «D-1» ni «D-2»** La tabla de Near dice «D-1 · Santa Martha» y «D-2 · La Popa». D-1 y D-2 son códigos del mapa, no del libro, y el estudiante no los ha visto. Los encabezados quedan con el nombre de la empresa. Si Near los quiere, vuelven sin tocar nada más.

**La señal llega con el acierto** Mientras el estudiante elige, ninguna fila va señalada: señalar «Quién asume el flete» daría la respuesta. Al acertar, esa fila pasa a 600 en #F8F9FA. En los errores la tabla no cambia; el mensaje hace el trabajo.

**Pantalla 2: la lista va como lista** Las cuatro cosas que el libro suma al costo de un importado van en una lista con viñeta, 15 px, 6 px entre ítems. Con la glosa de la v2: «tasa de cambio», no «tasa».

**Cifras** Las del enunciado de A5 (D-1 y D-2). A5 es dueña de X3a y X3b: 1.200.000, 262.500, 8.437.500, 6.500 y 643.500 se ven ya resueltas y no se califica ninguna. 8.700.000 sale solo como suma.

**Color e íconos** Teal y ámbar solo en DEBE | HABER de las tarjetas. Coral solo en los mensajes de error (componente existente). Ningún ícono propio de esta figura, ningún signo del Tema 1 ni del Tema 2. Pantallas 0, 1, 2, 3 y 7 sin figura.

## Qué pasa en cada estado

- P0: Sin figura.
- P1: Sin figura.
- P2c: Sin figura. La lista de cuatro ítems va con viñeta.
- P2e1: Sin figura.
- P2e2: Sin figura.
- P2a: Sin figura.
- P3c: Sin figura: son tres definiciones del libro.
- P3e1: Sin figura.
- P3e2: Sin figura.
- P3a: Sin figura.
- P4c: Sin figura: el asiento daría la respuesta.
- P4e1: Sin figura; el mensaje hace el trabajo.
- P4e2: Sin figura; el mensaje hace el trabajo.
- P4a: Bajo el mensaje aparece la tarjeta del 18 de marzo de Santa Martha: la compra con sus sumas y, tras la raya doble, el flete en Compras (fletes).
- P5c: Sin figura.
- P5e1: Sin figura.
- P5e2: Sin figura.
- P5a: Bajo el mensaje aparece la tarjeta de La Popa: la venta con sus sumas y el flete en Gasto de venta – fletes.
- P6c: Lado a lado arriba, sin ninguna fila señalada. Debajo, la pregunta.
- P6e1: La misma tabla, sin cambios.
- P6e2: La misma tabla, sin cambios.
- P6a: La fila «Quién asume el flete» pasa a 600 en blanco.
- P7: Sin figura: las tres ideas y el «Siguiente».

## Textos de interfaz

«18 de marzo» | Fecha de la tarjeta de asientos | Del enunciado de Near
«Debe» · «Haber» (en mayúsculas por CSS) | Encabezado de la tarjeta | Igual que en el patrón tabular
«Sumas» | Fila de sumas del primer asiento | De la tabla de Near
«Santa Martha» · «La Popa» · «Quién asume el flete» · «Valor del flete» · «Cuenta» | Lado a lado | De la tabla de Near, sin «D-1 ·» ni «D-2 ·»
Nombres accesibles: «Asientos del 18 de marzo» · «Santa Martha y La Popa, lado a lado»; columna oculta «Dato» | Tarjeta y tabla | [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]
