# Figuras de T2 en slides · lote T2-2 · Watari → L

Artefacto con las maquetas: «Figuras de T2 en slides». Fuente de los textos: `c-t2-1-near-lote.md` §1. Criterios: S1-S13 de `c-t2-1-mello-linea-base.md`.

## Reglas comunes

- Tipos de slide: lectura (cambia sola al entrar, una vez), exploración (toca y responde, no califica), predicción (pinta lo elegido, la slide siguiente confirma, sin veredicto), decisión (regla C4: primero la consecuencia y después el veredicto; escalera C2: pista y luego devolución con porqué y correcta con borde blanco de 2 px; nunca «Iba aquí»).
- Nada avanza solo. Solo transform y opacity, curva cubic-bezier(.3,.9,.4,1), una vez. Al volver atrás, estado final sin animación. Movimiento reducido: estado final directo.
- S12: teal solo DEBE y botón, ámbar solo HABER, títulos y rótulos en neutro, acierto neutro con ✓ «Correcto», coral solo error con ✕ y frase. Letra mínima 12 px, toque 44 px.
- Todo lo que se arrastra se puede tocar (ficha, luego destino; `useArrastre`). Cifras de `contabilidad.js` (S10).
- D9: los cajones de A2 no son la línea del cierre de la Hacer; la T de Bancos de A4 no es la cuadrícula de «Del diario al mayor»; la balanza de A3 no son las columnas de «Cuadra por valor».
- Sin componentes compartidos nuevos. Reutiliza `CuentaT`, `Balanza` (sin cambios), `Ficha`, `FichaEnVuelo`, `useArrastre`, `useNumeroQueSube`, el renglón de `b5/LibroDiario.jsx` y la escalera de `t7/aprenderC3.jsx` / `t7/decisionC4.jsx`.

## 1. De qué está hecha una cuenta · `cu-a1-anatomia-de-una-cuenta`

**Objeto propio (S8):** El saldo que cae del lado mayor.

| # | Near | Título | Tipo | Qué se mueve y qué toca | Estados |
|---|---|---|---|---|---|
| 1 | objetivo | Objetivo | objetivo | Figura en reposo, sin respuesta a la vista. [W para Near] Al terminar, sabrás leer una cuenta T: sus dos lados, sus movimientos y de qué lado queda su saldo. | reposo |
| 2 | 1 | ¿De qué lado? | predicción | Arrastra o toca cada ficha y luego toca un lado. No se califica: la siguiente pantalla lo explica. | antes · despues |
| 3 | 2 | Una raya, dos lados | lectura | La raya baja y parte la hoja (transform: scaleY de 0 a 1). Con movimiento reducido, ya está puesta. | despues |
| 4 | 3 | Debe y haber | exploración | Toca cada lado y aparece su nombre. Los rótulos del lado van en teal y en ámbar; el título de la slide, en neutro. | antes · despues |
| 5 | 4 | Movimientos | exploración | Toca «Sumar»: cada total cuenta hacia arriba (useNumeroQueSube). | antes · despues |
| 6 | 5 | El saldo | decisión | Toca el lado donde va el saldo. La ficha del saldo cae en ese lado, bajo la raya de las sumas, antes del veredicto (regla C4). | antes · error1 · error2 · bien |
| 7 | 6 | Lado no es juicio | exploración | Selector de dos cuentas reales (no califica): Caja y Documentos por pagar. Cambia la cuenta y su familia, no la etiqueta de la misma T. | antes · despues |
| 8 | cierre | En una frase | decisión | La pregunta de cierre de Near, con la misma T en pequeño: $50 en el debe y $30 en el haber. Al acertar, el saldo de $20 cae en el debe. | antes · bien |

**El error:** Slide 6 «El saldo»: el saldo cae en el haber con borde coral y la frase «Así el saldo quedaría del lado de $150, el movimiento menor». Al primer error, la pista de Near; al segundo, la devolución con su porqué y el lado del debe con borde blanco de 2 px. El cierre sigue la misma escalera.

