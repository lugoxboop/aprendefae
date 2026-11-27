# Ficha · Capítulo 11 de la Guía del PMBOK 6.ª ed. — Gestión de los Riesgos del Proyecto

> Ficha de Gen, 2026-11-27, **en palabras propias** (el repositorio es público: aquí no se
> copia el libro). Original en el almacén privado: `gestion-proyectos/originales/PMBOK-6-guia-ES.txt`
> (cap. 11 = pp. 395–458). Las páginas entre paréntesis son de la guía. No volver a abrir
> el original para este capítulo: todo lo que sirve está aquí.

## Subtemas (ids para el panel docente)

| Subtema | id | Páginas |
|---|---|---|
| Qué es riesgo: individual vs. general; amenaza y oportunidad; apetito y umbrales | `gp11-conceptos` | 395–398 |
| Tendencias: riesgos de variabilidad y de ambigüedad; riesgos emergentes y resiliencia; gestión integrada | `gp11-tendencias` | 398–399 |
| Adaptación y entornos ágiles | `gp11-adaptacion` | 400 |
| 11.1 Planificar la Gestión de los Riesgos: el plan y sus secciones | `gp11-plan` | 401–408 |
| Categorías de riesgo y estructura de desglose de los riesgos (RBS) | `gp11-rbs` | 405–406, 425 |
| 11.2 Identificar los Riesgos: técnicas | `gp11-identificar` | 409–416 |
| Registro de riesgos, enunciado de riesgo e informe de riesgos | `gp11-registro` | 417–418 |
| 11.3 Análisis cualitativo: escalas, matriz de probabilidad e impacto, puntuación | `gp11-cualitativo` | 407–408, 419–427 |
| Otros parámetros del riesgo y gráfica de burbujas | `gp11-parametros` | 423–426 |
| 11.4 Análisis cuantitativo: valor monetario esperado y árbol de decisiones | `gp11-vme` | 428–429, 435 |
| Simulación de Monte Carlo, curva S, sensibilidad (tornado), criticidad | `gp11-simulacion` | 432–436 |
| 11.5 Estrategias para amenazas | `gp11-amenazas` | 442–443 |
| 11.5 Estrategias para oportunidades | `gp11-oportunidades` | 444 |
| Contingencia, riesgo general, residual y secundario; costo-beneficio de la respuesta | `gp11-respuesta` | 439, 445–448 |
| 11.6 Implementar la Respuesta a los Riesgos | `gp11-implementar` | 449–452 |
| 11.7 Monitorear los Riesgos; análisis de reserva, auditorías, revisiones | `gp11-monitorear` | 453–458 |

## Conceptos (en palabras propias)

**Para qué sirve el área (p. 395).** Subir la probabilidad o el impacto de los riesgos
positivos y bajar los de los negativos, para mejorar las opciones de éxito. Todo proyecto
es riesgoso porque es único, tiene restricciones y supuestos, y sus interesados esperan
cosas que pueden chocar o cambiar (p. 397). La organización debe asumir riesgo **de forma
controlada e intencional**, equilibrando riesgo y recompensa.

**Dos niveles de riesgo (p. 397).**
- **Riesgo individual:** evento o condición **incierta** que, si ocurre, afecta (para bien o
  para mal) uno o más objetivos del proyecto.
- **Riesgo general:** el efecto de **toda** la incertidumbre sobre el proyecto como un
  todo (riesgos individuales y otras fuentes); es la exposición de los interesados a que
  el resultado varíe, hacia arriba o hacia abajo.
- Riesgo positivo = **oportunidad**; negativo = **amenaza**. Amenaza no gestionada →
  retrasos, sobrecostos, bajo desempeño, mala reputación. Oportunidad aprovechada → menos
  tiempo y costo, mejor desempeño, buena reputación.
- Los riesgos siguen apareciendo todo el proyecto: la gestión es **iterativa** (p. 398).

