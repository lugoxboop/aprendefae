import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ESPECIES, PALETAS_MASCOTA, tinteDe } from "../mascotas.js";
import { MARIONETAS, ANIMOS, svgMarioneta, tieneMarioneta, tablasPelaje } from "../marionetas.js";
import { PIEZAS } from "../marionetas-piezas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS MARIONETAS no se quedan sin pieza.
 *
 * Cada especie del selector tiene su marioneta; cada pieza que la marioneta
 * nombra existe en el recorte (PIEZAS) y en public/mascotas/ —con sus capas
 * _p y _f si es teñible—. Una pieza que falte sería un hueco en la cara de la
 * mascota de un estudiante, y en el navegador no da error: solo no se ve.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const publico = (esp, archivo) =>
  fileURLToPath(new URL(`../../../public/mascotas/${esp}/${archivo}`, import.meta.url));

function nombradas(M) {
  const C = M.cabeza;
  const listas = [
    [M.cola, M.torso, ...(M.piernas || []), ...(M.brazos || [])],
    [...(C.orejas || []), C.base],
    [...C.tranquila.ojos, ...(C.tranquila.resto || []), ...C.feliz, ...C.triste, ...C.racha],
  ];
  const n = new Set(listas.flat().filter(Boolean).map((p) => p[0]));
  n.add("llama");
  if (C.lagrima) n.add("lagrima");
  return [...n];
}

test("★ las seis especies del selector tienen marioneta", () => {
  for (const { id } of ESPECIES) assert.ok(tieneMarioneta(id), `${id} no tiene marioneta`);
});

test("★ toda pieza nombrada existe en el recorte y en public/mascotas", () => {
  for (const [esp, M] of Object.entries(MARIONETAS)) {
    for (const n of nombradas(M)) {
      const d = PIEZAS[esp].piezas[n];
      assert.ok(d, `${esp}: falta ${n} en PIEZAS`);
      assert.ok(existsSync(publico(esp, `${n}.webp`)), `${esp}: falta ${n}.webp`);
      if (d[2]) {
        assert.ok(existsSync(publico(esp, `${n}_p.webp`)), `${esp}: falta ${n}_p.webp`);
        assert.ok(existsSync(publico(esp, `${n}_f.webp`)), `${esp}: falta ${n}_f.webp`);
      }
    }
  }
});

test("★ natural pinta el arte tal cual; una paleta, por el filtro de pelaje", () => {
  for (const { id } of ESPECIES) {
    const nat = svgMarioneta(id, { uid: "t" }).inner;
    assert.doesNotMatch(nat, /_p\.webp|<filter/, `${id} natural no debe teñir`);
    for (const p of PALETAS_MASCOTA.filter((x) => x.id !== "natural")) {
      const t = svgMarioneta(id, { tinte: tinteDe(p.id), uid: "t" }).inner;
      assert.match(t, /<filter id="mta-pel-t"/, `${id}/${p.id} sin filtro`);
      assert.match(t, /_p\.webp/, `${id}/${p.id} sin capa de pelaje`);
    }
  }
});

test("★ cada ánimo tiene su cara, y las tablas del filtro son colores válidos", () => {
  assert.deepEqual(ANIMOS, ["tranquila", "feliz", "celebra", "triste", "racha"]);
  for (const { id } of ESPECIES) {
    const inner = svgMarioneta(id, { uid: "t" }).inner;
    for (const c of ["mta-c-tranquila", "mta-c-feliz", "mta-c-triste", "mta-c-racha"]) assert.ok(inner.includes(c), `${id}: falta ${c}`);
    for (const tabla of tablasPelaje(id, tinteDe("chocolate"))) {
      const v = tabla.split(" ").map(Number);
      assert.equal(v.length, 48);
      assert.ok(v.every((x) => x >= 0 && x <= 1), `${id}: tabla fuera de rango`);
    }
  }
});

test("★ el busto cabe en la proporción del recuadro (140 × 150)", () => {
  for (const { id } of ESPECIES) {
    const [, , w, h] = svgMarioneta(id, { busto: true }).viewBox.split(" ").map(Number);
    assert.ok(Math.abs(w / h - 140 / 150) < 0.01, `${id}: busto ${w}×${h}`);
  }
});
