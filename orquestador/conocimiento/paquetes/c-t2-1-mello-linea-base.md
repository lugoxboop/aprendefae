# Línea base de T2 «Las cuentas, el debe y el haber» contra el Kit · lote T2-1

Mello → L · 23 de octubre de 2026 · main 44569e5. Leí el adjunto y el código que lo pinta en main: `CuentasDebeHaberView`, `CuatroCapas`, `escenas.jsx`, `contabilidadAprenderDecide.js` y `debeHaber/*`.

> **Nota de L (23-oct).** Copia fiel de la entrega de Mello. Las decisiones de L están en `c-t2-1-decisiones-l.md`.

**Regla:** «Avanzado verificable», con el nivel como mínimo de las nueve dimensiones. D1, D4 y D6 se verifican del todo. De D2, D3, D5, D7, D8 y D9 se exige la parte que se puede verificar, y el resto queda «pendiente de prueba con personas».

**En una línea:** hoy 4 de las 5 están en HUECO por D2 (no tienen objetivo); la quinta (A5) llega a Avanzado verificable, con D7 por medir. Las 5 son un muro: la primera decisión llega después de 150 a 275 palabras.

---

## 1. Las 5 Aprender, hoy

**Cómo están armadas:**
- Las cinco van una debajo de otra en una sola página (`PIEZAS_APRENDER.map` dentro de `CuentasDebeHaberView`), cada una con `CuatroCapas`.
- **Capa 1:** un término por pantalla, con «Continuar».
- **Capa 2:** pasos con «Siguiente».
- **Capa 3:** exploración libre.
- **Capa 4:** en A1 a A4 es `CapaCuatroDecide` (dos decisiones con figura y un mensaje por error); en A5, `EnUnaFrase`.

| Pieza (orden en pantalla) | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | **Nivel** | La que la hunde |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 «De qué está hecha una cuenta» | Medio | **HUECO** | Medio | Av | Medio | Av | Bás. | Bás. | Bás. | **HUECO** | D2: sin objetivo. Después vienen D8 (no baraja), D9 (la cuenta T es el elemento más repetido del sitio) y D1 (un solo caso; la confusión «debe = aumenta» se nombra, pero ningún caso la expone). |
| A2 «Las dos familias de cuentas» | Medio | **HUECO** | Medio | Av | Medio | Av | Bás. | Bás. | Medio | **HUECO** | D2. Después D8 y D1 (un solo caso: la cuenta de ingresos). |
| A5 «El debe y el haber» | Élite | Básico | Medio | Av | Medio | Élite | Bás. | Medio | Medio | **Avanzado verificable** | Ninguna por la pieza. Falta medir D7 en lo publicado, y tiene muro (§1.1). |
| A3 «La partida doble y las dos reglas» | Av | **HUECO** | Medio | Av | Medio | Av | Bás. | Bás. | Medio | **HUECO** | D2. Después D8. |
| A4 «Del diario al mayor» | Av | **HUECO** | Medio | Av | Medio | Av | Bás. | Bás. | Medio | **HUECO** | D2. Después D8. |

**Cómo medí cada dimensión:**
- **D2.** `CuatroCapas` pinta `pieza.objetivo` antes de la capa 1, pero solo A5 lo tiene en sus datos.
- **D4.** Avanzado en las cinco: la exploración y la capa 4 pintan cosas distintas según lo que se decide.
- **D6.** A1 a A4 tienen un `msg` por opción mala (16 en total) y 8 pistas. A5 nombra la confusión («Esa es la trampa del tema…»), y por eso llega a Élite.
- **D8.** `CapaCuatroDecide` y sus datos no barajan; `EnUnaFrase` sí.
- **D7.** Es «Básico» porque solo tiene verificado lo de 44 px en el código. Falta medirla a 320 y 375 px en lo publicado, y la prueba con personas.
- **D5.** Es Medio en las cinco, aunque con una deuda de rol: los rótulos «CAPA n» van en teal (`ROTULO_CAPA`), y el teal en Contabilidad es solo para el botón y el DEBE.

