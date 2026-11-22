# T1 · Demanda agregada — plan y especificación completa (Gen, 2026-11-22)

Fuente única: `fichas/1-demanda-agregada.md` (diap. del profesor citadas como «d.»).
Tema id: `demanda-agregada` (se conserva el id de tema; las piezas son todas nuevas,
con ids que empiezan por `da26-` para que ninguno choque con un id retirado).

## 0. Reglas que valen para las 12 piezas (el constructor las aplica a todas)

- **Una idea por pantalla.** Aprender: ≤ 20 palabras de lectura por pantalla (conteo en §4).
  Hacer: ≤ 12 palabras por consigna. Retroalimentación ≤ 15 palabras, siempre la escrita aquí.
- **Figura primero (B1):** a 320 px la figura o el control empieza en los primeros 280 px
  de la tarjeta. Toda figura lleva `data-figura`.
- **Colores con significado, iguales en las 12 piezas** (codificación dual, D11), tomados
  de los tokens Planck, nunca coral: **C** consumo, **I** inversión, **G** gasto público,
  **XN** exportaciones netas: cuatro tonos distintos y distinguibles en daltonismo
  (el constructor los elige de `src/styles/planck.css`, los mide a 3:1 contra el fondo
  y los fija en un solo módulo `colores-da.js` que usan todas las piezas). Cada componente
  lleva además su letra: el color nunca es la única señal.
  **Coral solo para error.** El acierto se marca con ✓ y borde en `--ink`, no en verde.
- **Movimiento:** curva `cubic-bezier(.3,.9,.4,1)`, 280 ms, solo `transform` y `opacity`,
  nada en bucle. Con `prefers-reduced-motion`: los cambios ocurren sin desplazamiento
  (aparecen en su sitio con un fundido de 120 ms) y las gráficas saltan al estado final.
- **Deslizadores:** ancho completo, pulgar ≥ 44 × 44 px, valor visible encima del pulgar
  en Geist Mono `tabular-nums`, operables con teclado (flechas = 1 paso). Se usan
  `<input type="range">` nativos con estilo (Baseline amplio).
- **Arrastrar:** siempre con alternativa de tocar-tocar (toca la ficha, toca el destino) y
  con teclado. Pointer Events, nunca solo eventos de ratón.
- **Gráficas:** SVG con `viewBox`, que escala al ancho; rótulos ≥ 12 px a 320 px.
  A 320 px la gráfica mide el ancho de la tarjeta y alto 220 px; a 375 px, 250 px.
- **Celular:** nada se desborda a 320 px con el texto más largo real de cada pieza;
  las fórmulas largas se parten en dos renglones en el `+` (nunca dentro de un paréntesis).
- **Hacer:** opciones e ítems en orden aleatorio en cada intento; sorteo del banco por
  partida; cada ítem guarda su `subtema` (ids de la ficha) para el panel docente.
  FP una sola vez por estudiante.
- **Personajes:** «El empresario» (H4) y «La analista» (H5). Nombres por posición, sin opinión.
- **Sin clichés de gamificación:** ni trofeos, ni coronas, ni cofres, ni gemas, ni confeti.
  Cierre de pieza: la pantalla de resumen común del sitio.
- **Modelo numérico común** (lo usan A5, A6 y H6; un solo módulo `modelo-da.js`):
  C̄ = 100, c = 0,8, t = 0,25, TR = 50, Ī = 200, b = 10, i = 8 (%), G = 200, XN = 50.
  Ā = C̄ + c·TR + Ī + G + XN = 590. Ā − b·i = 510. Multiplicador = 1/[1 − c(1 − t)] = 2,5.
  Y₀ = 1.275. Pendiente de la DA = c(1 − t) = 0,6. Las cifras se muestran redondeadas
  a entero (Y, DA) o a un decimal (multiplicador), con coma decimal.

## 1. Plan del tema (orden en el camino)

| # | id | Tipo | Nombre | Mecánica | Subtemas | Dific. | FP |
|---|---|---|---|---|---|---|---|
| 1 | da26-a1-carrito | Aprender | El carrito de la economía | Construir tocando (cada mano echa su componente) | da-componentes | — | 0 |
| 2 | da26-h1-llena-carrito | Hacer | Llena el carrito | Arrastrar y clasificar | da-componentes, da-exportaciones-netas | Fácil | 10 × % |
| 3 | da26-a2-vaso-renta | Aprender | El vaso de la renta | Simulador con controles | da-consumo | — | 0 |
| 4 | da26-a3-columpio-tasa | Aprender | El columpio de la tasa | Simulador con controles | da-inversion | — | 0 |
| 5 | da26-a4-no-miran-renta | Aprender | Los que no miran la renta | Simulador con controles | da-gasto-publico, da-exportaciones-netas | — | 0 |
| 6 | da26-h4-empresario | Hacer | Lo que oyó el empresario | Construir cadena causal (microdesafíos) | da-caso-empresario y los de cada cadena | Difícil | 50 × % |
| 7 | da26-a5-bisagra-ascensor | Aprender | Bisagra y ascensor | Simulador de la gráfica + predecir | da-grafica, da-ecuacion-completa | — | 0 |
| 8 | da26-h3-gira-o-sube | Hacer | ¿Gira o sube? | Predecir y revelar (mover la recta) | da-grafica | Medio | 25 × % |
| 9 | da26-a6-eco-multiplicador | Aprender | El eco del multiplicador | Predecir y revelar + simulador | da-multiplicador | — | 0 |
| 10 | da26-h2-arma-formula | Hacer | Arma la fórmula | Construir (3 etapas) | da-consumo, da-inversion, da-multiplicador | Medio | 25 × 3 = 75 × % |
| 11 | da26-h5-libreta | Hacer | La libreta de la analista | Encontrar el error | da-multiplicador, da-grafica, da-exportaciones-netas, da-consumo, da-inversion, da-gasto-publico | Difícil | 50 × % |
| 12 | da26-h6-meta | Hacer | Lleva la economía a la meta | Simulador con meta (3 etapas) | da-multiplicador, da-grafica | Medio | 25 × 3 = 75 × % |

