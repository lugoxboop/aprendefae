/*
 * C08 · H03 · El ascensor de cinco pisos (gp26-pla-c08-h03-ascensor, Fácil, 10 × 2 FP × %).
 * El ascensor de carga con cinco pisos a la vista: el zorro y el gerente van
 * en la cabina; cada tarjeta se lleva a un piso, de abajo (el más caro) hacia
 * arriba (el más eficaz), y el ascensor sube. Al completar, el último piso se
 * ilumina. Etapa 2: las dos puertas del ascensor, Prevención (evita el error
 * en el proceso) e Inspección (evita que llegue al cliente).
 */
import { ShieldCheck, Search } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H03 } from "./textos-c8.js";

export const ID = GP_C8_H03.id;

// imagen-pendiente: ascensor-carga
const ASCENSOR = primero("ascensor-carga", "edificio-oficinas");

function Cabina({ puestas, bien }) {
  return (
    <div className="gp-escenita" data-piso={puestas.length}>
      <span className="gp2-gira" style={{ display: "block", transform: `translateY(${-puestas.length * 3}px)` }}><Objeto id={ASCENSOR} alto={72} /></span>
      <small>{bien ? "Piso 5 iluminado: cultura de calidad." : `La cabina va en el piso ${Math.max(1, puestas.length)} de 5`}</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "ascensor", fondo: ["#2a2d33", "#0c0d10"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: ASCENSOR,
  mesa: "gerente",
  objetos: [],
  deAbajo: true,
  rotuloHueco: (k) => (k === 0 ? "Piso 1 · el más caro" : k === 4 ? "Piso 5 · el más eficaz" : `Piso ${k + 1}`),
  encimaOrden: (e) => <Cabina {...e} />,
  objeto: { id: ASCENSOR, alto: 72 },
  anim: "abre",
  antes: () => <EstiloLote4 />,
  destinos: { prevencion: { icono: ShieldCheck }, inspeccion: { icono: Search } },
  etapas: [{}, { mesa: "tu" }],
};

export default function C08H03Ascensor({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
