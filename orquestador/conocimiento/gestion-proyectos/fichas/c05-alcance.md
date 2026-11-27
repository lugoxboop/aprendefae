# Ficha · Capítulo 5 de la Guía del PMBOK 6.ª ed. — Gestión del Alcance del Proyecto

> Ficha de Gen (ayudante), 2026-11-27, **en palabras propias** (el repositorio es público:
> aquí no se copia el libro). Original en el almacén privado del proyecto
> (`gestion-proyectos/originales/`, texto del PDF, líneas 5895–7693; pp. 129–172 aprox.).
> Las páginas entre paréntesis son de la guía y son aproximadas (±1). No volver a abrir
> el original para este capítulo: todo lo que sirve está aquí.

## Mapa del capítulo y subtemas (ids para el panel docente)

| Subtema | id | Páginas |
|---|---|---|
| Alcance del producto vs. alcance del proyecto; con qué se mide cada uno; qué es un requisito | `gp05-dos-alcances` | 131–132 |
| Alcance en ciclos predictivos vs. adaptativos (qué procesos se repiten por iteración; registro de trabajos pendientes) | `gp05-adaptativo` | 131–134 |
| Planificar la Gestión del Alcance: plan de gestión del alcance y plan de gestión de los requisitos | `gp05-planificar` | 134–138 |
| Técnicas para recopilar requisitos (entrevistas, grupos focales, encuestas, estudios comparativos, análisis de documentos, observación, facilitación, prototipos, diagrama de contexto) | `gp05-tecnicas` | 142–147 |
| Toma de decisiones en grupo (unanimidad, mayoría, pluralidad, autocrática, multicriterio) y técnica de grupo nominal | `gp05-decisiones` | 144–145 |
| Documentación de requisitos: categorías y condiciones para entrar a la línea base | `gp05-requisitos` | 147–148 |
| Matriz de trazabilidad de requisitos | `gp05-trazabilidad` | 148–149 |
| Definir el Alcance: enunciado del alcance; diferencia con el acta (tabla 5-1); análisis del producto | `gp05-enunciado` | 150–155 |
| Crear la EDT/WBS: descomposición, paquete de trabajo, regla del 100 %, enfoques, planificación gradual | `gp05-edt` | 156–161 |
| Línea base del alcance: enunciado + EDT + diccionario; cuenta de control; paquete de planificación | `gp05-linea-base` | 161–162 |
| Validar el Alcance y su diferencia con Controlar la Calidad | `gp05-validar` | 163–167 |
| Controlar el Alcance: análisis de variación y de tendencias; corrupción (deslizamiento) del alcance | `gp05-controlar` | 167–172 |

## Los seis procesos (grupo, entradas y salidas CLAVE, herramientas importantes)

| Proceso | Grupo | Entradas clave | Herramientas y técnicas importantes | Salidas clave | Cuándo |
|---|---|---|---|---|---|
| 5.1 Planificar la Gestión del Alcance | Planificación | Acta de constitución; plan para la dirección (plan de calidad, ciclo de vida, enfoque de desarrollo) | Juicio de expertos; análisis de alternativas; reuniones | **Plan de gestión del alcance**; **plan de gestión de los requisitos** | Una vez o en puntos fijos |
| 5.2 Recopilar Requisitos | Planificación | Acta; registro de interesados; caso de negocio; acuerdos; registro de supuestos | Recopilación de datos (tormenta de ideas, entrevistas, grupos focales, cuestionarios, estudios comparativos); análisis de documentos; votación y multicriterio; afinidad y mapeo mental; grupo nominal, observación, facilitación; diagrama de contexto; prototipos | **Documentación de requisitos**; **matriz de trazabilidad** | Una vez o en puntos fijos |
| 5.3 Definir el Alcance | Planificación | Acta; documentación de requisitos; registro de supuestos; registro de riesgos | Análisis de alternativas; multicriterio; facilitación; **análisis del producto** | **Enunciado del alcance del proyecto** | Una vez o en puntos fijos (muy iterativo) |
| 5.4 Crear la EDT/WBS | Planificación | Enunciado del alcance; documentación de requisitos; plantillas de EDT | Juicio de expertos; **descomposición** | **Línea base del alcance** | Una vez o en puntos fijos |
| 5.5 Validar el Alcance | Monitoreo y Control | **Entregables verificados** (vienen de Controlar la Calidad); línea base del alcance; matriz de trazabilidad; informes de calidad | **Inspección**; votación | **Entregables aceptados**; solicitudes de cambio; información de desempeño | Periódicamente, cuando se necesita |
| 5.6 Controlar el Alcance | Monitoreo y Control | Línea base del alcance; plan de gestión de cambios y de configuración; datos de desempeño | Análisis de **variación** y de **tendencias** | Información de desempeño; **solicitudes de cambio** (van a Realizar el Control Integrado de Cambios, 4.6) | Todo el proyecto |

