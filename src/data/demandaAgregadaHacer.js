/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SIETE JUEGOS DE DEMANDA AGREGADA — bancos, respuestas y devoluciones.
 *
 * Todo el contenido de la mitad "Hacer" del tema vive aquí. Los componentes
 * dibujan y puntúan; ni uno solo lleva un enunciado escrito dentro.
 *
 * ═══════════ LAS DEVOLUCIONES SON LITERALES ═══════════
 *
 * Cada cadena de retroalimentación está exactamente como se especificó, emoji
 * incluido. El emoji forma parte de la cadena y no se sustituye por un icono:
 * lo que se añade al pintarla es un equivalente en texto para lectores de
 * pantalla, y eso es cosa del componente, no del dato.
 *
 * Las plantillas con [corchetes] son huecos que rellena el componente. El
 * marco de texto alrededor del hueco tampoco se toca.
 *
 * ═══════════ LOS ids SON LA UNIDAD DEL PANEL ═══════════
 *
 * Cada ítem que puede acertarse o fallarse lleva un id estable, y es el que
 * viaja a fp_detalle. Dentro de una actividad NO PUEDEN REPETIRSE: dos ítems
 * con el mismo id se suman en la misma fila del panel y el docente ve el
 * promedio de dos preguntas distintas creyendo que es una.
 *
 * Eso no lo detecta ningún error en tiempo de ejecución —el insert no se
 * queja—, así que lo comprueba detalle-ids.test.mjs sobre estos mismos datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 1 — "Lectura de electrocardiograma"
 * Recordar · Medio. Ocho definiciones y cuatro fragmentos de la fórmula.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Los ocho términos. El id es la unidad de fp_detalle en la etapa 1: las dos
 * variantes de una definición preguntan LO MISMO —son paráfrasis— así que
 * comparten fila a propósito. Distinguirlas partiría en dos la única pregunta
 * que el docente quiere ver.
 */
export const TERMINOS_ECG = [
  { id: "c-autonomo", nombre: "Consumo autónomo (C̄)" },
  { id: "pmc", nombre: "Propensión Marginal a Consumir (c)" },
  { id: "renta-disp", nombre: "Renta disponible" },
  { id: "i-autonoma", nombre: "Inversión autónoma (Ī)" },
  { id: "elasticidad", nombre: "Elasticidad interés de la inversión (b)" },
  { id: "tasa", nombre: "Tasa de interés (i)" },
  { id: "gasto", nombre: "Gasto público (Ḡ)" },
  { id: "tipo-cambio", nombre: "Tipo de cambio (tc)" },
];

/*
 * Dieciséis definiciones, dos por término. Se saca UNA DE CADA PAR, así que
 * los ocho términos aparecen siempre y lo que cambia entre partidas es la
 * redacción. Un banco de dieciséis del que se sacaran ocho al azar dejaría
 * términos fuera y repetiría otros.
 */
