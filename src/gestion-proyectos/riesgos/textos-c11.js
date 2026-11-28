/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 11 «GESTIÓN DE LOS RIESGOS» — LOS TEXTOS DE LAS
 * 12 HACER (lote 6)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c11-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos de cálculo (H05, H07, H08, H11 y H12) viven en AMPLIACION_C11: la
 * prueba gp-lote6 recalcula cada clave desde ellos.
 *
 * Módulos y subtemas (gp11-* del diseño → procesos de ../estructura.js):
 *   gp11-plan, gp11-adaptacion → gp-11-1 · gp11-rbs, gp11-identificar,
 *   gp11-registro, gp11-conceptos → gp-11-2 · gp11-cualitativo,
 *   gp11-parametros → gp-11-3 · gp11-vme, gp11-simulacion, gp11-tendencias →
 *   gp-11-4 · gp11-amenazas, gp11-oportunidades, gp11-respuesta → gp-11-5 ·
 *   gp11-implementar → gp-11-6 · gp11-monitorear → gp-11-7.
 *   H01–H11 van en Planificación (11.1–11.5; H08 con su proceso principal,
 *   11.4); H12 en Monitoreo y Control (cuatro de sus cinco semanas son 11.7).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
/* «1000» → «1.000»; «-200» → «−200». */
export const cifra = (v) => {
  const [e, d] = String(v).split(".");
  return `${e.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${d ? `,${d}` : ""}`.replace(/^-/, "−");
};
const num = (v) => ({ id: `n${v}`, nombre: cifra(v) });

/* Los datos de cálculo de la ampliación (diseño H05, H07, H08, H11 y H12). Cifras en millones. */
export const AMPLIACION_C11 = {
  /* H05: escala de Altamira y las ocho tazas. Zonas: criterio de Gen (alta ≥ 0,20 · media 0,06–0,18 · baja ≤ 0,05). */
  zonas: { alta: 0.2, media: 0.06 },
  tazas: [
    { id: "t1", n: 1, lado: "amenaza", p: 0.5, i: 0.2, pi: 0.1 },
    { id: "t2", n: 2, lado: "amenaza", p: 0.7, i: 0.2, pi: 0.14 },
    { id: "t3", n: 3, lado: "amenaza", p: 0.3, i: 0.8, pi: 0.24 },
    { id: "t4", n: 4, lado: "amenaza", p: 0.9, i: 0.05, pi: 0.05 },
    { id: "t5", n: 5, lado: "amenaza", p: 0.1, i: 0.4, pi: 0.04 },
    { id: "t6", n: 6, lado: "amenaza", p: 0.7, i: 0.4, pi: 0.28 },
    { id: "t7", n: 7, lado: "oportunidad", p: 0.3, i: 0.2, pi: 0.06 },
    { id: "t8", n: 8, lado: "oportunidad", p: 0.5, i: 0.1, pi: 0.05 },
  ],
  /* H07: el árbol de la junta. */
  arbol: {
    nueva: { inversion: 1000, fuerte: 2000, debil: 800 },
    repotenciar: { inversion: 400, fuerte: 1100, debil: 700 },
    pFuerte: 0.6,
    netos: { "nueva-fuerte": 1000, "nueva-debil": -200, "repotenciar-fuerte": 700, "repotenciar-debil": 300 },
    vme: { nueva: 520, repotenciar: 540 },
    riesgos: [{ p: 0.3, impacto: -40 }, { p: 0.1, impacto: -150 }, { p: 0.5, impacto: 20 }],
    sumaRiesgos: -17,
  },
  /* H08: la curva S del costo (probabilidad acumulada) y el tornado. */
  curva: [[2900, 10], [3000, 25], [3100, 45], [3150, 50], [3200, 65], [3300, 80], [3400, 92], [3500, 99]],
  meta: 3000,
  tornado: [
    { id: "tambor", texto: "Llegada del tambor importado", r: 0.55 },
    { id: "cambio", texto: "Tasa de cambio", r: 0.42 },
    { id: "montaje", texto: "Montaje eléctrico", r: 0.25 },
    { id: "descuento", texto: "Oportunidad: descuento de contado", r: -0.12 },
  ],
  /* H11: costo-beneficio de la respuesta. «Cambio» = VME antes − VME después: criterio de Gen. */
  barco: { p: 0.4, impacto: -200, vme: -80 },
  opciones: [
    { id: "a", nombre: "Agente de aduanas", costo: 10, p: 0.2, impacto: -200, vme: -40, cambio: 40, rent: 4 },
    { id: "b", nombre: "Traer el tambor por avión", costo: 60, p: 0.05, impacto: -200, vme: -10, cambio: 70, rent: 1.2 },
    { id: "c", nombre: "Tostadora temporal reservada", costo: 30, p: 0.4, impacto: -50, vme: -20, cambio: 60, rent: 2 },
  ],
  /* H12: la reserva para contingencias. «Riesgo que queda» = suma de VME abiertos: criterio de Gen. */
  reserva: { inicial: 300, usada: 180, abiertas: -150, queda: 120 },
};

