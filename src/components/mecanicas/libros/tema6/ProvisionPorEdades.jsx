import CasillasEnOrden from "../b5/CasillasEnOrden.jsx";
import {
  T6_ACT6, GRUPOS_T6_ACT6, PARTES_T6_ACT6, PIES_T6_ACT6, ERRORES_T6_ACT6, ALT_T6_ACT6,
} from "../../../../data/contabilidadT6Act6.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 6 · PROVISIÓN POR EDADES (Célula B, b5-t6-a6)
 *
 * Las casillas en orden de la célula (b5/CasillasEnOrden.jsx): primero se
 * ubican tres deudas en su grupo; después, con la tabla de datos, cada
 * provisión, el total y el valor neto. Es un escenario simulado: el rótulo
 * fijo de T6 · A5, la regla en tabla con el pie del porcentaje, y los pies
 * del escenario en su forma. Hoja de Mai: los datos de la parte 2 van dentro
 * de la tabla de la regla, el rótulo al pie de la tabla, y la fila 1 (sin
 * porcentaje) toma su pie del escenario de la nota. El «%» va pegado a su número, como en T6 · A5.
 * Los textos y las cifras, en data/contabilidadT6Act6.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La fila de la tabla que usa cada casilla de la parte 2 (Mai): la 4, el 5 %; la 5, el 10 %; la 6, el 15 %; la 8, el total. */
const FILA_DE_CASILLA = { p4: "g2", p5: "g3", p6: "g4", p8: "total" };
const conPorcentaje = (casillas) => casillas.map((c) => ({ ...c, enunciado: pegarPorcentaje(c.enunciado), ...(FILA_DE_CASILLA[c.id] ? { fila: FILA_DE_CASILLA[c.id] } : {}) }));

export const CONFIG_T6_ACT6 = {
  consigna: T6_ACT6.consigna,
  rotuloSimulado: T6_ACT6.rotulo,
  /* Un solo pie, el de la norma, para las tres filas con porcentaje; la fila 1 se cubre con el pie del escenario de la nota (Mai). */
  reglaTabla: { filas: GRUPOS_T6_ACT6.map((g) => ({ id: g.id, nombre: g.nombre, valor: pegarPorcentaje(g.porcentaje) })), pie: PIES_T6_ACT6.regla },
  nota: { texto: T6_ACT6.nota, pie: PIES_T6_ACT6.nota },
  partida: pegarPorcentaje(T6_ACT6.partida),
  partes: PARTES_T6_ACT6.map((p) => ({
    ...p,
    casillas: conPorcentaje(p.casillas),
  })),
  errores: Object.fromEntries(Object.entries(ERRORES_T6_ACT6).map(([k, t]) => [k, pegarPorcentaje(t)])),
  cierre: T6_ACT6.cierre,
  alt: ALT_T6_ACT6,
  etiqueta: "Casilla",
};

export default function ProvisionPorEdades(props) {
  return <CasillasEnOrden config={CONFIG_T6_ACT6} {...props} />;
}
