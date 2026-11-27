# Ficha · Capítulo 6 de la Guía del PMBOK 6.ª ed. — Gestión del Cronograma del Proyecto

> Ficha de Gen (ayudante), 2026-11-27, **en palabras propias** (el repositorio es público:
> aquí no se copia el libro). Original en el almacén privado del proyecto
> (`gestion-proyectos/originales/`, texto del PDF, líneas 7694–9977; pp. 173–231 aprox.).
> Las páginas entre paréntesis son de la guía y son aproximadas (±1). No volver a abrir
> el original para este capítulo: todo lo que sirve está aquí.

## Mapa del capítulo y subtemas (ids para el panel docente)

| Subtema | id | Páginas |
|---|---|---|
| Qué es el cronograma; método vs. herramienta vs. modelo; programación iterativa y a demanda (Kanban) | `gp06-conceptos` | 173–178 |
| Planificar la Gestión del Cronograma: contenido del plan; umbrales de control | `gp06-planificar` | 179–182 |
| Definir las Actividades: descomposición en actividades, planificación gradual, lista de actividades, atributos, hitos | `gp06-actividades` | 183–186 |
| Secuenciar: método de diagramación por precedencia (FS, FF, SS, SF) | `gp06-pdm` | 189–190 |
| Tipos de dependencias (obligatoria/discrecional × interna/externa) | `gp06-dependencias` | 191–192 |
| Adelantos y retrasos | `gp06-adelantos` | 192–193 |
| Estimar duraciones: análoga, paramétrica, tres valores, ascendente | `gp06-estimar` | 195–203 |
| Factores de duración (rendimientos decrecientes, n.º de recursos, Parkinson, síndrome del estudiante) y reservas (contingencia vs. gestión) | `gp06-reservas` | 197–203 |
| Ruta crítica: recorrido hacia adelante y hacia atrás, holgura total y libre | `gp06-ruta-critica` | 210–211 |
| Optimización de recursos: nivelación vs. estabilización | `gp06-recursos` | 211–213 |
| Compresión: intensificación vs. ejecución rápida | `gp06-compresion` | 215–216 |
| Salidas: línea base del cronograma, representaciones (barras, hitos, red), calendarios; análisis «¿qué pasa si…?», Monte Carlo; planificación ágil de liberaciones | `gp06-cronograma` | 213–221 |
| Controlar el Cronograma: análisis de variación, tendencias, gráfica de trabajo pendiente, ruta crítica | `gp06-controlar` | 222–231 |

## Los seis procesos (grupo, entradas y salidas CLAVE, herramientas importantes)

| Proceso | Grupo | Entradas clave | Herramientas y técnicas importantes | Salidas clave | Cuándo |
|---|---|---|---|---|---|
| 6.1 Planificar la Gestión del Cronograma | Planificación | Acta (resumen de hitos); plan del alcance; enfoque de desarrollo | Juicio de expertos; análisis de alternativas; reuniones | **Plan de gestión del cronograma** | Una vez o en puntos fijos |
| 6.2 Definir las Actividades | Planificación | Plan del cronograma; **línea base del alcance** | **Descomposición**; **planificación gradual**; reuniones | **Lista de actividades**; atributos; **lista de hitos**; solicitudes de cambio | Todo el proyecto |
| 6.3 Secuenciar las Actividades | Planificación | Lista y atributos de actividades; lista de hitos; registro de supuestos | **PDM**; determinación de dependencias; **adelantos y retrasos**; PMIS | **Diagramas de red del cronograma** | Todo el proyecto |
| 6.4 Estimar la Duración de las Actividades | Planificación | Lista y atributos; requisitos y calendarios de recursos; asignaciones del equipo; registro de riesgos | Juicio de expertos; **análoga; paramétrica; tres valores; ascendente**; análisis de alternativas y **de reservas**; votación (puño de cinco); reuniones | **Estimaciones de la duración**; base de las estimaciones | Todo el proyecto |
| 6.5 Desarrollar el Cronograma | Planificación | Red del cronograma; estimaciones de duración; calendarios y requisitos de recursos; registro de riesgos | Análisis de la red; **método de la ruta crítica**; **optimización de recursos**; «¿qué pasa si…?» y simulación; adelantos y retrasos; **compresión**; PMIS; planificación ágil de liberaciones | **Línea base del cronograma**; **cronograma del proyecto**; datos del cronograma; calendarios del proyecto | Todo el proyecto |
| 6.6 Controlar el Cronograma | Monitoreo y Control | Línea base del cronograma; plan del cronograma; datos de desempeño | Valor ganado (SV, SPI); gráfica de trabajo pendiente; revisiones de desempeño; tendencias; **variación**; ruta crítica; optimización de recursos; adelantos y retrasos; compresión | Información de desempeño; **pronósticos del cronograma**; **solicitudes de cambio** (van a 4.6) | Todo el proyecto |

