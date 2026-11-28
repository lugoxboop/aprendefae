/*
 * C09 · H10 · Cinco micrófonos para un choque (gp26-eje-c09-h10-microfonos, Difícil, 50 × 3 FP × %).
 * La tarima del festival con cinco micrófonos de pedestal en fila, cada uno
 * con su placa (técnica y, donde el diseño lo pide, «ganar-perder»…). Al
 * fondo, «Equipo · sonido» y «Equipo · baristas» discuten. La tarjeta
 * acertada se cuelga del pedestal y ese micrófono se enciende. Etapa 2: la
 * técnica que mejor encaja en cada situación. Etapa 3: los tres escalones de
 * la tarima, de abajo arriba.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5 } from "../comun/lote5.jsx";
import { GP_C9_H10 } from "./textos-c9.js";

export const ID = GP_C9_H10.id;

// imagen-pendiente: tarima-microfonos · escalones-madera
const TARIMA = primero("tarima-microfonos", "teatro-telon");
const ESCALONES = primero("escalones-madera", "escalera");
const MICS = GP_C9_H10.etapas[0].destinos;

function Encendidos(estado) {
  if (!estado.paso.texto) return null;
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-microfonos={MICS.map((m) => cuantos(estado, m.id)).join("-")}>
      <span className="gp5-chip">Equipo · sonido ⇄ Equipo · baristas</span>
      {MICS.map((m) => <span key={m.id} className="gp5-chip" data-on={cuantos(estado, m.id) ? "1" : undefined}>{cuantos(estado, m.id) ? "● " : "○ "}{m.nombre.split(" / ")[0]}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "microfonos", fondo: ["#2b1f33", "#0e0911"], acento: "#c3a6ff", luz: "rgba(195,166,255,.16)",
  portada: TARIMA,
  mesa: "equipo",
  objeto: { id: TARIMA, alto: 64 },
  objetos: [ESCALONES],
  deAbajo: true,
  rotuloHueco: (k) => (k === 0 ? "Escalón 1 · abajo" : k === 2 ? "Escalón 3 · arriba" : "Escalón 2"),
  anim: "abre",
  disposicion: "palancas",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Encendidos {...e} />,
  etapas: [{}, { mesa: "tu" }, { mesa: "tu" }],
};

export default function C09H10Microfonos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
