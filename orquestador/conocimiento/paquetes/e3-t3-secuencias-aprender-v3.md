# e3 · T3 · Aprender en SecuenciaAprender: P1, P3, P4 y P5 · paquete v3

> Kamogawa, 24-oct-2026. Junta en un solo archivo lo que Ippo necesita para montar en `SecuenciaAprender` las cuatro piezas de Aprender de T3 (`ingresos-gastos-y-caja`) que ya existen.
>
> **Fuentes** (todas transcritas aquí, regla j):
> - Diseño de Itagaki: la secuencia v2 (§1 a §4), los cambios de la v3 y la v4 de P5.
> - Textos de Miyata: `e3-t3-secuencias-textos-v1.md` y `-v2.md`.
> - Auditoría de Takamura: lote 10.
>
> **Estado:**
> - P1, P3 y P4 tienen **PASA con condiciones** de Takamura (lote 10). Sus condiciones se resolvieron en este paquete.
> - La v4 de P5 y los titulares nuevos tienen **PASA con condiciones** (lote 12). Quedan dos cosas: los cortes literales de las citas (§3, de Itagaki) y la cita de la p. 123 (de Miyata).
> - Las cuentas candidatas de los cuatro asientos están en `e3-t3-secuencias-textos-v3.md` §1, con PASA (lote 13). Las fuentes de sus nombres están en la v4, §3 y §4, y en la adenda 2 del mapa.
> - Ippo puede montar P1, P3 y P4 ya. P5 la monta igual, pero no se fusiona sin el PASA de esa revisión.
>
> **Reglas del montaje:**
> - Solo se agrega. Ningún id de actividad cambia y lo publicado sigue funcionando.
> - El contenido aprobado de cada pantalla no se reescribe.

## 0 · Decisiones que ya están tomadas

| Id | Decisión | Quién |
|---|---|---|
| S3 | Las cuatro preguntas «En una frase» (PREGUNTA_FINAL y OPCIONES_FINAL de P1, P3, P4 y P5) salen de Aprender y pasan al Repaso Diario sin cambiar el texto. El Cierre no lleva acción: es la frase pegada al modelo final. | Kamogawa |
| D1 | **El tope de 60 palabras se cuenta por paso visible**, no por la pantalla entera. El freno duro es `MAX_PASOS = 5`. Por eso se cae la «solución ya decidida» de la v3 de Itagaki: P3-7 va con 4 pasos y P4-8 con 3, sin pantalla Míralo extra y sin fundir P4-5 con P4-6. Total: **9 + 8 + 10 + 10 = 37**. | Takamura |
| D2 | Las 5 cuentas de P5-2 son las de Miyata. Entra Alquiler por pagar en lugar de Gasto salarios. | Takamura |
| D3 | La pista del primer error reemplaza al apoyo. En el intento siguiente la pista se retira y vuelve el apoyo. Después de un error: un reintento y luego el estado correcto. | Takamura |
| C4 | **Ippo monta contra la columna «Pantalla» / «Texto clave»** de la tabla de correspondencia (§4), no contra el número de Miyata ni contra el de Itagaki. | Takamura |
| C7 | **Las claves de las cuentas candidatas se nombran por contenido** (`CUENTAS_ASIENTO_P3_SANCALIXTO`, `_P3_SANMIGUEL`, `_P4_JUNIO`, `_P4_COSTA`), sin número, porque `CUENTAS_P4_6` y `OPC_P4_6` apuntaban a pantallas distintas. En `e3-t3-secuencias-textos-v3.md` §1 conservan el nombre viejo: es el mismo contenido. | Takamura (lote 13) |
| C6 | ⛔ **Antes de montar, Ippo mide a 320 una pista compacta con la marca de 10 px.** Si no se distingue, la marca sube a 12, cada pista a 30 y el reparto de la figura se recalcula. Si pasa eso, para y avisa en el PR. | Itagaki y Takamura |
| P5-2 | Como máximo 5 pasos, porque `MAX_PASOS = 5`. | Kamogawa |

## 1 · Reparto fijo de la figura (el mismo en las cuatro piezas, D5)

