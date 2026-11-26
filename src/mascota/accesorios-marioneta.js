/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ACCESORIOS SOBRE LAS MARIONETAS.
 *
 * Cada accesorio es una pieza ilustrada (public/mascotas/accesorios/) dibujada
 * en Gemini con el mismo trazo de las mascotas. Una sola pieza sirve para las
 * seis especies: se ubica sobre ANCLAS de cada mascota —la coronilla, los
 * ojos, el hocico, el cuello, el pecho, la espalda— y se escala con ella.
 *
 * Dónde se pinta decide con qué se mueve:
 *   · cabeza  — dentro de la cabeza: cabecea, se ladea y salta con ella.
 *   · pecho   — dentro del cuerpo, sobre el torso: respira con él.
 *   · espalda — detrás de todo (capa, alas, jetpack): asoma por los lados.
 *
 * El hueco (ranura) dice qué no se puede llevar a la vez: dos sombreros no,
 * un sombrero y unas gafas sí. Al ponerse uno, se quita el otro de su ranura.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { SILUETAS } from "./siluetas-cabeza.js";

/* Tamaño de cada pieza en px (el webp guardado). */
export const PIEZAS_ACCESORIO = {
  alas: [340, 232], antifaz: [223, 91], audifonos: [245, 208], audifonos_arco: [245, 97], audifono_i: [122, 117], audifono_d: [123, 117], bigote: [221, 74], birrete: [284, 172],
  bufanda: [236, 259], capa: [314, 249], casco: [246, 247], collar: [217, 157], corbata: [202, 202],
  corbatin: [184, 98], corona: [238, 102], gafas: [240, 106], gafas_sol: [235, 98], gorra: [221, 166],
  gorro: [236, 205], jetpack: [226, 262], mago: [274, 208], medalla: [149, 230], mochila: [527, 480],
  mono: [217, 169], parche: [210, 132], pirata: [290, 156], tirante_d: [128, 393], tirante_i: [123, 394],
  traje: [232, 212], vaquero: [287, 154],
};

/*
 * Cada accesorio: su ranura y sus partes. Cada parte dice
 *   en    — el ancla: coronilla | centro | ojos | ojo_d | hocico (de la cabeza)
 *           o cuello | pecho | espalda (del cuerpo)
 *   capa  — cabeza | pecho | espalda (ver arriba)
 *   w     — ancho, en veces el ancho del ancla (la cabeza, la separación de
 *           los ojos o el torso)
 *   p     — qué punto de la pieza cae sobre el ancla, en fracción [x, y]
 *   dy    — corrimiento vertical, en veces el ancho del ancla
 */
