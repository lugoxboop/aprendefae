/*
 * Macro 2026 · las mascotas del camino (24-nov, Mateo). Cada nodo lleva la
 * mascota de la escena de su pieza (ESCENAS, mismo id y pose); se ven una de
 * cada dos, contadas desde el nodo que toca, y dos seguidas nunca son de la
 * misma especie, empiece donde empiece el estudiante. Son decorativas: capa
 * aria-hidden, alt vacío, sin foco. Y es OPCIONAL: sin `mascotas`, el camino
 * compartido no pinta nada nuevo (la foto de camino-sin-cambios lo vigila
 * para las otras materias).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(0), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.CSS = { escape: (v) => String(v) };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { default: CaminoHacer, nodosConMascota, ALTO_MASCOTA, ALTO_MASCOTA_ACTUAL } = await import("../../components/shared/CaminoHacer.jsx");
const { mascotasDelCamino, piezasVisibles, TEMAS_2026, textosDelTema } = await import("../TemaMacro2026.jsx");
const { MASCOTAS } = await import("../comun/mascotas.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { nodosDe } = await import("../../hacer/completadas.js");

const caminos = await Promise.all(Object.keys(TEMAS_2026).map(async (temaId) => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === temaId);
  const vis = new Set(piezasVisibles(temaId, HACER).map((p) => p.id));
  const ids = actividadesDeTipo(tema, HACER).filter((a) => vis.has(a.id)).map((a) => a.id);
  const { ESCENAS } = await textosDelTema(temaId);
  return { temaId, ids, ESCENAS, mascotas: mascotasDelCamino(ids, ESCENAS) };
}));

test("las mascotas del camino salen de ESCENAS: mismo id, misma pose, su archivo y su especie", () => {
  for (const { temaId, ids, ESCENAS, mascotas } of caminos) {
    assert.ok(ids.length >= 5, `${temaId}: camino con sus retos`);
    for (const id of ids) {
      const m = ESCENAS[id]?.mascota;
      if (!m) { assert.equal(mascotas[id], undefined, `${temaId}/${id}: sin mascota en su escena, sin mascota en el camino`); continue; }
      const f = mascotas[id];
      assert.equal(f.id, m.id, `${temaId}/${id}: id`);
      assert.equal(f.pose, m.pose, `${temaId}/${id}: pose`);
      assert.equal(f.especie, MASCOTAS[m.id].especie, `${temaId}/${id}: especie`);
      assert.equal(f.src, `/macro2026/mascotas/${MASCOTAS[m.id].archivo || m.id}-${m.pose}.webp`);
      assert.deepEqual([f.w, f.h], MASCOTAS[m.id].poses[m.pose]);
    }
  }
});

test("en ningún camino se ven dos mascotas seguidas de la misma especie, toque el nodo que toque", () => {
  for (const { temaId, ids, mascotas } of caminos) {
    const nodos = ids.map((id) => ({ id, completada: false }));
    for (let actual = 0; actual < ids.length; actual += 1) {
      const vistas = nodosConMascota(nodos, mascotas, actual).map(({ nodo }) => mascotas[nodo.id].especie);
      assert.ok(nodosConMascota(nodos, mascotas, actual).some(({ i }) => i === actual) || !mascotas[ids[actual]], `${temaId}: la del nodo que toca está entre las de su camino`);
      for (let k = 1; k < vistas.length; k += 1) {
        assert.notEqual(vistas[k], vistas[k - 1], `${temaId}, tocando el ${actual + 1}: ${vistas.join(" → ")}`);
      }
    }
  }
});

async function montar(props) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(CaminoHacer, props)); });
  return { el, desmontar: async () => { await act(async () => raiz.unmount()); el.remove(); } };
}

test("montado: una de cada dos desde el nodo que toca, decorativas (aria-hidden, alt vacío, sin foco)", async () => {
  const { ids, mascotas } = caminos[0];
  const hechas = new Set(ids.slice(0, 1));
  const acts = ids.map((id) => ({ id, nombre: id, clasificacion: { dificultad: "facil" } }));
  const m = await montar({ nodos: nodosDe(acts, hechas), mascotas });
  try {
    const capas = [...m.el.querySelectorAll("[data-mascotas-camino]")];
    assert.ok(capas.length >= 1);
    for (const capa of capas) {
      assert.equal(capa.getAttribute("aria-hidden"), "true");
      const slots = [...capa.querySelectorAll("[data-mascota-camino]")];
      const esperados = ids.filter((id, i) => i % 2 === 1 && mascotas[id]);
      assert.deepEqual(slots.map((s) => s.dataset.mascotaCamino), esperados);
      for (const s of slots) {
        const f = mascotas[s.dataset.mascotaCamino];
        assert.equal(s.dataset.mascota, f.id);
        assert.equal(s.dataset.pose, f.pose);
        assert.equal(s.hasAttribute("tabindex"), false);
        assert.equal(s.querySelector("img").getAttribute("alt"), "");
        assert.ok(Number(s.querySelector("img").getAttribute("height")) >= ALTO_MASCOTA);
      }
      assert.equal(slots[0].dataset.estado, "siguiente");
      assert.equal(Number(slots[0].querySelector("img").getAttribute("height")), ALTO_MASCOTA_ACTUAL);
      assert.equal(capa.querySelectorAll("[tabindex], button, a").length, 0, "nada enfocable");
    }
    const css = m.el.innerHTML;
    assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.fae-ch-masc-mueve, \.fae-ch-masc-cuerpo\.fae-ch-menea \{ animation: none !important; \}/);
    assert.doesNotMatch(css, /E76F51/i, "sin coral");
    assert.doesNotMatch(css, /fae-ch-globo|Te toca/, "sin globo (Mateo, 24-nov)");
  } finally { await m.desmontar(); }
});

test("sin `mascotas` el camino compartido no pinta nada de esto", async () => {
  const { ids } = caminos[0];
  const acts = ids.map((id) => ({ id, nombre: id, clasificacion: { dificultad: "facil" } }));
  const m = await montar({ nodos: nodosDe(acts, new Set()) });
  try {
    assert.equal(m.el.querySelector("[data-mascotas-camino]"), null);
    assert.doesNotMatch(m.el.innerHTML, /fae-ch-masc/);
  } finally { await m.desmontar(); }
});
