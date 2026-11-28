/*
 * Gestión de Proyectos · GP-62 «Antes de entregar, revisar» (gp62-controlar-calidad).
 * Una idea: Controlar la Calidad es monitorear y registrar los resultados de la ejecución de las actividades de
 * gestión de calidad para evaluar el desempeño y asegurar que las salidas sean completas, correctas y satisfagan
 * las expectativas del cliente; verifica que los entregables cumplen los requisitos para la aceptación final
 * (8.3, p. 298). Hojas de verificación y muestreo estadístico (8.3.2.1); análisis de causa raíz (8.3.2.2);
 * inspección contra estándares documentados (8.3.2.3); mediciones de control de calidad y entregables
 * verificados, entrada de Validar el Alcance (8.3.3.1–8.3.3.2, p. 305).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Horno, Pan, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Controlar la calidad es monitorear y registrar", "los resultados de las actividades de gestión de calidad,", "para que las salidas sean completas, correctas", "y satisfagan las expectativas del cliente."],
    10: ["Los resultados quedan como mediciones de control de calidad,", "y lo que cumple se vuelve entregable verificado, listo para validar el alcance."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B";

const M = {
  lote: W(1, "lote", 0.2), empacarlos: W(1, "empacarlos", 0.85),
  detiene: W(2, "detiene:", 0.3), quemados2: W(2, "quemados?", 0.9),
  controlar: W(3, "Controlar", 0.03), registrar: W(3, "registrar", 0.2), completas: W(3, "completas,", 0.65), correctas: W(3, "correctas", 0.72), expectativas: W(3, "expectativas", 0.9),
  requisitos4: W(4, "requisitos,", 0.55), final4: W(4, "final.", 0.95),
  hoja5: W(5, "hoja", 0.3), defecto5: W(5, "defecto.", 0.95),
  muestreo: W(6, "muestreo", 0.2), parte: W(6, "parte", 0.8),
  inspeccion: W(7, "inspección:", 0.15), estandares: W(7, "estándares", 0.85),
  veinte: W(8, "veinte", 0.25), quemados8: W(8, "quemados,", 0.75), crudo: W(8, "crudo.", 0.95),
  causa9: W(9, "causa", 0.2), origen: W(9, "origen:", 0.55), horno9: W(9, "horno", 0.7), mas: W(9, "más.", 0.97),
  mediciones: W(10, "mediciones", 0.25), verificado: W(10, "verificado,", 0.75), validar10: W(10, "validar", 0.9),
  toca: W(11, "toca:", 0.15), hoja11: W(11, "hoja", 0.35), tres: W(11, "tres", 0.6),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "hoja", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "causa", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · El primer lote ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      {Array.from({ length: 8 }).map((_, k) => {
        const q = rampa(t, M.lote - 0.4 + k * 0.08, 0.3);
        if (q <= 0) return null;
        return <div key={k} style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - sale(q)) * -300}px)`, opacity: Math.min(1, q * 3) }}><Pan x={200 + (k % 4) * 225} y={560 + Math.floor(k / 4) * 170} w={190} giro={[-8, 5, -3, 9, 4, -6, 8, -2][k]} /></div>;
      })}
      <Cartel x={540} y={330} txt="🍞 primer lote" p={rampa(t, M.lote - 0.3, 0.3)} tam={48} fondo={MANGO} giro={-2} />
      <Dicho x={500} y={830} w={480} h={140} p={rampa(t, M.empacarlos - 0.5, 0.3)} colaX={800}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 42, color: TINTA }}>📦 ¡a empacar!</div>
      </Dicho>
      <Dicho x={40} y={950} w={600} h={140} p={rampa(t, M.detiene - 0.3, 0.3)} colaX={260}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA }}>✋ ¿y si vienen quemados?</div>
      </Dicho>
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.detiene ? "tranquila" : "feliz"} bi={-50 * pulso(t, M.detiene, 1.0)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={360} t={t} cara="feliz" salto={25 * pulso(t, M.empacarlos, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.completas, "🧩 completas"], [M.correctas, "✔️ correctas"], [M.expectativas, "😊 satisfacen expectativas"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={180} txt="controlar la calidad" p={rampa(t, M.controlar - 0.3, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={310} txt="📝 monitorear y registrar los resultados" p={rampa(t, M.registrar - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={420} txt="📦 las salidas deben ser…" p={rampa(t, M.completas - 0.6, 0.3)} tam={36} fondo="#FFFDF7" giro={1} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={k === 2 ? 540 : [300, 780][k]} y={k === 2 ? 640 : 530} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo="#E3F6EC" giro={[-2, 2, -1][k]} />)}
      <Cartel x={540} y={800} txt="✅ ¿cumple los requisitos?" p={rampa(t, M.requisitos4 - 0.4, 0.3)} tam={40} fondo="#DDE3FF" />
      <Cartel x={540} y={900} txt="antes de la aceptación final" p={rampa(t, M.final4 - 0.5, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 5–8 · Hoja, muestreo, inspección ═════ */