**Variedad:** 6 Hacer con 6 mecánicas distintas; ninguna tiene selección múltiple como
mecánica principal (regla: máx. 1 de cada 5). Todas evaluativas (miden desempeño).

**Respaldo en ciencia del aprendizaje:**
- Aprender con simuladores y una idea por pantalla: **carga cognitiva** (segmentación) y
  **principios multimedia de Mayer** (coherencia, señalización, contigüidad: el rótulo
  va pegado a la parte de la figura que nombra).
- A5 P5 y A6 P1 piden apostar antes de ver: **efecto de generación / predicción**
  (predecir antes de ver mejora la retención aunque se falle).
- Los Hacer son **práctica de recuperación** con retroalimentación inmediata y específica;
  H2 y H5 repiten los mismos conceptos con otra forma: **práctica intercalada**.
- H6 (meta con un solo instrumento): **aprendizaje por descubrimiento guiado** con
  pistas graduadas. Es criterio propio apoyado en literatura de simulaciones; lo digo.

**Lo que corrijo del material (avisar a Mateo, una línea):** la d. 11 rotula el
multiplicador como «pendiente». Aquí se enseña lo correcto: pendiente = c(1 − t),
multiplicador = 1/[1 − c(1 − t)] (A6 P5 y H5 página 1). Tampoco se usa la pregunta 2 ni
la 13 del Ejercicio 1, porque el modelo del profesor no da una respuesta única.

---

## 2. Especificación pieza por pieza

### A1 · El carrito de la economía (`da26-a1-carrito`, Aprender, sin FP)
**Gancho visual:** un carrito de mercado gigante que «es» la economía; cuatro manos
(familia, empresa, Gobierno, puerto) echan bloques de su color y el carrito sube de nivel.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Carrito vacío con rótulo «DA». Acción: tocar el carrito; se sacude (2 px, 280 ms) y aparecen cuatro manos alrededor. | «Toda la economía hace un solo mercado. Lo que compra junta es la demanda agregada.» |
| 2 | Cuatro manos con ícono: familia con bolsa (C), empresa con grúa (I), Gobierno con una vía (G), puerto con dos barcos (XN). Acción: tocar cada mano; echa un bloque de su color con su letra y su nombre (Consumo, Inversión, Gasto público, Exportaciones netas). Al cuarto, abajo se arma `DA = C + I + G + (X − M)`, cada letra en su color. «Siguiente» se habilita al tocar las cuatro. | «Toca cada mano y mira qué echa al carrito.» |
| 3 | Puerto: barco que sale (X) y barco que llega (M). Deslizador «Lo que vendemos afuera» 0–100 y «Lo que compramos afuera» 0–100 (inicio 60 y 40). El bloque XN = X − M crece o se encoge; si queda negativo, el bloque se dibuja bajo la línea del carrito con borde punteado y el carrito baja. | «Lo que vendemos afuera suma. Lo que compramos afuera resta. Neto: X − M.» |
| 4 | Carrito con los cuatro bloques apilados. Acción: arrastrar el borde superior de cualquier bloque para encogerlo; el nivel del carrito baja con él y el rótulo «DA» muestra el total. | «Cuatro manos, un carrito. Si una echa menos, la demanda agregada baja.» |

Celular: a 320 px las cuatro manos van en rejilla 2 × 2 sobre el carrito; el carrito ocupa
el ancho y 180 px de alto.

### H1 · Llena el carrito (`da26-h1-llena-carrito`, Hacer, Fácil, 10 FP × %)
**Consigna:** «Arrastra cada compra a la mano que la hace.» (9 palabras)
**Figura:** las cuatro manos de A1 como destinos (C, I, G, XN) alrededor del carrito.
Las fichas caen de una en una desde arriba (8 por partida, sorteadas de 10).
**Mecánica:** arrastrar (o tocar-tocar) la ficha a una mano. Acierto: la mano la agarra,
el bloque cae al carrito y el carrito sube; si es exportación el bloque XN crece, si es
importación el bloque XN se encoge (resta visible). Error: la ficha rebota, borde coral
300 ms, aparece la retroalimentación de ese destino, y la ficha vuelve para un segundo
intento (que ya no suma puntaje). Puntaje = aciertos al primer intento / 8.

