import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import MapaCausal from "./mecanicas/MapaCausal.jsx";
import { clasificacionDe, APRENDER, HACER } from "../data/subjects.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";

const MATERIA = "pensamiento-estrategico";
const TEMA = "pensamiento-sistemico";

const CLASIFICACION = clasificacionDe(MATERIA, TEMA, "comparador-cadena-red");
const CLAS_MAPA = clasificacionDe(MATERIA, TEMA, "constructor-mapa-causal");

/*
 * Tema "Pensamiento Sistémico" — comparador "Cadena lineal vs Red sistémica".
 *
 * La idea que debe quedar: pensar en sistemas no es agregar más variables, es
 * ver que las variables se conectan entre sí, se devuelven y se afectan
 * mutuamente. Por eso los cuatro nodos son SIEMPRE los mismos y ocupan siempre
 * la misma posición: lo único que cambia entre vistas son las conexiones.
 */

const BASE_LINE = "rgba(203,220,242,0.55)";

const LABELS = [
  ["Sube el precio", "de la gasolina"],
  ["Sube el costo", "del transporte", "(público y de carga)"],
  ["Suben los precios", "de bienes", "de consumo"],
  ["Baja el poder", "adquisitivo de", "los hogares"],
];

/*
 * Dos disposiciones del mismo diagrama. La ancha reparte los nodos en cuadro;
 * la angosta los apila, porque en un teléfono el cuadro obliga a escalar el
 * SVG hasta dejar el texto en ~8px, ilegible.
 *
 * Lo que el tema exige es que los nodos no se muevan al cambiar de VISTA, y eso
 * se cumple en ambas: la disposición depende solo del ancho de pantalla.
 *
 * En las dos, el 4→1 rodea el diagrama por fuera para leerse como "vuelve al
 * origen" y no como un enlace directo más.
 */
const LAYOUTS = {
  wide: {
    viewW: 720,
    viewH: 620,
    nodeW: 230,
    nodeH: 112,
    nodes: [
      { n: 1, cx: 200, cy: 135 },
      { n: 2, cx: 520, cy: 135 },
      { n: 3, cx: 520, cy: 480 },
      { n: 4, cx: 200, cy: 480 },
    ],
    base: [
      { id: "1-2", d: "M 322,135 L 396,135" },
      { id: "2-3", d: "M 470,198 L 470,417" },
      { id: "3-4", d: "M 398,480 L 324,480" },
    ],
    systemic: [
      { id: "4-1", d: "M 85,472 C 10,450 10,185 85,148" },
      { id: "2-4", d: "M 430,196 Q 370,310 294,416" },
      { id: "3-2", d: "M 570,417 L 570,198" },
    ],
  },
  narrow: {
    viewW: 420,
    viewH: 865,
    nodeW: 230,
    nodeH: 96,
    nodes: [
      { n: 1, cx: 230, cy: 95 },
      { n: 2, cx: 230, cy: 320 },
      { n: 3, cx: 230, cy: 545 },
      { n: 4, cx: 230, cy: 770 },
    ],
    base: [
      { id: "1-2", d: "M 230,150 L 230,264" },
      { id: "2-3", d: "M 230,375 L 230,489" },
      { id: "3-4", d: "M 230,600 L 230,714" },
    ],
    systemic: [
      { id: "4-1", d: "M 115,765 C 20,730 20,140 115,105" },
      { id: "2-4", d: "M 345,325 C 412,430 412,680 345,763" },
      { id: "3-2", d: "M 285,489 L 285,375" },
    ],
  },
};

