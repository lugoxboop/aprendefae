/*
 * Gestión de Proyectos · GP-29 «¿Coser sin tela?» (gp29-red).
 * Una idea: Secuenciar las Actividades es identificar y documentar las relaciones entre las
 * actividades del proyecto (6.3, p. 187). Método de diagramación por precedencia (PDM):
 * final a inicio (FS, la más usada), final a final (FF), inicio a inicio (SS) e inicio a final
 * (SF, esporádica); predecesora y sucesora (6.3.2.1, p. 189–190). Dependencias obligatorias
 * (ley, contrato o naturaleza del trabajo), discrecionales (mejores prácticas, aunque existan
 * otras secuencias aceptables), externas (por regla general fuera del control del equipo) e
 * internas (6.3.2.2, p. 191–192). Diagrama de red del cronograma: representación gráfica de
 * las relaciones lógicas entre actividades (6.3.3.1, p. 193).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  coser1: W(1, "coser", 0.2), tela1: W(1, "tela.", 0.95),
  esperar: W(2, "esperar", 0.7),
  secuenciar: W(3, "secuenciar", 0.2), identificar: W(3, "identificar", 0.5), relaciones3: W(3, "relaciones", 0.85),
  comun: W(4, "común", 0.15), final4: W(4, "final", 0.25), inicio4: W(4, "inicio:", 0.35), coser4: W(4, "coser", 0.45), termine: W(4, "termine", 0.75),
  predecesora: W(5, "predecesora;", 0.45), sucesora: W(5, "sucesora.", 0.95),
  ii: W(6, "inicio", 0.25), ff: W(6, "final", 0.5), poco: W(6, "poco", 0.7), fi: W(6, "inicio", 0.88, 2),
  obligatorias: W(7, "obligatorias,", 0.25), ley: W(7, "ley,", 0.35), contrato: W(7, "contrato", 0.45), naturaleza: W(7, "naturaleza", 0.6), costura: W(7, "costura.", 0.95),
  discrecionales: W(8, "discrecionales:", 0.2), practicas: W(8, "prácticas,", 0.5), aceptables: W(8, "aceptables.", 0.95),
  proveedor: W(9, "proveedor,", 0.3), externa: W(9, "externa:", 0.5), control9: W(9, "control", 0.85),
  diagrama: W(10, "diagrama", 0.3), red: W(10, "red", 0.4), graficamente: W(10, "gráficamente", 0.7), relaciones10: W(10, "relaciones", 0.85),
  toca: W(11, "toca:", 0.15), ordena: W(11, "ordena", 0.3), dibuja: W(11, "dibuja", 0.75),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "secuenciar", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "relacion", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "dependencias", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "red", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Caja de actividad */
function Act({ x, y, w = 280, h = 130, p, id, ic, txt, borde = TINTA, fondo = CREMA, letra = 34 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", background: fondo, border: `6px solid ${borde}`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Sora", fontWeight: 800, color: TINTA, fontSize: letra, lineHeight: 1.05, textAlign: "center", padding: "0 10px", transform: `scale(${rebote(Math.min(1, p))})` }}>
      {id && <div style={{ position: "absolute", top: -24, left: 14, background: AZUL, color: "#fff", fontSize: 26, padding: "1px 12px", borderRadius: 10, border: `4px solid ${TINTA}` }}>{id}</div>}
      <span style={{ fontSize: letra * 1.5 }}>{ic}</span><span>{txt}</span>
    </div>
  );
}

/* Flecha recta que se dibuja */
const Fl = ({ x0, y0, x1, y1, p, color = TINTA, g = 9 }) => {
  if (p <= 0) return null;
  const q = clamp01(p), x = lerp(x0, x1, q), y = lerp(y0, y1, q), a = Math.atan2(y1 - y0, x1 - x0);
  const pt = (d, s) => `${x - d * Math.cos(a) + s * Math.sin(a)},${y - d * Math.sin(a) - s * Math.cos(a)}`;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935, overflow: "visible" }}>
      <line x1={x0} y1={y0} x2={x} y2={y} stroke={color} strokeWidth={g} strokeLinecap="round" />
      {q > 0.2 && <polygon points={`${x},${y} ${pt(30, 16)} ${pt(30, -16)}`} fill={color} />}
    </svg>
  );
};

