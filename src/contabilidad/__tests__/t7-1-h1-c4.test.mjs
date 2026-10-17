import { test } from "node:test";
import assert from "node:assert/strict";
import { montar, conReloj, responder, textoMensaje, medidasCss, leer, BOTONES_C4 } from "./c4T71Prueba.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H1 «¿Qué cuenta se mueve?» en el patrón de enganche C4 (motor
 * decisionC4.jsx; Watari, sección t71-h1). La pieza montada, contra los datos
 * de Near (contabilidadT7_1_h1.js; la v1 y sus capas las sigue comprobando
 * t7-1-que-cuenta-se-mueve.test.mjs, letra por letra):
 *   · los ítems C4 son los de Near, en los dos sentidos
 *   · en pantalla: objetivo y consigna (sin la regla del intento), el hecho,
 *     su pie y las cinco cuentas en su orden, DENTRO de la figura
 *   · toda opción pinta su consecuencia antes del veredicto (380 ms), y cada
 *     una distinta; la mala, con su falla; la correcta, con «Iba aquí»
 *   · el error típico, el porqué tras «¿Por qué?», el foco, el primer intento,
 *     el `detalle` y su etiqueta del panel, el resumen
 *   · catálogo y vista: el mismo id, ahora con QueCuentaSeMueveC4
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT7_1_h1.js");
const { CONSECUENCIA_C4, W_H1 } = await import("../c4/t71h1_c4.js");
const { default: H1C4 } = await import("../../components/mecanicas/libros/t7/QueCuentaSeMueveC4.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { sinUnSoloIntento } = await import("../armaLaLinea.js");

const ITEMS = CONSECUENCIA_C4.items;
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
const nombre = (id) => D.OPCIONES_H1.find((o) => o.id === id).nombre;

/* ═══════════ 1 · LOS DATOS, CONTRA NEAR ═══════════ */

test("★★★ los ítems C4 son los de Near, letra por letra y en los dos sentidos", () => {
  assert.deepEqual(ITEMS.map((I) => I.id), D.ITEMS_H1.map((it) => it.id));
  for (const it of D.ITEMS_H1) {
    const I = ITEMS.find((x) => x.id === it.id);
    assert.equal(I.texto, it.texto);
    assert.equal(I.subtema, it.subtema);
    assert.equal(I.porque, it.porque);
    assert.equal(I.pie, it.pie);
    assert.equal(I.bien, null, "el acierto es «Correcto.» y el porqué va tras «¿Por qué?»");
    assert.deepEqual(I.opciones.map((o) => [o.id, o.t]), D.OPCIONES_H1.map((o) => [o.id, o.nombre]), "las cinco, en su orden fijo");
    assert.deepEqual(I.opciones.filter((o) => o.correcta).map((o) => o.id), [it.respuesta]);
    assert.deepEqual(I.opciones.filter((o) => o.msg).map((o) => [o.id, o.msg]), it.tipico ? [[it.tipico.opcion, it.tipico.texto]] : []);
  }
  /* Al revés: ningún texto de los ítems C4 sale de otro sitio que los datos de Near. */
  const near = new Set([...D.ITEMS_H1.flatMap((it) => [it.texto, it.subtema, it.porque, it.pie, it.tipico?.texto]), ...D.OPCIONES_H1.map((o) => o.nombre)]);
  for (const I of ITEMS) for (const t of [I.texto, I.subtema, I.porque, I.pie, ...I.opciones.flatMap((o) => [o.t, o.msg])].filter(Boolean)) assert.ok(near.has(t), `«${t}» no es de Near`);
});

/* ═══════════ 2 · EN PANTALLA ═══════════ */

test("★★★ en pantalla: objetivo y consigna de Near, el hecho y su pie, las cinco cuentas dentro de la figura", conReloj(async () => {
  const m = await montar(H1C4, { items: ITEMS, titulo: D.H1.nombre });
  try {
    assert.equal(m.q("[data-consigna]").textContent, sinUnSoloIntento(D.H1.consigna.join(" ")));
    assert.doesNotMatch(m.caja.textContent, /Tienes un solo intento/);
    assert.equal(m.q("[data-texto]").textContent, ITEMS[0].texto);
    assert.equal(m.q("[data-pie]").textContent, ITEMS[0].pie);
    assert.equal(m.q("[data-pregunta]").hidden, true);
    assert.ok(m.q(".c4-ops") == null, "las opciones no van aparte: son la figura");
    assert.deepEqual(m.qq("[data-figura] [data-op]").map((b) => b.dataset.op), D.OPCIONES_H1.map((o) => o.id));
    assert.equal(m.q("[data-figura] [role=group]").getAttribute("aria-label"), D.H1.nombre);
    assert.deepEqual(m.qq("[data-estado-cuenta]").map((s) => s.textContent), [W_H1.quieta, W_H1.quieta, W_H1.quieta, W_H1.quieta]);
    assert.equal(m.q("[data-cejilla]").textContent, "", "el subtema (la respuesta) salió antes del veredicto");
    assert.match(m.q("h3").textContent, /¿Qué cuenta se mueve\?/);
  } finally { await m.desmontar(); }
}));

test("★★★ lote O: el objetivo se lee de los datos al pintar, arriba de la consigna; sin él, nada", conReloj(async () => {
  const antes = D.H1.objetivo;
  try {
    D.H1.objetivo = "Oración de prueba.";
    let m = await montar(H1C4, { items: ITEMS });
    const p = m.q("[data-encabezado] > p[data-objetivo]");
    assert.equal(p?.textContent, "Oración de prueba.");
    assert.ok(p.nextElementSibling.hasAttribute("data-consigna"));
    await m.desmontar();
    delete D.H1.objetivo;
    m = await montar(H1C4, { items: ITEMS });
    assert.ok(m.q("[data-objetivo]") == null, "sobra en pantalla");
    await m.desmontar();
  } finally { if (antes === undefined) delete D.H1.objetivo; else D.H1.objetivo = antes; }
}));

test("★★★ C4: cada cuenta tocada se mueve antes del veredicto, y cada una pinta algo distinto (5 × 6)", conReloj(async () => {
  for (const I of ITEMS) {
    const vistas = new Set();
    for (const o of I.opciones) {
      const m = await montar(H1C4, { items: [I] });
      try {
        const { antes, consecuencia } = await responder(m, I, o);
        vistas.add(consecuencia);
        if (o.id === "no-se-anota") assert.equal(m.q("[data-bandeja]").textContent, W_H1.ninguna);
        else {
          assert.equal(m.q(`[data-estado-cuenta="${o.id}"]`).textContent, o.correcta ? W_H1.seMueve : W_H1.seMoveria);
          assert.deepEqual(m.qq(".t71-mini-t.mueve").map((t) => t.closest("[data-op]").dataset.op), [o.id], "se mueve otra cuenta, o ninguna");
        }
        assert.notEqual(consecuencia, antes);
        assert.equal(m.falla(), o.correcta ? null : o.id === "no-se-anota" ? W_H1.fallaNoSeAnota : W_H1.falla(o.t), `${I.id} · ${o.id}`);
      } finally { await m.desmontar(); }
    }
    assert.equal(vistas.size, I.opciones.length, `${I.id}: dos opciones pintan lo mismo`);
  }
}));

/* ═══════════ 3 · LA TANDA ENTERA ═══════════ */

test("★★★ la tanda: acierto, error típico y otro error; un intento, «Iba aquí», el porqué, el foco, el puntaje y el detalle del primer intento", conReloj(async () => {
  const m = await montar(H1C4, { items: ITEMS });
  const esperado = [];
  try {
    for (const [k, I] of ITEMS.entries()) {
      assert.equal(m.item(), I.id);
      const it = D.ITEMS_H1.find((x) => x.id === I.id);
      /* Plan: los pares aciertan; los impares fallan, con el error típico cuando lo hay. */
      const o = k % 2 === 0 ? I.opciones.find((x) => x.correcta)
        : I.opciones.find((x) => x.id === it.tipico?.opcion) ?? I.opciones.find((x) => !x.correcta && x.id !== it.tipico?.opcion);
      await responder(m, I, o);
      if (o.correcta) {
        assert.equal(m.mensaje().dataset.mensaje, "acierto");
        assert.match(m.mensaje().textContent, /^Correcto\./);
        assert.ok(m.op(o.id).classList.contains("bien"));
        assert.equal(m.qq('[data-pastilla="revelada"]').length, 0);
      } else {
        assert.equal(m.mensaje().dataset.mensaje, "error");
        assert.equal(textoMensaje(m), it.tipico?.opcion === o.id ? it.tipico.texto : null, "la línea del error típico (o ninguna)");
        assert.ok(m.op(o.id).classList.contains("mal"));
        const iba = m.op(it.respuesta);
        assert.ok(iba.classList.contains("iba"));
        assert.equal(iba.querySelector("[data-pastilla]").textContent, "Iba aquí");
        assert.match(iba.getAttribute("aria-label"), new RegExp(`^${nombre(it.respuesta).replace(/[()]/g, "\\$&")}\\. Iba aquí\\.$`));
        /* Un intento: otro toque no cambia nada. */
        await m.clic(iba);
        assert.ok(m.op(o.id).classList.contains("mal"));
      }
      assert.equal(m.q("[data-cejilla]").textContent, I.subtema);
      await m.clic(m.q(".c4-porque"), "¿Por qué?");
      assert.equal(m.q("[data-porque]").textContent, it.porque);
      assert.ok(document.activeElement === m.q("[data-porque]"), "el foco no está donde va");
      esperado.push([I.id, Boolean(o.correcta), o.correcta ? null : o.id]);
      const ultimo = k === ITEMS.length - 1;
      await m.clic(m.boton(ultimo ? BOTONES_C4.verResumen : BOTONES_C4.siguiente), "seguir");
      if (!ultimo) assert.ok(document.activeElement === m.q("[data-texto]"), "el foco no fue al hecho nuevo");
    }
    assert.equal(m.fin.length, 1);
    assert.equal(m.fin[0][0], 50);
    assert.deepEqual(m.fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), esperado);
    assert.equal(m.q("[data-resumen]").textContent, D.resumenH1(3, 6));
  } finally { await m.desmontar(); }
}));

