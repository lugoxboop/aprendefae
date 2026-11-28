/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS COSMÉTICOS DE LAS CAJAS SORPRESA (28-nov).
 *
 * Mateo: «cajas que te pueden sacar cosméticos normales, raros, épicos,
 * legendarios y élite; hay que agregar más cosméticos para que haya variedad».
 *
 * Estos cosméticos NO se venden sueltos: solo salen de las cajas. Son de dos
 * clases, y las dos le quedan bien a los siete animales sin dibujar nada aparte
 * por especie:
 *
 *   1. EDICIONES de las 25 piezas de la tienda —un gorro carmesí, una corona
 *      de oro, unas alas de prisma—. Usan la MISMA pieza y el mismo ajuste por
 *      animal de accesorios-marioneta.js (anclas, siluetas de cabeza, ajustes
 *      a mano por especie), así que caen donde caen las de la tienda en el
 *      perro, el gato, el conejo, el zorro, el hámster, el hurón y el panda.
 *      Lo que cambia es el TINTE: un filtro SVG (feColorMatrix +
 *      feComponentTransfer) que pasa la pieza a escala de gris y la vuelve a
 *      pintar con tres tonos, conservando el trazo y las sombras. Desde Épico
 *      llevan además un brillo del color de la rareza; las Élite, movimiento
 *      (el prisma cambia de color, el eclipse late).
 *   2. AURAS: un halo detrás de la mascota (chispas, burbujas, copos, fuego,
 *      estrellas, prisma). Se dibujan en SVG sobre el escenario de cada
 *      especie, centradas en su cuerpo. Ranura propia: una a la vez.
 *
 * El catálogo vive aquí y EN SQL (0178, caja_abrir): cajas.test.mjs lee la
 * migración y falla si los dos lados se separan. Un cosmético se guarda en
 * profiles.mascota_accesorios como cualquier accesorio, y se pone y se quita
 * con la misma mascota_accesorio_equipar (0165), que solo pide que sea suyo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cinco rarezas, de la más común a la más rara. El color es la seña de
   cada una en toda la pantalla: borde, brillo, franja de la ruleta. */
export const RAREZAS_CAJA = [
  { id: "normal", nombre: "Normal", rgb: "159,179,200" },
  { id: "raro", nombre: "Raro", rgb: "79,156,255" },
  { id: "epico", nombre: "Épico", rgb: "181,108,255" },
  { id: "legendario", nombre: "Legendario", rgb: "255,190,60" },
  { id: "elite", nombre: "Élite", rgb: "255,77,120" },
];
export const RAREZA = Object.fromEntries(RAREZAS_CAJA.map((r, i) => [r.id, { ...r, orden: i }]));

/*
 * Los tintes: [oscuro, medio, claro] — a dónde va el negro, el gris medio y el
 * blanco de la pieza. `brillo`: color del resplandor (desde Épico). `anima`:
 * «prisma» gira el tono, «late» hace latir el brillo.
 */
export const TINTES = {
  carmesi: { tonos: ["#3a0612", "#d8384a", "#ffc2c2"] },
  menta: { tonos: ["#0c3a30", "#3fbf98", "#d8fff0"] },
  cielo: { tonos: ["#0a2a4a", "#3e8fe0", "#d6ecff"] },
  lavanda: { tonos: ["#2a1848", "#9a78e0", "#efe6ff"] },
  limon: { tonos: ["#3e3200", "#e8c51a", "#fffbd0"] },
  chicle: { tonos: ["#4a0c30", "#f064a8", "#ffe0f0"] },
  carbon: { tonos: ["#08090d", "#3d4352", "#b9c0cf"] },
  naranja: { tonos: ["#401800", "#f07a1e", "#ffe2c4"] },
  bosque: { tonos: ["#0c2a0c", "#3f9a3a", "#d4f5c8"] },
  plata: { tonos: ["#262c38", "#9aa6b8", "#ffffff"], brillo: "#dfe8ff" },
  galaxia: { tonos: ["#0e0830", "#6a48d8", "#e2d6ff"], brillo: "#9b7bff" },
  hielo: { tonos: ["#06304a", "#56c2e8", "#f0fdff"], brillo: "#8ee8ff" },
  oro: { tonos: ["#4a2c00", "#e0a52a", "#fff4c2"], brillo: "#ffd35a" },
  lava: { tonos: ["#3a0400", "#ee4a10", "#ffe08a"], brillo: "#ff7a1a" },
  esmeralda: { tonos: ["#002a1a", "#18b878", "#d0ffe8"], brillo: "#4dffb0" },
  rubi: { tonos: ["#40000c", "#e0183e", "#ffd0da"], brillo: "#ff4d70" },
  prisma: { tonos: ["#4a0030", "#ff3d9a", "#ffe0f4"], brillo: "#ffffff", anima: "prisma" },
  eclipse: { tonos: ["#04020c", "#3a2a8a", "#b9aaff"], brillo: "#7b5cff", anima: "late" },
};

