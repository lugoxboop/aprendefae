/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CAMINO POR BLOQUES — la regla del bloque vacío, los iconos, el anillo y
 * el cierre.
 *
 * La regla que se rompe fácil es la del bloque vacío: un bloque sin
 * actividades no pinta NADA, y el separador que lo precedería tampoco. Hoy
 * «Cimientos» está vacío en los tres temas; la prueba que importa es que
 * registrar una actividad Fácil en el catálogo —y nada más— lo haga aparecer
 * con su separador, y que quitarla lo haga desaparecer.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
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

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { default: CaminoHacer } = await import("../CaminoHacer.jsx");
const { default: RecompensaCierre, recompensaDe } = await import("../RecompensaCierre.jsx");
const { ICONOS_ACTIVIDAD, iconoDe } = await import("../iconosActividad.jsx");
const { bloquesDe, BLOQUES } = await import("../../../hacer/bloques.js");
const { nodosDe, useCompletadas } = await import("../../../hacer/completadas.js");
const { emitirFP } = await import("../../../fp/aviso.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../../data/subjects.js");

const TEMAS = ["politica-economica", "demanda-agregada", "politica-fiscal"];
const temaDe = (id) => SUBJECTS.macroeconomia.topics.find((t) => t.id === id);
const nodosDelTema = (id, hechas = new Set()) => nodosDe(actividadesDeTipo(temaDe(id), HACER), hechas);

function montar(elemento) {
  const cont = document.createElement("div");
  document.body.appendChild(cont);
  const raiz = createRoot(cont);
  act(() => raiz.render(elemento));
  return {
    cont,
    pintar: (otro) => act(() => raiz.render(otro)),
    desmontar: () => { act(() => raiz.unmount()); cont.remove(); },
  };
}
const camino = (nodos) => React.createElement(CaminoHacer, { nodos, porBloques: true, onAbrir: () => {} });
const bloquesPintados = (cont) => [...cont.querySelectorAll("[data-bloque]")].map((s) => s.getAttribute("data-bloque"));
const separadorDe = (cont, id) => cont.querySelector(`[data-bloque="${id}"] [data-separador]`)?.textContent ?? null;

const SEPARADOR = Object.fromEntries(BLOQUES.map((b) => [b.id, b.separador]));

/* ───────────────────────────── la regla, pura ───────────────────────────── */

test("bloquesDe: orden fijo, el primero visible sin separador y el separador va con el bloque al que lleva", () => {
  const n = (id, dificultad) => ({ id, dificultad, completada: false });

  /* Hoy: sin Fácil. Se empieza en Aplicación y sin «Sube de nivel». */
  let b = bloquesDe([n("a", "dificil"), n("b", "medio"), n("c", "experto")]);
  assert.deepEqual(b.map((x) => x.id), ["aplicacion", "analisis", "maestria"]);
  assert.deepEqual(b.map((x) => x.separador), [null, SEPARADOR.analisis, SEPARADOR.maestria]);
  assert.deepEqual(b.map((x) => x.inicio), [0, 1, 2]);

  /* Un hueco en medio: Fácil y Experto. Solo el separador de Maestría. */
  b = bloquesDe([n("x", "experto"), n("y", "facil")]);
  assert.deepEqual(b.map((x) => x.id), ["cimientos", "maestria"]);
  assert.deepEqual(b.map((x) => x.separador), [null, SEPARADOR.maestria]);

  /* Solo Experto: el único bloque, sin separador aunque en el orden fijo sea el cuarto. */
  b = bloquesDe([n("x", "experto")]);
  assert.deepEqual(b.map((x) => [x.id, x.separador]), [["maestria", null]]);

  /* Una dificultad que no es de las cuatro no rompe nada: va al final. */
  b = bloquesDe([n("a", "medio"), n("raro", "legendario")]);
  assert.deepEqual(b.map((x) => x.id), ["aplicacion", "otras"]);

  assert.deepEqual(bloquesDe([]), []);
});

/* ─────────────────────────── el bloque vacío, pintado ─────────────────────────── */

