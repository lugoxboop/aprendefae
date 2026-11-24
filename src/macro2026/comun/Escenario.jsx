/*
 * MACRO 2026 · EL ESCENARIO (rediseño con la lista de 5, spec de Gen 24-nov §1)
 *
 * Una franja de escena que va ARRIBA de la pieza, antes de la pregunta:
 * - fondo propio: un `tema` por tema de la materia (siluetas en SVG en línea,
 *   en dos capas con parallax, sobre un degradado; o un telón ilustrado con
 *   `fondo`) y una `hora` que cambia el degradado;
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

/*
 * El fondo de la franja, en dos capas con profundidad (fondos-vida, pedido de
 * Mateo: «soso»). viewBox 400 × 200, piso en y = 176.
 * - LEJOS: siluetas azuladas y claras, con luces cálidas pequeñas; deriva
 *   despacio (parallax lento).
 * - CERCA: siluetas oscuras con el acento del tema en ventanas, toldos o
 *   contenedores, y faroles cálidos con su halo; deriva el doble.
 * Ningún texto se apoya directo en el fondo: TU PAPEL, el contexto y el rótulo
 * de la mascota llevan su placa oscura (el AA se mide sobre el píxel más claro).
 */
export const LUZ = "#ffc978";
const LEJOS = "#2c4470";
const CERCA = "#0a1526";

