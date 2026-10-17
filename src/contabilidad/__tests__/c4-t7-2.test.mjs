import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as W from "./c4WatariT72.mjs";
import * as MC4 from "./correccionesMelloC4T72.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-2 A1, H2 y H5 — LA CONSECUENCIA PURA CONTRA LA DE WATARI.
 *
 * Fuente: patron-enganche-c4-v1.html (secciones «t72-a1», «t72-h2» y
 * «t72-h5», y su f72.js, que esta prueba EJECUTA con c4WatariT72.mjs). Para
 * cada ítem y cada opción (y cifras escritas que no son ninguna opción), la
 * consecuencia de la casa (src/contabilidad/c4/t7_2_*_c4.js) dice lo mismo
 * que la figura de Watari con esa elección: los números que se mueven, los
 * rótulos [W] y la línea de falla o de «cuadra», letra por letra.
 *
 * La regla general (consecuencia-c.test.mjs) la cumplen solas; aquí va lo
 * propio de estas tres. Encima de Watari van la auditoría de Mello del C4
 * (correccionesMelloC4T72.mjs: C4-3) y la decisión del coordinador sobre
 * ella: en H2, lo que delata la respuesta (IVA y retención en el ítem 1; el
 * costo, hasta el ítem 3) se ve como «$?» hasta responder.
 * Las piezas montadas se prueban en sus archivos:
 * t7-2-la-cuenta-que-si-se-mueve, t7-2-dos-asientos y t7-2-flete-y-devolucion.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const A1 = await import("../c4/t7_2_a1_c4.js");
const H2 = await import("../c4/t7_2_h2_c4.js");
const H5 = await import("../c4/t7_2_h5_c4.js");
const DA1 = await import("../../data/contabilidadT7_2_a1_c2.js");
const DH2 = await import("../../data/contabilidadT7_2_h2.js");
const DH5 = await import("../../data/contabilidadT7_2_h5.js");

const RAIZ = new URL("../../../", import.meta.url);
const fuente = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const lineaCasa = (e) => (e.falla ? { tipo: "falla", t: e.falla } : e.cuadra ? { tipo: "cuadra", t: e.cuadra } : null);
const eleccionDe = (I, o) => (I.tipo === "cifra" ? o.v : o.id);

test("★★★ cada pieza es la de su sección: el id del catálogo, el objeto de Watari y el modo", () => {
  assert.deepEqual([A1.CONSECUENCIA_C4.id, H2.CONSECUENCIA_C4.id, H5.CONSECUENCIA_C4.id], [DA1.A1_ID, DH2.H2_ID, DH5.H5_ID]);
  assert.deepEqual([A1.CONSECUENCIA_C4.objeto, H2.CONSECUENCIA_C4.objeto, H5.CONSECUENCIA_C4.objeto], ["t72-a1", "t72-h2", "t72-h5"].map((k) => W.C4P[k].objeto));
  assert.deepEqual([A1.CONSECUENCIA_C4.modo, H2.CONSECUENCIA_C4.modo, H5.CONSECUENCIA_C4.modo], ["aprender", "hacer", "hacer"]);
  /* Los ítems y sus opciones son los de los datos de Near, en su orden; los asientos quedan como en main («propio»). */
  assert.deepEqual(A1.ITEMS_C4_A1.map((i) => [i.id, i.lado, i.cajas, i.antes]), DA1.HECHOS.map((h, k) => [h.id, h.lado, h.cajas, [5, 8, 6, 7, 6][k]]));
  for (const [P, D] of [[H2, DH2.ITEMS_H2], [H5, DH5.ITEMS_H5]]) {
    assert.deepEqual(P.CONSECUENCIA_C4.items.map((i) => [i.id, i.tipo]), D.map((i) => [i.id, i.tipo === "asiento" ? "propio" : i.tipo]));
    for (const I of P.CONSECUENCIA_C4.items.filter((x) => x.tipo !== "propio")) {
      const it = D.find((x) => x.id === I.id);
      assert.deepEqual(I.opciones.map((o) => [o.id, o.correcta, o.msg]), [[String(it.correcta), true, null], ...it.distractores.map((d) => [String(d.valor), false, d.retro])]);
    }
  }
});