export const ACCESORIOS_MARIONETA = {
  /* ── sombreros ── */
  /*
   * Los sombreros van a la FRENTE (justo encima de los ojos) y se miden con el
   * ancho real de la cabeza a esa altura (src/mascota/siluetas-cabeza.js):
   *   ancho   — qué fracción del ancho de la pieza es la boca del sombrero
   *             (lo que abraza la cabeza; el ala del pirata o del vaquero sobra)
   *   holgura — cuánto más ancha que la cabeza queda esa boca
   *   copa    — dónde empieza la tela arriba (fracción del alto de la pieza):
   *             la copa se achata lo justo para cubrir el cráneo sin hacer
   *             torre (Mateo, 19-nov: «el gorro y la gorra quedan raros»)
   *   p       — el centro de la boca, abajo, en fracción de la pieza
   */
  gorro: { ranura: "sombrero", partes: [{ pieza: "gorro", en: "frente", ancho: 0.94, holgura: 1.1, copa: 0.27, p: [0.5, 0.86] }] },
  gorra: { ranura: "sombrero", partes: [{ pieza: "gorra", en: "frente", ancho: 0.95, holgura: 1.08, copa: 0.1, p: [0.5, 0.84] }] },
  pirata: { ranura: "sombrero", partes: [{ pieza: "pirata", en: "frente", ancho: 0.72, holgura: 1.12, copa: 0.08, p: [0.5, 0.82] }] },
  birrete: { ranura: "sombrero", partes: [{ pieza: "birrete", en: "frente", ancho: 0.56, holgura: 0.8, copa: 0.3, p: [0.445, 0.84] }] },
  mago: { ranura: "sombrero", partes: [{ pieza: "mago", en: "frente", ancho: 0.74, holgura: 1.1, copa: 0.55, p: [0.5, 0.86], achata: false }] },
  vaquero: { ranura: "sombrero", partes: [{ pieza: "vaquero", en: "frente", ancho: 0.6, holgura: 1.02, copa: 0.08, p: [0.5, 0.84] }] },
  corona: { ranura: "sombrero", partes: [{ pieza: "corona", en: "coronilla", w: 0.78, p: [0.5, 0.62], dy: 0.04 }] },
  casco: { ranura: "sombrero", partes: [{ pieza: "casco", en: "centro", w: 1.42, p: [0.5, 0.52], dy: 0.05 }] },
  /* Los audífonos van despiezados (arco y dos copas): las copas a los lados de
     la cabeza, a la altura de los ojos; el arco pasa por encima del cráneo. */
  audifonos: { ranura: "sombrero", rig: "audifonos", partes: [], piezasRig: ["audifonos_arco", "audifono_i", "audifono_d"] },
  mono: { ranura: "lazo", partes: [{ pieza: "mono", en: "coronilla", w: 0.4, p: [0.5, 0.5], dx: 0.27, dy: 0.08 }] },
  /* ── la cara ── */
  gafas: { ranura: "ojos", partes: [{ pieza: "gafas", en: "ojos", w: 1.9, p: [0.5, 0.5] }] },
  gafas_sol: { ranura: "ojos", partes: [{ pieza: "gafas_sol", en: "ojos", w: 1.95, p: [0.5, 0.45] }] },
  antifaz: { ranura: "ojos", partes: [{ pieza: "antifaz", en: "ojos", w: 1.95, p: [0.5, 0.5] }] },
  parche: { ranura: "ojos", partes: [{ pieza: "parche", en: "ojo_d", w: 1.5, p: [0.7, 0.64] }] },
  bigote: { ranura: "bigote", partes: [{ pieza: "bigote", en: "hocico", w: 1.1, p: [0.5, 0.22] }] },
  /* ── cuello y pecho ── */
  bufanda: { ranura: "cuello", partes: [{ pieza: "bufanda", en: "cuello", w: 0.92, p: [0.5, 0.12] }] },
  collar: { ranura: "cuello", partes: [{ pieza: "collar", en: "cuello", w: 0.74, p: [0.5, 0.3], dy: 0.06 }] },
  corbatin: { ranura: "cuello", partes: [{ pieza: "corbatin", en: "cuello", w: 0.42, p: [0.5, 0.4], dy: 0.2 }] },
  corbata: { ranura: "cuello", partes: [{ pieza: "corbata", en: "cuello", w: 0.66, p: [0.5, 0.12] }] },
  traje: { ranura: "cuello", partes: [{ pieza: "traje", en: "cuello", w: 0.86, p: [0.5, 0.06] }] },
  medalla: { ranura: "medalla", partes: [{ pieza: "medalla", en: "cuello", w: 0.34, p: [0.5, 0.06], dy: 0.04 }] },
  /* ── la espalda ── */
  capa: { ranura: "espalda", partes: [{ pieza: "capa", en: "cuello", capa: "espalda", w: 1.5, p: [0.5, 0.06], dy: -0.02 }] },
  jetpack: { ranura: "espalda", partes: [{ pieza: "jetpack", en: "pecho", capa: "espalda", w: 1.25, p: [0.5, 0.42], dy: -0.15 }] },
  alas: { ranura: "espalda", partes: [{ pieza: "alas", en: "pecho", capa: "espalda", w: 2.1, p: [0.5, 0.55], dy: -0.1 }] },
  mochila: {
    ranura: "espalda",
    partes: [
      { pieza: "mochila", en: "cuello", capa: "espalda", w: 1.2, p: [0.5, 0.3], dy: 0.02 },
      { pieza: "tirante_i", en: "cuello", w: 0.2, p: [0.5, 0.04], dx: -0.25, dy: 0.0 },
      { pieza: "tirante_d", en: "cuello", w: 0.2, p: [0.5, 0.04], dx: 0.25, dy: 0.0 },
    ],
  },
};

/* Lo que puede llevar un accesorio en `capa` si la parte no lo dice. */
const CAPA_DE_ANCLA = { frente: "cabeza", coronilla: "cabeza", centro: "cabeza", ojos: "cabeza", ojo_d: "cabeza", hocico: "cabeza", cuello: "pecho", pecho: "pecho", espalda: "espalda" };

