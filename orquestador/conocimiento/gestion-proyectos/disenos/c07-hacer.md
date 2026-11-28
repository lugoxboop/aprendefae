# Gestión de Proyectos · Capítulo 7 (Gestión de los Costos) — los Hacer diarios (Gen, 2026-11-27)

Fuente única: `../fichas/c07-costos.md` (Guía del PMBOK 6.ª ed., pp. 231–271). Ids de
piezas: `gp-c07-hMM-…`; subtemas `gp07-…`. Los Aprender los hace Jane: conexión en §6.

## 0. Reglas comunes y datos del capítulo

- **Valen todas las reglas de `c1-c2-hacer.md` §0** (formato diario de 3 a 5 min, mundo
  Altamira, elenco, paso 6, límites de texto, arrastre común, puntaje, celular 320/375,
  claves «criterio de Gen»). No se repiten aquí.
- **Hilo del capítulo: la bodega de Santa Marta** (programa «Expansión a la costa»). El
  estudiante es el director(a) del proyecto de la bodega. El banco que la financia, el
  contratista y los proveedores **no son mascotas**: aparecen como edificio, documento o
  voz en globo.
- **Elenco que aparece:** zorro (Tú) en todas · panda (Patrocinadora) H05, H06, H07, H10,
  H11 · perro (PMO) H01, H09, H12 · hámster (Equipo) H02, H03, H06 · hurón (Practicante)
  H01, H12.
- **Unidad:** millones de pesos colombianos. En pantalla se escribe «$1.200 millones» o,
  en tablas y cálculos, solo «1.200». Decimales con coma (0,80).
- **Teclado numérico propio** en las piezas de cálculo (H03, H06, H07, H08–H11): botones
  ≥ 48 px, coma decimal, signo menos; tolerancia ±1 en enteros y ±0,01 en índices.
  Error de cálculo: la cifra tiembla, borde coral y retro; segundo intento sin puntaje.
- **Datos fijos de la bodega** (los mismos en todas las piezas; viven en un solo archivo
  de datos, `datos/c07-bodega.json`, para que coincidan con el Aprender de Jane):

| Paquete de trabajo | Estimación | Contingencia | Cuenta de control |
|---|---|---|---|
| Estudios y terreno (suelos 30 + diseño 70 + permisos 50) | 150 | 10 | Edificio |
| Obra civil (cimientos 200 + estructura 250 + cubierta 150) | 600 | 60 | Edificio |
| Estanterías y montacargas (tres valores: 200 / 240 / 340 → beta 250) | 250 | 20 | Equipamiento |
| Control de humedad (tres valores: 80 / 90 / 160 → beta 100) | 100 | 10 | Equipamiento |
| **Total** | **1.100** | **100** | Edificio 820 · Equipamiento 380 |

  Línea base de costos = **BAC = 1.200** · reserva de gestión **80** · presupuesto del
  proyecto **1.280**. Gasto planeado por mes (12 meses): 40 · 60 · 120 · 180 · 150 · 150 ·
  150 · 150 · 80 · 60 · 40 · 20. **Corte del mes 4:** PV 400 · EV 300 · AC 375 → CV −75 ·
  SV −100 · CPI 0,80 · SPI 0,75. Las cifras son del escenario (criterio de Gen); las
  fórmulas y su lectura son de la guía.

## 1. Plan y calendario

Días contados dentro del capítulo 7.

| Día | id | Nombre | Mecánica | Subtemas | Dific. | FP | Aprender previo (Jane) |
|---|---|---|---|---|---|---|---|
| 1 | gp-c07-h01-plan-costos | Los cajones del plan | Archivar fichas en cajones + micro (2 etapas) | gp07-plan, gp07-panorama | Medio | 25 × 2 = 50 × % | c07-A01 |
| 2 | gp-c07-h02-metodos | Cuatro maneras de estimar | Clasificar en objetos-destino | gp07-tecnicas, gp07-tres-valores | Fácil | 10 × % | c07-A01 |
| 3 | gp-c07-h03-tres-valores | La calculadora de tres valores | Simulador con deslizadores + calcular + predecir (2 etapas) | gp07-tres-valores | Medio | 25 × 2 = 50 × % | c07-A01 |
| 4 | gp-c07-h04-embudo | El embudo de la exactitud | Ajustar rango + lista de chequeo (2 etapas) | gp07-exactitud | Fácil | 10 × 2 = 20 × % | c07-A01 |
| 5 | gp-c07-h05-reservas | Dos barriles | Clasificar en 3 destinos + microdesafíos (2 etapas) | gp07-reservas | Medio | 25 × 2 = 50 × % | c07-A02 |
| 6 | gp-c07-h06-polea | La polea del presupuesto | Construir torre por niveles + calcular (2 etapas) | gp07-linea-base, gp07-reservas | Difícil | 50 × 2 = 100 × % | c07-A02 |
| 7 | gp-c07-h07-curva-s | La curva S y los escalones | Trazar puntos + ajustar escalones + conciliar (2 etapas) | gp07-linea-base, gp07-financiamiento | Difícil | 50 × 2 = 100 × % | c07-A02 |
| 8 | gp-c07-h08-lona | Tres líneas en la lona | Rotular curvas + calcular + predecir | gp07-evm, gp07-variaciones | Medio | 25 × % | c07-A03 |
| 9 | gp-c07-h09-termometros | Dos termómetros | Calcular + clasificar en matriz 2 × 2 (2 etapas) | gp07-variaciones | Difícil | 50 × 2 = 100 × % | c07-A03 |
| 10 | gp-c07-h10-telescopio | El telescopio del final | Encajar fórmula + calcular + decidir (3 etapas) | gp07-pronosticos | Difícil | 50 × 3 = 150 × % | c07-A04 |
| 11 | gp-c07-h11-rampa | La rampa del montacargas | Calcular y ver la pendiente + predecir | gp07-tcpi | Difícil | 50 × % | c07-A04 |
| 12 | gp-c07-h12-libro | El libro de costos del practicante | Encontrar el error | gp07-variaciones, gp07-reservas, gp07-control, gp07-cronograma-ganado | Difícil | 50 × % | c07-A04 |

**Variedad:** 12 piezas, 11 mecánicas principales distintas. **Ninguna** tiene la selección
entre opciones como mecánica principal (solo aparece en microdesafíos de cierre, siempre
moviendo algo en escena). **Gancho visual propio** en cada una (mueble planero,
mesa de dibujo con 4 objetos, calculadora de rollo, embudo, barriles y valla, polea,
papel milimetrado con escalones, fachada con lona, termómetros, telescopio, montacargas
con rampa, libro contable); ninguno repite los de c1-c2 §3 ni los de los otros capítulos
ya escritos al cerrar este archivo (revisado con búsqueda).

