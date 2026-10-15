import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA VIGA DE LA BALANZA Y SUS PLATILLOS INCLINAN HACIA EL MISMO LADO (Xeno).
 *
 * `gradosDe` es positivo cuando pesa el DEBE: el platillo izquierdo baja. Los
 * platillos seguían esa convención y la viga NO: la rotaba con el mismo número
 * y, en CSS, un ángulo positivo gira en el sentido de las agujas del reloj,
 * que baja el extremo derecho. Con inclinación = 1 la viga bajaba por la
 * derecha y el platillo izquierdo bajaba por la izquierda: el dibujo se
 * contradecía a sí mismo, y el número, que es lo que prueban las demás
 * pruebas, seguía bien.
 *
 * Aquí se lee el ángulo CSS de la viga, se calcula qué extremo queda más
 * abajo, y se compara con el platillo que queda más abajo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node,
  SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { Balanza } = await import("../../components/mecanicas/libros/verbos.jsx");

const montar = async (inclinacion) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Balanza, { inclinacion })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

/** El ángulo CSS de la viga, en grados (positivo = sentido de las agujas del reloj). */
const anguloDeLaViga = (caja) => {
  const viga = [...caja.querySelectorAll("div[aria-hidden]")].find((d) => /rotate\(/.test(d.style.transform));
  assert.ok(viga, "no encontré la viga");
  return Number.parseFloat(/rotate\((-?[\d.]+)deg\)/.exec(viga.style.transform)[1]);
};
const topDe = (caja, donde) => Number.parseFloat(caja.querySelector(`[data-platillo="${donde}"]`).style.top);

/*
 * Con la pantalla y=abajo, un giro de θ (agujas del reloj, positivo) deja el
 * extremo izquierdo en y = −(w/2)·sen θ. Más abajo = y mayor = θ negativo.
 */
const extremoMasBajo = (theta) => (theta < 0 ? "izquierda" : theta > 0 ? "derecha" : null);
const platilloMasBajo = (caja) => {
  const [i, d] = [topDe(caja, "izquierda"), topDe(caja, "derecha")];
  return i > d ? "izquierda" : d > i ? "derecha" : null;
};

test("★★★ la viga baja por el MISMO lado que el platillo que pesa más", async () => {
  for (const inclinacion of [1, 0.6, 0.15, -0.15, -0.6, -1, 0]) {
    const t = await montar(inclinacion);
    try {
      const theta = anguloDeLaViga(t.caja);
      assert.equal(
        extremoMasBajo(theta), platilloMasBajo(t.caja),
        `inclinación ${inclinacion}: la viga baja por ${extremoMasBajo(theta)} y el platillo por ${platilloMasBajo(t.caja)}`,
      );
    } finally { t.desmontar(); }
  }
});

test("★★ pesa el debe: la viga baja por la izquierda; pesa el haber: por la derecha", async () => {
  const debe = await montar(1);
  const haber = await montar(-1);
  try {
    assert.equal(extremoMasBajo(anguloDeLaViga(debe.caja)), "izquierda");
    assert.equal(extremoMasBajo(anguloDeLaViga(haber.caja)), "derecha");
  } finally { debe.desmontar(); haber.desmontar(); }
});

test("★ el ángulo de la viga es el de `data-balanza`, solo que con el sentido de CSS", async () => {
  for (const inclinacion of [1, 0.4, -0.4, -1]) {
    const t = await montar(inclinacion);
    try {
      const grados = Number(t.caja.querySelector("[data-balanza]").dataset.balanza);
      assert.equal(anguloDeLaViga(t.caja), -grados, `inclinación ${inclinacion}`);
    } finally { t.desmontar(); }
  }
});

test("★ nivelada: viga recta y platillos a la misma altura", async () => {
  const t = await montar(0);
  try {
    assert.equal(Math.abs(anguloDeLaViga(t.caja)), 0);
    assert.equal(topDe(t.caja, "izquierda"), topDe(t.caja, "derecha"));
  } finally { t.desmontar(); }
});
