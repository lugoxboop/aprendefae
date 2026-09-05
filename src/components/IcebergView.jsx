import { useState, useRef } from "react";
import { ChevronLeft, ArrowDown, RotateCcw } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import InmersionDoble from "./mecanicas/InmersionDoble.jsx";
import IcebergArribaAbajo from "./mecanicas/IcebergArribaAbajo.jsx";
import CasoBlockbuster from "./mecanicas/CasoBlockbuster.jsx";
import { clasificacionDe, actividadesDeTipo, SUBJECTS, APRENDER, HACER } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
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

const QUICK_OPTIONS = [
  { id: "despedir", label: "Despedir al gerente del local" },
  { id: "capacitar", label: "Dar una capacitación exprés de servicio al cliente" },
  { id: "ignorar", label: "Ignorarlo, son casos aislados" },
];

const DEEP_LEVELS = [
  { name: "Patrón", text: "Las reseñas negativas suben siempre que hay alta rotación de personal en ese local." },
  { name: "Estructura", text: "El local no tiene un proceso de onboarding: contrata rápido y sin entrenamiento antes de los turnos de mayor demanda." },
  { name: "Modelo mental", text: "La gerencia cree que “cualquiera puede aprender el trabajo en el trabajo mismo”, por eso nunca invierte en entrenamiento previo." },
];

const INFORMED_DECISION = "Diseñar un proceso de onboarding estructurado antes de los turnos pico.";



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

  /* Mecánica 2: decisión tomada con un solo dato, y si ya se reveló el resto. */
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  /*
   * Reloj de la mecánica 2 para la defensa de tiempo del motor de FP.
   * Arranca al montar la vista, que es cuando la mecánica queda disponible
   * (la página muestra las dos a la vez), y para al revelar el iceberg.
   */
  const inicioMecanica2 = useRef(Date.now());

  /*
   * Qué nodo del camino está abierto. null = se ve el camino. Ningún nodo se
   * bloquea: esto solo dice cuál se está mirando, no cuál se puede mirar.
   */
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const tema = SUBJECTS["pensamiento-estrategico"].topics.find((t) => t.id === "modelo-iceberg");
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);
  const enNodo = (id) => nodoAbierto === id;

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
            <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} />
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

        {enNodo("decision-punta-vs-completo") && (
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

        </>
        )}

        {enNodo("iceberg-arriba-abajo") && (
        <>
        {/* ---------------- Mecánica 3 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
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

        </>
        )}

        {enNodo("caso-blockbuster") && (
        <>
        {/* ---------------- Mecánica 4 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
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
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
