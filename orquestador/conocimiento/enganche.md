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
