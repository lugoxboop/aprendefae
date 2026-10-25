# DELTA T2-7 · Aprender de T2 en SecuenciaAprender · Near → L
2026-10-24 18:20 (Bogotá)

Las pantallas siguen la numeración de Watari (`c-t2-3-watari-figuras.md`): P1 tiene 8, P2 9, P3 9, P4 10 y P5 8.

**Cómo se arma cada pantalla.**
- **Titular:** la idea, en 10 palabras o menos.
- **Apoyo:** el texto aprobado de la v2, sin reescribir. Lo textual va letra por letra.
- **Razón:** solo en los Haz.
- Lo único nuevo es esto:
  - los titulares de la Apertura y del Cierre;
  - las razones;
  - los pocos apoyos que salen de repartir una oración entre titular y apoyo (marcados ✎);
  - cuatro pares de pista y devolución que la v2 no traía (§6).

**Medición.**
- INFLESZ con `npm run -s inflesz`. Ningún texto nuevo de 10 palabras o más baja de 65; el mínimo es 71,2.
- Los textos de menos de 10 palabras están exentos, y eso incluye todas las razones.

**Conteo de palabras.**
- El conteo es el de `secuencia.js`: titular + apoyo + razón ≤ 60.
- **Ninguna pantalla pasa de 60.** La más cargada es P5·5, con 44.
- También conté el peor caso visible, con las opciones y el mensaje.
  - En el primer error se ven la razón y la pista.
  - En el segundo error se ve la devolución, y la razón se va porque «Siguiente» se libera.
  - Con eso, ninguna pantalla pasa de 60.
- Las más justas:
  - P2·7 y P3·3 llegan a 60 en el primer error, con la frase de consecuencia de Watari. Por eso la razón de P3·3 es la más corta posible.
  - P1·5 llega a 59.
- **Objetivo (S1):** el campo `objetivo` de cada pieza conserva la oración completa de la v2, para la prueba de S1. Lo que va en pantalla es el titular y el apoyo repartidos.

---

## P1 · `cu-a1-anatomia-de-una-cuenta` · 8 pantallas

| pantalla | tipo | titular | apoyo | razón | palabras |
|---|---|---|---|---|---|
| 0 | Apertura | Al terminar, sabrás leer una cuenta T. ✎ | Verás sus dos lados, sus movimientos y su saldo. ✎ | — | 16 |
| 1 | Haz (predicción) | ¿De qué lado? | Esta es la cuenta Caja del ejemplo del libro. Entraron $1.000 y $500, y salieron $150. ¿De qué lado pondrías lo que entra? | Toca un lado para seguir. | 31 |
| 2 | Míralo | Qué es una cuenta | **[textual]** Cuenta: «un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio». | — | 28 |
| 3 | Míralo | Debe y haber | La raya parte la cuenta en dos. El lado izquierdo se llama debe y el derecho, haber. Son nombres de lugar: no dicen si algo sube o baja. | — | 31 |
| 4 | Míralo | Movimientos | Suma cada lado por separado. En Caja, el debe suma $1.500 y el haber, $150. Cada suma es el movimiento de ese lado. | — | 24 |
| 5 | Haz | El saldo | El saldo es la diferencia entre los dos movimientos: $1.350. El último valor que anotaste fue al haber. ¿De qué lado va el saldo? | Elige el lado del saldo para seguir. | 33 |
| 6 | Haz | Debe no es subir | El 18 de enero, Lavado de Autos Mateo le paga $250 a un proveedor. Lo anota en el debe de Cuentas por pagar. ¿La deuda sube o baja? | Elige si la deuda sube o baja. | 39 |
| 7 | Cierre | ¿Cuánto es el saldo y de qué lado va? ✎ | Una cuenta tiene $50 en el debe y $30 en el haber. ✎ (12 · 85,8). Con el paso entra la frase de la v2: «$20, en el debe. Es la diferencia entre los dos movimientos, y va del lado del más grande.» | — | 39 |

En P1·7, la pregunta de la v2 (20 palabras) se reparte entre el titular y el apoyo sin cambiar ninguna palabra.

