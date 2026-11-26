/*
 * A3 · «El plano en el cajón» (da26-a3-columpio-tasa). Una idea: I = Ī − b·i.
 * Bruno quiere su segunda panadería a crédito; la tasa sube del 8 % al 12 % y el plano vuelve al cajón.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Pizarra, Tiza, Horno, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.3, 0.4, 0.3, 0.4, 0.5, 0.3, 0.3, 0.5, 0.3, 0.5, 0.4] });
const { S, E, W, c } = T;

const M = {
  plano: S(1) + 0.2, cajon: W(1, "cajón", 0.6) - 0.2, porque: W(1, "Por", 0.9),
  credito: W(2, "crédito", 0.8),
  maquinas: W(3, "Máquinas", 0.1), plantas: W(3, "plantas", 0.3), inventarios: W(3, "inventarios", 0.5), inv: W(3, "inversión", 0.8),
  ocho: W(4, "ocho", 0.4), construir: W(4, "construir", 0.85),
  doce: W(5, "doce", 0.4), cuota: W(5, "cuota", 0.7),
  vuelve: S(6) + 0.1, grúas: W(6, "grúas", 0.8),
  columpio: W(7, "columpio", 0.3), sube: W(7, "sube", 0.6), baja: W(7, "baja", 0.85),
  b: W(8, "b", 0.4),
  largo: W(9, "largo", 0.7), golpe: W(9, "golpe", 0.85),
  expect: W(10, "expectativas", 0.8),
  nublado: W(11, "nublado", 0.3), ibarra: W(11, "barra", 0.9),
  formula: S(12) - 0.1,
  noticia: S(13) + 0.1,
};

const PLANOS = [
  { tipo: "panaderia", desde: 0 },
  { tipo: "banco", desde: S(2) - 0.3, entra: "barrido" },
  { tipo: "obra", desde: S(4) - 0.3, entra: "barrido" },
  { tipo: "panaderia", desde: S(6) - 0.25, entra: "barrido-izq" },
  { tipo: "balancin", desde: S(7) - 0.3, entra: "fundido" },
  { tipo: "pizarra", desde: S(12) - 0.35, entra: "fundido" },
  { tipo: "cierre", desde: S(13) - 0.2, entra: "zoom" },
];

/* el plano azul de la panadería */
function Plano({ x, y, w, abre = 1, giro = 0, op = 1 }) {
  const h = w * 0.7;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: op, transform: `rotate(${giro}deg) scaleX(${0.15 + 0.85 * abre})`, transformOrigin: "0% 50%" }}>
      <div style={{ position: "absolute", inset: 0, background: "#2F6FD0", border: `7px solid ${TINTA}`, borderRadius: 10, backgroundImage: "linear-gradient(rgba(255,255,255,.18) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.18) 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M ${w * 0.2} ${h * 0.75} L ${w * 0.2} ${h * 0.4} L ${w * 0.5} ${h * 0.18} L ${w * 0.8} ${h * 0.4} L ${w * 0.8} ${h * 0.75} Z M ${w * 0.43} ${h * 0.75} L ${w * 0.43} ${h * 0.55} L ${w * 0.57} ${h * 0.55} L ${w * 0.57} ${h * 0.75}`} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" />
      </svg>
    </div>
  );
}
/* el cajón del escritorio: abre 0..1 */
function Cajon({ x, y, w, abre }) {
  const h = w * 0.42;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: h }}>
      <div style={{ position: "absolute", left: -30, right: -30, top: -26, height: 40, background: "#8A5A35", border: `7px solid ${TINTA}`, borderRadius: 10 }} />
      <div style={{ position: "absolute", inset: 0, background: "#6B4226", border: `7px solid ${TINTA}`, borderRadius: 8, transform: `translateY(${abre * 70}px)` }}>
        <div style={{ position: "absolute", left: "38%", right: "38%", top: "42%", height: 18, background: MANGO, border: `5px solid ${TINTA}`, borderRadius: 9 }} />
      </div>
    </div>
  );
}
/* letrero de la tasa */
function LetreroTasa({ x, y, txt, p = 1, sacude = 0, color = CREMA }) {
  return (
    <div style={{ position: "absolute", left: x - 170, top: y - 120, width: 340, opacity: Math.min(1, p * 3), transform: `scale(${rebote(Math.min(1, p))}) rotate(${4 * Math.sin(sacude * 25) * sacude}deg)` }}>
      <div style={{ background: color, border: `8px solid ${TINTA}`, borderRadius: 24, padding: "4px 0 12px", textAlign: "center", boxShadow: "0 10px 0 rgba(42,30,23,.3)" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 800, fontSize: 36, color: TINTA }}>tasa de interés</div>
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 120, lineHeight: 1, color: TINTA }}>{txt}</div>
      </div>
      <div style={{ width: 24, height: 160, background: "#8A5A35", border: `6px solid ${TINTA}`, margin: "0 auto" }} />
    </div>
  );
}

