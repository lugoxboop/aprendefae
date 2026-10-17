import { HTML } from "./c4WatariT72.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 (H1, H2, H4 y H5): el código de Watari, EJECUTADO, para comparar
 * (como c4WatariT72.mjs con f72.js). Saca de patron-enganche-c4-v1.html las
 * utilidades de figura (figs.js) y las figuras de T7-3 (f73.js) y las corre
 * sin DOM: cada figura(ctx, item, v) devuelve el HTML que pinta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const tramo = (desde, hasta = "})();") => {
  const i = HTML.indexOf(desde);
  if (i < 0) throw new Error(`el paquete de Watari cambió: no está «${desde}»`);
  const j = HTML.indexOf(hasta, i);
  return HTML.slice(i, j + hasta.length);
};
const FIGS_JS = tramo("window.C4P = {};", "})();\n");
const F73_JS = tramo("/* C4 · T7-3: A1-A7 (D4) y H1, H2, H4, H5, H7 (D9).");
const W = new Function("window", `${FIGS_JS}\nconst C4P = window.C4P, C4F = window.C4F;\n${F73_JS}\nreturn window;`)({});
export const C4P = W.C4P;
export { lineaDe, textoDe } from "./c4WatariT72.mjs";

/* Los ítems como los arma datos.mjs de Watari, desde los datos de la casa (sin los asientos). */
export const piezaHacer = (items) => ({ items: items.filter((it) => it.distractores && it.tipo !== "asiento")
  .map((it) => ({ id: it.id, tipo: it.tipo === "cifra" || (it.tipo !== "eleccion" && typeof it.correcta === "number") ? "cifra" : "eleccion", correcta: it.correcta,
    opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => ({ id: String(v), t: String(v), v, correcta: v === it.correcta })), raw: { caso: it.caso } })) });

/* Lo que el motor de Watari le pasa a la figura (v) con una elección, ya con el veredicto. */
export function vDe(I, eleccion) {
  const op = eleccion == null ? null : I.opciones.find((o) => o.id === String(eleccion)) ?? null;
  const ok = eleccion != null && (I.tipo === "cifra" ? Number(eleccion) === I.correcta : Boolean(op?.correcta));
  return { eleccion: eleccion == null ? null : String(eleccion), valor: I.tipo === "cifra" ? eleccion : null, op, ok, anim: false, veredicto: true, resuelto: ok, fallado: eleccion != null && !ok };
}
/* El ctx: la pieza y los ítems ya respondidos (para «lo que ya quedó resuelto antes»). */
export const ctxDe = (pieza, hechos = 0) => ({ pieza, s: { e: Object.fromEntries(Array.from({ length: hechos }, (_, i) => [i, { veredicto: true }])) }, pastilla: () => "" });
