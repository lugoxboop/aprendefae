import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 1 — «Del efectivo de sobra al activo financiero» (Célula B).
 *
 *   · todo el texto vive en un solo archivo de datos; ningún componente
 *     escribe texto propio (cuando Futaba reescriba, cambian solo datos)
 *   · la capa 1: siete términos en orden; citas con «» y página; notas con
 *     su rótulo
 *   · la capa 2: qué aparece, qué se resalta y qué se atenúa en cada paso
 *     (guía de Mai v3, §4.4); «Anterior» devuelve el estado exacto
 *   · la capa 3: el bloque final solo con los dos paquetes, en cualquier orden
 *   · la capa 4: UnaFrase sin cambios, cuatro opciones y una sola correcta
 *   · todo identificador nuevo empieza por b5-
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
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

const D = await import("../../data/contabilidadT5Pieza1.js");
const E = await import("../efectivoDeSobra.js");
const { default: EfectivoDeSobra } = await import("../../components/mecanicas/libros/tema5/EfectivoDeSobra.jsx");
const { default: DosPaquetes } = await import("../../components/mecanicas/libros/tema5/DosPaquetes.jsx");
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const dormir = async (ms) => { for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(100, ms - t))); }); };
/* El estado visual de la escena: cada nodo con sus estilos ordenados (React no garantiza el orden al actualizar). */
const fotoEscena = (caja) => [...caja.querySelectorAll("[data-escena] *")].map((n) => {
  const s = [...Array(n.style.length)].map((_, i) => n.style[i]).sort().map((k) => `${k}:${n.style.getPropertyValue(k)}`).join(";");
  return `${n.tagName}|${n.dataset.elemento ?? ""}|${n.dataset.resaltado ?? ""}|${s}|${n.children.length ? "" : n.textContent}`;
}).join("\n");

/* ═══════════ LOS TEXTOS, EN UN SOLO ARCHIVO ═══════════ */

