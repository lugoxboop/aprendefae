DISEÑO: La forma de los cuatro Aprender de T1 en secuencia — ESPECIFICACIÓN PARA `SecuenciaAprender` (#514)

De: Mai · 24-oct-2026 · Para Kaede y Sakuta. Aplica `prompts/aprender-secuencia-v1.md` (Ukyo) sobre
el fondo de Futaba (`fichas/b-t1-aprender-secuencia-y-hacer.md`, ya corregido). **El componente no
existe:** esto es especificación, no un parche sobre algo construido. Empieza por cu0-a1, que es la
pieza piloto; las otras tres van en §6, §7 y §8.

## 0 · Dónde y con qué medí

- **[fuente, réplica]:** medido por mí (Mai) el 24-oct-2026. El zip de código que me pasó Sakuta
  trae `src/` pero **no `package.json`**, así que no pude correr main: armé una réplica del cromo
  de la vista copiando del código lo que fija la geometría —`IntroContabilidadView.jsx` (relleno
  de página `clamp(16px,2vw,24px)`, superior `clamp(18px,3vh,30px)`, cabecera, insignia, «PIEZA k
  DE N», el hueco de 84 px de la ficha de FP), `marco.jsx` (`Panel`, relleno
  `clamp(14px,2.2vw,20px)`), `CuatroCapas.jsx` (`BOTON_NAV` y el bloque pegado)— y monté encima
  las zonas de §4 del patrón con las formas publicadas de la pieza. Chromium headless
  (Playwright), Inter y Sora de @fontsource 5.3.0, **320×568 y 375×667**, con el texto más largo
  real. La «y» se cuenta **desde la cima del Panel**.
- **[calculado]** lleva su fórmula; **[supuesto]** lleva parada de medición.
- **Capturas (320, media escala):** `a1_miralo_factura_320_media.png` (pantalla Míralo) y
  `a1_parada_fila3_320_media.png` (una parada con sus tres opciones en fila).

---

## 1 · Lo que la réplica le corrige al patrón

### 1.1 Las paradas de medición de `aprender-secuencia-v1` §12 que cierro

| # | Lo que decía | Medido a 320×568 | A 375×667 | Veredicto |
|---|---|---|---|---|
| 1 | Cabecera de la vista = 124 [supuesto]; si pasa de 140, detenerse | **126** | **128** | **Pasa.** La cuenta de §4 sigue en pie |
| 2 | Bloque pegado = 68 [supuesto: 44 + 2×12]; si pasa de 76, avisar | **69** | **69** | **Pasa.** Es 69 por el borde superior de 1 px, no 68 |
| 4 | Titular de 54 caracteres en 2 líneas [supuesto] | ver abajo | — | **Corregida** |
| — | Ancho útil 258 / 313 [calculado] | **258** | **313** | **Confirmado** |

**La parada 4 no es un límite de caracteres.** A 320, en 258 px y con Sora 17/700, medí titulares
reales: 56 caracteres caben en dos renglones y 55 se van a tres, según dónde caiga el corte de
palabra. Lo que hay que fijar es el **número de renglones**, no el de caracteres:
**el titular reserva 44,2 px (dos renglones) y no puede pasar de ahí**. Tope seguro sin comprobar:
**48 caracteres**; entre 49 y 56 lo compruebo yo, uno por uno.

### 1.2 Lo que la cuenta del alto de §4 no contaba

Tres cosas que están en la vista de hoy y que la cuenta de §4 no incluye, más una que regala sitio:

| Qué | Cuánto [fuente, réplica] | Qué hago |
|---|---|---|
| El `Panel` de una pieza trae hoy rótulo **y** título (`CuatroCapas` llama a `Panel rotulo titulo`) | **50,8** | **La secuencia va sin cabecera de Panel.** El título de la pieza es el titular de la pantalla 1 (§16b) y la cejilla de fase ocupa el sitio del rótulo |
| La reserva de la ficha de FP (`paddingBottom: 84`, rama Aprender) | **84** | **La secuencia no la lleva:** existía para un scroll largo de 19 piezas apiladas, y aquí se ve una pantalla a la vez. ⛔ La parada 3 de §12 sigue en pie: quien construya comprueba que la ficha de FP no tape el bloque pegado |
| «PIEZA k DE N» como línea propia, en ámbar | **25** | **Se fusiona en la fila de progreso**, a la derecha del contador, en Inter 12 #A8B6C8. Mata de paso la deuda del ámbar (§13) |
| `FondoMateria` usa hoy **`overflow-x: clip`**, no `overflow: hidden` | — | **`position: sticky` vuelve a pegar.** El bloque pegado va `position: sticky; bottom: 0` y **no** el modo fijo-por-script. El comentario de `CuatroCapas.jsx`:149-152 quedó viejo |

Que el bloque pegado sea `sticky` cambia la cuenta: **sus 69 px no son alto de contenido que
empuje nada por debajo del pliegue**, son una banda que siempre está a la vista. Por eso, de aquí
en adelante, el desplazamiento que cuento es `alto del documento − ventana − 69`.

### 1.3 El tope de figura de §16a (220 px a 320) y el apoyo no caben a la vez

Alto del documento a 320×568, y el desplazamiento real una vez descontado el bloque pegado
[fuente, réplica]:

| Figura | Apoyo | Alto del documento | Desplazamiento real | §4 permite 40 |
|---|---|---|---|---|
| 220 | 2 renglones | 664 | **27** | ✓ |
| 220 | 3 renglones (18 palabras) | 686 | **49** | ✗ |
| 220 | 5 renglones (23 palabras) | 730 | **93** | ✗ |
| **184** | 2 renglones | **628** | **0** | ✓ |
| **184** | 3 renglones | **650** | **13** | ✓ |
| 184 | titular de 3 renglones + apoyo de 4 | 694 | **57** | ✗ |

A 375×667 las seis caben sin desplazar (667 = ventana) [fuente, réplica].

**Lo que dice la tabla:** a 320×568 el tope de 220 se sostiene **solo** si el apoyo cabe en dos
renglones; figura grande y apoyo de verdad no caben a la vez. Elijo **184** porque es lo que pide
la forma más alta de T1 —la factura, 144 medidos— y deja los tres renglones de apoyo con 13 px de
margen. Cada 20 px de figura de más cuestan 20 px de desplazamiento, y cada renglón de apoyo, 22.

**Nota para Ukyo y Miku:** §4 calculaba 150 px de figura y acertaba de sobra; lo que hay que leer
con cuidado es el tope de 220 de la respuesta (a) a Hanayama, que a 320×568 no deja sitio para el
apoyo. De 375 para arriba no hay problema.

---

## 2 · El marco único de las cuatro piezas de T1

Zona por zona, de arriba abajo, dentro del `Panel` y **sin cabecera de Panel** [fuente, réplica]:

| Zona | Qué lleva | Alto a 320 | Alto a 375 |
|---|---|---|---|
| Progreso | «Pantalla n de N» a la izquierda · «Pieza k de 4» a la derecha, Inter 12/16 #A8B6C8 | 16 | 16 |
| Cejilla | el nombre de la fase, Inter 12 #A8B6C8, ni teal ni ámbar | 20 | 20 |
| Titular | Sora 17/700 #F8F9FA, **2 renglones como tope** | 44,2 | 22,1 o 44,2 |
| **Figura** | `<figure>`: el riel de la pieza + el escenario | **184** | **184** |
| Apoyo | Inter 14/22 al 80 %, **3 renglones como tope** | ≤ 66 | ≤ 66 |
| Razón o paso | «Paso n de N», la razón por la que «Siguiente» espera, o el pie del libro | 16 | 16 |
| Navegación | «Anterior» · «Siguiente», `BOTON_NAV`, bloque pegado `sticky` | 69 | 69 |

- **La reserva de la figura es la misma en las cuatro piezas y en los dos anchos: 184 px**
  (riel 30 + hueco 10 + escenario 144). Es la misma a 320 y a 375 porque las formas de esta pieza
  son listas: su alto no depende del ancho [fuente, réplica].
- **Los Pulsos no se dibujan en T1.** El riel de la pieza ya es una fila de nodos unidos por un
  trazo, y dos filas de nodos a la vez se leen como dos avances distintos. El contador dice lo
  mismo que dirían los Pulsos, y el riel dice más. **Regla de colisión, para el patrón: cuando la
  figura de una pieza ya es una cadena de nodos, los Pulsos se omiten.**
- **El riel va dentro del `<figure>`**, no en la zona de progreso: en la última pantalla la vuelta
  encendida **es** el argumento de la pieza. Va `aria-hidden`; lo que dice lo dice el titular.

**Las formas publicadas, medidas dentro del escenario de 144 [fuente, réplica]:**
el hecho **76,3** · el renglón **83** · la pregunta en la mesa **82,5** · la factura de 6 campos
**144** · el balance de 7 renglones **178** ✗ · **el balance de 4 renglones con el pie «y 3 líneas
más» 142** ✓. La factura es la que fija la reserva.

### 2.1 Reglas de forma que salen de las medidas

1. **Titular: 2 renglones, 48 caracteres sin comprobar** (§1.1).
2. **Apoyo: 3 renglones, ≈18 palabras a 320.** Cada renglón cuesta 22 px; con 23 palabras son 5
   renglones y la pantalla se pasa de los 40 px. El patrón pone 25 palabras como objetivo: a 320
   esas 25 solo caben si la figura baja a 100.
3. **Las opciones de una parada van en FILA, no en columna.** Tres botones apilados de 44 suman
   144 px: a 320 la tercera opción **nace detrás del bloque pegado** y la pantalla se va 93 px por
   debajo del pliegue. En fila de tres (80 px por columna) el bloque mide **54** y nada queda
   tapado: el último botón termina a 464, con el bloque pegado empezando a 499
   [fuente, réplica]. Rótulos de **hasta 20 caracteres**; si alguno pasa, se mide otra vez.
4. **El estado correcto se pinta siempre, también al errar** (el registro), como en los Hacer.
   En Aprender **nunca** «Iba aquí» ni «Comprobar»: primer error → pista de ≤ 20 palabras en la
   razón; segundo → el estado correcto con su porqué y «Siguiente» se libera (C2 de `enganche.md`).
5. **El balance de la estación 4 se pinta con 4 renglones y un pie «y 3 líneas más».** Con los 7
   se sale de la reserva. El pie dice lo que la pantalla quiere decir —«ya no está solo»— mejor que
   la lista entera. Los cuatro renglones los elige Futaba; uno es el del computador.

---

## 3 · cu0-a1 · El recorrido de un hecho

### 3.1 El corte: 17 pantallas no caben en una pieza

El patrón manda de 4 a 10 pantallas. Futaba entregó 17 ideas. Fusionando lo que de verdad son
**pasos** —los tres grupos de nombres, los dos de adentro y afuera— quedan 12: siguen siendo dos
de más, y las dos que sobran no se pueden fusionar sin un titular con «y» (cada estación del ciclo
es una idea, y el patrón falla si el titular necesita una «y» para decirse).

**Decido cortar donde el hilo ya cierra una vuelta,** sin mover nada de orden y sin tocar el id
publicado:

- **`cu0-a1` (id publicado) · «El recorrido de un hecho» · 10 pantallas** = las de Futaba 1 a 14.
- **Pieza nueva · «Ocho leen lo mismo» · 4 pantallas** = la 15 partida en dos (los tres de adentro
  y los cinco de afuera, que ya vienen marcados con `tipo` en I:153-194), la 16 (la frase) y la 17
  (el puente). **No hay que escribir contenido nuevo** y la capa 4 publicada se queda con su
  pregunta, que es «qué hace la contabilidad». El id de la pieza nueva lo pone Kaede.

**Si Futaba prefiere una sola pieza,** son las mismas diez pantallas más dos fusiones (7+8 y
10+11), con dos titulares que cargan dos ideas. Ninguna medida de este archivo cambia. Que lo diga
con una palabra; el lote no se detiene por esto.

### 3.2 Pantalla por pantalla

Fases: A = apertura · D = desarrollo · C = cierre. «F n» es la pantalla n de la ficha de Futaba.

| # | F | Fase | Tipo | La figura (dentro de los 184) | Qué hace el estudiante | Bloquea «Siguiente» |
|---|---|---|---|---|---|---|
| 1 | F1+F2 | A | **Haz** (sin calificar) | la vía del riel **sin nodos**, tenue, y la libreta en el escenario | predice en fila de tres: «Uno» · «Tres» · «Cinco» | sí, hasta predecir |
| 2 | F3 | A | **Míralo** | los cinco nodos apagados; la cita del libro con los siete verbos y el contador 0/7 | toca los siete verbos | no |
| 3 | F4+F5+F6 | D | **Míralo** (2 pasos) | la empresa, con los de adentro y los de afuera | toca «adentro» y toca «afuera»; cada grupo se enciende | no |
| 4 | F7 | D | **Míralo** | nodo 1 encendido; el hecho en su forma | toca la ficha: el hecho aparece en la estación 1 | no |
| 5 | F8 | D | **Míralo** | nodo 2; **la factura** (la forma más alta: 144) | toca la ficha: el hecho se vuelve papel | no |
| 6 | F9 | D | **Haz** | nodos 1-2 encendidos, el 3 con un signo de pregunta; la factura compacta | elige en fila de tres a dónde va el papel | sí, hasta responder |
| 7 | F10 | D | **Míralo** | nodo 3; el renglón del libro | toca la ficha: el papel se vuelve renglón | no |
| 8 | F11 | D | **Míralo** | nodo 4; el balance con 4 renglones y «y 3 líneas más» | toca la ficha: el renglón se vuelve una línea del informe | no |
| 9 | F12 | D | **Haz** | nodo 5 apagado y sin nombre; el informe sobre la mesa vacía | elige en fila de tres quién decide | sí, hasta responder |
| 10 | F13+F14 | **C** | Cierre (2 pasos) | los cinco nodos encendidos y **la vuelta sólida**; la pregunta en la mesa | «Siguiente» da el paso de la vuelta y después pasa de pieza | no |

- **La ficha se transforma al tocarla, no con «Siguiente».** Es lo que convierte las pantallas 4,
  5, 7 y 8 en Míralo: una reproducción que solo corre con «Siguiente» no lo es. El componente
  publicado ya hace la transformación por opacidad en 500 ms y ya espera a que termine; lo único
  que cambia es quién la dispara. **Con movimiento reducido, el paso lo da «Siguiente»** y la forma
  aparece en su estado final.
- **R10 en la pantalla 1:** la vía va **sin nodos**. Si los cinco nodos estuvieran dibujados, la
  predicción («¿cuántos pasos hay?») se contestaría contándolos. Los nodos entran como respuesta,
  con `scale(.6→1)` en 240 ms y 60 ms de retardo entre ellos.
- **Las estaciones no se nombran en el riel:** el nombre de la estación encendida **es el titular**
  de la pantalla. Así se cumple la regla de Futaba («cada estación muestra su nombre solo cuando
  se enciende») sin gastar un renglón de la figura, y el riel no necesita rótulos de 10 px.
- **Pantalla 10:** la razón lleva el pie «Basado en el libro, p. 6», una sola vez en la pieza
  (§16b). El botón dice «Siguiente pieza».
- ⛔ **Parada de medición mía, en el próximo lote:** el alto real de la cita con los siete verbos
  (pantalla 2) dentro del escenario de 144. Se pinta con el componente publicado `verbos.jsx`, que
  ya resuelve el toque dentro de la cita y se reutiliza sin cambios; **no lo medí**. Si pasa de
  144, el que crece es el escenario de toda la pieza, no el de esa pantalla.

### 3.3 Lo que le pido a Futaba (y por qué es corto)

1. **Rótulos cortos para las dos paradas** (pantallas 6 y 9), de hasta 20 caracteres, para que
   quepan en fila de tres: p. ej. «A los libros» · «Se guarda» · «Al Estado». Las devoluciones
   largas que ya escribió no cambian: salen después, en la razón.
2. **Diez titulares de 2 renglones** (48 caracteres sin comprobar, hasta 56 si me los pasa y los mido).
3. **Apoyos de 18 palabras como tope**, no de 25.
4. **Cuatro renglones del balance** para la pantalla 8, uno de ellos el del computador.
5. Partir su pantalla 15 en dos, por `tipo` (adentro / afuera). No hay texto nuevo.

---

## 4 · Estados (valen para las cuatro piezas)

| Estado | Qué se ve |
|---|---|
| primera vez | pantalla 1; «Anterior» apagado y su razón visible es el contador |
| foco | anillo de 2 px #F8F9FA separado 2 px; tras cada cambio el foco va al titular (`tabindex=-1`, `preventScroll`) |
| presionado | `scale(.97)` en 100 ms, vuelve en 160 |
| tocado sin respuesta (Haz) | la figura no cambia; «Siguiente» sigue apagado con su razón |
| acierto (Haz) | la figura con su consecuencia + pastilla ✓ «Correcto», borde 2 px #F8F9FA; **nunca teal ni ámbar** |
| error (Haz) | pastilla ✕ «No va aquí» coral, pista de ≤ 20 palabras en la razón; la figura dice la verdad |
| después del error | un reintento; al segundo error se muestra el estado correcto con su porqué y «Siguiente» se libera |
| con respuesta antes de comprobar · resumen · «Así se juega» | no aplican: en Aprender no hay «Comprobar» ni resumen |
| último ítem | cierre: «Siguiente pieza», «Ir a Hacer» o «Volver al tema» |
| movimiento reducido | §5 |
| 320 y 375 con el texto más largo | §2 |

## 5 · Movimiento

- **Entrada de pantalla, tres grupos:** cejilla + titular (0 ms), figura (80), apoyo + razón (160);
  280 ms cada uno, `opacity` y `translateX` de 16 / 24 / 12 px, con la curva
  `cubic-bezier(.3,.9,.4,1)`. Al retroceder, los tres entran juntos en 200 ms y sin desplazamiento.
- **Salida:** `opacity` 1→0 en 120 ms, sin desplazamiento. Un toque en «Siguiente» durante la
  transición la completa al instante.
- **Pasos dentro de una pantalla:** un grupo, 240 ms, `opacity` + 8 px.
- **La transformación de la ficha:** opacidad, 500 ms, como el componente publicado. No se desliza:
  desaparece donde estaba y aparece con otra forma.
- **La vuelta del cierre:** opacidad en 240 ms, una sola vez. Nada en bucle.
- **Con movimiento reducido:** todo al instante, los pasos los da «Siguiente», el foco se mueve igual.
- Solo `transform` y `opacity`. `overflow-x: clip` en la zona de pantalla, para que el
  desplazamiento de 24 px no cree desplazamiento horizontal a 320.

## 6 · Accesibilidad

- Cada pantalla: `role="group"`, `aria-roledescription="pantalla"`, nombre «Pantalla n de N: {titular}».
- El foco va al titular en cada cambio; **no** hay región viva por cambio de pantalla. Los pasos sí
  se anuncian en `aria-live="polite"`.
- El riel va `aria-hidden`; la figura es un `<figure>` con nombre accesible que **no contiene la
  respuesta** antes de responder (D9).
- «Siguiente» apagado usa `aria-disabled` y `aria-describedby` con la razón visible.
- Nada depende del color: la forma del nodo, la palabra de la pastilla y el pie del balance lo dicen.
- Estado en la pestaña con clave `tema/pieza/caso`; en las pantallas de varios ítems (§7 y §8), el
  ítem es el caso. Es posición de interfaz: no es dato de estudiantes y no sale del dispositivo.

---

## 7 · cu0-a2 · La ecuación contable — **cabe en 10, sin cortar**

Las 15 pantallas de Futaba caben en 10 porque sus tres pantallas de nombres (Activo, Pasivo,
Patrimonio) son **pasos** de la apertura, que es justo lo que el patrón pide, y sus cuatro casos
son cuatro pasos de una sola pantalla.

| # | F | Fase | Tipo | La figura | Qué hace el estudiante |
|---|---|---|---|---|---|
| 1 | F1 | A | **Haz** (sin calificar) | la torre de tres bloques, sin rótulos | predice en fila de tres quién la puso |
| 2 | F2+F3+F4 | A | **Míralo** (3 pasos) | la torre; cada paso rotula un tramo | toca cada tramo: activo, pasivo, patrimonio |
| 3 | F5 | D | **Míralo** | la ecuación armada con esos rótulos | toca un rótulo y se resalta su tramo |
| 4 | F6 | D | **Míralo** | los dos lados, con la cita del libro | toca cada lado |
| 5 | F7+F8+F9+F10 | D | **Míralo** (3 pasos) | la misma torre leída por la izquierda, por la derecha y a la misma altura | toca cada lectura; al final, «dos veces» |
| 6 | F11 | D | **Haz** | el bloque nuevo esperando encima y el tramo «del vendedor» | elige en fila de tres qué le pasa a la torre |
| 7 | F12 | D | **Haz** (4 pasos) | un hecho de Caleja por paso; al responder, la torre se mueve y aparece el nombre del caso | predice en los cuatro: cal-3, cal-5, cal-4 y cal-6 |
| 8 | F13 | D | **Míralo** | las tres flechas ↑↑ ↓↓ == | toca cada una y la torre lo hace |
| 9 | F14 | D | **Haz** | la torre en su estado final y las cuatro frases | elige la frase |
| 10 | F15 | **C** | Cierre | la torre con el reloj de un día | «Siguiente pieza» |

- **La pantalla 7 es el único sitio de la pieza con varios casos:** la figura acumula, así que se
  juega sobre un solo recorrido (D2) y la clave de estado lleva el caso.
- **R10:** en la pantalla 1 la torre va **sin rótulos y sin la línea que parte los tramos**; si se
  viera el corte, la predicción («¿quién puso todo esto?») se contestaría mirando.
- ⛔ **Parada de medición mía:** el alto de la torre con sus rótulos dentro del escenario de 144.
  `Torre.jsx` publica bloques de 34 px de alto; tres bloques con rótulos y la línea de igualdad
  pueden pasarse. **Si se pasa, la reserva de las cuatro piezas sube a lo que mida la torre, y hay
  que volver a medir el desplazamiento a 320×568** (§1.3: cada 20 px de figura cuestan 20 de
  desplazamiento, y hoy sobran 40).

## 8 · cu0-a3 y cu0-a4 — **caben en 10 las dos**

### 8.1 cu0-a3 · La foto y la película (18 → 10)

| # | F | Fase | Tipo | La figura | Qué hace el estudiante |
|---|---|---|---|---|---|
| 1 | F1 | A | **Haz** (sin calificar) | una sola foto de la empresa | predice: ¿basta un día? |
| 2 | F2+F3 | A | **Míralo** (2 pasos) | los dos informes, con sus citas | toca cada uno |
| 3 | F4+F5 | D | **Míralo** (2 pasos) | la cámara y la cinta; el paso 2 saca las tres tarjetas en gris | toca los apodos |
| 4 | F6+F7 | D | **Míralo** (2 pasos) | la línea del año vacía; el paso toma la foto del 1 de enero | toca la línea |
| 5 | F8 | D | **Haz** | el hueco de la segunda foto, del mismo tamaño | elige en fila de tres |
| 6 | F9+F10 | D | **Míralo** (2 pasos) | la foto del 31 y el tramo que se llena | toca cada punta |
| 7 | F11 | D | **Míralo** | las dos fotos y el tramo juntos | repite el recorrido |
| 8 | F12-F16 | D | **Haz** (5 pasos) | la pregunta y las tres respuestas fijas; la escena cambia con lo elegido | responde q1 a q5, un paso por pregunta |
| 9 | F17 | D | **Haz** | las cuatro frases | elige la frase |
| 10 | F18 | **C** | Cierre | la foto, la película y la tercera tarjeta que se enciende | «Siguiente pieza» |

Los rótulos de la pantalla 8 son los tres fijos de H1 —«Una foto» · «La película: todo el año» ·
«Comparar las dos fotos»—, y van en fila de tres: medidos, caben sin cortarse.

### 8.2 cu0-a4 · Cómo se articulan (13 → 10)

| # | F | Fase | Tipo | La figura | Qué hace el estudiante |
|---|---|---|---|---|---|
| 1 | F1 | A | **Haz** (sin calificar) | los tres informes separados, sin flechas | predice: ¿se pasan cifras? |
| 2 | F2 | A | **Míralo** | el tercer informe con su cita | toca el informe |
| 3 | F3 | D | **Míralo** (3 pasos) | los tres carriles: operación, inversión, financiación | toca cada carril |
| 4 | F4+F5 | D | **Míralo** (2 pasos) | dos informes y una flecha; después los tres con sus líneas | toca la flecha |
| 5 | F6 | D | **Haz** | la utilidad neta resaltada, sin flecha | elige en fila de tres a dónde llega |
| 6 | F7+F8 | D | **Míralo** (2 pasos) | f1 y f2, cada una con su nota | toca cada flecha |
| 7 | F9+F10 | D | **Míralo** (2 pasos) | f3, f4 y f5; después las cinco a la vez | toca cada una |
| 8 | F11 | D | **Haz** (4 pasos) | las cinco flechas; al tocar una queda sola | clasifica f2 a f5 en «repite» o «explica» |
| 9 | F12 | D | **Haz** | las cinco flechas y las cuatro frases | elige la frase |
| 10 | F13 | **C** | Cierre | las cuatro figuras del tema en miniatura | **«Ir a Hacer»** |

- **f1 no se pregunta** en la pantalla 8: la contradicción que Futaba escaló a Miku (lo publicado
  la trata como «explica» y la nota dice que es la misma cifra) sigue abierta. La flecha se ve,
  pero no entra en la prueba.
- ⛔ **Parada del patrón que toca avisar** (§2 de `aprender-secuencia-v1`): el botón **«Ir a Hacer»**
  de la última pantalla del tema toca el camino y la tarjeta del tema, que son compartidos.
  **Va a Erwin y a Miku**, no lo construye la célula sola.
- ⛔ **Parada de medición mía:** los tres informes con cinco flechas son la figura más alta de las
  cuatro piezas y **no la medí**. Si pasa de 144 dentro del escenario, esta pieza —y solo esta—
  necesita una reserva propia, y eso rompe «la misma reserva para las cuatro». Lo mido en el
  próximo lote, con `TresInformes.jsx` y `ComoSeArticulan.jsx` armados en la réplica.

---

## 9 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Panel **sin rótulo y sin título** en la secuencia; «Pieza k de N» en la fila de progreso, en neutro | Indispensable (la cuenta del alto no cierra con los 50,8) |
| 2 | Bloque pegado `position: sticky; bottom: 0`, no el modo fijo-por-script | Me pasa el alto real y lo vuelvo a medir |
| 3 | Reserva de figura **184** en las cuatro piezas, a 320 y a 375 | Indispensable |
| 4 | Sin la reserva de 84 de la ficha de FP; comprobar que la ficha no tape el bloque pegado | Parada de medición |
| 5 | Las opciones de una parada, **en fila**, nunca apiladas | Indispensable (a 320 la tercera nace tapada) |
| 6 | La ficha se transforma **al tocarla**; con movimiento reducido, con «Siguiente» | Indispensable (si no, no son Míralo y B3 no pasa) |
| 7 | Pantalla 1 de cu0-a1 y de cu0-a2: la figura **sin** lo que contesta la predicción | Indispensable (R10) |
| 8 | Sin Pulsos en T1: el riel ocupa su sitio | — |
| 9 | `SecuenciaAprender` es componente nuevo y **no se construye modificando `CuatroCapas`** (lo usan 9 vistas, entre ellas Macroeconomía, congelada) | Indispensable (parada 1 de §2 del patrón) |
