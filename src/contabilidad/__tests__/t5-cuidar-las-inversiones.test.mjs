import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N2 «Cómo se cuidan las inversiones» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la tanda 1 v1.1 de
 *     Near, y cada texto visible de N2 en la tanda está en los datos
 *   · las cuatro acciones van una por pantalla, en el orden de la p. 193
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · fuera del catálogo de FP; en T5 entre b5-t5-a1 y los tres momentos
 *     (decisión de corte de T5, punto 6), y en la vista con su componente
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

const N = await import("../../data/contabilidadT5_n2.js");
const A7 = await import("../../data/contabilidadT7_1_a7.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");
const { PIEZAS, TEMA } = await import("../../components/ContabilidadTema5View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const TANDA = readFileSync(new URL("orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md", RAIZ), "utf8");
/* La sección de N2, sin sus notas (que citan la errata C5-b, que no sale en pantalla). */
const N2 = TANDA.slice(TANDA.indexOf("## N2 · "), TANDA.indexOf("**Notas.**", TANDA.indexOf("## N2 · ")));
const P = N.PIEZA_CUIDAR_LAS_INVERSIONES;

/*
 * El lote 2 de Near (pistas y anexo): sus textos valen como los del paquete,
 * pero solo los de esta pieza (su sección de pistas y sus filas del anexo).
 */
const LOTE2 = (f) => conCorreccionesDeMello(readFileSync(new URL(`orquestador/conocimiento/paquetes/lote2-${f}-v1.md`, RAIZ), "utf8"));
let l2;
function L2() {
  if (l2 !== undefined) return l2;
  const pistas = LOTE2("pistas");
  const i = pistas.indexOf(`\n### ${P.id} · `);
  assert.ok(i >= 0, `${P.id} no tiene sección en el lote 2`);
  const fin = pistas.slice(i + 1).search(/\n(### |\*\*Decisión)/);
  const seccion = fin < 0 ? pistas.slice(i) : pistas.slice(i, i + 1 + fin);
  l2 = [seccion, ...LOTE2("anexo").split("\n").filter((l) => l.startsWith(`| ${P.id} |`))].join("\n");
  return l2;
}
/* Las pistas del lote 2 para esta pieza: la tercera columna de su tabla. */
const pistasL2 = () => L2().split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => l.split(" | ")[2].replace(/^«|»$/g, ""));
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "boton", "pie", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []));
    if (p.error?.pie) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.pista) t.push(p.pista);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.pie ? [p.acierto.pie] : []));
  }
  return t;
}

/* Los «…» de primer nivel de N2 que se ven. Fuera: paréntesis, «*[…]*» y las etiquetas «Error «…»:». */
function citasVisibles(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    .replace(/\([^()]*\)/g, "")
    .replace(/^(\s*- )Error «[^»]*»: /gm, "$1");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de N2 no cierran");
  return citas;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en N2 de la tanda 1 v1.1", () => {
  assert.match(TANDA, /^# T5 · Tanda 1 · versión 1\.1 \(N1, N2 y N3\)/);
  const faltan = textosVisibles().filter((t) => !N2.includes(`«${t}»`) && !L2().includes(`«${t}»`));
  /* «Seguir», «Confirmar» y «Probar otra» son la convención de A7 de T7-1; la tanda solo nombra «Empezar» y «Seguir» de P1. */
  assert.deepEqual(faltan.filter((t) => !Object.values(N.BOTON).includes(t)), [], "estos textos no están en N2");
});

test("★★★ cada texto visible de N2 en la tanda está en los datos", () => {
  const datos = new Set([...textosVisibles(), ...Object.values(N.BOTON)]);
  /* Cada pista del lote 2 para esta pieza está en los datos. */
  assert.ok(pistasL2().length > 0, "no se leyó ninguna pista del lote 2");
  assert.deepEqual(pistasL2().filter((x) => !datos.has(x)), [], "estas pistas del lote 2 no están en los datos");
  const citas = citasVisibles(N2);
  assert.ok(citas.length >= 25, `se leyeron solo ${citas.length} textos`);
  assert.deepEqual(citas.filter((c) => !datos.has(c)), []);
});

