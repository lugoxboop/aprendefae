import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP4 «El cierre en periódico» (Célula C) — el RECORTE del lote 1.
 *
 * Contra el paquete de Near (lote1-recortes-t71-v1.md, su sección de A4) y
 * las dos correcciones obligatorias de Mello (mello-recortes-v1.md):
 *
 *   · cada texto de los datos está, letra por letra, en el recorte (o en la
 *     corrección de Mello, o, la pista de «colocar», en el lote 2), y cada
 *     texto del recorte está en los datos; lo plegado de P2 y P3 es el de la
 *     v2.1 publicada
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · P1: la apuesta, sin calificar; P6 marca su columna con borde, sin texto
 *   · P2 y P3: lo plegado se abre al tocar, con aria-expanded
 *   · P3: «Inventario de mercancías» una sola vez en sus líneas; la escalera
 *   · P5: cada utilidad abre su definición, una a la vez
 *   · P6 (Mello): antes de responder, solo la fila «Inventario final»
 *   · fuera del catálogo de FP, sin el 33 %
 *
 * El ancho a 375 y 320 lo mide scripts/t7/medir-t7-1-ap4.mjs en Chromium.
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

const A = await import("../../data/contabilidadT7_1_ap4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: ElCierre, CSS_AP4 } = await import("../../components/mecanicas/libros/t7/ElCierreEnPeriodico.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { textosDelError, textosDeLinea, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const RECORTES = leer("lote1-recortes-t71-v1.md");
const RECORTE = RECORTES.slice(RECORTES.indexOf("## t7-1-a4-el-cierre-en-periodico"));
const MELLO_MD = leer("mello-recortes-v1.md");
const MELLO = MELLO_MD.slice(MELLO_MD.indexOf("**A4 «El cierre en periódico»"), MELLO_MD.indexOf("### Entrega 3"));
/* Lo plegado de P2 y P3 es lo de la pieza publicada (la v2.1). */
const V21 = leer("t7-1-ap4-v2-1.md");
const V21_CONTENIDO = V21.slice(V21.indexOf("## Contenido por pantalla y estado"), V21.indexOf("## Erratas C7 que toca"));
const LOTE2_PISTAS = leer("lote2-pistas-v1.md");

const P = A.PIEZA_EL_CIERRE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const seccionV21 = (marca, siguiente) => V21_CONTENIDO.slice(V21_CONTENIDO.indexOf(marca), siguiente ? V21_CONTENIDO.indexOf(siguiente) : undefined);
/* Del recorte, la pantalla Pn (hasta la siguiente). */
const pantallaDelRecorte = (n) => RECORTE.slice(RECORTE.indexOf(`**P${n} · `), RECORTE.indexOf(`**P${n + 1} · `) < 0 ? undefined : RECORTE.indexOf(`**P${n + 1} · `));

/* Las dos correcciones obligatorias de Mello a A4; las opcionales no se aplican. */
const NEAR_ANTES_DE_IMPUESTOS = "Todavía no tiene restado el impuesto de renta. Aquí no hay otros ingresos ni gastos: es igual a la operacional.";
const MELLO_ANTES_DE_IMPUESTOS = "Suma y resta lo que no es de la operación, y todavía no resta el impuesto de renta. Aquí eso es cero.";

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
const estado = (caja) => caja.querySelector("[data-estado]")?.dataset.estado ?? null;
const casilla = (caja, linea, lado) => caja.querySelector(`[data-linea="${linea}"][data-lado="${lado}"]`);
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });
const lineaVista = (l) => `${l.texto} · $${A.cifra(l.monto)}`;
const filaVista = (f) => `${f.rubro} ${f.valor}`;
const metodosVistos = (t) => t.metodos.join(" · ");
const filaMetodos = (f) => `${f.rubro} ${f.valores.join(" ")}`;

/* ═══════════ LO QUE EL ESTUDIANTE LEE, SACADO DE LOS DATOS (sin botones ni pies) ═══════════ */

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "consigna", "siguiente", "guardada", "cuenta", "verOperaciones", "verOtros", "cuentaEnUnaLinea", "pista"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.calculos ?? []), ...(p.totales ?? []));
    for (const v of p.valores ?? []) t.push(`${v.metodo} ${v.valor}`);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    for (const l of p.lineas ?? []) t.push(lineaVista(l), l.pista, l.devolucion, l.porque);
    for (const f of p.filas ?? []) { t.push(filaVista(f)); if (f.definicion) t.push(f.definicion); }
    if (p.tabla) t.push(metodosVistos(p.tabla), ...p.tabla.filas.map(filaMetodos));
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.porque ? [p.acierto.porque] : []), ...(p.acierto.calculos ?? []));
  }
  return t.filter(Boolean);
}

