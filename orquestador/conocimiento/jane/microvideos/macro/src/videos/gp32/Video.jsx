/*
 * Gestión de Proyectos · GP-32 «¿Novecientos noventa y cinco o mil?» (gp32-costos).
 * Una idea: Planificar la Gestión de los Costos es definir cómo se han de estimar,
 * presupuestar, gestionar, monitorear y controlar los costos del proyecto (7.1, p. 235). El plan
 * de gestión de los costos es componente del plan para la dirección del proyecto y puede
 * establecer: unidades de medida (por recurso), nivel de precisión (redondeo de estimaciones,
 * p. ej. 995,59 → 1.000), nivel de exactitud (±10 %), enlaces con los procedimientos de la
 * organización (cuenta de control con código de la contabilidad), umbrales de control, reglas
 * para la medición del desempeño y formatos de los informes (7.1.3.1, p. 238–239).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  estima: W(1, "estima", 0.1), cincuenta: W(1, "cincuenta", 0.55), mil: W(1, "mil.", 0.75), razon: W(1, "razón?", 0.95),
  depende: W(2, "Depende:", 0.1), acordo: W(2, "acordó", 0.4),
  planificar3: W(3, "planificar", 0.15), estimar: W(3, "estimar,", 0.55), presupuestar: W(3, "presupuestar,", 0.65), gestionar: W(3, "gestionar,", 0.75), monitorear: W(3, "monitorear", 0.85), controlar: W(3, "controlar.", 0.95),
  plan4: W(4, "plan", 0.6),
  unidades: W(5, "unidades", 0.15), metros: W(5, "metros", 0.4), precision: W(5, "precisión:", 0.65), redondean: W(5, "redondean", 0.85),
  exactitud: W(6, "exactitud:", 0.3), diez: W(6, "diez", 0.8),
  umbrales: W(7, "umbrales", 0.15), medidas: W(7, "medidas.", 0.95),
  reglas: W(8, "reglas", 0.1), informes: W(8, "informes", 0.85),
  cuenta: W(9, "cuenta", 0.25), codigo: W(9, "código", 0.7), contabilidad: W(9, "contabilidad", 0.85),
  parte: W(10, "parte", 0.2), direccion10: W(10, "dirección", 0.7),
  toca: W(11, "toca:", 0.15), unidades11: W(11, "unidades", 0.4), redondeo: W(11, "redondeo", 0.55), costos11: W(11, "costos", 0.85),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "reglas", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "plan", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "carpeta", desde: S(10) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

function Hoja({ x, y, w, h, p, titulo, filas, t }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 100, background: AZUL, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 42, padding: "0 30px", textAlign: "center" }}>{titulo}</div>
      {filas.map(([tw, ic, tit, sub, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 24, right: 24, top: 120 + k * 152, height: 138, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", background: fondo, border: `5px solid ${TINTA}`, borderRadius: 20, transform: `scale(${rebote(q)})` }}>
            <span style={{ fontSize: 58 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 38 }}>{tit}</div>
              <div style={{ fontSize: 30, color: "#5B4A3E", marginTop: 6, opacity: rampa(t, tw + 0.5, 0.35) }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1 · ¿995,59 o 1.000? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={290} y={560} txt="$ 995,59" p={rampa(t, M.cincuenta - 0.8, 0.35)} tam={70} fondo={CREMA} giro={-4} />
      <Cartel x={800} y={560} txt="$ 1.000" p={rampa(t, M.mil - 0.3, 0.35)} tam={70} fondo="#DDE3FF" giro={4} />
      <Gigante x={545} y={760} txt="❓" p={rampa(t, M.razon - 0.6, 0.35)} tam={130} giro={8 * Math.sin(t * 4)} />
      <Cartel x={540} y={920} txt="¿quién tiene razón?" p={rampa(t, M.razon - 0.5, 0.35)} tam={54} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={260} y={1510} w={210} />
      <Mascota esp="perro-corbatin" x={260} y={1515} alto={380} t={t} cara="feliz" bd={-50 * pulso(t, M.estima - 0.3, 1)} semilla={9} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={370} t={t} cara="tranquila" bi={-50 * pulso(t, M.mil - 0.3, 1)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · Acordar cómo se manejan los costos ═════ */
