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
/* Lote 6d (§4.3): el avance sigue al contador, «Siguiente casilla», y al final «Ver mi resumen». */
const siguiente = (caja) => tocar([...caja.querySelectorAll("button")].find((b) => /^(Siguiente casilla|Ver mi resumen)$/.test(b.textContent.trim())));
/* Lote 6d: el bloque de mensaje del estándar único; se lee su texto visible, sin el «Incorrecto.» del lector. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"] [data-devolucion]');
  return p ? [...p.childNodes].filter((n) => !(n.dataset && "lector" in n.dataset)).map((n) => n.textContent).join("") : null;
};
const NBSP = " ";
const pegado = (t) => t.replace(/(\d) %/g, `$1${NBSP}%`);
const CASILLAS = D.PARTES_T6_ACT6.flatMap((p) => p.casillas);
const correcta = (c) => c.opciones.find((o) => o.tipo === null);

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act6.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"), GUIA.indexOf("## (2) Futaba"));
/* La sección (2): las líneas que Shoko pasó y Futaba aplicó. Mandan sobre (1), por id y campo. */
const SECCION_2 = GUIA.slice(GUIA.indexOf("## (2) Futaba"));
const filas2 = SECCION_2.split("\n").map((l) => l.split("\t"));
/* «La casilla 7 queda así: ✓ $53.000 · ✗ $44.000 (P7) · ✗ $84.000 (P4).» → las tres celdas, en la forma de (1). */
const CASILLA_7 = SECCION_2.match(/La casilla 7 queda así: (.*)\.\n/)[1].split(" · ")
  .map((c) => c.replace(/^[✓✗] /, "").replace(/ \((P\d)\)$/, " → $1"));
const cambio = (id, campo) => filas2.find((c) => c[0] === id && c[1] === campo)?.slice(2);
const filas = FUTABA.split("\n").map((l) => l.split("\t"));
const fila = (primera) => filas.find((c) => c[0] === primera);
const filaTipo = (t) => filas.find((c) => c[0] === t || c[0].startsWith(`${t} ·`));
const sinCifra = (t) => t.replace(/ \(\d+\)$/, "");

test("guarda: el paquete trae las ocho casillas y los diez errores, y una inventada no aparece", () => {
  for (let k = 1; k <= 8; k++) assert.ok(fila(String(k)), `casilla ${k}`);
  for (const t of ["G0", "G1", "G2", "G3", "P1", "P2", "P4", "P5", "P6"]) assert.ok(filaTipo(t), t);
  /* La sección (2): P3 se retira y entra P7. */
  assert.match(cambio("P3", "—")[0], /^Se elimina\./);
  assert.ok(cambio("P7 · falta un grupo", "Devolución"));
  assert.equal(fila("9"), undefined);
});

test("★★★ los textos fijos son los del paquete: consigna, regla en tabla, nota, reglas, tutorial, datos, cierre y texto alternativo", () => {
  assert.equal(D.T6_ACT6.consigna, fila("Consigna")[1]);
  /* La fila 1 cambia (sección 2); las filas 2 a 4 siguen como en (1). */
  const [, ...resto] = fila("Regla fija (tabla)")[1].split(" · ");
  const [fila1, pie1] = cambio("Regla fija · fila 1", "Tabla");
  const [sinCambios, pie2a4] = cambio("Regla fija · filas 2 a 4", "Tabla");
  assert.equal(sinCambios, `Sin cambios: ${resto.map((r) => r.split(": ")[1]).join(", ").replace(/, ([^,]*)$/, " y $1")}`);
  assert.deepEqual(D.GRUPOS_T6_ACT6.map((g) => `${g.nombre}: ${g.porcentaje}`), [fila1, ...resto]);
  assert.deepEqual(D.GRUPOS_T6_ACT6.map((g) => g.pie), [pie1, pie2a4, pie2a4, pie2a4]);
  assert.doesNotMatch(D.GRUPOS_T6_ACT6[0].porcentaje, /0 %/, "el 0 % no es del Decreto");
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
    /* Entrega 1: los demás, cada uno con su G0 por casilla y opción, que nombra el rango elegido. */
    for (const o of c.opciones.filter((x) => x.tipo && x !== cerca)) {
      const g = D.GRUPOS_T6_ACT6.find((x) => x.nombre === o.texto).id;
      assert.equal(o.tipo, `G0-${c.id}-${g}`, `casilla ${k + 1}: ${o.texto}`);
      assert.ok(D.ERRORES_T6_ACT6[o.tipo], `casilla ${k + 1}: ${o.tipo} sin texto`);
    }
    /* Las opciones son los cuatro grupos, en el orden de la regla. */
    assert.deepEqual(c.opciones.map((o) => o.texto), D.GRUPOS_T6_ACT6.map((g) => g.nombre));
  });
  assert.equal(correcta(u2).texto, nombre("g2"), "el caso límite: seis meses justos van al 5 %");
});

