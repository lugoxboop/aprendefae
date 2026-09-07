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

/*
 * Dieciséis titulares: DOS por problema, todos del material del profesor.
 *
 * POR QUÉ DOS Y NO UNO. Con un solo titular por problema, la segunda partida
 * era reconocer frases ya vistas en vez de clasificarlas. Con dos variantes se
 * sortea cuál toca, así que volver a jugar sigue pidiendo leer.
 *
 * CADA PROBLEMA SALE EXACTAMENTE UNA VEZ POR RONDA. No es un muestreo de 8
 * entre 16: es uno de cada pareja. Si fuera al azar sobre los dieciséis, una
 * ronda podría traer dos de inflación y ninguno de desempleo, y la actividad
 * dejaría de cubrir los ocho problemas.
 */
export const TITULARES = [
  { id: "t1a", texto: "La economía colombiana cerró 2025 con un crecimiento de apenas 2,6%, lejos de la meta de 5,6%.", problema: "crecimiento" },
  { id: "t1b", texto: "El crecimiento del PIB colombiano se ubicó en 2,6% en el último trimestre, muy por debajo del objetivo de 5,6%.", problema: "crecimiento" },

  { id: "t2a", texto: "La inflación se ubica en 6%, todavía distante de la meta de 3,4%.", problema: "inflacion" },
  { id: "t2b", texto: "Los precios al consumidor acumulan un alza del 6% en el último año, superando la meta del Banco de la República.", problema: "inflacion" },

  { id: "t3a", texto: "La tasa de desempleo llega a 8,1% pese a la búsqueda activa de empleo.", problema: "desempleo" },
  { id: "t3b", texto: "8,1% de la población económicamente activa está sin empleo, pese a buscar trabajo activamente.", problema: "desempleo" },

  { id: "t4a", texto: "El déficit fiscal se proyecta en 9,4% del PIB para 2027, frente a una meta de 4,5%.", problema: "fiscal" },
  { id: "t4b", texto: "Las proyecciones fiscales para 2027 muestran un déficit del 9,4% del PIB, casi el doble de la meta oficial.", problema: "fiscal" },

  { id: "t5a", texto: "Las importaciones superan a las exportaciones en US$8.198,7 millones.", problema: "exterior" },
  { id: "t5b", texto: "La balanza comercial de Colombia registra un saldo negativo de más de 8 mil millones de dólares.", problema: "exterior" },

  { id: "t6a", texto: "El índice GINI de Colombia se ubica en 0,54, reflejando alta concentración del ingreso.", problema: "concentracion" },
  { id: "t6b", texto: "Colombia registra un GINI de 0,54, uno de los más altos de la región en desigualdad de ingresos.", problema: "concentracion" },

  { id: "t7a", texto: "El 14,1% de la población tiene una o más carencias de acceso a bienes y servicios básicos.", problema: "asignacion" },
  { id: "t7b", texto: "Más del 14% de los colombianos carece de acceso adecuado a al menos un bien o servicio básico.", problema: "asignacion" },

  /* Sin cifra ninguna de las dos: el material no da ninguna para el ambiental. */
  { id: "t8a", texto: "Las emisiones contaminantes siguen creciendo pese a los compromisos ambientales del país.", problema: "ambiental" },
  { id: "t8b", texto: "Persisten las emisiones contaminantes en el país, pese a los compromisos climáticos adquiridos.", problema: "ambiental" },
];

/* Uno de cada pareja, en orden aleatorio. Ocho titulares, los ocho problemas. */
export function sortearTitulares() {
  return PROBLEMAS.map((p) => {
    const variantes = TITULARES.filter((t) => t.problema === p.id);
    return variantes[Math.floor(Math.random() * variantes.length)];
  });
}

/* ─────────── Etapa 2: comparar el tamaño de las brechas ─────────── */

/*
 * Solo tres de los ocho problemas traen meta numérica, y por eso la pregunta
 * dice "de estos 3". Las brechas son resta directa de las cifras del profesor,
 * no una estimación: 5,6−2,6 = 3,0 · 6−3,4 = 2,6 · 9,4−4,5 = 4,9.
 */
export const PREGUNTA_BRECHA =
  "De estos 3 problemas con meta numérica clara, ¿cuál tiene la brecha más grande frente a su meta?";

