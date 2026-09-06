/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTENIDO DE "LA SALA DE CONTROL DE LA ECONOMÍA".
 *
 * Fuente: la presentación del profesor (PyEM-PolEc-02-2026-003C), Temas 1-3 y
 * objetivos específicos 1 a 5.
 *
 * ───────────────────── LA REGLA DE NO INVENCIÓN ─────────────────────
 *
 * Ninguna cifra de este archivo se generó, estimó ni completó. Todas están
 * copiadas del material. Donde el profesor no da una meta, aquí no hay meta:
 * el campo va en null y la interfaz tiene que funcionar sin él. Donde no hay
 * cifra ninguna, no hay indicador numérico en absoluto.
 *
 * SI ALGUNA VEZ HACE FALTA UN NÚMERO QUE NO ESTÁ AQUÍ, no se pone: es una
 * señal de que el diseño está pidiendo algo que la fuente no da, y se resuelve
 * visualmente o se pregunta.
 *
 * SOBRE LAS ESCALAS DE LOS INDICADORES. `escala` NO es un dato del profesor:
 * es el rango de dibujo de cada esfera, y por eso NUNCA aparece escrito en
 * pantalla. Solo decide dónde cae la aguja dentro del arco. La relación entre
 * el valor actual y la meta —que es lo que el estudiante tiene que percibir—
 * es fiel, porque los dos se sitúan contra la misma escala.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────── PIEZA 2 — El tablero de fallas (Objetivo 2) ─────────────── */

/*
 * `mejorEs` no es decorativo: en siete de los ocho problemas lo deseable es un
 * valor más bajo, pero en el crecimiento es al revés. Si la zona roja fuera
 * siempre "arriba", el tablero enseñaría que crecer poco es bueno.
 */
export const FALLAS = [
  {
    id: "crecimiento",
    nombre: "Restricciones al crecimiento",
    definicion:
      "El ritmo al que la economía consigue aumentar su producción. Cuando se queda por debajo de lo que podría, hay capacidad instalada y trabajo que no se están aprovechando.",
    actual: { valor: 2.6, texto: "2,6%", nota: "fin 2025" },
    meta: { valor: 5.6, texto: "5,6%" },
    escala: { min: 0, max: 8 },
    mejorEs: "alto",
    unidad: "%",
  },
  {
    id: "inflacion",
    nombre: "Inflación",
    definicion:
      "El aumento sostenido y generalizado del nivel de precios. Reduce lo que alcanza a comprar un mismo ingreso, y golpea más a quien no tiene cómo protegerse.",
    actual: { valor: 6, texto: "6%" },
    meta: { valor: 3.4, texto: "3,4%" },
    escala: { min: 0, max: 10 },
    mejorEs: "bajo",
    unidad: "%",
  },
  {
    id: "desempleo",
    nombre: "Desempleo",
    definicion:
      "La parte de la población que busca trabajo y no lo encuentra. Es capacidad productiva disponible que la economía no está empleando.",
    actual: { valor: 8.1, texto: "8,1%" },
    /* El material no fija meta para este. No se inventa una. */
    meta: null,
    escala: { min: 0, max: 15 },
    mejorEs: "bajo",
    unidad: "%",
  },
  {
    id: "deficit-fiscal",
    nombre: "Déficit fiscal",
    definicion:
      "La diferencia entre lo que el Estado gasta y lo que recauda. Sostenida en el tiempo obliga a endeudarse, y la deuda compromete el gasto de los años siguientes.",
    actual: { valor: 9.4, texto: "9,4%", nota: "proyectado 2027" },
    meta: { valor: 4.5, texto: "4,5%" },
    escala: { min: 0, max: 12 },
    mejorEs: "bajo",
    unidad: "%",
  },
  {
    id: "deficit-exterior",
    nombre: "Déficit exterior (comercial)",
    definicion:
      "El saldo negativo entre lo que el país vende al exterior y lo que le compra. Significa que se importa más de lo que se exporta.",
    actual: { valor: 8198.7, texto: "US$8.198,7 millones" },
    meta: null,
    escala: { min: 0, max: 12000 },
    mejorEs: "bajo",
    unidad: "US$ millones",
  },
  {
    id: "concentracion-renta",
    nombre: "Concentración de la renta",
    definicion:
      "Cuán desigualmente se reparte el ingreso entre los hogares. El coeficiente de Gini lo resume entre 0, reparto perfectamente igual, y 1, todo el ingreso en una sola mano.",
    actual: { valor: 0.54, texto: "GINI 0,54" },
    /*
     * El profesor da una dirección, no un punto. Se dibuja la dirección: una
     * flecha hacia el extremo bajo del arco. Poner una marca en un valor
     * concreto sería inventarse la meta.
     */
    meta: { direccion: "bajo", texto: "más bajo" },
    escala: { min: 0, max: 1 },
    mejorEs: "bajo",
    unidad: "índice",
  },
  {
    id: "asignacion-recursos",
    nombre: "Inadecuada asignación de recursos",
    definicion:
      "Los recursos no llegan a donde más falta hacen. Se ve en la población que sigue sin cubrir necesidades básicas aunque existan medios para atenderlas.",
    actual: { valor: 14.1, texto: "14,1%", nota: "de la población con 1 o más carencias" },
    meta: null,
    escala: { min: 0, max: 30 },
    mejorEs: "bajo",
    unidad: "%",
  },
];

