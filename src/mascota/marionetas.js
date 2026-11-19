/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MARIONETAS — las mascotas ilustradas, despiezadas y con ánimo.
 *
 * Cada especie es un kit de piezas sueltas dibujado en Gemini (torso, cabeza,
 * orejas, cola, brazos, piernas, ojos y bocas por ánimo). Aquí se dice DÓNDE va
 * cada pieza; el movimiento lo pone marioneta.css. Como las piezas son sueltas,
 * la mascota parpadea, mueve la cola, salta o baja las orejas sin redibujarse.
 *
 * Coordenadas: px del kit, sobre un escenario de 640 × 770 (x de -20 a 620,
 * y de -65 a 705); al pintar, el recuadro se ajusta a cada mascota.
 * El suelo está en y = 684 y el centro en x = 300. Cada pieza es
 * [nombre, x, y] o [nombre, x, y, { espejo, escala, giro }]. La cabeza tiene su propio
 * marco (traslado y escala) y la cara se ubica sobre la cabeza.
 *
 * El color: las piezas teñibles se guardan dos veces, el pelaje en grises (_p)
 * y lo fijo (_f). El pelaje pasa por un filtro feComponentTransfer que cambia
 * cada gris por su tono en la rampa de la paleta (sombra → pelo → panza). Con
 * «natural» se pinta la pieza original, sin filtro: el arte tal cual.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { PIEZAS } from "./marionetas-piezas.js";
import { piezasAccesorios, orejasTapadas } from "./accesorios-marioneta.js";

export const ANIMOS = ["tranquila", "feliz", "celebra", "triste", "racha"];

/*
 * LOS FESTEJOS: cómo celebra la mascota al terminar una actividad. Todos con
 * la cara feliz; cambia el movimiento y lo que flota alrededor (corazones,
 * notas, estrellas, confeti). «celebra» es la voltereta de siempre.
 *   colita    menea la cola y el cuerpo, con corazones
 *   baila     baila de lado a lado, brazo arriba y brazo abajo, con notas
 *   canta     se mece con la cabeza en alto y el brazo abierto, con notas
 *   saltitos  saltitos rápidos de emoción, con estrellas
 *   saluda    saluda con la patita y da un brinco, con corazones
 *   celebra   voltereta en el aire, con confeti y estrellas
 */
export const FESTEJOS = ["colita", "baila", "canta", "saltitos", "saluda", "celebra"];

/* Todo lo que se puede pedir como `animo` a <Mascota>. */
export const MOVIMIENTOS = [...ANIMOS, ...FESTEJOS.filter((f) => !ANIMOS.includes(f))];

