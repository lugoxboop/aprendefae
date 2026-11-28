/*
 * Gestión de Proyectos · GP-30 «"Un rato" no es una duración» (gp30-duracion).
 * Una idea: Estimar la Duración de las Actividades es estimar la cantidad de períodos de trabajo
 * necesarios para finalizar las actividades individuales con los recursos estimados (6.4,
 * p. 195). Técnicas: análoga (datos de un proyecto similar), paramétrica (algoritmo con datos
 * históricos y parámetros), basada en tres valores (tO, tM, tP; triangular tE = (tO+tM+tP)/3)
 * y ascendente (descomponer y sumar cuando no se puede estimar con confianza) (6.4.2.2–6.4.2.5,
 * p. 200–202). Salidas: estimaciones de la duración (pueden indicar un rango) y base de las
 * estimaciones (cómo se obtuvo, supuestos, restricciones, rango, nivel de confianza, riesgos)
 * (6.4.3.1–6.4.3.2, p. 203–204).
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
  cuanto: W(1, "«¿Cuánto", 0.05), rato: W(1, "rato».", 0.95),
  planear: W(2, "planear.", 0.9),
  estimar: W(3, "Estimar", 0.05), periodos: W(3, "períodos", 0.5), recursos: W(3, "recursos", 0.9),
  parecido: W(4, "parecido:", 0.3), tres4: W(4, "tres", 0.6), analoga: W(4, "análoga.", 0.95),
  formula: W(5, "fórmula:", 0.15), cuatro5: W(5, "cuatro", 0.65), parametrica: W(5, "paramétrica.", 0.95),
  valores: W(6, "valores:", 0.15), optimista: W(6, "optimista,", 0.25), probable: W(6, "probable,", 0.5), pesimista: W(6, "pesimista,", 0.7), promedio: W(6, "promedio", 0.85),
  confianza7: W(7, "confianza,", 0.25), pedazos: W(7, "pedazos", 0.55), ascendente: W(7, "ascendente.", 0.95),
  resultado: W(8, "resultado", 0.1), rango8: W(8, "rango:", 0.6), uno: W(8, "uno.", 0.95),
  base: W(9, "base", 0.25), obtuvo: W(9, "obtuvo,", 0.45), supuestos: W(9, "supuestos,", 0.55), restricciones: W(9, "restricciones,", 0.65), rango9: W(9, "rango,", 0.75), confianza9: W(9, "confianza", 0.85), riesgos: W(9, "riesgos.", 0.95),
  salio: W(10, "salió", 0.8),
  toca: W(11, "toca:", 0.15), estima11: W(11, "estima", 0.3), valores11: W(11, "valores.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "estimar", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "tecnicas", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "base", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1 · «Un rato» ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={330} y={330} w={680} h={190} colaX={820} p={rampa(t, M.cuanto - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, textAlign: "center", padding: "0 20px" }}>«¿Cuánto tarda coser el toldo?»</div>
      </Dicho>
      <Dicho x={80} y={640} w={440} h={170} colaX={250} p={rampa(t, M.rato - 0.6, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: TINTA }}>«Un rato» 🤷</div>
      </Dicho>
      <Gigante x={800} y={760} txt="⏱️" p={rampa(t, M.rato - 0.3, 0.35)} tam={150} giro={10 * Math.sin(t * 4)} />
      <Sombra x={260} y={1510} w={210} />
      <Mascota esp="perro-corbatin" x={260} y={1515} alto={390} t={t} cara="feliz" semilla={9} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={370} t={t} cara={t > M.rato ? "triste" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · Estimar la duración ═════ */
