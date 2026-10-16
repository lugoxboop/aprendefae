# Auditoría · Patrón de enganche C2 (Watari, 16-oct)

Mello → L · 16 de octubre de 2026 · artefacto versión 1792161075-8e08, main de referencia bed53fb

| Pieza | Veredicto |
| --- | --- |
| T7-2 A3 «El kárdex» | **PASA CON CORRECCIONES.** En PEPS se califica como error una capa de la que sí salen unidades, y quedan dos opciones. El mensaje del acierto se queda pegado a otra fecha. |
| T7-2 A1 «La cuenta que sí se mueve» | **PASA CON CORRECCIONES.** Costo de la mercancía vendida se queda sin la primera venta, y el saldo no cuadra con la cuenta T. |
| T7-1 H2 «Arma la factura» | **PASA CON CORRECCIONES.** En el ítem 5, la factura ya trae el IVA y la retención que el ítem pide calcular. El ítem 1 abre con un muro de 93 palabras. |
| Lote de dialecto C | **PASA CON CORRECCIONES.** Falta probar la regla gemela de Aprender, y hay dos condiciones de fusión. |

---

## Cómo lo verifiqué

- **El código.** Comparé el código que se ejecuta en el artefacto con el publicado como referencia. Es idéntico en las tres piezas, salvo una línea en blanco.
- **El juego.** Jugué las tres piezas en un DOM simulado y medí en Chromium, a 320 y a 375 px:
  - desborde: 0;
  - objetivos de menos de 44 px: 0;
  - figura del kárdex en la pantalla 3, a 105 px del tope;
  - la factura del ítem 1 a 364 px del tope a 320 px, y a 301 px a 375 px.
- **Las cifras.** Recalculé las 30 del kárdex y las 12 de la factura.
- **Los textos.** Comparé los textos con main.
- **INFLESZ, medidor oficial** (`npm run inflesz`).
  - Lo calibré con las seis frases de control: 80,2 · 73,2 · 66,4 · 78,7 · 89,7 · 94,9. Las seis dan el valor de la convención nueva.
  - Medí 75 textos de Near de 10 palabras o más. Ninguno baja de 65; el más bajo da 66,2.
- **Mecánicas repetidas.** Conté los usos:
  - el deslizador de fecha: tercer uso (A1, A4 y kárdex);
  - tocar el lado de una cuenta: más de cuatro usos en el curso.
- **Lo que no pude hacer.** El Kit de 9 dimensiones no lo tengo en su texto literal. Por eso solo doy nivel en D4, D6 y D9, que el prompt de auditores cita palabra por palabra. Las demás dimensiones esperan el PDF que te pedí, y su auditoría es condición de fusión.

---

## 1. T7-2 A3 «El kárdex»: PASA CON CORRECCIONES

| Campo | Resultado |
| --- | --- |
| D4 | **Básico, se cumple.** El deslizador llena el kárdex fila por fila, y en cada pantalla se toca una capa, una ficha o un método. |
| D6 | **Avanzado.** Los errores distintos tienen mensajes distintos (en promedio: «todo el mes» frente a «última compra»), y el primer error da la pista. |
| D9 | **Medio** (lo vi). El kárdex que se llena, con las capas que viajan a Salidas, no se repite en otra pieza. Avanzado («alguien sin contexto se detiene») no está probado; Watari lo marca «provisional». |
| Prerrequisitos (Kit §2) | **Se cumplen.** Rehíce las 30 cifras: PEPS, UEPS, promedio (2.085 y 2.195), costo de lo vendido (200.550, 205.350 y 201.925) y la fila del periódico (56.250, 50.250 y 53.500, con 256.800 ÷ 120 = 2.140). Todas cuadran y son las de `KARDEX_A3`. El pie dice «Basado en el libro». |
| INFLESZ | Ningún texto baja de 65. |

### Correcciones

**K-1 · Falso, y con dos opciones (obligatoria; la misma falla F2 de A4 y la regla de la tercera opción).**
- El problema:
  - La pregunta es «¿Qué unidades salen el 9 de julio?». Salen 30 del inicio y 30 del 5 de julio.
  - Pero tocar la capa «50 × 2.130» da «No va aquí», como si de esa capa no saliera ninguna.
  - Además, la DECISIÓN de Watari dejó solo dos capas para tocar. Al primer error queda una sola opción, y la escalera no llega a dar el porqué.
