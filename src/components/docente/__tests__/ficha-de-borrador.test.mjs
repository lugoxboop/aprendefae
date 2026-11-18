import test from "node:test";
import assert from "node:assert/strict";
import { fichaDe } from "../Fabrica.jsx";

/*
 * La línea de datos de una tarjeta. Importa que diga «Sin puntos»: todo
 * profesor pregunta cuánto vale la actividad, y las piezas de Aprender no
 * entran al catálogo de FP por regla del canon. Callarlo deja que lo
 * descubra después de publicar.
 */

const borrador = (pieza) => ({ id: 1, titulo: "T", pieza });

test("la ficha dice en qué estado está", () => {
  assert.match(fichaDe(borrador({}), false), /^Borrador/);
  assert.match(fichaDe(borrador({}), true), /^Publicada/);
});

test("la ficha siempre avisa que no da puntos", () => {
  assert.match(fichaDe(borrador({}), false), /Sin puntos/);
  assert.match(fichaDe(borrador({ pasos: [1, 2] }), true), /Sin puntos/);
});

test("cuenta pasos y términos cuando los hay, y se calla cuando no", () => {
  const llena = fichaDe(borrador({ pasos: [1, 2, 3], nombres: [1, 2] }), false);
  assert.equal(llena, "Borrador · 3 pasos · 2 términos · Sin puntos");
  /* Una pieza vieja sin esos campos no pinta «0 pasos». */
  assert.equal(fichaDe(borrador({}), false), "Borrador · Sin puntos");
  assert.equal(fichaDe(null, false), "Borrador · Sin puntos");
});
