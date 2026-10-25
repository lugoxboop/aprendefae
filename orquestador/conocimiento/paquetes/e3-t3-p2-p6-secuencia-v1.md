# e3 · T3 · P2 y P6 en secuencia · paquete v1

> Kamogawa, 25-oct-2026. Junta en un solo archivo la forma de P2 «El mes de San Calixto» y P6 «Lo que deja el periodo» (Itagaki, forma v2, transcrita literal en §1 a §6) con un índice de dónde está cada texto de Miyata (§0). **Estado:** Takamura hace la pasada final. Con su PASA, Ippo construye las dos piezas en `SecuenciaAprender`, con la misma bandera de #572 y sin tocar el componente.
>
> **Reglas que se mantienen:**
> - Solo se agrega. **P2 (`t3-a2-el-mes-de-san-calixto`) y P6 (`t3-a6-lo-que-deja-el-periodo`) son piezas nuevas**: se insertan en el camino sin reordenar nada (P2 después de «¿Gasto o pago?»; P6 después de «El cierre completo»).
> - Lo publicado sigue funcionando detrás de la bandera, hasta que la versión nueva esté verificada.
> - Ningún id cambia.

## 0 · Dónde está cada texto (los huecos de Itagaki §5, ya llenos)

| Hueco | Dónde está | Estado |
|---|---|---|
| Titulares de P2 (8) y de P6 (10) | `e3-t3-secuencias-textos-v2.md` §3. P2-8 se reemplaza por el de la v4 §5 («Lo que cambia la utilidad, y lo que no») y P6-10 por el de la v3 §2 («El estado de resultados, de arriba abajo»). | PASA (lotes 12 y 14) |
| FICHAS_P2_2, CUENTAS_P2_4, botones de P2-5 y opciones de P2-7 | textos v2, §3 | PASA (lote 12) |
| CUENTAS_P6_6 y opciones de P6-7 y P6-9 | textos v2, §3 | PASA (lote 12) |
| Razón de P2-2 | textos v2, §4 («Falta tocar un servicio que se cobró el mismo día.») | PASA (lote 11) |
| OBJETIVO_P6 | textos v4, §1 («Calcula lo que deja el periodo y dónde va cada cuenta.») | PASA (lote 14) |
| CIERRE_P6 (2 pasos) | textos v3, §2 | PASA (lote 13) |
| Pistas del primer error: 5 de P2 y 8 de P6 | textos v4, §2. P2-3 no lleva pista porque es un Míralo. **La de P6-4 se reemplaza** por la de la v5, §3. | PASA (lote 14), salvo la de P6-4, que entra en esta pasada |
| Razones del «Siguiente» (D11) | textos v5, §2 | Entra en esta pasada |
| Enunciados, aciertos y errores de P2 y P6, ids, pies y lugar en el camino | `e3-t3-p2-y-p6-v2.md` (Miyata, lote 6), transcrito en este PR | PASA (P2) y PASA con condiciones (P6), lote 6 |

**Decisiones que ya están tomadas y valen aquí:**
- S3: las preguntas «En una frase» de P2-8 y P6-10 pasan al Repaso Diario.
- D1: 60 palabras como máximo por paso visible.
- D3: la pista se retira en el intento siguiente.
- C7: las claves van por contenido y no por número.
- La regla de la tarjeta de cita no aplica: P2 y P6 no tienen citas largas.

**Cuatro medidas antes de montar, en una sola corrida de Ippo** (Takamura, lote 14):
1. La pila de P6-3 con los rótulos reales.
2. La cabecera de Aprender. Si mide más de 124 px, el tope de las pistas baja a 90 caracteres, y la de P6-8 (85 caracteres) hay que revisarla.
3. Los botones de P2-5 en 2 líneas de 80 px.
4. La rejilla 2 × 2 de P2-7.

**Lo de #572 que también aplica aquí:**
- La pastilla nunca tapa el modelo.
- El monto del asiento se ve antes de responder (P2-4 y P6-6).
- Los contadores y la línea de lectura salen de los hechos, no de datos de prueba.

---

# Forma v2 de Itagaki (literal)

