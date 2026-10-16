import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 2 — «La provisión de El Torito» (Célula B, b5-t6-a2).
 *
 * Vigila LO QUE SE VE, contra el paquete guardado
 * (orquestador/conocimiento/paquetes/b5-t6-act2.md):
 *   · todo texto literal; la D de la parte 1 es la nueva de Futaba
 *   · encabezado, contador «Asiento N de 2», enunciados, rótulos,
 *     instrucciones y el estante (sin montos, con Caja de distractor)
 *   · la prioridad D > C > A > B, parte por parte, con su texto; las B
 *     específicas C15 ($148.800) y C12 ($153.400) y la B «otro valor»
 *   · el asiento revelado tras el error; el acierto sin texto, con la marca
 *   · el libro diario: cerrado, empieza con la provisión de 2007 y crece con
 *     el asiento correcto de cada parte
 *   · el resumen y el puntaje; el ejemplo de «Así se juega» con su explicación
 *   · ninguna cifra fuera de las de El Torito (pp. 202-203)
 *   · la mesa generalizada (contabilidad/cierreConMesa.js) por sí sola
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { comprobarMesaE4 } = await import("./b5-mesa-e4.mjs");
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

const { default: ProvisionDeElTorito, CONFIG_T6_ACT2 } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const M = await import("../cierreConMesa.js");
const D = await import("../../data/contabilidadT6Act2.js");
const { FAE } = await import("../../theme.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");

const PARTES = D.PARTES_T6_ACT2;
const { GASTO, PROVISION, CLIENTES, CAJA } = D;

const montar = async ({ items = undefined, onCompletar = () => {}, modoDemo = false } = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(ProvisionDeElTorito, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items, modoDemo }));
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

const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act2.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Futaba"));
const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "lado", "dificultad", "clave"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) if (!["REGLAS_T6_ACT2", "DIARIO_T6_ACT2"].includes(k)) recoger(v, k);
  return out;
};
const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const hb = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-act2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 25, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ la D de la parte 1 es la nueva de Futaba (E), no la de la tabla; lo demás, de la tabla de Futaba", () => {
  const nueva = "Sobra una cuenta. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.";
  const vieja = "Sobra una cuenta. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. El gasto ya se anotó en diciembre, y aquí no entra plata.";
  assert.ok(FUTABA.includes(vieja), "guarda: la vieja está en la tabla pegada");
  assert.equal(PARTES[0].errores.D, nueva);
  for (const p of PARTES) {
    for (const k of ["C", "A", "B"]) assert.ok(FUTABA.includes(`\t${p.errores[k]}\t`), `${p.id} ${k}, de la tabla de Futaba`);
    for (const e of p.errores.especificas) assert.ok(FUTABA.includes(`\t${e.texto}\t`), `${p.id} ${e.clave}`);
    assert.ok(FUTABA.includes(`Enunciado: «${p.hecho}»`), `${p.id}: el enunciado`);
    assert.ok(FUTABA.includes(`Instrucción: «${p.instruccion}»`), `${p.id}: la instrucción`);
  }
  assert.equal(PARTES[1].errores.D, "Sobra una cuenta. Este hecho solo mueve el gasto y la provisión, como en diciembre de 2007.");
  assert.deepEqual([D.T6_ACT2.dificultad, D.T6_ACT2.fpBase], ["medio", 25], "decisión de Sakuta");
});

test("★★★ ninguna cifra fuera de las de El Torito (pp. 202-203), y una inventada no pasa", () => {
  const LIBRO = new Set(["148.800", "180.000", "153.400", "31.200", "184.600", "2007", "31"]);
  const cifras = (t) => [...t.matchAll(/\d[\d.]*\d|\d/g)].map((m) => m[0]);
  assert.deepEqual(cifras("Puso $999.000").filter((c) => !LIBRO.has(c)), ["999.000"], "control");
  const fuera = textosDeDatos().flatMap(cifras).filter((c) => !LIBRO.has(c) && !["1", "2"].includes(c));
  assert.deepEqual(fuera, []);
  const valores = [...PARTES, D.PROVISION_2007_T6_ACT2].flatMap((p) => p.asiento.map((m) => m.valor));
  assert.deepEqual([...new Set(valores)].sort(), [148800, 180000, 184600], "los asientos, con las cifras del libro");
});

