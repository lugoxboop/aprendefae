/*
 * C03 · H02 · Las cinco líneas de tu semana (gp26-fun-c03-h02-tranvia, Fácil, 10 FP × %).
 * El mapa de tranvía con la estación central y cinco líneas en estrella, cada
 * una con su color y su trazo (continuo, rayado, punteado…), sin jerarquía
 * entre ellas. Cada tarea es un vagón; al acertar, la línea de su ámbito se
 * engrosa: se ve cuánto pesa cada ámbito en la semana. Micro final: redes
 * formales o informales, y consenso.
 */
import { HardHat, Building2, Coffee, GraduationCap, Megaphone } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C3_H02 } from "./textos-c3.js";

export const ID = GP_C3_H02.id;
const MAPA = primero("mapa-tranvia", "tablero-corcho");
const VAGON = primero("vagon-tranvia", "camion-cafe");

const LINEAS = [
  { id: "proyecto", color: "#f2c14e", trazo: "0", angulo: -90 },
  { id: "organizacion", color: "#6cc3d5", trazo: "8 5", angulo: -18 },
  { id: "industria", color: "#a3d65c", trazo: "2 5", angulo: 54 },
  { id: "disciplina", color: "#c9a7ff", trazo: "12 4 2 4", angulo: 126 },
  { id: "relacionadas", color: "#ff9f6e", trazo: "4 3", angulo: 198 },
];

function Mapa(estado) {
  if (!estado.paso.texto) return null;
  return (
    <div className="gp2-caja" style={{ marginTop: 10, display: "grid", justifyItems: "center" }} data-mapa-tranvia>
      <svg viewBox="-100 -100 200 200" width="200" height="200" role="img" aria-label="Mapa de las cinco líneas">
        {LINEAS.map((l) => {
          const r = (l.angulo * Math.PI) / 180;
          const n = cuantos(estado, l.id);
          return (
            <g key={l.id} data-linea={l.id} data-peso={n}>
              <line x1="0" y1="0" x2={Math.cos(r) * 84} y2={Math.sin(r) * 84} stroke={l.color} strokeWidth={4 + n * 3} strokeDasharray={l.trazo} strokeLinecap="round" style={{ transition: "stroke-width 420ms" }} />
              <circle cx={Math.cos(r) * 84} cy={Math.sin(r) * 84} r="7" fill={l.color} />
            </g>
          );
        })}
        <circle cx="0" cy="0" r="13" fill="#f4f5f7" stroke="#121418" strokeWidth="3" />
      </svg>
      <div className="gp2-fila" aria-hidden="true">
        {LINEAS.map((l) => <span key={l.id} className="gp-chip-c" style={{ background: l.color }}>{estado.paso.destinos.find((d) => d.id === l.id)?.nombre}</span>)}
      </div>
    </div>
  );
}

const ICONOS = { proyecto: HardHat, organizacion: Building2, industria: Coffee, disciplina: GraduationCap, relacionadas: Megaphone };
export const ESCENA = {
  nombre: "tranvia", fondo: ["#1c2f3a", "#0b151c"], acento: "#6cc3d5", luz: "rgba(108,195,213,.2)",
  portada: MAPA,
  objeto: { id: VAGON, alto: 64 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  destinos: Object.fromEntries(Object.entries(ICONOS).map(([k, icono]) => [k, { icono }])),
  encima: (e) => <Mapa {...e} />,
  despues: (e) => (e.paso.revela && e.encaja ? <div className="gp-escenita gp2-entra" data-revela="redes"><Objeto id={MAPA} alto={56} /><span>La red de contactos destraba el trámite.</span></div> : null),
};

export default function C03H02Tranvia({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
