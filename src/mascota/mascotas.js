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

/*
 * El color de los OJOS, aparte del pelaje. Colores de ojos reales de animales
 * —ámbar, azul, verde…—, para que un gato negro pueda tener ojos azules o un
 * hurón jengibre ojos verdes. «natural» son los ojos oscuros de siempre.
 */
const IRIS = {
  ambar: "#C8820F",
  miel: "#B56A1E",
  azul: "#3E7CC2",
  verde: "#4E9E5C",
  gris: "#8290A0",
};

/** El selector de ojos, en orden. «natural» primero (ojos oscuros). */
export const OJOS_MASCOTA = [
  { id: "natural", nombre: "Oscuros", muestra: "#241d17" },
  { id: "ambar", nombre: "Ámbar", muestra: IRIS.ambar },
  { id: "miel", nombre: "Miel", muestra: IRIS.miel },
  { id: "azul", nombre: "Azules", muestra: IRIS.azul },
  { id: "verde", nombre: "Verdes", muestra: IRIS.verde },
  { id: "gris", nombre: "Grises", muestra: IRIS.gris },
];
export const IDS_OJOS = Object.keys(IRIS);

/** El color del iris: el elegido, o el oscuro de siempre con «natural»/vacío. */
export function irisDe(ojos) {
  return ojos && ojos !== "natural" && IRIS[ojos] ? IRIS[ojos] : "#241d17";
}

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
  // PERRO: orejas largas y caídas que cuelgan por los lados, y hocico que sale.
  perro: ({ fur, furDark, belly }) => ({
    orejas: `<path d="M46 40 q-34 -2 -36 42 q-1 26 18 27 q16 1 19 -20 q3 -30 -1 -49 z" fill="${furDark}"/>
             <path d="M94 40 q34 -2 36 42 q1 26 -18 27 q-16 1 -19 -20 q-3 -30 1 -49 z" fill="${furDark}"/>
             <path d="M46 54 q-20 0 -22 32 q-1 15 11 16 q9 0 11 -13 q3 -21 0 -35 z" fill="${fur}" opacity=".4"/>
             <path d="M94 54 q20 0 22 32 q1 15 -11 16 q-9 0 -11 -13 q-3 -21 0 -35 z" fill="${fur}" opacity=".4"/>`,
    hocico: `<ellipse cx="70" cy="84" rx="19" ry="15" fill="${belly}"/>`,
    nariz: `<ellipse cx="70" cy="74" rx="6.6" ry="4.8" fill="#2a2018"/>`,
    boca: `<path d="M70 79 v6 M70 85 q-7 5 -13 1 M70 85 q7 5 13 1" fill="none" stroke="#6b4e34" stroke-width="2" stroke-linecap="round"/>`,
  }),
  // GATO: orejas grandes y bien puntiagudas, bigotes largos, nariz y boca de gato.
  gato: ({ fur, furDark }) => ({
    // orejas grandes con la PUNTA DOBLADA hacia afuera (la solapa, más oscura).
    orejas: `<path d="M41 47 L30 15 L64 37 z" fill="${fur}"/><path d="M45 43 L37 25 L56 35 z" fill="#E89BB0"/>
             <path d="M30 15 Q23 13 21 23 L40 26 z" fill="${furDark}"/>
             <path d="M99 47 L110 15 L76 37 z" fill="${fur}"/><path d="M95 43 L103 25 L84 35 z" fill="#E89BB0"/>
             <path d="M110 15 Q117 13 119 23 L100 26 z" fill="${furDark}"/>`,
    cara: `<line x1="8" y1="72" x2="42" y2="75" stroke="rgba(255,255,255,.6)" stroke-width="1.7"/><line x1="8" y1="82" x2="42" y2="80" stroke="rgba(255,255,255,.6)" stroke-width="1.7"/>
           <line x1="132" y1="72" x2="98" y2="75" stroke="rgba(255,255,255,.6)" stroke-width="1.7"/><line x1="132" y1="82" x2="98" y2="80" stroke="rgba(255,255,255,.6)" stroke-width="1.7"/>`,
    nariz: `<path d="M64 70 h12 l-6 6 z" fill="#E89BB0"/>`,
    boca: `<path d="M70 76 v4 M70 80 q-6 5 -11 1 M70 80 q6 5 11 1" fill="none" stroke="#9a7b63" stroke-width="1.8" stroke-linecap="round"/>`,
  }),
  // HÁMSTER: abazones ENORMES que ensanchan la cara, orejitas pequeñas y altas,
  // hocico chiquito con dos dientes. El rasgo que lo hace hámster son los cachetes.
  hamster: ({ fur, furDark, belly }) => ({
    orejas: `<circle cx="50" cy="32" r="10" fill="${furDark}"/><circle cx="50" cy="33" r="5" fill="#E89BB0"/>
             <circle cx="90" cy="32" r="10" fill="${furDark}"/><circle cx="90" cy="33" r="5" fill="#E89BB0"/>`,
    frente: `<ellipse cx="38" cy="82" rx="18" ry="16" fill="${fur}"/><ellipse cx="102" cy="82" rx="18" ry="16" fill="${fur}"/>`,
    hocico: `<ellipse cx="70" cy="84" rx="12" ry="9.5" fill="${belly}"/>
             <rect x="66.8" y="86" width="2.6" height="5.5" rx="1" fill="#fff"/><rect x="70.6" y="86" width="2.6" height="5.5" rx="1" fill="#fff"/>`,
    nariz: `<ellipse cx="70" cy="79" rx="4" ry="3" fill="#c76b74"/>`,
    // cachetes de verdad: dos bolas sonrosadas, redondas y marcadas, sobre las mejillas.
    cachetes: `<circle cx="42" cy="80" r="9" fill="rgba(233,120,128,.6)"/><circle cx="98" cy="80" r="9" fill="rgba(233,120,128,.6)"/>`,
  }),
  // HURÓN: hocico claro abajo y máscara oscura SUAVE rodeando cada ojo (como de
  // verdad), no una banda recta. Orejas pequeñas y redondas a los lados.
  huron: ({ furDark, belly }) => ({
    orejas: `<circle cx="48" cy="42" r="8.5" fill="${furDark}"/><circle cx="48" cy="42" r="4" fill="${belly}"/>
             <circle cx="92" cy="42" r="8.5" fill="${furDark}"/><circle cx="92" cy="42" r="4" fill="${belly}"/>`,
    // hocico claro: la parte baja de la cara, redondeada.
    frente: `<ellipse cx="70" cy="82" rx="23" ry="19" fill="${belly}" opacity=".8"/>`,
    // máscara: dos manchas oscuras alrededor de los ojos, unidas por un puente fino.
    cara: `<ellipse cx="56" cy="62" rx="13" ry="13" fill="#4f4536" opacity=".6"/><ellipse cx="84" cy="62" rx="13" ry="13" fill="#4f4536" opacity=".6"/><path d="M64 60 q6 -5 12 0 q-6 4 -12 0 z" fill="#4f4536" opacity=".6"/>`,
    nariz: `<ellipse cx="70" cy="78" rx="4.8" ry="3.4" fill="#c98f86"/>`,
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
  const { puestos = [], paleta = null, ojos = null } = opts;
  const col = colorDe(especie, paleta);
  const iris = irisDe(ojos);
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
    ${partes.frente || ""}
    ${partes.cara || ""}
    ${partes.hocico || `<ellipse cx="70" cy="78" rx="19" ry="14" fill="${col.belly}"/>`}
    ${partes.cachetes || `<ellipse cx="46" cy="78" rx="9.5" ry="6.8" fill="rgba(233,120,128,.5)"/><ellipse cx="94" cy="78" rx="9.5" ry="6.8" fill="rgba(233,120,128,.5)"/>`}
    <g data-ojo><ellipse cx="56" cy="63" rx="6.6" ry="8" fill="${iris}"/><ellipse cx="56" cy="63.5" rx="3.3" ry="5" fill="#130d0a"/><circle cx="58.6" cy="60" r="2.1" fill="#fff"/></g>
    <g data-ojo><ellipse cx="84" cy="63" rx="6.6" ry="8" fill="${iris}"/><ellipse cx="84" cy="63.5" rx="3.3" ry="5" fill="#130d0a"/><circle cx="86.6" cy="60" r="2.1" fill="#fff"/></g>
    ${partes.nariz || `<ellipse cx="70" cy="72" rx="4.6" ry="3.4" fill="#2a2018"/>`}
    ${partes.boca || `<path d="M63 78 q7 6 14 0" fill="none" stroke="#6b4e34" stroke-width="2" stroke-linecap="round"/>`}
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
  const ojos = perfil?.mascota_ojos ?? "natural";
  return { especie, paleta, ojos };
}
