import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A6 «La provisión para inventarios» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, y
 *     nada más
 *   · la ficha es la variante de la regla 10b para I-3, con el sistema
 *     como HUECO; los dos asientos son los de la v1, con los nombres de la
 *     regla 8 (C7-18); no se muestra el saldo de la provisión
 *   · cada pantalla y cada estado muestran sus textos y su pie
 *   · fuera del catálogo de FP; en T7-3, justo después de A5
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

const A = await import("../../data/contabilidadT7_3_a6.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a6-v1.md");
const PLAN = leer("orquestador/conocimiento/paquetes/t7-3-plan-v1.md");
const P = A.PIEZA_LA_PROVISION;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Decisiones")).split("\n").filter((l) => /^\| \d/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| /, "")));

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

test("★★★ cada texto visible de la v1 está en los datos, letra por letra, y nada más", () => {
  const esperados = [];
  for (const [n, texto] of FILAS) {
    if (/Asiento/.test(n) || texto.startsWith("Ficha")) continue;
    for (const c of citas(texto)) esperados.push(c);
  }
  assert.deepEqual([...textosDeDatos()].sort(), [...esperados].sort());
});

test("★★★ la ficha de la regla 10b (I-3), las opciones y los dos asientos son los de la v1", () => {
  const f = FILAS.find((x) => x[1].startsWith("Ficha 10b"))[1];
  const [, quien, prov, perdida, fecha, sistema] = f.match(/quién, (.+?) · provisión estimada (.+?) · pérdida real (.+?) · (.+?) · «Sistema: (.+?)»/);
  assert.deepEqual(pantalla("ejemplo").ficha.map((x) => x.texto.toLowerCase()), [quien, prov, perdida, fecha, sistema].map((x) => x.toLowerCase()));
  assert.ok(PLAN.includes("I-3: quién · provisión estimada · pérdida real · fecha · sistema. Para I-3, el sistema es HUECO"));
  assert.deepEqual(pantalla("ejemplo").ficha.map((x) => x.dato.toLowerCase()), ["quién", "provisión estimada", "pérdida real", "fecha", "sistema"]);
  const lp = pantalla("la-perdida");
  assert.deepEqual(lp.opciones.map((o) => o.texto), FILAS.find((x) => x[1].startsWith("«Llega la pérdida real"))[1].match(/Opciones: (.+)\.$/)[1].split(" · "));
  for (const o of lp.opciones.filter((x) => !x.correcta)) assert.equal(o.devolucion, citas(FILAS.find((x) => x[1].startsWith(`Error (${o.texto})`))[1])[0]);
  const asientos = FILAS.filter((x) => /Asiento/.test(x[0])).map((x) => x[1]);
  const lineas = (t) => [...t.matchAll(/(?:: |· )([^·:]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A1.DEBE : A1.HABER]);
  const [a1, a2] = [pantalla("ejemplo").asientos[0], lp.acierto.asientos[0]];
  assert.deepEqual(a1.lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas(asientos[0]));
  assert.deepEqual(a2.lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas(asientos[1]));
  assert.ok(asientos[0].includes(`Pie: «${pantalla("ejemplo").pie}»`) && asientos[1].includes(`Pie: «${lp.acierto.pie}»`));
  /* No se muestra el saldo que queda en la provisión (520.000 − 230.000). */
  assert.ok(!JSON.stringify(P).includes("290.000") && !JSON.stringify(P).includes("290000"));
  /* C7-18: ni «provisiones para pérdida de inventarios» ni «gasto provisiones» sin su nombre completo. */
  assert.ok(!JSON.stringify(P).includes("pérdida de inventarios"));
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

test("★★★ se recorre entera: cada pantalla y cada estado con sus textos y su pie", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    await tocar(boton(c, "empezar"));
    assert.deepEqual(textos(c), pantalla("que-es").parrafos);
    await tocar(boton(c, "seguir"));
    const ej = pantalla("ejemplo");
    assert.deepEqual(textos(c), [...ej.parrafos, ...ej.ficha.map((f) => f.texto)]);
    assert.equal(c.querySelectorAll("[data-asiento]").length, 1);
    await tocar(boton(c, "seguir"));
    const lp = pantalla("la-perdida");
    assert.deepEqual(textos(c), [lp.pregunta]);
    for (const o of lp.opciones.filter((x) => !x.correcta)) {
      await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(c, "confirmar"));
      assert.deepEqual(textos(c).slice(-1), [o.devolucion]);
      assert.equal(c.querySelector("[data-asiento]") === null, true);
      await tocar(boton(c, "probar-otra"));
    }
    await tocar(c.querySelector('[data-opcion="provision"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-2), [lp.acierto.texto, ...lp.acierto.despues]);
    assert.equal(c.querySelectorAll("[data-asiento]").length, 1);
    await tocar(boton(c, "seguir"));
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    for (const p of P.pantallas) assert.equal(p.pie, "Basado en el libro, p. 256");
    assert.equal(pie(c), r.pie);
  } finally {
    m.desmontar();
  }
});

test("★★★ fuera del catálogo de FP; en T7-3, justo después de A5", () => {
  assert.equal(A.A6_ID, "t7-3-provision-inventarios");
  assert.equal(P.numero, 6);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A6_ID), ids.indexOf("t7-3-sobrantes-y-faltantes") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A6_ID), piezas.indexOf("t7-3-sobrantes-y-faltantes") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A6_ID)), []);
});
