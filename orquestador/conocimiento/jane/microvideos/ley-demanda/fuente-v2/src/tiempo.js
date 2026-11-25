/*
 * Los tiempos del video salen de la voz medida (tiempos.json: dónde empieza y
 * termina cada frase en el audio, y cada palabra). Aquí se convierten en la
 * línea de tiempo del video: cada escena es un tramo del audio, y entre tramos
 * se puede abrir una pausa (EXTRA) para que la acción respire.
 */
import DATOS from "./tiempos.json";

export const FPS = 30;
export const ESC = DATOS.escenas;
export const AUDIO = DATOS.audio; // nombre del archivo en public/audio, o null

/* pausa extra ANTES de cada escena (s) */
const EXTRA = DATOS.extra || [0.3, 0.55, 0.15, 0.1, 0.35, 0.1, 0.35, 0.15, 0.4, 0.25, 0.15, 0.2, 0.2, 0.2, 0.3];
const COLA = 1.2;

/* cortes del audio: a mitad del silencio entre frases */
const corte = ESC.map((e, i) => (i === 0 ? Math.max(0, e.ini - 0.12) : (ESC[i - 1].fin + e.ini) / 2));
corte.push(ESC[ESC.length - 1].fin + 0.35);

export const TRAMOS = [];
{
  let v = 0;
  ESC.forEach((e, i) => {
    v += EXTRA[i] ?? 0.3;
    const a0 = corte[i], a1 = corte[i + 1];
    TRAMOS.push({ v, a0, a1, habla: v + (e.ini - a0), calla: v + (e.fin - a0) });
    v += a1 - a0;
  });
}
/* i = número de escena del guion (1..15) */
export const S = (i) => TRAMOS[i - 1].habla;
export const E = (i) => TRAMOS[i - 1].calla;
export const D = (i) => E(i) - S(i);
export const c = (i, f) => S(i) + f * D(i);
export const DURACION_S = E(15) + COLA;

const limpia = (w) => w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
/* momento en que se dice una palabra de la escena; si no hay medición, una fracción */
export function W(i, palabra, frac, n = 0) {
  const e = ESC[i - 1];
  const hits = (e.palabras || []).filter((p) => limpia(p.w) === limpia(palabra));
  if (hits[n]) return TRAMOS[i - 1].v + (hits[n].ini - TRAMOS[i - 1].a0);
  return c(i, frac);
}

/* ── Subtítulos: trozos cortos, a dos líneas como mucho ── */
const MANUAL = { 15: ["Ahora te toca.", "En la actividad, tú decides:", "¿se mueve la curva,", "o te mueves sobre ella?"] };
export const SUBS = [];
ESC.forEach((e, idx) => {
  const i = idx + 1;
  const trozos = MANUAL[i] || e.texto.split(/(?<=[.?:,…])\s+/).reduce((acc, t) => {
    const u = acc[acc.length - 1];
    if (u && (u.length < 14 || t.length < 10) && (u + " " + t).length <= 44) acc[acc.length - 1] = u + " " + t;
    else acc.push(t);
    return acc;
  }, []);
  const total = trozos.reduce((s, t) => s + t.length, 0);
  let pos = 0, pal = 0;
  trozos.forEach((txt, k) => {
    const nPal = txt.split(/\s+/).length;
    let ini, fin;
    if (e.palabras && e.palabras.length) {
      const p0 = e.palabras[Math.min(pal, e.palabras.length - 1)];
      const p1 = e.palabras[Math.min(pal + nPal - 1, e.palabras.length - 1)];
      ini = TRAMOS[idx].v + (p0.ini - TRAMOS[idx].a0);
      fin = TRAMOS[idx].v + (p1.fin - TRAMOS[idx].a0);
    } else {
      ini = c(i, pos / total); fin = c(i, (pos + txt.length) / total);
    }
    SUBS.push({ i, k, txt, ini, fin });
    pos += txt.length; pal += nPal;
  });
});
/* cada trozo se queda hasta que entra el siguiente (o 0,5 s después de la frase) */
SUBS.forEach((s, n) => {
  const sig = SUBS[n + 1];
  s.hasta = sig && sig.ini - s.fin < 0.9 ? sig.ini : s.fin + 0.5;
});

/* ── utilidades ── */
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const suave = (p) => { p = clamp01(p); return p * p * (3 - 2 * p); };
export const sale = (p) => { p = clamp01(p); return 1 - Math.pow(1 - p, 3); };
export const rampa = (t, t0, d) => clamp01((t - t0) / d);
/* rebote al llegar (overshoot) */
export const rebote = (p) => {
  p = clamp01(p);
  const s = 1.70158 * 1.4;
  return 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
};
/* pulso 0→1→0 centrado */
export const pulso = (t, t0, d) => { const p = (t - t0) / d; return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
export const fmt = (p) => "$" + String(p).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
