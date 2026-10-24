DISEÑO: Ajustes de las P2 de T1 a la auditoría de Shoko — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 24-oct-2026 · Para Kaede. Fuente de los cambios: `revisiones/b-t1-p2-mai-shoko.md` y el
lote de Futaba del 24-oct. **Reemplaza las secciones que nombra** de `fichas/b-t1-hacer-p2-mai.md`
y de `fichas/b-t1-5-torres-p2-mai.md`; lo que no se nombra aquí sigue vigente tal cual, incluido
el anexo común C1 a C6, que Shoko pasó sin cambios.

## 0 · Dónde y con qué medí

- **[fuente, réplica]:** medido por mí (Mai) el 24-oct-2026 sobre una réplica del cromo de la
  vista armada con el zip de código que me pasó Sakuta (`src/` de main). **El zip no trae
  `package.json`, así que no pude correr la app**: la réplica reproduce, línea por línea del
  código, lo que fija la geometría —el relleno de página `clamp(16px,2vw,24px)` y el superior
  `clamp(18px,3vh,30px)` de `IntroContabilidadView.jsx`, el `Panel` de `marco.jsx` con su relleno
  `clamp(14px,2.2vw,20px)`, el encabezado compacto C1, `BOTON_NAV` y el bloque pegado de
  `CuatroCapas.jsx`— y nada más. Navegador: Chromium headless (Playwright), Inter y Sora de
  @fontsource 5.3.0, a **320×568 y 375×667**, con el texto más largo real de cada banco.
  La «y» se cuenta **desde la cima del Panel**.
- **[calculado]:** lleva su fórmula. **[supuesto]:** lleva parada de medición.
- **Capturas (320, media escala):** `h2_mesa_4activos_320_media.png`,
  `t14_cuatro_casos_320_media.png`, `t16_cinco_destinos_320_media.png`.

**Dos cifras del cromo que sirven para todas las piezas [fuente, réplica]:**

| | 320×568 | 375×667 |
|---|---|---|
| Ancho útil dentro del Panel | **258** | **313** |
| Cabecera de la vista, hasta la cima del Panel | **126** | **128** |

---

## 1 · H2 `t1-quien-pregunta-esto` — cuatro asientos activos

Reemplaza §2, §3, §4 y §11 de la P2 de H2.

### 1.1 Lo que cambia

- **Solo cuatro asientos están activos por ficha:** los de las cuatro opciones que escribe Futaba.
  Los otros cuatro quedan **atenuados**. Los ocho se quedan en su sitio y en el mismo orden en
  todas las fichas: si los candidatos cambiaran de lugar, la posición sería una pista.
- **Atenuado** = opacidad .42, sin el contorno de reposo (el `inset` baja de
  `rgba(248,249,250,.35)` a `.14`), sin contador, `aria-disabled="true"`, `tabindex="-1"` y
  cursor normal. **No es un error:** nada de coral, nada tachado.
- **Los contadores por asiento salen de la mesa.** La cuenta de propósitos que recibió cada
  lector va **solo en la pantalla de resumen** (el componente publicado `PantallaResumen`, que se
  reutiliza tal cual). Con eso ninguna ficha se resuelve por descarte.
- **El rectángulo «Informe» de 84×44 sale del escenario.** La mesa ya es la mesa del informe, y
  la ficha del propósito es el papel que llega: quitarlo baja el primer asiento 44 px
  [fuente, réplica: 386,8 → 342,8 a 320].
- **La segunda vuelta de D8** usa las mismas ocho fichas con los propósitos redactados como casos
  nuevos (Futaba). **La vista no cambia** y el contador sigue siendo «Propósito n de 8»: no hay
  rótulo de ronda ni señal de que sea la segunda vez.
- **Nivel: Medio** (Shoko). Lo dejo escrito donde mi P2 decía otra cosa.

### 1.2 Medidas [fuente, réplica], con el propósito más largo del banco

El de `clientes`, 23 palabras (`contabilidadIntro.js`, I:153-194).

| | 320 | 375 |
|---|---|---|
| Ficha del propósito (6 renglones a 320, 4 a 375) | 148 | 106 |
| Mesa de ocho asientos | **239** | 239 |
| Asiento (nombre en dos renglones) | **50** | 50 |
| Escenario, vacío y respondido | **411 · 411** | 411 · 411 |
| Renglón reservado de las dos preguntas | 124 | 124 |
| Primer asiento, desde la cima del Panel | **342,8** | **300,8** |
| Desplazamiento horizontal | ninguno | ninguno |

