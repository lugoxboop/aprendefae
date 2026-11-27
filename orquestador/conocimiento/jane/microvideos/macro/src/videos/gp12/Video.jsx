/*
 * Gestión de Proyectos · GP-12 «No hacer nada» (gp12-caso-de-negocio).
 * Una idea: el caso de negocio es un estudio de viabilidad económica que sirve de base para
 * autorizar el proyecto: necesidad, análisis, opciones (no hacer nada, lo mínimo, más que el
 * mínimo), recomendación con riesgos y medidas de éxito. El plan de gestión de beneficios dice
 * qué beneficio, cuándo, cómo se mide y quién lo vigila (G 1.2.6–1.2.6.2, p. 29–33; Tabla 1-5).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Local, Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.35, 0.3, 0.35, 0.35, 0.3, 0.35, 0.35, 0.35, 0.35, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  caso1: W(1, "caso", 0.1), seria: W(1, "seria:", 0.6), nada1: W(1, "nada.", 0.95),
  segunda: W(2, "segunda", 0.15), carmen: W(2, "Carmen,", 0.35), plata: W(2, "plata,", 0.6), caso2: W(2, "caso", 0.85),
  necesidad: W(3, "necesidad:", 0.15), norte3: W(3, "norte", 0.4), fila: W(3, "fila", 0.65), pan: W(3, "pan.", 0.95),
  analisis: W(4, "análisis:", 0.1), causa: W(4, "causa", 0.25), riesgos4: W(4, "riesgos", 0.55), criterios: W(4, "criterios", 0.8),
  opciones: W(5, "opciones.", 0.1), una: W(5, "Una:", 0.2), nada5: W(5, "nada,", 0.35), eligen5: W(5, "eligen,", 0.8), proyecto5: W(5, "proyecto.", 0.95),
  dos: W(6, "Dos:", 0.1), minimo6: W(6, "mínimo,", 0.3), carrito6: W(6, "carrito", 0.5),
  tres: W(7, "Tres:", 0.1), minimo7: W(7, "mínimo,", 0.4), sede7: W(7, "sede", 0.65), cafeteria: W(7, "cafetería.", 0.95),
  recomendacion: W(8, "recomendación:", 0.15), elegida: W(8, "elegida,", 0.35), riesgos8: W(8, "riesgos", 0.6), exito: W(8, "éxito.", 0.95),
  caso9: W(9, "caso", 0.15), estudio: W(9, "estudio", 0.35), viabilidad: W(9, "viabilidad", 0.5), autorizar: W(9, "autorizar", 0.85),
  eligen10: W(10, "eligen", 0.4), carrito10: W(10, "carrito.", 0.95),
  plan11: W(11, "plan", 0.2), beneficios: W(11, "beneficios:", 0.35), llega: W(11, "llega,", 0.5), cuando: W(11, "cuándo,", 0.62), mide: W(11, "mide", 0.78), vigila: W(11, "vigila.", 0.95),
  toca: W(12, "toca:", 0.15), tres12: W(12, "tres", 0.4), proyecto12: W(12, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "sede", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "analisis", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "opciones", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "caso", desde: S(8) - 0.3, entra: "zoom" },
  { tipo: "carrito", desde: S(10) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Carrito de pan */