/* ─── H01 · El fichero del plan (2 etapas) ─── */
const SECCIONES = [
  { id: "metodologia", nombre: "Metodología" },
  { id: "roles", nombre: "Roles y responsabilidades" },
  { id: "financiamiento", nombre: "Financiamiento" },
  { id: "calendario", nombre: "Calendario" },
  { id: "categorias", nombre: "Categorías de riesgo" },
  { id: "apetito", nombre: "Apetito al riesgo (umbral)" },
  { id: "definiciones", nombre: "Definiciones de probabilidad e impacto" },
  { id: "matriz", nombre: "Matriz de probabilidad e impacto" },
  { id: "formatos", nombre: "Formatos de los informes" },
  { id: "seguimiento", nombre: "Seguimiento" },
  { id: "estrategia", nombre: "Estrategia de riesgos" },
];
export const GP_C11_H01 = {
  id: "gp26-pla-c11-h01-fichero",
  contexto: "Altamira aprobó ampliar su planta tostadora de Manizales con una tostadora importada. Antes de identificar riesgos, hay que decidir cómo se gestionarán.",
  rol: "Diriges la ampliación y redactas el plan de gestión de los riesgos.",
  consigna: "Archiva cada tarjeta en la sección del plan que le toca.",
  cierre: "El plan dice cómo se gestionarán los riesgos; aún no los identifica.",
  subtemas: ["gp-11-1"],
  elenco: ["tu", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Archiva cada tarjeta en la sección del plan que le toca.",
      destinos: SECCIONES,
      /* Solo las pestañas de las 6 tarjetas sorteadas; siempre la trampa umbral ↔ matriz. */
      destinosDePartida: true,
      partida: { n: 4, siempre: ["c11h01-06", "c11h01-08"] },
      banco: con("gp-11-1", [
        it("c11h01-01", "«Usaremos una matriz de 5 × 5 y simulación de Monte Carlo.»", "metodologia", "Dice con qué enfoques y herramientas se trabaja: metodología."),
        it("c11h01-02", "«La PMO lidera; cada riesgo tendrá un dueño.»", "roles", "Define quién lidera y quién responde: roles y responsabilidades."),
        it("c11h01-03", "«$15 millones para talleres y reglas para usar la reserva.»", "financiamiento", "Fondos para gestionar riesgos y protocolos de reserva: financiamiento."),
        it("c11h01-04", "«Revisión de riesgos cada dos semanas y taller en cada fase.»", "calendario", "Dice cuándo y cada cuánto: calendario."),
        it("c11h01-05", "«Agruparemos los riesgos en técnicos, de gestión, comerciales y externos.»", "categorias", "Es la forma de agrupar riesgos: categorías, aquí como RBS."),
        it("c11h01-06", "«La patrocinadora no acepta más de un mes de retraso.»", "apetito", "Es el apetito de la patrocinadora expresado como umbral medible."),
        it("c11h01-07", "«Probabilidad \"alta\" significa entre 51 y 70 %.»", "definiciones", "Fija qué significa cada nivel: definiciones de probabilidad e impacto."),
        it("c11h01-08", "«Un puntaje de 0,20 o más es prioridad alta.»", "matriz", "Es una regla de priorización: va con la matriz."),
        it("c11h01-09", "«El registro tendrá columnas de causa, riesgo, efecto y dueño.»", "formatos", "Describe el contenido del registro: formatos de los informes."),
        it("c11h01-10", "«Así se auditará el proceso de riesgos cada trimestre.»", "seguimiento", "Cómo se registra y audita el proceso: seguimiento."),
        it("c11h01-11", "«Enfoque general: proteger el arranque antes de la cosecha.»", "estrategia", "Es el enfoque general del proyecto: estrategia de riesgos."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Decide cómo se adapta el plan a este proyecto.",
      pasos: [
        { id: "c11h01-m1", subtemas: ["gp-11-1"], mesa: "pmo",
          contexto: "Un miembro del equipo propone hacer el plan de riesgos cuando la obra ya vaya por la mitad.",
          consigna: "¿Cuándo debe empezar este proceso?",
          destinos: [{ id: "inicio", nombre: "Apenas se concibe el proyecto" }, { id: "mitad", nombre: "A mitad de la obra" }, { id: "cierre", nombre: "Al cerrar el proyecto" }],
          clave: "inicio", retros: { mitad: "A mitad ya es tarde: se empieza apenas se concibe.", cierre: "Al cierre ya no sirve para gestionar nada." } },
        { id: "c11h01-m2", subtemas: ["gp-11-1"],
          consigna: "La ampliación es grande y con tecnología nueva. ¿Qué enfoque?",
          destinos: [{ id: "detallado", nombre: "Detallado y robusto" }, { id: "simple", nombre: "Simplificado" }],
          clave: "detallado", retros: { simple: "Tamaño y complejidad altos piden un enfoque más detallado." } },
        { id: "c11h01-m3", subtemas: ["gp-11-1"],
          consigna: "¿Cuántos niveles para las escalas de este proyecto?",
          destinos: [{ id: "cinco", nombre: "Cinco" }, { id: "tres", nombre: "Tres" }],
          clave: "cinco", retros: { tres: "Tres niveles son para procesos sencillos; aquí conviene cinco." } },
        { id: "c11h01-m4", subtemas: ["gp-11-1"],
          contexto: "El software de control de la tostadora se hará en iteraciones ágiles.",
          consigna: "¿Cuándo se abordan sus riesgos?",
          destinos: [{ id: "iteracion", nombre: "Al comienzo de cada iteración y durante ella" }, { id: "una", nombre: "Una sola vez, al inicio del proyecto" }],
          clave: "iteracion", retros: { una: "En ágil el riesgo se revisa en cada iteración." } },
      ],
    },
  ],
};

/* ─── H02 · El móvil de las fuentes (2 etapas) ─── */
export const BRAZOS_C11 = [
  { id: "tecnico", nombre: "Técnico" },
  { id: "gestion", nombre: "De gestión" },
  { id: "comercial", nombre: "Comercial" },
  { id: "externo", nombre: "Externo" },
];
const nivel2 = (id, texto, brazo, ramas, clave, retro) => ({
  id, texto, contexto: `Brazo ${brazo}: bajan tres brazos menores.`, clave, retro,
  destinos: ramas.map((n) => ({ id: n.toLowerCase().replace(/[^a-záéíóúñ]+/g, "-"), nombre: n })),
});
export const GP_C11_H02 = {
  id: "gp26-pla-c11-h02-movil",
  contexto: "En el taller de riesgos salieron muchas ideas sueltas. La PMO quiere ordenarlas por su fuente.",
  rol: "Diriges la ampliación y organizas la estructura de desglose de los riesgos.",
  consigna: "Cuelga cada riesgo en el brazo de su fuente.",
  cierre: null,
  subtemas: ["gp-11-2"],
  elenco: ["tu", "equipo", "pmo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Cuelga cada riesgo en el brazo de su fuente.",
      destinos: BRAZOS_C11,
      /* 8: dos por brazo; siempre el proveedor europeo (la trampa comercial/externo). */
      partida: { porClave: 2, siempre: ["c11h02-07"] },
      banco: con("gp-11-2", [
        it("c11h02-01", "«Los requisitos de tueste aún no están definidos.»", "tecnico", "Definir requisitos es una fuente técnica del proyecto."),
        it("c11h02-02", "«Altamira nunca ha operado esta tecnología de tambor.»", "tecnico", "La tecnología misma es fuente técnica."),
        it("c11h02-03", "«El control de la tostadora podría no conectarse con la empacadora.»", "tecnico", "Es una interfaz técnica entre dos equipos."),
        it("c11h02-04", "«No hay suficientes técnicos asignados al montaje.»", "gestion", "La dotación de recursos es fuente de gestión."),
        it("c11h02-05", "«Los informes entre obra y oficina llegan tarde.»", "gestion", "La comunicación del proyecto es fuente de gestión."),
        it("c11h02-06", "«El portafolio podría quitarle prioridad a la ampliación.»", "gestion", "La dirección del portafolio es fuente de gestión."),
        it("c11h02-07", "«El proveedor europeo podría tener problemas financieros.»", "comercial", "Proveedores y vendedores son fuente comercial, no externa."),
        it("c11h02-08", "«Las multas del contrato de montaje son ambiguas.»", "comercial", "Términos contractuales: fuente comercial."),
        it("c11h02-09", "«El cliente principal podría cancelar su pedido grande.»", "comercial", "La estabilidad de los clientes es fuente comercial."),
        it("c11h02-10", "«El euro podría subir antes de pagar la máquina.»", "externo", "Las tasas de cambio son fuente externa."),
        it("c11h02-11", "«Una norma nueva de emisiones podría exigir otro filtro.»", "externo", "Lo normativo viene de fuera: fuente externa."),
        it("c11h02-12", "«Otra tostadora podría abrir planta en Chinchiná.»", "externo", "La competencia es fuente externa."),
        it("c11h02-13", "«El lote de la ampliación tiene suelo blando.»", "externo", "Sitios e instalaciones están en el brazo externo."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Pon cada ficha en su brazo de nivel 2.",
      pasos: [
        { consigna: "Pon cada ficha en su brazo de nivel 2.", barajar: true, items: con("gp-11-2", [
          nivel2("c11h02-21", "«El euro podría subir antes de pagar la máquina.»", "externo", ["Legislación", "Tasas de cambio", "Competencia"], "tasas-de-cambio", "Es variación de la moneda: tasas de cambio."),
          nivel2("c11h02-22", "«El proveedor europeo podría tener problemas financieros.»", "comercial", ["Términos contractuales", "Proveedores y vendedores", "Subcontratos"], "proveedores-y-vendedores", "Es quien vende la máquina: proveedores y vendedores."),
          nivel2("c11h02-23", "«No hay suficientes técnicos asignados al montaje.»", "de gestión", ["Organización", "Dotación de recursos", "Comunicación"], "dotación-de-recursos", "Falta gente asignada: dotación de recursos."),
          nivel2("c11h02-24", "«Los requisitos de tueste aún no están definidos.»", "técnico", ["Definición del alcance", "Definición de los requisitos", "Tecnología"], "definición-de-los-requisitos", "El problema son los requisitos, no el alcance ni la tecnología."),
        ]) },
        { id: "c11h02-25", subtemas: ["gp-11-2"], mesa: "pmo",
          consigna: "¿Para qué sirve el nivel más bajo del móvil?",
          destinos: [{ id: "ideas", nombre: "Como lista de ideas rápidas" }, { id: "vme", nombre: "Para calcular el VME" }, { id: "duenos", nombre: "Para asignar dueños" }],
          clave: "ideas", retros: { vme: "El VME sale del análisis cuantitativo, no de la RBS.", duenos: "Los dueños se asignan en el análisis cualitativo." } },
      ],
    },
  ],
};

/* ─── H03 · El cable aéreo del riesgo (3 rondas, una etapa) ─── */
export const CABINAS_C11 = [
  { id: "causa", nombre: "Causa", pista: "hoy es cierto" },
  { id: "riesgo", nombre: "Riesgo", pista: "podría pasar" },
  { id: "efecto", nombre: "Efecto", pista: "sobre un objetivo" },
  { id: "nova", nombre: "No va en el enunciado", pista: "bandeja" },
];
const BANDERA = [{ id: "amenaza", nombre: "Amenaza", pista: "↓" }, { id: "oportunidad", nombre: "Oportunidad", pista: "↑" }];
const ronda = (r, items, clave) => [
  { consigna: "Sube cada pieza a su cabina: causa, riesgo, efecto.", destinos: CABINAS_C11, barajar: true,
    items: items.map(([n, texto, k, retro]) => ({ ...it(`c11h03-${r}${n}`, texto, k, retro), ronda: r, subtemas: ["gp-11-2"] })) },
  { id: `c11h03-${r}f`, ronda: r, bandera: true, subtemas: ["gp-11-2"], consigna: "¿Amenaza u oportunidad?", destinos: BANDERA, clave,
    retros: clave === "amenaza" ? { oportunidad: "Su efecto daña un objetivo: es amenaza." } : { amenaza: "Su efecto ayuda a un objetivo: es oportunidad." } },
];
export const GP_C11_H03 = {
  id: "gp26-pla-c11-h03-cable",
  contexto: "El practicante anotó los riesgos en frases revueltas: mezcló causas, riesgos, efectos y hasta respuestas.",
  rol: "Diriges la ampliación y escribes los enunciados del registro de riesgos.",
  consigna: "Sube cada pieza a su cabina: causa, riesgo, efecto.",
  cierre: "Un buen enunciado separa el riesgo de su causa y su efecto.",
  subtemas: ["gp-11-2"],
  elenco: ["tu", "practicante"],
  etapas: [{
    tipo: "micros",
    consigna: "Sube cada pieza a su cabina: causa, riesgo, efecto.",
    /* La definición de cada cabina y la redacción: criterio de Gen (la guía pide separar riesgo, causa y efecto, p. 417). */
    pasos: [
      ...ronda(1, [
        ["1", "«La tostadora se fabrica en Europa y viaja por barco.»", "causa", "Es un hecho cierto hoy: es la causa."],
        ["2", "«El barco podría demorarse en el puerto.»", "riesgo", "Es lo incierto que podría pasar: es el riesgo."],
        ["3", "«La planta arrancaría después de la cosecha.»", "efecto", "Es lo que le pasaría al cronograma: efecto."],
        ["4", "«La tostadora llegó tarde la semana pasada.»", "nova", "Ya ocurrió: es un incidente, no un riesgo."],
        ["5", "«Contratar un agente de aduanas.»", "nova", "Es una respuesta; se decide después, al planificar la respuesta."],
      ], "amenaza"),
      ...ronda(2, [
        ["1", "«El contrato de la máquina se paga en euros.»", "causa", "Es una condición cierta del contrato: causa."],
        ["2", "«El euro podría subir antes del pago.»", "riesgo", "Puede pasar o no: ese es el riesgo."],
        ["3", "«El costo superaría el presupuesto aprobado.»", "efecto", "Es el impacto sobre el objetivo de costo."],
        ["4", "«El euro es un problema.»", "nova", "Es vago: no dice causa, evento ni efecto."],
        ["5", "«Comprar euros por adelantado.»", "nova", "Es una respuesta posible, no parte del enunciado."],
      ], "amenaza"),
      ...ronda(3, [
        ["1", "«El proveedor ofrece un técnico extra sin costo.»", "causa", "Es un hecho ya ofrecido: causa."],
        ["2", "«El montaje podría terminar dos semanas antes.»", "riesgo", "Es incierto y positivo: un riesgo que es oportunidad."],
        ["3", "«Se tostaría más café de la cosecha en la planta nueva.»", "efecto", "Es el beneficio sobre un objetivo: efecto."],
        ["4", "«Los técnicos europeos son buenos.»", "nova", "Es una opinión: no describe un evento incierto."],
        ["5", "«Seguro terminaremos antes.»", "nova", "Si fuera seguro, no sería incierto: no es riesgo."],
      ], "oportunidad"),
    ],
  }],
};

/* ─── H04 · El muro del taller (2 etapas) ─── */
const TECNICAS = [
  { id: "tormenta", nombre: "Tormenta de ideas" },
  { id: "lista", nombre: "Lista de verificación" },
  { id: "causa-raiz", nombre: "Análisis de causa raíz" },
  { id: "supuestos", nombre: "Análisis de supuestos y restricciones" },
  { id: "foda", nombre: "FODA" },
  { id: "documentos", nombre: "Análisis de documentos" },
  { id: "entrevistas", nombre: "Entrevistas" },
  { id: "ideas-rapidas", nombre: "Lista de ideas rápidas" },
];
export const GP_C11_H04 = {
  id: "gp26-pla-c11-h04-muro",
  contexto: "Taller de riesgos de la ampliación. El equipo llenó el muro de notas adhesivas, pero no todas son riesgos.",
  rol: "Facilitas el taller como director(a) de la ampliación.",
  consigna: "Mueve cada nota: amenaza, oportunidad o no es riesgo.",
  cierre: null,
  subtemas: ["gp-11-2"],
  elenco: ["tu", "equipo", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Mueve cada nota: amenaza, oportunidad o no es riesgo.",
      destinos: [{ id: "amenaza", nombre: "Amenaza", pista: "↓" }, { id: "oportunidad", nombre: "Oportunidad", pista: "↑" }, { id: "nova", nombre: "No es riesgo", pista: "ya es cierto" }],
      /* 7, al menos 2 por columna. Proveedor, cliente y subcontratista: los ejemplos de la guía (p. 398). */
      partida: { n: 7, minPorClave: 2 },
      banco: con("gp-11-2", [
        it("c11h04-01", "«Un proveedor clave podría cerrar su negocio.»", "amenaza", "Incierto y dañino para el proyecto: amenaza."),
        it("c11h04-02", "«El cliente podría cambiar requisitos después del diseño.»", "amenaza", "Podría pasar y causaría retrabajo: amenaza."),
        it("c11h04-03", "«Podría escasear el gas para las pruebas de tueste.»", "amenaza", "Es incierto y frenaría las pruebas: amenaza."),
        it("c11h04-04", "«El subcontratista podría proponer una mejora al proceso.»", "oportunidad", "Si pasa, beneficia al proyecto: oportunidad."),
        it("c11h04-05", "«Un banco podría prestar a una tasa menor.»", "oportunidad", "Bajaría el costo si ocurre: oportunidad."),
        it("c11h04-06", "«La tecnología nueva podría gastar menos gas.»", "oportunidad", "Un efecto incierto y favorable: oportunidad."),
        it("c11h04-07", "«La grúa se averió ayer.»", "nova", "Ya pasó: va al registro de incidentes."),
        it("c11h04-08", "«El contrato firmado fija la entrega en marzo.»", "nova", "Es un hecho cierto, no algo incierto."),
        it("c11h04-09", "«El permiso de construcción ya fue negado.»", "nova", "Ya ocurrió: es un incidente que hay que atender."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Une cada situación con la técnica que la resuelve.",
      destinos: TECNICAS,
      /* 5 de 8 con sus 5 chinches; siempre la lista de 2019. */
      destinosDePartida: true,
      partida: { n: 4, siempre: ["c11h04-11"] },
      banco: con("gp-11-2", [
        it("c11h04-10", "«Quieres una lista amplia rápido, con expertos de otras áreas y un facilitador.»", "tormenta", "Lista completa en grupo con facilitador: tormenta de ideas."),
        it("c11h04-11", "«Tienes la lista de riesgos de la ampliación de 2019.»", "lista", "Riesgos de proyectos anteriores en una lista: lista de verificación."),
        it("c11h04-12", "«Partes de \"la planta podría retrasarse\" y buscas qué lo causaría.»", "causa-raiz", "Del problema hacia sus causas: análisis de causa raíz."),
        it("c11h04-13", "«El plan supone que la energía llega en mayo; lo pones a prueba.»", "supuestos", "Pones a prueba un supuesto del plan."),
        it("c11h04-14", "«Buscas riesgos en las fortalezas y debilidades de Altamira.»", "foda", "Fortalezas, debilidades, oportunidades y amenazas: FODA."),
        it("c11h04-15", "«El contrato dice 120 kg por carga y el plano dice 100.»", "documentos", "Una inconsistencia entre documentos indica riesgo: análisis de documentos."),
        it("c11h04-16", "«Un experto solo hablará contigo, en confianza.»", "entrevistas", "Conversación confidencial uno a uno: entrevista."),
        it("c11h04-17", "«Usas PESTLE para buscar fuentes de riesgo general.»", "ideas-rapidas", "PESTLE es un marco predeterminado: lista de ideas rápidas."),
      ]),
      despues: { id: "c11h04-18", subtemas: ["gp-11-2"], mesa: "practicante",
        contexto: "El practicante propone usar solo la lista de 2019 y no hacer taller.",
        consigna: "¿Basta con la lista de verificación?",
        destinos: SI_NO, clave: "no", retros: { si: "Ninguna lista es exhaustiva: hay que buscar fuera de ella." } },
    },
  ],
};

/* ─── H05 · La bandeja de cata (2 etapas) ─── */
const A = AMPLIACION_C11;
const P5 = [0.1, 0.3, 0.5, 0.7, 0.9].map((v) => ({ id: `p${Math.round(v * 100)}`, nombre: cifra(v.toFixed(2)) }));
const I5 = [0.05, 0.1, 0.2, 0.4, 0.8].map((v) => ({ id: `i${Math.round(v * 100)}`, nombre: cifra(v.toFixed(2)) }));
const TAZA_TXT = {
  t1: ["«El tambor podría llegar 2 meses tarde. Probabilidad: 40 %.»", "40 % cae entre 31 y 50 %: mediana, 0,50.", "Dos meses está entre 1 y 3: impacto 0,20.", "El tambor tarde"],
  t2: ["«El euro podría encarecer la máquina $300 millones. Probabilidad: 60 %.»", "60 % está entre 51 y 70 %: alta, 0,70.", "$300 millones cae entre 201 y 400: 0,20.", "El euro"],
  t3: ["«La alcaldía podría demorar el permiso 7 meses. Probabilidad: 15 %.»", "15 % es baja: 0,30.", "Más de 6 meses es impacto muy alto: 0,80.", "El permiso"],
  t4: ["«Un técnico podría faltar una semana. Probabilidad: 80 %.»", "Más de 70 % es muy alta: 0,90.", "Una semana es impacto muy bajo: 0,05.", "El técnico"],
  t5: ["«El transformador podría quemarse: $1.500 millones. Probabilidad: 5 %.»", "5 % es muy baja: 0,10.", "$1.500 millones cae entre 401 y 2.000: 0,40.", "El transformador"],
  t6: ["«La obra civil podría atrasarse 4 meses. Probabilidad: 55 %.»", "55 % es alta: 0,70.", "Cuatro meses está entre 3 y 6: 0,40.", "La obra civil"],
  t7: ["«El proveedor podría entregar 6 semanas antes. Probabilidad: 25 %.»", "25 % es baja: 0,30.", "Seis semanas está entre 1 y 3 meses: 0,20.", "La entrega antes"],
  t8: ["«El acero podría bajar y ahorrar $150 millones. Probabilidad: 35 %.»", "35 % es mediana: 0,50.", "$150 millones cae entre 40 y 200: 0,10.", "El acero"],
};
export const zonaDe = (pi) => (pi >= A.zonas.alta - 1e-9 ? "alta" : pi >= A.zonas.media - 1e-9 ? "media" : "baja");
const RETRO_ZONA = { alta: "0,20 o más es prioridad alta en el plan de Altamira.", media: "Entre 0,06 y 0,18 es prioridad media.", baja: "0,05 o menos es prioridad baja." };
const tazaCasillas = (t) => {
  const [texto, rp, ri] = TAZA_TXT[t.id];
  return {
    tipo: "casillas", id: `c11h05-${t.n}`, texto, taza: t.id, subtemas: ["gp-11-3"],
    casillas: [
      { id: "lado", nombre: "Cara de la bandeja", columnas: 2, opciones: [{ id: "amenaza", nombre: "Amenazas" }, { id: "oportunidad", nombre: "Oportunidades" }], clave: t.lado,
        retro: t.lado === "amenaza" ? "Un retraso o sobrecosto es impacto negativo: amenazas." : "Un ahorro es impacto positivo: va en oportunidades." },
      { id: "p", nombre: "Probabilidad (fila)", columnas: 5, opciones: P5, clave: `p${Math.round(t.p * 100)}`, retro: rp },
      { id: "i", nombre: "Impacto (columna)", columnas: 5, opciones: I5, clave: `i${Math.round(t.i * 100)}`, retro: ri },
    ],
  };
};
const ordenTazas = [...A.tazas].sort((x, y) => y.pi - x.pi);
export const GP_C11_H05 = {
  id: "gp26-pla-c11-h05-cata",
  contexto: "El registro de la ampliación tiene ocho riesgos. Con las escalas del plan, toca ver cuáles atender primero.",
  rol: "Diriges la ampliación y priorizas los riesgos con la patrocinadora.",
  consigna: "Pon cada taza en la casilla de su probabilidad e impacto.",
  cierre: "La prioridad la da probabilidad por impacto, no la probabilidad sola.",
  subtemas: ["gp-11-3"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada taza en la casilla de su probabilidad e impacto.",
      /* 6 de 8; siempre la 3 y la 4 (la trampa) y una oportunidad. */
      partida: { n: 4, siempre: ["c11h05-3", "c11h05-4"], alMenosUno: ["c11h05-7", "c11h05-8"] },
      banco: A.tazas.map(tazaCasillas),
    },
    {
      tipo: "micros",
      consigna: "Ordena de mayor a menor puntuación y marca su zona.",
      pasos: [
        { tipo: "ordenar", id: "c11h05-orden", subtemas: ["gp-11-3"], porValor: true,
          consigna: "Ordena de mayor a menor puntuación y marca su zona.",
          items: ordenTazas.map((t) => ({ id: t.id, valor: t.pi, corto: TAZA_TXT[t.id][3], texto: `Taza ${t.n} · ${TAZA_TXT[t.id][3]}: ${cifra(t.p.toFixed(2))} × ${cifra(t.i.toFixed(2))}` })),
          retroOrden: "{A} vale {pA}; {B} vale {pB}: primero el mayor.",
          retrosOrden: { "t3-t4": "15 % con 7 meses pesa más que 80 % con una semana." } },
        { tipo: "casillas", id: "c11h05-zonas", subtemas: ["gp-11-3"],
          consigna: "Pon la ficha de zona bajo cada taza.",
          casillas: ordenTazas.map((t) => ({ id: t.id, nombre: `Taza ${t.n} · ${TAZA_TXT[t.id][3]}`, columnas: 3,
            opciones: [{ id: "alta", nombre: "Alta ●●●" }, { id: "media", nombre: "Media ●●" }, { id: "baja", nombre: "Baja ●" }],
            clave: zonaDe(t.pi), retro: RETRO_ZONA[zonaDe(t.pi)] })) },
        { id: "c11h05-m1", subtemas: ["gp-11-3"], mesa: "patrocinadora",
          consigna: "¿Qué haces con los de prioridad baja?",
          destinos: [{ id: "observacion", nombre: "Lista de observación para monitorearlos" }, { id: "borrar", nombre: "Borrarlos del registro" }, { id: "escalar", nombre: "Escalarlos a la junta" }],
          clave: "observacion", retros: { borrar: "No se borran: quedan en observación.", escalar: "Escalar es para lo que excede tu autoridad." } },
      ],
    },
  ],
};

/* ─── H06 · Las burbujas del tanque (2 etapas) ─── */
const PARAMETROS = [
  { id: "urgencia", nombre: "Urgencia" },
  { id: "proximidad", nombre: "Proximidad" },
  { id: "inactividad", nombre: "Inactividad" },
  { id: "manejabilidad", nombre: "Manejabilidad" },
  { id: "controlabilidad", nombre: "Controlabilidad" },
  { id: "detectabilidad", nombre: "Detectabilidad" },
  { id: "conectividad", nombre: "Conectividad" },
  { id: "estrategico", nombre: "Impacto estratégico" },
  { id: "propincuidad", nombre: "Propincuidad" },
];
const NIVEL3 = [{ id: "baja", nombre: "Baja" }, { id: "media", nombre: "Media" }, { id: "alta", nombre: "Alta" }];
const TAMANO = [{ id: "pequena", nombre: "Pequeña" }, { id: "mediana", nombre: "Mediana" }, { id: "grande", nombre: "Grande" }];
export const BURBUJAS_C11 = [
  { id: "a", texto: "A «Grieta en la base: tardaría meses en notarse e impactaría al final.»", det: "baja", prox: "baja", tam: "grande",
    retros: ["Tardaría meses en notarse: detectabilidad baja.", "Impactaría tarde, al final de la obra: proximidad baja.", "Una falla de la base es impacto grande."] },
  { id: "b", texto: "B «Quemador: un sensor avisa; pruebas en dos semanas; impacto mediano.»", det: "alta", prox: "alta", tam: "mediana",
    retros: ["El sensor avisa enseguida: detectabilidad alta.", "Las pruebas son en dos semanas: proximidad alta.", "La tarjeta dice impacto mediano."] },
  { id: "c", texto: "C «Permiso: la alcaldía responde en dos semanas; retraso de 7 meses.»", det: "alta", prox: "alta", tam: "grande",
    retros: ["La respuesta de la alcaldía lo mostrará claramente: detectabilidad alta.", "Se decide en dos semanas: proximidad alta.", "Siete meses de retraso: burbuja grande."] },
];
export const GP_C11_H06 = {
  id: "gp26-pla-c11-h06-burbujas",
  contexto: "Dos riesgos de la ampliación empatan en la matriz. La patrocinadora pregunta cuál atender primero.",
  rol: "Diriges la ampliación y miras más que probabilidad e impacto.",
  consigna: "Une cada pista con el parámetro que describe.",
  cierre: "Urgencia: plazo para responder. Proximidad: plazo para que el riesgo impacte.",
  subtemas: ["gp-11-3"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Une cada pista con el parámetro que describe.",
      destinos: PARAMETROS,
      /* 6 de 9, con sus 6 burbujas; siempre urgencia y proximidad (la trampa). */
      destinosDePartida: true,
      partida: { n: 4, siempre: ["c11h06-01", "c11h06-02"] },
      banco: con("gp-11-3", [
        it("c11h06-01", "«Hay que contratar el seguro antes del viernes o ya no servirá.»", "urgencia", "Habla del plazo para que la respuesta sirva: urgencia."),
        it("c11h06-02", "«El permiso podría afectar la obra en solo dos semanas.»", "proximidad", "Es cuánto falta para que impacte: proximidad."),
        it("c11h06-03", "«Una grieta en la base tardaría meses en notarse.»", "inactividad", "Tiempo entre que ocurre y se nota: inactividad."),
        it("c11h06-04", "«El dueño del riesgo puede manejarlo con facilidad.»", "manejabilidad", "Facilidad para gestionar ocurrencia o impacto: manejabilidad."),
        it("c11h06-05", "«El resultado depende del puerto; Altamira casi no lo controla.»", "controlabilidad", "Cuánto controla el dueño el resultado: controlabilidad."),
        it("c11h06-06", "«Un sensor avisaría apenas el quemador empiece a fallar.»", "detectabilidad", "Qué tan fácil se nota que ocurre: detectabilidad."),
        it("c11h06-07", "«El retraso del tambor arrastraría otros cinco riesgos.»", "conectividad", "Relación con otros riesgos: conectividad."),
        it("c11h06-08", "«Si falla, Altamira no podría exportar, su meta del año.»", "estrategico", "Afecta metas de la organización: impacto estratégico."),
        it("c11h06-09", "«A la junta este riesgo le preocupa muchísimo.»", "propincuidad", "Cuánto le importa a los interesados: propincuidad."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Ubica cada burbuja según detectabilidad, proximidad e impacto.",
      pasos: [
        ...BURBUJAS_C11.map((b) => ({
          tipo: "casillas", id: `c11h06-b${b.id}`, burbuja: b.id, texto: b.texto, subtemas: ["gp-11-3"],
          casillas: [
            { id: "det", nombre: "Detectabilidad (eje x)", opciones: NIVEL3, clave: b.det, retro: b.retros[0] },
            { id: "prox", nombre: "Proximidad (eje y)", opciones: NIVEL3, clave: b.prox, retro: b.retros[1] },
            { id: "tam", nombre: "Tamaño = impacto", opciones: TAMANO, clave: b.tam, retro: b.retros[2] },
          ],
        })),
        { id: "c11h06-m1", subtemas: ["gp-11-3"], mesa: "patrocinadora",
          consigna: "¿Por qué aquí no basta la matriz de probabilidad e impacto?",
          destinos: [{ id: "mas", nombre: "Hay más de dos parámetros" }, { id: "oport", nombre: "La matriz solo sirve para oportunidades" }, { id: "cuanti", nombre: "La matriz es cuantitativa" }],
          clave: "mas", retros: { oport: "La matriz sirve para amenazas y oportunidades.", cuanti: "La matriz es cualitativa: prioriza, no calcula efecto total." } },
      ],
    },
  ],
};

/* ─── H07 · Los caminos de la montaña (3 etapas) ─── */
const AR = A.arbol;
const mirador = (id, ramo, demanda, texto, clave, d1, r1, d2, r2) => ({
  id, ramo, demanda, contexto: texto, subtemas: ["gp-11-4"], barajar: true,
  destinos: [num(clave), num(d1), num(d2)], clave: `n${clave}`, retros: { [`n${d1}`]: r1, [`n${d2}`]: r2 },
});
export const GP_C11_H07 = {
  id: "gp26-pla-c11-h07-montana",
  contexto: "La junta duda: ¿comprar una tostadora nueva o repotenciar la actual? La demanda futura es incierta.",
  rol: "Diriges la ampliación y presentas el árbol de decisiones a la junta.",
  consigna: "Calcula el valor neto de cada mirador.",
  cierre: "Se elige la rama de mayor VME, sin olvidar restar la inversión.",
  subtemas: ["gp-11-4"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula el valor neto de cada mirador.",
      pasos: [
        mirador("c11h07-01", "nueva", "fuerte", "Mirador «Nueva · demanda fuerte»: invertir $1.000; ingresos $2.000.", 1000, 2000, "Falta restar la inversión de $1.000.", 3000, "La inversión se resta, no se suma."),
        mirador("c11h07-02", "nueva", "debil", "Mirador «Nueva · demanda débil»: invertir $1.000; ingresos $800.", -200, 800, "Resta la inversión: queda una pérdida.", 200, "Ingresos menores que la inversión dan resultado negativo."),
        mirador("c11h07-03", "repotenciar", "fuerte", "Mirador «Repotenciar · demanda fuerte»: invertir $400; ingresos $1.100.", 700, 1100, "Falta restar los $400 de repotenciar.", 1500, "La inversión se resta, no se suma."),
        mirador("c11h07-04", "repotenciar", "debil", "Mirador «Repotenciar · demanda débil»: invertir $400; ingresos $700.", 300, 700, "Falta restar la inversión de $400.", -300, "700 menos 400 da 300 positivo."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Calcula el VME de cada camino.",
      pasos: [
        { id: "c11h07-05", nodo: "nueva", subtemas: ["gp-11-4"], barajar: true,
          contexto: "Piedra «Nueva»: 0,60 × 1.000 + 0,40 × (−200) = ?",
          destinos: [num(520), num(680), num(800)], clave: "n520",
          retros: { n680: "0,40 × (−200) resta 80; no suma.", n800: "Multiplica cada valor por su probabilidad antes de sumar." } },
        { id: "c11h07-06", nodo: "repotenciar", subtemas: ["gp-11-4"], barajar: true,
          contexto: "Piedra «Repotenciar»: 0,60 × 700 + 0,40 × 300 = ?",
          destinos: [num(540), num(1000), num(500)], clave: "n540",
          retros: { n1000: "Multiplica por la probabilidad: 0,60 × 700 = 420.", n500: "0,40 × 300 = 120; 420 + 120 = 540." } },
        { id: "c11h07-07", subtemas: ["gp-11-4"], mesa: "patrocinadora",
          consigna: "¿Qué camino eliges?",
          destinos: [{ id: "repotenciar", nombre: "Repotenciar" }, { id: "nueva", nombre: "Tostadora nueva" }],
          clave: "repotenciar", retros: { nueva: "Su VME es 520, menor que 540; además arriesga perder 200." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Mueve la probabilidad de demanda fuerte y mira el VME.",
      pasos: [
        { tipo: "explorar", id: "c11h07-sim", subtemas: ["gp-11-4"],
          consigna: "Mueve la probabilidad de demanda fuerte y mira el VME.",
          texto: "Débil = 1 − fuerte. El camino de mayor VME se ilumina.",
          minimo: 3,
          controles: [{ id: "p", nombre: "Demanda fuerte", min: 0, max: 100, salto: 2.5, inicial: 60, unidad: "%" }] },
        { id: "c11h07-08", subtemas: ["gp-11-4"],
          consigna: "Con 80 % de demanda fuerte, ¿qué conviene?",
          destinos: [{ id: "nueva", nombre: "Tostadora nueva" }, { id: "repotenciar", nombre: "Repotenciar" }],
          clave: "nueva", retros: { repotenciar: "Con 80 %: nueva 760, repotenciar 620." } },
        { id: "c11h07-09", subtemas: ["gp-11-4"],
          consigna: "¿Desde qué probabilidad conviene la nueva?",
          destinos: [{ id: "p625", nombre: "Más de 62,5 %" }, { id: "p50", nombre: "Más de 50 %" }, { id: "nunca", nombre: "Nunca" }],
          clave: "p625", retros: { p50: "Con 50 %: nueva 400, repotenciar 500; aún no.", nunca: "Sobre 62,5 % la nueva gana: mueve el deslizador." } },
        { id: "c11h07-10", subtemas: ["gp-11-4"], barajar: true,
          contexto: "El registro trae tres riesgos de la repotenciación.",
          texto: "«Repuestos tardan» P 30 %, −$40 · «Falla del motor viejo» P 10 %, −$150 · Oportunidad «Descuento de contado» P 50 %, +$20.",
          consigna: "Suma el VME de estos tres riesgos.",
          destinos: [num(-17), num(-37), num(-210)], clave: "n-17",
          retros: { "n-37": "La oportunidad suma: −12 − 15 + 10 = −17.", "n-210": "Multiplica cada impacto por su probabilidad." } },
      ],
    },
  ],
};

/* ─── H08 · El tablero de los mil granos (2 etapas) ─── */
export const GP_C11_H08 = {
  id: "gp26-pla-c11-h08-galton",
  contexto: "La PMO corrió una simulación de Monte Carlo del costo de la ampliación: 5.000 iteraciones con valores al azar.",
  rol: "Diriges la ampliación y explicas el resultado a la patrocinadora.",
  consigna: "¿Dónde caerán más granos?",
  cierre: "Solo el análisis cuantitativo mide bien el riesgo general del proyecto.",
  subtemas: ["gp-11-4", "gp-11-5"],
  elenco: ["tu", "pmo", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Predice, mira caer los granos y lee la curva.",
      pasos: [
        /* Predecir y revelar: sin puntaje. */
        { id: "c11h08-apuesta", apuesta: true, subtemas: ["gp-11-4"], mesa: "pmo",
          contexto: "La estimación base es $3.000 y casi todos los riesgos son amenazas.",
          consigna: "¿Dónde caerán más granos?",
          destinos: [{ id: "debajo", nombre: "Por debajo de 3.000" }, { id: "entre", nombre: "Entre 3.000 y 3.300" }, { id: "encima", nombre: "Por encima de 3.400" }],
          clave: "entre", retros: { debajo: "Con más amenazas que oportunidades, el costo tiende a subir.", encima: "Pocas corridas juntan todas las amenazas a la vez." } },
        { id: "c11h08-01", subtemas: ["gp-11-4"], curva: true,
          consigna: "¿Qué probabilidad hay de cumplir el presupuesto de $3.000?",
          destinos: [{ id: "p25", nombre: "25 %" }, { id: "p50", nombre: "50 %" }, { id: "p75", nombre: "75 %" }],
          clave: "p25", retro: "La curva acumula: en $3.000 marca 25 %." },
        { id: "c11h08-02", subtemas: ["gp-11-4"], curva: true,
          consigna: "¿Cuánto costaría con 80 % de confianza?",
          destinos: [{ id: "c3300", nombre: "$3.300" }, { id: "c3150", nombre: "$3.150" }, { id: "c3500", nombre: "$3.500" }],
          clave: "c3300", retros: { c3150: "$3.150 es el 50 %; busca donde la curva marca 80 %.", c3500: "$3.500 da casi 99 %; es más de lo pedido." } },
        /* La resta es criterio de Gen: la guía dice que el cuantitativo da la reserva para un nivel de confianza. */
        { id: "c11h08-03", subtemas: ["gp-11-4"], curva: true, mesa: "patrocinadora",
          consigna: "¿Qué reserva para contingencias da 80 % de confianza?",
          destinos: [{ id: "r300", nombre: "$300" }, { id: "r3300", nombre: "$3.300" }, { id: "r150", nombre: "$150" }],
          clave: "r300", retros: { r3300: "La reserva es la diferencia: 3.300 − 3.000 = 300.", r150: "$150 llega solo al valor esperado, 50 %." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Ordena las barras: ¿qué pesa más en el costo?",
      pasos: [
        { tipo: "ordenar", id: "c11h08-tornado", subtemas: ["gp-11-4"],
          consigna: "Ordena las barras: ¿qué pesa más en el costo?",
          items: A.tornado.map((b) => ({ id: b.id, texto: `${b.texto} · ${cifra(b.r.toFixed(2))}` })),
          retrosPar: {
            "tambor-cambio": "0,55 es la correlación más fuerte: va arriba.",
            "cambio-montaje": "0,42 va segunda, bajo 0,55.",
            "montaje-descuento": "−0,12 es la más débil: va abajo, aunque sea oportunidad.",
          },
          retro: "0,25 va tercera." },
        { id: "c11h08-04", subtemas: ["gp-11-4"],
          consigna: "¿Dónde enfocas primero las respuestas?",
          destinos: [{ id: "tambor", nombre: "Llegada del tambor" }, { id: "cambio", nombre: "Tasa de cambio" }, { id: "montaje", nombre: "Montaje eléctrico" }],
          clave: "tambor", retro: "La barra más larga es la llegada del tambor." },
        { id: "c11h08-05", subtemas: ["gp-11-4"],
          consigna: "Índice de criticidad del montaje: 85 %. ¿Qué significa?",
          destinos: [{ id: "ruta", nombre: "Quedó en la ruta crítica en el 85 % de las corridas" }, { id: "falla", nombre: "Tiene 85 % de probabilidad de fallar" }, { id: "costo", nombre: "Cuesta el 85 % del total" }],
          clave: "ruta", retros: { falla: "El índice cuenta corridas en la ruta crítica, no fallas.", costo: "No mide costo: mide presencia en la ruta crítica." } },
        { id: "c11h08-06", subtemas: ["gp-11-4"],
          texto: "«La productividad del montaje podría ser mayor o menor.»",
          consigna: "¿Variabilidad o ambigüedad?",
          destinos: [{ id: "variabilidad", nombre: "Variabilidad" }, { id: "ambiguedad", nombre: "Ambigüedad" }],
          clave: "variabilidad", retro: "Se sabe qué pasará, no cuánto: variabilidad." },
        { id: "c11h08-07", subtemas: ["gp-11-4"],
          texto: "«Nadie sabe aún cómo será la norma de emisiones.»",
          consigna: "¿Variabilidad o ambigüedad?",
          destinos: [{ id: "variabilidad", nombre: "Variabilidad" }, { id: "ambiguedad", nombre: "Ambigüedad" }],
          clave: "ambiguedad", retro: "No se sabe qué pasará: ambigüedad; se consulta a expertos." },
        { id: "c11h08-08", subtemas: ["gp-11-5"], mesa: "patrocinadora",
          contexto: "La simulación muestra que el proyecto completo está muy fuera de los umbrales y seguirá así.",
          consigna: "Si nada lo devuelve a los umbrales, ¿qué queda?",
          destinos: [{ id: "cancelar", nombre: "Cancelar el proyecto" }, { id: "transferir", nombre: "Transferir un riesgo individual" }, { id: "aceptar", nombre: "Aceptar pasivamente" }],
          clave: "cancelar", retros: { transferir: "Esto es el riesgo general; un riesgo suelto no lo resuelve.", aceptar: "Aceptar pasivamente no corrige un nivel inaceptable." } },
      ],
    },
  ],
};

/* ─── H09 · La roca de la ladera ─── */
export const ESTRATEGIAS_AMENAZA = [
  { id: "escalar", nombre: "Escalar" },
  { id: "evitar", nombre: "Evitar" },
  { id: "transferir", nombre: "Transferir" },
  { id: "mitigar", nombre: "Mitigar" },
  { id: "aceptar", nombre: "Aceptar" },
];
export const GP_C11_H09 = {
  id: "gp26-pla-c11-h09-ladera",
  contexto: "Las amenazas de la ampliación ya tienen prioridad. Ahora cada dueño propone qué hacer con la suya.",
  rol: "Diriges la ampliación y nombras la estrategia de cada respuesta.",
  consigna: "Lanza cada roca a la estrategia que describe su respuesta.",
  cierre: "Escalar, evitar, transferir, mitigar o aceptar: cada amenaza pide la suya.",
  subtemas: ["gp-11-5"],
  elenco: ["tu"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lanza cada roca a la estrategia que describe su respuesta.",
    destinos: ESTRATEGIAS_AMENAZA,
    /* 8, al menos una por estrategia; siempre «Hacer más pruebas» (la trampa evitar ↔ mitigar, con una de evitar). */
    partida: { n: 7, siempre: ["c11h09-05"], cubrir: true },
    banco: con("gp-11-5", [
      it("c11h09-01", "«Cambiar la tostadora importada por una nacional ya probada, sin envío por barco.»", "evitar", "Elimina la causa del riesgo de envío: evitar."),
      it("c11h09-02", "«Correr el arranque un mes para no cruzarse con la cosecha.»", "evitar", "Extender el cronograma para quitar la amenaza es evitar."),
      it("c11h09-03", "«Comprar un seguro de transporte para la máquina.»", "transferir", "El seguro pasa el impacto a otro, con prima."),
      it("c11h09-04", "«Exigir al contratista eléctrico una garantía de cumplimiento.»", "transferir", "La garantía traslada el impacto al contratista."),
      it("c11h09-05", "«Hacer más pruebas del quemador antes del arranque.»", "mitigar", "Más pruebas reducen la probabilidad, no la eliminan."),
      it("c11h09-06", "«Instalar un ventilador de respaldo por si falla el principal.»", "mitigar", "La redundancia reduce el impacto: mitigar."),
      it("c11h09-07", "«Cambiar a un proveedor de gas más estable.»", "mitigar", "Un vendedor más estable reduce la probabilidad: mitigar."),
      it("c11h09-08", "«La caída del precio del café golpearía a todo el portafolio.»", "escalar", "Afecta objetivos fuera del proyecto: se escala al portafolio."),
      it("c11h09-09", "«La respuesta cuesta $2.000 millones, más de lo que puedes autorizar.»", "escalar", "Excede tu autoridad: se escala."),
      it("c11h09-10", "«Amenaza de baja prioridad: se reservan 5 días por si ocurre.»", "aceptar", "Se reconoce y se deja una reserva: aceptación activa."),
      it("c11h09-11", "«Amenaza de baja prioridad: solo se revisa cada mes.»", "aceptar", "Sin acción proactiva, solo revisión: aceptación pasiva."),
    ]),
    despues: [
      { id: "c11h09-12", subtemas: ["gp-11-5"],
        consigna: "¿La de 5 días es aceptación activa o pasiva?",
        destinos: [{ id: "activa", nombre: "Activa" }, { id: "pasiva", nombre: "Pasiva" }],
        clave: "activa", retros: { pasiva: "Dejar una reserva es la aceptación activa más común." } },
      { id: "c11h09-13", subtemas: ["gp-11-5"],
        contexto: "El portafolio aceptó la amenaza del precio del café.",
        consigna: "¿Tu equipo la sigue monitoreando?",
        destinos: SI_NO, clave: "no", retros: { si: "Escalada y aceptada, ya no la monitoreas; queda como información." } },
      { id: "c11h09-14", subtemas: ["gp-11-5"],
        consigna: "¿Qué estrategia baja la probabilidad a cero?",
        destinos: [{ id: "evitar", nombre: "Evitar" }, { id: "mitigar", nombre: "Mitigar" }, { id: "transferir", nombre: "Transferir" }],
        clave: "evitar", retros: { mitigar: "Mitigar reduce, pero no lleva a cero.", transferir: "Transferir cambia quién asume el impacto; no lo elimina." } },
    ],
  }],
};

/* ─── H10 · El espejo de las estrategias (2 etapas) ─── */
const ESTRATEGIAS_OPORTUNIDAD = [
  { id: "explotar", nombre: "Explotar" },
  { id: "compartir", nombre: "Compartir" },
  { id: "mejorar", nombre: "Mejorar" },
  { id: "escalar", nombre: "Escalar" },
  { id: "aceptar", nombre: "Aceptar" },
];
export const GP_C11_H10 = {
  id: "gp26-pla-c11-h10-espejo",
  contexto: "El proveedor ofrece un técnico extra y el banco una tasa menor. También las oportunidades necesitan respuesta.",
  rol: "Diriges la ampliación y planeas cómo aprovechar las oportunidades.",
  consigna: "Pon frente a cada amenaza su estrategia espejo.",
  cierre: "Explotar asegura la oportunidad; mejorar solo la vuelve más probable.",
  subtemas: ["gp-11-5"],
  elenco: ["tu"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon frente a cada amenaza su estrategia espejo.",
      destinos: ESTRATEGIAS_OPORTUNIDAD,
      /* Los pares salen de la guía (pp. 445–446). */
      partida: { todas: true },
      banco: con("gp-11-5", [
        it("c11h10-01", "Amenaza: Evitar", "explotar", "Evitar lleva la amenaza a 0 %; explotar lleva la oportunidad a 100 %."),
        it("c11h10-02", "Amenaza: Transferir", "compartir", "Transferir pasa una amenaza a otro; compartir, una oportunidad y su beneficio."),
        it("c11h10-03", "Amenaza: Mitigar", "mejorar", "Mitigar reduce probabilidad o impacto; mejorar los aumenta."),
        it("c11h10-04", "Amenaza: Escalar", "escalar", "Escalar sirve igual para ambas: va fuera del proyecto."),
        it("c11h10-05", "Amenaza: Aceptar", "aceptar", "Aceptar también existe para oportunidades, activa o pasiva."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Qué estrategia aplica cada respuesta a una oportunidad?",
      destinos: ESTRATEGIAS_OPORTUNIDAD,
      /* 6 de 8; siempre un «Explotar» y un «Mejorar» (cubrir: una de cada estrategia). */
      partida: { n: 6, cubrir: true },
      banco: con("gp-11-5", [
        it("c11h10-11", "«Asignar a los dos técnicos más talentosos de Altamira para asegurar el adelanto.»", "explotar", "Busca que el adelanto ocurra sí o sí: explotar."),
        it("c11h10-12", "«Usar la tecnología nueva de tueste que garantiza menos gas y menos tiempo.»", "explotar", "Garantiza el beneficio, probabilidad al 100 %: explotar."),
        it("c11h10-13", "«Formar una empresa conjunta con otra tostadora para exportar lo extra.»", "compartir", "Un tercero captura y comparte el beneficio: compartir."),
        it("c11h10-14", "«Sumar un turno extra al montaje para intentar terminar antes.»", "mejorar", "Más recursos aumentan la probabilidad, sin garantizarla: mejorar."),
        it("c11h10-15", "«Pagar a tiempo cada factura para subir la opción del descuento.»", "mejorar", "Ataca la causa para aumentar la probabilidad: mejorar."),
        it("c11h10-16", "«La finca vecina está en venta; comprarla excede el proyecto.»", "escalar", "Fuera del alcance y de tu autoridad: escalar."),
        it("c11h10-17", "«Reservar $10 millones por si sale la feria de exportación.»", "aceptar", "Reserva para aprovecharla si llega: aceptación activa."),
        it("c11h10-18", "«Un descuento menor posible: solo se revisa cada mes.»", "aceptar", "Sin acción, solo revisión: aceptación pasiva."),
      ]),
      despues: { id: "c11h10-19", subtemas: ["gp-11-5"],
        consigna: "¿Cuál sube la probabilidad al 100 %?",
        destinos: [{ id: "explotar", nombre: "Explotar" }, { id: "mejorar", nombre: "Mejorar" }, { id: "compartir", nombre: "Compartir" }],
        clave: "explotar", retros: { mejorar: "Mejorar la aumenta, pero no la asegura.", compartir: "Compartir reparte el beneficio; no lo asegura." } },
    },
  ],
};

/* ─── H11 · La fila del registro (2 etapas) ─── */
export const COLUMNAS_C11 = [
  { id: "dueno", nombre: "Dueño" },
  { id: "estrategia", nombre: "Estrategia" },
  { id: "accion", nombre: "Acción" },
  { id: "disparador", nombre: "Disparador" },
  { id: "contingencia", nombre: "Plan de contingencia" },
  { id: "residual", nombre: "Riesgo residual" },
  { id: "secundario", nombre: "Riesgo secundario" },
  { id: "nova", nombre: "No va en esta fila" },
];
const opcionCasilla = (o, que) => ({
  tipo: "casillas", id: `c11h11-${o.id}-${que}`, opcion: o.id, que, subtemas: ["gp-11-5"],
  texto: que === "vme"
    ? `${o.id.toUpperCase()} · ${o.nombre}: cuesta $${o.costo}; ${o.id === "c" ? "el impacto baja a −$50 (prob. 40 %)" : `la probabilidad baja a ${Math.round(o.p * 100)} %`}.`
    : `${o.id.toUpperCase()} · ${o.nombre}: cuesta $${o.costo}.`,
  casillas: que === "vme"
    ? [{ id: "vme", nombre: "VME después (amenaza: en negativo)", signo: true, clave: o.vme,
      retro: { a: "Con 20 %: 0,20 × 200 = 40.", b: "0,05 × 200 = 10.", c: "El impacto baja a 50: 0,40 × 50 = 20." }[o.id],
      trampas: [{ valor: -o.vme, retro: `Es una amenaza: su VME va en negativo, ${cifra(o.vme)}.` }] }]
    : [{ id: "rent", nombre: "Rentabilidad = cambio en el impacto ÷ costo", clave: o.rent, tolerancia: o.id === "b" ? 0.05 : 0,
      retro: { a: "Es cambio ÷ costo: 40 ÷ 10 = 4.", b: "70 ÷ 60 ≈ 1,2.", c: "60 ÷ 30 = 2." }[o.id] }],
});
export const GP_C11_H11 = {
  id: "gp26-pla-c11-h11-libro",
  contexto: "El riesgo del barco demorado salió prioridad alta. Su dueño es el gerente funcional de compras.",
  rol: "Diriges la ampliación y completas la fila del registro de riesgos.",
  consigna: "Arrastra cada pieza a su columna del registro.",
  cierre: "Una buena respuesta es proporcional, rentable, realista, acordada y con dueño.",
  subtemas: ["gp-11-5", "gp-11-2"],
  elenco: ["tu", "gerente", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Arrastra cada pieza a su columna del registro.",
      destinos: COLUMNAS_C11,
      partida: { todas: true },
      banco: [
        it("c11h11-01", "«Gerente funcional de compras.»", "dueno", "Es la persona responsable de la respuesta: el dueño.", { subtemas: ["gp-11-2"] }),
        it("c11h11-02", "«Mitigar.»", "estrategia", "Reducir la probabilidad de demora es mitigar.", { subtemas: ["gp-11-5"] }),
        it("c11h11-03", "«Contratar un agente de aduanas que agilice el puerto.»", "accion", "Es la acción concreta que aplica la estrategia.", { subtemas: ["gp-11-5"] }),
        it("c11h11-04", "«Si el barco no ha zarpado el 15 de agosto.»", "disparador", "Es la condición que avisa que el riesgo está por ocurrir.", { subtemas: ["gp-11-2"] }),
        it("c11h11-05", "«Alquilar una tostadora temporal mientras llega la nueva.»", "contingencia", "Solo se ejecuta si se activa el disparador: contingencia.", { subtemas: ["gp-11-5"] }),
        it("c11h11-06", "«Aun con agente, podría quedar una semana de demora.»", "residual", "Es lo que queda después de la respuesta: residual.",
          { subtemas: ["gp-11-5"], retros: { secundario: "No nace de la respuesta: es lo que la respuesta no alcanza a quitar." } }),
        it("c11h11-07", "«El agente podría cobrar recargos no previstos.»", "secundario", "Nace de aplicar la respuesta: riesgo secundario.",
          { subtemas: ["gp-11-5"], retros: { residual: "No existía antes: aparece por contratar al agente." } }),
        it("c11h11-08", "«La tostadora llegó con un golpe.»", "nova", "Ya pasó: es un incidente, va a su registro.", { subtemas: ["gp-11-2"] }),
      ],
    },
    {
      tipo: "micros",
      consigna: "¿Qué respuesta es más rentable? Calcula y compara.",
      /* «Cambio en el impacto» = VME antes − VME después: criterio de Gen sobre la fórmula de la guía (p. 446). */
      pasos: [
        ...A.opciones.flatMap((o) => [opcionCasilla(o, "vme"), opcionCasilla(o, "rent")]),
        { id: "c11h11-elige", subtemas: ["gp-11-5"], mesa: "patrocinadora",
          consigna: "¿Cuál recomiendas a la patrocinadora?",
          destinos: [{ id: "a", nombre: "A · Agente de aduanas" }, { id: "b", nombre: "B · Tambor por avión" }, { id: "c", nombre: "C · Tostadora temporal" }],
          clave: "a", retros: { b: "B reduce más el riesgo, pero rinde 1,2 por peso; A rinde 4.", c: "C rinde 2 por peso invertido; A rinde 4." } },
      ],
    },
  ],
};

/* ─── H12 · El silo de la reserva (5 semanas, 6 decisiones) ─── */
const semana = (id, mesa, subtema, contexto, consigna, mejor, otras, extra = {}) => ({
  id, mesa, subtemas: [subtema], contexto, consigna, barajar: true,
  destinos: [{ id: "mejor", nombre: mejor }, ...otras.map(([nombre], k) => ({ id: `otra${k + 1}`, nombre }))],
  clave: "mejor", retros: Object.fromEntries(otras.map(([, r], k) => [`otra${k + 1}`, r])), ...extra,
});
export const GP_C11_H12 = {
  id: "gp26-moc-c11-h12-silo",
  contexto: "La obra avanza. Cada lunes hay revisión de riesgos y el silo muestra cuánta reserva para contingencias queda.",
  rol: "Diriges la ampliación y decides en cada revisión de riesgos.",
  consigna: "Decide qué haces en esta revisión.",
  cierre: "Monitorear es revisar si las respuestas funcionan y si la reserva alcanza.",
  subtemas: ["gp-11-7", "gp-11-6"],
  elenco: ["tu", "gerente", "patrocinadora", "pmo"],
  etapas: [{
    tipo: "micros",
    consigna: "Decide qué haces en esta revisión.",
    pasos: [
      semana("c11h12-1", "gerente", "gp-11-6", "Semana 1 · Pasaron tres semanas. El gerente funcional de compras no ha contratado al agente: tiene otras urgencias.",
        "Decide qué haces en esta revisión.", "Hablar con él y usar tu influencia para que actúe ya", [
          ["Nada: ya está en el registro", "Documentar no basta: la respuesta debe ejecutarse."],
          ["Contratarlo tú sin decirle", "Saltarte al dueño rompe los roles acordados; influye en él."],
        ]),
      semana("c11h12-2", "tu", "gp-11-7", "Semana 2 · El permiso de uso del suelo llegó. Ese riesgo ya no puede ocurrir.",
        "Decide qué haces en esta revisión.", "Cerrarlo como obsoleto en el registro", [
          ["Dejarlo activo por si acaso", "Un riesgo que ya no puede ocurrir se cierra."],
          ["Subir su reserva", "Reservar para un riesgo cerrado inmoviliza dinero."],
        ]),
      /* «El riesgo que queda» como suma de VME de las amenazas abiertas: criterio de Gen (la guía, p. 456). */
      semana("c11h12-3a", "patrocinadora", "gp-11-7", "Semana 3 · Reserva inicial: $300. Ya se usaron $180. Las amenazas abiertas suman un VME de −$150.",
        "¿Alcanza la reserva que queda?", "Quedan 120; no alcanza", [
          ["Quedan 120; sobra", "Quedan 120, menos que los 150 del riesgo que queda."],
          ["Quedan 480; sobra", "Se resta lo usado: 300 − 180 = 120."],
        ]),
      semana("c11h12-3b", "patrocinadora", "gp-11-7", "Semana 3 · El silo marca la reserva que queda bajo la línea del riesgo abierto.",
        "Decide qué haces en esta revisión.", "Presentar una solicitud de cambio para revisar la reserva", [
          ["Tomar dinero de la obra sin solicitud", "Todo cambio a la línea base pasa por control de cambios."],
          ["Seguir igual", "Si no alcanza, seguir igual deja amenazas sin cubrir."],
        ]),
      semana("c11h12-4", "tu", "gp-11-7", "Semana 4 · Prueba de la tostadora: tuesta 100 kg por carga. A esta fecha el plan técnico esperaba 120.",
        "Decide qué haces en esta revisión.", "Registrar la desviación como posible amenaza y analizarla", [
          ["Ignorarla: falta tiempo", "La desviación técnica puede señalar una amenaza: no se ignora."],
          ["Cerrar el riesgo de rendimiento", "Con desviación, el riesgo sigue vivo: no se cierra."],
        ]),
      semana("c11h12-5", "pmo", "gp-11-7", "Semana 5 · La PMO pregunta quién debe asegurar que las auditorías de riesgos se hagan a tiempo.",
        "Decide qué haces en esta revisión.", "Tú, director(a) del proyecto", [
          ["La PMO", "La PMO puede apoyar; el responsable es el director."],
          ["El dueño de cada riesgo", "Cada dueño responde por su riesgo, no por auditar el proceso."],
        ]),
    ],
  }],
};

export const PIEZAS_TEXTO_C11 = [GP_C11_H01, GP_C11_H02, GP_C11_H03, GP_C11_H04, GP_C11_H05, GP_C11_H06, GP_C11_H07, GP_C11_H08, GP_C11_H09, GP_C11_H10, GP_C11_H11, GP_C11_H12];
