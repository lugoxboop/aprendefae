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
const { decidir } = await import("./b5-capa3.mjs");
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
/* Lote 21: si «Siguiente» espera la ficha que entra, se toca primero la ficha resaltada (b5-gestos.mjs). */
const { hacerGesto } = await import("./b5-gestos.mjs");
const tocar = async (el) => {
  if (el?.matches?.("[data-siguiente]")) await hacerGesto(el, act, w);
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const dormir = async (ms) => { for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(100, ms - t))); }); };
/* El color que pinta el navegador, comparable con los hex del tema. */
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "correcta", "glosa", "rotuloDelLibro"].includes(k)) out.push(v); }
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

test("★★ capa 1 (B2): seis términos; las citas con «» y página; «Nota débito» es término propio, antes de «Cuándo sube…»", () => {
  const n = D.PIEZA_LO_QUE_LE_DEBEN.nombres;
  assert.deepEqual(n.map((x) => x.termino), [
    "Cuentas por cobrar", "Clientes", "Otras cuentas por cobrar", "Nota débito",
    "Cuándo sube lo que deben los clientes", "Cuándo baja lo que deben los clientes",
  ]);
  assert.match(n[0].delLibro, /^«.*» \(p\. 195\)$/);
  assert.match(n[1].delLibro, /^«.*» \(p\. 196\)$/);
  /* B2: la definición del Tema 4, letra por letra, es ahora la del término 4; «Cuándo sube…» queda sin la nota debajo. */
  assert.equal(n[3].definicion, D.NOTA_DEBITO_T6.texto);
  assert.equal(n[3].delLibro, undefined);
  assert.equal(n[3].glosa, undefined, "la glosa provisional se retiró: el término 4 ya no lleva id de glosa");
  assert.equal(n[4].delLibro, undefined, "«Cuándo sube…» volvió a llevar la nota");
  assert.equal(n[4].rotuloDelLibro, undefined);
  /* La nota de «cartera» va debajo de la cita del término 2 (auditoría integral). */
  assert.equal(n[1].notaDebajo, D.NOTA_CLIENTES);
  assert.equal(n.filter((x) => x.notaDebajo).length, 1);
  /* Cada texto nuevo, literal de B2 (guardada al final del paquete); los demás, «el de hoy». */
  const fuente = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender1.md", import.meta.url), "utf8");
  const B2 = fuente.slice(fuente.indexOf("## B2 ·"));
  for (const x of n) assert.ok(B2.includes(`**${x.termino}**`), x.termino);
  for (const t of [n[0].definicion, n[0].delLibro, n[1].definicion, n[1].delLibro, D.NOTA_CLIENTES.texto, n[5].definicion]) assert.ok(B2.includes(t), `«${t.slice(0, 40)}…» no es literal de B2`);
  for (const t of ["Otras cuentas por cobrar", "Cuándo sube lo que deben los clientes"]) assert.ok(B2.includes(`**${t}** — El de hoy`), t);
  assert.ok(B2.includes("**Nota débito** — La definición del Tema 4, letra por letra."));
});

test("★★★ B2: el término 6 de Futaba, con su pie, sin el traslado a difícil cobro", () => {
  const t6 = D.PIEZA_LO_QUE_LE_DEBEN.nombres[5];
  assert.equal(t6.definicion, "Cuando lo que deben los clientes baja, se acredita. Baja cuando el cliente paga. Baja cuando devuelve mercancía comprada a crédito que aún no pagaba: es una devolución de ventas. Baja con un descuento sobre lo que aún debe. Y baja cuando la deuda se da por perdida.");
  assert.equal(t6.pie, "Basado en el libro, pp. 197 y 199-200");
  assert.ok(!/difícil cobro/.test(t6.definicion));
});

