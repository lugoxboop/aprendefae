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

## Parte visual (bloque P2 de Hanayama, `hanayama-p2-lote-t4.md`)

Aplicado sobre la cabeza del #308, que ya trae A2-A5 de Baki, con las decisiones de Yujiro (`corte-calidad.md`, «Bloque P2 de Hanayama»):
- **Marcas y mensajes:** `Check` y `X` de lucide (16 px, trazo 2,5). No queda ningún ✓/✗ de texto en T4. El bloque del error lleva el mismo fondo neutro que el acierto y la raya coral.
- **Botones:**
  - el avance y «Comprobar» de los Hacer (y el de A2 P5) son el `Responder` compartido, teal;
  - «Comprobar» nunca se apaga: con algo incompleto, avisa;
  - el «Seguir» de Aprender es el neutro de CuatroCapas.
- **Tablero apilado** (cada cuenta con su nombre arriba y sus dos mitades). «DEBE» va en #3FA69A. El mayor y los asientos de A1 y H4 van en el contenedor hundido de Cuentas.
- **Línea de marcas** bajo las opciones angostas y por fila en A0 P3. En el cajón y en H7, el hueco se mete 6 px en el relleno.
- **Un toque califica** en H4 pregunta 4 y en A3 P4 y P7.
- **La cifra escrita se ve al instante:** en el par (H7) y en el mayor (H8).
- **⛔3 (Yujiro):** H8 etapa 2 queda con cinco cuentas; sale «Caja». ⛔1 (`Pulsos` en node) espera a Erwin.

**La devolución entra en la ventana con la pastilla tocada** (parada de medición de Hanayama; decisión de Yujiro con la revisión de `hanayama-p2-lote-b.md` §6):
- Al dar el veredicto, un solo desplazamiento cubre el tramo que va de la pastilla tocada más alta al pie de la devolución:
  - si el tramo cabe en la ventana menos 16 px, se mueve lo mínimo, con 8 px de margen;
  - si no cabe, la pastilla queda a 8 px del borde de arriba.
- En H3, en H4 pregunta 4 y en H8 etapa 2 la devolución va justo debajo del tablero, antes del sobre y del libro, del asiento o del mayor.
- La guardia de Chromium lo mide en 320×568 y 375×667, con acierto y con error.
- **El botón de avance entra con el tramo** (FALLA E2 de Shibukawa en 35348c3; decisión de Yujiro):
  - si el tramo hasta el pie del botón cabe en la ventana menos 16 px, el tramo llega hasta ahí y el foco va al botón;
  - si no cabe (sobre todo H3 a 320×568), el tramo llega al pie de la devolución, y el foco va a la devolución, sin preventScroll. El botón queda al siguiente Tab;
  - el foco nunca queda fuera de la ventana. La guardia lo mide.
- **§2 en H4:** el rótulo de la regla tras el error es «Iba aquí: {diferencia}» y sale «con el cheque correcto» (textos de Katsumi).
- **§4.1:** las cinco tarjetas en reposo llevan el mismo borde, 1 px rgba(248,249,250,.35).
- **Plan B en H4 pregunta 4 y en H8 etapa 2.** Ahí el tablero apilado no cabe con la devolución en 320×568: en H8 etapa 2 el pie llegaba a 629-673 px, y en H4 la tarjeta 8 a 601 px. Por eso esos dos tableros van lado a lado (nombre · Debe · Haber). Las pastillas bajan a una línea por mitad marcada, debajo del tablero: «Cuenta · lado: ✗ No va aquí». El lector sigue oyendo la marca en la mitad. Con el plan B el pie queda en 560 px o menos.

## D7, nada gris y muerto (veredicto de Shibukawa sobre el #308)

- **Los botones de un solo uso se ocultan tras usarse y guardan su sitio**, como «Cobrar» en A1: A2 «Pagar el siguiente» (al 8 de 8), A3 «Contar la caja», A4 «Consignar», «Girar un cheque» y «Llega el extracto», y A5 «Asentar las cinco notas».
- **Los de límite se quedan.** Apagados, dicen al lado por qué y lo llevan en su `aria-describedby`. Los textos son de Katsumi:

  | Botón | Razón |
  |---|---|
  | A2 «Reponer» | «El fondo ya está completo.» |
  | A2 «Pagar un gasto» | «Tope: tres gastos» |
  | A2 «Subir» | «Tope: 600.000» |
  | A2 «Bajar» | «Mínimo: 400.000» |

- **A0 «Pasar el año» no se apaga.** Si se toca con filas sin marcar, sale el aviso neutro «Marca las tres filas primero.», que se va al marcar la que faltaba.
- **Prueba nueva, `t4-d7.test.mjs`:** en ningún estado queda a la vista un botón apagado sin razón visible. Con el #308 en ac1986e, sale roja en A0, A2, A3, A4 y A5.

## Textos alternativos de los Hacer (Katsumi, por la auditoría de Shibukawa)

Ninguno da la respuesta:
- H3: «El libro de la caja menor: cuatro cuentas, cada una con su debe y su haber. Debajo, el sobre del encargado, para comparar con lo que dice el libro.»
- H4: «El sobre del arqueo, con los soportes y lo que hay en la caja, y una regla alrededor del fondo. En ella se dibujan la suma, la diferencia y lo que dejaría cada cheque.»
- H7: «Arriba, el saldo del banco y el de los libros. Debajo, las dos libretas, cada una con su Más y su Menos, donde va cada partida.»
- H8: «Dos bandejas, «Se asienta» y «No se asienta», para las partidas de la conciliación. Después, un tablero para armar cada asiento y el mayor de Bancos con su saldo.»
