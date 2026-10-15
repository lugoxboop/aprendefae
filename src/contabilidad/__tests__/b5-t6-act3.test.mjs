import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 3 — «Cuando la deuda castigada vuelve» (Célula B, b5-t6-a3).
 *
 * Vigila LO QUE SE VE, contra el paquete guardado
 * (orquestador/conocimiento/paquetes/b5-t6-act3.md):
 *   · todo texto literal; las líneas corregidas de Futaba (D con «no hay
 *     ningún ingreso», B general de la parte 4, Ingresos por ventas)
 *   · encabezado, contador «Asiento N de 5», enunciados (cada uno empieza
 *     por su caso), rótulos, instrucciones y el estante de cinco cuentas
 *   · la prioridad D > C > A > B; las B específicas (C14 en las partes 3 y
 *     5, $180.000 en la 4) y la B general de cada parte
 *   · el libro diario AGRUPADO por caso: un solo «Caso a» para dos asientos,
 *     sin filete entre ellos; la cuenta sigue contando asientos
 *   · el resumen y el puntaje; el ejemplo de «Así se juega» (el castigo)
 *   · ninguna cifra fuera de las pp. 204-206
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
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

const { default: DeudaQueVuelve, CONFIG_T6_ACT3 } = await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const M = await import("../cierreConMesa.js");
const D = await import("../../data/contabilidadT6Act3.js");
const { FAE } = await import("../../theme.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");

const PARTES = D.PARTES_T6_ACT3;
const { GASTO, PROVISION, CLIENTES, CAJA, INGRESOS } = D;

const montar = async ({ items = undefined, onCompletar = () => {}, modoDemo = false } = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(DeudaQueVuelve, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items, modoDemo }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const escribir = async (input, texto) => {
  assert.ok(input, "no hay campo");
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { poner.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
/* Arma el asiento dado ([{ cuenta, lado, valor }]) y confirma. */
const armar = async (caja, puestas, confirmar = true) => {
  for (const p of puestas) {
    await tocar(caja.querySelector(`[data-sacar="${p.cuenta}:${p.lado}"]`));
    await escribir(caja.querySelector(`[data-campo-cifra="${p.cuenta}"]`), String(p.valor));
  }
  if (confirmar) await tocar(caja.querySelector("[data-confirmar-parte]"));
};
const textoRetro = (caja) => caja.querySelector("[data-texto-retro]")?.textContent ?? null;
const avanzar = async (caja) => tocar(caja.querySelector("[data-boton-avanzar] button"));
const mesaVista = (caja) => [...caja.querySelectorAll("[data-en-mesa]")].map((n) => ({
  cuenta: n.dataset.enMesa, lado: n.closest("[data-columna]").dataset.columna, texto: n.querySelector("input").value,
}));
const sinTexto = (n) => n.textContent.replace(/\s+/g, " ").trim();

const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act3.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Futaba"));
const CORREGIDAS = FUENTE.slice(FUENTE.indexOf("## (2) Futaba"), FUENTE.indexOf("## (3) Mai"));
const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "lado", "dificultad", "clave"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) if (!["REGLAS_T6_ACT3", "DIARIO_T6_ACT3"].includes(k)) recoger(v, k);
  return out;
};
const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const hb = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-act3.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 40, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ mandan las líneas corregidas: las D con «no hay ningún ingreso», la B general de la parte 4 y el estante con Ingresos por ventas al final", () => {
  for (const p of PARTES) {
    assert.ok(CORREGIDAS.includes(`\t${p.errores.D}\t`), `${p.id}: la D corregida`);
    assert.match(p.errores.D, /no hay ningún ingreso\.$/);
    for (const k of ["C", "A"]) assert.ok(FUTABA.includes(`\t${p.errores[k]}\t`), `${p.id} ${k}`);
    assert.ok(FUTABA.includes(`\t${p.hecho} (`), `${p.id}: el enunciado`);
    assert.ok(FUTABA.includes(`\t${p.instruccion}\t`), `${p.id}: la instrucción`);
    assert.ok(p.hecho.startsWith(`${p.fecha}.`), `${p.id}: empieza por su caso`);
  }
  assert.equal(PARTES[3].errores.B, "Revisa el valor. A Caja entra lo que abonó Pablo Moncayo.");
  assert.ok(CORREGIDAS.includes(`\t${PARTES[3].errores.B}\t`));
  assert.deepEqual(D.ESTANTE_T6_ACT3, [CAJA, CLIENTES, PROVISION, GASTO, INGRESOS]);
  assert.ok(!PARTES.some((p) => p.asiento.some((m) => m.cuenta === INGRESOS)), "Ingresos por ventas: solo distractor");
  assert.deepEqual([D.T6_ACT3.dificultad, D.T6_ACT3.fpBase], ["dificil", 50], "decisión de Sakuta");
});

