import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVISO DE CONTENIDO NUEVO (Xeno, P2; paquete y condiciones de Levi).
 *
 *   · lista vacía: no pinta nada (y no toca el almacenamiento)
 *   · 1 sin abrir: «Actividad nueva»; 2: «2 actividades nuevas»
 *   · abrir una baja la cuenta; abrir todas la apaga
 *   · pasados 14 días (23:59 de Bogotá) se apaga aunque no se haya abierto
 *   · si localStorage falla, la marca se ve hasta el tope y no rompe nada
 *   · tocar el nodo sin pulsar «Empezar» no cambia la cuenta
 *   · cada tema cuenta solo sus actividades
 *   · con el registro forzado a fallar, «Empezar» abre la actividad igual en
 *     los 4 temas de Macro
 *   · una actividad fuera de la lista no lee ni escribe nada
 *   · una materia sin el gancho de «Empezar» no muestra marca
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
w.Element.prototype.setPointerCapture = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage, sessionStorage: w.sessionStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
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

const N = await import("../contenidoNuevo.jsx");
const { default: CaminoHacer } = await import("../CaminoHacer.jsx");
const { default: TopicSplitCard } = await import("../../TopicSplitCard.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../../data/subjects.js");
const { nodosDe } = await import("../../../hacer/completadas.js");

const MACRO = SUBJECTS.macroeconomia;
const MONETARIA = MACRO.topics.find((t) => t.id === "politica-monetaria");
const idsHacer = (tema) => actividadesDeTipo(tema, HACER).map((a) => a.id);
const [A, B] = idsHacer(MONETARIA);
const HOY = "2026-10-07";
const ahoraDe = (iso) => Date.parse(iso);
const entrada = (ids, extra = {}) => ({ materia: "macroeconomia", tema: "politica-monetaria", tipo: "actividad", ids, publicada: HOY, ...extra });
const esperar = async (ms = 30) => act(async () => { await new Promise((ok) => setTimeout(ok, ms)); });

/* Un localStorage espía que cuenta lecturas y escrituras (y que puede fallar). */
function espiarAlmacen({ falla = false } = {}) {
  const real = globalThis.localStorage;
  const cuenta = { get: 0, set: 0 };
  const falso = {
    getItem: (k) => { cuenta.get += 1; if (falla) throw new Error("bloqueado"); return real.getItem(k); },
    setItem: (k, v) => { cuenta.set += 1; if (falla) throw new Error("bloqueado"); return real.setItem(k, v); },
    removeItem: (k) => real.removeItem(k),
  };
  Object.defineProperty(globalThis, "localStorage", { value: falso, configurable: true, writable: true });
  return { cuenta, restaurar: () => Object.defineProperty(globalThis, "localStorage", { value: real, configurable: true, writable: true }) };
}
/* Mete entradas en la lista real (la que lee el gancho de «Empezar») mientras dura `fn`. */
async function conLista(entradas, fn) {
  N.NOVEDADES.push(...entradas);
  try { return await fn(); } finally { N.NOVEDADES.splice(0, N.NOVEDADES.length); w.localStorage.clear(); }
}

/* ═══════════════════ LA LÓGICA ═══════════════════ */

test("★★★ este PR va con la lista VACÍA: no pinta nada en ningún tema y no toca el almacenamiento", () => {
  assert.deepEqual(N.NOVEDADES, []);
  const espia = espiarAlmacen();
  try {
    for (const materia of Object.values(SUBJECTS)) {
      for (const tema of materia.topics ?? []) assert.equal(N.marcaDeTema(materia.id, tema.id), null, `${materia.id}/${tema.id}`);
    }
    N.registrarApertura(A);
    assert.deepEqual(espia.cuenta, { get: 0, set: 0 });
  } finally { espia.restaurar(); }
});

