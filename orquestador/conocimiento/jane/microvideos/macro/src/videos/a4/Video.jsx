/*
 * A4 · «Los que no miran tu sueldo» (da26-a4-no-miran-renta). Una idea: G y XN no dependen de la renta.
 * G lo fija el presupuesto (recauda 250, gasta 300 → déficit 50, con deuda); XN sigue al dólar ($4.000 → $4.500).
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Pizarra, Tiza, Barco, Destello, Flecha, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.5, 0.3, 0.3, 0.4, 0.4, 0.3, 0.3, 0.4, 0.3, 0.4, 0.5, 0.4] });
const { S, E, W, c } = T;

const M = {
  quienes: W(1, "Quiénes", 0.8),
  abre: S(2) + 0.05, presupuesto: W(2, "presupuesto", 0.6), renta: W(2, "renta", 0.9),
  candado: W(3, "autónomo", 0.6),
  recauda: W(4, "recauda", 0.4), gastar: W(4, "trescientos", 0.8),
  deficit: W(5, "déficit", 0.4), deuda: W(5, "deuda", 0.8),
  lucia: W(6, "Lucía", 0.5), cafe: W(6, "café", 0.7),
  dolar: W(7, "dólar", 0.8),
  cambio: W(8, "cambio", 0.4), cuatro: W(8, "cuatro", 0.85),
  sube: W(9, "quinientos", 0.4), vende: W(9, "vende", 0.85),
  caro: W(10, "importar", 0.2), suben: W(10, "suben", 0.85),
  bajad: W(11, "baja", 0.25), aprecia: W(11, "aprecia", 0.5),
  pizarra: S(12) - 0.1,
  noticia: S(13) + 0.1,
};

const PLANOS = [
  { tipo: "cortina", desde: 0 },
  { tipo: "despacho", desde: M.abre + 0.4, entra: "zoom" },
  { tipo: "puerto", desde: S(6) - 0.3, entra: "barrido" },
  { tipo: "pizarra", desde: S(12) - 0.35, entra: "fundido" },
  { tipo: "cierre", desde: S(13) - 0.2, entra: "zoom" },
];

/* ═════ 1 · Dos siluetas tras la cortina ═════ */
function Cortina({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: 0.1, b: E(1), s: 1.12, x: 540, y: 1100 }]);
  const abre = sale(rampa(t, M.abre - 0.2, 0.7));
  const sil = "brightness(0)";
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.1}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1935, background: "rgba(255,236,190,.55)" }} />
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", top: 120, height: 1650, width: 560, left: k === 0 ? -20 - abre * 540 : 540 + abre * 540, background: "repeating-linear-gradient(90deg, #B8323A 0 60px, #9E2830 60px 90px)", border: `8px solid ${TINTA}`, opacity: 0.93 }} />
      ))}
      <div style={{ position: "absolute", left: 300, top: 1000, filter: abre > 0.3 ? undefined : sil, opacity: abre > 0.3 ? 1 : 0.45 }}>
        <Mascota esp="panda-traje" x={0} y={650} alto={600} t={t} semilla={4} cara="feliz" />
      </div>
      <div style={{ position: "absolute", left: 780, top: 1000, filter: abre > 0.3 ? undefined : sil, opacity: abre > 0.3 ? 1 : 0.45 }}>
        <Mascota esp="hamster-gorra" x={0} y={650} alto={480} t={t} semilla={6} cara="feliz" espejo />
      </div>
      <div style={{ position: "absolute", left: -20, right: -20, top: 80, height: 90, background: "#8A5A35", border: `8px solid ${TINTA}` }} />
      <Gigante x={540} y={560} txt="?" p={rampa(t, M.quienes - 0.3, 0.35) * (1 - abre)} tam={360} giro={8 + 4 * Math.sin(t * 5)} />
      <Gigante x={330} y={1000} txt="1" p={rampa(t, 1.2, 0.35) * (1 - abre)} tam={170} color={COLOR.G} />
      <Gigante x={780} y={1000} txt="2" p={rampa(t, 1.6, 0.35) * (1 - abre)} tam={170} color={COLOR.XN} />
    </Escena>
  );
}

