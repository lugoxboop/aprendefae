# Auditoría · T7-2 A4 v5 (Patrón de enganche C) y T7-1 A3 «la-recomendacion»

Mello → L · 15 de octubre de 2026

| Pieza | Veredicto |
| --- | --- |
| A4 v5 | **Las 8 correcciones están aplicadas.** Queda un fallo nuevo y menor: el mensaje se queda pegado a otra fecha. |
| A3 «la-recomendacion» | **PASA CON CORRECCIONES.** Las condiciones están intactas y no hay nada falso, pero la respuesta se delata en la pantalla anterior. |

---

## 1. A4 v5

### Cómo lo verifiqué

- **El código.** El código que se ejecuta es idéntico, letra por letra, al `a4.js` publicado como referencia.
- **La pieza, jugada entera en un DOM simulado:** pasos hacia adelante, saltos (4→9), vuelta atrás (9→5, 5→4, 9→3 y 6→0 en el promedio), errores primero y segundo en todas las preguntas, y el selector de la pantalla 6.
- **Los 30 estados** son los mismos de mi cruce anterior contra el libro, porque `calcular()` no cambió.

| # | Corrección | Estado | Evidencia |
| --- | --- | --- | --- |
| F1 | Solo se anima un paso hacia adelante | ✓ | Con saltos y vueltas atrás: 0 capas «vendidas», 0 cortes y 0 capas que caen. Al avanzar un paso, sí hay corte, capa agotada o llegada, según el hecho. |
| F2 | «La capa que la venta corta primero» | ✓ | La capa del 2 feb en UEPS da «Esta se corta después: antes va la del 4 de febrero, más nueva.» |
| F3 | «En el permanente», sin «sale un costo nuevo» | ✓ | El texto de la pantalla 5 es el mío. |
| F4 | Capas neutras, ejes de costo y «supone» | ✓ | Relleno gris con borde; «Costo más reciente» y «Costo más antiguo». |
| C1 | El selector no califica | ✓ | Con el selector en UEPS o Promedio no sale ningún mensaje. Debajo, las opciones calificadas «Con PEPS / Con UEPS / Con el promedio». |
| C2 | Cálculo del promedio en el acierto | ✓ | «(2.887.951 + 2.500 × 1.350) ÷ 4.700 ≈ $1.332,54». |
| C3 | «≈» solo si el costo no es entero | ✓ | El inicio del promedio da «5.200 × $1.300». |
| C4 | Escalera al segundo error | ✓ | En las cuatro preguntas: la respuesta queda marcada en neutro y el mensaje da el porqué. |

Los cuatro mensajes nuevos de la escalera son de Watari, y todos dan 76,9 o más:

| Pregunta | Mensaje | Palabras | INFLESZ |
| --- | --- | --- | --- |
| PEPS | «Es la del 1 de febrero: PEPS supone que sale primero la más antigua.» | 14 | 81,6 |
| UEPS | «Es la del 4 de febrero: UEPS supone que sale primero la última que entró.» | 15 | 79,7 |
| Promedio | «Sube: entran unidades más caras que el promedio de ese día.» | 11 | 76,9 |
| Pantalla 6 | «Es PEPS: quedan las últimas que entraron, sin importar cuándo se vendió.» | 12 | 85,8 |

- **E8.** Ninguna cifra de seis dígitos o más aparece en pantalla, salvo 2.887.951 en el acierto de la pantalla 5, que no está en X2.

### Fallo nuevo (obligatorio, pero menor)

**A4-N1 · El mensaje del acierto se queda pegado a otra fecha.** Después de acertar, el estudiante mueve la fecha y el mensaje no cambia, así que en pantalla quedan juntos un mensaje y un día que se contradicen:

| Pantalla | Mensaje que sigue a la vista | Fecha que muestra la figura |
| --- | --- | --- |
| 3 | «✓ Salen 4.500 del 1 de febrero, a $1.300» | 28 feb, con «Salen 400 × $1.350 y 2.400 × $1.380» |
| 5 | «✓ Sube: … ≈ $1.332,54» | 1 feb, con «5.200 × $1.300» |
| 6 | «✓ Con PEPS quedan 1.100 del 25 de febrero» | 25 feb, con el promedio en «3.900 × ≈ $1.375,13» |

**Corrección**, en el `input` del deslizador, cuando la pregunta de la pantalla ya está resuelta:
- en las pantallas 3, 4 y 5, mientras `s.visto < 9`, el mensaje pasa a «Sigue hasta el 28 de febrero.» (5 palabras). Después queda vacío;
- en las pantallas 6 y 7 queda vacío.

La línea «Salen …» de la figura ya dice lo que pasa en cada fecha.

### Menor (solo en la ficha técnica, no en la pieza)

- **Cita equivocada.** La regla «Un supuesto, no una bodega» dice: «El libro dice que el método «supone»». La palabra del libro es «asume» (p. 222). En los textos de la pieza, «supone» está bien como paráfrasis; solo la cita está mal.
- **Descripción vieja.** La lista de piezas sigue describiendo A4 como «Las capas como cajas que la venta corta». Es la idea que F4 corrigió; puede pasar a «Las capas de costo que la venta corta».

