**T4 · A5 «San Calixto» · versión 3: el rediseño de enganche.**
- **Este archivo es la versión vigente de A5.** Sustituye el contenido de pantalla de `d4-t4-a5-v1.md` y de `d4-t4-a5-h8-v2-cambios.md` (la parte de A5), que quedan como historia.
- Por qué: A5 de la pila fallaba la barra de enganche B1-B5: la figura a 280 px o menos en 2 de 10 pantallas, 1 de 13 vistas en 60 palabras y 3 de 10 pantallas con acción.
- Diseño: Hanayama (`celula-d/hanayama-a5-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-a2-a5.md`, fuente única `katsumi/a2a5/textos.py`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`, secciones «A2-A5» y «Texto de A2-A5»).
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Siete pantallas (la pila tenía diez); un lado por pantalla. P1 y P2 no llevan mensaje de error a la vista: «✗ No va aquí» en la sección tocada y «Incorrecto.» solo para el lector. El «=» aparece solo cuando los dos saldos son iguales. Sin «Siguiente»: es la última pieza de Aprender del tema.
- Cifras del libro (pp. 189-191): los dos saldos, las cinco partidas de cada lado y los cinco asientos. La diferencia (1.937.500), los saldos de cada paso y el conciliado (4.612.600) se calculan. Cheques sin número (E3).
- Medido con la sonda (Katsumi): peor pantalla 58 de 60 palabras; antes de la figura, 31 de 40 como mucho; la figura entre 84 y 183 px a 320.

## Contenido, pantalla por pantalla

**P0 · dos-saldos**
- Antes de la figura: «La Compañía San Calixto Ltda. revisa su cuenta bancaria al 31 de marzo. El extracto y sus libros no coinciden: difieren en $1.937.500.» (77,3)
- Después de la figura: «Para igualarlos, a cada lado se le ajusta lo que todavía no sabe.» (74,0)
- Texto alternativo: «El saldo del banco, 2.435.600, y el de la empresa, 4.373.100. No son iguales.» (93,0)
- Pie: «Basado en el libro, p. 189»

**P1 · lado-del-banco**
- Antes de la figura: «Primero, el lado del banco: lo que la empresa ya anotó y el banco todavía no.» (81,8)
- Texto alternativo: «Cada partida del lado del banco se manda a Más o a Menos, y el saldo del banco cambia con cada una.» (88,6)
- Pie: «Basado en el libro, pp. 189-190»

**P2 · lado-de-la-empresa**
- Antes de la figura: «Ahora el lado de la empresa: las notas del banco que sus libros todavía no tienen.» (81,8)
- Texto alternativo: «Cada nota del banco se manda a Más o a Menos, y el saldo de la empresa cambia con cada una. Cuando los dos saldos son iguales, aparece el signo igual.» (88,8)
- Pie: «Basado en el libro, pp. 189-190»

**P3 · que-se-asienta**
- Antes de la figura: «Lo que importa es dejar Bancos en su valor verdadero: la empresa solo asienta lo que le falta. ¿Y este cheque?» (86,6)
- Acierto (tras «Correcto.»): «La empresa ya lo anotó al girarlo.» (<10)
- Error · si (✗ y el texto): «Quedaría anotado dos veces en sus libros.» (<10)
- Texto alternativo: «El cheque a Lorena Guerra, de 156.000, sin cobrar, y dos botones: se asienta o no se asienta.» (81,5)
- Pie: «Basado en el libro, p. 190»

**P4 · los-asientos**
- Antes de la figura: «Cada nota del banco lleva su asiento, del 31 de marzo. Toca cada número.» (79,7)
- Texto alternativo: «Cinco botones. Cada uno muestra el asiento de una nota del banco: la cifra va al debe de una cuenta y al haber de la otra.» (90,8)
- Pie: «Basado en el libro, p. 191»

**P5 · el-mayor**
- Antes de la figura: «Pasa las cinco notas al mayor de Bancos. ¿A qué saldo llega?» (102,2)
- Texto alternativo: «El mayor de Bancos empieza en 4.373.100. Al asentar las cinco notas, suben 645.000 y 342.000, bajan 43.500, 236.000 y 468.000, y el saldo llega a 4.612.600.» (71,0)
- Pie: «Basado en el libro, p. 191»

**P6 · resumen**
- Texto alternativo: «Los dos saldos, iguales: 4.612.600.» (<10)
- Resumen 1: «Al extracto: más lo consignado sin abonar, menos los cheques sin cobrar.» (80,6)
- Resumen 2: «A los libros: más las notas crédito, menos las notas débito.» (88,2)
- Resumen 3: «Los dos dan el mismo saldo conciliado, y solo se asientan las notas del banco.» (88,0)
- Pie: «Basado en el libro, pp. 189-191»

## El lado del banco (P1)

- Partida 1 · tarjeta: «Cheque a Lorena Guerra, sin cobrar» (<10)
- Partida 1 · cifra: 156.000 · va a: Menos
- Partida 2 · tarjeta: «Consignación del 31 de marzo, sin abonar» (<10)
- Partida 2 · cifra: 2.758.000 · va a: Más
- Partida 3 · tarjeta: «Cheque a Steffany Herrera, sin cobrar» (<10)
- Partida 3 · cifra: 203.000 · va a: Menos
- Partida 4 · tarjeta: «Cheque a Angélica Garrido, sin cobrar» (<10)
- Partida 4 · cifra: 97.000 · va a: Menos
- Partida 5 · tarjeta: «Cheque a Laura García, sin cobrar» (<10)
- Partida 5 · cifra: 125.000 · va a: Menos

## El lado de la empresa (P2)

- Partida 1 · tarjeta: «Nota crédito del banco: pago de Efraín Martínez» (<10)
- Partida 1 · cifra: 645.000 · va a: Más
- Partida 2 · tarjeta: «Nota débito del banco: chequera» (<10)
- Partida 2 · cifra: 43.500 · va a: Menos
- Partida 3 · tarjeta: «Nota crédito del banco: intereses de una inversión» (<10)
- Partida 3 · cifra: 342.000 · va a: Más
- Partida 4 · tarjeta: «Nota débito del banco: intereses de sobregiro» (<10)
- Partida 4 · cifra: 236.000 · va a: Menos
- Partida 5 · tarjeta: «Nota débito del banco: cheque devuelto de Humberto Gómez» (<10)
- Partida 5 · cifra: 468.000 · va a: Menos

## Los cinco asientos (P4)

- Asiento 1 · línea: «Pago de Efraín Martínez: ya no debe esa factura.» (<10)
- Asiento 2 · línea: «Intereses de la inversión: un ingreso.» (<10)
- Asiento 3 · línea: «Chequera: un gasto financiero.» (<10)
- Asiento 4 · línea: «Intereses de sobregiro: por sacar más plata de la que había.» (76,9)
- Asiento 5 · línea: «Cheque devuelto: Humberto Gómez vuelve a deber.» (<10)

## Rótulos de la figura

- Saldo del banco: «el banco»
- Saldo de la empresa: «la empresa»
- Más: «Más»
- Menos: «Menos»
- Tarjeta final: «Las cinco están puestas.»
- Opción · sí: «Se asienta»
- Opción · no: «No se asienta»
- Asentar: «Asentar las cinco notas»
- Mayor: «Bancos · 31 de marzo»
- Saldo: «Saldo»

## Interfaz común del rediseño (A0-A5 y H1)

Decisiones 1 y 2 de Katsumi (`katsumi-texto-rediseno.md` y `katsumi-texto-a2-a5.md`); corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca de la opción o la mitad bien elegida: «✓ Correcto»
- Marca de la opción o la mitad mal elegida: «✗ No va aquí»
- Marca de la sección mal elegida (A5): «✗ No va aquí»
- «Seguir» no aparece hasta el acierto en toda pantalla con pregunta, ni hasta el último acierto en los juegos de mandar a un lado. No hay «Intentar de nuevo»: tras el error, las opciones y el tablero siguen activos.
