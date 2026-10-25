# e3 · T3 · Textos de las secuencias · v3 (lote 11)

> Miyata, 24-oct-2026. Lo transcribió Kamogawa desde el archivo que ella entregó en su chat (regla j). Completa la v1 y la v2: lo que ya está ahí no se repite.
> Todas las cuentas son nombres publicados en P3, P4 o Act3. «Gasto arriendos» va con la grafía de F3.
> El INFLESZ es de la réplica calibrada de Miyata; Ippo lo remide con el oficial. «—» marca los textos de menos de 10 palabras.
> **Regla de los errores:** si una cuenta correcta queda del lado contrario, se muestra un solo error de «al revés» para el par.
> **Estado:** Takamura revisa la §1 en el lote 13. Las §2 y §3 (P6) van al paquete de P2 y P6.

## 1 · Cuentas candidatas de los cuatro asientos (como máximo 4 por asiento)

### CUENTAS_P3_5 · asiento de San Calixto

El asiento correcto es Debe Gasto alquiler $2.500 / Haber Alquiler por pagar $2.500 (Libro, p. 140).

| Pantalla | Cuenta | Dónde va | Error | INFLESZ |
|---|---|---|---|---|
| P3-5 | Gasto alquiler | Debe | (par) | — |
| P3-5 | Alquiler por pagar | Haber | (par) | — |
| P3-5 | Par invertido | — | Va al revés. El gasto crece por el debe y la deuda por el haber. | 112,1 |
| P3-5 | Caja | No va | Todavía no ha pagado. La caja no se mueve: lo que nace es una deuda. | 95,5 |
| P3-5 | Servicios por cobrar | No va | Esa cuenta es de San Miguel, que prestó la máquina. San Calixto la usó: no le deben, él debe. | 99,0 |

### CUENTAS_P3_7 · asiento de San Miguel

El asiento correcto es Debe Servicios por cobrar $2.500 / Haber Ingresos por servicios $2.500 (Libro, p. 142).

| Pantalla | Cuenta | Dónde va | Error | INFLESZ |
|---|---|---|---|---|
| P3-7 | Servicios por cobrar | Debe | (par) | — |
| P3-7 | Ingresos por servicios | Haber | (par) | — |
| P3-7 | Par invertido | — | Va al revés. Lo que le deben crece por el debe y el ingreso por el haber. | 110,4 |
| P3-7 | Caja | No va | San Miguel todavía no ha cobrado. Lo que tiene es una cuenta por cobrar, no plata. | 93,7 |
| P3-7 | Alquiler por pagar | No va | Esa deuda es de San Calixto, que usó la máquina. A San Miguel le deben: no debe nada. | 97,5 |

En P3, cada asiento lleva como señuelo una cuenta del otro asiento. Así se pone a prueba la idea de la pieza: un mismo hecho tiene dos caras.

### CUENTAS_P4_6 · asiento de junio (San Calixto)

El asiento correcto es Debe Gasto arriendos $5.000 / Haber Arriendos pagados por anticipado $5.000. Pie: «Basado en el libro, p. 144», por la regla de C1, porque el libro escribe «Gastos arriendos».

| Pantalla | Cuenta | Dónde va | Error | INFLESZ |
|---|---|---|---|---|
| P4-6 | Gasto arriendos | Debe | (par) | — |
| P4-6 | Arriendos pagados por anticipado | Haber | (par) | — |
| P4-6 | Par invertido | — | Va al revés. El gasto entra por el debe y lo pagado por anticipado sale por el haber. | 94,0 |
| P4-6 | Caja | No va | La plata salió el 1 de junio. Al cierre no sale nada: se consume lo ya pagado. | 92,1 |
| P4-6 | Arriendos por pagar | No va | San Calixto no debe el arriendo: ya lo pagó. Lo que baja es lo pagado por anticipado. | 88,4 |

### CUENTAS_P4_9 · asiento de Arriendos de la Costa

El asiento correcto es Debe Arriendos recibidos por anticipado $5.000 / Haber Ingresos por arriendos $5.000 (Libro, p. 146).

| Pantalla | Cuenta | Dónde va | Error | INFLESZ |
|---|---|---|---|---|
| P4-9 | Arriendos recibidos por anticipado | Debe | (par) | — |
| P4-9 | Ingresos por arriendos | Haber | (par) | — |
| P4-9 | Par invertido | — | Va al revés. Lo recibido por anticipado baja por el debe y el ingreso crece por el haber. | 87,1 |
| P4-9 | Caja | No va | La plata entró el 1 de junio. Al cierre no entra nada: se cumple un mes de lo ya cobrado. | 100,3 |
| P4-9 | Arriendos por cobrar | No va | Nadie le debe a Arriendos de la Costa: ya cobró los tres meses. Lo que baja es lo recibido por anticipado. | 89,5 |

En P4, el señuelo de cada asiento es la cuenta del ajuste acumulado («por pagar» o «por cobrar»), la que se usaría si la plata viniera después. Es la misma distinción que trabaja Act3.

## 2 · CIERRE_P6

| Pantalla | Paso | Texto | Car. | INFLESZ |
|---|---|---|---|---|
| P6-10 | 1 | A la operación se le resta lo no operacional. Así queda la utilidad antes de impuestos. | 87 | 74,2 |
| P6-10 | 2 | El impuesto es deuda; el resto va al patrimonio. | 48 | — |

- **Medida.** El texto completo tiene 136 caracteres: cabe en el máximo de 140, pero pasa de 4 líneas de 33 caracteres a 320 px. Por eso va en 2 pasos.
- **Qué junta del recorrido de P6:**
  - la operación frente a lo no operacional (P6-2);
  - la utilidad antes de impuestos (P6-3);
  - el impuesto (P6-4 y P6-7);
  - adónde va cada cuenta (P6-8).
- **El estado de resultados (P6-5)** queda en el titular. El de P6-10 era «Lo que les queda a los accionistas» en la v2 y pasa a ser este:

| Pantalla | Titular | Pal. | Car. |
|---|---|---|---|
| P6-10 | El estado de resultados, de arriba abajo | 7 | 40 |

- La frase aprobada («Lo que les queda a los accionistas después del impuesto. Por eso va al patrimonio.») sigue en el Repaso Diario, junto con su pregunta.

## 3 · Objetivo de P6, en el apoyo de P6-1

**No había objetivo aprobado.** La ficha de P6 (`e3-t3-p2-y-p6-v2.md`) no trae ninguno, así que lo escribo:

| Pantalla | Dónde | Objetivo | INFLESZ |
|---|---|---|---|
| P6-1 | Apoyo, a la vista antes de la primera pregunta | Calcula cuánto les queda a los accionistas después del impuesto y dónde va cada cuenta. | 75,5 |

- Es una sola oración y empieza con un verbo de acción (D2, Básico).
- Anuncia lo que hace P6 sin dar la respuesta de P6-1, que pregunta si todo el saldo es de los accionistas.
- Dice «accionistas» y no «socios» porque Lavalimpio es una S.A., y así la llama el libro (p. 131).
