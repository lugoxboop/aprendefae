import { ITEMS_H1, OPCIONES_H1 } from "../../data/contabilidadT7_1_h1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H1 «¿Qué cuenta se mueve?» (Hacer · D4 + D9). Objeto propio: las
 * cuentas del periódico (Watari, sección t71-h1). Las cuentas T son las
 * opciones: el hecho entra a la tocada y esa cuenta se mueve; las demás se
 * quedan quietas. «No se anota» es la bandeja: ninguna se mueve.
 *
 * Los ítems son los de Near (contabilidadT7_1_h1.js), tal cual: el hecho, sus
 * cinco opciones en su orden fijo, la línea del error típico en la opción de
 * ese error, el porqué y el pie.
 * Los textos de la figura y de la consecuencia: [W] pendiente de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const NO_SE_ANOTA = "no-se-anota";

export const ITEMS_C4_H1 = ITEMS_H1.map((it) => ({
  id: it.id,
  subtema: it.subtema,
  texto: it.texto,
  pregunta: null,
  opciones: OPCIONES_H1.map((o) => ({ id: o.id, t: o.nombre, correcta: o.id === it.respuesta, msg: it.tipico?.opcion === o.id ? it.tipico.texto : null })),
  bien: null,
  porque: it.porque,
  pie: it.pie,
}));

/* [W] pendiente de Near. */
export const W_H1 = {
  quieta: "quieta",
  seMueve: "⇅ Se mueve con este hecho",
  seMoveria: "⇅ Se movería con este hecho",
  ninguna: "Ninguna cuenta se mueve en ese momento.",
  fallaNoSeAnota: "Si no se anota, ninguna cuenta registra el hecho.",
  falla: (cuenta) => `${cuenta} cambia, y en el periódico este hecho no la mueve.`,
};

export const CONSECUENCIA_C4 = {
  id: "t71-h1",
  objeto: "Las cuentas del periódico",
  modo: "hacer",
  items: ITEMS_C4_H1,
  consecuencia(item, e) {
    const cuentas = item.opciones.filter((o) => o.id !== NO_SE_ANOTA).map((o) => ({
      id: o.id, nombre: o.t, mueve: e === o.id, rotulo: e !== o.id ? W_H1.quieta : o.correcta ? W_H1.seMueve : W_H1.seMoveria,
    }));
    const estado = { eleccion: e ?? null, cuentas, bandeja: e === NO_SE_ANOTA ? W_H1.ninguna : null };
    const o = item.opciones.find((x) => x.id === e);
    if (!o || o.correcta) return estado;
    return { ...estado, falla: e === NO_SE_ANOTA ? W_H1.fallaNoSeAnota : W_H1.falla(o.t) };
  },
};
