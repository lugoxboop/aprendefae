/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 13 «GESTIÓN DE LOS INTERESADOS» — LOS TEXTOS
 * DE LAS 11 HACER (lote 7, el último capítulo)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c13-hacer.md (§2, H01 a H11). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Proyecto del capítulo: la planta de agua potable de la vereda (120 familias).
 * Los datos del ábaco (H07: niveles C y D de cada interesado) viven en
 * PLANTA_C13: la prueba gp-lote7 recalcula cada brecha y el orden desde ellos.
 *
 * Módulos y subtemas (gp13-* del diseño → procesos de ../estructura.js):
 *   gp13-identificar, gp13-conceptos, gp13-intereses, gp13-registro,
 *   gp13-matrices, gp13-direccion → gp-13-1 · gp13-matriz-evaluacion,
 *   gp13-plan, gp13-planificar → gp-13-2 · gp13-gestionar → gp-13-3 ·
 *   gp13-monitorear → gp-13-4.
 *   H01–H06 van en Inicio (13.1); H07 y H08 en Planificación (13.2); H09 en
 *   Ejecución (13.3); H10 y el taller H11 en Monitoreo y Control (13.4: el
 *   taller cierra el capítulo con la guía para el próximo proyecto).
 *
 * Desvíos de mecánica (los motores comunes, ningún motor nuevo):
 *   H01 etapa 1: cada zona del mapa llega como tarjeta «¿Es interesado?»
 *     (12 ítems; el diseño puntúa encontrados − errores / 9).
 *   H06 etapa 1: los tres reflectores de cada interesado se encienden juntos
 *     y se comprueban con «Listo» (un ítem por interesado, con la retro de
 *     cada reflector errado; el diseño puntúa por reflector, 12).
 *   H11 etapa 3: cada lección se lleva a «Va en la guía» o «No va» (6 ítems,
 *     la misma retro por tarjeta: el total queda en los 18 del diseño).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
