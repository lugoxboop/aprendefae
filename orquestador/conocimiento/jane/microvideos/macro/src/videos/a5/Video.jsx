/*
 * A5 · «Ascensor o bisagra» (da26-a5-bisagra-ascensor). Una idea: la DA se desplaza (ascensor: lo autónomo)
 * o gira (bisagra: c y t). Equilibrio donde Y = DA. Todo pasa en la pizarra de Olga.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL, TIZA } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Pizarra, Tiza, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso, suave } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.4, 0.4, 0.3, 0.4, 0.5, 0.4, 0.4, 0.5, 0.4, 0.5] });
const { S, E, W, c } = T;

const M = {
  brilla: W(1, "recta", 0.4), dos: W(1, "dos", 0.8),
  dibuja: S(2), punto: W(2, "sube", 0.4),
  arranca: W(3, "arranca", 0.5), empinada: W(3, "empinada", 0.7),
  ascensor: W(4, "ascensor", 0.4), gasta: W(4, "gasta", 0.6), paralela: W(4, "paralela", 0.8),
  cbar: W(5, "consumo", 0.3), ibar: W(5, "inversión", 0.55), xn: W(5, "exportaciones", 0.8),
  tasa: W(6, "tasa", 0.3), cae: W(6, "baja", 0.7),
  bisagra: W(7, "bisagra", 0.4), ct: W(7, "c", 0.85),
  gira: W(8, "empina", 0.7),
  acuesta: W(9, "acuesta", 0.7),
  queda: S(10) + 0.2, cuarenta: W(10, "igual", 0.75),
  equilibrio: W(11, "equilibrio", 0.6),
  fichas: S(12) + 0.2,
};

/* estado de la recta en el instante t: h0 = arranque (px), m = pendiente */
function recta(t) {
  let h0 = 190, m = 0.42;
  h0 += 140 * suave(rampa(t, M.gasta, 0.8));                      /* ascensor: G sube */
  h0 -= 140 * suave(rampa(t, M.tasa + 0.3, 0.6));                /* vuelve con la tasa… */
  h0 -= 90 * suave(rampa(t, M.cae - 0.2, 0.6));                  /* …y baja paralela */
  h0 += 90 * suave(rampa(t, S(7) - 0.3, 0.5));                   /* vuelve a su sitio */
  m += 0.3 * suave(rampa(t, M.gira - 0.5, 0.8));                  /* bisagra: c sube */
  m -= 0.48 * suave(rampa(t, M.acuesta - 0.5, 0.8));              /* t sube: se acuesta */
  m += 0.18 * suave(rampa(t, S(10) - 0.3, 0.5));                  /* vuelve */
  return { h0, m };
}

/* marco del gráfico dentro de la pizarra */
const OX = 120, OY = 760, LX = 780, LY = 680;
const P = (Y, Z) => [OX + Y, OY - Z];

