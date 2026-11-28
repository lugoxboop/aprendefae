/*
 * Gestión de Proyectos · GP-16 «Director sin poder» (gp16-estructuras).
 * Una idea: la autoridad del director depende de la estructura de la organización
 * (funcional: poca o ninguna; matricial débil: baja; balanceada: baja a moderada; fuerte:
 * moderada a alta; orientada a proyectos: elevada a casi total) (Tabla 2-1, p. 47). Las PMO
 * pueden ser de apoyo (control reducido), de control (moderado) o directivas (elevado)
 * (2.4.4.3, p. 48).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.35, 0.4, 0.35, 0.3, 0.3, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  director1: W(1, "director", 0.2), decidir: W(1, "decidir", 0.7), nada: W(1, "nada.", 0.95),
  ramon: W(2, "Ramón", 0.1), tortas: W(2, "tortas", 0.7), panificadora: W(2, "panificadora.", 0.95),
  persona: W(3, "persona", 0.15), jefe: W(3, "jefe", 0.8), area: W(3, "área.", 0.95),
  repostera: W(4, "repostera,", 0.3), pedir: W(4, "pedir", 0.6), produccion: W(4, "producción.", 0.95),
  funcional: W(5, "funcional,", 0.2), ninguna: W(5, "ninguna.", 0.95),
  matricial: W(6, "matricial", 0.1), debil: W(6, "débil,", 0.35), balanceada: W(6, "balanceada", 0.65), fuerte: W(6, "fuerte.", 0.95),
  orientada: W(7, "orientada", 0.25), elevada: W(7, "elevada,", 0.8), total: W(7, "total.", 0.95),
  oficina: W(8, "oficina", 0.4), pmo8: W(8, "PMO.", 0.95),
  apoyo: W(9, "apoyo", 0.2), plantillas: W(9, "plantillas:", 0.5), reducido: W(9, "reducido.", 0.95),
  control10: W(10, "control", 0.1), metodos: W(10, "métodos", 0.5), moderado: W(10, "moderado.", 0.95),
  directiva: W(11, "directiva", 0.2), dirige: W(11, "dirige", 0.35), elevado: W(11, "elevado.", 0.95),
  toca: W(12, "toca:", 0.15), manda: W(12, "manda", 0.75), proyecto12: W(12, "proyecto?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "organigrama", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "medidor", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "pmo", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Estructuras de la Tabla 2-1 y la autoridad del director (texto de la guía) */
const ESTR = [
  [M.funcional, "funcional", "poca o ninguna", 0.07],
  [M.debil, "matricial débil", "baja", 0.25],
  [M.balanceada, "matricial balanceada", "baja a moderada", 0.42],
  [M.fuerte, "matricial fuerte", "moderada a alta", 0.68],
  [M.orientada, "orientada a proyectos", "elevada a casi total", 0.95],
];

