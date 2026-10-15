**T4 · H3, H5 y A4 · cambios de la versión 2** (veredictos de Shibukawa: los tres pasan con correcciones).
- Autora: Katsumi.
- INFLESZ **medido de dos formas**, tal cual y sin el corte de frase en «p.», «pp.», «Ltda.» y «n.º», con `src/herramientas/inflesz.js`. Formato: (tal cual / sin corte). Todo lo nuevo pasa de 65 en las dos.
- Revisión de copia contra las pp. 177-191: 0 coincidencias de 10 o más palabras.

# H3 «¿Se mueve la caja menor?»

## H3-a · Quedaba un «gira»

- v1, enunciado de H3-1: «El 1 de marzo, Distribuidora Andina abre una caja menor de $300.000. **Gira** un cheque a nombre de Lucía, que la va a manejar.»
- **v2:** «El 1 de marzo, Distribuidora Andina abre una caja menor de $300.000. Le hace un cheque a Lucía, que la va a manejar.» (76,2 / 76,2)
- Mi nota de cambios de 100f8f4 decía que «gira» ya estaba cambiado, pero solo lo había cambiado en H3-2. Ahora ya no queda ningún «gira» en H3 (lo comprobé buscándolo).

## H3-b · Ocho combinaciones equivocadas sin mensaje propio

Cada operación tiene ahora un mensaje para cada uno de los dos pares que Shibukawa encontró sin cubrir. Ninguno nombra el asiento correcto. Se muestran con la misma prioridad que los demás errores: **antes del error «lados al revés»**, porque son errores de cuenta, no de lado.

| Operación | Combinación (debe / haber) | Error conceptual | Mensaje |
|---|---|---|---|
| H3-1 apertura | Caja menor / Caja | cree que el fondo sale de la caja de la empresa | «El fondo no se arma con plata de la caja de la empresa. Se abre con un cheque, y un cheque sale del banco.» (104,0 / 104,0) |
| H3-1 apertura | Caja / Caja menor | cree que la plata sale del fondo hacia la caja | «Al abrir el fondo, la plata entra a la caja menor, no sale de ella. Y no viene de la caja de la empresa, sino de un cheque.» (99,4 / 99,4) |
| H3-2 reembolso | Caja / Gastos generales | invierte el sentido: cree que entra plata y bajan los gastos | «Aquí no entra plata a la caja, y los gastos no bajan. El reembolso anota los gastos que se hicieron y se paga con un cheque.» (90,8 / 90,8) |
| H3-2 reembolso | Gastos generales / Caja | cree que el gasto se paga con la caja (la confusión de A1-A2) | «El reembolso no se paga con la plata de la caja: se paga con un cheque.» (97,4 / 97,4) *(texto de Shibukawa)* |
| H3-3 aumento | Bancos / Caja | cree que la plata va de la caja al banco | «Bancos no sube y no sale plata de la caja. El aumento es plata que pasa del banco al fondo de caja menor.» (97,8 / 97,8) |
| H3-3 aumento | Caja / Bancos | confunde Caja con Caja menor | «El cheque sí sale del banco, pero la plata no va a la caja de la empresa: va al fondo de caja menor.» (91,7 / 91,7) |
| H3-4 disminución | Bancos / Caja | lo lee como una consignación | «Ni Bancos sube ni Caja baja. Aquí la plata sale del fondo de caja menor y llega a la caja de la empresa.» (92,4 / 92,4) |
| H3-4 disminución | Caja / Bancos | ve que Caja recibe, pero no ve de dónde sale | «Caja sí recibe la plata, pero esa plata no sale del banco: sale del fondo, que es el que baja.» (87,2 / 87,2) |

- *[Los ocho diagnósticos son míos, salvo el texto del reembolso Gastos generales / Caja, que es de Shibukawa. El de la disminución Bancos / Caja revela que el fondo baja, pero no en qué lado va Caja menor, y la pregunta es por las dos cuentas y los lados. Lo dejo así, porque decirlo sin nombrar el fondo no tiene sentido.]*
- Con esto, las 11 combinaciones equivocadas de cada operación tienen mensaje propio: los errores con nombre de la v1, los dos pares de esta tabla y «lados al revés». **No hace falta un mensaje de reserva.** *[El conteo de 11 es de Shibukawa; no lo verifiqué combinación por combinación.]*

