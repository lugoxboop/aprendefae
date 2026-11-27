# Ficha · Capítulo 8 de la Guía del PMBOK 6.ª ed. — Gestión de la Calidad del Proyecto

> Ficha de Gen, 2026-11-27, **en palabras propias** (el repositorio es público: aquí no
> se copia el libro). Original en el almacén privado del proyecto:
> `gestion-proyectos/originales/PMBOK-6-guia-ES.txt` (cap. 8 = pp. 271–307). Las páginas
> entre paréntesis son de la guía. No volver a abrir el original para este capítulo.

## Mapa del capítulo y subtemas (ids para el panel docente)

| Subtema | id | Páginas |
|---|---|---|
| Qué cubre el área, sus 3 procesos y cómo se conectan; calidad del proyecto y del producto | `gp08-panorama` | 271–274 |
| Calidad vs. grado | `gp08-calidad-grado` | 275 |
| Prevención vs. inspección; muestreo por atributos vs. por variable; tolerancias vs. límites de control | `gp08-prevencion` | 275 |
| Costo de la calidad (COQ): prevención, evaluación, fallas internas y externas | `gp08-coq` | 275, 283–284 |
| Cinco niveles de gestión de la calidad | `gp08-niveles` | 276 |
| Tendencias (satisfacción, mejora continua PDCA, responsabilidad de la dirección, proveedores), adaptación y ágil | `gp08-tendencias` | 276–277 |
| Planificar la Gestión de la Calidad: plan, métricas, técnicas | `gp08-planificar` | 278–288 |
| Gestionar la Calidad (aseguramiento): quién, para qué, salidas | `gp08-gestionar` | 289–298 |
| Herramientas de representación: causa-efecto, histograma, dispersión, afinidad, flujo, matricial, SIPOC | `gp08-herramientas` | 285–286, 294–295, 305 |
| Auditorías de calidad | `gp08-auditorias` | 295–296 |
| Resolución de problemas, métodos de mejora (PDCA, Six Sigma) y Diseño para X | `gp08-mejora` | 296–297 |
| Controlar la Calidad: recopilación de datos, inspección, pruebas, salidas | `gp08-controlar` | 299–307 |
| Diagramas de control | `gp08-diagrama-control` | 305 |

## Conceptos (en palabras propias)

**El área (p. 271).** Lleva la **política de calidad de la organización** a la
planificación, la gestión y el control de los **requisitos de calidad del proyecto y del
producto**, para satisfacer a los interesados. También apoya la mejora continua de
procesos de la organización. Cubre la calidad **de la dirección del proyecto** y la **de
sus entregables**; las medidas cambian según el tipo de entregable (software ≠ central
nuclear).

**Cómo se conectan los 3 procesos (p. 273).** Planificar define **qué calidad** debe tener
el trabajo. Gestionar convierte esos requisitos en **instrumentos de prueba y evaluación**
y vigila los procesos durante todo el proyecto. Controlar **compara los resultados** con
los requisitos para asegurar que sean aceptables. Dos salidas del área las usan otras
áreas: **entregables verificados** e **informes de calidad**.

**Incumplir la calidad cuesta (p. 274).** Ejemplos de la guía: hacer trabajar horas
extra al equipo para cumplir al cliente puede bajar ganancias, subir riesgos, provocar
renuncias, errores o retrabajo; apurar las inspecciones para cumplir el cronograma puede
dejar errores sin detectar y subir riesgos después de implementar.

**Calidad vs. grado (p. 275).**
- **Calidad:** grado en que un conjunto de características inherentes **cumple con los
  requisitos** (definición ISO 9000 que cita la guía).
- **Grado:** **categoría** que se asigna a entregables con el **mismo uso funcional** pero
  **características técnicas distintas** (más o menos funciones).
- Calidad que no cumple requisitos **siempre es un problema**; un grado bajo **puede no
  serlo**. Bajo grado + alta calidad = puede servir para uso general. Alto grado + baja
  calidad = problema (muchas funciones que fallan).
- El director y su equipo gestionan el compromiso entre ambos.

