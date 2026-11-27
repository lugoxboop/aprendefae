/*
 * Gestión de Proyectos · GP-10 «Gastamos tres millones» (gp10-datos-informes).
 * Una idea: datos de desempeño del trabajo (observaciones y mediciones en bruto) →
 * información de desempeño (datos analizados en contexto) → informes de desempeño
 * (compilados para generar decisiones) (G 1.2.4.7, p. 26–27; Gráfico 1-7).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Ficha, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.35, 0.3, 0.35, 0.35, 0.3, 0.35, 0.35, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  gastamos: W(1, "Gastamos", 0.1), millones1: W(1, "millones»", 0.5), nada: W(1, "nada.", 0.95),
  remodela: W(2, "remodela", 0.15), maestro: W(2, "maestro", 0.6), anota: W(2, "anota", 0.9),
  medio: W(3, "medio", 0.3), millon: W(3, "millón.", 0.45), cuarenta: W(3, "cuarenta", 0.7), baldosa: W(3, "baldosa.»", 0.95),
  datos4: W(4, "datos", 0.15), mediciones: W(4, "mediciones", 0.75), bruto: W(4, "bruto.", 0.95),
  solos: W(5, "Solos", 0.1), bien: W(5, "bien", 0.75), mal: W(5, "mal.", 0.95),
  compara: W(6, "compara", 0.1), plan6: W(6, "plan:", 0.25), tres: W(6, "tres", 0.4), dos: W(6, "dos", 0.55), previstos: W(6, "previstos,", 0.65), mitad: W(6, "mitad.", 0.95),
  informacion7: W(7, "información", 0.3), contexto7: W(7, "contexto.", 0.95),
  hoja: W(8, "hoja", 0.35), semaforo: W(8, "semáforo:", 0.5), rojo: W(8, "rojo,", 0.7), verde: W(8, "verde.", 0.95),
  informe9: W(9, "informe", 0.3), decisiones: W(9, "decisiones.", 0.95),
  lee: W(10, "lee", 0.2), decide: W(10, "decide:", 0.4), adornos: W(10, "adornos.", 0.95),
  datos11: W(11, "Datos", 0.05), informacion11: W(11, "información", 0.35), informes11: W(11, "informes", 0.7), decidir: W(11, "decidir.", 0.95),
  toca: W(12, "toca:", 0.15), dato12: W(12, "dato,", 0.5), informe12: W(12, "informe?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "obra", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "contexto", desde: S(6) - 0.3, entra: "barrido-izq" },
  { tipo: "informe", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "resumen", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Libreta del maestro de obra: renglones que se escriben */
function Libreta({ x, y, w, p, renglones, t }) {
  if (p <= 0) return null;
  const h = w * 1.15;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))}) rotate(-3deg)` }}>
      <div style={{ position: "absolute", inset: 0, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 18, boxShadow: "0 12px 0 rgba(42,30,23,.28)", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 86px, #CFE3FF 86px 90px)", backgroundPosition: "0 60px" }} />
      {[0.2, 0.5, 0.8].map((f) => <div key={f} style={{ position: "absolute", left: w * f - 14, top: -26, width: 28, height: 50, borderRadius: 14, border: `7px solid ${TINTA}`, background: "#C9CED6" }} />)}
      {renglones.map(([tw, txt], k) => {
        const q = clamp01((t - tw) / 0.6);
        if (q <= 0) return null;
        return <div key={k} style={{ position: "absolute", left: 34, top: 60 + k * 90, height: 86, display: "flex", alignItems: "center", fontFamily: "Caveat", fontWeight: 700, fontSize: 64, color: "#2A3F8F", whiteSpace: "nowrap", clipPath: `inset(0 ${100 - 100 * q}% 0 0)` }}>{txt}</div>;
      })}
    </div>
  );
}

/* Barra horizontal con rótulo y valor */
function Barra({ x, y, w, f, p, color, rotulo, valor }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: Math.min(1, p * 3) }}>
      <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, marginBottom: 8, whiteSpace: "nowrap" }}>{rotulo}</div>
      <div style={{ position: "relative", width: w, height: 80, background: "rgba(255,253,247,.8)", border: `7px solid ${TINTA}`, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * f * sale(Math.min(1, p))}%`, background: color }} />
        <div style={{ position: "absolute", right: 18, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA }}>{valor}</div>
      </div>
    </div>
  );
}

/* ═════ 1 · «Gastamos tres millones» no dice nada ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Cartel x={540} y={520} txt="«Gastamos $3 millones»" p={rampa(t, M.gastamos - 0.2, 0.35)} tam={62} fondo={CREMA} giro={-2} />
      <Gigante x={540} y={800} txt="¿y?" p={rampa(t, M.nada - 0.5, 0.35)} tam={170} color={ROJO} giro={-4 + 4 * Math.sin(t * 3)} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={460} t={t} cara="tranquila" cab={10 * pulso(t, M.nada - 0.4, 1.2)} bi={-50 * pulso(t, M.nada - 0.4, 1.2)} bd={-50 * pulso(t, M.nada - 0.4, 1.2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–5 · La libreta del maestro: datos en bruto ═════ */