**Respaldo:** todas son **práctica de recuperación** con retro inmediata y específica
(Roediger y Karpicke). Las piezas de cálculo (H03, H06–H11) usan **ejemplos resueltos que
se desvanecen** (Sweller, Renkl): la retro muestra la operación completa y el ítem
siguiente pide un paso más. Un solo conjunto de datos en todo el capítulo baja la **carga
cognitiva** extrínseca (no hay que releer cifras nuevas). H03 y H11 son **simulación
exploratoria** antes del reto. H10 obliga a **elegir el procedimiento según la condición**
(transferencia). H12 = **detección de errores**. La elección exacta de cada mecánica es
criterio propio sobre esa base.

**Dificultad progresiva:** de reconocer (H01, H02) a calcular (H03–H09) y a decidir y
evaluar (H10–H12). Dentro de cada pieza, de lo directo a lo fino.

---

## 2. Especificación pieza por pieza

### H01 · Los cajones del plan (`gp-c07-h01-plan-costos`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (22):** «Antes de estimar un solo peso, la PMO pide el plan de gestión de los
  costos de la bodega de Santa Marta.»
- **Rol (10):** «Diriges el proyecto de la bodega y redactas el plan.»
- **Etapa 1 · Consigna (8):** «Pon cada regla en su cajón del plan.»
  - **Visual:** mueble planero de madera ilustrado (Gemini), de frente, ocupando la pantalla,
    con **siete cajones** rotulados (ícono + nombre): Unidades (cinta de medir) · Precisión (lápiz con
    redondeo) · Exactitud (diana) · Cuenta de control (etiqueta con código) · Umbral (línea
    con alarma) · Reglas de valor ganado (gráfico de tres curvas) · Informes (hoja con
    calendario). El hurón (Practicante) trae las fichas sueltas; el perro (PMO) espera.
    Acierto: el cajón se abre, la ficha entra y el cajón se cierra con un clic.

| Ficha | Cajón | Retro si la archiva mal |
|---|---|---|
| «La obra se mide en metros cuadrados; el personal, en horas.» | Unidades | «Define en qué unidad se mide cada recurso.» |
| «Todas las cifras se redondean al millón más cercano.» | Precisión | «Redondear es el nivel de precisión, no de exactitud.» |
| «Redondear 995,59 a 1.000.» | Precisión | «Es un ejemplo de redondeo: nivel de precisión.» |
| «La estimación se acepta si cae dentro de ±10 %.» | Exactitud | «Un rango aceptable con ± es el nivel de exactitud.» |
| «“Obra civil” lleva el código 2.0 de contabilidad.» | Cuenta de control | «El componente de la EDT ligado a la contabilidad es la cuenta de control.» |
| «Si el costo se desvía más de 5 %, se actúa.» | Umbral | «Es la variación permitida antes de tomar medidas.» |
| «El avance se mide por porcentaje completado en cada paquete.» | Reglas de valor ganado | «Elegir la técnica de medición del valor ganado va en sus reglas.» |
| «La EAC también se calcula con fórmula, para validar la del equipo.» | Reglas de valor ganado | «Fijar cómo se calcula la EAC es regla del valor ganado.» |
| «Informe de costos cada mes, en una página.» | Informes | «Define formato y frecuencia de los informes de costos.» |

  Partida: 7 (una por cajón; Precisión y Reglas sortean entre sus dos fichas).
- **Etapa 2 · Microdesafíos (3, en orden):**
  1. Contexto (16): «La patrocinadora pregunta cómo pagar la bodega: con caja propia,
     emitiendo acciones o con un préstamo.» Consigna (7): «¿Qué técnica usas para comparar
     esas opciones?» Opciones (tres sellos que caen sobre el planero): **Análisis de
     alternativas** ✓ / Estimación paramétrica / Análisis de reserva. Retros: paramétrica
     «La paramétrica calcula costos; aquí comparas formas de financiarte.» · reserva «Las
     reservas cubren riesgos; aquí eliges la financiación.»
  2. Contexto (12): «El practicante propone quitar dos revisiones del diseño para ahorrar
     $20 millones.» Consigna (5): «¿Qué costo puede subir después?» Opciones: **Operar y
     mantener la bodega** ✓ / El terreno / Ninguno. Retros: terreno «El terreno no depende
     del diseño; la operación sí.» · ninguno «Ahorrar en diseño puede encarecer el uso y
     mantenimiento.» Revelar: el planero muestra una hoja «Costo del ciclo de vida» con
     la barra de operación creciendo.
  3. Contexto (17): «Altamira encarga las estanterías. Compras anota el costo al pedirlas;
     contabilidad, al pagarlas; la PMO, al recibirlas.» Consigna (6): «¿Alguna de las tres
     está equivocada?» Sí / **No**. Retro de «Sí»: «Cada interesado puede medir el costo
     en un momento distinto.»
- **Cierre (11):** «El plan dice cómo se estima, presupuesta y controla el costo.»
- **Subtemas:** `gp07-plan` (etapa 1, micro 1), `gp07-panorama` (micros 2–3). Ítem más
  largo a medir: «La EAC también se calcula con fórmula, para validar la del equipo.»

### H02 · Cuatro maneras de estimar (`gp-c07-h02-metodos`, Fácil, 10 FP × %)
- **Contexto (18):** «Hay que estimar la bodega de Santa Marta. El equipo trae cuatro
  formas distintas de calcular cuánto costará.»
- **Rol (10):** «Diriges la bodega y eliges la técnica de cada cálculo.»
- **Consigna (8):** «Lleva cada cálculo a su técnica de estimación.»
- **Visual:** mesa de dibujo grande vista desde arriba (Gemini) con **cuatro objetos-destino**:
  foto enmarcada de la bodega de Manizales (**Análoga**) · plano con cuadrícula de metros
  cuadrados (**Paramétrica**) · pila de cajas de madera numeradas (**Ascendente**) ·
  tres torres de monedas de distinta altura rotuladas O · M · P (**Tres
  valores**). El hámster (Equipo) desliza las tarjetas. Acierto: el objeto se ilumina y una
  cifra vuela a la maqueta de la bodega al centro.

| Cálculo | Técnica | Retro si se equivoca |
|---|---|---|
| «La bodega de Manizales costó $900 millones y es parecida: partimos de ahí.» | Análoga | «Usa el costo de un proyecto anterior parecido: análoga.» |
| «La última obra de la PMO, del mismo tamaño, sirve de base.» | Análoga | «Toma como base un proyecto similar anterior: análoga.» |
| «Obra civil: $1,2 millones por m² × 500 m² = $600 millones.» | Paramétrica | «Multiplica una tarifa histórica por una variable: paramétrica.» |
| «Estanterías: $50.000 por metro lineal × 5.000 metros.» | Paramétrica | «Relación estadística entre un dato histórico y la cantidad.» |
| «Cada paquete se estima en detalle y luego se suman todos.» | Ascendente | «Detalle por paquete y suma hacia arriba: ascendente.» |
| «Cimientos 200 + estructura 250 + cubierta 150 = obra civil 600.» | Ascendente | «Suma estimaciones detalladas de abajo hacia arriba: ascendente.» |
| «Estanterías: en el mejor caso 200, lo normal 240, en el peor 340.» | Tres valores | «Optimista, más probable y pesimista: tres valores.» |
| «El equipo duda del costo del control de humedad y da tres cifras.» | Tres valores | «Tres escenarios para reflejar la incertidumbre: tres valores.» |

