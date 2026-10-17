**T4 · H3 «¿Se mueve la caja menor?» · versión 2: el rediseño de enganche.**
- **Este archivo es la versión vigente de H3.** Sustituye las tarjetas, las devoluciones, el cierre y «Así se juega» de `d4-t4-h3-v1.md`, de `d4-t4-h3-serie2.md` y de la parte de H3 de `d4-t4-asi-se-juega-v1.md`. Mismo `activity_id` (`t4-se-mueve-la-caja-menor`, migración 0202, sin cambios) y mismos ítems (`h3-1`…`h3-4`, `h3s2-1`…`h3s2-4`).
- **Objetivo (D2, 16 oct 2026):** se ve antes de empezar, en el Encabezado compartido (su prop `objetivo`), sobre la consigna: «Asentar el fondo de caja menor.» Texto corto de Katsumi: con el largo, las palabras antes de la figura pasaban de 40 (B1).
- **D9 (lote nocturno, 16 oct 2026; Hanayama):** «Lo que dice el libro» es una hoja de libro mayor: un doble margen a la izquierda, dos líneas verticales de 1 px #B8C4D4, 3 px entre ellas, del alto del bloque. Solo en H3 (A2 no lo lleva). Reemplaza la nota anterior de D9 para H3.
- Por qué: la pieza publicada en la pila fallaba la barra de enganche B1-B5 (`orquestador/conocimiento/enganche.md`; diagnóstico de Shibukawa, `celula-d/shibukawa-diagnostico-enganche.md`).
- Diseño: Hanayama (`celula-d/hanayama-h3-rediseno.md`). Textos: Katsumi (`celula-d/katsumi-texto-hacer.md`, 15 oct 2026), copiados aquí tal cual. Aprobados por Yujiro en su corte de calidad (`celula-d/corte-calidad.md`, «Hacer que quedan» y «Texto de los Hacer»).
- El código lee estos textos de `src/data/contabilidadT4H3.js`; una prueba (`src/contabilidad/__tests__/t4-h3-*.test.mjs`) compara cada uno contra este archivo, letra por letra.
- Lo que cambia frente a la v1, para todas las piezas: `d4-t4-hacer-v2-cambios.md`.

## H3 «¿Se mueve la caja menor?» · `t4-se-mueve-la-caja-menor`

**Consigna** (17 pal. · INFLESZ 112,9; tope 24): Pon el monto en la cuenta que va al debe y en la que va al haber.

Renglones a 320 y a 375: 2 (capturas; la figura queda a 181 px).

### Tarjetas (el monto va aparte, en la tarjeta)

| Serie · operación | Monto | Enunciado | Conteo | Renglones 320 / 375 (tope 4) | Página |
|---|---|---|---|---|---|
| 1 · Apertura del fondo | 300.000 | El 1 de marzo, Distribuidora Andina abre una caja menor. Le hace un cheque a Lucía, que la va a manejar. | 21 pal. · INFLESZ 77,7 | 4 / 3 | p. 181 |
| 1 · Reembolso | 214.600 | El 31 de marzo, Lucía entrega los soportes de sus pagos y recibe el cheque del reembolso. | 17 pal. · INFLESZ 68,9 | 3 / 3 | p. 182 |
| 1 · Aumento del fondo | 150.000 | El fondo se queda corto y lo reponen cada semana. En abril lo suben con un cheque. | 17 pal. · INFLESZ 95,7 | 3 / 3 | p. 182 |
| 1 · Disminución del fondo | 100.000 | Meses después, la plata del fondo se queda quieta. Lo bajan, y Lucía devuelve la diferencia. | 16 pal. · INFLESZ 82 | 3 / 3 | p. 182 |
| 2 · Apertura del fondo | 280.000 | El 2 de agosto, Muebles El Roble abre una caja menor. Le hace un cheque a Andrés, que la va a manejar. | 22 pal. · INFLESZ 91,1 | 4 / 3 | p. 181 |
| 2 · Reembolso | 187.350 | El 31 de agosto, Andrés entrega los soportes de sus pagos y recibe el cheque del reembolso. | 17 pal. · INFLESZ 68,9 | 3 / 3 | p. 182 |
| 2 · Aumento del fondo | 165.000 | El fondo se queda corto y lo reponen cada semana. En septiembre lo suben con un cheque. | 17 pal. · INFLESZ 92,1 | 4 / 3 | p. 182 |
| 2 · Disminución del fondo | 70.000 | Meses después, la plata del fondo se queda quieta. Lo bajan, y Andrés devuelve la diferencia. | 16 pal. · INFLESZ 85,9 | 3 / 3 | p. 182 |