| # | Ficha | Correcta | Si la lleva a… → retroalimentación |
|---|---|---|---|
| 1 | Una familia paga el mercado del mes | C | I: «La comida no amplía la capacidad de producir: la gasta un hogar.» · G: «Paga una familia, no el Estado.» · XN: «Se compra y se consume dentro del país.» |
| 2 | Una panadería compra un horno industrial | I | C: «Lo compra una empresa para producir más: eso es inversión.» · G: «Lo paga una empresa privada, no el Gobierno.» · XN: «El horno se queda produciendo aquí.» |
| 3 | El Gobierno construye un hospital en Tunja | G | C: «Lo paga el Estado, no un hogar.» · I: «En este modelo, I es inversión privada; esto lo paga el Gobierno.» · XN: «Es una obra pública dentro del país.» |
| 4 | Colombia vende café a Alemania | XN (suma) | C: «Lo compra alguien de afuera: es una exportación.» · I: «Nadie invierte aquí: un comprador extranjero compra café.» · G: «No lo paga el Gobierno: lo compra el exterior.» |
| 5 | Llegan carros importados de Corea | XN (resta) | C: «Es una compra al exterior: importación, resta en X − M.» · I: «Es una compra al exterior: va a XN, restando.» · G: «No la hace el Estado: es importación y resta.» |
| 6 | Una empresa amplía su bodega esperando vender más | I | C: «La bodega sirve para producir y vender más: inversión.» · G: «La paga la empresa, no el Estado.» · XN: «Es una obra dentro del país.» |
| 7 | El Gobierno paga los sueldos de los profesores públicos | G | C: «El pago lo hace el Estado: es su gasto.» · I: «No es una empresa ampliándose: es gasto del Gobierno.» · XN: «Es un pago dentro del país.» |
| 8 | Un hotel de Cartagena atiende turistas franceses | XN (suma) | C: «Quien paga vive afuera: es exportación de servicios.» · I: «El hotel no compra capital: vende un servicio al exterior.» · G: «No interviene el Gobierno: pagan turistas extranjeros.» |
| 9 | Un estudiante paga su plan de celular | C | I: «Es gasto de un hogar, no de una empresa.» · G: «Lo paga una persona, no el Estado.» · XN: «Es un servicio comprado dentro del país.» |
| 10 | Una constructora levanta una planta de cemento | I | C: «Es capital para producir: inversión privada.» · G: «Es privada: el Gobierno no la paga.» · XN: «La planta se queda aquí.» |

Subtema de cada ficha: `da-componentes`; las 4, 5 y 8 llevan además `da-exportaciones-netas`.
Celular: a 320 px las manos van en 2 × 2 debajo de la ficha que cae; cada mano ≥ 120 × 64 px.

### A2 · El vaso de la renta (`da26-a2-vaso-renta`, Aprender, sin FP)
**Gancho visual:** un grifo (renta Y) llena un vaso; un gotero del Gobierno añade (TR);
un desagüe se lleva un tajo (T = tY); lo que queda se reparte entre una taza
«consumo» y una alcancía «ahorro».

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Grifo con rótulo «Y» y vaso vacío. Acción: deslizador «Renta Y» 0–1.000 (inicio 500): el chorro y el nivel del vaso siguen al valor. | «Tu renta llega por un grifo: Y.» |
| 2 | Aparecen gotero «TR» y desagüe «T = tY». Acción: interruptor «Transferencias» (0 o 50) y deslizador «Tasa t» 0–40 % (inicio 25 %). El nivel del vaso cambia en vivo. | «El Gobierno añade gotas, las transferencias TR, y se lleva un tajo: T = tY.» |
| 3 | El vaso se rotula con la llave `Y + TR − T` y el valor en vivo. Acción: mover cualquiera de los tres controles; la cifra cambia. | «Lo que queda en el vaso es la renta disponible: Y + TR − T.» |
| 4 | El vaso se vierte en una taza «Consumo inducido» y una alcancía «Ahorro». Acción: deslizador «c» 0,50–0,95 (paso 0,05, inicio 0,80); la taza recibe la fracción c y la alcancía 1 − c (rótulo «s = 1 − c»). | «De cada peso disponible gastas una fracción c: la propensión marginal a consumir.» |
| 5 | Aparece una segunda taza pequeña «C̄» que no está bajo el grifo. Acción: llevar Y a 0: el vaso se vacía pero C̄ sigue llena. | «Con renta cero, igual comes: con préstamos, ahorros o ayudas. Eso es consumo autónomo, C̄.» |
| 6 | Se arma `C = C̄ + c(Y + TR − T)` debajo de la figura. Acción: tocar cada término; se resalta su parte del dibujo (C̄ la taza pequeña, c la división, el paréntesis el vaso). | «Todo junto: lo autónomo más lo inducido.» |

Celular: a 320 px grifo y vaso a la izquierda (60 %), tazas a la derecha; los controles
van debajo, en columna.