/* Los nombres de los tintes, para armar el nombre del cosmético. */
const DE = {
  carmesi: "carmesí", menta: "menta", cielo: "cielo", lavanda: "lavanda", limon: "limón",
  chicle: "chicle", carbon: "carbón", naranja: "mandarina", bosque: "bosque", plata: "de plata",
  galaxia: "galaxia", hielo: "de hielo", oro: "de oro", lava: "de lava", esmeralda: "esmeralda",
  rubi: "rubí", prisma: "prisma", eclipse: "eclipse",
};

/*
 * El catálogo: [id, pieza base de la tienda (o «aura»), tinte o dibujo, rareza, nombre].
 * El id es «c_<base>_<tinte>» o «aura_<dibujo>». Se ordena por rareza.
 */
const LISTA = [
  /* ── Normal (14): colores nuevos de lo de todos los días ── */
  ["c_gorro_carmesi", "gorro", "carmesi", "normal", "Gorro carmesí"],
  ["c_gorro_menta", "gorro", "menta", "normal", "Gorro menta"],
  ["c_gorra_cielo", "gorra", "cielo", "normal", "Gorra cielo"],
  ["c_gorra_limon", "gorra", "limon", "normal", "Gorra limón"],
  ["c_mono_lavanda", "mono", "lavanda", "normal", "Moño lavanda"],
  ["c_mono_cielo", "mono", "cielo", "normal", "Moño cielo"],
  ["c_bufanda_menta", "bufanda", "menta", "normal", "Bufanda menta"],
  ["c_bufanda_chicle", "bufanda", "chicle", "normal", "Bufanda chicle"],
  ["c_gafas_chicle", "gafas", "chicle", "normal", "Gafas chicle"],
  ["c_collar_lavanda", "collar", "lavanda", "normal", "Collar lavanda"],
  ["c_corbatin_carmesi", "corbatin", "carmesi", "normal", "Corbatín carmesí"],
  ["c_corbata_bosque", "corbata", "bosque", "normal", "Corbata bosque"],
  ["c_mochila_naranja", "mochila", "naranja", "normal", "Mochila mandarina"],
  ["c_gafas_sol_cielo", "gafas_sol", "cielo", "normal", "Gafas de sol cielo"],
  /* ── Raro (12) ── */
  ["c_vaquero_carbon", "vaquero", "carbon", "raro", "Vaquero carbón"],
  ["c_pirata_carmesi", "pirata", "carmesi", "raro", "Pirata carmesí"],
  ["c_audifonos_chicle", "audifonos", "chicle", "raro", "Audífonos chicle"],
  ["c_audifonos_menta", "audifonos", "menta", "raro", "Audífonos menta"],
  ["c_antifaz_carbon", "antifaz", "carbon", "raro", "Antifaz carbón"],
  ["c_gafas_sol_naranja", "gafas_sol", "naranja", "raro", "Gafas de sol mandarina"],
  ["c_parche_lavanda", "parche", "lavanda", "raro", "Parche lavanda"],
  ["c_traje_cielo", "traje", "cielo", "raro", "Traje cielo"],
  ["c_capa_bosque", "capa", "bosque", "raro", "Capa bosque"],
  ["c_capa_lavanda", "capa", "lavanda", "raro", "Capa lavanda"],
  ["c_mochila_carbon", "mochila", "carbon", "raro", "Mochila carbón"],
  ["aura_chispas", "aura", "chispas", "raro", "Aura de chispas"],
  /* ── Épico (10): con brillo ── */
  ["c_mago_galaxia", "mago", "galaxia", "epico", "Sombrero galaxia"],
  ["c_casco_hielo", "casco", "hielo", "epico", "Casco de hielo"],
  ["c_birrete_plata", "birrete", "plata", "epico", "Birrete de plata"],
  ["c_corona_plata", "corona", "plata", "epico", "Corona de plata"],
  ["c_alas_hielo", "alas", "hielo", "epico", "Alas de hielo"],
  ["c_capa_galaxia", "capa", "galaxia", "epico", "Capa galaxia"],
  ["c_jetpack_plata", "jetpack", "plata", "epico", "Jetpack de plata"],
  ["c_gafas_sol_galaxia", "gafas_sol", "galaxia", "epico", "Gafas galaxia"],
  ["aura_burbujas", "aura", "burbujas", "epico", "Aura de burbujas"],
  ["aura_copos", "aura", "copos", "epico", "Aura de nieve"],
  /* ── Legendario (8) ── */
  ["c_corona_oro", "corona", "oro", "legendario", "Corona de oro"],
  ["c_alas_oro", "alas", "oro", "legendario", "Alas de oro"],
  ["c_capa_rubi", "capa", "rubi", "legendario", "Capa rubí"],
  ["c_jetpack_lava", "jetpack", "lava", "legendario", "Jetpack de lava"],
  ["c_casco_esmeralda", "casco", "esmeralda", "legendario", "Casco esmeralda"],
  ["c_vaquero_oro", "vaquero", "oro", "legendario", "Vaquero de oro"],
  ["aura_fuego", "aura", "fuego", "legendario", "Aura de fuego"],
  ["aura_estrellas", "aura", "estrellas", "legendario", "Aura de estrellas"],
  /* ── Élite (5): con movimiento ── */
  ["c_corona_prisma", "corona", "prisma", "elite", "Corona prisma"],
  ["c_alas_prisma", "alas", "prisma", "elite", "Alas prisma"],
  ["c_capa_eclipse", "capa", "eclipse", "elite", "Capa eclipse"],
  ["c_mago_eclipse", "mago", "eclipse", "elite", "Sombrero eclipse"],
  ["aura_prisma", "aura", "prisma", "elite", "Aura prisma"],
];

