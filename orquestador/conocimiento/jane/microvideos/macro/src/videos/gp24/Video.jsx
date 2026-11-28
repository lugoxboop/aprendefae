/*
 * Gestión de Proyectos · GP-24 «"Pan rico" no es un requisito» (gp24-requisitos).
 * Una idea: Recopilar Requisitos es determinar, documentar y gestionar las necesidades y
 * requisitos de los interesados para cumplir los objetivos (5.2, p. 138). Técnicas:
 * entrevistas, cuestionarios y encuestas, grupos focales, estudios comparativos, análisis de
 * documentos (5.2.2, p. 142–144). Requisito: condición o capacidad para satisfacer una
 * necesidad (Glosario). Deben ser inequívocos (medibles y comprobables), trazables, completos,
 * coherentes y aceptables (5.2.3.1, p. 147). Categorías: negocio, interesados, soluciones…
 * Matriz de trazabilidad: vincula cada requisito desde su origen hasta el entregable que lo
 * satisface; ayuda a asegurar que se entreguen los requisitos aprobados (5.2.3.2, p. 148).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pan, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  queremos: W(1, "Queremos", 0.1), rico1: W(1, "rico.»", 0.25), suena: W(1, "Suena", 0.4), comprobar1: W(1, "comprobar.", 0.95),
  preguntar: W(2, "preguntar:", 0.15), entrevista: W(2, "entrevista", 0.3), encuesta: W(2, "encuesta", 0.6), grupo: W(2, "grupo", 0.85),
  compara: W(3, "compara", 0.15), documentos3: W(3, "documentos", 0.75),
  recopilando: W(4, "recopilando", 0.15), determina: W(4, "determina,", 0.4), documenta: W(4, "documenta", 0.55), gestiona: W(4, "gestiona", 0.7), interesados4: W(4, "interesados.", 0.95),
  condicion: W(5, "condición", 0.3), necesidad: W(5, "necesidad.", 0.95),
  medible: W(6, "medible", 0.2), comprobable: W(6, "comprobable:", 0.35), rico6: W(6, "rico»,", 0.55), caliente: W(6, "caliente", 0.75), siete: W(6, "siete».", 0.95),
  trazable: W(7, "trazable,", 0.15), completo: W(7, "completo,", 0.3), coherente: W(7, "coherente", 0.45), aceptable: W(7, "aceptable", 0.6),
  documentacion: W(8, "documentación", 0.2), negocio8: W(8, "negocio,", 0.45), interesados8: W(8, "interesados,", 0.65), soluciones: W(8, "soluciones", 0.85), otros: W(8, "otros.", 0.95),
  matriz: W(9, "matriz", 0.1), cuadricula: W(9, "cuadrícula", 0.35), origen: W(9, "origen", 0.6), entregable: W(9, "entregable", 0.85),
  final: W(10, "final,", 0.2), comprobar10: W(10, "comprobar", 0.5), aprobado: W(10, "aprobado.", 0.95),
  toca: W(11, "toca:", 0.15), convierte: W(11, "convierte", 0.3), medir: W(11, "medir.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "pregunta", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "requisito", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "doc", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "matriz", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1 · «Queremos pan rico» ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={330} y={380} w={620} h={200} colaX={830} p={rampa(t, M.queremos - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA, whiteSpace: "nowrap" }}>«Queremos pan rico»</div>
      </Dicho>
      <Pan x={540} y={820} w={260} giro={-8} />
      <Gigante x={330} y={760} txt="📏" p={rampa(t, M.suena - 0.2, 0.35)} tam={110} giro={-20} />
      <Gigante x={720} y={720} txt="❓" p={rampa(t, M.comprobar1 - 0.7, 0.35)} tam={130} giro={8 * Math.sin(t * 4)} />
      <Cartel x={540} y={1010} txt="¿cómo se comprueba?" p={rampa(t, M.comprobar1 - 0.5, 0.35)} tam={58} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={830} y={1510} w={190} />
      <Mascota esp="conejo" x={830} y={1515} alto={360} t={t} cara="feliz" semilla={5} espejo />
      <Sombra x={260} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={400} t={t} cara={t > M.comprobar1 - 0.6 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · Pía sale a preguntar ═════ */
