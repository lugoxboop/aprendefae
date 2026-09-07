import { useState } from "react";
import { ChevronLeft, RotateCcw } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import VideoYouTube from "./shared/VideoYouTube.jsx";
import AsedioEstrategico from "./mecanicas/AsedioEstrategico.jsx";
import { APRENDER, HACER, clasificacionDe, actividadesDeTipo, SUBJECTS } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";

const MATERIA = "pensamiento-estrategico";
const TEMA = "fuerzas-porter";
const CLAS_BATALLA = clasificacionDe(MATERIA, TEMA, "batalla-industrias");
const CLAS_TERMOMETRO = clasificacionDe(MATERIA, TEMA, "termometro-fuerza");
const CLAS_ASEDIO = clasificacionDe(MATERIA, TEMA, "asedio-estrategico");

/*
 * Tema "Fuerzas de Porter" — tres mecánicas sobre la misma página.
 *
 * 1. Batalla de industrias: dos radares lado a lado. Lo que enseña no es la
 *    definición de cada fuerza sino el contraste entre las dos siluetas.
 * 2. Termómetro por fuerza: el estudiante contesta sobre una situación concreta
 *    y ve subir la intensidad, en vez de que se la den resuelta.
 * 3. Asedio Estratégico: la única que evalúa, y la única que otorga FP.
 *
 * Las dos primeras son material: ninguna compara la respuesta contra nada, así
 * que caen del lado "Aprender" de la tarjeta partida.
 */

/* ------------------------- Mecánica 1: datos ------------------------- */

/* Etiquetas cortas: son los cinco vértices del radar y tienen que caber. */
const FORCES = [
  { key: "rivalidad", axis: "Rivalidad", full: "Rivalidad entre competidores" },
  { key: "clientes", axis: "Clientes", full: "Poder de negociación de clientes" },
  { key: "proveedores", axis: "Proveedores", full: "Poder de negociación de proveedores" },
  { key: "entrantes", axis: "Nuevos", full: "Amenaza de nuevos competidores" },
  { key: "sustitutos", axis: "Sustitutos", full: "Amenaza de sustitutos" },
];

const SCALE = { "Muy baja": 1, Baja: 2, Media: 3, "Media-alta": 4, Alta: 5 };

/*
 * Array de pares desde el principio: añadir otro caso más adelante es agregar
 * un elemento aquí, y el selector de casos aparece solo cuando hay más de uno.
 */
const CASE_PAIRS = [
  {
    id: "comida-rapida-vs-aviones",
    label: "Comida rápida vs. aviones",
    a: {
      name: "Restaurantes de comida rápida",
      tagline: "Un sector brutalmente competido",
      accent: FAE.coral,
      forces: { rivalidad: "Alta", clientes: "Alta", proveedores: "Media", entrantes: "Alta", sustitutos: "Alta" },
    },
    b: {
      name: "Fabricación de aviones comerciales",
      tagline: "Un sector protegido",
      accent: FAE.teal,
      forces: { rivalidad: "Baja", clientes: "Media", proveedores: "Media-alta", entrantes: "Muy baja", sustitutos: "Baja" },
    },
  },
];

const toRadarData = (industry) =>
  FORCES.map((f) => ({ axis: f.axis, value: SCALE[industry.forces[f.key]] }));

/* ------------------------- Mecánica 2: datos ------------------------- */

/*
 * Cada opción pesa 0, 0.5 o 1 según cuánta intensidad aporta a SU fuerza.
 * Ojo con la polaridad: más proveedores disponibles significa MENOS poder de
 * proveedores, y más capital inicial significa MENOS amenaza de entrantes.
 * La intensidad de cada fuerza es el promedio de sus dos respuestas.
 */
