/*
 * Gestión de Proyectos · GP-07 «Cancelar a tiempo» (gp07-cancelar-a-tiempo).
 * Una idea: una fase es un conjunto de actividades relacionadas que culmina con uno o
 * más entregables; al final, el punto de revisión compara el desempeño con el caso de
 * negocio, el acta y otros documentos y decide: continuar, continuar con
 * modificaciones, finalizar, permanecer o repetir. Todas las fases = ciclo de vida;
 * predictivo (alcance temprano) o adaptativo (por iteraciones) (G 1.2.4.1–1.2.4.3).
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Celular, Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.35, 0.35, 0.3, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  cancelar: W(1, "Cancelar", 0.1), tiempo1: W(1, "tiempo", 0.35), acierto: W(1, "acierto.", 0.95),
  app: W(2, "app", 0.2), pan2: W(2, "pan.", 0.35), estudio2: W(2, "estudio:", 0.6), usaria: W(2, "usaría?", 0.95),
  fase3: W(3, "fase:", 0.3), actividades: W(3, "actividades", 0.45), entregable: W(3, "entregable.", 0.95),
  final4: W(4, "final", 0.15), carmen: W(4, "Carmen", 0.55), revisar: W(4, "revisar.", 0.95),
  logrado: W(5, "logrado", 0.2), caso: W(5, "caso", 0.45), acta: W(5, "acta", 0.8),
  seguir: W(6, "seguir,", 0.2), cambios: W(6, "cambios,", 0.4), quedarse: W(6, "quedarse,", 0.55), repetir: W(6, "repetir", 0.7), terminar: W(6, "terminar", 0.88),
  punto: W(7, "punto", 0.3), revision7: W(7, "revisión", 0.55), fase7: W(7, "fase.", 0.95),
  telefono: W(8, "teléfono.", 0.45), carmen8: W(8, "Carmen", 0.6), terminamos: W(8, "terminamos", 0.8), aqui: W(8, "aquí.", 0.95),
  gastaron: W(9, "Gastaron", 0.1), estudio9: W(9, "estudio,", 0.35), app9: W(9, "app", 0.6), usar: W(9, "usar.", 0.95),
  fases10: W(10, "fases", 0.1), inicio: W(10, "inicio", 0.35), conclusion: W(10, "conclusión,", 0.55), ciclo: W(10, "ciclo", 0.75),
  principio: W(11, "principio,", 0.3), predictivo: W(11, "predictivo;", 0.45), iteracion: W(11, "iteración", 0.7), adaptativo: W(11, "adaptativo.", 0.95),
  toca: W(12, "toca:", 0.15), revision12: W(12, "revisión.", 0.55), decides: W(12, "decides?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "fase", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "revision", desde: S(4) - 0.3, entra: "barrido" },
  { tipo: "opciones", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "decision", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "ciclo", desde: S(10) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

const OPC = [["▶️", "seguir a la siguiente fase"], ["↪️", "seguir con cambios"], ["⏸️", "quedarse en la fase"], ["🔁", "repetir la fase"], ["⏹️", "terminar"]];

/* Talanquera del punto de revisión: barra que sube (abre 0..1) */
function Talanquera({ x, y, w, abre = 0, p = 1 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${rebote(Math.min(1, p))})`, transformOrigin: "0 100%" }}>
      <div style={{ position: "absolute", left: -30, top: -160, width: 60, height: 160, background: "#596579", border: `7px solid ${TINTA}`, borderRadius: 10 }} />
      <div style={{ position: "absolute", left: 0, top: -140, width: w, height: 40, transformOrigin: "0 50%", transform: `rotate(${-70 * sale(abre)}deg)`, background: `repeating-linear-gradient(90deg,${ROJO} 0 50px,#fff 50px 100px)`, border: `7px solid ${TINTA}`, borderRadius: 14 }} />
    </div>
  );
}

/* Carmen, la socia (gato con gafas) */
const Carmen = ({ x, t, cara = "tranquila", bd = 0, espejo = true, alto = 480, placa = 0 }) => (
  <>
    <Sombra x={x} y={1500} w={230} />
    <Mascota esp="gato-gafas" x={x} y={1505} alto={alto} t={t} cara={cara} bd={bd} semilla={6} espejo={espejo} />
    <Placa x={x} y={1505 - alto - 130} nombre="Carmen" rol="Socia" p={placa} color={COLOR.CORAL} />
  </>
);

