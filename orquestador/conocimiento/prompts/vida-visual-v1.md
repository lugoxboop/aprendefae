2026-10-24 · Ukyo · **Vida visual v1**: relieve, decoración y entrada
=====================================================================

Encargo de Mateo por Miku (24-oct): la página se siente plana y sin vida.
Cuatro cosas: entrada a la página y a los slides, UI de actividades con
volumen al estilo Duolingo pero con lo nuestro, decoración animada
**decorativa** (un muñequito, un tetraedro: algo que dé vida sin enseñar
nada) y decoración en los leaderboards, que pueden ser varias.

Esto define el **lenguaje**. No dibuja las piezas: cada diseñador de célula
dibuja las suyas dentro de este sistema, igual que con los identificadores de
tema (kit.md, el reparto de Miku).

---

## 0. Alcance, y es lo primero porque es lo que se rompe

**Solo Macroeconomía y Contabilidad. Pensamiento Estratégico no se toca.**

El peligro no es desobedecer, es romperlo sin querer: `CaminoHacer.jsx` es
compartido y lo usan `PensamientoSistemicoView.jsx` y `PorterView.jsx`. Los
dos leaderboards (`RankingFP.jsx` y `ligas/LigaBoard.jsx`) viven dentro de
`TopicIndexView.jsx`, que es **el mismo componente para las tres materias**.

Por eso **nada de esto entra como cambio global de un componente
compartido**. Todo entra como opt-in por materia, con el contrato mecánico de
la §9. Si una entrega cambia el aspecto por defecto de un componente
compartido, está mal aunque se vea bien.

---

## 1. El problema del volumen sobre fondo oscuro, medido

Duolingo apila una cara de color sobre un **canto inferior sólido y más
oscuro** —no una sombra difuminada—, y al pulsar la cara baja hasta tapar el
canto. Eso funciona sobre blanco. Sobre nuestro `#0E1B2E` **no funciona**, y
el número lo dice:

| Par | Razón de contraste | [origen] |
|---|---|---|
| Tarjeta `#1C2939` oscurecida 32% (canto) contra el fondo `#0E1B2E` | **1,01:1** | [calculado] |
| Tarjeta `#1C2939` contra el fondo `#0E1B2E` | **1,17:1** | [calculado] |

Un canto a 1,01:1 contra la página es, literalmente, invisible. Y la raíz es
peor que el canto: **la tarjeta misma apenas se separa del fondo** (1,17:1).
No hay volumen que construir encima de una superficie que no se ve.

Fórmula de todos los `[calculado]` de este archivo: razón WCAG
`(L1+0,05)/(L2+0,05)` sobre luminancia relativa sRGB. Script en
`scripts/` pendiente de añadir; mientras tanto la cuenta está en el cuerpo
del PR de este archivo.

### La salida: el canto no se oscurece, se sube

Sobre oscuro la pista legible no es la sombra (negro sobre casi negro), es la
**cara iluminada arriba** y un **canto que es el escalón de abajo de la
escalera**. Queda una escalera de superficies donde el canto de un nivel es
exactamente la cara del nivel anterior. No es una paleta de parches: es un
sistema, y no añade colores de acento.

---

## 2. El relieve: la escalera y sus cifras

### 2.1 Superficies neutras

| Nivel | Uso | Cara | Canto (abajo) | r(cara:fondo) | r(canto:cara) | r(canto:fondo) |
|---|---|---|---|---|---|---|
| N0 | la página | `#0E1B2E` | — | — | — | — |
| N1 | fila de ranking, tarjeta en reposo | `#1D3557` | sin canto | 1,40:1 | — | — |
| N2 | lo que se pulsa, la fila destacada | `#344968` | `#1D3557` | 1,89:1 | **1,35:1** | **1,40:1** |

Todos `[calculado]`. `#1D3557` es el navy de marca que ya está en `theme.js`;
el único tono nuevo es `#344968`, y se deriva: `#1D3557` mezclado un 10% hacia
blanco. **No es un color de acento nuevo** —la paleta de acentos (teal, ámbar,
coral) no se toca—; es un tono de superficie, y la prohibición del kit sobre
«un quinto color» habla de acentos en los dibujos, no de la escalera de fondos.

