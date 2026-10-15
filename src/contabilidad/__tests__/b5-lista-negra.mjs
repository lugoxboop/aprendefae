/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA LISTA NEGRA DE CIFRAS DEL LIBRO (Célula B) — para las cifras construidas
 * de un escenario simulado (T6 · A5 y b5-t6-a6, Sakuta).
 *
 * Se arma sola con:
 *   · cada cifra del libro que ya está en nuestros datos de T5 y T6 (El
 *     Torito, Dajema, Santa Pacha…), en los textos y en los asientos;
 *   · el banco digitado del ejercicio D-3, El Toro Negro (Célula E, p. 269);
 *   · las cifras del libro que Futaba nombró al cruzar el capítulo y que no
 *     están en datos (la tabla de la p. 201, D-3 y las de otros temas);
 *   · y, si se pide, las cifras construidas de T6 · A5.
 * No es una prueba: lo importan las pruebas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MODULOS_DEL_LIBRO = [
  "contabilidadT5Act1.js", "contabilidadT5Act2.js", "contabilidadT5Pieza1.js", "contabilidadT5Pieza2.js",
  "contabilidadT6Act1.js", "contabilidadT6Act2.js", "contabilidadT6Act3.js",
  "contabilidadT6Pieza1.js", "contabilidadT6Pieza2.js", "contabilidadT6Pieza3.js", "contabilidadT6Pieza4.js",
];

export const LIBRO_FUERA_DE_DATOS = {
  "p. 201, tabla de El Torito": [200000, 100000],
  "p. 269, ejercicio D-3 (El Toro Negro), datos": [1000000, 400000],
  "ejercicio D-3, la provisión que da": [2283400],
  "pp. 219-221, 241, 255, 270-274 (inventarios, compras, precios)": [300000, 10000, 30000, 15000, 20000, 945000, 200000, 100000],
};

/* «$1.000.000» → 1000000. */
export const cifras = (t) => [...String(t).matchAll(/\$(\d{1,3}(?:\.\d{3})*)/g)].map((m) => Number(m[1].replace(/\./g, "")));

const textos = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(textos) : v && typeof v === "object" ? Object.values(v).flatMap(textos) : []);
const valores = (v, k) => (typeof v === "number" && (k === "valor" || k === "monto") ? [v]
  : Array.isArray(v) ? v.flatMap((x) => valores(x, k))
    : v && typeof v === "object" ? Object.entries(v).flatMap(([kk, x]) => valores(x, kk)) : []);
const numeros = (v) => (typeof v === "number" ? (v >= 1000 ? [v] : []) : typeof v === "string" ? cifras(v)
  : Array.isArray(v) ? v.flatMap(numeros) : v && typeof v === "object" ? Object.values(v).flatMap(numeros) : []);

export async function listaNegraDelLibro({ conT6A5 = false } = {}) {
  const negra = new Set();
  for (const f of MODULOS_DEL_LIBRO) {
    const mod = await import(`../../data/${f}`);
    for (const c of [...textos(Object.values(mod)).flatMap(cifras), ...Object.entries(mod).flatMap(([k, v]) => valores(v, k))]) negra.add(c);
  }
  const toro = await import("../../data/repasoCap5ToroNegro.js");
  for (const c of Object.values(toro).flatMap(numeros)) negra.add(c);
  for (const c of Object.values(LIBRO_FUERA_DE_DATOS).flat()) negra.add(c);
  if (conT6A5) {
    const a5 = await import("../../data/contabilidadT6Pieza5.js");
    for (const c of a5.CIFRAS_CONSTRUIDAS_T6_A5) if (c) negra.add(c);
  }
  return negra;
}
