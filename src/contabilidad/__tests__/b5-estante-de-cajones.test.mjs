import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTANTE DE CAJONES (hoja 3 de Mai, calidad) — en las tres de fichas de
 * la célula (ClasificaDosNiveles): se prueba con b5-t6-a7 y se comprueba la
 * forma en b5-t5-a1 y b5-t6-a1.
 *
 *   · un cajón por respuesta final, con la forma del árbol: el suelto y el
 *     grupo de dos bajo su tapa; los nombres, los de las pestañas;
 *   · lo elegido se ilumina; acertar coloca una lámina en su cajón;
 *   · en el primer fallo no se coloca nada; en el segundo, la lámina va al
 *     cajón CORRECTO;
 *   · la pila y el número dicen cuántas lleva; la lectura, «{nombre}: N fichas».
 * ═══════════════════════════════════════════════════════════════════════════
 */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: QueMetodoYCuando } = await import("../../components/mecanicas/libros/tema6/QueMetodoYCuando.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t6Act7.js");
const D = await import("../../data/contabilidadT6Act7.js");
const { FAE } = await import("../../theme.js");

const ficha = (id) => D.FICHAS_T6_ACT7.find((f) => f.id === id);
const IDS = ["mc-01", "mc-02", "mc-03", "mc-04", "mc-05", "mc-06", "mc-07", "mc-08", "mc-09", "mc-10"];