test("★★★ auditoría integral: la nota de «cartera» se ve en pantalla en el término 2, siempre a la vista; la cita, plegada en «Ver lo que dice el libro» (auditoría de interfaz de Shoko)", async () => {
  const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
  const { PIEZAS } = await import("../../components/ContabilidadTema6View.jsx");
  const pieza = PIEZAS[0].pieza;
  const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza, Capa2, Exploracion, Capa4, rotulo: "R" }));
  /* La capa 1 va paginada: se recorre término por término, abriendo «Ver lo que dice el libro» donde lo hay. */
  const puntos = [...caja.querySelectorAll('[data-capa="1"] [data-punto]')];
  assert.equal(puntos.length, 6);
  const cartas = [];
  for (const p of puntos) {
    await tocar(p);
    const carta = caja.querySelector('[data-capa="1"] [data-termino][data-actual]');
    const nota = carta.querySelector("[data-nota]");
    cartas.push({ conNota: Boolean(nota && !nota.closest("[hidden]")), carta });
    const mas = carta.querySelector("[data-mas]");
    if (mas) await tocar(mas);
    /* Lote 10: la figura va antes del nombre; el texto de la carta se lee desde el nombre. */
    cartas[cartas.length - 1].texto = carta.textContent.slice((carta.querySelector("[data-figura-antes]")?.textContent ?? "").length);
  }
  /* Solo el término 2 la lleva, y se ve sin abrir nada. */
  assert.deepEqual(cartas.map((c) => c.conNota), [false, true, false, false, false, false]);
  await tocar(puntos[1]);
  const carta = caja.querySelector('[data-capa="1"] [data-termino][data-actual]');
  const nota = carta.querySelector("[data-nota]");
  assert.equal(nota.firstElementChild.textContent, "Nota");
  assert.equal(nota.lastElementChild.textContent, D.NOTA_CLIENTES.texto);
  assert.ok(carta.querySelector("[data-definicion]").compareDocumentPosition(nota) & w.Node.DOCUMENT_POSITION_FOLLOWING, "bajo la definición");
  const mas = carta.querySelector("[data-mas]");
  assert.equal(mas.textContent, "Ver lo que dice el libro");
  if (mas.getAttribute("aria-expanded") !== "true") await tocar(mas);
  const bloque = carta.querySelector("[data-mas-contenido] [data-del-libro]");
  assert.equal(bloque.closest("[hidden]"), null, "la cita se ve al abrir");
  assert.equal(bloque.lastElementChild.textContent, D.PIEZA_LO_QUE_LE_DEBEN.nombres[1].delLibro);
  /* Clientes lleva los dos rótulos, distintos (B5). */
  assert.equal(bloque.firstElementChild.textContent, "Así lo dice el libro");
  assert.equal(carta.querySelector("[data-mas-contenido] [data-nota]"), null, "la nota no va plegada con la cita");
  /* El término 6 nuevo, en pantalla cuando le toca. */
  assert.ok(cartas[5].texto.includes("Y baja cuando la deuda se da por perdida."));
  /* «Nota débito», con su definición del Tema 4, en el término 4. */
  assert.ok(cartas[3].texto.startsWith("Nota débito"));
  assert.ok(cartas[3].texto.includes(D.NOTA_DEBITO_T6.texto));
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
    /* Lote 21: la escena es la de la ficha que entra (lo resaltado es lo que entra: b5-ficha-que-entra.test.mjs). */
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
  /* Lote 21: la escena ya no es decorativa: lleva las fichas que se tocan, que son botones con nombre. */
  assert.ok(host.querySelector("[data-escena] [data-ficha-entra]") || host.querySelector("[data-escena] [data-modelo]"));
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

