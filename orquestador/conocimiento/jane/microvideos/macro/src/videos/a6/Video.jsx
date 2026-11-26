/*
 * A6 · «El eco de los cien» (da26-a6-eco-multiplicador). Una idea: el multiplicador 1 / (1 − c(1 − t)).
 * c = 0,8 y t = 25 % → cada eco guarda el 60 %: 100 → 60 → 36 → 21,6 … y todo suma 250 (multiplicador 2,5).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Pizarra, Tiza, Monedas, Pan, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.5, 0.4, 0.5, 0.4, 0.5] });
const { S, E, W, c } = T;

const M = {
  cien: W(1, "cien", 0.3), pregunta: W(1, "Cuánto", 0.5), cien2: W(1, "Cien", 0.75), ni: W(1, "Ni", 0.9),
  paga: W(2, "paga", 0.4),
  impuestos: W(3, "impuestos", 0.2), ahorran: W(3, "ahorran", 0.4), sesenta: W(3, "sesenta", 0.8),
  cobra: W(4, "cobra", 0.2), treinta: W(4, "treinta", 0.7),
  veintiuno: W(5, "veintiuno", 0.3), eco: W(5, "eco", 0.85),
  guarda: W(6, "sesenta", 0.4), ct: W(6, "c", 0.85),
  suma: W(7, "sumas", 0.3), doscientos: W(7, "doscientos", 0.8),
  mult: W(8, "multiplicador", 0.3), formula: W(8, "uno", 0.6),
  datos: S(9) + 0.1, dos: W(9, "dos", 0.85),
  ojo: W(10, "Ojo", 0.1), cero6: W(10, "cero", 0.7), distintos: W(10, "distintos", 0.9),
  y0: W(11, "producción", 0.2), y0f: W(11, "gasto", 0.6),
  palanca: S(12) + 0.2,
};

const PLANOS = [
  { tipo: "obra", desde: 0 },
  { tipo: "puesto", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "panaderia", desde: S(4) - 0.3, entra: "barrido" },
  { tipo: "ecos", desde: S(6) - 0.3, entra: "fundido" },
  { tipo: "pizarra", desde: S(8) - 0.3, entra: "fundido" },
  { tipo: "cierre", desde: S(12) - 0.2, entra: "zoom" },
];

/* bolsa de dinero con su cifra */
function Bolsa({ x, y, w, txt, p = 1, col = MANGO }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `scale(${rebote(Math.min(1, p))})` }}>
      <div style={{ position: "absolute", left: "30%", right: "30%", top: "2%", height: "20%", background: "#B98A4E", border: `7px solid ${TINTA}`, borderRadius: "40% 40% 20% 20%" }} />
      <div style={{ position: "absolute", left: "6%", right: "6%", top: "18%", bottom: 0, background: "#D9A65E", border: `8px solid ${TINTA}`, borderRadius: "45% 45% 40% 40%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.3, color: col, WebkitTextStroke: `${Math.round(w / 28)}px ${TINTA}`, paintOrder: "stroke fill" }}>{txt}</div>
    </div>
  );
}
/* ondas del eco que se abren desde (x, y) */
function Ondas({ t, t0, x, y, r = 300, n = 3 }) {
  return [...Array(n)].map((_, k) => {
    const p = rampa(t, t0 + k * 0.25, 1.2);
    if (p <= 0 || p >= 1) return null;
    return <div key={k} style={{ position: "absolute", left: x - r * p, top: y - r * p, width: 2 * r * p, height: 2 * r * p, borderRadius: "50%", border: `${10 * (1 - p) + 3}px solid ${MANGO}`, opacity: 1 - p }} />;
  });
}

