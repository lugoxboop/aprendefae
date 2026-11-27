# Gestión de Proyectos · Capítulo 6 (Gestión del Cronograma) — los Hacer diarios (Gen, 2026-11-27)

Fuente única: `../fichas/c06-cronograma.md` (Guía del PMBOK 6.ª ed., cap. 6, pp. 173–231).
Ids de piezas: `gp-c06-hMM-…`; subtemas `gp06-…`. Los Aprender los hace Jane: puntos de
conexión en §6.

## 0. Reglas comunes

Valen sin cambios las de `c1-c2-hacer.md` §0 (formato diario 3–5 min, mundo Altamira,
elenco, paso 6, límites de texto, mecánica común de arrastre, puntaje, celular 320/375,
claves «criterio de Gen»). No se repiten aquí. Solo lo propio del capítulo:

- **Hilo del capítulo: la tienda de Cartagena** (proyecto del programa «Expansión a la
  costa»). El estudiante es su director(a) en las 12 piezas.
- **Elenco que aparece:** zorro (Tú), panda (Patrocinadora), gato (Gerente funcional:
  presta al electricista y a los baristas), hámster (Equipo del proyecto), perro (PMO),
  hurón (Practicante). La alcaldía, el centro comercial y el proveedor de máquinas **no**
  son mascotas: aparecen como edificio, contrato o camión.
- **La red de la tienda (la misma en H04, H05, H07, H08, H09, H11 y H12).** Días
  laborables. **Convención: el proyecto empieza en el día 0** (la guía usa el día 1 y
  acepta otras convenciones, p. 211); se dice en pantalla con una nota fija.

| Id | Actividad | Duración | Predecesoras (todas FS) |
|---|---|---|---|
| A | Firmar el arriendo del local | 3 | — |
| B | Diseñar la adecuación | 5 | A |
| C | Tramitar el permiso de obra (alcaldía) | 8 | A |
| D | Adecuar el local | 10 | B, C |
| E | Comprar y recibir las máquinas de espresso | 6 | B |
| F | Instalar las máquinas | 2 | D, E |
| G | Contratar baristas | 7 | A |
| H | Capacitar baristas | 4 | G |
| I | Inauguración (hito) | 0 | F, H |

  **Resultados calculados (clave de H07–H09):**

| Id | ES | EF | LS | LF | Holgura total | Holgura libre |
|---|---|---|---|---|---|---|
| A | 0 | 3 | 0 | 3 | 0 | 0 |
| B | 3 | 8 | 6 | 11 | 3 | 0 |
| C | 3 | 11 | 3 | 11 | 0 | 0 |
| D | 11 | 21 | 11 | 21 | 0 | 0 |
| E | 8 | 14 | 15 | 21 | 7 | 7 |
| F | 21 | 23 | 21 | 23 | 0 | 0 |
| G | 3 | 10 | 12 | 19 | 9 | 0 |
| H | 10 | 14 | 19 | 23 | 9 | 9 |
| I | 23 | 23 | 23 | 23 | 0 | 0 |

  Rutas: A–C–D–F–I = **23 (crítica)** · A–B–D–F–I = 20 · A–B–E–F–I = 16 · A–G–H–I = 14.
  Comprobado a mano dos veces (adelante y atrás) y contra la suma de cada ruta: la
  holgura total de B (3), E (7), G y H (9) coincide con 23 menos la longitud de su ruta
  más larga.
- **Cifras inventadas para practicar** (días, horas, pesos) son del escenario; las reglas
  que se aplican sobre ellas son de la guía y se citan en la ficha.

## 1. Plan y calendario

Días contados desde el inicio del capítulo 6 (en el calendario general siguen a los del
capítulo 5).

| Día | id | Nombre | Mecánica | Subtemas | Dific. | FP | Aprender previo (Jane) |
|---|---|---|---|---|---|---|---|
| 1 | gp-c06-h01-semaforo | El semáforo del plan | Archivar en fuelle + calcular desviación (2 etapas) | gp06-planificar, gp06-conceptos | Medio | 25 × 2 = 50 × % | gp-c06-a01 |
| 2 | gp-c06-h02-linterna | La linterna del túnel | Clasificar + iluminar lo cercano (2 etapas) | gp06-actividades | Fácil | 10 × 2 = 20 × % | gp-c06-a01 |
| 3 | gp-c06-h03-rompecabezas | Las piezas que encajan | Encajar conectores + cuadrícula 2 × 2 (2 etapas) | gp06-pdm, gp06-dependencias | Medio | 25 × 2 = 50 × % | gp-c06-a02 |
| 4 | gp-c06-h04-cinta | La cinta métrica | Deslizar barras (cálculo de fechas) | gp06-adelantos | Medio | 25 × % | gp-c06-a02 |
| 5 | gp-c06-h05-sumadora | La sumadora de duraciones | Calcular con 4 técnicas + elegir técnica (2 etapas) | gp06-estimar | Difícil | 50 × 2 = 100 × % | gp-c06-a03 |
| 6 | gp-c06-h06-alcancias | Pintores y alcancías | Predecir y revelar + clasificar reservas (2 etapas) | gp06-reservas | Medio | 25 × 2 = 50 × % | gp-c06-a03 |
| 7 | gp-c06-h07-metro | El metro de la ruta crítica | Taller: rutas, ida y vuelta (3 etapas) | gp06-ruta-critica | Difícil | 50 × 3 = 150 × % | gp-c06-a04 |
| 8 | gp-c06-h08-domino | Fichas de dominó | Predecir el efecto de un retraso | gp06-ruta-critica | Difícil | 50 × % | gp-c06-a04 |
| 9 | gp-c06-h09-relevos | La pista de relevos | Comprar días al menor costo + solapar (2 etapas) | gp06-compresion | Difícil | 50 × 2 = 100 × % | gp-c06-a05 |
| 10 | gp-c06-h10-bloques | La torre de bloques | Mover bloques de horas (2 etapas) | gp06-recursos | Medio | 25 × 2 = 50 × % | gp-c06-a05 |
| 11 | gp-c06-h11-rotafolio | El rotafolio del lunes | Priorizar retrasos + leer la gráfica de pendientes (2 etapas) | gp06-controlar | Medio | 25 × 2 = 50 × % | gp-c06-a06 |
| 12 | gp-c06-h12-plotter | El rollo del practicante | Encontrar el error y corregirlo | gp06-cronograma, gp06-compresion, gp06-ruta-critica, gp06-actividades, gp06-adelantos | Difícil | 50 × % | gp-c06-a06 |

**Variedad:** 12 piezas, 11 mecánicas distintas. Con selección entre opciones como
mecánica principal solo 2 (H06 y H08, predecir y revelar) ≤ 12/5; en ambas la escena se
mueve (pintores que trabajan, fichas que caen). **Gancho visual propio** en cada una, sin
repetir c1-c2 ni c05 (§3): semáforo y archivador de fuelle, linterna, rompecabezas,
cinta métrica de sastre, sumadora de manivela, alcancías, mapa de metro, dominó, pista de
atletismo, torre de bloques, rotafolio, rollo de plotter.

