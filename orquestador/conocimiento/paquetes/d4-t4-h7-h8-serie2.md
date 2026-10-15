**T4 · H7 «Concilia Los Cerezos» y H8 «¿Se asienta o no?» · serie 2 · contenido completo.**
- Autora: Katsumi. Encargo de Yujiro: una segunda conciliación construida, para que en cada intento se sortee una serie (D8 Avanzado).
- **Serie 1:** Comercializadora Los Cerezos Ltda., en `d4-t4-h7-v1.md` y `d4-t4-h8-v1.md` con sus cambios. **Serie 2:** esta.
- **H7 y H8 usan la misma serie dentro de un intento**, igual que en la serie 1, porque H8 parte de la conciliación de H7. *[La forma de sortear la decide Yujiro. Si H7 y H8 se juegan por separado, cada una sortea la suya; el contenido sirve igual.]*
- **Nombre en pantalla de H7 con la serie 2.** El nombre aprobado, «Concilia Los Cerezos», nombra la empresa de la serie 1. Propongo que el nombre del ítem no dependa de la serie: la actividad se sigue llamando «Concilia Los Cerezos» en el índice, porque el id `t4-concilia-los-cerezos` está aprobado, y la serie 2 dice su empresa en los datos de partida. Así el índice no cambia entre intentos. **Decides tú**; la alternativa es un nombre neutro como «Concilia la cuenta».
- **Igual que la serie 1:** la mecánica, los destinos, las reglas de error y su cobertura (los cambios v2 de H8 ya están incluidos), y las clases de partidas: 3 cheques sin cobrar, 1 consignación en tránsito, 2 notas crédito y 3 notas débito del banco.
- **Cambia:** la empresa, la fecha de cierre (31 de octubre), las personas, las cifras y los textos que las nombran.
- **Cifras:** todas construidas, y la cuenta la hizo un script (`scratchpad/katsumi/gen2/datos2.py`). Los dos saldos conciliados dan lo mismo. El script comprueba que ninguna cifra, incluidas las de los errores con cifra, coincide con las del libro (pp. 177-191) ni con las de Los Cerezos.
- Los textos los produjeron **los mismos generadores de la serie 1**, con los datos de la serie 2. Aquí solo va lo que cambia; las secciones que no dependen de la serie (ficha, objetivo, consignas, reparto, erratas, términos) son las de la serie 1.
- INFLESZ: **medido** tal cual y sin corte en abreviaturas. Todo texto de 10 o más palabras da 65 o más; el más bajo es 65,0.

## Datos de partida de la serie 2

- «Es el 31 de octubre. La empresa El Mirador va a comparar su cuenta con la del banco.» (94,0)
  - *[La razón social completa, Distribuidora El Mirador Ltda., va en el encabezado de la presentación, como en la p. 190.]*
- «Saldo según el extracto: $3.216.800. Saldo según los libros: $3.090.900.» (71,0)
- Pie: «Cifras construidas. Formato del libro, p. 190»

# H7, serie 2

## Partidas (construidas; orden aleatorio)
### H7s2-1 · Cheque a Carolina Méndez
- **Subtema:** Cheque sin cobrar
- **Partida:** «La empresa le giró un cheque de $265.300 a Carolina Méndez. Todavía no lo ha cobrado.» (78,1)
- **Respuesta:** Banco: resta (presentación de la p. 190)
- **Acierto:** «Así es. La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando Carolina Méndez lo cobre, va a salir: se le resta al saldo del banco.» (95,1)
- **Banco: suma:** «Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir.» (89,5)
- **Libros: resta:** «Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces.» (89,1)
- **Libros: suma:** «Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar.» (90,5)

### H7s2-2 · Cheque a Felipe Rojas
- **Subtema:** Cheque sin cobrar
- **Partida:** «La empresa le giró un cheque de $118.900 a Felipe Rojas. Todavía no lo ha cobrado.» (82,0)
- **Respuesta:** Banco: resta (presentación de la p. 190)
- **Acierto:** «Así es. La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando Felipe Rojas lo cobre, va a salir: se le resta al saldo del banco.» (97,2)
- **Banco: suma:** «Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir.» (89,5)
- **Libros: resta:** «Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces.» (89,1)
- **Libros: suma:** «Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar.» (90,5)

