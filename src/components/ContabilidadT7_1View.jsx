import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, HACER, SUBJECTS, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { conIcono } from "../data/contabilidadIconos.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useRecompensa } from "./shared/RecompensaCierre.jsx";
import { ContextoResumen, useResumenDePartida } from "./shared/PantallaResumen.jsx";
import { MarcoLibros } from "./mecanicas/bloques/marcos.jsx";
import { bloqueDeDificultad } from "../hacer/bloques.js";
import JuegoConTutorial from "./mecanicas/libros/JuegoConTutorial.jsx";
import CierraElMes from "./mecanicas/libros/t7/CierraElMes.jsx";
import { H4 } from "../data/contabilidadT7_1_h4.js";
import LaCuentaQueNoSeMueve from "./mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx";
import CuantoValeLoQueSobro from "./mecanicas/libros/t7/CuantoValeLoQueSobro.jsx";
import { H3 } from "../data/contabilidadT7_1_h3.js";
import QueCuentaSeMueve from "./mecanicas/libros/t7/QueCuentaSeMueve.jsx";
import { H1 } from "../data/contabilidadT7_1_h1.js";
import ArmaLaFactura from "./mecanicas/libros/t7/ArmaLaFactura.jsx";
import { H2 } from "../data/contabilidadT7_1_h2.js";import LaCuentaQueNoSeMueve from "./mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx";import { PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE } from "../data/contabilidadT7_1.js";
import LaFacturaCompleta from "./mecanicas/libros/t7/LaFacturaCompleta.jsx";
import { PIEZA_LA_FACTURA_COMPLETA } from "../data/contabilidadT7_1_ap2.js";
import TresFormas from "./mecanicas/libros/t7/TresFormas.jsx";
import { PIEZA_TRES_FORMAS } from "../data/contabilidadT7_1_ap3.js";
import DevolucionesEnPeriodico from "./mecanicas/libros/t7/DevolucionesEnPeriodico.jsx";
import { PIEZA_DEVOLUCIONES } from "../data/contabilidadT7_1_a6.js";
import ElCierreEnPeriodico from "./mecanicas/libros/t7/ElCierreEnPeriodico.jsx";
import { PIEZA_EL_CIERRE } from "../data/contabilidadT7_1_ap4.js";
import ImportadosYFletes from "./mecanicas/libros/t7/ImportadosYFletes.jsx";
import { PIEZA_IMPORTADOS_Y_FLETES } from "../data/contabilidadT7_1_a5.js";
import ControlInterno from "./mecanicas/libros/t7/ControlInterno.jsx";
import { PIEZA_CONTROL_INTERNO } from "../data/contabilidadT7_1_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 DE CONTABILIDAD — «Inventarios I: el sistema periódico» (Célula C).
 *
 * Sus piezas de Aprender y sus actividades de Hacer. La misma cabecera que
 * los Temas 1 a 3, y el mismo camino que el Tema 3 y el Tema 5: el camino sale
 * de `subjects.js` y JUEGOS dice qué componente pinta cada id. Al terminar una
 * partida, la vista registra con el motor compartido
 * (registrarActividadCompletada → otorgarFP), sin tocarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_T7_1 = "inventarios-periodico";

/* En el orden del número de pieza. El rótulo «Pieza n de N» cuenta las publicadas. */
export const PIEZAS_T7_1 = [
  { numero: PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE.numero, pieza: PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, Pieza: LaCuentaQueNoSeMueve },
  { numero: PIEZA_LA_FACTURA_COMPLETA.numero, pieza: PIEZA_LA_FACTURA_COMPLETA, Pieza: LaFacturaCompleta },
  { numero: PIEZA_TRES_FORMAS.numero, pieza: PIEZA_TRES_FORMAS, Pieza: TresFormas },
  { numero: PIEZA_EL_CIERRE.numero, pieza: PIEZA_EL_CIERRE, Pieza: ElCierreEnPeriodico },
  { numero: PIEZA_IMPORTADOS_Y_FLETES.numero, pieza: PIEZA_IMPORTADOS_Y_FLETES, Pieza: ImportadosYFletes },
  { numero: PIEZA_DEVOLUCIONES.numero, pieza: PIEZA_DEVOLUCIONES, Pieza: DevolucionesEnPeriodico },
  { numero: PIEZA_CONTROL_INTERNO.numero, pieza: PIEZA_CONTROL_INTERNO, Pieza: ControlInterno },
].sort((a, b) => a.numero - b.numero);

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_T7_1 = [
  { id: H4.id, Mecanica: CierraElMes, titulo: H4.nombre },
];
  { id: H3.id, Mecanica: CuantoValeLoQueSobro, titulo: H3.nombre },
  { id: H1.id, Mecanica: QueCuentaSeMueve, titulo: H1.nombre },
  { id: H2.id, Mecanica: ArmaLaFactura, titulo: H2.nombre },];
/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 3. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA_T7_1, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadT7_1View({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_T7_1);
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta, usuario } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = esAprender ? null : JUEGOS_T7_1.find((j) => j.id === nodoAbierto);

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA_T7_1, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
      }));
    if (res?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

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

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
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
          ) : juego ? (
            <div>
              <button
                type="button"
                onClick={() => { resumen.limpiar(); setNodoAbierto(null); }}
                style={{
                  marginBottom: "16px", padding: "8px 14px", borderRadius: "999px",
                  background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px",
                }}
              >
                ‹ Volver al camino
              </button>
              <ContextoResumen.Provider value={resumen.contexto(juego.id, () => setNodoAbierto(null))}>
                <JuegoConTutorial
                  key={juego.id}
                  juego={juego}
                  usuarioId={usuario?.id ?? null}
                  Marco={MarcoLibros}
                  acento={FAE.ambar}
                  rotulo={rotuloDeBloque(juego.id)}
                  onCompletar={(pct, ms, detalle) => completar(juego.id, pct, ms, detalle)}
                />
              </ContextoResumen.Provider>
            </div>
          ) : (
            <CaminoHacer nodos={nodos} onAbrir={(id) => setNodoAbierto(id)} vacio="Este tema todavía no tiene juegos." />
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