test("★★★ ningún componente escribe texto de la actividad", () => {
  const fuentes = ["tema6/ProvisionDeElTorito.jsx", "b5/CierreConMesa.jsx", "b5/LibroDiario.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ encabezado, contador «Asiento 1 de 2», texto alternativo y el estante sin montos, en el orden de Futaba", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.T6_ACT2.objetivo);
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.T6_ACT2.consigna);
  assert.ok(caja.textContent.includes("Asiento 1 de 2"));
  assert.ok(caja.textContent.includes(D.ALT_T6_ACT2));
  assert.deepEqual([...caja.querySelectorAll("[data-nombre-estante]")].map((n) => n.textContent), [GASTO, PROVISION, CLIENTES, CAJA]);
  assert.ok(![...caja.querySelectorAll("[data-en-estante]")].some((n) => /\$|\d/.test(n.textContent)), "el estante va sin montos");
  desmontar();
});

test("★★★ cada parte en su pantalla: enunciado, rótulo e instrucción; al acertar, solo la marca, y el resumen «Bien a la primera»", async () => {
  let pct = null;
  const { caja, desmontar } = await montar({ onCompletar: (p) => { pct = p; } });
  for (const [k, p] of PARTES.entries()) {
    assert.equal(caja.querySelector("[data-hecho]").textContent, p.hecho);
    assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, p.rotulo);
    assert.equal(caja.querySelector("[data-instruccion]").textContent, p.instruccion);
    await armar(caja, k === 0 ? p.asiento : [d(GASTO, 1), hb(PROVISION, 1)]);
    if (k === 0) {
      assert.equal(caja.querySelector("[data-panel]").dataset.panel, "acierto");
      assert.equal(textoRetro(caja), null, "acierto sin texto");
      assert.ok(caja.querySelector("[data-visto-parte]"));
    }
    await avanzar(caja);
  }
  assert.equal(caja.querySelector("[data-resumen-cierre]").textContent, "Bien a la primera: 1 de 2");
  assert.equal(pct, 50);
  desmontar();
});

/* Los errores, parte por parte: lo que se arma y el error que manda. */
const CASOS = [
  [0, "D", [d(PROVISION, 180000), hb(CLIENTES, 180000), d(CAJA, 0)], "Caja (C11)"],
  [0, "D", [d(GASTO, 31200), d(PROVISION, 148800), hb(CLIENTES, 180000)], "el gasto (C8): D manda sobre la C15"],
  [0, "C", [hb(PROVISION, 180000), d(CLIENTES, 180000)], "al revés"],
  [0, "A", [d(PROVISION, 180000)], "falta Clientes"],
  [0, "C", [hb(PROVISION, 180000)], "al revés y falta Clientes: C manda sobre A"],
  [0, "C15", [d(PROVISION, 148800), hb(CLIENTES, 148800)], "lo provisionado en vez de lo castigado"],
  [0, "B", [d(PROVISION, 18000), hb(CLIENTES, 18000)], "otro valor"],
  [1, "D", [d(GASTO, 184600), hb(PROVISION, 184600), d(CLIENTES, 0)], "Clientes sobra"],
  [1, "C", [hb(GASTO, 184600), d(PROVISION, 184600)], "al revés"],
  [1, "A", [hb(PROVISION, 184600)], "falta el gasto"],
  [1, "C12", [d(GASTO, 153400), hb(PROVISION, 153400)], "sin lo que faltó"],
  [1, "B", [d(GASTO, 31200), hb(PROVISION, 31200)], "otro valor"],
];

test("★★★ la prioridad D > C > A > B con su texto en el panel, las B específicas (C15, C12), y E4: la mesa del estudiante se queda, con lo correcto junto", async () => {
  for (const [k, tipo, puestas, nota] of CASOS) {
    const p = PARTES[k];
    const { caja, desmontar } = await montar({ items: [p] });
    await armar(caja, puestas);
    assert.equal(caja.querySelector("[data-panel]").dataset.error, tipo, `${p.id}: ${nota}`);
    const esperado = tipo === "D" ? M.textoD(p, puestas) : tipo.startsWith("C1") ? p.errores.especificas.find((e) => e.clave === tipo).texto : p.errores[tipo];
    assert.equal(textoRetro(caja), esperado, `${p.id} ${tipo}: el texto`);
    comprobarMesaE4(caja, p, puestas, `${p.id} ${tipo}`);
    desmontar();
  }
});

