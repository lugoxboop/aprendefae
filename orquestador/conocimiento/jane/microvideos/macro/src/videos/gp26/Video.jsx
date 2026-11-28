/*
 * Gestión de Proyectos · GP-26 «El carrito en pedacitos» (gp26-edt).
 * Una idea: Crear la EDT/WBS es subdividir los entregables y el trabajo del proyecto en
 * componentes más pequeños y más fáciles de manejar (5.4, p. 156). Técnicas: juicio de expertos
 * y descomposición; el paquete de trabajo es el nivel más bajo, donde se estiman y gestionan
 * costo y duración; se asignan códigos de identificación; la EDT/WBS incluye el trabajo de
 * dirección del proyecto; «en ocasiones» se llama regla del 100 % (5.4.2.2, p. 158–161).
 * Línea base del alcance = versión aprobada del enunciado, la EDT/WBS y su diccionario; solo
 * cambia con control formal de cambios (5.4.3.1, p. 161–162).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  hacer: W(1, "«Hacer", 0.05), solo: W(1, "solo", 0.4), empieza: W(1, "empieza?", 0.95),
  parte: W(2, "parte", 0.15), carrito2: W(2, "carrito,", 0.45), permiso: W(2, "permiso,", 0.6), menu: W(2, "menú", 0.75), direccion: W(2, "dirección", 0.9),
  pequenos3: W(3, "pequeños:", 0.5), estructura3: W(3, "estructura,", 0.7), toldo: W(3, "toldo", 0.85), vitrina: W(3, "vitrina.", 0.95),
  crear: W(4, "crear", 0.1), subdividir: W(4, "subdividir", 0.45), componentes: W(4, "componentes", 0.75), manejar: W(4, "manejar.", 0.95),
  descomposicion: W(5, "descomposición.", 0.8),
  bajo: W(6, "bajo", 0.15), paquete6: W(6, "paquete", 0.3), costo: W(6, "costo", 0.8), duracion6: W(6, "duración.", 0.95),
  codigo: W(7, "código:", 0.3), uno1: W(7, "uno", 0.5), dos: W(7, "dos.", 0.95),
  abajo: W(8, "abajo", 0.1), arriba: W(8, "arriba;", 0.3), falte: W(8, "falte", 0.45), sobre: W(8, "sobre", 0.6), regla: W(8, "regla", 0.85), ciento: W(8, "ciento.", 0.95),
  detalles: W(9, "detalles", 0.15), diccionario9: W(9, "diccionario", 0.7),
  aprobada: W(10, "aprobada", 0.1), enunciado10: W(10, "enunciado", 0.2), estructura10: W(10, "estructura", 0.38), diccionario10: W(10, "diccionario", 0.48), linea: W(10, "línea", 0.6), control: W(10, "control", 0.85), cambios10: W(10, "cambios.", 0.95),
  toca: W(11, "toca:", 0.15), paquetes11: W(11, "paquetes", 0.8),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "arbol", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "definicion", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "arbol", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "diccionario", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "base", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* El árbol: nodo raíz, cuatro ramas y el carrito partido en tres. */
const NIV2 = [["🛒", "carrito", "1.1"], ["📄", "permiso", "1.2"], ["📋", "menú", "1.3"], ["🧭", "dirección del proyecto", "1.4"]];
const NIV3 = [["🪵", "estructura", "1.1.1"], ["⛱️", "toldo", "1.1.2"], ["🪟", "vitrina", "1.1.3"]];
const X2 = [150, 405, 660, 925], X3 = [175, 430, 685];
const Y1 = 340, Y2 = 560, Y3 = 800;

