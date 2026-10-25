# Lote T2-1 · decisiones de L (23-oct-2026)

Entregas del lote, copiadas en esta carpeta:
- Near: `c-t2-1-near-lote.md`, con el hilo de las 5 Aprender en slides, tres Hacer nuevas y los subtemas.
- Watari: `c-t2-1-watari-tres-hacer.html`, con la forma de tres Hacer nuevas y maquetas medidas a 320 y 375 px.
- Mello: `c-t2-1-mello-linea-base.md`, con la línea base de las Aprender y los criterios S1-S13 y H1-H10.
- Misa: #471, con el inventario, la línea base de las sondas y #482 (subtemas, en borrador).

Todo lo de abajo se puede deshacer, y lo decide L con la vara de Mateo.

## 1. Las tres Hacer nuevas: manda la forma de Watari

Near lo dejó dicho («si choca, manda la de Watari y yo ajusto los bancos»). Los ids de Near (`cu-pasalo-al-mayor`, `cu-se-queda-o-se-cierra`, `cu-la-linea-que-falta`) **no se usan**.

| Orden | id | Nombre | Nivel | Subtema |
|---|---|---|---|---|
| 8.º | `cu-cuadra-por-valor` | Cuadra por valor | Medio · 25 FP | Partida doble: igualdad del debe y el haber |
| 9.º | `cu-del-diario-al-mayor` | Del diario al mayor | Medio · 25 FP | Libro mayor y mayorización |
| 10.º | `cu-las-que-vuelven-a-cero` | Las que vuelven a cero | Fácil · 10 FP | [regla] por `clase`: real → Clasificación de cuentas reales · nominal → Clasificación de cuentas nominales |

Las tres van antes de El Ciclo Completo. Ninguna reusa los cinco ids retirados en la 0043.

**Bancos, sobre la forma de Watari y con los criterios de Mello (H1-H10):**
- **Cuadra por valor.** De 6 a 8 casos (3 de completar, 2 de juzgar y de 1 a 3 de encontrar), con las tres trampas de Watari. En juzgar y encontrar entran los cuatro errores que pide Mello: monto traspuesto (la diferencia es divisible por 9), valor llevado al lado contrario, renglón omitido y renglón duplicado. Los asientos de N-3 (Lavado ene-03, ene-04, ene-12 y los dos de cu10) son la base del tipo completar.
- **Del diario al mayor.** Usa el caso de Lavado del 2 al 12 de enero (CORTE_SET_A) que Near ya verificó, recortado al tope de Watari: 4 cuentas y 7 renglones por caso. Lleva sus dos tipos, destino y origen. El saldo queda fuera: lo practica «El saldo de la cuenta», como decidió Watari, y con eso se cubre el error de Mello «saldo del lado del último movimiento».
- **Las que vuelven a cero.** Es binaria, como la diseñó Watari: «Vuelve a cero en el cierre» o «Pasa al mes siguiente con su saldo». La familia (ingreso, gasto o costo) se nombra en el retro, no en una segunda pregunta. Entran como ítems las trampas de Near (Cuentas por cobrar, Documentos por pagar) y las de Mello (lo pagado por anticipado es activo y un cobro es Caja). La cuenta se llama «Costo de ventas», como en T2.

## 2. Aprender en slides: el hilo de Near, con los criterios S1-S13 de Mello

- Cada pieza abre con una slide de **objetivo** de una oración (S1). Near no la traía.
- Nunca más de **2 slides seguidas de solo leer** (S3), y en cada pieza aparecen las dos confusiones de S9.
- **P3·1:** sale la fecha «5 de mayo». El repo no la trae y no se inventan datos. Queda «Caleja hace dos registros…».
- Los datos nuevos van en `src/data/contabilidadAprenderSlides.js`. Los objetos de CuatroCapas no se tocan, y `textual: true` queda letra por letra.
- La forma (la cáscara de las slides) espera el patrón de Ukyo y el componente compartido de Erwin.

## 3. Subtemas del Repaso Diario

