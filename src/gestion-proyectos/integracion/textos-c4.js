/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 4 «GESTIÓN DE LA INTEGRACIÓN» — LOS TEXTOS DE
 * LAS 10 HACER (lote 2)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c04-hacer.md (§2, H01 a H10). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 * Forma y tipos de etapa: los de ../fundamentos/textos-c1.js y
 * ../comun/preparar.js.
 *
 * El capítulo vive repartido en los módulos de grupo de procesos (catalogo.js):
 * cada pieza va al módulo del proceso que ejercita. Los subtemas gp04-* del
 * diseño son los procesos de ../estructura.js:
 *   gp04-acta, gp04-caso-negocio → gp-4-1 · gp04-plan, gp04-plan-documentos → gp-4-2
 *   gp04-dirigir, gp04-tipos-cambio → gp-4-3 · gp04-conocimiento → gp-4-4
 *   gp04-monitorear → gp-4-5 · gp04-cambios → gp-4-6 · gp04-cierre → gp-4-7
 *   gp04-integracion (H10 etapa 3, sin sección propia) → gp-4-2, el proceso que
 *   consolida todo en un solo plan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];

/* ─── H01 · El acta de Barranquilla (2 etapas) ─── */
export const SECCIONES_ACTA = [
  { id: "proposito", nombre: "Propósito" },
  { id: "objetivos", nombre: "Objetivos medibles y criterios de éxito" },
  { id: "requisitos", nombre: "Requisitos de alto nivel" },
  { id: "riesgo", nombre: "Riesgo general" },
  { id: "hitos", nombre: "Resumen de hitos" },
  { id: "recursos", nombre: "Recursos financieros preaprobados" },
  { id: "interesados", nombre: "Interesados clave" },
  { id: "salida", nombre: "Criterios de salida" },
  { id: "director", nombre: "Director asignado y su autoridad" },
];
const DESPUES_PLAN = { id: "plan", nombre: "Después, en el plan" };
export const GP_C4_H01 = {
  id: "gp26-ini-c04-h01-acta",
  contexto: "La junta aprobó el caso de negocio de la tienda de Barranquilla. Ahora falta el documento que autoriza el proyecto.",
  rol: "Te asignan como director(a) mientras se elabora el acta.",
  consigna: "Arma el acta: arrastra cada dato a su sección.",
  cierre: null,
  subtemas: ["gp-4-1"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Arma el acta: arrastra cada dato a su sección.",
      destinos: [...SECCIONES_ACTA, DESPUES_PLAN],
      partida: { n: 2, siempre: ["c4h01-01", "c4h01-02", "c4h01-03", "c4h01-04", "c4h01-05", "c4h01-06", "c4h01-07", "c4h01-08", "c4h01-09"] },
      banco: con("gp-4-1", [
        it("c4h01-01", "Llevar el café de Altamira a la costa con una tienda propia.", "proposito", "Dice para qué existe el proyecto: es el propósito."),
        it("c4h01-02", "Vender 1.200 tazas diarias al sexto mes.", "objetivos", "Tiene cifra y plazo: es un objetivo medible."),
        it("c4h01-03", "Local de 120 m² con barra para ocho baristas.", "requisitos", "Es un requisito general, sin detalle técnico: alto nivel."),
        it("c4h01-04", "Riesgo general alto, por clima y competencia local.", "riesgo", "Es el riesgo del proyecto en su conjunto."),
        it("c4h01-05", "Firma del local en marzo; apertura en septiembre.", "hitos", "Solo hitos clave: el detalle va después, en el cronograma."),
        it("c4h01-06", "$900 millones aprobados por la junta.", "recursos", "Es el dinero ya aprobado, no el presupuesto detallado."),
        it("c4h01-07", "Patrocinadora, gerente de compras, PMO y Operaciones costa.", "interesados", "Es la lista de interesados clave del proyecto."),
        it("c4h01-08", "Se cierra si la tienda abre o si la junta cancela la costa.", "salida", "Dice qué condiciones cierran o cancelan el proyecto."),
        it("c4h01-09", "Director(a): tú, con autoridad para usar el presupuesto aprobado.", "director", "Nombra al director, su responsabilidad y su nivel de autoridad."),
        it("c4h01-10", "Cronograma de 140 actividades con sus fechas.", "plan", "El acta lleva solo un resumen de hitos; el detalle se planifica."),
        it("c4h01-11", "Presupuesto mes a mes por partida.", "plan", "El acta da fondos preaprobados; el presupuesto detallado viene después."),
        it("c4h01-12", "Plan de gestión de las comunicaciones.", "plan", "Es un plan subsidiario: va en el plan para la dirección."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Lleva cada verbo a quien le toca hacerlo.",
      pasos: [
        { grupo: "verbos", barajar: true, consigna: "Lleva cada verbo a quien le toca hacerlo.",
          destinos: [{ id: "patrocinadora", nombre: "Patrocinadora" }, { id: "ambos", nombre: "Patrocinadora y tú" }],
          retro: "Puedes ayudar a redactarla, pero la emite el patrocinador o iniciador.",
          items: con("gp-4-1", [
            { id: "c4h01-13", texto: "Emitir el acta", clave: "patrocinadora" },
            { id: "c4h01-14", texto: "Ayudar a desarrollarla", clave: "ambos" },
          ]) },
        { id: "c4h01-15", subtemas: ["gp-4-1"], consigna: "¿Cuándo debía asignarse al director(a)?",
          destinos: [{ id: "acta", nombre: "Mientras se elabora el acta" }, { id: "planificar", nombre: "Después de planificar" }, { id: "obra", nombre: "Al empezar la obra" }],
          clave: "acta", retro: "Se asigna lo antes posible y siempre antes de planificar." },
        { id: "c4h01-16", subtemas: ["gp-4-1"],
          contexto: "El gerente de compras dice que el acta es un contrato.",
          consigna: "¿Tiene razón?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "No hay contraprestación ni intercambio de dinero: no es contrato." } },
        { id: "c4h01-17", subtemas: ["gp-4-1"], consigna: "¿Cuándo empieza formalmente el proyecto?", barajar: true,
          destinos: [{ id: "acta", nombre: "Al aprobarse el acta" }, { id: "arriendo", nombre: "Al firmar el arriendo" }, { id: "inaugurar", nombre: "Al inaugurar la tienda" }],
          clave: "acta",
          retros: { arriendo: "El arriendo ya es trabajo del proyecto; el inicio formal es el acta.", inaugurar: "Inaugurar es casi el final: el proyecto empezó con el acta." } },
      ],
    },
  ],
};

/* ─── H02 · El expositor de los casos (2 etapas; clave etapa 1: criterio de Gen) ─── */
export const GP_C4_H02 = {
  id: "gp26-ini-c04-h02-expositor",
  contexto: "La PMO guarda en un expositor las postales de los casos de negocio del programa costa. Cada uno nació por una razón distinta.",
  rol: "Diriges la tienda de Barranquilla y usas estos casos.",
  consigna: "Mete cada postal en el bolsillo de su razón.",
  cierre: null,
  subtemas: ["gp-4-1"],
  elenco: ["tu", "pmo", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Mete cada postal en el bolsillo de su razón.",
      destinos: [
        { id: "mercado", nombre: "Demanda del mercado" },
        { id: "organizacion", nombre: "Necesidad de la organización" },
        { id: "cliente", nombre: "Solicitud de un cliente" },
        { id: "tecnologia", nombre: "Avance tecnológico" },
        { id: "legal", nombre: "Requisito legal" },
        { id: "ecologico", nombre: "Impactos ecológicos" },
        { id: "social", nombre: "Necesidad social" },
      ],
      /* Una por razón; de Demanda del mercado y Necesidad de la organización rota la de reserva. */
      partida: { porClave: 1 },
      banco: con("gp-4-1", [
        it("c4h02-01", "En la costa piden café de especialidad y casi nadie lo vende.", "mercado", "Responde a lo que pide el mercado: demanda del mercado."),
        it("c4h02-02", "Llevar café desde Manizales sale caro; una bodega costeña abarata.", "organizacion", "Busca bajar costos propios: necesidad de la organización."),
        it("c4h02-03", "Una cadena hotelera pide un punto de Altamira en su hotel.", "cliente", "Lo pide un cliente concreto: solicitud de un cliente."),
        it("c4h02-04", "Con pagos por código QR, Altamira quiere cobrar así en la costa.", "tecnologia", "Aprovecha una tecnología nueva: avance tecnológico."),
        it("c4h02-05", "La ley exige a los locales costeños un plan de evacuación certificado.", "legal", "Lo exige una norma: requisito legal."),
        it("c4h02-06", "Altamira quiere reducir el plástico de sus vasos en la costa.", "ecologico", "Busca disminuir su impacto ambiental: impactos ecológicos."),
        it("c4h02-07", "Un barrio junto a la bodega no tiene agua potable; Altamira ayuda.", "social", "Atiende una necesidad de la comunidad: necesidad social."),
        it("c4h02-08", "La competencia costeña ya vende café frío embotellado y crece.", "mercado", "El mercado pide ese producto: demanda del mercado."),
        it("c4h02-09", "Las tiendas pierden ventas porque el inventario se lleva a mano.", "organizacion", "Es un problema interno de eficiencia: necesidad de la organización."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Qué técnica usas para reunir esto?",
      destinos: [
        { id: "tormenta", nombre: "Tormenta de ideas" },
        { id: "focales", nombre: "Grupos focales" },
        { id: "entrevistas", nombre: "Entrevistas" },
        { id: "conflictos", nombre: "Gestión de conflictos" },
        { id: "facilitacion", nombre: "Facilitación" },
        { id: "reuniones", nombre: "Gestión de reuniones" },
      ],
      partida: { todas: true },
      banco: con("gp-4-1", [
        it("c4h02-10", "Cuarenta ideas de nombre para la tienda en veinte minutos, en grupo.", "tormenta", "Muchas ideas en poco tiempo y en grupo: tormenta de ideas."),
        it("c4h02-11", "Clientes costeños y expertos conversan sobre qué sería éxito.", "focales", "Charla grupal sobre éxito y riesgo percibido: grupo focal."),
        it("c4h02-12", "Hablas a solas con la patrocinadora sobre supuestos y aprobación.", "entrevistas", "Diálogo directo con un interesado: entrevista."),
        it("c4h02-13", "Compras y Operaciones costa no se ponen de acuerdo en los objetivos.", "conflictos", "Alinear interesados que discrepan es gestión de conflictos."),
        it("c4h02-14", "Guías la sesión para que todos aporten y salga una decisión aceptada.", "facilitacion", "Llevar al grupo a una decisión con todos participando: facilitación."),
        it("c4h02-15", "Preparas la agenda, invitas a cada grupo clave y envías el acta.", "reuniones", "Agenda, invitados y acta de la reunión: gestión de reuniones."),
      ]),
      despues: { id: "c4h02-16", subtemas: ["gp-4-1"],
        contexto: "La patrocinadora te pide corregir tú mismo el caso de negocio.",
        consigna: "¿Qué le respondes?",
        destinos: [{ id: "recomendar", nombre: "Solo puedo recomendarle cambios" }, { id: "editar", nombre: "Lo edito hoy mismo" }],
        clave: "recomendar", retros: { editar: "Los documentos de negocio no son del proyecto: el director solo recomienda." } },
    },
  ],
};

/* ─── H03 · El portaplanos y el revistero (2 etapas; siempre las dos trampas) ─── */
const A_LA_REGLA = [{ id: "regla", nombre: "A la regla" }, { id: "fuera", nombre: "No es mínima" }];
const RETRO_MINIMAS = "La guía pide como mínimo alcance, tiempo y costo.";
export const GP_C4_H03 = {
  id: "gp26-pla-c04-h03-portaplanos",
  contexto: "El acta está aprobada. Ahora armas el plan para la dirección de la tienda, y el escritorio se llena de papeles.",
  rol: "Diriges el proyecto y consolidas el plan.",
  consigna: "¿Va al portaplanos del plan o al revistero de documentos?",
  cierre: null,
  subtemas: ["gp-4-2"],
  elenco: ["tu", "equipo", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Va al portaplanos del plan o al revistero de documentos?",
      destinos: [
        { id: "plan", nombre: "Portaplanos", pista: "Plan para la dirección del proyecto" },
        { id: "documentos", nombre: "Revistero", pista: "Documentos del proyecto" },
      ],
      partida: { n: 8, siempre: ["c4h03-08", "c4h03-09"] },
      banco: con("gp-4-2", [
        it("c4h03-01", "Plan de gestión de los riesgos", "plan", "Es un plan subsidiario: va dentro del plan para la dirección."),
        it("c4h03-02", "Plan de involucramiento de los interesados", "plan", "Es plan subsidiario: forma parte del plan."),
        it("c4h03-03", "Línea base del cronograma", "plan", "Las líneas base forman parte del plan."),
        it("c4h03-04", "Línea base de costos", "plan", "Es línea base: va enrollada en el plan."),
        it("c4h03-05", "Plan de gestión de cambios", "plan", "Componente adicional del plan: dice cómo se autorizan los cambios."),
        it("c4h03-06", "Enfoque de desarrollo (predictivo, ágil o híbrido)", "plan", "El enfoque de desarrollo es componente del plan."),
        it("c4h03-07", "Descripción del ciclo de vida del proyecto", "plan", "El ciclo de vida del proyecto es componente del plan."),
        it("c4h03-08", "Cronograma del proyecto", "documentos", "El cronograma es documento; su línea base sí va al plan.", { trampa: true }),
        it("c4h03-09", "Enunciado del alcance", "documentos", "Suelto es documento; aprobado con la EDT forma la línea base.", { trampa: true }),
        it("c4h03-10", "Registro de incidentes", "documentos", "Es un documento del proyecto, no parte del plan."),
        it("c4h03-11", "Registro de supuestos", "documentos", "Es documento del proyecto; nació junto con el acta."),
        it("c4h03-12", "Registro de riesgos", "documentos", "El registro es documento; el plan de riesgos sí va al portaplanos."),
        it("c4h03-13", "Lista de hitos", "documentos", "La lista de hitos es documento del proyecto."),
        it("c4h03-14", "Registro de interesados", "documentos", "Es documento; el plan de involucramiento sí es del plan."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Aún no hay líneas base. ¿Necesitas solicitud de cambio para ajustar?",
      pasos: [
        { id: "c4h03-15", subtemas: ["gp-4-2"], consigna: "Aún no hay líneas base. ¿Necesitas solicitud de cambio para ajustar?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "Antes de las líneas base el plan se actualiza sin proceso formal." } },
        { id: "c4h03-16", subtemas: ["gp-4-2"], barajar: true,
          contexto: "La patrocinadora aprobó las líneas base.",
          consigna: "¿Cómo se cambia el plan ahora?",
          destinos: [{ id: "control", nombre: "Solo por el control integrado de cambios" }, { id: "quiera", nombre: "Cuando yo quiera" }, { id: "pmo", nombre: "Lo cambia la PMO" }],
          clave: "control",
          retros: { quiera: "Con líneas base fijadas, todo cambio pasa por control integrado.", pmo: "La PMO no cambia tu plan: se pide un cambio formal." } },
        { grupo: "lineas-base", barajar: true, consigna: "Lleva a la regla las tres líneas base mínimas.",
          destinos: A_LA_REGLA, retro: RETRO_MINIMAS,
          items: con("gp-4-2", [
            { id: "c4h03-17", texto: "Alcance", clave: "regla" },
            { id: "c4h03-18", texto: "Cronograma", clave: "regla" },
            { id: "c4h03-19", texto: "Costos", clave: "regla" },
            { id: "c4h03-20", texto: "Calidad", clave: "fuera" },
            { id: "c4h03-21", texto: "Riesgos", clave: "fuera" },
          ]) },
        { id: "c4h03-22", subtemas: ["gp-4-2"], barajar: true,
          contexto: "Barranquilla es un proyecto grande: el equipo de obra llega después de planificar.",
          consigna: "¿Cuándo es la reunión de lanzamiento?",
          destinos: [{ id: "ejecucion", nombre: "Al comienzo de la ejecución" }, { id: "planificar", nombre: "Poco después del inicio, al planificar" }, { id: "cierre", nombre: "Al cierre" }],
          clave: "ejecucion",
          retros: { planificar: "Eso pasa en proyectos pequeños, con un solo equipo.", cierre: "El lanzamiento compromete al equipo antes de trabajar, no al final." } },
      ],
    },
  ],
};

/* ─── H04 · Cuatro carretillas de cambio (2 por carretilla, primero las obvias) ─── */
export const GP_C4_H04 = {
  id: "gp26-eje-c04-h04-carretillas",
  contexto: "La obra de Barranquilla arrancó. Cada día llegan formularios de cambio, y cada uno debe ir en la carretilla de su tipo.",
  rol: "Diriges la obra y clasificas las solicitudes de cambio.",
  consigna: "Carga cada solicitud en la carretilla de su tipo.",
  cierre: null,
  subtemas: ["gp-4-3"],
  elenco: ["tu", "cliente"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Carga cada solicitud en la carretilla de su tipo.",
    destinos: [
      { id: "correctiva", nombre: "Acción correctiva" },
      { id: "preventiva", nombre: "Acción preventiva" },
      { id: "defectos", nombre: "Reparación de defectos" },
      { id: "actualizacion", nombre: "Actualización" },
    ],
    partida: { porClave: 2, ordenarPorNivel: true },
    banco: con("gp-4-3", [
      it("c4h04-01", "La obra va dos semanas atrasada; pides turno extra para volver al plan.", "correctiva", "Ya hay desviación y la realineas con el plan: correctiva.", { nivel: 1, linea: "desviada" }),
      it("c4h04-02", "Ya se gastó 10 % más de lo previsto; recortas para volver al presupuesto.", "correctiva", "El desempeño ya se salió del plan: acción correctiva.", { nivel: 2, linea: "desviada" }),
      it("c4h04-03", "El montaje eléctrico va lento; reasignas dos personas para alcanzar el plan.", "correctiva", "Corriges un desempeño actual desalineado: correctiva.", { nivel: 2, linea: "desviada" }),
      it("c4h04-04", "Viene la temporada de lluvias; adelantas el techo para no atrasarte.", "preventiva", "Aún no hay desviación: evitas una futura. Preventiva.", { nivel: 1, linea: "aun-no" }),
      it("c4h04-05", "La tendencia dice que en dos meses faltará cemento; lo pides ya.", "preventiva", "Aseguras que el desempeño futuro siga el plan: preventiva.", { nivel: 2, linea: "aun-no" }),
      it("c4h04-06", "Capacitas antes al equipo en la máquina nueva para evitar demoras.", "preventiva", "Previenes un problema futuro de desempeño: preventiva.", { nivel: 2, linea: "aun-no" }),
      it("c4h04-07", "La barra llegó con una soldadura fuera de especificación.", "defectos", "El producto no cumple lo especificado: reparación de defectos.", { nivel: 1 }),
      it("c4h04-08", "Las mesas llegaron de un color distinto al pedido.", "defectos", "Es una no conformidad del producto: reparación de defectos.", { nivel: 2 }),
      it("c4h04-09", "En el letrero luminoso hay letras que no encienden.", "defectos", "Un componente defectuoso se arregla: reparación de defectos.", { nivel: 2 }),
      it("c4h04-10", "Agregas al registro de interesados a la nueva junta de vecinos.", "actualizacion", "Cambias un documento controlado: es una actualización.", { nivel: 1 }),
      it("c4h04-11", "El plano del plan cambia para mostrar la nueva entrada.", "actualizacion", "Reflejar contenido modificado en un plan es actualización.", { nivel: 2 }),
      it("c4h04-12", "Añades un supuesto nuevo al registro de supuestos.", "actualizacion", "Modificar un documento controlado es una actualización.", { nivel: 2 }),
    ]),
    despues: [
      { id: "c4h04-13", subtemas: ["gp-4-3"], mesa: "cliente",
        contexto: "Un vecino pide cambiar el horario de la obra.",
        consigna: "¿Puede pedir un cambio?",
        destinos: SI_NO, clave: "si", retros: { no: "Cualquier interesado del proyecto puede solicitar un cambio." } },
      { id: "c4h04-14", subtemas: ["gp-4-3"], barajar: true,
        consigna: "¿A dónde van estos formularios después?",
        destinos: [{ id: "control", nombre: "A Realizar el control integrado de cambios" }, { id: "obra", nombre: "Directo a la obra" }, { id: "cierre", nombre: "Al cierre" }],
        clave: "control",
        retros: { obra: "Primero se revisan y deciden en el control integrado de cambios.", cierre: "Se resuelven durante el proyecto, en el control integrado." } },
    ],
  }],
};

/* ─── H05 · La bitácora de obra (2 etapas) ─── */
export const GP_C4_H05 = {
  id: "gp26-eje-c04-h05-bitacora",
  contexto: "El practicante anota en la bitácora de obra todo lo que pasa, pero lo mezcla todo en la misma página.",
  rol: "Diriges la obra y ordenas sus anotaciones.",
  consigna: "¿Es incidente, riesgo o dato de desempeño?",
  cierre: null,
  subtemas: ["gp-4-3"],
  elenco: ["tu", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Es incidente, riesgo o dato de desempeño?",
      destinos: [
        { id: "incidentes", nombre: "Registro de incidentes", pista: "ya pasó" },
        { id: "riesgos", nombre: "Registro de riesgos", pista: "podría pasar" },
        { id: "datos", nombre: "Datos de desempeño", pista: "medición en bruto" },
      ],
      /* 7 de 10: al menos 2 por separador y siempre la oportunidad. */
      partida: { n: 6, siempre: ["c4h05-06"], minPorClave: 2 },
      banco: con("gp-4-3", [
        it("c4h05-01", "El proveedor de sillas entregó la mitad y no responde.", "incidentes", "Ya ocurrió y requiere acción: es un incidente."),
        it("c4h05-02", "Compras y obra se contradicen sobre dónde va la bodega.", "incidentes", "Un conflicto que ya existe se registra como incidente."),
        it("c4h05-03", "El plano eléctrico y el de cocina no coinciden.", "incidentes", "Una inconsistencia real es un incidente."),
        it("c4h05-04", "Podría llegar una tormenta tropical en octubre.", "riesgos", "Aún no pasa; podría pasar: es un riesgo."),
        it("c4h05-05", "Si sube el dólar, la máquina importada costaría más.", "riesgos", "Es incierto y futuro: riesgo, no incidente."),
        it("c4h05-06", "Podría abrir un centro comercial al lado y traer clientes.", "riesgos", "Una oportunidad incierta también va en el registro de riesgos.", { oportunidad: true }),
        it("c4h05-07", "Hoy se instalaron 14 de 20 lámparas.", "datos", "Es una medición en bruto: dato de desempeño."),
        it("c4h05-08", "Fecha real de inicio del techo: 4 de mayo.", "datos", "Una fecha real sin analizar es dato de desempeño."),
        it("c4h05-09", "Duración real del montaje de la barra: seis días.", "datos", "Una duración real es dato de desempeño."),
        it("c4h05-10", "Asistencia del equipo esta semana: 92 %.", "datos", "Un indicador medido, sin comparar, es dato de desempeño."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Completa la entrada del incidente con los campos que faltan.",
      destinos: [
        { id: "tipo", nombre: "Tipo" },
        { id: "quien", nombre: "Quién lo planteó y cuándo" },
        { id: "prioridad", nombre: "Prioridad" },
        { id: "asignado", nombre: "Asignado a" },
        { id: "limite", nombre: "Fecha límite de resolución" },
        { id: "estado", nombre: "Estado" },
        { id: "solucion", nombre: "Solución final" },
        { id: "descarte", nombre: "No va (se descarta)" },
      ],
      partida: { todas: true },
      banco: con("gp-4-3", [
        it("c4h05-11", "Adquisiciones", "tipo", "Clasifica la clase de incidente: es el tipo."),
        it("c4h05-12", "Equipo de obra, 3 de junio", "quien", "Dice quién lo levantó y en qué fecha."),
        it("c4h05-13", "Alta: sin sillas no se abre", "prioridad", "Indica qué tan urgente es: prioridad."),
        it("c4h05-14", "Tú, director(a)", "asignado", "Es la persona responsable de resolverlo."),
        it("c4h05-15", "10 de junio", "limite", "Es el plazo para resolverlo, no cuándo se planteó."),
        it("c4h05-16", "Abierto", "estado", "Dice en qué va el incidente: estado."),
        it("c4h05-17", "(se llena al resolverlo)", "solucion", "La solución final se escribe cuando se cierra."),
        it("c4h05-18", "Probabilidad: 40 %", "descarte", "Un incidente ya ocurrió: no tiene probabilidad. Eso es de riesgos."),
      ]),
      despues: { id: "c4h05-19", subtemas: ["gp-4-3"], barajar: true,
        consigna: "¿Qué proceso crea por primera vez este registro?",
        destinos: [{ id: "dirigir", nombre: "Dirigir y gestionar el trabajo" }, { id: "acta", nombre: "Desarrollar el acta" }, { id: "cerrar", nombre: "Cerrar el proyecto" }],
        clave: "dirigir",
        retros: { acta: "El acta registra supuestos; los incidentes nacen al ejecutar.", cerrar: "Nace al ejecutar y se actualiza al monitorear, no al cerrar." } },
    },
  ],
};

/* ─── H06 · El recetario y las manos (3 etapas) ─── */
export const GP_C4_H06 = {
  id: "gp26-eje-c04-h06-recetario",
  contexto: "La barista principal de Manizales viene dos semanas a Barranquilla. Sabe cosas que no están escritas en ninguna parte.",
  rol: "Diriges la tienda y gestionas el conocimiento del proyecto.",
  consigna: "¿Cabe en el recetario o vive en las manos?",
  cierre: null,
  subtemas: ["gp-4-4"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Cabe en el recetario o vive en las manos?",
      destinos: [
        { id: "explicito", nombre: "Explícito", pista: "cabe en el recetario" },
        { id: "tacito", nombre: "Tácito", pista: "vive en las manos" },
      ],
      partida: { todas: true },
      banco: con("gp-4-4", [
        it("c4h06-01", "Receta: 18 g de café, 36 ml, 28 segundos.", "explicito", "Son números fáciles de escribir: conocimiento explícito."),
        it("c4h06-02", "Fotos paso a paso para limpiar la máquina.", "explicito", "Imágenes que codifican el paso a paso: explícito."),
        it("c4h06-03", "Lista de proveedores de leche de la costa.", "explicito", "Una lista escrita es conocimiento explícito."),
        it("c4h06-04", "Saber por el sonido cuándo la leche está lista.", "tacito", "Es saber hacer personal, difícil de escribir: tácito."),
        it("c4h06-05", "Calmar a un cliente molesto en hora pico.", "tacito", "Se aprende con experiencia y contexto: tácito."),
        it("c4h06-06", "Intuir qué día vendrá más gente según el clima.", "tacito", "Es percepción nacida de la experiencia: tácito."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Con qué herramienta se comparte mejor esto?",
      destinos: [
        { id: "conocimiento", nombre: "Gestión del conocimiento", pista: "conecta personas" },
        { id: "informacion", nombre: "Gestión de la información", pista: "conecta personas con información" },
      ],
      partida: { todas: true },
      banco: con("gp-4-4", [
        it("c4h06-07", "El arte latte de la barista.", "conocimiento", "Lo tácito se comparte interactuando: que la observen trabajar.", { herramienta: "Aprendizaje por observación" }),
        it("c4h06-08", "Cómo resolvió ella el día de más clientes.", "conocimiento", "Contar la historia conversando transmite el contexto.", { herramienta: "Narraciones" }),
        it("c4h06-09", "Baristas de todas las tiendas que comparten trucos.", "conocimiento", "Una comunidad de práctica conecta personas.", { herramienta: "Comunidad de práctica" }),
        it("c4h06-10", "La receta exacta del espresso.", "informacion", "Es explícito y simple: se codifica y se guarda.", { herramienta: "Codificar en el registro" }),
        it("c4h06-11", "El manual de la máquina nueva.", "informacion", "Documento explícito: gestión de la información.", { herramienta: "Biblioteca y gestión documental" }),
        it("c4h06-12", "Las normas de higiene de la costa, publicadas en la web.", "informacion", "Buscar y leer lo publicado es gestión de la información.", { herramienta: "Recopilación de información" }),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Verdadero o falso para la guía?",
      destinos: [{ id: "verdadero", nombre: "Verdadero" }, { id: "falso", nombre: "Falso" }],
      partida: { todas: true },
      banco: con("gp-4-4", [
        it("c4h06-13", "Gestionar el conocimiento es solo documentarlo.", "falso", "Solo lo explícito se comparte así; lo tácito necesita interacción."),
        it("c4h06-14", "Las lecciones aprendidas se recogen solo al final.", "falso", "El registro se crea temprano y se actualiza todo el proyecto."),
        it("c4h06-15", "Sin confianza, ninguna herramienta funciona.", "verdadero", "Lo más importante es un clima de confianza para compartir."),
        it("c4h06-16", "Al cerrar, las lecciones pasan al repositorio de la organización.", "verdadero", "El registro final se transfiere al repositorio de lecciones aprendidas."),
      ]),
    },
  ],
};

/* ─── H07 · La cámara del viernes (2 etapas) ─── */
export const GP_C4_H07 = {
  id: "gp26-moc-c04-h07-camara",
  contexto: "Es viernes. La patrocinadora quiere entender cómo va la obra y te pide una foto clara de su avance.",
  rol: "Diriges la obra y monitoreas su avance.",
  consigna: "Elige la técnica que responde cada pregunta.",
  cierre: null,
  subtemas: ["gp-4-5"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Elige la técnica que responde cada pregunta.",
      destinos: [
        { id: "variacion", nombre: "Variación" },
        { id: "tendencias", nombre: "Tendencias" },
        { id: "causa", nombre: "Causa raíz" },
        { id: "alternativas", nombre: "Alternativas" },
        { id: "costo-beneficio", nombre: "Costo-beneficio" },
        { id: "valor-ganado", nombre: "Valor ganado" },
      ],
      partida: { porClave: 1 },
      banco: con("gp-4-5", [
        it("c4h07-01", "¿Cuánto nos separamos del plan en costo y en días?", "variacion", "Comparar lo planificado con lo real es análisis de variación."),
        it("c4h07-02", "Se gastaron $40 millones y había $35 planeados: ¿cuál es la diferencia?", "variacion", "Diferencia entre planeado y real: variación. Aquí, $5 millones."),
        it("c4h07-03", "Si seguimos así, ¿llegaremos tarde a la apertura?", "tendencias", "Pronosticar con resultados pasados es análisis de tendencias."),
        it("c4h07-04", "El atraso crece cada semana: ¿qué pasará en un mes?", "tendencias", "Proyectar el patrón pasado al futuro: tendencias."),
        it("c4h07-05", "¿Por qué la pintura se sigue descascarando?", "causa", "Buscar la razón principal del problema: causa raíz."),
        it("c4h07-06", "Hay tres maneras de recuperar el atraso: ¿cuál aplicamos?", "alternativas", "Elegir entre acciones correctivas posibles: análisis de alternativas."),
        it("c4h07-07", "¿Qué corrección cuesta menos para lo que gana?", "costo-beneficio", "Pesar el costo de la acción contra su beneficio."),
        it("c4h07-08", "Quiero ver alcance, tiempo y costo juntos en una sola medida.", "valor-ganado", "El valor ganado da una visión integral de los tres."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Esto sirve como informe de desempeño para decidir?",
      destinos: [
        { id: "informe", nombre: "Sí, es informe" },
        { id: "dato", nombre: "No: es dato" },
        { id: "otro", nombre: "No: es otro documento" },
      ],
      partida: { todas: true },
      banco: con("gp-4-5", [
        it("c4h07-09", "Tablero con semáforos por área.", "informe", "Los tableros tipo semáforo son informes de desempeño."),
        it("c4h07-10", "Informe de calor de las zonas con más atraso.", "informe", "Un informe de calor representa desempeño para decidir."),
        it("c4h07-11", "Histograma de defectos de la pintura.", "informe", "Los histogramas de defectos forman parte de los informes."),
        it("c4h07-12", "Informe de estado con el pronóstico de la apertura.", "informe", "Estado y pronóstico para decidir: informe de desempeño."),
        it("c4h07-13", "Costo real de hoy, sin comparar con nada.", "dato", "Sin comparar con el plan es solo un dato bruto."),
        it("c4h07-14", "El acta de constitución de la tienda.", "otro", "El acta autoriza el proyecto; no informa el desempeño."),
      ]),
      despues: { id: "c4h07-15", subtemas: ["gp-4-5"], barajar: true,
        consigna: "¿Para qué existe un informe de desempeño?",
        destinos: [{ id: "decidir", nombre: "Para decidir, actuar o crear conciencia" }, { id: "archivar", nombre: "Para archivar datos" }, { id: "reemplazar", nombre: "Para reemplazar el plan" }],
        clave: "decidir",
        retros: { archivar: "Se circula entre interesados para que decidan o actúen.", reemplazar: "Informa contra el plan; no lo reemplaza." } },
    },
  ],
};

/* ─── H08 · El turnero de los cambios (2 etapas) ─── */
export const GP_C4_H08 = {
  id: "gp26-moc-c04-h08-turnero",
  contexto: "Las solicitudes de cambio de la tienda sacan turno en un turnero. Al final, el comité de control de cambios se reúne los martes.",
  rol: "Diriges el proyecto y respondes por el control de cambios.",
  consigna: "Ordena el recorrido de una solicitud de cambio.",
  cierre: "Todo cambio se registra, se decide, se comunica y queda en el registro.",
  subtemas: ["gp-4-6"],
  elenco: ["tu", "patrocinadora", "gerente", "pmo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena el recorrido de una solicitud de cambio.",
      pasos: [{
        tipo: "ordenar", id: "c4h08-orden", subtemas: ["gp-4-6"], puntuaPares: true,
        consigna: "Ordena el recorrido de una solicitud de cambio.",
        items: [
          { id: "identificar", texto: "Identificar" },
          { id: "documentar", texto: "Documentar" },
          { id: "decidir", texto: "Decidir" },
          { id: "seguimiento", texto: "Hacer seguimiento" },
        ],
        retrosPar: {
          "identificar-documentar": "Primero se detecta qué cambiar; luego se escribe la solicitud.",
          "documentar-decidir": "Nadie decide sobre un cambio que no está documentado.",
          "decidir-seguimiento": "Se sigue lo ya decidido: verificar, monitorear y comunicar.",
        },
      }],
    },
    {
      tipo: "micros",
      consigna: "Los casos del martes: decide cada turno.",
      pasos: [
        { id: "c4h08-t1", subtemas: ["gp-4-6"], turno: 1, barajar: true,
          contexto: "El gerente funcional pide por teléfono cambiar el proveedor de leche.",
          consigna: "¿Qué haces con un pedido verbal?",
          destinos: [{ id: "registrar", nombre: "Pido registrarlo por escrito en el sistema" }, { id: "ya", nombre: "Lo hago ya" }, { id: "ignoro", nombre: "Lo ignoro" }],
          clave: "registrar",
          retros: { ya: "Sin registro escrito no hay control ni trazabilidad.", ignoro: "Se puede pedir verbal, pero debe registrarse por escrito." } },
        { id: "c4h08-t2", subtemas: ["gp-4-6"], turno: 2, barajar: true,
          contexto: "La patrocinadora pide ampliar el local; eso toca la línea base de costos.",
          consigna: "¿Qué debe traer la solicitud?",
          destinos: [{ id: "impacto", nombre: "Impacto en costo, fechas, recursos y riesgos" }, { id: "firma", nombre: "Solo su firma" }, { id: "nada", nombre: "Nada" }],
          clave: "impacto",
          retros: { firma: "Antes de aprobar se estima el impacto del cambio.", nada: "Si toca una línea base, siempre va el proceso formal." } },
        { id: "c4h08-t3", subtemas: ["gp-4-6"], turno: 3, barajar: true,
          contexto: "La ampliación toca una línea base.",
          consigna: "¿Quién la aprueba?",
          destinos: [{ id: "ccb", nombre: "El CCB y la patrocinadora, si no está en él" }, { id: "tu", nombre: "Solo tú" }, { id: "contratista", nombre: "El contratista" }],
          clave: "ccb",
          retros: { tu: "Tú decides cambios que no tocan líneas base; estos van al CCB.", contratista: "El contratista no aprueba cambios de Altamira." } },
        /* Turno 4: los dos diales van juntos en una sola decisión (vale 1 si ambos están bien). */
        { id: "c4h08-t4", subtemas: ["gp-4-6"], turno: 4, votos: [3, 2, 2], barajar: true,
          contexto: "El CCB tiene 7 miembros: 3 aprueban, 2 aplazan, 2 rechazan.",
          consigna: "Decide por mayoría y luego por pluralidad.",
          destinos: [
            { id: "nada-aprobar", nombre: "Mayoría: no hay decisión · Pluralidad: aprobar", diales: ["No hay decisión", "Aprobar"] },
            { id: "aprobar-aprobar", nombre: "Mayoría: aprobar · Pluralidad: aprobar", diales: ["Aprobar", "Aprobar"] },
            { id: "nada-aplazar", nombre: "Mayoría: no hay decisión · Pluralidad: aplazar", diales: ["No hay decisión", "Aplazar"] },
          ],
          clave: "nada-aprobar",
          retros: { "aprobar-aprobar": "Mayoría pide más del 50 %: 3 de 7 es 43 %.", "nada-aplazar": "Pluralidad gana el bloque más grande aunque no sea mayoría." } },
        { id: "c4h08-t5", subtemas: ["gp-4-6"], turno: 5, barajar: true,
          contexto: "El plan de Altamira dice que el CCB decide por pluralidad: aprobado.",
          consigna: "¿En qué proceso se hace la ampliación?",
          destinos: [{ id: "dirigir", nombre: "Dirigir y gestionar el trabajo" }, { id: "monitorear", nombre: "Monitorear y controlar el trabajo" }, { id: "cerrar", nombre: "Cerrar el proyecto" }],
          clave: "dirigir",
          retros: { monitorear: "Monitorear revisa avances; los cambios aprobados se implementan al dirigir el trabajo.", cerrar: "La ampliación es trabajo del proyecto, no del cierre." } },
        { id: "c4h08-t6", subtemas: ["gp-4-6"], turno: 6,
          contexto: "La línea base de costos cambia en julio.",
          consigna: "¿Qué pasa con los costos de marzo a junio?",
          destinos: [{ id: "igual", nombre: "Quedan igual: el pasado no se modifica" }, { id: "recalculan", nombre: "Se recalculan" }],
          clave: "igual",
          retros: { recalculan: "La línea base cambia de la última en adelante; el pasado no." } },
        { id: "c4h08-t7", subtemas: ["gp-4-6"], turno: 7,
          contexto: "El CCB rechaza el cambio del proveedor de leche.",
          consigna: "¿Y ahora?",
          destinos: [{ id: "comunicar", nombre: "Se comunica al gerente y queda en el registro de cambios" }, { id: "archivar", nombre: "Se archiva sin avisar" }],
          clave: "comunicar",
          retros: { archivar: "Lo aplazado o rechazado se comunica al solicitante y se registra." } },
      ],
    },
  ],
};

/* ─── H09 · Apaga el proyecto (2 etapas) ─── */
export const GP_C4_H09 = {
  id: "gp26-cie-c04-h09-breakers",
  contexto: "La tienda de Barranquilla abrió y Operaciones costa la recibió. Antes de irte, debes apagar uno a uno los circuitos del proyecto.",
  rol: "Diriges el cierre del proyecto de Barranquilla.",
  consigna: "Baja el interruptor de cada tarea de cierre.",
  cierre: null,
  subtemas: ["gp-4-7"],
  elenco: ["tu", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Baja el interruptor de cada tarea de cierre.",
      destinos: [{ id: "cierre", nombre: "Bajar: es cierre" }, { id: "no-cierre", nombre: "No es cierre" }],
      partida: { n: 7, siempre: ["c4h09-09", "c4h09-10", "c4h09-11"] },
      banco: con("gp-4-7", [
        it("c4h09-01", "Confirmar que Operaciones costa aceptó formalmente la tienda.", "cierre", "Sin aceptación formal del cliente no se cierra."),
        it("c4h09-02", "Asignar todos los costos al proyecto y cerrar sus cuentas.", "cierre", "Cerrar las cuentas es parte del cierre administrativo."),
        it("c4h09-03", "Reasignar a los técnicos y al personal de obra.", "cierre", "Liberar y reasignar al personal es parte del cierre."),
        it("c4h09-04", "Ocuparse de los materiales que sobraron.", "cierre", "El exceso de materiales se resuelve al cerrar."),
        it("c4h09-05", "Confirmar el trabajo del constructor y cerrar sus reclamaciones.", "cierre", "Cerrar el contrato: aceptar el trabajo del vendedor y sus reclamaciones."),
        it("c4h09-06", "Pasar las lecciones al repositorio de lecciones aprendidas.", "cierre", "Al cerrar, las lecciones pasan al repositorio de la organización."),
        it("c4h09-07", "Medir la satisfacción de los interesados.", "cierre", "Medir la satisfacción es una actividad del cierre."),
        it("c4h09-08", "Enviar a la PMO sugerencias para mejorar sus procedimientos.", "cierre", "Las sugerencias de mejora se recogen y envían al cerrar."),
        it("c4h09-09", "Tostar y vender café cada día en la tienda.", "no-cierre", "Es operación: sigue después del proyecto."),
        it("c4h09-10", "Aprobar un cambio nuevo: agregar una terraza.", "no-cierre", "Un cambio nuevo es control de cambios, no cierre."),
        it("c4h09-11", "Planificar la tienda de Cartagena.", "no-cierre", "Es otro proyecto del programa, no el cierre de este."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Arma el informe final con lo que debe llevar.",
      destinos: [{ id: "va", nombre: "Va en el informe" }, { id: "no-va", nombre: "No va" }],
      partida: { porClave: { va: 6, "no-va": 2 } },
      banco: con("gp-4-7", [
        it("c4h09-12", "Resumen del proyecto.", "va", "El informe final empieza con un resumen del proyecto."),
        it("c4h09-13", "Objetivos de alcance y evidencia de que se cumplieron.", "va", "El alcance se informa con criterios y evidencia."),
        it("c4h09-14", "Costos reales y razones de la variación.", "va", "Los costos se informan con su variación y sus razones."),
        it("c4h09-15", "Fechas reales de los hitos y por qué variaron.", "va", "El cronograma se informa con fechas reales y razones."),
        it("c4h09-16", "Beneficios logrados o cuándo se esperan.", "va", "Si faltan beneficios, se dice cuánto se logró y cuándo."),
        it("c4h09-17", "Riesgos e incidentes y cómo se abordaron.", "va", "El informe resume riesgos e incidentes y su manejo."),
        it("c4h09-18", "Validación del producto entregado.", "va", "La validación del resultado final va en el informe."),
        it("c4h09-19", "Cronograma detallado de la tienda de Cartagena.", "no-va", "Es planificación de otro proyecto, no resumen de este."),
        it("c4h09-20", "Presupuesto del próximo año de la tienda.", "no-va", "Es de operaciones: el informe resume el proyecto cerrado."),
        it("c4h09-21", "Tu opinión personal sobre la patrocinadora.", "no-va", "El informe resume desempeño, no opiniones personales."),
      ]),
      despues: { id: "c4h09-22", subtemas: ["gp-4-7"], barajar: true,
        contexto: "La junta cancela la tienda de Cartagena a mitad de obra.",
        consigna: "¿Qué exige el cierre de ese proyecto?",
        destinos: [{ id: "documentar", nombre: "Documentar por qué y transferir lo hecho y lo pendiente" }, { id: "nada", nombre: "Nada: se abandona" }, { id: "terminar", nombre: "Terminarlo de todos modos" }],
        clave: "documentar",
        retros: { nada: "Si termina antes, se documenta por qué y se transfiere lo hecho.", terminar: "Cancelado no se termina; se cierra formalmente." } },
    },
  ],
};

/* ─── H10 · Los canales del beneficiadero (3 etapas, taller del capítulo) ─── */
export const TANQUES = [
  { id: "4-1", nombre: "Desarrollar el acta", sub: "gp-4-1" },
  { id: "4-2", nombre: "Desarrollar el plan para la dirección", sub: "gp-4-2" },
  { id: "4-3", nombre: "Dirigir y gestionar el trabajo", sub: "gp-4-3" },
  { id: "4-4", nombre: "Gestionar el conocimiento", sub: "gp-4-4" },
  { id: "4-5", nombre: "Monitorear y controlar el trabajo", sub: "gp-4-5" },
  { id: "4-6", nombre: "Realizar el control integrado de cambios", sub: "gp-4-6" },
  { id: "4-7", nombre: "Cerrar el proyecto o fase", sub: "gp-4-7" },
];
const GRUPOS = [
  { id: "inicio", nombre: "Inicio" }, { id: "planificacion", nombre: "Planificación" }, { id: "ejecucion", nombre: "Ejecución" },
  { id: "monitoreo", nombre: "Monitoreo y Control" }, { id: "cierre", nombre: "Cierre" },
];
const RITMOS = [{ id: "una-vez", nombre: "Una vez o en puntos predefinidos" }, { id: "continuo", nombre: "Todo el proyecto" }];
const tanque = (t, grupo, ritmo, retroGrupo, retroRitmo) => [
  { id: `c4h10-${t.id}-g`, texto: `Grupo de «${t.nombre}»`, tanque: t.id, clave: grupo, retro: retroGrupo, subtemas: [t.sub], destinos: GRUPOS, consigna: "Pon cada proceso en su grupo y su ritmo." },
  { id: `c4h10-${t.id}-r`, texto: `Ritmo de «${t.nombre}»`, tanque: t.id, clave: ritmo, retro: retroRitmo, subtemas: [t.sub], destinos: RITMOS, consigna: "Pon cada proceso en su grupo y su ritmo." },
];
const T = Object.fromEntries(TANQUES.map((t) => [t.id, t]));
const ENTRADAS = TANQUES.filter((t) => t.id !== "4-1").map(({ id, nombre }) => ({ id, nombre }));
const canal = (id, salida, sale, entra, retro, extra = {}) => ({ id, texto: salida, sale, clave: entra, retro, subtemas: [T[entra].sub], ...extra });

export const GP_C4_H10 = {
  id: "gp26-cie-c04-h10-beneficiadero",
  contexto: "El beneficiadero de café de la finca es un buen modelo: lo que sale de un tanque entra a otro. Los procesos de integración funcionan igual.",
  rol: "Diriges Barranquilla y armas el mapa de sus siete procesos.",
  consigna: "Pon cada proceso en su grupo y su ritmo.",
  cierre: "Integrar es que lo que sale de un proceso llegue bien al siguiente.",
  subtemas: ["gp-4-1", "gp-4-2", "gp-4-3", "gp-4-4", "gp-4-5", "gp-4-6", "gp-4-7"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Pon cada proceso en su grupo y su ritmo.",
      pasos: [{ grupo: "tanques", consigna: "Pon cada proceso en su grupo y su ritmo.", items: [
        ...tanque(T["4-1"], "inicio", "una-vez", "Autorizar el proyecto es del Inicio.", "El acta se hace una vez o en puntos fijos."),
        ...tanque(T["4-2"], "planificacion", "una-vez", "Consolidar el plan es Planificación.", "Se arma una vez o en puntos predefinidos."),
        ...tanque(T["4-3"], "ejecucion", "continuo", "Hacer el trabajo del plan es Ejecución.", "El trabajo se dirige a lo largo de todo el proyecto."),
        ...tanque(T["4-4"], "ejecucion", "continuo", "Se hace mientras se trabaja: grupo de Ejecución.", "El conocimiento se gestiona todo el proyecto, no solo al final."),
        ...tanque(T["4-5"], "monitoreo", "continuo", "Seguir e informar el avance es Monitoreo y Control.", "El monitoreo es continuo."),
        ...tanque(T["4-6"], "monitoreo", "continuo", "Revisar y decidir cambios es Monitoreo y Control.", "Los cambios llegan en cualquier momento del proyecto."),
        ...tanque(T["4-7"], "cierre", "una-vez", "Finalizar todo es el Cierre.", "Se cierra una vez o al final de cada fase."),
      ] }],
    },
    {
      tipo: "clasificar",
      consigna: "Conecta cada salida con el proceso que la recibe.",
      destinos: ENTRADAS,
      /* 7 de 8 canales: siempre los dos de cambios. */
      partida: { n: 5, siempre: ["c4h10-c5", "c4h10-c6"] },
      banco: [
        canal("c4h10-c1", "Acta de constitución", "4.1", "4-2", "El plan parte del acta: es su punto de partida."),
        canal("c4h10-c2", "Plan para la dirección", "4.2", "4-3", "El trabajo se ejecuta según el plan."),
        canal("c4h10-c3", "Datos de desempeño → Comparar con el plan → Información de desempeño", "4.3", "4-5", "Los datos, comparados con el plan, llegan como información al monitoreo.", { compuerta: true }),
        canal("c4h10-c4", "Informes de desempeño", "4.5", "4-6", "Los informes de desempeño ayudan a evaluar los cambios."),
        canal("c4h10-c5", "Solicitudes de cambio", "4.3 y 4.5", "4-6", "Toda solicitud de cambio se revisa en el control integrado."),
        canal("c4h10-c6", "Solicitudes de cambio aprobadas", "4.6", "4-3", "Lo aprobado se implementa al dirigir el trabajo."),
        canal("c4h10-c7", "Entregables", "4.3", "4-4", "Los entregables son entrada para gestionar el conocimiento."),
        canal("c4h10-c8", "Registro de lecciones aprendidas", "4.4", "4-7", "Al cerrar, se finaliza y pasa al repositorio."),
      ],
    },
    {
      tipo: "micros",
      consigna: "¿Le delegas la integración?",
      pasos: [
        { id: "c4h10-m1", subtemas: ["gp-4-2"],
          contexto: "Un especialista en costos se ofrece a llevar la integración por ti.",
          consigna: "¿Le delegas la integración?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "La rendición de cuentas por la integración no se delega." } },
        { id: "c4h10-m2", subtemas: ["gp-4-2"], barajar: true,
          contexto: "La tienda de Cartagena se hará con un equipo ágil.",
          consigna: "¿Qué cambia en tu papel?",
          destinos: [{ id: "facilito", nombre: "El equipo controla la planificación detallada; yo facilito" }, { id: "detalle", nombre: "Planifico yo cada detalle" }, { id: "dejo", nombre: "Dejo de responder por la integración" }],
          clave: "facilito",
          retros: { detalle: "En ágil el detalle se delega al equipo; tú creas el entorno.", dejo: "Tus expectativas no cambian: sigues respondiendo por integrar." } },
        { grupo: "decisiones", barajar: true, consigna: "Elige las tres decisiones típicas de la integración.",
          destinos: [{ id: "integracion", nombre: "Decisión de integración" }, { id: "no", nombre: "No lo es" }],
          retro: "Asignar, equilibrar demandas y gestionar dependencias son decisiones de integración.",
          items: con("gp-4-2", [
            { id: "c4h10-m3a", texto: "Asignar recursos", clave: "integracion" },
            { id: "c4h10-m3b", texto: "Equilibrar demandas que compiten", clave: "integracion" },
            { id: "c4h10-m3c", texto: "Gestionar dependencias entre áreas", clave: "integracion" },
            { id: "c4h10-m3d", texto: "Pintar el local", clave: "no", retro: "Es trabajo técnico de la obra, no decisión de integración." },
            { id: "c4h10-m3e", texto: "Tostar el café", clave: "no", retro: "Es operación, no decisión de integración del proyecto." },
          ]) },
      ],
    },
  ],
};

export const PIEZAS_TEXTO_C4 = [GP_C4_H01, GP_C4_H02, GP_C4_H03, GP_C4_H04, GP_C4_H05, GP_C4_H06, GP_C4_H07, GP_C4_H08, GP_C4_H09, GP_C4_H10];