test("★★ las cuatro acciones de la p. 193, una por pantalla y en su orden; el fondo fiduciario sin contenido inventado", () => {
  assert.deepEqual(P.pantallas.map((p) => p.id), ["portada", "por-que-revisar", "verificar", "examinar", "confirmar", "comprobar", "practica", "resumen"]);
  const abre = ["verificar", "examinar", "confirmar", "comprobar"].map((id) => pantalla(id).parrafos[0].split(" ").slice(0, 4).join(" "));
  assert.deepEqual(abre, ["La primera es verificar", "La segunda es examinar", "La tercera es confirmar", "La cuarta es comprobar"]);
  assert.deepEqual(pantalla("comprobar").parrafos.slice(1), ["El libro solo nombra esta acción. No explica qué es un fondo fiduciario."]);
  assert.ok(!N2.includes("es dinero que una entidad maneja"), "volvió la glosa que la v1.1 quitó");
  assert.deepEqual(pantalla("resumen").parrafos.map((t) => t.split(":")[0]), ["Verificar", "Examinar", "Confirmar", "Comprobar"]);
});

/* ═══════════ 2 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    if (el.textContent !== "") out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(ControlInterno, { pieza: P, rotulo: "R" }));
  const vistos = [];
  try {
    assert.equal(m.caja.textContent.includes(P.titulo), true, "falta el título");
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pieza, N.N2_ID);
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [p.objetivo, ...(p.parrafos ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...p.parrafos, p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, N.BOTON.confirmar], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda: el 1.er error da la pista; el 2.º y los siguientes, la respuesta con su porqué. */
      assert.ok(p.pista, `${p.id}: sin pista`);
      const malas = p.opciones.filter((x) => !x.correcta);
      for (const [i, o] of malas.entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A7.INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), N.BOTON.probarOtra], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      /* Si vuelve a una opción ya fallada, sigue la respuesta, no vuelve la pista. */
      {
        const o = malas[0];
        const i = malas.length;
        assert.equal(textosDelError(p, o, i + 1)[0], `La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`);
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A7.INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), N.BOTON.probarOtra], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A7.INTERFAZ.correcto, p.acierto.texto, N.BOTON.seguir], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 7 + 4);
    assert.equal(m.caja.querySelector("[data-boton]"), null, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los botones son los de A7 de T7-1, y el pie solo va donde la tanda lo da (P0 y P7)", () => {
  assert.deepEqual(N.BOTON, A7.BOTON);
  assert.deepEqual(P.pantallas.filter((p) => p.pie).map((p) => p.id), ["portada", "resumen"]);
  assert.ok(N2.includes(`Botón: «Empezar» · Pie: «${pantalla("portada").pie}»`));
  assert.ok(N2.includes(`- Pie: «${pantalla("resumen").pie}»`));
});

/* ═══════════ 3 · CATÁLOGO Y VISTA ═══════════ */

test("★★★ fuera del catálogo de FP; id t5-; en T5 después de b5-t5-a1 y antes de los tres momentos; en la vista con su componente", () => {
  assert.equal(N.N2_ID, "t5-a1-cuidar-las-inversiones");
  assert.equal(TEMA, "activos-financieros");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA);
  const a = tema.actividades.find((x) => x.id === N.N2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  /* Punto 6: b5-t5-a1 (2) · N1 (3) · N2 (4) · N3 (5) · los tres momentos (6). N1 y N3 llegan en sus PR. */
  const sinNuevas = ids.filter((id) => !["t5-temporal-o-largo-plazo", "t5-revision-que-falta"].includes(id));
  assert.equal(sinNuevas.indexOf(N.N2_ID), sinNuevas.indexOf("b5-t5-a1") + 1);
  assert.equal(sinNuevas.indexOf("b5-t5-a2-los-tres-momentos-de-una-inversion"), sinNuevas.indexOf(N.N2_ID) + 1);
  const entrada = PIEZAS.find((x) => x.pieza.id === N.N2_ID);
  assert.equal(entrada.Pieza, ControlInterno);
  assert.deepEqual(PIEZAS.map((x) => x.pieza.id), tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(N.N2_ID)), []);
  assert.doesNotMatch(readFileSync(new URL("src/data/contabilidadT5_n2.js", RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
  const texto = textosVisibles().join("\n");
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "HUECO", "INFLESZ", "C5-", "las activos"]) assert.ok(!texto.includes(interno), interno);
});

test("★★ la vista pinta N2 con su componente, entre las dos piezas de B, con «Pieza 2 de 4» (N6 es la cuarta)", async () => {
  const { default: Vista } = await import("../../components/ContabilidadTema5View.jsx");
  const VISTA = readFileSync(new URL("src/components/ContabilidadTema5View.jsx", RAIZ), "utf8");
  assert.match(VISTA, /if \(Pieza\) \{[\s\S]*<Pieza pieza=\{pieza\} rotulo=\{rotulo\} \/>/);
  assert.equal(typeof Vista, "function");
  assert.deepEqual(PIEZAS.map((x) => Boolean(x.Pieza)), [false, true, false, true]);
});
