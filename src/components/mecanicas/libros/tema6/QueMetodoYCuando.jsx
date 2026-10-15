import ClasificaDosNiveles from "../b5/ClasificaDosNiveles.jsx";
import {
  T6_ACT7, METODOS, MOMENTOS, PROVISIONES, BOTON_T6_ACT7, ALT_T6_ACT7, resumenT6Act7,
} from "../../../../data/contabilidadT6Act7.js";
import {
  sortearT6Act7, evaluarT6Act7, valorDeItemT6Act7, puntuarT6Act7,
} from "../../../../contabilidad/t6Act7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 7 · ¿QUÉ MÉTODO Y CUÁNDO? (Célula B, b5-t6-a7)
 *
 * El componente de dos niveles de la célula (b5/ClasificaDosNiveles.jsx),
 * como b5-t6-a1: «Anulación directa» / «Provisiones» y, bajo «Provisiones»,
 * «Al cierre» / «Al castigar». Los textos, en data/contabilidadT6Act7.js; el
 * sorteo, la evaluación y el puntaje, en contabilidad/t6Act7.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT7 = {
  consigna: T6_ACT7.consigna,
  nivel1: METODOS,
  abre: PROVISIONES,
  nivel2: MOMENTOS,
  botones: BOTON_T6_ACT7,
  alt: ALT_T6_ACT7,
  sortear: sortearT6Act7,
  evaluar: (ficha, m, intento) => evaluarT6Act7(ficha, { metodo: m.n1, momento: m.n2 }, intento),
  valor: valorDeItemT6Act7,
  puntuar: puntuarT6Act7,
  resumen: resumenT6Act7,
};

export default function QueMetodoYCuando(props) {
  return <ClasificaDosNiveles config={CONFIG_T6_ACT7} {...props} />;
}