**Apetito y umbrales (p. 398, 406).** El **apetito al riesgo** es cuánto riesgo están
dispuestos a asumir la organización y los interesados. Se traduce en **umbrales medibles**:
cuánta variación se acepta alrededor de cada objetivo (p. ej., «no más de X semanas de
retraso»). Los umbrales se fijan explícitamente, se comunican y alimentan las
definiciones de impacto.

**Tendencias (pp. 398–399).**
- **Riesgos no basados en eventos:** **de variabilidad** (no se sabe cuánto valdrá algo
  planeado: productividad, número de errores en pruebas, clima fuera de temporada) → se
  tratan con **Monte Carlo** y distribuciones; **de ambigüedad** (no se sabe qué pasará:
  requisitos, solución técnica, normas futuras) → se tratan llenando el vacío de
  conocimiento (expertos externos, comparación con mejores prácticas), desarrollo
  incremental, prototipos o simulación.
- **Riesgos emergentes** («desconocidos-desconocidos»: solo se reconocen cuando ya
  ocurrieron) → **capacidad de recuperación**: contingencia de presupuesto y cronograma
  para emergentes **además** del presupuesto para riesgos conocidos; procesos flexibles
  con buena gestión del cambio; equipo empoderado; revisar señales de alerta temprana;
  interesados que aclaren qué alcance o estrategia puede ajustarse.
- **Gestión integrada:** el riesgo vive en proyecto, programa y portafolio; cada riesgo se
  gestiona en el nivel apropiado (unos bajan al proyecto, otros se elevan).

**Adaptación (p. 400).** Se ajusta según **tamaño**, **complejidad** (innovación,
tecnología nueva, dependencias externas), **importancia estratégica** y **enfoque de
desarrollo** (en cascada el proceso puede seguirse en secuencia e iterar; en ágil el
riesgo se trata al inicio de cada iteración y durante ella). En entornos ágiles: revisiones
frecuentes de incrementos, equipos multifuncionales, requisitos como documento vivo y
prioridades que cambian con la exposición al riesgo.

## Los siete procesos

| Proceso | Grupo de procesos | Frecuencia | Salida clave |
|---|---|---|---|
| 11.1 Planificar la Gestión de los Riesgos | Planificación | Una vez o en puntos predefinidos | Plan de gestión de los riesgos |
| 11.2 Identificar los Riesgos | Planificación | Todo el proyecto | Registro de riesgos, informe de riesgos |
| 11.3 Realizar el Análisis Cualitativo | Planificación | Todo el proyecto | Registro e informe actualizados (prioridad, dueño) |
| 11.4 Realizar el Análisis Cuantitativo | Planificación | Todo el proyecto, **solo si se usa** | Informe de riesgos actualizado |
| 11.5 Planificar la Respuesta | Planificación | Todo el proyecto | Solicitudes de cambio; registro e informe con respuestas |
| 11.6 Implementar la Respuesta | Ejecución | Todo el proyecto | Solicitudes de cambio; registro de incidentes, de riesgos |
| 11.7 Monitorear los Riesgos | Monitoreo y Control | Todo el proyecto | Información de desempeño, solicitudes de cambio |

(Los grupos se deducen del lugar de cada proceso en la tabla 1-4; criterio de Gen
confirmar con la tabla del cap. 1 si el profesor la usa.)

### 11.1 Planificar la Gestión de los Riesgos (pp. 401–408)
Define **cómo** se hará la gestión de riesgos, para que su nivel, tipo y visibilidad sean
proporcionales al riesgo y a la importancia del proyecto. Debe empezar **apenas se
concibe** el proyecto y terminar pronto; se revisa en un cambio de fase principal, si el
alcance cambia mucho o si una revisión muestra que el proceso no funciona.
- **Entradas clave:** acta de constitución (riesgos de alto nivel), plan para la dirección
  (todos los componentes), registro de interesados (roles y actitud ante el riesgo), EEF
  (umbrales de la organización), OPA (política de riesgos, RBS, plantillas, formatos de
  enunciado, niveles de autoridad, lecciones aprendidas).
