import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 «Control interno de los inventarios» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near (las
 *     pistas, en el paquete del lote 2), y cada texto visible de la v1 está
 *     en los datos, salvo la línea «Siguiente» que la v2 quita (vuelve con H7)
 *   · la lista de controles de P3 es la del libro, numerada y en su orden
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · fuera del catálogo de FP; en T7-1 después de A6
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

const A = await import("../../data/contabilidadT7_1_a7.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-1-a7-v1.md");
const V2 = leer("t7-1-a7-v2-cambios.md");
/* Lote 2 de la revisión de calidad: las pistas del primer error (Near). */
const LOTE2_PISTAS = leer("lote2-pistas-v1.md");
const LOTE2_ANEXO = leer("lote2-anexo-v1.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Términos"));
const P = A.PIEZA_CONTROL_INTERNO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const SIGUIENTE_V1 = "Siguiente: «¿Qué control falta?».";

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
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.despues ?? []));
    if (p.error) t.push(p.error.pie);
    if (p.pista) t.push(p.pista);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie);
  }
  return t;
}

/* Los «…» de primer nivel del contenido que se ven. Fuera: paréntesis, «*[…]*», lo que «Dejo fuera» y las etiquetas de error. */
function citasVisibles(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    .replace(/\([^()]*\)/g, "")
    .replace(/^- \*Dejo fuera:\*.*$/gm, "")
    .replace(/^(\s*- )«[^»]*»: /gm, "$1");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de la v1 no cierran");
  return citas;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1 (o, si es del lote 2, en su paquete)", () => {
  const faltan = textosVisibles().filter((t) => !V1.includes(t) && !LOTE2_PISTAS.includes(t) && !LOTE2_ANEXO.includes(t));
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v1");
});

test("★★★ cada texto visible de la v1 está en los datos; la línea «Siguiente» volvió con H7, como dice la v2", () => {
  const datos = new Set([...textosVisibles(), ...Object.values(A.BOTON)]);
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 30, `se leyeron solo ${citas.length} textos`);
  assert.deepEqual(citas.filter((c) => !datos.has(c)), []);
  assert.ok(V2.includes("**Se quita la línea de P4 «Siguiente: «¿Qué control falta?»».**"));
  /* La v2 la quitó hasta que H7 estuviera publicada: vuelve solo si H7 está en el catálogo, y es la de la v1. */
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  assert.ok(tema.actividades.some((x) => x.id === "t7-1-que-control-falta"), "la línea volvió sin H7 publicada");
  assert.equal(pantalla("resumen").siguiente, SIGUIENTE_V1);
});

/* ═══════════ LOTE 2 · LAS PISTAS Y EL ANEXO DE NEAR ═══════════ */