**Prevención mejor que inspección (p. 275).** Es mejor **incorporar** la calidad en los
entregables que encontrar problemas al inspeccionar: prevenir cuesta mucho menos que
corregir lo que detecta la inspección o el uso. Pares que el equipo debe distinguir:
- **Prevención** (que no haya errores en el proceso) vs. **inspección** (que los errores
  no lleguen al cliente).
- **Muestreo por atributos** (el resultado es conforme o no conforme) vs. **por
  variable** (se mide en una escala continua).
- **Tolerancias** (rango de resultados aceptables) vs. **límites de control** (fronteras
  de la variación normal de un proceso estable).

**Costo de la calidad, COQ (pp. 275, 283–284, gráfico 8-5).** Todos los costos durante
la vida del producto por: prevenir la no conformidad, evaluar la conformidad y no cumplir
(retrabajo).

| Grupo | Para qué | Ejemplos de la guía |
|---|---|---|
| **Costos de conformidad** (gastados durante el proyecto para evitar fallas) | | |
| · Prevención | construir un producto de calidad | capacitación, documentar procesos, equipos, tiempo para hacerlo bien |
| · Evaluación | evaluar la calidad | pruebas, pérdida en pruebas destructivas, inspecciones |
| **Costos de no conformidad** (gastados durante y después del proyecto por fallas) | | |
| · Fallas internas | las revela el proyecto | retrabajo, desecho |
| · Fallas externas | las encuentra el cliente | obligaciones, trabajos en garantía, pérdida de negocio |

- Fallas = **costos por calidad deficiente**. Internas = las constata el equipo; externas
  = el cliente.
- **COQ óptimo:** el equilibrio de invertir en prevención y evaluación para evitar fallas;
  hay un punto en que más prevención o evaluación ya **no es beneficiosa**.
- Como el proyecto es temporal, el COQ del ciclo de vida del producto suele preocupar al
  **programa, portafolio, PMO u operaciones**.
- Defectos detectados en **encuestas** después del despliegue = costos de fallas
  externas (p. 304).

**Cinco niveles, de menos a más eficaz (p. 276).**
1. Dejar que **el cliente** encuentre los defectos (el más caro: garantías, retiros,
   reputación, retrabajo).
2. **Detectar y corregir** antes de enviar (control de calidad: costos de evaluación y de
   fallas internas).
3. Usar el **aseguramiento de calidad** para corregir **el proceso**, no solo defectos
   sueltos.
4. **Incorporar la calidad** en la planificación y el diseño del proyecto y del producto.
5. Crear una **cultura** de toda la organización comprometida con la calidad.

**Tendencias (pp. 276–277).** Minimizar la variación y cumplir requisitos de los
interesados:
- **Satisfacción del cliente** = conformidad con los requisitos + **adecuación para el
  uso** (que satisfaga necesidades reales).
- **Mejora continua:** ciclo **planificar-hacer-verificar-actuar (PDCA)** de Shewhart,
  modificado por Deming; también TQM, Six Sigma, Lean Six Sigma.
- **Responsabilidad de la dirección:** todos participan, pero la dirección da los
  recursos adecuados.
- **Asociación mutuamente beneficiosa con proveedores:** preferir relación a largo plazo
  sobre ganancia a corto plazo.
**Adaptación (p. 277):** políticas y auditoría, estándares y normas, cómo se gestiona la
mejora continua, colaboración con interesados y proveedores.
**Ágil (p. 277):** pasos de calidad y revisión **frecuentes a lo largo** del proyecto, no al
final; **retrospectivas** recurrentes que buscan causa raíz y prueban nuevos enfoques;
**lotes pequeños** para descubrir problemas temprano, cuando cambiar cuesta menos.

### Los 3 procesos

