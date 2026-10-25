# e3 · T3 · Textos de las secuencias · v2 (lote 10)

> Miyata, 24-oct-2026. Lo transcribió Kamogawa desde el archivo que ella entregó en su chat (regla j).
> Completa `e3-t3-secuencias-textos-v1.md`; lo que ahí ya pasó no se repite.
> **Estado:** los titulares nuevos de P3, P4 y P5 (§1 y §2) y todo lo de P2, P6 y Act4 (§3 a §5) los está revisando Takamura en el lote 12.
> Límites: titulares de 10 palabras y 54 caracteres como máximo; textos de 140 caracteres como máximo.
> El INFLESZ es de la réplica calibrada de Miyata; Ippo lo remide con el oficial. «—» marca los textos de menos de 10 palabras.

## 1 · Titulares de Apertura que faltaban (P3 y P4)

Las dos son simétricas a propósito: en P3 la plata va detrás del hecho, y en P4 va delante.

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P3 · Apertura | Cuando el gasto va adelante de la plata | 8 | 39 |
| P4 · Apertura | Cuando la plata va adelante del gasto | 7 | 37 |

## 2 · Titulares de las pantallas que Itagaki partió en P5

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P5 · pasar ingresos (antes «Todo pasa a Ganancias y pérdidas») | Los ingresos pasan a Ganancias y pérdidas | 7 | 41 |
| P5 · pasar gastos (nueva) | Ahora pasan los gastos | 4 | 22 |
| P5 · Las Acacias, ingresos | Otra empresa, otro mes: Las Acacias | 6 | 35 |
| P5 · Las Acacias, gastos (nueva) | Las Acacias: ahora pasan sus gastos | 6 | 35 |

Al partir la pantalla, «Todo pasa a Ganancias y pérdidas» ya no describe la primera mitad. Por eso le cambio el titular; el cambio es reversible.

## 3 · Huecos de P2 y P6

### P2 «El mes de San Calixto»

**FICHAS_P2_2** · rótulos de 6 caracteres o menos

| Pantalla | Ficha | Rótulo | Car. | Monto que muestra la ficha | ¿Se cobró? |
|---|---|---|---|---|---|
| P2-2 | Servicio del 5 de enero | Día 5 | 5 | $5.000 | Sí |
| P2-2 | Factura a JCC | JCC | 3 | $4.000 | No |
| P2-2 | Servicio a LCDV | LCDV | 4 | $3.000 | Sí |
| P2-2 | Factura a MPS | MPS | 3 | $2.800 | No |

**CUENTAS_P2_4** · 4 cuentas

| Pantalla | Cuenta | Dónde va | Error si la usa mal | INFLESZ |
|---|---|---|---|---|
| P2-4 | Caja | Debe | Al revés: «Va al revés. La caja sube por el debe y el ingreso por el haber.» | 108,0 |
| P2-4 | Ingresos por servicios | Haber | (el mismo error de «al revés») | — |
| P2-4 | Cuentas por cobrar – clientes | No va | «LCDV pagó el mismo día: nadie le debe. La plata entra a la caja.» | 101,9 |
| P2-4 | Aportes sociales | No va | «La plata vino de un cliente por un servicio, no de los socios.» | 102,8 |

**Botones de P2-5** · 3 botones de 80 px, en 2 líneas

| Pantalla | Botón | Correcta |
|---|---|---|
| P2-5 | Solo el gasto | |
| P2-5 | Solo la caja | |
| P2-5 | Las dos | ★ |

**Opciones de P2-7** · 4 opciones de 125 × 44; se eligen dos

| Pantalla | Opción | Correcta |
|---|---|---|
| P2-7 | El aporte | ★ |
| P2-7 | Lo que falta cobrar | ★ |
| P2-7 | Los gastos pagados | |
| P2-7 | El equipo | |

Los errores de P2-5 y P2-7 son los de `e3-t3-p2-y-p6-v2.md`, sin cambios.

### P6 «Lo que deja el periodo»

**CUENTAS_P6_6** · las 4 que propone Itagaki, aceptadas

| Pantalla | Cuenta | Dónde va | Error si la usa mal |
|---|---|---|---|
| P6-6 | Impuesto de renta | Haber, $1.958.550 | — |
| P6-6 | Utilidad del ejercicio | Haber, $3.976.450 | — |
| P6-6 | Impuesto de renta por pagar | No va | «Primero va a Impuesto de renta. En el asiento siguiente pasa a la cuenta por pagar.» (89,8) |
| P6-6 | Caja | No va | «El impuesto no se paga al cerrar. Aquí no sale plata.» (99,4) |

Ganancias y pérdidas ($5.935.000) viene puesta en el debe. Si el estudiante la lleva al haber: «Ganancias y pérdidas tiene saldo en el haber. Para dejarla en cero, va al debe.» (87,2)

**Opciones de P6-7** («¿Ya se pagó el impuesto? Elige el asiento que lo deja anotado.»)

| Pantalla | Opción | Correcta | Error | INFLESZ |
|---|---|---|---|---|
| P6-7 | Debe · Impuesto de renta / Haber · Impuesto de renta por pagar | ★ | — | — |
| P6-7 | Debe · Impuesto de renta / Haber · Caja | | El impuesto aún no se paga. No sale plata: queda la deuda. | 97,0 |
| P6-7 | Debe · Impuesto de renta por pagar / Haber · Impuesto de renta | | Va al revés. La deuda crece por el haber. | — |

**Opciones de P6-9** (Las Acacias, pérdida de $100.000)

