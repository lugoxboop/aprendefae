/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTENIDO DE LOS JUEGOS EVALUATIVOS DE POLÍTICA ECONÓMICA.
 *
 * Fuente: la presentación del profesor. Los titulares y los enunciados de las
 * cadenas están copiados literalmente; no se añadió ni una cifra.
 *
 * El octavo titular —el ambiental— no lleva número porque el material no da
 * ninguno. No se le inventa uno para que la lista quede simétrica.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ──────────────── ACTIVIDAD 1 — Diagnóstico en vivo ──────────────── */

/*
 * Los ocho problemas. `boton` es el rótulo corto del tablero; `nombre` es el
 * nombre completo, que es el que sale en la retroalimentación.
 *
 * `distingue` es la línea que separa este problema de cualquier otro con el
 * que se haya confundido. Se usa en el mensaje genérico de error: decir qué ES
 * el problema correcto distingue de lo que el estudiante eligiera, sin tener
 * que escribir las cincuenta y seis parejas posibles.
 */
export const PROBLEMAS = [
  {
    id: "crecimiento",
    boton: "Crecimiento",
    nombre: "Restricciones al crecimiento económico",
    icono: "📉",
    distingue: "habla de cuánto crece la producción del país, no de precios ni de empleo.",
  },
  {
    id: "inflacion",
    boton: "Inflación",
    nombre: "Inflación",
    icono: "🔥",
    distingue: "habla de precios que suben, no de producción ni de empleo.",
  },
  {
    id: "desempleo",
    boton: "Desempleo",
    nombre: "Desempleo",
    icono: "👷",
    distingue: "habla de gente que busca trabajo y no lo encuentra.",
  },
  {
    id: "fiscal",
    boton: "Déficit fiscal",
    nombre: "Déficit público (fiscal)",
    icono: "🏛️",
    distingue: "habla de las cuentas del Estado: gasta más de lo que recauda.",
  },
  {
    id: "exterior",
    boton: "Déficit exterior",
    nombre: "Déficit exterior (comercial)",
    icono: "🚢",
    distingue: "habla del comercio con otros países: se importa más de lo que se exporta.",
  },
  {
    id: "concentracion",
    boton: "Concentración renta",
    nombre: "Concentración de la renta",
    icono: "⚖️",
    distingue: "habla de cómo se reparte el ingreso entre los hogares.",
  },
  {
    id: "asignacion",
    boton: "Asignación recursos",
    nombre: "Inadecuada asignación de recursos",
    icono: "🧩",
    distingue: "habla de gente sin acceso a bienes y servicios básicos.",
  },
  {
    id: "ambiental",
    boton: "Ambiental",
    nombre: "Impactos ambientales indeseados",
    icono: "🌫️",
    distingue: "habla del daño que la actividad económica hace al ambiente.",
  },
];

/* Los ocho titulares, literales del material. */
export const TITULARES = [
  { id: "t1", texto: "La economía colombiana cerró 2025 con un crecimiento de apenas 2,6%, lejos de la meta de 5,6%.", problema: "crecimiento" },
  { id: "t2", texto: "La inflación se ubica en 6%, todavía distante de la meta de 3,4%.", problema: "inflacion" },
  { id: "t3", texto: "La tasa de desempleo llega a 8,1% pese a la búsqueda activa de empleo.", problema: "desempleo" },
  { id: "t4", texto: "El déficit fiscal se proyecta en 9,4% del PIB para 2027, frente a una meta de 4,5%.", problema: "fiscal" },
  { id: "t5", texto: "Las importaciones superan a las exportaciones en US$8.198,7 millones.", problema: "exterior" },
  { id: "t6", texto: "El índice GINI de Colombia se ubica en 0,54, reflejando alta concentración del ingreso.", problema: "concentracion" },
  { id: "t7", texto: "El 14,1% de la población tiene una o más carencias de acceso a bienes y servicios básicos.", problema: "asignacion" },
  /* Sin cifra: el material no da ninguna para el ambiental. */
  { id: "t8", texto: "Las emisiones contaminantes siguen creciendo pese a los compromisos ambientales del país.", problema: "ambiental" },
];

/*
 * Las dos confusiones que el profesor señala como propias del tema tienen su
 * propio texto: no basta con decir cuál era, hay que explicar el par.
 */
const PAR_DEFICIT = new Set(["fiscal", "exterior"]);
const PAR_REPARTO = new Set(["concentracion", "asignacion"]);

