import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 6 — «Provisión por edades» (Célula B, b5-t6-a6).
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-act6.md): consigna,
 *     regla en tabla, nota, reglas de «¿Cómo se juega?», tutorial, datos de
 *     la parte 2, cierre, texto alternativo, las ocho casillas y sus errores
 *   · el rótulo «Escenario simulado · no es la tabla del libro» se ve en
 *     pantalla en cada casilla; los pies, cada uno en su forma
 *   · el registro de cifras construidas y la lista negra (Sakuta): ninguna
 *     cifra correcta coincide con el libro, con D-3 (p. 269), con la tabla de
 *     la p. 201 ni con T6 · A5
 *   · las cuentas cuadran; el caso límite de seis meses va al 5 %
 *   · un intento; el valor correcto queda en el registro para seguir
 *     (indispensable: el total y el neto dependen de lo anterior)
 *   · el «%» va pegado a su número
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
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

const { default: ProvisionPorEdades } = await import("../../components/mecanicas/libros/tema6/ProvisionPorEdades.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const D = await import("../../data/contabilidadT6Act6.js");
const A5 = await import("../../data/contabilidadT6Pieza5.js");
const { pesos } = await import("../../data/contabilidad.js");
const { listaNegraDelLibro, cifras } = await import("./b5-lista-negra.mjs");
const { FAE } = await import("../../theme.js");

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => {
    raiz.render(h(ProvisionPorEdades, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, ...props }));
  });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const clave = (o) => String(o.valor ?? o.texto);
const opcion = (caja, o) => caja.querySelector(`[data-opcion="${clave(o)}"]`)?.closest("button");
const siguiente = (caja) => tocar([...caja.querySelectorAll("button")].find((b) => /^(Siguiente|Ver resultado)$/.test(b.textContent.trim())));
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  return p ? [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("") : null;
};
const NBSP = " ";
const pegado = (t) => t.replace(/(\d) %/g, `$1${NBSP}%`);
const CASILLAS = D.PARTES_T6_ACT6.flatMap((p) => p.casillas);
const correcta = (c) => c.opciones.find((o) => o.tipo === null);

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act6.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"));
const filas = FUTABA.split("\n").map((l) => l.split("\t"));
const fila = (primera) => filas.find((c) => c[0] === primera);
const filaTipo = (t) => filas.find((c) => c[0] === t || c[0].startsWith(`${t} ·`));
const sinCifra = (t) => t.replace(/ \(\d+\)$/, "");

test("guarda: el paquete trae las ocho casillas y los diez errores, y una inventada no aparece", () => {
  for (let k = 1; k <= 8; k++) assert.ok(fila(String(k)), `casilla ${k}`);
  for (const t of ["G0", "G1", "G2", "G3", "P1", "P2", "P3", "P4", "P5", "P6"]) assert.ok(filaTipo(t), t);
  assert.equal(fila("9"), undefined);
});

test("★★★ los textos fijos son los del paquete: consigna, regla en tabla, nota, reglas, tutorial, datos, cierre y texto alternativo", () => {
  assert.equal(D.T6_ACT6.consigna, fila("Consigna")[1]);
  assert.equal(D.GRUPOS_T6_ACT6.map((g) => `${g.nombre}: ${g.porcentaje}`).join(" · "), fila("Regla fija (tabla)")[1]);
  assert.equal(D.T6_ACT6.nota, fila("Nota bajo la regla")[1]);
  D.REGLAS_T6_ACT6.forEach((r, k) => assert.equal(r, fila(`Así se juega, ${k + 1}`)[1]));
  assert.equal(D.T6_ACT6.partida, fila("Tutorial")[1]);
  assert.equal(D.PARTES_T6_ACT6[1].datos.filas.map((f) => `${f.nombre}: ${f.valor}`).join(" · "), fila("Datos de la parte 2 (tabla)")[1]);
  assert.equal(D.T6_ACT6.cierre, fila("Cierre")[1]);
  assert.equal(D.ALT_T6_ACT6, fila("Texto alternativo")[1]);
  assert.equal(D.T6_ACT6.rotulo, "Escenario simulado · no es la tabla del libro");
  assert.ok(FUTABA.includes(`Rótulo fijo en pantalla: «${D.T6_ACT6.rotulo}».`));
  assert.ok(FUTABA.includes(`En los porcentajes: «${D.PIES_T6_ACT6.regla}».`));
  assert.ok(FUTABA.includes(`En las cifras y en la decisión de usar esos porcentajes: «${D.PIES_T6_ACT6.nota}».`));
});

