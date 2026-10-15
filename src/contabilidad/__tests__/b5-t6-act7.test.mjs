import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 7 — «¿Qué método y cuándo?» (Célula B, b5-t6-a7).
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-act7.md), ficha por
 *     ficha: el texto, la respuesta, el acierto, los errores A, B y C, el
 *     resumen, el texto alternativo y las reglas
 *   · A y B en TODA ficha de su lado; C solo cuando acertó «Provisiones»
 *   · regla única del segundo fallo: el acierto con «No es esa.» delante, y
 *     siempre nombra el método (y el momento, si es de provisiones)
 *   · puntaje como T1-6: 60 % el método y 40 % el momento; anulación directa
 *     entera; el segundo intento vale la mitad
 *   · la tanda es el banco entero, barajado; sin cifras
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: QueMetodoYCuando } = await import("../../components/mecanicas/libros/tema6/QueMetodoYCuando.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t6Act7.js");
const D = await import("../../data/contabilidadT6Act7.js");
const { FAE } = await import("../../theme.js");

const ficha = (id) => D.FICHAS_T6_ACT7.find((f) => f.id === id);
const IDS = ["mc-01", "mc-02", "mc-03", "mc-04", "mc-05", "mc-06", "mc-07", "mc-08", "mc-09", "mc-10"];

