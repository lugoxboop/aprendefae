/*
 * H04 · El puente al estado futuro (gp26-fun-h04-puente, Fácil, 10 × 2 FP × %).
 * Etapa 1: el río con dos orillas (Estado actual: Manizales · Estado futuro:
 * Medellín). Cada tablón del proyecto bien puesto hace avanzar al zorro un
 * tramo y sube el medidor «Valor del negocio» (gráfico 1-1); los de
 * operación no encajan. El orden no se califica.
 * Etapa 2: en la orilla futura, la caja registradora (Tangible) y el letrero
 * luminoso (Intangible).
 */
import { Ban, Hammer } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { GP_H04 } from "./textos-c1.js";

export const ID = GP_H04.id;
const TABLONES = 4;

function Rio({ etapa, encaja }) {
  const hechos = (etapa?.hechos ?? []).filter((h) => h.destino === "puente").length + (encaja === "puente" ? 1 : 0);
  const avance = Math.min(1, hechos / TABLONES);
  return (
    <div data-rio data-tramos={hechos} style={{ marginTop: 10 }}>
      <div className="gp-escenita" style={{ marginTop: 0 }}>
        <small>Estado actual<br /><strong style={{ color: "#f4f5f7" }}>Manizales</strong></small>
        <span style={{ display: "flex", gap: 3 }} aria-label={`${hechos} de ${TABLONES} tablones`}>
          {Array.from({ length: TABLONES }, (_, k) => (
            <span key={k} style={{ width: 22, height: 10, borderRadius: 3, background: k < hechos ? "#c99a5b" : "rgba(108,195,213,.35)", border: "1px solid rgba(244,245,247,.4)" }} />
          ))}
        </span>
        <small style={{ textAlign: "right" }}>Estado futuro<br /><strong style={{ color: "#f4f5f7" }}>Medellín</strong></small>
      </div>
      <div style={{ position: "relative", height: 8, margin: "8px 4px 0" }} aria-hidden="true">
        <span style={{ position: "absolute", left: `${avance * 100}%`, top: -4, transform: "translateX(-50%)", transition: "left 420ms cubic-bezier(.3,.9,.4,1)", fontSize: 14 }}>▲</span>
      </div>
      <div className="gp-escenita" style={{ marginTop: 6 }}>
        <small>Valor del negocio</small>
        <span className="gp-medidor" style={{ flex: 1, maxWidth: 180 }} data-valor-negocio={avance}><span style={{ transform: `scaleX(${0.15 + avance * 0.85})` }} /></span>
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "puente", fondo: ["#173a4a", "#0b1d28"], acento: "#6cc3d5", luz: "rgba(108,195,213,.22)",
  portada: "puente-tablones",
  etapas: [
    {
      objeto: { id: "puente-tablones", alto: 76 },
      anim: "cae",
      destinos: { puente: { icono: Hammer }, fuera: { icono: Ban } },
      encima: (e) => <Rio {...e} />,
    },
    {
      objeto: null,
      anim: "pesa",
      destinos: { tangible: { objeto: "caja-registradora", alto: 52 }, intangible: { objeto: "letrero-luminoso", alto: 46 } },
      antes: () => (
        <div className="gp-escenita" style={{ marginTop: 0, marginBottom: 8 }}>
          <small>Orilla futura</small><strong>Medellín</strong>
        </div>
      ),
    },
  ],
};

export default function H04Puente({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
