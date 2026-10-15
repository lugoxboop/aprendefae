import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 1 — «Lo que otros le deben a la empresa» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del contenido guardado
 *     (paquetes/b5-t6-aprender1.md), y ningún componente escribe texto propio
 *   · la capa 2: el texto y el pie de cada paso (9 y el cierre), qué se
 *     resalta, las cápsulas de Debe (teal, «se debita») y Haber (ámbar, «se
 *     acredita»), que no se atenúan, y el paso 9 de la guía v2
 *   · el bloque de control pegado (sticky) y «Reproducir» como LoQueYaPaso
 *   · la capa 3: el bloque final solo con los seis hechos abiertos
 *   · la capa 4: UnaFrase con la devolución correcta corregida
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
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

const D = await import("../../data/contabilidadT6Pieza1.js");
const E = await import("../t6Pieza1.js");
const { default: DosMomentos } = await import("../../components/mecanicas/libros/tema6/DosMomentos.jsx");
const { default: SeisHechos } = await import("../../components/mecanicas/libros/tema6/SeisHechos.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { FAE } = await import("../../theme.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const dormir = async (ms) => { for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(100, ms - t))); }); };
/* El color que pinta el navegador, comparable con los hex del tema. */
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "glosa", "rotuloDelLibro"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del contenido guardado (paquetes/b5-t6-aprender1.md)", () => {
  const fuente = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender1.md", import.meta.url), "utf8");
  const sueltos = textosDeDatos().filter((t) => !fuente.includes(t));
  assert.deepEqual(sueltos, []);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["DosMomentos.jsx", "SeisHechos.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ capa 1: cinco términos; las citas con «» y página; la glosa de nota débito bajo el término 4", () => {
  const n = D.PIEZA_LO_QUE_LE_DEBEN.nombres;
  assert.deepEqual(n.map((x) => x.termino), [
    "Cuentas por cobrar", "Clientes", "Otras cuentas por cobrar",
    "Cuándo sube lo que deben los clientes", "Cuándo baja lo que deben los clientes",
  ]);
  assert.match(n[0].delLibro, /^«.*» \(p\. 195\)$/);
  assert.match(n[1].delLibro, /^«.*» \(p\. 196\)$/);
  assert.equal(n[3].delLibro, D.GLOSA_NOTA_DEBITO.texto);
  /* La nota de «cartera» va debajo de la cita del término 2 (auditoría integral). */
  assert.equal(n[1].notaDebajo, D.NOTA_CLIENTES);
  assert.equal(n.filter((x) => x.notaDebajo).length, 1);
});

test("★★★ auditoría integral: el término 5 de Futaba, con su pie, sin el traslado a difícil cobro", () => {
  const t5 = D.PIEZA_LO_QUE_LE_DEBEN.nombres[4];
  assert.equal(t5.definicion, "Cuando lo que deben los clientes baja, se acredita. Baja cuando el cliente paga. También baja cuando devuelve mercancía que había comprado a crédito y todavía no había pagado: es una devolución de ventas. Baja cuando la empresa le otorga un descuento sobre lo que todavía le debe. Y baja cuando la deuda se da por perdida, algo que se explica más adelante.");
  assert.equal(t5.pie, "Basado en el libro, pp. 197 y 199-200");
  assert.ok(!/difícil cobro/.test(t5.definicion));
});

test("★★★ auditoría integral: la nota de «cartera» se ve en pantalla, debajo de la cita del término 2", async () => {
  const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
  const { PIEZAS } = await import("../../components/ContabilidadTema6View.jsx");
  const pieza = PIEZAS[0].pieza;
  const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza, Capa2, Exploracion, Capa4, rotulo: "R" }));
  const terminos = [...caja.querySelectorAll('[data-capa="1"] dl > div')];
  assert.equal(terminos.length, 5);
  /* Solo el término 2 la lleva, y dentro del bloque de la cita. */
  assert.deepEqual(terminos.map((t) => Boolean(t.querySelector("[data-nota-debajo]"))), [false, true, false, false, false]);
  const bloque = terminos[1].querySelector("[data-del-libro]");
  const cita = bloque.querySelector("[data-cita]");
  const nota = bloque.querySelector("[data-nota-debajo]");
  assert.equal(cita.textContent, D.PIEZA_LO_QUE_LE_DEBEN.nombres[1].delLibro);
  assert.equal(nota.querySelector("[data-rotulo-nota]").textContent, "Nota");
  assert.equal(nota.textContent, `Nota${D.NOTA_CLIENTES.texto}`);
  /* La cita se lee primero; la nota, después. */
  assert.ok(cita.compareDocumentPosition(nota) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(getComputedStyle(nota).display, "block");
  /* El término 5 nuevo, en pantalla. */
  assert.ok(terminos[4].textContent.includes("Y baja cuando la deuda se da por perdida, algo que se explica más adelante."));
  desmontar();
});