/* Dónde va cada pieza, por especie. */
export const MARIONETAS = {
  zorro: {
    cola: ["cola", 360, 392],
    piernas: [["pierna", 178, 520], ["pierna", 318, 520, { espejo: true }]],
    brazos: [["brazo_d", 168, 385, { giro: -6 }], ["brazo_i", 322, 385, { giro: 6 }]],
    brazosDelante: true,
    torso: ["torso", 166, 300],
    cabeza: {
      en: [109, 52, 1.35],
      orejas: [["oreja_i", 10, -82], ["oreja_d", 140, -82]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [["ojo_i", 44, 84], ["ojo_d", 167, 84]], resto: [["boca_sonrisa", 101, 150]] },
      feliz: [["feliz_i", 46, 104], ["feliz_d", 170, 104], ["boca_abierta", 94, 146]],
      triste: [["triste_i", 42, 72], ["triste_d", 166, 71], ["boca_triste", 111, 186]],
      racha: [["racha_i", 50, 86], ["racha_d", 173, 86], ["boca_sonrisa", 101, 150]],
      lagrima: [56, 146],
    },
  },
  gato: {
    cola: ["cola", 350, 420],
    piernas: [["pierna_i", 195, 525], ["pierna_d", 327, 525]],
    brazos: [["brazo", 166, 385, { espejo: true }], ["brazo", 352, 385]],
    torso: ["torso", 178, 360],
    cabeza: {
      en: [118, 110, 1.35],
      orejas: [["oreja_i", 20, -75], ["oreja_d", 140, -75]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [["ojo_i", 45, 90], ["ojo_d", 150, 90]], resto: [["boca_sonrisa", 96, 140]] },
      feliz: [["feliz_i", 48, 100], ["feliz_d", 155, 100], ["boca_feliz", 96, 140]],
      triste: [["triste_i", 42, 75], ["triste_d", 152, 75], ["boca_triste", 102, 140]],
      racha: [["racha_i", 45, 85], ["racha_d", 152, 85], ["boca_sonrisa", 96, 140]],
      lagrima: [190, 150],
    },
  },
  perro: {
    cola: ["cola", 380, 470],
    brazos: [["brazo_d", 178, 450, { giro: -8 }], ["brazo_i", 326, 450, { giro: 8 }]],
    brazosDelante: true,
    torso: ["torso", 164, 400],
    cabeza: {
      en: [123, 125, 1.35],
      orejas: [["oreja_i", -55, 10], ["oreja_d", 195, 10]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [["ojo_i", 42, 80], ["ojo_d", 147, 80]], resto: [["boca_sonrisa", 84, 175]] },
      feliz: [["feliz", 45, 95], ["feliz", 150, 95, { espejo: true }], ["boca_abierta", 88, 168]],
      triste: [["triste_i", 45, 60], ["triste_d", 148, 60], ["boca_triste", 105, 182]],
      racha: [["racha_i", 48, 78], ["racha_d", 150, 78], ["boca_racha", 84, 175]],
      lagrima: [70, 140],
    },
  },
  hamster: {
    cola: ["cola", 380, 560],
    piernas: [["pierna_i", 195, 520], ["pierna_d", 325, 520]],
    brazos: [["brazo_d", 190, 480, { giro: -8 }], ["brazo_i", 343, 480, { giro: 8 }]],
    brazosDelante: true,
    torso: ["torso", 186, 440],
    cabeza: {
      en: [106, 200, 1.35],
      orejas: [["oreja_i", 30, -15], ["oreja_d", 175, -15]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [["ojo_i", 62, 68], ["ojo_d", 160, 68]], resto: [] },
      feliz: [["feliz_i", 62, 85], ["feliz_d", 160, 85], ["boca_abierta", 97, 122]],
      triste: [["triste_i", 58, 60], ["triste_d", 157, 60], ["boca_triste", 102, 122]],
      racha: [["racha", 64, 75], ["boca_sonrisa", 98, 122]],
      lagrima: [75, 125],
    },
  },
  conejo: {
    cola: ["cola", 340, 580],
    brazos: [["brazo_d", 190, 515], ["brazo_i", 340, 515]],
    torso: ["torso", 215, 490],
    cabeza: {
      en: [147, 250, 1.35],
      orejas: [["oreja_i", 40, -150], ["oreja_d", 100, -150]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [["ojo_i", 35, 60], ["ojo_d", 125, 60]], resto: [["boca_sonrisa", 64, 104]] },
      feliz: [["feliz_i", 37, 75], ["feliz_d", 122, 75], ["boca_abierta", 60, 104]],
      triste: [["triste_i", 38, 40], ["triste_d", 124, 58], ["boca_triste", 65, 140]],
      racha: [["racha_i", 30, 58], ["racha_d", 118, 58], ["boca_sonrisa", 64, 104]],
      lagrima: [140, 110],
    },
  },
  huron: {
    cola: ["cola", 330, 520, { escala: 0.65 }],
    piernas: [["pierna_i", 198, 550], ["pierna_d", 308, 550]],
    brazos: [["brazo_i", 205, 455, { espejo: true, giro: -10 }], ["brazo_i", 316, 455, { giro: 10 }]],
    brazosDelante: true,
    torso: ["torso", 207, 385],
    cabeza: {
      en: [163, 190, 1.35],
      orejas: [["oreja_i", 0, -10], ["oreja_d", 132, -10]],
      base: ["cabeza", 0, 0],
      tranquila: { ojos: [], resto: [["cara_tranquila", 11, 50], ["boca_tranquila", 58, 118]] },
      feliz: [["cara_feliz", 8, 50]],
      triste: [["cara_triste", 5, 50]],
      racha: [["cara_racha", 5, 50], ["boca_tranquila", 58, 118]],
      lagrima: [40, 110],
    },
  },
};