**Cálculos reales:** H01 (% de desviación contra umbral), H04 (fechas con adelantos y
retrasos), H05 (análoga ajustada, paramétrica, triangular, beta, ascendente, rango), H06
(reserva en %), H07 (longitud de rutas, ES/EF/LS/LF, holgura total y libre), H08 (efecto
de un retraso según la holgura), H09 (intensificación al menor costo, días ganados con un
adelanto), H10 (horas por día contra capacidad), H11 (línea ideal y pronóstico de la
gráfica de trabajo pendiente).

**Respaldo:** práctica de recuperación con retro específica (Roediger y Karpicke);
práctica espaciada diaria (Cepeda et al.); Mayer (un objeto grande, señalización,
contigüidad). H07 = **ejemplo resuelto que se desvanece** (primero nodos llenos, luego
el estudiante completa; Sweller, efecto del ejemplo resuelto). H08 y H06 = **predecir
antes de ver** (generación y corrección del error de predicción). H09 y H10 = problemas
con **consecuencias visibles**. H12 = **detección de errores**. La elección exacta de
cada mecánica es criterio propio sobre esa base.

**Dificultad progresiva:** de reconocer (H01–H03) a calcular (H04–H07, H10) y a decidir
con números (H08, H09, H11) y evaluar (H12).

---

## 2. Especificación pieza por pieza

### H01 · El semáforo del plan (`gp-c06-h01-semaforo`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (17):** «Antes de programar la tienda de Cartagena, la PMO pide el plan de
  gestión del cronograma por escrito.»
- **Rol (10):** «Diriges el proyecto y redactas el plan con la PMO.»
- **Etapa 1 · Consigna (8):** «Archiva cada decisión en la pestaña del plan.»
  - **Visual:** archivador de fuelle (acordeón) ilustrado (Gemini), abierto, con siete
    pestañas rotuladas: Metodología y herramienta · Unidades de medida · Nivel de
    exactitud · Umbrales de control · Reglas de medición · Formatos de informes ·
    Iteraciones. El perro (PMO) sostiene el fuelle; al acertar, la hoja entra en su
    pestaña y el fuelle se abomba un poco.

| Decisión | Pestaña | Retro si se equivoca |
|---|---|---|
| «Usaremos el método de la ruta crítica y un programa de cronogramas.» | Metodología y herramienta | «Qué método y qué software usar: metodología y herramienta.» |
| «Las duraciones se miden en días laborables.» | Unidades de medida | «Días, horas o metros son unidades de medida.» |
| «Las estimaciones aceptan un rango de ± 10 %.» | Nivel de exactitud | «El rango aceptable de una estimación es el nivel de exactitud.» |
| «Si una actividad se desvía más de 10 %, se actúa.» | Umbrales de control | «La variación permitida antes de actuar es un umbral de control.» |
| «El avance se mide con valor ganado: SV y SPI.» | Reglas de medición | «Cómo se mide el desempeño son reglas de medición.» |
| «El informe de avance sale cada lunes en una página.» | Formatos de informes | «Formato y frecuencia de los informes van en su pestaña.» |
| «La campaña de lanzamiento irá en iteraciones de dos semanas.» | Iteraciones | «Los periodos preestablecidos de trabajo son la duración de iteraciones.» |

  Partida: 7 (todas; orden sorteado).
- **Etapa 2 · Consigna (7):** «Calcula la desviación y pon el semáforo.»
  - **Visual:** semáforo de tránsito ilustrado (Gemini), grande, con dos estados que se
    distinguen **por forma y texto**, no solo por color: verde con ✓ «Dentro del umbral»
    y rojo con ! «Actuar». Al lado, una tarjeta con la actividad, sus días planeados y
    reales. Regla fija en pantalla: «Umbral: actuar si la desviación pasa de 10 %».
  - El estudiante escribe el % (teclado numérico) y luego toca el estado del semáforo.
    Fórmula en pantalla al fallar: desviación = (real − planeado) ÷ planeado × 100.

| Actividad | Planeado | Real | Desviación ✓ | Semáforo ✓ | Retro si se equivoca |
|---|---|---|---|---|---|
| D · Adecuar el local | 10 | 11 | 10 % | Dentro | «1 ÷ 10 = 10 %: no pasa de 10 %, sigue en verde.» |
| C · Permiso de obra | 8 | 10 | 25 % | Actuar | «2 ÷ 8 = 25 %: supera el umbral, hay que actuar.» |
| G · Contratar baristas | 7 | 7 | 0 % | Dentro | «Real igual a planeado: no hay desviación.» |
| E · Máquinas de espresso | 6 | 7 | 17 % (16,7) | Actuar | «1 ÷ 6 ≈ 17 %: pasa el umbral del 10 %.» |
| B · Diseñar la adecuación | 5 | 5,5 | 10 % | Dentro | «0,5 ÷ 5 = 10 %: justo en el límite, aún verde.» |

  Partida: 4 (siempre la de 10 % exacto, que es la trampa). Se acepta 16,7 o 17 en E.
- **Micro final:** Contexto (15): «El equipo de mercadeo quiere trabajar tomando tareas de
  una cola, apenas hay gente libre.» Consigna (5): «¿Qué tipo de programación es?» → **A
  demanda (Kanban)** / Ruta crítica. Retro: «Tomar trabajo de una cola según capacidad es
  programación a demanda.» (11)
- **Subtemas:** `gp06-planificar` (etapas 1–2), `gp06-conceptos` (micro).

### H02 · La linterna del túnel (`gp-c06-h02-linterna`, Fácil, 10 × 2 = 20 FP × %)
- **Contexto (16):** «La EDT de la tienda ya está aprobada. Ahora hay que convertir sus
  paquetes de trabajo en actividades.»
- **Rol (9):** «Diriges el proyecto y armas la lista de actividades.»
- **Etapa 1 · Consigna (7):** «¿Actividad, hito o entregable de la EDT?»
  - **Visual:** una caja de paquete de trabajo ilustrada «Local adecuado» que se abre y
    deja salir tarjetas; tres bandejas: **Actividad** (ícono de mano con brocha) ·
    **Hito** (banderín sobre un punto: «duración 0») · **Entregable de la EDT** (caja
    cerrada: «va en la EDT, no en la lista de actividades»).

| Tarjeta | Clave | Retro si se equivoca |
|---|---|---|
| «Pintar las paredes.» | Actividad | «Es una acción con duración: actividad del cronograma.» |
| «Instalar la barra.» | Actividad | «Es esfuerzo para completar el paquete: actividad.» |
| «Montar las luces.» | Actividad | «Acción con inicio y fin: actividad.» |
| «Permiso de obra recibido.» | Hito | «Es un evento puntual, sin duración: hito.» |
| «Inauguración de la tienda.» | Hito | «Un evento significativo de duración cero: hito.» |
| «Local adecuado.» | Entregable de la EDT | «Es el entregable que el paquete produce: va en la EDT.» |
| «Barra instalada.» | Entregable de la EDT | «Un resultado verificable es entregable; la acción es "instalar".» |

  - **Micro:** Consigna (6): «¿Cuántos días dura el hito "Inauguración"?» → **0** / 1 /
    Lo que dure la fiesta. Retro: «Los hitos tienen duración cero: son un punto.» (8)
  - **Micro:** Contexto (11): «El contrato del centro comercial exige abrir el 1 de marzo.»
    Consigna (6): «¿Ese hito es obligatorio u opcional?» → **Obligatorio** / Opcional.
    Retro: «Lo exige el contrato: hito obligatorio.» (6)
