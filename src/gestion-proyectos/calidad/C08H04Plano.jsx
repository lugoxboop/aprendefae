/*
 * C08 · H04 · El plano de la cápsula (gp26-pla-c08-h04-plano, Medio, 25 × 2 FP × %).
 * El plano técnico despiezado de la cápsula (tapa, filtro, cuerpo y café
 * separados en el aire) con siete llamadas, una por sección del plan. Al
 * acertar, una pieza encaja en su lugar; con las siete, la cápsula queda
 * armada y la patrocinadora firma. Las llamadas van en la lista de destinos,
 * bajo el plano (no alrededor), para que quepan a 320 px.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H04 } from "./textos-c8.js";

export const ID = GP_C8_H04.id;

// imagen-pendiente: capsula-despiece
const PLANO = primero("capsula-despiece", "plano-enrollado");
const PIEZAS = ["Tapa", "Filtro", "Cuerpo", "Café"];

function Armado(estado) {
  if (!estado.paso.texto || estado.paso.grupo) return null;
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-capsula={n}>
      <span className="gp2-fila" style={{ gap: 4 }}>
        {PIEZAS.map((p, k) => <span key={p} className="gp-chip-c gp2-gira" style={{ opacity: n >= Math.ceil(((k + 1) * 7) / 4) ? 1 : 0.35, transform: n >= Math.ceil(((k + 1) * 7) / 4) ? "none" : "translateY(-6px)" }}>{p}</span>)}
      </span>
      <small>{n === 7 ? "Cápsula armada: la patrocinadora firma." : `${n} de 7 secciones`}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "plano", fondo: ["#1d2c3d", "#0a1018"], acento: "#a7d8ff", luz: "rgba(167,216,255,.18)",
  portada: PLANO,
  mesa: "patrocinadora",
  objeto: { id: PLANO, alto: 80 },
  anim: "sella",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Armado {...e} />,
  etapas: [{}, { mesa: "tu", disposicion: "columna" }],
};

export default function C08H04Plano({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