- **Herramientas:** juicio de expertos, análisis de interesados (para conocer su
  apetito), reuniones (puede ser en la reunión de lanzamiento; un facilitador ayuda a
  superar sesgos).
- **Salida: plan de gestión de los riesgos** (componente del plan para la dirección), que
  puede traer: **estrategia** de riesgos (enfoque general) · **metodología** (enfoques,
  herramientas, fuentes de datos) · **roles y responsabilidades** (líder, apoyo, equipo) ·
  **financiamiento** (fondos para la gestión de riesgos y protocolos para usar las
  reservas de contingencia y de gestión) · **calendario** (cuándo y cada cuánto) ·
  **categorías de riesgo** (a menudo una RBS) · **apetito al riesgo** de los interesados
  (como umbrales medibles) · **definiciones de probabilidad e impacto** · **matriz de
  probabilidad e impacto** (reglas de priorización) · **formatos de los informes**
  (registro e informe de riesgos) · **seguimiento** (cómo se registra y se audita).

**RBS (p. 405–406).** Representación jerárquica de las **fuentes** de riesgo. Ejemplo de
la guía (gráfico 11-4, legible):
- Nivel 0: todas las fuentes de riesgo del proyecto.
- 1 **Técnico:** definición del alcance, definición de requisitos, estimaciones/supuestos/
  restricciones, procesos técnicos, tecnología, interfaces técnicas.
- 2 **De gestión:** dirección de proyectos, dirección de programa/portafolio, gestión de
  operaciones, organización, dotación de recursos, comunicación.
- 3 **Comercial:** términos y condiciones contractuales, contratación interna, proveedores
  y vendedores, subcontratos, estabilidad de los clientes, asociaciones y empresas conjuntas.
- 4 **Externo:** legislación, tasas de cambio, sitios/instalaciones, ambiental/clima,
  competencia, normativo.
Sin RBS se puede usar una lista simple de categorías o una estructura por objetivos.

**Definiciones de probabilidad e impacto (tabla 11-1, p. 407, legible).** Son propias del
proyecto. Más niveles = enfoque más detallado (típico **cinco**); proceso sencillo = **tres**.
Se usan igual para amenazas (impacto negativo) y oportunidades (positivo). Ejemplo:

| Escala | Probabilidad | Tiempo | Costo (ejemplo en US$) |
|---|---|---|---|
| Muy alto | > 70 % | > 6 meses | > $5M |
| Alto | 51–70 % | 3–6 meses | $1M–$5M |
| Mediano | 31–50 % | 1–3 meses | $501K–$1M |
| Bajo | 11–30 % | 1–4 semanas | $100K–$500K |
| Muy bajo | 1–10 % | 1 semana | < $100K |
| Nulo | < 1 % | sin cambio | sin cambio |

(La columna de calidad va de «impacto muy significativo sobre la funcionalidad general»
a «ningún cambio en la funcionalidad».)

**Matriz de probabilidad e impacto (gráfico 11-5, p. 408).** Cuadrícula que cruza la
probabilidad con el impacto; amenazas y oportunidades en una **matriz común** (impacto
negativo a un lado, positivo al otro). Con valores numéricos:
- Probabilidad: muy alta **0,90** · alta **0,70** · mediana **0,50** · baja **0,30** · muy baja **0,10**.
- Impacto: muy bajo **0,05** · bajo **0,10** · moderado **0,20** · alto **0,40** · muy alto **0,80**.
- **Puntuación = probabilidad × impacto** (la guía redondea a dos decimales: 0,90 × 0,05 →
  0,05). Celdas: 0,05/0,04/0,03/0,02/0,01 · 0,09/0,07/0,05/0,03/0,01 · 0,18/0,14/0,10/0,06/0,02 ·
  0,36/0,28/0,20/0,12/0,04 · 0,72/0,56/0,40/0,24/0,08.
