/*
 * A1 · «Cuatro manos, un carrito» (da26-a1-carrito). Una idea: DA = C + I + G + (X − M).
 * Guion: guiones/t1-demanda-agregada.md. La voz manda los tiempos (tiempos.json).
 */
import { AbsoluteFill } from "remotion";
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Carrito, Pizarra, Tiza, Barco, Horno, Pan, Monedas, Destello, COLOR, NOMBRE, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.6, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.4, 0.2, 0.3, 0.3, 2.2, 0.3], manual: { 11: ["Lo que vendemos afuera,", "menos lo que compramos afuera:", "exportaciones netas, X menos M."] } });
const { S, E, W, c } = T;

/* ── momentos ── */
const M = {
  pregunta: W(1, "Colombia", 0.5) + 0.2,
  cae: W(2, "carrito", 0.5) - 0.1,
  manos: W(2, "cuatro", 0.8),
  cC: W(4, "consumo", 0.5), cI: W(6, "inversión", 0.8), cG: W(8, "público", 0.5),
  horno: W(5, "horno", 0.5) - 0.3, panes: S(6) + 0.2,
  cinta: W(7, "vía", 0.5) - 0.2,
  sale: W(9, "café", 0.6) - 0.3, suma: W(9, "suma", 0.9),
  llega: S(10) + 0.1, resta: W(10, "restan", 0.5),
  xn: W(11, "exportaciones", 0.7),
  nombre: W(12, "demanda", 0.8) - 0.1,
  saca: W(13, "menos", 0.5) - 0.2, baja: W(13, "baja", 0.7),
  fichas: W(14, "compra", 0.4),
};
/* altura de cada bloque (px) */
const ALTO = { C: 300, I: 150, G: 170, XN: 70 };

const PLANOS = [
  { tipo: "ciudad", desde: 0 },
  { tipo: "nina", desde: S(3) - 0.35, entra: "barrido" },
  { tipo: "carrito", desde: S(4) - 0.2, entra: "barrido" },
  { tipo: "panaderia", desde: S(5) - 0.3, entra: "barrido" },
  { tipo: "carrito", desde: W(6, "Eso", 0.6) - 0.25, entra: "barrido-izq" },
  { tipo: "obra", desde: S(7) - 0.3, entra: "barrido" },
  { tipo: "carrito", desde: S(8) - 0.15, entra: "barrido-izq" },
  { tipo: "puerto", desde: S(9) - 0.3, entra: "barrido" },
  { tipo: "carrito", desde: S(11) - 0.25, entra: "barrido-izq" },
  { tipo: "pizarra", desde: M.nombre - 0.2, entra: "fundido" },
  { tipo: "carrito", desde: S(13) - 0.25, entra: "fundido" },
  { tipo: "cierre", desde: S(14) - 0.2, entra: "zoom" },
];

/* bloques del carrito en el instante t */
function bloquesEn(t) {
  const xn = rampa(t, M.xn - 0.2, 0.6);
  const saca = rampa(t, M.saca, 0.9);
  return [
    { k: "C", alto: ALTO.C, p: rampa(t, M.cC - 0.45, 0.5) },
    { k: "I", alto: ALTO.I * (1 - 0.75 * sale(saca)), p: rampa(t, M.cI - 0.45, 0.5) },
    { k: "G", alto: ALTO.G, p: rampa(t, M.cG - 0.45, 0.5) },
    { k: "XN", letra: "X − M", alto: ALTO.XN, p: xn },
  ];
}