const textosDeDatos = () => {
  const out = [];
  const recoger = (v) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(recoger);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "id") recoger(x);
  };
  Object.values(D).forEach(recoger);
  return out;
};

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante: todo sale del archivo de datos", () => {
  const fuentes = ["EfectivoDeSobra.jsx", "DosPaquetes.jsx", "escenasTema5.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema5/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue; // rótulos cortos como «CDT» pueden aparecer en comentarios
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano en un componente: «${t.slice(0, 50)}»`);
  }
});

test("★★★ capa 1: los siete términos, en el orden del paquete", () => {
  assert.deepEqual(D.PIEZA_DEL_EFECTIVO.nombres.map((n) => n.termino), [
    "Activo financiero", "Activo financiero temporal", "Título valor", "Tres grupos",
    "Acciones, en este tema", "Renta variable", "Renta fija",
  ]);
  assert.equal(D.PIEZA_DEL_EFECTIVO.titulo, "Del efectivo de sobra al activo financiero");
});

test("★★★ capa 1: las dos citas van entre «» con su página; las dos notas con el rótulo «Nota»", () => {
  const n = Object.fromEntries(D.PIEZA_DEL_EFECTIVO.nombres.map((x) => [x.termino, x]));
  for (const [t, p] of [["Activo financiero", 191], ["Activo financiero temporal", 192]]) {
    assert.match(n[t].delLibro, new RegExp(`^«.*» \\(p\\. ${p}\\)$`), t);
    assert.equal(n[t].rotuloDelLibro, undefined, `${t}: usa el rótulo del componente, «Así lo dice el libro»`);
  }
  for (const t of ["Acciones, en este tema", "Renta variable"]) assert.equal(n[t].rotuloDelLibro, "Nota", t);
  /* La cita 2 va en un solo párrafo, con «1.» y «2.» dentro del texto. */
  assert.ok(!n["Activo financiero temporal"].delLibro.includes("\n"));
  /* Comillas internas curvas, tal cual. */
  assert.ok(n["Activo financiero temporal"].definicion.includes("“negociables o realizables”"));
  /* Desde los textos finales, la definición 3 ya no lleva comillas internas. */
  assert.ok(!n["Título valor"].definicion.includes("“"));
  assert.ok(n["Renta variable"].delLibro.includes("“renta variable” y “renta fija”"));
});

test("★★ capa 1: las listas abiertas siguen abiertas («suelen», «entre otros»), sin «…» propio", () => {
  const n = Object.fromEntries(D.PIEZA_DEL_EFECTIVO.nombres.map((x) => [x.termino, x]));
  assert.ok(n["Tres grupos"].definicion.includes("suelen"));
  assert.equal(n["Renta fija"].definicion.match(/entre otros/g).length, 2);
  /* El único «…» es el de la cita del término 1, que es del libro. */
  const puntos = textosDeDatos().filter((t) => t.includes("…"));
  assert.deepEqual(puntos, [n["Activo financiero"].delLibro]);
});

/* ═══════════ CAPA 2: LOS ESTADOS (guía §4.4) ═══════════ */

const RESALTADOS = {
  1: ["efectivo"],
  2: ["cdt", "acciones", "participacion"],
  3: ["cdt"],
  4: ["acciones"],
  5: ["rinde-acciones"],
  6: ["participacion"],
  7: ["grupo", "venta"],
  8: [],
};
const VISIBLES_NUEVOS = {
  1: ["efectivo"],
  2: ["ramas", "grupo", "cdt", "acciones", "participacion"],
  3: ["tipo-cdt", "rinde-cdt"],
  4: ["tipo-acciones"],
  5: ["rinde-acciones"],
  6: ["tipo-participacion", "rinde-participacion"],
  7: ["venta"],
  8: [],
};

test("★★★ capa 2: siete pasos y el cierre; qué aparece y qué se resalta en cada uno", () => {
  assert.equal(E.PASOS, 7);
  assert.equal(E.CIERRE, 8);
  let visibles = [];
  for (let p = 1; p <= 8; p++) {
    visibles = [...visibles, ...VISIBLES_NUEVOS[p]];
    const s = E.estadoPaso(p).elementos;
    assert.deepEqual(Object.keys(s).filter((k) => s[k].visible).sort(), [...visibles].sort(), `visibles, paso ${p}`);
    assert.deepEqual(Object.keys(s).filter((k) => s[k].resaltado).sort(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
  }
});

test("★★★ capa 2: atenuado — paso 5 solo la cápsula, la tarjeta de acciones atenuada; paso 7 las tarjetas NO; cierre, nada", () => {
  const p5 = E.estadoPaso(5).elementos;
  assert.equal(p5.acciones.atenuado, true);
  assert.equal(p5["rinde-acciones"].atenuado, false);
  assert.equal(p5["tipo-cdt"].atenuado, true);
  const p7 = E.estadoPaso(7).elementos;
  for (const k of ["cdt", "acciones", "participacion", "tipo-cdt", "rinde-acciones", "tipo-participacion"]) assert.equal(p7[k].atenuado, false, k);
  assert.equal(p7.efectivo.atenuado, true);
  const p3 = E.estadoPaso(3).elementos;
  assert.equal(p3["tipo-cdt"].atenuado, false, "lo de dentro de la tarjeta resaltada no se atenúa");
  assert.equal(p3.acciones.atenuado, true);
  const c = E.estadoPaso(8).elementos;
  assert.ok(Object.values(c).every((e) => !e.atenuado && !e.resaltado));
});

test("★★★ capa 2 montada: el texto de cada paso, «Anterior» devuelve el estado exacto, y el cierre", async () => {
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  const texto = () => caja.querySelector("[data-texto-paso]").textContent;
  const resaltados = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
  const ant = caja.querySelector("[data-anterior]");
  const sig = caja.querySelector("[data-siguiente]");
  assert.equal(ant.textContent, "Anterior");
  assert.equal(sig.textContent, "Siguiente");
  assert.equal(ant.disabled, true);
  assert.equal(caja.querySelector("[data-escena]").getAttribute("aria-hidden"), "true");
  assert.equal(caja.querySelector("[data-texto-paso]").getAttribute("aria-live"), "polite");

  const vistos = {};
  for (let p = 1; p <= 8; p++) {
    assert.equal(texto(), p <= 7 ? D.PASOS_CAPA_2[p - 1] : D.CIERRE_CAPA_2, `texto, paso ${p}`);
    assert.deepEqual(resaltados(), [...RESALTADOS[p]].sort(), `resaltados montados, paso ${p}`);
    vistos[p] = fotoEscena(caja);
    if (p < 8) {
      assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 7`);
      await tocar(sig);
    }
  }
  assert.equal(sig.disabled, true, "en el cierre, «Siguiente» queda desactivado");
  assert.equal(caja.querySelector("[data-paso-de]").style.visibility, "hidden", "contador vacío, conserva su sitio");
  for (let p = 7; p >= 1; p--) {
    await tocar(ant);
    assert.equal(fotoEscena(caja), vistos[p], `«Anterior» al paso ${p}`);
  }
  assert.equal(ant.disabled, true);
  desmontar();
});

