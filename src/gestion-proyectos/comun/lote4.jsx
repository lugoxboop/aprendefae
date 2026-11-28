/*
 * GESTIÓN DE PROYECTOS · PIEZAS COMUNES DE LAS ESCENAS DEL LOTE 4 (caps. 7 y 8).
 *
 * La hoja del lote 3 más lo propio de estos capítulos: gráficas dibujadas a
 * mano CON LOS DATOS EXACTOS del diseño (la curva S, la lona del valor ganado,
 * el diagrama de control de la selladora, el histograma de causas), los
 * termómetros del CPI y el SPI y la rampa del TCPI. El diseño pide esas
 * gráficas «a mano, montadas sobre» el objeto ilustrado: el objeto (Gemini)
 * es el protagonista y la gráfica va encima.
 *
 * Reglas: las líneas se distinguen por TRAZO (continua, guiones, puntos) y
 * llevan su nombre o su cifra escrita, no solo color; texto ≥ 12 px a 320 px
 * (viewBox de 300 de ancho, letra de 13); solo transform y opacity en
 * movimiento; con movimiento reducido, sin animación.
 */
import { CSS_LOTE3 } from "./lote3.jsx";
import { CURVA } from "./estilo.js";

export const CSS_LOTE4 = `${CSS_LOTE3}
.gp4-svg { display: block; width: 100%; height: auto; overflow: visible; }
.gp4-svg text { font: 600 13px/1 var(--planck-font-sans, system-ui, sans-serif); fill: #f4f5f7; }
.gp4-svg .gp4-mono { font-family: var(--planck-font-mono, ui-monospace, monospace); }
.gp4-svg .gp4-tenue { fill: #b6bbc5; }
.gp4-lamina { margin-top: 10px; padding: 8px 8px 6px; border-radius: 12px; background: rgba(8,16,30,.78); border: 1px solid rgba(244,245,247,.28); }
.gp4-lamina > b { display: block; margin: 0 0 4px; font: 700 12px/16px var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .04em; text-transform: uppercase; color: #b6bbc5; }
.gp4-crece { transform-origin: 50% 100%; transition: transform 520ms ${CURVA}, opacity 420ms ${CURVA}; }
.gp4-traza { transition: opacity 520ms ${CURVA}; }
.gp-destinos[data-disposicion="tablero"] { --gp-cols: 3; }
.gp-destinos[data-disposicion="tablero"] .gp-destino { min-height: 52px; padding: 6px 4px; font-size: 13px; }
.gp-destinos[data-disposicion="tablero"] .gp-destino-txt { hyphens: none; -webkit-hyphens: none; overflow-wrap: anywhere; }
@media (max-width: 359px) { .gp-destinos[data-disposicion="tablero"] { --gp-cols: 2; } }
.gp-destinos[data-disposicion="cuadrantes"] { --gp-cols: 2; }
.gp-destinos[data-disposicion="cuadrantes"] .gp-destino { min-height: 96px; }
.gp4-ejes { display: flex; justify-content: space-between; gap: 8px; margin: 8px 0 -4px; font: 700 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: #b6bbc5; text-transform: uppercase; letter-spacing: .04em; }
@media (prefers-reduced-motion: reduce) { .gp4-crece, .gp4-traza { transition: opacity 120ms linear !important; } }
`;

export const EstiloLote4 = () => <style>{CSS_LOTE4}</style>;

export const coma = (v) => String(v).replace(".", ",").replace(/^-/, "−");
/* 1200 → «1.200»; 0.8 → «0,80» si se pide con decimales. */
export const miles = (v, dec = 0) => {
  const t = Number(v).toFixed(dec).split(".");
  return `${t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${t[1] ? `,${t[1]}` : ""}`.replace(/^-/, "−");
};

const TRAZOS = { continua: undefined, guiones: "8 5", puntos: "1.5 5" };

/**
 * Una gráfica de líneas con los datos exactos.
 * series: [{ id, puntos: [[x, y]…], trazo, ancho, nombre, visible }]; x de 0 a xMax, y de 0 a yMax.
 * marcas: [{ x, y, texto }] puntos marcados; corte: x de la línea vertical «Fecha de corte».
 * escalones: [{ x0, x1, y }] barras horizontales (los desembolsos).
 */
