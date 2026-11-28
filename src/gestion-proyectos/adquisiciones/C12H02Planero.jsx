/*
 * C12 · H02 · El planero de los contratos (gp26-pla-c12-h02-contratos, Medio, 25 × 2 FP × %).
 * El mueble planero de madera con tres cajones anchos rotulados (Precio fijo ·
 * Costos reembolsables · Tiempo y materiales): al soltar la compra en el
 * cajón correcto, el cajón se abre y la tarjeta se acomoda. Etapa 2: el cajón
 * de arriba con los siete rollos de contrato (FFP · FPIF · FP-EPA · CPFF ·
 * CPIF · CPAF · T&M), en 4 + 3 a 320 px; el rollo acertado se desenrolla.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C12_H02 } from "./textos-c12.js";

export const ID = GP_C12_H02.id;

// imagen-pendiente: planero-tres · rollo-contrato (plano-enrollado ya existe)
const PLANERO = primero("planero-tres", "mesa-cajones", "archivador-cajones");
const ROLLO = primero("rollo-contrato", "plano-enrollado");

function Cajones(estado) {
  if (estado.paso.destinos?.length !== 3) return null;
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-cajones={estado.paso.destinos.map((d) => cuantos(estado, d.id)).join("-")}>
      {estado.paso.destinos.map((d) => <span key={d.id} className="gp5-chip" data-on={cuantos(estado, d.id) ? "1" : undefined}>{d.nombre}: {cuantos(estado, d.id)}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "planero", fondo: ["#35281a", "#110c07"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: PLANERO,
  mesa: "tu",
  objeto: { id: PLANERO, alto: 64 },
  anim: "abre",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Cajones {...e} />,
  etapas: [{}, { disposicion: "rollos", objeto: { id: ROLLO, alto: 56 }, destinos: { "*": { objeto: ROLLO, alto: 22 } } }],
};

export default function C12H02Planero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
