/*
 * Gestión de Proyectos · GP-68 «¡Se acabó la feria!» (gp68-cerrar-proyecto).
 * Una idea: Cerrar el Proyecto o Fase es finalizar todas las actividades del proyecto, fase o contrato; la
 * información se archiva, el trabajo planificado se completa y los recursos del equipo se liberan (4.7, p. 121).
 * Entregables aceptados, ningún incidente abierto, lecciones aprendidas, satisfacción de los interesados,
 * celebrar (4.7, p. 123–124). Transferencia del producto, servicio o resultado final (4.7.3.2); informe final con
 * resumen del desempeño: alcance, calidad, costos, cronograma, riesgos e incidentes y cómo se abordaron (4.7.3.3).
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
    3: ["Cerrar el proyecto o fase es finalizar todas las actividades", "del proyecto, fase o contrato."],
    4: ["Así la información se archiva,", "el trabajo planificado se completa", "y los recursos del equipo se liberan."],
    5: ["Se confirma que los entregables fueron aceptados", "y se verifica que no quede ningún incidente abierto."],
    6: ["Se recopilan las lecciones aprendidas,", "se mide la satisfacción de los interesados,", "y se celebra el éxito."],
    11: ["Ahora te toca: cierra tu proyecto.", "Escribe tu informe final en cinco líneas, y celebra."],
  },
});
const { S, E, W } = T;

const M = {
  exito1: W(1, "éxito.", 0.4), quiere: W(1, "quiere", 0.65), dormir: W(1, "dormir.", 0.97),
  pero: W(2, "Pero", 0.02), trabajo2: W(2, "trabajo.", 0.97),
  cerrar3: W(3, "Cerrar", 0.02), finalizar: W(3, "finalizar", 0.4), contrato3: W(3, "contrato.", 0.97),
  archiva: W(4, "archiva,", 0.3), completa: W(4, "completa", 0.62), recursos4: W(4, "recursos", 0.8),
  aceptados: W(5, "aceptados", 0.45), incidente: W(5, "incidente", 0.9),
  lecciones: W(6, "lecciones", 0.2), satisfaccion: W(6, "satisfacción", 0.55), celebra6: W(6, "celebra", 0.88),
  transferencia: W(7, "transferencia", 0.4), operar: W(7, "operar", 0.8),
  entrega: W(8, "entrega", 0.15), horno: W(8, "horno", 0.5), panaderia: W(8, "panadería.", 0.97),
  informe9: W(9, "informe", 0.35), resumen: W(9, "resumen", 0.6),
  alcance: W(10, "Alcance,", 0.02), calidad: W(10, "calidad,", 0.12), costos: W(10, "costos,", 0.22), cronograma: W(10, "cronograma,", 0.35), riesgos: W(10, "riesgos", 0.55), incidentes: W(10, "incidentes,", 0.68), como: W(10, "cómo", 0.85),
  toca: W(11, "toca:", 0.1), cierra11: W(11, "cierra", 0.2), escribe: W(11, "Escribe", 0.45), celebra11: W(11, "celebra.", 0.97),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "definicion", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "lista", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "transferencia", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "informe", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Toldo dibujado (el mismo de GP-66) */
function Toldo({ x, y, w, p = 1 }) {
  if (p <= 0) return null;
  const h = w * 0.9;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * 0.38, background: "repeating-linear-gradient(90deg,#E5484D 0 28px,#FFFDF7 28px 56px)", border: `7px solid ${TINTA}`, borderRadius: "40px 40px 12px 12px" }} />
      {[0.08, 0.84].map((f) => <div key={f} style={{ position: "absolute", left: `${f * 100}%`, top: h * 0.38, width: w * 0.08, height: h * 0.62, background: "#8A5A35", border: `6px solid ${TINTA}`, borderRadius: 6 }} />)}
    </div>
  );
}

/* Confeti simple que cae */
function Confeti({ t, desde }) {
  const q = t - desde;
  if (q < 0) return null;
  return (
    <>
      {Array.from({ length: 18 }, (_, k) => {
        const x = (k * 137) % 1040 + 20, y = -40 + ((q * (260 + (k % 5) * 40) + k * 90) % 1300);
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: 22, height: 34, borderRadius: 6, background: ["#F2B33D", "#E5484D", "#2FB36B", "#5B8DEF", "#B57BEE"][k % 5], transform: `rotate(${q * 200 + k * 40}deg)`, opacity: Math.min(1, q * 3) }} />;
      })}
    </>
  );
}

