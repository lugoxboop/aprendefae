/*
 * Macro 2026 · T2: las cinco Hacer montadas de verdad (jsdom). Se juega como
 * el estudiante, con tocar-tocar, que es lo mismo que usa el teclado y el
 * lector de pantalla; el arrastre lo mide el video. Se comprueba:
 * - la retro de ESE destino;
 * - el coral solo en el error, y solo 300 ms;
 * - el sorteo;
 * - el puntaje al primer intento;
 * - los subtemas de cada ítem;
 * - el FP.
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
const T = await import("../politica-economica/textos.js");
const { PIEZAS_T2 } = await import("../politica-economica/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "pe26-h3-cables": "H3Cables", "pe26-h1-seis-cajones": "H1SeisCajones", "pe26-h2-grupo-logico": "H2GrupoLogico",
  "pe26-h4-expediente": "H4Expediente", "pe26-h5-dos-fiebres": "H5DosFiebres",
};
const cargar = async (id) => (await import(`../politica-economica/${MODULOS[id]}.jsx`)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const PELDANOS = ["problema", "objetivo", "estrategia", "instrumento", "medida", "meta"];

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
const HACER_T2 = PIEZAS_T2.filter((p) => p.tipo === "hacer");

test("las 5 Hacer montan, con su consigna y figura, y sin coral antes de cualquier error", async () => {
  assert.equal(HACER_T2.length, 5);
  for (const p of HACER_T2) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(3) });
    assert.ok(m.el.querySelector("[data-figura]"), `${p.id}: data-figura`);
    assert.equal(m.el.querySelector("[data-consigna]").textContent, T.CONSIGNAS[p.id], `${p.id}: consigna`);
    assert.ok(palabras(T.CONSIGNAS[p.id]) <= 12, `${p.id}: consigna ≤ 12`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("todas las reglas de estilo con coral de las Hacer T2 son de error", async () => {
  const hojas = [CSS_DA];
  for (const p of HACER_T2) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(1) });
    m.el.querySelectorAll("style").forEach((s) => hojas.push(s.textContent));
    await m.desmontar();
  }
  for (const hoja of hojas) {
    for (const regla of hoja.split("}")) {
      if (!regla.toLowerCase().includes(CORAL.toLowerCase())) continue;
      assert.ok(/data-estado="mal"|marca-mal/.test(regla.split("{")[0]), `coral fuera de error: ${regla.split("{")[0].trim()}`);
    }
  }
});

test("sorteo: H1 da 2 por peldaño de 42, H3 8 de 9, H2 3 grupos de 7, H4 4 de 5; y cambia con la semilla", async () => {
  const { prepararH1 } = await import("../politica-economica/H1SeisCajones.jsx");
  const { prepararH3 } = await import("../politica-economica/H3Cables.jsx");
  const { prepararH2 } = await import("../politica-economica/H2GrupoLogico.jsx");
  const { prepararH4 } = await import("../politica-economica/H4Expediente.jsx");
  const h1 = prepararH1(conSemilla(5));
  assert.equal(h1.length, 12);
  for (const p of PELDANOS) assert.equal(h1.filter((e) => e.correcta === p).length, 2, p);
  assert.equal(new Set(h1.map((e) => e.id)).size, 12);
  assert.equal(T.BANCO_H1.length, 42);
  assert.equal(prepararH3(conSemilla(5)).length, 8);
  const h2 = prepararH2(conSemilla(5));
  assert.equal(h2.length, 3);
  for (const g of h2) for (const t of Object.values(g.tarjetas)) assert.equal(t.filter((x) => x.ok).length, 1);
  assert.equal(prepararH4(conSemilla(5)).length, 4);
  const ids = (f) => [1, 2, 3, 4, 5, 6].map((s) => f(conSemilla(s)).map((x) => x.id).join(","));
  for (const f of [prepararH1, prepararH3, prepararH2, prepararH4]) assert.ok(new Set(ids(f)).size > 1, "el sorteo no cambia");
});

test("H1: errar da la retro del par y coral 300 ms; la partida puntúa aciertos al primer intento / 12", async () => {
  const C = await cargar("pe26-h1-seis-cajones");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(9) });
  for (let k = 0; k < 12; k += 1) {
    const t = T.BANCO_H1.find((e) => e.id === m.el.querySelector("[data-tarjeta]").dataset.tarjeta);
    if (k === 0) {
      const mal = PELDANOS.find((p) => p !== t.correcta);
      await m.clic(`[data-caja-peldano="${mal}"]`);
      assert.equal(m.el.querySelector("[data-retro]").textContent, T.RETRO_H1[t.correcta][mal]);
      assert.equal(m.el.querySelector("[data-tarjeta]").dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.el.querySelector("[data-tarjeta]").dataset.estado, undefined, "el coral dura 300 ms");
    }
    await m.clic(`[data-caja-peldano="${t.correcta}"]`);
    assert.equal(m.el.querySelector(`[data-caja-peldano="${t.correcta}"]`).dataset.estado, "bien");
    await act(async () => { await espera(800); });
  }
  assert.ok(res, "terminó");
  assert.equal(res.detalle.length, 12);
  assert.equal(res.pct, Math.round((11 / 12) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.includes("pe-ambitos") && d.subtemas.includes("pe-taller")));
  await m.desmontar();
});

test("H3: el cable equivocado da la retro de ESA toma; el bueno late su término; puntaje / 8", async () => {
  const C = await cargar("pe26-h3-cables");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(4) });
  const enchufes = [...m.el.querySelectorAll("[data-enchufe]")].map((b) => b.dataset.enchufe);
  assert.equal(enchufes.length, 8);
  for (const [k, id] of enchufes.entries()) {
    const x = T.BANCO_H3.find((i) => i.id === id);
    if (k === 0) {
      const mal = ["fiscal", "monetaria", "cambiaria", "comercial"].find((r) => r !== x.rama);
      await m.clic(`[data-enchufe="${id}"]`);
      await m.clic(`[data-toma="${mal}"]`);
      assert.equal(m.el.querySelector("[data-retro]").textContent, x.retro[mal]);
      assert.equal(m.el.querySelector(`[data-enchufe="${id}"]`).dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.el.querySelector(`[data-enchufe="${id}"]`).dataset.estado, undefined);
    }
    await m.clic(`[data-enchufe="${id}"]`);
    await m.clic(`[data-toma="${x.rama}"]`);
    assert.equal(m.el.querySelector(`[data-enchufe="${id}"]`).dataset.conectado, x.rama);
    const latidos = [...m.el.querySelectorAll('[data-termino][data-late="1"]')].map((e) => e.dataset.termino);
    assert.deepEqual(latidos, { fiscal: ["TR", "t", "G"], monetaria: ["i"], cambiaria: ["XN"], comercial: ["XN"] }[x.rama]);
  }
  await act(async () => { await espera(1200); });
  assert.ok(res, "terminó");
  assert.equal(res.pct, Math.round((7 / 8) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.includes("pe-ramas") && d.subtemas.includes("pe-da-ramas")));
  await m.desmontar();
});

test("H2: la distractora cae con su retro y ese peldaño ya no puntúa; 3 grupos, puntaje / 15", async () => {
  const C = await cargar("pe26-h2-grupo-logico");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(6) });
  for (let g = 0; g < 3; g += 1) {
    const grupo = T.BANCO_H2.find((x) => x.id === m.el.querySelector("[data-grupo]").dataset.grupo);
    for (const [k, p] of PELDANOS.slice(1).entries()) {
      const paso = grupo.pasos[p];
      if (g === 0 && k === 0) {
        const d = paso.distractoras[0];
        await m.clic(`[data-tarjeta="${d.n}"]`);
        assert.equal(m.el.querySelector("[data-retro]").textContent, d.retro);
        assert.equal(m.el.querySelector(`[data-tarjeta="${d.n}"]`).dataset.estado, "mal");
        await act(async () => { await espera(450); });
        assert.equal(m.el.querySelector(`[data-tarjeta="${d.n}"]`), null, "cayó por el hueco");
        assert.equal(m.el.querySelectorAll("[data-tarjeta]").length, 2);
      }
      await m.clic(`[data-tarjeta="${paso.correcta}"]`);
      assert.equal(m.el.querySelector(`[data-caja-peldano="${p}"] .pe26-cont`).textContent, T.ENUNCIADOS[paso.correcta]);
    }
    for (let k = 0; k < 8; k += 1) await act(async () => { await espera(130); });
    assert.equal(m.el.querySelectorAll('[data-iluminado="1"]').length, 6, "la escalera se enciende entera");
    assert.equal(m.el.querySelector("[data-bandera]").textContent, `⚑ ${T.H2.bandera}`);
    await m.clic("[data-siguiente-grupo]");
  }
  assert.ok(res, "terminó");
  assert.equal(res.detalle.length, 15);
  assert.equal(res.pct, Math.round((14 / 15) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.includes("pe-taller")));
  await m.desmontar();
});

test("H4: tocar una coherente da su retro y la marca; la errada cae y sube la corrección; puntaje / 4", async () => {
  const C = await cargar("pe26-h4-expediente");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(8) });
  for (let k = 0; k < 4; k += 1) {
    const e = T.BANCO_H4.find((x) => x.id === m.el.querySelector("[data-escalera-h4]").dataset.escaleraH4);
    if (k === 0) {
      const bien = PELDANOS.find((p) => p !== e.errado);
      await m.clic(`[data-caja-peldano="${bien}"]`);
      assert.equal(m.el.querySelector("[data-retro]").textContent, e.peldanos[bien].retro);
      assert.equal(m.el.querySelector(`[data-caja-peldano="${bien}"]`).dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.el.querySelector(`[data-caja-peldano="${bien}"]`).dataset.estado, "visto");
    }
    await m.clic(`[data-caja-peldano="${e.errado}"]`);
    await act(async () => { await espera(450); });
    const c = m.el.querySelector("[data-correccion]");
    assert.equal(c.dataset.correccion, String(e.sube));
    assert.ok(c.textContent.startsWith(T.ENUNCIADOS[e.sube]) && c.textContent.endsWith(e.explicacion));
    assert.ok(palabras(e.explicacion) <= 15);
    await m.clic("[data-siguiente-escalera]");
  }
  assert.ok(res, "terminó");
  assert.equal(res.pct, 75);
  assert.ok(res.detalle.every((d) => d.subtemas.includes("pe-ambitos")));
  await m.desmontar();
});

test("H5: los nueve finales salen de las decisiones, recortados a 1–5; el FP se cobra una vez, completo", async () => {
  const { medidoresH5 } = await import("../politica-economica/H5DosFiebres.jsx");
  for (const [clave, f] of Object.entries(T.FINALES_H5)) {
    const v = medidoresH5(clave.split("+"));
    assert.deepEqual([v.P, v.Y, v.D], [f.P, f.Y, f.D], clave);
    assert.ok(palabras(f.lectura) <= 15, clave);
  }
  localStorage.clear();
  const C = await cargar("pe26-h5-dos-fiebres");
  const res = [];
  const m = await montar(C, { onTerminar: (r) => { res.push(r); } });
  assert.equal(m.el.querySelector("[data-entrada]").textContent, T.ENTRADA_H5);
  await m.clic('[data-opcion="tasa-subir"]');
  assert.equal(m.el.querySelector("[data-retro]").textContent, T.PASOS_H5[0].opciones[0].narracion);
  assert.equal(m.el.querySelector("[data-consigna]").textContent, T.PASOS_H5[1].consigna);
  await m.clic('[data-opcion="gasto-recortar"]');
  assert.equal(m.el.querySelector("[data-lectura]").textContent, T.FINALES_H5["subir+recortar"].lectura);
  assert.equal(m.el.querySelector("[data-cierre]").textContent, T.CIERRE_H5);
  assert.deepEqual(["P", "Y", "D"].map((k) => Number(m.el.querySelector(`[data-medidor="${k}"]`).dataset.valor)), [2, 1, 2]);
  assert.equal(m.el.querySelector("[data-mapa]").dataset.mapa, "1");
  await m.clic("[data-otro]");
  await m.clic('[data-opcion="tasa-igual"]');
  await m.clic('[data-opcion="gasto-igual"]');
  assert.equal(m.el.querySelector("[data-mapa]").dataset.mapa, "2", "el mapa se llena");
  await m.clic("[data-terminar]");
  await m.clic("[data-terminar]");
  assert.equal(res.length, 1, "una sola vez");
  assert.equal(res[0].pct, 100);
  assert.ok(res[0].detalle.every((d) => d.subtemas.length > 0));
  assert.ok(!tieneCoral(sinEstilos(m.el)), "explorar no es errar: sin coral");
  await m.desmontar();
});

test("cierre: los FP de una partida perfecta son los de la especificación (25 / 25 / 150 / 50 / 25)", () => {
  const esperado = { "pe26-h3-cables": 25, "pe26-h1-seis-cajones": 25, "pe26-h2-grupo-logico": 150, "pe26-h4-expediente": 50, "pe26-h5-dos-fiebres": 25 };
  for (const p of HACER_T2) {
    const partida = partidaDePrevia(p, { pct: 100, detalle: [{ item: "x", ok: true }], duracionMs: 10 * 60 * 1000 });
    assert.equal(partida.aviso.fp, esperado[p.id], p.id);
  }
});