/*
 * LO QUE CADA ESPECIE CORRIGE A MANO (19-nov, Mateo: «no todos los animales
 * miden lo mismo»). Las anclas ponen cada pieza en su sitio aproximado; aquí se
 * afina por animal y por accesorio, auditado con la rejilla
 * (scripts/mascota/rejilla-accesorios.mjs):
 *   hocico      — dónde va el bigote: justo debajo de la nariz, en fracción
 *                 del ancho y alto de la cabeza
 *   coronilla   — dónde empieza el cráneo, en fracción del alto de la cabeza
 *   tapaOrejas  — sombreros que tapan las orejas: con ellos puestos las orejas
 *                 no se pintan (quedan dentro del gorro). Sin esto, las orejas
 *                 altas del zorro y del gato asomaban por debajo del ala y el
 *                 sombrero parecía flotar encima.
 *   ajustes     — por accesorio [dx, dy, escala, giro]: corrimiento en veces
 *                 el ancho del ancla, escala extra y giro en grados.
 */
const SOMBREROS = ["gorro", "gorra", "pirata", "birrete", "mago", "vaquero"];
const ESPECIE = {
  zorro: {
    hocico: [0.5, 0.72], coronilla: 0.1, tapaOrejas: SOMBREROS,
    ajustes: {
      mono: [0, -0.05, 1], parche: [0, 0, 0.88],
      collar: [0, -0.04, 1], corbatin: [0, -0.06, 1], medalla: [0, -0.02, 1.15],
      jetpack: [0, 0, 1.12],
    },
  },
  gato: {
    hocico: [0.49, 0.72], coronilla: 0.1, tapaOrejas: SOMBREROS,
    ajustes: {
      mono: [0, -0.05, 1], parche: [0, 0, 0.88],
      collar: [0, -0.04, 1], corbatin: [0, -0.06, 1], medalla: [0, -0.02, 1.15],
      jetpack: [0, 0, 1.12],
    },
  },
  /* Perro: cabeza más ancha que alta y orejas caídas que salen por los lados. */
  perro: {
    hocico: [0.5, 0.79], coronilla: 0.08,
    ajustes: {
      corona: [0, 0.15, 1.08],
      casco: [0, -0.02, 1.2], mono: [-0.02, -0.03, 0.85],
      bufanda: [0, 0, 0.8], capa: [0, 0, 0.8], mochila: [0, 0.02, 0.72], alas: [0, 0, 0.9],
    },
  },
  /* Hámster: los cachetes lo hacen ancho abajo; la cabeza tapa casi todo el pecho. */
  panda: {
    hocico: [0.49, 0.66], coronilla: 0.1,
    ajustes: {},
  },
  hamster: {
    hocico: [0.5, 0.6], coronilla: 0.1,
    ajustes: {
      corona: [0, 0.03, 0.9],
      mono: [0, -0.05, 0.8], parche: [0, 0, 0.88],
      bufanda: [0, 0.04, 0.9], capa: [0, 0, 0.85], mochila: [0, 0.03, 0.8], alas: [0, -0.04, 0.8],
    },
  },
  /* Conejo: cabeza grande sobre un cuerpo chico; las orejas pasan por el sombrero. */
  conejo: {
    hocico: [0.5, 0.69], coronilla: 0.1,
    ajustes: {
      /* El casco crece para que las orejas queden dentro de la burbuja. */
      casco: [0, -0.15, 1.34], corona: [0, -0.02, 1.25], mono: [0.05, -0.15, 1.05],
      /* Lo del cuello y la espalda se mide sobre el cuerpo nuevo (20-nov), un 28 % más ancho. */
      bufanda: [0, 0.06, 0.88], collar: [0, 0.05, 0.92], corbatin: [0, 0.1, 1.04], corbata: [0, 0.06, 1.04],
      medalla: [0, 0.02, 0.96], traje: [0, 0.02, 0.88],
      capa: [0, -0.04, 1.08], jetpack: [0, -0.04, 1.2], alas: [0, -0.06, 1.0], mochila: [0, -0.02, 1.16],
    },
  },
  huron: {
    hocico: [0.5, 0.8], coronilla: 0.1, frente: 0.15, ojos: [[0.33, 0.55], [0.68, 0.55]],
    ajustes: { mono: [-0.06, -0.01, 0.85], parche: [0, 0, 0.82] },
  },
};

/* ¿Lleva un sombrero que le tapa las orejas? Entonces no se pintan. */
export function orejasTapadas(especie, puestos) {
  const t = ESPECIE[especie]?.tapaOrejas;
  return Boolean(t && (puestos || []).some((k) => t.includes(k)));
}

const centroDe = (P, p) => {
  const d = P.piezas[p[0]];
  const e = p[3]?.escala || 1;
  return d ? [p[1] + (d[0] * e) / 2, p[2] + (d[1] * e) / 2] : null;
};

