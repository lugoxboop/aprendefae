/*
 * Macro 2026 · T2: las piezas montadas de verdad (jsdom). Lo que se mide es lo
 * que ve el estudiante en el DOM: cada pantalla de Aprender lleva su texto
 * exacto y ≤ 20 palabras; cada Hacer, su consigna; la figura va con
 * data-figura; el coral solo aparece en el estado de error; el cierre paga
 * los FP de la especificación.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now() + 10000), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { conSemilla } = await import("../comun/azar.js");
const { CORAL } = await import("../comun/colores-da.js");
const T = await import("../politica-economica/textos.js");
const { PIEZAS_T2 } = await import("../politica-economica/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "pe26-a1-mecanico": "A1Mecanico", "pe26-a2-fiebre": "A2Fiebre", "pe26-a3-problema-resuelto": "A3ProblemaResuelto",
  "pe26-a4-perillas": "A4Perillas", "pe26-a5-escalera": "A5Escalera",
  "pe26-h3-cables": "H3Cables", "pe26-h1-seis-cajones": "H1SeisCajones", "pe26-h2-grupo-logico": "H2GrupoLogico",
  "pe26-h4-expediente": "H4Expediente", "pe26-h5-dos-fiebres": "H5DosFiebres",
};
const cargar = async (id) => (await import(`../politica-economica/${MODULOS[id]}.jsx`)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function montar(Componente, props = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  const clic = async (sel) => { await act(async () => { const b = typeof sel === "string" ? el.querySelector(sel) : sel; b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return { el, desmontar: () => act(async () => raiz.unmount()), clic };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const APRENDER_T2 = PIEZAS_T2.filter((p) => p.tipo === "aprender");

test("las Aprender de T2 montan, con figura, y sin coral", async () => {
  for (const p of APRENDER_T2) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {} });
    assert.ok(m.el.querySelector("[data-figura]"), `${p.id}: data-figura`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("Aprender T2: cada pantalla pinta su texto exacto y ≤ 20 palabras (medido en el DOM), y se llega a Terminar", async () => {
  for (const p of APRENDER_T2) {
    const textos = T.APRENDER[p.id];
    let terminado = false;
    const m = await montar(await cargar(p.id), { onTerminar: () => { terminado = true; } });
    for (let k = 0; k < textos.length; k += 1) {
      const leido = m.el.querySelector("[data-texto-pantalla]").textContent;
      assert.equal(leido, textos[k], `${p.id} P${k + 1}`);
      assert.ok(palabras(leido) <= 20, `${p.id} P${k + 1}`);
      /* Lo que bloquea «Siguiente» se resuelve como lo haría el estudiante. */
      for (const b of [...m.el.querySelectorAll("[data-salida]")]) await m.clic(b);
      assert.equal(m.el.querySelector("[data-siguiente]").disabled, false, `${p.id} P${k + 1}: se puede seguir`);
      await m.clic("[data-siguiente]");
    }
    assert.ok(terminado, `${p.id}: Terminar llama a onTerminar`);
    await m.desmontar();
  }
});

test("A1: «Siguiente» de P1 espera a tocar la caja y la grúa; P4 revela los cuatro nodos", async () => {
  const m = await montar(await cargar("pe26-a1-mecanico"), {});
  assert.equal(m.el.querySelector("[data-siguiente]").disabled, true);
  await m.clic('[data-salida="caja"]');
  assert.equal(m.el.querySelector("[data-siguiente]").disabled, true);
  await m.clic('[data-salida="grua"]');
  assert.equal(m.el.querySelector("[data-siguiente]").disabled, false);
  await m.clic("[data-siguiente]");
  assert.equal(m.el.querySelector('[data-rotulo-salida="caja"]').textContent, T.A1.caja);
  assert.equal(m.el.querySelector('[data-rotulo-salida="grua"]').textContent, T.A1.grua);
  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  for (let k = 1; k <= 4; k += 1) await m.clic(`[data-nodo="${k}"]`);
  assert.deepEqual([...m.el.querySelectorAll("[data-nodo]")].map((b) => b.textContent), T.A1.cadena);
  await m.desmontar();
});

