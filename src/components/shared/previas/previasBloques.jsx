import { Lamina, Renglones, C } from "./previasComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS GESTOS DE LOS QUINCE DE LA 0030. Mismas reglas que los otros: el gesto
 * es lo que hace el estudiante, sin texto, sin coral.
 *
 * Van en un módulo aparte, no repartidos por tema, porque la mitad son
 * COMPARTIDOS a propósito: los tres Memoramas, las tres primeras
 * clasificaciones y las tres parejas de Demanda Agregada y Política Fiscal
 * (reparto de actores, efecto protégé, frontera de señales). Misma mecánica,
 * mismo gesto: inventar una diferencia de movimiento sería inventar una
 * diferencia que la actividad no tiene. Lo que las separa es el icono.
 *
 * Los seis de Cimientos no traían gesto en la ficha. Los diseñé con la regla
 * de siempre:
 *
 *   Memorama              dos cartas se voltean, se reconocen (luz teal) y
 *                         vuelven. El tablero tiene el tamaño real de cada
 *                         uno —12, 8 o 6 cartas—: eso sí es verdad de cada
 *                         actividad y no hace falta inventarlo.
 *   Primera clasificación una tarjeta ESPERA quieta —no hay reloj, y no cae
 *                         como en Diagnóstico o el Clasificador— y después va
 *                         a su categoría, que se enciende y se queda con una
 *                         marca. Las categorías tienen la forma del icono:
 *                         puertas, etiquetas o bandejas, y su número real.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────────────────── Memorama ─────────────────────────── */

