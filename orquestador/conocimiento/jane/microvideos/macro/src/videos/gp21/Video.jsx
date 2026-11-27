/*
 * Gestión de Proyectos · GP-21 «El vecino que nadie invitó» (gp21-interesados).
 * Una idea: Identificar a los Interesados es identificar periódicamente a los interesados y
 * documentar sus intereses, participación, influencia y posible impacto (13.1, p. 507).
 * Interesado: puede afectar, verse afectado o percibirse afectado (Glosario). Matriz de
 * poder/interés (13.1.2.4, p. 512). Registro de interesados: identificación, evaluación y
 * clasificación, p. ej. interno/externo (13.1.3.1, p. 514).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.3, 0.3, 0.35, 0.3, 0.35, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  vecino: W(1, "vecino", 0.15), invito: W(1, "invitó", 0.4), frenar: W(1, "frenar", 0.7),
  carrito2: W(2, "carrito", 0.3), garaje: W(2, "garaje", 0.5), tito2: W(2, "Tito,", 0.65), queja: W(2, "queja", 0.8), alcaldia: W(2, "alcaldía.", 0.95),
  nadie: W(3, "Nadie", 0.1), interesado3: W(3, "interesado.", 0.95),
  afectar: W(4, "afectar", 0.4), verse: W(4, "verse", 0.6), sentirse: W(4, "sentirse", 0.8),
  quienes: W(5, "quiénes", 0.35), intereses: W(5, "intereses", 0.5), influyen: W(5, "influyen", 0.7), impacto: W(5, "impacto", 0.9),
  sola: W(6, "sola", 0.3), repite: W(6, "repite", 0.65), proyecto6: W(6, "proyecto.", 0.95),
  ordenarlos: W(7, "ordenarlos,", 0.15), matriz: W(7, "matriz", 0.6), poder7: W(7, "poder", 0.8), interes7: W(7, "interés.", 0.95),
  carmen8: W(8, "Carmen", 0.05), mucho8: W(8, "mucho", 0.2), tito8: W(8, "Tito,", 0.55), menos: W(8, "menos", 0.65), interes8: W(8, "interés.", 0.95),
  registro9: W(9, "registro", 0.6), interesados9: W(9, "interesados.", 0.95),
  rol: W(10, "rol,", 0.2), espera: W(10, "espera,", 0.35), influir: W(10, "influir", 0.5), clasifica: W(10, "clasifica:", 0.65), interno: W(10, "interno", 0.85), externo: W(10, "externo.", 0.95),
  toca: W(11, "toca:", 0.15), arma: W(11, "arma", 0.3), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "garaje", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "define", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "matriz", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "registro", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* Portón de garaje (rayas grises) */
function Garaje({ x, y, w, h }) {
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, background: "#9AA4B2", border: `8px solid ${TINTA}`, borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
      {[...Array(6)].map((_, k) => <div key={k} style={{ position: "absolute", left: 0, right: 0, top: (k + 1) * h / 7, height: 8, background: "rgba(42,30,23,.35)" }} />)}
    </div>
  );
}

