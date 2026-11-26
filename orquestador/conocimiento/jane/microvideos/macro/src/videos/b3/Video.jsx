/*
 * T2 A3 · «La silla vacía» (pe26-a3-problema-resuelto). Una idea: un objetivo de política económica es el
 * problema escrito como si ya estuviera resuelto; cuatro problemas comparten el objetivo de estabilizar la economía.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso, suave } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.4, 0.4, 0.4, 0.3, 0.3, 0.3, 0.5, 0.4, 0.5] });
const { S, E, W, c } = T;

const M = {
  silla: W(1, "silla", 0.4), meta: W(1, "meta", 0.7),
  desempleo: W(2, "desempleo", 0.7),
  voltea: W(3, "voltéala", 0.2), alguien: W(3, "alguien", 0.45), reducir: W(3, "Reducir", 0.8),
  objetivo: W(4, "objetivo", 0.3), resuelto: W(4, "resuelto", 0.9),
  v1: W(5, "voltea", 0.5), v2: W(6, "asignarlos", 0.6), v3: W(7, "crecimiento", 0.6, 1), v4: W(8, "sostenibilidad", 0.6),
  cuatro: W(9, "cuatro", 0.15), comparten: W(10, "comparten", 0.4), estabilizar: W(10, "estabilizar", 0.8),
  sale: S(11) + 0.1, perillas: W(11, "perillas", 0.8),
};

const PLANOS = [
  { tipo: "oficina", desde: 0 },
  { tipo: "fichas", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "cuatro", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "cierre", desde: S(11) - 0.2, entra: "zoom" },
];

/* ficha de dos caras: el problema (rojo) y, al voltearla, el objetivo (verde) */
function Ficha({ x, y, w, h, frente, dorso, giro = 0, p = 1, tam = 52 }) {
  if (p <= 0) return null;
  const g = clamp01(giro);
  const ang = 180 * suave(g);
  const atras = ang > 90;
  const cara = (txt, col) => (
    <div style={{ position: "absolute", inset: 0, background: col, border: `9px solid ${TINTA}`, borderRadius: 26, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 18, boxSizing: "border-box", fontFamily: "Sora", fontWeight: 800, fontSize: tam, lineHeight: 1.1, color: "#fff", WebkitTextStroke: `6px ${TINTA}`, paintOrder: "stroke fill", boxShadow: "0 12px 0 rgba(42,30,23,.3)", textWrap: "balance" }}>{txt}</div>
  );
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `scale(${rebote(Math.min(1, p))}) perspective(1400px) rotateY(${ang}deg)`, opacity: Math.min(1, p * 3) }}>
      <div style={{ position: "absolute", inset: 0, transform: atras ? "rotateY(180deg)" : undefined }}>
        {atras ? cara(dorso, COLOR.VERDE) : cara(frente, COLOR.CORAL)}
      </div>
    </div>
  );
}

/* silla de oficina dibujada */
function Silla({ x, y, w, giro = 0 }) {
  const h = w * 1.3;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transform: `rotate(${giro}deg)`, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: "12%", right: "12%", top: 0, height: "48%", background: "#3E6FB0", border: `8px solid ${TINTA}`, borderRadius: 26 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "48%", height: "16%", background: "#3E6FB0", border: `8px solid ${TINTA}`, borderRadius: 18 }} />
      <div style={{ position: "absolute", left: "45%", width: "10%", top: "64%", height: "24%", background: "#596579", border: `6px solid ${TINTA}` }} />
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "88%", height: "8%", background: "#596579", border: `6px solid ${TINTA}`, borderRadius: 10 }} />
    </div>
  );
}

