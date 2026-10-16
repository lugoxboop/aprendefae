**T4 · A4 «Bancos y notas del banco» · versión 4: el rediseño de enganche.**
- **Este archivo es la versión vigente de A4.** Sustituye el contenido de pantalla de `d4-t4-a4-v1.md`, `d4-t4-a3-a4-v2-cambios.md` (la parte de A4) y `d4-t4-a4-h8-v3-cambios.md` (la parte de A4), que quedan como historia.
- Por qué: A4 de la pila fallaba la barra de enganche B1-B5: la figura a 280 px o menos en 1 de 10 pantallas, 1 de 12 vistas en 60 palabras y 1 de 10 pantallas con acción.
- Diseño: Hanayama (`celula-d/hanayama-a4-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-a2-a5.md`, fuente única `katsumi/a2a5/textos.py`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`, secciones «A2-A5» y «Texto de A2-A5»).
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Siete pantallas (la pila tenía diez). En P2, con los siete puestos, «Sube» y «Baja» desaparecen (corte de Yujiro). P2 no lleva mensaje de error a la vista: el ✗ en el botón tocado y «Incorrecto.» solo para el lector.
- Los términos son exactamente «Nota débito» y «Nota crédito». Dentro de la libreta «El banco» van a secas; en el mayor de P2, con «del banco» en su renglón. «abonar» se define en P1. Los cheques, siempre «sin cobrar».
- Cifras del libro: 876.000 y 398.200 (p. 187). Los siete movimientos de P2, de las pp. 186-187 en su orden.
- Medido con la sonda (Katsumi): peor pantalla 58 de 60 palabras; antes de la figura, 37 de 40 como mucho; la figura entre 84 y 183 px a 320.
- **Lote B (16 oct 2026), capas 1 y 4 del prompt maestro:** la pieza abre con el objeto (en la P0 no hay texto antes de la figura: el rótulo va sobre su control y el texto aparece debajo, con la primera acción) y termina con la frase de cierre pegada al modelo en su estado final; sale la pantalla de resumen en lista. Diseño: Hanayama (`celula-d/hanayama-p2-lote-b.md`); textos: Katsumi (`celula-d/katsumi-cierres-lote-b.md`, v2, §5 y §5.1); decisiones de Yujiro en `celula-d/corte-calidad.md`, «Lote B».

## Contenido, pantalla por pantalla

**P0 · sube-y-baja**
- Rótulo de la acción: «Prueba las dos»
- Después de la figura, con la acción (consignar): «Bancos es la plata de la empresa en el banco.» (103,4)
- Después de la figura, con la acción (girar): «Girar un cheque es firmarlo para que el banco pague con esa plata.» (88,4)
- Texto alternativo: «La cuenta Bancos. Consignar 876.000 la sube por el debe; girar un cheque de 398.200 la baja por el haber.» (90,9)
- Pie: «Basado en el libro, pp. 186-187»

**P1 · las-notas**
- Antes de la figura: «Con una nota débito, el banco le resta a la cuenta; con una nota crédito, le abona: le suma.» (79,6)
- Texto alternativo: «Las dos libretas, la de la empresa y la del banco. Al llegar el extracto, el banco tiene una nota débito que resta y una nota crédito que suma, y la empresa todavía no las sabe.» (81,5)
- Pie: «Basado en el libro, pp. 187-188»

**P2 · sube-o-baja**
- Antes de la figura: «¿Sube o baja Bancos con cada uno?» (<10)
- Tarjeta final: «Ya están los siete.» (<10)
- Texto alternativo: «Siete movimientos que se mandan a Sube, el debe de Bancos, o a Baja, el haber. Con el acierto, su nombre entra al mayor.» (93,6)
- Pie: «Basado en el libro, pp. 186-187»

**P3 · seis-causas**
- Antes de la figura: «Lleva cada causa a quien ya la anotó.» (<10)
- Tarjeta final: «El banco sabe del cheque cuando lo cobran.» (<10)
- Texto alternativo: «Seis tarjetas, una a la vez. Cada causa se manda a la libreta de la empresa o a la del banco, y queda escrita en la que la tiene anotada.» (92,2)
- Pie: «Basado en el libro, p. 188»

**P4 · la-conciliacion**
- Rótulo de la pregunta: «¿Qué le falta anotar a la empresa?»
- Error · cheque-sin-cobrar (✗ y el texto): «El cheque ya está en sus libros: lo anotó al girarlo.» (93,9)
- Frase de cierre (con el acierto, sin mensaje): «Cada libreta anota lo que la otra todavía no sabe. Conciliar es ver qué falta.» (83,0)
- Texto alternativo: «Las dos libretas, cada una con un renglón: un cheque sin cobrar en la de la empresa y una nota débito en la del banco. Se toca el renglón que le falta anotar a la empresa.» (90,2)
- Siguiente: «Siguiente: «San Calixto».» (<10)
- Pie: «Basado en el libro, pp. 187-190»

## Los siete movimientos (P2)

- Movimiento 1 · tarjeta: «Lo que la empresa consigna» (<10)
- Movimiento 1 · va a: debe
- Movimiento 1 · en el mayor: «Consignación»
- Movimiento 2 · tarjeta: «Una nota débito del banco» (<10)
- Movimiento 2 · va a: haber
- Movimiento 2 · en el mayor: «Nota débito / del banco»
- Movimiento 3 · tarjeta: «Una nota crédito del banco» (<10)
- Movimiento 3 · va a: debe
- Movimiento 3 · en el mayor: «Nota crédito / del banco»
- Movimiento 4 · tarjeta: «Un cheque que gira la empresa» (<10)
- Movimiento 4 · va a: haber
- Movimiento 4 · en el mayor: «Cheque girado»
- Movimiento 5 · tarjeta: «Un cliente consigna directo en la cuenta» (<10)
- Movimiento 5 · va a: debe
- Movimiento 5 · en el mayor: «Cliente consigna»
- Movimiento 6 · tarjeta: «La cuota de un préstamo del banco» (<10)
- Movimiento 6 · va a: haber
- Movimiento 6 · en el mayor: «Préstamo»
- Movimiento 7 · tarjeta: «Un cheque anotado que después se anula» (<10)
- Movimiento 7 · va a: debe
- Movimiento 7 · en el mayor: «Cheque anulado»

## Las seis causas (P3)

- Causa 1 · tarjeta: «Cheque girado el 30, que nadie ha cobrado» (<10)
- Causa 1 · libreta: La empresa
- Causa 1 · rótulo: «Cheque / sin cobrar»
- Causa 1 · efecto: «resta»
- Causa 2 · tarjeta: «Una consignación hecha el último día del mes» (<10)
- Causa 2 · libreta: La empresa
- Causa 2 · rótulo: «Consignación / sin abonar»
- Causa 2 · efecto: «suma»
- Causa 3 · tarjeta: «El banco cobra la chequera de la empresa» (<10)
- Causa 3 · libreta: El banco
- Causa 3 · rótulo: «Nota débito»
- Causa 3 · efecto: «resta»
- Causa 4 · tarjeta: «El banco abona intereses a la cuenta» (<10)
- Causa 4 · libreta: El banco
- Causa 4 · rótulo: «Nota crédito»
- Causa 4 · efecto: «suma»
- Causa 5 · tarjeta: «La empresa anota mal un cheque» (<10)
- Causa 5 · libreta: La empresa
- Causa 5 · rótulo: «Error al anotar»
- Causa 5 · efecto: «de la empresa»
- Causa 6 · tarjeta: «El banco liquida mal unos intereses» (<10)
- Causa 6 · libreta: El banco
- Causa 6 · rótulo: «Error al liquidar»
- Causa 6 · efecto: «del banco»

## Rótulos de la figura

- Contador de las causas: «Causa n de 6»
- Con el acierto de la conciliación: «Nota débito · por anotar»
- Para el lector, cada libreta: «La empresa: ninguna causa anotada / 1 causa anotada / {n} causas anotadas»
- Libreta de la empresa: «La empresa»
- Libreta del banco: «El banco»
- Subtítulo de la empresa (P5): «libro auxiliar»
- Subtítulo del banco (P5): «extracto del mes»
- Donde una libreta no lo tiene: «todavía no / lo sabe»
- Consignar: «Consignar»
- Girar: «Girar un cheque»
- Extracto: «Llega el extracto»
- Sube: «Sube»
- Baja: «Baja»
- Mayor: «Bancos»
- Opción · empresa: «Empresa»
- Opción · banco: «Banco»
- Opción · los dos: «Los dos»
- Renglón del extracto 1: «Nota débito · resta»
- Renglón del extracto 2: «Nota crédito · suma»
- Renglón del cheque del 30 (P3): «Cheque girado · resta»
- Renglón de la empresa (P5): «Cheque / sin cobrar · resta»
- Renglón del banco (P5): «Nota débito · resta»

## Interfaz común del rediseño (A0-A5 y H1)

Decisiones 1 y 2 de Katsumi (`katsumi-texto-rediseno.md` y `katsumi-texto-a2-a5.md`); corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca de la opción o la mitad bien elegida: «✓ Correcto»
- Marca de la opción o la mitad mal elegida: «✗ No va aquí»
- Marca de la sección mal elegida (A5): «✗ No va aquí»
- «Seguir» no aparece hasta el acierto en toda pantalla con pregunta, ni hasta el último acierto en los juegos de mandar a un lado. No hay «Intentar de nuevo»: tras el error, las opciones y el tablero siguen activos.