/* ═════ 1 y 6 · El plano y el cajón ═════ */
function Panaderia({ t }) {
  const segunda = t > S(6) - 0.5;
  const cam = segunda
    ? mover(t, { s: 1.2, x: 540, y: 1150 }, [{ a: S(6), b: E(6), s: 1.0, x: 540, y: 968 }])
    : mover(t, { s: 1.0, x: 540, y: 1000 }, [{ a: 0.2, b: E(1), s: 1.25, x: 540, y: 1150 }]);
  const abre = segunda ? 1 - rampa(t, M.vuelve, 0.6) : rampa(t, M.plano, 0.7);
  const cajonAbre = segunda ? pulso(t, M.vuelve - 0.2, 1.6) : rampa(t, M.cajon - 0.3, 0.4);
  const mete = segunda ? rampa(t, M.vuelve + 0.3, 0.5) : rampa(t, M.cajon, 0.5) * 0.35;
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      <Sombra x={300} y={1650} w={320} />
      <Mascota esp="zorro-corbata" x={300} y={1655} alto={600} t={t} cara={segunda ? "triste" : t > M.porque ? "tranquila" : "feliz"} bd={-60 * abre} orejas={segunda ? -5 : 0} semilla={3} />
      <Placa x={300} y={840} nombre="Bruno" rol="Empresario" p={segunda ? 0 : rampa(t, 0.4, 0.35)} />
      <Cajon x={760} y={1420} w={340} abre={cajonAbre} />
      <Plano x={lerp(560, 640, mete)} y={lerp(1080, 1460, mete)} w={lerp(420, 260, mete)} abre={abre * (1 - mete * 0.6)} giro={-6 + mete * 10} op={1 - rampa(mete, 0.85, 0.15)} />
      <Gigante x={820} y={720} txt="?" p={segunda ? 0 : rampa(t, M.porque, 0.3)} tam={240} giro={12} />
      {segunda && <Cartel x={540} y={560} txt="12 %" p={rampa(t, S(6), 0.3) * (1 - rampa(t, M.grúas - 1.2, 0.3))} tam={110} fondo={COLOR.CORAL} color="#fff" />}
    </Escena>
  );
}

