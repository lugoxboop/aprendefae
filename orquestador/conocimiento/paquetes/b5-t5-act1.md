# PAQUETE · T5 · HACER b5-t5-a1 «¿Qué renta da este título?» · Célula B

Guardado por Kaede (construcción) el 14 de octubre de 2026, tal como llegó de Sakuta. Es la guía de diseño v2 de Mai. El contenido tiene el PASA de Shoko. La guía tiene PASA CON CORRECCIONES de Shoko; Sakuta las verificó contra T1-6 en el código y **mandan sobre el texto de la guía**:

1. **Segundo fallo.** La guía dice «se repite la misma devolución del primer fallo». Está mal. Se copia T1-6: la evaluación se vuelve a hacer con lo que el estudiante marcó en ese intento, y devuelve la devolución (A, B o C) del error de ESE intento. La excepción son las fichas de nombre de renta fija: tras el segundo fallo, la devolución de la lista del libro (columna «Tras el segundo fallo»).
2. Tras un reintento acertado, la devolución del primer fallo desaparece: queda solo el ✅ con la de acierto, como en T1-6. El aviso «La ficha no se colocó.» solo se ve mientras se espera el reintento.
3. **Emojis.** Como en T1-6, el ❌ y el ✅ van al inicio del texto en los datos, y Retro los separa. El texto que sigue al emoji se copia literal.
4. La devolución sale por Retro (`role="status"`), como en T1-6.

Pendiente de Futaba (por INFLESZ < 65): def-emisora, caso-pactado, el acierto de def-interes y el párrafo del resumen. Se construye con los actuales; el cambio será solo de datos.

---

Guía de diseño · Hacer b5-t5-a1 · «¿Qué renta da este título?»

De: Mai (diseño, Célula B) · Para: Shoko (auditoría) y Kaede (construcción), vía Sakuta · Versión: 2 · 13-oct-2026
Base: la actividad de Futaba (encargo de Sakuta del 13-oct, 19:07), con las devoluciones de nombre finales (20:16), ya auditadas por Shoko, y las decisiones de Sakuta.
Modelo visual: T1-6 «¿En cuál estado aparece?» (EnCualEstadoAparece.jsx, main 0277ac9), con lo que Sakuta verificó en el código [S].
Prototipo: prototipo-b5-t5-a1.html (adjunto). Es una réplica jugable del patrón, para medir y mostrar estados; no es código para copiar.

Qué cambió de la 1.2 a la 2:

- Devoluciones de las fichas de nombre, finales: una por nivel fallado, más la del segundo fallo. Ya nada va POR CONFIRMAR.
- Alto mínimo de 44 px en pestañas y opciones del segundo nivel, con el texto centrado en vertical [D]. Con el panel abierto, el juego crece 41,57 px a 320 y 41,56 a 375; con el panel cerrado, 16,75 (§5).

Comprobación de textos: un script cotejó 70 textos literales:

- 50 de 50 coinciden con el encargo de Futaba: objetivo, consigna, reglas, rótulos, 14 fichas, 14 devoluciones de acierto, 3 de error, resumen y texto alternativo.
- 19 de 19 coinciden con las devoluciones de nombre finales, copiadas de tu mensaje de las 20:16.
- «Elige qué renta fija» coincide con la decisión de Sakuta.
- Los 70 están en esta guía.
- Además, las seis de «Tras el segundo fallo» son idénticas, carácter por carácter, a las devoluciones de la versión anterior, como dice Futaba.

## 0 · De dónde sale cada cifra

