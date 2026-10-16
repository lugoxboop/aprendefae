import { barajar } from "../../../../utils/barajar.js";
import { H7, BOTON_H7, resumenH7 } from "../../../../data/contabilidadT7_1_h7.js";
import { prepararH7, evaluarH7, puntuarH7, TOTAL_H7 } from "../../../../contabilidad/t7H7.js";
import EscaleraHacer from "./EscaleraHacer.jsx";
import PlanoBodegaH7 from "./PlanoBodegaH7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 7 · ¿QUÉ CONTROL FALTA? (Célula C) · entrega D v2.
 *
 * El objetivo arriba (decisión de L) y la consigna; el contador con «Vale el
 * primer intento». Un caso a la vez, en orden aleatorio, con las siete
 * opciones fijas. La escalera (EscaleraHacer.jsx): al primer error, la línea
 * del distractor y otro intento; al segundo, esa línea y la del libro. Solo
 * suma el primer intento. Encima del caso, el plano de la bodega
 * (PlanoBodegaH7.jsx), que se llena caso a caso.
 *
 * Exploratoria: el motor paga los 10 FP al terminar; el porcentaje va para el
 * panel docente. Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_H7 = {
  datos: { objetivo: H7.objetivo, consigna: H7.consigna.join(" "), distintivo: H7.distintivo },
  botones: BOTON_H7, preparar: () => prepararH7(barajar), evaluar: evaluarH7,
  puntuar: puntuarH7, total: TOTAL_H7, resumen: resumenH7, marca: "h7", etiqueta: "Caso",
  Figura: PlanoBodegaH7,
};

export default function QueControlFalta(props) {
  return <EscaleraHacer config={CONFIG_H7} {...props} />;
}
