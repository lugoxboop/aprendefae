# Registro de cifras construidas · Política Monetaria · los tres instrumentos

Célula A. Las tres actividades nuevas del tema Política Monetaria:
`la-tasa-que-muerde`, `repo-o-definitiva` y `el-freno-del-encaje`
(`src/data/pmInstrumentos.js`).

**Ninguna cifra de aquí es un dato vigente de Colombia.** No hay tasa de
intervención, porcentaje de encaje ni rendimiento de TES real: todas son de un
escenario construido, y cada pantalla de las tres actividades lleva el rótulo
«Escenario simulado» a la vista, con el mismo componente que ya usa el tema
(`RotuloEscenario`). La razón es la de siempre, y aquí pesa más porque el tema
tiene estudiantes de verdad: una tasa vigente escrita en una actividad envejece
en semanas y queda enseñando algo falso.

**Los mecanismos sí se afirman con seguridad**, porque no envejecen: una OMA de
expansión mete liquidez, un repo se deshace al vencer, subir el encaje recorta
lo que un banco puede prestar, y la tasa real es la nominal menos la inflación.
Lo que es construido son los NÚMEROS con los que se practica.

Las cifras verificadas del tema (`DATOS_VERIFICADOS` en
`src/data/politicaMonetaria.js`) **no se tocan y no se usan aquí**: estas tres
actividades no citan ninguna.

---

## A · `la-tasa-que-muerde`

Puntos de tasa y de inflación, en un escenario de un año construido. La
distancia (la tasa real) se calcula como resta simple, con un decimal.

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 1 | Enero | tasa de intervención | 9 | 9 | Dato del enunciado |
| 2 | Enero | inflación del año | 11 | 11 | Dato del enunciado |
| 3 | Enero | meta de inflación | 3 | 3 | Dato del enunciado (origen del distractor «comparaste con la meta») |
| 4 | Enero | distancia de hoy | −2 | 9 − 11 | Respuesta calificada (lectura) |
| 5 | Enero | tasa tras subir punto y medio | 10,5 | 9 + 1,5 | Respuesta calificada (consecuencia) |
| 6 | Enero | distancia después | −0,5 | 10,5 − 11 | Intermedia (la dice la devolución) |
| 7 | Enero | inflación del distractor «el mismo mes» | 9 | 9 | Distractor |
| 8 | Junio | tasa de intervención | 10 | 10 | Dato del enunciado |
| 9 | Junio | inflación del año | 6 | 6 | Dato del enunciado |
| 10 | Junio | distancia de hoy | +4 | 10 − 6 | Respuesta calificada (lectura) |
| 11 | Junio | tasa tras bajar dos puntos | 8 | 10 − 2 | Respuesta calificada (consecuencia) |
| 12 | Junio | distancia después | +2 | 8 − 6 | Intermedia |
| 13 | Junio | tasa del distractor «se va del todo» | 5 | 5 | Distractor |
| 14 | Junio | inflación del distractor «aprieta» | 3 | 3 | Distractor |
| 15 | Octubre | tasa de intervención | 7 | 7 | Dato del enunciado |
| 16 | Octubre | inflación del año | 7 | 7 | Dato del enunciado |
| 17 | Octubre | distancia de hoy | 0 | 7 − 7 | Respuesta calificada (lectura) |
| 18 | Octubre | inflación que sube | 9 | 9 | Dato del enunciado (consecuencia) |
| 19 | Octubre | distancia después | −2 | 7 − 9 | Respuesta calificada (consecuencia) |
| 20 | Octubre | tasa del distractor «aprieta» | 9 | 9 | Distractor |

El eje de la figura va de 4 a 14 (`EJE_TASA`), fijo en los tres casos: una
escala que se moviera con el caso haría que la misma distancia midiera distinto
en cada pantalla.

**La ficha de la tasa marca siempre la cifra del caso.** Antes se colocaba a −2,
0 o +2 puntos de la inflación según la categoría elegida, y eso le hacía afirmar
cifras que no eran: en Junio, con el acierto puesto, marcaba 8 donde el caso
decía 10. Lo encontró el auditor de la A6. La categoría elegida se dibuja ahora
como una banda sobre el eje (`BANDA_EJE`), que es geometría de interfaz y no una
cifra del contenido: por eso no entra en este registro.

