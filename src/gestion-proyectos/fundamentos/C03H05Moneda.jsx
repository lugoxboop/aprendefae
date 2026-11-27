/*
 * C03 · H05 · Las dos caras de la moneda (gp26-fun-c03-h05-moneda, Medio, 25 × 2 FP × %).
 * La moneda de cobre con dos caras, Gestión (engranaje) y Liderazgo (farol).
 * La frase aparece sobre la moneda; al elegir la cara, la moneda gira y la
 * frase queda grabada en esa cara (las dos columnas de abajo se llenan: es
 * una sola moneda). Etapa 2: tres microdesafíos con la moneda en escena.
 */
import { Cog, Lamp } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2, colocados } from "../comun/lote2.jsx";
import { GP_C3_H05 } from "./textos-c3.js";

export const ID = GP_C3_H05.id;
const ENGRANAJE = primero("moneda-engranaje", "moneda-oro");
const FAROL = primero("moneda-farol", "moneda-oro");
const MONEDA = ENGRANAJE;

/* La moneda gira: muestra la cara elegida (o la del último intento). */
function Moneda({ encaja, ultimo, paso }) {
  const cara = encaja ?? ultimo;
  const farol = cara === "liderazgo";
  return (
    <div style={{ display: "grid", justifyItems: "center", marginTop: 6 }} data-moneda={farol ? "liderazgo" : "gestion"}>
      <span key={`${paso.id}-${cara}`} className="gp2-entra" style={{ display: "block" }}><Objeto id={farol ? FAROL : ENGRANAJE} alto={100} /></span>
    </div>
  );
}

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
  objeto: null,
  anim: "sella",
  antes: () => <EstiloLote2 />,
  destinos: { gestion: { icono: Cog, objeto: ENGRANAJE, alto: 30 }, liderazgo: { icono: Lamp, objeto: FAROL, alto: 30 }, dos: { objeto: MONEDA, alto: 30 } },
  etapas: [{ encima: (e) => <><Moneda {...e} /><Caras {...e} /></> }, { encima: (e) => <Moneda {...e} /> }],
};

export default function C03H05Moneda({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H05} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
