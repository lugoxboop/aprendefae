import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · EL CATÁLOGO Y LA CONEXIÓN DE b5-t6-a2 Y b5-t6-a3 (Célula B).
 *
 *   · las dos están en el bloque de T6, después de b5-t6-a1: evaluativas,
 *     media · 25 y difícil · 50 (Sakuta)
 *   · la vista las abre desde el camino, con el diario encima
 *   · la 0074 trae sus dos filas del servidor, aditiva y repetible
 *   · el panel docente lee cada parte por su rótulo y su instrucción
 *   · «Así se juega» es el ejemplo de cada mesa, fuera de las partes, sin
 *     diario, y su guion arma el asiento hasta confirmarlo
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
const A2 = await import("../../data/contabilidadT6Act2.js");
const A3 = await import("../../data/contabilidadT6Act3.js");
const { default: ProvisionDeElTorito } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { default: DeudaQueVuelve } = await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx");

const MIGRACION = readFileSync(new URL("../../../supabase/migrations/0074_tema6_mesa_de_asientos.sql", import.meta.url), "utf8");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
const CASOS = [
  { id: "b5-t6-a2", D: A2.T6_ACT2, partes: A2.PARTES_T6_ACT2, ejemplo: A2.PROVISION_2007_T6_ACT2, reglas: A2.REGLAS_T6_ACT2, Juego: ProvisionDeElTorito, dificultad: "medio", fp: 25 },
  { id: "b5-t6-a3", D: A3.T6_ACT3, partes: A3.PARTES_T6_ACT3, ejemplo: A3.CASTIGO_T6_ACT3, reglas: A3.REGLAS_T6_ACT3, Juego: DeudaQueVuelve, dificultad: "dificil", fp: 50 },
];

test("★★★ b5-t6-a2 y b5-t6-a3 están en el bloque de T6, en el orden del camino, con la clasificación de Sakuta", () => {
  /* El orden del camino es el de la calidad del 15-oct (Shoko, R9): de lo que se necesita saber primero a lo que lo usa. */
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["b5-t6-a1", "b5-t6-a7", "b5-t6-a4", "b5-t6-a5", "b5-t6-a2", "b5-t6-a3", "b5-t6-a6"]);
  for (const k of CASOS) {
    const c = clasificacionDe("contabilidad", "cuentas-por-cobrar", k.id);
    assert.deepEqual({ modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase }, { modalidad: "evaluativa", dificultad: k.dificultad, fpBase: k.fp }, k.id);
    assert.deepEqual([k.D.dificultad, k.D.fpBase], [k.dificultad, k.fp], `${k.id}: los datos dicen lo mismo que el catálogo`);
    assert.equal(actividadesDeTipo(TEMA, HACER).find((a) => a.id === k.id).nombre, k.D.nombre);
  }
});

test("★★★ la vista abre cada una con su mesa y el diario encima", async () => {
  const { JUEGOS } = await import("../../components/ContabilidadTema6View.jsx");
  for (const k of CASOS) {
    const j = JUEGOS.find((x) => x.id === k.id);
    assert.ok(j, `la vista no ofrece ${k.id}`);
    assert.equal(j.Mecanica, k.Juego);
  }
});

test("★★★ la 0074: un insert aditivo y repetible con las dos filas, su comprobación y la reversión escrita sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('b5-t6-a2',\s*'contabilidad',\s*'cuentas-por-cobrar',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /\('b5-t6-a3',\s*'contabilidad',\s*'cuentas-por-cobrar',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.equal(MIGRACION.match(/insert into/gi).length, 1, "un solo insert");
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id in \('b5-t6-a2', 'b5-t6-a3'\)/);
  for (const id of ["b5-t6-a2", "b5-t6-a3"]) assert.match(MIGRACION, new RegExp(`^--\\s+delete from public\\.actividad_catalogo where activity_id = '${id}';$`, "m"), `${id}: la reversión, comentada`);
});

test("★★ el panel docente lee cada parte por su rótulo y su instrucción", () => {
  for (const k of CASOS) for (const p of k.partes) assert.equal(etiquetaDeItem(k.id, p.id), `${p.rotulo} · ${p.instruccion}`, p.id);
});

test("★★★ «Así se juega» es el ejemplo de cada mesa: fuera de las partes, sin diario, y el guion arma el asiento y lo confirma", async () => {
  for (const k of CASOS) {
    const asi = ASI_SE_JUEGA[k.id];
    assert.ok(asi, `${k.id}: sin «Así se juega»`);
    assert.deepEqual(asi.demo.items, [k.ejemplo]);
    assert.ok(!k.partes.includes(k.ejemplo), "el ejemplo no es una parte");
    assert.deepEqual(asi.pasos, k.reglas);
    assert.equal(asi.consigna, k.D.consigna);
    assert.doesNotMatch(asi.alt, /^Ejemplo resuelto/);
    const caja = document.createElement("div");
    document.body.appendChild(caja);
    const raiz = createRoot(caja);
    const Marco = ({ children }) => React.createElement("div", null, children);
    await act(async () => { raiz.render(React.createElement(k.Juego, { Marco, items: asi.demo.items, modoDemo: true })); });
    assert.equal(caja.querySelector("[data-libro-diario]"), null, `${k.id}: la demo no lleva diario`);
    assert.equal(caja.querySelector("[data-rotulo-parte]"), null, `${k.id}: el ejemplo no lleva número de asiento`);
    const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
    for (const t of asi.guion.toques) {
      const el = caja.querySelector(t.en);
      assert.ok(el, `${k.id}: el guion toca «${t.en}» y no está`);
      await act(async () => {
        if (t.escribe) { poner.call(el, t.escribe); el.dispatchEvent(new w.Event("input", { bubbles: true })); } else el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      });
    }
    assert.ok(caja.querySelector("[data-visto-parte]"), `${k.id}: el guion termina con el asiento bien`);
    assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent), k.ejemplo.resolucion);
    act(() => raiz.unmount());
    caja.remove();
  }
});