### Dos casos más (tanda de 3 de 5)

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 53 | Marzo | tasa de intervención | 12 | 12 | Dato del enunciado |
| 54 | Marzo | inflación del año | 13 | 13 | Dato del enunciado |
| 55 | Marzo | distancia de hoy | −1 | 12 − 13 | Respuesta calificada (lectura) |
| 56 | Marzo | inflación que baja | 10 | 10 | Dato del enunciado (consecuencia) |
| 57 | Marzo | distancia después | +2 | 12 − 10 | Respuesta calificada (consecuencia) |
| 58 | Marzo | tasa del distractor «suelta» | 9 | 9 | Distractor |
| 59 | Agosto | tasa de intervención | 6 | 6 | Dato del enunciado |
| 60 | Agosto | inflación del año | 4 | 4 | Dato del enunciado |
| 61 | Agosto | distancia de hoy | +2 | 6 − 4 | Respuesta calificada (lectura) |
| 62 | Agosto | tasa tras subir un punto | 7 | 6 + 1 | Dato del enunciado (consecuencia) |
| 63 | Agosto | inflación tras subir dos | 6 | 4 + 2 | Dato del enunciado (consecuencia) |
| 64 | Agosto | distancia después | +1 | 7 − 6 | Respuesta calificada (consecuencia) |
| 65 | Agosto | inflación del distractor «sigue igual» | 5 | 5 | Distractor |

## B · `repo-o-definitiva`

No hay pesos: la mesa cuenta **paquetes**, cuatro de TES y cuatro de plata, que
pasan de una columna a la otra. Se eligió así a propósito —ni montos ni
rendimientos— porque lo que enseña la pieza es qué se mueve y si vuelve, no
cuánto. Un monto habría obligado a inventar un saldo de base monetaria.

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 21 | — | paquetes en la mesa, de cada clase | 4 | 4 | Escala de la figura (`TOTAL_MESA`) |
| 22 | — | reparto de partida: TES del Banco y plata del sistema | 2 y 2 | 2 | Dato del enunciado (`MESA_BASE`) |
| 23 | Día de impuestos | plata del sistema con el repo de expansión | 3 | 2 + 1 | Respuesta calificada |
| 24 | Día de impuestos | plata del sistema con el repo de contracción | 1 | 2 − 1 | Distractor |
| 25 | Día de impuestos | plazo del repo, en días | 7 | 7 | Dato del enunciado |
| 26 | Día de impuestos | duración del faltante, en días | 3 | 3 | Dato del enunciado |
| 27 | — | tasa a un día, en pasos respecto a la del Banco | −2 a +2 | −2, −1, 0, 1, 2 | Escala de la figura (`POS_TASA`) |

La tasa a un día no lleva número: lleva **pasos** respecto a la tasa del Banco,
que es la línea del medio. Un porcentaje habría sido una cifra vigente
disfrazada, y lo que importa es si está arriba, encima o abajo de la del Banco.

### Dos casos más (tanda de 3 de 5)

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 66 | Sobra para siempre | reparto de partida: TES del Banco y plata del sistema | 3 y 3 | 3 | Dato del enunciado |
| 67 | Sobra para siempre | TES y plata tras la venta definitiva | 2 y 2 | 3 − 1 | Respuesta calificada |
| 68 | Sobra para siempre | TES y plata del distractor «repo de expansión» | 4 y 4 | 3 + 1 | Distractor |
| 69 | Tres meses cortos | meses que lleva renovándose el repo | 3 | 3 | Dato del enunciado |
| 70 | Tres meses cortos | reparto de partida, ya con el repo puesto | 3 y 3 | 3 | Dato del enunciado |
| 71 | Tres meses cortos | TES y plata al pasar a compra definitiva | 3 y 3 | sin cambio | Respuesta calificada (lo que cambia es el plazo, no el monto) |

## C · `el-freno-del-encaje`

Millones de un banco construido. El encaje se dice «de cada 100» y no en por
ciento, igual que en `pmFabricaDelDinero.js`, para no mezclar una proporción
construida con un porcentaje que parezca publicado.

