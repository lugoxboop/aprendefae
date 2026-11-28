/*
 * Gestión de Proyectos · GP-13 «Sin este papel» (gp13-acta).
 * Una idea: el acta de constitución la emite el patrocinador; autoriza formalmente la
 * existencia del proyecto y da al director la autoridad para usar los recursos de la
 * organización. Documenta información de alto nivel (propósito, objetivos medibles,
 * riesgo general, hitos, recursos financieros preaprobados, interesados clave, requisitos
 * de aprobación) y asegura una comprensión común (G 1.2.6.3, p. 34; 4.1.3.1, p. 81).
 * Puente al simulador «Arma tu acta».
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import { Carrito } from "../gp12/Video.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.35, 0.3, 0.35, 0.35, 0.3, 0.3, 0.3, 0.35, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  papel: W(1, "papel,", 0.15), existe1: W(1, "existe.", 0.45), empezado: W(1, "empezado.", 0.95),
  eligieron: W(2, "eligieron", 0.2), carrito: W(2, "carrito", 0.4), ruedas: W(2, "ruedas.", 0.95),
  frena: W(3, "frena:", 0.3), acta3: W(3, "acta».", 0.95),
  emite: W(4, "emite", 0.3), patrocinador: W(4, "patrocinador:", 0.5), carmen4: W(4, "Carmen,", 0.7), plata4: W(4, "plata.", 0.95),
  existe5: W(5, "existe", 0.4), formal: W(5, "formal.", 0.95),
  directora: W(6, "directora,", 0.2), autoridad: W(6, "autoridad", 0.4), recursos: W(6, "recursos:", 0.6), plata6: W(6, "plata,", 0.7), horno: W(6, "horno,", 0.82), gente: W(6, "gente.", 0.95),
  plan7: W(7, "plan:", 0.3), alto: W(7, "alto", 0.8), nivel: W(7, "nivel.", 0.95),
  proposito: W(8, "propósito:", 0.2), norte: W(8, "norte.", 0.95),
  objetivos: W(9, "objetivos", 0.15), cien: W(9, "cien", 0.45), diciembre: W(9, "diciembre.", 0.95),
  riesgo: W(10, "riesgo", 0.15), hitos: W(10, "hitos,", 0.3), preaprobada: W(10, "preaprobada,", 0.5), interesados: W(10, "interesados", 0.65), firma: W(10, "firma", 0.85), aprobacion: W(10, "aprobación.", 0.95),
  mismo: W(11, "mismo:", 0.3), entrega: W(11, "entrega,", 0.55), cuando: W(11, "cuándo", 0.7), que11: W(11, "qué.", 0.95, 1),
  toca: W(12, "toca:", 0.15), acta12: W(12, "acta", 0.55), proyecto12: W(12, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "frena", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "firma", desde: S(4) - 0.3, entra: "zoom" },
  { tipo: "acta", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "comun", desde: S(11) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Las casillas del acta, en orden de la guía (4.1.3.1) */
const CAMPOS = [
  [M.proposito, "🎯", "propósito", "pan en el barrio norte"],
  [M.objetivos, "📏", "objetivos medibles", "100 panes al día · diciembre"],
  [M.riesgo, "⚠️", "riesgo general", ""],
  [M.hitos, "🚩", "hitos", ""],
  [M.preaprobada, "💰", "recursos financieros preaprobados", ""],
  [M.interesados, "👥", "interesados clave", ""],
  [M.firma, "✍️", "quién firma la aprobación", ""],
];