/* Un farol cálido: halo (degradado radial) y foco. */
function Farol({ x, y, r = 22, id }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-halo)`} />
      <circle cx={x} cy={y} r="3.2" fill={LUZ} />
    </g>
  );
}
/* Una fila de ventanas encendidas: unas en acento, otras en luz cálida. */
function Ventanas({ x, y, cols, filas, w = 6, h = 7, dx = 11, dy = 12, acento, semilla = 0, op = 0.85 }) {
  const v = [];
  for (let f = 0; f < filas; f += 1) {
    for (let c = 0; c < cols; c += 1) {
      const k = (f * 7 + c * 3 + semilla) % 5;
      if (k === 4) continue; /* alguna apagada */
      v.push(<rect key={`${f}-${c}`} x={x + c * dx} y={y + f * dy} width={w} height={h} rx="1" fill={k % 2 ? acento : LUZ} opacity={op} />);
    }
  }
  return <>{v}</>;
}
/* Un toldo a rayas: acento y crema. */
function Toldo({ x, y, w, acento, n = 6 }) {
  const a = w / n;
  return (
    <g>
      {Array.from({ length: n }, (_, k) => (
        <path key={k} d={`M${x + k * a} ${y}h${a}l-2 16q${-(a - 4) / 2} 6 ${-(a - 4)} 0Z`} fill={k % 2 ? "#f4ead2" : acento} opacity={k % 2 ? 0.7 : 0.9} />
      ))}
    </g>
  );
}

function capas(tema, acento, id) {
  if (tema === "plaza") {
    return {
      lejos: (
        <>
          <path d="M0 176V112l26-18 26 18v-6l30-22 30 22v-8l22-14 22 14v10l34-26 34 26v-4l28-20 28 20v-8l30-22 30 22v-6l20-14 20 14v66Z" fill={LEJOS} />
          <path d="M300 176V64l14-24 14 24v112Z" fill={LEJOS} />
          <Ventanas x={14} y={120} cols={3} filas={2} acento={acento} semilla={1} op={0.55} />
          <Ventanas x={160} y={118} cols={4} filas={2} acento={acento} semilla={3} op={0.55} />
          <rect x="309" y="70" width="10" height="12" rx="5" fill={LUZ} opacity=".6" />
        </>
      ),
      cerca: (
        <>
          <path d="M-10 52Q100 72 200 56T410 50" fill="none" stroke="#f4f5f7" strokeOpacity=".25" strokeWidth="1.5" />
          {[18, 60, 102, 144, 186, 228, 270, 312, 354, 396].map((x, k) => (
            <circle key={x} cx={x} cy={56 + Math.sin(k) * 6} r="3" fill={k % 3 ? LUZ : acento} opacity=".9" />
          ))}
          {[[4, 112], [138, 120], [262, 108]].map(([x, y]) => (
            <g key={x}>
              <rect x={x + 6} y={y + 16} width="112" height={176 - y - 16} fill={CERCA} />
              <Toldo x={x} y={y} w={124} acento={acento} />
              <rect x={x + 14} y={y + 34} width="96" height="12" rx="2" fill={acento} opacity=".35" />
              {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + 26 + k * 24} cy={y + 40} r="5" fill={k % 2 ? "#e07a3f" : "#7fb069"} opacity=".8" />)}
            </g>
          ))}
          <Farol x={128} y={92} id={id} />
          <Farol x={254} y={84} id={id} />
          <path d="M128 95V176M254 87V176" stroke={CERCA} strokeWidth="4" />
        </>
      ),
    };
  }
  if (tema === "despacho") {
    return {
      lejos: (
        <>
          {[[0, 70, 46], [50, 40, 38], [92, 86, 52], [150, 30, 40], [194, 60, 60], [258, 20, 36], [298, 74, 50], [352, 46, 48]].map(([x, y, w], k) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={176 - y} fill={LEJOS} />
              <Ventanas x={x + 6} y={y + 8} cols={Math.floor((w - 6) / 11)} filas={Math.floor((176 - y - 16) / 14)} dy={14} acento={acento} semilla={k} op={0.5} />
            </g>
          ))}
        </>
      ),
      cerca: (
        <>
          <rect x="0" y="0" width="400" height="34" fill={CERCA} opacity=".9" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <rect key={k} x={k * 50 + 4} y="34" width="42" height="10" fill={acento} opacity=".55" />)}
          <rect x="226" y="126" width="174" height="12" fill={CERCA} />
          <path d="M240 138v38M386 138v38" stroke={CERCA} strokeWidth="6" />
          {[0, 1, 2, 3].map((k) => <rect key={k} x={250 + k * 16} y={102} width="12" height="24" rx="2" fill={k % 2 ? acento : "#f4ead2"} opacity={k % 2 ? 0.85 : 0.6} />)}
          <path d="M340 126l18-34h14" fill="none" stroke={CERCA} strokeWidth="4" />
          <path d="M360 86h26l-6 12h-14Z" fill={acento} opacity=".9" />
          <Farol x={373} y={102} r={30} id={id} />
          <rect x="0" y="150" width="120" height="26" fill={CERCA} />
          <rect x="10" y="140" width="30" height="10" rx="2" fill={acento} opacity=".7" />
        </>
      ),
    };
  }
  if (tema === "hacienda") {
    return {
      lejos: (
        <>
          <path d="M40 66L200 20L360 66Z" fill={LEJOS} />
          <rect x="40" y="66" width="320" height="12" fill={LEJOS} />
          {[56, 98, 140, 182, 224, 266, 308, 340].map((x) => <rect key={x} x={x} y="80" width="14" height="96" fill={LEJOS} opacity=".9" />)}
          <circle cx="200" cy="48" r="9" fill={LUZ} opacity=".55" />
          <Ventanas x={76} y={96} cols={4} filas={2} dx={42} dy={26} w={10} h={14} acento={acento} semilla={2} op={0.5} />
        </>
      ),
      cerca: (
        <>
          {[0, 1, 2, 3].map((k) => <rect key={k} x={20 + k * 10} y={176 - (k + 1) * 8} width={360 - k * 20} height="8" fill={CERCA} />)}
          <path d="M18 176V50" stroke={CERCA} strokeWidth="4" />
          <path d="M20 52h46l-8 12 8 12H20Z" fill={acento} opacity=".9" />
          <path d="M382 176V50" stroke={CERCA} strokeWidth="4" />
          <path d="M380 52h-46l8 12-8 12h38Z" fill={acento} opacity=".9" />
          <Farol x={110} y={118} id={id} />
          <Farol x={290} y={118} id={id} />
          <path d="M110 121v23M290 121v23" stroke={CERCA} strokeWidth="4" />
        </>
      ),
    };
  }
  if (tema === "boveda") {
    return {
      lejos: (
        <>
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M${10 + k * 98} 176V80a40 40 0 0 1 80 0v96Z`} fill={LEJOS} />
          ))}
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={50 + k * 98} cy="84" r="5" fill={LUZ} opacity=".5" />)}
        </>
      ),
      cerca: (
        <>
          <circle cx="300" cy="104" r="64" fill={CERCA} />
          <circle cx="300" cy="104" r="52" fill="none" stroke={acento} strokeWidth="5" opacity=".85" />
          <circle cx="300" cy="104" r="16" fill={acento} opacity=".7" />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k * Math.PI) / 3;
            return <path key={k} d={`M${300 + Math.cos(a) * 18} ${104 + Math.sin(a) * 18}L${300 + Math.cos(a) * 44} ${104 + Math.sin(a) * 44}`} stroke={acento} strokeWidth="4" opacity=".7" />;
          })}
          {[0, 1, 2].map((f) => [0, 1, 2 - f].slice(0, 3 - f).map((c) => (
            <path key={`${f}-${c}`} d={`M${24 + c * 34 + f * 17} ${168 - f * 14}h30l-5 -12h-20Z`} fill={acento} opacity={0.9 - f * 0.1} />
          )))}
          <Farol x={170} y={60} r={26} id={id} />
          <path d="M170 20v37" stroke={CERCA} strokeWidth="3" />
        </>
      ),
    };
  }
  /* puerto */
  return {
    lejos: (
      <>
        <rect x="0" y="132" width="400" height="44" fill={LEJOS} opacity=".7" />
        <path d="M40 132V40h6v92M46 44h70v6H46M100 50v30" stroke={LEJOS} strokeWidth="5" fill="none" />
        <path d="M250 132V30h6v102M256 34h80v6h-80M318 40v36" stroke={LEJOS} strokeWidth="5" fill="none" />
        <circle cx="43" cy="36" r="4" fill={LUZ} opacity=".8" />
        <circle cx="253" cy="26" r="4" fill={LUZ} opacity=".8" />
        {[30, 120, 210, 330].map((x) => <rect key={x} x={x} y="140" width="22" height="3" fill={LUZ} opacity=".45" />)}
      </>
    ),
    cerca: (
      <>
        {[[8, 140, 0], [72, 140, 1], [40, 112, 2], [230, 140, 3], [294, 140, 4], [262, 112, 5], [326, 112, 6]].map(([x, y, k]) => (
          <g key={k}>
            <rect x={x} y={y} width="60" height="28" rx="2" fill={k % 3 === 0 ? acento : k % 3 === 1 ? "#3d6f9e" : "#c9973f"} opacity=".85" />
            {[1, 2, 3, 4, 5].map((r) => <path key={r} d={`M${x + r * 10} ${y + 3}v22`} stroke={CERCA} strokeOpacity=".35" strokeWidth="2" />)}
          </g>
        ))}
        <path d="M140 74l46-8 8-14 8 12 40-6-38 14 6 16-12-14Z" fill="#f4f5f7" opacity=".55" />
        <Farol x={196} y={120} id={id} />
        <path d="M196 123v53" stroke={CERCA} strokeWidth="4" />
      </>
    ),
  };
}

