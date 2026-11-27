/*
 * Gestión de Proyectos · GP-11 «Es un cuarto, Pía» (gp11-adaptar).
 * Una idea: la guía no es una metodología sino una base de buenas prácticas que no se
 * aplican igual en todos los proyectos; escoger procesos, entradas, herramientas, técnicas,
 * salidas y fases para cada proyecto se llama adaptación, y se hace porque cada proyecto
 * es único, con el equipo, el patrocinador o la dirección (G 1.2.5, p. 28; p. 1–2).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import { Documento, Ficha, Tachon, Dicho, ROJO } from "../gp/piezas.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.4, 0.3, 0.3, 0.4, 0.3, 0.35, 0.3, 0.35, 0.35, 0.3, 0.35, 0.4] });
const { S, E, W } = T;

const M = {
  usar: W(1, "Usar", 0.05), guia1: W(1, "guía", 0.25), pintar1: W(1, "pintar", 0.4), cuarto1: W(1, "cuarto", 0.55), mal: W(1, "mal.", 0.95),
  ramon: W(2, "Ramón", 0.1), pintar2: W(2, "pintar", 0.4), sabado2: W(2, "sábado.", 0.95),
  emocionada: W(3, "emocionada,", 0.15), guia3: W(3, "guía", 0.4), acta: W(3, "acta,", 0.6), riesgos: W(3, "riesgos,", 0.8), informes: W(3, "informes…", 0.95),
  mira: W(4, "mira:", 0.3), cuarto4: W(4, "cuarto».", 0.95),
  razon: W(5, "razón:", 0.2), receta: W(5, "receta", 0.55), metodologia: W(5, "metodología.", 0.95),
  base: W(6, "base", 0.1), buenas: W(6, "buenas", 0.2), igual: W(6, "igual", 0.8), proyectos6: W(6, "proyectos.", 0.95),
  lista: W(7, "lista:", 0.25), color: W(7, "color,", 0.45), pintura: W(7, "pintura,", 0.6), brochas: W(7, "brochas", 0.75), sabado7: W(7, "sábado.", 0.95),
  remodelar: W(8, "remodelar", 0.15), panaderia: W(8, "panadería,", 0.3), mas: W(8, "más.", 0.95),
  escoger: W(9, "Escoger", 0.05), procesos: W(9, "procesos,", 0.15), entradas: W(9, "entradas,", 0.25), herramientas: W(9, "herramientas,", 0.38), tecnicas: W(9, "técnicas,", 0.5), salidas: W(9, "salidas", 0.6), fases: W(9, "fases", 0.68), adaptacion: W(9, "adaptación.", 0.95),
  unico: W(10, "único.", 0.95),
  director: W(11, "director", 0.1), solo: W(11, "solo:", 0.3), equipo: W(11, "equipo,", 0.5), patrocinador: W(11, "patrocinador", 0.7), organizacion: W(11, "organización.", 0.95),
  toca: W(12, "toca:", 0.15), usarias: W(12, "usarías", 0.4), fuera: W(12, "fuera?", 0.95),
};

const PLANOS = [
  { tipo: "gancho", desde: 0 },
  { tipo: "cuarto", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "receta", desde: S(5) - 0.3, entra: "zoom" },
  { tipo: "lista", desde: S(7) - 0.3, entra: "barrido-izq" },
  { tipo: "adapta", desde: S(9) - 0.3, entra: "zoom" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

/* Pila de documentos (la guía entera) */
function Pila({ x, y, n, p, w = 220, t }) {
  return Array.from({ length: n }).map((_, k) => {
    const q = clamp01(p * n - k);
    if (q <= 0) return null;
    return <Documento key={k} x={x + 10 * Math.sin(k * 1.7)} y={y - k * 26} w={w} p={q} titulo={["ACTA", "PLAN", "RIESGOS", "INFORME", "CAMBIOS", "CALIDAD"][k % 6]} giro={4 * Math.sin(k * 2.3 + t * 0.5)} />;
  });
}

/* Pared que se pinta (0..1) */
function Pared({ x, y, w, h, pinta, color = "#7FC8A9" }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#EFE6D6", border: `8px solid ${TINTA}`, borderRadius: 18, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${100 * sale(clamp01(pinta))}%`, background: color }} />
    </div>
  );
}

