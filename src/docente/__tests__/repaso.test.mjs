import test from "node:test";
import assert from "node:assert/strict";

import {
  MINIMO_PARA_REPASO,
  UMBRAL_DIFICIL_PCT,
  guionDeRepaso,
  hayRepaso,
  preguntasDificiles,
} from "../repaso.js";

/*
 * La regla es de Kahoot y está publicada: por debajo del 35 % de acierto una
 * pregunta es «difícil», y el botón sale con tres o más. Estas pruebas atan
 * los dos números a su comportamiento para que nadie los mueva sin querer: el
 * día que el umbral suba o baje, lo que falla es esto y no el panel de un
 * profesor en mitad de una clase.
 */

const item = (id, veces, fallos, top = null, topVeces = 0) => ({
  item_id: id,
  veces,
  fallos,
  pct_fallo: (fallos / veces) * 100,
  respuesta_top: top,
  respuesta_top_veces: topVeces,
});

test("solo entran las que acertó menos del 35 %", () => {
  const items = [
    item("q1", 20, 18), /* 10 % de acierto */
    item("q2", 20, 13), /* 35 % justo: NO entra, el corte es estricto */
    item("q3", 20, 14), /* 30 % */
    item("q4", 20, 2), /*  90 % */
  ];
  const d = preguntasDificiles(items);
  assert.deepEqual(d.map((p) => p.item_id), ["q1", "q3"]);
  assert.ok(d.every((p) => p.pctAcierto < UMBRAL_DIFICIL_PCT));
});

test("van de la peor a la menos mala", () => {
  const d = preguntasDificiles([item("a", 10, 7), item("b", 10, 10), item("c", 10, 9)]);
  assert.deepEqual(d.map((p) => p.item_id), ["b", "c", "a"]);
});

test("una pregunta sin nombre cuenta igual y se muestra por su id", () => {
  const d = preguntasDificiles([item("q-sin-nombre", 10, 9)], () => null);
  assert.equal(d.length, 1);
  assert.equal(d[0].etiqueta, null);
  assert.match(guionDeRepaso({ actividadNombre: "X", dificiles: d }), /q-sin-nombre/);
});

test("sin intentos no hay pregunta difícil", () => {
  assert.equal(preguntasDificiles([item("q", 0, 0)]).length, 0);
  assert.equal(preguntasDificiles([]).length, 0);
});

test("el pct_fallo se recalcula si no viene, en vez de descartar la pregunta", () => {
  const d = preguntasDificiles([{ item_id: "q", veces: 10, fallos: 9, pct_fallo: null }]);
  assert.equal(d.length, 1);
  assert.equal(Math.round(d[0].pctAcierto), 10);
});

test("el repaso solo se ofrece con el mínimo de Kahoot", () => {
  const dos = preguntasDificiles([item("a", 10, 9), item("b", 10, 9)]);
  assert.equal(hayRepaso(dos), false);
  const tres = preguntasDificiles([item("a", 10, 9), item("b", 10, 9), item("c", 10, 9)]);
  assert.equal(tres.length, MINIMO_PARA_REPASO);
  assert.equal(hayRepaso(tres), true);
});

test("el guion lleva enunciado, cuántos fallaron y el error más común", () => {
  const dificiles = preguntasDificiles(
    [item("q1", 20, 18, "Se acredita", 11), item("q2", 20, 15), item("q3", 20, 14)],
    (id) => ({ q1: "¿Debe o haber?", q2: "¿Gasto o pago?", q3: "¿Entra o sale de caja?" })[id] ?? null
  );
  const g = guionDeRepaso({ actividadNombre: "Cuentas T2", dificiles, fecha: new Date("2026-10-28T12:00:00Z") });

  assert.match(g, /Repaso · Cuentas T2/);
  assert.match(g, /3 preguntas que la clase falló/);
  assert.match(g, /2026-10-28/);
  assert.match(g, /1\. ¿Debe o haber\?/);
  assert.match(g, /Acertó el 10% \(2 de 20\)/);
  assert.match(g, /Se equivocan sobre todo con «Se acredita» \(11 veces\)/);
  /* Sin respuesta top no se inventa una línea vacía. */
  assert.ok(!/«null»/.test(g));
});

test("el guion es texto plano: va a una diapositiva o a un chat, no a un renderizador", () => {
  const d = preguntasDificiles([item("a", 10, 9), item("b", 10, 9), item("c", 10, 9)]);
  const g = guionDeRepaso({ actividadNombre: "X", dificiles: d });
  assert.ok(!/\*\*|^#|\[.*\]\(/m.test(g), g);
});

test("una vez en singular, varias veces en plural", () => {
  const d = preguntasDificiles([item("a", 10, 9, "mal", 1), item("b", 10, 9), item("c", 10, 9)]);
  assert.match(guionDeRepaso({ actividadNombre: "X", dificiles: d }), /\(1 vez\)/);
});