/* ═════ 1-2 · La ciudad y el carrito gigante ═════ */
function Ciudad({ t }) {
  const cam = mover(t, { s: 1.9, x: 540, y: 380 }, [
    { a: 0.1, b: S(2), s: 1.0, x: 540, y: 968 },
    { a: M.cae + 0.4, b: E(2) + 0.3, s: 1.08, x: 540, y: 1150 },
  ]);
  const q = rampa(t, M.pregunta, 0.35) * (1 - rampa(t, S(2) - 0.2, 0.3));
  const cae = rampa(t, M.cae - 0.55, 0.55);
  const golpe = pulso(t, M.cae, 0.35);
  const manos = [
    { src: "macro2026/objetos/bolsa-mercado.png", x: 190, y: 1060, k: "C" },
    { src: "macro2026/ilustrados/fabrica.webp", x: 890, y: 1060, k: "I" },
    { src: "macro2026/ilustrados/edificio-gobierno.webp", x: 190, y: 1560, k: "G" },
    { src: "macro2026/objetos/barco.png", x: 890, y: 1560, k: "XN" },
  ];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg">
      <Gigante x={540} y={560} txt="?" p={q} tam={420} giro={10 + 4 * Math.sin(t * 5)} />
      {cae > 0 && <Sombra x={540} y={1690} w={760 * cae} op={0.3} />}
      {cae > 0 && (
        <div style={{ position: "absolute", left: 0, top: lerp(-1500, 0, cae * cae) + golpe * 18 }}>
          <Carrito x={540} y={1080} w={860} />
        </div>
      )}
      <Destello x={540} y={1400} r={520} p={rampa(t, M.cae, 0.6)} />
      {manos.map((m, i) => {
        const p = rampa(t, M.manos + i * 0.18, 0.4);
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: m.x - 110, top: m.y - 110, width: 220, height: 220, borderRadius: "50%", background: COLOR[m.k], border: `8px solid ${TINTA}`, transform: `scale(${rebote(p)})`, boxShadow: "0 10px 0 rgba(42,30,23,.3)" }}>
            <Obj src={m.src} x={110} y={110} w={150} />
          </div>
        );
      })}
    </Escena>
  );
}

/* ═════ 3 · Nina y su familia en el mercado ═════ */
function Nina({ t }) {
  const t0 = S(3) - 0.35;
  const cam = mover(t, { s: 1.25, x: 480, y: 1250 }, [{ a: t0, b: E(3), s: 1.4, x: 560, y: 1230 }]);
  const p = rampa(t, t0, 1.3);
  const x = lerp(-150, 430, sale(p));
  const anda = p > 0 && p < 1;
  const paso = anda ? Math.abs(Math.sin((t - t0) * 9)) : 0;
  const lanza = rampa(t, E(3) - 0.5, 0.45);
  return (
    <Escena cam={cam} fondo="art/calle.jpg">
      <Sombra x={x} y={1610} w={330} />
      <Mascota esp="conejo" x={x} y={1615} alto={560} t={t} cara="feliz" salto={paso * 26} ladeo={anda ? 4 * Math.sin((t - t0) * 9) : 0} bd={-40 * pulso(t, E(3) - 0.5, 0.5)} semilla={2} />
      <Sombra x={x + 230} y={1610} w={200} />
      <Mascota esp="conejo" x={x + 230} y={1615} alto={330} t={t} cara="feliz" salto={anda ? Math.abs(Math.sin((t - t0) * 9 + 1)) * 30 : 0} semilla={5} />
      <Obj src="macro2026/objetos/bolsa-mercado.png" x={x - 160} y={1440 - paso * 20} w={200} giro={anda ? 6 * Math.sin((t - t0) * 9) : 0} />
      <Obj src="macro2026/objetos/celular.png" x={x + 120} y={lerp(1230, 900, sale(lanza))} w={110} op={1 - rampa(t, E(3) - 0.1, 0.2)} giro={lanza * 40} />
      <Placa x={x} y={760} nombre="Nina" rol="Familia" p={rampa(t, W(3, "Nina", 0.3), 0.35)} />
    </Escena>
  );
}

/* ═════ Carrito (vuelve varias veces) ═════ */
function PlanoCarrito({ t }) {
  const b = bloquesEn(t);
  const cerca = t < S(13) - 0.3;
  const cam = cerca
    ? { s: 1.12, x: 540, y: 1100 + 30 * Math.sin(t * 0.5) }
    : mover(t, { s: 1.12, x: 540, y: 1100 }, [{ a: S(13), b: S(13) + 1.5, s: 1.0, x: 540, y: 1000 }]);
  /* qué letra se rotula grande al caer */
  const rot = [["C", M.cC], ["I", M.cI], ["G", M.cG]].map(([k, tt]) => ({ k, p: rampa(t, tt - 0.1, 0.35) * (1 - rampa(t, tt + 1.4, 0.3)) }));
  const temb = pulso(t, M.cC - 0.0, 0.25) + pulso(t, M.cI, 0.25) + pulso(t, M.cG, 0.25) + pulso(t, M.xn, 0.25);
  const nivel = rampa(t, M.xn + 0.3, 0.4);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px) saturate(.9)" velo={0.15}>
      <Sombra x={560} y={1745} w={820} op={0.3} />
      <Carrito x={540} y={1150} w={900} bloques={b} sacude={temb * 0.3} nivel={nivel} />
      {rot.map((r) => r.p > 0 && <Cartel key={r.k} x={540} y={420} txt={`${r.k} · ${NOMBRE[r.k]}`} p={r.p} fondo={COLOR[r.k]} tam={72} />)}
      {/* Bruno saca su bloque (escena 13) */}
      {t > S(13) && (
        <>
          <Mascota esp="zorro-corbata" x={980} y={1760} alto={520} t={t} cara="triste" bi={-60 * rampa(t, M.saca, 0.5)} semilla={3} espejo />
          <Gigante x={240} y={520} txt="↓" p={rampa(t, M.baja, 0.3)} tam={300} color={COLOR.CORAL} />
        </>
      )}
    </Escena>
  );
}

