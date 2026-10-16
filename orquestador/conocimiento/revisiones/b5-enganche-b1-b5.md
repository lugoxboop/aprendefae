---
id: b5-enganche-b1-b5
titulo: La barra de enganche B1-B5 sobre las 16 piezas de la Célula B
procedencia: medicion
---

# B1-B5 sobre las piezas de la Célula B (15 de octubre de 2026)

Medido por la Célula B (Kaede) sobre main (a327784) con la sonda de enganche de la Célula D, copiada y adaptada en `scripts/b5/sonda-enganche/` (ver su README). La de D no se tocó. **Aquí no se arregla nada: solo se mide.**

- **Qué se midió:** las 16 piezas de B. Aprender: T5 piezas 1 y 3 (la 2 es de la Célula C) y las 5 de T6. Hacer: b5-t5-a1, a2 y b5-t6-a1 a a7. Cada una a **320 y a 375 px**, sin barra de desplazamiento, como un teléfono. Son 32 medidas.
- **Cómo:** Chromium 141 sin pantalla (Playwright 1.56), Sora e Inter de @fontsource 5.3.0 servidas en local y Supabase falso: no se escribió nada en ninguna base.
  - **Aprender:** cada capa es una tarjeta. Se recorren los pasos de la capa 2, se responde la parada y cada caja de la capa 3 con la clave, y en la capa 4 se prueban las frases en orden.
  - **Hacer:** cada partida se juega entera dos veces, con la misma semilla: una bien y otra mal.
- **La clave** sale de los datos del build (`enganche_clave.mjs`). En cada acierto la sonda comprobó que el juego diera el veredicto esperado. **Ninguna medida quedó «sin medir»** (código 2).
- **Autocomprobación:** `eng_fixture.py`, 12 de 12.
- **Las cifras de palabras de B2 incluyen el texto de la figura**, como en la sonda de D. Abajo, en «Lectura rápida», va también lo de fuera de la figura.
- **El margen de las Y es de ±20 px** frente a Chrome real (lo midió D). Una Y entre 260 y 300 hay que confirmarla a mano antes de dar un PASA por ella. En la frontera quedan, a 320:
  - b5-t6-a1, la figura a 272 en las 10 fichas; falla igual B1 por las 50 palabras de antes;
  - b5-t6-a6, la figura a 274 en las 8 casillas; falla igual B1 por las 44 palabras de antes;
  - Así se juega de 7 Hacer, a 262-288. Así se juega solo cuenta para B5.

## Resumen a 320

✓ PASA · ✗ FALLA · — no aplica (B2 es solo de Aprender). A 375 da lo mismo regla por regla; solo cambian algunas cifras (ver el detalle).

| Pieza | B1 | B2 | B3 | B4 | B5 | Fallos 320 · 375 |
|---|---|---|---|---|---|---|
| T5A1 | ✗ | ✗ | ✗ | ✓ | ✗ | 22 · 22 |
| T5A3 | ✗ | ✗ | ✗ | ✓ | ✓ | 26 · 26 |
| T6A1 | ✗ | ✗ | ✗ | ✓ | ✗ | 41 · 43 |
| T6A2 | ✗ | ✗ | ✗ | ✓ | ✗ | 22 · 22 |
| T6A3 | ✗ | ✗ | ✗ | ✓ | ✗ | 36 · 36 |
| T6A4 | ✗ | ✗ | ✗ | ✓ | ✗ | 25 · 27 |
| T6A5 | ✗ | ✗ | ✗ | ✓ | ✗ | 26 · 26 |
| b5-t5-a1 | ✓ | — | ✓ | ✗ | ✓ | 9 · 9 |
| b5-t5-a2 | ✗ | — | ✗ | ✓ | ✗ | 11 · 11 |
| b5-t6-a1 | ✗ | — | ✓ | ✗ | ✓ | 20 · 20 |
| b5-t6-a2 | ✗ | — | ✗ | ✓ | ✓ | 4 · 4 |
| b5-t6-a3 | ✗ | — | ✗ | ✓ | ✓ | 6 · 6 |
| b5-t6-a4 | ✗ | — | ✗ | ✗ | ✓ | 50 · 50 |
| b5-t6-a5 | ✗ | — | ✗ | ✗ | ✓ | 16 · 16 |
| b5-t6-a6 | ✗ | — | ✗ | ✗ | ✗ | 62 · 62 |
| b5-t6-a7 | ✓ | — | ✓ | ✗ | ✓ | 10 · 10 |