## P2 · `cu-a2-dos-familias` · 9 pantallas

| pantalla | tipo | titular | apoyo | razón | palabras |
|---|---|---|---|---|---|
| 0 | Apertura | Al terminar, sabrás si una cuenta es real o nominal. ✎ (10 · 84,7) | Te basta una sola pregunta. ✎ | — | 15 |
| 1 | Haz (predicción) | El día después | Llega el cierre del año. ¿Cuál de estas dos cuentas sigue con su saldo al día siguiente: Caja o Ingresos por servicios? | Toca la cuenta que crees que sigue. | 32 |
| 2 | Míralo | Las reales | Las cuentas reales, o de balance, muestran lo que la empresa tiene, sus deudas y lo que es de los socios: activo, pasivo y patrimonio. Su saldo pasa de un año al otro. | — | 35 |
| 3 | Míralo | Las nominales | Las cuentas nominales, o de resultados, nacen de lo que pasa en el periodo: ingresos, gastos y costos. Al cierre vuelven a cero. Por eso también se llaman transitorias. | — | 31 |
| 4 | Haz | ¿Gasto o costo? | Vendes una mercancía. Lo que te costó esa mercancía, ¿es un gasto o un costo? | Elige gasto o costo para seguir. | 24 |
| 5 | Míralo | Tres nominales | Toca cada tarjeta para ver un ejemplo del tema. **[textual]** Ingresos: «los valores que recibe una empresa por la venta de bienes o servicios». Gastos: «los desembolsos necesarios para generar los ingresos». Costos: «desembolsos capitalizables». | — | 36 |
| 6 | Haz | ¿Se cierra igual? | Gastos de operación se mueve casi todos los días. ¿Se cierra igual al final del año? | Elige si se cierra o no. | 25 |
| 7 | Haz | Una sola pregunta | La pregunta que decide la familia es una sola: ¿el saldo sigue después del cierre? Si sigue, la cuenta es real. Si vuelve a cero, es nominal. Ordena estas seis. | Pon las seis cuentas en su cajón. | 40 |
| 8 | Cierre | ¿Por qué el primero es real y el segundo, nominal? ✎ | Salarios por pagar y el gasto en salarios hablan de lo mismo. ✎ (12 · 91,0). Llega con la frase de la v2: «Salarios por pagar es una deuda: sigue ahí después del cierre. El gasto mide lo del periodo y vuelve a cero.» | — | 44 |

## P3 · `cu-a5-debe-y-haber` · 9 pantallas

| pantalla | tipo | titular | apoyo | razón | palabras |
|---|---|---|---|---|---|
| 0 | Apertura | El mismo lado sube unas cuentas y baja otras. ✎ | Al terminar, sabrás por qué pasa eso. ✎ | — | 16 |
| 1 | Haz (predicción) | Mismo lado, mismo monto | Caleja hace dos registros de $50.000, los dos en el debe: uno en Maquinaria y otro en Aportes sociales. ¿Las dos cuentas reaccionan igual? | Elige una opción para seguir. | 33 |
| 2 | Míralo | Efectos opuestos | Maquinaria pasa de $0 a $50.000. Aportes sociales baja de $400.000 a $350.000. El mismo monto y el mismo lado tienen efectos opuestos. | — | 25 |
| 3 | Haz | Dónde vive cada cuenta | Cada cuenta crece por el lado en que vive dentro de la ecuación. El activo vive a la izquierda y crece por el debe. El pasivo y el patrimonio viven a la derecha y crecen por el haber. | Lleva cada cuenta a su casa. | 48 |
| 4 | Haz | La trampa | Con un préstamo de $500, la Caja pasa de $1.000 a $1.500. ¿La empresa ganó $500? | Elige si la empresa ganó o no. | 25 |
| 5 | Míralo | Gastos e ingresos | Gastos e ingresos mueven el patrimonio. Un gasto lo baja, y por eso va al debe. Un ingreso lo sube, y va al haber. Suelta una ficha en cada uno. | — | 33 |
| 6 | Míralo | Prueba tú | Ahora prueba tú. Suelta fichas de $100, $500 y $1.000 en cualquier lado de estas cuatro cuentas y mira qué pasa con cada saldo. | — | 26 |
| 7 | Haz (opciones de cierre) | ¿Por qué Maquinaria subió y Aportes sociales bajó? ✎ | Los dos registros eran de $50.000 en el debe. ✎ | Elige una opción para seguir. | 22 (+18 de opciones) |
| 8 | Cierre | Cada cuenta crece por el lado en que vive ✎ | Maquinaria es activo y vive a la izquierda: crece por el debe. Aportes sociales es patrimonio: vive a la derecha y baja por el debe. | — | 34 |

