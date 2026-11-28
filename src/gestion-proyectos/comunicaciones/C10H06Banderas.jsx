/*
 * C10 · H06 · Las banderas de señales (gp26-pla-c10-h06-banderas, Medio, 25 FP × %).
 * El mástil de señales marítimas del muelle con cinco banderas de diseño
 * propio (forma y patrón, no solo color), cada una con ícono y nombre:
 * Urgencia (reloj) · Disponibilidad y confiabilidad (antena) · Facilidad de
 * uso (pulgar) · Entorno del proyecto (globo con husos) · Confidencialidad
 * (candado). Al acertar, la bandera sube ondeando (solo las izadas suben).
 */
import { Clock, Globe, Lock, RadioTower, ThumbsUp } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H06 } from "./textos-c10.js";

export const ID = GP_C10_H06.id;

// imagen-pendiente: mastil-banderas
const MASTIL = primero("mastil-banderas", "senal-vial");
const BANDERAS = GP_C10_H06.etapas[0].destinos;
/* Cada bandera, su forma y su patrón (se distinguen sin color). */
const DIBUJO = {
  urgencia: { forma: "0,0 44,0 44,28 0,28", patron: "rayas" },
  disponibilidad: { forma: "0,0 44,14 0,28", patron: "liso" },
  facilidad: { forma: "0,0 44,0 34,14 44,28 0,28", patron: "puntos" },
  entorno: { forma: "0,0 44,0 44,28 0,28", patron: "cruz" },
  confidencialidad: { forma: "0,0 44,0 44,28 0,28", patron: "cuadros" },
};

function Bandera({ id, alta }) {
  const d = DIBUJO[id];
  return (
    <svg viewBox="0 0 50 70" width="44" height="62" role="img" aria-label={`${BANDERAS.find((b) => b.id === id).nombre}${alta ? ", izada" : ""}`} data-bandera={id} data-izada={alta ? "1" : undefined}>
      <line x1="3" y1="0" x2="3" y2="70" stroke="#f4f5f7" strokeWidth="2" />
      <g style={{ transform: `translateY(${alta ? 2 : 40}px)`, transition: "transform 520ms cubic-bezier(.2,.8,.2,1)" }}>
        <polygon points={d.forma} transform="translate(4 0)" fill="#fbf7ee" stroke="#121418" strokeWidth="1.5" />
        {d.patron === "rayas" && [7, 14, 21].map((y) => <line key={y} x1="4" y1={y} x2="48" y2={y} stroke="#1d3557" strokeWidth="3" />)}
        {d.patron === "puntos" && [[14, 9], [26, 19], [14, 19], [26, 9]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#1d3557" />)}
        {d.patron === "cruz" && <><line x1="26" y1="0" x2="26" y2="28" stroke="#1d3557" strokeWidth="5" /><line x1="4" y1="14" x2="48" y2="14" stroke="#1d3557" strokeWidth="5" /></>}
        {d.patron === "cuadros" && [[4, 0], [26, 14]].map(([x, y]) => <rect key={x} x={x} y={y} width="22" height="14" fill="#1d3557" />)}
      </g>
    </svg>
  );
}

function Mastil(estado) {
  return (
    <Lamina titulo="Mástil de señales del muelle" data-mastil={BANDERAS.map((b) => cuantos(estado, b.id)).join("-")}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
        {BANDERAS.map((b) => <Bandera key={b.id} id={b.id} alta={cuantos(estado, b.id) > 0} />)}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "banderas", fondo: ["#173042", "#07111a"], acento: "#f4f5f7", luz: "rgba(142,202,230,.16)",
  portada: MASTIL,
  mesa: "tu",
  objeto: { id: MASTIL, alto: 60 },
  anim: "abre",
  disposicion: "palancas",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Mastil {...e} />,
  destinos: {
    urgencia: { icono: Clock }, disponibilidad: { icono: RadioTower }, facilidad: { icono: ThumbsUp },
    entorno: { icono: Globe }, confidencialidad: { icono: Lock },
  },
};

export default function C10H06Banderas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
