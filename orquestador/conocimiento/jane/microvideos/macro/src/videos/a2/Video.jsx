/*
 * A2 · «¿Dónde quedó el sueldo de Nina?» (da26-a2-vaso-renta). Una idea: C = C̄ + c(Y + TR − T).
 * Datos: Y = 1.000.000; T = 25 % = 250.000; TR = 50.000; Yd = 800.000; c = 0,8 → 640.000 y 160.000.
 * El sueldo es agua: grifo (Y) → desagüe del Gobierno (T) → gotero (TR) → vaso (Yd) → taza (C) y alcancía (ahorro).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Pizarra, Tiza, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.5, 0.3, 0.3, 0.5, 0.4] });
const { S, E, W, c } = T;

const M = {
  sueldo: W(1, "millón", 0.3),
  pregunta: W(1, "Cuánto", 0.5),
  grifo: S(2) + 0.2, y: W(2, "renta", 0.7),
  tajo: W(3, "tajo", 0.6) - 0.2, cuarta: W(3, "cuarta", 0.8),
  gotas: W(4, "gotas", 0.4) - 0.2, tr: W(4, "transferencias", 0.6),
  yd: W(5, "disponible", 0.5), ochocientos: W(5, "ochocientos", 0.8),
  vierte: S(6) + 0.3,
  c: W(7, "propensión", 0.6),
  cifras: S(8) + 0.2, consumo: W(8, "consumo", 0.4), alcancia: W(8, "alcancía", 0.8),
  cierra: W(9, "grifo", 0.7), preocupa: S(9) + 0.3,
  ahorros: W(10, "ahorros", 0.4), prestado: W(10, "prestado", 0.6), ayuda: W(10, "ayuda", 0.85),
  cbarra: W(11, "autónomo", 0.7),
  formula: S(12) - 0.1,
  piezas: S(13) + 0.1,
};

const PLANOS = [
  { tipo: "cocina", desde: 0 },
  { tipo: "agua", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "seco", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "pizarra", desde: S(12) - 0.35, entra: "fundido" },
  { tipo: "cierre", desde: S(13) - 0.2, entra: "zoom" },
];

/* ── piezas de agua ── */
const AGUA = "#5CC3E8", AGUA_O = "#2E8FC0";
/* chorro vertical de (x, y0) a y1, ancho w; p 0..1 lo hace bajar */
function Chorro({ x, y0, y1, w, p, t, color = AGUA }) {
  if (p <= 0) return null;
  const largo = (y1 - y0) * clamp01(p);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y0, width: w, height: largo, borderRadius: w / 2, background: `repeating-linear-gradient(180deg, ${color} 0 26px, ${AGUA_O} 26px 34px)`, backgroundPositionY: `${t * 420}px`, border: `5px solid ${TINTA}`, opacity: 0.95 }} />
  );
}
/* vaso transparente con nivel; (x, y) centro arriba */
function Vaso({ x, y, w, h, nivel, rotulo, op = 1, giro = 0 }) {
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, opacity: op, transform: `rotate(${giro}deg)`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${clamp01(nivel) * 92}%`, background: `linear-gradient(180deg, ${AGUA}, ${AGUA_O})`, borderRadius: "0 0 40px 40px" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -6, height: 14, background: "rgba(255,255,255,.55)", borderRadius: 7 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, border: `9px solid ${TINTA}`, borderTop: "none", borderRadius: "0 0 44px 44px", background: "rgba(255,255,255,.18)" }} />
      <div style={{ position: "absolute", left: 22, top: 30, width: 22, height: h * 0.6, background: "rgba(255,255,255,.5)", borderRadius: 11 }} />
      {rotulo && <div style={{ position: "absolute", left: 0, right: 0, bottom: h * 0.32, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: "#fff", WebkitTextStroke: `9px ${TINTA}`, paintOrder: "stroke fill" }}>{rotulo}</div>}
    </div>
  );
}
/* taza de consumo */
function Taza({ x, y, w, nivel, rotulo }) {
  const h = w * 0.8;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", right: -w * 0.22, top: h * 0.2, width: w * 0.34, height: h * 0.45, border: `9px solid ${TINTA}`, borderRadius: "0 50% 50% 0", borderLeft: "none", background: "transparent" }} />
      <div style={{ position: "absolute", inset: 0, background: COLOR.C, border: `9px solid ${TINTA}`, borderRadius: "10px 10px 46% 46%", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - clamp01(nivel)) * 100}%`, bottom: 0, background: `linear-gradient(180deg, ${AGUA}, ${AGUA_O})`, opacity: 0.85 }} />
      </div>
      {rotulo && <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 60, color: "#fff", WebkitTextStroke: `9px ${TINTA}`, paintOrder: "stroke fill" }}>{rotulo}</div>}
    </div>
  );
}

