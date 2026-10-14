import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP4 «El cierre en periódico» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v2.1, y cada texto
 *     visible de la v2.1 está en los datos
 *   · la ficha, los asientos del cierre (los 6 dados y los 4 que se suman) y
 *     la tabla de los tres métodos son los de la v2.1; las cifras se calculan
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · P4: el error va debajo de su línea, «Probar otra» devuelve solo las mal
 *     puestas; con el acierto la tabla pasa de 6 a 10 filas y sale el saldo
 *   · P7: la tabla del patrón, apilada con 341 px o menos; UEPS con su rótulo
 *   · fuera del catálogo de FP, sin el 33 % ni las cifras que dependen de él
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

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETE = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-ap4-v2-1.md", RAIZ), "utf8");
const CONTENIDO = PAQUETE.slice(PAQUETE.indexOf("## Contenido por pantalla y estado"), PAQUETE.indexOf("## Erratas C7 que toca"));
const P = A.PIEZA_EL_CIERRE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const seccion = (marca, siguiente) => CONTENIDO.slice(CONTENIDO.indexOf(marca), siguiente ? CONTENIDO.indexOf(siguiente) : undefined);

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
const lineaVista = (l) => `${l.cuenta} · ${l.accion} · $${A.cifra(l.monto)}`;
const fijoVisto = (b) => `${b.rotulo}: ${b.filas.map((f) => `${f.rubro} ${f.valor}`).join(" · ")}`;

/* ═══════════ LO QUE EL ESTUDIANTE LEE, SACADO DE LOS DATOS ═══════════ */

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "consigna", "siguiente", "boton", "pie", "cierre"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.calculos ?? []));
    if (p.error) t.push(p.error.pie);
    for (const m of p.metodos ?? []) t.push(m.encabezado, m.texto, ...m.calculos);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    for (const l of p.lineas ?? []) t.push(lineaVista(l), l.devolucion);
    if (p.bloqueFijo) t.push(fijoVisto(p.bloqueFijo));
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie, ...(p.acierto.calculos ?? []), ...(p.acierto.saldo ? [p.acierto.saldo] : []));
  }
  return t;
}

/*
 * Los «…» de primer nivel del contenido que el estudiante ve. Fuera: lo que va
 * entre paréntesis, las notas entre «*[…]*», la línea «Fuente:» de P6 (cita
 * la estructura del libro) y las etiquetas de los errores («Si elige «…»: »).
 */
function citasVisibles(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    /* El rótulo de UEPS lleva paréntesis y sí se ve: se protege antes de quitar las notas. */
    .replace(/ \(no válido bajo NIIF\)/g, " ⟨NIIF⟩")
    .replace(/\([^()]*\)/g, "")
    .replace(/ ⟨NIIF⟩/g, " (no válido bajo NIIF)")
    .replace(/^\s*- Fuente:.*$/gm, "")
    .replace(/Si elige «[^»]*»: /g, "");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de la v2.1 no cierran");
  return citas;
}

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

/* ═══════════ 1 · TEXTOS CONTRA LA v2.1 ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v2.1", () => {
  const faltan = textosVisibles().filter((t) => !PAQUETE.includes(t));
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v2.1");
});

test("★★★ cada texto visible de la v2.1 está en los datos: no falta ninguno", () => {
  const datos = new Set([...textosVisibles(), ...Object.values(A.BOTON)]);
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 60, `se leyeron solo ${citas.length} textos`);
  /* «Tres formas…» va dentro de otro texto: se comprueba ahí. */
  const fuera = new Set(["Tres formas de ponerle precio a lo que quedó"]);
  assert.deepEqual(citas.filter((c) => !datos.has(c) && !fuera.has(c)), []);
});

