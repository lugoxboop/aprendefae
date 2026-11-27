/*
 * C06 · H03 · Las piezas que encajan (gp26-pla-c06-h03-rompecabezas, Medio, 25 × 2 FP × %).
 * Etapa 1: dos piezas de rompecabezas grandes, una por actividad (a 320 px una
 * encima de otra) y, entre ellas, el hueco. Los cuatro conectores (FS, SS, FF,
 * SF) llevan sigla, nombre y un dibujo de barras; al acertar, las piezas
 * encajan y se dibuja la flecha entre la parte correcta de cada barra (como el
 * gráfico 6-9). Etapa 2: la mesa de trabajo con cuatro cajones (2 × 2); la
 * alcaldía aparece como edificio en la columna Externa.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C6_H03, CONECTORES_C6 } from "./textos-c6.js";

export const ID = GP_C6_H03.id;

/* Dos barras de Gantt y la flecha entre el extremo que toca (gráfico 6-9). */
/* [x en la predecesora (fin 96 / inicio 4), x en la sucesora (inicio 20 / fin 112)] */
const PUNTOS = { fs: [96, 20], ss: [4, 20], ff: [96, 112], sf: [4, 112] };
function Barras({ tipo, alto = 36 }) {
  const [a, b] = PUNTOS[tipo];
  return (
    <svg width="120" height={alto} viewBox="0 0 120 40" aria-hidden="true" data-barras={tipo}>
      <rect x="4" y="4" width="92" height="10" rx="3" fill="#f4f5f7" />
      <rect x="20" y="26" width="92" height="10" rx="3" fill="#f2c14e" />
      <path d={`M${a} 14 L${a} 20 L${b} 20 L${b} 26`} stroke="#a7bbff" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function Encaje({ paso, encaja }) {
  if (!paso.texto || !CONECTORES_C6.some((c) => c.id === paso.clave)) return null;
  return (
    <div className="gp-escenita" data-encaje={encaja ? "1" : undefined}>
      <span className="gp2-gira" style={{ display: "block", transform: encaja ? "translateX(10px)" : "none" }}><Objeto id="pieza-rompecabezas" alto={44} /></span>
      {encaja ? <Barras tipo={encaja} /> : <small>Falta el conector</small>}
      <span className="gp2-gira" style={{ display: "block", transform: encaja ? "translateX(-10px) scaleX(-1)" : "scaleX(-1)" }}><Objeto id="pieza-rompecabezas" alto={44} /></span>
    </div>
  );
}

export const ESCENA = {
  nombre: "rompecabezas", fondo: ["#2a2036", "#0f0b14"], acento: "#c3a6ff", luz: "rgba(195,166,255,.2)",
  portada: "pieza-rompecabezas",
  anim: "conecta",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Encaje {...e} />,
  destinos: Object.fromEntries(CONECTORES_C6.map((c) => [c.id, {}])),
  etapas: [{}, {
    objeto: { id: "mesa-cajones", alto: 76 }, mesa: "tu",
    destinos: { "obl-ext": { objeto: "edificio-gobierno", alto: 30 }, "dis-ext": { objeto: "edificio-gobierno", alto: 30 } },
  }],
};

export default function C06H03Rompecabezas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
