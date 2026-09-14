import { Lamina, Renglones, C } from "./previasComun.jsx";
import { IconoMecanismo } from "../../mecanicas/tesoreria/tesoreria.jsx";

/* Política Fiscal. El agujero fiscal se queda quieto: ver su razón en PreviaActividad.jsx. */

/*
 * La caída de papel del Clasificador y de Déficit vs deuda: el papel baja
 * por la máquina hacia la línea de archivo, una bandeja se enciende y el
 * papel entra en ella. Las bandejas van en blanco —sin el color de cada
 * instrumento—: una previsualización no dice cuál es la buena.
 */
function Caida({ id, bandejas, segundos, bandeja }) {
  const ancho = bandejas === 3 ? 32 : 24;
  const hueco = (104 - bandejas * ancho) / (bandejas - 1);
  const xs = Array.from({ length: bandejas }, (_, k) => 8 + k * (ancho + hueco));
  const destino = xs[bandeja] + ancho / 2;
  /* Más bandejas y más prisa: el Déficit cae antes y entra antes. */
  const [fin, toque, entra] = bandejas === 3 ? [55, 62, 80] : [36, 42, 58];
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-cae {
  0% { transform: translate(0, 0) scale(1); opacity: 0; } 5% { transform: translate(0, 1px) scale(1); opacity: 1; }
  ${fin}%, ${toque}% { transform: translate(0, 16px) scale(1); opacity: 1; }
  ${entra}% { transform: translate(${destino - 60}px, 56px) scale(.45); opacity: 0; } 100% { transform: translate(${destino - 60}px, 56px) scale(.45); opacity: 0; }
}
.fae-pv-${id}-papel { animation: fae-pv-${id}-cae ${segundos}s linear infinite; }
@keyframes fae-pv-${id}-toque { 0%, ${fin - 2}% { stroke: ${C.hueco}; } ${fin + 1}%, ${entra}% { stroke: ${C.luz}; } ${entra + 6}%, 100% { stroke: ${C.hueco}; } }
.fae-pv-${id}-bandeja { animation: fae-pv-${id}-toque ${segundos}s linear infinite; }
`}
    >
      <rect x="8" y="4" width="104" height="56" rx="8" fill={C.fondo} stroke={C.borde} />
      <path d="M12 51 H108" stroke={C.trazo} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" />
      <g className={`fae-pv-${id}-papel`}>
        <rect x="36" y="9" width="48" height="22" rx="3" fill={C.papel} />
        <Renglones x={42} y={16} anchos={[34, 24]} color="rgba(29,53,87,0.45)" />
      </g>
      {xs.map((x, k) => (
        <g key={x}>
          <rect className={k === bandeja ? `fae-pv-${id}-bandeja` : undefined} x={x} y="66" width={ancho} height="18" rx="4" fill="none" stroke={C.hueco} strokeWidth="1.8" />
          {bandejas === 3 && (
            <g transform={`translate(${x + ancho / 2 - 6} 69)`}>
              <IconoMecanismo id={["tributacion", "gasto", "deuda"][k]} color="rgba(248,249,250,0.6)" tam={12} />
            </g>
          )}
        </g>
      ))}
    </Lamina>
  );
}

/* PROPIA. Se elige un sello y el sello cae sobre el documento: el golpe de la mesa de sellos. */
function Directos() {
  return (
    <Lamina
      id="directos-indirectos"
      css={`
@keyframes fae-pv-di-sello {
  0%, 18% { transform: rotate(-8deg) scale(1.6); opacity: 0; }
  20% { transform: rotate(-8deg) scale(1.6); opacity: 1; animation-timing-function: cubic-bezier(.3,1.4,.5,1); }
  36%, 88% { transform: rotate(-8deg) scale(1); opacity: 1; } 100% { transform: rotate(-8deg) scale(1); opacity: 0; }
}
.fae-pv-di-sello { animation: fae-pv-di-sello 1.4s linear infinite; }
@keyframes fae-pv-di-golpe { 0%, 34% { transform: none; } 37% { transform: translateY(1.5px); } 42%, 100% { transform: none; } }
.fae-pv-di-papel { animation: fae-pv-di-golpe 1.4s linear infinite; }
@keyframes fae-pv-di-toque { 0%, 4% { stroke: ${C.hueco}; } 8%, 20% { stroke: ${C.luz}; } 26%, 100% { stroke: ${C.hueco}; } }
.fae-pv-di-boton { animation: fae-pv-di-toque 1.4s linear infinite; }
`}
    >
      <g className="fae-pv-di-papel">
        <rect x="20" y="8" width="80" height="52" rx="4" fill={C.papel} />
        <Renglones x={28} y={19} anchos={[52, 40, 46]} color="rgba(29,53,87,0.4)" paso={7} />
      </g>
      <g className="fae-pv-di-sello">
        <rect x="56" y="38" width="36" height="16" rx="3" fill="none" stroke={C.tinta} strokeWidth="2.6" />
        <path d="M62 46 H86" stroke={C.tinta} strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {[7, 35, 63, 91].map((x, k) => (
        <rect key={x} className={k === 1 ? "fae-pv-di-boton" : undefined} x={x} y="70" width="22" height="12" rx="6" fill="none" stroke={C.hueco} strokeWidth="1.8" />
      ))}
    </Lamina>
  );
}

/*
 * GESTO. Una moneda va en curva del Estado directo a la familia; la
 * siguiente, al bolsillo, que se encoge un poco al recibirla. Alterna. Los
 * dos caminos SON el contenido —Gasto → G directo, Tributación → C
 * indirecto—, así que tienen que verse distintos: el primero en teal y
 * continuo, hacia arriba; el segundo discontinuo, hacia abajo, y es el único
 * donde algo encoge.
 *
 * La curva sale de mover la moneda en dos ejes con curvas distintas: lineal
 * en horizontal, frenando en vertical.
 */
function Flujo() {
  return (
    <Lamina
      id="flujo-de-caja"
      css={`
@keyframes fae-pv-fc-x1 { 0% { transform: translateX(0); opacity: 1; } 37.5% { transform: translateX(56px); opacity: 1; } 44%, 100% { transform: translateX(56px); opacity: 0; } }
@keyframes fae-pv-fc-y1 { 0% { transform: translateY(0); animation-timing-function: cubic-bezier(.2,.7,.4,1); } 37.5%, 100% { transform: translateY(-18px); } }
@keyframes fae-pv-fc-x2 { 0%, 50% { transform: translateX(0); opacity: 0; } 51% { transform: translateX(0); opacity: 1; } 87.5% { transform: translateX(62px); opacity: 1; } 93%, 100% { transform: translateX(62px); opacity: 0; } }
@keyframes fae-pv-fc-y2 { 0%, 50% { transform: translateY(0); animation-timing-function: cubic-bezier(.2,.7,.4,1); } 87.5%, 100% { transform: translateY(18px); } }
@keyframes fae-pv-fc-bolsillo { 0%, 78% { transform: scale(1); } 88%, 97% { transform: scale(.82); } 100% { transform: scale(1); } }
.fae-pv-fc-x1 { animation: fae-pv-fc-x1 1.6s linear infinite; }
.fae-pv-fc-y1 { animation: fae-pv-fc-y1 1.6s linear infinite; }
.fae-pv-fc-x2 { animation: fae-pv-fc-x2 1.6s linear infinite; }
.fae-pv-fc-y2 { animation: fae-pv-fc-y2 1.6s linear infinite; }
.fae-pv-fc-bolsillo { animation: fae-pv-fc-bolsillo 1.6s ease-in-out infinite; }
`}
    >
      {/* El Estado: un frontón con columnas. */}
      <g fill="none" stroke={C.trazo} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M6 36 L20 27 L34 36 Z" />
        <path d="M10 39 V55 M20 39 V55 M30 39 V55 M6 58 H34" />
      </g>
      {/* La familia: una casa con su gente. */}
      <g fill="none" stroke={C.trazo} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M90 22 L101 13 L112 22 V34 H90 Z" />
        <circle cx="97" cy="26" r="1.8" />
        <circle cx="105" cy="27.5" r="1.5" />
      </g>
      {/* El bolsillo, que encoge. */}
      <g className="fae-pv-fc-bolsillo" fill="none" stroke={C.trazo} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M89 59 H113 V69 Q113 81 101 81 Q89 81 89 69 Z" />
        <path d="M89 63.5 H113" strokeDasharray="2 2" />
      </g>
      {/* Los dos caminos, distintos a propósito. */}
      <path d="M38 42 Q62 16 90 26" fill="none" stroke={C.luz} strokeWidth="1.6" opacity="0.55" />
      <path d="M38 48 Q64 76 92 67" fill="none" stroke={C.trazo} strokeWidth="1.6" strokeDasharray="3 3" opacity="0.5" />
      <g className="fae-pv-fc-x1"><circle className="fae-pv-fc-y1" cx="36" cy="44" r="4.5" fill={C.luz} /></g>
      <g className="fae-pv-fc-x2"><circle className="fae-pv-fc-y2" cx="36" cy="49" r="4.5" fill={C.luz} /></g>
    </Lamina>
  );
}

/*
 * GESTO. Dos palancas de la Tesorería, lado a lado: una sube, elegida, y la
 * otra baja; luego al revés. Se parece a Triage porque es la misma mecánica
 * —juicio por parejas—; inventarle otro movimiento sería inventar una
 * diferencia que no existe. La diferencia está en las palancas, no en el gesto.
 */
function Expansiva() {
  const curva = "cubic-bezier(.22,1,.36,1)";
  return (
    <Lamina
      id="expansiva-contractiva"
      css={`
@keyframes fae-pv-ex-i { 0% { transform: translateY(0); animation-timing-function: ${curva}; } 33%, 47% { transform: translateY(-18px); } 50% { transform: translateY(0); animation-timing-function: ${curva}; } 83%, 97% { transform: translateY(18px); } 100% { transform: translateY(0); } }
@keyframes fae-pv-ex-d { 0% { transform: translateY(0); animation-timing-function: ${curva}; } 33%, 47% { transform: translateY(18px); } 50% { transform: translateY(0); animation-timing-function: ${curva}; } 83%, 97% { transform: translateY(-18px); } 100% { transform: translateY(0); } }
.fae-pv-ex-i { animation: fae-pv-ex-i 1.5s linear infinite; }
.fae-pv-ex-d { animation: fae-pv-ex-d 1.5s linear infinite; }
`}
    >
      {/* El panel de la Tesorería, con su rejilla. */}
      <rect x="10" y="6" width="100" height="78" rx="10" fill={C.fondo} stroke={C.borde} />
      <path d="M10 28 H110 M10 50 H110 M10 72 H110 M43 6 V84 M77 6 V84" stroke="rgba(203,220,242,0.06)" />
      {[40, 80].map((x) => (
        <g key={x}>
          <rect x={x - 6} y="14" width="12" height="62" rx="6" fill="#0A1422" stroke={C.hueco} strokeWidth="1.4" />
          <path d={`M${x - 12} 45 h4 M${x + 8} 45 h4`} stroke={C.hueco} strokeWidth="1.4" />
        </g>
      ))}
      <rect className="fae-pv-ex-i" x="28" y="39" width="24" height="12" rx="4" fill={C.silueta} stroke={C.luz} strokeWidth="1.5" />
      <rect className="fae-pv-ex-d" x="68" y="39" width="24" height="12" rx="4" fill={C.silueta} stroke={C.luz} strokeWidth="1.5" />
    </Lamina>
  );
}

/* GESTO. Una pieza sin texto va del banco a la línea vacía de la planilla, y aparece su marca al lado. */
function Disena() {
  return (
    <Lamina
      id="disena-presupuesto"
      css={`
@keyframes fae-pv-dp-pieza {
  0% { transform: translate(0, 0); opacity: 0; } 6% { transform: translate(0, 0); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  36%, 90% { transform: translate(52px, -8px); opacity: 1; } 100% { transform: translate(52px, -8px); opacity: 0; }
}
.fae-pv-dp-pieza { animation: fae-pv-dp-pieza 1.4s linear infinite; }
@keyframes fae-pv-dp-marca { 0%, 36% { stroke-dashoffset: 1; opacity: 1; } 57%, 90% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.fae-pv-dp-marca { animation: fae-pv-dp-marca 1.4s linear infinite; }
`}
    >
      {/* La planilla: tres líneas, la del medio vacía. */}
      <rect x="50" y="10" width="62" height="70" rx="4" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" />
      <path d="M50 22 H112 M100 22 V80" stroke={C.hueco} strokeWidth="1.4" />
      <rect x="56" y="27" width="38" height="10" rx="2.5" fill="rgba(203,220,242,0.45)" />
      <rect x="56" y="43" width="38" height="10" rx="2.5" fill="none" stroke={C.hueco} strokeWidth="1.4" strokeDasharray="3 2.5" />
      <rect x="56" y="59" width="38" height="10" rx="2.5" fill="rgba(203,220,242,0.45)" />
      {/* El banco. */}
      <rect x="6" y="29" width="34" height="10" rx="2.5" fill={C.silueta} opacity="0.6" />
      <rect className="fae-pv-dp-pieza" x="4" y="51" width="38" height="10" rx="2.5" fill={C.silueta} />
      <path className="fae-pv-trazo fae-pv-dp-marca" pathLength="1" d="M102.5 48 l2.8 2.8 5.2-6" fill="none" stroke={C.luz} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </Lamina>
  );
}

const GESTOS = {
  "clasificador-tesoro": () => <Caida id="clasificador-tesoro" bandejas={3} segundos={2} bandeja={0} />,
  "directos-indirectos": Directos,
  "flujo-de-caja": Flujo,
  "expansiva-contractiva": Expansiva,
  "disena-presupuesto": Disena,
  "deficit-vs-deuda": () => <Caida id="deficit-vs-deuda" bandejas={4} segundos={1.6} bandeja={2} />,
};

export default function PreviasFiscal({ actividadId }) {
  const Gesto = GESTOS[actividadId];
  return Gesto ? <Gesto /> : null;
}
