/*
 * Gestión de Proyectos · GP-01 «El pan de cada día» (gp01-pan-de-cada-dia).
 * Una idea: un proyecto es un esfuerzo temporal para crear algo único (G p. 4–5);
 * lo que se repite sin fin es operación (G p. 16). Pía (hámster) y Ramón (perro), elenco de la materia.
 */
import { Mascota, Sombra, Placa, Globo, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Cartel, Gigante, Destello, Pizarra, Tiza, TrazoTiza, Horno, Pan, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.3, 0.35, 0.35, 0.3, 0.3, 0.3, 0.35, 0.45, 0.3, 1.1, 0.4] });
const { S, E, W } = T;

const M = {
  hornea: W(1, "hornea", 0.15), quinientos: W(1, "quinientos", 0.25), manana: W(1, "mañana", 0.4), proyecto1: W(1, "proyecto.", 0.9),
  horno: W(2, "horno,", 0.1), receta: W(2, "receta,", 0.3), dias: W(2, "días.", 0.6), fin: W(2, "fin.", 0.95),
  nuevo: W(3, "nuevo:", 0.35), segunda: W(3, "segunda", 0.6), barrio: W(3, "barrio.", 0.95),
  cambia: W(4, "cambia.", 0.25), primer: W(4, "primer", 0.55), ultimo: W(4, "último", 0.85),
  noexiste: W(5, "existe:", 0.35), local: W(5, "local,", 0.55), horno5: W(5, "horno,", 0.75), vecinos: W(5, "vecinos.", 0.95),
  ladrillos: W(6, "ladrillos", 0.4), primera: W(6, "primera,", 0.6), unica: W(6, "única.", 0.95),
  ramon: W(7, "Ramón", 0.1), acaba: W(7, "acaba?", 0.9),
  puertas: W(8, "puertas.", 0.35), termina: W(8, "termina", 0.6), queda: W(8, "queda.", 0.95),
  nombre: W(9, "nombre.", 0.9),
  proyecto10: W(10, "proyecto", 0.1), temporal: W(10, "temporal", 0.45), unico: W(10, "único.", 0.95),
  repite: W(11, "repite", 0.3), operacion: W(11, "operación.", 0.95),
  idea: W(12, "idea:", 0.3), proyecto12: W(12, "proyecto", 0.55), operacion12: W(12, "operación?", 0.75), averiguarlo: W(12, "averiguarlo.", 0.95),
};

const PLANOS = [
  { tipo: "panaderia", desde: 0 },
  { tipo: "barrio", desde: S(3) - 0.3, entra: "barrido" },
  { tipo: "obra", desde: S(4) - 0.3, entra: "barrido" },
  { tipo: "pizarra", desde: S(9) - 0.35, entra: "zoom" },
  { tipo: "operacion", desde: S(11) - 0.3, entra: "barrido-izq" },
  { tipo: "cierre", desde: S(12) - 0.25, entra: "zoom" },
];

const LADRILLO = "#C8643B", LADRILLO2 = "#B4532E", JUNTA = "#E9D6B8";

