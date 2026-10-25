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

## 0. Alcance: las tres materias, un solo cambio

**Macroeconomía, Contabilidad y Pensamiento Estratégico.** Mateo había dejado
Estratégico fuera para quitarnos trabajo; al ver que `CaminoHacer` y varios
controles son compartidos, su respuesta por Miku (24-oct) fue hacerlo todo de
una vez. Así que no hay bandera opt-in por materia, no hay mapa de materias
que entran, y **ser compartido ya no es razón para frenar ni para duplicar
código**: un componente compartido se cambia una vez y vale para las tres.

Lo que esto NO relaja, y es lo contrario de relajarse: ahora hay **más
superficie viva que se puede romper**. Macroeconomía y Contabilidad tienen
estudiantes reales y Estratégico está publicado. La regla de siempre manda:
**se añade, no se reemplaza** lo que ya funciona.

Y trae una exigencia nueva que es, además, la razón de ser de la §2.4: el
relieve tiene que funcionar sobre **los tres fondos**, no sobre el navy plano.
Medido (§10), no funcionaba. Lo que sigue ya está corregido.

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

El canto de N2 se ve contra su cara (1,35) y contra el navy plano (1,40). Eso
basta en Macro y Contabilidad. **No basta en Estratégico, y por qué no, con
sus números, está en la §2.4**: ahí el telón no es plano y hace falta además
contorno y placa. Léela antes de dar por buena cualquier superficie nueva.

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

### 2.2b Caras claras, que las hay y no las había previsto

Hay controles publicados con la cara clara sobre el sitio oscuro: los botones
de navegación de la secuencia, `#B8C4D4`. La regla es la misma y la resolvió
Mai construyendo T1: **el canto es el gris apagado que ya existe**, no un tono
inventado — `#8C9BB0`, el gris quieto de `CuatroCapas.jsx` —, y pasa la misma
prueba que todo lo demás: **1,60:1 contra su cara** [calculado], por encima del
1,25 exigido.

El patrón general, para la siguiente cara que aparezca: **el canto de una cara
clara se busca primero entre los tonos ya publicados de esa familia**. Solo si
no hay ninguno se deriva, y entonces se escribe la razón.

### 2.3 Elevaciones, radios y recorrido

| Elevación | Canto | Dónde | Radio |
|---|---|---|---|
| E0 | 0 px | texto, píldoras informativas, lo que no se toca | — |
| E1 | 3 px | filas del ranking, tarjetas de opción en reposo | 14 px |
| E2 | 4 px | botones, nodos del camino | 14 px (nodo: círculo) |
| E3 | 6 px | **una sola por pantalla**: el nodo actual, la fila propia | 16 px |

- El canto va **dentro** del blanco de toque de 44 px, no se suma por fuera…
  **salvo cuando la cara ES el blanco de toque.** Si el control mide 44 y el
  canto va detrás, el bloque pasa a medir 48, y esos 4 px por control se suman
  a lo alto de la pantalla. Medido por Mai en T1: el caso más justo deja el
  desplazamiento en **37 px de los 40** de tope. **El alto que añade el canto
  se mide contra el presupuesto de la pieza antes de entregar**, no después.
- E3 es un privilegio escaso: dos cosas a 6 px en la misma pantalla y ninguna
  destaca. Si el diseñador quiere una segunda, baja la primera a E2.
- Nada lleva `box-shadow`. Ni difuminada, ni dura. El canto es un plano
  sólido, no una sombra. Un `inset` de 0 de desenfoque que hace de borde, y
  que no se anima, no es una sombra y no cae aquí.
- **El contorno de silueta sustituye al `inset` al 35%** que llevan hoy muchos
  controles. No se ponen los dos.

---

### 2.4 El telón no es constante, y eso rompía el canto