const BASE = "/mascotas";
const url = (esp, n, suf = "") => `${BASE}/${esp}/${n}${suf}.webp`;

/* ── Color ─────────────────────────────────────────────────────────────── */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const mezcla = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);

/*
 * Las tres tablas (R, G, B) del filtro: para cada gris L de 0 a 1, su color.
 * Los puntos de la rampa salen de la especie (dónde cae su sombra, su pelo y su
 * panza) y los colores, de la paleta.
 */
export function tablasPelaje(especie, tinte) {
  const r = PIEZAS[especie]?.rampa || [0.32, 0.46, 0.58, 0.9];
  const fur = hex(tinte.fur), dark = hex(tinte.furDark), belly = hex(tinte.belly);
  const deep = mezcla(dark, [0.08, 0.05, 0.04], 0.42);
  const paradas = [
    [0, [0.05, 0.03, 0.02]],
    [r[0] * 0.7, mezcla(deep, [0, 0, 0], 0.3)],
    [r[0], deep],
    [r[1], dark],
    [r[2], fur],
    [Math.min(r[3], 0.999), belly],
    [1, mezcla(belly, [1, 1, 1], 0.5)],
  ];
  const N = 48, t = [[], [], []];
  for (let i = 0; i < N; i++) {
    const L = i / (N - 1);
    let k = 0;
    while (k < paradas.length - 2 && L > paradas[k + 1][0]) k++;
    const [l0, c0] = paradas[k], [l1, c1] = paradas[k + 1];
    const c = mezcla(c0, c1, Math.min(1, Math.max(0, (L - l0) / (l1 - l0 || 1))));
    for (let j = 0; j < 3; j++) t[j].push(+c[j].toFixed(3));
  }
  return t.map((x) => x.join(" "));
}

/* ── Dibujo ────────────────────────────────────────────────────────────── */
export const tieneMarioneta = (especie) => Boolean(MARIONETAS[especie] && PIEZAS[especie]);

/**
 * El SVG interior de una marioneta.
 *   especie  — id de ESPECIES
 *   tinte    — {fur, furDark, belly} o null para «natural» (el arte original)
 *   uid      — sufijo único del filtro (varias mascotas en una pantalla)
 *   busto    — true encuadra cabeza y hombros: para tamaños chicos (filas del
 *              ranking, amigos), donde el cuerpo entero deja la cara diminuta.
 *   puestos  — ids de accesorios (accesorios-marioneta.js) que lleva encima.
 * Devuelve { viewBox, inner }. El ánimo NO va aquí: es una clase en el <svg>
 * (mta-<animo>), así cambiar de ánimo no vuelve a pintar nada.
 */
