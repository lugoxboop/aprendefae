import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FESTEJOS, MOVIMIENTOS, svgMarioneta } from "../../../mascota/marionetas.js";
import { ESTILO_MARIONETA } from "../../../mascota/marioneta-estilo.js";
import { FRASES, FRASES_ANIMO, elegirFestejo } from "../MascotaFestejo.jsx";

/*
 * El festejo de cierre (pedido de Mateo, 19-nov): la mascota celebra al
 * terminar cualquier actividad, y no siempre con el mismo baile.
 */

test("★★★ nunca repite el festejo de la vez anterior", () => {
  let antes = elegirFestejo();
  for (let i = 0; i < 300; i++) {
    const ahora = elegirFestejo();
    assert.notEqual(ahora, antes);
    assert.ok(FESTEJOS.includes(ahora));
    antes = ahora;
  }
});

test("★★ con el tiempo salen todos los festejos, no dos de siempre", () => {
  const vistos = new Set();
  for (let i = 0; i < 300; i++) vistos.add(elegirFestejo());
  assert.deepEqual([...vistos].sort(), [...FESTEJOS].sort());
});

test("★★★ cada festejo tiene su frase, su movimiento y la cara feliz", () => {
  for (const f of FESTEJOS) {
    assert.ok(FRASES[f], `${f} sin frase`);
    assert.ok(MOVIMIENTOS.includes(f), `${f} no se puede pedir a <Mascota>`);
    assert.match(ESTILO_MARIONETA, new RegExp(`\\.mta-${f} \\.mta-c-feliz`), `${f} sin cara feliz`);
    assert.match(ESTILO_MARIONETA, new RegExp(`\\.mta-${f} \\.mta-todo \\{ animation`), `${f} quieto`);
  }
});

test("★★ las seis especies llevan notas, corazones y estrellas para festejar", () => {
  for (const esp of ["zorro", "gato", "perro", "conejo", "huron", "hamster"]) {
    const { inner } = svgMarioneta(esp, { uid: esp });
    for (const cls of ["mta-notas", "mta-corazones", "mta-estrellas"]) assert.ok(inner.includes(cls), `${esp} sin ${cls}`);
  }
});

test("★★★ lo que dice la mascota nunca reprocha ni habla de retroceso", () => {
  const todo = [...Object.values(FRASES), ...FRASES_ANIMO].join(" ");
  assert.doesNotMatch(todo, /bajaste|retroced|perdiste|error|mal\b|fallaste|repasa/i);
  const fuente = readFileSync(new URL("../MascotaFestejo.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, /#e76f51/i, "sin coral");
});
