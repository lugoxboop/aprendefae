/*
 * Macro 2026 · T1: las 12 piezas montadas de verdad (jsdom). Lo que se mide
 * aquí es lo que ve el estudiante en el DOM, no lo que dice el archivo de
 * textos: cada pantalla de Aprender lleva su texto exacto y ≤ 20 palabras;
 * cada Hacer, su consigna; la figura va con data-figura; el coral solo
 * aparece en el estado de error; y el cierre paga los FP de la especificación.
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
const { CSS_DA } = await import("../comun/ui.jsx");
const T = await import("../demanda-agregada/textos.js");
const { PIEZAS_T1 } = await import("../demanda-agregada/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "da26-a0-ley-demanda": "A0LeyDemanda",
  "da26-a1-carrito": "A1Carrito", "da26-h1-llena-carrito": "H1LlenaCarrito", "da26-a2-vaso-renta": "A2VasoRenta",
  "da26-a3-columpio-tasa": "A3ColumpioTasa", "da26-a4-no-miran-renta": "A4NoMiranRenta", "da26-h4-empresario": "H4Empresario",
  "da26-a5-bisagra-ascensor": "A5BisagraAscensor", "da26-h3-gira-o-sube": "H3GiraOSube", "da26-a6-eco-multiplicador": "A6EcoMultiplicador",
  "da26-h2-arma-formula": "H2ArmaFormula", "da26-h5-libreta": "H5Libreta", "da26-h6-meta": "H6Meta",
};
const cargar = async (id) => (await import(`../demanda-agregada/${MODULOS[id]}.jsx`)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function montar(Componente, props = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  /* Rediseño (escenas): las Hacer abren con la tarjeta de inicio; se pasa como el estudiante. */
  const empezar = el.querySelector("[data-empezar]");
  if (empezar) await act(async () => { empezar.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  return { el, desmontar: () => act(async () => raiz.unmount()), clic: async (sel) => { await act(async () => { el.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); } };
}

/* Lo pintado sin las hojas de estilo: ahí es donde no puede haber coral. */
const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);

test("las 12 piezas montan, con figura, y sin coral antes de cualquier error", async () => {
  for (const p of PIEZAS_T1) {
    const C = await cargar(p.id);
    const m = await montar(C, { onTerminar: () => {}, rng: conSemilla(3) });
    assert.ok(m.el.querySelector("[data-figura]"), `${p.id}: data-figura`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    if (p.tipo === "hacer") assert.equal(m.el.querySelector("[data-consigna]").textContent, T.CONSIGNAS[p.id]);
    await m.desmontar();
  }
});

test("Aprender: cada pantalla pinta su texto exacto y ≤ 20 palabras (medido en el DOM)", async () => {
  for (const [id, textos] of Object.entries(T.APRENDER)) {
    const C = await cargar(id);
    const m = await montar(C, { onTerminar: () => {} });
    for (let k = 0; k < textos.length; k += 1) {
      const leido = m.el.querySelector("[data-texto-pantalla]").textContent;
      assert.equal(leido, textos[k], `${id} P${k + 1}`);
      assert.ok(palabras(leido) <= 20, `${id} P${k + 1}`);
      /* Lo que bloquea «Siguiente» se resuelve como lo haría el estudiante. */
      for (const sel of ["[data-mano]:not([aria-pressed=true])", "[data-apuesta=mas]"]) {
        let b = m.el.querySelector(sel);
        while (b && b.closest("[data-pieza]") && !b.disabled && m.el.querySelector("[data-siguiente]")?.disabled) {
          await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
          b = m.el.querySelector(sel);
        }
      }
      if (k < textos.length - 1) {
        assert.equal(m.el.querySelector("[data-siguiente]").disabled, false, `${id} P${k + 1}: se puede seguir`);
        await m.clic("[data-siguiente]");
      }
    }
    await m.desmontar();
  }
});

test("todas las reglas de estilo con coral son de error ([data-estado=\"mal\"] o .da26-marca-mal)", async () => {
  const hojas = [CSS_DA];
  for (const p of PIEZAS_T1) {
    const C = await cargar(p.id);
    const m = await montar(C, { onTerminar: () => {}, rng: conSemilla(1) });
    m.el.querySelectorAll("style").forEach((s) => hojas.push(s.textContent));
    await m.desmontar();
  }
  let con = 0;
  for (const hoja of hojas) {
    for (const regla of hoja.split("}")) {
      if (!regla.toLowerCase().includes(CORAL.toLowerCase())) continue;
      con += 1;
      const selector = regla.split("{")[0];
      assert.ok(/data-estado="mal"|marca-mal/.test(selector), `coral fuera de error: ${selector.trim()}`);
    }
  }
  assert.ok(con >= 3, "el coral sí existe para el error");
});

test("H1: errar muestra la retro de ESE destino y el borde coral 300 ms; acertar no lleva coral", async () => {
  const C = await cargar("da26-h1-llena-carrito");
  const m = await montar(C, { onTerminar: () => {}, rng: conSemilla(7) });
  const id = m.el.querySelector("[data-ficha]").dataset.ficha;
  const ficha = T.BANCO_H1.find((f) => f.id === id);
  const mal = ["C", "I", "G", "XN"].find((k) => k !== ficha.correcta);
  await m.clic(`[data-mano="${mal}"]`);
  assert.equal(m.el.querySelector("[data-retro]").textContent, ficha.retro[mal]);
  assert.equal(m.el.querySelector("[data-ficha]").dataset.estado, "mal");
  assert.equal(m.el.querySelector("[data-retro]").dataset.estado, "mal");
  await act(async () => { await espera(350); });
  assert.equal(m.el.querySelector("[data-ficha]").dataset.estado, undefined, "el coral dura 300 ms");
  await m.clic(`[data-mano="${ficha.correcta}"]`);
  assert.equal(m.el.querySelector(`[data-mano="${ficha.correcta}"]`).dataset.estado, "bien");
  assert.ok(!/data-estado="mal"/.test(sinEstilos(m.el)));
  await m.desmontar();
});

test("H1 completa: 8 fichas, puntaje = aciertos al primer intento / 8, con subtemas", async () => {
  const C = await cargar("da26-h1-llena-carrito");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(11) });
  for (let k = 0; k < 8; k += 1) {
    const ficha = T.BANCO_H1.find((f) => f.id === m.el.querySelector("[data-ficha]").dataset.ficha);
    if (k === 0) await m.clic(`[data-mano="${["C", "I", "G", "XN"].find((x) => x !== ficha.correcta)}"]`);
    await m.clic(`[data-mano="${ficha.correcta}"]`);
    await act(async () => { await espera(700); });
  }
  assert.ok(res, "terminó");
  assert.equal(res.detalle.length, 8);
  assert.equal(res.pct, Math.round((7 / 8) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.includes("da-componentes")));
  await m.desmontar();
});

