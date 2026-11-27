/*
 * Gestión de Proyectos · GP-05 «La fiesta que se desbordó» (gp05-fiesta-desbordada).
 * Una idea: dirigir proyectos es aplicar conocimientos, habilidades, herramientas y
 * técnicas a las actividades del proyecto para cumplir sus requisitos; sin dirección
 * llegan plazos incumplidos, sobrecostos, calidad deficiente, retrabajo y expansión
 * no controlada; un mayor alcance puede aumentar el costo o el cronograma (G 1.2.2, p. 10–11).
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Calendario, Ficha, Precio, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.4, 0.3, 0.3, 0.35, 0.2, 0.4] });
const { S, E, W } = T;

const M = {
  fiesta: W(1, "fiesta", 0.1), ramon: W(1, "Ramón", 0.4), cinco: W(1, "cinco", 0.55), termino: W(1, "Terminó", 0.8), doce: W(1, "doce.", 0.95),
  nadie: W(2, "Nadie", 0.1), semana: W(2, "semana", 0.5), agregaba: W(2, "agregaba", 0.8),
  invitados: W(3, "invitados,", 0.15), mariachi: W(3, "mariachi,", 0.3), pastel: W(3, "pastel,", 0.45), costaba: W(3, "costaba.", 0.95),
  fecha: W(4, "fecha", 0.15), corrio: W(4, "corrió", 0.3), veces: W(4, "veces,", 0.5), salon: W(4, "salón", 0.7), nuevo: W(4, "nuevo.", 0.95),
  comida: W(5, "comida", 0.15), fria: W(5, "fría", 0.4), otra: W(5, "otra", 0.85),
  plazos: W(6, "Plazos", 0.05), sobrecostos: W(6, "sobrecostos,", 0.25), calidad: W(6, "calidad,", 0.4), retrabajo: W(6, "retrabajo", 0.55), alcance: W(6, "alcance", 0.7), control: W(6, "control.", 0.95),
  despues: W(7, "después,", 0.15), pia: W(7, "Pía", 0.25), sobrina: W(7, "sobrina,", 0.6), dirige: W(7, "dirige.", 0.95),
  piden: W(8, "piden", 0.1), pregunta: W(8, "pregunta:", 0.4), plata: W(8, "plata,", 0.65), quitamos: W(8, "quitamos", 0.85),
  alcance9: W(9, "alcance", 0.2), costo: W(9, "costo", 0.45), tiempo: W(9, "tiempo,", 0.6), equilibrarlos: W(9, "equilibrarlos.", 0.95),
  direccion: W(10, "dirección", 0.3), conocimientos: W(10, "conocimientos,", 0.55), habilidades: W(10, "habilidades,", 0.7), herramientas: W(10, "herramientas", 0.82), tecnicas: W(10, "técnicas…", 0.95),
  actividades: W(11, "actividades", 0.3), requisitos: W(11, "requisitos.", 0.95),
  toca: W(12, "toca:", 0.2), fallo: W(12, "falló", 0.45), ramon12: W(12, "Ramón?", 0.95),
};

const PLANOS = [
  { tipo: "cuenta", desde: 0 },
  { tipo: "agrega", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "fecha", desde: S(4) - 0.3, entra: "barrido" },
  { tipo: "lista", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "pia", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "pizarra", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Guirnalda de banderines de fiesta, de lado a lado */
function Guirnalda({ y, p = 1, t = 0, colores = [ROJO, MANGO, COLOR.VERDE, AZUL, COLOR.CORAL] }) {
  if (p <= 0) return null;
  const n = 11;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 140 }}>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1080" height="140">
        <path d="M -20 10 Q 540 90 1100 10" fill="none" stroke={TINTA} strokeWidth={6} />
      </svg>
      {Array.from({ length: n }).map((_, k) => {
        const x = 40 + k * 100, yy = 10 + 80 * (1 - Math.pow((x - 540) / 560, 2)) * 1 - 4;
        const q = rebote(clamp01(p * 2 - k / n));
        return <div key={k} style={{ position: "absolute", left: x - 30, top: yy, width: 0, height: 0, borderLeft: "30px solid transparent", borderRight: "30px solid transparent", borderTop: `${70 * q}px solid ${colores[k % colores.length]}`, transform: `rotate(${3 * Math.sin(t * 2 + k)}deg)`, transformOrigin: "50% 0", filter: `drop-shadow(0 0 0 ${TINTA})` }} />;
      })}
    </div>
  );
}

