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
 *     (los documentos).
 *   COTEJADO CON EL TEXTO DE LA GUÍA V6 EN ESPAÑOL (27-nov, la pasó Mateo):
 *   nombres de proceso tal cual la tabla de contenidos y la Tabla 1-4; los
 *   documentos son las salidas «X.Y.3.n» de cada proceso, sin las
 *   «Actualizaciones a…» genéricas (salvo en 11.3 y 11.4, que no tienen otra).
 *   Fundamentos, con las secciones de los capítulos 1 y 2. Falta el syllabus
 *   para el nombre exacto de la materia y para el recorte.
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
      f("gp-c1-proposito", "1.1", "Propósito de la guía, vocabulario común y código de ética"),
      f("gp-c1-proyectos", "1.2.1", "Proyectos"),
      f("gp-c1-importancia", "1.2.2", "La importancia de la dirección de proyectos"),
      f("gp-c1-portafolios", "1.2.3", "Relación entre dirección de proyectos, programas, portafolios y operaciones"),
      f("gp-c1-ciclo-vida", "1.2.4", "Ciclo de vida, fases y puntos de revisión de fase"),
      f("gp-c1-procesos-areas", "1.2.4", "Procesos, grupos de procesos y áreas de conocimiento"),
      f("gp-c1-adaptacion", "1.2.5", "Adaptación"),
      f("gp-c1-negocio", "1.2.6", "Documentos de negocio de la dirección de proyectos", ["Caso de negocio del proyecto", "Plan de gestión de beneficios del proyecto", "Medidas de éxito del proyecto"]),
      f("gp-c2-factores", "2.2", "Factores ambientales de la empresa (internos y externos)"),
      f("gp-c2-activos", "2.3", "Activos de los procesos de la organización"),
      f("gp-c2-gobernanza", "2.4", "Sistemas organizacionales: gobernanza y elementos de gestión"),
      f("gp-c2-estructuras", "2.4.4", "Tipos de estructura organizacional y la oficina de dirección de proyectos (PMO)"),
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
      p("13.1", "Identificar a los interesados", "interesados", ["Registro de interesados", "Solicitudes de cambio"]),
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
      p("5.4", "Crear la EDT/WBS", "alcance", ["Línea base del alcance"]),
      p("6.1", "Planificar la gestión del cronograma", "cronograma", ["Plan de gestión del cronograma"]),
      p("6.2", "Definir las actividades", "cronograma", ["Lista de actividades", "Atributos de las actividades", "Lista de hitos", "Solicitudes de cambio"]),
      p("6.3", "Secuenciar las actividades", "cronograma", ["Diagramas de red del cronograma del proyecto"]),
      p("6.4", "Estimar la duración de las actividades", "cronograma", ["Estimación de la duración", "Base de las estimaciones"]),
      p("6.5", "Desarrollar el cronograma", "cronograma", ["Línea base del cronograma", "Cronograma del proyecto", "Datos del cronograma", "Calendarios del proyecto", "Solicitudes de cambio"]),
      p("7.1", "Planificar la gestión de los costos", "costos", ["Plan de gestión de los costos"]),
      p("7.2", "Estimar los costos", "costos", ["Estimaciones de costos", "Base de las estimaciones"]),
      p("7.3", "Determinar el presupuesto", "costos", ["Línea base de costos", "Requisitos de financiamiento del proyecto"]),
      p("8.1", "Planificar la gestión de la calidad", "calidad", ["Plan de gestión de la calidad", "Métricas de calidad"]),
      p("9.1", "Planificar la gestión de recursos", "recursos", ["Plan de gestión de los recursos", "Acta de constitución del equipo"]),
      p("9.2", "Estimar los recursos de las actividades", "recursos", ["Requisitos de recursos", "Base de las estimaciones", "Estructura de desglose de recursos"]),
      p("10.1", "Planificar la gestión de las comunicaciones", "comunicaciones", ["Plan de gestión de las comunicaciones"]),
      p("11.1", "Planificar la gestión de los riesgos", "riesgos", ["Plan de gestión de los riesgos"]),
      p("11.2", "Identificar los riesgos", "riesgos", ["Registro de riesgos", "Informe de riesgos"]),
      /* 11.3 y 11.4 no crean documentos nuevos: la guía solo lista actualizaciones (al registro y al informe de riesgos). */
      p("11.3", "Realizar el análisis cualitativo de riesgos", "riesgos", ["Actualizaciones a los documentos del proyecto"]),
      p("11.4", "Realizar el análisis cuantitativo de riesgos", "riesgos", ["Actualizaciones a los documentos del proyecto"]),
      p("11.5", "Planificar la respuesta a los riesgos", "riesgos", ["Solicitudes de cambio"]),
      p("12.1", "Planificar la gestión de las adquisiciones del proyecto", "adquisiciones", ["Plan de gestión de las adquisiciones", "Estrategia de las adquisiciones", "Documentos de las licitaciones", "Enunciados del trabajo relativo a las adquisiciones", "Criterios de selección de proveedores", "Decisiones de hacer o comprar", "Estimaciones de costos independientes", "Solicitudes de cambio"]),
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
      p("8.2", "Gestionar la calidad", "calidad", ["Informes de calidad", "Documentos de prueba y evaluación", "Solicitudes de cambio"]),
      p("9.3", "Adquirir recursos", "recursos", ["Asignaciones de recursos físicos", "Asignaciones del equipo del proyecto", "Calendarios de recursos", "Solicitudes de cambio"]),
      p("9.4", "Desarrollar el equipo", "recursos", ["Evaluaciones de desempeño del equipo", "Solicitudes de cambio"]),
      p("9.5", "Dirigir al equipo", "recursos", ["Solicitudes de cambio"]),
      p("10.2", "Gestionar las comunicaciones", "comunicaciones", ["Comunicaciones del proyecto"]),
      p("11.6", "Implementar la respuesta a los riesgos", "riesgos", ["Solicitudes de cambio"]),
      p("12.2", "Efectuar las adquisiciones", "adquisiciones", ["Vendedores seleccionados", "Acuerdos", "Solicitudes de cambio"]),
      p("13.3", "Gestionar el involucramiento de los interesados", "interesados", ["Solicitudes de cambio"]),
    ],
  },
  {
    id: "gp-monitoreo-control",
    titulo: "Monitoreo y control",
    resumen: "Medir cómo va el proyecto contra el plan y decidir los cambios.",
    capitulos: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    confirmado: false,
    procesos: [
      p("4.5", "Monitorear y controlar el trabajo del proyecto", "integracion", ["Informes de desempeño del trabajo", "Solicitudes de cambio"]),
      p("4.6", "Realizar el control integrado de cambios", "integracion", ["Solicitudes de cambio aprobadas"]),
      p("5.5", "Validar el alcance", "alcance", ["Entregables aceptados", "Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("5.6", "Controlar el alcance", "alcance", ["Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("6.6", "Controlar el cronograma", "cronograma", ["Información de desempeño del trabajo", "Pronósticos del cronograma", "Solicitudes de cambio"]),
      p("7.4", "Controlar los costos", "costos", ["Información de desempeño del trabajo", "Pronósticos de costos", "Solicitudes de cambio"]),
      p("8.3", "Controlar la calidad", "calidad", ["Mediciones de control de calidad", "Entregables verificados", "Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("9.6", "Controlar los recursos", "recursos", ["Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("10.3", "Monitorear las comunicaciones", "comunicaciones", ["Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("11.7", "Monitorear los riesgos", "riesgos", ["Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("12.3", "Controlar las adquisiciones", "adquisiciones", ["Adquisiciones cerradas", "Información de desempeño del trabajo", "Solicitudes de cambio"]),
      p("13.4", "Monitorear el involucramiento de los interesados", "interesados", ["Información de desempeño del trabajo", "Solicitudes de cambio"]),
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
