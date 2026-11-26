/*
 * capacitar · «Tu jefe te pidió capacitar a 20 personas para el viernes» — Reel para
 * CLIENTES (quien quiere enseñar: capacitaciones, cursos), ~25 s. Voz: Javier Rojas.
 * Historia: al zorro le piden capacitar a veinte personas para el viernes; tiene un PDF de
 * ochenta páginas que nadie lee (el público se duerme). Pausa A/B: mandarlo igual o
 * convertirlo. El PDF se vuelve una página con lecciones cortas y práctica; la página la
 * armamos nosotros, él enseña. Cierre: pregunta y logo con el respaldo de planck.
 * Todo lo que promete es verdad: AprendeFAE arma la página del curso (ver audiencias.md).
 */
import { AbsoluteFill } from "remotion";
import { Mascota, Sombra, Camara, camara, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { Reel } from "../../comun/Reel.jsx";
import { crearTiempo, clamp01, lerp, suave, sale, rampa, rebote, pulso } from "../../comun/tiempo.js";
import { Logo, Invita, Sello, Opciones, CORAL, VERDE, ARTE_MARCA } from "../../comun/marca.jsx";
import DATOS, { VOZ } from "./tiempos.js";

export const T = crearTiempo(DATOS, { extra: [0.0, 0.1, 0.1, 1.2, 0.15, 0.2], cola: 1.85, recorta: true, ritmo: 1.0 });
export const DURACION = T.DURACION_S;
const { S, E, W } = T;
const MESA = 1180;
const GRIS = "#E9EEF5";

/* el documento PDF (icono grande) */
function Pdf({ x, y, w = 360, p = 1, giro = 0, paginas = 80, esc = 1 }) {
  if (p <= 0) return null;
  const h = w * 1.3;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${giro}deg) scale(${esc})`, opacity: Math.min(1, p * 3) }}>
      {[3, 2, 1].map((k) => <div key={k} style={{ position: "absolute", left: k * 10, top: -k * 10, width: w, height: h, background: "#F4F1EA", border: `6px solid ${TINTA}`, borderRadius: 14 }} />)}
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", border: `7px solid ${TINTA}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ background: "#D9443A", color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.17, textAlign: "center", padding: "10px 0" }}>PDF</div>
        {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ margin: `${w * 0.045}px ${w * 0.1}px 0`, height: w * 0.035, width: `${70 + ((i * 37) % 25)}%`, background: "#CFC9BD", borderRadius: 6 }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: w * 0.05, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.13, color: TINTA }}>{paginas} págs.</div>
      </div>
    </div>
  );
}

