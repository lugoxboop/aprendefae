/*
 * C07 · H05 · Dos barriles (gp26-pla-c07-h05-reservas, Medio, 25 × 2 FP × %).
 * El patio de la obra con la valla «Línea base de costos». Dentro: la pila de
 * ladrillos (estimación) y el barril pequeño con grifo (contingencias), con la
 * llave colgada del zorro. Fuera, junto a la patrocinadora: el barril grande
 * con candado (gestión). Un letrero alto «Presupuesto del proyecto» abarca
 * valla y barril. Acierto: la tarjeta se vuelve billete y entra en su lugar.
 * En el micro del candado, la patrocinadora lo abre y un tubo lleva el dinero
 * dentro de la valla.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C7_H05 } from "./textos-c7.js";

export const ID = GP_C7_H05.id;

// imagen-pendiente: patio-obra · pila-ladrillos · barril-grifo · barril-candado (llave ya existe)
const PATIO = primero("patio-obra", "reja-obra");
const LADRILLOS = primero("pila-ladrillos", "pared-ladrillo");
const BARRIL_CHICO = primero("barril-grifo", "balde");
const BARRIL_GRANDE = primero("barril-candado", "deposito-reservas");
const LLAVE = primero("llave");
const CANDADO = primero("candado");

function Valla(estado) {
  const { paso, encaja } = estado;
  const abierto = paso.candado && encaja;
  const n = (k) => cuantos(estado, k);
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-valla>
      <b>Presupuesto del proyecto</b>
      <div className="gp2-fila" style={{ justifyContent: "space-between", alignItems: "stretch" }}>
        <div className="gp2-caja" style={{ flex: "1 1 60%", borderStyle: "dashed" }} data-dentro-valla>
          <b>Línea base de costos</b>
          <div className="gp2-fila" style={{ justifyContent: "space-around" }}>
            <span className="gp2-pieza"><Objeto id={LADRILLOS} alto={44} /><small>Estimación{n("estimacion") ? ` · ${n("estimacion")}` : ""}</small></span>
            <span className="gp2-pieza"><Objeto id={BARRIL_CHICO} alto={44} /><small>Contingencias{n("contingencias") ? ` · ${n("contingencias")}` : ""}</small></span>
          </div>
          {abierto && <small className="gp2-entra" style={{ display: "block", marginTop: 4 }} data-tubo>↤ entra el monto aprobado</small>}
        </div>
        <span className="gp2-pieza" style={{ flex: "1 1 30%" }} data-fuera-valla>
          <Objeto id={BARRIL_GRANDE} alto={56} />
          <span className="gp2-gira" style={{ display: "block", transform: abierto ? "rotate(-28deg) translateY(-4px)" : "none", opacity: abierto ? 0.6 : 1 }}><Objeto id={CANDADO} alto={22} /></span>
          <small>Gestión{n("gestion") ? ` · ${n("gestion")}` : ""}</small>
        </span>
      </div>
      <small style={{ display: "block", marginTop: 4 }}>La llave del barril pequeño la llevas tú; la del candado, la patrocinadora.</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "barriles", fondo: ["#33281c", "#120d08"], acento: "#ffc978", luz: "rgba(255,201,120,.18)",
  portada: BARRIL_GRANDE,
  mesa: "tu",
  objeto: { id: PATIO, alto: 64 },
  anim: "gotea",
  antes: () => <EstiloLote4 />,
  encima: (e) => <><div className="gp-sobre" aria-hidden="true"><Objeto id={LLAVE} alto={26} /></div><Valla {...e} /></>,
  destinos: {
    estimacion: { objeto: LADRILLOS, alto: 36 }, contingencias: { objeto: BARRIL_CHICO, alto: 36 }, gestion: { objeto: BARRIL_GRANDE, alto: 36 },
  },
  etapas: [{}, { objeto: null }],
};

export default function C07H05Barriles({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
