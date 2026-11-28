/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 3 «EL ROL DEL DIRECTOR DEL PROYECTO» — LOS
 * TEXTOS DE LAS 7 HACER (lote 2)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c03-hacer.md (§2, H01 a H07). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 * Forma y tipos de etapa: los de textos-c1.js y ../comun/preparar.js.
 *
 * Módulo gp-fundamentos (el cap. 3 no es un proceso). Los subtemas gp03-* del
 * diseño son los gp-c3-* de ../estructura.js, uno a uno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
/* Le pone el subtema a cada ítem de una lista. */
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];

/* ─── H01 · La orquesta de la inauguración (2 etapas) ─── */
export const GP_C3_H01 = {
  id: "gp26-fun-c03-h01-orquesta",
  contexto: "Altamira abre su tienda en Medellín. La patrocinadora te compara con el director de la orquesta que tocará en la inauguración.",
  rol: "Diriges el proyecto de la tienda de Medellín.",
  consigna: "Une cada parte de la orquesta con su par del proyecto.",
  cierre: "Igual que el director de orquesta: no tocas todo, pero respondes por el resultado.",
  subtemas: ["gp-c3-rol"],
  elenco: ["tu", "patrocinadora", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Une cada parte de la orquesta con su par del proyecto.",
      destinos: [
        { id: "plan", nombre: "Plan y cronograma documentados" },
        { id: "reuniones", nombre: "Reuniones e indicaciones verbales y no verbales" },
        { id: "unidades", nombre: "Unidades de negocio: diseño, obra, instalaciones" },
        { id: "equipo", nombre: "Los miembros del equipo" },
        { id: "resultado", nombre: "El resultado del proyecto" },
        { id: "roles", nombre: "No hace todos los roles del proyecto" },
      ],
      partida: { todas: true },
      banco: con("gp-c3-rol", [
        it("c3h01-01", "Partitura y horario de ensayos", "plan", "La partitura es comunicación escrita: equivale al plan y al cronograma."),
        it("c3h01-02", "Batuta y gestos del director", "reuniones", "La batuta comunica en tiempo real, como tus reuniones e indicaciones."),
        it("c3h01-03", "Secciones: cuerdas, metal, percusión", "unidades", "Las secciones agrupan músicos, como las unidades agrupan al equipo."),
        it("c3h01-04", "Los músicos", "equipo", "Los músicos son el equipo del director de orquesta."),
        it("c3h01-05", "El concierto", "resultado", "Cada director responde por lo que produce su equipo."),
        it("c3h01-06", "No toca todos los instrumentos", "roles", "Ninguno hace todo: ambos saben dirigir lo que otros hacen."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Lleva cada tarea a quien le corresponde.",
      destinos: [
        { id: "director", nombre: "Director del proyecto" },
        { id: "funcional", nombre: "Gerente funcional" },
        { id: "operaciones", nombre: "Gerente de operaciones" },
      ],
      partida: { todas: true },
      banco: con("gp-c3-rol", [
        it("c3h01-07", "Liderar al equipo que debe abrir la tienda.", "director", "Liderar al equipo hacia los objetivos del proyecto es tu rol."),
        it("c3h01-08", "Equilibrar alcance, tiempo y costo de la obra.", "director", "Equilibrar restricciones del proyecto es tarea del director del proyecto."),
        it("c3h01-09", "Supervisar el área de compras de Altamira.", "funcional", "Supervisar una unidad funcional es del gerente funcional."),
        it("c3h01-10", "Supervisar al equipo de contabilidad.", "funcional", "Contabilidad es una unidad funcional: la supervisa su gerente."),
        it("c3h01-11", "Que la tostadora produzca eficiente cada día.", "operaciones", "Que las operaciones sean eficientes es del gerente de operaciones."),
        it("c3h01-12", "Que las tiendas abiertas atiendan sin demoras.", "operaciones", "Las tiendas abiertas son operación: las cuida el gerente de operaciones."),
      ]),
    },
  ],
};

/* ─── H02 · Las cinco líneas de tu semana (partida progresiva 3/3/2, al menos una por línea) ─── */
export const GP_C3_H02 = {
  id: "gp26-fun-c03-h02-tranvia",
  contexto: "Tu semana como director(a) no es solo la obra. Desde tu estación salen cinco líneas: los ámbitos donde influyes.",
  rol: "Diriges la tienda de Medellín y organizas tu semana.",
  consigna: "Envía cada tarea por la línea de su ámbito.",
  cierre: null,
  subtemas: ["gp-c3-esfera", "gp-c3-comunicacion"],
  elenco: ["tu"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Envía cada tarea por la línea de su ámbito.",
    destinos: [
      { id: "proyecto", nombre: "Proyecto" },
      { id: "organizacion", nombre: "Organización" },
      { id: "industria", nombre: "Industria" },
      { id: "disciplina", nombre: "Disciplina profesional" },
      { id: "relacionadas", nombre: "Disciplinas relacionadas" },
    ],
    partida: { porNivel: { 1: 3, 2: 3, 3: 2 }, cubrir: true },
    banco: con("gp-c3-esfera", [
      it("c3h02-01", "Equilibrar la obra con el dinero y la gente disponibles.", "proyecto", "Equilibrar restricciones con recursos es tu trabajo dentro del proyecto.", { nivel: 1 }),
      it("c3h02-02", "Presentar al equipo la visión de éxito de la tienda.", "proyecto", "Orientar al equipo con la visión de éxito ocurre en el proyecto.", { nivel: 1 }),
      it("c3h02-03", "Leer sobre las nuevas máquinas de espresso del mercado.", "industria", "Seguir productos y tecnología nuevos es mirar la industria.", { nivel: 1 }),
      it("c3h02-04", "Tomar un curso de dirección de proyectos en la universidad.", "disciplina", "Capacitarte de forma continua es tu disciplina profesional.", { nivel: 1 }),
      it("c3h02-05", "Acordar con el director de la app quién usa al único electricista.", "organizacion", "Proyectos que piden los mismos recursos se resuelven en la organización.", { nivel: 2 }),
      it("c3h02-06", "Alinear el plan de la tienda con el del programa.", "organizacion", "Alinear tu plan con el programa es trabajo en la organización.", { nivel: 2 }),
      it("c3h02-07", "Ayudar a que la PMO de Altamira sea más eficaz.", "organizacion", "Potenciar la PMO es parte de tu papel en la organización.", { nivel: 2 }),
      it("c3h02-08", "Analizar cómo afecta a la tienda la subida del precio del café.", "industria", "Las fuerzas económicas son tendencias de la industria.", { nivel: 2 }),
      it("c3h02-09", "Dar una charla en una comunidad de práctica de directores.", "disciplina", "Compartir tu pericia con colegas es parte de la disciplina profesional.", { nivel: 2 }),
      it("c3h02-10", "Explicarle a mercadeo por qué conviene trabajar por proyectos.", "relacionadas", "Educar a otros profesionales en el valor de proyectos: embajador informal.", { nivel: 3 }),
      it("c3h02-11", "Mostrarle a contabilidad cómo dirigir por proyectos mejora la calidad.", "relacionadas", "Promover las ventajas de proyectos ante otras disciplinas es ser embajador.", { nivel: 3 }),
      it("c3h02-12", "Hacer un curso de gestión de la configuración.", "disciplina", "Formarte en una profesión relacionada sigue siendo tu desarrollo profesional.", { nivel: 3 }),
    ]),
    despues: [
      { id: "c3h02-m1", subtemas: ["gp-c3-comunicacion"], revela: "redes",
        contexto: "La alcaldía frena el permiso por un trámite.",
        consigna: "¿Qué red te ayuda más a sortear la burocracia?",
        destinos: [{ id: "informales", nombre: "Informales" }, { id: "formales", nombre: "Formales" }],
        clave: "informales", retros: { formales: "La guía dice que las redes informales pesan más para resolver." } },
      { id: "c3h02-m2", subtemas: ["gp-c3-comunicacion"],
        contexto: "El equipo apoyó tu decisión, aunque dos no la preferían.",
        consigna: "¿Hubo consenso?",
        destinos: SI_NO,
        clave: "si", retros: { no: "Consenso es apoyar la decisión, aunque no haya 100 % de acuerdo." } },
    ],
  }],
};

/* ─── H03 · El taburete de tres patas (2 etapas; 3 conductas por pata) ─── */
export const GP_C3_H03 = {
  id: "gp26-fun-c03-h03-taburete",
  contexto: "Altamira elige director(a) para su próxima tienda. La junta mide a cada candidato con el triángulo de talentos del PMI.",
  rol: "Diriges la tienda de Medellín y ayudas a la junta a elegir.",
  consigna: "Pon cada conducta en la pata del taburete que fortalece.",
  cierre: "Las organizaciones buscan, además de técnica, liderazgo e inteligencia de negocios.",
  subtemas: ["gp-c3-talento"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada conducta en la pata del taburete que fortalece.",
      destinos: [
        { id: "tecnica", nombre: "Dirección técnica" },
        { id: "liderazgo", nombre: "Liderazgo" },
        { id: "estrategica", nombre: "Gestión estratégica y de negocios" },
      ],
      partida: { porClave: 3 },
      banco: con("gp-c3-talento", [
        it("c3h03-01", "Tener a mano el cronograma y el registro de incidentes.", "tecnica", "Tener a mano los elementos técnicos críticos es dirección técnica."),
        it("c3h03-02", "Adaptar herramientas tradicionales y ágiles a la tienda.", "tecnica", "Adaptar herramientas y métodos es habilidad técnica."),
        it("c3h03-03", "Planificar a fondo y priorizar con cuidado.", "tecnica", "Planificar y priorizar es parte de la dirección técnica."),
        it("c3h03-04", "Saber a qué experto pedirle juicio sobre la instalación eléctrica.", "tecnica", "Saber dónde está la pericia es habilidad técnica."),
        it("c3h03-05", "Motivar al equipo cuando la obra se atrasa.", "liderazgo", "Motivar y guiar al equipo es liderazgo."),
        it("c3h03-06", "Negociar entre dos baristas que chocan por los turnos.", "liderazgo", "Negociar y resolver conflictos entre personas es liderazgo."),
        it("c3h03-07", "Seguir con buen ánimo después de un mal mes.", "liderazgo", "La resiliencia es una capacidad de liderazgo."),
        it("c3h03-08", "Preguntar y escuchar al equipo antes de decidir.", "liderazgo", "Preguntar y escuchar es una habilidad del líder."),
        it("c3h03-09", "Explicarle a la junta cómo la tienda sirve a la estrategia.", "estrategica", "Explicar el negocio detrás del proyecto es gestión estratégica."),
        it("c3h03-10", "Saber si el mercado de café en Medellín crece o se contrae.", "estrategica", "Conocer el estado del mercado es conocimiento del negocio."),
        it("c3h03-11", "Comparar las opciones con el VAN y el ROI.", "estrategica", "El análisis costo-beneficio es habilidad estratégica y de negocios."),
        it("c3h03-12", "Preguntarle al gerente de operaciones cómo la tienda afectará la tostadora.", "estrategica", "Consultar a operaciones es buscar la pericia del negocio."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "¿Qué candidato tiene el taburete más estable?",
      pasos: [
        { id: "c3h03-r1", subtemas: ["gp-c3-talento"], consigna: "¿Qué candidato tiene el taburete más estable?",
          destinos: [
            { id: "a", nombre: "Candidato A", pista: "Experto en cronogramas y costos; poco trato con equipos y con el negocio." },
            { id: "b", nombre: "Candidato B", pista: "Inspira al equipo y conoce el mercado; nunca ha planificado un proyecto." },
            { id: "c", nombre: "Candidato C", pista: "Planifica bien, motiva al equipo y entiende la estrategia." },
          ],
          clave: "c",
          retros: { a: "Lo técnico es esencial, pero no basta: el taburete se cae.", b: "Sin técnica falta una pata: los tres conjuntos se necesitan." } },
        { id: "c3h03-r2", subtemas: ["gp-c3-talento"], consigna: "¿Qué candidato tiene el taburete más estable?",
          destinos: [
            { id: "d", nombre: "Candidato D", pista: "Gran técnica y gran líder; no sabe qué vende Altamira." },
            { id: "e", nombre: "Candidato E", pista: "Sabe de finanzas y competencia; no planifica ni motiva." },
            { id: "f", nombre: "Candidato F", pista: "Técnica sólida, buen líder y entiende el negocio, sin ser el mejor en ninguna." },
          ],
          clave: "f",
          retros: { d: "Sin negocio no maximiza el valor del proyecto.", e: "Una sola pata larga no sostiene: pide equilibrio de las tres." } },
      ],
    },
  ],
};

/* ─── H04 · El llavero del poder (14 llaves; partida progresiva 3/3/2) ─── */
export const LLAVES = [
  ["posicional", "Posicional"], ["informativo", "Informativo"], ["referente", "Referente"], ["situacional", "Situacional"],
  ["carismatico", "Carismático"], ["relacional", "Relacional"], ["experto", "Experto"], ["recompensas", "Recompensas"],
  ["punitivo", "Punitivo"], ["halagador", "Halagador"], ["presion", "Presión"], ["culpa", "Culpa"],
  ["persuasivo", "Persuasivo"], ["evasivo", "Evasivo"],
].map(([id, nombre]) => ({ id, nombre }));

export const GP_C3_H04 = {
  id: "gp26-fun-c03-h04-llavero",
  contexto: "En la obra de Medellín necesitas que otros actúen. Tienes un llavero: cada llave es una forma de poder distinta.",
  rol: "Diriges la obra y observas qué poder se usa.",
  consigna: "Elige la llave del poder que se está usando.",
  cierre: null,
  subtemas: ["gp-c3-poder"],
  elenco: ["tu", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Elige la llave del poder que se está usando.",
    destinos: LLAVES,
    partida: { porNivel: { 1: 3, 2: 3, 3: 2 } },
    banco: con("gp-c3-poder", [
      it("c3h04-01", "El acta te nombró director(a): das la orden por tu cargo.", "posicional", "La orden se apoya en el puesto formal: poder posicional.", { nivel: 1 }),
      it("c3h04-02", "Prometes un día libre a quien termine el montaje a tiempo.", "recompensas", "Ofrecer algo deseado a cambio es poder de recompensa.", { nivel: 1 }),
      it("c3h04-03", "Adviertes que quien llegue tarde pierde el turno extra.", "punitivo", "Anunciar una consecuencia negativa es poder punitivo o coercitivo.", { nivel: 1 }),
      it("c3h04-04", "Eres barista certificado y el equipo acepta tu criterio sobre las máquinas.", "experto", "Te siguen por tu pericia y certificación: poder experto.", { nivel: 1 }),
      it("c3h04-05", "Solo tú recibes el reporte de ventas y decides quién lo ve.", "informativo", "Controlar quién recibe la información es poder informativo.", { nivel: 2 }),
      it("c3h04-06", "El equipo te sigue porque admira cómo cumpliste en Manizales.", "referente", "Es respeto y credibilidad ganados: poder referente, no carisma.", { nivel: 2 }),
      it("c3h04-07", "Se inunda el local y todos acatan tus instrucciones.", "situacional", "Lo da una crisis única, no tu cargo: poder situacional.", { nivel: 2 }),
      it("c3h04-08", "Un contacto que cultivaste en la alcaldía agiliza el permiso.", "relacional", "Usas una relación y una alianza cultivadas: poder relacional.", { nivel: 2 }),
      it("c3h04-09", "Muestras cifras que convencen a la patrocinadora de cambiar el horario.", "persuasivo", "Convences con argumentos: poder persuasivo.", { nivel: 2 }),
      it("c3h04-10", "Elogias mucho al proveedor para que te dé prioridad.", "halagador", "Ganas el favor con adulación: poder halagador.", { nivel: 3 }),
      it("c3h04-11", "Le das al contratista una hora para firmar, sin otra opción.", "presion", "Limitas su libertad de elegir: poder basado en la presión.", { nivel: 3 }),
      it("c3h04-12", "Le recuerdas al gerente funcional que le prestaste gente el mes pasado.", "culpa", "Apelas a su sentido del deber: poder basado en la culpa.", { nivel: 3 }),
      it("c3h04-13", "No vas a la reunión donde se discutiría tu presupuesto.", "evasivo", "Negarse a participar también es poder: el evasivo.", { nivel: 3 }),
      it("c3h04-14", "Tu encanto hace que todos quieran trabajar contigo.", "carismatico", "Es encanto y atracción personal: poder personal o carismático.", { nivel: 3 }),
    ]),
    despues: [
      { id: "c3h04-m1", subtemas: ["gp-c3-poder"], consigna: "La política en la obra, ¿es mala por naturaleza?",
        destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
        clave: "no", retros: { si: "La guía dice que la política no es buena ni mala en sí." } },
      { id: "c3h04-m2", subtemas: ["gp-c3-poder"], consigna: "¿Esperas a que te den autoridad o la buscas?",
        destinos: [{ id: "busco", nombre: "La busco, dentro de las políticas" }, { id: "espero", nombre: "Espero a que me la concedan" }],
        clave: "busco", retros: { espero: "Los mejores directores buscan el poder que necesitan, dentro de las políticas." } },
    ],
  }],
};

/* ─── H05 · Las dos caras de la moneda (2 etapas; 5 pares de la tabla 3-1) ─── */
const par = (n, g, l) => [
  it(`c3h05-${n}g`, g[0], "gestion", g[1], { par: n }),
  it(`c3h05-${n}l`, l[0], "liderazgo", l[1], { par: n }),
];
export const GP_C3_H05 = {
  id: "gp26-fun-c03-h05-moneda",
  contexto: "La patrocinadora dice que en la tienda faltan líderes y sobran gestores. Tú sabes que no son sinónimos.",
  rol: "Diriges la tienda y revisas tu propia forma de dirigir.",
  consigna: "Gira la moneda: ¿esta frase es gestión o liderazgo?",
  cierre: null,
  subtemas: ["gp-c3-lider-gestor"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Gira la moneda: ¿esta frase es gestión o liderazgo?",
      destinos: [
        { id: "gestion", nombre: "Gestión", acierto: "Cara de gestión" },
        { id: "liderazgo", nombre: "Liderazgo", acierto: "Cara de liderazgo" },
      ],
      partida: { pares: 5 },
      banco: con("gp-c3-lider-gestor", [
        ...par("01", ["Dirigir con el poder de la posición.", "El liderazgo usa las relaciones; la posición es de la gestión."],
          ["Guiar, influir y colaborar con el poder de las relaciones.", "Apoyarse en relaciones, no en el cargo, es liderazgo."]),
        ...par("02", ["Mantener.", "Mantener lo que funciona es gestión; desarrollar es liderazgo."],
          ["Desarrollar.", "Desarrollar es liderazgo; su par, mantener, es gestión."]),
        ...par("03", ["Administrar.", "Administrar es gestión; su par, innovar, es liderazgo."],
          ["Innovar.", "Innovar es liderazgo; administrar es su par de gestión."]),
        ...par("04", ["Concentrarse en los sistemas y la estructura.", "Sistemas y estructura son foco de la gestión."],
          ["Centrarse en las relaciones con las personas.", "Las personas y sus relaciones son foco del liderazgo."]),
        ...par("05", ["Confiar en el control.", "El control es de la gestión; el líder inspira confianza."],
          ["Inspirar confianza.", "Inspirar confianza es liderazgo; confiar en el control, gestión."]),
        ...par("06", ["Centrarse en objetivos a corto plazo.", "El corto plazo es de la gestión; la visión larga, del líder."],
          ["Centrarse en la visión de largo alcance.", "La visión de largo alcance es del liderazgo."]),
        ...par("07", ["Preguntar cómo y cuándo.", "Cómo y cuándo es pregunta de gestión; qué y por qué, de liderazgo."],
          ["Preguntar qué y por qué.", "Qué y por qué es pregunta de liderazgo."]),
        ...par("08", ["Concentrarse en el resultado final.", "El resultado final es foco de gestión; el horizonte, de liderazgo."],
          ["Enfocarse en el horizonte.", "Mirar el horizonte es liderazgo."]),
        ...par("09", ["Aceptar el statu quo.", "Aceptar el statu quo es gestión; desafiarlo, liderazgo."],
          ["Desafiar el statu quo.", "Desafiar lo establecido es liderazgo."]),
        ...par("10", ["Hacer las cosas correctamente.", "Hacerlas correctamente es gestión; elegir las correctas, liderazgo."],
          ["Hacer las cosas correctas.", "Elegir las cosas correctas es liderazgo."]),
        ...par("11", ["Enfocarse en incidentes operativos y en resolver problemas.", "Los incidentes del día y su solución son foco de gestión."],
          ["Enfocarse en la visión, la alineación, la motivación y la inspiración.", "Visión, motivación e inspiración son del liderazgo."]),
      ]),
    },
    {
      tipo: "micros",
      consigna: "¿Qué cara necesita un director exitoso?",
      pasos: [
        { id: "c3h05-m1", subtemas: ["gp-c3-lider-gestor"], consigna: "¿Qué cara necesita un director exitoso?",
          destinos: [{ id: "dos", nombre: "Las dos" }, { id: "liderazgo", nombre: "Solo liderazgo" }, { id: "gestion", nombre: "Solo gestión" }],
          clave: "dos", retro: "La guía pide emplear las dos y equilibrarlas según la situación." },
        { grupo: "definiciones", barajar: true, consigna: "Lleva cada definición a su cara de la moneda.",
          destinos: [{ id: "gestion", nombre: "Gestión" }, { id: "liderazgo", nombre: "Liderazgo" }],
          retro: "Gestión usa lo conocido; liderazgo trabaja con otros discutiendo.",
          items: con("gp-c3-lider-gestor", [
            { id: "c3h05-m2a", texto: "Llevar a alguien de un punto a otro con comportamientos conocidos", clave: "gestion" },
            { id: "c3h05-m2b", texto: "Guiar a otros mediante la discusión o el debate", clave: "liderazgo" },
          ]) },
        { id: "c3h05-m3", subtemas: ["gp-c3-lider-gestor"],
          contexto: "La tienda abre en una semana y se dañó la máquina de espresso.",
          consigna: "¿Qué cara domina al resolver la máquina hoy?",
          destinos: [{ id: "gestion", nombre: "Gestión" }, { id: "liderazgo", nombre: "Liderazgo" }],
          clave: "gestion", retros: { liderazgo: "Resolver un incidente operativo es foco de la gestión." },
          despues: "Mañana tocará inspirar al equipo: la mezcla cambia con la situación." },
      ],
    },
  ],
};

/* ─── H06 · La comanda de la mañana (2 etapas) ─── */
export const ESTILOS = [
  { id: "laissez-faire", nombre: "Laissez-faire", pose: "El equipo decide solo, con un plano" },
  { id: "transaccional", nombre: "Transaccional", pose: "El equipo recibe su tarjeta de meta" },
  { id: "servidor", nombre: "Líder servidor", pose: "El zorro ayuda al equipo" },
  { id: "transformacional", nombre: "Transformacional", pose: "El equipo propone una idea" },
  { id: "carismatico", nombre: "Carismático", pose: "El equipo aplaude" },
  { id: "interaccional", nombre: "Interaccional", pose: "Un poco de todo a la vez" },
];
export const GP_C3_H06 = {
  id: "gp26-fun-c03-h06-comandas",
  contexto: "Cada mañana imprimes en la comandera de la tienda cómo vas a dirigir el día. El equipo lee y reacciona.",
  rol: "Diriges al equipo durante la obra de Medellín.",
  consigna: "Pon a cada mensaje el nombre de su estilo.",
  cierre: "Tu estilo puede cambiar con el tiempo según los factores en juego.",
  subtemas: ["gp-c3-estilos"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon a cada mensaje el nombre de su estilo.",
      destinos: ESTILOS.map(({ id, nombre }) => ({ id, nombre })),
      partida: { todas: true },
      banco: con("gp-c3-estilos", [
        it("c3h06-01", "Hoy ustedes deciden cómo organizar la barra y fijan sus metas.", "laissez-faire", "No intervienes: el equipo decide y fija sus metas."),
        it("c3h06-02", "Quien cumpla la meta del montaje gana bono; solo intervengo si algo se desvía.", "transaccional", "Metas y recompensas, con gestión por excepción: transaccional."),
        it("c3h06-03", "Antes de pedir nada, pregunto qué necesita cada uno para crecer.", "servidor", "Primero sirves y cuidas el crecimiento de los demás: líder servidor."),
        it("c3h06-04", "Imaginen la mejor tienda de Medellín y propongan ideas nuevas.", "transformacional", "Inspiras y estimulas la innovación: transformacional."),
        it("c3h06-05", "¡Con toda la energía! Estoy seguro de que hoy lo logramos.", "carismatico", "Energía, entusiasmo y convicción firme: carismático."),
        it("c3h06-06", "Bono por la meta, una visión que inspire y mucha energía.", "interaccional", "Mezcla transaccional, transformacional y carismático: interaccional."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "¿Qué factor te hizo cambiar de estilo hoy?",
      destinos: [
        { id: "lider", nombre: "Del líder" },
        { id: "equipo", nombre: "Del equipo" },
        { id: "organizacion", nombre: "De la organización" },
        { id: "entorno", nombre: "Del entorno" },
      ],
      partida: { n: 5, cubrir: true },
      banco: con("gp-c3-estilos", [
        it("c3h06-07", "Hoy amaneciste con poca paciencia.", "lider", "Tu estado de ánimo es una característica del líder."),
        it("c3h06-08", "Los baristas son nuevos y piden guía.", "equipo", "Las necesidades de los miembros son característica del equipo."),
        it("c3h06-09", "Un barista tiene valores muy distintos a los tuyos.", "equipo", "Los valores de un miembro son característica del equipo."),
        it("c3h06-10", "En Altamira todo pasa por la junta.", "organizacion", "La estructura es una característica de la organización."),
        it("c3h06-11", "La tienda hace un trabajo muy rutinario.", "organizacion", "El tipo de trabajo es característica de la organización."),
        it("c3h06-12", "La economía de Medellín entró en recesión.", "entorno", "El estado económico es un factor del entorno."),
        it("c3h06-13", "Hay tensión política por las elecciones locales.", "entorno", "Los elementos políticos externos son del entorno."),
      ]),
    },
  ],
};

/* ─── H07 · El mosaico de la integración (2 etapas, taller del capítulo) ─── */
export const GP_C3_H07 = {
  id: "gp26-fun-c03-h07-mosaico",
  contexto: "La tienda de Medellín junta obra, baristas, permisos y proveedores. Integrar es armar con todo eso un solo mosaico.",
  rol: "Diriges la tienda y respondes por integrarlo todo.",
  consigna: "Pon cada baldosa en el nivel de integración que toca.",
  cierre: "Integrar es armar procesos, conocimientos y personas en un solo mosaico, viendo dónde se levanta.",
  subtemas: ["gp-c3-integracion"],
  elenco: ["tu", "practicante"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Pon cada baldosa en el nivel de integración que toca.",
      pasos: [
        { grupo: "baldosas", barajar: true, consigna: "Pon cada baldosa en el nivel de integración que toca.",
          destinos: [{ id: "proceso", nombre: "Proceso" }, { id: "cognitivo", nombre: "Cognitivo" }, { id: "contextual", nombre: "Contextual" }],
          items: con("gp-c3-integracion", [
            it("c3h07-01", "Un cambio de requisito toca alcance, cronograma y presupuesto, y pide solicitud de cambio.", "proceso", "Procesos que se superponen alrededor de un cambio: nivel de proceso."),
            it("c3h07-02", "El acta se hizo una vez; el control de cambios sigue todo el proyecto.", "proceso", "Procesos únicos y repetidos que se entrelazan: nivel de proceso."),
            it("c3h07-03", "Usas lo que sabes de todas las áreas de conocimiento para decidir.", "cognitivo", "Tu competencia en todas las áreas, integrada: nivel cognitivo."),
            it("c3h07-04", "Eliges cómo dirigir según el tamaño de la tienda y la cultura de Altamira.", "cognitivo", "El método depende del proyecto y de tus capacidades: cognitivo."),
            it("c3h07-05", "Medio equipo trabaja virtual desde Manizales; planeas las comunicaciones con eso.", "contextual", "Los equipos virtuales son parte del nuevo contexto."),
            it("c3h07-06", "Hay proveedores de tres culturas; ajustas cómo se comparte el conocimiento.", "contextual", "Lo multicultural es contexto: lo consideras al gestionar el conocimiento."),
          ]) },
        { grupo: "doble-rol", barajar: true, consigna: "Lleva cada tarea al lado de tu doble rol.",
          destinos: [{ id: "patrocinadora", nombre: "Con la patrocinadora" }, { id: "equipo", nombre: "Con el equipo" }],
          retro: "Con el patrocinador alineas estrategia; con el equipo, lo esencial.",
          items: con("gp-c3-integracion", [
            { id: "c3h07-07", texto: "Alinear los objetivos de la tienda con la estrategia", clave: "patrocinadora" },
            { id: "c3h07-08", texto: "Centrar al equipo en lo realmente esencial", clave: "equipo" },
          ]) },
      ],
    },
    {
      tipo: "micros",
      consigna: "¿Qué dimensión de la complejidad aparece aquí?",
      pasos: [
        { grupo: "fallas", sortear: 4, cubrir: true, consigna: "¿Qué dimensión de la complejidad aparece aquí?",
          destinos: [{ id: "sistema", nombre: "Comportamiento del sistema" }, { id: "humano", nombre: "Comportamiento humano" }, { id: "ambiguedad", nombre: "Ambigüedad" }],
          items: con("gp-c3-integracion", [
            it("c3h07-09", "Si cambia el diseño eléctrico, cambian el techo, la cocina y el permiso.", "sistema", "Son interdependencias entre partes: comportamiento del sistema."),
            it("c3h07-10", "La máquina nueva obliga a cambiar la red eléctrica y el horario de obra.", "sistema", "Un componente arrastra a otros: comportamiento del sistema."),
            it("c3h07-11", "El contratista y los baristas no se entienden y chocan.", "humano", "Es la interacción entre personas y grupos: comportamiento humano."),
            it("c3h07-12", "Dos áreas de Altamira pelean por quién manda en la tienda.", "humano", "Choque entre grupos: comportamiento humano."),
            it("c3h07-13", "Nadie sabe si la alcaldía exigirá un permiso nuevo.", "ambiguedad", "Es incertidumbre sobre lo que puede surgir: ambigüedad."),
            it("c3h07-14", "No está claro qué quiere decir la junta con «tienda insignia».", "ambiguedad", "Falta entendimiento o hay confusión: ambigüedad."),
          ]) },
        { id: "c3h07-15", subtemas: ["gp-c3-integracion"], mesa: "practicante", barajar: true,
          contexto: "El practicante escribe en su informe: «la tienda es compleja».",
          consigna: "¿Cómo lo corriges con la guía?",
          destinos: [{ id: "contiene", nombre: "La tienda contiene complejidad" }, { id: "simple", nombre: "La tienda es simple" }, { id: "no-existe", nombre: "La complejidad no existe" }],
          clave: "contiene",
          retros: { simple: "Tiene muchas partes conectadas que interactúan: hay complejidad.", "no-existe": "Existe, pero es una percepción: se dice que la contiene." } },
      ],
    },
  ],
};

export const PIEZAS_TEXTO_C3 = [GP_C3_H01, GP_C3_H02, GP_C3_H03, GP_C3_H04, GP_C3_H05, GP_C3_H06, GP_C3_H07];