function Pregunta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 960 }]);
  const TEC = [[M.entrevista, "🎤", "entrevistas"], [M.encuesta, "📝", "encuesta"], [M.grupo, "👥", "grupo focal"], [M.compara, "🔍", "comparar"], [M.documentos3, "📄", "documentos"]];
  const pos = [[220, 470], [540, 470], [860, 470], [380, 830], [700, 830]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.2}>
      {TEC.map(([tw, ic, txt], k) => <Ficha key={k} x={pos[k][0]} y={pos[k][1]} w={290} icono={ic} txt={txt} p={rampa(t, tw - 0.35, 0.35)} letra={40} giro={[-3, 2, 4, -2, 3][k]} />)}
      <Sombra x={540} y={1510} w={240} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={400} t={t} cara="feliz" bd={-80 * pulso(t, M.entrevista - 0.3, 1.2)} bi={-70 * pulso(t, M.compara - 0.3, 1.2)} semilla={3} />
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="conejo" x={170} y={1515} alto={300} t={t} cara="feliz" semilla={5} />
      <Sombra x={910} y={1510} w={190} />
      <Mascota esp="perro-mochila" x={910} y={1515} alto={340} t={t} cara="tranquila" semilla={12} espejo />
    </Escena>
  );
}

/* ═════ 4–7 · Qué es un requisito y cómo debe ser ═════ */
function Requisito({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const en6 = rampa(t, S(6) - 0.4, 0.35);
  const V4 = [[M.determina, "determina"], [M.documenta, "documenta"], [M.gestiona, "gestiona"]];
  const CAL = [[M.medible, "medible"], [M.comprobable, "comprobable"], [M.trazable, "trazable"], [M.completo, "completo"], [M.coherente, "coherente"], [M.aceptable, "aceptable"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="recopilar requisitos" p={rampa(t, M.recopilando - 0.4, 0.35)} tam={62} fondo={MANGO} />
      <div style={{ opacity: 1 - en6 }}>
        {V4.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={400} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={46} fondo={CREMA} giro={(k - 1) * 3} />)}
        <Cartel x={540} y={640} txt="📌 condición que debe cumplir" p={rampa(t, M.condicion - 0.4, 0.35)} tam={50} fondo="#E3F6EC" />
        <Cartel x={540} y={780} txt="para satisfacer una necesidad" p={rampa(t, M.necesidad - 0.6, 0.35)} tam={42} fondo={CREMA} giro={-2} />
      </div>
      {en6 > 0 && (
        <div style={{ opacity: en6 }}>
          <Cartel x={540} y={420} txt="«pan rico»" p={1} tam={64} fondo="#FFE1D8" />
          <Tachon x={540} y={420} w={340} p={rampa(t, M.rico6 - 0.1, 0.3)} />
          <Cartel x={540} y={580} txt="«pan caliente antes de las 7» ⏰" p={rampa(t, M.caliente - 0.4, 0.35)} tam={50} fondo={COLOR.VERDE} color="#fff" giro={-2} />
        </div>
      )}
      {CAL.map(([tw, txt], k) => {
        const q = rampa(t, tw - 0.35, 0.3);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 80 + (k % 2) * 470, top: 720 + Math.floor(k / 2) * 120, width: 450, height: 96, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", background: CREMA, border: `6px solid ${TINTA}`, borderRadius: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, transform: `scale(${rebote(q)})` }}>
            <span style={{ color: COLOR.VERDE }}>✓</span>{txt}
          </div>
        );
      })}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={280} t={t} cara={t > M.caliente ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 8 · La documentación de requisitos ═════ */
function Doc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.03, x: 540, y: 960 }]);
  const CAT = [[M.negocio8, "💼 del negocio"], [M.interesados8, "👥 de los interesados"], [M.soluciones, "🧩 de las soluciones"], [M.otros, "… y otros"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={560} w={420} p={rampa(t, M.documentacion - 0.4, 0.4)} titulo="documentación de requisitos" letra={44} />
      {CAT.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 760 : 320} y={950 + Math.floor(k / 2) * 120} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={40} fondo={k === 3 ? CREMA : "#DDE3FF"} giro={k % 2 ? 2 : -2} />)}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · La matriz de trazabilidad ═════ */
