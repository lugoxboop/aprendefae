import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, HACER, SUBJECTS, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
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
import { PIEZA_DEL_EFECTIVO } from "../data/contabilidadT5Pieza1.js";
import { PIEZA_TRES_MOMENTOS } from "../data/contabilidadT5Pieza2.js";
import { conFigurasCapa1 } from "./mecanicas/libros/tema6/FigurasCapa1.jsx";
import { ESCENAS_TEMA5 } from "./mecanicas/libros/tema5/escenasTema5.jsx";
import QueRentaDa from "./mecanicas/libros/tema5/QueRentaDa.jsx";
import { T5_ACT1 } from "../data/contabilidadT5Act1.js";
import CierreConDiario from "./mecanicas/libros/tema5/LibroDiario.jsx";
import { T5_ACT2 } from "../data/contabilidadT5Act2.js";
import TemporalOLargoPlazo from "./mecanicas/libros/t5/TemporalOLargoPlazo.jsx";
import { N1 } from "../data/contabilidadT5_n1.js";
import RevisionQueFalta from "./mecanicas/libros/t5/RevisionQueFalta.jsx";
import { N3 } from "../data/contabilidadT5_n3.js";
import ElInteresDelPeriodo from "./mecanicas/libros/t5/ElInteresDelPeriodo.jsx";
import { N4 } from "../data/contabilidadT5_n4.js";
import GanoOPerdio from "./mecanicas/libros/t5/GanoOPerdio.jsx";
import { N5 } from "../data/contabilidadT5_n5.js";
import LoQueElEjemploNoTrae from "./mecanicas/libros/t5/LoQueElEjemploNoTrae.jsx";
import { PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE } from "../data/contabilidadT5_n6.js";
import AQueCuentaVa from "./mecanicas/libros/t5/AQueCuentaVa.jsx";
import { N7 } from "../data/contabilidadT5_n7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 DE CONTABILIDAD (Célula B) — su pieza 1 de Aprender y su primera
 * actividad de Hacer.
 *
 * La misma cabecera, el mismo marco (CuatroCapas) y el mismo camino que el
 * Tema 3: el camino sale de `subjects.js` y JUEGOS dice qué componente pinta
 * cada id. Al terminar una partida, la vista registra con el motor compartido
 * (registrarActividadCompletada → otorgarFP), igual que el Tema 3, sin
 * tocarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA = "activos-financieros";

/*
 * En el orden del tema (decisión de corte de T5, punto 6). Una pieza que
 * traiga `Pieza`, su propio componente, se pinta con él; las de B se pintan
 * con CuatroCapas y sus escenas, como siempre. N2 de la Célula C («Cómo se
 * cuidan las inversiones») salió con la fusión de la entrega 5: lo suyo va
 * dentro de N3. Sus archivos se quedan.
 */
export const PIEZAS = [
  /* Lote 10: cada término de la capa 1 con su figura, antes del nombre (FigurasCapa1.jsx). */
  { numero: 1, pieza: conFigurasCapa1(PIEZA_DEL_EFECTIVO) },
  { numero: 2, pieza: conFigurasCapa1(PIEZA_TRES_MOMENTOS) },
  { numero: 3, pieza: PIEZA_LO_QUE_EL_EJEMPLO_NO_TRAE, Pieza: LoQueElEjemploNoTrae },
];
const PUBLICADAS = PIEZAS.length;

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS = [
  { id: T5_ACT1.id, Mecanica: QueRentaDa, titulo: T5_ACT1.nombre },
  { id: T5_ACT2.id, Mecanica: CierreConDiario, titulo: T5_ACT2.nombre },
  { id: N1.id, Mecanica: TemporalOLargoPlazo, titulo: N1.nombre },
  { id: N3.id, Mecanica: RevisionQueFalta, titulo: N3.nombre },
  { id: N4.id, Mecanica: ElInteresDelPeriodo, titulo: N4.nombre },
  { id: N5.id, Mecanica: GanoOPerdio, titulo: N5.nombre },
  { id: N7.id, Mecanica: AQueCuentaVa, titulo: N7.nombre },
];

/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 3. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadTema5View({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;
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
                /* Lote 6d: 44 de blanco táctil (medía 36: 20 del chevrón y 8 de relleno por lado). */
                display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", minWidth: "44px", minHeight: "44px", boxSizing: "border-box",
                borderRadius: "999px", background: "rgba(248,249,250,0.06)",
                border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            {/*
             * El nombre del tema rompe en dos líneas en vez de cortarse: a 320 px la
             * regla compartida de la cabecera compacta (AccountControl) lo truncaba
             * con «…». Encoge (minWidth: 0), pero no desaparece (herramientas.md,
             * «La regla que salió de la primera pasada»).
             */}
            <h1 data-titulo-tema style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS.map(({ pieza, Pieza }, k) => {
                if (Pieza) {
                  return (
                    <div key={pieza.id}>
                      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                        PIEZA {k + 1} DE {PUBLICADAS}
                      </p>
                      <Pieza pieza={pieza} rotulo={rotulo} />
                    </div>
                  );
                }
                const { Capa2, Exploracion, Capa4, FiguraFinal } = ESCENAS_TEMA5[pieza.id];
                return (
                  <div key={pieza.id}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                      PIEZA {k + 1} DE {PUBLICADAS}
                    </p>
                    <CuatroCapas pieza={pieza} Capa2={Capa2} Exploracion={Exploracion} Capa4={Capa4} FiguraFinal={FiguraFinal} rotulo={rotulo} />
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
                  /* Lote 6d: 44 de alto como mínimo (blanco táctil). */
                  marginBottom: "16px", padding: "8px 14px", minHeight: "44px", borderRadius: "999px",
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
