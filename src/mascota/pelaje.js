/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL RECOLOREO DEL PELAJE de las mascotas ilustradas.
 *
 * Las ilustraciones (ilustradas/*.js) vienen con el pelaje en tonos de GRIS y
 * los ojos/contorno en su color. Para pintar una raza no se le echa un tinte
 * plano encima: se cambia cada tono de gris por el tono equivalente de una
 * RAMPA de color (sombra profunda → medio → reflejo claro). Así el lomo queda
 * oscuro y el hocico/pecho más claro, con volumen, en vez de una mancha sola.
 *
 * Lo que NO se toca: el contorno negro y los ojos. En las razas oscuras los
 * ojos se aclaran a un ámbar (campo `ojo`) para que se sigan viendo sobre el
 * pelaje oscuro.
 *
 * Es teoría del color aplicada a mano: sombras cálidas, reflejos claros y poco
 * saturados. El mismo motor que se validó antes de integrarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Un tono es «pelaje» si es gris (R≈G≈B) y no tan oscuro como el contorno. */
function aRGB(c) {
  const s = String(c).trim();
  let m = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (m) return [+m[1], +m[2], +m[3]];
  m = s.match(/^#([0-9a-f]{3})$/i);
  if (m) return [...m[1]].map((x) => parseInt(x + x, 16));
  m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].substr(i, 2), 16));
  return null;
}
const luz = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const esGris = ([r, g, b]) => Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) <= 14;
const aHex = ([r, g, b]) => "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");

/* Muestrea una rampa (oscuro→claro) en n∈[0,1] interpolando en RGB. */
function muestra(rampa, n) {
  const p = rampa.map(aRGB);
  const x = Math.max(0, Math.min(1, n)) * (p.length - 1);
  const i = Math.floor(x), f = x - i;
  if (i >= p.length - 1) return p[p.length - 1];
  return p[i].map((v, k) => v + (p[i + 1][k] - v) * f);
}

/*
 * Las razas. Cada una es una rampa de pelaje; `ojo` (opcional) aclara los ojos
 * en las oscuras. Las claves son las MISMAS paletas que ya existen (0162), así
 * que no hace falta tocar la base ni migrar nada: solo cambia cómo se pintan.
 */
export const RAMPAS = {
  negro:     { rampa: ["#141210", "#201c19", "#2f2a26", "#4a433d", "#726a62"], ojo: "#8a6f52" },
  gris:      { rampa: ["#2f343c", "#4a515c", "#6f7681", "#9aa0aa", "#d8dbe0"] },
  canela:    { rampa: ["#6a4324", "#8c5e34", "#b2834f", "#d9b584", "#f2ddc0"] },
  chocolate: { rampa: ["#33200f", "#4a3019", "#6b4728", "#9a7044", "#cfa877"] },
  jengibre:  { rampa: ["#8a3b14", "#b85a22", "#e07f3a", "#f0b472", "#f8e4c8"] }, // naranja
  arena:     { rampa: ["#7e5118", "#a67a28", "#cda352", "#e8cd86", "#f8ebbe"] }, // dorado
};

/* Sin paleta elegida, cada especie tira a su color «de nacimiento». */
export const PELAJE_NATURAL = {
  zorro: "jengibre",
  conejo: "gris",
  hamster: "arena",
};

/* La raza efectiva: la elegida, o la natural de la especie, o gris de reserva. */
export function razaDe(paleta, especie) {
  if (paleta && paleta !== "natural" && RAMPAS[paleta]) return paleta;
  return PELAJE_NATURAL[especie] || "gris";
}

/*
 * Devuelve el SVG con el pelaje de la raza pedida. Cambia los grises del pelaje
 * por la rampa; deja el contorno y aclara los ojos si la raza lo pide.
 */
export function recolorarPelaje(svg, paleta, especie) {
  const R = RAMPAS[razaDe(paleta, especie)];
  if (!R) return svg;
  const tokens = [...new Set([...svg.matchAll(/(?:fill|stop-color)="([^"]+)"/g)].map((m) => m[1]))];
  const pelo = tokens.map((t) => ({ t, rgb: aRGB(t) })).filter((x) => x.rgb && esGris(x.rgb) && luz(x.rgb) >= 0.17);
  const ojos = tokens.map((t) => ({ t, rgb: aRGB(t) })).filter((x) => x.rgb && !esGris(x.rgb) && luz(x.rgb) < 0.22);
  if (!pelo.length) return svg;
  const L = pelo.map((x) => luz(x.rgb));
  const lo = Math.min(...L), hi = Math.max(...L);
  let out = svg;
  for (const f of pelo) {
    const n = hi > lo ? (luz(f.rgb) - lo) / (hi - lo) : 0.5;
    out = out.split(`"${f.t}"`).join(`"${aHex(muestra(R.rampa, n))}"`);
  }
  if (R.ojo) for (const o of ojos) out = out.split(`"${o.t}"`).join(`"${R.ojo}"`);
  return out;
}
