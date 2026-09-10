import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CorazonEconomia from "./mecanicas/corazon/CorazonEconomia.jsx";
import PulsoMemoria from "./mecanicas/corazon/PulsoMemoria.jsx";
import DiagnosticoEstetoscopio from "./mecanicas/corazon/Estetoscopio.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import { clasificacionDe } from "../data/subjects.js";

/*
 * Mitad "Aprender" de Demanda Agregada: EL CORAZÓN DE LA ECONOMÍA.
 *
 * Tres piezas del mismo sistema, vistas de tres maneras:
 *
 *   1. La cámara y sus cuatro arterias, con los mandos de dentro de cada
 *      componente. Es la que sustituye a «Los grifos».
 *   2. El compás: DA = C + I + G + XN memorizado por ritmo, sin sonido.
 *   3. El estetoscopio: cuatro casos reales de la economía colombiana.
 *
 * Ninguna otorga FP a propósito: no hay preguntas ni condición de término, así
 * que no habría nada que puntuar. Los FP del tema se ganan en el simulador.
 *
 * LOS TÍTULOS VIVEN AQUÍ, NO DENTRO DE LAS PIEZAS. Cada pieza pone sus propios
 * rótulos internos —"LA CÁMARA CENTRAL", "EL COMPÁS"—, pero el "MECÁNICA N" y
 * el h2 los pone la vista, igual que en Política Económica. Así el orden y la
 * numeración se cambian en un solo sitio.
 */

const MATERIA = "macroeconomia";
const TEMA = "demanda-agregada";
const CLAS_CORAZON = clasificacionDe(MATERIA, TEMA, "grifos-da");
const CLAS_PULSO = clasificacionDe(MATERIA, TEMA, "pulso-memoria");
const CLAS_ESTETOSCOPIO = clasificacionDe(MATERIA, TEMA, "estetoscopio-casos");

const sectionLabel = {
  fontFamily: "Sora, sans-serif",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: FAE.teal,
  margin: 0,
};

const h2 = {
  fontFamily: "Sora, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(21px, 3.2vw, 27px)",
  letterSpacing: "-0.025em",
  lineHeight: 1.15,
  margin: "0 0 10px",
};

const lead = { fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 18px" };

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
          <div className="fae-reserva-cuenta" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
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
            <ActivityBadge tipo={CLAS_CORAZON?.tipo} size="sm" />
          </div>

          {/* La idea que une las tres piezas, dicha una sola vez y arriba. */}
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 30px" }}>
            La Demanda Agregada funciona como un sistema circulatorio: cuatro arterias que traen caudal
            —<strong style={{ color: FAE.text, fontWeight: 600 }}>C</strong>,{" "}
            <strong style={{ color: FAE.text, fontWeight: 600 }}>I</strong>,{" "}
            <strong style={{ color: FAE.text, fontWeight: 600 }}>G</strong> y{" "}
            <strong style={{ color: FAE.text, fontWeight: 600 }}>XN</strong>— y una cámara donde se juntan.
            Lo que la cámara mide es una <strong style={{ color: FAE.text, fontWeight: 600 }}>suma</strong>:
            las tres piezas de abajo son ese mismo sistema mirado de tres maneras.
          </p>

          {/* ─────────────── Mecánica 1: la cámara y sus arterias ─────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
            <p style={sectionLabel}>MECÁNICA 1</p>
            <ActivityBadge tipo={CLAS_CORAZON?.tipo} size="sm" />
          </div>
          <h2 style={h2}>El corazón de la economía</h2>
          <p style={lead}>
            Cada arteria se arma con piezas más chicas, y algunas de esas piezas no suman: reparten o
            desvían. Mueve los mandos de abajo y mira cómo cambia el caudal de arriba. Los{" "}
            <strong style={{ color: FAE.teal, fontWeight: 600 }}>círculos llenos</strong> son vasos: entran y
            suman. Los <strong style={{ color: FAE.coral, fontWeight: 600 }}>rombos huecos</strong> son
            válvulas: se paran encima del conducto y reparten o desvían lo que ya venía pasando. Nunca
            suman, y por eso no se dibujan igual.
          </p>
          <CorazonEconomia />

          {/* ─────────────── Mecánica 2: el compás ─────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
            <p style={sectionLabel}>MECÁNICA 2</p>
            <ActivityBadge tipo={CLAS_PULSO?.tipo} size="sm" />
          </div>
          <h2 style={h2}>Pulso de memoria</h2>
          <p style={lead}>
            La fórmula se aprende con el cuerpo, no leyéndola. Aquí no hay puntaje ni fallo: solo
            repetición, hasta que las cuatro letras salgan solas.
          </p>
          <PulsoMemoria />

          {/* ─────────────── Mecánica 3: los casos ─────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
            <p style={sectionLabel}>MECÁNICA 3</p>
            <ActivityBadge tipo={CLAS_ESTETOSCOPIO?.tipo} size="sm" />
          </div>
          <h2 style={h2}>Diagnóstico con estetoscopio</h2>
          <p style={lead}>
            Cuatro noticias reales de Colombia, cada una con su cifra y su fuente. Lo que hay que ver es
            por qué arteria entra cada una: el mismo peso puede llegar por Transferencias o por Gasto
            público, y no es lo mismo.
          </p>
          <DiagnosticoEstetoscopio />

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