### A3 · El columpio de la tasa (`da26-a3-columpio-tasa`, Aprender, sin FP)
**Gancho visual:** un balancín: de un lado la tasa de interés, del otro una pila de
ladrillos (inversión). El largo del brazo es b.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Grúa levantando una planta. Acción: tocar la grúa; sube un ladrillo con «crédito» escrito. | «Las empresas invierten en máquinas, plantas e inventarios. Casi siempre con crédito.» |
| 2 | Balancín: lado izquierdo «i», lado derecho la pila «I». Acción: deslizador «Tasa i» 2–14 % (inicio 8). Al subir i, su lado sube y la pila baja. Debajo, `I = Ī − b·i` con los valores. | «Si el crédito sale más caro, se construye menos.» |
| 3 | Acción: deslizador «b» 5–20 (inicio 10); el brazo del lado de la pila se alarga. Botón «Sube la tasa 2 puntos» muestra la caída con el b actual. | «b mide cuánto cae la inversión por cada punto de tasa. Brazo largo, golpe fuerte.» |
| 4 | La pila tiene una base de otro tono rotulada «Ī». Botón «Llega incertidumbre»: entran nubes y la base se encoge aunque i no cambie; botón «Se despeja» la restaura. | «Hay inversión que no mira la tasa: depende de expectativas. Es la inversión autónoma, Ī.» |

### A4 · Los que no miran la renta (`da26-a4-no-miran-renta`, Aprender, sin FP)
**Gancho visual:** una etiqueta de precio colgada de un billete de dólar con «$ por US$»;
al subirla, los barcos de exportación salen en fila y los de importación se frenan.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Bloque G junto al grifo de renta de A2. Acción: deslizador «Renta Y»; el vaso cambia y el bloque G no se mueve. | «El Gobierno decide su gasto, G. No depende de la renta: es autónomo.» |
| 2 | Dos columnas: «Recauda» y «Gasta». Acción: deslizador «Gasta» 100–400 con «Recauda» fijo en 250; si gasta más, el hueco entre columnas se rellena con tramado rotulado «Déficit → deuda» (tramado gris, no coral: no es un error del estudiante). | «Puede gastar más de lo que recauda. La diferencia es déficit, y se cubre con deuda.» |
| 3 | Billete de dólar con etiqueta «$ 4.000». | «El tipo de cambio es cuántos pesos cuesta un dólar.» |
| 4 | Deslizador «Tipo de cambio» 3.500–5.000 (paso 100, inicio 4.000). Al subir, salen más barcos de exportación y llegan menos de importación; el bloque XN crece. Rótulo sobre el deslizador: a la derecha «el peso se deprecia», a la izquierda «el peso se aprecia». | «Si el dólar sube, lo nuestro sale barato afuera e importar sale caro.» |
| 5 | Mismo control llevado a la izquierda: menos exportaciones, más importaciones, XN se encoge. | «Si el dólar baja, el peso se aprecia: exportamos menos e importamos más.» |

Nota de fidelidad: el profesor dice XN = f(tc) sin dirección (ficha §11.3); la dirección
mostrada es la estándar y es la que él usa en la pregunta 11 del Ejercicio 1.

### H4 · Lo que oyó el empresario (`da26-h4-empresario`, Hacer, Difícil, 50 FP × %)
**Consigna:** «Arma la cadena: toca cada flecha para subirla o bajarla.» (10 palabras)
**Figura:** arriba, «El empresario» (silueta neutra con un periódico) y el titular que oyó;
debajo, tres eslabones en fila unidos por flechas; cada eslabón tiene un botón de flecha
que alterna ↑ / ↓ (empieza en «?»). Botón «Explicárselo» se activa con los tres puestos.
**Al revelar:** la cadena se enciende eslabón por eslabón como fichas de dominó (280 ms
cada uno); cada eslabón correcto queda con ✓; el errado tiembla en coral y muestra su
retroalimentación, y su flecha gira a la dirección correcta. Al final, un medidor «DA»
(barra horizontal) sube o baja según la cadena real.
**Partida:** 5 titulares sorteados de 7. Puntaje = eslabones correctos / 15.

| # | Titular (lo que oyó) | Eslabón 1 | Eslabón 2 | Eslabón 3 | Retro si yerra 1 · 2 · 3 | Subtemas |
|---|---|---|---|---|---|---|
| 1 | «El Banco de la República baja la tasa de interés.» | Tasa i ↓ | Inversión ↑ | DA ↑ | «El titular dice que la tasa baja.» · «Crédito más barato, más inversión.» · «Más inversión suma a la DA.» | da-inversion |
| 2 | «Reforma tributaria: sube el impuesto de renta a familias.» | Impuestos ↑ | Consumo ↓ | DA ↓ | «La reforma sube el impuesto.» · «Más impuesto, menos renta disponible para consumir.» · «Menos consumo resta a la DA.» | da-consumo |
| 3 | «Por el déficit, el Gobierno recorta el gasto social.» | Gasto público ↓ | DA ↓ | Producción Y₀ ↓ | «Recortar es gastar menos.» · «G suma directo a la DA.» · «Con menos DA, las empresas producen menos.» | da-gasto-publico |
| 4 | «El dólar baja: el peso se aprecia.» | Tipo de cambio ↓ | Exportaciones netas ↓ | DA ↓ | «Si el dólar baja, el tipo de cambio baja.» · «Peso fuerte: exportamos menos, importamos más.» · «Menos XN resta a la DA.» | da-exportaciones-netas |
| 5 | «Crece la incertidumbre política en el país.» | Inversión autónoma ↓ | DA ↓ | Producción Y₀ ↓ | «Con incertidumbre, las empresas frenan proyectos.» · «Menos inversión resta a la DA.» · «Menos DA, menos producción.» | da-inversion |
| 6 | «Las familias ahorran menos de cada peso extra.» | Propensión a consumir c ↑ | Consumo ↑ | DA ↑ | «Si s baja, c sube: s = 1 − c.» · «Más c, más consumo por peso.» · «Más consumo suma a la DA.» | da-consumo |
| 7 | «El Gobierno reduce los subsidios a las familias.» | Transferencias TR ↓ | Consumo ↓ | DA ↓ | «Subsidio menor es transferencia menor.» · «Menos TR, menos renta disponible para consumir.» · «Menos consumo resta a la DA.» | da-consumo |

