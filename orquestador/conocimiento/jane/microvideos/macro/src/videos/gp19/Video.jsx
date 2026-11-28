/*
 * Gestión de Proyectos · GP-19 «Mandar no es lo mismo que liderar» (gp19-liderar).
 * Una idea: gestión y liderazgo no son sinónimos (3.4.5, p. 64). Gestionar: dirigir a otro de
 * un punto a otro con comportamientos esperados conocidos; liderar: guiarlo con discusión o
 * debate. Tabla 3-1: poder de la posición / de las relaciones; hacer las cosas correctamente /
 * las cosas correctas; corto plazo, sistemas / visión a largo alcance, personas; cómo y cuándo /
 * qué y por qué. El director necesita ambos, en equilibrio para cada situación. Integración en
 * tres niveles: proceso, cognitivo y contextual (3.5, p. 66–67).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Horno, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  mandar: W(1, "Gestionar", 0.1), liderar1: W(1, "liderar.", 0.9),
  horno: W(2, "horno,", 0.25), cien: W(2, "cien", 0.65), hoy: W(2, "hoy.", 0.95),
  gestiona: W(3, "gestiona:", 0.15), turnos: W(3, "turnos,", 0.35), reloj: W(3, "reloj", 0.55), como3: W(3, "cómo", 0.8), cuando3: W(3, "cuándo.", 0.95),
  reune: W(4, "reúne", 0.15), que4: W(4, "qué", 0.35), porque4: W(4, "qué,", 0.45), debaten: W(4, "debaten", 0.8), salida: W(4, "salida.", 0.95),
  gestionar: W(5, "Gestionar", 0.05), punto: W(5, "punto", 0.3), conocidos: W(5, "conocidos,", 0.6), posicion: W(5, "posición.", 0.95),
  liderar6: W(6, "Liderar", 0.05), debate: W(6, "debate,", 0.45), relaciones: W(6, "relaciones.", 0.95),
  correctamente: W(7, "correctamente;", 0.45), correctas: W(7, "correctas.", 0.95),
  corto: W(8, "corto", 0.2), sistemas: W(8, "sistemas;", 0.45), largo: W(8, "largo", 0.75), personas: W(8, "personas.", 0.95),
  sinonimos: W(9, "sinónimos,", 0.15), dos: W(9, "dos:", 0.45), equilibrio: W(9, "equilibrio", 0.8), situacion: W(9, "situación.", 0.95),
  niveles: W(10, "niveles:", 0.2), procesos: W(10, "procesos", 0.4), aplica: W(10, "aplica", 0.65), contexto: W(10, "contexto.", 0.95),
  toca: W(11, "toca:", 0.15), gestionando: W(11, "gestionando", 0.75), liderando: W(11, "liderando?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "horno", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "tabla", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "equilibrio", desde: S(9) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Filas de la Tabla 3-1 que dice la voz: [palabra, gestión, liderazgo] */
const FILAS = [
  [() => M.conocidos, () => M.debate, "🧾", "pasos ya conocidos", "💬", "discusión y debate"],
  [() => M.posicion, () => M.relaciones, "🪪", "poder de la posición", "🤝", "poder de las relaciones"],
  [() => M.correctamente, () => M.correctas, "✔️", "las cosas correctamente", "🎯", "las cosas correctas"],
  [() => M.corto, () => M.largo, "⚙️", "corto plazo y sistemas", "🔭", "largo plazo y personas"],
];

/* ═════ 1 · Mandar ≠ liderar ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Ficha x={270} y={600} w={330} icono="👉" txt="gestionar" p={rampa(t, M.mandar - 0.3, 0.35)} fondo="#DDE3FF" giro={-4} letra={54} />
      <Ficha x={810} y={600} w={330} icono="🤝" txt="liderar" p={rampa(t, M.liderar1 - 0.4, 0.35)} fondo="#FFE1D8" giro={4} letra={54} />
      <Gigante x={540} y={560} txt="≠" p={rampa(t, M.liderar1 - 0.1, 0.35)} tam={200} color={ROJO} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara="tranquila" cab={-5 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–4 · El horno se daña: primero gestiona, luego lidera ═════ */
function HornoEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.04, x: 540, y: 960 }]);
  const dano = rampa(t, M.horno - 0.3, 0.3);
  const ges = rampa(t, M.gestiona - 0.4, 0.35) * (1 - rampa(t, M.reune - 0.5, 0.3));
  const lid = rampa(t, M.reune - 0.3, 0.4);
  const temb = dano > 0 && t < M.horno + 1 ? 8 * Math.sin(t * 60) : 0;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.15}>
      <div style={{ opacity: 1 - 0.75 * lid, transform: `translateX(${temb}px)` }}>
        <Horno x={540} y={720} w={330} brillo={0.6 * (1 - dano)} />
        <Gigante x={640} y={380} txt="💨" p={dano} tam={110} giro={10 * Math.sin(t * 3)} />
        <Gigante x={420} y={420} txt="💥" p={rampa(t, M.horno - 0.2, 0.3)} tam={110} />
      </div>
      <Cartel x={540} y={260} txt="🍞 100 panes, hoy" p={rampa(t, M.cien - 0.4, 0.35)} tam={60} fondo={MANGO} />
      {/* gestiona */}
      <div style={{ opacity: ges }}>
        <Ficha x={230} y={900} w={230} icono="🗓️" txt="turnos" p={rampa(t, M.turnos - 0.35, 0.35)} letra={38} />
        <Ficha x={850} y={900} w={230} icono="⏰" txt="el reloj" p={rampa(t, M.reloj - 0.35, 0.35)} letra={38} />
        <Cartel x={540} y={1070} txt="¿cómo? ¿cuándo?" p={rampa(t, M.como3 - 0.35, 0.35)} tam={58} fondo="#DDE3FF" />
        <Cartel x={230} y={620} txt="gestiona" p={rampa(t, M.gestiona - 0.3, 0.35)} tam={54} fondo={AZUL} color="#fff" giro={-3} />
      </div>
      {/* lidera */}
      <Dicho x={240} y={330} w={600} h={190} colaX={540} p={rampa(t, M.que4 - 0.3, 0.35)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 58, color: TINTA }}>¿qué? ¿por qué?</div>
      </Dicho>
      <Gigante x={540} y={760} txt="💡" p={rampa(t, M.debaten - 0.2, 0.35)} tam={130} giro={6 * Math.sin(t * 5)} />
      {[["gato-gafas", 170, 6, 440], ["perro-mochila", 870, 12, 400]].map(([esp, x, sem, alto], k) => (
        <div key={k} style={{ opacity: lid, transform: `translateX(${(1 - sale(lid)) * (k ? 300 : -300)}px)` }}>
          <Sombra x={x} y={1510} w={200} />
          <Mascota esp={esp} x={x} y={1515} alto={alto} t={t} cara={t > M.debaten ? "feliz" : "tranquila"} bi={-50 * pulso(t, M.debaten - 0.3 + k * 0.4, 0.8)} semilla={sem} espejo={k === 1} />
        </div>
      ))}
      <Sombra x={540} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={400} t={t} cara={lid > 0.5 ? "feliz" : dano > 0 && t < M.gestiona ? "triste" : "tranquila"} bd={-70 * pulso(t, M.turnos - 0.3, 1.4)} bi={-60 * pulso(t, M.que4 - 0.3, 1.2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–8 · La Tabla 3-1: gestión frente a liderazgo ═════ */
function Tabla({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8) - 0.2, b: E(8), s: 1.02, x: 540, y: 960 }]);
  const cab = [[M.gestionar, "gestión", AZUL, 280], [M.liderar6, "liderazgo", COLOR.CORAL, 800]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {cab.map(([tw, txt, col, x], k) => <Cartel key={k} x={x} y={300} txt={txt} p={rampa(t, tw - 0.3, 0.35)} tam={62} fondo={col} color="#fff" />)}
      <div style={{ position: "absolute", left: 536, top: 380, width: 8, height: 870, background: TINTA, opacity: 0.25 * rampa(t, S(5) - 0.2, 0.4), borderRadius: 4 }} />
      {FILAS.map(([fg, fl, ig, tg, il, tl], k) => {
        const qg = rampa(t, fg() - 0.4, 0.35);
        const ql = rampa(t, fl() - 0.4, 0.35);
        const y = 420 + k * 215;
        const caja = (q, x, ic, txt, fondo) => q > 0 && (
          <div style={{ position: "absolute", left: x, top: y, width: 470, height: 185, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", background: fondo, border: `7px solid ${TINTA}`, borderRadius: 24, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)})`, opacity: Math.min(1, q * 3), boxShadow: "0 9px 0 rgba(42,30,23,.25)" }}>
            <span style={{ fontSize: 76 }}>{ic}</span>
            <span style={{ fontSize: 37, lineHeight: 1.1 }}>{txt}</span>
          </div>
        );
        return <div key={k}>{caja(qg, 40, ig, tg, "#DDE3FF")}{caja(ql, 570, il, tl, "#FFE1D8")}</div>;
      })}
      <Sombra x={540} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={250} t={t} cara="feliz" cab={6 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · Las dos, en equilibrio; integrar en tres niveles ═════ */
function Equilibrio({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pB = rampa(t, M.dos - 0.4, 0.4);
  const ang = 14 * Math.sin(t * 2.2) * (1 - sale(rampa(t, M.equilibrio - 0.4, 1.2)));
  const niv = rampa(t, M.niveles - 0.4, 0.4);
  const NIV = [[M.procesos, "🔗", "procesos: unirlos donde se cruzan"], [M.aplica, "🧠", "cognitivo: lo que sabe y aplica"], [M.contexto, "🌐", "contexto: lo que pasa alrededor"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <div style={{ opacity: 1 - niv }}>
        <Cartel x={540} y={300} txt="no son sinónimos" p={rampa(t, M.sinonimos - 0.4, 0.35)} tam={60} fondo={ROJO} color="#fff" giro={-2} />
        {pB > 0 && (
          <div style={{ position: "absolute", left: 540, top: 720, transform: `scale(${rebote(pB)})` }}>
            <div style={{ position: "absolute", left: -12, top: 0, width: 24, height: 330, background: TINTA, borderRadius: 12 }} />
            <div style={{ position: "absolute", left: -90, top: 310, width: 180, height: 40, background: TINTA, borderRadius: 14 }} />
            <div style={{ position: "absolute", left: -380, top: -12, width: 760, height: 24, background: TINTA, borderRadius: 12, transform: `rotate(${ang}deg)` }}>
              {[[0, "gestión", AZUL, "👉"], [1, "liderazgo", COLOR.CORAL, "🤝"]].map(([k, txt, col, ic]) => (
                <div key={k} style={{ position: "absolute", left: k ? 600 : -40, top: 12, width: 200, transform: `rotate(${-ang}deg)`, transformOrigin: "50% 0" }}>
                  <div style={{ marginLeft: 96, width: 8, height: 100, background: TINTA }} />
                  <div style={{ background: col, border: `7px solid ${TINTA}`, borderRadius: "0 0 90px 90px", height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 36 }}><span style={{ fontSize: 58 }}>{ic}</span>{txt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Cartel x={540} y={1180} txt="⚖️ equilibrio para cada situación" p={rampa(t, M.equilibrio - 0.3, 0.35)} tam={48} fondo={COLOR.VERDE} color="#fff" />
      </div>
      <Cartel x={540} y={300} txt="integra en 3 niveles" p={niv} tam={60} fondo={MANGO} />
      {NIV.map(([tw, ic, txt], k) => {
        const q = rampa(t, tw - 0.5, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 80, top: 440 + k * 230, width: 920, height: 190, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, padding: "0 28px", background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 26, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)})`, boxShadow: "0 9px 0 rgba(42,30,23,.25)" }}>
            <span style={{ fontSize: 90 }}>{ic}</span><span style={{ fontSize: 44, lineHeight: 1.1 }}>{txt}</span>
          </div>
        );
      })}
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.equilibrio ? "estrellas" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · ¿Gestionando o liderando? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const elige = Math.sin(t * 3) > 0;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="⚡ ¿gestiona o lidera?" p={rampa(t, M.toca - 0.2, 0.35)} tam={66} fondo={MANGO} />
      <Ficha x={290} y={720} w={300} icono="👉" txt="gestiona" p={rampa(t, M.gestionando - 0.4, 0.35)} fondo="#DDE3FF" letra={46} giro={elige ? -6 : 0} />
      <Ficha x={790} y={720} w={300} icono="🤝" txt="lidera" p={rampa(t, M.liderando - 0.4, 0.35)} fondo="#FFE1D8" letra={46} giro={elige ? 0 : 6} />
      <Sombra x={540} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.liderando - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "horno") return <HornoEsc t={t} />;
  if (p.tipo === "tabla") return <Tabla t={t} />;
  if (p.tipo === "equilibrio") return <Equilibrio t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.mandar - 0.3, "pop", 0.35); fx(M.liderar1 - 0.4, "pop", 0.35); fx(M.liderar1 - 0.1, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.horno - 0.3, "golpe", 0.4); fx(M.cien - 0.4, "pop", 0.3);
fx(M.gestiona - 0.3, "pop", 0.3); fx(M.turnos - 0.35, "papel", 0.3); fx(M.reloj - 0.35, "toc", 0.3); fx(M.como3 - 0.35, "pop-suave", 0.3);
fx(M.reune - 0.3, "pasos", 0.3); fx(M.que4 - 0.3, "pop", 0.3); fx(M.debaten - 0.2, "ding", 0.35);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.gestionar - 0.3, "pop", 0.3); fx(M.liderar6 - 0.3, "pop", 0.3);
FILAS.forEach(([fg, fl]) => { fx(fg() - 0.4, "desliza", 0.25); fx(fl() - 0.4, "desliza", 0.25); });
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.sinonimos - 0.4, "toc-grave", 0.3); fx(M.dos - 0.4, "pop", 0.3); fx(M.equilibrio - 0.3, "campana", 0.35);
fx(M.niveles - 0.4, "whoosh", 0.3); [M.procesos, M.aplica, M.contexto].forEach((w) => fx(w - 0.5, "sube", 0.3));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(gestiona|gestionar|gestión|liderar|liderazgo|correctamente|correctas|sinónimos|equilibrio|niveles|posición|relaciones)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP19 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp19-liderar-v2.mp3" sinSonido={sinSonido} />
);
