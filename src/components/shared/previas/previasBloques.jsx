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

/*
 * El expediente del gabinete NO tiene gesto aquí, a propósito: es una sola
 * decisión, como Biopsia y El agujero fiscal, y se queda quieta igual que
 * ellas. La razón está escrita en PreviaActividad.jsx.
 */

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

/* Un engranaje de lámina, para el duelo de instrumentos. */
function Engranaje({ x, clase }) {
  const dientes = Array.from({ length: 8 }, (_, k) => {
    const a = (k * Math.PI) / 4;
    return `M${x + Math.cos(a) * 15} ${45 + Math.sin(a) * 15} L${x + Math.cos(a) * 21} ${45 + Math.sin(a) * 21}`;
  }).join(" ");
  return (
    <g className={clase}>
      <circle cx={x} cy={45} r="15" fill={C.silueta} />
      <path d={dientes} stroke={C.silueta} strokeWidth="6" strokeLinecap="round" />
      <circle cx={x} cy={45} r="5" fill={C.fondo} />
    </g>
  );
}

/*
 * El consejo de ministros y el duelo de instrumentos: misma mecánica, mismo
 * gesto —uno se adelanta mientras el otro retrocede (0,5 s) y luego al revés—.
 * Lo que cambia es lo que compite: dos siluetas a la mesa, o dos engranajes.
 */
function Consejo({ id = "consejo-ministros", figura = "silueta" }) {
  return (
    <Lamina
      id={id}
      css={`
@keyframes fae-pv-${id}-i { 0% { transform: translateX(0) scale(1); opacity: 1; } 25%, 45% { transform: translateX(7px) scale(1.08); opacity: 1; } 50% { transform: translateX(0) scale(1); } 75%, 95% { transform: translateX(-4px) scale(.9); opacity: .55; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
@keyframes fae-pv-${id}-d { 0% { transform: translateX(0) scale(1); opacity: 1; } 25%, 45% { transform: translateX(4px) scale(.9); opacity: .55; } 50% { transform: translateX(0) scale(1); opacity: 1; } 75%, 95% { transform: translateX(-7px) scale(1.08); opacity: 1; } 100% { transform: translateX(0) scale(1); } }
.fae-pv-${id}-i { animation: fae-pv-${id}-i 2s ease-in-out infinite; }
.fae-pv-${id}-d { animation: fae-pv-${id}-d 2s ease-in-out infinite; }
`}
    >
      {figura === "silueta" ? (
        <>
          {/* La tercera silla, vacía, al fondo. */}
          <rect x="52" y="10" width="16" height="14" rx="3" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="3 2.5" />
          <Silueta x={26} clase={`fae-pv-${id}-i`} />
          <Silueta x={94} clase={`fae-pv-${id}-d`} />
          <rect x="36" y="58" width="48" height="16" rx="4" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" />
        </>
      ) : (
        <>
          <Engranaje x={34} clase={`fae-pv-${id}-i`} />
          <Engranaje x={86} clase={`fae-pv-${id}-d`} />
          <path d="M20 80 H100" stroke={C.hueco} strokeWidth="1.4" strokeDasharray="3 3" />
        </>
      )}
    </Lamina>
  );
}

/* ═══════════════════════ POLÍTICA MONETARIA (0031) ═══════════════════════ */

/*
 * Una ficha tras otra hacia destinos distintos (0,5 s cada una). ¿Quién decide
 * esto? alterna entre dos edificios; La caja de herramientas va a dos de sus
 * cuatro ranuras. No espera como la primera clasificación: los dos gestos de la
 * ficha piden que la ficha salga ya.
 */