/* Calendario de pared: hojas que pasan (vel > 0) o dos alfileres (inicio y fin) */
function Calendario({ x, y, w, t, vel = 0, hoja = "", alfiler = [0, 0], sello = 0 }) {
  const h = w * 1.1;
  const pasa = vel > 0 ? (t * vel) % 1 : 0;
  const num = vel > 0 ? 1 + Math.floor(t * vel) % 31 : null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", border: `8px solid ${TINTA}`, borderRadius: 18, boxShadow: "0 12px 0 rgba(42,30,23,.25)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * 0.24, background: COLOR.CORAL, border: `8px solid ${TINTA}`, borderRadius: "18px 18px 0 0" }} />
      {[0.25, 0.75].map((f) => <div key={f} style={{ position: "absolute", left: w * f - 12, top: -26, width: 24, height: 52, background: "#596579", border: `5px solid ${TINTA}`, borderRadius: 12 }} />)}
      {num !== null ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.3, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.42, color: TINTA }}>{num}</div>
          {/* la hoja que se va volando */}
          <div style={{ position: "absolute", left: 8, right: 8, top: h * 0.24, height: h * 0.72, background: "#fff", borderTop: `4px solid ${TINTA}`, transformOrigin: "50% 0%", transform: `perspective(700px) rotateX(${pasa * 120}deg)`, opacity: 1 - pasa * pasa, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.42, color: TINTA, paddingTop: h * 0.06 }}>{num === 1 ? 31 : num - 1}</div>
        </>
      ) : (
        <div style={{ position: "absolute", left: w * 0.08, right: w * 0.08, top: h * 0.32, bottom: h * 0.08, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {Array.from({ length: 20 }).map((_, k) => <div key={k} style={{ background: "#EDE7DB", borderRadius: 6 }} />)}
        </div>
      )}
      {alfiler[0] > 0 && <Alfiler x={w * 0.2} y={h * 0.42} p={alfiler[0]} color={COLOR.VERDE} txt="inicio" />}
      {alfiler[1] > 0 && <Alfiler x={w * 0.8} y={h * 0.84} p={alfiler[1]} color="#E5484D" txt="fin" />}
      {sello > 0 && (
        <div style={{ position: "absolute", left: w / 2, top: h * 0.62, transform: `translate(-50%,-50%) rotate(-14deg) scale(${lerp(2.2, 1, sale(sello))})`, opacity: Math.min(1, sello * 3), border: `10px solid #E5484D`, color: "#E5484D", fontFamily: "Sora", fontWeight: 800, fontSize: w * 0.2, padding: "4px 22px", borderRadius: 14, background: "rgba(255,255,255,.85)" }}>{hoja || "FIN"}</div>
      )}
    </div>
  );
}
function Alfiler({ x, y, p, color, txt }) {
  const e = rebote(Math.min(1, p));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${e})`, transformOrigin: "50% 100%" }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", background: color, border: `7px solid ${TINTA}`, margin: "0 auto" }} />
      <div style={{ width: 10, height: 40, background: TINTA, margin: "0 auto" }} />
      <div style={{ position: "absolute", left: "50%", top: -64, transform: "translateX(-50%)", background: color, color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: 40, padding: "2px 18px 6px", borderRadius: 14, border: `5px solid ${TINTA}`, whiteSpace: "nowrap" }}>{txt}</div>
    </div>
  );
}

/* La panadería nueva: muro de ladrillo que sube hilada por hilada (alto 0..1), toldo, horno, letrero y puerta */
function Local({ x, y, w, alto = 1, toldo = 0, horno = 0, letrero = 0, puerta = 0, luz = 0, nombre = "Pía 2", t = 0 }) {
  const h = w * 0.95, filas = 12, hFila = h / filas;
  const vis = Math.floor(clamp01(alto) * filas + 0.999);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h }}>
      {luz > 0 && <div style={{ position: "absolute", left: -w * 0.3, top: -h * 0.3, width: w * 1.6, height: h * 1.6, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,214,120,${0.55 * luz}), rgba(255,214,120,0) 65%)` }} />}
      {Array.from({ length: vis }).map((_, f) => {
        const fila = filas - 1 - f;
        const pf = clamp01(clamp01(alto) * filas - f);
        return (
          <div key={f} style={{ position: "absolute", left: 0, width: w, top: fila * hFila - (1 - sale(pf)) * 90, height: hFila, opacity: Math.min(1, pf * 3), display: "flex", paddingLeft: f % 2 ? hFila : 0, overflow: "hidden", background: JUNTA, borderLeft: `7px solid ${TINTA}`, borderRight: `7px solid ${TINTA}` }}>
            {Array.from({ length: 9 }).map((_, k) => <div key={k} style={{ flex: "0 0 auto", width: hFila * 2 - 6, height: hFila - 6, margin: 3, background: (k + f) % 3 ? LADRILLO : LADRILLO2, borderRadius: 3 }} />)}
          </div>
        );
      })}
      {alto >= 1 && <div style={{ position: "absolute", left: -14, right: -14, top: -16, height: 26, background: TINTA, borderRadius: 8 }} />}
      {/* ventana-vitrina con horno adentro */}
      {horno > 0 && (
        <div style={{ position: "absolute", left: w * 0.08, top: h * 0.38, width: w * 0.44, height: h * 0.36, background: `rgba(255,236,190,${0.6 + 0.4 * luz})`, border: `8px solid ${TINTA}`, borderRadius: 10, overflow: "hidden", opacity: Math.min(1, horno * 3) }}>
          <Horno x={w * 0.22} y={h * 0.36 + (1 - sale(horno)) * 200} w={w * 0.22} brillo={0.4 + 0.6 * luz} />
        </div>
      )}
      {/* puerta: se abre girando sobre la bisagra */}
      <div style={{ position: "absolute", left: w * 0.62, top: h * 0.4, width: w * 0.28, height: h * 0.6, background: "#4A2C1A", border: `8px solid ${TINTA}`, borderBottom: "none", opacity: alto >= 1 ? 1 : 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#FFE2A0,#F5B82E)", opacity: puerta }} />
        <div style={{ position: "absolute", inset: 0, background: "#8A5A35", border: `6px solid ${TINTA}`, transformOrigin: "0% 50%", transform: `perspective(600px) rotateY(${-75 * sale(puerta)}deg)` }}>
          <div style={{ position: "absolute", right: 14, top: "50%", width: 18, height: 18, borderRadius: "50%", background: MANGO, border: `4px solid ${TINTA}` }} />
        </div>
      </div>
      {/* toldo a rayas */}
      {toldo > 0 && (
        <div style={{ position: "absolute", left: -w * 0.05, top: h * 0.2, width: w * 1.1, height: h * 0.14, transformOrigin: "50% 0%", transform: `scaleY(${rebote(Math.min(1, toldo))})`, background: "repeating-linear-gradient(90deg,#E5484D 0 46px,#FFF6E0 46px 92px)", border: `7px solid ${TINTA}`, borderRadius: "6px 6px 30px 30px" }} />
      )}
      {letrero > 0 && <Cartel x={w / 2} y={h * 0.1} txt={nombre} p={letrero} tam={w * 0.11} fondo={MANGO} />}
    </div>
  );
}

