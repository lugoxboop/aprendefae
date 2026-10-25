# «Del resultado a la caja» · medidas (Chromium, Inter y Sora de @fontsource 5.3.0)

Salida de `node --import ./scripts/cargador-jsx.mjs scripts/t3/medir-resultado-caja.mjs orquestador/revisiones/t3-del-resultado-a-la-caja`, 2026-10-24 23:10 (Bogotá), con las correcciones de Kamogawa en #557: la leyenda en sus tres casos, el renglón tenue (con su contraste medido) y A6 con el número en palabras («dos» en A, «tres» en B). Las alturas van en px; «desde el Panel» es desde la parte de arriba del Panel de la actividad.

fuentes: Inter y Sora de @fontsource 5.3.0
| Ancho | Versión | Estado | Encabezado | Ficha del caso | Ranura (desde el Panel) | Tarjeta | Útil / tarjeta por dentro | Botones | Renglones | Puente | Tramo menor | Contraste mín. texto | Contorno reposo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  | «Así se juega» a 320: la demo puso la ficha en Resta y mostró la resolución |
| 320 | A | vacío | 137.3 | 144.0 | 309.3–421.3 | 92.0 (1 l.) | 258 / 234 | 72.7×44 · 72.7×44 · 72.7×44 | — | — | — | 6.99 | 3.01 |
| 320 | A | a mitad | 137.3 | 144.0 | 309.3–439.3 | 110.0 (2 l.) | 258 / 234 | 72.7×44 · 72.7×44 · 72.7×44 | 44 44 | — | — | 6.99 | 3.01 |
| 320 | A | todas, con «Comprobar» | 137.3 | 144.0 | 309.3–421.3 | — (— l.) | 258 / — | — | 44 44 44 44 | — | — | 5.06 | — |
| 320 | A | bien | 137.3 | 144.0 | — | — (— l.) | 258 / — | — | 52 52 52 52 | 176.0 | 17.4 | 5.06 | — |
|  |  | ↳ bien: pista 232.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 52 52 52 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Los $3.950 de utilidad, más el aporte y lo que se debe, menos lo que falta cobrar, dan los $14.650 de la caja. |
| 320 | A | resumen | — | — | — | — (— l.) | 258 / — | — | — | 176.0 | 17.4 | 4.63 | — |
| 320 | A | mal (punteado) | 137.3 | 144.0 | — | — (— l.) | 258 / — | — | 52 80 52 52 | 256.0 | 17.4 | 5.06 | — |
|  |  | ↳ mal: pista 232.0 px, punteado 137.1 px, cifra de sus respuestas $19.650, renglones 52 80 52 52 |
|  |  | ↳ leyenda: «Punteado: así quedaba con tus respuestas» (32.0 px); renglón tenue: «Equipo aportado +$5.000 (tu respuesta)» (32.0 px, nombre en 1 l., cifra en 2 l.), contraste 7.15:1; devolución: El equipo entró a la empresa, pero no es plata. La caja no lo ve. |
| 320 | A | mal (caja negativa, A7) | 137.3 | 144.0 | — | — (— l.) | 258 / — | — | 60 52 52 52 | 192.0 | 17.4 | 5.06 | — |
|  |  | ↳ negativa: pista 232.0 px, punteado ninguno, cifra de sus respuestas −$350, renglones 60 52 52 52 |
|  |  | ↳ leyenda: «Con tus respuestas, la caja daba −$350» (16.0 px); renglón tenue: ninguno; devolución: Los socios metieron plata a la caja, y un aporte no es ingreso. Por eso la caja tiene más que la utilidad. |
| 320 | A | mal (cuadra con errores, A6) | 137.3 | 144.0 | — | — (— l.) | 258 / — | — | 52 80 52 60 | 208.0 | 17.4 | 5.06 | — |
|  |  | ↳ cuadra: pista 232.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 80 52 60 |
|  |  | ↳ leyenda: ninguna; renglón tenue: «Equipo aportado +$5.000 (tu respuesta)» (32.0 px, nombre en 1 l., cifra en 2 l.), contraste 7.15:1; devolución: Llegaste a la caja correcta, pero con dos fichas mal puestas: sus errores se cancelaron. |
| 320 | B | vacío | 137.3 | 146.0 | 311.3–423.3 | 92.0 (1 l.) | 258 / 234 | 72.7×44 · 72.7×44 · 72.7×44 | — | — | — | 6.99 | 3.01 |
| 320 | B | a mitad | 137.3 | 146.0 | 311.3–441.3 | 110.0 (2 l.) | 258 / 234 | 72.7×44 · 72.7×44 · 72.7×44 | 44 44 | — | — | 6.99 | 3.01 |
| 320 | B | todas, con «Comprobar» | 137.3 | 146.0 | 311.3–423.3 | — (— l.) | 258 / — | — | 46 44 44 46 44 44 | — | — | 5.06 | — |
| 320 | B | bien | 137.3 | 146.0 | — | — (— l.) | 258 / — | — | 52 52 68 52 52 68 | 284.0 | 10.5 | 5.06 | — |
|  |  | ↳ bien: pista 232.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 52 68 52 52 68 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Escenario simulado. Los $1.541.000 de utilidad, más el impuesto que se debe, el aporte y el préstamo, menos el anticipo y lo que falta cobrar, dan los $6.800.000 de la caja. |
| 320 | B | resumen | — | — | — | — (— l.) | 258 / — | — | — | 284.0 | 10.5 | 4.63 | — |
| 320 | B | mal (punteado) | 137.3 | 146.0 | — | — (— l.) | 258 / — | — | 52 52 76 52 52 80 | 364.0 | 10.5 | 5.06 | — |
|  |  | ↳ mal: pista 232.0 px, punteado 165.7 px, cifra de sus respuestas $9.500.000, renglones 52 52 76 52 52 80 |
|  |  | ↳ leyenda: «Punteado: así quedaba con tus respuestas» (32.0 px); renglón tenue: «Equipo comprado a crédito +$1.500.000 (tu respuesta)» (32.0 px, nombre en 2 l., cifra en 2 l.), contraste 7.15:1; devolución: Salió plata por un arriendo que aún no se usa. No bajó la utilidad, pero sí la caja. |
| 320 | B | mal (caja negativa, A7) | 137.3 | 146.0 | — | — (— l.) | 258 / — | — | 60 52 68 52 52 68 | 316.0 | 10.5 | 5.06 | — |
|  |  | ↳ negativa: pista 232.0 px, punteado ninguno, cifra de sus respuestas −$3.200.000, renglones 60 52 68 52 52 68 |
|  |  | ↳ leyenda: «Con tus respuestas, la caja daba −$3.200.000» (32.0 px); renglón tenue: ninguno; devolución: Los socios metieron plata a la caja este mes, y un aporte no es ingreso. La caja tiene más por eso. |
| 320 | B | mal (cuadra con errores, A6) | 137.3 | 146.0 | — | — (— l.) | 258 / — | — | 60 52 76 60 52 68 | 284.0 | 10.5 | 5.06 | — |
|  |  | ↳ cuadra: pista 232.0 px, punteado ninguno, cifra de sus respuestas —, renglones 60 52 76 60 52 68 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Llegaste a la caja correcta, pero con tres fichas mal puestas: sus errores se cancelaron. |
|  |  | movimiento reducido a 320, a los 80 ms de «Comprobar»: puente visible, opacidad mínima 1, punteado sí, «Iba aquí» 1 |
|  |  | «Así se juega» a 375: la demo puso la ficha en Resta y mostró la resolución |
| 375 | A | vacío | 137.3 | 128.0 | 293.3–405.3 | 92.0 (1 l.) | 313 / 289 | 91.0×44 · 91.0×44 · 91.0×44 | — | — | — | 6.99 | 3.01 |
| 375 | A | a mitad | 137.3 | 128.0 | 293.3–423.3 | 110.0 (2 l.) | 313 / 289 | 91.0×44 · 91.0×44 · 91.0×44 | 44 44 | — | — | 6.99 | 3.01 |
| 375 | A | todas, con «Comprobar» | 137.3 | 128.0 | 293.3–405.3 | — (— l.) | 313 / — | — | 44 44 44 44 | — | — | 5.06 | — |
| 375 | A | bien | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 52 52 52 52 | 176.0 | 21.6 | 5.06 | — |
|  |  | ↳ bien: pista 287.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 52 52 52 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Los $3.950 de utilidad, más el aporte y lo que se debe, menos lo que falta cobrar, dan los $14.650 de la caja. |
| 375 | A | resumen | — | — | — | — (— l.) | 313 / — | — | — | 176.0 | 21.6 | 4.63 | — |
| 375 | A | mal (punteado) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 52 60 52 52 | 240.0 | 21.6 | 5.06 | — |
|  |  | ↳ mal: pista 287.0 px, punteado 169.6 px, cifra de sus respuestas $19.650, renglones 52 60 52 52 |
|  |  | ↳ leyenda: «Punteado: así quedaba con tus respuestas» (16.0 px); renglón tenue: «Equipo aportado +$5.000 (tu respuesta)» (32.0 px, nombre en 1 l., cifra en 2 l.), contraste 7.15:1; devolución: El equipo entró a la empresa, pero no es plata. La caja no lo ve. |
| 375 | A | mal (caja negativa, A7) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 60 52 52 52 | 192.0 | 21.6 | 5.06 | — |
|  |  | ↳ negativa: pista 287.0 px, punteado ninguno, cifra de sus respuestas −$350, renglones 60 52 52 52 |
|  |  | ↳ leyenda: «Con tus respuestas, la caja daba −$350» (16.0 px); renglón tenue: ninguno; devolución: Los socios metieron plata a la caja, y un aporte no es ingreso. Por eso la caja tiene más que la utilidad. |
| 375 | A | mal (cuadra con errores, A6) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 52 60 52 60 | 208.0 | 21.6 | 5.06 | — |
|  |  | ↳ cuadra: pista 287.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 60 52 60 |
|  |  | ↳ leyenda: ninguna; renglón tenue: «Equipo aportado +$5.000 (tu respuesta)» (32.0 px, nombre en 1 l., cifra en 2 l.), contraste 7.15:1; devolución: Llegaste a la caja correcta, pero con dos fichas mal puestas: sus errores se cancelaron. |
| 375 | B | vacío | 137.3 | 128.0 | 293.3–405.3 | 92.0 (1 l.) | 313 / 289 | 91.0×44 · 91.0×44 · 91.0×44 | — | — | — | 6.99 | 3.01 |
| 375 | B | a mitad | 137.3 | 128.0 | 293.3–423.3 | 110.0 (2 l.) | 313 / 289 | 91.0×44 · 91.0×44 · 91.0×44 | 44 44 | — | — | 6.99 | 3.01 |
| 375 | B | todas, con «Comprobar» | 137.3 | 128.0 | 293.3–405.3 | — (— l.) | 313 / — | — | 44 44 44 44 44 44 | — | — | 5.06 | — |
| 375 | B | bien | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 52 52 52 52 52 52 | 236.0 | 12.9 | 5.06 | — |
|  |  | ↳ bien: pista 287.0 px, punteado ninguno, cifra de sus respuestas —, renglones 52 52 52 52 52 52 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Escenario simulado. Los $1.541.000 de utilidad, más el impuesto que se debe, el aporte y el préstamo, menos el anticipo y lo que falta cobrar, dan los $6.800.000 de la caja. |
| 375 | B | resumen | — | — | — | — (— l.) | 313 / — | — | — | 236.0 | 12.9 | 4.63 | — |
| 375 | B | mal (punteado) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 52 52 60 52 52 60 | 300.0 | 12.9 | 5.06 | — |
|  |  | ↳ mal: pista 287.0 px, punteado 205.0 px, cifra de sus respuestas $9.500.000, renglones 52 52 60 52 52 60 |
|  |  | ↳ leyenda: «Punteado: así quedaba con tus respuestas» (16.0 px); renglón tenue: «Equipo comprado a crédito +$1.500.000 (tu respuesta)» (32.0 px, nombre en 1 l., cifra en 2 l.), contraste 7.15:1; devolución: Salió plata por un arriendo que aún no se usa. No bajó la utilidad, pero sí la caja. |
| 375 | B | mal (caja negativa, A7) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 60 52 52 52 52 52 | 252.0 | 12.9 | 5.06 | — |
|  |  | ↳ negativa: pista 287.0 px, punteado ninguno, cifra de sus respuestas −$3.200.000, renglones 60 52 52 52 52 52 |
|  |  | ↳ leyenda: «Con tus respuestas, la caja daba −$3.200.000» (16.0 px); renglón tenue: ninguno; devolución: Los socios metieron plata a la caja este mes, y un aporte no es ingreso. La caja tiene más por eso. |
| 375 | B | mal (cuadra con errores, A6) | 137.3 | 128.0 | — | — (— l.) | 313 / — | — | 60 52 60 60 52 52 | 236.0 | 12.9 | 5.06 | — |
|  |  | ↳ cuadra: pista 287.0 px, punteado ninguno, cifra de sus respuestas —, renglones 60 52 60 60 52 52 |
|  |  | ↳ leyenda: ninguna; renglón tenue: ninguno; devolución: Llegaste a la caja correcta, pero con tres fichas mal puestas: sus errores se cancelaron. |
|  |  | movimiento reducido a 375, a los 80 ms de «Comprobar»: puente visible, opacidad mínima 1, punteado sí, «Iba aquí» 1 |

