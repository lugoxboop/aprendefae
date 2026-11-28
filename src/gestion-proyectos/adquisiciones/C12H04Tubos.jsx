/*
 * C12 · H04 · El correo neumático (gp26-pla-c12-h04-rfi-rfq-rfp, Medio, 25 FP × %).
 * La pared de la oficina con tres tubos de correo neumático de bronce: RFI
 * («saber más»), RFQ («¿cuánto y cómo?») y RFP («propón una solución», el
 * tubo más grueso y con sello, el más formal). El zorro mete la cápsula con la
 * pregunta; al acertar, sube con un soplido; al errar, rebota.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C12_H04 } from "./textos-c12.js";

export const ID = GP_C12_H04.id;

// imagen-pendiente: tubo-neumatico · capsula-neumatica
const TUBO = primero("tubo-neumatico", "valvula");
const CAPSULA = primero("capsula-neumatica", "sobre-carta");

export const ESCENA = {
  nombre: "tubos", fondo: ["#2f2a1c", "#0f0d08"], acento: "#d4a373", luz: "rgba(212,163,115,.18)",
  portada: TUBO,
  mesa: "tu",
  objeto: { id: CAPSULA, alto: 56 },
  anim: "abre",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  destinos: { rfi: { objeto: TUBO, alto: 36 }, rfq: { objeto: TUBO, alto: 40 }, rfp: { objeto: TUBO, alto: 48 } },
};

export default function C12H04Tubos({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