Reúne la forma de P2 «El mes de San Calixto» y de P6 «Lo que deja el periodo» con todo lo que ya tiene PASA de Takamura:
- la parte 2 del lote 9;
- la línea de datos encima de la pista (lote 11);
- P2-8 sin acción (lote 11);
- el titular nuevo de P2-8 (lote 15);
- la prioridad entre la pista y la razón (lote 15).

Los textos son de Miyata. Donde falta uno, va un hueco con nombre (§5).

## 1 · Reglas comunes de las dos piezas

**Figura (reserva fija, D5): 150 px a 320 y 200 a 375.**

| Zona de la figura | 320 | 375 |
|---|---|---|
| Modelo | 98 | 148 |
| Separación | 8 | 8 |
| Fila de control (se reserva aunque esté vacía) | 44 | 44 |

- **Botones de la fila de control** [calculado: (258 − 8 × (n − 1)) / n]: 2 de 125 px, 3 de 80 o 4 de 58 a 320. La fila también puede llevar el control ‹ cuenta › (44 + 154 + 44) o el campo de valor de r5.
- **Cuando las opciones ocupan el modelo** (P2-7, P6-7 y P6-9), usan las dos zonas, 140 px como máximo, y la consecuencia va en la fila de control o en el propio modelo.

**Apoyo.**
- Inter 14/22, 4 líneas como máximo a 320 (33 caracteres por línea, 88 px, con 22 de desborde, por debajo del tope de 40).
- Si un texto aprobado pasa de 4 líneas, se reparte en «Paso n de N» **por frase completa**, sin reescribir nada.
- Cada paso tiene 60 palabras como máximo (D1). Una pantalla tiene 5 pasos como máximo (MAX_PASOS).

**Pista del primer error.**
- Reemplaza al apoyo mientras se ve. Tiene 20 palabras y 99 caracteres como máximo (3 líneas, 66 px).
- **Línea de datos:** en las pantallas donde las opciones ocupan el modelo (P2-7, P6-7 y P6-9), mientras se ve la pista aparece encima de ella una línea de 16 px. Va en Inter 12/16 #A8B6C8, con las cifras en mono 12 #F8F9FA y rótulos publicados. Sin error no se muestra, porque esos datos ya están en el texto (B5).
- **Alto del apoyo con error:** 16 + 66 = 82 px. Si la pista se partiera en 4 líneas, serían 16 + 88 = 104 px, con 38 de desborde, todavía por debajo del tope de 40 [calculado sobre la cabecera supuesta de 124].

| Pantalla | Línea de datos |
|---|---|
| P2-7 | «Caja $14.650 · Utilidad $6.450» |
| P6-7 | «Impuesto de renta $1.958.550» |
| P6-9 | «Las Acacias · Pérdida $100.000» |

**Pista y razón (en P2-2 dicen lo mismo).**
- **Manda la pista.** Mientras está en el apoyo, la zona de la razón queda vacía, pero conserva sus 16 px para que nada salte.
- Cuando la pista desaparece (con el siguiente toque), la razón vuelve a su zona.
- Nunca se ven las dos al mismo tiempo.

**Superficie y tokens.** Superficie #1C2939, con borde de 1 px rgba(248,249,250,.12). Contraste sobre esa superficie [calculado, WCAG]:

| Color | Contraste |
|---|---|
| #F8F9FA | 13,98 |
| #A8B6C8 | 7,15 |
| #CBDCF2 | 10,57 |
| #3FA69A («Debe») | 5,00 |
| Ámbar («Haber») | 8,82 |
| Coral | 4,77 |
| #EE8266 sobre el tinte de error | 4,97 |

**Objetos compactos del modelo.**
- **O1 compacto** (asiento): las casillas Debe y Haber lado a lado, de 125 × 52, con su rótulo encima. Alto: 72.
- **T compacta:** alto 88.
- **O4 mini** (resultado): alto 86.
- Sus medidas completas están en el paquete #562.

**Lo que no es de Aprender:** no hay «Comprobar», ni «Iba aquí», ni hojas sobre la pantalla. Las cuentas se eligen con ‹ cuenta ›: al tocar el centro, la cuenta queda puesta.

