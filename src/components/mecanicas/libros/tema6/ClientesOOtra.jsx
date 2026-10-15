import ClasificaDosNiveles from "../b5/ClasificaDosNiveles.jsx";
import {
  T6_ACT1, CUENTAS, LADOS, CLIENTES, BOTON_T6_ACT1, ALT_T6_ACT1, resumenT6Act1,
} from "../../../../data/contabilidadT6Act1.js";
import {
  sortearT6Act1, evaluarT6Act1, valorDeItemT6Act1, puntuarT6Act1,
} from "../../../../contabilidad/t6Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 1 · ¿CLIENTES O OTRA CUENTA POR COBRAR? (Célula B, b5-t6-a1)
 *
 * El componente de dos niveles de la célula (b5/ClasificaDosNiveles.jsx),
 * con lo propio de esta actividad: «Otra cuenta por cobrar» / «Clientes» y,
 * bajo «Clientes», «Se debita» / «Se acredita». Los textos, en
 * data/contabilidadT6Act1.js; el sorteo, la evaluación y el puntaje, en
 * contabilidad/t6Act1.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T6_ACT1 = {
  objetivo: T6_ACT1.objetivo,
  consigna: T6_ACT1.consigna,
  nivel1: CUENTAS,
  abre: CLIENTES,
  nivel2: LADOS,
  botones: BOTON_T6_ACT1,
  alt: ALT_T6_ACT1,
  sortear: sortearT6Act1,
  evaluar: (ficha, m, intento) => evaluarT6Act1(ficha, { cuenta: m.n1, lado: m.n2 }, intento),
  /* El cajón correcto de la ficha, en el estante (calidad, hoja 3). */
  destino: (ficha) => ({ n1: ficha.cuenta, n2: ficha.cuenta === CLIENTES ? ficha.lado : null }),
  valor: valorDeItemT6Act1,
  puntuar: puntuarT6Act1,
  resumen: resumenT6Act1,
};

export default function ClientesOOtra(props) {
  return <ClasificaDosNiveles config={CONFIG_T6_ACT1} {...props} />;
}
