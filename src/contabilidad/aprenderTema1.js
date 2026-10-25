import {
  BLOQUES, DEL_BANCO, DE_LOS_DUENOS, CASOS_P2, OPCIONES_P2, SUBEN, BAJAN,
  PREGUNTAS_P3, RESPUESTAS_P3, ERROR_P3, FOTO, PELICULA, COMPARAR, OPCIONES_P3,
  FLECHAS_P4, LINEAS_P4, MODO_FLECHA, VIAJA, EXPLICA, OPCIONES_P4,
} from "../data/contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — la lógica de las piezas 2, 3 y 4.
 *
 * Material teórico: nada de aquí califica ni suma FP. Lo que hay son reglas de
 * qué se enseña cuando el estudiante toca algo, y son reglas porque una
 * devolución escogida a ojo se equivoca justo en los casos que se parecen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ PIEZA 2 · LA TORRE ═══════════════════ */

/*
 * Los dos tramos de la lectura por la derecha, deducidos de los bloques. No
 * hay una segunda lista que pudiera desincronizarse: si un bloque cambia de
 * dueño, el tramo cambia con él.
 */
export function tramosDeLaTorre(bloques = BLOQUES) {
  const orden = [DEL_BANCO, DE_LOS_DUENOS];
  return orden
    .map((tramo) => ({ tramo, bloques: bloques.filter((b) => b.tramo === tramo) }))
    .filter((t) => t.bloques.length > 0);
}

export const ALTURA_BASE = BLOQUES.length;

/*
 * ═══════════ QUÉ TRAMO SE MUEVE EN CADA CASO ═══════════
 *
 * No basta con «la torre tiene un bloque más o uno menos»: el caso dice CUÁL
 * de los dos lados cambia. Con «un bloque menos» a secas se quitaba siempre el
 * último de la pila —la máquina, que es de los dueños— aunque el caso c diga
 * que lo que baja es el pasivo. La torre enseñaba entonces un caso distinto
 * del que estaba rotulado, y nada fallaba.
 */
export const TRAMO_DEL_LADO = { pasivo: DEL_BANCO, patrimonio: DE_LOS_DUENOS };

export function cambioDelCaso(caso) {
  const tramo = TRAMO_DEL_LADO[caso.lado];
  if (!tramo) throw new Error(`el caso «${caso.id}» no dice qué lado se mueve`);
  return { tramo, signo: caso.mueve === SUBEN ? 1 : -1 };
}

/*
 * ═══════════ LA REGLA QUE LA PIEZA ENTERA DEMUESTRA ═══════════
 *
 * En los cuatro casos del libro los dos lados se mueven hacia el MISMO lado.
 * No hay ninguno en que uno suba y el otro baje, y por eso esto no es una
 * tabla: es una función que devuelve el mismo movimiento para los dos lados.
 */
export function movimientoDelCaso(caso) {
  if (caso.mueve !== SUBEN && caso.mueve !== BAJAN) {
    throw new Error(`el caso «${caso.id}» no sube ni baja`);
  }
  return { izquierda: caso.mueve, derecha: caso.mueve };
}

export const evaluarOpcionP2 = (id) => OPCIONES_P2.find((o) => o.id === id) ?? null;

/* ═══════════════════ PIEZA 3 · LA FOTO Y LA PELÍCULA ═══════════════════ */

export const preguntaP3 = (id) => PREGUNTAS_P3.find((q) => q.id === id) ?? null;
export const respuestaP3 = (id) => RESPUESTAS_P3.find((r) => r.id === id) ?? null;

/*
 * ═══════════ LA REGLA DE ERROR, DETERMINÍSTICA POR PAREJA ═══════════
 *
 * La explicación sale de las DOS: cuál era la buena y cuál marcó. Y la C se
 * parte en dos, porque «marcó comparar» no significa lo mismo si la buena era
 * la foto que si era la película: en un caso sobra la segunda foto, en el otro
 * sobran las dos. Una sola explicación para los dos diría media verdad en uno.
 */
export function evaluarP3(pregunta, marcada) {
  if (!RESPUESTAS_P3.some((r) => r.id === marcada)) throw new Error(`«${marcada}» no es una respuesta`);
  const correcta = pregunta.respuesta;
  if (marcada === correcta) return { ok: true, patron: null, texto: null, escena: escenaDeAcierto(correcta) };

  let patron;
  if (correcta === FOTO && marcada === PELICULA) patron = "A";
  else if (correcta === PELICULA && marcada === FOTO) patron = "B";
  else if (correcta === FOTO && marcada === COMPARAR) patron = "C1";
  else if (correcta === PELICULA && marcada === COMPARAR) patron = "C2";
  /* D2 (Futaba, lote B §5): quien marcó la película no eligió ninguna foto, así que la D no le habla a él. */
  else if (correcta === COMPARAR && marcada === PELICULA) patron = "D2";
  else if (correcta === COMPARAR) patron = "D";
  else throw new Error(`no hay explicación para «${marcada}» cuando era «${correcta}»`);

  const e = ERROR_P3[patron];
  return { ok: false, patron, texto: e.texto, escena: e.escena };
}

/* Qué se enciende al acertar: lo mismo que responde la pregunta. */
export function escenaDeAcierto(respuesta) {
  if (respuesta === FOTO) return "una-foto";
  if (respuesta === PELICULA) return "banda";
  return "dos-fotos";
}

export const evaluarOpcionP3 = (id) => OPCIONES_P3.find((o) => o.id === id) ?? null;

/* ═══════════════════ PIEZA 4 · LAS CINCO FLECHAS ═══════════════════ */

export const lineaP4 = (id) => LINEAS_P4.find((l) => l.id === id) ?? null;

/*
 * ═══════════ CUÁL VIAJA Y CUÁLES EXPLICAN ═══════════
 *
 * Solo una de las cinco repite la misma cifra. Las otras cuatro explican una
 * línea sin repetir nada, y por eso no pueden compartir animación: una ficha
 * viajando por ellas afirmaría que la cifra es la misma, que es falso.
 */
export function modoDeFlecha(id) {
  const m = MODO_FLECHA[id];
  if (!m) throw new Error(`la flecha «${id}» no dice si viaja o explica`);
  return { ...m, marca: m.viaja ? VIAJA : EXPLICA };
}

export const LAS_QUE_VIAJAN = FLECHAS_P4.filter((f) => modoDeFlecha(f.id).viaja);

/* El informe al que llegan todas, deducido del gráfico y no declarado. */
export function informeQueRecibeP4() {
  const llegan = new Set(FLECHAS_P4.map((f) => lineaP4(f.hasta).informe));
  const salen = new Set(FLECHAS_P4.map((f) => lineaP4(f.desde).informe));
  const soloRecibe = [...llegan].filter((i) => !salen.has(i));
  if (soloRecibe.length !== 1) throw new Error("no hay exactamente un informe que solo reciba");
  return soloRecibe[0];
}

export const evaluarOpcionP4 = (id) => OPCIONES_P4.find((o) => o.id === id) ?? null;
