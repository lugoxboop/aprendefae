/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · CAP. 2 «EL ENTORNO» — LOS TEXTOS DE LAS 4 HACER
 *
 * Copia fiel de orquestador/conocimiento/gestion-proyectos/disenos/
 * c1-c2-hacer.md (§2, H15 a H18). Misma forma que ../introduccion/textos.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTEMAS = {
  "gp-eef": "Factores ambientales de la empresa",
  "gp-opa": "Activos de los procesos de la organización",
  "gp-sistemas": "Sistemas organizacionales y gobernanza",
  "gp-gestion": "Elementos de gestión",
  "gp-estructuras": "Estructuras y autoridad del director",
  "gp-pmo": "Oficina de dirección de proyectos",
};

const it = (id, texto, clave, retro, extra = {}) => ({ id, texto, clave, retro, ...extra });

/* ─── H15 · ¿Lo controlas o te controla? (2 etapas) ─── */
export const GP_H15 = {
  id: "gp-h15-control",
  contexto: "Vas a planificar la bodega de Santa Marta. Antes revisas qué te ayuda y qué te limita.",
  rol: "Diriges el proyecto de la bodega.",
  consigna: "¿Factor ambiental o activo de la organización?",
  cierre: null,
  subtemas: ["gp-eef", "gp-opa"],
  elenco: ["tu", "equipo"],
  etapas: [
    {
      tipo: "clasificar",
      consigna: "¿Factor ambiental o activo de la organización?",
      destinos: [
        { id: "eef", nombre: "EEF", pista: "no lo controla tu equipo" },
        { id: "opa", nombre: "OPA", pista: "lo tiene la organización para usarlo" },
      ],
      /* 8, con los dos EEF internos siempre: son la trampa. */
      partida: { n: 6, siempre: ["h15-05", "h15-06"] },
      banco: [
        it("h15-01", "La tasa de interés subió este año.", "eef", "Es una condición financiera externa que no controlas.", { subtemas: ["gp-eef"], matiz: "externo" }),
        it("h15-02", "La ley de seguridad laboral para bodegas.", "eef", "Es una restricción legal: viene de fuera.", { subtemas: ["gp-eef"], matiz: "externo" }),
        it("h15-03", "Temporada de lluvias en Santa Marta.", "eef", "El clima es un factor ambiental físico.", { subtemas: ["gp-eef"], matiz: "externo" }),
        it("h15-04", "Un competidor abrió bodega al lado.", "eef", "Las condiciones del mercado no las controlas.", { subtemas: ["gp-eef"], matiz: "externo" }),
        it("h15-05", "En Altamira todo lo aprueba la junta.", "eef", "Es cultura y gobernanza: interna, pero no la controlas.", { subtemas: ["gp-eef"], matiz: "interno" }),
        it("h15-06", "Nadie en el equipo sabe manejar montacargas.", "eef", "Es capacidad de los empleados: factor interno.", { subtemas: ["gp-eef"], matiz: "interno" }),
        it("h15-07", "La plantilla de cronograma de la PMO.", "opa", "Las plantillas son activos de la organización.", { subtemas: ["gp-opa"] }),
        it("h15-08", "Lecciones aprendidas de la bodega de Manizales.", "opa", "Es base de conocimiento de Altamira: activo.", { subtemas: ["gp-opa"] }),
        it("h15-09", "La lista de proveedores preaprobados.", "opa", "Es un activo: lista propia de la organización.", { subtemas: ["gp-opa"] }),
        it("h15-10", "El procedimiento para aprobar cambios.", "opa", "Es un procedimiento de la organización: activo.", { subtemas: ["gp-opa"] }),
      ],
    },
    {
      tipo: "clasificar",
      consigna: "¿Tu equipo puede actualizarlo durante el proyecto?",
      destinos: [
        { id: "actualiza", nombre: "Se actualiza en el proyecto", pista: "bases de conocimiento" },
        { id: "pmo", nombre: "Lo cambia la PMO con su procedimiento", pista: "procesos, políticas y procedimientos" },
      ],
      partida: { todas: true },
      banco: [
        it("h15-11", "Lecciones aprendidas de esta bodega.", "actualiza", "Las bases de conocimiento crecen durante el proyecto.", { subtemas: ["gp-opa"] }),
        it("h15-12", "Costos reales en el repositorio financiero.", "actualiza", "Los datos financieros se registran sobre la marcha.", { subtemas: ["gp-opa"] }),
        it("h15-13", "Registro de defectos e incidentes.", "actualiza", "Los repositorios de incidentes se alimentan en el proyecto.", { subtemas: ["gp-opa"] }),
        it("h15-14", "La política de seguridad de Altamira.", "pmo", "Las políticas se cambian con su propio procedimiento, no en el proyecto.", { subtemas: ["gp-opa"] }),
        it("h15-15", "El procedimiento de control de cambios.", "pmo", "Es un procedimiento de la organización: no lo reescribe el proyecto.", { subtemas: ["gp-opa"] }),
      ],
    },
  ],
};