test("H5: tocar una verdadera da su retro y la deja «correcta»; la falsa se tacha y se corrige", async () => {
  const C = await cargar("da26-h5-libreta");
  const m = await montar(C, { onTerminar: () => {}, rng: conSemilla(2) });
  const pg = T.BANCO_H5.find((p) => p.id === m.el.querySelector("[data-pagina]").dataset.pagina);
  const verdadera = m.el.querySelector(".da26-h5-linea:not([data-falsa])");
  const linea = pg.lineas.find((l) => l.id === verdadera.dataset.linea);
  await m.clic(`.da26-h5-linea[data-linea="${linea.id}"]`);
  assert.equal(m.el.querySelector("[data-retro]").textContent, linea.retro);
  assert.equal(m.el.querySelector(`[data-linea="${linea.id}"]`).dataset.estado, "mal");
  await act(async () => { await espera(350); });
  assert.equal(m.el.querySelector(`[data-linea="${linea.id}"]`).dataset.estado, "bien");
  await m.clic("[data-falsa]");
  await act(async () => { await espera(50); });
  assert.equal(m.el.querySelector("[data-correccion]").getAttribute("aria-label"), pg.correccion);
  await m.desmontar();
});

test("H4: al revelar, cada eslabón errado muestra su retro del banco", async () => {
  const C = await cargar("da26-h4-empresario");
  const m = await montar(C, { onTerminar: () => {}, rng: conSemilla(4) });
  const flechas = m.el.querySelectorAll(".da26-h4-flecha");
  for (const f of flechas) await act(async () => { f.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  await m.clic("[data-explicar]");
  /* La cadena se enciende eslabón por eslabón: un turno de efecto por eslabón. */
  for (let k = 0; k < 4; k += 1) await act(async () => { await espera(20); });
  const titular = m.el.querySelector("[data-titular]").textContent;
  const hdr = T.BANCO_H4.find((x) => titular.includes(x.titular));
  hdr.eslabones.forEach(([, dir], k) => {
    const retro = m.el.querySelector(`[data-retro-eslabon="${k + 1}"]`);
    if (dir === 1) assert.equal(retro, null, `eslabón ${k + 1} acertado`);
    else assert.equal(retro.textContent, hdr.retro[k]);
  });
  await m.desmontar();
});

test("cierre: los FP que pagaría el motor por una partida perfecta son los de la especificación", () => {
  const esperado = { "da26-h1-llena-carrito": 10, "da26-h4-empresario": 50, "da26-h3-gira-o-sube": 25, "da26-h2-arma-formula": 75, "da26-h5-libreta": 50, "da26-h6-meta": 75 };
  for (const p of PIEZAS_T1.filter((x) => x.tipo === "hacer")) {
    const partida = partidaDePrevia(p, { pct: 100, detalle: [{ item: "x", ok: true }], duracionMs: 10 * 60 * 1000 });
    assert.equal(partida.aviso.fp, esperado[p.id], p.id);
    assert.equal(partida.actividadId, null, "sin estrellas ni escritura");
  }
});
