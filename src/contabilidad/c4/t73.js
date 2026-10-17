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
 *       figura), pregunta, opciones (en el orden de Near: las baraja el motor
 *       al montar, con pieza.barajar; D8, Mello v4 §1),
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

export function itemsAprender(pantallas, propios = []) {
  return pantallas.filter((p) => p.tipo === "eleccion").map((p) => ({
    id: p.id,
    ...(propios.includes(p.id) ? { tipo: "propio" } : {}),
    texto: [...(p.parrafos ?? []), ...(p.tras ?? [])].join(" "),
    pregunta: p.pregunta,
    opciones: p.opciones.map((o) => ({ id: o.id, t: o.texto, correcta: Boolean(o.correcta), msg: o.devolucion ?? null })),
    pista: p.pista ?? null,
    bien: p.acierto?.texto ?? null,
    porque: p.acierto?.porque ?? null,
    pie: p.pie,
  }));
}

/*
 * Los ítems de un Hacer de T7-3 que NO va al motor (H1, H2, H4, H5: puntúan por
 * unidad y llevan la figura acumulada; lo de #424, T7-2): la forma del motor
 * para la regla consecuencia-c. Cada opción, con su número o texto como id
 * (en texto, como en main); los asientos, «propio» (siguen como en main).
 * `texto(it, v)`: cómo dice la opción la pieza (pesos, factor, porcentaje…).
 */
export function itemsHacer(items, texto, extra = () => ({})) {
  return items.map((it) => (it.tipo === "asiento"
    ? { id: it.id, tipo: "propio", pregunta: it.pregunta, opciones: [], ...extra(it) }
    : {
      id: it.id, tipo: it.tipo === "cifra" ? "cifra" : "eleccion", pregunta: it.pregunta, ...(it.tipo === "cifra" ? { formato: "pesos" } : {}),
      opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => ({
        id: String(v), v: typeof v === "number" ? v : undefined, t: texto(it, v),
        correcta: v === it.correcta, msg: it.distractores.find((d) => d.valor === v)?.retro ?? null,
      })),
      bien: it.acierto, ...extra(it),
    }));
}
/* La elección de una consecuencia: la cifra comprobada (número) o el id de la opción tocada (texto). */
export const valorDe = (item, e) => (e == null || e === "" ? null : item.tipo === "cifra" ? Number(e) : item.opciones.find((o) => o.id === String(e)) ?? null);
/* «Sobran $X frente al…»: la plantilla de Watari, con la contracción de Mello (C4-5). */
export const frente = (x, t, que) => `${x > t ? "Sobran" : "Faltan"} ${pesos(Math.abs(x - t))} frente ${que.startsWith("el ") ? `al ${que.slice(3)}` : `a ${que}`}.`;