/* Caja del organigrama */
function Caja({ x, y, w = 260, txt, p, col = CREMA }) {
  if (p <= 0) return null;
  return <div style={{ position: "absolute", left: x - w / 2, top: y - 45, width: w, height: 90, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", background: col, border: `7px solid ${TINTA}`, borderRadius: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA, whiteSpace: "nowrap", transform: `scale(${rebote(Math.min(1, p))})`, boxShadow: "0 8px 0 rgba(42,30,23,.25)" }}>{txt}</div>;
}

/* Línea simple entre dos puntos */
function Linea({ x0, y0, x1, y1, p, discontinua = false, color = TINTA }) {
  if (p <= 0) return null;
  const L = Math.hypot(x1 - x0, y1 - y0);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
      <line x1={x0} y1={y0} x2={x0 + (x1 - x0) * clamp01(p)} y2={y0 + (y1 - y0) * clamp01(p)} stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={discontinua ? "18 16" : undefined} />
    </svg>
  );
}

/* ═════ 1 · Director… sin poder ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={420} txt="director del proyecto" p={rampa(t, M.director1 - 0.3, 0.35)} tam={66} fondo={MANGO} />
      <Gigante x={540} y={680} txt="🔒" p={rampa(t, M.decidir - 0.3, 0.35)} tam={180} giro={6 * Math.sin(t * 5)} />
      <Cartel x={540} y={920} txt="¿y quién decide?" p={rampa(t, M.nada - 0.5, 0.35)} tam={62} fondo={CREMA} giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={440} t={t} cara={t > M.decidir ? "triste" : "feliz"} orejas={t > M.decidir ? -6 : 0} semilla={9} />
    </Escena>
  );
}

/* ═════ 2–4 · El organigrama de la panificadora ═════ */
function Organigrama({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.03, x: 540, y: 960 }]);
  const pJ = rampa(t, M.persona - 0.4, 0.4);
  const pide = rampa(t, M.pedir - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.2}>
      <Cartel x={540} y={260} txt="🎂 nueva línea de tortas" p={rampa(t, M.tortas - 0.3, 0.35)} tam={52} fondo={MANGO} />
      <Caja x={290} y={430} w={400} txt="jefe de producción" p={pJ} col="#DCE6FF" />
      <Caja x={790} y={430} w={340} txt="jefe de ventas" p={rampa(t, M.persona - 0.2, 0.4)} col="#DCE6FF" />
      {[[180, 290, "repostera"], [400, 290, "hornero"], [790, 790, "vendedora"]].map(([x, xj, txt], k) => (
        <div key={k}>
          <Linea x0={xj} y0={475} x1={x} y1={640} p={rampa(t, M.jefe - 0.4 + k * 0.1, 0.4)} />
          <Caja x={x} y={680} w={220} txt={txt} p={rampa(t, M.jefe - 0.2 + k * 0.1, 0.35)} col={k === 0 && pide > 0 ? "#FFF4DA" : CREMA} />
        </div>
      ))}
      <Linea x0={560} y0={1020} x1={200} y1={725} p={rampa(t, M.area, 0.4)} discontinua color="#8A97B0" />
      <Linea x0={560} y0={1020} x1={420} y1={725} p={rampa(t, M.area + 0.1, 0.4)} discontinua color="#8A97B0" />
      <Linea x0={560} y0={1020} x1={780} y1={725} p={rampa(t, M.area + 0.2, 0.4)} discontinua color="#8A97B0" />
      <Dicho x={500} y={820} w={580} h={170} colaX={720} p={pide}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, padding: "0 24px" }}>¿me prestas a la repostera?</div>
      </Dicho>
      <Sombra x={560} y={1510} w={220} />
      <Mascota esp="perro-corbatin" x={560} y={1515} alto={400} t={t} cara={pide > 0 ? "tranquila" : "feliz"} semilla={9} />
      <Placa x={560} y={1060} nombre="Ramón" rol="director del proyecto" p={rampa(t, M.ramon - 0.2, 0.35) * (1 - rampa(t, M.persona - 0.4, 0.3))} color={COLOR.CORAL} />
      <Sombra x={180} y={1510} w={180} />
      <Mascota esp="conejo" x={180} y={1515} alto={300} t={t} cara="feliz" semilla={5} />
    </Escena>
  );
}

