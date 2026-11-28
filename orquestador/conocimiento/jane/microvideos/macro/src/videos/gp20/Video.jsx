/*
 * Gestión de Proyectos · GP-20 «La frase que nadie comprobó» (gp20-supuestos).
 * Una idea: el proceso Desarrollar el Acta de Constitución (4.1, p. 75–81). Entradas:
 * documentos de negocio (caso de negocio), acuerdos, factores ambientales y activos (p. ej.
 * la plantilla del acta). Herramientas: juicio de expertos, tormenta de ideas, entrevistas,
 * reuniones con interesados clave. El proyecto se inicia formalmente con la aprobación del
 * acta, que no es un contrato (p. 77). Salidas: el acta y el registro de supuestos, que
 * recoge supuestos y restricciones a lo largo del ciclo de vida (4.1.3.2, p. 81). Supuesto:
 * factor que se considera verdadero sin prueba ni demostración (Glosario).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Horno, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.3, 0.3, 0.35, 0.3, 0.35, 0.3, 0.3, 0.4] });
const { S, E, W } = T;

const M = {
  frase: W(1, "frase", 0.2), comprobo1: W(1, "comprobó", 0.45), tumbar: W(1, "tumbar", 0.7), plan: W(1, "plan.", 0.95),
  acta2: W(2, "acta", 0.15), escribe: W(2, "escribe:", 0.4), horno2: W(2, "horno", 0.55), mananas: W(2, "mañanas».", 0.95),
  carmen3: W(3, "Carmen", 0.35), caso: W(3, "caso", 0.55), acuerdos: W(3, "acuerdos", 0.8),
  factores: W(4, "factores", 0.2), plantilla: W(4, "plantilla", 0.7),
  expertos: W(5, "expertos,", 0.15), tormenta: W(5, "tormenta", 0.35), entrevistas: W(5, "entrevistas,", 0.6), reunen: W(5, "reúnen", 0.75), clave: W(5, "clave.", 0.95),
  nace: W(6, "nace", 0.15), aprueba: W(6, "aprueba,", 0.5), formal: W(6, "formal.", 0.95),
  contrato: W(7, "contrato,", 0.4), dinero: W(7, "dinero.", 0.95),
  horno8: W(8, "horno?", 0.15), comprobo8: W(8, "comprobó.", 0.35), supuesto8: W(8, "supuesto:", 0.55), prueba: W(8, "prueba.", 0.95),
  segunda: W(9, "segunda", 0.4), registro: W(9, "registro", 0.75), supuestos9: W(9, "supuestos.", 0.95),
  anotan: W(10, "anotan", 0.15), supuestos10: W(10, "supuestos", 0.3), restricciones: W(10, "restricciones,", 0.5), todo10: W(10, "todo", 0.8), proyecto10: W(10, "proyecto.", 0.95),
  toca: W(11, "toca:", 0.15), tres: W(11, "tres", 0.5), proyecto11: W(11, "proyecto.", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "escribe", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "proceso", desde: S(3) - 0.3, entra: "barrido-izq" },
  { tipo: "nace", desde: S(6) - 0.3, entra: "zoom" },
  { tipo: "supuesto", desde: S(8) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.25, entra: "zoom" },
];

/* La frase escrita en el acta */
function Frase({ x, y, w, p, marca = 0, tam = 42 }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, boxSizing: "border-box", padding: "18px 24px", background: marca > 0 ? `rgba(255,214,90,${0.35 + 0.5 * marca})` : "#FFFDF7", border: `7px solid ${marca > 0 ? ROJO : TINTA}`, borderRadius: 20, fontFamily: "Caveat", fontWeight: 700, fontSize: tam, lineHeight: 1.1, color: TINTA, textAlign: "center", transform: `scale(${rebote(Math.min(1, p))}) rotate(-1deg)`, boxShadow: "0 8px 0 rgba(42,30,23,.22)" }}>
      «El horno estará libre todas las mañanas»
    </div>
  );
}