/* Contador que sube (0 → 500) */
function Contador({ x, y, p }) {
  if (p <= 0) return null;
  const n = Math.round(500 * sale(p));
  return <Gigante x={x} y={y} txt={String(n)} p={Math.min(1, p * 4)} tam={170} color={MANGO} />;
}

/* Tachón rojo sobre un cartel */
const Tachon = ({ x, y, w, p }) => p <= 0 ? null : (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 14, width: w * sale(p), height: 28, background: "#E5484D", border: `5px solid ${TINTA}`, borderRadius: 14, transform: "rotate(-12deg)", transformOrigin: "0% 50%" }} />
);

/* ═════ 1–2 · La panadería de todos los días ═════ */
function Panaderia({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [
    { a: 0.3, b: S(1) + 2.2, s: 1.08, x: 560, y: 1000 },
    { a: S(2) - 0.4, b: S(2) + 0.6, s: 1.25, x: 430, y: 760 },
  ]);
  /* los panes salen del horno una y otra vez: un ciclo cada 0,9 s */
  const ciclo = (t - M.hornea) / 0.9;
  const panes = [];
  for (let k = Math.max(0, Math.floor(ciclo) - 2); k <= Math.floor(ciclo); k++) {
    const q = ciclo - k;
    if (ciclo < 0 || q > 1.6) continue;
    panes.push(<Pan key={k} x={lerp(580, 880, sale(Math.min(1, q)))} y={lerp(690, 1000, sale(Math.min(1, q))) - 200 * Math.sin(Math.PI * Math.min(1, q))} w={120} giro={q * 200} />);
  }
  const cuenta = rampa(t, M.hornea, M.manana - M.hornea);
  const fuera = 1 - rampa(t, S(2) - 0.5, 0.4);
  const pProy = rampa(t, M.proyecto1 - 0.35, 0.35);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      {panes}
      <div style={{ opacity: fuera }}>
        <Contador x={720} y={430} p={cuenta} />
        <Cartel x={720} y={600} txt="¿proyecto?" p={pProy} tam={60} />
        <Tachon x={720} y={600} w={400} p={rampa(t, M.proyecto1 + 0.1, 0.3)} />
      </div>
      {/* el calendario que no se acaba */}
      <Calendario x={210} y={520} w={230} t={t} vel={t > M.dias - 0.6 ? 7 : 0} />
      <Gigante x={210} y={760} txt="∞" p={rampa(t, M.fin - 0.4, 0.35)} tam={150} color="#fff" />
      <Sombra x={780} y={1500} w={300} />
      <Mascota esp="hamster-gorra" x={780} y={1505} alto={560} t={t} cara="feliz" bd={-40 * Math.abs(Math.sin(t * 3.5))} semilla={3} espejo />
      <Placa x={780} y={880} nombre="Pía" rol="Dueña de la panadería" p={rampa(t, 0.6, 0.35) * (1 - rampa(t, M.manana + 0.4, 0.3))} />
    </Escena>
  );
}

