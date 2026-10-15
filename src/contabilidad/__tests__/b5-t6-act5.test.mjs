import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 5 — «La cuenta de la provisión» (Célula B, b5-t6-a5).
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-act5.md): consigna,
 *     regla, reglas de «¿Cómo se juega?», punto de partida, cierre, texto
 *     alternativo, las cinco casillas con sus tres opciones y su tipo, y los
 *     diez errores
 *   · las cuentas cuadran; las correctas son cifras del libro (las de El
 *     Torito en nuestros datos); los distractores de Futaba no lo son
 *   · las casillas en orden: un intento; al fallar, la razón y la correcta
 *     marcada; acierte o falle, el valor correcto queda en el registro;
 *     pct = aciertos / 5 × 100; las opciones, barajadas
 *   · la mecánica de Macro no se toca: la de la célula es una copia
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: LaCuentaDeLaProvision } = await import("../../components/mecanicas/libros/tema6/LaCuentaDeLaProvision.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const D = await import("../../data/contabilidadT6Act5.js");
const { pesos } = await import("../../data/contabilidad.js");
const { listaNegraDelLibro, cifras } = await import("./b5-lista-negra.mjs");
const { FAE } = await import("../../theme.js");

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => {
    raiz.render(h(LaCuentaDeLaProvision, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, ...props }));
  });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const opcion = (caja, valor) => caja.querySelector(`[data-opcion="${valor}"]`)?.closest("button");
const siguiente = (caja) => tocar([...caja.querySelectorAll("button")].find((b) => /^(Siguiente|Ver resultado)$/.test(b.textContent.trim())));
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  return p ? [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("") : null;
};
const C = D.CASILLAS_T6_ACT5;
const correctaDe = (c) => c.opciones.find((o) => o.tipo === null).valor;

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act5.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"));
const filas = FUTABA.split("\n").map((l) => l.split("\t"));
const fila = (primera) => filas.find((c) => c[0] === primera);
const filaTipo = (t) => filas.find((c) => c[0] === t || c[0].startsWith(`${t} ·`));
const sinCifra = (t) => t.replace(/ \(\d+\)$/, "");
/* «$2.655.000 → T1» → { valor, tipo }. */
const opcionDe = (celda) => { const [v, t] = celda.split(" → "); return { valor: cifras(v)[0] ?? Number(v.replace(/\D/g, "")), tipo: t ?? null }; };

test("guarda: el paquete trae las cinco casillas y los diez errores, y una inventada no aparece", () => {
  for (let k = 1; k <= 5; k++) assert.ok(fila(String(k)), `casilla ${k}`);
  for (let k = 1; k <= 10; k++) assert.ok(filaTipo(`T${k}`), `T${k}`);
  assert.equal(fila("6"), undefined);
});

test("★★★ los textos fijos son los del paquete: consigna, regla, reglas, punto de partida, cierre y texto alternativo", () => {
  assert.equal(D.T6_ACT5.consigna, fila("Consigna")[1]);
  assert.equal(D.T6_ACT5.regla, fila("Regla fija")[1]);
  D.REGLAS_T6_ACT5.forEach((r, k) => assert.equal(r, fila(`Así se juega, ${k + 1}`)[1]));
  assert.equal(D.T6_ACT5.partida, fila("Tutorial (pp. 200 y 202)")[1]);
  assert.equal(D.T6_ACT5.cierre, fila("Cierre")[1]);
  assert.equal(D.ALT_T6_ACT5, fila("Texto alternativo")[1]);
});

test("★★★ las cinco casillas: el enunciado, la correcta y los dos distractores con su tipo, como en el paquete", () => {
  assert.equal(C.length, 5);
  C.forEach((c, k) => {
    const [, enunciado, bien, mal1, mal2] = fila(String(k + 1));
    assert.equal(c.enunciado, sinCifra(enunciado), `casilla ${k + 1}: enunciado`);
    assert.deepEqual(c.opciones, [opcionDe(bien), opcionDe(mal1), opcionDe(mal2)], `casilla ${k + 1}: opciones`);
  });
  for (let k = 1; k <= 10; k++) assert.equal(D.ERRORES_T6_ACT5[`T${k}`], filaTipo(`T${k}`)[1], `T${k}`);
  /* Cada tipo de error se usa en una casilla, y solo en una. */
  const usados = C.flatMap((c) => c.opciones.map((o) => o.tipo).filter(Boolean));
  assert.deepEqual([...usados].sort(), Object.keys(D.ERRORES_T6_ACT5).sort());
});