/* ═════ 2-3 · En el banco ═════ */
function Banco({ t }) {
  const t0 = S(2) - 0.3;
  const cam = mover(t, { s: 1.15, x: 540, y: 1150 }, [{ a: t0, b: E(2), s: 1.25, x: 560, y: 1200 }, { a: S(3) - 0.2, b: S(3) + 0.8, s: 1.0, x: 540, y: 968 }]);
  const ladrillo = rampa(t, M.credito - 0.3, 0.5);
  const iconos = [["grua", M.maquinas, 220, "macro2026/ilustrados/grua-torre.webp"], ["horno", M.plantas, 540], ["caja", M.inventarios, 860, "macro2026/ilustrados/caja-bananos.webp"]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg" filtro="saturate(.9)">
      <Obj src="macro2026/objetos/banco-central.png" x={540} y={430} w={420} op={1 - rampa(t, S(3), 0.3)} />
      <Cartel x={540} y={190} txt="BANCO" p={rampa(t, t0, 0.4) * (1 - rampa(t, S(3), 0.3))} tam={70} fondo={AZUL} color="#fff" />
      <Sombra x={330} y={1640} w={320} />
      <Mascota esp="zorro-corbata" x={330} y={1645} alto={560} t={t} cara="feliz" bd={-70 * ladrillo} semilla={3} />
      {ladrillo > 0 && (
        <div style={{ position: "absolute", left: 560, top: lerp(1500, 1150, sale(ladrillo)), width: 300, height: 130, background: "#C4683C", border: `8px solid ${TINTA}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: "#fff", transform: `rotate(${-6 + 4 * Math.sin(t * 2)}deg)`, opacity: 1 - rampa(t, S(3) - 0.1, 0.3) }}>crédito</div>
      )}
      {iconos.map(([k, tt, x, src]) => {
        const p = rampa(t, tt - 0.1, 0.4);
        if (p <= 0) return null;
        return (
          <div key={k} style={{ position: "absolute", left: x - 140, top: 620, width: 280, height: 280, borderRadius: "50%", background: COLOR.I, border: `8px solid ${TINTA}`, transform: `scale(${rebote(p)})`, boxShadow: "0 10px 0 rgba(42,30,23,.3)", overflow: "hidden" }}>
            {src ? <Obj src={src} x={140} y={140} w={190} /> : <Horno x={140} y={235} w={150} brillo={0.6} />}
          </div>
        );
      })}
      <Cartel x={540} y={1100} txt="I · Inversión" p={rampa(t, M.inv, 0.35)} tam={80} fondo={COLOR.I} />
    </Escena>
  );
}

/* ═════ 4-5 · La obra: del 8 % al 12 % ═════ */
function Obra({ t }) {
  const t0 = S(4) - 0.3;
  const zoom = rampa(t, M.doce - 0.1, 0.25);
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t0, b: M.doce - 0.2, s: 1.08, x: 540, y: 1000 }, { a: M.doce - 0.1, b: M.doce + 0.15, s: 1.4, x: 430, y: 1050 }]);
  const doce = t >= M.doce;
  const sube = doce ? 0 : ((t - M.construir + 0.6) % 2.4) / 2.4;
  const ladrillos = !doce && t > M.construir - 0.6;
  return (
    <Escena cam={cam} fondo="art/obra.jpg">
      <Obj src="macro2026/ilustrados/grua-torre.webp" x={760} y={760} w={520} />
      {ladrillos && <div style={{ position: "absolute", left: 830, top: lerp(1250, 620, sale(sube)), width: 120, height: 70, background: "#C4683C", border: `6px solid ${TINTA}`, borderRadius: 8 }} />}
      <LetreroTasa x={300} y={760} txt={doce ? "12 %" : "8 %"} p={rampa(t, M.ocho - 0.3, 0.4)} sacude={pulso(t, M.doce, 0.5)} color={doce ? COLOR.CORAL : CREMA} />
      <Destello x={300} y={700} r={300} p={rampa(t, M.doce, 0.5)} />
      <Sombra x={420} y={1660} w={320} />
      <Mascota esp="zorro-corbata" x={420} y={1665} alto={580} t={t} cara={doce ? "estrellas" : "feliz"} salto={doce ? 30 * pulso(t, M.doce, 0.4) : 20 * pulso(t, M.construir, 0.4)} bi={doce ? 0 : -80 * pulso(t, M.construir - 0.2, 0.8)} semilla={3} />
      <Cartel x={540} y={1460} txt="¡A construir!" p={rampa(t, M.construir - 0.2, 0.3) * (1 - rampa(t, M.doce - 0.2, 0.2))} tam={64} fondo={COLOR.VERDE} color="#fff" />
      <Cartel x={600} y={1200} txt="cuota ↑" p={rampa(t, M.cuota, 0.3)} tam={70} fondo={COLOR.CORAL} color="#fff" giro={-4} />
    </Escena>
  );
}

/* ═════ 7-11 · El balancín de la tasa ═════ */
function Balancin({ t }) {
  const t0 = S(7) - 0.3;
  const cam = mover(t, { s: 1.0, x: 540, y: 1000 }, [{ a: M.largo - 0.3, b: M.largo + 0.4, s: 1.0, x: 540, y: 1000 }, { a: S(10) - 0.2, b: S(10) + 1.0, s: 1.05, x: 600, y: 1000 }]);
  const inclina = 13 * sale(rampa(t, M.sube - 0.3, 0.7)) + 9 * sale(rampa(t, M.largo, 0.6));
  const brazo = 360 + 140 * sale(rampa(t, M.largo - 0.2, 0.6));
  const nubes = rampa(t, M.nublado - 0.5, 0.8);
  const base = 1 - 0.5 * sale(rampa(t, M.nublado, 0.9));
  const ancho = 200, aBase = 150 * base, aTasa = 110;
  const px = 440, py = 1240;
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro={`blur(5px) saturate(${1 - 0.5 * nubes}) brightness(${1 - 0.25 * nubes})`} velo={0.12}>
      {/* nubes que tapan el futuro */}
      {[0, 1, 2].map((k) => (
        <Obj key={k} src="macro2026/ilustrados/nube-tormenta.webp" x={lerp(-300 + k * 200, 250 + k * 300, sale(nubes))} y={300 + k * 60 + 10 * Math.sin(t * 1.5 + k)} w={380} op={nubes} />
      ))}
      <Cartel x={540} y={560} txt="expectativas" p={rampa(t, M.expect, 0.35)} tam={62} fondo={CREMA} />
      {/* soporte */}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        <polygon points={`${px},${py} ${px - 110},${py + 300} ${px + 110},${py + 300}`} fill="#8A5A35" stroke={TINTA} strokeWidth={9} strokeLinejoin="round" />
      </svg>
      {/* tabla que gira sobre el pivote */}
      <div style={{ position: "absolute", left: px, top: py, width: 0, height: 0, transform: `rotate(${inclina}deg)` }}>
        <div style={{ position: "absolute", left: -380, top: -14, width: 380 + brazo, height: 30, background: "#C89B6A", border: `8px solid ${TINTA}`, borderRadius: 14 }} />
        {/* lado izquierdo: la tasa i */}
        <div style={{ position: "absolute", left: -380, top: -14 - aTasa, width: 170, height: aTasa, background: COLOR.CORAL, border: `8px solid ${TINTA}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 90, color: "#fff" }}>i</div>
        {/* lado derecho: la pila de inversión, con su base autónoma */}
        <div style={{ position: "absolute", left: brazo - ancho, top: -14 - aBase, width: ancho, height: aBase, background: COLOR.I, border: `8px solid ${TINTA}`, borderRadius: 16, backgroundImage: "repeating-linear-gradient(45deg, rgba(42,30,23,.22) 0 10px, transparent 10px 22px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 80, color: TINTA }}>{rampa(t, M.ibarra, 0.2) > 0 ? "Ī" : ""}</div>
        <div style={{ position: "absolute", left: brazo - ancho, top: -14 - aBase - 140, width: ancho, height: 140, background: COLOR.I, border: `8px solid ${TINTA}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 90, color: TINTA }}>I</div>
        {/* el brazo rotulado b */}
        <div style={{ position: "absolute", left: brazo * 0.35, top: 30, fontFamily: "Caveat", fontWeight: 700, fontSize: 160, color: MANGO, WebkitTextStroke: `8px ${TINTA}`, paintOrder: "stroke fill", opacity: rampa(t, M.b - 0.1, 0.4) }}>b</div>
        <div style={{ position: "absolute", left: 20, top: 40, width: brazo - 40, height: 10, background: MANGO, border: `3px solid ${TINTA}`, borderRadius: 5, opacity: rampa(t, M.b - 0.1, 0.4) }} />
      </div>
      <Flecha x0={180} y0={1100} x1={180} y1={880} p={rampa(t, M.sube - 0.1, 0.4)} color={COLOR.CORAL} />
      <Flecha x0={930} y0={1150} x1={930} y1={1420} p={rampa(t, M.baja - 0.1, 0.4)} color={COLOR.I} />
      <Cartel x={540} y={360} txt="i ↑  →  I ↓" p={rampa(t, M.baja + 0.2, 0.35) * (1 - rampa(t, S(10) - 0.3, 0.3))} tam={84} />
      <Destello x={900} y={1350} r={260} p={rampa(t, M.golpe, 0.5)} />
    </Escena>
  );
}

/* ═════ 12 · Olga escribe la fórmula ═════ */
function PlanoPizarra({ t }) {
  const t1 = M.formula;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t1, b: E(12), s: 1.06, x: 540, y: 930 }]);
  const partes = [["I", COLOR.I], ["=", "#fff"], ["Ī", COLOR.I], ["−", "#fff"], ["b", MANGO], ["·", "#fff"], ["i", COLOR.CORAL]];
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={60} y={330} w={960} h={760}>
        <Tiza x={450} y={60} txt="Función de inversión" p={rampa(t, t1, 0.8)} tam={88} centro />
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", gap: 22 }}>
          {partes.map(([s, col], i) => {
            const p = rampa(t, t1 + 0.6 + i * 0.22, 0.3);
            return <span key={i} style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 170, color: col, opacity: p, transform: `translateY(${(1 - sale(p)) * 30}px)`, display: "inline-block" }}>{s}</span>;
          })}
        </div>
        <Tiza x={200} y={520} txt="autónoma" p={rampa(t, t1 + 1.6, 0.6)} tam={50} centro color={COLOR.I} />
        <Tiza x={560} y={520} txt="sensibilidad" p={rampa(t, t1 + 2.0, 0.6)} tam={50} centro color={MANGO} />
        <Tiza x={780} y={520} txt="tasa" p={rampa(t, t1 + 2.3, 0.6)} tam={50} centro color={COLOR.CORAL} />
      </Pizarra>
      <Sombra x={830} y={1660} w={320} />
      <Mascota esp="gato-gafas" x={830} y={1665} alto={560} t={t} cara="feliz" bi={-60 * clamp01(Math.sin((t - t1) * 3)) * (t < E(12) ? 1 : 0)} semilla={7} espejo />
      <Placa x={830} y={1130} nombre="Olga" rol="Analista" p={rampa(t, t1 + 0.3, 0.35)} />
    </Escena>
  );
}

/* ═════ 13 · Bruno lee la noticia ═════ */
function Cierre({ t }) {
  const t0 = S(13) - 0.2;
  const cam = mover(t, { s: 1.15, x: 540, y: 1150 }, [{ a: t0, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const p = rampa(t, M.noticia, 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(3px)" velo={0.1}>
      <Sombra x={360} y={1650} w={320} />
      <Mascota esp="zorro-corbata" x={360} y={1655} alto={580} t={t} cara="tranquila" bd={-70 * p} bi={-40 * p} semilla={3} />
      <div style={{ position: "absolute", left: 470, top: lerp(1300, 980, sale(p)), width: 420, height: 300, background: "#F4F1E8", border: `8px solid ${TINTA}`, borderRadius: 8, transform: `rotate(${-5 + 2 * Math.sin(t * 2)}deg)`, opacity: Math.min(1, p * 3) }}>
        <div style={{ margin: "18px 24px 10px", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA }}>NOTICIA</div>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{ margin: "10px 24px", height: 14, background: "#B9B2A3", borderRadius: 7, width: `${80 - k * 12}%` }} />)}
      </div>
      <Flecha x0={420} y0={760} x1={420} y1={520} p={rampa(t, M.noticia + 0.6, 0.4)} color={COLOR.CORAL} />
      <Flecha x0={700} y0={520} x1={700} y1={760} p={rampa(t, M.noticia + 1.0, 0.4)} color={COLOR.I} />
      <Gigante x={420} y={430} txt="i" p={rampa(t, M.noticia + 0.8, 0.3)} tam={150} color={COLOR.CORAL} />
      <Gigante x={700} y={860} txt="I" p={rampa(t, M.noticia + 1.2, 0.3)} tam={150} color={COLOR.I} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "panaderia") return <Panaderia t={t} />;
  if (p.tipo === "banco") return <Banco t={t} />;
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "balancin") return <Balancin t={t} />;
  if (p.tipo === "pizarra") return <PlanoPizarra t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(M.plano, "papel", 0.55); fx(M.cajon - 0.3, "desliza", 0.45); fx(M.porque, "pop", 0.45);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(S(2), "pasos", 0.4); fx(M.credito - 0.2, "pop-suave", 0.45);
[M.maquinas, M.plantas, M.inventarios].forEach((tt) => fx(tt - 0.1, "pop", 0.45)); fx(M.inv, "campana", 0.4);
fx(M.ocho - 0.3, "letrero", 0.5); fx(M.construir - 0.4, "grua", 0.45);
fx(M.doce, "golpe", 0.7); fx(M.cuota, "baja", 0.45);
fx(M.vuelve + 0.3, "papel", 0.45); fx(M.vuelve + 0.8, "desliza", 0.4); fx(M.grúas - 0.3, "crujido", 0.45);
fx(M.sube - 0.3, "crujido", 0.5); fx(M.baja, "toc-grave", 0.55);
fx(M.b, "tiza", 0.45); fx(M.largo, "desliza", 0.45); fx(M.golpe, "golpe", 0.6);
fx(M.nublado - 0.4, "trueno", 0.4); fx(M.ibarra, "pop", 0.45);
fx(M.formula, "tiza-larga", 0.55); fx(M.formula + 1.2, "tiza", 0.45);
fx(M.noticia, "papel", 0.5); fx(M.noticia + 0.6, "sube", 0.4); fx(M.noticia + 1.0, "baja", 0.4);
fx(E(13) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/panaderia.jpg", "art/oficina.jpg", "art/obra.jpg", "art/ciudad.jpg", "macro2026/objetos/banco-central.png", "macro2026/ilustrados/grua-torre.webp", "macro2026/ilustrados/caja-bananos.webp", "macro2026/ilustrados/nube-tormenta.webp"];
const CLAVE = /^(inversión|I|tasa|interés|ocho|doce|columpio|sube|baja|b|autónoma|barra|expectativas|crédito)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const A3 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a3-columpio-tasa.mp3" sinSonido={sinSonido} />
);
