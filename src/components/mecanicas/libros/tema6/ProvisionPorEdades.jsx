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
 * del escenario en su forma. El «%» va pegado a su número, como en T6 · A5.
 * Los textos y las cifras, en data/contabilidadT6Act6.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const conPorcentaje = (casillas) => casillas.map((c) => ({ ...c, enunciado: pegarPorcentaje(c.enunciado) }));

export const CONFIG_T6_ACT6 = {
  consigna: T6_ACT6.consigna,
  rotuloSimulado: T6_ACT6.rotulo,
  /* Cada fila con su pie: la 1, del escenario; las 2 a 4, de la norma (auditoría de Shoko). */
  reglaTabla: { filas: GRUPOS_T6_ACT6.map((g) => ({ nombre: g.nombre, valor: pegarPorcentaje(g.porcentaje), pie: g.pie })) },
  nota: { texto: T6_ACT6.nota, pie: PIES_T6_ACT6.nota },
  partida: pegarPorcentaje(T6_ACT6.partida),
  partes: PARTES_T6_ACT6.map((p) => ({
    ...p,
    casillas: conPorcentaje(p.casillas),
    ...(p.datos ? { datos: { ...p.datos, pie: PIES_T6_ACT6.datos } } : {}),
  })),
  errores: Object.fromEntries(Object.entries(ERRORES_T6_ACT6).map(([k, t]) => [k, pegarPorcentaje(t)])),
  cierre: T6_ACT6.cierre,
  alt: ALT_T6_ACT6,
  etiqueta: "Casilla",
};

export default function ProvisionPorEdades(props) {
  return <CasillasEnOrden config={CONFIG_T6_ACT6} {...props} />;
}
