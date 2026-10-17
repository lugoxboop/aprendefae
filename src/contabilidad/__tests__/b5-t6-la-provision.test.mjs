import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 — «La provisión, de un año al siguiente» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t6-aprender3.md); cada rótulo de la escena y de la T es
 *     fragmento literal; ningún componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 19 pasos y del cierre
 *     (la tabla de Futaba); tres momentos, y el pasado conserva su asiento
 *     (la pieza vuelve atrás en los pasos 11 y 12); la fecha del paso 14 se
 *     resalta sin moverse; el bloque del estado de situación con el neto; la
 *     anotación de Clientes con «A nombre de Pablo Moncayo» y «$180.000»
 *     (v1b); la reserva de alto; las duraciones
 *   · la capa 3: la T se llena en orden; el saldo en contra bajo DEBE, en
 *     recuadro; el normal bajo HABER, bajo un filete; el final, con los tres
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

const D = await import("../../data/contabilidadT6Pieza3.js");
const E = await import("../t6Pieza3.js");
const { default: LaProvision } = await import("../../components/mecanicas/libros/tema6/LaProvision.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: TanqueMomentos } = await import("../../components/mecanicas/libros/tema6/TanqueMomentos.jsx");
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
    if (typeof v === "string") { if (!["id", "lado", "correcta", "resaltados"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender3.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Mai"));
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));
/* Un paso adelante; la parada entre el 9 y el 10 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T6_A3.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
/*
 * Los pasos juntados (hoja 7 de Mai): 15 pasos que muestran los estados de los 19 de antes. `viejo(n)` es el paso
 * de antes cuyo estado muestra el paso n; `nuevoDe(p)`, el paso nuevo que contiene el paso p de antes.
 */
const J = E.T6_A3_JUNTO;
const nuevoDe = (p) => (p > 19 ? J.CIERRE : D.FUSION_T6_A3.grupos.findIndex((g) => g.includes(p)) + 1);
/* Hasta el paso nuevo que contiene el paso `p` de antes. */
const irA = async (caja, p) => { for (let n = 1; n < nuevoDe(p); n++) await siguiente(caja); };
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};
const PASOS = 15;
const CIERRE = 16;

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender3.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 80, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba, y encima B2: los seis términos (nota en el 1 y en el 3, cita solo en el 5) y los 19 pasos y el cierre con su etiqueta", () => {
  const n = D.PIEZA_LA_PROVISION.nombres;
  assert.deepEqual(n.map((x) => x.termino), ["Provisión para cuentas incobrables", "Al revés de Clientes", "Valor neto", "El gasto", "Castigar contra la provisión", "Subestimada y sobrestimada"]);
  /* B2 (un término por pantalla, 15-oct), guardada al final del paquete: los nuevos, literales; «el de hoy», como en Futaba. */
  const B2 = FUENTE.slice(FUENTE.indexOf("## B2 ·"));
  for (const k of [0, 1, 4]) assert.ok(B2.includes(`**${n[k].termino}** — ${k === 4 ? "Def.: " : ""}${n[k].definicion}`), `término «${n[k].termino}» como en B2`);
  assert.ok(B2.includes(`· Cita: ${n[4].delLibro}`));
  for (const k of [2, 3, 5]) {
    assert.ok(B2.includes(`**${n[k].termino}** — El de hoy`), `«${n[k].termino}»: B2 dice «el de hoy»`);
    assert.ok(FUTABA.includes(`\t${n[k].termino}\t${n[k].definicion}\t`), `término «${n[k].termino}» como en Futaba`);
  }
  assert.equal(n[2].rotuloDelLibro, "Nota");
  assert.match(n[4].delLibro, /^«.*» \(p\. 202\)$/);
  assert.equal(n[0].delLibro, "El libro la llama «Provisión para deudas incobrables».", "Shoko, 16-oct: el puente con el nombre del libro");
  assert.equal(n[0].rotuloDelLibro, "Nota");
  assert.deepEqual([1, 3, 5].map((k) => n[k].delLibro), [undefined, undefined, undefined]);
  const filas = new Map();
  for (const l of FUTABA.split("\n")) {
    const c = l.split("\t");
    if (c.length >= 4 && /^(\d+|Cierre)$/.test(c[0]) && /^(Libro|Basado)/.test(c[2])) filas.set(c[0], { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 20, "la guarda: 19 pasos y el cierre");
  [...D.PASOS_T6_A3, D.CIERRE_T6_A3].forEach((p, k) => assert.deepEqual(p, filas.get(k < 19 ? String(k + 1) : "Cierre"), `paso ${k + 1}`));
});

/* Los rótulos que pinta la escena y la T (sin las cápsulas ni las palabras publicadas DEBE / HABER). */
const rotulos = () => {
  const { momentos, debita, acredita, ...resto } = D.ESCENA_T6_A3;
  const t = D.MOMENTOS_T6_A3.flatMap((m) => [m.monto, m.saldo.texto]);
  return [...momentos.flatMap((m) => [m.fecha, m.tipo]), ...Object.values(resto), ...t, D.CUENTA_T_T6_A3.nombre];
};
const esFragmento = (r) => {
  const fuentes = [...D.PASOS_T6_A3, D.CIERRE_T6_A3].map((p) => p.texto)
    .concat(D.MOMENTOS_T6_A3.flatMap((m) => [m.nombre, m.revela])).map((t) => t.toLowerCase());
  return fuentes.some((t) => t.includes(r.toLowerCase()));
};

test("★★★ cada rótulo de la escena y de la T es fragmento literal de un paso, del cierre o de la capa 3 (y uno inventado no lo es)", () => {
  assert.equal(esFragmento("La provisión se agotó"), false, "control: un rótulo inventado no pasa");
  const r = rotulos();
  assert.ok(r.length >= 30, `solo ${r.length} rótulos`);
  assert.deepEqual(r.filter((x) => !esFragmento(x)), []);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["LaProvision.jsx", "TanqueProvision.jsx", "TanqueMomentos.jsx", "Momentos.jsx", "MaquinaPegada.jsx", "CajasQueRevelan.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ la pieza va tercera en el tema: APRENDER, la vista y sus tres capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  const ids = ["b5-t6-a1-lo-que-otros-le-deben", "b5-t6-a2-cuando-un-cliente-no-va-a-pagar", D.PIEZA_LA_PROVISION.id];
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id).slice(0, 3), ids);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id).slice(0, 3), ids);
  assert.deepEqual(Object.keys(ESCENAS_TEMA6).slice(0, 3), ids);
  const { Capa2, Exploracion } = ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id];
  assert.equal(Capa2, LaProvision);
  assert.equal(Exploracion, TanqueMomentos);
});