- **Etapa 2 · Consigna (8):** «Ilumina lo que ya puedes planificar en detalle.»
  - **Visual:** túnel ilustrado (Gemini) con el zorro sosteniendo una **linterna**
    grande. Cerca, iluminadas, piedras nítidas (actividades del primer mes); lejos, en
    penumbra, bultos con nombre (paquetes de planificación). El estudiante decide qué
    tarjetas ilumina (detalla hoy) y cuáles deja en penumbra (detalla después).

| Trabajo | Clave | Retro si se equivoca |
|---|---|---|
| «Firmar el arriendo (esta semana).» | Detallar hoy | «Lo cercano se planifica en detalle.» |
| «Diseñar la adecuación (próxima semana).» | Detallar hoy | «Ya se conoce bien: se detalla ahora.» |
| «Campaña de lanzamiento (en 4 meses).» | Dejar en penumbra | «Lo lejano queda a alto nivel: planificación gradual.» |
| «Segunda temporada de menú (en 8 meses).» | Dejar en penumbra | «Falta información: se descompone cuando se acerque.» |

  - **Micro final:** Contexto (15): «Al detallar la obra aparece "reforzar el piso", que no
    estaba en la línea base.» Consigna (4): «¿Qué haces con eso?» → **Solicitud de
    cambio** / Lo agrego callado. Retro: «Trabajo nuevo fuera de la línea base genera una
    solicitud de cambio.» (12)
- **Subtema:** `gp06-actividades`.

### H03 · Las piezas que encajan (`gp-c06-h03-rompecabezas`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (15):** «Ya tienes la lista de actividades de la tienda. Falta decir cómo se
  conecta cada una con otra.»
- **Rol (9):** «Diriges el proyecto y secuencias las actividades con el equipo.»
- **Etapa 1 · Consigna (7):** «Elige el conector que une estas dos piezas.»
  - **Visual:** dos piezas de rompecabezas ilustradas (Gemini) grandes, una por
    actividad; entre ellas, un hueco. Cuatro conectores para arrastrar, cada uno con su
    sigla, su nombre y un dibujo de barras: **FS** Final a Inicio · **SS** Inicio a Inicio ·
    **FF** Final a Final · **SF** Inicio a Final. Al acertar, las piezas encajan y se
    dibuja la flecha del gráfico 6-9 entre la parte correcta de cada barra.

| Par | Conector ✓ | Retro si elige otro |
|---|---|---|
| «Instalar las máquinas no empieza hasta terminar la adecuación.» | FS | «Una no empieza hasta que la otra termine: final a inicio.» |
| «Capacitar a los baristas solo después de contratarlos.» | FS | «Primero termina contratar; luego empieza capacitar: FS.» |
| «Revisar las fotos del menú no empieza antes de empezar la sesión de fotos.» | SS | «Una empieza cuando la otra ya empezó: inicio a inicio.» |
| «Editar el manual del barista no termina antes de terminar su redacción.» | FF | «Una no termina hasta que termine la otra: final a final.» |
| «El vigilante de noche no termina su turno hasta que empiece el de día.» | SF | «Para terminar, necesita que la otra empiece: inicio a final.» |

  Partida: 4 (siempre la SF, la más rara).
  - **Micro:** Consigna (9): «¿Qué relación conviene usar la mayor parte del tiempo?»
    → **FS** / SF. Retro: «La FS es la más usada; la SF casi no se usa.» (12)
  - **Micro:** Contexto (13): «El practicante puso SS y FF a la vez entre pintar y
    limpiar.» Consigna (3): «¿Es buena idea?» → **No** / Sí. Retro: «No se recomiendan dos
    relaciones entre las mismas actividades: elige una.» (11)
- **Etapa 2 · Consigna (7):** «Ubica cada dependencia en su casilla.»
  - **Visual:** cuadrícula 2 × 2 dibujada como cuatro cajones de una mesa de trabajo
    ilustrada: filas **Obligatoria / Discrecional**, columnas **Interna / Externa**. La
    alcaldía aparece como edificio pequeño en la columna Externa.

| Dependencia | Casilla ✓ | Retro si se equivoca |
|---|---|---|
| «Sin el permiso de la alcaldía no puede empezar la obra.» | Obligatoria · Externa | «La exige la ley y depende de la alcaldía: obligatoria externa.» |
| «No se puede probar la máquina sin instalarla.» | Obligatoria · Interna | «Es la naturaleza del trabajo y está en tus manos: obligatoria interna.» |
| «Por buena práctica, pintamos después de la instalación eléctrica.» | Discrecional · Interna | «Otro orden sería posible: es lógica preferida, interna.» |
| «La PMO prefiere esperar el estudio de la Cámara de Comercio para fijar precios.» | Discrecional · Externa | «No es obligatorio y depende de alguien de fuera: discrecional externa.» |

  Clave de la última fila: **criterio de Gen** (la guía no da un ejemplo de discrecional
  externa).
- **Subtemas:** `gp06-pdm` (etapa 1), `gp06-dependencias` (etapa 2). Celular: piezas una
  encima de otra a 320 px; los cuatro conectores en una fila de 2 × 2.

### H04 · La cinta métrica (`gp-c06-h04-cinta`, Medio, 25 FP × %)
- **Contexto (15):** «Algunas actividades de la tienda no van pegadas: unas se adelantan y
  otras deben esperar.»
- **Rol (9):** «Diriges el proyecto y ajustas las fechas del cronograma.»
- **Consigna (8):** «Desliza la barra hasta el día en que empieza.» (en el ítem 4:
  «…en que termina»)
- **Visual:** **cinta métrica de sastre** ilustrada (Gemini) que cruza la pantalla, con los
  días marcados del 10 al 25 (convención de inicio en 0). Encima, la barra de la
  predecesora ya puesta; el estudiante desliza la barra de la sucesora (o la marca de su
  fin). Al acertar, aparece la etiqueta del vínculo (FS + 3, FS − 2…) sobre la cinta.

| Situación | Clave | Retro si se equivoca |
|---|---|---|
| «La pintura termina el día 15. El aviso se monta 3 días después, para que seque.» | Empieza el **18** (FS + 3) | «Termina en 15 y espera 3: 15 + 3 = 18.» |
| «Instalar máquinas termina el día 23. La capacitación empieza 2 días antes.» | Empieza el **21** (FS − 2) | «Un adelanto resta: 23 − 2 = 21.» |
| «La decoración empieza el día 12. El inventario del menú empieza 4 días después de empezarla.» | Empieza el **16** (SS + 4) | «Inicio a inicio con retraso: 12 + 4 = 16.» |
| «La obra termina el día 21. La limpieza final termina 1 día después.» | Termina el **22** (FF + 1) | «Final a final con retraso de 1: 21 + 1 = 22.» |
| «El jardín de la terraza empieza 2 días antes de que termine la obra (día 21).» | Empieza el **19** (FS − 2) | «Adelanto de 2 sobre el final: 21 − 2 = 19.» |

