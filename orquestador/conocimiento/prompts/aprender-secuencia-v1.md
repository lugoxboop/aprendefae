# Aprender como secuencia de pantallas — patrón único (v1)

23-oct-2026 · Ukyo (diseño gráfico, landing pages y UI) · orden de Mateo vía Miku.
Es una ESPECIFICACIÓN, no código. La aplican las cinco células sin volver a preguntar.
Complementa `disenadores-de-celula-v1.md` §3: las cuatro capas siguen siendo el
**contenido** de una pieza de Aprender; este archivo define su **forma**.

Origen de cada cifra: **[fuente]** leído en el código de `main` hoy · **[calculado]**
con su fórmula · **[supuesto]** nadie lo ha medido y lleva parada de medición (§12).

## 0. Qué se decide

1. Una pieza de Aprender deja de ser una página que se baja y pasa a ser una
   **secuencia de 4 a 10 pantallas**. Se ve UNA a la vez, con una idea por pantalla.
2. Las cuatro capas no desaparecen: son las tres fases de la secuencia
   (apertura, desarrollo, cierre).
3. «Siguiente» hace primero el siguiente **paso** de la pantalla y solo después pasa a
   la pantalla siguiente. «Anterior» vuelve sin deshacer nada.
4. Movimiento: la curva de la casa, entrada escalonada de la pantalla y nada en bucle.
   **Parallax: descartado** (§8.5).
5. Hay cuatro tipos de pantalla y solo cuatro (§3.2).
6. Se mide con la sonda B1–B5 tal como está (§11). No se inventa otra barra.

## 1. LA ENTREGA FALLA SI…

- Una pantalla es de puro texto, o solo se avanza con «Siguiente» (un video con botón).
- Menos de la mitad de las pantallas de una pieza son de tipo Míralo o Haz (B3).
- Una pantalla tiene más de una idea: su titular necesita una «y» para decirse.
- Los titulares, leídos en orden y sin el resto, no cuentan la pieza (prueba del hilo, §3.4).
- Aparece una curva distinta de `cubic-bezier(.3,.9,.4,1)`, o `ease`, o `linear`.
- Se anima algo que no sea `transform` u `opacity`, o algo nuevo queda en bucle.
- Falta la versión de movimiento reducido de cualquier animación.
- La figura empieza a más de 280 px del tope de la tarjeta a 320 px, o hay más de 40
  palabras antes de ella, o más de 60 en la pantalla (B1, B2).
- Se usa parallax, un deslizamiento lateral con el dedo para avanzar, o un color fuera
  de su rol (la barra de progreso en Contabilidad no es teal).
- Una cifra de esta especificación se usa sin su origen.

## 2. Qué se reutiliza, qué es nuevo, qué es parada

**PUBLICADO (se reutiliza tal cual; verificado en el código hoy):**

