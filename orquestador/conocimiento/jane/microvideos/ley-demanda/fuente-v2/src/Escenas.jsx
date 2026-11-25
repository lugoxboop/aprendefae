/* Los cuatro planos del video: gancho, calle, puesto de Rufo y pizarra grande. */
import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  Mascota, Sombra, Pieza, MangoImg, Camara, Globo,
  TINTA, CREMA, MANGO, TIZA, PIZARRA,
} from "./base.jsx";
import { clamp01, lerp, suave, sale, rampa, rebote, pulso, fmt } from "./tiempo.js";
import {
  DIAS, LETRERO, COMPRAS, M, S, E, W,
  REBOBINA, X1, X2, X3, X4, X5, X6, X7,
} from "./guion.js";

/* cámara por movimientos: {a, b, s, x, y}; antes de a se queda donde estaba */
function mover(t, inicio, movs) {
  let est = inicio;
  for (const m of movs) {
    if (t >= m.b) est = m;
    else if (t > m.a) {
      const p = suave((t - m.a) / (m.b - m.a));
      return { s: lerp(est.s, m.s, p), x: lerp(est.x, m.x, p), y: lerp(est.y, m.y, p) };
    } else break;
  }
  return est;
}

/* ── Canasta con mangos dentro ── */
const HUECOS = [[0.27, 0.3], [0.5, 0.27], [0.73, 0.3], [0.385, 0.17], [0.615, 0.17]];
const FRENTE_CANASTA = "polygon(0% 19%, 8% 28%, 22% 34.5%, 50% 38%, 78% 34.5%, 92% 28%, 100% 19%, 100% 100%, 0% 100%)";
function Canasta({ x, y, w, dentro = [], golpe = 0 }) {
  const h = (w * 506) / 608;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, transformOrigin: "50% 100%", transform: `scale(${1 + golpe * 0.05}, ${1 - golpe * 0.07})` }}>
      <Img src={staticFile("art/canasta.png")} style={{ position: "absolute", inset: 0, width: w }} />
      {dentro.map((m) => (
        <MangoImg key={m.k} x={HUECOS[m.k][0] * w} y={HUECOS[m.k][1] * h} w={w * 0.34} giro={[-18, 8, 24, -6, 14][m.k]} esc={m.esc ?? 1} />
      ))}
      <Img src={staticFile("art/canasta.png")} style={{ position: "absolute", inset: 0, width: w, clipPath: FRENTE_CANASTA }} />
    </div>
  );
}