/* ═════ 2-5 · La ministra y su presupuesto ═════ */
function Despacho({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 1000 }, [{ a: S(4) - 0.2, b: S(4) + 0.8, s: 1.0, x: 540, y: 968 }, { a: M.deficit - 0.2, b: M.deficit + 0.8, s: 1.1, x: 640, y: 1000 }]);
  /* el grifo de la renta sube y baja; el bloque G no se mueve */
  const ondea = Math.sin((t - M.renta) * 3) * rampa(t, M.renta - 0.6, 0.4) * (1 - rampa(t, S(4) - 0.4, 0.3));
  const firma = rampa(t, M.presupuesto - 0.6, 0.9);
  const cols = rampa(t, S(4) - 0.1, 0.4);
  const rec = 250 * sale(rampa(t, M.recauda, 0.7)), gas = 300 * sale(rampa(t, M.gastar - 0.3, 0.7));
  const esc = 1.6, base = 1380;
  const def = rampa(t, M.deficit - 0.1, 0.5);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      {/* el presupuesto firmado */}
      <div style={{ position: "absolute", left: 120, top: 360, width: 360, height: 440, background: "#F4F1E8", border: `8px solid ${TINTA}`, borderRadius: 10, transform: `rotate(-4deg) scale(${rebote(rampa(t, M.abre + 0.3, 0.4))})`, opacity: 1 - cols }}>
        <div style={{ margin: "22px 26px 10px", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: TINTA }}>Presupuesto</div>
        {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ margin: "14px 26px", height: 14, background: "#B9B2A3", borderRadius: 7, width: `${85 - k * 10}%` }} />)}
        <svg width="300" height="80" style={{ position: "absolute", left: 30, bottom: 20 }}>
          <path d="M 10 50 C 40 10, 60 70, 90 40 S 140 20, 170 50 S 230 30, 280 40" fill="none" stroke={AZUL} strokeWidth={7} strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 * (1 - firma)} />
        </svg>
      </div>
      {/* el grifo de la renta, que sube y baja */}
      <div style={{ opacity: 1 - cols }}>
        <Obj src="macro2026/ilustrados/grifo.webp" x={780} y={330} w={260} />
        <div style={{ position: "absolute", left: 735 - 20 * ondea, top: 400, width: 50 + 40 * ondea + 20, height: 260, background: "linear-gradient(180deg,#5CC3E8,#2E8FC0)", border: `5px solid ${TINTA}`, borderRadius: 30, opacity: rampa(t, M.renta - 0.8, 0.3) }} />
        <Cartel x={780} y={720} txt={ondea > 0 ? "renta ↑" : "renta ↓"} p={rampa(t, M.renta - 0.5, 0.3)} tam={48} />
        {/* bloque G con candado */}
        <div style={{ position: "absolute", left: 640, top: 840, width: 280, height: 240, background: COLOR.G, border: `9px solid ${TINTA}`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 140, color: "#fff", WebkitTextStroke: `8px ${TINTA}`, paintOrder: "stroke fill", transform: `scale(${rebote(rampa(t, M.abre + 0.5, 0.4))})` }}>G</div>
        <Obj src="macro2026/ilustrados/candado.webp" x={900} y={850} w={150} esc={rebote(rampa(t, M.candado - 0.2, 0.4))} op={rampa(t, M.candado - 0.2, 0.1)} />
        <Cartel x={780} y={1170} txt="autónomo" p={rampa(t, M.candado, 0.35)} tam={56} fondo={MANGO} />
      </div>
      {/* columnas recauda / gasta y el hueco del déficit */}
      {cols > 0 && (
        <div style={{ opacity: cols }}>
          {[["Recauda", rec, 500, COLOR.VERDE], ["Gasta", gas, 840, COLOR.G]].map(([n, v, x, col]) => (
            <div key={n}>
              <div style={{ position: "absolute", left: x - 130, top: base - v * esc, width: 260, height: v * esc, background: col, border: `9px solid ${TINTA}`, borderRadius: 16, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 20, fontFamily: "Sora", fontWeight: 800, fontSize: 84, color: "#fff", WebkitTextStroke: `7px ${TINTA}`, paintOrder: "stroke fill" }}>{Math.round(v)}</div>
              <div style={{ position: "absolute", left: x - 160, width: 320, top: base + 20, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA }}>{n}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: 370, top: base - 250 * esc, width: 620, height: 0, borderTop: `7px dashed ${TINTA}`, opacity: rampa(t, M.gastar + 0.3, 0.3) }} />
          {def > 0 && (
            <div style={{ position: "absolute", left: 370, top: base - 300 * esc, width: 260, height: 50 * esc * sale(def), background: "repeating-linear-gradient(45deg, #8e94a0 0 12px, #c9ccd3 12px 24px)", border: `8px solid ${TINTA}`, borderRadius: 14 }} />
          )}
          <Cartel x={560} y={base - 300 * esc - 70} txt="Déficit → deuda" p={rampa(t, M.deuda - 0.3, 0.35)} tam={56} fondo={COLOR.CORAL} color="#fff" />
        </div>
      )}
      <Sombra x={230} y={1680} w={280} />
      <Mascota esp="panda-traje" x={230} y={1685} alto={520} t={t} cara={def > 0 ? "tranquila" : "feliz"} bd={-60 * pulso(t, M.presupuesto - 0.6, 1.2)} semilla={4} />
      <Placa x={250} y={1060} nombre="Ministra Mei" rol="Gobierno" p={rampa(t, M.abre + 0.5, 0.35) * (1 - cols)} />
    </Escena>
  );
}