| Proceso | Grupo de procesos | Entradas clave | Herramientas y técnicas clave | Salidas clave | Frecuencia |
|---|---|---|---|---|---|
| 8.1 Planificar la Gestión de la Calidad | Planificación | Acta; plan de requisitos, de riesgos y de involucramiento; **línea base del alcance (criterios de aceptación)**; documentación de requisitos; matriz de trazabilidad; registro de interesados | Juicio de expertos; estudios comparativos, tormenta de ideas, entrevistas; **análisis costo-beneficio; costo de la calidad**; decisión multicriterio; diagramas de flujo, modelo lógico de datos, diagramas matriciales, mapeo mental; **planificación de pruebas e inspección**; reuniones | **Plan de gestión de la calidad; métricas de calidad** | Una vez o en puntos predefinidos |
| 8.2 Gestionar la Calidad | Ejecución | Plan de gestión de la calidad; **mediciones de control de calidad**; métricas; informe de riesgos | **Listas de verificación**; análisis de alternativas, de documentos, de procesos, **de causa raíz**; decisión multicriterio; **afinidad, causa y efecto, flujo, histogramas, matriciales, dispersión**; **auditorías**; **Diseño para X**; **resolución de problemas**; **métodos de mejora** | **Informes de calidad; documentos de prueba y evaluación**; solicitudes de cambio | Todo el proyecto |
| 8.3 Controlar la Calidad | Monitoreo y Control | Plan de gestión de la calidad; métricas; documentos de prueba y evaluación; **solicitudes de cambio aprobadas; entregables**; datos de desempeño | **Listas y hojas de verificación, muestreo estadístico, cuestionarios y encuestas**; revisiones del desempeño, causa raíz; **inspección; pruebas**; causa y efecto, **diagramas de control**, histograma, dispersión; reuniones (revisión de cambios aprobados, retrospectivas) | **Mediciones de control de calidad; entregables verificados**; información de desempeño; solicitudes de cambio | Todo el proyecto |

**8.1 Planificar (pp. 278–288).**
- Va **en paralelo** con la demás planificación (un cambio para cumplir un estándar puede
  mover costo o cronograma).
- Los **criterios de aceptación** del enunciado del alcance pueden subir o bajar mucho los
  costos de calidad; cumplirlos todos = necesidades de los interesados cumplidas.
- **Estudios comparativos:** comparar con proyectos parecidos (dentro o fuera, misma u
  otra industria) para hallar mejores prácticas y una base de medida.
- **Entrevistas:** en ambiente de confianza para obtener aportes honestos.
- **Análisis costo-beneficio:** ¿la actividad de calidad compensa? Beneficios de cumplir:
  menos retrabajo, más productividad, menores costos, más satisfacción, más rentabilidad.
- **Decisión multicriterio** (ej. matriz de priorización): criterios con peso → puntaje por
  alternativa → orden; aquí ayuda a priorizar métricas.
- **Diagramas de flujo / mapas de procesos:** pasos, decisiones, ramas, rutas paralelas.
  Versión de cadena de valor: **SIPOC** (proveedores, entradas, proceso, salidas,
  clientes). Sirven para estimar el COQ de un proceso y ver dónde ocurren defectos o dónde
  poner verificaciones.
- **Modelo lógico de datos:** dónde pueden surgir problemas de integridad de datos.
- **Diagramas matriciales** (formas L, T, Y, X, C, techo): fuerza de relación entre
  factores, causas y objetivos; aquí identifican métricas clave.
- **Mapeo mental:** organizar ideas alrededor de un concepto central.
- **Planificación de pruebas e inspección:** cómo probar o inspeccionar; depende de la
  industria (alfa y beta en software, resistencia en construcción, inspección en
  fabricación, pruebas de campo y no destructivas en ingeniería).
- **Plan de gestión de la calidad** (parte del plan para la dirección; formal o informal):
  estándares, objetivos de calidad, roles y responsabilidades, entregables y procesos
  sujetos a revisión, actividades de control y de gestión, herramientas, procedimientos
  (no conformidad, acciones correctivas, mejora continua). Conviene revisarlo temprano.
- **Métrica de calidad:** describe un **atributo** del producto o proyecto **y cómo lo
  verificará** Controlar la Calidad. Ejemplos de la guía: % de tareas a tiempo, CPI, tasa
  de fallas, defectos por día, tiempo de inactividad por mes, errores por línea de código,
  satisfacción del cliente, % de requisitos cubiertos por el plan de pruebas.
