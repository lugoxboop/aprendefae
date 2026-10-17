/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 — lo que comparten las consecuencias de A7, H1, H3, H4, H5, H6 y
 * H7 (src/contabilidad/c4/t71*_c4.js). Puro, sin React. No termina en _c4.js:
 * consecuencia-c.test.mjs no lo lee como pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cifras en pesos, como el motor (aprenderC3.pesos): $1.180.000. */
export const pesosC4 = (n) => (n < 0 ? "−" : "") + "$" + Math.round(Math.abs(n)).toLocaleString("es-CO");

/* Un porcentaje con coma y hasta dos decimales: 3,5 · 1 · 16. */
export const pctC4 = (n, dec = 2) => (Math.round(n * 10 ** dec) / 10 ** dec).toLocaleString("es-CO", { maximumFractionDigits: dec });

/*
 * Lote V (patrón C4, datos.mjs de Watari): las opciones se barajan con una
 * semilla fija por ítem, estable entre visitas y distinta entre ítems.
 */
const semilla = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function barajarFijo(a, id) {
  let h = semilla(id);
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/* Un ítem de cifra o de elección de pesos con los datos de Near: { correcta, acierto, distractores[{ valor, retro }] }. */
export const opcionesDeNear = (it, texto = pesosC4) => barajarFijo([
  { id: String(it.correcta), v: it.correcta, t: texto(it.correcta), correcta: true },
  ...it.distractores.map((d) => ({ id: String(d.valor), v: d.valor, t: texto(d.valor), msg: d.retro })),
], it.id);

/* Cuántas palabras tiene un texto (para el tope de 60 de B2). */
export const palabras = (t) => String(t ?? "").split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
