/*
 * Gestión de Proyectos · GP-57 «¿Quién decide el cambio?» (gp57-control-cambios).
 * Una idea: Realizar el Control Integrado de Cambios es revisar todas las solicitudes de cambio, aprobar y
 * gestionar cambios, y comunicar las decisiones (4.6, p. 113). Con líneas base definidas, los cambios pasan por
 * este proceso; los cambios verbales se registran por escrito; el comité de control de cambios revisa, evalúa,
 * aprueba, aplaza o rechaza (4.6, p. 115); impacto en tiempo, costo, recursos o riesgos (4.6.2.5, p. 120);
 * análisis costo-beneficio (4.6.2.3); aprobadas → Dirigir y Gestionar el Trabajo; aplazadas o rechazadas se
 * comunican a quien las pidió; registro de cambios (4.6.3.1, 4.6.3.3, p. 120).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Horno, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import { Hoja } from "../gp/hoja.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: {
    3: ["Realizar el control integrado de cambios", "es revisar todas las solicitudes de cambio,", "aprobar y gestionar los cambios,", "y comunicar las decisiones."],
    6: ["Si hace falta, decide un comité de control de cambios:", "revisa y evalúa, y luego aprueba, aplaza o rechaza."],
    7: ["Casi todo cambio impacta el tiempo, el costo, los recursos o los riesgos.", "Evaluar ese impacto es clave."],
    9: ["Los cambios aprobados se implementan al dirigir y gestionar el trabajo del proyecto.", "Los aplazados o rechazados se comunican a quien los pidió."],
    11: ["Ahora te toca: piensa en un cambio para tu proyecto", "y decide si lo apruebas, lo aplazas o lo rechazas."],
  },
});
const { S, E, W } = T;
const VERDE = "#2FB36B", AMARILLO = "#F5C431";

const M = {
  ramon1: W(1, "Ramón", 0.05), grande: W(1, "grande.", 0.7), hoy: W(1, "Hoy", 0.85),
  asi: W(2, "así,", 0.5),
  realizar: W(3, "Realizar", 0.03), revisar: W(3, "revisar", 0.35), aprobar: W(3, "aprobar", 0.6), comunicar: W(3, "comunicar", 0.85),
  lineas: W(4, "líneas", 0.3), todo4: W(4, "todo", 0.65),
  palabra: W(5, "palabra,", 0.3), escrito: W(5, "escrito.", 0.95),
  comite: W(6, "comité", 0.3), revisa6: W(6, "revisa", 0.55), aprueba: W(6, "aprueba,", 0.78), aplaza: W(6, "aplaza", 0.88), rechaza: W(6, "rechaza.", 0.97),
  tiempo7: W(7, "tiempo,", 0.3), costo7: W(7, "costo,", 0.4), recursos7: W(7, "recursos", 0.5), riesgos7: W(7, "riesgos.", 0.62), impacto7: W(7, "impacto", 0.85),
  compara: W(8, "compara", 0.3), costo8: W(8, "costo", 0.4), beneficio: W(8, "beneficio", 0.55), aprueba8: W(8, "aprueba.", 0.95),
  aprobados9: W(9, "aprobados", 0.1), dirigir: W(9, "dirigir", 0.35), aplazados: W(9, "aplazados", 0.65), pidio: W(9, "pidió.", 0.97),
  estado10: W(10, "estado", 0.2), registro10: W(10, "registro", 0.8),
  toca: W(11, "toca:", 0.1), cambio11: W(11, "cambio", 0.3), apruebas: W(11, "apruebas,", 0.7), aplazas: W(11, "aplazas", 0.82), rechazas: W(11, "rechazas.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "comite", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "salidas", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · El horno grande, ¡hoy! ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  const pG = sale(rampa(t, M.grande - 0.5, 0.6));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Horno x={330} y={900} w={lerp(230, 230, pG)} brillo={0.4} />
      {pG > 0 && <div style={{ opacity: Math.min(1, pG * 2) }}><Horno x={720} y={900} w={lerp(150, 360, pG)} brillo={0.8} /></div>}
      {pG > 0.5 && <Gigante x={530} y={760} txt="➡️" p={rampa(t, M.grande, 0.3)} tam={80} />}
      <Dicho x={480} y={150} w={520} h={170} p={rampa(t, M.hoy - 0.3, 0.3)} colaX={800}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>¡hoy mismo! 🔥</div>
      </Dicho>
      <Cartel x={540} y={1090} txt="🤔 ¿así, sin más?" p={rampa(t, M.asi - 0.4, 0.3)} tam={46} fondo="#FFE1D8" giro={-2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.asi - 0.4 ? "tranquila" : "feliz"} semilla={3} />
      <Sombra x={800} y={1510} w={220} />
      <Mascota esp="perro-corbatin" x={800} y={1515} alto={370} t={t} cara="feliz" salto={30 * pulso(t, M.hoy, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–5 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(5) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.revisar, "📥 revisar todas las solicitudes de cambio"], [M.aprobar, "✅ aprobar y gestionar los cambios"], [M.comunicar, "📣 comunicar las decisiones"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="realizar el control integrado de cambios" p={rampa(t, M.realizar - 0.3, 0.35)} tam={38} fondo={MANGO} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={290 + k * 100} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Cartel x={540} y={640} txt="📏 líneas base definidas" p={rampa(t, M.lineas - 0.3, 0.3)} tam={38} fondo="#DDE3FF" giro={-2} />
      <Cartel x={540} y={740} txt="➡️ todo cambio pasa por aquí" p={rampa(t, M.todo4 - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={1} />
      <Dicho x={90} y={830} w={420} h={130} p={rampa(t, M.palabra - 0.4, 0.3)} colaX={220}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA }}>🗣️ «¿y si…?»</div>
      </Dicho>
      <Documento x={800} y={950} w={240} p={rampa(t, M.escrito - 0.6, 0.4)} titulo="solicitud de cambio" letra={30} giro={3} />
      <Cartel x={800} y={1150} txt="✍️ por escrito" p={rampa(t, M.escrito - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Sombra x={220} y={1530} w={180} />
      <Mascota esp="perro-corbatin" x={220} y={1535} alto={280} t={t} cara="feliz" semilla={9} />
      <Sombra x={540} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={260} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 6–8 · El comité ═════ */