- **Micro final (2):**
  1. Contexto (10): «El hámster estima "pintar: 8 días", contando 3 de secado.» Consigna
     (6): «¿Está bien meter el secado ahí?» → **No: va como retraso** / Sí. Retro: «Las
     estimaciones de duración no incluyen adelantos ni retrasos.» (9)
  2. Contexto (11): «No sabe qué va primero y propone "arreglarlo" con un adelanto.»
     Consigna (5): «¿Sirve un adelanto para eso?» → **No** / Sí. Retro: «Los adelantos
     no deben reemplazar la lógica del cronograma.» (9)
- **Subtema:** `gp06-adelantos`. Celular: la cinta hace zoom a 8 días visibles alrededor
  de la respuesta; números de día ≥ 14 px; se arrastra o se usan flechas ◀ ▶.

### H05 · La sumadora de duraciones (`gp-c06-h05-sumadora`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (15):** «Cada actividad de la tienda necesita su duración. Tienes datos
  distintos para cada una.»
- **Rol (9):** «Diriges el proyecto y estimas con el equipo.»
- **Visual común:** **sumadora de manivela antigua** ilustrada (Gemini), grande, con
  teclado y rollo de papel; el estudiante escribe el resultado y gira la manivela; el
  rollo imprime el cálculo completo. Una placa arriba dice la técnica de la estación.
- **Etapa 1 · Consigna (6):** «Calcula la duración con estos datos.» (5 estaciones, en orden)

| Estación | Datos | Respuesta ✓ | Retro si se equivoca |
|---|---|---|---|
| 1 · Análoga | «En Medellín, adecuar un local tomó 8 días. El de Cartagena es 25 % más grande.» | **10 días** | «Análoga ajustada: 8 × 1,25 = 10 días.» |
| 2 · Paramétrica | «Hay que pintar 360 m². Un pintor rinde 45 m² por día.» | **8 días** | «Cantidad ÷ rendimiento: 360 ÷ 45 = 8 días.» |
| 3 · Tres valores (triangular) | «Permiso de obra: optimista 5, más probable 7, pesimista 12 días.» | **8 días** | «Triangular: (5 + 7 + 12) ÷ 3 = 8 días.» |
| 4 · Ascendente | «Contratar baristas: publicar el aviso 2, entrevistas 3, exámenes médicos 2 días.» | **7 días** | «Se suman las partes: 2 + 3 + 2 = 7 días.» |
| 5 · Rango | «El proveedor dice: 2 semanas ± 2 días (semanas de 5 días).» | **Entre 8 y 12 días** (dos casillas) | «10 días ± 2: mínimo 8 y máximo 12.» |

  - Al terminar, el rollo muestra que 10, 8, 7 son las duraciones de D, C y G en la red
    de la tienda (§0): el estudiante ve de dónde salen.
  - **Micro (beta, criterio de Gen):** Consigna (8): «Con la fórmula beta, ¿cuánto da el
    permiso?» Fórmula en pantalla: (O + 4M + P) ÷ 6. → **7,5 días**. Retro: «(5 + 28 + 12)
    ÷ 6 = 45 ÷ 6 = 7,5 días.» (14). Nota en pantalla: «La guía da la beta en el cap. 7,
    para costos; aquí se aplica a duración.» (La pieza la marca así en el archivo de
    datos; se quita si el profesor no la usa.)
- **Etapa 2 · Consigna (7):** «¿Qué técnica usarías en cada caso?» Cuatro placas:
  Análoga · Paramétrica · Tres valores · Ascendente.

| Caso | Técnica ✓ | Retro si elige otra |
|---|---|---|
| «Casi no hay información y la junta quiere una cifra hoy.» | Análoga | «Con poca información y prisa, la análoga es rápida y barata.» |
| «Tienes datos históricos confiables de días por metro cuadrado.» | Paramétrica | «Una relación estadística por unidad es estimación paramétrica.» |
| «El permiso es muy incierto; quieres un rango con mejor y peor caso.» | Tres valores | «Incertidumbre con escenarios: estimación basada en tres valores.» |
| «Nadie se atreve a estimar "abrir la tienda"; hay que partirla.» | Ascendente | «Si no se puede estimar, se descompone y se suma: ascendente.» |

  - **Micro final:** Consigna (9): «¿Cuál es menos exacta, aunque más barata y rápida?»
    → **Análoga** / Paramétrica. Retro: «La análoga cuesta menos y tarda menos, pero es
    menos exacta.» (11)
- **Puntaje:** aciertos al primer intento / 11.
- **Subtema:** `gp06-estimar`. Ítem más largo: estación 1.

### H06 · Pintores y alcancías (`gp-c06-h06-alcancias`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (16):** «La junta quiere abrir antes y pregunta: "¿Y si ponemos más pintores?".
  Un pintor tarda 8 días.»
- **Rol (10):** «Diriges el proyecto y respondes a la junta con datos.»
- **Etapa 1 · Predecir y revelar. Consigna (8):** «Apuesta cuántos días tardan con más
  pintores.»
  - **Visual:** pared de ladrillo del local ilustrada (Gemini) y hámsters con casco y
    rodillo. Un deslizador «Pintores: 1 · 2 · 4 · 8». El estudiante apuesta (opciones
    grandes) y luego la animación muestra a los hámsters pintando: con 8, chocan entre
    ellos, se pasan la escalera y esperan turno. Un cartel de obra ilustrado muestra los
    días (número a mano).
  - **Datos del escenario (criterio de Gen; la guía da la regla, no las cifras):** 1 → 8
    días · 2 → 4,5 · 4 → 3 · 8 → 3,5.

| Apuesta | Opciones | Clave | Retro si se equivoca |
|---|---|---|---|
| 1 · «Con 2 pintores…» | 4 días · 4,5 días · 8 días | 4,5 días | «Duplicar no reduce a la mitad: hay coordinación y riesgo.» |
| 2 · «Con 8 pintores…» | 1 día · 3,5 días · 2 días | 3,5 días | «Demasiados recursos pueden alargar la duración: más coordinación.» |
| 3 · «Pasar de 4 a 8 pintores…» | Ahorra mucho · Ya no ahorra | Ya no ahorra | «Rendimientos decrecientes: cada pintor extra aporta menos.» |

  - **Micro:** Consigna (5): «¿Cómo se llama cada conducta?» Dos tarjetas a dos nombres:
    «El equipo tenía 10 días y usó los 10, aunque bastaban 7.» → **Ley de Parkinson**
    (retro: «El trabajo se expandió hasta llenar el tiempo disponible.» (9)) · «Nadie
    empezó hasta la víspera de la entrega.» → **Síndrome del estudiante** (retro:
    «Dejar todo para el último momento: síndrome del estudiante.» (9)).
- **Etapa 2 · Consigna (7):** «Lleva cada riesgo a la alcancía que lo cubre.»
  - **Visual:** dos **alcancías** ilustradas (Gemini). **Contingencia**, dentro de una
    caja rotulada «Línea base del cronograma» (riesgos conocidos). **Gestión**, fuera de
    la caja, en manos de la panda (lo no previsto). Al acertar, la tarjeta entra por la
    ranura como una moneda.

