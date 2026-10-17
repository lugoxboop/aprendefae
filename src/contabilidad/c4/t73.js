/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 — LO COMÚN DE LAS PIEZAS DEL LOTE (puro, sin React).
 *
 * Lee los datos de Near (src/data/contabilidadT7_3*.js) y los deja en la
 * forma del motor C4 (t7/decisionC4.jsx), sin cambiar ningún texto (datos.mjs
 * del prototipo de Watari, «Patrón de enganche C4»):
 *
 *   itemsAprender(pantallas, propios?)  las pantallas de elección de una
 *       pieza de Aprender, una por ítem: texto (párrafos y lo que sigue a la
 *       figura), pregunta, opciones (barajadas con semilla fija: lote V),
 *       pista, acierto, «¿Por qué?» y pie. Los ids de `propios` van como
 *       ítem «propio» (sin figura de consecuencia: A7, las tres de A8).
 *   opcionesDeCifra(it)  la correcta y los distractores de un ítem de Hacer
 *       con cifra, con su `v` y su texto
 *   pesos(n)  «$4.200.000»
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const pesos = (n) => `${n < 0 ? "−" : ""}$${Math.round(Math.abs(n)).toLocaleString("es-CO")}`;
/* «21,34 %»: el porcentaje con coma y hasta dos decimales. */
export const pct = (x, d = 2) => `${x.toLocaleString("es-CO", { maximumFractionDigits: d })} %`;
/* «$4.200.000» → 4200000 */
export const numDe = (t) => Number(String(t).replace(/[^\d,]/g, "").replace(",", "."));

/* Lote V: el orden de las opciones se baraja con una semilla fija por ítem (estable entre visitas, distinto entre ítems). */
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

export function itemsAprender(pantallas, propios = []) {
  return pantallas.filter((p) => p.tipo === "eleccion").map((p) => ({
    id: p.id,
    ...(propios.includes(p.id) ? { tipo: "propio" } : {}),
    texto: [...(p.parrafos ?? []), ...(p.tras ?? [])].join(" "),
    pregunta: p.pregunta,
    opciones: barajarFijo(p.opciones.map((o) => ({ id: o.id, t: o.texto, correcta: Boolean(o.correcta), msg: o.devolucion ?? null })), p.id),
    pista: p.pista ?? null,
    bien: p.acierto?.texto ?? null,
    porque: p.acierto?.porque ?? null,
    pie: p.pie,
  }));
}
