# Gestión de Proyectos · Capítulo 8 (Gestión de la Calidad) — los Hacer diarios (Gen, 2026-11-27)

Fuente única: `../fichas/c08-calidad.md` (Guía del PMBOK 6.ª ed., pp. 271–307). Ids de
piezas: `gp-c08-hMM-…`; subtemas `gp08-…`. Los Aprender los hace Jane: conexión en §6.

## 0. Reglas comunes y datos del capítulo

- **Valen todas las reglas de `c1-c2-hacer.md` §0** (formato diario de 3 a 5 min, mundo
  Altamira, elenco, paso 6, límites de texto, arrastre común, puntaje, celular 320/375,
  claves «criterio de Gen»). No se repiten aquí.
- **Hilo del capítulo: la nueva línea de café en cápsulas** de la planta empacadora de
  Altamira en Manizales. El estudiante es el director(a) del proyecto de la línea. El
  **cliente** es una cadena de supermercados (conejo, rol escrito «Cliente»). La
  selladora, los proveedores y la otra planta de referencia **no son mascotas**: son
  objetos o voces en globo.
- **Elenco que aparece:** zorro (Tú) en todas · conejo (Cliente) H01, H12 · panda
  (Patrocinadora) H02, H04 · gato (Gerente funcional de la planta) H01, H03, H05 · hámster
  (Equipo) H06, H07, H11 · perro (PMO, en el papel de auditor) H10 · hurón (Practicante)
  H07, H09.
- **Datos fijos de la línea** (criterio de Gen; viven en `datos/c08-capsulas.json`, los
  mismos que usa el Aprender de Jane): peso de café por cápsula pedido por el cliente
  **5,0 a 6,0 g** (límites de especificación); límites de control calculados del proceso
  **5,2 y 5,8 g**; media 5,5 g. Hoja de verificación de 4 días (H07): sello incompleto 3 ·
  2 · 4 · 2 = 11; peso bajo 2 · 3 · 1 · 2 = 8; abollada 1 · 1 · 2 · 1 = 5; tapa mal
  impresa 1 · 0 · 1 · 1 = 3; sin filtro 0 · 1 · 0 · 1 = 2; fecha de lote errónea
  0 · 0 · 1 · 0 = 1; total 30.
- **Pareto:** la guía no lo menciona (ver ficha). Donde se ordenan defectos por causa se
  dice «histograma de causas».

## 1. Plan y calendario

Días contados dentro del capítulo 8.

| Día | id | Nombre | Mecánica | Subtemas | Dific. | FP | Aprender previo (Jane) |
|---|---|---|---|---|---|---|---|
| 1 | gp-c08-h01-gondola | La góndola de las cápsulas | Clasificar en matriz 2 × 2 + marcar problemas (2 etapas) | gp08-calidad-grado | Fácil | 10 × 2 = 20 × % | c08-A01 |
| 2 | gp-c08-h02-cubetas | Las cuatro cubetas | Clasificar en 4 recipientes + predecir (2 etapas) | gp08-coq | Medio | 25 × 2 = 50 × % | c08-A01 |
| 3 | gp-c08-h03-ascensor | El ascensor de cinco pisos | Ordenar en altura + clasificar (2 etapas) | gp08-niveles, gp08-prevencion | Fácil | 10 × 2 = 20 × % | c08-A01 |
| 4 | gp-c08-h04-plano | El plano de la cápsula | Completar documento + emparejar métricas (2 etapas) | gp08-planificar | Medio | 25 × 2 = 50 × % | c08-A02 |
| 5 | gp-c08-h05-casilleros | Tres casilleros | Clasificar en 3 contenedores + micro (2 etapas) | gp08-panorama, gp08-gestionar, gp08-controlar | Medio | 25 × 2 = 50 × % | c08-A02 |
| 6 | gp-c08-h06-espina | La espina de pescado | Construir diagrama + cadena de porqués (2 etapas) | gp08-herramientas, gp08-gestionar | Medio | 25 × 2 = 50 × % | c08-A03 |
| 7 | gp-c08-h07-hoja | La hoja de anotaciones | Anotar en vivo + sumar + armar histograma (2 etapas) | gp08-controlar, gp08-herramientas | Medio | 25 × 2 = 50 × % | c08-A03 |
| 8 | gp-c08-h08-monitor | La pantalla de la selladora | Rotular límites + leer diagrama y decidir (2 etapas) | gp08-diagrama-control, gp08-prevencion | Difícil | 50 × 2 = 100 × % | c08-A03 |
| 9 | gp-c08-h09-tablero | El tablero de herramientas | Emparejar pregunta-herramienta | gp08-herramientas, gp08-controlar, gp08-planificar | Medio | 25 × % | c08-A03 |
| 10 | gp-c08-h10-auditoria | La credencial del auditor | Escenario con decisiones y consecuencias | gp08-auditorias | Medio | 25 × % | c08-A04 |
| 11 | gp-c08-h11-cadena | La cadena de la solución | Ordenar + asignar fases + elegir la X (3 etapas) | gp08-mejora | Medio | 25 × 3 = 75 × % | c08-A04 |
| 12 | gp-c08-h12-despacho | Las seis cortinas de despacho | Taller: despachar salidas + retrospectiva + micro (3 etapas) | gp08-controlar, gp08-tendencias | Difícil | 50 × 3 = 150 × % | c08-A04 |

**Variedad:** 12 piezas, 11 mecánicas principales distintas. Con selección entre opciones
como mecánica principal **solo 1** (H10) ≤ 12/5, y mueve algo en escena (el plano de la
planta se ilumina zona por zona). **Gancho visual propio** en cada una (góndola, cubetas,
ascensor, plano despiezado, casilleros, esqueleto de pescado, mesa de inspección, monitor de
la selladora, tablero perforado, credencial y plano de planta, cadena y molino, cortinas
de despacho); ninguno repite los de c1-c2 §3, los de c07 §3 ni los de c03–c06 y c09–c12
que estaban escritos al cerrar este archivo (revisado con búsqueda).

**Respaldo:** todas son **práctica de recuperación** con retro inmediata y específica
(Roediger y Karpicke). H01, H05 y H08 contrastan pares que se confunden (calidad/grado,
gestionar/controlar, control/especificación): **práctica intercalada** y **contraste de
conceptos vecinos**. H06, H07 y H08 hacen que el estudiante **use la herramienta** en vez
de nombrarla (aprendizaje activo, principio de Mayer de manipulación). H10 = **aprendizaje
basado en casos** con consecuencias. H12 es **transferencia** con todo el capítulo. La
elección exacta de cada mecánica es criterio propio sobre esa base.

**Dificultad progresiva:** de distinguir conceptos (H01–H03) a ubicar en procesos (H04,
H05), usar herramientas (H06–H09) y decidir e integrar (H10–H12).

---

## 2. Especificación pieza por pieza

