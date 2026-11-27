/*
 * C03 · H05 · Las dos caras de la moneda (gp26-fun-c03-h05-moneda, Medio, 25 × 2 FP × %).
 * La moneda de cobre con dos caras, Gestión (engranaje) y Liderazgo (farol).
 * La frase aparece sobre la moneda; al elegir la cara, la moneda gira y la
 * frase queda grabada en esa cara (las dos columnas de abajo se llenan: es
 * una sola moneda). Etapa 2: tres microdesafíos con la moneda en escena.
 */
import { Cog, Lamp } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C3_H05 } from "./textos-c3.js";

export const ID = GP_C3_H05.id;
const MONEDA = primero("moneda-cobre", "moneda-oro");

function Caras(estado) {
  const puestas = colocados(estado).filter((x) => x.texto);
  const cara = (k, n) => (
    <div className="gp2-caja" data-lleno={puestas.some((x) => x.destino === k) ? "1" : undefined} data-cara={k}>
      <b>{n}</b>
      {puestas.filter((x) => x.destino === k).map((x) => <div key={x.id} className="gp2-entra" style={{ fontWeight: 500 }}>{x.texto}</div>)}
    </div>
  );
  return <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>{cara("gestion", "Gestión")}{cara("liderazgo", "Liderazgo")}</div>;
}

export const ESCENA = {
  nombre: "moneda", fondo: ["#3b2416", "#170d07"], acento: "#e08a4f", luz: "rgba(224,138,79,.22)",
  portada: MONEDA,
  objeto: { id: MONEDA, alto: 104 },
  objetoEstilo: ({ ultimo, encaja }) => ({ transform: encaja === "liderazgo" || (!encaja && ultimo === "liderazgo") ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 520ms cubic-bezier(.3,.9,.4,1)" }),
  anim: "sella",
  antes: () => <EstiloLote2 />,
  destinos: { gestion: { icono: Cog }, liderazgo: { icono: Lamp }, dos: { objeto: MONEDA, alto: 30 } },
  etapas: [{ encima: (e) => <Caras {...e} /> }, {}],
};

export default function C03H05Moneda({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
