# Auditoría · Patrón de enganche C3 (Watari, 16-oct) · T7-1 A2, A5 y A6

Mello → L · 16 de octubre de 2026 · artefacto versión 1792209310-20f2 · main 8df280c

| Pieza | Diseño y código |
| --- | --- |
| A2 «La factura completa» | **PASA CON CORRECCIONES.** La factura delata la respuesta de la base antes de preguntarla, y una ficha que no se califica lleva el borde de acierto. |
| A5 «Importados y fletes» | **PASA CON CORRECCIONES.** En el lado a lado, el rótulo del selector repite la respuesta (regla 9). |
| A6 «Devoluciones en periódico» | **PASA CON CORRECCIONES.** La barra del IVA ya viene cortada antes de preguntar cuánto IVA se devuelve. El arreglo de C1 que trae Watari se acepta. |
| Motor `t7/aprenderC3.jsx` | **PASA.** La escalera C2 está bien. Ningún componente compartido cambia. |

El texto queda para Near, como pediste. Lo suyo va aparte en el §5: el B2 de cuatro pantallas, el largo de las opciones y la portada de A2. **Ninguna pieza se fusiona sin el §5 cerrado.**

---

## 1. Cómo lo verifiqué

- **El código.** El que se ejecuta es idéntico al publicado para Misa en el motor, A2, A5 y A6; solo cambian los espacios.
- **El juego.** Jugué las tres piezas en Chromium a 320 px, de la portada al resumen, con la respuesta correcta en cada paso, y llegué al final sin bloqueos. En cada pantalla conté las palabras visibles: texto, opciones y mensaje.
- **Las cifras, contra el libro.**
  - **A2:** 5.000.000, 800.000, 175.000, 5.625.000, 320.000, 70.000 y 2.250.000. Las encontré en el OCR de las pp. 210-215.
  - **A5:** el flete de La Popa lo leí en la imagen de la p. 229: Gasto fletes en ventas 650.000, Retefuente por pagar 6.500 y Caja/Bancos 643.500. El asiento de la pieza es igual.
  - **A6:** 15.200.000 × 16 % = 2.432.000 y × 3,5 % = 532.000, total 17.100.000. Para lo devuelto: 384.000, 84.000 y 2.700.000. Las encontré en el OCR de las pp. 230-233.
  - Todas cuadran.
- **INFLESZ con el medidor oficial.**
  - Lo calibré otra vez con las seis frases de control: 80,2 · 73,2 · 66,4 · 78,7 · 89,7 · 94,9.
  - Medí 143 cadenas de la pieza. Ninguna de 10 palabras o más baja de 65.
  - Las de 55,5 y 59,4 que cita Watari tienen menos de 10 palabras, así que no aplican.

---

## 2. Nivel del Kit (texto literal, 9 dimensiones; el nivel es el mínimo)

| Dimensión | A2 | A5 | A6 | Evidencia |
| --- | --- | --- | --- | --- |
| D1 Fidelidad y profundidad | Avanzado | Avanzado | Avanzado | Cada pieza tiene dos casos que exponen una confusión con nombre: compra y venta, comprador y vendedor, los dos libros. Ninguna nombra una excepción de experto. |
| D2 Valor pedagógico | **HUECO** | Básico | Básico | Básico pide el objetivo «en una sola oración»; la portada de A2 tiene dos. Para Medio hay que probarla con un estudiante, y no se ha probado. |
| D3 Claridad y auto-rescate | Medio | Medio | Medio | En el segundo error, la devolución explica el porqué sin salir de la pieza. Avanzado pide una prueba con alguien que nunca la vio. |
| D4 Interacción | Avanzado | Avanzado | Avanzado | Los selectores que no califican (compra o venta, quién asume, «Restar directo» o «Cuenta aparte», la fecha) muestran cosas distintas. Élite no: los lados Debe y Haber son un patrón ya visto. |
| D5 Marca | Medio | Medio | Medio | Paleta y roles bien, salvo la corrección A2-2. El camión es de lucide, la familia de íconos del kit. Avanzado no está probado. |
| D6 Feedback | Élite | Élite | Élite | Las devoluciones nombran la confusión: «Ese valor ya incluye el IVA», «Ese es el flete que asume el vendedor», «Ese es el IVA de toda la compra». |
| D7 Móvil | Básico | Básico | Básico | A 320 px: 0 desbordes y 0 objetivos de menos de 44 px (lo midió Watari; recorrí las pantallas y no vi lo contrario). Medio pide un dispositivo real. |
| D8 Rejugabilidad | Básico | Básico | Básico | Las opciones salen en orden fijo, así que repetirla no cambia nada. |
| D9 Gancho visual | Medio | Medio | Medio | Cada pieza tiene un elemento único: la retención que cae a la Dirección de Impuestos, la etiqueta con el camión, la tajada pelada y los fantasmas. El cruce de fichas se repite en las tres, pero no cuenta para esto. Avanzado no está probado. |
| **Nivel** | **HUECO (D2)** | **Básico** | **Básico** | |

