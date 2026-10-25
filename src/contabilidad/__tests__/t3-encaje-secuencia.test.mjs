/*
 * La medición de encaje de T3 en SecuenciaAprender (scripts/t3/encaje-secuencia-t3.mjs,
 * #538) sigue leyendo las cuatro piezas publicadas. No afirma que quepan —eso
 * lo decide el montaje—, solo que la sonda no se quede midiendo un vacío si
 * una constante cambia de nombre.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { medir } from "../../../scripts/t3/encaje-secuencia-t3.mjs";

test("la medición cubre P1, P3, P4 y P5, con textos de verdad", () => {
  const { filas, piezas } = medir();
  assert.deepEqual(piezas.map((p) => p.pieza), ["P1", "P3", "P4", "P5"]);
  for (const clave of ["P1", "P3", "P4", "P5"]) {
    const suyas = filas.filter((f) => f.pieza === clave);
    assert.ok(suyas.length >= 20, `${clave}: ${suyas.length} filas`);
    assert.ok(suyas.every((f) => f.palabras > 0), `${clave}: hay un texto vacío`);
  }
});
