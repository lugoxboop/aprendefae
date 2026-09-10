import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ArrowDown, RotateCcw } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import EnlaceRendimiento from "./shared/EnlaceRendimiento.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import InmersionDoble from "./mecanicas/InmersionDoble.jsx";
import CamaraPresion from "./mecanicas/CamaraPresion.jsx";
import RadarProfundidad from "./mecanicas/RadarProfundidad.jsx";
import ExpedienteRescate from "./mecanicas/ExpedienteRescate.jsx";
import ArquitectoProfundidades from "./mecanicas/ArquitectoProfundidades.jsx";
import TribunalProfundidad from "./mecanicas/TribunalProfundidad.jsx";
import TransmisionSuperficie from "./mecanicas/TransmisionSuperficie.jsx";
import CorrienteCruzada from "./mecanicas/CorrienteCruzada.jsx";
import ProyectoArca from "./mecanicas/arca/ProyectoArca.jsx";
import { clasificacionDe, actividadesDeTipo, desafioDe, SUBJECTS, APRENDER, HACER } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useNodoEnRuta } from "./shared/useNodoEnRuta.js";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { leerPartida } from "../arca/partida.js";

const MATERIA = "pensamiento-estrategico";
const TEMA = "modelo-iceberg";
const CLAS_BUCEO = clasificacionDe(MATERIA, TEMA, "buceo-progresivo");
const CLAS_CAMARA = clasificacionDe(MATERIA, TEMA, "camara-presion");
const CLAS_RADAR = clasificacionDe(MATERIA, TEMA, "radar-profundidad");
const CLAS_RESCATE = clasificacionDe(MATERIA, TEMA, "expediente-rescate");
const CLAS_ARQUITECTO = clasificacionDe(MATERIA, TEMA, "arquitecto-profundidades");
const CLAS_TRIBUNAL = clasificacionDe(MATERIA, TEMA, "tribunal-profundidad");
const CLAS_TRANSMISION = clasificacionDe(MATERIA, TEMA, "transmision-superficie");
const CLAS_CORRIENTE = clasificacionDe(MATERIA, TEMA, "corriente-cruzada");
const CLAS_ARCA = clasificacionDe(MATERIA, TEMA, "proyecto-arca");

/*
 * Tema "Modelo del Iceberg", reorganizado sobre la taxonomía de Bloom: cada
 * actividad pide una habilidad distinta, así que ninguna se parece a otra por
 * diseño, no por casualidad.
 *
 *   Comprender  Inmersión con bitácora (Aprender, sin FP)
 *   Recordar    Cámara de presión — dar el término desde la definición
 *   Aplicar     Radar de profundidad — clasificar un caso nuevo con trampas
 *   Analizar    Expediente de rescate — el caso Blockbuster entero
 *   Evaluar     Tribunal de profundidad — juzgar tres explicaciones que sirven
 *   Crear       Arquitecto de las profundidades — armar un iceberg desde cero
 *
 * Bloom queda completo: Evaluar era el peldaño que faltaba. Y dos más que no son
 * un peldaño nuevo, sino otra forma de subir los que ya están:
 *
 *   Transmisión a la superficie   Explicárselo a quien acaba de llegar. Lo que
 *                                 mide no es entender: es saber decirlo.
 *   Corriente cruzada             Los cuatro casos mezclados y nunca dos
 *                                 seguidos del mismo. Sin contexto que sostenga,
 *                                 solo queda la regla.
 */

/* ---------------------------------- datos ---------------------------------- */



const panel = {
  borderRadius: "18px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "clamp(16px, 2.5vw, 24px)",
};

const sectionLabel = {
  fontFamily: "Sora, sans-serif",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: FAE.teal,
  margin: "0 0 8px",
};

const h2 = {
  fontFamily: "Sora, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(21px, 3.2vw, 27px)",
  letterSpacing: "-0.025em",
  lineHeight: 1.15,
  margin: "0 0 10px",
};

