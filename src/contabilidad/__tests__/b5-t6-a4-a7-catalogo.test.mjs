import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · EL CATÁLOGO Y LA CONEXIÓN DE b5-t6-a4 A b5-t6-a6 (Célula B).
 * b5-t6-a7 entró con ellas en la 0075 y se retiró en el lote 4 (la 0076 borra
 * su fila): su retiro lo vigila b5-t6-a7-retirada.test.mjs.
 *
 *   · las tres están en el bloque de T6, en el orden del camino, con la
 *     dificultad y los FP de Sakuta
 *   · la vista las abre desde el camino, cada una con su mecánica
 *   · la 0075 trae sus filas: un insert aditivo y repetible, la
 *     comprobación con su resultado y la reversión escrita sin correr
 *   · el panel docente lee cada ítem por su hecho, su casilla o su ficha
 *   · «Así se juega» lleva las tres reglas aprobadas y un ejemplo armado con
 *     textos que ya existen; su guion lo resuelve; después, «¿Cómo se juega?»
 *     lo reabre
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { JUEGOS } = await import("../../components/ContabilidadTema6View.jsx");
const { default: JuegoConTutorial } = await import("../../components/mecanicas/libros/JuegoConTutorial.jsx");
const A4 = await import("../../data/contabilidadT6Act4.js");
const A5 = await import("../../data/contabilidadT6Act5.js");
const A6 = await import("../../data/contabilidadT6Act6.js");
const { default: QueSeDebita } = await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx");
const { default: LaCuentaDeLaProvision } = await import("../../components/mecanicas/libros/tema6/LaCuentaDeLaProvision.jsx");
const { default: ProvisionPorEdades } = await import("../../components/mecanicas/libros/tema6/ProvisionPorEdades.jsx");

const MIGRACION = readFileSync(new URL("../../../supabase/migrations/0075_tema6_cuatro_hacer.sql", import.meta.url), "utf8");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
const CASOS = [
  { id: "b5-t6-a4", D: A4.T6_ACT4, reglas: A4.REGLAS_T6_ACT4, Juego: QueSeDebita, dificultad: "medio", fp: 25 },
  { id: "b5-t6-a5", D: A5.T6_ACT5, reglas: A5.REGLAS_T6_ACT5, Juego: LaCuentaDeLaProvision, dificultad: "medio", fp: 25 },
  { id: "b5-t6-a6", D: A6.T6_ACT6, reglas: A6.REGLAS_T6_ACT6, Juego: ProvisionPorEdades, dificultad: "dificil", fp: 50 },
];
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto) ?? null;
const Marco = ({ children }) => h("div", null, children);

test("★★★ las tres están en el bloque de T6, en el orden del camino, con la clasificación de Sakuta", () => {
  /* El orden provisional del camino (Sakuta, lote 4): a1 → a4 → a5 → a2 → a6 → a3. */
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["b5-t6-a1", "b5-t6-a4", "b5-t6-a5", "b5-t6-a2", "b5-t6-a6", "b5-t6-a3"]);
  for (const k of CASOS) {
    const c = clasificacionDe("contabilidad", "cuentas-por-cobrar", k.id);
    assert.deepEqual({ modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase }, { modalidad: "evaluativa", dificultad: k.dificultad, fpBase: k.fp }, k.id);
    assert.deepEqual([k.D.dificultad, k.D.fpBase], [k.dificultad, k.fp], `${k.id}: los datos dicen lo mismo que el catálogo`);
    assert.equal(actividadesDeTipo(TEMA, HACER).find((a) => a.id === k.id).nombre, k.D.nombre);
  }
});

test("★★★ la vista abre cada una con su mecánica", () => {
  for (const k of CASOS) {
    const j = JUEGOS.find((x) => x.id === k.id);
    assert.ok(j, `la vista no ofrece ${k.id}`);
    assert.equal(j.Mecanica, k.Juego);
    assert.equal(j.titulo, k.D.nombre);
  }
});

test("★★★ la 0075: un insert aditivo y repetible con sus filas, su comprobación y la reversión escrita sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  for (const k of CASOS) {
    assert.match(MIGRACION, new RegExp(`\\('${k.id}',\\s*'contabilidad',\\s*'cuentas-por-cobrar',\\s*'evaluativa',\\s*'${k.dificultad}',\\s*${k.fp},\\s*1\\)`), `${k.id}: su fila`);
    assert.match(MIGRACION, new RegExp(`^--\\s+delete from public\\.actividad_catalogo where activity_id = '${k.id}';$`, "m"), `${k.id}: la reversión, comentada`);
    assert.match(MIGRACION, new RegExp(`^--\\s+${k.id}, contabilidad, cuentas-por-cobrar, ${k.dificultad},\\s+${k.fp}, 1$`, "m"), `${k.id}: el resultado esperado`);
  }
  assert.equal(MIGRACION.match(/insert into/gi).length, 1, "un solo insert");
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id in \('b5-t6-a4', 'b5-t6-a5', 'b5-t6-a6', 'b5-t6-a7'\)/);
  assert.match(MIGRACION, /Erwin la corre en producción ANTES de fusionar/);
});