- ⚠ **Ilegible:** los colores que separan las zonas de prioridad alta, media y baja se
  perdieron en el texto. **Los umbrales de zona que usan las actividades son criterio de
  Gen:** alta ≥ 0,20 · media 0,06–0,18 · baja ≤ 0,05.

### 11.2 Identificar los Riesgos (pp. 409–418)
Documenta riesgos individuales y fuentes de riesgo general, todo el proyecto. Debería
participar todo interesado; es clave que participe el equipo para que sienta los riesgos
como propios. Los **dueños** se pueden nominar aquí y se confirman en el cualitativo; las
respuestas preliminares se confirman en Planificar la Respuesta.
- **Entradas clave:** planes secundarios y líneas base (dónde hay incertidumbre o
  supuestos), registro de supuestos, estimaciones de costo y duración (idealmente en
  rango), registro de incidentes, lecciones aprendidas, documentación de requisitos,
  registro de interesados, **acuerdos** y documentación de adquisiciones (hitos, tipo de
  contrato, premios y sanciones).
- **Técnicas:**
  - **Tormenta de ideas:** lista completa, con facilitador y a menudo expertos externos al
    equipo; cuidar que cada riesgo quede bien descrito.
  - **Listas de verificación:** recordatorio basado en proyectos anteriores; rápida, pero
    **nunca exhaustiva**: no debe reemplazar el esfuerzo de identificar; hay que mirar
    fuera de la lista y actualizarla.
  - **Entrevistas:** en confianza y confidencialidad.
  - **Análisis de causa raíz:** partir de un problema («podríamos retrasarnos») y buscar
    las amenazas que lo causarían; o de un beneficio y buscar oportunidades.
  - **Análisis de supuestos y restricciones:** supuestos inexactos, inestables,
    incoherentes o incompletos → amenazas; relajar una restricción → oportunidad.
  - **FODA:** oportunidades que nacen de fortalezas, amenazas que nacen de debilidades.
  - **Análisis de documentos:** incertidumbre o **inconsistencias** entre documentos
    indican riesgo.
  - **Facilitación**, **listas de ideas rápidas** (categorías predeterminadas: el nivel
    más bajo de la RBS; para riesgo general: **PESTLE**, **TECOP**, **VUCA**) y
    **reuniones** (el **taller de riesgos**).
- **Salidas:** **registro de riesgos** (lista con identificador único; dueño potencial;
  respuestas potenciales; y según el plan: título, categoría, estado, causas, efectos,
  **disparadores**, referencia a la EDT, fechas); **informe de riesgos** (fuentes de
  riesgo general y resumen: n.º de amenazas y oportunidades, distribución por categoría,
  tendencias); actualizaciones a supuestos, incidentes y lecciones aprendidas.
- **Enunciado de riesgo:** un formato coherente y **estructurado** que **separe el riesgo
  de sus causas y de sus efectos** (p. 417). El formato de tres partes «causa → riesgo →
  efecto» que usan las actividades sigue esa idea; la redacción exacta de cada parte es
  criterio de Gen: **causa** = hecho o condición que existe hoy; **riesgo** = lo incierto
  que podría pasar; **efecto** = lo que le pasaría a un objetivo.

### 11.3 Realizar el Análisis Cualitativo (pp. 419–427)
**Prioriza** los riesgos individuales por probabilidad, impacto y otras características;
concentra el esfuerzo en los de prioridad alta. Es **subjetivo** (depende de percepciones)
→ hay que identificar y corregir **sesgos** (tarea clave del facilitador) y evaluar la
**calidad de los datos** (integridad, objetividad, pertinencia, oportunidad; si es mala,
recoger mejores datos). Asigna un **dueño** a cada riesgo. En ágil se hace a menudo antes
de cada iteración.
- **Herramientas:** entrevistas, evaluación de probabilidad e impacto (con las
  definiciones del plan), evaluación de otros parámetros, categorización (por fuente, por
  área de la EDT, por fase, por causa raíz común), **matriz de probabilidad e impacto**,
  diagramas jerárquicos (**gráfica de burbujas**), reuniones (taller).
