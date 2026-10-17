**T4 · A1 «La caja» · versión 6: el rediseño de enganche.**
- **Este archivo es la versión vigente de A1.** Sustituye el contenido de pantalla de `d4-t4-a1-v1.md` y de sus cambios v2 a v5, que quedan como historia.
- Por qué: A1 publicado fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): las tres primeras pantallas sin figura, la figura a 345-380 px, 10 de 10 pantallas con más de 60 palabras y 1 con acción.
- Diseño: Hanayama, «El cajón de paso» operable (`celula-d/hanayama-a1-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-rediseno.md`). Aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`), con su decisión: **el control 7 (caja menor) enciende Bancos**, no «Pago en efectivo», porque el fondo se abre y se repone con cheque de Bancos (pp. 181-184).
- Siete pantallas (la v5 tenía diez). Sale la portada; «¿Qué control falla?» (la papelería) sale de A1. Los rótulos del cajón no cambian: «Caja», «Debe», «Haber», «se recibe / dinero», «se consigna / o se paga», «En la caja», «Bancos», «Pago / en efectivo» y la bandeja «Caja no se mueve».
- Única cifra del libro: 435.000 (p. 180). Los dos asientos de la p. 180 siguen como en la v5: el 1 sale al cobrar y el 2 solo con el acierto de la consignación.
- INFLESZ **medido** con `src/herramientas/inflesz.js`. Todo texto de 10 o más palabras da 65 o más.
- Medido con la sonda de enganche: peor pantalla 59 de 60 palabras; antes de la figura, 38 de 40 como mucho (P0); la figura entre 84 y 183 px a 320.
- **A1 P5 (16 oct 2026): los controles se parten en dos pantallas (decisión de Yujiro).** P5 «el-faltante» es una decisión sobre un escenario simulado (Andrés cobra 435.000 y al libro llegan 410.000; los 25.000 no son del libro, y el pie lo dice). P6 «controles» deja tocar los siete controles, que encienden lo que cuidan; las pestañas 1-7 y los siete textos de control salen. Diseño: Hanayama; textos: Katsumi. La frase de cierre del lote B se reemplaza. Siete pantallas (sale el resumen del lote B, entra «el-faltante»).
- **Lote B (16 oct 2026), capas 1 y 4 del prompt maestro:** la pieza abre con el objeto (en la P0 no hay texto antes de la figura: el rótulo va sobre su control y el texto aparece debajo, con la primera acción) y termina con la frase de cierre pegada al modelo en su estado final; sale la pantalla de resumen en lista. Diseño: Hanayama (`celula-d/hanayama-p2-lote-b.md`); textos: Katsumi (`celula-d/katsumi-cierres-lote-b.md`, v2, §5 y §5.1); decisiones de Yujiro en `celula-d/corte-calidad.md`, «Lote B».
- **Objetivo (D2, 16 oct 2026):** una línea fija bajo el título, solo en la P0 (hallazgo de Shibukawa; Yujiro; texto de Katsumi). Con ella, la figura de la P0 queda a 130 px a 320: Yujiro la acepta porque B1 (280) se cumple, y la parada de medición de la P0 pasa a ser ≤ 280.
- **D9 (lote nocturno, 16 oct 2026; Hanayama):** el cajón es un cajón: bajo su base, centrada, una manija de 24 × 4 px #B8C4D4; con cada cobro, consignación o pago se abre 4 px y vuelve (translateY, 220 ms de ida y 220 de vuelta). Con movimiento reducido no se mueve. Solo en A1 (H1 usa el mismo cajón sin ella).

## Objetivo de la pieza

- Bajo el título, en la P0: «Decidir qué mueve Caja y cómo cuidarla.» (<10)

## Contenido, pantalla por pantalla

**P0 · dos-cuentas**
- Después de la figura: «En el Tema 2 la plata ya iba en dos cuentas.» (99,6)
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

**P5 · el-faltante**
- Antes de la figura: «Andrés cobra y anota. ¿Qué control faltó?» (<10)
- Tarjeta · separar (la correcta): «Separar funciones» (<10)
- Tarjeta · arqueo: «Arqueo sorpresa» (<10)
- Tarjeta · poliza: «Póliza de manejo» (<10)
- Error · arqueo (✗ y el texto): «Al contar, caja y libro cuadran: lo no anotado no se ve.» (96,2)
- Error · poliza (✗ y el texto): «La póliza paga el robo, pero no lo impide.» (<10)
- Pie: «Basado en el libro, pp. 179-180 · Escenario simulado»

**P6 · controles**
- Antes de la figura: «Toca cada control: se enciende lo que vigila.» (<10)
- Frase de cierre (con los siete encendidos, debajo del cajón): «Cada control tapa una fuga distinta.» (<10)
- Siguiente: «Siguiente: «El fondo fijo».» (<10)
- Pie: «Basado en el libro, pp. 179-180»

## Caso B (D8), pantalla por pantalla

D8 (lote nocturno, 16 oct 2026; textos de Katsumi, `celula-d/katsumi-d8-caso-b.md`): el mismo recorrido con otra empresa y otras cifras construidas; la decisión de cada pantalla no cambia. El sorteo elige el caso para toda la pieza; el primer recorrido usa siempre el caso 1. Aquí va solo lo que cambia; lo demás es el caso 1. Cifras del caso B (construidas): cobro 612.000; en «el-faltante», anotado 584.000 y sin anotar 28.000. Origen del cajón: «Taller Ríos Ltda.». Los pies llevan además « · Cifras construidas».

**P0 · dos-cuentas**
- Pie: «Basado en el libro, p. 179, y en el Tema 2 · Cifras construidas»

**P1 · cobra**
- Antes de la figura: «Taller Ríos arregla motos, y hoy los clientes le pagan de contado. Toca «Cobrar».» (88,6)
- Pie: «Basado en el libro, p. 180 · Cifras construidas»

**P2 · consigna**
- Error si va al debe: «No entró plata nueva: son los mismos $612.000.» (<10)
- Pie: «Basado en el libro, p. 180 · Cifras construidas»

**P3 · dos-salidas**
- Pie: «Basado en el libro, p. 180 · Cifras construidas»

**P4 · cheques**
- Cheque «propio» · tarjeta: «Taller Ríos paga con un cheque propio» (<10)
- Pie: «Basado en el libro, pp. 179, 180 y 187 · Cifras construidas»

**P5 · el-faltante**
- Antes de la figura: «Lucía cobra y anota. ¿Qué control faltó?» (<10)
- Pie: «Basado en el libro, pp. 179-180 · Escenario simulado · Cifras construidas»

**P6 · controles**
- Pie: «Basado en el libro, pp. 179-180 · Cifras construidas»

## El cajón en P5 y P6

En P5 (el-faltante) el cajón va sin salidas ni glosas: el origen muestra lo cobrado (435.000), el Debe y «En la caja», 410.000, y junto al tubo de entrada, en neutro, lo que no llegó al libro. Con el acierto, la pastilla «Correcto» en la tarjeta, sin mensaje (decisión de Yujiro), y se enciende lo que cuida la separación (el control 4): el tubo de entrada y las columnas.

En P6 (controles) el cajón va entero, sin el caso. Los siete controles de las pp. 179-180, en el orden del libro, son botones de 44 px como mínimo en la parte que cuidan (Hanayama): el 1 y el 4 bajo las columnas, el 2 y el 7 en Bancos, el 3 en «Pago en efectivo», el 5 junto a «En la caja», el 6 junto al nombre del cajón. Tocar uno enciende su parte; no se califican.

- Junto al tubo de entrada (P5): «25.000 sin anotar»
- Control 1: «Registro diario»
- Control 2: «Consignación»
- Control 3: «Tope de pagos»
- Control 4: «Separación»
- Control 5: «Arqueo»
- Control 6: «Póliza»
- Control 7: «Caja menor»

## Glosas del cajón (P0)

- Bajo «Caja»: «a la mano, como tu billetera»
- Bajo «Bancos»: «en el banco»

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
