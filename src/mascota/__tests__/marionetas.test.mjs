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
    assert.doesNotMatch(nat, /_p\.webp|<filter id="mta-pel/, `${id} natural no debe teñir`);
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

test("★ busto y cuerpo entero caben en la proporción del recuadro (140 × 150)", () => {
  for (const { id } of ESPECIES) {
    for (const busto of [true, false]) {
      const [, , w, h] = svgMarioneta(id, { busto }).viewBox.split(" ").map(Number);
      assert.ok(Math.abs(w / h - 140 / 150) < 0.01, `${id}: ${busto ? "busto" : "cuerpo"} ${w}×${h}`);
    }
  }
});

/*
 * LOS ACCESORIOS: cada uno que se vende tiene cómo ponerse, sus piezas existen,
 * y puesto encima no rompe el recuadro.
 */
import { ACCESORIOS_META } from "../mascotas.js";
import { ACCESORIOS_MARIONETA, PIEZAS_ACCESORIO, chocaCon } from "../accesorios-marioneta.js";
import { PRECIO_ACCESORIO } from "../../cristales/cristales.js";

test("★ todo accesorio de la tienda tiene precio, se pone en la marioneta y sus piezas existen", () => {
  assert.deepEqual(ACCESORIOS_META.map((a) => a.id).sort(), Object.keys(PRECIO_ACCESORIO).sort());
  for (const { id } of ACCESORIOS_META) {
    const A = ACCESORIOS_MARIONETA[id];
    assert.ok(A, `${id} no sabe ponerse`);
    /* Las piezas de sus partes y, si va armado (audífonos), las del armado. */
    for (const pieza of [...A.partes.map((pt) => pt.pieza), ...(A.piezasRig || [])]) {
      assert.ok(PIEZAS_ACCESORIO[pieza], `${id}: falta ${pieza} en PIEZAS_ACCESORIO`);
      assert.ok(existsSync(fileURLToPath(new URL(`../../../public/mascotas/accesorios/${pieza}.webp`, import.meta.url))), `${id}: falta ${pieza}.webp`);
    }
  }
});

test("★ puesto en cada especie, el accesorio se pinta y el recuadro sigue en 140 × 150", () => {
  for (const { id: esp } of ESPECIES) {
    for (const { id } of ACCESORIOS_META) {
      for (const busto of [true, false]) {
        const r = svgMarioneta(esp, { puestos: [id], busto });
        assert.match(r.inner, new RegExp(`mta-acc-${id}"`), `${esp}: no se pinta ${id}`);
        const [, , w, h] = r.viewBox.split(" ").map(Number);
        assert.ok(Math.abs(w / h - 140 / 150) < 0.01, `${esp}/${id}: ${w}×${h}`);
        assert.doesNotMatch(r.inner, /NaN|undefined/, `${esp}/${id}: coordenada rota`);
      }
    }
    assert.doesNotMatch(svgMarioneta(esp, { puestos: ["no-existe"] }).inner, /mta-acc/);
  }
});

test("★ dos sombreros no se llevan a la vez; un sombrero y unas gafas, sí", () => {
  assert.deepEqual(chocaCon("pirata", ["gorro", "gafas", "capa"]), ["gorro"]);
  assert.deepEqual(chocaCon("gafas_sol", ["gorro", "gafas"]), ["gafas"]);
  assert.deepEqual(chocaCon("medalla", ["traje", "bufanda"]), []);
});

/* 0174: los ojos de otro color y el cuerpo a medida. */
test("★ los ojos elegidos pasan por el filtro del iris (menos el hurón, que los lleva en la cara)", () => {
  for (const { id } of ESPECIES) {
    const t = svgMarioneta(id, { uid: "o", iris: "#3E7CC2", bicolor: true }).inner;
    if (id === "huron") { assert.doesNotMatch(t, /mta-iris-o/, "el hurón no se tiñe"); continue; }
    assert.match(t, /<filter id="mta-iris-o"/, `${id}: sin filtro de iris`);
    assert.match(t, /<filter id="mta-iris-o-2"/, `${id}: bicolor sin segundo filtro`);
    assert.match(t, /filter="url\(#mta-iris-o-2\)"/, `${id}: ningún ojo usa el segundo color`);
  }
  assert.doesNotMatch(svgMarioneta("gato", { uid: "o" }).inner, /mta-iris/, "sin ojos elegidos, sin filtro");
});

test("★ el cuerpo a medida ensancha el torso y crece la cabeza sin despegarla del cuello", async () => {
  const { marionetaAjustada } = await import("../marionetas.js");
  const { PIEZAS } = await import("../marionetas-piezas.js");
  for (const { id } of ESPECIES) {
    const M = MARIONETAS[id], P = PIEZAS[id];
    const gordo = svgMarioneta(id, { uid: "c", complexion: 2 }).inner;
    assert.match(gordo, /scale\(1\.22 1\)/, `${id}: gordito ensancha el torso`);
    const { M: G } = marionetaAjustada(M, P, { cabeza: 2 });
    const [cw, ch] = P.piezas[M.cabeza.base[0]];
    const barbilla = (m) => m.cabeza.en[1] + ch * m.cabeza.en[2];
    const centro = (m) => m.cabeza.en[0] + (cw * m.cabeza.en[2]) / 2;
    assert.ok(Math.abs(barbilla(G) - barbilla(M)) < 0.01, `${id}: la barbilla no se mueve`);
    assert.ok(Math.abs(centro(G) - centro(M)) < 0.01, `${id}: la cabeza sigue centrada`);
    assert.ok(G.cabeza.en[2] > M.cabeza.en[2], `${id}: cabezón es más grande`);
  }
});

test("★ el perro lleva la cabeza montada sobre los hombros, como los demás (21-nov)", async () => {
  const { PIEZAS } = await import("../marionetas-piezas.js");
  const M = MARIONETAS.perro, P = PIEZAS.perro;
  const [cw, ch] = P.piezas[M.cabeza.base[0]];
  const [, , hy, hs] = [0, ...M.cabeza.en];
  const solape = hy + ch * hs - M.torso[2];
  const proporcion = (cw * hs) / P.piezas[M.torso[0]][0];
  assert.ok(solape >= 45, `la barbilla tapa el corte del torso (solape ${solape.toFixed(0)} px)`);
  assert.ok(proporcion <= 1.75, `cabeza no más de 1,75 veces el cuerpo (${proporcion.toFixed(2)})`);
});