- **Partida:** 8 (2 por técnica). **Cierre (11):** «Análoga compara, paramétrica
  multiplica, ascendente suma y tres valores pondera escenarios.»
- **Subtemas:** `gp07-tecnicas`, `gp07-tres-valores`. Ítem más largo: «La bodega de
  Manizales costó $900 millones y es parecida: partimos de ahí.»

### H03 · La calculadora de tres valores (`gp-c07-h03-tres-valores`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (17):** «Para las estanterías, el equipo dio tres cifras: optimista 200, más
  probable 240 y pesimista 340 millones.»
- **Rol (8):** «Diriges la bodega y fijas el costo esperado.»
- **Visual:** calculadora de mesa gigante con rollo de papel (Gemini). Sobre ella, tres
  deslizadores (cO, cM, cP; a mano, montados en la calculadora) y dos pantallas:
  **Triangular** y **Beta**. En la pantalla Beta, el cM aparece como **cuatro fichas
  apiladas** (muestra que pesa 4 veces). Cada cálculo imprime la fórmula en el rollo. El
  hámster lee el rollo.
- **Etapa 1 · Explorar y calcular.**
  - Exploración (sin puntaje, mínimo 3 movimientos). Consigna (8): «Mueve las tres cifras y
    mira ambos resultados.»
  - Reto. Consigna (8): «Calcula el costo esperado con la fórmula indicada.»

| Caso | Fórmula | Clave | Retro si falla |
|---|---|---|---|
| Estanterías 200 / 240 / 340, triangular | (cO + cM + cP) / 3 | 260 | «Suma las tres y divide entre 3: 780 / 3 = 260.» |
| Estanterías, beta | (cO + 4·cM + cP) / 6 | 250 | «El más probable cuenta 4 veces: 1.500 / 6 = 250.» |
| Humedad 80 / 90 / 160, beta | (cO + 4·cM + cP) / 6 | 100 | «80 + 4·90 + 160 = 600; entre 6 da 100.» |
| Humedad, triangular | (cO + cM + cP) / 3 | 110 | «80 + 90 + 160 = 330; entre 3 da 110.» |

- **Etapa 2 · Microdesafíos (3):**
  1. Consigna (8): «¿Por qué beta da menos que triangular aquí?» Opciones: **«Beta pesa
     más el más probable; el pesimista está lejos»** ✓ / «Beta ignora el pesimista» /
     «Beta siempre da menos». Retros: «Beta sí usa el pesimista, solo que con menos peso.» ·
     «No siempre: depende de dónde esté el más probable.»
  2. **Predecir y revelar.** Contexto (9): «El proveedor avisa: el peor caso sube a 400.»
     Consigna (4): «¿Cuál resultado sube más?» Apuesta: **Triangular** ✓ / Beta / Igual.
     Revelar: el deslizador cP sube solo; triangular pasa a 280 (+20) y beta a 260 (+10).
     Retro (para Beta e Igual): «En triangular el pesimista pesa 1/3; en beta, solo 1/6.»
  3. Consigna (8): «¿Qué gana la estimación al usar tres valores?» Opciones: **«Tiene en
     cuenta la incertidumbre y el riesgo»** ✓ / «Elimina el riesgo» / «Ya no hace falta
     contingencia». Retros: «La incertidumbre sigue; solo queda reflejada en el rango.» ·
     «La contingencia sigue cubriendo riesgos identificados.»
- **Subtema:** `gp07-tres-valores`. Celular: deslizadores apilados a 320 px, cada uno con
  su valor escrito al lado (no depende de la posición).

### H04 · El embudo de la exactitud (`gp-c07-h04-embudo`, Fácil, 10 × 2 = 20 FP × %)
- **Contexto (21):** «En la fase de inicio estimaste la bodega en $1.000 millones. Ahora,
  con planos y cotizaciones, la reestimas en $1.200 millones.»
- **Rol (10):** «Diriges la bodega y explicas los rangos a la patrocinadora.»
- **Visual:** embudo metálico enorme (Gemini), vertical: boca ancha arriba «Inicio · ROM»,
  cuello estrecho abajo «Más adelante». Dentro, una regla horizontal (a mano, montada en el
  embudo) con dos tiradores para los extremos del rango, con imán cada 20.
- **Etapa 1 · Ajustar el rango (2 ítems):**
  1. Consigna (9): «Arrastra los extremos al rango de la estimación ROM.» Clave **750 a
     1.750**. Retro: «La ROM va de −25% a +75%: de 750 a 1.750.»
  2. Consigna (9): «Ahora ajusta el rango de la estimación de 1.200.» Clave **1.140 a
     1.320**. Retro: «Más adelante va de −5% a +10%: de 1.140 a 1.320.»
  - Revelar tras el ítem 2: la regla baja por el embudo y se estrecha; texto (5): «Más
    información, rango más estrecho.»
- **Etapa 2 · Consigna (10):** «Marca lo que debe llevar la base de las estimaciones.»
  - **Visual:** de la boca del embudo sale una etiqueta colgante «Base de las
    estimaciones» con casillas; el estudiante toca cada tarjeta para colgarla o la deja.
    Se muestran las 9; al confirmar, cada una se marca.

| Tarjeta | ¿Va? | Retro si se equivoca |
|---|---|---|
| «Cómo se hizo la estimación.» | Sí | «Documentar el método es lo primero de la base.» |
| «Supuestos usados.» | Sí | «Los supuestos explican por qué la cifra es esa.» |
| «Restricciones conocidas.» | Sí | «Las restricciones conocidas limitan la estimación: van documentadas.» |
| «Riesgos incluidos al estimar.» | Sí | «Los riesgos incluidos al estimar deben quedar escritos.» |
| «Rango: 1.200 ± 10 %.» | Sí | «Indicar el rango muestra dónde se espera el costo.» |
| «Nivel de confianza.» | Sí | «El nivel de confianza dice cuánto fiarse de la cifra.» |
| «Quién la aprueba en la junta.» | No | «La base explica cómo se obtuvo la cifra, no quién la aprueba.» |
| «El valor ganado del mes.» | No | «El valor ganado se mide al controlar; no sustenta la estimación.» |
| «La cifra sola, sin rango.» | No | «Sin rango no se ve la incertidumbre de la estimación.» |

- **Subtema:** `gp07-exactitud`. Celular: el embudo ocupa el 50 % del alto; los tiradores
  miden 48 px y muestran su cifra encima.

### H05 · Dos barriles (`gp-c07-h05-reservas`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (16):** «La bodega tiene riesgos conocidos y sorpresas imposibles de prever.
  Hay que guardar dinero para ambos.»