- **B1 pasa por la figura:** la figura empieza en la ficha del propósito —es la pieza que viaja al
  asiento— a **157,8**, con 20 palabras antes [fuente, réplica].
- **Lo honesto:** con el propósito de los clientes, **el primer asiento queda a 342,8, por encima
  de los 280**. No lo arreglo: el propósito es texto del libro y no se recorta. A 375 quedan 300,8.
- **El renglón de 124 aguanta la pareja más larga** (inversionistas y propietarios), que es la
  del prototipo: el escenario mide igual vacío que respondido.

---

## 2 · `t1-donde-se-rompio` — el apagón después de la segunda decisión

Reemplaza §2 de su P2.

- **Al responder la primera decisión** se marca **solo el punto roto**: ✓ «Iba aquí: {n} {nombre}»
  en el correcto, fantasma coral discontinuo en el tocado si erró, y la marca `//` del corte.
  **La cascada no corre todavía**, y los puntos siguientes se quedan como estaban.
- **Después de la segunda decisión** («¿a cuántos no llega?») corre la cascada: los puntos
  posteriores al corte se apagan **uno por uno** —opacidad, 240 ms, 80 ms de retardo entre
  puntos, la curva de la casa (C5)— y aparecen los chips «apagado».
- **Estado nuevo en la lista de C4:** «respondida la 1, antes de la 2» → el punto roto marcado, el
  resto encendido, la segunda decisión activa y los chips todavía sin pintar.
- **Reserva:** la fila de chips tiene su sitio desde el principio, **32 px**
  [calculado: 24 del chip + 8 de hueco] · ⛔ **parada de medición:** Kaede la comprueba con la
  situación que más puntos apaga y me pasa el alto real.
- Lo demás de esa P2 se queda: la marca `//`, los chips y el veredicto C2.

---

## 3 · `t1-en-cual-estado-aparece` — cinco destinos

Reemplaza §0 (lo que cambia), §2 (estructura), §3 y §4 de su P2.

- **La película se parte en dos destinos: «Ingresos» y «Gastos».** El destino único «Lo que vendió
  y lo que gastó» desaparece. Quedan **cinco destinos y un solo toque**:
  - foto: «Activo», «Pasivo», «Patrimonio», bajo «Estado de situación financiera · al 31 de diciembre»;
  - película: «Ingresos», «Gastos», bajo «Estado de resultados · 1 ene – 31 dic» y bajo la franja del tiempo.
- **Al azar se acierta una de cada cinco**, no una de cada cuatro.
- **La llave del puntaje sigue siendo la compuesta** (`informe:seccion`), ahora con
  `segundo:ingresos` y `segundo:gastos`. **Es dato: lo marca Futaba en el banco** (el banco ya lo
  dice en :511, :515 y :518, según Shoko). Kaede no deduce la sección del concepto.
- **La ficha del concepto entra al escenario** y es la primera pieza de la figura, como en H2.

**Medidas [fuente, réplica]:**

| | 320 | 375 |
|---|---|---|
| Escenario, vacío y respondido | **304 · 304** | **289 · 289** |
| Destino | 44 | 44 |
| Primer destino («Activo»), desde la cima del Panel | **305,8** | **290,8** |
| Renglón «Entró: …», reservado | 32 | 32 |
| Desplazamiento horizontal | ninguno | ninguno |

- **B1 pasa por la figura** (empieza en la ficha, a 157,8, con 20 palabras antes).
- **Lo honesto:** el primer destino queda a 305,8 a 320. Lo que lo empuja es el nombre del informe,
  que ocupa tres renglones en su columna de 119 px —«Estado de situación financiera»—, y es el
  nombre que pidió Shoko. No lo corto.

---

## 4 · `t1-que-le-pasa-a-cada-uno` — la decisión 2 pasa a los cuatro casos

Reemplaza el párrafo de la segunda decisión en §2 de su P2, y su §3.

- **La decisión 2 es «¿Cuál de los cuatro casos es este hecho?»**, con los cuatro nombres de la
  p. 35, en columna, cada uno un botón de 44 o más:
  «Aumento en activo y en pasivo» · «Aumento en activo y en patrimonio» ·
  «Disminución en activo y en pasivo» · «Disminución en activo y en patrimonio».
- **La línea «=» deja de marcarse.** Shoko mostró que la igualdad nunca se rompe, así que esa
  señal no distinguía nada; el sitio que ocupaba lo toma el rótulo del caso.