**Reutiliza:** CuentaT (mecanicas/libros/piezas.jsx), con sus rótulos y el ▲ apagado. useNumeroQueSube para las sumas y Ficha y useArrastre (verbos.jsx) para arrastrar o tocar, con su camino accesible. La escalera C2 y la regla C4 del módulo de la célula: t7/aprenderC3.jsx y t7/decisionC4.jsx.

## 2. Las dos familias de cuentas · `cu-a2-dos-familias`

**Objeto propio (S8):** Los cajones que se vacían el 31 de diciembre.

| # | Near | Título | Tipo | Qué se mueve y qué toca | Estados |
|---|---|---|---|---|---|
| 1 | objetivo | Objetivo | objetivo | Figura en reposo, sin respuesta a la vista. [W para Near] Al terminar, sabrás distinguir las cuentas reales de las nominales con una sola pregunta: ¿el saldo sigue después del cierre? | reposo |
| 2 | 1 | El día después | predicción | Toca la cuenta que crees que sigue y luego «Pasar al 1 de enero». El calendario avanza y cada cajón hace lo que hace: no se califica. | antes · despues |
| 3 | 2 | Las reales | exploración | Toca «Avanzar»: los tres cajones cruzan al año nuevo con su contenido (translateX). | antes · despues |
| 4 | 3 | Las nominales | exploración | Toca «Avanzar»: el contenido sale de cada cajón (opacity y translateY) y queda $0. Gastos de operación va lleno de fichas: tener mucho movimiento no lo salva del cierre (confusión de S9). | antes · despues |
| 5 | 4 | Tres nominales | exploración | Las tres tarjetas se voltean (rotateY) y muestran la definición textual y su ejemplo. No hay muro: una tarjeta abierta a la vez. | antes · despues |
| 6 | 5 | Una sola pregunta | decisión | Clasifica seis cuentas en dos cajones grandes, «Sigue» y «Vuelve a cero». La que cae mal se queda en el cajón elegido y se ve qué le pasaría el 1 de enero (regla C4). | antes · error1 · error2 · bien |

**El error:** Slide 6 «Una sola pregunta»: la cuenta mal clasificada se queda en el cajón elegido y dice qué le pasaría el 1 de enero («Así, el 1 de enero Bancos diría $0, y el dinero sigue en el banco»). Primero la pista y después la devolución, con el cajón correcto en borde blanco.

**Reutiliza:** Ficha y useArrastre (verbos.jsx) para soltar las seis cuentas. El cajón es la figura propia de la pieza: vive en la célula y no es compartido. La escalera C2 de t7/aprenderC3.jsx.

## 3. El debe y el haber · `cu-a5-debe-y-haber`

**Objeto propio (S8):** La mesa de dos casos.

| # | Near | Título | Tipo | Qué se mueve y qué toca | Estados |
|---|---|---|---|---|---|
| 1 | objetivo | Objetivo | objetivo | Figura en reposo, sin respuesta a la vista. [W para Near] Al terminar, sabrás por qué un mismo registro en el debe hace subir una cuenta y bajar otra. | reposo |
| 2 | 1 | Mismo lado, mismo monto | predicción | Elige «Sí, igual» o «No». La elección queda marcada y la respuesta llega en la pantalla siguiente (no se califica aquí). | antes · despues |
| 3 | 2 | Efectos opuestos | exploración | Toca «Registrar»: cada saldo cuenta hacia su valor nuevo. Uno sube y el otro baja con la misma ficha. | antes · despues |
| 4 | 3 | Dónde vive cada cuenta | decisión | Arrastra o toca Maquinaria y Aportes sociales y luego su casa en la ecuación. La que cae en la casa equivocada se queda allí y muestra la regla de esa casa. | antes · error1 · error2 · bien |
| 5 | 4 | La trampa | exploración | Toca «Registrar el pagaré»: los dos saldos suben a la vez. Es la confusión de S9 «débito siempre suma», puesta al revés. | antes · despues |
| 6 | 5 | Gastos e ingresos | exploración | Suelta una ficha en Gastos de operación y otra en Ingresos por servicios. Debajo de la mesa, el patrimonio baja con una y sube con la otra. | antes · despues |
| 7 | 6 | Prueba tú | exploración libre | Mesa de cuatro cuentas con sus saldos en cifras, que se mueven en vivo. No califica. Con $100 frente a $400.000, una barra no se vería: por eso aquí van cifras y no barras. | antes |
| 8 | cierre | En una frase | decisión | Las tres opciones de Near (a, b, c), que difieren en una palabra. La mesa de dos casos queda arriba, en pequeño. | antes · error1 · bien |

