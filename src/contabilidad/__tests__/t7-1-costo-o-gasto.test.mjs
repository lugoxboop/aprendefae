import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H5 «¿Costo o gasto?» (Célula C) · Hacer.
 *
 *   · las cifras se RECALCULAN aquí, en centavos, desde la mercancía, el
 *     flete y las tarifas, y dan las de Near y sus distractores
 *   · cada texto es el de Near; la corrección 4 manda (error de $10.500,
 *     segunda línea del caso con la ficha, porqué literal del ítem 2)
 *   · ocho ítems, un solo intento cada uno; el par fijo en la parte 1 y las
 *     opciones barajadas en la parte 2; el caso aparece en la parte 2
 *   · evaluativa, medio, 25 FP, en el cliente y en la 0095; después de A5;
 *     la vista lo abre y registra; el panel docente lee cada item_id
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

const D = await import("../../data/contabilidadT7_1_h5.js");
const L = await import("../t7H5.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: CostoOGasto } = await import("../../components/mecanicas/libros/t7/CostoOGasto.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h5-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h5-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0095_t7_1_costo_o_gasto.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

const EN_ORDEN = L.prepararH5((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(CostoOGasto, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H5).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const malaDe = (it) => L.opcionesDeH5(it).find((v) => v !== it.correcta);

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde la mercancía, el flete y las tarifas, y dan las de Near", () => {
  /* Un cálculo propio, en centavos y con las tarifas en milésimas, para no depender de los decimales. */
  const cent = (pesos) => pesos * 100;
  const pct = (base, milesimas) => (cent(base) * milesimas) / 100_000;
  const M = 4_600_000, F = 300_000;
  const R = {
    iva: pct(M, 16_000) / 100, retencion: pct(M, 3_500) / 100, retFlete: pct(F, 1_000) / 100,
  };
  R.pago = F - R.retFlete;
  R.debe = M + R.iva - R.retencion;
  assert.deepEqual([D.MERCANCIA_H5, D.FLETE_H5], [M, F]);
  assert.deepEqual([R.iva, R.retencion, R.retFlete, R.pago, R.debe], [736_000, 161_000, 3_000, 297_000, 5_175_000]);
  const C = D.CIFRAS_H5;
  assert.deepEqual([C.iva, C.retencion, C.retencionFlete, C.pagoTransportadora, C.debeProveedor], [R.iva, R.retencion, R.retFlete, R.pago, R.debe]);
  /* Los distractores, cada uno la confusión que nombra su texto. */
  const it = Object.fromEntries(D.ITEMS_H5.map((x) => [x.id, x]));
  assert.deepEqual(it["retencion-flete"].distractores.map((d) => d.valor), [pct(F, 3_500) / 100, pct(F, 16_000) / 100]);
  assert.deepEqual(it["pago-transportadora"].distractores.map((d) => d.valor), [F + R.retFlete, F]);
  assert.deepEqual(it["debe-proveedor"].distractores.map((d) => d.valor), [M + R.iva, R.debe + F]);
  /* El registro 5c de la v1. */
  assert.ok(V1.includes("4.600.000 · 736.000 · 161.000 · 5.175.000 · 300.000 · 3.000 · 297.000"));
  assert.ok(V1.includes("10.500 · 48.000 · 303.000 · 5.336.000 · 5.475.000"));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const filasDe = (desde) => V1.slice(V1.indexOf(desde)).split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

test("★★★ los textos son los de Near, con la corrección 4 aplicada", () => {
  assert.equal(D.H5_ID, "t7-1-costo-o-gasto");
  assert.ok(V1.includes(`| Etiqueta | «${D.H5.etiqueta}» |`));
  assert.ok(V1.includes(`- Consigna: «${D.H5.consigna}»`));
  assert.ok(V1.includes(`**Pie de toda la actividad:** «${D.H5.pie}»`));
  assert.deepEqual(D.COSTO_O_GASTO.map((o) => o.texto), ["Forma parte del costo de la mercancía", "Es un gasto"]);
  /* El caso: líneas 1 y 3 de la v1; la 2, la de la corrección; la 4, la frase de tarifas de AP2. */
  assert.ok(V1.includes(`- «${D.H5.caso[0]}»`));
  assert.ok(CAMBIOS.includes(`«${D.H5.caso[1]}»`));
  assert.ok(!V1.includes(`- «${D.H5.caso[1]}»`));
  assert.ok(V1.includes(`- «${D.H5.caso[2]}»`));
  assert.ok(leer("src/data/contabilidadT7_1_ap2.js").includes(`"${D.H5.caso[3]}"`));
  /* La ficha: igual a la v1 salvo el monto, que lleva la forma de la corrección. */
  for (const [dato, texto] of D.FICHA_H5) {
    if (dato === "Monto") {
      assert.ok(CAMBIOS.includes("«Monto: $300.000, valor del flete»"));
      assert.equal(texto, "$4.600.000 por la mercancía; $300.000, valor del flete");
    } else assert.ok(V1.includes(`| ${dato} | ${texto} |`), dato);
  }
  /* Parte 1. */
  const p1 = filasDe("## Parte 1");
  for (const [k, it] of D.ITEMS_H5.filter((x) => x.parte === 1).entries()) {
    const [n, hecho, resp, retroCelda, pagina] = p1[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(hecho)[0]);
    assert.equal(it.correcta, resp === "Costo" ? "costo" : "gasto");
    assert.equal(String(it.pagina), pagina);
    if (it.id === "factura-exterior") {
      assert.ok(CAMBIOS.includes(`«${it.porque}»`), "el porqué literal del ítem 2");
      assert.notEqual(it.porque, citas(retroCelda)[0]);
    } else if (it.porque) assert.equal(it.porque, citas(retroCelda)[0]);
    else assert.deepEqual([it.acierto, it.error], citas(retroCelda));
  }
  /* Parte 2. */
  const p2 = filasDe("## Parte 2");
  for (const [k, it] of D.ITEMS_H5.filter((x) => x.parte === 2).entries()) {
    const [n, pregunta, correcta, distractores, acierto] = p2[k];
    assert.equal(n, String(k + 5));
    assert.equal(it.pregunta, citas(pregunta)[0]);
    assert.equal(it.acierto, citas(acierto)[0]);
    const textoCorrecta = typeof it.correcta === "number" ? pesos(it.correcta) : D.CUENTAS_H5.find((c) => c.valor === it.correcta).texto;
    assert.equal(textoCorrecta, correcta);
    const deV1 = citas(distractores);
    for (const [j, d] of it.distractores.entries()) {
      if (it.id === "retencion-flete" && j === 0) {
        assert.ok(CAMBIOS.includes(`«${d.retro}»`), "el error de $10.500 de la corrección");
        assert.notEqual(d.retro, deV1[j]);
      } else assert.equal(d.retro, deV1[j], `${it.id}: ${d.valor}`);
      const nombre = typeof d.valor === "number" ? pesos(d.valor) : D.CUENTAS_H5.find((c) => c.valor === d.valor).texto;
      assert.ok(distractores.includes(`${nombre}: «`), `${it.id}: el distractor ${nombre} no es el de la v1`);
    }
  }
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-caso]") !== null, it.parte === 2, `${it.id}: el caso se ve solo en la parte 2`);
    const v = falla(it.id) ? malaDe(it) : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true, `${it.id}: sigue activa`);
    const ok = v === it.correcta;
    assert.deepEqual(retro(m.caja), L.evaluarH5(it, v).textos, it.id);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: k + 1 });
    await tocar(siguiente(m.caja));
  }
  return detalle;
}

