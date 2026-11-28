/*
 * C04 · H03 · El portaplanos y el revistero (gp26-pla-c04-h03-portaplanos, Medio, 25 × 2 FP × %).
 * Etapa 1: a la izquierda el tubo portaplanos «Plan para la dirección del
 * proyecto»; a la derecha el revistero «Documentos del proyecto». El equipo
 * entrega cada hoja; el portaplanos engorda con cada componente enrollado.
 * Etapa 2: la regla de madera «Línea base» sobre la línea de tiempo: libre
 * mientras no hay líneas base; fijada con dos remaches al aprobarse.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C4_H03 } from "./textos-c4.js";

export const ID = GP_C4_H03.id;
const PORTAPLANOS = primero("portaplanos", "plano-enrollado");
const REVISTERO = primero("revistero", "archivador-cajones");
const REGLA = primero("regla-madera", "balancin-tabla");

function Escritorio(estado) {
  const n = cuantos(estado, "plan");
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-escritorio>
      <div className="gp2-pieza" data-portaplanos={n}>
        <span className="gp2-gira" style={{ display: "block", transform: `scale(${1 + n * 0.06})` }}><Objeto id={PORTAPLANOS} alto={64} /></span>
        <small>{n} enrollados</small>
      </div>
      <div className="gp2-pieza" data-revistero={cuantos(estado, "documentos")}>
        <Objeto id={REVISTERO} alto={64} />
        <small>{cuantos(estado, "documentos")} en el revistero</small>
      </div>
    </div>
  );
}

function Regla({ paso, etapa, encaja }) {
  const fija = paso.id !== "c4h03-15";
  const enRegla = cuantos({ etapa, paso, encaja }, "regla");
  return (
    <div className="gp2-caja" style={{ marginTop: 10, display: "grid", justifyItems: "center", gap: 4 }} data-regla={fija ? "fija" : "libre"}>
      <span className="gp2-gira" style={{ display: "block", transform: fija ? "none" : "rotate(-6deg) translateX(-8px)" }}><Objeto id={REGLA} alto={44} /></span>
      <small>{fija ? "Línea base fijada con dos remaches" : "Línea base aún sin aprobar: la regla se mueve"}{enRegla ? ` · ${enRegla} en la regla` : ""}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "portaplanos", fondo: ["#2d2418", "#120e08"], acento: "#d4a373", luz: "rgba(212,163,115,.22)",
  portada: PORTAPLANOS,
  antes: () => <EstiloLote2 />,
  etapas: [
    { mesa: "equipo", objeto: null, anim: "cae", encima: (e) => <Escritorio {...e} />,
      destinos: { plan: { objeto: PORTAPLANOS, alto: 40 }, documentos: { objeto: REVISTERO, alto: 40 } } },
    { mesa: "patrocinadora", objeto: null, anim: "sella", disposicion: "columna", encima: (e) => <Regla {...e} /> },
  ],
};

export default function C04H03Portaplanos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
