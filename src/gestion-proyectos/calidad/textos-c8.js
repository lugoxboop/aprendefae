/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 8 «GESTIÓN DE LA CALIDAD» — LOS TEXTOS DE LAS
 * 12 HACER (lote 4)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c08-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 *
 * Los datos fijos de la línea de cápsulas (diseño §0) viven en CAPSULAS_C8:
 * los mismos en H07, H08 y el Aprender de Jane. La prueba gp-lote4 recalcula
 * los totales de la hoja de verificación.
 *
 * Módulos y subtemas (gp08-* del diseño → procesos de ../estructura.js):
 *   gp08-calidad-grado, gp08-coq, gp08-niveles, gp08-prevencion (H03),
 *   gp08-planificar → gp-8-1 · gp08-gestionar, gp08-panorama, gp08-auditorias,
 *   gp08-mejora, gp08-herramientas (de representación) → gp-8-2 ·
 *   gp08-controlar, gp08-diagrama-control, gp08-prevencion (H08: términos de
 *   control y muestreo), gp08-tendencias (H12) → gp-8-3.
 *   H01–H04 van en Planificación (8.1); H05, H06, H09, H10 y H11 en Ejecución
 *   (8.2, su proceso principal); H07, H08 y H12 en Monitoreo y Control (8.3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];

/* Los datos fijos de la línea (diseño §0): peso en gramos y la hoja de 4 días. */
export const CAPSULAS_C8 = {
  especificacion: { min: 5.0, max: 6.0 },
  control: { min: 5.2, max: 5.8 },
  media: 5.5,
  defectos: [
    { id: "sello", nombre: "Sello incompleto", dias: [3, 2, 4, 2], total: 11 },
    { id: "peso", nombre: "Peso bajo", dias: [2, 3, 1, 2], total: 8 },
    { id: "abollada", nombre: "Abollada", dias: [1, 1, 2, 1], total: 5 },
    { id: "tapa", nombre: "Tapa mal impresa", dias: [1, 0, 1, 1], total: 3 },
    { id: "filtro", nombre: "Sin filtro", dias: [0, 1, 0, 1], total: 2 },
    { id: "fecha", nombre: "Fecha de lote errónea", dias: [0, 0, 1, 0], total: 1 },
  ],
  total: 30,
};