Queda la lista cerrada de 12 de Near, con los ids de la tabla de arriba. El módulo es `src/data/contabilidadT2Subtemas.js` (#482). `src/repaso/*` lo conecta Erwin. Los nombres de las etapas del desafío son los que ya trae `DESAFIO.pesos[].subtema`, y ningún campo `subtema` existente cambia de nombre.

## 4. Parada anunciada

Las tres Hacer necesitan su fila en el catálogo de FP del servidor. La migración solo agrega filas y va en el rango de la Célula C (desde la 0116). Correrla en producción no lo decide la célula: cuando el PR esté listo, va por issue `miku` a Erwin y a Mateo. Es la única parada del plan.

**Actualización del 24-oct (orden de Mateo vía Miku): Mateo ya no da vistos buenos.** La 0116 solo agrega filas y no espera a nadie. Las migraciones son de Erwin, así que él la corre cuando se fusione el PR. La parada real que queda es otra: las tres Hacer no se fusionan antes de que Erwin cierre #500 (`AGREGADAS_DESPUES` y `resumen.js`), porque sin eso los estudiantes que ya completaron T2 perderían «tema completo», y eso sí es irreversible para ellos. L fusiona lo de la célula cuando Mello dé PASA y el CI esté verde.

---

# Lote T2-2 · decisiones de L (23-oct-2026, 12:00)

Entregas: Near `c-t2-2-near-lote.md` (bancos de las tres Hacer sobre la forma de Watari, slides con S1-S13, subtemas) y Watari `c-t2-2-watari-figuras.md` + `.html` (la figura de cada slide, 152 estados medidos). La de Mello (auditoría de la forma) sigue en curso.

**Los huecos de Near:**
1. **Página de Caleja (cal-2, cal-3, cal-5).** El repo no la trae y nadie de la célula tiene el capítulo. Esos ítems quedan rotulados «Basado en el libro» (H2), y no se pide el capítulo solo por esto.
2. **«Gastos pagados por anticipado».** Pasa a **«Seguros pagados por anticipado»**, el nombre que ya usa el canon de los temas 1-3 (`contabilidad.js`). Sigue siendo un activo y la trampa es la misma.
3. **«Costo de ventas» contra «Costo de mercancía vendida».** T2 dice «Costo de ventas». T7 está oculto este semestre, así que no hay choque visible. Queda anotado para cuando T7 vuelva; no va a Erwin.
4. **Cierre anual en «Las que vuelven a cero».** Se acepta el de Near. Watari ajusta los rótulos de la figura de mes a año.

**Los ajustes de Watari a las slides se aceptan todos:**
- A1·6: el saldo cae en el lado elegido, sin rechazo.
- A1·7: el selector va entre Caja y Documentos por pagar.
- A3·6: la familia se queda donde cayó, sin rebote.
- A3·7: el asiento tiene 3 o más líneas, para la confusión de S9.
- A4: los dos libros van uno encima del otro.
- A5·7: van cifras, no barras.

El texto de las slides de Near no cambia. Solo cambian las frases «VE…» que corresponden. Las slides de objetivo son las de Near, no las [W].

**Lote T2-3:**
- **Near** aplica los ajustes de Watari y los huecos 1 y 2 sobre su v2. Entrega solo el delta, no el archivo entero.
- **Watari** renumera sus figuras a la v2 de Near (con la slide 0 de objetivo y las marcas [lee], [toca] y [decide]) y comprueba que los bancos de Near quepan en sus formas: tope de cuentas y renglones, largo de nombres a 320 px.
- **Mello** termina la auditoría de la forma. Después audita los bancos de `c-t2-2-near-lote.md` §1 contra H1-H10.

---

# Lote T2-3 · decisiones de L (24-oct-2026)

Entregas: Near `c-t2-3-near-delta.md` (los siete ajustes de Watari y los huecos) y Watari `c-t2-3-watari-figuras.md` + `.html` (figuras pasadas al patrón #470, 212 estados de Aprender y 40 de Hacer medidos; los bancos de Near caben en las tres formas).

- **Nombre del anticipo:** queda «Seguros pagados por anticipado». Near ya lo aplicó en VC·6; la pregunta que dejó abierta Watari queda resuelta.
- **P4·8:** manda el delta de Near. El asiento de tres líneas es ene-04 (1 contra 2, $4.800), no ene-03. La figura de Watari sirve para cualquier número de líneas: Misa la construye con ene-04, y Watari solo cambia la etiqueta en su próximo delta. P4·7 («Simple / Compuesto») sigue con ene-30 y ene-03.
- **Cuadra por valor E1:** pasa a Caleja cal-4 («Basado en el libro»), para que la Aprender P4·8 no delate la respuesta (C1).
- **El patrón #470 manda sobre las figuras:** Míralo y Haz; el error tentativo en coral sin cambiar el modelo; un cierre sin acción obligatoria (por eso P3 tiene 9 pantallas); controles neutros; reserva de figura de 220 px o menos a 320 px.
- **Bancos de las tres Hacer para Misa:** `c-t2-2-near-lote.md` §1 con el delta de `c-t2-3-near-delta.md`. Para la forma, el delta CSS de `c-t2-3-watari-figuras.md`.

---

# Auditoría T2-3 de Mello · decisiones de L (24-oct-2026, 15:45)

Entrega: `c-t2-3-mello-auditoria.md`. #482 y #494 tienen PASA y ya están fusionados (76be9fb y 525e52d). Las Hacer quedan así: Cuadra por valor FALLA, Del diario al mayor FALLA y Las que vuelven a cero PASA.

**Se acepta todo lo que propone Mello:**
- **Cuadra por valor, forma:** en completar, las columnas se mueven solo al «Comprobar» (C4-1). Lleva una prueba C5 de geometría: el tramo del hueco no cambia con la cifra escrita. En juzgar y encontrar, la fila de sumas y las columnas aparecen después de la decisión. En completar, la suma del lado del hueco dice «?».
- **Cuadra por valor, banco:** K3 pasa a juzgar como J3 («Cuadra»), así que quedan 2 completar, 3 juzgar y 3 encontrar. E1, E2 y E3 se reemplazan por los de Mello: tres renglones, uno solo malo, que se encuentra por el valor. J1 y J2 toman los textos de Mello, que miden 66,2 y 66,3.
- **Del diario al mayor:** se aprueba el tercer tipo de ítem, **«revisar»** (el punteo). Se quitan los destino A1, A4, B4 y B5 (C1). Cada caso queda con 3 destino, 2 origen y 2 revisar. La cuadrícula de T se baraja en cada intento (H6). Sigue sin saldo y sin elegir el lado.
- **Las que vuelven a cero:** el periodo sale de los datos (`mes` y `mesSiguiente`), no del componente.

**Lote T2-4:**
- **Near:** los retros por línea mala de los nuevos E1, E2 y E3. Los 2 ítems «revisar» por caso, con dos tipos de error distintos: cuenta vecina, cifra traspuesta o lado contrario. Por cada uno, la línea mal pasada, su porqué y el retro por cada línea buena tocada.
- **Watari:** las líneas de la T compacta como botones de 44 px, para «revisar», medidas a 320 px en la cuadrícula de 2 × 2. Y el ajuste de Cuadra por valor en la forma: las columnas al «Comprobar», y las sumas después de decidir.
- **Misa:** construye en #499 todo lo que ya está cerrado (Las que vuelven a cero completa, y los cambios de Mello en Cuadra por valor y en Del diario al mayor). «Revisar» lo agrega cuando lleguen el banco de Near y la forma de Watari.

---

# Lote T2-4 · decisiones de L (24-oct-2026, 16:30)

Entregas: Near `c-t2-4-near-delta.md` (retros de los E1-E3 de Mello y los ítems «revisar» de los casos A y B) y Watari `c-t2-4-watari-figuras.md` + `.html` (Cuadra por valor: las columnas se mueven al «Comprobar» y las sumas aparecen después de decidir; «revisar» con líneas de 44 px y cotejo Diario/Mayor; 42 estados medidos).

- **E3, un término, un nombre:** dice «la deuda del computador», igual que cal-2 y J2.
- **E1 de Cuadra por valor:** manda el de Mello (tres renglones: Cuentas por pagar D · Caja 6.000 D · Bancos 4.000 H). La maqueta de Watari todavía muestra el E1 anterior, de dos renglones; la forma sirve igual.
- **«Revisar»:** el banco es el de Near (A6, A7, B6 y B7, con las plantillas Rv, Rt y Rl) y la forma, la de Watari (cotejo con «=» y «≠», acierto en neutro porque el error es del libro, y la T sin ser botón). Las cifras van hasta 9.999.
- **Mello audita** el delta de Near, las figuras de Watari y el logito (#516) antes de fusionar.

---

# Auditoría T2-5 de Mello · decisiones de L (24-oct-2026, 17:25)

Entrega: `c-t2-5-mello-auditoria.md`. #516 (logito) llegó rebasado, con una sola definición, la ficha de 10 y el CI verde, que eran las correcciones mínimas de Mello. **Está fusionado (a5d9ae9).** #512 queda cerrado.

Las correcciones de Mello son de una línea o de una celda, y ya vienen escritas y medidas. Por la regla j, **las aplica Misa directo en #499**, sin otra vuelta por Near ni por Watari:
- **«Iba aquí» a los 0,7 s del error (H7),** tanto en Cuadra por valor como en «revisar». El orden es: 0 ms la consecuencia, 380 ms la pastilla y el retro, y 380 + 700 ms «Iba aquí» (en «revisar», «Iba en la línea punteada»). Así quedan las constantes de main (`RETARDO_IBA_MS = 700`). Con esto se corrige la frase de `c-t2-4-watari-figuras.md` que decía «la pausa baja a 380 ms».
- **A6:** la línea mala pasa a ser Bancos · H · 4 ene · 4.000 (antes iba en Flota), con el porqué de Mello. Así A6 y A7 ya no caen en la misma T.
- **Rv, Rt y Rl:** pierden la primera oración, que repetía lo que ya pinta el cotejo. Los textos son los de Mello.

Con esto Mello aprueba las tres Hacer sin otra vuelta. #499 sigue esperando #500.

---

# Lote T2-7 · Aprender de T2 en SecuenciaAprender (24-oct-2026, 18:20)

`SecuenciaAprender` ya está en main (#491) y su uso se explica en #492. La cáscara de las slides deja de estar bloqueada. Lo que exige el componente y no estaba en nuestro material:
- **Titular de 10 palabras o menos en cada pantalla** (§3.3). Los cierres de Watari llevaban como titular la pregunta de Near, de más de 10 palabras: la pregunta pasa al apoyo y el titular la resume.
- **Apoyo de una o dos frases** (25 palabras como objetivo) y **60 palabras por pantalla** como máximo.
- **`razon`** en cada Haz: por qué «Siguiente» espera.
- **Alto de figura de 206 px a 320 y de 253 a 375** como tope (Hanayama, #513, que entra con #524). Watari reservó hasta 218 a 320 (con el tope viejo de 220 de #470): P1 213, P3 214, P4 212 y P5 218 se pasan.
- **Contabilidad tiene estudiantes:** la página vieja no se borra. La secuencia entra al lado, detrás de una bandera del tema, y el cambio se deshace en una línea. CuatroCapas no se toca.

**Reparto:**
- **Misa:** monta P1 (`cu-a1`) primero, mide las paradas del §12 (cabecera, bloque pegado, ficha de FP, titular más largo) y las deja en el PR. Después monta P2-P5. Usa `faltasDePieza(pieza) → []` en la prueba, y `responderHaz`, `resuelta` y `<Veredicto />` para el Haz. Las figuras salen de `c-t2-3-watari-figuras.md` y los textos, de la v2 de Near más los deltas T2-3. Lo que traigan Near y Watari en T2-7 entra encima.
- **Near:** el titular de 10 palabras o menos de cada pantalla que se pase, el apoyo de los cierres y la `razon` de cada Haz. Solo el delta.
- **Watari:** baja las figuras de P1, P3, P4 y P5 a 206 px o menos a 320. Solo el delta.
- **Mello:** espera lo construido. La verificación final la hace sobre el PR.

---

# Entregas T2-7 · decisiones de L (24-oct-2026, 19:15)

Entregas:
- Near, `c-t2-7-near-delta.md`: titular de 10 palabras o menos, apoyo y razón para las 44 pantallas, y cuatro pares nuevos de pista y devolución. Ninguna pantalla pasa de 60 palabras.
- Watari, `c-t2-7-watari-figuras.md` + `.html`: `altoFigura` medido por pieza (P1 183, P2 171/158, P3 180/173, P4 181/178, P5 197), todas por debajo de 206. La pastilla sale de la figura y las frases de consecuencia caben en una línea.
- Misa, #548 en borrador: P1 montada, con las paradas del §12 medidas (cabecera de 105/107, bloque de 68 y titular de 54 caracteres en 3 renglones a 320).

Decisiones:
- **P4·8 y P4·9 van con ene-04** (1 contra 2, $4.800), como se decidió en T2-3. La maqueta de Watari todavía dice ene-03, y manda la decisión. P4·7 sigue con ene-30 y ene-03.
- **`<Veredicto />` no va dentro de la figura** mientras Erwin no dé una zona para la devolución (#536 de Watari y el issue `miku` de Misa). Hasta entonces la secuencia queda detrás de la bandera apagada. Se puede fusionar con la bandera apagada, porque es reversible y ningún estudiante la ve.
- **El porqué de P3·4 al segundo error** debe bajar a 16 palabras o menos (hoy ocupa 4 renglones a 320). Va para Near en su próximo lote.
- **Mello verifica las cinco piezas juntas**, cuando Misa haya montado todo, para gastar un solo turno de auditoría.

---

# #548 con las cinco piezas · decisiones de L (24-oct-2026, 21:20)

Misa montó las cinco piezas (4e817f3) con la bandera apagada, y `faltasDePieza` da `[]`. Quedan tres rojos honestos:
- **P1·6, el selector de 231 px contra 183:** **no lleva selector.** La figura de P1·6 es la de Watari en T2-3: la T de Cuentas por pagar de Lavado, con «Sube» y «Baja». El selector entre Caja y Documentos por pagar era el ajuste A1·7 de T2-2, y la figura de T2-3 lo reemplazó; con el selector, el VE de Near para P1·6 sobra. Así se respeta el alto medido de 183.
- **P3·7, la pista del primer error, y P2·5, el ejemplo de Ingresos:** los escribe Near (lote T2-8). En el mismo lote, Near acorta el porqué de P3·4 a 16 palabras o menos.

---

# #548 listo y traspaso de Misa · decisiones de L (24-oct-2026, 23:05)

- **#548:** el CI está verde (41ae301) y salió de borrador con la bandera apagada. Mello hace la verificación final (lote T2-9).
- **Traspaso de Misa:** fusionado (#568, `orquestador/traspasos/misa.md`).
- **Pendientes de Near para #499** (lote T2-9): el porqué de los 4 ítems de origen, la frase de acierto de «revisar», el hecho de J3, el pie de fuente y el «Así se juega» de las tres.
- **Pendientes de Watari que deja Misa:** los decide L, sin otra vuelta.
  - **Pausa de 0,7 s con movimiento reducido:** se mantiene. Es tiempo de lectura, no movimiento: con movimiento reducido no hay animación, pero «Iba aquí» llega igual a los 0,7 s del error.
  - **Especificidad de `.bar.fijo`:** es técnica y la resuelve Misa en el código. Lo que importa es que el tramo fijo de 28 px no lo pise otra regla. La prueba C5 de geometría lo vigila.

---

# Auditoría T2-9 de Mello y delta T2-9 de Near · decisiones de L (24-oct-2026, 23:45)

Entregas:
- Mello, `c-t2-9-mello-auditoria.md`: verificación final de #548. Las cinco piezas FALLAN por dos faltas comunes y algunas de una línea, con los textos ya medidos. Gancho, hilo, S9, D3, S11, S12 y S13 pasan, y la medida sale limpia.
- Near, `c-t2-9-near-delta.md`: los cinco textos que faltaban en #499.

**Se acepta todo lo de Mello.** En #548 (Misa, lote T2-10):
- **Lote A, barajar:** un solo ayudante en `secuenciaComun.jsx`, que baraja una vez y guarda el orden en el estado. Aplica en P1·6, P2·4, P2·6, P2·7 (las seis cuentas), P3·4, P3·7, P4·6, P4·8 y P5·6. No se baraja lo que enseña el orden: el debe y el haber, las casas y los platillos, los cajones «Sigue» y «Vuelve a cero», y las predicciones. Lleva su prueba de barajado.
- **Lote B, pie de página:** «Basado en el libro, pp. …» en la `razon` del cierre de cada pieza. Near confirma las páginas de cada una.
- **P1:** las cifras de Caja salen de `DE_QUE_ESTA_HECHA.ejemplo`, y las del cierre ($50 y $30) pasan a `contabilidadT2Secuencia.js`.
- **P3:** el porqué de «vive a la derecha», con el texto de Mello. El préstamo sale de `cu6-pagare` y del saldo inicial de Caja. P3·3 pierde su primera oración (queda en 33 palabras).
- **P4:** las palabras se parten por palabra, no por letra (`overflow-wrap: break-word`, `hyphens: auto`, `lang="es"`). El control «Partida doble» pasa a «Aplicar la regla».
- **P5·5:** se quita la orden repetida del apoyo (queda en 36 palabras).
- Se quitan los comentarios `PENDIENTE_DE_REVISION` de los controles que ya pasaron.

En #499 (C1 entre Aprender y Hacer):
- **Cuadra por valor E3:** el cheque pasa a $760, con Cuentas por pagar 630 D, Hipoteca 400 D y Bancos 760 H. El porqué y el retro de Bancos son los de Mello.
- **Las que vuelven a cero:** VC·1, VC·3 y VC·7 se repiten con P2. Se cambian por nominales que no estén en P2 (Mello propone Ingresos por intereses y Gastos por arriendo, más un segundo gasto en lugar de Costo de ventas), con los mismos saldos para que la utilidad siga en $10.500. Near escribe los nombres, los porqués y los retros.
- **Textos de `c-t2-9-near-delta.md`:** entran tal cual (porqué de origen, acierto de «revisar», J3, pies de fuente y «Así se juega»).

**Para Erwin, no es falla de la célula:** los nombres de fase de SecuenciaAprender («Mírelo funcionar», «Ahora pruebe usted») están en «usted», y el contenido va en «tú». Se avisa en #492.

---

# Auditoría T2-11 de Mello · decisiones de L (25-oct-2026, 02:30)

`c-t2-11-mello-auditoria.md`: #548 (e65b062) pasa en 7 de 9 puntos. Fallan dos, y en los dos la receta de T2-9 era de Mello. Ya probó los arreglos en un build.
- **P4, las palabras se parten a 320:** se arregla en la célula, en el `Renglon` de `secuenciaP4.jsx`, con tres cambios: `flexWrap: "wrap"`, el nombre con `minWidth: "min-content"` y `overflowWrap: "normal"`, y la cifra con `marginLeft: "auto"`. La prueba de P4 pasa a buscar eso. **Mello aprueba #548 cuando entre este cambio, sin otra ronda**: lo fusiono con el CI verde.
- **El pie no se pinta en los cierres:** `SecuenciaAprender` solo pinta la razón mientras espera respuesta. Es una línea en lo compartido (Erwin), y va en #536, que es la condición para encender la bandera. Los datos ya están en #548.
- **Decisión de Mello, aceptada:** el pie de fuente no cuenta para el tope de 40 palabras, porque es una cita, como «Escenario simulado».
