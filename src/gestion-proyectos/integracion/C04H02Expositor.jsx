/*
 * C04 · H02 · El expositor de los casos (gp26-ini-c04-h02-expositor, Medio, 25 × 2 FP × %).
 * Etapa 1: el expositor giratorio de postales de la PMO con siete bolsillos,
 * uno por razón de la guía; la postal acertada queda asomada con ✓ y el
 * expositor gira para la siguiente. Etapa 2: la otra cara, «Para armar el
 * acta», con seis bolsillos de técnicas; en el grupo focal conversa el
 * cliente. Micro final: el caso de negocio no es del proyecto.
 */
import { TrendingUp, Building, Hand, Cpu, Scale, Leaf, HeartHandshake, Lightbulb, MessagesSquare, Mic, Swords, Presentation, CalendarCheck } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C4_H02 } from "./textos-c4.js";

export const ID = GP_C4_H02.id;
const EXPOSITOR = primero("expositor-postales", "tablero-corcho");
const POSTAL = primero("postal", "sobre-carta");
const giro = (e) => ({ transform: `perspective(500px) rotateY(${colocados(e).length % 2 ? 22 : -22}deg)`, transition: "transform 520ms cubic-bezier(.3,.9,.4,1)" });

const ic = (o) => Object.fromEntries(Object.entries(o).map(([k, icono]) => [k, { icono }]));
export const ESCENA = {
  nombre: "expositor", fondo: ["#20304a", "#0d1626"], acento: "#a7bbff", luz: "rgba(167,187,255,.2)",
  portada: EXPOSITOR,
  mesa: "pmo",
  objeto: { id: EXPOSITOR, alto: 96 },
  objetoEstilo: giro,
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  etapas: [
    { destinos: ic({ mercado: TrendingUp, organizacion: Building, cliente: Hand, tecnologia: Cpu, legal: Scale, ecologico: Leaf, social: HeartHandshake }),
      objetoDe: (p) => (p.id === "c4h02-16" ? null : { id: POSTAL, alto: 56 }) },
    { destinos: ic({ tormenta: Lightbulb, focales: MessagesSquare, entrevistas: Mic, conflictos: Swords, facilitacion: Presentation, reuniones: CalendarCheck }),
      mesa: "cliente", disposicion: "rejilla",
      despues: (e) => (e.paso.id === "c4h02-16" ? null : <p className="gp-escenita">Cara del expositor: «Para armar el acta».</p>) },
  ],
};

export default function C04H02Expositor({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