- **Al responder la decisión 2,** el nombre del caso queda **pegado a las barras**, en un renglón
  reservado de 34 px: ✓ «Correcto» o ✕ «No va aquí» con ✓ «Iba aquí: Aumento en activo y en
  pasivo» (C2). Las dos barras que se movieron son las que el nombre dice; **nada depende del color**.
- **Todo está reservado desde el principio** (C3): los cuatro botones y el rótulo del caso ocupan
  su sitio aunque la decisión 2 no esté activa todavía, así que el escenario no crece al responder.

**Medidas [fuente, réplica]:**

| | 320 | 375 |
|---|---|---|
| Barras (la figura), desde la cima del Panel | **246,8** ✓ | **227,8** ✓ |
| Palabras antes de la figura | 27 | 27 |
| Los cuatro botones (alto de cada uno) | 44 · 54 · 54 · 54 | 44 · 44 · 44 · 44 |
| Bloque de los cuatro casos | **224** | **194** |
| Rótulo del caso, reservado | 34 | 34 |
| Escenario, vacío y respondido | **464 · 464** | 434 · 434 |

- **Cierro mi parada de esta pieza:** las barras, subidas al primer lugar y con el encabezado
  compacto C1, quedan a **246,8 a 320** — **B1 pasa**, con 27 palabras antes.
- A 320 los tres nombres largos ocupan dos renglones y el botón crece a 54. No los corto.
- **Nivel provisional: Avanzado** (dos clases de decisión, y la segunda ya no tiene respuesta fija).
  Lo confirma Shoko.

---

## 5 · H1 `t1-un-dia-o-un-ano` — los tres rótulos fijos

Reemplaza §0 (los tres rótulos) y §3 y §4 de su P2.

- **Los tres rótulos son fijos para todas las preguntas:** «Una foto» · «La película: todo el año»
  · «Comparar las dos fotos». El dato `foto` **ya no rotula el botón**: ahora decide **cuál marco
  se enciende al responder** (el del 1 de enero o el del 31 de diciembre). Así el dato deja de
  repetir la fecha de la pregunta —que era lo que la delataba— y sigue sirviendo para la escena.
- Las dos fechas se quedan **bajo la línea del año**, que es donde son contexto y no respuesta.
- **Mazos de 5** (Shoko): el contador es «Pregunta n de 5».

**Medidas [fuente, réplica]:**

| | 320 | 375 |
|---|---|---|
| Los tres botones (ninguno se corta ni se parte) | 44 · 44 · 44 | 44 · 44 · 44 |
| Bloque de respuestas | 148 | 148 |
| Escenario, vacío y respondido | **284 · 284** | 284 · 284 |
| La línea del año (la figura), con una pregunta de 2 renglones | **271,8** ✓ | 252,8 ✓ |
| La misma, con h1-09 (84 caracteres, 3 renglones) | **292,8** ✗ | 273,8 ✓ |

- **Cierro mi parada** («medir con el texto más largo de Futaba»): **con una pregunta de dos
  renglones B1 pasa; con h1-09, que se va a tres, no.**
- **ME FALTA de Futaba — y es un renglón:** h1-09 tiene 84 caracteres y se va a tres renglones, que
  empujan la figura a 292,8. **Pido ≤ 70 caracteres en las diez preguntas del banco.** Con
  «¿Terminó el año con más cosas o con menos que al empezarlo?» (59) la figura vuelve a 271,8
  [fuente, réplica]. El sentido no cambia y el medidor de Futaba decide la redacción final.

---

## 6 · `t1-desde-donde-preguntan` — la segunda decisión

- **La decisión 1 no cambia** (el anillo en fila, la vuelta, el registro en el error): se construye ya.
- **El bloque de la decisión 2 queda reservado**, 96 px [calculado: 2 botones de 44 + 8 de hueco],
  para que el escenario no crezca cuando llegue.
- **Lo que tiene que cumplir la nueva decisión 2 de Futaba,** para que no repita a la primera:
  (a) que no se deduzca de «adentro / afuera»; (b) que se responda **mirando la figura** después
  de la primera respuesta; (c) dos o tres opciones, y si son tres, rótulos de 3 palabras o menos,
  para que quepan en una fila (§2 del archivo de la secuencia).
- **Decidido, para que el lote no se detenga:** si la decisión 2 no llega a tiempo, **la pieza se
  construye con una sola decisión** y se queda en Medio. No se espera.

---

