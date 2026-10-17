import FichasUnNivel from "../b5/FichasUnNivel.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import {
  T6_ACT1, REGLAS_T6_ACT1, CAJONES_T6_ACT1, GRUPO_T6_ACT1, ALT_T6_ACT1, resumenT6Act1, FICHAS_V2_T6_ACT1,
} from "../../../../data/contabilidadT6Act1.js";
import {
  sortearT6Act1, evaluarT6Act1, valorDeItemT6Act1, puntuarT6Act1,
} from "../../../../contabilidad/t6Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 1 · ¿CLIENTES O OTRA CUENTA POR COBRAR? (Célula B, b5-t6-a1)
 *
 * Las fichas a un nivel de la célula (b5/FichasUnNivel.jsx, lote 6a): tres
 * cajones, «Otra cuenta por cobrar», «Clientes, se debita» y «Clientes, se
 * acredita», que son las opciones. Cada cajón marca una cuenta y su lado, y la
 * evaluación es la de siempre (contabilidad/t6Act1.js). Los textos, en
 * data/contabilidadT6Act1.js.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const claveDe = (cuenta, lado) => (lado ? `${cuenta}/${lado}` : cuenta);

export const CONFIG_T6_ACT1 = {
  objetivo: T6_ACT1.objetivo,
  consigna: T6_ACT1.consigna,
  /* Los pasos, plegados bajo «¿Cómo se juega?» (encabezado compacto, lote 6b). */
  reglas: REGLAS_T6_ACT1,
  grupo: GRUPO_T6_ACT1,
  cajones: CAJONES_T6_ACT1.map((k) => ({ clave: claveDe(k.cuenta, k.lado), rotulo: k.rotulo, marcado: { cuenta: k.cuenta, lado: k.lado } })),
  alt: ALT_T6_ACT1,
  sortear: sortearT6Act1,
  evaluar: evaluarT6Act1,
  /* El cajón correcto de la ficha. */
  destino: (ficha) => claveDe(ficha.cuenta, ficha.lado),
  valor: valorDeItemT6Act1,
  puntuar: puntuarT6Act1,
  resumen: resumenT6Act1,
};

/* D8 (lote 18, Futaba): la vuelta 1 es la de hoy; la variante, las ocho fichas nuevas en su orden. */
const CONFIG_V2_T6_ACT1 = { ...CONFIG_T6_ACT1, sortear: () => FICHAS_V2_T6_ACT1 };

export default function ClientesOOtra(props) {
  const { variante, alCompletar } = useVuelta(T6_ACT1.id, props.onCompletar);
  if (props.modoDemo) return <FichasUnNivel config={CONFIG_T6_ACT1} {...props} />;
  return <FichasUnNivel {...props} config={variante ? CONFIG_V2_T6_ACT1 : CONFIG_T6_ACT1} onCompletar={alCompletar} />;
}