function useLayout() {
  const pick = () => (typeof window !== "undefined" && window.innerWidth < 700 ? "narrow" : "wide");
  const [key, setKey] = useState(pick);
  useEffect(() => {
    const onResize = () => setKey(pick());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return LAYOUTS[key];
}

const SYSTEMIC_NOTES = [
  {
    label: "4 → 1",
    text: "Menos poder adquisitivo significa menos uso del vehículo particular, lo que cambia la demanda de gasolina: el efecto vuelve al origen.",
  },
  {
    label: "2 → 4",
    text: "El transporte público más caro golpea directo el presupuesto del hogar, sin pasar por los precios de los bienes.",
  },
  {
    label: "3 → 2",
    text: "Al subir los precios baja el volumen de carga transportada, y eso afecta el ingreso del sector transporte.",
  },
];

function DiagramNode({ node, nodeW, nodeH }) {
  const lines = LABELS[node.n - 1];
  const x = node.cx - nodeW / 2;
  const y = node.cy - nodeH / 2;
  const firstLineY = node.cy - ((lines.length - 1) * 24) / 2 + 7;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={nodeW}
        height={nodeH}
        rx={16}
        fill="rgba(248,249,250,0.055)"
        stroke="rgba(248,249,250,0.16)"
        strokeWidth={1.5}
      />
      <circle cx={x + 19} cy={y + 19} r={10.5} fill="rgba(42,157,143,0.22)" stroke={FAE.teal} strokeWidth={1.2} />
      <text
        x={x + 19}
        y={y + 19}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={FAE.teal}
        fontFamily="Sora, sans-serif"
      >
        {node.n}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={node.cx}
          y={firstLineY + i * 24}
          textAnchor="middle"
          fontSize={19}
          fill={FAE.text}
          fontFamily="Inter, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export default function PensamientoSistemicoView({ modo = null, onBack }) {
  /*
   * Con qué mitad se entró desde la tarjeta partida. Sin modo se ve entera,
   * igual que antes de la separación.
   */
  const muestraAprender = modo !== HACER;
  const muestraHacer = modo !== APRENDER;

  const { pedirCuenta } = useAuth();
  const [systemic, setSystemic] = useState(false);
  const layout = useLayout();
  /* Reloj del mapa causal, para la defensa de tiempo del motor de FP. */
  const inicioMapa = useRef(Date.now());

  const completarMapa = async (porcentajeAciertos) => {
    const resultado = await registrarActividadCompletada(CLAS_MAPA, {
      materiaId: MATERIA,
      temaId: TEMA,
      actividadId: "constructor-mapa-causal",
      porcentajeAciertos,
      duracionMs: Date.now() - inicioMapa.current,
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
        backgroundImage:
          "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.16), transparent 55%)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 48px" }}>
        {/* Logo (salir al inicio) y volver (subir al índice de la materia) conviven. */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span
            aria-hidden="true"
            style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }}
          />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a Pensamiento Estratégico"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "999px",
              background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1
            style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Pensamiento Sistémico
          </h1>
        </div>

        {muestraAprender && (
        <>
        <div style={{ marginBottom: "10px" }}>
          <ActivityBadge tipo={CLASIFICACION?.tipo} />
        </div>
        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 4vw, 34px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 10px",
          }}
        >
          Cadena lineal vs Red sistémica
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 6px" }}>
          Caso: <strong style={{ color: FAE.text, fontWeight: 600 }}>sube el precio de la gasolina en Bogotá.</strong>
        </p>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 22px" }}>
          Son los mismos cuatro factores en las dos vistas. Lo que cambia no es cuántos son, sino cuántas
          conexiones hay entre ellos.
        </p>

        {/* Toggle: mismo patrón de estado que los filtros de DA-Learn */}
        <div
          role="group"
          aria-label="Cambiar entre vista lineal y vista sistémica"
          style={{
            display: "inline-flex",
            gap: "4px",
            padding: "4px",
            borderRadius: "999px",
            background: "rgba(248,249,250,0.05)",
            border: "1px solid rgba(248,249,250,0.12)",
            marginBottom: "18px",
          }}
        >
          {[
            { id: "lineal", label: "Vista lineal", active: !systemic },
            { id: "sistemica", label: "Vista sistémica", active: systemic },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSystemic(opt.id === "sistemica")}
              aria-pressed={opt.active}
              style={{
                fontFamily: "Sora, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 18px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                backgroundColor: opt.active ? FAE.teal : "transparent",
                color: opt.active ? FAE.bg : "rgba(248,249,250,0.6)",
                transition: "background-color 180ms ease, color 180ms ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div
          style={{
            borderRadius: "18px",
            background: "rgba(248,249,250,0.03)",
            border: "1px solid rgba(248,249,250,0.10)",
            padding: "clamp(10px, 2vw, 20px)",
            marginBottom: "18px",
          }}
        >
          <svg
            viewBox={`0 0 ${layout.viewW} ${layout.viewH}`}
            width="100%"
            role="img"
            aria-label={
              systemic
                ? "Diagrama sistémico: los cuatro factores conectados entre sí, incluido un ciclo que regresa al origen"
                : "Diagrama lineal: cada factor empuja al siguiente en una sola dirección"
            }
            style={{ display: "block", height: "auto" }}
          >
            <defs>
              <marker
                id="ps-arrow-base"
                viewBox="0 0 12 12"
                refX="10.5"
                refY="6"
                markerWidth="14"
                markerHeight="14"
                orient="auto-start-reverse"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 1 1 L 11 6 L 1 11 z" fill={BASE_LINE} />
              </marker>
              <marker
                id="ps-arrow-sys"
                viewBox="0 0 12 12"
                refX="10.5"
                refY="6"
                markerWidth="14"
                markerHeight="14"
                orient="auto-start-reverse"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 1 1 L 11 6 L 1 11 z" fill={FAE.coral} />
              </marker>
            </defs>

            {layout.base.map((a) => (
              <path
                key={a.id}
                d={a.d}
                fill="none"
                stroke={BASE_LINE}
                strokeWidth={2.2}
                strokeLinecap="round"
                markerEnd="url(#ps-arrow-base)"
              />
            ))}

            {systemic &&
              layout.systemic.map((a) => (
                <path
                  key={a.id}
                  d={a.d}
                  fill="none"
                  stroke={FAE.coral}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  markerEnd="url(#ps-arrow-sys)"
                />
              ))}

            {layout.nodes.map((node) => (
              <DiagramNode key={node.n} node={node} nodeW={layout.nodeW} nodeH={layout.nodeH} />
            ))}
          </svg>
        </div>

        {/* Leyenda: le da significado explícito al coral */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <svg width="34" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
            <line x1="1" y1="5" x2="33" y2="5" stroke={FAE.coral} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.62)" }}>
            En coral: conexión que solo aparece en el sistema.
          </span>
        </div>

        {systemic ? (
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(231,111,81,0.07)",
              border: "1px solid rgba(231,111,81,0.28)",
              padding: "18px 20px",
            }}
          >
            <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: "0 0 14px", color: FAE.text }}>
              Los mismos cuatro factores, pero ahora se afectan mutuamente. El efecto no termina: vuelve.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {SYSTEMIC_NOTES.map((note) => (
                <div key={note.label} style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontFamily: "Sora, sans-serif",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: FAE.coral,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {note.label}
                  </span>
                  <span style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.78)" }}>
                    {note.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(248,249,250,0.04)",
              border: "1px solid rgba(248,249,250,0.12)",
              padding: "18px 20px",
            }}
          >
            <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.78)" }}>
              Cada factor empuja al siguiente en una sola dirección y la cadena se detiene en el último.
              Visto así, el problema parece terminar en el bolsillo del hogar.
            </p>
          </div>
        )}

        </>
        )}

        {muestraHacer && (
        <>
        {/* ---------------- Mecánica 2: constructor de mapa causal ---------------- */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: modo ? "0 0 8px" : "48px 0 8px" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: 0 }}>
            MECÁNICA {muestraAprender ? 2 : 1}
          </p>
          <ActivityBadge tipo={CLAS_MAPA?.tipo} size="sm" />
        </div>
        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(21px, 3.2vw, 27px)",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            margin: "0 0 10px",
          }}
        >
          Constructor de mapa causal
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 8px" }}>
          Caso: <strong style={{ color: FAE.text, fontWeight: 600 }}>un local de comida rápida en Bogotá baja el
          precio de sus hamburguesas un 20% para vender más.</strong>
        </p>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" }}>
          Arma la red completa: toca un nodo y luego otro para conectarlos. No todos los nodos pertenecen al
          sistema. Tienes una sola verificación.
        </p>

        <MapaCausal onCompletar={completarMapa} />
        </>
        )}
      </div>
    </div>
    </FondoMateria>
  );
}