function Siluetas({ tema, acento }) {
  const id = `da26-esc-${tema}`;
  const { lejos, cerca } = capas(tema, acento, id);
  return (
    <>
      <svg className="da26-escena-fondo da26-escena-lejos" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" data-capa="lejos">
        {lejos}
      </svg>
      <svg className="da26-escena-fondo da26-escena-cerca" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false" data-capa="cerca">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0" stopColor={LUZ} stopOpacity=".55" />
            <stop offset="1" stopColor={LUZ} stopOpacity="0" />
          </radialGradient>
        </defs>
        {cerca}
        <rect x="-20" y="176" width="440" height="24" fill="#000" opacity=".35" />
      </svg>
    </>
  );
}

/* Los telones ilustrados de cada tema (public/macro2026/fondos/<tema>.webp,
   1280 × 714). El 40 % izquierdo es azul oscuro y vacío; el detalle está a la
   derecha, así que la imagen se ancla a la derecha y a 320 px sigue viéndose.
   Mientras carga se ve el degradado de la hora (el mismo azul del lado
   izquierdo): la franja no cambia de alto porque la imagen es absoluta. */
const R_FONDOS = "/macro2026/fondos/";
export const FONDOS_TEMA = {
  plaza: `${R_FONDOS}plaza.webp`,
  despacho: `${R_FONDOS}despacho.webp`,
  hacienda: `${R_FONDOS}hacienda.webp`,
  boveda: `${R_FONDOS}boveda.webp`,
  puerto: `${R_FONDOS}puerto.webp`,
};

