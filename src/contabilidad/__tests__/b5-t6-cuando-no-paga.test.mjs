import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 2 — «Cuando un cliente no va a pagar» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t6-aprender2.md), con las comillas internas “ ”, y ningún
 *     componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 10 pasos y del cierre
 *     (la columna «Resalta» de Futaba); la misma cuenta de Clientes que se
 *     debita el 25 de mayo y se acredita el 31 de diciembre; sin provisión
 *     dibujada y sin coral; las fechas nunca se atenúan; el paso 10, con el
 *     gasto primero (prioridad de la v1b)
 *   · las correcciones de Shoko: el rótulo literal del paso 4 y «por $312.500»
 *   · la capa 3: las dos cajas iguales, el final solo con las dos abiertas
 *   · la capa 4: UnaFrase con una sola correcta y sus devoluciones
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

const D = await import("../../data/contabilidadT6Pieza2.js");
const E = await import("../t6Pieza2.js");
const { default: DosDias } = await import("../../components/mecanicas/libros/tema6/DosDias.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: DosMetodos } = await import("../../components/mecanicas/libros/tema6/DosMetodos.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema6View.jsx");
const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../data/subjects.js");
const { FAE } = await import("../../theme.js");
const { COLOR } = await import("../../data/contabilidadTema3.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "correcta"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender2.md", import.meta.url), "utf8");

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 60, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ comillas internas “ ” en los términos 3 y 4 y en la nota del término 2 (término 3: «Castigar una deuda», Sakuta); las citas del libro con «» y página", () => {
  const n = D.PIEZA_NO_VA_A_PAGAR.nombres;
  assert.deepEqual(n.map((x) => x.termino), [
    "Cuentas incobrables o de difícil cobro", "Cómo se decide", "Castigar una deuda", "Método de anulación directa", "Método de provisiones",
  ]);
  assert.ok(n[3].definicion.includes("dice “provisiones”, pero"));
  assert.ok(n[1].delLibro.includes("“Cuentas vigentes” y “Cuentas vencidas”"));
  assert.equal(n[1].rotuloDelLibro, "Nota");
  assert.equal(n[2].definicion, "Castigar una deuda es darla de baja porque ya no se espera cobrarla. El libro dice “castigar la cuenta”.");
  for (const t of [n[3].definicion, n[1].delLibro, n[2].definicion]) assert.doesNotMatch(t, /[«»]/, "comillas internas «» donde van “ ”");
  assert.match(n[0].delLibro, /^«.*» \(p\. 198\)$/);
  assert.match(n[3].delLibro, /^«.*» \(p\. 199\)$/);
  assert.match(n[4].delLibro, /^«.*» \(p\. 200\)$/);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["DosDias.jsx", "DosMetodos.jsx", "MaquinaPegada.jsx", "CajasQueRevelan.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ la pieza va segunda en el tema: APRENDER (no paga) y en la vista", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id).slice(0, 2), ["b5-t6-a1-lo-que-otros-le-deben", D.PIEZA_NO_VA_A_PAGAR.id]);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id).slice(0, 2), ["b5-t6-a1-lo-que-otros-le-deben", D.PIEZA_NO_VA_A_PAGAR.id]);
  const { Capa2, Exploracion } = ESCENAS_TEMA6[D.PIEZA_NO_VA_A_PAGAR.id];
  assert.equal(Capa2, DosDias, "la capa 2 de la pieza 2 es DosDias");
  assert.equal(Exploracion, DosMetodos, "la capa 3 de la pieza 2 es DosMetodos");
});

/* ═══════════ CAPA 2 ═══════════ */

test("★★★ cada paso lleva el pie de su fila en la tabla §4.2 de Mai (y la guarda lee las 11 filas)", () => {
  const filas = new Map();
  for (const l of FUENTE.split("\n")) {
    const m = l.match(/^(\d+|Cierre)\t«(.+)»\t[^\t]+\t([^\t]+)\t/);
    if (m) filas.set(m[2], m[3]);
  }
  assert.equal(filas.size, 11, "la tabla de estados del paquete tiene 10 pasos y el cierre");
  for (const p of [...D.PASOS_T6_A2, D.CIERRE_T6_A2]) assert.equal(p.pie, filas.get(p.texto), `pie de «${p.texto.slice(0, 40)}»`);
});

/* Desde qué paso se VE cada pieza de la escena (la columna «Aparece» de la guía). */
const APARECE = {
  dia25: 1, fecha25: 1, hecho25: 1, monto25: 2, clientes25: 3, ingresos25: 3,
  dia31: 4, fecha31: 4, hecho31: 4, nancy: 5, factura: 6, metodo: 7, gasto: 8, clientes31: 9,
};
/* El color que se ve: sube por los padres mientras el color se hereda. */
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};