### H7s2-3 · Cheque a Natalia Vega
- **Subtema:** Cheque sin cobrar
- **Partida:** «La empresa le giró un cheque de $402.600 a Natalia Vega. Todavía no lo ha cobrado.» (82,0)
- **Respuesta:** Banco: resta (presentación de la p. 190)
- **Acierto:** «Así es. La empresa ya lo restó al girarlo, pero el banco no lo sabe. Cuando Natalia Vega lo cobre, va a salir: se le resta al saldo del banco.» (97,2)
- **Banco: suma:** «Sumarlo al banco sería decir que esa plata va a entrar. Pero un cheque girado es plata que va a salir.» (89,5)
- **Libros: resta:** «Los libros ya lo restaron el día que se giró el cheque. Restarlo otra vez sería contarlo dos veces.» (89,1)
- **Libros: suma:** «Los libros ya tienen este cheque, y sumarlo lo borraría. El cheque sigue vivo: lo van a cobrar.» (90,5)

### H7s2-4 · Consignación del 31
- **Subtema:** Consignación en tránsito
- **Partida:** «El 31 de octubre, la empresa consignó $947.500. El banco la abona al día siguiente.» (70,6)
- **Respuesta:** Banco: suma (presentación de la p. 190)
- **Acierto:** «Así es. La empresa ya la anotó, y el banco la va a abonar. Esa plata va a entrar: se le suma al saldo del banco.» (102,3)
- **Banco: resta:** «Restarla del banco sería decir que esa plata va a salir. Pero la empresa la llevó al banco: va a entrar.» (89,5)
- **Libros: suma:** «Los libros ya la sumaron el día que se consignó. Sumarla otra vez sería contarla dos veces.» (84,7)
- **Libros: resta:** «Los libros ya tienen esta consignación, y restarla la borraría. La plata sí se consignó.» (78,9)

### H7s2-5 · Nota crédito: pago del cliente Tomás Acosta
- **Subtema:** Nota crédito del banco
- **Partida:** «El cliente Tomás Acosta le pagó a la empresa una factura: consignó la plata directo en el banco. Fueron $713.400. La empresa todavía no lo ha anotado.» (73,2)
- **Respuesta:** Libros: suma (presentación de la p. 190)
- **Acierto:** «Así es. Es una nota crédito del banco: el banco ya sumó esa plata y los libros todavía no. Se le suma al saldo de los libros.» (96,3)
- **Libros: resta:** «Restar sería decir que la empresa perdió esa plata. Una nota crédito del banco hace lo contrario.» (73,7)
- **Banco: suma:** «El banco ya tiene esta nota: fue él quien la hizo. Sumarla en su lado sería contarla dos veces.» (92,4)
- **Banco: resta:** «El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.» (95,7)

### H7s2-6 · Nota crédito: intereses de la inversión
- **Subtema:** Nota crédito del banco
- **Partida:** «El banco abonó los intereses de una inversión de la empresa: $84.700. La empresa todavía no lo ha anotado.» (66,2)
- **Respuesta:** Libros: suma (presentación de la p. 190)
- **Acierto:** «Así es. Es una nota crédito del banco: el banco ya sumó esa plata y los libros todavía no. Se le suma al saldo de los libros.» (96,3)
- **Libros: resta:** «Restar sería decir que la empresa perdió esa plata. Una nota crédito del banco hace lo contrario.» (73,7)
- **Banco: suma:** «El banco ya tiene esta nota: fue él quien la hizo. Sumarla en su lado sería contarla dos veces.» (92,4)
- **Banco: resta:** «El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.» (95,7)

### H7s2-7 · Nota débito: chequera
- **Subtema:** Nota débito del banco
- **Partida:** «El banco cobró una chequera: $46.200. La empresa todavía no lo ha anotado.» (66,2)
- **Respuesta:** Libros: resta (presentación de la p. 190)
- **Acierto:** «Así es. Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros.» (95,8)
- **Libros: suma:** «Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario.» (84,7)
- **Banco: resta:** «El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces.» (92,4)
- **Banco: suma:** «El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.» (95,7)

