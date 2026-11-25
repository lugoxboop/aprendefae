/*
 * Macro 2026 · los objetos ilustrados (Gemini, paso 6): cada uno existe, es
 * WebP con alfa y mide lo que dice ilustrados.jsx (width/height fijos sin
 * deformar ni saltar al cargar).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ILUSTRADOS, rutaIlustrado } from "../comun/ilustrados.jsx";

const medidaWebp = (f) => {
  const b = readFileSync(`public${f}`);
  assert.equal(b.subarray(8, 12).toString(), "WEBP", f);
  const tipo = b.subarray(12, 16).toString();
  assert.equal(tipo, "VP8X", `${f}: sin alfa (${tipo})`);
  return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
};

test("ilustrados: cada objeto existe, con alfa y sus medidas", () => {
  for (const [id, m] of Object.entries(ILUSTRADOS)) assert.deepEqual(medidaWebp(rutaIlustrado(id)), m, id);
});
