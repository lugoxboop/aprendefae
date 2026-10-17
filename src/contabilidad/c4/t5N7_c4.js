import { ITEMS_N7, CIFRAS_N7, FIGURA_N7 } from "../../data/contabilidadT5_n7.js";
import { pesos } from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 N7 «¿A qué cuenta va?» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-n7).
 *
 * Objeto propio: el libro de Guayacán. La cifra que se escribe entra al debe
 * de Inversiones – títulos, y se ve qué parte de lo que pagó cubre (el
 * precio, los gastos de la compra o todo).
 *
 * La casilla sigue con la escalera de main; los cuatro asientos no entran
 * (tipo "propio"): siguen con «Arma la línea».
 *
 * [W] pendiente de Near: «Lo que pagó: precio … + gastos de la compra …» y
 * las frases de `falla` y `cuadra` son de Watari (codigo-f5, t5-n7), sin
 * revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = CIFRAS_N7.precio;
const G = CIFRAS_N7.gastos;
const T = P + G;

/* [W] pendiente de Near · la línea y las frases de la cuenta. */
export const TEXTOS_N7_C4 = {
  pago: `Lo que pagó: precio ${pesos(P)} + gastos de la compra ${pesos(G)}`,
  cuadra: "Entra todo lo que pagó.",
  soloPrecio: "Entra solo el precio: faltan los gastos de la compra.",
  soloGastos: "Entran solo los gastos: falta el precio.",
  otra: (x) => `${x > T ? "Sobran" : "Faltan"} ${pesos(Math.abs(x - T))} frente a lo que pagó.`,
};

export const CONSECUENCIA_C4 = {
  id: "t5-n7",
  objeto: "El libro de Guayacán",
  modo: "hacer",
  items: ITEMS_N7.map((it) => (it.tipo !== "cifra"
    ? { id: it.id, tipo: "propio", opciones: [] }
    : { id: it.id, tipo: "cifra", texto: it.intro, pregunta: it.pregunta, pista: it.pista, bien: it.acierto, porque: it.porque,
      opciones: [{ id: String(it.correcta), t: pesos(it.correcta), v: it.correcta, correcta: true }, ...it.distractores.map((d) => ({ id: String(d.valor), t: pesos(d.valor), v: d.valor, msg: d.retro }))] })),
  consecuencia(item, eleccion) {
    const base = { cuenta: FIGURA_N7.cuenta, pago: TEXTOS_N7_C4.pago };
    if (eleccion == null) return { ...base, debe: null };
    const x = Number(eleccion);
    const estado = { ...base, debe: x };
    if (x === T) return { ...estado, cuadra: TEXTOS_N7_C4.cuadra };
    if (x === P) return { ...estado, falla: TEXTOS_N7_C4.soloPrecio };
    if (x === G) return { ...estado, falla: TEXTOS_N7_C4.soloGastos };
    /* `delata`: con la diferencia se saca la cifra buena; con la escalera, sale al cerrar el ítem (E8). */
    return { ...estado, falla: TEXTOS_N7_C4.otra(x), delata: true };
  },
};
