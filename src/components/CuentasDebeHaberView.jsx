import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import EnlaceRendimiento from "./shared/EnlaceRendimiento.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useRecompensa } from "./shared/RecompensaCierre.jsx";
import { useNodoEnRuta } from "./shared/useNodoEnRuta.js";
import {
  IzquierdaODerecha, DeQueFamilia, CuadroDinamicas, DebitaOAcredita, CorrienteDeCuentas,
  ElSaldoDeLaCuenta, SimpleOCompuesto, ArmaElAsiento, ElAsientoCompuesto, CuadraONoCuadra,
} from "./mecanicas/libros/actividades.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { SUBJECTS, HACER, clasificacionDe, actividadesDeTipo, nombreDeActividad } from "../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «LAS CUENTAS, EL DEBE Y EL HABER» — el primer tema de Contabilidad.
 *
 * Mismo esqueleto que Política Monetaria, porque es el mismo tipo de página:
 * camino por bloques, un juego abierto a la vez, y el cierre de cada juego
 * llamando al motor de FP.
 *
 * ═══════════ POR QUÉ EL CAMINO ENSEÑA CINCO Y NO DOCE ═══════════
 *
 * El tema declara sus doce actividades en subjects.js y las doce están en el
 * catálogo del servidor: esa es la ficha del tema y no cambia según lo que
 * esté construido. Lo que sí cambia es cuántas se pueden jugar hoy.
 *
 * Cuáles son esas NO SE DECIDE AQUÍ: se lee de la marca `pendiente` del
 * registro. Una lista en este archivo sería una segunda verdad, y el día que
 * alguien quitara la marca sin tocar la lista —o al revés— el camino y el
 * panel docente dirían cosas distintas sobre la misma actividad.
 *
 * Dibujar las doce pondría siete nodos que al tocarlos se abren en blanco. Y
 * declarar solo cinco en subjects.js sería peor: «tema completo» pasaría a
 * pedir cinco juegos, alguien se ganaría la medalla, y al entrar las otras
 * siete se la quitaríamos.
 *
 * La mitad Aprender no existe todavía: sus cuatro piezas tienen el texto
 * escrito pero no las escenas que lo animan, así que el tema no declara
 * actividades de Aprender y el índice lo abre directo, sin tarjeta partida.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
const TEMA = "cuentas-debe-haber";

/* Las que ya se pueden jugar, en el orden del camino. */
const JUEGOS = [
  { id: "cu-izquierda-o-derecha", Mecanica: IzquierdaODerecha },
  { id: "cu-de-que-familia", Mecanica: DeQueFamilia },
  { id: "cu-cuadro-dinamicas", Mecanica: CuadroDinamicas },
  { id: "cu-debita-o-acredita", Mecanica: DebitaOAcredita },
  { id: "cu-saldo-de-la-cuenta", Mecanica: ElSaldoDeLaCuenta },
  { id: "cu-arma-el-asiento", Mecanica: ArmaElAsiento },
  { id: "cu-simple-o-compuesto", Mecanica: SimpleOCompuesto },
  { id: "cu-cuadra-o-no", Mecanica: CuadraONoCuadra },
  { id: "cu-corriente-de-cuentas", Mecanica: CorrienteDeCuentas },
  { id: "cu-asiento-compuesto", Mecanica: ElAsientoCompuesto },
];

const CLAS = Object.fromEntries(JUEGOS.map((j) => [j.id, clasificacionDe(MATERIA, TEMA, j.id)]));

const sectionLabel = { fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: 0 };
const h2 = { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(21px, 3.2vw, 27px)", letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 16px" };
const lead = { fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" };

export default function CuentasDebeHaberView({ nodoInicial = null, onBack }) {
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar] = useRecompensa();

  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const nodos = nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas);
  const resaltado = useNodoEnRuta(nodoAbierto, nodoInicial, nodos.map((x) => x.id));

  const completarJuego = async (actividadId, porcentajeAciertos, duracionMs, detalle = null) => {
    celebrar(CLAS[actividadId]?.dificultad, actividadId);
    const resultado = await registrarActividadCompletada(CLAS[actividadId], {
      materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos, duracionMs, detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  const juego = JUEGOS.find((j) => j.id === nodoAbierto);

  return (
    <FondoMateria materiaId={MATERIA}>
      {recompensa}
      <div style={{ minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif", color: FAE.text, backgroundImage: "radial-gradient(circle at 50% -10%, rgba(233,196,106,0.12), transparent 55%)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
            <span aria-hidden="true" className="fae-cabecera-marca" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button type="button" onClick={onBack} aria-label="Volver a Contabilidad" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}>
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>Las cuentas, el debe y el haber</h1>
          </div>

          {/* La insignia vive con el contenido, no en la cabecera: a 375 px se comía el título. */}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={HACER} size="sm" /></div>

          {!nodoAbierto && (
            <>
              <h2 style={h2}>El camino de este tema</h2>
              <p style={lead}>Toca el juego que quieras. No hay orden obligatorio: el camino sugiere uno, no lo impone.</p>
              <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} resaltado={resaltado} porBloques />
            </>
          )}

          {juego && (
            <>
              <button
                type="button"
                onClick={() => setNodoAbierto(null)}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "18px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
              >
                <ChevronLeft size={15} /> Volver al camino
              </button>
              <EnlaceRendimiento actividadId={juego.id} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
                <p style={sectionLabel}>JUEGO {JUEGOS.findIndex((j) => j.id === juego.id) + 1}</p>
                <ActivityBadge tipo={CLAS[juego.id]?.tipo} size="sm" />
              </div>
              <h2 style={h2}>{nombreDeActividad(juego.id)}</h2>
              <juego.Mecanica onCompletar={(pct, ms, detalle) => completarJuego(juego.id, pct, ms, detalle)} />
            </>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
