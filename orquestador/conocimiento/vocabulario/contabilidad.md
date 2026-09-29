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
| 1 | Introducción a la contabilidad (cap. 1 y 2) | Aprender ×4, Hacer ×6 |
| 2 | Las cuentas, el debe y el haber (cap. 3) | Aprender ×4, Hacer ×7 + desafío |

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