La reserva exigida nunca se declara: la calcula `encajeExigido(depositos,
encaje) = depositos × encaje / 100`, y una prueba la recalcula
(`pm-instrumentos.test.mjs`).

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 28 | Aurora | depósitos | 4.000 | 4000 | Dato del enunciado |
| 29 | Aurora | encaje nuevo, de cada 100 | 10 | 10 | Dato del enunciado |
| 30 | Aurora | encaje viejo, de cada 100 | 8 | 8 | Dato de la devolución del distractor |
| 31 | Aurora | reserva guardada | 340 | 340 | Dato del enunciado |
| 32 | Aurora | reserva exigida hoy | 400 | 4000 × 10 / 100 | Respuesta calificada (lectura) |
| 33 | Aurora | reserva exigida con el encaje viejo | 320 | 4000 × 8 / 100 | Intermedia (la dice la devolución) |
| 34 | Aurora | faltante | 60 | 400 − 340 | Intermedia |
| 35 | Aurora | crédito nuevo antes | 260 | 260 | Dato del enunciado |
| 36 | Aurora | crédito nuevo después | 200 | 260 − 60 | Respuesta calificada (consecuencia) |
| 37 | Aurora, dos meses después | encaje nuevo, de cada 100 | 8 | 8 | Dato del enunciado |
| 38 | Aurora, dos meses después | reserva guardada | 400 | 400 | Dato del enunciado |
| 39 | Aurora, dos meses después | reserva exigida | 320 | 4000 × 8 / 100 | Respuesta calificada (lectura) |
| 40 | Aurora, dos meses después | sobrante | 80 | 400 − 320 | Intermedia |
| 41 | Aurora, dos meses después | crédito nuevo después | 280 | 200 + 80 | Respuesta calificada (consecuencia) |
| 42 | Aurora, dos meses después | depósitos del distractor «devolverlos» | 3.920 | 4000 − 80 | Distractor |
| 43 | Sierra | depósitos | 2.000 | 2000 | Dato del enunciado |
| 44 | Sierra | reserva guardada | 200 | 200 | Dato del enunciado |
| 45 | Sierra | reserva exigida | 200 | 2000 × 10 / 100 | Respuesta calificada (lectura) |
| 46 | Sierra | crédito nuevo | 150 | 150 | Dato del enunciado |
| 47 | Sierra | retiro del cliente | 100 | 100 | Dato del enunciado |
| 48 | Sierra | depósitos después | 1.900 | 2000 − 100 | Dato del enunciado |
| 49 | Sierra | reserva después | 100 | 200 − 100 | Respuesta calificada (consecuencia) |
| 50 | Sierra | reserva exigida después | 190 | 1900 × 10 / 100 | Intermedia |
| 51 | Sierra | faltante después | 90 | 190 − 100 | Intermedia (la dice la devolución) |
| 52 | Sierra | reserva del distractor «sigue justo» | 190 | 190 | Distractor |

### Dos casos más (tanda de 3 de 5)

| # | Caso | Uso | Cifra | Cálculo | Clase |
| --- | --- | --- | --- | --- | --- |
| 72 | Nieve | depósitos | 3.000 | 3000 | Dato del enunciado |
| 73 | Nieve | encaje, de cada 100 | 10 | 10 | Dato del enunciado |
| 74 | Nieve | reserva guardada | 300 | 300 | Dato del enunciado |
| 75 | Nieve | reserva exigida hoy | 300 | 3000 × 10 / 100 | Respuesta calificada (lectura) |
| 76 | Nieve | crédito nuevo | 180 | 180 | Dato del enunciado |
| 77 | Nieve | encaje nuevo, de cada 100 | 12 | 12 | Dato del enunciado (consecuencia) |
| 78 | Nieve | reserva exigida con el encaje nuevo | 360 | 3000 × 12 / 100 | Respuesta calificada (consecuencia) |
| 79 | Nieve | faltante | 60 | 360 − 300 | Intermedia (la dice la devolución) |
| 80 | Nieve | reserva del distractor «se ajusta solo» | 360 | 360 | Distractor |
| 81 | Nieve | encaje del distractor «piden menos» | 8 | 8 | Distractor |
| 82 | Palma | depósitos | 5.000 | 5000 | Dato del enunciado |
| 83 | Palma | encaje, de cada 100 | 8 | 8 | Dato del enunciado |
| 84 | Palma | reserva guardada | 460 | 460 | Dato del enunciado |
| 85 | Palma | reserva exigida | 400 | 5000 × 8 / 100 | Respuesta calificada (lectura) |
| 86 | Palma | sobrante | 60 | 460 − 400 | Intermedia |
| 87 | Palma | crédito nuevo antes | 220 | 220 | Dato del enunciado |
| 88 | Palma | reserva después de prestar lo que sobra | 400 | 460 − 60 | Respuesta calificada (consecuencia) |
| 89 | Palma | crédito nuevo después | 280 | 220 + 60 | Respuesta calificada (consecuencia) |
| 90 | Palma | reserva del distractor «se pasa de largo» | 340 | 460 − 120 | Distractor |
| 91 | Palma | crédito del distractor «se pasa de largo» | 340 | 220 + 120 | Distractor |

El tanque de la figura se escala de 0 a 500 (`TOPE_TANQUE`) y no con los
depósitos: con 4.000 arriba, los 60 que faltan medirían 2 px y la figura diría
«da lo mismo» justo donde se pregunta por la diferencia (E11 de la Célula E).
La barra del crédito se escala de 0 a 400 (`TOPE_CREDITO`), que es el tope que
cabe con los 340 de Palma.

**La línea del encaje cae siempre en lo exigido**, calculado, con su cifra al
lado. Antes se colocaba a ±22 px del relleno según la categoría elegida, así que
con la clasificación acertada no caía donde decía la cuenta —80 px frente a 69
en Aurora 1—. Lo encontró el auditor de la A6. La categoría elegida se dibuja
ahora como una banda sobre el relleno (`BANDA_TANQUE`): geometría de interfaz,
no una cifra del contenido.
