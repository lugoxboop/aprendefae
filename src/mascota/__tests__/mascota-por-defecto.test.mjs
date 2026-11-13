import { test } from "node:test";
import assert from "node:assert/strict";
import { especiePorDefecto, mascotaDe, irisDe, cuerpoMascota, IDS_ESPECIE, IDS_OJOS } from "../mascotas.js";

/*
 * La mascota de fábrica: todo estudiante tiene cara aunque no haya elegido.
 * Dos exigencias que esta prueba fija:
 *   · es ESTABLE —la misma identidad da siempre la misma especie—, no un azar
 *     que cambie en cada carga;
 *   · es una de las cuatro especies reales, nunca algo fuera del catálogo.
 */

test("la especie de fábrica es siempre una de las válidas", () => {
  for (const semilla of ["", "ana", "u_123", "Zoé", "99999", "perro-gato"]) {
    assert.ok(IDS_ESPECIE.includes(especiePorDefecto(semilla)), `${semilla} cae fuera del catálogo`);
  }
});

test("la misma semilla da siempre la misma especie (estable)", () => {
  assert.equal(especiePorDefecto("u_abc"), especiePorDefecto("u_abc"));
  assert.equal(especiePorDefecto("mariana"), especiePorDefecto("mariana"));
});

test("reparte entre varias especies, no todas al mismo cajón", () => {
  const vistas = new Set();
  for (let i = 0; i < 200; i++) vistas.add(especiePorDefecto("estudiante-" + i));
  assert.ok(vistas.size >= 2, "la de fábrica debería tocar más de una especie");
});

test("mascotaDe respeta la elegida cuando existe, con pelaje y ojos", () => {
  const perfil = { id: "u_1", mascota_especie: "huron", mascota_paleta: "gris", mascota_ojos: "azul" };
  assert.deepEqual(mascotaDe(perfil), { especie: "huron", paleta: "gris", ojos: "azul" });
});

test("mascotaDe cae en la de fábrica cuando no hay elegida, con paleta y ojos natural", () => {
  const perfil = { id: "u_sin_mascota" };
  const r = mascotaDe(perfil);
  assert.equal(r.especie, especiePorDefecto("u_sin_mascota"));
  assert.equal(r.paleta, "natural");
  assert.equal(r.ojos, "natural");
});

test("irisDe da el color de cada ojo, y el oscuro con natural/vacío", () => {
  assert.equal(irisDe(null), "#241d17");
  assert.equal(irisDe("natural"), "#241d17");
  assert.equal(irisDe("disparate"), "#241d17");
  for (const id of IDS_OJOS) {
    assert.match(irisDe(id), /^#[0-9A-Fa-f]{6}$/, `${id} tiene color`);
    assert.notEqual(irisDe(id), "#241d17", `${id} no es el oscuro`);
  }
});

test("cuerpoMascota pinta el iris del color de ojos pedido", () => {
  const svg = cuerpoMascota("gato", { ojos: "azul" });
  assert.ok(svg.includes(irisDe("azul")), "el SVG lleva el iris azul");
  const oscuro = cuerpoMascota("gato", {});
  assert.ok(oscuro.includes("#241d17"), "sin ojos elegidos, iris oscuro");
});

test("una especie elegida fuera del catálogo no se usa; cae en la de fábrica", () => {
  const perfil = { id: "u_2", mascota_especie: "dragon" };
  assert.equal(mascotaDe(perfil).especie, especiePorDefecto("u_2"));
});
