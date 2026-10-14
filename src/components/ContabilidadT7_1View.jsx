import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, SUBJECTS } from "../data/subjects.js";
import LaCuentaQueNoSeMueve from "./mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx";
import { PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE } from "../data/contabilidadT7_1.js";
import LaFacturaCompleta from "./mecanicas/libros/t7/LaFacturaCompleta.jsx";
import { PIEZA_LA_FACTURA_COMPLETA } from "../data/contabilidadT7_1_ap2.js";
import TresFormas from "./mecanicas/libros/t7/TresFormas.jsx";
import { PIEZA_TRES_FORMAS } from "../data/contabilidadT7_1_ap3.js";
import DevolucionesEnPeriodico from "./mecanicas/libros/t7/DevolucionesEnPeriodico.jsx";
import { PIEZA_DEVOLUCIONES } from "../data/contabilidadT7_1_a6.js";
import ImportadosYFletes from "./mecanicas/libros/t7/ImportadosYFletes.jsx";
import { PIEZA_IMPORTADOS_Y_FLETES } from "../data/contabilidadT7_1_a5.js";
import ControlInterno from "./mecanicas/libros/t7/ControlInterno.jsx";
import { PIEZA_CONTROL_INTERNO } from "../data/contabilidadT7_1_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 DE CONTABILIDAD — «Inventarios I: el sistema periódico» (Célula C).
 *
 * Por ahora, su pieza 1 de Aprender. La misma cabecera que los Temas 1 a 3.
 * El tema todavía no tiene Hacer: cuando entren sus juegos, el camino se arma
 * igual que en el Tema 3, desde `subjects.js`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_T7_1 = "inventarios-periodico";

/* En el orden del número de pieza. El rótulo «Pieza n de N» cuenta las publicadas. */
export const PIEZAS_T7_1 = [
  { numero: PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE.numero, pieza: PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, Pieza: LaCuentaQueNoSeMueve },
  { numero: PIEZA_LA_FACTURA_COMPLETA.numero, pieza: PIEZA_LA_FACTURA_COMPLETA, Pieza: LaFacturaCompleta },
  { numero: PIEZA_TRES_FORMAS.numero, pieza: PIEZA_TRES_FORMAS, Pieza: TresFormas },
  { numero: PIEZA_IMPORTADOS_Y_FLETES.numero, pieza: PIEZA_IMPORTADOS_Y_FLETES, Pieza: ImportadosYFletes },
  { numero: PIEZA_DEVOLUCIONES.numero, pieza: PIEZA_DEVOLUCIONES, Pieza: DevolucionesEnPeriodico },
  { numero: PIEZA_CONTROL_INTERNO.numero, pieza: PIEZA_CONTROL_INTERNO, Pieza: ControlInterno },
].sort((a, b) => a.numero - b.numero);

export default function ContabilidadT7_1View({ onBack }) {
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_T7_1);
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
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              {tema.title}
            </h1>
          </div>

          <div className="fae-insignia-actividad"><ActivityBadge tipo={APRENDER} size="sm" /></div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {PIEZAS_T7_1.map(({ pieza, Pieza }, k) => (
              <div key={pieza.id}>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                  PIEZA {k + 1} DE {PIEZAS_T7_1.length}
                </p>
                <Pieza pieza={pieza} rotulo={rotulo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </FondoMateria>
  );
}