test("★★★ parte 2: cada casilla, su correcta y sus distractores con su tipo; los diez errores literales", () => {
  D.PARTES_T6_ACT6[1].casillas.forEach((c, k) => {
    const [, enunciado] = fila(String(k + 4));
    const [bien, mal1, mal2] = k + 4 === 7 ? CASILLA_7 : fila(String(k + 4)).slice(2);
    assert.equal(c.enunciado, sinCifra(enunciado), `casilla ${k + 4}`);
    const op = (celda) => { const [v, t] = celda.split(" → "); return { valor: cifras(v)[0], tipo: t ?? null }; };
    assert.deepEqual(c.opciones, [op(bien), op(mal1), op(mal2)], `casilla ${k + 4}: opciones`);
  });
  const nuevo = (t) => filas2.find((c) => c[0].startsWith(`${t} ·`))?.[2]?.replace(/ \(\d+\)$/, "");
  for (const t of Object.keys(D.ERRORES_T6_ACT6)) assert.equal(D.ERRORES_T6_ACT6[t], nuevo(t) ?? filaTipo(t)[1], t);
  assert.equal(D.ERRORES_T6_ACT6.P3, undefined, "P3 se retira");
  /* Cada tipo de error de la parte 2 se usa en alguna casilla. */
  const usados = new Set(D.PARTES_T6_ACT6[1].casillas.flatMap((c) => c.opciones.map((o) => o.tipo).filter(Boolean)));
  assert.deepEqual([...usados].sort(), Object.keys(D.ERRORES_T6_ACT6).filter((t) => t.startsWith("P")).sort());
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
  /* El distractor P4: el 5 % también al primer grupo. P7: falta el grupo de más de un año. */
  assert.equal((E.grupos[0].monto * 5) / 100 + E.provision, 84000);
  assert.equal(prov[1] + prov[2], 44000);
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
    /*
     * Calidad 1: la nota encima de la regla y sin pie; el pie de la regla,
     * dentro de su borde: el rótulo y la fuente del porcentaje, dos líneas
     * sin cajas. «Escenario simulado» se lee una sola vez.
     */
    const regla = caja.querySelector("[data-regla]");
    const nota = caja.querySelector("[data-nota-regla]");
    const pie = regla.querySelector("[data-pie-tabla]");
    const sigue = (a, b) => Boolean(a.compareDocumentPosition(b) & 4);
    assert.ok(sigue(nota, regla), `casilla ${k + 1}: la nota, encima de la regla`);
    assert.equal(nota.textContent, D.T6_ACT6.nota, "la nota, sin pie");
    assert.ok(pie.contains(rotulo) && sigue(regla.querySelector('[data-fila="g4"]'), pie), `casilla ${k + 1}: el rótulo, al pie de la regla`);
    assert.deepEqual([...pie.children].map((p) => p.textContent), [D.T6_ACT6.rotulo, D.PIES_T6_ACT6.regla]);
    assert.equal(caja.querySelectorAll("[data-tipo-pie]").length, 0, "ningún pie en caja en la actividad");
    assert.equal((caja.textContent.match(/Escenario simulado/g) ?? []).length, 1, "«Escenario simulado», una sola vez");
    assert.ok(sigue(rotulo, caja.querySelector("[data-hecho]")), `casilla ${k + 1}: el rótulo, antes de la casilla`);
    /* La parte 2: los montos dentro de la regla y el total abajo; el eje, solo en la parte 1 (hoja 2 de Mai). */
    const datos = caja.querySelector("[data-datos-parte]");
    assert.equal(Boolean(datos), k >= 3, `casilla ${k + 1}: los montos solo en la parte 2`);
    assert.equal(Boolean(caja.querySelector("[data-eje]")), k < 3, `casilla ${k + 1}: el eje solo en la parte 1`);
    if (datos) {
      /* Lote 3 · B (hoja de Mai): la fila del total no se dibuja antes de la casilla 7, la primera que la usa. */
      assert.equal(Boolean(datos.querySelector("[data-total]")), k >= 6, `casilla ${k + 1}: la fila del total, desde la 7`);
      if (k >= 6) assert.ok(datos.lastElementChild.hasAttribute("data-total"), "el total, al final");
      assert.deepEqual([...datos.querySelectorAll("[data-monto]")].map((td) => td.textContent), ["$620.000", "$560.000", "$160.000", "$60.000"]);
    }
    /* Las opciones, en una columna (Mai: en fila de tres no caben las cifras de 7 dígitos a 320). Lote 6c: en la 1 a la 3, son los cajones del eje. */
    if (k >= 3) assert.equal(caja.querySelector("[data-opcion]").closest("[style*='grid-template-columns']").style.gridTemplateColumns, "minmax(0, 1fr)");
    await tocar(opcion(caja, correcta(CASILLAS[k])));
    await siguiente(caja);
  }
  desmontar();
});