/* ═════ 1-2 · La vía y los obreros ═════ */
function Obra({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: 0.2, b: E(1), s: 1.15, x: 540, y: 1100 }, { a: S(2) - 0.2, b: E(2), s: 1.05, x: 560, y: 1050 }]);
  const paga = rampa(t, M.paga, 1.0);
  return (
    <Escena cam={cam} fondo="art/obra.jpg">
      <Sombra x={260} y={1680} w={300} />
      <Mascota esp="panda-traje" x={260} y={1685} alto={560} t={t} cara="feliz" bd={-70 * pulso(t, M.paga - 0.2, 1.0)} semilla={4} />
      <Placa x={260} y={1020} nombre="Ministra Mei" rol="Gobierno" p={rampa(t, 0.4, 0.35) * (1 - rampa(t, S(2), 0.3))} />
      <Bolsa x={lerp(430, 790, sale(paga))} y={lerp(1450, 1250, sale(paga)) - 160 * Math.sin(Math.PI * paga)} w={200} txt="100" p={rampa(t, M.cien - 0.2, 0.4)} />
      <Gigante x={540} y={560} txt="¿100?" p={rampa(t, M.cien2 - 0.3, 0.35) * (1 - rampa(t, S(2) - 0.2, 0.2))} tam={200} giro={-6} />
      <Gigante x={800} y={760} txt="✗" p={rampa(t, M.ni, 0.3) * (1 - rampa(t, S(2) - 0.2, 0.2))} tam={200} color={COLOR.CORAL} />
      {t > S(2) - 0.4 && [0, 1].map((k) => (
        <div key={k}>
          <Sombra x={720 + k * 210} y={1680} w={220} />
          <Mascota esp="conejo-casco" x={720 + k * 210} y={1685} alto={440} t={t} cara={paga > 0.9 ? "feliz" : "tranquila"} salto={30 * pulso(t, M.paga + 1.0 + k * 0.15, 0.4)} semilla={k + 8} espejo />
        </div>
      ))}
      <Cartel x={830} y={1080} txt="obreros" p={rampa(t, S(2), 0.35)} tam={52} />
    </Escena>
  );
}

/* ═════ 3 · El salario se reparte y llega al puesto de Rufo ═════ */
function Puesto({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1050 }, [{ a: S(3), b: E(3), s: 1.12, x: 540, y: 1100 }]);
  const imp = rampa(t, M.impuestos - 0.2, 0.4), aho = rampa(t, M.ahorran - 0.2, 0.4), gas = rampa(t, M.sesenta - 0.6, 0.9);
  return (
    <Escena cam={cam} fondo="art/puesto.jpg">
      <Sombra x={240} y={1690} w={220} />
      <Mascota esp="conejo-casco" x={240} y={1695} alto={440} t={t} cara="feliz" bd={-60 * pulso(t, M.sesenta - 0.6, 1.0)} semilla={8} />
      <Bolsa x={240} y={1100} w={180} txt="100" p={1 - gas} />
      <Cartel x={230} y={900} txt="T −25" p={imp} tam={54} fondo={COLOR.CORAL} color="#fff" />
      <Cartel x={460} y={790} txt="ahorro −15" p={aho} tam={54} fondo={CREMA} />
      <Bolsa x={lerp(260, 640, sale(gas))} y={lerp(1150, 1250, sale(gas)) - 140 * Math.sin(Math.PI * gas)} w={170} txt="60" p={gas} />
      <Sombra x={820} y={1690} w={260} />
      <Mascota esp="huron" x={820} y={1695} alto={500} t={t} cara={gas > 0.9 ? "feliz" : "tranquila"} semilla={1} espejo />
      <Placa x={820} y={1080} nombre="Rufo" rol="Vendedor" p={rampa(t, W(3, "Rufo", 0.9), 0.35)} />
      <Ondas t={t} t0={M.sesenta} x={640} y={1250} />
    </Escena>
  );
}

/* ═════ 4-5 · De Rufo a Bruno, y sigue ═════ */
function Panaderia({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1100 }, [{ a: S(5) - 0.2, b: E(5), s: 1.0, x: 540, y: 968 }]);
  const gas = rampa(t, M.treinta - 0.6, 0.9), sig = rampa(t, M.veintiuno - 0.6, 0.9);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Sombra x={220} y={1690} w={240} />
      <Mascota esp="huron" x={220} y={1695} alto={470} t={t} cara="feliz" bd={-60 * pulso(t, M.treinta - 0.6, 1.0)} semilla={1} />
      <Bolsa x={lerp(260, 600, sale(gas))} y={lerp(1150, 1200, sale(gas)) - 140 * Math.sin(Math.PI * gas)} w={150} txt="36" p={rampa(t, M.cobra, 0.3) * (1 - sig)} />
      <Sombra x={720} y={1690} w={280} />
      <Mascota esp="zorro-corbata" x={720} y={1695} alto={540} t={t} cara="feliz" bd={-60 * pulso(t, M.veintiuno - 0.6, 1.0)} semilla={3} espejo />
      <Placa x={720} y={1030} nombre="Bruno" rol="Empresario" p={rampa(t, W(4, "Bruno", 0.9), 0.35) * (1 - rampa(t, S(5), 0.3))} />
      <Bolsa x={lerp(640, 1000, sale(sig))} y={lerp(1200, 1100, sale(sig)) - 120 * Math.sin(Math.PI * sig)} w={130} txt="21,6" p={sig} />
      <Ondas t={t} t0={M.treinta} x={600} y={1200} r={260} />
      <Ondas t={t} t0={M.veintiuno} x={940} y={1100} r={200} />
      <Ondas t={t} t0={M.eco - 0.3} x={1000} y={1100} r={160} n={4} />
      <Cartel x={540} y={540} txt="100 → 60 → 36 → 21,6 → …" p={rampa(t, M.veintiuno - 0.2, 0.4)} tam={60} />
    </Escena>
  );
}

