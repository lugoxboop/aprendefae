import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SIMULADORES, AVISO_IA, PROBLEMAS_PE, veredictoLocal, explicacionLocal } from "../simulador/escenas.js";
import { IDS } from "../../../supabase/functions/simulador/escenarios/fiebre.js";

/* Las reglas de texto de la REGLA MAESTRA, medidas sobre el simulador. */
const palabras = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;

test("el letrero de IA dice exactamente lo que pidió Mateo", () => {
  assert.equal(AVISO_IA, "Esta actividad tiene inteligencia artificial aplicada");
});

for (const sim of Object.values(SIMULADORES)) {
  test(`${sim.id}: capacitación ≤ 20 palabras por globo, rol ≤ 15, consigna ≤ 12`, () => {
    for (const g of sim.capacitacion) assert.ok(palabras(g) <= 20, `«${g}» tiene ${palabras(g)}`);
    assert.ok(palabras(sim.rol) <= 15);
    assert.ok(palabras(sim.consigna("Valdoria del Norte")) <= 12);
  });

  test(`${sim.id}: los ids del sitio y del servidor son los mismos ocho`, () => {
    assert.deepEqual(PROBLEMAS_PE.map((p) => p.id).sort(), [...IDS].sort());
  });

  test(`${sim.id}: el archivo trae tres síntomas, ids válidos y no nombra el virus`, () => {
    for (const c of sim.archivo) {
      assert.equal(c.sintomas.length, 3);
      assert.ok(c.problemas.every((p) => IDS.includes(p)));
      const visible = [c.titular, c.testigo, ...c.sintomas.map((s) => s.dato)].join(" ");
      assert.doesNotMatch(visible, /\b(inflaci[oó]n|desempleo|d[eé]ficit|recesi[oó]n|desigualdad|gini)\b/i);
    }
  });
}

test("veredicto local y su explicación", () => {
  const v = veredictoLocal(["desempleo", "deficitFiscal"], ["desempleo"]);
  assert.equal(v.estado, "parcial");
  assert.match(explicacionLocal({ pais: "Ostrania", problemas: ["desempleo", "deficitFiscal"] }, v), /Déficit fiscal/);
});

test("el simulador solo se enciende en la vista previa, no en el tema publicado", () => {
  const tema = readFileSync(new URL("../TemaMacro2026.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(tema, /simulador:\s*true/);
  const previa = readFileSync(new URL("../VistaPrevia.jsx", import.meta.url), "utf8");
  assert.match(previa, /"pe26-a2-fiebre".*simulador: true/);
});

test("la clave de la IA no aparece en el código del sitio", () => {
  for (const f of ["../simulador/Simulador.jsx", "../simulador/api.js", "../simulador/escenas.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), "utf8"), /ANTHROPIC|sk-ant-/);
  }
});
