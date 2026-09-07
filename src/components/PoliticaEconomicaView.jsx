import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import TableroDeFallas from "./mecanicas/salaDeControl/TableroDeFallas.jsx";
import Autorregulacion from "./mecanicas/salaDeControl/Autorregulacion.jsx";
import MaquinaDA from "./mecanicas/salaDeControl/MaquinaDA.jsx";
import DiagnosticoEnVivo from "./mecanicas/DiagnosticoEnVivo.jsx";
import ArmaGrupoLogico from "./mecanicas/ArmaGrupoLogico.jsx";
import QuienGanaQuienPierde from "./mecanicas/QuienGanaQuienPierde.jsx";
import CorrienteTitulares from "./mecanicas/CorrienteTitulares.jsx";
import ExplicaLaPolitica from "./mecanicas/ExplicaLaPolitica.jsx";
import SimuladorDeCrisis from "./mecanicas/SimuladorDeCrisis.jsx";
import TableroDeDecisiones from "./mecanicas/TableroDeDecisiones.jsx";
import { clasificacionDe, APRENDER, HACER, actividadesDeTipo, SUBJECTS } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";

/*
 * Tema "Política Económica" (Macroeconomía), con dos mecánicas:
 *
 * T3 (Aprender): recorrer el grupo lógico completo del caso Desempleo, para
 *     que las seis casillas se lean como una sola cadena.
 * J3 (Hacer, evaluativa): mover tres instrumentos de tres estrategias y ver
 *     que ninguno actúa solo.
 */

const MATERIA = "macroeconomia";
const TEMA = "politica-economica";
const CLAS_DIAGNOSTICO = clasificacionDe(MATERIA, TEMA, "diagnostico-en-vivo");
const CLAS_GRUPO = clasificacionDe(MATERIA, TEMA, "arma-grupo-logico");
const CLAS_GANADORES = clasificacionDe(MATERIA, TEMA, "quien-gana-quien-pierde");
const CLAS_CORRIENTE = clasificacionDe(MATERIA, TEMA, "corriente-titulares");
const CLAS_EXPLICA = clasificacionDe(MATERIA, TEMA, "explica-la-politica");
const CLAS_CRISIS = clasificacionDe(MATERIA, TEMA, "simulador-de-crisis");
const CLAS_DECISIONES = clasificacionDe(MATERIA, TEMA, "tablero-decisiones");
const CLAS_TABLERO = clasificacionDe(MATERIA, TEMA, "tablero-fallas");
const CLAS_AUTORREGULACION = clasificacionDe(MATERIA, TEMA, "autorregulacion-intervencion");
const CLAS_MAQUINA = clasificacionDe(MATERIA, TEMA, "maquina-da-palancas");

const sectionLabel = {
  fontFamily: "Sora, sans-serif",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: FAE.teal,
  margin: 0,
};

const h2 = {
  fontFamily: "Sora, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(21px, 3.2vw, 27px)",
  letterSpacing: "-0.025em",
  lineHeight: 1.15,
  margin: "0 0 10px",
};

