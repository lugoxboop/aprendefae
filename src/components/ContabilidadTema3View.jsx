import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, HACER, SUBJECTS } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
import { PIEZA_VENDER_NO_ES_COBRAR } from "../data/contabilidadTema3.js";
import { PIEZA_LO_QUE_YA_PASO } from "../data/contabilidadTema3Pieza3.js";
import { ESCENAS_TEMA3 } from "./mecanicas/libros/tema3/escenasTema3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 DE CONTABILIDAD — por ahora, su pieza 1 de Aprender.
 *
 * La misma cabecera y el mismo marco (CuatroCapas) que los Temas 1 y 2. El
 * Hacer todavía no tiene juegos: el camino lo dice en lugar de quedar vacío.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
const TEMA = "ingresos-gastos-y-caja";
/*
 * En el orden del número de pieza, no de la lista: la pieza 2 todavía no
 * existe y la 3 deja su lugar (Levi). El rótulo dice el número de verdad.
 */
export const PIEZAS = [
  { numero: 1, pieza: PIEZA_VENDER_NO_ES_COBRAR },
  { numero: PIEZA_LO_QUE_YA_PASO.numero, pieza: PIEZA_LO_QUE_YA_PASO },
].sort((a, b) => a.numero - b.numero);
const ULTIMA = Math.max(...PIEZAS.map((x) => x.numero));

export default function ContabilidadTema3View({ modo = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);

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

          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS.map(({ numero, pieza }) => {
                const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA3[pieza.id];
                return (
                  <div key={pieza.id}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                      PIEZA {numero} DE {ULTIMA}
                    </p>
                    <CuatroCapas pieza={pieza} Capa2={Capa2} Exploracion={Exploracion} Capa4={Capa4} rotulo="INGRESOS, GASTOS Y AJUSTES · APRENDER" />
                  </div>
                );
              })}
            </div>
          ) : (
            <CaminoHacer nodos={[]} onAbrir={() => {}} vacio="Este tema todavía no tiene juegos." />
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