Antes, a 320, los enunciados ocupaban 4, 5, 5 y 6 renglones (Hanayama). Ahora ninguno pasa de 4.

### El sobre y el libro (rótulos de la figura)

«LO QUE TIENE LUCÍA» (serie 2: «LO QUE TIENE ANDRÉS») · «Billetes y monedas» · «Soportes de gastos» · «Suman» · «LO QUE DICE EL LIBRO» · «Caja menor» · «= sobre». Son los de Hanayama; los apruebo. La cabecera del tablero, «DEBE · HABER», y los nombres de las cuentas no cambian.

**Línea «diría»** (13 pal. con las cifras; ✗ delante, en coral): «Con tu asiento, el libro diría 514.600, pero en el sobre hay 300.000.»

- Medido: **2 renglones** a 320 como mucho (tope 2), en todos los errores medidos.
- *x* = el saldo de Caja menor con el asiento del estudiante; *y* = lo que hay en el sobre **después** de la operación. Se muestra solo si el asiento toca Caja menor y *x* ≠ *y*. Valores de cada combinación en «Cifras».

### Devoluciones

Un intento por operación. Si hay varios errores, sale el primero de la lista (orden del paquete). Las 11 combinaciones equivocadas de cada operación tienen mensaje (script).

**Apertura del fondo** · asiento: caja-menor al debe / bancos al haber · pie: «Basado en el libro, p. 181. Cifras construidas»

| Caso | Texto | Conteo |
|---|---|---|
| Acierto | Correcto. La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por $300.000. | 20 pal. · INFLESZ 81,6 |
| Acierto, serie 2 | Correcto. La plata sale del banco y entra al fondo: Caja menor se debita y Bancos se acredita por $280.000. | 20 pal. · INFLESZ 81,6 |
| Eligió Gastos generales | Es la primera vez que se arma el fondo, y nada se ha gastado todavía. No hay gastos que anotar: solo pasa plata de Bancos a Caja menor. | 28 pal. · INFLESZ 88,3 |
| Caja en lugar de Caja menor | Caja no recibe nada aquí. El cheque sale del banco y la plata va al fondo nuevo, así que la cuenta que sube es Caja menor. | 26 pal. · INFLESZ 90,8 |
| Debe Caja menor / haber Caja | El fondo no se arma con plata de la caja de la empresa. Se abre con un cheque, y un cheque sale del banco. | 24 pal. · INFLESZ 104 |
| Debe Caja / haber Caja menor | Al abrir el fondo, la plata entra a la caja menor, no sale de ella. Y no viene de la caja de la empresa, sino de un cheque. | 28 pal. · INFLESZ 99,4 |
| Cuentas bien, lados al revés | Las dos cuentas están bien, pero al revés. Caja menor sube, así que va al debe. Bancos baja, así que va al haber. | 23 pal. · INFLESZ 101,7 |

**Reembolso** · asiento: gastos-generales al debe / bancos al haber · pie: «Basado en el libro, p. 182. Cifras construidas»