### H01 · La góndola de las cápsulas (`gp-c08-h01-gondola`, Fácil, 10 × 2 = 20 FP × %)
- **Contexto (19):** «La cadena de supermercados quiere dos líneas de cápsulas: una básica y
  una premium con más sabores y aroma.»
- **Rol (9):** «Diriges el proyecto de la nueva línea de cápsulas.»
- **Etapa 1 · Consigna (11):** «Pon cada lote de prueba en su casilla de la góndola.»
  - **Visual:** góndola de supermercado ilustrada (Gemini) con **cuatro casillas**. Eje
    horizontal «Grado»: Básica (bajo) · Premium (alto). Eje vertical «Calidad»: Cumple los
    requisitos · No cumple. Cada casilla lleva su nombre escrito. El conejo (Cliente) mira
    la góndola; el gato (Gerente funcional de la planta) trae los lotes. Acierto: la
    cápsula se acomoda en el estante y la casilla muestra ✓.

| Lote | Casilla | Retro si se equivoca |
|---|---|---|
| «Básica, un sabor, ninguna falla en 500 pruebas.» | Básica · Cumple | «Pocas funciones, pero sin defectos: bajo grado, alta calidad.» |
| «Básica con sello perfecto en todas las pruebas.» | Básica · Cumple | «Grado bajo no es defecto: cumple lo pedido.» |
| «Premium, cinco sabores, sin fallas.» | Premium · Cumple | «Más funciones y además cumple los requisitos.» |
| «Premium con empaque de lujo y peso siempre correcto.» | Premium · Cumple | «Alto grado que cumple: alta calidad.» |
| «Premium, cinco sabores; una de cada diez se filtra.» | Premium · No cumple | «Muchas funciones con muchos defectos: alto grado, baja calidad.» |
| «Premium con aroma extra que se pierde en una semana.» | Premium · No cumple | «Promete más, pero no cumple lo prometido: baja calidad.» |
| «Básica que se atasca en la cafetera.» | Básica · No cumple | «Pocas funciones y además no cumple: baja calidad.» |
| «Básica con la fecha de lote mal impresa en la mitad.» | Básica · No cumple | «Un defecto de rotulado es incumplir un requisito.» |

  Partida: 6 (al menos una por casilla).
- **Etapa 2 · Consigna (7):** «Toca las casillas que son un problema.» Clave: las dos de
  «No cumple». Retros: si toca Básica · Cumple: «Bajo grado puede servir para uso general:
  no es problema.» · si deja Premium · No cumple: «Alto grado con baja calidad siempre es un
  problema.» · si deja Básica · No cumple: «No cumplir requisitos siempre es problema, sea
  cual sea el grado.»
  - Micro. Contexto (17): «El gerente de la planta dice: “La básica es de mala calidad
    porque tiene un solo sabor”.» Consigna (2): «¿Tiene razón?» Sí / **No**. Retro de «Sí»:
    «Un sabor es grado bajo; calidad es cumplir los requisitos.»
- **Cierre (10):** «Calidad es cumplir requisitos; grado es cuántas características
  técnicas tiene.»
- **Subtema:** `gp08-calidad-grado`. Celular: la góndola 2 × 2 a 320 px con casillas de
  140 × 110 px; el nombre de cada eje va escrito, no solo el color.

### H02 · Las cuatro cubetas (`gp-c08-h02-cubetas`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (18):** «La patrocinadora quiere saber cuánto cuesta la calidad de la línea de
  cápsulas. Llegan facturas de todo tipo.»
- **Rol (9):** «Diriges la línea y ordenas los costos de calidad.»
- **Etapa 1 · Consigna (11):** «Echa cada factura en su cubeta del costo de la calidad.»
  - **Visual:** estante metálico de dos pisos (Gemini) con **cuatro cubetas apilables**
    grandes de la planta.
    Piso de arriba, rotulado **Conformidad**: Prevención · Evaluación. Piso de abajo,
    **No conformidad**: Fallas internas · Fallas externas. Cada factura cae doblada en su
    cubeta y la cubeta se llena un nivel. La panda (Patrocinadora) revisa.

| Factura | Cubeta | Retro si se equivoca |
|---|---|---|
| «Curso de la selladora para los operarios.» | Prevención | «Capacitar evita fallas: es costo de prevención.» |
| «Escribir el procedimiento de llenado.» | Prevención | «Documentar procesos previene defectos.» |
| «Comprar una selladora más precisa.» | Prevención | «Los equipos que evitan fallas son prevención.» |
| «Una hora más por turno para hacerlo bien.» | Prevención | «Tiempo para hacerlo correctamente: prevención.» |
| «Pruebas de hermeticidad de cada lote.» | Evaluación | «Probar la conformidad es costo de evaluación.» |
| «Cápsulas que se rompen en la prueba de presión.» | Evaluación | «Pérdida en pruebas destructivas: es evaluación, no falla.» |
| «Salario del inspector de la línea.» | Evaluación | «Inspeccionar es evaluar la calidad.» |
| «Rellenar un lote que salió con poco café.» | Fallas internas | «Retrabajo detectado por el proyecto: falla interna.» |
| «Botar 2.000 cápsulas mal selladas.» | Fallas internas | «Desecho hallado antes de enviar: falla interna.» |
| «Reponer cajas devueltas por el supermercado.» | Fallas externas | «Trabajo en garantía: el cliente encontró la falla.» |
| «El supermercado deja de comprar la premium.» | Fallas externas | «Pérdida de negocio por fallas: costo externo.» |
| «Quejas que aparecen en la encuesta a compradores.» | Fallas externas | «Defectos hallados en encuestas cuentan como falla externa.» |

  Partida: 8 (2 por cubeta).
- **Etapa 2 · Microdesafíos (3):**
  1. Consigna (8): «Toca las cubetas que son costos de conformidad.» Clave: Prevención y
     Evaluación. Retro si toca una falla: «Conformidad es lo que se gasta para evitar
     fallas.»
  2. **Predecir y revelar.** Contexto (11): «El equipo propone duplicar las inspecciones, y
     luego duplicarlas otra vez.» Consigna (4): «¿Siempre compensa seguir invirtiendo?» Sí /
     **No**. Revelar: la cubeta de Evaluación se desborda mientras la de fallas casi
     no baja. Retro de «Sí»: «Hay un costo óptimo: pasado ese punto, más evaluación no
     compensa.»
  3. Consigna (9): «¿Quién suele cuidar este costo cuando el proyecto termina?» Opciones:
     **Operaciones, PMO, programa o portafolio** ✓ / El equipo del proyecto / Nadie.
     Retros: «El proyecto es temporal; el producto sigue con otros.» · «Alguien sí: el
     producto sigue vivo tras el proyecto.»
- **Subtema:** `gp08-coq`. Ítem más largo: «Cápsulas que se rompen en la prueba de presión.»