/*
 * El octavo problema va aparte, y esa separación es el punto.
 *
 * No tiene cifra ni meta: solo existe como advertencia cualitativa. Dibujarlo
 * como una esfera más obligaría a inventarle una aguja, así que se muestra con
 * otra forma —una banda de alerta— que pertenece al mismo tablero pero declara
 * que es de otra clase. Que se vea distinto es información, no un hueco.
 */
export const FALLA_CUALITATIVA = {
  id: "ambiental",
  nombre: "Impactos ambientales indeseados",
  definicion:
    "Los costos que la actividad económica descarga sobre el ambiente y que no paga quien los produce.",
  senales: ["Contaminación", "Gases de efecto invernadero"],
};

/* ──────── PIEZA 1 — ¿Autorregulación o intervención? (Tema 1, Obj. 1) ──────── */

export const PREGUNTA_PREDICCION = "¿Qué crees que pasará si nadie interviene?";

/* Definición de Gen, literal. */
export const DEFINICION_FALLO_MERCADO =
  "El mercado se cuida solo casi siempre — hasta que no. Un fallo del mercado es ese momento exacto en que dejarlo solo empeora las cosas en vez de arreglarlas.";

export const MERCADO_CASO = {
  titulo: "El arriendo de vivienda en Bogotá",
  /*
   * SIN UNA SOLA CIFRA. Ni precios, ni cantidades, ni porcentajes: el mercado
   * se muestra como movimiento relativo. El estudiante tiene que VER la
   * escasez y el precio sin freno, no leer estadísticas inventadas.
   */
  entrada:
    "Un mercado sencillo: gente que busca dónde vivir y viviendas que se ofrecen en arriendo. Nadie lo regula.",
};

/* Las fases del mercado. La duración es de dibujo, no un dato económico. */
export const FASES_MERCADO = [
  {
    id: "estable",
    rotulo: "El mercado se acomoda solo",
    texto:
      "La oferta y la demanda se buscan y se encuentran. Cuando falta vivienda el precio sube un poco y aparecen más arriendos; cuando sobra, baja. Funciona, y funciona bien.",
    /* Larga a propósito: si dura dos segundos, la estabilidad no se siente. */
    ms: 14000,
  },
  {
    id: "tension",
    rotulo: "Algo empieza a no cuadrar",
    texto:
      "Llega más gente a la ciudad de la que el mercado consigue alojar. El precio sube, pero construir vivienda nueva toma años: la oferta ya no puede responder al mismo ritmo.",
    ms: 9000,
  },
  {
    id: "fallo",
    rotulo: "El fallo del mercado",
    texto:
      "La vivienda escasea y el precio sigue subiendo sin nada que lo detenga. Dejarlo solo ya no corrige el problema: lo agrava. Aquí es exactamente donde aparece la pregunta de si el Estado debe intervenir.",
    ms: null,
  },
];