/* ─── H16 · El organigrama con nudos (4 de 6 nudos + predecir) ─── */
const n = (id, texto, clave, distractores) => ({
  id, texto, clave,
  destinos: [{ id: clave, nombre: clave }, ...distractores.map(([nombre]) => ({ id: nombre, nombre }))],
  retros: Object.fromEntries(distractores),
  barajar: true, subtemas: ["gp-gestion"],
});
export const GP_H16 = {
  id: "gp-h16-nudos",
  contexto: "En la bodega de Santa Marta las órdenes se cruzan y el equipo anda confundido.",
  rol: "Diriges la bodega y buscas qué principio de gestión falla.",
  consigna: "Toca cada nudo y nombra el principio que rompe.",
  cierre: null,
  subtemas: ["gp-gestion", "gp-sistemas"],
  elenco: ["tu", "gerente", "equipo"],
  etapas: [{
    tipo: "micros",
    consigna: "Toca cada nudo y nombra el principio que rompe.",
    pasos: [
      { grupo: "nudos", sortear: 4, consigna: "Toca cada nudo y nombra el principio que rompe.", items: [
        n("h16-01", "El hámster recibe órdenes tuyas y del gerente funcional, y se contradicen.", "Unidad de mando",
          [["Unidad de dirección", "Aquí el problema es quién da órdenes a una persona."], ["División del trabajo", "El trabajo está repartido; fallan las órdenes."]]),
        n("h16-02", "Hay dos planes distintos para el mismo objetivo, con dos encargados.", "Unidad de dirección",
          [["Unidad de mando", "No es una persona con dos jefes: son dos planes."], ["Disciplina", "Nadie desobedece; el problema es tener dos planes."]]),
        n("h16-03", "Al jefe de turno le exigen resultados, pero nadie le dio autoridad.", "Autoridad otorgada para hacer el trabajo",
          [["Pago justo", "No es el salario: le falta autoridad."], ["Canales claros", "Sabe a quién hablar; no puede decidir."]]),
        n("h16-04", "Cada área persigue su propia meta aunque perjudique la bodega.", "Metas generales sobre las individuales",
          [["Moral óptima", "No es ánimo: cada área pone su meta primero."], ["Uso óptimo de recursos", "La raíz es la prioridad de metas."]]),
        n("h16-05", "Los montacargas llegan una semana después de necesitarse.", "Materiales adecuados en el momento adecuado",
          [["División del trabajo", "El reparto está bien; falla el momento."], ["Seguridad de las personas", "No hay un riesgo físico aquí: hay retraso."]]),
        n("h16-06", "Nadie sabe a quién pedir un permiso.", "Canales de comunicación claros",
          [["Unidad de mando", "No hay órdenes cruzadas: falta el canal."], ["Disciplina", "Nadie incumple reglas; no saben a quién acudir."]]),
      ] },
      { id: "h16-07", subtemas: ["gp-sistemas"],
        contexto: "El gerente de la bodega optimiza al máximo su área: compra montacargas extra con el dinero de toda la empresa.",
        consigna: "¿Mejora toda Altamira?",
        destinos: [{ id: "si", nombre: "Sí, seguro" }, { id: "no", nombre: "No necesariamente" }],
        clave: "no", retros: { si: "Sistema y componentes no se optimizan a la vez." }, revela: "cartagena" },
    ],
  }],
};

