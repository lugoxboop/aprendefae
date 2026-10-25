import { createRoot } from "react-dom/client";
import SecuenciaAprender from "../../../src/components/secuencia/SecuenciaAprender.jsx";
import { ALTO_FIGURA_T4, CSS_SLIDES } from "../../../src/components/t4/slides/comun.jsx";
import { CSS_SLIDES_A1, piezaSlidesA1 } from "../../../src/components/t4/slides/A1.jsx";

/*
 * Banco del titular de SecuenciaAprender (#564, lo pidió Ukyo): la misma
 * columna que ContabilidadT4View (tope 860, padding clamp(16px, 2vw, 24px))
 * con una pieza real de T4. Lo usa scripts/secuencia/medir-titular.mjs.
 */
const pieza = { ...piezaSlidesA1(1), altoFigura: ALTO_FIGURA_T4 };
createRoot(document.getElementById("raiz")).render(
  <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
    <div className="t4-sec">
      <style>{CSS_SLIDES + CSS_SLIDES_A1}</style>
      <SecuenciaAprender temaId="banco" piezas={[pieza]} final="tema" onFinal={() => {}} />
    </div>
  </div>
);