- **Rol (10):** «Diriges la bodega y propones las reservas a la patrocinadora.»
- **Visual:** patio de la obra (Gemini) con una **valla** rotulada «Línea base de costos».
  Dentro de la valla: una pila de ladrillos (**Estimación**) y un barril pequeño con grifo
  (**Reserva para contingencias**), con la llave del grifo colgada del zorro. Fuera de la
  valla, junto a la panda (Patrocinadora): un barril grande (**Reserva de gestión**) con
  candado en el grifo; la llave la tiene la panda. Un letrero alto «Presupuesto del proyecto» abarca valla y barril grande. Acierto: la
  tarjeta se vuelve billete y entra en su destino.
- **Etapa 1 · Consigna (8):** «¿Estimación, reserva para contingencias o reserva de gestión?»

| Tarjeta | Destino | Retro si se equivoca |
|---|---|---|
| «Se sabe que lloverá; no cuántos días de obra se pierden.» | Contingencias | «Riesgo identificado de impacto incierto: conocido-desconocido.» |
| «Puede haber retrabajo en la cubierta; no se sabe cuánto.» | Contingencias | «Retrabajo previsto de tamaño desconocido: lo cubre la contingencia.» |
| «El acero puede subir; está en el registro de riesgos.» | Contingencias | «Está en el registro de riesgos: la contingencia lo cubre.» |
| «Algo que nadie ha imaginado todavía.» | Gestión | «Desconocido-desconocido: lo cubre la reserva de gestión.» |
| «Un imprevisto dentro del alcance que no está en ningún registro.» | Gestión | «Trabajo no previsto dentro del alcance: reserva de gestión.» |
| «Cimientos: 200 millones.» | Estimación | «Es el costo estimado de un paquete, no una reserva.» |
| «Estructura: 250 millones.» | Estimación | «Costo estimado del trabajo; las reservas van aparte.» |

  Partida: 6 (3 contingencias, 2 gestión, 1 estimación).
- **Etapa 2 · Microdesafíos (4, en orden):**
  1. Consigna (8): «¿Qué barril queda dentro de la línea base?» Tocar barril →
     **Contingencias**. Retro si toca el de gestión: «La reserva de gestión queda fuera;
     solo entra al presupuesto.»
  2. Consigna (9): «Aparece un imprevisto. ¿Cómo usas la reserva de gestión?» Opciones:
     **«Se aprueba un cambio y el monto pasa a la línea base»** ✓ / «La gastas tú cuando
     quieras» / «Se gasta sola al aparecer el problema». Retros: «Es para control de la
     dirección: requiere cambio aprobado.» · «Nada se mueve solo: se aprueba el cambio
     primero.» Revelar: la panda abre el candado y un tubo lleva el dinero al interior de la valla.
  3. Contexto (14): «Terminó la temporada de lluvias sin perder un día. Sobran $20 millones
     de contingencia.» Consigna (6): «¿Qué puede pasar con ese dinero?» Opciones:
     **«Retirarse para liberar fondos a otros proyectos»** ✓ / «Gastarse en mejoras no
     aprobadas» / «Moverse en silencio a otro barril». Retros: «Gastarlo en mejoras no
     aprobadas rompe el control de costos.» · «Todo movimiento de reservas se documenta;
     nada en silencio.»
  4. Consigna (9): «Calcula la línea base y el presupuesto del proyecto.» Datos en la valla:
     estimaciones 1.100 · contingencias 100 · reserva de gestión 80. Claves **1.200** y
     **1.280**. Retros: «La línea base suma estimaciones y contingencias, sin gestión:
     1.200.» · «Presupuesto = línea base 1.200 + reserva de gestión 80 = 1.280.»
- **Subtema:** `gp07-reservas`.

### H06 · La polea del presupuesto (`gp-c07-h06-polea`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (18):** «Tienes las estimaciones de todas las actividades. La patrocinadora
  quiere ver cómo se convierten en el presupuesto aprobado.»
- **Rol (9):** «Diriges la bodega y armas el presupuesto por niveles.»
- **Visual:** polea de obra con gancho y cuerda (Gemini), colgada de una viga, que levanta **bloques de madera** con
  rótulo; a la izquierda, una torre vacía con 5 niveles marcados. El hámster (Equipo)
  engancha los bloques; la panda mira desde arriba. Cada bloque bien puesto se fija con un
  golpe seco y muestra su cifra.
- **Etapa 1 · Consigna (7):** «Ordena los niveles de abajo hacia arriba.» Bloques:
  Estimaciones de las actividades → Paquetes de trabajo → Cuentas de control → Línea base
  de costos → Presupuesto del proyecto; y dos bloques delgados que se insertan entre
  niveles: **Reservas para contingencias** (clave: debajo de la línea base) y **Reserva de
  gestión** (clave: entre la línea base y el presupuesto). Retro por par mal puesto:

| Error | Retro |
|---|---|
| Actividades ↔ paquetes | «Las actividades se suman para formar cada paquete de trabajo.» |
| Paquetes ↔ cuentas de control | «Los paquetes se agregan en cuentas de control.» |
| Cuentas de control ↔ línea base | «La suma de las cuentas de control da la línea base.» |
| Línea base ↔ presupuesto | «El presupuesto es la línea base más la reserva de gestión.» |
| Reserva de gestión debajo de la línea base | «La reserva de gestión no entra a la línea base.» |
| Contingencias encima de la línea base | «La contingencia entra antes: es parte de la línea base.» |

- **Etapa 2 · Consigna (9):** «Calcula cada bloque con los datos de la obra.» El bloque
  activo se ilumina; los datos aparecen pintados en él.

| Bloque | Datos | Clave | Retro si falla |
|---|---|---|---|
| Paquete «Obra civil» | cimientos 200 · estructura 250 · cubierta 150 | 600 | «Suma las tres actividades: 200 + 250 + 150 = 600.» |
| Cuenta «Edificio» | estudios 150 + 10 · obra civil 600 + 60 | 820 | «Cada paquete con su contingencia: 160 + 660 = 820.» |
| Cuenta «Equipamiento» | estanterías 250 + 20 · humedad 100 + 10 | 380 | «Cada paquete con su contingencia: 270 + 110 = 380.» |
| Línea base de costos | Edificio + Equipamiento | 1.200 | «820 + 380 = 1.200: suma de cuentas de control.» |
| Presupuesto del proyecto | + reserva de gestión 80 | 1.280 | «1.200 + 80 = 1.280: línea base más reserva de gestión.» |

  - Micro final. Consigna (8): «¿Cuál de las dos cifras es el BAC?» **1.200** ✓ / 1.280.
    Retro de 1.280: «El BAC es la línea base: sin reserva de gestión.»
- **Subtemas:** `gp07-linea-base`, `gp07-reservas`. Puntaje: aciertos al primer intento /
  12 ítems (6 colocaciones + 5 cálculos + 1 micro). Celular: la torre se ve completa a
  320 px (bloques de 44 px de alto con texto de 14 px; el teclado sube sobre la polea).

