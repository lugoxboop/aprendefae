/*
 * C06 · H12 · El rollo del practicante (gp26-pla-c06-h12-plotter, Difícil, 50 FP × %).
 * El rollo de papel de plotter desenrollado sobre la mesa, con un Gantt
 * impreso; cada línea es una nota al margen. El practicante espera al lado.
 * Cada línea abre «Está correcta» y dos correcciones; al acertar, la nota queda
 * tachada y corregida, o marcada «Correcta» con ✓.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C6_H12 } from "./textos-c6.js";

export const ID = GP_C6_H12.id;

function Gantt() {
  const barras = [["A", 0, 3], ["B", 3, 5], ["C", 3, 8], ["D", 11, 10], ["E", 8, 6], ["F", 21, 2], ["G", 3, 7], ["H", 10, 4]];
  return (
    <svg viewBox="0 0 240 90" width="100%" style={{ display: "block", maxHeight: 96 }} aria-hidden="true" data-gantt>
      {barras.map(([id, es, d], k) => (
        <g key={id}><text x="2" y={10 + k * 10} fontSize="9" fill="#d7dbe2">{id}</text><rect x={14 + es * 9} y={3 + k * 10} width={Math.max(2, d * 9)} height="7" rx="2" fill="#f2c14e" /></g>
      ))}
    </svg>
  );
}

function Nota({ paso, encaja }) {
  if (!encaja) return null;
  const d = paso.destinos.find((x) => x.id === encaja);
  return (
    <p className="gp-escenita gp2-entra" data-nota-corregida={encaja}>
      {encaja === "correcta" ? <span className="gp-chip-c">✓ Correcta</span> : <><s style={{ opacity: 0.7 }}>{paso.texto}</s><span className="gp-chip-c">{d?.nombre}</span></>}
    </p>
  );
}

export const ESCENA = {
  nombre: "plotter", fondo: ["#2a2b2f", "#0d0d10"], acento: "#f4f5f7", luz: "rgba(244,245,247,.14)",
  portada: "rollo-plotter",
  mesa: "practicante",
  objeto: { id: "rollo-plotter", alto: 72, lugar: "detras" },
  anim: "cae",
  disposicion: "columna",
  antes: () => <><EstiloLote2 /><div className="gp2-caja" style={{ marginBottom: 8 }}><Gantt /></div></>,
  despues: (e) => <Nota {...e} />,
};

export default function C06H12Plotter({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