## 2 · P2 «El mes de San Calixto» · 8 pantallas, 6 con acción

**Modelo:** área de objeto (72) + 4 + **línea de lectura** de 16 px («Caja $X · Utilidad $Y», Inter 12 con las cifras en mono 12), igual en todas las pantallas. Total: **92 de 98**.
- **La utilidad de la línea de lectura va tapada en P2-5 y P2-6, hasta que se responde la 6** (E8). Tapada quiere decir cubierta por un bloque relleno #0E1B2E, sin borde.

| n | Tipo | Toque | Consecuencia | Objeto · fila de control | Apoyo a 320 |
|---|---|---|---|---|---|
| 1 | Apertura | — | Se arman 3 placas (caja $15.000, equipo $5.000, aportes $20.000). Lectura: Caja $15.000 · Utilidad $0. | 3 placas de 80 × 44 · vacía | 113 caracteres → 4 ✓ |
| 2 | Haz | Toca los servicios que entraron. **Cada toque se califica.** | O4 mini: Ingresos $14.800 y la barra de lo cobrado, que crece; la caja sube. **Razón**, mientras falte uno: «Falta tocar un servicio que se cobró el mismo día.» (con la prioridad de §1). | O4 mini · **4 fichas de 58 × 44** con nombre (12/600) y monto (mono 12) | 71 → 3 ✓ |
| 3 | Míralo | Toca la factura de JCC o la de MPS | Su asiento se arma: Cuentas por cobrar – clientes / Ingresos por servicios | O1 compacto · las 2 fichas por cobrar | 105 → 4 ✓ |
| 4 | Haz | Arma el asiento de LCDV | Caja en el debe e Ingresos en el haber; la caja sube $3.000 | O1 compacto, con el monto en su cabecera · ‹ cuenta › | 64 ✓ |
| 5 | Haz | ¿Qué se mueve? | Gastos $8.350 y Salió $8.350; la caja baja | O4 mini · 3 botones de 80 (texto en 2 líneas) | 64 ✓ |
| 6 | Haz | Escribe la utilidad | El corchete de O4 se destapa: «Utilidad $6.450» | O4 mini · campo de r5 | 63 ✓ |
| 7 | Haz | Elige las dos cosas que separan caja y utilidad. **Cada toque se califica.** | Puente mínimo en una línea: 6.450 → +15.000 → −6.800 → 14.650 | **Las 4 opciones, en una rejilla de 2 × 2 de 125 × 44, ocupan el modelo (96)**; el puente va en la fila de control. Si hay error, la línea de datos. | 86 → 3 ✓ (con error, 82 px) |
| 8 | Cierre, **sin acción** | — | El modelo en su estado final: O4 mini con «Utilidad $6.450» y la lectura «Caja $14.650 · Utilidad $6.450» | Fila de control vacía | **2 pasos.** Paso 1: «Vender y consumir. Cobrar y pagar mueven la caja, no la utilidad.» (65 caracteres, 2 líneas). Paso 2: «El 31 todavía falta algo. Desde el 27 usa una máquina alquilada y no la ha pagado.» (83 caracteres, 3 líneas). |

- **Titular de P2-8:** «Lo que cambia la utilidad, y lo que no» (38 caracteres, 1 línea). No repite ninguna frase del apoyo.
- **Las 3 opciones de la vieja P2-8 pasan al Repaso Diario** (S3).

## 3 · P6 «Lo que deja el periodo» · 10 pantallas, 9 con acción

**La vieja P6-10 («En una frase») pasa al Repaso Diario.** El Cierre usa CIERRE_P6, de Miyata.