El canto de N2 se ve contra su cara (1,35) **y** contra la página (1,40). Ese
doble requisito es lo que falla con el canto oscurecido, y es la prueba que
hay que pasar para proponer cualquier superficie nueva.

**Filo:** 1 px arriba, `#586A83` (1,65:1 contra la cara N2 [calculado]). Es la
luz, y viene de arriba siempre. Nunca filo abajo ni canto arriba.

### 2.2 Caras de color (lo primario)

| Cara | Canto | r(canto:cara) | r(canto:fondo) | Texto encima |
|---|---|---|---|---|
| Teal `#2A9D8F` | `#1D6B61` | 1,90:1 | 2,74:1 | **`#0E1B2E`**, no blanco |
| Ámbar `#E9C46A` | `#9E8548` | 2,13:1 | 4,86:1 | `#0E1B2E` |
| Coral `#E76F51` | `#9D4B37` | 1,94:1 | 2,88:1 | `#0E1B2E` |

Todos `[calculado]`. Los cantos de color son la cara mezclada un 32% hacia
negro, y aquí sí funciona porque el croma los salva: tienen contra la página
2,74 y 4,86, no 1,01.

**Hallazgo que cambia botones ya publicados:** `#F8F9FA` sobre teal `#2A9D8F`
da **3,15:1** [calculado], por debajo del 4,5 que pide el texto normal. Un
botón teal lleva texto `#0E1B2E` (5,20:1), no blanco. Si hay botones teal con
texto blanco en producción, es deuda y va a su propio arreglo, no a este.

**Coral sigue siendo solo error.** El relieve no lo habilita para nada más.

### 2.3 Elevaciones, radios y recorrido

| Elevación | Canto | Dónde | Radio |
|---|---|---|---|
| E0 | 0 px | texto, píldoras informativas, lo que no se toca | — |
| E1 | 3 px | filas del ranking, tarjetas de opción en reposo | 14 px |
| E2 | 4 px | botones, nodos del camino | 14 px (nodo: círculo) |
| E3 | 6 px | **una sola por pantalla**: el nodo actual, la fila propia | 16 px |

- El canto va **dentro** del blanco de toque de 44 px, no se suma por fuera.
- E3 es un privilegio escaso: dos cosas a 6 px en la misma pantalla y ninguna
  destaca. Si el diseñador quiere una segunda, baja la primera a E2.
- Nada lleva `box-shadow`. Ni difuminada, ni dura. El canto es un plano
  sólido, no una sombra.

---

## 3. Cómo se implementa sin romper «solo transform y opacity»

Esta es la parte que se hace mal si no se dice. El canto **no es un
`border-bottom`**: animar el grosor de un borde es animar layout, y está
prohibido.

El canto es **una capa hermana detrás**, y la que se mueve es la cara:

- Un contenedor en `position: relative`, altura total = cara + canto.
- La **capa del canto**: `position: absolute`, ocupa el contenedor entero,
  color del canto, mismo radio. No se mueve nunca.
- La **cara**: encima, desplazada `-canto` px hacia arriba con `transform:
  translateY(-Npx)` en reposo. El canto asoma por abajo.
- Al pulsar, la cara va a `translateY(0)`: tapa el canto y parece que se
  hunde. **Solo se anima `transform`.** Sin layout, sin reflow, sin saltos.

### Tiempos

| Estado | Qué pasa | Duración | Curva |
|---|---|---|---|
| Pulsar | cara a `translateY(0)` | 100 ms | `cubic-bezier(.3,.9,.4,1)` |
| Soltar | cara vuelve a `-N` | 160 ms | la misma |
| Hover / foco (ratón) | cara a `-(N+2)` | 160 ms | la misma |

Los 100/160 ms son los que ya tiene el canon para pulsar un botón: lo que
cambia es **qué** se mueve. En Macroeconomía y Contabilidad, lo que lleva
relieve se hunde; el `scale(.97)` sigue vigente para todo lo demás y para
Pensamiento Estratégico, que no entra aquí.