### 1.1 Problemas que no son de una sola dimensión

- **Muro antes de la primera decisión** (regla de longitud del prompt de auditores: nunca después de 60 palabras). Contado con los datos:

| Pieza | Palabras antes de la primera decisión |
| --- | --- |
| A1 | 234 |
| A2 | 195 |
| A5 | unas 150 (la predicción está en el 3.er segmento) |
| A3 | 276 |
| A4 | 231 |

  En las cinco, la capa 1 y la capa 2 se leen pasando con «Continuar» o «Siguiente», sin decidir nada.
- **Las cinco en una sola página.** Es la «página que se baja» que señala Mateo.
- **Tono.** Los pasos de A1 a A4 están en «usted» («No pregunte», «Fíjese», «Mire la tabla», «memorice»). El canon dice que el contenido nuevo va en «tú», como A5.
- **INFLESZ con el medidor oficial.** Medí 128 textos de 10 palabras o más; 9 bajan de 65. Hay que reescribir 7; los otros dos quedan fuera si son textuales del libro: la definición de «Cuenta» (40,3) y «Los accionistas depositaron $5.000…» (43,1).

| INFLESZ | Texto |
| --- | --- |
| 52,7 | «donde se registran todos los hechos y operaciones, en orden cronológico…» |
| 56,7 | «Los dos movimientos tendrían que ser iguales para cancelarse…» |
| 58,9 | «Mayorizar es reordenar, no calcular…» |
| 60,4 | «Eso es lo que hacen las reales: Caja amanece el 1 de enero…» |
| 62,7 | «ACTIVOS = PASIVOS + PATRIMONIO. Si cambia algo a la izquierda…» |
| 63,0 | «Porque activos y pasivos están en lados opuestos de la ecuación…» |
| 64,4 | «La diferencia entre los dos movimientos, del lado del mayor…» |

- **Fidelidad, para verificar en el capítulo.** A2 dice «Todas las cuentas del mundo caen en una de dos familias». En Colombia también existen las cuentas de orden (clases 8 y 9 del PUC). Si el libro no lo dice así, la frase se corrige a «Las cuentas de este capítulo…». No tengo el capítulo de T2; que Near lo confirme con la página.

---

## 2. Criterios de aceptación de la versión en diapositivas (una idea por pantalla)

**Meta:** que cada pieza llegue a **Avanzado verificable**. A1 a A4 tienen que salir de HUECO, y A5 tiene que perder el muro sin perder lo que ya tiene. Apruebo sin ronda extra si se cumple todo, con la evidencia que dice cada punto.

### Reglas de no borrar (Contabilidad tiene estudiantes)
- Los `id` siguen igual (`cu-a1`… `cu-a5`), y los datos se agregan, no se reemplazan. Las definiciones `textual: true` quedan letra por letra.
- `CuatroCapas` no se toca, porque es compartido. Las diapositivas se arman en un componente de la célula, igual que hicimos con C3 y C4.
- No cambian ni el catálogo de FP ni la base de datos: Aprender da cero FP.

### Criterios verificables