export const DEFINICIONES_ECG = [
  { id: "1a", termino: "c-autonomo", texto: "La parte del consumo de las familias que no depende del ingreso — existe incluso con renta cero." },
  { id: "1b", termino: "c-autonomo", texto: "El nivel de consumo que una familia mantendría aunque no tuviera ningún ingreso." },
  { id: "2a", termino: "pmc", texto: "El porcentaje de la renta disponible que las familias destinan a consumir, no a ahorrar." },
  { id: "2b", termino: "pmc", texto: "De cada peso adicional de renta disponible, cuánto termina gastándose en vez de ahorrarse." },
  { id: "3a", termino: "renta-disp", texto: "Lo que le queda a una familia después de sumar transferencias y restar impuestos." },
  { id: "3b", termino: "renta-disp", texto: "La renta total, más lo que el Estado transfiere, menos lo que se paga en impuestos." },
  { id: "4a", termino: "i-autonoma", texto: "La inversión que las empresas harían incluso si la tasa de interés fuera cero." },
  { id: "4b", termino: "i-autonoma", texto: "El monto que las empresas invertirían sin importar qué tan cara esté pedir prestado." },
  { id: "5a", termino: "elasticidad", texto: "Qué tan sensible es la inversión a los cambios en la tasa de interés." },
  { id: "5b", termino: "elasticidad", texto: "Qué tanto se mueve la inversión cuando la tasa de interés sube o baja un punto." },
  { id: "6a", termino: "tasa", texto: "El costo de pedir dinero prestado, fijado por el Banco de la República." },
  { id: "6b", termino: "tasa", texto: "El precio de pedir dinero prestado, definido por el banco central del país." },
  { id: "7a", termino: "gasto", texto: "El gasto del Estado — en este modelo, no depende de ninguna otra variable." },
  { id: "7b", termino: "gasto", texto: "El gasto estatal — en este modelo no reacciona a ninguna otra variable de la fórmula." },
  { id: "8a", termino: "tipo-cambio", texto: "Cuántos pesos colombianos hay que pagar por un dólar." },
  { id: "8b", termino: "tipo-cambio", texto: "El precio del dólar medido en pesos colombianos." },
];

/*
 * Etapa 2: seis fragmentos de la fórmula, cuatro por partida. Las seis
 * lecturas se ofrecen siempre como opciones, también las de los fragmentos que
 * no salieron: así los distractores son lecturas reales de la fórmula y no
 * relleno.
 */