export function Carrito({ x, y, w = 300, p = 1, t = 0 }) {
  if (p <= 0) return null;
  const h = w * 0.7;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: w * 0.05, top: 0, width: w * 0.9, height: h * 0.22, background: `repeating-linear-gradient(90deg, ${ROJO} 0 ${w * 0.1}px, #fff ${w * 0.1}px ${w * 0.2}px)`, border: `6px solid ${TINTA}`, borderRadius: "16px 16px 4px 4px" }} />
      {[0.12, 0.84].map((f) => <div key={f} style={{ position: "absolute", left: w * f, top: h * 0.2, width: 10, height: h * 0.3, background: TINTA }} />)}
      <div style={{ position: "absolute", left: 0, top: h * 0.48, width: w, height: h * 0.34, background: "#C98A4B", border: `7px solid ${TINTA}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: w * 0.16 }}>🥖🥐🥖</div>
      {[0.2, 0.8].map((f) => <div key={f} style={{ position: "absolute", left: w * f - h * 0.1, top: h * 0.8, width: h * 0.2, height: h * 0.2, borderRadius: "50%", background: "#2F3742", border: `6px solid ${TINTA}`, transform: `rotate(${t * 90}deg)` }} />)}
    </div>
  );
}

/* Tarjeta de opción del caso de negocio */
function Opcion({ x, y, w, n, ic, titulo, sub, p, elegida = 0, apagada = 0 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 230, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 26, background: elegida > 0 ? "#DDF5E6" : CREMA, border: `8px solid ${elegida > 0 ? COLOR.VERDE : TINTA}`, borderRadius: 30, padding: "0 30px", boxShadow: "0 10px 0 rgba(42,30,23,.25)", transform: `translateX(${(1 - sale(Math.min(1, p))) * 900}px) scale(${1 + 0.05 * elegida})`, opacity: 1 - 0.55 * apagada, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ flex: "0 0 auto", width: 90, height: 90, borderRadius: "50%", background: MANGO, border: `7px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54 }}>{n}</div>
      <span style={{ fontSize: 96 }}>{ic}</span>
      <div><div style={{ fontSize: 52, lineHeight: 1.05 }}>{titulo}</div><div style={{ fontSize: 38, opacity: 0.75, marginTop: 6 }}>{sub}</div></div>
    </div>
  );
}

