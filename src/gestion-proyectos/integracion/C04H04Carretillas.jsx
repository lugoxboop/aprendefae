/*
 * C04 · H04 · Cuatro carretillas de cambio (gp26-eje-c04-h04-carretillas, Medio, 25 FP × %).
 * Cuatro carretillas de obra frente a la caseta, cada una con su placa. El
 * formulario lleva su línea: en la correctiva, una línea YA desviada; en la
 * preventiva, una que TODAVÍA no se desvía. Al acertar, la carretilla avanza
 * un tramo hacia el turnero de cambios. Micro: quién pide y a dónde van.
 */
import { Undo2, Umbrella, Bandage, PencilLine } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C4_H04 } from "./textos-c4.js";

export const ID = GP_C4_H04.id;
const CARRETILLA = primero("carretilla-obra", "carrito-mercado");
const CASETA = primero("caseta-obra", "bodega");

/* La línea del formulario: plan (punteada) y desempeño (continua). */
function Linea({ paso }) {
  if (!paso.linea) return null;
  const y = paso.linea === "desviada" ? "M4 28 L60 28 L116 44" : "M4 28 L116 28";
  return (
    <div className="gp-escenita" data-linea-formulario={paso.linea}>
      <svg width="120" height="56" viewBox="0 0 120 56" aria-hidden="true">
        <path d="M4 28 L116 28" stroke="#b6bbc5" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d={y} stroke="#f2c14e" strokeWidth="4" fill="none" strokeLinecap="round" />
        {paso.linea === "aun-no" && <path d="M80 28 L116 40" stroke="#f2c14e" strokeWidth="2" strokeDasharray="2 4" fill="none" />}
      </svg>
      <small>{paso.linea === "desviada" ? "El desempeño ya se desvió" : "Todavía no se desvía"}</small>
    </div>
  );
}

function Avance(estado) {
  if (!estado.paso.texto) return null;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 4 }} data-carretillas>
      {["correctiva", "preventiva", "defectos", "actualizacion"].map((k) => (
        <div key={k} className="gp2-pieza" data-avance={k}>
          <span className="gp2-gira" style={{ display: "block", transform: `translateX(${cuantos(estado, k) * 8}px)` }}><Objeto id={CARRETILLA} alto={40} /></span>
        </div>
      ))}
    </div>
  );
}

export const ESCENA = {
  nombre: "carretillas", fondo: ["#33301c", "#14120a"], acento: "#e9c46a", luz: "rgba(233,196,106,.2)",
  portada: CARRETILLA,
  objeto: { id: CASETA, alto: 72, lugar: "detras" },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <><Linea {...e} /><Avance {...e} /></>,
  destinos: {
    correctiva: { icono: Undo2, objeto: CARRETILLA, alto: 36 }, preventiva: { icono: Umbrella, objeto: CARRETILLA, alto: 36 },
    defectos: { icono: Bandage, objeto: CARRETILLA, alto: 36 }, actualizacion: { icono: PencilLine, objeto: CARRETILLA, alto: 36 },
  },
};

export default function C04H04Carretillas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
