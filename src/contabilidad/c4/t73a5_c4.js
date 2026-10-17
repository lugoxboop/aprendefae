import { PIEZA_SOBRANTES_Y_FALTANTES as P, I_LIBRO } from "../../data/contabilidadT7_3_a5.js";
import { itemsAprender, numDe, pesos } from "./t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 A5 «Sobrantes y faltantes» · D4 · objeto: libros contra conteo.
 * El ajuste tocado mueve la barra de los libros frente a la del conteo:
 * quedan iguales, o no (Watari, f73.js).
 *
 * consecuencia(item, eleccion) → { libros, conteo, ajustados?, falla? | cuadra? }
 *
 * [W] pendiente de Near: el rótulo «Libros, ajustados» y los textos de
 * consecuencia. Las barras de libros y conteo, con sus rótulos y su título,
 * son las de Near (barrasDeConteo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = I_LIBRO;

/* [W] pendiente de Near */
export const W_A5 = {
  ajustados: "Libros, ajustados",
  bien: "Los libros quedan iguales al conteo.",
  mal: (nuevo, conteo) => `Los libros quedarían en ${pesos(nuevo)} y el conteo da ${pesos(conteo)}.`,
};
const W = W_A5;

export const CONSECUENCIA_C4 = {
  id: P.id,
  objeto: "Libros contra conteo",
  modo: "aprender",
  /* D8 (Mello, v4 §1): el motor baraja las opciones una vez al montar, con utils/barajar.js. */
  barajar: true,
  items: itemsAprender(P.pantallas),
  consecuencia(item, eleccion) {
    const sobra = item.id === "sobrante";
    const conteo = sobra ? C.conteoSobra : C.conteoFalta;
    const o = item.opciones.find((x) => x.id === eleccion);
    const estado = { libros: C.libros, conteo };
    if (!o) return estado;
    const ajustados = sobra ? C.libros + numDe(o.t) : { debe: C.libros + C.faltante, haber: C.libros - C.faltante, "no-se-mueve": C.libros }[o.id];
    return { ...estado, ajustados, ...(ajustados === conteo ? { cuadra: W.bien } : { falla: W.mal(ajustados, conteo) }) };
  },
};