function Estimar({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="🚫 así no se puede planear" p={rampa(t, M.planear - 0.6, 0.35) * (1 - rampa(t, S(3) - 0.3, 0.3))} tam={52} fondo={ROJO} color="#fff" giro={-2} />
      <Cartel x={540} y={300} txt="estimar la duración de las actividades" p={rampa(t, M.estimar - 0.4, 0.35)} tam={42} fondo={MANGO} />
      <Gigante x={540} y={560} txt="🗓️" p={rampa(t, M.periodos - 0.4, 0.35)} tam={180} giro={-6} />
      <Cartel x={540} y={760} txt="¿cuántos períodos de trabajo?" p={rampa(t, M.periodos - 0.3, 0.35)} tam={46} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={890} txt="👥 con los recursos estimados" p={rampa(t, M.recursos - 0.4, 0.35)} tam={42} fondo="#E3F6EC" giro={2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · Cuatro técnicas ═════ */
function Tecnicas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7), b: E(7), s: 1.02, x: 540, y: 960 }]);
  const TEC = [
    [M.parecido, "🏪", "análoga", "otra sede tardó 3 días", M.analoga, "#FFF4DA"],
    [M.formula, "🧮", "paramétrica", "8 m ÷ 2 m por día = 4 días", M.parametrica, "#DDE3FF"],
    [M.valores, "🔺", "basada en tres valores", "(2 + 3 + 7) ÷ 3 = 4 días · triangular", M.promedio, "#E3F6EC"],
    [M.confianza7, "🧩", "ascendente", "partir en pedazos y sumar", M.ascendente, "#FFE1D8"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {TEC.map(([tw, ic, tit, sub, tn, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 50, top: 200 + k * 225, width: 980, height: 200, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: fondo, border: `7px solid ${TINTA}`, borderRadius: 26, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)}) rotate(${[-1, 1, -1, 1][k]}deg)` }}>
            <span style={{ fontSize: 80 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 34, color: "#5B4A3E", opacity: rampa(t, tw + 0.3, 0.35) }}>{sub}</div>
              <div style={{ fontSize: 46, marginTop: 8, opacity: rampa(t, tn - 0.6, 0.35) }}>estimación {tit}</div>
            </div>
          </div>
        );
      })}
      <Sombra x={200} y={1530} w={160} />
      <Mascota esp="hamster-gorra" x={200} y={1535} alto={240} t={t} cara="feliz" bd={-40 * pulso(t, M.parecido - 0.3, 1)} semilla={3} />
      <Sombra x={880} y={1530} w={160} />
      <Mascota esp="perro-corbatin" x={880} y={1535} alto={240} t={t} cara={t > M.formula ? "feliz" : "tranquila"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · La estimación y su base ═════ */
function Base({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const B = [[M.obtuvo, "🧭 cómo se obtuvo"], [M.supuestos, "💭 supuestos"], [M.restricciones, "⛔ restricciones"], [M.rango9, "↔️ rango"], [M.confianza9, "👍 confianza"], [M.riesgos, "⚠️ riesgos"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={240} txt="estimación de la duración" p={rampa(t, M.resultado - 0.3, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={390} txt="⏱️ 4 días ± 1" p={rampa(t, M.rango8 - 0.3, 0.35)} tam={76} fondo="#E3F6EC" giro={-2} />
      <Cartel x={540} y={560} txt="📄 base de las estimaciones" p={rampa(t, M.base - 0.4, 0.35)} tam={48} fondo="#DDE3FF" />
      {B.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={700 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={40} fondo={CREMA} giro={[-2, 2, 1, -1, -2, 2][k]} />)}
      <Cartel x={540} y={1090} txt="✅ se sabe de dónde salió" p={rampa(t, M.salio - 0.5, 0.35)} tam={48} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Sombra x={540} y={1530} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara={t > M.salio - 0.4 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tus tres valores ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const V = ["😀 optimista: ___", "🙂 más probable: ___", "😟 pesimista: ___"];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={300} txt="⚡ estima con tres valores" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      {V.map((txt, k) => <Cartel key={k} x={540} y={460 + k * 130} txt={txt} p={rampa(t, M.estima11 - 0.2 + k * 0.25, 0.3)} tam={48} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.valores11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "estimar") return <Estimar t={t} />;
  if (p.tipo === "tecnicas") return <Tecnicas t={t} />;
  if (p.tipo === "base") return <Base t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cuanto - 0.3, "pop", 0.35); fx(M.rato - 0.6, "toc-grave", 0.3);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.planear - 0.6, "toc-grave", 0.3); fx(M.estimar - 0.4, "pop", 0.3); fx(M.periodos - 0.4, "pop-suave", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); [M.parecido, M.formula, M.valores, M.confianza7].forEach((w) => fx(w - 0.4, "pop", 0.26)); [M.analoga, M.parametrica, M.promedio, M.ascendente].forEach((w) => fx(w - 0.6, "ding", 0.2));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.rango8 - 0.3, "pop", 0.3); fx(M.base - 0.4, "papel", 0.3); [M.obtuvo, M.supuestos, M.restricciones, M.rango9, M.confianza9, M.riesgos].forEach((w) => fx(w - 0.35, "pop-suave", 0.2)); fx(M.salio - 0.5, "campana", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(duración|estimación|análoga|paramétrica|ascendente|optimista|probable|pesimista|rango|base)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP30 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp30-duracion-v2.mp3" sinSonido={sinSonido} />
);