test("★★ la fila 1 de la regla: su texto en una segunda línea, sin porcentaje; las demás, con el «%» pegado", async () => {
  const { caja, desmontar } = await montar();
  const g1 = caja.querySelector('[data-regla] [data-fila="g1"]');
  assert.equal(g1.lastElementChild.textContent, D.GRUPOS_T6_ACT6[0].porcentaje);
  for (const g of D.GRUPOS_T6_ACT6.slice(1)) {
    assert.ok(caja.querySelector(`[data-regla] [data-fila="${g.id}"]`).textContent.endsWith(g.porcentaje.replace(" ", NBSP)), g.id);
  }
  desmontar();
});

/* ═══════════ LOS CAJONES DEL TIEMPO (hoja 2 de Mai, calidad) ═══════════ */

const CJ = await import("../../components/mecanicas/libros/tema6/CajonesDelTiempo.jsx");
const izquierda = (el) => Number.parseFloat(el.style.left);

test("★★★ el eje: cuatro cajones de 22 · 22 · 28 · 28 %, marcas «3 meses», «6 meses» y «1 año»; la deuda espera fuera del eje y cae en su cajón correcto", async () => {
  const { caja, desmontar } = await montar();
  const eje = () => caja.querySelector("[data-eje]");
  assert.deepEqual([...eje().querySelectorAll("[data-cajon]")].map((c) => c.style.width), ["22%", "22%", "28%", "28%"]);
  /* Shoko 5: ninguna marca más allá de «1 año» (nada que sugiera un tope). */
  assert.deepEqual([...eje().querySelectorAll("[data-marca]")].map((m) => [m.textContent, m.style.left]), [["3 meses", "22%"], ["6 meses", "44%"], ["1 año", "72%"]]);
  const centros = { g1: 11, g2: 33, g3: 58, g4: 86 };
  for (let k = 0; k < 3; k++) {
    const c = CASILLAS[k];
    const deuda = eje().querySelector(`[data-deuda="${c.id}"]`);
    assert.equal(deuda.textContent, c.enunciado.match(/\d+ meses/)[0]);
    /* Shoko 2: antes de responder, la deuda espera encima del eje, siempre en el mismo sitio y sin palito. */
    assert.equal(deuda.style.left, "0%", `casilla ${k + 1}: espera al inicio, no sobre sus meses`);
    assert.equal(deuda.style.top, "0px", `casilla ${k + 1}: encima del eje`);
    assert.equal(deuda.querySelector("[data-palito]"), null, "sin palito");
    assert.equal(deuda.dataset.enCajon, "");
    /* Se falla a propósito: la deuda cae igual en su cajón CORRECTO. */
    await tocar(opcion(caja, c.opciones.find((o) => o.tipo)));
    const id = D.GRUPOS_T6_ACT6.find((g) => g.nombre === correcta(c).texto).id;
    assert.equal(deuda.dataset.enCajon, id, `casilla ${k + 1}: en su cajón correcto`);
    assert.equal(izquierda(deuda), centros[id], `casilla ${k + 1}: centrada en su cajón`);
    /* Shoko 4: dentro del cajón, sin relleno lateral ni borde: «6 meses» no llega a la marca (medido en Chromium). */
    assert.equal(deuda.style.padding, "4px 0px");
    assert.equal(deuda.style.border, "");
    assert.equal(eje().querySelector(`[data-cajon="${id}"]`).dataset.conDeuda, "si");
    await siguiente(caja);
  }
  desmontar();
});

