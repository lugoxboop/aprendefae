/*
 * Gestión de Proyectos · GP-23 «¿Y quién decide qué entra?» (gp23-alcance).
 * Una idea: Planificar la Gestión del Alcance crea un plan que documenta cómo se definirán,
 * validarán y controlarán el alcance del proyecto y del producto (5.1, p. 134). El plan de
 * gestión del alcance: enunciado del alcance, creación de la EDT/WBS, aprobación de la línea
 * base del alcance y aceptación formal de los entregables; puede ser formal o informal
 * (5.1.3.1, p. 137). El plan de gestión de los requisitos: cómo se analizarán, documentarán y
 * gestionarán; priorización; autorización de cambios (5.1.3.2, p. 137). Ambos son componentes
 * del plan para la dirección del proyecto.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Dicho, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import { Carpeta } from "../gp22/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.35, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  sombrilla: W(1, "sombrilla", 0.25), nevera: W(1, "nevera.", 0.55), decide: W(1, "decide", 0.8), entra: W(1, "entra?", 0.95),
  semana: W(2, "semana,", 0.1), carmen2: W(2, "Carmen", 0.25), clientes: W(2, "clientes", 0.4), nuevo: W(2, "nuevo,", 0.55), responder: W(2, "responder.", 0.95),
  falto: W(3, "faltó", 0.1), alcance3: W(3, "alcance.", 0.95),
  planificar: W(4, "planificar", 0.1), plan4: W(4, "plan", 0.5), definira: W(4, "definirá,", 0.75), validara: W(4, "validará", 0.85), controlara: W(4, "controlará.", 0.95),
  plan5: W(5, "plan", 0.1), enunciado: W(5, "enunciado", 0.75),
  estructura: W(6, "estructura", 0.6), trabajo: W(6, "trabajo,", 0.95),
  linea: W(7, "línea", 0.25), aceptaran: W(7, "aceptarán", 0.7), entregables7: W(7, "entregables.", 0.95),
  companero: W(8, "compañero:", 0.25), requisitos8: W(8, "requisitos.", 0.95),
  analizaran: W(9, "analizarán,", 0.2), documentaran: W(9, "documentarán", 0.3), gestionaran: W(9, "gestionarán", 0.42), priorizan: W(9, "priorizan", 0.7), autoriza: W(9, "autoriza", 0.85), cambios: W(9, "cambios.", 0.95),
  dos: W(10, "dos", 0.05), direccion10: W(10, "dirección", 0.35), formal: W(10, "formal", 0.7), informal: W(10, "informal,", 0.8),
  toca: W(11, "toca:", 0.15), aceptaran11: W(11, "aceptarán", 0.5), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "pedidos", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "alcance", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "requisitos", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "ambos", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Hoja de un plan con renglones que aparecen */