| # | Criterio | Cómo lo verifico |
| --- | --- | --- |
| S1 | **D2.** La primera diapositiva es el objetivo, en una sola oración («Al terminar, sabrás…»). | La prueba lee `objetivo` en las 5 y comprueba que tiene una sola oración. |
| S2 | **Una idea por diapositiva:** un término, un paso o una decisión. Como mucho 40 palabras de texto, más la figura, y nunca más de 60 visibles con las opciones y el mensaje (B2). | Conteo de palabras visibles por diapositiva, en un informe de Playwright a 320 px. |
| S3 | **Sin muro.** La primera decisión con consecuencia llega antes de 60 palabras acumuladas, y nunca hay más de 2 diapositivas seguidas de solo leer. Las definiciones se aprenden usándolas, no leyendo una lista. | El mismo informe: palabras antes de la primera decisión, y la racha más larga de diapositivas sin acción. |
| S4 | **D4.** Al menos dos decisiones de tipo distinto (clasificar y consecuencia), y cada una se pinta en la figura de la pieza antes del veredicto (regla C4). | La prueba `consecuencia-c` con su `*_c4.js`. |
| S5 | **D3 y escalera C2.** Al primer error, la pista; al segundo, la devolución y la correcta con borde blanco. Nunca «Iba aquí» (Aprender). | La prueba de la escalera, más la búsqueda de «Iba aquí» en Aprender, que tiene que dar 0. |
| S6 | **D6.** Cada opción mala tiene su propio mensaje, que nombra la confusión. Las opciones tienen largos parecidos (como mucho una palabra de diferencia). | La lista de mensajes en el PR; el conteo de palabras por opción. |
| S7 | **D8.** Las opciones se barajan por intento (`utils/barajar.js` al montar). El orden se mantiene dentro de la partida y cambia en la siguiente. | Una prueba como `barajado-por-intento-c`. |
| S8 | **D9.** Cada pieza tiene un objeto propio que no se repite igual en otra actividad. Propuesta: A1, el saldo que «cae» del lado mayor; A2, los cajones que se vacían el 31 de diciembre; A3, la balanza de totales con nombres; A4, el renglón que viaja del diario a su cuenta T; A5, la mesa de dos casos. | La prueba C4 del objeto propio (`objeto` único). |
| S9 | **D1.** Al menos dos casos que expongan la confusión con nombre de la pieza (lista abajo). | Lista en el PR: caso → confusión → diapositiva. |
| S10 | **Verdad y cifras.** Ninguna cifra escrita a mano: todas salen de `contabilidad.js` (como hace A5), con su página. La figura no hace la cuenta que se califica (E8), y ninguna diapositiva delata la respuesta de una decisión posterior (C1). | Prueba de cifras contra los datos, y lectura mía de C1 y E8. |
| S11 | **Texto.** En «tú». INFLESZ de 65 o más en todo texto de 10 palabras o más, con el medidor oficial, salvo las citas textuales del libro. Los 7 textos de §1.1 reescritos. | Salida de `npm run inflesz` en el PR. |
| S12 | **Diseño.** Teal solo para el botón y el DEBE, y ámbar solo para el HABER: los rótulos de capa o diapositiva van en neutro. Sora e Inter, 12 px de mínimo, 44 px por objetivo táctil, sin desplazamiento lateral a 320 y 375 px. Con versión de movimiento reducido, y sin avance automático (cada paso espera, como A5). Contador «Pantalla n de N», y se puede volver atrás sin que se repita ninguna animación. | Playwright a 320 y 375 px; capturas mías solo en la verificación final. |
| S13 | **Navegación.** Cada pieza en su propia secuencia de diapositivas, no las cinco en una página. Al terminar, «Siguiente pieza» (y el resumen en la última). | La revisión de la vista. |

### Las confusiones de cada pieza (para S9)

- **A1:** «debe = aumenta»: dos cuentas con el mismo lado y efectos distintos; «el saldo va del lado donde se anotó el último valor»: un caso donde el último va al haber y el saldo queda en el debe.
- **A2:** «transitoria = la que se usa poco»: una cuenta de gasto con mucho movimiento que igual se cierra; gasto contra costo: un caso de costo de ventas.
- **A3:** «débito siempre suma»: el mismo débito en activo y en pasivo; «asiento compuesto = descuadrado»: tres cuentas que cuadran por totales.
- **A4:** «mayorizar cambia la columna»; «el mayor va en orden de fecha y no de cuenta».
- **A5:** ya los tiene. Que no los pierda al partir los segmentos.

---

## 3. Criterios para las Hacer nuevas que propone Near

Apruebo la ficha sin ronda extra si trae todo esto.

### Comunes a las tres