/* Contador de plata en millones */
function Millones({ x, y, v, p, color = CREMA }) {
  if (p <= 0) return null;
  return <Cartel x={x} y={y} txt={`$${v} millones`} p={p} tam={96} fondo={color} color={color === ROJO ? "#fff" : TINTA} />;
}

/* Balanza: inclina = -1..1 (positivo baja la derecha) */
function Balanza({ x, y, w, inclina, izq, der, p = 1 }) {
  if (p <= 0) return null;
  const a = 14 * inclina;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: w * 0.9, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: w / 2 - 14, top: 40, width: 28, height: w * 0.7, background: "#8A5A35", border: `7px solid ${TINTA}`, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: w / 2 - w * 0.2, top: w * 0.7 + 20, width: w * 0.4, height: 40, background: "#8A5A35", border: `7px solid ${TINTA}`, borderRadius: 12 }} />
      <div style={{ position: "absolute", left: 0, top: 40, width: w, height: 0, transform: `rotate(${a}deg)` }}>
        <div style={{ position: "absolute", left: 0, top: -12, width: w, height: 24, background: MANGO, border: `7px solid ${TINTA}`, borderRadius: 12 }} />
        {[[0.12, izq], [0.88, der]].map(([f, txt], k) => (
          <div key={k} style={{ position: "absolute", left: w * f, top: 0, transform: `rotate(${-a}deg)`, transformOrigin: "50% 0" }}>
            <div style={{ position: "absolute", left: -3, top: 0, width: 6, height: 90, background: TINTA }} />
            <div style={{ position: "absolute", left: -165, top: 86, width: 330, height: 84, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: "0 0 110px 110px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 42, whiteSpace: "nowrap", color: TINTA }}>{txt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═════ 1 · Iba a costar 5 millones. Terminó en 12 ═════ */
function Cuenta({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: M.termino - 0.3, b: M.doce + 0.4, s: 1.0, x: 540, y: 968 }]);
  const sube = rampa(t, M.termino - 0.2, M.doce - M.termino + 0.05);
  const v = Math.round(lerp(5, 12, sale(sube)));
  const temblor = sube > 0 && sube < 1 ? 6 * Math.sin(t * 60) : 0;
  return (
    <Escena cam={{ ...cam, x: cam.x + temblor }} fondo="art/ciudad.jpg" filtro="blur(5px)" velo={0.15}>
      <Guirnalda y={200} p={rampa(t, 0.05, 0.8)} t={t} />
      <Gigante x={540} y={480} txt="🎉" p={rampa(t, M.fiesta - 0.2, 0.35) * (1 - rampa(t, M.termino - 0.3, 0.3))} tam={150} />
      <Millones x={540} y={720} v={v} p={rampa(t, M.cinco - 0.3, 0.35)} color={sube > 0.3 ? ROJO : CREMA} />
      <Sombra x={540} y={1510} w={280} />
      <Mascota esp="perro-corbatin" x={540} y={1515} alto={560} t={t} cara={t > M.termino ? "triste" : "feliz"} orejas={t > M.termino ? -6 : 0} bd={-60 * pulso(t, M.fiesta, 1)} semilla={9} />
      <Placa x={540} y={920} nombre="Ramón" rol="Papá de la quinceañera" p={rampa(t, M.ramon - 0.2, 0.35) * (1 - rampa(t, M.termino - 0.2, 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 2–3 · Cada semana alguien agregaba algo ═════ */
function Agrega({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.04, x: 540, y: 990 }]);
  const cosas = [[M.semana, "👗", "vestido"], [M.agregaba, "💐", "flores"], [M.invitados, "👥", "+40 invitados"], [M.mariachi, "🎺", "mariachi"], [M.pastel, "🎂", "otro pastel"]];
  const n = cosas.filter(([tw]) => t > tw - 0.3).length;
  const pos = [[220, 520], [540, 470], [860, 520], [300, 820], [780, 820]];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(5px)" velo={0.15}>
      <Guirnalda y={160} t={t} />
      <Calendario x={150} y={1120} w={200} t={t} vel={t > M.semana - 0.4 && t < E(3) ? 3 : 0} />
      {cosas.map(([tw, ic, txt], k) => <Ficha key={k} x={pos[k][0]} y={pos[k][1]} w={230} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.4)} giro={k % 2 ? 4 : -4} />)}
      {/* la cuenta, sin que nadie la mire */}
      <Precio x={690} y={1000} txt={`$${5 + n} millones`} p={rampa(t, M.semana - 0.4, 0.35)} fondo={n > 2 ? "#FFD3CF" : CREMA} aro />
      <Gigante x={930} y={880} txt="?" p={rampa(t, M.costaba - 0.5, 0.35)} tam={140} color={ROJO} />
      <Sombra x={400} y={1510} w={260} />
      <Mascota esp="perro-corbatin" x={400} y={1515} alto={460} t={t} cara="feliz" bd={-70 * Math.abs(Math.sin(t * 2.2)) * (t < M.costaba - 0.6 ? 1 : 0)} semilla={9} />
      <Sombra x={180} y={1520} w={200} />
      <Mascota esp="conejo" x={180} y={1525} alto={380} t={t} cara="feliz" bi={-60 * pulso(t, M.mariachi - 0.3, 0.9)} semilla={5} />
    </Escena>
  );
}

/* ═════ 4–5 · La fecha se corre y la comida llega fría ═════ */
function Fecha({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.3, b: S(5) + 0.5, s: 1.08, x: 560, y: 1050 }]);
  const mov1 = sale(rampa(t, M.corrio - 0.2, 0.5)), mov2 = sale(rampa(t, M.veces - 0.2, 0.5));
  const xPin = 330 + 160 * mov1 + 160 * mov2;
  const fuera = 1 - rampa(t, S(5) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/cocina.jpg">
      <div style={{ opacity: fuera }}>
        <Calendario x={540} y={560} w={460} t={t} />
        <div style={{ position: "absolute", left: xPin - 34, top: 520, width: 68, height: 68, borderRadius: "50%", background: ROJO, border: `7px solid ${TINTA}`, transform: `scale(${rebote(rampa(t, M.fecha - 0.3, 0.35))})` }} />
        <Flecha x0={340} y0={820} x1={480} y1={820} p={rampa(t, M.corrio - 0.2, 0.3)} color={ROJO} grosor={18} />
        <Flecha x0={500} y0={820} x1={640} y1={820} p={rampa(t, M.veces - 0.2, 0.3)} color={ROJO} grosor={18} />
        <Precio x={300} y={980} txt="salón $" p={rampa(t, M.salon - 0.3, 0.35)} aro />
        <Precio x={370} y={1190} txt="salón $ otra vez" p={rampa(t, M.nuevo - 0.4, 0.35)} fondo="#FFD3CF" giro={5} aro />
      </div>
      {t > S(5) - 0.4 && (
        <>
          {/* el plato frío y el segundo pedido */}
          <div style={{ position: "absolute", left: 340, top: 680, width: 400, height: 140, borderRadius: "50%", background: "#fff", border: `8px solid ${TINTA}`, transform: `scale(${rebote(rampa(t, M.comida - 0.3, 0.4))})` }} />
          <Gigante x={540} y={690} txt="🍗" p={rampa(t, M.comida - 0.2, 0.35)} tam={140} />
          <Gigante x={790} y={760} txt="❄️" p={rampa(t, M.fria - 0.3, 0.35)} tam={130} />
          <Cartel x={540} y={980} txt="pedir otra vez" p={rampa(t, M.otra - 0.4, 0.35)} tam={70} fondo={ROJO} color="#fff" giro={-3} />
          <Gigante x={540} y={1170} txt="🔁" p={rampa(t, M.otra - 0.3, 0.35)} tam={130} />
        </>
      )}
      <Sombra x={890} y={1510} w={220} />
      <Mascota esp="perro-corbatin" x={890} y={1515} alto={420} t={t} cara="triste" cab={6 * pulso(t, M.nuevo - 0.4, 1.2)} orejas={-5} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 6 · Lo que pasa sin dirección ═════ */
function Lista({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6), b: E(6), s: 1.03, x: 540, y: 990 }]);
  const items = [[M.plazos, "⏰", "plazos incumplidos"], [M.sobrecostos, "💸", "sobrecostos"], [M.calidad, "🥶", "mala calidad"], [M.retrabajo, "🔁", "retrabajo"], [M.alcance, "🎈", "alcance sin control"]];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={330} txt="sin dirección" p={rampa(t, S(6) - 0.2, 0.35)} tam={90} fondo={ROJO} color="#fff" giro={-2} />
      {items.map(([tw, ic, txt], k) => {
        const p = rampa(t, tw - 0.3, 0.35);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 110, top: 470 + k * 190, width: 860, height: 150, display: "flex", alignItems: "center", gap: 26, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 26, padding: "0 30px", boxShadow: "0 9px 0 rgba(42,30,23,.25)", transform: `translateX(${(1 - sale(p)) * -900}px)`, fontFamily: "Sora", fontWeight: 800, fontSize: 60, color: TINTA }}>
            <span style={{ fontSize: 84 }}>{ic}</span>{txt}
          </div>
        );
      })}
    </Escena>
  );
}

