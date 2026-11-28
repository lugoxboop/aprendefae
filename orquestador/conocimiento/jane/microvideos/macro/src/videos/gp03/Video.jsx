/*
 * Gestión de Proyectos · GP-03 «Del mostrador al celular» (gp03-mostrador-celular).
 * Una idea: un proyecto lleva a la organización de un estado actual a un estado
 * futuro (G p. 6, Gráfico 1-1) para crear valor del negocio, tangible o intangible
 * (G p. 7: dinero; reputación, reconocimiento de marca…).
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, Monedas, Pan, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Local, Tachon, Celular, Estrellas, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.35, 0.3, 0.3, 0.35, 0.3, 0.35, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  nadie: W(1, "Nadie", 0.1), proyecto1: W(1, "proyecto.", 0.4), cambia: W(1, "cambia", 0.75), despues: W(1, "después.", 0.95),
  hoy: W(2, "Hoy,", 0.1), puerta: W(2, "puerta.", 0.95),
  domingos: W(3, "domingos,", 0.15), fila: W(3, "fila", 0.3), cuadra: W(3, "cuadra,", 0.55), van: W(3, "van", 0.8),
  imagina: W(4, "imagina", 0.25), celular: W(4, "celular", 0.7), domicilios: W(4, "domicilios.", 0.95),
  camino5: W(5, "camino:", 0.35), fotos: W(5, "fotos,", 0.5), menu: W(5, "menú,", 0.7), domiciliario: W(5, "domiciliario.", 0.95),
  camino6: W(6, "camino", 0.3), proyecto6: W(6, "proyecto.", 0.9),
  vende: W(7, "vende", 0.3), pesos: W(7, "pesos.", 0.95),
  recomiendan: W(8, "recomiendan", 0.25), caja: W(8, "caja,", 0.6), vale: W(8, "vale.", 0.95),
  actual: W(9, "actual", 0.65), futuro: W(9, "futuro.", 0.95),
  valor: W(10, "valor", 0.3), tangible: W(10, "tangible,", 0.5), dinero: W(10, "dinero,", 0.6), intangible: W(10, "intangible,", 0.75), reputacion: W(10, "reputación,", 0.85), ambos: W(10, "ambos.", 0.97),
  existe: W(11, "existe", 0.4), cambio11: W(11, "cambio.", 0.95),
  actual12: W(12, "actual", 0.35), idea: W(12, "idea,", 0.6), futuro12: W(12, "futuro?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "mostrador", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "fila", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "sueno", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "camino", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "valor", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "pizarra", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* La fila de clientes del domingo */
const FILA = ["conejo", "gato", "panda", "zorro", "huron", "conejo-casco", "gato-gafas", "perro"];

/* ═════ 1 · Nadie quiere un proyecto ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 900 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const pC = rampa(t, M.cambia - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={420} txt="un proyecto" p={rampa(t, 0.05, 0.35)} tam={92} />
      <Tachon x={540} y={420} w={600} p={rampa(t, M.proyecto1 - 0.1, 0.3)} />
      <Flecha x0={540} y0={540} x1={540} y1={760} p={rampa(t, M.cambia - 0.45, 0.35)} />
      <Destello x={540} y={900} r={380} p={rampa(t, M.cambia - 0.3, 0.9)} />
      <Cartel x={540} y={900} txt="✨ lo que cambia" p={pC} tam={92} fondo={MANGO} giro={-3} />
      <Sombra x={540} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={520} t={t} cara={t > M.cambia ? "estrellas" : "tranquila"} cab={-6 * pulso(t, M.nadie, 1)} bi={-60 * pulso(t, M.cambia - 0.4, 1.1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2 · Hoy: solo vende a quien entra ═════ */
