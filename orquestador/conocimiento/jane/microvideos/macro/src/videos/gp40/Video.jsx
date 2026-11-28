/*
 * Gestión de Proyectos · GP-40 «¿Qué podría salir mal… o bien?» (gp40-identificar-riesgos).
 * Una idea: Identificar los Riesgos es identificar los riesgos individuales y las fuentes de riesgo
 * general del proyecto, y documentar sus características (11.2, p. 409). Técnicas: tormenta de
 * ideas, listas de verificación, entrevistas, análisis de supuestos y restricciones, análisis FODA
 * (11.2.2.2–11.2.2.3, p. 414–415). Declaración estructurada: causa, riesgo, efecto. Registro de
 * riesgos: identificador, dueño potencial, respuestas potenciales (11.2.3.1, p. 417). Informe de
 * riesgos: fuentes de riesgo general y resumen (11.2.3.2, p. 418). Se repite a lo largo del proyecto.
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  feria: W(1, "feria,", 0.2), pasar: W(1, "pasar?", 0.95),
  ramon: W(2, "Ramón:", 0.05), horno: W(2, "horno».", 0.45), carmen: W(2, "Carmen:", 0.55), feria2: W(2, "feria».", 0.97),
  identificar: W(3, "Identificar", 0.05), individuales: W(3, "individuales", 0.35), general3: W(3, "general,", 0.6), documentar: W(3, "documentar", 0.8),
  tormenta: W(4, "tormenta", 0.2), listas: W(4, "listas", 0.5), entrevistas: W(4, "entrevistas.", 0.9),
  supuestos: W(5, "supuestos", 0.25), foda: W(5, "FODA:", 0.5), fortalezas: W(5, "fortalezas,", 0.6), debilidades: W(5, "debilidades,", 0.72), oportunidades: W(5, "oportunidades", 0.84), amenazas: W(5, "amenazas.", 0.96),
  claro: W(6, "claro:", 0.4), causa6: W(6, "causa,", 0.6), riesgo6: W(6, "riesgo", 0.75, 1), efecto6: W(6, "efecto.", 0.95),
  viejo: W(7, "viejo,", 0.3), danarse: W(7, "dañarse,", 0.55), retrasarian: W(7, "retrasarían", 0.8),
  registro: W(8, "registro", 0.15), identificador: W(8, "identificador,", 0.5), dueno: W(8, "dueño", 0.65), respuestas: W(8, "respuestas", 0.85),
  informe: W(9, "informe", 0.3), fuentes9: W(9, "fuentes", 0.55), resumen: W(9, "resumen", 0.8),
  sola: W(10, "sola", 0.35), repite: W(10, "repite", 0.65),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.3), efecto11: W(11, "efecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "tecnicas", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "enunciado", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "registro", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "informe", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

const caja = (x, y, w, h, fondo, op, txt, tam) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 18, boxSizing: "border-box", opacity: op, transform: `scale(${0.6 + 0.4 * sale(clamp01(op))})`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, lineHeight: 1.15, padding: "0 10px" }}>{txt}</div>
);

/* ═════ 1–2 · ¿Qué podría pasar? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={210} txt="🤔 ¿qué podría pasar?" p={rampa(t, M.pasar - 0.8, 0.35)} tam={52} fondo={MANGO} giro={-2} />
      <Dicho x={60} y={360} w={500} h={190} colaX={180} p={rampa(t, M.ramon - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, lineHeight: 1.15 }}>🔥💥 «se puede dañar el horno»</div>
      </Dicho>
      <Dicho x={520} y={640} w={500} h={190} colaX={860} p={rampa(t, M.carmen - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, lineHeight: 1.15 }}>🎪✨ «nos pueden invitar a otra feria»</div>
      </Dicho>
      <Sombra x={210} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={210} y={1515} alto={340} t={t} cara={t > M.horno ? "triste" : "tranquila"} semilla={9} />
      <Sombra x={540} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={310} t={t} cara="tranquila" cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={870} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={870} y={1515} alto={340} t={t} cara={t > M.feria2 - 0.3 ? "estrellas" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="identificar los riesgos" p={rampa(t, M.identificar - 0.3, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={430} txt="🔍 riesgos individuales" p={rampa(t, M.individuales - 0.35, 0.35)} tam={44} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={560} txt="🌐 fuentes de riesgo general" p={rampa(t, M.general3 - 0.4, 0.35)} tam={44} fondo={CREMA} giro={2} />
      <Cartel x={540} y={740} txt="📝 documentar sus características" p={rampa(t, M.documentar - 0.35, 0.35)} tam={42} fondo="#DDE3FF" giro={-1} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Técnicas y FODA ═════ */