const DEF = [["🔥 quemado", 3, "quemados8"], ["🥟 crudo", 1, "crudo"], ["🥨 deforme", 0, "crudo"]];
function Hoja({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const pH = rampa(t, M.hoja5 - 0.4, 0.4);
  const pM = rampa(t, M.muestreo - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      {pH > 0 && (
        <div style={{ position: "absolute", left: 80, top: 130, width: 560, height: 420, background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 12px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(pH)})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: AZUL, color: "#fff", borderRadius: "16px 16px 0 0", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>📋 hoja de verificación</div>
          {DEF.map(([nom, n, kw], k) => (
            <div key={k} style={{ position: "absolute", left: 26, right: 26, top: 115 + k * 98, height: 80, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 36, borderBottom: k < 2 ? "4px dashed #D9D2C3" : "none" }}>
              <span>{nom}</span>
              <span style={{ color: ROJO, fontSize: 46, letterSpacing: 4 }}>{"|".repeat(Math.round(n * rampa(t, M[kw] - 0.6, 0.5)))}</span>
            </div>
          ))}
        </div>
      )}
      <Cartel x={850} y={230} txt="🔢 cuántas veces" p={rampa(t, M.defecto5 - 0.6, 0.3)} tam={32} fondo={CREMA} giro={3} />
      <Cartel x={850} y={330} txt="aparece cada defecto" p={rampa(t, M.defecto5 - 0.3, 0.3)} tam={28} fondo="#FFFDF7" giro={-2} />
      <Cartel x={540} y={640} txt="🎲 muestreo estadístico" p={pM} tam={42} fondo={MANGO} giro={-1} />
      {pM > 0 && Array.from({ length: 20 }).map((_, k) => {
        const sel = [1, 4, 7, 10, 13, 16, 19].includes(k);
        const q = rampa(t, M.parte - 0.3, 0.3);
        return <div key={k} style={{ position: "absolute", left: 105 + (k % 10) * 88, top: 720 + Math.floor(k / 10) * 90, width: 70, height: 70, borderRadius: "50%", fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", background: sel && q > 0 ? "#FFF3C4" : "transparent", border: sel && q > 0 ? `5px solid ${TINTA}` : "5px solid transparent", opacity: pM, transform: `scale(${sel ? 1 + 0.15 * q : 1})` }}>🍞</div>;
      })}
      <Cartel x={540} y={960} txt="una parte, no todo" p={rampa(t, M.parte - 0.2, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      <Cartel x={300} y={1080} txt="🔍 inspección" p={rampa(t, M.inspeccion - 0.3, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={760} y={1080} txt="📘 estándares documentados" p={rampa(t, M.estandares - 0.4, 0.3)} tam={30} fondo="#DDE3FF" giro={2} />
      <Cartel x={540} y={1180} txt="🎲 20 panes al azar" p={rampa(t, M.veinte - 0.3, 0.3)} tam={38} fondo="#FFE1D8" giro={-1} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara={t > M.quemados8 ? "tranquila" : "feliz"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · La causa raíz y lo que sale ═════ */
function Causa({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const pV = rampa(t, M.mediciones - 0.5, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.3}>
      {pV <= 0 && (
        <>
          <Cartel x={540} y={190} txt="🌳 análisis de causa raíz" p={rampa(t, M.causa9 - 0.3, 0.35)} tam={46} fondo={MANGO} />
          <Cartel x={540} y={320} txt="🔥 panes quemados" p={rampa(t, M.causa9, 0.3)} tam={38} fondo="#FFE1D8" giro={-1} />
          <Gigante x={540} y={420} txt="⬇️" p={rampa(t, M.origen - 0.5, 0.3)} tam={60} />
          <Cartel x={540} y={510} txt="¿por qué? ¿cuál es el origen?" p={rampa(t, M.origen - 0.4, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
          <Horno x={540} y={980} w={300} brillo={0.6 + 0.4 * Math.sin(t * 6) * rampa(t, M.horno9, 0.3)} />
          <Cartel x={540} y={1060} txt="🌡️ calienta de más" p={rampa(t, M.mas - 0.6, 0.3)} tam={42} fondo="#FFE1D8" color={ROJO} giro={-2} />
        </>
      )}
      {pV > 0 && (
        <>
          <Documento x={300} y={470} w={300} p={pV} titulo="mediciones de control de calidad" letra={32} giro={-3} />
          <Cartel x={780} y={330} txt="✅ entregable verificado" p={rampa(t, M.verificado - 0.4, 0.3)} tam={36} fondo="#E3F6EC" giro={2} />
          <Gigante x={780} y={470} txt="⬇️" p={rampa(t, M.validar10 - 0.6, 0.3)} tam={60} />
          <Cartel x={780} y={600} txt="validar el alcance" p={rampa(t, M.validar10 - 0.4, 0.3)} tam={38} fondo={MANGO} giro={-1} />
        </>
      )}
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.mas ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu hoja ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu hoja de verificación" p={rampa(t, M.toca - 0.2, 0.35)} tam={52} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={410 + k * 115} txt={`defecto ${k + 1}: ________  |||`} p={rampa(t, M.tres - 0.2 + k * 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.tres + 1.2, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "hoja") return <Hoja t={t} />;
  if (p.tipo === "causa") return <Causa t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[0, 2, 4, 6].forEach((k) => fx(M.lote - 0.4 + k * 0.08, "pop-suave", 0.15)); fx(M.empacarlos - 0.5, "burbuja", 0.25); fx(M.detiene - 0.3, "golpe", 0.2);
fx(S(3) - 0.3, "whoosh", 0.4); [M.registrar, M.completas, M.correctas, M.expectativas, M.requisitos4].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.hoja5 - 0.4, "papel", 0.25); fx(M.muestreo - 0.3, "pop", 0.22); fx(M.parte - 0.3, "ding", 0.18); fx(M.inspeccion - 0.3, "pop", 0.22); fx(M.veinte - 0.3, "pop-suave", 0.2); fx(M.quemados8 - 0.6, "firma", 0.2); fx(M.crudo - 0.6, "firma", 0.2);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.origen - 0.4, "pop", 0.2); fx(M.mas - 0.6, "bocina", 0.2); fx(M.mediciones - 0.5, "papel", 0.25); fx(M.verificado - 0.4, "ding", 0.22);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(calidad|verificación:|verificación|muestreo|inspección:|estándares|causa|origen:|mediciones|verificado,|requisitos,)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP62 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp62-controlar-calidad.mp3" sinSonido={sinSonido} />
);