- La **frecuencia y el tamaño de las muestras** se fijan al planificar (p. 304).

**8.2 Gestionar (pp. 289–298).**
- A veces se llama **aseguramiento de calidad**, pero es más amplio: incluye todo el
  aseguramiento (centrado en **los procesos** del proyecto, en usarlos con eficacia) y
  además diseño del producto y mejora de procesos. Es **trabajo de conformidad** en el COQ.
- Ayuda a: diseñar un producto óptimo; dar **confianza** de que el producto cumplirá
  (auditorías, análisis de fallas); confirmar que se usan los procesos de calidad; mejorar
  eficiencia y eficacia.
- **Es trabajo de todos:** director, equipo, patrocinador, dirección de la organización y
  hasta el cliente. En ágil lo hace todo el equipo todo el tiempo; en lo tradicional,
  miembros específicos.
- **Lista de verificación:** herramienta estructurada para comprobar pasos o requisitos;
  debe incluir los criterios de aceptación.
- **Análisis de procesos:** oportunidades de mejora, actividades sin valor agregado.
- **Análisis de causa raíz:** el motivo de fondo de una variación, defecto o riesgo; una
  causa raíz puede explicar varios; **eliminadas todas las causas raíz, el problema no se
  repite**.
- **Diagramas:** de **afinidad** (agrupan causas posibles en familias); de **causa y
  efecto** (espina de pescado, por qué-por qué, Ishikawa: ramas de causas de un problema
  hasta la raíz; el gráfico 8-9 usa ramas Material, Entorno, Gestión, Personas, Proceso,
  Equipos); de **flujo** (pasos que llevan al defecto); **histogramas** (datos numéricos:
  defectos por entregable, por causa, veces que un proceso no cumple); **matriciales**;
  de **dispersión** (relación entre dos variables).
- **Auditoría:** proceso **estructurado e independiente** que verifica si las actividades
  cumplen las políticas, procesos y procedimientos. La hace normalmente alguien **externo
  al proyecto** (PMO, auditoría interna, auditor externo). Objetivos: identificar buenas y
  mejores prácticas; identificar **no conformidades, brechas y defectos**; compartir buenas
  prácticas; **ayudar de forma proactiva y positiva** a mejorar; aportar al repositorio de
  lecciones aprendidas. Pueden ser programadas o aleatorias, internas o externas; pueden
  confirmar que se implementaron los cambios aprobados.
- **Diseño para X (DfX):** guías técnicas para optimizar un aspecto del diseño; la X puede
  ser fiabilidad, despliegue, ensamblado, fabricación, costo, servicio, facilidad de uso,
  seguridad, calidad.
- **Resolución de problemas, 6 pasos:** definir el problema → identificar la causa raíz →
  generar soluciones → elegir la mejor → implementarla → verificar su efectividad.
- **Métodos de mejora:** PDCA y Six Sigma, los más comunes.
- **Salidas:** **informes de calidad** (gráficos, numéricos o cualitativos: incidentes
  escalados, recomendaciones de mejora, acciones correctivas como retrabajo o inspección
  del 100 %, resumen de Controlar la Calidad); **documentos de prueba y evaluación** (listas
  de verificación, matrices de trazabilidad: entrada de Controlar); solicitudes de cambio
  (por Control Integrado de Cambios); actualizaciones al registro de incidentes, de
  lecciones y de riesgos.

**8.3 Controlar (pp. 299–307).**
- Mide **integridad, cumplimiento y adecuación para el uso** antes de la aceptación y la
  entrega; demuestra con datos fiables que se cumplen los criterios de aceptación.
- El esfuerzo varía por industria (farmacéutica, salud, transporte, nuclear: más
  estricto). En ágil lo hace todo el equipo todo el ciclo; en cascada, en momentos
  específicos hacia el final de la fase, por miembros específicos.
- **Solicitudes de cambio aprobadas:** su implementación se **verifica, se confirma
  completa, se vuelve a probar y se certifica**; la ejecución parcial causa incoherencias.