**Notas de P3.**
- En P3·7, la pregunta de cierre de la v2 se reparte entre titular y apoyo. Si iba entera como titular (17 palabras), con las tres opciones pasaba de 60.
- El titular de P3·8 es la primera oración de P3·3, aprobada. Repetirla en el cierre es a propósito: es la idea de la pieza.

## P4 · `cu-a3-partida-doble` · 10 pantallas

| pantalla | tipo | titular | apoyo | razón | palabras |
|---|---|---|---|---|---|
| 0 | Apertura | Todo hecho se anota dos veces. ✎ | Al terminar, sabrás por qué, y qué tiene que ser igual en cada asiento. ✎ (14 · 94,9) | — | 20 |
| 1 | Haz (predicción) | Una sola línea | Caleja compra un equipo a crédito, por $25.000. Si solo anotas el equipo, ¿los dos lados de la ecuación quedan iguales? | Elige una opción para seguir. | 29 |
| 2 | Míralo | Partida doble | Mira la regla que da nombre a esta pieza: **[textual]** Partida doble: «cualquier transacción siempre se debe registrar dos veces, una vez en el debe de una cuenta y otra vez en el haber de otra cuenta». | — | 38 |
| 3 | Haz | La balanza | Activos = Pasivos + Patrimonio. El equipo sube el activo y la deuda con el proveedor sube el pasivo. Con los dos registros, la balanza vuelve a nivel. | Lleva Cuentas por pagar a su platillo. | 37 |
| 4 | Míralo | Primera regla | Primera regla: activos, gastos y costos aumentan por el debe y disminuyen por el haber. Su saldo suele quedar en el debe. | — | 24 |
| 5 | Haz | Segunda regla | Segunda regla: pasivos, patrimonio e ingresos aumentan por el haber y disminuyen por el debe. Su saldo suele quedar en el haber. Lleva cada familia a su grupo. | Lleva las tres familias a su grupo. | 37 |
| 6 | Haz | Un pago, dos bajas | El 30 de enero, Lavado paga $400 de la hipoteca: Hipoteca por pagar va al debe y Bancos, al haber. ¿Cuál de las dos baja? | Elige cuál de las dos baja. | 35 |
| 7 | Míralo | Simple o compuesto | Un asiento simple toca dos cuentas, y uno compuesto, más de dos. En los dos, la suma del debe tiene que ser igual a la del haber. | — | 30 |
| 8 | Haz | ¿Muchas cuentas descuadran? | El 4 de enero, Lavado anota tres cuentas: una en el debe y dos en el haber. ¿Tener más cuentas de un lado lo descuadra? | Elige si lo descuadra o no. | 34 |
| 9 | Cierre | ¿Tres cuentas cuadran igual que dos? ✎ | Porque lo que se iguala es la suma de cada lado, no el número de cuentas. | — | 22 |

**Choque con la figura (para Watari y Misa).** El paquete de Watari todavía usa ene-03 en P4·8 y en P4·9. El delta T2-3, que aceptaste, cambió P4·8 a **ene-04** (3 cuentas, 1 contra 2, $4.800), para cubrir la confusión de S9 «tres cuentas que cuadran por totales». Así quedan:
- **P4·7:** el selector simple/compuesto sigue con ene-30 y ene-03, como lo dejó Watari. No choca.
- **P4·8 y P4·9:** la figura va con ene-04, y los contadores llegan a $4.800 contra $4.800. El titular de P4·9 habla de «tres cuentas», así que necesita ene-04.