function Memorama({ id, columnas, filas, a, b }) {
  const hueco = 4;
  const w = (104 - (columnas - 1) * hueco) / columnas;
  const h = (74 - (filas - 1) * hueco) / filas;
  const pos = (k) => ({ x: 8 + (k % columnas) * (w + hueco), y: 8 + Math.floor(k / columnas) * (h + hueco) });
  const seg = 2.6;
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-dorso-a { 0% { transform: scaleX(1); } 8%, 78% { transform: scaleX(0); } 86%, 100% { transform: scaleX(1); } }
@keyframes fae-pv-${id}-frente-a { 0%, 8% { transform: scaleX(0); } 16%, 72% { transform: scaleX(1); } 78%, 100% { transform: scaleX(0); } }
@keyframes fae-pv-${id}-dorso-b { 0%, 26% { transform: scaleX(1); } 34%, 78% { transform: scaleX(0); } 86%, 100% { transform: scaleX(1); } }
@keyframes fae-pv-${id}-frente-b { 0%, 34% { transform: scaleX(0); } 42%, 72% { transform: scaleX(1); } 78%, 100% { transform: scaleX(0); } }
@keyframes fae-pv-${id}-pareja { 0%, 44% { stroke: ${C.hueco}; } 50%, 72% { stroke: ${C.luz}; } 78%, 100% { stroke: ${C.hueco}; } }
.fae-pv-${id}-dorso-a { animation: fae-pv-${id}-dorso-a ${seg}s linear infinite; }
.fae-pv-${id}-frente-a { animation: fae-pv-${id}-frente-a ${seg}s linear infinite, fae-pv-${id}-pareja ${seg}s linear infinite; }
.fae-pv-${id}-dorso-b { animation: fae-pv-${id}-dorso-b ${seg}s linear infinite; }
.fae-pv-${id}-frente-b { animation: fae-pv-${id}-frente-b ${seg}s linear infinite, fae-pv-${id}-pareja ${seg}s linear infinite; }
`}
    >
      {Array.from({ length: columnas * filas }, (_, k) => {
        const { x, y } = pos(k);
        const cual = k === a ? "a" : k === b ? "b" : null;
        return (
          <g key={k}>
            <rect className={cual ? `fae-pv-${id}-dorso-${cual}` : undefined} x={x} y={y} width={w} height={h} rx="3" fill={C.tarjeta} stroke={C.borde} />
            {cual && (
              <g className={`fae-pv-${id}-frente-${cual}`}>
                <rect x={x} y={y} width={w} height={h} rx="3" fill={C.fondo} stroke={C.hueco} strokeWidth="1.6" />
                <Renglones x={x + w * 0.22} y={y + h * 0.4} anchos={[w * 0.56, w * 0.36]} grosor={2} paso={Math.min(6, h * 0.22)} />
              </g>
            )}
          </g>
        );
      })}
    </Lamina>
  );
}

/* ─────────────────────── Primera clasificación ─────────────────────── */

/* La forma de cada categoría, la del icono de su actividad. */
function Categoria({ forma, x, w, clase }) {
  const y = 60;
  const h = 24;
  const comun = { className: clase, fill: "none", stroke: C.hueco, strokeWidth: 1.8, strokeLinejoin: "round" };
  if (forma === "puerta") return <path {...comun} d={`M${x} ${y + h}V${y + 7}a${w / 2} ${w / 2 * 0.6} 0 0 1 ${w} 0V${y + h}Z`} />;
  if (forma === "etiqueta") return <path {...comun} d={`M${x} ${y + 4}h${w - 7}l7 8-7 8h-${w - 7}Z`} />;
  return <path {...comun} d={`M${x} ${y + 4}l2 ${h - 6}h${w - 4}l2-${h - 6}`} />;
}

function Clasificacion({ id, forma, categorias, destino }) {
  const hueco = categorias === 3 ? 8 : 5;
  const w = (104 - (categorias - 1) * hueco) / categorias;
  const xs = Array.from({ length: categorias }, (_, k) => 8 + k * (w + hueco));
  const cx = xs[destino] + w / 2;
  const seg = 2.4;
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-tarjeta {
  0% { transform: translate(0, 0) scale(1); opacity: 0; } 6% { opacity: 1; }
  42% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(.4,0,.2,1); }
  66% { transform: translate(${cx - 60}px, 50px) scale(.35); opacity: 1; } 72%, 100% { transform: translate(${cx - 60}px, 50px) scale(.35); opacity: 0; }
}
@keyframes fae-pv-${id}-luz { 0%, 60% { stroke: ${C.hueco}; } 66%, 90% { stroke: ${C.luz}; } 96%, 100% { stroke: ${C.hueco}; } }
@keyframes fae-pv-${id}-marca { 0%, 66% { opacity: 0; } 70%, 92% { opacity: 1; } 100% { opacity: 0; } }
.fae-pv-${id}-tarjeta { animation: fae-pv-${id}-tarjeta ${seg}s linear infinite; }
.fae-pv-${id}-luz { animation: fae-pv-${id}-luz ${seg}s linear infinite; }
.fae-pv-${id}-marca { animation: fae-pv-${id}-marca ${seg}s linear infinite; }
`}
    >
      <g className={`fae-pv-${id}-tarjeta`}>
        <rect x="36" y="12" width="48" height="24" rx="4" fill={C.tarjeta} stroke="rgba(248,249,250,0.4)" />
        <Renglones x={42} y={20} anchos={[34, 24]} />
      </g>
      {xs.map((x, k) => (
        <Categoria key={x} forma={forma} x={x} w={w} clase={k === destino ? `fae-pv-${id}-luz` : undefined} />
      ))}
      <circle className={`fae-pv-${id}-marca`} cx={cx} cy="77" r="2.6" fill={C.luz} />
    </Lamina>
  );
}

/* ─────────────────────── ¿Se acerca o se aleja? ─────────────────────── */