test("★★★ Shoko 5: el último cajón queda abierto: sin borde derecho y con los bordes que se desvanecen", async () => {
  const { caja, desmontar } = await montar();
  const cajones = [...caja.querySelectorAll("[data-eje] [data-cajon]")];
  const ultimo = cajones.at(-1);
  assert.ok(ultimo.hasAttribute("data-abierto"));
  assert.ok(!/px/.test(ultimo.style.borderRight), `sin borde derecho (${ultimo.style.borderRight})`);
  assert.equal(ultimo.style.borderTop, "", "sin borde arriba: se desvanece");
  assert.match(ultimo.style.backgroundImage, /linear-gradient\(to right, .*transparent\)/);
  assert.ok(cajones.slice(0, 3).every((c) => !c.hasAttribute("data-abierto") && c.style.borderTop.startsWith("1px")));
  desmontar();
});

test("★★★ las barras: la porción mide su porcentaje del largo (5 · 10 · 15 %), la provisión entra al responder, y la barra del total aparece en la casilla 7", async () => {
  const { caja, desmontar } = await montar();
  for (let k = 0; k < 3; k++) { await tocar(opcion(caja, correcta(CASILLAS[k]))); await siguiente(caja); }
  const porcion = (g) => caja.querySelector(`[data-fila="${g}"] [data-porcion]`);
  assert.equal(porcion("g1"), null, "el primer grupo no tiene porción");
  assert.deepEqual(["g2", "g3", "g4"].map((g) => porcion(g).style.width), ["5%", "10%", "15%"]);
  for (let k = 3; k < CASILLAS.length; k++) {
    const c = CASILLAS[k];
    assert.equal(Boolean(caja.querySelector("[data-barra-total]")), k >= 6, `casilla ${k + 1}: la barra del total, desde la 7`);
    assert.ok(caja.querySelector("[data-renglon-activo]"), `casilla ${k + 1}: su renglón encendido`);
    /* Se falla: entra igual el valor correcto. */
    await tocar(opcion(caja, c.opciones.find((o) => o.tipo)));
    const entraron = [...caja.querySelectorAll("[data-cajones-del-tiempo] [data-entra]")].map((e) => e.textContent);
    assert.ok(entraron.includes(pesos(correcta(c).valor)), `casilla ${k + 1}: entró ${entraron}`);
    assert.equal(caja.querySelector("[data-anuncio]").textContent, CJ.anuncioDe(k));
    await siguiente(caja);
  }
  desmontar();
});