test("★★★ parte 1: cada deuda, su grupo correcto y el error de cada grupo equivocado, como en el paquete", () => {
  const [u1, u2, u3] = D.PARTES_T6_ACT6[0].casillas;
  const nombre = (id) => D.GRUPOS_T6_ACT6.find((g) => g.id === id).nombre;
  [u1, u2, u3].forEach((c, k) => {
    const [, enunciado, bien, errores] = fila(String(k + 1));
    assert.equal(c.enunciado, enunciado);
    assert.equal(correcta(c).texto, bien);
    /* «G1 si elige «más de 3 hasta 6» · G0 si elige cualquier otro». */
    const [especifico] = errores.split(" · ");
    const [tipo, , , ...resto] = especifico.split(" ");
    const elegido = resto.join(" ").replace(/[«»]/g, "");
    const cerca = c.opciones.find((o) => o.tipo === tipo);
    assert.ok(cerca && cerca.texto.toLowerCase().startsWith(elegido.toLowerCase()), `casilla ${k + 1}: ${tipo} va con «${elegido}»`);
    assert.ok(c.opciones.filter((o) => o.tipo && o !== cerca).every((o) => o.tipo === "G0"), `casilla ${k + 1}: los demás, G0`);
    /* Las opciones son los cuatro grupos, en el orden de la regla. */
    assert.deepEqual(c.opciones.map((o) => o.texto), D.GRUPOS_T6_ACT6.map((g) => g.nombre));
  });
  assert.equal(correcta(u2).texto, nombre("g2"), "el caso límite: seis meses justos van al 5 %");
});

test("★★★ parte 2: cada casilla, su correcta y sus distractores con su tipo; los diez errores literales", () => {
  D.PARTES_T6_ACT6[1].casillas.forEach((c, k) => {
    const [, enunciado, bien, mal1, mal2] = fila(String(k + 4));
    assert.equal(c.enunciado, sinCifra(enunciado), `casilla ${k + 4}`);
    const op = (celda) => { const [v, t] = celda.split(" → "); return { valor: cifras(v)[0], tipo: t ?? null }; };
    assert.deepEqual(c.opciones, [op(bien), op(mal1), op(mal2)], `casilla ${k + 4}: opciones`);
  });
  for (const t of Object.keys(D.ERRORES_T6_ACT6)) assert.equal(D.ERRORES_T6_ACT6[t], filaTipo(t)[1], t);
});

/* ═══════════ LAS CIFRAS ═══════════ */

test("★★★ las cuentas cuadran: los grupos suman el total, cada provisión es su porcentaje, la suma y el neto", () => {
  const E = D.ESCENARIO_T6_ACT6;
  assert.equal(E.grupos.reduce((s, g) => s + g.monto, 0), E.total);
  const prov = E.grupos.map((g) => (g.monto * g.porcentaje) / 100);
  assert.equal(prov.reduce((a, b) => a + b, 0), E.provision);
  assert.equal(E.total - E.provision, E.neto);
  const [p4, p5, p6, p7, p8] = D.PARTES_T6_ACT6[1].casillas.map((c) => correcta(c).valor);
  assert.deepEqual([p4, p5, p6, p7, p8], [prov[1], prov[2], prov[3], E.provision, E.neto]);
  /* Los datos de la tabla son los del escenario. */
  assert.deepEqual(D.PARTES_T6_ACT6[1].datos.filas.map((f) => cifras(f.valor)[0]), [E.total, ...E.grupos.map((g) => g.monto)]);
  /* El distractor P4: el 5 % también al primer grupo. */
  assert.equal((E.grupos[0].monto * 5) / 100 + E.provision, 84000);
});

test("★★★ el registro: las cifras correctas de la actividad son exactamente las construidas registradas", () => {
  const E = D.ESCENARIO_T6_ACT6;
  const correctas = new Set([E.total, ...E.grupos.map((g) => g.monto), ...D.PARTES_T6_ACT6[1].casillas.map((c) => correcta(c).valor)]);
  assert.deepEqual([...correctas].sort((a, b) => a - b), D.CIFRAS_CONSTRUIDAS_T6_ACT6);
  const distractores = new Set(D.PARTES_T6_ACT6[1].casillas.flatMap((c) => c.opciones.filter((o) => o.tipo).map((o) => o.valor)).filter((v) => !correctas.has(v)));
  assert.deepEqual([...distractores].sort((a, b) => a - b), D.DISTRACTORES_T6_ACT6);
});

