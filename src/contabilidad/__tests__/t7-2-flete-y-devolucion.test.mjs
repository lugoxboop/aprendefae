import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H5 «Flete y devolución» (Célula C) · Hacer.
 *
 *   · las cifras se recalculan en centavos desde el flete, la devolución, el
 *     costo devuelto y las tarifas, y son las de Near; el asiento cuadra
 *   · cada texto es, letra por letra, el de la v1, salvo los que cambia la
 *     tabla de correcciones de Near (Mangle, «asume»): esos son los nuevos
 *   · un solo intento por unidad: los ítems 2 y 5 con casilla de cifra, el
 *     1, el 3 y el 4 con un toque; en el asiento, cada línea elige su cuenta
 *     del banco (la correcta y los dos distractores de Near) y su lado,
 *     «Comprobar» califica las dos líneas una vez, y las sumas aparecen
 *     después (lote 3, «Arma la línea», con T7-3 H1 de molde)
 *   · siete unidades; el porcentaje es aciertos / 7
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0102; la
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

const D = await import("../../data/contabilidadT7_2_h5.js");
const L = await import("../t7_2H5.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: FleteYDevolucion } = await import("../../components/mecanicas/libros/t7/FleteYDevolucion.jsx");
const { JUEGOS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-h5-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_2View.jsx");
const MIGRACION = leer("supabase/migrations/0102_t7_2_flete_y_devolucion.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const item = (id) => D.ITEMS_H5.find((x) => x.id === id);
const C = D.CIFRAS_H5;

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

test("★★★ las cifras se recalculan en centavos desde el flete, la devolución y las tarifas, y son las de Near", () => {
  const de = (base, milesimas) => (base * 100 * milesimas) / 100_000 / 100;
  const retT = de(380_000, 1_000);
  const iva = de(820_000, 16_000);
  const ret = de(820_000, 3_500);
  assert.deepEqual([retT, 380_000 - retT, iva, ret, 820_000 + iva - ret], [3_800, 376_200, 131_200, 28_700, 922_500]);
  assert.deepEqual([C.flete, C.retTransporte, C.pago, C.devolucion, C.iva, C.retencion, C.baja, C.costo], [380_000, retT, 380_000 - retT, 820_000, iva, ret, 820_000 + iva - ret, 490_000]);
  /* Distractores: la tarifa del 3,5 % en el flete; sumar la retención; no restarla. */
  assert.deepEqual(item("pago-a-la-transportadora").distractores.map((d) => d.valor), [380_000 - de(380_000, 3_500), 380_000 + retT]);
  assert.deepEqual(item("pago-a-la-transportadora").distractores.map((d) => d.valor), [366_700, 383_800]);
  assert.deepEqual(item("baja-con-el-proveedor").distractores.map((d) => d.valor), [951_200, 979_900]);
  /* El asiento del ítem 6 cuadra: 490.000 = 490.000, como dice la v1. */
  const ls = item("devolucion-de-ventas").lineas;
  const suma = (l) => ls.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
  assert.equal(suma(DEBE), suma(HABER));
  assert.ok(V1.includes(`Sumas después de comprobar: ${miles(suma(DEBE))} = ${miles(suma(HABER))}.`));
});

test("★★★ regla 3: ninguna cifra del periódico ni de la lista de control", () => {
  /* Las del periódico de T7-1 y X1, y los candidatos que Near descartó por chocar con el OCR (X4 y la v1). */
  const prohibidas = [3_200_000, 512_000, 112_000, 3_600_000, 4_800_000, 768_000, 168_000, 5_400_000, 800_000, 175_000, 5_625_000, 5_800_000, 420_000, 4_200, 415_800, 900_000, 540_000];
  const todo = JSON.stringify(D.ITEMS_H5) + D.H5.enunciado.join(" ") + D.HECHOS_H5.join(" ");
  for (const x of prohibidas) assert.ok(!todo.includes(miles(x)) && !todo.includes(`:${x},`) && !todo.includes(`:${x}}`), miles(x));
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
/* La tabla de correcciones: campo → texto nuevo. */
const CORRECCIONES = Object.fromEntries(V1.split("\n").filter((l) => l.startsWith("H5 · ")).map((l) => {
  const [campo, , nuevo] = l.split("\t");
  return [campo.replace("H5 · ", ""), citas(nuevo)[0]];
}));
const corregido = (campo, v1) => CORRECCIONES[campo] ?? v1;

test("★★★ los textos son los de la v1, letra por letra, con la tabla de correcciones aplicada", () => {
  assert.equal(Object.keys(CORRECCIONES).length, 13);
  assert.ok(V1.includes(`id\t${D.H5_ID}`));
  assert.ok(V1.startsWith(`T7-2 · H5 «${D.H5.nombre}» · versión 1`));
  assert.ok(MAPA.includes(`| 11 | ${D.H5_ID} | ${D.H5.nombre} | Hacer |`));
  assert.ok(V1.includes(`Pie de todos los ítems\t«${D.H5.pie}»`));
  assert.ok(V1.includes(`Subtemas\t${D.SUBTEMAS_H5.join(" · ")}`));
  assert.deepEqual([...new Set(D.ITEMS_H5.map((it) => it.subtema))], D.SUBTEMAS_H5);
  /* Enunciado, tarifas, frase de tarifas (la de A2) y la consigna. */
  const enunciado = V1.slice(V1.indexOf("Enunciado y tarifas\n")).split("\n");
  assert.equal(D.H5.enunciado[0], corregido("enunciado", citas(enunciado[1])[0]));
  assert.equal(D.H5.enunciado[1], citas(enunciado[2])[0]);
  assert.equal(enunciado[3], `Después va la frase de tarifas literal y «${D.H5.consigna}»`);
  assert.ok(leer("src/data/contabilidadT7_2_a2.js").includes(`"${D.H5.enunciado[2]}"`), "la frase de tarifas no es la de A2");
  /* Los cuatro hechos. */
  const hechos = V1.split("\n").filter((l) => /^Hecho \d: «/.test(l)).map((l) => citas(l)[0]);
  assert.equal(hechos.length, 4);
  assert.deepEqual(D.HECHOS_H5, hechos.map((h, k) => corregido(`hecho ${k + 1}`, h)));
  /* Los ítems 1 a 5, fila por fila. */
  const fs = V1.split("\n").filter((l) => /^\d\t/.test(l)).map((l) => l.split("\t"));
  assert.equal(fs.length, 5);
  for (const [k, [n, pregunta, correcta, distractores, acierto]] of fs.entries()) {
    const it = D.ITEMS_H5[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, corregido(`ítem ${n}, pregunta`, citas(pregunta)[0]), it.id);
    assert.equal(it.tipo === "cifra" ? pesos(it.correcta) : it.correcta, correcta, it.id);
    assert.equal(it.acierto, corregido(`ítem ${n}, acierto`, citas(acierto)[0]), it.id);
    const partes = distractores.split(" · ").map((p) => p.match(/^(.+?): «([^»]+)»/));
    assert.deepEqual(it.distractores.map((d) => (it.tipo === "cifra" ? pesos(d.valor) : d.valor)), partes.map((p) => p[1]), it.id);
    for (const [j, d] of it.distractores.entries()) assert.equal(d.retro, corregido(`ítem ${n}, error (${partes[j][1]})`, partes[j][2]), `${it.id}: ${partes[j][1]}`);
  }
  /* El ítem 6: su texto, y cada línea con su cuenta, su valor, su lado y su texto. */
  const i6 = D.ITEMS_H5[5];
  assert.ok(V1.includes(`Ítem 6 (2 aciertos). Texto: «${i6.pregunta}»`));
  const lineas = V1.split("\n").filter((l) => /^[^\t]+ \$[\d.]+\t(Debe|Haber)\t«/.test(l)).map((l) => l.split("\t"));
  assert.deepEqual(i6.lineas.map((l) => [`${l.cuenta} ${pesos(l.valor)}`, l.lado === DEBE ? "Debe" : "Haber", l.retro]), lineas.map(([a, b, c]) => [a, b, citas(c)[0]]));
  /* Las trece correcciones están todas, y ya no queda Ceiba ni «lo paga quien». */
  const todo = JSON.stringify(D);
  for (const [campo, nuevo] of Object.entries(CORRECCIONES)) assert.ok(todo.includes(JSON.stringify(nuevo).slice(1, -1)), campo);
  assert.ok(!todo.includes("Ceiba") && !/lo paga quien|paga el flete/.test(todo));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH5((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(FleteYDevolucion, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
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

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H5.pie);
    /* El hecho, encima de la pregunta, con su encabezado. */
    assert.equal(m.caja.querySelector("[data-hecho]").textContent, D.HECHOS_H5[it.hecho]);
    assert.equal(m.caja.querySelector("[data-encabezado-item]").textContent, `HECHO ${it.hecho + 1}`);
    if (it.tipo === "cifra") {
      /* LOTE 3: casilla de cifra; si falla, escribe el primer distractor de Near y sale su retroalimentación. */
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(m.caja.querySelector("[data-opcion]"), null, "sin opciones que regalen la cifra");
      assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
      await escribir(m.caja, it.id, v);
      await tocar(boton(m.caja, "Comprobar"));
      const ok = v === it.correcta;
      assert.equal(m.caja.querySelector(`[data-campo-cifra="${it.id}"]`).readOnly, true, "un solo intento");
      assert.equal(boton(m.caja, "Comprobar"), undefined);
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH5(it, v).textos);
      if (!ok) assert.deepEqual(L.evaluarH5(it, v).textos, [it.distractores[0].retro, `La respuesta es ${pesos(it.correcta)}.`]);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.deepEqual(it.opciones.map((o) => o.texto), L.opcionesDeH5(it));
      await tocar(opcion(m.caja, v));
      for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH5(it, v).textos);
      if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      /* LOTE 3 · «Arma la línea»: cada línea elige su cuenta del banco (la correcta y dos distractores) y su lado. */
      for (const l of it.lineas) {
        assert.equal(boton(m.caja, "Comprobar").disabled, true, `${it.id}: «Comprobar» antes de tener todas las líneas`);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta]`)].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
        assert.ok(m.caja.querySelector(`[data-linea-cuenta="${l.id}"] [data-valor]`).textContent === pesos(l.valor), "el monto viene dado");
        await tocar(ficha(m.caja, l.id, falla(L.idLineaH5(it, l)) ? l.distractores[0].cuenta : l.cuenta));
        await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(lado(m.caja, l.id, l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, `${it.id}: las sumas antes de comprobar`);
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const ok = !falla(L.idLineaH5(it, l));
        for (const b of m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [l.distractores[0].retro]);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-era]`)].map((p) => p.textContent), ok ? [] : [`Era: ${l.cuenta}, al ${l.lado === DEBE ? "debe" : "haber"}.`]);
        detalle.push({ item: L.idLineaH5(it, l), ok, intentos: 1, respuesta: ok ? null : `${l.distractores[0].cuenta}|${l.lado}`, orden: detalle.length + 1 });
      }
      const suma = pesos(C.costo);
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(`${suma}${suma}`), `${it.id}: las sumas`);
      assert.equal(boton(m.caja, "Comprobar") === undefined, true, "«Comprobar» sigue ahí");
    }
    await tocar(boton(m.caja, k === 5 ? D.BOTON_H5.verResumen : D.BOTON_H5.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: siete unidades, un intento cada una, y el porcentaje es aciertos / 7", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["flete-del-comprador", "baja-con-el-proveedor", "devolucion-de-ventas:costo"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH5());
    assert.equal(L.TOTAL_H5, 7);
    assert.equal(pct, (4 / 7) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones, las líneas y su banco de cuentas se barajan en cada intento; los ítems, no", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH5(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H5.map((x) => x.id));
    a.add(p[0].opciones.map((o) => o.valor).join());
    b.add(p[5].orden.join() + p[5].lineas.map((l) => l.banco.join()).join());
  }
  assert.ok(a.size > 1 && b.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-2, justo después de A6 y al final del tema: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_2, D.H5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H5_ID).nombre, D.H5.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H5_ID), ids.indexOf("t7-2-a6-devoluciones") + 1);
  assert.equal(ids.at(-1), D.H5_ID);
  const nombres = TEMA.actividades.map((a) => a.nombre);
  assert.equal(new Set(nombres).size, nombres.length);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_2.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_2.find((j) => j.id === D.H5_ID).Mecanica, FleteYDevolucion);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_2, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0102: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-2-flete-y-devolucion',\s*'contabilidad',\s*'inventarios-permanente',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-2-flete-y-devolucion';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H5_ID)), ["0102_t7_2_flete_y_devolucion.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0102")), ["0102_t7_2_flete_y_devolucion.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos, y no se repiten", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 7);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H5_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH5(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeH5(id))).size, 7, "dos unidades con la misma etiqueta");
    /* Una elección o una casilla dice de qué hecho es («¿A qué cuenta va este flete?» sola no basta); una línea, su cuenta y su valor. */
    for (const it of D.ITEMS_H5.filter((x) => x.tipo !== "asiento")) assert.equal(L.unidadDeH5(it.id), `Hecho ${it.hecho + 1} · ${it.pregunta}`);
    assert.equal(L.unidadDeH5("devolucion-de-ventas:costo"), "Costo de mercancía vendida $490.000");
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-2-flete-y-devolucion": \(id\) => unidadDeT72H5\(id\),/);
});

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA», LA CASILLA Y EL DISTINTIVO ═══════════ */