/* ═════ 1 · Nina mira su recibo de pago ═════ */
function Cocina({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 1100 }, [{ a: 0.2, b: E(1), s: 1.3, x: 520, y: 1180 }]);
  const recibo = rampa(t, 0.3, 0.5);
  const cifra = rampa(t, M.sueldo - 0.1, 0.35);
  const q = rampa(t, M.pregunta, 0.3);
  return (
    <Escena cam={cam} fondo="art/cocina.jpg">
      <Sombra x={420} y={1640} w={330} />
      <Mascota esp="conejo" x={420} y={1645} alto={600} t={t} cara={q > 0.5 ? "tranquila" : "feliz"} bd={-70 * recibo} cab={q * 6} semilla={2} />
      <Obj src="macro2026/objetos/recibo.png" x={620} y={1210 - 20 * Math.sin(t * 2)} w={180} giro={-8 + 3 * Math.sin(t * 2)} op={recibo} esc={0.6 + 0.4 * sale(recibo)} />
      <Placa x={420} y={830} nombre="Nina" rol="Familia" p={rampa(t, 0.5, 0.35)} />
      <Cartel x={600} y={560} txt="$1.000.000" p={cifra} tam={96} fondo={MANGO} giro={-3} />
      <Gigante x={870} y={850} txt="?" p={q} tam={260} giro={12 + 4 * Math.sin(t * 5)} />
    </Escena>
  );
}

