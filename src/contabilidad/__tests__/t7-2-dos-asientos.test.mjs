import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";
import { PARCHES, parchado } from "./correccionesMelloRecortesT72.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H2 «Arma los dos asientos» (Célula C) · Hacer.
 *
 *   · las cifras se recalculan desde la venta, el costo y las tarifas, y
 *     son las de Near; los dos asientos cuadran
 *   · cada texto es, letra por letra, el de la v1; el nombre es el que
 *     decidió L, no el de la v1 (que es el de A2)
 *   · un solo intento por unidad: el ítem 1 con casilla de cifra, el 3 con
 *     un toque; en cada asiento, cada línea elige su cuenta del banco (la
 *     correcta y los dos distractores de Near) y su lado, «Comprobar»
 *     califica todas las líneas una vez, y las sumas aparecen después
 *     (lote 3, «Arma la línea», con T7-3 H1 de molde)
 *   · ocho unidades; el porcentaje es aciertos / 8
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0099; la
 *     vista lo abre y registra con el motor; el panel docente lee cada unidad
 *   · regla 3: ninguna cifra del periódico
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

const D = await import("../../data/contabilidadT7_2_h2.js");
const { FRASE_TARIFAS } = await import("../../data/contabilidadT7_3.js");
const L = await import("../t7_2H2.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ArmaLosDosAsientos } = await import("../../components/mecanicas/libros/t7/ArmaLosDosAsientos.jsx");
const { JUEGOS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-h2-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_2View.jsx");
const MIGRACION = leer("supabase/migrations/0099_t7_2_dos_asientos.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const EN_ORDEN = L.prepararH2((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ArmaLosDosAsientos, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));
const ficha = (caja, lineaId, cuenta) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] [data-ficha-cuenta]`)].find((b) => b.dataset.fichaCuenta === cuenta);
/* Escribe en la casilla de cifra como lo haría el teclado: el valor con su punto de miles. */
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(i.value, miles(valor));
};
const otro = (l) => (l === DEBE ? HABER : DEBE);
const item = (id) => D.ITEMS_H2.find((x) => x.id === id);

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde la venta, el costo y las tarifas, y son las de Near", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const iva = de(5_600_000, 16_000);
  const ret = de(5_600_000, 3_500);
  const cliente = 5_600_000 + iva - ret;
  assert.deepEqual([iva, ret, cliente], [896_000, 196_000, 6_300_000]);
  const C = D.CIFRAS_H2;
  assert.deepEqual([C.venta, C.costo, C.iva, C.retencion, C.cliente, C.sumas], [5_600_000, 3_780_000, iva, ret, cliente, 5_600_000 + iva]);
  /* El registro 5c de la v1 trae todas las que se ven. */
  const registro = V1.slice(V1.indexOf("Registro 5c")).split("\n")[2];
  for (const x of [C.venta, C.costo, C.iva, C.retencion, C.cliente, C.sumas, C.venta + C.iva + C.retencion]) assert.ok(registro.includes(miles(x)), miles(x));
  /* Distractores: sumar la retención, no restarla; el precio de venta y lo que debe el cliente. */
  assert.deepEqual(item("debe-cliente").distractores.map((d) => d.valor), [5_600_000 + iva + ret, 5_600_000 + iva]);
  assert.deepEqual(item("valor-del-costo").distractores.map((d) => d.valor), [5_600_000, cliente]);
  /* Los dos asientos cuadran; el primero suma 6.496.000, el segundo 3.780.000. */
  const suma = (ls, l) => ls.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
  for (const id of ["primer-asiento", "asiento-del-costo"]) assert.equal(suma(item(id).lineas, DEBE), suma(item(id).lineas, HABER), id);
  assert.equal(suma(item("primer-asiento").lineas, DEBE), 6_496_000);
  assert.equal(suma(item("asiento-del-costo").lineas, DEBE), 3_780_000);
});

test("★★★ regla 3: ninguna cifra del periódico ni de la lista de control", () => {
  /* Las cifras del periódico que usa T7-1 (AP2, H2) y las de X1 de A2. */
  const prohibidas = [3_200_000, 512_000, 112_000, 3_600_000, 4_800_000, 768_000, 168_000, 5_400_000, 800_000, 175_000, 5_625_000, 5_800_000];
  const todo = JSON.stringify(D.ITEMS_H2) + D.H2.enunciado.join(" ");
  for (const x of prohibidas) assert.ok(!todo.includes(miles(x)) && !D.ITEMS_H2.some((it) => it.correcta === x || it.distractores?.some((d) => d.valor === x) || it.lineas?.some((l) => l.valor === x)), miles(x));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const filas = () => V1.split("\n").filter((l) => /^\d\t/.test(l)).map((l) => l.split("\t"));
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

test("★★★ los textos son los de la v1, letra por letra; el nombre, el que decidió L", () => {
  assert.equal(D.H2_ID, "t7-2-dos-asientos");
  assert.ok(V1.includes(`id\t${D.H2_ID}`));
  /* La v1 la llama como A2; L la renombró, y el mapa lo dice. */
  assert.ok(V1.startsWith("T7-2 · H2 «La venta en dos asientos»"));
  assert.equal(D.H2.nombre, "Arma los dos asientos");
  assert.ok(MAPA.includes(`| 4 | ${D.H2_ID} | ${D.H2.nombre} | Hacer |`));
  assert.ok(V1.includes(`«${D.H2.consigna}»`));
  assert.ok(V1.includes(`«${D.H2.enunciado[0]}»`));
  assert.ok(V1.includes(`Tarifas: «${D.H2.enunciado[1]}» Después, la frase de tarifas literal.`));
  /* La frase de tarifas literal: la de la célula (A2 la dejó con su recorte: ya no da tarifas). */
  assert.equal(D.H2.enunciado[2], FRASE_TARIFAS, "la frase de tarifas no es la de la célula");
  assert.ok(V1.includes("Ficha: recibe un cliente · entrega El Arrayán · $5.600.000 la venta, $3.780.000 el costo · a crédito · venta de mercancía."));
  const ficha = Object.fromEntries(D.FICHA_H2);
  /* El Monto, con el parche de la entrega 6 de Near (Mello lo da por bueno): la ficha no dice cuál cifra es cuál. */
  assert.equal(PARCHES.h2Monto.viejo, "$5.600.000 la venta, $3.780.000 el costo");
  assert.deepEqual([ficha["Quién recibe"], ficha["Quién entrega"], ficha.Monto, ficha.Tipo, ficha["Clase de hecho"]], ["Un cliente", "El Arrayán", parchado(PARCHES.h2Monto.viejo), "A crédito", "Venta de mercancía"]);
  assert.equal(ficha.Monto, "$5.600.000 y $3.780.000");
  assert.ok(V1.includes(`Pie de todos los ítems: «${D.H2.pie}».`));
  assert.ok(V1.includes(`Subtemas\t${D.SUBTEMAS_H2.join(" · ")}`));
  assert.deepEqual(D.ITEMS_H2.map((it) => it.subtema), D.SUBTEMAS_H2);
  const fs = filas();
  assert.equal(fs.length, 4);
  for (const [k, it] of D.ITEMS_H2.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    if (it.tipo !== "asiento") {
      assert.equal(pesos(it.correcta), correcta, it.id);
      assert.equal(it.acierto, citas(acierto)[0], it.id);
      const deV1 = citas(distractores);
      for (const [j, d] of it.distractores.entries()) {
        assert.equal(d.retro, deV1[j], `${it.id}: ${d.valor}`);
        assert.ok(distractores.includes(`${pesos(d.valor)}: «${d.retro}»`), `${it.id}: el distractor ${pesos(d.valor)}`);
      }
    } else {
      const lineasV1 = [...pregunta.matchAll(/(?:: |· )([^:·$]+?) \$([\d.]+) → (Debe|Haber)/g)].map((m) => [m[1], Number(m[2].replace(/\./g, "")), m[3] === "Debe" ? DEBE : HABER]);
      assert.deepEqual(it.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineasV1, it.id);
      /* La del costo, con el parche de la entrega 6 (ya no es circular). */
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores).map(parchado), `${it.id}: un texto por línea`);
    }
  }
  assert.ok(fs[1][4].includes(`sumas de ${miles(D.CIFRAS_H2.sumas)} = ${miles(D.CIFRAS_H2.sumas)}`));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H2.pie);
    if (it.tipo === "cifra") {
      /* LOTE 3: casilla de cifra; si falla, escribe el primer distractor de Near y sale su retroalimentación. */
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
      await escribir(m.caja, it.id, v);
      await tocar(boton(m.caja, "Comprobar"));
      const ok = v === it.correcta;
      assert.equal(m.caja.querySelector(`[data-campo-cifra="${it.id}"]`).readOnly, true, "un solo intento");
      assert.equal(boton(m.caja, "Comprobar"), undefined);
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH2(it, v).textos);
      if (!ok) assert.deepEqual(L.evaluarH2(it, v).textos, [it.distractores[0].retro, `La respuesta es ${pesos(it.correcta)}.`]);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH2(it, v).textos);
      if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      /* LOTE 3 · «Arma la línea»: cada línea elige su cuenta del banco (la correcta y dos distractores) y su lado. */
      for (const l of it.lineas) {
        assert.equal(boton(m.caja, "Comprobar").disabled, true, `${it.id}: «Comprobar» antes de tener todas las líneas`);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta]`)].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
        assert.ok(m.caja.querySelector(`[data-linea-cuenta="${l.id}"] [data-valor]`).textContent === pesos(l.valor), "el monto viene dado");
        await tocar(ficha(m.caja, l.id, falla(L.idLineaH2(it, l)) ? l.distractores[0].cuenta : l.cuenta));
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, `${it.id}: las sumas antes de comprobar`);
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH2(it, l));
        for (const b of m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.distractores[0].retro]);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-era]`)].map((p) => p.textContent), ok ? [] : [`Era: ${l.cuenta}, al ${l.lado === DEBE ? "debe" : "haber"}.`]);
        detalle.push({ item: L.idLineaH2(it, l), ok, intentos: 1, respuesta: ok ? null : `${l.distractores[0].cuenta}|${l.lado}`, orden: detalle.length + 1 });
      }
      const suma = pesos(it.lineas.filter((l) => l.lado === DEBE).reduce((s, l) => s + l.valor, 0));
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${suma}${suma}`), `${it.id}: las sumas`);
      assert.equal(boton(m.caja, "Comprobar") === undefined, true, "«Comprobar» sigue ahí");
    }
    await tocar(boton(m.caja, k === 3 ? D.BOTON_H2.verResumen : D.BOTON_H2.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: ocho unidades, un intento cada una, y el porcentaje es aciertos / 8", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["debe-cliente", "primer-asiento:anticipo", "asiento-del-costo:inventario"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH2());
    assert.equal(L.TOTAL_H2, 8);
    assert.equal(pct, (5 / 8) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones, las líneas y su banco de cuentas se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set(); const c = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH2(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H2.map((x) => x.id));
    a.add(p[2].opciones.map((o) => o.valor).join());
    b.add(p[1].orden.join() + p[1].lineas.map((l) => l.banco.join()).join());
    c.add(p[3].orden.join() + p[3].lineas.map((l) => l.banco.join()).join());
  }
  assert.ok(a.size > 1 && b.size > 1 && c.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-2, justo después de A2: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_2, D.H2_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H2_ID).nombre, D.H2.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H2_ID), ids.indexOf("t7-2-a2-la-venta-en-dos-asientos") + 1);
  /* Ningún nombre repetido en el tema. */
  const nombres = TEMA.actividades.map((a) => a.nombre);
  assert.equal(new Set(nombres).size, nombres.length);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_2.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_2.find((j) => j.id === D.H2_ID).Mecanica, ArmaLosDosAsientos);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_2, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0099: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-2-dos-asientos',\s*'contabilidad',\s*'inventarios-permanente',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-2-dos-asientos';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H2_ID)), ["0099_t7_2_dos_asientos.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0099")), ["0099_t7_2_dos_asientos.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 8);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H2_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH2(id)), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-2-dos-asientos": \(id\) => unidadDeT72H2\(id\),/);
});

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA», LA CASILLA Y EL DISTINTIVO ═══════════ */

