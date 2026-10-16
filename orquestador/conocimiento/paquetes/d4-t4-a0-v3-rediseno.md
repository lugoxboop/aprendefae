**T4 · A0 «El activo corriente» · versión 3: el rediseño de enganche.**
- **Este archivo es la versión vigente de A0.** Sustituye el contenido de pantalla de `d4-t4-a0-v1.md` y de `d4-t4-a0-v2-cambios.md`, que quedan como historia (de ahí salen la lectura del libro, las erratas, los términos y lo que es construcción).
- Por qué: A0 publicado fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`): la figura a 572 px, 8 de 9 pantallas con más de 60 palabras y 1 de 9 con acción.
- Diseño: Hanayama, figura «El año en marcha» (`celula-d/hanayama-a0-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-rediseno.md`). Los dos, aprobados por Yujiro en su corte de calidad del 15 oct 2026 (`celula-d/corte-calidad.md`).
- Ocho pantallas (la v2 tenía nueve). Sale la portada; la analogía del amigo se va (P0 hace la misma idea con el dedo). Los rótulos de las filas de la figura son los de Hanayama, literales de la p. 178, en renglones fijos.
- INFLESZ **medido** con `src/herramientas/inflesz.js` (`(<10)`: menos de 10 palabras, no aplica). Todo texto de 10 o más palabras da 65 o más.
- Medido con la sonda de enganche (Katsumi y Baki): peor pantalla 59 de 60 palabras; antes de la figura, 28 de 40 como mucho; la figura entre 84 y 162 px a 320.

## Contenido, pantalla por pantalla

**P0 · la-prueba**
- Antes de la figura: «Un activo es corriente si se vuelve plata antes de un año. Arrastra el año.» (91,3)
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
- Antes de la figura: «Con los activos corrientes la empresa opera y paga sus deudas.» (76,9)
- Después de la figura: «Un edificio puede respaldar un préstamo, pero las cuotas se pagan con plata.» (74,0)
- Pie: «Basado en el libro, pp. 178-179»

**P7 · resumen**
- Resumen 1: «Es corriente lo que se vuelve plata antes de un año. El efectivo ya lo es.» (101,5)
- Resumen 2: «Con los corrientes, la empresa opera y paga sus deudas.» (84,7)
- Resumen 3: «Los fijos ayudan a producir esa plata.» (<10)
- Siguiente: «Siguiente: «La caja».» (<10)
- Pie: «Basado en el libro, pp. 177-179»

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