Todos los ítems llevan además `da-caso-empresario`.
Celular: a 320 px los tres eslabones van en columna (flecha hacia abajo entre ellos),
cada botón de flecha 48 × 48 px.

### A5 · Bisagra y ascensor (`da26-a5-bisagra-ascensor`, Aprender, sin FP)
**Gancho visual:** la recta de DA dibujada como una regla metálica con una bisagra en
su arranque (gira) y montada en un ascensor (sube y baja). La recta inicial DA₀ queda
como fantasma punteado para comparar.
Gráfica: eje vertical «DA», horizontal «Y»; recta DA = (Ā − b·i) + c(1 − t)·Y con el
modelo común; Y de 0 a 2.000.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Recta DA₀. Acción: arrastrar un punto sobre la recta; se leen Y y DA. | «La demanda agregada crece con la renta. Esta recta lo muestra.» |
| 2 | Se marcan el arranque (rombo, rótulo «Ā − b·i») y la inclinación (ángulo, rótulo «c(1 − t)»). | «La recta tiene dos perillas: dónde arranca y qué tan empinada sube.» |
| 3 | Ascensor. Deslizadores «G» 100–400 y «Tasa i» 2–14 %. La recta se desplaza paralela; DA₀ queda fantasma. | «Ascensor: G, C̄, Ī, XN o la tasa i mueven la recta entera, paralela.» |
| 4 | Bisagra. Deslizadores «c» 0,50–0,95 y «t» 0–40 %. La recta gira sobre su arranque. | «Bisagra: c y t cambian la inclinación. La recta gira sobre su arranque.» |
| 5 | Predecir: antes de tocar, dos botones «Gira» / «Se desplaza» con la pregunta corta; tras elegir, se habilita el deslizador «Tasa i» y al moverlo la recta se desplaza. Retro: si eligió «Gira»: «No gira: i está en el arranque, Ā − b·i.»; si «Se desplaza»: «Eso: la tasa sube o baja la recta entera.» | «¿La tasa de interés gira la recta o la desplaza? Apuesta y muévela.» |
| 6 | Interruptor «Ver equilibrio»: aparece la recta de 45° (Y = DA) y el cruce marcado «Y₀». Deslizador «G»: el cruce y la marca Y₀ en el eje se mueven. | «La economía produce donde lo producido iguala lo demandado: Y = DA.» |

Nota de fidelidad: la d. 12 no dibuja la recta de 45°; se añade solo en la P6, detrás de
un interruptor, para mostrar Y₀ de la d. 11. No contradice nada del profesor.

### H3 · ¿Gira o sube? (`da26-h3-gira-o-sube`, Hacer, Medio, 25 FP × %)
**Consigna:** «Mueve la recta a donde crees que quedará.» (8 palabras)
**Figura:** la gráfica de A5 con DA₀ y dos asas: un rombo en el arranque (arrastre
vertical = desplazar) y un círculo en el extremo derecho (arrastre vertical = girar sobre
el arranque). Encima, la tarjeta con el suceso. Botón «Revelar».
**Al revelar:** la línea del estudiante queda punteada; la recta real se anima desde DA₀
a su lugar (desplazamiento o giro, 600 ms) y la marca Y₀ del eje se desliza. Se califican
dos cosas: tipo (desplaza / gira) y sentido (arriba o más empinada / abajo o más plana).
Si el estudiante no movió ninguna asa, «Revelar» está deshabilitado.
**Partida:** 6 sucesos sorteados de 8. Puntaje = criterios correctos / 12.

| # | Suceso | Correcto | Retro si yerra el tipo · el sentido |
|---|---|---|---|
| 1 | El Gobierno aumenta el gasto en vías. | Desplaza ↑ | «G es autónomo: mueve el arranque, no la inclinación.» · «Más gasto suma a la DA: la recta sube.» |
| 2 | El Banco de la República sube la tasa de interés. | Desplaza ↓ | «La tasa está en el arranque, Ā − b·i: desplaza.» · «Tasa más alta, menos inversión: la recta baja.» |
| 3 | Las familias consumen más de cada peso extra. | Gira, más empinada | «c cambia cuánto responde la DA a la renta: gira.» · «Más consumo por peso: la recta se empina.» |
| 4 | Sube la tasa del impuesto de renta, t. | Gira, más plana | «t está en la inclinación, c(1 − t): gira.» · «Más impuesto, menos renta disponible: se aplana.» |
| 5 | Crece la incertidumbre y cae la inversión autónoma. | Desplaza ↓ | «Ī es autónoma: desplaza la recta entera.» · «Menos inversión, menos DA: baja.» |
| 6 | El dólar sube y crecen las exportaciones netas. | Desplaza ↑ | «XN no depende de la renta: desplaza.» · «Más exportaciones netas, más DA: sube.» |
| 7 | Las familias ahorran una fracción mayor de cada peso. | Gira, más plana | «Ahorrar más es bajar c: cambia la inclinación.» · «Si s sube, c baja: la recta se aplana.» |
| 8 | El Gobierno reduce los subsidios a familias. | Desplaza ↓ | «TR entra en el arranque, vía c·TR: desplaza.» · «Menos subsidios, menos consumo: baja.» |

