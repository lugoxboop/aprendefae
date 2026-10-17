import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as W from "./c4WatariT73.mjs";
import * as MC4 from "./correccionesMelloC4T73.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-3 H1, H2, H4 y H5 — LA CONSECUENCIA PURA CONTRA LA DE WATARI.
 *
 * Fuente: patron-enganche-c4-v1.html (secciones «t73-h1», «t73-h2», «t73-h4»
 * y «t73-h5», y su f73.js, que esta prueba EJECUTA con c4WatariT73.mjs).
 * Para cada ítem y cada opción (y cifras escritas que no son ninguna
 * opción), la consecuencia de la casa (src/contabilidad/c4/t73h*_c4.js)
 * dice lo mismo que la figura de Watari con esa elección: la línea de falla
 * o de «cuadra», letra por letra, con la auditoría de Mello encima
 * (correccionesMelloC4T73.mjs: C4-2, C4-3 y C4-5). Las piezas montadas se
 * prueban en sus archivos (t7-3-descuento-en-factura, t7-3-cadena-de-
 * descuentos, t7-3-pago-a-tiempo y t7-3-ajuste-por-conteo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = {
  h1: [await import("../c4/t73h1_c4.js"), await import("../../data/contabilidadT7_3_h1.js"), "ITEMS_H1"],
  h2: [await import("../c4/t73h2_c4.js"), await import("../../data/contabilidadT7_3_h2.js"), "ITEMS_H2"],
  h4: [await import("../c4/t73h4_c4.js"), await import("../../data/contabilidadT7_3_h4.js"), "ITEMS_H4"],
  h5: [await import("../c4/t73h5_c4.js"), await import("../../data/contabilidadT7_3_h5.js"), "ITEMS_H5"],
};
const fuente = (f) => readFileSync(new URL(`../../../${f}`, import.meta.url), "utf8");
const lineaCasa = (e) => (e.falla ? { tipo: "falla", t: e.falla } : e.cuadra ? { tipo: "cuadra", t: e.cuadra } : null);
const eleccionDe = (I, o) => (I.tipo === "cifra" ? o.v : o.id);

/* Lo que la auditoría de Mello cambia de Watari: [pieza, ítem, elección] → la línea que debe ir. */
const CORREGIDO = (h, I, x, linea) => {
  if (h === "h1" && I.id === "iva" && x === MC4.C4_3_H1_IVA.distractor) return { tipo: "falla", t: MC4.C4_3_H1_IVA.debe };
  if (h === "h5" && I.id === "el-faltante" && x === MC4.C4_3_H5_FALTANTE.distractor) return { tipo: "falla", t: MC4.C4_3_H5_FALTANTE.debe };
  if (linea && h === "h2") return { ...linea, t: linea.t.replace("frente a el ", "frente al ") };
  return linea;
};

test("★★★ cada pieza es la de su sección: el id del catálogo, el objeto de Watari y el modo; los ítems y opciones, los de Near", () => {
  for (const [h, [C, D, nombre]] of Object.entries(P)) {
    const c4 = C.CONSECUENCIA_C4;
    assert.equal(c4.id, D[`${h.toUpperCase()}_ID`]);
    assert.equal(c4.objeto, W.C4P[`t73-${h}`].objeto);
    assert.equal(c4.modo, "hacer");
    assert.deepEqual(c4.items.map((i) => [i.id, i.tipo]), D[nombre].map((i) => [i.id, i.tipo === "asiento" ? "propio" : i.tipo === "cifra" ? "cifra" : "eleccion"]));
    for (const I of c4.items.filter((x) => x.tipo !== "propio")) {
      const it = D[nombre].find((x) => x.id === I.id);
      assert.deepEqual(I.opciones.map((o) => [o.id, o.correcta, o.msg]), [[String(it.correcta), true, null], ...it.distractores.map((d) => [String(d.valor), false, d.retro])], `${h} · ${I.id}`);
    }
  }
});

test("★★★ la línea de consecuencia de cada opción (y de cifras que no son opción) es la de Watari, letra por letra, con la auditoría de Mello", () => {
  let n = 0;
  let corregidas = 0;
  for (const [h, [C, D, nombre]] of Object.entries(P)) {
    const pieza = W.piezaHacer(D[nombre]);
    for (const [k, I] of pieza.items.entries()) {
      const casa = C.CONSECUENCIA_C4.items.find((x) => x.id === I.id);
      const extra = casa.tipo === "cifra" ? [1, I.correcta + 1000] : [];
      for (const x of [null, ...casa.opciones.map((o) => eleccionDe(casa, o)), ...extra]) {
        const e = C.CONSECUENCIA_C4.consecuencia(casa, x);
        /* En main, H2 es de un toque; Watari lo escribe: le pasa la cifra de la opción. */
        const xw = h === "h2" && x != null ? casa.opciones.find((o) => o.id === x).v : x;
        const Iw = h === "h2" ? { ...I, tipo: "cifra" } : I;
        const html = W.C4P[`t73-${h}`].figura(W.ctxDe(pieza, k), Iw, W.vDe(Iw, xw));
        const watari = W.lineaDe(html);
        const esperado = CORREGIDO(h, I, xw, watari);
        if (JSON.stringify(esperado) !== JSON.stringify(watari)) corregidas += 1;
        assert.deepEqual(lineaCasa(e), x == null ? null : esperado, `${h} · ${I.id} · ${x}`);
        n += 1;
      }
    }
  }
  assert.ok(n > 60, String(n));
  /* H1 iva, H5 el-faltante y las dos de H2 con «frente a el». */
  assert.equal(corregidas, 4);
});

test("★★★ C4-3 (Mello): lo que vio Mello en Watari ya no está; ninguna figura muestra montos negativos ni unidades fraccionarias", () => {
  const h1 = P.h1[0].CONSECUENCIA_C4;
  const h5 = P.h5[0].CONSECUENCIA_C4;
  const iva = h1.items.find((i) => i.id === "iva");
  const falt = h5.items.find((i) => i.id === "el-faltante");
  assert.equal(h1.consecuencia(iva, MC4.C4_3_H1_IVA.distractor).falla, MC4.C4_3_H1_IVA.debe);
  assert.equal(h5.consecuencia(falt, MC4.C4_3_H5_FALTANTE.distractor).falla, MC4.C4_3_H5_FALTANTE.debe);
  let n = 0;
  for (const [h, [C]] of Object.entries(P)) {
    for (const I of C.CONSECUENCIA_C4.items.filter((x) => x.tipo !== "propio")) {
      const extra = I.tipo === "cifra" ? [1, 999_999_999, ...I.opciones.map((o) => o.v + 1)] : [];
      for (const x of [null, ...I.opciones.map((o) => eleccionDe(I, o)), ...extra]) {
        const e = JSON.stringify(C.CONSECUENCIA_C4.consecuencia(I, x));
        assert.doesNotMatch(e, /\$-|-\d|−\$?\d+(?:[.,]\d+)*\s*%/, `${h} · ${I.id} · ${x}: ${e}`);
        assert.doesNotMatch(e, /"libros":-|"v":-/, `${h} · ${I.id} · ${x}`);
        /* Decimales solo en porcentajes («3,5 %») y en el factor de H2 («0,81»): ninguna cifra de pesos con coma. */
        for (const m of e.matchAll(/\$[\d.]+,\d+/g)) assert.fail(`${h} · ${I.id} · ${x}: ${m[0]}`);
        n += 1;
      }
    }
  }
  assert.ok(n > 60, String(n));
});

test("★★★ C4-2 y C4-5 (Mello): «Tu cifra» solo en los ítems de cifra de H4; «frente al» en H2", async () => {
  const h4 = P.h4[0].CONSECUENCIA_C4;
  for (const I of h4.items.filter((i) => i.tipo === "eleccion")) {
    for (const o of I.opciones) assert.equal(h4.consecuencia(I, o.id).tuya, undefined, `${I.id}: nada de «Tu cifra»`);
  }
  const src = fuente("src/components/mecanicas/libros/t7/FigurasC4T7_3.jsx");
  assert.match(src, /\{item\.tipo === "cifra" && <p className="c4t72-linea" data-c4-tuya>\{TEXTOS_C4_H4\.tuCifra\}/);
  const h2 = P.h2[0].CONSECUENCIA_C4;
  const fac = h2.items.find((i) => i.id === "valor-a-facturar");
  for (const o of fac.opciones.filter((x) => !x.correcta)) assert.match(h2.consecuencia(fac, o.id).falla, / frente al último escalón\.$/);
  assert.ok(!JSON.stringify(Object.values(P).map(([C]) => C.CONSECUENCIA_C4.items.map((I) => I.opciones.map((o) => C.CONSECUENCIA_C4.consecuencia(I, eleccionDe(I, o)))))).includes("frente a el "));
});

test("★★★ lo de Watari va marcado «[W] pendiente de Near» en un comentario de cada consecuencia, y nunca en pantalla", () => {
  for (const h of Object.keys(P)) {
    const src = fuente(`src/contabilidad/c4/t73${h}_c4.js`);
    assert.match(src, /\/\*[^*]*\[W\] pendiente de Near/, h);
  }
  const textos = JSON.stringify(Object.values(P).map(([C]) => Object.values(C).filter((x) => x && typeof x === "object" && !Array.isArray(x) && !x.consecuencia)));
  for (const interno of ["[W]", "Near", "Watari", "Mello", "PENDIENTE", "Iba aquí"]) assert.ok(!textos.includes(interno), interno);
});