/* ═════ 2-8 · El sueldo como agua ═════ */
function Agua({ t }) {
  const cam = mover(t, { s: 1.25, x: 540, y: 600 }, [
    { a: S(2), b: E(2), s: 1.0, x: 540, y: 968 },
    { a: S(5), b: S(5) + 1.0, s: 1.1, x: 540, y: 1080 },
    { a: S(6) - 0.2, b: S(6) + 0.8, s: 1.0, x: 540, y: 968 },
  ]);
  const abre = rampa(t, M.grifo, 0.6);
  /* nivel del vaso: sube con Y, el desagüe le quita, las gotas le suman; luego se vierte */
  const vierte = rampa(t, M.vierte, 2.2);
  const llena = 0.75 * rampa(t, M.grifo + 0.3, 4.0) + 0.06 * rampa(t, M.gotas, 1.6);
  const nivel = llena * (1 - vierte);
  const tajo = rampa(t, M.tajo, 0.5);
  const gotero = rampa(t, M.gotas - 0.4, 0.5);
  const cifraY = rampa(t, M.y, 0.35);
  const cifraT = rampa(t, M.cuarta - 0.6, 0.35);
  const cifraTR = rampa(t, M.tr, 0.35);
  const cifraYd = rampa(t, M.yd, 0.35);
  const fueraCifras = rampa(t, S(6) - 0.2, 0.3);
  const giro = -38 * sale(rampa(t, M.vierte - 0.2, 0.6)) * (1 - rampa(t, M.vierte + 2.4, 0.5));
  const taza = 0.8 * vierte, alc = vierte;
  return (
    <Escena cam={cam} fondo="art/cocina.jpg" filtro="blur(5px) saturate(.95)" velo={0.18}>
      {/* el grifo dorado (Y) */}
      <Obj src="macro2026/ilustrados/grifo.webp" x={600} y={260} w={360} />
      <Chorro x={540} y0={360} y1={900} w={70} p={abre * (1 - rampa(t, M.vierte - 0.4, 0.3))} t={t} />
      {/* desagüe del Gobierno (T): se lleva un chorro hacia la izquierda */}
      {tajo > 0 && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
          <path d="M 520 560 C 380 600, 260 640, 190 760" fill="none" stroke={TINTA} strokeWidth={48} strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - tajo)} opacity={1 - vierte} />
          <path d="M 520 560 C 380 600, 260 640, 190 760" fill="none" stroke={AGUA} strokeWidth={34} strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 * (1 - tajo)} opacity={1 - vierte} />
        </svg>
      )}
      <Obj src="macro2026/ilustrados/buzon-impuesto.webp" x={170} y={880} w={240} op={rampa(t, M.tajo - 0.3, 0.3) * (1 - vierte)} esc={rebote(rampa(t, M.tajo - 0.3, 0.4))} />
      <Cartel x={200} y={560} txt="T · −250.000" p={cifraT * (1 - fueraCifras)} tam={58} fondo={COLOR.CORAL} color="#fff" />
      {/* la ministra Mei con su gotero (TR) */}
      {gotero > 0 && (
        <>
          <Mascota esp="panda-traje" x={lerp(1250, 900, sale(gotero))} y={1020} alto={380} t={t} cara="feliz" bi={-60} semilla={4} espejo op={1 - vierte} />
          {[0, 1, 2, 3].map((k) => {
            const p = ((t - M.gotas + k * 0.25) % 1) / 1;
            if (t < M.gotas || t > M.vierte) return null;
            return <div key={k} style={{ position: "absolute", left: 760, top: lerp(700, 960, p), width: 30, height: 40, background: AGUA, border: `5px solid ${TINTA}`, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", opacity: 1 - p * 0.3 }} />;
          })}
        </>
      )}
      <Cartel x={850} y={600} txt="TR · +50.000" p={cifraTR * (1 - fueraCifras)} tam={58} fondo={COLOR.VERDE} color="#fff" />
      {/* el vaso */}
      <Vaso x={560} y={880} w={380} h={480} nivel={nivel} rotulo={cifraY > 0 && cifraYd <= 0 ? "Y" : cifraYd > 0 ? "Yd" : null} giro={giro} />
      <Cartel x={540} y={340} txt="Y · renta" p={cifraY * (1 - rampa(t, S(3), 0.3))} tam={72} fondo={MANGO} />
      <Destello x={560} y={1100} r={380} p={rampa(t, M.yd - 0.1, 0.7)} />
      <Cartel x={560} y={1450} txt="Y + TR − T = 800.000" p={cifraYd * (1 - fueraCifras)} tam={64} fondo={CREMA} />
      {/* se vierte: 80 % a la taza, 20 % a la alcancía */}
      {t > S(6) - 0.4 && (
        <>
          <Taza x={830} y={1130} w={300} nivel={taza} rotulo={rampa(t, M.c, 0.3) > 0 ? "c = 0,8" : "80 %"} />
          <Obj src="macro2026/ilustrados/alcancia.webp" x={250} y={1260} w={300} esc={1 + 0.06 * pulso(t, M.vierte + 1.4, 0.4)} />
          <Cartel x={250} y={1060} txt="20 %" p={rampa(t, M.vierte + 0.8, 0.3) * (1 - rampa(t, M.cifras, 0.2))} tam={56} />
          <Monedas2 t={t} t0={M.vierte + 1.0} />
          {vierte > 0 && vierte < 1 && <Chorro x={760} y0={980} y1={1130} w={46} p={1} t={t} />}
        </>
      )}
      <Destello x={830} y={1230} r={260} p={rampa(t, M.c - 0.1, 0.6)} />
      <Cartel x={830} y={1450} txt="$640.000" p={rampa(t, M.consumo, 0.35)} tam={66} fondo={COLOR.C} />
      <Cartel x={250} y={1450} txt="$160.000" p={rampa(t, M.alcancia, 0.35)} tam={66} fondo={CREMA} />
    </Escena>
  );
}
function Monedas2({ t, t0 }) {
  return [0, 1, 2].map((k) => {
    const p = rampa(t, t0 + k * 0.3, 0.6);
    if (p <= 0 || p >= 1) return null;
    return <Obj key={k} src="macro2026/ilustrados/moneda-oro.webp" x={lerp(470, 260, p)} y={lerp(1050, 1200, p) - Math.sin(p * Math.PI) * 120} w={70} giro={p * 300} />;
  });
}

