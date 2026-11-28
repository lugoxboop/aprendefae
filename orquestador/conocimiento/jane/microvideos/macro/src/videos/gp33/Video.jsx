/*
 * Gestión de Proyectos · GP-33 «¿Entre poco y mucho?» (gp33-costos-est).
 * Una idea: Estimar los Costos es desarrollar una aproximación del costo de los recursos
 * necesarios para completar el trabajo del proyecto (7.2, p. 240). La exactitud aumenta con el
 * avance: ROM de −25 % a +75 %, luego −5 % a +10 % (p. 241). Se estiman todos los recursos.
 * Técnicas: análoga, paramétrica, ascendente, basada en tres valores (7.2.2). Reserva para
 * contingencias: para riesgos identificados (7.2.2.6). Salidas: estimaciones de costos y base de
 * las estimaciones (7.2.3.1–7.2.3.2, p. 246–247).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Dicho, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3] });
const { S, E, W } = T;

const M = {
  cuesta: W(1, "cuesta", 0.15), amplio: W(1, "amplio.", 0.95),
  orden: W(2, "orden", 0.4), veinticinco: W(2, "veinticinco", 0.65), setenta: W(2, "setenta", 0.85),
  informacion: W(3, "información,", 0.15), cierra: W(3, "cierra;", 0.35), cinco: W(3, "cinco", 0.65), diez: W(3, "diez", 0.85),
  estimar: W(4, "estimar", 0.12), aproximacion: W(4, "aproximación", 0.35), recursos4: W(4, "recursos", 0.6),
  personal: W(5, "personal,", 0.4), materiales: W(5, "materiales,", 0.55), equipos: W(5, "equipos,", 0.7), servicios: W(5, "servicios", 0.8), instalaciones: W(5, "instalaciones.", 0.95),
  tecnicas: W(6, "técnicas", 0.15), analoga: W(6, "análoga,", 0.45), parametrica: W(6, "paramétrica,", 0.6), ascendente: W(6, "ascendente", 0.75), tres: W(6, "tres", 0.9),
  madera: W(7, "madera,", 0.2), tela: W(7, "tela,", 0.35), vitrina: W(7, "vitrina", 0.5), mano: W(7, "mano", 0.65), millones: W(7, "millones.", 0.95),
  reserva: W(8, "reserva", 0.2), riesgos: W(8, "riesgos", 0.55), suba: W(8, "suba", 0.85),
  estimaciones9: W(9, "estimaciones", 0.2), base: W(9, "base:", 0.4), calcularon: W(9, "calcularon,", 0.55), supuestos: W(9, "supuestos,", 0.65), restricciones: W(9, "restricciones,", 0.75), rango9: W(9, "rango", 0.85), confianza: W(9, "confianza.", 0.95),
  refinan: W(10, "refinan", 0.3), detalles: W(10, "detalles.", 0.95),
  toca: W(11, "toca:", 0.15), estima11: W(11, "estima", 0.3), rango11: W(11, "rango.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "rango", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "estimar", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "suma", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "salida", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Barra de rango: de -a % a +b % alrededor de la estimación */
function Rango({ y, p, menos, mas, rot, fondo }) {
  if (p <= 0) return null;
  const c = 380, k = 6.2, w = sale(clamp01(p));
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 160, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: c - menos * k * w, top: 40, width: (menos + mas) * k * w, height: 70, background: fondo, border: `6px solid ${TINTA}`, borderRadius: 35, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: c - 4, top: 24, width: 8, height: 102, background: TINTA, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: c - menos * k - 175, top: 50, width: 160, textAlign: "right", fontSize: 40, opacity: w }}>−{menos} %</div>
      <div style={{ position: "absolute", left: c + mas * k + 15, top: 50, width: 180, textAlign: "left", fontSize: 40, opacity: w }}>+{mas} %</div>
      <div style={{ position: "absolute", left: 40, top: -30, fontSize: 34, opacity: w }}>{rot}</div>
    </div>
  );
}

