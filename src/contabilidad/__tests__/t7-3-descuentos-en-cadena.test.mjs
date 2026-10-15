import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A2 «Descuentos en cadena» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, con los
 *     dos cambios de la capa 3; los que esa capa reemplaza ya no están
 *   · las cifras de H-2 se recalculan desde la lista, los tres descuentos y
 *     las tarifas; el factor es 0,7866 (C7-2 resuelta, sin mencionarla); el
 *     asiento cuadra con las sumas de Near
 *   · cada pantalla y cada estado muestran sus textos y su pie; los pasos
 *     del segundo y tercer descuento aparecen con el acierto
 *   · regla 3: ninguna cifra de X1-X4
 *   · fuera del catálogo de FP; en T7-3, después de A1 (y de H1)
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

const A = await import("../../data/contabilidadT7_3_a2.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a2-v1.md");
const P = A.PIEZA_DESCUENTOS_EN_CADENA;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/* La tabla «Pantallas» de la v1, con tabulaciones: [número, texto] por fila. */
const FILAS = V1.slice(V1.indexOf("Pantallas\n"), V1.indexOf("\nNotas\n")).split("\n").filter((l) => /^\d/.test(l)).map((l) => l.split("\t"));
const CAPA3 = V1.slice(V1.indexOf("## Capa 3")).split("\n").filter((l) => l.startsWith("| A2 ·")).map((l) => l.split(" | "));

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []), ...(p.tras ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto visible de la v1 está en los datos, con los cambios de la capa 3", () => {
  const reemplazos = new Map(CAPA3.map((f) => [citas(f[1])[0], citas(f[2])[0]]));
  assert.equal(reemplazos.size, 2);
  const esperados = [];
  for (const [, texto] of FILAS) {
    if (texto.startsWith("Ficha") || texto.startsWith("Sin fecha")) continue;
    for (const c of citas(texto)) esperados.push(reemplazos.get(c) ?? c);
  }
  /* La v1: «Después, la frase de tarifas literal», detrás de la línea de tarifas. */
  assert.ok(FILAS.find((f) => f[1].includes("En este ejercicio, el IVA es del 16 %"))[1].includes("Después, la frase de tarifas literal"));
  esperados.push(A1.FRASE_TARIFAS);
  assert.deepEqual([...textosDeDatos()].sort(), [...esperados].sort());
  /* La frase va justo después de la de tarifas. */
  const as = pantalla("asiento").parrafos;
  assert.equal(as[as.indexOf("En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre el valor a facturar.") + 1], A1.FRASE_TARIFAS);
  const datos = JSON.stringify(P);
  for (const viejo of reemplazos.keys()) assert.ok(!datos.includes(viejo), viejo);
});