function Nodo({ x, y, w = 230, h = 150, ic, txt, cod, p, pc, hoja = 0, fondo = CREMA }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h, boxSizing: "border-box", background: fondo, border: `6px solid ${hoja > 0 ? COLOR.VERDE : TINTA}`, boxShadow: hoja > 0 ? `0 0 0 ${8 * hoja}px rgba(46,170,110,.35)` : "none", borderRadius: 20, transform: `scale(${rebote(Math.min(1, p))})`, fontFamily: "Sora", fontWeight: 800, color: TINTA, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.05 }}>
      <div style={{ fontSize: 46 }}>{ic}</div>
      <div style={{ fontSize: txt.length > 12 ? 26 : 34, padding: "4px 8px 0" }}>{txt}</div>
      {pc > 0 && <div style={{ position: "absolute", top: -26, left: "50%", transform: `translateX(-50%) scale(${rebote(Math.min(1, pc))})`, background: AZUL, color: "#fff", fontSize: 28, padding: "2px 14px", borderRadius: 12, border: `4px solid ${TINTA}` }}>{cod}</div>}
    </div>
  );
}

const Linea = ({ x0, y0, x1, y1, p }) => p <= 0 ? null : (
  <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "visible" }}>
    <path d={`M${x0} ${y0} V${(y0 + y1) / 2} H${x1} V${y1}`} fill="none" stroke={TINTA} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(p)} />
  </svg>
);