Con movimiento reducido el hundido **se queda**: es la respuesta directa a un
dedo sobre un control, 4 px y 100 ms, no es decoración. Lo que se va es lo de
la §5 y la §7.

---

## 4. Qué cambia en las actividades

Lo que vuelve volumétrico, y nada más:

1. **Tarjetas de opción** de Hacer: N1 + E1 en reposo; N2 + E2 al tocarse;
   acierto y error no cambian la elevación, cambian el color como ya hacen.
2. **Botones** (Responder, Siguiente): cara de color + E2.
3. **Nodos del camino** (`CaminoHacer`, con la prop de la §9): E2; el nodo
   actual E3 y una llegada de una sola vez (`scale(.92→1)`, 240 ms) cuando
   pasa a ser el actual. Ningún nodo se bloquea nunca: el relieve cambia cómo
   se ve, jamás si se puede pulsar.
4. **Filas del ranking**: N1 + E1; la fila propia N2 + E3.

Lo que **no** cambia: la figura de la pieza, el encabezado de Hacer, «Así se
juega», la pantalla de resumen. Son componentes publicados y se reutilizan sin
tocar.

---

## 5. Catálogo de decoraciones

Decorativas de verdad: **no enseñan nada**, no son la figura de la pieza, no
llevan nombre accesible. Todas `aria-hidden="true"`.

### 5.1 La familia

Trazo de 1,5 px, sin relleno, color `#CBDCF2` (12,4:1 contra el fondo
[calculado]), opacidad 0,45. Sin degradado, sin sombra, sin desenfoque.
Lienzo 40×40. Tamaño en pantalla 28 a 44 px.

| # | Pieza | Materia | Movimiento | Bucle |
|---|---|---|---|---|
| 1 | Tetraedro en alambre | las dos | flota | sí |
| 2 | Cubo en alambre | las dos | flota | sí |
| 3 | Chispa de cuatro puntas | las dos | pulso | sí |
| 4 | Moneda de canto | Macro | gira (scaleX 1→,12→1) | sí |
| 5 | Billete que planea | Macro | flota + rota 3° | sí |
| 6 | Flecha de tendencia | Macro | flota | sí |
| 7 | Libro entreabierto | Conta | flota | sí |
| 8 | Clip | Conta | flota + rota 6° | sí |
| 9 | Sello hexagonal | Conta | pulso | sí |
| 10 | **Fae**, el muñequito | las dos | entrada, una vez | **no** |

Reparto, como con los identificadores: **el diseñador de cada célula dibuja
las de sus temas** dentro de estas reglas; quien dibuje una reserva su número
en la tabla antes de empezar, en el PR, para que no salgan dos monedas
distintas.

### 5.2 Fae, el muñequito

Una sola mascota para la casa, no una por materia. Se construye con el mismo
lenguaje de trazo: cabeza circular, cuerpo en cápsula, sin cara detallada
—dos puntos bastan— y sin accesorios de materia. Tres poses **estáticas**:
saluda, celebra, mira. No tiene bucle: entra una vez y se queda quieta. Es
decoración, no un personaje que hable: nunca lleva bocadillo ni texto.

### 5.3 Los tres movimientos, y son tres

```
flota   translateY 0 → -6px → 0
gira    scaleX 1 → .12 → 1
pulso   opacity .30 → .60 → .30
```

Curva `cubic-bezier(.3,.9,.4,1)` en los tres, también en `gira`: cuatro
paradas con la curva de la casa leen como una moneda de verdad, y así no
entra `linear`, que está prohibida.

**Un solo juego de keyframes por pantalla; lo que varía es duración y
retardo.** Medido: seis elementos con tres animaciones distintas cuestan 472
ms de recálculo de estilo contra 381 ms de los mismos seis con una sola, un
24% más [pantalla, Ukyo, 24-oct, §10]. Duraciones 3.600 / 5.100 / 7.200 ms
—ni iguales ni múltiplos, para que no se sincronicen— y retardos 0 / 900 /
1.700 ms.