export const FRAGMENTOS_ECG = [
  {
    id: "c-barra",
    fragmento: "C̄",
    lectura: "Consumo autónomo",
    acierto: "✅ Es el término que no depende de nada más en la fórmula.",
  },
  {
    id: "c-rd",
    fragmento: "c(Y+TR−tY)",
    lectura: "La MPC aplicada a la Renta disponible",
    acierto: "✅ Correcto — la propensión multiplicando lo que queda tras impuestos y transferencias.",
  },
  {
    id: "menos-bi",
    fragmento: "−bi",
    lectura: "Lo que la tasa le resta a la Inversión",
    acierto: "✅ Correcto — nota el signo negativo, por eso resta.",
  },
  {
    id: "f-tc",
    fragmento: "f(tc)",
    lectura: "XN en función del tipo de cambio",
    acierto: "✅ Correcto — el modelo no da fórmula lineal exacta, solo la relación.",
  },
  {
    id: "t-y",
    fragmento: "tY",
    lectura: "El monto total de impuestos",
    acierto: "✅ Correcto — es la tasa aplicada a toda la renta.",
  },
  {
    id: "y-tr",
    fragmento: "Y+TR",
    lectura: "Renta más transferencias, antes de impuestos",
    acierto: "✅ Correcto — falta restar los impuestos para llegar a la Renta Disponible.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 2 — "El termómetro de reacciones"
 * Comprender · Medio. Doce cambios, seis por partida.
 *
 * DOS RONDAS NO HABLAN DE DIRECCIÓN SINO DE MAGNITUD. Las de elasticidad
 * preguntan si la Inversión se mueve mucho o poco, no hacia dónde. La regla de
 * error dinámica —la de "se mueven en la dirección [correcta]"— diría algo
 * falso ahí, así que esas dos llevan su propio texto de error. Las otras diez
 * usan la plantilla tal cual.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const REACCIONES = [
  {
    id: "sube-y",
    cambio: "Sube la Renta (Y)",
    variable: "la Renta (Y)",
    componente: "el Consumo",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "El Consumo sube" }, { id: "baja", texto: "El Consumo baja" }],
    correcta: "sube",
    acierto: "✅ Más renta significa más renta disponible, y una parte se consume.",
  },
  {
    id: "sube-t",
    cambio: "Sube la tasa impositiva (t)",
    variable: "la tasa impositiva (t)",
    componente: "el Consumo",
    relacion: "contraria",
    opciones: [{ id: "sube", texto: "El Consumo sube" }, { id: "baja", texto: "El Consumo baja" }],
    correcta: "baja",
    acierto: "✅ Más impuestos reducen la renta disponible.",
  },
  {
    id: "sube-i",
    cambio: "Sube la tasa de interés (i)",
    variable: "la tasa de interés (i)",
    componente: "la Inversión",
    relacion: "contraria",
    opciones: [{ id: "sube", texto: "La Inversión sube" }, { id: "baja", texto: "La Inversión baja" }],
    correcta: "baja",
    acierto: "✅ Pedir prestado para invertir se vuelve más caro.",
  },
  {
    id: "sube-i-elast",
    cambio: "La tasa de interés sube Y la elasticidad (b) es alta, ¿cae mucho o poco la Inversión?",
    variable: "la tasa de interés (i)",
    componente: "la Inversión",
    opciones: [{ id: "mucho", texto: "Cae mucho" }, { id: "poco", texto: "Cae poco" }],
    correcta: "mucho",
    acierto: "✅ Una elasticidad alta significa que la Inversión reacciona con fuerza.",
    /* Aquí el error no es de dirección sino de cuánto. */
    error: "❌ Revisa la magnitud — con una elasticidad (b) alta, la Inversión reacciona con fuerza, no apenas.",
  },
  {
    id: "sube-g",
    cambio: "Sube el Gasto público (Ḡ)",
    variable: "el Gasto público (Ḡ)",
    componente: "la Demanda Agregada",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "La DA sube directo" }, { id: "baja", texto: "La DA baja directo" }],
    correcta: "sube",
    acierto: "✅ El gasto público entra directo a la Demanda Agregada.",
  },
  {
    id: "sube-tc",
    cambio: "Sube el tipo de cambio (el peso se devalúa)",
    variable: "el tipo de cambio (tc)",
    componente: "las Exportaciones Netas",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "Las XN suben" }, { id: "baja", texto: "Las XN bajan" }],
    correcta: "sube",
    acierto: "✅ Un peso más débil hace más competitivas las exportaciones.",
  },
  {
    id: "baja-y",
    cambio: "Baja la Renta (Y)",
    variable: "la Renta (Y)",
    componente: "el Consumo",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "El Consumo sube" }, { id: "baja", texto: "El Consumo baja" }],
    correcta: "baja",
    acierto: "✅ Menos renta significa menos renta disponible.",
  },
  {
    id: "baja-t",
    cambio: "Baja la tasa impositiva (t)",
    variable: "la tasa impositiva (t)",
    componente: "el Consumo",
    relacion: "contraria",
    opciones: [{ id: "sube", texto: "El Consumo sube" }, { id: "baja", texto: "El Consumo baja" }],
    correcta: "sube",
    acierto: "✅ Menos impuestos dejan más renta disponible.",
  },
  {
    id: "baja-i",
    cambio: "Baja la tasa de interés (i)",
    variable: "la tasa de interés (i)",
    componente: "la Inversión",
    relacion: "contraria",
    opciones: [{ id: "sube", texto: "La Inversión sube" }, { id: "baja", texto: "La Inversión baja" }],
    correcta: "sube",
    acierto: "✅ Pedir prestado para invertir se abarata.",
  },
  {
    id: "baja-i-elast",
    cambio: "La tasa de interés baja Y la elasticidad (b) es alta, ¿sube mucho o poco la Inversión?",
    variable: "la tasa de interés (i)",
    componente: "la Inversión",
    opciones: [{ id: "mucho", texto: "Sube mucho" }, { id: "poco", texto: "Sube poco" }],
    correcta: "mucho",
    acierto: "✅ Una elasticidad alta amplifica cualquier cambio en la tasa.",
    error: "❌ Revisa la magnitud — con una elasticidad (b) alta, la Inversión reacciona con fuerza, no apenas.",
  },
  {
    id: "baja-g",
    cambio: "Baja el Gasto público (Ḡ)",
    variable: "el Gasto público (Ḡ)",
    componente: "la Demanda Agregada",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "La DA sube directo" }, { id: "baja", texto: "La DA baja directo" }],
    correcta: "baja",
    acierto: "✅ El gasto público sale directo de la Demanda Agregada.",
  },
  {
    id: "baja-tc",
    cambio: "Baja el tipo de cambio (el peso se aprecia)",
    variable: "el tipo de cambio (tc)",
    componente: "las Exportaciones Netas",
    relacion: "misma",
    opciones: [{ id: "sube", texto: "Las XN suben" }, { id: "baja", texto: "Las XN bajan" }],
    correcta: "baja",
    acierto: "✅ Un peso más fuerte encarece las exportaciones para el exterior.",
  },
];