- Riesgos con probabilidad e impacto bajos → **lista de observación** para monitoreo.
- Una organización puede tener una matriz por objetivo (costo, tiempo, alcance) o
  combinar, o tomar la prioridad más alta de cualquier objetivo.
- **Otros parámetros (pp. 423–424):** **urgencia** (plazo para que la respuesta sirva:
  corto = urgencia alta) · **proximidad** (tiempo antes de que el riesgo impacte: corto =
  proximidad alta) · **inactividad** (tiempo entre que ocurre y que se nota su impacto:
  corto = inactividad **baja**) · **manejabilidad** (qué tan fácil el dueño maneja la
  ocurrencia o el impacto) · **controlabilidad** (cuánto controla el dueño el resultado) ·
  **detectabilidad** (qué tan fácil se nota que ocurre o está por ocurrir) ·
  **conectividad** (cuánto se relaciona con otros riesgos) · **impacto estratégico**
  (efecto sobre metas de la organización) · **propincuidad** (cuánto le importa a uno o más
  interesados).
- **Gráfica de burbujas (gráfico 11-10):** cuando hay más de dos parámetros, la matriz no
  basta; ejemplo: eje x detectabilidad, eje y proximidad, tamaño = impacto. ⚠ La posición
  de las dos zonas del gráfico («no se aceptan burbujas grandes» / «se aceptan burbujas
  pequeñas») llegó ilegible: no se usa como clave.
- **Salidas:** registro de riesgos con probabilidad, impacto, prioridad, dueño,
  urgencia, categoría y lista de observación; informe con los riesgos más importantes y
  lista priorizada.

### 11.4 Realizar el Análisis Cuantitativo (pp. 428–436)
Analiza **numéricamente el efecto combinado** de los riesgos sobre los objetivos generales.
**No se requiere en todo proyecto:** depende de datos de calidad, de líneas base sólidas,
de software y pericia, y cuesta tiempo y dinero. Conviene en proyectos grandes, complejos,
estratégicos, cuando lo exige un contrato o un interesado clave. Es **el único método
confiable para evaluar el riesgo general**. Usa los riesgos que el cualitativo marcó como
significativos; puede repetirse después de planificar respuestas para ver si funcionan.
- **Entradas clave:** líneas base (punto de partida), base de las estimaciones,
  estimaciones y pronósticos de costo y cronograma (EAC, ETC, BAC, TCPI), lista de hitos,
  registro e informe de riesgos.
- **Representaciones de la incertidumbre:** distribuciones (triangular, normal, log
  normal, beta, uniforme, discreta); **ramas probabilísticas** para riesgos que pueden
  ocurrir independientemente de las actividades; **correlación** para riesgos con causa
  común.
- **Simulación (Monte Carlo):** el software corre el modelo **miles de veces** tomando
  valores al azar; salida = **histograma** o **curva S** (probabilidad acumulada de lograr
  un resultado o menos). Ejemplo de la guía (gráfico 11-13, legible): meta $2,2M con 23 %
  de probabilidad de cumplirse; valor esperado $2,35M; 85 % de probabilidad de costar
  $2,45M o menos. Para cronograma, **análisis de criticidad**: % de corridas en que un
  elemento queda en la ruta crítica.
- **Análisis de sensibilidad:** qué riesgos o incertidumbres pesan más en el resultado;
  se ve en el **diagrama de tornado** (elementos ordenados de mayor a menor correlación).
