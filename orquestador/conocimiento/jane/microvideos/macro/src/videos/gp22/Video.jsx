/*
 * Gestión de Proyectos · GP-22 «El plan que guarda todos los planes» (gp22-plan).
 * Una idea: el plan para la dirección del proyecto describe cómo se ejecutará, monitoreará y
 * controlará, y cerrará el proyecto; integra y consolida los planes de gestión subsidiarios y
 * las líneas base (alcance, cronograma, costos) y componentes adicionales (gestión de cambios,
 * ciclo de vida, enfoque de desarrollo…); las necesidades del proyecto deciden sus
 * componentes; otros documentos son documentos del proyecto (4.2.3.1, p. 86–89; Tabla 4-1;
 * Glosario). Línea base: versión aprobada usada como base de comparación.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.35, 0.3, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  papeles: W(1, "papeles", 0.2), manda: W(1, "manda.", 0.95),
  horario: W(2, "horario;", 0.25), plata: W(2, "plata;", 0.6), riesgos2: W(2, "riesgos.", 0.95),
  solo: W(3, "solo,", 0.2), ejecutar: W(3, "ejecutar,", 0.55), monitorear: W(3, "monitorear,", 0.65), controlar: W(3, "controlar", 0.75), cerrar: W(3, "cerrar", 0.85),
  plan4: W(4, "plan", 0.5), direccion4: W(4, "dirección", 0.7),
  integra: W(5, "Integra", 0.05), alcance5: W(5, "alcance,", 0.4), cronograma5: W(5, "cronograma,", 0.55), costos5: W(5, "costos,", 0.7), riesgos5: W(5, "riesgos", 0.85), mas: W(5, "más.", 0.95),
  lineas: W(6, "líneas", 0.2), alcance6: W(6, "alcance,", 0.45), cronograma6: W(6, "cronograma", 0.7), costos6: W(6, "costos.", 0.95),
  aprobada: W(7, "aprobada", 0.35), comparar: W(7, "comparar", 0.55), planeado: W(7, "planeado", 0.75), real: W(7, "real.", 0.95),
  cambios: W(8, "cambios,", 0.4), ciclo: W(8, "ciclo", 0.6), enfoque: W(8, "enfoque", 0.8),
  necesidades: W(9, "necesidades", 0.2), partes: W(9, "partes", 0.8),
  otros: W(10, "otros", 0.15), registro10: W(10, "registro", 0.3), documentos10: W(10, "documentos", 0.6, 1), parte: W(10, "parte", 0.85), plan10: W(10, "plan.", 0.95),
  toca: W(11, "toca:", 0.15), indice: W(11, "índice", 0.5), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "papeles", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "carpeta", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "base", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "extras", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const PLANES = [[() => M.alcance5, "alcance"], [() => M.cronograma5, "cronograma"], [() => M.costos5, "costos"], [() => M.riesgos5, "riesgos"], [() => M.mas, "y más…"]];
const BASES = [[() => M.alcance6, "alcance"], [() => M.cronograma6, "cronograma"], [() => M.costos6, "costos"]];

/* La carpeta grande del plan, con su contenido */
function Carpeta({ x, y, w, h, p, children, titulo = "plan para la dirección del proyecto" }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0" }}>
      <div style={{ position: "absolute", left: 30, top: -46, width: 280, height: 70, background: AZUL, border: `7px solid ${TINTA}`, borderRadius: "18px 18px 0 0" }} />
      <div style={{ position: "absolute", inset: 0, background: "#6F86FF", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)" }} />
      <div style={{ position: "absolute", left: 24, right: 24, top: 22, bottom: 24, background: "#FFFDF7", border: `6px solid ${TINTA}`, borderRadius: 18 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: TINTA, padding: "0 50px" }}>{titulo}</div>
      {children}
    </div>
  );
}

const Chip = ({ x, y, txt, p, fondo = CREMA, tam = 38 }) => p <= 0 ? null : (
  <div style={{ position: "absolute", left: x, top: y, padding: "10px 20px", background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, whiteSpace: "nowrap", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "0 50%" }}>{txt}</div>
);

/* ═════ 1 · Papeles por todas partes ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const H = [[200, 430, -14], [520, 360, 6], [850, 440, 12], [330, 760, 9], [760, 780, -8], [120, 1030, -20], [960, 1050, 16]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      {H.map(([x, y, g], k) => <Documento key={k} x={x} y={y} w={190} p={rampa(t, M.papeles - 0.4 + k * 0.08, 0.4)} titulo="plan" letra={30} giro={g + 4 * Math.sin(t * 2 + k)} />)}
      <Cartel x={540} y={600} txt="¿cuál manda?" p={rampa(t, M.manda - 0.6, 0.35)} tam={70} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara={t > M.manda - 0.6 ? "triste" : "tranquila"} cab={8 * Math.sin(t * 3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · Un papel por tema; Carmen pide uno solo ═════ */
