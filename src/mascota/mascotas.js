/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MASCOTAS — la fuente única de verdad del dibujo.
 *
 * Criaturas y accesorios ORIGINALES nuestros, inspirados en el sistema de
 * personalización de Kahoot (personaje tierno + accesorios + color), no
 * copiados: la especie (perro, gato…), el tipo de accesorio (gorro, bufanda…) y
 * la idea de teñirla son libres; el dibujo es de la casa, y por eso es de Planck
 * y se puede registrar.
 *
 * ESPECIES (0160) y PALETAS_MASCOTA (0161) son las mismas listas que los checks
 * de esas migraciones. mascota.test.mjs las lee y comprueba que no se separen.
 *
 * El dibujo se arma sobre una geometría de cara COMPARTIDA (ojos en 57/83,
 * nariz en 70), así que los accesorios caen bien sobre cualquier especie, y el
 * color sale de una paleta de tres tonos (pelo, pelo-sombra, panza) para que
 * teñir a una especie no le rompa las orejas ni la panza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Las cuatro especies, en el orden del selector. El `id` es lo que guarda la base. */
export const ESPECIES = [
  { id: "perro", nombre: "Perro", rasgo: "Leal" },
  { id: "gato", nombre: "Gato", rasgo: "Curioso" },
  { id: "hamster", nombre: "Hámster", rasgo: "Glotón" },
  { id: "huron", nombre: "Hurón", rasgo: "Travieso" },
];
export const IDS_ESPECIE = ESPECIES.map((e) => e.id);
export const NOMBRE_MAX = 16;

/* El color propio de cada especie: lo que se ve con la paleta «natural». */
const NATURAL = {
  perro: { fur: "#D7A468", furDark: "#B47F42", belly: "#F0E2CA" },
  gato: { fur: "#A7AEBB", furDark: "#8E97A6", belly: "#E7EAF0" },
  hamster: { fur: "#E8B86A", furDark: "#D79E4E", belly: "#F7ECD4" },
  huron: { fur: "#EAE1CD", furDark: "#D8CDB2", belly: "#F6F1E4" },
};

/*
 * Las paletas que se eligen, encima de cualquier especie. Son colores de PELAJE
 * REAL —los que de verdad tienen gatos, perros, hurones y hámsters—, no colores
 * de fantasía: nada de un gato morado o un perro azul. Cada uno se ve bien en
 * las cuatro especies. El vientre va un par de tonos más claro, como en el pelo
 * de verdad.
 */
const TINTE = {
  arena: { fur: "#E3CFA6", furDark: "#C7AF82", belly: "#F4EAD6" },
  canela: { fur: "#D59A54", furDark: "#B67D3C", belly: "#EFD9B8" },
  chocolate: { fur: "#7E5436", furDark: "#5F3E27", belly: "#B99B7E" },
  gris: { fur: "#9BA4AE", furDark: "#78808A", belly: "#DCE1E7" },
  negro: { fur: "#45484F", furDark: "#2F3238", belly: "#797E88" },
  jengibre: { fur: "#D97E3E", furDark: "#B9652A", belly: "#F2D2B2" },
};

/** El selector de color, en orden. «natural» primero; su muestra es un tono tierra. */
export const PALETAS_MASCOTA = [
  { id: "natural", nombre: "Natural", muestra: "#D7A468" },
  { id: "arena", nombre: "Arena", muestra: TINTE.arena.fur },
  { id: "canela", nombre: "Canela", muestra: TINTE.canela.fur },
  { id: "chocolate", nombre: "Chocolate", muestra: TINTE.chocolate.fur },
  { id: "gris", nombre: "Gris", muestra: TINTE.gris.fur },
  { id: "negro", nombre: "Negro", muestra: TINTE.negro.fur },
  { id: "jengibre", nombre: "Jengibre", muestra: TINTE.jengibre.fur },
];
export const IDS_PALETA = Object.keys(TINTE);

/** Los tres tonos de una mascota. `natural` (o nada) devuelve el de la especie. */
export function colorDe(especie, paleta) {
  if (paleta && paleta !== "natural" && TINTE[paleta]) return TINTE[paleta];
  return NATURAL[especie] || NATURAL.perro;
}