test("★★★ ninguna cifra fuera de las pp. 204-206, y una inventada no pasa", () => {
  const LIBRO = new Set(["180.000", "100.000"]);
  const cifras = (t) => [...t.matchAll(/\d[\d.]*\d|\d/g)].map((m) => m[0]);
  assert.deepEqual(cifras("Puso $80.000").filter((c) => !LIBRO.has(c)), ["80.000"], "control: los $80.000 que el libro no imprime");
  assert.deepEqual(textosDeDatos().flatMap(cifras).filter((c) => !LIBRO.has(c) && !["1", "2", "3", "4", "5"].includes(c)), [], "solo las cifras del libro y los números de «Asiento N»");
  const valores = [...PARTES, D.CASTIGO_T6_ACT3].flatMap((p) => p.asiento.map((m) => m.valor));
  assert.deepEqual([...new Set(valores)].sort(), [100000, 180000]);
});

test("★★★ ningún componente escribe texto de la actividad", () => {
  const fuentes = ["tema6/DeudaQueVuelve.jsx", "b5/CierreConMesa.jsx", "b5/LibroDiario.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ encabezado, contador «Asiento 1 de 5», texto alternativo y el estante de cinco cuentas, sin montos", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.T6_ACT3.objetivo);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.T6_ACT3.consigna);
  assert.ok(caja.textContent.includes("Asiento 1 de 5"));
  assert.ok(caja.textContent.includes(D.ALT_T6_ACT3));
  assert.deepEqual([...caja.querySelectorAll("[data-nombre-estante]")].map((n) => n.textContent), [CAJA, CLIENTES, PROVISION, GASTO, INGRESOS]);
  assert.ok(![...caja.querySelectorAll("[data-en-estante]")].some((n) => /\$|\d/.test(n.textContent)));
  desmontar();
});

test("★★★ cada parte en su pantalla; al acertar, solo la marca; el resumen «Bien a la primera: 3 de 5» y el puntaje", async () => {
  let pct = null;
  const { caja, desmontar } = await montar({ onCompletar: (p) => { pct = p; } });
  for (const [k, p] of PARTES.entries()) {
    assert.equal(caja.querySelector("[data-hecho]").textContent, p.hecho);
    assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, p.rotulo);
    assert.equal(caja.querySelector("[data-instruccion]").textContent, p.instruccion);
    await armar(caja, k % 2 === 0 ? p.asiento : [d(CAJA, 1), hb(CLIENTES, 1)]);
    if (k % 2 === 0) {
      assert.equal(textoRetro(caja), null);
      assert.ok(caja.querySelector("[data-visto-parte]"));
    }
    await avanzar(caja);
  }
  assert.equal(caja.querySelector("[data-resumen-cierre]").textContent, "Bien a la primera: 3 de 5");
  assert.equal(pct, 60);
  desmontar();
});

const CASOS = [
  [0, "D", [d(CLIENTES, 180000), hb(PROVISION, 180000), hb(INGRESOS, 0)], "un ingreso (C13)"],
  [0, "D", [d(CLIENTES, 180000), hb(PROVISION, 180000), hb(GASTO, 0)], "la recuperación devuelve el gasto"],
  [0, "C", [hb(CLIENTES, 180000), d(PROVISION, 180000)], "al revés"],
  [0, "A", [d(CLIENTES, 180000)], "falta la provisión"],
  [0, "B", [d(CLIENTES, 100000), hb(PROVISION, 100000)], "otro valor (la parte 1 no tiene B específica)"],
  [1, "D", [d(CAJA, 180000), hb(CLIENTES, 180000), hb(INGRESOS, 0)], "un ingreso (C13)"],
  [1, "C", [hb(CAJA, 180000), d(CLIENTES, 180000)], "al revés"],
  [1, "A", [d(CAJA, 180000)], "falta Clientes"],
  [1, "B", [d(CAJA, 100000), hb(CLIENTES, 100000)], "otro valor"],
  [2, "C14", [d(CLIENTES, 100000), hb(PROVISION, 100000)], "solo el abono"],
  [2, "B", [d(CLIENTES, 80000), hb(PROVISION, 80000)], "otra cifra"],
  [3, "B-toda", [d(CAJA, 180000), hb(CLIENTES, 180000)], "toda la deuda a Caja"],
  [3, "B", [d(CAJA, 80000), hb(CLIENTES, 80000)], "los $80.000: la B general corregida"],
  [4, "C14", [d(CLIENTES, 180000), hb(PROVISION, 180000)], "toda la deuda"],
  [4, "B", [d(CLIENTES, 80000), hb(PROVISION, 80000)], "otra cifra"],
  [4, "C", [hb(CLIENTES, 100000)], "al revés y falta la provisión: C manda sobre A"],
];

