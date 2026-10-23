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

test("RT1 · el inventario cubre las 7 Hacer de T3, y cada una tiene subtema fijo o regla, nunca los dos", () => {
  assert.equal(HACER_T3.length, 7);
  assert.deepEqual(S.INVENTARIO_T3.map((a) => a.actividad).sort(), [...HACER_T3].sort());
  const etiquetadas = [...Object.keys(S.SUBTEMA_FIJO_T3), ...Object.keys(S.SUBTEMA_REGLA_T3)];
  assert.deepEqual(etiquetadas.sort(), [...HACER_T3].sort());
});

test("RT2 · la regla de El mismo hecho usa exactamente los pares del banco, en los dos escenarios de Miyata", () => {
  const regla = S.SUBTEMA_REGLA_T3["t3-mismo-hecho"];
  assert.deepEqual(Object.keys(regla).sort(), S.valoresDeRegla("t3-mismo-hecho").map(String).sort());
  assert.deepEqual({ ...regla }, { maquina: "Ajuste acumulado", equipos: "Ajuste acumulado", arriendo: "Ajuste diferido", servicio: "Ajuste diferido" });
});

test("RT3 · las claves de historial son `${actividad}:${item}`, únicas, con los ids del banco", () => {
  const todas = S.INVENTARIO_T3.flatMap((a) => S.clavesDe(a.actividad));
  assert.equal(new Set(todas).size, todas.length);
  assert.equal(todas.length, 11 + 6 + 4 + 7 + 7 + 5 + 6);
  assert.ok(S.clavesDe("t3-cierre-completo").includes("t3-cierre-completo:t3a7-san-calixto:3"));
  assert.ok(S.clavesDe("t3-mismo-hecho").includes("t3-mismo-hecho:maquina"));
});

test("RT4 · cada ítem de cada banco tiene subtema, con los nombres literales de Miyata", () => {
  const MIYATA = ["Ingreso y cobro", "Gasto y pago", "Causación", "Ajuste acumulado", "Ajuste diferido", "Reparto por periodos", "Cierre del periodo", "Resultado y caja"];
  for (const a of S.INVENTARIO_T3) {
    for (const x of a.banco) assert.ok(MIYATA.includes(S.subtemaDeT3(a.actividad, a.item(x))), `${a.actividad} · ${a.item(x)}`);
  }
  assert.throws(() => S.subtemaDeT3("t3-mismo-hecho", "inventado"), /Sin subtema/);
});

test("RT5 · las condiciones de Kamogawa: ni «Impuesto y utilidad neta» ni los dos Hacer que aún no existen", () => {
  const nombres = [...Object.values(S.SUBTEMA_FIJO_T3), ...Object.values(S.SUBTEMA_REGLA_T3).flatMap((r) => Object.values(r))];
  assert.ok(!nombres.some((n) => /Impuesto/.test(n)));
  for (const nuevo of ["t3-gasto-o-pago", "t3-del-resultado-a-la-caja"]) {
    assert.ok(!(nuevo in S.SUBTEMA_FIJO_T3) && !(nuevo in S.SUBTEMA_REGLA_T3), nuevo);
  }
});
