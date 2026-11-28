/*
 * Gestión de Proyectos · GP-25 «El café que nadie pidió» (gp25-enunciado).
 * Una idea: Definir el Alcance es desarrollar una descripción detallada del proyecto y del
 * producto (5.3, p. 150). Su salida, el enunciado del alcance del proyecto, incluye la
 * descripción del alcance del producto, los entregables, los criterios de aceptación y las
 * exclusiones; da un entendimiento común y sirve para evaluar si un cambio está dentro o fuera
 * de los límites del proyecto (5.3.3.1, p. 154–155). El acta es de alto nivel; el enunciado,
 * detallado (Tabla 5-1).
 */
import { Mascota, Sombra, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.3, 0.35, 0.3, 0.3, 0.3, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  pense: W(1, "pensé", 0.1), cafe1: W(1, "café»,", 0.3), nunca: W(1, "nunca", 0.75), escribio: W(1, "escribió.", 0.95),
  acta: W(2, "acta", 0.1), decia: W(2, "decía:", 0.4), carrito2: W(2, "carrito", 0.55),
  alto: W(3, "alto", 0.3), trabajar: W(3, "trabajar,", 0.55), detalle: W(3, "detalle.", 0.95),
  define: W(4, "define", 0.2), detallada: W(4, "detallada", 0.55), proyecto4: W(4, "proyecto", 0.75), producto4: W(4, "producto.", 0.95),
  enunciado: W(5, "enunciado", 0.5),
  descripcion6: W(6, "descripción", 0.2), vitrina: W(6, "vitrina,", 0.7), toldo: W(6, "toldo", 0.8), caja: W(6, "caja.", 0.95),
  entregables7: W(7, "entregables:", 0.2), listo: W(7, "listo,", 0.4), permiso: W(7, "permiso", 0.6), menu: W(7, "menú", 0.85),
  criterios: W(8, "criterios", 0.2), condiciones: W(8, "condiciones", 0.5), aceptar8: W(8, "aceptar", 0.85),
  exclusiones9: W(9, "exclusiones:", 0.2), fuera9: W(9, "fuera.", 0.5), cafe9: W(9, "«Café:", 0.7), incluido: W(9, "incluido.»", 0.95),
  mismo: W(10, "mismo,", 0.3), nuevo: W(10, "nuevo,", 0.55), dentro: W(10, "dentro", 0.85), fuera10: W(10, "fuera", 0.92),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.5), exclusiones11: W(11, "exclusiones", 0.7),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "acta", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "definir", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "enunciado", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "limites", desde: S(10) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Hoja del enunciado: cada fila con un título y un ejemplo debajo. */
