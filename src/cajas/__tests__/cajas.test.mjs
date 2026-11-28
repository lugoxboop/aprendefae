import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

/*
 * Las cajas sorpresa: el cliente (cajas.js y cosmeticos-caja.js) y la base
 * (0178) tienen que decir lo mismo —precios, probabilidades, reembolsos y qué
 * cosmético es de qué rareza—. Si se separan, la tienda enseñaría unas
 * probabilidades y la base sortearía otras.
 */
const sql = readFileSync(new URL("../../../supabase/migrations/0178_cajas_sorpresa.sql", import.meta.url), "utf8");
const { CAJAS, REEMBOLSO, porcentaje, tiraDeRuleta, LARGO_TIRA, GANADOR, contenidoDe } = await import("../cajas.js");
const { COSMETICOS_CAJA, RAREZAS_CAJA, TINTES, cosmeticosDeRareza, filtroTinte, svgAura } = await import("../../mascota/cosmeticos-caja.js");
const { ACCESORIOS_MARIONETA, ranuraDe, chocaCon, piezasAccesorios } = await import("../../mascota/accesorios-marioneta.js");
const { PRECIO_ACCESORIO } = await import("../../cristales/cristales.js");
const { esAccesorio } = await import("../../mascota/mascotas.js");

test("cada caja cuesta lo mismo en el cliente y en la base", () => {
  for (const c of CAJAS) assert.match(sql, new RegExp(`when '${c.id}'\\s+then ${c.precio}\\b`), c.id);
});

test("las probabilidades suman 1000 y son las de la base", () => {
  for (const c of CAJAS) {
    const suma = Object.values(c.probabilidades).reduce((a, b) => a + b, 0);
    assert.equal(suma, 1000, c.id);
    for (const [r, pm] of Object.entries(c.probabilidades)) {
      assert.match(sql, new RegExp(`when '${c.id}:${r}'\\s+then ${pm}\\b`), `${c.id}:${r}`);
    }
  }
  assert.equal(porcentaje("normal", "elite"), "0,2 %");
  assert.equal(porcentaje("legendaria", "normal"), "0 %");
  assert.equal(contenidoDe("legendaria").some((r) => r.id === "normal"), false, "la Legendaria no trae Normales");
});

test("los reembolsos son los de la base", () => {
  for (const [r, v] of Object.entries(REEMBOLSO)) assert.match(sql, new RegExp(`when '${r}'\\s+then ${v}\\b`), r);
});

test("cada rareza trae los mismos cosméticos en el cliente y en la base", () => {
  for (const r of RAREZAS_CAJA) {
    const bloque = sql.match(new RegExp(`when '${r.id}' then array\\[([^\\]]*)\\]`));
    assert.ok(bloque, `la 0178 debe listar los de ${r.id}`);
    const enSql = [...bloque[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
    assert.deepEqual(enSql, cosmeticosDeRareza(r.id).map((c) => c.id).sort(), r.id);
    assert.ok(enSql.length > 0);
  }
});

test("los cosméticos de caja usan piezas que existen, no se venden sueltos y valen como accesorio", () => {
  const ids = new Set();
  for (const c of COSMETICOS_CAJA) {
    assert.ok(!ids.has(c.id), `repetido: ${c.id}`);
    ids.add(c.id);
    assert.ok(!(c.id in PRECIO_ACCESORIO), `${c.id} no se vende suelto`);
    assert.ok(esAccesorio(c.id), `${c.id} se puede llevar puesto`);
    if (c.esAura) continue;
    assert.ok(ACCESORIOS_MARIONETA[c.base], `${c.id}: la pieza ${c.base} existe`);
    assert.ok(TINTES[c.tinte], `${c.id}: el tinte ${c.tinte} existe`);
    assert.ok(existsSync(new URL(`../../../public/mascotas/accesorios/${c.base === "audifonos" ? "audifonos_arco" : c.base}.webp`, import.meta.url)));
  }
  assert.ok(COSMETICOS_CAJA.length >= 45, "hay variedad: al menos 45");
});

test("un cosmético de caja va en la ranura de su pieza; las auras en la suya", () => {
  assert.equal(ranuraDe("c_corona_oro"), "sombrero");
  assert.deepEqual(chocaCon("c_corona_oro", ["gorro", "gafas"]), ["gorro"]);
  assert.deepEqual(chocaCon("aura_fuego", ["aura_chispas", "capa"]), ["aura_chispas"]);
});

test("cada filtro y cada aura salen dibujados", () => {
  for (const t of Object.keys(TINTES)) assert.match(filtroTinte(t, "x"), new RegExp(`<filter id="mta-cos-${t}-x"`));
  for (const c of COSMETICOS_CAJA.filter((c) => c.esAura)) { const a = svgAura(c.tinte, [300, 400], [200, 300]); assert.ok(a.atras.length > 100 && a.frente.length > 100, c.id); }
});

test("la tira de la ruleta tiene el premio bajo la marca y es la misma con la misma semilla", () => {
  const t1 = tiraDeRuleta("rara", "c_corona_prisma", 42);
  const t2 = tiraDeRuleta("rara", "c_corona_prisma", 42);
  assert.equal(t1.length, LARGO_TIRA);
  assert.equal(t1[GANADOR], "c_corona_prisma");
  assert.deepEqual(t1, t2);
  const leg = tiraDeRuleta("legendaria", "aura_fuego", 3);
  const normales = new Set(cosmeticosDeRareza("normal").map((c) => c.id));
  assert.ok(leg.every((id) => !normales.has(id)), "la tira de la Legendaria no enseña Normales");
});
