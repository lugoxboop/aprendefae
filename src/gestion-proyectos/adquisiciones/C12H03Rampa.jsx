/*
 * C12 · H03 · ¿Dónde cae el sobrecosto? (gp26-pla-c12-h03-sobrecosto, Difícil, 50 × 2 FP × %).
 * La rampa de canicas de madera que baja en zigzag hasta dos cajas, Altamira
 * y Proveedor, con una compuerta que manda todo a un lado o reparte. Cada
 * canica vale $10 M de sobrecosto. «Ver la regla» abre la fórmula del
 * contrato del caso, sin la respuesta. Las canicas ruedan SOLO después de
 * responder (etapa 1) y se apilan en la caja de Altamira solo después de
 * comprobar la cifra (etapa 2).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6, Lamina } from "../comun/lote6.jsx";
import { GP_C12_H03, TOSTADORA_C12 } from "./textos-c12.js";

export const ID = GP_C12_H03.id;

// imagen-pendiente: rampa-canicas · canica · maletin (caja-paquete y maleta ya existen)
const RAMPA = primero("rampa-canicas", "canal-madera");
const CAJA = primero("caja-paquete");
const MALETIN = primero("maletin", "maleta");
const REPARTO = "Pago = costo real + honorario objetivo, ajustado con el reparto 80/20 de la desviación.";
const REGLA = {
  ffp: "Pago = precio pactado.",
  fpif: "Pago = costo + honorario con incentivo, hasta el precio tope.",
  cpff: "Pago = costo real + honorario fijo.",
  cpif: REPARTO,
  tm: "Pago = horas × tarifa + materiales.",
  ahorro: REPARTO,
};
const CAE = {
  altamira: "Las canicas caen en la caja de Altamira.",
  proveedor: "Las canicas caen en el maletín del proveedor.",
  ambos: "La compuerta reparte: unas a Altamira, otras al proveedor.",
};

function Rampa(estado) {
  const caso = estado.paso.caso;
  const listo = Boolean(estado.encaja || estado.revelado);
  const paga = TOSTADORA_C12.contratos[caso]?.paga;
  return (
    <Lamina titulo="La rampa · cada canica = $10 M" data-rampa={caso}>
      <div className="gp5-chips"><span className="gp5-chip">Costo estimado u objetivo: ${TOSTADORA_C12.objetivo} M</span></div>
      <details style={{ marginTop: 6 }} data-regla>
        <summary style={{ cursor: "pointer", minHeight: 32, font: "700 13px/32px var(--planck-font-sans, system-ui, sans-serif)" }}>Ver la regla</summary>
        <small>{REGLA[caso]}</small>
      </details>
      {listo && estado.paso.tipo !== "casillas" && <small style={{ display: "block", marginTop: 4 }} data-caen={estado.encaja}>{CAE[estado.encaja]}</small>}
      {listo && estado.paso.tipo === "casillas" && <small style={{ display: "block", marginTop: 4 }} data-pila>Caja de Altamira: ${paga} M</small>}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "rampa", fondo: ["#33261b", "#110c08"], acento: "#f4a261", luz: "rgba(244,162,97,.16)",
  portada: RAMPA,
  mesa: "tu",
  objeto: { id: RAMPA, alto: 64 },
  anim: "cae",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Rampa {...e} />,
  destinos: { altamira: { objeto: CAJA, alto: 36 }, proveedor: { objeto: MALETIN, alto: 36 }, ambos: { objeto: RAMPA, alto: 30 } },
};

export default function C12H03Rampa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
