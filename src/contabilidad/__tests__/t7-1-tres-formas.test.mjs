import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 «Tres formas de ponerle precio a lo que quedó» (Célula C).
 *
 * El RECORTE del lote 1 de Near (lote1-recortes-t71-v1.md, sección
 * «t7-1-a3-tres-formas») con las correcciones obligatorias de Mello encima
 * (mello-recortes-v1.md), que ganan:
 *   · cada pantalla trae, letra por letra y en su orden, los textos de su
 *     bloque del recorte, con las tres correcciones de Mello aplicadas; la
 *     opcional de Mello («cajas» → «unidades») NO se aplica
 *   · la tabla «Lo que esto cambia del lote 2» del recorte: las pistas y la
 *     tercera opción de peps y ueps, con su devolución
 *   · el plegado de P6 trae «cuando»: por la regla de L no se pliega
 *   · la pila de P1, la tabla de P5 (y del resumen) y las tarjetas de P7
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie,
 *     con la escalera de ayuda del lote 2 (pista; luego respuesta y porqué)
 *   · P7: tres tarjetas cerradas; se abre una a la vez; «Seguir» cuando se
 *     abrieron las tres
 *   · UEPS con su rótulo; sin el 33 %; en T7-1 en la posición 5
 *   · ACIERTOS C7 (gana sobre lo anterior en P6 y en la tarjeta UEPS de P7):
 *     P6 `la-recomendacion` sale de t7-1-a3-la-recomendacion-c7.md (Near)
 *     con A3-1 y A3-2 de Mello (auditoria-mello-a4-v5-y-a3-recomendacion.md,
 *     §2): pregunta por precios que bajan (correcta: PEPS), su pista y sus
 *     dos errores; el acierto, con las dos condiciones del libro y el
 *     impuesto de renta definido, a la vista y sin plegado (C7); 60 palabras
 *     (B2). La tarjeta UEPS dice «el impuesto sobre la utilidad» (A3-2). La
 *     opcional de Mello NO se aplica
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

const A = await import("../../data/contabilidadT7_1_ap3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: TresFormas, CSS_AP3, partirPorque, PILA } = await import("../../components/mecanicas/libros/t7/TresFormas.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { textosDelError, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { ACIERTOS_NEAR } = await import("./correccionesNearPepsUeps.mjs");
const { RECOMENDACION: C7, CORRECCIONES_A3, MELLO_A3, NEAR_A3, TARJETA_UEPS_A3_2, NO_APLICADAS, palabrasAlAcertar } = await import("./correccionesMelloAciertos.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const RECORTE_MD = leer("lote1-recortes-t71-v1.md");
const MELLO_MD = leer("mello-recortes-v1.md");
const SECCION = RECORTE_MD.slice(RECORTE_MD.indexOf("## t7-1-a3-tres-formas · "), RECORTE_MD.indexOf("\n## ", RECORTE_MD.indexOf("## t7-1-a3-tres-formas · ") + 5));
const MELLO_A3_RECORTES = MELLO_MD.slice(MELLO_MD.indexOf("**A3 «Tres formas"), MELLO_MD.indexOf("**A4 «El cierre"));
const P = A.PIEZA_TRES_FORMAS;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });

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

/* Los textos entre «» de un trozo de paquete, en orden; las comillas de dentro («UEPS no tiene sentido…») se conservan. */
function citas(md) {
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of md) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas no cierran");
  return out;
}