/* La zona de la tienda de cada pieza base (para el «Mi avatar» y las cartas). */
const ZONA_BASE = {
  gorro: "cabeza", gorra: "cabeza", corona: "cabeza", mono: "cabeza", audifonos: "cabeza", vaquero: "cabeza",
  pirata: "cabeza", birrete: "cabeza", mago: "cabeza", casco: "cabeza",
  gafas: "cara", gafas_sol: "cara", bigote: "cara", parche: "cara", antifaz: "cara",
  bufanda: "cuello", collar: "cuello", corbatin: "cuello", corbata: "cuello", medalla: "cuello", traje: "cuello",
  mochila: "espalda", capa: "espalda", alas: "espalda", jetpack: "espalda", aura: "aura",
};

export const COSMETICOS_CAJA = LISTA.map(([id, base, tinte, rareza, nombre]) => ({
  id, base, tinte, rareza, nombre, zona: ZONA_BASE[base], esAura: base === "aura",
}));
export const COSMETICO = Object.fromEntries(COSMETICOS_CAJA.map((c) => [c.id, c]));
export const esCosmeticoCaja = (k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(COSMETICO, k);
/** La pieza de la tienda sobre la que se pinta (o el mismo id si es de la tienda). */
export const baseDe = (k) => COSMETICO[k]?.base ?? k;
export const cosmeticosDeRareza = (r) => COSMETICOS_CAJA.filter((c) => c.rareza === r);
export { DE as NOMBRE_TINTE };

/* ─────────────── el filtro de un tinte ─────────────── */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const r3 = (v) => +v.toFixed(3);

/* ¿Se mueve? Con «menos movimiento» los Élite se quedan quietos (y con su brillo). */
const sinMovimiento = () => {
  try { return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; } catch { return false; }
};

export const idFiltroTinte = (tinte, uid = "") => `mta-cos-${tinte}${uid ? `-${uid}` : ""}`;

/**
 * El <filter> de un tinte. La pieza pasa a gris (luminancia), cada canal se
 * reparte en los tres tonos con una tabla, y desde Épico se le suma un
 * resplandor del color del brillo por fuera del borde.
 */
export function filtroTinte(tinte, uid = "") {
  const T = TINTES[tinte];
  if (!T) return "";
  const [a, b, c] = T.tonos.map(hex);
  const tabla = (i) => `${r3(a[i])} ${r3(b[i])} ${r3(c[i])}`;
  const mover = !sinMovimiento();
  const gris = `<feColorMatrix in="SourceGraphic" type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0" result="g"/>`;
  const tono = `<feComponentTransfer in="g" result="t"><feFuncR type="table" tableValues="${tabla(0)}"/><feFuncG type="table" tableValues="${tabla(1)}"/><feFuncB type="table" tableValues="${tabla(2)}"/></feComponentTransfer>`;
  const gira = T.anima === "prisma"
    ? `<feColorMatrix in="t" type="hueRotate" values="0" result="t">${mover ? `<animate attributeName="values" from="0" to="360" dur="3.2s" repeatCount="indefinite"/>` : ""}</feColorMatrix>`
    : "";
  let brillo = "";
  if (T.brillo) {
    const late = T.anima === "late" && mover ? `<animate attributeName="flood-opacity" values=".35;.95;.35" dur="1.8s" repeatCount="indefinite"/>` : "";
    brillo =
      `<feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/>` +
      `<feGaussianBlur in="d" stdDeviation="6" result="b"/>` +
      `<feFlood flood-color="${T.brillo}" flood-opacity="${T.anima === "late" ? ".7" : ".75"}">${late}</feFlood>` +
      `<feComposite in2="b" operator="in" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="t"/></feMerge>`;
  }
  return `<filter id="${idFiltroTinte(tinte, uid)}" color-interpolation-filters="sRGB" x="-30%" y="-30%" width="160%" height="160%">${gris}${tono}${gira}${brillo}</filter>`;
}

/* ─────────────── las auras ─────────────── */

/*
 * Un aura, en px del escenario de la especie: centrada en el cuerpo
 * [cx, cy] y con su radio [rx, ry]. Cada dibujo trae sus partículas; el
 * movimiento lo pone marioneta-estilo.js (.mta-aura-*), que se apaga con
 * «menos movimiento» y en las listas (.mta-quieta).
 */
export function svgAura(dibujo, [cx, cy], [rx, ry]) {
  const R = (v) => +v.toFixed(1);
  const enAnillo = (n, k = 1, fase = 0) => Array.from({ length: n }, (_, i) => {
    const t = fase + (i / n) * Math.PI * 2;
    return [R(cx + Math.cos(t) * rx * k), R(cy + Math.sin(t) * ry * k)];
  });
  const halo = (c1, c2, op = 0.55) =>
    `<ellipse cx="${R(cx)}" cy="${R(cy)}" rx="${R(rx)}" ry="${R(ry)}" fill="url(#mta-au-${dibujo})" opacity="${op}"/>` +
    `<radialGradient id="mta-au-${dibujo}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c1}" stop-opacity=".0"/><stop offset=".55" stop-color="${c1}" stop-opacity=".35"/><stop offset=".85" stop-color="${c2}" stop-opacity=".55"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>`;
  const destello = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -14 Q2 -2 14 0 Q2 2 0 14 Q-2 2 -14 0 Q-2 -2 0 -14 Z" fill="${c}"/>`;
  const estrella = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="${c}" stroke="#7a4a00" stroke-width="2" stroke-linejoin="round"/>`;
  const copo = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#e8fbff" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7"/><path d="M-4 -10 L0 -6 L4 -10 M-4 10 L0 6 L4 10"/></g>`;
  const p = (cls, i, dentro) => `<g class="mta-au-p ${cls}" style="animation-delay:${(-i * 0.37).toFixed(2)}s">${dentro}</g>`;
  let dentro = "";
  if (dibujo === "chispas") {
    dentro = halo("#7fc4ff", "#4f9cff", 0.4) +
      enAnillo(9, 0.92, 0.3).map(([x, y], i) => p("mta-au-titila", i, destello(x, y, 0.9 + (i % 3) * 0.35, i % 2 ? "#ffffff" : "#bfe2ff"))).join("");
  } else if (dibujo === "burbujas") {
    dentro = halo("#c79bff", "#b56cff", 0.4) +
      enAnillo(10, 0.95, 0.15).map(([x, y], i) => p("mta-au-sube", i,
        `<circle cx="${x}" cy="${y}" r="${8 + (i % 4) * 4}" fill="rgba(230,210,255,.18)" stroke="#e8d6ff" stroke-width="3"/><circle cx="${R(x - 3)}" cy="${R(y - 3)}" r="2.6" fill="#fff"/>`)).join("");
  } else if (dibujo === "copos") {
    dentro = halo("#b9f0ff", "#56c2e8", 0.4) +
      enAnillo(9, 0.95, 0.5).map(([x, y], i) => p("mta-au-cae", i, copo(x, y, 0.8 + (i % 3) * 0.3))).join("");
  } else if (dibujo === "fuego") {
    dentro = halo("#ffb347", "#ff5a00", 0.7) +
      enAnillo(8, 0.9, 0.2).filter(([, y]) => y > cy - ry * 0.6).map(([x, y], i) => p("mta-au-llama", i,
        `<path transform="translate(${x} ${y}) scale(${1.1 + (i % 3) * 0.3})" d="M0 -26 C10 -14 14 -4 10 6 C7 14 -7 14 -10 6 C-14 -4 -6 -10 -4 -18 C-2 -10 2 -8 0 -26 Z" fill="#ff8a1a"/><path transform="translate(${x} ${R(y + 4)}) scale(${0.6 + (i % 3) * 0.2})" d="M0 -20 C8 -10 10 -2 6 6 C3 11 -3 11 -6 6 C-9 -2 -4 -8 0 -20 Z" fill="#ffe07a"/>`)).join("");
  } else if (dibujo === "estrellas") {
    dentro = halo("#ffe08a", "#ffbe3c", 0.5) +
      enAnillo(8, 0.95, 0.2).map(([x, y], i) => p("mta-au-titila", i, estrella(x, y, 0.8 + (i % 2) * 0.35, i % 2 ? "#ffd35a" : "#fff1b0"))).join("");
  } else if (dibujo === "prisma") {
    const colores = ["#ff4d78", "#ffb13d", "#ffe94d", "#4dff9a", "#4dc9ff", "#8a6bff", "#ff6be0"];
    dentro =
      `<radialGradient id="mta-au-prisma" cx="50%" cy="50%" r="50%"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#ffd6f0" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<ellipse cx="${R(cx)}" cy="${R(cy)}" rx="${R(rx)}" ry="${R(ry)}" fill="url(#mta-au-prisma)"/>` +
      enAnillo(14, 0.93).map(([x, y], i) => p("mta-au-titila", i * 0.5, `<circle cx="${x}" cy="${y}" r="${7 + (i % 3) * 3}" fill="${colores[i % colores.length]}" opacity=".9"/>`)).join("") +
      enAnillo(6, 0.7, 0.5).map(([x, y], i) => p("mta-au-titila", i, destello(x, y, 1.2, "#ffffff"))).join("");
  }
  /* El halo va detrás de la mascota; las partículas, delante (si fueran
     detrás, el cuerpo las taparía casi todas). */
  const corte = dentro.indexOf('<g class="mta-au-p');
  const atras = corte < 0 ? dentro : dentro.slice(0, corte);
  const frente = corte < 0 ? "" : dentro.slice(corte);
  return {
    atras: `<g class="mta-aura-cos mta-aura-${dibujo}">${atras}</g>`,
    frente: frente ? `<g class="mta-aura-cos mta-aura-${dibujo}-frente">${frente}</g>` : "",
  };
}
