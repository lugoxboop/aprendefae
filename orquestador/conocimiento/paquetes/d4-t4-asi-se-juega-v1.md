**T4 · Textos de «Así se juega» para H1-H8 · versión 1.**
- Autora: Katsumi. Para Yujiro, que decide la mecánica, y para Baki, que construye.
- Modelo: `src/data/asiSeJuegaTema5.js`, `asiSeJuegaTema6.js` y `asiSeJuegaTema3.js`. Allí, cada «Así se juega» lleva estas partes:
  - `titulo` y `consigna`, que salen de la actividad;
  - `pasos`: tres líneas cortas;
  - `demo`: un ejemplo **fuera del banco** de la actividad;
  - `alt`: el texto alternativo del ejemplo resuelto, sin «Ejemplo:», porque el componente lo antepone;
  - `guion`: los toques de la mano, con selectores del código;
  - `cuadros`.
- **Aquí va lo que es contenido: los pasos, el ejemplo y el texto alternativo.** El guion y los cuadros son de Baki, porque dependen de los selectores que construya. Para cada actividad digo qué hace la mano, para que el guion lo siga, pero no escribo selectores ni tiempos.
- **Sin controles inventados.** Cada paso nombra solo lo que la mecánica de la orden ya tiene: tarjetas y destinos, opciones, cuentas y lados, campos de cifra y «Confirmar». Donde la mecánica no está fijada del todo, lo marco.
- **Ningún ejemplo usa una cifra o un caso del banco de su actividad**, para que la demostración no regale una respuesta. Las cifras de los ejemplos son construidas y calculadas.
- INFLESZ: **medido** por script con `src/herramientas/inflesz.js`. Todo texto de 10 o más palabras da 65 o más; el más bajo es 66,2.

## H1 · ¿Entra o sale de Caja? (`t4-entra-o-sale-de-caja`)

- **Mecánica que demuestra:** Tarjetas a tres destinos.
- **Pasos:**
  1. «Lee el hecho de la tarjeta.» (<10)
  2. «Pregúntate si entra plata a la caja, si sale, o si no la toca.» (94,9)
  3. «Manda la tarjeta al debe de Caja, al haber de Caja o a «Caja no se mueve».» (94,6)
- **Ejemplo (`demo`):** «Una cafetería paga en efectivo, con billetes de la caja, la leche del día.» (68,2)
  - *[Hecho construido, que no está en el banco de H1 (sus ocho hechos son otros).]*
- **Texto alternativo (`alt`):** «La tarjeta dice que una cafetería paga la leche con billetes de la caja. Sale plata de la caja, así que la tarjeta va al haber de Caja.» (83,8)
- **Lo que hace la mano (para el guion de Baki):** Una sola tarjeta. La mano la arrastra a «Haber de Caja» y aparece la retroalimentación de acierto.

## H2 · El control que se saltaron (`t4-el-control-que-se-saltaron`)

- **Mecánica que demuestra:** Un caso y tres opciones.
- **Pasos:**
  1. «Lee el caso.» (<10)
  2. «Busca qué se hace mal con la plata.» (<10)
  3. «Elige el control que no se cumple. Tienes un intento por caso.» (97,0)
- **Ejemplo (`demo`):** «Una floristería guarda en la caja el efectivo de quince días antes de llevarlo al banco.» (66,2)
  - *[Caso construido, que no está en el banco de H2. Usa el control de consignar cada día, igual que el caso H2-2, pero con otro negocio y otro plazo. *[Si Yujiro prefiere que la demostración no use un control que luego se evalúa, se cambia por uno que no esté en el banco. Los siete controles sí están en el banco, así que no hay uno libre: esa es la razón de esta elección.]*]*
- **Texto alternativo (`alt`):** «El caso dice que la floristería guarda quince días de efectivo en la caja. El control que no se cumple es llevar al banco, cada día, el efectivo que se recibe.» (80,8)
- **Lo que hace la mano (para el guion de Baki):** La mano toca la opción del control 2 y aparece el acierto.