## Conceptos (en palabras propias)

**Qué busca el área (p. 129).** Que el proyecto haga **todo el trabajo necesario y solo
ese trabajo**. Su núcleo: decidir y vigilar qué entra y qué no entra.

**Dos alcances (p. 131).**
- **Alcance del producto:** las características y funciones de lo que se entrega (qué hace
  la app). Su conclusión se mide **contra los requisitos del producto**.
- **Alcance del proyecto:** el trabajo que hay que hacer para entregarlo (diseñar,
  programar, probar, capacitar, dirigir). Su conclusión se mide **contra el plan para la
  dirección del proyecto**. A veces se usa «alcance del proyecto» incluyendo al del producto.
- **Requisito:** condición o capacidad que debe tener el producto, servicio o resultado
  para cumplir un acuerdo u otra especificación impuesta formalmente.

**Predictivo vs. adaptativo (pp. 131–134).**
- Predictivo: los entregables se definen al comienzo; Recopilar Requisitos, Definir el
  Alcance y Crear la EDT se hacen al principio y se actualizan con control de cambios;
  **Validar** ocurre con cada entregable o revisión de fase; **Controlar** es continuo.
  La línea base = enunciado + EDT + diccionario aprobados.
- Adaptativo/ágil: el alcance se descompone en un **registro de trabajos pendientes**
  (requisitos, historias de usuario); antes de cada iteración el equipo elige cuántos
  elementos prioritarios caben. **Recopilar, Definir y Crear la EDT se repiten en cada
  iteración**, y también **Validar y Controlar**. Patrocinador y cliente participan todo el
  tiempo. Se invierte menos tiempo en fijar el alcance al inicio y más en descubrirlo
  (prototipos, versiones). En ágil, los requisitos *son* el registro de pendientes.
- Tendencia: colaborar con el **analista de negocios** (si existe, los requisitos son su
  responsabilidad; el director asegura que estén en el plan, a tiempo y en presupuesto).
- Adaptación: gestión del conocimiento y requisitos, validación y control, enfoque de
  desarrollo, **estabilidad de los requisitos**, gobernanza.

**Plan de gestión del alcance (p. 137).** Componente del plan para la dirección que dice
cómo se va a: elaborar el enunciado; crear la EDT a partir de él; aprobar y mantener la
línea base; obtener la aceptación formal de los entregables. Puede ser formal o informal.

**Plan de gestión de los requisitos (p. 137).** Dice cómo se analizan, documentan y
gestionan los requisitos: cómo se planifican, siguen e informan sus actividades; gestión
de la configuración (cómo se inicia un cambio, cómo se analiza su impacto, quién lo
autoriza); **cómo se priorizan**; qué **métricas** se usan y por qué; la **estructura de
trazabilidad**. Algunas organizaciones lo llaman plan de análisis de negocios.

**Técnicas para recopilar requisitos (pp. 142–147).**
- **Tormenta de ideas:** generar muchas ideas.
- **Entrevistas:** diálogo directo (individual o grupal); útiles para **información
  confidencial** y para hablar con expertos y ejecutivos.
- **Grupos focales:** interesados y expertos preseleccionados con un **moderador**; más
  conversacional que una entrevista.
- **Cuestionarios y encuestas:** muchos encuestados, **dispersos**, respuesta **rápida**,
  análisis estadístico.
- **Estudios comparativos (benchmarking):** compararse con organizaciones similares
  (internas o externas) para encontrar mejores prácticas.
- **Análisis de documentos:** revisar documentos existentes (procesos, reglas de negocio,
  leyes y ordenanzas, registro de incidentes, solicitudes de propuesta, casos de uso…).
- **Diagramas de afinidad** (agrupar muchas ideas) y **mapeo mental** (unir ideas en un
  esquema con puntos comunes y diferencias).
- **Técnica de grupo nominal:** (1) cada uno escribe ideas en silencio; (2) el moderador
  las anota todas; (3) se discuten hasta entenderlas; (4) votación privada de 1 a 5 (en
  rondas) para priorizar.
- **Observación/conversación («job shadowing»):** mirar a la persona hacer su trabajo;
  sirve cuando a los usuarios les cuesta expresar lo que necesitan; puede ser
  observador externo o **participante** (hace el trabajo para descubrir requisitos ocultos).