### H03 · El ascensor de cinco pisos (`gp-c08-h03-ascensor`, Fácil, 10 × 2 = 20 FP × %)
- **Contexto (21):** «La planta discute cómo manejar los defectos de las cápsulas. Hay cinco
  maneras, de la más cara a la más eficaz.»
- **Rol (9):** «Diriges la línea y propones el nivel de calidad.»
- **Etapa 1 · Consigna (10):** «Ordena los cinco niveles, del más caro al más eficaz.»
  - **Visual:** ascensor de carga ilustrado (Gemini) con **cinco pisos** a la vista. El zorro
    y el gato (Gerente funcional) van en la cabina; cada tarjeta se lleva a un piso y el
    ascensor sube. Al completar, el último piso se ilumina.
  - Orden clave: 1 «El cliente encuentra los defectos.» → 2 «Detectar y corregir antes de
    enviar.» → 3 «Corregir el proceso con aseguramiento de calidad.» → 4 «Incorporar la
    calidad en el diseño.» → 5 «Cultura de calidad en toda la organización.»
  - Retro por par invertido: 1/2 «Que el cliente los halle es lo más caro: garantías y
    reputación.» · 2/3 «Corregir defectos sueltos rinde menos que corregir el proceso.» ·
    3/4 «Diseñar con calidad va más allá de corregir el proceso.» · 4/5 «La cultura de
    toda la organización es el nivel más eficaz.»
- **Etapa 2 · Consigna (3):** «¿Prevención o inspección?» Dos puertas del ascensor:
  **Prevención** (evita el error en el proceso) · **Inspección** (evita que llegue al
  cliente).

| Acción | Clave | Retro si se equivoca |
|---|---|---|
| «Calibrar la selladora antes de cada turno.» | Prevención | «Evita que el error ocurra en el proceso.» |
| «Diseñar la cápsula para que no se llene de más.» | Prevención | «La calidad queda incorporada en el diseño.» |
| «Capacitar al turno nuevo antes de empezar.» | Prevención | «Prevenir errores cuesta menos que corregirlos.» |
| «Revisar las cajas antes de despacharlas.» | Inspección | «Evita que el error llegue al cliente.» |
| «Pesar cápsulas al final de la línea.» | Inspección | «Detecta el error ya hecho, antes del cliente.» |
| «Probar el sellado de una muestra del lote.» | Inspección | «Revisa el producto terminado: inspección.» |

  - Micro. Consigna (6): «¿Cuál suele costar menos, en general?» **Prevención** ✓ /
    Inspección. Retro: «Prevenir cuesta mucho menos que corregir lo que halla la
    inspección.»
- **Subtemas:** `gp08-niveles` (etapa 1), `gp08-prevencion` (etapa 2).

### H04 · El plano de la cápsula (`gp-c08-h04-plano`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (18):** «Antes de producir, la patrocinadora pide el plan de gestión de la
  calidad de la línea de cápsulas.»
- **Rol (9):** «Diriges la línea y redactas el plan de calidad.»
- **Etapa 1 · Consigna (8):** «Lleva cada frase a su sección del plan.»
  - **Visual:** plano técnico despiezado de la cápsula (Gemini): tapa, filtro, cuerpo y
    café separados en el aire, con **siete llamadas** que son las secciones del plan:
    Estándares · Objetivos · Roles · Qué se revisa · Actividades · Herramientas ·
    Procedimientos. Al acertar, la pieza de la cápsula encaja en su lugar; con las siete,
    la cápsula queda armada. La panda firma.

| Frase | Sección | Retro si se equivoca |
|---|---|---|
| «Se aplica la norma sanitaria de alimentos envasados.» | Estándares | «Es el estándar de calidad que usará el proyecto.» |
| «Menos de 2 cápsulas defectuosas por cada 1.000.» | Objetivos | «Es una meta: objetivo de calidad del proyecto.» |
| «La ingeniera de calidad firma la liberación de cada lote.» | Roles | «Dice quién responde por la calidad: roles y responsabilidades.» |
| «Se revisan el sellado y el peso de cada lote.» | Qué se revisa | «Lista entregables y procesos sujetos a revisión.» |
| «Inspección diaria y auditoría cada mes.» | Actividades | «Son las actividades de control y de gestión previstas.» |
| «Se usarán hojas de verificación y diagramas de control.» | Herramientas | «Son las herramientas de calidad del proyecto.» |
| «Qué hacer con un lote no conforme.» | Procedimientos | «Abordar la no conformidad es un procedimiento del plan.» |

- **Etapa 2 · Consigna (8):** «Une cada atributo con la forma de verificarlo.» Una métrica
  = atributo + cómo lo verifica Controlar la Calidad. Clave de pares: criterio de Gen
  (la guía da los atributos, no la forma).

| Atributo | Cómo se verifica | Retro si une otro |
|---|---|---|
| «Defectos por cada 1.000 cápsulas.» | «Conteo en la hoja de verificación del lote.» | «Los defectos se cuentan al inspeccionar el lote.» |
| «Peso de café por cápsula.» | «Pesaje de una muestra al azar cada hora.» | «El peso se verifica midiendo una muestra.» |
| «Satisfacción del supermercado.» | «Encuesta trimestral de 1 a 5.» | «La satisfacción se obtiene preguntando al cliente.» |
| «Tiempo de inactividad de la selladora.» | «Minutos de parada registrados cada mes.» | «El tiempo parado se registra en minutos por mes.» |

  - Micro. Consigna (8): «¿Cuándo se fija el tamaño de la muestra?» Opciones: **Al
    planificar la calidad** ✓ / Al inspeccionar cada lote / Cuando el cliente se queje.
    Retros: «Frecuencia y tamaño de muestra se deciden al planificar.» · «Esperar quejas es
    dejar que el cliente halle los defectos.»
- **Subtema:** `gp08-planificar`. Celular: a 320 px las llamadas se listan bajo el plano
  (no alrededor), cada una unida a su pieza por un número.

### H05 · Tres casilleros (`gp-c08-h05-casilleros`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (23):** «Arranca la producción de prueba. Llegan tareas de calidad mezcladas
  y el gerente de la planta pregunta a qué proceso pertenece cada una.»
- **Rol (10):** «Diriges la línea y asignas cada tarea a su proceso.»
- **Etapa 1 · Consigna (9):** «Guarda cada tarea en el casillero de su proceso.»
  - **Visual:** tres casilleros metálicos de vestuario de la planta (Gemini), con casco
    colgado y placa: **Planificar la Calidad** (casco con plano enrollado) · **Gestionar la
    Calidad** (casco con engranaje: el proceso) · **Controlar la Calidad** (casco con
    báscula: el resultado). El casillero se abre al recibir la tarea. El gato (Gerente
    funcional) espera la respuesta.