- **Árbol de decisiones (gráfico 11-15, legible):** elige entre alternativas. Nodos de
  decisión (con el costo de cada opción) y nodos de oportunidad (probabilidad y
  resultado de cada escenario). **Fórmulas:**
  - **Valor neto de ruta = beneficios − costos** a lo largo de la ruta.
  - **VME (valor monetario esperado) de un nodo = Σ (probabilidad × valor neto)**.
  - Se elige la rama de **mayor VME**.
  - Ejemplo de la guía: construir planta nueva (invertir 120) vs. modernizar (invertir 50);
    demanda fuerte 60 %, débil 40 %; ingresos 200/90 (nueva) y 120/60 (modernizada) →
    netos 80/−30 y 70/10 → VME 36 vs. **46** → modernizar (además evita la pérdida de 30).
  - Para un riesgo individual, el mismo cálculo da **VME = probabilidad × impacto**
    (negativo si es amenaza, positivo si es oportunidad).
- **Diagramas de influencias:** entidades, resultados e influencias; se evalúan con
  simulación; dan curvas S y tornados.
- **Salida:** informe de riesgos con la **exposición general** (probabilidad de lograr los
  objetivos y rango de variabilidad que queda), análisis probabilístico (curvas S,
  tornado, criticidad, **reserva para contingencias necesaria para un nivel de confianza
  dado**), lista priorizada, tendencias, respuestas recomendadas.

### 11.5 Planificar la Respuesta a los Riesgos (pp. 437–448)
Desarrolla opciones, elige estrategias y acuerda acciones para el riesgo general y los
individuales; asigna recursos y mete actividades en el plan. La respuesta debe ser
**proporcional** a la importancia del riesgo, **rentable**, **realista**, **acordada** y
con **una persona responsable** (el dueño). Se pueden tener estrategias principales y de
refuerzo.
- **Estrategias para amenazas (pp. 442–443):**
  - **Escalar:** la amenaza está fuera del alcance o la respuesta excede la autoridad del
    director → se gestiona en programa, portafolio u otra parte de la organización, que
    debe **aceptar** la propiedad. Después, el equipo **ya no la monitorea** (puede quedar
    en el registro solo como información).
  - **Evitar:** eliminar la amenaza o aislar al proyecto de su impacto (probabilidad a
    **cero**). Para amenazas de alta prioridad, alta probabilidad y gran impacto. Ejemplos:
    eliminar la causa, extender el cronograma, cambiar la estrategia, reducir el alcance;
    aclarar requisitos, obtener información, mejorar la comunicación, ganar experiencia.
  - **Transferir:** pasar la titularidad a un tercero que la maneja y asume el impacto;
    suele implicar una **prima**. Seguros, garantías de cumplimiento, fianzas,
    certificados de garantía, acuerdos.
  - **Mitigar:** reducir probabilidad y/o impacto; mejor temprano. Procesos menos
    complejos, más pruebas, vendedor más estable, prototipo, **redundancias** (bajan el
    impacto cuando no se puede bajar la probabilidad).
  - **Aceptar:** se reconoce, sin acción proactiva; para baja prioridad o cuando nada más
    es posible o rentable. **Activa** = reserva para contingencias (tiempo, dinero,
    recursos); **pasiva** = solo revisión periódica.
- **Estrategias para oportunidades (p. 444):**
  - **Escalar:** igual que en amenazas (fuera del alcance o de la autoridad).
  - **Explotar:** asegurar que **sí ocurra** (probabilidad al **100 %**); para alta
    prioridad. Ej.: asignar los recursos más talentosos para terminar antes; usar
    tecnología nueva para bajar costo y duración.
  - **Compartir:** pasar la propiedad a un tercero que comparte el beneficio; elegir al
    más capaz de capturarla; puede haber prima. Asociaciones, equipos, compañías de
    propósito especial, empresas conjuntas.
  - **Mejorar:** **aumentar** probabilidad y/o impacto (atacando sus causas o lo que
    agranda el beneficio). Ej.: añadir recursos a una actividad para terminar antes.
  - **Aceptar:** activa (reserva para aprovecharla) o pasiva.
