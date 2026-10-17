import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 — «Los tres momentos de una inversión» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t5-aprender2.md); donde la guía v1 y Futaba dicen
 *     distinto, manda Futaba; cada rótulo de la escena es fragmento literal
 *     de un paso o de la capa 3; ningún componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 21 pasos y del cierre
 *     (la tabla de Futaba); los cinco hechos, uno abierto a la vez (tramos de
 *     la v2), con su resultado al plegarse; cada pieza desde su paso; cada
 *     asiento con sus dos lados en cápsula; las cuentas sin partir; la
 *     reserva de alto; las duraciones de la v2b
 *   · la capa 3: las dos ventas iguales, con sus cifras; el final, con las dos
 *   · la capa 4: UnaFrase con una sola correcta («lo que costaron los 260
 *     títulos», C1-3 del lote C2 · C1 · C7) y sus devoluciones
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

const D = await import("../../data/contabilidadT5Pieza2.js");
const E = await import("../t5Pieza2.js");
const { default: TresMomentos } = await import("../../components/mecanicas/libros/tema5/TresMomentos.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: DosVentas } = await import("../../components/mecanicas/libros/tema5/DosVentas.jsx");
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema5View.jsx");
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
    if (typeof v === "string") { if (!["id", "correcta", "resaltados"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t5-aprender2.md", import.meta.url), "utf8");
/* La sección de Futaba del paquete: la versión que manda. */
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Mai"));
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));
/* Un paso adelante; la parada entre el 10 y el 11 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T5_A2.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
/*
 * Los pasos juntados (hoja 7 de Mai): 14 pasos que muestran los estados de los 21 de antes. `J.viejo(n)` es el
 * paso de antes cuyo estado muestra el paso n; `nuevoDe(p)`, el paso nuevo que contiene el paso p de antes.
 */
const J = E.T5_A2_JUNTO;
const nuevoDe = (p) => (p > 21 ? J.CIERRE : D.FUSION_T5_A2.grupos.findIndex((g) => g.includes(p)) + 1);
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t5-aprender2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 80, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba: término 2, capa 3 («costaron»), pregunta y correcta de la capa 4, y los 21 pasos con su etiqueta", () => {
  const n = D.PIEZA_TRES_MOMENTOS.nombres;
  assert.deepEqual(n.map((x) => x.termino), ["Tres momentos", "La compra", "El rendimiento", "La venta"]);
  /* B2 (un término por pantalla, 15-oct): «El rendimiento» cambia; los otros tres son «el de hoy». */
  const B2 = FUENTE.slice(FUENTE.indexOf("## B2 ·"));
  assert.ok(B2.includes(`**El rendimiento** — ${n[2].definicion}`), "«El rendimiento», literal de B2");
  for (const x of [n[0], n[1], n[3]]) {
    assert.ok(B2.includes(`**${x.termino}** — El de hoy.`), `«${x.termino}»: B2 dice «el de hoy»`);
    assert.ok(FUTABA.includes(`\t${x.termino}\t${x.definicion}\t`), `término «${x.termino}» como en Futaba`);
  }
  assert.ok(n[2].definicion.includes("por dividendos si viene de acciones, y por interés si viene de otro título"));
  assert.ok(n[1].definicion.endsWith("El ejemplo del libro no trae gastos de compra, y la cuenta se llama Inversiones – títulos."));
  assert.match(n[0].delLibro, /^«.*» \(p\. 193\)$/);
  assert.deepEqual(n.slice(1).map((x) => x.delLibro), [undefined, undefined, undefined], "solo el término 1 lleva cita");
  assert.ok(D.VENTAS_T5_A2.every((v) => v.revela.includes("de lo que costaron:")));
  /* C1-3 del lote C2 · C1 · C7: la capa 4 es un caso nuevo, de escenario simulado. */
  assert.equal(D.PREGUNTA_FINAL_T5_A2, "Una empresa vende 260 títulos. Cada uno le costó $850. Le pagan $273.000. ¿Por cuánto se acredita la inversión?");
  /* La tabla de la capa 2 de Futaba, por número de paso (los pasos 7 y 17 dicen lo mismo con distinta página). */
  const filas = new Map();
  for (const l of FUTABA.split("\n")) {
    const c = l.split("\t");
    if (c.length >= 4 && /^(\d+|Cierre)$/.test(c[0]) && /^(Libro|Basado)/.test(c[2])) filas.set(c[0], { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 22, "la guarda: 21 pasos y el cierre");
  const todos = [...D.PASOS_T5_A2, D.CIERRE_T5_A2];
  assert.equal(todos.length, 22);
  todos.forEach((p, k) => assert.deepEqual(p, filas.get(k < 21 ? String(k + 1) : "Cierre"), `paso ${k + 1}`));
});

/* Los rótulos que pinta la escena (sin las cápsulas). */
const rotulos = () => {
  const { hechos, debita, acredita, ...resto } = D.ESCENA_T5_A2;
  return [...hechos.flatMap((x) => [x.fecha, x.tipo, x.plegado]), ...Object.values(resto).flat()];
};
/*
 * El resultado plegado de las dos ventas («Ganancia de $225.000», «Pérdida de
 * $31.250») salió de lo que revelaba la capa 3 de antes. El lote C1-2 cambió
 * esa capa a un escenario simulado; el rótulo de la escena no cambió, así
 * que sigue anclado al texto aprobado de entonces, guardado en el paquete.
 */
const CAPA_3_ANTES = [
  "Recibió más de lo que costaron: ganancia de $225.000. Inversiones – títulos se acredita por el costo, no por lo recibido.",
  "Recibió menos de lo que costaron: pérdida de $31.250. Inversiones – títulos también se acredita por el costo.",
];
const esFragmento = (r) => {
  const fuentes = [...D.PASOS_T5_A2.map((p) => p.texto), ...D.VENTAS_T5_A2.flatMap((v) => [v.nombre, v.revela]), ...CAPA_3_ANTES].map((t) => t.toLowerCase());
  return fuentes.some((t) => t.includes(r.toLowerCase()));
};

test("★★★ cada rótulo de la escena es fragmento literal de un paso o de la capa 3 (y un rótulo inventado no lo es)", () => {
  assert.equal(esFragmento("Vende mercancía a crédito"), false, "control: un rótulo inventado no pasa");
  for (const t of CAPA_3_ANTES) assert.ok(FUTABA.includes(t), "la capa 3 de antes sigue guardada en el paquete");
  const r = rotulos();
  assert.ok(r.length >= 35, `solo ${r.length} rótulos`);
  assert.deepEqual(r.filter((x) => !esFragmento(x)), []);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["tema5/TresMomentos.jsx", "tema5/DosVentas.jsx", "tema5/escenasTema5.jsx", "tema6/MaquinaPegada.jsx", "tema6/CajasQueRevelan.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

/*
 * N2 de la Célula C («Cómo se cuidan las inversiones») iba antes que la pieza
 * y salió de la lista con la fusión de la entrega 5 de Near (lo suyo va dentro
 * de N3): la pieza vuelve a ser la segunda de Aprender. N6 entra después (posición 9), sin escenas.
 */
test("★★ la pieza va segunda en el tema, sin N2: APRENDER, la vista y sus tres capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "activos-financieros");
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id), ["b5-t5-a1-del-efectivo-de-sobra", D.PIEZA_TRES_MOMENTOS.id, "t5-a2-lo-que-el-ejemplo-no-trae"]);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id), ["b5-t5-a1-del-efectivo-de-sobra", D.PIEZA_TRES_MOMENTOS.id, "t5-a2-lo-que-el-ejemplo-no-trae"]);
  assert.deepEqual(Object.keys(ESCENAS_TEMA5), ["b5-t5-a1-del-efectivo-de-sobra", D.PIEZA_TRES_MOMENTOS.id]);
  const { Capa2, Exploracion } = ESCENAS_TEMA5[D.PIEZA_TRES_MOMENTOS.id];
  assert.equal(Capa2, TresMomentos);
  assert.equal(Exploracion, DosVentas);
});

