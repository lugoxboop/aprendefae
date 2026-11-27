/*
 * Gestión de Proyectos · GP-08 «Iniciar varias veces» (gp08-cinco-grupos).
 * Una idea: los cinco grupos de procesos (inicio, planificación, ejecución, monitoreo
 * y control, cierre) son agrupamientos lógicos de procesos, independientes de las
 * fases: se repiten dentro de cada fase y pueden superponerse; la salida de un
 * proceso puede ser la entrada de otro (G 1.2.4.4–1.2.4.5, p. 22–23; p. 554).
 * Decisión de Mateo (27-nov): NUNCA como línea de tiempo de fases. Por eso los
 * grupos aparecen como tarjetas, sin flechas de uno a otro.
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, Horno, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  iniciar: W(1, "iniciar", 0.1), veces: W(1, "veces", 0.3), fase1: W(1, "fase.", 0.95),
  remodela: W(2, "remodela", 0.15), dos: W(2, "dos", 0.4), cocina2: W(2, "cocina,", 0.7), salon2: W(2, "salón.", 0.95),
  carmen: W(3, "Carmen", 0.5), autorice: W(3, "autorice", 0.75), arrancar: W(3, "arrancar.", 0.95),
  plan4: W(4, "plan:", 0.25), cambia: W(4, "cambia,", 0.45), cuesta: W(4, "cuesta", 0.7), cuando: W(4, "cuándo.", 0.95),
  ejecuta: W(5, "Ejecuta:", 0.1), obreros: W(5, "obreros", 0.5), horno: W(5, "horno", 0.85),
  vigila: W(6, "vigila:", 0.15), tiempo6: W(6, "tiempo?,", 0.4), gasto: W(6, "gasto", 0.65), corrige: W(6, "corrige.", 0.95),
  cierra: W(7, "cierra:", 0.2), recibe: W(7, "recibe", 0.5), firma: W(7, "firma.", 0.95),
  salon8: W(8, "salón,", 0.15), vuelve: W(8, "vuelve", 0.4), inicio8: W(8, "inicio,", 0.65), plan8: W(8, "plan,", 0.8), cierre8: W(8, "cierre.", 0.95),
  cinco: W(9, "cinco", 0.15), grupos: W(9, "grupos", 0.25), inicio9: W(9, "inicio,", 0.4), planificacion: W(9, "planificación,", 0.5), ejecucion: W(9, "ejecución,", 0.62), monitoreo: W(9, "monitoreo", 0.75), cierre9: W(9, "cierre.", 0.95),
  nofases: W(10, "fases", 0.15), repiten: W(10, "repiten", 0.4), cada10: W(10, "cada", 0.6), superponen: W(10, "superponen.", 0.95),
  sale: W(11, "sale", 0.2), plan11: W(11, "plan,", 0.5), entra: W(11, "entra", 0.75), otro: W(11, "otro.", 0.95),
  toca: W(12, "toca:", 0.15), grupo12: W(12, "grupo", 0.4), tarea: W(12, "tarea", 0.7), pia12: W(12, "Pía?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "obra", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "salon", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "grupos", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "salida", desde: S(11) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

const GRUPOS = [["🚩", "inicio", ROJO], ["📋", "planificación", MANGO], ["🔨", "ejecución", COLOR.VERDE], ["👀", "monitoreo y control", AZUL], ["✍️", "cierre", COLOR.CORAL]];

/* Tarjeta de un grupo de procesos (color del grupo) */
function Grupo({ x, y, w = 300, k, p, op = 1, chico = false }) {
  if (p <= 0) return null;
  const [ic, txt, col] = GRUPOS[k];
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - (chico ? 40 : 70), width: w, transform: `scale(${rebote(Math.min(1, p))})`, opacity: Math.min(1, p * 3) * op }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: CREMA, border: `7px solid ${TINTA}`, borderLeft: `${chico ? 18 : 26}px solid ${col}`, borderRadius: 22, padding: chico ? "6px 14px" : "14px 18px", fontFamily: "Sora", fontWeight: 800, fontSize: chico ? 30 : 38, lineHeight: 1.1, whiteSpace: "nowrap", color: TINTA, boxShadow: "0 8px 0 rgba(42,30,23,.25)" }}>
        <span style={{ fontSize: chico ? 36 : 50 }}>{ic}</span><span>{txt}</span>
      </div>
    </div>
  );
}