test("★★★ A1: la bodega se mueve con el hecho y la cuenta con el lado tocado, como en Watari, letra por letra", () => {
  const P = W.piezaA1(DA1.HECHOS, DA1.INICIO);
  let n = 0;
  for (const [k, I] of A1.ITEMS_C4_A1.entries()) {
    for (const lado of [null, "debe", "haber"]) {
      const e = A1.CONSECUENCIA_C4.consecuencia(I, lado);
      const html = W.C4P["t72-a1"].figura(W.ctxDe(P), P.items[k], { eleccion: lado, ok: lado === I.lado, anim: false });
      assert.deepEqual(W.lineaDe(html), lado ? lineaCasa(e) : null, `${I.id} · ${lado}`);
      assert.ok(W.textoDe(html).startsWith(`Bodega · ${e.bodega} cajas Inventario de mercancías · ${e.cuenta} cajas`), `${I.id} · ${lado}: ${W.textoDe(html)}`);
      n += 1;
    }
  }
  assert.equal(n, 15);
  /* El primer hecho, a mano: entran tres cajas; en el haber, la cuenta baja a 2. */
  assert.deepEqual(A1.consecuenciaA1(A1.ITEMS_C4_A1[0], "haber"), { bodega: 8, cuenta: 2, renglon: { lado: "haber", cajas: 3 }, falla: "No cuadra: la bodega tiene 8 cajas y la cuenta dice 2." });
  assert.deepEqual(A1.consecuenciaA1(A1.ITEMS_C4_A1[0], "debe"), { bodega: 8, cuenta: 8, renglon: { lado: "debe", cajas: 3 }, cuadra: "La cuenta y la bodega dicen lo mismo." });
});

test("★★★ H2: la cifra comprobada entra a la factura y el valor tocado sale de la bodega, como en Watari (corregido), letra por letra", () => {
  const P = W.piezaHacer(DH2.ITEMS_H2);
  const T = H2.TEXTOS_C4_H2;
  for (const [k, I] of P.items.entries()) {
    const casa = H2.CONSECUENCIA_C4.items.find((x) => x.id === I.id);
    /* Las opciones, y para la cifra también lo que no es ninguna opción (de más y de menos). */
    const elecciones = [null, ...casa.opciones.map((o) => eleccionDe(casa, o)), ...(I.tipo === "cifra" ? [6_200_000, 6_300_001, 1] : [])];
    for (const x of elecciones) {
      const e = H2.CONSECUENCIA_C4.consecuencia(casa, x);
      const html = W.C4P["t72-h2"].figura(W.ctxDe(P, k), I, W.vDe(I, x));
      assert.deepEqual(W.lineaDe(html), lineaCasa(e), `${I.id} · ${x}`);
      const v = (n) => (n == null ? "$?" : H2.pesosC4(n));
      /* Lo que no se ve hasta responder: en el ítem 1, IVA y retención; el costo, hasta responder el ítem 3. */
      const ocultos = [...(I.id === "debe-cliente" && x == null ? [[T.iva, DH2.CIFRAS_H2.iva], [T.retencion, DH2.CIFRAS_H2.retencion]] : []),
        ...(I.id === "debe-cliente" || x == null ? [[T.costo, DH2.CIFRAS_H2.costo]] : [])];
      const corregido = ocultos.reduce((t, [rot, n]) => { assert.ok(t.includes(`${rot} ${v(n)}`)); return t.replace(`${rot} ${v(n)}`, `${rot} $?`); }, W.textoDe(html));
      assert.equal(corregido, `${T.factura} ${T.venta} ${v(e.factura.venta)} ${T.iva} ${v(e.factura.iva)} ${T.retencion} ${v(e.factura.retencion)} ${T.cliente} ${v(e.factura.cliente)} `
        + `${T.bodega} ${T.costo} ${v(e.bodega.costo)} ${T.sale} ${v(e.bodega.sale)}${lineaCasa(e) ? ` ${lineaCasa(e).t}` : ""}`, `${I.id} · ${x}`);
    }
  }
});