/* ═══════════ CAPA 2 ═══════════ */

const RESALTADOS = {
  1: ["hecho10"], 2: ["hecho10"], 3: ["plazo"], 4: ["ingresos10"], 5: ["clientes10"],
  6: ["hecho25"], 7: ["caja25"], 8: ["clientes25"], 9: ["dia25", "ingresos10"], 10: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de cada uno de los 9 pasos y del cierre", async () => {
  const { caja, desmontar } = await montar(h(DosMomentos));
  const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
  for (let p = 1; p <= 10; p++) {
    const esperado = p <= 9 ? D.PASOS_T6[p - 1] : D.CIERRE_T6;
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, esperado.texto, `texto, paso ${p}`);
    assert.equal(caja.querySelector("[data-pie]").textContent, esperado.pie, `pie, paso ${p}`);
    assert.deepEqual(res(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
    if (p <= 9) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 9`);
    if (p < 10) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(caja.querySelector("[data-paso-de]").style.visibility, "hidden");
  desmontar();
});

test("★★★ capa 2: el pie del paso 1 es solo «Libro, p. 197» (la nota interna no se pinta)", () => {
  assert.equal(D.PASOS_T6[0].pie, "Libro, p. 197");
  for (const x of [...D.PASOS_T6, D.CIERRE_T6]) assert.ok(!x.pie.includes("·") && !/errata/i.test(x.pie), x.pie);
});

test("★★★ cápsulas: Debe en teal dice «se debita», Haber en ámbar dice «se acredita», y no se atenúan", async () => {
  const { caja, desmontar } = await montar(h(DosMomentos));
  for (let p = 1; p < 9; p++) await tocar(caja.querySelector("[data-siguiente]"));
  /* Paso 9: casi todo está atenuado, menos lo resaltado; las cápsulas conservan su color. */
  const lados = [...caja.querySelectorAll("[data-lado]")];
  assert.deepEqual(lados.map((n) => `${n.closest("[data-elemento]").dataset.elemento}:${n.dataset.lado}:${n.textContent}`), [
    "ingresos10:haber:se acredita", "clientes10:debe:se debita", "caja25:debe:se debita", "clientes25:haber:se acredita",
  ]);
  for (const n of lados) {
    assert.equal(n.style.background, rgb(n.dataset.lado === "debe" ? FAE.teal : FAE.ambar), n.textContent);
    assert.equal(n.style.color, rgb(FAE.bg));
  }
  assert.equal(caja.querySelector('[data-elemento="clientes10"]').style.color, "rgb(168, 182, 200)", "la anotación sí se atenúa");
  desmontar();
});

test("★★★ paso 9 (guía v2): nada nuevo; el ingreso del 10 y el recuadro del 25 entero, este sin relleno navy y sin atenuar lo de dentro", async () => {
  const { caja, desmontar } = await montar(h(DosMomentos));
  const vistos = (p) => Object.entries(E.estadoPasoT6(p).elementos).filter(([, e]) => e.visible).map(([k]) => k).sort();
  assert.deepEqual(vistos(9), vistos(8), "el paso 9 no hace aparecer nada");
  for (let p = 1; p < 9; p++) await tocar(caja.querySelector("[data-siguiente]"));
  const d25 = caja.querySelector('[data-elemento="dia25"]');
  assert.equal(d25.style.borderWidth, "2px");
  assert.equal(d25.style.background, "transparent");
  for (const id of ["hecho25", "caja25", "clientes25"]) assert.equal(E.estadoPasoT6(9).elementos[id].atenuado, false, id);
  assert.equal(caja.textContent.includes("Ningún ingreso nuevo"), false, "la anotación del 25 ya no existe");
  desmontar();
});

test("★★ capa 2: «Anterior» devuelve el estado exacto de cada paso", async () => {
  const { caja, desmontar } = await montar(h(DosMomentos));
  const foto = () => [...caja.querySelectorAll("[data-elemento]")].map((n) => `${n.dataset.elemento}:${n.dataset.resaltado ?? ""}:${n.style.visibility}`).join("|");
  const fotos = {};
  for (let p = 1; p <= 10; p++) { fotos[p] = foto(); if (p < 10) await tocar(caja.querySelector("[data-siguiente]")); }
  for (let p = 9; p >= 1; p--) { await tocar(caja.querySelector("[data-anterior]")); assert.equal(foto(), fotos[p], `paso ${p}`); }
  desmontar();
});

test("★★★ el bloque de control lleva el texto, el pie y los controles, y se FIJA cuando su sitio queda bajo la ventana (modo B)", async () => {
  /* El Panel y su capa, como los pinta CuatroCapas; el bloque busca el Panel como padre de su capa. */
  const marco = document.createElement("section");
  const capa = document.createElement("section");
  capa.setAttribute("data-capa", "2");
  const host = document.createElement("div");
  marco.appendChild(capa); capa.appendChild(host); document.body.appendChild(marco);
  marco.getBoundingClientRect = () => ({ top: 0, left: 16, width: 288, height: 3000, bottom: 3000, right: 304 });
  const raiz = createRoot(host);
  await act(async () => { raiz.render(h(DosMomentos)); });
  const b = host.querySelector("[data-bloque-control]");
  for (const sel of ["[data-texto-paso]", "[data-pie]", "[data-anterior]", "[data-siguiente]", "[data-reproducir]", "[data-paso-de]"]) {
    assert.ok(b.querySelector(sel), `${sel} fuera del bloque`);
  }
  assert.equal(host.querySelector("[data-escena]").getAttribute("aria-hidden"), "true");
  /* En su sitio, mientras cabe. */
  assert.equal(b.style.position, "relative");
  /* JSDOM no maqueta: se simula que el sitio del bloque queda 2 000 px abajo y la capa está en pantalla. */
  host.querySelector("[data-hueco-bloque]").getBoundingClientRect = () => ({ top: 2000, bottom: 2000, left: 16, width: 288, height: 0, right: 304 });
  host.querySelector("[data-capa2-t6]").getBoundingClientRect = () => ({ top: 100, bottom: 2300, left: 31, width: 258, height: 2200, right: 289 });
  await act(async () => { window.dispatchEvent(new w.Event("scroll")); await new Promise((r) => setTimeout(r, 40)); });
  assert.equal(b.style.position, "fixed");
  assert.equal(b.style.left, "17px", "borde izquierdo del Panel + 1");
  assert.equal(b.style.width, "286px", "ancho del Panel − 2");
  assert.equal(b.dataset.modo, "B-fijo");
  /* Y vuelve a su sitio cuando el sitio ya está en pantalla. */
  host.querySelector("[data-hueco-bloque]").getBoundingClientRect = () => ({ top: 100, bottom: 100, left: 16, width: 288, height: 0, right: 304 });
  await act(async () => { window.dispatchEvent(new w.Event("scroll")); await new Promise((r) => setTimeout(r, 40)); });
  assert.equal(b.style.position, "relative");
  act(() => raiz.unmount());
  marco.remove();
});

test("★★★ «Reproducir» como LoQueYaPaso: 3 000 + 450 ms por palabra, aria-pressed, y «Ver de nuevo» en el cierre", async () => {
  assert.equal(E.duracionPasoT6(1), 3000 + 450 * D.PASOS_T6[0].texto.split(/\s+/).length);
  const { caja, desmontar } = await montar(h(DosMomentos));
  const rep = () => caja.querySelector("[data-reproducir]");
  assert.equal(rep().getAttribute("aria-pressed"), "false");
  await tocar(rep());
  assert.equal(rep().textContent, "Pausa");
  assert.equal(rep().getAttribute("aria-pressed"), "true");
  await dormir(E.duracionPasoT6(1) + 150);
  assert.equal(caja.querySelector("[data-paso-de]").textContent, "Paso 2 de 9");
  await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(rep().textContent, "Reproducir");
  for (let p = 3; p <= 10; p++) await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(rep().textContent, "Ver de nuevo");
  assert.equal(rep().hasAttribute("aria-pressed"), false);
  desmontar();
});

/* ═══════════ CAPA 3 ═══════════ */

/* Lo que se lee en una caja, sin su pie de fuente. */
const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");

test("★★★ capa 3: seis hechos; cada uno revela lo suyo y no se cierra; el bloque final, solo con los seis abiertos", async () => {
  const { caja, desmontar } = await montar(h(SeisHechos));
  const ids = D.HECHOS_T6.map((x) => x.id);
  assert.equal(caja.querySelectorAll("[data-hecho]").length, 6);
  /* En un orden distinto del de la lista. */
  for (const [i, id] of [...ids].reverse().entries()) {
    const b = caja.querySelector(`[data-hecho="${id}"] button`);
    await tocar(b);
    assert.equal(b.getAttribute("aria-expanded"), "true");
    assert.equal(Boolean(b.querySelector("svg")), false, "sin chevrón al abrirse");
    assert.equal(lectura(caja.querySelector(`[data-revela="${id}"]`)), D.HECHOS_T6.find((x) => x.id === id).revela);
    assert.equal(lectura(caja.querySelector("[data-final]")), i < 5 ? "" : D.FINAL_CAPA_3_T6.texto);
  }
  desmontar();
});

/* La tabla de la capa 3 del paquete: «hecho» | «revela» | «pie» (★, versión que manda). */
const TABLA_CAPA_3 = (() => {
  const fuente = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender1.md", import.meta.url), "utf8");
  const i = fuente.indexOf("| Hecho | Al tocarlo | Etiqueta que ve (★) |");
  assert.ok(i >= 0, "el paquete no tiene la tabla de la capa 3 con pies");
  const filas = [];
  for (const linea of fuente.slice(i).split("\n").slice(2)) {
    if (!linea.startsWith("| «")) break;
    filas.push(linea.slice(2, -2).split(" | ").map((c) => c.replace(/^«(.*)»$/, "$1")));
  }
  const final = fuente.match(/Etiqueta del bloque final \(★\): «([^»]+)»/);
  assert.ok(final, "el paquete no tiene el pie del bloque final");
  return { filas, final: final[1] };
})();

test("★★★ capa 3: cada caja abierta y el bloque final muestran su pie (★), literal del paquete, con el estilo de fuente", async () => {
  assert.equal(TABLA_CAPA_3.filas.length, 6, "la tabla de la capa 3 se leyó entera");
  const { caja, desmontar } = await montar(h(SeisHechos));
  assert.equal(caja.querySelectorAll("[data-pie]").length, 0, "cerradas, sin pies");
  for (const [k, x] of D.HECHOS_T6.entries()) {
    const [hecho, revela, pie] = TABLA_CAPA_3.filas[k];
    const zona = caja.querySelector(`[data-hecho="${x.id}"]`);
    assert.equal(zona.querySelector("button").textContent.includes(hecho), true, `hecho ${k + 1}: «${hecho}»`);
    await tocar(zona.querySelector("button"));
    assert.equal(lectura(caja.querySelector(`[data-revela="${x.id}"]`)), revela, `revela ${k + 1}`);
    assert.equal(zona.querySelector("[data-pie]").textContent, pie, `pie ${k + 1}`);
  }
  const pies = [...caja.querySelectorAll("[data-pie]")];
  assert.equal(pies.length, 7, "seis cajas y el bloque final");
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, TABLA_CAPA_3.final);
  for (const n of pies) {
    assert.equal(n.style.fontSize, "12px");
    assert.equal(n.style.lineHeight, "16px");
  }
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y su devolución corregida", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T6.filter((o) => o.correcta).map((o) => o.texto), ["Baja, porque la deuda se paga; el ingreso ya estaba anotado."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_LO_QUE_LE_DEBEN.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6));
  for (const o of D.OPCIONES_FINAL_T6) {
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  /* La versión que manda (Futaba, 14-oct), no la línea corregida anterior. */
  assert.equal(D.OPCIONES_FINAL_T6[0].feedback, "Correcto. El 25 de enero, en los libros de Comercializadora Santa Pacha, Cuentas por cobrar – clientes baja: se acredita. No se anota ningún ingreso. Ese ya estaba desde el 10.");
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_LO_QUE_LE_DEBEN.id, /^b5-t6-/);
  for (const o of D.OPCIONES_FINAL_T6) assert.match(o.id, /^b5-t6-/);
  assert.match(D.GLOSA_NOTA_DEBITO.id, /^b5-t6-/);
});
