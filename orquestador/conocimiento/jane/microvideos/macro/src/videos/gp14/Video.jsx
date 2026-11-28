/*
 * Gestión de Proyectos · GP-14 «A tiempo y fracasó» (gp14-exito).
 * Una idea: el éxito no es solo tiempo, costo, alcance y calidad; también se mide por el
 * logro de los objetivos del proyecto. Los interesados pueden ver el éxito distinto, así que
 * se responden y acuerdan tres preguntas y se eligen objetivos medibles. Un proyecto puede
 * ser exitoso en alcance/cronograma/presupuesto y no serlo para el negocio si el mercado
 * cambia antes de concluir (G 1.2.6.4, p. 34–35).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Local, Ficha, Tachon, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.4, 0.3, 0.35, 0.3, 0.35, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  tiempo1: W(1, "tiempo", 0.25), presupuesto1: W(1, "presupuesto,", 0.45), fracasar: W(1, "fracasar.", 0.95),
  ramon: W(2, "Ramón", 0.1), fotos: W(2, "fotos", 0.65), barrio: W(2, "barrio.", 0.95),
  tiempo3: W(3, "tiempo,", 0.25), presupuesto3: W(3, "presupuesto", 0.6), hecha: W(3, "hecha.", 0.95),
  montaba: W(4, "montaba,", 0.2), celular: W(4, "celular.", 0.65), nadie: W(4, "Nadie", 0.85), entro: W(4, "entró.", 0.95),
  exito5: W(5, "Éxito", 0.05), fracaso: W(5, "fracaso", 0.35), negocio: W(5, "negocio.", 0.45), mercado: W(5, "mercado", 0.75), terminar: W(5, "terminar.", 0.95),
  tradicion: W(6, "tradición,", 0.15), tiempo6: W(6, "tiempo,", 0.55), costo6: W(6, "costo,", 0.65), alcance6: W(6, "alcance", 0.8), calidad6: W(6, "calidad.", 0.95),
  objetivos: W(7, "objetivos", 0.8),
  interesado: W(8, "interesado", 0.2), distinta: W(8, "distinta", 0.6), exito8: W(8, "éxito.", 0.95),
  tres: W(9, "tres", 0.2), define: W(9, "define", 0.45), medira: W(9, "medirá?,", 0.65), influir: W(9, "influir?", 0.95),
  documentan: W(10, "documentan,", 0.25), acuerdan: W(10, "acuerdan", 0.5), director: W(10, "director.", 0.95),
  medibles: W(11, "medibles:", 0.3), bien: W(11, "bien»,", 0.55), cien: W(11, "cien", 0.75), mes: W(11, "mes».", 0.95),
  toca: W(12, "toca:", 0.15), medir: W(12, "medir", 0.6), proyecto12: W(12, "proyecto?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "tienda", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "balance", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "medidas", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "miradas", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "preguntas", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "medible", desde: S(11) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Fila con chulo (✓) o equis */
function Chulo({ x, y, txt, p, ok = true, tam = 54 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 18, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "0 50%", fontFamily: "Sora", fontWeight: 800, fontSize: tam, color: TINTA, whiteSpace: "nowrap" }}>
      <div style={{ width: tam * 1.3, height: tam * 1.3, borderRadius: 16, border: `7px solid ${TINTA}`, background: ok ? COLOR.VERDE : ROJO, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: tam }}>{ok ? "✓" : "✗"}</div>
      <span style={{ background: CREMA, border: `6px solid ${TINTA}`, borderRadius: 18, padding: "4px 18px 8px" }}>{txt}</span>
    </div>
  );
}