test("★★ el anuncio: lo que entra, con el nombre del grupo en minúscula tras los dos puntos (Shoko 3)", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(CJ.anuncioDe), [
    "2 meses: vigentes o hasta 3 meses",
    "6 meses: más de 3 hasta 6 meses",
    "14 meses: más de 1 año",
    "más de 3 hasta 6 meses: $28.000",
    "más de 6 meses hasta 1 año: $16.000",
    "más de 1 año: $9.000",
    "La provisión: $53.000",
    "El valor neto: $1.347.000",
  ]);
});

test("★★★ Shoko 1: la cifra bajo «El valor neto» aparece solo después de responder la casilla 8; los rótulos, antes", async () => {
  const { caja, desmontar } = await montar();
  for (let k = 0; k < 6; k++) { await tocar(opcion(caja, correcta(CASILLAS[k]))); await siguiente(caja); }
  /* Casilla 7 abierta: los dos rótulos ya están, sin cifras. */
  assert.ok(caja.querySelector("[data-barra-total]").textContent.includes("El valor neto"));
  assert.equal(caja.querySelector("[data-valor-neto]").textContent, "");
  await tocar(opcion(caja, correcta(CASILLAS[6])));
  assert.equal(caja.querySelector("[data-valor-provision]").textContent, "$53.000");
  assert.equal(caja.querySelector("[data-valor-neto]").textContent, "", "con la casilla 7 respondida, el neto sigue vacío");
  await siguiente(caja);
  assert.equal(caja.querySelector("[data-valor-neto]").textContent, "", "casilla 8 abierta: todavía vacío");
  await tocar(opcion(caja, CASILLAS[7].opciones.find((o) => o.tipo)));
  assert.equal(caja.querySelector("[data-valor-neto]").textContent, "$1.347.000", "respondida la 8 (aunque se falle), entra el neto correcto");
  desmontar();
});

test("★★ al pasar de casilla la página se mueve lo justo para ver la casilla, el rótulo y el renglón encendido", async () => {
  const { caja, desmontar } = await montar();
  const movidas = [];
  const antes = window.scrollBy;
  window.scrollBy = (o) => movidas.push(o.top);
  /* Una pantalla de 568; la casilla 4 se ve, pero el rótulo y la fila del 5 % quedaron arriba, fuera. */
  const alto = window.innerHeight;
  Object.defineProperty(window, "innerHeight", { value: 568, configurable: true });
  const original = window.HTMLElement.prototype.getBoundingClientRect;
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.querySelector?.("[data-hecho]") || this.hasAttribute?.("data-hecho")) return { top: 100, bottom: 300, height: 200 };
    if (this.hasAttribute?.("data-rotulo-simulado")) return { top: 0, bottom: 30, height: 30 };
    if (this.getAttribute?.("data-fila") === "g2") return { top: -200, bottom: -180, height: 20 };
    return original.call(this);
  };
  try {
    for (let k = 0; k < 3; k++) { await tocar(opcion(caja, correcta(CASILLAS[k]))); await siguiente(caja); }
    /* Casilla 4: de la fila (−200) al fondo de la casilla (300) son 500 y caben en 568 − 16; se sube hasta dejar la fila a 8 del borde. */
    assert.equal(movidas.at(-1), -208);
  } finally {
    window.HTMLElement.prototype.getBoundingClientRect = original;
    window.scrollBy = antes;
    Object.defineProperty(window, "innerHeight", { value: alto, configurable: true });
    desmontar();
  }
});

