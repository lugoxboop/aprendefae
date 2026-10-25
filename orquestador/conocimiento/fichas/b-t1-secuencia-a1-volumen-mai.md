DISEÑO: La secuencia de T1 construida (#559) — revisión y volumen de #545 — cu0-a1 y «Ocho leen lo mismo»

De: Mai · 24-oct-2026 · Para Kaede y Sakuta. Revisadas en una pasada las 14 pantallas de la
ventana real a 320×568 que me pasó Sakuta, contra `fichas/b-t1-aprender-secuencia-forma-mai.md` y
el §7 de `fichas/b-t1-titulares-medidos-mai.md`.

## 0 · Dónde y con qué medí

El volumen sale del texto de #545 que me adjuntó Sakuta (en main la skill todavía no lo trae).
Lo que lleva cifra está medido hoy por mí en la réplica del cromo de la vista (el `src/` de main,
Chromium headless con Playwright, Inter y Sora de @fontsource 5.3.0, 320×568 y 375×667).
**Desplazamiento real = alto del documento − ventana − el alto del bloque pegado** (69 hoy, 73 con el
canto del §3), con ese bloque ocupando su sitio en el flujo. Lo demás sale de mirar las capturas contra la ficha.

## 1 · Lo que hay que cambiar

| # | Dónde | Hoy | Cambio |
|---|---|---|---|
| 1 | cu0-a1 · pantalla 1 · el riel | La vía ya trae **los cinco nodos dibujados**, y la pregunta es «¿Cuántos pasos hay desde que pasa algo?» con Uno · Tres · Cinco | **La vía va sin nodos hasta que se responde.** Contar los puntos da la respuesta (R10 y E8: la figura no puede traer la cifra que se pregunta). Los cinco entran **como** respuesta, `scale(.6→1)` en 240 ms con 60 ms de retardo entre ellos. Es la única pantalla de la pieza con el riel vacío |
| 2 | Las dos piezas · fila de progreso | Se dibujan **los Pulsos (10 nodos) y el riel (5 nodos)** a la vez | Fuera los Pulsos en T1. Dos filas de nodos se leen como dos avances distintos; el riel dice más y el contador «Pantalla n de N» dice lo mismo que dirían los Pulsos (regla de colisión, §2 de mi ficha) |
| 3 | Las dos piezas · contador de pieza | «Pieza 1 de 2» y «Pieza 2 de 2» | **«Pieza 1 de 5»** y «Pieza 2 de 5»: el contador cuenta las piezas del tema, no las construidas |
| 4 | cu0-a1 · pantallas 1, 6 y 9 (las paradas) | Titular, figura, opciones, razón **y apoyo al final**, que es el que queda cortado | **En una pantalla de parada no hay apoyo.** En las tres, el apoyo repite lo que ya dice el titular. Medido a 320: **con apoyo, 738 px de documento → 101 de desplazamiento** (el tope es 40); **sin apoyo, 660 → 23** ✓. A 375 cabe en los dos casos |
| 5 | Las dos piezas · bloque pegado | Superpuesto: tapa los últimos 69 px del contenido, y por eso el apoyo se ve cortado aunque el desplazamiento esté dentro del tope | `position: sticky; bottom: 0` **ocupando su sitio en el flujo**, como pide mi §1.2. Así no hay nada que quede detrás de la barra al llegar al final |
| 6 | cu0-a1 · pantalla 3 | El texto del paso va **dentro** de la figura y además hay apoyo debajo | **El texto de cada paso es el apoyo de ese paso:** una sola zona que cambia al dar el paso. La razón dice «Paso n de N». Dentro de la figura solo van los controles y lo que la figura muestra |
| 7 | cu0-a1 · pantalla 4 | El hecho se pinta **dos veces**: en la ficha de la figura y otra vez en el apoyo | La ficha se queda en la figura; el apoyo solo añade lo que la ficha no dice («Eso pasó de verdad.») |
| 8 | cu0-a1 · pantalla 10 | «Basado en el libro, p. 6» va dentro de la figura | Va en la zona de razón, que es su sitio, una sola vez por pieza (§16b del patrón) |
| 9 | Las dos piezas · botón de avance | «Siguiente pieza» se parte en dos renglones | El literal mide **110,7 px** y el botón da **124,5**: lo que lo parte es el relleno lateral. Dentro de `SecuenciaAprender`, «Anterior» toma su ancho (mínimo 96 px, 44 de alto) y el de avance toma el resto (~168), con `white-space: nowrap`. Sirve igual para «Ir a Hacer» (67,2) y «Volver al tema» (101,1). **No se toca el `BOTON_NAV` del componente compartido** |
| 10 | Pieza 2 · pantalla 4 · botón | «Volver al tema» | **«Siguiente pieza»:** no es la última pieza del tema, y el apoyo de esa misma pantalla ya dice «En la siguiente pieza vas a ver…» |
| 11 | Pieza 2 · pantalla 3 (la frase) | Sin figura; la cuarta frase queda detrás de la barra | **Confirmo lo construido y corrijo mi §4:** la pantalla de capa 4 **no lleva figura**, ni siquiera la franja de 44 que yo había puesto. Medido: **102 px de desplazamiento a 320** (con la franja eran 146) y ninguno a 375. **Corregido en el §5:** quitando además el apoyo y la reserva de la razón, esta pantalla deja de desplazarse y la excepción desaparece |
| 12 | cu0-a1 · cejillas de fase | La fase **retrocede**: la 6 dice «Ahora pruebe usted» y la 7 y la 8 vuelven a «Mírelo funcionar» | La cejilla no retrocede: **3 a 8 «Mírelo funcionar», 9 «Ahora pruebe usted», 10 «En una frase»**. Los literales son los del componente compartido y no se tocan; lo que cambia es cuál le toca a cada pantalla |
| 13 | Pieza 2 · pantallas 1 y 2 | La pregunta del lector y la consigna se pintan **las dos** | Cabe hoy (las preguntas más largas del banco miden dos renglones), pero comparten zona: **la pregunta sustituye a la consigna** al tocar a una persona, y no se suma. Si Futaba alarga alguna, con las dos a la vez se pasa |

## 2 · Lo que ya está bien y no hay que tocar

Para que no se arregle lo que no está roto: la factura de la pantalla 5 con sus seis campos y los
guiones; el balance de la 8 con cuatro renglones y el pie «y 3 líneas más»; los rótulos cortos de
las paradas («A los libros» · «Se guarda» · «Al Estado» y «Los jefes» · «El Estado» · «Los
clientes»), que son los que medí; la rejilla 2 × 2 de las personas en la pieza 2; los titulares,
todos en dos renglones; y el veredicto con ✓ «Correcto» en pastilla neutra.

## 3 · El volumen de #545, aplicado a estas dos piezas

Leído entero el #545 de Ukyo. Lo que sigue es cómo cae en cu0-a1 y en «Ocho leen lo mismo»; cada
cifra con su origen.

### 3.1 La escalera: qué lleva canto y qué no

La escalera es N0 `#0E1B2E` (la página) → N1 `#1D3557` (el canto) → N2 `#344968` (la cara)
[fuente: #545]. En estas dos piezas la uso con una regla sola:

**El canto marca lo que se pulsa.** Lo llevan —cara N2 sobre canto N1— las opciones de las tres
paradas de cu0-a1, las cuatro frases de la capa 4, las ocho personas de la mesa 2 × 2, los siete
verbos de la pantalla 2, **la ficha de la figura en las pantallas 4, 5, 7 y 8** (que se toca para
que se transforme) y los dos botones de navegación. **No lo llevan** el contenedor de la figura,
las pastillas de veredicto, los renglones de texto ni el Panel: esos solo reciben el contorno.

- **Canto de 4 px**, capa hermana detrás de la cara y nunca `border-bottom`. **La cara mantiene
  sus 44 px táctiles**, así que el bloque pasa a medir **48**.
- **Botones de navegación:** la cara clara publicada `#B8C4D4` con canto **`#8C9BB0`** —el gris
  quieto que ya está en `CuatroCapas.jsx`, no un tono nuevo—. Razón cara/canto **1,60:1**
  [calculado con las luminancias relativas de los dos], por encima del 1,25 que pide #545. En las
  superficies oscuras, N2 sobre N1 da **1,35** [fuente: #545; lo recalculé y da lo mismo]. Y el texto
  `#F8F9FA` sobre la cara N2 queda en **8,67:1** [calculado], así que subir los controles a N2 no
  toca la lectura.
- **Contorno de silueta** de 1 px `rgba(248,249,250,.18)` en todos los bloques de las dos piezas,
  el contenedor de la figura y las fichas incluidos. Sustituye al `inset` al 35 % que llevan hoy
  los controles.
- **Placa: no hace falta en Contabilidad.** La sonda de Ukyo da p95 del telón **0,0120** contra
  **0,0649** de la cara N2, así que la cara gana por mucho [fuente: #545]. ⛔ **Pero
  `SecuenciaAprender` es compartido:** si la secuencia se usa en Estratégico, allí el p95 sube a
  0,1560 y la placa N1 **sí** es obligatoria. Eso lo resuelve el componente, no la pieza, y la
  captura a 320 sobre una pantalla de Estratégico antes del PASA le toca a quien lo construya.

### 3.2 Lo que cuesta de alto, medido

El canto no es gratis: cada control crece 4 px y el bloque pegado pasa de 69 a 73. Medido hoy en
la réplica, a 320×568, con el desplazamiento real ya descontado el bloque pegado:

| Pantalla | Sin canto | Con canto de 4 | Desplazamiento real | Tope 40 |
|---|---|---|---|---|
| Míralo (figura 184, apoyo de 2 renglones) | 628 | **632** | **0** | ✓ |
| Parada con rótulos de un renglón (a1 · 1) | 660 | **668** | **27** | ✓ |
| Parada con rótulos de dos renglones (a1 · 6 y a1 · 9) | 670 | **678** | **37** | ✓ |
| Pieza 2 · Míralo con la mesa 2 × 2 | 628 | **632** | **0** | ✓ |
| Pieza 2 · la frase | 739 | **759** | 118 → **0** con los tres cambios del §5 | ✓ |

A 375×667 ninguna se desplaza. **El caso más justo son las dos paradas de rótulo largo: 37 de los
40.** Si alguien añade algo a esas pantallas, se mide antes.

La reserva de la figura **no cambia**: la ficha más alta con su canto es la factura, 148 px de los
184; la mesa 2 × 2 con canto mide 104 y la figura de la pieza 2 queda en 160.

### 3.3 El hundido al pulsar

`translateY(4px)` en 100 ms, vuelve en 160, y el canto se queda quieto detrás: al hundirse, la
cara lo tapa exactamente. **Sustituye al `scale(.97)`** del §8.4 del patrón **en los elementos que
tienen canto**; los que no lo tienen siguen con el `scale`. Que no se hagan los dos.

### 3.4 Decoración

**Una sola, para el tema entero, y quieta:** los renglones del libro mayor dentro del contenedor
de la figura — `repeating-linear-gradient` horizontal, línea de 1 px cada 22 px en
`rgba(203,220,242,.05)`. Son exactamente la trama y el tono que ya están publicados en `CSS_SALA`
(`marco.jsx`), así que no invento un motivo nuevo ni toco `LibroMayorBackground`.

- **No decoro la figura por dentro.** El riel, las fichas y la mesa son el argumento de la pieza;
  una textura encima les quita lectura. La trama va detrás, en el contenedor.
- **Nada en bucle.** La excepción de los tres elementos es solo del leaderboard. Aquí ninguna
  decoración se anima, así que no hay keyframe que contar y el recálculo de estilo que añade es
  cero [fuente: #545, donde diez elementos pausados cuestan lo mismo que ninguno: 402 contra 401 ms].

### 3.5 La entrada

#545 dice expresamente que **los slides de Aprender no se redefinen**, así que la entrada sigue
siendo la del patrón —tres grupos, 0 / 80 / 160 ms, 280 ms cada uno, `opacity` y `translateX` de
16 / 24 / 12 px— y no los cuatro grupos de 0/80/160/240. El reparto en estas dos piezas:

| Grupo | Qué entra | Retardo |
|---|---|---|
| 1 | cejilla y titular | 0 ms |
| 2 | la figura entera: riel, ficha o mesa, **con su canto** | 80 ms |
| 3 | el apoyo, la fila de opciones y la razón | 160 ms |

- **El canto entra con su cara, como una sola pieza:** no se anima por separado ni aparece después.
- Con movimiento reducido: todo al instante y sin hundido al pulsar.

### 3.6 Lo que #545 toca y estas dos piezas no

Texto `#F8F9FA` sobre teal da 3,15:1. **En estas dos piezas no hay ningún botón teal:** la
navegación es `#B8C4D4` con texto navy, y en t1-5 «Anotar» ya lleva texto `#06202A`. Nada que
corregir por aquí.

## 4 · Kaede

Los trece cambios del §1 son de vista y ninguno toca textos, ids ni puntaje. Los que no son de
gusto: **1 y 2** (la figura regala la respuesta y hay dos avances dibujados), **4 y 5** (lo que
corta el apoyo), **9 y 10** (los literales del botón) y **12** (la fase que retrocede).

Del volumen, lo que no se puede dejar para después: **el canto solo en lo que se pulsa** (si se
lo pones a todo, la pantalla crece y las dos paradas de rótulo largo se pasan de los 40), **la
cara de 44 con el bloque en 48**, el **contorno de silueta en todos los bloques**, el hundido con
`translateY` **en vez** del `scale`, y la trama quieta del contenedor. La placa no va en
Contabilidad.

---

## 5 · Las cuatro pantallas de capa 4 (25-oct): no hace falta ninguna excepción

Shoko midió, con la franja de 44 y las cuatro frases en flujo: 177 · 177 · 129 · 155 a 320. Con
ese mismo montaje mi réplica da **123 · 140 · 118 · 101** —mido con el bloque pegado ocupando su
sitio y con el canto del §3, y ahí está la diferencia—. Da igual de qué cifra se parta: **con tres
cambios las cuatro bajan del tope**, y la excepción que yo mismo había declarado en mi §4 deja de
hacer falta.

### 5.1 Los tres cambios

1. **Fuera la franja de 44** (ya iba en el cambio 11 del §1): **−56 px** con su margen.
2. **Fuera el apoyo.** En las cuatro pantallas dice lo mismo que la razón —«Elige la frase que
   mejor lo dice» contra «Elige una frase para seguir»—: **−34 px**.
3. **La razón no reserva en esta pantalla.** Corrijo mi propia regla del §3.1 de
   `fichas/b-t1-titulares-medidos-mai.md`: los 48 px reservados existían para que nada saltara al
   aparecer la pista, pero **la razón es la última zona antes del bloque pegado**. Al crecer no
   mueve nada de lo que el estudiante está mirando —empuja hacia abajo, y el bloque pegado es
   `sticky` y se queda donde está—: **−32 px**.

**La corrección 3 vale también para las paradas de cu0-a1,** donde la razón también es la última
zona: las dos de rótulo largo pasan de 37 a **5 px** de desplazamiento [calculado sobre la medida
de §3.2], y la de rótulo corto, de 27 a 0. Es margen que estaba de más.

### 5.2 Lo que queda, medido

| Pieza | Hoy (franja + apoyo + reserva) | Con los tres cambios | A 375×667 |
|---|---|---|---|
| «Ocho leen lo mismo» | 123 | **0** (620 px de documento) | 0 |
| cu0-a2 | 140 | **18** (659) | 0 |
| cu0-a3 | 118 | **0** (610) | 0 |
| cu0-a4 | 101 | **0** (620) | 0 |

**Ninguna excepción y ningún texto recortado.** El tope son 40 y la peor —cu0-a2, que tiene la
frase más larga— queda en 18.

### 5.3 Lo que compra cada cambio, sobre cu0-a2 que es la peor

| Montaje | Documento a 320 | Desplazamiento |
|---|---|---|
| Franja, apoyo y reserva | 781 | 140 |
| Sin franja | 725 | 84 |
| Sin franja ni apoyo | 691 | 50 |
| **Sin franja, sin apoyo y sin reserva** | **659** | **18** |

Los tres hacen falta: ninguno por su cuenta baja de 40.

### 5.4 Las frases van a 13 px

Medido en cu0-a2: a **14 px** el bloque de frases pasa de 267 a 285 y el desplazamiento de 18 a
**36** —cabe, pero deja 4 px de margen—. **A 13 quedan 22.** Y 13 es el piso de lo interactivo del
estándar, así que por ahí no se baja más.

### 5.5 La marca de la correcta tras el segundo error

**Sí lleva marca propia, y de paso arregla un choque que trajo #545:** el relleno navy `#1D3557`
con el que hoy se marca «elegida» **es ahora el color del canto**, así que como relleno ya no
significa nada.

| Estado | Cómo se ve |
|---|---|
| Elegida | contorno de 2 px `#F8F9FA` sobre la cara N2, **sin relleno navy** |
| Elegida y mal | contorno coral de 2 px **discontinuo** y pastilla ✕ «No va aquí» (literal publicado) |
| La correcta, al segundo error | contorno de 2 px `#F8F9FA` **continuo** y pastilla **✓ «Era esta»** |

- «Era esta» es literal nuevo: en Aprender no se usa «Iba aquí» —eso es de Hacer— y «Correcto»
  diría que el estudiante acertó cuando no lo hizo. **El texto lo confirman Futaba y Shoko; la
  forma es esta se llame como se llame.**
- Las dos se distinguen **sin color**: discontinuo contra continuo, ✕ contra ✓ y dos palabras
  distintas.
- En ese momento se libera «Siguiente» (C2), y la razón pasa a llevar el porqué de la opción que
  el estudiante marcó.

### 5.6 Para Kaede

En las cuatro pantallas de capa 4: sin figura, sin apoyo, frases a 13 px y la razón **sin**
reserva de 48 (basta un renglón, y crece cuando aparece la pista). La reserva de la razón tampoco
va en las paradas de cu0-a1. Y los tres estados de §5.5, que reemplazan al relleno navy.
