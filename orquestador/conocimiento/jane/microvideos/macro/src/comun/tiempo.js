/*
 * La voz manda: tiempos.json (voz medida con faster-whisper, herramientas/alinea.py)
 * dice dónde empieza y termina cada frase en el audio. crearTiempo() lo vuelve la
 * línea de tiempo del video: cada escena es un tramo del audio y entre tramos se
 * puede abrir una pausa (extra) para que la acción respire.
 */
export const FPS = 30;
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const suave = (p) => { p = clamp01(p); return p * p * (3 - 2 * p); };
export const sale = (p) => { p = clamp01(p); return 1 - Math.pow(1 - p, 3); };
export const rampa = (t, t0, d) => clamp01((t - t0) / d);
export const rebote = (p) => { p = clamp01(p); const s = 1.70158 * 1.4; return 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); };
export const pulso = (t, t0, d) => { const p = (t - t0) / d; return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
export const fmt = (p) => "$" + String(p).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const limpia = (w) => w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");

export function crearTiempo(DATOS, { extra = [], manual = {}, cola = 1.4, pausa = 0.25 } = {}) {
  const ESC = DATOS.escenas;
  const corte = ESC.map((e, i) => (i === 0 ? Math.max(0, e.ini - 0.12) : (ESC[i - 1].fin + e.ini) / 2));
  corte.push(ESC[ESC.length - 1].fin + 0.35);
  const TRAMOS = [];
  let v = 0;
  ESC.forEach((e, i) => {
    v += extra[i] ?? (i === 0 ? 0.35 : pausa);
    const a0 = corte[i], a1 = corte[i + 1];
    TRAMOS.push({ v, a0, a1, habla: v + (e.ini - a0), calla: v + (e.fin - a0) });
    v += a1 - a0;
  });
  const N = ESC.length;
  const S = (i) => TRAMOS[i - 1].habla;
  const E = (i) => TRAMOS[i - 1].calla;
  const D = (i) => E(i) - S(i);
  const c = (i, f) => S(i) + f * D(i);
  /* momento en que se dice una palabra de la escena i (n = la n-ésima vez) */
  const W = (i, palabra, frac = 0.5, n = 0) => {
    const e = ESC[i - 1];
    const hits = (e.palabras || []).filter((p) => limpia(p.w) === limpia(palabra));
    if (hits[n]) return TRAMOS[i - 1].v + (hits[n].ini - TRAMOS[i - 1].a0);
    return c(i, frac);
  };
  const DURACION_S = E(N) + cola;
  /* subtítulos: trozos cortos, dos líneas como mucho */
  const SUBS = [];
  ESC.forEach((e, idx) => {
    const i = idx + 1;
    const trozos = manual[i] || e.texto.split(/(?<=[.?:,…;!])\s+/).reduce((acc, t) => {
      const u = acc[acc.length - 1];
      if (u && (u.length < 14 || t.length < 10) && (u + " " + t).length <= 44) acc[acc.length - 1] = u + " " + t;
      else acc.push(t);
      return acc;
    }, []);
    let pal = 0;
    trozos.forEach((txt, k) => {
      const nPal = txt.split(/\s+/).length;
      const p0 = e.palabras[Math.min(pal, e.palabras.length - 1)];
      const p1 = e.palabras[Math.min(pal + nPal - 1, e.palabras.length - 1)];
      SUBS.push({ i, k, txt, ini: TRAMOS[idx].v + (p0.ini - TRAMOS[idx].a0), fin: TRAMOS[idx].v + (p1.fin - TRAMOS[idx].a0) });
      pal += nPal;
    });
  });
  SUBS.forEach((s, n) => { const sig = SUBS[n + 1]; s.hasta = sig && sig.ini - s.fin < 0.9 ? sig.ini : s.fin + 0.5; });
  return { ESC, N, TRAMOS, S, E, D, c, W, SUBS, DURACION_S, AUDIO: DATOS.audio };
}