export const BRECHAS = [
  {
    id: "crecimiento",
    etiqueta: "Crecimiento",
    detalle: "2,6% vs. 5,6% — brecha 3,0 pts",
    correcta: false,
    feedback: "❌ Su brecha es real (3,0 puntos), pero menor que la del déficit fiscal (4,9 puntos).",
  },
  {
    id: "inflacion",
    etiqueta: "Inflación",
    detalle: "6% vs. 3,4% — brecha 2,6 pts",
    correcta: false,
    feedback: "❌ Es la brecha menor de las tres (2,6 puntos) — el déficit fiscal casi duplica su meta.",
  },
  {
    id: "fiscal",
    etiqueta: "Déficit fiscal",
    detalle: "9,4% vs. 4,5% — brecha 4,9 pts",
    correcta: true,
    feedback: "✅ Correcto — el déficit fiscal tiene la brecha más grande (4,9 puntos), casi el doble de su meta.",
  },
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
/*
 * DOS CASOS, uno por partida. Cada uno trae su cadena de seis y sus seis
 * señuelos.
 *
 * LOS SEÑUELOS DE CADA CASO SON DE OTRO RACIMO TEMÁTICO, y esto es deliberado:
 * si los señuelos del caso 2 fueran las piezas correctas del caso 1, quien
 * hubiera jugado el primero resolvería el segundo por memoria en vez de por
 * lectura. Los del acero son monetarios; los de la inflación son fiscales y de
 * empleo. Ninguna pieza se repite entre casos.
 */
export const CASOS_CADENA = [
  {
    id: "acero",
    titulo: "Aranceles al acero",
    /* Cómo se nombra el caso dentro del mensaje de señuelo. */
    tema: "aranceles al acero",
    enunciados: [
      { id: "a-c1", texto: "Las importaciones de acero de China están inundando el mercado nacional", casilla: "problema" },
      { id: "a-c2", texto: "Controlar las importaciones de China a Colombia", casilla: "objetivo" },
      { id: "a-c3", texto: "Política comercial", casilla: "estrategia" },
      { id: "a-c4", texto: "Aranceles", casilla: "instrumento" },
      { id: "a-c5", texto: "Subir los aranceles al acero del 10% al 20%", casilla: "medida" },
      { id: "a-c6", texto: "Reducir las importaciones de acero en un 20% en tres meses", casilla: "meta" },

      { id: "a-s1", texto: "Desempleo del 23%", senuelo: true, tema: "desempleo" },
      { id: "a-s2", texto: "Política monetaria", senuelo: true, tema: "política monetaria" },
      { id: "a-s3", texto: "Reducir la tasa de interés de referencia del 10% al 8%", senuelo: true, tema: "la tasa de interés" },
      { id: "a-s4", texto: "Aumentar las exportaciones de Colombia en un 15% en dos años", senuelo: true, tema: "exportaciones" },
      { id: "a-s5", texto: "Tasa de interés", senuelo: true, tema: "la tasa de interés" },
      { id: "a-s6", texto: "Reducir el déficit fiscal en 1 punto del PIB para fin de año", senuelo: true, tema: "el déficit fiscal" },
    ],
  },
  {
    id: "inflacion",
    titulo: "Control de la inflación",
    tema: "control de la inflación",
    enunciados: [
      { id: "i-c1", texto: "Se dispararon los precios en Colombia y crecieron al 12% en 2024", casilla: "problema" },
      { id: "i-c2", texto: "Controlar la inflación", casilla: "objetivo" },
      { id: "i-c3", texto: "Política monetaria", casilla: "estrategia" },
      { id: "i-c4", texto: "Tasa de interés", casilla: "instrumento" },
      { id: "i-c5", texto: "El Banco de la República subirá la tasa de interés de referencia del 7% al 10% en los próximos seis meses", casilla: "medida" },
      { id: "i-c6", texto: "La inflación bajará del 12% al 11% para finales de año", casilla: "meta" },

      { id: "i-s1", texto: "Desempleo del 23%", senuelo: true, tema: "desempleo" },
      { id: "i-s2", texto: "Reducir el desempleo", senuelo: true, tema: "el desempleo" },
      { id: "i-s3", texto: "Política fiscal", senuelo: true, tema: "política fiscal" },
      { id: "i-s4", texto: "Impuestos", senuelo: true, tema: "impuestos" },
      { id: "i-s5", texto: "Reducción de impuestos directos a las empresas", senuelo: true, tema: "impuestos" },
      { id: "i-s6", texto: "Reducción del desempleo del 23% al 20% en un año", senuelo: true, tema: "el desempleo" },
    ],
  },
];

/* El caso de esta partida. */
export const sortearCaso = () => CASOS_CADENA[Math.floor(Math.random() * CASOS_CADENA.length)];

export function retroCadena(enunciado, casillaDestino, temaDelCaso = "aranceles al acero") {
  if (enunciado.senuelo) {
    return {
      ok: false,
      senuelo: true,
      texto: `❌ Esto es real, pero pertenece a una cadena distinta (habla de ${enunciado.tema}, no de ${temaDelCaso}).`,
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