/* ═════ 1 · Cancelar a tiempo también es un acierto ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(4px)" velo={0.1}>
      <Cartel x={540} y={420} txt="⏹️ cancelar" p={rampa(t, M.cancelar - 0.2, 0.35)} tam={96} fondo={ROJO} color="#fff" giro={-3} />
      <Gigante x={540} y={660} txt="=" p={rampa(t, M.acierto - 0.8, 0.3)} tam={150} />
      <Cartel x={540} y={880} txt="✓ acierto" p={rampa(t, M.acierto - 0.5, 0.35)} tam={96} fondo={COLOR.VERDE} color="#fff" giro={2} />
      <Sombra x={540} y={1510} w={280} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={520} t={t} cara={t > M.acierto - 0.4 ? "guino" : "tranquila"} bi={-60 * pulso(t, M.acierto - 0.5, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · La app y su primera fase: un estudio ═════ */
function Fase({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: S(3) + 0.6, s: 1.0, x: 540, y: 940 }]);
  const enFase = rampa(t, S(3) - 0.3, 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(3px)" velo={0.1}>
      <div style={{ opacity: 1 - enFase }}>
        <Globo x={240} y={260} w={600} h={620} p={rampa(t, M.app - 0.4, 0.4)} cola="izq">
          <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 620 }}>
            <Celular x={180} y={320} w={220} p={rampa(t, M.app - 0.2, 0.4)} giro={-5}>
              <div style={{ textAlign: "center", fontSize: 90, marginTop: 50 }}>🥖</div>
              <div style={{ textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 30, color: TINTA }}>pedir pan</div>
            </Celular>
            <Gigante x={440} y={330} txt="?" p={rampa(t, M.usaria - 0.5, 0.35)} tam={180} />
          </div>
        </Globo>
        <Cartel x={620} y={1000} txt="📋 primero, un estudio" p={rampa(t, M.estudio2 - 0.4, 0.35)} tam={52} fondo={MANGO} />
      </div>
      {enFase > 0 && (
        <>
          <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 760, border: `10px solid ${AZUL}`, borderRadius: 40, background: "rgba(255,253,247,.4)", opacity: enFase }}>
            <div style={{ position: "absolute", left: 30, top: -46, background: AZUL, color: "#fff", border: `6px solid ${TINTA}`, borderRadius: 18, padding: "4px 22px 8px", fontFamily: "Sora", fontWeight: 800, fontSize: 52 }}>fase: el estudio</div>
          </div>
          {[["📝", "encuesta"], ["🗣️", "entrevistas"], ["📊", "resultados"]].map(([ic, txt], k) => <Ficha key={k} x={220 + k * 320} y={560} w={250} icono={ic} txt={txt} p={rampa(t, M.actividades - 0.3 + k * 0.2, 0.4)} />)}
          <Flecha x0={540} y0={720} x1={540} y1={830} p={rampa(t, M.entregable - 0.7, 0.3)} />
          <Ficha x={540} y={1000} w={300} icono="📄" txt="entregable: informe" p={rampa(t, M.entregable - 0.4, 0.4)} fondo={MANGO} />
        </>
      )}
      <Sombra x={160} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={160} y={1515} alto={380} t={t} cara="estrellas" bi={-50 * pulso(t, M.app - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–5 · Pía y Carmen revisan ═════ */
function Revision({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.2, b: E(5), s: 1.04, x: 540, y: 940 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Documento x={180} y={640} w={240} p={rampa(t, M.logrado - 0.4, 0.4)} titulo="informe" letra={40} giro={-4} />
      <Gigante x={400} y={640} txt="⇄" p={rampa(t, M.logrado, 0.35)} tam={120} />
      <Documento x={620} y={640} w={240} p={rampa(t, M.caso - 0.4, 0.4)} titulo="caso de negocio" letra={32} giro={3} />
      <Documento x={880} y={640} w={240} p={rampa(t, M.acta - 0.4, 0.4)} titulo="acta" letra={40} giro={-3} />
      {/* la mesa */}
      <Sombra x={260} y={1500} w={240} />
      <Mascota esp="hamster-gorra" x={260} y={1505} alto={460} t={t} cara="tranquila" bd={-50 * pulso(t, M.caso - 0.3, 1)} semilla={3} />
      <Carmen x={820} t={t} placa={rampa(t, M.carmen - 0.2, 0.35) * (1 - rampa(t, S(5) - 0.2, 0.3))} bd={-50 * pulso(t, M.acta - 0.3, 1)} />
    </Escena>
  );
}

/* ═════ 6–7 · Las cinco decisiones y el punto de revisión ═════ */
function Opciones({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.02, x: 540, y: 960 }]);
  const tw = [M.seguir, M.cambios, M.quedarse, M.repetir, M.terminar];
  return (
    <Escena cam={cam} fondo="art/carretera.jpg" filtro="blur(4px)" velo={0.2}>
      {OPC.map(([ic, txt], k) => {
        const p = rampa(t, tw[k] - 0.3, 0.35);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 60, top: 280 + k * 150, width: 960, height: 124, display: "flex", alignItems: "center", gap: 24, background: k === 4 ? "#FFD3CF" : CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, padding: "0 28px", transform: `translateX(${(1 - sale(p)) * 900}px)`, fontFamily: "Sora", fontWeight: 800, fontSize: 50, whiteSpace: "nowrap", color: TINTA, boxShadow: "0 8px 0 rgba(42,30,23,.25)" }}>
            <span style={{ fontSize: 66 }}>{ic}</span>{txt}
          </div>
        );
      })}
      <Talanquera x={110} y={1400} w={500} p={rampa(t, M.punto - 0.4, 0.4)} abre={0} />
      <Sombra x={760} y={1500} w={190} />
      <Mascota esp="hamster-gorra" x={760} y={1505} alto={330} t={t} cara="tranquila" bd={-50 * pulso(t, M.seguir - 0.3, 1)} semilla={3} />
      <Carmen x={950} t={t} alto={360} bd={-50 * pulso(t, M.terminar - 0.3, 1)} />
      <Cartel x={540} y={1110} txt="punto de revisión de fase" p={rampa(t, M.revision7 - 0.3, 0.35)} tam={56} fondo={MANGO} />
    </Escena>
  );
}