const GAUGES = [
  {
    key: "rivalidad",
    short: "Rivalidad",
    name: "Rivalidad entre competidores",
    questions: [
      {
        q: "¿Cuántos gimnasios boutique similares hay cerca?",
        options: [{ label: "Pocos", w: 0 }, { label: "Varios", w: 0.5 }, { label: "Muchísimos", w: 1 }],
      },
      {
        q: "¿Qué tan fácil es para un cliente cambiarse a otro?",
        options: [{ label: "Difícil", w: 0 }, { label: "Fácil", w: 1 }],
      },
    ],
  },
  {
    key: "clientes",
    short: "Clientes",
    name: "Poder de negociación de clientes",
    questions: [
      {
        q: "¿Los clientes quedan atados a un contrato largo o pueden cancelar cuando quieran?",
        options: [{ label: "Contrato largo", w: 0 }, { label: "Cancelan cuando quieran", w: 1 }],
      },
      {
        q: "¿Hay muchas alternativas de gimnasios genéricos más baratos cerca?",
        options: [{ label: "Casi ninguna", w: 0 }, { label: "Algunas", w: 0.5 }, { label: "Muchas", w: 1 }],
      },
    ],
  },
  {
    key: "proveedores",
    short: "Proveedores",
    name: "Poder de negociación de proveedores",
    questions: [
      {
        q: "¿Cuántos proveedores de equipos especializados hay en la ciudad?",
        options: [{ label: "Muchos", w: 0 }, { label: "Algunos", w: 0.5 }, { label: "Muy pocos", w: 1 }],
      },
      {
        q: "¿Es fácil conseguir instructores certificados para este tipo de clases?",
        options: [{ label: "Fácil", w: 0 }, { label: "Difícil", w: 1 }],
      },
    ],
  },
  {
    key: "entrantes",
    short: "Nuevos",
    name: "Amenaza de nuevos competidores",
    questions: [
      {
        q: "¿Cuánto capital inicial se necesita para abrir un gimnasio similar?",
        options: [{ label: "Mucho", w: 0 }, { label: "Moderado", w: 0.5 }, { label: "Poco", w: 1 }],
      },
      {
        q: "¿Existen barreras de ubicación o marca que dificulten que alguien más entre?",
        options: [{ label: "Sí, fuertes", w: 0 }, { label: "Casi ninguna", w: 1 }],
      },
    ],
  },
  {
    key: "sustitutos",
    short: "Sustitutos",
    name: "Amenaza de sustitutos",
    questions: [
      {
        q: "¿Qué tan fácil es entrenar en casa con apps o videos gratuitos?",
        options: [{ label: "Difícil", w: 0 }, { label: "Muy fácil", w: 1 }],
      },
      {
        q: "¿Hay gimnasios tradicionales mucho más baratos como alternativa cercana?",
        options: [{ label: "No", w: 0 }, { label: "Algunos", w: 0.5 }, { label: "Sí, varios", w: 1 }],
      },
    ],
  },
];

/* Ámbar intermedio: el termómetro necesita un paso entre teal y coral. */
const AMBER = "#E9B44C";

function intensityOf(answers) {
  if (answers[0] == null || answers[1] == null) return null;
  const v = (answers[0] + answers[1]) / 2;
  if (v < 0.34) return { value: v, label: "Baja", color: FAE.teal };
  if (v < 0.67) return { value: v, label: "Media", color: AMBER };
  return { value: v, label: "Alta", color: FAE.coral };
}

/* ------------------------------ estilos ------------------------------ */

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