## P5 · `cu-a4-diario-y-mayor` · 8 pantallas

| pantalla | tipo | titular | apoyo | razón | palabras |
|---|---|---|---|---|---|
| 0 | Apertura | Del diario al mayor, sin cambiar el lado. ✎ | Al terminar, sabrás anotar un hecho en el diario y pasarlo al mayor. ✎ (13 · 83,6) | — | 21 |
| 1 | Haz (predicción) | ¿Por fecha o por cuenta? | Lavado de Autos Mateo anotó nueve hechos en enero. Quieres saber cuánto quedó en Bancos. ¿Qué te sirve más: verlos por fecha o agrupados por cuenta? | Elige cómo verlos para seguir. | 36 |
| 2 | Míralo | El diario | El libro diario anota cada hecho en orden de fecha, apenas ocurre. Por eso se le llama libro de registro de asientos originales. Sus columnas son fecha, detalle, debe y haber. | — | 33 |
| 3 | Míralo | Cómo se escribe | En el detalle va primero la cuenta del debe. Debajo, un poco a la derecha, va la del haber, con una explicación corta. | — | 26 |
| 4 | Míralo | El mayor | Después del diario viene el mayor. Allí cada cuenta tiene su propia T y junta todo lo que le pasó en el mes. **[textual]** Libro mayor: «el más importante en cualquier contabilidad». | — | 33 |
| 5 | Haz | Mayorizar | Mayorizar es pasar cada valor del diario a su cuenta del mayor: lo del debe al debe y lo del haber al haber. No se calcula nada nuevo. Lleva las cuatro líneas del 3 de enero. | Lleva las cuatro líneas a su T. | 44 |
| 6 | Haz | Dos preguntas | El diario responde qué pasó el 3 de enero. ¿Qué pregunta responde el mayor? | Elige qué responde el mayor. | 21 |
| 7 | Cierre | ¿En qué libro se registra primero un hecho? ✎ | En el diario. Es el registro de los asientos originales, en orden de fecha. El mayor viene después y ordena esos datos por cuenta. | — | 32 |

En P5·7, el «y por qué» de la pregunta de la v2 lo responde el apoyo, que es la frase de cierre aprobada. Por eso el titular no lo repite.

---

## 6 · Lo que faltaba: pista y devolución en cuatro Haz

Watari les puso escalera, pero la v2 no traía sus textos. Las cuatro son nuevas.

| pantalla | pista (1.er error) | devolución (2.º error) |
|---|---|---|
| P2·7 | Pista: pregúntate si el saldo sigue ahí el 1 de enero. (11 · 71,2) | Si es una real puesta en «Vuelve a cero»: «{Cuenta} es real. Lo que muestra sigue ahí el 1 de enero, y su saldo pasa.» (17 · 73,7 con Obligaciones financieras) · Si es una nominal puesta en «Sigue»: «{Cuenta} mide el año que terminó. Es nominal y vuelve a cero en el cierre.» (19 · 85,9 con Gastos de administración y ventas) |
| P3·3 | Pista: mira de qué lado de la ecuación está cada cuenta. (11 · 88,2) | Confundiste dónde vive con dónde se anota. El activo vive a la izquierda y el patrimonio, a la derecha. (19 · 76,0) |
| P4·3 | Pista: la deuda con el proveedor es un pasivo. (exento) | Pusiste la deuda con el activo. Cuentas por pagar es pasivo, y va del otro lado de la balanza. (19 · 92,4) |
| P4·5 | Pista: ¿de qué lado de la ecuación vive esa familia? (10 · 84,7) | «{Familia} vive a la derecha de la ecuación, así que crece por el haber.» (14 · 81,6 con Patrimonio) |

Las pistas y devoluciones de P1·5, P1·6, P2·4, P2·6, P3·4, P3·7, P4·6, P4·8, P5·5 y P5·6 son las de la v2 y el delta T2-3, sin cambios.