/* ═════ 1 · Sin este papel, tu proyecto no existe ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={540} y={560} w={380} p={rampa(t, M.papel - 0.3, 0.4)} titulo="acta de constitución" letra={44} />
      <Destello x={540} y={560} r={300} p={rampa(t, M.papel - 0.2, 0.8)} />
      <Cartel x={540} y={920} txt="sin acta, no existe formalmente" p={rampa(t, M.existe1 - 0.4, 0.35)} tam={76} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara={t > M.empezado - 0.5 ? "triste" : "feliz"} semilla={3} />
    </Escena>
  );
}

/* ═════ 2–3 · Pía ya quiere comprar ruedas; Carmen la frena ═════ */
function Frena({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3) - 0.2, b: E(3), s: 1.04, x: 600, y: 960 }]);
  const frena = sale(rampa(t, M.frena - 0.4, 0.4));
  const xPia = lerp(180, 420, sale(rampa(t, M.ruedas - 1.0, 0.8))) - 80 * frena;
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(3px)" velo={0.1}>
      <div style={{ opacity: 0.45 }}><Carrito x={540} y={800} w={420} p={rampa(t, M.carrito - 0.3, 0.4)} t={0} /></div>
      <Cartel x={540} y={330} txt="✓ el carrito" p={rampa(t, M.eligieron - 0.3, 0.35)} tam={58} fondo={COLOR.VERDE} color="#fff" />
      <Gigante x={xPia + 40} y={1000} txt="🛞" p={rampa(t, M.ruedas - 0.5, 0.35)} tam={110} giro={t * 200} />
      <Dicho x={480} y={400} w={500} h={210} colaX={850} p={rampa(t, M.frena - 0.2, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: TINTA }}>✋ Primero, el acta.</div>
      </Dicho>
      <Sombra x={xPia} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={xPia} y={1515} alto={400} t={t} cara={frena > 0.5 ? "tranquila" : "estrellas"} salto={30 * Math.abs(Math.sin(t * 7)) * (1 - frena) * (t > M.ruedas - 1.0 ? 1 : 0)} semilla={3} />
      <Sombra x={850} y={1510} w={230} />
      <Mascota esp="gato-gafas" x={850} y={1515} alto={460} t={t} cara="tranquila" bd={-80 * pulso(t, M.frena - 0.3, 1.2)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 4–6 · La emite el patrocinador; da autoridad ═════ */
function Firma({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6) - 0.2, b: E(6), s: 1.03, x: 540, y: 960 }]);
  const rec = [[M.plata6, "💰"], [M.horno, "🔥"], [M.gente, "👥"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Documento x={540} y={560} w={340} p={rampa(t, S(4) - 0.2, 0.4)} titulo="acta de constitución" letra={38} sello={rampa(t, M.existe5 - 0.3, 0.4)} />
      <Cartel x={540} y={300} txt="la emite el patrocinador" p={rampa(t, M.patrocinador - 0.4, 0.35)} tam={54} fondo={MANGO} />
      <Cartel x={540} y={880} txt="existe formalmente" p={rampa(t, M.formal - 0.6, 0.35)} tam={56} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      <Cartel x={300} y={1020} txt="⚡ autoridad" p={rampa(t, M.autoridad - 0.3, 0.35)} tam={56} fondo={CREMA} />
      {rec.map(([tw, ic], k) => {
        const q = sale(rampa(t, tw - 0.3, 0.6));
        if (q <= 0) return null;
        return <Gigante key={k} x={lerp(620 + k * 140, 230, q)} y={lerp(1060, 1180, q) - 140 * Math.sin(Math.PI * q)} txt={ic} p={1} tam={lerp(100, 70, q)} />;
      })}
      <Sombra x={230} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={230} y={1515} alto={400} t={t} cara={t > M.autoridad ? "estrellas" : "tranquila"} bi={-60 * pulso(t, M.directora - 0.3, 1)} semilla={3} />
      <Placa x={230} y={1080} nombre="Pía" rol="directora" p={rampa(t, M.directora - 0.3, 0.35) * (1 - rampa(t, M.autoridad - 0.4, 0.3))} />
      <Sombra x={840} y={1510} w={230} />
      <Mascota esp="gato-gafas" x={840} y={1515} alto={460} t={t} cara="feliz" bd={-80 * pulso(t, M.existe5 - 0.4, 1)} semilla={6} espejo />
      <Placa x={840} y={1000} nombre="Carmen" rol="patrocinadora" p={rampa(t, M.carmen4 - 0.3, 0.35) * (1 - rampa(t, M.formal - 0.5, 0.3))} color={COLOR.CORAL} />
    </Escena>
  );
}

/* ═════ 7–10 · Lo que dice el acta (alto nivel, no es el plan) ═════ */
function Acta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 980 }]);
  const pD = rampa(t, S(7) - 0.3, 0.4);
  const enCampos = rampa(t, S(8) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.2}>
      <div style={{ opacity: 1 - enCampos }}>
        <Cartel x={540} y={420} txt="📋 el plan" p={rampa(t, M.plan7 - 0.6, 0.35)} tam={64} />
        <Tachon x={540} y={420} w={330} p={rampa(t, M.plan7 - 0.2, 0.3)} />
        <Cartel x={540} y={640} txt="información de alto nivel" p={rampa(t, M.alto - 0.4, 0.35)} tam={60} fondo={MANGO} giro={-2} />
      </div>
      {enCampos > 0 && (
        <div style={{ position: "absolute", left: 70, top: 230, width: 940, height: 1150, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 28, boxShadow: "0 14px 0 rgba(42,30,23,.28)", opacity: enCampos * pD, transform: `scale(${lerp(0.94, 1, sale(enCampos))})` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: TINTA }}>acta · carrito de pan</div>
          {CAMPOS.map(([tw, ic, nom, val], k) => {
            const q = rampa(t, tw - 0.3, 0.3);
            return (
              <div key={k} style={{ position: "absolute", left: 36, right: 36, top: 120 + k * 142, height: 126, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 20px", borderRadius: 20, background: q > 0 ? "#FFF4DA" : "rgba(42,30,23,.05)", border: `5px solid ${q > 0 ? TINTA : "rgba(42,30,23,.15)"}`, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${q > 0 ? lerp(0.95, 1, rebote(q)) : 1})` }}>
                <span style={{ fontSize: 58, opacity: q > 0 ? 1 : 0.3 }}>{ic}</span>
                <div style={{ opacity: Math.max(0.3, q) }}>
                  <div style={{ fontSize: 42, lineHeight: 1.05 }}>{nom}</div>
                  {val && <div style={{ fontSize: 34, opacity: 0.75, marginTop: 4, whiteSpace: "nowrap" }}>{val}</div>}
                </div>
                {q > 0 && <span style={{ marginLeft: "auto", fontSize: 50 }}>✅</span>}
              </div>
            );
          })}
        </div>
      )}
      {enCampos <= 0 && (
        <>
          <Sombra x={540} y={1510} w={240} />
          <Mascota esp="gato-gafas" x={540} y={1515} alto={420} t={t} cara="tranquila" bd={-60 * pulso(t, M.plan7 - 0.4, 1)} semilla={6} />
        </>
      )}
    </Escena>
  );
}

