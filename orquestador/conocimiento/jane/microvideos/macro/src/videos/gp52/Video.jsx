/*
 * Gestión de Proyectos · GP-52 «El mismo aviso, dos formas» (gp52-gestionar-comunicaciones).
 * Una idea: Gestionar las Comunicaciones es garantizar que la recopilación, creación, distribución,
 * almacenamiento, recuperación, gestión, monitoreo y disposición final de la información del proyecto sean
 * oportunos y adecuados (10.2, p. 379). Generación de informes: recopilar y distribuir, adaptada a cada
 * interesado en nivel, formato y detalle (10.2.2.5, p. 386); habilidades de comunicación: retroalimentación,
 * no verbal, presentaciones pensadas en la audiencia (10.2.2.3, p. 384–385); comunicaciones del proyecto
 * (10.2.3.1, p. 387); métodos flexibles si cambian las necesidades (10.2.2.2).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Celular, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, {
  extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3],
  manual: { 3: ["Gestionar las comunicaciones es garantizar", "que la información del proyecto se recopile,", "se distribuya y se guarde, entre otras cosas,", "de forma oportuna y adecuada."] },
});
const { S, E, W } = T;

const M = {
  plan1: W(1, "plan", 0.05), listo: W(1, "listo.", 0.55), verdad: W(1, "verdad.", 0.97),
  horario: W(2, "horario.", 0.4), avisa: W(2, "avisa?", 0.95),
  gestionar: W(3, "Gestionar", 0.03), recopile: W(3, "recopile,", 0.5), distribuya: W(3, "distribuya", 0.6), guarde: W(3, "guarde,", 0.7), oportuna: W(3, "oportuna", 0.9),
  informes: W(4, "informes:", 0.45), recopilar: W(4, "recopilar", 0.6), distribuir: W(4, "distribuir", 0.75),
  adaptada: W(5, "adaptada", 0.1), nivel: W(5, "nivel,", 0.6), formato: W(5, "formato", 0.75), detalle: W(5, "detalle", 0.88),
  tito: W(6, "Tito", 0.1), corto: W(6, "corto.", 0.45), equipo6: W(6, "equipo,", 0.6), completa: W(6, "completa.", 0.97),
  habilidades: W(7, "habilidades", 0.2), retro: W(7, "retroalimentación,", 0.55), verbal: W(7, "verbal", 0.8), presentaciones7: W(7, "presentaciones.", 0.97),
  audiencia: W(8, "audiencia:", 0.55), expectativas: W(8, "expectativas", 0.8), necesidades8: W(8, "necesidades.", 0.97),
  comunicaciones9: W(9, "comunicaciones", 0.3), desempeno: W(9, "desempeño,", 0.5), entregables: W(9, "entregables,", 0.65), cronograma: W(9, "cronograma", 0.85), costos: W(9, "costos.", 0.97),
  cambian: W(10, "cambian", 0.15), ajustarse: W(10, "ajustarse.", 0.97),
  toca: W(11, "toca:", 0.15), aviso: W(11, "aviso", 0.35), jefe: W(11, "jefe", 0.8), equipo11: W(11, "equipo.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "informes", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "habilidades", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "resultado", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* ═════ 1–2 · Hay que avisar ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={300} y={420} w={320} p={rampa(t, M.plan1 - 0.4, 0.4)} titulo="plan de gestión de las comunicaciones" letra={30} giro={-4} sello={rampa(t, M.listo - 0.2, 0.4)} />
      <Cartel x={790} y={330} txt="✅ listo" p={rampa(t, M.listo - 0.2, 0.3)} tam={46} fondo="#E3F6EC" giro={2} />
      <Cartel x={790} y={470} txt="📣 ¡a comunicar!" p={rampa(t, M.verdad - 0.5, 0.3)} tam={42} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={760} txt="🕘 nuevo horario" p={rampa(t, M.horario - 0.4, 0.3)} tam={46} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={880} txt="¿cómo se avisa?" p={rampa(t, M.avisa - 0.5, 0.3)} tam={44} fondo="#DDE3FF" giro={1} />
      <Sombra x={260} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={340} t={t} cara="feliz" cab={8 * Math.sin(t * 2.5)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={340} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.recopile, "📥 recopilar"], [M.distribuya, "📤 distribuir"], [M.guarde, "🗄️ guardar"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={220} txt="gestionar las comunicaciones" p={rampa(t, M.gestionar - 0.3, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={540} y={350} txt="la información del proyecto:" p={rampa(t, M.recopile - 1.0, 0.3)} tam={36} fondo="#FFFDF7" />
      {C.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={490} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={38} fondo={CREMA} giro={[-2, 1, 2][k]} />)}
      <Cartel x={540} y={610} txt="…entre otras cosas" p={rampa(t, M.guarde + 0.3, 0.3)} tam={32} fondo="#FFFDF7" />
      <Cartel x={540} y={760} txt="⏱️ oportuna y ✅ adecuada" p={rampa(t, M.oportuna - 0.3, 0.3)} tam={42} fondo="#E3F6EC" giro={-1} />
      <Sombra x={540} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Informes a la medida ═════ */
