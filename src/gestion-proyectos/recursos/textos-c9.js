/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 9 «GESTIÓN DE LOS RECURSOS» — LOS TEXTOS DE LAS
 * 12 HACER (lote 5)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c09-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos de cálculo (H05, H07 y H11) viven en FESTIVAL_C9: la prueba
 * gp-lote5 recalcula cada clave desde ellos.
 *
 * Módulos y subtemas (gp09-* del diseño → procesos de ../estructura.js):
 *   gp09-tipos, gp09-plan, gp09-raci, gp09-acta-equipo → gp-9-1 ·
 *   gp09-estimar, gp09-rbs → gp-9-2 · gp09-adquirir, gp09-tendencias
 *   (equipos virtuales) → gp-9-3 · gp09-tuckman, gp09-desarrollar → gp-9-4 ·
 *   gp09-conflictos, gp09-dirigir → gp-9-5 · gp09-controlar → gp-9-6.
 *   H01–H06 van en Planificación (9.1, 9.2); H07–H10 y H12 en Ejecución
 *   (9.3–9.5; H12 con su proceso principal, 9.5); H11 en Monitoreo y Control.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];
/* Un número exacto; con `miles`, «15.000» se lee como quince mil. */
const ent = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, ...extra });

/* Los datos de cálculo del festival (diseño H05, H07 y H11). */
export const FESTIVAL_C9 = {
  estimar: [
    { id: "c9h05-11", requeridas: 3600, porPersona: 60 * 10, clave: 6 },
    { id: "c9h05-12", sumandos: [24, 16, 12], clave: 52 },
    { id: "c9h05-13", requeridas: 900, porPersona: 10 * 3, clave: 30 },
    { id: "c9h05-14", requeridas: 9000, porPersona: 500, clave: 18 },
  ],
  criterios: [
    { id: "disponibilidad", nombre: "Disponibilidad", peso: 0.3, pesoNuevo: 0.2, notas: { a: 2, b: 5, c: 4 } },
    { id: "costo", nombre: "Costo", peso: 0.25, pesoNuevo: 0.4, notas: { a: 5, b: 2, c: 4 } },
    { id: "capacidad", nombre: "Capacidad", peso: 0.25, pesoNuevo: 0.2, notas: { a: 4, b: 5, c: 3 } },
    { id: "actitud", nombre: "Actitud", peso: 0.2, pesoNuevo: 0.2, notas: { a: 4, b: 3, c: 3 } },
  ],
  totales: { a: 3.65, b: 3.85, c: 3.55 },
  totalesNuevos: { a: 4.0, b: 3.4, c: 3.6 },
  vasos: { plan: 12000, dias: 3, dia1: 5000 },
  sillas: { plan: 800, real: 500 },
  hielo: { plan: 600, real: 600 },
  urgente: { vasos: 3000, precio: 250, flete: 250000 },
  noPedir: { cafes: 3000, margen: 2000 },
};

