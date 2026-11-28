/*
 * Gestión de Proyectos · GP-54 «Elegir y firmar» (gp54-efectuar-adquisiciones).
 * Una idea: Efectuar las Adquisiciones es obtener respuestas de los proveedores, seleccionarlos y
 * adjudicarles un contrato (12.2, p. 482). Publicidad (12.2.2.2); conferencias de oferentes: comprensión
 * clara y en común, ningún trato preferencial (12.2.2.3); evaluación de propuestas (12.2.2.4); negociación:
 * estructura, derechos y obligaciones antes de firmar (12.2.2.5, p. 488). Salidas: vendedores seleccionados
 * (12.2.3.1) y acuerdos: el contrato obliga al vendedor y al comprador, relación legal; componentes (12.2.3.2, p. 489).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 6: ["Después se evalúan las propuestas:", "¿están completas?", "¿Responden al enunciado del trabajo", "relativo a las adquisiciones y a los criterios?"] },
});
const { S, E, W } = T;

const M = {
  toldo: W(1, "toldo.", 0.3), quien: W(1, "quién,", 0.7), firmar: W(1, "firmar.", 0.97),
  bien: W(2, "bien?", 0.9),
  efectuar: W(3, "Efectuar", 0.03), respuestas: W(3, "respuestas", 0.35), seleccionarlos: W(3, "seleccionarlos", 0.65), contrato3: W(3, "contrato.", 0.97),
  publicidad: W(4, "publicidad,", 0.35), vendedores4: W(4, "vendedores", 0.85),
  conferencia: W(5, "conferencia", 0.15), mismo: W(5, "mismo,", 0.55), preferencial: W(5, "preferencial.", 0.97),
  propuestas: W(6, "propuestas:", 0.25), completas: W(6, "completas?", 0.4), enunciado: W(6, "enunciado", 0.65), criterios: W(6, "criterios?", 0.97),
  negocia: W(7, "negocia:", 0.3), derechos: W(7, "derechos,", 0.45), obligaciones: W(7, "obligaciones", 0.6), terminos: W(7, "términos,", 0.72), firmar7: W(7, "firmar.", 0.97),
  salidas: W(8, "salidas", 0.15), seleccionados: W(8, "seleccionados", 0.55), acuerdos: W(8, "acuerdos.", 0.97),
  obliga: W(9, "obliga", 0.15), entregar: W(9, "entregar", 0.35), pagarle: W(9, "pagarle.", 0.65), legal: W(9, "legal.", 0.97),
  trabajo10: W(10, "trabajo", 0.2), cronograma10: W(10, "cronograma,", 0.4), precios: W(10, "precios,", 0.52), garantia: W(10, "garantía", 0.65), cambios10: W(10, "cambios.", 0.97),
  toca: W(11, "toca:", 0.15), cinco: W(11, "cinco", 0.3), comprar: W(11, "comprar.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "pasos", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "salidas", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "contrato", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · ¿A quién y cómo? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={540} y={280} txt="⛱️🛒" p={rampa(t, M.toldo - 0.3, 0.35)} tam={150} />
      <Cartel x={540} y={450} txt="toldo: se compra" p={rampa(t, M.toldo, 0.3)} tam={44} fondo={MANGO} giro={-2} />
      {["🏪 A", "🏪 B", "🏪 C"].map((v, k) => <Cartel key={k} x={220 + k * 320} y={620} txt={v} p={rampa(t, M.quien - 0.3 + k * 0.12, 0.3)} tam={44} fondo={CREMA} giro={[-3, 1, 3][k]} />)}
      <Cartel x={540} y={760} txt="✍️ firmar" p={rampa(t, M.firmar - 0.4, 0.3)} tam={44} fondo="#DDE3FF" giro={1} />
      <Cartel x={540} y={890} txt="¿cómo se hace bien?" p={rampa(t, M.bien - 0.5, 0.3)} tam={42} fondo="#FFFDF7" giro={-1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara="tranquila" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-mochila" x={820} y={1515} alto={340} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.respuestas, "📨 obtener respuestas de los proveedores"], [M.seleccionarlos, "✅ seleccionarlos"], [M.contrato3, "✍️ adjudicarles un contrato"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="efectuar las adquisiciones" p={rampa(t, M.efectuar - 0.3, 0.35)} tam={48} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={400 + k * 140} txt={txt} p={rampa(t, tw - 0.4, 0.3)} tam={38} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · Cuatro pasos ═════ */