| Situación | Alcancía ✓ | Retro si se equivoca |
|---|---|---|
| «Ya sabemos que la alcaldía puede demorar el permiso.» | Contingencia | «Riesgo identificado y aceptado: reserva para contingencias.» |
| «Las lluvias de octubre pueden frenar la fachada.» | Contingencia | «Es un conocido-desconocido: va en la contingencia.» |
| «Algo que hoy nadie imagina puede retrasar la obra.» | Gestión | «Lo desconocido-desconocido lo cubre la reserva de gestión.» |
| «Un trabajo no previsto dentro del alcance aparece al final.» | Gestión | «Trabajo no previsto: reserva de gestión, fuera de la línea base.» |

  - **Micro (cálculo):** Contexto (13): «La reserva para contingencias del permiso es el
    25 % de 8 días.» Consigna (5): «¿Cuántos días de reserva son?» → **2**. Retro: «8 ×
    0,25 = 2 días.» (6)
  - **Micro:** Consigna (8): «¿Qué reserva queda dentro de la línea base?» →
    **Contingencia** / Gestión. Retro: «La de gestión queda fuera de la línea base del
    cronograma.» (11)
- **Subtema:** `gp06-reservas`. Celular: la pared arriba (≥ 45 % del alto), opciones en
  una columna debajo; el deslizador con números escritos.

### H07 · El metro de la ruta crítica (`gp-c06-h07-metro`, Difícil, 50 × 3 = 150 FP × %)
Taller numérico del capítulo con la red de la tienda (§0).
- **Contexto (15):** «La junta quiere saber cuándo abre Cartagena y qué actividades no
  pueden retrasarse ni un día.»
- **Rol (9):** «Diriges el proyecto y calculas la ruta crítica.»
- **Visual común:** **mapa de metro** ilustrado (Gemini como fondo y estaciones; líneas y
  números a mano encima): cada actividad es una estación (nodo) con su letra, nombre
  corto y duración; cada ruta es una línea de metro de color **y número** (Línea 1 a 4).
  Salida «Inicio» y llegada «Inauguración». El zorro y la panda miran el mapa en un
  andén. Nota fija: «El día 0 es el inicio».
- **Etapa 1 · Consigna (7):** «Suma cada línea y encuentra la más larga.»
  - El estudiante toca cada línea; las estaciones se iluminan y escribe la suma.

| Línea | Estaciones | Suma ✓ | Retro si se equivoca |
|---|---|---|---|
| 1 | A–C–D–F–I | 23 | «3 + 8 + 10 + 2 + 0 = 23.» |
| 2 | A–B–D–F–I | 20 | «3 + 5 + 10 + 2 + 0 = 20.» |
| 3 | A–B–E–F–I | 16 | «3 + 5 + 6 + 2 + 0 = 16.» |
| 4 | A–G–H–I | 14 | «3 + 7 + 4 + 0 = 14.» |

  - Luego: Consigna (5): «¿Cuál es la ruta crítica?» → **Línea 1 (A–C–D–F–I)**. Retro si
    elige otra: «La ruta crítica es la más larga: 23 días.» (9). Revelar: la Línea 1 se
    vuelve gruesa y aparece «Inauguración: día 23».
- **Etapa 2 · Recorrido hacia adelante. Consigna (8):** «Completa el inicio y el fin
  tempranos de cada estación.»
  - Ejemplo resuelto que se desvanece: A, B, C y G ya vienen llenos (ES y EF a la vista,
    con la regla «EF = ES + duración»). El estudiante llena D, E, F, H e I.

| Estación | ES ✓ | EF ✓ | Retro si se equivoca |
|---|---|---|---|
| D | 11 | 21 | «D espera a B (8) y a C (11): empieza en el mayor, 11.» |
| E | 8 | 14 | «E solo espera a B, que termina en 8: 8 + 6 = 14.» |
| F | 21 | 23 | «F espera a D (21) y E (14): empieza en 21.» |
| H | 10 | 14 | «H sigue a G, que termina en 10: 10 + 4 = 14.» |
| I | 23 | 23 | «Espera a F (23) y H (14); un hito dura 0: 23.» |

- **Etapa 3 · Recorrido hacia atrás y holguras. Consigna (8):** «Calcula el inicio tardío
  y la holgura total.»
  - Se empieza desde I (LF = 23) con la regla «LS = LF − duración». Las estaciones de la
    ruta crítica vienen llenas (holgura 0); el estudiante llena B, E y G.

| Estación | LF ✓ | LS ✓ | Holgura total ✓ | Retro si se equivoca |
|---|---|---|---|---|
| E | 21 | 15 | 7 | «F empieza en 21: LS = 21 − 6 = 15; holgura = 7.» |
| B | 11 | 6 | 3 | «B debe acabar antes de D (11) y E (15): el menor, 11.» |
| G | 19 | 12 | 9 | «G debe acabar cuando empieza H tarde (19): 19 − 7 = 12.» |

  - **Micro final (holgura libre):** Consigna (8): «¿Cuánto puede demorarse G sin mover a
    H?» → **0 días** / 9 días. Retro: «H empieza en 10, justo cuando G termina: holgura
    libre 0.» (11). Revelar: G tiene holgura total 9, pero si se demora, H se mueve.
- **Puntaje:** aciertos al primer intento / 14 (4 sumas + 1 ruta + 5 estaciones hacia
  adelante + 3 hacia atrás + 1 micro); una estación cuenta solo si todas sus casillas están bien.
- **Subtema:** `gp06-ruta-critica`. Celular: el mapa se muestra línea por línea en la
  etapa 1 y estación por estación en las etapas 2 y 3 (la estación activa en grande, sus
  predecesoras y sucesoras como miniaturas con sus números); el mapa completo, en un botón
  «Ver mapa». Casillas numéricas ≥ 48 px.

### H08 · Fichas de dominó (`gp-c06-h08-domino`, Difícil, 50 FP × %)
- **Contexto (15):** «Ya conoces la ruta crítica y las holguras. Ahora llegan los
  retrasos de verdad, uno por día.»
- **Rol (10):** «Diriges el proyecto y avisas a la junta si se mueve la inauguración.»
- **Consigna (8):** «Apuesta: ¿se mueve la inauguración? ¿Cuántos días?»
- **Visual:** la red de la tienda como **fila de fichas de dominó** ilustradas (Gemini),
  una ficha por actividad, con su letra, duración y holgura total escrita. La ficha
  retrasada se inclina; el estudiante apuesta (botones «No se mueve» · «Se mueve __ días»
  con selector 1–5) y, al revelar, las fichas siguientes caen o no; la última ficha
  «Inauguración» muestra el día nuevo. Además, en algunos retrasos se pregunta qué ficha
  vecina se mueve.
- **Retrasos (6, en orden; cada uno parte de la red original):**