- **Contingencia (p. 445):** respuesta que **solo se ejecuta** si ocurren eventos
  predefinidos (**disparadores**: p. ej., no cumplir un hito intermedio), cuando habrá
  señales suficientes. Se llama **plan de contingencia** o plan de reserva.
- **Riesgo general (pp. 445–446):** evitar (sacar elementos de alto riesgo del alcance;
  en extremo, **cancelar el proyecto** si el nivel es y seguirá siendo inaceptable) ·
  explotar (añadir alcance de alto beneficio o ajustar umbrales con acuerdo) ·
  transferir/compartir (empresa conjunta, estructura colaborativa, subcontratar) ·
  mitigar/mejorar (replanificar, cambiar alcance, prioridad, recursos, plazos) · aceptar
  (reserva general para contingencias o solo revisión).
- **Riesgo secundario:** el que **nace de aplicar una respuesta**. **Riesgo residual:** el
  que **queda** después de aplicarla (o el aceptado a propósito) (pp. 439, 448).
- **Selección de la respuesta:** análisis de alternativas; **análisis costo-beneficio:
  rentabilidad = (cambio en el nivel de impacto) ÷ (costo de implementación)**; a mayor
  razón, más efectiva (p. 446). Análisis de decisiones con **múltiples criterios** (costo,
  efectividad, recursos, urgencia/proximidad/inactividad, efecto sobre otros riesgos,
  riesgos secundarios). En las actividades, el «cambio en el impacto» se mide como la
  diferencia de VME antes y después de la respuesta: **criterio de Gen**.
- **Salidas:** solicitudes de cambio (por control integrado de cambios); actualizaciones a
  planes y líneas base; registro de riesgos con estrategia, acciones, disparadores,
  presupuesto y actividades, planes de contingencia, planes de reserva (cuando ocurrió el
  riesgo y la respuesta inicial no bastó), riesgos residuales y secundarios.

### 11.6 Implementar la Respuesta a los Riesgos (pp. 449–452)
Asegura que las respuestas acordadas **se ejecuten de verdad**. Problema común: se
identifica, analiza y documenta todo… y nadie actúa. Solo si los dueños ponen el esfuerzo
se gestiona el riesgo de forma proactiva.
- **Entradas clave:** plan de gestión de riesgos (roles, umbrales), lecciones aprendidas,
  registro e informe de riesgos.
- **Herramientas:** juicio de expertos, **influencia** (dueños fuera del equipo o con
  otras prioridades), PMIS (meter las respuestas en el software del cronograma y costos).
- **Salidas:** solicitudes de cambio; registro de incidentes, lecciones aprendidas,
  asignaciones del equipo, registro e informe de riesgos.

### 11.7 Monitorear los Riesgos (pp. 453–458)
Sigue la implementación, rastrea riesgos, identifica nuevos y evalúa si el proceso
funciona. Con la información de desempeño se revisa si: las respuestas son efectivas,
cambió el riesgo general o el estado de los individuales, hay riesgos nuevos, el enfoque
sigue siendo adecuado, los **supuestos** siguen válidos, se cumplen políticas, **las
reservas** necesitan ajuste y la estrategia sigue en pie.
- **Entradas clave:** plan de gestión de riesgos, registros de incidentes, lecciones,
  riesgos (incl. lista de vigilancia, residuales, secundarios), informe de riesgos,
  **datos** e **informes de desempeño del trabajo** (valor ganado, variaciones).