**El error:** Slide 4 «Dónde vive cada cuenta»: la cuenta cae en la casa equivocada y aparece la regla de esa casa como consecuencia. Primero la pista y después la devolución de Near («Confundiste dónde vive con dónde se anota»), con la casa correcta en borde blanco. El cierre usa las tres opciones de Near, con su retro.

**Reutiliza:** useNumeroQueSube para los saldos que suben y bajan. Ficha y useArrastre para la mesa de «Prueba tú». La escalera C2 de t7/aprenderC3.jsx.

## 4. La partida doble y las dos reglas · `cu-a3-partida-doble`

**Objeto propio (S8):** La balanza de totales con nombres.

| # | Near | Título | Tipo | Qué se mueve y qué toca | Estados |
|---|---|---|---|---|---|
| 1 | objetivo | Objetivo | objetivo | Figura en reposo, sin respuesta a la vista. [W para Near] Al terminar, sabrás por qué todo registro va dos veces y por qué lado crece cada familia de cuentas. | reposo |
| 2 | 1 | Una sola línea | predicción | Toca «Anotar solo el equipo»: Equipo de computación entra al platillo del activo con su nombre y su cifra, y la balanza se inclina. | antes · despues |
| 3 | 2 | Partida doble | lectura | La segunda línea aparece junto a la balanza, todavía fuera de ella: es la que el estudiante va a mover en la pantalla siguiente. | despues |
| 4 | 3 | La balanza | decisión | Arrastra o toca Cuentas por pagar y luego un platillo. Si cae en el del activo, la balanza se inclina más (regla C4) y aparece la pista. | antes · error1 · bien |
| 5 | 4 | Primera regla | decisión | Los platillos pasan a ser grupos: «crece por el debe» y «crece por el haber». Suelta Activos, Gastos y Costos. Cada familia queda escrita en su platillo. | antes · bien |
| 6 | 5 | Segunda regla | decisión | Suelta Pasivos, Patrimonio e Ingresos. La que cae mal se queda en el platillo elegido con borde coral y su consecuencia escrita. No rebota (Near pedía rebote; ver ajustes). | antes · error1 · error2 · bien |
| 7 | 6 | Simple o compuesto | decisión | Arma el asiento de ene-03: cada línea cae en su platillo con su nombre y su cifra, y el total de cada lado cuenta hacia arriba. Al terminar, hay dos nombres de un lado y dos del otro, con la balanza nivelada por los totales. | antes · bien |

**El error:** Slides 4, 6 y 7: la línea o la familia que cae mal se queda en el platillo elegido, con borde coral, y la balanza muestra el desnivel o la frase de lo que implicaría. Primero la pista y después la devolución, con el platillo correcto en borde blanco. Nada rebota.

**Reutiliza:** Balanza (verbos.jsx) sin cambios: izquierda y derecha reciben la lista de nombres con su cifra, e inclinacion la mueve. Ficha y useArrastre para soltar líneas y familias en un platillo. La escalera C2 de t7/aprenderC3.jsx.

## 5. Del diario al mayor · `cu-a4-diario-y-mayor`

**Objeto propio (S8):** El renglón que viaja del diario a su T.