Esto es lo que cambió al entrar Estratégico, y no se descubre leyendo código:
**detrás del contenido no hay un color plano.** Hay una escena animada y un
velo radial encima (`BackgroundVeil`), y lo que resulta cambia por materia y
por zona de la pantalla. Medido con `scripts/vida/sonda-telon.mjs` a 320 px, en
la banda donde viven el ranking y las tarjetas:

| Pantalla | Velo | Luminancia del telón (mín · p50 · p95 · máx) |
|---|---|---|
| Índice Macro | 0,10 | 0,0101 · **0,0107** · 0,0188 · 0,0836 |
| Índice Contabilidad | 0,10 | 0,0101 · **0,0107** · 0,0120 · 0,0255 |
| Índice Estratégico | 0,34 | 0,0034 · **0,0389** · 0,1560 · 0,2168 |
| Actividad Estratégico | 0,62 | 0,0052 · **0,0281** · 0,0841 · 0,1095 |

Referencias: `#0E1B2E` = 0,0107 · N1 `#1D3557` = 0,0350 · N2 `#344968` = 0,0649.

Tres lecturas, y la tercera es la que manda:

1. En Macro y Contabilidad el telón **es** el navy plano (p50 0,0107 clavado).
   La escalera de la §2.1 se sostiene tal cual: canto 1,40:1, cara 1,89:1.
2. En el índice de Estratégico el telón sube a 0,0389 de mediana: **más claro
   que el propio canto N1** (0,0350). La razón del canto contra el telón cae a
   **1,05:1** y en el 5% más claro la relación **se invierte** (p95 0,1560, más
   del doble que la cara N2). La madera clara del ajedrez se come el relieve.
3. Dentro de una misma pantalla el telón recorre de 0,0034 a 0,2168: **64 veces**.
   No hay un color de canto que funcione contra todo ese rango.

**Conclusión, y retira un requisito que yo mismo había escrito:** el canto
**no puede** tener que verse contra la página. Esa exigencia era correcta
cuando la página era un navy plano y es imposible de cumplir ahora. Se
sustituye por tres reglas que sí se sostienen sobre los tres fondos:

- **El canto se juzga contra su propia cara**, que es constante: **≥ 1,25:1**.
  N2 sobre N1 da 1,35:1 y pasa.
- **Contorno de silueta:** 1 px `rgba(248,249,250,.18)` alrededor del bloque
  entero (cara + canto). Cubre los dos regímenes: sobre telón oscuro el
  contorno claro dibuja el borde; sobre telón claro el bloque ya es más oscuro
  que su entorno y la silueta se lee sola.
- **Placa** donde el telón gana: un panel **opaco** N1 detrás del grupo entero
  —el leaderboard, la rejilla de tarjetas—, con el mismo contorno y 16 px de
  radio. Dentro de la placa el telón deja de existir y el relieve vuelve a ser
  el de la §2.1.

**Cuándo es obligatoria la placa**, y es una prueba, no una opinión: cuando el
p95 del telón supera la luminancia de la cara N2 (0,0649). La sonda lo dice
sola. Hoy: **índice de Estratégico y actividad de Estratégico la exigen**;
Macro y Contabilidad no. Ponerla igualmente en las tres no es error —unifica—,
pero quitarla donde la sonda la exige sí lo es.

Las superficies **nunca** son `rgba`. Una cara semitransparente deja pasar el
ajedrez y convierte cada medición en inútil.

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
cambia es **qué** se mueve. En las tres materias, lo que lleva relieve se
hunde; el `scale(.97)` sigue vigente para todo lo que no lo lleva.

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

### 5.0 Dónde NO va la decoración

Antes del catálogo, porque es lo que más se equivoca: **la decoración nunca va
encima de la figura de una pieza.** El riel, las fichas, la mesa, el diagrama
son el argumento; una textura encima les quita lectura. Si una pieza de
Aprender quiere decoración, va **una sola, quieta y detrás** —en el contenedor
de la figura, no en la figura—, y sale de una trama ya publicada en vez de un
motivo nuevo. La regla y el ejemplo son de Mai en T1 (los renglones del libro
mayor a `rgba(203,220,242,.05)`, la trama que ya está en `CSS_SALA`).