/* ═════ 6-7 · Cada eco guarda el 60 %; todos suman 250 ═════ */
const ECOS = [100, 60, 36, 21.6, 12.96, 7.78, 4.67, 2.8, 1.68, 1.01];
function Ecos({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 1000 }, [{ a: M.suma - 0.2, b: M.suma + 0.8, s: 1.0, x: 540, y: 968 }]);
  const junta = rampa(t, M.suma, 1.4);
  const esc = 3.6, base = 1450;
  let acum = 0;
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.3}>
      <Cartel x={540} y={330} txt="× 0,6 = c(1 − t)" p={rampa(t, M.ct - 0.4, 0.35)} tam={70} fondo={MANGO} />
      {ECOS.map((v, i) => {
        const p = rampa(t, S(6) + 0.1 + i * 0.25, 0.35);
        if (p <= 0) return null;
        const h = v * esc * sale(p);
        /* separados: una barra por eco; juntos: se apilan en una torre */
        const xs = 100 + i * 92, ys = base - h;
        const xt = 540 - 70, yt = base - acum - h;
        acum += h;
        const x = lerp(xs, xt, sale(junta)), y = lerp(ys, yt, sale(junta));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: lerp(80, 140, sale(junta)), height: h, background: i % 2 ? COLOR.G : MANGO, border: `5px solid ${TINTA}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 34, color: TINTA, overflow: "hidden" }}>{h > 50 ? String(v).replace(".", ",") : ""}</div>;
      })}
      <div style={{ position: "absolute", left: 60, right: 60, top: base, height: 8, background: TINTA }} />
      <Destello x={540} y={base - 250 * esc / 2} r={500} p={rampa(t, M.doscientos - 0.2, 0.7)} />
      <Cartel x={800} y={base - 250 * esc - 20} txt="= 250" p={rampa(t, M.doscientos - 0.2, 0.35)} tam={100} fondo={COLOR.VERDE} color="#fff" />
      <Cartel x={260} y={base - 100 * esc + 20} txt="los 100" p={rampa(t, M.suma + 1.3, 0.3)} tam={52} />
    </Escena>
  );
}

/* ═════ 8-11 · La fórmula en la pizarra ═════ */
function PlanoPizarra({ t }) {
  const t1 = S(8) - 0.1;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t1, b: E(8), s: 1.05, x: 540, y: 920 }]);
  const fuera = rampa(t, M.ojo - 0.3, 0.3);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={40} y={280} w={1000} h={900}>
        <Tiza x={470} y={40} txt="Multiplicador" p={rampa(t, M.mult - 0.2, 0.7)} tam={90} centro />
        <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", opacity: rampa(t, M.formula - 0.2, 0.5) * (1 - fuera * 0.6) }}>
          <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 110, color: MANGO, lineHeight: 1 }}>1</div>
          <div style={{ width: 520, height: 7, background: "#fff", margin: "8px auto" }} />
          <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 110, color: "#fff", lineHeight: 1 }}>1 − c(1 − t)</div>
        </div>
        <Tiza x={470} y={500} txt="= 1 / (1 − 0,8 × 0,75)" p={rampa(t, M.datos, 1.0) * (1 - fuera)} tam={70} centro />
        <Tiza x={470} y={610} txt="= 1 / 0,4 = 2,5" p={rampa(t, M.dos - 0.8, 0.9) * (1 - fuera)} tam={84} centro color={COLOR.VERDE} />
        {/* el «ojo»: dos números distintos */}
        <Tiza x={250} y={500} txt="multiplicador" p={rampa(t, M.ojo, 0.5) * (1 - rampa(t, M.y0 - 0.4, 0.3))} tam={54} centro color={MANGO} />
        <Tiza x={250} y={570} txt="2,5" p={rampa(t, M.ojo + 0.3, 0.4) * (1 - rampa(t, M.y0 - 0.4, 0.3))} tam={100} centro color={MANGO} />
        <Tiza x={700} y={500} txt="pendiente de DA" p={rampa(t, M.cero6 - 0.5, 0.5) * (1 - rampa(t, M.y0 - 0.4, 0.3))} tam={54} centro />
        <Tiza x={700} y={570} txt="0,6" p={rampa(t, M.cero6, 0.4) * (1 - rampa(t, M.y0 - 0.4, 0.3))} tam={100} centro />
        <Tiza x={470} y={600} txt="≠" p={rampa(t, M.distintos - 0.2, 0.3) * (1 - rampa(t, M.y0 - 0.4, 0.3))} tam={110} centro color={COLOR.CORAL} />
        <Tiza x={470} y={560} txt="Y₀ = multiplicador × (Ā − b·i)" p={rampa(t, M.y0, 1.2)} tam={66} centro color={COLOR.VERDE} />
      </Pizarra>
      <Sombra x={860} y={1540} w={260} />
      <Mascota esp="gato-gafas" x={860} y={1545} alto={400} t={t} cara="feliz" bi={-60 * clamp01(Math.sin((t - t1) * 3)) * (t < E(11) ? 1 : 0)} semilla={7} espejo />
      <Placa x={860} y={1270} nombre="Olga" rol="Analista" p={rampa(t, t1 + 0.3, 0.35) * (1 - rampa(t, S(9), 0.3))} />
    </Escena>
  );
}

/* ═════ 12 · Una sola palanca ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: S(12) - 0.2, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const p = rampa(t, M.palanca, 0.6);
  const giro = -35 + 60 * sale(rampa(t, M.palanca + 0.8, 0.8));
  return (
    <Escena cam={cam} fondo="art/obra.jpg" filtro="blur(4px)" velo={0.2}>
      <div style={{ position: "absolute", left: 340, top: 1100, width: 400, height: 140, background: "#596579", border: `9px solid ${TINTA}`, borderRadius: 24, transform: `scale(${rebote(p)})` }} />
      <div style={{ position: "absolute", left: 525, top: 700, width: 30, height: 430, background: "#C9CED6", border: `8px solid ${TINTA}`, borderRadius: 15, transformOrigin: "50% 100%", transform: `rotate(${giro}deg) scale(${rebote(p)})` }}>
        <div style={{ position: "absolute", left: -45, top: -90, width: 110, height: 110, borderRadius: "50%", background: COLOR.CORAL, border: `8px solid ${TINTA}` }} />
      </div>
      <Cartel x={540} y={560} txt="G" p={rampa(t, M.palanca + 0.3, 0.3)} tam={90} fondo={COLOR.G} color="#fff" />
      <Cartel x={540} y={1400} txt="× 2,5" p={rampa(t, M.palanca + 1.5, 0.35)} tam={100} fondo={MANGO} />
      <Ondas t={t} t0={M.palanca + 1.5} x={540} y={1170} r={420} n={4} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "puesto") return <Puesto t={t} />;
  if (p.tipo === "panaderia") return <Panaderia t={t} />;
  if (p.tipo === "ecos") return <Ecos t={t} />;
  if (p.tipo === "pizarra") return <PlanoPizarra t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.cien - 0.2, "monedas", 0.5); fx(M.cien2 - 0.3, "pop", 0.45); fx(M.ni, "toc-grave", 0.55);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(M.paga, "whoosh", 0.4); fx(M.paga + 1.0, "monedas", 0.45);
fx(M.impuestos - 0.2, "sello", 0.4); fx(M.ahorran - 0.2, "pop-suave", 0.4); fx(M.sesenta - 0.6, "whoosh", 0.35); fx(M.sesenta, "eco", 0.5);
fx(M.treinta - 0.6, "whoosh", 0.35); fx(M.treinta, "eco", 0.45); fx(M.veintiuno, "eco", 0.4); fx(M.eco - 0.3, "eco", 0.35);
for (let i = 0; i < 10; i++) fx(S(6) + 0.1 + i * 0.25, "toc", 0.35 - i * 0.025);
fx(M.ct - 0.4, "pop", 0.45);
fx(M.suma, "desliza", 0.45); fx(M.doscientos - 0.2, "campana", 0.55);
fx(M.mult - 0.2, "tiza-larga", 0.55); fx(M.datos, "tiza", 0.45); fx(M.dos - 0.8, "tiza", 0.45); fx(M.dos, "ding", 0.45);
fx(M.ojo, "pop", 0.45); fx(M.distintos - 0.2, "toc-grave", 0.5);
fx(M.y0, "tiza-larga", 0.5);
fx(M.palanca, "pop", 0.45); fx(M.palanca + 0.8, "crujido", 0.5); fx(M.palanca + 1.5, "eco", 0.5);
fx(E(12) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/obra.jpg", "art/puesto.jpg", "art/panaderia.jpg", "art/ciudad.jpg", "art/oficina.jpg"];
const CLAVE = /^(multiplicador|eco|cien|sesenta|treinta|doscientos|cincuenta|c|t|dos|cinco|ecos|palanca)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const A6 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a6-eco-multiplicador.mp3" sinSonido={sinSonido} />
);