- **Facilitación:** talleres con interesados clave para acordar requisitos entre áreas;
  ejemplos: **JAD** (software), **QFD** (manufactura, parte de la «voz del cliente») e
  **historias de usuario** (rol, objetivo, motivación).
- **Diagrama de contexto:** modelo del alcance que muestra el sistema, los actores que le
  dan entradas y los que reciben sus salidas.
- **Prototipos:** modelo del producto antes de construirlo (maqueta, modelo 2D/3D,
  simulación); ciclos de prueba y retroalimentación. **Guiones gráficos (storyboards):**
  secuencia de imágenes; en software, rutas de navegación entre pantallas.

**Toma de decisiones (p. 144).**
- **Unanimidad:** todos de acuerdo.
- **Mayoría:** más del **50 %** de los miembros (grupo impar para evitar empates).
- **Pluralidad:** gana el bloque más grande **aunque no sea mayoría**; se usa con más de
  dos opciones.
- **Autocrática:** una persona decide por el grupo.
- **Análisis de decisiones con múltiples criterios:** matriz con criterios (riesgo,
  incertidumbre, valoración) para evaluar y ordenar muchas ideas.

**Documentación de requisitos (pp. 147–148).** Antes de entrar a la línea base, cada
requisito debe ser **inequívoco (medible y comprobable), trazable, completo, coherente y
aceptable** para los interesados clave. Categorías:
- **De negocio:** necesidades de la organización (problema u oportunidad, por qué se hace).
- **De los interesados:** necesidades de un interesado o grupo.
- **De la solución:** prestaciones y funciones del producto; se dividen en
  **funcionales** (comportamientos: acciones, procesos, datos, interacciones) y **no
  funcionales** (cualidades: confiabilidad, seguridad, desempeño, nivel de servicio,
  soporte, retención).
- **De transición y preparación:** capacidades temporales para pasar del estado actual
  al futuro (conversión de datos, capacitación).
- **Del proyecto:** condiciones que el proyecto debe cumplir (fechas de hitos,
  obligaciones del contrato, restricciones).
- **De calidad:** criterios para validar que un entregable está bien terminado
  (pruebas, certificaciones, validaciones).

**Matriz de trazabilidad (pp. 148–149).** Cuadrícula que une cada requisito con **su
origen** (necesidad u objetivo de negocio, objetivo del proyecto) y con **lo que lo
satisface** (entregable de la EDT, diseño, desarrollo, **caso de prueba**). Sirve para que
cada requisito agregue valor, para seguirlo todo el ciclo de vida y para gestionar
cambios del alcance del producto. Atributos típicos: identificador único, descripción,
fundamento, responsable, fuente, prioridad, versión, **estado** (vigente, cancelado,
aplazado, agregado, aprobado, asignado, completado), fecha; además estabilidad,
complejidad y criterios de aceptación.

**Definir el Alcance (pp. 150–155).** De todo lo recopilado, **selecciona** los requisitos
que sí entran y describe en detalle el proyecto y el producto. Análisis del producto:
desglose del producto, análisis de requisitos, de sistemas, ingeniería de sistemas,
análisis del valor e ingeniería del valor.

**Enunciado del alcance del proyecto (p. 154).** Describe el alcance completo (proyecto
y producto) con cuatro piezas: **descripción del alcance del producto** (elaborada
progresivamente), **entregables**, **criterios de aceptación** (condiciones que deben
cumplirse antes de aceptar) y **exclusiones** (lo que queda fuera; ayudan a manejar
expectativas y a reducir la corrupción del alcance). Sirve de base para decidir si una
solicitud está dentro o fuera del alcance.

**Acta vs. enunciado (tabla 5-1, p. 155).** No son redundantes: difieren en **nivel de
detalle**. El acta es de alto nivel: propósito, objetivos medibles y criterios de éxito,
requisitos de alto nivel, descripción de alto nivel y entregables clave, riesgo general,
resumen de hitos, recursos financieros preaprobados, interesados clave, requisitos de
aprobación, criterios de salida, director asignado y su autoridad, nombre y autoridad del
patrocinador. El enunciado trae el detalle: descripción del alcance, entregables,
criterios de aceptación, exclusiones.

**EDT/WBS (pp. 156–161).** Descomposición **jerárquica** de todo el trabajo que el equipo
debe hacer para crear los entregables. Ojo: en la EDT «trabajo» significa **el producto o
entregable** que resulta de la actividad, **no la actividad misma**.
- **Paquete de trabajo:** el nivel más bajo; ahí se pueden estimar y gestionar costo y
  duración. Agrupa las actividades que luego se programan.