/* Los «…» de primer nivel del recorte de A4 (lo de fuera de las comillas no se ve: medidas, INFLESZ, etiquetas). */
function citas(md) {
  const out = [];
  let nivel = 0, actual = "";
  for (const c of md) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas del recorte no cierran");
  return out;
}
const PISTA_COLOCAR = "Ese valor es lo que hay hoy, así que entra a la cuenta. ¿De qué lado sube un activo?";
/* Lo que el recorte pide ver, con la corrección de Mello encima; la pista de «colocar» sigue la del lote 2. */
const DEL_RECORTE = () => [...citas(RECORTE).map((c) => (c === NEAR_ANTES_DE_IMPUESTOS ? MELLO_ANTES_DE_IMPUESTOS : c)), PISTA_COLOCAR];

function tablaDespuesDe(md, marca) {
  const desde = md.indexOf(marca);
  assert.ok(desde >= 0, `no está «${marca}»`);
  const lineas = md.slice(desde).split("\n");
  const inicio = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(inicio)) {
    if (!l.startsWith("|")) break;
    filas.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return filas.filter((f) => !f.every((c) => /^-*$/.test(c)));
}

/* ═══════════ 1 · TEXTOS CONTRA EL RECORTE Y MELLO ═══════════ */

test("★★★ las correcciones de Mello están en su auditoría y ganan sobre Near", () => {
  assert.ok(MELLO.includes(`«${MELLO_ANTES_DE_IMPUESTOS}»`), "la definición de Mello no está en su auditoría");
  assert.ok(MELLO.includes("antes de responder, solo la fila «Inventario final»"));
  assert.ok(RECORTE.includes(`«${NEAR_ANTES_DE_IMPUESTOS}»`), "la definición de Near no está en el recorte");
  assert.equal(pantalla("las-utilidades").filas.find((f) => f.id === "antes-de-impuestos").definicion, MELLO_ANTES_DE_IMPUESTOS);
  assert.ok(!textosVisibles().includes(NEAR_ANTES_DE_IMPUESTOS));
  /* Las opcionales no se aplican: ni «(promedio)» junto a $1.463.846 en P3, ni «¿De dónde salen los tres valores?» en P2. */
  assert.ok(!JSON.stringify(P).includes("(promedio)"));
  assert.ok(!JSON.stringify(P).includes("¿De dónde salen los tres valores?"));
});

test("★★★ cada texto de los datos está, letra por letra, en el recorte (con Mello encima)", () => {
  const recorte = new Set(DEL_RECORTE());
  assert.deepEqual(textosVisibles().filter((t) => !recorte.has(t)), []);
  /* La pista de «colocar» es la del lote 2, que el recorte deja como estaba. */
  assert.ok(LOTE2_PISTAS.includes(`«${PISTA_COLOCAR}»`));
  assert.ok(!RECORTE.includes(PISTA_COLOCAR));
});

test("★★★ cada texto del recorte está en los datos: no falta ninguno", () => {
  const datos = new Set(textosVisibles());
  const c = DEL_RECORTE();
  assert.ok(c.length >= 70, `se leyeron solo ${c.length} textos`);
  assert.deepEqual(c.filter((x) => !datos.has(x)), []);
});

