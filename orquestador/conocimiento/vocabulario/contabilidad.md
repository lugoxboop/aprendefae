---
id: vocabulario-contabilidad
materia: contabilidad
procedencia: derivado-del-repo
---

> **PROCEDENCIA:** derivado del repositorio por Sai, no entregado por Gen ni por
> Xeno. Registra decisiones **ya tomadas y ya construidas**, no propone nada
> nuevo. Cada afirmación de aquí es comprobable abriendo el código.
>
> Esto no sustituye una decisión de Gen o de Xeno. Si algo de aquí contradice un
> documento suyo, gana el documento y hay que corregir este archivo.

# Vocabulario visual — Contabilidad

## El orden en que el estudiante recorre la materia

Manda sobre todo lo demás: **no se puede usar un signo antes de que el
estudiante lo haya visto**, y el orden del índice es el del libro, no el de
construcción.

| Orden | Tema | Estado |
|---|---|---|
| 1 | Introducción a la contabilidad (cap. 1 y 2) | Aprender ×4, Hacer ×7 |
| 2 | Las cuentas, el debe y el haber (cap. 3) | Aprender ×4, Hacer ×7 + desafío |
| 3 | Ingresos, gastos y ajustes (cap. 4) | Aprender ×4, Hacer ×6 |

> Contado en `subjects.js` el 13 de octubre de 2026, no de memoria. El Tema 1
> decía Hacer ×6 y son siete: `t1-desde-donde-preguntan`,
> `t1-que-entro-y-que-salio`, `t1-donde-se-rompio`, `t1-que-le-pasa-a-cada-uno`,
> `t1-la-ecuacion-en-movimiento`, `t1-en-cual-estado-aparece` y
> `t1-la-articulacion`. Lo levantó L, de la Célula C, comparando este archivo
> con el catálogo.
>
> **El Tema 3 no estaba en esta tabla.** Su vocabulario visual tampoco está en
> este archivo todavía: lo que sigue cubre los Temas 1 y 2. Quien construya
> sobre el Tema 3 lo verifica en el código hasta que esto se complete.

**El Tema 1 se construyó después del Tema 2 pero va antes.** Ese desfase es la
causa de la regla siguiente.

## Lo que pertenece al Tema 2 y no puede aparecer en el Tema 1

Para un estudiante que va por el Tema 1, ninguno de estos signos significa nada
todavía. Usarlos ahí los gasta antes de que lleguen a significar algo:

- El **▲** de crecimiento
- El **marcador de saldo** deslizante
- Los **arcos** de transacción
- Los **anclajes**
- Los **colectores**
- La **balanza**
- El **teal y el ámbar con significado de debe y haber**

El teal y el ámbar **sí** valen en la interfaz de marca del Tema 1 —
encabezados, botones, rótulos de sección— pero no dentro del contenido de una
actividad. En el código, el contenido va marcado con `data-contenido` y los
rótulos con `data-rotulo-seccion`, y hay pruebas que miran dentro de esa caja.

## Lo que cada figura del Tema 1 ya significa

Cada pieza de Aprender tiene **su propia figura**, y ninguna presta la de otra:

| Figura | Pieza | Qué significa |
|---|---|---|
| El anillo de cinco puntos, con su franja | 1 · El recorrido de un hecho | El ciclo de la información |
| La torre leída por los dos lados | 2 · La ecuación contable | Una sola cosa contada dos veces |
| Las dos fotos y el tramo entre ellas | 3 · La foto y la película | Un momento contra un periodo |
| Las cinco flechas que convergen | 4 · Cómo se articulan | Todo termina en el mismo informe |

**El anillo de la pieza 1 no se reusa en las otras tres.** Ya significa una cosa
concreta.

## Colores con significado fijo, en toda la materia

| | |
|---|---|
| Coral `#E76F51` | **Error, y solo error.** Sin excepción, en todo el sitio. |
| Teal `#2A9D8F` | Debe (Tema 2), y el acento de interfaz de las demás materias |
| Ámbar `#E9C46A` | Haber (Tema 2), y el acento de interfaz de Contabilidad |
| Neutro `#B8C4D4` | El único color con significado dentro de las figuras del Tema 1 |

El neutro medido contra el fondo real de las piezas (`#0E1B2E`) da **9,78:1**;
el peor caso medido en una pantalla del Tema 1 es **7,46:1**. El umbral para un
elemento gráfico no textual es 3:1.

## Reglas de construcción que ya están cerradas

- **Los FP nunca se restan**, solo suben.
- **375 px** es el ancho de referencia: los estudiantes usan teléfono.
- Las piezas de **Aprender no dan FP** ni tienen dificultad ni modalidad.
- Una actividad se abre por **dos puertas** —el catálogo (`subjects.js`) y el
  registro de la vista del tema—, y las dos tienen que decir lo mismo.
- Toda actividad publicada necesita **regla de etiqueta** en el panel docente, o
  el profesor ve ids crudos.
- Las cifras **se calculan, no se transcriben**: si un total sale de unos datos,
  sale de sumarlos.

## Devoluciones: son DOS cuentas, no dos nombres

**«Devoluciones de ventas»** en el libro de quien vende y **«devoluciones de
compras»** en el de quien compra. Los dos nombres son del libro, literales de
los subtítulos de los asientos modelo de la p. 231, y el mapa del T7 lo recoge
con una frase que zanja la duda: *«las devoluciones en ventas y en compras son
cuentas nominales separadas»*.

No es el mismo hecho con dos nombres —eso sería un choque y habría que elegir
uno—: son dos cuentas distintas, una en cada libro, y el estudiante tiene que
ver las dos. Quien escriba del lado del comprador usa «de compras»; quien
escriba del lado del vendedor, «de ventas». Ninguna célula tiene que pedir
permiso para usar la suya.

**Lo que sí está prohibido** es inventar un tercero. La p. 197 las menciona como
«devoluciones de mercancías»: eso es una mención de paso, no el nombre de la
cuenta. Donde se enseña es §5.5, y manda el nombre de donde se enseña.

Quedó fijado la noche del 13 de octubre, cuando dos células escribían sobre el
mismo concepto sin saberlo: una lo enseñaba desde el libro del comprador y la
otra iba a necesitarlo desde el del vendedor. No chocaron por suerte, porque
las dos siguieron al libro.