test("★★★ cada pieza de la escena se ve desde su paso, y antes ocupa su sitio invisible", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  for (let p = 1; p <= 11; p++) {
    for (const [id, desde] of Object.entries(APARECE)) {
      const n = caja.querySelector(`[data-elemento="${id}"]`);
      assert.equal(n.style.visibility, p >= desde ? "visible" : "hidden", `paso ${p}: ${id}`);
    }
    if (p < 11) await tocar(caja.querySelector("[data-siguiente]"));
  }
  desmontar();
});

test("★★★ lo que se ve: las fechas nunca en gris (aunque su día se atenúe) y el monto resaltado del paso 2, en claro", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  const de = (id) => caja.querySelector(`[data-elemento="${id}"]`);
  let diaAtenuado = false;
  for (let p = 1; p <= 11; p++) {
    for (const f of ["fecha25", "fecha31"]) assert.equal(colorVisto(de(f)), rgb(FAE.text), `paso ${p}: ${f} en gris`);
    if (colorVisto(de("dia25")) === rgb(COLOR.apagado)) diaAtenuado = true;
    if (p === 2) assert.equal(colorVisto(de("monto25")), rgb(FAE.text), "el monto resaltado se ve en claro");
    if (p === 4) assert.equal(colorVisto(de("monto25")), rgb(COLOR.apagado), "el monto no resaltado se atenúa (control)");
    if (p < 11) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.ok(diaAtenuado, "control: el día del 25 sí se atenúa en algún paso");
  desmontar();
});