/* Accesorios genéricos (gorro, gafas…), ubicados sobre la cara compartida. */
export const ACCESORIOS = {
  gafas: `<g><circle cx="57" cy="62" r="9.5" fill="rgba(111,134,255,.16)" stroke="#2f343d" stroke-width="2.6"/><circle cx="83" cy="62" r="9.5" fill="rgba(111,134,255,.16)" stroke="#2f343d" stroke-width="2.6"/><path d="M66.5 61 h7" stroke="#2f343d" stroke-width="2.6" fill="none"/></g>`,
  bigote: `<path d="M57 75 q7 6 13 2.5 q6 3.5 13 -2.5 q-3 8 -13 5.5 q-10 2.5 -13 -5.5 z" fill="#4a3a28"/>`,
  mono: `<g transform="translate(47 33)"><path d="M0 0 L-13 -8 L-13 8 Z" fill="#E8537A"/><path d="M0 0 L13 -8 L13 8 Z" fill="#E8537A"/><circle cx="0" cy="0" r="4.4" fill="#c83e63"/></g>`,
  bufanda: `<g><path d="M39 90 q31 15 62 0 l-3 11 q-28 12 -56 0 z" fill="#E0564A"/><path d="M58 100 l-4 23 q7 3 13 0 l-2 -21 z" fill="#C9463B"/></g>`,
  gorro: `<g><path d="M38 41 q32 -32 64 0 q-32 -11 -64 0 z" fill="#5a71e8"/><path d="M38 41 q32 -29 64 0 l0 4.5 q-32 -9 -64 0 z" fill="#6F86FF"/><circle cx="70" cy="15" r="6.5" fill="#cdd6ff"/></g>`,
};
export const IDS_ACCESORIO = Object.keys(ACCESORIOS);

/*
 * Las partes propias de cada especie, en función del color. Las orejas y las
 * sombras salen del tinte; los rasgos que NO son pelo —el rosa de la oreja del
 * gato, el antifaz del hurón, el hocico— se quedan fijos: son señas de la
 * especie, no color que se tiñe.
 */
const PARTES = {
  perro: ({ fur, furDark }) => ({
    orejas: `<path d="M42 38 q-26 -2 -26 34 q0 20 18 19 q13 -1 15 -19 q2 -22 -7 -34 z" fill="${furDark}"/>
             <path d="M98 38 q26 -2 26 34 q0 20 -18 19 q-13 -1 -15 -19 q-2 -22 7 -34 z" fill="${furDark}"/>
             <path d="M40 46 q-16 0 -16 24 q0 12 11 12 q8 -1 9 -12 q1 -14 -4 -24 z" fill="${fur}" opacity=".5"/>
             <path d="M100 46 q16 0 16 24 q0 12 -11 12 q-8 -1 -9 -12 q-1 -14 4 -24 z" fill="${fur}" opacity=".5"/>`,
  }),
  gato: ({ fur }) => ({
    orejas: `<path d="M40 44 L34 20 L58 38 z" fill="${fur}"/><path d="M42 41 L39 28 L52 37 z" fill="#E89BB0"/>
             <path d="M100 44 L106 20 L82 38 z" fill="${fur}"/><path d="M98 41 L101 28 L88 37 z" fill="#E89BB0"/>`,
    cara: `<line x1="14" y1="72" x2="40" y2="74" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/><line x1="14" y1="80" x2="40" y2="79" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>
           <line x1="126" y1="72" x2="100" y2="74" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/><line x1="126" y1="80" x2="100" y2="79" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>`,
    nariz: `<path d="M66 69 h8 l-4 4 z" fill="#E89BB0"/>`,
  }),
  hamster: ({ fur, furDark, belly }) => ({
    orejas: `<circle cx="44" cy="40" r="11" fill="${furDark}"/><circle cx="44" cy="40" r="5.5" fill="${fur}"/>
             <circle cx="96" cy="40" r="11" fill="${furDark}"/><circle cx="96" cy="40" r="5.5" fill="${fur}"/>`,
    hocico: `<ellipse cx="54" cy="80" rx="12" ry="10" fill="${belly}"/><ellipse cx="86" cy="80" rx="12" ry="10" fill="${belly}"/><ellipse cx="70" cy="78" rx="14" ry="11" fill="${belly}"/>`,
    nariz: `<ellipse cx="70" cy="71" rx="4" ry="3" fill="#c76b74"/>`,
  }),
  huron: ({ furDark }) => ({
    orejas: `<circle cx="46" cy="42" r="9" fill="${furDark}"/><circle cx="94" cy="42" r="9" fill="${furDark}"/>`,
    cara: `<path d="M44 58 q26 -16 52 0 q-4 12 -26 12 q-22 0 -26 -12 z" fill="#6E6150" opacity=".85"/>`,
    nariz: `<ellipse cx="70" cy="70" rx="4.4" ry="3.2" fill="#c98f86"/>`,
  }),
};