function Arbol({ t }) {
  const tarde = t > S(6) - 0.5;
  const cam = tarde
    ? mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8), b: E(8), s: 1.02, x: 540, y: 960 }])
    : mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.03, x: 540, y: 960 }]);
  const p2 = [M.carrito2, M.permiso, M.menu, M.direccion].map((w) => rampa(t, w - 0.35, 0.35));
  const p3 = [M.estructura3, M.toldo, M.vitrina].map((w) => rampa(t, w - 0.35, 0.35));
  const pc = rampa(t, M.uno1 - 0.4, 0.35);
  const hoja = clamp01(rampa(t, M.paquete6 - 0.3, 0.4)) * (0.7 + 0.3 * Math.sin(t * 5));
  const p100 = rampa(t, M.abajo - 0.3, 0.4);
  const regla = rampa(t, M.regla - 0.4, 0.35);
  const fondo6 = rampa(t, M.bajo - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={190} txt={tarde ? "estructura de desglose del trabajo (EDT/WBS)" : "en pedazos 🔪"} p={rampa(t, tarde ? S(6) - 0.3 : M.parte - 0.4, 0.35)} tam={tarde ? 38 : 56} fondo={MANGO} />
      {p2.map((q, k) => <Linea key={k} x0={540} y0={Y1 + 120} x1={X2[k]} y1={Y2} p={q * 1.5} />)}
      {p3.map((q, k) => <Linea key={k} x0={X2[0]} y0={Y2 + 150} x1={X3[k]} y1={Y3} p={q * 1.5} />)}
      <Nodo x={540} y={Y1 - 30} w={440} h={150} ic="🥖" txt="carrito para el parque" cod="1" p={rampa(t, S(2) - 0.3, 0.35)} pc={pc} fondo="#FFF4DA" />
      {NIV2.map(([ic, txt, cod], k) => <Nodo key={k} x={X2[k]} y={Y2} ic={ic} txt={txt} cod={cod} p={p2[k]} pc={rampa(t, M.uno1 - 0.2 + k * 0.15, 0.3)} hoja={k > 0 ? hoja : 0} />)}
      {NIV3.map(([ic, txt, cod], k) => <Nodo key={k} x={X3[k]} y={Y3} ic={ic} txt={txt} cod={cod} p={p3[k]} pc={rampa(t, M.dos - 0.6 + k * 0.15, 0.3)} hoja={hoja} fondo="#E3F6EC" />)}
      {/* 6 · paquete de trabajo */}
      <div style={{ opacity: fondo6 * (1 - p100) }}>
        <Cartel x={540} y={1000} txt="📦 paquete de trabajo = nivel más bajo" p={rampa(t, M.paquete6 - 0.3, 0.35)} tam={40} fondo="#E3F6EC" />
        <Ficha x={360} y={1200} w={300} icono="💲" txt="costo" p={rampa(t, M.costo - 0.35, 0.35)} letra={40} giro={-3} />
        <Ficha x={720} y={1200} w={300} icono="⏱️" txt="duración" p={rampa(t, M.duracion6 - 0.5, 0.35)} letra={40} giro={3} />
      </div>
      {/* 8 · lo de abajo suma lo de arriba */}
      {p100 > 0 && (
        <div style={{ opacity: p100 }}>
          <Cartel x={540} y={1030} txt="estructura + toldo + vitrina = carrito" p={p100} tam={38} fondo={CREMA} />
          <Cartel x={330} y={1150} txt="✓ no falta nada" p={rampa(t, M.falte - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={-2} />
          <Cartel x={760} y={1150} txt="✓ no sobra trabajo" p={rampa(t, M.sobre - 0.3, 0.3)} tam={40} fondo="#E3F6EC" giro={2} />
          <Cartel x={540} y={1280} txt="«regla del 100 %»" p={regla} tam={54} fondo={COLOR.VERDE} color="#fff" giro={-2} />
        </div>
      )}
      <Sombra x={150} y={1560} w={170} />
      <Mascota esp="hamster-gorra" x={150} y={1565} alto={260} t={t} cara={tarde ? "feliz" : "tranquila"} bd={-50 * pulso(t, M.parte - 0.3, 1)} semilla={3} />
      <Sombra x={930} y={1560} w={160} />
      <Mascota esp="perro-corbatin" x={930} y={1565} alto={260} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 1 · «Hacer el carrito» ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={330} txt="«hacer el carrito»" p={rampa(t, M.hacer - 0.2, 0.35)} tam={70} fondo={MANGO} giro={-2} />
      <Carrito x={540} y={980} w={520} p={rampa(t, 0.1, 0.4)} t={t} />
      <Gigante x={860} y={560} txt="❓" p={rampa(t, M.empieza - 0.8, 0.35)} tam={140} giro={10 * Math.sin(t * 3)} />
      <Cartel x={540} y={1110} txt="¿por dónde se empieza?" p={rampa(t, M.empieza - 0.7, 0.35)} tam={56} fondo={ROJO} color="#fff" giro={2} />
      <Sombra x={300} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={300} y={1515} alto={400} t={t} cara={t > M.empieza - 0.7 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
      <Sombra x={820} y={1510} w={190} />
      <Mascota esp="perro-corbatin" x={820} y={1515} alto={360} t={t} cara="tranquila" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 4–5 · Qué es y cómo se hace ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.2, b: E(5), s: 1.04, x: 540, y: 950 }]);
  const corte = sale(rampa(t, M.descomposicion - 0.8, 0.6));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="crear la EDT/WBS" p={rampa(t, M.crear - 0.4, 0.35)} tam={66} fondo={MANGO} />
      <Cartel x={540} y={410} txt="subdividir entregables y trabajo" p={rampa(t, M.subdividir - 0.4, 0.35)} tam={46} fondo={CREMA} giro={-2} />
      <Cartel x={540} y={530} txt="en componentes más pequeños y fáciles de manejar" p={rampa(t, M.componentes - 0.4, 0.35)} tam={34} fondo="#E3F6EC" giro={1} />
      <div style={{ position: "absolute", left: 340 - 70 * corte, top: 680, width: 200, height: 200, background: "#FFF4DA", border: `7px solid ${TINTA}`, borderRadius: 24, transform: `rotate(${-8 * corte}deg)`, opacity: rampa(t, S(5) - 0.4, 0.3) }} />
      <div style={{ position: "absolute", left: 540 + 70 * corte, top: 680, width: 200, height: 200, background: "#FFF4DA", border: `7px solid ${TINTA}`, borderRadius: 24, transform: `rotate(${8 * corte}deg)`, opacity: rampa(t, S(5) - 0.4, 0.3) }} />
      <Gigante x={540} y={640 + 300 * corte} txt="✂️" p={rampa(t, S(5) - 0.3, 0.3)} tam={120} giro={-90} />
      <Cartel x={540} y={1010} txt="descomposición" p={rampa(t, M.descomposicion - 0.6, 0.35)} tam={62} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Sombra x={540} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara={t > M.descomposicion - 0.3 ? "estrellas" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 9 · Diccionario ═════ */
function Diccionario({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9), b: E(9), s: 1.03, x: 540, y: 960 }]);
  const IT = [["📝", "descripción del trabajo"], ["🙋", "organización responsable"], ["✅", "criterios de aceptación"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={430} w={340} p={rampa(t, M.diccionario9 - 0.5, 0.4)} titulo="diccionario de la EDT/WBS" letra={36} giro={-2} />
      <Cartel x={540} y={760} txt="⛱️ 1.1.2 · toldo" p={rampa(t, M.detalles - 0.3, 0.35)} tam={50} fondo="#E3F6EC" />
      {IT.map(([ic, txt], k) => <Cartel key={k} x={540} y={890 + k * 120} txt={`${ic} ${txt}`} p={rampa(t, M.diccionario9 + 0.1 + k * 0.3, 0.3)} tam={40} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={170} y={1510} w={170} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={270} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 10 · Línea base del alcance ═════ */
function Base({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  const junta = sale(rampa(t, M.linea - 0.6, 0.6));
  const D = [[M.enunciado10, "enunciado del alcance", 200], [M.estructura10, "EDT/WBS", 540], [M.diccionario10, "diccionario", 880]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={230} txt="✅ versión aprobada" p={rampa(t, M.aprobada - 0.4, 0.35)} tam={52} fondo="#E3F6EC" />
      {D.map(([tw, txt, x], k) => <Documento key={k} x={x} y={lerp(450, 480, junta)} w={250} p={rampa(t, tw - 0.4, 0.35)} titulo={txt} letra={30} giro={(k - 1) * 6 * (1 - junta)} />)}
      <Cartel x={540} y={880} txt="línea base del alcance" p={rampa(t, M.linea - 0.3, 0.35)} tam={62} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={1020} txt="🔒 solo con control formal de cambios" p={rampa(t, M.control - 0.4, 0.35)} tam={40} fondo={CREMA} />
      <Sombra x={300} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={300} y={1515} alto={320} t={t} cara={t > M.linea ? "estrellas" : "feliz"} semilla={3} />
      <Sombra x={800} y={1510} w={190} />
      <Mascota esp="gato-gafas" x={800} y={1515} alto={330} t={t} cara="feliz" bd={-50 * pulso(t, M.aprobada - 0.3, 1)} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Parte tu proyecto ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={330} txt="⚡ tu proyecto en paquetes" p={rampa(t, M.toca - 0.2, 0.35)} tam={58} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Ficha key={k} x={250 + k * 290} y={560} w={250} icono="📦" txt={`1.${k + 1}`} p={rampa(t, M.paquetes11 - 0.4 + k * 0.2, 0.3)} letra={44} giro={[-3, 2, -2][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.paquetes11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="perro-corbatin" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "arbol") return <Arbol t={t} />;
  if (p.tipo === "definicion") return <Definicion t={t} />;
  if (p.tipo === "diccionario") return <Diccionario t={t} />;
  if (p.tipo === "base") return <Base t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.hacer - 0.2, "pop", 0.35); fx(M.empieza - 0.7, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); [M.carrito2, M.permiso, M.menu, M.direccion, M.estructura3, M.toldo, M.vitrina].forEach((w) => fx(w - 0.35, "pop", 0.22));
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.crear - 0.4, "pop", 0.3); fx(M.descomposicion - 0.8, "crujido", 0.35); fx(M.descomposicion - 0.6, "ding", 0.3);
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.paquete6 - 0.3, "pop", 0.3); fx(M.costo - 0.35, "monedas", 0.25); fx(M.duracion6 - 0.5, "pop-suave", 0.25);
fx(M.uno1 - 0.4, "pop-suave", 0.22); fx(M.dos - 0.6, "pop-suave", 0.22); fx(M.abajo - 0.3, "pop", 0.25); fx(M.regla - 0.4, "campana", 0.35);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.diccionario9 - 0.5, "papel", 0.35);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.linea - 0.6, "desliza", 0.3); fx(M.linea - 0.3, "sello", 0.35); fx(M.control - 0.4, "toc-grave", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(estructura|desglose|descomposición|paquete|código|regla|diccionario|línea|base)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP26 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp26-edt.mp3" sinSonido={sinSonido} />
);