/* ═════ 9-11 · El grifo se cierra ═════ */
function Seco({ t }) {
  const t0 = S(9) - 0.3;
  const cam = mover(t, { s: 1.08, x: 540, y: 980 }, [{ a: M.cierra, b: M.cierra + 1.2, s: 1.0, x: 540, y: 968 }, { a: M.cbarra - 0.4, b: M.cbarra + 0.6, s: 1.2, x: 600, y: 1150 }]);
  const gota = pulso(t, M.cierra + 0.2, 1.0);
  const abre = rampa(t, M.ahorros, 0.4);
  const ayuda = rampa(t, M.ayuda, 0.5);
  return (
    <Escena cam={cam} fondo="art/cocina.jpg">
      <Obj src="macro2026/ilustrados/grifo.webp" x={600} y={420} w={300} giro={-4 * pulso(t, M.cierra, 0.3)} />
      {gota > 0 && <div style={{ position: "absolute", left: 528, top: lerp(500, 640, gota), width: 26, height: 34, background: AGUA, border: `5px solid ${TINTA}`, borderRadius: "50%" }} />}
      <Cartel x={540} y={760} txt="Y = 0" p={rampa(t, M.cierra + 0.3, 0.35) * (1 - rampa(t, S(10), 0.3))} tam={80} fondo={COLOR.CORAL} color="#fff" />
      <Sombra x={290} y={1640} w={320} />
      <Mascota esp="conejo" x={290} y={1645} alto={560} t={t} cara={t < M.ahorros ? "triste" : "tranquila"} orejas={t < M.ahorros ? -5 : 0} semilla={2} bd={-50 * abre} />
      {/* la alcancía se abre y suelta monedas */}
      <Obj src="macro2026/ilustrados/alcancia.webp" x={780} y={1540} w={220} giro={-20 * abre} op={1 - rampa(t, M.prestado, 0.3)} />
      {[0, 1, 2].map((k) => {
        const p = rampa(t, M.ahorros + 0.2 + k * 0.2, 0.7);
        if (p <= 0 || p >= 1) return null;
        return <Obj key={k} src="macro2026/ilustrados/moneda-oro.webp" x={lerp(780, 980, p)} y={lerp(1490, 1540, p) - Math.sin(p * Math.PI) * 180} w={70} giro={p * 300} />;
      })}
      <Cartel x={780} y={1330} txt="ahorros" p={rampa(t, M.ahorros, 0.3) * (1 - rampa(t, M.prestado, 0.2))} tam={52} />
      <Cartel x={780} y={1330} txt="préstamo" p={rampa(t, M.prestado, 0.3) * (1 - rampa(t, M.ayuda, 0.2))} tam={52} />
      {ayuda > 0 && <Mascota esp="panda-traje" x={lerp(1250, 920, sale(ayuda))} y={1645} alto={460} t={t} cara="feliz" bi={-50 * pulso(t, M.ayuda + 0.3, 0.8)} semilla={4} espejo />}
      <Cartel x={880} y={960} txt="ayuda" p={rampa(t, M.ayuda + 0.2, 0.3)} tam={52} fondo={COLOR.VERDE} color="#fff" />
      {/* la tacita que nunca se vacía */}
      <Taza x={560} y={1400} w={180} nivel={0.6 + 0.05 * Math.sin(t * 3)} />
      <Destello x={560} y={1470} r={220} p={rampa(t, M.cbarra - 0.1, 0.6)} />
      <Gigante x={560} y={1230} txt="C̄" p={rampa(t, M.cbarra, 0.35)} tam={200} color={COLOR.C} />
    </Escena>
  );
}

/* ═════ 12 · Olga junta todo en la pizarra ═════ */
function PlanoPizarra({ t }) {
  const t0 = S(12) - 0.35;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t0, b: E(12), s: 1.06, x: 540, y: 930 }]);
  const partes = [["C", MANGO], ["=", "#fff"], ["C̄", COLOR.C], ["+", "#fff"], ["c", COLOR.C], ["(", "#fff"], ["Y", AGUA], ["+", "#fff"], ["TR", COLOR.X], ["−", "#fff"], ["T", COLOR.CORAL], [")", "#fff"]];
  const t1 = M.formula;
  const auto = pulso(t, W(12, "autónomo", 0.4), 0.9);
  const frac = pulso(t, W(12, "fracción", 0.6), 1.2);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={60} y={330} w={960} h={760}>
        <Tiza x={450} y={60} txt="Función de consumo" p={rampa(t, t1, 0.8)} tam={88} centro />
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", gap: 8 }}>
          {partes.map(([s, col], i) => {
            const p = rampa(t, t1 + 0.5 + i * 0.12, 0.3);
            const brilla = (i === 2 ? auto : 0) + (i >= 4 ? frac : 0);
            return <span key={i} style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 118, color: col, opacity: p, transform: `translateY(${(1 - sale(p)) * 30 - brilla * 16}px) scale(${1 + brilla * 0.18})`, display: "inline-block" }}>{s}</span>;
          })}
        </div>
        <Tiza x={230} y={500} txt="autónomo" p={rampa(t, W(12, "autónomo", 0.4), 0.6)} tam={54} centro color={COLOR.C} />
        <Tiza x={640} y={500} txt="parte de la renta disponible" p={rampa(t, W(12, "fracción", 0.6), 0.8)} tam={54} centro />
      </Pizarra>
      <Sombra x={830} y={1660} w={320} />
      <Mascota esp="gato-gafas" x={830} y={1665} alto={560} t={t} cara="feliz" bi={-60 * clamp01(Math.sin((t - t1) * 3)) * (t < E(12) ? 1 : 0)} semilla={7} espejo />
      <Placa x={830} y={1130} nombre="Olga" rol="Analista" p={rampa(t, t1 + 0.3, 0.35)} />
    </Escena>
  );
}