/* ═════ 3 · Mira el barrio y sueña ═════ */
function Barrio({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(3), b: E(3), s: 1.12, x: 600, y: 900 }]);
  const pG = rampa(t, M.segunda - 0.5, 0.5);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg">
      <Globo x={420} y={300} w={560} h={470} p={pG} cola="izq">
        <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 470 }}>
          <Local x={280} y={420} w={300} alto={1} toldo={1} letrero={1} horno={0} t={t} />
        </div>
      </Globo>
      <Gigante x={830} y={330} txt="!" p={rampa(t, M.nuevo - 0.3, 0.3)} tam={200} color={MANGO} giro={8} />
      <Sombra x={330} y={1560} w={300} />
      <Mascota esp="hamster-gorra" x={330} y={1565} alto={600} t={t} cara="estrellas" cab={-6} bi={-40 * pulso(t, M.nuevo - 0.3, 0.9)} semilla={3} />
    </Escena>
  );
}

/* ═════ 4–8 · La segunda sede, de la obra a la apertura ═════ */
function Obra({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [
    { a: S(5) - 0.3, b: S(5) + 0.6, s: 1.05, x: 560, y: 1000 },
    { a: S(6) - 0.2, b: S(6) + 0.6, s: 1.0, x: 540, y: 968 },
    { a: S(7) - 0.2, b: S(7) + 0.5, s: 1.2, x: 300, y: 1150 },
    { a: S(8) - 0.3, b: S(8) + 0.6, s: 1.0, x: 540, y: 968 },
  ]);
  const enEsc6 = rampa(t, S(6) - 0.3, 0.5) * (1 - rampa(t, S(7) - 0.3, 0.4));
  const mv = sale(rampa(t, S(5) - 0.3, 0.6)), mv2 = sale(rampa(t, M.termina - 0.9, 0.5));
  const xCal = lerp(lerp(540, 220, mv), 850, mv2), yCal = lerp(lerp(760, 440, mv), 430, mv2), wCal = lerp(lerp(400, 230, mv), 300, mv2);
  const opCal = 1 - rampa(t, S(7) - 0.4, 0.3) + rampa(t, M.termina - 0.9, 0.3);
  const alto = rampa(t, S(5) - 0.1, M.local - S(5) + 0.5);
  const puerta = rampa(t, M.puertas - 0.2, 0.6);
  const luz = rampa(t, M.queda - 0.5, 0.6);
  /* ladrillos que caen en las dos sedes */
  const caen = [];
  if (enEsc6 > 0) {
    for (let k = 0; k < 6; k++) {
      const q = rampa(t, M.ladrillos - 0.6 + k * 0.15, 0.55);
      if (q <= 0 || q >= 1) continue;
      const lado = k % 2 ? 1 : -1;
      caen.push(<div key={k} style={{ position: "absolute", left: (lado < 0 ? 240 : 760) + (k - 3) * 14, top: lerp(120, 820, q * q), width: 70, height: 34, background: LADRILLO, border: `5px solid ${TINTA}`, borderRadius: 4, transform: `rotate(${q * 300}deg)` }} />);
    }
  }
  const xNueva = lerp(560, 740, sale(enEsc6));
  const wNueva = lerp(560, 440, sale(enEsc6));
  return (
    <Escena cam={cam} fondo="art/obra.jpg">
      {/* la primera panadería aparece a la izquierda para comparar */}
      {enEsc6 > 0 && (
        <div style={{ opacity: enEsc6 }}>
          <Local x={260} y={1150} w={360} alto={1} toldo={1} letrero={1} nombre="Pía" t={t} />
        </div>
      )}
      <Local x={xNueva} y={1150} w={wNueva} alto={alto} toldo={rampa(t, M.local + 0.2, 0.4)} horno={rampa(t, M.horno5 - 0.2, 0.5)} letrero={rampa(t, M.unica - 0.6, 0.4) || (t > S(7) ? 1 : 0)} puerta={puerta} luz={luz} t={t} />
      {caen}
      <Destello x={xNueva} y={900} r={340} p={rampa(t, M.unica - 0.3, 0.8)} />
      <Cartel x={xNueva} y={560} txt="única" p={rampa(t, M.unica - 0.25, 0.35) * (1 - rampa(t, S(7) - 0.3, 0.3))} tam={74} fondo={MANGO} giro={-4} />
      {/* vecinos nuevos */}
      {["conejo", "gato", "zorro"].map((esp, k) => {
        const p = rampa(t, M.vecinos - 0.5 + k * 0.15, 0.4) * (1 - rampa(t, S(6) - 0.3, 0.3)) + (t > S(8) ? rampa(t, M.puertas - 0.4 + k * 0.2, 0.5) : 0);
        if (p <= 0) return null;
        return <Mascota key={esp} esp={esp} x={170 + k * 150 + (t > S(8) ? 380 - k * 40 : 0)} y={1320} alto={260 * rebote(Math.min(1, p))} t={t} cara="feliz" semilla={k + 5} espejo={k === 2} />;
      })}
      <div style={{ opacity: clamp01(opCal) }}><Calendario x={xCal} y={yCal} w={wCal} t={t} alfiler={[rampa(t, M.primer - 0.2, 0.35), rampa(t, M.ultimo - 0.2, 0.35)]} sello={rampa(t, M.termina - 0.15, 0.3)} /></div>
      {/* la cinta de inauguración */}
      {t > S(8) - 0.3 && (
        <>
          <div style={{ position: "absolute", left: xNueva + wNueva * 0.1, top: 1060, width: wNueva * 0.3 * (1 - 0.6 * puerta), height: 26, background: "#E5484D", border: `5px solid ${TINTA}`, transform: `rotate(${-20 * puerta}deg)`, transformOrigin: "0% 50%" }} />
          <div style={{ position: "absolute", left: xNueva + wNueva * 0.4 + wNueva * 0.3 * 0.6 * puerta, top: 1060, width: wNueva * 0.3 * (1 - 0.6 * puerta), height: 26, background: "#E5484D", border: `5px solid ${TINTA}`, transform: `rotate(${20 * puerta}deg)`, transformOrigin: "100% 50%" }} />
        </>
      )}
      {/* Pía dirige la obra */}
      <Sombra x={830} y={1520} w={260} />
      <Mascota esp="hamster-gorra" x={830} y={1525} alto={500} t={t} cara={t > M.queda - 0.6 ? "feliz" : "tranquila"} bd={-70 * pulso(t, M.primer - 0.3, 1.2) - 90 * pulso(t, M.puertas - 0.4, 1.4)} salto={60 * pulso(t, M.queda - 0.4, 0.6)} semilla={3} espejo />
      {/* Ramón, con harina, pregunta */}
      {t > S(7) - 0.4 && (
        <>
          <Sombra x={270} y={1520} w={280} />
          <Mascota esp="perro" x={lerp(-150, 270, sale(rampa(t, S(7) - 0.4, 0.6)))} y={1525} alto={540} t={t} cara={t < S(8) + 1 ? "tranquila" : "feliz"} cab={-10 * pulso(t, M.acaba - 0.8, 1.2)} orejas={6 * pulso(t, M.acaba - 0.6, 0.8)} semilla={9} />
          <Placa x={270} y={900} nombre="Ramón" rol="Panadero" p={rampa(t, M.ramon - 0.1, 0.35) * (1 - rampa(t, S(8) + 0.4, 0.3))} color={COLOR.CORAL} />
          <Gigante x={420} y={820} txt="?" p={rampa(t, M.acaba - 0.4, 0.3) * (1 - rampa(t, S(8), 0.3))} tam={180} giro={12} />
        </>
      )}
    </Escena>
  );
}