- **Prueba de los FP.** Sin puntos, las tres siguen enseñando, así que nada queda limitado por esa prueba.
- **Mecánica repetida.** Tocar Debe o Haber línea por línea ya pasó su cuarto uso. Acepto la justificación, que va escrita en la ficha: el renglón cae y, en A6, aparece el fantasma de la línea original.
- **Prerrequisitos del §2.**
  - Las cifras son fieles al libro.
  - Las tres corren de principio a fin.
  - Marca: sin clichés de gamificación.

---

## 3. Correcciones de diseño y código (Watari o Misa, obligatorias)

**A2-1 · C1: la factura responde la pregunta de la base antes de hacerla.**
- Lo vi a 320 px. En la pantalla 3 («¿Sobre qué valor se calcula la retención?»), el rótulo de la factura dice: «IVA 16 % y retención 3,5 %, **sobre la mercancía sin el IVA**».
- Además, en la pantalla 2, «Descontar la retención» ya escribe $175.000 y «Queda debiendo $5.625.000».
- **Corrección** en `factura()`, con `const conBase = ctx.s.resuelto['base-de-la-retencion'];`:
  - Rótulo:
    ```js
    `IVA 16 % y retención 3,5 %${conBase ? ', sobre la mercancía sin el IVA' : ''}. Tarifas del libro, no las de hoy.`
    ```
  - Retención, «Queda debiendo» y la caja de la Dirección de Impuestos: `$?` mientras `!conBase`. Las cifras llegan con el acierto de la pantalla 3, que ya las anima.
  - El botón y la caída a la Dirección de Impuestos de la pantalla 2 no cambian.

**A2-2 · Ficha que no se califica con el borde de acierto.**
- `.a2-tile` lleva `border: 2px solid var(--texto)`. Según el estándar, 2 px blanco es elegido, correcto o revelado, y estas fichas no son ninguna de las tres.
- **Corrección:** `border: var(--reposo)`, igual que `.c3-tile`. Mejor aún: que A2 use `C3.cruce` y `.c3-tile` como A5 y A6.

**A5-1 · Regla 9: el selector repite la respuesta.**
- Sobre el selector dice «Quién asume el flete», con los botones «El comprador» y «El vendedor». La opción correcta es «Quién lo asume: el comprador o el vendedor.». Se responde emparejando palabras.
- **Corrección:**
  - Se quita el rótulo `.c3-rotulo` de arriba; el `aria-label` del grupo pasa a «Empresa».
  - Los botones pasan a «Santa Martha» y «La Popa».
  - Así el estudiante tiene que unir quién es quién con quién asumió el flete; la ficha ya dice «La Popa · pagado ese día».

**A6-1 · E8: la barra del IVA viene cortada antes de la pregunta.**
- Lo vi a 320 px. En «¿Cuánto IVA se devuelve?», la barra del IVA ya muestra el corte en la misma proporción que la mercancía, y el corchete de $384.000 cae justo debajo.
- **Corrección:** antes del acierto, la barra del IVA va entera:
  ```js
  res ? `<i class="queda" style="width:${100 - pct}%"></i><i class="dev marcada" style="width:${pct}%"></i>` : '<i class="queda" style="width:100%;border-radius:4px"></i>'
  ```
  El corte aparece con el acierto, y ese pasa a ser el «mira esto» de la pantalla.