/* Los bloques del recorte: id de cada pantalla, en orden, con sus textos. */
const BLOQUES = SECCION.split(/\n(?=\*\*P\d+ · `)/).slice(1).map((b) => ({ id: b.match(/^\*\*P\d+ · `([^`]+)`/)[1], tipo: b.match(/^\*\*P\d+ · `[^`]+`\*\* \(([^)]+)\)/)[1], textos: citas(b) }));

/*
 * LAS CORRECCIONES OBLIGATORIAS DE MELLO: [texto del recorte, texto que manda].
 * Cada nuevo se comprueba contra la auditoría, cada viejo contra el recorte.
 */
/*
 * Las correcciones 1 y 2 de mello-recortes-v1.md (el plegado y el acierto de
 * P6, la glosa en la tarjeta UEPS) las reemplazan los Aciertos C7: P6 se
 * compara contra la tabla final de Near con A3-1 (abajo), y la tarjeta UEPS
 * lleva el cambio de Near que Mello acepta en A3-2. Queda la 3.
 */
const MELLO = {
  contraPeps: "Si los precios suben, lo vendido lleva costos antiguos frente a ventas de hoy. La utilidad sale mayor, y el libro la llama ficticia.",
};
const SUSTITUCIONES = [
  ["Si los precios suben, lo vendido sale más caro y el impuesto de renta baja.", TARJETA_UEPS_A3_2],
  ["Si los precios suben, la utilidad sale mayor, y el libro la llama ficticia.", MELLO.contraPeps],
];
/* Aciertos C7: lo que P6 dice, en el orden de `textosDeDatos`, de la tabla final (Near con A3-1 de Mello). */
const P6_C7 = [
  ...C7["Pantalla, línea 1"].textos, ...C7.Pregunta.textos, ...C7.Opciones.textos, ...C7["Pista (1.er error)"].textos,
  ...C7["Si elige UEPS"].textos, ...C7["Si elige Promedio"].textos, ...C7.Acierto.textos,
];
const conMello = (t) => SUSTITUCIONES.reduce((x, [viejo, nuevo]) => x.replace(viejo, nuevo), t);
/* Los aciertos de `peps` y `ueps` los cambia Near (t7-1-ap3-aciertos-peps-ueps.md): el viejo del recorte por el nuevo, solo en su pantalla. */
const conNear = (id, textos) => (ACIERTOS_NEAR[id] ? textos.map((t) => (t === ACIERTOS_NEAR[id].viejo ? ACIERTOS_NEAR[id].nuevo : t)) : textos);

/* Los textos de los datos de una pantalla, en el orden en que el recorte los escribe. */
function textosDeDatos(p) {
  const t = [];
  if (p.objetivo) t.push(p.objetivo);
  if (p.pila) t.push(...p.pila.grupos.map((g) => g.rotulo));
  if (p.encabezado) t.push(p.encabezado);
  t.push(...p.parrafos);
  if (p.tipo === "eleccion" && p.figura) t.push(p.figura.columnas.join(" · "), ...p.figura.filas.map((f) => [f.metodo, f.quedan, f.valen].join(" · ")));
  if (p.tarjetas) {
    const r = p.tarjetas.rotulos;
    t.push(...p.tarjetas.metodos.map((m) => m.metodo), ...p.tarjetas.metodos.map((m) => `${r.aFavor} ${m.aFavor} ${r.enContra} ${m.enContra}`));
  }
  if (p.pregunta) t.push(p.pregunta);
  if (p.opciones) {
    t.push(...p.opciones.map((o) => o.texto), p.pista, ...p.opciones.filter((o) => !o.correcta).map((o) => o.devolucion));
    t.push(p.acierto.texto, ...(p.acierto.porque ? [p.acierto.porque] : []), ...p.acierto.calculos);
  }
  t.push(...(p.despues ?? []));
  if (p.siguiente) t.push(p.siguiente);
  return t;
}

/* ═══════════ 1 · TEXTOS CONTRA EL RECORTE Y MELLO ═══════════ */

test("★★★ las diez pantallas del recorte, en su orden, con sus ids y sus tipos", () => {
  assert.equal(BLOQUES.length, 10);
  assert.deepEqual(P.pantallas.map((p) => p.id), BLOQUES.map((b) => b.id));
  assert.deepEqual(P.pantallas.map((p) => p.tipo), BLOQUES.map((b) => (b.tipo === "portada" ? "lectura" : b.tipo)));
});

test("★★★ las correcciones de Mello están en su auditoría, y lo que reemplazan, en el recorte", () => {
  for (const t of Object.values(MELLO)) assert.ok(MELLO_A3_RECORTES.includes(`«${t}»`), `no está en Mello: ${t}`);
  assert.ok(MELLO_A3.includes(`«${TARJETA_UEPS_A3_2}»`) && NEAR_A3.includes(`«${TARJETA_UEPS_A3_2}»`), "A3-2: el cambio de Near, aceptado por Mello");
  for (const [viejo] of SUSTITUCIONES) assert.ok(SECCION.includes(viejo), `no está en el recorte: ${viejo}`);
});

test("★★★ cada pantalla dice, letra por letra y en su orden, lo del recorte con las correcciones de Mello", () => {
  for (const b of BLOQUES) assert.deepEqual(textosDeDatos(pantalla(b.id)), b.id === "la-recomendacion" ? P6_C7 : conNear(b.id, b.textos.map(conMello)), b.id);
});

test("★★★ peps y ueps: el acierto es el de Near, el viejo «Así es.» estaba una vez en su bloque del recorte, y las cifras son las de la pieza", () => {
  for (const id of ["peps", "ueps"]) {
    const { viejo, nuevo } = ACIERTOS_NEAR[id];
    assert.equal(BLOQUES.find((b) => b.id === id).textos.filter((t) => t === viejo).length, 1, `${id}: el viejo en el recorte`);
    assert.equal(pantalla(id).acierto.texto, nuevo, id);
    assert.doesNotMatch(nuevo, /Así es/);
  }
  /* Las cifras de la pieza (INICIO.unidades, COMPRA.unidades, VENDIDAS en los datos): las cuentas de Near cuadran. */
  const INICIO = 10, COMPRA = 30, VENDIDAS = 35;
  assert.ok(ACIERTOS_NEAR.peps.nuevo.includes(`De las ${VENDIDAS} que se venden, primero salen las ${INICIO} del inicio y luego ${VENDIDAS - INICIO} compradas. Quedan ${INICIO + COMPRA - VENDIDAS} compradas.`));
  assert.ok(ACIERTOS_NEAR.ueps.nuevo.includes(`De las ${VENDIDAS} que se venden, primero salen las ${COMPRA} compradas y luego ${VENDIDAS - COMPRA} del inicio. Quedan ${INICIO + COMPRA - VENDIDAS} del inicio.`));
});

test("★★★ A3-1 de Mello: P6 pregunta por precios que bajan; la correcta es PEPS; pista, errores y acierto, letra por letra", () => {
  for (const [vieja, nuevas] of CORRECCIONES_A3) {
    assert.ok(NEAR_A3.includes(vieja), vieja);
    for (const n of nuevas) assert.ok(MELLO_A3.includes(n), n);
  }
  const p6 = pantalla("la-recomendacion");
  assert.deepEqual(p6.parrafos, C7["Pantalla, línea 1"].textos);
  assert.equal(p6.pregunta, "Si los precios bajan, ¿con qué método lo vendido queda más caro?");
  assert.equal(C7.Opciones.correcta, "PEPS");
  assert.equal(p6.opciones.find((o) => o.correcta).texto, C7.Opciones.correcta);
  assert.equal(p6.pista, C7["Pista (1.er error)"].textos[0]);
  assert.equal(p6.opciones.find((o) => o.id === "ueps").devolucion, C7["Si elige UEPS"].textos[0]);
  assert.equal(p6.opciones.find((o) => o.id === "promedio").devolucion, C7["Si elige Promedio"].textos[0]);
  assert.equal(p6.acierto.texto, C7.Acierto.textos[0]);
  /* B2: 9 + 12 + 8 + 31 = 60 al acertar, con el contador de Near. */
  assert.equal(palabrasAlAcertar(C7), 60);
});

test("★★★ C7 · P6 sin plegado: las dos condiciones del libro van en el acierto, a la vista", () => {
  const p6 = pantalla("la-recomendacion");
  assert.equal(p6.acierto.porque, undefined);
  assert.match(p6.acierto.texto, /PEPS en deflación, cuando los precios bajan, y UEPS en inflación, cuando suben\.$/);
  /* La línea que entregaba la deducción salió. */
  assert.doesNotMatch(JSON.stringify(p6), /Si lo que queda vale menos/);
});

test("★★★ A3-2 de Mello: «impuesto de renta» se nombra y se define en P6 antes de AP4; la tarjeta UEPS dice «impuesto sobre la utilidad»", () => {
  const p6 = pantalla("la-recomendacion");
  assert.match(p6.acierto.texto, /menos impuesto de renta, que se calcula sobre ella\./);
  const ueps = pantalla("a-favor-y-en-contra").tarjetas.metodos.find((m) => m.id === "ueps");
  assert.equal(ueps.aFavor, TARJETA_UEPS_A3_2);
  /* La primera vez que la pieza nombra el impuesto de renta es el acierto de P6, con su definición. */
  const primera = P.pantallas.findIndex((p) => /impuesto de renta/i.test(JSON.stringify(p)));
  assert.equal(P.pantallas[primera].id, "la-recomendacion");
  for (const p of P.pantallas.slice(0, primera)) assert.doesNotMatch(JSON.stringify(p), /impuesto/i, p.id);
});

test("★★ la opcional de Mello en A3-1 («Según el libro, cada empresa escoge…») no se aplica", () => {
  assert.ok(MELLO_A3.includes(NO_APLICADAS.a3Opcional));
  assert.doesNotMatch(JSON.stringify(P), /cada empresa escoge/);
});

test("★★★ Mello 3: la tarjeta «En contra» de PEPS dice por qué la utilidad es «ficticia»", () => {
  assert.equal(pantalla("a-favor-y-en-contra").tarjetas.metodos.find((m) => m.id === "peps").enContra, MELLO.contraPeps);
});

test("★★ la opcional de Mello (P8, «cajas» → «unidades») no se aplica", () => {
  assert.match(MELLO_A3_RECORTES, /Opcional: en el acierto de P8, «el orden de las cajas» → «el orden de las unidades»/);
  assert.equal(pantalla("la-refutacion").acierto.texto, "Exacto: el método no tiene que seguir el orden de las cajas.");
});

test("★★★ lo que el recorte cambia del lote 2: las pistas de A3 y la tercera opción de peps y ueps, con su devolución", () => {
  const filas = [...RECORTE_MD.matchAll(/^\| (Pista|Anexo) · A3 `?([^`|]+?)`? (?:y `ueps` )?(?:· ([^|]+?) )?\| (?:«(.+?)»|\([^)]*\)) \| «(.+?)» \|$/gm)];
  const pistas = Object.fromEntries(filas.filter((f) => f[1] === "Pista").map((f) => [f[2], f[5]]));
  assert.deepEqual(Object.keys(pistas).sort(), ["la-recomendacion", "lado-a-lado", "peps", "ueps"]);
  /* La de `la-recomendacion` la reemplaza A3-1 de Mello (Aciertos C7). */
  for (const [id, pista] of Object.entries(pistas)) assert.equal(pantalla(id).pista, id === "la-recomendacion" ? C7["Pista (1.er error)"].textos[0] : pista, id);
  assert.notEqual(pantalla("la-recomendacion").pista, pistas["la-recomendacion"]);
  /* La tercera opción, igual en peps y ueps. */
  assert.ok(RECORTE_MD.includes("| Anexo · A3 `peps` y `ueps` · tercera opción | «De los dos grupos, con un costo promedio» | «De los dos, con un costo promedio» |"));
  for (const id of ["peps", "ueps"]) {
    const o = pantalla(id).opciones.find((x) => x.id === "promedio");
    assert.equal(o.texto, "De los dos, con un costo promedio");
    assert.equal(o.correcta, false);
    const fila = RECORTE_MD.match(new RegExp(`^\\| Anexo · A3 \`${id}\` · su retroalimentación \\| «.+?» \\| «(.+?)» \\|$`, "m"));
    assert.equal(o.devolucion, fila[1], id);
  }
});