/* ═════ 9–10 · El nombre, en la pizarra de la panadería ═════ */
function Definicion({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: S(10) - 0.2, b: E(10), s: 1.05, x: 540, y: 900 }]);
  const pT = rampa(t, M.temporal - 0.3, 0.5), pU = rampa(t, M.unico - 0.5, 0.5);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg" filtro="blur(7px)" velo={0.15}>
      <Pizarra x={70} y={260} w={940} h={1040}>
        <Tiza x={440} y={40} txt="¿?" p={rampa(t, S(9), 0.5) * (1 - rampa(t, M.proyecto10 - 0.2, 0.2))} tam={140} centro />
        <Tiza x={440} y={40} txt="Proyecto" p={rampa(t, M.proyecto10 - 0.15, 0.6)} tam={130} centro color={MANGO} />
        {/* temporal: una línea con principio y fin */}
        <Tiza x={60} y={300} txt="temporal " p={pT} tam={96} />
        <TrazoTiza d="M 120 520 L 760 520" p={rampa(t, M.temporal, 0.7)} w={10} />
        {[120, 760].map((x, k) => <TrazoTiza key={x} d={`M ${x} 480 L ${x} 560`} p={rampa(t, M.temporal + 0.2 + k * 0.4, 0.25)} w={12} />)}
        <Tiza x={80} y={570} txt="inicio" p={rampa(t, M.temporal + 0.25, 0.3)} tam={50} color="#9FE0B4" />
        <Tiza x={700} y={570} txt="fin" p={rampa(t, M.temporal + 0.65, 0.3)} tam={50} color="#FF9B95" />
        {/* único: una estrella */}
        <Tiza x={60} y={700} txt="único " p={pU} tam={96} />
        <Gigante x={640} y={770} txt="★" p={rampa(t, M.unico - 0.2, 0.4)} tam={170} color={MANGO} giro={-8} />
      </Pizarra>
      <Destello x={540} y={420} r={300} p={rampa(t, M.proyecto10 - 0.1, 0.8)} />
    </Escena>
  );
}