const NEAR = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md"));
/* Las filas de Near de esta pieza: asiento, cuenta correcta, lado, distractor y su retroalimentación. */
const filasNear = () => {
  const seccion = NEAR.slice(NEAR.indexOf("### T7-2 H5 · `t7-2-flete-y-devolucion`"), NEAR.indexOf("### T7-3 H4"));
  return seccion.split("\n").map((l) => l.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · \$([\d.]+) \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean)
    .map(([, asiento, cuenta, l, valor, distractor, retro]) => ({ asiento, cuenta, lado: l === "D" ? DEBE : HABER, valor: Number(valor.replace(/\./g, "")), distractor, retro }));
};

test("★★★ lote 3: los ítems 2 y 5 van con casilla; el 1, el 3 y el 4 se quedan en elección; el asiento, con banco de cuentas", () => {
  assert.deepEqual(D.ITEMS_H5.map((x) => x.tipo), ["eleccion", "cifra", "eleccion", "eleccion", "cifra", "asiento"]);
  assert.ok(D.ITEMS_H5.every((x) => !("cifra" in x)), "la marca vieja «cifra: true» ya no hace falta");
  for (const l of item("devolucion-de-ventas").lineas) {
    assert.equal(l.distractores.length, 2, l.id);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), l.id);
    assert.equal(new Set(l.distractores.map((d) => d.cuenta)).size, 2, l.id);
  }
  /* El banco de cada línea: las tres cuentas, barajadas. */
  const p = L.prepararH5((xs) => [...xs].reverse());
  for (const l of p[5].lineas) assert.deepEqual(l.banco, [l.cuenta, ...l.distractores.map((d) => d.cuenta)].reverse());
  /* Las casillas no traen opciones; las elecciones de cuenta, sí. */
  assert.deepEqual(p.map((x) => Boolean(x.opciones)), [true, false, true, true, false, false]);
  /* Una cifra que no es de ningún distractor: la respuesta y el porqué del acierto, sin «Así es:». */
  assert.deepEqual(L.evaluarH5(item("pago-a-la-transportadora"), 1), { ok: false, correcta: 376_200, textos: ["La respuesta es $376.200.", "$380.000 − $3.800 = $376.200."], textoCorrecta: "$376.200" });
  assert.deepEqual(L.evaluarH5(item("baja-con-el-proveedor"), 1).textos, ["La respuesta es $922.500.", "$820.000 + $131.200 − $28.700 = $922.500."]);
  assert.deepEqual(L.evaluarH5(item("baja-con-el-proveedor"), 979_900).textos, [item("baja-con-el-proveedor").distractores[1].retro, "La respuesta es $922.500."]);
  /* La elección de cuenta sigue diciendo su respuesta por su nombre. */
  assert.equal(L.evaluarH5(item("flete-del-comprador"), "Compras").textoCorrecta, "Inventario de mercancías (fletes)");
});