## Lectura rápida

**Aprender: las 7 piezas fallan B1, B2 y B3, y 6 de 7 fallan B5. Las causas son pocas y se repiten.**

1. **B1 · La capa 1 no tiene figura ni nada que tocar** (1 de 1 vista en las 7 piezas). Es la lista de nombres («Primero, los nombres») y solo se lee.
   - En las demás capas lo primero llega pronto, a 320:
     - capa 2: la escena, a 27 px;
     - capa 3: a 104-160 px;
     - capa 4: a 79-120 px.
2. **B2 · La capa 1 es el texto más largo de cada pieza:**

   | Pieza | T5A1 | T6A1 | T6A2 | T6A3 | T6A5 | T6A4 | T5A3 |
   |---|---|---|---|---|---|---|---|
   | Palabras en la capa 1 | 547 | 395 | 366 | 276 | 255 | 197 | 177 |

   - **La capa 2 pasa de 60 por la escena.** Fuera de la figura cada paso tiene 18-39 palabras. Con la escena dentro, 60-126 (T6A3, la de 15 pasos, llega a 126).
   - **La capa 3 crece al abrir cajas.** Las abiertas siguen a la vista y se suman: el mayor es T6A1, con 288 al final.
   - **La capa 4 tiene 27-99 palabras.** Es la pregunta con sus 3 o 4 frases, y tras el error, la devolución.
3. **B3 · Solo la capa 3 de T6A3, T6A4 y T6A5 cambia su figura con una elección** (1 de 4 capas; hace falta 2).
   - **Responder la parada de la capa 2 no cambia la escena** (T5A3, T6A3, T6A4, T6A5): la escena cambia con «Siguiente», y avanzar no cuenta como acción.
   - **En la capa 3 de T5A1, T5A3, T6A1 y T6A2, decidir no mueve ninguna figura.**
4. **B5:**
   - en las cajas de T6A1, la pregunta «¿Qué pasa con lo que deben los clientes?» se repite en 10 vistas, porque las cajas abiertas siguen a la vista;
   - en T6A3, «31 de diciembre de 2007» sale en la caja y en la cuenta T (5 vistas);
   - en T6A4, «Se revive toda la deuda:» (3 vistas);
   - en la capa 1 de T5A1, T6A1, T6A2, T6A4 y T6A5 se repiten «Así lo dice el libro» y «Basado en el libro, p.», en las fuentes.

**Hacer: ninguna de las 9 pasa entera.**
- **b5-t5-a1 y b5-t6-a7 solo fallan B4.** B4 sale de piezas compartidas.

5. **B4 · El acierto va en teal en 7 de 9.** Sale de dos piezas **compartidas** de `corazon/juego.jsx`, que B no puede tocar. **Va para Erwin.**
   - **El Retro:** su «Correcto:» va en teal (b5-t5-a1, b5-t6-a1, b5-t6-a4, b5-t6-a7).
   - **La Opción:** `correcta` va «lleno teal» y `revelada` («era esta») va con «anillo teal» (b5-t6-a4, a5, a6). Así lo dice su propio comentario, en `juego.jsx`, líneas 80-88.
   - **Las tres mesas no tienen marca teal**: su panel de acierto pasa.
6. **B3 · «Revela, no responde» en las mesas y en a4, a5 y a6:** la figura queda igual acierte o falle.
   - **Las mesas** (b5-t5-a2: 4 de 4, b5-t6-a2: 2 de 2, b5-t6-a3: 5 de 5): tras el error, el estante y el diario muestran el asiento bueno, y quedan como tras acertar. El total dice $180.000 aunque se escribió $181.000.
   - **a4** (10 de 10): el asiento mínimo se llena con el asiento correcto, elija lo que elija.
   - **a5** (4 de 4) **y a6** (8 de 8): el texto de la figura (la cuenta de la provisión en a5, la tabla de edades en a6) queda idéntico tras acertar y tras fallar.
   - **Las fichas de dos niveles** (b5-t5-a1, b5-t6-a1, b5-t6-a7) **pasan**: la ficha va al cajón que se eligió.
