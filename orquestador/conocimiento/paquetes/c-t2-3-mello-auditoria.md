# Auditoría T2-3 · dos PRs de Misa, la forma de Watari y los bancos de Near

Mello → L · 24 de octubre de 2026. Fuentes:
- PRs #482 y #494, solo sus archivos.
- La forma de Watari (artefacto SFX4…, igual a `c-t2-1-watari-tres-hacer.html`).
- Los bancos de Near: `lote-t2-2.md` §1 y el delta `c-t2-3-near-delta.md`.
- Los datos de `contabilidad.js` y `contabilidadActividades.js`.
- Los criterios H1–H10 y el Kit, con la regla «Avanzado verificable».

Todas las cifras de los bancos se comprobaron contra los asientos del repo. Todos los textos de 10 o más palabras se midieron con `node scripts/inflesz.mjs`: los de Near y los que propongo aquí.

## 0 · PRs de Misa

- **#482 · PASA.** `LISTA_CERRADA_T2` trae los 12 subtemas de Near, letra por letra. `SUBTEMA_FIJO` y `SUBTEMA_REGLA` cubren las tres Hacer nuevas y las etapas del desafío; `cu-de-que-familia` queda en reales, como en el catálogo. Los nombres que no están en la lista lanzan error, y la prueba da 9 de 9 en verde.
- **#494 · PASA.** La línea base mide contraste, letra de menos de 12 px, toques de menos de 44 px y ficha en las 16 pantallas, a 320 y a 375 px. No hay desplazamiento lateral, los huecos están declarados y el script no toca `src/`.

## 1 · La forma de Watari para las tres Hacer

Resumen:

| Hacer | Forma actual, con banco perfecto | Dimensión que limita | Con el ajuste propuesto |
|---|---|---|---|
| Cuadra por valor | **Medio** | H5/C4-1 y D5: la columna que crece al teclear delata la cifra | Avanzado verificable |
| Del diario al mayor | **Medio** | D1 y H4 (regla 9): se resuelve emparejando nombres | Avanzado verificable |
| Las que vuelven a cero | **Avanzado verificable** | Ninguna verificable; quedan las pruebas con personas | — |

### 1.1 · Cuadra por valor

**Nivel con banco perfecto: Medio. Limita H5 (C4-1), y con ella D5.**

- **La columna que crece al teclear delata la cifra.** En completar, la columna del haber crece con cada número, antes de «Comprobar», al lado de la columna del debe y de la línea de nivel. Basta teclear hasta que las dos alturas empaten. Así el intento único deja de serlo y la figura hace el cálculo que se califica (E8).
  - Es el mismo caso de la balanza de T7-3 H5, que se aprobó porque «no se nivela al teclear».
  - La prueba C5 no lo ve: mira clases, no alturas (v4 §3).
- **La fila de sumas delata el juicio.** `AsientoEnLineas` con totales pone a la vista las dos sumas. En juzgar, eso responde la pregunta antes de decidir.

**Ajuste propuesto (reversible, sin componente nuevo):**
1. En completar, «Tu cifra» se ve solo en su casilla. Las columnas se mueven al «Comprobar»: primero la consecuencia y el veredicto a los 380 ms.
   - Se agrega una prueba C5 de geometría: con una cifra escrita y sin comprobar, el tramo del hueco mide lo mismo con cualquier cifra.
   - El campo de cifra sigue justificado por H7, porque arma un renglón del asiento.
2. En juzgar y en encontrar, la fila de sumas y las columnas salen después de la decisión (la regla E8 que Near ya puso pasa a la forma). En completar, la suma del lado del hueco dice «?» hasta «Comprobar».

