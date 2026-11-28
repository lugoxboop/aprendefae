/*
 * Gestión de Proyectos · GP-15 «La lluvia no está en tu plan» (gp15-eef-opa).
 * Una idea: factores ambientales de la empresa (EEF) = condiciones fuera del control del
 * equipo que influyen, restringen o dirigen el proyecto, internas o externas; activos de los
 * procesos de la organización (OPA) = planes, procesos, políticas, procedimientos y bases de
 * conocimiento propios, incluidas lecciones aprendidas, que se actualizan con el proyecto
 * (G 2.2–2.3, p. 37–41). Las siglas solo en pantalla; la voz dice los nombres completos.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Precio, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.35, 0.35, 0.3, 0.35, 0.35, 0.3, 0.35, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  lluvia: W(1, "lluvia", 0.1), plan1: W(1, "plan,", 0.4), obra: W(1, "obra.", 0.95),
  arma: W(2, "arma", 0.2), carrito: W(2, "carrito", 0.5), norte: W(2, "norte.", 0.95),
  llueve: W(3, "Llueve", 0.05), precio: W(3, "precio", 0.4), harina: W(3, "harina", 0.55), alcaldia: W(3, "alcaldía", 0.75), permiso: W(3, "permiso", 0.9),
  controla: W(4, "controla", 0.2), influye: W(4, "influye", 0.55), restringe: W(4, "restringe", 0.8), dirige: W(4, "dirige.", 0.95),
  factores5: W(5, "factores", 0.3), empresa: W(5, "empresa.", 0.95),
  externos: W(6, "externos:", 0.15), clima: W(6, "clima,", 0.35), mercado: W(6, "mercado,", 0.5), leyes: W(6, "leyes,", 0.65), cambio: W(6, "cambio.", 0.95),
  internos: W(7, "internos:", 0.15), cultura: W(7, "cultura", 0.35), instalaciones: W(7, "instalaciones,", 0.6), gente: W(7, "gente.", 0.95),
  ayuda: W(8, "ayuda:", 0.15), plantilla: W(8, "plantilla", 0.3), proveedores: W(8, "proveedores", 0.55), lecciones: W(8, "lecciones", 0.8), local: W(8, "local.", 0.95),
  activos: W(9, "activos", 0.3), organizacion9: W(9, "organización.", 0.95),
  planes: W(10, "planes,", 0.1), procesos: W(10, "procesos,", 0.25), politicas: W(10, "políticas,", 0.4), procedimientos: W(10, "procedimientos", 0.55), sabe10: W(10, "sabe.", 0.95),
  condicionan: W(11, "condicionan;", 0.2), usas: W(11, "usas,", 0.45), aprendido: W(11, "aprendido", 0.65), sabe11: W(11, "sabe.", 0.95),
  toca: W(12, "toca:", 0.1), interno: W(12, "interno,", 0.45), externo: W(12, "externo", 0.65), activo: W(12, "activo", 0.85),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "carrito", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "eef", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "opa", desde: S(8) - 0.3, entra: "barrido-izq" },
  { tipo: "resumen", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Lluvia: gotas que caen en todo el lienzo */
function Lluvia({ t, p }) {
  if (p <= 0) return null;
  return Array.from({ length: 40 }).map((_, k) => {
    const x = (k * 137) % 1080, v = 900 + (k % 5) * 120;
    const y = ((t * v + k * 211) % 1700) - 100;
    return <div key={k} style={{ position: "absolute", left: x, top: y, width: 8, height: 46, borderRadius: 4, background: "#6FA8DC", opacity: 0.75 * p, transform: "rotate(12deg)" }} />;
  });
}

/* Columna con título y fichas en lista */
function Columna({ x, w, titulo, sub, col, items, p }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: 420, width: w, height: 760, background: "rgba(255,253,247,.92)", border: `8px solid ${TINTA}`, borderTop: `24px solid ${col}`, borderRadius: 30, opacity: Math.min(1, p * 3) }}>
      <div style={{ textAlign: "center", marginTop: 16, fontFamily: "Sora", fontWeight: 800, fontSize: 50, color: TINTA }}>{titulo}</div>
      <div style={{ textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA, opacity: 0.6 }}>{sub}</div>
      {items.map(([q, ic, txt], k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 22px 0", padding: "10px 16px", background: CREMA, border: `5px solid ${TINTA}`, borderRadius: 18, fontFamily: "Sora", fontWeight: 800, fontSize: 36, color: TINTA, whiteSpace: "nowrap", opacity: clamp01(q * 3), transform: `scale(${q > 0 ? rebote(Math.min(1, q)) : 0})` }}>
          <span style={{ fontSize: 48 }}>{ic}</span>{txt}
        </div>
      ))}
    </div>
  );
}