test("un bloque vacío no pinta nada; registrar una actividad Fácil en el catálogo lo hace aparecer con su separador, y quitarla lo quita", () => {
  for (const temaId of TEMAS) {
    const tema = temaDe(temaId);
    const m = montar(camino(nodosDelTema(temaId)));

    /* Hoy: ninguna de las siete es Fácil. */
    assert.deepEqual(bloquesPintados(m.cont), ["aplicacion", "analisis", "maestria"], temaId);
    assert.ok(!m.cont.textContent.includes("Cimientos"), `${temaId}: ni el título`);
    assert.ok(!m.cont.textContent.includes(SEPARADOR.aplicacion), `${temaId}: ni «Sube de nivel» encima del primero`);
    assert.equal(separadorDe(m.cont, "aplicacion"), null);

    /* Solo se registra en el catálogo, con su dificultad. Ningún otro cambio. */
    const falsa = {
      id: "prueba-facil",
      nombre: "Actividad fácil de prueba",
      clasificacion: { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 },
    };
    tema.actividades.push(falsa);
    try {
      m.pintar(camino(nodosDelTema(temaId)));
      assert.deepEqual(bloquesPintados(m.cont), ["cimientos", "aplicacion", "analisis", "maestria"], temaId);
      const cimientos = m.cont.querySelector('[data-bloque="cimientos"]');
      assert.equal(cimientos.querySelector("h3").textContent, "Cimientos");
      assert.ok(cimientos.querySelector('[data-nodo="prueba-facil"]'), `${temaId}: la actividad cae en su bloque`);
      assert.equal(separadorDe(m.cont, "cimientos"), null, "el primero no lleva separador");
      assert.equal(separadorDe(m.cont, "aplicacion"), SEPARADOR.aplicacion, `${temaId}: aparece «Sube de nivel»`);
      /* Y va entre los dos: después de Cimientos, antes del título de Aplicación. */
      const sep = m.cont.querySelector('[data-bloque="aplicacion"] [data-separador]');
      const cabeza = m.cont.querySelector('[data-cabeza-bloque="aplicacion"]');
      assert.ok(cimientos.compareDocumentPosition(sep) & w.Node.DOCUMENT_POSITION_FOLLOWING);
      assert.ok(sep.compareDocumentPosition(cabeza) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    } finally {
      tema.actividades.splice(tema.actividades.indexOf(falsa), 1);
    }

    m.pintar(camino(nodosDelTema(temaId)));
    assert.deepEqual(bloquesPintados(m.cont), ["aplicacion", "analisis", "maestria"], `${temaId}: se va al quitarla`);
    assert.ok(!m.cont.textContent.includes("Cimientos"));
    assert.ok(!m.cont.textContent.includes(SEPARADOR.aplicacion));
    m.desmontar();
  }
});

test("cada actividad de los tres caminos va en el bloque de su dificultad del catálogo", () => {
  for (const temaId of TEMAS) {
    const m = montar(camino(nodosDelTema(temaId)));
    for (const a of actividadesDeTipo(temaDe(temaId), HACER)) {
      const bloque = BLOQUES.find((b) => b.dificultad === a.clasificacion.dificultad);
      assert.ok(m.cont.querySelector(`[data-bloque="${bloque.id}"] [data-nodo="${a.id}"]`), `${a.id} debería estar en ${bloque.nombre}`);
    }
    m.desmontar();
  }
});

/* ─────────────────────────────── los iconos ─────────────────────────────── */

test("las 21 actividades tienen icono y lo pintan; una sin icono enseña su número y no rompe el camino", () => {
  const ids = TEMAS.flatMap((t) => actividadesDeTipo(temaDe(t), HACER).map((a) => a.id));
  assert.equal(ids.length, 21);
  for (const id of ids) assert.ok(iconoDe(id), `${id} sin icono`);
  assert.deepEqual(Object.keys(ICONOS_ACTIVIDAD).sort(), [...ids].sort(), "ni iconos de más ni de menos");

  for (const temaId of TEMAS) {
    const m = montar(camino(nodosDelTema(temaId)));
    assert.equal(m.cont.querySelectorAll("[data-icono]").length, 7, temaId);
    m.desmontar();
  }

  const m = montar(camino([
    { id: "sin-icono-1", nombre: "Una nueva", dificultad: "medio", completada: false },
    { id: "sin-icono-2", nombre: "Otra nueva", dificultad: "dificil", completada: false },
  ]));
  assert.equal(m.cont.querySelectorAll("[data-icono]").length, 0);
  const numeros = [...m.cont.querySelectorAll("[data-nodo] text")].map((t) => t.textContent);
  assert.deepEqual(numeros, ["1", "2"], "el número sigue la posición en el camino entero, no en el bloque");
  m.desmontar();
});

/* ──────────────────────────────── el anillo ──────────────────────────────── */

test("el anillo de cada bloque dice la fracción como texto y se pone al día con el canal de FP, sin recargar", () => {
  function Arnes() {
    const hechas = useCompletadas();
    return camino(nodosDelTema("politica-fiscal", hechas));
  }
  const m = montar(React.createElement(Arnes));
  const anillo = (id) => m.cont.querySelector(`[data-cabeza-bloque="${id}"] [role="img"]`);
  assert.equal(anillo("aplicacion").getAttribute("aria-label"), "0 de 2 completadas");
  assert.equal(anillo("aplicacion").querySelector("[data-fraccion]").textContent, "0/2");
  assert.equal(anillo("analisis").querySelector("[data-fraccion]").textContent, "0/3");

  /* Lo que emite otorgarFP cuando el servidor confirma. */
  act(() => emitirFP({ actividadId: "clasificador-tesoro", fp: 25, repetida: false }));
  assert.equal(anillo("aplicacion").querySelector("[data-fraccion]").textContent, "1/2");
  assert.equal(anillo("aplicacion").getAttribute("aria-label"), "1 de 2 completadas");
  assert.equal(anillo("analisis").querySelector("[data-fraccion]").textContent, "0/3", "solo cambia su bloque");
  m.desmontar();
});

test("el color de los bloques es teal, nunca coral", () => {
  const m = montar(camino(nodosDelTema("politica-economica", new Set(["diagnostico-en-vivo", "tablero-decisiones"]))));
  const cromo = [...m.cont.querySelectorAll("[data-cabeza-bloque], [data-separador]")].map((e) => e.outerHTML).join("");
  assert.ok(cromo.length > 0);
  assert.ok(!/E76F51|231,\s*111,\s*81/i.test(cromo), "coral en un título, anillo o separador");
  assert.ok(/42,\s*157,\s*143|2A9D8F/i.test(cromo));
  m.desmontar();
});

/* ──────────────────────────────── el cierre ──────────────────────────────── */

test("el cierre crece con la dificultad, no atrapa a nadie y se va solo", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const piezas = (cont) => new Set([...cont.querySelectorAll("[data-pieza]")].map((e) => e.getAttribute("data-pieza")));
  const esperado = {
    facil: { check: true, destello: true, particula: false, "insignia-silueta": false, "insignia-revelada": false, pantalla: false },
    medio: { check: true, destello: false, particula: true, "insignia-silueta": false, "insignia-revelada": false, pantalla: false },
    dificil: { check: true, particula: true, "insignia-silueta": true, "insignia-revelada": false, pantalla: false },
    experto: { check: true, particula: true, "insignia-silueta": false, "insignia-revelada": true, pantalla: true },
  };
  let css = "";
  for (const [dificultad, deberia] of Object.entries(esperado)) {
    let terminado = 0;
    const m = montar(React.createElement(RecompensaCierre, { dificultad, actividadId: "flujo-de-caja", onFin: () => terminado++ }));
    css ||= [...m.cont.querySelectorAll("style")].map((s) => s.textContent).join("");
    const hay = piezas(m.cont);
    for (const [pieza, si] of Object.entries(deberia)) assert.equal(hay.has(pieza), si, `${dificultad}: ${pieza}`);
    /* Nada que se pueda enfocar o pulsar: no se interpone. */
    assert.equal(m.cont.querySelectorAll("button, a, input, [tabindex]").length, 0);
    assert.ok(m.cont.querySelector(".fae-rc[role='status']"));
    act(() => t.mock.timers.tick(recompensaDe(dificultad).ms - 1));
    assert.equal(terminado, 0);
    act(() => t.mock.timers.tick(1));
    assert.equal(terminado, 1, `${dificultad}: se va sola`);
    m.desmontar();
  }
  assert.match(css, /\.fae-rc \{[^}]*pointer-events: none/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*\.fae-rc \*[^}]*animation: none/);
});
