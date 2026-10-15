import { N5, BOTON_N5, resumenN5 } from "../../../../data/contabilidadT5_n5.js";
import { prepararN5, evaluarN5, idLineaN5, puntuarN5, TOTAL_N5 } from "../../../../contabilidad/t5N5.js";
import PreguntasConAsientoT5 from "./PreguntasConAsientoT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 · ¿GANÓ O PERDIÓ? (Célula C)
 *
 * Cinco elecciones y los asientos de las dos ventas
 * (PreguntasConAsientoT5.jsx). Los textos y las cifras, en
 * data/contabilidadT5_n5.js; la lógica, en contabilidad/t5N5.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_N5 = {
  datos: N5, botones: BOTON_N5, preparar: prepararN5, evaluar: evaluarN5, idLinea: idLineaN5,
  puntuar: puntuarN5, total: TOTAL_N5, resumen: resumenN5, marca: "t5-n5",
};

export default function GanoOPerdio(props) {
  return <PreguntasConAsientoT5 config={CONFIG_N5} {...props} />;
}