/* ═════ 1 · Toda la guía para pintar un cuarto ═════ */
function Gancho({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 940 }, [{ a: 0.2, b: E(1) + 0.3, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(5px)" velo={0.15}>
      <Gigante x={260} y={760} txt="🖌️" p={rampa(t, M.pintar1 - 0.3, 0.35)} tam={180} />
      <Pila x={760} y={900} n={12} p={rampa(t, M.guia1 - 0.3, 0.9)} w={240} t={t} />
      <Cartel x={540} y={1130} txt="= dirigir mal" p={rampa(t, M.mal - 0.5, 0.35)} tam={80} fondo={ROJO} color="#fff" giro={-3} />
      <Sombra x={220} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={220} y={1515} alto={360} t={t} cara="guino" semilla={3} />
    </Escena>
  );
}

/* ═════ 2–4 · Ramón y su cuarto; Pía llega con todo ═════ */
function Cuarto({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(4) - 0.2, b: E(4), s: 1.05, x: 600, y: 980 }]);
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(4px)" velo={0.12}>
      <Pared x={560} y={260} w={440} h={520} pinta={0.35 * rampa(t, M.pintar2 - 0.3, 1)} />
      <Gigante x={880} y={860} txt="🪣" p={rampa(t, M.pintar2 - 0.2, 0.35)} tam={120} />
      <Cartel x={780} y={180} txt="sábado" p={rampa(t, M.sabado2 - 0.5, 0.35)} tam={50} fondo={MANGO} />
      <Pila x={260} y={980} n={10} p={rampa(t, M.guia3 - 0.4, M.informes - M.guia3 + 0.4)} w={200} t={t} />
      <Dicho x={460} y={300} w={520} h={220} colaX={800} p={rampa(t, M.mira - 0.2, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>Pía, es un cuarto.</div>
      </Dicho>
      <Sombra x={800} y={1510} w={240} />
      <Mascota esp="perro-corbatin" x={800} y={1515} alto={480} t={t} cara={t > M.emocionada ? "tranquila" : "feliz"} cab={8 * pulso(t, M.mira - 0.3, 1.2)} semilla={9} espejo />
      <Placa x={800} y={900} nombre="Ramón" rol="pinta su cuarto" p={rampa(t, M.ramon - 0.2, 0.35) * (1 - rampa(t, M.emocionada - 0.3, 0.3))} color={COLOR.CORAL} />
      <Sombra x={260} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={lerp(-200, 260, sale(rampa(t, M.emocionada - 0.6, 0.6)))} y={1515} alto={400} t={t} cara={t > M.cuarto4 - 0.3 ? "triste" : "estrellas"} salto={30 * Math.abs(Math.sin(t * 6)) * (t > M.emocionada - 0.5 && t < M.informes ? 1 : 0)} semilla={3} />
    </Escena>
  );
}

/* ═════ 5–6 · No es receta: buenas prácticas ═════ */
function Receta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(6) - 0.2, b: E(6), s: 1.03, x: 540, y: 950 }]);
  const enBase = rampa(t, S(6) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      <div style={{ opacity: 1 - enBase }}>
        <Cartel x={540} y={420} txt="📖 la guía" p={rampa(t, S(5) - 0.2, 0.35)} tam={80} fondo={AZUL} color="#fff" />
        <Cartel x={540} y={640} txt="receta" p={rampa(t, M.receta - 0.3, 0.35)} tam={70} />
        <Tachon x={540} y={640} w={340} p={rampa(t, M.receta, 0.3)} />
        <Cartel x={540} y={820} txt="metodología" p={rampa(t, M.metodologia - 0.5, 0.35)} tam={70} />
        <Tachon x={540} y={820} w={480} p={rampa(t, M.metodologia - 0.2, 0.3)} />
      </div>
      {enBase > 0 && (
        <div style={{ opacity: enBase }}>
          <Cartel x={540} y={400} txt="✓ base de buenas prácticas" p={rampa(t, M.buenas - 0.3, 0.35)} tam={60} fondo={COLOR.VERDE} color="#fff" />
          <Cartel x={540} y={560} txt="pero no siempre igual" p={rampa(t, M.igual - 0.5, 0.35)} tam={56} fondo={CREMA} giro={-2} />
          {[["🖌️", "un cuarto"], ["🏪", "una panadería"], ["🌉", "un puente"]].map(([ic, txt], k) => <Ficha key={k} x={210 + k * 330} y={860} w={290} letra={38} icono={ic} txt={txt} p={rampa(t, M.proyectos6 - 0.5 + k * 0.12, 0.35)} giro={k % 2 ? 3 : -3} />)}
        </div>
      )}
      <Sombra x={540} y={1520} w={240} />
      <Mascota esp="hamster-gorra" x={540} y={1525} alto={380} t={t} cara={t > M.buenas ? "feliz" : "tranquila"} bd={-60 * pulso(t, M.buenas - 0.3, 1)} semilla={3} />
    </Escena>
  );
}