/* Tres opciones con la mejor primero: [texto bueno, [texto, retro], [texto, retro]]. */
const tres = (bueno, ...otras) => ({
  destinos: [{ id: "mejor", nombre: bueno }, ...otras.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(otras.map(([, r], k) => [`otra${k + 1}`, r])), barajar: true,
});

/* Los datos de la planta (H07). Los niveles del ábaco, de izquierda a derecha. */
export const NIVELES_C13 = [
  { id: "desconocedor", nombre: "Desconocedor", corto: "Desc." },
  { id: "reticente", nombre: "Reticente", corto: "Ret." },
  { id: "neutral", nombre: "Neutral", corto: "Neu." },
  { id: "apoyo", nombre: "De apoyo", corto: "Apoyo" },
  { id: "lider", nombre: "Líder", corto: "Líder" },
];
export const PLANTA_C13 = {
  familias: 120,
  fundacion: 50,
  /* H07: C (hoy) y D (deseado, lo fija el equipo: dato del escenario) de cada varilla. */
  abaco: [
    { id: "familias", nombre: "Familias de la parte alta", c: "desconocedor", d: "apoyo", brecha: 3 },
    { id: "duena", nombre: "Dueña del lote", c: "reticente", d: "apoyo", brecha: 2 },
    { id: "autoridad", nombre: "Autoridad ambiental", c: "neutral", d: "neutral", brecha: 0 },
    { id: "alcaldia", nombre: "Alcaldía", c: "apoyo", d: "lider", brecha: 1 },
    { id: "jac", nombre: "Presidencia de la JAC", c: "lider", d: "lider", brecha: 0 },
  ],
};
const P = PLANTA_C13;

/* ─── H01 · La vereda desde el aire (2 etapas) ─── */
export const ACTA_C13 = ["Patrocinadora", "Alcaldía", "Junta de Acción Comunal"];
export const GP_C13_H01 = {
  id: "gp26-ini-c13-h01-identificar",
  contexto: "Altamira construirá una planta de agua potable para la vereda vecina a la finca. El acta nombra solo tres interesados.",
  rol: "Diriges el proyecto de la planta de agua.",
  consigna: "Encuentra en el mapa a los interesados que faltan.",
  cierre: "Interesado: persona, grupo u organización que afecta o es afectada por el proyecto.",
  subtemas: ["gp-13-1"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Encuentra en el mapa a los interesados que faltan.",
      destinos: [{ id: "si", nombre: "Es interesado", pista: "a la lista" }, { id: "no", nombre: "No lo es", pista: "se queda en el mapa" }],
      partida: { todas: true },
      banco: con("gp-13-1", [
        it("c13h01-01", "Casas: «Las 120 familias que tomarán el agua.»", "si", "Las afecta directamente el resultado: son interesadas.", { zona: "casas", nombre: "Las 120 familias" }),
        it("c13h01-02", "Lote con cerca: «La dueña del lote donde irá el tanque.»", "si", "Su propiedad queda afectada: es interesada.", { zona: "lote", nombre: "Dueña del lote" }),
        it("c13h01-03", "Edificio con hoja: «La autoridad ambiental.»", "si", "Regula la captación de agua: puede afectar al proyecto.", { zona: "ambiental", nombre: "Autoridad ambiental" }),
        it("c13h01-04", "Pancarta: «El grupo que defiende la quebrada.»", "si", "Cree que la obra lo afectará: también cuenta.", { zona: "pancarta", nombre: "Grupo de la quebrada" }),
        it("c13h01-05", "Colegio: «El colegio de la vereda.»", "si", "Sus estudiantes recibirán el agua.", { zona: "colegio", nombre: "Colegio" }),
        it("c13h01-06", "Antena: «La emisora comunitaria.»", "si", "Los medios también entran en la definición amplia.", { zona: "antena", nombre: "Emisora comunitaria" }),
        it("c13h01-07", "Maletín: «El contratista que construirá la planta.»", "si", "Las partes de un contrato son interesados.", { zona: "maletin", nombre: "Contratista" }),
        it("c13h01-08", "Hámster: «El equipo de la obra.»", "si", "El propio equipo también es interesado.", { zona: "hamster", nombre: "Equipo de la obra" }),
        it("c13h01-09", "Conejo: «El cliente principal de Altamira, que pidió conocer el proyecto.»", "si", "Le interesa el resultado y puede influir: cuenta.", { zona: "conejo", nombre: "Cliente principal" }),
        it("c13h01-10", "La quebrada.", "no", "La quebrada no es interesada; quien la defiende, sí.", { zona: "quebrada" }),
        it("c13h01-11", "La vía.", "no", "Es un lugar, no una persona, grupo u organización.", { zona: "via" }),
        it("c13h01-12", "La vaca.", "no", "Interesados son personas, grupos u organizaciones.", { zona: "vaca" }),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Qué documento te habría avisado de cada uno?",
      destinos: [
        { id: "acta", nombre: "Acta" }, { id: "caso", nombre: "Caso de negocio" }, { id: "beneficios", nombre: "Plan de beneficios" },
        { id: "acuerdos", nombre: "Acuerdos" }, { id: "incidentes", nombre: "Registro de incidentes" },
      ],
      partida: { todas: true },
      banco: con("gp-13-1", [
        it("c13h01-21", "«La alcaldía, que aporta la mitad del dinero.»", "acta", "El acta ya trae la lista de interesados clave."),
        it("c13h01-22", "«La vereda afectada, según el estudio inicial.»", "caso", "El caso de negocio trae la lista inicial de afectados."),
        it("c13h01-23", "«Las familias que recibirán el agua.»", "beneficios", "Identifica a quienes se benefician de los resultados."),
        it("c13h01-24", "«El contratista de la planta.»", "acuerdos", "Las partes de un acuerdo son interesados del proyecto."),
        it("c13h01-25", "«Un vecino que reportó daños en su cerca por la obra.»", "incidentes", "Un incidente puede traer interesados nuevos."),
      ]),
    },
  ],
};

/* ─── H02 · Las cinco tinajas ─── */
export const TINAJAS_C13 = [
  { id: "interes", nombre: "Interés", pista: "lo afecta una decisión" },
  { id: "derechos", nombre: "Derechos", pista: "legales o morales" },
  { id: "propiedad", nombre: "Propiedad", pista: "título sobre un bien" },
  { id: "conocimiento", nombre: "Conocimiento", pista: "saber especializado" },
  { id: "contribucion", nombre: "Contribución", pista: "fondos, recursos o apoyo" },
];
export const GP_C13_H02 = {
  id: "gp26-ini-c13-h02-intereses",
  contexto: "Ya tienes la lista. Ahora quieres saber qué tipo de interés tiene cada uno en la planta.",
  rol: "Haces el análisis de interesados con el practicante.",
  consigna: "Vierte cada interesado en la tinaja de su interés.",
  cierre: "Un mismo interesado puede combinar varios tipos de interés.",
  subtemas: ["gp-13-1"],
  elenco: ["practicante", "tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Vierte cada interesado en la tinaja de su interés.",
      destinos: TINAJAS_C13,
      /* 8 de 10, al menos uno por tinaja. Clave: criterio de Gen (la categoría dominante). */
      partida: { n: 8, cubrir: true },
      banco: con("gp-13-1", [
        it("c13h02-01", "«Las familias que tomarán el agua todos los días.»", "interes", "Las afecta directamente el resultado del proyecto."),
        it("c13h02-02", "«Los niños del colegio, que hoy toman agua sin tratar.»", "interes", "El resultado los afecta en su salud diaria: interés."),
        it("c13h02-03", "«Los obreros exigen condiciones de seguridad en la obra.»", "derechos", "Salud y seguridad en el trabajo: un derecho legal."),
        it("c13h02-04", "«El grupo que pide proteger el nacimiento de la quebrada.»", "derechos", "Sostenibilidad ambiental: un derecho moral."),
        it("c13h02-05", "«La dueña del lote donde irá el tanque.»", "propiedad", "Tiene título legal sobre el lote."),
        it("c13h02-06", "«El dueño de la finca por donde pasará la tubería.»", "propiedad", "Su predio es una propiedad legal afectada."),
        it("c13h02-07", "«La universidad que analizó la calidad del agua.»", "conocimiento", "Aporta saber especializado al proyecto."),
        it("c13h02-08", "«El fontanero que conoce las tuberías viejas de la vereda.»", "conocimiento", "Su saber local hace más eficaz la obra."),
        it("c13h02-09", "«La fundación que dona $50 M.»", "contribucion", "Aporta fondos: es contribución."),
        it("c13h02-10", "«La presidencia de la JAC, que respalda el proyecto ante la alcaldía.»", "contribucion", "Apoyo intangible que amortigua la política: contribución."),
      ]),
    },
  ],
};

/* ─── H03 · La carpeta de tres argollas (2 etapas) ─── */
export const SECCIONES_C13 = [
  { id: "identificacion", nombre: "Identificación" },
  { id: "evaluacion", nombre: "Evaluación" },
  { id: "clasificacion", nombre: "Clasificación" },
];
export const GP_C13_H03 = {
  id: "gp26-ini-c13-h03-registro",
  contexto: "La PMO te pide el registro de interesados de la planta. Empiezas por la Junta de Acción Comunal.",
  rol: "Llenas el registro de interesados del proyecto.",
  consigna: "Escribe cada dato en su sección del registro.",
  cierre: "Registro: identificación, evaluación y clasificación.",
  subtemas: ["gp-13-1"],
  elenco: ["tu", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Escribe cada dato en su sección del registro.",
      destinos: SECCIONES_C13,
      /* 8 de 10, al menos 2 por sección. */
      partida: { n: 8, minPorClave: 2 },
      banco: con("gp-13-1", [
        it("c13h03-01", "«Presidencia de la Junta de Acción Comunal.»", "identificacion", "Nombre y puesto: datos de identificación."),
        it("c13h03-02", "«Salón comunal de la vereda; teléfono y correo.»", "identificacion", "Ubicación y contacto van en identificación."),
        it("c13h03-03", "«Rol: convoca a la comunidad a las asambleas.»", "identificacion", "El rol en el proyecto es dato de identificación."),
        it("c13h03-04", "«Requisito principal: agua para las 120 familias.»", "evaluacion", "Los requisitos principales van en la evaluación."),
        it("c13h03-05", "«Espera que la obra contrate mano de obra local.»", "evaluacion", "Es una expectativa: información de evaluación."),
        it("c13h03-06", "«Influye más en la fase de diseño.»", "evaluacion", "La fase de mayor influencia es dato de evaluación."),
        it("c13h03-07", "«Puede movilizar a la vereda a favor o en contra.»", "evaluacion", "Potencial para influir en los resultados: evaluación."),
        it("c13h03-08", "«Externa a Altamira.»", "clasificacion", "Interno o externo es una clasificación."),
        it("c13h03-09", "«Poder medio, interés alto.»", "clasificacion", "Poder e interés clasifican al interesado."),
        it("c13h03-10", "«Influencia hacia afuera.»", "clasificacion", "La dirección de la influencia es una clasificación."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Tres preguntas sobre el registro.",
      pasos: [
        { id: "c13h03-11", subtemas: ["gp-13-1"], mesa: "pmo",
          contexto: "Anotaste «poder medio», pero nadie lo ha confirmado.",
          consigna: "¿Dónde registras que es una suposición?",
          ...tres("Registro de supuestos",
            ["Registro de riesgos", "Los riesgos van allá; esto es un supuesto sobre el poder."],
            ["En ninguna parte", "Poder e interés suelen ser supuestos: se documentan."]) },
        { id: "c13h03-12", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "Es tu primera identificación. ¿Hay solicitudes de cambio?",
          destinos: SI_NO, clave: "no", retros: { si: "En la primera identificación todavía no hay solicitudes de cambio." } },
        { id: "c13h03-13", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "¿Cuál es la salida principal de Identificar a los Interesados?",
          ...tres("El registro de interesados",
            ["El plan de involucramiento", "El plan sale del proceso siguiente, Planificar el Involucramiento."],
            ["El acta", "El acta es una entrada: viene de integración."]) },
      ],
    },
  ],
};

/* ─── H04 · El patio de la escuela (2 etapas) ─── */
export const CUADRANTES_C13 = [
  { id: "alto-alto", nombre: "Poder alto · interés alto" },
  { id: "alto-bajo", nombre: "Poder alto · interés bajo" },
  { id: "bajo-alto", nombre: "Poder bajo · interés alto" },
  { id: "bajo-bajo", nombre: "Poder bajo · interés bajo" },
];
export const FICHAS_C13 = [
  { id: "alcaldia", nombre: "Alcaldía" },
  { id: "patrocinadora", nombre: "Patrocinadora" },
  { id: "autoridad", nombre: "Autoridad ambiental" },
  { id: "familias", nombre: "Familias" },
  { id: "colegio", nombre: "Colegio" },
  { id: "proveedor", nombre: "Proveedor de tubos" },
];
export const GP_C13_H04 = {
  id: "gp26-ini-c13-h04-poder-interes",
  contexto: "Son muchos interesados y poco tiempo. En el patio de la escuela pintas una cuadrícula de poder e interés.",
  rol: "Clasificas a los interesados para priorizar con la patrocinadora.",
  consigna: "Pega cada ficha en su cuadrante.",
  cierre: "Poder es autoridad; interés es inquietud por los resultados: son ejes distintos.",
  subtemas: ["gp-13-1"],
  elenco: ["patrocinadora", "tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pega cada ficha en su cuadrante.",
      destinos: CUADRANTES_C13,
      partida: { todas: true },
      /* Clave: criterio de Gen, tomada de la descripción (autoridad e inquietud). */
      banco: con("gp-13-1", [
        it("c13h04-01", "«Alcaldía: aporta la mitad del dinero y sigue cada avance.»", "alto-alto", "Decide fondos y sigue el resultado de cerca.", { ficha: "alcaldia" }),
        it("c13h04-02", "«Patrocinadora: autoriza el proyecto y quiere que funcione.»", "alto-alto", "Tiene autoridad y le inquieta el resultado.", { ficha: "patrocinadora" }),
        it("c13h04-03", "«Autoridad ambiental: puede negar el permiso; revisa cientos de trámites iguales.»", "alto-bajo", "Tiene autoridad, pero el resultado no le inquieta especialmente.", { ficha: "autoridad" }),
        it("c13h04-04", "«Familias: tomarán el agua; no deciden nada formalmente.»", "bajo-alto", "Les importa mucho, pero no tienen autoridad formal.", { ficha: "familias" }),
        it("c13h04-05", "«Colegio: sus estudiantes beberán el agua; no aprueba nada.»", "bajo-alto", "Interés alto sin autoridad sobre el proyecto.", { ficha: "colegio" }),
        it("c13h04-06", "«Proveedor de tubos, uno entre varios; le da igual el resultado.»", "bajo-bajo", "Ni autoridad ni inquietud especial por el resultado.", { ficha: "proveedor" }),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Elige quiénes van a la cabeza de la lista.",
      pasos: [
        { tipo: "casillas", id: "c13h04-11", subtemas: ["gp-13-1"], mesa: "patrocinadora",
          consigna: "Elige quiénes van a la cabeza de la lista.",
          retro: "Mayor interés y mayor influencia suelen ir a la cabeza de la lista.",
          casillas: [{ id: "cabeza", nombre: "Toca 2 fichas", marcar: true, clave: ["alcaldia", "patrocinadora"], opciones: FICHAS_C13 }] },
        { id: "c13h04-12", subtemas: ["gp-13-1"], mesa: "patrocinadora",
          consigna: "¿Qué mide el eje del interés?",
          ...tres("Su inquietud por los resultados",
            ["Su autoridad", "Eso es poder, el otro eje."],
            ["Su dinero", "Aportar dinero es contribución, no interés."]) },
        { id: "c13h04-13", subtemas: ["gp-13-1"], mesa: "patrocinadora",
          contexto: "La patrocinadora pregunta si la cuadrícula basta para 300 interesados con redes complejas.",
          consigna: "¿Qué le recomiendas?",
          ...tres("Usar el modelo de prominencia",
            ["Seguir solo con la cuadrícula", "Las matrices sirven en proyectos pequeños o con relaciones simples."],
            ["No clasificar a nadie", "Clasificar ayuda a construir relaciones con los interesados."]) },
      ],
    },
  ],
};

/* ─── H05 · La casa de guadua ─── */
export const ZONAS_C13 = [
  { id: "ascendente", nombre: "Ascendente", pista: "el piso de arriba", flecha: "↑" },
  { id: "descendente", nombre: "Descendente", pista: "el sótano, donde trabaja el equipo", flecha: "↓" },
  { id: "afuera", nombre: "Hacia afuera", pista: "el patio y la calle", flecha: "→" },
  { id: "lateral", nombre: "Lateral", pista: "el cuarto de al lado", flecha: "↔" },
];
export const GP_C13_H05 = {
  id: "gp26-ini-c13-h05-direccion",
  contexto: "Para cada interesado quieres saber desde dónde te influye: desde arriba, desde tu equipo, desde fuera o desde el lado.",
  rol: "Diriges la planta y mapeas la dirección de la influencia.",
  consigna: "Ubica a cada interesado en su parte de la casa.",
  cierre: "Arriba, abajo, afuera o al lado: así llega la influencia a tu proyecto.",
  subtemas: ["gp-13-1"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Ubica a cada interesado en su parte de la casa.",
      destinos: ZONAS_C13.map(({ id, nombre, pista }) => ({ id, nombre, pista })),
      /* 6 de 8: siempre los dos laterales (la dirección que más se olvida). */
      partida: { n: 4, siempre: ["c13h05-07", "c13h05-08"] },
      banco: con("gp-13-1", [
        it("c13h05-01", "«La patrocinadora de Altamira.»", "ascendente", "El patrocinador influye desde arriba."),
        it("c13h05-02", "«El comité de dirección de Altamira.»", "ascendente", "Alta dirección y comité de dirección: ascendente."),
        it("c13h05-03", "«El equipo de obra.»", "descendente", "El equipo del proyecto influye desde abajo."),
        it("c13h05-04", "«La ingeniera sanitaria que apoya tres semanas.»", "descendente", "Especialista temporal que aporta habilidades: descendente."),
        it("c13h05-05", "«La autoridad ambiental.»", "afuera", "Regulador externo al equipo: hacia afuera."),
        it("c13h05-06", "«Las familias usuarias del agua.»", "afuera", "Usuarios finales y público: hacia afuera."),
        it("c13h05-07", "«El director del proyecto de la tostadora, que quiere la misma retroexcavadora.»", "lateral", "Un par que compite por recursos escasos: lateral."),
        it("c13h05-08", "«El gerente de la finca, que te presta dos trabajadores.»", "lateral", "Mando intermedio que comparte recursos contigo: lateral."),
      ]),
    },
  ],
};

/* ─── H06 · Los tres reflectores (2 etapas) ─── */
export const REFLECTORES_C13 = [
  { id: "poder", nombre: "Poder", pista: "autoridad o capacidad de influir" },
  { id: "urgencia", nombre: "Urgencia", pista: "necesita atención inmediata" },
  { id: "legitimidad", nombre: "Legitimidad", pista: "su involucramiento es adecuado" },
];
const ON_OFF = [{ id: "on", nombre: "Encendido" }, { id: "off", nombre: "Apagado" }];
/* Un interesado en la tarima: [poder, urgencia, legitimidad] y la retro de cada reflector errado. */
const tarima = (id, texto, claves, retros) => ({
  tipo: "casillas", id, texto, subtemas: ["gp-13-1"], mesa: "pmo",
  casillas: REFLECTORES_C13.map((r, k) => ({ id: r.id, nombre: `${r.nombre} · ${r.pista}`, opciones: ON_OFF, clave: claves[k] ? "on" : "off", retro: retros[k] })),
});
export const MODELOS_C13 = [
  { id: "matriz", nombre: "Matriz poder/interés" },
  { id: "prominencia", nombre: "Prominencia" },
  { id: "cubo", nombre: "Cubo" },
  { id: "direccion", nombre: "Dirección de la influencia" },
  { id: "proximidad", nombre: "Prominencia con proximidad" },
];
export const GP_C13_H06 = {
  id: "gp26-ini-c13-h06-prominencia",
  contexto: "La comunidad de interesados creció y sus relaciones se enredaron. La PMO sugiere el modelo de prominencia.",
  rol: "Evalúas a cada interesado con los tres atributos.",
  consigna: "Enciende los reflectores que tiene cada interesado.",
  cierre: "Poder, urgencia y legitimidad: el modelo de prominencia para comunidades complejas.",
  subtemas: ["gp-13-1"],
  elenco: ["pmo", "tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Enciende los reflectores que tiene cada interesado.",
      partida: { todas: true },
      /* Clave: criterio de Gen (la guía define los atributos, sin ejemplos). */
      banco: [
        tarima("c13h06-01", "«Autoridad ambiental: puede frenar la obra; no tiene afán.»", [true, false, true],
          ["Puede frenar la obra: tiene poder.", "No pide atención inmediata.", "Su papel de regulador es adecuado."]),
        tarima("c13h06-02", "«Familias: el acueducto viejo se dañó; piden agua esta semana.»", [false, true, true],
          ["No tienen autoridad formal sobre el proyecto.", "Necesitan atención inmediata: urgencia.", "Son las afectadas: su involucramiento es adecuado."]),
        tarima("c13h06-03", "«Alcaldía: sus fondos para la planta vencen en 15 días.»", [true, true, true],
          ["Decide fondos: tiene poder.", "El plazo de 15 días le da urgencia.", "Cofinancia: su papel es legítimo."]),
        tarima("c13h06-04", "«Un grupo de otra ciudad, sin relación, exige dirigir la obra ya.»", [false, true, false],
          ["No tiene autoridad sobre la obra.", "Exige atención inmediata: urgencia.", "Su involucramiento no es adecuado a este proyecto."]),
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Elige el modelo que pide cada situación.",
      destinos: MODELOS_C13,
      partida: { todas: true },
      banco: con("gp-13-1", [
        it("c13h06-11", "«Proyecto pequeño: ocho interesados con relaciones simples.»", "matriz", "Las matrices sirven en proyectos pequeños y simples."),
        it("c13h06-12", "«Comunidad grande, redes complejas; buscas la importancia relativa.»", "prominencia", "La prominencia rinde en comunidades grandes y complejas."),
        it("c13h06-13", "«Quieres un modelo de tres dimensiones para diseñar la comunicación.»", "cubo", "El cubo refina las matrices en tres dimensiones."),
        it("c13h06-14", "«Quieres saber quién te influye desde arriba, abajo o al lado.»", "direccion", "Clasifica según desde dónde llega la influencia."),
        it("c13h06-15", "«Para tu equipo, cambias legitimidad por cercanía al trabajo.»", "proximidad", "Es la variante de la prominencia que se aplica al equipo."),
      ]),
    },
  ],
};

/* ─── H07 · El ábaco del involucramiento (2 etapas) ─── */
const nivel = (id) => NIVELES_C13.find((n) => n.id === id);
const RETRO_BRECHA = {
  familias: "Familias: de desconocedor a de apoyo hay 3 niveles.",
  duena: "Dueña: de reticente a de apoyo, 2 niveles.",
  autoridad: "Autoridad: C y D coinciden, brecha 0.",
  alcaldia: "Alcaldía: de apoyo a líder, 1 nivel.",
  jac: "JAC: ya está donde debe, brecha 0.",
};
export const GP_C13_H07 = {
  id: "gp26-pla-c13-h07-matriz-evaluacion",
  contexto: "Antes de la primera asamblea quieres ver cuánto apoya cada interesado hoy y cuánto apoyo necesitas.",
  rol: "Armas la matriz de evaluación del involucramiento.",
  consigna: "Pon la cuenta C donde está cada uno hoy.",
  cierre: "Cerrar la brecha entre C y D es lo que vas a monitorear.",
  subtemas: ["gp-13-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon la cuenta C donde está cada uno hoy.",
      destinos: NIVELES_C13.map(({ id, nombre }) => ({ id, nombre })),
      partida: { todas: true },
      banco: con("gp-13-2", [
        it("c13h07-01", "«Familias de la parte alta: no han oído hablar de la planta.»", "desconocedor", "No saben del proyecto ni de sus impactos.", { varilla: "familias" }),
        it("c13h07-02", "«Dueña del lote: conoce el proyecto y se resiste a cualquier cambio.»", "reticente", "Sabe y se resiste: no va a apoyar.", { varilla: "duena" }),
        it("c13h07-03", "«Autoridad ambiental: conoce el proyecto; ni lo apoya ni lo frena.»", "neutral", "Sabe, pero no toma partido.", { varilla: "autoridad" }),
        it("c13h07-04", "«Alcaldía: conoce el proyecto y lo apoya.»", "apoyo", "Sabe y apoya el trabajo y sus resultados.", { varilla: "alcaldia" }),
        it("c13h07-05", "«Presidencia de la JAC: convoca asambleas para asegurar el éxito.»", "lider", "Activamente involucrada en asegurar el éxito: líder.", { varilla: "jac" }),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Mide la brecha y decide dónde comunicar más.",
      pasos: [
        { tipo: "casillas", id: "c13h07-11", subtemas: ["gp-13-2"], mesa: "equipo",
          consigna: "¿Cuántos niveles separan C de D en cada varilla?",
          casillas: P.abaco.map((v) => ({ id: v.id, nombre: `${v.nombre} · C ${nivel(v.c).nombre} → D ${nivel(v.d).nombre}`, clave: v.brecha, unidad: "niveles", retro: RETRO_BRECHA[v.id] })) },
        { tipo: "ordenar", id: "c13h07-12", subtemas: ["gp-13-2"],
          consigna: "Ordena dónde pones más comunicación.",
          /* Las dos sin brecha (autoridad y JAC) quedan aparte, en «mantener». */
          items: [...P.abaco].filter((v) => v.brecha > 0).sort((a, b) => b.brecha - a.brecha).map((v) => ({ id: v.id, texto: v.nombre })),
          retro: "A mayor brecha, más comunicación hace falta." },
        { id: "c13h07-13", subtemas: ["gp-13-2"], mesa: "equipo",
          consigna: "¿Por qué la autoridad ambiental tiene D en neutral?",
          ...tres("El equipo fija lo esencial para el éxito; neutral basta",
            ["Es un error: todos deben ser líderes", "D es lo esencial para el éxito, no siempre líder."],
            ["Porque no importa", "Sí importa: puede negar el permiso; neutral es suficiente."]) },
      ],
    },
  ],
};

/* ─── H08 · La campana de la capilla ─── */
export const GP_C13_H08 = {
  id: "gp26-pla-c13-h08-plan",
  contexto: "El plan de involucramiento ya está aprobado. Pasan los meses y en la vereda ocurren cosas.",
  rol: "Eres responsable de mantener vigente el plan.",
  consigna: "Toca la campana si hay que actualizar el plan.",
  cierre: "El plan de involucramiento se actualiza con fases, cambios, nuevos interesados y riesgos.",
  subtemas: ["gp-13-2"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Toca la campana si hay que actualizar el plan.",
      destinos: [{ id: "si", nombre: "Tocar la campana", pista: "hay que actualizar" }, { id: "no", nombre: "Sigue igual", pista: "el plan no cambia" }],
      /* 7 de 8, al menos 2 «No». */
      partida: { n: 7, minPorClave: 2 },
      banco: con("gp-13-2", [
        it("c13h08-01", "«Empieza la fase de construcción.»", "si", "Cada nueva fase pide revisar el plan."),
        it("c13h08-02", "«Altamira crea un área de sostenibilidad que asume la planta.»", "si", "Cambió la estructura de la organización."),
        it("c13h08-03", "«Una empresa regional de acueducto operará la planta.»", "si", "Entró un interesado nuevo a la comunidad."),
        it("c13h08-04", "«La dueña del lote vende y se muda.»", "si", "Un interesado dejó la comunidad de interesados."),
        it("c13h08-05", "«El registro de riesgos advierte un posible bloqueo de la vía.»", "si", "Las salidas de riesgos obligan a revisar las estrategias."),
        it("c13h08-06", "«El hámster cambió su turno de lunes a martes.»", "no", "Es logística interna: los interesados siguen igual."),
        it("c13h08-07", "«Se compró el cemento de siempre.»", "no", "Nada cambia en la comunidad de interesados."),
        it("c13h08-08", "«Llovió el fin de semana.»", "no", "El clima no cambió quiénes son ni su importancia."),
      ]),
      despues: { id: "c13h08-11", subtemas: ["gp-13-2"],
        contexto: "La dueña del lote sigue reticente y no sabes por qué.",
        consigna: "¿Qué técnica usas para planear con ella?",
        despues: "Busca la razón de su nivel de apoyo para elegir estrategia.",
        ...tres("Análisis de causa raíz",
          ["Votación", "La votación elige respuestas; no explica el porqué."],
          ["Estudio comparativo", "Compara con otros proyectos; no busca la razón de ella."]) },
    },
  ],
};

/* ─── H09 · La asamblea del salón comunal ─── */
const momento = (id, n, texto, mejor, porque, malas) => ({
  id, subtemas: ["gp-13-3"], barajar: true, momento: n, contexto: `${n} · ${texto}`, despues: porque,
  destinos: [{ id: "mejor", nombre: mejor }, ...malas.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(malas.map(([, retro], k) => [`otra${k + 1}`, retro])),
});
export const GP_C13_H09 = {
  id: "gp26-eje-c13-h09-gestionar",
  contexto: "Primera asamblea en el salón comunal. Vienen las familias, la JAC y la alcaldía. Tienes el megáfono.",
  rol: "Diriges la planta y gestionas el involucramiento en vivo.",
  consigna: "Decide cómo actúas en cada momento de la asamblea.",
  subtemas: ["gp-13-3"],
  elenco: ["tu", "equipo", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Decide cómo actúas en cada momento de la asamblea.",
    pasos: [
      momento("c13h09-01", 1, "Al empezar hay gritos entre vecinos y nadie deja hablar.",
        "Recuerdas las reglas básicas acordadas para las reuniones.", "Las reglas básicas fijan el comportamiento esperado de todos.",
        [["Suspendes la asamblea para siempre.", "Hay una herramienta para esto: las reglas básicas."], ["Gritas más fuerte por el megáfono.", "Eso aviva el conflicto en vez de encauzarlo."]]),
      /* Distractores de los momentos 2 y 3: criterio de Gen. */
      momento("c13h09-02", 2, "Dos sectores discuten quién recibe el agua primero.",
        "Abres hoy un espacio para acordar el orden.", "Los conflictos se resuelven de manera oportuna.",
        [["Lo dejas para cuando termine la obra.", "Aplazarlo va contra resolverlo a tiempo."], ["Decides tú solo y sigues.", "Imponer no resuelve el conflicto; solo lo esconde."]]),
      momento("c13h09-03", 3, "Los mayores proponen hacer la zanja en minga, su trabajo colectivo de siempre.",
        "Escuchas la propuesta y la tienes en cuenta en el plan.", "Conciencia cultural: comunicarte teniendo en cuenta su cultura.",
        [["La rechazas: ya hay contratista.", "Ignorar la costumbre local resta apoyo."], ["Dices que sí y no haces nada.", "Prometer sin cumplir daña la confianza."]]),
      momento("c13h09-04", 4, "La alcaldía quiere inaugurar antes de elecciones; la autoridad ambiental no da aún el permiso.",
        "Entiendes quién decide qué y negocias una fecha realista.", "Conciencia política y negociación: entender el poder y buscar acuerdo.",
        [["Prometes la fecha de la alcaldía.", "Sin el permiso, esa fecha no depende de ti."], ["Ignoras a la alcaldía.", "Tiene poder y cofinancia: hay que gestionar su expectativa."]]),
      { id: "c13h09-11", subtemas: ["gp-13-3"],
        contexto: "La asamblea pide que la zanja se haga en minga.",
        consigna: "¿Qué sale de esto?",
        despues: "Los cambios de alcance pasan por el control integrado de cambios.",
        ...tres("Una solicitud de cambio",
          ["Cambias el contrato hoy mismo", "Primero se evalúa el cambio; no se aplica directo."],
          ["Nada", "Gestionar el involucramiento puede generar cambios de alcance."]) },
    ],
  }],
};

/* ─── H10 · Las compuertas de la acequia (2 etapas) ─── */
export const COMPUERTAS_C13 = [
  { id: "causa", nombre: "Causa raíz" },
  { id: "alternativas", nombre: "Alternativas" },
  { id: "multicriterio", nombre: "Multicriterio" },
  { id: "votacion", nombre: "Votación" },
  { id: "matriz", nombre: "Matriz de evaluación" },
  { id: "retro", nombre: "Retroalimentación" },
];
export const POZOS_C13 = [
  { id: "datos", nombre: "Datos de desempeño (entra)" },
  { id: "informacion", nombre: "Información de desempeño (sale)" },
  { id: "cambio", nombre: "Solicitud de cambio (sale)" },
];
export const GP_C13_H10 = {
  id: "gp26-moc-c13-h10-monitorear",
  contexto: "Tres meses después, la matriz muestra que la dueña del lote sigue reticente. La tubería no puede pasar.",
  rol: "Monitoreas el involucramiento y ajustas la estrategia.",
  consigna: "Abre la compuerta de la técnica que necesitas.",
  cierre: "Monitorear: medir el involucramiento, comparar con lo deseado y ajustar.",
  subtemas: ["gp-13-4"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Abre la compuerta de la técnica que necesitas.",
      destinos: COMPUERTAS_C13,
      partida: { todas: true },
      banco: con("gp-13-4", [
        it("c13h10-01", "«Saber por qué la dueña sigue reticente.»", "causa", "Busca el motivo de fondo del involucramiento que no funciona."),
        it("c13h10-02", "«Comparar tres respuestas: otro trazado, compensación o mesa de diálogo.»", "alternativas", "Evalúa opciones para responder a la desviación."),
        it("c13h10-03", "«Ponderar costo, plazo y apoyo para elegir la respuesta.»", "multicriterio", "Criterios priorizados y ponderados: decisión con múltiples criterios."),
        it("c13h10-04", "«El comité escoge entre las dos respuestas finalistas.»", "votacion", "Votar sirve para seleccionar la mejor respuesta."),
        it("c13h10-05", "«Seguir mes a mes cómo cambia el nivel C de cada uno.»", "matriz", "La matriz monitorea los cambios de nivel de participación."),
        it("c13h10-06", "«Confirmar que la dueña entendió la propuesta.»", "retro", "Asegura que la información se recibió y se comprendió."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Clasifica lo que entra y sale del monitoreo.",
      destinos: POZOS_C13,
      partida: { todas: true },
      banco: con("gp-13-4", [
        it("c13h10-11", "«Lista de quiénes asistieron a la última asamblea.»", "datos", "Es dato en bruto: entra al proceso, no sale."),
        it("c13h10-12", "«La dueña sigue reticente; el nivel deseado es de apoyo.»", "informacion", "Compara el apoyo actual con el deseado: es información."),
        it("c13h10-13", "«Cambiar el trazado para no cruzar su lote.»", "cambio", "Acción correctiva: va como solicitud de cambio."),
        it("c13h10-14", "«Visitas mensuales para que la alcaldía no baje su apoyo.»", "cambio", "Acción preventiva: también va como solicitud de cambio."),
      ]),
      despues: { id: "c13h10-21", subtemas: ["gp-13-4"],
        consigna: "¿Por dónde pasa esa solicitud de cambio?",
        ...tres("Control integrado de cambios",
          ["Directo a la obra", "Se revisa y aprueba antes de aplicarse."],
          ["Al registro de interesados", "El registro se actualiza; el cambio se aprueba aparte."]) },
    },
  ],
};

/* ─── H11 · La planta en corte (3 etapas) ─── */
export const PROCESOS_C13 = [
  { id: "identificar", nombre: "Identificar", tramo: "Bocatoma" },
  { id: "planificar", nombre: "Planificar el involucramiento", tramo: "Desarenador" },
  { id: "gestionar", nombre: "Gestionar el involucramiento", tramo: "Filtro" },
  { id: "monitorear", nombre: "Monitorear el involucramiento", tramo: "Tanque" },
];
const SUB_PROCESO = { identificar: "gp-13-1", planificar: "gp-13-2", gestionar: "gp-13-3", monitorear: "gp-13-4" };
const accion = (id, texto, clave, retro) => it(id, texto, clave, retro, { subtemas: [SUB_PROCESO[clave]] });
export const GP_C13_H11 = {
  id: "gp26-moc-c13-h11-taller",
  contexto: "La planta abre el mes próximo. La PMO quiere una guía para el próximo proyecto social de Altamira.",
  rol: "Escribes la guía con lo que aprendiste de los interesados.",
  consigna: "Lleva cada acción al proceso que la hace.",
  subtemas: ["gp-13-1", "gp-13-2", "gp-13-3", "gp-13-4"],
  elenco: ["tu", "pmo", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada acción al proceso que la hace.",
      destinos: PROCESOS_C13.map(({ id, nombre }) => ({ id, nombre })),
      partida: { todas: true },
      banco: [
        accion("c13h11-01", "«Analizar intereses e influencia de cada interesado.»", "identificar", "Analizar y documentar intereses e influencia es identificar."),
        accion("c13h11-02", "«Crear el registro de interesados.»", "identificar", "El registro es la salida principal de identificar."),
        accion("c13h11-03", "«Comparar C y D para definir estrategias.»", "planificar", "La matriz de evaluación sirve para planificar el involucramiento."),
        accion("c13h11-04", "«Escribir las estrategias para cada grupo.»", "planificar", "Esas estrategias forman el plan de involucramiento."),
        accion("c13h11-05", "«Negociar con la alcaldía una fecha de entrega.»", "gestionar", "Gestionar expectativas negociando es gestionar el involucramiento."),
        accion("c13h11-06", "«Resolver la pelea por el turno del agua.»", "gestionar", "Abordar incidentes y conflictos es gestionar."),
        accion("c13h11-07", "«Revisar si la brecha entre C y D se cerró.»", "monitorear", "Seguir el nivel de participación es monitorear."),
        accion("c13h11-08", "«Ajustar la estrategia porque la dueña no cambió.»", "monitorear", "Adaptar estrategias según resultados es monitorear."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Responde las reglas de tiempo de la guía.",
      pasos: [
        { id: "c13h11-11", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "¿Cuándo se identifica por primera vez?",
          ...tres("Antes o junto con el acta",
            ["Al cerrar", "Se identifica al inicio, no al final."],
            ["Solo si hay problemas", "Se empieza lo antes posible, haya o no problemas."]) },
        { id: "c13h11-12", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "¿Cuándo se repite siempre?",
          ...tres("Al inicio de cada fase",
            ["Cada año", "La guía lo ata a las fases y a cambios significativos."],
            ["Nunca", "Es un proceso periódico: se repite."]) },
        { tipo: "casillas", id: "c13h11-13", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "¿Qué procesos se hacen durante todo el proyecto?",
          retro: "Gestionar y monitorear ocurren a lo largo de todo el proyecto.",
          casillas: [{ id: "todo", nombre: "Toca 2 procesos", marcar: true, columnas: 1, clave: ["gestionar", "monitorear"], opciones: PROCESOS_C13.map(({ id, nombre }) => ({ id, nombre })) }] },
        { id: "c13h11-14", subtemas: ["gp-13-1"], mesa: "pmo",
          consigna: "¿Qué documento no existe en la primera identificación?",
          ...tres("El plan para la dirección del proyecto",
            ["El acta", "El acta ya existe o se aprueba al mismo tiempo."],
            ["El caso de negocio", "El caso es fuente de la primera identificación."]) },
      ],
    },
    {
      tipo: "clasificar",
      consigna: "Escoge las tres lecciones para el próximo proyecto.",
      destinos: [{ id: "elegir", nombre: "Va en la guía" }, { id: "no", nombre: "No va" }],
      partida: { todas: true },
      banco: con("gp-13-1", [
        it("c13h11-21", "«Gestionar la satisfacción de los interesados como objetivo del proyecto.»", "elegir", "La guía pide tratar la satisfacción como un objetivo."),
        it("c13h11-22", "«Incluir a las familias como socias del equipo.»", "elegir", "La cocreación suma a los más afectados como socios."),
        it("c13h11-23", "«Medir cuánto costó no involucrar a tiempo a la dueña.»", "elegir", "Medir el valor negativo de no involucrar es tendencia actual."),
        it("c13h11-24", "«Identificar solo a quienes apoyan el proyecto.»", "no", "Hay que identificar a todos, no un grupo limitado."),
        it("c13h11-25", "«Dejar el involucramiento solo en manos del director.»", "no", "Todo el equipo debe participar en el involucramiento."),
        it("c13h11-26", "«Hacer el registro una vez y archivarlo.»", "no", "El registro se revisa y actualiza durante todo el proyecto."),
      ]),
    },
  ],
};

export const PIEZAS_TEXTO_C13 = [GP_C13_H01, GP_C13_H02, GP_C13_H03, GP_C13_H04, GP_C13_H05, GP_C13_H06, GP_C13_H07, GP_C13_H08, GP_C13_H09, GP_C13_H10, GP_C13_H11];
