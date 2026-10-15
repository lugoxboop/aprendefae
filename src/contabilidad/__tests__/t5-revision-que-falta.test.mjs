import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 «¿Qué revisión falta?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la tanda 1 v1.1 de Near, con la
 *     corrección de Mello del ítem 4, decidida por L, tal cual
 *   · sin cifras; del fondo fiduciario, solo el nombre
 *   · un solo intento por ítem; las cuatro acciones en el orden de la tanda;
 *     cinco unidades; el porcentaje es aciertos / 5
 *   · evaluativa, fácil, 10 FP, en el cliente y en la migración 0111; en T5
 *     justo después de N2; la vista lo abre y registra con el motor; el
 *     panel docente lee cada ítem
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

const D = await import("../../data/contabilidadT5_n3.js");
const L = await import("../t5N3.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: RevisionQueFalta } = await import("../../components/mecanicas/libros/t5/RevisionQueFalta.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const TANDA = leer("orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md");
const N3 = TANDA.slice(TANDA.indexOf("## N3 · "), TANDA.indexOf("### Notas", TANDA.indexOf("## N3 · ")));
const VEREDICTO = leer("orquestador/conocimiento/paquetes/t5-veredicto-mello-tandas-1-y-2.md");
const VISTA = leer("src/components/ContabilidadTema5View.jsx");
const MIGRACION = leer("supabase/migrations/0111_t5_revision_que_falta.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => N3.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.replace(/^\| | \|$/g, "").split(" | "));

/* La corrección del ítem 4, leída del veredicto: la frase que empieza «…» se cambia, entera, por «…». */
const CORRECCION = VEREDICTO.split("\n").find((l) => l.startsWith("- N3, ítem 4: "));
const [EMPIEZA, NUEVA] = citas(CORRECCION).map((c) => c.replace(/…$/, ""));
const corregir = (caso) => {
  const i = caso.indexOf(EMPIEZA);
  assert.ok(i > 0, "el caso 4 de la tanda no trae la frase que se corrige");
  assert.ok(caso.endsWith("."), "la frase vieja no cierra el caso");
  return caso.slice(0, i) + NUEVA;
};

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ el enunciado, las opciones y el pie son los de la tanda, letra por letra", () => {
  assert.ok(N3.startsWith(`## N3 · «${D.N3.nombre}»`));
  assert.ok(N3.includes(`id \`${D.N3_ID}\``));
  assert.ok(N3.includes("Migración **0111**"));
  const en = N3.slice(N3.indexOf("### Enunciado"), N3.indexOf("### Ítems")).split("\n").filter((l) => l.startsWith("- «"));
  assert.deepEqual(D.N3.enunciado, en.map((l) => citas(l)[0]));
  assert.ok(N3.includes(`**Pie de todos los ítems:** «${D.N3.pie}».`));
  const ops = citas(N3.split("\n").find((l) => l.startsWith("- Opciones en todos los casos: ")));
  for (const x of D.ITEMS_N3) assert.deepEqual(x.opciones, ops);
});

test("★★★ los cinco casos son los de la tanda, y el 4 lleva la corrección de Mello tal cual", () => {
  const fs = filas();
  assert.equal(fs.length, 5);
  for (const [k, [n, caso, correcta, error, acierto]] of fs.entries()) {
    const it = D.ITEMS_N3[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, k === 3 ? corregir(citas(caso)[0]) : citas(caso)[0], it.id);
    assert.ok(it.correcta.startsWith(`${correcta} `), it.id);
    assert.equal(it.error, citas(error)[0], it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
  }
  assert.equal(D.ITEMS_N3[3].pregunta, "La empresa pagó unos bonos hace tres días y el documento no ha llegado. Nadie sabe si esa compra sigue en curso.");
  /* La vieja repetía el verbo de la opción correcta. */
  assert.doesNotMatch(D.ITEMS_N3[3].pregunta, /confirm/i);
});

test("★★★ sin cifras; del fondo fiduciario solo el nombre; nada interno sale en pantalla", () => {
  const visibles = [...D.N3.enunciado, ...D.ITEMS_N3.flatMap((x) => [x.pregunta, x.error, x.acierto, ...x.opciones])];
  for (const v of visibles) assert.doesNotMatch(v, /\$|\d/, v);
  const texto = visibles.join("\n");
  assert.doesNotMatch(texto, /maneja a nombre de otra|Verificar las activos/);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "INFLESZ", "C5-"]) assert.ok(!texto.includes(interno), interno);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararN3();
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(RevisionQueFalta, { Marco, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => [...caja.querySelectorAll("[data-opcion]")].find((x) => x.dataset.opcion === v)?.querySelector("button");
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.N3.pie);
    /* Sin barajar: las cuatro acciones en el orden de la tanda. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), D.ITEMS_N3[k].opciones);
    const v = falla(it.id) ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta;
    await tocar(opcion(m.caja, v));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
    const ok = v === it.correcta;
    assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.error]);
    if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 4 ? D.BOTON_N3.verResumen : D.BOTON_N3.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: cinco casos, un intento cada uno, y el porcentaje es aciertos / 5", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(D.N3.enunciado[0]));
    const fallos = new Set(["movimiento-del-ano", "fondo-fiduciario"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesN3());
    assert.equal(L.TOTAL_N3, 5);
    assert.equal(pct, (3 / 5) * 100);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenN3(3, 5));
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 justo después de N2, que la sostiene (decisión de corte, punto 6): evaluativa, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N3_ID).nombre, D.N3.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.N3_ID), ids.indexOf("t5-a1-cuidar-las-inversiones") + 1);
  assert.equal(ids.indexOf("b5-t5-a2-los-tres-momentos-de-una-inversion"), ids.indexOf(D.N3_ID) + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N3_ID).Mecanica, RevisionQueFalta);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0111: la que da la decisión de corte, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t5-revision-que-falta',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-revision-que-falta';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N3_ID)), ["0111_t5_revision_que_falta.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0111")), ["0111_t5_revision_que_falta.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 5);
    for (const id of ids) {
      const e = etiquetaDeItem(D.N3_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeN3(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeN3(id))).size, 5);
  } finally {
    m.desmontar();
  }
});
