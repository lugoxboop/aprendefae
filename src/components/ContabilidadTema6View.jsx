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
import { PIEZA_LO_QUE_LE_DEBEN } from "../data/contabilidadT6Pieza1.js";
import { PIEZA_NO_VA_A_PAGAR } from "../data/contabilidadT6Pieza2.js";
import { PIEZA_LA_PROVISION } from "../data/contabilidadT6Pieza3.js";
import { PIEZA_SI_PAGA } from "../data/contabilidadT6Pieza4.js";
import { PIEZA_COMO_SE_CALCULA } from "../data/contabilidadT6Pieza5.js";
import { conPorcentajePegado } from "../contabilidad/t6Pieza5.js";
import { ESCENAS_TEMA6 } from "./mecanicas/libros/tema6/escenasTema6.jsx";
import { conNotasDebajo } from "./mecanicas/libros/b5/NotaDebajo.jsx";
import { conPiesDeTermino } from "./mecanicas/libros/tema6/PiesDeTermino.jsx";
import ClientesOOtra from "./mecanicas/libros/tema6/ClientesOOtra.jsx";
import { T6_ACT1 } from "../data/contabilidadT6Act1.js";
import ProvisionDeElTorito from "./mecanicas/libros/tema6/ProvisionDeElTorito.jsx";
import { T6_ACT2 } from "../data/contabilidadT6Act2.js";
import DeudaQueVuelve from "./mecanicas/libros/tema6/DeudaQueVuelve.jsx";
import { T6_ACT3 } from "../data/contabilidadT6Act3.js";
import QueSeDebita from "./mecanicas/libros/tema6/QueSeDebita.jsx";
import { T6_ACT4 } from "../data/contabilidadT6Act4.js";
import ProvisionPorEdades from "./mecanicas/libros/tema6/ProvisionPorEdades.jsx";
import { T6_ACT6 } from "../data/contabilidadT6Act6.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 DE CONTABILIDAD (Célula B) — sus piezas 1 y 2 de Aprender y su
 * primera actividad de Hacer.
 *
 * La misma cabecera, el mismo marco (CuatroCapas) y el mismo camino que el
 * Tema 5: el camino sale de `subjects.js` y JUEGOS dice qué componente pinta
 * cada id. Al terminar una partida, la vista registra con el motor compartido
 * (registrarActividadCompletada → otorgarFP), sin tocarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA = "cuentas-por-cobrar";

/*
 * La pieza 1 lleva la nota de «cartera» bajo la cita del término 2 (b5/NotaDebajo.jsx).
 * La pieza 5, el «%» pegado a su número y el pie de cada término (tema6/PiesDeTermino.jsx).
 */
export const PIEZAS = [{ numero: 1, pieza: conNotasDebajo(PIEZA_LO_QUE_LE_DEBEN) }, { numero: 2, pieza: PIEZA_NO_VA_A_PAGAR }, { numero: 3, pieza: PIEZA_LA_PROVISION }, { numero: 4, pieza: PIEZA_SI_PAGA }, { numero: 5, pieza: conPiesDeTermino(conPorcentajePegado(PIEZA_COMO_SE_CALCULA)) }];
const PUBLICADAS = PIEZAS.length;

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS = [
  { id: T6_ACT1.id, Mecanica: ClientesOOtra, titulo: T6_ACT1.nombre },
  /* La mesa de asientos con el diario encima y, desde el lote 6b, las tres preguntas de a5 (que se fundió aquí); en «Así se juega», la mesa sola. */
  { id: T6_ACT2.id, Mecanica: ProvisionDeElTorito, titulo: T6_ACT2.nombre },
  { id: T6_ACT3.id, Mecanica: DeudaQueVuelve, titulo: T6_ACT3.nombre },
  /* Los Hacer nuevos: la elección de «¿Por Cuál Arteria Entra?» y las casillas en orden, en su copia de la célula (b5-t6-a7 se retiró en el lote 4; b5-t6-a5 se fundió en a2 en el 6b). */
  { id: T6_ACT4.id, Mecanica: QueSeDebita, titulo: T6_ACT4.nombre },
  { id: T6_ACT6.id, Mecanica: ProvisionPorEdades, titulo: T6_ACT6.nombre },
];

/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 3. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadTema6View({ modo = null, nodoInicial = null, onBack }) {
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
                /* 44 × 44: el mínimo del pulgar (calidad, 15-oct). Con 8 px de relleno medía 38. */
                display: "flex", alignItems: "center", justifyContent: "center", padding: "11px",
                borderRadius: "999px", background: "rgba(248,249,250,0.06)",
                border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            {/*
              * El título puede encogerse o romper en dos líneas, pero no desaparecer
              * (regla de Erwin, herramientas.md). La regla compartida del header
              * compacto lo trunca con «…»; aquí se le deja romper: a 320 se leía
              * «Cuentas por co…». El estilo en línea gana a la clase.
              */}
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
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
          ) : juego ? (
            <div>
              <button
                type="button"
                onClick={() => { resumen.limpiar(); setNodoAbierto(null); }}
                style={{
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
