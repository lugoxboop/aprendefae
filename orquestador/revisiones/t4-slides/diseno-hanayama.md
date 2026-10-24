# T4 · Diseño de los slides de A0-A5 (Hanayama, 23 oct 2026)

Especificación visual para que Baki construya los Aprender de T4 como secuencia de pantallas sin tener que adivinar.

- **Contenido:** `hilo-katsumi.md`, commit 6ad058b. El lote 2 sustituye A0, A2 p2 y A4 p1.
- **Forma:** `aprender-secuencia-v1.md` de Ukyo (#470), con sus respuestas del §16.
- **Juez:** Shibukawa, con la Vara 2.

Copiado al repo por Yujiro desde el chat de Hanayama (claude.ai/chat/930849c0-7d5d-431e-a1b2-30f3e19b19dc), porque su sesión no puede hacer push. Los dos scripts de medida que cita (`medir-slides-hanayama.mjs` y `desglose-hanayama.mjs`) solo existen en la copia local de Hanayama. Baki mide con sus herramientas (`scripts/t4/medir-t4.mjs` y la sonda) y deja sus propias medidas en el PR.

**Origen de las cifras**

- **[fuente]:** medido por Hanayama el 23-oct con Chromium (Playwright 1.63) sobre `scripts/t4/harness-t4`, con Inter y Sora de fontsource 5.3.0. Los componentes de T4 eran idénticos a los de 35f9b72.
- **[calculado]:** lleva la fórmula al lado.
- **[supuesto]:** lleva una parada de medición en el §7.

---

## 0. Alcance y paradas

- **Carril.** Todo cae en el carril de la Célula D: `src/components/t4/`, `src/data/contabilidadT4*` y `ContabilidadT4View.jsx`. Se dibuja solo con piezas que ya existen en T4: `Chips`, `Sobre`, `Cheque`, `Cajon`, `FiguraAno`, `Libretas`, el mayor, el tablero y el par.
- **Compartido.** No se toca `SecuenciaAprender` (#491, de Erwin). T4 lo usa y le pasa la figura y la banda (§2). Si al construir hace falta cambiar algo compartido, ⛔ es PARADA y se avisa a Yujiro.
- **Solo se agrega.** Ningún id `t4-` cambia y no se borra nada del contenido aprobado. Lo que deja de verse en un slide sigue en el código: la `Pista` de A0, «Otra vez» de A1 y el libro de A2 p2.
- **Índice de progreso.** La parada está cerrada: Baki demostró en #488 que el progreso no guarda el índice de pantalla.

## 1. La reserva de figura de T4 es de 206 px, no de 220

El tope de 220/319 salió de una cuenta que no incluía ni el apoyo ni la devolución. Con la devolución visible (E2 y §4 de Ukyo), a 320 no cierra.

La cuenta [calculado sobre los supuestos de Ukyo: cabecera de la vista 124 y navegación 68]:

- **Zona libre a 320×568:** 568 − 124 − 68 = 376, más 40 de desborde permitido = **416**. A 375×667: 475, sin desborde.
- **Lo fijo que no es figura: 144.** Relleno del Panel 28, progreso 28, cejilla y su hueco 16 + 4, titular de 2 líneas 44, y huecos alrededor de la figura 12 + 12. La razón va dentro de la banda.
- **Banda de apoyo, razón y devolución: 66.** Tres líneas de Inter 14/22.
- **Figura:** ≤ 416 − 144 − 66 = **206 a 320**. A 375 podría llegar a 265.

**Decisión: reserva de 206 px en las seis piezas y en los dos anchos.** Así Baki trabaja con una sola geometría, y a 375 la banda gana 59 px.

## 2. Reglas para todas las pantallas de A0-A5

1. **La figura** es un `<figure>` de alto fijo 206 px, con el contenido pegado arriba. Lo que una pantalla no usa queda vacío. La figura no crece ni se encoge al responder (D5).
2. **La banda** (66 px, justo bajo la figura) tiene un solo dueño a la vez:
   - antes de responder, el apoyo o la razón de espera;
   - tras responder, la devolución (una pastilla con la palabra y el texto de Katsumi);
   - en el Cierre, la frase de cierre y el pie.

   La devolución queda siempre entre lo tocado y «Siguiente», sin desplazar la pantalla (E2). Los dos `scrollIntoView` de `PantallasT4` no se usan en los slides.
3. **El veredicto va en el control tocado:** borde de 2 px (#F8F9FA o coral) e ícono Check o X de lucide (16 px, trazo 2,5) dentro del control. La palabra («Correcto» o «No va aquí») va en la pastilla de la banda. La línea de marcas de 20 px (`LineaMarcas`) desaparece. En gris todavía se distingue cuál falló, porque Check y X tienen formas distintas. El lector de pantalla oye la palabra en el nombre del control.
4. **A la banda o al titular pasan** los rótulos de acción (`rotuloAccion`), las preguntas (`rotuloPregunta`) y el caso de A5. En la figura quedan solo los rótulos del modelo: nombres de cuenta, Debe/Haber y cifras.
5. **Errores (C2).**
   - Primer error: la banda da la devolución y el control sigue activo.
   - Segundo error: la figura toma el estado correcto (el destino correcto con borde #F8F9FA y Check, y el modelo con su consecuencia), la banda da el porqué y se libera «Siguiente».
   - Nunca aparecen «Iba aquí» ni «Comprobar».
6. **Cierres.**
   - La frase entra al llegar (+240 ms, §8.3 de Ukyo). El control del Cierre, si lo hay, es opcional.
   - El pie «Basado en el libro, pp. …» va solo en el Cierre, en 12 px #A8B6C8, como última línea de la banda.
   - «Siguiente: «X».» no cabe a 320: pasa a ser la descripción accesible de «Siguiente pieza» (`aria-describedby`) y solo se ve escrito a 375. No se borra.
7. **`Chips`.**
   - Tres columnas a 320: (258 − 2×6) ÷ 3 = 82 px por chip, 72 útiles [calculado].
   - Las de palabras parten en dos renglones (modo `palabras`, 48 px de alto).
   - Las de cifra que pasan de 72 px bajan a Inter 13/600 (§3, A4).

## 3. Pieza por pieza

En cada tabla:
- **Tipo** es el de Ukyo (§3.2): Apertura, Míralo, Haz o Cierre.
- **Modelo** es el alto dentro de la reserva de 206 en el peor estado [calculado desde las medidas del §8].

### A0 · El activo corriente (4 pantallas)

**Figura: `FiguraAno` compacta, con el nombre a la izquierda de cada fila.**

- **Columnas.** Nombre 112 px y año 146 px, con la raya al 65 %: 95 px antes de la raya y 47 después, con casillas de ≥ 44 [calculado].
- **Filas.** Nombre en Inter 13/16 y glosa en 12/15, hasta 3 renglones: la fila mide 47 [calculado]. «Arriendo pagado» mide 103 px y cabe en 112 [fuente].
- **Cabecera.** «Corriente» y «No es corriente» van solo sobre la columna del año: 22 px.
- **Sin `Pista`.** El año lo mueven las decisiones del estudiante (D9):
  - cada casilla tocada hace correr su fila hasta el mes de esa fila, a 220 ms por mes;
  - «Pasar el año» corre todas las filas;
  - con movimiento reducido, todo salta directo.

| p | Idea (Katsumi) | Tipo | Modelo | Cómo cabe |
|---|---|---|---|---|
| 1 | Corriente: se vuelve plata antes de un año; lo fijo no | Haz | 22 + 44 + 47 + 47 + 2×4 = **168** | Filas: mercancía, deuda y edificio. Cada fila se califica al tocar su casilla, sin botón; la fila corre hasta su mes. El veredicto va en la casilla (regla 3) |
| 2 | El efectivo va primero porque ya es plata | Haz | 4×47 + 3×4 = **200** (sin cabecera) | **NUEVO**: cuatro filas que se tocan enteras (§3.1) |
| 3 | Lo prepagado es corriente porque se consume | Haz | 22 + 47 + 8 + 48 = **125** | **NUEVO**: el arriendo y tres opciones (§3.1) |
| 4 | Para qué sirve separarlos | Cierre | 22 + 44 + 4 + 47 = **117** | Caja y edificio, quietos en el mes 12. En la banda, la frase y el pie «pp. 178-179» |

#### 3.1 Lo NUEVO de A0

**p2 · Cuatro filas.** Cada fila de `FiguraAno` es un `<button>` de 47 px que ocupa todo el ancho.

- **Filas:** Efectivo en caja y bancos (dato nuevo en `contabilidadT4A0.js`: `efectivo`, mes 0), Inversiones a corto plazo, Cartera e Inventarios.
- **Antes de decidir,** ninguna fila muestra su marca, para que el efectivo no se delate.
- **Con el acierto:** borde #F8F9FA y Check en el efectivo; el año pasa solo (`useAno.pasar`); cartera, inventarios e inversiones se encienden en los meses 2, 4 y 7 con la marca «plata».
- **Con el error:** borde coral y X en la fila tocada, y el año no pasa. Al segundo error aplica la regla 5.

**p3 · El arriendo.**

- **La fila:** `F.arriendo`, con el texto «Arriendo pagado / por anticipado» y la glosa «seis meses».
- **Las opciones:** debajo, `Chips` en modo `palabras` y tres columnas: «Se vuelve plata», «Se consume» y «Sigue igual». «Se vuelve plata» mide 103 px y parte en dos renglones [fuente].
- **Con el acierto:** el año pasa y la fila muestra «se consumió» en el mes 6 (`marca.consumio`).

### A1 · La caja (6 pantallas) · el caso crítico

**Hoy el cajón mide de 233 a 415 px** [fuente]. Lo inflan tres franjas apiladas (origen 64-86, cajón 117-242 y salidas 76-133) y la bandeja «Caja no se mueve» en una franja propia (61-80).

**Cajón compacto:**

1. **Origen, 44 px.** Tarjeta del movimiento: texto en Inter 13/16 (2 renglones como máximo) y cifra en 15/500 tabular.
2. **Cajón y bandeja lado a lado, 108 px:** el cajón (190 px) y la bandeja (60 px), con 8 de hueco.
   - Cajón: relleno 6, Debe/Haber 16, columnas-destino de 44 (dos de 85 px; «$435.000» cabe), ícono 20 dentro de la celda y «En la caja» 20 [calculado].
   - La manija sigue en el borde superior y se abre como hoy (D9).
   - Bandeja: destino de 60 × 108, con «Caja no se mueve» en tres renglones de 12 px.
3. **Salidas, 32 px:** Bancos y Pago lado a lado, cada una con su cifra. Solo en p3 son botones de 44.
4. **Tubos y rama:** 8 px de hueco cada uno.

| p | Idea | Tipo | Modelo | Qué cambia |
|---|---|---|---|---|
| 1 | Cobrar mete plata por el debe | Haz | 44 + 8 + 108 + 8 + 32 = **200** | Destinos: debe, haber y la bandeja. Las glosas de Caja y Bancos (de «dos-cuentas») van como rótulos del cajón y de Bancos. Con el acierto, el asiento ocupa el lugar del origen (§3.2) |
| 2 | Consignar saca la plata de Caja | Haz | **200** | Igual que p1. Con el acierto se enciende Bancos con $435.000 y el asiento ocupa el lugar del origen |
| 3 | Caja tiene dos salidas | Míralo | 108 + 8 + 44 = **160** | Sin origen. «Consignar» y «Pagar» son las salidas (44). Sin «Otra vez»: tras una salida, el botón de la otra sigue activo y, al tocarlo, devuelve la plata y la manda por ahí. La razón de por qué el libro no paga con la caja es un texto de Katsumi para la banda |
| 4 | La caja también guarda cheques | Haz | **200** | Dos tarjetas en la fila del origen; la segunda llega 1,4 s después, como hoy |
| 5 | Sin separar funciones se escapa plata | Haz | 44 + 8 + 92 + 8 + 48 = **200** | Origen: «cobrado $435.000 · sin anotar $25.000». El cajón no es destino aquí (columnas de 24, 92 en total). Las tres tarjetas pasan a `Chips` en modo `palabras`: «Separar funciones», «Arqueo sorpresa» y «Póliza de manejo» |
| 6 | Cada control tapa una fuga | Cierre | 94 + 8 + 72 + 8 + 24 = **206** | Siete controles como pastillas de 44 en una rejilla de 4 + 3 (60 px de ancho, nombre en 12/500 en dos renglones, `hyphens: auto`, `lang="es"`). Cajón sin origen ni bandeja (72) y salidas de 24. Tocar un control es opcional |

#### 3.2 El asiento de A1 ocupa el lugar del origen

En la banda no cabe a 320: la pastilla (24) más el asiento (68) suman 92, y 144 + 206 + 92 = 442, que es 26 más que 416 [calculado].

Con el acierto, la tarjeta ya entró al cajón y su fila de 44 + 8 queda libre. Ahí entra el `AsientoA1` compacto, de **52 px** [calculado]: Debe/Haber 14, dos renglones de 18 y 2 de borde, con el fundido `t4r-nueva`. La banda queda solo con la pastilla «Correcto». El modelo sigue en 200.

### A2 · El fondo fijo (7 pantallas)

| p | Idea | Tipo | Modelo | Qué cambia |
|---|---|---|---|---|
| 1 | Pagar no cambia la suma del fondo | Haz | 124 + 8 + 48 + 18 = **198** | El sobre de hoy (124). **NUEVO**: `Chips` en modo `palabras` con «Sigue igual», «Baja» y «Sube». Con el acierto, el mismo hueco pasa a «Pagar un gasto» y «Reponer» (`t4r-par2`, 44). «Paga y repón» va a la banda |
| 2 | El fondo se abre con plata de Bancos | Haz | 46 + 8 + 79 + 8 + 48 = **189** | El cheque arriba y el sobre sin el renglón de soportes (79). **NUEVO**: `Chips` con «Bancos», «Caja» y «Caja menor». Con el acierto, el cheque entra al sobre (280 ms) y los billetes cuentan hasta $500.000. El libro no se dibuja: la idea la dice la devolución de acierto |
| 3 | Cada gasto deja su soporte | Míralo | 98 + 8 + 22 + 8 + 44 = **180** | Igual que hoy |
| 4 | Gastado más lo que queda da el fondo | Haz | 148 + 8 + 48 = **204** | Igual que hoy, sin la línea de marcas |
| 5 | Reponer lo gastado es el reembolso | Míralo | 46 + 8 + 124 = **178** | Igual que hoy |
| 6 | El reembolso no mueve Caja menor | Haz | 16 + 2×76 + 8 = **176** | El libro de cuatro cuentas (377) pasa a una rejilla de 2 × 2 cuentas T: nombre 16, Debe y Haber como destinos de 44 y la cifra en un renglón de 16 (76). Columnas de 125 px a 320. Cada renglón se califica al tocarlo |
| 7 | Solo subir o bajar mueve Caja menor | Cierre | 74 + 8 + 44 + 8 + 56 = **190** | El sobre (74), «Subir»/«Bajar» (44) y un libro de 1 × 2: Caja menor y Bancos, cada uno con nombre 16, T 24 y cifra 16 (56). Pie «p. 182» (lo pidió Shibukawa) |

### A3 · El arqueo (8 pantallas)

**Figura común:**
- **Sobre sin el renglón «Suman»:** rótulo 16, solapa 18 y dos renglones de 22, en total 78. La solapa que se abre con «Contar la caja» se queda (D9).
- **Regla compacta, 64 px:** aguja y marcas 44, más un renglón de rótulos de 14. El rótulo de la aguja dice lo que hoy dice la zona («sobra $2.100»). Hoy la regla mide 134 [fuente].
- **Huecos:** 6.

| p | Idea | Tipo | Modelo | Qué cambia |
|---|---|---|---|---|
| 1 | Soportes más efectivo deben dar el fondo | Haz | 78 + 6 + 64 + 6 + 48 = **202** | «Contar la caja» (44) ocupa el hueco. Tras el conteo (21.900), el hueco pasa a **NUEVO**: `Chips` en modo `palabras` con «Falta», «Cuadra» y «Sobra». La aguja sale solo con el acierto, para no delatar |
| 2 | Pasarse es sobrante y quedarse corto es faltante | Míralo | 78 + 6 + 64 + 6 + 44 = **198** | El control que mueve la plata (44). El rótulo de la aguja dice «sobra $X», «falta $X» o «cuadra» |
| 3 | Leer un sobrante | Haz | **202** | Igual que p1, ya contada |
| 4 | El sobrante achica el cheque | Haz | **202** | Tres cheques en `Chips` |
| 5 | El sobrante es ingreso no operacional | Haz | 16 + 2×76 + 8 = **176** | La ficha (346) pasa a la rejilla de 2 × 2 de A2 p6 |
| 6 | El faltante agranda el cheque | Haz | **202** | Igual que p4 |
| 7 | Si se le cobra, Rosa queda debiendo | Haz | **176** | La ficha (418) pasa a la rejilla de 2 × 2 |
| 8 | Quién paga lo decide la empresa | Cierre | 64 + 6 + 60 + 6 + 56 = **192** | La regla, el interruptor (44 + 16 de rótulo) y el libro de 1 × 2. El interruptor es opcional. Pie «pp. 182-186» |

### A4 · Bancos y notas del banco (5 pantallas)

| p | Idea | Tipo | Modelo | Qué cambia |
|---|---|---|---|---|
| 1 | Bancos sube con lo consignado y baja con lo girado | Haz | 89 + 8 + 48 = **145** | La cuenta Bancos (tablero de 89). **NUEVO**: tres saldos en `Chips` de cifra ($477.800, $1.274.200 y $398.200), en **Inter 13/600 tabular**: «$1.274.200» mide 76 px en 14/600 y 71 en 13/600 [fuente]. Con el acierto: Debe 876.000, Haber 398.200 y el saldo cuenta hasta 477.800 (`useNumeroQueSube`) |
| 2 | Las notas del banco restan o suman | Míralo | 21 + 160 = **181** | Libretas (160) y pestaña (21). «Hacer llegar el extracto» va dentro de la libreta del banco y desaparece al usarlo |
| 3 | Cada movimiento sube o baja Bancos | Haz | 44 + 8 + 44 + 8 + 100 = **204** | Tarjeta de 44 (2 renglones como máximo), «Sube»/«Baja» (44) y mayor compacto (100; hoy mide 200 [fuente]) |
| 4 | Cada libreta anota a su tiempo | Haz | 44 + 8 + 152 = **204** | Tarjeta de 44. El renglón de las libretas pasa de 64 a 56 [supuesto; parada 5] |
| 5 | Conciliar es ver qué le falta a cada una | Haz | 218 − 24 = **194** | La pregunta va al titular. Renglón de 56 [supuesto]. Con el acierto, la banda lleva la frase de cierre y el pie «pp. 186-190». No tiene pantalla de Cierre propia (§9) |

### A5 · San Calixto (6 pantallas)

**Par horizontal:** «El banco», «=» y «la empresa» en un solo renglón de 47, más «saldo verdadero» de 20; en total 67. Hoy el par va apilado y mide 91-112 [fuente]. Cada lado mide 117 px a 320, y «$1.937.500» cabe en Inter 15/500.

| p | Idea | Tipo | Modelo | Qué cambia |
|---|---|---|---|---|
| 1 | Ningún saldo es el verdadero todavía | Haz | 67 + 8 + 48 = **123** | El caso y la pregunta van a la banda y al titular |
| 2 | Al banco le falta lo que la empresa anotó | Haz | 67 + 6 + 48 + 6 + 76 = **203** | La tarjeta pasa de 74 a 48. «Más» y «Menos» (140) pasan a dos destinos de 44 con el total del lado y la última partida en 2 renglones de 16. El saldo cuenta hasta su valor nuevo (D9) |
| 3 | A la empresa le faltan las notas | Haz | **203** | Igual que p2. El «=» aparece cuando los dos lados se igualan |
| 4 | Solo se asienta lo que le falta a la empresa | Haz | 48 + 8 + 48 = **104** | La tarjeta y «Se asienta / No se asienta» |
| 5 | Cada nota mueve Bancos a un lado | Haz | 64 + 8 + 76 = **148** | La nota pasa de 92 a 64. El tablero pasa a 1 × 2 (Bancos y su contrapartida) |
| 6 | Los dos lados llegan al mismo saldo | Cierre | 131 + 8 + 47 = **186** | «Asentar las cinco notas» (44) y, en su lugar, el par igualado (47). Mayor de 131. Las notas entran cada 350 ms. Pie «pp. 189-191» |

## 4. Resumen

| Pieza | Pantallas | Míralo | Haz | Cierre | B3 | Modelo máximo (≤ 206) |
|---|---|---|---|---|---|---|
| A0 | 4 | 0 | 3 | 1 | 3/4 | 200 |
| A1 | 6 | 1 | 4 | 1 | 5/6 | 206 |
| A2 | 7 | 2 | 4 | 1 | 6/7 | 204 |
| A3 | 8 | 1 | 6 | 1 | 7/8 | 202 |
| A4 | 5 | 1 | 4 | 0 | 5/5 | 204 |
| A5 | 6 | 0 | 5 | 1 | 5/6 | 203 |

Ninguna pieza tiene pantalla de Apertura: la decisión en la pantalla 1 la hace Haz.

El modelo de la pantalla 1 corre una sola vez al llegar (máximo 900 ms):
- la manija en A1;
- la solapa en A2 y A3;
- la cuenta de Bancos en A4.

## 5. Movimiento nuevo (lo demás está en el §8 de Ukyo)

| Qué | Cómo | Movimiento reducido |
|---|---|---|
| La fila de A0 corre al tocar su casilla | X a 220 ms por mes, `cubic-bezier(.3,.9,.4,1)` | Salta al final |
| El cheque de A2 p2 entra al sobre | `translateY` y `opacity` 1→0, 280 ms; los billetes cuentan | El sobre aparece lleno |
| La salida de A1 p3 cambia de camino | La cifra sale (120 ms) y entra por el otro lado (280 ms) | Cambio inmediato |
| El asiento de A4 p1 | Debe, haber y saldo, 280 ms cada uno | Los tres a la vez |
| El veredicto en el control | El fundido `t4r-nueva` de hoy (120 ms) | Sin fundido |

Nada nuevo queda en bucle. Solo se animan `transform` y `opacity`.

## 6. Accesibilidad (lo que cambia)

- **A0 p2:** cada fila es un `<button>` llamado «{nombre}, {glosa}».
- **A0 p1:** cada casilla se llama como hoy, más la palabra del veredicto.
- **A1 p6:** cada pastilla lleva `aria-label` con el nombre completo.
- **La banda** es el único `aria-live="polite"` de la pantalla.
- **«Siguiente pieza»** lleva `aria-describedby` apuntando a «Siguiente: «X».» a 320.

## 7. Paradas de medición (para Baki: si no da, detente y avisa)

1. **La cabecera de la vista (124) y el bloque pegado (68)** son supuestos de Ukyo. Mídelos a 320×568. Si pasan de 192 en total, la reserva de 206 no cierra.
2. **Cada modelo del §3,** a 320 y a 375. Si alguno pasa de 206, detente y no recortes texto.
3. **El asiento compacto de A1 (52):** mídelo con la cuenta más larga del caso B. Si pasa de 52, avisa, porque la reserva no puede crecer.
4. **«$1.274.200» en Inter 13/600 tabular dentro de 72 px.** Si no cabe, las opciones de A4 p1 pasan a dos columnas (2 + 1), sin dejar nunca sola a la correcta.
5. **El renglón de 56 de las libretas de A4 p4 y p5:** que los rótulos de las causas quepan en 2 renglones.
6. **La devolución más larga de Katsumi** en la banda de 66 a 258 px de ancho, con su pastilla. Si pasa de 3 renglones, avisa.
7. **A1 p6, que va a 206 px justos:** la rejilla de siete controles más el cajón no pueden pasar de 206.

## 8. Medidas de partida [fuente] (alto dentro de la figura a 320, en el peor estado)

| Bloque | Alto | Dónde |
|---|---|---|
| Opciones `Chips` (`t4op-g`) | 48 | A2 p4, A3, A5 |
| Línea de marcas | 20 | A0, A2, A3, A5 |
| `t4r-par2` y `t4r-btn2` | 44 | todas |
| Rótulo de acción o pregunta | 16 | A0, A2, A4, A5 |
| El sobre | 74 a 148 | A2, A3 |
| El cheque | 46 | A2 |
| La regla | 134 | A3 |
| El cajón | 117 a 242 | A1 |
| Origen, bandeja y salidas de A1 | 40-86, 61-80 y 76-133 | A1 |
| El tablero | 89 a 418 | A2, A3, A4, A5 |
| Las libretas | 160 a 218 | A4 |
| El mayor | 170 a 200 | A4, A5 |
| El par | 91 a 112 | A5 |
| Filas del año | 117 a 413 | A0 |

## 9. Para otros

- **Ukyo:** el tope de 220/319 de su §16 no contaba la banda. Con la devolución visible, el tope real a 320 es **206** (§1). Hanayama propone que la regla diga: «figura ≤ 206 a 320, con la banda de 66 debajo».
- **Katsumi:**
  - A4 no tiene Cierre propio, porque p5 decide y cierra a la vez. Es contenido y lo decide ella.
  - C2 pide un texto de «porqué» para el segundo error en cada pantalla Haz.
  - La salida «Pagar» de A1 p3 necesita su texto de razón para la banda.
- **Baki:** el estado de cada pieza pasa al contenedor, con la clave `tema/pieza/caso` («Anterior» no deshace). No se borra nada.

## 10. Lo que no se verificó

- Los modelos del §3 son cálculos sobre las medidas de hoy; ninguno está construido.
- No hay ninguna captura de un slide.
- «$1.274.200» se midió sin `tabular-nums`.
- El nivel de gancho es provisional.