- [S] — verificado por Sakuta en el código: todo lo que esta guía dice de T1-6, de Responder y del reintento.
- [M] — medida de Mai en mi prototipo, no en el sitio. Navegador y método: Chromium 141.0.7390.37 headless vía Playwright (Python), ventana de 320×900 y de 375×900, escala 1:1. Medí con getBoundingClientRect y conté las líneas con Range.getClientRects (cimas distintas). Los anchos naturales de texto los medí con measureText de canvas. Fuentes: Sora e Inter de @fontsource 5.3.0, cargadas (document.fonts.check verdadero). Marco: el Panel real (degradado, borde, radio 20, relleno 14) con margen de página 16, que da un ancho útil de 258 / 313. Sin desborde horizontal a ningún ancho.
- [R] — supuesto de mi réplica, porque el dato no está verificado (§10). Toda cifra que depende de él lleva la marca.
- [C] — contraste calculado con la fórmula de WCAG 2.x sobre los colores reales del Panel (#13233B a #0C1728, medidos por píxel en la guía de la pieza 1). Doy el rango.
- [E] — estimación de Mai, sin medir.
- [D] — decisión de diseño mía.

## 1 · Qué se reutiliza y qué es nuevo

| Parte | Origen | Qué hace Kaede |
|---|---|---|
| Encabezado (objetivo, consigna, «¿Cómo se juega?»), contador «Ficha», botón Responder, aviso «La ficha no se colocó.», devolución con ❌ / ✅, recuadro «RESULTADO», «Otra tanda» | Compartido | Lo usa tal cual. Solo le pasa los textos de la §3. |
| Ficha, pestañas apiladas, panel unido, opciones del segundo nivel, atenuado, reintento | Patrón de T1-6 [S] | Lo replica con los mismos valores (§2). |
| Pestaña de una sola línea, pestaña que no abre panel («Renta variable»), reglas al cambiar de pestaña, segundo nivel a 12 px, alto mínimo de 44 | Propio de esta actividad [D] | §2.2, §2.4 y §2.5 |

## 2 · Especificación visual

### 2.1 Ficha [S]

- Sora 14 px, peso 700, interlineado 1,3, color texto.
- Relleno 11 / 13, radio 11, fondo rgba(10,20,34,0.5), borde 1 px rgba(248,249,250,0.2).
- Al fallar: borde discontinuo en coral y rebote corto. El coral dura solo los 420 ms del rebote; después vuelve a 1 px sólido rgba(248,249,250,0.2).
- Con «movimiento reducido» no hay rebote. Cuánto dura entonces el coral es como en T1-6 (§10).
- Ancho: el ancho útil, 258 / 313 [R]. Ancho del texto: 230 / 285 [M].

### 2.2 Pestañas del primer nivel

- [S] Apiladas a todo el ancho, con 6 px entre ellas.
- [S] Relleno 9 / 11, radio 10, fondo rgba(10,20,34,0.4), borde 1 px rgba(248,249,250,0.16).
- [S] Elegida: borde 2 px neutro #B8C4D4 y fondo rgba(184,196,212,0.12).
- Texto: una sola línea, con la tipografía de la línea «idea» de T1-6: Sora 12,5 px, peso 700, interlineado 1,25 [S]. La línea «cuando» de T1-6 no se usa.
- [D] Alto mínimo 44 px, con el texto centrado en vertical. Mide 44 px [M]; sin ese mínimo mediría 35,63. Las pestañas de T1-6, de dos líneas, ya son más altas que eso, así que esta regla acerca la nuestra al aspecto publicado en vez de alejarla.
- [D] Orden: «Renta variable» arriba y «Renta fija» abajo. Así el panel de «Renta fija» se abre al final de la lista y no empuja a ninguna otra pestaña.

### 2.3 Panel del segundo nivel [S]

- Se abre debajo de «Renta fija», unido a ella: borde 2 px neutro, sin borde superior, fondo rgba(184,196,212,0.06).
- Dentro van «Con interés» y «Con descuento».
- Sin rótulo de término: T1-6 lo pone a 10 px, pero aquí no va, porque Futaba pide que no haya texto entre los dos niveles.
- Alto del panel abierto: 111 px [M; relleno interno 8 R].

### 2.4 Opciones del segundo nivel

- [S] Apiladas, con 5 px entre ellas.
- [S] Relleno 7 / 9, radio 8, fondo rgba(10,20,34,0.4), borde 1 px rgba(248,249,250,0.18).
- [S] Elegida: fondo neutro #B8C4D4 y texto en navy #1D3557, con 6,99:1 [C].
- [D] Texto a 12 px, no a 11,5 como en T1-6, para cumplir nuestro suelo de 12. Medí la diferencia: 0,65 px por opción, no se ve. Familia e interlineado [R]: Inter, 1,3.
- [D] Alto mínimo 44 px, con el texto centrado en vertical. Mide 44 px [M]; sin ese mínimo mediría 31,59. Esto sí se ve distinto de T1-6: cada opción mide 12,41 px más que sin el mínimo (31,59), y unos 13 px más que la de T1-6 a 11,5 px (30,94 en la réplica [R]). Va así por nuestra regla de 44 y porque tú lo propusiste para los dos niveles.

### 2.5 Reglas de las pestañas [D]

- «Renta variable» no abre panel. Al elegirla, toma el estilo de pestaña elegida y conserva su radio completo. El botón pasa directo a «Colocar la ficha».
- De «Renta fija» a «Renta variable»: el panel se cierra y se borra la elección del segundo nivel.
- De «Renta variable» a «Renta fija»: el panel se abre sin nada elegido.
- Tocar la pestaña ya elegida no hace nada.
- Semántica: las pestañas son botones con aria-pressed, no role="tab", porque no cambian de vista. «Renta fija» lleva además aria-expanded y aria-controls, que apuntan al panel. El panel es un role="group".
- Sin chevrón (decisión de Sakuta: se copia T1-6).

### 2.6 Botón principal: Responder (piezas.jsx), compartido [S]

- Ancho 100 %, relleno 13 / 18, Sora 14 px, peso 700.
- El texto dispone de 222 px a 320 y 277 px a 375 [M].
- Interlineado: no lo declara; lo hereda del contenedor. En la réplica mide 44 px con una línea [R]. Lo mide Kaede en el sitio.

### 2.7 Atenuado [S]

Lo que ya no se puede elegir se atenúa en borde y fondo, no entero. El texto queda en #A8B6C8 sólido, con 7,65:1 o más [C]. En el reintento no se atenúa nada.

## 3 · Inventario por estados, con todo el texto literal

### ESTADO 1 · INICIAL

Encabezado compartido. El objetivo va separado por la raya:

- Objetivo: «Distinguir los tres tipos de título según el tipo de renta que dan.»
- Consigna: «Lee la ficha. Elige qué tipo de renta da.»
- Botón «¿Cómo se juega?», que abre estas tres líneas:
  - «Elige primero si el título es de renta variable o de renta fija.»
  - «Si es de renta fija, elige también si es con interés o con descuento.»
  - «Pulsa el botón para colocar la ficha; si fallas, tienes un intento más.»

Contador: «Ficha», texto fijo del componente.

La ficha: el texto de la ficha que toque (§3.6).

Pestañas, las dos en reposo: «Renta variable» · «Renta fija». El panel está cerrado. No hay texto entre los dos niveles.

Botón: «Elige un tipo de renta».

### ESTADO 2 · COLOCANDO

| Situación | Lo que se ve | Rótulo literal del botón |
|---|---|---|
| No ha elegido nada | Las dos pestañas en reposo | «Elige un tipo de renta» |
| Eligió «Renta variable» | «Renta variable» elegida, sin panel | «Colocar la ficha» |
| Eligió «Renta fija» y falta el segundo nivel | «Renta fija» elegida y, debajo, el panel con «Con interés» · «Con descuento», sin nada elegido | «Elige qué renta fija» |
| Eligió «Renta fija» y su segundo nivel | Igual, con la opción elegida en neutro y navy | «Colocar la ficha» |

Ancho natural de los rótulos en Sora 14/700 [M], frente al espacio de Responder (222 a 320 · 277 a 375):

| Rótulo | Ancho | Líneas a 320 | Líneas a 375 |
|---|---|---|---|
| «Elige un tipo de renta» | 152,45 | 1 | 1 |
| «Elige qué renta fija» | 132,99 | 1 | 1 |
| «Colocar la ficha» | 111,72 | 1 | 1 |
| «Siguiente ficha» | 108,58 | 1 | 1 |
| «Ver el resultado» | 112,97 | 1 | 1 |
| «Otra tanda» | 76,93 | 1 | 1 |

Todos caben en una línea; el botón no salta al abrir el panel.

### ESTADO 3 · PRIMER FALLO, Y REINTENTO

- La ficha: borde discontinuo coral y rebote, solo durante 420 ms [S]. Comprobado en la réplica: a los 500 ms la ficha ya no tiene coral [M].
- Aviso compartido: «La ficha no se colocó.» 12 px, centrado, color rgba(248,249,250,0.75), borde 1 px discontinuo coral [S]. Texto a 8,95–9,89:1 sobre el Panel [C].
- Devolución compartida: ❌ y el texto que corresponda:
  - Fichas de definición o caso: la devolución por tipo de error (§3.7).
  - Fichas de nombre: la de «Falló el nivel 1» o la de «Falló el nivel 2», según dónde falló (§3.8).
- Durante el reintento [S]: el aviso y la devolución del primer fallo siguen visibles. Las elecciones se quedan marcadas y nada se apaga; el estudiante cambia lo que quiera y vuelve a pulsar «Colocar la ficha». El error no depende solo del color: lo señalan el borde discontinuo, la frase «La ficha no se colocó.» (que se queda) y el ❌.

### ESTADO 3b · SEGUNDO FALLO

- Las seis fichas de nombre de renta fija (cdt, bonos, cedulas, participacion, cert, canjeables): la devolución pasa a la columna «Tras el segundo fallo» (§3.8), que da la lista del libro. Es el mismo recuadro, sin estilo nuevo, y no importa en qué nivel fallaron la segunda vez.
- La ficha de nombre «acciones»: se repite su devolución de nivel 1, que ya da la respuesta.
- Las fichas de definición y caso: se repite la misma devolución del primer fallo, como en T1-6. **[Corregido por Shoko y Sakuta: ver la corrección 1 de arriba.]**
- Después, «Siguiente ficha» o, en la última, «Ver el resultado».

### ESTADO 4 · ACIERTO

- ✅ y la devolución de acierto de la ficha (§3.6).
- Después, «Siguiente ficha» o, en la última, «Ver el resultado».

### ESTADO 5 · RESUMEN

- El recuadro compartido «RESULTADO» con el porcentaje.
- Párrafo propio, literal:

«{bien} de {cuantas} completas al primer intento. Cada ficha valía {X} %: elegir variable o fija pesa 60 %, y elegir con interés o con descuento, 40 %. En las de renta variable, acertar la primera elección vale la ficha entera.»

Con 9 fichas, {X} = 100 / 9 = 11,1… El redondeo y el separador decimal los pone el componente, igual que en T1-6. En la réplica, con un decimal, ocupa 6 líneas a 320 y 5 a 375 [R].

- Botón «Otra tanda».

### 3.6 Banco de fichas, con su devolución de acierto

Texto de la ficha en Sora 14/700 [S], a 230 / 285 de ancho [M]. El alto incluye relleno y borde.

| Id | Texto literal de la ficha | Respuesta | Tipo | Líneas · alto a 320 | a 375 |
|---|---|---|---|---|---|
| acciones | «Acciones de otra empresa» | Renta variable | Nombre | 1 · 42,19 | 1 · 42,19 |
| def-emisora | «Su rendimiento depende de los factores económicos propios de la empresa que emitió el título.» | Renta variable | Definición | 4 · 96,75 | 3 · 78,56 |
| def-dividendos | «Sus dividendos dependen de la situación económica y de la liquidez de quien lo emitió.» | Renta variable | Definición, casi literal | 3 · 78,56 | 3 · 78,56 |
| caso-resultados | «Lo que recibe quien lo tiene se decide según los resultados de la empresa que lo emitió.» | Renta variable | CONSTRUCCIÓN | 3 · 78,56 | 3 · 78,56 |
| cdt | «CDT (certificado de depósito a término)» | Renta fija → Con interés | Nombre | 2 · 60,38 | 2 · 60,38 |
| bonos | «Bonos» | Renta fija → Con interés | Nombre | 1 · 42,19 | 1 · 42,19 |
| cedulas | «Cédulas hipotecarias» | Renta fija → Con interés | Nombre | 1 · 42,19 | 1 · 42,19 |
| def-interes | «Le paga un interés fijo durante un periodo determinado.» | Renta fija → Con interés | Definición | 2 · 60,38 | 2 · 60,38 |
| caso-pactado | «Desde el día de la compra se sabe qué interés pagará la empresa que lo emitió durante un periodo determinado.» | Renta fija → Con interés | CONSTRUCCIÓN | 4 · 96,75 | 3 · 78,56 |
| participacion | «Títulos de participación» | Renta fija → Con descuento | Nombre | 1 · 42,19 | 1 · 42,19 |
| cert | «CERT (certificado de reembolso tributario)» | Renta fija → Con descuento | Nombre | 2 · 60,38 | 2 · 60,38 |
| canjeables | «Títulos canjeables» | Renta fija → Con descuento | Nombre | 1 · 42,19 | 1 · 42,19 |
| def-descuento | «Su renta es la diferencia entre el valor de compra y el valor de redención.» | Renta fija → Con descuento | Definición | 3 · 78,56 | 2 · 60,38 |
| caso-redencion | «Se compra por menos de lo que pagará la empresa que lo emitió al redimirlo, y esa diferencia es lo que gana.» | Renta fija → Con descuento | CONSTRUCCIÓN | 4 · 96,75 | 3 · 78,56 |

Ninguna ficha se corta ni desborda [M]. Entre una ficha y otra, las pestañas pueden moverse hasta 54,56 px (de 42,19 a 96,75 de alto). No se reserva alto fijo, igual que en T1-6.

Devoluciones de acierto (tras ✅). Las líneas dependen de la letra de la devolución compartida, que no está verificada: medí con Inter 13/1,55 [R].

| Ficha | Texto literal (tras ✅) | Líneas a 320 · 375 [R] |
|---|---|---|
| acciones | «Sí. Lo que rinden depende de cómo le vaya a la empresa que las emitió.» | 3 · 2 |
| def-emisora | «Sí. Esa es la marca de la renta variable: rinde según la empresa que lo emitió.» | 3 · 2 |
| def-dividendos | «Sí. Así describe el libro a las acciones: sus dividendos siguen a quien las emitió.» | 3 · 2 |
| caso-resultados | «Sí. Si lo que recibe se decide según cómo le vaya a la empresa que lo emitió, es renta variable.» | 3 · 3 |
| cdt | «Sí. El libro pone el CDT entre los títulos que pagan un interés fijo durante un periodo.» | 3 · 2 |
| bonos | «Sí. El libro pone los bonos en la renta fija con interés.» | 2 · 2 |
| cedulas | «Sí. Las cédulas hipotecarias van con el CDT y los bonos: renta fija con interés.» | 3 · 2 |
| def-interes | «Sí. Interés fijo durante un periodo determinado: así define el libro la renta fija con interés.» | 3 · 3 |
| caso-pactado | «Sí. El interés quedó fijo al invertir, aunque lo pague una empresa: es renta fija con interés.» | 3 · 3 |
| participacion | «Sí. El libro pone los títulos de participación entre los de descuento.» | 2 · 2 |
| cert | «Sí. El CERT está en la lista del libro de renta fija con descuento.» | 2 · 2 |
| canjeables | «Sí. Los títulos canjeables están en la lista del libro de renta fija con descuento, que es una lista abierta.» | 3 · 3 |
| def-descuento | «Sí. La renta sale de la diferencia entre lo que costó y lo que vale al redimirse: con descuento.» | 3 · 3 |
| caso-redencion | «Sí. Gana la diferencia entre lo que pagó y el valor de redención: es renta fija con descuento.» | 3 · 3 |

### 3.7 Devoluciones de error de las fichas de definición o caso

| Tipo | Cuándo aparece | Texto literal (tras ❌) | Líneas a 320 · 375 [R] |
|---|---|---|---|
| A | Puso un título de renta fija en «Renta variable» | «Este título es de renta fija: su renta se pacta al invertir. La que depende de cómo le vaya a la empresa que emitió el título es la renta variable.» | 5 · 4 |
| B | Puso un título de renta variable en «Renta fija» | «Este es de renta variable. Su rendimiento depende de cómo le vaya a la empresa que lo emitió; no es una renta constante pactada al invertir.» | 5 · 4 |
| C | Acertó «Renta fija» pero confundió «Con interés» y «Con descuento» | «Vas bien: es renta fija. Ahora mira cómo produce la renta. Si paga un interés fijo durante un periodo, es con interés. Si gana la diferencia entre el valor de compra y el de redención, es con descuento.» | 6 · 5 |

### 3.8 Devoluciones de error de las fichas de nombre (finales)

Entre paréntesis van las líneas a 320 · 375 [R]. La página del libro es solo para auditoría; el estudiante no la ve.

| Ficha | Falló el nivel 1 (tras ❌) | Falló el nivel 2 (tras ❌) | Tras el segundo fallo (tras ❌) |
|---|---|---|---|
| acciones | «No es esa. El libro pone las acciones en la renta variable: sus dividendos dependen de la empresa que las emitió.» (4 · 3) | — (no tiene segundo nivel) | Se repite la de nivel 1 |
| cdt | «No es esa. El libro pone el CDT en la renta fija, no en la variable.» (2 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿el CDT estaba con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone el CDT en la lista de renta fija con interés.» (2 · 2) |
| bonos | «No es esa. El libro pone los bonos en la renta fija: su renta se pacta al invertir.» (3 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿los bonos estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone los bonos en la lista de renta fija con interés.» (2 · 2) |
| cedulas | «No es esa. El libro pone las cédulas hipotecarias en la renta fija, no en la variable.» (3 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿las cédulas hipotecarias estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone las cédulas hipotecarias en la lista de renta fija con interés.» (3 · 3) |
| participacion | «No es esa. El libro pone los títulos de participación en la renta fija, no en la variable.» (3 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿los títulos de participación estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone los títulos de participación en la lista de renta fija con descuento.» (3 · 3) |
| cert | «No es esa. El libro pone el CERT en la renta fija: su renta se pacta al invertir.» (3 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿el CERT estaba con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone el CERT en la lista de renta fija con descuento.» (3 · 2) |
| canjeables | «No es esa. El libro pone los títulos canjeables en la renta fija, no en la variable.» (3 · 2) | «Vas bien: es renta fija. Recuerda la lista del libro: ¿los títulos canjeables estaban con los que pagan un interés fijo, o con los que ganan una diferencia al redimirse?» (5 · 4) | «No es esa. El libro pone los títulos canjeables en la lista de renta fija con descuento.» (3 · 3) |

### 3.9 Texto alternativo para lector de pantalla (literal)

«Actividad de clasificación. Aparece una ficha con el nombre de un título o con una pista de cómo rinde. Elige Renta variable o Renta fija. Si eliges Renta fija, elige también Con interés o Con descuento. Luego pulsa Colocar la ficha. Si fallas, tienes un intento más. Después de cada respuesta se lee la explicación.»

Va donde T1-6 pone el suyo.

## 4 · La tanda

- 9 fichas: 3 de renta variable, 3 con interés y 3 con descuento, mezcladas, con como mucho una ficha de nombre por grupo.
- Con este banco, eso obliga a algo que comprobé en la réplica [M]: «Con interés» y «con descuento» solo tienen dos fichas que no son de nombre, así que llevan siempre exactamente una ficha de nombre. En renta variable puede haber una o ninguna.

## 5 · Alto del juego

Desde el contador hasta el fondo del botón, con la ficha más alta (96,75 / 78,56) [M; contador e interlineado de Responder R]:

| Estado | Sin el mínimo de 44 | Con 44 px (v2) | Crece |
|---|---|---|---|
| Panel cerrado, a 320 | 266,3 | 283,05 | +16,75 |
| Panel abierto, a 320 | 352,48 | 394,05 | +41,57 |
| Panel cerrado, a 375 | 248,11 | 264,86 | +16,75 |
| Panel abierto, a 375 | 334,3 | 375,86 | +41,56 |

Las dos columnas están medidas en la misma réplica, quitando y poniendo el mínimo [M]. Lo que crece: panel cerrado: solo crecen las dos pestañas, de 35,63 a 44 cada una. Panel abierto: crecen además las dos opciones del segundo nivel, de 31,59 a 44 cada una; el panel pasa de 86,19 a 111.

## 6 · Accesibilidad

| Elemento | Contraste [C] |
|---|---|
| Texto de la ficha | 16,31–17,29:1 |
| Texto de las pestañas | 16,05:1 o más |
| Texto de la opción elegida del segundo nivel (navy sobre neutro) | 6,99:1 |
| Texto atenuado | 7,65:1 o más |
| Texto del aviso «La ficha no se colocó.» | 8,95–9,89:1 |
| Borde discontinuo coral | 5,10–5,81:1 |
| Borde de la pestaña elegida | 8,93:1 o más |
| Borde de la ficha en reposo | 1,83–1,86:1 |
| Borde de las pestañas en reposo | 1,59–1,63:1 |
| Borde de las opciones del segundo nivel | 1,74–1,75:1 |

Los tres últimos están por debajo de 3:1 (§8).

- Objetivo táctil: todo lo que se toca mide 44 px o más: pestañas, opciones del segundo nivel y Responder (este último, [R]) [M].
- Error sin depender del color: sí (estado 3).
- Movimiento reducido: el rebote se apaga [S]. No hay otro movimiento.
- Recortes: nada se corta con puntos suspensivos [M].
- Tamaño de letra: nada de esta actividad baja de 12 px. Las pestañas van a 12,5, el segundo nivel a 12 y el aviso a 12. Las líneas de 10, 10,5 y 11,5 px de T1-6 no se usan aquí.
- Lectores de pantalla: aria-pressed en pestañas y opciones; aria-expanded en «Renta fija»; el texto alternativo de la §3.9; y la devolución se anuncia como en T1-6.

## 7 · Glifos

Esta actividad no añade ningún ícono. ❌ y ✅ son los del componente compartido, con su único significado: error y acierto. Lo elegido se marca con borde y fondo, sin «check». Sin chevrón.

## 8 · Lo que se deja igual que T1-6 a sabiendas

- Bordes en reposo bajo 3:1 (ficha 1,83, pestañas 1,59, segundo nivel 1,74 [C]). Se dejan igual, por coherencia con lo publicado. Van a Erwin, como ya se hizo con UnaFrase.
- Cerrado: el reintento (decisión de Sakuta), el chevrón (no va), el rótulo corto («Elige qué renta fija») y el objetivo táctil (resuelto con el alto mínimo de 44).

## 9 · Lo que Kaede mide o revalida en el sitio

Se mide con getBoundingClientRect, con las fuentes cargadas, a 320 y a 375.

1. Interlineado real de Responder, y que sus seis rótulos queden en una línea a 320.
2. Pestañas y opciones del segundo nivel en 44 px, con el texto centrado.
3. Las 14 fichas: una línea más o menos que en la §3.6 es normal; lo que importa es que ninguna desborde.
4. El párrafo del resumen con {X} formateado por el componente.

## 10 · ME FALTA de T1-6 (no bloquea)

- Atenuado: los valores exactos de borde y fondo.
- Coral con «movimiento reducido»: cuánto dura cuando no hay rebote. Se copia T1-6.
- Letra de la devolución compartida. En la réplica usé Inter 13/1,55 [R].
- Separaciones entre el contador, la ficha, las pestañas y el botón, y el relleno del panel. En la réplica usé 8, 12, 14 y 8 [R].
- Formato del contador y redondeo de {X}.