| Tarea | Proceso | Retro si se equivoca |
|---|---|---|
| «Elegir la norma sanitaria que aplicará.» | Planificar | «Identificar estándares es planificar la calidad.» |
| «Decidir cómo y con qué muestra se inspeccionará.» | Planificar | «Planificar pruebas e inspección va en Planificar.» |
| «Definir la métrica de defectos por cada 1.000.» | Planificar | «Las métricas de calidad salen de Planificar.» |
| «Auditar si el turno sigue el procedimiento de sellado.» | Gestionar | «Revisar el uso de los procesos es gestionar: aseguramiento.» |
| «Cambiar el proceso de sellado para que deje de fallar.» | Gestionar | «Mejorar el proceso es parte de gestionar la calidad.» |
| «Convertir los requisitos en listas de verificación de prueba.» | Gestionar | «Gestionar crea los instrumentos de prueba y evaluación.» |
| «Emitir el informe de calidad con recomendaciones.» | Gestionar | «Los informes de calidad son salida de Gestionar.» |
| «Inspeccionar el lote 12 y anotar los resultados.» | Controlar | «Examinar el producto y registrar es controlar.» |
| «Pesar la muestra del turno contra el requisito.» | Controlar | «Medir resultados contra requisitos es controlar.» |
| «Verificar que la reparación aprobada de la selladora quedó bien.» | Controlar | «Verificar cambios aprobados es tarea de Controlar.» |
| «Entregar las cápsulas verificadas para su aceptación.» | Controlar | «Los entregables verificados salen de Controlar.» |

  Partida: 8 (2 o 3 por casillero).
- **Etapa 2 · Microdesafíos (3):**
  1. Consigna (7): «¿Quién gestiona la calidad en el proyecto?» Opciones: **Todos: tú,
     equipo, patrocinadora, dirección y cliente** ✓ / Solo el área de calidad / Solo tú.
     Retros: «La guía la llama trabajo de todos, no de un área.» · «Diriges, pero
     gestionar la calidad es de todos.»
  2. Consigna (10): «¿Gestionar la calidad es costo de conformidad o de falla?»
     **Conformidad** ✓ / Falla. Retro: «Gestionar evita fallas: es trabajo de conformidad.»
  3. Consigna (9): «¿Gestionar mira sobre todo el proceso o el producto?» **El proceso** ✓
     / El producto terminado. Retro: «El aseguramiento se centra en los procesos;
     controlar mira resultados.»
- **Subtemas:** `gp08-gestionar`, `gp08-controlar`, `gp08-planificar` (cada tarea lleva el
  suyo), `gp08-panorama` (micros).

### H06 · La espina de pescado (`gp-c08-h06-espina`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (20):** «Esta semana salieron muchas cápsulas mal selladas. El equipo reúne
  posibles causas en la sala de juntas de la planta.»
- **Rol (9):** «Diriges la línea y guías el análisis de causas.»
- **Etapa 1 · Consigna (8):** «Cuelga cada causa en su espina del diagrama.»
  - **Visual:** esqueleto de pescado grande ilustrado (Gemini) en la pared; la cabeza dice
    «Cápsulas mal selladas»; seis espinas rotuladas como en el gráfico 8-9: Material ·
    Entorno · Gestión · Personas · Proceso · Equipos. El hámster (Equipo) pega notas
    adhesivas. Acierto: la nota se pega en la espina y la espina se engrosa un poco.
  - **Clave: criterio de Gen** (la guía da las seis ramas; su ejemplo llegó desordenado).

| Causa | Espina | Retro si se equivoca |
|---|---|---|
| «La lámina de aluminio llegó de baja calidad.» | Material | «Es la materia prima: rama Material.» |
| «El filtro viene más delgado de lo pedido.» | Material | «Un insumo fuera de especificación va en Material.» |
| «La sala de empaque tiene mucha humedad.» | Entorno | «Las condiciones del lugar van en Entorno.» |
| «Hace demasiado calor junto a la selladora.» | Entorno | «Es una condición física del sitio: Entorno.» |
| «No hay presupuesto para mantenimiento preventivo.» | Gestión | «Es una decisión de la dirección: Gestión.» |
| «Las metas premian velocidad, no sellos bien hechos.» | Gestión | «Lo que la dirección exige y premia va en Gestión.» |
| «El turno de noche llega cansado.» | Personas | «La fatiga del trabajador va en Personas.» |
| «Nadie capacitó al turno en la selladora nueva.» | Personas | «La falta de capacitación es de Personas.» |
| «El procedimiento fija mal la temperatura de sellado.» | Proceso | «Es el método de trabajo: rama Proceso.» |
| «La selladora tiene poco mantenimiento.» | Equipos | «Es el estado de la máquina: rama Equipos.» |
| «La selladora usa tecnología antigua.» | Equipos | «La tecnología de la máquina va en Equipos.» |

  Partida: 8 (al menos 5 espinas distintas, ninguna con más de 2).
- **Etapa 2 · Consigna (9):** «Pregunta “¿por qué?” hasta llegar a la causa raíz.» Cadena de
  3 pasos; en cada uno, 3 notas para elegir; la elegida se cuelga detrás de la anterior.

| Paso | Nota correcta | Distractores (retro) |
|---|---|---|
| 1 · ¿Por qué salen mal selladas? | «La temperatura de sellado baja de noche.» | «Hay demasiadas cápsulas» → «El volumen no explica por qué falla el sello.» · «El cliente es exigente» → «La exigencia no causa el defecto; busca en el proceso.» |
| 2 · ¿Por qué baja de noche? | «El termostato de la selladora se descalibra.» | «Los operarios no ven bien» → «Ver no cambia la temperatura de la máquina.» · «La lámina es otra de noche» → «Es la misma lámina en todos los turnos.» |
| 3 · ¿Por qué se descalibra? | «No hay plan de mantenimiento preventivo.» | «El termostato es nuevo» → «Uno nuevo también se descalibra sin mantenimiento.» · «Es mala suerte» → «Sin causa no hay solución; sigue preguntando.» |

  - Micro. Consigna (8): «Si eliminas todas las causas raíz, ¿qué pasa?» Opciones: **El
    problema no se repite** ✓ / Bajan un poco los defectos / Hay que inspeccionar más.
    Retros: «Sin causas raíz, el problema no vuelve: no solo baja.» · «Quitar la causa raíz
    evita el defecto; no exige más inspección.»
- **Subtemas:** `gp08-herramientas` (etapa 1), `gp08-gestionar` (etapa 2: análisis de
  causa raíz). Celular: el pescado gira en vertical (cabeza arriba) a 320 px.

### H07 · La hoja de anotaciones (`gp-c08-h07-hoja`, Medio, 25 × 2 = 50 FP × %)
- **Contexto (20):** «Cuarto día de inspección de la línea. Ya hay tres días anotados en la
  hoja; hoy salen siete cápsulas defectuosas.»
