# Auditoría · Patrón de enganche C4 (Watari, 17-oct) · D4 y D9 en 30 piezas

Mello → L · 17 de octubre de 2026 · artefacto versión 1792214139-900d · main c8094a9

**Veredicto: PASA CON CORRECCIONES. C4-1 bloquea: Misa no fusiona ninguna pieza con cifra hasta aplicarla.**

- **Lo que pasa.**
  - La regla «toda decisión se pinta» está bien hecha: primero la consecuencia, a los 380 ms el veredicto, y la escalera C2 con «Iba aquí» solo en Hacer.
  - D4 sube a Avanzado: decisiones distintas pintan mundos distintos.
  - D9 sube a Medio: cada actividad tiene su objeto.
- **Lo que falla.** Al escribir una cifra, la figura dice si es la correcta antes de «Comprobar». En los Hacer, eso convierte el intento único en prueba y error.

## Cómo lo verifiqué

- **El código.** El que se ejecuta es igual al publicado para Misa (motor, figuras y las cuatro partes).
- **La sonda.** Pinté cada figura con cada opción, con y sin veredicto, y con la cifra escrita antes de comprobar. Las 543 consecuencias de las 30 piezas las leí una por una.
- **La fidelidad.** Comparé los 863 textos de Near en `C4D` con main: 841 están igual, letra por letra. Los otros 22 están compuestos en el código (C4-6).

## Correcciones

**C4-1 · E8: la figura califica la cifra mientras se escribe (bloquea).**
- Lo jugué en T7-3 H7, en la pregunta «¿Cuál es su valor neto realizable?»:
  - con «625000» escrito, sin comprobar, la figura dice «✓ Cuadra.»;
  - con «710000», dice «✕ Sobran $85.000…»;
  - con «123», dice «Faltan $624.877…».
- La sonda lo encuentra en **las 39 casillas de cifra de las 30 piezas**: T7-1 H3, H4, H5 y H6; T7-2 H2 y H5; T7-3 H1, H2, H4, H5 y H7; T5 N4, N5 y N7.
- En T7-3 H5, además, la balanza se nivela al teclear la cifra buena.
- **Corrección, en el motor:**
  - Mientras se escribe, la figura recibe la cifra solo para mostrarla en su lugar (el renglón, la casilla del objeto). Así se sigue cumpliendo la regla 4.4.
  - Nada que dependa del resultado se pinta antes de «Comprobar»: ni «Cuadra», ni «Sobran» o «Faltan», ni coral, ni la balanza nivelada, ni la caja en coral de H3.
  - En `vista()`: `valor: E.valor ?? null` (sin `E.borrador`), y un campo aparte, `borrador: E.borrador`.
  - Las figuras usan `v.borrador` solo para escribir la cifra; la consecuencia sigue usando `v.valor`, que ahora existe solo después de «Comprobar».
  - La consecuencia llega al comprobar, y el veredicto 380 ms después, como en las opciones.
- **Prueba nueva en `consecuencia-c.test.mjs`:** para cada ítem de cifra, la figura con la correcta escrita y con un distractor escrito, sin comprobar, no puede contener `c4-cuadra`, `c4-falla` ni ` mal`. Hoy fallan las 39; tiene que dar 0.

**C4-2 · «$NaN» en pantalla.**
- T7-3 H4 pinta «Tu cifra: $NaN» en los dos ítems de elección («que-le-toca» y «el-cierre»).
- **Corrección:** la línea «Tu cifra» solo va cuando `I.tipo === 'cifra'`.

**C4-3 · La falla no nombra el error real (§3.3: la refutación apunta a la idea equivocada).** Seis consecuencias describen una aritmética absurda en vez del error del distractor, que el mensaje de Near sí nombra:

