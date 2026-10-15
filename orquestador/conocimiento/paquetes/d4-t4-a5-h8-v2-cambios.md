**T4 · A5 y H8 · cambios de la versión 2** (veredictos de Shibukawa: las dos pasan con correcciones).
- Autora: Katsumi.
- **Aplicados también en los paquetes base:** `d4-t4-a5-v1.md` a mano, y `d4-t4-h8-v1.md` regenerado con su script. Comparé H8 contra la versión anterior: solo cambia lo que dice aquí.
- INFLESZ medido tal cual y sin el corte en «p.» y «Ltda.». Todo lo nuevo pasa de 65 en las dos. Revisión de copia: 0 coincidencias.

# A5 «San Calixto»

## A5-a · Un dato inventado (P6, error «Sí: hay que sumarlo a Bancos.»)

- v1: «Sumarlo sería decir que la plata volvió a la empresa. Pero el cheque sigue vivo: **el proveedor** lo va a cobrar.»
- **v2:** «Sumarlo sería decir que la plata volvió a la empresa. Pero el cheque sigue vivo: Lorena Guerra lo va a cobrar.» (83,6 / 83,6)
- El libro solo dice que Lorena Guerra es la beneficiaria del cheque (p. 189). No dice que sea proveedora.

## A5-b · «sobregiro» sin definir (P4)

- Se pone en pantalla, debajo de la línea de las notas débito: «Un sobregiro es sacar del banco más plata de la que hay en la cuenta.» (100,5 / 100,5)
- *[Glosa mía: el libro no define «sobregiro» (HD4-14).]*

# H8 «¿Se asienta o no?»

## H8-a · Combinaciones sin mensaje en la etapa 2

- **Quitado:** el mensaje para «Ingresos por servicios» de H8-1. Esa cuenta no está entre las seis opciones, así que el mensaje no saldría nunca.
- **Cobertura completa.** Con las seis cuentas hay 30 combinaciones de debe y haber con cuentas distintas; 29 son equivocadas. Ahora cada una cae en una sola regla con su mensaje, revisadas en este orden:

| Regla | Combinaciones por partida | Mensaje |
|---|---|---|
| 1. Aparece Caja | 10 | el de «usó Caja», que ya existía |
| 2. No aparece Bancos | 12 | **nuevo**, uno para notas crédito y otro para notas débito |
| 3. Bancos en el lado equivocado, con otra cuenta | 3 | **nuevo**, uno para notas crédito y otro para notas débito |
| 4. Bancos en su lado, con otra cuenta | 3 | el de esa cuenta; **cuatro nuevos** para las cuentas que no tenían mensaje |
| 5. Las cuentas correctas al revés | 1 | el de «lados al revés», que ya existía |

- La clasificación la hace el script `scratchpad/katsumi/gen2/h8cob.py` sobre las 30 combinaciones de cada una de las cinco partidas: 10 + 12 + 3 + 3 + 1 = 29 en las cinco.

**Mensajes nuevos de regla:**
- Nota crédito, sin Bancos: «La plata de esta nota entró a la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
- Nota débito, sin Bancos: «La plata de esta nota salió de la cuenta del banco. Si el asiento no mueve Bancos, los libros siguen sin enterarse.» (91,1)
- Nota crédito, Bancos en el lado equivocado: «Fíjate en Bancos. Con esta nota, el banco le sumó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)
- Nota débito, Bancos en el lado equivocado: «Fíjate en Bancos. Con esta nota, el banco le quitó plata a la cuenta: ¿la cuenta sube o baja?» (95,7)

**Mensajes nuevos de cuenta:**
- H8-1, usó Gastos financieros – chequera: «Gloria Ruiz pagó una deuda: aquí no hay ningún gasto de la empresa. Piensa en qué cambió cuando ella pagó.» (87,8)
- H8-1, usó Gasto interés: «Aquí nadie pagó intereses: el cliente pagó una factura que debía. Piensa en qué cambió cuando ella pagó.» (69,8)
- H8-2, usó Gastos financieros – chequera: «Esta plata la ganó la empresa por su inversión: no es un gasto. Piensa en qué tipo de cuenta registra lo que se gana.» (96,2)
- H8-3, usó Ingresos por intereses: «La chequera la cobró el banco: la empresa no ganó nada. Piensa en qué tipo de cuenta registra lo que se paga.» (93,9)
- H8-4, usó Cuentas por cobrar – clientes: «El banco cobró intereses por el sobregiro: ningún cliente quedó debiendo nada. Piensa en qué tipo de cuenta registra lo que se paga.» (78,9)

- *[Los mensajes nuevos no nombran la cuenta correcta. Los mensajes de cuenta de la v1 sí dicen el tipo de cuenta, por ejemplo «es un ingreso»; la auditoría no los objetó y los dejo.]*

## H8-b · La cifra del tercer error de la etapa 3

- v1: **3.162.200** = libros − cheques + consignación. No incluía las notas, así que no correspondía a su texto, «mete partidas que la empresa ya tenía», es decir, además de las notas.
- **v2: 3.229.100** = 2.484.800 + 589.200 − 522.300 − 587.600 + 1.265.000. Es la cifra de quien asienta las cinco notas y, además, las cuatro partidas del banco con los signos de la conciliación.
- Verificada con el script de datos de Los Cerezos (`datos.py`), que da 3.229.100.

## Erratas que tocan estas piezas

Sin cambios.
