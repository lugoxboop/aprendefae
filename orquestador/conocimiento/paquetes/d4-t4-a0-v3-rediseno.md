**T4 · A0 «El activo corriente» · versión 3: el rediseño de enganche.**
- **Este archivo es la versión vigente de A0.** Sustituye el contenido de pantalla de `d4-t4-a0-v1.md` y de `d4-t4-a0-v2-cambios.md`, que quedan como historia (de ahí salen la lectura del libro, las erratas, los términos y lo que es construcción).
- Por qué: A0 publicado fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): la figura a 572 px, 8 de 9 pantallas con más de 60 palabras y 1 de 9 con acción.
- Diseño: Hanayama, figura «El año en marcha» (`celula-d/hanayama-a0-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-rediseno.md`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`).
- Ocho pantallas (la v2 tenía nueve). Sale la portada; la analogía del amigo se va (P0 hace la misma idea con el dedo). Los rótulos de las filas de la figura son los de Hanayama, literales de la p. 178, en renglones fijos.
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Medido con la sonda de enganche (Katsumi y Baki): peor pantalla 59 de 60 palabras; antes de la figura, 28 de 40 como mucho; la figura entre 84 y 162 px a 320.
- **Lote B (16 oct 2026), capas 1 y 4 del prompt maestro:** la pieza abre con el objeto (en la P0 no hay texto antes de la figura: el rótulo va sobre su control y el texto aparece debajo, con la primera acción) y termina con la frase de cierre pegada al modelo en su estado final; sale la pantalla de resumen en lista. Diseño: Hanayama (`celula-d/hanayama-p2-lote-b.md`); textos: Katsumi (`celula-d/katsumi-cierres-lote-b.md`, v2, §5 y §5.1); decisiones de Yujiro en `celula-d/corte-calidad.md`, «Lote B».
- **Objetivo (D2, 16 oct 2026):** una línea fija bajo el título, solo en la P0 (hallazgo de Shibukawa; Yujiro; texto de Katsumi). Con ella, la figura de la P0 queda a 130 px a 320: Yujiro la acepta porque B1 (280) se cumple, y la parada de medición de la P0 pasa a ser ≤ 280.
- **«Pasa el año», seis veces (decisión de Yujiro, 16 oct 2026; texto de Hanayama):** son seis pasos del mismo modelo dentro de una sola pieza, no un calco entre piezas: el año y la raya son los mismos y cada paso trae otro activo (el efectivo, los otros tres, los fijos, lo que se consume) con otro resultado en la raya. El gesto cambia de papel: «la-prueba» se arrastra para probar, «cual-cruza» predice y comprueba, y los demás muestran. No hay fusión: medida, daba 72 y 71 palabras.

## Objetivo de la pieza

- Bajo el título, en la P0: «Separar activos corrientes de activos fijos.» (<10)

## Contenido, pantalla por pantalla

**P0 · la-prueba**
- Rótulo de la acción: «Arrastra el año»
- Después de la figura, con la acción: «Un activo es corriente si se vuelve plata antes de un año.» (91,0)
- Pie: «Basado en el libro, pp. 177-178»

**P1 · el-efectivo**
- Antes de la figura: «El libro empieza por el efectivo, en caja y en bancos. Pasa el año.» (93,0)
- Después de la figura: «Nada cambia: ya era plata. Por eso va primero.» (<10)
- Pie: «Basado en el libro, pp. 178-179»

**P2 · los-otros-tres**
- Antes de la figura: «El libro nombra otros tres. ¿Se vuelven plata antes de la raya?» (102,2)
- Pie: «Basado en el libro, p. 178»

**P3 · cual-cruza**
- Antes de la figura: «Marca cada fila.» (<10)
- Acierto (tras «Correcto.»): «» (<10)
- Error (✗ y el texto): «¿Qué se volvió plata?» (<10)
- Pie: «Basado en el libro, p. 178»

**P4 · los-fijos**
- Antes de la figura: «El libro nombra los activos fijos. La empresa los usa por años para trabajar, no para venderlos.» (81,1)
- Después de la figura: «Van en el activo no corriente.» (<10)
- Pie: «Basado en el libro, pp. 178-179»

**P5 · se-consume**
- Antes de la figura: «El Tema 2 añade un caso: también es corriente lo que se consume dentro del año. Pasa el año.» (85,9)
- Pie: «Basado en el Tema 2 y en el libro, p. 178»

**P6 · por-que-importan**
- Antes de la figura: «Con lo corriente se pagan deudas.» (<10)
- Frase de cierre (desde que se llega): «Corriente: se vuelve plata o se consume antes de un año. Los fijos ayudan a producirla.» (82,0)
- Siguiente: «Siguiente: «La caja».» (<10)
- Pie: «Basado en el libro, pp. 178-179»

## Interfaz común del rediseño (A0, A1 y H1)

Decisiones 1 y 2 de Katsumi; corte de Yujiro, ajuste 2.

- Palabra del acierto (va antes del texto): «Correcto.»
- Palabra del error: ninguna visible. El error es ✗ y el texto.
- Solo para el lector de pantalla, delante del texto del error: «Incorrecto.»
- Marca del destino acertado: «✓ Correcto»
- Marca del destino mal elegido: «✗ No va aquí»
- Marca del destino que era: «Iba aquí»

## Lo que es mío y lo que es del libro

Igual que en `katsumi-texto-rediseno.md`, sección A0: «Por eso va primero» es lectura de Katsumi (HD4-17); la definición de activo fijo es de Katsumi (HD4-15); el caso de lo que se consume es del Tema 2; el ejemplo del edificio que respalda un préstamo es de Katsumi. Los meses de las filas son posiciones del dibujo (Hanayama) y no se escriben en pantalla.