- **Corrección:** PEPS y UEPS usan la misma mecánica que el promedio. Tres fichas con la salida completa vuelan al hueco de Salidas. Al acertar, se mantiene el «mira esto»: las capas del saldo viajan a Salidas.

| Pantalla | Fichas (correcta primero; en pantalla, barajadas) | Devolución al 2.º error |
| --- | --- | --- |
| PEPS | «30 × 2.010 y 30 × 2.130» · «60 × 2.130» · «50 × 2.130 y 10 × 2.010» | «60 × 2.130»: la de Near, «Con PEPS salen primero las más antiguas: las del inicio.» · «50 y 10»: **«Así sería con UEPS. Con PEPS salen primero las más antiguas: las del inicio.»** (14 palabras; INFLESZ 93,0) |
| UEPS | «35 × 2.250» · «20 × 2.010 y 15 × 2.250» · «35 × 2.130» | Las de Near en main: «Salen primero las últimas que entraron.» · «Esas ya salieron el 9 de julio.» |

- El texto, la pregunta, la pista y el acierto no cambian.
- La ficha correcta tiene el mismo largo que uno de los distractores, así que no se delata por el largo.
- El distractor de main «30 del inicio y 30 del 14» sigue fuera. Watari tiene razón: el estudiante todavía no ha visto la compra del 14.

**K-2 · El mensaje se queda pegado a otra fecha (obligatoria; es la falla A4-N1, otra vez).**
- Lo jugué: acerté en PEPS y moví el deslizador al 20 de julio. La pantalla decía al mismo tiempo «Así es: quedan 20 del 5 de julio, a $2.130.» y un saldo de «25 × 2.250». Lo mismo pasa con el acierto de UEPS y con el de promedio cuando se mueve la fecha.
- **Corrección**, en el `input` del deslizador, cuando la pregunta de la pantalla ya está resuelta:
  - el mensaje del acierto se ve solo si `s.idx === P.espera`;
  - fuera de esa fecha, si `P.listo(s)` es falso, el mensaje es «Sigue hasta el 20 de julio.» (6 palabras);
  - si es verdadero, el mensaje queda vacío.

**K-3 · Pantalla 6 «lado a lado»: 69 palabras a la vista, contra un límite de 60 (obligatoria; B2).**
- Cuento 11 de texto, 19 de rótulos de la tabla, 12 del acierto y 27 del porqué.
- **Corrección:** el porqué queda en «Con UEPS y con el promedio, en el permanente importan las fechas.» (12 palabras; INFLESZ 91,0). Total: **54**.
- La frase que sale, «el conteo físico solo revisa que haya 25 unidades», además es inexacta para el periódico: allí el conteo no revisa la cantidad, la encuentra.

---

## 2. T7-2 A1 «La cuenta que sí se mueve»: PASA CON CORRECCIONES

| Campo | Resultado |
| --- | --- |
| D4 | **Básico, se cumple.** Cada lado tocado mueve la bodega, el renglón y el saldo, todo a la vez. |
| D6 | **Avanzado.** En las pantallas 3 y 4, los errores distintos tienen mensajes distintos. En los lados: la pista y después ENTRA o SALE, con el lado bueno en blanco. |
| D9 | **Medio** (lo vi). La cuenta T que se mueve al mismo tiempo que la bodega es nueva frente a T7-1 A1, donde la cuenta tiene candado. Avanzado no está probado. |
| Mecánica repetida | Tocar el lado ya se usó más de cuatro veces. Acepto la justificación de Watari («es la pareja de T7-1 A1; aquí el toque mueve el modelo»), con una condición: que quede escrita en una línea de la ficha. |
| Prerrequisitos | Sin cifras (regla 3). |
| INFLESZ | Ningún texto baja de 65; el más bajo da 66,2. |

### Correcciones