/* ═════ 6-11 · El puerto y el dólar ═════ */
function Puerto({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1100 }, [{ a: S(7) - 0.2, b: S(7) + 0.8, s: 1.0, x: 540, y: 968 }]);
  const precio = t < M.sube ? 4000 : t < M.bajad ? lerp(4000, 4500, sale(rampa(t, M.sube, 0.6))) : lerp(4500, 3600, sale(rampa(t, M.bajad, 0.6)));
  const billete = rampa(t, M.dolar - 0.4, 0.4);
  const etiqueta = rampa(t, M.cuatro - 0.3, 0.35);
  const fase = t < M.sube ? 0 : t < M.bajad ? 1 : 2;
  /* barcos que salen con café (exportaciones) y llegan con celulares (importaciones) */
  const salen = fase === 1 ? 3 : 1, llegan = fase === 1 ? 1 : fase === 2 ? 3 : 2;
  const xn = fase === 0 ? 0 : fase === 1 ? sale(rampa(t, M.caro, 0.8)) : 1 - 1.4 * sale(rampa(t, M.aprecia - 0.3, 0.8));
  const ciclo = (k, n, dur) => ((t - S(6) + k * dur / n) % dur) / dur;
  return (
    <Escena cam={cam} fondo="art/puerto.jpg">
      {t > M.vende - 1.0 && [...Array(salen)].map((_, k) => <Barco key={"s" + k} x={lerp(500, -400, ciclo(k, salen, 3.0))} y={980 + k * 30} w={360} carga="macro2026/objetos/contenedor.png" t={t + k} espejo />)}
      {t > M.caro - 0.8 && [...Array(llegan)].map((_, k) => <Barco key={"l" + k} x={lerp(1500, 600, ciclo(k, llegan, 3.4))} y={1060 + k * 30} w={320} carga="macro2026/objetos/celular.png" t={t + k + 2} espejo />)}
      <Sombra x={260} y={1680} w={280} />
      <Mascota esp="hamster-gorra" x={260} y={1685} alto={470} t={t} cara={fase === 2 ? "triste" : "feliz"} bd={fase === 1 ? -80 * pulso(t, M.vende - 0.3, 0.9) : 0} semilla={6} />
      <div style={{ position: "absolute", left: 390, top: 1450, width: 170, height: 210, background: "#B07A45", border: `8px solid ${TINTA}`, borderRadius: "40% 40% 18% 18%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 40, color: "#fff", WebkitTextStroke: `5px ${TINTA}`, paintOrder: "stroke fill" }}>CAFÉ</div>
      <Placa x={260} y={1080} nombre="Lucía" rol="Exportadora" p={rampa(t, M.lucia - 0.2, 0.35) * (1 - rampa(t, S(7), 0.3))} />
      {/* el billete con su etiqueta de precio */}
      {billete > 0 && (
        <div style={{ position: "absolute", left: 560, top: 380, transform: `scale(${rebote(billete)}) rotate(${-6 + 2 * Math.sin(t * 2)}deg)` }}>
          <Obj src="macro2026/ilustrados/billete-usd.webp" x={190} y={0} w={380} />
          {etiqueta > 0 && (
            <div style={{ position: "absolute", left: 150, top: 90, transform: `scale(${rebote(etiqueta) * (1 + 0.15 * pulso(t, M.sube, 0.5) + 0.15 * pulso(t, M.bajad, 0.5))})`, background: fase === 1 ? COLOR.VERDE : fase === 2 ? COLOR.CORAL : CREMA, border: `8px solid ${TINTA}`, borderRadius: 18, padding: "4px 22px 8px", whiteSpace: "nowrap", fontFamily: "Sora", fontWeight: 800, fontSize: 64, color: fase ? "#fff" : TINTA }}>
              ${Math.round(precio).toLocaleString("es-CO")}
            </div>
          )}
        </div>
      )}
      <Cartel x={760} y={300} txt="tipo de cambio" p={rampa(t, M.cambio - 0.3, 0.35)} tam={50} />
      {/* el bloque de exportaciones netas */}
      {fase > 0 && (
        <div style={{ position: "absolute", left: 830, top: 1380 - 220 * Math.max(0.15, 0.5 + xn * 0.5), width: 170, height: 220 * Math.max(0.15, 0.5 + xn * 0.5), background: COLOR.XN, border: `8px solid ${TINTA}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 56, color: TINTA, opacity: rampa(t, M.caro, 0.3) }}>XN</div>
      )}
      <Gigante x={915} y={1450} txt={fase === 2 ? "↓" : "↑"} p={fase === 1 ? rampa(t, M.suben, 0.3) : fase === 2 ? rampa(t, M.aprecia, 0.3) : 0} tam={160} color={fase === 2 ? COLOR.CORAL : COLOR.VERDE} />
    </Escena>
  );
}

/* ═════ 12 · Olga resume ═════ */
function PlanoPizarra({ t }) {
  const t1 = M.pizarra;
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: t1, b: E(12), s: 1.06, x: 540, y: 930 }]);
  return (
    <Escena cam={cam} fondo="art/oficina.jpg">
      <Pizarra x={60} y={330} w={960} h={760}>
        <Tiza x={450} y={50} txt="No miran la renta" p={rampa(t, t1, 0.8)} tam={86} centro />
        <Tiza x={60} y={230} txt="G" p={rampa(t, W(12, "Gasto", 0.2), 0.3)} tam={140} color={COLOR.G} />
        <Tiza x={220} y={270} txt="← presupuesto" p={rampa(t, W(12, "presupuesto", 0.4), 0.7)} tam={84} />
        <Tiza x={60} y={430} txt="XN" p={rampa(t, W(12, "exportaciones", 0.4), 0.3)} tam={140} color={COLOR.XN} />
        <Tiza x={290} y={470} txt="← el dólar" p={rampa(t, W(12, "dólar", 0.9), 0.7)} tam={84} />
      </Pizarra>
      <Sombra x={830} y={1660} w={320} />
      <Mascota esp="gato-gafas" x={830} y={1665} alto={560} t={t} cara="feliz" bi={-60 * clamp01(Math.sin((t - t1) * 3)) * (t < E(12) ? 1 : 0)} semilla={7} espejo />
      <Placa x={830} y={1130} nombre="Olga" rol="Analista" p={rampa(t, t1 + 0.3, 0.35)} />
    </Escena>
  );
}

/* ═════ 13 · Bruno con el periódico ═════ */
function Cierre({ t }) {
  const t0 = S(13) - 0.2;
  const cam = mover(t, { s: 1.15, x: 540, y: 1150 }, [{ a: t0, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const p = rampa(t, M.noticia, 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(3px)" velo={0.1}>
      <Sombra x={360} y={1650} w={320} />
      <Mascota esp="zorro-corbata" x={360} y={1655} alto={580} t={t} cara="tranquila" bd={-70 * p} semilla={3} />
      <div style={{ position: "absolute", left: 470, top: lerp(1300, 980, sale(p)), width: 420, height: 300, background: "#F4F1E8", border: `8px solid ${TINTA}`, borderRadius: 8, transform: `rotate(${-5 + 2 * Math.sin(t * 2)}deg)`, opacity: Math.min(1, p * 3) }}>
        <div style={{ margin: "18px 24px 10px", fontFamily: "Sora", fontWeight: 800, fontSize: 44, color: TINTA }}>NOTICIA</div>
        <div style={{ margin: "0 24px", fontFamily: "Sora", fontWeight: 800, fontSize: 56, color: COLOR.VERDE }}>Dólar ↑</div>
        {[0, 1].map((k) => <div key={k} style={{ margin: "12px 24px", height: 14, background: "#B9B2A3", borderRadius: 7, width: `${80 - k * 15}%` }} />)}
      </div>
      {[["?", 300, 560], ["→", 540, 620], ["?", 780, 560]].map(([s, x, y], i) => <Gigante key={i} x={x} y={y} txt={s} p={rampa(t, M.noticia + 0.5 + i * 0.3, 0.3)} tam={160} color={i === 1 ? "#fff" : MANGO} />)}
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "cortina") return <Cortina t={t} />;
  if (p.tipo === "despacho") return <Despacho t={t} />;
  if (p.tipo === "puerto") return <Puerto t={t} />;
  if (p.tipo === "pizarra") return <PlanoPizarra t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.2, "redoble", 0.4); fx(M.quienes - 0.3, "pop", 0.45); fx(M.abre - 0.2, "whoosh", 0.45);
PLANOS.slice(1).forEach((p) => p.entra?.startsWith("barrido") && fx(p.desde - 0.05, "barrido", 0.35));
fx(M.presupuesto - 0.6, "firma", 0.55); fx(M.renta - 0.6, "agua", 0.35);
fx(M.candado - 0.2, "candado", 0.55);
fx(M.recauda, "monedas", 0.45); fx(M.gastar - 0.3, "monedas", 0.45);
fx(M.deficit - 0.1, "sube", 0.35); fx(M.deuda - 0.3, "sello", 0.55);
fx(S(6) + 0.2, "bocina", 0.4); fx(M.dolar - 0.4, "pop", 0.45); fx(M.cuatro - 0.3, "pop", 0.5);
fx(M.sube, "sube", 0.45); fx(M.vende - 0.3, "bocina", 0.4); fx(M.vende + 0.4, "bocina", 0.3);
fx(M.caro, "bocina-grave", 0.35); fx(M.suben, "pop", 0.45);
fx(M.bajad, "baja", 0.45); fx(M.aprecia, "desliza", 0.45);
fx(M.pizarra, "tiza-larga", 0.55); fx(W(12, "presupuesto", 0.4), "tiza", 0.45); fx(W(12, "dólar", 0.9), "tiza", 0.45);
fx(M.noticia, "papel", 0.5);
fx(E(13) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/ciudad.jpg", "art/oficina.jpg", "art/puerto.jpg", "art/panaderia.jpg", "macro2026/ilustrados/grifo.webp", "macro2026/ilustrados/candado.webp", "macro2026/ilustrados/billete-usd.webp", "macro2026/objetos/contenedor.png", "macro2026/objetos/barco.png", "macro2026/objetos/celular.png"];
const CLAVE = /^(Gobierno|G|gasto|presupuesto|autónomo|déficit|deuda|dólar|cambio|exportaciones|netas|renta|aprecia)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const A4 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/da26-a4-no-miran-renta.mp3" sinSonido={sinSonido} />
);
