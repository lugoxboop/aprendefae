/*
 * T2 A2 · «La fiebre de la economía» (pe26-a2-fiebre). Una idea: los problemas económicos son los síntomas
 * del circuito (inflación, desempleo, recesión, déficit fiscal y externo, y más); de ellos nace la política económica.
 */
import { Mascota, Sombra, Placa, TINTA, CREMA, MANGO, AZUL } from "../../comun/base.jsx";
import { crearTiempo } from "../../comun/tiempo.js";
import { VideoMicro, hazSfx, mover } from "../../comun/Video.jsx";
import { Escena, Obj, Cartel, Gigante, Destello, COLOR, clamp01, lerp, sale, rampa, rebote, pulso } from "../../comun/kit.jsx";
import DATOS from "./tiempos.json";

const T = crearTiempo(DATOS, { extra: [0.35, 0.4, 0.4, 0.35, 0.35, 0.35, 0.35, 0.35, 0.4, 0.4, 0.5, 0.4] });
const { S, E, W, c } = T;

const M = {
  enferma: W(1, "enferma", 0.4), sintomas: W(1, "síntomas", 0.85),
  circuito: W(2, "circuito", 0.2), hogares: W(2, "hogares", 0.4), empresas: W(2, "empresas", 0.5), estado: W(2, "Estado", 0.6), exterior: W(2, "exterior", 0.7), dinero: W(2, "dinero", 0.85),
  virus: W(3, "virus", 0.8),
  sube: W(10, "sube", 0.8),
  problemas: W(11, "problemas", 0.3), tratamiento: W(11, "tratamiento", 0.6), politica: W(11, "política", 0.85),
  sigue: S(12) + 0.1,
};
/* los virus: [nombre, escena, dibujo pequeño] */
const VIRUS = [
  ["Inflación", 4, "precios ↑", COLOR.CORAL],
  ["Desempleo", 5, "sin trabajo", "#8e94a0"],
  ["Recesión", 6, "producción ↓", "#6f86ff"],
  ["Déficit fiscal", 7, "gasta > recauda", COLOR.G],
  ["Déficit externo", 8, "importa > exporta", "#4fc2b2"],
  ["Desigualdad", 9, "", "#c58ad8"],
  ["Mala asignación", 9, "", "#d8a35a"],
  ["Daño ambiental", 9, "", COLOR.VERDE],
];
const tVirus = (i) => i < 5 ? S(VIRUS[i][1]) + 0.05 : [W(9, "desigualdad", 0.3), W(9, "recursos", 0.55), W(9, "ambiental", 0.85)][i - 5] - 0.2;

/* dónde aparece cada virus: cinco alrededor del circuito, tres pequeños adentro */
const SITIO = [[270, 320], [810, 320], [270, 1260], [810, 1260], [540, 1400], [380, 690], [700, 690], [540, 900]];

const PLANOS = [
  { tipo: "consulta", desde: 0 },
  { tipo: "circuito", desde: S(2) - 0.3, entra: "zoom" },
  { tipo: "receta", desde: S(11) - 0.3, entra: "fundido" },
  { tipo: "cierre", desde: S(12) - 0.2, entra: "zoom" },
];