function Papeles({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 960 }]);
  const P3 = [[M.horario, "🕒 horario", 200], [M.plata, "💰 plata", 540], [M.riesgos2, "⚠️ riesgos", 880]];
  const uno = rampa(t, M.solo - 0.4, 0.4);
  const V = [[M.ejecutar, "ejecutar"], [M.monitorear, "monitorear"], [M.controlar, "controlar"], [M.cerrar, "cerrar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.18}>
      {P3.map(([tw, txt, x], k) => (
        <div key={k} style={{ opacity: 1 - 0.6 * uno }}>
          <Documento x={x} y={470} w={250} p={rampa(t, tw - 0.4, 0.35)} titulo={txt} letra={38} giro={(k - 1) * 5} />
        </div>
      ))}
      <Dicho x={130} y={680} w={640} h={160} colaX={780} p={uno}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>☝️ Uno solo.</div>
      </Dicho>
      {V.map(([tw, txt], k) => <Cartel key={k} x={190 + (k % 2) * 330} y={1000 + Math.floor(k / 2) * 110} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={44} fondo={MANGO} giro={k % 2 ? 2 : -2} />)}
      <Sombra x={830} y={1510} w={230} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={440} t={t} cara="tranquila" bd={-80 * pulso(t, M.solo - 0.4, 1.2)} semilla={6} espejo />
      <Sombra x={200} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={330} t={t} cara="tranquila" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · El plan para la dirección: planes de gestión y líneas base ═════ */
function CarpetaEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6) - 0.2, b: E(6), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Destello x={540} y={700} r={420} p={rampa(t, M.plan4 - 0.2, 0.8)} />
      <Carpeta x={540} y={300} w={940} h={860} p={rampa(t, M.plan4 - 0.5, 0.45)}>
        <div style={{ position: "absolute", left: 60, top: 180, fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: AZUL, opacity: rampa(t, M.integra - 0.3, 0.35) }}>📚 planes de gestión</div>
        {PLANES.map(([fw, txt], k) => <Chip key={k} x={70 + (k % 2) * 420} y={250 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, fw() - 0.35, 0.3)} tam={48} />)}
        <div style={{ position: "absolute", left: 60, top: 620, fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: COLOR.VERDE, opacity: rampa(t, M.lineas - 0.3, 0.35) }}>📏 líneas base</div>
        {BASES.map(([fw, txt], k) => <Chip key={k} x={[60, 290, 640][k]} y={690} txt={txt} p={rampa(t, fw() - 0.35, 0.3)} fondo="#E3F6EC" tam={42} />)}
      </Carpeta>
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.plan4 ? "estrellas" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 7 · Línea base: lo planeado frente a lo real ═════ */
function Base({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.03, x: 540, y: 950 }]);
  const pP = sale(rampa(t, M.aprobada - 0.5, 0.9));
  const pR = sale(rampa(t, M.real - 0.9, 0.9));
  const X0 = 120, Y0 = 520, Wd = 840, H = 520;
  const plan = (f) => `M ${X0} ${Y0 + H} L ${X0 + Wd * f} ${Y0 + H - H * 0.85 * f}`;
  const real = [[0, 0], [0.25, 0.17], [0.5, 0.33], [0.75, 0.47], [1, 0.62]];
  const n = Math.max(1, Math.ceil(pR * 4));
  const pts = real.slice(0, n + 1).map(([f, v], k) => {
    const fr = k === n ? (pR * 4 - (n - 1)) : 1;
    const [f0, v0] = real[Math.max(0, k - 1)];
    const ff = k === n ? lerp(f0, f, fr) : f, vv = k === n ? lerp(v0, v, fr) : v;
    return `${X0 + Wd * ff},${Y0 + H - H * vv}`;
  }).join(" ");
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={300} txt="línea base = versión aprobada" p={rampa(t, M.aprobada - 0.4, 0.35)} tam={50} fondo={COLOR.VERDE} color="#fff" />
      <div style={{ position: "absolute", left: X0 - 40, top: Y0 - 60, width: Wd + 80, height: H + 120, background: "rgba(255,253,247,.9)", border: `7px solid ${TINTA}`, borderRadius: 26, opacity: rampa(t, S(7) - 0.2, 0.35) }} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        {pP > 0 && <path d={plan(pP)} stroke={AZUL} strokeWidth={14} strokeLinecap="round" strokeDasharray="28 18" fill="none" />}
        {pR > 0 && <polyline points={pts} stroke={COLOR.CORAL} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      </svg>
      <Cartel x={340} y={Y0 + 20} txt="planeado" p={rampa(t, M.planeado - 0.3, 0.3)} tam={42} fondo="#DDE3FF" />
      <Cartel x={830} y={Y0 + H - 60} txt="real" p={rampa(t, M.real - 0.3, 0.3)} tam={42} fondo="#FFE1D8" />
      <Gigante x={X0 + Wd + 10} y={Y0 + H * 0.3} txt="↕️" p={rampa(t, M.real + 0.1, 0.3)} tam={80} />
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={330} t={t} cara="feliz" bi={-50 * pulso(t, M.comparar - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · Componentes adicionales; según el proyecto; lo que no es parte ═════ */
function Extras({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const X = [[M.cambios, "🔄 gestión de cambios"], [M.ciclo, "♻️ ciclo de vida"], [M.enfoque, "🧭 enfoque de desarrollo"]];
  const fuera = sale(rampa(t, M.parte - 0.6, 0.8));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={300} w={760} h={720} p={1} titulo="plan para la dirección">
        <div style={{ position: "absolute", left: 50, top: 150, fontFamily: "Sora", fontWeight: 800, fontSize: 34, color: TINTA, opacity: 0.55 }}>📚 planes · 📏 líneas base</div>
        {X.map(([tw, txt], k) => <Chip key={k} x={50} y={220 + k * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} fondo={MANGO} tam={46} />)}
        <div style={{ position: "absolute", left: 50, top: 580, fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: COLOR.VERDE, opacity: rampa(t, M.necesidades - 0.3, 0.35) }}>🧩 según lo que necesite el proyecto</div>
      </Carpeta>
      <Documento x={790} y={1200} w={200} p={rampa(t, M.registro10 - 0.4, 0.4)} titulo="registro de supuestos" letra={28} giro={8 * fuera} />
      <Cartel x={440} y={1090} txt="no es parte del plan" p={rampa(t, M.parte - 0.4, 0.35)} tam={42} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={220} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={220} y={1515} alto={320} t={t} cara="feliz" bd={-60 * pulso(t, M.otros - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Arma el índice de tu plan ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={360} txt="📑 arma tu índice" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      <Carpeta x={540} y={520} w={520} h={560} p={rampa(t, M.indice - 0.4, 0.4)} titulo="mi plan">
        {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", left: 60, right: 60, top: 170 + k * 90, height: 12, borderRadius: 6, background: "#D9D2C3", opacity: rampa(t, M.indice + k * 0.2, 0.3) }} />)}
      </Carpeta>
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11 - 0.2, 0.5)} semilla={3} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="gato-gafas" x={780} y={1535} alto={460} t={t} cara="feliz" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "papeles") return <Papeles t={t} />;
  if (p.tipo === "carpeta") return <CarpetaEsc t={t} />;
  if (p.tipo === "base") return <Base t={t} />;
  if (p.tipo === "extras") return <Extras t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.papeles - 0.4, "papel", 0.35); fx(M.manda - 0.6, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [M.horario, M.plata, M.riesgos2].forEach((w) => fx(w - 0.4, "papel", 0.25)); fx(M.solo - 0.4, "pop", 0.35);
[M.ejecutar, M.monitorear, M.controlar, M.cerrar].forEach((w) => fx(w - 0.3, "pop-suave", 0.25));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.plan4 - 0.5, "campana", 0.35); PLANES.forEach(([fw]) => fx(fw() - 0.35, "pop-suave", 0.22)); BASES.forEach(([fw]) => fx(fw() - 0.35, "pop", 0.25));
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.aprobada - 0.5, "tiza-larga", 0.3); fx(M.real - 0.9, "tiza-larga", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); [M.cambios, M.ciclo, M.enfoque].forEach((w) => fx(w - 0.35, "pop", 0.25)); fx(M.necesidades - 0.3, "ding", 0.3); fx(M.registro10 - 0.4, "papel", 0.3); fx(M.parte - 0.6, "desliza", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(plan|dirección|integra|líneas|base|aprobada|comparar|planeado|real|documentos)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP22 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp22-plan.mp3" sinSonido={sinSonido} />
);
