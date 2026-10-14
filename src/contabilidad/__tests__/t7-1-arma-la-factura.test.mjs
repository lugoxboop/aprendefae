import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H2 «Arma la factura» (Célula C) · Hacer.
 *
 *   · cada texto y cada cifra es, letra por letra, el de Near; donde la
 *     corrección 1 cambia un texto (error de $112.000 del ítem 1), manda la
 *     nueva y la vieja ya no aparece
 *   · las cifras se calculan con las tarifas del enunciado y dan las de Near;
 *     las sumas del asiento cuadran
 *   · doce unidades, un solo intento por unidad (patrón v3.2): al tocar, se
 *     bloquea; un segundo toque no cambia nada; el detalle anota un intento
 *   · sin arrastre: lo que se responde en un ítem no cambia los siguientes
 *   · los ítems en el orden de la tabla; las opciones y las líneas, barajadas
 *   · el asiento completo, con sus sumas, solo con las cuatro líneas puestas
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0092 (aditiva,
 *     repetible, del rango de la Célula C); justo después de AP2; la vista lo
 *     abre desde el camino y registra con el motor compartido; el panel
 *     docente lee cada unidad
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

const D = await import("../../data/contabilidadT7_1_h2.js");
const L = await import("../t7H2.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ArmaLaFactura } = await import("../../components/mecanicas/libros/t7/ArmaLaFactura.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h2-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h2-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0092_t7_1_arma_la_factura.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

/* Sin barajar: las opciones y las líneas en el orden de los datos. */
const EN_ORDEN = L.prepararH2((xs) => [...xs]);

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ArmaLaFactura, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const lado = (caja, lineaId, ladoId) =>
  [...caja.querySelectorAll(`[data-linea="${lineaId}"] button`)].find((b) => b.textContent === D.LADOS_H2[ladoId]);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H2).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const otro = (l) => (l === DEBE ? HABER : DEBE);
const cifra = (s) => Number(s.replace(/[$.]/g, ""));

/* ═══════════ 1 · TEXTOS Y CIFRAS CONTRA NEAR ═══════════ */