### H07 · La curva S y los escalones (`gp-c07-h07-curva-s`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (22):** «Ya tienes el gasto planeado de cada mes. El banco que financia la
  bodega pide la curva y los desembolsos por trimestre.»
- **Rol (9):** «Diriges la bodega y preparas la solicitud de fondos.»
- **Visual:** lámina grande de papel milimetrado (Gemini) clavada en la caseta de obra, con ejes «Meses» y
  «Costo acumulado» (la curva y los puntos son a mano, con datos exactos, montados en la
  lámina). Abajo, doce columnitas con el gasto de cada mes. A la derecha, **cuatro
  escalones de madera** ilustrados que se suben o bajan. El banco es un edificio con su
  voz en globo; la panda observa.
- **Etapa 1 · Consigna (7):** «Arrastra cada punto a su costo acumulado.» El estudiante
  pone 6 puntos (meses 2, 4, 6, 8, 10, 12; imán cada 20); los demás se completan solos.

| Punto | Clave | Retro si falla |
|---|---|---|
| Mes 2 | 100 | «Acumula: 40 + 60 = 100.» |
| Mes 4 | 400 | «Suma hasta el mes 4: 100 + 120 + 180 = 400.» |
| Mes 6 | 700 | «Acumula: 400 + 150 + 150 = 700.» |
| Mes 8 | 1.000 | «Acumula: 700 + 150 + 150 = 1.000.» |
| Mes 10 | 1.140 | «Acumula: 1.000 + 80 + 60 = 1.140.» |
| Mes 12 | 1.200 | «Al final llega a 1.200: el BAC.» |

  Revelar: la línea une los puntos y se ve la S; texto (9): «La línea base por fases de
  tiempo se ve como curva S.»
- **Etapa 2 · Microdesafíos (3, en orden):**
  1. Consigna (7): «Ajusta cada escalón para cubrir el trimestre.» Claves (acumulado al
     cierre): T1 **220** · T2 **700** · T3 **1.080** · T4 **1.280**. Retros: T1 «El
     escalón debe cubrir el gasto acumulado del trimestre: 220.» · T2 «Al cierre del mes
     6 llevas 700 gastados.» · T3 «Al cierre del mes 9 llevas 1.080.» · T4 «Fondos
     totales = línea base 1.200 + reserva de gestión 80.» Revelar: los escalones quedan
     siempre por encima de la curva; texto (7): «El financiamiento llega en escalones, no
     parejo.»
  2. Contexto (13): «El banco avisa: en el segundo trimestre solo puede desembolsar hasta
     620 acumulados.» Consigna (8): «¿Qué haces con el trabajo del mes 6?» Opciones:
     **«Reprogramar parte al trimestre siguiente»** ✓ / «Gastar igual y pagar después» /
     «Usar la reserva para contingencias». Retros: «No puedes gastar fondos que no están
     comprometidos.» · «Las reservas cubren riesgos; el límite se concilia reprogramando.»
     Revelar: 80 del mes 6 pasan al mes 7 y la curva se aplana un poco bajo el escalón.
  3. Consigna (7): «¿De dónde salen los requisitos de financiamiento?» Opciones: **De la
     línea base de costos** ✓ / Del valor ganado / Del acta de constitución. Retros: «El
     valor ganado mide avance; no fija los fondos.» · «El acta da fondos preaprobados; los
     requisitos salen de la línea base.»
- **Subtemas:** `gp07-linea-base` (etapa 1), `gp07-financiamiento` (etapa 2).
  Celular: la lámina gira a horizontal dentro de la tarjeta (no la pantalla); los 12
  meses caben a 320 px con etiquetas cada 2 meses.

### H08 · Tres líneas en la lona (`gp-c07-h08-lona`, Medio, 25 FP × %)
- **Contexto (21):** «Fin del mes 4. Sobre la lona de la obra están dibujadas tres curvas:
  lo planeado, lo logrado y lo gastado.»
- **Rol (10):** «Diriges la bodega y lees el corte para la PMO.»
- **Visual:** fachada de la bodega en obra (Gemini) con una **lona** grande colgada; sobre la
  lona, gráfica a mano con tres curvas sin nombre que se distinguen **por trazo** (continua,
  guiones, puntos) y una línea vertical «Fecha de corte». Tres etiquetas de tela para
  colgar: PV, EV, AC.
- **Ítems (6, en orden progresivo):**

| # | Consigna | Clave | Retro si falla |
|---|---|---|---|
| 1 | «Pon a cada curva su nombre.» (6) | Continua que llega a 1.200 = PV · guiones, la más baja al corte = EV · puntos, en medio al corte = AC | PV: «La planeada sigue la línea base hasta 1.200.» · EV: «El valor ganado mide trabajo hecho a precio presupuestado: 300.» · AC: «El costo real es lo gastado: 375, más que lo ganado.» |
| 2 | «¿Cuánto valor se ganó al corte?» (6). Dato: «Terminados los estudios (150) y el 75 % de los cimientos (200).» | 300 | «EV = 150 + 75% de 200 = 150 + 150 = 300.» |
| 3 | «Calcula la variación del costo (CV).» (6) | −75 | «CV = EV − AC = 300 − 375 = −75.» |
| 4 | «Calcula la variación del cronograma (SV).» (6) | −100 | «SV = EV − PV = 300 − 400 = −100.» |
| 5 | «Cuelga en cada variación lo que significa.» (7). Etiquetas: Sobre el costo · Bajo el costo · Atrasado · Adelantado | CV → Sobre el costo · SV → Atrasado | CV: «CV negativa: gastaste más de lo que vale lo hecho.» · SV: «SV negativa: hiciste menos de lo planeado.» |
| 6 | «Al terminar la bodega, ¿cuánto valdrá la SV?» (8). Apuesta: 0 / −100 / No se sabe | 0 | −100: «Al final todo lo planeado ocurrió: la SV vuelve a cero.» · No se sabe: «Al terminar, EV iguala a PV: la SV es cero.» |

  Revelar del 6: la lona avanza al mes 12 y las curvas PV y EV se juntan en 1.200.
- **Subtemas:** `gp07-evm` (1–2), `gp07-variaciones` (3–6). Ítem más largo: el dato del 2.

### H09 · Dos termómetros (`gp-c07-h09-termometros`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (19):** «La PMO pide los índices del corte del mes 4: valor planificado 400,
  valor ganado 300, costo real 375.»
- **Rol (10):** «Diriges la bodega y presentas los índices a la PMO.»
- **Visual:** dos termómetros de pared grandes ilustrados (Gemini), **CPI** y **SPI**, con
  una marca en 1,0 («en el plan»); encima, flecha ▲ «mejor que el plan»; debajo, flecha ▼
  «peor que el plan» (forma y texto, no solo color). Al escribir el valor, la columna sube
  o baja hasta él. El perro (PMO) anota.
