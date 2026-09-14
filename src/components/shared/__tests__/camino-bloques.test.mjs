/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CAMINO POR BLOQUES — el bloque vacío, la línea continua, los títulos que
 * no se cruzan con ella, los iconos, el anillo y el cierre.
 *
 * La regla que se rompe fácil es la del bloque vacío: un bloque sin
 * actividades no pinta NADA. Hoy «Cimientos» está vacío en los tres temas; la
 * prueba que importa es que registrar una actividad Fácil en el catálogo —y
 * nada más— lo haga aparecer, y que quitarla lo haga desaparecer.
 *
 * Y la que se rompe sin que nadie lo note: que la línea que une los nodos
 * atraviese el título de un bloque. Se comprueba con la geometría, no a ojo.
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

const { default: CaminoHacer, disposicionPorBloques, tramosDe } = await import("../CaminoHacer.jsx");
const { default: RecompensaCierre, recompensaDe } = await import("../RecompensaCierre.jsx");
const { ICONOS_ACTIVIDAD, iconoDe } = await import("../iconosActividad.jsx");
const { bloquesDe, BLOQUES } = await import("../../../hacer/bloques.js");
const { nodosDe, useCompletadas } = await import("../../../hacer/completadas.js");
const { emitirFP } = await import("../../../fp/aviso.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../../data/subjects.js");

const TEMAS = ["politica-economica", "demanda-agregada", "politica-fiscal"];
const temaDe = (id) => SUBJECTS.macroeconomia.topics.find((t) => t.id === id);
const nodosDelTema = (id, hechas = new Set()) => nodosDe(actividadesDeTipo(temaDe(id), HACER), hechas);

/* Las frases de los separadores que se quitaron: no pueden volver a aparecer en el camino. */
const FRASES_QUITADAS = [
  "Sube de nivel: ahora se aplica lo que aprendiste",
  "Aquí ya no hay una sola respuesta obvia",
  "La zona de los que se la saben",
];

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
const alturaDe = (cont, id) => parseFloat(cont.querySelector(`[data-bloque="${id}"]`).style.top);

/* ───────────────────────────── la regla, pura ───────────────────────────── */

test("bloquesDe: orden fijo, solo los bloques con algo y cada uno con su posición en el camino", () => {
  const n = (id, dificultad) => ({ id, dificultad, completada: false });

  let b = bloquesDe([n("a", "dificil"), n("b", "medio"), n("c", "experto")]);
  assert.deepEqual(b.map((x) => x.id), ["aplicacion", "analisis", "maestria"]);
  assert.deepEqual(b.map((x) => x.inicio), [0, 1, 2]);
  for (const x of b) assert.equal(x.separador, undefined, "ya no hay separadores");

  b = bloquesDe([n("x", "experto"), n("y", "facil")]);
  assert.deepEqual(b.map((x) => x.id), ["cimientos", "maestria"]);

  b = bloquesDe([n("a", "medio"), n("raro", "legendario")]);
  assert.deepEqual(b.map((x) => x.id), ["aplicacion", "otras"], "una dificultad desconocida va al final, no se pierde");

  assert.deepEqual(bloquesDe([]), []);
});

/* ─────────────────────────── el bloque vacío, pintado ─────────────────────────── */

test("un bloque vacío no pinta nada; registrar una actividad Fácil en el catálogo lo hace aparecer, y quitarla lo quita", () => {
  for (const temaId of TEMAS) {
    const tema = temaDe(temaId);
    const m = montar(camino(nodosDelTema(temaId)));

    assert.deepEqual(bloquesPintados(m.cont), ["aplicacion", "analisis", "maestria"], temaId);
    assert.ok(!m.cont.textContent.includes("Cimientos"), `${temaId}: ni el título`);

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
      assert.equal(m.cont.querySelector('[data-bloque="cimientos"] h3').textContent, "Cimientos");
      assert.ok(m.cont.querySelector('g[data-nodo="prueba-facil"][data-bloque-de="cimientos"]'), `${temaId}: la actividad cae en su bloque`);
      assert.ok(alturaDe(m.cont, "cimientos") < alturaDe(m.cont, "aplicacion"), "Cimientos va antes que Aplicación");
    } finally {
      tema.actividades.splice(tema.actividades.indexOf(falsa), 1);
    }

    m.pintar(camino(nodosDelTema(temaId)));
    assert.deepEqual(bloquesPintados(m.cont), ["aplicacion", "analisis", "maestria"], `${temaId}: se va al quitarla`);
    assert.ok(!m.cont.textContent.includes("Cimientos"));
    m.desmontar();
  }
});

test("cada actividad de los tres caminos va en el bloque de su dificultad del catálogo", () => {
  for (const temaId of TEMAS) {
    const m = montar(camino(nodosDelTema(temaId)));
    for (const a of actividadesDeTipo(temaDe(temaId), HACER)) {
      const bloque = BLOQUES.find((b) => b.dificultad === a.clasificacion.dificultad);
      assert.ok(m.cont.querySelector(`g[data-nodo="${a.id}"][data-bloque-de="${bloque.id}"]`), `${a.id} debería estar en ${bloque.nombre}`);
    }
    m.desmontar();
  }
});