function Obra({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.04, x: 520, y: 940 }]);
  const duda = rampa(t, M.solos - 0.3, 0.35);
  return (
    <Escena cam={cam} fondo="art/cocina.jpg">
      <Libreta x={420} y={620} w={600} p={rampa(t, M.anota - 0.5, 0.4)} t={t} renglones={[[M.medio - 0.3, "💸 hoy: $0,5 millones"], [M.cuarenta - 0.3, "🧱 baldosa: 40 %"]]} />
      <Cartel x={420} y={1040} txt="datos de desempeño" p={rampa(t, M.datos4 - 0.3, 0.35)} tam={60} fondo={MANGO} giro={-2} />
      <Cartel x={420} y={1170} txt="en bruto" p={rampa(t, M.bruto - 0.5, 0.35)} tam={52} fondo={CREMA} giro={3} />
      <Gigante x={830} y={420} txt="?" p={duda} tam={150} color={ROJO} giro={8 * Math.sin(t * 3)} />
      <Cartel x={830} y={620} txt="¿bien o mal?" p={rampa(t, M.bien - 0.4, 0.35)} tam={46} fondo={CREMA} />
      <Sombra x={170} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={360} t={t} cara={duda > 0 ? "tranquila" : "feliz"} cab={8 * pulso(t, M.solos, 1.2)} semilla={3} />
      <Sombra x={850} y={1510} w={240} />
      <Mascota esp="perro-mochila" x={850} y={1515} alto={460} t={t} cara="feliz" bd={-50 * Math.abs(Math.sin(t * 4)) * (t > M.anota - 0.4 && t < M.baldosa ? 1 : 0)} semilla={5} espejo />
      <Placa x={850} y={960} nombre="Don Tito" rol="maestro de obra" p={rampa(t, M.maestro - 0.2, 0.35) * (1 - rampa(t, M.medio - 0.3, 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 6–7 · Comparado con el plan: información en contexto ═════ */
function Contexto({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.03, x: 540, y: 950 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.2}>
      <Barra x={90} y={300} w={900} f={1} p={rampa(t, M.tres - 0.3, 0.5)} color={ROJO} rotulo="💸 gastado" valor="$3 M" />
      <Barra x={90} y={500} w={900} f={2 / 3} p={rampa(t, M.dos - 0.3, 0.5)} color="#C9CED6" rotulo="📋 previsto" valor="$2 M" />
      <Barra x={90} y={700} w={900} f={0.5} p={rampa(t, M.mitad - 0.4, 0.5)} color={COLOR.VERDE} rotulo="🧱 avance de la obra" valor="50 %" />
      <Cartel x={540} y={1030} txt="información de desempeño" p={rampa(t, M.informacion7 - 0.3, 0.35)} tam={58} fondo={MANGO} giro={-2} />
      <Cartel x={540} y={1160} txt="en contexto" p={rampa(t, M.contexto7 - 0.5, 0.35)} tam={52} fondo={CREMA} giro={2} />
      <Sombra x={170} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={380} t={t} cara={t > M.mitad - 0.3 ? "triste" : "tranquila"} bi={-60 * pulso(t, M.compara - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · El semáforo para Carmen: informe para decidir ═════ */
function Informe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.03, x: 540, y: 950 }]);
  const pH = rampa(t, M.hoja - 0.4, 0.4);
  const filas = [["💰 costo", ROJO, M.rojo], ["🗓️ plazo", COLOR.VERDE, M.verde]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      {pH > 0 && (
        <div style={{ position: "absolute", left: 70, top: 260, width: 500, height: 640, transform: `scale(${rebote(Math.min(1, pH))}) rotate(-2deg)`, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 20, boxShadow: "0 14px 0 rgba(42,30,23,.28)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA }}>Obra cocina</div>
          {filas.map(([txt, col, tw], k) => (
            <div key={k} style={{ position: "absolute", left: 40, right: 40, top: 150 + k * 170, height: 130, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "6px solid #E6DED0", fontFamily: "Sora", fontWeight: 800, fontSize: 50, color: TINTA, opacity: rampa(t, tw - 0.4, 0.3) }}>
              {txt}
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: col, border: `7px solid ${TINTA}`, transform: `scale(${rebote(rampa(t, tw - 0.3, 0.35))})`, boxShadow: `0 0 ${30 * pulso(t, tw - 0.2, 0.8)}px ${col}` }} />
            </div>
          ))}
        </div>
      )}
      <Cartel x={440} y={1010} txt="informe de desempeño" p={rampa(t, M.informe9 - 0.3, 0.35)} tam={54} fondo={MANGO} giro={-2} />
      <Cartel x={440} y={1135} txt="para decidir" p={rampa(t, M.decisiones - 0.5, 0.35)} tam={50} fondo={CREMA} giro={2} />
      <Dicho x={600} y={560} w={450} h={230} colaX={860} p={rampa(t, M.decide - 0.3, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44, lineHeight: 1.15, color: TINTA, padding: "0 20px" }}>paremos el gasto<br />en adornos</div>
      </Dicho>
      <Sombra x={850} y={1510} w={240} />
      <Mascota esp="gato-gafas" x={850} y={1515} alto={500} t={t} cara={t > M.decide - 0.3 ? "feliz" : "tranquila"} bd={-70 * pulso(t, M.decide - 0.3, 1)} cab={6 * pulso(t, M.lee - 0.3, 1.2)} semilla={6} espejo />
      <Placa x={850} y={880} nombre="Carmen" rol="socia" p={rampa(t, M.lee - 0.4, 0.35) * (1 - rampa(t, M.decide - 0.4, 0.3))} color={COLOR.CORAL} />
      <Sombra x={170} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={340} t={t} cara="feliz" semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Datos, información, informes ═════ */
function Resumen({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.02, x: 540, y: 960 }]);
  const pasos = [[M.datos11, "🔢", "datos", "en bruto", COLOR.CORAL], [M.informacion11, "🔍", "información", "en contexto", MANGO], [M.informes11, "📊", "informes", "para decidir", COLOR.VERDE]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {pasos.map(([tw, ic, a, b, col], k) => {
        const p = rampa(t, tw - 0.3, 0.35);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 110, top: 280 + k * 400, width: 860, height: 220, display: "flex", alignItems: "center", gap: 30, background: CREMA, border: `8px solid ${TINTA}`, borderLeft: `34px solid ${col}`, borderRadius: 30, padding: "0 36px", boxShadow: "0 10px 0 rgba(42,30,23,.25)", transform: `scale(${rebote(Math.min(1, p))})`, fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
            <span style={{ fontSize: 110 }}>{ic}</span>
            <div><div style={{ fontSize: 70, lineHeight: 1.05 }}>{a}</div><div style={{ fontSize: 46, opacity: 0.75 }}>{b}</div></div>
          </div>
        );
      })}
      <Flecha x0={540} y0={520} x1={540} y1={660} p={rampa(t, M.informacion11 - 0.4, 0.3)} color={TINTA} grosor={16} />
      <Flecha x0={540} y0={920} x1={540} y1={1060} p={rampa(t, M.informes11 - 0.4, 0.3)} color={TINTA} grosor={16} />
    </Escena>
  );
}

/* ═════ 12 · ¿Dato, información o informe? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const cosas = [["📈", "vamos 10 % sobre el presupuesto"], ["🧾", "hoy: $200 mil"], ["🚦", "tablero para la junta"]];
  return (
    <Escena cam={cam} fondo="art/cocina.jpg" filtro="blur(6px)" velo={0.25}>
      {cosas.map(([ic, txt], k) => <Ficha key={k} x={[270, 810, 540][k]} y={k < 2 ? 480 : 820} w={360} letra={36} icono={ic} txt={txt} p={rampa(t, M.toca - 0.3 + k * 0.12, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={850} y={1080} txt="?" p={rampa(t, M.dato12 - 0.3, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={400} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={400} y={1535} alto={480} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.informe12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "contexto") return <Contexto t={t} />;
  if (p.tipo === "informe") return <Informe t={t} />;
  if (p.tipo === "resumen") return <Resumen t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.gastamos - 0.2, "pop", 0.4); fx(M.nada - 0.5, "toc-grave", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.anota - 0.5, "papel", 0.35); fx(M.medio - 0.3, "tiza", 0.35); fx(M.cuarenta - 0.3, "tiza", 0.35);
fx(M.datos4 - 0.3, "pop", 0.35); fx(M.bruto - 0.5, "sello", 0.35); fx(M.solos - 0.3, "toc", 0.35);
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.tres - 0.3, "sube", 0.3); fx(M.dos - 0.3, "sube", 0.25); fx(M.mitad - 0.4, "sube", 0.25); fx(M.informacion7 - 0.3, "pop", 0.35); fx(M.contexto7 - 0.5, "ding", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.hoja - 0.4, "papel", 0.35); fx(M.rojo - 0.3, "toc", 0.35); fx(M.verde - 0.3, "ding", 0.35);
fx(M.informe9 - 0.3, "pop", 0.35); fx(M.decide - 0.3, "pop-suave", 0.35);
fx(S(11) - 0.3, "barrido-lento", 0.35); [M.datos11, M.informacion11, M.informes11].forEach((w) => fx(w - 0.3, "pop", 0.35));
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/cocina.jpg"];
const CLAVE = /^(datos|desempeño|bruto|información|contexto|informe|informes|decisiones|decidir|dato)[.,:?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP10 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp10-datos-informes.mp3" sinSonido={sinSonido} />
);