- **Etapa 1 · Consigna (7):** «Calcula los dos índices de la bodega.»

| Índice | Clave | Retro si falla | Retro si lo invierte |
|---|---|---|---|
| CPI | 0,80 | «CPI = EV / AC = 300 / 375 = 0,80.» | (1,25) «Lo invertiste: el EV va arriba y el AC abajo.» |
| SPI | 0,75 | «SPI = EV / PV = 300 / 400 = 0,75.» | (1,33) «Invertido: el SPI es EV sobre PV.» |

  - Micro. Consigna (7): «Lee el CPI de 0,80 en palabras.» Opciones: **«Por cada peso
    gastado se ganaron 80 centavos de trabajo»** ✓ / «Va 80 % adelantado» / «Ahorró 20 %».
    Retros: «El CPI mide costo, no avance del cronograma.» · «Menor que 1 es sobre el
    costo, no ahorro.»
- **Etapa 2 · Consigna (7):** «Clasifica cada obra según sus dos índices.» Contexto (15):
  «La PMO compara la bodega con las otras obras del programa en el mismo corte.»
  - **Visual:** los dos termómetros se acuestan y forman los ejes de un tablero 2 × 2:
    Bajo el costo y adelantada · Bajo el costo y atrasada · Sobre el costo y adelantada ·
    Sobre el costo y atrasada. Cada obra es una tarjeta con PV / EV / AC.

| Obra | PV / EV / AC | CPI · SPI | Cuadrante | Retro si se equivoca |
|---|---|---|---|---|
| Bodega de Santa Marta | 400 / 300 / 375 | 0,80 · 0,75 | Sobre el costo y atrasada | «EV menor que AC y que PV: ambos índices bajo 1.» |
| Tienda de Barranquilla | 100 / 80 / 64 | 1,25 · 0,80 | Bajo el costo y atrasada | «Gasta poco, pero hizo menos de lo planeado.» |
| Tienda de Cartagena | 100 / 120 / 150 | 0,80 · 1,20 | Sobre el costo y adelantada | «Avanzó más de lo planeado, pero gastando de más.» |
| Ruta de distribución | 50 / 60 / 48 | 1,25 · 1,20 | Bajo el costo y adelantada | «EV supera a AC y a PV: ambos índices sobre 1.» |

  - Micro final. Consigna (6): «¿Qué índice mira primero la PMO?» **CPI** ✓ / SPI. Retro de
    SPI: «El CPI es la métrica más crítica del valor ganado.»
- **Subtema:** `gp07-variaciones`. Celular: el tablero 2 × 2 a 320 px con cuadrantes de
  140 × 120 px y el nombre del cuadrante escrito dentro.

### H10 · El telescopio del final (`gp-c07-h10-telescopio`, Difícil, 50 × 3 = 150 FP × %)
- **Contexto (22):** «Con CPI 0,80 y SPI 0,75, la patrocinadora pregunta cuánto costará la
  bodega al final. Cada causa del desvío cambia la respuesta.»
- **Rol (8):** «Diriges la bodega y pronosticas el costo final.»
- **Visual:** telescopio de bronce (Gemini) en la azotea de la bodega en obra, apuntando a
  un letrero lejano «Fin de obra» donde aparece la cifra pronosticada. Al lado, una placa
  fija con los datos: BAC 1.200 · PV 400 · EV 300 · AC 375 · CPI 0,80 · SPI 0,75. Cuatro
  **tarjetas de fórmula** se arrastran al ocular. La panda espera la cifra.
- **Etapa 1 · Consigna (8):** «Encaja la fórmula que corresponde a cada causa.»

| Causa | Fórmula | Retro si encaja otra |
|---|---|---|
| «Una tormenta única encareció la obra; lo que falta irá según presupuesto.» | EAC = AC + (BAC − EV) | «Si el desvío fue único, lo restante va a tasa presupuestada.» |
| «El acero subió y seguirá caro todo el proyecto.» | EAC = BAC / CPI | «Si el CPI de hoy seguirá, se divide el BAC por el CPI.» |
| «El atraso obliga a horas extra: costo y cronograma pesan juntos.» | EAC = AC + (BAC − EV) / (CPI × SPI) | «Si CPI y SPI influyen en lo que falta, se usan ambos.» |
| «El plan ya no sirve: el equipo reestima lo que falta en 1.000.» | EAC = AC + ETC ascendente | «Si el plan inicial ya no vale, se reestima desde abajo.» |

- **Etapa 2 · Consigna (6):** «Calcula la EAC de cada causa.» El telescopio enfoca y el
  letrero muestra la cifra.

| Causa | Clave | Retro si falla |
|---|---|---|
| Tormenta | 1.275 | «375 + (1.200 − 300) = 375 + 900 = 1.275.» |
| Acero | 1.500 | «1.200 / 0,80 = 1.500.» |
| Horas extra | 1.875 | «CPI × SPI = 0,60; 900 / 0,60 = 1.500; más 375.» |
| Reestimación | 1.375 | «AC + ETC ascendente = 375 + 1.000 = 1.375.» |

- **Etapa 3 · La patrocinadora toma el caso del acero (EAC 1.500).** Consigna (9):
  «Calcula lo que falta gastar y la variación final.»

| Cifra | Clave | Retro si falla |
|---|---|---|
| ETC | 1.125 | «ETC = EAC − AC = 1.500 − 375 = 1.125.» |
| VAC | −300 | «VAC = BAC − EAC = 1.200 − 1.500 = −300.» |

  - Micro 1. Consigna (6): «¿Qué significa una VAC de −300?» Opciones: **«Terminará 300
    millones sobre el presupuesto»** ✓ / «Sobran 300 millones» / «Va 300 días atrasada».
    Retros: «Negativa significa déficit: terminará por encima del BAC.» · «La VAC está en
    dinero, no en días.»
  - Micro 2. Contexto (11): «La patrocinadora dice: “Supón que lo que falta saldrá según
    presupuesto”.» Consigna (6): «¿Qué necesitas para aceptar ese supuesto?» Opciones:
    **«Un análisis de riesgos que lo respalde»** ✓ / «Nada, es lo más optimista» / «Una
    firma de la PMO». Retros: «Con desempeño malo, suponer mejora exige respaldo de
    riesgos.» · «La guía pide un análisis de riesgos, no una firma.»
- **Subtema:** `gp07-pronosticos`. Puntaje: aciertos al primer intento / 12 ítems. Ítem más
  largo: «Una tormenta única encareció la obra; lo que falta irá según presupuesto.»

### H11 · La rampa del montacargas (`gp-c07-h11-rampa`, Difícil, 50 FP × %)
- **Contexto (14):** «La patrocinadora insiste: “Termina con los 1.200 aprobados”. Llevas
  gastados 375 y ganados 300.»