| Pantalla | Opción | Correcta | Error | INFLESZ |
|---|---|---|---|---|
| P6-9 | Debe · Pérdida del ejercicio / Haber · Ganancias y pérdidas | ★ | — | — |
| P6-9 | Debe · Ganancias y pérdidas / Haber · Pérdida del ejercicio | | Ganancias y pérdidas quedó en el debe. Para dejarla en cero, va al haber. | 88,6 |
| P6-9 | Debe · Ganancias y pérdidas / Haber · Utilidad del ejercicio | | Con pérdida no hay utilidad que repartir. El saldo quedó en el debe. | 90,1 |

En P6-9 cambia la tercera opción. Antes era el cierre con impuesto, que necesitaba dos cuentas en el haber y era más larga que las otras: se notaba que era distinta (regla 3.6). Ahora las tres tienen una cuenta por lado. Su error reemplaza al anterior, «Con pérdida no hay impuesto que calcular».

### Titulares de P2 (8)

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P2-1 · Apertura | Un enero completo de San Calixto | 6 | 32 |
| P2-2 · ¿cuáles se cobraron? | Cuatro servicios vendidos, ¿cuáles se cobraron? | 6 | 47 |
| P2-3 · Míralo: el ingreso al haber | El ingreso crece por el haber | 6 | 29 |
| P2-4 · asiento de LCDV | Un servicio cobrado, en un asiento | 6 | 34 |
| P2-5 · los cuatro gastos | Cuatro gastos pagados en efectivo | 5 | 33 |
| P2-6 · escribir la utilidad | La utilidad de enero, hasta aquí | 6 | 32 |
| P2-7 · caja frente a utilidad | La caja no es la utilidad | 6 | 25 |
| P2-8 · Cierre | Al 31 todavía falta algo | 5 | 24 |

Con S3, el Cierre de P2 se queda sin la pregunta: muestra la frase y el enlace a P3. La pregunta «¿Qué cambia la utilidad del mes?» y sus devoluciones pasan al Repaso Diario, como las de las demás piezas.

### Titulares de P6 (10)

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P6-1 · Apertura | ¿Todo lo que ganó es de los accionistas? | 8 | 40 |
| P6-2 · operacional o no | Lo de lavar ropa y lo que no | 8 | 28 |
| P6-3 · utilidad antes de impuestos | La utilidad antes del impuesto | 5 | 30 |
| P6-4 · el impuesto | El impuesto: 33 % en este ejercicio | 7 | 35 |
| P6-5 · Míralo | Esto se llama estado de resultados | 6 | 34 |
| P6-6 · cierre de Ganancias y pérdidas | Ganancias y pérdidas se reparte | 5 | 31 |
| P6-7 · impuesto por pagar | El impuesto queda por pagar | 5 | 27 |
| P6-8 · cada cuenta a su estado | Cada cuenta a su estado | 5 | 23 |
| P6-9 · Las Acacias | Cuando el mes deja pérdida | 5 | 26 |
| P6-10 · Cierre | Lo que les queda a los accionistas | 7 | 34 |

Con S3, P6-10 tampoco lleva pregunta: queda la frase de cierre. «¿Qué es la utilidad del ejercicio?» y sus devoluciones van al Repaso Diario.

## 4 · P2-2 · decisión sobre el error que ya no se dispara

**Decidido:** el texto «Ese servicio se cobró el mismo día. La plata ya entró.» se retira. Su idea pasa a ser la razón del botón «Siguiente» desactivado, mientras falte tocar un servicio cobrado.

| Pantalla | Cuándo se ve | Texto | INFLESZ |
|---|---|---|---|
| P2-2 | «Siguiente» desactivado, con un servicio cobrado sin tocar | Falta tocar un servicio que se cobró el mismo día. | 90,9 |

El error por tocar una factura sigue igual, calificado al toque: «Esa factura se envió, pero no se ha cobrado. El ingreso ya existe; la plata no.» (89,8)

## 5 · El regalo de Act4 («Salarios acumulados *por pagar*»)

El hecho nombraba la cuenta del haber. La versión nueva dice lo que pasó sin nombrar ninguna cuenta. El mismo regalo está también en el ítem de Galindo, así que lo corrijo igual.

| Pantalla | id | Hecho actual | Hecho nuevo | INFLESZ | Anclajes nuevos |
|---|---|---|---|---|---|
| Act4 · ítem | t3a4-salarios-caribe | Salarios acumulados por pagar a marzo 31 | Marzo 31: los empleados ya trabajaron el mes. Aún no les pagan. | 81,4 | Gasto salarios → «ya trabajaron el mes» · Salarios por pagar → «Aún no les pagan» |
| Act4 · ítem | t3a4-salarios-galindo | Salarios acumulados por pagar a diciembre 31 | Los empleados trabajaron hasta el 31 de diciembre. Aún no les pagan. | 71,0 | Gasto salarios → «trabajaron hasta el 31 de diciembre» · Salarios por pagar → «Aún no les pagan» |

- Los valores ($125.000 y $210.000) siguen en las fichas, como hoy.
- **Fidelidad.** El libro dice «salarios acumulados por pagar»:
  - p. 172: «A marzo 31, la empresa tiene salarios acumulados por pagar, por valor de $125.000»;
  - p. 173: «Los salarios acumulados por pagar en la fecha ascienden a $210.000».

  La versión nueva dice lo mismo sin el nombre de la cuenta. El pie sigue siendo «Basado en el libro».
- **Para Ippo:** los anclajes son trozos literales del hecho, así que hay que cambiarlos junto con el texto. Si no, apuntan a palabras que ya no existen.
- **No toco:** «Intereses pendientes de pago a marzo 31». Dice que falta pagar, pero no nombra la cuenta («Intereses por pagar»), así que no regala la respuesta en la misma medida.
