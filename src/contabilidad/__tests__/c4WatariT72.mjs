import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-2 (A1, H2 y H5): el código de Watari, EJECUTADO, para comparar.
 *
 * Lee orquestador/conocimiento/paquetes/patron-enganche-c4-v1.html, saca de
 * su <script> las utilidades de figura (figs.js, `window.C4F`) y las figuras
 * de T7-2 (f72.js, `C4P['t72-…']`) y las corre sin DOM: cada figura(ctx,
 * item, v) devuelve el HTML que pinta. Las pruebas comparan la consecuencia
 * pura de la casa (contabilidad/c4/t7_2_*_c4.js) contra lo que pinta Watari
 * con la misma elección: los textos [W], letra por letra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const HTML = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/patron-enganche-c4-v1.html", import.meta.url), "utf8");

const tramo = (desde, hasta = "})();") => {
  const i = HTML.indexOf(desde);
  if (i < 0) throw new Error(`el paquete de Watari cambió: no está «${desde}»`);
  const j = HTML.indexOf(hasta, i);
  return HTML.slice(i, j + hasta.length);
};

export const FIGS_JS = tramo("window.C4P = {};", "})();\n");
export const F72_JS = tramo("/* C4 · T7-2 A1, H2 y H5.");

const W = new Function("window", `${FIGS_JS}\nconst C4P = window.C4P, C4F = window.C4F;\n${F72_JS}\nreturn window;`)({});
export const C4P = W.C4P;

/* El texto de la línea de consecuencia que pinta Watari: { tipo: "falla" | "cuadra", t } o null. */
export function lineaDe(html) {
  const m = html.match(/<span class="c4-(falla|cuadra)"><svg[\s\S]*?<\/svg><span>([^<]*)<\/span><\/span>/);
  return m ? { tipo: m[1], t: m[2] } : null;
}
/* Todo el texto, sin etiquetas y con los espacios juntos. */
export const textoDe = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* Los ítems como los arma datos.mjs de Watari (la forma única de su motor), desde los datos de la casa. */
export const piezaA1 = (hechos, inicio) => ({ inicio, items: hechos.map((h) => ({ id: h.id, raw: { cajas: h.cajas, lado: h.lado } })) });
export const piezaHacer = (items) => ({ items: items.filter((it) => it.distractores && it.tipo !== "asiento")
  .map((it) => ({ id: it.id, tipo: it.tipo, correcta: it.correcta, opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => ({ id: String(v), t: String(v), v })), raw: { hecho: it.hecho } })) });

/* Lo que el motor de Watari le pasa a la figura (v) con una elección, ya con el veredicto. */
export function vDe(I, eleccion) {
  const op = eleccion == null ? null : I.opciones.find((o) => o.id === String(eleccion)) ?? null;
  const ok = eleccion != null && (I.tipo === "cifra" ? op?.v === I.correcta : op?.id === String(I.correcta));
  return { eleccion: eleccion == null ? null : String(eleccion), valor: I.tipo === "cifra" ? eleccion : null, op: op ? { v: op.v } : null, ok, anim: false, veredicto: true, resuelto: ok, fallado: eleccion != null && !ok };
}
export const ctxDe = (pieza, hechos = 0) => ({ pieza, s: { e: Object.fromEntries(Array.from({ length: hechos }, (_, i) => [i, { veredicto: true }])) }, pastilla: () => "" });