/* La aguja va del centro a la meta en 0,6 s, se queda, y vuelve al centro apagándose en 0,3 s. */
function SeAcerca() {
  return (
    <Lamina
      id="se-acerca-o-se-aleja"
      css={`
@keyframes fae-pv-sa-aguja {
  0% { transform: rotate(0deg); opacity: 1; animation-timing-function: cubic-bezier(.3,.8,.4,1); }
  37.5% { transform: rotate(56deg); opacity: 1; } 81% { transform: rotate(56deg); opacity: 1; }
  100% { transform: rotate(0deg); opacity: .35; }
}
.fae-pv-sa-g .fae-pv-sa-aguja { transform-box: view-box; transform-origin: 60px 72px; animation: fae-pv-sa-aguja 1.6s linear infinite; }
`}
    >
      <g className="fae-pv-sa-g">
        <path d="M22 72 A38 38 0 0 1 98 72" fill="none" stroke={C.hueco} strokeWidth="5" strokeLinecap="round" />
        <path d="M96 30 V16 L106 20 L96 24" fill="none" stroke={C.luz} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="94" cy="36" r="3.5" fill={C.luz} />
        <path className="fae-pv-sa-aguja" d="M60 72 V38" stroke={C.texto} strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="72" r="5" fill={C.texto} />
      </g>
    </Lamina>
  );
}

/* ─────────────────────── El expediente del gabinete ─────────────────────── */

/*
 * La carpeta se entreabre (0,4 s), asoma el borde del papel y se cierra
 * (0,4 s). Es la ficha de pedagogía, y ROMPE UNA REGLA QUE YA TENÍAMOS:
 * Biopsia y El agujero fiscal —también un caso y una decisión— se quedaron
 * quietas porque no hay un gesto repetido que animar. Abrir el expediente es
 * leer el caso, que sí es algo que el estudiante hace; se hizo como pide la
 * ficha y queda señalado para que pedagogía decida si las tres van igual.
 */
function Gabinete() {
  return (
    <Lamina
      id="expediente-gabinete"
      css={`
@keyframes fae-pv-eg-tapa { 0%, 8% { transform: skewX(0deg) scaleY(1); } 33%, 58% { transform: skewX(-14deg) scaleY(.72); } 83%, 100% { transform: skewX(0deg) scaleY(1); } }
@keyframes fae-pv-eg-papel { 0%, 8% { transform: translateY(0); } 33%, 58% { transform: translateY(-9px); } 83%, 100% { transform: translateY(0); } }
.fae-pv-eg-g .fae-pv-eg-tapa { transform-box: view-box; transform-origin: 60px 78px; animation: fae-pv-eg-tapa 1.6s ease-in-out infinite; }
.fae-pv-eg-papel { animation: fae-pv-eg-papel 1.6s ease-in-out infinite; }
`}
    >
      <g className="fae-pv-eg-g">
        <path d="M22 26 h26 l6 6 h44 v46 h-76 z" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" strokeLinejoin="round" />
        <g className="fae-pv-eg-papel">
          <rect x="30" y="34" width="60" height="40" rx="2" fill={C.papel} />
          <Renglones x={36} y={40} anchos={[40, 30]} color="rgba(29,53,87,0.45)" />
        </g>
        <path className="fae-pv-eg-tapa" d="M22 40 h76 v38 h-76 z" fill={C.tarjeta} stroke={C.trazo} strokeWidth="1.8" strokeLinejoin="round" />
      </g>
    </Lamina>
  );
}

/* ─────────────────────── El consejo de ministros ─────────────────────── */

/* Dos siluetas a los lados de la mesa: una se inclina hacia delante mientras la otra se retira; luego al revés. */
function Silueta({ x, clase }) {
  return (
    <g className={clase}>
      <circle cx={x} cy="34" r="8" fill={C.silueta} />
      <path d={`M${x - 14} 66 C${x - 14} 48, ${x + 14} 48, ${x + 14} 66 Z`} fill={C.silueta} />
    </g>
  );
}