Subtema: `da-grafica` en todos; además 1 `da-gasto-publico`, 2 y 5 `da-inversion`,
3, 4, 7 y 8 `da-consumo`, 6 `da-exportaciones-netas`.
Celular: las asas tienen zona táctil de 48 px aunque el dibujo sea de 16 px; a 320 px la
tarjeta del suceso va arriba y la gráfica debajo, sin desplazar la página al arrastrar
(`touch-action: none` solo sobre las asas).

### A6 · El eco del multiplicador (`da26-a6-eco-multiplicador`, Aprender, sin FP)
**Gancho visual:** el gasto como un grito en un cañón: cada eco es un anillo más pequeño
(c(1 − t) del anterior) y una barra apila lo que suma cada eco.

| P | Figura y acción | Texto exacto |
|---|---|---|
| 1 | Una vía en obra con «+100» del Gobierno. Predecir: tres botones «Sube 100», «Sube más de 100», «Sube menos de 100». Retro: «Sube 100»: «Falta contar lo que gastan los que cobran.»; «Más de 100»: «Eso. Mira por qué.»; «Menos de 100»: «Al contrario: ese gasto se vuelve a gastar.». Luego se pasa a P2. | «El Gobierno gasta 100 en una vía. ¿Cuánto sube la producción?» |
| 2 | Anillos animados: 100, 60, 36, 21,6, 13,0, 7,8… cada uno con quién lo cobra (obreros, tienda, transportador…). La barra apilada llega a 250. Botón «Otro eco» avanza uno a uno; «Ver todos» completa. | «Los obreros cobran y gastan una parte. Quien les vende cobra y gasta otra parte.» |
| 3 | Junto a la barra aparece la fórmula; el 0,6 de cada eco se marca como «c(1 − t)». | «Cada eco es más débil. Sumados, dan el multiplicador: 1 / [1 − c(1 − t)].» |
| 4 | Deslizadores «c» 0,50–0,95 y «t» 0–40 %. Los anillos, la barra y el «× 2,5» cambian en vivo. | «Con c = 0,8 y t = 25 %, cada 100 de gasto se vuelven 250.» |
| 5 | Dos marcadores lado a lado: «Inclinación c(1 − t) = 0,6» y «Multiplicador = 2,5». Al mover c, los dos cambian juntos pero con números distintos. | «No los confundas: la inclinación es c(1 − t). El multiplicador es otro número.» |
| 6 | Se arma `Y₀ = multiplicador × (Ā − b·i)`. Acción: tocar Ā; se despliega en `C̄ + c·TR + Ī + G + XN` con los colores de cada componente. | «Producción de equilibrio: Y₀ = multiplicador × (Ā − b·i).» |

### H2 · Arma la fórmula (`da26-h2-arma-formula`, Hacer, Medio, 25 × 3 = 75 FP × %)
**Consigna:** «Arrastra cada pieza a su hueco en la fórmula.» (9 palabras)
**Figura:** la fórmula con huecos (rectángulos de borde punteado) y debajo una bandeja de
fichas con el símbolo; tocar una ficha sin soltarla muestra su nombre (C̄ «consumo
autónomo», c «propensión a consumir», etc.). Al completar cada etapa, la fórmula se
anima sobre su dibujo de A2 o A3 en miniatura (cada término se enciende sobre su parte).
**Evaluación:** cada colocación se juzga al soltar. Correcta: se encaja con ✓. Errada: la
ficha vuelve con la retro de esa ficha; el hueco no se puntúa ya. Puntaje = huecos
correctos al primer intento / 10.

**Etapa 1 · consumo** — `C = [ ] + [ ]( Y + [ ] − [ ] )`. Fichas: C̄, c, TR, T + distractores i, G.
- C̄ mal puesta: «C̄ va sola, al inicio: no depende de la renta.»
- c mal puesta: «c multiplica la renta disponible: va antes del paréntesis.»
- TR mal puesta: «Las transferencias suman a la renta: dentro, con +.»
- T mal puesta: «Los impuestos restan a la renta: dentro, con −.»
- i en cualquier hueco: «En este modelo, la tasa mueve la inversión, no el consumo.»
- G en cualquier hueco: «G es del Gobierno; no está dentro del consumo.»

**Etapa 2 · inversión** — `I = [ ] − [ ] · [ ]`. Fichas: Ī, b, i + distractores c, t.
Los huecos 2 y 3 aceptan b e i en cualquier orden (producto conmutativo).
- Ī mal puesta: «Ī va primero: la inversión que no depende de la tasa.»
- b o i en el primer hueco: «Lo que resta es b por la tasa, no va primero.»
- c: «c es del consumo, no de la inversión.»
- t: «t es de los impuestos, no de la inversión.»

**Etapa 3 · equilibrio** — `Y₀ = 1 / (1 − [ ](1 − [ ])) · ( [ ] − b·i )`. Fichas: c, t, Ā + distractores G, Y.
- c mal puesta: «c va en el denominador, multiplicando a (1 − t).»
- t mal puesta: «t va dentro de (1 − t): lo que queda tras impuestos.»
- Ā mal puesta: «Ā, el gasto autónomo, va en el segundo paréntesis.»
- G: «G ya está dentro de Ā; no va suelta.»
- Y: «Y es lo que estás calculando; no va al otro lado.»