/* ═════ 1-4 · La silla vacía ═════ */
function Oficina({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [
    { a: 0.2, b: E(1), s: 1.12, x: 540, y: 1100 },
    { a: M.voltea - 0.2, b: M.voltea + 0.4, s: 1.0, x: 540, y: 968 },
  ]);
  /* «voltéala»: un giro de cámara y aparece alguien trabajando */
  const gira = rampa(t, M.voltea - 0.1, 0.5);
  const ocupada = gira > 0.5;
  const ficha = rampa(t, M.desempleo - 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <div style={{ position: "absolute", left: 300, top: 1180, width: 520, height: 40, background: "#8A5A35", border: `8px solid ${TINTA}`, borderRadius: 10 }} />
      <div style={{ position: "absolute", left: 330, top: 1220, width: 30, height: 380, background: "#6B4226", border: `6px solid ${TINTA}` }} />
      <div style={{ position: "absolute", left: 760, top: 1220, width: 30, height: 380, background: "#6B4226", border: `6px solid ${TINTA}` }} />
      <Obj src="macro2026/objetos/celular.png" x={700} y={1140} w={70} giro={-70} />
      <Silla x={560} y={1640} w={260} giro={ocupada ? 0 : 6 * Math.sin(t * 1.3) * (1 - gira)} />
      {ocupada && (
        <>
          <Mascota esp="perro-corbatin" x={560} y={1520} alto={460} t={t} cara="feliz" bi={-30 * Math.abs(Math.sin(t * 6))} bd={-30 * Math.abs(Math.sin(t * 6 + 1))} semilla={5} />
          <Placa x={560} y={940} nombre="Toby" rol="con empleo" p={rampa(t, M.alguien, 0.35) * (1 - rampa(t, S(4), 0.3))} />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, background: CREMA, opacity: pulso(t, M.voltea - 0.1, 0.5) * 0.9 }} />
      <Gigante x={300} y={620} txt="?" p={rampa(t, M.silla, 0.35) * (1 - rampa(t, S(2) - 0.2, 0.3))} tam={240} giro={-8} />
      <Cartel x={780} y={620} txt="meta" p={rampa(t, M.meta - 0.1, 0.35) * (1 - rampa(t, S(2) - 0.2, 0.3))} tam={70} fondo={MANGO} giro={5} />
      <Ficha x={540} y={500} w={640} h={220} frente="Desempleo" dorso="Reducir el desempleo" giro={rampa(t, M.reducir - 0.5, 0.7)} p={ficha} tam={64} />
      <Cartel x={540} y={720} txt="problema" p={ficha * (1 - rampa(t, M.reducir - 0.5, 0.3))} tam={48} fondo={CREMA} />
      <Cartel x={540} y={720} txt="objetivo = problema resuelto" p={rampa(t, M.objetivo - 0.1, 0.35)} tam={48} fondo={CREMA} />
      <Destello x={540} y={500} r={380} p={rampa(t, M.reducir - 0.1, 0.7)} />
    </Escena>
  );
}

/* ═════ 5-8 · Cuatro fichas más que se voltean ═════ */
const PARES = [
  ["Desigualdad", "Redistribuir la renta", "v1"],
  ["Recursos mal asignados", "Asignarlos bien", "v2"],
  ["Poco crecimiento", "Crecimiento económico", "v3"],
  ["Daño ambiental", "Sostenibilidad ambiental", "v4"],
];
function Fichas({ t }) {
  const t0 = S(5) - 0.3;
  const cam = mover(t, { s: 1.0, x: 540, y: 900 }, [{ a: t0, b: E(8), s: 1.04, x: 540, y: 880 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.25}>
      {PARES.map(([f, d, k], i) => {
        const tt = M[k];
        const aparece = rampa(t, i === 0 ? t0 + 0.1 : M[PARES[i - 1][2]] + 0.3, 0.4);
        return <Ficha key={i} x={540} y={330 + i * 300} w={860} h={230} frente={f} dorso={d} giro={rampa(t, tt - 0.5, 0.7)} p={aparece} tam={60} />;
      })}
    </Escena>
  );
}

/* ═════ 9-10 · Cuatro problemas, un solo objetivo ═════ */
const CUATRO = ["Inflación", "Desempleo", "Déficit fiscal", "Déficit externo"];
function Cuatro({ t }) {
  const t0 = S(9) - 0.3;
  const cam = mover(t, { s: 1.0, x: 540, y: 900 }, [{ a: M.estabilizar - 0.3, b: M.estabilizar + 0.6, s: 1.1, x: 540, y: 820 }]);
  const junta = sale(rampa(t, M.comparten - 0.2, 0.9));
  const una = rampa(t, M.estabilizar - 0.4, 0.5);
  const pal = ["inflación", "desempleo", "fiscal", "externo"];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.3}>
      {CUATRO.map((n, i) => {
        const p = rampa(t, W(9, pal[i], 0.3 + i * 0.15) - 0.2, 0.35);
        const xs = i % 2 ? 790 : 290, ys = 520 + Math.floor(i / 2) * 340;
        return <Ficha key={n} x={lerp(xs, 540, junta)} y={lerp(ys, 820, junta)} w={lerp(460, 600, junta)} h={220} frente={n} dorso="" giro={0} p={p * (1 - una)} tam={56} />;
      })}
      <Ficha x={540} y={820} w={820} h={300} frente="Inflación, desempleo, déficits" dorso="Estabilizar la economía" giro={rampa(t, M.estabilizar - 0.3, 0.6)} p={una} tam={72} />
      <Destello x={540} y={820} r={500} p={rampa(t, M.estabilizar, 0.8)} />
      <Gigante x={540} y={260} txt="4 → 1" p={rampa(t, M.comparten, 0.35)} tam={150} color={MANGO} />
    </Escena>
  );
}

