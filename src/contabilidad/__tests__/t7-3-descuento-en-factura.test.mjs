import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H1 «Descuento en la factura» (Célula C) · Hacer.
 *
 *   · las cifras se recalculan en centavos desde la lista, el 12 % y las
 *     tarifas, y son las del registro 5c de Near; el asiento cuadra
 *   · cada texto es, letra por letra, el de la v1
 *   · un solo intento por unidad: un toque en cada cálculo; en el asiento,
 *     «Comprobar» califica las cuatro líneas una vez, y las sumas aparecen
 *     después (2.092.640 también es un distractor del ítem 3)
 *   · siete unidades; el porcentaje es aciertos / 7 (el ítem 4 se quitó: lote 3, decisión de L)
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0103; la
 *     vista de T7-3 lo abre y registra con el motor; el panel docente lee
 *     cada unidad
 *   · ninguna cifra del libro (las de H-1 son de A1) ni de X1-X4
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
/* C4: el veredicto llega ESPERA_C4 después del toque; los temporizadores son los falsos de node:test. */
mock.timers.enable({ apis: ["setTimeout"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT7_3_h1.js");
const L = await import("../t7_3H1.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: DescuentoEnFactura } = await import("../../components/mecanicas/libros/t7/DescuentoEnFactura.jsx");
const C4 = (await import("../c4/t73h1_c4.js")).CONSECUENCIA_C4;
const { ESPERA_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const MC4 = await import("./correccionesMelloC4T73.mjs");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h1-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0103_t7_3_descuento_en_factura.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const item = (id) => D.ITEMS_H1.find((x) => x.id === id);
const C = D.CIFRAS_H1;

/* ═══════════ 1 · LAS CIFRAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde la lista, el 12 % y las tarifas, y son las del registro de Near", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const descuento = de(2_050_000, 12_000);
  const factura = 2_050_000 - descuento;
  const iva = de(factura, 16_000);
  const ret = de(factura, 3_500);
  assert.deepEqual([descuento, factura, iva, ret, factura + iva - ret], [246_000, 1_804_000, 288_640, 63_140, 2_029_500]);
  assert.deepEqual([C.lista, C.descuento, C.factura, C.iva, C.retencion, C.cliente, C.sumas], [2_050_000, descuento, factura, iva, ret, factura + iva - ret, factura + iva]);
  /* El registro 5c de la v1 trae, una por una, todas las que se ven. */
  const registro = V1.split("\n").find((l) => l.startsWith("- Registro 5c, T73-H1: ")).replace("- Registro 5c, T73-H1: ", "").replace(/\.$/, "").split(" · ").map((x) => Number(x.replace(/\./g, "")));
  const usadas = new Set([C.lista, C.descuento, C.factura, C.iva, C.retencion, C.cliente, C.sumas, ...D.ITEMS_H1.flatMap((it) => (it.distractores ?? []).map((d) => d.valor))]);
  assert.deepEqual([...usadas].sort((a, b) => a - b), [...registro].sort((a, b) => a - b));
  /* Distractores: el precio de lista, sumar el descuento; el IVA sobre la lista y la otra tarifa; no restar o sumar la retención. */
  assert.deepEqual(item("valor-a-facturar").distractores.map((d) => d.valor), [2_050_000, 2_296_000]);
  assert.deepEqual(item("iva").distractores.map((d) => d.valor), [328_000, 63_140]);
  assert.deepEqual(item("debe-el-cliente").distractores.map((d) => d.valor), [2_092_640, 2_155_780]);
  const suma = (l) => item("asiento").lineas.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
  assert.equal(suma(DEBE), suma(HABER));
  assert.ok(V1.includes(`Después de comprobar se ven las sumas: ${miles(suma(DEBE))} = ${miles(suma(HABER))}`));
});

test("★★★ ninguna cifra del libro (las de H-1 son de A1) ni de X1-X4", () => {
  const prohibidas = [...Object.values(A1.H1_LIBRO), 800_000, 175_000, 5_625_000, 5_800_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const todo = JSON.stringify(D.ITEMS_H1) + D.H1.enunciado.join(" ") + JSON.stringify(D.FICHA_H1);
  const numeros = new Set([...todo.matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of D.ITEMS_H1.flatMap((it) => [it.correcta, ...(it.distractores ?? []).map((d) => d.valor), ...(it.lineas ?? []).map((l) => l.valor)])) numeros.add(x);
  for (const x of prohibidas) assert.ok(!numeros.has(x), miles(x));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

test("★★★ los textos son los de la v1, letra por letra", () => {
  assert.ok(V1.includes(`id \`${D.H1_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H1 «${D.H1.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 2 | ${D.H1_ID} | ${D.H1.nombre} | Hacer |`));
  const enunciado = V1.slice(V1.indexOf("## Enunciado")).split("\n").filter((l) => l.startsWith("- «"));
  assert.equal(D.H1.enunciado[0], citas(enunciado[0])[0]);
  assert.equal(D.H1.enunciado[1], citas(enunciado[1])[0]);
  assert.ok(enunciado[1].endsWith("Después, la frase de tarifas literal."));
  assert.equal(D.H1.enunciado[2], A1.FRASE_TARIFAS);
  assert.equal(D.H1.consigna, citas(enunciado[2])[0]);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H1.pie}».`));
  /* La ficha: los cinco datos de la v1, en su orden, con los rótulos de A1 de T7-3. */
  const ficha = V1.split("\n").find((l) => l.startsWith("- **Ficha en pantalla:** ")).replace("- **Ficha en pantalla:** ", "").replace(/\.$/, "").split(" · ").map((t) => t.replace(/^(entrega|recibe) /, ""));
  assert.deepEqual(D.FICHA_H1.map(([, t]) => t.toLowerCase()), ficha.map((t) => t.toLowerCase()));
  /* Los rótulos de la ficha de A1 de T7-3 (los de H2 de T7-2). El recorte del lote 1 quitó esa ficha de A1; los rótulos se quedan. */
  assert.deepEqual(D.FICHA_H1.map(([r]) => r), ["Quién entrega", "Quién recibe", "Monto", "Tipo", "Clase de hecho"]);
  const fs = filas();
  assert.equal(fs.length, 5);
  /* El ítem 4 de la v1 («¿Por qué valor va Ingresos por ventas?») se quitó en el lote 3: la mesa ya lo muestra. */
  assert.ok(citas(fs[3][1])[0] === "¿Por qué valor va Ingresos por ventas?" && !D.ITEMS_H1.some((it) => it.pregunta === citas(fs[3][1])[0]));
  const vigentes = fs.filter((f) => f[0] !== "4");
  assert.equal(vigentes.length, D.ITEMS_H1.length);
  for (const [k, it] of D.ITEMS_H1.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = vigentes[k];
    assert.equal(n, String(k < 3 ? k + 1 : k + 2));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    if (it.tipo !== "asiento") {
      assert.equal(pesos(it.correcta), correcta, it.id);
      assert.equal(it.acierto, citas(acierto)[0], it.id);
      const partes = distractores.split(" · ").map((p) => p.match(/^(\$[\d.]+): «([^»]+)»/));
      assert.deepEqual(it.distractores.map((d) => [pesos(d.valor), d.retro]), partes.map((p) => [p[1], p[2]]), it.id);
    } else {
      const lineasV1 = [...correcta.matchAll(/([^·]+?) \$([\d.]+) → (Debe|Haber)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "Debe" ? DEBE : HABER]);
      assert.deepEqual(it.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineasV1, it.id);
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores), `${it.id}: un texto por línea`);
    }
  }
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH1((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(DescuentoEnFactura, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
/* C4: el reloj del veredicto, la línea que pinta la figura y el mensaje (vacío antes del veredicto). */
const tick = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };
const lineaC4 = (caja) => caja.querySelector("[data-c4-linea]")?.textContent ?? null;
const retros = (caja) => [...caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent);
const c4De = (id, x) => { const e = C4.consecuencia(C4.items.find((i) => i.id === id), x); return e.falla ?? e.cuadra ?? null; };
/* C4-1 (Mello): con la cifra escrita y sin comprobar, la figura la muestra y nada más. */
function sinResultado(caja, it, v) {
  const fig = caja.querySelector("[data-c4-figura]");
  assert.ok([...fig.querySelectorAll("[data-c4-valor]")].some((b) => b.textContent === `$${Number(v).toLocaleString("es-CO")}`), `${it.id} · ${v}: la cifra, en su lugar`);
  for (const x of MC4.C4_1_PROHIBIDO) assert.ok(!fig.outerHTML.includes(x), `${it.id} · ${v}: «${x}» antes de comprobar`);
}
/* Un toque o un «Comprobar»: primero la consecuencia, sin veredicto; a los ESPERA_C4, el veredicto. */
async function conVeredicto(m, it, x) {
  assert.equal(lineaC4(m.caja), c4De(it.id, x), `${it.id}: la consecuencia de ${x}, en el acto`);
  assert.deepEqual(retros(m.caja), [], `${it.id}: sin veredicto todavía`);
  await tick(ESPERA_C4 - 1);
  assert.deepEqual(retros(m.caja), [], `${it.id}: ni 1 ms antes`);
  await tick(1);
  assert.equal(lineaC4(m.caja), c4De(it.id, x), `${it.id}: la consecuencia se queda a la vista`);
}
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));
const ficha = (caja, lineaId, cuenta) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] [data-ficha-cuenta]`)].find((b) => b.dataset.fichaCuenta === cuenta);
/* Escribe en la casilla de cifra como lo haría el teclado: el valor con su punto de miles. */
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(i.value, miles(valor));
};
const otro = (l) => (l === DEBE ? HABER : DEBE);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H1.pie);
    /* Patrón T7-3: la cuenta de la factura no está antes de responder el ítem 1; después, se queda. */
    assert.equal(m.caja.querySelectorAll("figure[data-renglones]").length, k === 0 ? 0 : 1, `figuras antes del ítem ${k + 1}`);
    if (it.tipo === "cifra") {
      /* LOTE 3: casilla de cifra; si falla, escribe el primer distractor de Near y sale su retroalimentación. */
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
      await escribir(m.caja, it.id, v);
      /* C4-1 de Mello: la cifra escrita ya está en la figura, sin nada que dependa del resultado hasta comprobar. */
      sinResultado(m.caja, it, v);
      await tocar(boton(m.caja, "Comprobar"));
      await conVeredicto(m, it, v);
      const ok = v === it.correcta;
      assert.equal(m.caja.querySelector(`[data-campo-cifra="${it.id}"]`).readOnly, true, "un solo intento");
      assert.equal(boton(m.caja, "Comprobar"), undefined);
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH1(it, v).textos);
      if (!ok) assert.deepEqual(L.evaluarH1(it, v).textos, [it.distractores[0].retro, `Iba aquí: ${pesos(it.correcta)}.`]);
      assert.equal(m.caja.querySelectorAll("figure[data-renglones]").length, 1, `figuras al responder el ítem ${k + 1}`);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
    /* C4: al tocar, todas se bloquean; la consecuencia, en el acto; el veredicto, ESPERA_C4 después. */
    await conVeredicto(m, it, String(v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH1(it, v).textos);
      if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      assert.equal(m.caja.querySelectorAll("figure[data-renglones]").length, 1, `figuras al responder el ítem ${k + 1}`);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      /* LOTE 3 · «Arma la línea»: cada línea elige su cuenta del banco (la correcta y dos distractores) y su lado. */
      for (const l of it.lineas) {
        assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» antes de tener todas las líneas");
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta]`)].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
        assert.ok(m.caja.querySelector(`[data-linea-cuenta="${l.id}"] [data-valor]`).textContent === pesos(l.valor), "el monto viene dado");
        await tocar(ficha(m.caja, l.id, falla(L.idLineaH1(it, l)) ? l.distractores[0].cuenta : l.cuenta));
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, l.lado));
      }
      /* Las sumas (2.092.640) no se ven antes de comprobar: regalarían el distractor del ítem 3. */
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, "las sumas antes de comprobar");
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH1(it, l));
        for (const b of m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.distractores[0].retro]);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-era]`)].map((p) => p.textContent), ok ? [] : [`Iba aquí: ${l.cuenta}, al ${l.lado === DEBE ? "debe" : "haber"}.`]);
        detalle.push({ item: L.idLineaH1(it, l), ok, intentos: 1, respuesta: ok ? null : `${l.distractores[0].cuenta}|${l.lado}`, orden: detalle.length + 1 });
      }
      const suma = pesos(C.sumas);
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${suma}${suma}`), "las sumas");
    }
    await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_H1.verResumen : D.BOTON_H1.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: siete unidades, un intento cada una, y el porcentaje es aciertos / 7", async () => {
  const m = await montar();
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-enunciado] p")].map((p) => p.textContent), D.H1.enunciado);
    /* La ficha de la venta, siempre a la vista. */
    assert.ok(m.caja.textContent.includes(D.FICHA_H1.map(([r, t]) => `${r}${t}`).join("")), "la ficha no está a la vista");
    const fallos = new Set(["iva", "asiento:anticipo"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH1());
    assert.equal(L.TOTAL_H1, 7);
    assert.equal(pct, (5 / 7) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las líneas y su banco de cuentas se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH1(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H1.map((x) => x.id));
    b.add(p[3].orden.join() + p[3].lineas.map((l) => l.banco.join()).join());
  }
  assert.ok(b.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-3, justo después de A1: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H1_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H1_ID).nombre, D.H1.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H1_ID), ids.indexOf("t7-3-descuento-comercial") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H1_ID).Mecanica, DescuentoEnFactura);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_3View modo=\{modoTema\} nodoInicial=\{ruta\.extra\} /);
});

test("★★★ la 0103: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-descuento-en-factura',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-3-descuento-en-factura';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H1_ID)), ["0103_t7_3_descuento_en_factura.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0103")), ["0103_t7_3_descuento_en_factura.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 7);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H1_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH1(id)), id);
    }
    assert.equal(L.unidadDeH1("iva"), "¿Cuánto es el IVA?");
    assert.equal(L.unidadDeH1("asiento:anticipo"), "Anticipo fiscal $63.140");
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-descuento-en-factura": \(id\) => unidadDeT73H1\(id\),/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

test("★★★ Patrón T7-3: la factura de Guadua en renglones llega al responder el ítem 1, con acierto o con error", async () => {
  for (const v of [C.factura, C.lista]) {
    const m = await montar();
    try {
      assert.equal(m.caja.querySelectorAll("figure[data-renglones]").length, 0);
      await escribir(m.caja, "valor-a-facturar", v);
      await tocar(boton(m.caja, "Comprobar")); await tick(ESPERA_C4);
      const fig = m.caja.querySelector("figure[data-renglones]");
      assert.equal(fig.querySelector("figcaption").textContent, "Factura de Guadua");
      assert.deepEqual([...fig.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-v").textContent, r.classList.contains("rg-res")]),
        [["", "2.050.000", false], ["−", "246.000", false], ["=", "1.804.000", true]]);
      assert.ok(fig.classList.contains("rg-nuevo"), "entra con el fundido");
      assert.equal(C.lista - C.descuento, C.factura);
      await tocar(boton(m.caja, D.BOTON_H1.siguiente));
      assert.equal(m.caja.querySelector("figure[data-renglones]").classList.contains("rg-nuevo"), false, "en el ítem 2 ya no se funde");
    } finally {
      m.desmontar();
    }
  }
});

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA», LA CASILLA Y EL DISTINTIVO ═══════════ */

test("★★★ lote 3: los cálculos van con casilla; el asiento, con banco de cuentas (la correcta y 2 distractores)", () => {
  assert.deepEqual(D.ITEMS_H1.map((x) => x.tipo), ["cifra", "cifra", "cifra", "asiento"]);
  for (const l of item("asiento").lineas) {
    assert.equal(l.distractores.length, 2, l.id);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), l.id);
    assert.equal(new Set(l.distractores.map((d) => d.cuenta)).size, 2, l.id);
  }
  /* El banco de cada línea: las tres cuentas, barajadas. */
  const p = L.prepararH1((xs) => [...xs].reverse());
  for (const l of p[3].lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores.map((d) => d.cuenta)].sort());
  /* Una cifra que no es de ningún distractor: la respuesta y el porqué del acierto, sin «Así es.». */
  assert.deepEqual(L.evaluarH1(item("iva"), 1), { ok: false, correcta: C.iva, textos: [`Iba aquí: ${pesos(C.iva)}.`, "Se calcula sobre el valor a facturar: $1.804.000 × 16 % = $288.640."], textoCorrecta: pesos(C.iva) });
});

test("★★★ lote 3: «Tienes un solo intento» sale de la consigna en pantalla y queda el distintivo junto al contador", async () => {
  assert.ok(D.H1.consigna.endsWith("Tienes un solo intento por pregunta."), "los datos siguen siendo los de Near");
  const m = await montar();
  try {
    assert.ok(!m.caja.textContent.includes("Tienes un solo intento"));
    assert.ok(m.caja.textContent.includes("Calcula la factura y arma el asiento de la venta."));
    const d = m.caja.querySelector("[data-contador-intento] [data-un-intento]");
    assert.equal(d.textContent, "Un intento");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ C4 · «TODA DECISIÓN SE PINTA» (Watari, D9; FigurasC4T7_3.jsx) ═══════════ */

/* Hasta el ítem k, todo bien y con su veredicto. */
async function hastaElItemC4(m, k) {
  for (const it of EN_ORDEN.slice(0, k)) {
    if (it.tipo === "cifra") { await escribir(m.caja, it.id, it.correcta); await tocar(boton(m.caja, "Comprobar")); }
    else if (it.tipo === "asiento") { for (const l of it.lineas) { await tocar(ficha(m.caja, l.id, l.cuenta)); await tocar(lado(m.caja, l.id, l.lado)); } await tocar(boton(m.caja, "Comprobar")); }
    else await tocar(opcion(m.caja, it.correcta));
    await tick(ESPERA_C4);
    await tocar(boton(m.caja, D.BOTON_H1.siguiente));
  }
}
const figuraC4 = (caja) => caja.querySelector("[data-c4-figura]");

test("★★★ C4: cada opción y cada distractor de cifra pintan su consecuencia en la figura antes del veredicto, cada uno distinto", async () => {
  let n = 0;
  for (const [k, it] of EN_ORDEN.entries()) {
    if (it.tipo === "asiento") {
      const m = await montar();
      try { await hastaElItemC4(m, k); assert.equal(figuraC4(m.caja), null, `${it.id}: el asiento sigue como en main, sin la figura`); } finally { m.desmontar(); }
      continue;
    }
    const valores = [it.correcta, ...it.distractores.map((d) => d.valor)];
    const vistas = [];
    for (const v of valores) {
      const m = await montar();
      try {
        await hastaElItemC4(m, k);
        assert.equal(figuraC4(m.caja).dataset.c4Figura, C4.objeto, "el objeto propio de la actividad");
        assert.equal(lineaC4(m.caja), null, "sin responder, la figura no dice nada");
        const vacia = figuraC4(m.caja).textContent;
        if (it.tipo === "cifra") { await escribir(m.caja, it.id, v); await tocar(boton(m.caja, "Comprobar")); }
        else await tocar(opcion(m.caja, v));
        const e = C4.consecuencia(C4.items.find((i) => i.id === it.id), it.tipo === "cifra" ? v : String(v));
        assert.notEqual(figuraC4(m.caja).textContent, vacia, `${it.id} · ${v}: la figura cambia`);
        /* La cifra comprobada, en su lugar de la figura (su renglón, o «Tu cifra»). */
        if (it.tipo === "cifra") assert.equal((figuraC4(m.caja).querySelector(".activa [data-c4-valor]") ?? figuraC4(m.caja).querySelector("[data-c4-tuya] [data-c4-valor]"))?.textContent, `$${v.toLocaleString("es-CO")}`, `${it.id} · ${v}: la cifra, en la figura`);
        assert.equal(lineaC4(m.caja), e.falla ?? e.cuadra ?? null);
        assert.equal(Boolean(e.falla), v !== it.correcta, `${it.id} · ${v}: la mala trae su falla`);
        assert.equal(m.caja.querySelector("[data-c4-linea]")?.dataset.c4Linea ?? null, e.falla ? "falla" : e.cuadra ? "cuadra" : null);
        if (e.falla || e.cuadra) assert.ok(m.caja.querySelector("[data-c4-linea] svg"));
        assert.deepEqual(retros(m.caja), [], "el veredicto, todavía no");
        vistas.push(figuraC4(m.caja).textContent);
        await tick(ESPERA_C4);
        assert.notDeepEqual(retros(m.caja), [], "y luego el veredicto");
        n += 1;
      } finally { m.desmontar(); }
    }
    assert.equal(new Set(vistas).size, valores.length, `${it.id}: cada opción, su figura`);
  }
  assert.equal(n, C4.items.filter((i) => i.tipo !== "propio").reduce((t, i) => t + i.opciones.length, 0));
});

test("★★★ C4: con movimiento reducido, el veredicto llega en el mismo toque", async () => {
  REDUCIDO = true;
  const m = await montar();
  try {
    const it = EN_ORDEN[0];
    if (it.tipo === "cifra") { await escribir(m.caja, it.id, it.distractores[0].valor); await tocar(boton(m.caja, "Comprobar")); }
    else await tocar(opcion(m.caja, it.distractores[0].valor));
    assert.notDeepEqual(retros(m.caja), []);
    assert.equal(m.caja.querySelector("[data-c4-linea]").dataset.c4Linea, "falla");
  } finally { m.desmontar(); REDUCIDO = false; }
});

test("★★★ C4-1 (Mello): en cada casilla de cifra, con la correcta y con cada distractor escritos, sin comprobar, la figura no califica", async () => {
  let n = 0;
  for (const [k, it] of EN_ORDEN.entries()) {
    if (it.tipo !== "cifra") continue;
    for (const v of [it.correcta, ...it.distractores.map((d) => d.valor)]) {
      const m = await montar();
      try {
        await hastaElItemC4(m, k);
        await escribir(m.caja, it.id, v);
        sinResultado(m.caja, it, v);
        assert.deepEqual(retros(m.caja), []);
        n += 1;
      } finally { m.desmontar(); }
    }
  }
  assert.ok(n >= 6, String(n));
});