test("★★★ capa 3: seis hechos; cada uno revela lo suyo al decidir y no se cierra; el bloque final, solo con los seis decididos", async () => {
  const { caja, desmontar } = await montar(h(SeisHechos));
  const ids = D.HECHOS_T6.map((x) => x.id);
  assert.equal(caja.querySelectorAll("[data-hecho]").length, 6);
  /* En un orden distinto del de la lista. */
  for (const [i, id] of [...ids].reverse().entries()) {
    const b = caja.querySelector(`[data-hecho="${id}"] button`);
    await decidir(tocar, caja.querySelector(`[data-hecho="${id}"]`), D.HECHOS_T6.find((x) => x.id === id).correcta);
    assert.equal(b.getAttribute("aria-expanded"), "true");
    assert.equal(Boolean(b.querySelector("svg")), true, "el chevrón se queda, girado (hoja 6)");
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
  /*
   * Encima, la tabla C1-4 del lote C2 · C1 · C7 (al final del paquete): sus
   * filas, en el orden de las cajas, mandan sobre el hecho, lo que se revela,
   * la devolución del segundo error y el pie; «La de hoy» deja lo de antes.
   */
  const j = fuente.indexOf("### C1-4 · T6 A1 · capa 3");
  assert.ok(j >= 0, "el paquete no tiene la tabla C1-4 del lote");
  const lote = fuente.slice(j).split("\n").slice(3, 9).map((l) => l.slice(2, -2).split(" | "));
  assert.equal(lote.length, 6);
  const fallas = [];
  lote.forEach(([, hecho, revela, falla, pie], k) => {
    const hoy = (t) => t === "La de hoy";
    if (!hoy(hecho)) filas[k][0] = hecho;
    if (!hoy(revela)) filas[k][1] = revela;
    if (!hoy(pie)) filas[k][2] = pie;
    fallas.push(hoy(falla) ? null : falla);
  });
  return { filas, final: final[1], fallas };
})();

test("★★★ capa 3: cada caja abierta y el bloque final muestran su pie (★), literal del paquete, con el estilo de fuente", async () => {
  assert.equal(TABLA_CAPA_3.filas.length, 6, "la tabla de la capa 3 se leyó entera");
  const { caja, desmontar } = await montar(h(SeisHechos));
  assert.equal(caja.querySelectorAll("[data-pie]").length, 0, "cerradas, sin pies");
  for (const [k, x] of D.HECHOS_T6.entries()) {
    const [hecho, revela, pie] = TABLA_CAPA_3.filas[k];
    const zona = caja.querySelector(`[data-hecho="${x.id}"]`);
    assert.equal(zona.querySelector("button").textContent.includes(hecho), true, `hecho ${k + 1}: «${hecho}»`);
    await decidir(tocar, zona, x.correcta);
    assert.equal(lectura(caja.querySelector(`[data-revela="${x.id}"]`)), revela, `revela ${k + 1}`);
    assert.equal(zona.querySelector("[data-pie]").textContent, pie, `pie ${k + 1}`);
    if (TABLA_CAPA_3.fallas[k]) assert.equal(x.falla, TABLA_CAPA_3.fallas[k], `al segundo error ${k + 1}`);
  }
  assert.deepEqual(TABLA_CAPA_3.fallas.map(Boolean), [false, true, false, false, false, false], "C1-4 cambia solo la devolución del pago");
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

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y su devolución (C1-5 del lote C2 · C1 · C7); su pie debajo", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T6.filter((o) => o.correcta).map((o) => o.texto), ["Nada: la deuda subió con la venta y bajó con la devolución."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_LO_QUE_LE_DEBEN.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6));
  for (const o of D.OPCIONES_FINAL_T6) {
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  /* C1-5: la pregunta ya no repite el ejemplo de la capa 2. */
  assert.equal(D.OPCIONES_FINAL_T6[0].feedback, "Correcto. La venta a crédito hizo subir la deuda, y la devolución la hizo bajar por el mismo valor.");
  assert.equal([...caja.querySelectorAll("[data-pie]")].at(-1).textContent, "Basado en el libro, p. 197");
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_LO_QUE_LE_DEBEN.id, /^b5-t6-/);
  for (const o of D.OPCIONES_FINAL_T6) assert.match(o.id, /^b5-t6-/);
});