## Conceptos (en palabras propias)

**Qué busca el área (p. 173).** Que el proyecto termine **a tiempo**. El cronograma dice
cómo y cuándo se entregará lo del alcance; sirve para comunicar, manejar expectativas e
informar el desempeño.

**Método, herramienta, modelo (p. 175).** El equipo elige un **método** de planificación
(p. ej., ruta crítica o ágil); mete los datos (actividades, fechas, duraciones, recursos,
dependencias, restricciones) en una **herramienta**; así resulta un **modelo de
programación**, cuya salida es el **cronograma**. En proyectos pequeños, definir,
secuenciar, estimar y programar casi son un solo proceso.

**Tendencias (pp. 176–177).** **Programación iterativa con trabajo pendiente:** forma de
planificación gradual para ciclos adaptativos; historias de usuario priorizadas justo
antes de construir y periodos de trabajo fijos. **Programación a demanda** (Kanban): de
tipo *pull*, basada en la teoría de restricciones y en Lean; limita el trabajo en curso
para equilibrar demanda y capacidad; sirve cuando las tareas son de tamaño parecido.
Adaptación: ciclo de vida, disponibilidad de recursos, dimensiones del proyecto, apoyo
tecnológico. El rol del director no cambia entre predictivo y adaptativo.

**Plan de gestión del cronograma (pp. 181–182).** Puede establecer: metodología y
herramienta del modelo; **duración de liberaciones e iteraciones** (periodos
preestablecidos, *time-boxing*, que reducen la corrupción del alcance); **nivel de
exactitud** (rango aceptable, puede incluir contingencia); **unidades de medida** (horas,
días, semanas; metros, litros…); enlaces con la EDT; mantenimiento del modelo; **umbrales
de control** (variación permitida antes de actuar, por lo general **en porcentaje** de
desviación respecto de la línea base); **reglas de medición del desempeño** (valor
ganado, % completado; SV y SPI); **formatos de informes**.

**Definir las Actividades (pp. 183–186).**
- Cada **paquete de trabajo** de la EDT se descompone en **actividades**: el esfuerzo para
  completarlo. La EDT termina en **entregables**; este proceso termina en **actividades**.
- **Planificación gradual:** lo cercano se planifica en detalle y lo lejano a alto nivel;
  es elaboración progresiva (sirve en ágil y en cascada).
- **Lista de actividades:** identificador y descripción de cada actividad, con detalle
  suficiente para que el equipo entienda.
- **Atributos:** al inicio ID, ID de la EDT y nombre; después predecesoras, sucesoras,
  relaciones, adelantos y retrasos, recursos, fechas impuestas, restricciones, supuestos,
  lugar, calendario, tipo de esfuerzo.
- **Hito:** punto o evento significativo; **duración cero**. La lista de hitos dice si
  son **obligatorios** (p. ej., por contrato) u **opcionales** (p. ej., por historia).
- Al descomponer puede aparecer trabajo que no estaba en las líneas base → **solicitud
  de cambio**.

