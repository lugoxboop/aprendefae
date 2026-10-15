# Lote 2 · Anexo · La tercera opción de las preguntas que tenían dos

Célula C · Near · 15 de octubre de 2026. Aplica la decisión de L: **(c)** las preguntas de elección que tenían dos opciones pasan a tres, y **(a)** las líneas de Debe o Haber se quedan en dos. En esas líneas, al primer error sale la pista, y el segundo intento cierra la línea con la respuesta y su porqué.

**Son 10, no 11.** En los datos de main hay 10 preguntas de elección con dos opciones, y así lo dice el documento del lote 2. Las otras 24 pistas de dos opciones son líneas de Debe o Haber.

- Cada tercera opción lleva su retroalimentación propia, que sale en el segundo error. Todas son de 10 o más palabras y dan 65 o más en `npm run inflesz`.
- **Las pistas del lote 2 siguen como están:** las diez sirven igual con tres opciones.

| Pieza | Pantalla | Opciones (✓ = correcta) | Tercera opción, nueva | Su retroalimentación | INFLESZ |
| --- | --- | --- | --- | --- | --- |
| t7-1-a2-la-factura-completa | P2 · `base-de-la-retencion` | $5.000.000 ✓ · $5.800.000 | **$800.000** | «En este ejercicio, la retención se calcula sobre el valor de la mercancía. No se calcula sobre el IVA.» | 79,3 |
| t7-1-a3-tres-formas | P3 · `peps` | De las 30 compradas, a $25.000 ✓ · De las 10 del inicio, a $20.000 | **De los dos grupos, con un costo promedio** | «Eso hace el promedio ponderado, que viene después. PEPS no mezcla: toma las unidades en el orden en que entraron.» | 81,6 |
| t7-1-a3-tres-formas | P4 · `ueps` | De las 10 del inicio, a $20.000 ✓ · De las 30 compradas, a $25.000 | **De los dos grupos, con un costo promedio** | «Eso hace el promedio ponderado, que viene después. UEPS no mezcla: toma las unidades en orden, desde la última que entró.» | 77,7 |
| t7-3-descuento-comercial | P2 · `dos-clases` | Comercial ✓ · Condicionado | **Ninguna: si va en la factura, no es un descuento** | «Sí es un descuento. El libro llama así a la rebaja sobre el precio de lista, aunque venga escrita en la factura.» | 88,2 |
| t7-3-descuentos-en-cadena | P2 · `ejemplo` | Sí · No ✓ | **No: le rebaja más del 23 %** | «Cada descuento se calcula sobre un saldo más pequeño que el anterior. Así, la rebaja total no puede pasar del 23 %.» | 77,7 |
| t7-3-descuentos-en-cadena | P3 · `pasos` | $4.200.000 · $3.990.000 ✓ | **$210.000** | «Ese es el primer descuento, no el valor sobre el que se calcula el segundo. El 8 % va sobre lo que queda después de restarlo.» | 89,7 |
| t7-3-descuento-condicionado | P1 · `que-es` | El comercial · El condicionado ✓ | **Los dos** | «El comercial ya viene restado en la factura, así que no tiene un asiento propio.» | 79,7 |
| t7-3-descuento-en-dos-libros | P3 · `el-pago` | Debe · Haber ✓ | **No se anota en su libro** | «Sí se anota. Quien recibe el descuento también lo registra en su libro, porque paga menos de lo que debía.» | 87,8 |
| t7-3-descuento-en-dos-libros | P4 · `cierre` | Debe · Haber ✓ | **No se cierra: queda con su saldo** | «Al final del periodo, esta cuenta se cierra contra Ganancias y pérdidas. No se queda con su saldo.» | 90,5 |
| t7-3-sobrantes-y-faltantes | P3 · `faltante` | Debe · Haber ✓ | **No se mueve: solo cambia el costo** | «Si solo cambiara el costo, los libros seguirían con mercancía que ya no está en la bodega.» | 76,2 |

## Un cambio en el texto de una opción correcta

| Campo | Viejo | Nuevo |
| --- | --- | --- |
| t7-3-descuentos-en-cadena · P2 · opción correcta | «No» | «No: le rebaja menos del 23 %» |

Con la tercera opción, «No: le rebaja más del 23 %», un «No» suelto quedaría ambiguo. La retroalimentación del acierto, «Así es: la rebaja es menor…», sigue igual.

## Por qué estas terceras opciones

- **Base de la retención: $800.000 y no $5.625.000, que había propuesto Mello.** $5.625.000 es lo que se le queda debiendo al proveedor, y la P3 de la misma pieza lo esconde como «$?» para que el estudiante lo calcule. Si saliera como opción en la P2, se regalaría la P3. $800.000 es el IVA, que ya está en pantalla, y prueba una confusión real: calcular la retención sobre el IVA.
- **PEPS y UEPS: «con un costo promedio».** Es el error de mezclar los métodos, que la pieza enseña uno después de otro. No da la cifra del promedio, que se pregunta en la P5.
- **Las tres preguntas de lado** (el pago, el cierre y el faltante) ganan la confusión de «no se registra» o «no se mueve». Es la confusión que pasa cuando el estudiante no sabe si el hecho toca su libro o su cuenta.
- **Ninguna tercera opción adelanta la respuesta de otra pregunta.** Revisé cada una contra las pantallas que siguen en su pieza.

**Aviso para el lote C (no lo cambio aquí):** en t7-3-sobrantes-y-faltantes, la pantalla de la P3 dice antes de la pregunta que el faltante va «al haber de Inventario de mercancías». Es el mismo caso de respuesta regalada que señaló Mello en T7-1. Lo corrijo en el lote de recortes.