function Informes({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 960 }]);
  const A = [[M.nivel, "📶 nivel"], [M.formato, "🧾 formato"], [M.detalle, "🔍 detalle"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="generación de informes" p={rampa(t, M.informes - 0.4, 0.35)} tam={46} fondo={MANGO} />
      <Cartel x={300} y={270} txt="📥 recopilar" p={rampa(t, M.recopilar - 0.3, 0.3)} tam={36} fondo={CREMA} giro={-2} />
      <Cartel x={780} y={270} txt="📤 distribuir" p={rampa(t, M.distribuir - 0.3, 0.3)} tam={36} fondo={CREMA} giro={2} />
      <Cartel x={540} y={390} txt="🎯 adaptada a cada interesado" p={rampa(t, M.adaptada - 0.3, 0.3)} tam={38} fondo="#DDE3FF" />
      {A.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={500} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo="#FFFDF7" giro={[-1, 1, -1][k]} />)}
      <Celular x={250} y={880} w={250} p={rampa(t, M.corto - 0.5, 0.4)} giro={-4}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 90, padding: 14, background: "#DCF8C6", borderRadius: 16, fontFamily: "Sora", fontWeight: 800, fontSize: 26, color: TINTA }}>🕘 Nuevo horario: 7 a. m.</div>
      </Celular>
      <Cartel x={250} y={1160} txt="Don Tito: mensaje corto" p={rampa(t, M.corto - 0.3, 0.3)} tam={30} fondo={CREMA} giro={-2} />
      {(() => {
        const q = rampa(t, M.equipo6 - 0.3, 0.4);
        if (q <= 0) return null;
        return (
          <div style={{ position: "absolute", left: 520, top: 650, width: 500, height: 420, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 20, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(q)}) rotate(2deg)`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
            <div style={{ height: 70, background: AZUL, color: "#fff", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>nuevo horario</div>
            {[0.75, 0.6, 0.8, 0.5].map((w, k) => <div key={k} style={{ position: "absolute", left: 30, top: 110 + k * 42, width: 440 * w, height: 16, background: "#D9D2C3", borderRadius: 8 }} />)}
            <div style={{ position: "absolute", left: 30, bottom: 26, display: "flex", gap: 14, alignItems: "flex-end" }}>
              {[60, 110, 85, 140].map((h, k) => <div key={k} style={{ width: 50, height: h, background: [MANGO, "#7FD3A5", AZUL, ROJO][k], border: `4px solid ${TINTA}`, borderRadius: 8 }} />)}
            </div>
          </div>
        );
      })()}
      <Cartel x={770} y={1160} txt="equipo: presentación completa" p={rampa(t, M.completa - 0.4, 0.3)} tam={30} fondo={CREMA} giro={2} />
      <Sombra x={200} y={1540} w={140} />
      <Mascota esp="perro-mochila" x={200} y={1545} alto={230} t={t} cara={t > M.corto ? "feliz" : "tranquila"} semilla={5} />
      <Sombra x={880} y={1540} w={140} />
      <Mascota esp="gato-gafas" x={880} y={1545} alto={230} t={t} cara={t > M.completa - 0.3 ? "feliz" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 7–8 · Habilidades de comunicación ═════ */
function Habilidades({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const H = [[M.retro, "🔁 retroalimentación"], [M.verbal, "🙌 lenguaje no verbal"], [M.presentaciones7, "🎤 presentaciones"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={200} txt="habilidades de comunicación" p={rampa(t, M.habilidades - 0.4, 0.35)} tam={44} fondo={MANGO} />
      {H.map(([tw, txt], k) => <Cartel key={k} x={540} y={340 + k * 125} txt={txt} p={rampa(t, tw - 0.4, 0.3)} tam={42} fondo={CREMA} giro={[-1, 1, -1][k]} />)}
      <Cartel x={540} y={780} txt="🎤 piensa en la audiencia:" p={rampa(t, M.audiencia - 0.4, 0.3)} tam={40} fondo="#DDE3FF" giro={1} />
      <Cartel x={300} y={900} txt="🌟 expectativas" p={rampa(t, M.expectativas - 0.3, 0.3)} tam={38} fondo="#FFFDF7" giro={-2} />
      <Cartel x={780} y={900} txt="🧺 necesidades" p={rampa(t, M.necesidades8 - 0.4, 0.3)} tam={38} fondo="#FFFDF7" giro={2} />
      <Sombra x={540} y={1520} w={180} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={290} t={t} cara="feliz" bi={-50 * pulso(t, M.presentaciones7 - 0.3, 1.2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · Comunicaciones del proyecto ═════ */
function Resultado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const R = [[M.desempeno, "📊 informes de desempeño"], [M.entregables, "📦 estado de los entregables"], [M.cronograma, "📅 avance del cronograma"], [M.costos, "💲 costos"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt="comunicaciones del proyecto" p={rampa(t, M.comunicaciones9 - 0.4, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={540} y={300} txt="como…" p={rampa(t, M.desempeno - 0.7, 0.3)} tam={34} fondo="#FFFDF7" />
      {R.map(([tw, txt], k) => <Cartel key={k} x={540} y={410 + k * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={40} fondo={CREMA} giro={[-1, 1, -1, 1][k]} />)}
      <Cartel x={540} y={950} txt="🔄 si cambian las necesidades…" p={rampa(t, M.cambian - 0.3, 0.3)} tam={36} fondo="#DDE3FF" giro={-1} />
      <Cartel x={540} y={1060} txt="🧩 los métodos se ajustan" p={rampa(t, M.ajustarse - 0.6, 0.3)} tam={38} fondo="#E3F6EC" giro={1} />
      <Sombra x={190} y={1530} w={150} />
      <Mascota esp="hamster-gorra" x={190} y={1535} alto={240} t={t} cara="feliz" semilla={3} />
      <Sombra x={890} y={1530} w={150} />
      <Mascota esp="perro-corbatin" x={890} y={1535} alto={240} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · El mismo aviso, dos formas ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={270} txt="⚡ un aviso, dos formas" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={440} txt="👔 para tu jefe: ________" p={rampa(t, M.jefe - 0.4, 0.3)} tam={42} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={570} txt="👥 para tu equipo: ________" p={rampa(t, M.equipo11 - 0.5, 0.3)} tam={42} fondo={CREMA} giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.equipo11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "informes") return <Informes t={t} />;
  if (p.tipo === "habilidades") return <Habilidades t={t} />;
  if (p.tipo === "resultado") return <Resultado t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.plan1 - 0.4, "papel", 0.3); fx(M.listo - 0.2, "sello", 0.3); fx(M.verdad - 0.5, "pop", 0.25); fx(M.horario - 0.4, "pop", 0.25); fx(M.avisa - 0.5, "pop-suave", 0.22);
fx(S(3) - 0.3, "whoosh", 0.4); [M.recopile, M.distribuya, M.guarde, M.oportuna].forEach((w) => fx(w - 0.3, "pop", 0.2));
fx(S(4) - 0.3, "whoosh", 0.4); [M.recopilar, M.distribuir, M.nivel, M.formato, M.detalle].forEach((w) => fx(w - 0.3, "pop-suave", 0.2)); fx(M.corto - 0.5, "burbuja", 0.3); fx(M.equipo6 - 0.3, "papel", 0.3);
fx(S(7) - 0.3, "whoosh", 0.4); [M.retro, M.verbal, M.presentaciones7, M.audiencia].forEach((w) => fx(w - 0.4, "pop", 0.2));
fx(S(9) - 0.3, "whoosh", 0.4); [M.desempeno, M.entregables, M.cronograma, M.costos].forEach((w) => fx(w - 0.35, "pop-suave", 0.2)); fx(M.ajustarse - 0.6, "ding", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(comunicaciones|comunicar|informes|interesado|retroalimentación|presentaciones|audiencia|formato|detalle)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP52 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp52-gestionar-comunicaciones.mp3" sinSonido={sinSonido} />
);