export default function IcebergView({ modo = null, nodoInicial = null, onBack }) {
  const { pedirCuenta, session } = useAuth();

  /*
   * Con qué mitad del tema se entró desde la tarjeta partida. Sin modo (null)
   * la página se muestra entera, que es como se veía antes de la separación y
   * como sigue llegándose si alguien entra por otro camino.
   */
  const muestraAprender = modo !== HACER;
  const muestraHacer = modo !== APRENDER;

  /*
   * Qué nodo del camino está abierto. null = se ve el camino. Ningún nodo se
   * bloquea: esto solo dice cuál se está mirando, no cuál se puede mirar.
   */
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const tema = SUBJECTS["pensamiento-estrategico"].topics.find((t) => t.id === "modelo-iceberg");
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);
  /*
   * El desafío va al lado del camino, no dentro. actividadesDeTipo() ya lo
   * excluye de los nodos numerados; aquí se recoge aparte para el ramal.
   */
  const desafio = desafioDe(tema);
  const nodoDesafio = desafio && {
    id: desafio.id,
    nombre: desafio.nombre,
    etiqueta: "Desafío",
    completada: hechas.has(desafio.id),
  };
  const enNodo = (id) => nodoAbierto === id;

  /* A2: el nodo que trae la URL, validado contra ESTE camino —el desafío incluido—. */
  const resaltado = useNodoEnRuta(
    nodoAbierto,
    nodoInicial,
    muestraHacer ? [...nodos.map((x) => x.id), ...(nodoDesafio ? [nodoDesafio.id] : [])] : [],
  );

  /*
   * La marca de partida a medias en el nodo del Arca. Se pregunta cada vez
   * que se vuelve al camino y al cambiar la sesión: al registrar el desafío
   * el servidor borra la partida, y la marca tiene que irse con ella.
   */
  const [arcaAMedias, setArcaAMedias] = useState(false);
  useEffect(() => {
    if (!muestraHacer || nodoAbierto) return undefined;
    let vivo = true;
    leerPartida().then((p) => vivo && setArcaAMedias(!!p)).catch(() => {});
    return () => { vivo = false; };
  }, [muestraHacer, nodoAbierto, session]);


  /* Cada mecánica evaluativa lleva su propio reloj y su propio % de acierto. */
  const inicioCamara = useRef(Date.now());
  const inicioRadar = useRef(Date.now());
  const inicioRescate = useRef(Date.now());
  const inicioArquitecto = useRef(Date.now());
  const inicioTribunal = useRef(Date.now());
  const inicioTransmision = useRef(Date.now());
  const inicioCorriente = useRef(Date.now());

  const completarEvaluativa = async (clasificacion, actividadId, inicioRef, porcentajeAciertos, detalle = null) => {
    const resultado = await registrarActividadCompletada(clasificacion, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId,
      porcentajeAciertos,
      duracionMs: Date.now() - inicioRef.current,
      /* Solo lo mandan las mecánicas instrumentadas; el resto va en null. */
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  /*
   * El desafío entrega su propio porcentaje —ya combinado de sus cuatro etapas—
   * y su propia duración. Los puntos los pone el servidor: aquí no se
   * multiplica nada por cuatro.
   */
  const completarDesafio = async (porcentajeAciertos, duracionMs, detalle = null) => {
    const resultado = await registrarActividadCompletada(CLAS_ARCA, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId: "proyecto-arca",
      porcentajeAciertos,
      duracionMs,
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  return (
    <FondoMateria materiaId="pensamiento-estrategico">
    <div
      style={{
        minHeight: "100vh",
        /* El color de fondo lo pone FondoMateria; aquí sería una tapa opaca. */
        backgroundColor: "transparent",
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.16), transparent 55%)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        {/* Logo (salir al inicio) y volver (subir al índice de la materia) conviven. */}
        <div className="fae-reserva-cuenta" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a Pensamiento Estratégico"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Modelo del Iceberg
          </h1>
          {/*
            Con qué mitad se entró. Sin modo, ActivityBadge no dibuja nada, así
            que la página completa se ve igual que antes sin condicional aquí.
          */}
          <ActivityBadge tipo={modo} size="sm" />
        </div>

        {muestraAprender && (
        <>
        {/* ---------------- Mecánica 1 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>COMPRENDER</p>
          <ActivityBadge tipo={CLAS_BUCEO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Inmersión</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 18px" }}>
          Una tienda de ropa que vende menos este mes. Toca el agua: el sonar baja un nivel cada vez, y lo
          que encuentres se va anotando al lado.
        </p>

        <InmersionDoble />

        <VideoYouTube
          videoId="3MpsEHLUcj0"
          titulo="Analiza tu Empresa con el MODELO DEL ICEBERG"
          canal="Felipe Administrador"
        />
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
            <CaminoHacer
              nodos={nodos}
              onAbrir={setNodoAbierto}
              especial={nodoDesafio}
              resaltado={resaltado}
              marcas={arcaAMedias && nodoDesafio ? { [nodoDesafio.id]: "Tienes una partida a medias" } : null}
            />
          </>
        )}

        {nodoAbierto && (
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
        )}

        {/*
          * El atajo del docente. Se pinta solo para quien está autorizado en esta
          * materia; para todos los demás no existe. Va aquí, en la fila de volver,
          * porque pertenece a «hay una actividad abierta» y no al contenido de
          * ninguna de ellas: una sola inserción en vez de una por juego.
          */}
        {nodoAbierto && <EnlaceRendimiento actividadId={nodoAbierto} />}

        {/* ---------------- 1. Cámara de presión · Recordar ---------------- */}
        {enNodo("camara-presion") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>RECORDAR</p>
          <ActivityBadge tipo={CLAS_CAMARA?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Cámara de presión</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Se te enseña la definición y tienes que dar el nombre del nivel, no al revés. Elige cómo:
          reconociéndolo entre cuatro, o sacándolo de memoria.
        </p>
        <CamaraPresion
          onCompletar={(pct, ms, modo, detalle) =>
            completarEvaluativa(
              CLAS_CAMARA,
              /*
               * El modo experto es otra entrada del catálogo, no una dificultad
               * que el cliente declare: ahora la dificultad la pone el servidor,
               * y afirmarla desde aquí no serviría de nada.
               */
              modo === "dificil" ? "camara-presion-experto" : "camara-presion",
              inicioCamara, pct, detalle
            )
          }
        />
        </>
        )}

        {/* ---------------- 2. Radar de profundidad · Aplicar ---------------- */}
        {enNodo("radar-profundidad") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>APLICAR</p>
          <ActivityBadge tipo={CLAS_RADAR?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Radar de profundidad</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Un caso nuevo, siete señales y cuatro anillos. Tres de las señales suenan a un nivel y son de
          otro: están para que reconocerlas cueste.
        </p>
        <RadarProfundidad
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_RADAR, "radar-profundidad", inicioRadar, pct, detalle)}
        />
        </>
        )}

        {/* ---------------- 3. Expediente de rescate · Analizar ---------------- */}
        {enNodo("expediente-rescate") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>ANALIZAR</p>
          <ActivityBadge tipo={CLAS_RESCATE?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Expediente de rescate</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Un barco hundido y cuatro restos enterrados en el sedimento. Pasea la linterna, recupéralos, y
          decide dónde valía la pena intervenir.
        </p>
        <ExpedienteRescate
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_RESCATE, "expediente-rescate", inicioRescate, pct, detalle)}
        />
        </>
        )}

        {/* -------------- 4. Tribunal de profundidad · Evaluar -------------- */}
        {enNodo("tribunal-profundidad") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>EVALUAR</p>
          <ActivityBadge tipo={CLAS_TRIBUNAL?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Tribunal de profundidad</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Aquí ninguna de las tres explicaciones es un disparate: las tres se sostienen. Lo que se pide no
          es descartar la mala, es ordenarlas por cuánto explican, y decir con qué vara lo mediste.
        </p>
        <TribunalProfundidad
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_TRIBUNAL, "tribunal-profundidad", inicioTribunal, pct, detalle)}
        />
        </>
        )}

        {/* ------------- 5. Arquitecto de las profundidades · Crear ------------- */}
        {enNodo("arquitecto-profundidades") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>CREAR</p>
          <ActivityBadge tipo={CLAS_ARQUITECTO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Arquitecto de las profundidades</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Solo tienes la punta. Las tres piezas de debajo están en un banco de quince fragmentos, y doce
          sobran: unos son de otro nivel, otros ni siquiera son de este caso.
        </p>
        <ArquitectoProfundidades
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_ARQUITECTO, "arquitecto-profundidades", inicioArquitecto, pct, detalle)}
        />
        </>
        )}

        {/* --------- 6. Transmisión a la superficie · Efecto protégé --------- */}
        {enNodo("transmision-superficie") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>ENSEÑAR</p>
          <ActivityBadge tipo={CLAS_TRANSMISION?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Transmisión a la superficie</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Alguien baja por primera vez y hay que explicárselo. El canal aguanta cinco frases, y hay once
          para elegir: unas son ciertas y no se entienden, otras se entienden y son falsas.
        </p>
        <TransmisionSuperficie
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_TRANSMISION, "transmision-superficie", inicioTransmision, pct, detalle)}
        />
        </>
        )}

        {/* --------- 7. Corriente cruzada · Práctica intercalada --------- */}
        {enNodo("corriente-cruzada") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>MEZCLAR</p>
          <ActivityBadge tipo={CLAS_CORRIENTE?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Corriente cruzada</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Los cuatro casos del tema a la vez, y nunca dos frases seguidas del mismo. Vas a fallar más que
          en el radar: allí el caso te sostenía entre una frase y la siguiente, y aquí no hay dónde
          apoyarse salvo la regla.
        </p>
        <CorrienteCruzada
          onCompletar={(pct, ms, detalle) => completarEvaluativa(CLAS_CORRIENTE, "corriente-cruzada", inicioCorriente, pct, detalle)}
        />
        </>
        )}

        {/* ------------ Desafío · El Proyecto del Arca (fuera del camino) ------------ */}
        {enNodo("proyecto-arca") && (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0, color: FAE.ambar }}>DESAFÍO</p>
          <ActivityBadge tipo={CLAS_ARCA?.tipo} size="sm" />
        </div>
        <h2 style={h2}>El Proyecto del Arca</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Cuatro etapas sobre un solo caso: el general que recibió cuatro meses para construir un arca y
          montó seis gerencias para vigilar al único que sabía construirla.
        </p>
        <ProyectoArca
          /*
           * El desafío lleva su propio reloj —empieza al pulsar "Empezar", no
           * al abrir la página— así que la duración la manda él y no un ref de
           * esta vista, que estaría contando desde que se cargó el tema.
           */
          onCompletar={(pct, duracionMs, detalle) => completarDesafio(pct, duracionMs, detalle)}
        />
        </>
        )}
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
