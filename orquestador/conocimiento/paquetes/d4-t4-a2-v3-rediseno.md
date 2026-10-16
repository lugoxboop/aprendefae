**T4 · A2 «El fondo fijo» · versión 3: el rediseño de enganche.**
- **Este archivo es la versión vigente de A2.** Sustituye el contenido de pantalla de `d4-t4-a2-v1.md` y de `d4-t4-a2-v2-cambios.md`, que quedan como historia (de ahí salen la lectura del libro, las erratas D4-1 y D4-2 y lo que es construcción).
- Por qué: A2 de la pila fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): la figura a 280 px o menos en 2 de 11 pantallas, 1 de 13 vistas en 60 palabras y 2 de 11 pantallas con acción.
- Diseño: Hanayama (`celula-d/hanayama-a2-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-a2-a5.md`, fuente única `katsumi/a2a5/textos.py`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`, secciones «A2-A5» y «Texto de A2-A5»).
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Ocho pantallas (la pila tenía once). Salen la portada y «Quién la maneja» (con la remisión a las retenciones); «aumentar» y «disminuir» se juntan en P6. La figura es el sobre de Rosa y, debajo, el libro: el tablero de H3, con el mismo significado.
- Cifras del libro (pp. 181-184): 500.000 y los ocho gastos de mayo. 478.100 y 21.900 se calculan. El ±100.000 de P6 es supuesto (pie «Cifras construidas»).
- Medido con la sonda (Katsumi): peor pantalla 59 de 60 palabras; antes de la figura, 32 de 40 como mucho; la figura entre 84 y 183 px a 320.

## Contenido, pantalla por pantalla

**P0 · el-fondo**
- Antes de la figura: «La caja menor de Rosa es un fondo para gastos pequeños. Es fijo: al reponerlo, vuelve a la misma cifra. Paga y repón.» (90,8)
- Texto alternativo: «El sobre de la caja menor. Al pagar, bajan los billetes y suben los soportes de gastos, pero la suma sigue en 500.000. Al reponer, vuelven los billetes.» (88,5)
- Pie: «Basado en el libro, p. 181»

**P1 · la-apertura**
- Antes de la figura: «El 1 de mayo, Sus Servicios abre el fondo de Rosa Primorosa con un cheque. Tócalo.» (82,0)
- Texto alternativo: «Un cheque de 500.000 sale de Bancos y llena el sobre. En el libro, Caja menor va al debe y Bancos al haber.» (97,8)
- Pie: «Basado en el libro, pp. 181 y 183»

**P2 · los-gastos**
- Antes de la figura: «En mayo, Rosa paga con el fondo y guarda cada soporte: la factura o el recibo.» (81,8)
- Texto alternativo: «Rosa paga los ocho gastos de mayo, uno por uno. Los soportes llegan a 478.100 y los billetes quedan sin contar.» (86,6)
- Pie: «Basado en el libro, p. 184»

**P3 · cuanto-queda**
- Antes de la figura: «¿Cuánto debería quedarle a Rosa en billetes?» (<10)
- Acierto (tras «Correcto.»): «Lo gastado más lo que queda da el fondo.» (<10)
- Error · 478100 (✗ y el texto): «Esa es la plata que ya salió del fondo: lo gastado.» (99,6)
- Error · 500000 (✗ y el texto): «Ese es el fondo entero, como si Rosa no hubiera pagado nada.» (75,4)
- Texto alternativo: «El sobre con 478.100 en soportes. La cifra que eliges para los billetes se suma con ellos y se compara con el fondo de 500.000.» (87,2)
- Pie: «Basado en el libro, p. 184»

**P4 · el-reembolso**
- Antes de la figura: «Reponer lo gastado es el reembolso. El 31 de mayo, Rosa entrega los soportes y le hacen un cheque. Tócalo.» (78,7)
- Texto alternativo: «Un cheque de 478.100 sale de Bancos. El sobre vuelve a tener 500.000 en billetes y ningún soporte, y la suma no cambia.» (87,0)
- Pie: «Basado en el libro, pp. 182 y 184»

**P5 · y-caja-menor**
- Antes de la figura: «Los gastos de oficina van a Gastos generales. ¿Qué mueve el reembolso?» (76,2)
- Acierto (tras «Correcto.»): «Caja menor no se mueve: el fondo sigue en $500.000.» (90,9)
- Error · debeCajaMenor (✗ y el texto): «Con Caja menor al debe, el fondo subiría con cada cheque.» (82,6)
- Error · haberCajaMenor (✗ y el texto): «Con Caja menor al haber, el fondo bajaría con cada gasto.» (82,6)
- Error · debeOtra (✗ y el texto): «No le entra plata a Caja: ¿en qué se gastó?» (109,6)
- Error · haberOtra (✗ y el texto): «Fíjate de dónde sale la plata de un cheque.» (<10)
- Error · ambas (✗ y el texto): «¿En qué se gastó? ¿Quién paga el cheque?» (<10)
- Texto alternativo: «El libro con cuatro cuentas, cada una con debe y haber. El cheque del reembolso, de 478.100, se pone en un debe y en un haber.» (93,2)
- Pie: «Basado en el libro, pp. 182 y 184»

**P6 · subir-bajar**
- Antes de la figura: «Si el fondo no alcanza, se sube; si la plata se queda quieta, se baja.» (96,3)
- Texto alternativo: «El fondo sube o baja de a 100.000. Al subir, Caja menor va al debe y Bancos al haber. Al bajar, Caja va al debe y Caja menor al haber.» (99,2)
- Pie: «Basado en el libro, p. 182. Cifras construidas»

**P7 · resumen**
- Texto alternativo: «El sobre de Rosa con 500.000 en billetes.» (<10)
- Resumen 1: «Se abre con un cheque: Caja menor sube y Bancos baja.» (93,9)
- Resumen 2: «El reembolso sube Gastos generales y baja Bancos.» (<10)
- Resumen 3: «Caja menor solo se mueve al abrir, subir, bajar o cerrar el fondo.» (88,4)
- Siguiente: «Siguiente: «El arqueo».» (<10)
- Pie: «Basado en el libro, pp. 181-184»

## Rótulos de la figura

- Sobre: «LO QUE TIENE ROSA»
- Libro: «LO QUE DICE EL LIBRO»
- Billetes: «Billetes y monedas»
- Soportes: «Soportes de gastos»
- Suma: «Suman»
- Suma con una cifra equivocada: «Suman (no es el fondo)»
- Fondo: «Fondo»
- Sin contar: «sin contar»
- Pagar: «Pagar un gasto»
- Reponer: «Reponer»
- Pagar el siguiente: «Pagar el siguiente (n de 8)»
- Cheque: «Cheque / sale de Bancos»
- Bajar: «Bajar»
- Subir: «Subir»
- Comprobar: «Comprobar»

## Los gastos de mayo (p. 184)

Literales del libro, en su orden; los muestra P2 uno por toque.

- Gasto 1: Transporte urbano · 34.000
- Gasto 2: Fotocopias · 32.000
- Gasto 3: Elementos de aseo para oficinas · 28.300
- Gasto 4: Papelería y útiles de oficina · 63.400
- Gasto 5: Cafetería · 107.200
- Gasto 6: Repuestos para equipo de oficina · 34.100
- Gasto 7: Servicio de correo · 47.100
- Gasto 8: Reparaciones locativas · 132.000

## Interfaz común del rediseño (A0-A5 y H1)

Decisiones 1 y 2 de Katsumi (`katsumi-texto-rediseno.md` y `katsumi-texto-a2-a5.md`); corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca de la opción o la mitad bien elegida: «✓ Correcto»
- Marca de la opción o la mitad mal elegida: «✗ No va aquí»
- Marca de la sección mal elegida (A5): «✗ No va aquí»
- «Seguir» no aparece hasta el acierto en toda pantalla con pregunta, ni hasta el último acierto en los juegos de mandar a un lado. No hay «Intentar de nuevo»: tras el error, las opciones y el tablero siguen activos.