**El bucle es solo del leaderboard.** En cualquier otro sitio la decoración no
se anima, y entonces no hay keyframe que contar.

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
| 10 | **Fae**, el muñequito | las tres | entrada, una vez | **no** |
| 11 | Torre de ajedrez | Estratégico | flota | sí |

Reparto, como con los identificadores: **el diseñador de cada célula dibuja
las de sus temas** dentro de estas reglas; quien dibuje una reserva su número
en la tabla antes de empezar, en el PR, para que no salgan dos monedas
distintas. **Las 1 a 11 están dibujadas y reservadas por Hanayama**
(`orquestador/revisiones/decoracion-ranking/piezas/`); la 11 es suya y entró al
cambiar el alcance, porque Estratégico se había quedado sin pieza propia. La
siguiente que se dibuje es la 12.

**La vara de «son piezas distintas», y es medible.** Dos piezas del catálogo se
distinguen entre sí al menos tanto como el par más parecido que ya hay: cubo
contra moneda, **71%** de huella distinta a 28 px. Una pieza nueva que se
parezca más que eso a otra no es una pieza nueva, es la misma con un trazo
movido. Se mide rasterizando las dos al tamaño de pantalla y comparando el
canal alfa.

**Detalle de ejecución que mejora lo que yo había escrito:** la opacidad va en
`stroke-opacity`, no en la opacidad del grupo. Así no se componen dos
transparencias, que es justo lo que el kit prohíbe.

### 5.2 Fae, el muñequito

Una sola mascota para la casa, no una por materia. Se construye con el mismo
lenguaje de trazo: cabeza circular, cuerpo en cápsula, sin cara detallada
—dos puntos bastan— y sin accesorios de materia. No tiene bucle: entra una vez
y se queda quieta. Es decoración, no un personaje que hable: nunca lleva
bocadillo ni texto.

**Fae no codifica nada, y esto no es negociable.** Su pose no dice tu puesto,
ni tu racha, ni si vas bien. Dos razones: la banda va `aria-hidden`, así que
cualquier información que viva ahí no existe para quien usa lector de pantalla;
y medido, las tres poses dibujadas se distinguen entre sí un 15-33% cuando la
vara del catálogo es 71%, o sea que a 28 px no se leen como poses distintas de
todos modos. Si hay que marcar tu puesto, va en la fila propia con **palabra y
forma**, como el riesgo del panel docente.

**Por eso, una sola pose por tabla.** Tres poses que se parecen un 15% no son
tres poses. O se redibujan hasta separarse como se separa el resto del
catálogo, o Fae tiene una y buena. Prefiero una y buena: es una mascota, no un
juego de iconos.

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

**Solo el bloque de los leaderboards** (`RankingFP` y `LigaBoard`), en las
tres materias:

- **Máximo 3 elementos en bucle visibles a la vez.** Tres, no «unas pocas».
- Van en una **banda propia** de 72 px (56 px por debajo de 375) entre el
  título y la primera fila. **Nunca por detrás de texto**: así no hay riesgo
  de legibilidad que medir después.
- La banda va **dentro de la placa** del grupo donde la placa sea obligatoria
  (§2.4). Sobre la madera clara del ajedrez, un trazo `#CBDCF2` a 0,45 de
  opacidad baja a 2,55:1 contra el telón más claro medido [calculado]: se ve,
  pero pierde la mitad de su presencia. Dentro de la placa no depende de eso.
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
- **Máximo cuatro grupos, y es un tope, no una sugerencia.** Con seis, el
  último arranca a 400 ms y termina a 680: por encima del techo de 560 ms que
  fija `aprender-secuencia-v1.md`. No se escalona fila por fila de una lista:
  la lista entera es **un** grupo, y una rejilla de temas entera también. Diez
  filas escalonadas son diez animaciones y la página tarda dos segundos en
  estarse quieta justo cuando el estudiante ya quiere tocar algo.
