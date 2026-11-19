/*
 * Chispas: una ráfaga corta de confeti que sale de un elemento (un acierto,
 * el sello de pieza terminada). Se pintan como spans fijos que solo animan
 * transform y opacity, y se borran solos al terminar. Con «reducir
 * movimiento» no sale ninguna.
 */
const COLORES_BASE = ["#F8F9FA", "#FFE08A", "#B9AEFF", "#8FD3F2", "#F3ACD4"];
const FORMAS = ["c", "o", "e"];

const reducido = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function lanzarChispas(origen, { cantidad = 18, tono = null, fuerza = 1 } = {}) {
  if (typeof document === "undefined" || !origen || reducido()) return;
  const r = origen.getBoundingClientRect?.();
  if (!r || (r.width === 0 && r.height === 0)) return;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const colores = tono ? [tono, tono, ...COLORES_BASE] : COLORES_BASE;
  const capa = document.createDocumentFragment();
  const hechas = [];
  for (let i = 0; i < cantidad; i += 1) {
    const s = document.createElement("span");
    s.className = "fae-ap-chispa";
    s.setAttribute("aria-hidden", "true");
    s.dataset.forma = FORMAS[i % FORMAS.length];
    const ang = (Math.PI * 2 * i) / cantidad + (Math.random() - 0.5) * 0.6;
    const dist = (60 + Math.random() * 70) * fuerza;
    s.style.background = colores[i % colores.length];
    s.style.setProperty("--x0", `${cx - 4}px`);
    s.style.setProperty("--y0", `${cy - 4}px`);
    s.style.setProperty("--x1", `${cx - 4 + Math.cos(ang) * dist}px`);
    s.style.setProperty("--y1", `${cy - 4 + Math.sin(ang) * dist + 30 * fuerza}px`);
    s.style.setProperty("--giro", `${Math.round((Math.random() - 0.5) * 540)}deg`);
    s.style.setProperty("--dur", `${700 + Math.round(Math.random() * 350)}ms`);
    capa.appendChild(s);
    hechas.push(s);
  }
  document.body.appendChild(capa);
  setTimeout(() => hechas.forEach((s) => s.remove()), 1200);
}
