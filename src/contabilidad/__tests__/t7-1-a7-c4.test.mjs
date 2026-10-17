import { test } from "node:test";
import assert from "node:assert/strict";
import { montar, conReloj, responder, textoMensaje, medidasCss, leer, cadaOpcion } from "./c4T71Prueba.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 «El viaje de una caja» en el patrón de enganche C4 (D4; motor
 * decisionC4.jsx; Watari, sección t71-a7). Construida con los textos de Near
 * en main (contabilidadT7_1_a7.js, la v1 con la v2; los paquetes los sigue
 * comprobando t7-1-control-interno.test.mjs en su parte de datos):
 *   · cada pantalla de Near, en los dos sentidos: portada, «Por qué
 *     cuidarlo», las dos preguntas (con la lista y las glosas), devoluciones,
 *     pistas, aciertos y el resumen
 *   · PENDIENTES_NEAR: las pantallas que pasan de 60 palabras (B2). Near las
 *     está recortando: la lista solo encoge, y la prueba falla si queda una
 *     que ya no pasa o si aparece una nueva
 *   · el camino de la caja: cada opción pone el control en su sitio antes
 *     del veredicto (380 ms), y la caja llega hasta ahí
 *   · la escalera C2 del motor: pista, luego devolución y la correcta en
 *     blanco; nunca «Iba aquí»; «Seguir» con aria-disabled; el foco
 *   · el resumen de Near al final; catálogo y vista (mismo id y posición)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const A = await import("../../data/contabilidadT7_1_a7.js");
const { CONSECUENCIA_C4, W_A7, PORTADA_A7, LECTURA_A7, RESUMEN_A7 } = await import("../c4/t71a7_c4.js");
const { palabras } = await import("../c4/t71Comun.js");
const { default: A7C4, PIEZA_A7_C4 } = await import("../../components/mecanicas/libros/t7/ElViajeDeUnaCajaC4.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");

const ITEMS = CONSECUENCIA_C4.items;
const P = A.PIEZA_CONTROL_INTERNO.pantallas;

/* Las pantallas que Near está recortando: pasan de 60 palabras (texto y pregunta). Solo encoge. */
const PENDIENTES_NEAR = ["al-recibir", "controles-de-seguridad"];

/* ═══════════ 1 · LOS TEXTOS DE NEAR ═══════════ */

test("★★★ las dos preguntas son las de Near, letra por letra y en los dos sentidos", () => {
  assert.deepEqual(ITEMS.map((I) => I.id), P.filter((p) => p.opciones).map((p) => p.id));
  for (const I of ITEMS) {
    const p = P.find((x) => x.id === I.id);
    assert.deepEqual(I.parrafos, p.parrafos);
    assert.deepEqual(I.lista, p.lista ?? null);
    assert.deepEqual(I.despues, p.despues ?? null);
    assert.equal(I.texto, [...p.parrafos, ...(p.lista ?? []), ...(p.despues ?? [])].join(" "));
    assert.deepEqual([I.pregunta, I.pista, I.bien, I.pie], [p.pregunta, p.pista, p.acierto.texto, p.pie]);
    assert.deepEqual(I.opciones.map((o) => [o.id, o.t, o.correcta, o.msg]), p.opciones.map((o) => [o.id, o.texto, Boolean(o.correcta), o.devolucion ?? null]), "en el orden de Near");
  }
  const near = new Set(P.flatMap((p) => [...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.despues ?? []), p.pregunta, p.pista, p.acierto?.texto, p.pie, ...(p.opciones ?? []).flatMap((o) => [o.texto, o.devolucion])]));
  for (const I of ITEMS) for (const t of [...I.parrafos, ...(I.lista ?? []), ...(I.despues ?? []), I.pregunta, I.pista, I.bien, I.pie, ...I.opciones.flatMap((o) => [o.t, o.msg])].filter(Boolean)) assert.ok(near.has(t), `«${t}» no es de Near`);
  assert.deepEqual([PORTADA_A7.id, LECTURA_A7.id, RESUMEN_A7.id], ["portada", "por-que-cuidarlo", "resumen"]);
});

test("★★★ PENDIENTES_NEAR: justo las pantallas que pasan de 60 palabras (Near las recorta; la lista solo encoge)", () => {
  const largas = ITEMS.filter((I) => palabras(I.texto) + palabras(I.pregunta) > 60).map((I) => I.id);
  assert.deepEqual(largas, PENDIENTES_NEAR, "si Near ya recortó una, sácala de la lista; si hay otra, no la publiques así");
  for (const p of [LECTURA_A7, RESUMEN_A7]) assert.ok(palabras([...p.parrafos, p.siguiente ?? ""].join(" ")) <= 60, p.id);
});