/* ═════ 5-6 · Bruno y su horno ═════ */
function Panaderia({ t }) {
  const t0 = S(5) - 0.3;
  const cam = mover(t, { s: 1.15, x: 540, y: 1200 }, [{ a: t0, b: S(6), s: 1.3, x: 600, y: 1250 }, { a: S(6), b: E(6), s: 1.2, x: 560, y: 1200 }]);
  const llega = rampa(t, M.horno, 0.9);
  const hx = lerp(1350, 720, sale(llega));
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Sombra x={hx} y={1640} w={420} />
      <Horno x={hx} y={1640} w={400} brillo={0.5 + 0.5 * Math.sin(t * 3)} />
      {[0, 1, 2, 3].map((k) => {
        const p = rampa(t, M.panes + k * 0.35, 1.1);
        if (p <= 0) return null;
        return <Pan key={k} x={lerp(hx - 60, 120, p)} y={1330 - Math.sin(p * Math.PI) * 120} w={150} giro={p * 30} />;
      })}
      <Sombra x={330} y={1640} w={320} />
      <Mascota esp="zorro-corbata" x={330} y={1645} alto={600} t={t} cara={llega > 0.95 ? "feliz" : "tranquila"} bd={-50 * pulso(t, M.horno + 0.4, 0.9)} semilla={3} />
      <Placa x={330} y={760} nombre="Bruno" rol="Empresario" p={rampa(t, W(5, "Bruno", 0.2), 0.35)} />
    </Escena>
  );
}

/* ═════ 7 · La ministra Mei inaugura una vía ═════ */
function Obra({ t }) {
  const t0 = S(7) - 0.3;
  const cam = mover(t, { s: 1.2, x: 540, y: 1150 }, [{ a: t0, b: E(7), s: 1.35, x: 560, y: 1250 }]);
  const corta = rampa(t, M.cinta, 0.25);
  return (
    <Escena cam={cam} fondo="art/obra.jpg">
      {/* cinta inaugural */}
      <div style={{ position: "absolute", left: 140, top: 1300, width: 380 * (1 - corta * 0.5), height: 26, background: "#E5484D", border: `5px solid ${TINTA}`, transform: `rotate(${corta * 18}deg)`, transformOrigin: "0% 50%" }} />
      <div style={{ position: "absolute", left: 940 - 380 * (1 - corta * 0.5), top: 1300, width: 380 * (1 - corta * 0.5), height: 26, background: "#E5484D", border: `5px solid ${TINTA}`, transform: `rotate(${-corta * 18}deg)`, transformOrigin: "100% 50%" }} />
      <Sombra x={540} y={1660} w={380} />
      <Mascota esp="panda-traje" x={540} y={1665} alto={620} t={t} cara="feliz" bi={-70 * pulso(t, M.cinta - 0.3, 0.7)} semilla={4} />
      <Obj src="macro2026/objetos/escuela.png" x={890} y={980} w={200} op={rampa(t, W(7, "profesores", 0.7), 0.3)} esc={aparece(t, W(7, "profesores", 0.7))} />
      <Placa x={540} y={730} nombre="Ministra Mei" rol="Gobierno" p={rampa(t, W(7, "Gobierno", 0.2), 0.35)} />
    </Escena>
  );
}
const aparece = (t, t0) => rebote(rampa(t, t0, 0.4));

