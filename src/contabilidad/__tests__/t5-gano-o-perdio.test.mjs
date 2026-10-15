import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 «¿Ganó o perdió?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1 de Near
 *   · las cifras salen de las acciones, el precio y las dos ventas, y son
 *     las del registro de T5; la venta va por el costo
 *   · los nombres de cuenta son los de B, con raya –
 *   · un solo intento por unidad; once unidades; el porcentaje es aciertos / 11
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0113; en T5
 *     justo después de N4; la vista lo abre; el panel docente lee cada unidad
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT5_n5.js");
const L = await import("../t5N5.js");
const B = await import("../../data/contabilidadT5Pieza2.js");
const { barajar } = await import("../../utils/barajar.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: GanoOPerdio } = await import("../../components/mecanicas/libros/t5/GanoOPerdio.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t5-n5-v1.md");
const REGISTRO = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
const MIGRACION = leer("supabase/migrations/0113_t5_gano_o_perdio.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const FILAS = V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.replace(/^\| | \|$/g, "").split(" | "));
const numero = (t) => Number(t.replace(/[$.\s]/g, ""));
/* «$4.590.000: «retro» (85,8) · $1.890.000: «retro»» o «Perdió $165.000: «retro» (74,0) · …» → [[rótulo, retro], …]. */
const distractores = (celda) => [...celda.matchAll(/(?:^| · )([^«·]+?): «([^»]+)»/g)].map((m) => [m[1].trim(), m[2]]);
const it = (id) => D.ITEMS_N5.find((x) => x.id === id);

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ el enunciado y el pie son los de la v1, letra por letra", () => {
  assert.ok(V1.startsWith(`**T5 · N5 «${D.N5.nombre}» · versión 1.**`));
  assert.ok(V1.includes(`id \`${D.N5_ID}\``));
  assert.ok(V1.includes("Migración **0113**"));
  const en = V1.slice(V1.indexOf("## Enunciado"), V1.indexOf("- **Ficha:**")).split("\n").filter((l) => l.startsWith("- «"));
  assert.deepEqual(D.N5.enunciado, en.map((l) => citas(l)[0]));
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.N5.pie}».`));
});

test("★★★ los siete ítems son los de la v1: pregunta, correcta, distractores con su retroalimentación y acierto", () => {
  assert.equal(FILAS.length, 7);
  for (const [k, [n, pregunta, correcta, malas, acierto]] of FILAS.entries()) {
    const x = D.ITEMS_N5[k];
    assert.equal(n, String(k + 1));
    assert.equal(x.pregunta, citas(pregunta)[0], x.id);
    if (x.tipo === "asiento") {
      const lineas = correcta.split(" · ").map((c) => c.match(/^(.+) \$([\d.]+) → ([DH])$/));
      assert.deepEqual(x.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineas.map((m) => [m[1], numero(m[2]), m[3] === "D" ? "debe" : "haber"]));
      assert.deepEqual(x.lineas.map((l) => l.retro), citas(malas));
      const suma = x.lineas.filter((l) => l.lado === "debe").reduce((a, l) => a + l.valor, 0);
      assert.equal(suma, x.lineas.filter((l) => l.lado === "haber").reduce((a, l) => a + l.valor, 0));
      assert.equal(acierto, `Sumas: ${pesos(suma).slice(1)} = ${pesos(suma).slice(1)}`);
      continue;
    }
    assert.equal(x.acierto, citas(acierto)[0], x.id);
    const texto = (v) => (x.pesos ? pesos(v) : v);
    assert.equal(texto(x.correcta), correcta, x.id);
    assert.deepEqual(x.distractores.map((d) => [texto(d.valor), d.retro]), distractores(malas), x.id);
  }
});

test("★★★ cuentas de B con raya –; venta por el costo; nada interno sale en pantalla", () => {
  const E = B.ESCENA_T5_A2;
  const cuentas = new Set(D.ITEMS_N5.flatMap((x) => (x.lineas ?? []).map((l) => l.cuenta)));
  assert.deepEqual([...cuentas].sort(), ["Caja", E.inversiones, E.ganancia, E.perdida].sort());
  for (const c of [E.inversiones, E.ganancia, E.perdida]) assert.ok(c.includes(" – "), c);
  /* La inversión sale por el costo, en las dos ventas. */
  const C = D.CIFRAS_N5;
  assert.equal(it("asiento-con-ganancia").lineas.find((l) => l.id === "inversiones").valor, C.costo1);
  assert.equal(it("asiento-con-perdida").lineas.find((l) => l.id === "inversiones").valor, C.costo2);
  assert.equal(it("sale-por").correcta, C.costo1);
  const visibles = [...D.N5.enunciado, ...D.ITEMS_N5.flatMap((x) => [x.pregunta, x.acierto ?? "", ...(x.distractores ?? []).map((d) => d.retro), ...(x.lineas ?? []).flatMap((l) => [l.cuenta, l.retro])])].join("\n");
  assert.doesNotMatch(visibles, /Ingreso financieros|Gasto financieros|activos financieros -|dividendo|interés/i);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "INFLESZ", "C5-", "hueco"]) assert.ok(!visibles.includes(interno), interno);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ las cifras salen del cálculo y son las del registro de T5", () => {
  assert.deepEqual(D.calcularN5(), {
    inversion: 4_590_000, quedan: 350, recibe1: 2_970_000, costo1: 2_805_000, ganancia: 165_000,
    recibe2: 1_540_000, costo2: 1_785_000, perdida: 245_000, lasQueQuedan: 1_890_000, gananciaDeLas900: 270_000,
  });
  const reg = new Set(REGISTRO.construidas.filter((r) => r.pieza === D.N5_ID).map((r) => r.cifra));
  for (const v of Object.values(D.CIFRAS_N5)) assert.ok(reg.has(v), `${v} no está en el registro`);
  for (const v of [D.ACCIONES_N5, D.PRECIO_N5, D.VENTA1_N5.acciones, D.VENTA1_N5.precio, D.VENTA2_N5.precio]) assert.ok(reg.has(v), String(v));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararN5((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(GanoOPerdio, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const opcion = (caja, v) => [...caja.querySelectorAll("[data-opcion]")].find((x) => x.dataset.opcion === String(v))?.querySelector("button");

test("★★★ la tanda entera: once unidades, un intento cada una, y el porcentaje es aciertos / 11", async () => {
  const m = await montar();
  try {
    for (const p of D.N5.enunciado) assert.ok(m.caja.textContent.includes(p), p);
    let bien = 0;
    const textos = (sel) => [...m.caja.querySelectorAll(sel)].map((x) => x.textContent);
    for (const [k, x] of EN_ORDEN.entries()) {
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, x.pregunta, `orden: el ítem ${k + 1}`);
      assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.N5.pie);
      if (x.tipo === "eleccion") {
        /* Falla el ítem 3 con «Perdió $165.000»; acierta los demás. */
        const v = x.id === "gano-o-perdio-1" ? x.distractores[0].valor : x.correcta;
        await tocar(opcion(m.caja, v));
        const ok = v === x.correcta;
        if (ok) bien += 1;
        assert.deepEqual(textos("[data-retro] [data-texto-retro]"), [ok ? x.acierto : x.distractores[0].retro]);
      } else {
        const lado = { debe: "Debe", haber: "Haber" };
        for (const l of x.lineas) {
          const fila = [...m.caja.querySelectorAll("[data-linea]")].find((f) => f.textContent.includes(l.cuenta));
          assert.ok(fila, `no está la línea ${l.cuenta}`);
          await tocar([...fila.querySelectorAll("button")].find((b) => b.textContent === lado[l.lado]));
        }
        await tocar(boton(m.caja, "Comprobar"));
        bien += x.lineas.length;
      }
      await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_N5.verResumen : D.BOTON_N5.siguiente));
    }
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det.map((d) => d.item), L.unidadesN5());
    assert.equal(L.TOTAL_N5, 11);
    assert.equal(bien, 10);
    assert.equal(pct, (10 / 11) * 100);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenN5(10, 11));
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones y las líneas se barajan", () => {
  const vistos = new Set();
  for (let i = 0; i < 40; i++) vistos.add(JSON.stringify(L.prepararN5(barajar).map((x) => x.opciones?.map((o) => o.valor) ?? x.orden)));
  assert.ok(vistos.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 justo después de N4 y antes del cierre de B (decisión de corte, punto 6): evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N5_ID).nombre, D.N5.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.N5_ID), ids.indexOf("t5-el-interes-del-periodo") + 1);
  assert.equal(ids.indexOf("b5-t5-a2"), ids.indexOf(D.N5_ID) + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N5_ID).Mecanica, GanoOPerdio);
});

test("★★★ la 0113: la que da la decisión de corte, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t5-gano-o-perdio',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-gano-o-perdio';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N5_ID)), ["0113_t5_gano_o_perdio.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0113")), ["0113_t5_gano_o_perdio.sql"]);
});

test("★★★ el panel docente: cada unidad tiene etiqueta, leída de los datos, y ninguna se repite", () => {
  const ids = L.unidadesN5();
  assert.equal(ids.length, 11);
  for (const id of ids) {
    const e = etiquetaDeItem(D.N5_ID, id);
    assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
    assert.equal(e, recortar(L.unidadDeN5(id)), id);
  }
  /* Los ítems 5 y 7 tienen la misma pregunta, pero son asientos: sus líneas se leen por cuenta y valor, distintos. */
  assert.equal(new Set(ids.map((id) => L.unidadDeN5(id))).size, 11);
});