test("★★★ el libro diario: no ocupa sitio hasta confirmar el primer asiento; entonces aparece abierto, con la provisión de 2007 y ese asiento (lo correcto, acierte o falle)", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-libro-diario]"), null, "antes del primer asiento, no ocupa sitio (hallazgo 9 de Shoko)");
  const fechas = () => [...caja.querySelectorAll("[data-fecha-diario]")].map((n) => n.textContent);
  const lineas = () => [...caja.querySelectorAll("[data-movimiento]")].map((n) => n.dataset.movimiento);
  await armar(caja, [d(GASTO, 180000), hb(CLIENTES, 180000)]); // falla (D): el diario suma lo correcto
  assert.equal(caja.querySelector("[data-diario-alternar]").getAttribute("aria-expanded"), "true", "aparece abierto");
  assert.equal(caja.querySelector("[data-diario-cabecera]").textContent, "LIBRO DIARIO");
  assert.deepEqual(lineas().slice(0, 2), [`debe:${GASTO}`, `haber:${PROVISION}`], "empieza con la provisión de 2007");
  assert.deepEqual(fechas(), ["31 de diciembre de 2007", "Marzo del año siguiente"]);
  assert.deepEqual(lineas().slice(2), [`debe:${PROVISION}`, `haber:${CLIENTES}`]);
  await avanzar(caja);
  await armar(caja, PARTES[1].asiento);
  assert.deepEqual(fechas(), ["31 de diciembre de 2007", "Marzo del año siguiente", "31 de diciembre del año siguiente"]);
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "3 asientos");
  assert.ok(![...caja.querySelectorAll("[data-libro-diario] *")].some((n) => n.style?.color === "rgb(231, 111, 81)"), "el diario no marca error");
  desmontar();
});

test("★★★ «Así se juega»: el ejemplo de 2007, solo la mesa (sin diario ni encabezado), y termina con sus cuatro líneas", async () => {
  const { caja, desmontar } = await montar({ items: [D.PROVISION_2007_T6_ACT2], modoDemo: true });
  assert.equal(caja.querySelector("[data-libro-diario]"), null);
  assert.equal(caja.querySelector("[data-objetivo]"), null);
  assert.equal(caja.querySelector("[data-hecho]").textContent, D.PROVISION_2007_T6_ACT2.hecho);
  await armar(caja, D.PROVISION_2007_T6_ACT2.asiento);
  assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent), D.PROVISION_2007_T6_ACT2.resolucion);
  assert.equal(D.PROVISION_2007_T6_ACT2.resolucion[1], "Provisión para deudas incobrables sube: va al Haber.", "la provisión sube por el Haber (Shoko)");
  desmontar();
});

/* ═══════════ LA MESA GENERALIZADA ═══════════ */

test("★★★ cierreConMesa: D > C > A > B; una B específica por valor, por cuenta o por las dos; si no se cumple, la B general", () => {
  const parte = {
    asiento: [d("X", 10), hb("Y", 10)],
    errores: {
      D: "d", C: "c", A: "a", B: "b",
      especificas: [{ valor: 7, clave: "V", texto: "v" }, { cuenta: "Y", clave: "K", texto: "k" }, { cuenta: "X", valor: 3, clave: "XV", texto: "xv" }],
    },
  };
  const ev = (p) => M.evaluarParte(parte, p);
  assert.deepEqual([ev([d("X", 10), hb("Y", 10)]).ok, ev([d("X", 10), hb("Y", 10)]).error], [true, null]);
  assert.equal(ev([d("X", 10), hb("Y", 10), d("Z", 1)]).error, "D");
  assert.equal(ev([hb("X", 10), d("Y", 10)]).error, "C");
  assert.equal(ev([d("X", 10)]).error, "A");
  assert.equal(ev([hb("X", 10)]).error, "C", "al revés y falta una: manda C");
  assert.deepEqual([ev([d("X", 7), hb("Y", 7)]).error, ev([d("X", 7), hb("Y", 7)]).texto], ["V", "v"], "por valor, la primera que se cumple");
  assert.deepEqual([ev([d("X", 10), hb("Y", 9)]).error, ev([d("X", 10), hb("Y", 9)]).texto], ["K", "k"], "por cuenta, cualquier valor equivocado");
  assert.deepEqual([ev([d("X", 3), hb("Y", 10)]).error, ev([d("X", 3), hb("Y", 10)]).texto], ["XV", "xv"], "por cuenta y valor");
  assert.deepEqual([ev([d("X", 4), hb("Y", 10)]).error, ev([d("X", 4), hb("Y", 10)]).texto], ["B", "b"], "ninguna se cumple: la general");
  assert.equal(ev([d("X", 4), hb("Y", 10)]).deValor, true);
  assert.equal(ev([hb("X", 10), d("Y", 10)]).deValor, false);
  assert.deepEqual(M.totalesDe([d("X", 2), d("Z", 3), hb("Y", 4)]), { debe: 5, haber: 4 });
  assert.equal(M.puntuar([{ ok: true }, { ok: false }], 2), 50);
  assert.equal(CONFIG_T6_ACT2.evaluar, M.evaluarParte);
});

test("★★ identificadores con b5-t6-a2", () => {
  assert.equal(D.T6_ACT2.id, "b5-t6-a2");
  assert.deepEqual([D.PROVISION_2007_T6_ACT2, ...PARTES].map((p) => p.id), ["b5-t6-a2-tutorial", "b5-t6-a2-p1", "b5-t6-a2-p2"]);
});
