import ClasificaDosNiveles from "../b5/ClasificaDosNiveles.jsx";
import {
  T5_ACT1, RENTAS, TIPOS_FIJA, FIJA, BOTON_T5_ACT1, ALT_T5_ACT1, resumenT5Act1,
} from "../../../../data/contabilidadT5Act1.js";
import {
  sortearT5Act1, evaluarT5Act1, valorDeItemT5Act1, puntuarT5Act1,
} from "../../../../contabilidad/t5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 · ¿QUÉ RENTA DA ESTE TÍTULO? (Célula B, b5-t5-a1)
 *
 * El componente de dos niveles de la célula (b5/ClasificaDosNiveles.jsx),
 * con lo propio de esta actividad: «Renta variable» / «Renta fija» y, bajo
 * «Renta fija», «Con interés» / «Con descuento». Los textos, en
 * data/contabilidadT5Act1.js; el sorteo, la evaluación y el puntaje, en
 * contabilidad/t5Act1.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CONFIG_T5_ACT1 = {
  objetivo: T5_ACT1.objetivo,
  consigna: T5_ACT1.consigna,
  nivel1: RENTAS,
  abre: FIJA,
  nivel2: TIPOS_FIJA,
  botones: BOTON_T5_ACT1,
  alt: ALT_T5_ACT1,
  sortear: sortearT5Act1,
  evaluar: (ficha, m, intento) => evaluarT5Act1(ficha, { renta: m.n1, tipo: m.n2 }, intento),
  /* El cajón correcto de la ficha, en el estante (calidad, hoja 3). */
  destino: (ficha) => ({ n1: ficha.renta, n2: ficha.renta === FIJA ? ficha.tipo : null }),
  valor: valorDeItemT5Act1,
  puntuar: puntuarT5Act1,
  resumen: resumenT5Act1,
};

export default function QueRentaDa(props) {
  return <ClasificaDosNiveles config={CONFIG_T5_ACT1} {...props} />;
}
