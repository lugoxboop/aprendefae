import FichasUnNivel from "../b5/FichasUnNivel.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import {
  T5_ACT1, REGLAS_T5_ACT1, CAJONES_T5_ACT1, GRUPO_T5_ACT1, ALT_T5_ACT1, resumenT5Act1,
} from "../../../../data/contabilidadT5Act1.js";
import {
  sortearT5Act1, evaluarT5Act1, valorDeItemT5Act1, puntuarT5Act1, mazoT5Act1,
  aplicaSegundaT5Act1, rentaDeT5Act1, evaluarSegundaT5Act1,
} from "../../../../contabilidad/t5Act1.js";
import TiraDeRenta from "./TiraDeRenta.jsx";

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
  /* Los pasos, plegados bajo «¿Cómo se juega?» (encabezado compacto, lote 6b). */
  reglas: REGLAS_T5_ACT1,
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

/* D4 (lote 19, P2 de Mai): las fichas de descripción se juegan con la pregunta de la renta y su tira. */
export const SEGUNDA_DECISION_T5_ACT1 = { aplica: aplicaSegundaT5Act1, correcta: rentaDeT5Act1, evaluar: evaluarSegundaT5Act1, Vista: TiraDeRenta };

/* D8 (lote 18, Futaba): dos mazos fijos, sin fichas repetidas; la vuelta 1 y, desde la 2, se alternan. */
const CONFIG_POR_VUELTA = [0, 1].map((k) => ({ ...CONFIG_T5_ACT1, segunda: SEGUNDA_DECISION_T5_ACT1, sortear: () => mazoT5Act1(k) }));

export default function QueRentaDa(props) {
  const { variante, alCompletar } = useVuelta(T5_ACT1.id, props.onCompletar);
  if (props.modoDemo) return <FichasUnNivel config={CONFIG_T5_ACT1} {...props} />;
  return <FichasUnNivel {...props} config={CONFIG_POR_VUELTA[variante ? 1 : 0]} onCompletar={alCompletar} />;
}
