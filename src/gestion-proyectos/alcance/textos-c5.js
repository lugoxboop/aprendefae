/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 5 «GESTIÓN DEL ALCANCE» — LOS TEXTOS DE LAS 12
 * HACER (lote 3)
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c05-hacer.md (§2, H01 a H12). Los textos no se reescriben aquí: si el
 * profesor o Gen cambian una clave, se cambia en este archivo y en el diseño.
 * Forma y tipos de etapa: los de ../fundamentos/textos-c1.js y
 * ../comun/preparar.js; los cálculos y las filas del telar usan el paso
 * `tipo: "casillas"` (motor ../comun/motores/Casillas.jsx).
 *
 * Cada pieza va al módulo del grupo de procesos del proceso que ejercita
 * (catalogo.js): 5.1–5.4 Planificación; 5.5 y 5.6 Monitoreo y Control. Los
 * subtemas gp05-* del diseño son los procesos de ../estructura.js:
 *   gp05-dos-alcances, gp05-planificar → gp-5-1 · gp05-tecnicas,
 *   gp05-decisiones, gp05-requisitos, gp05-trazabilidad → gp-5-2 ·
 *   gp05-enunciado → gp-5-3 · gp05-edt, gp05-linea-base → gp-5-4 ·
 *   gp05-validar → gp-5-5 · gp05-controlar → gp-5-6.
 *   gp05-adaptativo (H02) recorre los cinco procesos: cada ficha lleva el suyo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });
const con = (subtema, lista) => lista.map((x) => ({ ...x, subtemas: [subtema] }));
const SI_NO = [{ id: "si", nombre: "Sí" }, { id: "no", nombre: "No" }];

/* ─── H01 · Escenario o bambalinas ─── */
export const GP_C5_H01 = {
  id: "gp26-pla-c05-h01-teatro",
  contexto: "Altamira lanzará la versión 2 de la app de pedidos: pago con tarjeta, puntos y seguimiento del domicilio.",
  rol: "Diriges el proyecto de la versión 2.",
  consigna: "¿Va al escenario (producto) o tras bambalinas (proyecto)?",
  cierre: "Producto: lo que hace. Proyecto: el trabajo para lograrlo.",
  subtemas: ["gp-5-1"],
  elenco: ["tu", "cliente", "equipo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "¿Va al escenario (producto) o tras bambalinas (proyecto)?",
    destinos: [
      { id: "producto", nombre: "Escenario", pista: "Alcance del producto" },
      { id: "proyecto", nombre: "Tras bambalinas", pista: "Alcance del proyecto" },
    ],
    partida: { porClave: 4 },
    banco: con("gp-5-1", [
      it("c5h01-01", "Pagar con tarjeta dentro de la app.", "producto", "Es una función de la app: alcance del producto."),
      it("c5h01-02", "Acumular puntos por cada compra.", "producto", "Es una característica que usa el cliente: producto."),
      it("c5h01-03", "Ver en el mapa dónde va el domicilio.", "producto", "Lo hace la app: es función del producto."),
      it("c5h01-04", "La app carga en menos de 3 segundos.", "producto", "Es una cualidad del producto, aunque no sea un botón."),
      it("c5h01-05", "Pedir con un mensaje de WhatsApp.", "producto", "Es algo que la app permite hacer: producto."),
      it("c5h01-06", "Programar el módulo de pagos.", "proyecto", "Es trabajo para construir la función: alcance del proyecto."),
      it("c5h01-07", "Probar la app con 20 clientes.", "proyecto", "Probar es trabajo del equipo, no una función."),
      it("c5h01-08", "Capacitar a los meseros en la versión 2.", "proyecto", "Es trabajo necesario para entregar: alcance del proyecto."),
      it("c5h01-09", "Informar el avance a la patrocinadora cada viernes.", "proyecto", "Dirigir el proyecto también es trabajo del proyecto."),
      it("c5h01-10", "Migrar los datos de clientes de la versión 1.", "proyecto", "Es trabajo temporal para pasar a la versión 2."),
    ]),
    despues: [
      { id: "c5h01-11", subtemas: ["gp-5-1"], regla: true,
        consigna: "¿Contra qué mides que el producto está completo?",
        destinos: [{ id: "requisitos", nombre: "Requisitos del producto" }, { id: "plan", nombre: "Plan para la dirección del proyecto" }],
        clave: "requisitos", retros: { plan: "El producto se mide contra sus requisitos; el plan mide el proyecto." } },
      { id: "c5h01-12", subtemas: ["gp-5-1"], regla: true,
        consigna: "¿Y contra qué mides el trabajo del proyecto?",
        destinos: [{ id: "requisitos", nombre: "Requisitos del producto" }, { id: "plan", nombre: "Plan para la dirección del proyecto" }],
        clave: "plan", retros: { requisitos: "El trabajo del proyecto se mide contra el plan para la dirección." } },
    ],
  }],
};

