/*
 * C03 · H04 · El llavero del poder (gp26-fun-c03-h04-llavero, Medio, 25 FP × %).
 * Arriba, la situación detrás de la reja de entrada de la obra, con una
 * cerradura grande. Abajo, el aro del llavero con las 14 llaves (cada una con
 * su nombre grabado): se gira deslizando, unas cinco a la vista. La llave
 * correcta gira la cerradura y la reja se abre; la errada no gira.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { GP_C3_H04 } from "./textos-c3.js";

export const ID = GP_C3_H04.id;
const REJA = primero("reja-obra", "porton-madera");
const LLAVE = primero("llave", "candado");
const LLAVERO = primero("llavero", "candado");

export const ESCENA = {
  nombre: "llavero", fondo: ["#2a2f36", "#111418"], acento: "#c9a7ff", luz: "rgba(201,167,255,.2)",
  portada: LLAVERO,
  objeto: { id: REJA, alto: 96 },
  objetoEstilo: ({ encaja, intento, mal }) => (encaja
    ? { transform: "perspective(400px) rotateY(-34deg)", transition: "transform 520ms cubic-bezier(.3,.9,.4,1)" }
    : mal ? { transform: "translateX(-4px)", transition: "transform 120ms" } : { transition: "transform 320ms" }),
  anim: "abre",
  disposicion: "aro",
  antes: () => <EstiloLote2 />,
  destinos: { "*": { objeto: LLAVE, alto: 34 } },
};

export default function C03H04Llavero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