function Consejo() {
  return (
    <Lamina
      id="consejo-ministros"
      css={`
@keyframes fae-pv-cm-i { 0% { transform: translateX(0) scale(1); opacity: 1; } 25%, 45% { transform: translateX(7px) scale(1.08); opacity: 1; } 50% { transform: translateX(0) scale(1); } 75%, 95% { transform: translateX(-4px) scale(.9); opacity: .55; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
@keyframes fae-pv-cm-d { 0% { transform: translateX(0) scale(1); opacity: 1; } 25%, 45% { transform: translateX(4px) scale(.9); opacity: .55; } 50% { transform: translateX(0) scale(1); opacity: 1; } 75%, 95% { transform: translateX(-7px) scale(1.08); opacity: 1; } 100% { transform: translateX(0) scale(1); } }
.fae-pv-cm-i { animation: fae-pv-cm-i 2s ease-in-out infinite; }
.fae-pv-cm-d { animation: fae-pv-cm-d 2s ease-in-out infinite; }
`}
    >
      {/* La tercera silla, vacía, al fondo. */}
      <rect x="52" y="10" width="16" height="14" rx="3" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="3 2.5" />
      <Silueta x={26} clase="fae-pv-cm-i" />
      <Silueta x={94} clase="fae-pv-cm-d" />
      <rect x="36" y="58" width="48" height="16" rx="4" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" />
    </Lamina>
  );
}

/* ─────────────────── Reparto de actores (DA y PF, Medio) ─────────────────── */

/*
 * Una silueta va del centro a GANA (0,5 s); la siguiente, a PIERDE. Alterna.
 * Es la misma mecánica que ¿Quién gana, quién pierde? y el gesto se le
 * parece por eso; lo que cambia es lo que se mueve —una persona, no una
 * tarjeta— y las zonas llevan su flecha, arriba o abajo, como forma.
 */
function Reparto({ id }) {
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-a { 0% { transform: translateX(0); opacity: 0; } 5% { opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); } 25%, 45% { transform: translateX(-40px); opacity: 1; } 50%, 100% { transform: translateX(-40px); opacity: 0; } }
@keyframes fae-pv-${id}-b { 0%, 50% { transform: translateX(0); opacity: 0; } 55% { opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); } 75%, 95% { transform: translateX(40px); opacity: 1; } 100% { transform: translateX(40px); opacity: 0; } }
.fae-pv-${id}-a { animation: fae-pv-${id}-a 2s linear infinite; }
.fae-pv-${id}-b { animation: fae-pv-${id}-b 2s linear infinite; }
`}
    >
      <rect x="4" y="14" width="36" height="62" rx="8" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <rect x="80" y="14" width="36" height="62" rx="8" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <path d="M22 30 V20 M17 25 L22 20 L27 25" fill="none" stroke={C.hueco} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M98 20 V30 M93 25 L98 30 L103 25" fill="none" stroke={C.hueco} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {["a", "b"].map((k) => (
        <g key={k} className={`fae-pv-${id}-${k}`}>
          <circle cx="60" cy="44" r="7" fill={C.silueta} />
          <path d="M48 70 C48 55, 72 55, 72 70 Z" fill={C.silueta} />
        </g>
      ))}
    </Lamina>
  );
}

/* ─────────────────── Explícaselo (DA y PF, Difícil) ─────────────────── */

/* Cuatro fragmentos sueltos se ordenan en una fila, uno a uno, 0,4 s cada uno. */
const SUELTOS = [
  { x: 14, y: 12, giro: -12 },
  { x: 70, y: 8, giro: 9 },
  { x: 40, y: 30, giro: -6 },
  { x: 84, y: 34, giro: 14 },
];

function Explicale({ id }) {
  const seg = 2.4;
  const tramo = 0.4 / seg * 100;
  return (
    <Lamina
      id={id}
      css={SUELTOS.map((s, k) => {
        const fin = { x: 7.5 + k * 27, y: 64 };
        const i = (k * tramo).toFixed(1);
        const f = ((k + 1) * tramo).toFixed(1);
        return `