**Secuenciar (pp. 187–195).** Toda actividad, salvo la primera y la última, debe tener al
menos **una predecesora y una sucesora**. Se pasa de una lista a un diagrama.
- **PDM:** actividades en **nodos** unidas por relaciones lógicas:
  - **Final a Inicio (FS):** la sucesora no empieza hasta que termine la predecesora
    (instalar el sistema operativo después de ensamblar el PC). **La más usada.**
  - **Final a Final (FF):** la sucesora no termina hasta que termine la predecesora
    (terminar de redactar antes de terminar de editar).
  - **Inicio a Inicio (SS):** la sucesora no empieza hasta que empiece la predecesora
    (nivelar el concreto después de empezar a verterlo).
  - **Inicio a Final (SF):** la sucesora no termina hasta que empiece la predecesora (el
    sistema nuevo de cuentas por pagar debe arrancar antes de apagar el viejo). **Rara.**
  - No se recomiendan dos relaciones entre las mismas actividades ni circuitos cerrados.
- **Dependencias** (se combinan de a dos: obligatoria o discrecional + interna o externa):
  - **Obligatoria («lógica dura»):** exigida por ley, contrato o la naturaleza del trabajo
    (no hay techo sin cimientos; no se prueba un prototipo sin construirlo). Lo técnico no
    siempre es obligatorio.
  - **Discrecional («lógica preferida» o «blanda»):** por buenas prácticas, aunque otro
    orden sería posible (eléctrico después de plomería). Documentarla bien: puede crear
    holguras arbitrarias; se revisa al hacer ejecución rápida.
  - **Externa:** con algo fuera del proyecto, por lo general fuera del control del equipo
    (hardware que entrega otro; permiso ambiental del gobierno).
  - **Interna:** entre actividades del proyecto, bajo control del equipo.
- **Adelanto:** cuánto se **anticipa** la sucesora respecto de la predecesora (jardín 2
  semanas antes de terminar la obra: **FS − 2 semanas**; el software lo muestra como
  retraso negativo). **Retraso:** cuánto se **demora** la sucesora (editar 15 días después
  de empezar a escribir: **SS + 15 días**). No deben reemplazar la lógica del cronograma, y
  **las estimaciones de duración no incluyen adelantos ni retrasos**.
- **Diagrama de red:** muestra las dependencias. **Convergencia** = actividad con varias
  predecesoras; **divergencia** = con varias sucesoras; ambas tienen **más riesgo**.

**Estimar la duración (pp. 195–205).**
- Se estima con el esfuerzo y los recursos disponibles; quien mejor conoce el trabajo da
  la entrada; mejora a medida que hay más información (elaboración progresiva).
- Factores: **ley de los rendimientos decrecientes** (añadir un solo factor llega a un
  punto en que rinde cada vez menos); **duplicar recursos no reduce el tiempo a la mitad**
  (puede alargarlo por coordinación, curva de aprendizaje, transferencia de
  conocimiento); **avances tecnológicos**; **motivación**: **síndrome del estudiante**
  (dejar todo para el final) y **ley de Parkinson** (el trabajo se expande hasta llenar el
  tiempo disponible). Algunas actividades duran lo mismo sin importar los recursos
  (prueba de tensión de 24 horas).
- **Análoga:** usa la duración real de un proyecto o actividad **similar** anterior,
  ajustada por diferencias. Más **barata y rápida**, **menos exacta**; útil con poca
  información; fiable si la similitud es real y quien estima tiene pericia.
- **Paramétrica:** algoritmo con datos históricos y parámetros. **Duración = cantidad de
  trabajo ÷ rendimiento** (o × horas por unidad). Ejemplo de la guía: 1.000 m de cable a
  25 m/h = **40 h**. Puede ser **muy exacta** según la calidad del modelo y los datos.
- **Tres valores:** optimista (tO, mejor escenario), más probable (tM), pesimista (tP,
  peor escenario). La guía da en este capítulo la **distribución triangular:
  tE = (tO + tM + tP) / 3**, para cuando hay pocos datos históricos o datos subjetivos.
  (La guía presenta la **beta**, (O + 4M + P) / 6, en el capítulo 7 para costos; usarla
  para duraciones —«PERT»— es criterio de Gen y se marca así en las piezas.)
- **Ascendente:** si no se puede estimar con confianza, se descompone la actividad, se
  estiman las partes y **se suman**.
