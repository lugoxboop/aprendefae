import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A8 «La NIC 2 del libro: fórmulas y revelación» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1, CON EL CAMBIO DE NEAR que pasó L, está en
 *     los datos, letra por letra, y nada más; los textos viejos ya no están
 *   · la pregunta es «¿Cuántas fórmulas…?», con Dos · Tres · Cuatro, y la
 *     buena es Tres; la línea de UEPS aparece después de ella
 *   · C7-25: FIFO y el promedio van sin condición, con «Basado en el libro,
 *     p. 259»
 *   · la frase fija de la NIC 2, la de A7, a la vista en TODAS las pantallas
 *     y estados
 *   · sin cifras; fuera del catálogo de FP; la última de T7-3
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a8.js");
const A7 = await import("../../data/contabilidadT7_3_a7.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3 } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a8-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const P = A.PIEZA_NIC2_FORMULAS;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const celdas = (l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, ""));
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Decisiones")).split("\n").filter((l) => /^\| \d/.test(l)).map(celdas);
/* El cambio de Near: «Viejo» y «Nuevo» de cada fila. */
const CAMBIO = V1.slice(V1.indexOf("## Cambio de Near en A8")).split("\n").filter((l) => /^\| A8/.test(l)).map(celdas);

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []), ...(p.tras ?? []), ...(p.lista ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

test("★★★ cada texto de la v1, con el cambio de Near, está en los datos, letra por letra, y nada más", () => {
  assert.ok(V1.startsWith(`**T7-3 · A8 «${P.titulo}» · versión 1.**`));
  assert.ok(V1.includes(`id \`${A.A8_ID}\``));
  assert.ok(MAPA.includes(`| 15 | ${A.A8_ID} | ${P.titulo} | Aprender |`));
  assert.equal(CAMBIO.length, 4);
  const viejos = CAMBIO.flatMap((f) => citas(f[1]));
  const nuevos = CAMBIO.flatMap((f) => citas(f[2]));
  assert.equal(viejos.length, 3);
  assert.equal(nuevos.length, 4);
  const esperados = FILAS.flatMap((f) => citas(f[1])).filter((t) => !viejos.includes(t));
  assert.equal(esperados.length, FILAS.flatMap((f) => citas(f[1])).length - 3, "los tres textos viejos estaban en la v1");
  esperados.push(...nuevos);
  assert.deepEqual([...new Set(textosDeDatos())].sort(), [...new Set(esperados)].sort());
  for (const v of viejos) assert.ok(!JSON.stringify(P).includes(v), `sigue el texto viejo: ${v}`);
  /* Las cinco revelaciones, en su orden. */
  assert.deepEqual(pantalla("revelar").lista, FILAS.filter((f) => f[1].startsWith("• ")).flatMap((f) => citas(f[1])));
});

test("★★★ la pregunta nueva: Dos · Tres · Cuatro, la buena es Tres, y la línea de UEPS después", () => {
  const f = pantalla("formulas");
  const [preg, acierto, error, despues] = CAMBIO;
  assert.equal(f.pregunta, citas(preg[2])[0]);
  assert.deepEqual(f.opciones.map((o) => o.texto), preg[2].match(/Opciones: (.+)$/)[1].split(" · "));
  assert.deepEqual(f.opciones.filter((o) => o.correcta).map((o) => o.texto), ["Tres"]);
  assert.equal(f.acierto.texto, citas(acierto[2])[0]);
  for (const o of f.opciones.filter((x) => !x.correcta)) assert.equal(o.devolucion, citas(error[2])[0]);
  assert.equal(despues[1], "(no estaba)");
  assert.deepEqual(f.acierto.despues, [citas(despues[2])[0]]);
  assert.ok(despues[2].includes("(p. 259)"));
  /* «Son tres» en el resumen, igual que en la pregunta. */
  assert.match(pantalla("resumen").parrafos[0], /hay tres fórmulas del costo/);
});

test("★★★ C7-25: FIFO y el promedio sin condición, con «Basado en el libro, p. 259»", () => {
  const f = pantalla("formulas");
  const fifo = f.parrafos.find((t) => t.includes("que en inglés se llama FIFO"));
  const prom = f.parrafos.find((t) => t.startsWith("La segunda es"));
  assert.equal(fifo, "El libro nombra otras dos fórmulas. La primera es primera entrada, primera salida, que en inglés se llama FIFO.");
  assert.equal(prom, "La segunda es el costo promedio ponderado.");
  for (const t of [fifo, prom]) assert.doesNotMatch(t, /intercambiables|cuando|si /);
  assert.ok(FILAS.some((r) => r[1].includes("que en inglés se llama FIFO") && r[3].includes("pie «Basado en el libro, p. 259»")));
  assert.ok(f.acierto.pie === "Basado en el libro, p. 259" && f.error.pie === "Basado en el libro, p. 259");
  assert.match(f.pie, /\b259\b/);
});

test("★★★ la frase fija de la NIC 2 es la de A7; sin cifras", () => {
  assert.equal(P.aviso, A7.FRASE_NIC2);
  assert.ok(V1.includes("+ frase fija (101,4)"));
  const visibles = textosDeDatos().join(" ").replaceAll("NIC 2", "NIC");
  assert.doesNotMatch(visibles, /\d|\$/);
});

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(PantallasT7_3, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const textos = (caja) => [...caja.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
const pie = (caja) => caja.querySelector("[data-pie]").textContent;
const aviso = (caja) => caja.querySelector("[data-pieza] [data-aviso]")?.textContent ?? null;

test("★★★ se recorre entera, con la frase de la NIC 2 a la vista en cada pantalla y cada estado", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    const visto = [];
    const mira = () => { assert.equal(aviso(c), A7.FRASE_NIC2, `sin la frase en ${c.querySelector("[data-pantalla]").dataset.pantalla}`); visto.push(c.querySelector("[data-pantalla]").dataset.pantalla); };
    mira();
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    assert.equal(pie(c), pantalla("portada").pie);
    await tocar(boton(c, "empezar")); mira();
    assert.deepEqual(textos(c), pantalla("sistemas").parrafos);
    await tocar(boton(c, "seguir")); mira();
    const f = pantalla("formulas");
    assert.deepEqual(textos(c), [...f.parrafos, f.pregunta]);
    for (const o of f.opciones.filter((x) => !x.correcta)) {
      await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(c, "confirmar")); mira();
      assert.deepEqual(textos(c).slice(-1), [o.devolucion]);
      assert.equal(pie(c), f.error.pie);
      /* La línea de UEPS no aparece con el error. */
      assert.ok(!textos(c).includes(f.acierto.despues[0]));
      await tocar(boton(c, "probar-otra"));
    }
    await tocar(c.querySelector('[data-opcion="tres"]'));
    await tocar(boton(c, "confirmar")); mira();
    assert.deepEqual(textos(c).slice(-2), [f.acierto.texto, ...f.acierto.despues]);
    assert.equal(pie(c), f.acierto.pie);
    await tocar(boton(c, "seguir")); mira();
    assert.deepEqual(textos(c), pantalla("gasto").parrafos);
    await tocar(boton(c, "seguir")); mira();
    const rv = pantalla("revelar");
    assert.deepEqual(textos(c), [...rv.parrafos, ...rv.lista]);
    assert.equal(c.querySelectorAll("[data-lista] li").length, 5);
    await tocar(boton(c, "seguir")); mira();
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    /* La última pantalla del tema no tiene botón. */
    assert.equal(c.querySelectorAll("[data-boton]").length, 0);
    assert.deepEqual([...new Set(visto)], P.pantallas.map((p) => p.id));
  } finally {
    m.desmontar();
  }
});

test("★★★ fuera del catálogo de FP; la última de T7-3, y la vista la muestra", () => {
  assert.equal(P.numero, 8);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A8_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A8_ID), ids.indexOf(A7.A7_ID) + 1);
  assert.equal(ids.at(-1), A.A8_ID);
  assert.equal(PIEZAS_T7_3.at(-1).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A8_ID)), []);
});