- **Rol (10):** «Diriges la bodega y mides qué tan cuesta arriba queda.»
- **Visual:** montacargas ilustrado (Gemini) al pie de una **rampa ajustable** de metal que
  lleva a un letrero «Meta». La inclinación de la rampa es el TCPI (a mano, montada sobre la
  rampa ilustrada): plana en 1,0; sube si es mayor que 1; baja si es menor. Debajo, texto
  fijo según el valor: «más difícil» / «igual» / «más fácil». La panda espera en la meta.
- **Ítems (7, en orden):**

| # | Consigna | Clave | Retro si falla |
|---|---|---|---|
| 1 | «Calcula el trabajo que falta (BAC − EV).» (8) | 900 | «1.200 − 300 = 900 de trabajo por ganar.» |
| 2 | «Calcula los fondos que quedan (BAC − AC).» (8) | 825 | «1.200 − 375 = 825 por gastar.» |
| 3 | «¿La rampa subirá o bajará?» (5). Apuesta: Sube / Baja / Plana | Sube | Baja: «Queda más trabajo que fondos: la rampa sube.» · Plana: «Solo sería plana con TCPI igual a 1.» |
| 4 | «Calcula el TCPI para cumplir el BAC.» (7) | 1,09 | «900 / 825 = 1,09: hay que rendir más que el plan.» |
| 5 | «Calcula el TCPI con la EAC aprobada de 1.500.» (9) | 0,80 | «900 / (1.500 − 375) = 900 / 1.125 = 0,80.» |
| 6 | «¿Por qué ahora la rampa baja?» (6) Opciones: Hay más fondos para lo que falta / El equipo mejoró / Bajó el trabajo restante | Hay más fondos | Equipo: «El desempeño no cambió; cambió la meta de fondos.» · Trabajo: «El trabajo restante sigue en 900.» |
| 7 | «En el TCPI, ¿mayor que 1 es bueno?» (8) Sí / No | No | «Al revés que el CPI: en TCPI, mayor que 1 es más difícil.» |

  Revelar tras 4: la rampa se empina y el montacargas sube despacio. Tras 5: la rampa
  baja y sube rápido.
- **Subtema:** `gp07-tcpi`. Celular: la rampa ocupa el 45 % del alto a 320 px; el valor del
  TCPI va escrito sobre la rampa.

### H12 · El libro de costos del practicante (`gp-c07-h12-libro`, Difícil, 50 FP × %)
Repaso que ataca las confusiones de la ficha.
- **Contexto (22):** «El practicante redactó el informe mensual de costos de la bodega.
  Antes de enviarlo a la junta, la PMO te pide revisarlo.»
- **Rol (9):** «Eres director(a) y revisas el informe antes de firmarlo.»
- **Consigna (7):** «Toca las frases con error y corrígelas.»
- **Visual:** libro de contabilidad de tapas duras (Gemini) abierto a doble página; el
  texto es HTML encima. El hurón (Practicante) espera a un lado y el perro (PMO) al otro.
  Frase con error tocada: se tacha y aparecen 3 correcciones; la buena se escribe a mano.
  Frase correcta tocada: se subraya en gris con su retro (cuenta como error de puntaje).
- **Partida:** 6 frases (3 con error, 3 correctas), sorteadas del banco de 10.

| Frase | ¿Error? | Corrección buena | Correcciones distractoras (retro) |
|---|---|---|---|
| «CV = AC − EV = 375 − 300 = +75: vamos bien.» | Sí | «CV = EV − AC = −75: sobre el costo.» | «CV = PV − AC = +25» → «La CV compara lo ganado con lo gastado, no lo planeado.» · «CV = EV − PV = −100» → «Esa resta es la SV, no la CV.» |
| «Un CPI de 0,80 indica que gastamos menos de lo planeado.» | Sí | «CPI menor que 1: costo superior al planeado.» | «CPI de 0,80: vamos 20 % adelantados» → «El CPI mide costo, no cronograma.» · «CPI de 0,80: es neutro» → «Neutro sería exactamente 1,0.» |
| «La reserva de gestión de 80 está incluida en la línea base de 1.200.» | Sí | «La línea base no incluye la reserva de gestión.» | «Está incluida en el BAC» → «El BAC es la línea base: tampoco la incluye.» · «Está dentro de la contingencia» → «Son reservas distintas: riesgos identificados frente a no previstos.» |
| «El informe ya incluye la terraza, aunque su cambio no está aprobado.» | Sí | «Sacar del informe los cambios no aprobados.» | «Dejarla con nota de pendiente» → «Los cambios no aprobados no van en los informes de costos.» · «Aprobarla tú mismo» → «El aumento solo se aprueba en el control integrado de cambios.» |
| «Gastamos menos que el mes pasado: el costo está controlado.» | Sí | «Sin compararlo con el trabajo hecho, el gasto solo no dice nada.» | «Gastamos menos que el PV: está controlado» → «Falta el EV: el gasto se compara con lo ganado.» · «Está controlado si el AC baja» → «Menos gasto puede ser menos avance; se mira EV frente a AC.» |
| «La SV será cero cuando la bodega se termine.» | No | — | «Correcta: al final, todo lo planeado ya ocurrió.» |
| «El CPI es la métrica más crítica del valor ganado.» | No | — | «Correcta: así lo considera la guía.» |
| «Una CV negativa suele ser difícil de recuperar.» | No | — | «Correcta: por eso se vigila desde el primer corte.» |
| «Usar la reserva de gestión exige aprobar un cambio a la línea base.» | No | — | «Correcta: el monto pasa a la línea base con aprobación.» |
| «Con cronograma ganado, ES − AT mayor que 0 significa adelanto.» | No | — | «Correcta: es la variación del cronograma con cronograma ganado.» |

- **Cierre (11):** «Firmas el informe: CV −75, CPI 0,80, EAC 1.500, VAC −300.»
- **Subtemas:** `gp07-variaciones`, `gp07-reservas`, `gp07-control`,
  `gp07-cronograma-ganado` (cada frase lleva el suyo en el archivo de datos).

---

## 3. Objetos para Gemini (paso 6), por pieza

Pedir con la guía de estilo (contorno, paleta Planck, sin texto en la imagen; el texto lo
pone la interfaz). Fondo croma para recortar. Ninguno repite los de c1-c2 §3.

H01 mueble planero de madera con 7 cajones, fichas sueltas · H02 mesa de dibujo vista
desde arriba, foto enmarcada de bodega, plano cuadriculado, pila de cajas de madera,
tres torres de monedas, maqueta de bodega · H03 calculadora de mesa con rollo de papel,
fichas apilables · H04 embudo metálico grande, etiqueta colgante · H05 patio de obra con
valla, pila de ladrillos, barril pequeño con grifo, barril grande con grifo y candado, llave ·
H06 polea de obra con gancho y cuerda, bloques de madera · H07 lámina de papel milimetrado en caseta de obra, 4 escalones de
madera, edificio de banco · H08 fachada de bodega en obra con lona colgada, etiquetas de tela · H09 dos
termómetros de pared · H10 telescopio de bronce, azotea de bodega en obra, letrero lejano,
placa de datos · H11 montacargas, rampa metálica ajustable, letrero de meta · H12 libro de
contabilidad de tapas duras abierto.

