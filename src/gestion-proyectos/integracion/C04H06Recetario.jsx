/*
 * C04 · H06 · El recetario y las manos (gp26-eje-c04-h06-recetario, Medio, 25 × 3 FP × %).
 * Etapa 1: el recetario abierto (explícito) frente a la taza con arte latte
 * que sirve la barista (tácito). Etapa 2: dos bandejas de servicio, Gestión
 * del conocimiento y Gestión de la información; al acertar, la bandeja
 * muestra el nombre de la herramienta concreta. Etapa 3: mitos en posavasos
 * que se voltean (Verdadero / Falso).
 */
import { BookOpen, Hand, Coffee, Tablet, Check, X } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C4_H06 } from "./textos-c4.js";

export const ID = GP_C4_H06.id;
const RECETARIO = primero("recetario", "memorando-clip");
const TAZA = primero("taza-latte", "cafetera-goteo");
const BANDEJA = primero("bandeja-servicio", "bandeja-madera");
const POSAVASOS = primero("posavasos", "sobre-boleto");

function Herramienta({ paso, encaja }) {
  if (!encaja || !paso.herramienta) return null;
  return <p className="gp-escenita gp2-entra" data-herramienta><Objeto id={BANDEJA} alto={40} /><span>Herramienta: {paso.herramienta}</span></p>;
}

export const ESCENA = {
  nombre: "recetario", fondo: ["#33241c", "#140d09"], acento: "#e0b084", luz: "rgba(224,176,132,.22)",
  portada: TAZA,
  anim: "gotea",
  antes: () => <EstiloLote2 />,
  etapas: [
    { mesa: "equipo", objeto: null, encima: () => (
        <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>
          <div className="gp2-pieza"><Objeto id={RECETARIO} alto={70} /><small>Recetario · explícito</small></div>
          <div className="gp2-pieza"><Objeto id={TAZA} alto={70} /><small>Las manos · tácito</small></div>
        </div>),
      destinos: { explicito: { icono: BookOpen, objeto: RECETARIO, alto: 36 }, tacito: { icono: Hand, objeto: TAZA, alto: 36 } } },
    { mesa: "equipo", objeto: { id: BANDEJA, alto: 64 }, despues: (e) => <Herramienta {...e} />,
      destinos: { conocimiento: { icono: Coffee, objeto: BANDEJA, alto: 30 }, informacion: { icono: Tablet, objeto: BANDEJA, alto: 30 } } },
    { mesa: "tu", objeto: { id: POSAVASOS, alto: 70 }, anim: "sella",
      objetoEstilo: ({ encaja }) => ({ transform: encaja ? "rotateY(180deg)" : "none", transition: "transform 480ms cubic-bezier(.3,.9,.4,1)" }),
      destinos: { verdadero: { icono: Check }, falso: { icono: X } } },
  ],
};

export default function C04H06Recetario({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