- **Herramientas:**
  - **Análisis del desempeño técnico:** compara logros técnicos reales con los
    planificados (peso, tiempo de transacción, defectos, capacidad); la desviación puede
    señalar amenazas u oportunidades.
  - **Análisis de reserva:** compara la **reserva para contingencias que queda** con el
    **riesgo que queda**, para ver si alcanza (puede mostrarse en un diagrama de pendientes
    de realizar). En las actividades, el «riesgo que queda» se resume como la suma de VME
    de las amenazas abiertas: **criterio de Gen**.
  - **Auditorías de riesgos:** evalúan la efectividad del proceso; **el director** se
    asegura de que se hagan con la frecuencia del plan; formato y objetivos definidos antes.
  - **Reuniones (revisiones de riesgos):** periódicas; examinan efectividad de respuestas,
    identifican riesgos nuevos (incluidos secundarios), reevalúan, **cierran los
    obsoletos**, registran incidentes y lecciones.
- **Salidas:** información de desempeño; solicitudes de cambio (acciones correctivas y
  preventivas); actualizaciones a plan, documentos y OPA (plantillas, RBS).

**Reservas en este capítulo.** El plan fija los protocolos de uso de las **reservas de
contingencia y de gestión** (p. 405); la **aceptación activa** crea una reserva para
contingencias (p. 443); la capacidad de recuperación pide contingencia para riesgos
emergentes **además** del presupuesto para los conocidos (p. 399); el cuantitativo dice
cuánta reserva hace falta para un nivel de confianza (p. 436); Monitorear verifica si la
que queda alcanza (p. 456). La definición completa de reserva de gestión es del cap. 7.

## Fórmulas
- Puntuación de riesgo = **probabilidad × impacto** (escalas numéricas del plan).
- Valor neto de una ruta = **beneficios − costos** de la ruta.
- **VME** de un nodo de oportunidad = **Σ (probabilidad × valor)**; VME de un riesgo
  individual = probabilidad × impacto (amenaza negativo, oportunidad positivo).
- Rentabilidad de una respuesta = **cambio en el impacto ÷ costo de la respuesta**.
- Reserva para un nivel de confianza (curva S) = costo en ese percentil − costo
  presupuestado (lectura de la curva; la resta es criterio de Gen).

## Tablas y gráficos ilegibles o dudosos
- Gráfico 11-5: los valores de las celdas son legibles; **los colores de las zonas de
  prioridad no** → umbrales de zona = criterio de Gen.
- Gráfico 11-10: la posición de las zonas aceptable/no aceptable no es clara → no se usa
  como clave.
- Gráfico 11-14 (tornado): se leen los nombres de los elementos, no el largo de cada barra.
- En 11.6.1.2 el texto trae una línea sin traducir (en inglés); no afecta el contenido.

## Lo que más confunde (criterio de Gen hasta que llegue el profesor)
1. Creer que riesgo es solo algo malo: también hay oportunidades.
2. Confundir **riesgo** (incierto) con **incidente** (ya pasó) o con su **causa** (hecho cierto).
3. Confundir riesgo individual con riesgo general (este solo se mide bien con el cuantitativo).
4. Creer que alta probabilidad = alta prioridad: manda **probabilidad × impacto**.
5. Confundir **evitar** (probabilidad a cero) con **mitigar** (reducir).
6. Confundir **explotar** (asegurar al 100 %) con **mejorar** (aumentar).
7. Creer que **transferir** elimina el riesgo: lo pasa a otro, y suele costar una prima.
8. Creer que aceptar es «no hacer nada»: la aceptación activa crea una reserva.
9. Creer que un riesgo escalado lo sigue monitoreando el equipo.
10. Olvidar restar la inversión en el árbol de decisiones (valor neto = beneficios − costos).
11. Confundir **residual** (lo que queda) con **secundario** (lo que nace de la respuesta).
12. Creer que el análisis cuantitativo es obligatorio en todo proyecto.
13. Creer que con documentar la respuesta basta: hay que **implementarla**.
14. Confundir urgencia (plazo para responder) con proximidad (plazo para que impacte).