/* ─── H01 · La góndola de las cápsulas (2 etapas) ─── */
const GONDOLA = [
  { id: "basica-cumple", nombre: "Básica · Cumple" },
  { id: "premium-cumple", nombre: "Premium · Cumple" },
  { id: "basica-no", nombre: "Básica · No cumple" },
  { id: "premium-no", nombre: "Premium · No cumple" },
];
export const GP_C8_H01 = {
  id: "gp26-pla-c08-h01-gondola",
  contexto: "La cadena de supermercados quiere dos líneas de cápsulas: una básica y una premium con más sabores y aroma.",
  rol: "Diriges el proyecto de la nueva línea de cápsulas.",
  consigna: "Pon cada lote de prueba en su casilla de la góndola.",
  cierre: "Calidad es cumplir requisitos; grado es cuántas características técnicas tiene.",
  subtemas: ["gp-8-1"],
  elenco: ["tu", "cliente", "gerente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada lote de prueba en su casilla de la góndola.",
      destinos: GONDOLA,
      /* 6 de 8, al menos una por casilla. */
      partida: { n: 6, cubrir: true },
      banco: con("gp-8-1", [
        it("c8h01-01", "Básica, un sabor, ninguna falla en 500 pruebas.", "basica-cumple", "Pocas funciones, pero sin defectos: bajo grado, alta calidad."),
        it("c8h01-02", "Básica con sello perfecto en todas las pruebas.", "basica-cumple", "Grado bajo no es defecto: cumple lo pedido."),
        it("c8h01-03", "Premium, cinco sabores, sin fallas.", "premium-cumple", "Más funciones y además cumple los requisitos."),
        it("c8h01-04", "Premium con empaque de lujo y peso siempre correcto.", "premium-cumple", "Alto grado que cumple: alta calidad."),
        it("c8h01-05", "Premium, cinco sabores; una de cada diez se filtra.", "premium-no", "Muchas funciones con muchos defectos: alto grado, baja calidad."),
        it("c8h01-06", "Premium con aroma extra que se pierde en una semana.", "premium-no", "Promete más, pero no cumple lo prometido: baja calidad."),
        it("c8h01-07", "Básica que se atasca en la cafetera.", "basica-no", "Pocas funciones y además no cumple: baja calidad."),
        it("c8h01-08", "Básica con la fecha de lote mal impresa en la mitad.", "basica-no", "Un defecto de rotulado es incumplir un requisito."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Toca las casillas que son un problema.",
      pasos: [
        { tipo: "casillas", id: "c8h01-09", subtemas: ["gp-8-1"],
          consigna: "Toca las casillas que son un problema.",
          casillas: [{ id: "problemas", nombre: "Casillas con problema", marcar: true, clave: ["basica-no", "premium-no"],
            opciones: [
              { id: "basica-cumple", nombre: "Básica · Cumple", retro: "Bajo grado puede servir para uso general: no es problema." },
              { id: "premium-cumple", nombre: "Premium · Cumple", retro: "Alto grado que cumple: alta calidad." },
              { id: "basica-no", nombre: "Básica · No cumple", retro: "No cumplir requisitos siempre es problema, sea cual sea el grado." },
              { id: "premium-no", nombre: "Premium · No cumple", retro: "Alto grado con baja calidad siempre es un problema." },
            ] }] },
        { id: "c8h01-10", subtemas: ["gp-8-1"], mesa: "gerente",
          contexto: "El gerente de la planta dice: «La básica es de mala calidad porque tiene un solo sabor».",
          consigna: "¿Tiene razón?",
          destinos: SI_NO, clave: "no", retros: { si: "Un sabor es grado bajo; calidad es cumplir los requisitos." } },
      ],
    },
  ],
};

/* ─── H02 · Las cuatro cubetas (2 etapas) ─── */
const CUBETAS = [
  { id: "prevencion", nombre: "Prevención", pista: "conformidad" },
  { id: "evaluacion", nombre: "Evaluación", pista: "conformidad" },
  { id: "internas", nombre: "Fallas internas", pista: "no conformidad" },
  { id: "externas", nombre: "Fallas externas", pista: "no conformidad" },
];
export const GP_C8_H02 = {
  id: "gp26-pla-c08-h02-cubetas",
  contexto: "La patrocinadora quiere saber cuánto cuesta la calidad de la línea de cápsulas. Llegan facturas de todo tipo.",
  rol: "Diriges la línea y ordenas los costos de calidad.",
  consigna: "Echa cada factura en su cubeta del costo de la calidad.",
  cierre: null,
  subtemas: ["gp-8-1"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Echa cada factura en su cubeta del costo de la calidad.",
      destinos: CUBETAS,
      partida: { porClave: 2 },
      banco: con("gp-8-1", [
        it("c8h02-01", "Curso de la selladora para los operarios.", "prevencion", "Capacitar evita fallas: es costo de prevención."),
        it("c8h02-02", "Escribir el procedimiento de llenado.", "prevencion", "Documentar procesos previene defectos."),
        it("c8h02-03", "Comprar una selladora más precisa.", "prevencion", "Los equipos que evitan fallas son prevención."),
        it("c8h02-04", "Una hora más por turno para hacerlo bien.", "prevencion", "Tiempo para hacerlo correctamente: prevención."),
        it("c8h02-05", "Pruebas de hermeticidad de cada lote.", "evaluacion", "Probar la conformidad es costo de evaluación."),
        it("c8h02-06", "Cápsulas que se rompen en la prueba de presión.", "evaluacion", "Pérdida en pruebas destructivas: es evaluación, no falla."),
        it("c8h02-07", "Salario del inspector de la línea.", "evaluacion", "Inspeccionar es evaluar la calidad."),
        it("c8h02-08", "Rellenar un lote que salió con poco café.", "internas", "Retrabajo detectado por el proyecto: falla interna."),
        it("c8h02-09", "Botar 2.000 cápsulas mal selladas.", "internas", "Desecho hallado antes de enviar: falla interna."),
        it("c8h02-10", "Reponer cajas devueltas por el supermercado.", "externas", "Trabajo en garantía: el cliente encontró la falla."),
        it("c8h02-11", "El supermercado deja de comprar la premium.", "externas", "Pérdida de negocio por fallas: costo externo."),
        it("c8h02-12", "Quejas que aparecen en la encuesta a compradores.", "externas", "Defectos hallados en encuestas cuentan como falla externa."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Mira las cubetas llenas y responde.",
      pasos: [
        { tipo: "casillas", id: "c8h02-13", subtemas: ["gp-8-1"],
          consigna: "Toca las cubetas que son costos de conformidad.",
          casillas: [{ id: "conformidad", nombre: "Costos de conformidad", marcar: true, clave: ["prevencion", "evaluacion"],
            retro: "Conformidad es lo que se gasta para evitar fallas.",
            opciones: CUBETAS.map(({ id, nombre }) => ({ id, nombre })) }] },
        { id: "c8h02-14", subtemas: ["gp-8-1"], desborda: true, revela: true,
          despues: "La cubeta de Evaluación se desborda; la de fallas casi no baja.",
          contexto: "El equipo propone duplicar las inspecciones, y luego duplicarlas otra vez.",
          consigna: "¿Siempre compensa seguir invirtiendo?",
          destinos: SI_NO, clave: "no", retros: { si: "Hay un costo óptimo: pasado ese punto, más evaluación no compensa." } },
        { id: "c8h02-15", subtemas: ["gp-8-1"], barajar: true,
          consigna: "¿Quién suele cuidar este costo cuando el proyecto termina?",
          destinos: [{ id: "operaciones", nombre: "Operaciones, PMO, programa o portafolio" }, { id: "equipo", nombre: "El equipo del proyecto" }, { id: "nadie", nombre: "Nadie" }],
          clave: "operaciones", retros: { equipo: "El proyecto es temporal; el producto sigue con otros.", nadie: "Alguien sí: el producto sigue vivo tras el proyecto." } },
      ],
    },
  ],
};

/* ─── H03 · El ascensor de cinco pisos (2 etapas) ─── */
export const GP_C8_H03 = {
  id: "gp26-pla-c08-h03-ascensor",
  contexto: "La planta discute cómo manejar los defectos de las cápsulas. Hay cinco maneras, de la más cara a la más eficaz.",
  rol: "Diriges la línea y propones el nivel de calidad.",
  consigna: "Ordena los cinco niveles, del más caro al más eficaz.",
  cierre: null,
  subtemas: ["gp-8-1"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Ordena los cinco niveles, del más caro al más eficaz.",
      pasos: [{
        tipo: "ordenar", id: "c8h03-pisos", subtemas: ["gp-8-1"], puntuaPares: true,
        consigna: "Ordena los cinco niveles, del más caro al más eficaz.",
        items: [
          { id: "cliente", texto: "El cliente encuentra los defectos." },
          { id: "detectar", texto: "Detectar y corregir antes de enviar." },
          { id: "proceso", texto: "Corregir el proceso con aseguramiento de calidad." },
          { id: "diseno", texto: "Incorporar la calidad en el diseño." },
          { id: "cultura", texto: "Cultura de calidad en toda la organización." },
        ],
        retrosPar: {
          "cliente-detectar": "Que el cliente los halle es lo más caro: garantías y reputación.",
          "detectar-proceso": "Corregir defectos sueltos rinde menos que corregir el proceso.",
          "proceso-diseno": "Diseñar con calidad va más allá de corregir el proceso.",
          "diseno-cultura": "La cultura de toda la organización es el nivel más eficaz.",
        },
      }],
    },
    {
      tipo: "clasificar",
      consigna: "¿Prevención o inspección?",
      destinos: [
        { id: "prevencion", nombre: "Prevención", pista: "evita el error en el proceso" },
        { id: "inspeccion", nombre: "Inspección", pista: "evita que llegue al cliente" },
      ],
      partida: { todas: true },
      banco: con("gp-8-1", [
        it("c8h03-01", "Calibrar la selladora antes de cada turno.", "prevencion", "Evita que el error ocurra en el proceso."),
        it("c8h03-02", "Diseñar la cápsula para que no se llene de más.", "prevencion", "La calidad queda incorporada en el diseño."),
        it("c8h03-03", "Capacitar al turno nuevo antes de empezar.", "prevencion", "Prevenir errores cuesta menos que corregirlos."),
        it("c8h03-04", "Revisar las cajas antes de despacharlas.", "inspeccion", "Evita que el error llegue al cliente."),
        it("c8h03-05", "Pesar cápsulas al final de la línea.", "inspeccion", "Detecta el error ya hecho, antes del cliente."),
        it("c8h03-06", "Probar el sellado de una muestra del lote.", "inspeccion", "Revisa el producto terminado: inspección."),
      ]),
      despues: { id: "c8h03-07", subtemas: ["gp-8-1"], barajar: true,
        consigna: "¿Cuál suele costar menos, en general?",
        destinos: [{ id: "prevencion", nombre: "Prevención" }, { id: "inspeccion", nombre: "Inspección" }],
        clave: "prevencion", retro: "Prevenir cuesta mucho menos que corregir lo que halla la inspección." },
    },
  ],
};

/* ─── H04 · El plano de la cápsula (2 etapas) ─── */
export const GP_C8_H04 = {
  id: "gp26-pla-c08-h04-plano",
  contexto: "Antes de producir, la patrocinadora pide el plan de gestión de la calidad de la línea de cápsulas.",
  rol: "Diriges la línea y redactas el plan de calidad.",
  consigna: "Lleva cada frase a su sección del plan.",
  cierre: null,
  subtemas: ["gp-8-1"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada frase a su sección del plan.",
      destinos: [
        { id: "estandares", nombre: "Estándares" },
        { id: "objetivos", nombre: "Objetivos" },
        { id: "roles", nombre: "Roles" },
        { id: "revisa", nombre: "Qué se revisa" },
        { id: "actividades", nombre: "Actividades" },
        { id: "herramientas", nombre: "Herramientas" },
        { id: "procedimientos", nombre: "Procedimientos" },
      ],
      partida: { todas: true },
      banco: con("gp-8-1", [
        it("c8h04-01", "Se aplica la norma sanitaria de alimentos envasados.", "estandares", "Es el estándar de calidad que usará el proyecto."),
        it("c8h04-02", "Menos de 2 cápsulas defectuosas por cada 1.000.", "objetivos", "Es una meta: objetivo de calidad del proyecto."),
        it("c8h04-03", "La ingeniera de calidad firma la liberación de cada lote.", "roles", "Dice quién responde por la calidad: roles y responsabilidades."),
        it("c8h04-04", "Se revisan el sellado y el peso de cada lote.", "revisa", "Lista entregables y procesos sujetos a revisión."),
        it("c8h04-05", "Inspección diaria y auditoría cada mes.", "actividades", "Son las actividades de control y de gestión previstas."),
        it("c8h04-06", "Se usarán hojas de verificación y diagramas de control.", "herramientas", "Son las herramientas de calidad del proyecto."),
        it("c8h04-07", "Qué hacer con un lote no conforme.", "procedimientos", "Abordar la no conformidad es un procedimiento del plan."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Une cada atributo con la forma de verificarlo.",
      pasos: [
        /* Clave de pares: criterio de Gen (la guía da los atributos, no la forma). */
        { grupo: "metricas", barajar: true, barajarDestinos: true, consigna: "Une cada atributo con la forma de verificarlo.",
          destinos: [
            { id: "conteo", nombre: "Conteo en la hoja de verificación del lote" },
            { id: "pesaje", nombre: "Pesaje de una muestra al azar cada hora" },
            { id: "encuesta", nombre: "Encuesta trimestral de 1 a 5" },
            { id: "minutos", nombre: "Minutos de parada registrados cada mes" },
          ],
          items: con("gp-8-1", [
            { id: "c8h04-08", texto: "Defectos por cada 1.000 cápsulas.", clave: "conteo", retro: "Los defectos se cuentan al inspeccionar el lote." },
            { id: "c8h04-09", texto: "Peso de café por cápsula.", clave: "pesaje", retro: "El peso se verifica midiendo una muestra." },
            { id: "c8h04-10", texto: "Satisfacción del supermercado.", clave: "encuesta", retro: "La satisfacción se obtiene preguntando al cliente." },
            { id: "c8h04-11", texto: "Tiempo de inactividad de la selladora.", clave: "minutos", retro: "El tiempo parado se registra en minutos por mes." },
          ]) },
        { id: "c8h04-12", subtemas: ["gp-8-1"], barajar: true,
          consigna: "¿Cuándo se fija el tamaño de la muestra?",
          destinos: [{ id: "planificar", nombre: "Al planificar la calidad" }, { id: "inspeccionar", nombre: "Al inspeccionar cada lote" }, { id: "queja", nombre: "Cuando el cliente se queje" }],
          clave: "planificar", retros: { inspeccionar: "Frecuencia y tamaño de muestra se deciden al planificar.", queja: "Esperar quejas es dejar que el cliente halle los defectos." } },
      ],
    },
  ],
};

/* ─── H05 · Tres casilleros (2 etapas) ─── */
const tarea = (id, texto, clave, retro) => it(id, texto, clave, retro, { subtemas: [{ planificar: "gp-8-1", gestionar: "gp-8-2", controlar: "gp-8-3" }[clave]] });
export const GP_C8_H05 = {
  id: "gp26-eje-c08-h05-casilleros",
  contexto: "Arranca la producción de prueba. Llegan tareas de calidad mezcladas y el gerente de la planta pregunta a qué proceso pertenece cada una.",
  rol: "Diriges la línea y asignas cada tarea a su proceso.",
  consigna: "Guarda cada tarea en el casillero de su proceso.",
  cierre: null,
  subtemas: ["gp-8-1", "gp-8-2", "gp-8-3"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Guarda cada tarea en el casillero de su proceso.",
      destinos: [
        { id: "planificar", nombre: "Planificar la Calidad", pista: "plano enrollado" },
        { id: "gestionar", nombre: "Gestionar la Calidad", pista: "engranaje: el proceso" },
        { id: "controlar", nombre: "Controlar la Calidad", pista: "báscula: el resultado" },
      ],
      /* 8 de 11, 2 o 3 por casillero. */
      partida: { n: 8, minPorClave: 2 },
      banco: [
        tarea("c8h05-01", "Elegir la norma sanitaria que aplicará.", "planificar", "Identificar estándares es planificar la calidad."),
        tarea("c8h05-02", "Decidir cómo y con qué muestra se inspeccionará.", "planificar", "Planificar pruebas e inspección va en Planificar."),
        tarea("c8h05-03", "Definir la métrica de defectos por cada 1.000.", "planificar", "Las métricas de calidad salen de Planificar."),
        tarea("c8h05-04", "Auditar si el turno sigue el procedimiento de sellado.", "gestionar", "Revisar el uso de los procesos es gestionar: aseguramiento."),
        tarea("c8h05-05", "Cambiar el proceso de sellado para que deje de fallar.", "gestionar", "Mejorar el proceso es parte de gestionar la calidad."),
        tarea("c8h05-06", "Convertir los requisitos en listas de verificación de prueba.", "gestionar", "Gestionar crea los instrumentos de prueba y evaluación."),
        tarea("c8h05-07", "Emitir el informe de calidad con recomendaciones.", "gestionar", "Los informes de calidad son salida de Gestionar."),
        tarea("c8h05-08", "Inspeccionar el lote 12 y anotar los resultados.", "controlar", "Examinar el producto y registrar es controlar."),
        tarea("c8h05-09", "Pesar la muestra del turno contra el requisito.", "controlar", "Medir resultados contra requisitos es controlar."),
        tarea("c8h05-10", "Verificar que la reparación aprobada de la selladora quedó bien.", "controlar", "Verificar cambios aprobados es tarea de Controlar."),
        tarea("c8h05-11", "Entregar las cápsulas verificadas para su aceptación.", "controlar", "Los entregables verificados salen de Controlar."),
      ],
    },
    {
      tipo: "micros",
      consigna: "Responde al gerente de la planta.",
      pasos: [
        { id: "c8h05-12", subtemas: ["gp-8-2"], barajar: true, mesa: "gerente",
          consigna: "¿Quién gestiona la calidad en el proyecto?",
          destinos: [{ id: "todos", nombre: "Todos: tú, equipo, patrocinadora, dirección y cliente" }, { id: "area", nombre: "Solo el área de calidad" }, { id: "tu", nombre: "Solo tú" }],
          clave: "todos", retros: { area: "La guía la llama trabajo de todos, no de un área.", tu: "Diriges, pero gestionar la calidad es de todos." } },
        { id: "c8h05-13", subtemas: ["gp-8-2"], barajar: true,
          consigna: "¿Gestionar la calidad es costo de conformidad o de falla?",
          destinos: [{ id: "conformidad", nombre: "Conformidad" }, { id: "falla", nombre: "Falla" }],
          clave: "conformidad", retros: { falla: "Gestionar evita fallas: es trabajo de conformidad." } },
        { id: "c8h05-14", subtemas: ["gp-8-2"], barajar: true,
          consigna: "¿Gestionar mira sobre todo el proceso o el producto?",
          destinos: [{ id: "proceso", nombre: "El proceso" }, { id: "producto", nombre: "El producto terminado" }],
          clave: "proceso", retros: { producto: "El aseguramiento se centra en los procesos; controlar mira resultados." } },
      ],
    },
  ],
};

/* ─── H06 · La espina de pescado (2 etapas) ─── */
const porque = (id, paso, buena, malas) => ({
  id, subtemas: ["gp-8-2"], barajar: true, porque: paso,
  consigna: "Pregunta «¿por qué?» hasta llegar a la causa raíz.",
  contexto: ["¿Por qué salen mal selladas?", "¿Por qué baja de noche?", "¿Por qué se descalibra?"][paso - 1],
  destinos: [{ id: "buena", nombre: buena }, ...malas.map(([nombre], k) => ({ id: `mala${k + 1}`, nombre }))],
  clave: "buena", retros: Object.fromEntries(malas.map(([, retro], k) => [`mala${k + 1}`, retro])),
});
export const GP_C8_H06 = {
  id: "gp26-eje-c08-h06-espina",
  contexto: "Esta semana salieron muchas cápsulas mal selladas. El equipo reúne posibles causas en la sala de juntas de la planta.",
  rol: "Diriges la línea y guías el análisis de causas.",
  consigna: "Cuelga cada causa en su espina del diagrama.",
  cierre: null,
  subtemas: ["gp-8-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Cuelga cada causa en su espina del diagrama.",
      destinos: [
        { id: "material", nombre: "Material" },
        { id: "entorno", nombre: "Entorno" },
        { id: "gestion", nombre: "Gestión" },
        { id: "personas", nombre: "Personas" },
        { id: "proceso", nombre: "Proceso" },
        { id: "equipos", nombre: "Equipos" },
      ],
      /* 8 de 11: al menos 5 espinas distintas, ninguna con más de 2. Clave: criterio de Gen. */
      partida: { n: 8, maxPorClave: 2, minClaves: 5 },
      banco: con("gp-8-2", [
        it("c8h06-01", "La lámina de aluminio llegó de baja calidad.", "material", "Es la materia prima: rama Material."),
        it("c8h06-02", "El filtro viene más delgado de lo pedido.", "material", "Un insumo fuera de especificación va en Material."),
        it("c8h06-03", "La sala de empaque tiene mucha humedad.", "entorno", "Las condiciones del lugar van en Entorno."),
        it("c8h06-04", "Hace demasiado calor junto a la selladora.", "entorno", "Es una condición física del sitio: Entorno."),
        it("c8h06-05", "No hay presupuesto para mantenimiento preventivo.", "gestion", "Es una decisión de la dirección: Gestión."),
        it("c8h06-06", "Las metas premian velocidad, no sellos bien hechos.", "gestion", "Lo que la dirección exige y premia va en Gestión."),
        it("c8h06-07", "El turno de noche llega cansado.", "personas", "La fatiga del trabajador va en Personas."),
        it("c8h06-08", "Nadie capacitó al turno en la selladora nueva.", "personas", "La falta de capacitación es de Personas."),
        it("c8h06-09", "El procedimiento fija mal la temperatura de sellado.", "proceso", "Es el método de trabajo: rama Proceso."),
        it("c8h06-10", "La selladora tiene poco mantenimiento.", "equipos", "Es el estado de la máquina: rama Equipos."),
        it("c8h06-11", "La selladora usa tecnología antigua.", "equipos", "La tecnología de la máquina va en Equipos."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Pregunta «¿por qué?» hasta llegar a la causa raíz.",
      pasos: [
        porque("c8h06-12", 1, "La temperatura de sellado baja de noche.", [["Hay demasiadas cápsulas", "El volumen no explica por qué falla el sello."], ["El cliente es exigente", "La exigencia no causa el defecto; busca en el proceso."]]),
        porque("c8h06-13", 2, "El termostato de la selladora se descalibra.", [["Los operarios no ven bien", "Ver no cambia la temperatura de la máquina."], ["La lámina es otra de noche", "Es la misma lámina en todos los turnos."]]),
        porque("c8h06-14", 3, "No hay plan de mantenimiento preventivo.", [["El termostato es nuevo", "Uno nuevo también se descalibra sin mantenimiento."], ["Es mala suerte", "Sin causa no hay solución; sigue preguntando."]]),
        { id: "c8h06-15", subtemas: ["gp-8-2"], barajar: true,
          consigna: "Si eliminas todas las causas raíz, ¿qué pasa?",
          destinos: [{ id: "norepite", nombre: "El problema no se repite" }, { id: "poco", nombre: "Bajan un poco los defectos" }, { id: "mas", nombre: "Hay que inspeccionar más" }],
          clave: "norepite", retros: { poco: "Sin causas raíz, el problema no vuelve: no solo baja.", mas: "Quitar la causa raíz evita el defecto; no exige más inspección." } },
      ],
    },
  ],
};

/* ─── H07 · La hoja de anotaciones (2 etapas) ─── */
const FILAS = CAPSULAS_C8.defectos.map(({ id, nombre }) => ({ id, nombre }));
const RETRO_FILA = {
  sello: "El borde quedó abierto: es sello incompleto.",
  peso: "Pesa 4,8 g, bajo lo pedido: peso bajo.",
  abollada: "Tiene el cuerpo hundido: va en abollada.",
  tapa: "El logo salió corrido: tapa mal impresa.",
  filtro: "Se ve vacía por dentro: le falta el filtro.",
};
const capsula = (id, texto, clave) => it(id, texto, clave, RETRO_FILA[clave], { subtemas: ["gp-8-3"] });
export const GP_C8_H07 = {
  id: "gp26-moc-c08-h07-hoja",
  contexto: "Cuarto día de inspección de la línea. Ya hay tres días anotados en la hoja; hoy salen siete cápsulas defectuosas.",
  rol: "Diriges la línea y llevas el registro de defectos.",
  consigna: "Anota cada cápsula defectuosa en su fila de hoy.",
  cierre: null,
  subtemas: ["gp-8-3", "gp-8-2"],
  elenco: ["tu", "equipo", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Anota cada cápsula defectuosa en su fila de hoy.",
      destinos: FILAS,
      partida: { todas: true },
      banco: [
        capsula("c8h07-01", "Cápsula 1 · el borde del sello quedó abierto.", "sello"),
        capsula("c8h07-02", "Cápsula 2 · el sello no cerró en una esquina.", "sello"),
        capsula("c8h07-03", "Cápsula 3 · la báscula marca 4,8 g.", "peso"),
        capsula("c8h07-04", "Cápsula 4 · también pesa 4,8 g.", "peso"),
        capsula("c8h07-05", "Cápsula 5 · tiene el cuerpo hundido.", "abollada"),
        capsula("c8h07-06", "Cápsula 6 · el logo de la tapa salió corrido.", "tapa"),
        capsula("c8h07-07", "Cápsula 7 · se ve vacía por dentro.", "filtro"),
      ],
      despues: { tipo: "casillas", id: "c8h07-08", subtemas: ["gp-8-3"], totales: true,
        consigna: "Suma los totales de cada fila.",
        casillas: CAPSULAS_C8.defectos.map((d) => ({ id: d.id, nombre: d.nombre, clave: d.total,
          retro: `${d.nombre}: ${d.dias.join(" + ")} = ${d.total}.` })) },
    },
    {
      tipo: "micros",
      consigna: "Arma el histograma de causas, de la más frecuente a la menos.",
      pasos: [
        { tipo: "ordenar", id: "c8h07-histograma", subtemas: ["gp-8-2"], puntuaPares: true,
          consigna: "Arma el histograma de causas, de la más frecuente a la menos.",
          items: CAPSULAS_C8.defectos.map((d) => ({ id: d.id, texto: `${d.nombre} · ${d.total}`, total: d.total })),
          retro: "Ordena por total: sello 11, peso 8, abollada 5…" },
        { id: "c8h07-09", subtemas: ["gp-8-2"], barajar: true,
          consigna: "¿Qué defecto atacas primero?",
          destinos: [{ id: "sello", nombre: "Sello incompleto" }, { id: "peso", nombre: "Peso bajo" }, { id: "fecha", nombre: "Fecha de lote errónea" }],
          clave: "sello", retro: "Es el más frecuente: 11 de 30 defectos." },
        { id: "c8h07-10", subtemas: ["gp-8-3"], mesa: "practicante",
          contexto: "El practicante llama «lista de verificación» a esta hoja.",
          consigna: "¿Tiene razón?",
          destinos: SI_NO, clave: "no", retros: { si: "La lista comprueba pasos; la hoja anota frecuencias de defectos." } },
      ],
    },
  ],
};

/* ─── H08 · La pantalla de la selladora (2 etapas; 10 + 4) ─── */
const LIMITES = [
  { id: "use", nombre: "Límite superior de especificación" },
  { id: "usc", nombre: "Límite superior de control" },
  { id: "lic", nombre: "Límite inferior de control" },
  { id: "lie", nombre: "Límite inferior de especificación" },
];
const linea8 = (id, valor, clave, retro) => ({ id, subtemas: ["gp-8-3"], linea: valor, texto: `La línea de ${String(valor).replace(".", ",")} g`,
  consigna: "Pon el nombre a cada una de las cuatro líneas.", destinos: LIMITES, clave, retro });
const PALANCAS = [
  { id: "seguir", nombre: "Seguir: proceso estable" },
  { id: "investigar", nombre: "Investigar: fuera de control, aunque cumple" },
  { id: "separar", nombre: "Separar las no conformes e investigar" },
];
export const GP_C8_H08 = {
  id: "gp26-moc-c08-h08-monitor",
  contexto: "Cada cápsula debe llevar entre 5,0 y 6,0 gramos de café, según el cliente. La selladora grafica el peso de cada muestra.",
  rol: "Diriges la línea y vigilas si el proceso es estable.",
  consigna: "Pon el nombre a cada una de las cuatro líneas.",
  cierre: null,
  subtemas: ["gp-8-3"],
  elenco: ["tu", "gerente"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Pon el nombre a cada una de las cuatro líneas.",
      pasos: [
        linea8("c8h08-01", 6.0, "use", "El 6,0 lo fija el cliente: es especificación."),
        linea8("c8h08-02", 5.8, "usc", "El 5,8 sale del cálculo del proceso: es control."),
        linea8("c8h08-03", 5.2, "lic", "Calculado del proceso estable: límite inferior de control."),
        linea8("c8h08-04", 5.0, "lie", "El mínimo que pide el cliente: límite de especificación."),
        { grupo: "terminos", barajar: true, consigna: "Lleva cada definición a su término.",
          destinos: [{ id: "tolerancia", nombre: "Tolerancia" }, { id: "control", nombre: "Límite de control" }],
          items: con("gp-8-3", [
            { id: "c8h08-05", texto: "Rango de resultados aceptables.", clave: "tolerancia", retro: "El rango aceptable para el resultado es la tolerancia." },
            { id: "c8h08-06", texto: "Frontera de la variación normal del proceso.", clave: "control", retro: "La variación normal de un proceso estable la marca el control." },
          ]) },
        { grupo: "muestreo", barajar: true, consigna: "¿Muestreo por atributos o por variable?",
          destinos: [{ id: "variable", nombre: "Por variable" }, { id: "atributos", nombre: "Por atributos" }],
          items: con("gp-8-3", [
            { id: "c8h08-07", texto: "Peso en gramos.", clave: "variable", retro: "Se mide en una escala continua: por variable." },
            { id: "c8h08-08", texto: "Temperatura en grados.", clave: "variable", retro: "Se mide en una escala continua: por variable." },
            { id: "c8h08-09", texto: "Sella o no sella.", clave: "atributos", retro: "Solo conforme o no conforme: por atributos." },
            { id: "c8h08-10", texto: "Tapa bien impresa: sí o no.", clave: "atributos", retro: "Solo conforme o no conforme: por atributos." },
          ]) },
      ],
    },
    {
      tipo: "micros",
      consigna: "Lee la pantalla de cada turno y decide.",
      pasos: [
        { id: "c8h08-11", subtemas: ["gp-8-3"], turno: "A", puntos: [5.4, 5.6, 5.3, 5.7, 5.5, 5.4], revela: true, despues: "La línea sigue.",
          consigna: "Lee la pantalla de cada turno y decide.", texto: "Turno A · todos los puntos entre 5,2 y 5,8",
          destinos: PALANCAS, clave: "seguir",
          retros: { investigar: "Todo cae dentro de los límites de control: proceso estable.", separar: "Todo cumple la especificación: no hay qué separar." } },
        { id: "c8h08-12", subtemas: ["gp-8-3"], turno: "B", puntos: [5.5, 5.3, 5.9, 5.6, 5.4, 5.5], revela: true, despues: "Se enciende la baliza: hay que investigar el proceso.",
          consigna: "Lee la pantalla de cada turno y decide.", texto: "Turno B · un punto en 5,9",
          destinos: PALANCAS, clave: "investigar",
          retros: { seguir: "Salió de los límites de control: el proceso no está estable.", separar: "5,9 cumple el requisito; el aviso es del proceso." } },
        { id: "c8h08-13", subtemas: ["gp-8-3"], turno: "C", puntos: [5.4, 5.6, 6.1, 5.5, 5.3, 5.6], revela: true, despues: "Se aparta la caja de esa muestra y se investiga.",
          consigna: "Lee la pantalla de cada turno y decide.", texto: "Turno C · un punto en 6,1",
          destinos: PALANCAS, clave: "separar",
          retros: { seguir: "6,1 supera la especificación: esa cápsula no cumple.", investigar: "Además de investigar, esa cápsula no cumple el requisito." } },
        { id: "c8h08-14", subtemas: ["gp-8-3"],
          consigna: "¿Sirve un diagrama de control para la variación del costo?",
          destinos: SI_NO, clave: "si", retros: { no: "También sirve para costo, cronograma y cambios de alcance." } },
      ],
    },
  ],
};

/* ─── H09 · El tablero de herramientas (8 de 12) ─── */
const HERRAMIENTAS = [
  { id: "dispersion", nombre: "Dispersión" },
  { id: "histograma", nombre: "Histograma" },
  { id: "causa", nombre: "Causa y efecto" },
  { id: "flujo", nombre: "Flujo" },
  { id: "afinidad", nombre: "Afinidad" },
  { id: "matricial", nombre: "Matricial" },
  { id: "hoja", nombre: "Hoja de verificación" },
  { id: "lista", nombre: "Lista de verificación" },
  { id: "muestreo", nombre: "Muestreo estadístico" },
  { id: "encuesta", nombre: "Encuesta" },
  { id: "comparativo", nombre: "Estudio comparativo" },
  { id: "sipoc", nombre: "SIPOC" },
];
const pregunta = (id, texto, clave, retro, subtema) => it(id, texto, clave, retro, { subtemas: [subtema] });
export const GP_C8_H09 = {
  id: "gp26-eje-c08-h09-tablero",
  contexto: "El equipo de la planta tiene preguntas de calidad y un tablero lleno de herramientas. Cada pregunta pide una distinta.",
  rol: "Diriges la línea y entregas la herramienta adecuada.",
  consigna: "Cuelga cada pregunta en la herramienta que la responde.",
  cierre: null,
  subtemas: ["gp-8-2", "gp-8-3", "gp-8-1"],
  elenco: ["tu", "practicante"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Cuelga cada pregunta en la herramienta que la responde.",
    destinos: HERRAMIENTAS,
    /* 8 de 12: siempre Dispersión y Hoja de verificación; las demás sorteadas. */
    partida: { n: 6, siempre: ["c8h09-01", "c8h09-07"] },
    banco: [
      pregunta("c8h09-01", "¿La humedad de la sala se relaciona con los sellos malos?", "dispersion", "Relación entre dos variables: diagrama de dispersión.", "gp-8-2"),
      pregunta("c8h09-02", "¿Cuántos defectos tuvo cada tipo de cápsula?", "histograma", "Cuenta defectos por categoría: histograma.", "gp-8-2"),
      pregunta("c8h09-03", "¿Qué causas podrían explicar los sellos malos?", "causa", "Desglosa las causas de un problema: espina de pescado.", "gp-8-2"),
      pregunta("c8h09-04", "¿En qué paso del empaque aparece el defecto?", "flujo", "Muestra la serie de pasos que lleva al defecto.", "gp-8-2"),
      pregunta("c8h09-05", "Tenemos 40 causas sueltas: ¿cómo agruparlas?", "afinidad", "Agrupa causas posibles en familias: diagrama de afinidad.", "gp-8-2"),
      pregunta("c8h09-06", "¿Qué tan fuerte se relacionan 5 causas con 3 objetivos?", "matricial", "Fuerza de relación entre filas y columnas: matricial.", "gp-8-2"),
      pregunta("c8h09-07", "Hay que anotar los defectos mientras se inspecciona.", "hoja", "Anotar frecuencias al inspeccionar: hoja de verificación.", "gp-8-3"),
      pregunta("c8h09-08", "¿Se hicieron los 12 pasos del arranque?", "lista", "Comprobar pasos cumplidos: lista de verificación.", "gp-8-3"),
      pregunta("c8h09-09", "No se pueden revisar las 5.000: ¿cuántas tomamos?", "muestreo", "Inspeccionar una parte de la población: muestreo.", "gp-8-3"),
      pregunta("c8h09-10", "¿Están contentos los compradores tras el lanzamiento?", "encuesta", "Satisfacción tras desplegar: cuestionarios y encuestas.", "gp-8-3"),
      pregunta("c8h09-11", "¿Cómo lo hace otra planta de cápsulas de referencia?", "comparativo", "Comparar con proyectos similares: estudio comparativo.", "gp-8-1"),
      pregunta("c8h09-12", "¿Quién provee, qué entra, qué sale y para qué cliente?", "sipoc", "Proveedores, entradas, proceso, salidas y clientes: SIPOC.", "gp-8-1"),
    ],
  }],
};

/* ─── H10 · La credencial del auditor (4 decisiones + 1 micro) ─── */
export const GP_C8_H10 = {
  id: "gp26-eje-c08-h10-auditoria",
  contexto: "A mitad de la producción de prueba llega una auditoría de calidad a la planta de cápsulas.",
  rol: "Diriges la línea y acompañas el recorrido de la auditoría.",
  consigna: "¿Quién debería hacer la auditoría?",
  cierre: "Una auditoría independiente busca mejorar los procesos, no castigar a nadie.",
  subtemas: ["gp-8-2"],
  elenco: ["tu", "pmo"],
  etapas: [{
    tipo: "micros",
    consigna: "¿Quién debería hacer la auditoría?",
    pasos: [
      { id: "c8h10-01", subtemas: ["gp-8-2"], barajar: true, zona: 1, revela: true, despues: "La credencial pasa a manos de la PMO.",
        consigna: "¿Quién debería hacer la auditoría?",
        destinos: [{ id: "independiente", nombre: "La PMO, auditoría interna o un auditor externo" }, { id: "equipo", nombre: "El equipo de la línea" }, { id: "proveedor", nombre: "El proveedor de la lámina" }],
        clave: "independiente", retros: { equipo: "Debe ser independiente: alguien externo al proyecto.", proveedor: "El proveedor no es independiente ni revisa tus procesos." } },
      { tipo: "casillas", id: "c8h10-02", subtemas: ["gp-8-2"], zona: 2,
        consigna: "Marca los objetivos reales de la auditoría.",
        despues: "Se enciende la zona de empaque: el recorrido sigue.",
        casillas: [{ id: "objetivos", nombre: "Objetivos de la auditoría", marcar: true, columnas: 1,
          clave: ["practicas", "brechas", "compartir", "mejorar", "lecciones"],
          retro: "Son cinco: buenas prácticas, brechas, compartir, mejorar y lecciones.",
          opciones: [
            { id: "practicas", nombre: "Identificar buenas prácticas" },
            { id: "culpables", nombre: "Buscar culpables para sancionar", retro: "La auditoría ayuda de forma positiva; no busca culpables." },
            { id: "brechas", nombre: "Identificar no conformidades, brechas y defectos" },
            { id: "reemplazar", nombre: "Reemplazar la inspección de los lotes", retro: "La auditoría revisa procesos; la inspección sigue." },
            { id: "compartir", nombre: "Compartir buenas prácticas de proyectos similares" },
            { id: "mejorar", nombre: "Ayudar a mejorar de forma proactiva" },
            { id: "alcance", nombre: "Aprobar cambios al alcance", retro: "Los cambios se aprueban en el control integrado de cambios." },
            { id: "lecciones", nombre: "Aportar a las lecciones aprendidas" },
          ] }] },
      { id: "c8h10-03", subtemas: ["gp-8-2"], barajar: true, zona: 3, revela: true, despues: "La selladora recibe el sello de «verificado».",
        contexto: "La auditoría encuentra que la reparación aprobada de la selladora quedó a medias.",
        consigna: "¿Qué haces con la reparación?",
        destinos: [{ id: "completar", nombre: "Completarla, volver a probarla y certificarla" }, { id: "dejar", nombre: "Dejarla así" }, { id: "esperar", nombre: "Esperar al cierre" }],
        clave: "completar", retros: { dejar: "Un cambio a medias genera incoherencias y retrasos.", esperar: "Esperar deja pasar defectos; se verifica ahora." } },
      { id: "c8h10-04", subtemas: ["gp-8-2"], barajar: true, zona: 4, revela: true, despues: "La carpeta viaja al archivo de lecciones aprendidas.",
        contexto: "También halla en otra planta de Altamira un paso de sellado más rápido y seguro.",
        consigna: "¿Dónde debe quedar ese hallazgo?",
        destinos: [{ id: "repositorio", nombre: "En el repositorio de lecciones aprendidas" }, { id: "informe", nombre: "En el informe de la auditoría y ya" }, { id: "libreta", nombre: "Solo en tu libreta" }],
        clave: "repositorio", retros: { informe: "Una buena práctica se comparte en el repositorio de lecciones.", libreta: "Tu libreta no llega a otros proyectos." } },
      { id: "c8h10-05", subtemas: ["gp-8-2"], zona: 4,
        consigna: "¿Puede llegar una auditoría sin previo aviso?",
        destinos: SI_NO, clave: "si", retros: { no: "Las auditorías pueden ser programadas o aleatorias." } },
    ],
  }],
};

/* ─── H11 · La cadena de la solución (3 etapas) ─── */
export const GP_C8_H11 = {
  id: "gp26-eje-c08-h11-cadena",
  contexto: "El sellado sigue fallando de noche. Toca resolverlo de forma ordenada, no con parches.",
  rol: "Diriges la línea y conduces la resolución del problema.",
  consigna: "Engancha los seis pasos en orden en la cadena.",
  cierre: null,
  subtemas: ["gp-8-2"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Engancha los seis pasos en orden en la cadena.",
      pasos: [{
        tipo: "ordenar", id: "c8h11-cadena", subtemas: ["gp-8-2"], puntuaPares: true,
        consigna: "Engancha los seis pasos en orden en la cadena.",
        items: [
          { id: "definir", texto: "Definir el problema · «De noche fallan 3 de cada 100 sellos.»" },
          { id: "causa", texto: "Identificar la causa raíz · «El termostato no tiene mantenimiento.»" },
          { id: "generar", texto: "Generar soluciones · «Mantenimiento semanal, termostato nuevo o sensor.»" },
          { id: "elegir", texto: "Elegir la mejor · «Mantenimiento semanal con sensor.»" },
          { id: "implementar", texto: "Implementarla · «Empieza el lunes en los tres turnos.»" },
          { id: "verificar", texto: "Verificar la efectividad · «En un mes: ¿bajaron las fallas?»" },
        ],
        retrosPar: {
          "definir-causa": "Sin definir el problema no se sabe qué causa buscar.",
          "causa-generar": "Las soluciones atacan la causa raíz: primero hay que hallarla.",
          "generar-elegir": "Para elegir la mejor, primero hay que generar varias.",
          "elegir-implementar": "Se implementa lo que ya se eligió.",
          "implementar-verificar": "Solo se verifica una solución ya puesta en marcha.",
        },
      }],
    },
    {
      tipo: "clasificar",
      consigna: "Pon cada acción en su aspa del ciclo.",
      /* Clave: criterio de Gen (la guía nombra el ciclo PDCA, no define cada fase). */
      destinos: [
        { id: "planificar", nombre: "Planificar" },
        { id: "hacer", nombre: "Hacer" },
        { id: "verificar", nombre: "Verificar" },
        { id: "actuar", nombre: "Actuar" },
      ],
      partida: { todas: true },
      banco: con("gp-8-2", [
        it("c8h11-01", "Diseñar el nuevo plan de mantenimiento.", "planificar", "Diseñar el cambio antes de hacerlo es planificar."),
        it("c8h11-02", "Probarlo una semana en el turno de noche.", "hacer", "Ponerlo en práctica a pequeña escala es hacer."),
        it("c8h11-03", "Comparar defectos antes y después.", "verificar", "Medir si funcionó es verificar."),
        it("c8h11-04", "Volverlo norma en todos los turnos.", "actuar", "Estandarizar lo que funcionó es actuar."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Elige la X del diseño para cada meta.",
      destinos: [
        { id: "ensamblado", nombre: "Ensamblado" },
        { id: "costo", nombre: "Costo" },
        { id: "uso", nombre: "Facilidad de uso" },
        { id: "fiabilidad", nombre: "Fiabilidad" },
      ],
      partida: { todas: true },
      banco: con("gp-8-2", [
        it("c8h11-05", "Que la cápsula se arme más rápido en la línea.", "ensamblado", "Optimizar el armado es diseñar para el ensamblado."),
        it("c8h11-06", "Que cueste menos fabricarla.", "costo", "La X es el costo de producirla."),
        it("c8h11-07", "Que el cliente la ponga sin esfuerzo en la cafetera.", "uso", "Pensar en quien la usa es facilidad de uso."),
        it("c8h11-08", "Que no se rompa durante el transporte.", "fiabilidad", "Que funcione sin fallar es fiabilidad."),
      ]),
    },
  ],
};

/* ─── H12 · Las seis cortinas de despacho (3 etapas; 6 + 4 + 3 = 13) ─── */
export const GP_C8_H12 = {
  id: "gp26-moc-c08-h12-despacho",
  contexto: "El lote 27 de cápsulas premium terminó su control. Unas cajas pasan, otras no, y cada papel tiene un destino.",
  rol: "Diriges la línea y despachas cada salida del control de calidad.",
  consigna: "Lleva cada salida a la cortina que le corresponde.",
  cierre: null,
  subtemas: ["gp-8-3"],
  elenco: ["tu", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Lleva cada salida a la cortina que le corresponde.",
      destinos: [
        { id: "validar", nombre: "Validar el Alcance" },
        { id: "incidentes", nombre: "Registro de incidentes" },
        { id: "cambios", nombre: "Control Integrado de Cambios" },
        { id: "gestionar", nombre: "Gestionar la Calidad" },
        { id: "riesgos", nombre: "Registro de riesgos" },
        { id: "lecciones", nombre: "Lecciones aprendidas" },
      ],
      partida: { todas: true },
      banco: con("gp-8-3", [
        it("c8h12-01", "Cajas que cumplen todo: entregables verificados.", "validar", "Los verificados pasan a Validar el Alcance para su aceptación."),
        it("c8h12-02", "Una caja con sellos abiertos que no cumple.", "incidentes", "Un entregable que no cumple se suele registrar como incidente."),
        it("c8h12-03", "Hay que cambiar el plan: inspección del 100 % en premium.", "cambios", "Un cambio al plan va como solicitud al control integrado."),
        it("c8h12-04", "Mediciones del lote, en el formato del plan.", "gestionar", "Las mediciones vuelven a Gestionar para evaluar procesos."),
        it("c8h12-05", "Riesgo nuevo: el proveedor de lámina puede fallar.", "riesgos", "Un riesgo nuevo se anota en el registro de riesgos."),
        it("c8h12-06", "De dónde vino el defecto y cómo evitarlo.", "lecciones", "El origen del defecto y cómo evitarlo van a lecciones."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Clasifica lo dicho en la retrospectiva del lote.",
      destinos: [
        { id: "bien", nombre: "Salió bien" },
        { id: "mejorar", nombre: "Por mejorar" },
        { id: "incorporar", nombre: "Incorporar desde ya" },
        { id: "activos", nombre: "Agregar a los activos de la organización" },
      ],
      partida: { todas: true },
      banco: con("gp-8-3", [
        it("c8h12-07", "El muestreo por hora detectó el problema temprano.", "bien", "Funcionó y lo detectó a tiempo: es un acierto."),
        it("c8h12-08", "Tardamos dos días en avisar al proveedor.", "mejorar", "Es algo que salió lento: hay que mejorarlo."),
        it("c8h12-09", "Desde el lote 28, sensor de temperatura en cada turno.", "incorporar", "Es un cambio para este proyecto y los siguientes."),
        it("c8h12-10", "Plantilla nueva de hoja de verificación para toda Altamira.", "activos", "Una plantilla de la empresa es un activo de la organización."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Responde antes de cerrar el lote.",
      pasos: [
        { id: "c8h12-11", subtemas: ["gp-8-3"], mesa: "cliente",
          consigna: "¿El supermercado ya aceptó las cajas verificadas?",
          destinos: SI_NO, clave: "no", retros: { si: "Verificado no es aceptado: falta Validar el Alcance con el cliente." } },
        { id: "c8h12-12", subtemas: ["gp-8-3"], barajar: true,
          contexto: "La próxima línea será ágil, con entregas cada dos semanas.",
          consigna: "¿Cuándo se controla la calidad en ágil?",
          destinos: [{ id: "todo", nombre: "Todo el equipo, a lo largo del ciclo" }, { id: "final", nombre: "Solo al final del proyecto" }, { id: "inspector", nombre: "Solo el inspector, al cerrar la fase" }],
          clave: "todo", retros: { final: "Revisar solo al final es de cascada, no de ágil.", inspector: "En ágil la hacen todos, en pasos frecuentes." } },
        { id: "c8h12-13", subtemas: ["gp-8-3"], barajar: true,
          consigna: "¿Por qué los lotes pequeños ayudan a la calidad?",
          destinos: [{ id: "temprano", nombre: "Muestran los problemas temprano, cuando cambiar cuesta menos" }, { id: "inspeccion", nombre: "Eliminan la inspección" }, { id: "grado", nombre: "Bajan el grado del producto" }],
          clave: "temprano", retros: { inspeccion: "Los lotes pequeños no quitan las pruebas; las adelantan.", grado: "El tamaño del lote no cambia el grado." } },
      ],
    },
  ],
};

export const PIEZAS_TEXTO_C8 = [GP_C8_H01, GP_C8_H02, GP_C8_H03, GP_C8_H04, GP_C8_H05, GP_C8_H06, GP_C8_H07, GP_C8_H08, GP_C8_H09, GP_C8_H10, GP_C8_H11, GP_C8_H12];