- **Análisis de alternativas:** comparar niveles de habilidad, compresión, herramientas
  manuales vs. automáticas, construir/alquilar/comprar.
- **Análisis de reservas:**
  - **Reserva para contingencias (reserva de cronograma):** **dentro** de la línea base;
    para riesgos **identificados y aceptados** (**conocidos-desconocidos**); puede ser un
    % o un número fijo de periodos; se usa, reduce o elimina con mejor información.
  - **Reserva de gestión:** **fuera** de la línea base, pero dentro de la duración total;
    para trabajo **no previsto** dentro del alcance (**desconocidos-desconocidos**);
    usarla puede exigir cambiar la línea base.
- **Puño de cinco:** votación ágil de 0 (puño) a 5 dedos; quien muestre menos de tres
  explica su objeción; consenso = todos con tres o más.
- Salida: la estimación puede llevar un **rango**: «2 semanas ± 2 días» = entre 8 y 12
  días (semana de 5 días); «15 % de probabilidad de pasar de 3 semanas» = 85 % de
  terminar en 3 semanas o menos. **Base de las estimaciones:** cómo se hicieron,
  supuestos, restricciones, rango, nivel de confianza, riesgos.

**Desarrollar el Cronograma (pp. 205–221).** Iterativo: se revisan duraciones,
recursos y reservas hasta un cronograma aprobable; luego cada responsable confirma que
sus fechas no chocan con su calendario.
- **Análisis de la red:** técnica global; incluye ruta crítica, optimización de recursos
  y modelado; evalúa reservas donde las rutas convergen o divergen.
- **Método de la ruta crítica (CPM):** calcula **inicio y fin tempranos** (recorrido
  **hacia adelante**) y **tardíos** (recorrido **hacia atrás**) **sin considerar límites de
  recursos**. **Ruta crítica** = la secuencia **más larga**, que fija la **menor
  duración posible** del proyecto; tiene la menor holgura total, por lo general **cero**.
  - Siglas que usan los Hacer (las del software en inglés): **ES** inicio temprano, **EF**
    fin temprano, **LS** inicio tardío, **LF** fin tardío. Adelante: EF = ES + duración;
    ES de una sucesora = mayor EF de sus predecesoras. Atrás: LS = LF − duración; LF de
    una predecesora = menor LS de sus sucesoras.
  - **Holgura total:** cuánto puede demorarse una actividad desde su inicio temprano **sin
    retrasar el fin del proyecto** ni violar restricciones. Cálculo: **LS − ES** (= LF − EF).
  - **Holgura libre:** cuánto puede demorarse **sin retrasar el inicio temprano de ningún
    sucesor**. Cálculo: **ES mínimo de los sucesores − EF propio** (convención de inicio en 0).
  - Las dos restas son la forma estándar de aplicar estas definiciones; la guía las da en
    palabras y con el gráfico 6-16, no como fórmula escrita.
  - La holgura total puede ser positiva, cero o **negativa** (si se viola una fecha
    impuesta); el **análisis de holgura negativa** busca cómo acelerar. Puede haber
    **rutas casi críticas**.
  - Ejemplo de la guía (gráfico 6-16): rutas A–B–D = 25 y A–C–D = 30 → crítica A–C–D;
    holgura libre de B = 5 días. La guía cuenta desde el **día 1**; otras convenciones
    (empezar en 0) también son aceptadas. **Los Hacer usan la convención de inicio en 0**
    y lo dicen en pantalla.
- **Optimización de recursos:**
  - **Nivelación:** mueve fechas para que la demanda de un recurso no supere la oferta
    (p. ej., una persona asignada a dos actividades el mismo día = 16 h). **Puede cambiar
    la ruta crítica** y, a menudo, **alarga** el proyecto.
  - **Estabilización (suavizado):** solo mueve actividades **dentro de su holgura**; **no
    cambia la ruta crítica ni la fecha de fin**; puede no resolver todo.
- **Análisis de datos:** **«¿Qué pasa si…?»** (escenarios: retraso de un proveedor, huelga,
  cambio en permisos) y **simulación Monte Carlo** (distribución de fechas posibles; p.
  ej., 10 % de probabilidad de terminar en la fecha X, 90 % en la fecha Y).
