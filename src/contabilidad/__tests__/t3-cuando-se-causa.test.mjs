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
 *   · la segunda decisión («Ese día, ¿qué queda?»): textos de Katsumi, un
 *     toque, pastillas, «Iba aquí» a los 0,7 s, la devolución después, el
 *     ítem cuenta solo con las dos bien y el detalle guarda las dos
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
const opcion = (caja, id) => caja.querySelector(`[data-opcion-segunda="${id}"]`);
const avance = (caja) => [...caja.querySelectorAll("button")].find((b) => ["Siguiente ítem", "Ver mi resumen"].includes(b.textContent));
const mensaje = (caja) => caja.querySelector("[data-mensaje-segunda]");
const textosMensaje = (caja) => [...caja.querySelectorAll("[data-texto-mensaje]")].map((x) => x.textContent);
const esperar = async (ms) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const correctaDe = (item) => item.marcas.find((x) => x.tipo === HECHO).id;

/* ═══════════ CADA ÍTEM: LA CORRECTA Y EL TIPO DE CADA EQUIVOCADA ═══════════ */

const TABLA = {
  "t3a2-mps": { servicio: HECHO, factura: FACTURA, cierre: CIERRE, cobro: DINERO },
  "t3a2-maquina-san-calixto": { uso: HECHO, cierre: CIERRE, pago: DINERO },
  "t3a2-pago-30-dias": { acuerdo: ACUERDO, servicio: HECHO, pago: DINERO },
  "t3a2-maquina-san-miguel": { pedido: ACUERDO, servicio: HECHO, cobro: DINERO },
  "t3a2-jcc": { cotizacion: ACUERDO, pedido: ACUERDO, servicio: HECHO, factura: FACTURA },
  "t3a2-lcdv": { cotizacion: ACUERDO, servicio: HECHO, cierre: CIERRE },
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
    "t3a2-lcdv": "El ingreso se causó el 20, con el servicio. La plata entró ese día: no queda nada pendiente.",
  });
  /* Cada acierto habla de su ítem. */
  assert.match(por["t3a2-mps"], /el 21/);
  assert.match(A2.ITEMS_ACT2.find((x) => x.id === "t3a2-mps").hecho, /MPS el 21/);
  assert.match(por["t3a2-jcc"], /el 8/);
  assert.match(A2.ITEMS_ACT2.find((x) => x.id === "t3a2-jcc").hecho, /JCC el 8/);
  assert.match(por["t3a2-pago-30-dias"], /30 días/);
  assert.match(por["t3a2-lcdv"], /el 20/);
  assert.match(A2.ITEMS_ACT2.find((x) => x.id === "t3a2-lcdv").hecho, /LCDV el 20/);
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
    "Basado en el libro, p. 142", "Basado en el libro, p. 121", "Basado en el libro, p. 121",
  ]);
});

/* ═══════════ MONTADA: EL TOQUE ═══════════ */