/* ═════ 8–9 · El estudio dice: teléfono. Terminamos aquí ═════ */
function Decision({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(9) - 0.2, b: E(9), s: 1.03, x: 540, y: 960 }]);
  const enPlata = rampa(t, S(9) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <div style={{ opacity: 1 - enPlata }}>
        <Ficha x={330} y={560} w={300} icono="☎️" txt="prefieren llamar" p={rampa(t, M.telefono - 0.5, 0.4)} />
        <Dicho x={540} y={320} w={460} h={260} colaX={840} p={rampa(t, M.terminamos - 0.4, 0.4)}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 460, height: 260, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA, lineHeight: 1.15 }}>⏹️ terminamos<br />aquí</div>
        </Dicho>
      </div>
      {enPlata > 0 && (
        <div style={{ opacity: enPlata }}>
          <Ficha x={280} y={600} w={290} icono="💵" txt="el estudio" p={rampa(t, M.estudio9 - 0.4, 0.4)} fondo={COLOR.VERDE} />
          <Ficha x={780} y={600} w={330} icono="💰💰💰" txt="una app sin usuarios" p={rampa(t, M.app9 - 0.3, 0.4)} />
          <Tachon x={780} y={600} w={380} p={rampa(t, M.usar - 0.4, 0.3)} />
        </div>
      )}
      <Talanquera x={430} y={1120} w={360} p={rampa(t, M.aqui - 0.5, 0.4) * (1 - enPlata)} abre={0} />
      <Sombra x={260} y={1500} w={240} />
      <Mascota esp="hamster-gorra" x={260} y={1505} alto={420} t={t} cara={t > S(9) ? "feliz" : "tranquila"} semilla={3} />
      <Carmen x={830} t={t} alto={500} cara={t > M.aqui ? "feliz" : "tranquila"} bd={-80 * pulso(t, M.terminamos - 0.4, 1.2)} />
    </Escena>
  );
}