/* chat del jefe: dos burbujas */
function Chat({ t, p1, p2 }) {
  const burbuja = (p, txt, y) => p > 0 && (
    <div style={{ position: "absolute", left: 120, top: y, transformOrigin: "0 0", transform: `scale(${rebote(p)})`, opacity: Math.min(1, p * 3) }}>
      <div style={{ background: "#FFFFFF", border: `7px solid ${TINTA}`, borderRadius: "10px 40px 40px 40px", padding: "16px 34px 22px", fontFamily: "Sora", fontWeight: 800, fontSize: 56, color: TINTA, whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,.18)" }}>{txt}</div>
    </div>
  );
  return (
    <>
      {p1 > 0 && (
        <div style={{ position: "absolute", left: 120, top: 280, display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, p1 * 3) }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: AZUL, border: `6px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>J</div>
          <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 40, color: TINTA }}>Jefe</div>
        </div>
      )}
      {burbuja(p1, <>Capacita a <span style={{ color: CORAL }}>20 personas</span>.</>, 360)}
      {burbuja(p2, <>Para el <span style={{ color: CORAL }}>viernes</span>.</>, 480)}
    </>
  );
}

/* calendario de la semana; el viernes se encierra en rojo */
function Calendario({ x, y, marca }) {
  const dias = ["L", "M", "M", "J", "V"];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 420, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 20, overflow: "visible", boxShadow: "0 10px 0 rgba(0,0,0,.18)" }}>
      <div style={{ background: CORAL, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 36, textAlign: "center", padding: "6px 0", borderRadius: "12px 12px 0 0" }}>ESTA SEMANA</div>
      <div style={{ display: "flex", justifyContent: "space-around", padding: "18px 10px 22px", position: "relative" }}>
        {dias.map((d, i) => <div key={i} style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: i === 4 ? CORAL : TINTA }}>{d}</div>)}
        {marca > 0 && (
          <svg width="120" height="110" viewBox="0 0 120 110" style={{ position: "absolute", right: -8, top: 2, overflow: "visible" }}>
            <ellipse cx="60" cy="55" rx="50" ry="44" stroke={CORAL} strokeWidth="9" fill="none" strokeDasharray="320" strokeDashoffset={320 * (1 - clamp01(marca))} transform="rotate(-20 60 55)" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* la oficina: el zorro, el chat del jefe, el calendario y el PDF que cae en la mesa */
function Oficina({ t }) {
  const p1 = rampa(t, W(1, "dice", 0.3), 0.35), p2 = rampa(t, W(1, "Para", 0.75) - 0.1, 0.35);
  const veinte = rampa(t, W(1, "veinte", 0.5) - 0.05, 0.6);
  const marca = rampa(t, W(1, "viernes", 0.9), 0.45);
  const caePdf = rampa(t, W(2, "PDF", 0.3) - 0.2, 0.35);
  const pags = Math.round(1 + 79 * sale(rampa(t, W(2, "ochenta", 0.5) - 0.1, 0.6)));
  const susto = t > W(1, "viernes", 0.9);
  const zorro = {
    cara: susto ? "triste" : "tranquila",
    ojos: susto ? 1.3 : 1, orejas: susto ? -6 : 1,
    cab: susto ? 3 * Math.sin(t * 17) * (1 - rampa(t, W(1, "viernes", 0.9), 1.2)) : 2 * Math.sin(t * 2),
    bi: susto ? -25 : 0, bd: susto ? -25 : 0,
    salto: 28 * pulso(t, W(1, "viernes", 0.9), 0.4) + 18 * pulso(t, W(2, "PDF", 0.3) + 0.12, 0.3),
  };
  const cam = camara(t, [[0, 1.0, 540, 960], [S(2) - 0.1, 1.0, 540, 960], [S(2) + 0.5, 1.12, 540, 1020]]);
  return (
    <Camara {...cam} t={t} temblor={caePdf > 0.95 && t < W(2, "PDF", 0.3) + 0.6 ? 6 * (1 - rampa(t, W(2, "PDF", 0.3) + 0.15, 0.45)) : 0}>
      <AbsoluteFill>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#DDE6F0, #C9D6E6)" }} />
        {/* ventana con la ciudad */}
        <div style={{ position: "absolute", left: 600, top: 600, width: 380, height: 330, background: "#9EC9F0", border: `14px solid #5D6B7D`, borderRadius: 12, overflow: "hidden" }}>
          {[[0, 120, 260], [90, 80, 180], [160, 110, 300], [260, 90, 220]].map(([x, w, h], i) => <div key={i} style={{ position: "absolute", left: x, bottom: 0, width: w, height: h, background: "#7A93B3" }} />)}
        </div>
        <Calendario x={580} y={960} marca={marca} />
        {/* las veinte personas */}
        {veinte > 0 && (
          <div style={{ position: "absolute", left: 600, top: 600, width: 380, height: 330, background: "rgba(255,246,224,.96)", border: `7px solid ${TINTA}`, borderRadius: 16, padding: 14, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", alignContent: "center", rowGap: 8, opacity: Math.min(1, veinte * 4) }}>
            {Array.from({ length: 20 }, (_, i) => {
              const q = rebote(clamp01(veinte * 22 - i));
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${q})` }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: [AZUL, CORAL, VERDE, MANGO][i % 4], border: `4px solid ${TINTA}` }} />
                  <div style={{ width: 44, height: 24, marginTop: 2, borderRadius: "22px 22px 6px 6px", background: [AZUL, CORAL, VERDE, MANGO][i % 4], border: `4px solid ${TINTA}` }} />
                </div>
              );
            })}
            <div style={{ gridColumn: "1 / -1", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, lineHeight: 1 }}>20</div>
          </div>
        )}
        <Chat t={t} p1={p1} p2={p2} />
        {/* el zorro */}
        <Sombra x={300} y={MESA + 8} w={320} />
        <Mascota esp="zorro-corbata" x={300} y={MESA + 150} alto={640} t={t} semilla={2} {...zorro} />
        {/* escritorio */}
        <div style={{ position: "absolute", left: -40, right: -40, top: MESA, height: 40, background: "#C8D2DE", borderRadius: 12, boxShadow: "0 6px 0 #8C99AA" }} />
        <div style={{ position: "absolute", left: -40, right: -40, top: MESA + 40, bottom: 0, background: "linear-gradient(#9AA7B8, #7F8C9D)" }} />
        {/* el PDF que cae */}
        <Pdf x={760} y={MESA + 6 - (1 - sale(caePdf)) * 900} w={330} p={caePdf} giro={6 - 4 * caePdf} paginas={pags} />
      </AbsoluteFill>
    </Camara>
  );
}

/* el público con el PDF proyectado: se duermen */
const PUBLICO = [["hamster-gorra", 170, 330], ["conejo", 410, 360], ["panda", 660, 340], ["huron-corbata", 900, 320]];
function Sala({ t, despiertos = 0, pantalla, zorro = null, extra = null, tres = false }) {
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#3B4566, #2B3350)" }} />
      {/* pantalla */}
      <div style={{ position: "absolute", left: 110, top: 270, width: 860, height: 560, background: "#F7F4EC", border: `10px solid ${TINTA}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 0 80px rgba(255,255,255,.25)" }}>{pantalla}</div>
      {zorro}
      {/* público */}
      {(tres ? PUBLICO.slice(0, 3) : PUBLICO).map(([esp, x, alto], i) => {
        const d = clamp01(despiertos * 1.6 - i * 0.2);
        const dormido = d < 0.5;
        return (
          <div key={esp}>
            <Mascota esp={esp} x={x} y={1260} alto={alto} t={t} semilla={i * 1.7} cara={dormido ? "tranquila" : i % 2 ? "feliz" : "estrellas"} ojos={dormido ? 0.05 : 1.05}
              cab={dormido ? 14 * (i % 2 ? 1 : -1) + 3 * Math.sin(t * 1.5 + i) : 3 * Math.sin(t * 5 + i)} ladeo={dormido ? 4 * (i % 2 ? 1 : -1) : 0} orejas={dormido ? 6 : -2}
              bi={!dormido && i % 2 === 0 ? -40 + 10 * Math.sin(t * 7 + i) : 0} salto={!dormido ? 10 * Math.abs(Math.sin(t * 5 + i)) : 0} />
            {dormido && [0, 1].map((k) => {
              const f = (t * 0.55 + k / 2 + i * 0.3) % 1;
              return <div key={k} style={{ position: "absolute", left: x + 40 + f * 60, top: 1260 - alto - 10 - f * 150, fontFamily: "Sora", fontWeight: 800, fontSize: 52 + k * 12, color: CREMA, opacity: Math.sin(f * Math.PI), WebkitTextStroke: `5px ${TINTA}`, paintOrder: "stroke fill" }}>z</div>;
            })}
            {!dormido && (
              <div style={{ position: "absolute", left: x + 40, top: 1260 - alto - 40, width: 70, height: 70, borderRadius: "50%", background: VERDE, border: `5px solid ${TINTA}`, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${rebote(clamp01((d - 0.5) * 3))})` }}>✓</div>
            )}
          </div>
        );
      })}
      {/* fila de mesas */}
      <div style={{ position: "absolute", left: -40, right: -40, top: 1150, height: 30, background: "#C8A27A", borderRadius: 10 }} />
      <div style={{ position: "absolute", left: -40, right: -40, top: 1180, bottom: 0, background: "linear-gradient(#8E6A47, #6F5136)" }} />
      {extra}
    </AbsoluteFill>
  );
}

/* el PDF proyectado: «Página 1 de 80», un muro de texto */
function Muro({ t }) {
  return (
    <div style={{ padding: "26px 40px" }}>
      <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 40, color: "#9A948A" }}>manual.pdf · página 1 de 80</div>
      {Array.from({ length: 13 }, (_, i) => <div key={i} style={{ marginTop: 16, height: 16, width: `${78 + ((i * 41) % 20)}%`, background: "#CFC9BD", borderRadius: 8 }} />)}
    </div>
  );
}

/* el teléfono con la página del curso: lecciones cortas y práctica */
function Telefono({ t, x, y, esc = 1, lecciones = 0, practica = 0, op = 1 }) {
  const L = [["1", "Lo básico", "3 min", VERDE], ["2", "Paso a paso", "4 min", AZUL], ["3", "Errores comunes", "3 min", CORAL]];
  return (
    <div style={{ position: "absolute", left: x - 250, top: y, width: 500, height: 1020, transform: `scale(${esc})`, transformOrigin: "50% 0", opacity: op }}>
      <div style={{ position: "absolute", inset: 0, background: TINTA, borderRadius: 70, boxShadow: "0 20px 0 rgba(0,0,0,.25)" }} />
      <div style={{ position: "absolute", left: 20, top: 20, right: 20, bottom: 20, background: "#F7F4EC", borderRadius: 52, overflow: "hidden", padding: "70px 28px 0" }}>
        <div style={{ position: "absolute", left: 180, top: 18, width: 100, height: 26, borderRadius: 13, background: TINTA }} />
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 30, color: "#8A8478" }}>Tu curso</div>
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA, lineHeight: 1.05, marginTop: 4 }}>Inducción del equipo</div>
        <div style={{ height: 18, background: "#E3DED2", borderRadius: 9, marginTop: 18, overflow: "hidden" }}>
          <div style={{ width: `${12 + 60 * clamp01(lecciones - 0.5) + 28 * clamp01(practica)}%`, height: "100%", background: VERDE }} />
        </div>
        {L.map(([n, txt, min, color], i) => {
          const q = clamp01(lecciones * 3 - i);
          return (
            <div key={n} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16, background: "#FFFFFF", border: `5px solid ${TINTA}`, borderRadius: 24, padding: "10px 16px", transform: `translateX(${(1 - sale(q)) * 520}px)`, opacity: q > 0 ? 1 : 0 }}>
              <div style={{ width: 66, height: 66, borderRadius: 18, background: color, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</div>
              <div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 34, color: TINTA, lineHeight: 1.1 }}>{txt}</div>
                <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 28, color: "#8A8478" }}>{min}</div>
              </div>
            </div>
          );
        })}
        {/* tarjeta de práctica */}
        {practica > 0 && (
          <div style={{ marginTop: 16, background: MANGO, border: `5px solid ${TINTA}`, borderRadius: 26, padding: "16px 20px 20px", transform: `scale(${rebote(clamp01(practica))})`, transformOrigin: "50% 0" }}>
            <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 28, color: TINTA }}>PRÁCTICA</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 34, color: TINTA, lineHeight: 1.1, marginTop: 4 }}>¿Qué haces primero?</div>
            {["Leer todo", "Probar el paso 1"].map((o, i) => {
              const bien = i === 1 && practica > 1.4;
              return <div key={o} style={{ marginTop: 10, background: bien ? VERDE : "#FFFFFF", color: bien ? "#fff" : TINTA, border: `4px solid ${TINTA}`, borderRadius: 16, padding: "8px 16px", fontFamily: "Inter", fontWeight: 800, fontSize: 30 }}>{bien ? "✓ " : ""}{o}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* el PDF se vuelve página: las hojas vuelan al teléfono */
function Transforma({ t }) {
  const t0 = W(4, "vuelve", 0.3) - 0.2;
  const vuela = rampa(t, t0, 0.9);
  const tel = rampa(t, t0 + 0.4, 0.5);
  const lecciones = rampa(t, W(4, "lecciones", 0.6) - 0.1, 0.9);
  const practica = rampa(t, W(4, "práctica", 0.85) - 0.1, 0.4) * 2;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #FFF1D6, #F2D29C)" }}>
      {/* el PDF que se deshace */}
      <Pdf x={540} y={980} w={420} p={1 - clamp01(vuela * 1.4 - 0.4)} esc={1 - 0.6 * sale(vuela)} giro={-6 * vuela} />
      {Array.from({ length: 10 }, (_, k) => {
        const q = clamp01(vuela * 1.6 - k * 0.06);
        if (q <= 0 || q >= 1) return null;
        const ax = 540 + Math.sin(k * 2.3) * 300 * Math.sin(q * Math.PI), ay = 700 - 300 * Math.sin(q * Math.PI) + q * 100;
        return <div key={k} style={{ position: "absolute", left: ax - 60, top: ay - 75, width: 120, height: 150, background: "#FFFFFF", border: `5px solid ${TINTA}`, borderRadius: 8, transform: `rotate(${k * 40 + q * 300}deg) scale(${1 - q * 0.6})` }} />;
      })}
      <Telefono t={t} x={540} y={280 + (1 - sale(tel)) * 1300} esc={0.98} lecciones={lecciones} practica={practica} op={tel > 0 ? 1 : 0} />
    </AbsoluteFill>
  );
}

const PLANOS = [
  { id: "oficina", desde: 0, entra: "corte" },
  { id: "dormidos", desde: W(2, "Nadie", 0.6) - 0.15, entra: "zoom" },
  { id: "elige", desde: S(3) - 0.2, entra: "barrido" },
  { id: "transforma", desde: S(4) - 0.2, entra: "zoom" },
  { id: "sala", desde: S(5) - 0.25, entra: "barrido" },
];

function pinta(pl, t) {
  if (pl.id === "oficina") return <Oficina t={t} />;
  if (pl.id === "dormidos") {
    const cam = camara(t, [[pl.desde, 1.08, 540, 1000], [E(2) + 0.4, 1.0, 540, 960]]);
    return <Camara {...cam} t={t}><Sala t={t} pantalla={<Muro t={t} />} /></Camara>;
  }
  if (pl.id === "elige") {
    const p = rampa(t, S(3) - 0.1, 0.5);
    const restante = T.TRAMOS[3].v - t;
    const cuenta = t > E(3) + 0.1 && restante > 0 ? Math.min(2, Math.ceil(restante / 0.6)) : null;
    const pdf = <svg width="150" height="180" viewBox="0 0 150 180"><rect x="10" y="10" width="130" height="160" rx="12" fill="#fff" stroke={TINTA} strokeWidth="8" /><rect x="10" y="10" width="130" height="44" rx="10" fill="#D9443A" stroke={TINTA} strokeWidth="8" /><text x="75" y="44" textAnchor="middle" fontFamily="Sora" fontWeight="800" fontSize="32" fill="#fff">PDF</text>{[80, 102, 124, 146].map((y) => <rect key={y} x="30" y={y} width="90" height="10" rx="5" fill="#CFC9BD" />)}</svg>;
    const tel = <svg width="120" height="190" viewBox="0 0 120 190"><rect x="8" y="6" width="104" height="178" rx="22" fill={TINTA} /><rect x="18" y="22" width="84" height="146" rx="12" fill="#F7F4EC" />{[0, 1, 2].map((k) => <rect key={k} x="26" y={36 + k * 40} width="68" height="30" rx="8" fill={[VERDE, AZUL, CORAL][k]} />)}</svg>;
    return (
      <AbsoluteFill style={{ background: "linear-gradient(#DDE6F0, #C9D6E6)" }}>
        <Opciones t={t} p={p} y={520} elige={t > S(4) - 0.35 ? 2 : 0} cuenta={cuenta}
          a={{ txt: <>Mandar<br />el PDF</>, icono: pdf }} b={{ txt: <>Una página<br />que se usa</>, icono: tel }} />
      </AbsoluteFill>
    );
  }
  if (pl.id === "transforma") return <Transforma t={t} />;
  /* sala final: el zorro enseña con la página en la pantalla y el público despierto */
  const despiertos = rampa(t, S(5) + 0.1, 1.4);
  const ensena = rampa(t, W(5, "enseñas", 0.8) - 0.1, 0.3);
  const logo = rampa(t, T.DURACION_S - 1.8, 0.45);
  const zorro = (
    <>
      <Sombra x={900} y={1160} w={260} />
      <Mascota esp="zorro-corbata" x={900} y={1160} alto={520} t={t} semilla={2} cara={ensena > 0.5 ? "feliz" : "tranquila"} bd={-60 + 8 * Math.sin(t * 4)} bi={ensena > 0.5 ? -40 * pulso(t, W(5, "enseñas", 0.8), 0.6) : 0}
        cab={4 * Math.sin(t * 2.5)} salto={26 * pulso(t, W(5, "enseñas", 0.8) - 0.1, 0.45)} op={1 - logo} />
    </>
  );
  const pantalla = (
    <div style={{ position: "absolute", inset: 0, background: "#F7F4EC", display: "flex", alignItems: "center", gap: 30, padding: "0 50px", opacity: 1 - logo }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 50, color: TINTA, lineHeight: 1.05 }}>Inducción del equipo</div>
        {["Lo básico", "Paso a paso", "Errores comunes"].map((x, i) => (
          <div key={x} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14, fontFamily: "Inter", fontWeight: 800, fontSize: 34, color: TINTA }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: [VERDE, AZUL, CORAL][i], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora" }}>{i + 1}</div>{x}
          </div>
        ))}
      </div>
    </div>
  );
  const sello = rampa(t, W(5, "armamos", 0.4) - 0.05, 0.45) * (1 - rampa(t, S(6) - 0.1, 0.3));
  const cam = camara(t, [[S(5) - 0.3, 1.0, 540, 960]]);
  return (
    <Camara {...cam} t={t}>
      <Sala t={t} tres despiertos={despiertos} pantalla={pantalla} zorro={zorro}
        extra={<><Sello p={sello} x={540} y={560} texto="La armamos nosotros" color={AZUL} tam={68} giro={-5} /><Logo p={logo} y={380} /></>} />
    </Camara>
  );
}

export function Capacitar({ sinSonido = false, zonas = false, sinSubs = false }) {
  const sfx = [];
  const fx = (t, f, vol = 0.5) => sfx.push({ t, f, vol });
  fx(W(1, "dice", 0.3), "pop", 0.45); fx(W(1, "Para", 0.75) - 0.1, "pop", 0.45);
  fx(W(1, "veinte", 0.5), "desliza", 0.35); fx(W(1, "viernes", 0.9), "golpe", 0.4);
  fx(W(2, "PDF", 0.3) + 0.12, "golpe", 0.55); for (let k = 0; k < 6; k++) fx(W(2, "ochenta", 0.5) + k * 0.1, "papel", 0.25);
  fx(PLANOS[1].desde, "whoosh", 0.4); fx(PLANOS[1].desde + 0.4, "suspiro", 0.35);
  fx(PLANOS[2].desde, "barrido", 0.4); fx(S(3) + 0.1, "pop", 0.45); fx(S(3) + 0.35, "pop", 0.45); fx(E(3) + 0.1, "redoble", 0.35); fx(S(4) - 0.35, "ding", 0.5);
  fx(PLANOS[3].desde, "whoosh", 0.45); for (let k = 0; k < 5; k++) fx(W(4, "vuelve", 0.3) - 0.15 + k * 0.14, "papel", 0.28);
  fx(W(4, "lecciones", 0.6), "desliza", 0.4); fx(W(4, "práctica", 0.85) - 0.1, "pop", 0.45); fx(W(4, "práctica", 0.85) + 0.6, "ding", 0.4);
  fx(PLANOS[4].desde, "barrido", 0.4); fx(W(5, "armamos", 0.4), "golpe", 0.4); fx(W(5, "enseñas", 0.8), "campana", 0.35);
  fx(T.DURACION_S - 1.8, "ding", 0.45);
  const invita = (t) => (
    <Invita p={rampa(t, E(6) + 0.5, 0.3)} tam={56}>¿Qué curso <span style={{ color: CORAL }}>convertirías</span>?</Invita>
  );
  return <Reel T={T} planos={PLANOS} encima={invita} pinta={pinta} sfx={sfx} arte={ARTE_MARCA} musica="lofi" sinSonido={sinSonido} zonas={zonas} sinSubs={sinSubs} subY={1405} />;
}
export { VOZ };
