import { ITEMS_N4, CIFRAS_N4, TASA_N4 } from "../../data/contabilidadT5_n4.js";
import { pesos } from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 N4 «El interés del periodo» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-n4).
 *
 * Objeto propio: los cobros del año de Caoba, doce meses en una línea. La
 * frecuencia elegida, la base elegida o la cifra escrita cambian los cupones:
 * cuántos cobros hay en el año y cuánto vale cada uno.
 *
 * Los ítems, las cifras y los mensajes son los de Near
 * (data/contabilidadT5_n4.js). El asiento del cobro no entra (tipo
 * "propio"): sigue con «Arma la línea», como en main. La pieza sigue además
 * con su figura acumulada (lote 5).
 *
 * [W] pendiente de Near: el título de la línea, «Cada cobro», «Cobros: ?» y
 * las frases de `falla` y de `cuadra` son de Watari (codigo-f5, t5-n4), sin
 * revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_N4;
const ANUAL = TASA_N4 / 100;
export const MESES_DE_N4 = { "Cada mes": 1, "Cada 3 meses": 3, "Cada 12 meses": 12 };
const pct = (x) => x.toLocaleString("es-CO", { maximumFractionDigits: 1 });

/* [W] pendiente de Near · los rótulos y las frases de la línea de cobros. */
export const TEXTOS_N4_C4 = {
  titulo: (base) => `Caoba · ${pesos(base)} al 16 % anual`,
  cadaCobro: "Cada cobro:",
  sinCobros: "Cobros: ?",
  cuadra: {
    "cada-cuanto": "Trimestre vencido: cuatro cobros al año.",
    "primer-trimestre": "Es el 16 % anual, por 3 meses.",
    "base-del-segundo": "Es lo que le queda: $5.700.000.",
    "segundo-trimestre": "Sale de los $5.700.000 que le quedan.",
  },
  falla: {
    "cada-cuanto": (cada) => `Así serían ${12 / cada} cobro${cada === 12 ? "" : "s"} al año, y es trimestre vencido.`,
    "primer-trimestre": (cupon, base) => `Ese cobro equivale a un ${pct((cupon / base) * 4 * 100)} % anual; la tasa es 16 %.`,
    "base-del-segundo": (base) => `Así cobra interés sobre ${pesos(base)}. Y le quedan $5.700.000.`,
    "segundo-trimestre": (cupon) => `Ese cobro sale de una inversión de ${pesos(cupon / 0.04)}, y le quedan $5.700.000.`,
  },
};

const opcionDe = (it, v) => ({ id: String(v), t: typeof v === "number" ? pesos(v) : v, ...(typeof v === "number" ? { v } : {}) });

export const CONSECUENCIA_C4 = {
  id: "t5-n4",
  objeto: "Los cobros del año",
  modo: "hacer",
  items: ITEMS_N4.map((it) => (it.tipo === "asiento"
    ? { id: it.id, tipo: "propio", opciones: [] }
    : {
      id: it.id, tipo: it.tipo, pregunta: it.pregunta, bien: it.acierto,
      opciones: [
        { ...opcionDe(it, it.correcta), correcta: true },
        ...it.distractores.map((d) => ({ ...opcionDe(it, d.valor), msg: d.retro })),
      ],
    })),
  /* eleccion: el texto o el valor de la opción tocada (como en main) o la cifra escrita. */
  consecuencia(item, eleccion) {
    /* El segundo trimestre ya va sobre lo que le queda (en el prototipo, sobre la inversión entera: dato del ítem 4, que ya se respondió). */
    let cada = 3, base = item.id === "segundo-trimestre" ? C.base2 : C.inversion, cupon = null, nota = null, ok = false;
    const T = TEXTOS_N4_C4;
    if (eleccion != null) {
      if (item.id === "cada-cuanto") { cada = MESES_DE_N4[eleccion] ?? 3; cupon = (base * ANUAL * cada) / 12; ok = eleccion === "Cada 3 meses"; nota = ok ? null : T.falla[item.id](cada); }
      if (item.id === "primer-trimestre") { cupon = Number(eleccion); ok = cupon === C.interes1; nota = ok ? null : T.falla[item.id](cupon, base); }
      if (item.id === "base-del-segundo") { base = Number(eleccion); cupon = (base * ANUAL) / 4; ok = base === C.base2; nota = ok ? null : T.falla[item.id](base); }
      if (item.id === "segundo-trimestre") { cupon = Number(eleccion); ok = cupon === C.interes2; nota = ok ? null : T.falla[item.id](cupon); }
    }
    const estado = { titulo: T.titulo(base), cada, cupon, cobros: cupon == null ? 0 : 12 / cada, alto: cupon == null ? 0 : Math.max(0.12, Math.min(1, cupon / C.interes1)) };
    if (eleccion == null) return estado;
    return ok ? { ...estado, cuadra: T.cuadra[item.id] } : { ...estado, falla: nota };
  },
};