| Retraso | Clave | Retro si se equivoca |
|---|---|---|
| 1 · «G (contratar) se demora 5 días.» | No se mueve (día 23) | «G tiene 9 de holgura total: 5 no alcanzan a mover el fin.» |
| 1b · «¿Y la capacitación (H)?» | Sí, empieza 5 días después | «G tiene holgura libre 0: su sucesora H se corre.» |
| 2 · «C (permiso) se demora 2 días.» | Se mueve 2 (día 25) | «C es crítica, holgura 0: todo el retraso pasa al fin.» |
| 3 · «E (máquinas) se demora 8 días.» | Se mueve 1 (día 24) | «E tiene 7 de holgura: 8 − 7 = 1 día de retraso.» |
| 4 · «B (diseño) se demora 2 días.» | No se mueve | «B tiene 3 de holgura total: 2 no mueven el fin.» |
| 4b · «¿Qué sucesora de B se corre?» | E (máquinas) | «D espera al permiso hasta el 11; E sí arranca más tarde.» |
| 5 · «B (diseño) se demora 4 días.» | Se mueve 1 (día 24) | «Holgura 3, retraso 4: el fin se corre 4 − 3 = 1.» |
| 6 · «H (capacitar) se demora 9 días.» | No se mueve | «Usa toda su holgura de 9: H se vuelve crítica.» |

- **Cierre (14):** «La holgura total protege el fin; la libre protege a la siguiente actividad.»
- **Subtema:** `gp06-ruta-critica`. Celular: las fichas en dos filas que siguen el orden de
  la red; la ficha retrasada siempre en el centro y más grande.

### H09 · La pista de relevos (`gp-c06-h09-relevos`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (15):** «La patrocinadora quiere inaugurar el día 20, no el 23. El alcance no
  se puede recortar.»
- **Rol (10):** «Diriges el proyecto y buscas los tres días al menor costo.»
- **Visual común:** **pista de atletismo** ilustrada (Gemini) con cuatro carriles (las
  cuatro rutas de la red); en cada carril corren hámsters con casco, uno por actividad,
  pasándose el testigo. El carril 1 (ruta crítica) llega último a la meta «Día 23». Un
  marcador a mano muestra los días de cada carril y el costo extra acumulado.
- **Etapa 1 · Intensificación. Consigna (11):** «Compra los días que faltan: elige qué
  actividad acelerar y cuánto.»
  - Tabla de compra en pantalla (cifras del escenario):

| Actividad | ¿Crítica? | Costo por día ganado | Máximo de días |
|---|---|---|---|
| C · Permiso (trámite prioritario pagado) | Sí | $2,0 millones | 2 |
| D · Adecuar (otra cuadrilla) | Sí | $1,2 millones | 3 |
| F · Instalar (técnico adicional) | Sí | $0,8 millones | 1 |
| E · Máquinas (envío urgente) | No (holgura 7) | $0,3 millones | 3 |
| G · Contratar (agencia) | No (holgura 9) | $0,2 millones | 2 |

  - El estudiante compra día por día; en cada compra el carril se acorta y el marcador
    suma el costo. Clave: **F 1 día ($0,8 M) + D 2 días ($2,4 M) = $3,2 millones**; el
    carril 1 llega en 20 y el carril 2 (A–B–D–F) en 17, sin volverse más largo.
  - Retros por decisión:
    - Compra en E o G: «Esa actividad no está en la ruta crítica: no adelanta la
      inauguración.» (12) — el carril se acorta, pero la meta sigue en 23.
    - Compra C antes que D: «Funciona, pero cuesta más: D da el día a $1,2 millones.» (11)
    - Compra D 3 días en vez de F 1 + D 2: «Llegas a 20, pero F era más barata: $3,6
      millones.» (10)
  - **Micro:** Consigna (6): «¿Cuánto costó lo más barato posible?» → **$3,2 millones**.
    Retro: «0,8 + 1,2 + 1,2 = 3,2 millones.» (8)
- **Etapa 2 · Ejecución rápida. Consigna (8):** «¿Dónde se puede solapar el relevo sin
  romper reglas?»
  - **Visual:** zona de relevo de la pista: dos corredores corren juntos un tramo (la
    sucesora empieza antes de que termine la predecesora). Si el testigo se cae, se ve
    el riesgo de retrabajo.
  - Tres propuestas de solape (se vuelve al día 23 sin intensificación):

| Propuesta | Clave | Retro si se equivoca |
|---|---|---|
| «Empezar la obra (D) antes de recibir el permiso (C).» | No se puede | «El permiso es una dependencia obligatoria legal: no se solapa.» |
| «Instalar las máquinas (F) en la barra ya lista, 2 días antes de terminar la obra.» | Sí: abre el día 21 | «D–F se vuelve FS − 2: la ruta crítica baja a 21.» |
| «Empezar a contratar (G) antes de firmar el arriendo.» | No sirve | «G no es crítica: solaparla no adelanta la inauguración.» |

  En la propuesta 2, la PMO aclara en un globo que el orden D → F es una buena práctica
  (dependencia discrecional), no una obligación: por eso se puede solapar (**criterio de
  Gen** para el escenario).
  - **Micro final:** Consigna (5): «¿Qué sube con cada técnica?» Dos tarjetas a dos
    cajas: Intensificación → **Costo**; Ejecución rápida → **Riesgo y retrabajo**. Retro:
    «Intensificar suma recursos y costo; solapar suma riesgo de retrabajo.» (10)
- **Subtema:** `gp06-compresion`. Celular: la pista se muestra en vertical (carriles como
  columnas); la tabla de compra como cinco tarjetas con botón «+1 día».

### H10 · La torre de bloques (`gp-c06-h10-bloques`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (16):** «El gerente funcional te presta un solo electricista, 8 horas al día.
  Dos actividades lo necesitan a la vez.»
- **Rol (11):** «Diriges el proyecto y repartes las horas del electricista sin sobrecargarlo.»
- **Visual común:** histograma hecho con **bloques de madera** ilustrados (Gemini): una
  columna por día (días 11 a 17), cada bloque = 8 h de una actividad (con su nombre). Una
  cinta horizontal marca la capacidad «8 h». El gato (Gerente funcional) está junto a la
  torre; el electricista no es mascota: es un casco con su nombre de rol «Electricista».
  - Actividades (dentro de la adecuación): **Instalar luces**, días 11–13 (3 días, 8 h/día)
    y **Conectar el aviso luminoso**, días 12–13 (2 días, 8 h/día).
- **Etapa 1 · Caso A (el aviso tiene 4 días de holgura). Consigna (8):** «Mueve los bloques
  para no pasar de 8 horas.»
  1. Primero, Consigna (8): «¿Cuántas horas tiene el electricista el día 12?» → **16**.
     Retro: «Luces 8 h + aviso 8 h = 16 h: el doble de su capacidad.» (15)
  2. El estudiante arrastra los bloques del aviso a los días 14–15. Clave: cualquier
     posición dentro de su holgura (días 14 a 17) sin superar 8 h. Retro si los pone
     encima de otro bloque: «Ese día también pasaría de 8 horas.» (7)
  3. Consigna (4): «¿Se movió la inauguración?» → **No** / Sí. Retro: «El aviso se movió
     dentro de su holgura: el fin no cambia.» (12)
  4. Consigna (6): «¿Cómo se llama lo que hiciste?» → **Estabilización de recursos** /
     Nivelación de recursos. Retro: «Mover solo dentro de la holgura, sin tocar el fin,
     es estabilización.» (12)