/* ─────────────────────────── la línea y los títulos ─────────────────────────── */

test("el camino es una sola línea de punta a punta, sin separadores entre bloques", () => {
  for (const temaId of TEMAS) {
    const nodos = nodosDelTema(temaId);
    const m = montar(camino(nodos));
    assert.equal(m.cont.querySelectorAll("[data-camino-bloques] > svg").length, 1, `${temaId}: un solo lienzo`);
    const lineas = m.cont.querySelectorAll("path[data-linea]");
    assert.equal(lineas.length, 1, `${temaId}: una sola línea`);

    /* Empieza en el primer nodo y acaba en el último: no se corta en ningún bloque. */
    const { puntos } = disposicionPorBloques(bloquesDe(nodos), nodos.length);
    const numeros = lineas[0].getAttribute("d").match(/-?\d+(\.\d+)?/g).map(Number);
    assert.deepEqual(numeros.slice(0, 2), [+puntos[0].x.toFixed(1), +puntos[0].y.toFixed(1)]);
    assert.deepEqual(numeros.slice(-2), [+puntos.at(-1).x.toFixed(1), +puntos.at(-1).y.toFixed(1)]);
    assert.equal(numeros.length, 2 + (puntos.length - 1) * 6, "una curva por tramo, todos los nodos");

    assert.equal(m.cont.querySelectorAll("[data-separador]").length, 0);
    for (const frase of FRASES_QUITADAS) assert.ok(!m.cont.textContent.includes(frase), `${temaId}: «${frase}»`);
    m.desmontar();
  }
});

/* Un punto de un tramo de Bézier. */
const enCurva = ({ p1, c1, c2, p2 }, t) => {
  const s = 1 - t;
  return {
    x: s ** 3 * p1.x + 3 * s * s * t * c1.x + 3 * s * t * t * c2.x + t ** 3 * p2.x,
    y: s ** 3 * p1.y + 3 * s * s * t * c1.y + 3 * s * t * t * c2.y + t ** 3 * p2.y,
  };
};

test("ninguna línea ni ningún nodo cae en la franja de un título, con los bloques de hoy y con cualquier otro reparto", () => {
  const ANCHO = 420;
  const ANCHO_TITULO = 0.58 * ANCHO; /* el maxWidth del título */
  const n = (id, dificultad) => ({ id, nombre: id, dificultad, completada: false });
  const repartos = [
    ...TEMAS.map((t) => nodosDelTema(t)),
    /* Repartos que no existen todavía, para que la regla no dependa de 2-3-2. */
    ...[[1, 1, 1, 1], [2, 2, 2], [3, 1, 2], [1, 4], [4, 4, 1, 3], [2, 2, 2, 2]].map((r) =>
      r.flatMap((k, b) => Array.from({ length: k }, (_, j) => n(`b${b}-${j}`, BLOQUES[b].dificultad)))),
  ];

  for (const nodos of repartos) {
    const bloques = bloquesDe(nodos);
    const { m, puntos, cabeceras, banda } = disposicionPorBloques(bloques, nodos.length);
    for (const c of cabeceras) {
      const x0 = c.lado < 0 ? 0 : ANCHO - ANCHO_TITULO;
      const x1 = c.lado < 0 ? ANCHO_TITULO : ANCHO;
      const fuera = (x) => (c.lado < 0 ? x > x1 + m.grosor : x < x0 - m.grosor);
      for (const tramo of tramosDe(puntos)) {
        for (let t = 0; t <= 1; t += 0.02) {
          const { x, y } = enCurva(tramo, t);
          if (y >= c.y && y <= c.y + banda) assert.ok(fuera(x), `línea en la franja de ${c.id} (x=${x.toFixed(0)}, y=${y.toFixed(0)})`);
        }
      }
      for (const p of puntos) {
        const cruzaY = p.y + m.radio > c.y && p.y - m.radio < c.y + banda;
        const cruzaX = p.x + m.radio > x0 && p.x - m.radio < x1;
        assert.ok(!(cruzaY && cruzaX), `el nodo ${p.id} cae en la franja de ${c.id}`);
      }
    }
  }

  /* Con los bloques de hoy, los tres títulos quedan a la izquierda, como estaban. */
  for (const temaId of TEMAS) {
    const nodos = nodosDelTema(temaId);
    assert.deepEqual(disposicionPorBloques(bloquesDe(nodos), nodos.length).cabeceras.map((c) => c.lado), [-1, -1, -1], temaId);
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
  /* Y el tramo recorrido de la línea llega al siguiente nodo. */
  assert.equal(m.cont.querySelectorAll("path[data-recorrido]").length, 1);
  m.desmontar();
});

test("el color de los bloques es teal, nunca coral", () => {
  const m = montar(camino(nodosDelTema("politica-economica", new Set(["diagnostico-en-vivo", "tablero-decisiones"]))));
  const cromo = [...m.cont.querySelectorAll("[data-cabeza-bloque], path[data-recorrido]")].map((e) => e.outerHTML).join("");
  assert.ok(cromo.length > 0);
  assert.ok(!/E76F51|231,\s*111,\s*81/i.test(cromo), "coral en un título, un anillo o el recorrido");
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