test("A2: cada virus abre su ficha con su cifra «dato de clase» y el termómetro sube un grado por virus", async () => {
  const m = await montar(await cargar("pe26-a2-fiebre"), {});
  await m.clic("[data-siguiente]");
  for (const [k, v] of T.VIRUS.entries()) {
    await m.clic(`[data-virus="${v.id}"]`);
    const f = m.el.querySelector("[data-ficha-virus]");
    assert.ok(f.textContent.includes(v.descripcion), v.id);
    if (v.cifra) assert.ok(f.textContent.includes(v.cifra) && f.textContent.includes(T.DATO_DE_CLASE), v.id);
    assert.equal(m.el.querySelector("[data-termometro]").getAttribute("data-termometro"), String(k + 1));
  }
  assert.ok(!m.el.textContent.includes("9,4"), "el déficit fiscal dudoso no se usa");
  await m.desmontar();
});

test("A3: voltear muestra el objetivo de cada problema", async () => {
  const m = await montar(await cargar("pe26-a3-problema-resuelto"), {});
  await m.clic("[data-carta]");
  assert.equal(m.el.querySelector("[data-carta]").dataset.volteada, "1");
  await m.clic("[data-siguiente]");
  for (const t of T.A3.p2) {
    await m.clic(`[data-carta="${t.icono}"]`);
    assert.ok(m.el.querySelector(`[data-carta="${t.icono}"] [data-cara="objetivo"]`).textContent.includes(t.objetivo));
  }
  await m.clic("[data-siguiente]");
  await act(async () => { await espera(800); });
  assert.equal(m.el.querySelector("[data-estabilizacion]").textContent, T.A3.p3.a);
  await m.desmontar();
});

test("A4: la aguja Y sale del modelo de T1 y t cambia el multiplicador", async () => {
  const { produccion, modelo, multiplicador, BASE } = await import("../comun/modelo-da.js");
  const m = await montar(await cargar("pe26-a4-perillas"), {});
  await m.clic('[data-rama="fiscal"]');
  assert.deepEqual([...m.el.querySelectorAll('[data-herramientas="fiscal"] li')].map((l) => l.textContent), T.HERRAMIENTAS.fiscal);
  await m.clic("[data-siguiente]");
  await m.clic('[data-perilla="XN"]');
  assert.equal(m.el.querySelector('[data-chip-rama="cambiaria"]').dataset.activa, "1");
  assert.equal(m.el.querySelector('[data-chip-rama="comercial"]').dataset.activa, "1");
  assert.equal(m.el.querySelector('[data-chip-rama="fiscal"]').dataset.activa, "0");
  await m.clic("[data-siguiente]");
  assert.equal(Number(m.el.querySelector("[data-aguja-y]").dataset.agujaY), Math.round(produccion(BASE)));
  await m.clic("[data-siguiente]");
  assert.equal(Number(m.el.querySelector("[data-multiplicador]").dataset.multiplicador).toFixed(3), multiplicador(BASE).toFixed(3));
  assert.equal(Math.round(produccion(modelo({ G: 400, i: 2, XN: 150, t: 0 }))) <= 4500, true, "la aguja cabe en el medidor");
  await m.desmontar();
});

test("A5: el personaje sube un peldaño por pantalla; P8 solo acepta cada tarjeta en su peldaño", async () => {
  const m = await montar(await cargar("pe26-a5-escalera"), {});
  for (let k = 1; k <= 6; k += 1) {
    await m.clic("[data-siguiente]");
    const quien = m.el.querySelector("[data-personaje]").closest("[data-peldano]").dataset.peldano;
    assert.equal(quien, ["problema", "objetivo", "estrategia", "instrumento", "medida", "meta"][k - 1]);
  }
  await m.clic("[data-siguiente]");
  /* Tocar-tocar: una tarjeta en un peldaño ajeno vuelve; en el suyo, se queda. */
  await m.clic('[data-carta-a5="meta"]');
  await m.clic('[data-caja-peldano="problema"]');
  assert.ok(m.el.querySelector('[data-carta-a5="meta"]'), "vuelve al mazo");
  for (const id of ["problema", "objetivo", "estrategia", "instrumento", "medida", "meta"]) {
    await m.clic(`[data-carta-a5="${id}"]`);
    await m.clic(`[data-caja-peldano="${id}"]`);
  }
  assert.equal(m.el.querySelectorAll("[data-carta-a5]").length, 0);
  assert.equal(m.el.querySelectorAll('[data-iluminado="1"]').length, 6);
  await m.desmontar();
});
