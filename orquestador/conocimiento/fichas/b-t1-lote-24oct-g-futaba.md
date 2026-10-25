# T1 · Lote del 24-oct, séptima parte (Futaba): cu0-a1, fidelidad (auditoría `b-t1-559-shoko.md`)

Todo está medido con `npm run inflesz` y da ≥ 65. Respeta los topes de la secuencia: 18 palabras en el apoyo y 25 en la razón.

## 1 · cu0-a1 · 1 y 2: decir qué se cuenta

| Pantalla | Hoy | Nuevo | INFLESZ · palabras | Nota |
|---|---|---|---|---|
| 1 · razón (las tres opciones) | Son cinco, y anotar es solo el tercero. Con las notas sale un informe, y alguien decide. | Del hecho a la decisión hay cinco pasos, y anotar es el tercero. | 88,4 · 13 | **La de Shoko, tal cual.** Coincide con el capítulo 1: el Gráfico 1.1 (p. 6) va de la actividad de la empresa hasta las decisiones de la administración en cinco estaciones, y registrar es la tercera |
| 2 · apoyo | Toca cada cosa que el sistema permite hacer. Son siete. Registrar, que es anotar, es solo una. | Toca lo que el sistema permite hacer con los hechos. Son siete verbos; registrar es anotar. | 85,9 · 16 | **La de Shoko, ajustada.** Tenía 19 palabras, una más que el tope del apoyo. Además, «distintos de los cinco pasos» no es exacto contra el libro: «registrar», uno de los siete verbos del recuadro de la p. 6, es el mismo paso 3 del Gráfico 1.1. Mi versión dice qué se cuenta («siete verbos») y conserva el puente con la pantalla 1 |

## 2 · cu0-a1 · 8: el balance que se ve

**Decisión: cambio de momento.** En lugar del balance después de la sexta transacción (p. 39, total $415.000, 7 cuentas), va el **balance después de la segunda transacción** (pp. 36-37, total $325.000). Es justo el momento del hecho que sigue la pieza: el computador comprado a crédito y sin pagar.

| Activo | | Pasivo y patrimonio | |
|---|---|---|---|
| Efectivo | $300.000 | Cuentas por pagar | $25.000 |
| **Equipo de computación** (resaltado) | $25.000 | Aportes sociales | $300.000 |
| **Total activos** | **$325.000** | **Total pasivo y patrimonio** | **$325.000** |

**Por qué este y no el de la sexta:**
- **Cuadra a la vista.** Son las 4 cuentas del momento: no queda ninguna fuera ni hace falta el pie «y 3 líneas más». Los dos totales se ven iguales, que es lo que se enseña dos pantallas después.
- **La deuda coincide con el hecho.** Cuentas por pagar es $25.000, lo mismo que dicen las pantallas 4 y 5 («No lo paga: lo queda debiendo»). En la sexta ya se habían pagado $10.000 (transacción 4) y quedaba en $15.000.
- **Es del libro, sin construir nada.** Son las cifras y los nombres de la tabla de pp. 36-37 («Efectivo», «Equipo de computación», «Cuentas por pagar», «Aportes sociales»). Por eso no lleva «Escenario simulado».
- **Cabe:** 4 renglones más los totales, por debajo del máximo de cinco más el total.

**Lo que hay que cambiar con esto:**
- `CUENTA_RESALTADA` (I:141) sigue siendo «Equipo de computación».
- El componente de la estación 4 hoy calcula el balance desde el mayor con `CALEJA.transacciones`, las seis. Kaede tiene que cortarlo **en las dos primeras** (`CALEJA.transacciones.slice(0, 2)`) para esta pantalla. Las demás actividades que usan las seis no cambian.
- Quitar el pie «y 3 líneas más» de esta pantalla. La regla 5 de Mai §2.1 ya no aplica, porque caben todas.
- **Nombre de la caja:** el libro dice «Efectivo» y la ficha anterior decía «Caja». Va «Efectivo», como la tabla del libro y como el estado de situación financiera de t1-7.
- El apoyo de la pantalla 8 («La nota se juntó con las demás en un informe. Tu computador ya es una línea entre muchas.») se puede quedar. Pero con 4 renglones, «entre muchas» exagera. Propongo el apoyo completo: «La nota se juntó con las demás en un informe. Tu computador ya es una de sus líneas.» (97,5; 18 palabras).