/* Los bordes [izquierda, derecha] de la cabeza a una altura (fracción del alto). */
function bordeEn(especie, f, cw) {
  const B = SILUETAS[especie]?.bordes;
  if (!B) return [cw * 0.1, cw * 0.9];
  const t = Math.max(0, Math.min(20, f * 20));
  const i = Math.floor(t), k = t - i;
  const a = B[i] || B[i + 1] || [cw * 0.4, cw * 0.6], b = B[Math.min(20, i + 1)] || a;
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/* Las anclas de una especie: las de la cabeza en px de la cabeza, las del
   cuerpo en px del escenario. Cada una es [x, y, ancho]. */
export function anclasDe(especie, M, P) {
  const E = ESPECIE[especie] || {};
  const C = M.cabeza;
  const [cw, chh] = P.piezas[C.base[0]];
  let oi, od;
  if (E.ojos) {
    oi = [E.ojos[0][0] * cw, E.ojos[0][1] * chh];
    od = [E.ojos[1][0] * cw, E.ojos[1][1] * chh];
  } else {
    oi = centroDe(P, C.tranquila.ojos[0]);
    od = centroDe(P, C.tranquila.ojos[1]);
  }
  const sep = Math.abs(od[0] - oi[0]);
  const [tx, ty] = [M.torso[1], M.torso[2]];
  /* El torso puede ir escalado (el conejo, 21-nov): las anclas, a su tamaño real. */
  const [tw, th] = P.piezas[M.torso[0]].map((v) => v * (M.torso[3]?.escala || 1));
  const [hx, hy, hs] = C.en;
  const cuelloY = Math.max(ty + th * 0.04, hy + chh * hs - th * 0.1);
  /* La frente: justo encima de los ojos, con el ancho real de la cabeza ahí. */
  const altoOjo = E.ojos ? chh * 0.16 : P.piezas[C.tranquila.ojos[0][0]][1];
  const ojoArriba = Math.min(oi[1], od[1]) - altoOjo / 2;
  const fy = ojoArriba - chh * (E.frente ?? 0.08);
  const [fl, fr] = bordeEn(especie, fy / chh, cw);
  return {
    frente: [(fl + fr) / 2, fy, fr - fl],
    sienes: [...bordeEn(especie, (oi[1] + od[1]) / 2 / chh, cw), (oi[1] + od[1]) / 2],
    tope: (SILUETAS[especie]?.tope ?? chh * 0.03),
    coronilla: [cw / 2, chh * (E.coronilla ?? 0.1), cw],
    centro: [cw / 2, chh * 0.42, cw],
    ojos: [(oi[0] + od[0]) / 2, (oi[1] + od[1]) / 2, sep],
    ojo_d: [od[0], od[1], sep],
    hocico: [(E.hocico?.[0] ?? 0.5) * cw, (E.hocico?.[1] ?? 0.6) * chh, sep],
    cuello: [tx + tw / 2, cuelloY, tw],
    pecho: [tx + tw / 2, ty + th * 0.4, tw],
    espalda: [tx + tw / 2, ty + th * 0.3, tw],
  };
}

/*
 * Los audífonos, armados sobre la cabeza de cada especie: cada copa centrada
 * en el borde de la cara a la altura de los ojos (el cojín negro sobre el
 * borde, no sobre los cachetes) y el arco estirado de copa a copa, pasando
 * justo por encima del cráneo. [ax, ay, as]: corrimiento y escala de la especie.
 */
function rigAudifonos(A, [ax, ay, as], pintar) {
  const [L, R, ey] = A.sienes;
  const ancho = R - L;
  const cupW = ancho * 0.36 * as;
  const cupH = (cupW * 117) / 122;
  const cy = ey + ancho * (0.04 + ay);
  /* El cojín (x ≈ 0.55 de la copa izquierda) cae sobre el borde de la cara. */
  const xi = L - cupW * 0.5 + ax * ancho, xd = R - cupW * 0.5 - ax * ancho;
  const topeCopa = cy - cupH * 0.5;
  /* Las barras del arco entran en las copas a x ≈ 0.16 (izq.) y 0.84 (der.). */
  const bi = xi + cupW * 0.16, bd = xd + cupW * 0.84;
  const arcoW = (bd - bi) / 0.84;
  const arcoX = bi - arcoW * 0.08;
  const arcoY = A.tope - ancho * 0.05;
  const arcoH = topeCopa + cupH * 0.08 - arcoY;
  pintar("audifonos_arco", "cabeza", arcoX, arcoY, arcoW, arcoH);
  pintar("audifono_i", "cabeza", xi, topeCopa, cupW, cupH);
  pintar("audifono_d", "cabeza", xd, topeCopa, cupW, cupH);
}

/* Las ranuras: al ponerse uno, se quitan los demás de la misma. */
export const ranuraDe = (id) => ACCESORIOS_MARIONETA[id]?.ranura ?? null;
export function chocaCon(id, puestos) {
  const r = ranuraDe(id);
  return r ? (puestos || []).filter((k) => k !== id && ranuraDe(k) === r) : [];
}

/*
 * Las piezas de los accesorios puestos, repartidas por capa:
 * { cabeza, pecho, espalda } — cada una, un trozo de SVG listo para pintar.
 * Si dos accesorios comparten ranura (datos viejos), se pintan los dos: nada
 * de lo que alguien compró desaparece por sorpresa.
 */
export function piezasAccesorios(especie, M, P, puestos) {
  /* cajas: [x0, y0, x1, y1, enCabeza] de cada pieza, para el encuadre. */
  const out = { cabeza: "", pecho: "", espalda: "", cajas: [] };
  const lista = (puestos || []).filter((k) => ACCESORIOS_MARIONETA[k]);
  if (!lista.length) return out;
  const A = anclasDe(especie, M, P);
  const aj = ESPECIE[especie]?.ajustes || {};
  /* Orden fijo: lo que va abajo primero (de la tabla), no el orden de compra. */
  const orden = Object.keys(ACCESORIOS_MARIONETA).filter((k) => lista.includes(k));
  /*
   * El cuerpo a medida (complexión): lo del pecho y la espalda se ensancha
   * con el torso, desde su centro y solo a lo ancho —una bufanda de un
   * gordito es más ancha, no más alta—. Lo de la cabeza no se toca.
   */
  const ancho = M.anchoCuerpo || 1;
  const eje = A.pecho[0];
  for (const id of orden) {
    const [ax = 0, ay = 0, as = 1, giro = 0] = aj[id] || [];
    let trozos = { cabeza: "", pecho: "", espalda: "" };
    const pintar = (pieza, capa, px, py, w, h) => {
      if (ancho !== 1 && capa !== "cabeza") {
        px = eje + (px - eje) * ancho;
        w *= ancho;
      }
      out.cajas.push([px, py, px + w, py + h, capa === "cabeza"]);
      const rot = giro ? ` transform="rotate(${giro} ${+(px + w / 2).toFixed(1)} ${+(py + h / 2).toFixed(1)})"` : "";
      /* preserveAspectRatio="none": la copa de un sombrero puede ir achatada. */
      trozos[capa] += `<image href="/mascotas/accesorios/${pieza}.webp" x="${+px.toFixed(1)}" y="${+py.toFixed(1)}" width="${+w.toFixed(1)}" height="${+h.toFixed(1)}" preserveAspectRatio="none"${rot}/>`;
    };
    if (ACCESORIOS_MARIONETA[id].rig === "audifonos") {
      rigAudifonos(A, [ax, ay, as], pintar);
    }
    for (const pt of ACCESORIOS_MARIONETA[id].partes || []) {
      const d = PIEZAS_ACCESORIO[pt.pieza];
      const capa = pt.capa || CAPA_DE_ANCLA[pt.en];
      if (pt.en === "frente") {
        /* Sombrero: la boca abraza la frente; la copa cubre el cráneo. */
        const [x, y, ancho] = A.frente;
        const w = (ancho * pt.holgura * as) / pt.ancho;
        let h = (w * d[1]) / d[0];
        if (pt.achata !== false) {
          const sube = (pt.p[1] - pt.copa) * h; // lo que sube la tela sobre la frente
          const pide = (y - A.tope) * 1.18; // el cráneo, con un poco de aire
          h *= Math.max(0.7, Math.min(1, pide / sube));
        }
        const px = x + ax * ancho - w * pt.p[0];
        const py = y + ay * ancho - h * pt.p[1];
        pintar(pt.pieza, capa, px, py, w, h);
        continue;
      }
      const [x, y, ref] = A[pt.en];
      const w = pt.w * ref * as;
      const h = (w * d[1]) / d[0];
      const px = x + ((pt.dx || 0) + ax) * ref - w * pt.p[0];
      const py = y + ((pt.dy || 0) + ay) * ref - h * pt.p[1];
      pintar(pt.pieza, capa, px, py, w, h);
    }
    for (const c of ["cabeza", "pecho", "espalda"]) {
      if (trozos[c]) out[c] += `<g class="mta-acc mta-acc-${id}">${trozos[c]}</g>`;
    }
  }
  return out;
}