/* ═════ 1 · Una frase sin comprobar tumba el plan ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  const cae = sale(rampa(t, M.tumbar - 0.2, 0.7));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.18}>
      <div style={{ transform: `rotate(${-70 * cae}deg) translateY(${300 * cae}px)`, transformOrigin: "400px 1000px" }}>
        <Documento x={540} y={720} w={360} p={rampa(t, 0.1, 0.4)} titulo="plan" letra={60} giro={3 * Math.sin(t * 8) * rampa(t, M.comprobo1, 0.3) * (1 - cae)} />
      </div>
      <Cartel x={540} y={330} txt="❓ una frase sin comprobar" p={rampa(t, M.frase - 0.3, 0.35)} tam={56} fondo={CREMA} giro={-2} />
      <Gigante x={760} y={900} txt="💥" p={rampa(t, M.tumbar, 0.3)} tam={130} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara={cae > 0.3 ? "triste" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 2 · Pía escribe en el acta ═════ */
function Escribe({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(2), b: E(2), s: 1.04, x: 540, y: 940 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(5px)" velo={0.15}>
      <Documento x={540} y={560} w={380} p={rampa(t, M.acta2 - 0.3, 0.4)} titulo="acta · carrito" letra={46} />
      <Frase x={540} y={860} w={900} p={rampa(t, M.horno2 - 0.5, 0.4)} tam={66} />
      <Gigante x={880} y={840} txt="✍️" p={rampa(t, M.escribe - 0.3, 0.3)} tam={100} giro={10 * Math.sin(t * 12)} />
      <Sombra x={540} y={1510} w={260} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={420} t={t} cara="feliz" bd={-60 + 10 * Math.sin(t * 12) * rampa(t, M.escribe - 0.3, 0.3)} semilla={3} />
    </Escena>
  );
}

/* ═════ 3–5 · De qué parten y cómo lo arman ═════ */
function Proceso({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(5) - 0.2, b: E(5), s: 1.02, x: 540, y: 960 }]);
  const ENT = [[M.caso, "💼", "caso de negocio"], [M.acuerdos, "🤝", "acuerdos"], [M.factores, "🌦️", "factores ambientales de la empresa"], [M.plantilla, "📋", "plantilla del acta"]];
  const HER = [[M.expertos, "🧑‍🏫", "expertos"], [M.tormenta, "🌪️", "tormenta de ideas"], [M.entrevistas, "🎤", "entrevistas"], [M.reunen, "👥", "reuniones"]];
  const bloque = (lista, y0, titulo, tw0, col) => (
    <>
      <Cartel x={540} y={y0} txt={titulo} p={rampa(t, tw0 - 0.3, 0.35)} tam={50} fondo={col} color="#fff" />
      {lista.map(([tw, ic, txt], k) => {
        const q = rampa(t, tw - 0.4, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 40 + (k % 2) * 510, top: y0 + 60 + Math.floor(k / 2) * 150, width: 490, height: 130, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", background: CREMA, border: `6px solid ${TINTA}`, borderRadius: 22, fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: TINTA, transform: `scale(${rebote(q)})`, boxShadow: "0 8px 0 rgba(42,30,23,.22)" }}>
            <span style={{ fontSize: 66 }}>{ic}</span><span style={{ lineHeight: 1.05 }}>{txt}</span>
          </div>
        );
      })}
    </>
  );
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(7px)" velo={0.3}>
      {bloque(ENT, 250, "parten de…", M.caso, AZUL)}
      {bloque(HER, 680, "y lo arman con…", M.expertos, COLOR.VERDE)}
      <Sombra x={330} y={1510} w={200} />
      <Mascota esp="hamster-gorra" x={330} y={1515} alto={320} t={t} cara="feliz" bi={-50 * pulso(t, M.tormenta - 0.3, 1)} semilla={3} />
      <Sombra x={760} y={1510} w={210} />
      <Mascota esp="gato-gafas" x={760} y={1515} alto={350} t={t} cara="tranquila" bd={-60 * pulso(t, M.caso - 0.4, 1)} semilla={6} espejo />
    </Escena>
  );
}