/* ═════ 1 · A tiempo y en presupuesto… y fracasó ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(5px)" velo={0.15}>
      <Chulo x={180} y={330} txt="a tiempo" p={rampa(t, M.tiempo1 - 0.3, 0.35)} />
      <Chulo x={180} y={480} txt="en presupuesto" p={rampa(t, M.presupuesto1 - 0.3, 0.35)} />
      <Cartel x={540} y={800} txt="✗ fracasó" p={rampa(t, M.fracasar - 0.5, 0.35)} tam={110} fondo={ROJO} color="#fff" giro={-4} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={440} t={t} cara={t > M.fracasar - 0.4 ? "triste" : "feliz"} orejas={t > M.fracasar - 0.4 ? -6 : 0} semilla={9} />
    </Escena>
  );
}

/* ═════ 2–4 · La tienda de fotos de Ramón ═════ */
function Tienda({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.05, x: 540, y: 1000 }]);
  const enCel = rampa(t, M.montaba - 0.3, 0.5);
  const gente = [0, 1, 2, 3];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(3px)" velo={0.1}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${0.75 * rebote(rampa(t, M.fotos - 0.4, 0.4))})`, transformOrigin: "540px 820px" }}>
        <Local x={540} y={820} w={460} alto={1} toldo={1} letrero={1} nombre="Fotos" t={t} />
      </div>
      <Gigante x={540} y={360} txt="📸" p={rampa(t, M.fotos - 0.3, 0.35)} tam={110} />
      <div style={{ opacity: 1 - enCel }}>
        <Chulo x={90} y={880} txt="a tiempo" p={rampa(t, M.tiempo3 - 0.3, 0.35)} tam={44} />
        <Chulo x={90} y={990} txt="en presupuesto" p={rampa(t, M.presupuesto3 - 0.3, 0.35)} tam={44} />
        <Chulo x={90} y={1100} txt="bien hecha" p={rampa(t, M.hecha - 0.4, 0.35)} tam={44} />
      </div>
      {enCel > 0 && gente.map((k) => <Gigante key={k} x={150 + k * 260} y={1000 + (k % 2) * 40} txt="🧍📱" p={rampa(t, M.celular - 0.6 + k * 0.1, 0.35)} tam={90} />)}
      <Cartel x={540} y={1240} txt="nadie entró" p={rampa(t, M.nadie - 0.3, 0.35)} tam={60} fondo="#FFD3CF" giro={-2} />
      <Sombra x={860} y={1510} w={220} />
      <Mascota esp="perro-corbatin" x={860} y={1515} alto={400} t={t} cara={t > M.celular ? "triste" : "feliz"} orejas={t > M.celular ? -6 : 0} semilla={9} espejo />
      <Placa x={860} y={1040} nombre="Ramón" rol="tienda de fotos" p={rampa(t, M.ramon - 0.2, 0.35) * (1 - rampa(t, M.tiempo3 - 0.4, 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 5 · Éxito del proyecto, fracaso del negocio ═════ */
function Balance({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5), b: E(5), s: 1.03, x: 540, y: 960 }]);
  const lado = (x, titulo, items, ok, tw, col) => (
    <div style={{ position: "absolute", left: x, top: 260, width: 450, height: 700, background: "rgba(255,253,247,.92)", border: `8px solid ${TINTA}`, borderTop: `26px solid ${col}`, borderRadius: 30, opacity: rampa(t, tw - 0.3, 0.35), transform: `scale(${rebote(rampa(t, tw - 0.3, 0.35))})` }}>
      <div style={{ textAlign: "center", marginTop: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: TINTA }}>{titulo}</div>
      <div style={{ textAlign: "center", fontSize: 150, lineHeight: 1.2, color: ok ? COLOR.VERDE : ROJO, fontFamily: "Sora", fontWeight: 800 }}>{ok ? "✓" : "✗"}</div>
      {items.map((it, k) => <div key={k} style={{ textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 42, color: TINTA, marginTop: 10 }}>{it}</div>)}
    </div>
  );
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.2}>
      {lado(60, "proyecto", ["alcance", "cronograma", "presupuesto"], true, M.exito5, COLOR.VERDE)}
      {lado(570, "negocio", ["sin clientes"], false, M.fracaso, ROJO)}
      <Cartel x={540} y={1120} txt="🌪️ el mercado cambió antes de terminar" p={rampa(t, M.mercado - 0.4, 0.35)} tam={42} fondo={MANGO} />
      <Sombra x={540} y={1510} w={220} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={340} t={t} cara="triste" semilla={9} />
    </Escena>
  );
}