**Lo que el banco debe traer para que lo apruebe sin otra vuelta:**
- **Juzgar con respuestas mezcladas:** al menos un «Cuadra». Con dos juzgar binarios que dicen lo mismo, contestar siempre «No cuadra» acierta todo, y en el segundo intento se nota (D5 y D8). Si hace falta, la mezcla pasa de 3-2-3 a 2-3-3; sigue dentro del tope de 8 de Watari.
- **Encontrar con 3 renglones o más y uno solo malo,** que se encuentre por el valor. No vale comparar a ojo una cifra con el hecho, ni ver un nombre repetido (regla 9).
- Cada distractor de completar debe ser un error con nombre y con su retro; los de Near ya lo son.

### 1.2 · Del diario al mayor

**Nivel con banco perfecto: Medio. Limitan D1 y H4 (regla 9).**

- **En destino, la respuesta es el nombre que ya se ve.** El renglón marcado dice «Bancos» y el botón correcto es la T que dice «Bancos». En origen pasa lo mismo: se empareja cuenta y fecha.
- **Las confusiones no aparecen.** Las que los retros nombran (agrupar por fecha, ir por la cifra igual) son reales, pero el estudiante casi nunca llega a cometerlas, porque el nombre lo guía. D1 Avanzado pide casos que expongan una confusión real.
- **El banco no lo puede arreglar.**
- **Esto baja el techo: la decisión de L, sumada a una de Watari.** Watari quitó el lado y L dejó el saldo para «El saldo de la cuenta». Con las dos cosas fuera, la única decisión que queda es emparejar nombres.
  - No propongo deshacer ninguna de las dos.

**Ajuste propuesto: un tercer tipo de ítem, «revisar».**
- **Qué ve el estudiante.** El mayor llega ya pasado, con una línea mal pasada. Consigna: «El mayor ya está pasado. Toca la línea que no coincide con el diario.» (14 palabras · 93,0)
- **Qué decide.** Para encontrarla tiene que cotejar los dos libros. Es el punteo, que es lo que de verdad hace quien lleva un mayor.
- **Cómo se pinta.** Usa el mismo objeto y el comportamiento del caso «al revés» de Watari: la línea tocada enciende su renglón del diario y muestra lo que no coincide.
- **Lo que se le pide a Watari.** Que las líneas de la T compacta sean botones de 44 px. Hay que medir a 320 px la cuadrícula de 2 × 2.
- **Partida:** 3 destino, 2 origen y 2 revisar, 7 en total (el tope de Watari).
- **Respeta las dos decisiones:** no hay saldo y no se elige el lado.

**Lo que el banco debe traer:**
- Cada renglón del caso entra en un solo ítem. Si no, origen se resuelve con lo que se acaba de hacer en destino (C1; ver §2.2).
- La cuadrícula de 2 × 2 de las T se baraja en cada intento (H6).
- Si L aprueba «revisar», 2 ítems por partida, de dos de estos tres tipos de error:
  - en la cuenta vecina del mismo asiento (agrupar por fecha);
  - con cifra traspuesta;
  - del lado contrario.

  Cada uno lleva `{ línea mal pasada, porqué, retro por cada línea buena tocada }`.

### 1.3 · Las que vuelven a cero

**Nivel con banco perfecto: Avanzado verificable. Nada verificable lo limita.** Lo que queda es lo de siempre con personas: D2, D3, D5, D7, D8 y D9.

- **La decisión binaria de L no baja el techo.**
  - Precedente: T7-1 H5 «¿Costo o gasto?» es binaria y está terminada en la v4.
  - D4 Avanzado pide que decisiones distintas den resultados visibles distintos: aquí la cuenta cae en Ganancias y pérdidas o cruza con su saldo.
  - Adivinar no rinde. Con 8 cuentas, 4 y 4, la probabilidad de acertar 7 u 8 al azar es 9/256, cerca del 3,5 %.
- **La familia en el retro, como pidió L,** da los mensajes distintos que pide D6 Avanzado.
- **El cierre anual (decisión de L) tampoco baja el techo.** Pero la maqueta tiene escrito «Pasa a abril con su saldo» y «= Utilidad del mes». El periodo debe salir de los datos (`mes` y `mesSiguiente`) y no del componente (H2): «Pasa al año siguiente con su saldo» y «= Utilidad del año».

