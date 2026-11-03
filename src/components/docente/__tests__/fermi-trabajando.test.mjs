import test from "node:test";
import assert from "node:assert/strict";
import { FASES, faseDe, relojDe } from "../FermiTrabajando.jsx";

/*
 * La espera es lo único que el profesor ve durante minutos. Si la fase o el
 * reloj se equivocan, el mensaje deja de informar y empieza a mentir, que es
 * peor que no decir nada.
 */

test("las fases cubren el encargo entero y ninguna pesa cero", () => {
  assert.ok(FASES.length >= 3);
  for (const f of FASES) {
    assert.ok(f.peso > 0, `${f.titulo} pesa cero`);
    assert.ok(f.titulo.trim().length > 0);
    assert.ok(f.notas.length >= 2, `${f.titulo} necesita al menos dos notas`);
  }
});

test("el avance recorre las fases en orden y nunca se sale", () => {
  let anterior = -1;
  for (let i = 0; i <= 100; i += 1) {
    const { indice, dentro } = faseDe(i / 100);
    assert.ok(indice >= anterior, "la fase no puede retroceder");
    assert.ok(indice >= 0 && indice < FASES.length);
    assert.ok(dentro >= 0 && dentro <= 1.0001);
    anterior = indice;
  }
});

test("los extremos caen en la primera y en la última fase", () => {
  assert.equal(faseDe(0).indice, 0);
  assert.equal(faseDe(1).indice, FASES.length - 1);
  /* Fuera de rango no revienta: se recorta. */
  assert.equal(faseDe(-3).indice, 0);
  assert.equal(faseDe(9).indice, FASES.length - 1);
});

test("el reloj se lee como un reloj", () => {
  assert.equal(relojDe(0), "0:00");
  assert.equal(relojDe(9_000), "0:09");
  assert.equal(relojDe(65_000), "1:05");
  assert.equal(relojDe(600_000), "10:00");
  /* Un arranque con el reloj del sistema corrido no muestra un negativo. */
  assert.equal(relojDe(-500), "0:00");
});