- **Rol (9):** «Diriges la línea y llevas el registro de defectos.»
- **Etapa 1 · Anotar y sumar.**
  - **Visual:** mesa de inspección con lámpara de brazo (Gemini) y, sobre ella, una **hoja
    de verificación** grande (filas: los 6 defectos de §0; columnas Día 1 a Día 4 y Total; días 1–3 ya
    llenos) y una bandeja por donde ruedan las cápsulas, una a una, con el defecto visible y
    escrito. Tocar una fila dibuja un palito en el Día 4. El hámster (Equipo) pone las
    cápsulas; el hurón (Practicante) mira la hoja.
  - Consigna (9): «Anota cada cápsula defectuosa en su fila de hoy.» Cápsulas del día 4:
    sello incompleto × 2 · peso bajo × 2 · abollada × 1 · tapa mal impresa × 1 · sin filtro
    × 1. Retro si la anota en otra fila: sello «El borde quedó abierto: es sello
    incompleto.» · peso «Pesa 4,8 g, bajo lo pedido: peso bajo.» · abollada «Tiene el
    cuerpo hundido: va en abollada.» · tapa «El logo salió corrido: tapa mal impresa.» ·
    filtro «Se ve vacía por dentro: le falta el filtro.»
  - Consigna (6): «Suma los totales de cada fila.» Claves 11 · 8 · 5 · 3 · 2 · 1. Retro por
    fila con su suma, p. ej.: «Sello incompleto: 3 + 2 + 4 + 2 = 11.» (las 6 retros siguen
    ese formato con las cifras de §0).
- **Etapa 2 · Consigna (12):** «Arma el histograma de causas, de la más frecuente a la menos.»
  - **Visual:** bloc de papel cuadriculado ilustrado junto a la mesa; seis barras (a mano,
    con datos exactos) que se arrastran para ordenarlas y se estiran hasta su altura.
    Retro si el orden falla: «Ordena por total: sello 11, peso 8, abollada 5…» · si la
    altura falla: «La barra debe medir lo que dice el total de la hoja.»
  - Micro 1. Consigna (4): «¿Qué defecto atacas primero?» **Sello incompleto** ✓ (criterio
    de Gen: el más frecuente). Retro: «Es el más frecuente: 11 de 30 defectos.»
  - Micro 2. Contexto (9): «El practicante llama “lista de verificación” a esta hoja.»
    Consigna (2): «¿Tiene razón?» Sí / **No**. Retro de «Sí»: «La lista comprueba pasos; la
    hoja anota frecuencias de defectos.»
- **Subtemas:** `gp08-controlar` (etapa 1), `gp08-herramientas` (etapa 2). Celular: la
  hoja muestra a 320 px solo la columna Día 4 y Total, con los días 1–3 plegables.

### H08 · La pantalla de la selladora (`gp-c08-h08-monitor`, Difícil, 50 × 2 = 100 FP × %)
- **Contexto (22):** «Cada cápsula debe llevar entre 5,0 y 6,0 gramos de café, según el
  cliente. La selladora grafica el peso de cada muestra.»
- **Rol (10):** «Diriges la línea y vigilas si el proceso es estable.»
- **Visual:** selladora ilustrada (Gemini) con un **monitor industrial** grande; en la
  pantalla, el diagrama de control a mano con datos exactos: cuatro líneas horizontales
  (6,0 · 5,8 · 5,2 · 5,0), la media 5,5 y los puntos de las muestras. Las líneas se
  distinguen por trazo y llevan su cifra escrita. El gato (Gerente funcional) mira.
- **Etapa 1 · Límites y términos (10 ítems).**
  - Consigna (10): «Pon el nombre a cada una de las cuatro líneas.» Etiquetas: Límite
    superior de especificación · Límite superior de control · Límite inferior de control ·
    Límite inferior de especificación. Retros: 6,0 «El 6,0 lo fija el cliente: es
    especificación.» · 5,8 «El 5,8 sale del cálculo del proceso: es control.» · 5,2
    «Calculado del proceso estable: límite inferior de control.» · 5,0 «El mínimo que pide
    el cliente: límite de especificación.»
  - Consigna (6): «Lleva cada definición a su término.» «Rango de resultados aceptables» →
    **Tolerancia** (retro: «El rango aceptable para el resultado es la tolerancia.») ·
    «Frontera de la variación normal del proceso» → **Límite de control** (retro: «La
    variación normal de un proceso estable la marca el control.»)
  - Consigna (6): «¿Muestreo por atributos o por variable?» «Peso en gramos» → Variable ·
    «Temperatura en grados» → Variable · «Sella o no sella» → Atributos · «Tapa bien impresa:
    sí o no» → Atributos. Retros: variable «Se mide en una escala continua: por variable.»
    · atributos «Solo conforme o no conforme: por atributos.»
- **Etapa 2 · Consigna (8):** «Lee la pantalla de cada turno y decide.» Tres botones-palanca
  en la selladora: **Seguir: proceso estable** · **Investigar: fuera de control, aunque
  cumple** · **Separar las no conformes e investigar**. Al decidir, la pantalla muestra la
  consecuencia (la línea sigue; se enciende una baliza; se aparta una caja).

| Turno (lo que muestra la pantalla) | Clave | Retro de las otras |
|---|---|---|
| A · Todos los puntos entre 5,2 y 5,8 | Seguir | Investigar: «Todo cae dentro de los límites de control: proceso estable.» · Separar: «Todo cumple la especificación: no hay qué separar.» |
| B · Un punto en 5,9 | Investigar | Seguir: «Salió de los límites de control: el proceso no está estable.» · Separar: «5,9 cumple el requisito; el aviso es del proceso.» |
| C · Un punto en 6,1 | Separar e investigar | Seguir: «6,1 supera la especificación: esa cápsula no cumple.» · Investigar: «Además de investigar, esa cápsula no cumple el requisito.» |

  - Micro final. Consigna (10): «¿Sirve un diagrama de control para la variación del
    costo?» **Sí** ✓ / No. Retro de «No»: «También sirve para costo, cronograma y cambios de
    alcance.»
- **Subtemas:** `gp08-diagrama-control`, `gp08-prevencion` (términos y muestreo). La guía
  no da reglas de patrones (rachas, tendencias): no se usan. Celular: la pantalla ocupa el
  50 % del alto; las cifras de los límites van a la derecha de cada línea, ≥ 14 px.

### H09 · El tablero de herramientas (`gp-c08-h09-tablero`, Medio, 25 FP × %)
- **Contexto (20):** «El equipo de la planta tiene preguntas de calidad y un tablero lleno de
  herramientas. Cada pregunta pide una distinta.»
- **Rol (8):** «Diriges la línea y entregas la herramienta adecuada.»
- **Consigna (9):** «Cuelga cada pregunta en la herramienta que la responde.»
- **Visual:** tablero perforado de taller (Gemini) con **doce siluetas** colgadas, cada una
  una miniatura del gráfico o formato con su nombre: Dispersión · Histograma · Causa y
  efecto · Flujo · Afinidad · Matricial · Hoja de verificación · Lista de verificación ·
  Muestreo estadístico · Encuesta · Estudio comparativo · SIPOC. El hurón (Practicante)
  trae las preguntas. Acierto: la herramienta se descuelga y muestra un ejemplo en
  miniatura con datos de la línea.