/* Recuadro de una fase */
function Fase({ x, y, w, h, txt, p, color = AZUL, children }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `10px solid ${color}`, borderRadius: 36, background: "rgba(255,253,247,.35)", opacity: Math.min(1, p * 2), transform: `scale(${lerp(0.9, 1, sale(Math.min(1, p)))})` }}>
      <div style={{ position: "absolute", left: 24, top: -44, background: color, color: "#fff", border: `6px solid ${TINTA}`, borderRadius: 16, padding: "2px 20px 6px", fontFamily: "Sora", fontWeight: 800, fontSize: 46, whiteSpace: "nowrap" }}>{txt}</div>
      {children}
    </div>
  );
}

/* ═════ 1 · Iniciar varias veces ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.1}>
      {[0, 1, 2].map((k) => <Gigante key={k} x={240 + k * 300} y={420 + (k % 2) * 80} txt="🚩" p={rampa(t, M.iniciar - 0.2 + k * 0.25, 0.3)} tam={150} />)}
      <Cartel x={540} y={700} txt="iniciar × varias" p={rampa(t, M.veces - 0.3, 0.35)} tam={84} fondo={ROJO} color="#fff" giro={-3} />
      <Cartel x={540} y={860} txt="una por cada fase" p={rampa(t, M.fase1 - 0.6, 0.35)} tam={60} fondo={CREMA} giro={2} />
      <Sombra x={540} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={520} t={t} cara="guino" bi={-60 * pulso(t, M.veces - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–7 · Fase 1: la cocina, con sus cinco grupos ═════ */
function Obra({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.3, b: S(3) + 0.5, s: 1.0, x: 540, y: 968 }]);
  const pF = rampa(t, M.dos - 0.3, 0.4);
  /* lo que pasa en cada paso (visual central) */
  const paso = t < S(4) - 0.2 ? 3 : t < S(5) - 0.2 ? 4 : t < S(6) - 0.2 ? 5 : t < S(7) - 0.2 ? 6 : 7;
  const enPaso = (n) => (paso === n ? 1 : 0);
  return (
    <Escena cam={cam} fondo="art/cocina.jpg">
      <Fase x={50} y={300} w={600} h={720} txt="fase 1: cocina" p={pF} color={AZUL} />
      <Fase x={690} y={300} w={340} h={720} txt="fase 2" p={rampa(t, M.salon2 - 0.4, 0.4)} color="#8A97B0" />
      <Gigante x={860} y={660} txt="🛋️" p={rampa(t, M.salon2 - 0.2, 0.35)} tam={120} />
      {/* dentro de la fase 1: lo que hace Pía en cada momento */}
      {t > S(3) - 0.3 && (
        <>
          <div style={{ opacity: enPaso(3) }}><Documento x={350} y={600} w={260} p={rampa(t, M.carmen - 0.4, 0.4)} titulo="ACTA" sello={rampa(t, M.autorice - 0.1, 0.3)} /></div>
          <div style={{ opacity: enPaso(4) }}>
            {[["¿qué?", M.cambia], ["¿cuánto?", M.cuesta], ["¿cuándo?", M.cuando]].map(([txt, tw], k) => <Cartel key={k} x={350} y={470 + k * 130} txt={"☐ " + txt} p={rampa(t, tw - 0.3, 0.3)} tam={52} />)}
          </div>
          <div style={{ opacity: enPaso(5) }}>
            <Horno x={350 + lerp(400, 0, sale(rampa(t, M.horno - 0.6, 0.6)))} y={820} w={220} brillo={0.7} />
            <Gigante x={210} y={480} txt="🔨" p={rampa(t, M.obreros - 0.4, 0.3)} tam={110} giro={-20 * Math.sin(t * 8)} />
          </div>
          <div style={{ opacity: enPaso(6) }}>
            <Gigante x={240} y={560} txt="⏱️" p={rampa(t, M.tiempo6 - 0.4, 0.3)} tam={120} />
            <Gigante x={460} y={560} txt="💰" p={rampa(t, M.gasto - 0.4, 0.3)} tam={120} />
            <Cartel x={350} y={780} txt="✓ corrige" p={rampa(t, M.corrige - 0.4, 0.3)} tam={56} fondo={COLOR.VERDE} color="#fff" />
          </div>
          <div style={{ opacity: enPaso(7) }}>
            <Gigante x={350} y={560} txt="🔑" p={rampa(t, M.recibe - 0.4, 0.3)} tam={130} />
            <Cartel x={350} y={780} txt="✍️ firmado" p={rampa(t, M.firma - 0.4, 0.3)} tam={56} />
          </div>
        </>
      )}
      {/* las tarjetas de los grupos, abajo, sin flechas entre ellas */}
      <Grupo x={285} y={1150} w={450} k={0} p={rampa(t, M.autorice - 0.2, 0.35)} />
      <Grupo x={795} y={1150} w={450} k={1} p={rampa(t, M.plan4 - 0.3, 0.35)} />
      <Grupo x={285} y={1290} w={450} k={2} p={rampa(t, M.ejecuta - 0.3, 0.35)} />
      <Grupo x={795} y={1290} w={450} k={4} p={rampa(t, M.cierra - 0.3, 0.35)} />
      <Grupo x={540} y={1420} w={960} k={3} p={rampa(t, M.vigila - 0.3, 0.35)} chico />
      {/* Carmen autoriza */}
      {t > S(3) - 0.4 && t < S(4) + 0.3 && (
        <>
          <Mascota esp="gato-gafas" x={880} y={1500} alto={420} t={t} cara="feliz" bd={-70 * pulso(t, M.autorice - 0.4, 1)} semilla={6} espejo />
          <Placa x={880} y={950} nombre="Carmen" rol="Socia" p={rampa(t, M.carmen - 0.3, 0.35)} color={COLOR.CORAL} />
        </>
      )}
      {t > S(5) - 0.3 && t < S(6) + 0.2 && <Mascota esp="perro-mochila" x={lerp(1250, 880, sale(rampa(t, M.obreros - 0.6, 0.6)))} y={1500} alto={400} t={t} cara="feliz" bd={-60 * Math.abs(Math.sin(t * 5))} semilla={9} espejo />}
      <Sombra x={1000} y={1505} w={1} op={0} />
    </Escena>
  );
}

