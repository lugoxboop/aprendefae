import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 2 — «¿Cuándo se causa?» (paquete de Levi).
 *
 *   · para cada ítem: la marca correcta y el tipo de error de cada marca
 *   · el primer toque califica
 *   · un arrastre de más de 10 px no cuenta
 *   · los 8 px entre filas no responden
 *   · el acierto de cada ítem es el suyo; en un error, primero el tipo
 *   · textos textuales; tutorial de la panadería; pies «Basado en el libro»
 *   · ni «nació», ni «nace», ni «se anota», ni «ganó»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
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

const A2 = await import("../../data/contabilidadTema3Act2.js");
const L = await import("../cuandoSeCausa.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { default: CuandoSeCausa } = await import("../../components/mecanicas/libros/tema3/CuandoSeCausa.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { REGLAS } = await import("../../docente/etiquetasItem.js");

const { HECHO, FACTURA, DINERO, ACUERDO, CIERRE } = A2;
const Marco = ({ children }) => h("div", null, children);

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(CuandoSeCausa, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const disparar = async (el, tipo, x = 0, y = 0) => {
  await act(async () => { el.dispatchEvent(new w.MouseEvent(tipo, { bubbles: true, clientX: x, clientY: y })); });
};
/* Un toque de verdad: bajar, (moverse), levantar y el clic que manda el navegador. */
const tocar = async (el, mover = 0) => {
  await disparar(el, "pointerdown", 0, 0);
  if (mover) await disparar(el, "pointermove", 0, mover);
  await disparar(el, "pointerup", 0, mover);
  await disparar(el, "click", 0, mover);
};
const fila = (caja, id) => caja.querySelector(`[data-marca="${id}"]`);
const panel = (caja) => caja.querySelector("[data-panel]");
const textosRetro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((x) => x.textContent);

/* ═══════════ CADA ÍTEM: LA CORRECTA Y EL TIPO DE CADA EQUIVOCADA ═══════════ */

const TABLA = {
  "t3a2-mps": { servicio: HECHO, factura: FACTURA, cierre: CIERRE, cobro: DINERO },
  "t3a2-maquina-san-calixto": { uso: HECHO, cierre: CIERRE, pago: DINERO },
  "t3a2-pago-30-dias": { acuerdo: ACUERDO, servicio: HECHO, pago: DINERO },
  "t3a2-maquina-san-miguel": { pedido: ACUERDO, servicio: HECHO, cobro: DINERO },
  "t3a2-jcc": { cotizacion: ACUERDO, pedido: ACUERDO, servicio: HECHO, factura: FACTURA },
  "t3a2-pago-60-dias": { cotizacion: ACUERDO, acuerdo: ACUERDO, servicio: HECHO, pago: DINERO },
};

test("★★★ para cada ítem: la marca correcta y el tipo de error de cada marca equivocada", () => {
  assert.equal(A2.ITEMS_ACT2.length, 6);
  for (const item of A2.ITEMS_ACT2) {
    const esperado = TABLA[item.id];
    assert.ok(esperado, item.id);
    assert.deepEqual(Object.keys(esperado), item.marcas.map((m) => m.id), `${item.id}: marcas o su orden`);
    for (const [marca, tipo] of Object.entries(esperado)) {
      const r = L.evaluarAct2(item, marca);
      assert.equal(r.ok, tipo === HECHO, `${item.id}/${marca}`);
      assert.equal(r.tipo, tipo, `${item.id}/${marca}`);
      assert.deepEqual(r.textos, tipo === HECHO ? [item.acierto] : [A2.ERROR_POR_TIPO[tipo], item.acierto]);
    }
    assert.equal(item.marcas.filter((m) => m.tipo === HECHO).length, 1, `${item.id}: una sola correcta`);
  }
});

test("★★★ el acierto de cada ítem es el suyo (por contenido, no por número)", () => {
  const por = Object.fromEntries(A2.ITEMS_ACT2.map((x) => [x.id, x.acierto]));
  assert.deepEqual(por, {
    "t3a2-mps": "El servicio quedó prestado el 21: ahí se causó el ingreso. El papel y la plata llegan más tarde.",
    "t3a2-maquina-san-calixto": "Cada día de uso iba causando el gasto. Los cinco días son de enero, aunque la plata salga en febrero.",
    "t3a2-pago-30-dias": "El ingreso se causó el día del servicio. Los 30 días solo corren para la plata.",
    "t3a2-maquina-san-miguel": "Cada día de servicio iba causando el ingreso. Los cinco días son suyos, aunque le paguen en febrero.",
    "t3a2-jcc": "El ingreso se causó el 8, cuando el trabajo quedó hecho. Cotizar y pedir son antes; facturar es después.",
    "t3a2-pago-60-dias": "El ingreso se causó el día del servicio. Lo de antes era conversación y lo de después es solo la plata.",
  });
  /* Cada acierto habla de su ítem. */
  assert.match(por["t3a2-mps"], /el 21/);
  assert.match(A2.ITEMS_ACT2.find((x) => x.id === "t3a2-mps").hecho, /MPS el 21/);
  assert.match(por["t3a2-jcc"], /el 8/);
  assert.match(A2.ITEMS_ACT2.find((x) => x.id === "t3a2-jcc").hecho, /JCC el 8/);
  assert.match(por["t3a2-pago-30-dias"], /30 días/);
  assert.match(por["t3a2-pago-60-dias"], /antes era conversación/);
  assert.match(por["t3a2-maquina-san-calixto"], /uso .* gasto/);
  assert.match(por["t3a2-maquina-san-miguel"], /servicio .* ingreso/);
});

test("★★★ los textos de error, los de Levi y Gen, textuales", () => {
  assert.deepEqual(A2.ERROR_POR_TIPO, {
    [FACTURA]: "La factura es el papel, no el hecho. El ingreso se causa cuando el servicio queda prestado.",
    [DINERO]: "Esa es la fecha en que se mueve la plata. Se causa antes, cuando el hecho ya ocurrió.",
    [ACUERDO]: "Acordar no es cumplir. Se causa cuando el servicio ya se presta o se recibe, no cuando se pide.",
    [CIERRE]: "El cierre es cuando se revisa qué falta anotar. El hecho se causó antes de esa fecha.",
  });
});

test("★★ los pies dicen «Basado en el libro» en los seis, que llevan fechas o instancia propias", () => {
  assert.deepEqual(A2.ITEMS_ACT2.map(A2.pieDe), [
    "Basado en el libro, p. 121", "Basado en el libro, p. 140", "Basado en el libro, p. 120",
    "Basado en el libro, p. 142", "Basado en el libro, p. 121", "Basado en el libro, p. 120",
  ]);
});

/* ═══════════ MONTADA: EL TOQUE ═══════════ */

test("★★★ acierto: la fila se rellena, dice «Se causa aquí» y sale el acierto del ítem", async () => {
  const item = A2.ITEMS_ACT2[0];
  const m = await montar({ items: [item] });
  try {
    await tocar(fila(m.caja, "servicio"));
    assert.equal(fila(m.caja, "servicio").getAttribute("data-estado"), "correcta");
    assert.equal(fila(m.caja, "servicio").getAttribute("aria-label"), "Servicio prestado, 21, correcta");
    assert.equal(fila(m.caja, "servicio").querySelector("[data-se-causa]").textContent, "Se causa aquí");
    assert.equal(panel(m.caja).getAttribute("data-panel"), "acierto");
    assert.deepEqual(textosRetro(m.caja), [item.acierto]);
    for (const id of ["factura", "cierre", "cobro"]) assert.equal(fila(m.caja, id).getAttribute("data-estado"), "atenuada");
  } finally { m.desmontar(); }
});

test("★★★ error: primero el texto del tipo de marca y después el acierto; se revela la correcta", async () => {
  const item = A2.ITEMS_ACT2[4];
  const m = await montar({ items: [item] });
  try {
    await tocar(fila(m.caja, "factura"));
    assert.equal(fila(m.caja, "factura").getAttribute("data-estado"), "equivocada");
    assert.equal(fila(m.caja, "factura").getAttribute("aria-label"), "Factura, 12, equivocada");
    assert.equal(fila(m.caja, "servicio").getAttribute("data-estado"), "correcta");
    assert.equal(panel(m.caja).getAttribute("data-panel"), "error");
    assert.deepEqual(textosRetro(m.caja), [A2.ERROR_POR_TIPO[FACTURA], item.acierto]);
  } finally { m.desmontar(); }
});

test("★★★ el primer toque califica: después, ninguna fila responde", async () => {
  const item = A2.ITEMS_ACT2[1];
  let pct = null;
  const m = await montar({ items: [item], onCompletar: (p) => { pct = p; } });
  try {
    await tocar(fila(m.caja, "pago"));
    await tocar(fila(m.caja, "uso"));
    assert.equal(fila(m.caja, "pago").getAttribute("data-estado"), "equivocada");
    assert.deepEqual(textosRetro(m.caja), [A2.ERROR_POR_TIPO[DINERO], item.acierto]);
    for (const b of m.caja.querySelectorAll("[data-marca]")) assert.equal(b.getAttribute("aria-disabled"), "true");
    await tocar([...m.caja.querySelectorAll("button")].find((b) => b.textContent === "Ver mi resumen"));
    assert.equal(pct, 0);
  } finally { m.desmontar(); }
});

test("★★★ un arrastre de más de 10 px no cuenta; uno corto sí", async () => {
  const item = A2.ITEMS_ACT2[0];
  const m = await montar({ items: [item] });
  try {
    await tocar(fila(m.caja, "factura"), 11);
    assert.equal(panel(m.caja), null, "un arrastre de 11 px contestó");
    assert.equal(fila(m.caja, "factura").getAttribute("data-estado"), "reposo");
    await tocar(fila(m.caja, "servicio"), 6);
    assert.equal(panel(m.caja).getAttribute("data-panel"), "acierto");
  } finally { m.desmontar(); }
});

test("★★★ los 8 px entre filas no responden: las filas van separadas por un hueco que no es botón", async () => {
  const item = A2.ITEMS_ACT2[5];
  const m = await montar({ items: [item] });
  try {
    const grupo = fila(m.caja, "cotizacion").parentElement;
    assert.equal(grupo.style.rowGap, "8px");
    assert.notEqual(grupo.tagName, "BUTTON");
    await tocar(grupo);
    assert.equal(panel(m.caja), null, "tocar el hueco contestó");
    for (const b of m.caja.querySelectorAll("[data-marca]")) {
      assert.equal(b.tagName, "BUTTON");
      assert.equal(b.style.minHeight, "56px");
    }
  } finally { m.desmontar(); }
});

test("★★ la tarjeta lleva empresa, hecho y pie; la leyenda y el estado vacío están", async () => {
  const m = await montar({ items: [A2.ITEMS_ACT2[2]] });
  try {
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "Empresa:Una empresa de servicios");
    assert.equal(m.caja.querySelector("[data-hecho]").textContent, "Presta un servicio y acuerda que le paguen 30 días después.");
    assert.equal(m.caja.querySelector("[data-pie]").textContent, "Basado en el libro, p. 120");
    assert.equal(m.caja.querySelector("[data-leyenda]").textContent, "Las marcas van en orden, de antes a después");
    assert.equal(m.caja.querySelector("[data-estado-vacio]").textContent, "Solo una de estas marcas es el hecho.");
    assert.equal(m.caja.querySelector("[data-consigna]").textContent, "Lee el hecho. Toca el día en que se causa.");
  } finally { m.desmontar(); }
});

test("★★ la tanda entera: seis ítems, «Siguiente ítem» y al final «Ver mi resumen»", async () => {
  let pct = null;
  const m = await montar({ onCompletar: (p) => { pct = p; } });
  try {
    for (let k = 0; k < 6; k++) {
      const item = A2.ITEMS_ACT2[k];
      const correcta = item.marcas.find((x) => x.tipo === HECHO).id;
      await tocar(fila(m.caja, k < 3 ? correcta : item.marcas.find((x) => x.tipo !== HECHO).id));
      const b = [...m.caja.querySelectorAll("button")].find((x) => ["Siguiente ítem", "Ver mi resumen"].includes(x.textContent));
      assert.equal(b.textContent, k === 5 ? "Ver mi resumen" : "Siguiente ítem");
      await tocar(b);
    }
    assert.equal(pct, 50);
  } finally { m.desmontar(); }
});

/* ═══════════ EL TUTORIAL Y EL CAMINO ═══════════ */

test("★★★ el tutorial: la panadería, el paso 2 de Levi, su alternativo y sin pie", async () => {
  const asi = ASI_SE_JUEGA["t3-cuando-se-causa"];
  assert.ok(asi, "no hay «Así se juega»");
  assert.equal(asi.titulo, "¿Cuándo se causa?");
  assert.equal(asi.pasos[1], "Busca el día en que se entregó el bien o se prestó el servicio.");
  /* El componente antepone «Ejemplo: »: lo que se lee es el texto de Levi. */
  assert.equal(`Ejemplo: ${asi.alt}`, "Ejemplo: la línea tiene tres marcas. Se toca la de la entrega del pan, el 10, y no la del pedido ni la del pago.");
  const ej = asi.demo.items[0];
  assert.equal(ej.empresa, "Una panadería");
  assert.equal(ej.hecho, "Recibe el pedido el 8, entrega el pan el 10 y le pagan el 20.");
  assert.deepEqual(ej.marcas.map((x) => x.rotulo), ["Pedido, 8", "Entrega del pan, 10", "Pago, 20"]);
  assert.equal(ej.acierto, "El pan quedó entregado el 10. El pedido es antes y el pago es después.");
  assert.ok(!A2.ITEMS_ACT2.some((x) => x.id === ej.id), "el ejemplo está fuera del banco");
  /* En modo demo, la panadería sin pie y la correcta es la entrega. */
  const m = await montar({ items: [ej], modoDemo: true });
  try {
    assert.equal(m.caja.querySelector("[data-pie]"), null, "el tutorial lleva pie");
    await tocar(m.caja.querySelector(asi.guion.toques[0].en));
    assert.deepEqual(textosRetro(m.caja), [ej.acierto]);
  } finally { m.desmontar(); }
});

test("★★ va después de la pieza 3 en el camino del Tema 3, y tiene regla docente y fila en el catálogo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  assert.ok(ids.indexOf("t3-cuando-se-causa") > ids.indexOf("t3-a3-lo-que-ya-paso"));
  assert.equal(tema.actividades.find((a) => a.id === "t3-cuando-se-causa").clasificacion.tipo, HACER);
  assert.deepEqual(JUEGOS.map((j) => j.id).slice(0, 2), ["t3-ingreso-o-cobro", "t3-cuando-se-causa"]);
  assert.equal(REGLAS["t3-cuando-se-causa"]("t3a2-jcc"), "San Calixto · Cotizó el 4 y le pidieron el trabajo el 6. Prestó el servicio a JCC el 8 y facturó el 12.");
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  assert.match(sql, /\('t3-cuando-se-causa',\s*'contabilidad',\s*'ingresos-gastos-y-caja'/);
});

test("★★★ ni «nació», ni «nace», ni «se anota», ni «ganó», en ningún archivo de la actividad", () => {
  const archivos = [
    "../../data/contabilidadTema3Act2.js", "../cuandoSeCausa.js",
    "../../components/mecanicas/libros/tema3/CuandoSeCausa.jsx", "../../data/asiSeJuegaTema3.js",
  ];
  for (const a of archivos) {
    const fuente = readFileSync(new URL(a, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /naci[óo]|\bnace\b|se anota|gan[óo]/iu, a);
  }
});

test("★★ T1-6 y lo compartido no se tocan: el componente no importa nada de T1-6", () => {
  const fuente = readFileSync(new URL("../../components/mecanicas/libros/tema3/CuandoSeCausa.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, /EnCualEstadoAparece|T1_6|contabilidadTema1/);
  assert.doesNotMatch(fuente, /#2a9d8f|#52c4b0|#e9c46a|FAE\.(teal|ambar)/i, "ni verde azulado ni ámbar");
});