test("★★★ nombre, id, etiqueta, consigna, enunciado y pie son los de la v1, letra por letra", () => {
  assert.equal(D.H2_ID, "t7-1-arma-la-factura");
  assert.ok(V1.includes(`| id | \`${D.H2_ID}\` |`));
  assert.ok(V1.includes(`**T7-1 · H2 «${D.H2.nombre}»`));
  assert.ok(V1.includes(`| Etiqueta del panel docente | «${D.H2.etiqueta}» |`));
  assert.ok(V1.includes(`- «${D.H2.consigna}»`), "consigna");
  for (const p of D.H2.enunciado) assert.ok(V1.includes(`- «${p}»`), p);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H2.pie}»`));
});

test("★★ las fichas de los cinco datos son la tabla de la v1", () => {
  for (const [k, campo] of D.FICHAS_H2.campos.entries()) {
    assert.ok(V1.includes(`| ${campo} | ${D.FICHAS_H2.compra.valores[k]} | ${D.FICHAS_H2.venta.valores[k]} |`), campo);
  }
});

/* La tabla de ítems de la v1, fila por fila. */
function filasV1() {
  const lineas = V1.slice(V1.indexOf("## Ítems")).split("\n").filter((l) => /^\| \d \|/.test(l));
  return lineas.map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
}
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

test("★★★ cada ítem es el de la v1, con la corrección 1 aplicada: manda la más nueva", () => {
  const filas = filasV1();
  assert.equal(filas.length, 6);
  assert.equal(D.ITEMS_H2.length, 6);
  for (const [k, it] of D.ITEMS_H2.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = filas[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], `${it.id}: pregunta`);
    if (it.tipo === "calculo") {
      assert.equal(pesos(it.correcta), correcta, `${it.id}: correcta`);
      assert.equal(it.acierto, citas(acierto)[0], `${it.id}: acierto`);
      const deV1 = [...distractores.matchAll(/(\$[\d.]+): «([^»]+)»/g)].map((m) => ({ valor: cifra(m[1]), retro: m[2] }));
      assert.deepEqual(it.distractores.map((d) => d.valor), deV1.map((d) => d.valor), `${it.id}: distractores`);
      for (const [j, d] of it.distractores.entries()) {
        if (it.id === "iva-compra" && d.valor === 112_000) {
          assert.notEqual(d.retro, deV1[j].retro, "el error de $112.000 sigue con el texto de la v1");
          assert.ok(CAMBIOS.includes(`«${d.retro}»`), "el texto nuevo del error de $112.000 no está en la corrección 1");
          assert.doesNotMatch(d.retro, /\$|\d{3}\.\d{3}/, "el error de $112.000 ya no dice qué cifra es");
        } else {
          assert.equal(d.retro, deV1[j].retro, `${it.id}: retro de ${d.valor}`);
        }
      }
    } else {
      assert.equal(correcta, "—");
      const lineas = [...pregunta.matchAll(/(?:: |· )([^:·]+?) (\$[\d.]+) → (Debe|Haber)/g)].map((m) => ({ cuenta: m[1], valor: cifra(m[2]), lado: m[3] === "Debe" ? DEBE : HABER }));
      assert.deepEqual(it.lineas.map(({ cuenta, valor, lado: l }) => ({ cuenta, valor, lado: l })), lineas, `${it.id}: líneas`);
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores), `${it.id}: mensajes de error`);
      const [s1, s2] = acierto.match(/sumas de ([\d.]+) = ([\d.]+)/).slice(1).map((x) => Number(x.replace(/\./g, "")));
      assert.equal(it.sumas, s1);
      assert.equal(s1, s2);
    }
  }
});

test("★★★ las cifras salen de las tarifas del enunciado, dan las de Near y los asientos cuadran", () => {
  const C = D.CIFRAS_H2;
  assert.deepEqual(
    [C.compra, C.ivaCompra, C.retencionCompra, C.debeProveedor, C.venta, C.ivaVenta, C.retencionVenta, C.debeCliente],
    [3_200_000, 512_000, 112_000, 3_600_000, 4_800_000, 768_000, 168_000, 5_400_000],
  );
  /* El registro 5c de la v1 trae las mismas ocho. */
  assert.ok(V1.includes("H2 (3.200.000 · 512.000 · 112.000 · 3.600.000 · 4.800.000 · 768.000 · 168.000 · 5.400.000)"));
  const it = Object.fromEntries(D.ITEMS_H2.map((x) => [x.id, x]));
  assert.equal(it["iva-compra"].correcta, C.ivaCompra);
  assert.equal(it["retencion-compra"].correcta, C.retencionCompra);
  assert.equal(it["debe-proveedor"].correcta, C.debeProveedor);
  assert.equal(it["debe-cliente"].correcta, C.debeCliente);
  for (const a of [it["asiento-compra"], it["asiento-venta"]]) {
    const suma = (l) => a.lineas.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
    assert.equal(suma(DEBE), suma(HABER), `${a.id}: no cuadra`);
    assert.equal(suma(DEBE), a.sumas, `${a.id}: sumas`);
  }
  /* Ningún distractor es la buena de su ítem. */
  for (const x of D.ITEMS_H2.filter((y) => y.tipo === "calculo")) assert.ok(!x.distractores.some((d) => d.valor === x.correcta), x.id);
});

/* ═══════════ 2 · PUNTAJE Y UNIDADES ═══════════ */

test("★★★ doce unidades, doce aciertos posibles: cuatro cálculos y ocho líneas", () => {
  const u = L.unidadesH2();
  assert.equal(u.length, 12);
  assert.equal(L.TOTAL_H2, 12);
  assert.equal(new Set(u).size, 12);
  assert.ok(V1.includes("tiene 12 aciertos posibles"));
  assert.equal(L.puntuarH2(12), 100);
  assert.equal(L.puntuarH2(6), 50);
  assert.equal(L.puntuarH2(0), 0);
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

test("★★★ un solo intento por cálculo: al tocar, todo se bloquea y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H2[0];
    const mala = it.distractores[1].valor;
    await tocar(opcion(m.caja, mala));
    const antes = retro(m.caja);
    for (const v of L.opcionesDe(it)) assert.equal(opcion(m.caja, v).disabled, true, `${v} sigue activa`);
    await tocar(opcion(m.caja, it.correcta));
    assert.deepEqual(retro(m.caja), antes, "un segundo toque cambió la devolución");
    assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    assert.equal(opcion(m.caja, mala).dataset.estado, "incorrecta");
  } finally {
    m.desmontar();
  }
});

/* Responde toda la tanda con un plan: para cada unidad, acierto o error. */
async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of D.ITEMS_H2.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-pie]").textContent, D.H2.pie);
    assert.equal(siguiente(m.caja) === undefined, true, `${it.id}: «Siguiente» antes de responder`);
    if (it.tipo === "calculo") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
      const ok = v === it.correcta;
      assert.deepEqual(retro(m.caja), [ok ? it.acierto : it.distractores[0].retro], it.id);
      assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, ok ? "acierto" : "error");
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      for (const [j, l] of it.lineas.entries()) {
        assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, `${it.id}: el asiento se ve con ${j} de 4 líneas`);
        const id = L.idDeLinea(it, l);
        const elegido = falla(id) ? otro(l.lado) : l.lado;
        await tocar(lado(m.caja, l.id, elegido));
        /* La línea queda bloqueada; un segundo toque no cambia nada. */
        for (const b of m.caja.querySelectorAll(`[data-linea="${l.id}"] button`)) assert.equal(b.disabled, true);
        const ok = elegido === l.lado;
        const bajo = [...m.caja.querySelectorAll(`[data-linea="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent);
        assert.deepEqual(bajo, ok ? [] : [l.retro], `${id}: su mensaje va bajo su línea`);
        detalle.push({ item: id, ok, intentos: 1, respuesta: ok ? null : elegido, orden: detalle.length + 1 });
      }
      const completo = m.caja.querySelector("[data-asiento-completo]");
      assert.ok(completo, `${it.id}: con las cuatro líneas, el asiento completo`);
      assert.ok(completo.textContent.includes(`${pesos(it.sumas)}${pesos(it.sumas)}`), `${it.id}: las sumas`);
    }
    assert.equal(siguiente(m.caja).textContent, k === 5 ? D.BOTON_H2.verResumen : D.BOTON_H2.siguiente);
    await tocar(siguiente(m.caja));
  }
  return detalle;
}

