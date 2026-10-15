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
import DescuentoEnFactura from "./mecanicas/libros/t7/DescuentoEnFactura.jsx";
import { H1 } from "../data/contabilidadT7_3_h1.js";
import PantallasT7_3 from "./mecanicas/libros/t7/PantallasT7_3.jsx";
import { PIEZA_EL_DESCUENTO_COMERCIAL } from "../data/contabilidadT7_3.js";
import { PIEZA_DESCUENTOS_EN_CADENA } from "../data/contabilidadT7_3_a2.js";
import { PIEZA_EL_DESCUENTO_CONDICIONADO } from "../data/contabilidadT7_3_a3.js";
import { PIEZA_EL_DESCUENTO_EN_DOS_LIBROS } from "../data/contabilidadT7_3_a4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 DE CONTABILIDAD — «Inventarios III: descuentos, inventario físico y
 * NIC 2» (Célula C).
 *
 * Sus piezas de Aprender y sus actividades de Hacer, con la misma cabecera y
 * el mismo camino que T7-1 y T7-2: el camino sale de `subjects.js` y
 * JUEGOS_T7_3 dice qué componente pinta cada id. Al terminar una partida, la
 * vista registra con el motor compartido (registrarActividadCompletada →
 * otorgarFP), sin tocarlo. El orden de las piezas es el de la sección «Orden
 * final de T7-3» del mapa.
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
].sort((a, b) => a.numero - b.numero);

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_T7_3 = [
  { id: H1.id, Mecanica: DescuentoEnFactura, titulo: H1.nombre },
];

/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 3. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA_T7_3, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadT7_3View({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_T7_3);
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta, usuario } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = esAprender ? null : JUEGOS_T7_3.find((j) => j.id === nodoAbierto);

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA_T7_3, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
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
              {PIEZAS_T7_3.map(({ pieza, Pieza }, k) => (
                <div key={pieza.id}>
                  <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                    PIEZA {k + 1} DE {PIEZAS_T7_3.length}
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