- **Etapa 2 · Caso B (las dos actividades son críticas, holgura 0). Consigna (8):**
  «Resuelve la sobrecarga y mira qué pasa con el fin.»
  1. El estudiante mueve el aviso a los días 14–15 (no hay otra forma con un solo
     electricista). Revelar: la barra de la inauguración se corre.
  2. Consigna (6): «¿Cuántos días se corre la inauguración?» → **2**. Retro: «El aviso
     terminaba en 13 y ahora en 15: 2 días más.» (12)
  3. Consigna (5): «¿Cómo se llama esta técnica?» → **Nivelación de recursos** /
     Estabilización. Retro: «Ajustar fechas por el recurso, aunque se mueva el fin, es
     nivelación.» (12)
  4. Consigna (7): «¿Puede cambiar la ruta crítica al nivelar?» → **Sí** / No. Retro: «La
     nivelación a menudo cambia la ruta crítica original.» (9)
- **Subtema:** `gp06-recursos`. Celular: 7 columnas de 40 px a 320 px; el bloque activo se
  arrastra o se mueve con ◀ ▶; la cinta de 8 h lleva el número escrito.

### H11 · El rotafolio del lunes (`gp-c06-h11-rotafolio`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (14):** «Semana 3 de obra. El informe del lunes trae retrasos y la gráfica del
  equipo de mercadeo.»
- **Rol (10):** «Diriges el proyecto y decides qué se atiende primero.»
- **Visual común:** **rotafolio** (papelógrafo con trípode) ilustrado (Gemini) en la sala
  de reuniones; cada hoja se pasa con un gesto de arrastre hacia arriba. El hámster
  presenta; la panda escucha.
- **Etapa 1 · Consigna (7):** «¿Cuál de los dos retrasos atiendes ya?» (4 pares, red de §0)

| Par | Clave | Retro si elige el otro |
|---|---|---|
| «D (crítica) va 1 día atrasada» / «G (holgura 9) va 5 días atrasada» | D | «Un retraso pequeño en la ruta crítica pesa más que uno grande con holgura.» |
| «E (holgura 7) va 3 días atrasada» / «C (crítica) va 1 día atrasada» | C | «C no tiene holgura: ese día ya movió la inauguración.» |
| «H (holgura 9) va 2 días atrasada» / «B (holgura 3) va 3 días atrasada» | B | «B consumió toda su holgura: ya es crítica.» |
| «F (crítica) está a tiempo» / «E (holgura 7) va 6 días atrasada» | E | «E está a un día de volverse crítica: vigílala ya.» |

- **Etapa 2 · Gráfica de trabajo pendiente. Consigna (8):** «Lee la gráfica y pronostica
  cuándo termina la iteración.»
  - **Visual:** hoja del rotafolio con la gráfica a mano (datos exactos): eje X días 0–10
    de la iteración de la campaña; eje Y horas pendientes; línea ideal diagonal de 40 h
    a 0 h; línea real hasta el día 5, en 30 h. Línea de tendencia punteada que el
    estudiante prolonga arrastrando su punta hasta tocar el eje X.
  1. Consigna (9): «¿Cuántas horas deberían quedar hoy según la línea ideal?» → **20**.
     Retro: «Ideal: 4 h por día; tras 5 días, 40 − 20 = 20.» (13)
  2. Consigna (7): «¿A qué ritmo real va el equipo?» → **2 h por día**. Retro: «Hicieron 10
     h en 5 días: 2 h por día.» (10)
  3. Consigna (6): «Prolonga la tendencia: ¿qué día terminan?» → **Día 20**. Retro: «Quedan
     30 h a 2 h por día: 15 días más, día 20.» (13)
  4. Contexto (15): «La junta, al ver esto, quiere mover la fecha de inauguración en la línea
     base.» Consigna (6): «¿Cómo se mueve la línea base?» → **Solicitud de cambio al
     control integrado** / La edito yo hoy. Retro: «La línea base del cronograma solo
     cambia con cambios aprobados en el control integrado.» (14)
- **Subtema:** `gp06-controlar`. Celular: la gráfica ocupa el ancho completo (≥ 280 px de
  alto); la punta de la tendencia es un tirador de 48 px.

### H12 · El rollo del practicante (`gp-c06-h12-plotter`, Difícil, 50 FP × %)
Repaso que ataca las confusiones de la ficha.
- **Contexto (15):** «El practicante imprimió el cronograma de la tienda para la junta.
  Tiene errores escondidos entre datos correctos.»
- **Rol (9):** «Diriges el proyecto y lo revisas antes de la junta.»
- **Consigna (6):** «Toca las líneas con error y corrígelas.»
- **Visual:** **rollo de papel de plotter** ilustrado (Gemini) desenrollado sobre la mesa,
  con un Gantt impreso; cada línea tocable es una nota al margen. El hurón (Practicante)
  espera al lado. Tocar una línea abre dos correcciones; si la línea estaba bien, se
  marca «Correcta» con ✓.
- **Partida:** 7 líneas de las 10 (5 con error y 2 correctas).

| Línea | ¿Error? | Corrección ✓ | Retro |
|---|---|---|---|
| «Hito "Inauguración": duración 2 días.» | Sí | Duración 0 | «Los hitos son un punto: duración cero.» |
| «Ruta crítica: A–B–D–F (20 días).» | Sí | A–C–D–F (23 días) | «La crítica es la más larga: 23 días.» |
| «Para abrir antes: intensificar G (contratar).» | Sí | Intensificar una actividad crítica | «G tiene holgura: acelerarla no adelanta la inauguración.» |
| «Pintar: 8 días, incluidos 3 de secado.» | Sí | 5 días + retraso de 3 | «La duración no incluye retrasos: el secado va aparte.» |
| «Ejecución rápida: empezar la obra antes del permiso.» | Sí | Solapar D y F | «El permiso es obligatorio por ley: no se puede solapar.» |
| «La fecha de fin se movió sin aprobación.» | Sí | Pedir el cambio al control integrado | «La línea base solo cambia por control formal de cambios.» |
| «Monte Carlo: 10 % de probabilidad de abrir el día 21; "es casi seguro".» | Sí | Es poco probable | «Un 10 % de probabilidad significa que es poco probable.» |
| «A no tiene predecesora: es la primera actividad.» | No | — | «Correcto: solo la primera y la última no tienen ambas.» |
| «Reserva para contingencias de 2 días dentro de la línea base.» | No | — | «Correcto: la contingencia va dentro de la línea base.» |
| «Para la junta: diagrama de hitos con las fechas clave.» | No | — | «Correcto: el diagrama de hitos resume entregables y fechas clave.» |

  Retro si toca una línea correcta como error: la de la columna «Retro» de esa línea.
  Retro si deja pasar un error: la de esa línea, al final, en el resumen.
