/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TESERACTO DE LA RACHA — la parte que no dibuja.
 *
 * Geometría, orden de revelación, proyección y la semana del calendario. Sin
 * Three.js ni React: todo se prueba con números.
 *
 * ═══════════ LA FÓRMULA, Y NO UNA LISTA ═══════════
 *
 *   aristasReveladas(día) = round(día × 32 / 30), con tope en 32
 *
 * Si mañana cambian los hitos, cambia ARISTAS_TOTALES o DIAS_PARA_COMPLETAR y
 * todo lo demás se recalcula. Con 32 y 30, 28 días revelan una arista y dos
 * días —el 8 y el 23— revelan dos. Nunca hay empate en el redondeo: día × 16/15
 * tiene parte decimal k/15, que no vale 0,5 para ningún k.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ARISTAS_TOTALES = 32;
export const DIAS_PARA_COMPLETAR = 30;

/** Cuántas aristas se ven con esta racha. */
export function aristasReveladas(dia) {
  const d = Math.max(0, Math.floor(Number(dia) || 0));
  return Math.min(ARISTAS_TOTALES, Math.round((d * ARISTAS_TOTALES) / DIAS_PARA_COMPLETAR));
}

/** Cuántas aparecen HOY, al pasar de día − 1 a día. */
export const aristasNuevas = (dia) => aristasReveladas(dia) - aristasReveladas(dia - 1);

/*
 * La riqueza al completarse: 0 mientras faltan aristas; desde el día 30, sube
 * de 0,6 a 1 durante otros 30 días. Más brillo en vértices y aristas, giro más
 * amplio. El mismo principio que las medallas, pero en el tiempo.
 */
export function riqueza(dia) {
  const d = Math.floor(Number(dia) || 0);
  if (d < DIAS_PARA_COMPLETAR) return 0;
  return Math.min(1, 0.6 + ((d - DIAS_PARA_COMPLETAR) * 0.4) / DIAS_PARA_COMPLETAR);
}

/* ─────────────────────────── la figura ─────────────────────────── */

/** Los 16 vértices del hipercubo: todas las combinaciones de ±1 en x, y, z, w. */
export const VERTICES = Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].map((b) => ((i >> b) & 1 ? 1 : -1)));

/*
 * Las 32 aristas —pares de vértices que difieren en UNA coordenada—, en el
 * orden en que se revelan, EN TRES FASES:
 *
 *   1–12   el cubo exterior entero (w = +1, el que la proyección agranda).
 *          Los primeros días enseñan una forma simple y reconocible.
 *   13–24  el cubo interior entero. La figura gana profundidad.
 *   25–32  las ocho conexiones entre vértices correspondientes. Son las que
 *          hacen que se lea como teseracto y no como dos cubos sueltos, y
 *          llegan al final: son la recompensa de sostener la racha.
 *
 * La regla es dura: ninguna del interior antes de cerrar el exterior, ninguna
 * conexión antes de cerrar el interior. Dentro de cada fase el orden es el de
 * la indexación de los vértices, que además hace que cada cubo crezca desde un
 * vértice y no a saltos.
 */
const FASE = ([a, b]) => ((a & 8) && (b & 8) ? 0 : !(a & 8) && !(b & 8) ? 1 : 2);

export const ARISTAS = (() => {
  const todas = [];
  for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) {
    const c = a ^ (1 << b);
    if (a < c) todas.push([a, c]);
  }
  return todas.sort((x, y) => FASE(x) - FASE(y) || x[0] - y[0] || x[1] - y[1]);
})();

/** En qué fase cae una arista: 0 exterior, 1 interior, 2 conexión. */
export const faseDeArista = FASE;

/*
 * El calendario del trazo de las aristas nuevas del día: una tras otra, cada
 * una con su propio tiempo. Los días de dos aristas (8 y 23) se ven como dos
 * trazos seguidos, no como uno solo instantáneo.
 */
