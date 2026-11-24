/*
 * MACRO 2026 · EL ESCENARIO (rediseño con la lista de 5, spec de Gen 24-nov §1)
 *
 * Una franja de escena que va ARRIBA de la pieza, antes de la pregunta:
 * - fondo propio: un `tema` por tema de la materia (siluetas planas en SVG en
 *   línea sobre un degradado) y una `hora` que cambia el degradado;
 * - la mascota protagonista de pie sobre el piso, al `lado` indicado, con su
 *   rótulo de rol: 180 px en la escena completa, 120 px en la compacta;
 * - «TU PAPEL»: el rol del estudiante (≤ 15 palabras);
 * - el contexto (≤ 30 palabras), siempre antes de la pregunta.
 * Modo `compacto` (rondas de Hacer): ≤ 150 px de alto, mascota de 120 px y
 * el mini contexto de la ronda al otro lado; sin chip de rol.
 * Los textos salen del mapa ESCENAS de cada textos.js (la prueba
 * escenas.test.mjs los mide). Solo presentación: no toca ids ni puntajes.
 */
import { EscenaMascotas, MascotaRol } from "./mascotas.jsx";

/* Los cuatro degradados del navy (arriba → abajo). Todos oscuros: el texto
   claro queda en contraste AA (escenas.test.mjs lo mide en las dos puntas). */
export const HORAS = {
  manana: ["#1d3557", "#0e1b2e"],
  dia: ["#22406a", "#13243c"],
  tarde: ["#3b2d52", "#16263d"],
  noche: ["#08101e", "#132036"],
};

/* El acento de cada tema (nunca coral). Hacienda y puerto, aclarados para
   pasar AA sobre la punta más clara de cada degradado (#8a9cff daba 4,12;
   #2a9d8f daba 3,14). */
export const TEMAS_ESCENA = {
  plaza: { nombre: "Plaza de mercado", acento: "#f2c14e" },
  despacho: { nombre: "Despacho", acento: "#4fc2b2" },
  hacienda: { nombre: "Hacienda pública", acento: "#a0adff" },
  boveda: { nombre: "Bóveda", acento: "#e9c46a" },
  puerto: { nombre: "Puerto", acento: "#6cc3d5" },
};

export const ALTO_ESCENA = 180;
export const ALTO_COMPACTO = 120;

/* Siluetas planas de cada tema (viewBox 400 × 200, piso en y = 176). */
function Siluetas({ tema, acento }) {
  const s = { fill: acento, opacity: 0.16 };
  const t = { fill: "#f4f5f7", opacity: 0.06 };
  let fig = null;
  if (tema === "plaza") {
    fig = (
      <>
        {[[6, 70], [140, 92], [270, 64]].map(([x, y]) => (
          <g key={x}>
            <path d={`M${x} ${y}h118l-10 22H${x + 10}Z`} style={s} />
            <path d={`M${x + 4} ${y + 22}h4v${176 - y - 22}h-4ZM${x + 110} ${y + 22}h4v${176 - y - 22}h-4Z`} style={t} />
            <path d={`M${x + 18} ${y + 22}l10 10l10 -10l10 10l10 -10l10 10l10 -10l10 10l10 -10`} fill="none" stroke={acento} strokeOpacity=".22" strokeWidth="3" />
          </g>
        ))}
        {[118, 252, 388].map((x) => (
          <g key={x}>
            <path d={`M${x} 176V60`} stroke="#f4f5f7" strokeOpacity=".08" strokeWidth="4" />
            <circle cx={x} cy="54" r="9" style={s} />
          </g>
        ))}
      </>
    );
  } else if (tema === "despacho") {
    fig = (
      <>
        <rect x="20" y="24" width="220" height="120" rx="6" style={t} />
        {[40, 72, 104, 136, 168, 200].map((x, k) => <rect key={x} x={x} y={144 - 30 - (k % 3) * 22} width="24" height={30 + (k % 3) * 22} style={s} />)}
        <rect x="250" y="128" width="140" height="10" style={s} />
        <path d="M262 138v38M378 138v38" stroke="#f4f5f7" strokeOpacity=".08" strokeWidth="5" />
      </>
    );
  } else if (tema === "hacienda") {
    fig = (
      <>
        <path d="M30 70L150 30L270 70Z" style={s} />
        {[44, 84, 124, 164, 204, 244].map((x) => <rect key={x} x={x} y="78" width="14" height="90" style={t} />)}
        <rect x="30" y="168" width="240" height="8" style={s} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={300 + (k % 2) * 6} y={150 - k * 10} width="80" height="8" rx="2" style={s} />)}
      </>
    );
  } else if (tema === "boveda") {
    fig = (
      <>
        <circle cx="300" cy="96" r="70" style={s} />
        <circle cx="300" cy="96" r="44" style={t} />
        <path d="M300 60v72M264 96h72" stroke="#f4f5f7" strokeOpacity=".1" strokeWidth="6" />
        {[0, 1, 2].map((k) => <path key={k} d={`M${30 + k * 12} ${160 - k * 14}h90l-8 12h-74Z`} style={s} />)}
      </>
    );
  } else if (tema === "puerto") {
    fig = (
      <>
        {[[20, 136], [86, 136], [52, 100], [250, 136], [316, 136], [283, 100]].map(([x, y], k) => (
          <rect key={k} x={x} y={y} width="62" height="34" rx="2" style={k % 2 ? s : t} />
        ))}
        <path d="M150 40l40 -6l6 -10l6 8l30 -4l-28 10l4 12l-8 -10Z" style={s} />
      </>
    );
  }
  return (
    <svg className="da26-escena-fondo" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {fig}
      <rect x="0" y="176" width="400" height="24" fill="#000" opacity=".22" />
    </svg>
  );
}