7. **B1 en Hacer:**
   - **La primera tarjeta de cada mesa empieza tarde:**
     - b5-t5-a2: 472 px a 320 y 431 a 375;
     - b5-t6-a2: 451 y 409;
     - b5-t6-a3: 447 y 387.

     De la tarjeta 2 en adelante, la figura está a 224 px.
   - **En a4, la interacción llega a 382-405 px** (y a 375, igual): antes van la regla, los pulsos, el enunciado y el asiento mínimo.
   - **En a5, a 409 px** (389 a 375).
   - **Demasiado texto antes:** b5-t6-a1 lleva 50 palabras antes del estante (en las 10 fichas), a6 lleva 44 (8 de 8) y b5-t6-a2, en su segunda tarjeta, 41.
8. **B5 en Hacer:**
   - **a6:** los tres rangos de edad («Vigentes o hasta 3 meses»…) salen en la tabla y en las opciones (10 vistas cada uno, Así se juega incluido);
   - **b5-t5-a2:** los dos nombres largos del cierre salen en el estante y en el diario (6 vistas).

**320 frente a 375.** Las reglas dan lo mismo a los dos anchos en las 16 piezas. Solo cambian:
- las Y de B1 de las mesas, a4 y a5, entre 20 y 60 px menos a 375, pero todas siguen por encima de 280;
- el número de vistas en T6A1 y T6A4: a 375, la capa 4 necesitó más intentos hasta la frase correcta (5 vistas frente a 2 y 3), así que hay más vistas de error.

**Lo que sigue (no en este PR).**
- Con esto Mai hace una hoja por lote.
- B4 es de la pieza compartida: es para Erwin.
- **b5-t6-a7 se retira en el lote 4.** Su fila queda aquí como medida.

## Límites de la medida

- **B3 compara textos de la figura.** Lo escrito en un campo (`input`) no es texto, así que la cifra mala de una mesa no cuenta como diferencia. Se miró a mano: tras el error, la mesa muestra el asiento bueno, y el «revela» de las mesas se sostiene.
- **En la capa 2, «Siguiente» no cuenta como acción**, igual que en la sonda de D.
- **Las fichas de dos niveles salen de un sorteo.** Con la semilla 7, la partida da 9 de las 14 fichas en b5-t5-a1 y 10 de 10 en b5-t6-a1 y a7.

## Detalle por pieza

Cada celda dice PASA, o FALLA con el motivo y su cifra. «Vistas» son los momentos medidos de la pieza: al llegar, tras acertar y tras fallar, o cada paso de la capa 2.

### T5A1

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 16 de 18 vistas con más de 60 palabras; la mayor, 547 (capa 1 (lectura)) | igual que a 320 |
| B3 | FALLA · 0 de 4 capas con una acción que cambia la figura (ninguna) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 4 vistas con una frase repetida: «no hay intención de venderlo» (en 2); «así lo dice el libro» (en 1); «basado en el libro, p.» (en 1) | igual que a 320 |

### T5A3

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 24 de 27 vistas con más de 60 palabras; la mayor, 177 (capa 1 (lectura)) | igual que a 320 |
| B3 | FALLA · 0 de 4 capas con una acción que cambia la figura (ninguna) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | PASA | igual que a 320 |

### T6A1

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 25 de 25 vistas con más de 60 palabras; la mayor, 395 (capa 1 (lectura)) | FALLA · 27 de 28 vistas con más de 60 palabras; la mayor, 395 (capa 1 (lectura)) |
| B3 | FALLA · 0 de 4 capas con una acción que cambia la figura (ninguna) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 14 vistas con una frase repetida: «¿qué pasa con lo que deben los clientes?» (en 10); «basado en el libro, p.» (en 3); «así lo dice el libro» (en 1) | igual que a 320 |

### T6A2

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 18 de 21 vistas con más de 60 palabras; la mayor, 366 (capa 1 (lectura)) | igual que a 320 |
| B3 | FALLA · 0 de 4 capas con una acción que cambia la figura (ninguna) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 2 vistas con una frase repetida: «así lo dice el libro» (en 1); «basado en el libro, p.» (en 1) | igual que a 320 |

### T6A3

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 28 de 30 vistas con más de 60 palabras; la mayor, 276 (capa 1 (lectura)) | igual que a 320 |
| B3 | FALLA · 1 de 4 capas con una acción que cambia la figura (capa 3) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 6 vistas con una frase repetida: «31 de diciembre de 2007» (en 5); «31 de diciembre del año siguiente» (en 1) | igual que a 320 |