@keyframes fae-pv-${id}-f${k} {
  0%, ${i}% { transform: translate(0, 0) rotate(${s.giro}deg); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  ${f}%, 90% { transform: translate(${fin.x - s.x}px, ${fin.y - s.y}px) rotate(0deg); opacity: 1; }
  100% { transform: translate(${fin.x - s.x}px, ${fin.y - s.y}px) rotate(0deg); opacity: 0; }
}
.fae-pv-${id}-f${k} { animation: fae-pv-${id}-f${k} ${seg}s linear infinite; }`;
      }).join("")}
    >
      <path d="M6 82 H114" stroke={C.hueco} strokeWidth="1.4" strokeDasharray="3 3" />
      {SUELTOS.map((s, k) => (
        <rect key={k} className={`fae-pv-${id}-f${k}`} x={s.x} y={s.y} width="24" height="11" rx="3" fill={C.silueta} />
      ))}
    </Lamina>
  );
}

/* ─────────────────── Frontera de señales (DA y PF, Experto) ─────────────────── */

/*
 * Catorce puntos apagados —los catorce datos de la actividad— y un círculo de
 * foco que pasa por encima encendiendo dos o tres (0,6 s), y se apaga.
 */
const PUNTOS = [
  [16, 20], [34, 14], [52, 24], [70, 12], [88, 22], [104, 14], [24, 40],
  [44, 46], [62, 38], [80, 48], [100, 40], [18, 66], [58, 68], [96, 70],
];
/* Los que el foco enciende a su paso, y en qué momento del bucle. */
const ENCIENDE = { 7: 14, 8: 24, 10: 33 };

function Frontera({ id }) {
  const seg = 1.8;
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-foco { 0% { transform: translate(0, 0); opacity: 0; } 6% { opacity: 1; animation-timing-function: cubic-bezier(.4,0,.4,1); } 33% { transform: translate(56px, -6px); opacity: 1; } 60% { transform: translate(56px, -6px); opacity: 1; } 78%, 100% { transform: translate(56px, -6px); opacity: 0; } }
.fae-pv-${id}-foco { animation: fae-pv-${id}-foco ${seg}s linear infinite; }
${Object.entries(ENCIENDE).map(([k, t]) => `
@keyframes fae-pv-${id}-p${k} { 0%, ${t}% { fill: ${C.hueco}; } ${t + 3}%, 70% { fill: ${C.luz}; } 80%, 100% { fill: ${C.hueco}; } }
.fae-pv-${id}-p${k} { animation: fae-pv-${id}-p${k} ${seg}s linear infinite; }`).join("")}
`}
    >
      {PUNTOS.map(([x, y], k) => (
        <circle key={k} className={ENCIENDE[k] !== undefined ? `fae-pv-${id}-p${k}` : undefined} cx={x} cy={y} r="3.4" fill={C.hueco} />
      ))}
      <circle className={`fae-pv-${id}-foco`} cx="44" cy="46" r="14" fill="none" stroke={C.luz} strokeWidth="2.4" />
    </Lamina>
  );
}

const GESTOS = {
  "memorama-tesoro": () => <Memorama id="memorama-tesoro" columnas={4} filas={3} a={1} b={6} />,
  "memorama-corazon": () => <Memorama id="memorama-corazon" columnas={4} filas={2} a={1} b={6} />,
  "memorama-tesoreria": () => <Memorama id="memorama-tesoreria" columnas={3} filas={2} a={0} b={4} />,
  "que-rama-es": () => <Clasificacion id="que-rama-es" forma="puerta" categorias={4} destino={2} />,
  "cual-componente": () => <Clasificacion id="cual-componente" forma="etiqueta" categorias={4} destino={1} />,
  "cobra-gasta-o-pide": () => <Clasificacion id="cobra-gasta-o-pide" forma="bandeja" categorias={3} destino={1} />,
  "se-acerca-o-se-aleja": SeAcerca,
  "expediente-gabinete": Gabinete,
  "consejo-ministros": Consejo,
  "quien-beneficia-auge": () => <Reparto id="quien-beneficia-auge" />,
  "quien-afecta-ajuste": () => <Reparto id="quien-afecta-ajuste" />,
  "explica-paciente": () => <Explicale id="explica-paciente" />,
  "explica-contribuyente": () => <Explicale id="explica-contribuyente" />,
  "sala-espera-llena": () => <Frontera id="sala-espera-llena" />,
  "comite-presupuesto": () => <Frontera id="comite-presupuesto" />,
};

export default function PreviasBloques({ actividadId }) {
  const Gesto = GESTOS[actividadId];
  return Gesto ? <Gesto /> : null;
}
