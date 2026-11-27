/*
 * C08 · H02 · Las cuatro cubetas (gp26-pla-c08-h02-cubetas, Medio, 25 × 2 FP × %).
 * El estante metálico de dos pisos con cuatro cubetas apilables. Piso de
 * arriba, «Conformidad»: Prevención · Evaluación. Piso de abajo, «No
 * conformidad»: Fallas internas · Fallas externas. Cada factura cae doblada en
 * su cubeta y la cubeta se llena un nivel. En el micro de predecir, la cubeta
 * de Evaluación se desborda mientras la de fallas casi no baja.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos, Barra } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H02 } from "./textos-c8.js";

export const ID = GP_C8_H02.id;

// imagen-pendiente: estante-metalico · cubeta-apilable · factura
const ESTANTE = primero("estante-metalico", "archivador-metalico");
const CUBETA = primero("cubeta-apilable", "balde");
const FACTURA = primero("factura", "sobre-carta");

function Estante(estado) {
  const { paso, encaja } = estado;
  if (paso.desborda) {
    return (
      <div className="gp2-caja" style={{ marginTop: 10 }} data-desborda={encaja ? "si" : "no"}>
        <b>Si se duplica la evaluación, y otra vez…</b>
        <Barra nombre="Evaluación" valor={encaja ? 1 : 0.5} relleno="#a7bbff" />
        <Barra nombre="Fallas internas y externas" valor={encaja ? 0.42 : 0.5} relleno="#ffc978" />
      </div>
    );
  }
  if (paso.tipo === "casillas") return null;
  const nivel = (k) => Math.min(1, cuantos(estado, k) / 2);
  return (
    <div className="gp2-caja" style={{ marginTop: 10 }} data-estante>
      <b>Conformidad (arriba) · No conformidad (abajo)</b>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>
        {[["prevencion", "Prevención"], ["evaluacion", "Evaluación"], ["internas", "Fallas internas"], ["externas", "Fallas externas"]].map(([k, n]) => (
          <span key={k} className="gp2-pieza" data-cubeta={k}>
            <Objeto id={CUBETA} alto={32} />
            <Barra nombre={n} valor={nivel(k)} relleno={k === "internas" || k === "externas" ? "#ffc978" : "#a7bbff"} />
          </span>
        ))}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "cubetas", fondo: ["#262c33", "#0b0d10"], acento: "#a7bbff", luz: "rgba(167,187,255,.18)",
  portada: ESTANTE,
  mesa: "patrocinadora",
  objeto: { id: FACTURA, alto: 52 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Estante {...e} />,
  destinos: { "*": { objeto: CUBETA, alto: 30 } },
  etapas: [{}, { objeto: { id: ESTANTE, alto: 64 }, destinos: {} }],
};

export default function C08H02Cubetas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