function Reglas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  const en3 = rampa(t, S(3) - 0.4, 0.35);
  const V = [[M.estimar, "estimar"], [M.presupuestar, "presupuestar"], [M.gestionar, "gestionar"], [M.monitorear, "monitorear"], [M.controlar, "controlar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ opacity: 1 - en3 }}>
        <Cartel x={540} y={520} txt="🤷 depende" p={rampa(t, M.depende - 0.3, 0.35)} tam={70} fondo={CREMA} giro={-2} />
        <Cartel x={540} y={700} txt="nadie acordó las reglas" p={rampa(t, M.acordo - 0.4, 0.35)} tam={54} fondo={MANGO} giro={2} />
      </div>
      {en3 > 0 && (
        <div style={{ opacity: en3 }}>
          <Cartel x={540} y={280} txt="planificar la gestión de los costos" p={rampa(t, M.planificar3 - 0.4, 0.35)} tam={46} fondo={MANGO} />
          <Cartel x={540} y={420} txt="definir cómo se van a…" p={rampa(t, M.planificar3 + 0.6, 0.3)} tam={40} fondo={CREMA} />
          {V.map(([tw, txt], k) => <Cartel key={k} x={k < 3 ? 210 + k * 330 : 375 + (k - 3) * 330} y={k < 3 ? 570 : 700} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 2, -1, 2, -2][k]} />)}
          <Cartel x={540} y={860} txt="💲 los costos" p={rampa(t, M.controlar, 0.35)} tam={50} fondo="#E3F6EC" />
        </div>
      )}
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bi={-50 * pulso(t, M.acordo - 0.4, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–9 · El plan de gestión de los costos ═════ */
function Plan({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.unidades, "📏", "unidades de medida", "por recurso: metros, horas…", "#FFF4DA"],
    [M.precision, "🔢", "nivel de precisión", "redondeo: 995,59 → 1.000", "#DDE3FF"],
    [M.exactitud, "🎯", "nivel de exactitud", "rango aceptable: ± 10 %", "#E3F6EC"],
    [M.umbrales, "🚦", "umbrales de control", "cuánto desviarse antes de actuar", "#FFE1D8"],
    [M.reglas, "📊", "desempeño e informes", "reglas · formato · frecuencia", "#FFF4DA"],
    [M.cuenta, "🏷️", "cuenta de control", "código único de la contabilidad", "#DDE3FF"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={170} w={990} h={1060} p={rampa(t, M.plan4 - 0.4, 0.4)} titulo="plan de gestión de los costos" filas={FIL} t={t} />
      <Sombra x={200} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={250} t={t} cara={t > M.precision ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={880} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={880} y={1515} alto={250} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 10 · Parte del plan para la dirección ═════ */
function EnCarpeta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={300} w={760} h={620} p={rampa(t, M.parte - 0.4, 0.4)}>
        <Documento x={380} y={380} w={260} p={rampa(t, M.direccion10 - 0.2, 0.4)} titulo="gestión de los costos" letra={32} giro={-3} />
      </Carpeta>
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tus unidades y tu redondeo ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ tu turno" p={rampa(t, M.toca - 0.2, 0.35)} tam={64} fondo={MANGO} />
      <Cartel x={540} y={500} txt="📏 unidades: ________" p={rampa(t, M.unidades11 - 0.3, 0.3)} tam={50} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="🔢 redondeo: ________" p={rampa(t, M.redondeo - 0.3, 0.3)} tam={50} fondo={CREMA} giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.costos11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "reglas") return <Reglas t={t} />;
  if (p.tipo === "plan") return <Plan t={t} />;
  if (p.tipo === "carpeta") return <EnCarpeta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cincuenta - 0.8, "pop", 0.3); fx(M.mil - 0.3, "pop", 0.3); fx(M.razon - 0.5, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.depende - 0.3, "pop", 0.3);
fx(M.planificar3 - 0.4, "pop", 0.3); [M.estimar, M.presupuestar, M.gestionar, M.monitorear, M.controlar].forEach((w) => fx(w - 0.3, "pop-suave", 0.18)); fx(M.controlar, "monedas", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.plan4 - 0.4, "papel", 0.35); [M.unidades, M.precision, M.exactitud, M.umbrales, M.reglas, M.cuenta].forEach((w) => fx(w - 0.4, "pop", 0.24));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.parte - 0.4, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg"];
const CLAVE = /^(costos|plan|unidades|precisión|exactitud|umbrales|desempeño|informes|cuenta|redondeo)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP32 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp32-costos.mp3" sinSonido={sinSonido} />
);