/* ═════ 8 · En la fase del salón, todo vuelve a pasar ═════ */
function Salon({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.02, x: 540, y: 960 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(3px)" velo={0.1}>
      <Fase x={60} y={300} w={960} h={900} txt="fase 2: salón" p={rampa(t, M.salon8 - 0.4, 0.4)} color={AZUL} />
      <Gigante x={850} y={460} txt="↻" p={rampa(t, M.vuelve - 0.3, 0.35)} tam={150} color={COLOR.VERDE} giro={(t - M.vuelve) * 120} />
      <Grupo x={300} y={520} w={440} k={0} p={rampa(t, M.inicio8 - 0.3, 0.35)} />
      <Grupo x={300} y={700} w={440} k={1} p={rampa(t, M.plan8 - 0.3, 0.35)} />
      <Grupo x={770} y={700} w={440} k={2} p={rampa(t, M.plan8 - 0.1, 0.35)} />
      <Grupo x={540} y={870} w={600} k={3} p={rampa(t, M.plan8 + 0.1, 0.35)} chico />
      <Grupo x={540} y={1040} w={440} k={4} p={rampa(t, M.cierre8 - 0.3, 0.35)} />
      <Sombra x={180} y={1500} w={220} />
      <Mascota esp="hamster-gorra" x={180} y={1505} alto={380} t={t} cara="estrellas" bi={-60 * pulso(t, M.vuelve - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · Los cinco grupos; no son fases ═════ */
function Grupos({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const enFases = rampa(t, S(10) - 0.3, 0.5);
  const tw = [M.inicio9, M.planificacion, M.ejecucion, M.monitoreo, M.cierre9];
  const pos = [[280, 470], [800, 470], [280, 680], [800, 680], [540, 890]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={290} txt="5 grupos de procesos" p={rampa(t, M.cinco - 0.3, 0.35)} tam={70} fondo={MANGO} />
      <div style={{ opacity: 1 - enFases }}>
        {GRUPOS.map((_, k) => <Grupo key={k} x={pos[k][0]} y={pos[k][1]} w={470} k={k} p={rampa(t, tw[k] - 0.3, 0.35)} />)}
      </div>
      {enFases > 0 && (
        <div style={{ opacity: enFases }}>
          <Cartel x={540} y={430} txt="✗ no son fases" p={rampa(t, M.nofases - 0.4, 0.35)} tam={64} fondo={ROJO} color="#fff" />
          {[0, 1].map((f) => (
            <Fase key={f} x={60 + f * 500} y={590 + f * 40} w={460} h={720} txt={`fase ${f + 1}`} p={rampa(t, M.repiten - 0.5 + f * 0.3, 0.4)} color={f ? "#5B7BD5" : AZUL}>
              {GRUPOS.map((_, k) => <Grupo key={k} x={230} y={90 + k * 125} w={400} k={k} p={rampa(t, M.repiten - 0.2 + f * 0.3 + k * 0.08, 0.3)} chico />)}
            </Fase>
          ))}
          <Cartel x={540} y={1420} txt="se repiten y se superponen" p={rampa(t, M.superponen - 0.6, 0.35)} tam={52} fondo={CREMA} />
        </div>
      )}
    </Escena>
  );
}

/* ═════ 11 · Lo que sale de un proceso entra a otro ═════ */
function Salida({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.02, x: 540, y: 960 }]);
  const viaja = sale(rampa(t, M.plan11, M.entra - M.plan11 + 0.2));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Ficha x={250} y={640} w={320} icono="⚙️" txt="un proceso" p={rampa(t, S(11) - 0.2, 0.4)} />
      <Ficha x={830} y={640} w={320} icono="⚙️" txt="otro proceso" p={rampa(t, M.entra - 0.4, 0.4)} />
      <Cartel x={250} y={860} txt="salida" p={rampa(t, M.sale - 0.3, 0.35)} tam={56} fondo={MANGO} />
      <Cartel x={830} y={860} txt="entrada" p={rampa(t, M.entra - 0.3, 0.35)} tam={56} fondo={COLOR.VERDE} color="#fff" />
      <Documento x={lerp(250, 830, viaja)} y={1100 - 120 * Math.sin(Math.PI * viaja)} w={200} p={rampa(t, M.plan11 - 0.4, 0.4)} titulo="PLAN" />
    </Escena>
  );
}

/* ═════ 12 · ¿A qué grupo pertenece cada tarea? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const tareas = [["🖊️", "autorizar"], ["🗓️", "el plan"], ["🧱", "la obra"], ["⏱️", "vigilar"], ["🔑", "recibir"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      {tareas.map(([ic, txt], k) => <Ficha key={k} x={[200, 540, 880, 370, 710][k]} y={k < 3 ? 470 : 760} w={240} icono={ic} txt={txt} p={rampa(t, M.toca - 0.3 + k * 0.1, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={540} y={1000} txt="?" p={rampa(t, M.grupo12 - 0.3, 0.35)} tam={180} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={500} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.pia12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "salon") return <Salon t={t} />;
  if (p.tipo === "grupos") return <Grupos t={t} />;
  if (p.tipo === "salida") return <Salida t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
[0, 1, 2].forEach((k) => fx(M.iniciar - 0.2 + k * 0.25, "pop", 0.35)); fx(M.veces - 0.3, "toc", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.dos - 0.3, "desliza", 0.35); fx(M.salon2 - 0.4, "desliza", 0.3);
fx(M.carmen - 0.4, "papel", 0.35); fx(M.autorice - 0.1, "sello", 0.45); fx(M.autorice - 0.2, "pop", 0.3);
fx(M.plan4 - 0.3, "pop", 0.3); [M.cambia, M.cuesta, M.cuando].forEach((w) => fx(w - 0.3, "tiza", 0.3));
fx(M.ejecuta - 0.3, "pop", 0.3); fx(M.obreros - 0.4, "pasos", 0.35); fx(M.horno - 0.6, "golpe", 0.35);
fx(M.vigila - 0.3, "pop", 0.3); fx(M.tiempo6 - 0.4, "toc", 0.3); fx(M.gasto - 0.4, "monedas", 0.3); fx(M.corrige - 0.4, "ding", 0.3);
fx(M.cierra - 0.3, "pop", 0.3); fx(M.recibe - 0.4, "candado", 0.3); fx(M.firma - 0.4, "firma", 0.4);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.vuelve - 0.3, "rebobina", 0.35); [M.inicio8, M.plan8, M.cierre8].forEach((w) => fx(w - 0.3, "pop-suave", 0.3));
fx(S(9) - 0.3, "barrido-lento", 0.35); [M.inicio9, M.planificacion, M.ejecucion, M.monitoreo, M.cierre9].forEach((w) => fx(w - 0.3, "pop", 0.3));
fx(M.nofases - 0.4, "toc-grave", 0.4); fx(M.repiten - 0.5, "desliza", 0.3); fx(M.repiten - 0.2, "desliza", 0.3); fx(M.superponen - 0.6, "ding", 0.3);
fx(S(11) - 0.3, "whoosh", 0.4); fx(M.plan11 - 0.4, "papel", 0.35); fx(M.entra - 0.3, "ding", 0.35);
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/cocina.jpg", "art/oficina.jpg"];
const CLAVE = /^(inicio|inicio,|planificación,|ejecución,|monitoreo|control,|cierre|cierre\.|grupos|procesos:|fases|fase\.|repiten|superponen\.)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP08 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp08-cinco-grupos.mp3" sinSonido={sinSonido} />
);