- **Puntaje:** aciertos (detectar + corregir) al primer intento / 7.
- **Subtemas:** `gp06-actividades` (hito), `gp06-ruta-critica` (ruta), `gp06-compresion`
  (intensificar, solapar), `gp06-adelantos` (secado), `gp06-cronograma` (línea base,
  Monte Carlo, representación, reserva).

---

## 3. Objetos para Gemini (paso 6), por pieza

Pedir con la guía de estilo (contorno, paleta Planck, sin texto en la imagen; el texto lo
pone la interfaz). Fondo liso para recortar. Ninguno repite los de c1-c2 §3 ni c05 §3.

H01 archivador de fuelle con 7 pestañas, semáforo de tránsito · H02 caja de paquete que se
abre, tres bandejas de cartón con ícono, túnel, linterna grande, piedras y bultos · H03
dos piezas de rompecabezas grandes, cuatro conectores, mesa de trabajo con cuatro cajones,
edificio pequeño de alcaldía · H04 cinta métrica de sastre · H05 sumadora de manivela con
rollo de papel · H06 pared de ladrillo, rodillos, escalera, cartel de obra, dos
alcancías, caja «línea base» · H07 mapa de metro (fondo y estaciones), andén · H08 fichas
de dominó grandes · H09 pista de atletismo de cuatro carriles, testigo de relevos · H10
bloques de madera, cinta de capacidad, casco de electricista · H11 rotafolio con trípode,
sala de reuniones · H12 rollo de papel de plotter desenrollado.

Situaciones de mascotas nuevas (chat «Chibi Fox Model Sheet»): perro PMO sosteniendo un
archivador de fuelle · zorro con linterna en un túnel · hámsters con rodillo pintando,
chocando entre ellos · hámsters corriendo con un testigo · gato gerente funcional junto a
una torre de bloques · hámster presentando en un rotafolio · panda con una alcancía ·
hurón junto a un rollo de papel.

## 4. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Todo concepto rastreable a la ficha (pp. 173–231). Cifras del escenario declaradas. Claves no explícitas marcadas «criterio de Gen»: H03 (discrecional externa), H05 (beta aplicada a duración), H06 (cifras de pintores), H09 (D → F discrecional). La red de §0 se calculó y comprobó dos veces. Sin clichés. |
| D1 Cobertura | Avanzado | Los 13 subtemas `gp06-…` tienen al menos una pieza; los 6 procesos, al menos una. |
| D2 Nivel cognitivo | Avanzado | Reconocer (H01–H03), aplicar y calcular (H04–H07, H10), analizar y decidir con números (H08, H09, H11), evaluar (H12). |
| D3 Retroalimentación | Avanzado | Retro específica por ítem; en los cálculos la retro muestra la operación con los números del ítem. |
| D4 Interacción con sentido | Avanzado | El dominó cae solo hasta donde llega la holgura; el carril se acorta pero la meta no se mueve si la actividad no es crítica; la torre muestra las 16 h contra la cinta de 8 h. |
| D5 Marca | Avanzado | Tokens Planck; coral solo error; semáforo con forma y texto, no solo color. |
| D6 Sin plantillas | Avanzado | Ninguna retro genérica. |
| D7 Celular | Avanzado (a medir) | Adaptación a 320 px escrita en H03, H04, H06, H07, H08, H09, H10, H11; casillas numéricas ≥ 48 px. |
| D8 Rejugabilidad | Medio–Avanzado | Bancos mayores que la partida en H01 (etapa 2: 5→4), H03 (5→4), H12 (10→7); en H07–H09 la red es fija a propósito (los números se encadenan). Variante para segundo intento: **criterio de Gen**, una red B con otras duraciones (pendiente; no bloquea). |
| D9 Gancho visual | Avanzado | 12 objetos protagonistas distintos, sin repetir c1-c2 ni c05 (§3). |
| D11 Consistencia | Avanzado | Una sola red y un solo proyecto (tienda de Cartagena) en las 12 piezas. |
| D13 Consigna | Avanzado | Verbos de acción, ≤ 12 palabras en todas. |

## 5. Conteo de palabras (consignas ≤ 12)
H01 8 / 7 · 5 · H02 7 / 6, 6 · 8 / 4 · H03 7 / 9, 3 · 7 · H04 8 / 6, 5 · H05 6 / 8 · 7 / 9 ·
H06 8 / 5 · 7 / 5, 8 · H07 7 / 5 · 8 · 8 / 8 · H08 8 · H09 11 / 6 · 8 / 5 ·
H10 8 / 8, 4, 6 · 8 / 6, 5, 7 · H11 7 · 8 / 9, 7, 6, 6 · H12 6. Contextos ≤ 17; roles ≤ 11;
retros ≤ 15 (los signos +, −, =, ÷ cuentan como palabra). Conteo hecho con script sobre
este archivo (cada «…» etiquetado con su número real).

## 6. Conexión con Jane

Misma regla de los dos pasos de `../conexion-jane.md`: el Aprender deja entendido; el
Hacer del mismo día lo ejercita con la misma tienda, la misma red y los mismos personajes.

| Aprender (Jane) | Qué deja entendido | Situación que el Hacer retoma | Hacer (Gen) |
|---|---|---|---|
| `gp-c06-a01` Del plan a la lista de actividades | método, herramienta y modelo; qué decide el plan del cronograma; paquete → actividades; hitos; planificación gradual | el plan que pide la PMO; la EDT de la tienda | `gp-c06-h01-semaforo`, `gp-c06-h02-linterna` |
| `gp-c06-a02` Cómo se conectan las actividades | FS, SS, FF, SF; dependencias; adelantos y retrasos; **simulador: el diagrama de red** de la tienda que se arma pieza por pieza | la red A–I de §0 | `gp-c06-h03-rompecabezas`, `gp-c06-h04-cinta` |
| `gp-c06-a03` ¿Cuánto dura? | cuatro técnicas de estimación; rendimientos decrecientes; reservas | duraciones de D, C y G; los pintores de la junta | `gp-c06-h05-sumadora`, `gp-c06-h06-alcancias` |
| `gp-c06-a04` La ruta crítica | recorrido adelante y atrás; holgura total y libre; **simulador: el cálculo paso a paso** sobre la misma red | la pregunta de la junta: ¿cuándo abre? | `gp-c06-h07-metro`, `gp-c06-h08-domino` |
| `gp-c06-a05` Acortar y repartir | intensificación vs. ejecución rápida (gráfico 6-19); nivelación vs. estabilización (gráfico 6-17) | abrir el día 20; un solo electricista | `gp-c06-h09-relevos`, `gp-c06-h10-bloques` |
| `gp-c06-a06` El cronograma y su control | línea base, Gantt, hitos, red; Monte Carlo; variación, tendencias, gráfica de pendientes | el informe del lunes; el rollo del practicante | `gp-c06-h11-rotafolio`, `gp-c06-h12-plotter` |

- **Documentos como objetos:** el diagrama de red y el cronograma (Gantt) que Jane muestre
  como simulador deben usar exactamente la red de §0 (A–I, duraciones, día 0), para que
  H07, H08, H09, H11 y H12 «sigan el mismo papel». Se propone que el componente común
  `DocumentoPM` tenga las variantes `red-cronograma` y `gantt`, alimentadas por un único
  archivo de datos de la red.
