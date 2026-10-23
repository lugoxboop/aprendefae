DISEÑO: P2 t1-la-ecuacion-en-movimiento — las dos torres — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 23-oct-2026 · Para Kaede. La peor de las 7 (ver `../auditoria-T1-hacer.md`).

**Prototipo:** `proto-t1-5-torres.html`, con los hechos 1, 2, 4 y 6.

**Origen de las cifras:**
- **[fuente]:** medido por mí en la réplica de main (zip de Sakuta) o en el prototipo, con Chromium 141.0.7390.37 headless, Inter y Sora de @fontsource 5.3.0, a 320×900 y 375×900.
- **[calculado]:** lleva su fórmula.

## 0 · Alcance y paradas

- **Sin paradas. Solo se agrega; nada se borra:**
  - el id `t1-la-ecuacion-en-movimiento` no cambia;
  - los 8 hechos y sus asientos no cambian;
  - las devoluciones de `ERROR_T1_5` se usan tal cual, sin el emoji inicial al pintarlas.
- **Lo que se reemplaza en la vista:** los tres `CampoCifra`, el pie que comprueba mientras se escribe, el reintento y el modo corto.
- **El puntaje:** guarda las dos decisiones por hecho con `intentos: 1`. **Los registros de los estudiantes ya guardados no se tocan.**
- **⛔ Compartido, va a Erwin:** `Retro`, que pone emoji y teal en el acierto. Esta pieza deja de usarlo para el veredicto y pinta su propia marca (§4).
- **ME FALTA de Futaba:**
  - el texto del acierto por hecho; el prototipo dice «[acierto de main para este hecho]». Si no llega, va el acierto final de main (`ACIERTO_T1_5_FINAL`, sin emoji) solo en el hecho 8, y en los otros solo «Correcto»;
  - la nueva consigna (§7).

## 1 · La idea y Norman

**El estudiante VE dos torres —«Lo que tiene» contra «Lo que debe» más «Lo que es de los dueños»— subir y bajar por el monto del hecho cuando dice qué parte se queda quieta y hacia dónde van las otras dos, y eso explica que la ecuación siempre cuadra porque cada hecho mueve dos partes por el mismo valor.**

- **Primer impacto:** dos torres de la misma altura, con un «=» en medio.
- **Cómo se usa:**
  - decisión 1: tocar la parte que **no** se mueve;
  - decisión 2: en cada una de las otras dos, «+ $monto» o «− $monto»;
  - «Anotar».
- **Lo que se lleva:** tras los 8 hechos, las torres llegan a $465.000 = $115.000 + $350.000.

**Por qué no repite a T1-4:**
- T1-4 pregunta la dirección de un hecho suelto, con tres barras.
- Aquí la decisión 2 lleva **el monto**, y las torres **acumulan el recorrido** de cero a $465.000.
- Es otro modelo (D9) con dos clases de decisión (D4).

**Referencias:** el cuadro de la ecuación del libro (Activo = Pasivo + Patrimonio, hecho por hecho), y Bret Victor: la cifra se ve donde va.

**Tres segundos:** dos torres iguales y un hecho.

**Captura:** las torres con sus totales lo dicen sin texto.

**R10:**
- antes de «Anotar», las torres muestran el estado anterior. Las elecciones solo marcan los botones;
- la comparación de las dos torres aparece después;
- antes, el pie de main decía «Hay $X de diferencia» mientras se escribía, y eso era la respuesta.

## 2 · Estructura (arriba → abajo)