/* ═════ 7–9 · Pía dirige la fiesta de su sobrina ═════ */
function PiaDirige({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.04, x: 540, y: 940 }]);
  const pB = rampa(t, M.piden - 0.3, 0.4);
  /* la balanza: más invitados la desequilibran; más plata o quitar otra cosa la equilibra */
  const inc = sale(rampa(t, M.piden, 0.6)) - 0.5 * sale(rampa(t, M.plata - 0.2, 0.5)) - 0.5 * sale(rampa(t, M.quitamos - 0.2, 0.5));
  const pTri = rampa(t, M.alcance9 - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(4px)" velo={0.12}>
      <Guirnalda y={160} t={t} colores={[MANGO, COLOR.VERDE, AZUL]} />
      <Cartel x={540} y={420} txt="esta vez, con dirección" p={rampa(t, M.dirige - 0.5, 0.35) * (1 - rampa(t, S(8) - 0.2, 0.3))} tam={64} fondo={COLOR.VERDE} color="#fff" />
      <div style={{ opacity: 1 - pTri }}>
        <Balanza x={540} y={470} w={720} inclina={inc} izq="plata" der="+ invitados" p={pB} />
      </div>
      {/* alcance → costo o tiempo */}
      {pTri > 0 && (
        <>
          <Ficha x={540} y={560} w={300} icono="🎈" txt="más alcance" p={pTri} fondo={MANGO} />
          <Flecha x0={460} y0={720} x1={290} y1={880} p={rampa(t, M.costo - 0.4, 0.35)} color={COLOR.CORAL} />
          <Flecha x0={620} y0={720} x1={790} y1={880} p={rampa(t, M.tiempo - 0.4, 0.35)} color={COLOR.CORAL} />
          <Ficha x={250} y={1020} w={250} icono="💰" txt="costo" p={rampa(t, M.costo - 0.2, 0.35)} />
          <Ficha x={830} y={1020} w={250} icono="⏳" txt="tiempo" p={rampa(t, M.tiempo - 0.2, 0.35)} />
          <Cartel x={630} y={1250} txt="⚖️ equilibrar" p={rampa(t, M.equilibrarlos - 0.5, 0.35)} tam={60} fondo={CREMA} />
        </>
      )}
      <Sombra x={170} y={1520} w={200} />
      <Mascota esp="hamster-gorra" x={170} y={1525} alto={400} t={t} cara={t > M.dirige - 0.5 ? "feliz" : "tranquila"} bd={-70 * pulso(t, M.pregunta - 0.3, 1.1)} cab={-8 * pulso(t, M.plata - 0.5, 1.2)} semilla={3} />
      <Placa x={190} y={1130} nombre="Pía" rol="la dirige" p={rampa(t, M.pia - 0.2, 0.35) * (1 - rampa(t, S(8) - 0.3, 0.3))} />
      <Sombra x={930} y={1520} w={190} />
      <Mascota esp="conejo" x={930} y={1525} alto={350} t={t} cara="feliz" bi={-60 * pulso(t, M.piden - 0.2, 1)} semilla={5} espejo />
    </Escena>
  );
}

