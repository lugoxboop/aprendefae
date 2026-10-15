**T4 · A1 «La caja» · cambios de la versión 5 sobre la v4** (v1 + `v2` + `v3` + `v4-cambios`).
- Autora: Katsumi. Motivo: decisión de Yujiro de aplicar a A1 la regla que Hanayama pidió para A2.
- Regla aplicada: **cada opción equivocada explica por qué falla, sin nombrar la correcta. La correcta solo se explica al acertar, y lo que revela la respuesta solo se muestra con el acierto.**
- Solo cambian los errores de las dos preguntas. Lo demás queda como en la v4.
- INFLESZ **medido** con `src/herramientas/inflesz.js`.
- Numeración: la de la v2 en adelante, es decir, P6 la consignación y P8 el control que falla.

## Cambio 1 · P6 «La consignación»

| Opción | v1-v4 (revelaba) | **v5** |
|---|---|---|
| «No se mueve: la plata sigue siendo de la empresa.» | «Sigue siendo de la empresa, pero ya no está en la caja. Salió de un activo, Caja, y entró a otro, Bancos.» | «Que siga siendo de la empresa no quiere decir que siga en la caja. La pregunta es dónde está la plata después de consignarla.» (88,4) |
| «Se debita por $435.000: la empresa ahora tiene más plata.» | «No entró plata nueva: son los mismos $435.000 cambiando de lugar. Caja baja y Bancos sube.» | «No entró plata nueva: son los mismos $435.000 que la empresa ya tenía. Debitar Caja sería contarlos dos veces.» (76,0) |

- *[«Sería contarlos dos veces» es razonamiento mío: la plata ya se debitó a Caja al cobrar (P5). El libro no lo dice así.]*
- **El acierto no cambia** (v2): «Así es. La plata salió de la caja y llegó al banco. Mira el asiento de la p. 180: Bancos se debita por $435.000 y Caja se acredita por $435.000.» (91,3)
- **El asiento 2 ya no se muestra «en cualquier caso».** Ahora se muestra **solo con el acierto**, porque es la respuesta.

## Cambio 2 · P8 «¿Qué control falla?»

| Opción | v1-v4 (revelaba) | **v5** |
|---|---|---|
| «Llevar al banco, cada día, el efectivo que se recibió.» | «… Lo que sí dice es que una sola persona cobra y registra. Ese es el control que falla.» | «Puede que esta papelería tampoco consigne cada día, pero el caso no dice nada de eso. Fíjate en lo que sí cuenta el caso.» (78,0) |
| «Poner un tope a los pagos que se hacen en efectivo.» | «… Lo que falla es que una sola persona cobra y registra.» | «Ese control es sobre lo que la empresa paga, y aquí la empleada está cobrando. Fíjate en quién hace qué.» (81,6) |

- Los dos errores dicen por qué esa opción no encaja y apuntan al caso, sin nombrar el control que falla.
- **El acierto no cambia** (v4): «Así es. El libro pide separar a quien recibe el dinero de quien lo registra. Si una sola persona hace las dos cosas, un error o una pérdida de plata puede pasar sin que nadie lo vea.» (88,4)

## Lo que Baki tiene que reconstruir

En `contabilidadT4.js`:
- los cuatro textos de error de esta lista;
- que el asiento 2 de P6 aparezca solo con el acierto.

Ninguna cifra cambia.

## Erratas que toca esta pieza

Sin cambios: ninguna.
