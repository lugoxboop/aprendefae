# Paquete e3 · T3 · «¿Gasto o pago?» v3 (`t3-gasto-o-pago`) · PARA CONSTRUIR (24-oct-2026)

> Ficha de Miyata (lote 4), P2 de Itagaki (v3) y **veredicto de Takamura: PASA de diseño con condiciones C1 a C6**. Ippo construye aplicando las condiciones y Takamura las verifica en las capturas a 320 y 375.
> **Lo que manda, en orden:** (1) las condiciones de Takamura (§0), (2) los textos de Miyata (§2 a §5), (3) la forma de Itagaki (§6 a §9). Cuando chocan, gana el número más bajo.
> Solo agrega: ningún id ni texto aprobado cambia. Contabilidad tiene estudiantes activos.

## 0 · Condiciones de Takamura (se aplican al construir)

- **C1 · Textos (sustituyen los de Miyata):**
  - Consigna: «Lee el hecho. Toca la casilla que dice si hubo gasto y si salió plata.»
  - Paso 3: «Toca la casilla donde caen tus dos respuestas.»
- **C2 · Rótulos de la matriz:** ROTULO_SIN_SALIDA = «No salió»; ROTULO_SIN_GASTO = «Sin gasto».
- **C3 · La línea «lo que habría sido» (H1):**
  - Una sola leyenda a todo el ancho, encima de los contadores: «Punteado: así quedaba con tu toque».
  - Bajo cada contador que cambia, solo la cifra en mono 12.
  - Los cuadrantes **bajan a 56 px** de alto. Las fichas caben (22 + 4 + 22 = 48), y la matriz termina dentro de los 512 px útiles a 320 × 568.
- **C4 · Errores:** manda la tabla de Miyata (§4): ERROR_A a ERROR_D, con sus variantes. La numeración vieja de Itagaki (E1 a E6) queda sin efecto. Se muestran hasta dos textos, primero el de la fila (gasto) y después el de la columna (salida).
- **C5 · Versiones y pie:**
  - Se construyen **A y B, que se alternan por intento** (intentos impares A, pares B, con `useIntento`). La A no espera el #468.
  - **Sin pie:** el «Escenario simulado» ya va en el texto del hecho.
- **C6 · INFLESZ:** todos los textos se miden con el medidor oficial (`npm run inflesz`). La réplica de Miyata no vale como medición. Hay que vigilar b3, b5, b7 y b8, que están en 65,9 en la réplica, justo en el borde.

**Lo que Takamura verifica en las capturas:**
- D9 (la matriz);
- que todo quepa en la ventana de 512 px, con el encabezado medido;
- el estado de error con su barra punteada.

## 1 · Datos de catálogo

- **Id:** `t3-gasto-o-pago`
- **Nombre:** «¿Gasto o pago?»
- **Tipo y valor:** HACER, evaluativa, dificultad media, 25 FP
- **Ubicación:** en el camino de T3, **inmediatamente después de «¿Ingreso o cobro?»**. Se inserta sin reordenar lo existente.
- **Partida:** N = 6 hechos, sacados de un banco de 8 por versión. Siempre entra el hecho «ni gasto ni salida», y al menos uno de cada tipo: G+S (gasto y salida), G (gasto sin salida) y S (salida sin gasto).
- **Subtema del Repaso Diario:** [fijo] «Gasto y pago».

## 2 · Textos fijos (Miyata, con C1 aplicado)

| Texto | Literal |
|---|---|
| Consigna | Lee el hecho. Toca la casilla que dice si hubo gasto y si salió plata. |
| Paso 1 | Pregúntate si la empresa ya consumió algo para poder vender. |
| Paso 2 | Pregúntate si ese día salió plata de la caja. |
| Paso 3 | Toca la casilla donde caen tus dos respuestas. |
| CIERRE_GASTO_O_PAGO | Gastar es consumir; pagar es sacar plata. Unas veces pasan el mismo día y otras no. |

Textos fijos de interfaz (Itagaki): «Hecho n de 6», «Siguiente hecho», «Ver mi resumen», «Correcto», «No va aquí», «Iba aquí». Literales ya publicados que se reutilizan: «Gastos» y «Salió».

