import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import EnlaceRendimiento from "./shared/EnlaceRendimiento.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import Electrocardiograma from "./mecanicas/corazon/Electrocardiograma.jsx";
import Termometro from "./mecanicas/corazon/Termometro.jsx";
import BancoTransfusiones from "./mecanicas/corazon/BancoTransfusiones.jsx";
import Biopsia from "./mecanicas/corazon/Biopsia.jsx";
import Triage from "./mecanicas/corazon/Triage.jsx";
import Cirugia from "./mecanicas/corazon/Cirugia.jsx";
import SalaMonitores from "./mecanicas/corazon/SalaMonitores.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { SUBJECTS, HACER, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";

/*
 * Mitad "Hacer" de Demanda Agregada: los siete juegos del corazón.
 *
 * Sustituye al camino que llevaba al simulador DA-Learn. Ese simulador era la
 * única actividad "Hacer" del tema y se retiró: su exploración con diales es
 * hoy "El corazón de la economía", en la mitad Aprender —hereda el mismo
 * modelo— y sus veintidós preguntas de recordar y comprender están cubiertas,
 * con banco más grande y sorteo por partida, por las actividades 1, 2 y 7. Lo
 * que no tenía de ninguna forma —analizar, evaluar y crear— lo añaden la 4, la
 * 5 y la 6.
 *
 * La estructura es la misma de Política Económica: un camino con los nodos y,
 * al tocar uno, la mecánica sola con su botón de volver. Que se navegue igual
 * en los dos temas no es casualidad ni copia: es la convención del sitio.
 */

const MATERIA = "macroeconomia";
const TEMA = "demanda-agregada";

const CLAS = {
  "electrocardiograma": clasificacionDe(MATERIA, TEMA, "electrocardiograma"),
  "termometro-reacciones": clasificacionDe(MATERIA, TEMA, "termometro-reacciones"),
  "banco-transfusiones": clasificacionDe(MATERIA, TEMA, "banco-transfusiones"),
  "biopsia-economica": clasificacionDe(MATERIA, TEMA, "biopsia-economica"),
  "triage-emergencias": clasificacionDe(MATERIA, TEMA, "triage-emergencias"),
  "cirugia-reconstruccion": clasificacionDe(MATERIA, TEMA, "cirugia-reconstruccion"),
  "sala-monitores": clasificacionDe(MATERIA, TEMA, "sala-monitores"),
};

/* Rótulo y entradilla de cada juego. El orden es el del camino. */
const JUEGOS = [
  {
    id: "electrocardiograma",
    titulo: "Lectura de electrocardiograma",
    lead: "Ocho definiciones y cuatro fragmentos de la fórmula. Reconocer el término por su lectura, que es el primer paso para poder usarlo.",
    Mecanica: Electrocardiograma,
  },
  {
    id: "termometro-reacciones",
    titulo: "El termómetro de reacciones",
    lead: "Seis cambios, seis predicciones. Cuando una variable se mueve, ¿hacia dónde reacciona el componente que toca?",
    Mecanica: Termometro,
  },
  {
    id: "banco-transfusiones",
    titulo: "Banco de transfusiones",
    lead: "El cálculo del Consumo tres veces: resuelto delante de ti, con la fórmula a la vista, y solo. Cada ronda retira un poco de ayuda.",
    Mecanica: BancoTransfusiones,
  },
  {
    id: "biopsia-economica",
    titulo: "Biopsia económica",
    lead: "Dos medidas a la vez que empujan en sentidos contrarios. Una sola pregunta, y la respuesta honesta puede ser que no se sabe.",
    Mecanica: Biopsia,
  },
  {
    id: "triage-emergencias",
    titulo: "Triage de emergencias",
    lead: "Tres medidas y una urgencia. No se trata de cuál sirve, sino de cuál va primero — y de poder defender por qué.",
    Mecanica: Triage,
  },
  {
    id: "cirugia-reconstruccion",
    titulo: "Cirugía de reconstrucción",
    lead: "Un golpe a la economía: por dónde entra directo y qué arrastra después. Reconstruir la cadena entera, no reconocerla.",
    Mecanica: Cirugia,
  },
  {
    id: "sala-monitores",
    titulo: "Sala de monitores",
    lead: "Doce alertas seguidas, mezcladas a propósito. Cada una entra por un componente distinto y hay que decir por cuál.",
    Mecanica: SalaMonitores,
  },
];

const sectionLabel = {
  fontFamily: "Sora, sans-serif",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: FAE.coral,
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

export default function DemandaAgregadaHacerView({ onBack }) {
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const { pedirCuenta } = useAuth();

  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === TEMA);
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);

  /*
   * El mismo camino central que el resto del sitio: la mecánica entrega
   * porcentaje, duración y detalle, y de aquí en adelante no hay nada propio
   * de este tema.
   */
  const completarJuego = async (actividadId, porcentajeAciertos, duracionMs, detalle = null) => {
    const resultado = await registrarActividadCompletada(CLAS[actividadId], {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId,
      porcentajeAciertos,
      duracionMs,
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  const juego = JUEGOS.find((j) => j.id === nodoAbierto);

  return (
    <FondoMateria materiaId="macroeconomia">
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
          color: FAE.text,
          backgroundImage: "radial-gradient(circle at 50% -10%, rgba(231,111,81,0.14), transparent 55%)",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
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
              Demanda Agregada
            </h1>
            <ActivityBadge tipo={HACER} size="sm" />
          </div>

          {!nodoAbierto && (
            <>
              <h2 style={h2}>El camino de este tema</h2>
              <p style={lead}>
                Siete juegos, del reconocer al reconstruir. No hay orden obligatorio: el camino sugiere
                uno, no lo impone.
              </p>
              <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} />
            </>
          )}

          {juego && (
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
                <ChevronLeft size={15} /> El camino
              </button>

              {/*
                * El atajo del docente. Se pinta solo para quien está autorizado en esta
                * materia; para todos los demás no existe. Va aquí, en la fila de volver,
                * porque pertenece a «hay una actividad abierta» y no al contenido de
                * ninguna de ellas: una sola inserción en vez de una por juego.
                */}
              {nodoAbierto && <EnlaceRendimiento actividadId={nodoAbierto} />}

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
                <p style={sectionLabel}>JUEGO {JUEGOS.findIndex((j) => j.id === juego.id) + 1}</p>
                <ActivityBadge tipo={CLAS[juego.id]?.tipo} size="sm" />
              </div>
              <h2 style={h2}>{juego.titulo}</h2>
              <p style={lead}>{juego.lead}</p>

              <juego.Mecanica
                onCompletar={(pct, ms, detalle) => completarJuego(juego.id, pct, ms, detalle)}
              />
            </>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