function Grafico({ t }) {
  const { h0, m } = recta(t);
  const dib = rampa(t, M.dibuja - 0.3, 1.0);
  const fin = LX * dib;
  const [x0, y0] = P(0, h0), [x1, y1] = P(fin, h0 + m * fin);
  const fantasma = t > M.gasta - 0.2 && t < S(7) - 0.3; /* DA₀ punteada mientras se mueve */
  const fantasma2 = t > M.gira - 0.5 && t < S(10) - 0.3;
  const base = { h0: 190, m: 0.42 };
  const punto = rampa(t, M.punto - 0.6, 1.6);
  const linea45 = rampa(t, M.cuarenta - 0.4, 0.9);
  const Yeq = h0 / (1 - m);
  const eq = rampa(t, M.equilibrio - 0.3, 0.5);
  const brillo = pulso(t, M.brilla - 0.2, 1.2);
  return (
    <svg width="940" height="880" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* ejes */}
      <path d={`M ${OX} ${OY - LY - 30} L ${OX} ${OY} L ${OX + LX + 30} ${OY}`} fill="none" stroke={TIZA} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <text x={OX + LX + 20} y={OY + 60} fill={TIZA} fontFamily="Caveat" fontWeight="700" fontSize="62">Y</text>
      <text x={OX - 95} y={OY - LY} fill={TIZA} fontFamily="Caveat" fontWeight="700" fontSize="62">DA</text>
      {/* 45° */}
      {linea45 > 0 && <line x1={OX} y1={OY} x2={OX + 640 * linea45} y2={OY - 640 * linea45} stroke={TIZA} strokeWidth={6} strokeDasharray="16 14" opacity={0.85} />}
      {linea45 > 0.9 && <text x={OX + 560} y={OY - 680} fill={TIZA} fontFamily="Caveat" fontWeight="700" fontSize="54">Y = DA</text>}
      {/* DA₀ punteada */}
      {(fantasma || fantasma2) && <line x1={OX} y1={OY - base.h0} x2={OX + LX} y2={OY - base.h0 - base.m * LX} stroke={TIZA} strokeWidth={6} strokeDasharray="14 14" opacity={0.5} />}
      {/* la recta DA */}
      {dib > 0 && <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={MANGO} strokeWidth={14 + 8 * brillo} strokeLinecap="round" style={{ filter: brillo > 0 ? `drop-shadow(0 0 ${20 * brillo}px ${MANGO})` : undefined }} />}
      {dib > 0.95 && <text x={x1 - 40} y={y1 - 30} fill={MANGO} fontFamily="Caveat" fontWeight="700" fontSize="66">DA</text>}
      {/* punto que recorre */}
      {punto > 0 && punto < 1 && <circle cx={OX + LX * punto} cy={OY - h0 - m * LX * punto} r={20} fill="#fff" stroke={TINTA} strokeWidth={5} />}
      {/* arranque y ángulo */}
      {rampa(t, M.arranca - 0.3, 0.3) > 0 && t < S(7) - 0.3 && (
        <g opacity={rampa(t, M.arranca - 0.3, 0.3)}>
          <rect x={OX - 20} y={OY - h0 - 20} width={40} height={40} transform={`rotate(45 ${OX} ${OY - h0})`} fill={COLOR.G} stroke={TINTA} strokeWidth={5} />
          <text x={OX + 30} y={OY - h0 + 70} fill={TIZA} fontFamily="Caveat" fontWeight="700" fontSize="72">Ā − b·i</text>
        </g>
      )}
      {rampa(t, M.empinada - 0.3, 0.3) > 0 && t < S(7) - 0.3 && (
        <g opacity={rampa(t, M.empinada - 0.3, 0.3)}>
          <path d={`M ${OX + 520} ${OY - h0 - m * 400} A 120 120 0 0 0 ${OX + 520} ${OY - h0 - m * 520 + 2}`} fill="none" stroke={TIZA} strokeWidth={5} />
          <text x={OX + 560} y={OY - h0 - m * 400 + 20} fill={TIZA} fontFamily="Caveat" fontWeight="700" fontSize="72">c(1 − t)</text>
        </g>
      )}
      {/* bisagra dorada */}
      {t > M.bisagra - 0.3 && t < S(10) && (
        <g transform={`translate(${OX} ${OY - h0}) scale(${rebote(rampa(t, M.bisagra - 0.3, 0.4))})`}>
          <circle r={34} fill={MANGO} stroke={TINTA} strokeWidth={7} />
          <circle r={10} fill={TINTA} />
        </g>
      )}
      {/* equilibrio */}
      {eq > 0 && (
        <g opacity={eq}>
          <line x1={OX + Yeq} y1={OY - Yeq} x2={OX + Yeq} y2={OY} stroke={TIZA} strokeWidth={5} strokeDasharray="10 10" />
          <circle cx={OX + Yeq} cy={OY - Yeq} r={22 * rebote(eq)} fill="#fff" stroke={TINTA} strokeWidth={6} />
          <text x={OX + Yeq - 30} y={OY + 70} fill="#fff" fontFamily="Caveat" fontWeight="700" fontSize="66">Y₀</text>
        </g>
      )}
    </svg>
  );
}

