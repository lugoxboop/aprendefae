import { useState, useRef } from "react";
import { ChevronLeft, ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import IcebergDiagram from "./mecanicas/IcebergDiagram.jsx";
import IcebergArribaAbajo from "./mecanicas/IcebergArribaAbajo.jsx";
import CasoBlockbuster from "./mecanicas/CasoBlockbuster.jsx";
import { clasificacionDe, APRENDER, HACER } from "../data/subjects.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";

const MATERIA = "pensamiento-estrategico";
const TEMA = "modelo-iceberg";
const ACTIVIDAD_HACER = "decision-punta-vs-completo";
const CLAS_BUCEO = clasificacionDe(MATERIA, TEMA, "buceo-progresivo");
const CLAS_DECISION = clasificacionDe(MATERIA, TEMA, "decision-punta-vs-completo");
const CLAS_ARRIBA_ABAJO = clasificacionDe(MATERIA, TEMA, "iceberg-arriba-abajo");
const CLAS_BLOCKBUSTER = clasificacionDe(MATERIA, TEMA, "caso-blockbuster");

/*
 * Tema "Modelo del Iceberg" — cuatro mecánicas sobre la misma página, cada una
 * con su propio caso para que el traslado no sea repetición.
 *
 * 1. Buceo progresivo (Aprender): los cuatro niveles se revelan de uno en uno,
 *    sin poder saltar al fondo, para que se lean como una cadena causal.
 * 2. Decisión punta vs. iceberg completo (Hacer, exploratoria): el estudiante
 *    decide con un solo dato y luego compara, sin que se juzgue su elección.
 * 3. De arriba hacia abajo (Hacer, evaluativa): cada nivel se destapa al
 *    identificarlo entre distractores de otros niveles.
 * 4. Caso Blockbuster (Hacer, evaluativa): decidir en qué nivel intervenir.
 */

/* ---------------------------------- datos ---------------------------------- */

const LEVELS = [
  { key: "evento", name: "Evento", text: "Las ventas caen este mes.", lines: ["Las ventas caen", "este mes."] },
  { key: "patron", name: "Patrón", text: "Cada trimestre bajan en la misma época.", lines: ["Cada trimestre bajan", "en la misma época."] },
  { key: "estructura", name: "Estructura", text: "No hay un sistema de fidelización de clientes.", lines: ["No hay un sistema", "de fidelización", "de clientes."] },
  { key: "modelo", name: "Modelo mental", text: "Creemos que el cliente solo vuelve por precio.", lines: ["Creemos que el cliente", "solo vuelve por precio."] },
];

const DIVE_HINTS = [
  "Solo ves la punta: lo que pasó.",
  "Bajo el agua aparece la repetición: no fue un mes suelto.",
  "Más abajo está lo que produce esa repetición.",
  "En el fondo, la creencia que sostiene toda la estructura.",
];

const QUICK_OPTIONS = [
  { id: "despedir", label: "Despedir al gerente del local" },
  { id: "capacitar", label: "Dar una capacitación exprés de servicio al cliente" },
  { id: "ignorar", label: "Ignorarlo, son casos aislados" },
];

/*
 * ACTO 2 — el mismo buceo, otro mundo.
 *
 * El texto completo de cada nivel es el de Gen, literal, y vive en `detalle`:
 * es lo que se lee en el panel de abajo. La tarjeta del diagrama lleva una
 * versión corta porque en apaisado el dibujo escribe el nivel en UNA sola
 * línea, y estos textos son tres veces más largos que los del acto 1: puestos
 * enteros se salen de la tarjeta. El contenido no se recorta, se reparte.
 */
const LEVELS_ACTO2 = [
  {
    key: "evento",
    name: "Evento",
    text: "Pierde 200 suscriptores este mes.",
    lines: ["Pierde 200 suscriptores", "este mes."],
    detalle:
      "Un canal de reseñas de tecnología pierde 200 suscriptores este mes, a pesar de subir el mismo número de videos de siempre.",
  },
  {
    key: "patron",
    name: "Patrón",
    text: "4 meses seguidos perdiendo más de los que gana.",
    lines: ["4 meses seguidos perdiendo", "más de los que gana."],
    detalle:
      "Lleva 4 meses seguidos perdiendo más suscriptores de los que gana, aunque la frecuencia de subida no ha cambiado.",
  },
  {
    key: "estructura",
    name: "Estructura",
    text: "Mismo formato de 20 minutos desde hace 2 años.",
    lines: ["Mismo formato de 20 minutos", "desde hace 2 años."],
    detalle:
      "El canal sigue publicando el mismo formato (reseñas largas de 20 minutos) desde hace 2 años, mientras la plataforma empezó a favorecer videos cortos con más interacción temprana.",
  },
  {
    key: "modelo",
    name: "Modelo mental",
    text: "Cree que el buen contenido se encuentra solo.",
    lines: ["Cree que el buen contenido", "se encuentra solo."],
    detalle:
      "El creador cree que “si el contenido es bueno, encuentra su audiencia solo” — y que cambiar de formato sería “venderse” al algoritmo en vez de hacer contenido de calidad.",
  },
];

/* Lo que se lee al terminar el acto 1, antes de empezar el segundo. */
const INVITACION_ACTO2 =
  "Ahora un caso de un mundo totalmente distinto. Mira si reconoces algo.";

/* La pregunta del cierre no se califica: es para pensar, no para acertar. */
const PREGUNTA_CIERRE =
  "¿Qué tienen en común estos dos casos, aunque uno sea de una tienda y el otro de un canal de YouTube?";

const SINTESIS_CIERRE =
  "En los dos, lo que se ve (menos clientes, menos suscriptores) es solo el síntoma. Lo que de verdad sostiene el problema es una creencia que nadie cuestiona — y hasta que esa creencia no cambia, la estructura tampoco.";

const DEEP_LEVELS = [
  { name: "Patrón", text: "Las reseñas negativas suben siempre que hay alta rotación de personal en ese local." },
  { name: "Estructura", text: "El local no tiene un proceso de onboarding: contrata rápido y sin entrenamiento antes de los turnos de mayor demanda." },
  { name: "Modelo mental", text: "La gerencia cree que “cualquiera puede aprender el trabajo en el trabajo mismo”, por eso nunca invierte en entrenamiento previo." },
];

const INFORMED_DECISION = "Diseñar un proceso de onboarding estructurado antes de los turnos pico.";

/* --------------------- pantallas del segundo acto --------------------- */

/*
 * Puente entre los dos casos. No explica nada todavía: solo avisa de que lo que
 * viene es de otro mundo, para que el parecido lo note el estudiante y no se lo
 * cuenten antes de verlo.
 */
function Transicion({ onEmpezar }) {
  return (
    <div
      style={{
        borderRadius: "18px",
        background: "rgba(42,157,143,0.07)",
        border: `1px solid ${FAE.teal}`,
        padding: "clamp(20px, 3vw, 30px)",
        marginBottom: "44px",
      }}
    >
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(18px, 2.6vw, 22px)", lineHeight: 1.35, letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 18px" }}>
        {INVITACION_ACTO2}
      </p>
      <button
        type="button"
        onClick={onEmpezar}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
          padding: "11px 20px", borderRadius: "999px", border: "none",
          cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
        }}
      >
        Empezar el segundo caso
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/*
 * El cierre, que es la parte que de verdad enseña: los dos casos uno al lado
 * del otro, nivel por nivel. El parecido no se explica primero — se ve, luego
 * se pregunta, y solo al final se nombra.
 *
 * La pregunta NO se califica y no hay respuesta correcta guardada: es reflexión
 * abierta, y en clase la hace el profesor en voz alta.
 */
