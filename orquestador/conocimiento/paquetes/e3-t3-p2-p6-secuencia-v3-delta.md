# e3 · T3 · P2 y P6 en secuencia · v3, delta sobre la v2 (Itagaki)

> Transcrito por Kamogawa desde la entrega de Itagaki (lote 16; regla j). **Takamura lo revisa en el lote 17.** Más abajo, en «Textos de Miyata», van las dos frases que ella cerró en el lote 16.

Este archivo trae solo lo que cambia. El resto de la forma v2 (`e3-t3-p2-p6-secuencia-v1.md`, §1 a §6) queda igual.

---

## 1 · P6-9: la marca «ESCENARIO SIMULADO» pasa al modelo

**Alto del apoyo con la marca dentro** (pista de 99 caracteres como máximo, 33 caracteres por línea, cabecera supuesta de 124):

| Pista | Alto del apoyo con error | Desborde sobre los 66 del apoyo | ¿Dentro del tope de 40? |
|---|---|---|---|
| 3 líneas | 16 (marca) + 16 (datos) + 66 = 98 | 32 | Sí |
| 4 líneas (una de 99 caracteres puede partirse en 4) | 16 + 16 + 88 = 120 | 54 | **No** |

**Por eso la marca sale del apoyo y pasa a la figura.** Ahí además tiene más sentido, porque lo simulado es la empresa.

**Figura de P6-9 a 320 (150 px):**
- **Marca** «ESCENARIO SIMULADO»: Inter 12/16, peso 600, #A8B6C8 (7,15:1), 16 px de alto.
- 2 px de aire.
- **Las 3 opciones, como una lista unida:** 3 × 44 = 132 px, sin separación entre opciones y con una línea divisoria de 1 px rgba(248,249,250,.12). Cada opción sigue midiendo 44 de alto.
- **Total: 16 + 2 + 132 = 150 de 150** [calculado].
- El estado de cada opción (2 px #F8F9FA o coral) se dibuja por dentro, así que no suma alto.

**A 375 (200 px):** ocupa 150 de 200; sobran 50.

**P6-7 usa la misma lista unida** (132 px, sin la marca), para que las dos pantallas de elegir asiento se vean iguales.

**Apoyo de P6-9:**
- **Con error:** 16 (datos) + 66 = **82 px**. Con una pista de 4 líneas, 16 + 88 = 104, con 38 de desborde: cabe en el tope de 40.
- **Sin error:** sus 87 caracteres en 3 líneas, **66 px**.

---

## 2 · P2-7: la línea de lectura no se apaga

**La línea de lectura de la pieza sigue a la vista en P2-7, siempre.** No va en el apoyo sino **en la fila de control**, que en P2-7 queda libre mientras el estudiante elige. Así queda en el mismo sitio que en las otras siete pantallas de P2.

**Fila de control de P2-7 (44 px):**
- **Línea de lectura:** «Caja $14.650 · Utilidad $6.450», Inter 12/16 #A8B6C8, con las cifras en Inter tabular #F8F9FA. 16 px.
- 4 px de aire.
- **Puente mínimo**, que aparece al acertar. 24 px en total:
  - una línea de cifras de 16 px: «6.450 +15.000 −6.800 = 14.650», en Inter 12 tabular;
  - 2 px de separación;
  - una barra de 6 px.
- **Total: 16 + 4 + 24 = 44** [calculado]. Antes de responder, el espacio del puente queda vacío.

**Alto del apoyo de P2-7:**

| Estado | Alto |
|---|---|
| Sin error | 86 caracteres en 3 líneas, **66 px** |
| Con error | La pista reemplaza al texto: **66 px** con 3 líneas y 88 con 4 (22 de desborde). **La línea de datos ya no hace falta en el apoyo**, porque la lectura sigue a la vista en la figura. |

⚠ **B5 (lo decide Takamura):** sin error, «$14.650» y «$6.450» salen dos veces, en la línea de lectura y en el texto aprobado de P2-7. Itagaki lo deja así porque es la línea de lectura de toda la pieza y el texto no se toca. Si Takamura lo da por falla, la única salida es que Miyata quite las cifras del texto.

**P6-7 y P6-9 no cambian en esto:** la línea de datos solo aparece con el error, porque P6 no tiene línea de lectura.

---

## 3 · Cifras en Inter tabular (el sitio no tiene «mono»)

**Todas las cifras de P2 y P6 van en Inter con `font-variant-numeric: tabular-nums`.** Cambian estas menciones de la v2:

| # | Dónde | Decía | Dice |
|---|---|---|---|
| 1 | §1, la línea de datos | «cifras en mono 12» | «cifras en Inter 12 tabular» |
| 2 | §2, la línea de lectura de P2 | «cifras en mono 12» | «cifras en Inter 12 tabular» |
| 3 | §2, las fichas de P2-2 | «monto (mono 12)» | «monto (Inter 12 tabular)» |
| 4 | §3, la pila de P6-3 y las cifras más largas | «cifra en mono 12» y «84 px en mono 14» | «cifra en Inter 12 tabular» y «en Inter 14 tabular» |

**Medidas que quedan por remedir** (salieron de la métrica de 0,6 em del mono; las mide Ippo):
- «$5.935.000» y «$1.958.550» a 14 px: antes 84 px, **por remedir**.
- La pila de P6-3: antes 234 de 258, **por remedir**.

**La misma métrica de 0,6 em está en entregas anteriores de Itagaki:** los cuatro objetos (#484), «¿Gasto o pago?» (#521) y «Del resultado a la caja» (por ejemplo, «$6.800.000» a 84 px). **Nota de Kamogawa:** esas piezas ya están construidas, y sus sondas midieron el render real con Inter (#533 y #557: ningún corte, nada que se salga). Ahí no queda nada por remedir. Solo aplica a lo que todavía no se ha construido.

---

## Textos de Miyata (lote 16)

| Pantalla | Texto | Car. | INFLESZ (réplica) |
|---|---|---|---|
| P6-4 · pista del primer error (reemplaza la de la v5 §3) | El 33 % va sobre la última cifra que destapaste en la pila. | 59 | 80,6 |
| D11 · Ubicar (reemplaza «Quedan fichas por ubicar.» de la v5 §2) | Cuando ubiques todas las fichas, se abre «Siguiente». | — | — |

La pista señala la pila que el estudiante tiene a la vista, sin nombrar la base. La razón D11 queda igual que las demás: dice lo que se abre, no lo que falta.