**M-1 · B2 desde el motor (ayuda a Near en el §5).**
- La consigna de las pantallas con `antes(s)` se ve solo hasta que aparece la pregunta. Son «Cambia entre la compra y la venta y mira los dos impuestos.», «Cambia quién asume el flete y mira a dónde va.», «Cambia de fecha y mira cada línea.» y «Compara las dos formas de anotarla.».
- La pieza separa `consigna` de `texto`, y el motor pinta la consigna mientras `!P.antes(s)`.
- Con eso, el lado a lado de A5 baja a 56 palabras y el de A6 a 59. Lo demás va a Near.

**Lo que acepto como está:**
- **El arreglo de C1 en A6** («El libro da la razón…» pasa al «¿Por qué?»). La razón ya no sale antes de la pregunta; el estado de resultados en miniatura no califica, y la pregunta aparece solo después de ver «Cuenta aparte».
- **Las cifras del caso en ese estado de resultados**, aunque el caso todavía no se ha contado: son del mismo caso y la pregunta no depende de ellas.
- **Que la ficha de A2 cruce de lado y cambie de nombre** («Retención en la fuente por pagar» → «Anticipo fiscal»). El nombre cambia a la vista, así que no da a entender que es la misma cuenta.

---

## 4. Condiciones de fusión (fusiona sin volver a pasar si…)

1. **A2-1, A2-2, A5-1, A6-1 y M-1 aplicados tal cual**, y Misa reproduce cada uno en la pieza construida:
   - en la pantalla 3 de A2, el rótulo no dice «sin el IVA» y la retención está en `$?`;
   - en la pantalla 5 de A6, la barra del IVA está entera;
   - en el lado a lado de A5, ningún rótulo dice «asume».
2. **La pantalla «FOB y C&F» probada dentro del motor** (hoy es un marcador), con mis correcciones F-1 a F-3 ya aplicadas, y el paso de la pantalla 3 a la 5.
3. **A6 en Safari de iOS**, por el `subgrid` de las filas pareadas, con una captura que muestre que no se rompe.
4. **El §5 cerrado por Near**, medido con el medidor oficial.

---

## 5. Para Near (contenido; bloquea la fusión)

**N-1 · B2: como mucho 60 palabras visibles; las opciones cuentan.** Lo medí a 320 px con el acierto a la vista:

| Pantalla | Hoy | Con M-1 | Qué falta |
| --- | --- | --- | --- |
| A2 · lado a lado | 104 | 92 | Acortar las opciones (N-2) y el acierto (28 palabras). |
| A6 · dos cuentas propias | 84 | 78 | Recortar el texto (24 palabras) o las opciones (30). |
| A5 · lado a lado | 66 | 56 | Nada. |
| A6 · lado a lado | 66 | 59 | Nada. |

**N-2 · El largo de la opción correcta delata la respuesta** (§3.4: entre opciones, como mucho una palabra de diferencia).

| Pantalla | Palabras por opción (correcta primero) |
| --- | --- |
| A2 · lado a lado | 27 / 8 / 8 |
| A5 · lado a lado | 8 / 4 / 10 |
| A6 · lado a lado | 11 / 8 / 6 |
| A6 · dos cuentas propias | 8 / 9 / 11 |

**N-3 · Portada de A2 en una oración** (D2 Básico, ahora en HUECO). Propuesta: «Al terminar, sabrás armar el asiento de una compra y de una venta con IVA y retención, y por qué cambian de lado.» (23 palabras; INFLESZ 80,9).

**N-4 · Las consignas [W] no pueden repetir la respuesta** (regla 9). «Cambia quién asume el flete…» repite la respuesta de A5. Va mejor algo como «Cambia de empresa y mira a dónde va el flete.».