Amplitudes, tope: 6 px de desplazamiento, 6° de giro, 0,30 de recorrido de
opacidad. Más que eso ya no es fondo, es algo que pide atención.

---

## 6. SVG o three.js: SVG, y por qué

**Decoración: SVG inline movido por CSS. three.js no.** No por gusto; por
tres razones que se sostienen solas:

1. **Ya hay una escena WebGL en la página.** `FondoMateria.jsx` monta
   `SupplyDemandBackground` en Macro y `LibroMayorBackground` en Contabilidad
   en toda página de actividad. Una segunda decoración con WebGL es un segundo
   contexto compitiendo por la misma GPU.
2. **Desaparecería justo en los equipos de nuestros estudiantes.**
   `detectQualityTier` (`src/utils/device.js`) cae a `STATIC` con
   `hardwareConcurrency <= 4`, y el propio archivo avisa de que muchos iPhone
   reportan 4. Un fondo que cae a imagen fija es correcto; una decoración que
   desaparece deja la página igual de plana que hoy en el equipo que más nos
   importa. En SVG, esos equipos ven la pieza quieta en su pose media.
3. **No se puede pausar barato.** Una animación CSS se congela con
   `animation-play-state: paused`, y medido eso devuelve el coste a la línea
   base (§10). Un `requestAnimationFrame` hay que apagarlo a mano y nadie se
   acuerda.

Los cuatro fondos de `src/components/backgrounds/` se quedan como están y
**no se empieza nada de cero**: si una materia quiere más vida de fondo, se
ajusta el suyo, no se añade otro.

---

## 7. El límite: el bucle, con su excepción nombrada y medida

El canon dice **nada nuevo en bucle** (hay 116 animaciones infinitas
publicadas). Esta propuesta pide **una sola excepción, acotada**, y la paga
con una condición dura.

### Lo que NO lleva bucle, y no se discute

Actividades, camino, botones, tarjetas de opción, pantallas de Aprender, panel
docente, identificadores de tema. Su vida viene del relieve, de la pulsación y
de la entrada. Cero animaciones nuevas infinitas.

### La excepción

**Solo el bloque de los leaderboards** (`RankingFP` y `LigaBoard`), y solo en
Macroeconomía y Contabilidad:

- **Máximo 3 elementos en bucle visibles a la vez.** Tres, no «unas pocas».
- Van en una **banda propia** de 72 px (56 px por debajo de 375) entre el
  título y la primera fila. **Nunca por detrás de texto**: así no hay riesgo
  de legibilidad que medir después.
- Fae va junto a «tú», en pose estática, sin bucle. No cuenta en los 3.

### Las cinco condiciones que la pagan

Si falta una, la excepción no aplica y se entrega sin bucle:

1. **Pausa fuera de pantalla.** `IntersectionObserver` sobre la banda →
   `animation-play-state: paused`. Medido: 10 elementos pausados cuestan lo
   mismo que ninguno (402 ms contra 401 ms de línea base a ×6; 622 contra 559
   a ×10). Es el mecanismo que hace asequible todo lo demás.
2. **Pausa con la pestaña oculta** (`visibilitychange`).
3. **Nada con movimiento reducido ni en gama baja**: `shouldRenderStatic()` de
   `src/utils/device.js` → pose media, quieta.
4. **Solo `transform` y `opacity`.** Medido a ×6 con 3 elementos, cuatro
   repeticiones: `transform` 768–1.115 ms, `filter: blur` 679–1.264 ms,
   `box-shadow` **1.121–1.820 ms**. La sombra animada sale peor en las cuatro;
   el desenfoque se solapa con `transform` y **no** es consistentemente peor en
   esta medición. La prohibición del desenfoque se sostiene por otro lado —su
   coste es de rasterizado, y el compositado por software del arnés lo
   subestima—, no por este número: dicho para que nadie lo cite como prueba.
5. **Sin `will-change` permanente.**

### El coste, dicho de frente