/* ═════ 1–2 · Se acabó la feria ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(2), s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Confeti t={t} desde={M.exito1 - 0.4} />
      <Cartel x={540} y={190} txt="🎉 ¡la feria fue un éxito!" p={rampa(t, M.exito1 - 0.4, 0.3)} tam={46} fondo={MANGO} giro={-2} />
      {rampa(t, M.quiere - 0.3, 0.3) > 0 && <Gigante x={330} y={980} txt="😴" p={rampa(t, M.quiere - 0.3, 0.3)} tam={110} />}
      <Dicho x={420} y={640} w={600} h={140} p={rampa(t, M.pero - 0.2, 0.3)} colaX={820}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: TINTA }}>✋ ¡todavía no, Pía!</div>
      </Dicho>
      <Cartel x={540} y={330} txt="🏁 terminar el trabajo ≠ cerrar el proyecto" p={rampa(t, M.trabajo2 - 0.8, 0.3)} tam={32} fondo="#FFE1D8" color={ROJO} giro={1} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={330} t={t} cara={t > M.pero ? "triste" : "feliz"} salto={30 * pulso(t, M.exito1, 0.5)} semilla={3} />
      <Sombra x={820} y={1510} w={200} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={350} t={t} cara={t > M.pero ? "tranquila" : "feliz"} bi={-40 * pulso(t, M.pero, 1.0)} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 3–4 · Qué es ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4), b: E(4) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.archiva, "🗄️ la información se archiva"], [M.completa, "✅ el trabajo planificado se completa"], [M.recursos4, "🔓 los recursos del equipo se liberan"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={160} txt="cerrar el proyecto o fase" p={rampa(t, M.cerrar3 - 0.3, 0.35)} tam={48} fondo={MANGO} />
      <Cartel x={540} y={290} txt="🏁 finalizar todas las actividades" p={rampa(t, M.finalizar - 0.3, 0.3)} tam={38} fondo={CREMA} giro={-1} />
      <Cartel x={540} y={385} txt="del proyecto, fase o contrato" p={rampa(t, M.contrato3 - 1.0, 0.3)} tam={34} fondo="#FFFDF7" giro={1} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={540} y={540 + k * 105} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={34} fondo={["#DDE3FF", "#E3F6EC", "#FFF4D6"][k]} giro={[-1, 1, -1][k]} />)}
      <Sombra x={250} y={1530} w={170} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={260} t={t} cara="tranquila" semilla={3} />
      <Sombra x={830} y={1530} w={170} />
      <Mascota esp="perro-corbatin" x={830} y={1535} alto={280} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 5–6 · Lista de cierre ═════ */
function Lista({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6) + 0.3, s: 1.03, x: 540, y: 940 }]);
  const filas = [
    [M.aceptados, "📦", "entregables", "✅ aceptados", "#E3F6EC"],
    [M.incidente, "🚧", "incidentes", "✅ ninguno abierto", "#E3F6EC"],
    [M.lecciones, "📚", "lecciones aprendidas", "recopiladas", "#FFFDF7"],
    [M.satisfaccion, "😊", "satisfacción", "de los interesados", "#FFFDF7"],
    [M.celebra6, "🎉", "celebrar", "el éxito", "#FFF4D6"],
  ];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={130} w={900} h={1040} p={rampa(t, S(5) - 0.1, 0.4)} titulo="antes de cerrar" filas={filas} t={t} />
      <Confeti t={t} desde={M.celebra6 - 0.3} />
      <Sombra x={160} y={1540} w={140} />
      <Mascota esp="hamster-gorra" x={160} y={1545} alto={230} t={t} cara={t > M.celebra6 - 0.3 ? "estrellas" : "feliz"} salto={30 * pulso(t, M.celebra6, 0.5)} semilla={3} />
      <Sombra x={920} y={1540} w={140} />
      <Mascota esp="perro-corbatin" x={920} y={1545} alto={240} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 7–8 · Transferencia ═════ */