/* Las pistas del lote 2 de una pieza, por pantalla («id») o por línea («id · línea»). */
function pistasDeNear(pieza) {
  const desde = LOTE2_PISTAS.indexOf(`### ${pieza} `);
  assert.ok(desde >= 0, `la pieza ${pieza} no está en el lote 2`);
  const hasta = LOTE2_PISTAS.indexOf("\n### ", desde);
  return Object.fromEntries(LOTE2_PISTAS.slice(desde, hasta < 0 ? undefined : hasta).split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    const [, id, linea] = c[0].match(/`([^`]+)`(?: · (\S+))?/);
    return [linea && linea !== "²" ? `${id} · ${linea}` : id, c[2].match(/^«(.+)»$/)[1]];
  }));
}

/* Las pistas que llevan los datos de una pieza, con las mismas claves. */
function pistasDeLosDatos(pieza) {
  const out = {};
  for (const p of pieza.pantallas) {
    if (p.opciones) out[p.id] = p.pista;
    for (const l of p.lineas ?? []) out[`${p.id} · ${l.id}`] = l.pista ?? p.pista;
  }
  return out;
}

test("★★★ lote 2 · pistas: cada pregunta lleva la suya, letra por letra la de Near para su pantalla", () => {
  assert.deepEqual(pistasDeLosDatos(P), pistasDeNear(A.A7_ID));
  /* Sin preguntas de dos opciones: el anexo no toca esta pieza. */
  assert.ok(!LOTE2_ANEXO.includes(`| ${A.A7_ID} |`));
});

test("★★ la lista de P3 es la del libro, en su orden, y va numerada", async () => {
  const v1 = CONTENIDO.slice(CONTENIDO.indexOf("La lista del libro")).split("\n").filter((l) => /^\s+\d\. «/.test(l)).map((l) => l.match(/«([^»]+)»/)[1]);
  assert.deepEqual(pantalla("controles-de-seguridad").lista, v1);
  const m = await montar(h(ControlInterno, { pieza: { ...P, pantallas: [pantalla("controles-de-seguridad")] }, rotulo: "R" }));
  try {
    const ol = m.caja.querySelector("ol[data-lista]");
    assert.ok(ol, "la lista no es una lista numerada");
    assert.deepEqual([...ol.querySelectorAll("li")].map((li) => li.textContent), v1);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 2 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(ControlInterno, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [p.objetivo, ...(p.parrafos ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...p.parrafos, ...(p.lista ?? []), ...(p.despues ?? []), p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda (lote 2): el 1.er error da la pista; el 2.º y siguientes, la respuesta con su porqué.
       * Se recorren todas las incorrectas y luego se falla otra vez la primera, para ver los dos peldaños. */
      assert.ok(p.pista, `${p.id} sin pista del lote 2`);
      const malas = p.opciones.filter((x) => !x.correcta);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        fallos++;
        const esperados = textosDelError(p, o, fallos);
        assert.deepEqual(esperados, fallos === 1 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, p.acierto.texto.replace(/^Así es[.:]\s*/, "")].filter(Boolean), `${p.id} escalera ${fallos}`);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...esperados, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${fallos} ${o.id}`);
        vistos.push(`${p.id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* 3 pantallas sin pregunta; 2 preguntas × (colocando + 2 incorrectas + la 1.ª otra vez + acierto). */
    assert.equal(vistos.length, 3 + 2 * 5);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies de cada estado son los de la v1", () => {
  const pies = (id) => [pantalla(id).pie, pantalla(id).error.pie, pantalla(id).acierto.pie];
  assert.deepEqual(pies("al-recibir"), ["Basado en el libro, pp. 208-209", "Basado en el libro, pp. 208-209", "Basado en el libro, p. 208"]);
  assert.deepEqual(pies("controles-de-seguridad"), ["Basado en el libro, p. 209", "Basado en el libro, p. 209", "Basado en el libro, p. 209"]);
  const s = (a, b) => CONTENIDO.slice(CONTENIDO.indexOf(a), CONTENIDO.indexOf(b));
  assert.ok(s("**P2 · acierto**", "**P3").includes(`Pie: «${pantalla("al-recibir").acierto.pie}»`));
  assert.ok(s("**P2 · error**", "**P2 · acierto**").includes(`Pie: «${pantalla("al-recibir").error.pie}»`));
});

test("★★ las opciones se barajan en cada intento", async () => {
  const m = await montar(h(ControlInterno, { pieza: { ...P, pantallas: [pantalla("al-recibir")] }, rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    let antes = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="conteo"]'));
      await tocar(boton(m.caja, "confirmar"));
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; id t7-; en T7-1 después de A6; sin nada interno", () => {
  assert.equal(A.A7_ID, "t7-1-a7-control-interno");
  assert.equal(P.numero, 7);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A7_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  /* Entre A6 y A7 solo cabe Hacer (H6), no otra pieza de Aprender. */
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A7_ID), aprender.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
  assert.ok(ids.indexOf(A.A7_ID) > ids.indexOf("t7-1-a6-devoluciones-en-periodico"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A7_ID), piezas.indexOf("t7-1-a6-devoluciones-en-periodico") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A7_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ControlInterno.jsx", "src/data/contabilidadT7_1_a7.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "construcción", "Near", "Mello", "H7", "capital de trabajo"]) assert.ok(!texto.includes(interno), interno);
});