### H7s2-8 · Nota débito: intereses de sobregiro
- **Subtema:** Nota débito del banco
- **Partida:** «El banco le cobró a la empresa los intereses de un sobregiro: $173.800. La empresa todavía no lo ha anotado.» (72,2)
- **Respuesta:** Libros: resta (presentación de la p. 190)
- **Acierto:** «Así es. Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros.» (95,8)
- **Libros: suma:** «Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario.» (84,7)
- **Banco: resta:** «El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces.» (92,4)
- **Banco: suma:** «El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.» (95,7)

### H7s2-9 · Nota débito: cheque devuelto de Sofía Cárdenas
- **Subtema:** Nota débito del banco
- **Partida:** «El banco devolvió un cheque con el que el cliente Sofía Cárdenas había pagado: $291.500. La empresa todavía no lo ha anotado.» (68,4)
- **Respuesta:** Libros: resta (presentación de la p. 190)
- **Acierto:** «Así es. Es una nota débito del banco: el banco ya le quitó esa plata a la empresa, y los libros todavía no lo saben. Se le resta al saldo de los libros.» (95,8)
- **Libros: suma:** «Sumar sería decir que el banco le dio plata a la empresa. Una nota débito del banco hace lo contrario.» (84,7)
- **Banco: resta:** «El banco ya tiene esta nota: fue él quien la hizo. Restarla en su lado sería contarla dos veces.» (92,4)
- **Banco: suma:** «El banco ya la tiene anotada. Tocar su saldo no arregla nada: lo que falta es en los libros.» (95,7)

## Los dos saldos conciliados

Cuando las nueve partidas están puestas, el estudiante calcula cada saldo. Se pide como **número escrito**, no como elección, para que no se adivine.

**Lado del banco:** 3.216.800 + 947.500 − 786.800 = **3.377.500**
**Lado de los libros:** 3.090.900 + 798.100 − 511.500 = **3.377.500**

Retroalimentación, según lo que escriba:
- **Los dos dan $3.377.500:** «Así es. Los dos saldos dan lo mismo. Nadie se equivocó: a cada lado le faltaba anotar algo.» (90,1)
- **Los dos dan lo mismo, pero otra cifra:** «Los dos lados coinciden entre sí, pero la cuenta no es la del ejercicio. Revisa las sumas.» (92,1)
- **Banco = $3.056.100** (signos del banco al revés): «Ese saldo resta lo que va a entrar y suma lo que va a salir. Revisa los dos tipos de partida del banco.» (100,5)
- **Banco = $4.164.300** (no restó los cheques): «A ese saldo le faltan los cheques que nadie ha cobrado. Esa plata ya está comprometida.» (82,0)
- **Banco = $2.430.000** (no sumó la consignación): «A ese saldo le falta la consignación del 31. Esa plata ya es de la empresa.» (89,8)
- **Libros = $2.804.300** (signos de las notas al revés): «Ese saldo resta lo que el banco abonó y suma lo que el banco cobró. Revisa qué hace cada nota.» (90,9)
- **Libros = $3.889.000** (no restó las notas débito): «A ese saldo le faltan las notas débito del banco: la plata que el banco ya cobró.» (90,9)
- **Libros = $2.579.400** (no sumó las notas crédito): «A ese saldo le faltan las notas crédito del banco: la plata que el banco ya abonó.» (87,2)
- **Cualquier otro saldo que no coincida:** «Los dos saldos tienen que dar lo mismo. Si no dan, alguna partida está en el lado o con el signo equivocados.» (93,9)

*[Los seis errores con cifra son los más esperables: signos al revés o una partida olvidada. Si la mecánica no permite reconocer el valor escrito, basta el texto general.]*

## Cierre
- «El saldo del banco y el de los libros dan $3.377.500. Ese es el saldo verdadero de la cuenta de Distribuidora El Mirador.» (87,0)
- Pie: «Formato y signos del libro, p. 190. Cifras construidas»

## Cifras de la serie 2