/* ═══════════ CAPA 2 ═══════════ */

/* La columna «Resalta» de Futaba, paso por paso. */
const RESALTADOS = {
  1: ["efectivo"], 2: ["titulos"], 3: ["bancos", "inversiones1"], 4: ["tasa"], 5: ["primerInteres"], 6: ["cuenta1"],
  7: ["caja1", "ingresos1"], 8: ["vendidos"], 9: ["precio1"], 10: ["caja2"], 11: ["sinInteres"], 12: ["costo1"],
  13: ["inversiones2"], 14: ["ganancia"], 15: ["quedan"], 16: ["cuenta2"], 17: ["caja3", "ingresos2"], 18: ["precio2"],
  19: ["costo2", "recibe2"], 20: ["caja4", "inversiones3"], 21: ["perdida"], 22: [],
};

/* Lote 11: la escena de la capa 2 son los títulos de Santa Pacha; sus pruebas, en b5-t5-titulos.test.mjs. */

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de la v2b y sus 182,1 s", () => {
  const ms = Array.from({ length: 21 }, (_, k) => E.duracionPasoT5A2(k + 1));
  assert.deepEqual(ms, [9750, 6150, 8850, 9300, 6600, 6600, 8400, 7050, 7050, 6600, 7950, 5250, 6600, 14250, 8850, 6600, 8400, 6600, 6150, 10650, 12000]);
  /* Los 182,1 s de Mai cuentan también el cierre (21 palabras: 12 450 ms). */
  assert.equal(E.duracionPasoT5A2(22), 12450);
  assert.equal(ms.reduce((a, b) => a + b, 0) + E.duracionPasoT5A2(22), 182100);
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: las dos ventas se ven iguales, con lo que costó y a cuánto se vende (C1-2); cada una revela lo suyo con su pie; el final, con las dos decididas", async () => {
  const { caja, desmontar } = await montar(h(DosVentas));
  assert.equal(caja.querySelector("p").textContent, D.CONSIGNA_CAPA_3_T5_A2);
  const cajas = [...caja.querySelectorAll("[data-hecho]")];
  assert.deepEqual(cajas.map((c) => c.querySelector("button span span").textContent), ["Venta A", "Venta B"]);
  assert.deepEqual(D.VENTAS_T5_A2.map((v) => v.cifras), [["Costó $650 cada uno", "Se vende a $690"], ["Costó $1.150 cada uno", "Se vende a $1.060"]]);
  assert.deepEqual(D.VENTAS_T5_A2.map((v) => v.pie), ["Escenario simulado", "Escenario simulado"]);
  assert.deepEqual(cajas.map((c) => [...c.querySelectorAll("[data-cifras] > span")].map((s) => s.textContent)), D.VENTAS_T5_A2.map((v) => v.cifras));
  assert.equal(cajas[0].getAttribute("style"), cajas[1].getAttribute("style"), "las dos cajas iguales");
  assert.equal(cajas[0].querySelector("button").getAttribute("style"), cajas[1].querySelector("button").getAttribute("style"));
  const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");
  for (const [k, v] of D.VENTAS_T5_A2.entries()) {
    /* Solo el chevrón: desde el lote 6a, la opción correcta lleva además su ✓ de E4 (otro SVG). */
    assert.equal(cajas[k].querySelectorAll("svg[data-chevron]").length, 1, "cerrada, con su chevrón");
    await decidir(tocar, caja.querySelector(`[data-hecho="${v.id}"]`), v.correcta);
    assert.equal(cajas[k].querySelectorAll("svg[data-chevron]").length, 1, "decidida, con su chevrón girado (hoja 6)");
    assert.equal(cajas[k].querySelectorAll('svg[data-icono="visto"]').length, 1, "decidida, la correcta con su ✓ (E4)");
    assert.equal(lectura(caja.querySelector(`[data-revela="${v.id}"]`)), v.revela);
    assert.equal(caja.querySelector(`[data-revela="${v.id}"] [data-pie]`).textContent, v.pie);
    assert.equal(lectura(caja.querySelector("[data-final]")), k === 0 ? "" : D.FINAL_CAPA_3_T5_A2.texto);
  }
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, D.FINAL_CAPA_3_T5_A2.pie);
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta («lo que costaron los 260 títulos», C1-3) y la devolución de cada una; su pie debajo", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T5_A2.filter((o) => o.correcta).map((o) => o.texto), ["Por $221.000, lo que costaron los 260 títulos."]);
  const { Capa4 } = ESCENAS_TEMA5[D.PIEZA_TRES_MOMENTOS.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T5_A2));
  assert.equal([...caja.querySelectorAll("[data-pie]")].at(-1).textContent, "Escenario simulado");
  for (const o of D.OPCIONES_FINAL_T5_A2) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_TRES_MOMENTOS.id, /^b5-t5-a2-/);
  for (const o of D.OPCIONES_FINAL_T5_A2) assert.match(o.id, /^b5-t5-a2-/);
});

/* D12 (Sakuta, #222): lo que está en silueta no lo lee el lector ni se enfoca; lo que llega, ya no lleva esa marca. */
const MUDOS = '[style*="--b5-silueta"], [data-futuro], [data-silueta-futura]';
const callado = (n) => n.closest('[aria-hidden="true"]') !== null;
const marcaPropia = (n) => n.getAttribute("aria-hidden") === "true" && n.hasAttribute("inert");

