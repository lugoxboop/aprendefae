/*
 * C06 · H11 · El rotafolio del lunes (gp26-moc-c06-h11-rotafolio, Medio, 25 × 2 FP × %).
 * El rotafolio con trípode en la sala de reuniones; el equipo presenta y la
 * patrocinadora escucha. Etapa 1: dos retrasos por hoja, se atiende uno.
 * Etapa 2: la gráfica de trabajo pendiente a mano (días 0–10, horas): línea
 * ideal de 40 h a 0 h y línea real hasta el día 5, en 30 h. La tendencia
 * punteada se prolonga hasta el día que se elige (◀ ▶ o escribiendo), hasta
 * tocar el eje. A 320 px la gráfica ocupa el ancho completo.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { numeroDe } from "../comun/motores/Casillas.jsx";
import { GP_C6_H11 } from "./textos-c6.js";

export const ID = GP_C6_H11.id;

/* La gráfica: x en días (0–25), y en horas (0–40). */
function Grafica({ paso, valores, encaja }) {
  if (!paso.grafica) return null;
  const W = 300; const H = 180; const X = (d) => 24 + (d / 25) * (W - 32); const Y = (h) => 12 + (1 - h / 40) * (H - 36);
  const fin = paso.grafica === "tendencia" ? (paso.casillas ? numeroDe(valores?.dia) ?? 10 : 20) : null;
  const hFin = fin == null ? null : Math.max(0, 30 - 2 * (fin - 5));
  return (
    <div className="gp2-caja" data-grafica={paso.grafica} style={{ marginTop: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", minHeight: 180 }} role="img" aria-label="Gráfica de trabajo pendiente: ideal de 40 a 0 horas en 10 días; real, 30 horas el día 5.">
        <line x1={X(0)} y1={Y(0)} x2={X(25)} y2={Y(0)} stroke="#b6bbc5" />
        <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(40)} stroke="#b6bbc5" />
        {[0, 5, 10, 15, 20, 25].map((d) => <text key={d} x={X(d)} y={H - 6} fontSize="12" fill="#d7dbe2" textAnchor="middle">{d}</text>)}
        {[0, 20, 40].map((h) => <text key={h} x={4} y={Y(h) + 4} fontSize="12" fill="#d7dbe2">{h}</text>)}
        <line x1={X(0)} y1={Y(40)} x2={X(10)} y2={Y(0)} stroke="#a7bbff" strokeWidth="2.5" data-ideal />
        <polyline points={`${X(0)},${Y(40)} ${X(5)},${Y(30)}`} stroke="#f2c14e" strokeWidth="3.5" fill="none" data-real />
        {fin != null && <line x1={X(5)} y1={Y(30)} x2={X(fin)} y2={Y(hFin)} stroke="#f2c14e" strokeWidth="2.5" strokeDasharray="5 5" data-tendencia={fin} />}
        {fin != null && <circle cx={X(fin)} cy={Y(hFin)} r="8" fill="#f2c14e" />}
        {paso.grafica === "ideal" && encaja && <circle cx={X(5)} cy={Y(20)} r="6" fill="#a7bbff" />}
      </svg>
      <small>Ideal (azul) · Real (amarilla) · Tendencia (punteada)</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "rotafolio", fondo: ["#22303a", "#0b1116"], acento: "#a7bbff", luz: "rgba(167,187,255,.2)",
  portada: "rotafolio",
  mesa: "equipo",
  objeto: { id: "rotafolio", alto: 84 },
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Grafica {...e} />,
  etapas: [{}, { objeto: null }],
};

export default function C06H11Rotafolio({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
