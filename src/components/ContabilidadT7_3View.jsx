import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, SUBJECTS } from "../data/subjects.js";
import PantallasT7_3 from "./mecanicas/libros/t7/PantallasT7_3.jsx";
import { PIEZA_EL_DESCUENTO_COMERCIAL } from "../data/contabilidadT7_3.js";
import { PIEZA_DESCUENTOS_EN_CADENA } from "../data/contabilidadT7_3_a2.js";
import { PIEZA_EL_DESCUENTO_CONDICIONADO } from "../data/contabilidadT7_3_a3.js";
import { PIEZA_EL_DESCUENTO_EN_DOS_LIBROS } from "../data/contabilidadT7_3_a4.js";
import { PIEZA_SOBRANTES_Y_FALTANTES } from "../data/contabilidadT7_3_a5.js";
import { PIEZA_LA_PROVISION } from "../data/contabilidadT7_3_a6.js";
import { PIEZA_NIC2_COSTO } from "../data/contabilidadT7_3_a7.js";
import { PIEZA_NIC2_FORMULAS } from "../data/contabilidadT7_3_a8.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 DE CONTABILIDAD — «Inventarios III: descuentos, inventario físico y
 * NIC 2» (Célula C).
 *
 * Por ahora, su pieza 1 de Aprender. La misma cabecera que T7-1 y T7-2. El
 * orden de las piezas es el de la sección «Orden final de T7-3» del mapa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_T7_3 = "inventarios-descuentos-nic2";

/* En el orden del número de pieza. El rótulo «Pieza n de N» cuenta las publicadas. */
export const PIEZAS_T7_3 = [
  { numero: PIEZA_EL_DESCUENTO_COMERCIAL.numero, pieza: PIEZA_EL_DESCUENTO_COMERCIAL, Pieza: PantallasT7_3 },
  { numero: PIEZA_DESCUENTOS_EN_CADENA.numero, pieza: PIEZA_DESCUENTOS_EN_CADENA, Pieza: PantallasT7_3 },
  { numero: PIEZA_EL_DESCUENTO_CONDICIONADO.numero, pieza: PIEZA_EL_DESCUENTO_CONDICIONADO, Pieza: PantallasT7_3 },
  { numero: PIEZA_EL_DESCUENTO_EN_DOS_LIBROS.numero, pieza: PIEZA_EL_DESCUENTO_EN_DOS_LIBROS, Pieza: PantallasT7_3 },
  { numero: PIEZA_SOBRANTES_Y_FALTANTES.numero, pieza: PIEZA_SOBRANTES_Y_FALTANTES, Pieza: PantallasT7_3 },
  { numero: PIEZA_LA_PROVISION.numero, pieza: PIEZA_LA_PROVISION, Pieza: PantallasT7_3 },
  { numero: PIEZA_NIC2_COSTO.numero, pieza: PIEZA_NIC2_COSTO, Pieza: PantallasT7_3 },
  { numero: PIEZA_NIC2_FORMULAS.numero, pieza: PIEZA_NIC2_FORMULAS, Pieza: PantallasT7_3 },
].sort((a, b) => a.numero - b.numero);

export default function ContabilidadT7_3View({ onBack }) {
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_T7_3);
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
            {PIEZAS_T7_3.map(({ pieza, Pieza }, k) => (
              <div key={pieza.id}>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                  PIEZA {k + 1} DE {PIEZAS_T7_3.length}
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
