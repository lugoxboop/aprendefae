# Auditoría · Patrón de enganche C v6 (A1, A7 y si están listas) y tres aciertos de T7-3

Mello → L · 15 de octubre de 2026

| Pieza | Veredicto |
| --- | --- |
| A1 v6 | **A1-N1 está aplicada, pero NO está lista para construir.** Mover el deslizador rápido deja cajas de más en la bodega, y el conteo del cierre sale mal. Es un fallo viejo que no había visto. |
| A7 v6 | **Lista.** A7-1 y A7-2 están aplicadas, sin fallos nuevos. |
| A4 v6 | **Lista, con una instrucción para Misa.** El código es idéntico al de la v5 y sigue sin la corrección A4-N1 (el mensaje que queda pegado a otra fecha). |
| T7-3 · `condiciones` | **PASA CON CORRECCIONES** (una opción también se defiende y una retro es falsa) |
| T7-3 · `no-operacional` | **PASA CON CORRECCIONES** (se quitó una condición) |
| T7-3 · `sobrante` | **PASA** |

---

## 1. Patrón de enganche C, v6

**Cómo lo verifiqué:**
- El código que se ejecuta es idéntico al publicado como referencia en A1, A7 y A4.
- Comparé la v6 con la v5 línea por línea. A4 no cambió.
- Jugué A1 en un DOM simulado, también con tiempos reales entre movimientos. A7 la verifiqué en el código, porque el viaje de la caja depende del diseño de la página y en el DOM simulado no se puede medir.

### A1: A1-N1 aplicada ✓, pero queda un fallo

**Lo que ya funciona:**

| Movimiento | Resultado |
| --- | --- |
| Del 1 al 5 (sin hechos) | Sin mensaje ni animación |
| Hacia atrás, del 9 al 4 | Sin mensaje, sin animación y el candado quieto |
| Del 4 al 16 de un salto (dos hechos) | Sin mensaje ni animación |
| Del 15 al 16 (la compra) | «Llegaron 10 cajas.», con animación |
| Del 16 al 22 y del 22 al 29 (ventas) | El mensaje de la venta, la animación y el candado que late |

**A1-N2 · Falsedad: si se mueve el deslizador rápido, quedan cajas de más para siempre.** Obligatoria; el fallo viene desde la v1.

| Lo que hice | Cajas en el estante | Debían ser |
| --- | --- | --- |
| Del 8 al 9, al 8 y al 9 otra vez, con 100 ms entre movimientos | 8 | 5 |
| Vuelta al día 1, con tiempo | 11 | 8 |
| Día 9, con tiempo | 8 | 5 |

- **Causa.** Cuando una caja sale, queda medio segundo con la clase `.sale` antes de borrarse (`setTimeout` de 320 ms). Si en ese tiempo el día vuelve atrás, se crea una caja nueva con el mismo `data-caja`. Cuando el día avanza otra vez, `querySelector` encuentra primero la caja vieja, que ya se estaba yendo, y la nueva se queda.
- **Consecuencia.** La bodega muestra cajas que no existen. Al cierre, «Contar la bodega» numera los nodos del estante (por ejemplo, 1 a 8), mientras el texto dice «Conteo físico: 5 cajas». La figura contradice el conteo, que es justo la lección de la pieza.
- **Corrección**, en `pintarBodega()`:
  - Al sacar una caja: ``est.querySelector(`[data-caja="${id}"]:not(.sale)`)``.
  - Antes de crear las que llegan: ``est.querySelectorAll(`[data-caja="${id}"].sale`).forEach((x) => x.remove());``.
  - Con eso, el estante siempre tiene `cajasEn(s.dia).length` cajas vivas.
- **Prueba para Misa:** mover rápido 8→9→8→9 y después ir al 30. El estante y el conteo deben dar 5.

### A7: lista ✓

| Corrección | Estado |
| --- | --- |
| A7-1 · La hoja no vuela en el caso 1 | ✓ `ponerY` lanza la hoja solo si la pantalla no es `p2`. Al pasar de pantalla se limpia `llega-hoja`. |
| A7-2 · El caso 3 nuevo | ✓ El texto, la ficha «Solo lo dicen los libros» y los errores de Recepción y Bodega son los míos, tal cual. |

- **El caso 3 es la única pantalla que crece:** 28 palabras antes de la figura. Cabe en las 40.
- **Fallos nuevos:** ninguno. La v6 solo agrega una condición y una limpieza.

### A4: lista, con una instrucción para Misa

El código de A4 es idéntico al de la v5. A4-N1 sigue sin aplicar: después de acertar, el mensaje queda pegado a otra fecha. La corrección exacta está en mi auditoría anterior.

Como la pieza ya está cerrada, Misa puede construirla con esa corrección en el componente:
- en el `input` del deslizador, si la pregunta ya está resuelta, en las pantallas 3, 4 y 5 el mensaje pasa a «Sigue hasta el 28 de febrero.» mientras `s.visto < 9`, y después queda vacío;
- en las pantallas 6 y 7 queda vacío.

### ¿Listas para que Misa construya?

- **A7: sí.**
- **A4: sí,** con A4-N1 como instrucción en el componente.
- **A1: todavía no.** Hace falta A1-N2: dos líneas en `pintarBodega()`, que puede aplicar Watari en una v7 o Misa al construir. Si la aplica Misa, la prueba de arriba tiene que pasar antes de fusionar.

