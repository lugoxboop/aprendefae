import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A6 «Devoluciones en permanente» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near, y
 *     cada texto visible de la v1 está en los datos
 *   · los cuatro asientos son los de la v1, línea por línea, con ● donde el
 *     monto es de X4; las cifras salen de los datos; ninguna de X4, ninguna
 *     suma
 *   · P3: el segundo asiento de la devolución de ventas, cada línea a su
 *     lado
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · fuera del catálogo de FP; en T7-2 después de A5
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

const A = await import("../../data/contabilidadT7_2_a6.js");
const { cifraK } = await import("../t7_2Kardex.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_2, BOTON, INTERFAZ, PENDIENTE_DE_REVISION } = await import("../../components/mecanicas/libros/t7/PantallasT7_2.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a6-v1.md");
const CONTENIDO = V1.slice(V1.indexOf("\nContenido\n"), V1.indexOf("\nNombres y erratas\n"));
const P = A.PIEZA_DEVOLUCIONES;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const minuscula = (t) => t[0].toLowerCase() + t.slice(1);

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const lado = (caja, linea, cual) => caja.querySelector(`[data-linea="${linea}"][data-lado="${cual}"]`);
const otro = (l) => (l === A.DEBE ? A.HABER : A.DEBE);

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "enunciado", "pregunta", "consigna", "boton", "pie", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.despues ?? []));
    if (p.error) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    for (const l of p.lineas ?? []) t.push(l.devolucion);
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie);
  }
  return t;
}
const fichas = () => P.pantallas.flatMap((p) => p.ficha ?? []);

function citas(md) {
  const limpio = md.replace(/\*\[[^\]]*\]\*/g, "").replace(/»(\s*)\([^()]*\)/g, "»$1").replace(/^(\s*)«[^»]*»: /gm, "$1");
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas no cierran");
  return out;
}

/* Las tablas de asiento de la v1, separadas por tabulaciones: [cuenta, debe, haber]. */
function tablas() {
  const out = [];
  const ls = CONTENIDO.split("\n");
  for (let i = 0; i < ls.length; i++) {
    if (!/^\d+ de marzo\tDebe\tHaber$/.test(ls[i])) continue;
    const filas = [];
    for (let j = i + 1; j < ls.length && ls[j].includes("\t"); j++) filas.push(ls[j].split("\t").map((c) => c.trim()));
    out.push(filas);
  }
  return out;
}
const enTabla = (asiento) => asiento.lineas.map((l) => {
  const m = l.monto === null ? "●" : cifraK(l.monto);
  return [l.cuenta, l.lado === A.DEBE ? m : "", l.lado === A.HABER ? m : ""];
});

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1", () => {
  const faltan = textosVisibles().filter((t) => !V1.includes(t) && !Object.values(A.BOTON).includes(t));
  assert.deepEqual(faltan, []);
  /* La ficha lleva el primer dato en mayúscula (convención); los nombres propios ya la llevan en la v1. */
  const enV1 = (t) => (V1.includes(t) ? t : minuscula(t));
  assert.deepEqual(fichas().filter((f) => !V1.includes(enV1(f.texto))).map((f) => f.texto), [], "la ficha");
  /* Las fichas de la v1, dato por dato y en su orden. */
  for (const id of ["libro-del-comprador"]) {
    const textos = pantalla(id).ficha.map((f) => enV1(f.texto));
    const linea = CONTENIDO.split("\n").find((l) => l.startsWith("Ficha de la devolución: ") && textos.every((x) => l.includes(x)));
    assert.ok(linea, `${id}: la ficha no es una de la v1`);
    let desde = 0;
    for (const x of textos) { const k = linea.indexOf(x, desde); assert.ok(k >= desde, `${id}: ${x} fuera de orden`); desde = k; }
  }
});