test("★★★ el panel docente: cada item_id del detalle tiene su etiqueta, leída del hecho", conReloj(async () => {
  const m = await montar(H1C4, { items: ITEMS });
  try {
    for (const I of ITEMS) {
      await responder(m, I, I.opciones.find((o) => o.correcta));
      await m.clic(m.boton(I === ITEMS.at(-1) ? BOTONES_C4.verResumen : BOTONES_C4.siguiente));
    }
    for (const d of m.fin[0][2]) assert.equal(etiquetaDeItem(D.H1_ID, d.item), recortar(D.ITEMS_H1.find((x) => x.id === d.item).texto));
  } finally { await m.desmontar(); }
}));

/* ═══════════ 4 · CATÁLOGO, VISTA Y MEDIDAS ═══════════ */

test("★★★ catálogo y vista: el mismo id y la misma clasificación; la vista abre QueCuentaSeMueveC4", () => {
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].id, D.H1_ID);
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H1_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H1_ID).Mecanica, H1C4);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H1_ID).titulo, D.H1.nombre);
});

test("★★ los hechos se barajan en cada partida; las cinco cuentas, nunca", conReloj(async () => {
  const ordenes = new Set();
  for (let k = 0; k < 12; k++) {
    const m = await montar(H1C4);
    ordenes.add(m.item());
    assert.deepEqual(m.qq("[data-figura] [data-op]").map((b) => b.dataset.op), D.OPCIONES_H1.map((o) => o.id));
    await m.desmontar();
  }
  assert.ok(ordenes.size > 1, "el primer hecho fue siempre el mismo");
}));

test("★★ medidas: las cuentas son botones del motor (44 px); letra de 12 px o más; sin teal ni ámbar", () => {
  const fuente = leer("src/components/mecanicas/libros/t7/QueCuentaSeMueveC4.jsx") + leer("src/components/mecanicas/libros/t7/c4T71.jsx");
  medidasCss(fuente);
  assert.match(fuente, /<OpcionC4 key=\{o\.id\} ctx=\{ctx\} opcion=\{o\}/);
  assert.doesNotMatch(fuente, /min-height: (?:[0-3]\d|4[0-3])px/);
});