function FichaADestinos({ id, forma, n, destinos, segundos = 2 }) {
  const hueco = n === 2 ? 30 : 5;
  const w = (104 - (n - 1) * hueco) / n;
  const xs = Array.from({ length: n }, (_, k) => 8 + k * (w + hueco));
  const mitad = 100 / destinos.length;
  const viaje = (0.5 / segundos) * 100;
  return (
    <Lamina
      id={id}
      css={destinos.map((d, k) => {
        const i = k * mitad;
        const cx = xs[d] + w / 2;
        return `
@keyframes fae-pv-${id}-f${k} {
  0%, ${i.toFixed(1)}% { transform: translate(0, 0) scale(1); opacity: ${k === 0 ? 1 : 0}; }
  ${(i + 1).toFixed(1)}% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  ${(i + viaje).toFixed(1)}%, ${(i + mitad - 6).toFixed(1)}% { transform: translate(${cx - 60}px, 44px) scale(.5); opacity: 1; }
  ${(i + mitad - 2).toFixed(1)}%, 100% { transform: translate(${cx - 60}px, 44px) scale(.5); opacity: 0; }
}
.fae-pv-${id}-f${k} { animation: fae-pv-${id}-f${k} ${segundos}s linear infinite; }
@keyframes fae-pv-${id}-luz${k} { 0%, ${(i + viaje - 2).toFixed(1)}% { stroke: ${C.hueco}; } ${(i + viaje).toFixed(1)}%, ${(i + mitad - 4).toFixed(1)}% { stroke: ${C.luz}; } ${(i + mitad).toFixed(1)}%, 100% { stroke: ${C.hueco}; } }
.fae-pv-${id}-luz${k} { animation: fae-pv-${id}-luz${k} ${segundos}s linear infinite; }`;
      }).join("")}
    >
      {destinos.map((_, k) => (
        <g key={k} className={`fae-pv-${id}-f${k}`}>
          <rect x="44" y="10" width="32" height="20" rx="4" fill={C.silueta} />
        </g>
      ))}
      {xs.map((x, k) => {
        const clase = destinos.includes(k) ? `fae-pv-${id}-luz${destinos.indexOf(k)}` : undefined;
        if (forma === "edificio") {
          return (
            <g key={x} className={clase} fill="none" stroke={C.hueco} strokeWidth="1.8" strokeLinejoin="round">
              {k === 1
                ? <path d={`M${x + w * 0.25} 58 A${w * 0.25} ${w * 0.2} 0 0 1 ${x + w * 0.75} 58`} />
                : <path d={`M${x} 58 L${x + w / 2} 50 L${x + w} 58`} />}
              <rect x={x} y="58" width={w} height="26" rx="2" />
            </g>
          );
        }
        return <rect key={x} className={clase} x={x} y="66" width={w} height="16" rx="4" fill="none" stroke={C.hueco} strokeWidth="1.8" />;
      })}
    </Lamina>
  );
}

/* El volante de la tasa: un cuarto de vuelta (0,6 s), pausa, y vuelve apagándose (0,3 s); alterna el sentido. */
function VolanteGesto() {
  const rayos = Array.from({ length: 6 }, (_, k) => (k * Math.PI) / 3);
  return (
    <Lamina
      id="volante-de-la-tasa"
      css={`
@keyframes fae-pv-vt-giro {
  0% { transform: rotate(0deg); opacity: 1; animation-timing-function: cubic-bezier(.3,.8,.4,1); }
  18.75% { transform: rotate(90deg); opacity: 1; } 40.6% { transform: rotate(90deg); opacity: 1; }
  50% { transform: rotate(0deg); opacity: .3; } 50.1% { transform: rotate(0deg); opacity: 1; animation-timing-function: cubic-bezier(.3,.8,.4,1); }
  68.75% { transform: rotate(-90deg); opacity: 1; } 90.6% { transform: rotate(-90deg); opacity: 1; }
  100% { transform: rotate(0deg); opacity: .3; }
}
.fae-pv-vt .fae-pv-vt-rueda { transform-box: view-box; transform-origin: 60px 45px; animation: fae-pv-vt-giro 3.2s linear infinite; }
`}
    >
      <g className="fae-pv-vt">
        <g className="fae-pv-vt-rueda">
          <circle cx="60" cy="45" r="30" fill="none" stroke={C.silueta} strokeWidth="5" />
          {rayos.map((a) => <line key={a} x1="60" y1="45" x2={60 + Math.cos(a) * 30} y2={45 + Math.sin(a) * 30} stroke={C.silueta} strokeWidth="3" strokeLinecap="round" />)}
          <circle cx="90" cy="45" r="5" fill={C.luz} />
        </g>
        <circle cx="60" cy="45" r="7" fill={C.fondo} stroke={C.silueta} strokeWidth="3" />
      </g>
    </Lamina>
  );
}

