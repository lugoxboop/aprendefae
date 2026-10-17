import { N3, BOTON_N3, GLOSAS_N3, resumenN3 } from "../../../../data/contabilidadT5_n3.js";
import { prepararN3, evaluarN3, puntuarN3, TOTAL_N3 } from "../../../../contabilidad/t5N3.js";
import EscaleraHacer from "../t7/EscaleraHacer.jsx";
import HojaRevisionN3, { EjemploN3 } from "./HojaRevisionN3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 · ¿QUÉ REVISIÓN FALTA? (Célula C) · con N2 adentro, entrega D v2.
 *
 * Cinco casos en el orden fijo de Mello, con las cuatro acciones de la
 * p. 193 como opciones fijas, cada una con su glosa. Sobre el primer caso,
 * el ejemplo resuelto del fondo fiduciario. La escalera (EscaleraHacer.jsx):
 * al primer error, la pista común y la línea del distractor, y otro intento;
 * al segundo, la respuesta con su porqué. Solo suma el primer intento.
 * Debajo, la hoja de revisión, que gana una fila con cada caso resuelto.
 *
 * Los textos, en data/contabilidadT5_n3.js; la lógica, en
 * contabilidad/t5N3.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_N3 = {
  /* El objetivo de los datos, cuando llegue (lote O), como en H7. */
  datos: { ...(N3.objetivo ? { objetivo: N3.objetivo } : {}), consigna: N3.enunciado[0], distintivo: N3.distintivo, pie: N3.pie },
  botones: BOTON_N3, preparar: prepararN3, evaluar: evaluarN3,
  puntuar: puntuarN3, total: TOTAL_N3, resumen: resumenN3, marca: "t5-n3", etiqueta: "Pregunta",
  glosas: GLOSAS_N3, Figura: HojaRevisionN3, Antes: EjemploN3, figuraDebajo: true,
};

export default function RevisionQueFalta(props) {
  return <EscaleraHacer config={CONFIG_N3} {...props} />;
}