test("★★★ ids: los que siguen conservan el suyo; la-refutacion y la pregunta de la-recomendacion son nuevas; sale los-datos", () => {
  assert.equal(pantalla("los-datos"), undefined);
  assert.equal(pantalla("a-favor-y-en-contra").tipo, "tarjetas");
  assert.equal(pantalla("a-favor-y-en-contra").opciones, undefined);
  assert.deepEqual(pantalla("la-refutacion").opciones.map((o) => o.id), ["orden-de-costos", "debe-vender", "tiene-razon"]);
  /* A3-1 de Mello: la correcta pasa a PEPS. */
  assert.deepEqual(pantalla("la-recomendacion").opciones.map((o) => [o.id, o.correcta]), [["peps", true], ["ueps", false], ["promedio", false]]);
});

/* ═══════════ 2 · CIFRAS Y FIGURAS ═══════════ */

test("★★★ las cifras de B-1 se calculan y son las del libro; la pila es la de Near", () => {
  const C = A.CIFRAS;
  assert.deepEqual([C.inicial, C.compras, C.costoDisponible, C.disponibles, C.vendidas, C.quedan, C.promedio, C.peps, C.ueps, C.ponderado, C.puntoMedio],
    [200000, 750000, 950000, 40, 35, 5, 23750, 125000, 100000, 118750, 22500]);
  const pila = pantalla("el-problema").pila;
  assert.deepEqual(pila.grupos.map((g) => [g.id, g.unidades]), [["inicio", 10], ["compras", 30]]);
  assert.deepEqual([pila.salen, pila.quedan], [35, 5]);
  assert.equal(A.UEPS, "UEPS (no válido bajo NIIF)");
  assert.equal(pantalla("ueps").encabezado, "Método UEPS (no válido bajo NIIF)");
});

