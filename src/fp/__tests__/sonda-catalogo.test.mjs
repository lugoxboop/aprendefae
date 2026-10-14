/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA SONDA DEL CATÁLOGO — su comparación, sin red
 *
 * La sonda vive en scripts/sonda-catalogo.mjs y corre después de cada
 * despliegue. Lo que se prueba aquí es su cabeza: `comparar`, que es pura.
 *
 * LA PRUEBA QUE MÁS IMPORTA ES LA PRIMERA. Antes de la 0150, PostgREST
 * respondía al catálogo con HTTP 200 y una lista vacía: éxito con cero filas.
 * Una sonda que trate eso como «no falta ninguna» sale verde para siempre sin
 * mirar nada, y es peor que no tenerla, porque da confianza. `comparar` tiene
 * que llamar a eso ILEGIBLE y no SANO.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { comparar, catalogoDelCliente } from "../../../scripts/sonda-catalogo.mjs";

const cli = (pares) => new Map(pares);
const fila = (activity_id, modalidad, dificultad, fp_base) => ({ activity_id, modalidad, dificultad, fp_base });
const UNO = cli([["a", { modalidad: "evaluativa", dificultad: "medio", fpBase: 25 }]]);

test("un servidor que responde con CERO filas es ilegible, nunca «sano»", () => {
  for (const vacio of [[], null, undefined]) {
    const r = comparar(UNO, vacio);
    assert.equal(r.ilegible, true, `${JSON.stringify(vacio)} tiene que ser ilegible`);
    /* Y no puede presentarse como salud: nada de «faltan 0, todo bien». */
    assert.deepEqual(r.faltan, []);
    assert.deepEqual(r.distintas, []);
  }
  /* Con una fila de verdad, deja de ser ilegible. */
  assert.equal(comparar(UNO, [fila("a", "evaluativa", "medio", 25)]).ilegible, false);
});

test("caza la actividad que el sitio ofrece y el servidor no tiene: es el incidente", () => {
  const r = comparar(cli([
    ["a", { modalidad: "evaluativa", dificultad: "medio", fpBase: 25 }],
    ["b", { modalidad: "evaluativa", dificultad: "facil", fpBase: 10 }],
  ]), [fila("a", "evaluativa", "medio", 25)]);
  assert.deepEqual(r.faltan, ["b"]);
  assert.deepEqual(r.distintas, []);
  assert.deepEqual(r.sobran, []);
});

test("caza la clasificación que no coincide, en cualquiera de los tres campos", () => {
  const base = cli([["a", { modalidad: "evaluativa", dificultad: "medio", fpBase: 25 }]]);
  for (const [nombre, f] of [
    ["los FP", fila("a", "evaluativa", "medio", 50)],
    ["la dificultad", fila("a", "evaluativa", "dificil", 25)],
    ["la modalidad", fila("a", "exploratoria", "medio", 25)],
  ]) {
    const r = comparar(base, [f]);
    assert.equal(r.distintas.length, 1, `tiene que cazar ${nombre}`);
    assert.match(r.distintas[0], /^a: el sitio dice/);
  }
  /* Los FP llegan como texto desde PostgREST en algunos clientes: no es un desajuste. */
  assert.deepEqual(comparar(base, [fila("a", "evaluativa", "medio", "25")]).distintas, []);
});

test("una fila que el sitio ya no ofrece es AVISO, no rojo: puede estar retirada a propósito", () => {
  const r = comparar(UNO, [fila("a", "evaluativa", "medio", 25), fila("vieja", "evaluativa", "facil", 10)]);
  assert.deepEqual(r.sobran, ["vieja"]);
  assert.deepEqual(r.faltan, []);
  assert.deepEqual(r.distintas, []);
});

test("el catálogo del cliente sale de subjects.js, sin las pendientes, y no está vacío", () => {
  const c = catalogoDelCliente();
  assert.ok(c.size > 50, `solo ${c.size} actividades: ¿se leyó subjects.js?`);
  for (const [id, v] of c) {
    assert.ok(typeof v.fpBase === "number" && v.fpBase > 0, `${id} sin FP`);
    assert.ok(["exploratoria", "evaluativa"].includes(v.modalidad), `${id}: ${v.modalidad}`);
  }
  /* Y el sano de verdad: el cliente contra sí mismo no tiene nada que reportar. */
  const filas = [...c].map(([id, v]) => fila(id, v.modalidad, v.dificultad, v.fpBase));
  const r = comparar(c, filas);
  assert.deepEqual([r.ilegible, r.faltan, r.distintas, r.sobran], [false, [], [], []]);
});
