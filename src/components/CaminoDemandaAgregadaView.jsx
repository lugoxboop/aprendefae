import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { SUBJECTS, HACER, APRENDER, actividadesDeTipo } from "../data/subjects.js";

/*
 * Camino de la mitad "Hacer" de Demanda Agregada.
 *
 * Este tema es el raro: su juego es DA-Learn, un simulador con su propio índice
 * interno y su propia navegación. Antes se entraba directo a él desde la
 * tarjeta del tema. Ahora pasa por el camino, como todos los demás, para que la
 * navegación sea la misma en todo el sitio aunque por dentro el destino sea
 * otra cosa.
 */

export default function CaminoDemandaAgregadaView({ onAbrir, onBack }) {
  const hechas = useCompletadas();
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "demanda-agregada");
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);

  return (
    <FondoMateria materiaId="macroeconomia">
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
          color: FAE.text,
          backgroundImage: "radial-gradient(circle at 50% -10%, rgba(231,111,81,0.14), transparent 55%)",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <Logo variant="symbol" size={26} theme="dark" />
            <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a Macroeconomía"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
                borderRadius: "999px", background: "rgba(248,249,250,0.06)",
                border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
              Demanda Agregada
            </h1>
            <ActivityBadge tipo={HACER} size="sm" />
          </div>

          <h2
            style={{
              fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(21px, 3.2vw, 27px)",
              letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 10px",
            }}
          >
            El camino de este tema
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 24px" }}>
            Toca el juego que quieras. No hay orden obligatorio: el camino sugiere uno, no lo impone.
          </p>

          <CaminoHacer nodos={nodos} onAbrir={onAbrir} />
        </div>
      </div>
    </FondoMateria>
  );
}

/* Se exporta el tipo para que App no tenga que importar APRENDER solo por esto. */
export { APRENDER };