/* ─── H02 · La carretera y la noria ─── */
const SENALES = [
  { id: "principio", nombre: "Al principio", pista: "se actualiza con control de cambios" },
  { id: "entregable", nombre: "Con cada entregable o revisión de fase" },
  { id: "siempre", nombre: "Todo el tiempo" },
  { id: "iteracion", nombre: "Se repite en cada iteración", pista: "la noria" },
];
const PROCESOS = [
  ["requisitos", "Recopilar Requisitos", "gp-5-2"],
  ["definir", "Definir el Alcance", "gp-5-3"],
  ["edt", "Crear la EDT/WBS", "gp-5-4"],
  ["validar", "Validar el Alcance", "gp-5-5"],
  ["controlar", "Controlar el Alcance", "gp-5-6"],
];
const CARRETERA = {
  requisitos: ["principio", "En predictivo se recopila al principio y se actualiza con cambios."],
  definir: ["principio", "El alcance se define temprano en un ciclo predictivo."],
  edt: ["principio", "La EDT se crea al inicio y cambia solo con control."],
  validar: ["entregable", "En predictivo se valida con cada entregable o revisión de fase."],
  controlar: ["siempre", "Controlar el alcance es continuo en predictivo."],
};
const NORIA = {
  requisitos: "Cada iteración vuelve a recopilar requisitos del registro.",
  definir: "El alcance detallado se aprueba antes de cada iteración.",
  edt: "La descomposición también se repite por iteración.",
  validar: "El cliente acepta lo entregado en cada iteración.",
  controlar: "Cada iteración controla su propio alcance.",
};
export const GP_C5_H02 = {
  id: "gp26-pla-c05-h02-noria",
  contexto: "La PMO quiere que el módulo de puntos se haga en iteraciones de dos semanas, y el resto, en cascada.",
  rol: "Diriges el proyecto y explicas al equipo cómo cambia el alcance.",
  consigna: "Ubica cada proceso: ¿al inicio o en cada vuelta?",
  cierre: "Predictivo: el alcance se fija temprano. Adaptativo: se descubre vuelta a vuelta.",
  subtemas: ["gp-5-2", "gp-5-3", "gp-5-4", "gp-5-5", "gp-5-6"],
  elenco: ["tu", "pmo", "patrocinadora", "cliente"],
  etapas: [{
    tipo: "micros",
    consigna: "Ubica cada proceso: ¿al inicio o en cada vuelta?",
    pasos: [
      { grupo: "carretera", barajar: true, ronda: "carretera", consigna: "Carretera (cascada): ¿cuándo se hace cada proceso?",
        destinos: SENALES,
        items: PROCESOS.map(([k, nombre, sub]) => ({ id: `c5h02-a-${k}`, texto: nombre, clave: CARRETERA[k][0], retro: CARRETERA[k][1], subtemas: [sub] })) },
      { grupo: "noria", barajar: true, ronda: "noria", consigna: "Noria (módulo de puntos, adaptativo): ¿y ahora?",
        destinos: SENALES,
        items: PROCESOS.map(([k, nombre, sub]) => ({ id: `c5h02-b-${k}`, texto: nombre, clave: "iteracion", retro: NORIA[k], subtemas: [sub] })) },
      { id: "c5h02-01", subtemas: ["gp-5-2"], ronda: "noria", barajar: true,
        consigna: "¿Dónde quedan los requisitos del módulo de puntos?",
        destinos: [{ id: "pendientes", nombre: "En el registro de trabajos pendientes" }, { id: "edt", nombre: "En una EDT fija desde el inicio" }],
        clave: "pendientes", retros: { edt: "En ágil, los requisitos son el registro de trabajos pendientes." } },
      { id: "c5h02-02", subtemas: ["gp-5-5"], ronda: "noria", cabina: true, barajar: true,
        consigna: "¿Quién debe participar en cada vuelta?",
        destinos: [{ id: "ambos", nombre: "Patrocinadora y cliente" }, { id: "equipo", nombre: "Solo el equipo" }],
        clave: "ambos", retros: { equipo: "En ágil, patrocinador y cliente opinan continuamente sobre cada entregable." } },
      { id: "c5h02-03", subtemas: ["gp-5-2"], ronda: "noria",
        contexto: "Los requisitos del programa de puntos cambian cada semana.",
        consigna: "¿Qué enfoque conviene para requisitos tan inestables?",
        destinos: [{ id: "adaptativo", nombre: "Adaptativo" }, { id: "predictivo", nombre: "Predictivo" }],
        clave: "adaptativo", retros: { predictivo: "Requisitos inestables piden descubrir el alcance por iteraciones." } },
    ],
  }],
};

/* ─── H03 · Las dos libretas ─── */
export const GP_C5_H03 = {
  id: "gp26-pla-c05-h03-libretas",
  contexto: "El practicante mezcló en una sola libreta el plan del alcance y el de requisitos. Hay que separarlos.",
  rol: "Diriges el proyecto y revisas el plan antes de aprobarlo.",
  consigna: "Lleva cada página a la libreta que le corresponde.",
  cierre: null,
  subtemas: ["gp-5-1"],
  elenco: ["tu", "practicante"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Lleva cada página a la libreta que le corresponde.",
    destinos: [
      { id: "alcance", nombre: "Plan de gestión del alcance" },
      { id: "requisitos", nombre: "Plan de gestión de los requisitos" },
    ],
    partida: { n: 8 },
    banco: con("gp-5-1", [
      it("c5h03-01", "Cómo se elaborará el enunciado del alcance.", "alcance", "Elaborar el enunciado es parte del plan del alcance."),
      it("c5h03-02", "Cómo se creará la EDT a partir del enunciado.", "alcance", "Crear la EDT lo define el plan del alcance."),
      it("c5h03-03", "Cómo se aprobará y mantendrá la línea base.", "alcance", "La línea base del alcance se gobierna desde ese plan."),
      it("c5h03-04", "Cómo se obtendrá la aceptación formal de entregables.", "alcance", "La aceptación formal la define el plan del alcance."),
      it("c5h03-05", "Cómo se priorizan los requisitos.", "requisitos", "Priorizar requisitos es del plan de gestión de los requisitos."),
      it("c5h03-06", "Qué métricas se usarán y por qué.", "requisitos", "Las métricas de requisitos van en su propio plan."),
      it("c5h03-07", "Cómo se inicia un cambio y quién lo autoriza.", "requisitos", "Es gestión de la configuración: plan de requisitos."),
      it("c5h03-08", "La estructura de la matriz de trazabilidad.", "requisitos", "La trazabilidad se define en el plan de requisitos."),
      it("c5h03-09", "Cómo se informarán las actividades de requisitos.", "requisitos", "Planificar e informar esas actividades es del plan de requisitos."),
    ]),
    despues: [
      { id: "c5h03-10", subtemas: ["gp-5-1"], mesa: "practicante",
        contexto: "El practicante pregunta si el plan debe ser muy formal.",
        consigna: "¿Tiene que ser formal y detallado?",
        destinos: [{ id: "depende", nombre: "Depende del proyecto" }, { id: "siempre", nombre: "Sí, siempre" }],
        clave: "depende", retros: { siempre: "Puede ser formal o informal, detallado o general, según el proyecto." } },
      { id: "c5h03-11", subtemas: ["gp-5-1"], barajar: true,
        consigna: "¿De qué gran plan son parte ambas libretas?",
        destinos: [{ id: "plan", nombre: "Plan para la dirección del proyecto" }, { id: "acta", nombre: "Acta de constitución" }],
        clave: "plan", retros: { acta: "El acta autoriza; ambos planes son componentes del plan para la dirección." } },
    ],
  }],
};

