import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H1 «¿Qué cuenta se mueve?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de Near; donde una capa nueva cambia
 *     un texto (ítems 5 y 6, error típico del 5), manda la nueva y el viejo
 *     ya no aparece
 *   · un solo intento por hecho: al tocar, todo se bloquea; un segundo toque
 *     no cambia nada; el detalle anota un intento
 *   · después de responder: con acierto, «Correcto.» y el porqué; con error,
 *     la buena se enseña, y va la línea del error típico (si es ese) antes del
 *     porqué; el pie de cada hecho siempre a la vista
 *   · las cinco opciones en orden fijo; los hechos, barajados en cada intento
 *   · exploratoria, fácil, 10 FP, en el cliente y en la migración 0090
 *     (aditiva, repetible, del rango de la Célula C); la vista lo abre desde
 *     el camino y registra con el motor compartido; el panel docente lee
 *     cada ítem por su hecho
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

const D = await import("../../data/contabilidadT7_1_h1.js");
const L = await import("../t7H1.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: QueCuentaSeMueve } = await import("../../components/mecanicas/libros/t7/QueCuentaSeMueve.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h1-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h1-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0090_t7_1_que_cuenta_se_mueve.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(QueCuentaSeMueve, { Marco, items: D.ITEMS_H1, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H1).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const malaDe = (it) => D.OPCIONES_H1.find((o) => o.id !== it.respuesta && o.id !== it.tipico?.opcion).id;

/* ═══════════ 1 · TEXTOS CONTRA NEAR ═══════════ */

test("★★★ consigna, opciones y nombre son los de la v1, letra por letra", () => {
  for (const c of D.H1.consigna) assert.ok(V1.includes(`«${c}»`), c);
  assert.ok(V1.includes(`## Opciones (las mismas 5 en todos los ítems, en orden fijo)\n\n${D.OPCIONES_H1.map((o) => o.nombre).join(" · ")}\n`), "las opciones o su orden no son los de la v1");
  assert.ok(V1.includes(`**H1 «${D.H1.nombre}»`));
  assert.equal(D.H1_ID, "t7-1-que-cuenta-se-mueve");
  assert.ok(V1.includes(`\`${D.H1_ID}\``));
});

/* La tabla de ítems de la v1, fila por fila. */
function filasV1() {
  const lineas = V1.slice(V1.indexOf("## Ítems")).split("\n").filter((l) => /^\| \d \|/.test(l));
  return lineas.map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
}
const cita = (celda) => celda.match(/«([^»]+)»/)?.[1] ?? null;

test("★★★ cada ítem es el de la v1, con las capas nuevas aplicadas: manda la más nueva", () => {
  const filas = filasV1();
  assert.equal(filas.length, 6);
  assert.equal(D.ITEMS_H1.length, 6);
  const nombre = (id) => D.OPCIONES_H1.find((o) => o.id === id).nombre;
  for (const [k, it] of D.ITEMS_H1.entries()) {
    const [n, hecho, resp, subtema, porque, tipico, pie] = filas[k];
    assert.equal(n, String(k + 1));
    /* La respuesta de la tabla es el nombre corto de la opción. */
    assert.ok(nombre(it.respuesta).startsWith(resp), `${it.id}: respuesta`);
    assert.equal(it.subtema, subtema);
    assert.equal(it.porque, cita(porque), `${it.id}: porqué`);
    assert.equal(it.pie, pie);
    if (k < 4) {
      assert.equal(it.texto, cita(hecho), `${it.id}: hecho`);
    } else {
      /* Ítems 5 y 6: el texto de los opcionales aceptados, y el de la v1 ya no. */
      assert.notEqual(it.texto, cita(hecho), `${it.id}: sigue el hecho de la v1`);
      assert.ok(CAMBIOS.includes(`«${it.texto}»`), `${it.id}: el hecho nuevo no está en la capa de cambios`);
    }
    if (tipico === "—") { assert.equal(it.tipico, null, it.id); continue; }
    const elige = tipico.match(/^Elige (\w+):/)[1];
    assert.ok(nombre(it.tipico.opcion).startsWith(elige), `${it.id}: opción del error típico`);
    if (it.id === "conteo-al-cierre") {
      assert.notEqual(it.tipico.texto, cita(tipico));
      assert.ok(CAMBIOS.includes(`«${it.tipico.texto}»`), "el error típico nuevo del ítem 5 no está en la capa de cambios");
    } else {
      assert.equal(it.tipico.texto, cita(tipico), `${it.id}: error típico`);
    }
  }
});

test("★★ el puntaje es el de la capa nueva: sin la tabla de reparto de la v1", () => {
  assert.ok(CAMBIOS.includes("«Exploratoria, Fácil: el motor compartido (src/fp/motor.js) paga los 10 FP al terminar.»"));
  assert.doesNotMatch(JSON.stringify(D) + leer("src/contabilidad/t7H1.js"), /0, 2, 3, 5, 7, 8/);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

test("★★★ un solo intento por hecho: al tocar, todo se bloquea y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H1[0];
    await tocar(opcion(m.caja, malaDe(it)));
    const antes = retro(m.caja);
    for (const o of D.OPCIONES_H1) assert.equal(opcion(m.caja, o.id).disabled, true, `${o.id} sigue activa`);
    await tocar(opcion(m.caja, it.respuesta));
    assert.deepEqual(retro(m.caja), antes, "un segundo toque cambió la devolución");
    assert.equal(opcion(m.caja, it.respuesta).dataset.estado, "revelada");
  } finally {
    m.desmontar();
  }
});

test("★★★ después de responder: «Correcto.» y el porqué; o la línea del error típico antes del porqué; o solo el porqué", async () => {
  const m = await montar();
  try {
    const detalle = [];
    for (const [k, it] of D.ITEMS_H1.entries()) {
      assert.equal(m.caja.querySelector("[data-hecho]").textContent, it.texto);
      /* El pie del hecho, siempre a la vista. */
      assert.equal(m.caja.querySelector("[data-pie]").textContent, it.pie);
      assert.equal(m.caja.querySelector("[data-retro] [data-panel]") === null, true, "la devolución se ve antes de responder");
      /* Las cinco, en el orden fijo, en cada hecho. */
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), D.OPCIONES_H1.map((o) => o.id));
      const modo = k % 3; // 0 acierto · 1 error típico (si hay) · 2 otro error
      const elegida = modo === 0 ? it.respuesta : modo === 1 && it.tipico ? it.tipico.opcion : malaDe(it);
      await tocar(opcion(m.caja, elegida));
      const ok = elegida === it.respuesta;
      const esperado = ok ? ["Correcto.", it.porque] : [...(it.tipico?.opcion === elegida ? [it.tipico.texto] : []), it.porque];
      assert.deepEqual(retro(m.caja), esperado, it.id);
      assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, ok ? "acierto" : "error");
      assert.equal(opcion(m.caja, elegida).dataset.estado, ok ? "correcta" : "incorrecta");
      if (!ok) assert.equal(opcion(m.caja, it.respuesta).dataset.estado, "revelada", `${it.id}: no se enseña la buena`);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : elegida, orden: k + 1 });
      assert.equal(siguiente(m.caja).textContent, k === 5 ? D.BOTON_H1.verResumen : D.BOTON_H1.siguiente);
      await tocar(siguiente(m.caja));
    }
    /* Se reporta una vez, con un intento por hecho. */
    assert.equal(m.completados.length, 1);
    const [pct, ms, det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(pct, (detalle.filter((d) => d.ok).length / 6) * 100);
    assert.equal(typeof ms, "number");
  } finally {
    m.desmontar();
  }
});