test("★★★ la tanda entera: ocho ítems, un intento cada uno, y el porcentaje es aciertos / 8", async () => {
  const m = await montar();
  try {
    const detalle = await jugar(m, (id) => ["bodegaje", "flete-vendedor", "retencion-flete"].includes(id));
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(pct, (5 / 8) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ el ítem 1 tiene un texto para el acierto y otro para el error; los ítems 2 a 4, un porqué que siempre se ve", () => {
  const [i1, i2] = D.ITEMS_H5;
  assert.deepEqual(L.evaluarH5(i1, "costo").textos, [i1.acierto]);
  assert.deepEqual(L.evaluarH5(i1, "gasto").textos, [i1.error]);
  for (const it of D.ITEMS_H5.slice(1, 4)) for (const v of ["costo", "gasto"]) assert.deepEqual(L.evaluarH5(it, v).textos, [it.porque]);
  assert.equal(i2.porque, "El libro incluye en el costo el valor de la factura.");
});

test("★★ el par fijo en la parte 1; las opciones de la parte 2, barajadas en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const ordenes = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH5(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H5.map((x) => x.id));
    for (const x of p.filter((y) => y.parte === 1)) assert.deepEqual(x.opciones.map((o) => o.valor), ["costo", "gasto"]);
    ordenes.add(p[5].opciones.map((o) => o.valor).join());
  }
  assert.ok(ordenes.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, después de A5: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H5_ID), ids.indexOf("t7-1-a5-importados-y-fletes") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H5_ID).Mecanica, CostoOGasto);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0095: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-1-costo-o-gasto',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H5_ID)), ["0095_t7_1_costo_o_gasto.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 8);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H5_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH5(id)), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-costo-o-gasto": \(id\) => unidadDeH5\(id\),/);
});