/* ─── H04 · La mochila de campo (7 de 9, siempre la del observador participante) ─── */
export const TECNICAS_C5 = [
  { id: "entrevista", nombre: "Entrevista" },
  { id: "focal", nombre: "Grupo focal" },
  { id: "encuesta", nombre: "Encuesta" },
  { id: "observacion", nombre: "Observación" },
  { id: "prototipo", nombre: "Prototipo" },
  { id: "guion", nombre: "Guion gráfico" },
  { id: "documentos", nombre: "Análisis de documentos" },
  { id: "comparativo", nombre: "Estudio comparativo" },
];
export const GP_C5_H04 = {
  id: "gp26-pla-c05-h04-mochila",
  contexto: "Antes de programar, necesitas saber qué quieren clientes, meseros y la junta. Cada caso pide otra técnica.",
  rol: "Diriges el proyecto y sales a recopilar requisitos.",
  consigna: "Mete en la mochila la herramienta que sirve aquí.",
  cierre: "Cada técnica sirve para una situación: no hay una para todo.",
  subtemas: ["gp-5-2"],
  elenco: ["tu", "cliente"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Mete en la mochila la herramienta que sirve aquí.",
    destinos: TECNICAS_C5,
    partida: { n: 6, siempre: ["c5h04-09"] },
    banco: con("gp-5-2", [
      it("c5h04-01", "La junta tiene quejas confidenciales sobre la versión 1.", "entrevista", "Para información confidencial, el diálogo directo uno a uno funciona."),
      it("c5h04-02", "Quieres opiniones de 3.000 clientes de cinco ciudades, rápido.", "encuesta", "Muchos encuestados, dispersos y con prisa: cuestionario o encuesta."),
      it("c5h04-03", "Los meseros no saben explicar cómo toman pedidos hoy.", "observacion", "Si no saben explicarlo, míralos trabajar: observación."),
      it("c5h04-04", "Quieres que ocho clientes conversen guiados por un moderador.", "focal", "Grupo preseleccionado con moderador y conversación: grupo focal."),
      it("c5h04-05", "Los clientes discuten en abstracto; necesitas algo que puedan tocar.", "prototipo", "Un modelo para experimentar evita discutir en abstracto."),
      it("c5h04-06", "Quieres mostrar la ruta de pantallas del pago, una tras otra.", "guion", "Una secuencia de imágenes de navegación es un guion gráfico."),
      it("c5h04-07", "Una ordenanza regula los domicilios en moto.", "documentos", "Leer leyes y ordenanzas existentes es análisis de documentos."),
      it("c5h04-08", "Quieres saber cómo resolvió el pago otra cadena de cafés.", "comparativo", "Compararse con organizaciones similares es un estudio comparativo."),
      it("c5h04-09", "El practicante atiende él mismo un turno de pedidos.", "observacion", "Hacer el trabajo para descubrir requisitos ocultos: observador participante.", { trampa: true }),
    ]),
  }],
};

/* ─── H05 · La urna de las funciones (2 etapas) ─── */
const REGLAS_VOTO = [
  { id: "unanimidad", nombre: "Unanimidad" },
  { id: "mayoria", nombre: "Mayoría" },
  { id: "pluralidad", nombre: "Pluralidad" },
  { id: "autocratica", nombre: "Autocrática" },
];
export const GP_C5_H05 = {
  id: "gp26-pla-c05-h05-urna",
  contexto: "Nueve personas del equipo y la junta votan qué función nueva entra primero en la versión 2.",
  rol: "Moderas la votación como director(a) del proyecto.",
  consigna: "Cuenta los votos y nombra la regla que decidió.",
  cierre: null,
  subtemas: ["gp-5-2"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "micros",
      consigna: "Cuenta los votos y nombra la regla que decidió.",
      pasos: [
        { id: "c5h05-r1", subtemas: ["gp-5-2"], ronda: 1, votos: [9, 0, 0], contexto: "Ronda 1 · Pago 9 · Puntos 0 · Seguimiento 0.",
          consigna: "¿Qué regla decidió?", destinos: REGLAS_VOTO, clave: "unanimidad", retro: "Los nueve eligieron lo mismo: unanimidad." },
        { id: "c5h05-r2", subtemas: ["gp-5-2"], ronda: 2, votos: [5, 3, 1], contexto: "Ronda 2 · Pago 5 · Puntos 3 · Seguimiento 1.",
          consigna: "¿Qué regla decidió?", destinos: REGLAS_VOTO, clave: "mayoria", retro: "5 de 9 es más del 50 %: mayoría." },
        { id: "c5h05-r3", subtemas: ["gp-5-2"], ronda: 3, votos: [4, 3, 2], contexto: "Ronda 3 · Pago 4 · Puntos 3 · Seguimiento 2.",
          consigna: "¿Qué regla decidió?", destinos: REGLAS_VOTO, clave: "pluralidad", retro: "4 de 9 no pasa el 50 %; ganó el bloque mayor: pluralidad." },
        { id: "c5h05-r4", subtemas: ["gp-5-2"], ronda: 4, votos: [4, 4, 1], sola: true, contexto: "Ronda 4 · Pago 4 · Puntos 4 · Seguimiento 1. La patrocinadora decide sola.",
          consigna: "¿Qué regla decidió?", destinos: REGLAS_VOTO, clave: "autocratica", retro: "Una persona decidió por el grupo: autocrática." },
        { id: "c5h05-impar", subtemas: ["gp-5-2"], barajar: true,
          consigna: "¿Por qué conviene un grupo impar?",
          destinos: [{ id: "empates", nombre: "Evita empates en la mayoría" }, { id: "ideas", nombre: "Da más ideas" }],
          clave: "empates", retros: { ideas: "Con número impar no puede haber empate a la mitad." } },
      ],
    },
    {
      tipo: "micros",
      consigna: "Ordena los pasos del grupo nominal.",
      pasos: [
        { tipo: "ordenar", id: "c5h05-nominal", subtemas: ["gp-5-2"], puntuaPares: true,
          consigna: "Ordena los pasos del grupo nominal.",
          items: [
            { id: "escribir", texto: "Escribir ideas en silencio" },
            { id: "anotar", texto: "El moderador anota todas" },
            { id: "discutir", texto: "Discutir hasta entenderlas" },
            { id: "votar", texto: "Votar en privado del 1 al 5" },
          ],
          retrosPar: {
            "escribir-anotar": "Primero cada quien escribe solo; después se anotan.",
            "anotar-discutir": "Se discute lo que ya quedó anotado.",
            "discutir-votar": "Se vota cuando todos entienden cada idea.",
          } },
        { id: "c5h05-puntos", subtemas: ["gp-5-2"],
          contexto: "En la votación de 1 a 5: Pago suma 38, Puntos 41, Seguimiento 29.",
          consigna: "¿Qué idea queda primera en la prioridad?",
          destinos: [{ id: "pago", nombre: "Pago · 38" }, { id: "puntos", nombre: "Puntos · 41" }, { id: "seguimiento", nombre: "Seguimiento · 29" }],
          clave: "puntos", retro: "Gana la idea con más puntos: 41." },
      ],
    },
  ],
};

