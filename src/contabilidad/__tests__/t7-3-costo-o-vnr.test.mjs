import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { sinUnSoloIntento } from "../armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H7 «¿Costo o valor neto realizable?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1
 *   · LAS CIFRAS SE RECALCULAN: valor neto realizable = precio esperado −
 *     lo que falta para terminar − lo que cuesta vender (p. 257), y la
 *     medida es el menor entre él y el costo (p. 258); los distractores, con
 *     el error que nombra su retroalimentación; todas son de la lista de
 *     T73-H7 del registro 5c
 *   · la frase fija de la NIC 2, la de A7, siempre a la vista
 *   · la ficha de la regla 10c que propone Near (pendiente de L)
 *   · un solo intento por pregunta; cifras barajadas; seis unidades; el
 *     porcentaje es aciertos / 6
 *   · evaluativa, media, 25 FP, en el cliente y en la migración 0109; la
 *     vista lo abre y registra con el motor; el panel docente lee cada
 *     pregunta por su caso
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

const D = await import("../../data/contabilidadT7_3_h7.js");
const A7 = await import("../../data/contabilidadT7_3_a7.js");
const L = await import("../t7_3H7.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: CostoOValorNeto } = await import("../../components/mecanicas/libros/t7/CostoOValorNeto.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h7-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0109_t7_3_costo_o_vnr.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));
/* «$1.110.000» → 1110000 */
const numero = (t) => Number(t.replace(/[$.]/g, ""));
const cifrasDe = (t) => [...t.matchAll(/\$([\d.]+)/g)].map((m) => numero(m[1]));

/* ═══════════ 1 · TEXTOS Y CIFRAS ═══════════ */