function Hoja({ x, y, w, p, filas, t }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: 1000, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 26, boxShadow: "0 14px 0 rgba(42,30,23,.28)", transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "50% 0", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110, background: AZUL, borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 42, padding: "0 30px", textAlign: "center", lineHeight: 1.05 }}>enunciado del alcance del proyecto</div>
      {filas.map(([tw, ic, tit, sub, fondo], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 26, right: 26, top: 136 + k * 212, height: 190, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", background: fondo, border: `5px solid ${TINTA}`, borderRadius: 20, transform: `scale(${rebote(q)})` }}>
            <span style={{ fontSize: 70 }}>{ic}</span>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 42 }}>{tit}</div>
              <div style={{ fontSize: 33, color: "#5B4A3E", marginTop: 8, opacity: rampa(t, tw + 0.6, 0.35) }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════ 1 · «Yo pensé que traía café» ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Dicho x={300} y={330} w={700} h={210} colaX={800} p={rampa(t, M.pense - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, lineHeight: 1.1, color: TINTA, padding: "0 30px" }}>«Yo pensé que el carrito traía café»</div>
      </Dicho>
      <Carrito x={400} y={960} w={400} p={rampa(t, 0.1, 0.4)} t={t} />
      <Gigante x={720} y={700} txt="☕" p={rampa(t, M.cafe1 - 0.3, 0.35)} tam={150} giro={10 * Math.sin(t * 3)} />
      <Gigante x={860} y={660} txt="❓" p={rampa(t, M.cafe1, 0.35)} tam={110} giro={-10} />
      <Cartel x={540} y={1050} txt="✍️ nunca se escribió" p={rampa(t, M.nunca - 0.3, 0.35)} tam={56} fondo={ROJO} color="#fff" giro={-2} />
      <Sombra x={800} y={1510} w={200} />
      <Mascota esp="gato-gafas" x={800} y={1515} alto={380} t={t} cara="feliz" semilla={7} espejo />
      <Sombra x={260} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={400} t={t} cara={t > M.nunca - 0.4 ? "triste" : "tranquila"} cab={6 * Math.sin(t * 3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · El acta solo dice lo de alto nivel ═════ */
function Acta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.04, x: 540, y: 950 }]);
  const lupa = rampa(t, M.detalle - 0.7, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Documento x={540} y={300} w={360} p={rampa(t, M.acta - 0.4, 0.4)} titulo="acta de constitución" letra={40} giro={-3} />
      <Cartel x={540} y={820} txt="«un carrito para vender pan en el parque»" p={rampa(t, M.decia - 0.2, 0.35)} tam={38} fondo={CREMA} />
      <Cartel x={540} y={950} txt="☁️ alto nivel" p={rampa(t, M.alto - 0.3, 0.35)} tam={56} fondo="#DDE3FF" giro={-3} />
      <Gigante x={830} y={1120} txt="🔍" p={lupa} tam={150} giro={-15 + 8 * Math.sin(t * 3)} />
      <Cartel x={470} y={1120} txt="¿y el detalle?" p={lupa} tam={56} fondo={MANGO} giro={2} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={320} t={t} cara="tranquila" bd={-50 * pulso(t, M.acta - 0.3, 1)} semilla={3} />
      <Sombra x={830} y={1510} w={180} />
      <Mascota esp="perro-corbatin" x={830} y={1515} alto={320} t={t} cara="feliz" semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 4–5 · Definir el alcance → enunciado ═════ */
function Definir({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.2, b: E(5), s: 1.04, x: 540, y: 950 }]);
  const pE = rampa(t, M.enunciado - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="definir el alcance" p={rampa(t, M.define - 0.4, 0.35)} tam={64} fondo={MANGO} />
      <Cartel x={540} y={400} txt="🔍 descripción detallada" p={rampa(t, M.detallada - 0.4, 0.35)} tam={50} fondo={CREMA} giro={-2} />
      <div style={{ opacity: 1 - pE }}>
        <Ficha x={320} y={680} w={330} icono="🗂️" txt="del proyecto" p={rampa(t, M.proyecto4 - 0.35, 0.35)} letra={40} giro={-3} />
        <Ficha x={760} y={680} w={330} icono="🛒" txt="del producto" p={rampa(t, M.producto4 - 0.5, 0.35)} letra={40} giro={3} />
      </div>
      <Documento x={540} y={800} w={380} p={pE} titulo="enunciado del alcance del proyecto" letra={38} giro={2 * Math.sin(t * 2)} />
      <Sombra x={830} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={830} y={1515} alto={330} t={t} cara={t > M.enunciado ? "estrellas" : "feliz"} bi={-60 * pulso(t, M.enunciado - 0.3, 1.2)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 6–9 · Lo que lleva el enunciado ═════ */
function Enunciado({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.02, x: 540, y: 960 }]);
  const FIL = [
    [M.descripcion6, "🛒", "descripción del alcance del producto", "carrito con vitrina, toldo y caja", "#FFF4DA"],
    [M.entregables7, "📦", "entregables", "carrito listo · permiso del parque · menú", "#DDE3FF"],
    [M.criterios, "✅", "criterios de aceptación", "condiciones antes de aceptar cada uno", "#E3F6EC"],
    [M.exclusiones9, "🚫", "exclusiones", "lo que queda fuera", "#FFE1D8"],
  ];
  const pC = rampa(t, M.cafe9 - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Hoja x={540} y={200} w={980} p={rampa(t, S(6) - 0.3, 0.4)} filas={FIL} t={t} />
      <Cartel x={770} y={1080} txt="☕ café: no incluido" p={pC} tam={38} fondo={ROJO} color="#fff" giro={-4} />
      <Sombra x={230} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={230} y={1515} alto={300} t={t} cara={t > M.incluido ? "guino" : "feliz"} bd={-50 * pulso(t, M.cafe9 - 0.3, 1)} semilla={3} />
      <Sombra x={860} y={1510} w={180} />
      <Mascota esp="gato-gafas" x={860} y={1515} alto={300} t={t} cara={t > M.incluido ? "risa" : "tranquila"} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 10 · Dentro o fuera ═════ */
function Limites({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10), b: E(10), s: 1.03, x: 540, y: 960 }]);
  const pZ = rampa(t, M.nuevo - 0.6, 0.4);
  const vuela = sale(rampa(t, M.fuera10 - 0.4, 0.8));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={250} txt="🤝 todos entienden lo mismo" p={rampa(t, M.mismo - 0.5, 0.35)} tam={52} fondo={MANGO} />
      {pZ > 0 && (
        <div style={{ position: "absolute", left: 50, top: 370, width: 980, height: 640, transform: `scale(${rebote(pZ)})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 470, height: 640, background: "#E3F6EC", border: `7px solid ${TINTA}`, borderRadius: 26 }}>
            <div style={{ textAlign: "center", fontSize: 48, marginTop: 24 }}>✅ dentro</div>
            <div style={{ textAlign: "center", fontSize: 100, marginTop: 40 }}>🛒 🥖</div>
          </div>
          <div style={{ position: "absolute", left: 510, top: 0, width: 470, height: 640, background: "#FFE1D8", border: `7px dashed ${TINTA}`, borderRadius: 26 }}>
            <div style={{ textAlign: "center", fontSize: 48, marginTop: 24 }}>🚫 fuera</div>
          </div>
        </div>
      )}
      <Gigante x={lerp(540, 790, vuela)} y={lerp(1120, 700, vuela)} txt="☕" p={rampa(t, M.nuevo - 0.3, 0.35)} tam={140} giro={20 * Math.sin(t * 4) * (1 - vuela)} />
      <Cartel x={540} y={1130} txt="¿algo nuevo? 🤔" p={rampa(t, M.nuevo - 0.3, 0.35) * (1 - vuela)} tam={50} fondo={CREMA} />
      <Sombra x={260} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={260} y={1515} alto={320} t={t} cara="feliz" bi={-60 * pulso(t, M.dentro - 0.3, 1)} semilla={3} />
      <Sombra x={830} y={1510} w={180} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={320} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 11 · Escribe tres exclusiones ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={330} txt="⚡ 3 exclusiones de tu proyecto" p={rampa(t, M.toca - 0.2, 0.35)} tam={54} fondo={MANGO} />
      {[0, 1, 2].map((k) => <Cartel key={k} x={540} y={520 + k * 140} txt={"🚫 ______________"} p={rampa(t, M.tres - 0.3 + k * 0.25, 0.3)} tam={52} fondo={CREMA} giro={[-2, 1, -1][k]} />)}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.exclusiones11, 0.5)} semilla={3} />
      <Sombra x={790} y={1530} w={200} />
      <Mascota esp="gato-gafas" x={790} y={1535} alto={380} t={t} cara="feliz" semilla={7} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "acta") return <Acta t={t} />;
  if (p.tipo === "definir") return <Definir t={t} />;
  if (p.tipo === "enunciado") return <Enunciado t={t} />;
  if (p.tipo === "limites") return <Limites t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.pense - 0.3, "pop", 0.35); fx(M.cafe1 - 0.3, "pop-suave", 0.3); fx(M.nunca - 0.3, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.acta - 0.4, "papel", 0.35); fx(M.decia - 0.2, "pop-suave", 0.25); fx(M.alto - 0.3, "pop", 0.25); fx(M.detalle - 0.7, "pop", 0.3);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.define - 0.4, "pop", 0.3); fx(M.proyecto4 - 0.35, "pop-suave", 0.22); fx(M.producto4 - 0.5, "pop-suave", 0.22); fx(M.enunciado - 0.4, "papel", 0.35);
fx(S(6) - 0.3, "whoosh", 0.4); [M.descripcion6, M.entregables7, M.criterios, M.exclusiones9].forEach((w) => fx(w - 0.4, "pop", 0.25)); fx(M.cafe9 - 0.3, "sello", 0.35);
fx(S(10) - 0.3, "whoosh", 0.4); fx(M.nuevo - 0.6, "pop", 0.3); fx(M.fuera10 - 0.4, "desliza", 0.3); fx(M.fuera10 + 0.3, "ding", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg", "art/calle.jpg"];
const CLAVE = /^(alcance|enunciado|entregables|criterios|aceptación|exclusiones|detallada|dentro|fuera)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP25 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp25-enunciado.mp3" sinSonido={sinSonido} />
);