const PASOS = [
  ["📣", "publicidad", "ampliar la lista de vendedores potenciales", "#FFFDF7"],
  ["🎤", "conferencia de oferentes", "todos escuchan lo mismo · sin trato preferencial", CREMA],
  ["📑", "evaluación de propuestas", "¿completas? ¿responden al enunciado del trabajo y a los criterios de selección?", "#DDE3FF"],
  ["🤝", "negociación", "derechos · obligaciones · términos, antes de firmar", "#E3F6EC"],
];
function Pasos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const tw = [M.publicidad, M.conferencia, M.propuestas, M.negocia];
  const sub = [M.vendedores4, M.mismo, M.completas, M.derechos];
  const activa = tw.reduce((a, w, k) => (t >= w - 0.3 ? k : a), -1);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {PASOS.map(([ic, nom, s1, fondo], k) => {
        const q = rampa(t, tw[k] - 0.4, 0.3);
        if (q <= 0) return null;
        const on = k === activa;
        return (
          <div key={k} style={{ position: "absolute", left: 50, top: 170 + k * 230, width: 980, height: 200, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 26px", background: fondo, border: `${on ? 9 : 5}px solid ${on ? AZUL : TINTA}`, borderRadius: 24, transform: `scale(${rebote(q) * (on ? 1.02 : 0.97)})`, opacity: on ? 1 : 0.8, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
            <span style={{ fontSize: 80 }}>{ic}</span>
            <div style={{ lineHeight: 1.12 }}>
              <div style={{ fontSize: 30, color: "#5B4A3E" }}>paso {k + 1}</div>
              <div style={{ fontSize: 44 }}>{nom}</div>
              <div style={{ fontSize: 28, color: "#5B4A3E", marginTop: 4, opacity: rampa(t, sub[k] - 0.3, 0.3) }}>{s1}</div>
            </div>
          </div>
        );
      })}
      <Sombra x={180} y={1530} w={140} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={140} />
      <Mascota esp="perro-mochila" x={900} y={1535} alto={230} t={t} cara={t > M.negocia ? "feliz" : "tranquila"} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 8 · Dos salidas clave ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={210} txt="dos salidas clave" p={rampa(t, M.salidas - 0.4, 0.35)} tam={48} fondo={MANGO} />
      <Documento x={290} y={600} w={340} p={rampa(t, M.seleccionados - 0.5, 0.4)} titulo="vendedores seleccionados" letra={38} giro={-3} />
      <Documento x={790} y={600} w={340} p={rampa(t, M.acuerdos - 0.5, 0.4)} titulo="acuerdos" letra={48} giro={3} sello={rampa(t, M.acuerdos, 0.4)} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="estrellas" semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · El contrato ═════ */
function Contrato({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const I = [[M.trabajo10, "📦 trabajo a entregar"], [M.cronograma10, "📅 cronograma"], [M.precios, "💲 precios"], [M.garantia, "🛡️ garantía"], [M.cambios10, "🔄 manejo de las solicitudes de cambio"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="✍️ el contrato" p={rampa(t, M.obliga - 0.4, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={280} y={300} txt="🏪 vendedor: entrega" p={rampa(t, M.entregar - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={800} y={300} txt="🐹 comprador: paga" p={rampa(t, M.pagarle - 0.3, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={540} y={420} txt="⚖️ relación legal" p={rampa(t, M.legal - 0.4, 0.3)} tam={40} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={560} txt="puede incluir:" p={rampa(t, M.trabajo10 - 0.6, 0.3)} tam={32} fondo="#FFFDF7" />
      {I.map(([tw, txt], k) => <Cartel key={k} x={k === 4 ? 540 : k % 2 ? 790 : 290} y={670 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-2, 2, 1, -1, 1][k]} />)}
      <Sombra x={180} y={1530} w={140} />
      <Mascota esp="hamster-gorra" x={180} y={1535} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={900} y={1530} w={140} />
      <Mascota esp="perro-mochila" x={900} y={1535} alto={230} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu contrato ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={240} txt="⚡ tu contrato: 5 cosas" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      {[0, 1, 2, 3, 4].map((k) => <Cartel key={k} x={540} y={370 + k * 95} txt={`${k + 1}. ____________`} p={rampa(t, M.cinco + k * 0.2, 0.3)} tam={40} fondo={CREMA} giro={[-1, 1, -1, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={400} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.comprar, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-mochila" x={790} y={1535} alto={360} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "pasos") return <Pasos t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  if (p.tipo === "contrato") return <Contrato t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.toldo - 0.3, "pop", 0.3); [0, 1, 2].forEach((k) => fx(M.quien - 0.3 + k * 0.12, "pop-suave", 0.18)); fx(M.firmar - 0.4, "firma", 0.3); fx(M.bien - 0.5, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.respuestas, M.seleccionarlos, M.contrato3].forEach((w) => fx(w - 0.4, "pop", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); [M.publicidad, M.conferencia, M.propuestas, M.negocia].forEach((w) => fx(w - 0.4, "pop", 0.24));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.seleccionados - 0.5, "papel", 0.3); fx(M.acuerdos - 0.5, "papel", 0.3); fx(M.acuerdos, "sello", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); [M.entregar, M.pagarle, M.legal].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); [M.trabajo10, M.cronograma10, M.precios, M.garantia, M.cambios10].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(adquisiciones|proveedores|contrato|publicidad|conferencia|oferentes|propuestas|negocia:|acuerdos|vendedores)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP54 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp54-efectuar-adquisiciones.mp3" sinSonido={sinSonido} />
);