function Tecnicas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5), s: 1.02, x: 540, y: 960 }]);
  const F = [[M.fortalezas, "💪 fortalezas", "#E3F6EC"], [M.debilidades, "🩹 debilidades", "#FFE1D8"], [M.oportunidades, "🌱 oportunidades", "#E3F6EC"], [M.amenazas, "⚡ amenazas", "#FFE1D8"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {[[M.tormenta, "🌩️ tormenta de ideas"], [M.listas, "✅ listas de verificación"], [M.entrevistas, "🎤 entrevistas"]].map(([tw, txt], k) => <Cartel key={k} x={540} y={200 + k * 105} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={38} fondo={CREMA} giro={[-2, 2, -1][k]} />)}
      <Cartel x={540} y={530} txt="🔎 análisis de supuestos y restricciones" p={rampa(t, M.supuestos - 0.4, 0.35)} tam={34} fondo="#DDE3FF" />
      <Cartel x={540} y={650} txt="análisis FODA" p={rampa(t, M.foda - 0.4, 0.35)} tam={46} fondo={MANGO} giro={-1} />
      {F.map(([tw, txt, fondo], k) => <div key={k}>{caja(310 + (k % 2) * 460, 800 + Math.floor(k / 2) * 160, 420, 140, fondo, rampa(t, tw - 0.35, 0.3), txt, 38)}</div>)}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 6–7 · Causa, riesgo, efecto ═════ */
function Enunciado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const P = [[M.causa6, M.viejo, "causa", "🧓 el horno es viejo", "#FFF4DA"], [M.riesgo6, M.danarse, "riesgo", "💥 puede dañarse", "#FFE1D8"], [M.efecto6, M.retrasarian, "efecto", "⏰ se retrasan los pedidos", "#DDE3FF"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.35}>
      <Cartel x={540} y={220} txt="✍️ cada riesgo, escrito claro" p={rampa(t, M.claro - 0.4, 0.35)} tam={46} fondo={MANGO} />
      {P.map(([tw, tw2, tit, ej, fondo], k) => (
        <div key={k}>
          {caja(540, 400 + k * 260, 760, 190, fondo, rampa(t, tw - 0.3, 0.3), "", 30)}
          <div style={{ position: "absolute", left: 200, top: 330 + k * 260, fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: "#5B4A3E", opacity: rampa(t, tw - 0.2, 0.3) }}>{tit}</div>
          <div style={{ position: "absolute", left: 200, top: 385 + k * 260, fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA, opacity: rampa(t, tw2 - 0.3, 0.3) }}>{ej}</div>
          {k < 2 && <Gigante x={540} y={530 + k * 260} txt="⬇️" p={rampa(t, tw2, 0.3)} tam={50} />}
        </div>
      ))}
      <Sombra x={220} y={1510} w={170} />
      <Mascota esp="perro-corbatin" x={220} y={1515} alto={290} t={t} cara={t > M.danarse ? "triste" : "tranquila"} semilla={9} />
      <Sombra x={860} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={860} y={1515} alto={280} t={t} cara="feliz" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 8 · Registro de riesgos ═════ */
function Registro({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const pR = rampa(t, M.registro - 0.4, 0.4);
  const COL = [[M.identificador, "ID", 130], [M.registro, "riesgo", 330], [M.dueno, "dueño", 190], [M.respuestas, "respuesta potencial", 270]];
  const FIL = [["R1", "🔥 horno se daña", "Ramón", "revisarlo antes"], ["R2", "🎪 otra feria", "Carmen", "tener masa extra"]];
  let x0 = 75;
  const xs = COL.map(([, , w]) => { const x = x0; x0 += w; return x; });
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="📒 registro de riesgos" p={pR} tam={54} fondo={MANGO} />
      <div style={{ position: "absolute", left: 60, top: 340, width: 960, height: 520, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, opacity: pR, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
        {COL.map(([tw, txt, w], k) => <div key={k} style={{ position: "absolute", left: xs[k] - 60, top: 20, width: w, fontSize: 30, textAlign: "center", opacity: rampa(t, tw - 0.3, 0.3), background: "#DDE3FF", borderRadius: 12, padding: "10px 0" }}>{txt}</div>)}
        {FIL.map((f, i) => f.map((c, k) => <div key={i + "-" + k} style={{ position: "absolute", left: xs[k] - 60, top: 130 + i * 170, width: COL[k][2], fontSize: 30, textAlign: "center", lineHeight: 1.15, opacity: rampa(t, COL[k][0] + i * 0.3, 0.3) }}>{c}</div>))}
      </div>
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara={t > M.respuestas ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · Informe de riesgos, y se repite ═════ */
function Informe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={420} w={330} p={rampa(t, M.informe - 0.4, 0.4)} titulo="informe de riesgos" letra={38} giro={-2} />
      <Cartel x={540} y={740} txt="🌐 fuentes de riesgo general" p={rampa(t, M.fuentes9 - 0.35, 0.3)} tam={34} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={850} txt="📊 resumen de los individuales" p={rampa(t, M.resumen - 0.35, 0.3)} tam={34} fondo={CREMA} giro={2} />
      <Cartel x={540} y={1010} txt="🔁 se repite durante todo el proyecto" p={rampa(t, M.repite - 0.4, 0.35)} tam={40} fondo={MANGO} giro={-1} />
      <Sombra x={540} y={1520} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tus tres riesgos ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ tres riesgos de tu proyecto" p={rampa(t, M.toca - 0.2, 0.35)} tam={50} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={470 + k * 125} txt={`causa → riesgo → efecto`} p={rampa(t, M.tres - 0.2 + k * 0.4, 0.3)} tam={40} fondo={CREMA} giro={[-2, 2, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.efecto11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "tecnicas") return <Tecnicas t={t} />;
  if (p.tipo === "enunciado") return <Enunciado t={t} />;
  if (p.tipo === "registro") return <Registro t={t} />;
  if (p.tipo === "informe") return <Informe t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.ramon - 0.3, "pop", 0.3); fx(M.carmen - 0.3, "pop", 0.3); fx(M.pasar - 0.8, "pop-suave", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.identificar - 0.3, "pop", 0.3); fx(M.individuales - 0.35, "pop-suave", 0.22); fx(M.general3 - 0.4, "pop-suave", 0.22); fx(M.documentar - 0.35, "tiza", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); [M.tormenta, M.listas, M.entrevistas].forEach((w) => fx(w - 0.35, "pop", 0.22)); [M.fortalezas, M.debilidades, M.oportunidades, M.amenazas].forEach((w) => fx(w - 0.35, "pop-suave", 0.22));
fx(S(6) - 0.3, "whoosh", 0.4); [M.viejo, M.danarse, M.retrasarian].forEach((w) => fx(w - 0.3, "tiza", 0.22));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.registro - 0.4, "papel", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.informe - 0.4, "papel", 0.3); fx(M.repite - 0.4, "rebobina", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(riesgos|riesgo|registro|informe|causa|efecto|FODA|identificar)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP40 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp40-identificar-riesgos.mp3" sinSonido={sinSonido} />
);