| n | Tipo | Toque | Consecuencia | Modelo · fila de control | Apoyo a 320 |
|---|---|---|---|---|---|
| 1 | Haz, **2 pasos** | **Paso 1:** ninguno; la figura se arma sola (la T de Ganancias y pérdidas con el saldo tapado) y **OBJETIVO_P6** va en el apoyo. **Paso 2:** aparece la pregunta, Sí / No. | El impuesto se separa del saldo, sin cifra | T compacta (88) · paso 1: fila vacía; paso 2: 2 botones | Paso 1: OBJETIVO_P6 (una oración). Paso 2: 120 → 4 ✓ |
| 2 | Haz, **5 pasos** | Un gasto por paso: «Operación» o «No operacional» | La ficha cae en su zona | Gasto en curso (44) + 2 zonas de 125 × 48 · 2 botones de 125 («No operacional» mide unos 95 px) | 79 ✓ |
| 3 | Haz | Escribe la utilidad antes de impuestos | La pila se destapa: 6.020.000 − 85.000 = 5.935.000 | Pila de 3 renglones (64): rótulo 12 + cifra en mono 12, unos 234 de 258 · campo | 101 → 4 ✓ |
| 4 | Haz | Escribe el impuesto | Se destapan el impuesto (1.958.550) y la utilidad del ejercicio | La misma pila · campo | 97 → 3 ✓ |
| 5 | Míralo | ‹ › por los tramos del estado | Se resalta lo que se resta entre un renglón y el siguiente | «Estado de resultados» (16) + 4 renglones de resumen (80) · ‹ › | 103 → 4 ✓ |
| 6 | Haz, **2 pasos** | Pon cada cuenta del haber | La línea dada del debe (16) + el haber ya puesto (16) + la casilla en curso (44) = 84 | Asiento de 84 · ‹ cuenta › | 82 ✓ |
| 7 | Haz | Elige el asiento | El asiento elegido queda anotado | **3 opciones de 44 + 2 × 4 = 140, que ocupan la figura.** Si hay error, la línea de datos. | 61 ✓ (con error, 82) |
| 8 | Haz, **2 pasos** | Lleva cada cuenta a «Pasivo» o «Patrimonio» | Entra en su zona del estado de situación | La cuenta en curso (32) + 2 zonas de 125 × 60 que se tocan directamente · fila vacía | 66 ✓ |
| 9 | Haz | Elige el asiento de Las Acacias | Igual que la 7 | 3 opciones (140). Si hay error, la línea de datos. | Marca «ESCENARIO SIMULADO» (12/600, #A8B6C8, 16) + 87 caracteres = 82 ✓ |
| 10 | Cierre | — | El estado de resultados completo | Modelo final · fila vacía | CIERRE_P6 (4 líneas como máximo; si pasa, 2 pasos por frase) |

**Las cifras más largas** son «$5.935.000» y «$1.958.550», de 84 px en mono 14. Caben en el campo y en la pila.

## 4 · Correspondencia con Miyata

| Pieza | Correspondencia |
|---|---|
| P2 | Uno a uno con sus 8 pantallas. Su 8 queda sin opciones (pasan al Repaso). |
| P6 | Su 1 a 9, uno a uno (el 1 con dos pasos). Su 10 pasa al Repaso; mi 10 es CIERRE_P6, que es nuevo. |

Si la v5 de Miyata cambia los números, Ippo monta contra el texto.

## 5 · Huecos para Miyata (todos llenos: ver §0)

| Hueco | Tope |
|---|---|
| Titulares de P2-1 a P2-7 y de P6-1 a P6-10 | 54 caracteres y 10 palabras |
| FICHAS_P2_2 (4 rótulos) | 6 caracteres |
| CUENTAS_P2_4 | 4 cuentas como máximo, con nombre publicado |
| Rótulos de los botones de P2-5 | 16 caracteres (2 líneas de 80 px) |
| Rótulos de las opciones de P2-7 | 2 líneas de 125 px |
| OBJETIVO_P6 | 1 oración, 4 líneas como máximo |
| CUENTAS_P6_6 | 4 como máximo: Impuesto de renta, Impuesto de renta por pagar, Utilidad del ejercicio, Caja |
| Textos de las opciones de P6-7 y P6-9 | 2 líneas de 258 px cada una |
| Pistas de P2-7, P6-7 y P6-9 | 99 caracteres |
| CIERRE_P6 | 4 líneas, o 2 pasos por frase |

## 6 · No verificado

- **La cabecera de Aprender:** se supone de 124 px. Si mide más, el tope de las pistas baja a 90 caracteres.
- **La pila de P6-3 con sus rótulos reales:** 234 de 258, calculado. La mide Ippo antes de montar.
- No se ha renderizado.