- **Entregables** (de Dirigir y Gestionar el Trabajo) se inspeccionan contra los criterios
  de aceptación.
- **Hojas de verificación** (hojas de anotaciones): organizan la recolección de datos de
  atributos durante la inspección (frecuencias de defectos). El gráfico 8-12 muestra 6 tipos
  de defecto × 4 fechas con totales (reconstruido y verificado: totales 7, 1, 9, 8, 6, 6).
- **Muestreo estadístico:** inspeccionar una parte de la población (ej. 10 planos de 75).
- **Cuestionarios y encuestas:** satisfacción del cliente tras desplegar.
- **Revisiones del desempeño:** métricas planificadas contra resultados reales.
- **Inspección:** examinar el producto contra estándares documentados; a cualquier nivel
  (una actividad o el producto final); también verifica reparaciones de defectos; puede
  llamarse revisión, revisión entre pares, auditoría o ensayo.
- **Pruebas:** investigación organizada para encontrar errores y no conformidades; se
  planifican en el plan de calidad; las **tempranas** bajan el costo de reparar. Ejemplos:
  software (unidades, integración, caja negra y blanca, interfaz, regresión, alfa),
  construcción (resistencia del cemento, trabajabilidad del concreto, no destructivas,
  suelos), hardware (estrés, larga duración, sistema).
- **Diagramas de control (p. 305):** dicen si un proceso es **estable o predecible**.
  **Límites de especificación** (superior e inferior) = salen de los **requisitos**
  (máximo y mínimo permitidos). **Límites de control** = se **calculan estadísticamente**
  (capacidad natural del proceso estable) y **son distintos** de los de especificación. El
  director usa los límites de control para saber dónde aplicar medidas correctivas y
  evitar quedar fuera de ellos. Sirven para lotes repetitivos y también para variaciones de
  costo y cronograma, volumen o frecuencia de cambios de alcance.
- **Reuniones:** revisión de cambios aprobados; **retrospectivas** (qué salió bien, qué
  mejorar, qué incorporar ahora y en el futuro, qué agregar a los activos de la
  organización).
- **Salidas:** **mediciones de control de calidad** (resultados documentados, en el formato
  del plan); **entregables verificados** → entrada de **Validar el Alcance** para la
  aceptación formal; información de desempeño (cumplimiento, causas de rechazo, retrabajo,
  recomendaciones); solicitudes de cambio; actualizaciones: un entregable que no cumple se
  suele registrar como **incidente**; lecciones aprendidas; riesgos; documentos de prueba.

⚠ **Pareto:** esta edición **no menciona el diagrama de Pareto** en el capítulo 8 (ni en el
resto del texto). Lo más cercano es el **histograma que clasifica defectos por causa**. En
los Hacer se trabaja como «histograma de causas»; si el profesor quiere Pareto, se agrega
como material suyo.
⚠ La relación exacta de cada causa con su rama en el gráfico 8-9 llegó desordenada: se usan
solo los nombres de las seis ramas; las claves de clasificación son de Gen.

## Lo que más confunde (criterio de Gen hasta que llegue el profesor)
1. Creer que **grado bajo = mala calidad** (bajo grado puede ser de alta calidad).
2. Confundir **gestionar** (procesos, aseguramiento, Ejecución) con **controlar**
   (resultados, inspección, Monitoreo y Control).
3. Pensar que inspeccionar más es la mejor estrategia: **prevenir** cuesta menos.
4. Poner las pruebas como «falla» en el COQ: son **evaluación** (conformidad).
5. Confundir **límites de control** (estadísticos) con **límites de especificación**
   (requisitos).
6. Creer que la calidad es tarea solo del área de calidad: es de **todos**.
7. Creer que la auditoría la hace el propio equipo para buscar culpables: es
   **independiente** y busca mejorar.
8. Confundir **lista de verificación** (¿se hicieron los pasos?) con **hoja de
   verificación** (anotar frecuencias de defectos).
9. Pensar que el entregable verificado ya está aceptado: falta **Validar el Alcance**.