/* ═════ 11 · Y lo de todos los días: operación ═════ */
function Operacion({ t }) {
  const cam = mover(t, { s: 1.15, x: 560, y: 900 }, [{ a: S(11), b: E(11), s: 1.0, x: 540, y: 968 }]);
  const ciclo = (t - S(11)) / 0.8;
  const panes = [];
  for (let k = Math.max(0, Math.floor(ciclo) - 2); k <= Math.floor(ciclo); k++) {
    const q = ciclo - k;
    if (ciclo < 0 || q > 1.6) continue;
    panes.push(<Pan key={k} x={lerp(580, 880, sale(Math.min(1, q)))} y={lerp(690, 1000, sale(Math.min(1, q))) - 200 * Math.sin(Math.PI * Math.min(1, q))} w={120} giro={q * 200} />);
  }
  const pO = rampa(t, M.operacion - 0.4, 0.4);
  return (
    <Escena cam={cam} fondo="art/panaderia.jpg">
      {panes}
      <Gigante x={300} y={440} txt="↻" p={rampa(t, M.repite - 0.3, 0.4)} tam={230} color={COLOR.VERDE} giro={(t - M.repite) * 140} />
      <Cartel x={620} y={660} txt="operación" p={pO} tam={88} fondo={COLOR.VERDE} color="#fff" giro={-3} />
      <Sombra x={760} y={1500} w={280} />
      <Mascota esp="perro" x={760} y={1505} alto={540} t={t} cara="feliz" bd={-50 * Math.abs(Math.sin(t * 3))} semilla={9} espejo />
    </Escena>
  );
}