/* ─── H06 · La alacena de requisitos (2 etapas) ─── */
export const GP_C5_H06 = {
  id: "gp26-pla-c05-h06-alacena",
  contexto: "Llegaron 40 requisitos para la versión 2, todos revueltos. Antes de la línea base hay que ordenarlos.",
  rol: "Diriges el proyecto y documentas los requisitos.",
  consigna: "Pon cada requisito en el frasco de su categoría.",
  cierre: "Requisito en la línea base: inequívoco, trazable, completo, coherente y aceptable.",
  subtemas: ["gp-5-2"],
  elenco: ["tu", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Pon cada requisito en el frasco de su categoría.",
      destinos: [
        { id: "negocio", nombre: "Negocio" },
        { id: "interesados", nombre: "Interesados" },
        { id: "funcional", nombre: "Funcional", pista: "Solución" },
        { id: "nofuncional", nombre: "No funcional", pista: "Solución" },
        { id: "transicion", nombre: "Transición" },
        { id: "proyecto", nombre: "Proyecto" },
        { id: "calidad", nombre: "Calidad" },
      ],
      /* 8: uno por frasco y siempre los dos de transición (la trampa). */
      partida: { porClave: { negocio: 1, interesados: 1, funcional: 1, nofuncional: 1, transicion: 2, proyecto: 1, calidad: 1 } },
      banco: con("gp-5-2", [
        it("c5h06-01", "Recuperar los pedidos que hoy se pierden por WhatsApp.", "negocio", "Es el problema de negocio que justifica el proyecto."),
        it("c5h06-02", "La gerente de ventas necesita un reporte diario.", "interesados", "Es la necesidad de un interesado concreto."),
        it("c5h06-03", "El cliente puede pagar con tarjeta débito.", "funcional", "Describe algo que la app hace: funcional."),
        it("c5h06-04", "La app avisa cuando el pedido sale.", "funcional", "Es un comportamiento del producto: funcional."),
        it("c5h06-05", "Debe funcionar el 99 % del tiempo.", "nofuncional", "Es una cualidad, la confiabilidad: no funcional."),
        it("c5h06-06", "Los datos de tarjeta deben ir cifrados.", "nofuncional", "La seguridad es una cualidad: no funcional."),
        it("c5h06-07", "Pasar los clientes de la versión 1 a la 2.", "transicion", "Es conversión de datos temporal para llegar al estado futuro."),
        it("c5h06-08", "Capacitar a los meseros antes del lanzamiento.", "transicion", "La capacitación para el cambio es requisito de transición."),
        it("c5h06-09", "Lanzar antes del 1 de diciembre, como dice el contrato.", "proyecto", "Fecha de hito y obligación contractual: requisito del proyecto."),
        it("c5h06-10", "Pasar 50 pruebas de pago sin error.", "calidad", "Son pruebas para validar el entregable: requisito de calidad."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Elige la versión que se puede medir y comprobar.",
      pasos: [
        { grupo: "medibles", barajar: true, consigna: "Elige la versión que se puede medir y comprobar.",
          items: [
            { id: "c5h06-11", subtemas: ["gp-5-2"], barajar: true, clave: "medible",
              destinos: [{ id: "vaga", nombre: "La app debe ser rápida." }, { id: "medible", nombre: "La app carga en menos de 3 segundos." }],
              retros: { vaga: "\"Rápida\" no se puede medir; 3 segundos sí." } },
            { id: "c5h06-12", subtemas: ["gp-5-2"], barajar: true, clave: "medible",
              destinos: [{ id: "vaga", nombre: "El pago debe ser seguro." }, { id: "medible", nombre: "Los datos de tarjeta viajan cifrados." }],
              retros: { vaga: "\"Seguro\" es ambiguo; \"cifrados\" se puede comprobar." } },
            { id: "c5h06-13", subtemas: ["gp-5-2"], barajar: true, clave: "medible",
              destinos: [{ id: "vaga", nombre: "Muchos clientes deben usarla." }, { id: "medible", nombre: "El 30 % de los pedidos llega por la app en marzo." }],
              retros: { vaga: "\"Muchos\" no se comprueba; una cifra con fecha sí." } },
            { id: "c5h06-14", subtemas: ["gp-5-2"], barajar: true, clave: "medible",
              destinos: [{ id: "vaga", nombre: "La app debe ser fácil." }, { id: "medible", nombre: "Un cliente nuevo paga en menos de 4 toques." }],
              retros: { vaga: "\"Fácil\" depende de quién; 4 toques se mide." } },
          ] },
      ],
    },
  ],
};

/* ─── H07 · El telar de la trazabilidad (9 ítems: 4 filas + 2 hilos + 3 estados) ─── */
export const OBJETIVOS_C5 = [
  { id: "o1", nombre: "O1 · Recuperar pedidos perdidos por WhatsApp" },
  { id: "o2", nombre: "O2 · Fidelizar a los clientes frecuentes" },
];
const ENTREGABLES_TELAR = [
  { id: "e11", nombre: "1.1 Conector de WhatsApp" },
  { id: "e12", nombre: "1.2 Programa de puntos" },
  { id: "e13", nombre: "1.3 Pasarela de pago" },
  { id: "e14", nombre: "1.4 Seguimiento" },
];
const PRUEBAS_TELAR = [
  { id: "p1", nombre: "100 pedidos por chat" },
  { id: "p2", nombre: "Saldo correcto tras 10 compras" },
  { id: "p3", nombre: "50 pagos sin error" },
  { id: "p4", nombre: "Posición cada 30 segundos" },
];
const fila = (id, r, texto, o, e, p, retro) => ({
  tipo: "casillas", id, subtemas: ["gp-5-2"], fila: r, texto: `${r} · ${texto}`, retro,
  casillas: [
    { id: "objetivo", nombre: "Objetivo de negocio", opciones: OBJETIVOS_C5, clave: o, columnas: 1 },
    { id: "entregable", nombre: "Entregable de la EDT", opciones: ENTREGABLES_TELAR, clave: e },
    { id: "prueba", nombre: "Caso de prueba", opciones: PRUEBAS_TELAR, clave: p },
  ],
});
export const GP_C5_H07 = {
  id: "gp26-pla-c05-h07-telar",
  contexto: "La matriz de trazabilidad de la versión 2 tiene hilos sueltos: requisitos sin origen y entregables sin requisito.",
  rol: "Diriges el proyecto y preparas la matriz para la auditoría de la PMO.",
  consigna: "Teje cada requisito de su objetivo a su prueba.",
  cierre: null,
  subtemas: ["gp-5-2"],
  elenco: ["tu", "pmo"],
  etapas: [{
    tipo: "micros",
    consigna: "Teje cada requisito de su objetivo a su prueba.",
    pasos: [
      /* Objetivo de R3 y R4: criterio de Gen (la guía no da el ejemplo). */
      { grupo: "filas", barajar: true, consigna: "Teje cada requisito de su objetivo a su prueba.",
        items: [
          fila("c5h07-r1", "R1", "Pedir desde un chat de WhatsApp.", "o1", "e11", "p1", "El chat resuelve los pedidos perdidos: va con O1 y el conector."),
          fila("c5h07-r2", "R2", "Un punto por cada $1.000 de compra.", "o2", "e12", "p2", "Los puntos fidelizan: O2, programa de puntos y su prueba de saldo."),
          fila("c5h07-r3", "R3", "Pagar con tarjeta.", "o1", "e13", "p3", "Pagar en la app evita perder pedidos: O1 y la pasarela."),
          fila("c5h07-r4", "R4", "Ver dónde va el domicilio.", "o2", "e14", "p4", "El seguimiento busca que el cliente frecuente vuelva: O2."),
        ] },
      { id: "c5h07-h1", subtemas: ["gp-5-2"], suelto: true, consigna: "Este hilo no se puede unir. ¿Qué haces?",
        contexto: "R5 «Modo oscuro», sin objetivo al que unirse.",
        destinos: [{ id: "valor", nombre: "Preguntar qué valor aporta; si no, sale" }, { id: "dejar", nombre: "Dejarlo suelto en la matriz" }],
        clave: "valor", retros: { dejar: "Si no se vincula a un objetivo, no demuestra valor del negocio." } },
      { id: "c5h07-h2", subtemas: ["gp-5-2"], suelto: true, consigna: "Este hilo no se puede unir. ¿Qué haces?",
        contexto: "Entregable «1.5 Juego de trivia cafetera», sin requisito.",
        destinos: [{ id: "quitar", nombre: "Quitarlo de la EDT" }, { id: "dejar", nombre: "Dejarlo en la EDT" }],
        clave: "quitar", retros: { dejar: "Un entregable sin requisito es trabajo extra fuera del alcance." } },
      { grupo: "estados", consigna: "Ponle a cada requisito su estado actual.",
        destinos: [{ id: "completado", nombre: "Completado" }, { id: "aplazado", nombre: "Aplazado" }, { id: "cancelado", nombre: "Cancelado" }],
        items: con("gp-5-2", [
          { id: "c5h07-s1", texto: "R3 ya pasó su prueba.", clave: "completado", retro: "Pasó su prueba: el estado es completado." },
          { id: "c5h07-s2", texto: "La junta pasó R5 para la versión 3.", clave: "aplazado", retro: "Pospuesto para después: aplazado, no cancelado." },
          { id: "c5h07-s3", texto: "La junta eliminó para siempre la trivia.", clave: "cancelado", retro: "Eliminado para siempre: cancelado." },
        ]) },
    ],
  }],
};

/* ─── H08 · El mapa de dos escalas (2 etapas) ─── */
export const GP_C5_H08 = {
  id: "gp26-pla-c05-h08-mapa",
  contexto: "La patrocinadora dice que el acta y el enunciado del alcance son el mismo papel repetido.",
  rol: "Diriges el proyecto y le muestras la diferencia.",
  consigna: "¿Va en el acta o en el enunciado?",
  cierre: null,
  subtemas: ["gp-5-3"],
  elenco: ["tu", "patrocinadora", "cliente"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Va en el acta o en el enunciado?",
      destinos: [
        { id: "acta", nombre: "Acta", pista: "el mapa de Colombia" },
        { id: "enunciado", nombre: "Enunciado", pista: "el mapa de calles" },
      ],
      partida: { porClave: 4 },
      banco: con("gp-5-3", [
        it("c5h08-01", "Propósito del proyecto.", "acta", "El propósito es de alto nivel: va en el acta."),
        it("c5h08-02", "Recursos financieros preaprobados.", "acta", "El dinero preaprobado lo fija el acta."),
        it("c5h08-03", "Resumen del cronograma de hitos.", "acta", "El resumen de hitos es información de alto nivel."),
        it("c5h08-04", "Director asignado y su nivel de autoridad.", "acta", "El acta nombra al director y su autoridad."),
        it("c5h08-05", "Riesgo general del proyecto.", "acta", "El riesgo general se ve desde el mapa grande."),
        it("c5h08-06", "Criterios de salida del proyecto.", "acta", "Cuándo cerrar o cancelar lo define el acta."),
        it("c5h08-07", "Criterios de aceptación de cada entregable.", "enunciado", "Condiciones de aceptación detalladas: enunciado."),
        it("c5h08-08", "Exclusiones del proyecto.", "enunciado", "Lo que queda fuera se detalla en el enunciado."),
        it("c5h08-09", "Descripción del alcance, elaborada progresivamente.", "enunciado", "El detalle que crece con el tiempo va en el enunciado."),
        it("c5h08-10", "Todos los entregables, descritos en detalle.", "enunciado", "Los entregables detallados son del enunciado; el acta da los clave."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Arma el enunciado: cada frase en su sección.",
      destinos: [
        { id: "descripcion", nombre: "Descripción del producto" },
        { id: "entregables", nombre: "Entregables" },
        { id: "criterios", nombre: "Criterios de aceptación" },
        { id: "exclusiones", nombre: "Exclusiones" },
      ],
      partida: { todas: true },
      banco: con("gp-5-3", [
        it("c5h08-11", "La versión 2 permite pedir por WhatsApp, pagar y sumar puntos.", "descripcion", "Describe características del producto: descripción del alcance."),
        it("c5h08-12", "App publicada en las tiendas de aplicaciones.", "entregables", "Es algo único y verificable que se produce: entregable."),
        it("c5h08-13", "Manual de uso para meseros.", "entregables", "Los documentos de apoyo también son entregables."),
        it("c5h08-14", "Informe de cierre del proyecto.", "entregables", "Los informes de dirección también cuentan como entregables."),
        it("c5h08-15", "Se acepta si 50 pagos de prueba salen sin error.", "criterios", "Es una condición que debe cumplirse para aceptar."),
        it("c5h08-16", "Se acepta si 20 clientes completan un pedido sin ayuda.", "criterios", "Condición medible antes de aceptar: criterio de aceptación."),
        it("c5h08-17", "No incluye versión para relojes inteligentes.", "exclusiones", "Decir lo que no entra evita expectativas falsas."),
        it("c5h08-18", "No incluye domicilios fuera de Manizales.", "exclusiones", "Es una exclusión explícita: reduce la corrupción del alcance."),
      ]),
      despues: { id: "c5h08-19", subtemas: ["gp-5-3"], mesa: "cliente",
        contexto: "El cliente pide una versión para relojes inteligentes.",
        consigna: "¿Está dentro del alcance?",
        destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
        clave: "no", retros: { si: "La exclusión lo dice: está fuera; si se quiere, va como cambio." } },
    },
  ],
};

/* ─── H09 · El móvil de la EDT (3 etapas; 17 ítems) ─── */
export const RAMAS_C5 = [
  { id: "r11", nombre: "1.1 Conector de WhatsApp" },
  { id: "r12", nombre: "1.2 Programa de puntos" },
  { id: "r13", nombre: "1.3 Pasarela de pago" },
  { id: "r14", nombre: "1.4 Dirección del proyecto" },
];
const SIN_DIRECCION = "Sin la dirección del proyecto, la EDT no suma el 100 %.";
export const GP_C5_H09 = {
  id: "gp26-pla-c05-h09-movil",
  contexto: "La versión 2 ya tiene enunciado aprobado. Ahora toca descomponer todo el trabajo en piezas manejables.",
  rol: "Diriges el proyecto y armas la EDT con el equipo.",
  consigna: "Cuelga cada pieza en su rama; descarta lo que no es entregable.",
  cierre: null,
  subtemas: ["gp-5-4"],
  elenco: ["tu", "equipo", "practicante"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Cuelga cada pieza en su rama; descarta lo que no es entregable.",
      destinos: [...RAMAS_C5, { id: "caneca", nombre: "No es entregable" }],
      partida: { todas: true },
      banco: con("gp-5-4", [
        it("c5h09-01", "Diseño del chat.", "r11", "El chat es parte del conector de WhatsApp."),
        it("c5h09-02", "Conector programado.", "r11", "Es el entregable central de la rama WhatsApp."),
        it("c5h09-03", "Reglas de puntos aprobadas.", "r12", "Sin reglas no hay programa de puntos: va en 1.2."),
        it("c5h09-04", "Tablero de puntos del cliente.", "r12", "Muestra los puntos: pertenece al programa de puntos."),
        it("c5h09-05", "Pasarela integrada con el banco.", "r13", "Integrar con el banco es parte del pago."),
        it("c5h09-06", "Pruebas de pago aprobadas.", "r13", "Las pruebas del pago cuelgan de la pasarela."),
        it("c5h09-07", "Plan para la dirección.", "r14", "Dirigir también es trabajo: la EDT lo incluye.", { retros: { caneca: SIN_DIRECCION } }),
        it("c5h09-08", "Informes semanales.", "r14", "Informar es trabajo de dirección del proyecto: rama 1.4.", { retros: { caneca: SIN_DIRECCION } }),
        it("c5h09-09", "Llamar al banco el lunes.", "caneca", "Es una actividad; la EDT lista entregables."),
        it("c5h09-10", "Reunión con el equipo a las 3 p. m.", "caneca", "Una reunión con hora es actividad del cronograma, no entregable."),
      ]),
    },
    {
      tipo: "micros",
      consigna: "Completa las horas que faltan para equilibrar cada rama.",
      pasos: [
        { tipo: "casillas", id: "c5h09-h1", subtemas: ["gp-5-4"], rama: { nombre: "1.2 Programa de puntos", padre: 120, hijos: [20, 60, null] },
          contexto: "Rama 1.2 = 120 h. Reglas 20 h · Tablero 60 h · Pruebas de puntos ?",
          consigna: "Completa las horas que faltan para equilibrar cada rama.",
          casillas: [{ id: "h", nombre: "Pruebas de puntos", unidad: "h", clave: 40 }],
          retro: "Los hijos deben sumar el padre: 120 − 20 − 60 = 40." },
        { tipo: "casillas", id: "c5h09-h2", subtemas: ["gp-5-4"], rama: { nombre: "1.3 Pasarela de pago", padre: null, hijos: [70, 30, 25] },
          contexto: "Rama 1.3 = ? Paquetes: 70 h · 30 h · 25 h.",
          consigna: "Completa las horas que faltan para equilibrar cada rama.",
          casillas: [{ id: "h", nombre: "Rama 1.3", unidad: "h", clave: 125 }],
          retro: "El padre es la suma de sus hijos: 70 + 30 + 25 = 125." },
        { tipo: "casillas", id: "c5h09-h3", subtemas: ["gp-5-4"], rama: { nombre: "1 App de pedidos v2", padre: null, hijos: [90, 120, 125, 65] },
          contexto: "Ramas: 1.1 = 90 h, 1.2 = 120 h, 1.3 = 125 h, 1.4 = 65 h.",
          consigna: "¿Cuántas horas suma el proyecto?",
          casillas: [{ id: "h", nombre: "Proyecto", unidad: "h", clave: 400 }],
          retro: "Suma las cuatro ramas: 90 + 120 + 125 + 65 = 400." },
        { id: "c5h09-h4", subtemas: ["gp-5-4"], mesa: "practicante",
          contexto: "El practicante dice que el proyecto suma 335 h.",
          consigna: "¿Qué rama se le olvidó?",
          destinos: RAMAS_C5, clave: "r14", retro: "Faltan 65 h: justo la dirección del proyecto, que también va." },
      ],
    },
    {
      tipo: "micros",
      consigna: "Códigos y niveles de la EDT.",
      pasos: [
        { id: "c5h09-c1", subtemas: ["gp-5-4"], barajar: true,
          consigna: "¿Qué código lleva «Pruebas de pago aprobadas»?",
          destinos: [{ id: "132", nombre: "1.3.2" }, { id: "123", nombre: "1.2.3" }, { id: "32", nombre: "3.2" }],
          clave: "132", retro: "Es el segundo paquete de la rama 1.3: 1.3.2." },
        { id: "c5h09-c2", subtemas: ["gp-5-4"], mesa: "practicante",
          contexto: "El practicante propone partir «Informes semanales» en 40 fichas, una por informe.",
          consigna: "¿Conviene descomponer tanto?",
          destinos: [{ id: "no", nombre: "No" }, { id: "si", nombre: "Sí" }],
          clave: "no", retros: { si: "Descomponer de más genera esfuerzo de gestión improductivo." } },
        { id: "c5h09-c3", subtemas: ["gp-5-4"], barajar: true,
          contexto: "La fase de expansión a Bogotá, en 2027, aún no está clara.",
          consigna: "¿Qué haces hoy con esa rama?",
          destinos: [{ id: "alta", nombre: "La dejo alta y la detallo después" }, { id: "ya", nombre: "La detallo ya hasta el último paquete" }],
          clave: "alta", retros: { ya: "Lo lejano se descompone después: planificación gradual." } },
      ],
    },
  ],
};

/* ─── H10 · La caja fuerte (2 etapas) ─── */
export const GP_C5_H10 = {
  id: "gp26-pla-c05-h10-caja-fuerte",
  contexto: "La EDT está lista. La patrocinadora aprobará la línea base del alcance y quiere guardarla bajo llave.",
  rol: "Diriges el proyecto y preparas lo que se aprueba.",
  consigna: "Mete en la caja fuerte solo las tres piezas.",
  cierre: null,
  subtemas: ["gp-5-4"],
  elenco: ["tu", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "Mete en la caja fuerte solo las tres piezas.",
      destinos: [{ id: "entra", nombre: "Entra a la caja fuerte" }, { id: "fuera", nombre: "No entra" }],
      partida: { todas: true },
      banco: con("gp-5-4", [
        it("c5h10-01", "Enunciado del alcance", "entra", "Sin el enunciado aprobado no hay línea base del alcance."),
        it("c5h10-02", "EDT/WBS", "entra", "La EDT es el centro de la línea base."),
        it("c5h10-03", "Diccionario de la EDT", "entra", "El diccionario de la EDT también es parte de la línea base."),
        it("c5h10-04", "Acta de constitución", "fuera", "El acta autoriza el proyecto; no forma parte de la línea base del alcance."),
        it("c5h10-05", "Documentación de requisitos", "fuera", "Los requisitos alimentan la línea base, pero no son una de sus piezas."),
        it("c5h10-06", "Cronograma", "fuera", "El cronograma tiene su propia línea base, la del cronograma."),
      ]),
      despues: { id: "c5h10-07", subtemas: ["gp-5-4"], mesa: "equipo",
        contexto: "Un mes después, el equipo quiere añadir un paquete a la EDT guardada.",
        consigna: "¿Puede abrir la caja él mismo?",
        destinos: [{ id: "no", nombre: "No: solo con control formal de cambios" }, { id: "si", nombre: "Sí, si es pequeño" }],
        clave: "no", retros: { si: "La línea base solo cambia por control formal de cambios." } },
    },
    {
      tipo: "clasificar",
      consigna: "Llena la ficha del diccionario del paquete 1.3.2.",
      destinos: [
        { id: "codigo", nombre: "Código de cuenta" },
        { id: "descripcion", nombre: "Descripción del trabajo" },
        { id: "responsable", nombre: "Organización responsable" },
        { id: "hito", nombre: "Hito del cronograma" },
        { id: "costo", nombre: "Estimación de costos" },
        { id: "aceptacion", nombre: "Criterio de aceptación" },
        { id: "nova", nombre: "No va (a la caneca)" },
      ],
      partida: { todas: true },
      banco: con("gp-5-4", [
        it("c5h10-08", "1.3.2", "codigo", "Es el identificador: código de cuenta."),
        it("c5h10-09", "50 pagos de prueba con tarjetas reales.", "descripcion", "Dice qué trabajo se hace: descripción."),
        it("c5h10-10", "Equipo de pagos.", "responsable", "Es quién lo hace: organización responsable."),
        it("c5h10-11", "Pruebas cerradas el 10 de noviembre.", "hito", "Es una fecha clave: hito del cronograma."),
        it("c5h10-12", "$3,5 millones.", "costo", "Una cifra en pesos es estimación de costo."),
        it("c5h10-13", "Cero pagos con error.", "aceptacion", "Es la condición para aceptarlo: criterio de aceptación."),
        it("c5h10-14", "Opinión del practicante sobre el banco.", "nova", "Es una opinión; el diccionario guarda datos del trabajo."),
        it("c5h10-15", "Lista de todos los interesados del proyecto.", "nova", "Los interesados se registran aparte; aquí va el responsable del paquete."),
      ]),
      despues: [
        { id: "c5h10-16", subtemas: ["gp-5-4"], barajar: true,
          contexto: "Encima de 1.3.2 está la cuenta de control «Pago».",
          consigna: "¿Qué se integra en una cuenta de control?",
          destinos: [{ id: "tres", nombre: "Alcance, presupuesto y cronograma" }, { id: "riesgos", nombre: "Solo los riesgos" }],
          clave: "tres", retros: { riesgos: "Ahí se juntan alcance, presupuesto y cronograma para medir desempeño." } },
        { id: "c5h10-17", subtemas: ["gp-5-4"], barajar: true,
          contexto: "La rama Bogotá 2027 tiene contenido conocido, pero aún sin actividades.",
          consigna: "¿Cómo se llama esa pieza?",
          destinos: [{ id: "planificacion", nombre: "Paquete de planificación" }, { id: "trabajo", nombre: "Paquete de trabajo" }],
          clave: "planificacion", retros: { trabajo: "Contenido conocido sin actividades detalladas: paquete de planificación." } },
      ],
    },
  ],
};

/* ─── H11 · Escáner y puerta de embarque (2 etapas) ─── */
export const GP_C5_H11 = {
  id: "gp26-moc-c05-h11-embarque",
  contexto: "Los primeros entregables de la versión 2 están terminados. Antes de cerrar, deben pasar dos controles distintos.",
  rol: "Diriges el proyecto y llevas cada entregable hasta el cliente.",
  consigna: "¿Esta acción es de calidad o de aceptación?",
  cierre: "Calidad verifica que esté correcto; validar busca que el cliente lo acepte.",
  subtemas: ["gp-5-5"],
  elenco: ["tu", "equipo", "cliente", "patrocinadora"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Esta acción es de calidad o de aceptación?",
      destinos: [
        { id: "calidad", nombre: "Escáner", pista: "Controlar la Calidad" },
        { id: "aceptacion", nombre: "Puerta de embarque", pista: "Validar el Alcance" },
      ],
      partida: { todas: true },
      banco: con("gp-5-5", [
        it("c5h11-01", "El equipo corre 50 pagos para ver si hay errores.", "calidad", "Comprobar que esté correcto es Controlar la Calidad."),
        it("c5h11-02", "Se revisa que el cifrado cumpla la norma de seguridad.", "calidad", "Cumplir requisitos de calidad se verifica antes, en calidad."),
        it("c5h11-03", "Se corrigen dos fallas antes de mostrar la app.", "calidad", "Corregir antes de mostrar es parte de verificar."),
        it("c5h11-04", "Sale un entregable verificado.", "calidad", "El entregable verificado es la salida de calidad."),
        it("c5h11-05", "El cliente revisa la app contra los criterios de aceptación.", "aceptacion", "Revisar con el cliente para aceptar es Validar el Alcance."),
        it("c5h11-06", "La patrocinadora firma la aceptación del conector.", "aceptacion", "La firma formal es la salida de Validar el Alcance."),
        it("c5h11-07", "Se inspecciona el entregable junto al cliente.", "aceptacion", "La inspección con el cliente es la técnica de validar."),
        it("c5h11-08", "Sale un entregable aceptado.", "aceptacion", "El entregable aceptado sale de Validar el Alcance."),
      ]),
    },
    {
      tipo: "clasificar",
      consigna: "Lleva cada entregable a su siguiente paso.",
      destinos: [
        { id: "cerrar", nombre: "Cerrar el Proyecto o Fase" },
        { id: "cambio", nombre: "Solicitud de cambio" },
        { id: "calidad", nombre: "Volver a calidad" },
      ],
      partida: { todas: true },
      banco: con("gp-5-5", [
        it("c5h11-09", "Pasarela de pago: verificada y firmada por la patrocinadora.", "cerrar", "Aceptado formalmente: su documentación pasa a Cerrar el Proyecto o Fase."),
        it("c5h11-10", "Puntos: verificado; el cliente lo rechaza porque no ve su saldo.", "cambio", "No aceptado: se documenta por qué y se pide un cambio."),
        it("c5h11-11", "Conector de WhatsApp: terminado, sin pruebas de calidad.", "calidad", "A validar entran entregables verificados; este aún no lo está."),
        it("c5h11-12", "Seguimiento: verificado; el cliente lo rechaza porque el mapa falla.", "cambio", "Rechazado por defecto: solicitud de cambio para repararlo."),
      ]),
      despues: { id: "c5h11-13", subtemas: ["gp-5-5"], barajar: true,
        consigna: "¿A dónde va la solicitud de cambio?",
        destinos: [{ id: "control", nombre: "Realizar el Control Integrado de Cambios" }, { id: "equipo", nombre: "Directo al equipo" }],
        clave: "control", retros: { equipo: "Toda solicitud de cambio se revisa en el control integrado de cambios." } },
    },
  ],
};

/* ─── H12 · El globo que se infla (4 pedidos en orden + predecir la tendencia) ─── */
const ACCIONES_GLOBO = [
  { id: "sinpapeles", nombre: "Agregarlo sin papeles" },
  { id: "cambio", nombre: "Solicitud de cambio" },
  { id: "yaesta", nombre: "Ya está en el alcance" },
];
export const GP_C5_H12 = {
  id: "gp26-moc-c05-h12-globo",
  contexto: "En la tercera semana empiezan los «favorcitos»: pedidos pequeños que llegan por pasillo y sin papel.",
  rol: "Diriges el proyecto y cuidas la línea base del alcance.",
  consigna: "Decide qué haces con cada pedido.",
  cierre: "Corrupción del alcance: crecer sin ajustar tiempo, costo y recursos.",
  subtemas: ["gp-5-6"],
  elenco: ["tu", "cliente", "patrocinadora"],
  etapas: [{
    tipo: "micros",
    consigna: "Decide qué haces con cada pedido.",
    pasos: [
      { id: "c5h12-p1", subtemas: ["gp-5-6"], pedido: 1, mesa: "cliente", consigna: "Decide qué haces con cada pedido.",
        contexto: "El cliente pide un botón para pagar con QR: «es solo un botón».",
        destinos: ACCIONES_GLOBO, clave: "cambio",
        retros: { sinpapeles: "Ampliar sin ajustar tiempo ni costo es corrupción del alcance.", yaesta: "El QR no está en el enunciado: está fuera del alcance." } },
      { id: "c5h12-p2", subtemas: ["gp-5-6"], pedido: 2, mesa: "cliente", consigna: "Decide qué haces con cada pedido.",
        contexto: "El cliente pide pagar con débito; el enunciado dice «débito y crédito».",
        destinos: ACCIONES_GLOBO, clave: "yaesta",
        retros: { sinpapeles: "No es algo nuevo: ya está en el enunciado.", cambio: "El enunciado ya incluye débito: no hace falta un cambio." } },
      { id: "c5h12-p3", subtemas: ["gp-5-6"], pedido: 3, mesa: "patrocinadora", consigna: "Decide qué haces con cada pedido.",
        contexto: "La patrocinadora pide conectar la app con la caja registradora: «yo soy la que paga».",
        destinos: ACCIONES_GLOBO, clave: "cambio",
        retros: { sinpapeles: "Aunque lo pida la patrocinadora, el cambio pasa por control integrado.", yaesta: "La conexión con la caja no aparece en el enunciado." } },
      { id: "c5h12-p4", subtemas: ["gp-5-6"], pedido: 4, consigna: "Decide qué haces con cada pedido.",
        contexto: "El análisis de variación muestra 6 paquetes nuevos sin aprobar; el umbral era 2.",
        destinos: ACCIONES_GLOBO, clave: "cambio",
        retros: { sinpapeles: "Superar el umbral exige actuar, no seguir sumando.", yaesta: "Esos paquetes no fueron aprobados: no son de la línea base." } },
      { id: "c5h12-tendencia", subtemas: ["gp-5-6"], tendencia: [1, 2, 4],
        contexto: "Cambios sin aprobar: semana 1, uno; semana 2, dos; semana 3, cuatro.",
        consigna: "¿El control del alcance mejora o empeora?",
        destinos: [{ id: "empeora", nombre: "Empeora" }, { id: "mejora", nombre: "Mejora" }],
        clave: "empeora", retros: { mejora: "La serie crece cada semana: la tendencia se deteriora." } },
    ],
  }],
};

export const PIEZAS_TEXTO_C5 = [GP_C5_H01, GP_C5_H02, GP_C5_H03, GP_C5_H04, GP_C5_H05, GP_C5_H06, GP_C5_H07, GP_C5_H08, GP_C5_H09, GP_C5_H10, GP_C5_H11, GP_C5_H12];