**§10, PARADA · «No mueve la caja» en cada tarjeta:**

| Ancho | Versión | Ficha | Botón | Por dentro | Renglones | Palabras cortadas |
|---|---|---|---|---|---|---|
| 320 | A | Aporte en plata | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | A | Equipo aportado | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | A | Cuentas por cobrar – clientes | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | A | Alquiler por pagar | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Aporte en plata | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Préstamo recibido | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Arriendo abril–junio, por anticipado | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Cuentas por cobrar – clientes | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Impuesto de renta por pagar | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 320 | B | Equipo comprado a crédito | 72.7×44.0 | 64.7 | No mueve / la caja | ninguna |
| 375 | A | Aporte en plata | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | A | Equipo aportado | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | A | Cuentas por cobrar – clientes | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | A | Alquiler por pagar | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Aporte en plata | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Préstamo recibido | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Arriendo abril–junio, por anticipado | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Cuentas por cobrar – clientes | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Impuesto de renta por pagar | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |
| 375 | B | Equipo comprado a crédito | 91.0×44.0 | 83.0 | No mueve la / caja | ninguna |

**La regla de ventana:** la ranura de decisión entera en la ventana, con la vista en la ficha del caso.

| Partida | Paso | Arriba | Abajo | Alto | Ventana |
|---|---|---|---|---|---|
| 320 · A · paso 1 tras «Así se juega» | Paso 1 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · bien | Paso 1 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · bien | Paso 2 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · bien · devuelta desde la lista | Paso 1 de 4 | 308.8 | 420.8 | 112.0 | 568 |
| 320 · A · bien | Paso 3 de 4 | 308.8 | 438.8 | 130.0 | 568 |
| 320 · A · bien | Paso 4 de 4 | 308.8 | 420.8 | 112.0 | 568 |
| 320 · A · bien | Comprobar | 308.8 | 420.8 | 112.0 | 568 |
| 320 · A · mal | Paso 1 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · mal | Paso 2 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · mal | Paso 3 de 4 | 352.8 | 482.8 | 130.0 | 568 |
| 320 · A · mal | Paso 4 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · mal | Comprobar | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · negativa | Paso 1 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · negativa | Paso 2 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · negativa | Paso 3 de 4 | 352.8 | 482.8 | 130.0 | 568 |
| 320 · A · negativa | Paso 4 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · negativa | Comprobar | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · cuadra | Paso 1 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · cuadra | Paso 2 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · cuadra | Paso 3 de 4 | 352.8 | 482.8 | 130.0 | 568 |
| 320 · A · cuadra | Paso 4 de 4 | 352.8 | 464.8 | 112.0 | 568 |
| 320 · A · cuadra | Comprobar | 352.8 | 464.8 | 112.0 | 568 |
| 320 · B · bien | Paso 1 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · bien | Paso 2 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · bien · devuelta desde la lista | Paso 1 de 6 | 328.8 | 440.8 | 112.0 | 568 |
| 320 · B · bien | Paso 3 de 6 | 328.8 | 458.8 | 130.0 | 568 |
| 320 · B · bien | Paso 4 de 6 | 328.8 | 458.8 | 130.0 | 568 |
| 320 · B · bien | Paso 5 de 6 | 328.8 | 458.8 | 130.0 | 568 |
| 320 · B · bien | Paso 6 de 6 | 328.8 | 458.8 | 130.0 | 568 |
| 320 · B · bien | Comprobar | 328.8 | 440.8 | 112.0 | 568 |
| 320 · B · mal | Paso 1 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · mal | Paso 2 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · mal | Paso 3 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · mal | Paso 4 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · mal | Paso 5 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · mal | Paso 6 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · mal | Comprobar | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · negativa | Paso 1 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · negativa | Paso 2 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · negativa | Paso 3 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · negativa | Paso 4 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · negativa | Paso 5 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · negativa | Paso 6 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · negativa | Comprobar | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · cuadra | Paso 1 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · cuadra | Paso 2 de 6 | 384.8 | 496.8 | 112.0 | 568 |
| 320 · B · cuadra | Paso 3 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · cuadra | Paso 4 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · cuadra | Paso 5 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · cuadra | Paso 6 de 6 | 384.8 | 514.8 | 130.0 | 568 |
| 320 · B · cuadra | Comprobar | 384.8 | 496.8 | 112.0 | 568 |
| 375 · A · paso 1 tras «Así se juega» | Paso 1 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · bien | Paso 1 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · bien | Paso 2 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · bien · devuelta desde la lista | Paso 1 de 4 | 395.8 | 507.8 | 112.0 | 667 |
| 375 · A · bien | Paso 3 de 4 | 395.8 | 525.8 | 130.0 | 667 |
| 375 · A · bien | Paso 4 de 4 | 395.8 | 507.8 | 112.0 | 667 |
| 375 · A · bien | Comprobar | 395.8 | 507.8 | 112.0 | 667 |
| 375 · A · mal | Paso 1 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · mal | Paso 2 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · mal | Paso 3 de 4 | 451.8 | 581.8 | 130.0 | 667 |
| 375 · A · mal | Paso 4 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · mal | Comprobar | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · negativa | Paso 1 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · negativa | Paso 2 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · negativa | Paso 3 de 4 | 451.8 | 581.8 | 130.0 | 667 |
| 375 · A · negativa | Paso 4 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · negativa | Comprobar | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · cuadra | Paso 1 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · cuadra | Paso 2 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · cuadra | Paso 3 de 4 | 451.8 | 581.8 | 130.0 | 667 |
| 375 · A · cuadra | Paso 4 de 4 | 451.8 | 563.8 | 112.0 | 667 |
| 375 · A · cuadra | Comprobar | 451.8 | 563.8 | 112.0 | 667 |
| 375 · B · bien | Paso 1 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · bien | Paso 2 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · bien · devuelta desde la lista | Paso 1 de 6 | 427.8 | 539.8 | 112.0 | 667 |
| 375 · B · bien | Paso 3 de 6 | 427.8 | 557.8 | 130.0 | 667 |
| 375 · B · bien | Paso 4 de 6 | 427.8 | 557.8 | 130.0 | 667 |
| 375 · B · bien | Paso 5 de 6 | 427.8 | 557.8 | 130.0 | 667 |
| 375 · B · bien | Paso 6 de 6 | 427.8 | 557.8 | 130.0 | 667 |
| 375 · B · bien | Comprobar | 427.8 | 539.8 | 112.0 | 667 |
| 375 · B · mal | Paso 1 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · mal | Paso 2 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · mal | Paso 3 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · mal | Paso 4 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · mal | Paso 5 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · mal | Paso 6 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · mal | Comprobar | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · negativa | Paso 1 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · negativa | Paso 2 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · negativa | Paso 3 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · negativa | Paso 4 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · negativa | Paso 5 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · negativa | Paso 6 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · negativa | Comprobar | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · cuadra | Paso 1 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · cuadra | Paso 2 de 6 | 452.8 | 564.8 | 112.0 | 667 |
| 375 · B · cuadra | Paso 3 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · cuadra | Paso 4 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · cuadra | Paso 5 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · cuadra | Paso 6 de 6 | 452.8 | 582.8 | 130.0 | 667 |
| 375 · B · cuadra | Comprobar | 452.8 | 564.8 | 112.0 | 667 |