| Dato | Valor |
| --- | --- |
| Extracto | 3.216.800 |
| Libros | 3.090.900 |
| Cheque a Carolina Méndez | 265.300 |
| Cheque a Felipe Rojas | 118.900 |
| Cheque a Natalia Vega | 402.600 |
| Total cheques sin cobrar | 786.800 |
| Consignación en tránsito | 947.500 |
| Nota crédito: pago del cliente Tomás Acosta | 713.400 |
| Nota crédito: intereses de la inversión | 84.700 |
| Total notas crédito | 798.100 |
| Nota débito: chequera | 46.200 |
| Nota débito: intereses de sobregiro | 173.800 |
| Nota débito: cheque devuelto de Sofía Cárdenas | 291.500 |
| Total notas débito | 511.500 |
| **Saldo conciliado (los dos lados)** | **3.377.500** |

# H8, serie 2

- «La conciliación de El Mirador ya está hecha: los dos saldos dan $3.377.500. Ahora la empresa tiene que corregir sus libros.» (80,6)
- La consigna 2 es la misma de la serie 1.

## Etapa 1 · ¿Se asienta o no?

Las nueve partidas son las de H7, serie 2. **Los textos de acierto y error de la etapa 1 son los de la serie 1**, porque van por tipo de partida y no nombran cifra ni persona.

## Etapa 2 · Arma los asientos

Las cuentas, la regla de cobertura de 29 combinaciones y la fecha son las de la serie 1, con la fecha de esta serie: **31 de octubre**. Partidas:

### H8s2-1 · pago del cliente Tomás Acosta
- **Subtema:** Asiento de nota crédito del banco
- **Partida:** «El cliente Tomás Acosta le pagó a la empresa una factura: consignó la plata directo en el banco. Fueron $713.400.» (75,4)
- **Asiento correcto:** Bancos al debe / Cuentas por cobrar – clientes al haber, por 713.400 (asiento de la p. 191 para la nota del mismo tipo)
- **Acierto:** «Así es. La plata entró al banco, así que Bancos se debita. Y Tomás Acosta ya no debe esa factura: Cuentas por cobrar – clientes se acredita.» (85,5)
- **Errores** (ver «Cómo se elige el mensaje» al principio de la etapa 2). De cuenta, para la cuenta que acompaña a Bancos:
  - *usó Ingresos por intereses:* «Esa cuenta es para lo que rinde una inversión. Aquí un cliente pagó una factura que debía.» (77,4)
  - *usó Gastos financieros – chequera:* «Tomás Acosta pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió cuando ella pagó.» (81,6)
  - *usó Gasto interés:* «Aquí nadie pagó intereses: el cliente pagó una factura que debía. Piensa en qué cambió cuando ella pagó.» (69,8)
  - *usó Caja:* «La plata no pasó por la caja: el cliente la consignó directo en el banco.» (92,2)
  - *lados al revés:* «Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. Lo que debe el cliente baja, así que va al haber.» (103,8)
  - *regla, sin Bancos en el asiento:* «La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
  - *regla, Bancos en el lado equivocado con otra cuenta:* «Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

### H8s2-2 · intereses de la inversión
- **Subtema:** Asiento de nota crédito del banco
- **Partida:** «El banco abonó los intereses de una inversión de la empresa: $84.700.» (65,0)
- **Asiento correcto:** Bancos al debe / Ingresos por intereses al haber, por 84.700 (asiento de la p. 191 para la nota del mismo tipo)
- **Acierto:** «Así es. El banco abonó los intereses: Bancos se debita y se acredita Ingresos por intereses.» (66,4)
- **Errores** (ver «Cómo se elige el mensaje» al principio de la etapa 2). De cuenta, para la cuenta que acompaña a Bancos:
  - *usó Cuentas por cobrar – clientes:* «Nadie le debía esto a la empresa: es lo que rindió su inversión. Es un ingreso.» (93,7)
  - *usó Gasto interés:* «Esos intereses los ganó la empresa, no los pagó. Un interés ganado es un ingreso.» (78,9)
  - *usó Gastos financieros – chequera:* «Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana.» (96,2)
  - *usó Caja:* «La plata no pasó por la caja: el banco la abonó en la cuenta.» (99,4)
  - *lados al revés:* «Las cuentas están bien, pero al revés. Bancos sube, así que va al debe. El ingreso va al haber.» (102,1)
  - *regla, sin Bancos en el asiento:* «La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
  - *regla, Bancos en el lado equivocado con otra cuenta:* «Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