/* ═════ 6–7 · Nace el acta; no es un contrato ═════ */
function Nace({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(7) - 0.2, b: E(7), s: 1.03, x: 540, y: 960 }]);
  const pC = rampa(t, M.contrato - 0.5, 0.35);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.2}>
      <div style={{ opacity: 1 - pC }}>
        <Documento x={540} y={540} w={360} p={rampa(t, M.nace - 0.4, 0.4)} titulo="acta de constitución" letra={40} sello={rampa(t, M.aprueba - 0.2, 0.4)} />
        <Destello x={540} y={540} r={300} p={rampa(t, M.aprueba - 0.1, 0.8)} />
        <Cartel x={540} y={900} txt="✅ el proyecto se inicia" p={rampa(t, M.formal - 0.7, 0.35)} tam={56} fondo={COLOR.VERDE} color="#fff" giro={-2} />
      </div>
      <Ficha x={330} y={800} w={280} icono="📜" txt="contrato" p={pC} letra={46} giro={-4} />
      <Tachon x={330} y={760} w={260} p={rampa(t, M.contrato + 0.1, 0.3)} />
      <Ficha x={760} y={800} w={280} icono="💸" txt="sin intercambio de dinero" p={rampa(t, M.dinero - 1.8, 0.35)} letra={34} giro={4} />
      <Sombra x={830} y={1510} w={230} />
      <Mascota esp="gato-gafas" x={830} y={1515} alto={440} t={t} cara="feliz" bd={-80 * pulso(t, M.aprueba - 0.4, 1)} semilla={6} espejo />
      <Placa x={830} y={1010} nombre="Carmen" rol="patrocinadora" p={rampa(t, M.aprueba - 0.4, 0.35) * (1 - pC)} color={COLOR.CORAL} />
      <Sombra x={250} y={1510} w={210} />
      <Mascota esp="hamster-gorra" x={250} y={1515} alto={400} t={t} cara={t > M.aprueba ? "estrellas" : "tranquila"} semilla={3} />
    </Escena>
  );
}

