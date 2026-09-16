import { FAE } from "../../theme.js";
import { MATERIAS_DEL_POOL } from "../../repaso/repaso.js";
import { SUBJECTS } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PASILLO (B6): una puerta por materia de la que ya se jugó algo.
 *
 *   Política Económica   la sala de control: visor y luces de panel
 *   Demanda Agregada     el quirófano: ventana ovalada
 *   Política Fiscal      la bóveda: rueda de caja fuerte
 *   Política Monetaria   la sala de máquinas: remaches y manija de palanca
 *
 * SOLO LAS PUERTAS QUE EXISTEN PARA ESTE ESTUDIANTE. Ninguna apagada, ningún
 * «próximamente», ningún hueco guardado para Pensamiento Estratégico: con una
 * materia hecha el pasillo tiene una puerta, centrada, y crece solo.
 *
 * Cada puerta lleva su nombre escrito debajo. El dibujo distingue, el nombre
 * informa: el color nunca va solo. Sin coral.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MARCO = "rgba(248,249,250,0.42)";
const HOJA = "#28313F";
const METAL = FAE.node;

function PuertaControl() {
  return (
    <>
      <rect x="10" y="8" width="40" height="78" rx="3" fill={HOJA} stroke={MARCO} strokeWidth="1.5" />
      {/* El visor, con su reflejo de pantalla. */}
      <rect x="16" y="18" width="28" height="10" rx="2" fill="#13233B" stroke={METAL} strokeWidth="1.2" />
      <path d="M19 23 H33" stroke={FAE.teal} strokeWidth="1.6" strokeLinecap="round" />
      {/* El panel lateral y sus tres luces. */}
      <rect x="36" y="40" width="9" height="20" rx="1.5" fill="none" stroke={METAL} strokeWidth="1" />
      <circle cx="40.5" cy="45" r="1.8" fill={FAE.teal} />
      <circle cx="40.5" cy="50" r="1.8" fill={FAE.ambar} />
      <circle cx="40.5" cy="55" r="1.8" fill={METAL} />
    </>
  );
}

function PuertaQuirofano() {
  return (
    <>
      <rect x="10" y="8" width="40" height="78" rx="3" fill={HOJA} stroke={MARCO} strokeWidth="1.5" />
      {/* Ventana ovalada, centrada a la altura de los ojos. */}
      <ellipse cx="30" cy="30" rx="9" ry="12" fill="#13233B" stroke={METAL} strokeWidth="1.4" />
      <path d="M25 24 Q27 21 30 20.5" stroke="rgba(248,249,250,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* La placa de empuje: se abre con el cuerpo, no con la mano. */}
      <rect x="14" y="68" width="32" height="12" rx="1.5" fill="none" stroke={METAL} strokeWidth="1.1" />
    </>
  );
}

function PuertaBoveda() {
  const rayos = [0, 60, 120, 180, 240, 300];
  return (
    <>
      <rect x="6" y="8" width="48" height="78" rx="3" fill={HOJA} stroke={MARCO} strokeWidth="1.5" />
      <circle cx="30" cy="46" r="20" fill="none" stroke={METAL} strokeWidth="1.6" />
      {/* Los pernos del cierre, alrededor. */}
      {[0, 90, 180, 270].map((g) => (
        <circle key={g} cx={30 + 20 * Math.cos((g * Math.PI) / 180)} cy={46 + 20 * Math.sin((g * Math.PI) / 180)} r="2" fill={METAL} />
      ))}
      {/* La rueda de caja fuerte. */}
      <circle cx="30" cy="46" r="3" fill={METAL} />
      {rayos.map((g) => (
        <path
          key={g}
          d={`M30 46 L${(30 + 11 * Math.cos((g * Math.PI) / 180)).toFixed(2)} ${(46 + 11 * Math.sin((g * Math.PI) / 180)).toFixed(2)}`}
          stroke={METAL} strokeWidth="1.8" strokeLinecap="round"
        />
      ))}
      <circle cx="30" cy="46" r="11" fill="none" stroke={METAL} strokeWidth="1.1" />
    </>
  );
}

function PuertaIndustrial() {
  const remaches = [];
  for (const y of [14, 30, 46, 62, 78]) remaches.push([15, y], [45, y]);
  return (
    <>
      <rect x="10" y="8" width="40" height="78" rx="2" fill={HOJA} stroke={MARCO} strokeWidth="1.5" />
      <path d="M10 47 H50" stroke={MARCO} strokeWidth="1" />
      {remaches.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill={METAL} />
      ))}
      {/*
        La manija de palanca: placa atornillada y la barra horizontal. Inclinada
        se leía como la aguja de un reloj, que es el icono del propio Repaso.
      */}
      <rect x="36" y="40" width="9" height="15" rx="1.5" fill={HOJA} stroke={METAL} strokeWidth="1.2" />
      <path d="M40.5 47.5 H24" stroke={METAL} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="40.5" cy="47.5" r="2" fill={METAL} />
    </>
  );
}

export const PUERTAS = {
  "politica-economica": PuertaControl,
  "demanda-agregada": PuertaQuirofano,
  "politica-fiscal": PuertaBoveda,
  "politica-monetaria": PuertaIndustrial,
};

const nombreDe = (temaId) => SUBJECTS.macroeconomia.topics.find((t) => t.id === temaId)?.title ?? temaId;

/**
 * @param {string[]} materias  ids de tema con al menos una actividad completada
 */
export default function Pasillo({ materias }) {
  const visibles = MATERIAS_DEL_POOL.filter((m) => materias.includes(m) && PUERTAS[m]);
  if (visibles.length === 0) return null;

  return (
    <div
      data-pasillo
      style={{
        position: "relative", borderRadius: "18px", overflow: "hidden",
        padding: "16px 10px 0",
        background: "linear-gradient(180deg, rgba(29,53,87,0.55) 0%, rgba(19,35,59,0.9) 72%, rgba(10,20,34,0.95) 100%)",
        border: "1px solid rgba(248,249,250,0.14)",
      }}
    >
      <ul
        style={{
          listStyle: "none", margin: 0, padding: 0,
          display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "clamp(6px, 3vw, 22px)",
        }}
      >
        {visibles.map((m) => {
          const Puerta = PUERTAS[m];
          const nombre = nombreDe(m);
          return (
            <li key={m} data-puerta={m} style={{ flex: "0 1 96px", minWidth: 0, textAlign: "center" }}>
              <svg viewBox="0 0 60 90" role="img" aria-label={`Puerta de ${nombre}`} style={{ display: "block", width: "100%", maxWidth: "84px", margin: "0 auto" }}>
                <Puerta />
              </svg>
              <p style={{ margin: "6px 0 0", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 600, lineHeight: 1.25, color: "rgba(248,249,250,0.78)" }}>
                {nombre}
              </p>
            </li>
          );
        })}
      </ul>
      {/* El suelo del pasillo. */}
      <div aria-hidden="true" style={{ height: "18px", marginTop: "8px", borderTop: "1px solid rgba(248,249,250,0.14)", background: "rgba(10,20,34,0.6)" }} />
    </div>
  );
}