**Cu-1 · Falso: Costo de la mercancía vendida se queda sin la primera venta (obligatoria; regla del Kit: ninguna figura implica algo falso).**
- Lo vi en Chromium a 320 px:
  - En la pantalla 3, antes de responder, ya aparece la cuenta T de costo, vacía. Inventario de mercancías tiene en el haber «Vende mercancía».
  - Al acertar, al costo solo le cae «Otra venta». Así queda hasta el resumen: dos ventas en Inventario y una sola en el costo.
- La figura dice que la primera venta no anotó su costo. Eso contradice la respuesta, «En cada venta».
- **Corrección:**
  - La cuenta del costo aparece al acertar, no antes:
    ```js
    q('[data-t="cmv"]').hidden = !((P.cmv && s.resuelto[P.id]) || s.p > 2);
    ```
  - Al aparecer, trae ya la venta anterior:
    ```js
    s.cmv.push({ cajas: HECHOS[1].cajas, rot: 'Vende mercancía' }, { cajas: 1, rot: 'Otra venta', nuevo: true });
    ```
  - El «mira esto» no cambia: solo cae el renglón nuevo.

**Cu-2 · El saldo no cuadra con la cuenta T (obligatoria).**
- La barra del saldo arranca en 5 cajas, pero no hay ningún renglón que las traiga. Al final, el debe suma 4 cajas, el haber suma 5 y el saldo marca 4: no es debe menos haber.
- **Corrección:** un renglón inicial en el debe, `{ lado: 'debe', cajas: INICIO, rot: 'Saldo inicial' }`, con el rótulo [W] para que Near lo confirme. Con él, el debe suma 9 cajas, el haber 5 y el saldo marca 4: cuadra.

**Cu-3 · Pantalla 3: 69 palabras a la vista, contra un límite de 60.** La choca que Watari dejó señalada; la decido yo.
- El porqué va plegado. Su «cuando» («avisan cuando queda poca mercancía») describe lo que hacen los registros; no limita ninguna definición. La regla de L (y el corolario de C7) obliga a dejar a la vista solo las condiciones que limitan lo que se enseña.
- Total a la vista: 22 + 14 + 13 = **49**.

---

## 3. T7-1 H2 «Arma la factura»: PASA CON CORRECCIONES

| Campo | Resultado |
| --- | --- |
| D4 | **Básico, se cumple.** En los ítems 1 y 2, la cifra mueve la barra. En los ítems 4 y 6 se arma el asiento. |
| D6 | **Avanzado.** Cada distractor tiene su retro («Ese es el 3,5 % del valor con IVA…»). |
| D9 | **Medio** (lo vi). La factura que se arma, con renglones que viajan al asiento, es nueva en la célula. Avanzado no está probado. |
| Dialecto de Hacer | Se cumple. «Correcto», «No va aquí» e «Iba aquí: $…» a los 0,7 s, un intento, «Ítem n de 6», «Siguiente ítem», «Ver mi resumen», debe en teal, haber en ámbar, sin emoji. |
| Prerrequisitos | Se cumplen. 512.000 · 112.000 · 129.920 · 3.600.000 · 3.824.000 · 3.712.000 · 768.000 · 168.000 · 5.400.000 · 5.736.000 · 5.568.000. Las sumas iguales dan 3.712.000 y 5.568.000. |
| INFLESZ | Ningún texto baja de 65; el más bajo da 69,1. |

### Correcciones

**Fa-1 · E8: en el ítem 5, la factura hace dos de las tres cuentas (obligatoria; además, cambia la evaluación de main).**
- Lo jugué: en el ítem 5, la factura de venta ya muestra «IVA (16 %) $768.000» y «Retención (3,5 %) $168.000». En main, el estudiante los calcula; el distractor 5.568.000 existe justo por eso. Aquí solo le queda sumar.
- **Corrección** en `valorDe`:
  ```js
  if (!it) return { v: s.resp['debe-cliente'] || s.fin ? F[renglon] : null, fijo: true };
  ```
  Así, los dos renglones muestran «—» hasta responder. En la guía, «desde el ítem 5» pasa a «desde que se responde el ítem 5».