/* ═════ 8–10 · El supuesto y su registro ═════ */
function Supuesto({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.02, x: 540, y: 960 }]);
  const reg = rampa(t, M.segunda - 0.5, 0.4);
  const marca = rampa(t, M.supuesto8 - 0.3, 0.4);
  const fy = lerp(380, 260, sale(reg));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.22}>
      <div style={{ opacity: 1 - 0.5 * reg }}>
        <Horno x={200} y={760} w={220} brillo={0.3} />
        <Gigante x={200} y={420} txt="❓" p={rampa(t, M.comprobo8 - 0.4, 0.35)} tam={110} giro={8 * Math.sin(t * 4)} />
      </div>
      <Frase x={620} y={fy} w={740} p={rampa(t, S(8) - 0.2, 0.35)} marca={marca} tam={54} />
      <Cartel x={620} y={fy + 330} txt="supuesto: cierto sin prueba" p={marca * (1 - reg)} tam={44} fondo={MANGO} giro={-2} />
      {reg > 0 && (
        <div style={{ position: "absolute", left: 90, top: 520, width: 900, height: 700, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 28, transform: `scale(${rebote(reg)})`, boxShadow: "0 14px 0 rgba(42,30,23,.28)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: TINTA }}>registro de supuestos</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 38, color: COLOR.CORAL }}>salida 2 del proceso · la 1 es el acta</div>
          {[[M.registro + 0.2, "🤔", "supuestos", "el horno libre en las mañanas"], [M.restricciones, "🚧", "restricciones", ""]].map(([tw, ic, nom, val], k) => {
            const q = rampa(t, tw - 0.4, 0.35);
            if (q <= 0) return null;
            return (
              <div key={k} style={{ position: "absolute", left: 40, right: 40, top: 180 + k * 180, height: 150, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 24px", background: "#FFF4DA", border: `6px solid ${TINTA}`, borderRadius: 22, fontFamily: "Sora", fontWeight: 800, color: TINTA, transform: `scale(${rebote(q)})` }}>
                <span style={{ fontSize: 70 }}>{ic}</span>
                <div><div style={{ fontSize: 46 }}>{nom}</div>{val && <div style={{ fontSize: 38, opacity: 0.75 }}>{val}</div>}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: TINTA, opacity: rampa(t, M.todo10 - 0.4, 0.35) }}>⏳ a lo largo de todo el proyecto</div>
        </div>
      )}
      <Sombra x={540} y={1510} w={230} />
      <Mascota esp="hamster-gorra" x={540} y={1515} alto={reg > 0 ? 260 : 380} t={t} cara={reg > 0 ? "feliz" : "triste"} cab={reg > 0 ? 0 : -8} semilla={3} />
    </Escena>
  );
}

/* ═════ 11 · Escribe tres supuestos ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(11), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={540} y={380} txt="✏️ tus 3 supuestos" p={rampa(t, M.toca - 0.2, 0.35)} tam={70} fondo={MANGO} />
      {[0, 1, 2].map((k) => {
        const q = rampa(t, M.tres - 0.4 + k * 0.2, 0.35);
        if (q <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: 160, top: 520 + k * 150, width: 760, height: 120, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 20, padding: "0 26px", background: "#FFFDF7", border: `7px solid ${TINTA}`, borderRadius: 22, transform: `scale(${rebote(q)})`, fontFamily: "Sora", fontWeight: 800, fontSize: 54, color: TINTA }}>
            {k + 1}.<div style={{ flex: 1, height: 8, borderRadius: 4, background: "#D9D2C3" }} /><span style={{ fontSize: 50 }}>🤔</span>
          </div>
        );
      })}
      <Sombra x={330} y={1530} w={240} />
      <Mascota esp="hamster-gorra" x={330} y={1535} alto={420} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.proyecto11 - 0.2, 0.5)} semilla={3} />
      <Sombra x={780} y={1530} w={240} />
      <Mascota esp="gato-gafas" x={780} y={1535} alto={460} t={t} cara="feliz" semilla={6} espejo />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "escribe") return <Escribe t={t} />;
  if (p.tipo === "proceso") return <Proceso t={t} />;
  if (p.tipo === "nace") return <Nace t={t} />;
  if (p.tipo === "supuesto") return <Supuesto t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.1, "papel", 0.3); fx(M.frase - 0.3, "pop", 0.35); fx(M.tumbar - 0.2, "crujido", 0.35); fx(M.tumbar, "golpe", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.acta2 - 0.3, "papel", 0.3); fx(M.escribe - 0.3, "tiza-larga", 0.35);
fx(S(3) - 0.3, "whoosh", 0.4); [M.caso, M.acuerdos, M.factores, M.plantilla, M.expertos, M.tormenta, M.entrevistas, M.reunen].forEach((w) => fx(w - 0.4, "pop-suave", 0.25));
fx(S(6) - 0.3, "whoosh", 0.4); fx(M.nace - 0.4, "papel", 0.3); fx(M.aprueba - 0.2, "sello", 0.45); fx(M.formal - 0.7, "campana", 0.3);
fx(M.contrato - 0.5, "pop", 0.3); fx(M.contrato + 0.1, "tiza", 0.3); fx(M.dinero - 1.8, "monedas", 0.3);
fx(S(8) - 0.3, "whoosh", 0.4); fx(M.comprobo8 - 0.4, "toc-grave", 0.3); fx(M.supuesto8 - 0.3, "ding", 0.35);
fx(M.segunda - 0.5, "papel", 0.35); fx(M.registro - 0.2, "pop", 0.3); fx(M.restricciones - 0.4, "pop", 0.3); fx(M.todo10 - 0.4, "pop-suave", 0.25);
fx(M.toca - 0.3, "pop", 0.35); fx(E(11) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg"];
const CLAVE = /^(supuesto|supuestos|registro|restricciones|acta|contrato|formal|aprueba)[.,:;?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP20 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp20-supuestos-v2.mp3" sinSonido={sinSonido} />
);