export function trazos(dia, { inicio, porArista }) {
  const antes = aristasReveladas(dia - 1);
  const total = aristasReveladas(dia);
  const lista = [];
  for (let k = antes; k < total; k++) {
    lista.push({ indice: k, arista: ARISTAS[k], desde: inicio + (k - antes) * porArista, hasta: inicio + (k - antes + 1) * porArista });
  }
  return lista;
}

/** Las 24 caras cuadradas: dos coordenadas fijas, dos libres. Cada una como ciclo de 4 vértices. */
export const CARAS = (() => {
  const caras = [];
  for (let libre1 = 0; libre1 < 4; libre1++) for (let libre2 = libre1 + 1; libre2 < 4; libre2++) {
    const fijas = [0, 1, 2, 3].filter((b) => b !== libre1 && b !== libre2);
    for (let valores = 0; valores < 4; valores++) {
      const base = fijas.reduce((acc, b, k) => acc | (((valores >> k) & 1) << b), 0);
      caras.push([base, base | (1 << libre1), base | (1 << libre1) | (1 << libre2), base | (1 << libre2)]);
    }
  }
  return caras;
})();

const claveArista = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** Qué caras se pueden llenar: las que tienen sus cuatro aristas ya reveladas. */
export function carasVisibles(reveladas) {
  const hechas = new Set(ARISTAS.slice(0, reveladas).map(([a, b]) => claveArista(a, b)));
  return CARAS.filter((c) => c.every((v, k) => hechas.has(claveArista(v, c[(k + 1) % 4]))));
}

/*
 * Rotación en 4D (planos xw y zw, que son los que hacen que el cubo interior y
 * el exterior se crucen) y proyección en perspectiva a 3D. `distancia` es la
 * del ojo en w: con 3, el cubo lejano sale a la mitad del cercano.
 */
export function proyectar(v, anguloXW, anguloZW, distancia = 3) {
  let [x, y, z, w] = v;
  const c1 = Math.cos(anguloXW), s1 = Math.sin(anguloXW);
  [x, w] = [x * c1 - w * s1, x * s1 + w * c1];
  const c2 = Math.cos(anguloZW), s2 = Math.sin(anguloZW);
  [z, w] = [z * c2 - w * s2, z * s2 + w * c2];
  const f = 1 / (distancia - w);
  return [x * f, y * f, z * f, w];
}

/* ─────────────────────────── la semana ─────────────────────────── */

export const ETIQUETAS_SEMANA = ["L", "Ma", "Mi", "J", "V", "S", "D"];

/*
 * Los siete días de la semana de hoy (lunes a domingo, Bogotá) y su estado:
 *   completado  hubo actividad ese día                  → lleno teal
 *   hoy         es hoy y todavía no cuenta              → anillo ámbar, hueco
 *   hoy-hecho   es hoy y ya hubo actividad              → anillo ámbar, lleno teal
 *   pendiente   pasado sin actividad, o futuro          → contorno gris
 */
export function semana(hoyISO, diasConActividad) {
  const hechos = new Set(diasConActividad ?? []);
  const hoy = new Date(`${hoyISO}T12:00:00Z`);
  const desdeLunes = (hoy.getUTCDay() + 6) % 7;
  return ETIQUETAS_SEMANA.map((etiqueta, k) => {
    const fecha = new Date(hoy.getTime() + (k - desdeLunes) * 86400000).toISOString().slice(0, 10);
    const esHoy = fecha === hoyISO;
    const hecho = hechos.has(fecha);
    const estado = esHoy ? (hecho ? "hoy-hecho" : "hoy") : hecho && fecha < hoyISO ? "completado" : "pendiente";
    return { etiqueta, fecha, estado };
  });
}

/** El mensaje de la transformación, con el texto de la ficha de racha. */
export const mensajeRacha = (desde, hasta) => `Pasaste de racha ${desde} a ${hasta}`;