test("★★ capa 2: los ocho textos se apilan invisibles para reservar el alto del más largo", async () => {
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  const fantasmas = [...caja.querySelectorAll('[aria-hidden="true"] p')].map((p) => p.textContent);
  for (const t of [...D.PASOS_CAPA_2, D.CIERRE_CAPA_2]) assert.ok(fantasmas.includes(t));
  desmontar();
});

test("★★ capa 2: las tres tarjetas, idénticas en estilo y en orden (nada sugiere que la renta fija es segura)", async () => {
  assert.deepEqual(D.TITULOS.map((t) => t.nombre), ["CDT", "Acciones de otra empresa", "Títulos de participación"]);
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  await tocar(caja.querySelector("[data-siguiente]")); // paso 2: las tres resaltadas
  const estilos = D.TITULOS.map((t) => caja.querySelector(`[data-elemento="${t.id}"]`).getAttribute("style"));
  assert.equal(new Set(estilos).size, 1);
  desmontar();
});

/* ═══════════ CAPA 3 ═══════════ */

for (const orden of [["a", "b"], ["b", "a"]]) {
  test(`★★★ capa 3: el bloque final aparece solo con los dos paquetes abiertos (${orden.join(" → ")})`, async () => {
    const { caja, desmontar } = await montar(h(DosPaquetes));
    const boton = (id) => caja.querySelector(`[data-paquete="${id}"] button`);
    const final = () => caja.querySelector("[data-final]").textContent;
    assert.equal(final(), "");
    assert.ok(boton("a").querySelector("svg"), "chevrón antes de abrir");
    await tocar(boton(orden[0]));
    assert.equal(final(), "");
    assert.equal(boton(orden[0]).getAttribute("aria-expanded"), "true");
    assert.equal(boton(orden[0]).getAttribute("aria-disabled"), "true");
    assert.equal(Boolean(boton(orden[0]).querySelector("svg")), false, "al abrirse, el chevrón desaparece");
    const p = D.PAQUETES.find((x) => x.id === orden[0]);
    assert.equal(caja.querySelector(`[data-revela="${orden[0]}"]`).textContent, p.revela + p.pie);
    await tocar(boton(orden[0])); // no se vuelve a cerrar
    assert.equal(boton(orden[0]).getAttribute("aria-expanded"), "true");
    await tocar(boton(orden[1]));
    assert.equal(final(), D.FINAL_CAPA_3.join("") + D.PIE_FINAL_CAPA_3);
    desmontar();
  });
}