| Pieza · ítem | Distractor | Hoy dice | Debe decir [W] |
| --- | --- | --- | --- |
| T5 N5 · lo-que-costaron | $2.970.000 | «Así son 582,4, no las 550» | «Así cada acción habría costado $5.400: es el precio de venta, no el de compra.» |
| T7-1 H5 · pago-transportadora | $303.000 | «Retención: $-3.000 · -1 %» | «Así la retención se sumaría al pago en vez de restarse.» |
| T7-2 H5 · pago-a-la-transportadora | $383.800 | «retiene $-3.800 (-1 %)» | La misma frase. |
| T7-3 H5 · el-faltante | $1.432.000 | «Los libros quedarían en $-694.000» | «Ese faltante es más grande que todo lo que dicen los libros.» |
| T7-1 H6 · iva-reversa y retencion-reversa | $1.088.000 y $238.000 | «128 % de lo devuelto», «28 %» | «Ese es el IVA de toda la compra; se reversa solo el de lo devuelto.», y la misma idea para la retención. |
| T7-3 H1 · iva | $328.000 | «18,18 % de lo facturado» | «Ese es el 16 % de la lista, antes del descuento.» |

Que Near mida estas frases con el medidor oficial. Una regla para el resto: **ninguna figura muestra montos negativos ni unidades fraccionarias.**

**C4-4 · Afirmaciones falsas o sin sentido en la figura.**
- **T7-3 A7 · el-costo.** «Así el bodegaje… baja el costo. Y el descuento lo sube.» es falso; según la NIC 2 del libro, el bodegaje se suma al costo. Debe decir: «Así el bodegaje restaría, y la NIC 2 lo suma al costo.». Lo mismo para «el transporte hasta la bodega».
- **T5 N1 · la-intencion.** «Ahí quedaría con otra clase de la que es.» no corresponde a esa pregunta, que es sobre evidencias. Debe decir: «Así bastaría con decirlo, y el libro pide evidencias.» y «Así decidiría el nombre del título, no la intención.».

**C4-5 · Concordancia y contracción.**
- «frente a el» → «frente al», en T7-3 H2 y H7; se arregla en la plantilla.
- «los estantes sigue igual» → «siguen», en T7-1 H7. La plantilla tiene que concordar con el número del objeto.

**C4-6 · Textos compuestos.**
- 22 textos de `C4D` no están letra por letra en main. Son de T7-1 A7 y H4, T7-3 H7, T5 P2 y Act1; por ejemplo «¿Qué renta da?» repetido, «Así es: $710.000 − $85.000 = $625.000.» y «Costó $650 cada uno. Se vende a $690.».
- Las cifras las comprobé y cuadran. Pero son texto de pantalla: que Near los confirme, o que salgan de main tal cual.

**C4-7 · Botón de avance en Hacer (§4.3).**
- El motor dice «Seguir» y «Terminar».
- **Corrección:** en Hacer, «Siguiente caso» y, en el último, «Ver mi resumen», con la pastilla teal de Responder. En main, Misa usa los `BOTONES_T7` publicados, cambiando «ítem» por «caso» como en el contador. En Aprender queda como está.

## Lo que acepto como está

- **Que la opción mala pinte el mundo en que sería verdad.** Lleva coral, ✕ y su frase desde el primer instante, no solo con el veredicto. Lo comprobé en la sonda: ninguna figura tiene marca antes de elegir. No es una metáfora falsa.
- **D9.** Cada actividad tiene su objeto nombrado, aunque reúse piezas sueltas (cuentas T, zonas). Las de T5 P1 y Act1 son cajones con otro trazo y otro contenido. La regla del Kit pide *un* elemento que no se repita, y lo hay.
- **T5 P1 y P2.** Van a Erwin como referencia de CuatroCapas, como dice Watari.

## Condiciones de fusión (sin volver a pasar por mí)

1. C4-1 aplicada, con la prueba nueva en 0 (hoy da 39) y la suite en verde.
2. C4-2, C4-5 y C4-7 aplicadas.
3. C4-3, C4-4 y C4-6 con el visto bueno de Near y su INFLESZ medido.
4. Misa juega una pieza de cada tema a 320 px en el build de main: T7-1 H3, T7-2 H5, T7-3 H7 y T5 N5. La cifra correcta escrita no puede mostrar nada antes de «Comprobar».