/* ═════ 13 · Las piezas se separan y esperan ═════ */
function Cierre({ t }) {
  const t0 = S(13) - 0.2;
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: t0, b: T.DURACION_S, s: 0.98, x: 540, y: 968 }]);
  const fichas = [["C̄", COLOR.C, 240, 520], ["c", COLOR.C, 840, 560], ["Y", AGUA, 220, 1000], ["TR", COLOR.X, 860, 1040], ["T", COLOR.CORAL, 540, 1300]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {fichas.map(([s, col, x, y], i) => {
        const p = rampa(t, M.piezas + i * 0.15, 0.6);
        const xx = lerp(540, x, sale(p)), yy = lerp(860, y, sale(p)) + 12 * Math.sin(t * 2 + i);
        return (
          <div key={i} style={{ position: "absolute", left: xx - 110, top: yy - 90, width: 220, height: 180, background: col, border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 10px 0 rgba(42,30,23,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 100, color: TINTA, opacity: Math.min(1, p * 3), transform: `rotate(${(i % 2 ? 1 : -1) * 6 * p}deg)` }}>{s}</div>
        );
      })}
      <div style={{ position: "absolute", left: 230, top: 760, width: 620, height: 200, border: `8px dashed ${TINTA}`, borderRadius: 30, opacity: 0.55 * rampa(t, M.piezas + 0.8, 0.4) }} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "cocina") return <Cocina t={t} />;
  if (p.tipo === "agua") return <Agua t={t} />;
  if (p.tipo === "seco") return <Seco t={t} />;
  if (p.tipo === "pizarra") return <PlanoPizarra t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.3, "papel", 0.5); fx(M.sueldo, "monedas", 0.45); fx(M.pregunta, "pop", 0.5);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(M.grifo, "agua", 0.5); fx(M.y, "pop", 0.45);
fx(M.tajo, "desague", 0.5); fx(M.cuarta - 0.6, "baja", 0.4);
fx(M.gotas, "gotas", 0.5); fx(M.tr, "pop-suave", 0.45);
fx(M.yd, "campana", 0.45);
fx(M.vierte, "agua", 0.45); fx(M.vierte + 1.0, "monedas", 0.4);
fx(M.c, "pop", 0.5); fx(M.consumo, "pop-suave", 0.45); fx(M.alcancia, "monedas", 0.45);
fx(M.cierra, "crujido", 0.55); fx(M.cierra + 0.4, "gotas", 0.35);
fx(M.ahorros, "monedas", 0.45); fx(M.prestado, "papel", 0.4); fx(M.ayuda, "pop-suave", 0.4);
fx(M.cbarra, "campana", 0.45);
fx(M.formula, "tiza-larga", 0.55); fx(M.formula + 1.0, "tiza", 0.45);
[0, 1, 2, 3, 4].forEach((i) => fx(M.piezas + i * 0.15, "pop", 0.35));
fx(E(13) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/cocina.jpg", "art/oficina.jpg", "macro2026/ilustrados/grifo.webp", "macro2026/ilustrados/alcancia.webp", "macro2026/ilustrados/buzon-impuesto.webp", "macro2026/objetos/recibo.png", "macro2026/ilustrados/moneda-oro.webp"];
const CLAVE = /^(renta|Y|impuestos|T|transferencias|TR|disponible|propensión|marginal|consumir|c|autónomo|C|barra|ochenta|veinte)[.,:?…]*$/i;

export const DURACION = T.DURACION_S;
export const A2 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a2-vaso-renta.mp3" sinSonido={sinSonido} />
);