/* ═════ 1 · El vecino que nadie invitó ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Ficha x={540} y={560} w={330} icono="✉️" txt="invitados" p={rampa(t, M.vecino - 0.3, 0.35)} letra={50} giro={-3} />
      <Tachon x={540} y={560} w={300} p={rampa(t, M.invito - 0.1, 0.3)} />
      <Cartel x={540} y={900} txt="✋ ¡alto ahí!" p={rampa(t, M.frenar - 0.3, 0.35)} tam={70} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="perro-mochila" x={540} y={1515} alto={440} t={t} cara={t > M.frenar - 0.3 ? "triste" : "tranquila"} bd={-80 * pulso(t, M.frenar - 0.3, 1.2)} semilla={12} />
    </Escena>
  );
}

/* ═════ 2–3 · El carrito tapa el garaje de don Tito ═════ */
function GarajeEsc({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.04, x: 540, y: 960 }]);
  const xc = lerp(-300, 400, sale(rampa(t, M.carrito2 - 0.6, 1.0)));
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(3px)" velo={0.1}>
      <Garaje x={400} y={1200} w={560} h={600} />
      <Carrito x={xc} y={1140} w={400} p={1} t={t} />
      <Cartel x={400} y={520} txt="🚗 garaje de don Tito" p={rampa(t, M.garaje - 0.3, 0.35)} tam={46} fondo={CREMA} />
      <Documento x={850} y={430} w={210} p={rampa(t, M.queja - 0.3, 0.4)} titulo="queja" letra={36} giro={6} />
      <Gigante x={850} y={700} txt="🏛️" p={rampa(t, M.alcaldia - 0.5, 0.35)} tam={100} />
      <Cartel x={540} y={300} txt="también es un interesado" p={rampa(t, M.interesado3 - 0.7, 0.35)} tam={56} fondo={MANGO} giro={-2} />
      <Sombra x={860} y={1510} w={220} />
      <Mascota esp="perro-mochila" x={860} y={1515} alto={420} t={t} cara={t > M.tito2 - 0.3 ? "triste" : "tranquila"} bd={-90 * pulso(t, M.queja - 0.3, 1.4)} salto={20 * Math.abs(Math.sin(t * 8)) * pulso(t, M.queja - 0.3, 1.4)} semilla={12} espejo />
      <Placa x={860} y={1020} nombre="don Tito" rol="vecino" p={rampa(t, M.tito2 - 0.3, 0.35) * (1 - rampa(t, M.queja - 0.4, 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 4–6 · Qué es un interesado y qué se identifica ═════ */
function Define({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6) - 0.2, b: E(6), s: 1.02, x: 540, y: 960 }]);
  const enP = rampa(t, S(5) - 0.4, 0.35);
  const def = [[M.afectar, "👉", "puede afectarlo"], [M.verse, "🎯", "se ve afectado"], [M.sentirse, "💭", "se siente afectado"]];
  const qq = [[M.quienes, "🧑", "¿quiénes son?"], [M.intereses, "❤️", "¿qué intereses?"], [M.influyen, "📣", "¿cuánto influyen?"], [M.impacto, "💥", "¿qué impacto?"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={260} txt="interesado" p={rampa(t, S(4) - 0.2, 0.35)} tam={66} fondo={MANGO} />
      <div style={{ opacity: 1 - enP }}>
        {def.map(([tw, ic, txt], k) => <Ficha key={k} x={190 + k * 350} y={620} w={300} icono={ic} txt={txt} p={rampa(t, tw - 0.35, 0.35)} letra={40} giro={(k - 1) * 3} />)}
      </div>
      {qq.map(([tw, ic, txt], k) => {
        const q = rampa(t, tw - 0.4, 0.35) * enP;
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 40 + (k % 2) * 510, top: 400 + Math.floor(k / 2) * 190, width: 490, height: 160, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "0 20px", background: CREMA, border: `7px solid ${TINTA}`, borderRadius: 24, fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, transform: `scale(${rebote(q)})`, boxShadow: "0 9px 0 rgba(42,30,23,.25)" }}>
            <span style={{ fontSize: 72 }}>{ic}</span><span style={{ lineHeight: 1.05 }}>{txt}</span>
          </div>
        );
      })}
      <Cartel x={540} y={880} txt="🔁 a lo largo del proyecto" p={rampa(t, M.repite - 0.4, 0.35)} tam={54} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Sombra x={540} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={380} t={t} cara="feliz" bi={-50 * pulso(t, M.quienes - 0.3, 1)} cab={-6 * Math.sin(t * 2)} semilla={3} />
    </Escena>
  );
}