/* ═════ 1 · Una opción muy seria: no hacer nada ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={540} y={560} w={330} p={rampa(t, M.caso1 - 0.3, 0.4)} titulo="caso de negocio" letra={40} />
      <Cartel x={540} y={900} txt="🛋️ no hacer nada" p={rampa(t, M.nada1 - 0.6, 0.35)} tam={84} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="gato-gafas" x={540} y={1515} alto={440} t={t} cara="guino" bd={-60 * pulso(t, M.seria - 0.3, 1)} semilla={6} />
    </Escena>
  );
}

/* ═════ 2–3 · La segunda sede y la necesidad ═════ */
function Sede({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.05, x: 540, y: 900 }]);
  const enNorte = rampa(t, S(3) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(3px)" velo={0.1}>
      <div style={{ opacity: 1 - enNorte }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${0.7 * rebote(rampa(t, M.segunda - 0.3, 0.4))})`, transformOrigin: "540px 900px" }}>
          <Local x={540} y={900} w={460} alto={1} toldo={1} letrero={1} nombre="Pía 2 ?" t={t} />
        </div>
        <Documento x={540} y={330} w={220} p={rampa(t, M.caso2 - 0.4, 0.4)} titulo="caso de negocio" letra={28} giro={-4} />
        <Placa x={800} y={980} nombre="Carmen" rol="pone la plata" p={rampa(t, M.carmen - 0.2, 0.35)} color={COLOR.CORAL} />
      </div>
      {enNorte > 0 && (
        <div style={{ opacity: enNorte }}>
          <Cartel x={540} y={300} txt="1 · la necesidad" p={rampa(t, M.necesidad - 0.3, 0.35)} tam={64} fondo={MANGO} />
          <Cartel x={540} y={450} txt="📍 barrio norte" p={rampa(t, M.norte3 - 0.3, 0.35)} tam={52} fondo={CREMA} />
          {Array.from({ length: 6 }).map((_, k) => (
            <Gigante key={k} x={170 + k * 140} y={780} txt={["🧍", "🧍‍♀️", "🧍‍♂️", "🧍", "🧍‍♀️", "🧍‍♂️"][k]} p={rampa(t, M.fila - 0.4 + k * 0.07, 0.3)} tam={120} />
          ))}
          <Cartel x={540} y={960} txt="se van sin pan" p={rampa(t, M.pan - 0.4, 0.35)} tam={56} fondo="#FFD3CF" giro={-2} />
        </div>
      )}
      <Sombra x={230} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={230} y={1515} alto={400} t={t} cara={t > M.fila ? "triste" : "estrellas"} bi={-60 * pulso(t, M.segunda - 0.3, 1)} semilla={3} />
      <Sombra x={830} y={1510} w={230} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={440} t={t} cara="tranquila" bd={-50 * pulso(t, M.plata - 0.3, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 4 · El análisis ═════ */
function Analisis({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4), s: 1.03, x: 540, y: 950 }]);
  const qs = [[M.causa, "🔍", "¿qué lo causa?"], [M.riesgos4, "⚠️", "¿qué riesgos hay?"], [M.criterios, "⚖️", "¿con qué criterios decidir?"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={300} txt="2 · el análisis" p={rampa(t, M.analisis - 0.3, 0.35)} tam={64} fondo={MANGO} />
      {qs.map(([tw, ic, txt], k) => {
        const p = rampa(t, tw - 0.3, 0.35);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 80, top: 430 + k * 190, width: 920, height: 150, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 26, padding: "0 30px", boxShadow: "0 9px 0 rgba(42,30,23,.25)", transform: `translateX(${(1 - sale(p)) * -900}px)`, fontFamily: "Sora", fontWeight: 800, fontSize: 50, whiteSpace: "nowrap", color: TINTA }}>
            <span style={{ fontSize: 76 }}>{ic}</span>{txt}
          </div>
        );
      })}
      <Sombra x={540} y={1520} w={240} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={380} t={t} cara="tranquila" cab={8 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–7 · Tres opciones ═════ */
function Opciones({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={290} txt="3 · las opciones" p={rampa(t, M.opciones - 0.3, 0.35)} tam={64} fondo={MANGO} />
      <Opcion x={60} y={400} w={960} n={1} ic="🛋️" titulo="no hacer nada" sub="sin proyecto" p={rampa(t, M.una - 0.3, 0.4)} apagada={rampa(t, M.proyecto5 - 0.3, 0.4) * 0.6} />
      <Opcion x={60} y={680} w={960} n={2} ic="🛒" titulo="lo mínimo" sub="un carrito de pan" p={rampa(t, M.dos - 0.3, 0.4)} />
      <Opcion x={60} y={960} w={960} n={3} ic="☕" titulo="más que el mínimo" sub="sede con cafetería" p={rampa(t, M.tres - 0.3, 0.4)} />
      <Gigante x={940} y={470} txt="✗" p={rampa(t, M.eligen5 - 0.2, 0.35)} tam={120} color={ROJO} />
      <Sombra x={200} y={1515} w={190} />
      <Mascota esp="hamster-gorra" x={200} y={1520} alto={300} t={t} cara="tranquila" bi={-50 * pulso(t, M.dos - 0.3, 1)} semilla={3} />
      <Sombra x={880} y={1515} w={190} />
      <Mascota esp="gato-gafas" x={880} y={1520} alto={320} t={t} cara="tranquila" bd={-50 * pulso(t, M.tres - 0.3, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 8–9 · La recomendación y el nombre ═════ */
function Caso({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.03, x: 540, y: 950 }]);
  const partes = [[S(3), "necesidad"], [S(4), "análisis"], [S(5), "opciones"], [M.recomendacion - 0.3, "recomendación"]];
  const pD = rampa(t, S(8) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.2}>
      {pD > 0 && (
        <div style={{ position: "absolute", left: 130, top: 230, width: 820, height: 820, transform: `scale(${rebote(Math.min(1, pD))}) rotate(-1.5deg)`, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 14px 0 rgba(42,30,23,.28)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 60, color: TINTA }}>caso de negocio</div>
          {partes.map(([tw, txt], k) => (
            <div key={k} style={{ position: "absolute", left: 60, top: 150 + k * 110, display: "flex", alignItems: "center", gap: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 48, color: TINTA }}>
              <div style={{ width: 62, height: 62, border: `7px solid ${TINTA}`, borderRadius: 12, background: k < 3 || t > tw ? COLOR.VERDE : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{k < 3 || t > tw ? "✓" : ""}</div>{txt}
            </div>
          ))}
          <div style={{ position: "absolute", left: 140, top: 600, display: "flex", gap: 16, opacity: rampa(t, M.riesgos8 - 0.4, 0.3) }}>
            {["⚠️ riesgos", "🎯 medidas de éxito"].map((x, k) => <div key={k} style={{ background: CREMA, border: `6px solid ${TINTA}`, borderRadius: 16, padding: "6px 16px", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA, whiteSpace: "nowrap", opacity: k === 0 ? 1 : rampa(t, M.exito - 0.5, 0.3) }}>{x}</div>)}
          </div>
        </div>
      )}
      <Cartel x={540} y={1150} txt="estudio de viabilidad económica" p={rampa(t, M.viabilidad - 0.4, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={1290} txt="base para autorizar el proyecto" p={rampa(t, M.autorizar - 0.4, 0.35)} tam={46} fondo={CREMA} giro={-2} />
      <Destello x={540} y={300} r={300} p={rampa(t, M.caso9 - 0.2, 0.8)} />
    </Escena>
  );
}

/* ═════ 10–11 · Eligen el carrito; el plan de beneficios ═════ */
function CarritoEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11) - 0.2, b: E(11), s: 1.02, x: 540, y: 950 }]);
  const preg = [[M.llega, "🎁", "qué beneficio"], [M.cuando, "📅", "cuándo"], [M.mide, "📏", "cómo se mide"], [M.vigila, "👀", "quién lo vigila"]];
  const enPlan = rampa(t, S(11) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(3px)" velo={0.12}>
      <div style={{ opacity: 1 - 0.75 * enPlan }}>
        <Carrito x={540} y={900} w={460} p={rampa(t, M.carrito10 - 0.6, 0.4)} t={t} />
        <Cartel x={540} y={380} txt="✓ opción 2: el carrito" p={rampa(t, M.eligen10 - 0.3, 0.35)} tam={62} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      </div>
      {enPlan > 0 && (
        <div style={{ opacity: enPlan }}>
          <Cartel x={540} y={280} txt="plan de gestión de beneficios" p={rampa(t, M.plan11 - 0.3, 0.35)} tam={52} fondo={MANGO} />
          {preg.map(([tw, ic, txt], k) => <Ficha key={k} x={[290, 790, 290, 790][k]} y={k < 2 ? 560 : 900} w={330} letra={40} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.35)} giro={k % 2 ? 3 : -3} />)}
        </div>
      )}
      <Sombra x={170} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={380} t={t} cara="estrellas" bi={-60 * pulso(t, M.eligen10 - 0.3, 1)} semilla={3} />
      <Sombra x={910} y={1510} w={210} />
      <Mascota esp="gato-gafas" x={910} y={1515} alto={400} t={t} cara="feliz" bd={-60 * pulso(t, M.eligen10 - 0.2, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 12 · Tus tres opciones ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {[["1", "🛋️"], ["2", "✏️"], ["3", "✏️"]].map(([n, ic], k) => <Ficha key={k} x={200 + k * 340} y={560} w={280} icono={ic} txt={`opción ${n}`} letra={42} p={rampa(t, M.tres12 - 0.3 + k * 0.15, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={540} y={950} txt="?" p={rampa(t, M.toca - 0.2, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto12 - 0.2, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={240} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={460} t={t} cara="feliz" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "sede") return <Sede t={t} />;
  if (p.tipo === "analisis") return <Analisis t={t} />;
  if (p.tipo === "opciones") return <Opciones t={t} />;
  if (p.tipo === "caso") return <Caso t={t} />;
  if (p.tipo === "carrito") return <CarritoEsc t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.caso1 - 0.3, "papel", 0.35); fx(M.nada1 - 0.6, "toc-grave", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.segunda - 0.3, "pop", 0.35); fx(M.carmen - 0.2, "pop-suave", 0.3); fx(M.caso2 - 0.4, "papel", 0.3);
fx(M.necesidad - 0.3, "pop", 0.35); fx(M.fila - 0.4, "pasos", 0.35); fx(M.pan - 0.4, "suspiro", 0.3);
fx(S(4) - 0.3, "barrido-lento", 0.35); [M.causa, M.riesgos4, M.criterios].forEach((w) => fx(w - 0.3, "golpe", 0.3));
fx(S(5) - 0.3, "whoosh", 0.4); [M.una, M.dos, M.tres].forEach((w) => fx(w - 0.3, "desliza", 0.35)); fx(M.eligen5 - 0.2, "toc", 0.35);
fx(S(8) - 0.3, "papel", 0.4); fx(M.recomendacion - 0.3, "ding", 0.3); fx(M.viabilidad - 0.4, "pop", 0.35); fx(M.autorizar - 0.4, "sello", 0.35);
fx(M.eligen10 - 0.3, "campana", 0.4); fx(M.carrito10 - 0.6, "pop", 0.35);
fx(M.plan11 - 0.3, "pop", 0.35); [M.llega, M.cuando, M.mide, M.vigila].forEach((w) => fx(w - 0.3, "pop-suave", 0.3));
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/ciudad.jpg"];
const CLAVE = /^(caso|negocio|necesidad|análisis|opciones|nada|mínimo|recomendación|viabilidad|autorizar|beneficios|éxito)[.,:?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP12 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp12-caso-de-negocio.mp3" sinSonido={sinSonido} />
);