| Pregunta | Herramienta | Retro si se equivoca |
|---|---|---|
| «¿La humedad de la sala se relaciona con los sellos malos?» | Dispersión | «Relación entre dos variables: diagrama de dispersión.» |
| «¿Cuántos defectos tuvo cada tipo de cápsula?» | Histograma | «Cuenta defectos por categoría: histograma.» |
| «¿Qué causas podrían explicar los sellos malos?» | Causa y efecto | «Desglosa las causas de un problema: espina de pescado.» |
| «¿En qué paso del empaque aparece el defecto?» | Flujo | «Muestra la serie de pasos que lleva al defecto.» |
| «Tenemos 40 causas sueltas: ¿cómo agruparlas?» | Afinidad | «Agrupa causas posibles en familias: diagrama de afinidad.» |
| «¿Qué tan fuerte se relacionan 5 causas con 3 objetivos?» | Matricial | «Fuerza de relación entre filas y columnas: matricial.» |
| «Hay que anotar los defectos mientras se inspecciona.» | Hoja de verificación | «Anotar frecuencias al inspeccionar: hoja de verificación.» |
| «¿Se hicieron los 12 pasos del arranque?» | Lista de verificación | «Comprobar pasos cumplidos: lista de verificación.» |
| «No se pueden revisar las 5.000: ¿cuántas tomamos?» | Muestreo estadístico | «Inspeccionar una parte de la población: muestreo.» |
| «¿Están contentos los compradores tras el lanzamiento?» | Encuesta | «Satisfacción tras desplegar: cuestionarios y encuestas.» |
| «¿Cómo lo hace otra planta de cápsulas de referencia?» | Estudio comparativo | «Comparar con proyectos similares: estudio comparativo.» |
| «¿Quién provee, qué entra, qué sale y para qué cliente?» | SIPOC | «Proveedores, entradas, proceso, salidas y clientes: SIPOC.» |

- **Partida:** 8 de 12 (siempre Dispersión e Hoja de verificación; las demás sorteadas).
- **Subtemas:** `gp08-herramientas` (diagramas), `gp08-controlar` (hoja, lista, muestreo,
  encuesta), `gp08-planificar` (estudio comparativo, SIPOC). Celular: tablero en 3
  columnas de 4 siluetas; toque-toque para colgar.

### H10 · La credencial del auditor (`gp-c08-h10-auditoria`, Medio, 25 FP × %)
- **Contexto (17):** «A mitad de la producción de prueba llega una auditoría de calidad a la
  planta de cápsulas.»
- **Rol (10):** «Diriges la línea y acompañas el recorrido de la auditoría.»
- **Visual:** plano de la planta ilustrado (Gemini) visto desde arriba, con zonas que se
  iluminan una por decisión; en primer plano, una **credencial de auditor con cordón y
  linterna**. El perro (PMO), con la credencial, hace el recorrido junto al zorro.
  **Consecuencias:** cada decisión mueve algo en el plano (la credencial cambia de manos,
  se enciende una zona, aparece un sello de «verificado», una carpeta viaja al archivo de
  lecciones). Si la decisión no es la mejor, se ve la consecuencia, el perro la objeta con
  la retro y se vuelve a decidir sin puntaje.
- **Decisiones (4, en orden):**

| Paso | Consigna | Mejor | Retro de las otras |
|---|---|---|---|
| 1 | «¿Quién debería hacer la auditoría?» (5) | La PMO, auditoría interna o un auditor externo | Equipo de la línea: «Debe ser independiente: alguien externo al proyecto.» · Proveedor de la lámina: «El proveedor no es independiente ni revisa tus procesos.» |
| 2 | «Marca los objetivos reales de la auditoría.» (7) 8 tarjetas, 5 verdaderas: identificar buenas prácticas · identificar no conformidades, brechas y defectos · compartir buenas prácticas de proyectos similares · ayudar a mejorar de forma proactiva · aportar a las lecciones aprendidas | Las 5 verdaderas | «Buscar culpables para sancionar» → «La auditoría ayuda de forma positiva; no busca culpables.» · «Reemplazar la inspección de los lotes» → «La auditoría revisa procesos; la inspección sigue.» · «Aprobar cambios al alcance» → «Los cambios se aprueban en el control integrado de cambios.» |
| 3 | Contexto (13): «La auditoría encuentra que la reparación aprobada de la selladora quedó a medias.» «¿Qué haces con la reparación?» (5) | Completarla, volver a probarla y certificarla | Dejarla así: «Un cambio a medias genera incoherencias y retrasos.» · Esperar al cierre: «Esperar deja pasar defectos; se verifica ahora.» |
| 4 | Contexto (15): «También halla en otra planta de Altamira un paso de sellado más rápido y seguro.» «¿Dónde debe quedar ese hallazgo?» (5) | En el repositorio de lecciones aprendidas | En el informe de la auditoría y ya: «Una buena práctica se comparte en el repositorio de lecciones.» · Solo en tu libreta: «Tu libreta no llega a otros proyectos.» |

  - Micro final. Consigna (7): «¿Puede llegar una auditoría sin previo aviso?» **Sí** ✓ /
    No. Retro de «No»: «Las auditorías pueden ser programadas o aleatorias.»
- **Cierre (11):** «Una auditoría independiente busca mejorar los procesos, no castigar a
  nadie.»
- **Subtema:** `gp08-auditorias`.

### H11 · La cadena de la solución (`gp-c08-h11-cadena`, Medio, 25 × 3 = 75 FP × %)
- **Contexto (14):** «El sellado sigue fallando de noche. Toca resolverlo de forma ordenada,
  no con parches.»
- **Rol (9):** «Diriges la línea y conduces la resolución del problema.»
- **Etapa 1 · Consigna (9):** «Engancha los seis pasos en orden en la cadena.»
  - **Visual:** cadena de seis eslabones grandes de acero (Gemini) que cuelga de un gancho
    en la planta; cada paso es una placa que se engancha en un eslabón. El hámster
    (Equipo) sostiene la cadena.

| Orden | Tarjeta | Retro si queda antes de la anterior |
|---|---|---|
| 1 Definir el problema | «De noche fallan 3 de cada 100 sellos.» | — |
| 2 Identificar la causa raíz | «El termostato no tiene mantenimiento.» | «Sin definir el problema no se sabe qué causa buscar.» |
| 3 Generar soluciones | «Opciones: mantenimiento semanal, termostato nuevo o sensor.» | «Las soluciones atacan la causa raíz: primero hay que hallarla.» |
| 4 Elegir la mejor | «Elegimos mantenimiento semanal con sensor.» | «Para elegir la mejor, primero hay que generar varias.» |
| 5 Implementarla | «Empieza el lunes en los tres turnos.» | «Se implementa lo que ya se eligió.» |
| 6 Verificar la efectividad | «En un mes: ¿bajaron las fallas?» | «Solo se verifica una solución ya puesta en marcha.» |