## 7 · `t1-la-ecuacion-en-movimiento` — dos cosas del lote de Futaba

### 7.1 Los grupos de dos botones

En cal-1 (las dos partes) y en cal-2 (lo que debe) solo hay dos cifras honestas. El grupo lleva
**dos botones**, en `grid` de 2 columnas con el mismo hueco de 6 y el mismo alto de 44; cada botón
pasa de ~82 a **126 px** de ancho a 320 [calculado: (258 − 6) / 2], así que la holgura de la cifra
sube y nada se parte. El resto del grupo —rótulo, monospace con tabular-nums, `white-space: nowrap`—
no cambia.

### 7.2 El ejemplo de «Así se juega» no cabe en la escala de la actividad

El ejemplo nuevo de Futaba (`demo-aporte-187000`) llega a **$687.000**, y la escala fija de la
actividad es $515.000 = 150 px. Con ella, esa torre mediría **200,1 px**
[calculado: 687 · 150 / 515] dentro de una reserva de 150: se sale del contenedor.

- **Decido: el ejemplo lleva su propia escala,** alto = valor · 150 / 687.000 [calculado]. Puede,
  porque el ejemplo nunca comparte pantalla con los ocho hechos: es otro escenario, y está rotulado
  como simulado.
- **La escala del juego no cambia:** con las opciones de Futaba, la cifra más alta que puede salir
  en pantalla sigue siendo $515.000 (cal-6, «Tiene»), así que los $515.000 = 150 px de §3 de esa
  P2 se quedan tal cual.
- **Kaede:** dos escalas, una para el ejemplo y otra para el juego, y ninguna se calcula sobre el
  valor del hecho en curso.

---

## 8 · Lo que no es mío, y una buena noticia para Erwin

- **⛔ Erwin:** sigue en pie lo de C6 —«Siguiente» pegado en `AsiSeJuega.jsx` tapa el ejemplo a
  320, y «Pausar» queda debajo—. **Pero el motivo que obligaba al parche ya no existe:**
  `FondoMateria.jsx` usa hoy `overflow-x: clip` y **no** `overflow: hidden` (lo cambió la Célula E,
  y su propio comentario dice que con `hidden` se rompía todo `position: sticky` de la página).
  O sea que **`position: sticky` vuelve a pegar** y el modo fijo-por-script deja de hacer falta
  [fuente: `FondoMateria.jsx`, y el comentario de `CuatroCapas.jsx`:149-152, que quedó viejo].
- **Futaba:** los títulos con mayúscula inicial y el cambio de `INFORMES` ya están en su lote.
- **Paradas de medición:** cierro la de `t1-que-le-pasa-a-cada-uno` (§4) y la de H1 (§5). Las de
  `t1-que-entro-y-que-salio`, `t1-la-articulacion` y `t1-donde-se-rompio` siguen siendo de Kaede:
  no armé sus escenarios en la réplica, así que no tengo su «y» tras C1.

---

## 9 · Estados nuevos (se suman a C4)

| Pieza | Estado | Qué se ve |
|---|---|---|
| H2 | asiento atenuado | opacidad .42, contorno de reposo al 14 %, sin contador, `aria-disabled` |
| t1-8 | respondida la 1, antes de la 2 | el punto roto marcado y la marca `//`; el resto encendido; sin chips |
| t1-4 | decisión 2 sin responder | los cuatro botones en reposo y el rótulo del caso vacío, los dos con su sitio reservado |
| t1-5 | grupo de dos cifras | dos botones de 126 px a 320, el mismo alto de 44 |

## 10 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | H2: cuatro asientos activos y cuatro atenuados; los contadores solo en el resumen | Indispensable (Shoko) |
| 2 | H2: fuera el rectángulo «Informe»; la ficha del propósito es la primera pieza de la figura | — |
| 3 | t1-8: la cascada corre **después** de la segunda decisión | Indispensable (Shoko) |
| 4 | t1-6: cinco destinos y llave `informe:seccion` con `segundo:ingresos` / `segundo:gastos` | Indispensable |
| 5 | t1-4: los cuatro casos reservados desde el principio; la línea «=» ya no se marca | Indispensable |
| 6 | H1: los tres rótulos fijos; el dato `foto` solo enciende el marco | Indispensable |
| 7 | t1-5: grupos de dos botones, y **dos escalas** (una para el ejemplo) | Indispensable |
| 8 | t1-1: el hueco de 96 px de la decisión 2 queda reservado aunque no llegue | — |