/* ═════ 11 · Del problema al objetivo; sigue: las perillas ═════ */
function Perilla({ x, y, r, giro, col }) {
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: col, border: `9px solid ${TINTA}`, transform: `rotate(${giro}deg)`, boxShadow: "0 10px 0 rgba(42,30,23,.3)" }}>
      <div style={{ position: "absolute", left: r - 10, top: 10, width: 20, height: r * 0.7, background: TINTA, borderRadius: 10 }} />
    </div>
  );
}
function Cierre({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: S(11) - 0.2, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const p = rampa(t, M.perillas - 0.4, 0.5);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="blur(5px)" velo={0.25}>
      <Ficha x={540} y={560} w={600} h={200} frente="Problema" dorso="Objetivo" giro={rampa(t, M.sale + 0.3, 0.7)} p={rampa(t, M.sale - 0.1, 0.35)} tam={70} />
      {[[300, COLOR.G, 0], [540, MANGO, 1], [780, COLOR.I, 2]].map(([x, col, k]) => (
        <div key={k} style={{ opacity: Math.min(1, p * 3), transform: `scale(${rebote(p)})`, transformOrigin: `${x}px 1050px`, position: "absolute", inset: 0 }}>
          <Perilla x={x} y={1050} r={100} col={col} giro={-60 + 120 * Math.sin(t * 1.5 + k)} />
        </div>
      ))}
      <Cartel x={540} y={1260} txt="¿con qué perillas?" p={rampa(t, M.perillas, 0.35)} tam={60} fondo={CREMA} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "oficina") return <Oficina t={t} />;
  if (p.tipo === "fichas") return <Fichas t={t} />;
  if (p.tipo === "cuatro") return <Cuatro t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.silla, "crujido", 0.45); fx(M.meta - 0.1, "pop", 0.45);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(M.desempleo - 0.3, "toc-grave", 0.5);
fx(M.voltea - 0.1, "whoosh", 0.5); fx(M.alguien, "pop-suave", 0.4); fx(M.reducir - 0.5, "desliza", 0.45); fx(M.reducir, "campana", 0.45);
fx(M.objetivo - 0.1, "pop", 0.4);
["v1", "v2", "v3", "v4"].forEach((k) => { fx(M[k] - 0.5, "desliza", 0.45); fx(M[k], "ding", 0.4); });
fx(M.cuatro, "pop", 0.4); [0, 1, 2, 3].forEach((i) => fx(W(9, ["inflación", "desempleo", "fiscal", "externo"][i], 0.3 + i * 0.15) - 0.2, "toc", 0.45));
fx(M.comparten - 0.2, "whoosh", 0.45); fx(M.estabilizar - 0.3, "desliza", 0.45); fx(M.estabilizar, "campana", 0.55);
fx(M.sale + 0.3, "desliza", 0.4); fx(M.perillas - 0.4, "pop", 0.45);
fx(E(11) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/oficina.jpg", "art/ciudad.jpg", "macro2026/objetos/celular.png"];
const CLAVE = /^(silla|vacía|meta|desempleo|problema|objetivo|resuelto|reducir|redistribuir|estabilizar|perillas|voltéala|voltea)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const B3 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/pe26-a3-problema-resuelto.mp3" sinSonido={sinSonido} />
);
