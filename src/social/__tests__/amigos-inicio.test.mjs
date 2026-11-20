import { test } from "node:test";
import assert from "node:assert/strict";
import { modoDe } from "../useAmigosInicio.js";

test("con un amigo la fila muestra amigos, aunque haya sugerencias", () => {
  assert.equal(modoDe({ amigos: [{ apodo: "a" }], sugerencias: [{ apodo: "b" }] }), "amigos");
});
test("sin amigos y con sugerencias, muestra sugerencias", () => {
  assert.equal(modoDe({ amigos: [], sugerencias: [{ apodo: "b" }] }), "sugerencias");
});
test("sin nada no pinta la fila", () => {
  assert.equal(modoDe({}), "vacio");
});