export const CSS_ESCENA = `
.da26-escena { position: relative; isolation: isolate; overflow: hidden; margin: -12px -12px 12px; padding: 12px 12px 10px; border-bottom: 1px solid var(--da26-acento); color: #f4f5f7; }
@media (min-width: 400px) { .da26-escena { margin: -16px -16px 14px; padding: 14px 16px 10px; } }
.da26-escena-fondo { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; }
/* Parallax: las dos capas derivan a velocidades distintas (más ancha que la
   franja para que nunca se vea el borde). */
.da26-escena-lejos, .da26-escena-cerca { left: -24px; width: calc(100% + 48px); }
.da26-escena-lejos { animation: da26-deriva 26s ease-in-out infinite alternate; }
.da26-escena-cerca { animation: da26-deriva 26s ease-in-out infinite alternate; --da26-deriva: 18px; }
@keyframes da26-deriva { from { transform: translateX(calc(-1 * var(--da26-deriva, 7px))); } to { transform: translateX(var(--da26-deriva, 7px)); } }
.da26-escena-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: right center; z-index: -2; }
/* Velo ligero de izquierda a derecha (.45 → .18 → 0) y un poco de sombra
   abajo: la ilustración se ve. El AA no depende del velo: cada texto de la
   franja (TU PAPEL, el contexto, el rótulo de la mascota) va en su placa. */
.da26-escena-velo { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(8, 16, 30, .45) 0%, rgba(8, 16, 30, .18) 50%, rgba(8, 16, 30, 0) 100%), linear-gradient(0deg, rgba(8, 16, 30, .35), transparent 40%); }
/* La franja completa gana unos 24 px de ilustración arriba (a 375 medía 239;
   a 320 ya pasa de 380 y esto no cambia nada). La compacta no se toca. */
.da26-escena[data-compacto="0"] { display: flex; flex-direction: column; justify-content: flex-end; min-height: 262px; }
/* El rótulo de la mascota, en su placa oscura: legible sobre cualquier fondo. */
.da26-escena figcaption { opacity: 1 !important; padding: 0 6px; max-width: 152px !important; border-radius: 6px; background: rgba(8, 16, 30, .88); }
.da26-escena[data-compacto="0"] figcaption { padding: 2px 6px; }
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
@media (prefers-reduced-motion: reduce) { .da26-escena-entra, .da26-escena-lejos, .da26-escena-cerca { animation: none; } }
`;

/**
 * La franja de escena. `mascota` = { id, pose } (MascotaRol) o `escena` = id
 * de INTERACCIONES (varias mascotas). `mini` = el mini contexto de la ronda
 * (modo compacto), con un `etiqueta` opcional antes («Noticia de hoy:») y
 * `datos` (atributos data-* del texto, para las pruebas de cada pieza).
 * `fondo`: por defecto el telón ilustrado del tema (FONDOS_TEMA), con
 * object-fit cover anclado a la derecha y un velo oscuro encima; una url lo
 * cambia y `false` deja las siluetas en dos capas.
 */
export function Escenario({ tema = "plaza", hora = "dia", lado = "izq", mascota = null, escena = null, rol = null, contexto = null,
  compacto = false, mini = null, etiqueta = null, datos = null, fondo = null }) {
  const T = TEMAS_ESCENA[tema] ?? TEMAS_ESCENA.plaza;
  const [arriba, abajo] = HORAS[hora] ?? HORAS.dia;
  const alto = compacto ? ALTO_COMPACTO : ALTO_ESCENA;
  const texto = compacto ? mini : contexto;
  const imagen = fondo === false ? null : fondo ?? FONDOS_TEMA[tema] ?? null;
  return (
    <section className="da26-escena" data-escenario data-tema={tema} data-hora={hora} data-lado={lado} data-compacto={compacto ? "1" : "0"}
      aria-label={T.nombre} style={{ "--da26-acento": T.acento, background: `linear-gradient(180deg, ${arriba}, ${abajo})` }}>
      {imagen
        ? <><img className="da26-escena-img" src={imagen} alt="" aria-hidden="true" loading="lazy" decoding="async" width="1280" height="714" data-fondo-img /><div className="da26-escena-velo" aria-hidden="true" /></>
        : <Siluetas tema={tema} acento={T.acento} />}
      <div className="da26-escena-cuerpo">
        {/* Sin mascota (`mascota: null`): la pieza ya tiene varias en el cuerpo. */}
        {(escena || mascota) && (
          <div className="da26-escena-mascota da26-escena-entra" data-escena-alto={alto}>
            {escena
              ? <EscenaMascotas id={escena} alto={alto} perezosa={false} />
              : <MascotaRol id={mascota.id} pose={mascota.pose} alto={alto} corto={compacto} />}
          </div>
        )}
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