test("★★★ la tanda entera: doce unidades, un intento cada una, y el porcentaje es aciertos / 12", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["retencion-compra", "asiento-compra:retencion", "asiento-venta:anticipo", "asiento-venta:ingresos"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, ms, det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(det.length, 12);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH2());
    assert.equal(pct, (8 / 12) * 100);
    assert.equal(typeof ms, "number");
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH2(8, 12));
  } finally {
    m.desmontar();
  }
});

test("★★★ sin arrastre: fallarlo todo no cambia la respuesta ni el acierto de ningún ítem", async () => {
  const todoMal = await montar();
  const todoBien = await montar();
  try {
    const mal = await jugar(todoMal, () => true);
    const bien = await jugar(todoBien, () => false);
    assert.equal(todoMal.completados[0][0], 0);
    assert.equal(todoBien.completados[0][0], 100);
    assert.deepEqual(mal.map((d) => d.item), bien.map((d) => d.item));
    /* Lo que se evalúa en cada ítem no lee nada de los anteriores. */
    for (const it of D.ITEMS_H2.filter((x) => x.tipo === "calculo")) assert.deepEqual(L.evaluarCalculoH2(it, it.correcta), { ok: true, correcta: it.correcta, texto: it.acierto });
  } finally {
    todoMal.desmontar();
    todoBien.desmontar();
  }
});