test("★★★ los textos son los de la v1, letra por letra", () => {
  assert.ok(V1.includes(`id \`${D.H7_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H7 «${D.H7.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 14 | ${D.H7_ID} | ${D.H7.nombre} | Hacer |`));
  assert.equal(D.H7.consigna, citas(V1.split("\n").find((l) => l.startsWith("- Consigna:")))[0]);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H7.pie}».`));
  assert.equal(D.H7.aviso, A7.FRASE_NIC2);
  assert.ok(V1.includes("- Frase fija de la NIC 2"));
  const fs = filas();
  assert.equal(fs.length, 6);
  for (const [k, [caso, enunciado, pregunta, correcta, distractores, acierto]] of fs.entries()) {
    const it = D.ITEMS_H7[k];
    const c = D.CASOS_H7[it.caso];
    assert.equal(caso, String(it.caso + 1));
    assert.equal(c.encabezado, `Caso ${caso}`);
    if (k % 2 === 0) assert.equal(c.texto, citas(enunciado)[0], it.id);
    else assert.equal(enunciado, "—");
    /* La v1 abrevia la segunda pregunta de los casos 2 y 3: «¿Por qué valor se mide…?». */
    const p = citas(pregunta)[0];
    if (p.endsWith("…?")) assert.ok(it.pregunta.startsWith(p.slice(0, -2)), it.id);
    else assert.equal(it.pregunta, p, it.id);
    assert.equal(pesos(it.correcta), correcta, it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    /* Cada distractor, con su cifra y su retroalimentación; el caso 2 repite las del caso 1. */
    const mismas = distractores.match(/^(\$[\d.]+) y (\$[\d.]+), con las mismas retroalimentaciones del caso 1$/);
    if (mismas) {
      assert.deepEqual(it.distractores.map((d) => pesos(d.valor)), [mismas[1], mismas[2]], it.id);
      assert.deepEqual(it.distractores.map((d) => d.retro), D.ITEMS_H7[k - 2].distractores.map((d) => d.retro), it.id);
    } else {
      const partes = distractores.split(" · ");
      assert.equal(partes.length, it.distractores.length, it.id);
      for (const [j, parte] of partes.entries()) {
        assert.equal(pesos(it.distractores[j].valor), parte.match(/^(\$[\d.]+):/)[1], it.id);
        assert.equal(it.distractores[j].retro, citas(parte)[0], it.id);
      }
    }
  }
});

test("★★★ las cifras se recalculan con la regla del libro, y son las del registro 5c", () => {
  /* Los datos de cada caso, leídos del enunciado de la v1, en su orden. */
  const fs = filas().filter((_, k) => k % 2 === 0);
  for (const [k, c] of D.CASOS_H7.entries()) {
    const datos = cifrasDe(citas(fs[k][1])[0]);
    assert.deepEqual(datos, c.terminar === null ? [c.costo, c.precio, c.vender] : [c.costo, c.precio, c.terminar, c.vender], c.encabezado);
  }
  /* A mano: */
  const vnrs = [710_000 - 85_000, 1_110_000 - 130_000, 1_520_000 - 160_000 - 95_000];
  assert.deepEqual(vnrs, [625_000, 980_000, 1_265_000]);
  assert.deepEqual(D.CASOS_H7.map(D.vnr), vnrs);
  assert.deepEqual(D.CASOS_H7.map(D.medida), [625_000, 920_000, 1_265_000]);
  /* El caso 2 es el que se gana con el costo (Near): no se gana eligiendo siempre el valor neto realizable. */
  assert.deepEqual(D.CASOS_H7.map((c) => D.medida(c) === c.costo), [false, true, false]);
  /* Los distractores, con el error que nombra su retroalimentación. */
  const [c1, c2, c3] = D.CASOS_H7;
  assert.deepEqual(D.ITEMS_H7[0].distractores.map((d) => d.valor), [c1.precio, c1.precio + c1.vender]);
  assert.deepEqual(D.ITEMS_H7[2].distractores.map((d) => d.valor), [c2.precio, c2.precio + c2.vender]);
  assert.deepEqual(D.ITEMS_H7[4].distractores.map((d) => d.valor), [c3.precio - c3.vender, c3.precio - c3.terminar]);
  /* Cada cifra de la pieza está en la lista de T73-H7 del registro 5c, y cada una de la lista está en la pieza. */
  const lista = V1.split("\n").find((l) => l.startsWith("- Registro 5c, T73-H7:")).replace("- Registro 5c, T73-H7:", "").split(" · ").map((x) => numero(x.trim().replace(/\.$/, "")));
  const enLaPieza = new Set([
    ...D.CASOS_H7.flatMap((c) => [c.costo, c.precio, c.terminar, c.vender].filter((x) => x !== null)),
    ...D.ITEMS_H7.flatMap((it) => [it.correcta, ...it.distractores.map((d) => d.valor)]),
  ]);
  assert.deepEqual([...enLaPieza].sort((a, b) => a - b), [...new Set(lista)].sort((a, b) => a - b));
});

test("★★★ la ficha: la regla 10c que propone Near, con los datos del caso", () => {
  assert.ok(V1.includes("quién · costo · precio esperado de venta · lo que falta para terminar · lo que cuesta vender"));
  assert.deepEqual(Object.values(D.FICHA_10C).map((x) => x.toLowerCase()), ["quién", "costo", "precio esperado de venta", "lo que falta para terminar", "lo que cuesta vender"]);
  assert.deepEqual(D.fichaH7(D.CASOS_H7[0]), [["Quién", "Una tienda"], ["Costo", "$665.000"], ["Precio esperado de venta", "$710.000"], ["Lo que cuesta vender", "$85.000"]]);
  assert.deepEqual(D.fichaH7(D.CASOS_H7[2]).map((f) => f[1]), ["Una fábrica", "$1.315.000", "$1.520.000", "$160.000", "$95.000"]);
  /* «Las empresas no tienen nombre»: «una tienda», «otra tienda» y «una fábrica». */
  assert.deepEqual(D.CASOS_H7.map((c) => c.quien), ["Una tienda", "Otra tienda", "Una fábrica"]);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

/* Un barajar fijo que invierte: así se ve que las opciones no quedan en el orden de los datos. */
const alReves = (xs) => [...xs].reverse();
const EN_ORDEN = L.prepararH7(alReves);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(CostoOValorNeto, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const aviso = (caja) => [...caja.querySelectorAll("[data-aviso]")].map((x) => x.textContent);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    const c = D.CASOS_H7[it.caso];
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2], `sin la frase en el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H7.pie);
    assert.equal(m.caja.querySelector("[data-caso]").dataset.caso, String(it.caso + 1));
    assert.equal(m.caja.querySelector("[data-caso] p").textContent, c.texto);
    assert.deepEqual([...m.caja.querySelectorAll("[data-ficha] dd")].map((x) => x.textContent), D.fichaH7(c).map((f) => f[1]));
    assert.equal(m.caja.querySelector("[data-encabezado-item]").textContent, c.encabezado.toUpperCase());
    /* Las cifras, con formato de pesos y en el orden barajado. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.textContent.trim()), alReves(L.opcionesDeH7(it)).map((v) => pesos(v)));
    const v = falla(it.id) ? it.distractores.at(-1).valor : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.distractores.at(-1).retro]);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2], `sin la frase al responder el ítem ${k + 1}`);
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 5 ? D.BOTON_H7.verResumen : D.BOTON_H7.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: seis preguntas, un intento cada una, y el porcentaje es aciertos / 6", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(sinUnSoloIntento(D.H7.consigna)));
    assert.ok(m.caja.querySelector("[data-contador-intento] [data-un-intento]"), "el distintivo junto al contador");
    const fallos = new Set(["vnr-1", "medida-2", "vnr-3"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH7());
    assert.equal(L.TOTAL_H7, 6);
    assert.equal(pct, (3 / 6) * 100);
    /* Solo la correcta acierta, y cada error trae su propio texto. */
    for (const it of EN_ORDEN) for (const o of it.opciones) {
      const e = L.evaluarH7(it, o.valor);
      assert.equal(e.ok, o.valor === it.correcta, `${it.id} · ${o.valor}`);
      assert.equal(e.textos[0], e.ok ? it.acierto : it.distractores.find((d) => d.valor === o.valor).retro);
    }
    assert.deepEqual(aviso(m.caja), [A7.FRASE_NIC2]);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH7(3, 6));
  } finally {
    m.desmontar();
  }
});

