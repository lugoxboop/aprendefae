import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · EL CATÁLOGO Y LA CONEXIÓN DE b5-t5-a2 (Célula B).
 *
 *   · la actividad está en el bloque de T5: evaluativa, difícil, 50 FP
 *   · la vista la abre desde el camino con el diario encima
 *   · la 0072 trae la fila del servidor, aditiva y repetible
 *   · el panel docente lee cada parte por su rótulo y su instrucción
 *   · «Así se juega» es la compra del 1 de mayo, fuera de las cuatro partes,
 *     sin diario, y su guion arma el asiento hasta confirmarlo
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const D = await import("../../data/contabilidadT5Act2.js");
const { default: CierreConDiario } = await import("../../components/mecanicas/libros/tema5/LibroDiario.jsx");

const MIGRACION = readFileSync(new URL("../../../supabase/migrations/0072_tema5_cierre_santa_pacha.sql", import.meta.url), "utf8");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "activos-financieros");

test("★★★ b5-t5-a2 está en el bloque de T5, después de b5-t5-a1: evaluativa, difícil, 50 FP", () => {
  /* Desde N1 de la Célula C (decisión de corte de T5, punto 6), N1, N3, N4, N5 y N7 van entre las dos de B. */
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["b5-t5-a1", "t5-temporal-o-largo-plazo", "t5-revision-que-falta", "t5-el-interes-del-periodo", "t5-gano-o-perdio", "t5-a-que-cuenta-va", "b5-t5-a2"]);
  const c = clasificacionDe("contabilidad", "activos-financieros", "b5-t5-a2");
  assert.deepEqual({ modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase }, { modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.equal(actividadesDeTipo(TEMA, HACER).find((a) => a.id === "b5-t5-a2").nombre, D.T5_ACT2.nombre);
});

test("★★★ la vista abre b5-t5-a2 con el diario encima", async () => {
  const { JUEGOS } = await import("../../components/ContabilidadTema5View.jsx");
  const j = JUEGOS.find((x) => x.id === "b5-t5-a2");
  assert.ok(j, "la vista no ofrece b5-t5-a2");
  assert.equal(j.Mecanica, CierreConDiario);
});

test("★★★ la 0072: un insert aditivo y repetible, con la clasificación del cliente y su comprobación", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('b5-t5-a2',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 'b5-t5-a2';/);
});

test("★★ el panel docente lee cada parte por su rótulo y su instrucción", () => {
  for (const p of D.PARTES_T5_ACT2) assert.equal(etiquetaDeItem("b5-t5-a2", p.id), `${p.rotulo} · ${p.instruccion}`, p.id);
});

test("★★★ «Así se juega» es la compra del 1 de mayo: fuera de las cuatro partes, sin diario, y el guion arma el asiento y lo confirma", async () => {
  const asi = ASI_SE_JUEGA["b5-t5-a2"];
  assert.ok(asi, "sin «Así se juega»");
  assert.deepEqual(asi.demo.items, [D.COMPRA_T5_ACT2]);
  assert.ok(!D.PARTES_T5_ACT2.includes(D.COMPRA_T5_ACT2), "la compra no es una parte");
  assert.deepEqual(asi.pasos, D.REGLAS_T5_ACT2);
  assert.equal(asi.consigna, D.T5_ACT2.consigna);
  /* La demo monta el juego de la vista en modo demo: sin diario, y cada toque del guion tiene dónde caer. */
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const Marco = ({ children }) => React.createElement("div", null, children);
  await act(async () => { raiz.render(React.createElement(CierreConDiario, { Marco, items: asi.demo.items, modoDemo: true })); });
  assert.equal(caja.querySelector("[data-libro-diario]"), null, "la demo no lleva diario");
  assert.equal(caja.querySelector("[data-rotulo-parte]"), null, "la compra no lleva número de asiento");
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  for (const t of asi.guion.toques) {
    const el = caja.querySelector(t.en);
    assert.ok(el, `el guion toca «${t.en}» y no está`);
    await act(async () => {
      if (t.escribe) { poner.call(el, t.escribe); el.dispatchEvent(new w.Event("input", { bubbles: true })); } else el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    });
  }
  assert.ok(caja.querySelector("[data-visto-parte]"), "el guion termina con el asiento bien");
  assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent), D.COMPRA_T5_ACT2.resolucion);
  act(() => raiz.unmount());
  caja.remove();
});