| # | Near | Título | Tipo | Qué se mueve y qué toca | Estados |
|---|---|---|---|---|---|
| 1 | objetivo | Objetivo | objetivo | Figura en reposo, sin respuesta a la vista. [W para Near] Al terminar, sabrás pasar los valores del diario al mayor sin cambiarles el lado, y qué responde cada libro. | reposo |
| 2 | 1 | ¿Por fecha o por cuenta? | decisión | Elige un orden y los nueve hechos se ordenan así. Por fecha, los renglones de Bancos quedan dispersos y se marcan (consecuencia). Por cuenta, quedan juntos. | antes · error1 · bien |
| 3 | 2 | El diario | exploración | Toca «Siguiente»: entra una fila del diario, en orden de fecha (4 filas de diarioDeEjemplo). Cada toque, una fila. Nada avanza solo. | antes · despues |
| 4 | 3 | Cómo se escribe | exploración | Toca el asiento del 1 de julio: la cuenta del haber se corre a la derecha (translateX) y aparece la explicación corta. | antes · despues |
| 5 | 4 | El mayor | lectura | Toca «Ver mayor»: el mismo enero se reparte en cuentas T (2 por fila a 320 px). | despues |
| 6 | 5 | Mayorizar | decisión | Arrastra o toca un renglón de Bancos y luego un lado de la T. El renglón viaja con su fecha. Si cae del otro lado, se queda allí con borde coral y el saldo de Bancos cambia. | antes · error1 · error2 · bien |
| 7 | 6 | Dos preguntas | exploración | Toca ene-03 en el diario y se ilumina también en el mayor (y al revés). A 320 y 375 px los dos libros van uno encima del otro, no uno al lado del otro. | antes · despues |

**El error:** Slides 2 y 6: el orden elegido o el lado elegido se pintan. Por fecha, los renglones de Bancos quedan repartidos. En el lado contrario, el renglón queda en el haber con borde coral y Bancos cambia. Primero la pista y después la devolución, con el lado correcto en borde blanco.

**Reutiliza:** El renglón de b5/LibroDiario.jsx, abierto. CuentaT para Bancos y para las cuentas del mayor. FichaEnVuelo (verbos.jsx) para el renglón que viaja. La escalera C2 de t7/aprenderC3.jsx.

## Ajustes que propongo a Near

- **A1 · slide 6 (Near 5).** Near escribe «si lo suelta en el haber, la T se inclina y no lo acepta». Inclinarse es de la balanza de A3, y rechazar la ficha va contra la regla C4. Propongo: el saldo cae en el lado elegido, se pinta la consecuencia y sigue la escalera C2. El texto de la slide no cambia.
- **A1 · slide 7 (Near 6).** Poner la etiqueta «Pasivo» a la misma Caja sería un caso inventado: un pasivo con saldo en el debe por $1.350 (choca con S10). Propongo: un selector entre dos cuentas reales, Caja (activo, saldo en el debe) y Documentos por pagar $500 (pasivo, saldo en el haber, cu6-pagaré, p. 89, la misma que usa A5). El texto de Near sirve sin cambios.
- **A3 · slide 6 (Near 5).** Near pide que una familia mal puesta «rebote al centro». Propongo: que se quede en el platillo elegido, con su consecuencia escrita y la escalera C2 (regla C4, S4 de Mello).
- **A3 · slide 7 (Near 6).** S9 pide «tres cuentas que cuadran por totales», y ene-03 de Lavado tiene 2 contra 2. Propongo a Near un asiento de tres o más líneas de los datos de Lavado, o un segundo estado con uno así. La figura sirve para cualquier número de líneas: los nombres se apilan en su platillo.
- **A4 · slides 5 y 7 (Near 4 y 6).** «Uno junto al otro» no cabe a 320 px. Los dos libros van uno encima del otro, con el enlace iluminado en los dos. Solo cambia la frase del «VE»; el texto de la slide no.
- **A5 · slide 7 (Near 6).** Una ficha de $100 frente a $400.000 no se vería en una barra. En «Prueba tú» los saldos van en cifras que se mueven en vivo, no en barras. El texto no cambia.
- **Las 5 · slide de objetivo.** Near no la traía y la pide S1. Dejo una oración [W] por pieza, que Near reescribe.

## Medido

Maqueta de figuras, 152 estados a 258 y 313 px (contenido a 320 y 375): letra mínima 12 px, botones bajo 44 px: 0, fuera de caja: 0. Sin la cáscara: las palabras por slide (S2, S3) se cuentan con el componente de Erwin.