/* ═════ 1 · La lluvia manda en tu obra ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/obra.jpg" filtro="blur(4px)" velo={0.2}>
      <Lluvia t={t} p={rampa(t, M.lluvia - 0.3, 0.5)} />
      <Documento x={540} y={560} w={320} p={rampa(t, M.plan1 - 0.4, 0.4)} titulo="plan" letra={56} giro={-3} />
      <Gigante x={800} y={380} txt="🌧️" p={rampa(t, M.lluvia - 0.2, 0.35)} tam={170} />
      <Cartel x={540} y={920} txt="…pero manda en tu obra" p={rampa(t, M.obra - 0.6, 0.35)} tam={62} fondo={MANGO} giro={-2} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara="triste" semilla={3} />
    </Escena>
  );
}

/* ═════ 2–4 · El carrito, la lluvia, la harina y el permiso ═════ */
function CarritoEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.03, x: 540, y: 960 }]);
  const verbos = [[M.influye, "influye"], [M.restringe, "restringe"], [M.dirige, "dirige"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(3px)" velo={0.12}>
      <Lluvia t={t} p={rampa(t, M.llueve - 0.3, 0.5) * 0.8} />
      <Carrito x={540} y={1180} w={420} p={rampa(t, M.carrito - 0.4, 0.4)} t={0} />
      <Gigante x={200} y={360} txt="🌧️" p={rampa(t, M.llueve - 0.2, 0.35)} tam={130} />
      <Precio x={540} y={360} txt="harina ↑" p={rampa(t, M.harina - 0.3, 0.35)} fondo="#FFD3CF" aro />
      <Documento x={880} y={380} w={190} p={rampa(t, M.permiso - 0.4, 0.4)} titulo="permiso" letra={30} sello={rampa(t, M.permiso, 0.3)} giro={5} />
      <Cartel x={540} y={620} txt="fuera del control del equipo" p={rampa(t, M.controla - 0.3, 0.35)} tam={50} fondo={CREMA} />
      {verbos.map(([tw, txt], k) => <Cartel key={k} x={220 + k * 320} y={780} txt={txt} p={rampa(t, tw - 0.3, 0.35)} tam={48} fondo={MANGO} giro={k % 2 ? 3 : -3} />)}
      <Sombra x={150} y={1510} w={190} />
      <Mascota esp="hamster-gorra" x={150} y={1515} alto={330} t={t} cara={t > M.llueve ? "triste" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–7 · Factores ambientales: externos e internos ═════ */
function Eef({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const ext = [[rampa(t, M.clima - 0.3, 0.35), "☁️", "clima"], [rampa(t, M.mercado - 0.3, 0.35), "📈", "mercado"], [rampa(t, M.leyes - 0.3, 0.35), "⚖️", "leyes"], [rampa(t, M.cambio - 0.5, 0.35), "💱", "tasas de cambio"]];
  const int = [[rampa(t, M.cultura - 0.3, 0.35), "🎭", "cultura"], [rampa(t, M.instalaciones - 0.3, 0.35), "🏭", "instalaciones"], [rampa(t, M.gente - 0.5, 0.35), "🧠", "saber de su gente"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Cartel x={540} y={250} txt="factores ambientales de la empresa" p={rampa(t, M.factores5 - 0.3, 0.35)} tam={44} fondo={MANGO} />
      <Cartel x={540} y={340} txt="EEF" p={rampa(t, M.empresa - 0.4, 0.35)} tam={46} fondo={CREMA} />
      <Columna x={40} w={490} titulo="🌍 externos" sub="fuera de la organización" col={AZUL} items={ext} p={rampa(t, M.externos - 0.3, 0.35)} />
      <Columna x={550} w={490} titulo="🏠 internos" sub="dentro de la organización" col={COLOR.CORAL} items={int} p={rampa(t, M.internos - 0.3, 0.35)} />
      <Sombra x={540} y={1515} w={200} />
      <Mascota esp="hamster-gorra" x={540} y={1520} alto={300} t={t} cara="tranquila" cab={8 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · Activos de los procesos de la organización ═════ */
function Opa({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const cosas = [[M.plantilla, "📄", "plantilla del acta"], [M.proveedores, "📋", "proveedores aprobados"], [M.lecciones, "💡", "lecciones del primer local"]];
  const cinco = [[M.planes, "planes"], [M.procesos, "procesos"], [M.politicas, "políticas"], [M.procedimientos, "procedimientos"], [M.sabe10, "lo que ya sabe"]];
  const enNombre = rampa(t, S(9) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.15}>
      <div style={{ opacity: 1 - 0.6 * enNombre }}>
        {cosas.map(([tw, ic, txt], k) => <Ficha key={k} x={200 + k * 340} y={460} w={310} letra={34} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.35)} giro={k % 2 ? 3 : -3} />)}
      </div>
      {enNombre > 0 && (
        <div style={{ opacity: enNombre }}>
          <Cartel x={540} y={760} txt="activos de los procesos de la organización" p={rampa(t, M.activos - 0.4, 0.35)} tam={38} fondo={COLOR.VERDE} color="#fff" />
          <Cartel x={540} y={850} txt="OPA" p={rampa(t, M.organizacion9 - 0.4, 0.35)} tam={46} fondo={CREMA} />
          {cinco.map(([tw, txt], k) => <Cartel key={k} x={[200, 540, 880, 330, 750][k]} y={k < 3 ? 990 : 1110} txt={txt} p={rampa(t, tw - 0.3, 0.35)} tam={40} fondo={CREMA} giro={k % 2 ? 2 : -2} />)}
        </div>
      )}
      <Sombra x={180} y={1515} w={200} />
      <Mascota esp="hamster-gorra" x={180} y={1520} alto={340} t={t} cara="estrellas" bi={-60 * pulso(t, M.ayuda - 0.3, 1)} semilla={3} />
      <Sombra x={900} y={1515} w={210} />
      <Mascota esp="gato-gafas" x={900} y={1520} alto={370} t={t} cara="feliz" bd={-60 * pulso(t, M.plantilla - 0.4, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 11 · Te condicionan; los usas; lo aprendido se suma ═════ */
function Resumen({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.02, x: 540, y: 960 }]);
  const vuelve = sale(rampa(t, M.aprendido - 0.3, 0.9));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <Ficha x={290} y={520} w={380} letra={40} icono="🌧️⚖️💱" txt="factores: te condicionan" p={rampa(t, M.condicionan - 0.4, 0.35)} fondo="#DCE6FF" />
      <Ficha x={790} y={520} w={380} letra={40} icono="📄📋💡" txt="activos: los usas" p={rampa(t, M.usas - 0.4, 0.35)} fondo="#DDF5E6" />
      <Carrito x={290} y={1130} w={300} p={rampa(t, M.aprendido - 0.6, 0.35)} t={0} />
      <Flecha x0={460} y0={1020} x1={680} y1={880} p={rampa(t, M.aprendido - 0.3, 0.4)} color={COLOR.VERDE} grosor={16} />
      {vuelve > 0 && <Gigante x={lerp(300, 790, vuelve)} y={lerp(960, 760, vuelve) - 120 * Math.sin(Math.PI * vuelve)} txt="💡" p={1} tam={90} />}
      <Cartel x={540} y={1280} txt="lo aprendido se suma" p={rampa(t, M.sabe11 - 0.6, 0.35)} tam={52} fondo={MANGO} />
    </Escena>
  );
}

/* ═════ 12 · ¿Interno, externo o activo? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const casos = [["💵", "sube el dólar"], ["📑", "plantilla de cotización"], ["🔥", "el horno viejo"]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      {casos.map(([ic, txt], k) => <Ficha key={k} x={[270, 810, 540][k]} y={k < 2 ? 470 : 790} w={330} letra={36} icono={ic} txt={txt} p={rampa(t, M.toca - 0.2 + k * 0.12, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={850} y={1080} txt="?" p={rampa(t, M.interno - 0.3, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={400} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={400} y={1535} alto={460} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.activo - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "carrito") return <CarritoEsc t={t} />;
  if (p.tipo === "eef") return <Eef t={t} />;
  if (p.tipo === "opa") return <Opa t={t} />;
  if (p.tipo === "resumen") return <Resumen t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.lluvia - 0.3, "agua", 0.35); fx(M.plan1 - 0.4, "papel", 0.35); fx(M.obra - 0.6, "toc-grave", 0.35);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.carrito - 0.4, "pop", 0.35); fx(M.llueve - 0.3, "trueno", 0.3); fx(M.harina - 0.3, "sube", 0.3); fx(M.permiso, "sello", 0.35);
fx(M.controla - 0.3, "pop", 0.3); [M.influye, M.restringe, M.dirige].forEach((w) => fx(w - 0.3, "golpe", 0.25));
fx(S(5) - 0.3, "barrido-lento", 0.35); fx(M.externos - 0.3, "pop", 0.3); fx(M.internos - 0.3, "pop", 0.3);
[M.clima, M.mercado, M.leyes, M.cambio - 0.2, M.cultura, M.instalaciones, M.gente - 0.2].forEach((w) => fx(w - 0.3, "pop-suave", 0.25));
fx(S(8) - 0.3, "whoosh", 0.4); [M.plantilla, M.proveedores, M.lecciones].forEach((w) => fx(w - 0.3, "papel", 0.3)); fx(M.activos - 0.4, "campana", 0.35);
[M.planes, M.procesos, M.politicas, M.procedimientos, M.sabe10].forEach((w) => fx(w - 0.3, "pop", 0.25));
fx(S(11) - 0.3, "barrido-lento", 0.35); fx(M.condicionan - 0.4, "toc", 0.3); fx(M.usas - 0.4, "ding", 0.3); fx(M.aprendido - 0.3, "burbuja", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/obra.jpg", "art/calle.jpg", "art/oficina.jpg", "art/panaderia.jpg"];
const CLAVE = /^(factores|ambientales|empresa|externos|internos|activos|procesos|organización|políticas|procedimientos|lecciones|condicionan)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP15 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp15-eef-opa.mp3" sinSonido={sinSonido} />
);