### H8s2-3 · chequera
- **Subtema:** Asiento de nota débito del banco
- **Partida:** «El banco cobró una chequera: $46.200.» (<10)
- **Asiento correcto:** Gastos financieros – chequera al debe / Bancos al haber, por 46.200 (asiento de la p. 191 para la nota del mismo tipo)
- **Acierto:** «Así es. La chequera es un gasto: Gastos financieros – chequera se debita y Bancos se acredita.» (74,2)
- **Errores** (ver «Cómo se elige el mensaje» al principio de la etapa 2). De cuenta, para la cuenta que acompaña a Bancos:
  - *usó Gasto interés:* «Una chequera no es un interés: es lo que cobra el banco por los cheques. Tiene su propia cuenta de gasto.» (98,4)
  - *usó Cuentas por cobrar – clientes:* «Ningún cliente tiene que ver aquí: el banco cobró por un servicio suyo. Es un gasto de la empresa.» (92,4)
  - *usó Ingresos por intereses:* «La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga.» (93,9)
  - *usó Caja:* «La plata no salió de la caja: el banco la descontó de la cuenta.» (99,4)
  - *lados al revés:* «Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber.» (105,4)
  - *regla, sin Bancos en el asiento:* «La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
  - *regla, Bancos en el lado equivocado con otra cuenta:* «Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

### H8s2-4 · intereses de sobregiro
- **Subtema:** Asiento de nota débito del banco
- **Partida:** «El banco le cobró a la empresa los intereses de un sobregiro: $173.800.» (74,0)
- **Asiento correcto:** Gasto interés al debe / Bancos al haber, por 173.800 (asiento de la p. 191 para la nota del mismo tipo)
- **Acierto:** «Así es. Los intereses de sobregiro son un gasto: Gasto interés se debita y Bancos se acredita.» (73,7)
- **Errores** (ver «Cómo se elige el mensaje» al principio de la etapa 2). De cuenta, para la cuenta que acompaña a Bancos:
  - *usó Ingresos por intereses:* «Estos intereses los cobró el banco, no los ganó la empresa. Un interés que se paga es un gasto.» (92,4)
  - *usó Gastos financieros – chequera:* «Esa cuenta es la del cobro de la chequera. Esto es un interés, y tiene su propia cuenta.» (97,5)
  - *usó Cuentas por cobrar – clientes:* «El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga.» (78,9)
  - *usó Caja:* «La plata no salió de la caja: el banco la descontó de la cuenta.» (99,4)
  - *lados al revés:* «Las cuentas están bien, pero al revés. El gasto va al debe. Bancos baja, así que va al haber.» (105,4)
  - *regla, sin Bancos en el asiento:* «La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
  - *regla, Bancos en el lado equivocado con otra cuenta:* «Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

### H8s2-5 · cheque devuelto de Sofía Cárdenas
- **Subtema:** Asiento de nota débito del banco
- **Partida:** «El banco devolvió un cheque con el que el cliente Sofía Cárdenas había pagado: $291.500.» (67,2)
- **Asiento correcto:** Cuentas por cobrar – clientes al debe / Bancos al haber, por 291.500 (asiento de la p. 191 para la nota del mismo tipo)
- **Acierto:** «Así es. El pago de Sofía Cárdenas nunca llegó, así que vuelve a deber: Cuentas por cobrar – clientes se debita y Bancos se acredita.» (80,6)
- **Errores** (ver «Cómo se elige el mensaje» al principio de la etapa 2). De cuenta, para la cuenta que acompaña a Bancos:
  - *usó una cuenta de gasto:* «La empresa no perdió esa plata: Sofía Cárdenas todavía la debe. Su deuda vuelve a subir.» (74,2)
  - *usó Ingresos por intereses:* «Aquí no entra nada: el banco devolvió un cheque. Lo que sube es lo que el cliente debe.» (97,5)
  - *usó Caja:* «La plata no salió de la caja: el banco la descontó de la cuenta.» (99,4)
  - *lados al revés:* «Las cuentas están bien, pero al revés. Lo que debe el cliente sube, así que va al debe. Bancos baja, así que va al haber.» (103,8)
  - *[La razón «el pago nunca llegó, así que la deuda vuelve» es la misma que publicó la Célula B en T6 para el cheque devuelto.]*
  - *regla, sin Bancos en el asiento:* «La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
  - *regla, Bancos en el lado equivocado con otra cuenta:* «Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