/* ═════ 10–11 · Ciclo de vida; predictivo o adaptativo ═════ */
function Ciclo({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11) - 0.2, b: E(11), s: 1.02, x: 540, y: 990 }]);
  const pCiclo = rampa(t, M.ciclo - 0.3, 0.4);
  const fases = [0, 1, 2];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.15}>
      <Pizarra x={40} y={200} w={1000} h={1300}>
        <Tiza x={470} y={20} txt="ciclo de vida del proyecto" p={pCiclo} tam={76} centro color={MANGO} />
        {/* tres fases con su revisión */}
        {fases.map((k) => (
          <div key={k}>
            <TrazoTiza d={`M ${30 + k * 310} 180 L ${270 + k * 310} 180 L ${270 + k * 310} 350 L ${30 + k * 310} 350 Z`} p={rampa(t, M.fases10 - 0.3 + k * 0.25, 0.4)} w={9} />
            <Tiza x={150 + k * 310} y={225} txt={`fase ${k + 1}`} p={rampa(t, M.fases10 - 0.1 + k * 0.25, 0.3)} tam={84} centro />
            <TrazoTiza d={`M ${300 + k * 310} 160 L ${300 + k * 310} 370`} p={rampa(t, M.fases10 + 0.2 + k * 0.25, 0.3)} w={12} color="#FF9B95" />
          </div>
        ))}
        <Tiza x={30} y={380} txt="inicio" p={rampa(t, M.inicio - 0.2, 0.3)} tam={72} color="#9FE0B4" />
        <Tiza x={620} y={380} txt="conclusión" p={rampa(t, M.conclusion - 0.3, 0.3)} tam={72} color="#9FE0B4" />
        {/* predictivo */}
        <Tiza x={30} y={520} txt="predictivo" p={rampa(t, M.predictivo - 0.4, 0.4)} tam={104} color={MANGO} />
        <Tiza x={30} y={630} txt="alcance definido al principio" p={rampa(t, M.principio - 0.4, 0.5)} tam={68} />
        <TrazoTiza d="M 60 750 L 260 750 L 260 820 L 460 820 L 460 890 L 660 890" p={rampa(t, M.predictivo - 0.2, 0.6)} w={10} flecha />
        {/* adaptativo */}
        <Tiza x={30} y={960} txt="adaptativo" p={rampa(t, M.adaptativo - 0.5, 0.4)} tam={104} color="#9FE0B4" />
        <Tiza x={30} y={1070} txt="se define iteración por iteración" p={rampa(t, M.iteracion - 0.4, 0.5)} tam={68} />
        {[0, 1, 2].map((k) => <Gigante key={k} x={160 + k * 230} y={1210} txt="↻" p={rampa(t, M.iteracion - 0.1 + k * 0.15, 0.3)} tam={140} color="#9FE0B4" giro={(t - M.iteracion) * 90} />)}
      </Pizarra>
    </Escena>
  );
}

/* ═════ 12 · ¿Qué decides? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/carretera.jpg" filtro="blur(6px)" velo={0.25}>
      {OPC.map(([ic, txt], k) => <Ficha key={k} x={[200, 540, 880, 370, 710][k]} y={k < 3 ? 470 : 760} w={250} icono={ic} txt={txt} p={rampa(t, M.toca - 0.3 + k * 0.1, 0.35)} />)}
      <Gigante x={540} y={1000} txt="?" p={rampa(t, M.decides - 0.5, 0.35)} tam={180} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={500} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.decides - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "fase") return <Fase t={t} />;
  if (p.tipo === "revision") return <Revision t={t} />;
  if (p.tipo === "opciones") return <Opciones t={t} />;
  if (p.tipo === "decision") return <Decision t={t} />;
  if (p.tipo === "ciclo") return <Ciclo t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cancelar - 0.2, "toc-grave", 0.4); fx(M.acierto - 0.5, "ding", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.app - 0.4, "burbuja", 0.4); fx(M.estudio2 - 0.4, "papel", 0.35); fx(M.usaria - 0.5, "pop", 0.35);
fx(S(3) - 0.3, "desliza", 0.35); [0, 1, 2].forEach((k) => fx(M.actividades - 0.3 + k * 0.2, "pop-suave", 0.3)); fx(M.entregable - 0.4, "ding", 0.35);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.carmen - 0.2, "pop", 0.3); fx(M.logrado - 0.4, "papel", 0.35); fx(M.caso - 0.4, "papel", 0.3); fx(M.acta - 0.4, "papel", 0.3);
fx(S(6) - 0.3, "barrido-lento", 0.35); [M.seguir, M.cambios, M.quedarse, M.repetir, M.terminar].forEach((w) => fx(w - 0.3, "desliza", 0.3));
fx(M.punto - 0.4, "golpe", 0.35); fx(M.revision7 - 0.3, "campana", 0.4);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.telefono - 0.5, "ding", 0.3); fx(M.terminamos - 0.4, "pop", 0.35); fx(M.aqui - 0.5, "toc-grave", 0.4);
fx(M.estudio9 - 0.4, "monedas", 0.3); fx(M.app9 - 0.3, "pop", 0.3); fx(M.usar - 0.4, "toc", 0.35);
fx(S(10) - 0.3, "barrido-lento", 0.35); fx(M.ciclo - 0.3, "tiza-larga", 0.4); fx(M.predictivo - 0.4, "tiza", 0.35); fx(M.adaptativo - 0.5, "tiza", 0.35); fx(M.iteracion - 0.1, "rebobina", 0.3);
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/panaderia.jpg", "art/carretera.jpg"];
const CLAVE = /^(fase|fase:|fase\.|entregable\.|revisión|punto|ciclo|vida|predictivo;|adaptativo\.|terminar|acierto\.)[.,:?…!¡;]*$/i;

export const DURACION = T.DURACION_S;
export const GP07 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp07-cancelar-a-tiempo-v2.mp3" sinSonido={sinSonido} />
);
