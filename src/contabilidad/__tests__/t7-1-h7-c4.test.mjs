import { test } from "node:test";
import assert from "node:assert/strict";
import { montar, conReloj, responder, textoMensaje, medidasCss, leer, cadaOpcion, BOTONES_C4 } from "./c4T71Prueba.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 «¿Qué control falta?» en el patrón de enganche C4 (motor
 * decisionC4.jsx; Watari, sección t71-h7). La pieza montada, contra los datos
 * de Near (contabilidadT7_1_h7.js, con la D y H7-1/H7-2 de Mello; los
 * paquetes los sigue comprobando t7-1-que-control-falta.test.mjs):
 *   · los casos C4 son los de Near, en los dos sentidos
 *   · el plano de la bodega: los siete controles en sus zonas, DENTRO de la
 *     figura, en su orden de Near
 *   · toda opción se instala antes del veredicto (380 ms) y el riesgo queda
 *     cubierto o abierto; la mala, con su falla y su línea de Near; la
 *     correcta, con «Iba aquí»
 *   · un intento por caso (el motor de la célula: la escalera de dos intentos
 *     se fue con QueControlFalta.jsx); solo suma el primero
 *   · el foco, el detalle y su etiqueta, el resumen; catálogo y vista
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT7_1_h7.js");
const { CONSECUENCIA_C4, ZONAS_H7, LUGAR_H7, W_H7 } = await import("../c4/t71h7_c4.js");
const { default: H7C4 } = await import("../../components/mecanicas/libros/t7/QueControlFaltaC4.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { HACER, clasificacionDe } = await import("../../data/subjects.js");
const { sinUnSoloIntento } = await import("../armaLaLinea.js");

const ITEMS = CONSECUENCIA_C4.items;

test("★★★ los casos C4 son los de Near, letra por letra y en los dos sentidos", () => {
  assert.deepEqual(ITEMS.map((I) => I.id), D.CASOS_H7.map((c) => c.id));
  for (const c of D.CASOS_H7) {
    const I = ITEMS.find((x) => x.id === c.id);
    assert.deepEqual([I.texto, I.subtema, I.porque, I.pie, I.punto, I.bien], [c.texto, c.subtema, c.porque, c.pie, c.punto, null]);
    assert.deepEqual(I.opciones.map((o) => [o.id, o.t]), D.CONTROLES_H7.map((o) => [o.valor, o.texto]), "los siete, en su orden");
    assert.deepEqual(I.opciones.filter((o) => o.correcta).map((o) => o.id), [c.correcta]);
    assert.deepEqual(Object.fromEntries(I.opciones.filter((o) => !o.correcta).map((o) => [o.id, o.msg])), c.porQueNo, "la línea de cada distractor");
    assert.equal(I.opciones.find((o) => o.correcta).msg, null);
  }
  const near = new Set([...D.CASOS_H7.flatMap((c) => [c.texto, c.subtema, c.porque, c.pie, c.punto, ...Object.values(c.porQueNo)]), ...D.CONTROLES_H7.map((o) => o.texto)]);
  for (const I of ITEMS) for (const t of [I.texto, I.subtema, I.porque, I.pie, I.punto, ...I.opciones.flatMap((o) => [o.t, o.msg])].filter(Boolean)) assert.ok(near.has(t), `«${t}» no es de Near`);
});

test("★★★ en pantalla: objetivo, consigna, «Un intento», el caso y su pie; los siete controles en el plano", conReloj(async () => {
  const m = await montar(H7C4, { items: ITEMS, titulo: D.H7.nombre });
  try {
    assert.equal(m.q("[data-encabezado] > p[data-objetivo]").textContent, D.H7.objetivo);
    assert.equal(m.q("[data-consigna]").textContent, sinUnSoloIntento(D.H7.consigna.join(" ")));
    /* Un intento (el motor C4): «Vale el primer intento» era de la escalera de la D, que ya no está. */
    assert.match(m.q("[data-contador-intento]").textContent, /^Caso 1 de 6Un intento$/);
    assert.equal(m.q("[data-texto]").textContent, ITEMS[0].texto);
    assert.equal(m.q("[data-pie]").textContent, ITEMS[0].pie);
    assert.ok(m.q(".c4-ops") == null, "sobra en pantalla");
    assert.deepEqual(m.qq("[data-zona]").map((z) => z.dataset.zona), ZONAS_H7);
    for (const z of m.qq("[data-zona]")) {
      assert.deepEqual(z.querySelectorAll("[data-op]").length > 0, true, `${z.dataset.zona} vacía`);
      for (const b of z.querySelectorAll("[data-op]")) assert.equal(LUGAR_H7[b.dataset.op], z.dataset.zona);
    }
    assert.deepEqual(m.qq("[data-op]").map((b) => b.dataset.op).sort(), D.CONTROLES_H7.map((o) => o.valor).sort());
    assert.equal(m.q("[data-riesgo]").textContent, W_H7.riesgo(ITEMS[0].punto));
  } finally { await m.desmontar(); }
}));

test("★★★ C4: cada control se instala antes del veredicto; el riesgo queda cubierto o abierto (7 × 6)", conReloj(async () => {
  await cadaOpcion(H7C4, ITEMS, (m, I, o) => {
    const riesgo = m.q("[data-riesgo]");
    assert.equal(riesgo.textContent, W_H7.riesgo(I.punto) + (o.correcta ? W_H7.cubierto : W_H7.abierto));
    assert.ok(riesgo.classList.contains(o.correcta ? "cubierto" : "abierto"));
    assert.ok(m.q(`[data-zona="${LUGAR_H7[o.id]}"]`).classList.contains("activa"));
    assert.equal(m.falla(), o.correcta ? null : W_H7.falla(I.punto));
  });
}));

test("★★ Mello C4-5: el verbo concuerda con el punto («los estantes siguen», «la puerta sigue»)", () => {
  assert.equal(W_H7.falla("los estantes"), "Con ese control, los estantes siguen igual.");
  assert.equal(W_H7.falla("la puerta"), "Con ese control, la puerta sigue igual.");
  const I = ITEMS.find((x) => x.id === "falta-mercancia");
  assert.equal(CONSECUENCIA_C4.consecuencia(I, "almacen").falla, "Con ese control, los estantes siguen igual.");
});

test("★★★ antes del veredicto el riesgo va en neutro; el coral, solo con el veredicto", conReloj(async () => {
  const I = ITEMS[0];
  const m = await montar(H7C4, { items: [I] });
  try {
    await m.clic(m.op(I.opciones.find((o) => !o.correcta).id));
    assert.ok(m.q("[data-riesgo]").classList.contains("tocado"));
    assert.ok(!m.q("[data-riesgo]").classList.contains("abierto"));
    await m.pasar(380);
    assert.ok(m.q("[data-riesgo]").classList.contains("abierto"));
  } finally { await m.desmontar(); }
}));

test("★★★ la tanda: un intento por caso, «Iba aquí», la línea de Near y el porqué; el foco; puntaje y detalle del primer intento", conReloj(async () => {
  const m = await montar(H7C4, { items: ITEMS });
  const esperado = [];
  try {
    for (const [k, I] of ITEMS.entries()) {
      const c = D.CASOS_H7.find((x) => x.id === I.id);
      const o = k % 3 === 0 ? I.opciones.find((x) => !x.correcta) : I.opciones.find((x) => x.correcta);
      await responder(m, I, o);
      if (o.correcta) {
        assert.match(m.mensaje().textContent, /^Correcto\./);
        assert.equal(textoMensaje(m), null);
      } else {
        assert.equal(textoMensaje(m), c.porQueNo[o.id]);
        const iba = m.op(c.correcta);
        assert.equal(iba.querySelector("[data-pastilla]").textContent, "Iba aquí");
        await m.clic(iba);
        assert.ok(m.op(o.id).classList.contains("mal"), "se pudo volver a intentar");
        assert.equal(m.q("[data-riesgo]").textContent, W_H7.riesgo(c.punto) + W_H7.abierto);
      }
      await m.clic(m.q(".c4-porque"));
      assert.equal(m.q("[data-porque]").textContent, c.porque);
      esperado.push([I.id, Boolean(o.correcta), o.correcta ? null : o.id]);
      const ultimo = k === ITEMS.length - 1;
      await m.clic(m.boton(ultimo ? BOTONES_C4.verResumen : BOTONES_C4.siguiente));
      if (!ultimo) assert.ok(document.activeElement === m.q("[data-texto]"), "el foco no está donde va");
    }
    assert.equal(m.fin[0][0], (4 / 6) * 100);
    assert.deepEqual(m.fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), esperado);
    assert.equal(m.q("[data-resumen]").textContent, D.resumenH7(4, 6));
    for (const d of m.fin[0][2]) assert.equal(etiquetaDeItem(D.H7_ID, d.item), recortar(D.CASOS_H7.find((x) => x.id === d.item).texto));
  } finally { await m.desmontar(); }
}));

test("★★★ catálogo y vista: el mismo id y la misma clasificación; la vista abre QueControlFaltaC4", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H7_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H7_ID).Mecanica, H7C4);
});

test("★★ los casos se barajan en cada partida; los controles, nunca", conReloj(async () => {
  const primeros = new Set();
  for (let k = 0; k < 12; k++) {
    const m = await montar(H7C4);
    primeros.add(m.item());
    assert.deepEqual(m.qq("[data-op]").map((b) => b.dataset.op), ZONAS_H7.flatMap((z) => D.CONTROLES_H7.filter((o) => LUGAR_H7[o.valor] === z).map((o) => o.valor)));
    await m.desmontar();
  }
  assert.ok(primeros.size > 1);
}));

test("★★ medidas: los controles son botones del motor (44 px); letra de 12 px o más; sin teal ni ámbar", () => {
  medidasCss(leer("src/components/mecanicas/libros/t7/QueControlFaltaC4.jsx") + leer("src/components/mecanicas/libros/t7/c4T71.jsx"));
});
