import { N1, ITEMS_N1 } from "../../data/contabilidadT5_n1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 N1 «¿Temporal o a largo plazo?» — la consecuencia, pura (D4 + D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-n1).
 *
 * Objeto propio: el balance de la empresa. El caso cae en el cajón que dice
 * la opción: en el bloque 1, el lado del balance (corriente o no corriente);
 * en el bloque 2, la clase de título; en el bloque 3, lo que respalda la
 * intención. Las opciones viven en la figura (son los cajones).
 *
 * Los ítems, las opciones, los mensajes y el acierto son los de Near, tal
 * cual (data/contabilidadT5_n1.js). El id de cada opción es su texto: así el
 * `detalle` del panel guarda lo mismo que en main.
 *
 * [W] pendiente de Near: los rótulos de los cajones del balance, los títulos
 * de la figura, el chip «Este caso» y las frases de `falla` son de Watari
 * (codigo-f5, t5-n1), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* [W] pendiente de Near · los rótulos de la figura. */
export const FIGURA_N1_C4 = {
  balance: "Balance de la empresa",
  clase: "Clase de título",
  intencion: "Lo que respalda la intención",
  corriente: "Activo corriente · inversiones temporales",
  noCorriente: "Activo no corriente · a largo plazo",
  chip: "Este caso",
};
/* [W] pendiente de Near · lo que implica una opción mala. */
export const FALLA_N1_C4 = {
  balance: "En ese lado del balance, el caso no cumple las condiciones.",
  otro: "Ahí quedaría con otra clase de la que es.",
  /* Mello C4-4 (auditoria-mello-patron-c4.md): la del bloque 3, por opción. [W] pendiente de Near. */
  intencion: {
    "Con una carta firmada por la gerencia.": "Así bastaría con decirlo, y el libro pide evidencias.",
    "Con el tipo de título que compró.": "Así decidiría el nombre del título, no la intención.",
  },
};

export const marcoDeN1 = (item) => (item.bloque === 1 ? "balance" : item.bloque === 2 ? "clase" : "intencion");

/* El cajón de una opción: en el balance, su lado; si no, la opción misma. */
export const rotuloDeN1 = (item, t) => (item.bloque === 1 ? (t === "Temporal" ? FIGURA_N1_C4.corriente : FIGURA_N1_C4.noCorriente) : null);

/* Las opciones en la forma del motor; `orden` permite el barajado del bloque 3 (prepararN1). */
export const itemC4DeN1 = (it, orden = it.opciones) => ({
  id: it.id, bloque: it.bloque, intro: it.intro ?? null, texto: it.pregunta, pregunta: null,
  opciones: orden.map((t) => ({ id: t, t, correcta: t === it.correcta, msg: it.error })),
  bien: it.acierto, pie: N1.pie,
});

export const CONSECUENCIA_C4 = {
  id: "t5-n1",
  objeto: "El balance de la empresa",
  modo: "hacer",
  items: ITEMS_N1.map((it) => itemC4DeN1(it)),
  consecuencia(item, eleccion) {
    const marco = marcoDeN1(item);
    if (eleccion == null) return { marco, cajon: null };
    const o = item.opciones.find((x) => x.id === eleccion);
    const estado = { marco, cajon: eleccion, rotulo: rotuloDeN1(item, eleccion) };
    if (o?.correcta) return estado;
    const falla = marco === "balance" ? FALLA_N1_C4.balance : marco === "intencion" ? FALLA_N1_C4.intencion[eleccion] : FALLA_N1_C4.otro;
    return { ...estado, falla };
  },
};