/* el ascensor: una cabina que sube o baja junto al arranque */
function Ascensor({ t, x, y }) {
  const sube = rampa(t, M.gasta - 0.3, 0.3), fuera = rampa(t, S(7) - 0.6, 0.3);
  const p = sube * (1 - fuera);
  if (p <= 0) return null;
  const dir = t > M.tasa ? "↓" : "↑";
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 150, height: 190, background: "#CBD2DC", border: `8px solid ${TINTA}`, borderRadius: 16, transform: `scale(${rebote(p)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 110, color: dir === "↑" ? COLOR.VERDE : COLOR.CORAL, WebkitTextStroke: `6px ${TINTA}`, paintOrder: "stroke fill" }}>{dir}</div>
  );
}

function Tablero({ t }) {
  const cam = mover(t, { s: 1.15, x: 540, y: 760 }, [
    { a: 0.2, b: E(1), s: 1.0, x: 540, y: 968 },
    { a: S(4) - 0.2, b: S(4) + 0.7, s: 1.08, x: 540, y: 780 },
    { a: S(7) - 0.4, b: S(7) + 0.5, s: 1.08, x: 540, y: 780 },
    { a: S(10) - 0.3, b: S(10) + 0.8, s: 1.0, x: 540, y: 968 },
  ]);
  const t0 = M.cbar - 0.2;
  const bloques = [["C̄", COLOR.C, M.cbar], ["Ī", COLOR.I, M.ibar], ["XN", COLOR.XN, M.xn]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={40} y={200} w={1000} h={1000}>
        <Grafico t={t} />
        {bloques.map(([s, col, tt], i) => {
          const p = rampa(t, tt - 0.15, 0.35) * (1 - rampa(t, M.tasa - 0.2, 0.3));
          if (p <= 0) return null;
          return <div key={s} style={{ position: "absolute", left: 230 + i * 170, top: 120, width: 140, height: 120, background: col, border: `7px solid ${TINTA}`, borderRadius: 18, transform: `scale(${rebote(p)}) translateY(${-20 * pulso(t, tt, 0.5)}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: TINTA }}>{s}<span style={{ fontSize: 46, color: COLOR.VERDE, marginLeft: 6 }}>↑</span></div>;
        })}
        <Ascensor t={t} x={740} y={120} />
        <Tiza x={330} y={130} txt="G ↑" p={rampa(t, M.gasta - 0.2, 0.4) * (1 - rampa(t, t0, 0.2))} tam={84} color={COLOR.G} />
        <Tiza x={330} y={130} txt="i ↑  →  I ↓" p={rampa(t, M.tasa - 0.1, 0.5) * (1 - rampa(t, S(7) - 0.5, 0.2))} tam={80} color={COLOR.CORAL} />
        <Tiza x={300} y={130} txt="c ↑" p={rampa(t, M.gira - 0.6, 0.4) * (1 - rampa(t, M.acuesta - 0.8, 0.2))} tam={90} color={COLOR.VERDE} />
        <Tiza x={300} y={130} txt="t ↑" p={rampa(t, M.acuesta - 0.7, 0.4) * (1 - rampa(t, S(10) - 0.4, 0.2))} tam={90} color={COLOR.CORAL} />
      </Pizarra>
      <Cartel x={540} y={140} txt="Ascensor" p={rampa(t, M.ascensor - 0.1, 0.35) * (1 - rampa(t, S(7) - 0.5, 0.3))} tam={70} fondo={COLOR.G} color="#fff" />
      <Cartel x={540} y={140} txt="Bisagra" p={rampa(t, M.bisagra - 0.1, 0.35) * (1 - rampa(t, S(10) - 0.4, 0.3))} tam={70} fondo={MANGO} />
      <Cartel x={540} y={140} txt="Equilibrio: Y = DA" p={rampa(t, M.cuarenta, 0.35)} tam={64} fondo={CREMA} />
      <Destello x={540} y={700} r={500} p={rampa(t, M.equilibrio - 0.2, 0.7)} />
      <Sombra x={880} y={1520} w={260} />
      <Mascota esp="gato-gafas" x={880} y={1525} alto={420} t={t} cara="feliz" bi={-60 * clamp01(Math.sin(t * 2.6)) * (t < E(11) ? 1 : 0)} semilla={7} espejo />
      <Placa x={880} y={1230} nombre="Olga" rol="Analista" p={rampa(t, M.dibuja - 0.4, 0.35) * (1 - rampa(t, S(3), 0.3))} />
    </Escena>
  );
}

function Cierre({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: S(12) - 0.2, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const fichas = [["↕ ascensor", COLOR.G, 300, "#fff"], ["↻ bisagra", MANGO, 780, TINTA]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {fichas.map(([s, col, x, cc], i) => {
        const p = rampa(t, M.fichas + i * 0.35, 0.5);
        return <div key={i} style={{ position: "absolute", left: x - 210, top: 760 + 14 * Math.sin(t * 2 + i), width: 420, height: 200, background: col, color: cc, border: `9px solid ${TINTA}`, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, transform: `scale(${rebote(p)}) rotate(${(i ? 4 : -4)}deg)`, opacity: Math.min(1, p * 3), boxShadow: "0 12px 0 rgba(42,30,23,.3)" }}>{s}</div>;
      })}
      <Gigante x={540} y={1200} txt="?" p={rampa(t, M.fichas + 1.0, 0.35)} tam={220} giro={10} />
    </Escena>
  );
}

const PLANOS = [
  { tipo: "tablero", desde: 0 },
  { tipo: "cierre", desde: S(12) - 0.2, entra: "zoom" },
];
const pinta = (p, t) => (p.tipo === "tablero" ? <Tablero t={t} /> : <Cierre t={t} />);

const [SFX, fx] = hazSfx();
fx(M.brilla - 0.2, "campana", 0.45); fx(M.dos, "pop", 0.45);
fx(M.dibuja - 0.3, "tiza-larga", 0.55); fx(M.punto - 0.6, "desliza", 0.4);
fx(M.arranca - 0.3, "pop", 0.45); fx(M.empinada - 0.3, "tiza", 0.45);
fx(M.ascensor, "ding", 0.5); fx(M.gasta, "sube", 0.5);
[M.cbar, M.ibar, M.xn].forEach((tt) => fx(tt - 0.15, "pop", 0.45));
fx(M.tasa - 0.1, "toc-grave", 0.5); fx(M.cae - 0.2, "baja", 0.5);
fx(M.bisagra - 0.3, "crujido", 0.5); fx(M.gira - 0.5, "sube", 0.45); fx(M.acuesta - 0.5, "baja", 0.45);
fx(M.cuarenta - 0.4, "tiza-larga", 0.5); fx(M.equilibrio - 0.3, "campana", 0.5);
fx(M.fichas, "pop", 0.45); fx(M.fichas + 0.35, "pop", 0.45);
fx(E(12) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(recta|ascensor|bisagra|paralela|c|t|inclinación|empina|acuesta|equilibrio|DA|Y|perillas|arranca|empinada)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const A5 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a5-bisagra-ascensor.mp3" sinSonido={sinSonido} />
);