- **Etapa 2 · Consigna (8):** «Pon cada acción en su aspa del ciclo.»
  - **Visual:** molino de viento de cuatro aspas ilustrado (Gemini), rotuladas Planificar ·
    Hacer · Verificar · Actuar (ciclo PDCA, base de la mejora continua). Al acertar las
    cuatro, el molino gira una vuelta.
  - **Clave: criterio de Gen** (la guía nombra el ciclo y sus cuatro fases, no las define
    una a una).

| Acción | Aspa | Retro si se equivoca |
|---|---|---|
| «Diseñar el nuevo plan de mantenimiento.» | Planificar | «Diseñar el cambio antes de hacerlo es planificar.» |
| «Probarlo una semana en el turno de noche.» | Hacer | «Ponerlo en práctica a pequeña escala es hacer.» |
| «Comparar defectos antes y después.» | Verificar | «Medir si funcionó es verificar.» |
| «Volverlo norma en todos los turnos.» | Actuar | «Estandarizar lo que funcionó es actuar.» |

- **Etapa 3 · Consigna (8):** «Elige la X del diseño para cada meta.» (Diseño para X)
  Placas con etiquetas: Ensamblado · Costo · Facilidad de uso · Fiabilidad.

| Meta | X | Retro si se equivoca |
|---|---|---|
| «Que la cápsula se arme más rápido en la línea.» | Ensamblado | «Optimizar el armado es diseñar para el ensamblado.» |
| «Que cueste menos fabricarla.» | Costo | «La X es el costo de producirla.» |
| «Que el cliente la ponga sin esfuerzo en la cafetera.» | Facilidad de uso | «Pensar en quien la usa es facilidad de uso.» |
| «Que no se rompa durante el transporte.» | Fiabilidad | «Que funcione sin fallar es fiabilidad.» |

- **Subtema:** `gp08-mejora`.

### H12 · Las seis cortinas de despacho (`gp-c08-h12-despacho`, Difícil, 50 × 3 = 150 FP × %)
Taller del capítulo: el lote recorre las salidas del control y cierra con la retrospectiva.
- **Contexto (20):** «El lote 27 de cápsulas premium terminó su control. Unas cajas pasan,
  otras no, y cada papel tiene un destino.»
- **Rol (11):** «Diriges la línea y despachas cada salida del control de calidad.»
- **Visual común:** zona de despacho de la planta (Gemini) con **seis cortinas metálicas
  enrollables** rotuladas; una estiba con cajas que el estudiante arrastra a cada cortina (la estiba se
  desliza y la cortina baja con su rótulo ✓). Tras la cortina «Validar el Alcance»
  espera el conejo (Cliente).
- **Etapa 1 · Consigna (9):** «Lleva cada salida a la cortina que le corresponde.»

| Salida | Cortina | Retro si se equivoca |
|---|---|---|
| «Cajas que cumplen todo: entregables verificados.» | Validar el Alcance | «Los verificados pasan a Validar el Alcance para su aceptación.» |
| «Una caja con sellos abiertos que no cumple.» | Registro de incidentes | «Un entregable que no cumple se suele registrar como incidente.» |
| «Hay que cambiar el plan: inspección del 100 % en premium.» | Control Integrado de Cambios | «Un cambio al plan va como solicitud al control integrado.» |
| «Mediciones del lote, en el formato del plan.» | Gestionar la Calidad | «Las mediciones vuelven a Gestionar para evaluar procesos.» |
| «Riesgo nuevo: el proveedor de lámina puede fallar.» | Registro de riesgos | «Un riesgo nuevo se anota en el registro de riesgos.» |
| «De dónde vino el defecto y cómo evitarlo.» | Lecciones aprendidas | «El origen del defecto y cómo evitarlo van a lecciones.» |

- **Etapa 2 · Consigna (8):** «Clasifica lo dicho en la retrospectiva del lote.» Cuatro
  cajas en la zona de despacho: Salió bien · Por mejorar · Incorporar desde ya · Agregar a los activos
  de la organización.

| Comentario | Caja | Retro si se equivoca |
|---|---|---|
| «El muestreo por hora detectó el problema temprano.» | Salió bien | «Funcionó y lo detectó a tiempo: es un acierto.» |
| «Tardamos dos días en avisar al proveedor.» | Por mejorar | «Es algo que salió lento: hay que mejorarlo.» |
| «Desde el lote 28, sensor de temperatura en cada turno.» | Incorporar desde ya | «Es un cambio para este proyecto y los siguientes.» |
| «Plantilla nueva de hoja de verificación para toda Altamira.» | Activos de la organización | «Una plantilla de la empresa es un activo de la organización.» |

- **Etapa 3 · Microdesafíos (3):**
  1. Consigna (7): «¿El supermercado ya aceptó las cajas verificadas?» Sí / **No**. Retro de
     «Sí»: «Verificado no es aceptado: falta Validar el Alcance con el cliente.»
  2. Contexto (10): «La próxima línea será ágil, con entregas cada dos semanas.» Consigna
     (7): «¿Cuándo se controla la calidad en ágil?» Opciones: **Todo el equipo, a lo largo
     del ciclo** ✓ / Solo al final del proyecto / Solo el inspector, al cerrar la fase.
     Retros: «Revisar solo al final es de cascada, no de ágil.» · «En ágil la hacen todos,
     en pasos frecuentes.»
  3. Consigna (9): «¿Por qué los lotes pequeños ayudan a la calidad?» Opciones: **Muestran
     los problemas temprano, cuando cambiar cuesta menos** ✓ / Eliminan la inspección /
     Bajan el grado del producto. Retros: «Los lotes pequeños no quitan las pruebas; las
     adelantan.» · «El tamaño del lote no cambia el grado.»
- **Subtemas:** `gp08-controlar` (etapas 1–2, micro 1), `gp08-tendencias` (micros 2–3).
  Puntaje: aciertos al primer intento / 13 ítems.

---

## 3. Objetos para Gemini (paso 6), por pieza

Pedir con la guía de estilo (contorno, paleta Planck, sin texto en la imagen; el texto lo
pone la interfaz). Fondo croma para recortar. Ninguno repite los de c1-c2 §3 ni c07 §3.