test("★★★ ocho pantallas, en el orden del recorte, con sus ids y sus tipos", () => {
  const delRecorte = [...RECORTE.matchAll(/^\*\*P(\d+) · `([^`]+)`\*\* \(([^)]+)\)/gm)].map((m) => [Number(m[1]), m[2], m[3]]);
  assert.equal(delRecorte.length, 8);
  /* «portada» es de tipo lectura en el componente, como en las demás piezas. */
  assert.deepEqual(P.pantallas.map((p, k) => [k, p.id, p.id === "portada" ? "portada" : p.tipo]), delRecorte);
});

test("★★ botones de la convención; P0 «Empezar»; el resumen sin botón; los pies de la v2.1 en cada estado", () => {
  assert.deepEqual(A.BOTON, { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" });
  assert.equal(pantalla("portada").boton, "Empezar");
  assert.equal(pantalla("resumen").boton, null);
  for (const p of P.pantallas) assert.ok(V21.includes(p.pie), `${p.id}: el pie no es de la v2.1`);
  const pies = (id) => [pantalla(id).pie, pantalla(id).error.pie, pantalla(id).acierto.pie];
  assert.deepEqual(pies("el-cierre"), ["Basado en el libro, pp. 207-208, 210, 212 y 225", "Basado en el libro, pp. 207-208 y 225", "Basado en el libro, pp. 209 y 225-226"]);
  assert.deepEqual(pies("el-costo-de-lo-vendido"), ["Basado en el libro, pp. 214, 223 y 226", "Basado en el libro, pp. 214 y 226", "Basado en el libro, pp. 209 y 226"]);
  assert.deepEqual(pies("lado-a-lado"), ["Basado en el libro, pp. 214 y 226", "Basado en el libro, pp. 226-227", "Basado en el libro, p. 227"]);
});

/* ═══════════ 2 · TABLAS Y CIFRAS ═══════════ */

test("★★★ figuras en el orden del recorte: los tres valores de P1, los totales de P2, las filas de P5 y la tabla de P6", () => {
  const orden = (n, textos) => {
    const s = pantallaDelRecorte(n);
    const pos = textos.map((t) => s.indexOf(`«${t}»`));
    assert.ok(pos.every((x) => x >= 0), `P${n}: falta alguno`);
    assert.deepEqual(pos, [...pos].sort((a, b) => a - b), `P${n}: el orden`);
  };
  orden(1, [...pantalla("la-apuesta").parrafos, ...pantalla("la-apuesta").valores.map((v) => `${v.metodo} ${v.valor}`), pantalla("la-apuesta").pregunta, ...pantalla("la-apuesta").opciones.map((o) => o.texto), pantalla("la-apuesta").guardada]);
  orden(2, [...pantalla("los-datos-de-san-calixto").parrafos, ...pantalla("los-datos-de-san-calixto").totales, pantalla("los-datos-de-san-calixto").verOperaciones]);
  orden(3, [...pantalla("el-cierre").parrafos, pantalla("el-cierre").consigna, pantalla("el-cierre").cuenta, ...pantalla("el-cierre").lineas.map(lineaVista), pantalla("el-cierre").verOtros]);
  orden(4, [...pantalla("el-costo-de-lo-vendido").calculos, ...pantalla("el-costo-de-lo-vendido").parrafos, pantalla("el-costo-de-lo-vendido").pregunta, ...pantalla("el-costo-de-lo-vendido").opciones.map((o) => o.texto)]);
  orden(5, [pantalla("las-utilidades").consigna, ...pantalla("las-utilidades").filas.map(filaVista)]);
  orden(6, [metodosVistos(pantalla("lado-a-lado").tabla), ...pantalla("lado-a-lado").tabla.filas.map(filaMetodos), pantalla("lado-a-lado").pregunta, ...pantalla("lado-a-lado").opciones.map((o) => o.texto)]);
  orden(7, [pantalla("resumen").cuentaEnUnaLinea, ...pantalla("resumen").parrafos, pantalla("resumen").siguiente]);
  /* UEPS con su rótulo en la figura de P1 y en la tabla de P6. */
  assert.equal(pantalla("la-apuesta").valores[1].metodo, "UEPS (no válido bajo NIIF)");
  assert.equal(pantalla("lado-a-lado").tabla.metodos[1], "UEPS (no válido bajo NIIF)");
});

test("★★★ lo plegado es lo publicado: las 10 operaciones del mes (P2) y los 6 otros asientos (P3) de la v2.1", () => {
  const ficha = Object.fromEntries(tablaDespuesDe(seccionV21("### Pantalla 2", "### Pantalla 3"), "Ficha").slice(1));
  const ops = pantalla("los-datos-de-san-calixto").operaciones;
  for (const o of ops) assert.equal(ficha[o.dato].replace(/ · \*\*Total:[^*]+\*\*$/, ""), o.partes.join(" · "), o.dato);
  assert.equal(ops.reduce((n, o) => n + o.partes.length, 0), 10);
  const comoTabla = (ls) => ls.map((l) => [l.cuenta, l.lado === A.DEBE ? A.cifra(l.monto) : "", l.lado === A.HABER ? A.cifra(l.monto) : ""]);
  assert.deepEqual(comoTabla(pantalla("el-cierre").otros), tablaDespuesDe(seccionV21("### Pantalla 4 · colocando", "### Pantalla 4 · error"), "| 28 de febrero").slice(1));
});

test("★★★ las cifras se calculan y son las del libro", () => {
  const C = A.CIFRAS;
  assert.deepEqual([C.inicial, C.compras, C.ingresos, C.disponible, C.unidadesDisponibles], [6760000, 17460000, 45793000, 24220000, 18200]);
  assert.deepEqual(Object.values(C.peps), [1518000, 22702000, 23091000, 11091000, 11091000]);
  assert.deepEqual(Object.values(C.ueps), [1430000, 22790000, 23003000, 11003000, 11003000]);
  assert.deepEqual(Object.values(C.promedio), [1463846, 22756154, 23036846, 11036846, 11036846]);
  /* La línea «colocar» lleva el inventario final del promedio; la correcta de P4, su costo. */
  assert.equal(pantalla("el-cierre").lineas.find((l) => l.id === "final").monto, C.promedio.final);
  assert.equal(pantalla("el-costo-de-lo-vendido").opciones.find((o) => o.correcta).texto, `$${A.cifra(C.promedio.costo)}`);
});

/* ═══════════ LAS PISTAS: LAS DEL RECORTE GANAN ═══════════ */

test("★★★ pistas: las del recorte en P3 «quitar», P4 y P6; la de «colocar» sigue la del lote 2", () => {
  const pista = (n, cual = "") => pantallaDelRecorte(n).match(new RegExp(`\\*pista${cual} \\(1\\.er error\\):\\* «([^»]+)»`))[1];
  /* La escalera de los recortes ubica la línea por el comienzo de su texto: «quitar» → «Quitar…». */
  const quitar = pantalla("el-cierre").lineas.find((l) => l.texto.toLowerCase().startsWith("quitar"));
  assert.equal(quitar.id, "inicial");
  assert.equal(quitar.pista, pista(3, " · quitar"));
  assert.equal(pantalla("el-cierre").lineas.find((l) => l.id === "final").pista, PISTA_COLOCAR);
  assert.equal(pantalla("el-costo-de-lo-vendido").pista, pista(4));
  assert.equal(pantalla("lado-a-lado").pista, pista(6));
  /* Y la tabla de cambios del recorte, para las dos que cambian. */
  assert.ok(RECORTES.includes(`| Pista · A4 \`el-cierre\` · quitar | «Ese valor ya no es lo que hay, así que sale de la cuenta. ¿De qué lado baja un activo?» | «${quitar.pista}» |`));
  assert.ok(RECORTES.includes(`«${pantalla("lado-a-lado").pista}» |`));
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS, MONTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const conPorque = (t, porque) => (porque ? `${t} ${porque}` : t);

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie (la pieza entera)", async () => {
  const m = await montar(h(ElCierre, { rotulo: "R" }));
  const vistos = [];
  const ver = () => enPantalla(m.caja);
  try {
    /* P0 */
    const p0 = pantalla("portada");
    assert.deepEqual(ver().textos, [p0.objetivo, p0.boton, p0.pie]);
    vistos.push("portada");
    await tocar(boton(m.caja, "empezar"));

    /* P1 · la apuesta: sin calificar */
    const p1 = pantalla("la-apuesta");
    const cab1 = [...p1.parrafos, ...p1.valores.map((v) => `${v.metodo} ${v.valor}`), p1.pregunta];
    const ops1 = p1.opciones.map((o) => o.texto).sort();
    assert.deepEqual(ver(), { textos: [...cab1, p1.pie], opciones: ops1 }, "la-apuesta eligiendo");
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.textContent), p1.opciones.map((o) => o.texto), "las opciones de la apuesta van en el orden del recorte");
    vistos.push("la-apuesta:eligiendo");
    await tocar(m.caja.querySelector('[data-opcion="ueps"]'));
    assert.deepEqual(ver(), { textos: [...cab1, p1.guardada, A.BOTON.seguir, p1.pie], opciones: ops1 }, "la-apuesta apostada");
    assert.equal(m.caja.querySelector("[data-palabra]"), null, "la apuesta no se califica");
    assert.equal(document.activeElement, m.caja.querySelector('[data-mensaje="apuesta"]'), "el foco va al mensaje");
    vistos.push("la-apuesta:apostada");
    /* Se puede cambiar antes de seguir: queda la última. */
    await tocar(m.caja.querySelector('[data-opcion="peps"]'));
    assert.equal(m.caja.querySelector('[data-opcion="peps"]').getAttribute("aria-pressed"), "true");
    assert.equal(m.caja.querySelector('[data-opcion="ueps"]').getAttribute("aria-pressed"), "false");
    await tocar(boton(m.caja, "seguir"));

    /* P2 · totales; las operaciones, plegadas */
    const p2 = pantalla("los-datos-de-san-calixto");
    assert.deepEqual(ver().textos, [...p2.parrafos, ...p2.totales, p2.verOperaciones, p2.boton, p2.pie]);
    vistos.push("datos:plegado");
    await tocar(m.caja.querySelector('[data-plegar="operaciones"]'));
    assert.deepEqual(ver().textos, [...p2.parrafos, ...p2.totales, p2.verOperaciones, ...p2.operaciones.flatMap((o) => [o.dato, ...o.partes]), p2.boton, p2.pie]);
    vistos.push("datos:abierto");
    await tocar(boton(m.caja, "seguir"));

    /* P3 · el cierre: todo al revés dos veces, luego el acierto */
    const p3 = pantalla("el-cierre");
    const otro = (lado) => (lado === A.DEBE ? A.HABER : A.DEBE);
    const cab3 = [...p3.parrafos, p3.consigna, p3.cuenta];
    assert.deepEqual(ver().textos, [...cab3, ...p3.lineas.map(lineaVista), p3.verOtros, A.BOTON.confirmar, p3.pie], "el-cierre colocando");
    vistos.push("el-cierre:colocando");
    for (const fallos of [1, 2]) {
      for (const l of p3.lineas) await tocar(casilla(m.caja, l.id, otro(l.lado)));
      /* Puestas, el monto pasa a su casilla. */
      assert.deepEqual([...m.caja.querySelectorAll("[data-texto-linea]")].map((x) => x.textContent), p3.lineas.map((l) => l.texto));
      await tocar(boton(m.caja, "confirmar"));
      for (const l of p3.lineas) assert.deepEqual(textosDeLinea(p3, l, fallos), fallos === 1 ? [l.pista] : [`La respuesta es «${l.lado === A.DEBE ? "Debe" : "Haber"}».`, l.devolucion], `${l.id} escalera ${fallos}`);
      const err = p3.lineas.flatMap((l) => [l.texto, A.INTERFAZ.incorrecto, ...textosDeLinea(p3, l, fallos).map((t) => conPorque(t, t === l.devolucion ? l.porque : null))]);
      assert.deepEqual(ver().textos, [...cab3, ...err, p3.verOtros, A.BOTON.probarOtra, p3.error.pie], `el-cierre error ${fallos}`);
      vistos.push(`el-cierre:error${fallos}`);
      await tocar(boton(m.caja, "probar-otra"));
      for (const l of p3.lineas) assert.equal(casilla(m.caja, l.id, l.lado).dataset.llena, fallos === 1 ? "no" : "si", `${l.id} tras probar otra ${fallos}`);
    }
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(ver().textos, [...cab3, ...p3.lineas.map((l) => l.texto), p3.verOtros, A.INTERFAZ.correcto, conPorque(p3.acierto.texto, p3.acierto.porque), A.BOTON.seguir, p3.acierto.pie], "el-cierre acierto");
    vistos.push("el-cierre:acierto");
    await tocar(boton(m.caja, "seguir"));

    /* P4 y P6 · elección con la escalera; P5 entre medio */
    for (const id of ["el-costo-de-lo-vendido", "las-utilidades", "lado-a-lado"]) {
      const p = pantalla(id);
      if (p.tipo === "tocar-filas") {
        const base = [p.consigna, ...p.filas.map(filaVista)];
        assert.deepEqual(ver().textos, [...base, p.boton, p.pie], `${id} cerradas`);
        vistos.push(`${id}:cerradas`);
        for (const f of p.filas.filter((x) => x.definicion)) {
          await tocar(m.caja.querySelector(`[data-utilidad="${f.id}"]`));
          const k = base.indexOf(filaVista(f));
          assert.deepEqual(ver().textos, [...base.slice(0, k + 1), f.definicion, ...base.slice(k + 1), p.boton, p.pie], `${id} abierta ${f.id}`);
          vistos.push(`${id}:${f.id}`);
        }
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      const tabla = p.tabla ? [metodosVistos(p.tabla)] : [];
      const filasAntes = p.tabla ? p.tabla.filas.filter((f) => !f.despues).map((f) => f.rubro) : [];
      const cab = [...(p.calculos ?? []), ...p.parrafos, p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      const rubros = () => [...m.caja.querySelectorAll("[data-rubro]")].map((r) => r.dataset.rubro);
      assert.deepEqual(ver(), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${id} colocando`);
      assert.deepEqual(rubros(), filasAntes, `${id}: filas antes de responder`);
      vistos.push(`${id}:colocando`);
      const malas = p.opciones.filter((x) => !x.correcta);
      const porque = (t) => (p.acierto.porque && t === sinAsiEs(p.acierto.texto) ? p.acierto.porque : null);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        fallos++;
        const esperados = textosDelError(p, o, fallos);
        assert.deepEqual(esperados, fallos === 1 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, sinAsiEs(p.acierto.texto)], `${id} escalera ${fallos}`);
        assert.deepEqual(ver(), { textos: [...cab, A.INTERFAZ.incorrecto, ...esperados.map((t) => conPorque(t, porque(t))), A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${id} error ${fallos} ${o.id}`);
        assert.deepEqual(rubros(), filasAntes, `${id}: tras el error siguen solo las filas de antes`);
        assert.equal(document.activeElement, m.caja.querySelector('[data-mensaje="error"]'), "el foco va al mensaje");
        vistos.push(`${id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(ver(), { textos: [...cab, A.INTERFAZ.correcto, conPorque(p.acierto.texto, p.acierto.porque), A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${id} acierto`);
      if (p.tabla) assert.deepEqual(rubros(), p.tabla.filas.map((f) => f.rubro), `${id}: con el acierto, todas las filas`);
      vistos.push(`${id}:acierto`);
      void tabla;
      await tocar(boton(m.caja, "seguir"));
    }

    /* P7 */
    const p7 = pantalla("resumen");
    assert.deepEqual(ver().textos, [p7.cuentaEnUnaLinea, ...p7.parrafos, p7.siguiente, p7.pie]);
    assert.equal(m.caja.querySelector("[data-boton]"), null);
    vistos.push("resumen");
    /* P0 + P1 (2) + P2 (2) + P3 (4) + P4 (5) + P5 (4) + P6 (5) + P7. */
    assert.equal(vistos.length, 1 + 2 + 2 + 4 + 5 + 4 + 5 + 1);
  } finally {
    m.desmontar();
  }
});