Situaciones de mascotas nuevas (chat «Chibi Fox Model Sheet»): zorro director con casco
blanco de obra y tableta · panda patrocinadora abriendo un candado · hámster con casco
enganchando un bloque en la polea · hámster leyendo un rollo de papel · perro PMO anotando
junto a un termómetro · hurón practicante con un libro contable.

**Ids de imagen (lote de imágenes 3):** H01 → planero-siete, ficha-madera (ya existía) · H02 → mesa-dibujo, foto-bodega, plano-cuadriculado, cajas-madera, pila-monedas (macro: /macro2026/ilustrados/pila-monedas.webp), maqueta-bodega · H03 → sumadora (ya existía), ficha-domino (ya existía) · H04 → embudo, ficha-colgante (ya existía) · H05 → patio-obra, pila-ladrillos, barril-grifo, barril-candado, llave (ya existía) · H06 → polea-obra, bloque-madera (ya existía) · H07 → papel-milimetrado, caseta-obra (ya existía), escalones-madera, edificio-banco · H08 → bodega-lona, etiqueta-tela · H09 → termometro-pared · H10 → telescopio, azotea-obra, cartel-obra (ya existía), placa-datos · H11 → montacargas, rampa-metalica, letrero-meta · H12 → libro-contable. Archivos en `public/gestion-proyectos/ilustrados/<id>.webp` salvo los marcados «macro»; «pendiente» = aún sin imagen (la pieza usa la provisional).

## 4. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Todo concepto y fórmula rastreable a la ficha (pp. 231–271). Cifras del escenario declaradas como criterio de Gen (§0); lectura de la VAC tomada de su definición porque esa casilla de la tabla 7-1 llegó desordenada (ficha). Sin clichés. |
| D1 Cobertura | Avanzado | Los 14 subtemas `gp07-…` tienen al menos un ítem; los 4 procesos y todas las fórmulas del EVM (PV, EV, AC, BAC, CV, SV, CPI, SPI, 4 EAC, ETC, VAC, 2 TCPI) se ejercitan con números. |
| D2 Nivel cognitivo | Avanzado | Reconocer (H01, H02), aplicar y calcular (H03–H09), analizar y elegir procedimiento (H10, H11), evaluar (H12). |
| D3 Retroalimentación | Avanzado | Retro específica por ítem; en cálculos, la operación completa con las cifras del caso; en H09, retro propia para el error de invertir el cociente. |
| D4 Interacción con sentido | Avanzado | Cada acción mueve algo que significa el concepto: la valla separa reservas, la torre sube por niveles, el escalón cubre la curva, la rampa se inclina con el TCPI. |
| D5 Marca | Avanzado | Tokens Planck; coral solo error. |
| D6 Sin plantillas | Avanzado | Ninguna retro genérica. |
| D7 Celular | Avanzado (a medir) | Ítems largos señalados por pieza; teclado numérico propio de 48 px. |
| D8 Rejugabilidad | Medio–Avanzado | Bancos mayores que la partida en H01 (9→7), H02 (8 con sorteo de orden), H05 (7→6), H12 (10→6). Las piezas de cálculo repiten cifras porque el capítulo usa un solo caso: Medio en rejugabilidad, permitido para material teórico. |
| D9 Gancho visual | Avanzado | 12 objetos protagonistas distintos (§3), ninguno de c1-c2. |
| D11 Consistencia | Avanzado | Un solo caso (la bodega) con las mismas cifras en las 12 piezas y en el Aprender. |
| D13 Consigna | Avanzado | Verbos de acción, ≤ 10 palabras en todas. |

## 5. Conteo de palabras (consignas ≤ 12)

Contado con script sobre este archivo (palabras separadas por espacio; signos y cifras
cuentan como palabra).
H01 8 / 7, 5, 6 · H02 8 · H03 8, 8 / 8, 4, 8 · H04 9, 9 / 10 · H05 8 / 8, 9, 6, 9 · H06 7 / 9 / 8 ·
H07 7 / 7, 8, 7 · H08 6, 6, 6, 6, 7, 8 · H09 7 / 7, 7, 6 · H10 8 / 6 / 9, 6, 6 · H11 8, 8, 5, 7, 9,
6, 8 · H12 7. Contextos ≤ 22; roles ≤ 10; retros ≤ 15 (la más larga: 14).

## 6. Conexión con Jane

Misma regla de los dos pasos que `../conexion-jane.md`: el Aprender deja entendido el
concepto o el documento con la bodega de Santa Marta y las mismas cifras de §0; el Hacer lo
ejercita ese día. Se propone que Jane haga los **documentos clave del área como
simuladores** y que los Hacer los retomen tal cual (mismo objeto, mismos datos).

| Aprender (Jane) | Qué deja entendido | Simulador propuesto (documento clave) | Hacer que lo ejercitan |
|---|---|---|---|
| `gp-c07-a01` Cómo se planea y estima el costo | Plan de gestión de los costos; análoga, paramétrica, ascendente, tres valores; ROM y rango definitivo; base de las estimaciones | **Hoja de estimación de la bodega**: el estudiante cambia la técnica por paquete y ve la cifra y su rango | `gp-c07-h01-plan-costos`, `gp-c07-h02-metodos`, `gp-c07-h03-tres-valores`, `gp-c07-h04-embudo` |
| `gp-c07-a02` Del presupuesto a la curva S | Reservas (contingencia vs. gestión), agregación, línea base, presupuesto, curva S, financiamiento en escalones, conciliación | **Línea base de costos armable**: se suben paquetes y reservas, y la curva S y los escalones se dibujan solos | `gp-c07-h05-reservas`, `gp-c07-h06-polea`, `gp-c07-h07-curva-s` |
| `gp-c07-a03` Valor ganado: tres curvas | PV, EV, AC, BAC; CV, SV; CPI, SPI y su lectura | **Tablero de valor ganado**: deslizadores de % completado y gasto que mueven las tres curvas y los dos índices | `gp-c07-h08-lona`, `gp-c07-h09-termometros` |
| `gp-c07-a04` Pronósticos y TCPI | Las 4 EAC y cuándo usar cada una; ETC; VAC; TCPI con BAC y con EAC; informe de desempeño | **Informe mensual de costos**: se elige el supuesto de pronóstico y el informe recalcula EAC, ETC, VAC y TCPI | `gp-c07-h10-telescopio`, `gp-c07-h11-rampa`, `gp-c07-h12-libro` |

En pantalla: el Aprender termina con «Practícalo» hacia su primer Hacer; el Hacer arranca
con «Viene de: …» y no bloquea (igual que `../conexion-jane.md`). Si Jane cambia una cifra
de la bodega, se cambia en `datos/c07-bodega.json` y ambos quedan iguales.