## Etapa 3 · El saldo del mayor

El estudiante escribe el saldo de Bancos en el mayor después de los cinco asientos. Ve el saldo inicial, que es el de los libros.

- **Dato a la vista:** «Saldo de Bancos en los libros antes de los ajustes: $3.090.900.» (88,2)
- **Cálculo:** 3.090.900 + 798.100 − 511.500 = **3.377.500**
- **Acierto:** «Así es. Es el mismo saldo conciliado. Ahora los libros de El Mirador dicen lo mismo que el banco corregido.» (84,9)
- **Si escribe $3.889.000** (olvidó las notas débito): «Ese saldo tiene las notas crédito, pero no las débito. Al mayor le falta lo que el banco descontó.» (89,1)
- **Si escribe $2.579.400** (olvidó las notas crédito): «Ese saldo tiene las notas débito, pero no las crédito. Al mayor le falta lo que el banco abonó.» (89,1)
- **Si escribe $3.538.200 u otra cifra con cheques o consignación** (asentó lo que no se asienta, además de las notas): «Ese saldo mete partidas que la empresa ya tenía. Al mayor solo entran las notas del banco.» (84,7)
- **Cualquier otra cifra:** «El saldo del mayor tiene que dar lo mismo que el saldo conciliado, que está a la vista. Revisa los cinco asientos.» (91,1)

*[El tercer error es la cifra de quien asienta las cinco notas y además las cuatro partidas del banco, con los signos de la conciliación: 3.090.900 + 798.100 − 511.500 − 786.800 + 947.500 = 3.538.200. Misma regla que la serie 1 tras la corrección H8-b.]*

## Cierre
- «La empresa no corrige lo que el banco no sabe: eso lo arregla el tiempo. Corrige lo que ella no sabía: las notas del banco.» (89,7)
- Pie: «Basado en el libro, pp. 190-191. Cifras construidas»

## Comprobación de colisiones (salida del script)

Ninguna de estas cifras está en el libro (pp. 177-191) ni en la serie 1:

| Dato | Valor |
| --- | --- |
| Extracto | 3.216.800 |
| Libros | 3.090.900 |
| Consignación en tránsito | 947.500 |
| Total cheques | 786.800 |
| Total notas crédito | 798.100 |
| Total notas débito | 511.500 |
| Saldo conciliado | 3.377.500 |
| Mayor, suma del debe | 3.889.000 |
| Cheque a Carolina Méndez | 265.300 |
| Cheque a Felipe Rojas | 118.900 |
| Cheque a Natalia Vega | 402.600 |
| Nota: pago del cliente Tomás Acosta | 713.400 |
| Nota: intereses de la inversión | 84.700 |
| Nota: chequera | 46.200 |
| Nota: intereses de sobregiro | 173.800 |
| Nota: cheque devuelto de Sofía Cárdenas | 291.500 |
| Error H7: signos del banco al revés | 3.056.100 |
| Error H7: sin restar cheques | 4.164.300 |
| Error H7: sin sumar la consignación | 2.430.000 |
| Error H7: signos de las notas al revés | 2.804.300 |
| Error H7 y H8: sin notas débito | 3.889.000 |
| Error H7 y H8: sin notas crédito | 2.579.400 |
| Error H8: asentó también lo del banco | 3.538.200 |

## Lo que es mío

La empresa, las personas, la fecha y todas las cifras de la serie 2. La propuesta sobre el nombre de H7.

## Erratas que tocan esta serie

Las mismas que la serie 1 (D4-5, HD4-15, HD4-18, D4-15, D4-16, C1-C3). Las cifras son construidas.