test("★★ el panel docente lee cada ítem por su hecho, su casilla o su ficha", () => {
  /* El panel corta las etiquetas largas con «…»: lo que se ve es el principio del texto. */
  const lee = (id, item, texto) => {
    const e = etiquetaDeItem(id, item);
    assert.ok(e && texto.startsWith(e.replace(/…$/, "")), `${id} · ${item}: «${e}»`);
  };
  for (const x of A4.HECHOS_T6_ACT4) lee("b5-t6-a4", x.id, x.texto);
  for (const c of A5.CASILLAS_T6_ACT5) lee("b5-t6-a5", c.id, c.enunciado);
  for (const c of A6.PARTES_T6_ACT6.flatMap((p) => p.casillas)) lee("b5-t6-a6", c.id, c.enunciado);
});

test("★★★ «Así se juega»: las tres reglas aprobadas, la consigna, y un ejemplo que no está en el banco ni trae texto nuevo", () => {
  for (const k of CASOS) {
    const asi = ASI_SE_JUEGA[k.id];
    assert.ok(asi, `${k.id}: sin «Así se juega»`);
    assert.deepEqual(asi.pasos, k.reglas);
    assert.equal(asi.consigna, k.D.consigna);
    assert.doesNotMatch(asi.alt, /^Ejemplo/);
  }
  /* Los ejemplos: fuera del banco, y armados con textos que ya existen. */
  assert.ok(!A4.HECHOS_T6_ACT4.includes(ASI_SE_JUEGA["b5-t6-a4"].demo.items[0]));
  const e5 = ASI_SE_JUEGA["b5-t6-a5"].demo.items[0];
  assert.ok(A5.T6_ACT5.partida.startsWith(e5.enunciado) && A5.T6_ACT5.partida.endsWith(e5.resolucion));
  assert.ok(!A5.CASILLAS_T6_ACT5.some((c) => c.enunciado === e5.enunciado));
  const e6 = ASI_SE_JUEGA["b5-t6-a6"].demo.items[0];
  assert.ok(A6.T6_ACT6.partida.startsWith(e6.enunciado));
  assert.deepEqual(e6.opciones.map((o) => o.texto), A6.GRUPOS_T6_ACT6.map((g) => g.nombre));
});

test("★★★ el guion de cada «Así se juega» resuelve su ejemplo con la respuesta correcta", async () => {
  for (const k of CASOS) {
    const asi = ASI_SE_JUEGA[k.id];
    const { caja, desmontar } = await montar(h(k.Juego, { Marco, items: asi.demo.items, modoDemo: true }));
    for (const t of asi.guion.toques) {
      const el = t.texto ? boton(caja, t.texto) : caja.querySelector(t.en);
      assert.ok(el, `${k.id}: el guion toca «${t.en ?? t.texto}» y no está`);
      await tocar(el);
    }
    const bien = caja.querySelector('[data-estado="correcta"]') ?? caja.querySelector('[role="status"]');
    assert.ok(bien, `${k.id}: el ejemplo no queda resuelto`);
    if (caja.querySelector('[role="status"]')) assert.ok(!caja.querySelector('[role="status"]').textContent.includes("❌"), `${k.id}: el ejemplo queda en error`);
    desmontar();
  }
});

test("★★★ en pantalla: la primera vez, «Así se juega» con las tres reglas; después, «¿Cómo se juega?» lo reabre", async () => {
  for (const k of CASOS) {
    localStorage.clear();
    const juego = JUEGOS.find((x) => x.id === k.id);
    const { caja, desmontar } = await montar(h(JuegoConTutorial, { juego, usuarioId: "u", Marco, onCompletar: () => {} }));
    const pasos = () => [...caja.querySelectorAll("ol[data-asj-pasos] li")].map((li) => li.textContent.replace(/^\d/, ""));
    assert.deepEqual(pasos(), k.reglas, `${k.id}: las reglas no se ven`);
    await tocar(boton(caja, "Siguiente"));
    const como = [...caja.querySelectorAll("button")].find((b) => b.textContent.includes("¿Cómo se juega?"));
    assert.ok(como, `${k.id}: la partida no ofrece «¿Cómo se juega?»`);
    await tocar(como);
    assert.deepEqual(pasos(), k.reglas, `${k.id}: no se reabre`);
    desmontar();
  }
});