Subtemas: etapa 1 `da-consumo`, etapa 2 `da-inversion`, etapa 3 `da-multiplicador`.
Celular: a 320 px la fórmula se parte en dos renglones en el «+» o el «·» exterior; los
huecos miden ≥ 44 × 44 px; la bandeja va fija bajo la fórmula, en dos filas.

### H5 · La libreta de la analista (`da26-h5-libreta`, Hacer, Difícil, 50 FP × %)
**Consigna:** «Toca la línea que tiene el error.» (6 palabras)
**Figura:** una hoja de libreta rayada con margen; «La analista» (silueta neutra) arriba
a la derecha. Cuatro líneas manuscritas (fuente del sitio, no manuscrita real, para
legibilidad); exactamente una es falsa.
**Mecánica:** tocar una línea. Si es la falsa: se tacha con un trazo animado (280 ms) y la
corrección se escribe debajo letra a letra (≤ 600 ms; con movimiento reducido, aparece).
Si es verdadera: borde coral breve, su retro, y la línea queda marcada ✓ «correcta»; el
estudiante sigue buscando (la página se puntúa solo si acierta al primer toque).
**Partida:** 4 páginas sorteadas de 6. Puntaje = páginas resueltas al primer toque / 4.
Orden de las cuatro líneas aleatorio en cada página.

| Pág. | Líneas (✗ = la falsa) | Retro al tocar una verdadera · Corrección de la falsa | Subtema |
|---|---|---|---|
| 1 | a) Si c sube, el multiplicador sube. · b) La inclinación de la DA es c(1 − t). · ✗ c) El multiplicador y la inclinación son el mismo número. · d) Más t, menor multiplicador. | a «Correcta: más c, denominador menor, multiplicador mayor.» · b «Correcta: es lo que sube la DA por cada peso de Y.» · d «Correcta: los impuestos debilitan cada eco.» · Corrección: «Inclinación c(1 − t); multiplicador 1 / [1 − c(1 − t)].» | da-multiplicador |
| 2 | a) Más gasto público desplaza la DA hacia arriba. · ✗ b) Subir la tasa de interés gira la DA. · c) Si t sube, la DA se aplana. · d) Un cambio en c gira la recta. | a «Correcta: G es autónomo y sube el arranque.» · c «Correcta: menos renta disponible por cada peso.» · d «Correcta: c está en la inclinación.» · Corrección: «Subir la tasa desplaza la DA hacia abajo.» | da-grafica |
| 3 | a) El tipo de cambio es pesos por dólar. · b) Si el tipo de cambio baja, el peso se aprecia. · ✗ c) Con el peso apreciado, las exportaciones suben. · d) XN = X − M. | a «Correcta: así se define en clase.» · b «Correcta: con menos pesos compras un dólar.» · d «Correcta: ventas al exterior menos compras al exterior.» · Corrección: «Con el peso apreciado, exportar rinde menos: X baja.» | da-exportaciones-netas |
| 4 | a) El consumo autónomo existe aunque la renta sea cero. · b) Renta disponible = Y + TR − T. · ✗ c) Si la propensión a ahorrar baja, la DA baja. · d) T = tY. | a «Correcta: se financia con préstamos, ahorros o ayudas.» · b «Correcta: renta más transferencias menos impuestos.» · d «Correcta: el impuesto es una tasa sobre la renta.» · Corrección: «Si s baja, c sube: la DA sube.» | da-consumo |
| 5 | a) I = Ī − b·i. · b) La incertidumbre reduce la inversión autónoma. · ✗ c) Con b grande, la tasa casi no mueve la inversión. · d) Si la tasa sube, la inversión baja. | a «Correcta: autónoma menos el efecto de la tasa.» · b «Correcta: Ī recoge las expectativas.» · d «Correcta: el crédito sale más caro.» · Corrección: «Con b grande, cada punto de tasa mueve mucho la inversión.» | da-inversion |
| 6 | a) G no depende de la renta en el modelo. · b) El Gobierno puede gastar más de lo que recauda. · ✗ c) Un subsidio a familias es parte de G. · d) Recortar G baja la DA. | a «Correcta: lo decide el Gobierno; es autónomo.» · b «Correcta: la diferencia es déficit, cubierto con deuda.» · d «Correcta: G suma directo a la DA.» · Corrección: «Un subsidio es TR: entra por la renta disponible.» | da-gasto-publico |

Celular: a 320 px cada línea es un bloque táctil de ancho completo y ≥ 48 px de alto,
que puede ocupar dos renglones.

### H6 · Lleva la economía a la meta (`da26-h6-meta`, Hacer, Medio, 25 × 3 = 75 FP × %)
**Consigna:** «Mueve la palanca hasta que la producción llegue a la meta.» (11 palabras)
**Figura:** la gráfica de A5 con la recta de 45° siempre visible, el cruce Y₀ marcado y una
banderita «Meta» sobre el eje Y. Debajo, UNA palanca (deslizador) por etapa y el botón
«Fijar». El valor de Y₀ se ve en vivo en Geist Mono. Se puede mover libremente; solo
«Fijar» cuenta.
**Modelo:** el común (§0). Tolerancia: |Y₀ − meta| ≤ 25.
**Puntaje:** etapa lograda si se fija dentro de la tolerancia en ≤ 3 «Fijar». Puntaje =
etapas logradas / 3. Tras el 3.er «Fijar» fallido la etapa se muestra resuelta
(la palanca se anima al valor correcto) y se pasa a la siguiente.