---

## 2. T7-1 A3 «la-recomendacion»: PASA CON CORRECCIONES

### Lo que pasa

- **Las dos condiciones del libro están intactas y a la vista.**
  - La p. 215 dice: «en épocas en que haya deflación se debe escoger el método PEPS, y en épocas inflacionarias es mejor escoger el método UEPS».
  - «Cuando los precios suben» es la definición del libro: «alza en los precios, o sea, en época inflacionaria», también en la p. 215.
  - «Cuando bajan» es la construcción marcada que ya había aceptado.
- **Nada es falso.**
  - «Lo que queda y lo vendido se reparten $950.000» es cierto: el costo disponible de B-1 es 200.000 + 750.000.
  - «Menos utilidad y menos impuesto sobre ella» es la p. 217: con UEPS, «las utilidades tienden a disminuirse y, por ende, el pago de impuestos sobre la renta será menor».
- **Quitar «Si lo que queda vale menos, lo vendido vale más»** está bien. Esa línea entregaba la deducción.
- **Medida.** El total visible es 59 de 60, y el acierto da 69,3 en mi estimador.

### Correcciones

**A3-1 · La respuesta se delata en la pantalla anterior (obligatoria; C1).**
- La pantalla anterior es `a-favor-y-en-contra`. Con el cambio que propone Near, su tarjeta UEPS dirá: «Si los precios suben, lo vendido sale más caro…».
- La pregunta de esta pantalla es: «Cuando los precios suben, ¿con qué método lo vendido queda más caro?». La respuesta está escrita en la pantalla de antes.
- La versión publicada en main tiene el mismo problema con su tarjeta: «Lo vendido queda con los costos más recientes. Si los precios suben, la utilidad baja…».
- **Corrección:** preguntar por la otra condición, la que ninguna tarjeta dice. El estudiante tiene que razonarla con los $950.000 de la línea 1, y el acierto deja las dos condiciones a la vista.

| Campo | Texto nuevo | Palabras | INFLESZ |
| --- | --- | --- | --- |
| Línea 1 | «Lo que queda y lo vendido se reparten $950.000.» (la de Near, sin cambios) | 9 | 87,1 |
| Pregunta | «Si los precios bajan, ¿con qué método lo vendido queda más caro?» | 12 | 91,0 |
| Opciones | «PEPS» · «UEPS (no válido bajo NIIF)» · «Promedio ponderado» (correcta: **PEPS**) | 8 | no aplica |
| Acierto | «Exacto: menos utilidad y menos impuesto de renta, que se calcula sobre ella. Por eso el libro recomienda PEPS en deflación, cuando los precios bajan, y UEPS en inflación, cuando suben.» | 31 | 72,8 |
| Pista (1.er error) | «Si los precios bajan, ¿qué método deja en lo que queda los precios más bajos? Los $950.000 no cambian.» | 19 | 99,0 |
| Si elige UEPS | «Con UEPS, lo vendido lleva los precios más recientes, que ahora son los más bajos.» | 15 | 92,2 |
| Si elige Promedio | «El promedio queda en medio. Busca el método que le deja a lo vendido los precios más altos.» | 18 | 94,0 |

- **Total visible con el acierto:** 9 + 12 + 8 + 31 = **60** (B2 ≤ 60). La pista y los errores no salen al mismo tiempo que el acierto.
- **«En deflación» y «en inflación»** reemplazan a «en épocas de…» para no pasar de 60. La condición no cambia: el precio que baja o sube va completo en la misma frase.
- **Es cierto** que, si los precios bajan, con PEPS lo vendido queda más caro: se le asignan los costos más antiguos, que son los más altos. Es la condición de la p. 215, vista desde el otro lado.

**A3-2 · «Impuesto de renta» no puede desaparecer de AP3 (obligatoria; D13).**
- AP4 (`las-utilidades`), la pieza siguiente, usa «impuesto de renta» sin definirlo, y el libro lo pone en el estado de resultados (p. 214).
- Si AP3 quita la glosa y la tarjeta pasa a «impuesto sobre la utilidad», el término llega a AP4 sin que nadie lo haya enseñado.
- **Corrección:**
  - El acierto de A3-1 ya nombra y define el término: «impuesto de renta, que se calcula sobre ella».
  - **Acepto el cambio que propone Near para la tarjeta UEPS:** «Si los precios suben, lo vendido sale más caro y el impuesto sobre la utilidad baja.» (16 palabras; INFLESZ 77,9). Con A3-1 ya no delata nada, porque la pregunta es sobre precios que bajan.
- Así, el término aparece una vez, con su definición, antes de AP4.

### Opcional

La versión publicada abría con «Según el libro, cada empresa escoge el método que más le sirva» (p. 215: «el que más le convenga a sus intereses económicos»). Con «recomienda», el carácter de sugerencia se conserva, así que puede quedar fuera por presupuesto.