function Transferencia({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const v = sale(rampa(t, M.entrega - 0.2, 1.4));
  const ok = t > M.horno;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={160} txt="📤 transferencia" p={rampa(t, M.transferencia - 0.3, 0.35)} tam={50} fondo={MANGO} />
      <Cartel x={540} y={270} txt="a quien lo va a operar y mantener" p={rampa(t, M.operar - 0.6, 0.3)} tam={34} fondo={CREMA} giro={-1} />
      <Toldo x={lerp(260, 800, v)} y={760} w={230} p={rampa(t, M.entrega - 0.4, 0.3)} />
      {t > M.entrega - 0.3 && <Horno x={lerp(300, 780, v)} y={1100} w={210} brillo={0.6} />}
      <Cartel x={540} y={480} txt="🤝 al equipo de la panadería" p={rampa(t, M.horno, 0.3)} tam={38} fondo="#E3F6EC" giro={1} />
      <Sombra x={200} y={1540} w={170} />
      <Mascota esp="hamster-gorra" x={200} y={1545} alto={270} t={t} cara={ok ? "feliz" : "tranquila"} bd={-50 * pulso(t, M.entrega, 1.0)} semilla={3} />
      <Sombra x={880} y={1540} w={170} />
      <Mascota esp="gato-gafas" x={880} y={1545} alto={280} t={t} cara={ok ? "feliz" : "tranquila"} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Informe final ═════ */
function Informe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10) + 0.3, s: 1.03, x: 540, y: 955 }]);
  const C = [[M.alcance, "🎯 alcance"], [M.calidad, "🏅 calidad"], [M.costos, "💲 costos"], [M.cronograma, "📅 cronograma"], [M.riesgos, "⚠️ riesgos"], [M.incidentes, "🚧 incidentes"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={400} w={300} p={rampa(t, M.informe9 - 0.4, 0.4)} titulo="informe final" letra={36} giro={-2} />
      <Cartel x={540} y={680} txt="📝 resumen del desempeño" p={rampa(t, M.resumen - 0.3, 0.3)} tam={40} fondo="#DDE3FF" giro={1} />
      {C.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 780 : 300} y={810 + Math.floor(k / 2) * 100} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={36} fondo={CREMA} giro={[-2, 2, 1, -1, -1, 2][k]} />)}
      <Cartel x={540} y={1130} txt="🛠️ y cómo se abordaron" p={rampa(t, M.como - 0.3, 0.3)} tam={38} fondo="#E3F6EC" />
      <Sombra x={150} y={1540} w={130} />
      <Mascota esp="hamster-gorra" x={150} y={1545} alto={220} t={t} cara="feliz" semilla={3} />
      <Sombra x={930} y={1540} w={130} />
      <Mascota esp="perro-corbatin" x={930} y={1545} alto={230} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 11 · Tu cierre ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const fiesta = M.celebra11 - 1.0;
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Confeti t={t} desde={fiesta} />
      <Cartel x={540} y={260} txt="⚡ cierra tu proyecto" p={rampa(t, M.toca - 0.2, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={540} y={410} txt="📝 tu informe final en 5 líneas" p={rampa(t, M.escribe - 0.3, 0.3)} tam={40} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={540} txt="🎉 ¡y celebra!" p={rampa(t, fiesta, 0.3)} tam={46} fondo="#E3F6EC" giro={1} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara={t > fiesta ? "estrellas" : "guino"} bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, fiesta + 0.3, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={370} t={t} cara="feliz" salto={30 * pulso(t, fiesta + 0.5, 0.5)} semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "lista") return <Lista t={t} />;
  if (p.tipo === "transferencia") return <Transferencia t={t} />;
  if (p.tipo === "informe") return <Informe t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.exito1 - 0.4, "ding", 0.25); fx(M.quiere - 0.3, "pop-suave", 0.18); fx(M.pero - 0.2, "bocina", 0.2); fx(M.trabajo2 - 0.8, "pop", 0.2);
fx(S(3) - 0.3, "whoosh", 0.4); [M.finalizar, M.archiva, M.completa, M.recursos4].forEach((w) => fx(w - 0.3, "pop", 0.18));
fx(S(5) - 0.3, "whoosh", 0.4); [M.aceptados, M.incidente, M.lecciones, M.satisfaccion].forEach((w) => fx(w - 0.4, "pop-suave", 0.18)); fx(M.celebra6 - 0.3, "ding-doble", 0.3);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.transferencia - 0.3, "pop", 0.2); fx(M.entrega - 0.2, "desliza", 0.25); fx(M.panaderia - 0.6, "ding", 0.25);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.informe9 - 0.4, "papel", 0.3); [M.alcance, M.calidad, M.costos, M.cronograma, M.riesgos, M.incidentes].forEach((w) => fx(w - 0.3, "pop-suave", 0.15));
fx(M.toca - 0.3, "pop", 0.35); fx(M.celebra11 - 1.0, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(cerrar|cierra|fase|entregables|incidente|lecciones|satisfacción|transferencia|informe|celebra)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP68 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp68-cerrar-proyecto.mp3" sinSonido={sinSonido} />
);