### T6A4

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 19 de 22 vistas con más de 60 palabras; la mayor, 197 (capa 1 (lectura)) | FALLA · 21 de 24 vistas con más de 60 palabras; la mayor, 197 (capa 1 (lectura)) |
| B3 | FALLA · 1 de 4 capas con una acción que cambia la figura (capa 3) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 4 vistas con una frase repetida: «se revive toda la deuda:» (en 3); «basado en el libro, p.» (en 1) | igual que a 320 |

### T6A5

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · sin figura ni interacción (capa 1) | igual que a 320 |
| B2 | FALLA · 22 de 25 vistas con más de 60 palabras; la mayor, 255 (capa 1 (lectura)) | igual que a 320 |
| B3 | FALLA · 1 de 4 capas con una acción que cambia la figura (capa 3) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 2 vistas con una frase repetida: «basado en el libro, pp.» (en 1); «decreto 1625 de 2016, art.» (en 1) | igual que a 320 |

### b5-t5-a1

| Regla | 320 | 375 |
|---|---|---|
| B1 | PASA | igual que a 320 |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | PASA | igual que a 320 |
| B4 | FALLA · 9 marcas de acierto en teal: el «Correcto:» del Retro ×9 | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t5-a2

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · nada que ver ni tocar hasta 472 px (tarjeta 1 · b5-t5-a2-p1) | FALLA · nada que ver ni tocar hasta 431 px (tarjeta 1 · b5-t5-a2-p1) |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 4 de 4 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | FALLA · 6 vistas con una frase repetida: «ingresos financieros – ganancia en venta de títulos» (en 4); «gastos financieros – pérdida en venta de títulos» (en 2) | igual que a 320 |

### b5-t6-a1

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · 50 palabras antes de la figura (10 tarjetas) | igual que a 320 |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | PASA | igual que a 320 |
| B4 | FALLA · 10 marcas de acierto en teal: el «Correcto:» del Retro ×10 | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t6-a2

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · nada que ver ni tocar hasta 451 px (tarjeta 1 · b5-t6-a2-p1); 41 palabras antes de la figura (tarjeta 2 · b5-t6-a2-p2) | FALLA · nada que ver ni tocar hasta 409 px (tarjeta 1 · b5-t6-a2-p1); 41 palabras antes de la figura (tarjeta 2 · b5-t6-a2-p2) |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 2 de 2 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t6-a3

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · nada que ver ni tocar hasta 447 px (tarjeta 1 · b5-t6-a3-p1) | FALLA · nada que ver ni tocar hasta 387 px (tarjeta 1 · b5-t6-a3-p1) |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 5 de 5 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | PASA | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t6-a4

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · nada que ver ni tocar hasta 382 px (3 tarjetas); nada que ver ni tocar hasta 405 px (7 tarjetas) | FALLA · nada que ver ni tocar hasta 382 px (6 tarjetas); nada que ver ni tocar hasta 405 px (4 tarjetas) |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 10 de 10 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | FALLA · 30 marcas de acierto en teal: la opción correcta ×14, el «Correcto:» del Retro ×10, la opción revelada («era esta») ×6 | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t6-a5

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · nada que ver ni tocar hasta 409 px (4 tarjetas) | FALLA · nada que ver ni tocar hasta 389 px (4 tarjetas) |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 4 de 4 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | FALLA · 8 marcas de acierto en teal: la opción correcta ×4, la opción revelada («era esta») ×4 | igual que a 320 |
| B5 | PASA | igual que a 320 |

### b5-t6-a6

| Regla | 320 | 375 |
|---|---|---|
| B1 | FALLA · 44 palabras antes de la figura (8 tarjetas) | igual que a 320 |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | FALLA · 8 de 8 tarjetas: la figura cambia igual acierte o falle (revela, no responde) | igual que a 320 |
| B4 | FALLA · 16 marcas de acierto en teal: la opción correcta ×8, la opción revelada («era esta») ×8 | igual que a 320 |
| B5 | FALLA · 30 vistas con una frase repetida: «vigentes o hasta 3 meses» (en 10); «más de 3 hasta 6 meses» (en 10); «más de 6 meses hasta 1 año» (en 10) | igual que a 320 |

### b5-t6-a7

| Regla | 320 | 375 |
|---|---|---|
| B1 | PASA | igual que a 320 |
| B2 | no aplica (solo Aprender) | igual que a 320 |
| B3 | PASA | igual que a 320 |
| B4 | FALLA · 10 marcas de acierto en teal: el «Correcto:» del Retro ×10 | igual que a 320 |
| B5 | PASA | igual que a 320 |
