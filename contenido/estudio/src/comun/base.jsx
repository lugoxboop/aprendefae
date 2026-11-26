/* Piezas comunes: marionetas del repo, mango, cámara, tiza. Todo por cuadro. */
import { useEffect, useState } from "react";
import { staticFile, delayRender, continueRender, Img } from "remotion";
import MASCOTAS from "./mascotas.json";
import { clamp01, lerp, suave, rampa, rebote, sale } from "./tiempo.js";

export const TINTA = "#2A1E17";
export const CREMA = "#FFF6E0";
export const MANGO = "#F5B82E";
export const AZUL = "#2747F5";
export const TIZA = "#F1EEE3";
export const PIZARRA = "#23282B";

const CARAS = ["tranquila", "feliz", "triste", "risa", "racha", "guino", "estrellas", "corazones", "canta"];
const fuente = (fam, peso, arch) =>
  `@font-face { font-family: "${fam}"; font-weight: ${peso}; src: url("${staticFile("fonts/" + arch)}") format("woff2"); }`;
export const ESTILO = `
/* cada pieza gira sobre su propia caja (no sobre el lienzo entero) */
.mv g { transform-box: fill-box; }
.mv .mta-cara, .mv .mta-aura, .mv .mta-fuego, .mv .mta-confeti, .mv .mta-notas,
.mv .mta-corazones, .mv .mta-estrellas, .mv .mta-obj, .mv .mta-birrete, .mv .mta-chispas,
.mv .mta-lagrima, .mv .mta-sombra, .mv.sin-cola .mta-cola { display: none; }
${CARAS.map((c) => `.mv.cara-${c} .mta-c-${c}`).join(", ")} { display: inline; }
.mv .mta-cabeza { transform-origin: 50% 95%; transform: rotate(var(--cab, 0deg)); }
.mv .mta-cola { transform-origin: 5% 85%; transform: rotate(var(--cola, 0deg)); }
.mv .mta-ojos { transform-origin: 50% 50%; transform: scale(var(--ojx, 1), var(--ojo, 1)); }
.mv .mta-cuerpo { transform-origin: 50% 100%; transform: scaleY(var(--resp, 1)); }
.mv .mta-brazo-i { transform-origin: 90% 8%; transform: rotate(var(--bi, 0deg)); }
.mv .mta-brazo-d { transform-origin: 10% 8%; transform: rotate(var(--bd, 0deg)); }
.mv .mta-oreja-i { transform-origin: 70% 95%; transform: rotate(var(--oi, 0deg)); }
.mv .mta-oreja-d { transform-origin: 30% 95%; transform: rotate(var(--od, 0deg)); }
/* Las orejas giran desde donde se unen a la cabeza. Las del perro cuelgan: su
   unión está arriba (igual que en src/mascota/marioneta-estilo.js). */
.mv.esp-perro .mta-oreja-i { transform-origin: 60% 8%; }
.mv.esp-perro .mta-oreja-d { transform-origin: 40% 8%; }
${fuente("Inter", 600, "inter-latin-600-normal.woff2")}
${fuente("Inter", 700, "inter-latin-700-normal.woff2")}
${fuente("Inter", 800, "inter-latin-800-normal.woff2")}
${fuente("Sora", 700, "sora-latin-700-normal.woff2")}
${fuente("Sora", 800, "sora-latin-800-normal.woff2")}
${fuente("Caveat", 700, "caveat-latin-700-normal.woff2")}
`;

const BASE_MASCOTAS = staticFile("mascotas");
const svgDe = (esp) => MASCOTAS[esp].inner.replaceAll('href="/mascotas', `href="${BASE_MASCOTAS}`);
const CACHE = {};

/* Marioneta anclada por los pies: (x, y) es el punto del suelo, al centro. */
export function Mascota({
  esp: clave, x, y, alto, t, semilla = 0, cara = "tranquila", cab = 0, bi = 0, bd = 0,
  orejas = 0, ojos = 1, salto = 0, ladeo = 0, aplasta = 0, sinCola = false, op = 1, espejo = false,
}) {
  const esp = MASCOTAS[clave].esp;
  const [vx, vy, vw, vh] = MASCOTAS[clave].viewBox.split(" ").map(Number);
  const ancho = (alto * vw) / vh;
  const ciclo = (t + semilla * 0.83) % 3.3;
  const parp = ciclo < 0.14 ? Math.max(0.1, Math.abs(ciclo - 0.07) / 0.07) : 1;
  const resp = 1 + 0.014 * Math.sin((t + semilla) * 2.1);
  const cola = 7 * Math.sin((t + semilla * 0.5) * (cara === "feliz" ? 7 : 2.4));
  /* vaivén mínimo, y un tope para que la oreja nunca se despegue de la cabeza */
  const TOPE = esp === "perro" ? 8 : 5;
  const oreja = 1.2 * Math.sin((t + semilla) * 1.3);
  const giroOreja = Math.max(-TOPE, Math.min(TOPE, oreja + orejas));
  CACHE[clave] = CACHE[clave] || svgDe(clave);
  return (
    <div style={{
      position: "absolute", left: x - ancho / 2, top: y - alto - salto, width: ancho, height: alto, opacity: op,
      transformOrigin: "50% 100%",
      transform: `rotate(${ladeo}deg) scale(${(espejo ? -1 : 1) * (1 + aplasta * 0.5)}, ${1 - aplasta})`,
    }}>
      <svg
        className={`mv esp-${esp} cara-${cara}${sinCola ? " sin-cola" : ""}`}
        width={ancho} height={alto} viewBox={`${vx} ${vy} ${vw} ${vh}`}
        style={{
          display: "block", overflow: "visible",
          "--ojo": parp * ojos, "--ojx": ojos, "--resp": resp, "--cola": `${cola}deg`, "--cab": `${cab}deg`,
          "--bi": `${bi}deg`, "--bd": `${bd}deg`, "--oi": `${giroOreja}deg`, "--od": `${-giroOreja}deg`,
        }}
        dangerouslySetInnerHTML={{ __html: CACHE[clave] }}
      />
    </div>
  );
}