- **Compresión del cronograma** (acortar **sin reducir el alcance**):
  - **Intensificación (crashing):** **añadir recursos** (horas extra, más personas, pagar
    por entrega rápida) **con el menor costo adicional**. Solo sirve en actividades de la
    **ruta crítica** donde más recursos sí acortan. Sube **costo** y puede subir riesgo.
  - **Ejecución rápida (fast tracking):** hacer **en paralelo** lo que iba en secuencia
    (cimientos antes de terminar todos los planos). Sube el **riesgo** y el **retrabajo**;
    solo sirve si las actividades solapadas están en la ruta crítica. Gráfico 6-19:
    intensificación → costo elevado; ejecución rápida → riesgo elevado.
- **Planificación ágil de liberaciones:** visión → hoja de ruta → plan de liberación
  (normalmente 3 a 6 meses) → iteraciones → historias (en puntos) → tareas (en horas).
- **Salidas:**
  - **Línea base del cronograma:** versión **aprobada** del modelo; solo cambia por
    control formal de cambios; se compara con las fechas reales.
  - **Cronograma del proyecto:** como mínimo, inicio y fin planificados de cada
    actividad. Formatos: **diagrama de barras (Gantt)** (fácil de leer), **diagrama de
    hitos** (solo inicios o fines de entregables principales e interfaces clave),
    **diagrama de red** (actividad en el nodo, sin escala, o con escala de tiempo). Puede
    ser resumen (maestro o de hitos) o detallado.
  - **Datos del cronograma:** hitos, actividades, atributos, supuestos; además
    histogramas de recursos, cronogramas alternativos, flujo de caja.
  - **Calendario del proyecto:** días y turnos laborables; puede haber varios.

**Controlar el Cronograma (pp. 222–231).** Saber el estado real, influir en lo que causa
cambios, reconsiderar reservas, gestionar cambios cuando ocurren. Todo cambio a la
línea base pasa por **Realizar el Control Integrado de Cambios (4.6)**.
- En ágil: comparar trabajo entregado y aceptado con lo estimado; retrospectivas;
  repriorizar pendientes; **velocidad** por iteración (por lo general 2 semanas o 1 mes).
- **Valor ganado:** SV y SPI miden la desviación respecto de la línea base (fórmulas en
  el cap. 7, 7.4.2.2).
- **Gráfica de trabajo pendiente de la iteración (burndown):** línea ideal diagonal vs.
  trabajo restante real; una **línea de tendencia** pronostica cuándo se termina.
- **Revisiones de desempeño**, **análisis de tendencias** y **análisis de variación**
  (fechas y duraciones planificadas vs. reales, variación de holgura). **Clave:** un
  retraso **grande fuera de la ruta crítica** puede afectar poco; uno **pequeño en una
  actividad crítica o casi crítica** puede exigir acción inmediata.
- Para recuperar: ajustar **adelantos y retrasos**, **comprimir**, optimizar recursos.
- Salidas: información de desempeño, **pronósticos** (fechas futuras estimadas con lo
  ocurrido), solicitudes de cambio, actualizaciones de la línea base. Si el retraso es muy
  grave, puede hacer falta un **cronograma objetivo** nuevo.

## Lo que más confunde (criterio de Gen hasta que llegue el profesor)
1. Creer que la ruta crítica es la de actividades más importantes (es la **más larga**).
2. Confundir holgura total con holgura libre.
3. Creer que duplicar la gente divide el tiempo a la mitad.
4. Intensificar una actividad que no está en la ruta crítica (no adelanta el fin).
5. Hacer ejecución rápida sobre una dependencia obligatoria (permiso legal, física).
6. Confundir nivelación (puede mover el fin) con estabilización (no lo mueve).
7. Meter adelantos y retrasos dentro de la estimación de duración.
8. Confundir reserva para contingencias (dentro de la línea base) con la de gestión (fuera).
9. Darle duración a un hito.
10. Confundir actividades (cronograma) con entregables (EDT).