function CierreComparativo({ onReiniciar }) {
  const filas = LEVELS.map((l, i) => ({
    nivel: l.name,
    tienda: l.text,
    canal: LEVELS_ACTO2[i].detalle,
  }));

  return (
    <div style={{ marginBottom: "44px" }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 14px" }}>
        LOS DOS CASOS, NIVEL POR NIVEL
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "26px" }}>
        {filas.map((f) => (
          <div
            key={f.nivel}
            style={{
              borderRadius: "16px",
              background: "rgba(248,249,250,0.04)",
              border: "1px solid rgba(248,249,250,0.12)",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.teal, margin: "0 0 10px" }}>
              {f.nivel.toUpperCase()}
            </p>
            {/* Dos columnas en pantalla ancha, una debajo de otra en teléfono. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 4px" }}>La tienda</p>
                <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", margin: 0 }}>{f.tienda}</p>
              </div>
              <div>
                <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 4px" }}>El canal</p>
                <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", margin: 0 }}>{f.canal}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* La pregunta, sin caja de respuesta: se piensa, o se contesta en voz alta. */}
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(17px, 2.4vw, 21px)", lineHeight: 1.4, letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 8px" }}>
        {PREGUNTA_CIERRE}
      </p>
      <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.45)", margin: "0 0 22px" }}>
        No hay respuesta que marcar: piénsalo un momento antes de seguir leyendo.
      </p>

      <div
        style={{
          borderRadius: "18px",
          background: "rgba(42,157,143,0.07)",
          border: `1px solid ${FAE.teal}`,
          padding: "clamp(18px, 2.6vw, 26px)",
          marginBottom: "20px",
        }}
      >
        <p style={{ fontSize: "15.5px", lineHeight: 1.65, color: "rgba(248,249,250,0.9)", margin: 0 }}>
          {SINTESIS_CIERRE}
        </p>
      </div>

      <button
        type="button"
        onClick={onReiniciar}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
          padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
          background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
          color: "rgba(248,249,250,0.7)",
        }}
      >
        <RotateCcw size={14} />
        Volver a bucear desde el primer caso
      </button>
    </div>
  );
}