1. **Objetivo** (el de main): «Lleva las cuentas de la empresa desde cero hasta el final del mes, hecho por hecho.»
2. **Fila de 44:** «Hecho n de 8» a la izquierda y «¿Cómo se juega?» a la derecha (encabezado compacto de B). Los pasos y la consigna van plegados ahí.
3. **El hecho**, en su tarjeta (Inter 14/600).
4. **Las torres**, en un contenedor hundido de 244 de alto [fuente]:
   - a la izquierda, «Lo que tiene»: relleno rgba(184,196,212,.30) y contorno de 2 px #F8F9FA;
   - en medio, «=» (Sora 16/700, #A8B6C8);
   - a la derecha, una torre de dos tramos: abajo «Lo que debe» (rayado a 135°), arriba «Lo que es de los dueños» (rgba(184,196,212,.14));
   - **sobre cada torre, su total** en monospace con tabular-nums (Inter 12/600): «$325.000»;
   - **la escala es fija para los 8 hechos [calculado]:** alto = valor · 150 / 475.000 px, donde $475.000 es el total más alto del recorrido (tras el hecho 7);
   - **una leyenda debajo,** cada parte con su muestra: «Lo que tiene», «Lo que debe» y «Lo que es de los dueños». Distingue los tramos por forma (relleno, rayado o tenue) y por palabra, no por color.
5. **La pregunta:** «¿Cuál de las tres NO se mueve con este hecho?». Tras la decisión 1, cambia a «¿Las otras dos suben o bajan?». Reserva 39,2 de alto para que nada salte.
6. **Las partes**, en dos columnas alineadas con sus torres: «Lo que tiene» a la izquierda; «Lo que debe» y «Lo que es de los dueños» a la derecha.
   - Cada parte es un botón de 44 de alto como mínimo, con el nombre (Inter 12/600) y debajo, en secundario, «Activo · $325.000».
   - En las dos que se mueven aparece, tras la decisión 1, un grupo de dos botones de 44: «+ $25.000» y «− $25.000», con la cifra en monospace.
7. **«Anotar»:** el botón de avance teal #2A9D8F con texto #06202A, desactivado hasta tener las dos decisiones. Tras anotar pasa a «Siguiente».
8. **La devolución**, debajo.

## 3 · Paso a paso

| Momento | Qué se ve |
|---|---|
| inicio del hecho | las torres con los totales del hecho anterior; las tres partes en reposo |
| decisión 1 | la parte tocada queda marcada. Se marca al instante con E4: la correcta, ✓ «Correcto: se queda igual»; si erró, ✕ «No va aquí» en la tocada y ✓ «Iba aquí: se queda igual» en la correcta. **La decisión 2 sigue siempre sobre las dos que de verdad se mueven** (el registro) |
| decisión 2 | se marcan «+» o «−» en las dos. Las torres **no** se mueven todavía (R10) |
| «Anotar» | las torres van a los totales correctos. Si lo elegido daba otra altura, queda **el fantasma: el contorno discontinuo coral de la torre que habría salido**, solo en la torre que difiere. Cada grupo marca ✓ «Correcto» o ✕ «No va aquí» con ✓ «Iba aquí: + $25.000». Debajo, la devolución |
| devolución | si erró la decisión 1, `ERROR_T1_5.C`. Si erró la 2 y los lados no dan igual, `ERROR_T1_5.A` ({Z} = la diferencia [calculado]). Si dan igual pero con otras cifras, `ERROR_T1_5.B`. Si acertó todo, el acierto de Futaba |
| «Siguiente» | el hecho siguiente parte de los totales correctos |

**Totales del recorrido (lo que deben mostrar las torres) [calculado de los asientos de `CALEJA` y `TRANSACCIONES_CAP2`]:**

| Tras el hecho | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Lo que tiene | 300.000 | 325.000 | 375.000 | 365.000 | 465.000 | 415.000 | 475.000 | 465.000 |
| Lo que debe | 0 | 25.000 | 75.000 | 65.000 | 65.000 | 65.000 | 125.000 | 115.000 |
| Lo que es de los dueños | 300.000 | 300.000 | 300.000 | 300.000 | 400.000 | 350.000 | 350.000 | 350.000 |

## 4 · Estados

| Estado | Qué se ve |
|---|---|
| vacío (hecho 1) | las torres en cero: solo la base de 2 px #B8C4D4 y «$0» |
| foco | anillo de 2 px #F8F9FA, separado 2 px |
| elegido antes de anotar | 2 px #F8F9FA y relleno navy #1D3557, con `aria-pressed` |
| acierto | ✓ «Correcto» (Check lucide, 16 px, trazo 2,5). Las torres suben o bajan juntas |
| error | ✕ «No va aquí» en coral #E76F51 con borde coral en lo elegido; ✓ «Iba aquí: {valor}» en lo correcto. El fantasma coral discontinuo. **Un intento: no hay reintento** |
| deshabilitado | «Anotar» sin las dos decisiones: transparente, borde rgba(248,249,250,.16) y texto #A8B6C8 |
| último hecho | tras el 8: $465.000 = $465.000 y el cierre de main (`ACIERTO_T1_5_FINAL`, sin emoji) |
| ejemplo de «Así se juega» | el mismo flujo, sin registro, como hoy |

## 5 · Medidas [fuente]

| | 320 | 375 |
|---|---|---|
| Hoy en main (réplica): primer control y palabras antes | 356,1 · 57 | 317,8 · 57 |
| Prototipo: la figura (las torres), desde la cima del Panel | **190,1** | **171,3** |
| Palabras antes de la figura | **31** (objetivo, fila del contador y hecho 2) | 31 |
| Contenedor de las torres | 244 | 244 |
| Panel tras anotar: error A · error C · acierto | 948,3 · 909,3 · 852,8 | 896 · 870 · 833 |
| Desplazamiento horizontal | ninguno | ninguno |

- **B1 pasa:** la figura está a menos de 280 px, con menos de 40 palabras antes.
- **Con las decisiones, nada salta:** la pregunta reserva su alto, y las partes quedan en el mismo sitio antes y después [fuente: 557,3 → 557,3].
- **Lo honesto:** $10.000 mueve 3,2 px de torre [calculado: 10 · 150 / 475]. En los hechos chicos, el cambio lo dice el total de arriba más que la altura.

## 6 · Movimiento

- **Las torres:** `transform: scaleY` en cada tramo, 320 ms, con la curva cubic-bezier(.3,.9,.4,1). El prototipo anima `height`; Kaede lo pasa a `scaleY`.
- **El fantasma:** entra con opacidad en 240 ms.
- Nada en bucle.
- **Con movimiento reducido,** todo al instante.

## 7 · Textos

- **Nuevos, para Shoko:**
  - «¿Cuál de las tres NO se mueve con este hecho?»;
  - «¿Las otras dos suben o bajan?»;
  - «Correcto: se queda igual» y «Iba aquí: se queda igual»;
  - «Anotar»;
  - la consigna: «Lee el hecho. Di cuál no se mueve y hacia dónde van las otras dos.» (reemplaza a «Escribe los tres totales nuevos.»).
- **El objetivo** sigue igual. **ME FALTA:** que Futaba confirme la consigna.
- **Publicados y reusados:** los 8 hechos, los nombres de las partes y su término, y `ERROR_T1_5` A, B y C sin el emoji.
- **El texto alternativo de las torres** cambia con cada hecho: «Lo que tiene, $325.000; lo que debe, $25.000, más lo que es de los dueños, $300.000: dan $325.000.»

## 8 · Accesibilidad

- **Las torres** llevan `role="img"` con el texto alternativo de §7.
- **Las partes y los «+» / «−»** son botones con `aria-pressed`; cada grupo tiene `aria-label` con el nombre de la parte.
- **La devolución** va en `aria-live="polite"`.
- **Nada depende del color:** ✓ y ✕, el fantasma discontinuo y los tramos distintos por forma.

## 9 · Íconos

Check y X de lucide, a 16 px y trazo 2,5. Sin emoji.

## 10 · Evaluación

- **Nivel provisional: Avanzado.** Hay dos clases de decisión, el modelo se mueve con cada una, es propio de esta actividad y acumula el recorrido.
- **Sin prueba con otra persona.**

## 11 · Kaede

| # | Qué | Mi réplica | Si no coincide |
|---|---|---|---|
| 1 | Sin `CampoCifra`, sin el pie que compara mientras se escribe, sin reintento ni modo corto | proto | Indispensable |
| 2 | La escala fija, con $475.000 = 150 px, y los totales de la tabla de §3 | §3 | Indispensable |
| 3 | Las torres no se mueven antes de «Anotar» | proto | Indispensable (R10) |
| 4 | El fantasma solo en la torre que difiere | proto | — |
| 5 | Veredicto propio con Check y X; `Retro` queda para Erwin | §4 | — |
| 6 | Puntaje: dos decisiones por hecho, `intentos: 1`; los registros viejos no se tocan | — | Indispensable |

**Archivos:** `proto-t1-5-torres.html`, `t15_src.html` y `t15_estados_320.png` (error A, error C y acierto, a 320).
