/*
 * Gestión de Proyectos como Macroeconomía (28-nov): cada tema con sus dos
 * mitades. Lo que se vigila: ningún reto se queda fuera de su capítulo y
 * ningún proceso se queda sin fila en Aprender (pieza o «Próximamente»).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULOS } from "../estructura.js";
import { hacerVisibles } from "../Hacer.jsx";
import { aprenderDeModulo, gruposDeHacer, capituloDeSubtema } from "../temas.js";

test("cada reto visible cae en exactamente un capítulo, en orden de la guía", () => {
  for (const m of MODULOS) {
    const vis = hacerVisibles(m.id);
    const grupos = gruposDeHacer(vis);
    assert.equal(grupos.reduce((n, g) => n + g.piezas.length, 0), vis.length, m.id);
    const caps = grupos.map((g) => g.cap);
    assert.deepEqual(caps, [...caps].sort((a, b) => a - b), m.id);
    assert.ok(caps.every((c) => c >= 1 && c <= 13), `${m.id}: capítulo fuera de la guía`);
  }
});

test("cada proceso de un tema tiene su fila en Aprender: una pieza o «Próximamente»", () => {
  for (const m of MODULOS) {
    const { listas, proximas } = aprenderDeModulo(m.id);
    const cubiertos = new Set([...listas.flatMap((p) => p.subtemas), ...proximas.flatMap((g) => g.procesos.map((p) => p.id))]);
    for (const pr of m.procesos) assert.ok(cubiertos.has(pr.id), `${m.id}: ${pr.id} sin fila`);
    for (const pr of m.procesos) assert.ok(capituloDeSubtema(pr.id) != null, pr.id);
  }
  assert.equal(aprenderDeModulo("gp-fundamentos").listas[0].clase, "video");
  assert.ok(aprenderDeModulo("gp-inicio").listas.some((p) => p.clase === "simulador"));
});