/* ═══════════ CAPA 2 ═══════════ */

/* La columna «Resalta» de Futaba. */
const RESALTADOS = {
  1: ["deben"], 2: ["parte"], 3: ["gasto1"], 4: ["provision1"], 5: ["utilidad"], 6: ["filaClientes", "filaProvision"], 7: ["filaNeto"],
  8: ["perdida"], 9: ["provision2"], 10: ["clientes2"], 11: ["gasto1"], 12: ["provision1", "provision2"], 13: ["subestimada"],
  14: ["fecha2"], 15: ["pide"], 16: ["suman"], 17: ["gasto3"], 18: ["provision3"], 19: ["queda"], 20: [],
};

/* Lote 7: la escena de la capa 2 es el tanque; sus pruebas, en b5-t6-tanque.test.mjs. */

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de Mai §4.4 y sus 149,7 s", () => {
  const ms = Array.from({ length: 19 }, (_, k) => E.duracionPasoT6A3(k + 1));
  assert.deepEqual(ms, [10650, 7500, 7050, 7950, 6150, 10200, 7050, 9750, 6600, 8850, 7950, 7500, 5700, 9300, 6150, 7500, 7050, 7950, 8850]);
  assert.equal(ms.reduce((a, b) => a + b, 0), 149700);
  /* Hoja 7: con los pasos juntados, la fórmula no cambia; cada fusión ahorra los 3 000 ms de un paso (Mai, con sus seis fusiones: de 159,9 s a 141,9 s con el cierre; quedan cuatro: 147,9 s). */
  const juntos = Array.from({ length: PASOS }, (_, k) => J.duracion(k + 1));
  assert.deepEqual(juntos, D.FUSION_T6_A3.grupos.map((g) => g.reduce((t, v) => t + ms[v - 1], 0) - 3000 * (g.length - 1)));
  assert.equal(juntos.reduce((a, b) => a + b, 0) + J.duracion(CIERRE), 147900);
});

/* ═══════════ CAPA 3 ═══════════ */

/* Lote 7: la capa 3 es el tanque; sus pruebas, en b5-t6-tanque-capa3.test.mjs. */


/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y la devolución de cada una (C1-9 del lote C2 · C1 · C7); su pie debajo", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T6_A3.filter((o) => o.correcta).map((o) => o.texto), ["Lo que sobró se resta de lo que pide el análisis."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6_A3));
  assert.equal([...caja.querySelectorAll("[data-pie]")].at(-1).textContent, "Basado en el libro, p. 203");
  for (const o of D.OPCIONES_FINAL_T6_A3) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_LA_PROVISION.id, /^b5-t6-a3-/);
  for (const o of D.OPCIONES_FINAL_T6_A3) assert.match(o.id, /^b5-t6-a3-/);
});