test("★★★ la prioridad D > C > A > B con su texto en el panel, las B específicas (C14, $180.000 en la parte 4) y el asiento correcto revelado", async () => {
  for (const [k, tipo, puestas, nota] of CASOS) {
    const p = PARTES[k];
    const { caja, desmontar } = await montar({ items: [p] });
    await armar(caja, puestas);
    assert.equal(caja.querySelector("[data-panel]").dataset.error, tipo, `${p.id}: ${nota}`);
    const esp = p.errores.especificas.find((e) => e.clave === tipo);
    assert.equal(textoRetro(caja), esp ? esp.texto : tipo === "D" ? M.textoD(p, puestas) : p.errores[tipo], `${p.id} ${tipo}: el texto`);
    assert.deepEqual(mesaVista(caja).map((m) => `${m.lado}:${m.cuenta}:${m.texto}`).sort(),
      p.asiento.map((m) => `${m.lado}:${m.cuenta}:${m.valor.toLocaleString("es-CO").replace(/,/g, ".")}`).sort(), `${p.id}: el asiento revelado`);
    desmontar();
  }
});

test("★★★ el libro diario, AGRUPADO por caso: un solo «Caso a» para sus dos asientos y sin filete entre ellos; la cuenta sigue contando asientos", async () => {
  const { caja, desmontar } = await montar();
  await tocar(caja.querySelector("[data-diario-alternar]"));
  const fechas = () => [...caja.querySelectorAll("[data-fecha-diario]")].map((n) => n.textContent);
  assert.deepEqual(fechas(), ["Marzo del año siguiente"]);
  for (const p of PARTES) { await armar(caja, p.asiento); if (p !== PARTES[4]) await avanzar(caja); }
  assert.deepEqual(fechas(), ["Marzo del año siguiente", "Caso a", "Caso b", "Caso c"]);
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "6 asientos");
  const filas = [...caja.querySelectorAll("[data-asiento-diario]")];
  assert.equal(filas.length, 6);
  const filete = (n) => n.style.borderBottom.startsWith("1px solid");
  assert.deepEqual(filas.map(filete), [true, false, true, false, true, false], "sin filete dentro del caso; con filete entre casos");
  assert.deepEqual(filas.map((n) => n.style.padding), ["8px 0px", "8px 0px 6px", "2px 0px 8px", "8px 0px 6px", "2px 0px 8px", "8px 0px"], "8 px de aire dentro del caso (6 + 2)");
  desmontar();
});

test("★★★ «Así se juega»: el castigo de marzo, solo la mesa, y termina con sus cuatro líneas (la última, los tres finales)", async () => {
  const { caja, desmontar } = await montar({ items: [D.CASTIGO_T6_ACT3], modoDemo: true });
  assert.equal(caja.querySelector("[data-libro-diario]"), null);
  assert.equal(caja.querySelector("[data-hecho]").textContent, D.CASTIGO_T6_ACT3.hecho);
  await armar(caja, D.CASTIGO_T6_ACT3.asiento);
  assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent), D.CASTIGO_T6_ACT3.resolucion);
  desmontar();
});

test("★★ identificadores con b5-t6-a3, y el diario de b5-t6-a2 no se agrupa (control)", async () => {
  assert.equal(D.T6_ACT3.id, "b5-t6-a3");
  assert.deepEqual([D.CASTIGO_T6_ACT3, ...PARTES].map((p) => p.id), ["b5-t6-a3-tutorial", ...[1, 2, 3, 4, 5].map((n) => `b5-t6-a3-p${n}`)]);
  assert.equal(CONFIG_T6_ACT3.evaluar, M.evaluarParte);
  const { LibroDiario } = await import("../../components/mecanicas/libros/b5/LibroDiario.jsx");
  const asientos = [{ id: "x", fecha: "Caso a", asiento: [] }, { id: "y", fecha: "Caso a", asiento: [] }];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(LibroDiario, { asientos, abierto: true, onAlternar() {}, textos: D.DIARIO_T6_ACT3 })); });
  assert.equal(caja.querySelectorAll("[data-fecha-diario]").length, 2, "sin agrupar, cada asiento lleva su etiqueta");
  act(() => raiz.unmount());
  caja.remove();
});