**Lo que el banco debe traer:**
- El balance de 4 y 4 entre nominales y reales.
- Al menos una trampa por lado.
- La familia en cada retro.
- La utilidad cuadrada con los saldos.

El banco de Near ya lo trae (§2.3).

## 2 · Los bancos de Near

| Hacer | Veredicto |
|---|---|
| Cuadra por valor | **FALLA** (juzgar, encontrar y dos textos) |
| Del diario al mayor | **FALLA** (C1 entre ítems y H6) |
| Las que vuelven a cero | **PASA** (con el delta de VC·6) |

### 2.1 · Cuadra por valor · FALLA

**Lo que está bien:**
- Las cifras de K1, K2, K3, J1 y J2 cuadran con el repo.
- Los distractores de completar son errores con nombre.
- E8 está en juzgar y en encontrar.
- El cambio de E1 por C1 con P4·8, del delta, es correcto.

**Corrección mínima:**

1. **Juzgar, por la respuesta constante (H3, D5).** J1 y J2 dicen «No cuadra». K3, la trampa de 3 contra 1 que sí cuadra, pasa a juzgar como **J3**, con el asiento completo: Bancos 5.000 + Caja 1.000 + Equipo de computación 2.000 / Acciones 8.000. Respuesta: «Cuadra».
   - Retro de «No cuadra»: «Tres cuentas contra una parece dispar. Pero el debe suma $8.000 y el haber también.» (15 · 83,0)
   - La partida queda en 2 completar (K1 y K2), 3 juzgar y 3 encontrar.
   - La trampa de Watari queda mejor aquí: en juzgar es donde engaña.
2. **Encontrar, porque los tres se resuelven sin razonar por el valor (H4).**
   - E1 del delta tiene 2 renglones: es una moneda al aire.
   - E3 tiene 2 renglones, y basta ver que 520 no es el 250 del hecho.
   - E2 se resuelve viendo «Local comercial» dos veces, y acepta 2 de sus 3 renglones.

   Cambios, todos «Basado en el libro», con 3 renglones y uno solo malo:

   | # | hecho | se muestra | línea | por qué es única |
   |---|---|---|---|---|
   | E1 · lado contrario | «Caleja abona $10.000 a la deuda del computador. Paga $6.000 en efectivo y $4.000 con un cheque.» (17 · 66,4) · Base cal-4; Bancos es construido | Cuentas por pagar 10.000 D · **Caja 6.000 D** · Bancos 4.000 H | Caja | El debe se pasa en $12.000, el doble de $6.000. Ningún otro cambio de lado lo explica. |
   | E2 · renglón de más | El texto de Near para cal-5, sin cambios | Local comercial 100.000 D · **Caja 100.000 D** · Aportes sociales 100.000 H | Caja | El debe se pasa en un renglón entero. El aporte es el local, así que el que sobra es Caja. Se quita la cuenta repetida, que se hallaba por el nombre. |
   | E3 · traspuesto | «Con un cheque de $650 abona $400 a la hipoteca y el resto a la deuda de la computadora.» (19 · 73,1) · Base ene-18 + ene-30 | **Cuentas por pagar 520 D** · Hipoteca por pagar 400 D · Bancos 650 H | Cuentas por pagar | Hipoteca y Bancos coinciden con el hecho. A la deuda le toca 650 − 400 = 250, y hay que restar para verlo. La diferencia, 270, se divide por 9. |

   - Porqué sugerido para E1: «Caja pagó, así que baja y va al haber. En el debe sobran $12.000, el doble de $6.000.» (18 · 94,0)
   - Porqué sugerido para E2: «Caja no entra: el aporte fue el local y no trajo efectivo. Por eso el debe se pasa en un renglón entero.» (22 · 91,1)
   - Porqué sugerido para E3: «La deuda de la computadora recibe lo que queda del cheque: $250. Aquí dice $520, y la diferencia de $270 se divide por 9.» (24 · 67,6)
   - Los retros por línea mala los escribe Near, con la misma regla de nombrar la confusión.
   - Revisé el cruce con C1: E1 no dice el $25.000 de J2, E2 no toca la Caja de J1 y E3 no usa ene-12, que es de K2.