test("★★ el error típico de cada ítem se distingue de los demás errores (ítems 1, 5 y 6)", () => {
  const conTipico = D.ITEMS_H1.filter((it) => it.tipico);
  assert.deepEqual(conTipico.map((it) => it.id), ["compra-mercancia", "conteo-al-cierre", "costo-al-vender"]);
  for (const it of conTipico) {
    assert.deepEqual(L.evaluarH1(it, it.tipico.opcion).textos, [it.tipico.texto, it.porque]);
    assert.deepEqual(L.evaluarH1(it, malaDe(it)).textos, [it.porque]);
    assert.deepEqual(L.evaluarH1(it, it.respuesta).textos, [D.CORRECTO, it.porque]);
  }
});

test("★★ los hechos se barajan en cada intento; las opciones, nunca", () => {
  const ordenes = new Set();
  const { barajar } = { barajar: (xs) => [...xs].sort(() => Math.random() - 0.5) };
  for (let i = 0; i < 40; i++) ordenes.add(L.sortearH1(barajar).map((x) => x.id).join());
  assert.ok(ordenes.size > 1);
  assert.match(leer("src/components/mecanicas/libros/t7/QueCuentaSeMueve.jsx"), /useTanda\(\(\) => items \?\? sortearH1\(barajar\)\)/);
  assert.doesNotMatch(leer("src/components/mecanicas/libros/t7/QueCuentaSeMueve.jsx"), /barajar\(OPCIONES_H1\)/);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, justo después de AP2: exploratoria, fácil, 10 FP; las piezas de Aprender siguen sin FP", () => {
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), [D.H1_ID]);
  const c = clasificacionDe("contabilidad", TEMA_T7_1, D.H1_ID);
  assert.deepEqual(c, { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, D.H1.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  /* Orden de L (regla 9): H1 justo después de AP2; se publica con AP1 y AP2 o después. */
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H1_ID), ids.indexOf("t7-1-a2-la-factura-completa") + 1);
  assert.ok(ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve") < ids.indexOf("t7-1-a2-la-factura-completa"));
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS_T7_1) assert.equal(typeof j.Mecanica, "function", j.id);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_1View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0090: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t7-1-que-cuenta-se-mueve',\s*'contabilidad',\s*'inventarios-periodico',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-1-que-cuenta-se-mueve';/);
  /* Una sola migración trae el id, y su número es del rango de la Célula C (0090-0109). */
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H1_ID));
  assert.deepEqual(conElId, ["0090_t7_1_que_cuenta_se_mueve.sql"]);
  const n = Number(conElId[0].slice(0, 4));
  assert.ok(n >= 90 && n <= 109, `la ${conElId[0]} está fuera del rango 0090-0109`);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída del hecho (recortada a 70, como todas)", async () => {
  /* Los ids que de verdad llegan al panel: los del detalle de una partida entera. */
  const m = await montar();
  try {
    for (const it of D.ITEMS_H1) {
      await tocar(opcion(m.caja, it.respuesta));
      await tocar(siguiente(m.caja));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, D.ITEMS_H1.length);
    for (const id of ids) {
      const etiqueta = etiquetaDeItem(D.H1_ID, id);
      assert.ok(typeof etiqueta === "string" && etiqueta.trim() !== "", `${id}: sin etiqueta en el panel`);
      assert.equal(etiqueta, recortar(D.ITEMS_H1.find((x) => x.id === id).texto), `${id}: la etiqueta no es su hecho`);
    }
  } finally {
    m.desmontar();
  }
  /* La regla vive en el bloque de T7 del archivo, y lee los datos: no copia ningún hecho. */
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-que-cuenta-se-mueve": \(id\) => hechoDeItemH1\(id\),/);
  for (const it of D.ITEMS_H1) assert.ok(!fuente.includes(it.texto), `${it.id}: el hecho está copiado en etiquetasItem.js`);
});