| Caso | Texto | Conteo |
|---|---|---|
| Acierto | Correcto. Los gastos van a Gastos generales, al debe, y el cheque sale de Bancos, al haber. Caja menor no se mueve. | 22 pal. · INFLESZ 94,7 |
| Caja menor al debe (la trampa) | Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo $300.000. Mira el asiento de la p. 182: Caja menor no aparece. | 31 pal. · INFLESZ 78,5 / 75,9 |
| Caja menor al debe (la trampa), serie 2 | Esta es la trampa del reembolso. El cheque repone la plata gastada, pero el fondo no crece: sigue valiendo $280.000. Mira el asiento de la p. 182: Caja menor no aparece. | 31 pal. · INFLESZ 78,5 / 75,9 |
| Caja menor al haber | Caja menor no paga el cheque del reembolso: lo paga el banco. Mira el asiento de la p. 182: se acredita Bancos, y Caja menor no aparece. | 27 pal. · INFLESZ 82,5 / 78 |
| Sin Gastos generales | Al reembolso le faltan los gastos. Lo que se anota es en qué se fue la plata, y eso va a Gastos generales. | 23 pal. · INFLESZ 97,8 |
| Debe Caja / haber Gastos generales | Aquí no entra plata a la caja, y los gastos no bajan. El reembolso anota los gastos que se hicieron y se paga con un cheque. | 26 pal. · INFLESZ 90,8 |
| Debe Gastos generales / haber Caja | El reembolso no se paga con la plata de la caja: se paga con un cheque. | 16 pal. · INFLESZ 97,4 |
| Cuentas bien, lados al revés | Las dos cuentas están bien, pero al revés. Los gastos suben, así que van al debe. El cheque sale del banco, así que Bancos va al haber. | 27 pal. · INFLESZ 103,2 |

**Aumento del fondo** · asiento: caja-menor al debe / bancos al haber · pie: «Basado en el libro, p. 182. Cifras construidas»

| Caso | Texto | Conteo |
|---|---|---|
| Acierto | Correcto. Entran $150.000 más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo. | 18 pal. · INFLESZ 76,7 |
| Acierto, serie 2 | Correcto. Entran $165.000 más al fondo: Caja menor se debita y Bancos se acredita, igual que al abrirlo. | 18 pal. · INFLESZ 76,7 |
| Eligió Gastos generales | El aumento no es un gasto: nadie consumió nada. Solo pasa plata del banco al fondo, así que Caja menor se debita. | 22 pal. · INFLESZ 85,4 |
| Caja en lugar de Bancos | El aumento se paga con un cheque, y un cheque sale del banco. La cuenta que baja es Bancos, no Caja. | 21 pal. · INFLESZ 101,4 |
| Debe Bancos / haber Caja | Bancos no sube y no sale plata de la caja. El aumento es plata que pasa del banco al fondo de caja menor. | 23 pal. · INFLESZ 97,8 |
| Debe Caja / haber Bancos | El cheque sí sale del banco, pero la plata no va a la caja de la empresa: va al fondo de caja menor. | 23 pal. · INFLESZ 91,7 |
| Cuentas bien, lados al revés | Las dos cuentas están bien, pero al revés. El fondo sube, así que Caja menor va al debe. Bancos baja, así que va al haber. | 25 pal. · INFLESZ 101,3 |

**Disminución del fondo** · asiento: caja al debe / caja-menor al haber · pie: «Basado en el libro, p. 182. Cifras construidas»