/* ═════ 7–8 · Matriz de poder e interés ═════ */
function Matriz({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8) - 0.2, b: E(8), s: 1.03, x: 540, y: 960 }]);
  const pM = sale(rampa(t, M.matriz - 0.5, 0.6));
  const X0 = 170, Y0 = 380, L = 780;
  const ponCarmen = sale(rampa(t, M.mucho8 - 0.4, 0.6));
  const ponTito = sale(rampa(t, M.menos - 0.4, 0.6));
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      <Cartel x={540} y={250} txt="matriz de poder e interés" p={rampa(t, M.matriz - 0.4, 0.35)} tam={54} fondo={MANGO} />
      {pM > 0 && (
        <div style={{ position: "absolute", left: X0, top: Y0, width: L, height: L, opacity: pM, transform: `scale(${lerp(0.9, 1, pM)})` }}>
          {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", left: (k % 2) * L / 2, top: Math.floor(k / 2) * L / 2, width: L / 2, height: L / 2, boxSizing: "border-box", background: k === 1 ? "rgba(231,111,81,.25)" : "rgba(255,253,247,.85)", border: `6px solid ${TINTA}` }} />)}
          <div style={{ position: "absolute", left: -110, top: L / 2 - 30, transform: "rotate(-90deg)", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, opacity: rampa(t, M.poder7 - 0.3, 0.35) }}>poder ↑</div>
          <div style={{ position: "absolute", left: L / 2 - 90, top: L + 14, fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA, opacity: rampa(t, M.interes7 - 0.4, 0.35) }}>interés →</div>
        </div>
      )}
      {ponCarmen > 0 && (
        <div style={{ opacity: ponCarmen }}>
          <Sombra x={lerp(540, X0 + L * 0.75, ponCarmen)} y={Y0 + L * 0.42} w={120} />
          <Mascota esp="gato-gafas" x={lerp(540, X0 + L * 0.75, ponCarmen)} y={Y0 + L * 0.42} alto={230} t={t} cara="feliz" semilla={6} />
          <Placa x={X0 + L * 0.75} y={Y0 + L * 0.06} nombre="Carmen" rol="" p={ponCarmen} color={COLOR.CORAL} />
        </div>
      )}
      {ponTito > 0 && (
        <div style={{ opacity: ponTito }}>
          <Sombra x={lerp(540, X0 + L * 0.78, ponTito)} y={Y0 + L * 0.94} w={120} />
          <Mascota esp="perro-mochila" x={lerp(540, X0 + L * 0.78, ponTito)} y={Y0 + L * 0.94} alto={220} t={t} cara="tranquila" semilla={12} />
          <Placa x={X0 + L * 0.78} y={Y0 + L * 0.58} nombre="don Tito" rol="" p={ponTito} color={COLOR.CORAL} />
        </div>
      )}
      <Sombra x={170} y={1510} w={180} />
      <Mascota esp="hamster-gorra" x={170} y={1515} alto={300} t={t} cara="feliz" bd={-60 * pulso(t, M.ordenarlos - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 9–10 · El registro de interesados ═════ */
function Registro({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const pR = rampa(t, M.registro9 - 0.5, 0.4);
  const COLS = [[M.rol, "quién · rol"], [M.espera, "espera"], [M.influir, "influye"], [M.clasifica, "clase"]];
  const FIL = [["🐱 Carmen · patrocinadora", "que venda", "mucho", "interna", M.interno], ["🐶 don Tito · vecino", "su garaje libre", "algo", "externo", M.externo]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {pR > 0 && (
        <div style={{ position: "absolute", left: 50, top: 260, width: 980, height: 900, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 28, transform: `scale(${rebote(pR)})`, boxShadow: "0 14px 0 rgba(42,30,23,.28)", fontFamily: "Sora", fontWeight: 800, color: TINTA }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 56 }}>registro de interesados</div>
          {FIL.map(([quien, esp, inf, cla, twC], r) => (
            <div key={r} style={{ position: "absolute", left: 30, right: 30, top: 130 + r * 370, height: 340, boxSizing: "border-box", background: "#FFF4DA", border: `6px solid ${TINTA}`, borderRadius: 22, padding: "18px 26px" }}>
              {COLS.map(([tw, nom], c) => {
                const q = rampa(t, (c === 3 ? twC : tw) - 0.4, 0.3);
                const val = [quien, esp, inf, cla][c];
                return (
                  <div key={c} style={{ display: "flex", alignItems: "baseline", gap: 18, height: 74, opacity: Math.max(0.25, q) }}>
                    <span style={{ width: 230, fontSize: 32, color: COLOR.CORAL }}>{nom}</span>
                    <span style={{ fontSize: 42, transform: `scale(${q > 0 ? lerp(0.9, 1, rebote(q)) : 1})`, transformOrigin: "0 50%" }}>{q > 0 ? val : "…"}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <Sombra x={540} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={300} t={t} cara="feliz" bd={-50 * pulso(t, M.registro9 - 0.4, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Arma tu registro ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="📋 arma tu registro" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      <Documento x={540} y={760} w={300} p={rampa(t, M.arma - 0.3, 0.4)} titulo="interesados" letra={40} giro={-3 + 3 * Math.sin(t * 2)} />
      <Sombra x={250} y={1530} w={220} />
      <Mascota esp="hamster-gorra" x={250} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11 - 0.2, 0.5)} semilla={3} />
      <Sombra x={560} y={1530} w={220} />
      <Mascota esp="gato-gafas" x={560} y={1535} alto={440} t={t} cara="feliz" semilla={6} />
      <Sombra x={860} y={1530} w={220} />
      <Mascota esp="perro-mochila" x={860} y={1535} alto={420} t={t} cara="feliz" semilla={12} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "garaje") return <GarajeEsc t={t} />;
  if (p.tipo === "define") return <Define t={t} />;
  if (p.tipo === "matriz") return <Matriz t={t} />;
  if (p.tipo === "registro") return <Registro t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.vecino - 0.3, "papel", 0.3); fx(M.invito - 0.1, "tiza", 0.3); fx(M.frenar - 0.3, "bocina", 0.3);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.carrito2 - 0.6, "camion", 0.2); fx(M.queja - 0.3, "papel", 0.35); fx(M.alcaldia - 0.5, "sello", 0.3); fx(M.interesado3 - 0.7, "ding", 0.35);
fx(S(4) - 0.3, "whoosh", 0.4); [M.afectar, M.verse, M.sentirse, M.quienes, M.intereses, M.influyen, M.impacto].forEach((w) => fx(w - 0.4, "pop-suave", 0.25)); fx(M.repite - 0.4, "rebobina", 0.3);
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.matriz - 0.5, "tiza-larga", 0.3); fx(M.mucho8 - 0.4, "desliza", 0.3); fx(M.menos - 0.4, "desliza", 0.3);
fx(S(9) - 0.3, "whoosh", 0.4); fx(M.registro9 - 0.5, "papel", 0.35); [M.rol, M.espera, M.influir, M.interno, M.externo].forEach((w) => fx(w - 0.4, "pop-suave", 0.22));
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(interesado|interesados|matriz|poder|interés|registro|interno|externo)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP21 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp21-interesados.mp3" sinSonido={sinSonido} />
);
