import CasillasEnOrden from "../b5/CasillasEnOrden.jsx";
import CajonesDelTiempo, { anuncioDe } from "./CajonesDelTiempo.jsx";
import {
  T6_ACT6, REGLAS_T6_ACT6, PARTES_T6_ACT6, ERRORES_T6_ACT6, ALT_T6_ACT6,
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
 * de la tabla de la regla. Calidad 1: la nota sube encima de la tabla, sin
 * pie, y el rótulo y la fuente del porcentaje son dos líneas sin cajas al
 * pie de la tabla, dentro de su borde. El «%» va pegado a su número, como en T6 · A5.
 * Los textos y las cifras, en data/contabilidadT6Act6.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const conPorcentaje = (casillas) => casillas.map((c) => ({ ...c, enunciado: pegarPorcentaje(c.enunciado) }));

/*
 * Calidad (hoja 2 de Mai): la nota, la regla en tabla, su pie y el rótulo
 * van en el visual de la actividad (CajonesDelTiempo.jsx), que también es su
 * registro: el eje de los cajones en la parte 1 y las barras en la parte 2.
 */
export const CONFIG_T6_ACT6 = {
  objetivo: T6_ACT6.objetivo,
  consigna: T6_ACT6.consigna,
  reglas: REGLAS_T6_ACT6,
  partida: pegarPorcentaje(T6_ACT6.partida),
  partes: PARTES_T6_ACT6.map((p) => ({ ...p, casillas: conPorcentaje(p.casillas) })),
  errores: Object.fromEntries(Object.entries(ERRORES_T6_ACT6).map(([k, t]) => [k, pegarPorcentaje(t)])),
  cierre: T6_ACT6.cierre,
  alt: ALT_T6_ACT6,
  etiqueta: "Casilla",
  /* Lote 6c: en las casillas de ubicar (1 a 3), los cajones del eje son las opciones. */
  visual: { Componente: CajonesDelTiempo, anuncio: anuncioDe, enDemo: true, opciones: (c, demo) => demo || c.parte === PARTES_T6_ACT6[0].id },
};

export default function ProvisionPorEdades(props) {
  return <CasillasEnOrden config={CONFIG_T6_ACT6} {...props} />;
}