test("★★★ las opciones, la ficha y el asiento son los de la v1", () => {
  const fila = (pref) => FILAS.find((f) => f[1].startsWith(pref))[1];
  assert.deepEqual(pantalla("ejemplo").opciones.map((o) => o.texto), fila("«5 % más 8 %").match(/Opciones: (.+)\.$/)[1].split(" · "));
  assert.deepEqual(pantalla("pasos").opciones.map((o) => o.texto), fila("«¿Sobre qué valor se calcula el segundo").match(/Opciones: (.+)\.$/)[1].split(" · "));
  assert.equal(pantalla("ejemplo").opciones.find((o) => o.correcta).texto, "No");
  assert.equal(pantalla("pasos").opciones.find((o) => o.correcta).texto, "$3.990.000");
  /* Cada error de la v1 con su opción: «Error (Sí)» y el «Error» de la segunda pregunta. */
  assert.equal(pantalla("ejemplo").opciones.find((o) => o.id === "si").devolucion, citas(FILAS.find((f) => f[1].startsWith("Error (Sí)"))[1])[0]);
  const ficha = fila("Ficha de cinco datos").match(/: (.+)\.$/)[1].split(" · ").map((t) => t.replace(/^(entrega|recibe) /, ""));
  assert.deepEqual(pantalla("ejemplo").ficha.map((f) => f.texto.toLowerCase()), ficha.map((t) => t.toLowerCase()));
  assert.deepEqual(pantalla("ejemplo").ficha.map((f) => f.dato), A1.PIEZA_EL_DESCUENTO_COMERCIAL.pantallas.find((p) => p.ficha).ficha.map((f) => f.dato));
  const as = fila("Sin fecha");
  const lineas = [...as.matchAll(/(?:\. |· )([^·.]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A1.DEBE : A1.HABER]);
  assert.deepEqual(pantalla("asiento").asientos[0].lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas);
  assert.match(as, new RegExp(`Sumas: ${cifra(A.H2_LIBRO.sumas)} = ${cifra(A.H2_LIBRO.sumas)}\\. Pie: «${pantalla("asiento").pie}»`));
});

test("★★★ las cifras de H-2 se recalculan; el factor es 0,7866 y el asiento cuadra", () => {
  const C = A.H2_LIBRO;
  const d1 = (4_200_000 * 5) / 100; const s1 = 4_200_000 - d1;
  const d2 = (s1 * 8) / 100; const s2 = s1 - d2;
  const d3 = (s2 * 10) / 100; const f = s2 - d3;
  assert.deepEqual([C.d1, C.s1, C.d2, C.s2, C.d3, C.factura], [d1, s1, d2, s2, d3, f]);
  assert.equal(C.rebaja, 4_200_000 - f);
  assert.equal(C.rebaja23, (4_200_000 * 23) / 100);
  assert.equal((C.rebaja / 4_200_000 * 100).toFixed(2), "21.34");
  assert.equal(Math.round(0.95 * 0.92 * 0.9 * 10_000) / 10_000, C.factor);
  assert.equal(Math.round(4_200_000 * C.factor), f);
  /* El libro redondea al peso: 528.595,2 y 115.630,2. */
  assert.deepEqual([C.iva, C.retencion], [Math.round((f * 16) / 100), Math.round((f * 35) / 1000)]);
  assert.equal(C.cliente, f + C.iva - C.retencion);
  assert.equal(C.sumas, C.cliente + C.retencion);
  assert.equal(C.sumas, C.iva + f);
  /* La errata C7-2 (0,7688) no aparece. */
  assert.ok(!JSON.stringify(P).includes("0,7688"));
});

test("★★★ regla 3: ninguna cifra de X1-X4", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

/* ═══════════ 2 · MONTADA ═══════════ */

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

test("★★★ se recorre entera: cada pantalla y cada estado con sus textos y su pie", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    await tocar(boton(c, "empezar"));
    assert.deepEqual(textos(c), pantalla("en-cadena").parrafos);
    assert.equal(pie(c), pantalla("en-cadena").pie);
    await tocar(boton(c, "seguir"));
    const ej = pantalla("ejemplo");
    assert.deepEqual(textos(c), [...ej.parrafos, ...ej.ficha.map((f) => f.texto), ej.pregunta]);
    await tocar(c.querySelector('[data-opcion="si"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-1), [ej.opciones[0].devolucion]);
    await tocar(boton(c, "probar-otra"));
    await tocar(c.querySelector('[data-opcion="no"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-1), [ej.acierto.texto]);
    await tocar(boton(c, "seguir"));
    /* Los pasos: el segundo y el tercer descuento aparecen solo con el acierto. */
    const pa = pantalla("pasos");
    assert.deepEqual(textos(c), [...pa.parrafos, pa.pregunta]);
    await tocar(c.querySelector('[data-opcion="lista"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-1), [pa.opciones[0].devolucion]);
    assert.ok(!c.textContent.includes("$3.303.720"));
    await tocar(boton(c, "probar-otra"));
    await tocar(c.querySelector('[data-opcion="saldo"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-4), [pa.acierto.texto, ...pa.acierto.parrafos]);
    assert.equal(pie(c), pa.acierto.pie);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("atajo").parrafos);
    assert.equal(pie(c), pantalla("atajo").pie);
    await tocar(boton(c, "seguir"));
    /* El asiento: los textos, el asiento con sus sumas y el texto de la capa 3 debajo. */
    const as = pantalla("asiento");
    assert.deepEqual(textos(c), [...as.parrafos, ...as.tras]);
    const tabla = c.querySelector("[data-asiento]");
    assert.deepEqual([...tabla.querySelectorAll("[data-suma]")].map((x) => x.textContent), [cifra(A.H2_LIBRO.sumas), cifra(A.H2_LIBRO.sumas)]);
    const hijos = [...c.querySelector(".t73p").children];
    assert.ok(hijos.indexOf(tabla) < hijos.findIndex((x) => x.textContent === as.tras[0]), "el texto de la capa 3 va debajo del asiento");
    assert.equal(pie(c), as.pie);
    await tocar(boton(c, "seguir"));
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.equal(c.querySelector("[data-boton]") === null, true);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, después de A1 (y de H1 si ya entró)", () => {
  assert.equal(A.A2_ID, "t7-3-descuentos-en-cadena");
  assert.equal(P.numero, 2);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A2_ID), ids.indexOf("t7-3-descuento-comercial") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A2_ID), piezas.indexOf("t7-3-descuento-comercial") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A2_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a2.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

const filasDe = (fig) => [...fig.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, ""), r.querySelector(".rg-v").textContent, r.classList.contains("rg-res")]);

test("★★★ Patrón T7-3: la cadena llega con el acierto de «¿sobre qué valor?», y el atajo va con su texto", async () => {
  const C = A.H2_LIBRO;
  /* Cada paso de la cadena, recalculado. */
  assert.equal(C.lista - C.d1, C.s1);
  assert.equal(C.s1 - C.d2, C.s2);
  assert.equal(C.s2 - C.d3, C.factura);
  assert.equal(Math.round(0.95 * 0.92 * 0.90 * 10_000) / 10_000, C.factor);
  assert.equal(Math.round(C.lista * C.factor), C.factura);
  const m = await montar();
  try {
    const c = m.caja;
    const ir = async (id) => {
      for (let k = 0; k < 10 && c.querySelector("[data-pantalla]").dataset.pantalla !== id; k++) {
        const p = pantalla(c.querySelector("[data-pantalla]").dataset.pantalla);
        if (p.opciones) { await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`)); await tocar(boton(c, "confirmar")); }
        await tocar(boton(c, "seguir") ?? boton(c, "empezar"));
      }
    };
    await ir("pasos");
    /* Antes de responder, la cadena no está: daría la respuesta. */
    assert.equal(c.querySelectorAll("figure[data-renglones]").length, 0);
    await tocar(c.querySelector('[data-opcion="lista"]'));
    await tocar(boton(c, "confirmar"));
    assert.equal(c.querySelectorAll("figure[data-renglones]").length, 0, "con el error tampoco");
    await tocar(boton(c, "probar-otra"));
    await tocar(c.querySelector('[data-opcion="saldo"]'));
    await tocar(boton(c, "confirmar"));
    const cadena = c.querySelector("figure[data-renglones]");
    assert.equal(cadena.querySelector("figcaption").textContent, "Cadena de descuentos de San Calixto");
    assert.deepEqual(filasDe(cadena), [
      ["", "Precio de lista", "4.200.000", false],
      ["−", "Descuento 5 %", "210.000", false],
      ["=", "Saldo", "3.990.000", true],
      ["−", "Descuento 8 % del saldo", "319.200", false],
      ["=", "Saldo", "3.670.800", true],
      ["−", "Descuento 10 % del saldo", "367.080", false],
      ["=", "Valor a facturar", "3.303.720", true],
    ]);
    assert.ok(cadena.classList.contains("rg-nuevo"));
    await tocar(boton(c, "seguir"));
    const factor = c.querySelector("figure[data-renglones]");
    assert.equal(c.querySelector("[data-pantalla]").dataset.pantalla, "atajo");
    assert.deepEqual(filasDe(factor), [
      ["", "Complementos", "0,95 × 0,92 × 0,90", false],
      ["=", "Factor", "0,7866", true],
      ["×", "Precio de lista", "4.200.000", false],
      ["=", "Valor a facturar", "3.303.720", true],
    ]);
    assert.ok(factor.querySelector("[data-renglon]").classList.contains("rg-apila"));
  } finally {
    m.desmontar();
  }
});