/* ═════ 12 · Tu idea: ¿proyecto u operación? ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.08, x: 540, y: 1000 }, [{ a: S(12), b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  return (
    <Escena cam={cam} fondo="art/ciudad.jpg" filtro="blur(6px)" velo={0.25}>
      <Cartel x={290} y={560} txt="proyecto" p={rampa(t, M.proyecto12 - 0.3, 0.35)} tam={78} fondo={AZUL} color="#fff" giro={-4} />
      <Cartel x={790} y={600} txt="operación" p={rampa(t, M.operacion12 - 0.3, 0.35)} tam={78} fondo={COLOR.VERDE} color="#fff" giro={4} />
      <Gigante x={540} y={820} txt="?" p={rampa(t, M.idea - 0.2, 0.35)} tam={240} color={MANGO} giro={-6 + 6 * Math.sin(t * 4)} />
      <Sombra x={540} y={1530} w={300} />
      <Mascota esp="hamster-gorra" x={540} y={1535} alto={600} t={t} cara="guino" bi={-60 * pulso(t, M.averiguarlo - 0.8, 1.2)} salto={40 * pulso(t, M.averiguarlo - 0.4, 0.5)} semilla={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "panaderia") return <Panaderia t={t} />;
  if (p.tipo === "barrio") return <Barrio t={t} />;
  if (p.tipo === "obra") return <Obra t={t} />;
  if (p.tipo === "pizarra") return <Definicion t={t} />;
  if (p.tipo === "operacion") return <Operacion t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.15, "campana", 0.3);
for (let k = 0; k < 5; k++) fx(M.hornea + k * 0.9 + 0.1, "pop-suave", 0.3);
fx(M.proyecto1 - 0.35, "pop", 0.4); fx(M.proyecto1 + 0.1, "toc-grave", 0.4);
fx(M.dias - 0.6, "papel", 0.4); fx(M.fin - 0.4, "eco", 0.3);
fx(S(3) - 0.3, "whoosh", 0.4); fx(M.nuevo - 0.3, "ding", 0.4); fx(M.segunda - 0.5, "burbuja", 0.4);
fx(S(4) - 0.3, "whoosh", 0.4); fx(M.primer - 0.2, "toc", 0.45); fx(M.ultimo - 0.2, "toc", 0.45);
fx(S(5) - 0.1, "grua", 0.3); fx(M.local + 0.2, "desliza", 0.35); fx(M.horno5 - 0.2, "golpe", 0.3);
[0, 1, 2].forEach((k) => fx(M.vecinos - 0.5 + k * 0.15, "pop-suave", 0.35));
for (let k = 0; k < 6; k += 2) fx(M.ladrillos - 0.1 + k * 0.15, "toc", 0.3);
fx(M.unica - 0.3, "campana", 0.4);
fx(S(7) - 0.4, "pasos", 0.35); fx(M.acaba - 0.4, "pop", 0.4);
fx(M.puertas - 0.25, "tijera", 0.45); fx(M.termina - 0.15, "sello", 0.5); fx(M.queda - 0.5, "ding-doble", 0.4);
fx(S(9) - 0.35, "barrido-lento", 0.35); fx(M.proyecto10 - 0.15, "tiza-larga", 0.4); fx(M.temporal - 0.3, "tiza", 0.4); fx(M.unico - 0.5, "tiza", 0.4); fx(M.unico - 0.2, "ding", 0.35);
fx(S(11) - 0.3, "whoosh", 0.4); fx(M.repite - 0.3, "rebobina", 0.3); fx(M.operacion - 0.4, "pop", 0.45);
fx(M.proyecto12 - 0.3, "pop", 0.4); fx(M.operacion12 - 0.3, "pop", 0.4); fx(E(12) + 0.1, "ding-doble", 0.4);

const ARTE = ["art/panaderia.jpg", "art/ciudad.jpg", "art/obra.jpg"];
const CLAVE = /^(proyecto|proyecto\.|operación|operación\.|operación\?|temporal|único|única|único\.|única\.|fin\.|primer|último)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const GP01 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/gp01-pan-de-cada-dia.mp3" sinSonido={sinSonido} />
);