/* ═════ 9-10 · El puerto: X suma, M resta ═════ */
function Puerto({ t }) {
  const t0 = S(9) - 0.3;
  const cam = mover(t, { s: 1.15, x: 540, y: 1100 }, [{ a: t0, b: S(10), s: 1.05, x: 540, y: 1050 }]);
  const sale_ = rampa(t, M.sale, 2.6);
  const llega = rampa(t, M.llega, 2.4);
  /* medidor X y M arriba */
  const X = 200 * rampa(t, M.suma - 0.4, 0.6);
  const Mm = 130 * rampa(t, M.resta - 0.3, 0.6);
  return (
    <Escena cam={cam} fondo="art/puerto.jpg">
      <Barco x={lerp(560, -400, sale_ * sale_)} y={1080} w={620} carga="macro2026/objetos/contenedor.png" t={t} espejo />
      {llega > 0 && <Barco x={lerp(1500, 640, sale(llega))} y={1130} w={620} carga="macro2026/objetos/celular.png" t={t + 1} espejo />}
      <Sombra x={300} y={1680} w={300} />
      <Mascota esp="hamster-gorra" x={300} y={1685} alto={460} t={t} cara="feliz" bd={-80 * pulso(t, M.sale, 1.2)} semilla={6} />
      <Placa x={300} y={1000} nombre="Lucía" rol="Exportadora" p={rampa(t, W(9, "Lucía", 0.3), 0.35) * (1 - rampa(t, S(10), 0.3))} />
      {/* el medidor */}
      <div style={{ position: "absolute", left: 640, top: 360, width: 360, height: 360, opacity: Math.min(1, rampa(t, M.suma - 0.5, 0.3) * 3) }}>
        <div style={{ position: "absolute", left: 40, bottom: 120, width: 120, height: X, background: COLOR.X, border: `6px solid ${TINTA}`, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 200, bottom: 120, width: 120, height: Mm, background: COLOR.M, border: `6px solid ${TINTA}`, borderRadius: 12, backgroundImage: "repeating-linear-gradient(45deg, rgba(42,30,23,.3) 0 8px, transparent 8px 18px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 112, height: 8, background: TINTA }} />
        <div style={{ position: "absolute", left: 40, width: 120, bottom: 20, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 72, color: "#fff", WebkitTextStroke: `8px ${TINTA}`, paintOrder: "stroke fill" }}>+X</div>
        <div style={{ position: "absolute", left: 200, width: 120, bottom: 20, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 72, color: "#fff", WebkitTextStroke: `8px ${TINTA}`, paintOrder: "stroke fill", opacity: Mm > 0 ? 1 : 0 }}>−M</div>
      </div>
    </Escena>
  );
}

/* ═════ 12 · La pizarra de Olga ═════ */
function PlanoPizarra({ t }) {
  const t0 = M.nombre - 0.2;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t0, b: t0 + 2.5, s: 1.06, x: 540, y: 930 }]);
  const partes = [["DA", MANGO], ["=", "#fff"], ["C", COLOR.C], ["+", "#fff"], ["I", COLOR.I], ["+", "#fff"], ["G", COLOR.G], ["+", "#fff"], ["(X − M)", COLOR.XN]];
  const t1 = M.nombre - 0.1;
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={60} y={330} w={960} h={760}>
        <Tiza x={450} y={60} txt="Demanda agregada" p={rampa(t, t1, 0.9)} tam={92} centro />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 14 }}>
          {partes.map(([s, col], i) => {
            const p = rampa(t, t1 + 0.8 + i * 0.16, 0.3);
            return <span key={i} style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: s.length > 2 ? 104 : 130, color: col, opacity: p, transform: `translateY(${(1 - sale(p)) * 30}px)`, display: "inline-block" }}>{s}</span>;
          })}
        </div>
        <Tiza x={450} y={500} txt="todo lo que compra junta la economía" p={rampa(t, E(12) - 0.4, 1.0)} tam={56} centro />
      </Pizarra>
      <Sombra x={830} y={1660} w={320} />
      <Mascota esp="gato-gafas" x={830} y={1665} alto={560} t={t} cara="feliz" bi={-60 * clamp01(Math.sin((t - t1) * 3)) * (t < E(12) ? 1 : 0)} semilla={7} espejo />
      <Placa x={830} y={1130} nombre="Olga" rol="Analista" p={rampa(t, t1 + 0.4, 0.35)} />
    </Escena>
  );
}

