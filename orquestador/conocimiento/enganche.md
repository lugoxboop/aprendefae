---
id: enganche
titulo: La barra de enganche
procedencia: mixta
---

> **PROCEDENCIA.** La regla de mecánicas es de Mateo y se la dio a Gen antes de
> que existieran las células: nunca llegó al canon. Los umbrales en palabras y
> en píxeles (B1, B2) son criterio de la Célula D, no salen de un estudio. Se
> calibran con estudiantes reales, y quien los cambie lo anota aquí con su
> razón. La revisión que los originó se hizo el 15 de octubre de 2026 sobre la
> página publicada, por orden de Mateo: «calidad sobre cantidad».

# La barra de enganche

Una actividad puede pasar todas las pruebas, caber a 320 px, no revelar la
respuesta, tener cada cifra con su página, y aun así no enganchar a nadie.
Eso pasó con las tres primeras piezas publicadas del T4. Este archivo existe
para que no le pase a otra célula.

## La regla de la casa sobre mecánicas

**Animación interactiva en tiempo real, no diapositivas ni cadenas de
selección.** Una mecánica de selección puede existir, pero el estudiante tiene
que ver un movimiento real a consecuencia de lo que decide. Si solo hace clic y
lee, no es una mecánica.

La dio Mateo, como regla de Gen, y vivía solo en la memoria de ese chat. Una
célula que nació después no tenía forma de conocerla. **Una regla que no está
en el canon no existe para quien llega después.**

## Lo que se encontró, con su evidencia

Medido en aprendefae.com, con marcos de 320 y 375 px dentro del propio sitio:

- **A0 «El activo corriente»**: 9 pantallas con una media de 124 palabras. La
  primera tiene 187 palabras y cuatro ideas. La figura empieza por debajo del
  pliegue en 6 de las 9 pantallas, a 594 px del tope de la tarjeta en la
  primera. El estudiante lee un muro de texto antes de ver nada.
- **A1 «La caja»**: 10 pantallas, entre 72 y 147 palabras. Las tres primeras no
  tienen figura. La figura cambia de estado, pero el estudiante no la maneja.
- **H1 «¿Entra o sale de Caja?»**: una lista de tres opciones de radio. No tiene
  cuenta T ni saldo que se mueva. Además, el acierto «Haber de Caja» se pinta en
  teal, que en Contabilidad significa debe, y la consigna sale dos veces en la
  misma pantalla.

## Por qué pasó

1. **La regla de mecánicas no estaba escrita** donde la célula podía leerla.
2. **Se midió «cabe», no «engancha».** Las sondas comprobaban anchos, saltos y
   que nada revelara la respuesta. Ninguna medía cuánto se lee antes de ver o de
   hacer algo.
3. **D9 del kit es un hueco.** Sin criterio, el auditor no tenía con qué medirlo
   y dio PASA a piezas sin gancho visual.
4. **Cada corrección sumó párrafos.** Las auditorías pedían matices, y el matiz
   siempre llegó como texto, nunca como figura.

## La barra

- **B1 · Primero la figura.** A 320 px, la figura o la interacción empieza en
  los primeros 280 px de la tarjeta. El texto antes de ella no pasa de 40
  palabras.
- **B2 · Presupuesto de texto.** En Aprender, como mucho 60 palabras por
  pantalla. Lo que no cabe va en otra pantalla, o lo dice la figura.
- **B3 · El estudiante hace algo.** En Aprender, al menos la mitad de las
  pantallas tienen una acción con consecuencia visible en la figura. En Hacer,
  la decisión mueve algo que significa algo (una cuenta T, un saldo, un sobre):
  no basta con marcar una opción de radio.
- **B4 · En Contabilidad, el acierto no se pinta en teal ni en ámbar.** Esos dos
  colores ya significan debe y haber. El acierto se marca con forma (✓ o borde),
  en neutro.
- **B5 · Ningún texto aparece dos veces en la misma pantalla.**

**B1, B2 y B5 se comprueban con pruebas automáticas**, no a ojo. Una barra que
depende de que alguien se acuerde de mirarla es la misma que ya falló.

## Cómo se revisa

En la página publicada, o en el build servido en local con Playwright y el
viewport fijo (ver herramientas.md), nunca leyendo el código. La extensión de
Chrome dice que redimensionó la ventana y no lo hace: compruebe
`window.innerWidth` antes de medir, o use marcos del ancho exacto dentro del
propio sitio.

## Lo que encontró la Célula E en su autodiagnóstico (15 de octubre)

Repaso del capítulo 5: r5-1 «Repaso cruzado» y r5-2 «El Toro Negro», jugadas
en la página y en el build local con Playwright a 320 y 375 px. Cada falla,
con su causa y la regla que la evita.

