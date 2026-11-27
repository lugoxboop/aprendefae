/*
 * Gestión de Proyectos · GP-06 «Tres sedes no son un proyecto gigante» (gp06-tres-sedes).
 * Una idea: un programa es un grupo de proyectos relacionados gestionados de manera
 * coordinada para obtener beneficios que no se obtendrían por separado; los programas
 * no son proyectos grandes (eso es un megaproyecto); un portafolio son proyectos,
 * programas y operaciones gestionados como grupo para objetivos estratégicos (G 1.2.3.1, p. 11).
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, Monedas, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Local, Tachon, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35, 0.35, 0.3, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  programa1: W(1, "programa", 0.15), grande: W(1, "grande.", 0.6), mira: W(1, "Mira", 0.8),
  suena: W(2, "sueña", 0.2), tres: W(2, "tres", 0.5), ciudad2: W(2, "ciudad.", 0.95),
  proyecto3: W(3, "proyecto:", 0.3), obra: W(3, "obra,", 0.5), permiso: W(3, "permiso,", 0.7), apertura: W(3, "apertura.", 0.95),
  juntas: W(4, "juntas,", 0.25), hornos: W(4, "hornos", 0.45), mayor: W(4, "mayor", 0.6), capacita: W(4, "capacita", 0.75), vez: W(4, "vez.", 0.95),
  ahorro: W(5, "ahorro", 0.15), lado: W(5, "lado.", 0.95),
  programa6: W(6, "programa:", 0.15), relacionados: W(6, "relacionados,", 0.3), coordinada: W(6, "coordinada,", 0.5), beneficios: W(6, "beneficios", 0.7), solos: W(6, "solos", 0.85),
  enorme: W(7, "enorme,", 0.15), metro: W(7, "metro", 0.3), noes: W(7, "programa:", 0.6), mega: W(7, "megaproyecto.", 0.95),
  todo: W(8, "todo", 0.2), sedes8: W(8, "sedes,", 0.5), tienda: W(8, "tienda", 0.65), pan: W(8, "pan", 0.85),
  primero: W(9, "primero", 0.25), plata: W(9, "plata,", 0.5), negocio: W(9, "negocio.", 0.95),
  conjunto: W(10, "conjunto,", 0.1), grupo: W(10, "grupo", 0.35), objetivos: W(10, "objetivos", 0.55), portafolio: W(10, "portafolio.", 0.95),
  proyecto11: W(11, "Proyecto,", 0.05), programa11: W(11, "programa", 0.15), portafolio11: W(11, "portafolio:", 0.25), mirar: W(11, "mirar", 0.55), obra11: W(11, "obra.", 0.95),
  toca: W(12, "toca:", 0.15), proyecto12: W(12, "proyecto,", 0.55), programa12: W(12, "programa", 0.75), portafolio12: W(12, "portafolio?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "sedes", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "programa", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "mega", desde: S(7) - 0.3, entra: "barrido" },
  { tipo: "portafolio", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "lentes", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Recuadro con rótulo que agrupa cosas (programa, portafolio) */
function Caja({ x, y, w, h, p, txt, color = COLOR.VERDE, punteada = false }) {
  if (p <= 0) return null;
  const q = sale(Math.min(1, p));
  return (
    <div style={{ position: "absolute", left: x + (w * (1 - q)) / 2, top: y + (h * (1 - q)) / 2, width: w * q, height: h * q, border: `10px ${punteada ? "dashed" : "solid"} ${color}`, borderRadius: 40, background: "rgba(255,253,247,.25)", opacity: Math.min(1, p * 2) }}>
      {txt && <div style={{ position: "absolute", left: 30, top: -46, background: color, color: "#fff", border: `6px solid ${TINTA}`, borderRadius: 18, padding: "4px 22px 8px", fontFamily: "Sora", fontWeight: 800, fontSize: 52, whiteSpace: "nowrap" }}>{txt}</div>}
    </div>
  );
}

