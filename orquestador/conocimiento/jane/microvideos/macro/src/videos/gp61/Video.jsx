/*
 * Gestión de Proyectos · GP-61 «Lo que vale lo hecho» (gp61-controlar-costos).
 * Una idea: Controlar los Costos es monitorear el estado del proyecto para actualizar los costos y gestionar
 * cambios a la línea base de costos (7.4, p. 257). Análisis del valor ganado: valor planificado (presupuesto
 * autorizado asignado al trabajo programado), valor ganado (trabajo completado expresado en presupuesto) y
 * costo real (7.4.2.2, p. 261); variación del costo = valor ganado − costo real; variación del cronograma =
 * valor ganado − valor planificado; índice de desempeño del costo = valor ganado ÷ costo real, menor que 1 indica
 * un costo superior al planificado (p. 262–263). Ejemplo: 10 puestos × 100; planificado 600, ganado 500, real 650.
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Controlar los costos es monitorear el estado del proyecto", "para actualizar sus costos y gestionar cambios a la línea base de costos."],
    8: ["Variación del costo: valor ganado menos costo real.", "Menos ciento cincuenta: se pasó del presupuesto."],
    10: ["Y el índice de desempeño del costo, valor ganado entre costo real,", "da menos de uno: el trabajo cuesta más de lo planificado."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B", AZULB = "#5B8DEF";

const M = {
  diez: W(1, "diez", 0.15), cien: W(1, "cien", 0.85),
  seis: W(2, "seis.", 0.3), cinco: W(2, "cinco,", 0.45), gasto: W(2, "gastó", 0.65),
  controlar: W(3, "Controlar", 0.03), monitorear: W(3, "monitorear", 0.25), actualizar: W(3, "actualizar", 0.55), gestionar: W(3, "gestionar", 0.7),
  ganado4: W(4, "ganado.", 0.6), tres: W(4, "tres", 0.85),
  planificado5: W(5, "planificado:", 0.15), seiscientos5: W(5, "Seiscientos.", 0.95),
  ganado6: W(6, "ganado:", 0.15), quinientos: W(6, "Quinientos.", 0.95),
  costo7: W(7, "Costo", 0.05), cincuenta7: W(7, "cincuenta.", 0.95),
  variacion8: W(8, "Variación", 0.05), menos8: W(8, "Menos", 0.55, 1), paso: W(8, "pasó", 0.8),
  variacion9: W(9, "Variación", 0.05), menos9: W(9, "Menos", 0.7, 1), atrasada: W(9, "atrasada.", 0.97),
  indice: W(10, "índice", 0.1), uno: W(10, "uno:", 0.6), cuesta: W(10, "cuesta", 0.8),
  toca: W(11, "toca:", 0.15), presupuesto11: W(11, "presupuesto.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "barras", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "formulas", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Diez puestos ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pP = rampa(t, M.diez - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      {Array.from({ length: 10 }).map((_, k) => {
        const x = 150 + (k % 5) * 195, y = 300 + Math.floor(k / 5) * 200;
        const q = rampa(t, M.diez - 0.4 + k * 0.06, 0.3);
        const lista = k < 5 && t > M.cinco - 0.3 + k * 0.08;
        const debia = k === 5 && t > M.seis - 0.3;
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: x - 80, top: y - 80, width: 160, height: 160, background: lista ? "#E3F6EC" : debia ? "#FFE1D8" : "#FFFDF7", border: `6px ${debia ? "dashed" : "solid"} ${TINTA}`, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, transform: `scale(${rebote(q)})` }}>
            {lista ? "🎀" : "⛺"}
          </div>
        );
      })}
      <Cartel x={540} y={140} txt="⛺ 10 puestos · $100 cada uno" p={rampa(t, M.cien - 0.4, 0.3)} tam={42} fondo={MANGO} giro={-1} />
      <Cartel x={190} y={650} txt="📅 debía: 6" p={rampa(t, M.seis - 0.3, 0.3)} tam={34} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="🎀 lleva: 5" p={rampa(t, M.cinco - 0.3, 0.3)} tam={34} fondo="#E3F6EC" giro={1} />
      <Cartel x={880} y={650} txt="💸 gastó: $650" p={rampa(t, M.gasto - 0.3, 0.3)} tam={34} fondo="#FFE1D8" giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.gasto ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="controlar los costos" p={rampa(t, M.controlar - 0.3, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={320} txt="👀 monitorear el estado del proyecto" p={rampa(t, M.monitorear - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={415} txt="💲 actualizar sus costos" p={rampa(t, M.actualizar - 0.3, 0.3)} tam={36} fondo="#FFFDF7" giro={1} />
      <Cartel x={540} y={510} txt="📏 gestionar cambios a la línea base de costos" p={rampa(t, M.gestionar - 0.3, 0.3)} tam={33} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={680} txt="📈 análisis del valor ganado" p={rampa(t, M.ganado4 - 0.5, 0.3)} tam={46} fondo="#E3F6EC" />
      {[0, 1, 2].map((k) => <Gigante key={k} x={400 + k * 140} y={830} txt={["🔵", "🟢", "🔴"][k]} p={rampa(t, M.tres - 0.2 + k * 0.15, 0.3)} tam={80} />)}
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={270} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–7 · Las tres medidas ═════ */
const BARRAS = [["planificado5", "valor planificado", "trabajo programado", 600, AZULB, "seiscientos5"], ["ganado6", "valor ganado", "trabajo completado", 500, VERDE, "quinientos"], ["costo7", "costo real", "lo que se gastó", 650, ROJO, "cincuenta7"]];
function Barras({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const BASE = 900;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ position: "absolute", left: 90, top: BASE, width: 900, height: 10, background: TINTA, borderRadius: 5 }} />
      {BARRAS.map(([k1, nom, sub, v, col, k2], k) => {
        const q = sale(rampa(t, M[k1] - 0.3, 0.6));
        if (q <= 0) return null;
        const h = v * 0.85 * q, x = 230 + k * 310;
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: x - 95, top: BASE - h, width: 190, height: h, background: col, border: `6px solid ${TINTA}`, borderRadius: 14 }} />
            <Cartel x={x} y={BASE - h - 60} txt={`$${v}`} p={rampa(t, M[k2] - 0.5, 0.3)} tam={46} fondo="#FFFDF7" />
            <Cartel x={x} y={BASE + 70} txt={nom} p={q} tam={27} fondo={CREMA} />
            <Cartel x={x} y={BASE + 150} txt={sub} p={rampa(t, M[k1] + 0.5, 0.3)} tam={23} fondo="#FFFDF7" giro={[-2, 1, 2][k]} />
          </div>
        );
      })}
      <Sombra x={540} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1545} alto={230} t={t} cara={t > M.cincuenta7 ? "tranquila" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · Las cuentas ═════ */
function Fila({ y, p, titulo, cuenta, res, nota, pR, color }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, top: y, width: 960, height: 270, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 12px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(p)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 30, top: 18, fontSize: 38 }}>{titulo}</div>
      <div style={{ position: "absolute", left: 30, top: 80, fontSize: 36, color: "#5B4A3E" }}>{cuenta}</div>
      {pR > 0 && <div style={{ position: "absolute", left: 30, top: 150, fontSize: 52, color, transform: `scale(${rebote(pR)})`, transformOrigin: "0 50%" }}>{res}</div>}
      {pR > 0 && <div style={{ position: "absolute", right: 30, top: 165, fontSize: 34, padding: "8px 18px", background: "#FFE1D8", border: `5px solid ${TINTA}`, borderRadius: 16, opacity: pR }}>{nota}</div>}
    </div>
  );
}
function Formulas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Fila y={120} p={rampa(t, M.variacion8 - 0.4, 0.4)} titulo="💲 variación del costo" cuenta="valor ganado − costo real = 500 − 650" res="−150" nota="se pasó del presupuesto" pR={rampa(t, M.menos8 - 0.3, 0.3)} color={ROJO} />
      <Fila y={430} p={rampa(t, M.variacion9 - 0.4, 0.4)} titulo="📅 variación del cronograma" cuenta="valor ganado − valor planificado = 500 − 600" res="−100" nota="va atrasada" pR={rampa(t, M.menos9 - 0.3, 0.3)} color={ROJO} />
      <Fila y={740} p={rampa(t, M.indice - 0.4, 0.4)} titulo="📊 índice de desempeño del costo" cuenta="valor ganado ÷ costo real = 500 ÷ 650" res="0,77 < 1" nota="cuesta más de lo planificado" pR={rampa(t, M.uno - 0.3, 0.3)} color={ROJO} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.menos8 ? "triste" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tus números ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tus números" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {["🔵 planificado: $____", "🟢 ganado: $____", "🔴 real: $____"].map((txt, k) => <Cartel key={k} x={540} y={410 + k * 115} txt={txt} p={rampa(t, M.toca + 0.3 + k * 0.3, 0.3)} tam={42} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.presupuesto11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "barras") return <Barras t={t} />;
  if (p.tipo === "formulas") return <Formulas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.diez - 0.4, "pop", 0.25); fx(M.cien - 0.4, "pop", 0.22); fx(M.seis - 0.3, "pop-suave", 0.2); fx(M.cinco - 0.3, "pop-suave", 0.2); fx(M.gasto - 0.3, "baja", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.monitorear, M.actualizar, M.gestionar].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.ganado4 - 0.5, "ding", 0.22);
fx(S(5) - 0.3, "whoosh", 0.4); [M.planificado5, M.ganado6, M.costo7].forEach((w) => fx(w - 0.3, "desliza", 0.22)); [M.seiscientos5, M.quinientos, M.cincuenta7].forEach((w) => fx(w - 0.5, "pop", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); [M.variacion8, M.variacion9, M.indice].forEach((w) => fx(w - 0.4, "papel", 0.22)); [M.menos8, M.menos9, M.uno].forEach((w) => fx(w - 0.3, "baja", 0.22));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(costos|planificado|ganado|real|variación|índice|presupuesto|atrasada)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP61 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp61-controlar-costos.mp3" sinSonido={sinSonido} />
);