test("★★ capa 3: A y B se ven idénticos antes y después de tocarlos (sin color de acierto)", async () => {
  const { caja, desmontar } = await montar(h(DosPaquetes));
  const estilo = (id) => caja.querySelector(`[data-paquete="${id}"]`).getAttribute("style");
  assert.equal(estilo("a"), estilo("b"));
  await tocar(caja.querySelector('[data-paquete="a"] button'));
  await tocar(caja.querySelector('[data-paquete="b"] button'));
  assert.equal(estilo("a"), estilo("b"));
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta y las cuatro opciones del paquete; una sola correcta", async () => {
  assert.equal(D.OPCIONES_FINAL_T5.length, 4);
  assert.deepEqual(D.OPCIONES_FINAL_T5.filter((o) => o.correcta).map((o) => o.texto),
    ["Que se pueda vender fácil y vaya a volverse efectivo cuando haga falta."]);
  const { Capa4 } = ESCENAS_TEMA5[D.PIEZA_DEL_EFECTIVO.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.querySelector("[data-una-frase]"));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T5));
  for (const o of D.OPCIONES_FINAL_T5) {
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

/* ═══════════ IDENTIFICADORES ═══════════ */

test("★★★ todo identificador nuevo de la pieza empieza por b5-", () => {
  assert.match(D.PIEZA_DEL_EFECTIVO.id, /^b5-/);
  for (const o of D.OPCIONES_FINAL_T5) assert.match(o.id, /^b5-/);
  assert.equal(Object.keys(ESCENAS_TEMA5)[0], D.PIEZA_DEL_EFECTIVO.id, "la pieza 1 va primera en el tema");
});

/* ═══════════ EL PIE DE FUENTE Y «REPRODUCIR» (textos finales, 14-oct) ═══════════ */

test("★★★ capa 2: cada paso y el cierre llevan su pie de fuente, el de Futaba (el cierre, corregido)", async () => {
  assert.deepEqual([...D.PIES_CAPA_2, D.PIE_CIERRE_CAPA_2], [
    "Basado en el libro, p. 192", "Basado en el libro, pp. 192-193", "Libro, p. 193", "Libro, p. 192",
    "Libro, p. 192", "Libro, p. 193", "Basado en el libro, pp. 191 y 193", "Basado en el libro, pp. 192-193",
  ]);
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  const pies = [];
  for (let p = 1; p <= 8; p++) {
    pies.push(caja.querySelector("[data-pie]").textContent);
    if (p < 8) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.deepEqual(pies, [...D.PIES_CAPA_2, D.PIE_CIERRE_CAPA_2]);
  desmontar();
});

test("★★★ capa 3: los pies de fuente de las dos cajas y del bloque final se ven al abrirse", async () => {
  const { caja, desmontar } = await montar(h(DosPaquetes));
  assert.equal(caja.querySelectorAll("[data-pie]").length, 0, "cerradas, sin pie");
  await tocar(caja.querySelector('[data-paquete="a"] button'));
  assert.equal(caja.querySelector('[data-paquete="a"] [data-pie]').textContent, "Basado en el libro, p. 192");
  await tocar(caja.querySelector('[data-paquete="b"] button'));
  assert.equal(caja.querySelector('[data-paquete="b"] [data-pie]').textContent, "Basado en el libro, p. 192");
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, "Basado en el libro, pp. 191-192");
  desmontar();
});

test("★★★ «Reproducir» como LoQueYaPaso: avanza solo, «Pausa» con aria-pressed, Siguiente lo pasa a manual, y en el cierre «Ver de nuevo»", async () => {
  const E2 = await import("../efectivoDeSobra.js");
  /* 3 000 ms + 450 ms por palabra (loQueYaPaso.js). */
  assert.equal(E2.duracionPaso(1), 3000 + 450 * D.PASOS_CAPA_2[0].split(/\s+/).length);
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  const rep = () => caja.querySelector("[data-reproducir]");
  const pasoDe = () => caja.querySelector("[data-paso-de]").textContent;
  assert.equal(rep().textContent, "Reproducir");
  assert.equal(rep().getAttribute("aria-pressed"), "false");
  await tocar(rep());
  assert.equal(rep().textContent, "Pausa");
  assert.equal(rep().getAttribute("aria-pressed"), "true");
  await dormir(E2.duracionPaso(1) + 150);
  assert.equal(pasoDe(), "Paso 2 de 7", "avanzó solo");
  await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(rep().textContent, "Reproducir", "Siguiente lo pasa a manual");
  for (let p = 3; p <= 8; p++) await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(rep().textContent, "Ver de nuevo");
  assert.equal(rep().hasAttribute("aria-pressed"), false);
  await tocar(rep());
  assert.equal(pasoDe(), "Paso 1 de 7", "«Ver de nuevo» vuelve al paso 1");
  desmontar();
});

test("★★ guía v5: la cápsula de los títulos de participación dice «Diferencia al redimir» y se pinta en una sola línea", async () => {
  assert.equal(D.TITULOS.find((t) => t.id === "participacion").rinde, "Diferencia al redimir");
  const { caja, desmontar } = await montar(h(EfectivoDeSobra));
  const c = caja.querySelector('[data-elemento="rinde-participacion"]');
  assert.equal(c.textContent, "Diferencia al redimir");
  assert.equal(c.style.whiteSpace, "nowrap");
  desmontar();
});
