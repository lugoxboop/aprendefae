import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * La secuencia del momento de racha en pantalla: fases, mensaje, calendario,
 * saltar con un toque, y que el fuego siga donde estaba.
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const { SecuenciaRacha, TIEMPOS, duracionEntrada } = await import("../../components/racha/MomentoRacha.jsx");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)/i;
const MOMENTO = { mostrar: true, desde: 7, hasta: 8, hoy: "2026-09-17", semana: ["2026-09-14", "2026-09-16"] };

function montar(momento = MOMENTO) {
  const fin = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(SecuenciaRacha, { momento, onFin: () => fin.push(1) })));
  const fase = () => caja.querySelector("[data-momento-racha]")?.dataset.momentoRacha;
  return { caja, fin, fase, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const avanzar = (ms) => act(() => { mock.timers.tick(ms); });

test("la secuencia: entrada con el mensaje y luego la semana, que espera al estudiante", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    assert.equal(m.fase(), "entrada");
    assert.ok(m.caja.textContent.includes("Pasaste de racha 7 a 8"));
    assert.ok(m.caja.querySelector("[data-lienzo-teseracto]"), "el teseracto es el protagonista");
    assert.equal(m.caja.querySelector("[data-semana-racha]"), null, "nada más compite en la entrada");

    /* Día 8: dos aristas, así que la entrada dura una arista más. */
    assert.equal(duracionEntrada(8) - duracionEntrada(7), TIEMPOS.porArista);
    avanzar(duracionEntrada(8) - 1);
    assert.equal(m.fase(), "entrada");
    avanzar(1);
    assert.equal(m.fase(), "semana");
    assert.ok(m.caja.querySelector("[data-semana-racha]"));
    assert.ok(m.caja.querySelector("[data-lienzo-teseracto]"), "el teseracto sigue ahí, no se desmonta");

    /* Y ahí se queda: la tarjeta no se cierra sola. */
    avanzar(10 * 60 * 1000);
    assert.equal(m.fase(), "semana");
    assert.equal(m.fin.length, 0);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("un toque en cualquier momento lo salta: en la entrada, en la semana, y con Escape", () => {
  for (const cuando of [0, 1200, duracionEntrada(8) + 400]) {
    mock.timers.enable({ apis: ["setTimeout"] });
    const m = montar();
    try {
      avanzar(cuando);
      act(() => { m.caja.querySelector("[data-momento-racha]").dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true })); });
      assert.equal(m.fase(), "salida", `a los ${cuando} ms`);
      avanzar(TIEMPOS.salida);
      assert.equal(m.fin.length, 1);
      /* Un segundo toque no cierra dos veces. */
      act(() => { m.caja.querySelector("[data-momento-racha]")?.dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true })); });
      avanzar(1000);
      assert.equal(m.fin.length, 1);
    } finally {
      m.desmontar();
      mock.timers.reset();
    }
  }
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    act(() => { w.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" })); });
    assert.equal(m.fase(), "salida");
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("la semana: completados llenos teal, hoy con anillo ámbar sin llenar, pendientes en gris; sin coral", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    avanzar(duracionEntrada(8));
    const dias = [...m.caja.querySelectorAll("[data-dia]")];
    assert.deepEqual(dias.map((d) => d.dataset.dia), ["completado", "pendiente", "completado", "hoy", "pendiente", "pendiente", "pendiente"]);
    const circulo = (k) => dias[k].querySelector("span").style;
    assert.match(circulo(0).background, /rgb\(42,\s*157,\s*143\)|#2a9d8f/i, "completado: teal");
    assert.equal(circulo(3).background, "transparent", "hoy: sin relleno");
    assert.match(circulo(3).border, /rgb\(233,\s*196,\s*106\)|#e9c46a/i, "hoy: anillo ámbar");
    assert.equal(circulo(5).background, "transparent");
    assert.doesNotMatch(circulo(5).border, /233|42,\s*157/, "pendiente: gris, sin acento");
    assert.ok(m.caja.textContent.includes("Tu racha sigue viva."));
    assert.ok(m.caja.textContent.includes("8 días seguidos"));
    assert.doesNotMatch(m.caja.innerHTML, CORAL);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("el fuego no se toca: IconoRacha sigue en sus usos pequeños y el momento grande no lo usa", () => {
  const raiz = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
  const archivos = [];
  const recorrer = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { if (f !== "__tests__") recorrer(p); } else if (/\.jsx?$/.test(f)) archivos.push(p);
    }
  };
  recorrer(raiz);
  const importan = archivos.filter((p) => /import\s+IconoRacha\s+from/.test(readFileSync(p, "utf8"))).map((p) => p.replace(/\\/g, "/").replace(raiz.replace(/\\/g, "/"), "").replace(/^\//, ""));
  assert.ok(importan.includes("components/repaso/BannerRepaso.jsx"), "el banner del Repaso conserva la llama");
  assert.ok(!importan.some((p) => p.startsWith("components/racha/")), "el teseracto no la reemplaza ni la importa");
  const icono = readFileSync(join(raiz, "components/shared/IconoRacha.jsx"), "utf8");
  assert.ok(icono.includes('points="20,2 26,14 31,10 36,24 33,38 20,46 7,38 4,24 10,15 14,20"'), "la silueta facetada, intacta");
  const app = readFileSync(join(raiz, "App.jsx"), "utf8");
  assert.ok(app.includes("<MomentoRacha />") && !app.includes("AvisoRacha"), "App monta el momento nuevo y no el aviso viejo");
});