const NEAR = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md"));
/* Las filas de Near de esta pieza: asiento, cuenta correcta, lado, distractor y su retroalimentación. */
const filasNear = () => {
  const seccion = NEAR.slice(NEAR.indexOf("### T7-2 H2 · `t7-2-dos-asientos`"), NEAR.indexOf("### T7-2 H5"));
  return seccion.split("\n").map((l) => l.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · \$([\d.]+) \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean)
    .map(([, asiento, cuenta, l, valor, distractor, retro]) => ({ asiento, cuenta, lado: l === "D" ? DEBE : HABER, valor: Number(valor.replace(/\./g, "")), distractor, retro }));
};

test("★★★ lote 3: el ítem 1 va con casilla; el 3 se queda en elección; cada línea, con banco de cuentas (la correcta y 2 distractores)", () => {
  assert.deepEqual(D.ITEMS_H2.map((x) => x.tipo), ["cifra", "asiento", "eleccion", "asiento"]);
  for (const it of D.ITEMS_H2.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    assert.equal(l.distractores.length, 2, l.id);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), l.id);
    assert.equal(new Set(l.distractores.map((d) => d.cuenta)).size, 2, l.id);
  }
  /* El banco de cada línea: las tres cuentas, barajadas. */
  const p = L.prepararH2((xs) => [...xs].reverse());
  for (const k of [1, 3]) for (const l of p[k].lineas) assert.deepEqual(l.banco, [l.cuenta, ...l.distractores.map((d) => d.cuenta)].reverse());
  /* El ítem 1 sigue con su correcta, su acierto y sus distractores de valor (la v1 lo compara letra por letra). */
  const i1 = item("debe-cliente");
  assert.equal(i1.correcta, 6_300_000);
  assert.ok(String(i1.correcta).length <= 7, "la casilla no pide más de 7 dígitos");
  /* Una cifra que no es de ningún distractor: la respuesta y el porqué del acierto, sin «Así es:». */
  assert.deepEqual(L.evaluarH2(i1, 1), { ok: false, correcta: 6_300_000, textos: ["La respuesta es $6.300.000.", "$5.600.000 + $896.000 − $196.000 = $6.300.000."], textoCorrecta: "$6.300.000" });
  assert.deepEqual(L.evaluarH2(i1, i1.distractores[1].valor).textos, [i1.distractores[1].retro, "La respuesta es $6.300.000."]);
  assert.equal(L.unidadDeH2("debe-cliente"), i1.pregunta);
});

