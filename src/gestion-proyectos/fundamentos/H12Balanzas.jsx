/*
 * H12 · ¿Éxito o fracaso? (gp26-fun-h12-balanzas, Medio, 25 × 2 FP × %).
 * Etapa 1: dos balanzas de platos (Éxito del proyecto · Éxito del negocio);
 * las pesas son tarjetas. La izquierda queda arriba (✓ cumplió) y la derecha
 * abajo (✗ no cumplió), con texto. Predecir y revelar: la balanza derecha
 * baja mientras llegan los mensajes de WhatsApp.
 * Etapa 2: financieras / no financieras, y ordenar las tres preguntas.
 */
import { Coins, Users } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { GP_H12 } from "./textos-c1.js";

export const ID = GP_H12.id;

function Balanzas({ etapa, paso, encaja }) {
  const hechos = [...(etapa?.hechos ?? []).map((h) => h.destino), ...(encaja && paso.id !== "h12-07" ? [encaja] : [])];
  const n = (k) => hechos.filter((d) => d === k).length;
  const proyecto = n("proyecto"), negocio = n("negocio");
  const lleno = proyecto + negocio >= 6;
  const plato = (nombre, cuenta, arriba, marca) => (
    <div style={{ display: "grid", justifyItems: "center", gap: 2, minWidth: 0 }} data-balanza={nombre}>
      <span style={{ transform: `rotate(${lleno ? (arriba ? -8 : 8) : 0}deg)`, transition: "transform 420ms cubic-bezier(.3,.9,.4,1)" }}>
        <Objeto id="balanza-brazo" alto={44} />
      </span>
      <small>{nombre} · {cuenta}</small>
      {lleno && <span className="gp-chip-c da26-entra">{marca}</span>}
    </div>
  );
  return (
    <div className="gp-escenita" style={{ alignItems: "flex-start" }}>
      {plato("Proyecto", proyecto, true, "✓ arriba: cumplió")}
      {plato("Negocio", negocio, false, "✗ abajo: no cumplió")}
    </div>
  );
}

function Whatsapp({ paso, encaja }) {
  if (paso.id !== "h12-07" || !encaja) return null;
  return (
    <div className="gp-escenita da26-entra" data-revela="whatsapp">
      <Objeto id="celular" alto={70} />
      <span style={{ display: "grid", gap: 4 }}>
        {[0, 1, 2].map((k) => <span key={k} className="gp-chip-c" style={{ animationDelay: `${k * 160}ms` }}>Pedido por WhatsApp</span>)}
      </span>
    </div>
  );
}

export const ESCENA = {
  nombre: "balanzas", fondo: ["#22314a", "#0e1726"], acento: "#a7bbff", luz: "rgba(167,187,255,.2)",
  portada: "balanza-brazo",
  etapas: [
    {
      objeto: null, anim: "pesa",
      destinos: { proyecto: { objeto: "balanza-brazo", alto: 34 }, negocio: { objeto: "balanza-brazo", alto: 34 } },
      encima: (e) => <Balanzas {...e} />,
      despues: (e) => <Whatsapp {...e} />,
    },
    { objeto: null, anim: "pesa", destinos: { financieras: { icono: Coins }, "no-financieras": { icono: Users } }, objetos: ["portapapeles"] },
  ],
};

export default function H12Balanzas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