const montar = async (ids, onCompletar = () => {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = ids.map((id) => (id === D.EJEMPLO_T6_ACT7.id ? D.EJEMPLO_T6_ACT7 : ficha(id)));
  await act(async () => {
    raiz.render(h(QueMetodoYCuando, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const pestana = (caja, id) => caja.querySelector(`[data-nivel1="${id}"]`);
const opcion = (caja, id) => caja.querySelector(`[data-nivel2="${id}"]`);
const botonColocar = (caja) => caja.querySelector("[data-boton-colocar] button");
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
const marcar = async (caja, metodo, momento = null) => {
  if (pestana(caja, metodo).dataset.elegido !== "si") await tocar(pestana(caja, metodo));
  if (momento) await tocar(opcion(caja, momento));
  await tocar(botonColocar(caja));
};
/* Sin el emoji y su espacio: así va en el paquete. */
const sinEmoji = (t) => t.replace(/^(✅|❌) /, "");

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act7.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"));
const fila = (primera) => FUTABA.split("\n").find((l) => l.split("\t")[0] === primera)?.split("\t");
/* «(71)» y las demás cifras de legibilidad no se pintan. */
const sinCifra = (t) => t.replace(/ \(\d+\)$/, "");
const RESPUESTA = { directa: "Anulación directa", "provisiones/cierre": "Provisiones · Al cierre", "provisiones/castigar": "Provisiones · Al castigar" };
const clave = (f) => (f.momento ? `${f.metodo}/${f.momento}` : f.metodo);

test("guarda: el paquete trae las 10 fichas, los 3 errores, y una fila inventada no aparece", () => {
  for (const id of IDS) assert.ok(fila(id), `falta ${id}`);
  for (const k of ["A", "B", "C"]) assert.ok(fila(k), `falta el error ${k}`);
  assert.equal(fila("mc-99"), undefined);
});

test("★★★ las 10 fichas: el texto, la respuesta y el acierto son los del paquete, ficha por ficha", () => {
  assert.deepEqual(D.FICHAS_T6_ACT7.map((f) => f.id), IDS);
  for (const id of IDS) {
    const f = ficha(id);
    const [, texto, respuesta, acierto] = fila(id);
    assert.equal(f.texto, sinCifra(texto), `${id}: texto`);
    assert.equal(RESPUESTA[clave(f)], respuesta, `${id}: respuesta`);
    assert.ok(f.acierto.startsWith("✅ Sí. "), `${id}: el acierto empieza con «✅ Sí.»`);
    assert.equal(sinEmoji(f.acierto), sinCifra(acierto), `${id}: acierto`);
  }
  /* 4 de anulación directa, 3 al cierre, 3 al castigar. */
  const cuenta = (k) => D.FICHAS_T6_ACT7.filter((f) => clave(f) === k).length;
  assert.deepEqual([cuenta("directa"), cuenta("provisiones/cierre"), cuenta("provisiones/castigar")], [4, 3, 3]);
});

test("★★★ los errores, el resumen, el texto alternativo, la consigna, el botón, los niveles y las reglas son los del paquete", () => {
  for (const k of ["A", "B", "C"]) {
    assert.ok(D.ERROR_T6_ACT7[k].startsWith("❌ "));
    assert.equal(sinEmoji(D.ERROR_T6_ACT7[k]), fila(k)[2], k);
  }
  assert.equal(D.resumenT6Act7("{bien}", "{cuantas}", "{X}"), fila("Resumen")[1]);
  assert.equal(D.ALT_T6_ACT7, fila("Texto alternativo")[1]);
  assert.equal(D.T6_ACT7.consigna, fila("Consigna")[1]);
  assert.equal([D.BOTON_T6_ACT7.nada, D.BOTON_T6_ACT7.falta, D.BOTON_T6_ACT7.colocar].join(" → "), fila("Botón")[1]);
  D.REGLAS_T6_ACT7.forEach((r, k) => assert.equal(r, fila(`Así se juega, ${k + 1}`)[1], `regla ${k + 1}`));
  assert.deepEqual(D.METODOS.map((x) => x.rotulo), ["Anulación directa", "Provisiones"]);
  assert.deepEqual(D.MOMENTOS.map((x) => x.rotulo), ["Al cierre", "Al castigar"]);
  assert.match(FUTABA, /Primer nivel: «Anulación directa» o «Provisiones»\./);
  assert.match(FUTABA, /Segundo nivel, solo para Provisiones: «Al cierre» o «Al castigar»\./);
  /* El tutorial, fuera del banco. */
  assert.equal(D.EJEMPLO_T6_ACT7.texto, fila("Tutorial · ficha")[1]);
  assert.equal(sinEmoji(D.EJEMPLO_T6_ACT7.acierto), fila("Tutorial · resolución")[1]);
  assert.ok(!D.FICHAS_T6_ACT7.some((f) => f.texto === D.EJEMPLO_T6_ACT7.texto));
});

test("★★★ ninguna cifra de legibilidad se pinta, y la actividad no lleva cifras", () => {
  for (const f of [...D.FICHAS_T6_ACT7, D.EJEMPLO_T6_ACT7]) {
    for (const t of [f.texto, f.acierto]) {
      assert.doesNotMatch(t, /\(\d+\)/, t);
      assert.doesNotMatch(t, /\$\d/, t);
    }
  }
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ cada acierto se ve literal tras ✅, ficha por ficha", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    const { caja, desmontar } = await montar([id]);
    assert.equal(caja.querySelector(`[data-ficha="${id}"]`).textContent, f.texto);
    await marcar(caja, f.metodo, f.momento);
    assert.equal(devolucion(caja), f.acierto.replace("✅ ", "✅"), id);
    desmontar();
  }
});

test("★★★ A en TODA ficha de anulación directa puesta en Provisiones; B en TODA ficha de provisiones puesta en Anulación directa; C si falló solo el momento", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    let m = await montar([id]);
    if (f.metodo === D.DIRECTA) {
      await marcar(m.caja, D.PROVISIONES, D.CIERRE);
      assert.equal(devolucion(m.caja), D.ERROR_T6_ACT7.A.replace("❌ ", "❌"), `${id}: A`);
      m.desmontar();
      continue;
    }
    await marcar(m.caja, D.DIRECTA);
    assert.equal(devolucion(m.caja), D.ERROR_T6_ACT7.B.replace("❌ ", "❌"), `${id}: B`);
    m.desmontar();
    m = await montar([id]);
    await marcar(m.caja, D.PROVISIONES, f.momento === D.CIERRE ? D.CASTIGAR : D.CIERRE);
    assert.equal(devolucion(m.caja), D.ERROR_T6_ACT7.C.replace("❌ ", "❌"), `${id}: C`);
    m.desmontar();
  }
});

test("★★★ regla única: tras el segundo fallo, TODA ficha muestra su acierto con «No es esa.» delante, que nombra el método (y el momento)", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    const { caja, desmontar } = await montar([id]);
    const mal = f.metodo === D.DIRECTA ? [D.PROVISIONES, D.CIERRE] : [D.DIRECTA];
    await marcar(caja, ...mal);
    await marcar(caja, ...mal);
    const texto = devolucion(caja);
    assert.equal(texto, `❌No es esa. ${f.acierto.slice("✅ Sí. ".length)}`, id);
    assert.match(texto, f.metodo === D.DIRECTA ? /anulación directa/i : /provisi/i, `${id}: nombra el método`);
    if (f.momento) assert.match(texto, f.momento === D.CIERRE ? /cierre|crea|ajuste|cálculo/i : /castig/i, `${id}: nombra el momento`);
    desmontar();
  }
});

test("★★★ la tanda es el banco entero (10), sin repetir, y barajado", () => {
  const vueltas = Array.from({ length: 20 }, () => L.sortearT6Act7((xs) => [...xs].sort(() => Math.random() - 0.5)).map((f) => f.id));
  for (const v of vueltas) assert.deepEqual([...v].sort(), [...IDS].sort());
  assert.ok(new Set(vueltas.map((v) => v.join())).size > 1, "siempre el mismo orden");
});

test("★★★ puntaje como T1-6: 60 % método y 40 % momento; anulación directa entera; el segundo intento vale la mitad", () => {
  const ev = (id, metodo, momento = null) => L.evaluarT6Act7(ficha(id), { metodo, momento }, 1);
  assert.equal(L.valorDeItemT6Act7(ficha("mc-01"), ev("mc-01", D.DIRECTA)), 1);
  assert.equal(L.valorDeItemT6Act7(ficha("mc-05"), ev("mc-05", D.PROVISIONES, D.CIERRE)), 1);
  assert.equal(L.valorDeItemT6Act7(ficha("mc-05"), ev("mc-05", D.PROVISIONES, D.CASTIGAR)), 0.6);
  assert.equal(L.valorDeItemT6Act7(ficha("mc-05"), ev("mc-05", D.DIRECTA)), 0);
  assert.equal(L.puntuarT6Act7([{ valor: 1 }, { valor: 0.5 }], 2), 75);
});

test("★★ identificadores con b5- y el paquete con la dificultad de Sakuta", () => {
  assert.equal(D.T6_ACT7.id, "b5-t6-a7");
  assert.deepEqual([D.T6_ACT7.dificultad, D.T6_ACT7.fpBase], ["facil", 10]);
  assert.match(GUIA, /fácil · 10 FP/);
  assert.match(D.EJEMPLO_T6_ACT7.id, /^b5-t6-a7-/);
});