/* ═══════════ 2 · EN PANTALLA ═══════════ */

test("★★★ en pantalla: portada y «Por qué cuidarlo» de Near arriba; la pregunta con sus párrafos, su lista y sus glosas", conReloj(async () => {
  const m = await montar(A7C4, { rotulo: "INVENTARIOS I · APRENDER", Marco: undefined });
  try {
    const s = m.caja.querySelector("section");
    assert.equal(s.querySelector("header h3").textContent, PIEZA_A7_C4.titulo);
    assert.equal(s.querySelector("header p").textContent, "INVENTARIOS I · APRENDER");
    assert.equal(m.q("[data-objetivo-a7]").textContent, PORTADA_A7.objetivo);
    assert.deepEqual(m.qq("[data-portada] p").map((p) => p.textContent), [PORTADA_A7.objetivo, PORTADA_A7.pie]);
    assert.deepEqual(m.qq("[data-lectura] p").map((p) => p.textContent), [...LECTURA_A7.parrafos, LECTURA_A7.pie]);
    assert.equal(m.q("[data-cejilla]").textContent, "Pregunta 1 de 2");
    assert.deepEqual(m.qq("[data-texto] > .t71-bloque").map((x) => x.textContent), ITEMS[0].parrafos);
    assert.equal(m.q("[data-pregunta]").textContent, ITEMS[0].pregunta);
    assert.deepEqual(m.qq(".c4-ops [data-op]").map((b) => b.textContent), ITEMS[0].opciones.map((o) => o.t));
    assert.equal(m.q("[data-pie]").textContent, ITEMS[0].pie);
    assert.match(m.q("[data-camino]").textContent, new RegExp(W_A7.recibir.titulo));
    assert.equal(m.q(".c4-seguir").getAttribute("aria-disabled"), "true");
    assert.ok(m.q("[data-resumen-a7]") == null, "el resumen salió antes de tiempo");
  } finally { await m.desmontar(); }
  const m2 = await montar(A7C4, { items: [ITEMS[1]] });
  try {
    assert.deepEqual(m2.qq("[data-lista] .t71-item-lista").map((x) => x.textContent), ITEMS[1].lista);
    assert.deepEqual(m2.qq("[data-texto] > .t71-bloque").map((x) => x.textContent), [...ITEMS[1].parrafos, ITEMS[1].lista.join(""), ...ITEMS[1].despues]);
  } finally { await m2.desmontar(); }
}));

/* ═══════════ 3 · EL CAMINO DE LA CAJA (C4) ═══════════ */

test("★★★ C4: cada opción pone el control en su sitio antes del veredicto, y la caja llega hasta ahí (2 × 3)", conReloj(async () => {
  const R = W_A7.recibir; const S = W_A7.seguridad;
  const esperado = {
    "al-recibir": { "al-recibir": [R.devuelven, R.entran(80), R.registra(80), R.cuenta(80)], contabilidad: [R.entranTodas, R.entran(100), R.registra(100), R.cuenta(100)], conteo: [R.entranTodas, R.entran(100), R.registra(100), R.cuenta(100)] },
    "controles-de-seguridad": { requisicion: [S.quedan, S.noSalen, W_A7.vacio, W_A7.vacio], poliza: [S.menos, S.sinPapel, S.poliza, W_A7.vacio], conteos: [S.menos, S.sinPapel, W_A7.vacio, S.conteo] },
  };
  const fallas = { contabilidad: R.falla(R.enContabilidad), conteo: R.falla(R.alCierre), poliza: S.falla, conteos: S.falla };
  await cadaOpcion(A7C4, ITEMS, (m, I, o) => {
    assert.deepEqual(m.qq("[data-paso] > span:nth-child(2)").map((x) => x.textContent), esperado[I.id][o.id]);
    assert.deepEqual(m.qq('[data-paso][data-control="si"]').map((x) => x.dataset.paso), [o.id], "el control no quedó donde dice la opción");
    assert.equal(m.falla(), fallas[o.id] ?? null);
    assert.equal(m.q("[data-cuadra]")?.textContent ?? null, o.correcta ? (I.id === "al-recibir" ? R.cuadra : S.cuadra) : null);
  });
  assert.deepEqual(CONSECUENCIA_C4.consecuencia(ITEMS[0], null).pasos.map((p) => p.texto), [R.llegan, W_A7.vacio, W_A7.vacio, W_A7.vacio]);
  assert.deepEqual(CONSECUENCIA_C4.consecuencia(ITEMS[1], null).pasos.map((p) => p.texto), [S.listas, W_A7.vacio, W_A7.vacio, W_A7.vacio]);
}));