test("★★★ las cuentas cuadran con el libro: neto, lo que faltó, el ajuste y el saldo final", () => {
  const [neto, castigo, falta, ajuste, saldo] = C.map(correctaDe);
  const [deben, provision, pide] = [2655000, 148800, 153400];
  assert.equal(deben - provision, neto);
  assert.equal(castigo, 180000);
  assert.equal(castigo - provision, falta);
  assert.equal(pide + falta, ajuste);
  assert.equal(provision - castigo + ajuste, saldo);
  assert.equal(saldo, pide, "el saldo final es justo lo que pidió el análisis");
  assert.deepEqual(cifras(D.T6_ACT5.partida), [deben, provision, provision]);
});

test("★★★ las correctas son cifras del libro (El Torito, en nuestros datos); los cuatro distractores de Futaba no lo son", async () => {
  const libro = await listaNegraDelLibro();
  for (const c of C) assert.ok(libro.has(correctaDe(c)), `${pesos(correctaDe(c))} no es del libro`);
  const propios = C.flatMap((c) => c.opciones.filter((o) => o.tipo).map((o) => o.valor)).filter((v) => v && !libro.has(v)).sort((a, b) => a - b);
  assert.deepEqual(propios, D.DISTRACTORES_PROPIOS_T6_ACT5);
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ en pantalla: la consigna, la regla, el punto de partida y la primera casilla con sus tres opciones", async () => {
  const { caja, desmontar } = await montar();
  assert.ok(caja.textContent.includes(D.T6_ACT5.consigna));
  assert.equal(caja.querySelector("[data-regla]").textContent, D.T6_ACT5.regla);
  assert.equal(caja.querySelector("[data-partida]").textContent, D.T6_ACT5.partida);
  assert.equal(caja.querySelector("[data-hecho]").textContent, C[0].enunciado);
  assert.deepEqual([...caja.querySelectorAll("[data-opcion]")].map((n) => n.textContent).sort(), C[0].opciones.map((o) => pesos(o.valor)).sort());
  desmontar();
});

test("★★★ cada error se ve literal; la correcta queda marcada; un solo intento; y el valor correcto entra al registro", async () => {
  for (let k = 0; k < C.length; k++) {
    for (const mala of C[k].opciones.filter((o) => o.tipo)) {
      const { caja, desmontar } = await montar();
      for (let j = 0; j < k; j++) { await tocar(opcion(caja, correctaDe(C[j]))); await siguiente(caja); }
      await tocar(opcion(caja, mala.valor));
      assert.equal(devolucion(caja), `❌${D.ERRORES_T6_ACT5[mala.tipo]}`, `casilla ${k + 1}, ${mala.tipo}`);
      assert.equal(opcion(caja, correctaDe(C[k])).dataset.estado, "revelada");
      await tocar(opcion(caja, correctaDe(C[k])));
      assert.equal(opcion(caja, correctaDe(C[k])).dataset.estado, "revelada", "un solo intento");
      const reg = caja.querySelector(`[data-resuelta="${C[k].id}"]`);
      assert.equal(reg.dataset.acierto, "no");
      assert.ok(reg.textContent.includes(pesos(correctaDe(C[k]))), "el valor correcto, en el registro");
      desmontar();
    }
  }
});

test("★★★ pct = aciertos / 5 × 100 y el cierre literal", async () => {
  const m = await montar();
  for (let k = 0; k < C.length; k++) {
    const v = k < 3 ? correctaDe(C[k]) : C[k].opciones.find((o) => o.tipo).valor;
    await tocar(opcion(m.caja, v));
    await siguiente(m.caja);
  }
  assert.equal(m.pct(), 60);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.T6_ACT5.cierre);
  m.desmontar();
});

test("★★ el modo demo: una casilla, sin encabezado ni punto de partida; nunca completa", async () => {
  let llamado = false;
  const m = await montar({ items: [C[0]], modoDemo: true, onCompletar: () => { llamado = true; } });
  assert.equal(m.caja.querySelector("[data-partida]"), null);
  await tocar(opcion(m.caja, correctaDe(C[0])));
  assert.equal(llamado, false);
  m.desmontar();
});

test("★★ la mecánica de Macro no se toca: b5/CasillasEnOrden.jsx es la copia de la célula; dificultad y FP de Sakuta", () => {
  const copia = readFileSync(new URL("../../components/mecanicas/libros/b5/CasillasEnOrden.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(copia, /pmFabricaDelDinero|ESCALERA|fabricaDelDinero\.jsx"/, "la copia no depende de Macro");
  assert.deepEqual([D.T6_ACT5.id, D.T6_ACT5.dificultad, D.T6_ACT5.fpBase], ["b5-t6-a5", "medio", 25]);
  assert.match(GUIA, /medio · 25 FP/);
});