/* La cadena de transmisión: una ficha entra al eslabón vacío (0,5 s) y una luz viaja al siguiente (0,4 s). */
function CadenaGesto() {
  const xs = [6, 30, 54, 78, 102];
  return (
    <Lamina
      id="cadena-de-transmision"
      css={`
@keyframes fae-pv-ct2-ficha { 0% { transform: translateY(-34px); opacity: 0; } 5% { opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); } 27.8%, 88% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; } }
.fae-pv-ct2-ficha { animation: fae-pv-ct2-ficha 1.8s linear infinite; }
@keyframes fae-pv-ct2-luz { 0%, 27.8% { transform: translateX(0); opacity: 0; } 30% { opacity: 1; } 50% { transform: translateX(24px); opacity: 1; } 58%, 100% { transform: translateX(24px); opacity: 0; } }
.fae-pv-ct2-luz { animation: fae-pv-ct2-luz 1.8s linear infinite; }
`}
    >
      <path d="M18 60 H108" stroke={C.hueco} strokeWidth="1.6" />
      {xs.map((x, k) => (
        <rect key={x} x={x} y="50" width="14" height="20" rx="4" fill={k < 2 ? C.silueta : C.fondo} stroke={k < 2 ? "none" : C.hueco} strokeWidth="1.6" strokeDasharray={k < 2 ? undefined : "3 2.5"} />
      ))}
      <rect className="fae-pv-ct2-ficha" x="54" y="50" width="14" height="20" rx="4" fill={C.silueta} />
      <circle className="fae-pv-ct2-luz" cx="61" cy="60" r="3.2" fill={C.luz} />
    </Lamina>
  );
}

/*
 * Corriente de decisiones: un punto corre por la correa hacia una bandeja
 * (0,4 s), la bandeja destella, y otro hacia otra. Deliberadamente más rápido
 * que los demás gestos: es la técnica (intercalado, Rohrer 2012), no un atajo.
 * No lo iguales al ritmo del resto.
 */
function CorrienteGesto() {
  const bandejas = [10, 38, 66, 94];
  const destinos = [1, 3];
  const seg = 1.2;
  return (
    <Lamina
      id="corriente-de-decisiones"
      css={destinos.map((d, k) => {
        const i = k * 50;
        const dx = bandejas[d] + 8 - 10;
        return `
@keyframes fae-pv-cd-p${k} { 0%, ${i}% { transform: translate(0, 0); opacity: 0; } ${i + 1}% { opacity: 1; } ${i + 33}% { transform: translate(${dx}px, 0); opacity: 1; } ${i + 45}% { transform: translate(${dx}px, 30px); opacity: 0; } ${i + 46}%, 100% { transform: translate(${dx}px, 30px); opacity: 0; } }
.fae-pv-cd-p${k} { animation: fae-pv-cd-p${k} ${seg}s linear infinite; }
@keyframes fae-pv-cd-b${k} { 0%, ${i + 40}% { stroke: ${C.hueco}; } ${i + 44}%, ${i + 49}% { stroke: ${C.luz}; } ${i + 50}%, 100% { stroke: ${C.hueco}; } }
.fae-pv-cd-b${k} { animation: fae-pv-cd-b${k} ${seg}s linear infinite; }`;
      }).join("")}
    >
      <rect x="4" y="30" width="112" height="12" rx="6" fill={C.fondo} stroke={C.trazo} strokeWidth="1.6" />
      {destinos.map((_, k) => <circle key={k} className={`fae-pv-cd-p${k}`} cx="10" cy="36" r="4.5" fill={C.luz} />)}
      {bandejas.map((x, k) => (
        <path key={x} className={destinos.includes(k) ? `fae-pv-cd-b${destinos.indexOf(k)}` : undefined} d={`M${x} 62 l2 16 h12 l2 -16`} fill="none" stroke={C.hueco} strokeWidth="1.8" strokeLinejoin="round" />
      ))}
    </Lamina>
  );
}