export function retroalimentacion(problemaReal, elegido) {
  const real = PROBLEMAS.find((p) => p.id === problemaReal);

  if (problemaReal === elegido) return { ok: true, texto: `✅ Correcto — ${real.nombre}.` };

  if (PAR_DEFICIT.has(problemaReal) && PAR_DEFICIT.has(elegido)) {
    return {
      ok: false,
      texto:
        "❌ Ese es el otro déficit — fiscal es cuando el Estado gasta más de lo que recauda; exterior es cuando el país importa más de lo que exporta.",
    };
  }

  if (PAR_REPARTO.has(problemaReal) && PAR_REPARTO.has(elegido)) {
    return {
      ok: false,
      texto:
        "❌ Concentración de la renta es que pocos se quedan con la mayoría del ingreso; asignación de recursos es que hay gente sin acceso a bienes y servicios básicos, aunque el ingreso ya esté repartido.",
    };
  }

  return { ok: false, texto: `❌ Ese titular es sobre ${real.nombre} — ${real.distingue}` };
}

export const textoArchivado = (problemaReal) => {
  const real = PROBLEMAS.find((p) => p.id === problemaReal);
  return `⏱ Se te fue este — era ${real.nombre}.`;
};

/* ──────────────── ACTIVIDAD 2 — Arma el grupo lógico ──────────────── */

/*
 * Las seis casillas del grupo lógico. Cada una lleva un acento pastel propio
 * —tonos apagados de la misma paleta, no los colores primarios de marca— para
 * poder distinguirlas sin que compitan con el teal del acierto ni con el coral
 * del error.
 */
export const CASILLAS = [
  { id: "problema", nombre: "Problema", articulo: "el", acento: "#8FB8C9" },
  { id: "objetivo", nombre: "Objetivo", articulo: "el", acento: "#A9C4A0" },
  { id: "estrategia", nombre: "Estrategia", articulo: "la", acento: "#C9B79C" },
  { id: "instrumento", nombre: "Instrumento", articulo: "el", acento: "#B3A8C4" },
  { id: "medida", nombre: "Medida", articulo: "la", acento: "#C9A0A0" },
  { id: "meta", nombre: "Meta", articulo: "la", acento: "#9CBFC4" },
];

/*
 * La cadena correcta —aranceles al acero— y seis señuelos que también son
 * enunciados reales del profesor, pero de OTRAS cadenas. Están para obligar a
 * leer: por posición no se distingue una meta de otra meta.
 */
export const ENUNCIADOS = [
  { id: "c1", texto: "Las importaciones de acero de China están inundando el mercado nacional", casilla: "problema" },
  { id: "c2", texto: "Controlar las importaciones de China a Colombia", casilla: "objetivo" },
  { id: "c3", texto: "Política comercial", casilla: "estrategia" },
  { id: "c4", texto: "Aranceles", casilla: "instrumento" },
  { id: "c5", texto: "Subir los aranceles al acero del 10% al 20%", casilla: "medida" },
  { id: "c6", texto: "Reducir las importaciones de acero en un 20% en tres meses", casilla: "meta" },

  { id: "s1", texto: "Desempleo del 23%", senuelo: true, tema: "desempleo" },
  { id: "s2", texto: "Política monetaria", senuelo: true, tema: "política monetaria" },
  { id: "s3", texto: "Reducir la tasa de interés de referencia del 10% al 8%", senuelo: true, tema: "la tasa de interés" },
  { id: "s4", texto: "Aumentar las exportaciones de Colombia en un 15% en dos años", senuelo: true, tema: "exportaciones" },
  { id: "s5", texto: "Tasa de interés", senuelo: true, tema: "la tasa de interés" },
  { id: "s6", texto: "Reducir el déficit fiscal en 1 punto del PIB para fin de año", senuelo: true, tema: "el déficit fiscal" },
];

export function retroCadena(enunciado, casillaDestino) {
  if (enunciado.senuelo) {
    return {
      ok: false,
      senuelo: true,
      texto: `❌ Esto es real, pero pertenece a una cadena distinta (habla de ${enunciado.tema}, no de aranceles al acero).`,
    };
  }
  if (enunciado.casilla === casillaDestino) {
    return { ok: true, texto: "✅ Encaja — es parte de la misma cadena." };
  }
  /*
   * EL ARTÍCULO CONCUERDA. La plantilla de la ficha traía "la" fijo —"es la
   * [categoría real]"— y de las seis categorías solo tres son femeninas: salía
   * "es la Instrumento". Se conserva la frase palabra por palabra y solo se le
   * da el artículo que le toca a cada una.
   */
  const real = CASILLAS.find((c) => c.id === enunciado.casilla);
  const puesta = CASILLAS.find((c) => c.id === casillaDestino);
  return {
    ok: false,
    senuelo: false,
    texto: `❌ Esto sí es de esta cadena, pero es ${real.articulo} ${real.nombre}, no ${puesta.articulo} ${puesta.nombre}.`,
  };
}
