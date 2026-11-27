/*
 * C08 · H01 · La góndola de las cápsulas (gp26-pla-c08-h01-gondola, Fácil, 10 × 2 FP × %).
 * La góndola de supermercado con cuatro casillas: eje horizontal «Grado»
 * (Básica · Premium) y eje vertical «Calidad» (Cumple · No cumple), con el
 * nombre de cada casilla y de cada eje ESCRITO. El cliente mira la góndola y
 * el gerente funcional trae los lotes. Acierto: la cápsula se acomoda en el
 * estante y la casilla muestra ✓.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H01 } from "./textos-c8.js";

export const ID = GP_C8_H01.id;

// imagen-pendiente: gondola · capsula-basica · capsula-premium
const GONDOLA = primero("gondola", "alacena");
const BASICA = primero("capsula-basica", "taza-marca-azul");
const PREMIUM = primero("capsula-premium", "taza-marca-ambar");

function Ejes(estado) {
  if (estado.paso.tipo === "casillas") return null;
  const n = ["basica-cumple", "premium-cumple", "basica-no", "premium-no"].map((k) => cuantos(estado, k));
  return (
    <div className="gp4-ejes" data-gondola={n.join("-")}>
      <span>↔ Grado: básica · premium</span><span>↕ Calidad: cumple · no cumple</span>
    </div>
  );
}

export const ESCENA = {
  nombre: "gondola", fondo: ["#23332c", "#0b120f"], acento: "#9be59b", luz: "rgba(155,229,155,.16)",
  portada: GONDOLA,
  mesa: "gerente",
  objeto: { id: GONDOLA, alto: 84 },
  anim: "cae",
  disposicion: "cuadrantes",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Ejes {...e} />,
  destinos: {
    "basica-cumple": { objeto: BASICA, alto: 36 }, "basica-no": { objeto: BASICA, alto: 36 },
    "premium-cumple": { objeto: PREMIUM, alto: 36 }, "premium-no": { objeto: PREMIUM, alto: 36 },
  },
  etapas: [{}, { mesa: "cliente" }],
};

export default function C08H01Gondola({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
