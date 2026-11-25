import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * La secuencia del momento de racha en pantalla: fases, mensaje, calendario,
 * saltar con un toque. Desde el 25-nov la protagoniza la mascota del
 * estudiante, feliz, con una llama viva detrás (ya no el teseracto).
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

test("la secuencia: la mascota feliz con su llama, el número que sube y luego la semana, que espera al estudiante", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    assert.equal(m.fase(), "entrada");
    assert.ok(m.caja.textContent.includes("Pasaste de racha 7 a 8"));
    assert.ok(m.caja.querySelector("[data-mascota-racha] [data-mascota]"), "la mascota es la protagonista");
    assert.equal(m.caja.querySelector("[data-mascota-racha] [data-mascota]").dataset.animo, "feliz", "y está feliz");
    assert.equal(m.caja.querySelector("[data-llama-grande] [data-llama-racha]").dataset.llamaRacha, "viva", "con la llama viva detrás");
    assert.equal(m.caja.querySelector("[data-lienzo-teseracto]"), null, "el teseracto ya no sale aquí");
    assert.equal(m.caja.querySelector("[data-semana-racha]"), null, "nada más compite en la entrada");

    /* El número arranca en el de ayer y salta al de hoy. */
    assert.equal(m.caja.querySelector("[data-numero-racha]").dataset.numeroRacha, "7");
    avanzar(TIEMPOS.cambioNumero);
    assert.equal(m.caja.querySelector("[data-numero-racha]").dataset.numeroRacha, "8");

    avanzar(duracionEntrada(8) - TIEMPOS.cambioNumero - 1);
    assert.equal(m.fase(), "entrada");
    avanzar(1);
    assert.equal(m.fase(), "semana");
    assert.ok(m.caja.querySelector("[data-semana-racha]"));
    assert.ok(m.caja.querySelector("[data-mascota-racha] [data-mascota]"), "la mascota sigue ahí, no se desmonta");

    /* Y ahí se queda: la tarjeta no se cierra sola. */
    avanzar(10 * 60 * 1000);
    assert.equal(m.fase(), "semana");
    assert.equal(m.fin.length, 0);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("la mascota es la del estudiante: su especie y el nombre que le puso", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const perfil = { id: "u1", mascota_especie: "panda", mascota_paleta: "natural", mascota_nombre: "Bambú" };
  const fin = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  try {
    act(() => raiz.render(React.createElement(SecuenciaRacha, { momento: MOMENTO, perfil, onFin: () => fin.push(1) })));
    assert.equal(caja.querySelector("[data-mascota-racha] [data-mascota]").dataset.mascota, "panda");
    avanzar(duracionEntrada(8));
    assert.ok(caja.textContent.includes("Bambú está feliz"));
  } finally {
    act(() => raiz.unmount());
    caja.remove();
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

test("la semana: cada día una llamita; hechos encendidos, hoy con anillo ámbar, pendientes apagados; sin coral", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    avanzar(duracionEntrada(8));
    const dias = [...m.caja.querySelectorAll("[data-dia]")];
    assert.deepEqual(dias.map((d) => d.dataset.dia), ["completado", "pendiente", "completado", "hoy", "pendiente", "pendiente", "pendiente"]);
    const llama = (k) => dias[k].querySelector("[data-llama-racha]").dataset.llamaRacha;
    assert.equal(llama(0), "encendida", "completado: llama encendida");
    assert.equal(llama(3), "apagada", "hoy sin hacer: apagada");
    assert.equal(llama(5), "apagada");
    const circulo = (k) => dias[k].querySelector("span").style;
    assert.match(circulo(3).border, /rgb\(233,\s*196,\s*106\)|#e9c46a/i, "hoy: anillo ámbar");
    assert.doesNotMatch(circulo(5).border, /233/, "pendiente: sin acento");
    assert.ok(m.caja.textContent.includes("Tu racha sigue viva."));
    assert.ok(m.caja.textContent.includes("8 días seguidos"));
    assert.doesNotMatch(m.caja.innerHTML, CORAL);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("la llama: IconoRacha sigue en sus usos pequeños, ya redonda (sin la silueta facetada del piloto)", () => {
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
  assert.ok(importan.includes("components/auth/AccountControl.jsx"), "la ficha de la cuenta también");
  const icono = readFileSync(join(raiz, "components/shared/IconoRacha.jsx"), "utf8");
  assert.ok(icono.includes("racha/Llama.jsx"), "la misma llama del momento grande");
  assert.ok(!icono.includes("points="), "sin polígonos facetados");
  const momento = readFileSync(join(raiz, "components/racha/MomentoRacha.jsx"), "utf8");
  assert.ok(!/import[^;]*Teseracto/.test(momento), "el momento ya no carga el teseracto");
  const app = readFileSync(join(raiz, "App.jsx"), "utf8");
  assert.ok(app.includes("<MomentoRacha />") && !app.includes("AvisoRacha"), "App monta el momento y no el aviso viejo");
});
