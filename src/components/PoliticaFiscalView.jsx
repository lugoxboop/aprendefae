import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import EnlaceRendimiento from "./shared/EnlaceRendimiento.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useNodoEnRuta } from "./shared/useNodoEnRuta.js";
import ClasificadorTesoro from "./mecanicas/tesoreria/ClasificadorTesoro.jsx";
import DirectosIndirectos from "./mecanicas/tesoreria/DirectosIndirectos.jsx";
import FlujoDeCaja from "./mecanicas/tesoreria/FlujoDeCaja.jsx";
import AgujeroFiscal from "./mecanicas/tesoreria/AgujeroFiscal.jsx";
import ExpansivaContractiva from "./mecanicas/tesoreria/ExpansivaContractiva.jsx";
import DisenaPresupuesto from "./mecanicas/tesoreria/DisenaPresupuesto.jsx";
import DeficitVsDeuda from "./mecanicas/tesoreria/DeficitVsDeuda.jsx";
import ClasePoliticaFiscal from "./mecanicas/tesoreria/clase/ClasePoliticaFiscal.jsx";
import { IconoMecanismo, ACENTOS } from "./mecanicas/tesoreria/tesoreria.jsx";
import { INSTRUMENTOS } from "../data/politicaFiscal.js";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { SUBJECTS, APRENDER, HACER, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";

/*
 * Política Fiscal — "La Tesorería Nacional". Dos mitades:
 *
 *   APRENDER  la presentación de cuatro escenas que el profesor proyecta
 *             (mecanicas/tesoreria/clase). No puntúa.
 *   HACER     los siete juegos, en el camino.
 *
 * Es un cuarto del mismo edificio que la Sala de Control de Política
 * Económica, no un mundo aparte: los paneles, los rótulos grabados y la
 * rejilla son los de allí. Y se navega igual que Demanda Agregada y Política
 * Económica —un camino con los nodos y, al tocar uno, la mecánica sola con su
 * botón de volver— porque esa es la convención del sitio.
 *
 * LAS DOS MITADES NO SE VEN JUNTAS. En Política Económica, sin modo se ve la
 * página entera; aquí no, porque la presentación se queda con las flechas y
 * la barra espaciadora de toda la ventana —es como se avanza con un mando—, y
 * en la página del camino esas teclas son para desplazarse. La presentación
 * solo se monta con el modo "aprender"; sin modo —un enlace de antes, el
 * atajo del docente a un juego— se abre el camino, que es lo que abría
 * siempre.
 */

const MATERIA = "macroeconomia";
const TEMA = "politica-fiscal";

/* Rótulo y entradilla de cada juego. El orden es el del camino, que es el de Bloom. */
const JUEGOS = [
  {
    id: "clasificador-tesoro",
    titulo: "El clasificador del Tesoro",
    lead: "Doce documentos bajan por la máquina contadora. Cada uno va a una de tres ranuras: lo que el Estado cobra, lo que paga o lo que pide prestado.",
    Mecanica: ClasificadorTesoro,
  },
  {
    id: "directos-indirectos",
    titulo: "Directos e indirectos",
    lead: "Ocho impuestos y cuatro sellos. Ya no basta con saber que es un tributo: hay que decir sobre qué recae.",
    Mecanica: DirectosIndirectos,
  },
  {
    id: "flujo-de-caja",
    titulo: "Flujo de caja: ¿a quién afecta?",
    lead: "Cobrar y gastar no llegan a la Demanda Agregada por el mismo sitio. Cuatro medidas reales y una pregunta sobre el multiplicador.",
    Mecanica: FlujoDeCaja,
  },
  {
    id: "agujero-fiscal",
    titulo: "El agujero fiscal",
    lead: "Un caso con las cifras de la prensa y una sola pregunta: por qué ampliar la renta en vez de subir el IVA.",
    Mecanica: AgujeroFiscal,
  },
  {
    id: "expansiva-contractiva",
    titulo: "Expansiva o contractiva",
    lead: "Una economía en problemas y tres medidas. De dos en dos: cuál conviene más en esta situación, y por qué.",
    Mecanica: ExpansivaContractiva,
  },
  {
    id: "disena-presupuesto",
    titulo: "Diseña el presupuesto",
    lead: "Un acueducto que colapsó y un presupuesto que no alcanza. Arma la respuesta con las piezas correctas; cada señuelo cuesta.",
    Mecanica: DisenaPresupuesto,
  },
  {
    id: "deficit-vs-deuda",
    titulo: "Déficit vs deuda",
    lead: "Diez papeles caen cada vez más rápido en cuatro bandejas. El déficit es lo que falta en un año; la deuda, lo que se acumula.",
    Mecanica: DeficitVsDeuda,
  },
];

const CLAS = Object.fromEntries(JUEGOS.map((j) => [j.id, clasificacionDe(MATERIA, TEMA, j.id)]));

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

/* Las tres máquinas de la Tesorería, a la entrada del camino. */
function Tesoreria() {
  return (
    <section
      aria-label="La Tesorería Nacional"
      style={{
        margin: "0 0 26px", padding: "14px 16px", borderRadius: "18px",
        background: "linear-gradient(160deg, rgba(29,53,87,0.34), rgba(10,20,34,0.62))",
        border: "1px solid rgba(248,249,250,0.14)", boxShadow: "inset 0 1px 0 rgba(248,249,250,0.08)",
      }}
    >
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: FAE.teal, margin: "0 0 12px" }}>
        LA TESORERÍA NACIONAL · UN CUARTO DE LA SALA DE CONTROL
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {INSTRUMENTOS.map((x) => (
          <div key={x.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <IconoMecanismo id={x.id} color={ACENTOS[x.id]} tam={26} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, color: FAE.text }}>
                {x.nombre}
              </span>
              <span style={{ display: "block", fontSize: "12.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.62)" }}>
                {x.mecanismo}: {x.describe}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PoliticaFiscalView({ modo = null, nodoInicial = null, onBack }) {
  const esClase = modo === APRENDER;
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const { pedirCuenta } = useAuth();

  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);
  /* A2: el nodo que trae la URL, validado contra ESTE camino. Ver useNodoEnRuta. */
  const resaltado = useNodoEnRuta(nodoAbierto, nodoInicial, esClase ? [] : nodos.map((x) => x.id));

  /* El mismo camino central que el resto del sitio: porcentaje, duración y detalle. */
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

  const juego = esClase ? null : JUEGOS.find((j) => j.id === nodoAbierto);

  return (
    <FondoMateria materiaId="macroeconomia">
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
          color: FAE.text,
          backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.14), transparent 55%)",
        }}
      >
        {/* La presentación usa el ancho entero: en un proyector cada columna cuenta. */}
        <div style={{ maxWidth: esClase ? "none" : "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
          <div className="fae-reserva-cuenta" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: esClase ? "16px" : "22px" }}>
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
              Política Fiscal
            </h1>
            <ActivityBadge tipo={esClase ? APRENDER : HACER} size="sm" />
          </div>

          {esClase && <ClasePoliticaFiscal />}

          {!esClase && !nodoAbierto && (
            <>
              <h2 style={h2}>El camino de este tema</h2>
              <p style={lead}>
                Siete juegos sobre cómo cobra, gasta y se endeuda el Estado. No hay orden obligatorio: el
                camino sugiere uno, no lo impone.
              </p>
              <Tesoreria />
              <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} resaltado={resaltado} />
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
                <ChevronLeft size={15} /> Volver al camino
              </button>

              {/* El atajo del docente: solo existe para quien está autorizado en esta materia. */}
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
