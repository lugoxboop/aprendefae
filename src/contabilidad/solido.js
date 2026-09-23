/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ROMBICUBOCTAEDRO — el sólido del retrato de Pacioli, calculado.
 *
 * 26 caras (18 cuadradas y 8 triangulares), 24 vértices, 48 aristas. No es una
 * aproximación ni un modelo dibujado a mano: sale de su definición, que es una
 * sola línea —los vértices son TODAS las permutaciones de (±1, ±1, ±(1+√2))—
 * y todo lo demás se deduce de ahí. Por eso las cuentas se pueden comprobar en
 * una prueba en vez de confiar en que el dibujo «se ve bien».
 *
 * ═══════════ POR QUÉ ESTO NO USA THREE.JS ═══════════
 *
 * El teseracto y el ajedrez sí lo usan, y el encargo decía reutilizar su
 * tratamiento de aristas «si aplica directo». El ENFOQUE se reutiliza —dos
 * capas por arista, un halo ancho y tenue y un núcleo fino, con el brillo
 * según la profundidad—; la maquinaria no, por tres razones:
 *
 *   · PESO. Three.js son 553 kB y el README ya lo señala como la dependencia
 *     más cara del sitio, con dos consumidores. Un FONDO —lo que por
 *     definición no debe disputarle nada a lo de delante— es mal sitio para
 *     volverla obligatoria en una materia que todavía no tiene contenido.
 *   · EXACTITUD DEL LÍQUIDO. El requisito crítico es que la superficie viva en
 *     espacio de MUNDO. Proyectando a mano, el corte se calcula en coordenadas
 *     de mundo y se proyecta después: no hay forma de que la superficie se
 *     cuele en el espacio local del poliedro, porque nunca pasa por ahí.
 *   · SE PUEDE PROBAR. Esto son funciones puras: los 24 vértices, las 48
 *     aristas, el corte y el volumen se miden en Node, sin GPU y sin pintar un
 *     píxel. La regla «el volumen nunca cambia» deja de ser una promesa del
 *     comentario y pasa a ser una aserción.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La única constante: la arista mide 2 y el vértice largo cae en 1 + √2. */
export const LARGO = 1 + Math.SQRT2;
export const ARISTA = 2;

/* ─────────────────────────────── vectores ─────────────────────────────── */

export const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const resta = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const escala = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const suma = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const longitud = (a) => Math.sqrt(punto(a, a));
export const distancia = (a, b) => longitud(resta(a, b));

export function normalizar(a) {
  const L = longitud(a);
  return L === 0 ? [0, 0, 0] : escala(a, 1 / L);
}

export function cruz(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function centroide(puntos) {
  if (!puntos.length) return [0, 0, 0];
  const s = puntos.reduce((acc, p) => suma(acc, p), [0, 0, 0]);
  return escala(s, 1 / puntos.length);
}

/** Dos ejes perpendiculares dentro del plano de `normal`. */
export function baseDelPlano(normal) {
  const n = normalizar(normal);
  /* Se elige el eje del mundo menos alineado con la normal para no degenerar. */
  const auxiliar = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = normalizar(cruz(auxiliar, n));
  const w = cruz(n, u);
  return [u, w];
}

/* ───────────────────────────── los 24 vértices ───────────────────────────── */

/*
 * Todas las permutaciones de (±1, ±1, ±(1+√2)): tres sitios para el largo × dos
 * signos suyos × cuatro combinaciones de signos de los dos unos = 24.
 */
function construirVertices() {
  const vs = [];
  for (let eje = 0; eje < 3; eje += 1) {
    for (const largo of [LARGO, -LARGO]) {
      for (const a of [1, -1]) {
        for (const b of [1, -1]) {
          const v = [a, b, 0];
          /* El largo entra en `eje` y los dos unos ocupan los otros dos. */
          const coords = [0, 0, 0];
          const otros = [0, 1, 2].filter((k) => k !== eje);
          coords[eje] = largo;
          coords[otros[0]] = v[0];
          coords[otros[1]] = v[1];
          vs.push(coords);
        }
      }
    }
  }
  return vs;
}

export const VERTICES = construirVertices();

/* ───────────────────────────── las 48 aristas ───────────────────────────── */

/*
 * Dos vértices son adyacentes si están exactamente a distancia 2, que es el
 * lado. No hay lista escrita a mano: si la hubiera, habría que confiar en ella.
 */
function construirAristas(vertices = VERTICES) {
  const aristas = [];
  const tol = 1e-9;
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      if (Math.abs(distancia(vertices[i], vertices[j]) - ARISTA) < tol) aristas.push([i, j]);
    }
  }
  return aristas;
}

