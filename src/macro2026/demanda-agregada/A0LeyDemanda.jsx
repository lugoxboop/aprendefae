/*
 * A0 · La ley de la demanda en el mercado (da26-a0-ley-demanda, Aprender, sin FP).
 * Microvideo de Jane (aprobado por Mateo el 25-nov-2026, voz em_alex). La
 * fuente, el guion y la verificación están en
 * orquestador/conocimiento/jane/microvideos/ley-demanda/. El video es la copia
 * ligera (720 × 1280, 1,8 MB) en public/macro2026/videos/; los subtítulos van
 * quemados en la imagen y la transcripción completa va debajo, en texto.
 *
 * P1: el video. P2: la misma curva, quieta, con los cuatro puntos del video
 * (P = 3.500 − 500·Q), para leer la idea sin volver a reproducirlo.
 */
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { BORDE, INK, INK_2 } from "../comun/colores-da.js";
import { APRENDER, ESCENAS, TRANSCRIPCION_A0 } from "./textos.js";

export const ID = "da26-a0-ley-demanda";
const TX = APRENDER[ID];
const MANGO = "#f2c14e";
const ACENTO = "#6f86ff";

function Video() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {/* Ancho y alto enteros (relación 9:16) para que no salte la página al cargar. */}
      <video
        data-video-ley-demanda
        controls
        playsInline
        preload="metadata"
        width={360}
        height={640}
        poster="/macro2026/videos/ley-demanda-poster.webp"
        aria-label="Microvideo: la ley de la demanda en un puesto de mangos (45 segundos, con subtítulos)"
        style={{ width: "100%", maxWidth: 320, height: "auto", borderRadius: 14, background: "#0E1B2E", display: "block" }}
      >
        <source src="/macro2026/videos/ley-demanda.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

function Transcripcion() {
  return (
    <details className="da26-rotulo" style={{ margin: "4px 0 0" }} data-transcripcion>
      <summary style={{ cursor: "pointer", color: INK_2 }}>Leer lo que dice el video</summary>
      <div style={{ marginTop: 8, color: INK, lineHeight: 1.5 }}>
        {TRANSCRIPCION_A0.map((t, k) => <p key={k} style={{ margin: "0 0 6px" }}>{t}</p>)}
      </div>
    </details>
  );
}

/* Los cuatro pares del video, sobre una sola recta: P = 3.500 − 500·Q. */
const PUNTOS = [[5, 1000], [3, 2000], [1, 3000], [4, 1500]];
const W = 320, H = 240, X0 = 60, X1 = 300, Y0 = 200, Y1 = 20;
const x = (q) => X0 + (q / 6.5) * (X1 - X0);
const y = (p) => Y0 - (p / 3600) * (Y0 - Y1);
const fmt = (p) => `$${p.toLocaleString("es-CO")}`;

function Curva() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }} role="img"
      aria-label="Curva de demanda con pendiente negativa: a $1.000 se compran 5 mangos, a $1.500 4, a $2.000 3 y a $3.000 1">
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={BORDE} strokeWidth="2" />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={BORDE} strokeWidth="2" />
      <text x={X1} y={Y0 + 30} textAnchor="end" fill={INK_2} fontSize="13">Cantidad demandada (Q)</text>
      <text x={X0 - 4} y={Y1 - 6} textAnchor="start" fill={INK_2} fontSize="13">Precio (P)</text>
      {[1000, 1500, 2000, 3000].map((p) => (
        <text key={p} x={X0 - 6} y={y(p) + 4} textAnchor="end" fill={INK_2} fontSize="13">{fmt(p)}</text>
      ))}
      {[1, 3, 4, 5].map((q) => (
        <text key={q} x={x(q)} y={Y0 + 15} textAnchor="middle" fill={INK_2} fontSize="13">{q}</text>
      ))}
      <line x1={x(0.4)} y1={y(3500 - 500 * 0.4)} x2={x(6.2)} y2={y(3500 - 500 * 6.2)} stroke={ACENTO} strokeWidth="4" strokeLinecap="round" />
      <text x={x(6.2) + 4} y={y(3500 - 500 * 6.2) - 6} fill={ACENTO} fontSize="15" fontWeight="700">D</text>
      {PUNTOS.map(([q, p]) => (
        <g key={q}>
          <line x1={x(q)} y1={Y0} x2={x(q)} y2={y(p)} stroke={BORDE} strokeDasharray="3 4" />
          <circle cx={x(q)} cy={y(p)} r="7" fill={MANGO} stroke="#0E1B2E" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

export default function A0LeyDemanda({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(2);
  const figura = paso === 0 ? <Video /> : <Curva />;
  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID} paso={paso} total={2} texto={TX[paso]} figura={figura}
      pie={paso === 0 ? <Transcripcion /> : null}
      onSiguiente={siguiente} onAnterior={anterior} onTerminar={onTerminar}
    />
  );
}