export const CSS_ESCENA = `
.da26-escena { position: relative; isolation: isolate; overflow: hidden; margin: -12px -12px 12px; padding: 12px 12px 10px; border-bottom: 1px solid var(--da26-acento); color: #f4f5f7; }
@media (min-width: 400px) { .da26-escena { margin: -16px -16px 14px; padding: 14px 16px 10px; } }
.da26-escena-fondo { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; }
.da26-escena-cuerpo { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; }
.da26-escena[data-lado="der"] .da26-escena-cuerpo { flex-direction: row-reverse; }
.da26-escena-mascota { flex: none; margin: 0 auto; }
.da26-escena-texto { flex: 1 1 150px; min-width: 0; display: grid; gap: 8px; align-self: center; }
.da26-escena[data-compacto="1"] { padding-top: 4px; padding-bottom: 4px; }
.da26-escena[data-compacto="1"] .da26-escena-cuerpo { flex-wrap: nowrap; align-items: center; }
.da26-escena[data-compacto="1"] .da26-escena-mascota { margin: 0; }
.da26-escena[data-compacto="1"] .da26-escena-texto { flex: 1 1 0; }
.da26-papel { display: grid; gap: 2px; padding: 6px 10px; border-radius: 10px; border: 1px solid var(--da26-acento); background: rgba(8, 16, 30, .78); }
.da26-papel-etq { font: 700 12px/16px var(--planck-font-mono, ui-monospace, monospace); letter-spacing: .08em; color: var(--da26-acento); }
.da26-papel-txt { font-size: 15px; line-height: 1.3; font-weight: 600; }
.da26-nota { margin: 0; padding: 8px 10px; border-radius: 10px; border-left: 3px solid var(--da26-acento); background: rgba(8, 16, 30, .72); font-size: 15px; line-height: 1.35; }
.da26-nota-etq { display: block; font-size: 12px; line-height: 16px; letter-spacing: .02em; color: #b6bbc5; margin-bottom: 2px; }
.da26-escena-entra { animation: da26-escena-entra 300ms cubic-bezier(.3,.9,.4,1) both 1; }
@keyframes da26-escena-entra { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .da26-escena-entra { animation: none; } }
`;

/**
 * La franja de escena. `mascota` = { id, pose } (MascotaRol) o `escena` = id
 * de INTERACCIONES (varias mascotas). `mini` = el mini contexto de la ronda
 * (modo compacto), con un `etiqueta` opcional antes («Noticia de hoy:») y
 * `datos` (atributos data-* del texto, para las pruebas de cada pieza).
 */
export function Escenario({ tema = "plaza", hora = "dia", lado = "izq", mascota = null, escena = null, rol = null, contexto = null,
  compacto = false, mini = null, etiqueta = null, datos = null }) {
  const T = TEMAS_ESCENA[tema] ?? TEMAS_ESCENA.plaza;
  const [arriba, abajo] = HORAS[hora] ?? HORAS.dia;
  const alto = compacto ? ALTO_COMPACTO : ALTO_ESCENA;
  const texto = compacto ? mini : contexto;
  return (
    <section className="da26-escena" data-escenario data-tema={tema} data-hora={hora} data-lado={lado} data-compacto={compacto ? "1" : "0"}
      aria-label={T.nombre} style={{ "--da26-acento": T.acento, background: `linear-gradient(180deg, ${arriba}, ${abajo})` }}>
      <Siluetas tema={tema} acento={T.acento} />
      <div className="da26-escena-cuerpo">
        <div className="da26-escena-mascota da26-escena-entra" data-escena-alto={alto}>
          {escena
            ? <EscenaMascotas id={escena} alto={alto} perezosa={false} />
            : mascota && <MascotaRol id={mascota.id} pose={mascota.pose} alto={alto} corto={compacto} />}
        </div>
        <div className="da26-escena-texto">
          {!compacto && rol && (
            <div className="da26-papel" data-papel>
              <span className="da26-papel-etq">TU PAPEL</span>
              <span className="da26-papel-txt">{rol}</span>
            </div>
          )}
          {texto && (
            <p className="da26-nota da26-entra" key={texto} data-contexto-escena {...(datos ?? {})}>
              {etiqueta && <span className="da26-nota-etq">{etiqueta}</span>}
              {texto}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