function Matriz({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pM = rampa(t, M.matriz - 0.4, 0.4);
  const COL = [["origen", "🗣️ clientes (encuesta)", M.origen], ["requisito", "pan caliente antes de las 7", M.matriz + 0.5], ["entregable", "🔥 turno de horno a las 5", M.entregable]];
  const linea = sale(rampa(t, M.entregable + 0.1, 0.7));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="matriz de trazabilidad" p={rampa(t, M.matriz - 0.3, 0.35)} tam={60} fondo={MANGO} />
      {pM > 0 && (
        <div style={{ position: "absolute", left: 50, top: 380, width: 980, height: 560, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, transform: `scale(${rebote(pM)})`, overflow: "hidden", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          {COL.map(([cab, val, tw], c) => (
            <div key={c} style={{ position: "absolute", left: c * 321, top: 0, width: 321, height: "100%", borderLeft: c ? `6px solid ${TINTA}` : "none", boxSizing: "border-box" }}>
              <div style={{ height: 90, background: ["#DDE3FF", "#FFF4DA", "#E3F6EC"][c], borderBottom: `6px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{cab}</div>
              <div style={{ padding: "30px 20px", fontSize: 40, lineHeight: 1.15, textAlign: "center", opacity: rampa(t, tw - 0.3, 0.35), transform: `scale(${lerp(0.9, 1, rebote(rampa(t, tw - 0.3, 0.35)))})` }}>{val}</div>
              {[1, 2].map((r) => <div key={r} style={{ position: "absolute", left: 30, right: 30, top: 240 + r * 100, height: 12, borderRadius: 6, background: "#E8E2D5" }} />)}
            </div>
          ))}
          {linea > 0 && <div style={{ position: "absolute", left: 60, top: 260, width: 860 * linea, height: 14, borderRadius: 7, background: COLOR.CORAL }} />}
        </div>
      )}
      <Cartel x={540} y={1060} txt="✅ se entregó lo aprobado" p={rampa(t, M.aprobado - 0.6, 0.35)} tam={56} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.aprobado - 0.5 ? "estrellas" : "feliz"} bi={-50 * pulso(t, M.comprobar10 - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Convierte «pan rico» en un requisito medible ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="⚡ «pan rico» → ¿medible?" p={rampa(t, M.toca - 0.2, 0.35)} tam={62} fondo={MANGO} />
      <Pan x={540} y={720} w={240} giro={6 * Math.sin(t * 2)} />
      <Gigante x={760} y={680} txt="📏" p={rampa(t, M.convierte - 0.3, 0.35)} tam={110} giro={-20 + 10 * Math.sin(t * 3)} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.medir - 0.2, 0.5)} semilla={3} />
      <Sombra x={780} y={1530} w={200} />
      <Mascota esp="conejo" x={780} y={1535} alto={380} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "pregunta") return <Pregunta t={t} />;
  if (p.tipo === "requisito") return <Requisito t={t} />;
  if (p.tipo === "doc") return <Doc t={t} />;
  if (p.tipo === "matriz") return <Matriz t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.queremos - 0.3, "pop", 0.35); fx(M.suena - 0.2, "pop-suave", 0.3); fx(M.comprobar1 - 0.6, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [M.entrevista, M.encuesta, M.grupo, M.compara, M.documentos3].forEach((w) => fx(w - 0.35, "pop-suave", 0.25));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.recopilando - 0.4, "pop", 0.35); [M.determina, M.documenta, M.gestiona].forEach((w) => fx(w - 0.3, "pop-suave", 0.22)); fx(M.condicion - 0.4, "pop", 0.3);
fx(M.rico6 - 0.1, "tiza", 0.35); fx(M.caliente - 0.4, "ding", 0.35); [M.medible, M.comprobable, M.trazable, M.completo, M.coherente, M.aceptable].forEach((w) => fx(w - 0.35, "pop-suave", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.documentacion - 0.4, "papel", 0.35); [M.negocio8, M.interesados8, M.soluciones, M.otros].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.matriz - 0.4, "papel", 0.3); fx(M.origen - 0.3, "pop", 0.25); fx(M.entregable - 0.3, "pop", 0.25); fx(M.entregable + 0.1, "tiza-larga", 0.3); fx(M.aprobado - 0.6, "campana", 0.35);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg", "art/calle.jpg"];
const CLAVE = /^(requisito|requisitos|medible|comprobable|trazable|matriz|trazabilidad|documentación|origen|entregable)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP24 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp24-requisitos.mp3" sinSonido={sinSonido} />
);