## 3 · Bancos (todo es «Escenario simulado», sin pie)

Tipos: **G+S** = gasto y salida · **G** = gasto sin salida · **S** = salida sin gasto · **ni-ni** = ni gasto ni salida.

### Versión A · Peluquería Doña Inés, mayo

| id | Hecho | Tipo | porQue | Acierto |
|---|---|---|---|---|
| a1 | Escenario simulado. Le pagó a la asistente $450.000 por su trabajo de mayo. | G+S | — | La asistente ya trabajó y se le pagó. Hubo gasto y salió plata. |
| a2 | Escenario simulado. Pagó $180.000 de la luz de mayo. | G+S | — | Ya usó la luz del mes y la pagó. Hubo gasto y salió plata el mismo día. |
| a3 | Escenario simulado. Usó y pagó $150.000 de champú y tintes en mayo. | G+S | — | El champú y los tintes se usaron con los clientes. Hay gasto y hay salida. |
| a4 | Escenario simulado. Le hicieron un arreglo en mayo. Lo paga en junio: $200.000. | G | — | El arreglo ya se hizo: hay gasto. La plata sale en junio. |
| a5 | Escenario simulado. Usó el internet de mayo. Lo paga en junio: $160.000. | G | — | Ya usó el internet del mes: hay gasto. La factura se paga después. |
| a6 | Escenario simulado. Compró y pagó un secador de $500.000. | S | tiene | Salió plata, pero el secador sigue en el salón. Todavía lo tiene. |
| a7 | Escenario simulado. Pagó en mayo los $220.000 de la luz que usó en abril. | S | deuda | Salió plata, pero esa luz se usó en abril. En mayo solo paga la deuda. |
| a8 | Escenario simulado. Compró a crédito $350.000 de champú que va a vender. | ni-ni | tiene | No salió plata y el champú sigue en el estante. Por ahora solo nació una deuda. |

### Versión B · Taller La Cadena, abril

| id | Hecho | Tipo | porQue | Acierto |
|---|---|---|---|---|
| b1 | Escenario simulado. Le pagó $600.000 al ayudante por abril. | G+S | — | El ayudante ya trabajó y se le pagó. Hubo gasto y salió plata. |
| b2 | Escenario simulado. Pagó $250.000 de la luz de abril. | G+S | — | Ya usó la luz del mes y la pagó. Hubo gasto y salió plata el mismo día. |
| b3 | Escenario simulado. Usó $150.000 de grasa y cinta, que pagó ese día. | G+S | — | La grasa y la cinta se usaron en las reparaciones. Hay gasto y hay salida. |
| b4 | Escenario simulado. Usó un compresor en abril. Lo paga en mayo: $300.000. | G | — | Ya consumió el compresor: hay gasto. La plata sale en mayo. |
| b5 | Escenario simulado. Pagó de contado $600.000 de repuestos que va a vender. | S | tiene | Salió plata, pero los repuestos siguen en el estante. Todavía no es gasto. |
| b6 | Escenario simulado. Pagó en abril los $190.000 del agua que usó en marzo. | S | deuda | Salió plata, pero esa agua se usó en marzo. En abril solo paga la deuda. |
| b7 | Escenario simulado. Le pagó al banco $500.000 de la deuda, sin intereses. | S | prestamo | Salió plata, pero no consumió nada. Solo bajó lo que le debe al banco. |
| b8 | Escenario simulado. Compró a crédito $400.000 de repuestos que va a vender. | ni-ni | tiene | No salió plata y los repuestos siguen en el estante. Solo nació una deuda. |

**Comprobación de la escala (Takamura, recalculada).** La barra de cada contador ocupa el ancho completo cuando vale la suma de todos los montos de su versión.
- **A:** Gastos 1.140.000 y Salió 1.500.000; la suma de todos los montos es 2.210.000. El monto menor, 150.000, mide **7,7 px** a 320.
- **B:** Gastos 1.300.000 y Salió 2.290.000; la suma es 2.990.000. El monto menor, 150.000, mide **5,7 px**.
- Las dos versiones pasan el mínimo de 4 px, así que todo hecho mueve su barra.

## 4 · Errores (Miyata · mandan por C4)

