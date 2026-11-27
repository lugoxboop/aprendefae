/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS (guía PMBOK, 6.ª edición) — EL ESQUELETO DE LA MATERIA
 *
 * Encargo de Mateo, 27-nov-2026 (Magno). Materia nueva: este archivo es su
 * esqueleto —módulos, procesos y los documentos que cada proceso genera— y
 * NO es el currículo. El detalle fino (qué entra, en qué orden, con qué peso)
 * sale del syllabus y de la guía V6 que pasa Mateo; hasta entonces todo va
 * marcado `confirmado: false` y la materia no se ve en ninguna parte del sitio.
 *
 * DE DÓNDE SALE LO QUE HAY: de la propia guía V6, no de una invención.
 *   · Fundamentos = capítulos 1 (Introducción) y 2 (El entorno en el que operan
 *     los proyectos), con sus secciones.
 *   · Un módulo por grupo de procesos (Inicio, Planificación, Ejecución,
 *     Monitoreo y Control, Cierre), con los 49 procesos de la guía, cada uno
 *     con el número de su sección, su área de conocimiento y sus salidas
 *     principales (los documentos).
 *
 * QUÉ ES CADA COSA EN LA PLATAFORMA
 *   módulo  → un TEMA del índice de la materia (como «Demanda agregada»).
 *   proceso → un SUBTEMA: la etiqueta con la que cada pieza dice qué enseña y
 *             con la que el panel docente ve en qué falla un grupo.
 *   documento → lo que el proceso produce (acta, registro de interesados…).
 *             Es la materia prima natural de las Hacer de Gen y de las escenas
 *             de Jane: «arma el acta», «llena el registro».
 *   espacios → las piezas (Aprender y Hacer) de cada módulo. Viven en
 *             catalogo.js, vacías hoy.
 *
 * LOS IDS NO SE CAMBIAN UNA VEZ PUBLICADOS: una pieza etiquetada con
 * `gp-4-1` y respondida por estudiantes queda atada a ese id en fp_detalle.
 * Mientras nada esté publicado se pueden renombrar libremente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "gestion-proyectos";
/* Provisional: el nombre exacto es el del syllabus (Mateo, 27-nov). */
export const NOMBRE_MATERIA = "Gestión de Proyectos";
export const GUIA = "Guía de los Fundamentos para la Dirección de Proyectos (Guía del PMBOK®), 6.ª edición";

/* Las diez áreas de conocimiento de la guía V6 (capítulos 4 a 13). */
export const AREAS = Object.freeze({
  integracion: { cap: 4, nombre: "Integración" },
  alcance: { cap: 5, nombre: "Alcance" },
  cronograma: { cap: 6, nombre: "Cronograma" },
  costos: { cap: 7, nombre: "Costos" },
  calidad: { cap: 8, nombre: "Calidad" },
  recursos: { cap: 9, nombre: "Recursos" },
  comunicaciones: { cap: 10, nombre: "Comunicaciones" },
  riesgos: { cap: 11, nombre: "Riesgos" },
  adquisiciones: { cap: 12, nombre: "Adquisiciones" },
  interesados: { cap: 13, nombre: "Interesados" },
});

/* Un proceso: sección de la guía, nombre, área y documentos que genera. */
const p = (seccion, nombre, area, documentos) => ({
  id: `gp-${seccion.replace(".", "-")}`,
  seccion,
  nombre,
  area,
  documentos,
});

/* Un subtema de fundamentos: no es un proceso, es una sección de los caps. 1-2. */
const f = (id, seccion, nombre, documentos = []) => ({ id, seccion, nombre, area: null, documentos });

