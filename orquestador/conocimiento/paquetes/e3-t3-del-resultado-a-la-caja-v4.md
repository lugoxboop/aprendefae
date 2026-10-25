# Paquete e3 · T3 · «Del resultado a la caja» v4 (`t3-del-resultado-a-la-caja`) · PARA CONSTRUIR (24-oct-2026)

> Reúne la ficha v4 de Miyata (lote 8), el P2 v3 de Itagaki y el **veredicto de Takamura: PASA de diseño con condiciones A1 a A7** (lote 8). Ippo construye aplicándolas y Takamura las verifica en las capturas a 320 y 375, **más una pantalla de Pensamiento Estratégico** si se toca algo compartido.
> **Orden de prioridad:** (1) las condiciones de §0, (2) los textos de Miyata (§2 a §6), (3) la forma de Itagaki (§7 a §10). Si chocan, gana la de número más bajo.
> Solo agrega. Contabilidad tiene estudiantes activos.

## 0 · Condiciones de Takamura (ya integradas en el resto del paquete)

- **A1 · Versiones:** A en los intentos impares, B en los pares (`useIntento`). **No hay «Caso n de 2»:** cada partida juega un solo caso, y el contador es «Paso n de N».
- **A2 · Tarjetas de B:** son **6** (5 mueven la caja y 1 no). Con m = 5, el puente mide 250 px: 12 + 7 × 30 + 16 + 12 (el 210 que decía antes era solo 7 × 30; lo corrigió Takamura en #557).
- **A3 · Nombre largo de B:** «Arriendo abril–junio, por anticipado» (36 caracteres, justo en el tope de 36; lo corrigió Takamura en #557).
- **A4 · Textos que faltaban:**
  - TEXTO_CASO_A = «San Calixto abrió el 2 de enero. Este es su primer mes.»
  - ROTULO_CAJA_CIERRE = «Caja al cierre».
- **A5 · Datos de la tarjeta B:** son de control y **no van en pantalla**. Las fichas bastan para resolver.
- **A6 · ERROR_CUADRA_CON_ERRORES** = «Llegaste a la caja correcta, pero con dos fichas mal puestas: sus errores se cancelaron.» Se mide con el INFLESZ oficial.
- **A7 · Caja negativa:** si lo que daban las respuestas es negativo, no se dibuja el punteado; queda solo la cifra con su signo.
- **A8 (opcional, se aplica):** la leyenda dice «Punteado: así quedaba con tus respuestas».
- **INFLESZ:** todos los textos se miden con el medidor oficial (`npm run inflesz`). La réplica de Miyata no cuenta como medición.

## 1 · Datos de catálogo

| Campo | Valor |
|---|---|
| id | `t3-del-resultado-a-la-caja` |
| Nombre | Del resultado a la caja |
| Dificultad y FP | Difícil · 50 FP (evaluativa) |
| Lugar | Detrás de «Cerrar el periodo» (P5) y antes de «El cierre completo»; se inserta sin reordenar |
| Subtema del Repaso | [fijo] Resultado y caja |
| Versiones | A en los intentos impares, B en los pares |

## 2 · Mecánica (Miyata)

- Arriba va la tarjeta de la empresa, con el rótulo de su utilidad. Debajo, una ficha por paso, cada una con su nombre y su monto.
- Cada ficha tiene tres botones: «Suma», «Resta» y «No mueve la caja». «Comprobar» se activa cuando todas tienen una elección.
- **No hay meta ni total corrido** mientras el estudiante decide. La caja al cierre aparece solo después de comprobar.
- Al comprobar, aparece el puente completo hasta la caja correcta. Si el estudiante falló, el punteado muestra adónde lo llevaban sus respuestas (N8).
- Se califica la clasificación completa, con un intento y tarjeta por tarjeta.
- Se muestran los errores de las dos primeras fichas mal puestas, en el orden de las fichas. Si hay más, se agrega «Y hay más fichas por revisar.».
- Si la caja da correcta con fichas mal puestas, se muestra ERROR_CUADRA_CON_ERRORES (§0, A6). Pasa en A, con Equipo en «Suma» y Alquiler en «Resta».

## 3 · Textos comunes

| Texto | Literal |
|---|---|
| Consigna | Parte de la utilidad del mes. Pon cada ficha donde va y halla la caja al cierre. |
| Paso 1 | Mira la utilidad del mes. La caja empezó en cero. |
| Paso 2 | Por cada ficha, pregúntate si hace que la caja tenga más o menos plata que la utilidad. |
| Paso 3 | Ponla en Suma, en Resta o en No mueve la caja. |
| CIERRE_RESULTADO_CAJA | La utilidad mide lo que se ganó. La caja mide la plata. Las fichas explican la distancia entre las dos. |
| Varios errores | Y hay más fichas por revisar. |
| ROTULO_CAJA_CIERRE | Caja al cierre |
| Leyenda del punteado | Punteado: así quedaba con tus respuestas |

## 4 · Versión A · San Calixto, enero (cifras de P5)

- **TEXTO_CASO_A:** «San Calixto abrió el 2 de enero. Este es su primer mes.»
- **ROTULO_UTILIDAD_A:** «Utilidad antes del impuesto», con la cifra $3.950.
- **Pie:** «Basado en el libro, pp. 121-128 y 140».

| Ficha | Monto | Respuesta |
|---|---|---|
| Aporte en plata | $15.000 | Suma |
| Equipo aportado | $5.000 | No mueve la caja |
| Cuentas por cobrar – clientes | $6.800 | Resta |
| Alquiler por pagar | $2.500 | Suma |

- **Caja al cierre:** $14.650. Comprobación: 3.950 + 15.000 − 6.800 + 2.500 = 14.650 (es la Caja de P5 y la del libro, pp. 122 y 128).
- **Resultados de los errores probables:** equipo en Suma → 19.650 · cuentas por cobrar en Suma → 28.250 · alquiler en Resta → 9.650 · aporte en No mueve → −350 (A7: sin punteado).
- **Acierto A:** «Los $3.950 de utilidad, más el aporte y lo que se debe, menos lo que falta cobrar, dan los $14.650 de la caja.»

## 5 · Versión B · Estudio Foco, marzo · Escenario simulado

- **TEXTO_CASO_B:** «Escenario simulado. Estudio Foco abrió en marzo. Este es su primer mes.»
- **ROTULO_UTILIDAD_B:** «Utilidad del ejercicio», con la cifra $1.541.000.
- **Datos de control, que no van en pantalla (A5):** ingresos de marzo $6.400.000, de los que se cobraron $4.500.000; gastos $4.100.000, todos pagados; utilidad antes de impuestos $2.300.000; impuesto del 33 % por pagar, $759.000.

| Ficha | Monto | Respuesta |
|---|---|---|
| Aporte en plata | $5.000.000 | Suma |
| Préstamo recibido | $2.000.000 | Suma |
| Arriendo abril–junio, por anticipado | $600.000 | Resta |
| Cuentas por cobrar – clientes | $1.900.000 | Resta |
| Impuesto de renta por pagar | $759.000 | Suma |
| Equipo comprado a crédito | $1.500.000 | No mueve la caja |

- **Caja al cierre:** $6.800.000.
  - Por la utilidad: 1.541.000 + 5.000.000 + 2.000.000 − 600.000 − 1.900.000 + 759.000 = 6.800.000.
  - Por la caja: 5.000.000 + 2.000.000 + 4.500.000 − 4.100.000 − 600.000 = 6.800.000.
- **Acierto B:** «Escenario simulado. Los $1.541.000 de utilidad, más el impuesto que se debe, el aporte y el préstamo, menos el anticipo y lo que falta cobrar, dan los $6.800.000 de la caja.»

## 6 · Errores (un texto por ficha mal puesta) y tutorial

| Ficha | Versión | Literal |
|---|---|---|
| Aporte en plata | A | Los socios metieron plata a la caja, y un aporte no es ingreso. Por eso la caja tiene más que la utilidad. |
| Aporte en plata | B | Los socios metieron plata a la caja este mes, y un aporte no es ingreso. La caja tiene más por eso. |
| Equipo aportado | A | El equipo entró a la empresa, pero no es plata. La caja no lo ve. |
| Cuentas por cobrar – clientes | A y B | Esas facturas ya cuentan en la utilidad, pero la plata no ha llegado. La caja tiene menos por eso. |
| Alquiler por pagar | A | Ese gasto ya bajó la utilidad, pero la plata no ha salido. La caja tiene más por eso. |
| Préstamo recibido | B | El banco metió plata a la caja, y un préstamo no es ingreso. La caja tiene más por eso. |
| Arriendo abril–junio, por anticipado | B | Salió plata por un arriendo que aún no se usa. No bajó la utilidad, pero sí la caja. |
| Impuesto de renta por pagar | B | Ese impuesto ya bajó la utilidad, pero todavía no se paga. La caja tiene más por eso. |
| Equipo comprado a crédito | B | Ese equipo no movió la caja ni la utilidad: todavía no se paga y no es gasto. |
| (la caja cuadra con errores) | A | Llegaste a la caja correcta, pero con dos fichas mal puestas: sus errores se cancelaron. |

**Tutorial EJEMPLO_RESULTADO_CAJA** (no se califica):
- **Empresa:** Una panadería, escenario simulado.
- **Hecho:** «Ganó $300.000 este mes. Aún le deben $100.000.»
- **Rótulo:** «Utilidad del mes: $300.000».
- **Ficha:** Cuentas por cobrar – clientes, $100.000 → Resta.
- **Resolución:** «La utilidad fue $300.000, pero $100.000 no han llegado. La caja subió solo $200.000.»

## 7 · Forma (Itagaki v3, con A1 a A8 aplicados)

- Superficie #1C2939, con borde de 1 px rgba(248,249,250,.12) y radio 12. Ancho útil: 234 px a 320 y 289 px a 375.
- **Contraste:** texto #F8F9FA, 13,98:1 · atenuado #A8B6C8, 7,15 · nodo #CBDCF2, 10,57 · coral 4,77 · contorno en reposo 3,01.
- **Por qué una ficha por paso:** las fichas juntas medirían más de 568 px. Una por paso cabe siempre.

**Estructura antes de «Comprobar»** (mismos altos a 320 y a 375):

| Bloque | Alto | Posición a 320 | Detalle |
|---|---|---|---|
| Encabezado de Hacer | 167 (medido; compartido, no se toca) | 0–167 | — |
| Espacio | 16 | | |
| Ficha del caso | 128 | 183–311 | La empresa en 12/700 #A8B6C8; TEXTO_CASO (90 caracteres como máximo, Inter 15/22); una línea con ROTULO_UTILIDAD (Inter 13/600) y la cifra en mono 14. **No muestra la caja.** |
| Espacio | 12 | | |
| Ranura de decisión | 112 | **323–435** | Arriba, «Paso n de N» (12/16 #A8B6C8) y la tarjeta en curso. Cuando todas están decididas, «Comprobar» (48 px) en la misma posición. |
| Espacio | 12 | | |
| Lista de decididas | k × 36 | desde 447 | La más reciente arriba |

**La ranura queda entera en la ventana**, a 320 × 568 y a 375 × 667, en todos los pasos, y no se mueve porque la lista crece por debajo. Es la regla de ventana de T3.

**Tarjeta en curso** (relleno de 10):
- Línea 1: a la izquierda, el nombre (Inter 14/600, hasta 2 líneas en 142 px); a la derecha, el monto en mono 14. «$6.800.000» mide 84 px.
- 8 px de aire.
- Línea 2: tres botones de 72 × 44 a 320 y 91 × 44 a 375, en Inter 13/600: «Suma», «Resta», «No mueve la caja». El último se parte en 2 líneas a 320. En reposo llevan contorno de 1 px rgba(248,249,250,.35); el elegido, 2 px #F8F9FA.
- Alto: 92 px con el nombre en una línea, 112 con dos.

**Al elegir:** la tarjeta se pliega en la lista (240 ms) y entra la siguiente. Nada se suma hasta «Comprobar».

**Renglón decidido** (36 px; 52 si el nombre ocupa 2 líneas):
- El nombre y, a la derecha, la elección en Inter 13 #A8B6C8.
- **Al tocarlo, la ficha vuelve a la ranura** para cambiarla.
- Nombre accesible: «Cambiar {cuenta}: {elegido}».

## 8 · Después de «Comprobar»

1. **La lista con sus estados.** Cada renglón crece a 52 px.
   - Bien: 2 px #F8F9FA y la pastilla «Correcto».
   - Mal: 2 px coral, el tinte de error (4,97:1) y «No va aquí». A los 0,7 s aparece «Iba aquí: {Suma, Resta o No mueve la caja}» (Inter 12/700).
2. **El mensaje.** Fondo rgba(184,196,212,.12), con hasta dos textos (§2 y §6).
3. **El puente**, en una caja #1C2939, como cascada vertical de renglones de 30 px: una línea de 16 con el nombre en Inter 12/600 y la cifra con signo en mono 12, y debajo un tramo de 10.
   - **Los renglones:** la utilidad (lleno #CBDCF2, desde 0); cada partida que mueve la caja (lo que suma, lleno; lo que resta, vacío con contorno de 2 px #CBDCF2); y «Caja al cierre», lleno, desde 0. Las fichas que no mueven la caja no dibujan renglón.
   - **La escala:** el ancho completo es la utilidad más la suma de todos los montos sin signo. En A da 33.250, que también es lo máximo que puede sumar el estudiante, así que nada se sale. Un tramo de menos de 4 px se queda solo con su cifra (E11).
   - **El punteado (N8):** en el renglón de la caja, un contorno discontinuo de 1 px #B8C4D4, desde 0 hasta lo que daban las respuestas. Lleva la leyenda «Punteado: así quedaba con tus respuestas» (Inter 12 #A8B6C8). **Si ese valor es negativo, no hay punteado:** queda solo la cifra con su signo (A7).
   - **El alto:** 12 + (2 + m) × 30 + 16 + 12. En A (m = 3) da 150 px; en B (m = 5), 210 px.
4. **«Ver mi resumen».** No hay «Siguiente caso» (A1).

## 9 · Estados

| Estado | Qué pasa |
|---|---|
| Vacío | La primera tarjeta en la ranura y la lista vacía |
| Foco | Anillo de 2 px #F8F9FA, separado 2 px |
| Presionado | Escala a 0,98 |
| Con respuestas antes de comprobar | Todas las tarjetas en la lista y «Comprobar» en la ranura |
| Tocado sin respuesta | «Comprobar» no aparece mientras falte alguna tarjeta |
| Después del error | No hay reintento |
| Bloqueado | La lista, después de comprobar |
| Primera vez / tutorial saltado | «Así se juega», con los pasos y EJEMPLO_RESULTADO_CAJA |
| Resumen | Encima del resumen, el puente del caso jugado y CIERRE_RESULTADO_CAJA |
| Movimiento reducido | El puente aparece entero, con el punteado y sin crecer |

## 10 · Movimiento, accesibilidad y lo que Ippo mide

- **Movimiento:** curva cubic-bezier(.3,.9,.4,1), solo transform y opacity. La tarjeta se pliega en 240 ms. El puente se arma renglón por renglón (200 ms cada uno, con 80 ms de desfase) al entrar en la ventana, y después aparece el punteado (200 ms). Un toque en el puente lo lleva al estado final. Nada en bucle.
- **Accesibilidad:**
  - Los tres botones forman un grupo con `aria-pressed`.
  - El puente es `role="img"`, con el nombre «De {utilidad} a la caja {caja}; con tus respuestas daba {x}».
  - Los cambios se anuncian con `aria-live="polite"`.
- **Ippo mide antes de dar por bueno:**
  - Que la ranura (323–435) quepa entera en la ventana a 320 y a 375.
  - Que «No mueve la caja» no quede con palabras cortadas a 320. **Si se corta, detente y avisa:** la fila pasa a 2 + 1 y la tarjeta a 164 px.
  - Que en B el tramo menor mida 4 px o más.
  - Contraste, toque de 44 px, piso de 12 px y que nada se salga de su caja, a 320 y a 375.
  - El INFLESZ oficial de todos los textos.