const lead = { fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" };

/* --------------------------- subcomponentes --------------------------- */

function IndustryRadar({ industry }) {
  return (
    <div style={panel}>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "16px", margin: "0 0 2px", color: FAE.text }}>
        {industry.name}
      </p>
      <p style={{ fontSize: "13px", color: industry.accent, margin: "0 0 10px" }}>{industry.tagline}</p>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={toRadarData(industry)} outerRadius="70%">
          <PolarGrid stroke="rgba(203,220,242,0.18)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "rgba(248,249,250,0.72)", fontSize: 11, fontFamily: "Inter, sans-serif" }}
          />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={industry.accent} strokeWidth={2} fill={industry.accent} fillOpacity={0.28} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Gauge({ gauge, answers, onAnswer }) {
  const intensity = intensityOf(answers);
  const pct = intensity ? 8 + intensity.value * 92 : 0;

  return (
    <div style={{ ...panel, marginBottom: "14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15.5px", margin: 0, color: FAE.text }}>
          {gauge.name}
        </p>
        <span
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, whiteSpace: "nowrap",
            color: intensity ? intensity.color : "rgba(248,249,250,0.38)",
          }}
        >
          {intensity ? intensity.label.toUpperCase() : "SIN RESPONDER"}
        </span>
      </div>

      {/* el relleno se mueve en cuanto cambia una respuesta */}
      <div
        role="meter"
        aria-label={`Intensidad de ${gauge.name}`}
        aria-valuenow={intensity ? Math.round(intensity.value * 100) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.09)", overflow: "hidden", marginBottom: "16px" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "999px",
            background: intensity ? intensity.color : "transparent",
            transition: "width 420ms cubic-bezier(0.4,0,0.2,1), background-color 420ms ease",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {gauge.questions.map((question, qi) => (
          <div key={qi}>
            <p style={{ fontSize: "13.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.72)", margin: "0 0 7px" }}>
              {question.q}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {question.options.map((opt) => {
                const active = answers[qi] === opt.w;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onAnswer(qi, opt.w)}
                    aria-pressed={active}
                    style={{
                      fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500,
                      padding: "7px 14px", borderRadius: "999px", cursor: "pointer",
                      background: active ? "rgba(42,157,143,0.16)" : "rgba(248,249,250,0.04)",
                      border: `1px solid ${active ? "rgba(42,157,143,0.75)" : "rgba(248,249,250,0.14)"}`,
                      color: active ? FAE.text : "rgba(248,249,250,0.65)",
                      transition: "background-color 160ms ease, border-color 160ms ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- página ------------------------------- */

const emptyAnswers = () =>
  GAUGES.reduce((acc, g) => ({ ...acc, [g.key]: [null, null] }), {});

export default function PorterView({ modo = null, onBack }) {
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
  const temaActual = SUBJECTS["pensamiento-estrategico"].topics.find((t) => t.id === "fuerzas-porter");
  const nodos = nodosDe(actividadesDeTipo(temaActual, HACER), hechas);

  const { pedirCuenta } = useAuth();

  /* Única mecánica del tema conectada al motor de FP, por ahora. */
  const completarAsedio = async (porcentajeAciertos, duracionMs, detalle = null) => {
    const resultado = await registrarActividadCompletada(CLAS_ASEDIO, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId: "asedio-estrategico",
      porcentajeAciertos,
      duracionMs,
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  const [caseIndex, setCaseIndex] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);

  const pair = CASE_PAIRS[caseIndex];
  const answeredCount = GAUGES.filter((g) => intensityOf(answers[g.key])).length;
  const allAnswered = answeredCount === GAUGES.length;

  const setAnswer = (forceKey, qi, w) =>
    setAnswers((prev) => {
      const next = [...prev[forceKey]];
      next[qi] = w;
      return { ...prev, [forceKey]: next };
    });

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
            Fuerzas de Porter
          </h1>
          {/* Sin modo, ActivityBadge no dibuja nada: la página entera se ve igual. */}
          <ActivityBadge tipo={modo} size="sm" />
        </div>

        {muestraAprender && (
        <>
        {/* ---------------- Mecánica 1 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={sectionLabel}>MECÁNICA 1</p>
          <ActivityBadge tipo={CLAS_BATALLA?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Batalla de industrias</h2>
        <p style={lead}>
          Las mismas cinco fuerzas, dos sectores opuestos. Compara las siluetas: no hace falta la definición de
          cada fuerza para ver dónde se compite a muerte y dónde no.
        </p>

        {/* El selector solo tiene sentido cuando exista más de un par de casos. */}
        {CASE_PAIRS.length > 1 && (
          <div style={{ display: "inline-flex", gap: "4px", padding: "4px", borderRadius: "999px", background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.12)", marginBottom: "16px" }}>
            {CASE_PAIRS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCaseIndex(i)}
                aria-pressed={i === caseIndex}
                style={{
                  fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                  padding: "8px 18px", borderRadius: "999px", border: "none", cursor: "pointer",
                  backgroundColor: i === caseIndex ? FAE.teal : "transparent",
                  color: i === caseIndex ? FAE.bg : "rgba(248,249,250,0.6)",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <IndustryRadar industry={pair.a} />
          <IndustryRadar industry={pair.b} />
        </div>

        {/* Comparación explícita: el radar muestra la forma, esto nombra los niveles. */}
        <div style={{ ...panel, marginBottom: "16px" }}>
          {FORCES.map((f, i) => (
            <div
              key={f.key}
              style={{
                display: "grid", gridTemplateColumns: "1fr auto auto", gap: "12px", alignItems: "baseline",
                padding: "9px 0",
                borderBottom: i < FORCES.length - 1 ? "1px solid rgba(248,249,250,0.07)" : "none",
              }}
            >
              <span style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.75)" }}>{f.full}</span>
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: pair.a.accent, whiteSpace: "nowrap", minWidth: "72px", textAlign: "right" }}>
                {pair.a.forces[f.key]}
              </span>
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, color: pair.b.accent, whiteSpace: "nowrap", minWidth: "72px", textAlign: "right" }}>
                {pair.b.forces[f.key]}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...panel, marginBottom: "44px", background: "rgba(42,157,143,0.07)", borderColor: "rgba(42,157,143,0.26)" }}>
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.82)" }}>
            La figura ancha se defiende de todos lados a la vez; la estrecha casi no tiene frentes abiertos. Las
            cinco fuerzas no son una lista que memorizar: son la forma que toma un sector cuando las mides.
          </p>
        </div>

        {/* ---------------- Mecánica 2 ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <p style={sectionLabel}>MECÁNICA 2</p>
          <ActivityBadge tipo={CLAS_TERMOMETRO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Termómetro por fuerza</h2>
        <p style={lead}>
          Estás evaluando abrir un gimnasio boutique de clases grupales (spinning/HIIT) en Bogotá. Responde sobre
          la situación y mira cómo se arma la intensidad de cada fuerza.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
          <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)" }}>
            {answeredCount} de {GAUGES.length} fuerzas medidas
          </span>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={() => setAnswers(emptyAnswers())}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                padding: "8px 14px", borderRadius: "999px", cursor: "pointer",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.7)",
              }}
            >
              <RotateCcw size={14} />
              Empezar de nuevo
            </button>
          )}
        </div>

        {GAUGES.map((gauge) => (
          <Gauge
            key={gauge.key}
            gauge={gauge}
            answers={answers[gauge.key]}
            onAnswer={(qi, w) => setAnswer(gauge.key, qi, w)}
          />
        ))}

        {allAnswered && (
          <div style={{ ...panel, background: "rgba(42,157,143,0.07)", borderColor: "rgba(42,157,143,0.26)" }}>
            <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: "0 0 12px", color: "rgba(248,249,250,0.82)" }}>
              Ya tienes las cinco medidas. Juntas son el perfil del sector, igual que las siluetas de arriba:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {GAUGES.map((g) => {
                const it = intensityOf(answers[g.key]);
                return (
                  <span
                    key={g.key}
                    style={{
                      fontSize: "12.5px", padding: "6px 12px", borderRadius: "999px",
                      border: `1px solid ${it.color}`, color: it.color, whiteSpace: "nowrap",
                    }}
                  >
                    {g.short}: {it.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <VideoYouTube
          videoId="pBSQ7Am8yAk"
          titulo="5 Fuerzas de Porter | CASO Aerolíneas | Explicado Ejemplos Sencillos"
          canal="ANUOR AGUILAR"
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
        {/* ---------------- Mecánica 3: Asedio Estratégico ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={sectionLabel}>MECÁNICA {muestraAprender ? 3 : 1}</p>
          <ActivityBadge tipo={CLAS_ASEDIO?.tipo} size="sm" />
        </div>
        <h2 style={h2}>Asedio Estratégico — Defiende tu Margen</h2>
        <p style={lead}>
          Tres casos, diez puntos de defensa en cada uno y cinco flancos que proteger. Repartes
          antes de saber por dónde viene la presión: acertar es leer el caso, no aplicar la misma
          plantilla siempre.
        </p>
        <AsedioEstrategico onCompletar={(pct, ms, detalle) => completarAsedio(pct, ms, detalle)} />
        </>
        )}
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
