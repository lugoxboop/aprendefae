import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 1 · EL «¿POR QUÉ?» PLEGADO (Célula C · T7 y T5).
 *
 *   · lo que pase de 2 frases se pliega detrás de «¿Por qué?» y se abre al
 *     tocar; no se toca ningún texto: lo visible y lo plegado juntos son el
 *     texto original, en todos los textos de los datos de T7 y T5
 *   · «p. 194», «pp. 207 y 208» y las cifras no cortan frase
 *   · aciertos, errores y bloques de texto de t7/ pasan todos por Plegable
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { Plegable, partirEnFrases, POR_QUE } = await import("../../components/mecanicas/libros/t7/plegable.jsx");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const T7 = new URL("src/components/mecanicas/libros/t7/", RAIZ);
const DATOS = new URL("src/data/", RAIZ);

/* ═══════════ 1 · DÓNDE SE CORTA ═══════════ */

test("★★★ se ven 2 frases; lo demás se pliega; con 2 o menos no se pliega nada", () => {
  assert.deepEqual(partirEnFrases("Una. Dos."), ["Una. Dos.", ""]);
  assert.deepEqual(partirEnFrases("Una sola frase larga, sin punto final"), ["Una sola frase larga, sin punto final", ""]);
  assert.deepEqual(partirEnFrases("Una. Dos. Tres. Cuatro."), ["Una. Dos.", " Tres. Cuatro."]);
  assert.deepEqual(partirEnFrases("¿Una? «Dos». ¡Tres!"), ["¿Una? «Dos».", " ¡Tres!"]);
});

test("★★★ las páginas y las cifras no cortan frase", () => {
  assert.deepEqual(partirEnFrases("El libro, en la p. 194, lo dice. Son $1.000.000 en total. Va al debe."), ["El libro, en la p. 194, lo dice. Son $1.000.000 en total.", " Va al debe."]);
  assert.deepEqual(partirEnFrases("Basado en el libro, pp. 207 y 208. Otra."), ["Basado en el libro, pp. 207 y 208. Otra.", ""]);
});

test("★★★ ningún texto cambia: en todos los datos de T7 y T5, lo visible y lo plegado juntos son el original", async () => {
  const textos = [];
  const recoger = (v) => { if (typeof v === "string") textos.push(v); else if (Array.isArray(v)) v.forEach(recoger); else if (v && typeof v === "object") Object.values(v).forEach(recoger); };
  for (const f of readdirSync(DATOS).filter((x) => /^contabilidad(T7_|T5_n)/.test(x))) recoger(await import(new URL(f, DATOS).href));
  assert.ok(textos.length > 1000, `solo ${textos.length} textos`);
  const plegados = textos.filter((t) => partirEnFrases(t)[1]);
  assert.ok(plegados.length > 50, `solo ${plegados.length} textos se pliegan`);
  for (const t of textos) assert.equal(partirEnFrases(t).join(""), t);
});

/* ═══════════ 2 · MONTADO ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

test("★★★ plegado por defecto; «¿Por qué?» lo abre; el texto del párrafo es el original", async () => {
  const texto = "Primera frase. Segunda frase. Tercera, que explica el porqué. Y una cuarta.";
  const m = await montar(h("p", { "data-texto": "" }, h(Plegable, { texto })));
  try {
    const p = m.caja.querySelector("p");
    const plegado = p.querySelector("[data-plegado]");
    const boton = p.querySelector("button[data-por-que]");
    assert.equal(plegado.hidden, true);
    assert.equal(plegado.textContent, " Tercera, que explica el porqué. Y una cuarta.");
    assert.equal(boton.getAttribute("aria-label"), POR_QUE);
    assert.equal(boton.getAttribute("aria-expanded"), "false");
    assert.equal(p.textContent, texto);
    await tocar(boton);
    assert.equal(p.querySelector("[data-plegado]").hidden, false);
    assert.equal(p.querySelector("button[data-por-que]"), null);
    assert.equal(p.textContent, texto);
  } finally {
    m.desmontar();
  }
});

test("★★ con 2 frases o menos no hay botón", async () => {
  const m = await montar(h("p", null, h(Plegable, { texto: "Una. Dos." })));
  try {
    assert.equal(m.caja.querySelector("button"), null);
    assert.equal(m.caja.textContent, "Una. Dos.");
  } finally {
    m.desmontar();
  }
});

test("★★★ en una pieza: el bloque de texto y el acierto largos salen plegados", async () => {
  const largo = "Uno. Dos. Tres.";
  const pieza = { id: "x", titulo: "X", pantallas: [
    { id: "l", tipo: "lectura", parrafos: [largo], boton: "Seguir", pie: null },
    { id: "e", tipo: "eleccion", parrafos: [], pregunta: "¿?", opciones: [{ id: "a", texto: "A", correcta: true }], pie: null, error: { pie: null }, acierto: { texto: largo, pie: null } },
  ] };
  const m = await montar(h(ControlInterno, { pieza, rotulo: "R" }));
  try {
    assert.equal(m.caja.querySelectorAll("[data-por-que]").length, 1, "el párrafo de la lectura");
    await tocar(m.caja.querySelector('[data-boton="seguir"]'));
    await tocar(m.caja.querySelector('[data-opcion="a"]'));
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    assert.equal(m.caja.querySelectorAll('[data-mensaje="acierto"] [data-por-que]').length, 1, "el acierto");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · EN TODOS LOS COMPONENTES ═══════════ */

test("★★★ en t7/, todos los aciertos, errores y bloques de texto pasan por Plegable", () => {
  const sueltos = [];
  let usos = 0;
  for (const f of readdirSync(T7).filter((x) => x.endsWith(".jsx") && x !== "plegable.jsx")) {
    const s = readFileSync(new URL(f, T7), "utf8");
    usos += (s.match(/<Plegable texto=/g) ?? []).length;
    for (const m of s.matchAll(/<p key=\{t\}[^>]*\bdata-texto\b[^>]*>\{t\}<\/p>|<p[^>]*\bdata-texto-retro\b[^>]*>\{[\w.]+\}<\/p>/g)) sueltos.push(`${f}: ${m[0].slice(0, 70)}`);
  }
  assert.deepEqual(sueltos, []);
  /* 40 desde el lote 3: los dos de ArmaLaFactura pasaron a la mecánica compartida de la célula (armaLaLinea.jsx y la Devolucion de hacerT7), que ya pliega. */
  assert.ok(usos >= 40, `solo ${usos} usos`);
});