const montar = async (ids, onCompletar = () => {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = ids.map((id) => (id === D.EJEMPLO_T6_ACT7.id ? D.EJEMPLO_T6_ACT7 : ficha(id)));
  await act(async () => {
    raiz.render(h(QueMetodoYCuando, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const pestana = (caja, id) => caja.querySelector(`[data-nivel1="${id}"]`);
const opcion = (caja, id) => caja.querySelector(`[data-nivel2="${id}"]`);
const botonColocar = (caja) => caja.querySelector("[data-boton-colocar] button");
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
const marcar = async (caja, metodo, momento = null) => {
  if (pestana(caja, metodo).dataset.elegido !== "si") await tocar(pestana(caja, metodo));
  if (momento) await tocar(opcion(caja, momento));
  await tocar(botonColocar(caja));
};
/* Sin el emoji y su espacio: así va en el paquete. */
const sinEmoji = (t) => t.replace(/^(✅|❌) /, "");
const E = await import("../../components/mecanicas/libros/b5/EstanteDeCajones.jsx");
const { CONFIG_T5_ACT1 } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { CONFIG_T6_ACT1 } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const { CONFIG_T6_ACT7 } = await import("../../components/mecanicas/libros/tema6/QueMetodoYCuando.jsx");
const espera = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const cajon = (caja, clave) => caja.querySelector(`[data-cajon="${clave}"]`);
const cuantas = (caja) => Object.fromEntries([...caja.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.querySelector("[data-numero]").textContent)]));
const encendido = (el) => el.style.border.startsWith("2px");

test("★★★ la forma del árbol: el cajón suelto y, bajo la tapa, los dos del segundo nivel, con los nombres de las pestañas (las tres actividades)", async () => {
  for (const config of [CONFIG_T5_ACT1, CONFIG_T6_ACT1, CONFIG_T6_ACT7]) {
    const suelta = config.nivel1.find((x) => x.id !== config.abre);
    const grupo = config.nivel1.find((x) => x.id === config.abre);
    const claves = [suelta.id, ...config.nivel2.map((o) => E.claveDe(grupo.id, o.id))];
    assert.deepEqual(claves.map((k) => E.nombreLeido(config, k)).slice(0, 1), [suelta.rotulo]);
    for (const o of config.nivel2) assert.ok(E.nombreLeido(config, E.claveDe(grupo.id, o.id)).startsWith(`${grupo.rotulo}, `));
    /* Cada ficha de la actividad tiene su cajón. */
    const fichas = config.sortear((xs) => xs);
    for (const f of fichas) {
      const d = config.destino(f);
      assert.ok(claves.includes(E.claveDe(d.n1, d.n2)), `${f.id}: sin cajón`);
    }
  }
  const { caja, desmontar } = await montar(IDS.slice(0, 3));
  const estante = caja.querySelector("[data-estante]");
  assert.equal(estante.getAttribute("aria-label"), "Fichas colocadas");
  assert.ok(estante.compareDocumentPosition(caja.querySelector("[data-ficha]")) & 4, "el estante, entre el contador y la ficha");
  assert.equal(caja.querySelector(`[data-tapa="${D.PROVISIONES}"]`).textContent, "Provisiones");
  assert.deepEqual([...estante.querySelectorAll("[data-cajon] > span:first-child")].map((s) => s.textContent), ["Anulación directa", "Al cierre", "Al castigar"]);
  desmontar();
});

test("★★★ lo elegido se ilumina; al acertar, la lámina entra a su cajón; el primer fallo no coloca nada y el segundo la lleva al cajón correcto", async () => {
  /* mc-05: provisiones, al cierre. */
  const { caja, desmontar } = await montar(["mc-05", "mc-01"]);
  await tocar(pestana(caja, D.PROVISIONES));
  assert.ok(encendido(caja.querySelector(`[data-tapa="${D.PROVISIONES}"]`)), "la tapa, encendida");
  await tocar(opcion(caja, D.CASTIGAR));
  assert.ok(encendido(cajon(caja, `${D.PROVISIONES}/${D.CASTIGAR}`)));
  await tocar(botonColocar(caja));
  await espera();
  /* Primer fallo: nada colocado y el brillo se queda. */
  assert.deepEqual(Object.values(cuantas(caja)), [0, 0, 0]);
  assert.ok(encendido(cajon(caja, `${D.PROVISIONES}/${D.CASTIGAR}`)), "el reintento conserva lo elegido");
  /* Segundo fallo: la lámina va a su cajón correcto, no al elegido. */
  await tocar(pestana(caja, D.DIRECTA));
  await tocar(botonColocar(caja));
  await espera();
  assert.deepEqual(cuantas(caja), { [D.DIRECTA]: 0, [`${D.PROVISIONES}/${D.CIERRE}`]: 1, [`${D.PROVISIONES}/${D.CASTIGAR}`]: 0 });
  /* Shoko: la lámina que llega tras el segundo fallo se ve distinta, sin color: contorno punteado y sin relleno. */
  const tras = cajon(caja, `${D.PROVISIONES}/${D.CIERRE}`).querySelectorAll("[data-lamina]");
  assert.equal(tras.length, 1);
  assert.equal(tras[0].dataset.lamina, "segundo");
  assert.match(tras[0].style.border, /dashed/);
  assert.equal(tras[0].style.background, "transparent");
  assert.equal(cajon(caja, `${D.PROVISIONES}/${D.CIERRE}`).getAttribute("aria-label"), "Provisiones, al cierre: 1 ficha, 1 tras el segundo intento");
  assert.equal(caja.querySelector("[data-anuncio-estante]").textContent, "Provisiones, al cierre: 1 ficha, 1 tras el segundo intento");
  /* Siguiente ficha: el brillo se apaga y lo colocado se queda. mc-01 es de anulación directa: se acierta. */
  await tocar(caja.querySelector("[data-boton-avanzar] button"));
  assert.ok(![...caja.querySelectorAll("[data-cajon]")].some(encendido), "brillo apagado");
  await marcar(caja, D.DIRECTA);
  await espera();
  assert.deepEqual(cuantas(caja), { [D.DIRECTA]: 1, [`${D.PROVISIONES}/${D.CIERRE}`]: 1, [`${D.PROVISIONES}/${D.CASTIGAR}`]: 0 });
  /* La acertada: lámina llena y, sin ninguna tras el segundo intento, la lectura no añade nada. */
  const llena = cajon(caja, D.DIRECTA).querySelector("[data-lamina]");
  assert.equal(llena.dataset.lamina, "bien");
  assert.doesNotMatch(llena.style.border, /dashed/);
  assert.equal(cajon(caja, D.DIRECTA).getAttribute("aria-label"), "Anulación directa: 1 ficha");
  desmontar();
});

test("★★ la pila muestra cuatro láminas como máximo; el número sigue contando", async () => {
  const directas = D.FICHAS_T6_ACT7.filter((f) => f.metodo === D.DIRECTA).map((f) => f.id);
  assert.equal(directas.length, 4);
  const { caja, desmontar } = await montar([...directas, "mc-05"]);
  for (let k = 0; k < 4; k++) {
    await marcar(caja, D.DIRECTA);
    await espera();
    await tocar(caja.querySelector("[data-boton-avanzar] button"));
  }
  const c = cajon(caja, D.DIRECTA);
  assert.equal(c.querySelectorAll("[data-lamina]").length, 4);
  assert.equal(c.querySelector("[data-numero]").textContent, "4");
  desmontar();
});