---

## 2. Tres aciertos de T7-3

**Fuente:** releí sobre la imagen la p. 252 (los términos 15/10, 5/20 y n/30) y las pp. 253-254 (no operacional, permanente, sobrantes y la ley). Comparé con el texto publicado en main (`contabilidadT7_3_a3.js`, `a4.js` y `a5.js`). Conté con el contador de Near, que cuenta más alto que el mío.

### 2.1 `condiciones` · El descuento condicionado: PASA CON CORRECCIONES

**Lo que pasa:**
- 15/10 queda en la pregunta y 5/20 en el acierto, los dos con su plazo, como en la p. 252.
- n/30, «pagar el total», queda con los 30 días en la pregunta y «sin descuento» bajo el día 30 en la figura del acierto.
- La respuesta, «Ninguno», no se delata: hay que leer que «n» no trae porcentaje.

**C-1 · La opción «5 %» también se defiende, y su retro es falsa (obligatoria; p. 252).**
- La figura ahora dice «5 % comercial». Ese 5 % el cliente lo recibe siempre, porque «se deduce directamente del precio de lista». Quien paga a los treinta días se queda con él.
- Por eso «5 %» se defiende como respuesta.
- Y la retro de main para «15 %» y «5 %», «A los treinta días ya no hay descuento.», es falsa: queda el comercial.
- **Corrección, sin cambiar el conteo de 60:** cambiar el distractor «5 %» por «30 %». Así mide el error de leer el número de n/30 como porcentaje y no choca con el 5 % comercial.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Opciones | «15 %» · «30 %» · «Ninguno» (correcta: Ninguno) | 5 | no aplica |
| Si elige 30 % | «En n/30, el 30 son los días. No trae ningún porcentaje.» | 11 | 86,6 |
| Si elige 15 % | «A los treinta días ya pasó el plazo del 15 %.» | 11 | 97,2 |

**Observación (fuera de este encargo, ya estaba en main):** la pregunta de esta pantalla dice «15/10 es un 15 % si paga a los diez días». Dos pantallas después, `cual-le-toca` pregunta qué descuento recibe quien paga a los diez días, y su texto ya da «diez días después de la venta». Si quieres que `cual-le-toca` mida algo, quítale «diez días después de la venta» y que el estudiante cuente los días desde la fecha de la factura. Si no, queda como repaso.

### 2.2 `no-operacional` · En los dos libros: PASA CON CORRECCIONES

**Lo que pasa:**
- **Condición del permanente:** «Si usaran el permanente», con sus dos consecuencias, es la p. 254 completa y está a la vista. «El del costo» es más vago que el libro («el costo de la mercancía vendida»), pero no es falso.
- **Definición y opciones:** «No operacional: ajeno a la operación.» y las opciones sin «Como», con el nombre de canon para el costo, pasan.

**N-1 · Se quitó una condición (obligatoria; C7 y su corolario; p. 253).**
- El libro decide por el saldo: «Si la cuenta termina con saldo débito… gasto no operacional, y si el saldo final es crédito… ingreso no operacional».
- La pregunta pone la condición para San Calixto («quedó con saldo en el debe»). El acierto de Near la quita para Santa Martha: «En Santa Martha es ingreso no operacional».
- Así se enseña que el comprador da ingreso, cuando lo que da ingreso es el saldo en el haber. Las dos empresas usan la misma cuenta (p. 253), y es el saldo final el que decide.
- Que el estudiante haya visto el saldo en la pantalla anterior no basta: la condición tiene que ir con la regla.
- **Corrección:** el acierto lleva la condición y baja de 30 a 29 palabras. Sale «Así es.»; el rótulo «Correcto.» de la interfaz ya cumple esa función.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Acierto | «En Santa Martha, con saldo en el haber, es ingreso no operacional. Con el permanente, San Calixto anota también el costo. Santa Martha usa Inventario de mercancías, no Compras.» | 29 | 72,6 |

- **Total con el acierto a la vista:** 6 + 14 + 10 + 29 = **59** con el contador de Near.
- **«Con el permanente… anota»** dice la condición como regla, igual que el libro: «si… utilizaran».

### 2.3 `sobrante` · Sobrantes y faltantes: PASA

- **«Al menos una vez al año, a más tardar el 31 de diciembre»** es la p. 254: «como máximo el 31 de diciembre» y «por lo menos una vez al año».
- **Quitar «por normas de contabilidad» se sostiene.** Es la fuente de la obligación, no un límite, y «la ley pide» es cierto: el libro dice «disposiciones de ley» y «requisitos fiscales».
- **«Se dan» por «se presentan»** no cambia el sentido, y «solo» se queda (p. 254). La condición está a la vista en el acierto.
- **La respuesta no se delata.** La figura muestra los dos saldos sin la resta, así que E8 pasa.
- **Opcional.** Quitar «Baja el costo de la mercancía vendida» deja el «menor valor del costo» (p. 254) solo en la figura del acierto (Costo de mercancía vendida · Haber). No es falso. Si un día sobra espacio, vale la pena devolverlo, porque `faltante` sí dice «sube el costo».

**Las cifras de las tres pantallas** son del libro: $3.990.000 (p. 252), $465.000, $495.000 y $30.000 (p. 254). No hay cifras nuevas.
