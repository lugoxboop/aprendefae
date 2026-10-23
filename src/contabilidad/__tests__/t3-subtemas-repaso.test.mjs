import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * El andamio del Repaso Diario de T3 (Célula E, issue #469): cubre las 7
 * Hacer, sus claves son las del detalle de cada actividad y las reglas usan
 * exactamente los valores de su banco.
 */
const S = await import("../../data/subtemasContabilidadT3.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");

const HACER_T3 = actividadesDeTipo(SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja"), HACER).map((a) => a.id);

test("RT1 · el inventario y la regla cubren las 7 Hacer de T3, ni una más", () => {
  assert.equal(HACER_T3.length, 7);
  assert.deepEqual(S.INVENTARIO_T3.map((a) => a.actividad).sort(), [...HACER_T3].sort());
  assert.deepEqual(Object.keys(S.SUBTEMA_REGLA_T3).sort(), [...HACER_T3].sort());
});

test("RT2 · las claves de cada regla son exactamente los valores de su banco", () => {
  for (const a of S.INVENTARIO_T3) {
    assert.deepEqual(Object.keys(S.SUBTEMA_REGLA_T3[a.actividad]).sort(), S.valoresDeRegla(a.actividad).map(String).sort(), a.actividad);
  }
});

test("RT3 · las claves de historial son `${actividad}:${item}`, únicas, con los ids del banco", () => {
  const todas = S.INVENTARIO_T3.flatMap((a) => S.clavesDe(a.actividad));
  assert.equal(new Set(todas).size, todas.length);
  assert.equal(todas.length, 11 + 6 + 4 + 7 + 7 + 5 + 6);
  assert.ok(S.clavesDe("t3-cierre-completo").includes("t3-cierre-completo:t3a7-san-calixto:3"));
  assert.ok(S.clavesDe("t3-mismo-hecho").includes("t3-mismo-hecho:maquina"));
});

test("RT4 · mientras falten los nombres de Miyata, lo pendiente se lista (no pasa en silencio)", () => {
  const pendientes = S.subtemasPendientesT3();
  const total = Object.values(S.SUBTEMA_REGLA_T3).reduce((n, r) => n + Object.keys(r).length, 0);
  assert.equal(pendientes.length, Object.values(S.SUBTEMA_REGLA_T3).flatMap((r) => Object.values(r)).filter((x) => !x).length);
  assert.ok(total >= pendientes.length);
});