function Mostrador({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(2), b: E(2) + 0.3, s: 1.1, x: 560, y: 1000 }]);
  const entra = sale(rampa(t, M.hoy + 0.4, 1.3));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Cartel x={250} y={380} txt="HOY" p={rampa(t, M.hoy - 0.3, 0.35)} tam={100} fondo={AZUL} color="#fff" giro={-4} />
      {/* el mostrador */}
      <div style={{ position: "absolute", left: 520, top: 1180, width: 520, height: 330, background: "linear-gradient(#B57B4C,#8A5A35)", border: `8px solid ${TINTA}`, borderRadius: 18 }} />
      <div style={{ position: "absolute", left: 500, top: 1160, width: 560, height: 40, background: "#D9A066", border: `8px solid ${TINTA}`, borderRadius: 12 }} />
      {[0, 1, 2].map((k) => <Pan key={k} x={620 + k * 140} y={1140} w={120} giro={-8 + k * 8} />)}
      <Sombra x={790} y={1180} w={200} op={0} />
      <Mascota esp="hamster-gorra" x={790} y={1175} alto={400} t={t} cara="feliz" bd={-60 * pulso(t, M.puerta - 0.6, 1.1)} semilla={3} espejo />
      <Sombra x={lerp(-120, 290, entra)} y={1500} w={240} />
      <Mascota esp="conejo" x={lerp(-120, 290, entra)} y={1505} alto={470} t={t} cara="feliz" salto={entra < 1 ? 16 * Math.abs(Math.sin(t * 9)) : 0} semilla={5} />
      <Gigante x={270} y={760} txt="🚪" p={rampa(t, M.puerta - 0.5, 0.35)} tam={150} />
    </Escena>
  );
}

/* ═════ 3 · Los domingos, la fila ═════ */
function Fila({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: M.cuadra, s: 1.0, x: 540, y: 990 }, { a: M.van - 0.4, b: E(3) + 0.3, s: 1.05, x: 400, y: 1050 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg">
      <Cartel x={540} y={330} txt="domingo" p={rampa(t, M.domingos - 0.3, 0.35)} tam={84} fondo={MANGO} giro={3} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(.55)", transformOrigin: "980px 1220px" }}>
        <Local x={980} y={1220} w={420} alto={1} toldo={1} letrero={1} nombre="Pía" t={t} />
      </div>
      {FILA.map((esp, k) => {
        const p = rampa(t, M.fila - 0.4 + k * 0.12, 0.4);
        if (p <= 0) return null;
        const sevan = k >= 5 && t > M.van - 0.3;
        const sale_ = sevan ? sale(rampa(t, M.van - 0.3 + (k - 5) * 0.2, 1.2)) : 0;
        const x = 820 - k * 105 - sale_ * 500;
        const y = 1280 + (k % 2) * 40;
        return (
          <div key={esp} style={{ opacity: 1 - sale_ * 0.6 }}>
            <Mascota esp={esp} x={x} y={y} alto={300 * rebote(Math.min(1, p))} t={t} cara={sevan ? "triste" : "tranquila"} semilla={k} espejo={!sevan} />
          </div>
        );
      })}
      <Cartel x={250} y={920} txt="sin pan" p={rampa(t, M.van - 0.2, 0.35)} tam={62} fondo={ROJO} color="#fff" giro={-6} />
    </Escena>
  );
}

