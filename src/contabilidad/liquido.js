import {
  punto, resta, suma, escala, normalizar, cruz, centroide, baseDelPlano,
  VERTICES, CARAS,
} from "./solido.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL LÍQUIDO — y la única regla de la que depende toda la pieza.
 *
 * LA SUPERFICIE VIVE EN ESPACIO DE MUNDO. El sólido gira; el líquido no gira
 * con él. Si la superficie se inclinara junto con la geometría del poliedro
 * dejaría de leerse como líquido —sería una cara pintada de teal— y la
 * metáfora entera se cae. Por eso aquí NO se llama nunca a `rotar()`: se le
 * pasan los vértices YA rotados y el plano se define en el mundo, con su
 * normal cerca de la vertical del mundo.
 *
 * Que eso se cumpla no depende de acordarse: hay una prueba que rota el sólido
 * a veinte orientaciones y comprueba que la normal de la superficie no se
 * mueve ni un grado.
 *
 * ═══════════ EL VOLUMEN NO CAMBIA, Y NO POR QUE SE VIGILE ═══════════
 *
 * «El estudiante puede desequilibrarlo pero nunca romperlo» sale gratis de la
 * geometría, no de un tope ni de una corrección:
 *
 *   El rombicuboctaedro es CENTRALMENTE SIMÉTRICO —si (a,b,c) es vértice,
 *   (−a,−b,−c) también—, y está centrado en el origen. Para un cuerpo así,
 *   CUALQUIER plano que pase por el centro lo parte en dos mitades de volumen
 *   idéntico, sea cual sea su inclinación: la reflexión por el centro lleva un
 *   lado exactamente sobre el otro.
 *
 * Así que la regla se reduce a una sola condición: el plano pasa siempre por
 * el centro. Solo se mueve su NORMAL, que es el chapoteo. No hay nada que
 * recalcular, nada que limitar y ninguna deriva que acumular — y la mitad es
 * exacta, no aproximada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La vertical del mundo. La superficie en reposo es perpendicular a esto. */
export const ARRIBA = [0, 1, 0];

/* ───────────────────────────── el chapoteo ───────────────────────────── */

/*
 * Un oscilador amortiguado por eje. `k` y `c` están elegidos para dar dos o
 * tres oscilaciones decrecientes antes de quedar quieto: con k = 42 y c = 5,4
 * el factor de amortiguación es ~0,42 y el líquido cruza el nivel tres veces
 * con amplitud cada vez menor. Más amortiguación y parece gelatina; menos, y
 * no para nunca.
 */
export const RIGIDEZ = 42;
export const AMORTIGUACION = 5.4;

/* Cuánto se llega a inclinar la superficie, en radianes. Un chapoteo, no una ola. */
export const INCLINACION_MAXIMA = 0.28;

export function estadoInicial() {
  return { x: 0, z: 0, vx: 0, vz: 0 };
}

/**
 * Avanza el chapoteo un paso.
 *
 * @param {object} estado    el del paso anterior
 * @param {number} dt        segundos
 * @param {{x:number,z:number}} empuje  cuánto se movió el sólido en este paso;
 *        es lo que agita el líquido — se agita por el CAMBIO, no por la
 *        posición: un sólido quieto en una inclinación rara no chapotea.
 */
export function avanzarChapoteo(estado, dt, empuje = { x: 0, z: 0 }) {
  /* Un paso muy largo —una pestaña en segundo plano— reventaría el muelle. */
  const paso = Math.min(dt, 0.05);
  const siguiente = { ...estado };

  for (const [pos, vel, imp] of [["x", "vx", "x"], ["z", "vz", "z"]]) {
    const aceleracion = -RIGIDEZ * siguiente[pos] - AMORTIGUACION * siguiente[vel];
    siguiente[vel] += aceleracion * paso + (empuje[imp] ?? 0);
    siguiente[pos] += siguiente[vel] * paso;
    /* Tope: por muy fuerte que se agite, la superficie no se pone de canto. */
    siguiente[pos] = Math.max(-INCLINACION_MAXIMA, Math.min(INCLINACION_MAXIMA, siguiente[pos]));
  }
  return siguiente;
}

/** ¿Ya se quedó quieto? Sirve para dejar de pedir fotogramas. */
export const enReposo = (e) =>
  Math.abs(e.x) < 1e-4 && Math.abs(e.z) < 1e-4 && Math.abs(e.vx) < 1e-3 && Math.abs(e.vz) < 1e-3;

/**
 * La normal de la superficie, en el mundo.
 *
 * En reposo es exactamente la vertical del mundo. Con chapoteo se inclina un
 * poco, y NUNCA depende de la rotación del sólido: esta función no recibe
 * ángulos del poliedro porque no tiene por qué conocerlos.
 */
export function normalDeSuperficie(estado = estadoInicial()) {
  return normalizar([Math.sin(estado.z), Math.cos(estado.x) * Math.cos(estado.z), -Math.sin(estado.x)]);
}