/* ═════ 5–7 · El medidor de autoridad ═════ */
function Medidor({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={270} txt="⚡ autoridad del director" p={rampa(t, S(5) - 0.2, 0.35)} tam={56} fondo={MANGO} />
      {ESTR.map(([tw, nom, txt, f], k) => {
        const p = rampa(t, tw - 0.4, 0.4);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 60, top: 380 + k * 200, width: 960, opacity: Math.min(1, p * 3) }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Sora", fontWeight: 800, color: TINTA, marginBottom: 8 }}>
              <span style={{ fontSize: 42 }}>{nom}</span><span style={{ fontSize: 36, opacity: 0.75 }}>{txt}</span>
            </div>
            <div style={{ position: "relative", width: 960, height: 70, background: "rgba(255,253,247,.85)", border: `7px solid ${TINTA}`, borderRadius: 18, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * f * sale(Math.min(1, p))}%`, background: `linear-gradient(90deg, ${COLOR.CORAL}, ${COLOR.VERDE})` }} />
            </div>
          </div>
        );
      })}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={lerp(200, 330, ESTR.reduce((m, [tw, , , f]) => (t > tw - 0.4 ? f : m), 0))} t={t} cara={t > M.orientada ? "estrellas" : t > M.debil ? "tranquila" : "triste"} semilla={9} />
    </Escena>
  );
}

/* ═════ 8–11 · Las tres PMO ═════ */
function Pmo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11) - 0.2, b: E(11), s: 1.02, x: 540, y: 960 }]);
  const tipos = [[M.apoyo, "🤝", "de apoyo", "aconseja y presta plantillas", "reducido", 0.25], [M.control10, "📏", "de control", "exige sus métodos", "moderado", 0.55], [M.directiva, "🎯", "directiva", "dirige los proyectos", "elevado", 0.92]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={270} txt="🏢 oficina de dirección de proyectos" p={rampa(t, S(8) - 0.2, 0.35)} tam={42} fondo={AZUL} color="#fff" />
      <Cartel x={540} y={370} txt="PMO" p={rampa(t, M.pmo8 - 0.4, 0.35)} tam={52} fondo={CREMA} />
      {tipos.map(([tw, ic, nom, que, ctl, f], k) => {
        const p = rampa(t, tw - 0.4, 0.4);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 60, top: 470 + k * 250, width: 960, height: 220, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, background: CREMA, border: `8px solid ${TINTA}`, borderRadius: 28, padding: "0 28px", boxShadow: "0 10px 0 rgba(42,30,23,.25)", transform: `translateX(${(1 - sale(p)) * 900}px)`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
            <span style={{ fontSize: 90 }}>{ic}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 50, lineHeight: 1.05 }}>{nom}</div>
              <div style={{ fontSize: 34, opacity: 0.75, marginTop: 4 }}>{que}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                <div style={{ position: "relative", width: 360, height: 34, border: `5px solid ${TINTA}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * f * sale(Math.min(1, p))}%`, background: COLOR.CORAL }} />
                </div>
                <span style={{ fontSize: 32 }}>control {ctl}</span>
              </div>
            </div>
          </div>
        );
      })}
      <Sombra x={300} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={300} y={1515} alto={300} t={t} cara="feliz" bi={-50 * pulso(t, M.oficina - 0.3, 1)} semilla={9} />
      <Sombra x={800} y={1510} w={170} />
      <Mascota esp="conejo" x={800} y={1515} alto={280} t={t} cara="tranquila" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 12 · ¿Cuánto manda el director en tu organización? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const f = 0.5 + 0.45 * Math.sin(t * 1.6);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={420} txt="⚡ ¿cuánto manda?" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      <div style={{ position: "absolute", left: 110, top: 600, width: 860, height: 80, border: `8px solid ${TINTA}`, borderRadius: 20, overflow: "hidden", background: "rgba(255,253,247,.85)", opacity: rampa(t, M.manda - 0.5, 0.35) }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * f}%`, background: `linear-gradient(90deg, ${COLOR.CORAL}, ${COLOR.VERDE})` }} />
      </div>
      <Gigante x={540} y={900} txt="?" p={rampa(t, M.manda - 0.3, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="perro-corbatin" x={330} y={1535} alto={440} t={t} cara="feliz" semilla={9} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={780} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto12 - 0.2, 0.5)} semilla={3} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "organigrama") return <Organigrama t={t} />;
  if (p.tipo === "medidor") return <Medidor t={t} />;
  if (p.tipo === "pmo") return <Pmo t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.director1 - 0.3, "pop", 0.35); fx(M.decidir - 0.3, "candado", 0.4); fx(M.nada - 0.5, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.tortas - 0.3, "pop", 0.3); fx(M.persona - 0.4, "pop", 0.3); fx(M.jefe - 0.4, "tiza", 0.3); fx(M.area, "tiza", 0.25); fx(M.pedir - 0.3, "pop-suave", 0.35);
fx(S(5) - 0.3, "barrido-lento", 0.35); ESTR.forEach(([tw]) => fx(tw - 0.4, "sube", 0.25));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.oficina - 0.3, "pop", 0.35); [M.apoyo, M.control10, M.directiva].forEach((w) => fx(w - 0.4, "desliza", 0.3));
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(funcional|matricial|débil|balanceada|fuerte|orientada|autoridad|PMO|apoyo|control|directiva|reducido|moderado|elevado)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP16 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp16-estructuras.mp3" sinSonido={sinSonido} />
);
