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
 *   · la capa 2: el texto, el pie y lo resaltado de los 9 pasos y del cierre
 *     (la columna «Resalta» de Futaba; el paso 10 lo quitó el lote C1-6 de
 *     Futaba, con el cierre corto); la misma cuenta de Clientes que se
 *     debita el 25 de mayo y se acredita el 31 de diciembre; sin provisión
 *     dibujada y sin coral; las fechas nunca se atenúan
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
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 60, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ B2: siete términos en el orden de Futaba, literales; comillas internas “ ” en los términos 3 y 4; las citas del libro con «» y página", () => {
  const n = D.PIEZA_NO_VA_A_PAGAR.nombres;
  assert.deepEqual(n.map((x) => x.termino), [
    "Cuentas incobrables o de difícil cobro", "Cómo se decide", "Castigar una deuda", "Método de anulación directa",
    "La desventaja de la anulación directa", "Método de provisiones", "Los asientos del método de provisiones",
  ]);
  /* B2 (un término por pantalla, 15-oct), guardada al final del paquete: cada texto, literal; «el de hoy» donde lo dice. */
  const B2 = FUENTE.slice(FUENTE.indexOf("## B2 ·"));
  for (const x of n) {
    assert.ok(B2.includes(`**${x.termino}**`), x.termino);
    for (const t of [x.definicion, x.delLibro].filter(Boolean)) {
      if (!B2.includes(t)) assert.ok([n[1].definicion, n[2].definicion, n[5].delLibro].includes(t), `${x.termino}: «${t.slice(0, 40)}…» no es de B2 ni «el de hoy»`);
    }
  }
  assert.ok(B2.includes("**Cómo se decide** — Def.: La de hoy. · Nota: Una deuda vigente todavía está dentro de su plazo de pago. Una vencida ya lo pasó."));
  assert.ok(B2.includes("**Castigar una deuda** — El de hoy."));
  assert.ok(B2.includes("**Método de provisiones** — Def.: Al cerrar el periodo, la empresa estima qué parte de lo que le deben los clientes no va a recuperar. Ese valor se anota como gasto desde ya. · Cita: la de hoy, de la p. 200."));
  assert.ok(n[3].definicion.includes("dice “provisiones”, pero"));
  assert.equal(n[1].delLibro, "Una deuda vigente todavía está dentro de su plazo de pago. Una vencida ya lo pasó.");
  assert.equal(n[1].rotuloDelLibro, "Nota");
  assert.equal(n[2].definicion, "Castigar una deuda es darla de baja porque ya no se espera cobrarla. El libro dice “castigar la cuenta”.");
  for (const t of [n[3].definicion, n[1].delLibro, n[2].definicion]) assert.doesNotMatch(t, /[«»]/, "comillas internas «» donde van “ ”");
  assert.match(n[0].delLibro, /^«.*» \(p\. 198\)$/);
  /* La cita de la p. 199 pasa a la desventaja; la anulación directa queda sin cita. */
  assert.equal(n[3].delLibro, undefined);
  assert.match(n[4].delLibro, /^«.*» \(p\. 199\)$/);
  assert.match(n[5].delLibro, /^«.*» \(p\. 200\)$/);
  assert.equal(n[6].delLibro, undefined);
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

test("★★★ cada paso lleva el pie de su fila en la tabla §4.2 de Mai (y la guarda lee las 11 filas); sin el paso 10 y con el cierre del lote C1-6", () => {
  const filas = new Map();
  const porFila = new Map();
  for (const l of FUENTE.split("\n")) {
    const m = l.match(/^(\d+|Cierre)\t«(.+)»\t[^\t]+\t([^\t]+)\t/);
    if (m) { filas.set(m[2], m[3]); porFila.set(m[1], { texto: m[2], pie: m[3] }); }
  }
  assert.equal(filas.size, 11, "la tabla de estados del paquete tiene 10 pasos y el cierre");
  for (const p of D.PASOS_T6_A2) assert.equal(p.pie, filas.get(p.texto), `pie de «${p.texto.slice(0, 40)}»`);
  /* C1-6: el paso 10 se elimina; el cierre cambia de texto (literal del lote) y conserva su pie. */
  assert.equal(D.PASOS_T6_A2.length, 9);
  assert.ok(!D.PASOS_T6_A2.some((p) => p.texto === porFila.get("10").texto), "el paso 10 ya no está");
  assert.equal(D.CIERRE_T6_A2.texto, "Con la anulación directa, la deuda se borra sin dejar información aparte.");
  assert.ok(FUENTE.includes(`Cierre de la capa 2: «${D.CIERRE_T6_A2.texto}»`), "el cierre, literal del lote");
  assert.equal(D.CIERRE_T6_A2.pie, porFila.get("Cierre").pie);
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
  for (let p = 1; p <= 10; p++) {
    for (const [id, desde] of Object.entries(APARECE)) {
      const n = caja.querySelector(`[data-elemento="${id}"]`);
      assert.equal(enSilueta(n), p < desde, `paso ${p}: ${id} ${p < desde ? "en silueta" : "a la vista"}`);
    }
    if (p < 10) await tocar(caja.querySelector("[data-siguiente]"));
  }
  desmontar();
});