test("★★★ 1 sin abrir: «Actividad nueva»; 2 sin abrir: «2 actividades nuevas»; los demás textos de Xeno", () => {
  const ahora = ahoraDe("2026-10-08T15:00:00Z");
  const vacio = new Set();
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista: [entrada([A])], ahora, abiertas: vacio }).texto, "Actividad nueva");
  const dos = N.marcaDeTema("macroeconomia", "politica-monetaria", { lista: [entrada([A, B])], ahora, abiertas: vacio });
  assert.equal(dos.texto, "2 actividades nuevas");
  assert.equal(dos.cuenta, 2);
  assert.equal(N.textoDeMarca([{ tipo: "pieza" }]), "Pieza nueva");
  assert.equal(N.textoDeMarca([{ tipo: "pieza" }, { tipo: "pieza" }, { tipo: "pieza" }]), "3 piezas nuevas");
  assert.equal(N.textoDeMarca([{ tipo: "pieza" }, { tipo: "actividad" }]), "Contenido nuevo");
  assert.equal(N.textoDeMarca([{ tipo: "actividad" }, { tipo: "actividad" }, { tipo: "actividad" }, { tipo: "actividad" }]), "4 actividades nuevas");
});

test("★★★ abrir una baja la cuenta; abrir todas la apaga (el registro, por usuario, en el navegador)", async () => {
  const lista = [entrada([A, B])];
  const ahora = ahoraDe("2026-10-08T15:00:00Z");
  w.localStorage.setItem("aprendefae-auth", JSON.stringify({ user: { id: "u-1" } }));
  try {
    const marca = () => N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora });
    assert.equal(marca().texto, "2 actividades nuevas");
    N.registrarApertura(A, { lista, diferir: (f) => f() });
    assert.equal(marca().texto, "Actividad nueva");
    /* Otro usuario en el mismo navegador tiene su propio registro. */
    w.localStorage.setItem("aprendefae-auth", JSON.stringify({ user: { id: "u-2" } }));
    assert.equal(marca().texto, "2 actividades nuevas");
    w.localStorage.setItem("aprendefae-auth", JSON.stringify({ user: { id: "u-1" } }));
    N.registrarApertura(B, { lista, diferir: (f) => f() });
    assert.equal(marca(), null);
  } finally { w.localStorage.clear(); }
});

test("★★★ pasados 14 días (23:59 de Bogotá) se apaga aunque no se haya abierto", () => {
  const lista = [entrada([A])];
  const abiertas = new Set();
  /* Publicada el 7 de octubre: se ve hasta el 21 de octubre a las 23:59:59 de Bogotá (UTC−5). */
  const ultimo = ahoraDe("2026-10-22T04:59:59.999Z");
  assert.equal(N.finDeLaMarca(HOY), ultimo);
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora: ahoraDe("2026-10-21T23:00:00-05:00"), abiertas }).texto, "Actividad nueva");
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora: ultimo, abiertas }).texto, "Actividad nueva");
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora: ultimo + 1, abiertas }), null);
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora: ahoraDe("2026-10-22T00:00:00-05:00"), abiertas }), null);
});

test("★★★ si localStorage falla, la marca se ve hasta el tope y nada se rompe", () => {
  const espia = espiarAlmacen({ falla: true });
  try {
    const lista = [entrada([A, B])];
    const ahora = ahoraDe("2026-10-08T15:00:00Z");
    assert.doesNotThrow(() => N.registrarApertura(A, { lista, diferir: (f) => f() }));
    assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora }).texto, "2 actividades nuevas");
    assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista, ahora: N.finDeLaMarca(HOY) + 1 }), null);
    assert.deepEqual([...N.leerAbiertas("u-1")], []);
  } finally { espia.restaurar(); }
  /* Un dato roto en el navegador tampoco rompe nada. */
  w.localStorage.setItem("aprendefae-novedades:anonimo", "{no es json");
  try {
    assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", { lista: [entrada([A])], ahora: ahoraDe("2026-10-08T15:00:00Z") }).texto, "Actividad nueva");
  } finally { w.localStorage.clear(); }
});

test("★★★ cada tema cuenta solo sus actividades, según su tema real", () => {
  const FISCAL = MACRO.topics.find((t) => t.id === "politica-fiscal");
  const lista = [entrada([A]), entrada([idsHacer(FISCAL)[0]], { tema: "politica-fiscal" })];
  const op = { lista, ahora: ahoraDe("2026-10-08T15:00:00Z"), abiertas: new Set() };
  /* Dos actividades en temas distintos: cada tarjeta dice «Actividad nueva», no «2 actividades nuevas». */
  assert.equal(N.marcaDeTema("macroeconomia", "politica-monetaria", op).texto, "Actividad nueva");
  assert.equal(N.marcaDeTema("macroeconomia", "politica-fiscal", op).texto, "Actividad nueva");
  assert.equal(N.marcaDeTema("macroeconomia", "politica-economica", op), null);
});

