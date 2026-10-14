import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, SUBJECTS } from "../data/subjects.js";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
import { PIEZA_LO_QUE_LE_DEBEN } from "../data/contabilidadT6Pieza1.js";
import { PIEZA_NO_VA_A_PAGAR } from "../data/contabilidadT6Pieza2.js";
import { PIEZA_LA_PROVISION } from "../data/contabilidadT6Pieza3.js";
import { PIEZA_SI_PAGA } from "../data/contabilidadT6Pieza4.js";
import { ESCENAS_TEMA6 } from "./mecanicas/libros/tema6/escenasTema6.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 DE CONTABILIDAD (Célula B) — por ahora, sus piezas 1 y 2 de Aprender.
 *
 * La misma cabecera y el mismo marco (CuatroCapas) que el Tema 5. Todavía no
 * hay actividades de Hacer, así que el índice entra directo aquí.
 *
 * Catálogo: decide Erwin. El id del tema y su título viven en subjects.js
 * como propuesta; esta vista los lee de allí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA = "cuentas-por-cobrar";

export const PIEZAS = [{ numero: 1, pieza: PIEZA_LO_QUE_LE_DEBEN }, { numero: 2, pieza: PIEZA_NO_VA_A_PAGAR }, { numero: 3, pieza: PIEZA_LA_PROVISION }, { numero: 4, pieza: PIEZA_SI_PAGA }];
const PUBLICADAS = PIEZAS.length;

export default function ContabilidadTema6View({ onBack }) {
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;

  return (
    <FondoMateria materiaId={MATERIA}>
      <div style={{
        minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif", color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(233,196,106,0.12), transparent 55%)",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
            <span aria-hidden="true" className="fae-cabecera-marca" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a Contabilidad"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
                borderRadius: "999px", background: "rgba(248,249,250,0.06)",
                border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
              {tema.title}
            </h1>
          </div>

          <div className="fae-insignia-actividad"><ActivityBadge tipo={APRENDER} size="sm" /></div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {PIEZAS.map(({ pieza }, k) => {
              const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
              return (
                <div key={pieza.id}>
                  <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                    PIEZA {k + 1} DE {PUBLICADAS}
                  </p>
                  <CuatroCapas pieza={pieza} Capa2={Capa2} Exploracion={Exploracion} Capa4={Capa4} rotulo={rotulo} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FondoMateria>
  );
}