## H3 · ¿Se mueve la caja menor? (`t4-se-mueve-la-caja-menor`)

- **Mecánica que demuestra:** Armar el asiento eligiendo cuentas y lados.
- **Pasos:**
  1. «Lee la operación de la caja menor.» (<10)
  2. «Elige las dos cuentas que se mueven y el lado de cada una.» (98,0)
  3. «Confirma. Tienes un intento por operación.» (<10)
- **Ejemplo (`demo`):** «El 2 de enero, Papelería Arcoíris abre una caja menor de $200.000. Le hace un cheque a Julio, que la va a manejar.» (73,4)
  - *[Operación construida, con otra empresa (Papelería Arcoíris) y otra cifra. Es una apertura, la operación más simple. No muestra el reembolso, que es la trampa que se evalúa.]*
- **Texto alternativo (`alt`):** «Para abrir la caja menor, Caja menor va al debe y Bancos va al haber, las dos por $200.000. La plata pasa del banco al fondo.» (95,6)
- **Lo que hace la mano (para el guion de Baki):** La mano saca «Caja menor» al debe y «Bancos» al haber, y confirma.

## H4 · El arqueo de Rosa (`t4-el-arqueo-de-rosa`)

- **Mecánica que demuestra:** Tres preguntas en orden.
- **Pasos:**
  1. «Mira el fondo, los gastos y el efectivo que hay en la caja.» (98,0)
  2. «Responde en orden: qué muestra el arqueo, de cuánto es la diferencia y por cuánto sale el cheque.» (81,5)
  3. «Tienes un intento por pregunta.» (<10)
- **Ejemplo (`demo`):** «Un mes cualquiera, con un fondo de $500.000: los soportes suman $420.000 y en la caja hay $80.000.» (81,5)
  - *[Ronda construida, sin nombre de mes, que cuadra. No es ninguna de las seis rondas de H4. Cifras: 420.000 + 80.000 = 500.000; cheque de 420.000.]*
- **Texto alternativo (`alt`):** «Los gastos más el efectivo dan $500.000, justo el fondo: el arqueo cuadra. No hay diferencia, y el cheque repone lo gastado, $420.000.» (76,2)
- **Lo que hace la mano (para el guion de Baki):** La mano responde «Cuadra», se salta la pregunta 2 porque no hay diferencia, y en la 3 toca «$420.000».
  - *[Saltar la pregunta 2 cuando el arqueo cuadra es la regla de H4 v1. Si la mecánica muestra la pregunta 2 siempre, el ejemplo pasa a una ronda con sobrante de caja menor construida; avísame y la escribo.]*

## H5 · ¿Al empleado o al gasto? (`t4-al-empleado-o-al-gasto`)

- **Mecánica que demuestra:** Armar el asiento completo del reembolso.
- **Pasos:**
  1. «Lee el caso y lo que decidió la empresa.» (<10)
  2. «Calcula cuánto falta y por cuánto sale el cheque.» (<10)
  3. «Arma el asiento del reembolso: cuentas, lados y valores. Tienes un intento.» (71,0)
- **Ejemplo (`demo`):** «Una caja menor de $300.000. Los soportes suman $251.000 y en la caja hay $45.000. La empresa decide cobrarle el faltante de caja menor a quien la maneja.» (79,6)
  - *[Caso construido, sin empresa ni nombre, con un fondo de 300.000 distinto de los cuatro de H5. Cifras: 251.000 + 45.000 = 296.000; faltante de caja menor de 4.000; cheque de 255.000; 45.000 + 255.000 = 300.000.]*
- **Texto alternativo (`alt`):** «Faltan $4.000. Gastos generales va al debe por $251.000 y Cuentas por cobrar – empleados al debe por $4.000. Bancos va al haber por $255.000.» (79,4)
- **Lo que hace la mano (para el guion de Baki):** La mano pone Gastos generales al debe con 251.000, Cuentas por cobrar – empleados al debe con 4.000 y Bancos al haber con 255.000, y confirma.

## H6 · ¿Quién se enteró primero? (`t4-quien-se-entero-primero`)