function Hoja({ x, y, w, h, p, titulo, filas, t, col = AZUL }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 100, background: col, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 44, padding: "0 20px", textAlign: "center", lineHeight: 1.05 }}>{titulo}</div>
      {filas.map(([tw, ic, txt], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 30, right: 30, top: 130 + k * 128, height: 110, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, padding: "0 20px", background: "#FFF4DA", border: `5px solid ${TINTA}`, borderRadius: 20, fontSize: 40, transform: `scale(${rebote(q)})` }}>
            <span style={{ fontSize: 62 }}>{ic}</span><span style={{ lineHeight: 1.05 }}>{txt}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1 · Sombrilla, nevera… ¿quién decide? ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const ps = sale(rampa(t, M.sombrilla - 0.3, 0.5));
  const pn = sale(rampa(t, M.nevera - 0.4, 0.5));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(4px)" velo={0.12}>
      <Carrito x={540} y={1000} w={460} p={1} t={t} />
      <Gigante x={540} y={lerp(300, 640, ps)} txt="⛱️" p={ps} tam={190} giro={5 * Math.sin(t * 3)} />
      <Gigante x={800} y={lerp(300, 1030, pn)} txt="🧊" p={pn} tam={150} giro={-6} />
      <Cartel x={540} y={300} txt="¿quién decide qué entra?" p={rampa(t, M.decide - 0.4, 0.35)} tam={58} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={200} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={380} t={t} cara={t > M.nevera ? "triste" : "tranquila"} cab={8 * Math.sin(t * 3) * rampa(t, M.nevera, 0.3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · Pedidos nuevos cada semana ═════ */
function Pedidos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 960 }]);
  const pide = [[M.carmen2, "🎶 ¡música!", 500, 400, 830], [M.clientes, "☕ ¡café!", 200, 560, 560], [M.nuevo, "🍦 ¡helado!", 420, 720, 560]];
  const p3 = rampa(t, M.falto - 0.4, 0.35);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.18}>
      <Cartel x={540} y={260} txt="🗓️ cada semana, algo nuevo" p={rampa(t, M.semana - 0.3, 0.35)} tam={52} fondo={CREMA} />
      <div style={{ opacity: 1 - 0.6 * p3 }}>
        {pide.map(([tw, txt, x, y, cola], k) => (
          <Dicho key={k} x={x} y={y} w={400} h={120} colaX={cola} p={rampa(t, tw - 0.3, 0.35)}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA }}>{txt}</div>
          </Dicho>
        ))}
      </div>
      <Cartel x={540} y={960} txt="faltó acordar cómo manejar el alcance" p={p3} tam={44} fondo={MANGO} giro={-2} />
      <Gigante x={200} y={1080} txt="❓" p={rampa(t, M.responder - 0.6, 0.35)} tam={110} giro={8 * Math.sin(t * 4)} />
      <Sombra x={830} y={1510} w={220} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={420} t={t} cara="feliz" bd={-60 * pulso(t, M.carmen2 - 0.3, 1)} semilla={6} espejo />
      <Sombra x={560} y={1510} w={170} />
      <Mascota esp="conejo" x={560} y={1515} alto={300} t={t} cara="feliz" bi={-50 * pulso(t, M.clientes - 0.3, 1)} semilla={5} />
      <Sombra x={200} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={200} y={1515} alto={360} t={t} cara={t > M.responder - 0.6 ? "triste" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–7 · Planificar la gestión del alcance y su plan ═════ */
function Alcance({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const enHoja = rampa(t, S(5) - 0.4, 0.4);
  const V = [[M.definira, "definir"], [M.validara, "validar"], [M.controlara, "controlar"]];
  const FIL = [[M.enunciado, "📝", "enunciado del alcance"], [M.estructura, "🌳", "estructura de desglose del trabajo (EDT)"], [M.linea, "📏", "aprobar la línea base del alcance"], [M.aceptaran, "🤝", "aceptar formalmente los entregables"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <div style={{ opacity: 1 - enHoja }}>
        <Cartel x={540} y={330} txt="planificar la gestión del alcance" p={rampa(t, M.planificar - 0.3, 0.35)} tam={50} fondo={MANGO} />
        <Documento x={540} y={680} w={300} p={rampa(t, M.plan4 - 0.4, 0.4)} titulo="plan" letra={56} />
        {V.map(([tw, txt], k) => <Cartel key={k} x={200 + k * 340} y={1000} txt={txt} p={rampa(t, tw - 0.3, 0.3)} tam={46} fondo={CREMA} giro={(k - 1) * 3} />)}
      </div>
      <Hoja x={540} y={260} w={960} h={680} p={enHoja} titulo="plan de gestión del alcance" filas={FIL} t={t} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bi={-50 * pulso(t, M.plan5 - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–9 · El compañero: plan de gestión de los requisitos ═════ */
function Requisitos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.02, x: 540, y: 960 }]);
  const FIL = [[M.analizaran, "🔎", "analizar, documentar y gestionar"], [M.priorizan, "🔢", "cómo se priorizan"], [M.autoriza, "🔐", "quién autoriza los cambios"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="🤝 su compañero" p={rampa(t, M.companero - 0.4, 0.35)} tam={54} fondo={MANGO} />
      <Hoja x={540} y={380} w={960} h={560} p={rampa(t, M.requisitos8 - 0.8, 0.4)} titulo="plan de gestión de los requisitos" filas={FIL} t={t} col={COLOR.VERDE} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bd={-50 * pulso(t, M.autoriza - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 10 · Los dos, dentro del plan para la dirección ═════ */
function Ambos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Carpeta x={540} y={320} w={940} h={760} p={rampa(t, S(10) - 0.3, 0.4)}>
        <div style={{ position: "absolute", left: 60, top: 190, transform: `scale(${rebote(rampa(t, M.dos - 0.2, 0.35))})` }}>
          <Documento x={170} y={200} w={280} p={1} titulo="gestión del alcance" letra={34} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 190, transform: `scale(${rebote(rampa(t, M.dos, 0.35))})` }}>
          <Documento x={170} y={200} w={280} p={1} titulo="gestión de los requisitos" letra={34} />
        </div>
      </Carpeta>
      <Cartel x={250} y={1140} txt="formal" p={rampa(t, M.formal - 0.3, 0.3)} tam={50} fondo="#DDE3FF" giro={-3} />
      <Cartel x={560} y={1140} txt="informal" p={rampa(t, M.informal - 0.3, 0.3)} tam={50} fondo="#FFE1D8" giro={3} />
      <Cartel x={400} y={1260} txt="(el del alcance)" p={rampa(t, M.formal - 0.3, 0.3)} tam={36} fondo={CREMA} />
      <Sombra x={860} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={860} y={1515} alto={300} t={t} cara="estrellas" semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 11 · Escribe cómo se aceptarán tus entregables ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="🤝 ¿cómo se aceptan?" p={rampa(t, M.toca - 0.2, 0.35)} tam={68} fondo={MANGO} />
      <Documento x={540} y={760} w={300} p={rampa(t, M.aceptaran11 - 0.4, 0.4)} titulo="aceptación" letra={44} sello={rampa(t, M.proyecto11 - 0.3, 0.4)} giro={-3} />
      <Sombra x={250} y={1530} w={230} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11 - 0.2, 0.5)} semilla={3} />
      <Sombra x={820} y={1530} w={230} />
      <Mascota esp="gato-gafas" x={820} y={1535} alto={450} t={t} cara="feliz" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "pedidos") return <Pedidos t={t} />;
  if (p.tipo === "alcance") return <Alcance t={t} />;
  if (p.tipo === "requisitos") return <Requisitos t={t} />;
  if (p.tipo === "ambos") return <Ambos t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.sombrilla - 0.3, "pop", 0.35); fx(M.nevera - 0.4, "golpe", 0.3); fx(M.decide - 0.4, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [M.carmen2, M.clientes, M.nuevo].forEach((w) => fx(w - 0.3, "pop", 0.3)); fx(M.falto - 0.4, "suspiro", 0.3);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.planificar - 0.3, "pop", 0.35); fx(M.plan4 - 0.4, "papel", 0.3); [M.definira, M.validara, M.controlara].forEach((w) => fx(w - 0.3, "pop-suave", 0.22));
fx(S(5) - 0.4, "papel", 0.35); [M.enunciado, M.estructura, M.linea, M.aceptaran].forEach((w) => fx(w - 0.4, "pop", 0.25));
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.requisitos8 - 0.8, "papel", 0.35); [M.analizaran, M.priorizan, M.autoriza].forEach((w) => fx(w - 0.4, "pop", 0.25));
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.dos - 0.2, "papel", 0.3); fx(M.formal - 0.3, "pop-suave", 0.25); fx(M.informal - 0.3, "pop-suave", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(M.proyecto11 - 0.3, "sello", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(alcance|planificar|gestión|enunciado|estructura|línea|entregables|requisitos|formal|informal)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP23 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp23-alcance-v2.mp3" sinSonido={sinSonido} />
);