/* ═════ 10–11 · El nombre ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11) - 0.2, b: E(11), s: 1.03, x: 540, y: 1000 }]);
  const cosas = [[M.conocimientos, "conocimientos"], [M.habilidades, "habilidades"], [M.herramientas, "herramientas"], [M.tecnicas, "técnicas"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.15}>
      <Pizarra x={50} y={200} w={980} h={1300}>
        <Tiza x={460} y={30} txt="dirección de proyectos" p={rampa(t, Math.min(M.direccion - 0.3, S(10)), 0.6)} tam={92} centro color={MANGO} />
        <Tiza x={60} y={180} txt="aplicar…" p={rampa(t, M.conocimientos - 0.6, 0.4)} tam={70} color="#9FE0B4" />
        {cosas.map(([tw, txt], k) => <Tiza key={k} x={110 + (k % 2) * 400} y={290 + Math.floor(k / 2) * 110} txt={"+ " + txt} p={rampa(t, tw - 0.3, 0.4)} tam={70} />)}
        <TrazoTiza d="M 460 530 L 460 650" p={rampa(t, S(11) - 0.2, 0.3)} w={10} />
        <TrazoTiza d="M 430 620 L 460 660 L 490 620" p={rampa(t, S(11), 0.2)} w={10} />
        <Tiza x={460} y={690} txt="a las actividades del proyecto" p={rampa(t, M.actividades - 0.4, 0.6)} tam={70} centro />
        <TrazoTiza d="M 460 800 L 460 920" p={rampa(t, M.actividades + 0.3, 0.3)} w={10} />
        <TrazoTiza d="M 430 890 L 460 930 L 490 890" p={rampa(t, M.actividades + 0.5, 0.2)} w={10} />
        <Tiza x={460} y={960} txt="✓ cumplir sus requisitos" p={rampa(t, M.requisitos - 0.6, 0.6)} tam={84} centro color="#9FE0B4" />
      </Pizarra>
      <Destello x={540} y={340} r={300} p={rampa(t, M.direccion - 0.2, 0.8)} />
    </Escena>
  );
}

/* ═════ 12 · ¿Qué falló? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Guirnalda y={160} t={t} />
      <Millones x={540} y={500} v={12} p={rampa(t, M.toca - 0.2, 0.35)} color={ROJO} />
      <Gigante x={540} y={760} txt="?" p={rampa(t, M.fallo - 0.3, 0.35)} tam={220} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={330} y={1530} w={260} />
      <Mascota esp="perro-corbatin" x={330} y={1535} alto={500} t={t} cara="triste" semilla={9} />
      <Sombra x={760} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={760} y={1535} alto={520} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.ramon12 - 0.2, 0.5)} semilla={3} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "cuenta") return <Cuenta t={t} />;
  if (p.tipo === "agrega") return <Agrega t={t} />;
  if (p.tipo === "fecha") return <Fecha t={t} />;
  if (p.tipo === "lista") return <Lista t={t} />;
  if (p.tipo === "pia") return <PiaDirige t={t} />;
  if (p.tipo === "pizarra") return <Definicion t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.05, "redoble", 0.3); fx(M.fiesta - 0.2, "pop", 0.4); fx(M.cinco - 0.3, "caja", 0.35); fx(M.termino - 0.2, "sube", 0.45); fx(M.doce - 0.1, "toc-grave", 0.45);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.semana - 0.4, "papel", 0.35);
[M.semana, M.agregaba, M.invitados, M.mariachi, M.pastel].forEach((w) => fx(w - 0.3, "pop", 0.35)); fx(M.costaba - 0.5, "toc", 0.35);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.corrio - 0.2, "desliza", 0.35); fx(M.veces - 0.2, "desliza", 0.35); fx(M.salon - 0.3, "caja", 0.35); fx(M.nuevo - 0.4, "caja", 0.4);
fx(M.comida - 0.3, "pop-suave", 0.35); fx(M.fria - 0.3, "viento", 0.3); fx(M.otra - 0.4, "rebobina", 0.35);
fx(S(6) - 0.3, "barrido-lento", 0.35); [M.plazos, M.sobrecostos, M.calidad, M.retrabajo, M.alcance].forEach((w) => fx(w - 0.3, "golpe", 0.3));
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.dirige - 0.5, "campana", 0.4); fx(M.piden - 0.3, "pop", 0.35); fx(M.plata - 0.2, "monedas", 0.3); fx(M.quitamos - 0.2, "desliza", 0.3);
fx(M.alcance9 - 0.3, "pop", 0.35); fx(M.costo - 0.4, "desliza", 0.3); fx(M.tiempo - 0.4, "desliza", 0.3); fx(M.equilibrarlos - 0.5, "ding", 0.35);
fx(S(10) - 0.3, "barrido-lento", 0.35); fx(M.direccion - 0.3, "tiza-larga", 0.4);
[M.conocimientos, M.habilidades, M.herramientas, M.tecnicas].forEach((w) => fx(w - 0.3, "tiza", 0.35));
fx(M.actividades - 0.4, "tiza-larga", 0.35); fx(M.requisitos - 0.6, "ding", 0.35);
fx(M.toca - 0.2, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/ciudad.jpg", "art/cocina.jpg", "art/oficina.jpg"];
const CLAVE = /^(dirigió|dirige|dirección|conocimientos|habilidades|herramientas|técnicas|requisitos|alcance|costo|tiempo|sobrecostos|retrabajo)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP05 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp05-fiesta-desbordada.mp3" sinSonido={sinSonido} />
);