/* ═════ 7–8 · Para el cuarto, una lista; para la panadería, mucho más ═════ */
function Lista({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(8) - 0.2, b: E(8), s: 1.02, x: 560, y: 960 }]);
  const items = [[M.color, "color"], [M.pintura, "pintura"], [M.brochas, "brochas"], [M.sabado7, "el sábado"]];
  return (
    <Escena cam={cam} fondo="art/calle.jpg" filtro="blur(6px)" velo={0.2}>
      <div style={{ position: "absolute", left: 50, top: 260, width: 450, height: 760, background: "#FFFDF7", border: `8px solid ${TINTA}`, borderRadius: 24, boxShadow: "0 12px 0 rgba(42,30,23,.25)", opacity: rampa(t, M.lista - 0.4, 0.3), transform: `rotate(-2deg)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>🖌️ el cuarto</div>
        {items.map(([tw, txt], k) => (
          <div key={k} style={{ position: "absolute", left: 40, top: 150 + k * 140, display: "flex", alignItems: "center", gap: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 48, color: TINTA, opacity: rampa(t, tw - 0.3, 0.3) }}>
            <div style={{ width: 64, height: 64, border: `7px solid ${TINTA}`, borderRadius: 12, background: COLOR.VERDE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>✓</div>{txt}
          </div>
        ))}
      </div>
      <Cartel x={790} y={300} txt="🏪 la panadería" p={rampa(t, M.panaderia - 0.3, 0.35)} tam={50} fondo={MANGO} />
      <Pila x={790} y={960} n={12} p={rampa(t, M.panaderia - 0.2, M.mas - M.panaderia + 0.3)} w={230} t={t} />
      <Sombra x={260} y={1510} w={240} />
      <Mascota esp="perro-corbatin" x={260} y={1515} alto={420} t={t} cara="feliz" semilla={9} />
      <Sombra x={800} y={1510} w={220} />
      <Mascota esp="hamster-gorra" x={800} y={1515} alto={380} t={t} cara="feliz" bi={-60 * pulso(t, M.remodelar - 0.3, 1)} semilla={3} espejo />
    </Escena>
  );
}

/* ═════ 9–11 · Adaptación ═════ */
function Adapta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(11) - 0.2, b: E(11), s: 1.02, x: 540, y: 960 }]);
  const piezas = [[M.procesos, "⚙️ procesos"], [M.entradas, "📥 entradas"], [M.herramientas, "🧰 herramientas"], [M.tecnicas, "🎯 técnicas"], [M.salidas, "📤 salidas"], [M.fases, "🧭 fases"]];
  const elige = [1, 1, 1, 1, 1, 1];
  const enGente = rampa(t, S(11) - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.2}>
      {piezas.map(([tw, txt], k) => {
        const p = rampa(t, tw - 0.3, 0.3);
        if (p <= 0) return null;
        const ok = elige[k] && t > M.adaptacion - 0.4;
        const no = !elige[k] && t > M.adaptacion - 0.4;
        return (
          <div key={k} style={{ position: "absolute", left: 70 + (k % 2) * 480, top: 250 + Math.floor(k / 2) * 140, width: 460, height: 110, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 14, background: ok ? "#DDF5E6" : CREMA, border: `7px solid ${TINTA}`, borderRadius: 22, padding: "0 18px", fontFamily: "Sora", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap", color: TINTA, opacity: no ? 0.4 : 1, transform: `scale(${rebote(Math.min(1, p))})`, boxShadow: "0 8px 0 rgba(42,30,23,.25)" }}>
            {txt}<span style={{ marginLeft: "auto", fontSize: 44 }}>{ok ? "✅" : no ? "➖" : ""}</span>
          </div>
        );
      })}
      <Cartel x={540} y={730} txt="adaptación" p={rampa(t, M.adaptacion - 0.5, 0.35)} tam={96} fondo={MANGO} giro={-3} />
      <Cartel x={540} y={880} txt="cada proyecto es único" p={rampa(t, M.unico - 0.6, 0.35)} tam={56} fondo={CREMA} />
      {enGente > 0 && (
        <>
          <Cartel x={540} y={1040} txt="no lo decide solo" p={rampa(t, M.solo - 0.4, 0.35)} tam={50} fondo={CREMA} giro={2} />
          <Sombra x={170} y={1510} w={200} />
          <Mascota esp="hamster-gorra" x={170} y={1515} alto={330} t={t} cara="feliz" bi={-50 * pulso(t, M.director - 0.3, 1)} semilla={3} />
          <Placa x={170} y={1120} nombre="Pía" rol="directora" p={rampa(t, M.director - 0.3, 0.35)} />
          <Sombra x={540} y={1510} w={200} />
          <Mascota esp="perro-mochila" x={540} y={1515} alto={320} t={t} cara="feliz" semilla={5} />
          <Placa x={540} y={1130} nombre="equipo" rol="Don Tito y más" p={rampa(t, M.equipo - 0.3, 0.35)} color={COLOR.VERDE} />
          <Sombra x={900} y={1510} w={200} />
          <Mascota esp="gato-gafas" x={900} y={1515} alto={340} t={t} cara="feliz" semilla={6} espejo />
          <Placa x={900} y={1110} nombre="Carmen" rol="patrocinadora" p={rampa(t, M.patrocinador - 0.3, 0.35)} color={COLOR.CORAL} />
        </>
      )}
    </Escena>
  );
}

/* ═════ 12 · ¿Qué usarías tú? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const cosas = [["📜", "acta"], ["⚠️", "plan de riesgos"], ["📊", "informes"], ["✅", "una lista"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(6px)" velo={0.25}>
      {cosas.map(([ic, txt], k) => <Ficha key={k} x={[290, 790, 290, 790][k]} y={k < 2 ? 470 : 810} w={320} letra={38} icono={ic} txt={txt} p={rampa(t, M.toca - 0.3 + k * 0.12, 0.35)} giro={k % 2 ? 3 : -3} />)}
      <Gigante x={850} y={1100} txt="?" p={rampa(t, M.usarias - 0.3, 0.35)} tam={170} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={400} y={1530} w={260} />
      <Mascota esp="hamster-gorra" x={400} y={1535} alto={480} t={t} cara="guino" bi={-60 * pulso(t, M.toca - 0.4, 1.2)} salto={40 * pulso(t, M.fuera - 0.2, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "gancho") return <Gancho t={t} />;
  if (p.tipo === "cuarto") return <Cuarto t={t} />;
  if (p.tipo === "receta") return <Receta t={t} />;
  if (p.tipo === "lista") return <Lista t={t} />;
  if (p.tipo === "adapta") return <Adapta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.guia1 - 0.3, "papel", 0.35); fx(M.pintar1 - 0.3, "pop", 0.35); fx(M.mal - 0.5, "toc-grave", 0.4);
fx(S(2) - 0.3, "whoosh", 0.4); fx(M.pintar2 - 0.3, "barrido-lento", 0.3); fx(M.emocionada - 0.6, "pasos", 0.35);
[M.acta, M.riesgos, M.informes].forEach((w) => fx(w - 0.3, "papel", 0.3)); fx(M.mira - 0.2, "pop-suave", 0.35);
fx(S(5) - 0.3, "whoosh", 0.4); fx(M.receta, "tijera", 0.3); fx(M.metodologia - 0.2, "tijera", 0.3); fx(M.buenas - 0.3, "ding", 0.35); fx(M.igual - 0.5, "pop", 0.3);
fx(S(7) - 0.3, "whoosh", 0.4); [M.color, M.pintura, M.brochas, M.sabado7].forEach((w) => fx(w - 0.3, "pop-suave", 0.3)); fx(M.panaderia - 0.2, "papel", 0.35);
fx(S(9) - 0.3, "barrido-lento", 0.35); [M.procesos, M.entradas, M.herramientas, M.tecnicas, M.salidas, M.fases].forEach((w) => fx(w - 0.3, "pop", 0.25)); fx(M.adaptacion - 0.5, "campana", 0.4);
fx(M.unico - 0.6, "ding", 0.3); [M.director, M.equipo, M.patrocinador].forEach((w) => fx(w - 0.3, "pop-suave", 0.3));
fx(M.toca - 0.3, "pop", 0.35); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/calle.jpg", "art/oficina.jpg"];
const CLAVE = /^(guía|receta|metodología|buenas|prácticas|adaptación|único|procesos|herramientas|técnicas|fases|patrocinador)[.,:?…!¡»]*$/i;

export const DURACION = T.DURACION_S;
export const GP11 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp11-adaptar.mp3" sinSonido={sinSonido} />
);