/** El azul de Planck, el cuantito de la marca, en el collar. */
const TAG = "#6F86FF";

/**
 * El cuerpo del <svg> de una mascota (sin la etiqueta <svg>). Opciones:
 *   · puestos — ids de ACCESORIOS que lleva encima.
 *   · paleta  — id de PALETAS_MASCOTA; «natural»/vacío deja el color de la especie.
 */
export function cuerpoMascota(especie, opts = {}) {
  const { puestos = [], paleta = null } = opts;
  const col = colorDe(especie, paleta);
  const partes = (PARTES[especie] || PARTES.perro)(col);
  const acc = Array.isArray(puestos) ? puestos.filter((k) => ACCESORIOS[k]) : [];
  const bufandaOn = acc.includes("bufanda");
  const bajo = bufandaOn ? ACCESORIOS.bufanda : "";
  const sobre = acc.filter((k) => k !== "bufanda").map((k) => ACCESORIOS[k]).join("");
  const collar = bufandaOn
    ? ""
    : `<rect x="63" y="99" width="14" height="9" rx="2.5" fill="#2a2e38"/><rect x="67.5" y="101.5" width="4" height="4" fill="${TAG}" transform="rotate(45 69.5 103.5)"/>`;
  return `
    <ellipse cx="70" cy="120" rx="30" ry="24" fill="${col.fur}"/>
    <ellipse cx="70" cy="128" rx="17" ry="13" fill="${col.belly}"/>
    ${bajo}
    ${partes.orejas}
    <circle cx="70" cy="64" r="37" fill="${col.fur}"/>
    ${partes.cara || ""}
    ${partes.hocico || `<ellipse cx="70" cy="76" rx="19" ry="14" fill="${col.belly}"/>`}
    <ellipse cx="48" cy="74" rx="7" ry="5" fill="rgba(233,120,128,.45)"/>
    <ellipse cx="92" cy="74" rx="7" ry="5" fill="rgba(233,120,128,.45)"/>
    <g data-ojo><ellipse cx="57" cy="62" rx="5.2" ry="6.4" fill="#241d17"/><circle cx="59" cy="59.5" r="1.7" fill="#fff"/></g>
    <g data-ojo><ellipse cx="83" cy="62" rx="5.2" ry="6.4" fill="#241d17"/><circle cx="85" cy="59.5" r="1.7" fill="#fff"/></g>
    ${partes.nariz || `<ellipse cx="70" cy="70" rx="4.6" ry="3.4" fill="#2a2018"/>`}
    <path d="M63 76 q7 6 14 0" fill="none" stroke="#6b4e34" stroke-width="2" stroke-linecap="round"/>
    ${collar}
    ${sobre}`;
}

/*
 * La mascota «de fábrica»: el estudiante que aún no eligió igual tiene cara.
 * La especie sale de un hash estable de su identidad (id o apodo), no de un
 * azar que cambie en cada carga: así siempre ve la misma, y dos personas
 * distintas caen casi siempre en especies distintas. Es azar entre las cuatro,
 * pero fijo por persona. No escribe nada en la base: es solo de pintar.
 */
export function especiePorDefecto(semilla) {
  const s = String(semilla ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return IDS_ESPECIE[h % IDS_ESPECIE.length];
}

/**
 * La mascota con la que se pinta a un estudiante: la que eligió si la tiene, y
 * si no, la de fábrica derivada de su identidad. Devuelve {especie, paleta}.
 */
export function mascotaDe(perfil) {
  const elegida = perfil?.mascota_especie;
  const especie = elegida && IDS_ESPECIE.includes(elegida)
    ? elegida
    : especiePorDefecto(perfil?.id ?? perfil?.apodo ?? perfil?.nickname ?? "");
  const paleta = perfil?.mascota_paleta ?? "natural";
  return { especie, paleta };
}