/* ═════ 11 · Todos entienden lo mismo ═════ */
function Comun({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11), b: E(11), s: 1.03, x: 540, y: 960 }]);
  const cosas = [[M.entrega, "📦", "qué se entrega"], [M.cuando, "🗓️", "cuándo"], [M.que11, "🙋", "quién hace qué"]];
  const gente = [["hamster-gorra", 170, 3, false], ["gato-gafas", 420, 6, false], ["perro-corbatin", 670, 9, true], ["perro-mochila", 910, 4, true]];
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(4px)" velo={0.15}>
      <Cartel x={540} y={300} txt="todos entienden lo mismo" p={rampa(t, M.mismo - 0.4, 0.35)} tam={60} fondo={MANGO} />
      {cosas.map(([tw, ic, txt], k) => <Ficha key={k} x={200 + k * 340} y={620} w={300} letra={38} icono={ic} txt={txt} p={rampa(t, tw - 0.3, 0.35)} giro={k % 2 ? 3 : -3} />)}
      {gente.map(([esp, x, sem, esp2], k) => (
        <div key={k}>
          <Sombra x={x} y={1510} w={190} />
          <Mascota esp={esp} x={x} y={1515} alto={330} t={t} cara="feliz" cab={6 * Math.sin(t * 3 + k)} semilla={sem} espejo={esp2} />
        </div>
      ))}
      <Gigante x={540} y={950} txt="💡" p={rampa(t, M.mismo - 0.2, 0.35)} tam={130} />
    </Escena>
  );
}

/* ═════ 12 · Arma tu acta con Pía ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      <Documento x={540} y={560} w={360} p={rampa(t, M.acta12 - 0.4, 0.4)} titulo="tu acta" letra={50} giro={-3} />
      <Gigante x={780} y={720} txt="✏️" p={rampa(t, M.acta12 - 0.2, 0.35)} tam={130} giro={-20 + 10 * Math.sin(t * 6)} />
      <Cartel x={540} y={1000} txt="arma tu acta con Pía" p={rampa(t, M.toca - 0.2, 0.35)} tam={60} fondo={COLOR.VERDE} color="#fff" />
      <Sombra x={540} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={440} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto12 - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "frena") return <Frena t={t} />;
  if (p.tipo === "firma") return <Firma t={t} />;
  if (p.tipo === "acta") return <Acta t={t} />;
  if (p.tipo === "comun") return <Comun t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.papel - 0.3, "papel", 0.4); fx(M.existe1 - 0.4, "toc-grave", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.eligieron - 0.3, "ding", 0.3); fx(M.ruedas - 1.0, "pasos", 0.35); fx(M.frena - 0.4, "baja", 0.35);
fx(S(4) - 0.3, "papel", 0.4); fx(M.patrocinador - 0.4, "pop", 0.35); fx(M.existe5 - 0.3, "sello", 0.5); fx(M.formal - 0.6, "campana", 0.35);
fx(M.autoridad - 0.3, "sube", 0.35); [M.plata6, M.horno, M.gente].forEach((w) => fx(w - 0.3, "pop-suave", 0.3));
fx(S(7) - 0.3, "whoosh", 0.4); fx(M.plan7 - 0.2, "tijera", 0.3); fx(M.alto - 0.4, "pop", 0.35);
CAMPOS.forEach(([tw]) => fx(tw - 0.3, "tiza", 0.3));
fx(S(11) - 0.3, "barrido-lento", 0.35); [M.entrega, M.cuando, M.que11].forEach((w) => fx(w - 0.3, "pop", 0.3));
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/oficina.jpg", "art/ciudad.jpg", "art/panaderia.jpg"];
const CLAVE = /^(acta|patrocinador|autoridad|recursos|alto|nivel|propósito|objetivos|hitos|interesados|aprobación|plan)[.,:?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP13 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp13-acta.mp3" sinSonido={sinSonido} />
);