| Zona de la figura | 320 | 375 |
|---|---|---|
| **Modelo** | 98 px | 148 px |
| Separación | 8 | 8 |
| **Fila de control** | 44 | 44 |
| **Total** | **150** | **200** |

**La fila de control se reserva en todas las pantallas,** aunque esté vacía, para que nada salte al avanzar.
- Lleva los botones de elección: 2 de 125 px, 3 de 80 o 4 de 58 a 320 [calculado: (258 − 8 × (n − 1)) / n].
- O lleva el control ‹ › (44 + 154 + 44 a 320).
- O lleva el campo de valor de r5.
- La pastilla «Correcto» o «No va aquí» va en la esquina superior derecha del modelo.

**Desborde del apoyo** [calculado: 33 caracteres por línea a 320 y 40 a 375]:
- Hasta 4 líneas (88 px) cabe, con 22 px de desborde, por debajo del tope de 40.
- Con 5 líneas no cabe.
- Si un texto aprobado pasa de 4 líneas a 320, se reparte en «Paso 1 de 2» y «Paso 2 de 2» en la zona del paso, por frase completa o, en las citas, por cláusula. No se reescribe nada.

**Objetos compactos del modelo de 98 px:**
- **Dos líneas compactas:** cada pista tiene su rótulo (12/600, #A8B6C8, 16 px) y un carril de 12 px; la marca, de 10 px y sin tallo, va sobre el carril (ver C6). Cada pista mide 28 px. En P1, cada pista lleva además una línea de contadores de 16 px, «Ingresos $X · Gastos $Y», en Inter 12 con la cifra en mono 12; con ella la pista mide 44.
- **O1 compacto:** las casillas «Debe» y «Haber» lado a lado, de 125 × 52, con su rótulo encima (16 + 4). El monto dado va en la fila de control. **Alto: 72.**
- **T compacta:** nombre 16, cabecera 16, acumulado 22, saldo 22, más 12 de separaciones. **Alto: 88.**
- **O4 compacto:** dos barras de 16 + 10 + 6 y el renglón del resultado (22). **Alto: 86.**

**El asiento se arma con ‹ cuenta ›, sin hojas** (P3-5, P3-7, P4-6 y P4-9):
1. Se toca la casilla «Debe» o «Haber» y queda activa, con un borde de 2 px #F8F9FA.
2. En la fila de control, ‹ › recorre las cuentas candidatas.
3. Tocar el centro pone esa cuenta en la casilla activa.
4. Las candidatas son CUENTAS_{pantalla}, 4 por asiento como máximo, todas con nombre publicado.
5. **Las candidatas son CUENTAS_ASIENTO_P3_SANCALIXTO, CUENTAS_ASIENTO_P3_SANMIGUEL, CUENTAS_ASIENTO_P4_JUNIO y CUENTAS_ASIENTO_P4_COSTA**, con su error por cuenta y uno de «al revés» por par. Están en `e3-t3-secuencias-textos-v3.md` §1.

## 2 · P1, P3 y P4: la secuencia (v2 de Itagaki, con la v3 aplicada)

### P1 «Vender no es cobrar» · 9 pantallas

**Modelo:** las dos líneas compactas con contadores (2 × 44 + 6 = **94 de 98**).

| n | Tipo | Toque | Consecuencia | Fila de control | Apoyo a 320 |
|---|---|---|---|---|---|
| 1 | Apertura (con TEXTO_PASO_1) | — | Las dos líneas se dibujan; los rótulos de pista entran como 2 pasos | vacía | 103 caracteres → 4 líneas ✓ |
| 2 | Haz | Predice el aporte | Círculo lleno en caja; «Entró» llega a 15.000 | 3 botones · OPC_PREDICE | 143 → 5 líneas: se parte en 2 pasos |
| 3 | Haz | Servicio | Las dos marcas caen | OPC_PREDICE | 83 → 3 ✓ |
| 4 | Haz | Factura | Solo cae la de arriba | OPC_PREDICE | 121 → 4 ✓ |
| 5 | Haz | Máquina | Gasto arriba; la caja queda quieta | OPC_PREDICE | 140 → 5: se parte en 2 pasos |
| 6 | Haz | Lleva cada nombre a su marca (arrastrar, o tocar el nombre y luego la marca) | El nombre se pega a su marca y la definición pasa al apoyo | 4 fichas de 58 × 44 | Cada definición cabe en 3 líneas ✓ |
| 7 | Haz | Inventario (al llegar, las líneas vuelven a cero con AVISO_CAMBIO) | Solo «Salió» | OPC_PREDICE | 100 → 4 ✓ |
| 8 | Haz | Computador | Solo «Entró» | OPC_PREDICE | 94 → 3 ✓ |
| 9 | Cierre | — | CIERRE, pegado al modelo final | vacía | 102 → 4 ✓ |

**OPC_PREDICE va en 3 botones de 80 × 44 (decisión de Kamogawa, lote 12):** «Ingresos y gastos», que se parte en dos líneas («Ingresos / y gastos»), «Caja» y «Las dos». **«Ninguna» sale**, junto con su error («Algo sí se movió…»). Takamura comprobó que «Ingresos y gastos» tiene 17 caracteres y no cabe en 58 px. Ninguno de los seis hechos tiene «Ninguna» como respuesta correcta, y una rejilla de 2 × 2 taparía los contadores. **Ippo mide a 320 que «Ingresos / y gastos» quepa en 2 líneas de 80 sin cortar palabra.**

### P3 «Lo que ya pasó y no se ha pagado» · 8 pantallas

**Modelo:**
- fila de días del **24 al 31** (v3, S1): 8 celdas de 32 px a 320 y de 39 a 375, con cada número en mono 12 y 14 px de alto;
- pista de gastos, 28;
- corchete «Retardo», 16;
- pista de caja, 28;
- separaciones de 5 px.

**Total: 98.**

| n | Tipo | Toque | Consecuencia | Control |
|---|---|---|---|---|
| 1 | Apertura (con SEGMENTOS_P3[0]) | — | Se dibujan la máquina y la fila, **sin ninguna marca de uso** | vacía |
| 2 | Haz | ¿Cuántos días? | Sin marcas mientras elige. **Al acertar, caen las 5 marcas de gasto sobre el 27, 28, 29, 30 y 31** (200 ms cada una, con 80 ms de desfase), y el gasto llega a $2.500. Con el segundo error caen igual, ya en el estado correcto. | 3 botones · OPC_P3_1 |
| 3 | Haz | ¿La caja se mueve? | La caja queda quieta y aparece «Se causa» | 2 botones · OPC_SI_NO |
| 4 | Haz | Pon el corte | Aparecen «Cierre del mes» y el corchete «Retardo» | ‹ › |
| 5 | Haz | Asiento de San Calixto | Aparece «Ajuste» | O1 compacto en el modelo · ‹ cuenta › con CUENTAS_ASIENTO_P3_SANCALIXTO |
| 6 | Haz | ¿Ingreso o gasto para San Miguel? | El modelo cambia a la otra empresa | 2 botones · OPC_P3_5 |
| 7 | Haz, **3 pasos** | Su asiento, y luego las citas | Aparece «Acumulado». **Pasos 2 y 3: una cita por paso, en la tarjeta de cita** (ver «Citas del libro» en §3): la de la p. 139 y luego la de la p. 141. | O1 compacto · ‹ cuenta › con CUENTAS_ASIENTO_P3_SANMIGUEL |
| 8 | Cierre | — | CIERRE_P3 | vacía |

Todos los textos de P3 caben en 4 líneas ✓.

### P4 «Lo que ya se pagó y no ha pasado» · 10 pantallas

**Modelo:**
- pista de gastos, 28;
- pista de caja, 28;
- **fila del bloque:** 3 fichas de 80 × 30 («Junio», «Julio» y «Agosto»), cada una con su cifra en mono 12;
- separaciones de 6 px.

**Total: 98.**

| n | Tipo | Toque | Consecuencia | Control |
|---|---|---|---|---|
| 1 | Apertura (con SEGMENTOS_P4[0]) | — | Se dibujan las dos líneas | vacía |
| 2 | Haz | Predice el pago | Solo sale la caja | OPC_PREDICE |
| 3 | Haz | ¿Ya hubo gasto? | Arriba queda quieta | OPC_SI_NO |
| 4 | Haz | ¿Tiene, debe o gasto? | Aparecen el bloque y «Pagado por anticipado» | 3 botones · OPC_P4_3 |
| 5 | Haz | El corte de junio | Una ficha se consume | ‹ › |
| 6 | Haz | Arma el asiento | — | O1 compacto (en esta pantalla reemplaza a las pistas) · ‹ cuenta › con CUENTAS_ASIENTO_P4_JUNIO |
| 7 | Haz | ¿Cuánto queda? | **El bloque queda tapado hasta que responde (E8)**; luego aparece «$10.000» | 3 botones · OPC_P4_6 |
| 8 | Haz, **3 pasos** | La otra empresa: ¿tiene o debe? Después, las citas | Bloque con contorno y «Recibido por anticipado». **Pasos 2 y 3: una cita por paso, en la tarjeta de cita:** la de la p. 142 y luego la de la p. 145 (páginas del literal publicado en `delLibro`). | 2 botones · OPC_P4_7 |
| 9 | Haz | Su asiento | — | O1 compacto · ‹ cuenta › con CUENTAS_ASIENTO_P4_COSTA |
| 10 | Cierre, **2 pasos** | — | CIERRE_P4 (152 caracteres, 5 líneas a 320), partido por frase | vacía |

## 3 · P5 «Cerrar el periodo» · v4 de Itagaki · 10 pantallas · PASA con condiciones (lote 12)

El reparto de la figura es el de §1. La columna «Pantalla de Miyata» usa la numeración de los textos v1, igual que §4.

Frente a la v3 cambian tres cosas:
- dónde van «Cerrar» con su cita y «Desde ya»;
- la columna de Miyata;
- cómo se leen las fichas ya puestas.

| Itagaki n | Pantalla de Miyata | Tipo | Toque | Consecuencia | Modelo · control | Pasos |
|---|---|---|---|---|---|---|
| 1 | 1 (SEGMENTOS_CIERRE[0]) **+ su n9** | Apertura | — | Las cuentas se reparten solas en dos montones. **Paso 1:** «Cuentas del periodo» entra como rótulo sobre «Se vacían». **Paso 2: «Desde ya»** («Las cuentas de lo que la empresa tiene y debe no se cierran…», 96 caracteres, 3 líneas) **entra como rótulo sobre «No se vacían»**. | Dos zonas de 125 × 98 · vacía | 2 |
| 2 | 2 | Haz | Separa las 5 de Miyata, una por paso («Paso n de 5»). **Las otras 6 ya están puestas** desde la Apertura, como fichas de 20 × 20 en #B8C4D4. | La ficha cae en su zona | La cuenta en curso (44) y las zonas de 125 × 48 a 320 y 152 × 48 a 375, con 5 fichas por fila y 2 filas · 2 botones «Se vacía» / «No se vacía» | 5 |
| 3 | 3 | Haz | Ordena «Ajustes» y «Cierre» | La flecha del diagrama | El diagrama (60) · 2 fichas | 1 |
| 4 | 4, ingresos **+ su n8** | Haz | ‹ cuenta ›: pasa el ingreso | El saldo entra a la T y la cuenta queda en $0. **Paso 2:** «Cerrar» entra como rótulo (Inter 12/700, #F8F9FA) sobre la cuenta del centro del control, que ya muestra $0, y la definición va al apoyo (2 líneas). **Paso 3:** la cita de la p. 123, solo la primera oración (ver abajo). | T compacta (88) · ‹ cuenta ›: tocar el centro pasa la cuenta. Si se vacía una que no: «No va aquí» y la pista. | 3 |
| 5 | 4, gastos (**titular nuevo**) | Haz | ‹ cuenta ›: pasa cada gasto | Cada saldo entra a la T y su cuenta queda en $0 | T compacta · ‹ cuenta › | 1 |
| 6 | 5 | Haz | Escribe el saldo | **El corchete y la cifra quedan tapados hasta que responde**; luego aparece «Utilidad $3.950». **«Ganancias y pérdidas» entra como rótulo sobre la T.** | O4 compacto (86) · campo de r5 | 1 |
| 7 | 6, ingresos | Haz | Las Acacias: pasa el ingreso | Igual que la 4 | T compacta · ‹ › | 1 |
| 8 | 6, gastos (**titular nuevo**) | Haz | Las Acacias: pasa los gastos | Igual que la 5 | T compacta · ‹ › | 1 |
| 9 | 7 | Haz | ¿Utilidad o pérdida? | «Pérdida $100.000»: un corchete de 7,1 px [calculado], por encima de los 4 de E11 | O4 compacto · OPC_P5_6 | 1 |
| 10 | 10 (CIERRE_TEXTO); la pregunta «En una frase» pasa al Repaso Diario | Cierre | — | La T final, con la frase | La T final · vacía | 1 |

**La cita de la p. 123 · decidida (Miyata, opción a).** Va solo la primera oración, en el apoyo de P5-4, paso 3:
> «Cerrar una cuenta significa reducir su saldo a cero.» (p. 123)

Es una oración completa, así que la cita no queda cortada ni lleva «…». La segunda oración, la de enfrentar ingresos con gastos, el estudiante la hace en las pantallas siguientes. P5-4 queda en 3 pasos.

**Citas del libro en P3-7 y P4-8 · tarjeta de cita (Itagaki, lote 12; Takamura la revisa en el lote 14).** Por frase completa, las citas de «Acumulado» no caben en el apoyo (6 y 5 líneas a 320). Por eso, **durante los pasos de cita, la cita va en la figura**:
- Es una tarjeta del mismo alto que la reserva (150 / 200), con fondo #1C2939 y una raya izquierda de 3 px #B8C4D4.
- Relleno de 8. Texto en Inter 14/20, #F8F9FA (13,98:1), con la atribución en la misma línea.
- Ancho útil: 258 − 3 − 16 = 239 px, unos 30 caracteres por línea.
- En esos pasos el apoyo solo dice «Así lo dice el libro». En el último paso de cita, la figura vuelve al modelo.
- Se aplica igual en P4-8, aunque ahí las citas caben en el apoyo, para que las citas del libro estén siempre en el mismo sitio.
- ⛔ **Ippo mide a 320 la tarjeta de la p. 139: 6 líneas, unos 136 px. Si pasa de 150, para y avisa.**

| Pantalla | Paso | Cita literal (de `delLibro` en main) | Car. | Líneas en la tarjeta a 320 |
|---|---|---|---|---|
| P3-7 | 2 | «Son aquellos gastos que ya han sido causados, pero que al cierre del periodo contable todavía no han sido cancelados porque tienen un compromiso de pago futuro» (p. 139). | 171 | 6 (unos 136 px) |
| P3-7 | 3 | «Son aquellos ingresos que ya han sido devengados, pero que al cierre del periodo contable todavía no se ha recibido el pago de los mismos» (p. 141). | 149 | 5 (unos 116 px) |
| P4-8 | 2 | «Los gastos diferidos son activos que, en la medida va pasando el tiempo, se van convirtiendo en gastos» (p. 142). | 114 | 4 |
| P4-8 | 3 | «Los ingresos diferidos son pasivos que, en la medida que va pasando el tiempo, se van convirtiendo en ingresos» (p. 145). | 122 | 5 |

**OPC_PREDICE:** «Ingresos / y gastos» cabe en un botón de 80 a 13/16: cada línea mide unos 54 px de 64 útiles [calculado, Itagaki]. Miyata confirma que quitar «Ninguna» no le quita nada a P1, porque en ninguno de sus seis hechos deja de moverse una línea. Si algún día P1 suma un hecho que no mueva nada, como una compra a crédito, «Ninguna» vuelve con su error (E-PRED-6).

**Titulares retirados (Takamura, lote 12):** «Cerrar es dejar en cero» y «Lo que la empresa tiene y debe sigue». Su contenido se conserva como rótulos dentro de P5-4 y P5-1.

**El nombre de las fichas ya puestas en P5-2.** Una ficha de 20 × 20 no puede ser un control, porque el mínimo es 44. **El control es la zona:**
- Cada zona («Se vacían» y «No se vacían») mide 125 × 48 a 320 y es un botón con la etiqueta «Ver las cuentas de {zona}».
- Al tocarla, la lista de nombres de sus fichas ya puestas aparece en el apoyo, separados por comas, en Inter 14/22 #F8F9FA. Cada ficha de esa zona toma un anillo de 2 px #F8F9FA.
- Alto: la lista más larga (unos 125 caracteres) ocupa 4 líneas, 88 px, con un desborde de 22 [calculado].
- Duración: hasta el siguiente toque. Si el estudiante toca «Se vacía» o «No se vacía», el apoyo vuelve a la consigna.
- Si hay una pista de error a la vista, la pista manda sobre la lista.
- La lista se anuncia con `aria-live="polite"`.

**Lo que Itagaki no pudo verificar:** si el n8 y el n9 de Miyata llevan algo más que «Cerrar» con su cita y «Desde ya». Según los textos v1 de Miyata no llevan nada más: n8 es el titular «Cerrar es dejar en cero» con la cita, y n9 es «Lo que la empresa tiene y debe sigue».

## 4 · Tabla de correspondencia (Ippo monta contra «Texto clave»)

La columna de Miyata es la numeración de sus textos v1. «Repaso» quiere decir que esa pantalla sale de la pieza y pasa al Repaso Diario (S3).

**P1 · 9 pantallas**

| Itagaki n | Pantalla de Miyata | Texto clave | Titular |
|---|---|---|---|
| 1 | 1 (su texto) | TEXTO_PASO_1 | Dos líneas que no siempre se mueven juntas |
| 2 | 1 (su decisión) → su 2 | Hecho «aporte» | Los socios ponen plata: ¿qué línea se mueve? |
| 3 | 3 | Hecho «servicio» | Un servicio cobrado el mismo día |
| 4 | 4 | Hecho «factura» | Una factura que todavía no se cobra |
| 5 | 5 | Hecho «maquina» | Una máquina usada que aún no se paga |
| 6 | 6 | `nombres` 0 a 3 | Cada marca tiene su nombre |
| 7 | 7 | Hecho «inventario» y AVISO_CAMBIO | Compra mercancía y la paga de contado |
| 8 | 8 | Hecho «computador» | Vende un computador a su mismo valor |
| 9 | 9 (Cierre); la pregunta → Repaso | CIERRE | Cuatro cosas distintas: ingreso, cobro, gasto y pago |

**P3 · 8 pantallas**

| Itagaki n | Pantalla de Miyata | Texto clave | Titular |
|---|---|---|---|
| 1 | — (Apertura, textos v2 §1) | SEGMENTOS_P3[0] | Cuando el gasto va adelante de la plata |
| 2 | 1 | SEGMENTOS_P3[1] | Cinco días con una máquina alquilada |
| 3 | 2 | SEGMENTOS_P3[2] | El gasto ya pasó, ¿y la caja? |
| 4 | 3 | SEGMENTOS_P3[3] | Llega el cierre del mes |
| 5 | 4 | SEGMENTOS_P3[4] | El ajuste de San Calixto |
| 6 | 5 | SEGMENTOS_P3[5] y [6] | El mismo hecho, del otro lado |
| 7 | 6 y 7 | SEGMENTOS_P3[7] y la cita de «Acumulado» (4 pasos) | El ajuste de San Miguel; en el paso de las citas, «Esto se llama acumulado» |
| 8 | 8 (Cierre); la pregunta → Repaso | CIERRE_P3 | Un hecho, dos empresas, dos asientos |

**P4 · 10 pantallas**

| Itagaki n | Pantalla de Miyata | Texto clave | Titular |
|---|---|---|---|
| 1 | — (Apertura, textos v2 §1) | SEGMENTOS_P4[0] | Cuando la plata va adelante del gasto |
| 2 | 1 | SEGMENTOS_P4[1] | Pagar tres meses de arriendo por anticipado |
| 3 | 2 | SEGMENTOS_P4[2] | Pagó, pero ¿ya usó el local? |
| 4 | 3 | SEGMENTOS_P4[3] | ¿Qué es lo que pagó por anticipado? |
| 5 | 4 | SEGMENTOS_P4[4] | El cierre de junio |
| 6 | 5 | SEGMENTOS_P4[5] | El asiento de junio |
| 7 | 6 | SEGMENTOS_P4[6] | Lo que queda en el bloque |
| 8 | 7 y 9 | SEGMENTOS_P4[7] y la cita de «Recibido por anticipado» (3 pasos) | Arriendos de la Costa recibió la plata; en el paso de las citas, «Esto se llama diferido» |
| 9 | 8 | SEGMENTOS_P4[8] | El asiento de Arriendos de la Costa |
| 10 | 10 (Cierre); la pregunta → Repaso | CIERRE_P4 (2 pasos) | Un pago, dos empresas, mes a mes |

**P5 · 10 pantallas**

| Itagaki n | Pantalla de Miyata | Texto clave | Titular |
|---|---|---|---|
| 1 | 1 y n9 | SEGMENTOS_CIERRE[0] y «Desde ya» | Las cuentas de San Calixto al final de enero |
| 2 | 2 | Separar | ¿Qué cuentas se vacían al cerrar? |
| 3 | 3 | Ordenar | Primero se ajusta, después se cierra |
| 4 | 4 (ingresos) y n8 | Ingresos, «Cerrar» y la cita de la p. 123 | Los ingresos pasan a Ganancias y pérdidas |
| 5 | 4 (gastos) | Gastos | Ahora pasan los gastos |
| 6 | 5 | Escribe el saldo | Lo que queda en Ganancias y pérdidas |
| 7 | 6 (ingresos) | Las Acacias, ingresos | Otra empresa, otro mes: Las Acacias |
| 8 | 6 (gastos) | Las Acacias, gastos | Las Acacias: ahora pasan sus gastos |
| 9 | 7 | Utilidad o pérdida | Cuando los gastos ganan, queda pérdida |
| 10 | 10 (Cierre); la pregunta → Repaso | CIERRE_TEXTO | Febrero empieza limpio |

**Total: 37 pantallas.**

**Kamogawa armó esta tabla** cruzando la de Itagaki (v4) con la de Miyata (textos v1). Donde las dos no coincidían, manda el contenido:
- **P3-7 y P4-8:** el titular del nombre («Esto se llama…») va en el paso de las citas, dentro de la misma pantalla.
- **P5-9:** usa el titular de la n7 de Miyata, «Cuando los gastos ganan, queda pérdida».

Si el titular cambia de un paso a otro dentro de una pantalla y `SecuenciaAprender` no lo permite, el de la pantalla es el primero y el otro va como rótulo del paso. Ippo lo anota en el PR.

## 5 · Lo que Ippo mide y entrega

- **C6:** la marca de 10 px a 320, antes de nada.
- Las cuatro piezas a 320 y a 375, con el texto real más largo, contadas con la sonda de encaje (#550). Cada paso visible tiene 60 palabras o menos. El desborde es de 40 px o menos, y solo en el apoyo.
- Los 4 botones de OPC_PREDICE (58 × 44) caben a 320 sin cortar palabra.
- La regla de ventana: lo que el estudiante decide cabe junto en la ventana.
- Capturas a media escala para Takamura:
  - una pantalla por tipo (Apertura, Haz, Míralo y Cierre) de cada pieza;
  - P3-7 en el paso de cita;
  - P5-2 con la lista de nombres abierta;
  - P5-4 en el paso de «Cerrar».
- **Una pantalla de Pensamiento Estratégico**, porque `SecuenciaAprender` es compartido. Este encargo no lo modifica: si hace falta algo del componente, se le pide a Erwin (#534).
- **El Repaso Diario:** las 4 preguntas «En una frase», con sus opciones y devoluciones literales, como ítems del subtema que les corresponde (#481). Ningún ítem que ya exista cambia de id.
