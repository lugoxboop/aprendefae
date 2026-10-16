import { test } from "node:test";
import assert from "node:assert/strict";

import { JSDOM, VirtualConsole } from "jsdom";


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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BARRA DE ENGANCHE · B1 Y B2, EN MODO INFORME (Célula C, T7 y T5).
 *
 * La barra está en orquestador/conocimiento/enganche.md. Esta prueba recorre
 * cada pantalla de cada pieza de Aprender de la célula (al llegar, al fallar
 * y al acertar) y la apertura de cada Hacer, y mide sobre el DOM:
 *
 *   B2 · palabras visibles por pantalla de Aprender (máx. 60; lo plegado no
 *        cuenta)
 *   B1 · palabras antes de la primera figura o interacción (máx. 40)
 *
 * Los 280 px de B1 piden layout de verdad: los mide scripts/t7/canon-b1.mjs
 * en Chromium a 320 px, con estas mismas funciones (contabilidad/canonEnganche.js).
 *
 * MODO INFORME, por orden de L: la lista sale como diagnóstico y CI no se
 * pone rojo. Las dos pruebas «obligatorias» van como TODO; cuando entren los
 * recortes de Near, se les quita el `todo` y pasan a exigir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = await import("../canonEnganche.js");
const { APRENDER_CANON, HACER_CANON } = await import("../canonEnganchePiezas.js");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

/* Cada pantalla se monta sola: la pieza con sus pantallas desde esa en adelante. */
async function medirAprender() {
  const filas = [];
  for (const { tema, pieza, Pieza } of APRENDER_CANON) {
    for (const [k, pantalla] of pieza.pantallas.entries()) {
      for (const { estado, pasos } of C.estadosDePantalla(pantalla)) {
        const m = await montar(h(Pieza, { pieza: { ...pieza, pantallas: pieza.pantallas.slice(k) }, rotulo: "PIEZA 1 DE 1" }));
        try {
          let llego = true;
          for (const sel of pasos) {
            const el = m.caja.querySelector(sel);
            if (!el) { llego = false; break; }
            await tocar(el);
          }
          const r = C.medirTarjeta(C.tarjetaDe(m.caja), w);
          filas.push({ tema, pieza: pieza.id, pantalla: pantalla.id, tipo: pantalla.tipo, estado, llego, texto: r.texto, figura: r.figura, antes: r.antes, conAncla: Boolean(r.ancla) });
        } finally {
          m.desmontar();
        }
      }
    }
  }
  return filas;
}

async function medirHacer() {
  const filas = [];
  for (const { tema, id, Mecanica, titulo } of HACER_CANON) {
    const m = await montar(h(Mecanica, { Marco: MarcoLibros, rotulo: "FÁCIL", titulo, acento: "#E9C46A", onCompletar() {} }));
    try {
      const r = C.medirTarjeta(C.tarjetaDe(m.caja), w);
      filas.push({ tema, pieza: id, pantalla: "apertura", estado: "al llegar", texto: r.texto, antes: r.antes, conAncla: Boolean(r.ancla) });
    } finally {
      m.desmontar();
    }
  }
  return filas;
}

const APRENDER = await medirAprender();
const HACER = await medirHacer();

const etiqueta = (f) => `${f.tema} · ${f.pieza} · ${f.pantalla} (${f.estado})`;
const noCumpleB2 = () => {
  /* Una línea por pantalla: el estado con más palabras. */
  const peor = new Map();
  for (const f of APRENDER) {
    const clave = `${f.pieza}·${f.pantalla}`;
    if (!peor.has(clave) || f.texto > peor.get(clave).texto) peor.set(clave, f);
  }
  return [...peor.values()].filter((f) => f.texto > C.UMBRAL_B2_PALABRAS);
};
const noCumpleB1 = () => [...APRENDER.filter((f) => f.estado === "al llegar"), ...HACER]
  .filter((f) => !f.conAncla || f.antes > C.UMBRAL_B1_PALABRAS);

/* ═══════════ 1 · LA MEDIDA (estas sí exigen) ═══════════ */