**Fa-2 · Muro antes de la primera decisión (obligatoria; regla de longitud del prompt de auditores: nunca después de 60 palabras).**
- En el ítem 1 hay 86 palabras de enunciado y 7 de pregunta. La factura empieza a 364 px del tope a 320 px.
- Los datos de los párrafos 1 y 2 ya están en la cabecera de las facturas.
- **Corrección:** en el ítem 1 quedan a la vista solo dos cosas: «La Ceiba usa el sistema de inventario periódico.» y el párrafo de las tarifas. Los párrafos 1, 2 y 4 van en «Ver el enunciado» desde el ítem 1.
  - El texto visible tiene 31 palabras y da 77,9 de INFLESZ; con la pregunta, son **38**.
  - La frase del periódico es la de Near, con sujeto; que Near la confirme.

**Observación (no bloquea).** En los ítems 3 y 5 (los totales), escribir la cifra no cambia la barra. Lo medí: con 3.824.000 escrito, la barra queda idéntica. Se cumple la letra de la regla 4.4, porque la casilla es el renglón de la factura, pero la reacción es la más débil de la pieza. Si Watari agrega algo, no puede dejar que el estudiante compare su total a ojo antes de «Comprobar» (E8).

---

## 4. Lote de dialecto C: PASA CON CORRECCIONES

**Lo que verifiqué:**
- Corrí `dialecto-c.test.mjs` contra main (bed53fb): **0 de 7 pasan.** Eso demuestra que la prueba sí puede fallar.
- Los archivos de las reglas R3 y R4 los importan solo piezas de Hacer (t5/ y t7/). Ninguna pieza de Aprender recibe «Iba aquí».
- No se toca nada compartido.

### Correcciones y condiciones de fusión

| # | Corrección o condición |
| --- | --- |
| **L-1 · Falta la regla gemela** (obligatoria) | La prueba revisa que en Hacer no haya «La respuesta es», pero no que en Aprender no haya «Iba aquí» (decisión de Miku). Agregar:<br>`test("D8 · en Aprender nunca «Iba aquí»", () => { assert.deepEqual(hallazgos(archivos.filter((f) => APRENDER.test(f)), (l) => /Iba aquí/.test(l)), []); });` |
| **L-2 · La marca `/* lado */` se puede usar para pasar D3** | En la descripción del PR van las 10 líneas de R8, con archivo y número de línea. Una marca en cualquier otra línea bloquea la fusión. |
| **L-3 · Dependencia entre células** | Importar `b5/Devolucion.jsx` necesita el visto bueno de Erwin antes de fusionar, con la evidencia en el PR. |
| **L-4 · Choque con el patrón C** | R6 y R7 tocan `LaCuentaQueNoSeMueve.jsx`. Si A1 v7 del patrón C llega antes, las reglas se aplican al componente nuevo. D6 y D7 lo cubren en los dos casos. |
| **L-5 · La suite** | `npm ci`, `npm test -- dialecto-c` en 8 de 8 (con L-1) y la suite completa en verde. Si algo falla, Misa se detiene y avisa con la salida. |

**Pendiente, fuera de este encargo:** los contadores y los botones (§4.3) de los 25 Hacer no entran en este lote. Van en el siguiente.

---

## Condiciones de fusión de las tres piezas (fusiona sin volver a pasar si…)

1. Las correcciones obligatorias están aplicadas tal cual (K-1 a K-3, Cu-1 a Cu-3, Fa-1 y Fa-2), y Misa reproduce cada prueba en la pieza construida:
   - **K-2:** acertar en PEPS y mover la fecha al 20 de julio. Debe salir «Sigue hasta el 20 de julio.» o nada.
   - **Cu-1:** al final de la pantalla 3, el costo tiene 2 renglones y el haber de Inventario tiene 5.
   - **Fa-1:** en el ítem 5, el IVA y la retención se ven como «—».
2. **Near confirma** los rótulos [W] y los textos nuevos: «Saldo inicial», la devolución de PEPS «50 y 10» y la frase del periódico.
3. **Nivel del Kit con el texto literal** de las 9 dimensiones. Lo hago yo cuando me llegue el PDF. Hoy hay nivel en D4, D6 y D9; ninguna está en HUECO.
4. **Teléfono real, en la factura.** Con el teclado numérico, la casilla no puede perder el foco ni cerrar el teclado al teclear. En el prototipo se rehace la factura con cada tecla; en main, el `input` tiene que ser el mismo nodo de principio a fin. Esto se comprueba en Android y en iOS.
