/*
 * H16 · El organigrama con nudos (gp26-fun-h16-nudos, Medio, 25 FP × %).
 * El organigrama como tablero con cuerdas; en algunas, nudos visibles. Cada
 * nudo muestra su situación y tres principios; al acertar, el nudo se desata.
 * En el organigrama: tú, el gerente funcional y el equipo.
 * Micro final (sistemas): predecir y revelar; la bodega brilla, pero la
 * tienda de Cartagena se queda sin dinero para abrir.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H16 } from "./textos-c2.js";

export const ID = GP_H16.id;
const NUDOS = 4;

function Nudos({ etapa, paso, encaja }) {
  if (paso.id === "h16-07") {
    if (!encaja) return null;
    return (
      <div className="gp-escenita da26-entra" data-revela="cartagena">
        <span className="gp-chip-c">Bodega: brilla</span>
        <span className="gp-chip-c" style={{ background: "#b6bbc5" }}>Tienda de Cartagena: sin dinero para abrir</span>
      </div>
    );
  }
  const desatados = Math.min(NUDOS, (etapa?.hechos?.length ?? 0) + (encaja ? 1 : 0));
  return (
    <div className="gp-escenita" data-nudos={desatados}>
      <small>Nudos del organigrama</small>
      <span style={{ display: "flex", gap: 6 }} aria-label={`${desatados} de ${NUDOS} nudos desatados`}>
        {Array.from({ length: NUDOS }, (_, k) => (
          <svg key={k} width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
            {k < desatados
              ? <path d="M2 10h26" stroke="#f4f5f7" strokeWidth="3" strokeLinecap="round" />
              : <path d="M2 10h8c4 0 4-7 7-7s3 14 0 14-3-7 1-7h10" fill="none" stroke="#c99a5b" strokeWidth="3" strokeLinecap="round" />}
          </svg>
        ))}
      </span>
    </div>
  );
}

export const ESCENA = {
  nombre: "organigrama", fondo: ["#2f2416", "#140f08"], acento: "#c99a5b", luz: "rgba(201,154,91,.2)",
  portada: "tablero-organigrama",
  objetoDe: (paso) => (paso.id === "h16-07" ? { id: "bodega", alto: 80 } : { id: "tablero-organigrama", alto: 80 }),
  anim: "pesa",
  disposicion: "columna",
  encima: (e) => <Nudos {...e} />,
};

export default function H16Nudos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H16} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