test("★★★ sin «items», la mecánica baraja", async () => {
  const m = await montar({ items: null });
  try {
    const vistas = [...m.caja.querySelectorAll("[data-opcion]")].map((x) => Number(x.dataset.opcion)).sort();
    assert.deepEqual(vistas, L.opcionesDeH7(D.ITEMS_H7[0]).sort());
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-3, justo después de H6: evaluativa, media, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H7_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H7_ID).nombre, D.H7.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H7_ID), ids.indexOf("t7-3-que-entra-al-costo") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H7_ID).Mecanica, CostoOValorNeto);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0109: del rango de la célula, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t7-3-costo-o-vnr',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-3-costo-o-vnr';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H7_ID)), ["0109_t7_3_costo_o_vnr.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0109")), ["0109_t7_3_costo_o_vnr.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 6);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H7_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeH7(id)), id);
    }
    /* La pregunta se repite entre casos: la etiqueta las distingue por el caso. */
    assert.equal(new Set(ids.map((id) => L.unidadDeH7(id))).size, 6);
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-costo-o-vnr": \(id\) => unidadDeT73H7\(id\),/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

test("★★★ Patrón T7-3: la franja de la NIC 2 primero; en cada caso, la cuenta y «el menor» después de su ítem", async () => {
  const vistas = (caja) => [...caja.querySelectorAll("[data-figuras] figure")].map((f) => `${f.querySelector("figcaption").textContent}: ${[...f.querySelectorAll("[data-renglon]")].map((r) => `${r.querySelector(".rg-op").textContent}${r.querySelector(".rg-v").textContent}${r.classList.contains("rg-fuerte") ? "!" : ""}`).join(" ")}`);
  const V1 = "Una tienda: 710.000 −85.000 =625.000";
  const M1 = "Se mide por el menor: 665.000 625.000!";
  const V2 = "Otra tienda: 1.110.000 −130.000 =980.000";
  const M2 = "Se mide por el menor: 920.000! 980.000";
  const V3 = "Una fábrica: 1.520.000 −160.000 −95.000 =1.265.000";
  const M3 = "Se mide por el menor: 1.315.000 1.265.000!";
  const antes = [[], [V1], [], [V2], [], [V3]];
  const despues = [[V1], [V1, M1], [V2], [V2, M2], [V3], [V3, M3]];
  const m = await montar();
  try {
    const raiz = m.caja.querySelector("[data-t7-3-h7]");
    assert.equal(raiz.firstElementChild.matches("p.t73pt-nic2[data-aviso]"), true);
    for (const [k, it] of EN_ORDEN.entries()) {
      assert.deepEqual(vistas(m.caja), antes[k], `antes del ítem ${k + 1}`);
      await tocar(opcion(m.caja, k % 2 ? it.distractores.at(-1).valor : it.correcta));
      assert.deepEqual(vistas(m.caja), despues[k], `al responder el ítem ${k + 1}`);
      await tocar(boton(m.caja, k === 5 ? D.BOTON_H7.verResumen : D.BOTON_H7.siguiente));
    }
    /* También en el cierre. */
    assert.equal(m.caja.querySelector("p.t73pt-nic2[data-aviso]").textContent, A7.FRASE_NIC2);
  } finally {
    m.desmontar();
  }
});