test("★★★ cada texto visible de la v1 está en los datos", () => {
  const datos = new Set([...textosVisibles(), ...fichas().map((f) => f.texto)]);
  const sobran = [...new Set(citas(CONTENIDO).filter((c) => !datos.has(c)))].sort();
  assert.deepEqual(sobran, [
    /* «Va pegada al nombre «Devoluciones de ventas»»: es la indicación, no texto. */
    "Devoluciones de ventas",
    /* Las dos líneas de P3: cuenta y monto, en sus dos lugares. */
    "Costo de mercancía vendida · $960.000", "Inventario de mercancías · $960.000",
  ].filter((c) => !datos.has(c)).sort());
  assert.deepEqual(pantalla("libro-del-comprador").opciones.map((o) => o.texto).sort(), ["Compras", "Devoluciones de compras", "Inventario de mercancías"]);
});

/* ═══════════ 2 · LOS ASIENTOS Y LAS CIFRAS ═══════════ */

test("★★★ los cuatro asientos son los de la v1, línea por línea, con ● donde el monto es de X4", () => {
  const [g3compra, g3dev, g4venta] = tablas();
  const p2 = pantalla("libro-del-comprador");
  const p3 = pantalla("libro-del-vendedor");
  assert.deepEqual(enTabla(p2.asientos[0]), g3compra);
  assert.deepEqual(enTabla(p2.acierto.asientos[0]), g3dev);
  assert.deepEqual(enTabla(p3.asientos[0]), g4venta);
  /* El primer asiento de la devolución de G-4, que la v1 da en una línea. */
  const linea = CONTENIDO.split("\n").find((l) => l.startsWith("Primer asiento de la devolución, ya resuelto: "));
  const v1 = [...linea.slice(linea.indexOf(": ") + 2).matchAll(/([^·]+?) ([\d.]+|●) \((debe|haber)\)/g)].map((m) => [m[1].trim(), m[2], m[3]]);
  assert.deepEqual(p3.asientos[1].lineas.map((l) => [l.cuenta, l.monto === null ? "●" : cifraK(l.monto), l.lado]), v1);
  /* La línea de la regla 8 va pegada al asiento de Devoluciones de ventas. */
  assert.deepEqual(p3.despues, ["Esta cuenta se resta de Ingresos por ventas en el estado de resultados."]);
});

test("★★★ las cifras salen de los datos: 1.900 y 300 unidades, $8.000 y $3.200", () => {
  const d = A.DATOS_A6;
  assert.ok(V1.includes("Las del libro que se ven son los datos (1.900 y 300 unidades, $8.000 y $3.200), 15.200.000 y 2.400.000, y el costo de G-4: 6.080.000 y 960.000"));
  assert.deepEqual([d.unidades * d.precio, d.devueltas * d.precio, d.unidades * d.costo, d.devueltas * d.costo], [15_200_000, 2_400_000, 6_080_000, 960_000]);
});

test("★★★ P3: cada línea del segundo asiento va al lado que dice la v1, con su mensaje", () => {
  const linea = CONTENIDO.split("\n").find((l) => l.startsWith("Líneas que coloca el estudiante: "));
  const v1 = [...linea.matchAll(/«([^»]+) · \$([\d.]+)» → (Debe|Haber)/g)].map((m) => [m[1], m[2], m[3] === "Debe" ? A.DEBE : A.HABER]);
  const p = pantalla("libro-del-vendedor");
  assert.deepEqual(p.lineas.map((l) => [l.cuenta, cifraK(l.monto), l.lado]), v1);
  const bloque = CONTENIDO.slice(CONTENIDO.indexOf(linea));
  const errores = citas(bloque.slice(bloque.indexOf("Errores:"), bloque.indexOf("Acierto:")));
  assert.deepEqual(p.lineas.map((l) => l.devolucion), errores);
});