| # | La ficha trae |
| --- | --- |
| H1 | El objetivo en una oración y la consigna, sin «Tienes un solo intento» (eso lo pone el encabezado). |
| H2 | Los datos, con su página del libro, o marcados como «Basado en el libro» con lo construido señalado. Los nombres de cuenta del canon. Ninguna cifra escrita a mano en el componente. |
| H3 | Un enunciado que se resuelva solo con lo que dice (suficiencia), y ninguna respuesta delatada entre ítems, piezas o temas (C1). |
| H4 | Cada distractor es un error real y con nombre, con su propio mensaje que nombra la confusión (D6 Avanzado o Élite). Las opciones tienen largos parecidos, sin emparejar palabras (regla 9). |
| H5 | **C4.** Toda decisión se pinta en el objeto propio de la actividad, primero la consecuencia y el veredicto a los 380 ms, con la falla en texto. En las cifras, la figura solo muestra «Tu cifra» hasta «Comprobar» (C4-1). |
| H6 | **D8.** Baraja por intento: las opciones y, donde se pueda, el orden de los ítems. |
| H7 | **Dialecto de Hacer.** Un solo intento, sin puntos parciales. «Correcto», «No va aquí», e «Iba aquí» a los 0,7 s. «{Sustantivo} n de N», «Siguiente {sustantivo}», «Ver mi resumen». «Comprobar» solo cuando hay varios campos, y un campo de cifra solo si cambia la figura al teclear o arma un asiento renglón por renglón (4.4). |
| H8 | **Texto.** INFLESZ medido de cada texto de 10 palabras o más; ninguno bajo 65. Como mucho 60 palabras visibles, y la primera decisión antes de 60. |
| H9 | **Pruebas:** su `*_c4.js` (que pase `consecuencia-c`), la de cifras contra el libro y la de barajado. |
| H10 | **No borrar.** Un `id` nuevo y nada existente cambiado. Si la actividad necesita una fila nueva en el catálogo de FP del servidor, eso es una migración: **ahí paramos**, la corre Mateo y la revisa Levi. Es lo único que no decidimos nosotros. |

### Lo propio de cada hueco

- **Del diario al mayor.** El diario tiene al menos 4 asientos, con uno compuesto, y una cuenta que aparece en los dos lados en fechas distintas. El estudiante lleva cada renglón a su cuenta T y saca el saldo. Errores que debe cubrir: cambiar de columna, agrupar por fecha en vez de por cuenta, poner el saldo del lado del último movimiento, y sumar los dos lados en vez de restarlos. Objeto propio: el renglón que viaja del diario a su T, distinto de la cuenta T de A1. Comprobación final: las sumas del mayor son iguales a las del diario.
- **Cuentas nominales.** Tiene que distinguir ingreso, gasto y costo (con las definiciones textuales del libro), reales y nominales, y el lado por el que crece cada una (gasto al debe, ingreso al haber). Y tiene que mostrar el cierre: la cuenta nominal queda en cero y su saldo pasa a resultados. Errores que debe cubrir: gasto contra costo, gasto contra activo (lo pagado por anticipado), ingreso contra cobro (Caja), y creer que una transitoria no se cierra. No puede repetir los cajones de A2 como objeto: que sea, por ejemplo, el estado de resultados que se llena y se vacía al cierre.
- **Débitos = créditos.** Un balance de comprobación con sus sumas, y al menos un caso descuadrado que el estudiante tiene que diagnosticar. Errores que debe cubrir: un número traspuesto, un valor llevado al lado contrario, un renglón omitido, y uno duplicado. Cada uno deja una diferencia distinta que el mensaje nombra; por ejemplo, la diferencia de una trasposición es divisible por 9. El objeto no puede ser la balanza de A3: que sea, por ejemplo, la columna de sumas que se descuadra. Ojo con E8: la figura no puede mostrar la diferencia antes de que el estudiante la calcule.

**Las 7 Hacer de hoy:** espero los números de Misa con las sondas, en el próximo lote.
