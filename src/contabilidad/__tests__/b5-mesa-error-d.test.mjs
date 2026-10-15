import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DEVOLUCIÓN D DE LA MESA NOMBRA LA CUENTA (Sakuta, calidad 1).
 *
 *   · una que sobra y una que falta: «No va {X}: en su lugar va {Y}.»
 *   · solo sobran: «Sobra {X}.» o «Sobran {X} y {Y}.»
 *   · después, el texto D de los datos sin «Sobra una cuenta.»
 *
 * Los casos, con las frases escritas enteras: el caso que encontró Sakuta en
 * b5-t6-a2 (el gasto en vez de la provisión), solo sobran (una y dos), y los
 * textos D de las tres actividades que usan la mesa.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { evaluarParte, textoD } = await import("../cierreConMesa.js");
const A2 = await import("../../data/contabilidadT6Act2.js");
const A3 = await import("../../data/contabilidadT6Act3.js");
const T5 = await import("../../data/contabilidadT5Act2.js");

const d = (cuenta, valor) => ({ cuenta, lado: "debe", valor });
const hb = (cuenta, valor) => ({ cuenta, lado: "haber", valor });
const castigo = A2.PARTES_T6_ACT2[0];

test("★★★ una sobra y una falta: «No va {X}: en su lugar va {Y}.», y sigue el texto D sin «Sobra una cuenta.» (el caso de Sakuta en b5-t6-a2)", () => {
  const r = evaluarParte(castigo, [d(A2.GASTO, 180000), hb(A2.CLIENTES, 180000)]);
  assert.equal(r.error, "D");
  assert.equal(r.texto, "No va Gasto provisiones – cuentas incobrables: en su lugar va Provisión para deudas incobrables. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.");
});

test("★★★ solo sobran: «Sobra {X}.» con una, «Sobran {X} y {Y}.» con dos, y el texto D sin su primera frase", () => {
  const una = evaluarParte(castigo, [d(A2.PROVISION, 180000), hb(A2.CLIENTES, 180000), d(A2.CAJA, 0)]);
  assert.equal(una.texto, "Sobra Caja. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.");
  const dos = evaluarParte(castigo, [d(A2.PROVISION, 180000), hb(A2.CLIENTES, 180000), d(A2.CAJA, 0), d(A2.GASTO, 0)]);
  assert.equal(dos.texto, "Sobran Caja y Gasto provisiones – cuentas incobrables. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.");
});

test("★★ «Sobran X e Y» cuando la segunda empieza por i: «Caja e Inversiones – títulos»", () => {
  const p = T5.PARTES_T5_ACT2[1];
  const t = textoD(p, [...p.asiento, d("Bancos", 0), d("Ingresos por intereses", 0)]);
  assert.ok(t.startsWith("Sobran Bancos e Ingresos por intereses. "), t);
});

test("★★ los textos D de la mesa: los del Tema 6 empiezan con «Sobra una cuenta.»; los dos del T5 que no, se dejan enteros detrás de la cuenta", () => {
  const partes = [...A2.PARTES_T6_ACT2, ...A3.PARTES_T6_ACT3, ...T5.PARTES_T5_ACT2];
  const distintos = partes.filter((p) => !p.errores.D.startsWith("Sobra una cuenta. ")).map((p) => p.errores.D);
  assert.deepEqual(distintos, T5.PARTES_T5_ACT2.filter((p) => p.errores.D.startsWith("Este hecho solo mueve")).map((p) => p.errores.D));
  assert.equal(distintos.length, 2);
  for (const p of partes) {
    const t = textoD(p, [...p.asiento, d("Bancos", 0)]);
    assert.ok(t.startsWith("Sobra Bancos. "), p.id);
    assert.ok(!t.includes("Sobra una cuenta."), `${p.id}: sin la frase vieja`);
    assert.ok(t.endsWith(p.errores.D.replace(/^Sobra una cuenta\. /, "")), `${p.id}: sigue el texto D`);
  }
});

test("★★★ dos de más y dos de menos (b5-t5-a2, asientos de tres cuentas): «No van X ni W: en su lugar van Y y Z.», sin emparejar al azar (condición de Shoko)", () => {
  const p = T5.PARTES_T5_ACT2.find((x) => x.asiento.length >= 3);
  const [a, b, ...resto] = p.asiento;
  const t = textoD(p, [...resto, d("Bancos", 0), d("Gastos financieros – pérdida en venta de títulos", 0)].map((x) => x));
  assert.ok(t.startsWith(`No van Bancos ni Gastos financieros – pérdida en venta de títulos: en su lugar van ${a.cuenta} ${/^h?i(?![aeoáéó])/i.test(b.cuenta) ? "e" : "y"} ${b.cuenta}. `), t);
});

test("★★ distinto número de más y de menos: «Sobra X.» y luego «Falta Y.»/«Faltan Y y Z.»", () => {
  const t = textoD(castigo, [d(A2.GASTO, 0), d(A2.CAJA, 0)]);
  assert.ok(t.startsWith("Sobran Gasto provisiones – cuentas incobrables y Caja. Faltan Provisión para deudas incobrables y Cuentas por cobrar – clientes. ") === false, "dos y dos van como cambio, no como sobra/falta");
  const u = textoD(castigo, [d(A2.GASTO, 0), d(A2.CAJA, 0), hb(A2.CLIENTES, 0)]);
  assert.ok(u.startsWith("Sobran Gasto provisiones – cuentas incobrables y Caja. Falta Provisión para deudas incobrables. "), u);
});
