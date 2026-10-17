import { CLIENTES, EN_CUAL_T6_ACT1 } from "../../../../data/contabilidadT6Act1.js";
import { PreguntaSegunda, OpcionesSegunda } from "../b5/SegundaDecision.jsx";
import TDeClientes from "./TDeClientes.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a1 · «¿EN CUÁL?» (lote 23, Shoko).
 *
 * Las fichas de otra cuenta ya no se deciden solo entre Clientes y Otra: tras
 * acertar la decisión 1 (o tras su segundo intento), se elige en cuál de las
 * cuentas de la p. 196 va, con las opciones de E4 (pista al primer error; al
 * segundo, el porqué y lo correcto). La T de Clientes sigue a la vista, quieta:
 * es la historia de las fichas de Clientes y no se toca con estas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function EnCual({ activa, elegidas, correcta, fin, onElegir }) {
  return (
    <div data-segunda-decision="en-cual">
      <PreguntaSegunda texto={EN_CUAL_T6_ACT1.pregunta} />
      <OpcionesSegunda opciones={EN_CUAL_T6_ACT1.opciones} elegidas={elegidas} correcta={correcta} fin={fin} activa={activa} onElegir={onElegir} />
    </div>
  );
}

/* La vista de la decisión 2 de t6-a1: la T para las de Clientes; para las de otra cuenta, «¿En cuál?» y la T quieta. */
export default function SegundaDeT6Act1(props) {
  if (props.ficha.cuenta === CLIENTES) return <TDeClientes {...props} />;
  const enDos = props.activa || props.fin;
  return (
    <>
      {enDos && <EnCual {...props} />}
      <TDeClientes {...props} activa={false} elegidas={[]} correcta={null} fin={false} />
    </>
  );
}