/* termómetro dibujado: nivel 0..1 */
function Termometro({ x, y, h, nivel, t }) {
  const n = clamp01(nivel);
  const rojo = n > 0.6;
  return (
    <div style={{ position: "absolute", left: x - 45, top: y, width: 90, height: h + 110 }}>
      <div style={{ position: "absolute", left: 18, top: 0, width: 54, height: h, background: "#fff", border: `8px solid ${TINTA}`, borderRadius: 30, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${8 + 92 * n}%`, background: rojo ? "#E5484D" : "#F08A4B" }} />
        {[0.2, 0.4, 0.6, 0.8].map((f) => <div key={f} style={{ position: "absolute", left: 0, width: 18, top: `${(1 - f) * 100}%`, height: 5, background: TINTA }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, top: h - 20, width: 90, height: 90, borderRadius: "50%", background: rojo ? "#E5484D" : "#F08A4B", border: `8px solid ${TINTA}`, transform: `scale(${1 + 0.06 * Math.sin(t * (rojo ? 10 : 3))})` }} />
    </div>
  );
}
/* la economía como paciente: la casa-país con cara de fiebre */
function Paciente({ x, y, w, fiebre, t }) {
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w / 2, width: w, height: w, transform: `rotate(${2 * Math.sin(t * 3) * fiebre}deg)` }}>
      <Obj src="macro2026/ilustrados/casa-pais.webp" x={w / 2} y={w / 2} w={w} filtro={`saturate(${1 - 0.3 * fiebre})`} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: w, borderRadius: "50%", background: `radial-gradient(circle, rgba(229,72,77,${0.35 * fiebre}), rgba(229,72,77,0) 65%)` }} />
    </div>
  );
}

/* ═════ 1 · En el consultorio ═════ */
function Consulta({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 968 }, [{ a: 0.2, b: E(1), s: 1.12, x: 540, y: 1100 }]);
  return (
    <Escena cam={cam} fondo="art/consultorio.jpg">
      <Paciente x={420} y={1160} w={420} fiebre={0.5} t={t} />
      <Cartel x={420} y={880} txt="la economía" p={rampa(t, 0.4, 0.35)} tam={52} />
      <Sombra x={820} y={1690} w={280} />
      <Mascota esp="gato-gafas" x={820} y={1695} alto={540} t={t} cara="tranquila" bd={-70 * rampa(t, M.sintomas - 0.6, 0.4)} semilla={7} espejo />
      <Placa x={820} y={1080} nombre="Dra. Olga" rol="Analista" p={rampa(t, 0.6, 0.35)} />
      <Termometro x={640} y={lerp(1500, 1000, sale(rampa(t, M.sintomas - 0.6, 0.6)))} h={300} nivel={0.3} t={t} />
      <Gigante x={420} y={560} txt="?" p={rampa(t, M.enferma - 0.2, 0.35)} tam={240} giro={10} />
    </Escena>
  );
}

/* ═════ 2-10 · El circuito y sus virus ═════ */
const NODOS = [
  ["Hogares", "macro2026/ilustrados/casa-anden.webp", 540, 460, "hogares"],
  ["Empresas", "macro2026/ilustrados/fabrica.webp", 860, 780, "empresas"],
  ["Estado", "macro2026/ilustrados/edificio-gobierno.webp", 540, 1100, "estado"],
  ["Exterior", "macro2026/objetos/barco.png", 220, 780, "exterior"],
];
function Circuito({ t }) {
  const cam = mover(t, { s: 1.0, x: 540, y: 900 }, [{ a: M.virus - 0.4, b: M.virus + 0.6, s: 1.04, x: 540, y: 930 }]);
  const anillo = rampa(t, M.circuito - 0.1, 0.8);
  const dinero = rampa(t, M.dinero - 0.4, 0.4);
  const nv = VIRUS.filter((_, i) => t > tVirus(i)).length;
  const fiebre = Math.min(1, nv / 8 + 0.12 * pulso(t, M.sube - 0.2, 0.6));
  const temb = nv >= 6 ? 4 : 0;
  return (
    <Escena cam={{ ...cam, temblor: temb, t }} fondo="art/consultorio.jpg" filtro="blur(6px)" velo={0.35}>
      {/* el anillo del circuito */}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width="1" height="1">
        <circle cx={540} cy={780} r={320} fill="none" stroke={TINTA} strokeWidth={30} strokeDasharray={2200} strokeDashoffset={2200 * (1 - anillo)} opacity={0.9} />
        <circle cx={540} cy={780} r={320} fill="none" stroke={fiebre > 0.6 ? "#F3A0A0" : "#FFF6E0"} strokeWidth={16} strokeDasharray={2200} strokeDashoffset={2200 * (1 - anillo)} />
      </svg>
      {/* monedas que circulan */}
      {dinero > 0 && [...Array(8)].map((_, k) => {
        const a = (t * (0.7 - 0.45 * fiebre) + k / 8) * Math.PI * 2;
        return <Obj key={k} src="macro2026/ilustrados/moneda-oro.webp" x={540 + 320 * Math.cos(a)} y={780 + 320 * Math.sin(a)} w={60} op={dinero} />;
      })}
      {NODOS.map(([n, src, x, y, k]) => {
        const p = rampa(t, M[k] - 0.2, 0.4);
        return (
          <div key={n} style={{ opacity: Math.min(1, p * 3) }}>
            <div style={{ position: "absolute", left: x - 115, top: y - 115, width: 230, height: 230, borderRadius: "50%", background: CREMA, border: `8px solid ${TINTA}`, transform: `scale(${rebote(p)})`, overflow: "hidden" }}>
              <Obj src={src} x={115} y={115} w={170} />
            </div>
            <Cartel x={x} y={y + 150} txt={n} p={p} tam={42} />
          </div>
        );
      })}
      {/* los virus */}
      {VIRUS.map(([n, , sub, col], i) => {
        const t0 = tVirus(i);
        const p = rampa(t, t0, 0.45);
        if (p <= 0) return null;
        const [x, y] = SITIO[i];
        const foco = pulso(t, t0, 3.2) * (i < 5 ? 1 : 0.6);
        return (
          <div key={n}>
            <Obj src="macro2026/ilustrados/virus.webp" x={x} y={y + 8 * Math.sin(t * 3 + i)} w={(i < 5 ? 150 : 100) + 40 * foco} giro={t * 40 + i * 30} esc={rebote(p)} filtro={`hue-rotate(${i * 45}deg)`} />
            <Cartel x={x} y={y + (i < 5 ? 105 : 75)} txt={n} p={p} tam={i < 5 ? 42 + 6 * foco : 30} fondo={col} color="#fff" />
            {sub && <Cartel x={540} y={780} txt={sub} p={rampa(t, t0 + 0.3, 0.3) * (1 - rampa(t, tVirus(i + 1) - 0.1, 0.2))} tam={52} fondo={CREMA} />}
          </div>
        );
      })}
      <Termometro x={1010} y={560} h={300} nivel={0.25 + 0.75 * fiebre} t={t} />
      <Cartel x={540} y={190} txt="¡Fiebre!" p={rampa(t, M.sube - 0.4, 0.35)} tam={80} fondo="#E5484D" color="#fff" giro={-3} />
    </Escena>
  );
}

/* ═════ 11 · Problemas → tratamiento ═════ */
function Receta({ t }) {
  const cam = mover(t, { s: 1.05, x: 540, y: 1000 }, [{ a: S(11), b: E(11), s: 1.15, x: 540, y: 1100 }]);
  const receta = rampa(t, M.tratamiento - 0.3, 0.5);
  return (
    <Escena cam={cam} fondo="art/consultorio.jpg">
      <Paciente x={380} y={1160} w={380} fiebre={1 - 0.6 * rampa(t, M.politica, 1.5)} t={t} />
      <Cartel x={520} y={860} txt="problemas económicos" p={rampa(t, M.problemas - 0.2, 0.35)} tam={46} fondo={COLOR.CORAL} color="#fff" />
      <div style={{ position: "absolute", left: 560, top: lerp(1500, 1040, sale(receta)), width: 360, height: 420, background: "#fff", border: `8px solid ${TINTA}`, borderRadius: 14, transform: `rotate(4deg) scale(${rebote(receta)})`, opacity: Math.min(1, receta * 3) }}>
        <div style={{ margin: "18px 22px 6px", fontFamily: "Sora", fontWeight: 800, fontSize: 46, color: "#E5484D" }}>Rx</div>
        <div style={{ margin: "0 22px", fontFamily: "Caveat", fontWeight: 700, fontSize: 58, lineHeight: 1.05, color: AZUL, clipPath: `inset(0 ${100 - 100 * rampa(t, M.politica - 0.3, 0.9)}% 0 0)` }}>Política económica</div>
        {[0, 1, 2].map((k) => <div key={k} style={{ margin: "16px 22px", height: 10, background: "#C9CED6", borderRadius: 5, width: `${80 - k * 15}%` }} />)}
      </div>
      <Destello x={740} y={1250} r={360} p={rampa(t, M.politica - 0.2, 0.7)} />
      <Mascota esp="gato-gafas" x={900} y={1700} alto={420} t={t} cara="feliz" bd={-60 * receta} semilla={7} espejo />
    </Escena>
  );
}

/* ═════ 12 · Del problema al objetivo ═════ */
function Cierre({ t }) {
  const cam = mover(t, { s: 1.1, x: 540, y: 1000 }, [{ a: S(12) - 0.2, b: T.DURACION_S, s: 1.0, x: 540, y: 968 }]);
  const p = rampa(t, M.sigue, 0.5), q = rampa(t, M.sigue + 1.2, 0.5);
  return (
    <Escena cam={cam} fondo="art/consultorio.jpg" filtro="blur(6px)" velo={0.3}>
      <Cartel x={540} y={620} txt="problema" p={p} tam={84} fondo={COLOR.CORAL} color="#fff" giro={-3} />
      <Gigante x={540} y={860} txt="↓" p={rampa(t, M.sigue + 0.7, 0.3)} tam={180} color="#fff" />
      <Cartel x={540} y={1100} txt="objetivo" p={q} tam={84} fondo={COLOR.VERDE} color="#fff" giro={3} />
    </Escena>
  );
}

const pinta = (p, t) => {
  if (p.tipo === "consulta") return <Consulta t={t} />;
  if (p.tipo === "circuito") return <Circuito t={t} />;
  if (p.tipo === "receta") return <Receta t={t} />;
  return <Cierre t={t} />;
};

const [SFX, fx] = hazSfx();
fx(0.2, "pasos", 0.35); fx(M.enferma - 0.2, "pop", 0.45); fx(M.sintomas - 0.6, "ding", 0.4);
fx(M.circuito - 0.1, "desliza", 0.45);
["hogares", "empresas", "estado", "exterior"].forEach((k) => fx(M[k] - 0.2, "pop-suave", 0.4));
fx(M.dinero - 0.4, "monedas", 0.45);
fx(M.virus - 0.3, "burbuja", 0.45);
VIRUS.forEach((_, i) => { fx(tVirus(i), "pop", 0.45); fx(tVirus(i) + 0.15, "sube", 0.25); });
fx(M.sube - 0.4, "trueno", 0.35);
fx(M.problemas - 0.2, "toc-grave", 0.45); fx(M.tratamiento - 0.3, "papel", 0.5); fx(M.politica - 0.3, "firma", 0.5); fx(M.politica + 0.4, "campana", 0.45);
fx(M.sigue, "pop", 0.45); fx(M.sigue + 1.2, "pop", 0.45);
fx(E(12) + 0.1, "ding-doble", 0.45);

const ARTE = ["art/consultorio.jpg", "macro2026/ilustrados/casa-pais.webp", "macro2026/ilustrados/casa-anden.webp", "macro2026/ilustrados/fabrica.webp", "macro2026/ilustrados/edificio-gobierno.webp", "macro2026/objetos/barco.png", "macro2026/ilustrados/virus.webp", "macro2026/ilustrados/moneda-oro.webp"];
const CLAVE = /^(enferma|síntomas|circuito|virus|inflación|desempleo|recesión|déficit|fiscal|externo|desigualdad|fiebre|problemas|tratamiento|política|económica|objetivo)[.,:?…!¡]*$/i;

export const DURACION = T.DURACION_S;
export const B2 = ({ sinSonido = false }) => (
  <VideoMicro T={T} planos={PLANOS} pinta={pinta} sfx={SFX} clave={CLAVE} arte={ARTE} audio="audio/pe26-a2-fiebre.mp3" sinSonido={sinSonido} />
);