| Pieza | Dónde | Se reutiliza |
|---|---|---|
| Curva | 66 apariciones de `cubic-bezier(.3,.9,.4,1)` en 44 archivos de `src` [fuente, grep del 23-oct] | la única curva |
| Botones Anterior / Siguiente | `BOTON_NAV` de `CuatroCapas.jsx` (píldora 44 px, Sora 14/600; Siguiente relleno #B8C4D4 con texto navy) | tal cual |
| Bloque pegado abajo | modo B de `MaquinaPegada` (usado por la capa 1 paginada) | el mismo mecanismo |
| Forma del punto de progreso | `Punto`: actual 12 px con anillo · visto relleno · sin ver contorno; color `FAE.node` | la misma gramática, ahora sin toque (§7) |
| Foco al cambiar | foco al título, `preventScroll`, reintento en dos cuadros si la hoja de movimiento reducido lo oculta | tal cual |
| Detector | `conMovimientoReducido()` | tal cual |
| Superficie | `Panel` (#1C2939 a #1F2D3D) | sin tarjeta propia |
| Paso primero | `presentacion/Presentacion.jsx`: la escena guarda su estado en el contenedor, «Siguiente» da primero el paso pendiente, «Anterior» no deshace | la misma gramática (§5) |

**NUEVO (aún no existe):** el contenedor de la secuencia (nombre propuesto
`SecuenciaAprender`), la cejilla de fase, la línea de paso/razón, el contador
«Pantalla n de N» como único contador de la pieza y los tres literales de §5.3.

**⛔ PARADAS (las avisa quien construya, a Miku y a Erwin):**
1. `SecuenciaAprender` es un componente compartido nuevo. **No se construye
   modificando `CuatroCapas`**: lo usan 9 vistas, entre ellas `PoliticaMonetariaView`
   (Macroeconomía, congelada). Si el código decide alojarla dentro de `CuatroCapas`, exige la
   prueba de 0 px de diferencia en Macroeconomía.
2. La última pantalla del último tema toca el camino y la tarjeta del tema (compartidos): §5.3.
3. Reestructurar `IntroContabilidadView` (hoy apila 19 piezas con 40 px entre ellas) es de la Célula A.
4. Quién segmenta una pieza en pantallas («una idea») es el agente **pedagógico**; diseño solo
   fija la geometría. Los titulares, apoyos y razones los escribe el agente de **contenido**.

## 3. Estructura de una pieza

### 3.1 Apertura, desarrollo, cierre

| Fase | Capa del canon | Pantallas | Qué ve el estudiante |
|---|---|---|---|
| Apertura | 1 · «Primero, los nombres» | 1 o 2 | la situación ya dibujada y la pregunta que la pieza responde; los nombres entran como rótulos sobre la figura, uno por **paso** |
| Desarrollo | 2 · «Mírelo funcionar» y 3 · «Ahora pruebe usted» | 2 a 7 | una relación causa→efecto por pantalla; al final, al menos una pantalla Haz |
| Cierre | 4 · «En una frase» | 1 | el modelo en su estado final y la frase pegada a él |

Total: mínimo 4 pantallas, máximo 10 (14 es el tope de los Pulsos del kit; a 10 los
nodos aún caben: 258 px ÷ 10 = 25 px por nodo [calculado]). Si la pieza pide más, se parte
en dos piezas. Un término por pantalla ya no existe: los nombres son pasos dentro de la
pantalla de apertura, máximo 5. Si hay más de 5, se parte la pieza.

Los nombres de fase salen de `CuatroCapas` y se conservan literales: «Primero, los
nombres», «Mírelo funcionar», «Ahora pruebe usted», «En una frase». No se numeran («CAPA n» desaparece).

### 3.2 Los cuatro tipos de pantalla (lista cerrada)

| Tipo | Qué hace el estudiante | Cuenta para B3 | Bloquea «Siguiente» |
|---|---|---|---|
| **Apertura** | nada obligatorio; la figura se arma sola UNA vez al llegar («mira esto») | no | no |
| **Míralo** | **elige qué ver** (toca un hecho, una parte, un año, mueve un control) y la figura responde con movimiento real. Una reproducción que solo corre con «Siguiente» no es Míralo | sí | no |
| **Haz** | opera la figura; la figura responde con su consecuencia | sí | sí, hasta la primera respuesta válida |
| **Cierre** | nada obligatorio; la frase queda pegada al modelo | no | no |

Al menos la mitad de las pantallas son Míralo o Haz (B3 [fuente: `enganche.md`]).
En Haz con elección calificada: primer error → pista de 20 palabras como máximo; segundo
error → el estado correcto en la figura con su porqué y se libera «Siguiente» (regla C2 de
`enganche.md`). En Aprender **nunca** «Iba aquí» ni «Comprobar». Si hay pastilla, los literales
son los publicados: «Correcto» / «No va aquí».

### 3.3 Una pantalla = una idea

Titular de máximo 10 palabras y 54 caracteres [supuesto: 258 px ÷ ≈9,4 px por carácter de
Sora 700 a 17 px × 2 líneas; parada de medición §12]. Apoyo de máximo 25 palabras (objetivo) y
60 en toda la pantalla (tope B2). Lo que no cabe va en otra pantalla o lo dice la figura.

### 3.4 Prueba del hilo

Tapa todo menos los titulares y léelos en orden. Tienen que contar la pieza como una cadena
(situación → por qué importa → cómo funciona → qué pasa si cambia → qué te llevas). El
agente de auditoría la corre en cada pieza. Una pantalla cuyo titular no se deduce del
anterior o no prepara el siguiente rompe el hilo.

### 3.5 Tema, pieza, pantalla

Un tema de Aprender es una fila de piezas. «Pieza k de N» va en 12 px #A8B6C8, **no en
ámbar** (el ámbar de `IntroContabilidadView` hoy es decorativo: deuda, §13). La pieza
siguiente se abre desde «Siguiente pieza» (§5.3). «Anterior» desde la primera pantalla de una
pieza vuelve al cierre de la anterior. No hay índice de piezas en v1.

## 4. Anatomía de una pantalla y medidas

De arriba abajo, dentro del `Panel`, sin tarjeta propia:

| Zona | Contenido | Estilo | Alto a 320×568 |
|---|---|---|---|
| Progreso | «Pantalla n de N» + Pulsos (§7) | Inter 12/16 #A8B6C8 · nodos `FAE.node` | 28 [calculado: 16 de texto + 12 del nodo mayor] |
| Cejilla | nombre de la fase | Inter 12, #A8B6C8, **no teal ni ámbar** | 16 |
| Titular | la idea, una frase | Sora 17/700 #F8F9FA, máx. 2 líneas | 44 |
| Figura | `<figure>` con la interacción | ver abajo | 150 |
| Apoyo | 1 o 2 frases | Inter 14/22, cuerpo al 80 % | ≤ 66 (3 líneas) |
| Razón o paso | «Paso n de N» o la razón por la que «Siguiente» espera | Inter 12/16 #A8B6C8 | 16 |
| Navegación | Anterior · Siguiente (bloque pegado) | `BOTON_NAV`, 44 px | 68 [calculado: 44 + 2×12 de relleno, supuesto] |

**Ancho útil:** 258 px a 320 y 313 px a 375 [calculado desde el código: 320 − 2×16 (relleno de
página `clamp(16px,2vw,24px)`, `IntroContabilidadView`) − 2×14 (relleno del Panel
`clamp(14px,2.2vw,20px)`, `marco.jsx`) − 2 (bordes) = 258; 375 − 32 − 28 − 2 = 313]. Coincide con
lo que midió Sai para Hacer el 13-oct [pantalla].

**Alto de la figura:** 150 px a 320×568 y 200 px a 375×667. La reserva es la misma en TODAS las
pantallas de una pieza (la figura no cambia el alto al avanzar: regla D5 de `enganche.md`).

**Cuenta del alto a 320×568** [calculado sobre un supuesto]: zona libre = 568 − 124 (cabecera de
la vista, **supuesto**) − 68 (navegación) = 376. Contenido: 28 (relleno del Panel) + 28 + 16 + 4 +
44 + 12 + 150 + 12 + 66 + 8 + 16 = 384. Sobra 8 px en el peor caso. A 375×667: zona = 475;
contenido con figura de 200 = 434; quedan 41 px.

**Regla de desborde:** a 375×667 la pantalla cabe sin desplazar. A 320×568 con el texto más largo
real puede desplazarse como mucho **40 px**, y siempre el apoyo, nunca la figura ni su primer
control (B1). Si pasa de 40, la pantalla se parte en dos.

**Figura:** primer elemento visible dentro de los primeros 280 px del tope del Panel; lo anterior
son 13 palabras como máximo (cejilla + titular). Todo control de la figura mide 44 px o más con 8 px
entre ellos. Lo que cambia al responder queda entre lo tocado y «Siguiente» (E2 y D10). Va en un
`<figure>` con nombre accesible.

**Escritorio (≥ 760 px):** misma secuencia, centrada, contenedor máximo 860 px; la figura sube a
un máximo de 320 px; la navegación va pegada al borde inferior del Panel, no de la ventana.

## 5. Avanzar y retroceder

### 5.1 Siguiente

1. Si la pantalla tiene un paso pendiente (revelar un nombre, resaltar una parte), «Siguiente»
   da ese paso, anuncia «Paso n de N» y el botón sigue diciendo «Siguiente».
2. Si no quedan pasos, pasa a la pantalla siguiente.
3. En una pantalla Haz sin respuesta válida, «Siguiente» está apagado con `aria-disabled`, y la
   razón visible está en la línea de razón (la escribe contenido). Nunca queda apagado sin razón (D11).

### 5.2 Anterior

Vuelve a la pantalla anterior y **no deshace nada**: lo revelado, lo operado y lo respondido
siguen como estaban. El estado de la pieza vive en el contenedor, no dentro de la pantalla.
En la primera pantalla de la primera pieza está apagado y su razón visible es el contador
«Pantalla 1 de N». Una pantalla Haz ya resuelta no se vuelve a bloquear.

El estado (pieza, pantalla, pasos, resueltas) se guarda en la pestaña con una clave por tema, pieza **y caso** (`tema/pieza/caso`; D8, caso B), como `Presentacion.jsx` más el caso. Un caso nuevo arranca limpio; volver al anterior lo encuentra como lo dejó. Es solo posición de interfaz: no es dato de estudiantes ni sale
del dispositivo.

### 5.3 Literales de los botones

| Botón | Cuándo | Literal | Lista |
|---|---|---|---|
| Anterior | siempre | «Anterior» | PUBLICADO |
| Siguiente | pantallas y pasos | «Siguiente» | PUBLICADO |
| Pasar de pieza | último cierre, quedan piezas | «Siguiente pieza» | NUEVO |
| Ir a Hacer | último cierre del tema con Hacer | «Ir a Hacer» | NUEVO ⛔ toca camino/tarjeta |
| Volver | último cierre de un tema sin Hacer | «Volver al tema» | NUEVO |

### 5.4 Cómo NO se avanza

**Sin deslizar el dedo.** Las figuras arrastran fichas y controles y el deslizamiento lateral
chocaría con ellas. Teclado: las flechas ← → avanzan y retroceden **solo cuando el foco está en
el titular de la pantalla** (donde cae tras cada cambio); con el foco en un control de la figura
las flechas son del control.

## 6. Interacción: dónde entra

- La interacción **es** el desarrollo: la mitad o más de las pantallas (§3.2). No hay diapositivas
  pasivas: lo que la figura hace tiene que ser consecuencia de lo que el estudiante eligió.
- El estudiante ve el efecto en la misma pantalla, entre lo que tocó y «Siguiente». Sin saltos de página.
- La figura nunca guarda un estado falso tras un error (D3). La que acumula (saldo, kárdex) se
  juega sobre un solo caso (D2).
- La figura muestra insumos y consecuencias, no la cifra que luego se pregunta (E8).
- No filtres la respuesta con el diseño: la opción correcta no tiene otra forma, color,
  posición ni etiqueta que las demás.
- Una tabla es una tabla con filas y columnas reales que se llenan; toda cifra lleva su rótulo.

## 7. Progreso

- **Dentro de la pieza:** contador «Pantalla n de N» (12 px, #A8B6C8) y los **Pulsos** del kit:
  N nodos unidos por un trazo, en `FAE.node` #CBDCF2 dentro de Contabilidad y en teal fuera.
  La **forma** dice el estado (actual más grande y con anillo, visto relleno, sin ver contorno).
  Son solo de lectura: **no se tocan** (el avance es con los botones, que sí miden 44 px). Van
  `aria-hidden`: el contador dice lo mismo.
- **Dentro de la pantalla:** «Paso n de N» solo cuando hay pasos pendientes (sustantivo
  reservado para pasos dentro de un caso, §4.3 de `disenadores-de-celula-v1.md`).
- **Dentro del tema:** «Pieza k de N» en neutro (§3.5).
- Un solo contador por nivel; ningún sustantivo se repite en dos niveles.

## 8. Movimiento (UX in Motion, Issara Willenskomer)

Willenskomer define los principios sin dar valores de duración ni de retardo: **todos los
números de esta sección son decisión de diseño [supuesto] con su parada de medición** (§12), no
cifras suyas.

### 8.1 Easing

Una sola curva para todo: `cubic-bezier(.3,.9,.4,1)` (66 usos, §2). Entrada y salida usan la
misma: la salida solo es más corta y sin desplazamiento, así no se introduce una curva de
aceleración nueva. Prohibidas: `linear`, `ease` (la capa 1 paginada actual usa `opacity 200ms
ease`: deuda, §13) y las otras 9 variantes de curva que hay en el código.

### 8.2 Offset & delay: entrada escalonada de una pantalla

Willenskomer: lo que se mueve junto se lee como un grupo; lo que se mueve con retardo, como
elementos separados. Por eso hay **tres grupos** y no un retardo por elemento.

| Grupo | Elementos | Retardo | Duración | Desplazamiento (eje X) |
|---|---|---|---|---|
| 1 | cejilla + titular | 0 ms | 280 ms | 16 px |
| 2 | figura | 80 ms | 280 ms | 24 px |
| 3 | apoyo + razón | 160 ms | 280 ms | 12 px |

- Todo: `opacity` 0→1 y `transform: translateX`. Al **avanzar** viene de la derecha; al
  **retroceder**, de la izquierda y **sin escalonado**: los tres grupos entran juntos en 200 ms
  (volver es repasar, no ver algo nuevo).
- Salida de la pantalla anterior: `opacity` 1→0 en 120 ms, sin desplazamiento. Total máximo
  de un cambio al avanzar: 120 + 160 + 280 = 560 ms [calculado].
- Un toque en «Siguiente» durante la transición la completa al instante.
- **Pasos** dentro de una pantalla: un grupo, 240 ms, `opacity` + 8 px, sin escalonado.
- Controles de la figura que el estudiante opera: respuesta de su propia animación, no entra
  en este escalonado; toque pequeño, respuesta pequeña (Jonasson y Purho).
- Desbordes: la zona de pantalla lleva `overflow-x: clip` para que el desplazamiento de 24 px no
  cree desplazamiento horizontal a 320 px.

### 8.3 Los dos momentos grandes

- **Apertura («mira esto»):** terminado el escalonado, la figura corre UNA vez su animación de
  llegada, máximo 900 ms, solo `transform` y `opacity`. Al volver con «Anterior» la figura ya
  está asentada.
- **Cierre:** la frase entra al final (+240 ms) y la figura hace un solo pulso de escala
  1→1,03→1 en 400 ms.

### 8.4 Lo que se siente vivo, y nada más

1. Presionar un botón: `scale(.97)` en 100 ms; vuelve en 160 ms.
2. Un nodo de progreso nuevo entra con `scale(.6→1)` en 240 ms y su trazo con `scaleX(0→1)` en 200 ms.
3. Nada más. Nada nuevo en bucle (hay 124 líneas con `infinite` en `src`, algunas en comentarios
   [fuente]: no se copian).

### 8.5 Parallax: **DESCARTADO**

Dos razones, y la segunda es la que manda:
1. El Kit (dimensión 7, experiencia móvil, nivel Medio) exige que ninguna animación sea perceptiblemente más lenta en gama
   baja, «verificado en dispositivo real, no solo emulación». El parallax mueve capas con
   `transform` cuadro a cuadro; no puede superar esa prueba **sin un dispositivo real de gama
   baja, y no se ha medido en ninguno**. A 320 px no hay evidencia de que pase, así que no pasa.
2. Con una sola pantalla visible no hay scroll que mueva capas. Lo que daría profundidad es el
   desplazamiento distinto por grupo de §8.2 (24 / 16 / 12 px), que es un escalonado de una sola
   vez y no un movimiento continuo. **No es parallax y no se llama así.**

Se reabre solo con una medición en un dispositivo real de gama baja que la apruebe y solo en
≥ 760 px. No se especifica ahora.

### 8.6 Movimiento reducido

Con `prefers-reduced-motion: reduce`: el cambio de pantalla es instantáneo, sin escalonado, sin
desplazamiento y sin pulsos de escala; las figuras muestran su estado final por pasos
(«Siguiente» da cada paso); el foco se mueve igual. Los dos momentos grandes de §8.3 quedan
como estado final inmediato. La hoja global ya baja las transiciones a 0,01 ms [fuente:
comentario de `CuatroCapas.jsx`], así que el foco se reintenta como ya hace la capa 1 paginada.

### 8.7 Presupuesto de gama baja

Solo `transform` y `opacity`; nada de `filter`, sombras animadas ni propiedades de layout; como
máximo tres grupos y la figura animándose a la vez; `will-change` solo durante la transición y
retirado después.

## 9. Estados

Estados de la lista de `disenadores-de-celula-v1.md` §7; los que no aplican, dicen por qué.

| Estado | Qué pasa |
|---|---|
| vacío · abierto · tutorial saltado · resumen | no aplica (Aprender no tiene «Comprobar», resumen ni «Así se juega») |
| primera vez | pantalla 1, «Anterior» apagado con el contador como razón |
| foco | anillo de 2 px #F8F9FA separado 2 px; tras cada cambio el foco va al titular (`tabindex=-1`, `preventScroll`) |
| presionado | `scale(.97)` 100 ms |
| con respuesta antes de comprobar | no aplica (no hay «Comprobar») |
| tocado sin respuesta (Haz) | la figura no cambia; «Siguiente» sigue apagado y la razón visible |
| acierto (Haz calificado) | figura con su consecuencia + pastilla Check #F8F9FA «Correcto», borde 2 px #F8F9FA; nunca teal ni ámbar (B4) |
| error (Haz calificado) | pastilla X coral «No va aquí», borde 2 px coral, pista de ≤ 20 palabras; la figura dice la verdad (D3) |
| después del error | un reintento; al segundo error se muestra el estado correcto con su porqué y se libera «Siguiente» |
| bloqueado · deshabilitado | «Siguiente» en Haz sin respuesta; «Anterior» en la primera pantalla; los dos con razón visible |
| último ítem | cierre de la pieza: «Siguiente pieza», «Ir a Hacer» o «Volver al tema» (§5.3) |
| movimiento reducido | §8.6 |
| lector de pantalla | §10 |
| 320 y 375 con el texto más largo | §4 |

## 10. Accesibilidad

- Cada pantalla: `role="group"`, `aria-roledescription="pantalla"` y nombre «Pantalla n de N: {titular}».
- Al cambiar, el foco va al titular y el lector lo anuncia; **no** se añade una región viva por
  cambio de pantalla (sería doble anuncio).
- Los pasos sí se anuncian en `aria-live="polite"` («Paso n de N» y el rótulo revelado).
- Los Pulsos van `aria-hidden`; «Siguiente» apagado usa `aria-disabled` y `aria-describedby`
  con la razón; íconos decorativos `aria-hidden`.
- Ningún estado depende solo del color (la forma del nodo y la palabra de la pastilla lo dicen).
- Antes de responder, ni texto alternativo ni `aria-label` pueden contener la respuesta (D9).
- Texto de lectura mínimo 14 px; nada bajo 12 px; contraste 4,5:1 (valores del kit §6). La
  cejilla va a 12 px, no a los 10,5 de `CuatroCapas`.

## 11. Contrato con la sonda de enganche (`scripts/t4/sonda-enganche/`)

La sonda mide pieza + pantalla + gesto, y hoy da código 2 con `IntroContabilidadView` porque no
tiene pantallas (`enganche.md`). Esta forma lo resuelve si el contenedor pone:
- `data-pieza="<id de la pieza>"` en la raíz de la pieza y `data-pantalla="<n>"` (desde 1) en la pantalla visible;
- la figura en un `<figure>` visible, y la interacción en un control que no sea «Siguiente» ni «Anterior»;
- el veredicto de un Haz calificado en `data-mensaje="acierto|error"`.

Antes de construir, quien lo haga comprueba estos nombres contra `temas.json` y el README de la
sonda; si la sonda lee otros, **gana la sonda** y se corrige aquí. B1, B2, B3 y B5 salen medibles;
B4 aplica a las pastillas de Haz.

## 12. Paradas de medición (para Sai o quien construya)

1. **Cabecera de la vista = 124 px a 320×568** [supuesto]. Mídela. Si da más de 140, detente y
   avisa: la cuenta del §4 deja de cerrar.
2. **Alto del bloque pegado = 68 px** [supuesto: 44 + 2×12]. Mídelo. Si da más de 76, avisa.
3. **Ficha de FP:** mide dónde queda a 320×568 y 375×667 con el bloque pegado visible. Si se
   solapan con «Siguiente» o el titular, detente y avisa (es componente compartido).
4. **Titular de 54 caracteres en 2 líneas** [supuesto]: mide el titular más largo real a 17/700
   en 258 px. Si pasa de 2 líneas, el límite baja a lo que quepa.
5. **Duraciones de §8** [supuesto]: en un dispositivo real de gama baja, ninguna transición se
   percibe más lenta que en uno de gama alta. Si alguna lo hace, se acorta antes de publicar.
6. **Persistencia en la pestaña:** comprueba que recargar a mitad de pieza vuelve a la misma
   pantalla con lo hecho, y que nada de esto se envía a la base de datos.

## 13. Deuda encontrada mientras se escribía esto (no la copies)

- `CuatroCapas.jsx`: la cejilla «CAPA n — …» va en teal #2A9D8F a 11 px; en Contabilidad el teal es solo Debe y 11 px queda bajo el mínimo de 12.
- `CuatroCapas.jsx`: la capa 1 paginada anima con `opacity 200ms ease`, no con la curva de la casa.
- `IntroContabilidadView.jsx`: «PIEZA k DE N» en ámbar (`FAE.ambar`), que no es ninguno de los tres roles cerrados.
- `CuatroCapas.jsx`: dos contadores distintos para lo mismo («Término N de M» en capa 1 y la pieza «PIEZA k DE N»).
- El encabezado de `CuatroCapas.jsx` dice que la capa 3 es «exploración libre, sin calificar»;
  `disenadores-de-celula-v1.md` §3 dice que el modelo responde con el feedback único. Esta
  especificación sigue a `disenadores-de-celula-v1.md`.
- `disenadores-de-celula-v1.md` §6 dice que la curva se usa 22 veces y hay 116 animaciones
  infinitas; en `main` hoy son 66 apariciones en 44 archivos y 124 líneas con `infinite`
  (incluye comentarios). Las cifras del canon están desactualizadas o contadas con otro criterio.

## 14. Orden de adopción (recomendación; decide Miku)

1. Construye `SecuenciaAprender` **una sola** célula, y la recomendación es la A (dueña de
   `IntroContabilidadView`, el tema que la sonda no puede medir hoy). Las demás no copian: la usan.
2. La célula A migra primero una pieza de T1 como prueba y la audita con la sonda y con §3.4.
3. Cada célula pasa sus piezas **en lote**, no pieza por pieza: pedagógico segmenta, contenido
   escribe titulares/apoyos/razones, diseño fija el tipo y la figura de cada pantalla.
4. El contenido ya aprobado no cambia: `nombres`, `Capa2`, `Exploracion` y `Capa4` se reparten en
   pantallas sin reescribirse; contenido solo **añade** titular, razón y cejilla.

## 15. Lo que no verifiqué

- No medí nada en una pantalla real: las cifras de §4 son cálculo sobre el código más los
  supuestos de §12. No hay capturas a 320 ni a 375 de esta secuencia porque no existe todavía.
- No probé ningún dispositivo de gama baja (por eso el parallax queda descartado, §8.5).
- Nivel de gancho de la secuencia: **provisional, sin prueba con otra persona**. Apunta a
  Avanzado; el Medio depende de que la figura de apertura no se repita en ninguna otra pieza.
- No encontré ni verifiqué hoy un ancla externa buena de «secuencia de pantallas con modelo
  manipulable». Las anclas que uso están dentro de la plataforma (la bodega con control de días
  de Inventarios I; «Llena el kárdex», C8 de `enganche.md`; `Presentacion.jsx`). «Parable of the
  Polygons» sigue siendo la referencia del canon y no la revisé en esta sesión.

## Fuentes

- Issara Willenskomer, «Creating Usability with Motion: The UX in Motion Manifesto» (UX Magazine):
  <https://uxmag.com/articles/creating-usability-with-motion-the-ux-in-motion-manifesto>. De ahí salen las
  definiciones de easing, offset & delay y parallax; el artículo no da duraciones.
- Repo `lugoxboop/aprendefae` en `main` (23-oct-2026): `protocolo-de-eficiencia.md`,
  `prompts/disenadores-de-celula-v1.md`, `kit-de-calidad.md` (dimensiones 7 y 9), `enganche.md`,
  `presentacion/Presentacion.jsx`, `mecanicas/maquinas/CuatroCapas.jsx`,
  `IntroContabilidadView.jsx`, `scripts/t4/sonda-enganche/README.md`.

## 16. Respuestas a Hanayama (Célula D, 23 oct)

a) **Reserva de figura: aceptada por pieza**, no fija en 150/200. La figura de la pieza mide lo de su pantalla más alta (la misma en todas, regla D5), con tope **206 px a 320 y 253 a 375, con la banda de apoyo, razón y devolución (66 px, tres líneas de Inter 14/22) debajo** (corrección del 24 oct: 220/319 era sin esa banda; Hanayama midió en T4: 416 − 144 − 66 = 206 a 320, `revisiones/t4-slides/diseno-hanayama.md` §1). Una pieza puede reservar menos; T4 usa 206 en los dos anchos. El apoyo puede desbordar hasta 40 px a 320. Si una figura pasa del tope, la pantalla se parte. El primer control sigue dentro de los primeros 280 px (B1).
b) **Objetivo D2:** es el titular de la pantalla 1 (una oración, máx. 2 líneas). **Pie «Basado en el libro, pp. …»:** en la zona de razón (Inter 12, #A8B6C8) del **Cierre**, una vez por pieza; no se repite en cada pantalla (B5).
c) **Pantallas de un solo control** son **Haz** si el control tiene que dar una respuesta válida para seguir (cobrar, el cheque, Contar, «Pagar el siguiente») y **Míralo** si solo se explora (el extracto). Nunca pasos de una Apertura: la Apertura se arma sola y no cuenta para B3. Las dos primeras cuentan para B3.
d) **Sí**: la clave de persistencia incluye el caso (§5.2 corregido). El segundo intento no hereda el estado del primero.

Adoptado en los slides de T4: C2 (al segundo error se muestra lo correcto y se libera «Siguiente») y decisión en la pantalla 1, que la Apertura permite.