Compartido, no de esta pieza (se informa, no falla):
LETRA 11.5px span «?» (compartido)
LETRA 11px p «RESULTADO» (compartido)

Todo cumple a 320 y 375 en A y B: la ranura entera en la ventana en cada paso, «No mueve la caja» sin cortes, tramo menor ≥ 4 px, sin barra, nada se sale, nada bajo 12 px, toques ≥ 44, texto ≥ 4,5:1 y contorno ≥ 3:1.

## Pensamiento Estratégico (etiquetasItem.js y subjects.js son compartidos)

Salida de `node --import ./scripts/cargador-jsx.mjs scripts/t3/capturas-pe-resultado-caja.mjs`, 2026-10-24 21:57 (Bogotá), sobre `dist` con Supabase falso, servido en el 8099, con la sesión fingida.

| Ancho | Captura | Lo que se ve | | | | |
|---|---|---|---|---|---|---|
| 320 | (a) panel docente, «Radar de profundidad» | 6 de 6 ítems con su enunciado | ids crudos: ninguno | aviso «no se pudo nombrar»: no | barra: no | errores: 0 |
| 320 | (b) temas de PE | 3 de 3 temas en pantalla (Pensamiento Sistémico, Modelo del Iceberg, Fuerzas de Porter) | queda «Cargando…»: no | — | barra: no | errores: 0 |
| 375 | (a) panel docente, «Radar de profundidad» | 6 de 6 ítems con su enunciado | ids crudos: ninguno | aviso «no se pudo nombrar»: no | barra: no | errores: 0 |
| 375 | (b) temas de PE | 3 de 3 temas en pantalla (Pensamiento Sistémico, Modelo del Iceberg, Fuerzas de Porter) | queda «Cargando…»: no | — | barra: no | errores: 0 |

PE cumple a 320 y 375: los ítems de «Radar de profundidad» salen con su enunciado y la lista de temas carga entera.
