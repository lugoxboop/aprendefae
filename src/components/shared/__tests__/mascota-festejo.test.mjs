import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FESTEJOS, MOVIMIENTOS, svgMarioneta, CARAS, CARA_DE_FESTEJO, OBJETOS } from "../../../mascota/marionetas.js";
import { FIESTA } from "../../../mascota/fiesta-piezas.js";
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

test("★★★ cada festejo tiene su frase, su movimiento y una cara alegre", () => {
  for (const f of FESTEJOS) {
    assert.ok(FRASES[f], `${f} sin frase`);
    assert.ok(MOVIMIENTOS.includes(f), `${f} no se puede pedir a <Mascota>`);
    /* La feliz de la especie, o una de las caras nuevas (todas alegres). */
    const cara = CARA_DE_FESTEJO[f] ? `c-${CARA_DE_FESTEJO[f]}` : "c-feliz";
    assert.match(ESTILO_MARIONETA, new RegExp(`\\.mta-${f} \\.mta-${cara}`), `${f} sin su cara (${cara})`);
    assert.match(ESTILO_MARIONETA, new RegExp(`\\.mta-${f} \\.mta-todo \\{ animation`), `${f} quieto`);
  }
});

test("★★★ las caras nuevas y los objetos de fiesta están en las seis especies", () => {
  for (const [, , n] of OBJETOS) assert.ok(FIESTA[n], `${n} sin pieza en fiesta-piezas.js`);
  for (const c of Object.values(CARAS)) {
    for (const n of [c.boca, ...(Array.isArray(c.ojos) ? c.ojos : [])]) {
      if (n && !["feliz", "abierto"].includes(n)) assert.ok(FIESTA[n], `${n} sin pieza`);
    }
  }
  for (const esp of ["zorro", "gato", "perro", "conejo", "huron", "hamster"]) {
    const { inner } = svgMarioneta(esp, { uid: esp });
    for (const c of Object.keys(CARAS)) assert.ok(inner.includes(`mta-c-${c}`), `${esp} sin la cara ${c}`);
    for (const [f, , n] of OBJETOS) {
      assert.ok(inner.includes(`mta-obj-${f}`) && inner.includes(`/mascotas/fiesta/${n}.webp`), `${esp} sin ${n} para ${f}`);
    }
    assert.ok(inner.includes("mta-birrete"), `${esp} sin birrete`);
  }
  for (const f of new Set(OBJETOS.map((o) => o[0]))) {
    assert.match(ESTILO_MARIONETA, new RegExp(`\\.mta-${f} \\.mta-obj-${f}`), `el objeto de ${f} no se muestra`);
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