test("★★★ lote 3: los distractores de cada línea son los de Near, letra por letra y en su orden", () => {
  const fs = filasNear();
  assert.equal(fs.length, 4);
  const it = item("devolucion-de-ventas");
  for (const l of it.lineas) {
    const deNear = fs.filter((f) => f.asiento === it.id && f.cuenta === l.cuenta && f.lado === l.lado);
    assert.ok(deNear.every((f) => f.valor === l.valor), `${l.cuenta}: el valor de Near`);
    assert.deepEqual(l.distractores, deNear.map((f) => ({ cuenta: f.distractor, retro: f.retro })), l.cuenta);
  }
});

test("★★★ lote 3: si la cuenta es la buena y falla el lado, sale la retroalimentación de la línea", async () => {
  const m = await montar();
  try {
    for (const it of EN_ORDEN.slice(0, 5)) {
      if (it.tipo === "cifra") { await escribir(m.caja, it.id, it.correcta); await tocar(boton(m.caja, "Comprobar")); }
      else await tocar(opcion(m.caja, it.correcta));
      await tocar(boton(m.caja, D.BOTON_H5.siguiente));
    }
    const it = EN_ORDEN[5];
    for (const l of it.lineas) {
      await tocar(ficha(m.caja, l.id, l.cuenta));
      await tocar(lado(m.caja, l.id, l.id === "costo" ? otro(l.lado) : l.lado));
    }
    await tocar(boton(m.caja, "Comprobar"));
    for (const l of it.lineas) assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), l.id === "costo" ? [item("devolucion-de-ventas").lineas.find((x) => x.id === l.id).retro] : []);
  } finally {
    m.desmontar();
  }
});
