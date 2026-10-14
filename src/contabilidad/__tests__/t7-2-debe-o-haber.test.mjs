import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H1 «¿Debe o haber?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1 de Near
 *   · un solo intento por hecho: al tocar, todo se bloquea; el detalle anota
 *     un intento
 *   · después de responder: con acierto, «Correcto.» y el porqué; con error,
 *     el porqué y la buena a la vista; el pie siempre
 *   · las dos opciones en orden fijo; los hechos, barajados en cada intento
 *   · regla 3: sin cifras de dinero
 *   · exploratoria, fácil, 10 FP, en el cliente y en la migración 0098; la
 *     vista lo abre desde el camino y registra con el motor compartido; el
 *     panel docente lee cada ítem por su hecho
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

const D = await import("../../data/contabilidadT7_2_h1.js");
const L = await import("../t7_2H1.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: DebeOHaber } = await import("../../components/mecanicas/libros/t7/DebeOHaber.jsx");
const { JUEGOS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-h1-v1.md");
const VISTA = leer("src/components/ContabilidadT7_2View.jsx");
const MIGRACION = leer("supabase/migrations/0098_t7_2_debe_o_haber.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(DebeOHaber, { Marco, items: D.ITEMS_H1, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H1).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const otra = (it) => (it.respuesta === "debe" ? "haber" : "debe");

/* ═══════════ 1 · TEXTOS CONTRA NEAR ═══════════ */

test("★★★ id, nombre, consigna, opciones, subtemas y pie son los de la v1, letra por letra", () => {
  assert.equal(D.H1_ID, "t7-2-debe-o-haber");
  assert.ok(V1.includes(`id\t${D.H1_ID}`));
  assert.ok(V1.startsWith(`T7-2 · H1 «${D.H1.nombre}»`));
  for (const c of D.H1.consigna) assert.ok(V1.includes(`«${c}»`), c);
  assert.ok(V1.includes(`Opciones en todos: ${D.OPCIONES_H1.map((o) => `«${o.nombre}»`).join(" · ")}.`), "las opciones o su orden no son los de la v1");
  assert.ok(V1.includes(`Subtemas\t${D.SUBTEMAS_H1.join(" · ")}`));
  for (const it of D.ITEMS_H1) assert.ok(D.SUBTEMAS_H1.includes(it.subtema), it.id);
  assert.ok(V1.includes(`Pie de todos los ítems: «${D.ITEMS_H1[0].pie}».`));
  assert.ok(D.ITEMS_H1.every((it) => it.pie === D.ITEMS_H1[0].pie));
});

/* La tabla de ítems de la v1, fila por fila: n, hecho, respuesta, porqué, renglón. */
function filasV1() {
  return V1.split("\n").filter((l) => /^\d\t/.test(l)).map((l) => l.split("\t"));
}
const cita = (celda) => celda.match(/«([^»]+)»/)?.[1] ?? null;

test("★★★ cada hecho es el de la v1, en su orden, con su respuesta y su porqué", () => {
  const filas = filasV1();
  assert.equal(filas.length, 7);
  assert.equal(D.ITEMS_H1.length, 7);
  for (const [k, it] of D.ITEMS_H1.entries()) {
    const [n, hecho, resp, porque] = filas[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.texto, cita(hecho), `${it.id}: hecho`);
    assert.equal(D.OPCIONES_H1.find((o) => o.id === it.respuesta).nombre, resp, `${it.id}: respuesta`);
    assert.equal(it.porque, cita(porque), `${it.id}: porqué`);
  }
  /* Ids únicos: el panel docente los usa. */
  assert.equal(new Set(D.ITEMS_H1.map((x) => x.id)).size, 7);
});

test("★★★ regla 3: sin cifras de dinero; solo las unidades de los hechos", () => {
  const todo = [D.H1.nombre, ...D.H1.consigna, ...D.ITEMS_H1.flatMap((it) => [it.texto, it.porque])].join(" ");
  assert.doesNotMatch(todo, /\$/);
  assert.deepEqual((todo.match(/\d+/g) ?? []).sort(), ["15", "40", "5"]);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

test("★★★ un solo intento por hecho: al tocar, las dos se bloquean y un segundo toque no cambia nada", async () => {
  const m = await montar();
  try {
    const it = D.ITEMS_H1[0];
    await tocar(opcion(m.caja, otra(it)));
    const antes = retro(m.caja);
    for (const o of D.OPCIONES_H1) assert.equal(opcion(m.caja, o.id).disabled, true, `${o.id} sigue activa`);
    await tocar(opcion(m.caja, it.respuesta));
    assert.deepEqual(retro(m.caja), antes, "un segundo toque cambió la devolución");
    assert.equal(opcion(m.caja, it.respuesta).dataset.estado, "revelada");
  } finally {
    m.desmontar();
  }
});

test("★★★ después de responder: «Correcto.» y el porqué, o solo el porqué con la buena a la vista; el pie siempre", async () => {
  const m = await montar();
  try {
    const detalle = [];
    for (const [k, it] of D.ITEMS_H1.entries()) {
      assert.equal(m.caja.querySelector("[data-hecho]").textContent, it.texto);
      assert.equal(m.caja.querySelector("[data-pie]").textContent, it.pie);
      assert.equal(m.caja.querySelector("[data-retro] [data-panel]") === null, true, "la devolución se ve antes de responder");
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), ["debe", "haber"]);
      const elegida = k % 2 === 0 ? it.respuesta : otra(it);
      await tocar(opcion(m.caja, elegida));
      const ok = elegida === it.respuesta;
      assert.deepEqual(retro(m.caja), ok ? ["Correcto.", it.porque] : [it.porque], it.id);
      assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, ok ? "acierto" : "error");
      assert.equal(opcion(m.caja, elegida).dataset.estado, ok ? "correcta" : "incorrecta");
      if (!ok) assert.equal(opcion(m.caja, it.respuesta).dataset.estado, "revelada", `${it.id}: no se enseña la buena`);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : elegida, orden: k + 1 });
      assert.equal(siguiente(m.caja).textContent, k === 6 ? D.BOTON_H1.verResumen : D.BOTON_H1.siguiente);
      await tocar(siguiente(m.caja));
    }
    assert.equal(m.completados.length, 1);
    const [pct, ms, det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(pct, (4 / 7) * 100);
    assert.equal(typeof ms, "number");
  } finally {
    m.desmontar();
  }
});

test("★★ los hechos se barajan en cada intento; las opciones, nunca", () => {
  const ordenes = new Set();
  const barajar = (xs) => [...xs].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 40; i++) ordenes.add(L.sortearH1(barajar).map((x) => x.id).join());
  assert.ok(ordenes.size > 1);
  const fuente = leer("src/components/mecanicas/libros/t7/DebeOHaber.jsx");
  assert.match(fuente, /useTanda\(\(\) => items \?\? sortearH1\(barajar\)\)/);
  assert.doesNotMatch(fuente, /barajar\(OPCIONES_H1\)/);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-2, justo después de A1: exploratoria, fácil, 10 FP; las de Aprender siguen sin FP", () => {
  /* H1 es el primer Hacer de T7-2; los demás van detrás, en el orden del mapa. */
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].id, D.H1_ID);
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_2, D.H1_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  assert.equal(actividadesDeTipo(TEMA, HACER)[0].nombre, D.H1.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H1_ID), ids.indexOf("t7-2-a1-la-cuenta-que-si-se-mueve") + 1);
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_2.map((j) => j.id).sort(), ofrecidas);
  for (const j of JUEGOS_T7_2) assert.equal(typeof j.Mecanica, "function", j.id);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_2, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  /* Las piezas de Aprender no reciben con qué registrar. */
  assert.match(VISTA, /<Pieza pieza=\{pieza\} rotulo=\{rotulo\} \/>/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_2View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0098: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t7-2-debe-o-haber',\s*'contabilidad',\s*'inventarios-permanente',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-2-debe-o-haber';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H1_ID));
  assert.deepEqual(conElId, ["0098_t7_2_debe_o_haber.sql"]);
  /* El número que L asignó: ninguna otra migración usa la 0098. */
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0098")), ["0098_t7_2_debe_o_haber.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída del hecho (recortada a 70, como todas)", async () => {
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
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-2-debe-o-haber": \(id\) => hechoDeItemT72H1\(id\),/);
  for (const it of D.ITEMS_H1) assert.ok(!fuente.includes(it.texto), `${it.id}: el hecho está copiado en etiquetasItem.js`);
});
