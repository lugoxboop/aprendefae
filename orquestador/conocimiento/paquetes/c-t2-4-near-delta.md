# DELTA T2-4 · Célula C · Near → L
2026-10-24 15:40 (Bogotá)

Lo que sigue va encima de la auditoría de Mello (`c-t2-3-mello-auditoria.md` §1.2 y §2) y de tus decisiones («Auditoría T2-3»). No rehago nada de lo que Mello ya dejó escrito.

Medí con `npm run -s inflesz` cada texto nuevo de 10 palabras o más. Ninguno baja de 65; el mínimo es 70,6.

---

## 1 · Cuadra por valor: el retro de cada línea buena tocada

Cada retro nombra lo que el estudiante creyó al tocar esa línea y lo devuelve a la pista del hecho, sin decir cuál es la mala.

| ítem | línea buena tocada | retro | pal. · INFLESZ |
|---|---|---|---|
| E1 · lado contrario | Cuentas por pagar 10.000 D | Pensaste que la deuda no podía ir al debe. Abonar la baja, así que va bien ahí. Mira por dónde salió la plata. | 23 · 96,2 |
| E1 | Bancos 4.000 H | Pensaste que el cheque estaba mal puesto. Bancos paga $4.000 y baja, así que va en el haber. El efectivo salió igual. | 22 · 86,2 |
| E2 · renglón de más | Local comercial 100.000 D | El local es el aporte de los socios, así que su renglón va. Sobra el que el hecho no nombra. | 20 · 106,5 |
| E2 | Aportes sociales 100.000 H | Aportes sociales es la otra cara del aporte y va bien en el haber. Sobra un renglón que el hecho no nombra. | 22 · 96,7 |
| E3 · traspuesto | Hipoteca por pagar 400 D | Hipoteca coincide: el hecho dice $400. Resta, y mira cuánto le toca al otro abono. | 15 · 70,6 |
| E3 | Bancos 650 H | Viste que no cuadra y culpaste al total. El cheque fue de $650, y eso dice Bancos. Revisa los abonos. | 20 · 91,1 |

**HUECO · un término, un nombre.** El hecho de Mello en E3 dice «la deuda de la computadora», y J2 dice «un computador», igual que cal-2. Mi propuesta es que E3 diga «del computador». Es una sola palabra y no cambia la medida de forma apreciable. Lo decides tú, o se lo devuelvo a Mello.

---

## 2 · Del diario al mayor: tipo «revisar» (el punteo)

- **Consigna de Mello:** «El mayor ya está pasado. Toca la línea que no coincide con el diario.» (14 · 93,0)
- **Partida:** 3 destino, 2 origen y 2 revisar.
- **Orden y C1:** los dos revisar van al final, después de destino y origen.
  - El mayor de revisar llega completo, con los 5 renglones del caso. Si fuera antes, delataría las respuestas pendientes de destino y origen.
  - Cada caso tiene 5 renglones y 7 ítems, así que revisar repite renglones a la fuerza. Elegí las líneas malas para que ninguna sea el inverso inmediato de un origen.
  - El revisar 2 se juega después del 1, así que tampoco hay respuesta pendiente a la vista.
- **Errores:** cada caso trae dos tipos distintos, y entre los dos casos salen los tres.
  - Caso A: cuenta vecina y cifra traspuesta.
  - Caso B: lado contrario y cifra traspuesta.
- **Sin saldo y sin elegir el lado.** Al tocar una línea, se enciende su renglón del diario, como en el «al revés» de Watari.
- **Retro de línea buena tocada:** sale de una regla. La línea tocada enciende su renglón del diario, que muestra que coinciden. El texto nombra el error que hay que buscar, sin decir dónde está. Hay una plantilla por tipo de error:
  - **Rv**, cuenta vecina: «Esa línea coincide con su renglón del diario. Busca un valor que cayó en la T de otra cuenta del mismo asiento.» (22 · 91,1)
  - **Rt**, traspuesta: «Esa línea coincide con su renglón del diario. Compara cada cifra con la del diario, dígito por dígito.» (18 · 80,2)
  - **Rl**, lado contrario: «Esa línea coincide con su renglón del diario. Compara el lado de cada valor con el lado que tiene en el diario.» (22 · 91,1)

### Caso A · Lavado, 2 y 4 de enero (pp. 98-101)

El mayor bien pasado:

| cuenta | lado | fecha | valor |
|---|---|---|---|
| Bancos | D | 2 ene | 5.000 |
| Bancos | H | 4 ene | 800 |
| Acciones | H | 2 ene | 5.000 |
| Flota y equipo de transporte | D | 4 ene | 4.800 |
| Letras por pagar | H | 4 ene | 4.000 |

| ítem | tipo de error | cómo llega el mayor | línea mal pasada | porqué | líneas buenas → retro |
|---|---|---|---|---|---|
| A6 · revisar 1 | cuenta vecina (agrupar por fecha) | Los $4.000 de Letras por pagar del 4 ene están en el **haber de Flota y equipo de transporte**, y la T de Letras por pagar queda vacía. | Flota y equipo de transporte · H · 4 ene · 4.000 | «El 4 de enero, los $4.000 son de Letras por pagar. En el mayor cayeron en Flota, su vecina de asiento.» (21 · 86,6) | Bancos D 5.000 → Rv · Bancos H 800 → Rv · Acciones H 5.000 → Rv · Flota D 4.800 → Rv |
| A7 · revisar 2 | cifra traspuesta | Flota y equipo de transporte · D · 4 ene dice **8.400**. Todo lo demás está bien. | Flota y equipo de transporte · D · 4 ene · 8.400 | «El diario da $4.800 a Flota y el mayor dice $8.400. Son las mismas cifras invertidas: la diferencia, $3.600, se divide por 9.» (23 · 73,4) | Bancos D 5.000 → Rt · Bancos H 800 → Rt · Acciones H 5.000 → Rt · Letras H 4.000 → Rt |

**C1 en el caso A.**
- Los origen del caso preguntan por las dos líneas de Bancos, y ninguna de ellas es una línea mala.
- Las dos líneas malas son de Flota: el renglón r5 cae en una T vecina y el renglón r3 trae la cifra invertida.
- El destino A3 (r3) ya se jugó, así que A7 no delata nada pendiente.

### Caso B · Lavado, 8 y 12 de enero (pp. 98-101)

El mayor bien pasado:

| cuenta | lado | fecha | valor |
|---|---|---|---|
| Equipo de computación | D | 8 ene | 2.000 |
| Cuentas por pagar | H | 8 ene | 2.000 |
| Muebles y enseres | D | 12 ene | 2.500 |
| Bancos | H | 12 ene | 500 |
| Cuentas por pagar | H | 12 ene | 2.000 |

| ítem | tipo de error | cómo llega el mayor | línea mal pasada | porqué | líneas buenas → retro |
|---|---|---|---|---|---|
| B6 · revisar 1 | lado contrario | Los $500 de Bancos del 12 ene están en el **debe**. | Bancos · D · 12 ene · 500 | «En el diario, los $500 de Bancos están en el haber, porque el banco pagó. En el mayor quedaron en el debe.» (22 · 96,7) | Equipo D 2.000 → Rl · Cuentas por pagar H 2.000 (8 ene) → Rl · Muebles D 2.500 → Rl · Cuentas por pagar H 2.000 (12 ene) → Rl |
| B7 · revisar 2 | cifra traspuesta | Muebles y enseres · D · 12 ene dice **5.200**. Todo lo demás está bien. | Muebles y enseres · D · 12 ene · 5.200 | «El diario da $2.500 a Muebles y enseres, y el mayor dice $5.200. Son las cifras invertidas: la diferencia, $2.700, se divide por 9.» (24 · 72,8) | Equipo D 2.000 → Rt · Cuentas por pagar H 2.000 (8 ene) → Rt · Bancos H 500 → Rt · Cuentas por pagar H 2.000 (12 ene) → Rt |

**C1 en el caso B.**
- Tras quitar B4 y B5, el renglón de Bancos (r4) solo estaba en el origen o2. B6 lo usa después, y con el error de lado, que el origen no pregunta.
- El renglón de Muebles (r3) es del destino B3, que ya se jugó.
- Las dos líneas de Cuentas por pagar, que son la trampa de agrupar por fecha, quedan bien pasadas en los dos revisar. Así no se cruzan con el origen r5.

**Para Watari y Misa, en una línea.** Al tocar una línea, primero se ve la consecuencia: su renglón del diario se enciende y lo que no coincide queda en coral (C4). Después llega el veredicto, con «Iba aquí» en la línea mal pasada.