/* ─── H01 · ¿Persona o cosa? (2 etapas) ─── */
export const GP_C9_H01 = {
  id: "gp26-pla-c09-h01-puertas",
  contexto: "Faltan tres semanas para el Festival del Café Altamira. Llega una lista larga de lo que hace falta.",
  rol: "Diriges el proyecto del festival.",
  consigna: "Manda cada recurso por su puerta: equipo o físico.",
  cierre: "Gestionar mal los recursos físicos es un riesgo para el proyecto.",
  subtemas: ["gp-9-1"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Manda cada recurso por su puerta: equipo o físico.",
      destinos: [
        { id: "equipo", nombre: "Acreditación · recursos del equipo", acierto: "Persona" },
        { id: "fisico", nombre: "Muelle de carga · recursos físicos", acierto: "Equipamiento, material, instalación" },
      ],
      /* 7 de 9: siempre la de Bogotá y la red eléctrica (las trampas). */
      partida: { n: 5, siempre: ["c9h01-04", "c9h01-09"] },
      banco: con("gp-9-1", [
        it("c9h01-01", "Baristas para el puesto de catación.", "equipo", "Son personas: recursos del equipo."),
        it("c9h01-02", "Un ingeniero de sonido a medio tiempo.", "equipo", "Es una persona, aunque esté a tiempo parcial."),
        it("c9h01-03", "Voluntarios para la taquilla.", "equipo", "Personas que se suman al equipo del proyecto."),
        it("c9h01-04", "Una experta en café que trabaja desde Bogotá.", "equipo", "Es persona: estar lejos no la vuelve recurso físico."),
        it("c9h01-05", "Cuatro carpas de 10 × 10 metros.", "fisico", "Es equipamiento: un recurso físico."),
        it("c9h01-06", "Tres máquinas de espresso.", "fisico", "Son equipos: recurso físico."),
        it("c9h01-07", "El recinto ferial alquilado.", "fisico", "Es una instalación: recurso físico."),
        it("c9h01-08", "Vasos compostables.", "fisico", "Es material de consumo: recurso físico."),
        it("c9h01-09", "La red eléctrica del recinto.", "fisico", "Es infraestructura: también es recurso físico."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Une cada error con lo que causará.",
      pasos: [{
        consigna: "Une cada error con lo que causará.",
        barajar: true,
        destinos: [
          { id: "costos", nombre: "Costos altos · bodega repleta" },
          { id: "fila", nombre: "Clientes sin atender · fila sin café" },
          { id: "retraso", nombre: "Retraso · tarima a medio armar" },
          { id: "retrabajo", nombre: "Retrabajo · vasos devueltos" },
        ],
        items: con("gp-9-1", [
          it("c9h01-10", "Pides 40.000 vasos para 9.000 asistentes.", "costos", "Demasiado inventario sube los costos y baja el beneficio."),
          it("c9h01-11", "Pides solo 2.000 vasos.", "fila", "Inventario muy bajo deja demanda sin atender."),
          it("c9h01-12", "La planta eléctrica llega el día del concierto.", "retraso", "Un equipo crítico que no llega a tiempo causa retrasos."),
          it("c9h01-13", "Compras vasos baratos de mala calidad.", "retrabajo", "Material de baja calidad causa retiros o retrabajo."),
        ]),
      }],
    },
  ],
};

/* ─── H02 · El gafete de la ingeniera (2 etapas) ─── */
const GAFETE = [
  { id: "rol", nombre: "Rol" },
  { id: "autoridad", nombre: "Autoridad" },
  { id: "responsabilidad", nombre: "Responsabilidad" },
  { id: "competencia", nombre: "Competencia" },
];
export const GP_C9_H02 = {
  id: "gp26-pla-c09-h02-gafete",
  contexto: "El plan de recursos del festival debe decir qué hace cada persona. La ingeniera de sonido espera su gafete.",
  rol: "Diriges el festival y llenas el plan de recursos.",
  consigna: "Lleva cada frase a su casilla del gafete.",
  cierre: null,
  subtemas: ["gp-9-1"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada frase a su casilla del gafete.",
      destinos: GAFETE,
      /* 8 de 9: 2 por casilla. */
      partida: { porClave: 2 },
      banco: con("gp-9-1", [
        it("c9h02-01", "Ingeniera de sonido del escenario principal.", "rol", "Es la función que asume en el proyecto: su rol."),
        it("c9h02-02", "Coordinadora de las pruebas de sonido.", "rol", "Nombra su función, no lo que puede decidir."),
        it("c9h02-03", "Puede rechazar el equipo que llegue dañado del alquiler.", "autoridad", "Rechazar o aceptar entregables es un derecho: autoridad."),
        it("c9h02-04", "Decide el volumen máximo del concierto.", "autoridad", "Tomar esa decisión es autoridad, no tarea."),
        it("c9h02-05", "Firma la aceptación de la consola instalada.", "autoridad", "Firmar aprobaciones es autoridad."),
        it("c9h02-06", "Montar y probar el sonido antes del viernes.", "responsabilidad", "Es trabajo que se espera que haga: responsabilidad."),
        it("c9h02-07", "Entregar cada noche el informe de pruebas.", "responsabilidad", "Es una tarea asignada: responsabilidad."),
        it("c9h02-08", "Sabe operar consolas digitales.", "competencia", "Es habilidad para hacer el trabajo: competencia."),
        it("c9h02-09", "Tiene certificado en montaje eléctrico seguro.", "competencia", "Es capacidad comprobada: competencia."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Marca las respuestas proactivas que sirven.",
      pasos: [
        { tipo: "casillas", id: "c9h02-10", subtemas: ["gp-9-1"], enciende: "competencia",
          contexto: "La ingeniera no sabe usar la consola nueva y faltan diez días.",
          consigna: "Marca las respuestas proactivas que sirven.",
          casillas: [{ id: "proactivas", nombre: "Respuestas proactivas", marcar: true, clave: ["capacitar", "contratar", "ajustar"],
            retro: "Capacitar, contratar o ajustar cronograma y alcance son respuestas válidas.",
            opciones: [
              { id: "capacitar", nombre: "Capacitarla" },
              { id: "contratar", nombre: "Contratar apoyo" },
              { id: "ajustar", nombre: "Ajustar cronograma o alcance" },
              { id: "esperar", nombre: "Esperar a ver si aprende", retro: "Esperar no es proactivo; el desempeño ya está amenazado." },
            ] }] },
        { tipo: "casillas", id: "c9h02-11", subtemas: ["gp-9-1"], enciende: "autoridad-responsabilidad",
          contexto: "Le exigen el sonido perfecto, pero no puede aprobar ni rechazar nada.",
          consigna: "¿Qué dos casillas no concuerdan?",
          casillas: [{ id: "desacuerdo", nombre: "Casillas que no concuerdan", marcar: true, clave: ["autoridad", "responsabilidad"],
            retro: "Rinde mejor quien tiene autoridad acorde a su responsabilidad.",
            opciones: GAFETE }] },
        { id: "c9h02-12", subtemas: ["gp-9-1"],
          consigna: "¿El organigrama del festival lleva el detalle de uno de 3.000 personas?",
          destinos: SI_NO, clave: "no", retros: { si: "El detalle del organigrama depende del tamaño y la necesidad." } },
      ],
    },
  ],
};

/* ─── H03 · La matriz RACI de la tarima (2 etapas) ─── */
export const RACI_COLUMNAS = [
  { id: "tu", nombre: "Tú" },
  { id: "patrocinadora", nombre: "Patrocinadora" },
  { id: "gerente", nombre: "Gerente funcional" },
  { id: "logistica", nombre: "Equipo · logística" },
  { id: "sonido", nombre: "Equipo · sonido" },
];
const FICHAS = [
  { id: "R", nombre: "R · ejecuta" },
  { id: "A", nombre: "A · responde" },
  { id: "C", nombre: "C · se consulta" },
  { id: "I", nombre: "I · se informa" },
  { id: "-", nombre: "Vacía" },
];
const VACIA = "La nota no la nombra: su celda queda vacía.";
/* Una fila de la RACI: la clave de cada columna y la retro de cada celda. */
const fila = (id, actividad, nota, clave, retros) => ({
  tipo: "casillas", id, subtemas: ["gp-9-1"], actividad, raci: clave,
  texto: `${actividad} · «${nota}»`,
  casillas: RACI_COLUMNAS.map((c) => ({ id: c.id, nombre: c.nombre, opciones: FICHAS, columnas: 3, clave: clave[c.id] ?? "-", retro: retros[c.id] ?? VACIA })),
});
export const GP_C9_H03 = {
  id: "gp26-pla-c09-h03-raci",
  contexto: "Cuatro tareas críticas del festival y cinco personas. Nadie tiene claro quién ejecuta y quién responde.",
  rol: "Diriges el festival y armas la matriz RACI.",
  consigna: "Pon las fichas R, A, C, I según cada nota.",
  cierre: "La RACI asegura un solo dueño por tarea y roles claros.",
  subtemas: ["gp-9-1"],
  elenco: ["tu", "practicante", "patrocinadora", "gerente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Pon las fichas R, A, C, I según cada nota.",
      pasos: [
        fila("c9h03-01", "Montar la tarima", "Logística la monta. Tú respondes. Se consulta a sonido. Se avisa a la patrocinadora.",
          { logistica: "R", tu: "A", sonido: "C", patrocinadora: "I" },
          { logistica: "Montar es ejecutar (R); responder al final es A.", tu: "Montar es ejecutar (R); responder al final es A.",
            sonido: "A sonido se le pregunta (C); a la patrocinadora solo se le avisa (I).",
            patrocinadora: "A sonido se le pregunta (C); a la patrocinadora solo se le avisa (I).",
            gerente: "La nota no nombra al gerente: su celda queda vacía." }),
        fila("c9h03-02", "Probar el sonido", "Sonido la hace. El gerente funcional responde. Te avisan a ti.",
          { sonido: "R", gerente: "A", tu: "I" },
          { tu: "Aquí responde el gerente; a ti solo te avisan.", gerente: "Quien prueba es sonido; el gerente rinde cuentas.",
            sonido: "Quien prueba es sonido; el gerente rinde cuentas." }),
        fila("c9h03-03", "Aprobar el presupuesto", "Tú lo preparas. La patrocinadora decide y responde. Se consulta al gerente.",
          { tu: "R", patrocinadora: "A", gerente: "C" },
          { tu: "Preparar es R; quien decide y responde es la patrocinadora.", patrocinadora: "Preparar es R; quien decide y responde es la patrocinadora.",
            gerente: "Al gerente se le pide opinión: es C." }),
        fila("c9h03-04", "Contratar baristas", "El gerente funcional los contrata. Tú respondes. Se avisa a logística.",
          { gerente: "R", tu: "A", logistica: "I" },
          { gerente: "Quien contrata es el gerente; tú respondes (A).", tu: "Quien contrata es el gerente; tú respondes (A).",
            logistica: "A logística solo se le avisa: I." }),
      ],
    },
    {
      tipo: "micros",
      consigna: "Toca las filas que rompen la RACI y corrígelas.",
      pasos: [{
        consigna: "Toca las filas que rompen la RACI y corrígelas.",
        mesa: "practicante",
        destinos: [
          { id: "bien", nombre: "Está bien así" },
          { id: "una-a", nombre: "Dejar una sola A (Tú)" },
          { id: "a-patro", nombre: "Poner A a la patrocinadora" },
          { id: "r-logistica", nombre: "Poner R a logística" },
        ],
        items: con("gp-9-1", [
          it("c9h03-05", "Señalización: Logística R · Tú A · Gerente A", "una-a", "Una sola A por tarea: así hay un dueño inequívoco."),
          it("c9h03-06", "Permiso de la alcaldía: Tú R · Patrocinadora C · nadie con A", "a-patro", "Sin A nadie responde por la tarea al final."),
          /* Criterio de Gen: la fila sin R se corrige con logística. */
          it("c9h03-07", "Afiche del festival: nadie con R · Tú A · Sonido I", "r-logistica", "Alguien debe ejecutar: sin R la tarea no tiene quién la haga."),
          it("c9h03-08", "Venta de boletas: Logística R · Tú A · Patrocinadora I · Gerente I", "bien", "Correcta: una A, una R; varias I sí se permiten."),
        ]),
      }],
    },
  ],
};

/* ─── H04 · Las reglas de la carpa (2 etapas) ─── */
export const GP_C9_H04 = {
  id: "gp26-pla-c09-h04-pendon",
  contexto: "Primer día con los 30 voluntarios del festival. Nadie sabe cómo se decide ni cómo se arreglan los choques.",
  rol: "Diriges el festival y guías el acta del equipo.",
  consigna: "Cose al pendón solo lo que va en el acta.",
  cierre: null,
  subtemas: ["gp-9-1"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Cose al pendón solo lo que va en el acta.",
      destinos: [
        { id: "si", nombre: "Coser al pendón", acierto: "Cosida" },
        { id: "no", nombre: "Vuelve a la canasta", acierto: "No va" },
      ],
      /* 8: 6 que van y 2 que no; siempre la «autorización formal» (la trampa). */
      partida: { porClave: { si: 6, no: 2 }, siempre: ["c9h04-08"] },
      banco: con("gp-9-1", [
        it("c9h04-01", "Valores: puntualidad y respeto con el visitante.", "si", "Los valores del equipo son parte del acta del equipo."),
        it("c9h04-02", "Avisos urgentes por radio; lo demás, en la reunión.", "si", "Son pautas de comunicación: van en el acta del equipo."),
        it("c9h04-03", "Si no hay acuerdo en 10 minutos, decide la coordinadora del turno.", "si", "Es un criterio para tomar decisiones: va en el acta."),
        it("c9h04-04", "Un choque se habla primero entre los dos, en privado.", "si", "Es el proceso para resolver conflictos del equipo."),
        it("c9h04-05", "Reunión de 15 minutos a las 7:00, de pie.", "si", "Son pautas para las reuniones del equipo."),
        it("c9h04-06", "Nadie deja su puesto sin relevo.", "si", "Es un acuerdo del equipo sobre cómo trabajar."),
        it("c9h04-07", "Presupuesto total del festival: 180 millones.", "no", "El dinero va en el plan del proyecto, no en estas reglas."),
        it("c9h04-08", "Autorización formal del festival, firmada por la patrocinadora.", "no", "Eso es el acta del proyecto, no la del equipo."),
        it("c9h04-09", "Fechas de montaje y desmontaje.", "no", "Las fechas van en el cronograma del proyecto."),
        it("c9h04-10", "Lista de proveedores de carpas.", "no", "Los proveedores son de adquisiciones, no reglas del equipo."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "¿Quién debería redactar estas reglas?",
      pasos: [
        { id: "c9h04-11", subtemas: ["gp-9-1"], barajar: true, pendon: "firmas",
          consigna: "¿Quién debería redactar estas reglas?",
          destinos: [{ id: "equipo", nombre: "El equipo, con tu guía" }, { id: "tu", nombre: "Tú solo" }, { id: "patrocinadora", nombre: "La patrocinadora" }],
          clave: "equipo", retros: { tu: "Funciona mejor si el equipo la desarrolla o contribuye.", patrocinadora: "Son reglas del equipo; las arma el equipo." } },
        { id: "c9h04-12", subtemas: ["gp-9-1"], barajar: true, pendon: "franja",
          contexto: "El jueves llegan diez voluntarios nuevos.",
          consigna: "¿Qué haces con el pendón?",
          destinos: [{ id: "repasar", nombre: "Repasarlo con ellos y actualizarlo si hace falta" }, { id: "nada", nombre: "Nada, ya está firmado" }, { id: "nuevo", nombre: "Hacer uno nuevo" }],
          clave: "repasar", retros: { nada: "El acta se revisa y sirve para integrar nuevos miembros.", nuevo: "No hace falta otra: se actualiza la misma." } },
        { id: "c9h04-13", subtemas: ["gp-9-1"], barajar: true, pendon: "senalan", mesa: "equipo",
          consigna: "¿Quién hace cumplir las reglas del pendón?",
          destinos: [{ id: "todos", nombre: "Todo el equipo" }, { id: "tu", nombre: "Solo tú" }, { id: "pmo", nombre: "Solo la PMO" }],
          clave: "todos", retro: "Todos los miembros son responsables de que se cumplan." },
      ],
    },
  ],
};

/* ─── H05 · ¿Cuántas manos hacen falta? (2 etapas) ─── */
const calculo = (id, texto, nombre, unidad, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-9-2"], texto, retro,
  consigna: "Calcula y escribe la cantidad.",
  casillas: [ent("n", nombre, FESTIVAL_C9.estimar.find((x) => x.id === id).clave, { unidad, miles: true })],
});
export const GP_C9_H05 = {
  id: "gp26-pla-c09-h05-sumadora",
  contexto: "Al festival vendrán unas 9.000 personas en tres días. Debes saber cuánta gente y cuántas cosas pedir.",
  rol: "Diriges el festival y estimas los recursos.",
  consigna: "Ponle a cada estimación el nombre de su técnica.",
  cierre: "Personas = horas requeridas ÷ horas que aporta cada persona.",
  subtemas: ["gp-9-2"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Ponle a cada estimación el nombre de su técnica.",
      destinos: [
        { id: "ascendente", nombre: "Ascendente" },
        { id: "analoga", nombre: "Análoga" },
        { id: "parametrica", nombre: "Paramétrica" },
        { id: "alternativas", nombre: "Alternativas" },
      ],
      /* 5: una de cada técnica y una extra sorteada. */
      partida: { n: 5, cubrir: true },
      banco: con("gp-9-2", [
        it("c9h05-01", "Sumas las horas de cada actividad del montaje y obtienes el total.", "ascendente", "Estimar cada actividad y sumar hacia arriba es ascendente."),
        it("c9h05-02", "Usas lo que necesitó el festival del año pasado, que fue parecido.", "analoga", "Basarse en un proyecto similar anterior es análoga."),
        it("c9h05-03", "Solo conoces los grandes bloques de la EDT y necesitas una cifra rápida.", "analoga", "Rápida y con pocos niveles de la EDT: análoga."),
        it("c9h05-04", "Divides las tazas esperadas entre las que sirve un barista por hora.", "parametrica", "Una relación entre datos y parámetros es paramétrica."),
        it("c9h05-05", "Un modelo histórico dice: un vigilante por cada 500 asistentes.", "parametrica", "Aplicar una razón estadística histórica es paramétrica."),
        it("c9h05-06", "Comparas alquilar, comprar o fabricar los mostradores.", "alternativas", "Fabricar, alquilar o comprar es análisis de alternativas."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Calcula y escribe la cantidad.",
      pasos: [
        { ...calculo("c9h05-11", "Esperas 3.600 tazas al día. Un barista sirve 60 por hora y trabaja 10 horas.", "Baristas", "baristas", "Un barista da 600 tazas al día: 3.600 ÷ 600 = 6."), tira: "3.600 ÷ (60 × 10) = 6 baristas" },
        { ...calculo("c9h05-12", "Paquete Escenario: tarima 24 h, luces 16 h, sonido 12 h.", "Horas del paquete", "horas", "Ascendente suma las actividades: 24 + 16 + 12 = 52."), tira: "24 + 16 + 12 = 52 horas" },
        { ...calculo("c9h05-13", "La limpieza pide 900 horas en 3 días; cada persona trabaja 10 horas diarias.", "Personas", "personas", "Cada persona aporta 30 horas: 900 ÷ 30 = 30."), tira: "900 ÷ (10 × 3) = 30 personas" },
        { ...calculo("c9h05-14", "Vendrán 9.000 personas; el modelo pide un vigilante por cada 500.", "Vigilantes", "vigilantes", "9.000 ÷ 500 = 18 vigilantes."), tira: "9.000 ÷ 500 = 18 vigilantes" },
        { id: "c9h05-15", subtemas: ["gp-9-2"], barajar: true,
          consigna: "¿Dónde anotas cómo obtuviste estas cifras?",
          destinos: [{ id: "base", nombre: "Base de las estimaciones" }, { id: "requisitos", nombre: "Requisitos de recursos" }, { id: "calendario", nombre: "Calendario de recursos" }],
          clave: "base", retros: { requisitos: "Ahí van tipos y cantidades; el cómo va en la base.", calendario: "El calendario dice cuándo está disponible cada recurso." } },
      ],
    },
  ],
};

/* ─── H06 · La rama de los recursos (2 etapas) ─── */
export const RAMAS_C9 = [
  { id: "personal", nombre: "Personal", ramitas: [{ id: "certificados", nombre: "Baristas certificados" }, { id: "aprendices", nombre: "Baristas aprendices" }, { id: "tecnicos", nombre: "Técnicos" }] },
  { id: "materiales", nombre: "Materiales", ramitas: [{ id: "cafe", nombre: "Café en grano" }, { id: "vasos", nombre: "Vasos" }] },
  { id: "equipos", nombre: "Equipos", ramitas: [{ id: "espresso", nombre: "Máquinas de espresso" }, { id: "plantas", nombre: "Plantas eléctricas" }] },
];
const cereza = (id, texto, rama, ramita, retro) => ({
  tipo: "casillas", id, texto, retro, rama, ramita,
  casillas: [
    { id: "rama", nombre: "Rama", opciones: RAMAS_C9.map(({ id: r, nombre }) => ({ id: r, nombre })), columnas: 3, clave: rama },
    { id: "ramita", nombre: "Ramita (tipo)", opciones: RAMAS_C9.flatMap((r) => r.ramitas), clave: ramita },
  ],
});
const ESTRUCTURAS = [{ id: "edt", nombre: "EDT" }, { id: "obs", nombre: "OBS" }, { id: "rbs", nombre: "RBS" }];
export const GP_C9_H06 = {
  id: "gp26-pla-c09-h06-rama",
  contexto: "Ya sabes cuánto pedir. Compras quiere ver todos los recursos del festival ordenados en una sola estructura.",
  rol: "Diriges el festival y armas la estructura de desglose de recursos.",
  consigna: "Cuelga cada recurso en su rama y su tipo.",
  cierre: "EDT desglosa entregables; OBS, la organización; RBS, los recursos.",
  subtemas: ["gp-9-2", "gp-9-1"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Cuelga cada recurso en su rama y su tipo.",
      pasos: [{
        consigna: "Cuelga cada recurso en su rama y su tipo.",
        barajar: true,
        items: con("gp-9-2", [
          cereza("c9h06-01", "Barista certificado en catación.", "personal", "certificados", "Es persona; su nivel de certificación es el tipo."),
          cereza("c9h06-02", "Barista aprendiz.", "personal", "aprendices", "Mismo recurso, otro nivel de habilidad: otra ramita."),
          cereza("c9h06-03", "Electricista certificada.", "personal", "tecnicos", "Es personal técnico, no un equipo eléctrico."),
          cereza("c9h06-04", "Máquina de espresso de dos grupos.", "equipos", "espresso", "Es un equipo; va bajo Equipos."),
          cereza("c9h06-05", "Planta eléctrica de 50 kVA.", "equipos", "plantas", "Es un equipo, no un material que se gasta."),
          cereza("c9h06-06", "Café excelso para la catación.", "materiales", "cafe", "Se consume en el evento: es material."),
          cereza("c9h06-07", "Vasos compostables de 8 onzas.", "materiales", "vasos", "Es material de consumo, no equipo."),
        ]),
      }],
    },
    {
      tipo: "micros",
      consigna: "Nombra cada estructura: EDT, OBS o RBS.",
      pasos: [
        {
          consigna: "Nombra cada estructura: EDT, OBS o RBS.",
          destinos: ESTRUCTURAS,
          items: con("gp-9-1", [
            it("c9h06-08", "A · Festival → Escenario · Zona de catación · Taquilla", "edt", "Desglosa entregables del festival: es la EDT.", { letra: "A" }),
            it("c9h06-09", "B · Altamira → Compras: alquilar carpas · Mercadeo: diseñar afiches · Sistemas: instalar wifi", "obs", "Ordena por departamentos con sus tareas: es la OBS.", { letra: "B" }),
            it("c9h06-10", "C · Festival → Personal · Materiales · Equipos", "rbs", "Ordena recursos por categoría y tipo: es la RBS.", { letra: "C" }),
          ]),
        },
        { id: "c9h06-11", subtemas: ["gp-9-1"], mesa: "gerente",
          contexto: "Compras quiere ver todo lo que le toca hacer.",
          consigna: "¿Qué estructura consulta?",
          destinos: ESTRUCTURAS, clave: "obs", retro: "La OBS muestra cada departamento con sus tareas." },
        { id: "c9h06-12", subtemas: ["gp-9-2"],
          contexto: "Se daña una planta y hay que reemplazarla igual.",
          consigna: "¿Qué estructura te sirve de referencia?",
          destinos: ESTRUCTURAS, clave: "rbs", retro: "La RBS sirve de referencia para reemplazar o volver a adquirir." },
      ],
    },
  ],
};

/* ─── H07 · La hoja de catación de candidatos (2 etapas) ─── */
const ind = (id, nombre, clave, extra = {}) => ({ id, nombre, clave, tolerancia: 0.01, ...extra });
const CANDIDATOS = [{ id: "a", nombre: "A · interno" }, { id: "b", nombre: "B · agencia" }, { id: "c", nombre: "C · independiente" }];
export const GP_C9_H07 = {
  id: "gp26-eje-c09-h07-catacion",
  contexto: "Necesitas un responsable de sonido para el festival. Hay un candidato interno y dos externos.",
  rol: "Diriges el festival y eliges con criterios ponderados.",
  consigna: "Calcula el puntaje ponderado y elige al ganador.",
  cierre: null,
  subtemas: ["gp-9-3"],
  elenco: ["tu", "gerente", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula el puntaje ponderado y elige al ganador.",
      pasos: [
        { tipo: "casillas", id: "c9h07-01", subtemas: ["gp-9-3"], hoja: "totales",
          consigna: "Calcula el puntaje ponderado y elige al ganador.",
          formula: "Total = Σ (peso × nota)",
          casillas: [
            ind("a", "Total de A · interno", FESTIVAL_C9.totales.a, { retro: "0,6 + 1,25 + 1,0 + 0,8 = 3,65." }),
            ind("b", "Total de B · agencia", FESTIVAL_C9.totales.b, { retro: "1,5 + 0,5 + 1,25 + 0,6 = 3,85." }),
            ind("c", "Total de C · independiente", FESTIVAL_C9.totales.c, { retro: "1,2 + 1,0 + 0,75 + 0,6 = 3,55." }),
          ] },
        { id: "c9h07-02", subtemas: ["gp-9-3"], hoja: "ganador",
          consigna: "¿Quién gana?",
          destinos: CANDIDATOS, clave: "b",
          /* La retro de C no está en el diseño: se apoya en los totales que el estudiante acaba de calcular. */
          retros: { a: "El interno es barato, pero casi no está disponible: gana B.", c: "Gana el total ponderado más alto: B, con 3,85." } },
        { id: "c9h07-03", subtemas: ["gp-9-3"], hoja: "pesos", mesa: "patrocinadora", revela: true,
          contexto: "La patrocinadora pide que el costo pese 40 % y los demás 20 %.",
          consigna: "¿Cambia el ganador?",
          despues: "Con los pesos nuevos: A 4,00 · B 3,40 · C 3,60. Gana A.",
          destinos: SI_NO, clave: "si", retros: { no: "Con otros pesos cambia el ganador: ahora gana A." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Une cada caso con la forma de conseguir el recurso.",
      pasos: [
        {
          consigna: "Une cada caso con la forma de conseguir el recurso.",
          barajar: true,
          destinos: [
            { id: "negociar", nombre: "Negociar con el gerente funcional" },
            { id: "preasignacion", nombre: "Preasignación" },
            { id: "virtual", nombre: "Equipo virtual" },
            { id: "alternativo", nombre: "Recurso alternativo" },
          ],
          items: con("gp-9-3", [
            it("c9h07-04", "El sonidista interno trabaja en el área del gerente de eventos.", "negociar", "Los recursos internos se obtienen de su gerente funcional, negociando."),
            it("c9h07-05", "La propuesta que ganó el patrocinio ya nombraba a la barista campeona.", "preasignacion", "Quedó definida de antemano en la propuesta: preasignación."),
            it("c9h07-06", "El mejor diseñador del afiche vive en Bogotá y no puede viajar.", "virtual", "Trabaja a distancia con tecnología: equipo virtual."),
            it("c9h07-07", "No hay electricista disponible; otro cuesta más, pero está certificado.", "alternativo", "Vale otro recurso si no viola criterios legales o reglamentarios."),
          ]),
        },
        { id: "c9h07-08", subtemas: ["gp-9-3"], barajar: true,
          contexto: "El electricista más caro sube la línea base de costos.",
          consigna: "¿Qué presentas?",
          destinos: [{ id: "cambio", nombre: "Una solicitud de cambio" }, { id: "nada", nombre: "Nada, ya lo contrataste" }, { id: "correo", nombre: "Un correo a logística" }],
          clave: "cambio", retro: "Un cambio a la línea base pasa por control integrado de cambios." },
      ],
    },
  ],
};

/* ─── H08 · La torre de luces (2 etapas) ─── */
const ETAPAS_TUCKMAN = [
  { id: "formacion", nombre: "Formación" },
  { id: "turbulencia", nombre: "Turbulencia" },
  { id: "normalizacion", nombre: "Normalización" },
  { id: "desempeno", nombre: "Desempeño" },
  { id: "disolucion", nombre: "Disolución" },
];
export const GP_C9_H08 = {
  id: "gp26-eje-c09-h08-torre",
  contexto: "El equipo de montaje del festival se juntó hace un mes y ha pasado por altibajos.",
  rol: "Diriges el festival y acompañas al equipo de montaje.",
  consigna: "Ordena las etapas del equipo de abajo arriba.",
  cierre: "Las etapas suelen ir en orden, pero se puede retroceder o saltar.",
  subtemas: ["gp-9-4"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena las etapas del equipo de abajo arriba.",
      pasos: [{
        tipo: "ordenar", id: "c9h08-torre", subtemas: ["gp-9-4"], puntuaPares: true,
        consigna: "Ordena las etapas del equipo de abajo arriba.",
        items: ETAPAS_TUCKMAN.map(({ id, nombre }) => ({ id, texto: nombre })),
        retrosPar: {
          "formacion-turbulencia": "Primero se conocen; luego chocan al empezar el trabajo.",
          "turbulencia-normalizacion": "Tras los choques, ajustan hábitos y empiezan a confiar.",
          "normalizacion-desempeno": "Primero confían; luego funcionan como una unidad.",
          "desempeno-disolucion": "La disolución llega al terminar el trabajo.",
        },
      }],
    },
    {
      tipo: "clasificar",
      consigna: "¿En qué etapa está hoy el equipo?",
      destinos: ETAPAS_TUCKMAN,
      /* 5 escenas + la especial al final; siempre una de retroceso o estancamiento. */
      partida: { n: 5, final: "c9h08-08", alMenosUno: ["c9h08-06", "c9h08-07"] },
      banco: con("gp-9-4", [
        it("c9h08-01", "Primer día: cada uno escucha su rol y casi nadie habla.", "formacion", "Se informan del proyecto y actúan poco abiertos: formación."),
        it("c9h08-02", "Discuten cómo armar la tarima; nadie acepta la idea del otro.", "turbulencia", "Empezar el trabajo sin abrirse a otras ideas es turbulencia."),
        it("c9h08-03", "Acordaron turnos y empiezan a confiar en el trabajo ajeno.", "normalizacion", "Ajustan hábitos y nace la confianza: normalización."),
        it("c9h08-04", "Arman la tarima sin que nadie dé órdenes y se cubren solos.", "desempeno", "Unidad organizada e interdependiente: desempeño."),
        it("c9h08-05", "Terminó el festival: desmontan y vuelven a sus áreas.", "disolucion", "Completan el trabajo y se desligan: disolución."),
        it("c9h08-06", "Entran dos personas nuevas y vuelven las discusiones.", "turbulencia", "Un equipo puede retroceder: volvió la turbulencia."),
        it("c9h08-07", "Llevan tres semanas trabados en la misma pelea.", "turbulencia", "Un equipo puede quedarse estancado en una etapa."),
        { id: "c9h08-08", contexto: "El equipo de taquilla trabajó junto el festival pasado.", consigna: "¿Debe pasar por todas las etapas?",
          destinos: SI_NO, clave: "no", retros: { si: "Si ya trabajaron juntos, pueden saltarse alguna etapa." } },
      ]),
    },
  ],
};

/* ─── H09 · La consola del equipo (2 etapas) ─── */
export const GP_C9_H09 = {
  id: "gp26-eje-c09-h09-consola",
  contexto: "A dos semanas del festival, el equipo rinde menos de lo esperado. Cada área tiene un problema distinto.",
  rol: "Diriges el festival y desarrollas al equipo.",
  consigna: "Sube el control de la herramienta que resuelve el caso.",
  cierre: null,
  subtemas: ["gp-9-4"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Sube el control de la herramienta que resuelve el caso.",
      destinos: [
        { id: "coubicacion", nombre: "Coubicación" },
        { id: "tecnologia", nombre: "Tecnología de la comunicación" },
        { id: "capacitacion", nombre: "Capacitación" },
        { id: "reconocimiento", nombre: "Reconocimiento" },
        { id: "espiritu", nombre: "Espíritu de equipo" },
        { id: "evaluaciones", nombre: "Evaluaciones" },
      ],
      partida: { n: 6 },
      banco: con("gp-9-4", [
        it("c9h09-01", "Taquilla y logística trabajan en sedes distintas y no se coordinan.", "coubicacion", "Juntarlos en un mismo espacio mejora el trabajo en equipo."),
        it("c9h09-02", "El diseñador en Bogotá no se entera de los cambios del afiche.", "tecnologia", "A distancia sirve un portal compartido o videoconferencia."),
        it("c9h09-03", "Nadie sabe usar el nuevo datáfono de la taquilla.", "capacitacion", "Falta una habilidad: se desarrolla con capacitación."),
        it("c9h09-04", "Los baristas repiten el mismo error en cada prueba.", "capacitacion", "Lo observado en pruebas pide capacitación no programada."),
        it("c9h09-05", "El montaje terminó dos días antes y nadie lo mencionó.", "reconocimiento", "El buen desempeño se reconoce, y pronto."),
        it("c9h09-06", "Tras una semana dura, el equipo casi no se habla.", "espiritu", "Actividades para mejorar relaciones: espíritu de equipo."),
        it("c9h09-07", "No sabes en qué es fuerte cada voluntario.", "evaluaciones", "Las evaluaciones muestran fortalezas y debilidades."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "¿Qué la motivaría más?",
      pasos: [
        { id: "c9h09-08", subtemas: ["gp-9-4"], barajar: true, mesa: "equipo",
          contexto: "Una voluntaria sueña con aprender catación. Piensas darle un bono en dinero.",
          consigna: "¿Qué la motivaría más?",
          destinos: [{ id: "curso", nombre: "Un curso de catación" }, { id: "bono", nombre: "El bono" }, { id: "nada", nombre: "Nada" }],
          clave: "curso", retro: "La recompensa funciona si satisface lo que ella valora." },
        { id: "c9h09-09", subtemas: ["gp-9-4"], barajar: true,
          consigna: "¿Cuándo reconoces al equipo de montaje?",
          destinos: [{ id: "ahora", nombre: "Ahora, durante el proyecto" }, { id: "cierre", nombre: "Al cierre del festival" }, { id: "piden", nombre: "Solo si lo piden" }],
          clave: "ahora", retro: "Conviene reconocer durante el proyecto, no esperar al final." },
        { id: "c9h09-10", subtemas: ["gp-9-4"], barajar: true,
          consigna: "¿Qué muestra que el desarrollo del equipo funcionó?",
          destinos: [{ id: "rotacion", nombre: "Baja la rotación del personal" }, { id: "reuniones", nombre: "Hay más reuniones" }, { id: "presupuesto", nombre: "Sube el presupuesto" }],
          clave: "rotacion", retro: "Menos rotación y más cohesión indican un equipo más eficaz." },
      ],
    },
  ],
};

/* ─── H10 · Cinco micrófonos para un choque (3 etapas) ─── */
const MICROFONOS = [
  { id: "retirarse", nombre: "Retirarse / eludir" },
  { id: "suavizar", nombre: "Suavizar / adaptarse" },
  { id: "consensuar", nombre: "Consensuar / conciliar", pista: "a veces perder-perder" },
  { id: "forzar", nombre: "Forzar / dirigir", pista: "ganar-perder" },
  { id: "colaborar", nombre: "Colaborar / resolver", pista: "puede ser ganar-ganar" },
];
export const GP_C9_H10 = {
  id: "gp26-eje-c09-h10-microfonos",
  contexto: "Sonido y baristas pelean por la tarima del sábado a las 4 p. m.: ambos la tienen programada.",
  rol: "Diriges el festival y manejas el conflicto.",
  consigna: "Cuelga cada respuesta en el micrófono de su técnica.",
  cierre: "Cada técnica tiene su lugar: depende de premura, importancia y relación.",
  subtemas: ["gp-9-5"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Cuelga cada respuesta en el micrófono de su técnica.",
      destinos: MICROFONOS,
      /* 5: una por técnica. */
      partida: { porClave: 1 },
      banco: con("gp-9-5", [
        it("c9h10-01", "Dices: lo vemos mañana, cuando tengas el horario completo.", "retirarse", "Posponer para prepararte mejor es retirarse."),
        it("c9h10-02", "Dejas que lo resuelva otro y no te metes.", "retirarse", "Apartarse para que lo resuelvan otros es retirarse."),
        it("c9h10-03", "Destacas en qué coinciden y cedes tu propuesta para calmar.", "suavizar", "Ceder la postura propia por la armonía es suavizar."),
        it("c9h10-04", "Cada área usa la tarima media hora menos de lo pedido.", "consensuar", "Todos ganan algo y pierden algo: consensuar."),
        it("c9h10-05", "Decides tú: la tarima es para sonido y punto.", "forzar", "Imponer tu punto de vista es forzar."),
        it("c9h10-06", "Juntas a ambos, oyes sus razones y arman un horario que sirve a los dos.", "colaborar", "Integrar puntos de vista con diálogo es colaborar."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Elige la técnica que mejor encaja aquí.",
      pasos: [{
        consigna: "Elige la técnica que mejor encaja aquí.",
        destinos: MICROFONOS,
        items: con("gp-9-5", [
          it("c9h10-07", "Viene una tormenta: hay que desalojar la tarima en cinco minutos.", "forzar", "En una emergencia no hay tiempo para dialogar: se impone."),
          it("c9h10-08", "Los dos jefes están furiosos y aún no tienes el horario.", "retirarse", "Conviene posponer para prepararte; resolver así lo empeora."),
          /* Claves 3 y 4: criterio de Gen (la guía da los factores, no la técnica exacta). */
          it("c9h10-09", "Discuten el color de las camisetas; la relación importa más.", "suavizar", "Tema menor y relación valiosa: ceder mantiene la armonía."),
          it("c9h10-10", "Hay tiempo, el tema es clave y quieres una solución duradera.", "colaborar", "Con tiempo e importancia, colaborar busca ganar-ganar duradero."),
        ]),
      }],
    },
    {
      tipo: "micros",
      consigna: "Ordena cómo escala un conflicto en el equipo.",
      pasos: [{
        tipo: "ordenar", id: "c9h10-escala", subtemas: ["gp-9-5"],
        consigna: "Ordena cómo escala un conflicto en el equipo.",
        items: [
          { id: "miembros", texto: "Los miembros intentan resolverlo" },
          { id: "facilitas", texto: "Tú facilitas, pronto y en privado" },
          { id: "formal", texto: "Procedimientos formales, incluso disciplinarios" },
        ],
        retrosPar: {
          "miembros-facilitas": "Los primeros responsables de resolverlo son los miembros.",
          "facilitas-formal": "Antes de lo formal, el director facilita la resolución.",
        },
      }],
    },
  ],
};

/* ─── H11 · Las estibas del sábado (3 etapas) ─── */
const F = FESTIVAL_C9;
export const GP_C9_H11 = {
  id: "gp26-moc-c09-h11-estibas",
  contexto: "Terminó el primer día del festival. En la bodega comparas lo planeado con lo que de verdad se usó.",
  rol: "Diriges el festival y controlas los recursos físicos.",
  consigna: "Calcula la brecha y marca escasez o sobrante.",
  cierre: "Controlar los recursos es comparar plan con uso real y corregir a tiempo.",
  subtemas: ["gp-9-6"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Calcula la brecha y marca escasez o sobrante.",
      pasos: [
        { tipo: "casillas", id: "c9h11-01", subtemas: ["gp-9-6"], estiba: "vasos",
          texto: "Vasos: plan 12.000 para 3 días; el día 1 se usaron 5.000.",
          consigna: "A este ritmo, ¿cuántos usarás en tres días?",
          retro: "5.000 por día × 3 días = 15.000.",
          casillas: [ent("uso", "Vasos en tres días", F.vasos.dia1 * F.vasos.dias, { unidad: "vasos", miles: true })] },
        { tipo: "casillas", id: "c9h11-02", subtemas: ["gp-9-6"], estiba: "vasos",
          texto: "Vasos: plan 12.000; a este ritmo se usarán 15.000.",
          consigna: "¿Cuántos faltarán frente al plan?",
          retro: "15.000 − 12.000 = 3.000 vasos de escasez.",
          casillas: [
            ent("brecha", "Vasos que faltan", F.vasos.dia1 * F.vasos.dias - F.vasos.plan, { unidad: "vasos", miles: true }),
            { id: "tipo", nombre: "La brecha es", opciones: [{ id: "escasez", nombre: "Escasez" }, { id: "sobrante", nombre: "Sobrante" }], clave: "escasez" },
          ] },
        { tipo: "casillas", id: "c9h11-03", subtemas: ["gp-9-6"], estiba: "sillas",
          texto: "Sillas: 800 asignadas; el uso máximo real fue 500.",
          consigna: "¿Cuántas sobran?",
          retro: "800 − 500 = 300 sillas de superávit.",
          casillas: [
            ent("brecha", "Sillas que sobran", F.sillas.plan - F.sillas.real, { unidad: "sillas", miles: true }),
            { id: "tipo", nombre: "La brecha es", opciones: [{ id: "escasez", nombre: "Escasez" }, { id: "sobrante", nombre: "Sobrante" }], clave: "sobrante" },
          ] },
        { id: "c9h11-04", subtemas: ["gp-9-6"], barajar: true, estiba: "sillas",
          consigna: "¿Qué haces con las 300 sillas?",
          destinos: [{ id: "liberar", nombre: "Liberarlas al alquiler" }, { id: "guardar", nombre: "Guardarlas por si acaso" }],
          clave: "liberar", retros: { guardar: "Los recursos se liberan cuando ya no se necesitan." } },
        { id: "c9h11-05", subtemas: ["gp-9-6"], estiba: "hielo",
          contexto: "Hielo: plan 600 bolsas por día; se usaron 600.",
          consigna: "¿Hay brecha?",
          destinos: SI_NO, clave: "no", retros: { si: "Plan y uso real coinciden: no hay que corregir." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Compara las dos salidas y elige la mejor.",
      pasos: [
        { tipo: "casillas", id: "c9h11-06", subtemas: ["gp-9-6"], platillo: "a",
          texto: "A · Pedido urgente: 3.000 vasos × $250 + flete $250.000",
          consigna: "Compara las dos salidas y elige la mejor.",
          retro: "3.000 × 250 = 750.000; más 250.000 de flete.",
          casillas: [ent("costo", "Costo de A", F.urgente.vasos * F.urgente.precio + F.urgente.flete, { unidad: "pesos", miles: true })] },
        { tipo: "casillas", id: "c9h11-07", subtemas: ["gp-9-6"], platillo: "b",
          texto: "B · No pedir: se dejan de vender 3.000 cafés con margen de $2.000",
          consigna: "Compara las dos salidas y elige la mejor.",
          retro: "3.000 cafés × 2.000 de margen = 6.000.000 perdidos.",
          casillas: [ent("costo", "Pérdida de B", F.noPedir.cafes * F.noPedir.margen, { unidad: "pesos", miles: true })] },
        { id: "c9h11-08", subtemas: ["gp-9-6"], platillo: "elegir",
          consigna: "¿Qué salida eliges?",
          destinos: [{ id: "a", nombre: "A · Pedido urgente" }, { id: "b", nombre: "B · No pedir" }],
          clave: "a", retros: { b: "Perder 6 millones cuesta más que pagar 1 millón." } },
        { id: "c9h11-09", subtemas: ["gp-9-6"], barajar: true,
          consigna: "El pedido sube la línea base de costos. ¿Por dónde pasa?",
          destinos: [{ id: "control", nombre: "Control integrado de cambios" }, { id: "solo", nombre: "Lo apruebas tú solo" }],
          clave: "control", retros: { solo: "Un cambio a la línea base solo se aprueba en control integrado." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Ordena los pasos para resolver lo de la planta.",
      pasos: [{
        tipo: "ordenar", id: "c9h11-planta", subtemas: ["gp-9-6"],
        contexto: "La planta eléctrica del escenario no llegó: otro departamento no la liberó.",
        consigna: "Ordena los pasos para resolver lo de la planta.",
        items: [
          { id: "identificar", texto: "Identificar: especificas que falta la planta del escenario." },
          { id: "definir", texto: "Definir: lo divides: ¿quién la tiene y cuándo la suelta?" },
          { id: "investigar", texto: "Investigar: recoges datos; llamas a bodega y al otro departamento." },
          { id: "analizar", texto: "Analizar: causa raíz, nadie pidió liberarla a tiempo." },
          { id: "resolver", texto: "Resolver: eliges negociar su entrega hoy o alquilar otra." },
          { id: "comprobar", texto: "Comprobar: verificas que funcione antes del concierto." },
        ],
        retrosPar: {
          "identificar-definir": "Primero lo especificas; luego lo divides.",
          "investigar-analizar": "Primero recoges datos; luego buscas la causa raíz.",
          "resolver-comprobar": "Después de resolver, compruebas que funcionó.",
        },
        /* Los pares que el diseño no ejemplifica (definir-investigar, analizar-resolver). */
        retro: "Primero entiendes el problema y sus datos; luego decides y compruebas.",
      }],
    },
  ],
};

/* ─── H12 · El rotafolio del practicante (encontrar el error) ─── */
export const GP_C9_H12 = {
  id: "gp26-eje-c09-h12-rotafolio",
  contexto: "El practicante preparó la inducción de los voluntarios del festival. La PMO te pide revisar su rotafolio.",
  rol: "Diriges el festival y revisas el rotafolio.",
  consigna: "Tacha las frases con error y corrígelas.",
  cierre: null,
  subtemas: ["gp-9-6", "gp-9-1", "gp-9-4", "gp-9-5", "gp-9-3"],
  elenco: ["tu", "practicante", "pmo"],
  etapas: [{
    tipo: "memorando",
    consigna: "Tacha las frases con error y corrígelas.",
    membrete: "FESTIVAL ALTAMIRA · INDUCCIÓN DE VOLUNTARIOS",
    papel: "rotafolio",
    entregar: "Devolver el rotafolio",
    partida: { conError: 3, correctas: 3 },
    frases: [
      { id: "c9h12-01", texto: "Controlar los recursos es vigilar a los voluntarios.", error: true, subtema: "gp-9-6",
        buena: "Controla los recursos físicos; a las personas se las dirige.",
        malas: [{ texto: "Es contar el dinero del festival.", retro: "El dinero es de costos; aquí son equipos y materiales." }, { texto: "Es trabajo exclusivo de la PMO.", retro: "Lo hace el equipo de dirección del proyecto." }] },
      { id: "c9h12-02", texto: "El acta del equipo la firma la patrocinadora para autorizar el festival.", error: true, subtema: "gp-9-1",
        buena: "Esa es el acta del proyecto; la del equipo fija sus reglas.",
        malas: [{ texto: "La escribe solo el director.", retro: "Funciona mejor si la desarrolla el equipo." }, { texto: "Es el presupuesto del equipo.", retro: "Trae valores y pautas, no dinero." }] },
      { id: "c9h12-03", texto: "En la RACI, una tarea puede tener varias A.", error: true, subtema: "gp-9-1",
        buena: "Cada tarea tiene una sola A: un dueño inequívoco.",
        malas: [{ texto: "La A es quien ejecuta.", retro: "Ejecutar es R; la A rinde cuentas." }, { texto: "Se puede dejar sin A.", retro: "Sin A nadie responde al final." }] },
      { id: "c9h12-04", texto: "Todo equipo pasa por las cinco etapas, siempre en orden.", error: true, subtema: "gp-9-4",
        buena: "Puede estancarse, retroceder o saltarse alguna etapa.",
        malas: [{ texto: "Solo los equipos malos pasan por turbulencia.", retro: "La turbulencia es una etapa normal." }, { texto: "La disolución es al inicio.", retro: "La disolución llega al terminar el trabajo." }] },
      { id: "c9h12-05", texto: "Forzar nunca se usa en un buen proyecto.", error: true, subtema: "gp-9-5",
        buena: "Tiene su lugar, por ejemplo en una emergencia.",
        malas: [{ texto: "Forzar da ganar-ganar.", retro: "Forzar suele dar ganar-perder." }, { texto: "Forzar es posponer.", retro: "Posponer es retirarse." }] },
      { id: "c9h12-06", texto: "Al voluntario se le reconoce solo al cerrar el festival.", error: true, subtema: "gp-9-4",
        buena: "Conviene reconocer durante el proyecto.",
        malas: [{ texto: "Solo cuenta el dinero.", retro: "Lo intangible puede motivar igual o más." }, { texto: "Nunca se reconoce.", retro: "Reconocer lo bueno es parte de desarrollar al equipo." }] },
      { id: "c9h12-07", texto: "En un entorno matricial, el director manda por su cargo y no necesita influir.", error: true, subtema: "gp-9-5",
        buena: "Con poca autoridad directa, la influencia es vital.",
        malas: [{ texto: "El gerente funcional no cuenta.", retro: "Con él se negocian los recursos internos." }, { texto: "Basta gritar más fuerte.", retro: "Influir es persuadir y escuchar, no imponer." }] },
      { id: "c9h12-08", texto: "Un equipo virtual permite sumar a alguien con movilidad reducida.", error: false, subtema: "gp-9-3",
        retro: "Correcta: es una ventaja de los equipos virtuales." },
      { id: "c9h12-09", texto: "Un recurso alternativo vale si no viola criterios legales.", error: false, subtema: "gp-9-3",
        retro: "Correcta: así lo permite la adquisición de recursos." },
      { id: "c9h12-10", texto: "Un conflicto se aborda pronto y, en general, en privado.", error: false, subtema: "gp-9-5",
        retro: "Correcta: directo, constructivo y cuanto antes." },
      { id: "c9h12-11", texto: "Quien tiene menos experiencia necesita más supervisión.", error: false, subtema: "gp-9-5",
        retro: "Correcta: el estilo se ajusta a la capacidad." },
    ],
  }],
};

export const PIEZAS_TEXTO_C9 = [GP_C9_H01, GP_C9_H02, GP_C9_H03, GP_C9_H04, GP_C9_H05, GP_C9_H06, GP_C9_H07, GP_C9_H08, GP_C9_H09, GP_C9_H10, GP_C9_H11, GP_C9_H12];