/* ───────────────────────── el corte por el plano ───────────────────────── */

/*
 * El plano pasa por el centro del sólido, que está en el origen. «Debajo» es
 * el semiespacio con producto escalar negativo contra la normal.
 */
const altura = (v, n) => punto(v, n);

/**
 * Recorta un polígono al semiespacio de debajo (Sutherland–Hodgman en 3D).
 * Devuelve [] si la cara está entera por encima.
 */
export function recortarBajoPlano(poligono, n) {
  const salida = [];
  for (let i = 0; i < poligono.length; i += 1) {
    const a = poligono[i];
    const b = poligono[(i + 1) % poligono.length];
    const da = altura(a, n);
    const db = altura(b, n);
    const aDentro = da <= 0;
    const bDentro = db <= 0;

    if (aDentro) salida.push(a);
    if (aDentro !== bDentro) {
      /* El punto donde la arista cruza la superficie. */
      const t = da / (da - db);
      salida.push(suma(a, escala(resta(b, a), t)));
    }
  }
  return salida;
}

/**
 * El polígono de la SUPERFICIE: donde el plano corta al sólido.
 *
 * Se recogen los cruces de todas las caras y se ordenan alrededor del centro
 * dentro del propio plano. El sólido es convexo, así que ese orden angular es
 * el perímetro y no una estrella.
 */
export function poligonoDeSuperficie(verticesRotados, n, caras = CARAS) {
  const tol = 1e-7;
  const cruces = [];
  for (const cara of caras) {
    const poligono = cara.indices.map((i) => verticesRotados[i]);
    for (let i = 0; i < poligono.length; i += 1) {
      const a = poligono[i];
      const b = poligono[(i + 1) % poligono.length];
      const da = altura(a, n);
      const db = altura(b, n);
      if (Math.abs(da) < tol) { cruces.push(a); continue; }
      if ((da < 0) !== (db < 0)) {
        const t = da / (da - db);
        cruces.push(suma(a, escala(resta(b, a), t)));
      }
    }
  }
  if (cruces.length < 3) return [];

  /* Sin duplicados: cada cruce lo aporta también la cara vecina. */
  const unicos = [];
  for (const p of cruces) {
    if (!unicos.some((q) => Math.abs(q[0] - p[0]) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-6 && Math.abs(q[2] - p[2]) < 1e-6)) {
      unicos.push(p);
    }
  }
  const centro = centroide(unicos);
  const [u, w] = baseDelPlano(n);
  return unicos.sort((a, b) => {
    const ang = (p) => {
      const d = resta(p, centro);
      return Math.atan2(punto(d, w), punto(d, u));
    };
    return ang(a) - ang(b);
  });
}

/**
 * Las caras del líquido: cada cara del sólido recortada a lo que queda debajo,
 * más la tapa de la superficie. Es lo que se pinta en teal.
 */
export function cuerpoDelLiquido(verticesRotados, n, caras = CARAS) {
  const partes = [];
  for (const cara of caras) {
    const recorte = recortarBajoPlano(cara.indices.map((i) => verticesRotados[i]), n);
    if (recorte.length >= 3) partes.push({ puntos: recorte, normal: cara.normal });
  }
  return { partes, superficie: poligonoDeSuperficie(verticesRotados, n, caras) };
}

/* ─────────────────────────── el volumen, para medir ─────────────────────────── */

/*
 * Volumen de un cuerpo convexo dado por sus caras, con el origen dentro (o en
 * su borde): se suman los tetraedros que van del origen a cada triángulo. Solo
 * lo usa la prueba —el dibujo no necesita saber el volumen— pero vive aquí
 * porque mide exactamente el cuerpo que construye la función de arriba.
 */
export function volumenDeCaras(partes) {
  let v = 0;
  for (const { puntos } of partes) {
    for (let i = 1; i + 1 < puntos.length; i += 1) {
      v += Math.abs(punto(puntos[0], cruz(puntos[i], puntos[i + 1]))) / 6;
    }
  }
  return v;
}

/** El volumen del sólido entero, con los mismos tetraedros. */
export function volumenTotal(verticesRotados = VERTICES, caras = CARAS) {
  return volumenDeCaras(caras.map((c) => ({ puntos: c.indices.map((i) => verticesRotados[i]) })));
}

/**
 * Qué fracción del sólido ocupa el líquido. Tiene que dar 0,5 SIEMPRE.
 * Es la función que convierte la regla del encargo en algo medible.
 */
export function fraccionLlena(verticesRotados, n, caras = CARAS) {
  const { partes, superficie } = cuerpoDelLiquido(verticesRotados, n, caras);
  const cuerpo = [...partes];
  if (superficie.length >= 3) cuerpo.push({ puntos: superficie });
  return volumenDeCaras(cuerpo) / volumenTotal(verticesRotados, caras);
}