/* ═════ 1 · Un programa no es un proyecto grande ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(5px)" velo={0.15}>
      <Ficha x={280} y={640} w={330} icono="🗂️" txt="programa" p={rampa(t, M.programa1 - 0.3, 0.4)} fondo={COLOR.VERDE} />
      <Gigante x={540} y={600} txt="≠" p={rampa(t, M.grande - 0.6, 0.35)} tam={200} color={ROJO} />
      <Ficha x={800} y={640} w={330} icono="🏗️" txt="proyecto grande" p={rampa(t, M.grande - 0.4, 0.4)} />
      <Sombra x={540} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={540} t={t} cara="guino" bi={-60 * pulso(t, M.mira - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–5 · Tres sedes: cada una un proyecto; juntas, un ahorro ═════ */
function Sedes({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: S(4) + 0.6, s: 1.0, x: 540, y: 940 }]);
  const xs = [200, 540, 880];
  const junta = sale(rampa(t, M.juntas - 0.3, 0.6));
  const pSub = [M.obra, M.permiso, M.apertura];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(3px)" velo={0.1}>
      {xs.map((x, k) => {
        const p = rampa(t, M.tres - 0.3 + k * 0.2, 0.4);
        if (p <= 0) return null;
        return (
          <div key={k}>
            <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${0.5 * rebote(Math.min(1, p))})`, transformOrigin: `${x}px 760px` }}>
              <Local x={x} y={760} w={460} alto={1} toldo={1} letrero={1} nombre={`Pía ${k + 2}`} t={t} />
            </div>
            <Cartel x={x} y={300} txt="proyecto" p={rampa(t, M.proyecto3 - 0.3 + k * 0.12, 0.35)} tam={48} fondo={AZUL} color="#fff" />
            {["🧱", "📄", "🎀"].map((ic, j) => <Gigante key={j} x={x - 80 + j * 80} y={850} txt={ic} p={rampa(t, pSub[j] - 0.3, 0.3)} tam={64} />)}
          </div>
        );
      })}
      <Caja x={50} y={210} w={980} h={720} p={rampa(t, M.juntas - 0.3, 0.5)} color={COLOR.VERDE} />
      {/* lo que se gana juntas */}
      <Ficha x={300} y={1100} w={260} icono="🔥" txt="hornos al por mayor" p={rampa(t, M.hornos - 0.3, 0.4) * junta} />
      <Ficha x={780} y={1100} w={260} icono="👩‍🍳" txt="capacitación juntos" p={rampa(t, M.capacita - 0.3, 0.4) * junta} />
      <Cartel x={540} y={1290} txt="💰 ahorro" p={rampa(t, M.ahorro - 0.3, 0.35)} tam={80} fondo={COLOR.VERDE} color="#fff" />
      <Cartel x={540} y={1410} txt="cada sede por su lado: sin ahorro" p={rampa(t, M.lado - 0.6, 0.35)} tam={52} fondo={CREMA} giro={-2} />
      <Sombra x={150} y={1530} w={180} />
      <Mascota esp="hamster-gorra" x={150} y={1535} alto={330} t={t} cara={t > M.ahorro ? "estrellas" : "feliz"} bi={-60 * pulso(t, M.suena - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 6 · El nombre: programa ═════ */
function Programa({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.03, x: 540, y: 990 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.15}>
      <Pizarra x={50} y={220} w={980} h={1240}>
        <Tiza x={460} y={30} txt="programa" p={rampa(t, Math.min(M.programa6 - 0.2, S(6)), 0.5)} tam={130} centro color={MANGO} />
        <Tiza x={60} y={230} txt="• proyectos relacionados" p={rampa(t, M.relacionados - 0.4, 0.5)} tam={78} />
        <Tiza x={60} y={360} txt="• gestionados de forma" p={rampa(t, M.coordinada - 0.6, 0.4)} tam={78} />
        <Tiza x={100} y={450} txt="coordinada" p={rampa(t, M.coordinada - 0.2, 0.4)} tam={78} color="#9FE0B4" />
        <Tiza x={60} y={580} txt="• beneficios que solos" p={rampa(t, M.beneficios - 0.3, 0.5)} tam={78} />
        <Tiza x={100} y={670} txt="no darían" p={rampa(t, M.solos - 0.2, 0.4)} tam={78} color="#9FE0B4" />
        {[0, 1, 2].map((k) => <Gigante key={k} x={260 + k * 200} y={950} txt="🏪" p={rampa(t, M.relacionados - 0.2 + k * 0.1, 0.3)} tam={110} />)}
        <TrazoTiza d="M 140 870 Q 460 820 780 870 L 780 1040 Q 460 1090 140 1040 Z" p={rampa(t, M.coordinada - 0.3, 0.8)} w={8} color="#9FE0B4" />
      </Pizarra>
    </Escena>
  );
}

/* ═════ 7 · Un metro: megaproyecto ═════ */
function Mega({ t }) {
  const cam = mover(t, { s: 1.15, x: 540, y: 900 }, [{ a: S(7), b: E(7), s: 1.0, x: 540, y: 968 }]);
  const x = lerp(1300, 380, sale(rampa(t, M.metro - 0.5, 1.2)));
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg">
      {/* el metro: un tren larguísimo */}
      <div style={{ position: "absolute", left: x - 280, top: 820, width: 1500, height: 190, display: "flex", gap: 18 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ flex: "0 0 470px", height: 190, background: k === 0 ? AZUL : "#3A5BFF", border: `9px solid ${TINTA}`, borderRadius: k === 0 ? "90px 26px 26px 26px" : 26, position: "relative" }}>
            {[0, 1, 2, 3].map((j) => <div key={j} style={{ position: "absolute", left: 40 + j * 105, top: 30, width: 80, height: 70, background: "#CFE3FF", border: `6px solid ${TINTA}`, borderRadius: 12 }} />)}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 1010, width: 1080, height: 26, background: TINTA }} />
      <Cartel x={540} y={420} txt="megaproyecto" p={rampa(t, M.mega - 0.6, 0.35)} tam={96} fondo={MANGO} giro={-3} />
      <Cartel x={540} y={600} txt="programa" p={rampa(t, M.noes - 0.4, 0.35)} tam={64} />
      <Tachon x={540} y={600} w={380} p={rampa(t, M.noes - 0.1, 0.3)} />
      <Sombra x={830} y={1510} w={240} />
      <Mascota esp="hamster-gorra" x={830} y={1515} alto={460} t={t} cara="estrellas" cab={-10} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 8–10 · Todo lo de la panadería: portafolio ═════ */
function Portafolio({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.03, x: 540, y: 950 }]);
  const cosas = [[M.sedes8, "🗂️", "las sedes", 260, 560], [M.tienda, "🛒", "tienda en línea", 800, 560], [M.pan, "🥖", "pan de cada día", 530, 900]];
  const orden = [M.primero, M.primero + 0.3, M.primero + 0.6];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(3px)" velo={0.1}>
      <Caja x={60} y={340} w={960} h={760} p={rampa(t, M.conjunto - 0.3, 0.5)} txt="portafolio" color={AZUL} />
      {cosas.map(([tw, ic, txt, x, y], k) => (
        <div key={k}>
          <Ficha x={x} y={y} w={280} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.4)} />
          <Gigante x={x - 130} y={y - 150} txt={String(k + 1)} p={rampa(t, orden[k] - 0.2, 0.3)} tam={90} color={MANGO} />
        </div>
      ))}
      <Monedas t={t} t0={M.plata - 0.5} n={5} x0={540} y0={1300} x1={260} y1={540} w={60} alto={200} />
      <Cartel x={560} y={1160} txt="🎯 objetivos estratégicos" p={rampa(t, M.objetivos - 0.3, 0.35)} tam={58} fondo={MANGO} />
      <Sombra x={150} y={1520} w={200} />
      <Mascota esp="hamster-gorra" x={150} y={1525} alto={300} t={t} cara="tranquila" cab={-8 * pulso(t, M.todo - 0.3, 1.5)} bd={-60 * pulso(t, M.primero - 0.3, 1.2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Tres maneras de mirar ═════ */
function Lentes({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.02, x: 540, y: 980 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(7px)" velo={0.3}>
      <Caja x={60} y={300} w={960} h={1050} p={rampa(t, M.portafolio11 - 0.3, 0.5)} txt="portafolio" color={AZUL} />
      <Caja x={140} y={480} w={800} h={560} p={rampa(t, M.programa11 - 0.3, 0.5)} txt="programa" color={COLOR.VERDE} />
      <Ficha x={330} y={810} w={260} icono="🏪" txt="proyecto" p={rampa(t, M.proyecto11 - 0.3, 0.4)} fondo={MANGO} />
      <Ficha x={750} y={810} w={260} icono="🏪" txt="proyecto" p={rampa(t, M.proyecto11 - 0.1, 0.4)} fondo={MANGO} />
      <Ficha x={540} y={1240} w={240} icono="🥖" txt="operación" p={rampa(t, M.portafolio11, 0.4)} />
      <Cartel x={540} y={1470} txt="👀 maneras de mirar" p={rampa(t, M.mirar - 0.3, 0.35)} tam={62} fondo={CREMA} />
    </Escena>
  );
}

/* ═════ 12 · Clasifica ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={420} txt="proyecto" p={rampa(t, M.proyecto12 - 0.3, 0.35)} tam={72} fondo={MANGO} giro={-3} />
      <Cartel x={540} y={580} txt="programa" p={rampa(t, M.programa12 - 0.3, 0.35)} tam={72} fondo={COLOR.VERDE} color="#fff" giro={2} />
      <Cartel x={540} y={740} txt="portafolio" p={rampa(t, M.portafolio12 - 0.3, 0.35)} tam={72} fondo={AZUL} color="#fff" giro={-2} />
      <Gigante x={860} y={600} txt="?" p={rampa(t, M.toca - 0.2, 0.35)} tam={200} color={MANGO} giro={8} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={560} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.portafolio12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "sedes") return <Sedes t={t} />;
  if (p.tipo === "programa") return <Programa t={t} />;
  if (p.tipo === "mega") return <Mega t={t} />;
  if (p.tipo === "portafolio") return <Portafolio t={t} />;
  if (p.tipo === "lentes") return <Lentes t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.programa1 - 0.3, "pop", 0.4); fx(M.grande - 0.6, "toc-grave", 0.4); fx(M.grande - 0.4, "pop", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [0, 1, 2].forEach((k) => fx(M.tres - 0.3 + k * 0.2, "pop", 0.35));
[M.obra, M.permiso, M.apertura].forEach((w) => fx(w - 0.3, "pop-suave", 0.3));
fx(M.juntas - 0.3, "desliza", 0.4); fx(M.hornos - 0.3, "pop", 0.35); fx(M.capacita - 0.3, "pop", 0.35); fx(M.ahorro - 0.3, "monedas", 0.4); fx(M.lado - 0.6, "toc", 0.3);
fx(S(6) - 0.3, "barrido-lento", 0.35); fx(S(6), "tiza-larga", 0.4); [M.relacionados, M.coordinada, M.beneficios].forEach((w) => fx(w - 0.4, "tiza", 0.35));
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.metro - 0.5, "camion", 0.35); fx(M.noes - 0.1, "toc", 0.35); fx(M.mega - 0.6, "campana", 0.4);
fx(S(8) - 0.3, "whoosh", 0.4); [M.sedes8, M.tienda, M.pan].forEach((w) => fx(w - 0.3, "pop", 0.35));
[0, 1, 2].forEach((k) => fx(M.primero - 0.2 + k * 0.3, "toc", 0.3)); fx(M.plata - 0.5, "monedas", 0.35);
fx(M.conjunto - 0.3, "desliza", 0.35); fx(M.objetivos - 0.3, "ding", 0.35);
fx(S(11) - 0.3, "barrido-lento", 0.35); fx(M.proyecto11 - 0.3, "pop", 0.3); fx(M.programa11 - 0.3, "pop", 0.3); fx(M.portafolio11 - 0.3, "pop", 0.3);
fx(M.proyecto12 - 0.3, "pop", 0.35); fx(M.programa12 - 0.3, "pop", 0.35); fx(M.portafolio12 - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/ciudad.jpg", "art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(programa|programa:|proyecto|proyecto:|proyectos|portafolio|portafolio\.|portafolio:|portafolio\?|megaproyecto\.|coordinada,|beneficios|estratégicos,)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP06 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp06-tres-sedes.mp3" sinSonido={sinSonido} />
);