Tres elementos en bucle cuestan **+491 ms de hilo principal cada 4 s a ×6**
(un 12%) y **+756 ms a ×10** (un 19%), sobre una línea base de 401 y 559 ms
[pantalla, Ukyo, 24-oct, §10]. No es gratis. Es el precio de que la página
deje de sentirse muerta, acotado a un bloque, con pausa obligatoria, y medido
en el peor caso. Diez elementos sin pausa (1.307 ms a ×6, 2.038 a ×10) es lo
que no se hace.

---

## 8. La entrada a la página

Lo primero que ve el estudiante. No se inventa nada: son las cifras que ya
usa el panel docente, extendidas a un cuarto grupo.

| Qué | Orden | Retardo | Duración |
|---|---|---|---|
| Cabecera | 1 | 0 ms | 280 ms |
| Contenido principal | 2 | 80 ms | 280 ms |
| Camino o lista | 3 | 160 ms | 280 ms |
| Decoración | 4 | 240 ms | 280 ms |

- `opacity` 0→1 y `translateY` 12→0 px. Curva de la casa. **Total 520 ms**,
  por debajo del tope de 560 ms que fija `aprender-secuencia-v1.md`.
- Máximo cuatro grupos. No se escalona fila por fila de una lista: la lista
  entera es **un** grupo. Diez filas escalonadas son diez animaciones y la
  página tarda dos segundos en estarse quieta.
- **Después de 520 ms no se mueve nada** salvo los 3 bucles de la banda del
  leaderboard, que arrancan al terminar la entrada, no antes.
- El fondo de materia ya está ahí: no entra, no se anima, no se toca.
- Movimiento reducido: solo `opacity`, 120 ms, sin escalonado ni
  desplazamiento.

**Los slides de Aprender ya están definidos** en `aprender-secuencia-v1.md`
(entrada escalonada 0/80/160, 280 ms, translateX al avanzar, 200 ms sin
escalonado al retroceder, salida 120 ms). **No se redefinen aquí.** Lo único
que esta especificación añade a una pantalla de Aprender es el relieve de sus
botones y tarjetas (§4) y, si lleva, la decoración de la §5 sin bucle.

---

## 9. El contrato de opt-in por materia

La clave es la misma en todo el sitio: `subjectId` / `materiaId`, con valores
`macroeconomia`, `contabilidad` y `pensamiento-estrategico`
(`src/data/subjects.js`).

El patrón ya existe y se copia tal cual, el de `FondoMateria.jsx`: un mapa con
entradas **solo** para las materias que entran; la que no está en el mapa cae
en `null` y se dibuja exactamente como hoy.

**Las cuatro reglas mecánicas:**

1. **Prop con valor por defecto apagado.** `CaminoHacer` recibe `relieve =
   false`; `RankingFP` y `LigaBoard` reciben `decoracion = null`. Las vistas de
   Macro y Contabilidad la pasan; `PensamientoSistemicoView` y `PorterView` no
   se tocan **en absoluto**.
2. **Ninguna regla CSS global.** Nada de un selector sobre `.fae-card` ni
   sobre ninguna clase compartida. El relieve llega por una clase que pone el
   propio componente cuando la prop está encendida.
3. **Tokens añadidos, nunca modificados.** En `theme.js` se **añade** un
   bloque nuevo (la escalera de la §2). No se cambia el valor de ninguna clave
   existente. Cambiar `FAE.navy` repinta Estratégico sin que nadie lo pida.
4. **La prueba de que no se rompió nada**, y va en todo PR de este encargo:
   con la prop apagada, el render de Pensamiento Estratégico es **idéntico**
   al de `main`. Captura a 320 px del índice de Estratégico antes y después.

---

## 10. Las mediciones

Reproducible: `node scripts/vida/sonda-bucle.mjs 6` (y `10`). El arnés está
en `scripts/vida/arnes.html`.

Método: Chromium sin GPU (compositado por software: **el peor caso**, un
teléfono real con GPU compone `transform` y `opacity` fuera del hilo principal
y pagará menos), ventana de 320×640, dPR 2, CPU frenada por CDP, 4 s por caso.
Lo que se lee es el reloj de `Performance.getMetrics` antes y después:
`TaskDuration` y `RecalcStyleDuration` acumulados en esos 4 s. 