test("★★★ acierto sin segunda decisión (la panadería): la fila se rellena, dice «Se causa aquí» y sale el acierto", async () => {
  const item = A2.EJEMPLO_PANADERIA;
  assert.equal(L.tieneSegunda(item), false, "el tutorial sigue igual");
  const m = await montar({ items: [item] });
  try {
    await tocar(fila(m.caja, "entrega"));
    assert.equal(fila(m.caja, "entrega").getAttribute("data-estado"), "correcta");
    assert.equal(fila(m.caja, "entrega").getAttribute("aria-label"), "Entrega del pan, 10, correcta");
    assert.equal(fila(m.caja, "entrega").querySelector("[data-se-causa]").textContent, "Se causa aquí");
    assert.equal(panel(m.caja).getAttribute("data-panel"), "acierto");
    assert.deepEqual(textosRetro(m.caja), [item.acierto]);
    for (const id of ["pedido", "pago"]) assert.equal(fila(m.caja, id).getAttribute("data-estado"), "atenuada");
    assert.equal(m.caja.querySelector("[data-segunda]"), null);
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
    assert.equal(m.caja.querySelector("[data-segunda]"), null, "al fallar el día no hay segunda decisión");
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
    assert.ok(m.caja.querySelector("[data-segunda]"), "un toque corto contestó");
    await tocar(opcion(m.caja, "nada"), 11);
    assert.equal(opcion(m.caja, "nada").getAttribute("data-estado"), "reposo", "un arrastre de 11 px contestó la segunda");
    await tocar(opcion(m.caja, "por-cobrar"), 6);
    assert.equal(opcion(m.caja, "por-cobrar").getAttribute("data-estado"), "bien");
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
      if (k < 3) await tocar(opcion(m.caja, item.queda));
      const b = avance(m.caja);
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
  /* «¿Gasto o pago?» va entre las dos desde el #506. */
  assert.deepEqual(JUEGOS.map((j) => j.id).slice(0, 3), ["t3-ingreso-o-cobro", "t3-gasto-o-pago", "t3-cuando-se-causa"]);
  assert.equal(REGLAS["t3-cuando-se-causa"]("t3a2-jcc"), "San Calixto · Cotizó el 4 y le pidieron el trabajo el 6. Prestó el servicio a JCC el 8 y facturó el 12.");
  /* El ítem retirado en el #439 se sigue leyendo en el panel docente, pero ya no sale en la partida (Yujiro). */
  assert.equal(REGLAS["t3-cuando-se-causa"]("t3a2-pago-60-dias"), "Una empresa de servicios · Cotiza y acuerda el trabajo. Presta el servicio. Le pagan 60 días después.");
  assert.equal(A2.ITEMS_ACT2.some((x) => x.id === "t3a2-pago-60-dias"), false);
  assert.deepEqual(A2.ITEMS_ACT2_RETIRADOS.map((x) => x.id), ["t3a2-pago-60-dias"]);
  assert.equal(REGLAS["t3-cuando-se-causa"]("t3a2-no-existe"), null);
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

/* ═══════════ LA SEGUNDA DECISIÓN: «ESE DÍA, ¿QUÉ QUEDA?» ═══════════ */

test("★★★ la segunda decisión: los textos de Katsumi, textuales", () => {
  assert.equal(A2.SEGUNDA_ACT2.pregunta, "Ese día, ¿qué queda?");
  assert.deepEqual(A2.SEGUNDA_ACT2.opciones.map((o) => o.rotulo), ["Por cobrar", "Por pagar", "Nada pendiente"]);
  assert.deepEqual(A2.ERRORES_SEGUNDA_ACT2, {
    "por-cobrar": { "por-pagar": "Prestó el servicio: a ella le deben.", nada: "La plata no se ha movido: algo quedó pendiente." },
    "por-pagar": { "por-cobrar": "Usó la máquina: ella es la que debe.", nada: "La plata no se ha movido: algo quedó pendiente." },
    nada: { "por-cobrar": "Le pagaron el mismo día: nadie debe nada.", "por-pagar": "Le pagaron el mismo día: nadie debe nada." },
  });
  assert.deepEqual(A2.MARCA_ACT2, { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" });
  assert.equal(A2.SE_CAUSA_DIA("Servicio prestado, 21"), "Se causa: Servicio prestado, 21");
});

test("★★★ «Por pagar» solo en la máquina de San Calixto (p. 140), «Nada pendiente» solo en LCDV y «Por cobrar» en los otros cuatro", () => {
  assert.deepEqual(A2.ITEMS_ACT2.map((x) => [x.id, x.queda]), [
    ["t3a2-mps", "por-cobrar"], ["t3a2-maquina-san-calixto", "por-pagar"], ["t3a2-pago-30-dias", "por-cobrar"],
    ["t3a2-maquina-san-miguel", "por-cobrar"], ["t3a2-jcc", "por-cobrar"], ["t3a2-lcdv", "nada"],
  ]);
  for (const item of A2.ITEMS_ACT2) {
    for (const o of A2.SEGUNDA_ACT2.opciones) {
      const r = L.evaluarSegundaAct2(item, o.id);
      assert.equal(r.ok, o.id === item.queda, `${item.id} · ${o.id}`);
      assert.equal(r.error, r.ok ? null : A2.ERRORES_SEGUNDA_ACT2[item.queda][o.id]);
      if (!r.ok) assert.ok(r.error, `${item.id} · ${o.id} sin texto de error`);
    }
  }
});

test("★★★ al acertar el día: la línea cede a la pregunta y tres filas; la ficha sigue arriba; ni devolución ni avance todavía", async () => {
  const item = A2.ITEMS_ACT2[0];
  const m = await montar({ items: [item] });
  try {
    await tocar(fila(m.caja, "servicio"));
    assert.ok(m.caja.querySelector("[data-tarjeta-hecho]"));
    assert.equal(m.caja.querySelector("[data-filas]"), null);
    assert.equal(m.caja.querySelector("[data-leyenda]"), null);
    assert.equal(m.caja.querySelector("[data-se-causa-dia]").textContent, "Se causa: Servicio prestado, 21");
    assert.equal(m.caja.querySelector("[data-pregunta-segunda]").textContent, "Ese día, ¿qué queda?");
    const ops = [...m.caja.querySelectorAll("[data-opcion-segunda]")];
    assert.deepEqual(ops.map((o) => o.textContent), ["Por cobrar", "Por pagar", "Nada pendiente"]);
    for (const o of ops) {
      assert.equal(o.style.minHeight, "56px");
      assert.equal(o.style.width, "100%");
      assert.equal(o.style.border, "1px solid rgba(248, 249, 250, 0.35)");
      assert.equal(o.style.background, "transparent");
      assert.equal(o.querySelector("[data-hueco-pastilla]").style.height, "20px");
    }
    assert.equal(panel(m.caja), null, "la devolución no sale antes de la segunda decisión");
    assert.equal(avance(m.caja), undefined);
    const encabezado = m.caja.querySelector("[data-encabezado-segunda]");
    assert.equal(document.activeElement, encabezado);
    assert.ok(encabezado.contains(m.caja.querySelector("[data-se-causa-dia]")), "«Se causa» y la pregunta, en el mismo bloque");
    assert.equal(encabezado.style.flexWrap, "wrap");
    assert.equal(m.caja.querySelector("[data-se-causa-dia]").style.fontWeight, "500");
    assert.equal(m.caja.querySelector("[data-se-causa-dia]").style.fontSize, "12px");
    assert.equal(m.caja.querySelector("[data-pregunta-segunda]").style.fontWeight, "600");
    assert.equal(m.caja.querySelector("[data-pregunta-segunda]").style.fontSize, "15px");
  } finally { m.desmontar(); }
});

test("★★★ segunda bien: 2 px #F8F9FA y «Correcto» con Check; después la devolución; vale 1 y el detalle guarda las dos", async () => {
  const item = A2.ITEMS_ACT2[1];
  let fin = null;
  const m = await montar({ items: [item], onCompletar: (...a) => { fin = a; } });
  try {
    await tocar(fila(m.caja, correctaDe(item)));
    await tocar(opcion(m.caja, "por-pagar"));
    const o = opcion(m.caja, "por-pagar");
    assert.equal(o.getAttribute("data-estado"), "bien");
    assert.equal(o.style.border, "2px solid rgb(248, 249, 250)");
    assert.equal(o.style.padding, "13px");
    assert.equal(o.querySelector("[data-pastilla]").textContent, "Correcto");
    assert.ok(o.querySelector("[data-pastilla] svg"));
    assert.equal(o.getAttribute("aria-label"), "Por pagar, correcto");
    assert.equal(mensaje(m.caja).getAttribute("data-mensaje-segunda"), "acierto");
    assert.equal(mensaje(m.caja).style.borderLeft, "3px solid rgb(184, 196, 212)");
    assert.deepEqual(textosMensaje(m.caja), [`Correcto. ${item.acierto}`], "un solo bloque: «Correcto.» y la devolución");
    assert.equal(panel(m.caja), null);
    await tocar(opcion(m.caja, "nada"));
    assert.equal(opcion(m.caja, "nada").getAttribute("data-estado"), "apagada", "un toque califica: no hay otro");
    await tocar(avance(m.caja));
    assert.equal(fin[0], 100);
    assert.deepEqual(fin[2].map(({ item: i, ok, respuesta, respuestas }) => ({ i, ok, respuesta, respuestas })), [
      { i: item.id, ok: true, respuesta: null, respuestas: { dia: "uso", segunda: "por-pagar" } },
    ]);
  } finally { m.desmontar(); }
});

for (const [k, mal] of [[0, "nada"], [0, "por-pagar"], [1, "por-cobrar"], [1, "nada"], [5, "por-cobrar"], [5, "por-pagar"]]) {
  const item = A2.ITEMS_ACT2[k];
  test(`★★★ segunda mal (${item.id} · ${mal}): coral y «No va aquí», el error en su bloque; a los 0,7 s «Iba aquí» y la devolución; vale 0`, async () => {
    let fin = null;
    const m = await montar({ items: [item], onCompletar: (...a) => { fin = a; } });
    try {
      await tocar(fila(m.caja, correctaDe(item)));
      await tocar(opcion(m.caja, mal));
      const o = opcion(m.caja, mal);
      assert.equal(o.getAttribute("data-estado"), "mal");
      assert.equal(o.style.border, "2px solid rgb(231, 111, 81)");
      assert.equal(o.querySelector("[data-pastilla]").textContent, "No va aquí");
      const bloque = mensaje(m.caja);
      assert.equal(bloque.getAttribute("data-mensaje-segunda"), "error");
      assert.deepEqual(textosMensaje(m.caja), [`Incorrecto: ${A2.ERRORES_SEGUNDA_ACT2[item.queda][mal]}`]);
      assert.equal(bloque.style.borderLeft, "3px solid rgb(231, 111, 81)");
      assert.equal(bloque.style.background, "rgba(184, 196, 212, 0.12)");
      assert.equal(opcion(m.caja, item.queda).getAttribute("data-estado"), "apagada", "«Iba aquí» espera 0,7 s");
      assert.equal(panel(m.caja), null);
      assert.equal(avance(m.caja), undefined);
      await esperar(750);
      const c = opcion(m.caja, item.queda);
      assert.equal(c.getAttribute("data-estado"), "era");
      assert.equal(c.style.border, "2px solid rgb(248, 249, 250)");
      assert.equal(c.querySelector("[data-pastilla]").textContent, "Iba aquí");
      assert.equal(m.caja.querySelectorAll("[data-mensaje-segunda]").length, 1, "un solo bloque");
      assert.deepEqual(textosMensaje(m.caja), [`Incorrecto: ${A2.ERRORES_SEGUNDA_ACT2[item.queda][mal]}`, item.acierto], "el error y después la devolución, en el mismo bloque");
      assert.equal(panel(m.caja), null);
      await tocar(avance(m.caja));
      assert.equal(fin[0], 0, "sin puntos parciales");
      assert.equal(fin[2][0].ok, false);
      assert.equal(fin[2][0].respuesta, mal);
      assert.deepEqual(fin[2][0].respuestas, { dia: correctaDe(item), segunda: mal });
    } finally { m.desmontar(); }
  });
}