- **Mecánica que demuestra:** Tarjetas a dos destinos.
- **Pasos:**
  1. «Lee lo que pasó en la cuenta.» (<10)
  2. «Pregúntate quién se enteró primero, el banco o la empresa.» (72,2)
  3. «Manda la tarjeta al registro que todavía no lo tiene.» (78,5)
- **Ejemplo (`demo`):** «El 31, la empresa gira un cheque para pagar la luz. La empresa de energía todavía no lo ha cobrado.» (78,5)
  - *[Partida construida, que no es ninguna de las ocho de H6 (sus cheques son del arriendo y del proveedor).]*
- **Texto alternativo (`alt`):** «La empresa anotó el cheque al girarlo, pero el banco no sabe de él hasta que lo cobren. La tarjeta va a «Todavía no lo tiene el banco».» (88,3)
- **Lo que hace la mano (para el guion de Baki):** La mano arrastra la tarjeta a «Todavía no lo tiene el banco».

## H7 · Concilia Los Cerezos (`t4-concilia-los-cerezos`)

- **Mecánica que demuestra:** Cada partida a un lado y con un signo; después, los dos saldos.
- **Pasos:**
  1. «Pon cada partida en su lado, el del banco o el de los libros, y decide si suma o resta.» (93,4)
  2. «Cuando estén todas, escribe los dos saldos.» (<10)
  3. «Si los dos saldos dan lo mismo, la conciliación está bien.» (99,6)
- **Ejemplo (`demo`):** «Una nota débito del banco por $12.000, por la comisión de manejo de la cuenta.» (79,7)
  - *[Partida construida, que no es de Los Cerezos: una comisión de 12.000, sin empresa. Solo demuestra cómo se coloca una partida; el cálculo de saldos no se demuestra, para no adelantar la cuenta.]*
- **Texto alternativo (`alt`):** «El banco ya restó la comisión, y los libros todavía no. La partida va a «Libros: resta».» (92,1)
- **Lo que hace la mano (para el guion de Baki):** La mano arrastra la tarjeta a «Libros: resta».
  - *[Demuestra solo el primer gesto de la actividad. Si Yujiro quiere la demostración completa, H7 y H8 necesitan un ejemplo de varias partidas fuera de Los Cerezos, y eso es una conciliación construida entera. No la escribí: es contenido nuevo de tamaño, y no estaba en el encargo.]*

## H8 · ¿Se asienta o no? (`t4-se-asienta-o-no`)

- **Mecánica que demuestra:** Tres etapas.
- **Pasos:**
  1. «Primero, decide qué partidas se asientan.» (<10)
  2. «Después, arma el asiento de cada una.» (<10)
  3. «Al final, escribe el saldo de Bancos en el mayor.» (97,2)
- **Ejemplo (`demo`):** «Un cheque de $50.000 que la empresa giró y que nadie ha cobrado.» (88,4)
  - *[Partida construida, que no es de Los Cerezos: un cheque de 50.000 sin cobrar. Demuestra solo la etapa 1, con una partida que **no** se asienta, para que la demostración no regale ningún asiento.]*
- **Texto alternativo (`alt`):** «La empresa ya anotó ese cheque al girarlo. A sus libros no les falta nada, así que no se asienta.» (90,9)
- **Lo que hace la mano (para el guion de Baki):** La mano arrastra la tarjeta a «No se asienta».
  - *[Demuestra solo el primer gesto de la actividad. Si Yujiro quiere la demostración completa, H7 y H8 necesitan un ejemplo de varias partidas fuera de Los Cerezos, y eso es una conciliación construida entera. No la escribí: es contenido nuevo de tamaño, y no estaba en el encargo.]*

## Lo que es mío

- Todos los ejemplos son construidos.
- Los textos de los pasos y del texto alternativo son míos. Siguen la mecánica de la orden y los ítems ya escritos de cada actividad.
- Que H7 y H8 demuestren solo el primer gesto es decisión mía de contenido.

## Erratas que tocan estos textos

Ninguna. Los ejemplos son construidos y no usan cifras del libro.