test("★★★ P1 → P6: la columna de la apuesta va marcada con borde, sin texto; «Igual con los tres» no marca ninguna", async () => {
  for (const o of pantalla("la-apuesta").opciones) {
    const m = await montar(h(ElCierre, { pieza: conPieza("la-apuesta", "lado-a-lado"), rotulo: "R" }));
    try {
      await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(m.caja, "seguir"));
      const t = m.caja.querySelector("[data-metodos]");
      const marcadas = () => [...t.querySelectorAll("[data-apuesta=si]")];
      const indice = (el) => (el.getAttribute("role") === "columnheader" ? pantalla("lado-a-lado").tabla.metodos.indexOf(el.textContent) : Number(el.querySelector("[data-dato-metodo]").dataset.datoMetodo));
      if (o.columna === null) assert.equal(marcadas().length, 0, o.id);
      else {
        /* El encabezado y la fila «Inventario final». */
        assert.equal(marcadas().length, 2, o.id);
        assert.ok(marcadas().every((el) => indice(el) === o.columna && el.classList.contains("t7a4-er-apuesta")), o.id);
      }
      /* Sin texto: la tabla dice lo mismo con apuesta que sin ella. */
      const sin = await montar(h(ElCierre, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
      assert.equal(t.textContent, sin.caja.querySelector("[data-metodos]").textContent);
      assert.equal(sin.caja.querySelectorAll("[data-apuesta=si]").length, 0);
      sin.desmontar();
      /* Con el acierto, las tres filas llevan la marca. */
      await tocar(m.caja.querySelector('[data-opcion="bajo-y-alta"]'));
      await tocar(boton(m.caja, "confirmar"));
      assert.equal(marcadas().length, o.columna === null ? 0 : 4, `${o.id} acierto`);
    } finally {
      m.desmontar();
    }
  }
  assert.match(CSS_AP4, /\.t7a4-er-apuesta \{ box-shadow: inset 0 0 0 2px #F8F9FA;/, "el borde es neutro, ni teal ni ámbar");
});

test("★★★ P2 y P3: lo plegado se abre y se cierra al tocar, con aria-expanded y aria-controls", async () => {
  for (const [id, cual, sel] of [["los-datos-de-san-calixto", "operaciones", "[data-operaciones]"], ["el-cierre", "otros", "[data-asientos]"]]) {
    const m = await montar(h(ElCierre, { pieza: conPieza(id), rotulo: "R" }));
    try {
      const b = m.caja.querySelector(`[data-plegar="${cual}"]`);
      assert.equal(b.tagName, "BUTTON");
      assert.equal(b.getAttribute("aria-expanded"), "false");
      assert.equal(m.caja.querySelector(sel), null, `${id}: abierto antes de tocar`);
      await tocar(b);
      assert.equal(b.getAttribute("aria-expanded"), "true");
      assert.equal(m.caja.querySelector(sel).id, b.getAttribute("aria-controls"));
      await tocar(b);
      assert.equal(m.caja.querySelector(sel), null, `${id}: no se cierra`);
    } finally {
      m.desmontar();
    }
  }
  /* Los otros asientos, con las del haber en sangría. */
  const m = await montar(h(ElCierre, { pieza: conPieza("el-cierre"), rotulo: "R" }));
  try {
    await tocar(m.caja.querySelector('[data-plegar="otros"]'));
    const filas = [...m.caja.querySelectorAll("[data-asientos] [data-linea]")];
    assert.deepEqual(filas.map((r) => r.textContent), pantalla("el-cierre").otros.map((l) => `${l.cuenta}${l.lado === A.DEBE ? A.cifra(l.monto) : ""}${l.lado === A.DEBE ? "" : A.cifra(l.monto)}`));
    for (const r of filas) assert.equal(r.querySelector("[role=rowheader]").classList.contains("t7a4-sangria"), r.dataset.lado === A.HABER);
    assert.equal(m.caja.querySelector("[data-asientos]").getAttribute("aria-label"), "Asientos del 28 de febrero");
  } finally {
    m.desmontar();
  }
});

test("★★★ P3: «Inventario de mercancías» una sola vez en sus líneas; error bajo su línea; «Probar otra» devuelve solo las mal puestas", async () => {
  const p = pantalla("el-cierre");
  const m = await montar(h(ElCierre, { pieza: conPieza("el-cierre"), rotulo: "R" }));
  try {
    const grupo = m.caja.querySelector("[role=group]");
    assert.equal(grupo.textContent.split("Inventario de mercancías").length - 1, 1);
    assert.equal(grupo.firstElementChild.textContent, p.cuenta, "el nombre va arriba de sus dos líneas");
    assert.equal(casilla(m.caja, "inicial", A.HABER).getAttribute("aria-label"), "Inventario de mercancías, Quitar el inventario inicial: Haber, vacía, lista para recibir");
    /* La inicial bien, la final mal. */
    await tocar(casilla(m.caja, "inicial", A.HABER));
    await tocar(casilla(m.caja, "final", A.HABER));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "error");
    const final = p.lineas.find((l) => l.id === "final");
    const enLinea = () => [...m.caja.querySelectorAll('[data-fila="final"] [data-mensaje=error] p')].map((x) => x.textContent);
    assert.deepEqual(enLinea(), [final.pista]);
    assert.equal(m.caja.querySelectorAll("[data-mensaje=error]").length, 1);
    assert.ok(casilla(m.caja, "final", A.HABER).querySelector(".t7a4-marca svg"), "la casilla mala no lleva la X");
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(casilla(m.caja, "inicial", A.HABER).dataset.llena, "si");
    assert.equal(casilla(m.caja, "final", A.HABER).dataset.llena, "no");
    /* 2.º error: la respuesta y su porqué, con el «¿Por qué?» de Near plegado. */
    await tocar(casilla(m.caja, "final", A.HABER));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(enLinea(), ["La respuesta es «Debe».", `${final.devolucion} ${final.porque}`]);
    const plegado = m.caja.querySelector('[data-fila="final"] [data-plegado]');
    assert.equal(plegado.hidden, true);
    assert.equal(plegado.textContent, ` ${final.porque}`);
    const pq = m.caja.querySelector('[data-fila="final"] [data-por-que]');
    assert.equal(pq.getAttribute("aria-expanded"), "false");
    await tocar(pq);
    assert.equal(m.caja.querySelector('[data-fila="final"] [data-plegado]').hidden, false);
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(casilla(m.caja, "final", A.DEBE).dataset.llena, "si", "la línea cerrada no quedó en su lado");
    await tocar(casilla(m.caja, "final", A.HABER));
    assert.equal(casilla(m.caja, "final", A.DEBE).dataset.llena, "si", "la línea cerrada se pudo mover");
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "acierto");
    assert.equal(document.activeElement, m.caja.querySelector('[data-mensaje="acierto"]'));
    assert.equal(m.caja.querySelector('[data-mensaje="acierto"] [data-plegado]').textContent, ` ${p.acierto.porque}`);
    /* Con el acierto, las líneas no se mueven. */
    await tocar(casilla(m.caja, "inicial", A.DEBE));
    assert.equal(casilla(m.caja, "inicial", A.HABER).dataset.llena, "si");
  } finally {
    m.desmontar();
  }
});

test("★★★ P5: cada utilidad es un botón que abre su definición, una a la vez", async () => {
  const p = pantalla("las-utilidades");
  const m = await montar(h(ElCierre, { pieza: conPieza("las-utilidades"), rotulo: "R" }));
  try {
    const utilidades = p.filas.filter((f) => f.definicion);
    assert.deepEqual(utilidades.map((f) => f.id), ["bruta", "operacional", "antes-de-impuestos"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-utilidad]")].map((b) => [b.tagName, b.textContent]), utilidades.map((f) => ["BUTTON", filaVista(f)]));
    /* Las otras filas no se tocan. */
    assert.equal(m.caja.querySelectorAll("[data-fila-er]:not([data-utilidad])").length, 3);
    assert.equal(m.caja.querySelectorAll("[data-fila-er]:not([data-utilidad]) button, button[data-fila-er]:not([data-utilidad])").length, 0);
    const abiertas = () => [...m.caja.querySelectorAll("[data-definicion]")].map((d) => [d.dataset.definicion, d.textContent]);
    for (const f of utilidades) {
      const b = m.caja.querySelector(`[data-utilidad="${f.id}"]`);
      await tocar(b);
      assert.deepEqual(abiertas(), [[f.id, f.definicion]], f.id);
      assert.equal(b.getAttribute("aria-expanded"), "true");
      assert.equal(m.caja.querySelector("[data-definicion]").id, b.getAttribute("aria-controls"));
      for (const otra of utilidades.filter((x) => x !== f)) assert.equal(m.caja.querySelector(`[data-utilidad="${otra.id}"]`).getAttribute("aria-expanded"), "false");
    }
    /* Tocar la abierta la cierra. */
    await tocar(m.caja.querySelector('[data-utilidad="antes-de-impuestos"]'));
    assert.deepEqual(abiertas(), []);
  } finally {
    m.desmontar();
  }
});

test("★★★ P6 (Mello): antes de responder solo «Inventario final»; las de costo y utilidad llegan con el acierto", async () => {
  const p = pantalla("lado-a-lado");
  assert.deepEqual(p.tabla.filas.map((f) => [f.rubro, Boolean(f.despues)]), [["Inventario final", false], ["Costo de mercancía vendida", true], ["Utilidad antes de impuestos", true]]);
  const m = await montar(h(ElCierre, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  try {
    const t = () => m.caja.querySelector("[data-metodos]");
    const filas = () => [...t().querySelectorAll("[data-rubro]")].map((r) => r.textContent);
    const vista = (f) => `${f.rubro}${f.valores.map((v, i) => `${p.tabla.metodos[i]}${v}`).join("")}`;
    assert.deepEqual(filas(), [vista(p.tabla.filas[0])]);
    /* Las cifras de costo y utilidad no están en ninguna parte de la pantalla. */
    for (const f of p.tabla.filas.slice(1)) for (const v of f.valores) assert.ok(!m.caja.textContent.includes(v), v);
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(filas(), [vista(p.tabla.filas[0])], `tras el error ${o.id}`);
      await tocar(boton(m.caja, "probar-otra"));
    }
    await tocar(m.caja.querySelector('[data-opcion="bajo-y-alta"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(filas(), p.tabla.filas.map(vista));
    assert.equal(t().querySelectorAll(".t7a4-nueva[data-rubro]").length, 2, "las dos nuevas no llegan con fundido");
    assert.equal(t().getAttribute("aria-label"), "Los tres métodos, lado a lado");
  } finally {
    m.desmontar();
  }
  assert.match(CSS_AP4, /@container t7a4 \(max-width: 341px\) \{[^}]*\.t7a4-er-head \{ display: none; \}/);
});

test("★★ P4: ya no da la fórmula antes de preguntar; las opciones se barajan en cada intento", async () => {
  const p = pantalla("el-costo-de-lo-vendido");
  const antes = [...p.calculos, ...p.parrafos, p.pregunta].join(" ");
  assert.doesNotMatch(antes, /se resta|−/, "la fórmula se adelanta");
  assert.ok(!antes.includes(p.opciones.find((o) => o.correcta).texto));
  const m = await montar(h(ElCierre, { pieza: conPieza("el-costo-de-lo-vendido"), rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    let previo = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="compras"]'));
      await tocar(boton(m.caja, "confirmar"));
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), previo);
      previo = orden();
    }
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER ═══════════ */

test("★★ sin el 33 % ni sus cifras, sin los asientos con IVA, sin nada interno; sin teal ni ámbar para el acierto", () => {
  const todo = JSON.stringify(P) + CSS_AP4;
  assert.doesNotMatch(todo, /33 ?%/);
  for (const c of ["3.660.030", "7.430.970", "1.463.847"]) assert.ok(!todo.includes(c), c);
  assert.doesNotMatch(todo, /IVA|Retención/);
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "glosa", "regla", "Near", "Mello", "Watari", "(p. ", "C-1", "X2", "1.330.77", "INFLESZ"]) assert.ok(!texto.includes(interno), interno);
  /* La apuesta no tiene opción correcta ni puntos. */
  assert.ok(pantalla("la-apuesta").opciones.every((o) => !("correcta" in o)));
  for (const regla of CSS_AP4.match(/\.t7a4-(er-apuesta|guardada|res-btn\[aria-expanded="true"\]|msg-ok) \{[^}]*\}/g)) assert.doesNotMatch(regla, /#2A9D8F|#E9C46A/, regla);
});

test("★★★ fuera del catálogo de FP; id t7-; en T7-1 después de AP2 (y de AP3) y justo antes de A5", () => {
  assert.equal(A.AP4_ID, "t7-1-a4-el-cierre-en-periodico");
  assert.equal(P.numero, 4);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.AP4_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  /* Orden final de L: a1, a2, h1, a3, a4, a5, a6, a7. AP4 va después de AP2 (y de AP3, cuando exista). */
  assert.ok(ids.indexOf(A.AP4_ID) > ids.indexOf("t7-1-a2-la-factura-completa"));
  /* Antes de A5: AP4 cierra con «Siguiente: «Importados y fletes»». Entre las dos solo cabe Hacer (H4), no otra pieza de Aprender. */
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.AP4_ID) + 1, aprender.indexOf("t7-1-a5-importados-y-fletes"));
  assert.ok(ids.indexOf(A.AP4_ID) < ids.indexOf("t7-1-a5-importados-y-fletes"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.AP4_ID) + 1, piezas.indexOf("t7-1-a5-importados-y-fletes"));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP4_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ElCierreEnPeriodico.jsx", "src/data/contabilidadT7_1_ap4.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