const lead = { fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" };

export default function PoliticaEconomicaView({ modo = null, onBack }) {
  /*
   * Con qué mitad se entró desde la tarjeta partida. Sin modo se ve entera.
   */
  const muestraAprender = modo !== HACER;
  const muestraHacer = modo !== APRENDER;

  /*
   * Qué nodo del camino está abierto. null = se ve el camino. Ningún nodo se
   * bloquea nunca: esto dice cuál se está mirando, no cuál se deja mirar.
   */
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const temaActual = SUBJECTS["macroeconomia"].topics.find((t) => t.id === "politica-economica");
  const nodos = nodosDe(actividadesDeTipo(temaActual, HACER), hechas);

  const { pedirCuenta } = useAuth();

  /*
   * Un solo camino para los dos juegos: la clasificación y el id son lo único
   * que cambia, así que no hace falta un manejador por mecánica.
   */
  const completarJuego = async (clasificacion, actividadId, porcentajeAciertos, duracionMs, detalle = null) => {
    const resultado = await registrarActividadCompletada(clasificacion, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId,
      porcentajeAciertos,
      duracionMs,
      /* Solo lo mandan las mecánicas ya instrumentadas; el resto va en null. */
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  return (
    <FondoMateria materiaId="macroeconomia">
    <div
      style={{
        minHeight: "100vh",
        /* El color de fondo lo pone FondoMateria; aquí sería una tapa opaca. */
        backgroundColor: "transparent",
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(231,111,81,0.14), transparent 55%)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        {/* Logo (salir al inicio) y volver (subir al índice de la materia) conviven. */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a Macroeconomía"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Política Económica
          </h1>
          {/* Sin modo, ActivityBadge no dibuja nada: la página entera se ve igual. */}
          <ActivityBadge tipo={modo} size="sm" />
        </div>

        {muestraAprender && (
        <>
        {/* ------------- Sala de control · Panel 1: el diagnóstico ------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={sectionLabel}>MECÁNICA 1</p>
          <ActivityBadge tipo={CLAS_TABLERO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>El tablero de fallas</h2>
        <p style={lead}>
          Ocho problemas reales de la economía colombiana, con las cifras del curso. Cada aguja está lejos
          de donde debería estar, y ese hueco es el trabajo de la política económica.
        </p>
        <TableroDeFallas />

        {/* ------------ Sala de control · Panel 2: la demostración ------------ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA 2</p>
          <ActivityBadge tipo={CLAS_AUTORREGULACION?.tipo} size="sm" />
        </div>
        <h2 style={h2}>¿Autorregulación o intervención?</h2>
        <p style={lead}>
          Antes de tocar el interruptor, comprométete con una respuesta. Después déjalo correr: el mercado
          se cuida solo un buen rato — hasta que deja de hacerlo.
        </p>
        <Autorregulacion />

        {/* ------------ Sala de control · Panel 3: los mandos ------------ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA 3</p>
          <ActivityBadge tipo={CLAS_MAQUINA?.tipo} size="sm" />
        </div>
        <h2 style={h2}>La máquina de la DA y sus palancas</h2>
        <p style={lead}>
          La misma máquina de «Los grifos», operada un nivel más arriba: aquí las palancas son las ramas de
          la política económica. Mueve cualquiera y mira qué parte de la fórmula se enciende.
        </p>
        <MaquinaDA />
        </>
        )}

        {muestraHacer && (
        <>
        {!nodoAbierto && (
          <>
            <h2 style={h2}>El camino de este tema</h2>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 24px" }}>
              Toca el juego que quieras. No hay orden obligatorio: el camino sugiere uno, no lo impone.
            </p>
            <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} />
          </>
        )}

        {nodoAbierto && (
        <>
        <button
          type="button"
          onClick={() => setNodoAbierto(null)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "18px",
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
            color: "rgba(248,249,250,0.7)",
          }}
        >
          <ChevronLeft size={15} />
          Volver al camino
        </button>
        {/* ---------------- Juego 1 · Diagnóstico en vivo ---------------- */}
        {nodoAbierto === "diagnostico-en-vivo" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 4 : 1}</p>
          <ActivityBadge tipo={CLAS_DIAGNOSTICO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Diagnóstico en vivo</h2>
        <p style={lead}>
          Ocho titulares reales bajan uno a uno hacia la línea de archivo. Clasifica cada uno en su problema
          antes de que la cruce — cuenta el primer intento.
        </p>
        <DiagnosticoEnVivo
          onCompletar={(pct, ms, detalle) => completarJuego(CLAS_DIAGNOSTICO, "diagnostico-en-vivo", pct, ms, detalle)}
        />
        </>
        )}

        {/* ---------------- Juego 2 · Arma el grupo lógico ---------------- */}
        {nodoAbierto === "arma-grupo-logico" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 5 : 2}</p>
          <ActivityBadge tipo={CLAS_GRUPO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Arma el grupo lógico</h2>
        <p style={lead}>
          Del problema a la meta, seis casillas de una misma cadena. Doce enunciados para llenarlas, y seis
          son de cadenas distintas: por posición no se distinguen, hay que leerlos.
        </p>
        <ArmaGrupoLogico
          onCompletar={(pct, ms, detalle) => completarJuego(CLAS_GRUPO, "arma-grupo-logico", pct, ms, detalle)}
        />
        </>
        )}
        {/* ---------------- ¿Quién gana, quién pierde? ---------------- */}
        {nodoAbierto === "quien-gana-quien-pierde" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 6 : 3}</p>
          <ActivityBadge tipo={CLAS_GANADORES?.tipo} size="sm" />
        </div>
        <h2 style={h2}>¿Quién gana, quién pierde?</h2>
        <p style={lead}>
          Ninguna medida deja a todo el mundo igual. Cuatro rondas, cuatro personajes cada una: decide a quién le sirve y a quién le duele.
        </p>
        <QuienGanaQuienPierde
          onCompletar={(pct, ms, detalle) => completarJuego(CLAS_GANADORES, "quien-gana-quien-pierde", pct, ms, detalle)}
        />
        </>
        )}

        {/* ---------------- Corriente de titulares ---------------- */}
        {nodoAbierto === "corriente-titulares" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 7 : 4}</p>
          <ActivityBadge tipo={CLAS_CORRIENTE?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Corriente de titulares</h2>
        <p style={lead}>
          Dieciocho enunciados pasan por una cinta que acelera. Clasifica cada uno antes de que salga por el borde.
        </p>
        <CorrienteTitulares
          onCompletar={(pct, ms) => completarJuego(CLAS_CORRIENTE, "corriente-titulares", pct, ms)}
        />
        </>
        )}

        {/* ---------------- Explica la política ---------------- */}
        {nodoAbierto === "explica-la-politica" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 8 : 5}</p>
          <ActivityBadge tipo={CLAS_EXPLICA?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Explica la política</h2>
        <p style={lead}>
          Arma con cuatro frases una explicación que entienda alguien sin idea de economía. La jerga también cuenta como ruido.
        </p>
        <ExplicaLaPolitica
          onCompletar={(pct, ms, detalle) => completarJuego(CLAS_EXPLICA, "explica-la-politica", pct, ms, detalle)}
        />
        </>
        )}

        {/* ---------------- El simulador de crisis ---------------- */}
        {nodoAbierto === "simulador-de-crisis" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 9 : 6}</p>
          <ActivityBadge tipo={CLAS_CRISIS?.tipo} size="sm" />
        </div>
        <h2 style={h2}>El simulador de crisis</h2>
        <p style={lead}>
          Te dan el problema y nada más. Construye tú el objetivo, la estrategia, el instrumento, la medida y la meta.
        </p>
        <SimuladorDeCrisis
          onCompletar={(pct, ms, detalle) => completarJuego(CLAS_CRISIS, "simulador-de-crisis", pct, ms, detalle)}
        />
        </>
        )}

        {/* ---------------- El tablero de decisiones ---------------- */}
        {nodoAbierto === "tablero-decisiones" && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 10 : 7}</p>
          <ActivityBadge tipo={CLAS_DECISIONES?.tipo} size="sm" />
        </div>
        <h2 style={h2}>El tablero de decisiones</h2>
        <p style={lead}>
          Tres palancas de política y tres indicadores que se mueven a la vez. Dos metas que jalan para
          lados distintos: el margen para cumplir las dos es más estrecho de lo que parece.
        </p>
        <TableroDeDecisiones
          onCompletar={(pct, ms) => completarJuego(CLAS_DECISIONES, "tablero-decisiones", pct, ms)}
        />
        </>
        )}

        </>
        )}
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