| Ranura | Cuándo | Variante | Literal |
|---|---|---|---|
| ERROR_A | Había gasto y no lo marcó | Tipo G | Sí hubo gasto: la empresa ya consumió algo para vender. Que la plata no haya salido no lo borra. |
| | | Tipo G+S | Sí hubo gasto: lo que pagó ya se consumió. Pagar y consumir pasaron el mismo día. |
| ERROR_B | Marcó gasto donde no hubo | porQue «tiene» | Aquí no hubo gasto. Lo que compró todavía lo tiene: no lo ha consumido. |
| | | porQue «deuda» | Aquí no hubo gasto. Pagó una deuda: el gasto se anotó cuando se consumió. |
| | | porQue «prestamo» | Aquí no hubo gasto. Devolver un préstamo no es consumir: solo baja lo que se debe. |
| ERROR_C | Marcó salida sin plata | Tipo G | No ha salido plata. La empresa consumió y quedó debiendo: la caja se mueve después. |
| | | Tipo ni-ni | No ha salido plata: la compra fue a crédito. Por ahora solo nació una deuda. |
| ERROR_D | Había salida y no la marcó | — | Sí salió plata: el hecho dice que pagó. |

Como hay a lo sumo un error por cada pregunta, se muestran como máximo dos: primero el de gasto (A o B) y después el de plata (C o D).

## 5 · Tutorial: EJEMPLO_GASTO_O_PAGO

| Campo | Literal |
|---|---|
| empresa | Una panadería |
| hecho | Escenario simulado. Ya usó la harina del mes. La paga el otro mes: $300.000. |
| respuesta | Gasto sí, salida no (tipo G) |
| resolución | La harina ya se usó: hay gasto. La plata sale el otro mes, así que hoy no hubo salida. |

## 6 · Forma (Itagaki v3)

**Idea:** cada hecho cae en una de cuatro casillas, según dos preguntas: ¿se consumió algo? y ¿salió plata? Los casos cruzados quedan en diagonal, así que «Gastos» y «Salió» suman cosas distintas. En «ni gasto ni salida» no se mueve ningún contador.

**Superficie y contenedor**
- Superficie #1C2939, borde de 1 px rgba(248,249,250,.12), radio 12.
- Contenedor de **258 px a 320 y 313 px a 375**: 234 / 289 px útiles.

**Estructura**, de arriba abajo, con los mismos altos a 320 y a 375:

| Bloque | Alto | Detalle |
|---|---|---|
| Encabezado de Hacer | 76 [supuesto] | «Hecho n de 6». **Ippo lo mide: si pasa de 80, avisa** (§9) |
| Espacio | 16 | |
| Ficha del hecho | 130 | Empresa en 12/700 #A8B6C8; hecho en Inter 15/22, de 90 caracteres o menos; **sin pie** (C5) |
| Espacio | 12 | |
| Matriz con sus contadores | ver abajo | Empieza en 234 px y termina dentro de los 512 útiles |
| Espacio | 16 | |
| Bloque de mensaje y «Siguiente hecho» | — | Aparecen después del toque |

**Interior de la matriz** (relleno de 12):
- **Cabecera** (36 px): a la izquierda, una columna vacía de 56 px. Sobre las dos columnas, «No salió» y «Salió», en Inter 12/600 #A8B6C8, en hasta 2 líneas.
- **Fila de arriba:** el rótulo «Gastos», el cuadrante «gasto sin salida» y el cuadrante «gasto con salida».
- **Fila de abajo:** el rótulo «Sin gasto», el cuadrante «ni gasto ni salida» y el cuadrante «salida sin gasto».
- **Cuadrantes:** **56 px de alto** (C3); de ancho, 85 px a 320 y 112 px a 375. Cada cuadrante es un botón con contorno de 1 px rgba(248,249,250,.35) (3,01:1).
- **Leyenda** (C3) y, debajo, **los contadores**.

**Fichas caídas:** cuadrados de 22 × 22 con el número del hecho en mono 12 y radio 4; caben 3 por fila. La ficha del hecho en curso lleva borde de 2 px #F8F9FA; las anteriores, #B8C4D4.