/* ═══════════ 4 · LA ESCALERA Y EL RESUMEN ═══════════ */

test("★★★ escalera C2: la pista; luego la devolución y la correcta en blanco; nunca «Iba aquí»; el foco; el resumen de Near al final", conReloj(async () => {
  const m = await montar(A7C4);
  try {
    for (const [k, I] of ITEMS.entries()) {
      const [m1, m2] = I.opciones.filter((o) => !o.correcta);
      const buena = I.opciones.find((o) => o.correcta);
      await responder(m, I, m1);
      assert.equal(textoMensaje(m), I.pista, "el primer error dice la pista");
      assert.ok(m.op(m1.id).classList.contains("mal"));
      assert.ok(!m.op(buena.id).classList.contains("pista"));
      assert.equal(m.q(".c4-seguir").getAttribute("aria-disabled"), "true");
      await responder(m, I, m2);
      assert.equal(textoMensaje(m), m2.msg, "el segundo error dice su devolución");
      assert.ok(m.op(buena.id).classList.contains("pista"), "la correcta no quedó en blanco");
      assert.ok(m.op(buena.id).querySelector("[data-pastilla]") == null, "sobra en pantalla");
      assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
      await responder(m, I, buena);
      assert.equal(textoMensaje(m), I.bien);
      assert.ok(m.op(buena.id).classList.contains("bien"));
      assert.equal(m.q(".c4-seguir").getAttribute("aria-disabled"), "false");
      const ultimo = k === ITEMS.length - 1;
      assert.equal(m.q(".c4-seguir").textContent, ultimo ? A.BOTON.seguir : "Seguir");
      assert.ok(m.q("[data-resumen-a7]") == null, "sobra en pantalla");
      await m.clic(m.q(".c4-seguir"));
      if (!ultimo) assert.ok(document.activeElement === m.q("[data-texto]"), "el foco no fue a la pregunta nueva");
    }
    const r = m.q("[data-resumen-a7]");
    assert.ok(r, "el resumen no salió");
    assert.deepEqual([...r.querySelectorAll("p")].map((p) => p.textContent), [...RESUMEN_A7.parrafos, RESUMEN_A7.siguiente, RESUMEN_A7.pie]);
    assert.ok(document.activeElement === r.parentElement.closest("[data-pieza]"), "el foco no fue al resumen");
  } finally { await m.desmontar(); }
}));

/* ═══════════ 5 · CATÁLOGO, VISTA Y MEDIDAS ═══════════ */

test("★★★ catálogo: Aprender, sin FP, el mismo id y la misma posición; el nombre es el título", () => {
  assert.equal(PIEZA_A7_C4.id, A.A7_ID);
  assert.equal(PIEZA_A7_C4.numero, 7);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A7_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, PIEZA_A7_C4.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-1-devolucion-dos-libros") + 1);
  assert.equal(ids.indexOf("t7-1-que-control-falta"), ids.indexOf(A.A7_ID) + 1);
  for (const f of ["src/components/mecanicas/libros/t7/ElViajeDeUnaCajaC4.jsx", "src/contabilidad/c4/t71a7_c4.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★★ vista: T7-1 pinta ElViajeDeUnaCajaC4 en el lugar de A7, la última", () => {
  const ids = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(ids.at(-1), A.A7_ID);
  assert.equal(ids.indexOf(A.A7_ID), ids.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
  const e = PIEZAS_T7_1.find((x) => x.pieza.id === A.A7_ID);
  assert.equal(e.Pieza, A7C4);
  assert.equal(e.pieza, PIEZA_A7_C4);
});

test("★★ medidas: letra de 12 px o más; sin teal ni ámbar; los botones son los del motor", () => {
  medidasCss(leer("src/components/mecanicas/libros/t7/ElViajeDeUnaCajaC4.jsx") + leer("src/components/mecanicas/libros/t7/c4T71.jsx"));
  assert.doesNotMatch(leer("src/components/mecanicas/libros/t7/ElViajeDeUnaCajaC4.jsx"), /<button/);
});