test("★★★ H5: el mapa, la línea del cálculo y la cuenta tocada con su efecto, como en Watari, letra por letra", () => {
  const P = W.piezaHacer(DH5.ITEMS_H5);
  let n = 0;
  for (const [k, I] of P.items.entries()) {
    const casa = H5.CONSECUENCIA_C4.items.find((x) => x.id === I.id);
    const elecciones = [null, ...casa.opciones.map((o) => eleccionDe(casa, o)), ...(I.tipo === "cifra" ? [376_199, 999_999] : [])];
    for (const x of elecciones) {
      const e = H5.CONSECUENCIA_C4.consecuencia(casa, x);
      const html = W.C4P["t72-h5"].figura(W.ctxDe(P, k), I, W.vDe(I, x));
      const texto = W.textoDe(html);
      /* C4-3 de Mello: lo que suma la retención (más que el flete) no muestra montos negativos; dice la frase de Mello. */
      const sumaRet = I.id === "pago-a-la-transportadora" && x > DH5.CIFRAS_H5.flete;
      if (sumaRet) {
        assert.match(W.lineaDe(html).t, /-1/, "lo que vio Mello");
        if (x === MC4.C4_3_H5_PAGO.distractor) assert.ok(texto.includes(MC4.C4_3_H5_PAGO.hoy));
        assert.deepEqual([lineaCasa(e), e.retiene], [{ tipo: "falla", t: MC4.C4_3_H5_PAGO.debe }, undefined]);
      } else assert.deepEqual(W.lineaDe(html), lineaCasa(e), `${I.id} · ${x}`);
      /* El mapa: los tres nodos, los dos del hecho activos, y la flecha. */
      const activos = [...html.matchAll(/<span class="c4-nodo[^"]*activo[^"]*">([^<]+)</g)].map((m) => m[1]);
      assert.deepEqual(activos.sort(), [e.mapa.de, e.mapa.a].sort());
      assert.ok(texto.startsWith(`${H5.TEXTOS_C4_H5.nodos.join(" ")} ${e.mapa.de} → ${e.mapa.a}`), texto);
      if (I.tipo === "cifra") {
        assert.ok(texto.includes(`${e.linea} ${H5.TEXTOS_C4_H5.tuCifra} ${x == null ? "$?" : H5.pesosC4(x)}${sumaRet ? "" : e.retiene ? ` · ${e.retiene}` : ""}`), `${I.id} · ${x}: ${texto}`);
      } else {
        assert.ok(texto.includes(H5.TEXTOS_C4_H5.libro));
        if (x != null) assert.ok(texto.includes(`${x} ${e.mov} ${e.efecto}`), `${I.id} · ${x}: ${texto}`);
      }
      n += 1;
    }
  }
  assert.ok(n >= 20, String(n));
});

test("★★★ lo de Watari va marcado «[W] pendiente de Near» en un comentario de cada consecuencia, y nunca en pantalla", () => {
  for (const f of ["t7_2_a1_c4.js", "t7_2_h2_c4.js", "t7_2_h5_c4.js"]) {
    const src = fuente(`src/contabilidad/c4/${f}`);
    assert.match(src, /\/\*[^*]*\[W\] pendiente de Near/, f);
  }
  const textos = JSON.stringify([A1.TEXTOS_C4_A1.cuadra, A1.TEXTOS_C4_A1.falla(1, 2), H2.TEXTOS_C4_H2, H5.TEXTOS_C4_H5]);
  for (const interno of ["[W]", "Near", "Watari", "Mello", "PENDIENTE", "Iba aquí"]) assert.ok(!textos.includes(interno), interno);
});

test("★★★ C4-3 (Mello): ninguna figura muestra montos negativos ni unidades fraccionarias, y la frase nueva está literal en la auditoría", () => {
  assert.equal(H5.TEXTOS_C4_H5.sumaLaRetencion, MC4.C4_3_H5_PAGO.debe);
  let n = 0;
  for (const P of [A1.CONSECUENCIA_C4, H2.CONSECUENCIA_C4, H5.CONSECUENCIA_C4]) {
    for (const I of P.items.filter((x) => x.tipo !== "propio")) {
      const extra = I.tipo === "cifra" ? [1, 999_999_999, ...I.opciones.map((o) => o.v + 1)] : [];
      for (const x of [null, ...I.opciones.map((o) => eleccionDe(I, o)), ...extra]) {
        const e = JSON.stringify(P.consecuencia(I, x));
        assert.doesNotMatch(e, /\$-|-\d|−\$?\d+(?:[.,]\d+)*\s*%/, `${P.id} · ${I.id} · ${x}: ${e}`);
        /* Decimales solo en porcentajes («3,5 %»): ninguna caja, cifra ni monto con coma. */
        for (const m of e.matchAll(/\d+,\d+(\s*%)?/g)) assert.ok(m[1], `${P.id} · ${I.id} · ${x}: ${m[0]}`);
        n += 1;
      }
    }
  }
  assert.ok(n > 40, String(n));
});
