import test from "node:test";
import assert from "node:assert/strict";
import { tabla, esDuelo, limpiarCodigo, restanteMs, faltaParaAbrir, faltaSiguiente, mensajeSala } from "../datos.js";

test("la tabla ordena por puntos y los empates comparten puesto", () => {
  const t = tabla([
    { apodo: "b", puntos: 900, aciertos: 1 }, { apodo: "a", puntos: 900, aciertos: 1 },
    { apodo: "c", puntos: 1800, aciertos: 2 }, { apodo: "d", puntos: 0, aciertos: 0 },
  ]);
  assert.deepEqual(t.map((j) => `${j.puesto}${j.apodo}`), ["1c", "2a", "2b", "4d"]);
});

test("un duelo es una sala de dos, contando a los invitados", () => {
  assert.equal(esDuelo({ jugadores: [{}], invitados: [{}] }), true);
  assert.equal(esDuelo({ jugadores: [{}, {}], invitados: [{}] }), false);
});

test("el código se limpia a seis cifras", () => assert.equal(limpiarCodigo("12-34 567"), "123456"));

test("los relojes salen del reloj del servidor", () => {
  const ahora = Date.parse("2026-11-20T12:00:00Z");
  const e = { estado: "pregunta", inicio: "2026-11-20T12:00:02Z", duracion_s: 20 };
  assert.equal(faltaParaAbrir(e, 0, ahora), 2000);
  assert.equal(restanteMs(e, 0, ahora), 20000);
  assert.equal(restanteMs(e, 0, ahora + 12000), 10000);
  assert.equal(faltaSiguiente({ estado: "resultados", fase_desde: "2026-11-20T12:00:00Z" }, 0, ahora + 3000), 4000);
});

test("los errores de la base llegan en palabras de estudiante", () => {
  assert.match(mensajeSala(new Error("La partida ya empezó")), /ya empezó/);
  assert.match(mensajeSala(new Error("codigo")), /código/);
});