test("★★★ lote 3: los distractores de cada línea son los de Near, letra por letra y en su orden", () => {
  const fs = filasNear();
  assert.equal(fs.length, 12);
  const lineas = D.ITEMS_H2.filter((x) => x.tipo === "asiento").flatMap((it) => it.lineas.map((l) => ({ it, l })));
  assert.equal(lineas.length * 2, fs.length);
  for (const { it, l } of lineas) {
    const deNear = fs.filter((f) => f.asiento === it.id && f.cuenta === l.cuenta && f.lado === l.lado);
    assert.ok(deNear.every((f) => f.valor === l.valor), `${it.id} · ${l.cuenta}: el valor de Near`);
    assert.deepEqual(l.distractores, deNear.map((f) => ({ cuenta: f.distractor, retro: f.retro })), `${it.id} · ${l.cuenta}`);
  }
});

test("★★★ lote 3: si la cuenta es la buena y falla el lado, sale la retroalimentación de la línea", async () => {
  const m = await montar();
  try {
    await escribir(m.caja, "debe-cliente", 6_300_000);
    await tocar(boton(m.caja, "Comprobar"));
    await tocar(boton(m.caja, D.BOTON_H2.siguiente));
    const it = EN_ORDEN[1];
    for (const l of it.lineas) {
      await tocar(ficha(m.caja, l.id, l.cuenta));
      await tocar(lado(m.caja, l.id, l.id === "iva" ? otro(l.lado) : l.lado));
    }
    await tocar(boton(m.caja, "Comprobar"));
    for (const l of it.lineas) assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), l.id === "iva" ? [item("primer-asiento").lineas.find((x) => x.id === l.id).retro] : []);
  } finally {
    m.desmontar();
  }
});