test("★★★ lo que se ve: las fechas nunca en gris (aunque su día se atenúe) y el monto resaltado del paso 2, en claro", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  const de = (id) => caja.querySelector(`[data-elemento="${id}"]`);
  let diaAtenuado = false;
  for (let p = 1; p <= 10; p++) {
    for (const f of ["fecha25", "fecha31"]) assert.equal(colorVisto(de(f)), rgb(FAE.text), `paso ${p}: ${f} en gris`);
    if (colorVisto(de("dia25")) === rgb(COLOR.apagado)) diaAtenuado = true;
    if (p === 2) assert.equal(colorVisto(de("monto25")), rgb(FAE.text), "el monto resaltado se ve en claro");
    if (p === 4) assert.equal(colorVisto(de("monto25")), rgb(COLOR.apagado), "el monto no resaltado se atenúa (control)");
    if (p < 10) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.ok(diaAtenuado, "control: el día del 25 sí se atenúa en algún paso");
  desmontar();
});

/* La columna «Resalta» de Futaba, paso por paso (sin el paso 10, que quitó el lote C1-6). */
const RESALTADOS = {
  1: ["hecho25"], 2: ["monto25"], 3: ["clientes25", "ingresos25"], 4: ["hecho31"], 5: ["nancy"],
  6: ["factura"], 7: ["metodo"], 8: ["gasto"], 9: ["clientes31"], 10: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de los 9 pasos y del cierre", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
  for (let p = 1; p <= 10; p++) {
    const esperado = p <= 9 ? D.PASOS_T6_A2[p - 1] : D.CIERRE_T6_A2;
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, esperado.texto, `texto, paso ${p}`);
    assert.equal(caja.querySelector("[data-pie]").textContent, esperado.pie, `pie, paso ${p}`);
    assert.deepEqual(res(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
    if (p <= 9) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 9`);
    if (p < 10) await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.equal(caja.querySelector("[data-paso-de]").style.visibility, "hidden");
  assert.equal(E.estadoPasoT6A2(10).cierre, true, "el 10 es ya el cierre");
  desmontar();
});

test("★★★ la escena: los rótulos literales (paso 4, «por $312.500»), la misma cuenta de Clientes en los dos días, sin provisión y sin coral", async () => {
  const { caja, desmontar } = await montar(h(DosDias));
  for (let p = 1; p <= 9; p++) await tocar(caja.querySelector("[data-siguiente]"));
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
  assert.doesNotMatch(caja.querySelector("[data-escena]").textContent, /Provisión para cuentas incobrables/, "sin provisión dibujada");
  assert.ok(!/E76F51|231,\s*111,\s*81/i.test(html), "sin coral");
  /* Todo rótulo de la escena es fragmento de un paso. */
  const pasos = D.PASOS_T6_A2.map((p) => p.texto.toLowerCase()).join(" ");
  for (const [k, r] of Object.entries(D.ESCENA_T6_A2)) {
    if (["debita", "acredita"].includes(k)) continue;
    assert.ok(pasos.includes(r.toLowerCase()), `rótulo que no es fragmento: «${r}»`);
  }
  desmontar();
});

test("★★★ las fechas nunca se atenúan; sin el paso 10 (lote C1-6), la del 31 de diciembre ya no se resalta y guarda su borde de 2 px transparente en todos los pasos", async () => {
  for (let p = 1; p <= 10; p++) {
    const e = E.estadoPasoT6A2(p).elementos;
    for (const f of ["fecha25", "fecha31"]) assert.equal(e[f].atenuado, false, `paso ${p}: ${f} atenuada`);
  }
  const { caja, desmontar } = await montar(h(DosDias));
  const f31 = () => caja.querySelector('[data-elemento="fecha31"]');
  for (let p = 1; p <= 10; p++) {
    assert.equal(f31().dataset.resaltado, "no", `paso ${p}`);
    assert.equal(f31().style.borderWidth, "2px", "el mismo grosor: no se mueve");
    assert.equal(f31().style.borderColor, "transparent");
    if (p < 10) await tocar(caja.querySelector("[data-siguiente]"));
  }
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
  const foto = () => [...caja.querySelectorAll("[data-elemento]")].map((n) => `${n.dataset.elemento}:${n.dataset.resaltado ?? ""}:${n.style.visibility}:${enSilueta(n)}`).join("|");
  const fotos = {};
  for (let p = 1; p <= 10; p++) { fotos[p] = foto(); if (p < 10) await tocar(caja.querySelector("[data-siguiente]")); }
  for (let p = 9; p >= 1; p--) { await tocar(caja.querySelector("[data-anterior]")); assert.equal(foto(), fotos[p], `paso ${p}`); }
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra (los de la v1b de Mai)", () => {
  const ms = Array.from({ length: 10 }, (_, k) => E.duracionPasoT6A2(k + 1));
  /* El 10 es ya el cierre corto del lote C1-6: 12 palabras. */
  assert.deepEqual(ms, [9300, 5250, 8850, 8850, 10200, 5250, 9750, 7050, 9300, 8400]);
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