/* ═════ 1 · Coser sin tela ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={420} y={560} txt="🧵" p={rampa(t, M.coser1 - 0.3, 0.35)} tam={180} giro={-15 + 8 * Math.sin(t * 4)} />
      <Gigante x={700} y={560} txt="❓" p={rampa(t, M.tela1 - 0.8, 0.35)} tam={150} giro={10} />
      <Cartel x={540} y={840} txt="¿y la tela? 🤷" p={rampa(t, M.tela1 - 0.7, 0.35)} tam={62} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={300} y={1510} w={210} />
      <Mascota esp="perro-corbatin" x={300} y={1515} alto={400} t={t} cara={t > M.tela1 - 0.6 ? "triste" : "feliz"} bd={-60 * pulso(t, M.coser1 - 0.3, 1)} semilla={9} />
      <Sombra x={800} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={800} y={1515} alto={360} t={t} cara="tranquila" cab={6 * Math.sin(t * 3)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · Secuenciar ═════ */
function Secuenciar({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  const orden = sale(rampa(t, M.relaciones3 - 0.6, 0.8));
  const A = [["A1", "📏", "medir", [700, 560], [190, 760]], ["A2", "🛒", "comprar tela", [260, 900], [430, 760]], ["A3", "🧵", "coser", [820, 1000], [670, 760]], ["A4", "🔧", "instalar", [420, 600], [910, 760]]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="⏳ unas esperan a otras" p={rampa(t, M.esperar - 0.6, 0.35)} tam={50} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={380} txt="secuenciar las actividades" p={rampa(t, M.secuenciar - 0.4, 0.35)} tam={56} fondo={MANGO} />
      {A.map(([id, ic, txt, a, b], k) => <Act key={k} x={lerp(a[0], b[0], orden)} y={lerp(a[1], b[1], orden)} w={210} h={120} p={rampa(t, S(2) - 0.2 + k * 0.15, 0.35)} id={id} ic={ic} txt={txt} letra={28} />)}
      {[0, 1, 2].map((k) => <Fl key={k} x0={190 + k * 240 + 105} y0={760} x1={190 + (k + 1) * 240 - 105} y1={760} p={rampa(t, M.relaciones3 + 0.1 + k * 0.2, 0.3)} />)}
      <Cartel x={540} y={980} txt="identificar y documentar sus relaciones" p={rampa(t, M.identificar - 0.4, 0.35)} tam={40} fondo="#E3F6EC" />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Tipos de relación ═════ */
function Relacion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.02, x: 540, y: 960 }]);
  const OTRAS = [[M.ii, "inicio a inicio (SS)"], [M.ff, "final a final (FF)"], [M.fi, "inicio a final (SF) · poco usada"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="final a inicio (FS) · la más común" p={rampa(t, M.comun - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <Act x={260} y={450} w={330} p={rampa(t, M.final4 - 0.3, 0.35)} id="A2" ic="🛒" txt="comprar la tela" letra={30} />
      <Act x={820} y={450} w={330} p={rampa(t, M.coser4 - 0.3, 0.35)} id="A3" ic="🧵" txt="coser" letra={34} />
      <Fl x0={430} y0={450} x1={650} y1={450} p={rampa(t, M.termine - 0.3, 0.5)} color={COLOR.CORAL} g={12} />
      <Cartel x={260} y={590} txt="predecesora" p={rampa(t, M.predecesora - 0.4, 0.3)} tam={38} fondo="#DDE3FF" giro={-2} />
      <Cartel x={820} y={590} txt="sucesora" p={rampa(t, M.sucesora - 0.5, 0.3)} tam={38} fondo="#E3F6EC" giro={2} />
      {OTRAS.map(([tw, txt], k) => <Cartel key={k} x={540} y={760 + k * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={38} fondo={k === 2 ? "#F1ECE2" : CREMA} giro={[-1, 1, -1][k]} />)}
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={260} t={t} cara="feliz" semilla={3} />
      <Sombra x={910} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={910} y={1515} alto={260} t={t} cara={t > M.sucesora ? "feliz" : "tranquila"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 7–9 · Tipos de dependencia ═════ */
function Dependencias({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.02, x: 540, y: 960 }]);
  const D = [
    [M.obligatorias, "🔒", "obligatoria", "ley · contrato · naturaleza del trabajo", "#FFE1D8", M.ley],
    [M.discrecionales, "💡", "discrecional", "mejores prácticas; hay otros órdenes", "#FFF4DA", M.practicas],
    [M.externa, "🚚", "externa", "por lo general, fuera del control del equipo", "#DDE3FF", M.control9],
  ];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={220} txt="dependencias" p={rampa(t, S(7) - 0.3, 0.35)} tam={58} fondo={MANGO} />
      {D.map(([tw, ic, tit, sub, fondo, tw2], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 60, top: 330 + k * 230, width: 960, height: 200, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 30px", background: fondo, border: `7px solid ${TINTA}`, borderRadius: 26, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)}) rotate(${[-1, 1, -1][k]}deg)` }}>
            <span style={{ fontSize: 80 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 50 }}>{tit}</div>
              <div style={{ fontSize: 32, color: "#5B4A3E", marginTop: 8, opacity: rampa(t, tw2 - 0.3, 0.35) }}>{sub}</div>
            </div>
          </div>
        );
      })}
      <Cartel x={540} y={1080} txt="sin tela, no hay costura 🧵" p={rampa(t, M.costura - 0.6, 0.35) * (1 - rampa(t, S(8) - 0.3, 0.3))} tam={44} fondo={CREMA} giro={-2} />
      <Sombra x={220} y={1510} w={180} />
      <Mascota esp="hamster-gorra" x={220} y={1515} alto={280} t={t} cara="feliz" semilla={3} />
      <Sombra x={860} y={1510} w={170} />
      <Mascota esp="conejo" x={860} y={1515} alto={280} t={t} cara="feliz" bd={-50 * pulso(t, M.proveedor - 0.3, 1)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 10 · El diagrama de red ═════ */
function Red({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  const pN = (k) => rampa(t, M.diagrama - 0.3 + k * 0.18, 0.3);
  const pF = (k) => rampa(t, M.graficamente - 0.3 + k * 0.15, 0.3);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="diagrama de red del cronograma" p={rampa(t, M.diagrama - 0.4, 0.35)} tam={46} fondo={MANGO} />
      <div style={{ position: "absolute", left: 40, top: 330, width: 1000, height: 640, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, opacity: rampa(t, M.diagrama - 0.4, 0.3) }} />
      <Fl x0={235} y0={500} x1={345} y1={500} p={pF(0)} />
      <Fl x0={565} y0={500} x1={655} y1={500} p={pF(1)} />
      <Fl x0={790} y0={570} x1={790} y1={680} p={pF(2)} />
      <Act x={150} y={500} w={190} h={120} p={pN(0)} id="A1" ic="📏" txt="medir" letra={26} />
      <Act x={455} y={500} w={230} h={120} p={pN(1)} id="A2" ic="🛒" txt="comprar tela" letra={24} />
      <Act x={790} y={500} w={250} h={120} p={pN(2)} id="A3" ic="🧵" txt="coser" letra={30} />
      <Act x={790} y={800} w={280} h={120} p={pN(3)} id="A4" ic="🔧" txt="instalar" letra={30} />
      <Cartel x={540} y={1050} txt="cajas = actividades · flechas = relaciones" p={rampa(t, M.relaciones10 - 0.4, 0.35)} tam={36} fondo="#E3F6EC" />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={290} t={t} cara={t > M.relaciones10 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Ordena las tuyas ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ ordena y une con flechas" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Act key={k} x={200 + k * 340} y={520} w={200} h={120} p={rampa(t, M.ordena - 0.2 + k * 0.2, 0.3)} id={`A${k + 1}`} ic="❔" txt="" letra={40} />)}
      {[0, 1].map((k) => <Fl key={k} x0={300 + k * 340} y0={520} x1={440 + k * 340} y1={520} p={rampa(t, M.dibuja - 0.2 + k * 0.25, 0.3)} color={COLOR.CORAL} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.dibuja, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "secuenciar") return <Secuenciar t={t} />;
  if (p.tipo === "relacion") return <Relacion t={t} />;
  if (p.tipo === "dependencias") return <Dependencias t={t} />;
  if (p.tipo === "red") return <Red t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.coser1 - 0.3, "pop", 0.35); fx(M.tela1 - 0.7, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.secuenciar - 0.4, "pop", 0.3); fx(M.relaciones3 - 0.6, "desliza", 0.3); [0, 1, 2].forEach((k) => fx(M.relaciones3 + 0.1 + k * 0.2, "pop-suave", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.comun - 0.4, "pop", 0.3); fx(M.termine - 0.3, "tiza-larga", 0.3); fx(M.predecesora - 0.4, "pop-suave", 0.22); fx(M.sucesora - 0.5, "pop-suave", 0.22); [M.ii, M.ff, M.fi].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(7) - 0.3, "whoosh", 0.4); [M.obligatorias, M.discrecionales, M.externa].forEach((w) => fx(w - 0.4, "pop", 0.28));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.diagrama - 0.4, "papel", 0.3); [0, 1, 2, 3].forEach((k) => fx(M.graficamente - 0.3 + k * 0.15, "tiza", 0.18)); fx(M.relaciones10, "ding", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(secuenciar|relaciones|predecesora|sucesora|obligatorias|discrecionales|externa|diagrama|red)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP29 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp29-red.mp3" sinSonido={sinSonido} />
);
