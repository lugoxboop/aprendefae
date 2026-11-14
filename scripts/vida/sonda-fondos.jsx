import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BackgroundVeil from "../../src/components/shared/BackgroundVeil.jsx";
import SupplyDemandBackground from "../../src/components/backgrounds/SupplyDemandBackground.jsx";
import ChessBackground from "../../src/components/backgrounds/ChessBackground.jsx";
import LibroMayorBackground from "../../src/components/backgrounds/LibroMayorBackground.jsx";

const P = new URLSearchParams(location.search);
const cual = P.get("fondo") || "macroeconomia";
const alpha = Number(P.get("alpha") ?? 0.10);
const Fondo = { macroeconomia: SupplyDemandBackground, "pensamiento-estrategico": ChessBackground, contabilidad: LibroMayorBackground }[cual];

createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    <div style={{ position: "relative", minHeight: "100vh", background: "#0E1B2E", overflowX: "clip" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}><Fondo /></div>
      <BackgroundVeil centerAlpha={alpha} />
    </div>
  </StrictMode>
);
