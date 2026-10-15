---
id: enganche
titulo: La barra de enganche
procedencia: mixta
---

> **PROCEDENCIA.** La regla de mecánicas es de Mateo y se la dio a Gen antes de
> que existieran las células: nunca llegó al canon. Los umbrales en palabras y
> en píxeles (B1, B2) son criterio de la Célula D, no salen de un estudio. Se
> calibran con estudiantes reales, y quien los cambie lo anota aquí con su
> razón. La revisión que los originó se hizo el 15 de octubre de 2026 sobre la
> página publicada, por orden de Mateo: «calidad sobre cantidad».

# La barra de enganche

Una actividad puede pasar todas las pruebas, caber a 320 px, no revelar la
respuesta, tener cada cifra con su página, y aun así no enganchar a nadie.
Eso pasó con las tres primeras piezas publicadas del T4. Este archivo existe
para que no le pase a otra célula.

## La regla de la casa sobre mecánicas

**Animación interactiva en tiempo real, no diapositivas ni cadenas de
selección.** Una mecánica de selección puede existir, pero el estudiante tiene
que ver un movimiento real a consecuencia de lo que decide. Si solo hace clic y
lee, no es una mecánica.

La dio Mateo, como regla de Gen, y vivía solo en la memoria de ese chat. Una
célula que nació después no tenía forma de conocerla. **Una regla que no está
en el canon no existe para quien llega después.**

## Lo que se encontró, con su evidencia

Medido en aprendefae.com, con marcos de 320 y 375 px dentro del propio sitio:

- **A0 «El activo corriente»**: 9 pantallas con una media de 124 palabras. La
  primera tiene 187 palabras y cuatro ideas. La figura empieza por debajo del
  pliegue en 6 de las 9 pantallas, a 594 px del tope de la tarjeta en la
  primera. El estudiante lee un muro de texto antes de ver nada.
- **A1 «La caja»**: 10 pantallas, entre 72 y 147 palabras. Las tres primeras no
  tienen figura. La figura cambia de estado, pero el estudiante no la maneja.
- **H1 «¿Entra o sale de Caja?»**: una lista de tres opciones de radio. No tiene
  cuenta T ni saldo que se mueva. Además, el acierto «Haber de Caja» se pinta en
  teal, que en Contabilidad significa debe, y la consigna sale dos veces en la
  misma pantalla.

## Por qué pasó

1. **La regla de mecánicas no estaba escrita** donde la célula podía leerla.
2. **Se midió «cabe», no «engancha».** Las sondas comprobaban anchos, saltos y
   que nada revelara la respuesta. Ninguna medía cuánto se lee antes de ver o de
   hacer algo.
3. **D9 del kit es un hueco.** Sin criterio, el auditor no tenía con qué medirlo
   y dio PASA a piezas sin gancho visual.
4. **Cada corrección sumó párrafos.** Las auditorías pedían matices, y el matiz
   siempre llegó como texto, nunca como figura.

## La barra

- **B1 · Primero la figura.** A 320 px, la figura o la interacción empieza en
  los primeros 280 px de la tarjeta. El texto antes de ella no pasa de 40
  palabras.
- **B2 · Presupuesto de texto.** En Aprender, como mucho 60 palabras por
  pantalla. Lo que no cabe va en otra pantalla, o lo dice la figura.
- **B3 · El estudiante hace algo.** En Aprender, al menos la mitad de las
  pantallas tienen una acción con consecuencia visible en la figura. En Hacer,
  la decisión mueve algo que significa algo (una cuenta T, un saldo, un sobre):
  no basta con marcar una opción de radio.
- **B4 · En Contabilidad, el acierto no se pinta en teal ni en ámbar.** Esos dos
  colores ya significan debe y haber. El acierto se marca con forma (✓ o borde),
  en neutro.
- **B5 · Ningún texto aparece dos veces en la misma pantalla.**

**B1, B2 y B5 se comprueban con pruebas automáticas**, no a ojo. Una barra que
depende de que alguien se acuerde de mirarla es la misma que ya falló.

## Cómo se revisa