/* ═════ 1 · ¿Cuánto cuesta? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={300} y={300} w={640} h={180} colaX={780} p={rampa(t, M.cuesta - 0.4, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 48, color: TINTA }}>«¿Cuánto cuesta?»</div>
      </Dicho>
      <Carrito x={540} y={900} w={420} p={rampa(t, 0.1, 0.4)} t={t} />
      <Cartel x={540} y={1020} txt="💲 entre poco… y mucho" p={rampa(t, M.amplio - 0.7, 0.35)} tam={54} fondo={MANGO} giro={-2} />
      <Sombra x={260} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={390} t={t} cara={t > M.amplio - 0.6 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={820} y={1515} alto={360} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 2–3 · El rango se cierra ═════ */
function RangoEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.03, x: 540, y: 955 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="la exactitud mejora con el tiempo" p={rampa(t, S(2) - 0.2, 0.35)} tam={44} fondo={CREMA} />
      <Rango y={420} p={rampa(t, M.veinticinco - 0.4, 0.8)} menos={25} mas={75} rot="al inicio: orden de magnitud (ROM)" fondo="#FFE1D8" />
      <Gigante x={540} y={720} txt="⬇️" p={rampa(t, M.informacion - 0.3, 0.3)} tam={90} />
      <Rango y={830} p={rampa(t, M.cinco - 0.4, 0.6)} menos={5} mas={10} rot="con más información" fondo="#E3F6EC" />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={290} t={t} cara={t > M.cierra ? "feliz" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–6 · Qué es y con qué técnicas ═════ */
function Estimar({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.02, x: 540, y: 960 }]);
  const en6 = rampa(t, S(6) - 0.4, 0.35);
  const R = [[M.personal, "👥 personal"], [M.materiales, "🧱 materiales"], [M.equipos, "🛠️ equipos"], [M.servicios, "🧾 servicios"], [M.instalaciones, "🏠 instalaciones"]];
  const TEC = [[M.analoga, "análoga"], [M.parametrica, "paramétrica"], [M.ascendente, "ascendente"], [M.tres, "basada en tres valores"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={240} txt="estimar los costos" p={rampa(t, M.estimar - 0.4, 0.35)} tam={62} fondo={MANGO} />
      <Cartel x={540} y={380} txt="aproximación del costo de los recursos" p={rampa(t, M.aproximacion - 0.4, 0.35)} tam={40} fondo={CREMA} giro={-1} />
      <div style={{ opacity: 1 - en6 }}>
        {R.map(([tw, txt], k) => <Cartel key={k} x={k < 3 ? 200 + k * 340 : 370 + (k - 3) * 340} y={k < 3 ? 560 : 690} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={40} fondo="#DDE3FF" giro={[-2, 2, -1, 1, -2][k]} />)}
      </div>
      {en6 > 0 && (
        <div style={{ opacity: en6 }}>
          <Cartel x={540} y={530} txt="técnicas (como en la duración)" p={rampa(t, M.tecnicas - 0.4, 0.35)} tam={40} fondo={CREMA} />
          {TEC.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={680 + Math.floor(k / 2) * 125} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={k === 3 ? 34 : 42} fondo="#E3F6EC" giro={[-2, 2, 1, -1][k]} />)}
        </div>
      )}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={280} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 7–8 · Suma y reserva para contingencias ═════ */
function Suma({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.02, x: 540, y: 960 }]);
  const IT = [[M.madera, "🪵 madera"], [M.tela, "⛱️ tela"], [M.vitrina, "🪟 vitrina"], [M.mano, "👷 mano de obra"]];
  const pR = rampa(t, M.reserva - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ position: "absolute", left: 140, top: 200, width: 800, height: 760, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, opacity: rampa(t, S(7) - 0.3, 0.3) }} />
      {IT.map(([tw, txt], k) => <div key={k} style={{ position: "absolute", left: 200, top: 240 + k * 100, fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA, opacity: rampa(t, tw - 0.3, 0.3) }}>{txt}</div>)}
      <div style={{ position: "absolute", left: 190, top: 650, width: 700, height: 8, background: TINTA, opacity: rampa(t, M.millones - 0.6, 0.3) }} />
      <Cartel x={540} y={730} txt="≈ 2 millones" p={rampa(t, M.millones - 0.5, 0.35)} tam={62} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={870} txt="+ 🛟 reserva para contingencias" p={pR} tam={42} fondo="#E3F6EC" giro={2} />
      <Cartel x={540} y={1050} txt="riesgos identificados: 📈 ¿sube la tela?" p={rampa(t, M.riesgos - 0.4, 0.35)} tam={38} fondo="#FFE1D8" />
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={270} t={t} cara={t > M.millones ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={910} y={1510} w={160} />
      <Mascota esp="perro-corbatin" x={910} y={1515} alto={260} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 9–10 · Estimaciones y su base ═════ */
function Salida({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.02, x: 540, y: 960 }]);
  const B = [[M.calcularon, "🧭 cómo se calcularon"], [M.supuestos, "💭 supuestos"], [M.restricciones, "⛔ restricciones"], [M.rango9, "↔️ rango"], [M.confianza, "👍 confianza"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={300} y={380} w={300} p={rampa(t, M.estimaciones9 - 0.4, 0.4)} titulo="estimaciones de costos" letra={34} giro={-4} />
      <Documento x={780} y={380} w={300} p={rampa(t, M.base - 0.4, 0.4)} titulo="base de las estimaciones" letra={34} giro={4} />
      {B.map(([tw, txt], k) => <Cartel key={k} x={k % 2 ? 770 : 310} y={680 + Math.floor(k / 2) * 115} txt={txt} p={rampa(t, tw - 0.35, 0.3)} tam={38} fondo={CREMA} giro={[-2, 2, 1, -1, -2][k]} />)}
      <Cartel x={540} y={1080} txt="🔄 se refinan con más detalles" p={rampa(t, M.refinan - 0.4, 0.35)} tam={46} fondo="#DDE3FF" giro={-2} />
      <Sombra x={540} y={1530} w={190} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={250} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tu estimación ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={320} txt="⚡ estima tu proyecto" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={MANGO} />
      <Cartel x={540} y={500} txt="💲 ________" p={rampa(t, M.estima11 - 0.2, 0.3)} tam={56} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={640} txt="↔️ − ___ % / + ___ %" p={rampa(t, M.rango11 - 0.5, 0.3)} tam={50} fondo={CREMA} giro={2} />
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.rango11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "rango") return <RangoEsc t={t} />;
  if (p.tipo === "estimar") return <Estimar t={t} />;
  if (p.tipo === "suma") return <Suma t={t} />;
  if (p.tipo === "salida") return <Salida t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cuesta - 0.4, "pop", 0.35); fx(M.amplio - 0.7, "toc-grave", 0.3);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.veinticinco - 0.4, "desliza", 0.3); fx(M.cinco - 0.4, "desliza", 0.3); fx(M.cierra, "ding", 0.25);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.estimar - 0.4, "pop", 0.3); [M.personal, M.materiales, M.equipos, M.servicios, M.instalaciones].forEach((w) => fx(w - 0.35, "pop-suave", 0.2)); [M.analoga, M.parametrica, M.ascendente, M.tres].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(7) - 0.3, "whoosh", 0.4); [M.madera, M.tela, M.vitrina, M.mano].forEach((w) => fx(w - 0.3, "tiza", 0.2)); fx(M.millones - 0.5, "monedas", 0.3); fx(M.reserva - 0.4, "pop", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.estimaciones9 - 0.4, "papel", 0.3); fx(M.base - 0.4, "papel", 0.3); fx(M.refinan - 0.4, "rebobina", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(costos|rango|magnitud|estimar|recursos|reserva|contingencias|estimaciones|base)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP33 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp33-costos-est.mp3" sinSonido={sinSonido} />
);
