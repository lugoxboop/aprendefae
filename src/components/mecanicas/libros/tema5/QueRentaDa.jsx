import FichasUnNivel from "../b5/FichasUnNivel.jsx";
import {
  T5_ACT1, CAJONES_T5_ACT1, GRUPO_T5_ACT1, ALT_T5_ACT1, resumenT5Act1,
} from "../../../../data/contabilidadT5Act1.js";
import {
  sortearT5Act1, evaluarT5Act1, valorDeItemT5Act1, puntuarT5Act1,
} from "../../../../contabilidad/t5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 · ¿QUÉ RENTA DA ESTE TÍTULO? (Célula B, b5-t5-a1)
 *
 * Las fichas a un nivel de la célula (b5/FichasUnNivel.jsx, lote 6a): tres
 * cajones, «Renta variable», «Fija con interés» y «Fija con descuento», que
 * son las opciones. Cada cajón marca una renta y su tipo, y la evaluación es
 * la de siempre (contabilidad/t5Act1.js): las devoluciones se reparten como
 * pide Futaba sin cambiar ningún texto. Los textos, en data/contabilidadT5Act1.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const claveDe = (renta, tipo) => (tipo ? `${renta}/${tipo}` : renta);

export const CONFIG_T5_ACT1 = {
  objetivo: T5_ACT1.objetivo,
  consigna: T5_ACT1.consigna,
  grupo: GRUPO_T5_ACT1,
  cajones: CAJONES_T5_ACT1.map((k) => ({ clave: claveDe(k.renta, k.tipo), rotulo: k.rotulo, marcado: { renta: k.renta, tipo: k.tipo } })),
  alt: ALT_T5_ACT1,
  sortear: sortearT5Act1,
  evaluar: evaluarT5Act1,
  /* El cajón correcto de la ficha. */
  destino: (ficha) => claveDe(ficha.renta, ficha.tipo),
  valor: valorDeItemT5Act1,
  puntuar: puntuarT5Act1,
  resumen: resumenT5Act1,
};

export default function QueRentaDa(props) {
  return <FichasUnNivel config={CONFIG_T5_ACT1} {...props} />;
}