/* ═════ 14 · Cierre: cada compra va a su mano ═════ */
function Cierre({ t }) {
  const t0 = S(14) - 0.2;
  const cam = mover(t, { s: 1.1, x: 540, y: 1050 }, [{ a: t0, b: T.DURACION_S, s: 0.98, x: 540, y: 968 }]);
  const manos = [["C", 200, 520], ["I", 880, 520], ["G", 200, 1250], ["XN", 880, 1250]];
  const fichas = [["macro2026/objetos/bolsa-mercado.png", 0], ["macro2026/ilustrados/fabrica.webp", 1], ["macro2026/ilustrados/edificio-gobierno.webp", 2], ["macro2026/ilustrados/caja-bananos.webp", 3]];
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.2}>
      <Carrito x={540} y={980} w={620} bloques={bloquesEn(t)} />
      {manos.map(([k, x, y], i) => (
        <div key={k} style={{ position: "absolute", left: x - 120, top: y - 120, width: 240, height: 240, borderRadius: "50%", background: COLOR[k], border: `8px solid ${TINTA}`, transform: `scale(${rebote(rampa(t, t0 + 0.2 + i * 0.12, 0.4))})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 96, color: TINTA }}>{k}</div>
      ))}
      {fichas.map(([src, i]) => {
        const p = rampa(t, M.fichas + i * 0.4, 0.8);
        if (p <= 0) return null;
        const [, x, y] = manos[i];
        return <Obj key={i} src={src} x={lerp(540, x, sale(p))} y={lerp(1700, y, sale(p)) - Math.sin(p * Math.PI) * 200} w={150} esc={1 - 0.3 * rampa(p, 0.85, 0.15)} op={1 - rampa(t, M.fichas + i * 0.4 + 0.75, 0.2)} />;
      })}
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "ciudad") return <Ciudad t={t} />;
  if (p.tipo === "nina") return <Nina t={t} />;
  if (p.tipo === "carrito") return <PlanoCarrito t={t} />;
  if (p.tipo === "panaderia") return <Panaderia t={t} />;
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "puerto") return <Puerto t={t} />;
  if (p.tipo === "pizarra") return <PlanoPizarra t={t} />;
  return <Cierre t={t} />;
};

/* ── sonido ── */
const [SFX, fx] = hazSfx();
fx(0.1, "viento", 0.35);
fx(M.pregunta, "pop", 0.5);
fx(M.cae - 0.5, "whoosh", 0.5); fx(M.cae, "golpe", 0.7); fx(M.cae + 0.15, "campana", 0.4);
[0, 1, 2, 3].forEach((i) => fx(M.manos + i * 0.18, "pop-suave", 0.4));
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(S(3) - 0.2, "pasos", 0.45);
[M.cC, M.cI, M.cG, M.xn].forEach((tt) => { fx(tt - 0.1, "toc-grave", 0.6); fx(tt + 0.05, "pop", 0.4); });
fx(M.horno, "camion", 0.3); fx(M.panes, "burbuja", 0.4);
fx(M.cinta, "tijera", 0.6); fx(M.cinta + 0.2, "campana", 0.35);
fx(M.sale, "bocina", 0.45); fx(M.suma - 0.3, "sube", 0.4);
fx(M.llega, "bocina-grave", 0.45); fx(M.resta - 0.2, "baja", 0.4);
fx(M.nombre - 0.1, "tiza-larga", 0.55); fx(M.nombre + 1.0, "tiza", 0.45); fx(M.nombre + 1.6, "campana", 0.45);
fx(M.saca, "desliza", 0.45); fx(M.baja, "baja", 0.5);
[0, 1, 2, 3].forEach((i) => fx(M.fichas + i * 0.4 + 0.7, "pop", 0.4));
fx(E(14) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/ciudad.jpg", "art/calle.jpg", "art/panaderia.jpg", "art/obra.jpg", "art/puerto.jpg", "art/oficina.jpg",
  "macro2026/ilustrados/carrito-mercado.webp", "macro2026/objetos/barco.png", "macro2026/ilustrados/moneda-oro.webp"];
const CLAVE = /^(consumo|C|inversión|I|gasto|público|G|exportaciones|netas|X|M|demanda|agregada|suma|restan|cuatro|baja)[.,:?…]*$/i;

export const DURACION = T.DURACION_S;
export const A1 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a1-carrito.mp3" sinSonido={sinSonido} />
);