/* ─── H17 · El dial de la autoridad (explorar + reto) ─── */
export const ESTRUCTURAS = [
  { id: "funcional", nombre: "Funcional", autoridad: "Poca o ninguna", aguja: 0.08, bolsa: "Gerente funcional", lado: "gerente", rol: "Tiempo parcial" },
  { id: "matriz-debil", nombre: "Matriz débil", autoridad: "Baja", aguja: 0.25, bolsa: "Gerente funcional", lado: "gerente", rol: "Tiempo parcial" },
  { id: "matriz-balanceada", nombre: "Matriz balanceada", autoridad: "Baja a moderada", aguja: 0.45, bolsa: "Mezclado", lado: "medio", rol: "Tiempo parcial" },
  { id: "matriz-fuerte", nombre: "Matriz fuerte", autoridad: "Moderada a alta", aguja: 0.7, bolsa: "Director del proyecto", lado: "tu", rol: "Tiempo completo" },
  { id: "proyectos", nombre: "Orientada a proyectos", autoridad: "Elevada a casi total", aguja: 0.94, bolsa: "Director del proyecto", lado: "tu", rol: "Tiempo completo" },
];
export const GP_H17 = {
  id: "gp-h17-dial",
  contexto: "Altamira estudia reorganizarse. Según la estructura, tu poder como director(a) cambia mucho.",
  rol: "Diriges la bodega y negocias recursos con el gerente funcional.",
  consigna: "Gira el dial y mira qué cambia.",
  cierre: "No hay una estructura única que sirva a toda organización.",
  subtemas: ["gp-estructuras"],
  elenco: ["tu", "gerente"],
  etapas: [{
    tipo: "dial",
    consigna: "Gira el dial y mira qué cambia.",
    consignaReto: "Gira el dial a la estructura que describe esto.",
    exploracion: { segundos: 30, posiciones: 5 },
    posiciones: ESTRUCTURAS,
    banco: [
      it("h17-01", "Manejas el presupuesto y tu autoridad es casi total.", "proyectos", "Autoridad elevada a casi total: orientada a proyectos."),
      it("h17-02", "Manejas el presupuesto; tu autoridad es moderada a alta, a tiempo completo.", "matriz-fuerte", "Moderada a alta con presupuesto tuyo: matriz fuerte."),
      it("h17-03", "El presupuesto lo manejan entre los dos.", "matriz-balanceada", "Presupuesto mezclado: matriz balanceada."),
      it("h17-04", "El presupuesto es del gerente; tu autoridad es baja y coordinas a ratos.", "matriz-debil", "Autoridad baja, no nula, y presupuesto del gerente: matriz débil."),
      it("h17-05", "Todo va por departamentos; tu autoridad es poca o ninguna.", "funcional", "Por departamentos y casi sin autoridad: funcional."),
    ],
  }],
};

/* ─── H18 · Tres empresas, tres PMO (2 rondas de 3) ─── */
export const GP_H18 = {
  id: "gp-h18-pmo",
  contexto: "Tres empresas aliadas de Altamira quieren crear su oficina de proyectos. Cada una necesita algo distinto.",
  rol: "La PMO de Altamira te pide asesorarlas como director(a).",
  consigna: "Dale a cada empresa el tipo de PMO.",
  cierre: null,
  subtemas: ["gp-pmo"],
  elenco: ["tu", "pmo"],
  etapas: [{
    tipo: "clasificar",
    consigna: "Dale a cada empresa el tipo de PMO.",
    destinos: [
      { id: "apoyo", nombre: "De apoyo", pista: "control reducido" },
      { id: "control", nombre: "De control", pista: "control moderado" },
      { id: "directiva", nombre: "Directiva", pista: "control elevado" },
    ],
    partida: { rondasPorClave: 2 },
    banco: [
      it("h18-01", "Quiere plantillas, capacitación y lecciones aprendidas, sin imponer nada.", "apoyo", "Solo pide consejo y recursos: control reducido, de apoyo."),
      it("h18-02", "Los directores piden un lugar para consultar proyectos anteriores.", "apoyo", "Un repositorio de proyectos es lo típico de la de apoyo."),
      it("h18-03", "Quiere que todos usen la misma metodología y formularios, y auditarlos.", "control", "Exigir cumplimiento y auditar es control moderado."),
      it("h18-04", "Sus proyectos fallan porque cada uno usa formatos distintos.", "control", "Necesita imponer plantillas comunes: PMO de control."),
      it("h18-05", "Quiere que la PMO asigne a los directores y dirija los proyectos.", "directiva", "Dirigir los proyectos ella misma es control elevado."),
      it("h18-06", "La junta quiere que los directores rindan cuentas a la PMO.", "directiva", "Si le rinden cuentas, la PMO es directiva."),
    ],
  }],
};

export const PIEZAS_TEXTO_ENTORNO = [GP_H15, GP_H16, GP_H17, GP_H18];