**Contadores:** van lado a lado, de 113 px a 320 y 140 px a 375. Cada uno lleva:
- el rótulo «Gastos» o «Salió», en Inter 12/600 #A8B6C8;
- el total, en mono 14 #F8F9FA;
- una barra de 10 px con relleno #CBDCF2.

La escala es la misma para los dos contadores y fija por versión: la barra completa equivale a la suma de todos los montos de la versión. Si un monto midiera menos de 4 px, ese hecho mueve solo la cifra, sin barra (E11).

## 7 · Estados

| Estado | Detalle |
|---|---|
| Vacío | Los cuatro cuadrantes en reposo, con las fichas anteriores; los contadores en su acumulado |
| Foco | Anillo de 2 px #F8F9FA, separado 2 px |
| Presionado | El cuadrante se encoge a 0,98 |
| Calificación | Un toque califica en el acto (estándar §4.3); no hay botón «Comprobar» |
| **Bien** | El cuadrante toma 2 px #F8F9FA y la pastilla «Correcto». La ficha cae en él (320 ms) y solo se mueven los contadores que ese cuadrante toca (400 ms) |
| **Bien en «ni-ni»** | La ficha cae en el cuadrante de abajo a la izquierda y no se mueve ningún contador |
| **Mal** (D4, patrón de r5) | Ver los pasos debajo de esta tabla |
| Después del error | No hay reintento: aparecen el mensaje y «Siguiente hecho» |
| Último ítem | «Ver mi resumen» |
| Resumen | La matriz completa, con todas las fichas en #B8C4D4, los contadores finales y CIERRE_GASTO_O_PAGO |
| Movimiento reducido | Directo al estado final. Si falló, se ve todo a la vez: el cuadrante elegido en coral, «Iba aquí» en el correcto y la barra punteada |

**Cuando el estudiante falla**, pasa esto en orden:
1. El cuadrante elegido toma 2 px coral, el tinte rgba(231,111,81,.10) y la pastilla «No va aquí». La ficha cae ahí y los contadores se mueven según su respuesta.
2. A los 0,7 s, el cuadrante correcto toma 2 px #F8F9FA y aparece «Iba aquí».
3. A los 900 ms, la ficha pasa al cuadrante correcto (320 ms) y cada contador va a su valor correcto (400 ms).
4. Queda, con contorno discontinuo de 1 px #B8C4D4, la barra de cómo habría quedado con la respuesta del estudiante. Lleva la leyenda única de C3 y, bajo cada contador que cambia, su cifra en mono 12.

**Bloque de mensaje**
- Fondo rgba(184,196,212,.12), con raya de 3 px: #B8C4D4 si acertó, coral si falló.
- Muestra hasta dos textos, separados por 8 px (C4).
- Texto de error sobre el tinte: #EE8266 (4,97:1).

## 8 · Movimiento y accesibilidad

**Movimiento**
- Curva cubic-bezier(.3,.9,.4,1), solo transform y opacity.
- La ficha cae en 320 ms y los contadores cuentan en 400 ms. Si falló: 900 ms de espera y luego 320 + 400 ms de corrección.
- Un toque en la matriz salta al estado final. «Siguiente hecho» siempre completa la animación y avanza.

**Accesibilidad**
- Cuatro botones, cada uno con un nombre hecho de sus dos rótulos (por ejemplo, «Gastos y Salió»).
- `aria-live="polite"` anuncia «Gastos: $X. Salió: $Y.».
- El error se anuncia «Incorrecto.».
- Los íconos Check y X son de lucide, de 16 px y trazo 2,5, y solo van en las pastillas.

**Flujo:** «Así se juega» (con EJEMPLO_GASTO_O_PAGO) → hecho 1 → toque → caída → mensaje → «Siguiente hecho» → … → hecho 6 → «Ver mi resumen». Un hecho es acierto si el cuadrante es el correcto.

## 9 · Lo que Ippo mide antes de dar por bueno

- El alto del encabezado de Hacer. **Si pasa de 80 px, detente y avisa**: con la leyenda de C3, la matriz se saldría de los 512 px útiles.
- Que la matriz termine dentro de los 512 px a 320 × 568.
- Contraste, blancos de toque, piso de 12 px y que nada se salga de su caja, a 320 y a 375.
- El INFLESZ oficial de todos los textos (C6).
