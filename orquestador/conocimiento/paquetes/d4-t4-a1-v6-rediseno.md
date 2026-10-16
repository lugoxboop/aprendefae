**T4 · A1 «La caja» · versión 6: el rediseño de enganche.**
- **Este archivo es la versión vigente de A1.** Sustituye el contenido de pantalla de `d4-t4-a1-v1.md` y de sus cambios v2 a v5, que quedan como historia.
- Por qué: A1 publicado fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): las tres primeras pantallas sin figura, la figura a 345-380 px, 10 de 10 pantallas con más de 60 palabras y 1 con acción.
- Diseño: Hanayama, «El cajón de paso» operable (`celula-d/hanayama-a1-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-rediseno.md`). Aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`), con su decisión: **el control 7 (caja menor) enciende Bancos**, no «Pago en efectivo», porque el fondo se abre y se repone con cheque de Bancos (pp. 181-184).
- Siete pantallas (la v5 tenía diez). Sale la portada; «¿Qué control falla?» (la papelería) sale de A1. Los rótulos del cajón no cambian: «Caja», «Debe», «Haber», «se recibe / dinero», «se consigna / o se paga», «En la caja», «Bancos», «Pago / en efectivo» y la bandeja «Caja no se mueve».
- Única cifra del libro: 435.000 (p. 180). Los dos asientos de la p. 180 siguen como en la v5: el 1 sale al cobrar y el 2 solo con el acierto de la consignación.
- INFLESZ **medido** con `src/herramientas/inflesz.js`. Todo texto de 10 o más palabras da 65 o más.
- Medido con la sonda de enganche: peor pantalla 59 de 60 palabras; antes de la figura, 38 de 40 como mucho (P0); la figura entre 84 y 183 px a 320.

## Contenido, pantalla por pantalla

**P0 · dos-cuentas**
- Antes de la figura: «En el Tema 2 la plata ya iba en dos cuentas. Caja es la que está a la mano, como en tu billetera. Bancos, la que está en el banco.» (101,3)
- Pie: «Basado en el libro, p. 179, y en el Tema 2»

**P1 · cobra**
- Antes de la figura: «Sus Servicios arregla computadores, y hoy los clientes le pagan de contado. Toca «Cobrar».» (75,2)
- Pie: «Basado en el libro, p. 180»

**P2 · consigna**
- Antes de la figura: «Ese día, la plata va al banco. ¿Qué le pasa a Caja?» (107,4)
- Tarjeta del origen: «Consigna en su cuenta corriente» (<10)
- Acierto (tras «Correcto.»): «» (<10)
- Error si va al debe: «No entró plata nueva: son los mismos $435.000.» (<10)
- Error si va a «Caja no se mueve»: «Sigue siendo suya, pero ¿sigue en la caja?» (<10)
- Pie: «Basado en el libro, p. 180»

**P3 · dos-salidas**
- Antes de la figura: «El libro lleva esa plata al banco. Supón que también pudieras pagar con ella. Prueba las dos.» (94,9)
- Pie: «Basado en el libro, p. 180»

**P4 · cheques**
- Antes de la figura: «Para el libro, la caja también guarda cheques. Manda cada uno a su sitio.» (93,0)
- Cheque «recibido» · tarjeta: «Un cliente le paga con un cheque» (<10)
- Cheque «recibido» · acierto (tras «Correcto.»): «Ese cheque entró a la caja.» (<10)
- Cheque «recibido» · error si va al haber: «Aquí la empresa recibe, no paga.» (<10)
- Cheque «recibido» · error si va a «caja no se mueve»: «Ese cheque no pasó por el banco.» (<10)
- Cheque «propio» · tarjeta: «Sus Servicios paga con un cheque propio» (<10)
- Cheque «propio» · acierto (tras «Correcto.»): «Esa plata sale del banco.» (<10)
- Cheque «propio» · error si va al debe: «Aquí la empresa paga, no recibe.» (<10)
- Cheque «propio» · error si va al haber: «¿De dónde sale esa plata?» (<10)
- Pie: «Basado en el libro, pp. 179, 180 y 187»

**P5 · controles**
- Antes de la figura: «El libro pide siete controles. Toca cada uno y mira qué cuida.» (86,6)
- Control 1: «Anotar cada día cuánto efectivo entró y cuánto salió.» (<10)
- Control 2: «Llevar al banco, cada día, el efectivo que se recibió.» (78,5)
- Control 3: «Poner un tope a los pagos que se hacen en efectivo.» (93,9)
- Control 4: «Separar a quien recibe el dinero de quien lo registra.» (84,7)
- Control 5: «Contar la caja seguido y sin avisar: eso es un arqueo.» (82,6)
- Control 6: «Tener una póliza de manejo: un seguro contra el robo de quien maneja la plata.» (75,5)
- Control 7: «Tener una caja menor, un fondo aparte para los pagos pequeños.» (71,2)
- Pie: «Basado en el libro, pp. 179-180»

**P6 · resumen**
- Resumen 1: «Caja es la plata a la mano: billetes, monedas y cheques.» (88,2)
- Resumen 2: «Entra por el debe y sale por el haber.» (<10)
- Resumen 3: «Un cheque propio sale del banco: no mueve Caja.» (<10)
- Resumen 4: «Siete controles la cuidan.» (<10)
- Siguiente: «Siguiente: «El fondo fijo».» (<10)
- Pie: «Basado en el libro, pp. 179-180»

## Interfaz común del rediseño (A0, A1 y H1)

Decisiones 1 y 2 de Katsumi; corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca del destino acertado: «✓ Correcto»
- Marca del destino mal elegido: «✗ No va aquí»
- Marca del destino que era: «Iba aquí»

## Lo que es mío y lo que es del libro

Igual que en `katsumi-texto-rediseno.md`, sección A1: la billetera es analogía de Katsumi; el pago en efectivo de 435.000 en P3 es un supuesto marcado («Supón que…»), porque en la p. 180 Sus Servicios consigna; que el cheque recibido entre a Caja es deducción de Katsumi (HD4-2); la glosa de la póliza de manejo es de Katsumi (HD4-3). A1 P1 dice «computadores» (Colombia); el libro, «computadoras».
