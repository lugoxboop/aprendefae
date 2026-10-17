import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS RÓTULOS [W] DE NEAR PARA T7-1 A6 (c3-rotulos-near.md, «## A6»).
 *
 * Como correccionesMello.mjs: el paquete de Watari queda como llegó y este
 * ayudante dice qué rótulo suyo cambia Near, y por cuál. Cada texto de Near
 * se lee de la tabla de su paquete, letra por letra: el ayudante falla si la
 * fila no está, si la celda no trae ese texto entre «», o si el texto de
 * Watari que se reemplaza no está en su a6.js.
 *
 * ROTULOS_A6[clave] = { watari, near }. Cuando Near deja el de Watari,
 * watari === near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const PAQ = "orquestador/conocimiento/paquetes/";
const NEAR = readFileSync(new URL(`${PAQ}c3-rotulos-near.md`, RAIZ), "utf8");
const HTML = readFileSync(new URL(`${PAQ}patron-enganche-c3-v1.html`, RAIZ), "utf8");

export const A6JS = JSON.parse(HTML.match(/^const CODIGO = (\{.*\});$/m)[1]).a6[0];
export const A6CSS = JSON.parse(HTML.match(/^const CODIGO = (\{.*\});$/m)[1]).a6[1];

const SECCION = NEAR.slice(NEAR.indexOf("## A6 · Devoluciones en periódico"), NEAR.indexOf("## Aviso para Mello"));
assert.ok(SECCION.startsWith("## A6"), "no está la sección «## A6» de los rótulos de Near");

/* Las filas de la tabla: [rótulo de Watari, texto de Near, palabras, INFLESZ]. */
const FILAS = SECCION.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| Rótulo") && !l.startsWith("| ---"))
  .map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));

/* Los «…» de una celda, en orden. */
const citas = (celda) => [...celda.matchAll(/«([^«»]*)»/g)].map((m) => m[1]);

function deNear(fila, k) {
  const f = FILAS.find((x) => x[0] === fila);
  assert.ok(f, `no está la fila «${fila}» en la tabla de A6 de Near`);
  const t = citas(f[1]);
  assert.ok(t[k] !== undefined, `la fila «${fila}» no trae el texto ${k + 1}`);
  return t[k];
}

/* clave → [fila de Near, posición en la celda, texto de Watari en su a6.js]. */
const MAPA = {
  devolver: ["Botón (P2)", 0, "Devolver la mercancía"],
  pelar: ["Botón (P4)", 0, "Devolver $2.400.000"],
  directo: ["Selector (P3)", 0, "Restar directo"],
  aparte: ["Selector (P3)", 1, "Cuenta aparte"],
  tituloEstado: ["Título de la miniatura", 0, "Estado de resultados · vendedor"],
  neto: ["«Ventas netas»", 0, "Ventas netas"],
  consignaP3: ["Consigna (P3)", 0, "Compara las dos formas de anotarla."],
  comprada: ["Barra", 0, "Mercancía comprada"],
  devuelta: ["Barra", 1, "Devuelta · 5 de junio"],
  queda: ["Barra", 2, "Se queda"],
  libroComprador: ["Libros", 0, "Libro de ${P.id === 'libro-del-comprador' ? 'Dajema' : 'El Tajamar'} · 5 de junio"],
  libroVendedor: ["Libros", 1, "Libro de ${P.id === 'libro-del-comprador' ? 'Dajema' : 'El Tajamar'} · 5 de junio"],
  comprador: ["Nombres", 0, "Dajema · comprador"],
  vendedor: ["Nombres", 1, "El Tajamar · vendedor"],
  j1: ["Selector (P8)", 0, "1 de junio"],
  j5: ["Selector (P8)", 1, "5 de junio"],
  consignaP8: ["Consigna (P8)", 0, "Cambia de fecha y mira cada línea."],
};

/* Los libros: Watari los arma con una plantilla; aquí, ya resueltos. */
const RESUELTO = { libroComprador: "Libro de Dajema · 5 de junio", libroVendedor: "Libro de El Tajamar · 5 de junio" };

export const ROTULOS_A6 = Object.fromEntries(Object.entries(MAPA).map(([k, [fila, i, watari]]) => {
  assert.ok(A6JS.includes(watari), `${k}: «${watari}» no está en el a6.js de Watari`);
  return [k, { watari: RESUELTO[k] ?? watari, near: deNear(fila, i) }];
}));

/* Las filas de Near que este ayudante lee: todas las de la tabla de A6. */
export const FILAS_NEAR_A6 = FILAS.map((f) => f[0]);
export const FILAS_LEIDAS = [...new Set(Object.values(MAPA).map((x) => x[0]))];
