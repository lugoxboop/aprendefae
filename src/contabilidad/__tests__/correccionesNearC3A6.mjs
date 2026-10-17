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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL §5 DE MELLO, CERRADO POR NEAR (c3-mello-near.md): los textos nuevos de
 * «## A6 · lado a lado» y «## A6 · dos cuentas propias», letra por letra de
 * sus tablas. Falla si falta la sección, la fila o el «…».
 * ═══════════════════════════════════════════════════════════════════════════
 */
const N5 = readFileSync(new URL(`${PAQ}c3-mello-near.md`, RAIZ), "utf8");

function tablaN5(titulo) {
  const ini = N5.indexOf(`\n${titulo}`);
  assert.ok(ini >= 0, `no está «${titulo}» en c3-mello-near.md`);
  const fin = N5.indexOf("\n## ", ini + 1);
  const filas = N5.slice(ini, fin < 0 ? undefined : fin).split("\n")
    .filter((l) => l.startsWith("| ") && !l.startsWith("| Campo") && !l.startsWith("| ---"))
    .map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
  return (campo) => filas.filter((f) => f[0] === campo).map((f) => {
    const t = citas(f[1]);
    assert.equal(t.length, 1, `«${campo}» de «${titulo}» no trae un texto entre «»`);
    return t[0];
  });
}

const LADO = tablaN5("## A6 · lado a lado (N-2)");
const DOS = tablaN5("## A6 · dos cuentas propias (N-1 y N-2)");
const uno = (f, campo) => { const t = f(campo); assert.equal(t.length, 1, campo); return t[0]; };

export const NEAR_N5_A6 = {
  ladoALado: { correcta: uno(LADO, "Opción correcta"), otras: LADO("Opción") },
  dosCuentas: {
    texto: uno(DOS, "Texto"),
    pregunta: uno(DOS, "Pregunta"),
    correcta: uno(DOS, "Opción correcta"),
    otras: DOS("Opción"),
    noCambia: uno(DOS, "Devolución («no cambia»)"),
    noSeTocan: uno(DOS, "Devolución («no se tocan»)"),
    bien: uno(DOS, "Acierto"),
  },
};
assert.equal(NEAR_N5_A6.ladoALado.otras.length, 2);
assert.equal(NEAR_N5_A6.dosCuentas.otras.length, 2);
