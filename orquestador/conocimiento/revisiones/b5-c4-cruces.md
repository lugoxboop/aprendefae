---
id: b5-c4-cruces
titulo: C4 · Los ejemplos y las decisiones de B que se repiten en T3 y T4
procedencia: medicion
---

# C4 · Lo de B que se repite en T3 y T4 (15 de octubre de 2026)

Medido por la Célula B (Kaede) sobre main (`e8f85d4`). **Solo se mide: aquí no se cambia nada.**

## Cómo se midió

`scripts/b5/c4-cruces.mjs` junta todo el texto que ve el estudiante y lo compara. Nada se copia a mano.

| Corpus | De dónde sale | Textos |
|---|---|---|
| **B** | Los módulos de datos de T5 (piezas 1 y 3, a1 y a2) y de T6 (piezas 1-5, a1-a6). b5-t6-a7 queda fuera: se retira en el lote 4 (#281) | 1.021 |
| **T3** | `contabilidadTema3*.js` y su «Así se juega» | 584 |
| **T4** | `contabilidadT4*.js` y `asiSeJuegaT4.js`, más los 28 paquetes de la Célula D (`paquetes/d4-t4-*.md`). En el código de T4 solo están A0, A1 y H1; A2-A5 y H2-H8 están todavía en paquete | 2.991 |

Busca tres señales:
1. **Frases compartidas:** 5 palabras seguidas iguales.
2. **Cifras compartidas:** el mismo monto, de 4 dígitos o más.
3. **Conceptos de B buscados en T3 y T4:** 17 palabras clave, como cheque devuelto, nota débito, cobro a un cliente, intereses o venta a crédito.

Después leí cada coincidencia. En la tabla separo dos cosas:
- **mismo ejemplo:** el mismo hecho, aunque cambien las cifras o el nombre;
- **misma decisión:** lo que el estudiante tiene que decidir ante ese hecho.

## Resumen

- **Tres ejemplos de B se repiten con la misma decisión en T4.** T3 no repite ninguna decisión de B.
  - **El cheque devuelto.** Se practica 5 veces con la misma decisión: «Cuentas por cobrar – clientes se debita».
    - En B, 3 veces: la capa 3 de T6 A1, la ficha de b5-t6-a1 y qd-04 de b5-t6-a4.
    - En T4, 2 veces: A5 y H8-5.
    - Además sale 2 veces en T4 con otra decisión: H6-6 y H7s2-9.
  - **El cliente que paga su factura.** «Cuentas por cobrar – clientes se acredita» se decide en B (T6 A1 y b5-t6-a1) y en T4 (A5 y H8-1), cuatro veces en total.
    - El lado de la plata cambia: en B entra a **Caja** (qd-02, qd-03 y qd-10 de b5-t6-a4) y en T4 a **Bancos**.
  - **La nota débito.** La glosa es la misma palabra por palabra, y con el mismo ejemplo (el cheque devuelto). Es **a propósito**: la vigila `b5-t6-glosa-nota-debito.test.mjs`, y el paquete de A4 de T4 lo dice.
- **Tres ejemplos de B están en T3 o T4, pero con otra decisión.** Ahí el mismo ejemplo hace avanzar la idea, no la repite:
  - el servicio prestado a crédito (T3, T4 y T6);
  - la venta de contado (T3, T4 y T6);
  - los intereses que entran.
- **El resto de lo que coincide es ruido:** las cifras redondas y las frases de interfaz (al final).

## Los cruces

| # | Ejemplo | En B | En T3 / T4 | ¿Mismo ejemplo? | ¿Misma decisión? |
|---|---|---|---|---|---|
| 1 | **Cheque devuelto** | **T6 A1 · capa 3**, caja «cheque-devuelto»: «El banco devuelve el cheque con el que un cliente había pagado.» Lo que deben los clientes sube y se debita.<br>**b5-t6-a1**, ficha «cheque»: «El banco no le paga a la empresa el cheque de un cliente: se lo devuelve.» → Clientes, se debita.<br>**b5-t6-a4 qd-04**: «Un cliente pagó con un cheque, pero el banco lo devolvió.» → se debita Clientes. | **T4 A5** (paquete): «le devolvieron un cheque del cliente Humberto Gómez», asiento Clientes / Bancos 468.000, con la misma razón de B («ese pago nunca llegó»).<br>**T4 H8-5** (paquete): «El banco devolvió un cheque con el que el cliente Pedro Silva había pagado: $356.000.» Asiento Clientes / Bancos.<br>**T4 H6-6** (paquete): ¿quién no lo tiene anotado? → la empresa.<br>**T4 H7s2-9** (paquete): en la conciliación, los libros restan $291.500. | Sí | **Sí en A5 y H8-5** (Clientes se debita). No en H6-6 ni en H7s2-9: allí se decide quién lo tiene anotado y qué hace la conciliación. |
| 2 | **Nota débito** (la glosa) | **T6 A1 · capa 1**, término 4 (`NOTA_DEBITO_T6`): «Con una nota débito, el banco le resta un valor a la cuenta de la empresa. Por ejemplo, cuando le cobra una chequera, o cuando le devuelve el cheque…» | **T4 A4** (paquete), línea 46: el mismo texto, palabra por palabra, y el mismo ejemplo. | Sí | Sí. Es una definición, no una decisión, y es **compartida a propósito** (la guardia de B y la nota del paquete de A4). |
| 3 | **El cliente paga su factura** | **T6 A1 · capa 3**, caja «pago»: «Un cliente paga lo que debía.» Baja, se acredita.<br>**b5-t6-a1**, ficha «pago»: «Un cliente abona una parte de lo que debe.» → Clientes, se acredita.<br>**b5-t6-a4**, qd-02 «La Barranquillera paga la factura.», qd-03 «Un cliente cancela con plata la factura que tenía pendiente.» y qd-10 → se debita **Caja**. | **T4 A5** (paquete): «el cliente Efraín Martínez pagó una factura directo en el banco», asiento **Bancos** / Clientes 645.000.<br>**T4 H8-1** (paquete): «El cliente Gloria Ruiz le pagó a la empresa una factura: consignó la plata directo en el banco.» Bancos / Clientes 528.000.<br>**T4 H1-6** (en código): «Un cliente le paga a una empresa: consigna la plata en la cuenta que esa empresa tiene en el banco.» → Caja no se mueve. | Sí | **Sí: Clientes se acredita**, en las fichas «pago» de B y en A5 y H8-1 de T4.<br>**Variante:** el lado de la plata. B decide «Caja se debita» (qd-02, qd-03, qd-10); T4 decide «Bancos» (A5, H8-1) o «Caja no se mueve» (H1-6). |
| 4 | **Servicio prestado a crédito** | **b5-t6-a1**, ficha «venta-servicio»: «La empresa le presta un servicio a crédito a un cliente.» → Clientes, se debita. | **T4 H1-8** (en código): «Una empresa le presta un servicio a un cliente, y el cliente le va a pagar el mes que viene.» → Caja no se mueve. Comparte la frase «le presta un servicio a».<br>**T3 · «¿Ingreso o cobro?»** (en código): «Ya prestó el servicio de la máquina y no le han pagado los $2.500», y las facturas a JCC y MPS → ingreso sin cobro. | Sí, en los tres temas | **No.** T3 decide si es ingreso o cobro, T4 si se mueve Caja, y B a qué cuenta va y de qué lado. Es la misma escena con tres preguntas. |
| 5 | **Venta de contado** | **T6 A1 · capa 3**, caja «contado»: «La empresa le vende de contado a un cliente.» Lo que deben los clientes no cambia. | **T4 H1-1** (en código): «Un taller arregla las bicicletas de varios clientes. Todos le pagan de contado ese mismo día.» → Caja se debita.<br>**T3 · «¿Ingreso o cobro?»**: «Los ingresos de la primera quincena fueron $3.900.000, todo de contado» → ingreso y cobro a la vez. | Sí | **No:** cada tema pregunta por una cuenta distinta. |
| 6 | **Venta a crédito, en dos momentos** | **T6 A1**, cierre: «Una venta a crédito, dos momentos: el día de la venta sube la deuda y se anota el ingreso; el día del pago baja la deuda y entra la plata.»<br>**b5-t6-a4** qd-01 (vende a crédito a La Barranquillera) y qd-02 (La Barranquillera paga). | **T3 · Aprender «Vender no es cobrar»**: «A veces vende sin que entre un peso.»<br>**T3 · «¿Ingreso o cobro?»**: las facturas enviadas y no cobradas.<br>El paquete de **T4 H1** lo remite a T3: «“Vender no es cobrar” viene del Tema 3». | Es la misma idea | **No:** T3 separa ingreso y cobro; B pone la cuenta Clientes en medio. |
| 7 | **Intereses que entran** | **T5 A3 «tres momentos»**, pasos 4-6 y 14-16: el interés del trimestre entra a Caja, que se debita, y se acredita Ingresos por intereses.<br>**b5-t5-a2**, partes 1 y 3: Caja / Ingresos por intereses (120.000 y 30.000). | **T4 A5** (paquete): «Intereses de la inversión», Bancos / Ingresos por intereses 342.000. Y la glosa de nota crédito de T4 A4: «cuando le abona intereses».<br>**T3 · «Arma el ajuste acumulado»**: «Una inversión generó intereses en marzo que no se han recibido» → Intereses por cobrar / Ingresos por intereses 240.000. Y la demo de «El mismo hecho». | No (B: títulos de Santa Pacha; T4: una inversión que no se nombra; T3: intereses causados y no cobrados) | **En parte.** Ingresos por intereses al haber es la misma decisión en B y en T4 A5; cambia la cuenta de la plata (Caja o Bancos). En T3 la decisión es otra: el interés se causa sin cobrarse. |
| 8 | **Inversiones a corto plazo** | **T5 A1 «del efectivo»**: con los paquetes A y B, se decide cuándo una inversión es temporal (que se venda fácil y que la empresa piense venderla). | **T4 A0** (en código): «Las inversiones a corto plazo.» Las pone como ejemplo de activo corriente, sin decidir nada. | No | No: T4 las nombra y B decide cuándo lo son. |

**Sin cruce** (solo están en B). Ninguno aparece en T3 ni en T4 con la misma decisión:
- la provisión, el castigo, el valor neto y la provisión por edades;
- la devolución de mercancía y el descuento al cliente: T4 solo menciona la nota crédito del vendedor, para «Inventarios I»;
- los préstamos a socios, trabajadores, particulares y clientes: T3 tiene un préstamo, pero **recibido** («Recibió un préstamo de $5.000.000»), en la dirección contraria;
- los dividendos.

## Lo que coincide y no es un cruce

- **Las cifras.** Coinciden 2.500, 80.000, 100.000, 120.000 y 500.000, y ninguna es el mismo ejemplo:
  - **2.500:** en B son títulos; en T3, el servicio de una máquina; en T4 H4, otro hecho;
  - **120.000:** en B es el interés de un trimestre; en T3, el alquiler diario de unos equipos.

  Son cifras redondas en hechos distintos.
- **Las frases de interfaz:**
  - **La consigna de la mesa** («Lee el hecho. Arma el asiento…») es la misma en b5-t5-a2, b5-t6-a2, b5-t6-a3 y en dos «Así se juega» de T3. Sale de la misma plantilla.
  - **«En el estado de situación financiera»** aparece en T4 A0 y en varias piezas de T6.

## Para decidir (no se decide aquí)

- **El cheque devuelto.** Hoy se decide 3 veces en B, y T4 lo practica 2 veces más con la misma decisión. Cuando T4 A5 y H8 salgan de paquete, el estudiante lo verá 5 veces.
- **El cliente que paga su factura.** Lo practican B (2 fichas con Clientes, y 3 de b5-t6-a4 con Caja) y T4 A5 y H8-1, con Bancos.
- **Las dos decisiones vienen del libro en temas distintos:**
  - **T4 (pp. 189-191):** el cheque como nota débito;
  - **T6:** el cheque como deuda que revive.

  Repartir quién las practica es de Sakuta y Mai.

`node --import ./scripts/cargador-jsx.mjs scripts/b5/c4-cruces.mjs` vuelve a sacar las tres señales, en JSON.
