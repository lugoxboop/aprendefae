import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «SIGUIENTE» SIEMPRE LIBRE EN «ASÍ SE JUEGA» (Levi).
 *
 * Saltar a mitad de la demo tiene que dejarlo todo como si la demo no hubiera
 * existido: ningún reloj vivo, la actividad en su estado inicial, el foco en
 * la actividad, la marca de «visto» guardada y nada más guardado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUE 1 (T1-8, T1-7, T1-4).
 *
 * Lo que no se puede romper:
 *
 *   · la demo es el componente real y NO guarda nada: ni onCompletar, ni FP,
 *     ni intentos, ni una sola escritura
 *   · los ejemplos no son del banco: nadie se encuentra en la partida la
 *     respuesta que acaba de ver resuelta
 *   · sale sola la primera vez, no la segunda, y «¿Cómo se juega?» la trae
 *   · «Siguiente» está apagado hasta que termina la primera pasada
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let movimientoReducido = false;
w.matchMedia = (q) => ({
  matches: q.includes("reduce") ? movimientoReducido : false,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
  scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const AsiSeJuega = (await import("../libros/AsiSeJuega.jsx")).default;
const DondeSeRompio = (await import("../libros/tema1/DondeSeRompio.jsx")).default;
const LaArticulacion = (await import("../libros/tema1/LaArticulacion.jsx")).default;
const QueLePasaACadaUno = (await import("../libros/tema1/QueLePasaACadaUno.jsx")).default;
const { MarcoLibros } = await import("../bloques/marcos.jsx");
const { JUEGOS, JuegoConTutorial } = await import("../../IntroContabilidadView.jsx");
const {
  ASI_SE_JUEGA, EJEMPLO_T1_8, EJEMPLO_T1_4, BANCO_DEMO_T1_7,
} = await import("../../../data/asiSeJuegaBloque1.js");
const {
  T1_4, T1_7, T1_8, SITUACIONES_T1_8, TRANSACCIONES_CAP2, LINEAS, FLECHAS, INFORMES_T1_7,
} = await import("../../../data/contabilidadTema1.js");
const { yaLaVio, marcarVista, claveDe, PREFIJO } = await import("../../../hacer/asiSeJuega.js");
const { ASI_SE_JUEGA: ASI_TODAS } = await import("../../../data/asiSeJuega.js");
const { evaluarT1_7, evaluarT1_4 } = await import("../../../contabilidad/tema1.js");


const T2 = await import("../libros/actividades.jsx");

/*
 * Los relojes, contados. Cada setTimeout/setInterval creado mientras se mira
 * queda apuntado hasta que se dispara (un timeout) o se cancela.
 */
const vivos = new Set();
let mirando = false;
const original = { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
globalThis.setTimeout = (fn, ms, ...a) => {
  if (!mirando) return original.setTimeout(fn, ms, ...a);
  const h = original.setTimeout((...x) => { vivos.delete(h); fn(...x); }, ms, ...a);
  vivos.add(h);
  return h;
};
globalThis.clearTimeout = (h) => { vivos.delete(h); return original.clearTimeout(h); };
globalThis.setInterval = (fn, ms, ...a) => {
  const h = original.setInterval(fn, ms, ...a);
  if (mirando) vivos.add(h);
  return h;
};
globalThis.clearInterval = (h) => { vivos.delete(h); return original.clearInterval(h); };

const llamadasARed = [];
globalThis.fetch = async (...args) => { llamadasARed.push(args); throw new Error("sin red en las pruebas"); };

const montar = (elemento) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const pausa = (ms) => act(async () => { await new Promise((r) => original.setTimeout(r, ms)); });
const contarEscrituras = () => {
  const orig = w.Storage.prototype.setItem;
  const escritas = [];
  w.Storage.prototype.setItem = function (k, v) { escritas.push(k); return orig.call(this, k, v); };
  return { escritas, soltar: () => { w.Storage.prototype.setItem = orig; } };
};

const juegoT1 = (id) => JUEGOS.find((j) => j.id === id);
const tutorialT1_8 = () => React.createElement(JuegoConTutorial, {
  juego: juegoT1(T1_8.id), usuarioId: "u-prueba", Marco: MarcoLibros, acento: "#E9C46A", rotulo: "PRUEBA", onCompletar: () => {},
});
const tutorialSaldo = () => React.createElement(JuegoConTutorial, {
  juego: { id: "cu-saldo-de-la-cuenta", Mecanica: T2.ElSaldoDeLaCuenta }, usuarioId: "u-prueba", onCompletar: () => {}, tituloVisible: false,
});
const sig = (caja) => caja.querySelector("[data-asj-siguiente] button");

test("★★★ «Siguiente» está activo al abrir la pantalla, siempre dice «Siguiente», también con movimiento reducido", () => {
  for (const reducido of [false, true]) {
    movimientoReducido = reducido;
    w.localStorage.clear();
    const { caja, desmontar } = montar(tutorialT1_8());
    try {
      assert.ok(caja.querySelector("[data-asi-se-juega]"), "no salió el tutorial");
      assert.equal(sig(caja).disabled, false, `apagado al abrir (reducido: ${reducido})`);
      assert.equal(sig(caja).textContent, "Siguiente");
      assert.ok(!caja.textContent.includes("Mira el ejemplo"), "sigue el texto «Mira el ejemplo»");
    } finally { desmontar(); movimientoReducido = false; }
  }
});

for (const [nombre, tutorial, mitad, id] of [["T1-8 (con su cascada)", tutorialT1_8, 2700, T1_8.id], ["El Saldo (escribe tecla a tecla)", tutorialSaldo, 2300, "cu-saldo-de-la-cuenta"]]) {
  test(`★★★ ${nombre}: saltar a mitad de la demo no deja ningún reloj vivo, y la actividad empieza limpia y con el foco`, async () => {
    w.localStorage.clear();
    vivos.clear();
    mirando = true;
    const { caja, desmontar } = montar(tutorial());
    try {
      /* A mitad de camino: la demo ya tocó algo y le queda guion. */
      await pausa(mitad);
      assert.equal(caja.querySelector("[data-asj-control]").textContent, "Pausar", "la demo ya había terminado: no es «a mitad»");
      const conteo = contarEscrituras();
      try {
        w.localStorage.clear();
        tocar(sig(caja));
        await pausa(80);
        /* La demo se fue entera: ni pantalla, ni mano, ni onda, ni escenario. */
        assert.equal(caja.querySelector("[data-asi-se-juega]"), null, "la demo sigue montada");
        assert.equal(caja.querySelector("[data-mano], [data-onda], [data-asj-escenario]"), null);
        /* Ningún reloj de la demo vivo. */
        assert.equal(vivos.size, 0, `quedaron ${vivos.size} relojes vivos al saltar`);
        await pausa(400);
        assert.equal(vivos.size, 0, "apareció un reloj nuevo después de saltar");
        /* La marca de «visto» se guardó, y nada más. */
        assert.equal(yaLaVio(id, "u-prueba"), true, "no se guardó «visto»");
        assert.deepEqual(conteo.escritas.filter((k) => !k.startsWith(PREFIJO)), [], "la demo guardó algo");
        assert.ok(conteo.escritas.every((k) => k.endsWith(":u-prueba")), "se guardó algo que no es la marca");
      } finally { conteo.soltar(); }
      /* La actividad, visible y en su estado inicial. */
      const partida = caja.querySelector("[data-partida]");
      assert.equal(partida.hidden, false);
      if (tutorial === tutorialT1_8) {
        assert.equal(partida.querySelectorAll('[data-apagado="si"]').length, 0, "la partida trae puntos apagados de la demo");
        assert.equal(partida.querySelector('[data-elegida="si"]'), null, "la partida trae una elección de la demo");
        assert.equal(partida.querySelector("[data-contador]"), null);
      } else {
        assert.equal(partida.querySelector("input").value, "", "la casilla trae la cifra que escribió la demo");
        assert.equal(partida.querySelector('[role="status"]'), null, "la partida trae una devolución de la demo");
      }
      /* El foco, en la consigna de la actividad. */
      assert.ok(partida.contains(document.activeElement), "el foco no quedó en la actividad");
      assert.ok(document.activeElement.matches("[data-consigna]"), `el foco quedó en ${document.activeElement.tagName}`);
      /* «¿Cómo se juega?» la sigue reabriendo. */
      tocar(partida.querySelector("[data-como-se-juega]"));
      assert.ok(caja.querySelector("[data-asi-se-juega]"), "«¿Cómo se juega?» ya no la reabre");
    } finally { mirando = false; desmontar(); }
    assert.equal(llamadasARed.length, 0, "la demo llamó a la red");
  });
}