# H5 «¿Al empleado o al gasto?»

## Fechas que no existen

| Caso | v1 | **v2** |
|---|---|---|
| H5-1 (abril) | «Arma el asiento del reembolso del 31 de abril…» y la tabla «31 de abril» | «Arma el asiento del reembolso del 30 de abril: cuentas, lados y valores.» (69,2 / 69,2) y la tabla «30 de abril» |
| H5-3 (junio) | «… del 31 de junio …» y la tabla «31 de junio» | «Arma el asiento del reembolso del 30 de junio: cuentas, lados y valores.» (69,2 / 69,2) y la tabla «30 de junio» |

- El error venía de mi generador, que escribía «31 de {mes}» para todos los meses. Lo corregí para que use el último día de cada mes. H5-2 (mayo, 31) y H5-4 (julio, 31) ya estaban bien.
- **Revisé todas las demás fechas de mis piezas:**
  - H4 no lleva fechas de día;
  - H3 usa 1 y 31 de marzo;
  - H6 usa 29, 30 y 31 «del mes», sin nombrar el mes;
  - H7 y H8 usan el 30 de septiembre.
- Ninguna fecha es imposible.

# A4 «Bancos y notas del banco»

## A4-b · «abonar» en un sentido no enseñado

En los Temas 1-3, «abonar» solo significa pagar parte de una deuda («Abonar a la deuda la baja», Tema 2). En A4, y en A5, H6, H7 y H8, significa que el banco **suma plata a la cuenta**. Como las piezas que siguen lo usan unas 26 veces, **lo defino en A4, en su primera aparición, en lugar de quitarlo en todas partes:**
- **P2, debajo de la definición de nota crédito**, que es donde aparece por primera vez («cuando le abona intereses»): «Aquí, abonar quiere decir que el banco le suma plata a la cuenta. No es el abono a una deuda que viste en el Tema 2.» (88,4 / 88,4)
  - *[Glosa mía. Que el Tema 2 lo use como «pagar parte de una deuda» lo comprobó Shibukawa (`contabilidadActividades.js:127`).]*
- **P7, causa 2:** aplico de todos modos el texto llano que propone Shibukawa: «Una consignación que la empresa anotó y que el banco todavía no suma a la cuenta.» (74,0 / 74,0). En una lista de causas, decirlo en llano se lee mejor.

## A4-P · El nombre exacto del término en los datos (decisión de Yujiro)

**Para Baki, al construir A4:**
- En los **datos**, el término de la definición se llama **exactamente «Nota débito»**, y el otro, **«Nota crédito»**, sin «del banco». Por ejemplo: `{ termino: "Nota débito", definicion: "Con una nota débito, el banco le resta un valor a la cuenta de la empresa. …" }`.
- En **pantalla**, el rótulo puede seguir diciendo «Nota débito del banco» y «Nota crédito del banco», que es la regla de T4 para no confundirlas con la nota crédito de T7.
- **Por qué:** la prueba de guardia de la Célula B (`src/contabilidad/__tests__/b5-t6-glosa-nota-debito.test.mjs`) busca el término exacto «nota(s) débito». Si los datos dicen «Nota débito del banco», la guardia no ve nuestra definición, se queda en verde y la glosa de B nunca se retira.
- **Criterio de cierre, el de Shibukawa:** con A4 construido en su rama, **la guardia de B tiene que ponerse en rojo**. Solo entonces B retira su glosa (C4: Yujiro lo coordina con Erwin y B). Una guardia en verde con A4 construido quiere decir que el nombre quedó mal.
- *[El texto de las definiciones no cambia. Solo cambia el campo del término en los datos.]*

## Erratas que tocan estas piezas

Sin cambios. Las fechas de H5 no eran erratas del libro, sino errores míos en cifras construidas.