test("★★ los ítems en el orden de la tabla; las opciones y las líneas, barajadas en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const opciones = new Set();
  const lineas = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH2(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H2.map((x) => x.id));
    opciones.add(p[0].opciones.join());
    lineas.add(p[3].orden.join());
    for (const x of p) {
      if (x.tipo === "calculo") assert.deepEqual([...x.opciones].sort(), L.opcionesDe(x).sort());
      else assert.deepEqual([...x.orden].sort(), x.lineas.map((l) => l.id).sort());
    }
  }
  assert.ok(opciones.size > 1, "las opciones no se barajan");
  assert.ok(lineas.size > 1, "las líneas no se barajan");
  assert.match(leer("src/components/mecanicas/libros/t7/ArmaLaFactura.jsx"), /useTanda\(\(\) => items \?\? prepararH2\(barajar\)\)/);
});

test("★★ el enunciado y las fichas se ven en todo el juego, y el error va en coral solo cuando hay error", async () => {
  const m = await montar();
  try {
    for (const p of D.H2.enunciado) assert.ok(m.caja.querySelector("[data-enunciado]").textContent.includes(p));
    assert.equal(m.caja.querySelectorAll("[data-ficha]").length, 2);
    assert.ok(!/E76F51|231,\s*111,\s*81/i.test(m.caja.innerHTML), "coral antes de responder");
    await tocar(opcion(m.caja, D.ITEMS_H2[0].correcta));
    assert.ok(!/231,\s*111,\s*81/i.test(m.caja.querySelector("[data-retro]").innerHTML), "coral en un acierto");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, justo después de AP2: evaluativa, medio, 25 FP; las piezas de Aprender siguen sin FP", () => {
  assert.ok(actividadesDeTipo(TEMA, HACER).some((a) => a.id === D.H2_ID));
  const c = clasificacionDe("contabilidad", TEMA_T7_1, D.H2_ID);
  assert.deepEqual(c, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H2_ID).nombre, D.H2.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  /* Orden de L (regla 9): justo después de AP2; si H1 ya está, H1 va antes de H2. */
  const ids = TEMA.actividades.map((x) => x.id);
  const antes = ids.includes("t7-1-que-cuenta-se-mueve") ? "t7-1-que-cuenta-se-mueve" : "t7-1-a2-la-factura-completa";
  assert.equal(ids.indexOf(D.H2_ID), ids.indexOf(antes) + 1);
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H2_ID).Mecanica, ArmaLaFactura);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_1View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0092: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t7-1-arma-la-factura',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-1-arma-la-factura';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H2_ID));
  assert.deepEqual(conElId, ["0092_t7_1_arma_la_factura.sql"]);
  const n = Number(conElId[0].slice(0, 4));
  assert.ok(n >= 90 && n <= 109, `la ${conElId[0]} está fuera del rango 0090-0109`);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos (recortada a 70, como todas)", async () => {
  /* Los ids que de verdad llegan al panel: los del detalle de una partida entera. */
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 12);
    for (const id of ids) {
      const etiqueta = etiquetaDeItem(D.H2_ID, id);
      assert.ok(typeof etiqueta === "string" && etiqueta.trim() !== "", `${id}: sin etiqueta en el panel`);
      assert.equal(etiqueta, recortar(L.unidadDeH2(id)), id);
    }
  } finally {
    m.desmontar();
  }
  /* Un cálculo se lee por su pregunta; una línea, por su cuenta y su valor, tal como están en los datos. */
  for (const it of D.ITEMS_H2) {
    if (it.tipo === "calculo") assert.equal(L.unidadDeH2(it.id), it.pregunta);
    else for (const l of it.lineas) assert.equal(L.unidadDeH2(L.idDeLinea(it, l)), `${l.cuenta} ${pesos(l.valor)}`);
  }
  /* La regla vive en el bloque de T7 del archivo, y lee los datos: no copia ninguna pregunta. */
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-arma-la-factura": \(id\) => unidadDeH2\(id\),/);
  for (const it of D.ITEMS_H2) assert.ok(!fuente.includes(it.pregunta), `${it.id}: la pregunta está copiada en etiquetasItem.js`);
});