**CPU ×6**

| Caso | Hilo principal | Recálculo de estilo |
|---|---|---|
| Línea base, sin decoración | 401 ms | 0 ms |
| 3 elementos en bucle | 892 ms | 323 ms |
| 10 elementos **en pausa** | **402 ms** | **0 ms** |
| 10 elementos en bucle | 1.307 ms | 499 ms |
| 3 con `filter: blur` animado | 1.017 ms | 232 ms |
| 3 con `box-shadow` animada | 1.436 ms | 236 ms |
| 6 con tres keyframes distintas | 1.174 ms | 472 ms |
| 6 con una sola keyframe | 1.050 ms | 381 ms |

**CPU ×10**

| Caso | Hilo principal | Recálculo de estilo |
|---|---|---|
| Línea base | 559 ms | 0 ms |
| 3 elementos en bucle | 1.315 ms | 531 ms |
| 10 elementos **en pausa** | **622 ms** | 0 ms |
| 10 elementos en bucle | 2.038 ms | 790 ms |

**Variación entre repeticiones.** Cuatro pasadas del mismo caso a ×6: línea
base 323–446 ms, 3 elementos en bucle 768–1.115 ms. Las tablas de arriba son
una pasada; lo que se cita son los órdenes de magnitud y las diferencias
grandes, no el milisegundo. Una diferencia por debajo de ~200 ms a ×6 está
dentro del ruido y no decide nada.

Las tres lecturas que mandan: el coste **crece con el número de elementos en
bucle**, por eso el tope son 3 y no «las que se vean bien»; la **pausa
devuelve el coste a cero**, por eso es obligatoria y no recomendable; y la
`box-shadow` animada es, en las cuatro pasadas, la más cara de las tres
técnicas.

Lo que **no** se midió, y hay que decirlo: ningún teléfono real, y ninguna
pieza construida —esto es un arnés con filas de mentira—. Estos números son un
suelo pesimista, no la experiencia en un equipo de estudiante. La
parada de medición para el constructor es §11, punto 6.

---

## 11. Antes de entregar

1. 320 y 375 px, con el texto más largo real.
2. El canto se ve contra su cara **y** contra la página: las dos razones
   calculadas y escritas. Un canto a menos de 1,25:1 contra la página no vale.
3. Ningún `box-shadow`, ningún `filter` animado, ningún `border-width`
   animado. Solo `transform` y `opacity`.
4. Elementos en bucle visibles a la vez: **≤ 3**, y solo en la banda del
   leaderboard. Se cuentan y se escribe el número.
5. La pausa fuera de pantalla funciona: se comprueba desplazando la banda
   fuera de vista y viendo que las animaciones se detienen.
6. **Parada de medición:** la misma tabla de la §10, hecha sobre la pieza real
   construida y no sobre el arnés. Si 3 elementos pasan de +15% de hilo
   principal a ×6, bajan a 2.
7. Movimiento reducido y gama baja: pose media, quieta, y el hundido sigue.
8. La prueba de Estratégico de la §9.4: captura antes y después, idénticas.
9. Blanco y negro: el relieve se sigue leyendo. Si el volumen solo existía por
   el color, no había volumen.
10. Lista de estados, y «no aplica» donde no aplique.

---

## 12. Lo que encontré de paso, y no va en este PR

Dos cosas que vi mirando los leaderboards y que son de otro dueño:

- **El podio usa coral para el primer puesto** (`ACENTO_PODIO`,
  `RankingFP.jsx`). El kit dice que coral es **solo error**. Recomiendo ámbar
  para el primero: ya está en la paleta, el oro es la lectura universal de un
  podio y no choca con debe/haber porque en una pantalla de ranking no hay
  asientos. Decisión de Erwin, que manda lo compartido.
- **Los apodos del ranking se cortan con puntos suspensivos**
  (`textOverflow: "ellipsis"` en la fila), y la vara de diseño dice que nunca
  se corta un nombre así: se deja crecer el componente.

Van por issue con etiqueta `miku`, no aquí.