- Pasos: identificar entregables → descomponer niveles altos en componentes bajos →
  **asignar códigos** → verificar que el grado de descomposición sea el adecuado.
- Enfoques: descendente, guías de la organización, plantillas; ascendente para
  subcomponentes. Formas: **fases del ciclo de vida en el segundo nivel** (entregables
  en el tercero), o **entregables principales en el segundo nivel**, o incluir trabajo
  contratado (el vendedor hace su propia EDT del contrato).
- Se descompone hasta que los componentes son productos, servicios o resultados
  **verificables**. En ágil, las **épicas** se descomponen en **historias de usuario**.
- Verificar: los componentes bajos deben ser **necesarios y suficientes** para su padre.
  No todos los entregables necesitan los mismos niveles.
- **Descomponer de más** cuesta: esfuerzo de gestión improductivo, recursos mal usados,
  menos eficiencia, dificultad para agregar datos.
- Entregables lejanos que aún no se pueden descomponer se dejan para después:
  **planificación gradual**.
- **Regla del 100 %:** la EDT incluye todo el trabajo del producto y del proyecto,
  **incluido el de dirección del proyecto**; lo de abajo suma exactamente lo de arriba:
  nada se omite, nada sobra.

**Línea base del alcance (pp. 161–162).** Versión **aprobada** del **enunciado + EDT +
diccionario de la EDT**; solo cambia con control formal de cambios; se usa para comparar.
- **Cuenta de control:** punto de control donde se integran alcance, presupuesto y
  cronograma y se comparan con el valor ganado; según la guía tiene dos o más paquetes
  de trabajo, y cada paquete pertenece a **una sola** cuenta de control.
- **Paquete de planificación:** debajo de la cuenta de control y encima del paquete de
  trabajo; contenido conocido pero **sin actividades detalladas** todavía.
- **Diccionario de la EDT:** detalle de cada componente: código de cuenta, descripción del
  trabajo, supuestos y restricciones, organización responsable, hitos, actividades
  asociadas, recursos, estimaciones de costo, requisitos de calidad, criterios de
  aceptación, referencias técnicas, información de acuerdos. Mucho lo llenan procesos
  posteriores.

**Validar el Alcance (pp. 163–167).** Formalizar la **aceptación** de los entregables
terminados. Entran los **entregables verificados** (salieron de Controlar la Calidad); se
revisan con el **cliente o el patrocinador** mediante **inspección** (medir, examinar,
validar; también llamada revisión). Salen **entregables aceptados** (firmados; van a Cerrar
el Proyecto o Fase) y, para los no aceptados, se documentan las razones y puede salir una
**solicitud de cambio** (reparación de defectos) que va al control integrado de cambios.
- **Diferencia clave:** Controlar la Calidad verifica que el entregable sea **correcto** y
  cumpla los requisitos de calidad; Validar el Alcance busca su **aceptación** por el
  cliente. Normalmente calidad va **antes**, aunque pueden ir en paralelo.

**Controlar el Alcance (pp. 167–172).** Vigilar el alcance y gestionar cambios a la línea
base. **Todo** cambio o acción correctiva/preventiva pasa por **Realizar el Control
Integrado de Cambios (4.6)**. Herramientas: **análisis de variación** (línea base vs.
real; ¿está dentro del umbral?) y **análisis de tendencias** (¿mejora o empeora con el
tiempo?). Hay que averiguar **causa y grado** de la desviación y decidir si se actúa.
- **Corrupción o deslizamiento del alcance:** expansión **no controlada** del alcance del
  producto o del proyecto **sin ajustar tiempo, costo y recursos**. Los cambios son
  inevitables: todo proyecto necesita un proceso de control de cambios.

## Lo que más confunde (criterio de Gen hasta que llegue el profesor)
1. Creer que alcance del producto y del proyecto son lo mismo (y que se miden igual).
2. Confundir Validar el Alcance con Controlar la Calidad (aceptación ≠ corrección).
3. Poner actividades («llamar al banco») en la EDT: la EDT lista entregables.
4. Olvidar el trabajo de dirección del proyecto en la EDT (rompe la regla del 100 %).
5. Creer que la línea base es solo la EDT (son tres piezas aprobadas).
6. Creer que acta y enunciado son el mismo documento repetido.
7. Llamar «mayoría» a la pluralidad.
8. Creer que aceptar un cambio pequeño «de buena fe» no es corrupción del alcance.
9. Creer que en ágil no hay gestión del alcance (se repite en cada iteración).