test("★★★ X4: ninguna cifra de la lista de control, ninguna suma; solo los datos y el costo de G-4", () => {
  const todo = JSON.stringify(P);
  for (const x of A.X4) {
    assert.ok(!todo.includes(cifraK(x)), `${cifraK(x)} se ve`);
    assert.ok(!new RegExp(`[^\\d]${x}[^\\d]`).test(todo), `${x} está en los datos`);
  }
  const montos = new Set(P.pantallas.flatMap((p) => [...(p.asientos ?? []), ...(p.acierto?.asientos ?? [])].flatMap((a) => a.lineas).concat(p.lineas ?? [])).map((l) => l.monto).filter((m) => m !== null));
  assert.deepEqual([...montos].sort((a, b) => a - b), [960_000, 2_400_000, 6_080_000, 15_200_000]);
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const cuerpo = (p) => [p.objetivo, ...(p.parrafos ?? []), p.enunciado, ...(p.ficha ?? []).map((f) => f.texto), ...(p.despues ?? [])].filter(Boolean);
const todosLosAsientos = (p, acierto) => [...(p.asientos ?? []), ...(acierto ? p.acierto.asientos ?? [] : [])].flatMap(enTabla);
const filasDeAsiento = (caja) => [...caja.querySelectorAll("[data-asiento] [data-linea]")].map((r) => [...r.querySelectorAll("[role=rowheader], [role=cell]")].map((c) => (c.querySelector("[data-oculto]") ? "●" : c.textContent)));

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie; el asiento sale con el acierto", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: P, rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lados") {
        const lineas = [...m.caja.querySelectorAll("[data-fila]")].map((f) => p.lineas.find((l) => l.id === f.dataset.fila));
        const filas = (malas = []) => lineas.flatMap((l) => [l.cuenta, ...(malas.includes(l.id) ? [INTERFAZ.incorrecto, l.devolucion] : [])]);
        assert.deepEqual(enPantalla(m.caja).textos, [...cuerpo(p), p.consigna, ...filas(), BOTON.confirmar, p.pie], "lados colocando");
        assert.deepEqual(filasDeAsiento(m.caja), todosLosAsientos(p, false), "los asientos resueltos de G-4");
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...cuerpo(p), p.consigna, ...filas(lineas.map((l) => l.id)), BOTON.probarOtra, p.error.pie], "lados error");
        await tocar(boton(m.caja, "probar-otra"));
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, l.lado));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...cuerpo(p), p.consigna, ...filas(), INTERFAZ.correcto, p.acierto.texto, BOTON.seguir, p.acierto.pie], "lados acierto");
        vistos.push(`${p.id}:colocando`, `${p.id}:error`, `${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [...cuerpo(p), ...(p.lista ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...cuerpo(p), p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      assert.deepEqual(filasDeAsiento(m.caja), todosLosAsientos(p, false), `${p.id}: los asientos antes del acierto`);
      vistos.push(`${p.id}:colocando`);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.incorrecto, o.devolucion, BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${o.id}`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.correcto, p.acierto.texto, BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      if (p.asientos || p.acierto.asientos) {
        assert.deepEqual(filasDeAsiento(m.caja), todosLosAsientos(p, true));
        for (const o of m.caja.querySelectorAll("[data-oculto]")) assert.equal(o.textContent, `●${PENDIENTE_DE_REVISION.montoOculto}`);
      }
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 3 + 2 * 4 + 3);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de la v1; el de los errores, el de su pantalla", () => {
  for (const p of P.pantallas) {
    assert.ok(V1.includes(`Pie: «${p.pie}»`), p.id);
    if (p.error) assert.equal(p.error.pie, p.pie, p.id);
    if (p.acierto) assert.equal(p.acierto.pie, p.pie, p.id);
  }
});

/* ═══════════ 4 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 justo después de A5; sin nada que pague", () => {
  assert.equal(A.A6_ID, "t7-2-a6-devoluciones");
  assert.equal(P.numero, 6);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A6_ID), ids.indexOf("t7-2-a5-fletes") + 1);
  const piezas = PIEZAS_T7_2.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A6_ID), piezas.indexOf("t7-2-a5-fletes") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A6_ID)), []);
});
