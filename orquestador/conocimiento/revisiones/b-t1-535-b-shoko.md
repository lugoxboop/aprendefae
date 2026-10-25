# T1 · Auditoría del #535 en a8e7069, segunda vuelta (Shoko, 24-oct)

La subió Sakuta tal como salió del chat de Shoko (6c926eca). Se audita sobre las capturas L4b-t1-*.png que sacó Sakuta del build de la rama.

**Tope general:** ninguna de las seis puede pasar de Medio todavía — D2, D3 y D9 piden en Avanzado una prueba con un estudiante ajeno, y eso no existe aún. Eso no es FALLA, es techo.

**#535 · a8e7069**

- **t1-1 · Básico · FALLA** — en el paso 2 y en el final, la caja AFUERA guarda «la pregunta · plata que ya puso»: el chip conserva la respuesta **errada** como si fuera el dato, dos centímetros encima del ✗ «Plata que ya puso» y el ✓ «Su oficio». La pieza se queda contradiciéndose a sí misma. O el chip lleva el valor correcto, o va marcado como lo que puso el estudiante (✗ y en rojo). Segundo: en la fila de cinco, «Pasa algo en la empresa» son 23 caracteres y el tope de la célula es 20.
- **t1-2 · Básico · FALLA** — ENTRA se atenúa entre el paso 1 y el paso 2, justo en la pantalla donde las dos devoluciones mandan a mirarlo («Mira el cuadro de ENTRA», «Mira el recuadro ENTRA: dice sin insumo físico»). El único elemento al que apunta el auto-rescate es el que queda apagado. Arreglo superficial: ENTRA no se atenúa mientras su devolución esté en pantalla.
- **t1-4 · Básico · FALLA** — dos cosas del mismo nudo. Los cuatro casos se ven desde el paso 0, antes de marcar las torres: reducen 27 combinaciones a 4 y le regalan la primera decisión al estudiante — es lo que Sakuta ya corrigió en t1-1 y aquí quedó sin corregir. Y el chip «✓ Correcto: Disminución en activo y en pasivo» dice palabra por palabra la respuesta de la decisión 2, que queda siendo la misma pregunta en otro formato (D4 Básico). Arreglo: la pregunta del caso aparece después de «Anotar», y el chip resume el resultado sin nombrar el caso («Correcto: así quedan las tres partes»).
- **t1-6 · Básico · FALLA** — la devolución no explica por qué. Dice que el informe estaba bien y después pregunta «¿la empresa lo tiene, lo debe, o es de los dueños?» sin responderlo, y con un intento por decisión el estudiante cierra la ficha sin saber por qué Maquinaria es Activo y no Pasivo. Además, tal como está escrita sirve igual para las 10 fichas: es el mensaje genérico único contra el que advierte el Kit.
- **t1-7 · Básico · FALLA** — en el paso 2 la elección equivocada («Cuentas por cobrar y cuentas por pagar») se apaga sin ✗, al revés que las otras cinco piezas, y la flecha correcta nunca se muestra completa: solo aparece el chip «Iba aquí: Efectivo», sin el otro extremo ni la flecha dibujada. El estudiante termina sin ver qué dos cifras sí se pasan algo, que es exactamente lo que la pieza promete enseñar. Tercero, de forma: la devolución pegada abajo deja una banda vacía enorme entre el chip y el texto, a 320 y a 375. **Condición aparte, no FALLA:** «Utilidad del ejercicio» en el patrimonio queda pendiente de lo que Futaba resuelva contra el libro; no doy PASA de D1 hasta que llegue.
- **t1-8 · Básico · FALLA** — el estado de error no se lee como error: el «1» que escogió el estudiante queda resaltado en gris sin ✗, el «3» correcto no lleva ✓, y la banda «Se apagaron 3 puntos.» es neutra. Es la única de las seis que no usa el patrón rojo/✗ de la célula; a primera vista parece que acertó. Arreglo: ✗ en el «1», ✓ en el «3», devolución con el tratamiento de error de las demás.

Texto que hay que cambiar:

| dónde | hoy | pegar |
|---|---|---|
| t1-6 · devolución de error | «El informe es el correcto, eso ya lo tienes. Ahora pregúntate: ¿la empresa lo tiene, lo debe, o es de los dueños?» | «El informe es el correcto. La maquinaria la tiene la empresa y la usa en su operación: por eso es Activo. El pasivo es lo que le debe a otro.» — y hace falta una variante por familia de ficha, no una sola para las 10. Futaba la valida contra su ficha del capítulo 1. |
| t1-1 · rótulo de la parada 1 | «Pasa algo en la empresa» (23 car.) | el mismo rótulo de ≤20 que ya usa la secuencia en cu0-a1 — que lo saquen de ahí, no que inventen uno nuevo, o los dos sitios dejan de decir lo mismo. |

Para la re-auditoría me basta con los pasos que cambien, a 320 y con la respuesta errada escogida; de t1-4 además el paso 0 corregido, y de t1-7 el paso 2 con la flecha completa pintada.