export const ARISTAS = construirAristas();

/* ────────────────────────────── las 26 caras ────────────────────────────── */

/*
 * Una cara es el conjunto de vértices que maximizan el producto escalar con su
 * normal. Las 26 normales de este sólido son conocidas y sencillas:
 *
 *   ±x, ±y, ±z                     6 cuadrados (los «axiales»)
 *   (±1,±1,0) y sus permutaciones  12 cuadrados (los de arista)
 *   (±1,±1,±1)                     8 triángulos
 *
 * 6 + 12 = 18 cuadrados y 8 triángulos: las 26 de la ficha, y la prueba lo
 * comprueba contando en vez de creyéndoselo.
 */
function normalesDeCara() {
  const ns = [];
  /* Axiales. */
  for (let eje = 0; eje < 3; eje += 1) {
    for (const s of [1, -1]) {
      const n = [0, 0, 0];
      n[eje] = s;
      ns.push(n);
    }
  }
  /* De arista: dos componentes no nulas. */
  for (let a = 0; a < 3; a += 1) {
    for (let b = a + 1; b < 3; b += 1) {
      for (const sa of [1, -1]) {
        for (const sb of [1, -1]) {
          const n = [0, 0, 0];
          n[a] = sa;
          n[b] = sb;
          ns.push(n);
        }
      }
    }
  }
  /* De vértice: las tres componentes. */
  for (const x of [1, -1]) for (const y of [1, -1]) for (const z of [1, -1]) ns.push([x, y, z]);
  return ns;
}

function construirCaras(vertices = VERTICES) {
  const tol = 1e-6;
  return normalesDeCara().map((n) => {
    const unit = normalizar(n);
    let max = -Infinity;
    for (const v of vertices) max = Math.max(max, punto(v, unit));
    const indices = vertices
      .map((v, i) => [i, punto(v, unit)])
      .filter(([, d]) => Math.abs(d - max) < tol)
      .map(([i]) => i);
    return { normal: unit, indices: ordenarCiclico(indices, vertices, unit) };
  });
}

/*
 * Los vértices de una cara, en orden alrededor de su perímetro. Sin esto el
 * polígono sale como una estrella: los índices vienen en el orden en que se
 * construyeron los vértices, que no tiene nada que ver con la geometría.
 */
function ordenarCiclico(indices, vertices, normal) {
  const centro = centroide(indices.map((i) => vertices[i]));
  const [u, w] = baseDelPlano(normal);
  return [...indices].sort((a, b) => {
    const angulo = (i) => {
      const d = resta(vertices[i], centro);
      return Math.atan2(punto(d, w), punto(d, u));
    };
    return angulo(a) - angulo(b);
  });
}

export const CARAS = construirCaras();

/** Cuántos lados tiene cada cara: sirve para contar cuadrados y triángulos. */
export const CARAS_POR_LADOS = CARAS.reduce((acc, c) => {
  acc[c.indices.length] = (acc[c.indices.length] ?? 0) + 1;
  return acc;
}, {});

/* ─────────────────────────────── rotación ─────────────────────────────── */

/**
 * Rota un punto por los tres ángulos, en el orden X → Y → Z.
 *
 * El sólido rota; el líquido NO usa esta función, y esa es toda la pieza.
 */
export function rotar([x, y, z], rx, ry, rz) {
  const [cx, sx] = [Math.cos(rx), Math.sin(rx)];
  const [cy, sy] = [Math.cos(ry), Math.sin(ry)];
  const [cz, sz] = [Math.cos(rz), Math.sin(rz)];

  let [a, b, c] = [x, y, z];
  [b, c] = [b * cx - c * sx, b * sx + c * cx];
  [a, c] = [a * cy + c * sy, -a * sy + c * cy];
  [a, b] = [a * cz - b * sz, a * sz + b * cz];
  return [a, b, c];
}

export const rotarTodos = (vertices, rx, ry, rz) => vertices.map((v) => rotar(v, rx, ry, rz));

/* ────────────────────────────── proyección ────────────────────────────── */

/*
 * Perspectiva débil: lo justo para que se lea como un volumen y no como un
 * alambre plano, sin deformar el sólido. `y` se invierte porque en SVG crece
 * hacia abajo y en el mundo crece hacia arriba.
 */
export const DISTANCIA_CAMARA = 11;

export function proyectar([x, y, z], { escala: k = 1, distancia: d = DISTANCIA_CAMARA } = {}) {
  const f = d / (d - z);
  return [x * f * k, -y * f * k];
}

/** La profundidad de un punto, para decidir qué va delante y cuánto brilla. */
export const profundidad = ([, , z]) => z;