export const MODULOS = Object.freeze([
  {
    id: "gp-fundamentos",
    titulo: "Fundamentos",
    resumen: "Qué es un proyecto, cómo se organiza y el entorno donde vive (capítulos 1 y 2).",
    capitulos: [1, 2],
    confirmado: false,
    procesos: [
      f("gp-c1-proyecto", "1.2", "Qué es un proyecto y por qué importa"),
      f("gp-c1-programas", "1.2", "Proyectos, programas y portafolios"),
      f("gp-c1-ciclo-vida", "1.2", "Ciclo de vida del proyecto y sus fases"),
      f("gp-c1-procesos-areas", "1.2", "Grupos de procesos y áreas de conocimiento"),
      f("gp-c1-negocio", "1.2", "Documentos de negocio del proyecto", ["Caso de negocio", "Plan de gestión de los beneficios"]),
      f("gp-c2-entorno", "2.2", "Factores ambientales de la empresa y activos de los procesos de la organización"),
      f("gp-c2-gobernanza", "2.4", "Gobernanza y estructuras organizacionales"),
      f("gp-c2-pmo", "2.4", "La oficina de dirección de proyectos (PMO)"),
    ],
  },
  {
    id: "gp-inicio",
    titulo: "Inicio",
    resumen: "Autorizar el proyecto y saber quién está involucrado.",
    capitulos: [4, 13],
    confirmado: false,
    procesos: [
      p("4.1", "Desarrollar el acta de constitución del proyecto", "integracion", ["Acta de constitución del proyecto", "Registro de supuestos"]),
      p("13.1", "Identificar a los interesados", "interesados", ["Registro de interesados"]),
    ],
  },
  {
    id: "gp-planificacion",
    titulo: "Planificación",
    resumen: "Definir qué se hace, cuándo, con cuánto y cómo se manejan los riesgos.",
    capitulos: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    confirmado: false,
    procesos: [
      p("4.2", "Desarrollar el plan para la dirección del proyecto", "integracion", ["Plan para la dirección del proyecto"]),
      p("5.1", "Planificar la gestión del alcance", "alcance", ["Plan de gestión del alcance", "Plan de gestión de los requisitos"]),
      p("5.2", "Recopilar requisitos", "alcance", ["Documentación de requisitos", "Matriz de trazabilidad de requisitos"]),
      p("5.3", "Definir el alcance", "alcance", ["Enunciado del alcance del proyecto"]),
      p("5.4", "Crear la EDT/WBS", "alcance", ["Línea base del alcance (EDT/WBS y diccionario)"]),
      p("6.1", "Planificar la gestión del cronograma", "cronograma", ["Plan de gestión del cronograma"]),
      p("6.2", "Definir las actividades", "cronograma", ["Lista de actividades", "Atributos de las actividades", "Lista de hitos"]),
      p("6.3", "Secuenciar las actividades", "cronograma", ["Diagramas de red del cronograma"]),
      p("6.4", "Estimar la duración de las actividades", "cronograma", ["Estimaciones de la duración", "Base de las estimaciones"]),
      p("6.5", "Desarrollar el cronograma", "cronograma", ["Línea base del cronograma", "Cronograma del proyecto", "Calendarios del proyecto"]),
      p("7.1", "Planificar la gestión de los costos", "costos", ["Plan de gestión de los costos"]),
      p("7.2", "Estimar los costos", "costos", ["Estimaciones de costos", "Base de las estimaciones"]),
      p("7.3", "Determinar el presupuesto", "costos", ["Línea base de costos", "Requisitos de financiamiento del proyecto"]),
      p("8.1", "Planificar la gestión de la calidad", "calidad", ["Plan de gestión de la calidad", "Métricas de calidad"]),
      p("9.1", "Planificar la gestión de los recursos", "recursos", ["Plan de gestión de los recursos", "Acta de constitución del equipo"]),
      p("9.2", "Estimar los recursos de las actividades", "recursos", ["Requisitos de recursos", "Estructura de desglose de recursos"]),
      p("10.1", "Planificar la gestión de las comunicaciones", "comunicaciones", ["Plan de gestión de las comunicaciones"]),
      p("11.1", "Planificar la gestión de los riesgos", "riesgos", ["Plan de gestión de los riesgos"]),
      p("11.2", "Identificar los riesgos", "riesgos", ["Registro de riesgos", "Informe de riesgos"]),
      p("11.3", "Realizar el análisis cualitativo de riesgos", "riesgos", ["Registro de riesgos (prioridades)"]),
      p("11.4", "Realizar el análisis cuantitativo de riesgos", "riesgos", ["Informe de riesgos (análisis cuantitativo)"]),
      p("11.5", "Planificar la respuesta a los riesgos", "riesgos", ["Registro de riesgos (respuestas)", "Solicitudes de cambio"]),
      p("12.1", "Planificar la gestión de las adquisiciones", "adquisiciones", ["Plan de gestión de las adquisiciones", "Estrategia de las adquisiciones", "Documentos de la licitación", "Enunciados del trabajo relativo a adquisiciones", "Criterios de selección de proveedores"]),
      p("13.2", "Planificar el involucramiento de los interesados", "interesados", ["Plan de involucramiento de los interesados"]),
    ],
  },
  {
    id: "gp-ejecucion",
    titulo: "Ejecución",
    resumen: "Hacer el trabajo planeado con el equipo, los proveedores y los interesados.",
    capitulos: [4, 8, 9, 10, 11, 12, 13],
    confirmado: false,
    procesos: [
      p("4.3", "Dirigir y gestionar el trabajo del proyecto", "integracion", ["Entregables", "Datos de desempeño del trabajo", "Registro de incidentes", "Solicitudes de cambio"]),
      p("4.4", "Gestionar el conocimiento del proyecto", "integracion", ["Registro de lecciones aprendidas"]),
      p("8.2", "Gestionar la calidad", "calidad", ["Informes de calidad", "Documentos de prueba y evaluación"]),
      p("9.3", "Adquirir recursos", "recursos", ["Asignaciones de recursos físicos", "Asignaciones del equipo del proyecto", "Calendarios de recursos"]),
      p("9.4", "Desarrollar el equipo", "recursos", ["Evaluaciones de desempeño del equipo"]),
      p("9.5", "Dirigir al equipo", "recursos", ["Solicitudes de cambio"]),
      p("10.2", "Gestionar las comunicaciones", "comunicaciones", ["Comunicaciones del proyecto"]),
      p("11.6", "Implementar la respuesta a los riesgos", "riesgos", ["Solicitudes de cambio"]),
      p("12.2", "Efectuar las adquisiciones", "adquisiciones", ["Vendedores seleccionados", "Acuerdos"]),
      p("13.3", "Gestionar la participación de los interesados", "interesados", ["Solicitudes de cambio"]),
    ],
  },
  {
    id: "gp-monitoreo-control",
    titulo: "Monitoreo y control",
    resumen: "Medir cómo va el proyecto contra el plan y decidir los cambios.",
    capitulos: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    confirmado: false,
    procesos: [
      p("4.5", "Monitorear y controlar el trabajo del proyecto", "integracion", ["Informes de desempeño del trabajo"]),
      p("4.6", "Realizar el control integrado de cambios", "integracion", ["Solicitudes de cambio aprobadas", "Registro de cambios"]),
      p("5.5", "Validar el alcance", "alcance", ["Entregables aceptados"]),
      p("5.6", "Controlar el alcance", "alcance", ["Información de desempeño del trabajo"]),
      p("6.6", "Controlar el cronograma", "cronograma", ["Pronósticos del cronograma"]),
      p("7.4", "Controlar los costos", "costos", ["Pronósticos de costos"]),
      p("8.3", "Controlar la calidad", "calidad", ["Mediciones de control de calidad", "Entregables verificados"]),
      p("9.6", "Controlar los recursos", "recursos", ["Información de desempeño del trabajo"]),
      p("10.3", "Monitorear las comunicaciones", "comunicaciones", ["Información de desempeño del trabajo"]),
      p("11.7", "Monitorear los riesgos", "riesgos", ["Información de desempeño del trabajo"]),
      p("12.3", "Controlar las adquisiciones", "adquisiciones", ["Adquisiciones cerradas"]),
      p("13.4", "Monitorear el involucramiento de los interesados", "interesados", ["Información de desempeño del trabajo"]),
    ],
  },
  {
    id: "gp-cierre",
    titulo: "Cierre",
    resumen: "Entregar, cerrar formalmente y guardar lo aprendido.",
    capitulos: [4],
    confirmado: false,
    procesos: [
      p("4.7", "Cerrar el proyecto o fase", "integracion", ["Transferencia del producto, servicio o resultado final", "Informe final"]),
    ],
  },
]);

export const modulo = (id) => MODULOS.find((m) => m.id === id) ?? null;

/* Todos los subtemas (procesos y secciones de fundamentos), en orden. */
export const SUBTEMAS = Object.freeze(MODULOS.flatMap((m) => m.procesos.map((pr) => ({ ...pr, moduloId: m.id }))));
export const subtema = (id) => SUBTEMAS.find((s) => s.id === id) ?? null;