H01 góndola de supermercado de 4 casillas, cápsula básica, cápsula premium · H02 estante
metálico de dos pisos, 4 cubetas apilables, factura doblada · H03 ascensor de carga con cinco
pisos a la vista · H04 plano técnico de cápsula despiezada (tapa, filtro, cuerpo, café) · H05
tres casilleros metálicos con casco colgado · H06 esqueleto de pescado de pared, notas
adhesivas · H07 mesa de inspección con lámpara de brazo, hoja grande, bandeja con cápsulas (5 defectos
visibles), bloc cuadriculado · H08 selladora industrial con monitor, baliza, caja apartada ·
H09 tablero perforado de taller con 12 siluetas · H10 credencial con cordón y linterna, plano
de planta visto desde arriba · H11 cadena de seis eslabones con gancho, placas, molino de cuatro aspas ·
H12 zona de despacho con seis cortinas metálicas enrollables, estiba con cajas.

Situaciones de mascotas nuevas (chat «Chibi Fox Model Sheet»): conejo cliente frente a una
góndola · gato gerente funcional con casco de planta y lote en la mano · hámster pegando
notas · hámster sosteniendo una cadena · perro PMO con credencial y linterna · hurón
practicante señalando una hoja.

**Ids de imagen (lote de imágenes 3):** H01 → gondola, capsula-basica, capsula-premium · H02 → estante-metalico, cubeta-apilable, factura · H03 → ascensor-carga · H04 → capsula-despiece · H05 → casilleros-casco · H06 → espina-pescado, nota-adhesiva · H07 → mesa-inspeccion, memorando-clip (ya existía), bandeja-capsulas, bloc-cuadriculado · H08 → selladora, baliza, caja-paquete (ya existía) · H09 → tablero-herramientas · H10 → credencial, linterna (ya existía), plano-planta · H11 → cadena-gancho, placa-metal, molino · H12 → muelle-despacho, estiba-cajas. Archivos en `public/gestion-proyectos/ilustrados/<id>.webp` salvo los marcados «macro»; «pendiente» = aún sin imagen (la pieza usa la provisional).

## 4. Autoevaluación contra el Kit

| Dimensión | Nivel esperado | Por qué |
|---|---|---|
| Prerrequisitos | Pasa | Todo concepto rastreable a la ficha (pp. 271–307). Claves no explícitas marcadas «criterio de Gen» (H04 etapa 2, H06 etapa 1, H07 micro 1, H11 etapa 2). Pareto evitado porque la guía no lo trae. Sin clichés. |
| D1 Cobertura | Avanzado | Los 13 subtemas `gp08-…` tienen al menos una pieza; los 3 procesos con sus salidas clave (plan, métricas, informes, documentos de prueba, mediciones, entregables verificados). |
| D2 Nivel cognitivo | Avanzado | Distinguir (H01–H03), clasificar en procesos (H04, H05), aplicar herramientas (H06–H09), decidir y transferir (H10–H12). |
| D3 Retroalimentación | Avanzado | Retro específica por ítem, por par (H03, H11) y por distractor (H06, H08, H10). |
| D4 Interacción con sentido | Avanzado | La herramienta se usa, no solo se nombra: se anota la hoja, se arma la espina, se lee la pantalla de control. |
| D5 Marca | Avanzado | Tokens Planck; coral solo error. |
| D6 Sin plantillas | Avanzado | Ninguna retro genérica. |
| D7 Celular | Avanzado (a medir) | Ítems largos y ajustes a 320 px señalados por pieza. |
| D8 Rejugabilidad | Avanzado | Bancos mayores que la partida: H01 8→6, H02 12→8, H05 11→8, H06 11→8, H09 12→8. |
| D9 Gancho visual | Avanzado | 12 objetos protagonistas distintos (§3). |
| D11 Consistencia | Avanzado | Una sola línea de cápsulas, mismos datos de peso y defectos en H07, H08 y el Aprender. |
| D13 Consigna | Avanzado | Verbos de acción, ≤ 12 palabras en todas (la más larga, H07 etapa 2). |

## 5. Conteo de palabras (consignas ≤ 12)

Contado con script sobre este archivo (palabras separadas por espacio; signos y cifras
cuentan como palabra).
H01 11 / 7, 2 · H02 11 / 8, 4, 9 · H03 10 / 3, 6 · H04 8 / 8, 8 · H05 9 / 7, 10, 9 · H06 8 / 9, 8 ·
H07 9, 6 / 12, 4, 2 · H08 10, 6, 6 / 8, 10 · H09 9 · H10 5, 7, 5, 5, 7 · H11 9 / 8 / 8 ·
H12 9 / 8 / 7, 7, 9. Contextos ≤ 23; roles ≤ 11; retros ≤ 15.

## 6. Conexión con Jane

Misma regla de los dos pasos que `../conexion-jane.md`: el Aprender deja entendido el
concepto o el documento con la línea de cápsulas y los datos de §0; el Hacer lo ejercita
ese día. Se propone que Jane haga los **documentos y herramientas clave del área como
simuladores** y que los Hacer los retomen tal cual.

| Aprender (Jane) | Qué deja entendido | Simulador propuesto (documento o herramienta clave) | Hacer que lo ejercitan |
|---|---|---|---|
| `gp-c08-a01` Calidad, grado y costo de la calidad | Calidad ≠ grado; prevención vs. inspección; COQ (conformidad / no conformidad); cinco niveles | **Tablero del costo de la calidad**: el estudiante mueve la inversión en prevención y evaluación y ve subir o bajar las fallas internas y externas | `gp-c08-h01-gondola`, `gp-c08-h02-cubetas`, `gp-c08-h03-ascensor` |
| `gp-c08-a02` Planificar, gestionar y controlar | Los 3 procesos y cómo se pasan la posta; plan de gestión de la calidad y métricas; gestionar = aseguramiento, trabajo de todos | **Plan de gestión de la calidad de la línea**, que se llena por secciones (el mismo plano despiezado de H04) | `gp-c08-h04-plano`, `gp-c08-h05-casilleros` |
| `gp-c08-a03` Las herramientas de la calidad | Causa y efecto, hoja de verificación, histograma, dispersión, afinidad, flujo, matricial, SIPOC; diagrama de control y límites | **Diagrama de control manipulable**: se mueven los puntos y los límites de la selladora y se ve cuándo el proceso sale de control o de especificación | `gp-c08-h06-espina`, `gp-c08-h07-hoja`, `gp-c08-h08-monitor`, `gp-c08-h09-tablero` |
| `gp-c08-a04` Auditoría, mejora y salidas del control | Auditoría independiente; resolución de problemas; PDCA; DfX; entregables verificados → Validar el Alcance; retrospectivas; ágil | **Recorrido del lote** por los tres procesos hasta el despacho, con sus documentos | `gp-c08-h10-auditoria`, `gp-c08-h11-cadena`, `gp-c08-h12-despacho` |

En pantalla: el Aprender termina con «Practícalo» hacia su primer Hacer; el Hacer arranca
con «Viene de: …» y no bloquea (igual que `../conexion-jane.md`). Si Jane cambia un dato de
la línea, se cambia en `datos/c08-capsulas.json` y ambos quedan iguales.