| Etapa | Palanca | Rango (paso) | Meta | Solución | Retro: arriba · abajo | Pista tras el 2.º fallo |
|---|---|---|---|---|---|---|
| 1 · Reactivar | Gasto público G | 100–400 (10) | Y₀ = 1.400 | G = 250 (±10) | «Te pasaste: baja G; cada peso se multiplica por 2,5.» · «Falta: sube G; cada peso de gasto rinde 2,5.» | «Faltan 125 de producción. Divide entre 2,5.» |
| 2 · Reactivar sin gastar | Tasa t (G vuelve a 200) | 10–40 % (1) | Y₀ = 1.400 | t = 20 % o 21 % | «Te pasaste: sube un poco el impuesto.» · «Falta: baja el impuesto; deja más renta disponible.» | «Busca un impuesto cercano al 20 %.» |
| 3 · Enfriar | Tasa de interés i (G = 200, t = 25 %) | 2–16 % (0,5) | Y₀ = 1.150 | i entre 12 % y 14 % | «Aún está caliente: sube más la tasa.» · «Enfriaste de más: baja un poco la tasa.» | «Cada punto de tasa quita 25 de producción.» |

Comprobación de cifras (medir en la prueba del modelo, no confiar en esta tabla):
E1: (590 + 50 − 80) × 2,5 = 1.400. E2: t = 20 % → 510 / (1 − 0,64) = 1.416,7; t = 21 % →
510 / 0,368 = 1.385,9. E3: i = 13 → (590 − 130) × 2,5 = 1.150; i = 12 → 1.175; i = 14 → 1.125.
Al entrar a cada etapa aparece una línea de contexto (≤ 12 palabras): E1 «La economía está
fría. Solo puedes mover el gasto.» · E2 «Sin más gasto. Solo puedes mover el impuesto.» ·
E3 «Ahora sobra demanda. Solo puedes mover la tasa.»
Subtemas: `da-multiplicador` y `da-grafica` (E1 además `da-gasto-publico`, E2 `da-consumo`,
E3 `da-inversion`).

---

## 3. Autoevaluación contra el Kit (antes de construir; el auditor mide después)

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Todo rastreable a d. 6–13; la corrección «pendiente ≠ multiplicador» está señalada; sin clichés; coral solo error. |
| D1 Fidelidad y profundidad | Avanzado | Cubre los 11 subtemas; sube hasta aplicar el multiplicador con meta (H6). |
| D2 Valor pedagógico | Avanzado | Recordar (H1), comprender (A2–A6, H2), aplicar (H3, H4), analizar/evaluar (H5), crear una solución (H6). |
| D3 Claridad y auto-rescate | Avanzado | Pistas graduadas en H6; retro específica en todos; nombres de fichas al tocar en H2. |
| D4 Interacción | Avanzado | En todas las Aprender al menos la mitad de pantallas tienen acción con consecuencia visible (B3). |
| D5 Marca | Avanzado | Tokens Planck, una familia tipográfica por pieza, curva y tiempos del kit. |
| D6 Feedback | Avanzado | 100 % de errores con texto propio ≤ 15 palabras. |
| D7 Móvil | Avanzado (a medir) | Comportamiento a 320 y 375 especificado en cada pieza; se mide con sondas. |
| D8 Rejugabilidad | Avanzado en Hacer (bancos más grandes que la partida y orden aleatorio); Medio en Aprender (permitido). |
| D9 Gancho visual | Avanzado | Carrito, vaso, balancín, etiqueta del dólar, regla con bisagra, eco, libreta: ninguno se repite. |
| D11 Codificación dual | Avanzado | Los cuatro colores de componente significan lo mismo en las 12 piezas y van con letra. |
| D12 Accesibilidad | Avanzado (a medir) | Tocar-tocar y teclado para todo arrastre; movimiento reducido. |
| D13 Consigna | Medio (Avanzado requiere estudiantes reales) | Verbos de acción, ≤ 12 palabras, ningún término antes de enseñarse. |

## 4. Conteo de palabras (Aprender ≤ 20 por pantalla, Hacer ≤ 12 por consigna)
Lo mide `scripts/` en la prueba de la pieza; este es el conteo del diseño
(símbolos y fórmulas cuentan como una palabra cada grupo separado por espacios):
A1: 15 · 9 · 14 · 12 — A2: 7 · 15 · 15 · 13 · 15 · 7 — A3: 12 · 9 · 15 · 15 —
A4: 13 · 16 · 10 · 13 · 13 — A5: 11 · 12 · 14 · 13 · 13 · 12 — A6: 11 · 15 · 16 · 16 · 14 · 10.
(Medido con script sobre este archivo, 2026-11-22.) Los rótulos de controles no cuentan como lectura.
Consignas Hacer: H1 9 · H2 9 · H3 8 · H4 10 · H5 6 · H6 11. Máximo: 16 (cumple).