/* ═════ 6–7 · Las cuatro medidas de siempre, más los objetivos ═════ */
function Medidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.03, x: 540, y: 960 }]);
  const cuatro = [[M.tiempo6, "⏰", "tiempo"], [M.costo6, "💰", "costo"], [M.alcance6, "📦", "alcance"], [M.calidad6, "⭐", "calidad"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={290} txt="por tradición" p={rampa(t, M.tradicion - 0.3, 0.35)} tam={56} fondo={CREMA} />
      {cuatro.map(([tw, ic, txt], k) => <Ficha key={k} x={[290, 790, 290, 790][k]} y={k < 2 ? 530 : 800} w={300} letra={44} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Cartel x={540} y={1120} txt="+ 🎯 los objetivos del proyecto" p={rampa(t, M.objetivos - 0.5, 0.35)} tam={56} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Destello x={540} y={1120} r={260} p={rampa(t, M.objetivos - 0.3, 0.8)} />
      <Sombra x={540} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bi={-60 * pulso(t, M.objetivos - 0.4, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8 · Cada interesado ve el éxito distinto ═════ */
function Miradas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.03, x: 540, y: 980 }]);
  const quien = [["gato-gafas", 200, 6, "💰", "ganar plata"], ["hamster-gorra", 540, 3, "😊", "clientes felices"], ["perro-mochila", 880, 4, "🏠", "terminar pronto"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.12}>
      <Cartel x={540} y={300} txt="¿qué es el éxito?" p={rampa(t, M.interesado - 0.3, 0.35)} tam={64} fondo={MANGO} />
      {quien.map(([esp, x, sem, ic, txt], k) => (
        <div key={k}>
          <Ficha x={x} y={760} w={300} letra={38} icono={ic} txt={txt} p={rampa(t, M.distinta - 0.6 + k * 0.2, 0.35)} giro={k % 2 ? 3 : -3} />
          <Sombra x={x} y={1510} w={200} />
          <Mascota esp={esp} x={x} y={1515} alto={380} t={t} cara="feliz" cab={6 * Math.sin(t * 2.5 + k)} semilla={sem} espejo={k === 2} />
        </div>
      ))}
    </Escena>
  );
}

/* ═════ 9–10 · Tres preguntas, documentadas y acordadas ═════ */
function Preguntas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const qs = [[M.define, "1", "¿cómo se define el éxito?"], [M.medira, "2", "¿cómo se medirá?"], [M.influir, "3", "¿qué puede influir?"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      {qs.map(([tw, n, txt], k) => {
        const p = rampa(t, tw - 0.5, 0.35);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 70, top: 290 + k * 190, width: 940, height: 150, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 26, padding: "0 28px", boxShadow: "0 9px 0 rgba(42,30,23,.25)", transform: `translateX(${(1 - sale(p)) * 900}px)`, fontFamily: "Sora", fontWeight: 800, fontSize: 48, whiteSpace: "nowrap", color: TINTA }}>
            <div style={{ flex: "0 0 auto", width: 84, height: 84, borderRadius: "50%", background: MANGO, border: `6px solid ${TINTA}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{n}</div>{txt}
          </div>
        );
      })}
      <Cartel x={540} y={950} txt="✍️ se documentan y se acuerdan" p={rampa(t, M.documentan - 0.3, 0.35)} tam={52} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Sombra x={330} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={330} y={1515} alto={340} t={t} cara="feliz" bd={-60 * pulso(t, M.acuerdan - 0.3, 1)} semilla={3} />
      <Sombra x={760} y={1510} w={210} />
      <Mascota esp="gato-gafas" x={760} y={1515} alto={370} t={t} cara="feliz" bi={-60 * pulso(t, M.acuerdan - 0.2, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 11 · Objetivos medibles ═════ */
function Medible({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.03, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={300} txt="📏 objetivos medibles" p={rampa(t, M.medibles - 0.4, 0.35)} tam={64} fondo={MANGO} />
      <Cartel x={540} y={540} txt="«que se venda bien»" p={rampa(t, M.bien - 0.6, 0.35)} tam={60} />
      <Tachon x={540} y={540} w={640} p={rampa(t, M.bien - 0.1, 0.3)} />
      <Cartel x={540} y={780} txt="«100 clientes al mes»" p={rampa(t, M.cien - 0.3, 0.35)} tam={68} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Destello x={540} y={780} r={300} p={rampa(t, M.cien - 0.2, 0.8)} />
      <Sombra x={540} y={1510} w={240} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={400} t={t} cara={t > M.cien ? "feliz" : "tranquila"} bd={-60 * pulso(t, M.cien - 0.3, 1)} semilla={9} />
    </Escena>
  );
}

/* ═════ 12 · ¿Cómo medirás tu éxito? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Gigante x={540} y={520} txt="📏" p={rampa(t, M.toca - 0.2, 0.35)} tam={200} giro={-10 + 6 * Math.sin(t * 3)} />
      <Cartel x={540} y={820} txt="tu éxito, ¿cómo se mide?" p={rampa(t, M.medir - 0.4, 0.35)} tam={60} fondo={CREMA} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto12 - 0.2, 0.5)} semilla={3} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="perro-corbatin" x={780} y={1535} alto={440} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "tienda") return <Tienda t={t} />;
  if (p.tipo === "balance") return <Balance t={t} />;
  if (p.tipo === "medidas") return <Medidas t={t} />;
  if (p.tipo === "miradas") return <Miradas t={t} />;
  if (p.tipo === "preguntas") return <Preguntas t={t} />;
  if (p.tipo === "medible") return <Medible t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.tiempo1 - 0.3, "ding", 0.3); fx(M.presupuesto1 - 0.3, "ding", 0.3); fx(M.fracasar - 0.5, "toc-grave", 0.45);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.fotos - 0.4, "pop", 0.35); [M.tiempo3, M.presupuesto3, M.hecha].forEach((w) => fx(w - 0.3, "ding", 0.25));
fx(M.celular - 0.6, "burbuja", 0.3); fx(M.nadie - 0.3, "viento", 0.3);
fx(S(5) - 0.3, "barrido-lento", 0.35); fx(M.exito5 - 0.3, "ding", 0.3); fx(M.fracaso - 0.3, "toc", 0.35); fx(M.mercado - 0.4, "viento", 0.3);
fx(S(6) - 0.3, "whoosh", 0.4); [M.tiempo6, M.costo6, M.alcance6, M.calidad6].forEach((w) => fx(w - 0.3, "pop", 0.3)); fx(M.objetivos - 0.5, "campana", 0.4);
fx(S(8) - 0.3, "whoosh", 0.4); [0, 1, 2].forEach((k) => fx(M.distinta - 0.6 + k * 0.2, "pop-suave", 0.3));
fx(S(9) - 0.3, "barrido-lento", 0.35); [M.define, M.medira, M.influir].forEach((w) => fx(w - 0.5, "desliza", 0.3)); fx(M.documentan - 0.3, "firma", 0.35);
fx(S(11) - 0.3, "whoosh", 0.4); fx(M.bien - 0.1, "tijera", 0.3); fx(M.cien - 0.3, "ding", 0.35);
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/ciudad.jpg", "art/calle.jpg", "art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(éxito|fracasar|fracaso|negocio|mercado|objetivos|medibles|interesado|medirá|tiempo|costo|alcance|calidad)[.,:?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP14 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp14-exito.mp3" sinSonido={sinSonido} />
);