export function svgMarioneta(especie, { tinte = null, uid = "m", busto = false, puestos = [] } = {}) {
  const M = MARIONETAS[especie];
  const P = PIEZAS[especie];
  if (!M || !P) return null;
  const fid = `mta-pel-${uid}`;

  const img = (n, x, y, o = {}) => {
    const d = P.piezas[n];
    if (!d) return "";
    const s = o.escala || 1;
    const w = d[0] * s, h = d[1] * s;
    const capas = tinte && d[2]
      ? `<image href="${url(especie, n, "_p")}" width="${w}" height="${h}" filter="url(#${fid})"/><image href="${url(especie, n, "_f")}" width="${w}" height="${h}"/>`
      : `<image href="${url(especie, n)}" width="${w}" height="${h}"/>`;
    /* `giro`: la pieza girada en su sitio, sobre su borde de arriba (el hombro). */
    const giro = o.giro ? ` rotate(${o.giro} ${w / 2} ${h * 0.08})` : "";
    const tr = (o.espejo ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`) + giro;
    return `<g transform="${tr}">${capas}</g>`;
  };
  const pieza = (p) => (p ? img(p[0], p[1], p[2], p[3]) : "");
  const grupo = (cls, contenido) => `<g class="${cls}">${contenido}</g>`;

  const C = M.cabeza;
  const [hx, hy, hs] = C.en;
  const caraDe = (lista) => lista.map(pieza).join("");

  let defs = "";
  if (tinte) {
    const [tr, tg, tb] = tablasPelaje(especie, tinte);
    defs += `<filter id="${fid}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feComponentTransfer><feFuncR type="table" tableValues="${tr}"/><feFuncG type="table" tableValues="${tg}"/><feFuncB type="table" tableValues="${tb}"/></feComponentTransfer></filter>`;
  }
  defs += `<radialGradient id="mta-aura-${uid}" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#ffb347" stop-opacity=".85"/><stop offset=".55" stop-color="#ff7a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a00" stop-opacity="0"/></radialGradient>`;

  const [bi, bd] = M.brazos || [];
  /* Con un sombrero que las tapa, las orejas quedan dentro: no se pintan. */
  const [oi, od] = orejasTapadas(especie, puestos) ? [] : C.orejas || [];
  const acc = piezasAccesorios(especie, M, P, puestos);
  /*
   * Los brazos van detrás del torso, salvo en las especies con
   * `brazosDelante`: ahí el hombro asoma por fuera del cuerpo si va detrás
   * (Mateo, 19-nov: «los hombros están como salidos»), así que se pintan
   * encima, con el hombro dentro de la silueta.
   */
  const brazos = (bi ? grupo("mta-brazo-i", pieza(bi)) : "") + (bd ? grupo("mta-brazo-d", pieza(bd)) : "");
  const lag = C.lagrima ? `<g class="mta-lagrima">${img("lagrima", C.lagrima[0], C.lagrima[1])}</g>` : "";

  const cabeza =
    `<g class="mta-cabeza"><g transform="translate(${hx} ${hy}) scale(${hs})">` +
    (oi ? grupo("mta-oreja-i", pieza(oi)) : "") +
    (od ? grupo("mta-oreja-d", pieza(od)) : "") +
    pieza(C.base) +
    grupo("mta-cara mta-c-tranquila", grupo("mta-ojos", caraDe(C.tranquila.ojos)) + caraDe(C.tranquila.resto || [])) +
    grupo("mta-cara mta-c-feliz", caraDe(C.feliz)) +
    grupo("mta-cara mta-c-triste", caraDe(C.triste) + lag) +
    grupo("mta-cara mta-c-racha", caraDe(C.racha)) +
    acc.cabeza +
    `</g></g>`;

  /* La llama, centrada sobre la cabeza. */
  const ll = P.piezas.llama || [73, 89];
  const fx = 300;
  const chica = 73 / ll[0], grande = 110 / ll[0];
  const fuego =
    `<g class="mta-fuego">` +
    `<g class="mta-llama-2">${img("llama", fx - 104, hy + 17 - ll[1] * chica, { escala: chica })}</g>` +
    `<g class="mta-llama-3">${img("llama", fx + 31, hy + 17 - ll[1] * chica, { escala: chica })}</g>` +
    `<g class="mta-llama-1">${img("llama", fx - 55, hy + 24 - ll[1] * grande, { escala: grande })}</g>` +
    `<g class="mta-chispas" fill="#ffb02e"><circle cx="210" cy="60" r="5"/><circle cx="390" cy="80" r="4"/><circle cx="300" cy="20" r="4"/><circle cx="150" cy="200" r="3"/><circle cx="450" cy="230" r="4"/></g>` +
    `</g>`;

  const confeti =
    `<g class="mta-confeti">` +
    [
      ["r", 80, 0, "#14b8a6"], ["r", 170, -20, "#f59e0b"], ["c", 250, 0, "#ef4444"], ["r", 330, -10, "#6366f1"],
      ["c", 420, 0, "#22c55e"], ["r", 500, -30, "#ec4899"], ["r", 40, -40, "#f59e0b"], ["c", 540, -10, "#14b8a6"],
      ["r", 290, -50, "#22c55e"], ["r", 130, -30, "#ef4444"],
    ].map(([t, x, y, c]) => (t === "r" ? `<rect x="${x}" y="${y}" width="13" height="8" fill="${c}"/>` : `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`)).join("") +
    `</g>`;

  /*
   * Lo que flota en los festejos. Cada adorno va en dos <g>: el de fuera lo
   * UBICA (atributo transform) y el de dentro lo MUEVE (CSS). Si fueran el
   * mismo, la animación pisaría la ubicación y todos saldrían del origen.
   */
  const adorno = (x, y, cls, dibujo) => `<g transform="translate(${x} ${y})"><g class="${cls}">${dibujo}</g></g>`;
  const NOTA = (c, k = 2) => `<g transform="scale(${k})" fill="${c}" stroke="#0E1B2E" stroke-width="3" stroke-linejoin="round"><ellipse cx="0" cy="0" rx="15" ry="11" transform="rotate(-22)"/><path d="M11 -4 L11 -62 Q34 -50 30 -26 Q24 -42 15 -44 L15 -4 Z"/></g>`;
  const CORAZON = (c, s = 1) => `<path transform="scale(${s})" d="M0 14 C-26 -4 -20 -30 0 -16 C20 -30 26 -4 0 14 Z" fill="${c}" stroke="#0E1B2E" stroke-width="3" stroke-linejoin="round"/>`;
  const ESTRELLA = (c, s = 1) => `<path transform="scale(${s})" d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="${c}" stroke="#0E1B2E" stroke-width="2.5" stroke-linejoin="round"/>`;
  /* Las notas salen del lado derecho de la cabeza; los corazones, por encima. */
  const [cw0, ch0] = P.piezas[C.base[0]] || [220, 220];
  const bordes = (C.orejas || []).map(([n, x]) => [x, x + (P.piezas[n]?.[0] || 0)]);
  const derCabeza = hx + Math.max(cw0, ...bordes.map((b) => b[1])) * hs;
  const izqCabeza = hx + Math.min(0, ...bordes.map((b) => b[0])) * hs;
  const medioCabeza = hy + ch0 * hs * 0.45;
  const notas =
    `<g class="mta-notas">` +
    [[10, 0, "#FFD166", 2.2], [70, 40, "#8FE3D6", 1.8], [30, 70, "#FFB3D1", 2]]
      .map(([dx, dy, c, k]) => adorno(Math.round(derCabeza + dx), Math.round(medioCabeza + dy), "mta-nota", NOTA(c, k))).join("") +
    `</g>`;
  const corazones =
    `<g class="mta-corazones">` +
    [[izqCabeza - 30, medioCabeza - 20, "#FF8FB8", 2.1], [300, hy - 30, "#FF6FA0", 2.6], [derCabeza + 30, medioCabeza - 10, "#FFB3D1", 1.9]]
      .map(([x, y, c, s]) => adorno(Math.round(x), Math.round(y), "mta-corazon", CORAZON(c, s))).join("") +
    `</g>`;
  const estrellas =
    `<g class="mta-estrellas">` +
    [[70, 140, 1.3], [540, 120, 1.1], [40, 430, 0.9], [565, 400, 1.3], [150, -10, 1], [460, -30, 1.4]]
      .map(([x, y, s], i) => adorno(x, y, "mta-estrella", ESTRELLA(i % 2 ? "#FFD166" : "#FFF3B0", s))).join("") +
    `</g>`;

  const inner =
    `<defs>${defs}</defs>` +
    `<ellipse class="mta-aura" cx="300" cy="380" rx="300" ry="360" fill="url(#mta-aura-${uid})"/>` +
    `<ellipse class="mta-sombra" cx="300" cy="684" rx="150" ry="18" fill="#000" opacity=".22"/>` +
    `<g class="mta-todo">` +
    acc.espalda +
    (M.cola ? grupo("mta-cola", pieza(M.cola)) : "") +
    (M.piernas || []).map(pieza).join("") +
    (M.brazosDelante ? "" : brazos) +
    grupo("mta-cuerpo", pieza(M.torso) + acc.pecho) +
    (M.brazosDelante ? brazos : "") +
    cabeza +
    fuego +
    `</g>` +
    confeti + estrellas + corazones + notas;

  /* Las cajas de los accesorios, en px del escenario: el encuadre las cuenta
     para que un sombrero alto o unas alas no se salgan del recuadro. */
  const extra = acc.cajas.map(([x0, y0, x1, y1, enCabeza]) =>
    enCabeza ? [hx + x0 * hs, hy + y0 * hs, hx + x1 * hs, hy + y1 * hs, true] : [x0, y0, x1, y1, false]);
  return { viewBox: busto ? encuadreBusto(M, P, extra) : encuadreCuerpo(M, P, extra), inner };
}

/*
 * El recuadro de cuerpo entero, AJUSTADO a la mascota: la caja que encierra
 * todas sus piezas (y la sombra), con poco margen y en la proporción del <svg>.
 * Así la mascota llena su recuadro en vez de flotar en un escenario con aire.
 */
function encuadreCuerpo(M, P, extra = []) {
  const cajas = [];
  const caja = (p, tx = 0, ty = 0, s = 1) => {
    if (!p) return;
    const d = P.piezas[p[0]];
    if (!d) return;
    const e = p[3]?.escala || 1;
    cajas.push([tx + p[1] * s, ty + p[2] * s, tx + (p[1] + d[0] * e) * s, ty + (p[2] + d[1] * e) * s]);
  };
  [M.cola, M.torso, ...(M.piernas || []), ...(M.brazos || [])].forEach((p) => caja(p));
  const [hx, hy, hs] = M.cabeza.en;
  [...(M.cabeza.orejas || []), M.cabeza.base].forEach((p) => caja(p, hx, hy, hs));
  cajas.push([150, 666, 450, 702]); // la sombra
  extra.forEach((c) => cajas.push(c));
  const izq = Math.min(...cajas.map((c) => c[0])) - 10;
  const arr = Math.min(...cajas.map((c) => c[1])) - 10;
  const der = Math.max(...cajas.map((c) => c[2])) + 10;
  const aba = Math.max(...cajas.map((c) => c[3])) + 6;
  let w = der - izq, h = aba - arr;
  if (w / h > 140 / 150) h = w * (150 / 140); else w = h * (140 / 150);
  const cx = (izq + der) / 2;
  return `${Math.round(cx - w / 2)} ${Math.round(aba - h)} ${Math.round(w)} ${Math.round(h)}`;
}

/* El recuadro de cabeza y hombros, en la proporción del <svg> (140 × 150). */
function encuadreBusto(M, P, extra = []) {
  const C = M.cabeza;
  const [hx, hy, hs] = C.en;
  const [cw, ch] = P.piezas[C.base[0]];
  const orejas = (C.orejas || []).map(([n, x, y]) => [x, y, x + (P.piezas[n]?.[0] || 0)]);
  /* Solo lo de la cabeza cuenta en el busto: unas alas no lo ensanchan. */
  const sobre = extra.filter((c) => c[4]);
  const arriba = Math.min(hy + Math.min(0, ...orejas.map((o) => o[1])) * hs, ...sobre.map((c) => c[1]));
  const izq = Math.min(hx + Math.min(0, ...orejas.map((o) => o[0])) * hs, ...sobre.map((c) => c[0]));
  const der = Math.max(hx + Math.max(cw, ...orejas.map((o) => o[2])) * hs, ...sobre.map((c) => c[2]));
  const abajo = hy + ch * hs;
  const alto = Math.max(abajo - arriba + 110, (der - izq + 24) * (150 / 140));
  const ancho = alto * (140 / 150);
  const cx = (izq + der) / 2;
  return `${Math.round(cx - ancho / 2)} ${Math.round(arriba - 12)} ${Math.round(ancho)} ${Math.round(alto)}`;
}