| Caso | Texto | Conteo |
|---|---|---|
| Acierto | Correcto. Mira el asiento de la p. 182: Caja menor se acredita y la plata que sale del fondo va al debe de Caja. | 24 pal. · INFLESZ 92,4 / 88,4 |
| Eligió Gastos generales | Aquí no hay ningún gasto: el fondo solo devuelve plata que no se usó. Esa plata va al debe de Caja, y Caja menor se acredita. | 26 pal. · INFLESZ 86 |
| Bancos en lugar de Caja | El fondo baja, así que Caja menor va al haber. Y mira el asiento de la p. 182: la plata que sale del fondo va al debe de Caja, no de Bancos. | 32 pal. · INFLESZ 100,8 / 95,4 |
| Debe Bancos / haber Caja | Ni Bancos sube ni Caja baja. Aquí la plata sale del fondo de caja menor y llega a la caja de la empresa. | 23 pal. · INFLESZ 92,4 |
| Debe Caja / haber Bancos | Caja sí recibe la plata, pero esa plata no sale del banco: sale del fondo, que es el que baja. | 20 pal. · INFLESZ 87,2 |
| Cuentas bien, lados al revés | Las dos cuentas están bien, pero al revés. La plata sale del fondo, así que Caja menor va al haber. Llega a Caja, que va al debe. | 27 pal. · INFLESZ 103,2 |

Los errores son los del paquete, sin cambios (Hanayama los usó para medir). Solo cambian los aciertos: sin «Así es.».

### Marcas, botones, cierre

- **Marcas:** ✓ o ✗ sobre cada mitad, sin palabra (diseño de Hanayama); la palabra va en la devolución, que nombra la cuenta. «Iba aquí» se ve como borde blanco en la mitad correcta.
- **Botones y avisos:** «Comprobar», «Siguiente operación», «Ver mi resumen» y «Otra vez» (los aprobados). El aviso «Pon una cuenta al debe y la otra al haber.» ya no hace falta: el tablero no deja poner una cuenta en los dos lados.
- **Resumen:** «N de 4 asientos bien armados.»
- **Cierre** (30 pal. · INFLESZ 75,5): Caja menor se mueve cuando el fondo se abre, se aumenta, se disminuye o se cierra. En el reembolso no se mueve: se debita Gastos generales y se acredita Bancos.
- **Pie del cierre:** «Basado en el libro, pp. 181-182. Cifras construidas»

### «Así se juega»

| Lugar | Texto | Conteo |
|---|---|---|
| Paso 1 | Lee la operación. | 3 pal. |
| Paso 2 | ¿Qué cuenta sube? ¿Cuál baja? | 5 pal. |
| Paso 3 | El libro tiene que dar lo del sobre. | 8 pal. |
| Ejemplo (tarjeta, 200.000; sobre «LO QUE TIENE JULIO») | El 2 de enero, Papelería Arcoíris abre una caja menor. Le hace un cheque a Julio, que la va a manejar. | 21 pal. · INFLESZ 74,7 |
| Acierto del ejemplo | Correcto. La plata pasa del banco al fondo: Caja menor va al debe y Bancos al haber. | 17 pal. · INFLESZ 95,7 |
| Texto alternativo (`alt`) | Papelería Arcoíris abre una caja menor de $200.000. Caja menor va al debe y Bancos al haber, y el libro queda igual que el sobre: 200.000. | 26 pal. · INFLESZ 74 |

Guion: la mano toca `[data-destino='caja-menor:debe']`, después `[data-destino='bancos:haber']` y después «Comprobar». El ejemplo es el del paquete de «Así se juega» (Papelería Arcoíris, 200.000), con el monto fuera del texto.

### Medido (sonda)

- **H3, 320 px** (44 estados medidos): **33 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **H3, 375 px** (44 estados medidos): **33 palabras** antes de la figura (tope 40) · figura a **181 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 0
- **Así se juega, 320 px** (2 estados medidos): **37 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)
- **Así se juega, 375 px** (2 estados medidos): **37 palabras** antes de la figura (tope 40) · figura a **175 px** como mucho (tope 280) · frases repetidas: **0** · desbordes propios: 0 · renglones partidos: 0 · controles < 44 px propios: 2 (Pausar 40; Ver de nuevo 40)

**Páginas:** p. 181 (apertura), p. 182 (reembolso, aumento y disminución); cierre pp. 181-182. Todas las cifras son construidas.
