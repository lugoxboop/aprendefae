# e3 · T3 · Textos de las secuencias · v4 (lote 13)

> Miyata, 24-oct-2026. Lo transcribió Kamogawa desde el archivo que ella entregó en su chat (regla j). Completa la v1, la v2 y la v3: lo que ya está ahí no se repite.
> El INFLESZ es de la réplica calibrada de Miyata; Ippo lo remide con el oficial.
> **Estado:** Takamura lo revisa en el lote 14.

## 1 · Objetivo de P6, sin nombrar el impuesto

| Pantalla | Dónde | Objetivo | Pal. | INFLESZ |
|---|---|---|---|---|
| P6-1 | Apoyo, a la vista antes de la primera pregunta | Calcula lo que deja el periodo y dónde va cada cuenta. | 11 | 88,2 |

- Reemplaza al de la v3, que nombraba el impuesto y con eso le daba la respuesta a P6-1. Es la propuesta de Takamura tal cual.
- Es una sola oración y empieza con un verbo de acción (D2, Básico).
- «Lo que deja el periodo» repite el título de la pieza y no dice qué parte del saldo es de los accionistas.

## 2 · Pistas del primer error de P2 y P6

Cumplen las tres condiciones: 20 palabras como máximo, ninguna dice la respuesta, y las de P2-7, P6-7 y P6-9 caben en 99 caracteres.

### P2 (5, más 1 descartada)

| Pantalla | Decisión | Pista | Pal. | Car. | INFLESZ |
|---|---|---|---|---|---|
| P2-2 | ¿Cuáles se cobraron? | Busca los servicios que se pagaron el mismo día que se prestaron. | 12 | 65 | 85,8 |
| ~~P2-3~~ | ~~El ingreso al haber~~ | ~~El ingreso crece por un lado y lo que te deben por el otro.~~ | 14 | 59 | 103,8 |
| P2-4 | Asiento de LCDV | Entró plata y nació un ingreso. ¿Por qué lado crece cada uno? | 12 | 61 | 91,8 |
| P2-5 | Los cuatro gastos | Pregunta dos cosas por separado: ¿se consumió algo? ¿Salió plata? | 10 | 65 | 71,0 |
| P2-6 | Escribir la utilidad | La utilidad sale de restar: lo vendido menos lo consumido. | 10 | 58 | 66,0 |
| P2-7 | Las dos cosas que separan caja y utilidad | Busca lo que movió la caja sin pasar por la utilidad, y al revés. | 14 | 65 | 94,9 |

**P2-3 queda sin pista (decisión de Kamogawa).** En la forma de Itagaki es un Míralo: se toca una factura y su asiento se arma solo, sin decisión que fallar. Por eso P2 tiene 5 pistas.

### P6 (8)

| Pantalla | Decisión | Pista | Pal. | Car. | INFLESZ |
|---|---|---|---|---|---|
| P6-1 | ¿Todo es de los accionistas? | Antes de saber qué les toca a los accionistas, ¿falta algo por restar? | 13 | 70 | 88,4 |
| P6-2 | Operación o no operacional | Pregúntate si ese gasto sale de lavar ropa o de cómo se financia la empresa. | 15 | 76 | 75,5 |
| P6-3 | Utilidad antes de impuestos | A la utilidad de la operación todavía le falta restar un gasto. | 12 | 63 | 70,2 |
| P6-4 | El impuesto | Saca el 33 % de la utilidad antes de impuestos, no de otra cifra. | 14 | 65 | 78,8 |
| P6-6 | Cierre de Ganancias y pérdidas | El saldo de Ganancias y pérdidas se reparte en dos partes. ¿Cuáles? | 12 | 67 | 91,8 |
| P6-7 | ¿Ya se pagó el impuesto? | Pregúntate si ya salió la plata del impuesto, o si todavía se debe. | 13 | 67 | 78,8 |
| P6-8 | Cada cuenta a su estado | Pregúntate a quién le pertenece cada cuenta: a los accionistas o a alguien de afuera. | 15 | 85 | 71,4 |
| P6-9 | Las Acacias, pérdida | Mira de qué lado quedó el saldo. Para dejarlo en cero, va al lado contrario. | 15 | 76 | 91,3 |

## 3 · De dónde salen «Arriendos por pagar» y «Arriendos por cobrar»

**Las dos ya están publicadas, pero en la plataforma, no en el libro.** Salen de Act3 «El mismo hecho, dos empresas», par «El arriendo» (`src/data/contabilidadTema3Act3.js`), donde son la cuenta del «otro tipo de ajuste»:
- `empresa("san-calixto", …, "Arriendos por pagar")` es el señuelo de San Calixto.
- `empresa("arriendos-de-la-costa", …, "Arriendos por cobrar")` es el señuelo de Arriendos de la Costa.

Si el estudiante elige mal, Act3 muestra su error de tipo C: «Esa cuenta no se mueve en este hecho. Pertenece al otro tipo de ajuste, no a este.»

**Decisión: se quedan.** En P4 cumplen el mismo papel que en Act3, y así el estudiante ya conoce el señuelo cuando llega a esa actividad. Los textos de error de la v3 no cambian.

**Precisión para el canon:** el libro no usa ninguna de las dos en las pp. 143-146. Son nombres de la plataforma, armados igual que «Alquiler por pagar» (p. 140).

## 4 · «Servicios por cobrar» frente a «Cuentas por cobrar – clientes»

**El libro usa los dos nombres, cada uno en una situación distinta** (verificado a ojo):

| Nombre | Dónde lo usa el libro | Situación |
|---|---|---|
| Cuentas por cobrar – clientes | pp. 122-123: diario y mayor de San Calixto («Cuentas por cobrar – Clientes JCC», «Ctas x cobrar – clientes») | Una factura enviada a un cliente durante el mes |
| Servicios por cobrar | p. 142: asiento de ajuste de San Miguel, mayor «SERVICIOS POR COBRAR» y diagrama del balance | El ajuste de un ingreso acumulado al cierre |

**Decisión: se quedan los dos, cada uno donde lo usa el libro.**
- **«Servicios por cobrar»** va en P3 (San Miguel) y en los ítems de Act3 y Act4 que salen del ajuste de la p. 142.
- **«Cuentas por cobrar – clientes»** va en P2, P5-2 y «Del resultado a la caja» (#557), que salen de las facturas de enero (pp. 121-123).

Cambiar uno por el otro le quitaría fidelidad a la página citada. Además, «Servicios por cobrar» ya está publicada en P3, Act3 y Act4, que tienen estudiantes.

**La excepción a la regla 3.9** («un término, un solo nombre») queda escrita en el mapa del capítulo 4 (`mapas/t3-ingresos-gastos.md`, adenda 2), para que el próximo auditor no la marque como choque.

## 5 · Titular nuevo de P2-8 (lote 14)

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P2-8 · Cierre | Lo que cambia la utilidad, y lo que no | 9 | 38 |

- Reemplaza a «Al 31 todavía falta algo» (v2), que repetía casi literal la primera frase del enlace aprobado del apoyo. Lo pidieron Itagaki y Takamura.
- Resume la primera parte del apoyo («Vender y consumir…») sin adelantar el enlace a P3.

**Pendiente para P2 y P6 (Takamura, lote 14):**
- La pista de P6-4 dice la respuesta, porque nombra la base («de la utilidad antes de impuestos»). Miyata la reescribe para que señale sin nombrar la cifra.
- En P2-2, la pista y la razón del «Siguiente» no pueden verse al mismo tiempo en pantalla. Lo resuelve Itagaki.