/* ═════ 4 · Pía se imagina otra panadería ═════ */
function Sueno({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 940 }, [{ a: S(4), b: E(4), s: 1.0, x: 540, y: 968 }]);
  const pG = rampa(t, M.imagina - 0.4, 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.1}>
      <Globo x={150} y={230} w={780} h={760} p={pG} cola="izq">
        <div style={{ position: "absolute", left: 0, top: 0, width: 780, height: 760 }}>
          <Celular x={230} y={380} w={260} p={rampa(t, M.imagina - 0.1, 0.4)} giro={-6}>
            <div style={{ padding: 14, fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA }}>
              <div style={{ background: MANGO, borderRadius: 10, padding: "6px 10px", border: `4px solid ${TINTA}` }}>Pía · pedidos</div>
              {["🥖 x2", "🥐 x4", "🍞 x1"].map((r, k) => <div key={r} style={{ marginTop: 14, opacity: rampa(t, M.celular - 0.2 + k * 0.2, 0.2) }}>{r}</div>)}
            </div>
          </Celular>
          <Gigante x={560} y={420} txt="🛵" p={rampa(t, M.domicilios - 0.5, 0.4)} tam={210} />
          <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${lerp(-40, 40, Math.sin(t * 2) * 0.5 + 0.5)}px)` }} />
        </div>
      </Globo>
      <Sombra x={330} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={330} y={1515} alto={560} t={t} cara="estrellas" cab={-8} bi={-40 * pulso(t, M.imagina - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–6 · Entre hoy y mañana, un camino: el proyecto ═════ */
function Camino({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6) - 0.2, b: E(6), s: 1.05, x: 540, y: 960 }]);
  const pasos = [[M.fotos, "📷", "fotos", 270, 1000], [M.menu, "📋", "menú", 540, 880], [M.domiciliario, "🛵", "domiciliario", 810, 1000]];
  /* Pía camina de piedra en piedra */
  const k = pasos.filter(([tw]) => t > tw - 0.2).length;
  const xs = [150, 300, 540, 780, 930], ys = [1250, 1150, 1080, 1150, 1250];
  const xP = lerp(xs[Math.max(0, k - 1)], xs[k], sale(rampa(t, k ? pasos[k - 1][0] - 0.2 : 0, 0.5)));
  const yP = lerp(ys[Math.max(0, k - 1)], ys[k], sale(rampa(t, k ? pasos[k - 1][0] - 0.2 : 0, 0.5)));
  const pProy = rampa(t, M.proyecto6 - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(4px)" velo={0.2}>
      <Ficha x={200} y={560} w={300} icono="🚪" txt="hoy" p={rampa(t, S(5), 0.4)} fondo={CREMA} />
      <Ficha x={880} y={560} w={300} icono="📱" txt="mañana" p={rampa(t, S(5) + 0.3, 0.4)} fondo={MANGO} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        <path d="M 150 1300 Q 540 960 930 1300" fill="none" stroke={TINTA} strokeWidth={70} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - rampa(t, M.camino5 - 0.4, 0.6))} />
        <path d="M 150 1300 Q 540 960 930 1300" fill="none" stroke={pProy > 0 ? MANGO : "#E9D6B8"} strokeWidth={54} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - rampa(t, M.camino5 - 0.4, 0.6))} />
      </svg>
      {pasos.map(([tw, ic, txt, x, y]) => <Ficha key={txt} x={x} y={y - 270} w={240} icono={ic} txt={txt} p={rampa(t, tw - 0.35, 0.4)} />)}
      <Destello x={540} y={1150} r={420} p={rampa(t, M.proyecto6 - 0.3, 0.9)} />
      <Cartel x={540} y={1420} txt="el proyecto" p={pProy} tam={92} fondo={MANGO} giro={-2} />
      <Mascota esp="hamster-gorra" x={xP} y={yP + 60} alto={330} t={t} cara="feliz" salto={30 * Math.abs(Math.sin(t * 6)) * (k < 3 ? 1 : 0)} semilla={3} />
    </Escena>
  );
}

/* ═════ 7–8 · Lo que gana Pía: pesos y reputación ═════ */
function Valor({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8) - 0.2, b: E(8), s: 1.05, x: 560, y: 960 }]);
  const n = Math.round(lerp(0, 120, sale(rampa(t, M.vende - 0.2, M.pesos - M.vende + 0.3))));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Cartel x={340} y={360} txt="📈 vende más" p={rampa(t, M.vende - 0.3, 0.35)} tam={70} fondo={COLOR.VERDE} color="#fff" />
      {/* la caja registradora */}
      <div style={{ position: "absolute", left: 160, top: 560, width: 280, height: 200, background: "#596579", border: `8px solid ${TINTA}`, borderRadius: 20 }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 18, height: 60, background: "#9FE0B4", border: `5px solid ${TINTA}`, borderRadius: 8, fontFamily: "Sora", fontWeight: 800, fontSize: 40, textAlign: "center", lineHeight: "50px", color: TINTA }}>$</div>
      </div>
      <Monedas t={t} t0={M.pesos - 0.6} n={6} x0={300} y0={420} x1={300} y1={620} w={70} alto={160} />
      <Cartel x={300} y={850} txt="en pesos" p={rampa(t, M.pesos - 0.3, 0.35)} tam={62} />
      {/* la reputación: no cabe en la caja */}
      <Celular x={790} y={640} w={240} p={rampa(t, M.recomiendan - 0.4, 0.4)} giro={5}>
        <div style={{ padding: 12, fontFamily: "Sora", fontWeight: 800, fontSize: 24, color: TINTA, textAlign: "center" }}>
          <div style={{ marginTop: 20 }}>Panadería Pía</div>
          <div style={{ marginTop: 18, fontSize: 34 }}>❤️ 💬</div>
          <div style={{ marginTop: 18, fontSize: 22 }}>«¡La recomiendo!»</div>
        </div>
      </Celular>
      <Estrellas x={790} y={950} tam={64} p={rampa(t, M.recomiendan, 1)} />
      <Gigante x={300} y={660} txt="✗" p={rampa(t, M.caja - 0.3, 0.35) * (1 - rampa(t, M.vale - 0.5, 0.3))} tam={200} color={ROJO} />
      <Cartel x={790} y={1180} txt="también vale" p={rampa(t, M.vale - 0.4, 0.35)} tam={62} fondo={MANGO} giro={-3} />
      <Sombra x={300} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={300} y={1515} alto={480} t={t} cara={t > M.recomiendan ? "corazones" : "feliz"} salto={40 * pulso(t, M.pesos - 0.4, 0.6)} bi={-60 * pulso(t, M.vale - 0.6, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–11 · El nombre, en la pizarra ═════ */
function PizarraValor({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: S(10) + 0.6, s: 1.0, x: 540, y: 1000 }]);
  const enCambio = rampa(t, M.valor - 0.6, 0.3);
  const vuelve = rampa(t, S(11) - 0.3, 0.4);
  const f1 = 1 - enCambio + vuelve;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.15}>
      <Pizarra x={60} y={220} w={960} h={1240}>
        {/* estado actual → estado futuro (vuelve en la escena 11 con «proyecto» en la flecha) */}
        <div style={{ opacity: clamp01(f1) }}>
          <Tiza x={60} y={90} txt="estado actual" p={rampa(t, S(9) - 0.1, 0.6)} tam={100} />
          <TrazoTiza d="M 240 260 L 240 560" p={rampa(t, M.actual + 0.2, 0.4)} w={12} />
          <TrazoTiza d="M 200 520 L 240 570 L 280 520" p={rampa(t, M.actual + 0.5, 0.2)} w={12} />
          <Tiza x={60} y={600} txt="estado futuro" p={rampa(t, M.futuro - 0.5, 0.5)} tam={100} color="#9FE0B4" />
          <Tiza x={320} y={350} txt="proyecto" p={rampa(t, M.existe - 0.4, 0.5)} tam={96} color={MANGO} />
          <Tiza x={60} y={860} txt="existe para ese cambio" p={rampa(t, M.cambio11 - 0.7, 0.6)} tam={84} />
        </div>
        {/* valor del negocio */}
        <div style={{ opacity: clamp01(enCambio - vuelve) }}>
          <Tiza x={420} y={40} txt="valor del negocio" p={rampa(t, M.valor - 0.6, 0.6)} tam={96} centro color={MANGO} />
          <TrazoTiza d="M 420 190 L 420 1000" p={rampa(t, M.tangible - 0.3, 0.4)} w={6} punteado />
          <Tiza x={60} y={230} txt="tangible" p={rampa(t, M.tangible - 0.25, 0.4)} tam={86} color="#9FE0B4" />
          <Gigante x={210} y={520} txt="$" p={rampa(t, M.dinero - 0.3, 0.35)} tam={220} color={COLOR.VERDE} />
          <Tiza x={110} y={680} txt="dinero" p={rampa(t, M.dinero - 0.1, 0.35)} tam={80} />
          <Tiza x={480} y={230} txt="intangible" p={rampa(t, M.intangible - 0.25, 0.4)} tam={86} color="#FFD58A" />
          <Gigante x={640} y={520} txt="★" p={rampa(t, M.reputacion - 0.5, 0.35)} tam={220} color={MANGO} />
          <Tiza x={420} y={860} txt="o ambos" p={rampa(t, M.ambos - 0.3, 0.4)} tam={92} centro color={MANGO} />
          <Tiza x={500} y={680} txt="reputación" p={rampa(t, M.reputacion - 0.3, 0.35)} tam={80} />
        </div>
      </Pizarra>
      <Destello x={540} y={340} r={300} p={rampa(t, M.valor - 0.1, 0.8)} />
    </Escena>
  );
}

/* ═════ 12 · Tu idea: hoy y mañana ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Ficha x={250} y={640} w={340} icono="?" txt="hoy" p={rampa(t, M.actual12 - 0.3, 0.4)} />
      <Flecha x0={440} y0={560} x1={640} y1={560} p={rampa(t, M.idea - 0.3, 0.4)} />
      <Ficha x={830} y={640} w={340} icono="?" txt="mañana" p={rampa(t, M.futuro12 - 0.4, 0.4)} fondo={MANGO} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={600} t={t} cara="guino" bi={-60 * pulso(t, M.idea - 0.6, 1.2)} salto={40 * pulso(t, M.futuro12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "mostrador") return <Mostrador t={t} />;
  if (p.tipo === "fila") return <Fila t={t} />;
  if (p.tipo === "sueno") return <Sueno t={t} />;
  if (p.tipo === "camino") return <Camino t={t} />;
  if (p.tipo === "valor") return <Valor t={t} />;
  if (p.tipo === "pizarra") return <PizarraValor t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.05, "pop", 0.4); fx(M.proyecto1 - 0.1, "toc-grave", 0.4); fx(M.cambia - 0.45, "desliza", 0.35); fx(M.cambia - 0.3, "campana", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.hoy - 0.3, "pop", 0.4); fx(M.hoy + 0.4, "pasos", 0.35); fx(M.puerta - 0.5, "campana", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.domingos - 0.3, "pop", 0.35);
for (let k = 0; k < 8; k++) fx(M.fila - 0.4 + k * 0.12, "pop-suave", 0.25);
fx(M.van - 0.3, "suspiro", 0.35); fx(M.van - 0.2, "toc", 0.3);
fx(S(4) - 0.3, "barrido-lento", 0.35); fx(M.imagina - 0.4, "burbuja", 0.4); fx(M.celular - 0.4, "ding", 0.35); fx(M.domicilios - 0.5, "bocina", 0.3);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.camino5 - 0.4, "desliza", 0.35);
[M.fotos, M.menu, M.domiciliario].forEach((w) => fx(w - 0.35, "pop", 0.35));
fx(M.proyecto6 - 0.4, "campana", 0.45);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.vende - 0.3, "sube", 0.35); fx(M.pesos - 0.6, "monedas", 0.4); fx(M.pesos - 0.3, "caja", 0.35);
fx(M.recomiendan - 0.4, "ding", 0.35); fx(M.caja - 0.3, "toc-grave", 0.35); fx(M.vale - 0.4, "ding-doble", 0.35);
fx(S(9) - 0.3, "barrido-lento", 0.35); fx(M.actual - 0.3, "tiza", 0.35); fx(M.futuro - 0.5, "tiza", 0.35);
fx(M.valor - 0.2, "tiza-larga", 0.4); fx(M.tangible - 0.25, "tiza", 0.35); fx(M.dinero - 0.3, "monedas", 0.3); fx(M.intangible - 0.25, "tiza", 0.35); fx(M.reputacion - 0.5, "ding", 0.35); fx(M.ambos - 0.3, "tiza-larga", 0.35);
fx(M.existe - 0.4, "tiza", 0.35); fx(M.cambio11 - 0.7, "tiza-larga", 0.35);
fx(M.actual12 - 0.3, "pop", 0.35); fx(M.futuro12 - 0.4, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/panaderia.jpg", "art/ciudad.jpg"];
const CLAVE = /^(proyecto|proyecto\.|actual|futuro|futuro\.|futuro\?|valor|negocio:|tangible,|intangible,|cambio\.|camino)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP03 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp03-mostrador-celular-v2.mp3" sinSonido={sinSonido} />
);
