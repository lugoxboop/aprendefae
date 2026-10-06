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
import IngresoOCobro from "./mecanicas/libros/tema3/IngresoOCobro.jsx";
import { ACT1_T3 } from "../data/contabilidadTema3Act1.js";
import CuandoSeCausa from "./mecanicas/libros/tema3/CuandoSeCausa.jsx";
import { ACT2_T3 } from "../data/contabilidadTema3Act2.js";
import QueLeToca from "./mecanicas/libros/tema3/QueLeToca.jsx";
import { ACT6_T3 } from "../data/contabilidadTema3Act6.js";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
import { PIEZA_VENDER_NO_ES_COBRAR } from "../data/contabilidadTema3.js";
import { PIEZA_LO_QUE_YA_PASO } from "../data/contabilidadTema3Pieza3.js";
import { PIEZA_LO_QUE_YA_SE_PAGO } from "../data/contabilidadTema3Pieza4.js";
import { ESCENAS_TEMA3 } from "./mecanicas/libros/tema3/escenasTema3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 DE CONTABILIDAD — por ahora, su pieza 1 de Aprender.
 *
 * La misma cabecera y el mismo marco (CuatroCapas) que los Temas 1 y 2. El
 * Hacer se arma igual que el del Tema 1: el camino sale de `subjects.js` y
 * JUEGOS dice qué componente pinta cada id.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
const TEMA = "ingresos-gastos-y-caja";
/*
 * En el orden del número de pieza, no de la lista: la pieza 2 todavía no
 * existe y su lugar queda libre (Levi). El rótulo «Pieza n de N» cuenta las
 * piezas publicadas: con 1, 3 y 4, dice «de 3».
 */
export const PIEZAS = [
  { numero: 1, pieza: PIEZA_VENDER_NO_ES_COBRAR },
  { numero: PIEZA_LO_QUE_YA_PASO.numero, pieza: PIEZA_LO_QUE_YA_PASO },
  { numero: PIEZA_LO_QUE_YA_SE_PAGO.numero, pieza: PIEZA_LO_QUE_YA_SE_PAGO },
].sort((a, b) => a.numero - b.numero);
/* El contador dice cuántas piezas hay publicadas, no el número más alto (Levi). */
const PUBLICADAS = PIEZAS.length;

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS = [
  { id: ACT1_T3.id, Mecanica: IngresoOCobro, titulo: ACT1_T3.nombre },
  { id: ACT2_T3.id, Mecanica: CuandoSeCausa, titulo: ACT2_T3.nombre },
  { id: ACT6_T3.id, Mecanica: QueLeToca, titulo: ACT6_T3.nombre },
];

/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 1. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadTema3View({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta, usuario } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = esAprender ? null : JUEGOS.find((j) => j.id === nodoAbierto);

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
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
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS.map(({ pieza }, k) => {
                const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA3[pieza.id];
                return (
                  <div key={pieza.id}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                      PIEZA {k + 1} DE {PUBLICADAS}
                    </p>
                    <CuatroCapas pieza={pieza} Capa2={Capa2} Exploracion={Exploracion} Capa4={Capa4} rotulo="INGRESOS, GASTOS Y AJUSTES · APRENDER" />
                  </div>
                );
              })}
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