test("★★★ la tabla del resumen es la de P5, sin la pregunta", () => {
  assert.deepEqual(pantalla("resumen").figura, pantalla("lado-a-lado").figura);
  assert.equal(pantalla("resumen").pregunta, undefined);
  assert.match(SECCION, /\*\*P9 · `resumen`\*\* \(lectura\) · figura: la tabla de P5, sin la pregunta/);
});

test("★★★ P1 · la pila se mueve: 40 unidades en orden, salen 35 una tras otra y después llegan las 5 sin precio", async () => {
  const m = await montar(h(TresFormas, { pieza: conPieza("el-problema"), rotulo: "R" }));
  try {
    const fig = m.caja.querySelector("figure[data-pila]");
    assert.ok(fig, "la figura va en <figure>");
    /* La figura va antes que los textos (orden del recorte). */
    assert.ok(fig.compareDocumentPosition(m.caja.querySelector(".t7a3-p")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    const uds = [...fig.querySelectorAll("[data-unidad]")];
    assert.equal(uds.length, 40);
    assert.equal(fig.querySelectorAll('[data-grupo="inicio"] [data-unidad]').length, 10);
    assert.equal(fig.querySelectorAll('[data-grupo="compras"] [data-unidad]').length, 30);
    const d = uds.map((u) => Number.parseFloat(u.style.getPropertyValue("--t7a3-d")));
    for (let i = 1; i < 35; i++) assert.ok(d[i] > d[i - 1], `la unidad ${i + 1} sale después de la ${i}`);
    const quedan = fig.querySelector("[data-quedan]");
    assert.equal(quedan.querySelectorAll("[data-queda]").length, 5);
    assert.ok(Number.parseFloat(quedan.style.getPropertyValue("--t7a3-d")) >= d[34] + PILA.sale - 1e-9, "las 5 llegan cuando ya salieron las 35");
    /* Lo que no es texto del recorte no se lee: los cuadros van ocultos al lector. */
    for (const x of fig.querySelectorAll(".t7a3-uds, [data-quedan]")) assert.equal(x.getAttribute("aria-hidden"), "true");
  } finally {
    m.desmontar();
  }
  /* El estilo de base es el final: sin movimiento, se ve el final; el movimiento parte de la unidad entera. */
  assert.match(CSS_AP3, /\.t7a3-u \{[^}]*opacity: \.3; transform: scale\(\.72\);/);
  assert.match(CSS_AP3, /@keyframes t7a3-sale \{ from \{ opacity: 1; transform: none; \}/);
  assert.match(CSS_AP3, /prefers-reduced-motion: reduce\) \{ \.t7a3 \*[^}]*animation: none !important/);
});

test("★★★ regla de L: lo del plegado escrito aparte que trae una condición se queda a la vista", () => {
  assert.deepEqual(partirPorque(null), ["", null]);
  assert.deepEqual(partirPorque("Sale del libro. Y del ejemplo."), ["", "Sale del libro. Y del ejemplo."]);
  assert.deepEqual(partirPorque("Vale cuando suben. Y del ejemplo."), [" Vale cuando suben.", "Y del ejemplo."]);
  const conCuando = "Por eso el libro recomienda UEPS en épocas de inflación, cuando los precios suben. También recomienda PEPS en épocas de deflación, cuando bajan.";
  assert.deepEqual(partirPorque(conCuando), [` ${conCuando}`, null]);
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const celdas = (t) => [...t.columnas, ...t.filas.flatMap((f) => [f.metodo, f.quedan, f.valen])];

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(TresFormas, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lectura") {
        const esperado = [p.objetivo, ...(p.pila ? p.pila.grupos.map((g) => g.rotulo) : []), ...p.parrafos, ...(p.figura ? celdas(p.figura) : []), ...(p.despues ?? []), p.siguiente, p.boton, p.pie].filter(Boolean);
        assert.deepEqual(enPantalla(m.caja).textos, esperado, p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      if (p.tipo === "tarjetas") {
        /* Se recorre aparte, con detalle, en su prueba; aquí, abrir las tres y seguir. */
        for (const t of p.tarjetas.metodos) await tocar(m.caja.querySelector(`[data-abrir="${t.id}"]`));
        vistos.push(p.id);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      const cab = [p.encabezado, ...p.parrafos, ...(p.figura ? celdas(p.figura) : []), p.pregunta].filter(Boolean);
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda (lote 2): el 1.er error da la pista; el 2.º y siguientes, la respuesta con su porqué. */
      const malas = p.opciones.filter((x) => !x.correcta);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        fallos++;
        const esperados = textosDelError(p, o, fallos);
        assert.deepEqual(esperados, fallos === 1 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, sinAsiEs(p.acierto.texto)].filter(Boolean), `${p.id} escalera ${fallos}`);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...esperados, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${fallos} ${o.id}`);
        assert.ok(w.document.activeElement === m.caja.querySelector('[data-mensaje="error"]'), `${p.id}: el foco va al mensaje`);
        vistos.push(`${p.id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      const acierto = p.acierto.porque ? `${p.acierto.texto} ${p.acierto.porque}` : p.acierto.texto;
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, acierto, ...p.acierto.calculos, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      assert.ok(w.document.activeElement === m.caja.querySelector('[data-mensaje="acierto"]'), `${p.id}: el foco va al mensaje`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* 3 de lectura, 1 de tarjetas; seis preguntas con tres opciones: colocando, las 2 incorrectas, la 1.ª otra vez y el acierto. */
    assert.equal(vistos.length, 3 + 1 + 6 * 5);
    assert.ok(m.caja.querySelector("[data-boton]") === null, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★★ C7 · P6: el acierto entero a la vista, sin «¿Por qué?» ni plegado", async () => {
  const p = pantalla("la-recomendacion");
  const m = await montar(h(TresFormas, { pieza: conPieza("la-recomendacion"), rotulo: "R" }));
  try {
    await tocar(m.caja.querySelector('[data-opcion="peps"]'));
    await tocar(boton(m.caja, "confirmar"));
    const msg = m.caja.querySelector('[data-mensaje="acierto"] [data-texto]');
    assert.equal(msg.textContent, C7.Acierto.textos[0]);
    assert.equal(m.caja.querySelectorAll('[data-mensaje="acierto"] [data-texto]').length, 1);
    assert.ok(msg.querySelector("[data-por-que]") === null, "sin «¿Por qué?»");
    assert.ok(msg.querySelector("[data-plegado]") === null, "nada plegado");
  } finally {
    m.desmontar();
  }
});

test("★★★ P7: tres tarjetas cerradas; al tocar una se abre solo esa; otra cierra la anterior; «Seguir» cuando se abrieron las tres", async () => {
  const p = pantalla("a-favor-y-en-contra");
  const { rotulos, metodos } = p.tarjetas;
  const m = await montar(h(TresFormas, { pieza: conPieza("a-favor-y-en-contra", "la-refutacion"), rotulo: "R" }));
  const abre = (id) => m.caja.querySelector(`[data-abrir="${id}"]`);
  const expandidas = () => metodos.map((t) => abre(t.id).getAttribute("aria-expanded"));
  const nombres = metodos.map((t) => t.metodo);
  const textosCon = (abierta) => [p.parrafos[0], ...metodos.flatMap((t) => (t.id === abierta ? [t.metodo, rotulos.aFavor, t.aFavor, rotulos.enContra, t.enContra] : [t.metodo])), A.BOTON.seguir, p.pie];
  try {
    assert.deepEqual(enPantalla(m.caja).textos, [p.parrafos[0], ...nombres, A.BOTON.seguir, p.pie], "cerradas");
    assert.deepEqual(expandidas(), ["false", "false", "false"]);
    for (const t of metodos) assert.equal(abre(t.id).tagName, "BUTTON");
    assert.equal(boton(m.caja, "seguir").getAttribute("aria-disabled"), "true");
    /* «Seguir» inactivo no avanza. */
    await tocar(boton(m.caja, "seguir"));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "a-favor-y-en-contra");
    for (const [k, t] of metodos.entries()) {
      await tocar(abre(t.id));
      assert.deepEqual(enPantalla(m.caja).textos, textosCon(t.id), `abierta · ${t.id}`);
      assert.deepEqual(expandidas(), metodos.map((x) => String(x.id === t.id)), `solo ${t.id}`);
      assert.equal(m.caja.querySelectorAll("[data-abierta-de]").length, 1);
      assert.equal(abre(t.id).getAttribute("aria-controls"), m.caja.querySelector("[data-abierta-de]").id);
      assert.equal(boton(m.caja, "seguir").getAttribute("aria-disabled"), k < 2 ? "true" : null, `tras abrir ${k + 1}`);
    }
    /* Tocar la abierta la cierra. */
    await tocar(abre("promedio"));
    assert.deepEqual(expandidas(), ["false", "false", "false"]);
    assert.deepEqual(enPantalla(m.caja).textos, [p.parrafos[0], ...nombres, A.BOTON.seguir, p.pie]);
    await tocar(boton(m.caja, "seguir"));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "la-refutacion");
  } finally {
    m.desmontar();
  }
});

test("★★ los cálculos de P2, P3 y P4 llegan con el acierto; las opciones se barajan en cada intento", async () => {
  const p = pantalla("promedio-ponderado");
  const m = await montar(h(TresFormas, { pieza: conPieza("promedio-ponderado"), rotulo: "R" }));
  try {
    const calc = () => [...m.caja.querySelectorAll("[data-calculo]")].map((c) => c.textContent);
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    assert.deepEqual(calc(), []);
    let antes = orden();
    for (let i = 0; i < 12; i++) {
      await tocar(m.caja.querySelector('[data-opcion="punto-medio"]'));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(calc(), []);
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
    await tocar(m.caja.querySelector('[data-opcion="ponderado"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(calc(), p.acierto.calculos);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER, Y EL ORDEN ═══════════ */

test("★★ sin el 33 %, sin advertencias sobre NIIF, sin nada interno; sin color de debe ni de haber", () => {
  const todo = JSON.stringify(P) + CSS_AP3;
  assert.doesNotMatch(todo, /33 ?%/);
  assert.doesNotMatch(todo, /#2A9D8F|#E9C46A/i);
  /* NIIF va solo en el rótulo de UEPS: el encabezado de P3, la tabla (P5 y P9), la opción de P6 y la tarjeta de P7. */
  const json = JSON.stringify(P);
  assert.equal((json.match(/NIIF/g) ?? []).length, 5);
  assert.equal((json.match(/UEPS \(no válido bajo NIIF\)/g) ?? []).length, 5);
  const texto = P.pantallas.flatMap(textosDeDatos).join("\n");
  for (const interno of ["≈", "glosa", "construcción", "Near", "Mello", "Watari", "C7-", "INFLESZ"]) assert.ok(!texto.includes(interno), interno);
});

test("★★★ fuera del catálogo de FP; id del mapa; en T7-1 en la posición 5: después de AP2 y antes de AP4 y A5", () => {
  assert.equal(A.AP3_ID, "t7-1-a3-tres-formas");
  assert.equal(P.numero, 3);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.AP3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.ok(ids.indexOf(A.AP3_ID) > ids.indexOf("t7-1-a2-la-factura-completa"));
  assert.ok(ids.indexOf(A.AP3_ID) < ids.indexOf("t7-1-a5-importados-y-fletes"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.ok(piezas.indexOf(A.AP3_ID) > piezas.indexOf("t7-1-a2-la-factura-completa"));
  assert.ok(piezas.indexOf(A.AP3_ID) < piezas.indexOf("t7-1-a5-importados-y-fletes"));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP3_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/TresFormas.jsx", "src/data/contabilidadT7_1_ap3.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