function Comite({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const D = [[M.aprueba, "✅ aprueba", "#E3F6EC"], [M.aplaza, "⏸️ aplaza", "#FFF3C4"], [M.rechaza, "❌ rechaza", "#FFE1D8"]];
  const I = [[M.tiempo7, "⏱️ tiempo", 200, 560], [M.costo7, "💲 costo", 880, 560], [M.recursos7, "🧰 recursos", 220, 700], [M.riesgos7, "⚠️ riesgos", 860, 700]];
  const pI = rampa(t, M.tiempo7 - 0.3, 0.3);
  const pB = rampa(t, M.compara - 0.4, 0.4);
  const inc = lerp(0, 8, sale(rampa(t, M.beneficio, 0.6)));
  const pS = rampa(t, M.aprueba8 - 0.2, 0.3);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={170} txt="👥 comité de control de cambios" p={rampa(t, M.comite - 0.3, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={540} y={290} txt="🔍 revisa y evalúa" p={rampa(t, M.revisa6 - 0.3, 0.3)} tam={38} fondo={CREMA} />
      {pB <= 0 && D.map(([tw, txt, fondo], k) => <Cartel key={k} x={200 + k * 340} y={410} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={40} fondo={fondo} giro={[-2, 1, 2][k]} />)}
      {pB <= 0 && pI > 0 && <Gigante x={540} y={640} txt="💥" p={pI} tam={120} />}
      {pB <= 0 && I.map(([tw, txt, x, y], k) => <Cartel key={k} x={x} y={y} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={[-3, 2, 2, -3][k]} />)}
      {pB <= 0 && <Cartel x={540} y={840} txt="📐 evaluar el impacto" p={rampa(t, M.impacto7 - 0.3, 0.3)} tam={40} fondo="#DDE3FF" />}
      {pB > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: Math.min(1, pB * 2) }}>
          <div style={{ position: "absolute", left: 532, top: 470, width: 16, height: 330, background: TINTA, borderRadius: 8 }} />
          <div style={{ position: "absolute", left: 440, top: 790, width: 200, height: 26, background: TINTA, borderRadius: 13 }} />
          <div style={{ position: "absolute", left: 190, top: 470, width: 700, height: 14, background: TINTA, borderRadius: 7, transform: `rotate(${inc}deg)` }} />
          <Cartel x={250} y={420 - inc * 5} txt="💲 costo" p={rampa(t, M.costo8 - 0.3, 0.3)} tam={44} fondo="#FFE1D8" />
          <Cartel x={830} y={420 + inc * 5} txt="📈 beneficio" p={rampa(t, M.beneficio - 0.3, 0.3)} tam={44} fondo="#E3F6EC" />
          <Documento x={540} y={1040} w={230} p={rampa(t, M.compara - 0.3, 0.4)} titulo="horno grande" letra={34} giro={-2} />
          {pS > 0 && <Cartel x={560} y={1090} txt="APROBADO" p={pS} tam={46} fondo="#E3F6EC" color={VERDE} borde={8} giro={-14} />}
        </div>
      )}
      <Sombra x={170} y={1540} w={150} />
      <Mascota esp="gato-gafas" x={170} y={1545} alto={230} t={t} cara="tranquila" semilla={7} />
      <Sombra x={540} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={540} y={1545} alto={230} t={t} cara={t > M.aprueba8 ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={910} y={1540} w={150} />
      <Mascota esp="perro-mochila" x={910} y={1545} alto={240} t={t} cara="feliz" semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Qué pasa después ═════ */
function Salidas({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.02, x: 540, y: 960 }]);
  const pR = rampa(t, M.estado10 - 0.6, 0.4);
  const filas = [
    [M.estado10, "🔥", "horno grande", "aprobada", "#E3F6EC"],
    [M.estado10 + 0.5, "🎨", "pintar la vitrina", "aplazada", "#FFF3C4"],
    [M.estado10 + 1.0, "🎵", "música a todo volumen", "rechazada", "#FFE1D8"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {pR <= 0 && (
        <>
          <Cartel x={540} y={200} txt="✅ aprobadas" p={rampa(t, M.aprobados9 - 0.3, 0.3)} tam={46} fondo="#E3F6EC" />
          <Gigante x={540} y={330} txt="⬇️" p={rampa(t, M.dirigir - 0.5, 0.3)} tam={70} />
          <Cartel x={540} y={450} txt="🛠️ dirigir y gestionar el trabajo del proyecto" p={rampa(t, M.dirigir - 0.3, 0.3)} tam={34} fondo={CREMA} />
          <Cartel x={540} y={620} txt="⏸️ aplazadas  ·  ❌ rechazadas" p={rampa(t, M.aplazados - 0.3, 0.3)} tam={42} fondo="#FFE1D8" />
          <Gigante x={540} y={750} txt="⬇️" p={rampa(t, M.pidio - 0.7, 0.3)} tam={70} />
          <Cartel x={540} y={870} txt="📣 se comunican a quien las pidió" p={rampa(t, M.pidio - 0.5, 0.3)} tam={38} fondo={CREMA} />
        </>
      )}
      <Hoja x={540} y={200} w={880} h={680} p={pR} titulo="registro de cambios" filas={filas} t={t} />
      <Sombra x={170} y={1540} w={150} />
      <Mascota esp="hamster-gorra" x={170} y={1545} alto={230} t={t} cara="feliz" semilla={3} />
      <Sombra x={910} y={1540} w={150} />
      <Mascota esp="perro-corbatin" x={910} y={1545} alto={240} t={t} cara={t > M.dirigir ? "estrellas" : "feliz"} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu decisión ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const D = [[M.apruebas, "✅ apruebo", "#E3F6EC"], [M.aplazas, "⏸️ aplazo", "#FFF3C4"], [M.rechazas, "❌ rechazo", "#FFE1D8"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={260} txt="⚡ tu cambio" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      <Cartel x={540} y={420} txt="🔄 cambio: ________" p={rampa(t, M.cambio11 - 0.3, 0.3)} tam={44} fondo={CREMA} giro={-2} />
      {D.map(([tw, txt, fondo], k) => <Cartel key={k} x={200 + k * 340} y={580} txt={txt} p={rampa(t, Math.min(tw, M.aplazas) - 0.6 + k * 0.15, 0.3)} tam={40} fondo={fondo} giro={[-2, 1, 2][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.rechazas, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "comite") return <Comite t={t} />;
  if (p.tipo === "salidas") return <Salidas t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.grande - 0.5, "whoosh", 0.3); fx(M.hoy - 0.3, "bocina", 0.25); fx(M.asi - 0.4, "pop-suave", 0.25);
fx(S(3) - 0.3, "whoosh", 0.4); [M.revisar, M.aprobar, M.comunicar, M.lineas, M.todo4].forEach((w) => fx(w - 0.3, "pop", 0.2)); fx(M.palabra - 0.4, "burbuja", 0.25); fx(M.escrito - 0.6, "papel", 0.3);
fx(S(6) - 0.3, "whoosh", 0.4); [M.aprueba, M.aplaza, M.rechaza].forEach((w) => fx(w - 0.3, "pop", 0.22)); [M.tiempo7, M.costo7, M.recursos7, M.riesgos7].forEach((w) => fx(w - 0.3, "pop-suave", 0.18));
fx(M.compara - 0.4, "whoosh", 0.3); fx(M.beneficio, "desliza", 0.22); fx(M.aprueba8 - 0.2, "sello", 0.35);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.dirigir - 0.3, "pop", 0.22); fx(M.pidio - 0.5, "pop", 0.22); fx(M.estado10 - 0.6, "papel", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(control|cambios|cambio|comité|aprueba|aplaza|rechaza|impacto|beneficio|registro|escrito)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP57 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp57-control-cambios.mp3" sinSonido={sinSonido} />
);