test("★★ botones de la convención; P0 «Empezar»; el resumen sin botón; los pies de cada estado", () => {
  assert.deepEqual(A.BOTON, { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" });
  assert.equal(pantalla("portada").boton, "Empezar");
  assert.equal(pantalla("resumen").boton, null);
  const pies = (id) => [pantalla(id).pie, pantalla(id).error.pie, pantalla(id).acierto.pie];
  assert.deepEqual(pies("el-cierre"), ["Basado en el libro, pp. 207-208, 210, 212 y 225", "Basado en el libro, pp. 207-208 y 225", "Basado en el libro, pp. 209 y 225-226"]);
  assert.deepEqual(pies("el-costo-de-lo-vendido"), ["Basado en el libro, pp. 214, 223 y 226", "Basado en el libro, pp. 214 y 226", "Basado en el libro, pp. 209 y 226"]);
  assert.deepEqual(pies("lado-a-lado"), ["Basado en el libro, pp. 214 y 226", "Basado en el libro, pp. 226-227", "Basado en el libro, p. 227"]);
});

/* ═══════════ 2 · TABLAS Y CIFRAS ═══════════ */

test("★★★ la ficha de San Calixto es la de la v2.1, parte por parte", () => {
  const v = tablaDespuesDe(seccion("### Pantalla 2", "### Pantalla 3"), "Ficha").slice(1);
  const datos = pantalla("los-datos-de-san-calixto").ficha.map((f) => [f.dato, [...f.partes, ...(f.total ? [`**${f.total}**`] : [])].join(" · ")]);
  assert.deepEqual(datos, v);
});

test("★★★ los asientos del cierre: los 6 dados y los 4 que se suman son los de la v2.1", () => {
  const leer = (marca, sig) => tablaDespuesDe(seccion(marca, sig), "| 28 de febrero").slice(1);
  const comoTabla = (ls) => ls.map((l) => [l.cuenta, l.lado === A.DEBE ? A.cifra(l.monto) : "", l.lado === A.HABER ? A.cifra(l.monto) : ""]);
  assert.deepEqual(comoTabla(pantalla("el-cierre").dados), leer("### Pantalla 4 · colocando", "### Pantalla 4 · error"));
  assert.deepEqual(comoTabla(pantalla("el-cierre").acierto.suman), leer("### Pantalla 4 · acierto", "### Pantalla 5"));
  /* Las dos líneas que se colocan, con su lado. */
  const s = seccion("### Pantalla 4 · colocando", "### Pantalla 4 · error");
  for (const l of pantalla("el-cierre").lineas) assert.ok(s.includes(`«${lineaVista(l)}» → ${l.lado === A.DEBE ? "Debe" : "Haber"}`), l.id);
});

test("★★★ la tabla de los tres métodos es la de la v2.1, con UEPS y su rótulo", () => {
  const v = tablaDespuesDe(seccion("### Pantalla 7 · colocando", "### Pantalla 7 · error"), "Tabla");
  const t = pantalla("lado-a-lado").tabla;
  assert.deepEqual(t.metodos, v[0].slice(1));
  assert.equal(t.metodos[1], "UEPS (no válido bajo NIIF)");
  assert.deepEqual(t.filas.map((f) => [f.rubro, ...f.valores]), v.slice(1));
  assert.ok(seccion("### Pantalla 7 · colocando", "### Pantalla 7 · error").includes(`Bloque fijo: «${fijoVisto(pantalla("lado-a-lado").bloqueFijo)}»`));
});

test("★★★ las cifras se calculan y son las del libro; el saldo de Ganancias y pérdidas cuadra", () => {
  const C = A.CIFRAS;
  assert.deepEqual([C.inicial, C.compras, C.ingresos, C.disponible, C.unidadesDisponibles], [6760000, 17460000, 45793000, 24220000, 18200]);
  assert.deepEqual(Object.values(C.peps), [1518000, 22702000, 23091000, 11091000, 11091000]);
  assert.deepEqual(Object.values(C.ueps), [1430000, 22790000, 23003000, 11003000, 11003000]);
  assert.deepEqual(Object.values(C.promedio), [1463846, 22756154, 23036846, 11036846, 11036846]);
  assert.equal(pantalla("el-cierre").acierto.saldo, "Ganancias y pérdidas: debe $36.220.000 · haber $47.256.846 · saldo $11.036.846");
  /* El saldo es la utilidad antes de impuestos con el promedio. */
  assert.equal(36220000 + C.promedio.antesDeImpuestos, 47256846);
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

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(ElCierre, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lectura") {
        const esperado = [
          p.objetivo, ...p.parrafos, ...(p.metodos ?? []).flatMap((x) => [x.encabezado, x.texto, ...x.calculos]),
          ...(p.calculos ?? []), p.cierre, p.siguiente, p.boton, p.pie,
        ].filter(Boolean);
        assert.deepEqual(enPantalla(m.caja).textos, esperado, p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      if (p.tipo === "eleccion") {
        const cab = [...(p.bloqueFijo ? [p.bloqueFijo.rotulo] : []), ...p.parrafos, ...(p.calculos ?? []), p.pregunta];
        const ops = p.opciones.map((o) => o.texto).sort();
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
        vistos.push(`${p.id}:colocando`);
        for (const o of p.opciones.filter((x) => !x.correcta)) {
          await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
          await tocar(boton(m.caja, "confirmar"));
          assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, o.devolucion, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${o.id}`);
          vistos.push(`${p.id}:error:${o.id}`);
          await tocar(boton(m.caja, "probar-otra"));
        }
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, ...p.acierto.calculos, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
        vistos.push(`${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      /* P4: todo al revés, luego bien. */
      assert.deepEqual(enPantalla(m.caja).textos, [...p.parrafos, p.consigna, A.BOTON.confirmar, p.pie], `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado === A.DEBE ? A.HABER : A.DEBE));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja).textos, [...p.parrafos, p.consigna, ...p.lineas.flatMap((l) => [A.INTERFAZ.incorrecto, l.devolucion]), A.BOTON.probarOtra, p.error.pie], `${p.id} error`);
      vistos.push(`${p.id}:error`);
      await tocar(boton(m.caja, "probar-otra"));
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja).textos, [...p.parrafos, A.INTERFAZ.correcto, p.acierto.texto, p.acierto.saldo, A.BOTON.seguir, p.acierto.pie], `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* 6 de lectura + P4 (3 estados) + P5 y P7 (4 cada una). */
    assert.equal(vistos.length, 6 + 3 + 8);
  } finally {
    m.desmontar();
  }
});

test("★★★ P4: error bajo su línea, «Probar otra» devuelve solo las mal puestas; con el acierto la tabla pasa de 6 a 10 filas", async () => {
  const p = pantalla("el-cierre");
  const m = await montar(h(ElCierre, { pieza: conPieza("el-cierre"), rotulo: "R" }));
  const filas = () => [...m.caja.querySelectorAll("[data-asientos] [data-linea]")].map((r) => r.textContent);
  try {
    const t = m.caja.querySelector("[data-asientos]");
    assert.equal(t.getAttribute("aria-label"), "Asientos del 28 de febrero");
    assert.equal(t.dataset.revision, "pendiente");
    assert.equal(filas().length, 6);
    /* La inicial bien, la final mal. */
    await tocar(casilla(m.caja, "inicial", A.HABER));
    await tocar(casilla(m.caja, "final", A.HABER));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "error");
    const enLinea = m.caja.querySelector('[data-fila="final"] [data-mensaje=error]');
    assert.ok(enLinea, "el error no está en su línea");
    assert.equal(m.caja.querySelectorAll("[data-mensaje=error]").length, 1);
    assert.ok(casilla(m.caja, "final", A.HABER).querySelector(".t7a4-marca svg"), "la casilla mala no lleva la X");
    assert.equal(filas().length, 6, "la tabla crece antes del acierto");
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(casilla(m.caja, "inicial", A.HABER).dataset.llena, "si");
    assert.equal(casilla(m.caja, "final", A.HABER).dataset.llena, "no");
    await tocar(casilla(m.caja, "final", A.DEBE));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "acierto");
    const vistas = (ls) => ls.map((l) => `${l.cuenta}${l.lado === A.DEBE ? A.cifra(l.monto) : ""}${l.lado === A.DEBE ? "" : A.cifra(l.monto)}`);
    assert.deepEqual(filas(), vistas([...p.dados, ...p.acierto.suman]));
    assert.equal(m.caja.querySelectorAll("[data-nueva=si].t7a4-nueva").length, 4, "las 4 nuevas no llegan con fundido");
    /* Las del haber, con sangría. */
    for (const r of m.caja.querySelectorAll("[data-asientos] [data-linea]")) {
      assert.equal(r.querySelector("[role=rowheader]").classList.contains("t7a4-sangria"), r.dataset.lado === A.HABER);
    }
    assert.equal(m.caja.querySelector("[data-lado]:not([data-linea*=' '])[data-llena]") === null, true, "las casillas siguen a la vista con el acierto");
    assert.equal(m.caja.querySelector("[data-saldo]").textContent, p.acierto.saldo);
  } finally {
    m.desmontar();
  }
});

test("★★ P7: la tabla del patrón, apilada con 341 px o menos, con el nombre del método a la izquierda", async () => {
  assert.match(CSS_AP4, /@container t7a4 \(max-width: 341px\) \{[^}]*\.t7a4-er-head \{ display: none; \}/);
  assert.match(CSS_AP4, /\.t7a4-er-c \{ display: grid; grid-template-columns: 88px minmax\(0, 1fr\);/);
  const m = await montar(h(ElCierre, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  try {
    const t = m.caja.querySelector("[data-metodos]");
    assert.equal(t.getAttribute("aria-label"), "Los tres métodos, lado a lado");
    assert.equal(t.dataset.revision, "pendiente");
    const tabla = pantalla("lado-a-lado").tabla;
    assert.deepEqual(
      [...t.querySelectorAll("[data-rubro]")].map((r) => r.textContent),
      tabla.filas.map((f) => `${f.rubro}${f.valores.map((v, i) => `${tabla.metodos[i]}${v}`).join("")}`),
    );
    assert.deepEqual([...m.caja.querySelectorAll("[data-fijo-fila]")].map((r) => r.textContent), pantalla("lado-a-lado").bloqueFijo.filas.map((f) => `${f.rubro}${f.valor}`));
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones se barajan en cada intento; los cálculos de P5 llegan con el acierto", async () => {
  const m = await montar(h(ElCierre, { pieza: conPieza("el-costo-de-lo-vendido"), rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    const calc = () => [...m.caja.querySelectorAll("[data-calculo]")].map((c) => c.textContent);
    const p = pantalla("el-costo-de-lo-vendido");
    assert.deepEqual(calc(), p.calculos);
    let antes = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="compras"]'));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(calc(), p.calculos, "el cálculo del acierto se ve en el error");
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
    await tocar(m.caja.querySelector('[data-opcion="vendida"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(calc(), [...p.calculos, ...p.acierto.calculos]);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER ═══════════ */

test("★★ sin el 33 % ni sus cifras, sin los asientos con IVA, sin nada interno", () => {
  const todo = JSON.stringify(P) + CSS_AP4;
  assert.doesNotMatch(todo, /33 ?%/);
  for (const c of ["3.660.030", "7.430.970", "1.463.847"]) assert.ok(!todo.includes(c), c);
  assert.doesNotMatch(todo, /IVA|Retención/);
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "glosa", "regla", "Near", "Mello", "Watari", "(p. ", "C-1", "X2", "1.330.77"]) assert.ok(!texto.includes(interno), interno);
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
  /* Antes de A5: AP4 cierra con «Siguiente: «Importados y fletes»». */
  assert.equal(ids.indexOf(A.AP4_ID) + 1, ids.indexOf("t7-1-a5-importados-y-fletes"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.AP4_ID) + 1, piezas.indexOf("t7-1-a5-importados-y-fletes"));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP4_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ElCierreEnPeriodico.jsx", "src/data/contabilidadT7_1_ap4.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