test("★★★ la medida: cuenta lo que se lee, no el cromo, los botones, el pie, lo plegado ni lo del lector", async () => {
  const m = await montar(h("div", null,
    h("section", null,
      h("header", null, h("p", null, "PIEZA 1 DE 7"), h("h3", null, "Un título largo del marco")),
      h("p", { "data-texto": true }, "Uno dos tres. Cuatro cinco seis. ", h("span", { hidden: true }, "Siete ocho nueve diez.")),
      h("span", { style: { position: "absolute", width: "1px", height: "1px", overflow: "hidden" } }, "Solo para el lector"),
      h("p", { style: { display: "none" } }, "No se pinta"),
      h("figure", null, h("span", null, "Inventario de mercancías")),
      h("p", null, "Después de la figura: $1.000.000 y 15 %"),
      h("button", { "data-boton": "seguir" }, "Seguir"),
      h("p", { "data-pie": true }, "Basado en el libro, p. 207"),
    )));
  try {
    const r = C.medirTarjeta(C.tarjetaDe(m.caja), w);
    assert.equal(r.texto, 6 + 7, "texto");
    assert.equal(r.figura, 3, "figura");
    assert.equal(r.antes, 6, "antes de la figura");
    assert.equal(r.ancla.tagName, "FIGURE");
  } finally {
    m.desmontar();
  }
});

test("★★★ la medida: sin figura, el ancla de B1 es la primera interacción; sin ninguna, no hay ancla", async () => {
  const m = await montar(h("section", null,
    h("p", null, "Una dos tres"),
    h("div", { role: "group" }, h("button", { "data-opcion": "a" }, "Opción A")),
    h("button", { "data-boton": "confirmar" }, "Confirmar")));
  const n = await montar(h("section", null, h("p", null, "Solo texto aquí"), h("button", { "data-boton": "seguir" }, "Seguir")));
  try {
    const r = C.medirTarjeta(C.tarjetaDe(m.caja), w);
    assert.equal(r.ancla.getAttribute("data-opcion"), "a");
    assert.equal(r.antes, 3);
    assert.equal(r.texto, 5);
    const s = C.medirTarjeta(C.tarjetaDe(n.caja), w);
    assert.equal(s.ancla, null);
    assert.equal(s.antes, 3, "sin ancla, todo el texto va antes");
  } finally {
    m.desmontar(); n.desmontar();
  }
});

test("★★★ el recorrido llega a todo: cada pantalla de las 22 piezas de Aprender y la apertura de los 22 Hacer", () => {
  /* 22 piezas de Aprender menos N2 de T5, que entró en N3 (entrega 5), más N6 de T5. */
  assert.equal(APRENDER_CANON.length, 22, APRENDER_CANON.map((p) => p.pieza.id).join(", "));
  assert.equal(HACER_CANON.length, 22, HACER_CANON.map((j) => j.id).join(", "));
  const pantallas = APRENDER_CANON.reduce((s, p) => s + p.pieza.pantallas.length, 0);
  assert.equal(new Set(APRENDER.map((f) => `${f.pieza}·${f.pantalla}`)).size, pantallas);
  /* Cada pregunta se jugó de verdad: el fallo y el acierto llegaron a tocarse. */
  const sinLlegar = APRENDER.filter((f) => !f.llego).map(etiqueta);
  assert.deepEqual(sinLlegar, []);
  /* Y la pantalla se pintó: no hay tarjetas vacías. */
  assert.deepEqual([...APRENDER, ...HACER].filter((f) => f.texto + (f.figura ?? 0) === 0).map(etiqueta), []);
});

/* ═══════════ 2 · EL INFORME (no pone rojo a CI) ═══════════ */

test("informe B2 · pantallas de Aprender con más de 60 palabras visibles", (t) => {
  const lista = noCumpleB2();
  t.diagnostic(`B2: ${lista.length} pantallas de ${new Set(APRENDER.map((f) => `${f.pieza}·${f.pantalla}`)).size} pasan de ${C.UMBRAL_B2_PALABRAS} palabras`);
  for (const f of lista) t.diagnostic(`B2 ${f.texto} · ${etiqueta(f)}`);
});

test("informe B1 · pantallas sin figura ni interacción, o con más de 40 palabras antes", (t) => {
  const lista = noCumpleB1();
  t.diagnostic(`B1 (palabras): ${lista.length} pantallas no cumplen`);
  for (const f of lista) t.diagnostic(`B1 ${f.conAncla ? `${f.antes} antes` : `sin figura ni interacción (${f.texto})`} · ${etiqueta(f)}`);
});

/* ═══════════ 3 · LAS OBLIGATORIAS, CUANDO ENTREN LOS RECORTES ═══════════ */

const TODO = "Modo informe hasta que entren los recortes de Near; entonces se quita el todo.";

test("★★ B2 · ninguna pantalla de Aprender pasa de 60 palabras visibles", { todo: TODO }, () => {
  assert.deepEqual(noCumpleB2().map(etiqueta), []);
});

test("★★ B1 · toda pantalla tiene figura o interacción, con 40 palabras como máximo antes", { todo: TODO }, () => {
  assert.deepEqual(noCumpleB1().map(etiqueta), []);
});
