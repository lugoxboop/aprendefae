**T4 · A3 «El arqueo» · versión 4: el rediseño de enganche.**
- **Este archivo es la versión vigente de A3.** Sustituye el contenido de pantalla de `d4-t4-a3-v1.md`, `d4-t4-a3-a4-v2-cambios.md` y `d4-t4-a3-h1-h2-v3-cambios.md` (la parte de A3), que quedan como historia (lectura del libro, erratas D4-2, D4-3 y D4-8, términos y construcción).
- Por qué: A3 de la pila fallaba la barra de enganche B1-B5: la figura a 280 px o menos en 3 de 11 pantallas, 3 de 14 vistas en 60 palabras y 3 de 11 pantallas con acción.
- Diseño: Hanayama (`celula-d/hanayama-a3-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-a2-a5.md`, fuente única `katsumi/a2a5/textos.py`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`, secciones «A2-A5» y «Texto de A2-A5»).
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Diez pantallas (la pila tenía once). A3 usa la regla del fondo de H4 (sus rótulos: «fondo», «suman», «suman, fuera de la regla», «falta», «sobra», «cada marca: 2.000»). «Sobrante» y «faltante» nunca a secas (C5).
- Cifras del libro (pp. 182-186): 500.000, 478.100, 21.900, 24.000, 2.100, 476.000, 15.200, 6.700 y 484.800, las calculadas se calculan. Distractores construidos: 480.200 y 471.400. El control de P1 (de 14.900 a 28.900) es supuesto de Hanayama.
- Medido con la sonda (Katsumi): peor pantalla 59 de 60 palabras; antes de la figura, 32 de 40 como mucho; la figura entre 84 y 183 px a 320.
- **Lote B (16 oct 2026), capas 1 y 4 del prompt maestro:** la pieza abre con el objeto (en la P0 no hay texto antes de la figura: el rótulo va sobre su control y el texto aparece debajo, con la primera acción) y termina con la frase de cierre pegada al modelo en su estado final; sale la pantalla de resumen en lista. Diseño: Hanayama (`celula-d/hanayama-p2-lote-b.md`); textos: Katsumi (`celula-d/katsumi-cierres-lote-b.md`, v2, §5 y §5.1); decisiones de Yujiro en `celula-d/corte-calidad.md`, «Lote B».
- **Objetivo (D2, 16 oct 2026):** una línea fija bajo el título, solo en la P0 (hallazgo de Shibukawa; Yujiro; texto de Katsumi). Con ella, la figura de la P0 queda a 110 px a 320: Yujiro la acepta porque B1 (280) se cumple, y la parada de medición de la P0 pasa a ser ≤ 280. Para que la P0 no pase de 60 palabras, el texto que aparece con la acción pasa a «En un arqueo, soportes más efectivo deben dar el fondo.» (Katsumi).
- **D9 (16 oct 2026; Hanayama):** en la P0, con «Contar la caja», la solapa del sobre se abre hacia arriba (rotateX, 220 ms, cubic-bezier(.3,.9,.4,1)), con su alto reservado desde el principio; con movimiento reducido, no se anima.

## Objetivo de la pieza

- Bajo el título, en la P0: «Hacer el arqueo de una caja menor.» (<10)

## Contenido, pantalla por pantalla

**P0 · contar**
- Después de la figura, con la acción: «En un arqueo, soportes más efectivo deben dar el fondo.» (78,5)
- Texto alternativo: «El sobre con 478.100 en soportes y la caja sin contar. Al contar, hay 21.900, y la aguja de la suma cae justo en la marca del fondo.» (92,7)
- Pie: «Basado en el libro, pp. 182 y 184»

**P1 · cuando-no-cuadra**
- Antes de la figura: «Mueve la plata de la caja. Si la suma pasa del fondo, sobra; si no llega, falta.» (103,1)
- Texto alternativo: «Un control cambia la plata de la caja. La aguja de la suma se mueve, y debajo se lee si cuadra o si hay un sobrante o un faltante de caja menor, y de cuánto.» (93,2)
- Pie: «Basado en el libro, pp. 183-185»

**P2 · el-sobrante**
- Antes de la figura: «En la caja hay $24.000. ¿Qué muestra el arqueo?» (<10)
- Acierto (tras «Correcto.»): «Se pasa por $2.100: un sobrante de caja menor.» (<10)
- Error · falta (✗ y el texto): «Haz la suma: ¿pasa del fondo o se queda corta?» (103,4)
- Error · cuadra (✗ y el texto): «Para cuadrar, tendría que dar justo $500.000. Suma los dos.» (89,7)
- Texto alternativo: «El sobre con 478.100 en soportes y 24.000 en la caja. Con el acierto, aparece en la regla la aguja de la suma.» (87,0)
- Pie: «Basado en el libro, p. 185»

**P3 · el-cheque**
- Antes de la figura: «¿Por cuánto sale el reembolso?» (<10)
- Acierto (tras «Correcto.»): «Los $2.100 de más ya están en la caja.» (<10)
- Error · 478100 (✗ y el texto): «Así sería si cuadrara. Aquí sobra plata en la caja.» (77,2)
- Error · 480200 (✗ y el texto): «Eso le suma la diferencia: el fondo quedaría pasado.» (<10)
- Texto alternativo: «La aguja de caja más cheque cae donde dice el cheque que eliges. Solo el cheque correcto la deja en la marca del fondo.» (88,4)
- Pie: «Basado en el libro, p. 185»

**P4 · el-asiento**
- Antes de la figura: «¿A qué cuenta y a qué lado van los $2.100?» (109,6)
- Acierto (tras «Correcto.»): «Es un ingreso que no viene del negocio: es no operacional.» (82,6)
- Error · gastos-generales (✗ y el texto): «Gastos generales ya tiene los $478.100 completos.» (<10)
- Error · bancos (✗ y el texto): «Bancos ya tiene el cheque entero: $476.000.» (<10)
- Error · lado (✗ y el texto): «Un ingreso no sube por ese lado.» (<10)
- Texto alternativo: «El asiento del reembolso, con Gastos generales al debe y Bancos al haber. Los 2.100 se ponen en una cuenta y un lado.» (84,3)
- Pie: «Basado en el libro, pp. 183 y 185»

**P5 · el-faltante**
- Antes de la figura: «Con $15.200 en caja, ¿por cuánto sale?» (<10)
- Acierto (tras «Correcto.»): «Repone lo gastado y los $6.700 que faltan.» (<10)
- Error · 471400 (✗ y el texto): «Restaste lo que falta; el cheque lo repone.» (<10)
- Error · 478100 (✗ y el texto): «Con eso, el fondo se queda corto.» (<10)
- Texto alternativo: «Con 15.200 en la caja, la suma queda a la izquierda del fondo. Solo el cheque correcto deja la aguja de caja más cheque en la marca.» (89,5)
- Pie: «Basado en el libro, pp. 185-186»

**P6 · camino-1**
- Antes de la figura: «Es representativo: Sus Servicios le cobra los $6.700 a Rosa.» (66,0)
- Acierto (tras «Correcto.»): «Rosa le queda debiendo $6.700 a la empresa.» (<10)
- Error · gno-faltante (✗ y el texto): «Esa es para cuando la empresa asume la pérdida.» (<10)
- Error · ino-sobrante (✗ y el texto): «Esa es para cuando sobra plata.» (<10)
- Error · lado (✗ y el texto): «Una cuenta por cobrar no sube por ese lado.» (<10)
- Texto alternativo: «Los 6.700 que faltan se ponen en una de tres cuentas, al debe o al haber.» (97,4)
- Pie: «Basado en el libro, p. 186»

**P7 · dos-caminos**
- Frase de cierre (con el primer cambio del interruptor): «Quién paga los $6.700 lo decide la empresa.» (<10)
- Texto alternativo: «La regla con los 6.700 que faltan para el fondo. Un interruptor elige si se le cobra a Rosa o si la empresa lo asume, y el asiento cambia de cuenta: los 6.700 siempre van al debe.» (83,9)
- Siguiente: «Siguiente: «Bancos y notas del banco».» (<10)
- Pie: «Basado en el libro, p. 183»


## Caso B (D8), pantalla por pantalla

D8 (lote nocturno, 16 oct 2026; textos de Katsumi, `celula-d/katsumi-d8-caso-b.md`): sobre las cifras de A2 del caso B (fondo 600.000, gastado 524.300, quedan 75.700); el sorteo elige el caso para toda la pieza y A3 va con el mismo caso que A2. El primer recorrido usa siempre el caso 1. Aquí va solo lo que cambia; «(completa)» marca una pantalla cuyos lugares cambian (los errores van por cifra) y va entera. Cifras del caso B (construidas): con 78.500 en la caja sobran 2.800 y el reembolso sale por 521.500 (opciones 524.300 · 521.500 · 527.100); con 70.400 faltan 5.300 y sale por 529.600 (opciones 524.300 · 519.000 · 529.600). Los pies llevan además « · Cifras construidas». Donde el pie largo hacía pasar la pantalla de 60 palabras (sonda), el pie del caso B queda «Cifras construidas, p. N» (Katsumi): «el-sobrante», «el-cheque», «el-asiento», «el-faltante», «camino-1».

- Rótulo del sobre (caso B): «LO QUE TIENE MARTA»
- Interruptor · cobra (caso B): «Se le cobra a Marta»
- Para el lector, el destino (caso B): «Los 5.300 van a {cuenta}, al debe.»

**P0 · contar**
- Texto alternativo: «El sobre con 524.300 en soportes y la caja sin contar. Al contar, hay 75.700, y la aguja de la suma cae justo en la marca del fondo.» (92,7)
- Pie: «Basado en el libro, pp. 182 y 184 · Cifras construidas»

**P1 · cuando-no-cuadra**
- Pie: «Basado en el libro, pp. 183-185 · Cifras construidas»

**P2 · el-sobrante**
- Antes de la figura: «En la caja hay $78.500. ¿Qué muestra el arqueo?» (<10)
- Acierto (tras «Correcto.»): «Se pasa por $2.800: un sobrante de caja menor.» (<10)
- Error · cuadra (✗ y el texto): «Para cuadrar, tendría que dar justo $600.000. Suma los dos.» (89,7)
- Texto alternativo: «El sobre con 524.300 en soportes y 78.500 en la caja. Con el acierto, aparece en la regla la aguja de la suma.» (87,0)
- Pie: «Cifras construidas, p. 185»

**P3 · el-cheque** (completa)
- Antes de la figura: «¿Por cuánto sale el reembolso?» (<10)
- Acierto (tras «Correcto.»): «Los $2.800 de más ya están en la caja.» (<10)
- Error · 524300 (✗ y el texto): «Así sería si cuadrara. Aquí sobra plata en la caja.» (77,2)
- Error · 527100 (✗ y el texto): «Eso le suma la diferencia: el fondo quedaría pasado.» (<10)
- Texto alternativo: «La aguja de caja más cheque cae donde dice el cheque que eliges. Solo el cheque correcto la deja en la marca del fondo.» (88,4)
- Pie: «Cifras construidas, p. 185»

**P4 · el-asiento**
- Antes de la figura: «¿A qué cuenta y a qué lado van los $2.800?» (109,6)
- Error · gastos-generales (✗ y el texto): «Gastos generales ya tiene los $524.300 completos.» (<10)
- Error · bancos (✗ y el texto): «Bancos ya tiene el cheque entero: $521.500.» (<10)
- Texto alternativo: «El asiento del reembolso, con Gastos generales al debe y Bancos al haber. Los 2.800 se ponen en una cuenta y un lado.» (84,3)
- Pie: «Cifras construidas, pp. 183 y 185»

**P5 · el-faltante** (completa)
- Antes de la figura: «Con $70.400 en caja, ¿por cuánto sale?» (<10)
- Acierto (tras «Correcto.»): «Repone lo gastado y los $5.300 que faltan.» (<10)
- Error · 519000 (✗ y el texto): «Restaste lo que falta; el cheque lo repone.» (<10)
- Error · 524300 (✗ y el texto): «Con eso, el fondo se queda corto.» (<10)
- Texto alternativo: «Con 70.400 en la caja, la suma queda a la izquierda del fondo. Solo el cheque correcto deja la aguja de caja más cheque en la marca.» (89,5)
- Pie: «Cifras construidas, pp. 185-186»

**P6 · camino-1**
- Antes de la figura: «Es representativo: Taller Ríos le cobra los $5.300 a Marta.» (66,0)
- Acierto (tras «Correcto.»): «Marta le queda debiendo $5.300 a la empresa.» (<10)
- Texto alternativo: «Los 5.300 que faltan se ponen en una de tres cuentas, al debe o al haber.» (97,4)
- Pie: «Cifras construidas, p. 186»

**P7 · dos-caminos**
- Frase de cierre: «Quién paga los $5.300 lo decide la empresa.» (<10)
- Texto alternativo: «La regla con los 5.300 que faltan para el fondo. Un interruptor elige si se le cobra a Marta o si la empresa lo asume, y el asiento cambia de cuenta: los 5.300 siempre van al debe.» (83,9)
- Pie: «Basado en el libro, p. 183 · Cifras construidas»

## Rótulos de la figura

- Soportes: «Soportes de gastos»
- Caja: «En la caja»
- Sin contar: «sin contar»
- Contar: «Contar la caja»
- Control (para el lector): «Plata en la caja»
- Línea de P1 · cuadra: «Cuadra»
- Línea de P1 · sobra: «Sobrante de caja menor · cifra»
- Línea de P1 · falta: «Faltante de caja menor · cifra»
- Opción · falta: «Falta»
- Opción · cuadra: «Cuadra»
- Opción · sobra: «Sobra»
- Aguja: «caja + tu cheque»
- Asiento: «EL ASIENTO DEL REEMBOLSO»
- Interruptor · cobra: «Se le cobra a Rosa»
- Interruptor · asume: «La empresa lo asume»
- Rótulo del tramo · cobra: «por cobrar»
- Rótulo del tramo · asume: «gasto»
- Para el lector, el destino: «Los 6.700 van a {cuenta}, al debe.»

## Interfaz común del rediseño (A0-A5 y H1)

Decisiones 1 y 2 de Katsumi (`katsumi-texto-rediseno.md` y `katsumi-texto-a2-a5.md`); corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca de la opción o la mitad bien elegida: «✓ Correcto»
- Marca de la opción o la mitad mal elegida: «✗ No va aquí»
- Marca de la sección mal elegida (A5): «✗ No va aquí»
- «Seguir» no aparece hasta el acierto en toda pantalla con pregunta, ni hasta el último acierto en los juegos de mandar a un lado. No hay «Intentar de nuevo»: tras el error, las opciones y el tablero siguen activos.