/* La columna «Resalta» de Futaba, paso por paso; en el 10, el gasto primero. */
const RESALTADOS = {
  1: ["hecho25"], 2: ["monto25"], 3: ["clientes25", "ingresos25"], 4: ["hecho31"], 5: ["nancy"],
  6: ["factura"], 7: ["metodo"], 8: ["gasto"], 9: ["clientes31"], 10: ["gasto", "fecha31"], 11: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de los 10 pasos y del cierre", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
  for (let p = 1; p <= 11; p++) {
    const esperado = p <= 10 ? D.PASOS_T6_A2[p - 1] : D.CIERRE_T6_A2;
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, esperado.texto, `texto, paso ${p}`);
    assert.equal(caja.querySelector("[data-pie]").textContent, esperado.pie, `pie, paso ${p}`);
    assert.deepEqual(res(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
    if (p <= 10) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 10`);
    if (p < 11) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(caja.querySelector("[data-paso-de]").style.visibility, "hidden");
  assert.deepEqual(E.estadoPasoT6A2(10).resaltados, ["gasto", "fecha31"], "el gasto manda sobre la fecha (v1b)");
  desmontar();
});

test("★★★ la escena: los rótulos literales (paso 4, «por $312.500»), la misma cuenta de Clientes en los dos días, sin provisión y sin coral", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  for (let p = 1; p <= 10; p++) await tocar(caja.querySelector("[data-siguiente]"));
  const texto = (id) => caja.querySelector(`[data-elemento="${id}"]`).textContent;
  assert.equal(texto("hecho31"), "Analiza lo que le deben sus clientes");
  assert.ok(D.PASOS_T6_A2[3].texto.includes("analiza lo que le deben sus clientes"), "el rótulo es fragmento literal del paso 4");
  assert.ok(texto("clientes31").includes("A nombre de Nancy, por $312.500"));
  assert.ok(texto("clientes31").startsWith("Cuentas por cobrar – clientes") && texto("clientes25").startsWith("Cuentas por cobrar – clientes"));
  assert.ok(texto("gasto").includes("$312.500"), "el castigo es por los $312.500 completos");
  /* Debe el 25 de mayo, Haber el 31 de diciembre. */
  assert.equal(caja.querySelector('[data-elemento="clientes25"] [data-lado]').dataset.lado, "debe");
  assert.equal(caja.querySelector('[data-elemento="clientes31"] [data-lado]').dataset.lado, "haber");
  assert.equal(caja.querySelector('[data-elemento="gasto"] [data-lado]').dataset.lado, "debe");
  const html = caja.querySelector("[data-escena]").outerHTML;
  assert.doesNotMatch(caja.querySelector("[data-escena]").textContent, /Provisión para deudas incobrables/, "sin provisión dibujada");
  assert.ok(!/E76F51|231,\s*111,\s*81/i.test(html), "sin coral");
  /* Todo rótulo de la escena es fragmento de un paso. */
  const pasos = D.PASOS_T6_A2.map((p) => p.texto.toLowerCase()).join(" ");
  for (const [k, r] of Object.entries(D.ESCENA_T6_A2)) {
    if (["debita", "acredita"].includes(k)) continue;
    assert.ok(pasos.includes(r.toLowerCase()), `rótulo que no es fragmento: «${r}»`);
  }
  desmontar();
});

test("★★★ las fechas nunca se atenúan; la del 31 de diciembre se resalta en el paso 10 con borde nodo y relleno navy, sin moverse", async () => {
  for (let p = 1; p <= 11; p++) {
    const e = E.estadoPasoT6A2(p).elementos;
    for (const f of ["fecha25", "fecha31"]) assert.equal(e[f].atenuado, false, `paso ${p}: ${f} atenuada`);
  }
  const { caja, desmontar } = await montar(h(DosDias));
  const f31 = () => caja.querySelector('[data-elemento="fecha31"]');
  for (let p = 1; p < 4; p++) await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(f31().style.borderWidth, "2px");
  assert.equal(f31().style.borderColor, "transparent");
  for (let p = 4; p < 10; p++) await tocar(caja.querySelector("[data-siguiente]"));
  assert.equal(f31().dataset.resaltado, "si");
  assert.equal(f31().style.borderColor, rgb(FAE.node));
  assert.equal(f31().style.background, rgb(FAE.navy));
  assert.equal(f31().style.borderWidth, "2px", "el mismo grosor: no se mueve");
  desmontar();
});

test("★★★ cápsulas: «se debita» en teal y «se acredita» en ámbar, sin atenuarse", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  for (let p = 1; p < 10; p++) await tocar(caja.querySelector("[data-siguiente]"));
  const lados = [...caja.querySelectorAll("[data-lado]")];
  assert.deepEqual(lados.map((n) => `${n.closest("[data-elemento]").dataset.elemento}:${n.dataset.lado}:${n.textContent}`), [
    "clientes25:debe:se debita", "ingresos25:haber:se acredita", "gasto:debe:se debita", "clientes31:haber:se acredita",
  ]);
  for (const n of lados) assert.equal(n.style.background, rgb(n.dataset.lado === "debe" ? FAE.teal : FAE.ambar));
  for (const n of lados) assert.equal(n.parentElement.style.flexWrap, "wrap", "si no cabe junto al movimiento, la cápsula baja de línea (v1b: 73,63)");
  desmontar();
});

test("★★ capa 2: «Anterior» devuelve el estado exacto de cada paso", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  const foto = () => [...caja.querySelectorAll("[data-elemento]")].map((n) => `${n.dataset.elemento}:${n.dataset.resaltado ?? ""}:${n.style.visibility}`).join("|");
  const fotos = {};
  for (let p = 1; p <= 11; p++) { fotos[p] = foto(); if (p < 11) await tocar(caja.querySelector("[data-siguiente]")); }
  for (let p = 10; p >= 1; p--) { await tocar(caja.querySelector("[data-anterior]")); assert.equal(foto(), fotos[p], `paso ${p}`); }
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra (los de la v1b de Mai)", () => {
  const ms = Array.from({ length: 10 }, (_, k) => E.duracionPasoT6A2(k + 1));
  assert.deepEqual(ms, [9300, 5250, 8850, 8850, 10200, 5250, 9750, 7050, 9300, 9750]);
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: los dos métodos se ven iguales; cada uno revela lo suyo con su pie; el final, solo con los dos decididos", async () => {
  const { caja, desmontar } = await montar(h(DosMetodos));
  assert.equal(caja.querySelector("p").textContent, D.CONSIGNA_CAPA_3_T6_A2);
  const cajas = [...caja.querySelectorAll("[data-hecho]")];
  assert.deepEqual(cajas.map((c) => c.querySelector("button span").textContent), ["Anulación directa", "Provisiones"]);
  assert.equal(cajas[0].querySelector("button span").getAttribute("style"), cajas[1].querySelector("button span").getAttribute("style"), "las dos cajas iguales");
  assert.equal(cajas[0].getAttribute("style"), cajas[1].getAttribute("style"));
  const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");
  for (const [k, m] of D.METODOS_T6_A2.entries()) {
    await decidir(tocar, caja.querySelector(`[data-hecho="${m.id}"]`), m.correcta);
    assert.equal(lectura(caja.querySelector(`[data-revela="${m.id}"]`)), m.revela);
    assert.equal(caja.querySelector(`[data-revela="${m.id}"] [data-pie]`).textContent, m.pie);
    assert.equal(lectura(caja.querySelector("[data-final]")), k === 0 ? "" : D.FINAL_CAPA_3_T6_A2.texto);
  }
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, D.FINAL_CAPA_3_T6_A2.pie);
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y la devolución de cada una", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T6_A2.filter((o) => o.correcta).map((o) => o.texto), ["La provisión, porque el gasto ya estaba anotado."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_NO_VA_A_PAGAR.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6_A2));
  for (const o of D.OPCIONES_FINAL_T6_A2) {
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});