/* ------------------------------- página ------------------------------- */

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

export default function IcebergView({ modo = null, onBack }) {
  const { pedirCuenta } = useAuth();

  /*
   * Con qué mitad del tema se entró desde la tarjeta partida. Sin modo (null)
   * la página se muestra entera, que es como se veía antes de la separación y
   * como sigue llegándose si alguien entra por otro camino.
   */
  const muestraAprender = modo !== HACER;
  const muestraHacer = modo !== APRENDER;

  /*
   * Las mecánicas se numeran dentro de lo que se está viendo: entrar por
   * "Hacer" y encontrarse con que la primera es la "MECÁNICA 2" delataría un
   * filtro sobre una lista pensada para otra cosa.
   */
  const orden = [
    ...(muestraAprender ? ["buceo"] : []),
    ...(muestraHacer ? ["decision", "arriba-abajo", "blockbuster"] : []),
  ];
  const numero = (clave) => orden.indexOf(clave) + 1;

  /* Mecánica 1: hasta qué nivel se ha bajado (0 = solo el evento). */
  const [depth, setDepth] = useState(0);
  /*
   * Mecánica 1, en qué acto va. El buceo es el mismo en los dos casos: lo
   * único que cambia es el contenido, así que no hay una segunda mecánica sino
   * el mismo aparato con otros niveles.
   */
  const [acto, setActo] = useState("caso1");
  const segundoCaso = acto === "caso2";
  const niveles = segundoCaso ? LEVELS_ACTO2 : LEVELS;
  const irA = (siguiente) => { setActo(siguiente); setDepth(0); };
  /* Mecánica 2: decisión tomada con un solo dato, y si ya se reveló el resto. */
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  /*
   * Reloj de la mecánica 2 para la defensa de tiempo del motor de FP.
   * Arranca al montar la vista, que es cuando la mecánica queda disponible
   * (la página muestra las dos a la vez), y para al revelar el iceberg.
   */
  const inicioMecanica2 = useRef(Date.now());

  const atBottom = depth >= niveles.length - 1;
  const pickedLabel = QUICK_OPTIONS.find((o) => o.id === pick)?.label;

  /*
   * Completar la actividad "Hacer". Si no hay sesión, el motor no tiene dónde
   * guardar, así que se pide la cuenta con el mismo diálogo contextual que usa
   * el resto del sitio. La revelación ocurre igual: entrar nunca es requisito
   * para seguir aprendiendo.
   */
  const completar = async () => {
    const resultado = await registrarActividadCompletada(CLAS_DECISION, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId: ACTIVIDAD_HACER,
      duracionMs: Date.now() - inicioMecanica2.current,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  /* Cada mecánica evaluativa lleva su propio reloj y su propio % de acierto. */
  const inicioArribaAbajo = useRef(Date.now());
  const inicioBlockbuster = useRef(Date.now());

  const completarEvaluativa = async (clasificacion, actividadId, inicioRef, porcentajeAciertos) => {
    const resultado = await registrarActividadCompletada(clasificacion, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId,
      porcentajeAciertos,
      duracionMs: Date.now() - inicioRef.current,
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
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
          <p style={{ ...sectionLabel, margin: 0 }}>MECÁNICA {numero("buceo")}</p>
          <ActivityBadge tipo={CLAS_BUCEO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Bucea el iceberg</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 12px" }}>
          Cada nivel explica por qué existe el de arriba. Baja de uno en uno: no se puede saltar al fondo.
        </p>

        {/* En qué acto va, visible siempre menos en el cierre. */}
        {acto !== "cierre" && (
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 16px" }}>
            {segundoCaso || acto === "transicion" ? "CASO 2 DE 2 · UN CANAL DE YOUTUBE" : "CASO 1 DE 2 · UNA TIENDA"}
          </p>
        )}

        {acto === "transicion" ? (
          <Transicion onEmpezar={() => irA("caso2")} />
        ) : acto === "cierre" ? (
          <CierreComparativo onReiniciar={() => irA("caso1")} />
        ) : (
        <>

        {/*
          El orden visual lo decide .ice-buceo en home.css: en pantalla ancha va
          gráfico y luego controles; en angosta los controles suben, porque si
          quedan debajo caen fuera del pliegue en teléfonos cortos. El alto del
          dibujo se ajusta al hueco disponible para que el nivel actual y el
          gráfico se vean a la vez, que es el sentido de la mecánica.
        */}
        <div className="ice-buceo">
        <div className="ice-grafico" style={{ ...panel, marginBottom: "16px" }}>
          <IcebergDiagram levels={niveles} depth={depth} responsivo />
        </div>

        <div className="ice-controles" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
          <button
            type="button"
            onClick={() => setDepth((d) => Math.min(d + 1, niveles.length - 1))}
            disabled={atBottom}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
              padding: "11px 20px", borderRadius: "999px", border: "none",
              cursor: atBottom ? "default" : "pointer",
              backgroundColor: atBottom ? "rgba(248,249,250,0.08)" : FAE.teal,
              color: atBottom ? "rgba(248,249,250,0.45)" : FAE.bg,
            }}
          >
            <ArrowDown size={16} />
            {atBottom ? "Llegaste al fondo" : "Bajar un nivel"}
          </button>

          {depth > 0 && (
            <button
              type="button"
              onClick={() => setDepth(0)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.7)",
              }}
            >
              <RotateCcw size={14} />
              Volver a la superficie
            </button>
          )}

          <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)" }}>
            Nivel {depth + 1} de {niveles.length}
          </span>
        </div>

        <div className="ice-pista" style={{ ...panel, marginBottom: "44px", background: "rgba(42,157,143,0.07)", borderColor: "rgba(42,157,143,0.26)" }}>
          {/*
            En el caso 2 el texto del nivel va aquí entero: son frases largas
            que en la tarjeta del diagrama no caben. En el caso 1 el panel sigue
            diciendo exactamente lo que decía.
          */}
          {segundoCaso && (
            <p style={{ fontSize: "15px", lineHeight: 1.6, margin: "0 0 10px", color: FAE.text }}>
              {niveles[depth].detalle}
            </p>
          )}
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.82)" }}>
            {atBottom
              ? "Los cuatro niveles son la misma historia a distinta profundidad. Actuar sobre el evento cambia este mes; actuar sobre el modelo mental cambia todos los que vienen."
              : DIVE_HINTS[depth]}
          </p>
        </div>
        </div>

        {/*
          Al tocar fondo se ofrece seguir. En el caso 1 lleva a la invitación;
          en el 2, a comparar los dos. Nunca aparece antes de llegar abajo:
          saltarse el buceo sería saltarse la mecánica.
        */}
        {atBottom && (
          <div style={{ marginTop: "-30px", marginBottom: "44px" }}>
            <button
              type="button"
              onClick={() => irA(segundoCaso ? "cierre" : "transicion")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
                padding: "11px 20px", borderRadius: "999px", border: "none",
                cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
              }}
            >
              {segundoCaso ? "Comparar los dos casos" : "Ver el segundo caso"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
        </>
        )}

        <VideoYouTube
          videoId="3MpsEHLUcj0"
          titulo="Analiza tu Empresa con el MODELO DEL ICEBERG"
          canal="Felipe Administrador"
        />
        </>
        )}

        {muestraHacer && (
        <>
        {/* ---------------- Mecánica 2 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>MECÁNICA {numero("decision")}</p>
          <ActivityBadge tipo={CLAS_DECISION?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Decidir con la punta vs. con el iceberg completo</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Otro caso, para practicar el traslado. Primero decides con lo único que se ve.
        </p>

        <div style={{ ...panel, marginBottom: "16px" }}>
          <p style={{ ...sectionLabel, color: "rgba(248,249,250,0.5)" }}>EVENTO</p>
          <p style={{ fontSize: "16.5px", lineHeight: 1.55, margin: 0, color: FAE.text }}>
            Un local específico de una cadena de restaurantes recibe cada vez más reseñas negativas.
          </p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.7)", margin: "0 0 12px" }}>
            {pick ? "Tu decisión:" : "¿Qué haces con esta única información?"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {QUICK_OPTIONS.map((opt) => {
              const chosen = pick === opt.id;
              const dimmed = pick && !chosen;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => !pick && setPick(opt.id)}
                  disabled={!!pick}
                  style={{
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "15px",
                    lineHeight: 1.45,
                    padding: "14px 18px",
                    borderRadius: "14px",
                    cursor: pick ? "default" : "pointer",
                    background: chosen ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                    border: `1px solid ${chosen ? "rgba(42,157,143,0.75)" : "rgba(248,249,250,0.14)"}`,
                    color: dimmed ? "rgba(248,249,250,0.4)" : FAE.text,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {pick && !revealed && (
          <button
            type="button"
            onClick={() => {
              setRevealed(true);
              /*
               * Aquí se completa la mecánica 2: ya decidió y ya vio el iceberg.
               * La dificultad y la modalidad salen de la clasificación, no de
               * esta línea: esta actividad no tiene lógica de puntos propia.
               */
              completar();
            }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
              padding: "11px 20px", borderRadius: "999px", border: "none",
              cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg, marginBottom: "16px",
            }}
          >
            <ArrowDown size={16} />
            Ver el iceberg completo
          </button>
        )}

        {revealed && (
          <>
            <div style={{ ...panel, marginBottom: "16px" }}>
              <p style={{ ...sectionLabel, color: "rgba(248,249,250,0.5)" }}>LO QUE HABÍA DEBAJO</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {DEEP_LEVELS.map((lvl) => (
                  <div key={lvl.name} style={{ borderLeft: `2px solid ${FAE.teal}`, paddingLeft: "14px" }}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: FAE.teal, margin: "0 0 4px", letterSpacing: "0.05em" }}>
                      {lvl.name}
                    </p>
                    <p style={{ fontSize: "14.5px", lineHeight: 1.55, margin: 0, color: "rgba(248,249,250,0.82)" }}>
                      {lvl.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraste neutro: las dos decisiones lado a lado, sin calificar la del estudiante. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "16px" }}>
              <div style={{ ...panel }}>
                <p style={{ ...sectionLabel, color: "rgba(248,249,250,0.5)" }}>DECIDISTE CON LA PUNTA</p>
                <p style={{ fontSize: "15px", lineHeight: 1.5, margin: 0, color: FAE.text }}>{pickedLabel}</p>
              </div>
              <div style={{ ...panel, background: "rgba(42,157,143,0.09)", borderColor: "rgba(42,157,143,0.34)" }}>
                <p style={{ ...sectionLabel }}>CON EL ICEBERG COMPLETO</p>
                <p style={{ fontSize: "15px", lineHeight: 1.5, margin: 0, color: FAE.text }}>{INFORMED_DECISION}</p>
              </div>
            </div>

            <div style={{ ...panel, marginBottom: "16px" }}>
              <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.82)" }}>
                Las dos decisiones responden al mismo evento. La diferencia está en qué nivel tocan: una actúa
                sobre lo que se ve este mes, la otra sobre lo que lo produce. Compáralas y saca tu conclusión.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setPick(null); setRevealed(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.7)",
              }}
            >
              <RotateCcw size={14} />
              Probar con otra decisión
            </button>
          </>
        )}

        {/* ---------------- Mecánica 3 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>MECÁNICA {numero("arriba-abajo")}</p>
          <ActivityBadge tipo={CLAS_ARRIBA_ABAJO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>De arriba hacia abajo</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Lo que se ve en la superficie nunca es la historia completa. Aquí tienes un problema que parece simple
          — una tienda que pierde clientes en diciembre — y tu trabajo es bajar, nivel por nivel, hasta encontrar
          qué hay realmente debajo del agua. Ojo: en cada nivel hay opciones que suenan bien pero en realidad son
          de OTRO nivel — ahí es donde más se equivoca la gente.
        </p>
        <IcebergArribaAbajo
          onCompletar={(pct) =>
            completarEvaluativa(CLAS_ARRIBA_ABAJO, "iceberg-arriba-abajo", inicioArribaAbajo, pct)
          }
        />

        {/* ---------------- Mecánica 4 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "48px 0 8px" }}>
          <p style={{ ...sectionLabel, margin: 0 }}>MECÁNICA {numero("blockbuster")}</p>
          <ActivityBadge tipo={CLAS_BLOCKBUSTER?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Caso real: Blockbuster</h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Recorre la línea de tiempo y decide dónde intervendrías. Aquí no se trata de clasificar niveles, sino de
          juzgar cuál mueve de verdad el futuro de la empresa.
        </p>
        <CasoBlockbuster
          onCompletar={(pct) =>
            completarEvaluativa(CLAS_BLOCKBUSTER, "caso-blockbuster", inicioBlockbuster, pct)
          }
        />
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
