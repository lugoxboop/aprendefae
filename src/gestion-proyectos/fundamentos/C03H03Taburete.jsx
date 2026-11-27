/*
 * C03 · H03 · El taburete de tres patas (gp26-fun-c03-h03-taburete, Medio, 25 × 2 FP × %).
 * Etapa 1: el taburete de barista con tres patas rotuladas; cada acierto
 * alarga su pata un tramo y el asiento se inclina hacia la más corta; con las
 * tres parejas queda nivelado. Etapa 2: tres taburetes con hoja de vida; el
 * inestable se tambalea, el estable sostiene al zorro.
 */
import { Ruler, Flag, BarChart3 } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C3_H03 } from "./textos-c3.js";

export const ID = GP_C3_H03.id;
const TABURETE = primero("taburete-barista", "escritorio-madera");
const PATAS = [["tecnica", "Técnica", "#6cc3d5"], ["liderazgo", "Liderazgo", "#f2c14e"], ["estrategica", "Negocios", "#a3d65c"]];

/* Inclinación: hacia la pata más corta (la izquierda es técnica, la derecha negocio). */
function inclinacion(estado) {
  const [t, l, e] = PATAS.map(([k]) => cuantos(estado, k));
  return Math.max(-9, Math.min(9, (e - t) * 3 + (l === Math.min(t, l, e) && l < Math.max(t, e) ? 2 : 0)));
}

function Patas(estado) {
  return (
    <div className="gp2-caja" style={{ marginTop: 10, display: "grid", gap: 6 }} data-patas>
      {PATAS.map(([k, n, c]) => {
        const v = cuantos(estado, k);
        return (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr 34px", gap: 6, alignItems: "center" }} data-pata={k} data-tramos={v}>
            <small>{n}</small>
            <span className="gp2-medidor"><span style={{ transform: `scaleX(${v / 3})`, "--gp2-relleno": c }} /></span>
            <small className="da26-mono">{v}/3</small>
          </div>
        );
      })}
    </div>
  );
}

function Candidatos({ paso, mal, encaja }) {
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }} data-candidatos>
      {paso.destinos.map((d) => (
        <div key={d.id} className="gp2-pieza" data-candidato={d.id}>
          <span className={mal === d.id ? "gp2-tambalea" : ""} style={{ display: "block", transform: encaja === d.id ? "none" : undefined }}>
            <Objeto id={TABURETE} alto={72} />
          </span>
          <span className="gp-chip-c">{d.nombre.replace("Candidato ", "")}</span>
        </div>
      ))}
    </div>
  );
}

export const ESCENA = {
  nombre: "taburete", fondo: ["#3a2a1c", "#16100a"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: TABURETE,
  etapas: [
    { objeto: { id: TABURETE, alto: 120 }, anim: "pesa", antes: () => <EstiloLote2 />,
      objetoEstilo: (e) => ({ transform: `rotate(${inclinacion(e)}deg)`, transition: "transform 480ms cubic-bezier(.3,.9,.4,1)" }),
      destinos: { tecnica: { icono: Ruler }, liderazgo: { icono: Flag }, estrategica: { icono: BarChart3 } },
      encima: (e) => <Patas {...e} /> },
    { objeto: null, mesa: "patrocinadora", anim: "pesa", disposicion: "columna", antes: () => <EstiloLote2 />,
      encima: (e) => <Candidatos {...e} /> },
  ],
};

export default function C03H03Taburete({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