- **E1 · Contenido aprobado que no llegó a la pantalla.** Las seis pistas de
  r5-1 estaban en el paquete y en los datos, y la vista no las pintaba.
  *Causa:* las pruebas miraban los datos, no el DOM, y la lista de pruebas del
  paquete no pedía «se ve». *Regla:* cada paquete pide una prueba de cobertura
  de pantalla que juega cada estado (cada opción, la pista abierta) y falla si
  un texto del estudiante no sale en el DOM en ninguno.
- **E2 · Lo que cambia al responder pasaba fuera de la vista.** La cuenta de
  las pantallas de cálculo transformaba los datos, que al responder quedan a
  0 px de la vista (medido a 375×667 y 320×568): el foco baja a «Siguiente».
  *Causa:* se diseñó en una captura de página entera, no en la ventana del
  teléfono. *Regla:* lo que aparece o cambia al responder va entre lo que se
  tocó y el botón de seguir, y se mide en el viewport, no en la captura.
- **E3 · Acierto y error solo con el borde.** En el armador de asientos de
  r5-2, el debe, el haber, el valor y el lado calificados decían bien o mal
  solo con teal o coral; la pantalla vecina (a0) sí tenía palabras. *Causa:*
  la regla D12 se aplicó pantalla por pantalla, no pieza por pieza.
  *Regla:* toda pieza calificada lleva su palabra («Correcta», «No va aquí»).
  La prueba: en blanco y negro, ¿se sabe cuál pieza falló?
- **E4 · El estado elegido se perdía al calificar.** El botón del lado del
  saldo perdía su relleno al revisar y los dos quedaban iguales salvo un
  borde. *Regla:* la elección del estudiante conserva su forma (relleno)
  después de calificarse; la calificación se suma, no la reemplaza.
- **E5 · Una frase repetida en cada fila.** «Porcentaje que fija la empresa:
  N %» siete veces; a 320 partía en tres renglones y la tabla medía 1.618 px.
  *Regla:* lo que vale para todas las filas se dice una vez (en el hecho o la
  cabecera); en la fila queda solo lo que cambia, mejor si es la cuenta que
  hay que hacer («× 3 %»).
- **E6 · Contenido escrito como marca.** Rótulos de lote a 10,5 px en
  mayúsculas. *Regla:* 10,5 px en mayúsculas es solo para marcas de
  interfaz («PREGUNTA 2 DE 6»); lo que el estudiante necesita leer va a 12 px
  o más.