/* ═════════════ 1 · GANCHO ═════════════ */
export function Gancho({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 1000 }, [{ a: 0, b: S(2), s: 1.22, x: 540, y: 1180 }]);
  const cae = rampa(t, M.soloUno - 0.5, 0.45);
  const yMango = lerp(300, 1385, cae * cae);
  const golpe = pulso(t, M.soloUno - 0.05, 0.3);
  const q = rampa(t, M.quePaso, 0.3);
  const reb = rampa(t, REBOBINA, 0.5);
  return (
    <AbsoluteFill style={{ filter: reb > 0 ? `saturate(${1 - reb * 0.7}) contrast(${1 + reb * 0.2})` : undefined }}>
      <Camara {...cam} alto={1935}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935, transform: `translateX(${reb > 0 ? Math.sin(t * 90) * 26 * reb : 0}px)` }}>
          <Img src={staticFile("art/calle-blur.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 55%, rgba(255,246,224,0) 30%, rgba(42,30,23,.35) 100%)" }} />
          <Sombra x={540} y={1560} w={760} />
          <Mascota esp="perro" x={540} y={1570} alto={960} t={t} cara="triste" cab={lerp(0, 5, cae)} orejas={5} sinCola semilla={1} />
          <Canasta x={540} y={1200} w={620} golpe={golpe} dentro={cae >= 1 ? [{ k: 1 }] : []} />
          {cae > 0 && cae < 1 && <MangoImg x={540} y={yMango} w={200} giro={cae * 200} />}
          {(() => {
            const g = t < M.soloUno - 0.75 ? rebote(rampa(t, 0.12, 0.3)) : 1 - rampa(t, M.soloUno - 0.75, 0.18);
            return (
              <Globo x={640} y={330} w={340} h={300} p={g} cola="izq">
                <MangoImg x={135} y={150} w={150} giro={-12 + 5 * Math.sin(t * 4)} />
                <div style={{ position: "absolute", left: 205, top: 60, fontSize: 110, lineHeight: 1, color: "#E5484D", transform: `scale(${1 + 0.12 * Math.sin(t * 9)})` }}>♥</div>
              </Globo>
            );
          })()}
          {q > 0 && (
            <div style={{
              position: "absolute", left: 770, top: 500, fontFamily: "Sora", fontWeight: 800, fontSize: 300, lineHeight: 1,
              color: MANGO, WebkitTextStroke: `14px ${TINTA}`, paintOrder: "stroke fill",
              transform: `scale(${rebote(q)}) rotate(${12 + 4 * Math.sin(t * 5)}deg)`, transformOrigin: "50% 80%",
            }}>?</div>
          )}
        </div>
      </Camara>
      {reb > 0 && (
        <>
          <div style={{ position: "absolute", inset: 0, opacity: 0.55 * reb, background: `repeating-linear-gradient(0deg, rgba(255,255,255,.0) 0 14px, rgba(255,255,255,.5) 14px 18px)`, transform: `translateY(${(t * 900) % 18}px)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 230, color: CREMA, WebkitTextStroke: `12px ${TINTA}`, paintOrder: "stroke fill", opacity: Math.min(1, reb * 3), letterSpacing: "-0.12em" }}>◀◀</div>
        </>
      )}
    </AbsoluteFill>
  );
}

/* ═════════════ 2 · CALLE ═════════════ */
export function Calle({ t, n }) {
  /* n = 0: Toby llega (lunes) · 1: camión casi vacío (martes) · 2: camión lleno (jueves) */
  let cam, contenido;
  if (n === 0) {
    cam = mover(t, { s: 1.75, x: 540, y: 420 }, [{ a: X1 + 0.1, b: W(2, "mercado", 0.45), s: 1.0, x: 540, y: 968 }, { a: W(2, "mercado", 0.45), b: X2 + 0.4, s: 1.12, x: 560, y: 1100 }]);
    const p = rampa(t, M.tobyLlega, 1.5);
    const x = lerp(-220, 500, sale(p));
    const andando = p > 0 && p < 1;
    const salto = andando ? Math.abs(Math.sin((t - M.tobyLlega) * 10)) * 38 : pulso(t, M.jugo, 0.4) * 30;
    const g = rampa(t, M.jugo, 0.35);
    contenido = (
      <>
        <Sombra x={x} y={1570} w={380} />
        <Mascota esp="perro" x={x} y={1575} alto={540} t={t} cara="feliz" salto={salto} ladeo={andando ? 5 * Math.sin((t - M.tobyLlega) * 10) : 0} cab={g > 0 ? 6 : 0} semilla={1} />
        <Pieza src="art/canasta.png" x={x + 175} y={1450} w={200} giro={andando ? 6 * Math.sin((t - M.tobyLlega) * 10) : 0} />
        <Globo x={610} y={640} w={360} h={330} p={rebote(g)} cola="izq">
          <Pieza src="art/jugo-vaso.png" x={180} y={165} w={150} giro={4 * Math.sin(t * 3)} />
        </Globo>
      </>
    );
  } else {
    const t0 = n === 1 ? M.camionVacio : M.camionLleno;
    cam = mover(t, { s: 1.25, x: 540, y: 1150 }, [{ a: t0, b: t0 + 1.6, s: 1.45, x: 540, y: 1050 }]);
    const p = sale(rampa(t, t0 - 0.15, 1.25));
    const esc = lerp(1.9, 0.82, p);
    const w = 548 * esc;
    const freno = pulso(t, t0 + 1.0, 0.35);
    const bote = Math.sin(t * 34) * 3 * (1 - p);
    contenido = (
      <>
        <Sombra x={540} y={lerp(2700, 1300, p)} w={w * 0.95} op={0.3} />
        <Img src={staticFile(n === 1 ? "art/camion-vacio.png" : "art/camion-lleno.png")} style={{
          position: "absolute", left: 540 - w / 2, bottom: 1935 - lerp(2700, 1300, p) - bote, width: w,
          transformOrigin: "50% 100%", transform: `rotate(${-2.5 * freno}deg) scaleY(${1 - 0.03 * freno})`,
        }} />
        {/* polvo al frenar */}
        {[-1, 1].map((d) => (
          <div key={d} style={{ position: "absolute", left: 540 + d * (150 + 120 * freno) - 60, top: 1240 - 50 * freno, width: 120, height: 120, borderRadius: "50%", background: "rgba(232,214,188,.85)", opacity: freno * 0.9, transform: `scale(${0.4 + freno})`, filter: "blur(8px)" }} />
        ))}
      </>
    );
  }
  return (
    <AbsoluteFill>
      <Camara {...cam} alto={1935}>
        <Img src={staticFile("art/calle.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935 }} />
        {contenido}
      </Camara>
    </AbsoluteFill>
  );
}

/* ═════════════ 3 · EL PUESTO DE RUFO ═════════════ */
const TOBY = { x: 225, y: 1950, alto: 640 };
const RUFO = { x: 520, y: 1262, alto: 520 };
const CAN = { x: 628, y: 1232, w: 300 };       // canasta sobre el mostrador
const LET = { x: 817, y: 1128 };               // centro del letrero de madera
/* mini-gráfica en la pizarra del puesto */
const mini = (q, p) => [858 + q * 30, 735 - p * 0.085];

function precioEn(t) {
  let k = -1;
  LETRERO.forEach((l, i) => { if (t >= l.t) k = i; });
  return k;
}

function Letrero({ t }) {
  const k = precioEn(t);
  if (k < 0) return null;
  const desde = LETRERO[k].t;
  const p = clamp01((t - desde) / 0.36);
  const antes = k > 0 ? LETRERO[k - 1].precio : null;
  const valor = LETRERO[k].precio;
  const volteo = p < 1;
  const muestra = volteo && p < 0.5 && antes ? antes : valor;
  const escY = k === 0 ? rebote(p) : volteo ? Math.abs(Math.cos(p * Math.PI)) : 1;
  const vaiven = 5 * Math.exp(-(t - desde) * 3.2) * Math.sin((t - desde) * 13);
  const sube = antes != null && valor > antes;
  const fl = antes != null ? clamp01((t - desde - 0.15) / 0.25) * clamp01(1 - (t - desde - 1.5) / 0.4) : 0;
  return (
    <>
      <div style={{
        position: "absolute", left: LET.x - 118, top: LET.y - 66, width: 236, height: 132, borderRadius: 14,
        background: CREMA, border: `7px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center",
        transform: `rotate(${vaiven - 1.5}deg) scaleY(${escY})`, boxShadow: "0 6px 0 rgba(42,30,23,.25)",
      }}>
        <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 66, color: TINTA, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{fmt(muestra)}</span>
      </div>
      {fl > 0 && (
        <svg width="90" height="110" viewBox="0 0 90 110" style={{ position: "absolute", left: LET.x + 128, top: LET.y - 60 + (sube ? -1 : 1) * (22 * (1 - fl) + 8 * Math.sin(t * 9)), opacity: fl, overflow: "visible" }}>
          <path d={sube ? "M45 6 L84 56 H60 V104 H30 V56 H6 Z" : "M45 104 L84 54 H60 V6 H30 V54 H6 Z"} fill={sube ? "#E5484D" : "#2E9E6B"} stroke={TINTA} strokeWidth="7" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
}

function MiniPizarra({ t }) {
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <g stroke={TIZA} strokeWidth="4" strokeLinecap="round" fill="none" opacity=".9">
        <path d="M858 452 V735 H1030" />
      </g>
      {COMPRAS.map((cmp) => {
        const p = rampa(t, cmp.punto, 0.3);
        if (p <= 0) return null;
        const [x, y] = mini(DIAS[cmp.dia].q, DIAS[cmp.dia].precio);
        const dest = pulso(t, cmp.punto, 0.7);
        return (
          <g key={cmp.dia}>
            <circle cx={x} cy={y} r={10 + 26 * dest} fill={MANGO} opacity={0.5 * dest} />
            <circle cx={x} cy={y} r={9 * rebote(p)} fill={TIZA} />
          </g>
        );
      })}
    </svg>
  );
}

export function Puesto({ t }) {
  /* ── cámara ── */
  const VISTA = { s: 1.15, x: 545, y: 1420 };
  const SENAL = { s: 1.9, x: 790, y: 1150 };
  const cam = mover(t, { s: 1.12, x: 540, y: 1040 }, [
    { a: S(3) + 0.9, b: LETRERO[0].t + 0.1, ...SENAL },
    { a: E(3) + 0.15, b: S(4) + 0.55, ...VISTA },
    { a: X3 + 0.4, b: X3 + 0.41, ...SENAL },                                   // (fuera de plano) prepara el corte
    { a: LETRERO[1].t + 1.0, b: S(6) + 0.25, s: 1.6, x: 330, y: 1500 },        // Toby hace cuentas
    { a: W(6, "y", 0.6) - 0.1, b: W(6, "y", 0.6) + 0.45, ...VISTA },
    { a: LETRERO[2].t - 0.32, b: LETRERO[2].t + 0.02, s: 2.25, x: 800, y: 1135 }, // tres mil: golpe de cámara
    { a: LETRERO[2].t + 0.75, b: LETRERO[2].t + 1.05, s: 1.75, x: 300, y: 1500 }, // la cara de Toby
    { a: M.ganas - 0.25, b: M.ganas + 0.35, s: 1.3, x: 430, y: 1330 },          // el globo de las ganas
    { a: M.ganasFin, b: M.ganasFin + 0.5, s: 1.32, x: 470, y: 1420 },            // un solo mango
    { a: X5 + 0.4, b: X5 + 0.41, ...SENAL },                                   // (fuera de plano)
    { a: LETRERO[3].t + 1.0, b: M.tobyVuelve + 0.7, ...VISTA },
    { a: M.aLaPizarra, b: X7 + 0.45, s: 3.3, x: 938, y: 597 },                  // a la pizarra
  ]);
  const temblor = 14 * Math.exp(-Math.max(0, t - LETRERO[2].t) * 5) * (t >= LETRERO[2].t ? 1 : 0);

  /* ── compras: qué hay en la canasta y qué mango va volando ── */
  const cmp = [...COMPRAS].reverse().find((x) => t >= x.mangos[0].sale - 0.05 && t < x.hasta);
  const dentro = cmp ? cmp.mangos.filter((m) => t >= m.cae).map((m) => ({ k: m.k, esc: 1 + 0.25 * pulso(t, m.cae, 0.25) })) : [];
  const volando = cmp ? cmp.mangos.filter((m) => t >= m.sale && t < m.cae) : [];
  const golpe = cmp ? Math.max(0, ...cmp.mangos.map((m) => pulso(t, m.cae - 0.02, 0.28))) : 0;
  const cuenta = dentro.length;
  const ultimo = cmp && cuenta ? cmp.mangos[cuenta - 1].cae : 0;

  /* ── Toby ── */
  const k = precioEn(t);
  const tDos = LETRERO[1].t, tTres = LETRERO[2].t;
  const comprando = cmp && t < cmp.fin + 1.6;
  let cara = "tranquila", orejas = 0, ojos = 1, cab = 5, salto = 0, tx = TOBY.x, ladeo = 0;
  if (comprando && cmp.dia !== 2) { cara = cmp.dia === 1 ? "tranquila" : "feliz"; salto = (cmp.dia === 1 ? 18 : 34) * golpe; }
  if (t >= tDos && t < tDos + 1.3) { salto = 60 * pulso(t, tDos + 0.05, 0.4); ojos = 1 + 0.3 * clamp01(1 - (t - tDos - 0.7) / 0.5); cab = -4; }
  if (t >= M.monedas && t < COMPRAS[1].mangos[0].sale) { cab = -9 + 4 * Math.sin((t - M.monedas) * 4); }
  if (t >= tTres && t < X5 + 0.5) {
    cara = "triste"; orejas = 7 * clamp01((t - tTres) / 0.3); cab = -6;
    salto = 50 * pulso(t, tTres + 0.02, 0.35);
    ladeo = 3 * Math.exp(-(t - tTres) * 4) * Math.sin((t - tTres) * 40);
    if (t >= M.ganas && t < M.ganasFin) { cab = -10; cara = "tranquila"; orejas = 3; }
    if (t >= M.ganasFin) cab = 9;
  }
  if (t >= X6) {
    const p = rampa(t, M.tobyVuelve, 0.85);
    tx = lerp(-320, TOBY.x, sale(p));
    cara = "feliz";
    if (p > 0 && p < 1) { salto = Math.abs(Math.sin((t - M.tobyVuelve) * 12)) * 46; ladeo = 5 * Math.sin((t - M.tobyVuelve) * 12); }
    else salto = Math.max(salto, 34 * golpe);
  }

  /* ── Rufo ── */
  const saluda = pulso(t, M.saludo, 1.3);
  const volteaLetrero = Math.max(0, ...LETRERO.map((l) => pulso(t, l.t - 0.25, 0.7)));
  const anota = Math.max(0, ...COMPRAS.map((x) => pulso(t, x.punto - 0.3, 0.9)));
  const sirve = volando.length ? 1 : 0;
  const rufo = {
    bd: -70 * volteaLetrero - 95 * anota,
    bi: saluda > 0 ? 95 * saluda + 22 * Math.sin(t * 16) * saluda : 40 * sirve * Math.abs(Math.sin(t * 9)),
    cab: 7 * volteaLetrero + 9 * anota - 5 * saluda,
    cara: saluda > 0.2 || comprando ? "feliz" : "tranquila",
    salto: 16 * saluda,
  };

  /* ── globo de las ganas (miércoles): quiere mango igual que el lunes ── */
  const g = t < M.ganasFin ? rebote(rampa(t, M.ganas, 0.35)) : 1 - rampa(t, M.ganasFin, 0.2);
  /* monedas (martes) */
  const mon = t < COMPRAS[1].mangos[0].sale + 0.2 ? rebote(rampa(t, M.monedas, 0.3)) : 1 - rampa(t, COMPRAS[1].mangos[0].sale + 0.2, 0.2);

  return (
    <AbsoluteFill>
      <Camara {...cam} temblor={temblor} t={t}>
        <Img src={staticFile("art/puesto.jpg")} style={{ position: "absolute", left: -15, top: 0, width: 1110, height: 1920 }} />
        <Mascota esp="huron" {...RUFO} t={t} semilla={2} sinCola cara={rufo.cara} bd={rufo.bd} bi={rufo.bi} cab={rufo.cab} salto={rufo.salto} />
        <Img src={staticFile("art/puesto-frente.png")} style={{ position: "absolute", left: -15, top: 0, width: 1110, height: 1920 }} />
        <MiniPizarra t={t} />
        <Letrero t={t} />

        <Canasta {...CAN} dentro={dentro} golpe={golpe} />
        {volando.map((m) => {
          const p = (t - m.sale) / (m.cae - m.sale);
          const x0 = 500, y0 = 1010;
          const x1 = CAN.x - CAN.w / 2 + HUECOS[m.k][0] * CAN.w, y1 = CAN.y + HUECOS[m.k][1] * 250;
          return <MangoImg key={m.k} x={lerp(x0, x1, p)} y={lerp(y0, y1, p) - 210 * Math.sin(p * Math.PI)} w={104} giro={-40 + p * 300} />;
        })}
        {cuenta > 0 && (
          <div style={{
            position: "absolute", left: CAN.x - 230, top: CAN.y - 120, width: 150, height: 150, borderRadius: "50%",
            background: MANGO, border: `8px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Sora", fontWeight: 800, fontSize: 96, color: TINTA, boxShadow: "0 8px 0 rgba(42,30,23,.25)",
            transform: `scale(${0.85 + 0.3 * rebote(rampa(t, ultimo, 0.25))}) rotate(-6deg)`,
          }}>{cuenta}</div>
        )}

        <Sombra x={tx} y={1900} w={430} />
        <Mascota esp="perro" x={tx} y={TOBY.y} alto={TOBY.alto} t={t} semilla={1} cara={cara} orejas={orejas} ojos={ojos} cab={cab} salto={salto} ladeo={ladeo} sinCola />

        {mon > 0 && k === 1 && <Pieza src="art/monedas.png" x={470} y={1560} w={190} esc={mon} giro={-8 + 5 * Math.sin(t * 5)} />}
        {g > 0 && t >= M.ganas && (
          <Globo x={300} y={900} w={470} h={380} p={g} cola="izq">
            {[[150, 150], [245, 120], [335, 160], [195, 235], [295, 245]].map(([mx, my], i) => (
              <MangoImg key={i} x={mx} y={my} w={110} giro={-20 + i * 14 + 4 * Math.sin(t * 3 + i)} />
            ))}
          </Globo>
        )}
      </Camara>
    </AbsoluteFill>
  );
}

/* ═════════════ 4 · LA PIZARRA GRANDE ═════════════ */
const OX = 290, OY = 1100;                         // origen de los ejes
const gx = (q) => OX + q * 118;
const gy = (p) => OY - p * 0.17;
const PTS = DIAS.map((d) => [gx(d.q), gy(d.precio)]);
const RECTA = [[gx(0.35), gy(3325)], [gx(5.6), gy(700)]];
const LARGO = Math.hypot(RECTA[1][0] - RECTA[0][0], RECTA[1][1] - RECTA[0][1]);
const enRecta = (q) => [gx(q), gy(3500 - 500 * q)];

const Tiza = ({ x, y, children, tam = 54, color = TIZA, op = 1, ancla = "start", giro = 0 }) => (
  <text x={x} y={y} fontFamily="Caveat" fontWeight="700" fontSize={tam} fill={color} opacity={op} textAnchor={ancla} transform={giro ? `rotate(${giro} ${x} ${y})` : undefined}>{children}</text>
);

function Grafica({ t }) {
  const pl = suave(rampa(t, M.linea, 1.3));
  const quieta = pulso(t, M.quieta, 1.4);
  /* el mango que se mueve SOBRE la curva */
  let q = null;
  if (t >= M.sube0 && t < M.quieta) q = lerp(5, 1, suave(rampa(t, M.sube0, M.baja + 0.3 - M.sube0)));
  if (t >= M.quieta) q = 3 - 2 * Math.cos(rampa(t, M.recorre, 2.8) * Math.PI * 2);   // 1 → 5 → 1, sin salirse de la recta
  const fSube = rampa(t, M.sube, 0.3), fBaja = rampa(t, M.baja, 0.3);
  const flechasFuera = 1 - rampa(t, M.quieta - 0.3, 0.3);
  const cet = rampa(t, M.ceteris, 0.5);
  const nom = rampa(t, M.nombre, 1.0);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <filter id="tiza" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="r" />
          <feDisplacementMap in="SourceGraphic" in2="r" scale="5" />
        </filter>
        <clipPath id="escribe"><rect x="100" y="225" width={880 * nom} height="165" /></clipPath>
      </defs>
      <g filter="url(#tiza)">
        {/* título: se nombra DESPUÉS de verlo */}
        <g clipPath="url(#escribe)">
          <Tiza x={540} y={345} tam={128} color={MANGO} ancla="middle">Ley de la demanda</Tiza>
        </g>
        {/* ejes */}
        <g stroke={TIZA} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={`M${OX} 480 V${OY} H965`} />
          <path d={`M${OX - 20} 508 L${OX} 474 L${OX + 20} 508 M935 ${OY - 20} L969 ${OY} L935 ${OY + 20}`} />
        </g>
        <Tiza x={OX} y={452} ancla="middle" tam={72 + 16 * pulso(t, M.ejePrecio, 0.6)} color={pulso(t, M.ejePrecio, 0.9) > 0.05 ? MANGO : TIZA}>precio</Tiza>
        <Tiza x={975} y={OY + 132} tam={70 + 16 * pulso(t, M.ejeMangos, 0.6)} ancla="end" color={pulso(t, M.ejeMangos, 0.9) > 0.05 ? MANGO : TIZA}>mangos de Toby</Tiza>
        {DIAS.map((d, i) => (
          <g key={i} opacity=".88">
            <Tiza x={OX - 24} y={gy(d.precio) + 20} tam={62} ancla="end">{fmt(d.precio)}</Tiza>
            <Tiza x={gx(d.q)} y={OY + 66} tam={66} ancla="middle">{d.q}</Tiza>
            <path d={`M${OX} ${gy(d.precio)} H${gx(d.q)} V${OY}`} stroke={TIZA} strokeWidth="3" strokeDasharray="4 14" strokeLinecap="round" fill="none" opacity=".4" />
          </g>
        ))}
        {/* la curva: una sola recta, que no se mueve */}
        <path d={`M${RECTA[0][0]} ${RECTA[0][1]} L${RECTA[1][0]} ${RECTA[1][1]}`} stroke={MANGO} strokeWidth={14 + 9 * quieta} strokeLinecap="round" fill="none" strokeDasharray={LARGO} strokeDashoffset={LARGO * (1 - pl)} />
        {pl >= 1 && <Tiza x={RECTA[1][0] - 4} y={RECTA[1][1] - 30} tam={84} color={MANGO}>D</Tiza>}
        {/* los cuatro puntos */}
        {PTS.map(([x, y], i) => {
          const p = rebote(rampa(t, X7 + 0.5 + i * 0.22, 0.3));
          return <circle key={i} cx={x} cy={y} r={21 * p} fill={TIZA} />;
        })}
        {/* flechas: precio sube → cantidad baja */}
        {fSube > 0 && flechasFuera > 0 && (() => {
          const y0 = gy(1000), y1 = gy(3000), L = y0 - y1 + 60;
          return (
            <path d={`M${OX + 30} ${y0} V${y1} M${OX + 4} ${y1 + 36} L${OX + 30} ${y1 - 2} L${OX + 56} ${y1 + 36}`} opacity={flechasFuera}
              stroke="#FF8A7A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={L + 120} strokeDashoffset={(L + 120) * (1 - fSube)} />
          );
        })()}
        {fBaja > 0 && flechasFuera > 0 && (() => {
          const x0 = gx(5), x1 = gx(1), L = x0 - x1 + 60;
          return (
            <path d={`M${x0} ${OY - 30} H${x1} M${x1 + 36} ${OY - 56} L${x1 - 2} ${OY - 30} L${x1 + 36} ${OY - 4}`} opacity={flechasFuera}
              stroke="#8FD3FF" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={L + 120} strokeDashoffset={(L + 120) * (1 - fBaja)} />
          );
        })()}
        {cet > 0 && flechasFuera > 0 && (
          <g opacity={cet * flechasFuera}>
            <Tiza x={770} y={555} tam={72} ancla="middle" giro={-3}>si todo lo demás</Tiza>
            <Tiza x={785} y={630} tam={72} ancla="middle" giro={-3}>sigue igual</Tiza>
          </g>
        )}
        {t >= M.quieta && (
          <g opacity={rampa(t, M.quieta, 0.3)}>
            <Tiza x={770} y={555} tam={74} ancla="middle" giro={-3} color={MANGO}>la curva</Tiza>
            <Tiza x={785} y={630} tam={74} ancla="middle" giro={-3} color={MANGO}>no se movió</Tiza>
          </g>
        )}
      </g>
      {/* el mango de Toby, sobre la curva */}
      {q != null && (() => {
        const [x, y] = enRecta(q);
        return (
          <g>
            <circle cx={x} cy={y} r="62" fill={MANGO} opacity=".25" />
            <image href={staticFile("art/mango.png")} x={x - 55} y={y - 52} width="110" height="104" />
          </g>
        );
      })()}
    </svg>
  );
}

/* los dos dibujos del cierre: ¿se mueve la curva, o te mueves sobre ella? */
function Opciones({ t }) {
  const a = rebote(rampa(t, M.cajas, 0.35)), b = rebote(rampa(t, M.cajas + 0.3, 0.35));
  const fin = t >= E(15) + 0.1;
  const enA = fin ? Math.sin((t - E(15)) * 7) > 0 : t >= M.optA && t < M.optB;
  const enB = fin ? !enA : t >= M.optB;
  const vai = t < M.optA ? 0 : 0.5 - 0.5 * Math.cos((t - M.optA) * 3.2);
  const vai2 = t < M.optB ? 0 : 0.5 - 0.5 * Math.cos((t - M.optB) * 3.2);
  const Caja = ({ x, p, children, titulo, viva }) => (
    <g transform={`translate(${x} 560) scale(${p * 1.15 * (viva ? 1.03 : 1)})`} opacity={Math.min(1, p)}>
      <rect x="-190" y="0" width="380" height="430" rx="26" fill={viva ? "rgba(245,184,46,.10)" : "none"} stroke={viva ? MANGO : TIZA} strokeWidth={viva ? 9 : 6} strokeDasharray="6 16" strokeLinecap="round" />
      <path d="M-130 50 V330 H140" stroke={TIZA} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {children}
      {titulo.map((l, i) => <Tiza key={i} x={0} y={390} tam={41} ancla="middle">{l}</Tiza>)}
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g filter="url(#tiza)">
        <Tiza x={540} y={390} tam={150} color={MANGO} ancla="middle">Ahora te toca</Tiza>
        <Caja x={302} p={a} viva={enA} titulo={["¿se mueve la curva?"]}>
          <path d="M-100 90 L60 290" stroke={TIZA} strokeWidth="6" strokeLinecap="round" opacity=".35" strokeDasharray="10 12" />
          <path d={`M${-100 + 70 * vai} 90 L${60 + 70 * vai} 290`} stroke={MANGO} strokeWidth="10" strokeLinecap="round" />
          <path d="M40 130 H110 M88 110 L112 130 L88 150" stroke={TIZA} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Caja>
        <Caja x={778} p={b} viva={enB} titulo={["¿o te mueves sobre ella?"]}>
          <path d="M-100 90 L60 290" stroke={MANGO} strokeWidth="10" strokeLinecap="round" />
          <circle cx={-80 + 120 * vai2} cy={115 + 150 * vai2} r="20" fill={TIZA} />
        </Caja>
      </g>
    </svg>
  );
}

export function PizarraGrande({ t }) {
  const cam = mover(t, { s: 1.12, x: 540, y: 800 }, [
    { a: X7, b: X7 + 1.6, s: 1.0, x: 540, y: 960 },
    { a: M.linea, b: M.nombre, s: 1.06, x: 560, y: 820 },
    { a: M.nombre - 0.2, b: M.nombre + 0.9, s: 1.0, x: 540, y: 960 },
    { a: M.sube0, b: M.sube + 0.3, s: 1.3, x: 430, y: 760 },                 // el precio sube
    { a: M.baja - 0.2, b: M.baja + 0.5, s: 1.3, x: 560, y: 1010 },             // la cantidad baja
    { a: M.ceteris - 0.2, b: M.ceteris + 0.5, s: 1.22, x: 640, y: 760 },       // si todo lo demás sigue igual
    { a: M.quieta - 0.3, b: M.quieta + 0.4, s: 1.12, x: 600, y: 820 },
    { a: M.recorre - 0.1, b: M.recorre + 0.6, s: 1.0, x: 540, y: 960 },
    { a: M.recorre + 1.2, b: M.cierre, s: 1.1, x: 580, y: 880 },
    { a: M.cierre, b: M.cierre + 0.6, s: 1.0, x: 540, y: 960 },
    { a: M.optA - 0.25, b: M.optA + 0.3, s: 1.38, x: 330, y: 800 },            // ¿se mueve la curva…
    { a: M.optB - 0.25, b: M.optB + 0.3, s: 1.38, x: 750, y: 800 },            // …o te mueves sobre ella?
    { a: E(15) + 0.05, b: E(15) + 0.7, s: 1.0, x: 540, y: 960 },
  ]);
  const cierre = rampa(t, M.cierre, 0.5);
  const asoma = sale(rampa(t, M.asoma, 0.5));
  const rufoEntra = sale(rampa(t, X7 + 0.3, 0.6));
  const brinda = pulso(t, M.cierre + 0.2, 1.2);
  return (
    <AbsoluteFill>
      <Camara {...cam}>
        <Img src={staticFile("art/calle-blur.jpg")} style={{ position: "absolute", left: 0, top: -8, width: 1080, height: 1935 }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(30,22,16,.28)" }} />
        {/* la pizarra de Rufo, con su marco de madera */}
        <div style={{ position: "absolute", left: 52, top: 188, width: 976, height: 1092, borderRadius: 26, background: "#8A5A33", border: `8px solid ${TINTA}`, boxShadow: "0 22px 0 rgba(42,30,23,.28)" }}>
          <div style={{ position: "absolute", inset: 20, borderRadius: 12, background: PIZARRA, border: `6px solid ${TINTA}`, backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(241,238,227,.07), transparent 60%), radial-gradient(ellipse at 75% 80%, rgba(241,238,227,.05), transparent 55%)" }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - cierre }}><Grafica t={Math.min(t, M.cierre + 0.6)} /></div>
        {cierre > 0 && <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: cierre }}><Opciones t={t} /></div>}
        {/* Rufo junto a su pizarra; Toby asoma cuando se nombra la ley */}
        <Sombra x={880} y={1640} w={330} />
        <Mascota esp="huron" x={880} y={lerp(2200, 1650, rufoEntra)} alto={430} t={t} semilla={2} sinCola
          cara={t >= M.nombre ? "feliz" : "tranquila"} bi={-60 * pulso(t, M.linea, 1.4) - 60 * pulso(t, M.nombre, 1.1)} cab={-6} />
        {asoma > 0 && (
          <>
            <Sombra x={200} y={1640} w={330} />
            <Mascota esp="perro" x={200} y={lerp(2200, 1650, asoma)} alto={440} t={t} semilla={1} sinCola
              cara={t >= M.cierre ? "feliz" : "tranquila"} cab={6} salto={30 * pulso(t, M.asoma + 0.5, 0.4) + 26 * brinda} bd={cierre > 0 ? -50 * brinda : 0} />
            {cierre > 0 && <Pieza src="art/jugo-vaso.png" x={365} y={1480 - 26 * brinda} w={120} esc={rebote(cierre)} giro={8 - 14 * brinda} />}
          </>
        )}
      </Camara>
    </AbsoluteFill>
  );
}