- **Después de 520 ms no se mueve nada** salvo los 3 bucles de la banda del
  leaderboard, que arrancan al terminar la entrada, no antes.
- El fondo de materia ya está ahí: no entra, no se anima, no se toca.
- Movimiento reducido: **no se anima nada**, la página aparece puesta. Lo había
  escrito como un fundido de 120 ms; la Célula A lo implementó sin animación
  (`animation: none`) y es mejor, porque un fundido sigue siendo movimiento para
  quien pidió que no lo hubiera. Adoptado de su versión.

**Los slides de Aprender ya están definidos** en `aprender-secuencia-v1.md`
(entrada escalonada 0/80/160, 280 ms, translateX al avanzar, 200 ms sin
escalonado al retroceder, salida 120 ms). **No se redefinen aquí.** Lo único
que esta especificación añade a una pantalla de Aprender es el relieve de sus
botones y tarjetas (§4) y, si lleva, la decoración de la §5 sin bucle.

---

## 9. Un cambio, tres materias: qué sustituye a la protección

Antes esto era un contrato de opt-in: prop apagada por defecto, mapa por
materia, nada global. **Ese contrato se cae entero.** `CaminoHacer` recibe el
relieve y lo reciben sus siete vistas de Macro y Contabilidad y las dos de
Estratégico (`PensamientoSistemicoView`, `PorterView`) a la vez. Los dos
leaderboards viven en `TopicIndexView`, que es el mismo para las tres: se
cambia una vez.

Lo que **sustituye** a esa protección, porque la superficie en riesgo creció:

1. **Se añade, no se reemplaza.** El relieve se monta encima de lo que hay: no
   se borra un estado, no se cambia una cota, no se retira un componente
   publicado. Si una pieza necesita que algo existente desaparezca, eso es otro
   PR y otra conversación.
2. **Ningún valor existente de `theme.js` cambia.** Los tonos de la escalera se
   **añaden**. Cambiar `FAE.navy` repinta las tres materias de golpe, que es
   justo el riesgo que trae hacerlo todo a la vez.
3. **Toda pieza se comprueba también en una pantalla de Estratégico** antes de
   que su auditor dé PASA. Es una pantalla más, no un lote más: el índice de
   Estratégico sirve para casi todo, porque es el caso peor de telón (§2.4).
4. **La sonda del telón decide la placa**, no el ojo. `node
   scripts/vida/sonda-telon.mjs` y se pega su salida al PR.
5. **El camino de Estratégico no se reordena.** Relieve sí; número de nodos,
   orden, ramal del desafío y bloqueos (que no existen: ningún nodo se bloquea
   nunca) se quedan como están.

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

Y la cuarta medición, la del telón, está en la §2.4 con su tabla:
`node scripts/vida/sonda-telon.mjs`, que además dice sola qué pantalla exige
placa.

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
2. El canto se ve contra su cara: **≥ 1,25:1**, calculado y escrito. Contra la
   página ya **no** se exige (§2.4): lo cubren el contorno de silueta y la
   placa.
2b. `node scripts/vida/sonda-telon.mjs` corrido y su salida pegada al PR. Donde
   dice EXIGE PLACA, la pieza lleva placa. Ninguna superficie en `rgba`.
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
8. **La misma pieza, vista en una pantalla de Pensamiento Estratégico**, con
   captura a 320 px. Es el caso peor de telón y es donde se cae el relieve si
   se va a caer. Sin esa captura no hay PASA.
9. Blanco y negro: el relieve se sigue leyendo. Si el volumen solo existía por
   el color, no había volumen.
10. Lista de estados, y «no aplica» donde no aplique.

---

## 12. Lo que encontré de paso, y es de otro dueño

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