test("★★★ una materia sin el gancho de «Empezar» no muestra marca aunque tenga entradas", () => {
  const op = { ahora: ahoraDe("2026-10-08T15:00:00Z"), abiertas: new Set() };
  assert.equal(N.marcaDeTema("pensamiento-estrategico", "pensamiento-sistemico", { ...op, lista: [entrada(["x"], { materia: "pensamiento-estrategico", tema: "pensamiento-sistemico" })] }), null);
  assert.equal(N.marcaDeTema("contabilidad", "ingresos-gastos-y-caja", { ...op, lista: [entrada(["y"], { materia: "contabilidad", tema: "ingresos-gastos-y-caja" })] }), null);
  assert.deepEqual([...N.MATERIAS_CON_GANCHO], ["macroeconomia"]);
});

test("★★★ una actividad fuera de la lista no lee ni escribe nada", async () => {
  const espia = espiarAlmacen();
  try {
    N.registrarApertura("cualquier-otra", { lista: [entrada([A])] });
    await esperar();
    assert.deepEqual(espia.cuenta, { get: 0, set: 0 });
  } finally { espia.restaurar(); }
});

/* ═══════════════════ EL GANCHO EN «EMPEZAR» ═══════════════════ */

const montarCamino = async (tema, onAbrir) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), new Set());
  await act(async () => { raiz.render(h(CaminoHacer, { nodos, onAbrir, porBloques: true })); });
  return { caja, nodos, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocarNodo = async (caja, id) => {
  const g = caja.querySelector(`[data-nodo="${id}"]`);
  assert.ok(g, `no está el nodo ${id}`);
  await act(async () => { g.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const empezar = (caja) => [...document.querySelectorAll("button")].find((b) => b.textContent === "Empezar");

test("★★★ tocar el nodo sin pulsar «Empezar» no cambia la cuenta; pulsar «Empezar» la baja", async () => {
  await conLista([entrada([A, B])], async () => {
    const ahora = ahoraDe("2026-10-08T15:00:00Z");
    const marca = () => N.marcaDeTema("macroeconomia", "politica-monetaria", { ahora })?.texto ?? null;
    const abiertas = [];
    const m = await montarCamino(MONETARIA, (id) => abiertas.push(id));
    try {
      assert.equal(marca(), "2 actividades nuevas");
      await tocarNodo(m.caja, A);
      await esperar();
      assert.ok(empezar(m.caja), "el nodo abre su panel con «Empezar»");
      assert.equal(marca(), "2 actividades nuevas", "ver el panel no cuenta");
      await act(async () => { empezar(m.caja).click(); });
      assert.deepEqual(abiertas, [A]);
      await esperar();
      assert.equal(marca(), "Actividad nueva");
    } finally { m.desmontar(); }
  });
});

test("★★★ con el registro forzado a fallar, «Empezar» abre la actividad igual en los 4 temas de Macro", async () => {
  const temas = MACRO.topics.filter((t) => idsHacer(t).length > 0);
  assert.equal(temas.length, 4);
  for (const modo of ["almacen", "codigo"]) {
    /* Almacenamiento bloqueado, o una entrada rota en la lista que hace fallar el código del gancho. */
    const entradas = temas.map((t) => entrada([idsHacer(t)[0]], { tema: t.id }));
    if (modo === "codigo") entradas.push({ materia: "macroeconomia", tema: "roto", tipo: "actividad", ids: null, publicada: HOY });
    await conLista(entradas, async () => {
      const espia = espiarAlmacen({ falla: modo === "almacen" });
      try {
        for (const tema of temas) {
          const abiertas = [];
          const m = await montarCamino(tema, (id) => abiertas.push(id));
          try {
            const id = idsHacer(tema)[0];
            await tocarNodo(m.caja, id);
            await esperar();
            await act(async () => { empezar(m.caja).click(); });
            await esperar();
            assert.deepEqual(abiertas, [id], `${modo} · ${tema.id}: «Empezar» abre la actividad`);
          } finally { m.desmontar(); }
        }
      } finally { espia.restaurar(); }
    });
  }
});

test("★★ el diff de CaminoHacer se reduce a la llamada del gancho (y su import)", () => {
  const fuente = readFileSync(new URL("../CaminoHacer.jsx", import.meta.url), "utf8");
  assert.equal((fuente.match(/registrarApertura/g) ?? []).length, 2);
  assert.match(fuente, /onAbrir\?\.\(nodoDetalle\.id\);\n\s+registrarApertura\(nodoDetalle\.id\);/);
});

/* ═══════════════════ LA TARJETA ═══════════════════ */

const montarTarjeta = async (marca) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(TopicSplitCard, { topic: MONETARIA, icon: null, badges: [], accent: "#fff", hoverBg: "", hoverBorder: "", abierta: false, onAbrir() {}, onCerrar() {}, onElegirModo() {}, marca }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const sinIds = (html) => html.replace(/:r[0-9a-z]+:/g, ":id:");

test("★★★ la tarjeta: sin marca, idéntica; con marca, la misma tarjeta dentro y la pastilla antes, no enfocable", async () => {
  const sin = await montarTarjeta(null);
  const con = await montarTarjeta({ texto: "Actividad nueva", cuenta: 1, clave: "k" });
  try {
    assert.equal(sin.caja.querySelector("[data-novedad]"), null);
    assert.equal(sin.caja.querySelector("[data-con-novedad]"), null);
    const envoltura = con.caja.querySelector("[data-con-novedad]");
    assert.equal(envoltura.style.position, "relative");
    /* La tarjeta, por dentro, es la misma. */
    assert.equal(sinIds(envoltura.lastElementChild.outerHTML), sinIds(sin.caja.firstElementChild.outerHTML));
    /* La pastilla va antes en el orden de lectura, no recibe toques ni foco. */
    const pastilla = envoltura.firstElementChild;
    assert.equal(pastilla.dataset.novedad, "1");
    const visible = pastilla.cloneNode(true);
    visible.querySelectorAll("style").forEach((x) => x.remove());
    assert.equal(visible.textContent, "Actividad nueva");
    assert.equal(pastilla.style.pointerEvents, "none");
    assert.equal(pastilla.style.position, "absolute");
    assert.equal(pastilla.style.top, "-12px");
    assert.equal(pastilla.style.right, "16px");
    assert.equal(pastilla.getAttribute("lang"), "es");
    assert.equal(pastilla.querySelector("svg").getAttribute("aria-hidden"), "true");
    const enfocables = (c) => [...c.querySelectorAll("button, a, input, [tabindex]")].map((x) => x.outerHTML.replace(/:r[0-9a-z]+:/g, ""));
    assert.deepEqual(enfocables(con.caja), enfocables(sin.caja), "el orden de tabulación no cambia");
  } finally { sin.desmontar(); con.desmontar(); }
});

test("★★★ un solo destello por sesión; ninguno con movimiento reducido", async () => {
  /* Un IntersectionObserver de mentira que dice «60 % visible» al observar. */
  const IO = class { constructor(cb) { this.cb = cb; } observe() { setTimeout(() => this.cb([{ intersectionRatio: 0.7 }]), 0); } disconnect() {} };
  globalThis.IntersectionObserver = IO;
  w.sessionStorage.clear();
  try {
    REDUCIDO = true;
    const r = await montarTarjeta({ texto: "Actividad nueva", cuenta: 1, clave: "reducido" });
    await esperar(500);
    assert.equal(r.caja.querySelector("[data-destello]"), null, "con movimiento reducido no hay destello");
    r.desmontar();
    REDUCIDO = false;
    const a = await montarTarjeta({ texto: "Actividad nueva", cuenta: 1, clave: "una" });
    await esperar(500);
    assert.ok(a.caja.querySelector("[data-destello]"), "destella a los 400 ms de verse");
    await esperar(1000);
    assert.equal(a.caja.querySelector("[data-destello]"), null, "y se apaga a los 900 ms");
    a.desmontar();
    const b = await montarTarjeta({ texto: "Actividad nueva", cuenta: 1, clave: "una" });
    await esperar(600);
    assert.equal(b.caja.querySelector("[data-destello]"), null, "una vez por sesión");
    b.desmontar();
  } finally { delete globalThis.IntersectionObserver; REDUCIDO = false; w.sessionStorage.clear(); }
});