/* El rezago: la manecilla da un cuarto de vuelta (0,6 s) mientras la correa de detrás gira más lento. Sin datos. */
function RezagoGesto() {
  return (
    <Lamina
      id="el-rezago"
      css={`
@keyframes fae-pv-rz-mano { 0% { transform: rotate(0deg); animation-timing-function: cubic-bezier(.3,.8,.4,1); } 25%, 100% { transform: rotate(90deg); } }
.fae-pv-rz .fae-pv-rz-mano { transform-box: view-box; transform-origin: 60px 45px; animation: fae-pv-rz-mano 2.4s linear infinite; }
@keyframes fae-pv-rz-correa { to { stroke-dashoffset: -14; } }
.fae-pv-rz-correa { animation: fae-pv-rz-correa 2.4s linear infinite; }
`}
    >
      <g className="fae-pv-rz">
        <ellipse className="fae-pv-rz-correa" cx="60" cy="45" rx="50" ry="36" fill="none" stroke={C.hueco} strokeWidth="2.4" strokeDasharray="7 7" />
        <circle cx="60" cy="45" r="24" fill={C.fondo} stroke={C.trazo} strokeWidth="2" />
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2;
          return <line key={k} x1={60 + Math.cos(a) * 19} y1={45 + Math.sin(a) * 19} x2={60 + Math.cos(a) * 24} y2={45 + Math.sin(a) * 24} stroke={C.trazo} strokeWidth="2" />;
        })}
        <line className="fae-pv-rz-mano" x1="60" y1="45" x2="60" y2="27" stroke={C.luz} strokeWidth="3" strokeLinecap="round" />
      </g>
    </Lamina>
  );
}

/* Diseña la respuesta monetaria: una pieza entra en el espacio vacío del panel (0,5 s) y se asienta con un destello. */
function PanelGesto() {
  return (
    <Lamina
      id="disena-respuesta-monetaria"
      css={`
@keyframes fae-pv-dr-pieza { 0% { transform: translate(-46px, 26px); opacity: 0; } 6% { opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); } 31% { transform: translate(0, 0) scale(.94); } 38%, 88% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0, 0); opacity: 0; } }
.fae-pv-dr-pieza { animation: fae-pv-dr-pieza 1.6s linear infinite; }
@keyframes fae-pv-dr-destello { 0%, 30% { opacity: 0; } 36% { opacity: 1; } 55%, 100% { opacity: 0; } }
.fae-pv-dr-destello { animation: fae-pv-dr-destello 1.6s linear infinite; }
`}
    >
      <rect x="14" y="10" width="92" height="70" rx="8" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" />
      {[18, 32, 46, 60].map((y) => <rect key={y} x="24" y={y} width="42" height="9" rx="2.5" fill="rgba(203,220,242,0.45)" />)}
      <rect x="78" y="22" width="16" height="44" rx="5" fill="none" stroke={C.hueco} strokeWidth="1.5" strokeDasharray="3 2.5" />
      <rect className="fae-pv-dr-destello" x="74" y="18" width="24" height="52" rx="8" fill="none" stroke={C.luz} strokeWidth="2.4" />
      <rect className="fae-pv-dr-pieza" x="78" y="22" width="16" height="44" rx="5" fill={C.silueta} />
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
  "consejo-ministros": Consejo,
  "quien-beneficia-auge": () => <Reparto id="quien-beneficia-auge" />,
  "quien-afecta-ajuste": () => <Reparto id="quien-afecta-ajuste" />,
  "explica-paciente": () => <Explicale id="explica-paciente" />,
  "explica-contribuyente": () => <Explicale id="explica-contribuyente" />,
  "sala-espera-llena": () => <Frontera id="sala-espera-llena" />,
  "comite-presupuesto": () => <Frontera id="comite-presupuesto" />,
  /* Política Monetaria (0031). El dilema del banquero central se queda quieto. */
  "memorama-banco-central": () => <Memorama id="memorama-banco-central" columnas={5} filas={2} a={1} b={8} />,
  "quien-decide-esto": () => <FichaADestinos id="quien-decide-esto" forma="edificio" n={2} destinos={[0, 1]} />,
  "volante-de-la-tasa": VolanteGesto,
  "caja-de-herramientas": () => <FichaADestinos id="caja-de-herramientas" forma="ranura" n={4} destinos={[1, 3]} />,
  "a-quien-le-pega-la-tasa": () => <Reparto id="a-quien-le-pega-la-tasa" />,
  "cadena-de-transmision": CadenaGesto,
  "explicaselo-a-un-deudor": () => <Explicale id="explicaselo-a-un-deudor" />,
  "corriente-de-decisiones": CorrienteGesto,
  "el-rezago": RezagoGesto,
  "duelo-de-instrumentos": () => <Consejo id="duelo-de-instrumentos" figura="engranaje" />,
  "disena-respuesta-monetaria": PanelGesto,
};

export default function PreviasBloques({ actividadId }) {
  const Gesto = GESTOS[actividadId];
  return Gesto ? <Gesto /> : null;
}