test("★★★ la lista negra: ninguna cifra construida coincide con el libro, D-3 (p. 269), la tabla de la p. 201 ni T6 · A5", async () => {
  const negra = await listaNegraDelLibro({ conT6A5: true });
  /* La guarda: trae cada fuente. */
  for (const c of [2655000, 148800, 1000000, 400000, 2283400, 200000, 100000, ...A5.CIFRAS_CONSTRUIDAS_T6_A5.filter(Boolean)]) assert.ok(negra.has(c), `la lista negra no tiene ${pesos(c)}`);
  assert.deepEqual(D.CIFRAS_CONSTRUIDAS_T6_ACT6.filter((c) => negra.has(c)).map(pesos), []);
  /* Los distractores pueden estar en el libro (son opciones erradas), pero solo los cinco que nombró Futaba. */
  const enLaLista = D.DISTRACTORES_T6_ACT6.filter((c) => negra.has(c));
  assert.ok(enLaLista.every((c) => D.DISTRACTORES_EN_EL_LIBRO_T6_ACT6.includes(c)), `distractores en la lista negra: ${enLaLista.map(pesos)}`);
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ el rótulo fijo se ve en pantalla en cada una de las ocho casillas; los pies, en su forma", async () => {
  const { caja, desmontar } = await montar();
  for (let k = 0; k < CASILLAS.length; k++) {
    const rotulo = caja.querySelector("[data-rotulo-simulado]");
    assert.ok(rotulo, `casilla ${k + 1}: sin rótulo`);
    assert.equal(rotulo.textContent, "Escenario simulado · no es la tabla del libro");
    assert.equal(caja.querySelector("[data-regla] [data-tipo-pie]").dataset.tipoPie, "norma");
    assert.equal(caja.querySelector("[data-nota-regla] [data-tipo-pie]").dataset.tipoPie, "escenario");
    const datos = caja.querySelector("[data-datos-parte]");
    assert.equal(Boolean(datos), k >= 3, `casilla ${k + 1}: la tabla de datos solo en la parte 2`);
    if (datos) assert.equal(datos.querySelector("[data-tipo-pie]").dataset.tipoPie, "escenario");
    await tocar(opcion(caja, correcta(CASILLAS[k])));
    await siguiente(caja);
  }
  desmontar();
});

test("★★★ cada error se ve literal; la correcta queda marcada; y el valor correcto entra al registro para seguir", async () => {
  for (let k = 0; k < CASILLAS.length; k++) {
    const c = CASILLAS[k];
    const mala = c.opciones.find((o) => o.tipo);
    const { caja, desmontar } = await montar();
    for (let j = 0; j < k; j++) { await tocar(opcion(caja, correcta(CASILLAS[j]))); await siguiente(caja); }
    assert.equal(caja.querySelector("[data-hecho]").textContent, pegado(c.enunciado));
    await tocar(opcion(caja, mala));
    assert.equal(devolucion(caja), `❌${pegado(D.ERRORES_T6_ACT6[mala.tipo])}`, `casilla ${k + 1}`);
    assert.equal(opcion(caja, correcta(c)).dataset.estado, "revelada");
    const reg = caja.querySelector(`[data-resuelta="${c.id}"]`);
    assert.ok(reg.textContent.includes(correcta(c).valor !== undefined ? pesos(correcta(c).valor) : correcta(c).texto));
    desmontar();
  }
});

test("★★★ pct = aciertos / 8 × 100 y el cierre literal", async () => {
  const m = await montar();
  for (let k = 0; k < CASILLAS.length; k++) {
    const c = CASILLAS[k];
    await tocar(opcion(m.caja, k % 2 ? correcta(c) : c.opciones.find((o) => o.tipo)));
    await siguiente(m.caja);
  }
  assert.equal(m.pct(), 50);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.T6_ACT6.cierre);
  m.desmontar();
});

test("★★ el «%» va pegado a su número: la regla, el punto de partida y los errores", async () => {
  const { caja, desmontar } = await montar();
  assert.ok(caja.querySelector("[data-regla]").textContent.includes(`5${NBSP}%`));
  assert.ok(caja.querySelector("[data-partida]").textContent.includes(`10${NBSP}%`));
  assert.doesNotMatch(caja.textContent, /\d %/);
  desmontar();
});

test("★★ identificadores y dificultad de Sakuta", () => {
  assert.deepEqual([D.T6_ACT6.id, D.T6_ACT6.dificultad, D.T6_ACT6.fpBase], ["b5-t6-a6", "dificil", 50]);
  assert.match(GUIA, /difícil · 50 FP/);
  assert.deepEqual(CASILLAS.map((c) => c.id), ["u1", "u2", "u3", "p4", "p5", "p6", "p7", "p8"]);
});