export function Grafica({ series = [], xMax, yMax, etiquetasX = [], etiquetasY = [], marcas = [], corte = null, escalones = [], alto = 170, titulo }) {
  const W = 300; const H = alto; const izq = 40; const der = 8; const arr = 10; const aba = 22;
  const X = (x) => izq + (x / xMax) * (W - izq - der);
  const Y = (y) => H - aba - (y / yMax) * (H - aba - arr);
  return (
    <svg className="gp4-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={titulo} data-grafica>
      <line x1={izq} y1={Y(0)} x2={W - der} y2={Y(0)} stroke="#f4f5f7" strokeWidth="1.5" />
      <line x1={izq} y1={Y(0)} x2={izq} y2={arr} stroke="#f4f5f7" strokeWidth="1.5" />
      {etiquetasY.map((y) => (
        <g key={`y${y}`}>
          <line x1={izq} y1={Y(y)} x2={W - der} y2={Y(y)} stroke="rgba(244,245,247,.15)" />
          <text x={izq - 4} y={Y(y) + 4} textAnchor="end" className="gp4-mono gp4-tenue">{miles(y)}</text>
        </g>
      ))}
      {etiquetasX.map((x) => <text key={`x${x}`} x={X(x)} y={H - 6} textAnchor="middle" className="gp4-mono gp4-tenue">{x}</text>)}
      {escalones.map((e, k) => (
        <g key={`e${k}`} data-escalon={k + 1}>
          <rect x={X(e.x0)} y={Y(e.y)} width={X(e.x1) - X(e.x0)} height={Y(0) - Y(e.y)} fill="rgba(233,196,106,.16)" stroke="#e9c46a" strokeWidth="2" />
          <text x={(X(e.x0) + X(e.x1)) / 2} y={Y(e.y) - 4} textAnchor="middle" className="gp4-mono">{miles(e.y)}</text>
        </g>
      ))}
      {corte != null && (
        <g data-corte>
          <line x1={X(corte)} y1={arr} x2={X(corte)} y2={Y(0)} stroke="#f4f5f7" strokeDasharray="3 3" />
          <text x={X(corte) + 4} y={arr + 10} className="gp4-tenue">Corte</text>
        </g>
      )}
      {series.map((s) => (
        <g key={s.id} className="gp4-traza" style={{ opacity: s.visible === false ? 0 : 1 }} data-serie={s.id}>
          <polyline points={s.puntos.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")} fill="none" stroke={s.color ?? "#f4f5f7"} strokeWidth={s.ancho ?? 3} strokeDasharray={TRAZOS[s.trazo ?? "continua"]} strokeLinecap="round" strokeLinejoin="round" />
          {s.nombre && s.puntos.length > 0 && (
            <text x={Math.min(X(s.puntos.at(-1)[0]) + 4, W - 40)} y={Y(s.puntos.at(-1)[1]) + (s.dy ?? -6)} className="gp4-mono">{s.nombre}</text>
          )}
        </g>
      ))}
      {marcas.map((m, k) => (
        <g key={`m${k}`} data-marca={m.id ?? k}>
          <circle cx={X(m.x)} cy={Y(m.y)} r={m.r ?? 5} fill={m.lleno === false ? "#121418" : "#f4f5f7"} stroke="#f4f5f7" strokeWidth="2" />
          {m.texto && <text x={X(m.x) + (m.dx ?? 0)} y={Y(m.y) + (m.dy ?? -9)} textAnchor="middle" className="gp4-mono">{m.texto}</text>}
        </g>
      ))}
    </svg>
  );
}

/** Un termómetro de pared con la marca en 1,0; la columna sube hasta `valor` (0 a 1,5). */
export function Termometro({ nombre, valor = null, alto = 150 }) {
  const top = 12; const base = alto - 30; const max = 1.5;
  const Y = (v) => base - (Math.max(0, Math.min(max, v)) / max) * (base - top);
  const h = valor == null ? 0 : base - Y(valor);
  return (
    <svg className="gp4-svg" viewBox={`0 0 110 ${alto}`} style={{ maxWidth: 130 }} role="img" aria-label={`${nombre}: ${valor == null ? "sin valor" : coma(valor)}`} data-termometro={nombre}>
      <rect x="36" y={top - 4} width="22" height={base - top + 8} rx="11" fill="rgba(8,16,30,.85)" stroke="#f4f5f7" strokeWidth="2" />
      <circle cx="47" cy={base + 10} r="15" fill="#e76f51" stroke="#f4f5f7" strokeWidth="2" opacity={valor == null ? 0.35 : 1} />
      <rect className="gp4-crece" x="41" y={base - h} width="12" height={Math.max(h, 0.01)} rx="6" fill="#e76f51" />
      <line x1="30" y1={Y(1)} x2="66" y2={Y(1)} stroke="#f4f5f7" strokeWidth="2" />
      <text x="68" y={Y(1) + 4} className="gp4-mono">1,0</text>
      <text x="64" y={top + 8}>▲ mejor</text>
      <text x="64" y={base - 2}>▼ peor</text>
      <text x="47" y={alto - 2} textAnchor="middle" style={{ fontWeight: 800 }}>{nombre}{valor == null ? "" : ` ${miles(valor, 2)}`}</text>
    </svg>
  );
}

/** La rampa del montacargas: plana en 1,0, sube si el TCPI es mayor que 1, baja si es menor. */
export function Rampa({ tcpi = 1, alto = 120 }) {
  const ang = Math.max(-18, Math.min(18, (tcpi - 1) * 120));
  const texto = tcpi > 1.001 ? "más difícil" : tcpi < 0.999 ? "más fácil" : "igual";
  return (
    <svg className="gp4-svg" viewBox={`0 0 300 ${alto}`} role="img" aria-label={`Rampa con TCPI ${miles(tcpi, 2)}: ${texto}`} data-rampa={texto}>
      <line x1="10" y1={alto - 30} x2="290" y2={alto - 30} stroke="rgba(244,245,247,.25)" strokeWidth="2" />
      <g className="gp4-crece" style={{ transform: `rotate(${-ang}deg)`, transformOrigin: `40px ${alto - 30}px` }}>
        <rect x="40" y={alto - 36} width="230" height="8" rx="3" fill="#b6bbc5" stroke="#f4f5f7" />
        <text x="150" y={alto - 44} textAnchor="middle" className="gp4-mono" style={{ fontWeight: 800 }}>TCPI {miles(tcpi, 2)}</text>
      </g>
      <text x="150" y={alto - 8} textAnchor="middle">{texto}</text>
    </svg>
  );
}

/** El diagrama de control de la selladora: cuatro límites con su cifra y la media; los puntos de un turno. */
export function DiagramaControl({ puntos = [], resaltar = null, alto = 170 }) {
  const W = 300; const izq = 8; const der = 44; const arr = 10; const aba = 10;
  const min = 4.9; const max = 6.2;
  const Y = (v) => arr + ((max - v) / (max - min)) * (alto - arr - aba);
  const X = (k) => izq + 10 + (k / Math.max(1, puntos.length - 1)) * (W - izq - der - 20);
  const lineas = [
    { v: 6.0, trazo: undefined, n: "6,0" }, { v: 5.8, trazo: "8 5", n: "5,8" },
    { v: 5.5, trazo: "1.5 5", n: "5,5" }, { v: 5.2, trazo: "8 5", n: "5,2" }, { v: 5.0, trazo: undefined, n: "5,0" },
  ];
  return (
    <svg className="gp4-svg" viewBox={`0 0 ${W} ${alto}`} role="img" aria-label="Diagrama de control del peso por cápsula" data-diagrama-control>
      {lineas.map((l) => (
        <g key={l.n} data-limite={l.n}>
          <line x1={izq} y1={Y(l.v)} x2={W - der} y2={Y(l.v)} stroke={resaltar === l.v ? "#ffc978" : "#f4f5f7"} strokeWidth={resaltar === l.v ? 3 : 1.8} strokeDasharray={l.trazo} />
          <text x={W - der + 4} y={Y(l.v) + 4} className="gp4-mono" style={{ fontSize: 14 }}>{l.n}</text>
        </g>
      ))}
      {puntos.length > 1 && <polyline points={puntos.map((v, k) => `${X(k)},${Y(v)}`).join(" ")} fill="none" stroke="rgba(244,245,247,.55)" strokeWidth="1.5" />}
      {puntos.map((v, k) => {
        const fuera = v > 5.8 || v < 5.2;
        return <circle key={k} cx={X(k)} cy={Y(v)} r={fuera ? 6 : 4} fill={fuera ? "#ffc978" : "#f4f5f7"} stroke="#121418" strokeWidth="1.5" data-punto={coma(v)} />;
      })}
    </svg>
  );
}

/** Barras verticales con su cifra escrita (el histograma de causas). */
export function Barras({ barras = [], max, alto = 150 }) {
  const W = 300; const aba = 34; const arr = 16; const n = Math.max(1, barras.length); const paso = (W - 10) / n;
  return (
    <svg className="gp4-svg" viewBox={`0 0 ${W} ${alto}`} role="img" aria-label="Histograma de causas" data-barras>
      <line x1="4" y1={alto - aba} x2={W - 4} y2={alto - aba} stroke="#f4f5f7" strokeWidth="1.5" />
      {barras.map((b, k) => {
        const h = ((alto - aba - arr) * b.valor) / max;
        const x = 8 + k * paso;
        return (
          <g key={b.id} data-barra={b.id}>
            <rect className="gp4-crece" x={x} y={alto - aba - h} width={paso - 10} height={Math.max(h, 0.01)} rx="3" fill={b.color ?? "#a7bbff"} stroke="#f4f5f7" />
            <text x={x + (paso - 10) / 2} y={alto - aba - h - 4} textAnchor="middle" className="gp4-mono">{b.valor}</text>
            <text x={x + (paso - 10) / 2} y={alto - aba + 14} textAnchor="middle" className="gp4-tenue">{b.corto}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* El número de una casilla («1.140», «−75», «0,80») para pintar la escena mientras se escribe. */
export { numeroDe as numeroDeTexto } from "./motores/Casillas.jsx";