- **E7 · Lo que el kit no mide: r5-1 es una cadena de selección.** Con la barra
  B3 de este archivo, cuatro de sus seis pantallas son marcar una opción de
  radio y no mueven nada. Cumple el kit y no cumple la barra. *Corregido en la
  v2 (#250, paquete `e5-r5-1-v2`):* el flujo del título se reproduce, el
  asiento entra en las cuentas T, las latas se venden, las fichas arman el
  costo con un contador en vivo y los lotes se mezclan. *Regla:* antes de
  escribir contenido, el general fija la mecánica de cada pantalla con la
  pregunta «¿qué se mueve cuando el estudiante decide?»; si la respuesta es
  «nada», la pantalla no está diseñada.
- **E8 · La figura no hace la cuenta que se califica.** En el primer diseño de
  la v2, el rótulo «Costo de cada unidad» calculaba en vivo el promedio que
  la pregunta pedía; la elección se reducía a multiplicar y los distractores
  dejaban de ser creíbles (Takamura). *Regla:* la figura muestra los
  insumos y las consecuencias; el resultado que se evalúa solo aparece
  después de responder.
- **E9 · Un distractor que la pantalla misma desmiente no es distractor.** En
  el contenido de r5-5, la opción «el periódico no suma los fletes» la negaba
  el dato declarado de la entrada («promedia todo el mes, con fletes»), y «el
  permanente se equivoca» se descartaba por su tono; quedaban dos opciones
  de cuatro (Takamura). *Regla:* cada distractor nace de un error real del
  estudiante y se lee contra todo lo que la pantalla ya dice; ninguna opción
  se descarta sin saber contabilidad.
- **E10 · Cuando un error lleva a la cifra correcta, el acierto lo explica.**
  En r5-5 el flete cuesta justo el 5 % que se descontó: quien ignora ambos
  llega a $2.300, la clave. No se puede cambiar el dato del libro (Takamura).
  *Regla:* si un camino equivocado probable da la clave, el acierto dice por
  qué la cifra coincide, para que quien acertó por casualidad se lleve la
  razón correcta; y las devoluciones de los errores vecinos nombran ese
  camino («precio de lista más flete»), no uno improbable.
- **E11 · Una barra que no muestra la diferencia dice lo contrario.** En el
  diseño de r5-5, la pantalla «¿Por qué no da lo mismo?» comparaba el costo
  del mes en dos barras: 25.788.363 contra 25.865.885, un 0,3 % que en
  264 px mide menos de 1 px. Las barras se veían iguales justo donde se
  pregunta por qué no lo son (Takamura). *Regla:* antes de dibujar una
  comparación, se calcula cuántos píxeles mide la diferencia; si son menos
  de 4, va en cifras, no en barras.
- **E12 · Una opción que se acierta buscando una palabra.** En C.1 de r5-1,
  la clave y la trampa solo cambiaban «60 días» por «tres años», y las dos
  malas eran las únicas con «años»: se acertaba sin la regla del año
  (Takamura). *Regla:* antes de entregar opciones, se leen buscando una
  palabra o una forma que delate la clave sin saber la materia; los plazos,
  unidades y largos van parejos entre opciones.

## Lo que encontró la Célula C en su autodiagnóstico (15 de octubre)

Son 44 piezas: T7-1, T7-2, T7-3 y las suyas de T5. Se midieron con Playwright a 320 y 375 px y se jugaron pieza por pieza. El detalle y la evidencia están en `calidad/c7.md`. Las barras B1 a B5 ya cubrían los muros de texto. Lo de abajo es lo que no cubrían.

- **C1 · La respuesta viaja en la pantalla anterior.** La pregunta llega después de una pantalla que ya dijo la respuesta, y responder es recordar lo de hace diez segundos.
  - *Causa:* cada texto se auditó por separado y nadie leyó la secuencia.
  - *Regla:* la cadena de la opción correcta no aparece en las dos pantallas anteriores a su pregunta, salvo como dato del enunciado. Se comprueba con una prueba automática por pieza.
- **C2 · El primer error regala la respuesta.** En Aprender, el primer fallo explicaba la solución completa y el «Probar otra» quedaba vacío.
  - *Regla:* escalera de ayuda.
    - Al primer error, una **pista** de 20 palabras como máximo que orienta sin nombrar la respuesta.
    - Al segundo error, la respuesta con su porqué.
  - El campo `pista` es obligatorio en toda pregunta de Aprender, y una prueba lo exige.
- **C3 · Hacer calcados.** Nueve Hacer repetían el mismo esqueleto: elegir la cifra entre 3 y después el lado de cada línea, con la cuenta y el monto ya puestos. Elegir el lado con la cuenta a la vista es 50/50.
  - *Regla:*
    - En un asiento calificado, el estudiante elige la **cuenta** (entre la correcta y dos distractores verosímiles) y además el **lado**.
    - Si el objetivo de un ítem es calcular, la cifra se **escribe**. La opción múltiple queda para los conceptos.
    - Dos Hacer seguidos de un tema no pueden tener la misma secuencia de mecánicas.
- **C4 · La misma decisión en tres temas.** «¿Entra al costo?» repetía la decisión de «¿Costo o gasto?» y la del flete de T7-2, con los mismos ejemplos.
  - *Regla:* antes de abrir un Hacer, se busca en la materia una decisión igual. Si existe, la pieza nueva sube el nivel (un caso que engaña, una variable más) o no se abre.
- **C5 · Reglas del juego dentro de la consigna.** «Tienes un solo intento por pregunta» aparecía en casi todas las consignas, y en una era toda la consigna.
  - *Regla:* la consigna dice qué hacer con este caso. Las reglas del juego van en un distintivo junto al contador, una sola vez.
- **C6 · Dos piezas que son una.** T7-2 A5 y A6 enseñaban la misma regla («en el permanente no existe Compras») con otro hecho. Dos Hacer binarios repetían listas que ya se habían colocado en Aprender.
  - *Regla:* si dos piezas enseñan la misma regla y solo cambia el hecho, son una pieza con dos casos. Un Hacer que se resuelve al 50 % o buscando una palabra del Aprender no se abre.
- **C7 · El resumen que borra el límite.** «Almacenamiento» pasó a ser «lo que cuesta guardarla», sin el «directamente atribuible a la adquisición» de la p. 258. La frase quedó más corta y dejó de ser cierta.
  - *Regla:* al resumir una definición del libro, se conserva la condición que la limita («directamente», «solo si», «cuando»). Si no cabe, se cita entera. El auditor compara cada resumen con su página, no solo las cifras.
  - *Corolario:* esa condición tampoco se pliega detrás de «¿Por qué?». Lo plegado solo lo ve quien acierta y lo abre, y una condición que solo ve quien acertó no protege a quien se equivocó.
- **C8 · Lo que sí engancha: la figura que crece y se queda.** La única pieza de la célula que enganchó por su mecánica fue «Llena el kárdex». Cada respuesta añade una fila, la tabla sigue a la vista y el estudiante ve su trabajo acumularse.
  - *Regla:* en un Hacer de varios ítems sobre un mismo caso, cada respuesta deja su huella en una figura que sigue en pantalla mientras se responde lo siguiente (una tabla, un asiento, una cuenta). Un ítem que borra lo anterior para preguntar lo siguiente desperdicia el caso.

## Lo que encontró la Célula D en su autodiagnóstico (15 de octubre)

T4 «Efectivo, caja menor y bancos». Se revisaron las 3 piezas publicadas (A0, A1 y H1) y las 11 sin publicar, en la página y con la sonda de enganche (`scripts/t4/sonda-enganche/`, Playwright a 320 y 375 px). Fallaban las 14. Se rediseñaron todas y los Hacer pasaron de 8 a 5. Lo de abajo es lo que B1-B5 y las reglas de las otras células no cubrían.

- **D1 · Un Hacer que no mueve nada se quita, no se decora.** H2 pedía reconocer un control dentro de una lista: ninguna decisión movía plata ni registro, así que cualquier figura habría sido adorno. H5 y H6 eran la mitad de otra decisión (el arqueo y la conciliación).
  - *Regla:* antes de rediseñar un Hacer, se pregunta qué figura con significado cambia cuando el estudiante decide. Si no hay ninguna, la pieza sale. Si es un paso de otra, se funde con ella. Cinco piezas que enganchan valen más que ocho que se contestan.
- **D2 · La figura que acumula exige un solo caso.** H1 tenía ocho hechos de ocho negocios distintos. Un saldo que sumara sus cajas habría sido falso.
  - *Regla:* si la figura lleva un saldo, un mayor o un total que crece con cada respuesta, todos los ítems son del mismo caso, con saldo inicial. Un script comprueba que el saldo no da negativo en ningún orden (H1: 40.320 órdenes).
- **D3 · Tras el error, la figura dice la verdad.** Si el error escribe la cifra donde la puso el estudiante, el saldo siguiente miente y el resto de la partida se juega sobre un dato falso.
  - *Regla:* en un Hacer de un solo intento, la elección equivocada se marca («✗ No va aquí») y la cifra va a donde de verdad iba («Iba aquí»). La figura nunca guarda un estado falso.
- **D4 · La meta solo se alcanza acertando.** En H8, siete de las nueve partidas mal llevadas daban el mismo saldo final del mayor: llegar a la meta no probaba nada.
  - *Regla:* si la figura muestra una meta (un saldo conciliado, un total), un script recorre todas las combinaciones de decisiones y comprueba que solo la correcta llega. Si alguna equivocada llega, se cambian las cifras construidas.
- **D5 · La forma no delata la respuesta.** Una tarjeta que traía la decisión del faltante solo en las rondas con faltante respondía la primera pregunta. Una bandeja o libreta que crece al recibir la cifra dice dónde iba.
  - *Regla:* lo que el estudiante ve antes de decidir es igual en todos los casos. Las tarjetas llevan la misma estructura, y bandejas, libretas y secciones reservan el mismo alto. Es la regla PH8-2 llevada a la geometría.
- **D6 · El contador y el pulso salen del mismo número.** Al responder, el contador decía «Hecho 2 de 8» y el pulso ya marcaba el tercero, porque cada uno calculaba por su lado.
  - *Regla:* el contador y el indicador de progreso se derivan del mismo índice, que avanza al tocar «Siguiente», no al responder. Una prueba lo comprueba al llegar, al acertar y al fallar.
- **D7 · Nada queda gris y muerto.** Al terminar de colocar, «Sube» y «Baja» seguían en pantalla sin hacer nada. En Aprender, «Seguir» avanzaba aunque la respuesta estuviera mal.
  - *Regla:* un control que ya no hace nada desaparece. En una pantalla con reintento, después de un error no se avanza sin el acierto.
- **D8 · El medidor cuenta lo que ve el estudiante, y se prueba roto.** La primera guardia contaba solo el párrafo y dejaba fuera la cabecera, la figura, los botones y el pie. La primera sonda medía la etapa de H5 con un asiento equivocado y daba PASA en el color.
  - *Regla:* una sonda o guardia cuenta todo el texto visible de la pantalla y juega el asiento correcto, que saca de los mismos datos que se miden. Además trae un fixture con un caso roto por regla, que tiene que salir FALLA. Si no pudo medir, sale con código propio (2), nunca con PASA.