En la página publicada, o en el build servido en local con Playwright y el
viewport fijo (ver herramientas.md), nunca leyendo el código. La extensión de
Chrome dice que redimensionó la ventana y no lo hace: compruebe
`window.innerWidth` antes de medir, o use marcos del ancho exacto dentro del
propio sitio.

## Lo que encontró la Célula E en su autodiagnóstico (15 de octubre)

Repaso del capítulo 5: r5-1 «Repaso cruzado» y r5-2 «El Toro Negro», jugadas
en la página y en el build local con Playwright a 320 y 375 px. Cada falla,
con su causa y la regla que la evita.

- **E1 · Contenido aprobado que no llegó a la pantalla.** Las seis pistas de
  r5-1 estaban en el paquete y en los datos, y la vista no las pintaba.
  *Causa:* las pruebas miraban los datos, no el DOM, y la lista de pruebas del
  paquete no pedía «se ve». *Regla:* cada paquete pide una prueba de cobertura
  de pantalla que juega cada estado (cada opción, la pista abierta) y falla si
  un texto del estudiante no sale en el DOM en ninguno.
- **E2 · Lo que cambia al responder pasaba fuera de la vista.** La cuenta de
  las pantallas de cálculo transformaba los datos, que al responder quedan a
  0 px de la vista (medido a 375×667 y 320×568): el foco baja a «Siguiente».
  *Causa:* se diseñó en una captura de página entera, no en la ventana del
  teléfono. *Regla:* lo que aparece o cambia al responder va entre lo que se
  tocó y el botón de seguir, y se mide en el viewport, no en la captura.
- **E3 · Acierto y error solo con el borde.** En el armador de asientos de
  r5-2, el debe, el haber, el valor y el lado calificados decían bien o mal
  solo con teal o coral; la pantalla vecina (a0) sí tenía palabras. *Causa:*
  la regla D12 se aplicó pantalla por pantalla, no pieza por pieza.
  *Regla:* toda pieza calificada lleva su palabra («Correcta», «No va aquí»).
  La prueba: en blanco y negro, ¿se sabe cuál pieza falló?
- **E4 · El estado elegido se perdía al calificar.** El botón del lado del
  saldo perdía su relleno al revisar y los dos quedaban iguales salvo un
  borde. *Regla:* la elección del estudiante conserva su forma (relleno)
  después de calificarse; la calificación se suma, no la reemplaza.
- **E5 · Una frase repetida en cada fila.** «Porcentaje que fija la empresa:
  N %» siete veces; a 320 partía en tres renglones y la tabla medía 1.618 px.
  *Regla:* lo que vale para todas las filas se dice una vez (en el hecho o la
  cabecera); en la fila queda solo lo que cambia, mejor si es la cuenta que
  hay que hacer («× 3 %»).
- **E6 · Contenido escrito como marca.** Rótulos de lote a 10,5 px en
  mayúsculas. *Regla:* 10,5 px en mayúsculas es solo para marcas de
  interfaz («PREGUNTA 2 DE 6»); lo que el estudiante necesita leer va a 12 px
  o más.
- **E7 · Lo que el kit no mide: r5-1 es una cadena de selección.** Con la barra
  B3 de este archivo, cuatro de sus seis pantallas son marcar una opción de
  radio y no mueven nada. Cumple el kit y no cumple la barra. *Corregido en la
  v2 (#250, paquete `e5-r5-1-v2`):* el flujo del título se reproduce, el
  asiento entra en las cuentas T, las latas se venden, las fichas arman el
  costo con un contador en vivo y los lotes se mezclan. *Regla:* antes de
  escribir contenido, el general fija la mecánica de cada pantalla con la
  pregunta «¿qué se mueve cuando el estudiante decide?»; si la respuesta es
  «nada», la pantalla no está diseñada.
- **E8 · La figura no hace la cuenta que se califica.** En el primer diseño de
  la v2, el rótulo «Costo de cada unidad» calculaba en vivo el promedio que
  la pregunta pedía; la elección se reducía a multiplicar y los distractores
  dejaban de ser creíbles (Takamura). *Regla:* la figura muestra los
  insumos y las consecuencias; el resultado que se evalúa solo aparece
  después de responder.
