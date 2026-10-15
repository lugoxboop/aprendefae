import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ÍCONOS DE CONTABILIDAD.
 *
 *   · los .svg del repo siguen las reglas de Xeno: su raíz exacta, solo
 *     path / rect / circle, sin rellenos, opacidad, colores ni transformaciones
 *   · el componente pinta EXACTAMENTE ese SVG (mismas piezas, mismos atributos)
 *     y solo cambia el tamaño y la accesibilidad
 *   · el mapeo es solo de Contabilidad, sin T1-3 ni el Ciclo Completo
 *   · en el camino: el ícono va con el color del rótulo, el ✓ de hecha se
 *     queda, y el nombre accesible del nodo no cambia
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
w.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w),
  matchMedia: w.matchMedia, ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.CSS = { escape: (v) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`) };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { renderToStaticMarkup } = await import("react-dom/server");
const act = React.act;
const h = React.createElement;

const I = await import("../iconos/iconos.jsx");
const { ICONO_POR_ACTIVIDAD, conIcono } = await import("../../data/contabilidadIconos.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { nodosDe } = await import("../../hacer/completadas.js");
const { default: CaminoHacer } = await import("../../components/shared/CaminoHacer.jsx");
const { FAE } = await import("../../theme.js");

const CARPETA = new URL("../iconos/", import.meta.url);
const ARCHIVOS = readdirSync(CARPETA).filter((f) => f.endsWith(".svg")).sort();
const RAIZ = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const PROHIBIDO = /#2a9d8f|#52c4b0|#e9c46a|#e76f51|teal|ambar|ámbar|coral|opacity|transform|style=|<g\b|<defs|\bid=|gradient|#[0-9a-f]{3,8}\b/i;

test("★★★ los .svg siguen las reglas de Xeno: su raíz exacta, solo path/rect/circle, sin relleno, opacidad ni colores", () => {
  assert.ok(ARCHIVOS.length >= 10, `solo hay ${ARCHIVOS.length} íconos`);
  for (const f of ARCHIVOS) {
    const texto = readFileSync(new URL(f, CARPETA), "utf8");
    /* En una línea o en varias, como venga: la raíz exacta, luego solo piezas permitidas. */
    assert.ok(texto.startsWith(RAIZ), `${f}: la raíz no es la de Xeno`);
    assert.equal(texto.trimEnd().slice(-6), "</svg>", f);
    const cuerpo = texto.trimEnd().slice(RAIZ.length, -6).trim();
    const piezas = cuerpo.match(/<[^>]+>/g) ?? [];
    assert.equal(piezas.join("").replace(/\s/g, ""), cuerpo.replace(/\s/g, ""), `${f}: hay algo que no es una pieza`);
    for (const p of piezas) {
      assert.match(p, /^<(path|rect|circle) [^>]*\/>$/, `${f}: «${p}» no es una pieza permitida`);
      assert.doesNotMatch(p, /\bfill=/, `${f}: una pieza lleva relleno`);
    }
    assert.doesNotMatch(texto, PROHIBIDO, `${f}: lleva algo prohibido`);
  }
});

test("★★★ el componente pinta exactamente el SVG de Xeno: mismas piezas, mismos atributos, en currentColor", () => {
  const leer = (html) => {
    const d = new JSDOM(html, { contentType: "image/svg+xml" }).window.document.documentElement;
    const attrs = (el) => Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));
    return { raiz: attrs(d), piezas: [...d.children].map((c) => [c.tagName, attrs(c)]) };
  };
  const componentes = Object.values(I).filter((c) => typeof c === "function" && c.svg);
  assert.equal(componentes.length, ARCHIVOS.length, "hay un .svg sin componente o al revés");
  for (const C of componentes) {
    const archivo = leer(C.svg);
    const pintado = leer(renderToStaticMarkup(h(C, { size: 30 })));
    assert.deepEqual(pintado.piezas, archivo.piezas, `${C.displayName}: las piezas no son las de Xeno`);
    /* La raíz: la de Xeno, salvo el tamaño, más aria-hidden y focusable. */
    assert.deepEqual(pintado.raiz, { ...archivo.raiz, width: "30", height: "30", "aria-hidden": "true", focusable: "false" }, C.displayName);
    assert.equal(pintado.raiz.stroke, "currentColor");
  }
});

test("★★★ el mapeo es solo de Contabilidad: ids reales, sin T1-3, sin el Ciclo Completo, cada ícono una vez", () => {
  const hacer = new Set(SUBJECTS.contabilidad.topics.flatMap((t) => actividadesDeTipo(t, HACER).map((a) => a.id)));
  for (const id of Object.keys(ICONO_POR_ACTIVIDAD)) assert.ok(hacer.has(id), `${id} no es una actividad de Hacer de Contabilidad`);
  assert.equal(ICONO_POR_ACTIVIDAD["ciclo-completo"], undefined, "el Ciclo Completo no lleva ícono");
  assert.ok(!Object.keys(ICONO_POR_ACTIVIDAD).some((id) => /t1-3\b/.test(id)));
  assert.equal(new Set(Object.values(ICONO_POR_ACTIVIDAD)).size, Object.keys(ICONO_POR_ACTIVIDAD).length, "un ícono repetido");
  /* Las 45 de Hacer de Contabilidad con dibujo (sin el desafío) tienen su ícono, y son 45 archivos. */
  const conDesafio = new Set(SUBJECTS.contabilidad.topics.flatMap((t) => (t.actividades ?? []).filter((x) => x.clasificacion?.desafio).map((x) => x.id)));
  /* Actividades nuevas que todavía esperan su dibujo de Xeno: el camino las pinta sin ícono. */
  const SIN_ICONO_TODAVIA = new Set(["r5-1"]);
  const esperadas = [...hacer].filter((id) => !conDesafio.has(id) && !SIN_ICONO_TODAVIA.has(id));
  assert.equal(esperadas.length, 45);
  assert.deepEqual(Object.keys(ICONO_POR_ACTIVIDAD).sort(), esperadas.sort(), "falta o sobra un ícono");
  assert.equal(ARCHIVOS.length, 45);
  /* «¿Dónde se Rompió?» es la T1-8: su archivo se llama así. */
  assert.ok(ARCHIVOS.includes("conta-t1-8-donde-se-rompio.svg"));
  assert.ok(!ARCHIVOS.some((f) => f.startsWith("conta-t1-3")));
});

/* El camino de Contabilidad, montado, con unas hechas y otras no. */
async function montarCamino(temaId, porBloques, hechas = new Set()) {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === temaId);
  const acts = actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente);
  const nodos = conIcono(nodosDe(acts, hechas));
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(CaminoHacer, { nodos, onAbrir: () => {}, porBloques })); });
  return { caja, nodos, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("★★★ en el camino: el ícono va con el color del rótulo, el ✓ de hecha se queda y el nombre accesible no cambia", async () => {
  for (const [temaId, porBloques] of [["introduccion-contabilidad", false], ["cuentas-debe-haber", true]]) {
    const hechas = new Set(["t1-desde-donde-preguntan", "cu-izquierda-o-derecha", "t1-que-le-pasa-a-cada-uno"]);
    const con = await montarCamino(temaId, porBloques, hechas);
    try {
      for (const nodo of con.nodos) {
        const g = con.caja.querySelector(`[data-nodo="${nodo.id}"]`);
        const icono = g.querySelector("[data-icono-propio]");
        if (!ICONO_POR_ACTIVIDAD[nodo.id]) {
          /* Sin ícono (los que se redibujan): el número de siempre. */
          assert.equal(icono, null, nodo.id);
          assert.ok(g.querySelector("text"), `${nodo.id}: sin ícono debe enseñar su número`);
          continue;
        }
        const esperado = nodo.completada ? FAE.text : "rgba(248,249,250,0.72)";
        assert.equal(icono.style.color.replace(/\s/g, ""), (esperado.startsWith("#") ? hexARgb(esperado) : esperado).replace(/\s/g, ""), `${nodo.id}: el ícono no lleva el color del rótulo`);
        const svg = icono.querySelector("svg");
        assert.equal(svg.getAttribute("aria-hidden"), "true");
        assert.equal(svg.getAttribute("focusable"), "false");
        assert.equal(svg.getAttribute("stroke"), "currentColor");
        assert.equal(svg.querySelector("[fill]:not(svg)"), null, "una pieza lleva relleno");
        assert.equal(g.querySelector("text"), null, `${nodo.id}: el número sigue debajo del ícono`);
        /* El ✓ de hecha, igual que hoy en los nodos con ícono. */
        if (nodo.completada) assert.ok(g.querySelector(":scope > g[aria-hidden='true'] > path"), `${nodo.id}: falta el ✓`);
      }
    } finally { con.desmontar(); }
  }
});

const hexARgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test("★★★ el nombre accesible del nodo es el mismo con ícono y sin él", async () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
  const acts = actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente);
  const hechas = new Set(["cu-izquierda-o-derecha"]);
  const etiquetas = async (nodos) => {
    const caja = document.createElement("div");
    document.body.appendChild(caja);
    const raiz = createRoot(caja);
    await act(async () => { raiz.render(h(CaminoHacer, { nodos, onAbrir: () => {}, porBloques: true })); });
    const r = Object.fromEntries([...caja.querySelectorAll("[data-nodo]")].map((g) => [g.getAttribute("data-nodo"), g.getAttribute("aria-label")]));
    act(() => raiz.unmount());
    caja.remove();
    return r;
  };
  const sin = await etiquetas(nodosDe(acts, hechas));
  const con = await etiquetas(conIcono(nodosDe(acts, hechas)));
  assert.deepEqual(con, sin);
  /* Para el informe: el de un nodo, antes y después. */
  console.log(`nombre accesible de cu-izquierda-o-derecha — sin ícono: «${sin["cu-izquierda-o-derecha"]}» · con ícono: «${con["cu-izquierda-o-derecha"]}»`);
});

test("★★ en la ventana previa: el ícono, del color del título, aria-hidden, y sin el número", async () => {
  const con = await montarCamino("cuentas-debe-haber", true);
  try {
    await act(async () => { con.caja.querySelector('[data-nodo="cu-arma-el-asiento"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    const estatico = document.querySelector("[data-estatico]");
    assert.ok(estatico, "no se abrió la ventana previa");
    const svg = estatico.querySelector("svg");
    assert.ok(svg, "la ventana previa no lleva el ícono");
    assert.equal(svg.getAttribute("width"), "36");
    assert.equal(svg.getAttribute("aria-hidden"), "true");
    assert.equal(svg.getAttribute("focusable"), "false");
    assert.equal(svg.getAttribute("stroke"), "currentColor");
    assert.equal(estatico.style.color.replace(/\s/g, ""), hexARgb(FAE.text).replace(/\s/g, ""), "el color no es el del título");
    assert.equal(estatico.textContent.trim(), "", "la ventana previa sigue enseñando el número");
  } finally { con.desmontar(); }
});