3. **INFLESZ (H8).** Dos enunciados de Near están bajo 65. Son paráfrasis, no citas textuales, así que no quedan exentos:
   - J1, 59,9 → «Entra un socio nuevo. Aporta un vehículo de $2.000.000 y $1.000.000 en efectivo.» (13 · 66,2)
   - J2, 54,6 → «Caleja compra un computador de $25.000 a crédito. También compra maquinaria de $50.000 con un préstamo del banco.» (18 · 66,3)

   El tercero que daba menos de 65 era el de ene-04, y ya salió con el delta.

### 2.2 · Del diario al mayor · FALLA

**Lo que está bien:**
- Los casos A y B cuadran con Lavado: $9.800 y $4.500.
- Las 4 cuentas y los 5 renglones caben en el tope de Watari.
- Las plantillas de retro A, B, C y oA a oD están bien asignadas en los 14 ítems.
- Todo pasa INFLESZ.
- D8 se cumple con la alternancia de casos más el barajado de origen.

**Corrección mínima:**
1. **C1 entre ítems.** Cada origen es el inverso de un destino de la misma partida:
   - Caso A: el ítem 6 invierte el 4 y el 7 invierte el 1.
   - Caso B: el 6 invierte el 5 y el 7 invierte el 4.

   Origen se contesta recordando lo que se acaba de tocar. Arreglo: se quitan los destino A1, A4, B4 y B5. Queda cada renglón en un solo ítem, 3 destino y 2 origen por caso, sin reescribir nada.
   - Las trampas se conservan. En A, Bancos sale en los dos lados (oA en los dos origen). En B, Cuentas por pagar sale dos veces: destino r2 y origen r5, con oA.
   - Para que origen se pueda jugar, el mayor debe llegar con esos 2 renglones ya pasados.
2. **H6.** La cuadrícula de 2 × 2 de las T se baraja en cada intento. Hoy las opciones de destino quedan siempre en el mismo sitio.
3. **Si L aprueba «revisar» (§1.2),** se agregan 2 ítems por caso y la partida vuelve a 7.

### 2.3 · Las que vuelven a cero · PASA

Revisé esto:
- **H1:** el objetivo da 84,0.
- **H2:** lleva «Escenario simulado» en la ceja.
- **Balance:** 4 nominales y 4 reales, con 2 ingresos, 1 gasto, 1 costo y un pasivo, como pide Watari.
- **Utilidad:** 12.000 + 8.000 − 5.000 − 4.500 = 10.500, y la figura no la califica (E8).
- **Trampas:** Cuentas por cobrar, Documentos por pagar, Seguros pagados por anticipado, Caja contra el cobro y el gasto con muchos movimientos.
- **Retros:** la familia va nombrada en cada uno, como pidió L.
- **Decisiones de L:** el cierre es anual, y el nombre de VC·6 ya está cambiado en el delta, con un porqué y un retro que ya no dependen del nombre (86,6 y 90,5).
- **INFLESZ:** todo da 65 o más.

Para Misa, que no es del banco: el periodo de las opciones y de la caja de utilidad sale de `mes` y `mesSiguiente` (§1.3).

## 3 · Lo que no hice

- No vi las piezas construidas: todo sale de la maqueta y del banco. La prueba de C5 con geometría y la medida de «revisar» a 320 px quedan para cuando Misa las construya.
- La migración del catálogo es de Erwin, como dijo L.
