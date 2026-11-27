/*
 * C06 · H08 · Fichas de dominó (gp26-pla-c06-h08-domino, Difícil, 50 FP × %).
 * La red de la tienda como fila de fichas de dominó, una por actividad, con su
 * letra, duración y holgura total escrita. La ficha retrasada se inclina y va
 * siempre en el centro y más grande; al revelar, las siguientes caen solo
 * hasta donde llega la holgura y la última, «Inauguración», muestra el día
 * nuevo. A 320 px las fichas van en dos filas que siguen el orden de la red.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C6_H08, RED_C6 } from "./textos-c6.js";

export const ID = GP_C6_H08.id;

/* Las actividades que se corren con un retraso de `dias` en `ficha` (red original, todas FS). */
export function corridas(ficha, dias) {
  const es = Object.fromEntries(RED_C6.map((a) => [a.id, a.es]));
  const dur = Object.fromEntries(RED_C6.map((a) => [a.id, a.dur]));
  const nuevo = { ...es };
  const ef = (id) => nuevo[id] + dur[id] + (id === ficha ? dias : 0);
  for (const a of RED_C6) if (a.pre.length) nuevo[a.id] = Math.max(...a.pre.map(ef));
  return { movidas: RED_C6.filter((a) => nuevo[a.id] > es[a.id]).map((a) => a.id), fin: nuevo.I };
}

function Fila({ paso, revelado }) {
  if (!paso.ficha) return null;
  const { movidas, fin } = corridas(paso.ficha, paso.dias);
  return (
    <div className="gp2-caja" data-domino={paso.ficha} style={{ marginTop: 10 }}>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 5, marginTop: 0 }}>
        {RED_C6.map((a) => {
          const cae = revelado && movidas.includes(a.id);
          const es = a.id === paso.ficha;
          return (
            <div key={a.id} className="gp2-pieza" data-ficha={a.id} data-cae={cae ? "1" : undefined} style={{ order: es ? -1 : 0 }}>
              <span className="gp2-gira" style={{ display: "block", transform: es ? "rotate(-14deg) scale(1.15)" : cae ? "rotate(-28deg)" : "none" }}><Objeto id="ficha-domino" alto={es ? 46 : 34} /></span>
              <small className="da26-mono">{a.id} · {a.dur} d · h {a.ht}</small>
            </div>
          );
        })}
      </div>
      <p className="gp-escenita" style={{ marginBottom: 0 }} data-inauguracion={revelado ? fin : undefined}>
        <span className="gp-chip-c">Inauguración</span>
        <small className="da26-mono">{revelado ? `día ${fin}` : "día 23 · ¿se mueve?"}</small>
      </p>
    </div>
  );
}

export const ESCENA = {
  nombre: "domino", fondo: ["#262626", "#0b0b0b"], acento: "#f4f5f7", luz: "rgba(244,245,247,.14)",
  portada: "ficha-domino",
  mesa: "patrocinadora",
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Fila {...e} />,
};

export default function C06H08Domino({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
