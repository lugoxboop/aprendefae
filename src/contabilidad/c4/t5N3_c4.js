import { ITEMS_N3, PISTA_N3 } from "../../data/contabilidadT5_n3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 N3 «La revisión que falta» — la consecuencia, pura (D4).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-n3).
 *
 * Objeto propio: la hoja de revisión. La revisión tocada entra a la hoja en
 * el renglón de «Este caso», y el caso queda cubierto o sin cubrir. Mello
 * pidió: «Que la hoja de revisión marque qué queda sin cubrir con la revisión
 * elegida».
 *
 * La pieza sigue con la escalera de main (t7/EscaleraHacer.jsx: pista y
 * otro intento; al segundo error, la respuesta; solo suma el primer
 * intento). El id de cada opción es la acción misma, como el `detalle`.
 *
 * [W] pendiente de Near: el título de la hoja, «Este caso», los estados
 * (cubierto, sin cubrir, sin revisar) y la frase de `falla` son de Watari
 * (codigo-f5, t5-n3), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near · los rótulos de la hoja. */
export const HOJA_N3_C4 = {
  titulo: "Hoja de revisión de las inversiones",
  esteCaso: "Este caso",
  estado: { cubierto: "Este caso: cubierto", abierto: "Este caso: sin cubrir", sinRevisar: "Este caso: sin revisar" },
};
/* [W] pendiente de Near · lo que implica una revisión que no es la que falta. */
export const FALLA_N3_C4 = "Esa revisión no mira lo que falla en este caso.";

export const CONSECUENCIA_C4 = {
  id: "t5-n3",
  objeto: "La hoja de revisión",
  modo: "hacer",
  items: ITEMS_N3.map((it) => ({
    id: it.id, texto: it.pregunta, pregunta: null, pista: PISTA_N3, bien: it.acierto,
    opciones: it.opciones.map((a) => ({ id: a, t: a, correcta: a === it.correcta, msg: it.porQueNo?.[a] ?? null })),
  })),
  consecuencia(item, eleccion) {
    if (eleccion == null) return { caso: item.id, revision: null, cubierto: null };
    const cubierto = item.opciones.find((o) => o.id === eleccion)?.correcta === true;
    return cubierto ? { caso: item.id, revision: eleccion, cubierto } : { caso: item.id, revision: eleccion, cubierto, falla: FALLA_N3_C4 };
  },
};

/* Por id de caso, para la figura (la pieza pinta con los ítems de main). */
export const consecuenciaN3 = (casoId, eleccion) => {
  const item = CONSECUENCIA_C4.items.find((x) => x.id === casoId);
  return item ? CONSECUENCIA_C4.consecuencia(item, eleccion) : null;
};