/* sombra elíptica en el suelo */
export const Sombra = ({ x, y, w, op = 0.22 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.09, width: w, height: w * 0.18, borderRadius: "50%", background: `rgba(40,25,10,${op})`, filter: "blur(6px)" }} />
);

/* imagen centrada en (x, y) */
export function Pieza({ src, x, y, w, giro = 0, esc = 1, op = 1, escY = null, estilo = {} }) {
  return (
    <Img src={staticFile(src)} style={{
      position: "absolute", left: x - w / 2, top: y, width: w, opacity: op, transformOrigin: "50% 50%",
      transform: `translateY(-50%) rotate(${giro}deg) scale(${esc}, ${escY ?? esc})`, ...estilo,
    }} />
  );
}
export const MangoImg = (p) => <Pieza src="art/mango.png" {...p} />;

/* ── Cámara: claves [t, escala, focoX, focoY]; nunca enseña los bordes ── */
export function camara(t, claves) {
  let k = 0;
  claves.forEach((c, i) => { if (t >= c[0]) k = i; });
  const a = claves[k], b = claves[Math.min(k + 1, claves.length - 1)];
  const p = a === b ? 0 : suave((t - a[0]) / Math.max(0.001, b[0] - a[0]));
  /* la clave b puede traer una retención: [t, s, x, y, "corte"] salta sin interpolar */
  const q = b[4] === "corte" ? 0 : p;
  return { s: lerp(a[1], b[1], q), x: lerp(a[2], b[2], q), y: lerp(a[3], b[3], q) };
}
export function Camara({ s, x, y, temblor = 0, t = 0, children, ancho = 1080, alto = 1920 }) {
  let tx = 540 - x * s, ty = 960 - y * s;
  tx = Math.min(0, Math.max(1080 - ancho * s, tx));
  ty = Math.min(0, Math.max(1920 - alto * s, ty));
  if (temblor) { tx += temblor * Math.sin(t * 71); ty += temblor * Math.cos(t * 83); }
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: ancho, height: alto, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
      {children}
    </div>
  );
}

/* ── Globo de pensamiento ── */
export function Globo({ x, y, w, h, p, children, cola = "izq" }) {
  if (p <= 0) return null;
  const e = Math.min(1, p);
  const dir = cola === "izq" ? -1 : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transformOrigin: cola === "izq" ? "0% 100%" : "100% 100%", transform: `scale(${e})`, opacity: Math.min(1, p * 2) }}>
      <div style={{ position: "absolute", inset: 0, background: CREMA, border: `7px solid ${TINTA}`, borderRadius: "48% 52% 50% 50% / 55% 55% 45% 45%", boxShadow: "0 10px 0 rgba(42,30,23,.18)" }} />
      {[[0.16, 1.04, 44], [0.06, 1.2, 28]].map(([fx, fy, d], i) => (
        <div key={i} style={{ position: "absolute", left: (dir < 0 ? fx : 1 - fx) * w - d / 2, top: fy * h - d / 2, width: d, height: d, borderRadius: "50%", background: CREMA, border: `6px solid ${TINTA}` }} />
      ))}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}

/* ── Precarga de imágenes y fuentes ── */
export function usePrecarga(extra = []) {
  const [handle] = useState(() => delayRender("piezas, fondos y fuentes"));
  useEffect(() => {
    const urls = new Set(extra.map((u) => staticFile(u)));
    Object.values(MASCOTAS).forEach(({ inner }) => {
      for (const m of inner.matchAll(/href="\/mascotas([^"]+)"/g)) urls.add(BASE_MASCOTAS + m[1]);
    });
    const imgs = [...urls].map((u) => new Promise((ok) => { const i = new Image(); i.onload = ok; i.onerror = ok; i.src = u; }));
    Promise.all([...imgs, document.fonts.ready]).then(() =>
      Promise.all(["600 40px Inter", "700 40px Inter", "800 40px Inter", "700 40px Sora", "800 40px Sora", "700 40px Caveat"].map((f) => document.fonts.load(f)))
        .then(() => continueRender(handle)));
  }, [handle]);
}

export { clamp01 };

/* Nombre y papel de la mascota cuando entra a escena («Nina · Familia») */
export function Placa({ x, y, nombre, rol, p, color = AZUL }) {
  if (p <= 0) return null;
  const e = rebote(Math.min(1, p));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${e})`, transformOrigin: "50% 0%", opacity: Math.min(1, p * 3), whiteSpace: "nowrap" }}>
      <div style={{ background: CREMA, border: `6px solid ${TINTA}`, borderRadius: 22, padding: "6px 26px 10px", boxShadow: "0 8px 0 rgba(42,30,23,.25)", textAlign: "center" }}>
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 52, color: TINTA, lineHeight: 1.1 }}>{nombre}</div>
        {rol && <div style={{ fontFamily: "Inter", fontWeight: 700, fontSize: 32, color, lineHeight: 1.1 }}>{rol}</div>}
      </div>
    </div>
  );
}