test("★★★ cada error se ve literal y la correcta queda marcada", async () => {
  for (let k = 0; k < CASILLAS.length; k++) {
    const c = CASILLAS[k];
    const mala = c.opciones.find((o) => o.tipo);
    const { caja, desmontar } = await montar();
    for (let j = 0; j < k; j++) { await tocar(opcion(caja, correcta(CASILLAS[j]))); await siguiente(caja); }
    assert.equal(caja.querySelector("[data-hecho]").textContent, pegado(c.enunciado));
    await tocar(opcion(caja, mala));
    assert.equal(devolucion(caja), pegado(D.ERRORES_T6_ACT6[mala.tipo]), `casilla ${k + 1}`);
    /* Lote 6c/6d: en la 1 a la 3, el cajón correcto se revela («Iba aquí») y el tocado por error queda «No va aquí»; en las demás, la opción revelada. */
    if (k < 3) {
      assert.equal(opcion(caja, correcta(c)).dataset.marcaE4, "revelada");
      assert.equal(opcion(caja, mala).dataset.marcaE4, "tachada");
    } else assert.equal(opcion(caja, correcta(c)).dataset.estado, "revelada");
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

/* ═══════════ LOTE 6c · LOS CAJONES DEL EJE SON LAS OPCIONES (casillas 1 a 3) ═══════════ */

test("★★★ lote 6c · en las casillas 1 a 3 sale la lista de rangos: se toca el cajón del eje (44 de alto, un botón por grupo con su nombre); E4: ✕ el tocado por error, ✓ el correcto, y la deuda cae en el correcto", async () => {
  const { caja, desmontar } = await montar();
  const NOMBRES = ["Grupo 1: vigentes o hasta 3 meses", "Grupo 2: más de 3 hasta 6 meses", "Grupo 3: más de 6 meses hasta 1 año", "Grupo 4: más de 1 año"];
  for (let k = 0; k < 3; k++) {
    const c = CASILLAS[k];
    const eje = caja.querySelector("[data-eje]");
    const cajones = [...eje.querySelectorAll("button[data-cajon]")];
    assert.deepEqual(cajones.map((b) => b.getAttribute("aria-label")), NOMBRES, `casilla ${k + 1}: los cuatro cajones, botones con el nombre de su grupo`);
    assert.equal(cajones[0].parentElement.style.height, "44px", "el eje, 44 de alto");
    /* Sin la lista de cuatro rangos: ninguna opción fuera del eje. */
    assert.equal([...caja.querySelectorAll("[data-opcion]")].filter((o) => !eje.contains(o)).length, 0, `casilla ${k + 1}: sin lista de rangos`);
    const mala = c.opciones.find((o) => o.tipo);
    await tocar(opcion(caja, mala));
    const bueno = D.GRUPOS_T6_ACT6.find((g) => g.nombre === correcta(c).texto).id;
    const malo = D.GRUPOS_T6_ACT6.find((g) => g.nombre === mala.texto).id;
    const boton = (id) => caja.querySelector(`[data-eje] button[data-cajon="${id}"]`);
    /* Lote 6d: el tocado por error, 2 px coral y «No va aquí»; el correcto no tocado, «Iba aquí». La pastilla va en la franja de encima del eje; la palabra, en el nombre del cajón. */
    assert.equal(boton(malo).dataset.marcaE4, "tachada");
    assert.match(boton(malo).getAttribute("aria-label"), /\. No va aquí$/);
    assert.equal(boton(malo).style.boxShadow, "inset 0 0 0 2px #E76F51");
    const franja = (id) => caja.querySelector(`[data-franja-pastillas] [data-pastilla-cajon="${id}"] [data-pastilla]`);
    assert.equal(franja(malo).textContent, "No va aquí");
    assert.ok(franja(malo).querySelector('[data-icono="tache"]'));
    assert.equal(boton(bueno).dataset.marcaE4, "revelada");
    assert.match(boton(bueno).getAttribute("aria-label"), /\. Iba aquí$/);
    assert.equal(franja(bueno).textContent, "Iba aquí");
    assert.equal(franja(bueno).querySelector("svg"), null, "«Iba aquí» va sin ícono");
    assert.equal(caja.querySelector(`[data-deuda="${c.id}"]`).dataset.enCajon, bueno, "la deuda cae en el correcto");
    assert.ok([...caja.querySelectorAll("[data-eje] button[data-cajon]")].every((b) => b.disabled), "un solo intento");
    await siguiente(caja);
  }
  /* En la 4, la lista de opciones vuelve (son cifras). */
  assert.ok(caja.querySelector("[style*='grid-template-columns'] [data-opcion]"));
  desmontar();
});
