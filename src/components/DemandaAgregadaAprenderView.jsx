import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import GrifosDA from "./mecanicas/GrifosDA.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import { APRENDER } from "../data/subjects.js";

/*
 * Mitad "Aprender" de Demanda Agregada. La mitad "Hacer" es el simulador
 * DA-Learn, que vive aparte con su propio índice y su propio motor de FP.
 *
 * Esta pieza no otorga FP a propósito: no hay preguntas ni condición de
 * término, así que no habría nada que puntuar. Es exploración libre.
 */

export default function DemandaAgregadaAprenderView({ onBack }) {
  return (
    <FondoMateria materiaId="macroeconomia">
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
          color: FAE.text,
          backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.14), transparent 55%)",
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
            <ActivityBadge tipo={APRENDER} size="sm" />
          </div>

          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
            MECÁNICA 1
          </p>
          <h2
            style={{
              fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(21px, 3.2vw, 27px)",
              letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 10px",
            }}
          >
            Los grifos de la Demanda Agregada
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 8px" }}>
            Cada componente grande no aparece de la nada — se arma con piezas más chicas, y algunas de esas
            piezas no suman: reparten o desvían. Mueve las piezas de abajo y mira cómo cambia todo lo de arriba.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 18px" }}>
            Los <strong style={{ color: FAE.teal, fontWeight: 600 }}>círculos verdes</strong> son grifos: entran y
            suman. Los <strong style={{ color: FAE.coral, fontWeight: 600 }}>rombos coral</strong> son válvulas:
            se paran encima de la tubería y multiplican o desvían lo que ya venía pasando. Nunca suman, y por eso
            no se dibujan igual.
          </p>

          <GrifosDA />

          <VideoYouTube
            videoId="bYH1klgRk2E"
            titulo="¿Qué es la demanda agregada? Descúbrelo fácil y rápido | Concepto, Componentes"
            canal="En Minutos • Educación"
          />

          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.45)", margin: "18px 0 0" }}>
            Aquí no hay preguntas ni puntaje: es para trastear. Los FP de este tema se ganan en el simulador,
            que es la otra mitad.
          </p>
        </div>
      </div>
    </FondoMateria>
  );
}