/** La plantilla de error dinámica, con sus tres huecos rellenos. */
export function errorReaccion(r) {
  if (r.error) return r.error;
  return "❌ Revisa la relación — " + r.variable + " y " + r.componente +
    " se mueven en la dirección " + r.relacion + ", no en la que elegiste.";
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 3 — "Banco de transfusiones"
 * Aplicar · Difícil. Ejemplos que se desvanecen (Renkl & Atkinson).
 *
 * Tres rondas con el MISMO cálculo y cada vez menos andamio:
 *
 *   1. Resuelta entera y a la vista. No puntúa: es el ejemplo.
 *   2. Cuatro pasos, con la fórmula de cada uno delante. 40%.
 *   3. Cuatro pasos, sin fórmula. 60%.
 *
 * EL DESVANECIMIENTO ESTÁ EN EL ANDAMIO, NO EN EL NÚMERO DE PASOS. Las dos
 * rondas que puntúan tienen cuatro pasos; lo que se retira entre una y otra es
 * la fórmula escrita. Quitar pasos en vez de ayuda mediría otra cosa.
 *
 * LOS SEIS JUEGOS DE DATOS SE COMPRUEBAN CONTRA calcular() DE corazonDA.js,
 * que es el modelo del profesor, en banco-transfusiones.test.mjs. Un enunciado
 * cuya respuesta no salga del mismo modelo que el resto del tema enseñaría dos
 * aritméticas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cuatro fórmulas, en el orden en que se aplican. */
export const PASOS_TRANSFUSION = [
  { id: "T", rotulo: "Impuestos (T)", formula: "T = t × Y" },
  { id: "RD", rotulo: "Renta disponible (RD)", formula: "RD = Y + TR − T" },
  { id: "cRD", rotulo: "Consumo inducido", formula: "c × RD" },
  { id: "C", rotulo: "Consumo total (C)", formula: "C = C̄ + (c × RD)" },
];

export const CASOS_TRANSFUSION = {
  /* Ronda 1: resuelta a la vista, sin puntaje. */
  ejemplo: [
    { id: "e-a", autonomo: 50, c: 0.8, Y: 200, TR: 20, t: 0.1 },
    { id: "e-b", autonomo: 40, c: 0.7, Y: 250, TR: 10, t: 0.12 },
  ],
  /* Ronda 2: con la fórmula de cada paso a la vista. */
  guiada: [
    { id: "g-a", autonomo: 80, c: 0.75, Y: 300, TR: 30, t: 0.2 },
    { id: "g-b", autonomo: 60, c: 0.65, Y: 350, TR: 25, t: 0.2 },
  ],
  /* Ronda 3: sin fórmulas. */
  sola: [
    { id: "s-a", autonomo: 100, c: 0.6, Y: 400, TR: 50, t: 0.15 },
    { id: "s-b", autonomo: 70, c: 0.8, Y: 500, TR: 40, t: 0.18 },
  ],
};

/**
 * Los cuatro valores de un caso. Es la misma aritmética de calcular() en
 * corazonDA.js, en la escala pequeña de estos enunciados; el test compara las
 * dos y falla si se separan.
 */
export function resolverTransfusion(caso) {
  const T = caso.t * caso.Y;
  const RD = caso.Y + caso.TR - T;
  const cRD = caso.c * RD;
  return { T, RD, cRD, C: caso.autonomo + cRD };
}

/*
 * Los distractores de cada paso SON ERRORES REALES, no ruido:
 *
 *   T    · cobrar impuestos también sobre las transferencias, y confundir el
 *          impuesto con lo que queda después de pagarlo.
 *   RD   · olvidar las transferencias, y sumar el impuesto en vez de restarlo.
 *   cRD  · aplicar la propensión a la renta bruta, o a la renta sin descontar
 *          impuestos.
 *   C    · olvidar el consumo autónomo, y sumar la renta disponible entera sin
 *          pasarla por la propensión.
 *
 * Un distractor que coincida con el valor correcto se descarta al construir las
 * opciones: repetir la respuesta dos veces la regalaría.
 */
export function distractoresTransfusion(caso, pasoId) {
  const { T, RD, cRD } = resolverTransfusion(caso);
  if (pasoId === "T") return [caso.t * (caso.Y + caso.TR), caso.Y - T];
  if (pasoId === "RD") return [caso.Y - T, caso.Y + caso.TR + T];
  if (pasoId === "cRD") return [caso.c * caso.Y, caso.c * (caso.Y + caso.TR)];
  return [cRD, caso.autonomo + RD];
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 4 — "Biopsia económica"
 * Analizar · Difícil. Una sola decisión, todo o nada.
 *
 * EL 100 O 0 ES LA LECCIÓN, NO UNA DUREZA. Lo que se enseña es que con dos
 * fuerzas opuestas y sin números NO SE PUEDE SABER. Dar puntaje parcial a
 * "Sube" o a "Baja" enseñaría que adivinar la dirección vale algo, que es
 * justo lo contrario.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PREGUNTA_BIOPSIA = "¿Qué le pasa a la Demanda Agregada total?";

export const CASOS_BIOPSIA = [
  {
    id: "a",
    caso: "El gobierno anuncia una reducción del impuesto a la renta de las personas, y al mismo tiempo el Banco de la República sube la tasa de interés para controlar la inflación.",
    opciones: [
      { id: "sube", texto: "Sube", retro: "❌ Ignora que la tasa más alta frena la Inversión." },
      { id: "baja", texto: "Baja", retro: "❌ Ignora que menos impuestos empuja el Consumo hacia arriba." },
      {
        id: "no-se-sabe",
        texto: "No se puede saber con certeza sin más datos",
        retro: "✅ Correcto — Consumo sube (menos impuestos) e Inversión baja (más tasa) al mismo tiempo. Sin los números exactos, no puedes afirmar cuál domina.",
      },
    ],
    correcta: "no-se-sabe",
  },
  {
    id: "b",
    caso: "El Banco de la República baja la tasa de interés para estimular la economía, pero al mismo tiempo el gobierno sube los impuestos a las personas para reducir el déficit fiscal.",
    opciones: [
      { id: "sube", texto: "Sube", retro: "❌ Ignora que más impuestos frena el Consumo." },
      { id: "baja", texto: "Baja", retro: "❌ Ignora que la tasa más baja empuja la Inversión hacia arriba." },
      {
        id: "no-se-sabe",
        texto: "No se puede saber con certeza sin más datos",
        retro: "✅ Correcto — Inversión sube (menos tasa) y Consumo baja (más impuestos) al mismo tiempo. Señales opuestas, no se puede saber cuál domina sin datos.",
      },
    ],
    correcta: "no-se-sabe",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 5 — "Triage de emergencias"
 * Evaluar · Experto. Duelos por parejas (Thurstone).
 *
 * EL id DEL DUELO LLEVA EL CASO DELANTE. Hoy los seis nombres de duelo salen
 * distintos sin el prefijo —b-vs-c, c-vs-a, b-vs-a, a-vs-c, c-vs-b, a-vs-b— así
 * que el prefijo no arregla un choque presente; se pone porque las tres
 * opciones se llaman A, B y C en los DOS casos y son medidas contrarias, y con
 * tres letras solo hay tres parejas posibles: un tercer caso repetiría una y
 * dos preguntas opuestas caerían en la misma fila sin que nada fallara.
 *
 * EL ARGUMENTO SE MUESTRA GANE O PIERDA. Es lo que se está enseñando: por qué
 * una medida va antes que otra. Ocultárselo a quien falla le quita justo la
 * explicación que necesitaba.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const CASOS_TRIAGE = [
  {
    id: "a",
    caso: "La Demanda Agregada lleva 2 trimestres cayendo. El gobierno quiere reactivarla rápido.",
    medidas: {
      A: "Bajar tasa de interés",
      B: "Aumentar gasto público en infraestructura",
      C: "Reducir impuestos a las familias",
    },
    /* Orden correcto, de primero a último: B > C > A. */
    ranking: ["B", "C", "A"],
    duelos: [
      {
        id: "b-vs-c", par: ["B", "C"], gana: "B",
        argumento: "El gasto público entra directo a G — el recorte de impuestos depende de que la gente realmente gaste, y parte se ahorra.",
      },
      {
        id: "c-vs-a", par: ["C", "A"], gana: "C",
        argumento: "Actúa más rápido que bajar tasas — la inversión empresarial toma tiempo y depende de confianza.",
      },
      {
        /*
         * "El mismo argumento" del encargo es el que descalifica al perdedor, y
         * el perdedor de los dos duelos contra A es A. Por eso este duelo repite
         * el argumento del anterior y no el del primero.
         */
        id: "b-vs-a", par: ["B", "A"], gana: "B",
        argumento: "Actúa más rápido que bajar tasas — la inversión empresarial toma tiempo y depende de confianza.",
      },
    ],
  },
  {
    id: "b",
    caso: "La inflación lleva varios meses subiendo y el gobierno quiere frenarla rápido.",
    medidas: {
      A: "Subir tasa de interés",
      B: "Recortar gasto público",
      C: "Subir impuestos a las personas",
    },
    ranking: ["A", "C", "B"],
    duelos: [
      {
        id: "a-vs-c", par: ["A", "C"], gana: "A",
        argumento: "La tasa de interés es la herramienta específica del Banco de la República contra la inflación, con efecto más inmediato.",
      },
      {
        id: "c-vs-b", par: ["C", "B"], gana: "C",
        argumento: "Subir impuestos es más rápido de ejecutar que recortar gasto ya comprometido.",
      },
      {
        /*
         * "El mismo argumento" del encargo se resuelve aquí por el ganador y no
         * por el perdedor, al revés que en el caso A, y es a propósito.
         *
         * El criterio es que la frase hable de las dos medidas QUE ESTÁN EN EL
         * DUELO. La del duelo C vs B —"subir impuestos es más rápido que
         * recortar gasto"— tiene como sujeto a C, que aquí no juega: puesta en
         * A vs B le explicaría al estudiante por qué gana una medida que no ve.
         * La de A vs C habla de la tasa de interés, que es justo la que gana
         * este duelo, y sigue siendo cierta frente a recortar gasto.
         *
         * En el caso A la simetría cae del otro lado: allí el argumento del
         * perdedor ya nombra al perdedor ("más rápido que bajar tasas"), así
         * que se transplanta solo.
         */
        id: "a-vs-b", par: ["A", "B"], gana: "A",
        argumento: "La tasa de interés es la herramienta específica del Banco de la República contra la inflación, con efecto más inmediato.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 6 — "Cirugía de reconstrucción"
 * Crear · Experto. Primer orden y segundo orden de un mismo golpe.
 *
 * EL CASTIGO ES SOLO POR SEÑUELO, y es deliberado. Poner el componente de
 * segundo orden en la casilla de primero es un error de secuencia dentro de la
 * cadena correcta; tocar el tipo de cambio en una helada es salirse de la
 * cadena. Lo segundo cuesta cinco puntos, lo primero no.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const CASOS_CIRUGIA = [
  {
    id: "a",
    caso: "Una fuerte helada arruina las cosechas de flores para exportación, justo antes de San Valentín.",
    opciones: [
      { id: "xn", texto: "Exportaciones Netas (XN)", papel: "primero", retro: "✅ Las flores para exportar se pierden, cae directamente lo que el país exporta." },
      { id: "c", texto: "Consumo (C), en un segundo momento", papel: "segundo", retro: "✅ Los trabajadores de floricultura pierden ingreso, bajando su consumo." },
      { id: "g", texto: "Gasto público", papel: "senuelo", retro: "❌ No cambia automáticamente por una helada." },
      { id: "i", texto: "Inversión", papel: "senuelo", retro: "❌ No es el canal directo de este shock." },
      { id: "tc", texto: "Tipo de cambio", papel: "senuelo", retro: "❌ Una helada agrícola no lo mueve directamente." },
    ],
  },
  {
    id: "b",
    caso: "Un puente clave se cae y el gobierno debe reconstruirlo de emergencia con fondos públicos.",
    opciones: [
      { id: "g", texto: "Gasto público (Ḡ)", papel: "primero", retro: "✅ Es una decisión directa de gasto estatal, entra directo a G." },
      { id: "i", texto: "Inversión (I), en un segundo momento", papel: "segundo", retro: "✅ Empresas de construcción privadas podrían invertir en maquinaria para participar en la reconstrucción." },
      { id: "tc", texto: "Tipo de cambio", papel: "senuelo", retro: "❌ No lo mueve directamente reconstruir un puente." },
      { id: "tasa", texto: "Tasa de interés", papel: "senuelo", retro: "❌ No es el canal directo de este shock." },
      { id: "impuestos", texto: "Impuestos", papel: "senuelo", retro: "❌ No cambia automáticamente por este evento." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * ACTIVIDAD 7 — "Sala de monitores"
 * Aplicar · Difícil. Práctica intercalada (Rohrer).
 *
 * VEINTICUATRO ALERTAS EN UN SOLO ARRAY, MEZCLADAS A MANO. No están agrupadas
 * por componente y no deben agruparse: el intercalado es la técnica entera de
 * esta actividad. Si algún día se añaden más, van intercaladas también.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const COMPONENTES_MONITOR = [
  { id: "C", nombre: "Consumo" },
  { id: "I", nombre: "Inversión" },
  { id: "G", nombre: "Gasto público" },
  { id: "XN", nombre: "Exportaciones Netas" },
];

export const ALERTAS_MONITOR = [
  { id: "sueldo-carro", componente: "C", texto: "Una familia recibe un aumento de sueldo y compra un carro nuevo." },
  { id: "fabrica-linea", componente: "I", texto: "Una fábrica instala una nueva línea de producción." },
  { id: "hospital", componente: "G", texto: "El gobierno construye un nuevo hospital público." },
  { id: "petroleo-sube", componente: "XN", texto: "Aumentan las exportaciones de petróleo colombiano." },
  { id: "tarjetas-caras", componente: "C", texto: "Las tarjetas de crédito se encarecen y la gente compra menos ropa." },
  { id: "planta-barranquilla", componente: "I", texto: "Una empresa extranjera abre una planta nueva en Barranquilla." },
  { id: "maestros", componente: "G", texto: "El gobierno contrata más maestros para colegios públicos." },
  { id: "dolar-flores", componente: "XN", texto: "El dólar sube y las flores colombianas se vuelven más baratas afuera." },
  { id: "confianza-baja", componente: "C", texto: "Baja la confianza del consumidor y las familias ahorran más." },
  { id: "constructora-maquinaria", componente: "I", texto: "Una constructora compra maquinaria nueva para un proyecto." },
  { id: "vias-terciarias", componente: "G", texto: "El gobierno recorta el presupuesto de vías terciarias." },
  { id: "arancel", componente: "XN", texto: "Sube el arancel a un producto y bajan las importaciones de ese producto." },
  { id: "salario-minimo", componente: "C", texto: "Sube el salario mínimo y las familias gastan más en el mercado." },
  { id: "centro-datos", componente: "I", texto: "Una empresa de tecnología abre un nuevo centro de datos en Medellín." },
  { id: "vivienda-gratuita", componente: "G", texto: "El gobierno lanza un programa de vivienda gratuita." },
  { id: "tratado-cafe", componente: "XN", texto: "Un nuevo tratado comercial abre mercados para el café colombiano." },
  { id: "restaurantes", componente: "C", texto: "La gente deja de salir a restaurantes por miedo a perder el empleo." },
  { id: "creditos-maquinaria", componente: "I", texto: "Las tasas de interés bajan y las empresas piden más créditos para maquinaria." },
  { id: "ministerio", componente: "G", texto: "Se recorta el presupuesto de un ministerio." },
  { id: "peso-aprecia", componente: "XN", texto: "El peso se aprecia y las exportaciones se encarecen para el exterior." },
  { id: "tarjetas-baratas", componente: "C", texto: "Las tarjetas de crédito bajan su tasa de interés y la gente compra más." },
  { id: "startup", componente: "I", texto: "Una startup colombiana recibe una gran ronda de inversión de capital de riesgo." },
  { id: "aeropuerto", componente: "G", texto: "El gobierno construye un nuevo aeropuerto regional." },
  { id: "demanda-petroleo", componente: "XN", texto: "Baja la demanda internacional de petróleo y caen las exportaciones colombianas." },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * DEVOLUCIONES COMPARTIDAS CON EL REPASO DIARIO
 *
 * Vivían escritas dentro de sus componentes. El Repaso las reutiliza palabra
 * por palabra, así que se sacan aquí y los dos las llaman: una sola copia, y
 * si alguien las edita cambian en los dos sitios a la vez.
 * ═══════════════════════════════════════════════════════════════════════════ */

const nombreTerminoECG = (id) => TERMINOS_ECG.find((t) => t.id === id)?.nombre ?? id;
const textoFragmentoECG = (id) => FRAGMENTOS_ECG.find((f) => f.id === id)?.fragmento ?? id;

/** Electrocardiograma, etapa 1: ¿de qué término es esta lectura? */
export const retroDefinicionECG = (definicion, elegido) =>
  elegido === definicion.termino
    ? `✅ ${nombreTerminoECG(definicion.termino)} — lectura correcta.`
    : `❌ Eso describe ${nombreTerminoECG(definicion.termino)}, no ${nombreTerminoECG(elegido)}.`;

/*
 * Electrocardiograma, etapa 2. El encargo no traía texto de error para esta
 * etapa: se escribió con la misma forma que el de la etapa 1 y queda anotado
 * como añadido, no como cita.
 */
export const retroFragmentoECG = (fragmento, elegido) =>
  elegido === fragmento.id
    ? fragmento.acierto
    : `❌ Esa es la lectura de «${textoFragmentoECG(elegido)}», no de «${fragmento.fragmento}».`;

const nombreComponenteMonitor = (id) => COMPONENTES_MONITOR.find((c) => c.id === id)?.nombre ?? id;

/** Sala de monitores. */
export const retroMonitor = (alerta, elegido) =>
  elegido === alerta.componente
    ? `✅ ${nombreComponenteMonitor(alerta.componente)} — bien identificado.`
    : `❌ Esto afecta ${nombreComponenteMonitor(alerta.componente)}, no ${nombreComponenteMonitor(elegido)}.`;

/** Triage de emergencias: el encabezado de la devolución; debajo va el argumento del duelo, literal. */
export const encabezadoTriage = (caso, duelo, elegido) =>
  `${elegido === duelo.gana ? "CORRECTO" : "REVISA"} · VA PRIMERO ${caso.medidas[duelo.gana].toUpperCase()}`;
