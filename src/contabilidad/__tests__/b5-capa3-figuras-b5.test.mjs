import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 3 · LAS FIGURAS QUE REACCIONAN Y NADA DOS VECES (§2b y §3 de Mai,
 * enganche B1-B5; B5 de Futaba).
 *   · T5 · A1, T5 · A2, T6 · A1 y T6 · A2 llevan una figura pequeña entre la
 *     consigna y las cajas, pegada arriba de la capa; se llena al cerrarse
 *     cada pregunta (acierto o segundo error, nunca con la pista), siempre
 *     con lo correcto; lo último que entró, resaltado;
 *   · la pregunta sale al decidir y sigue siendo el nombre del grupo: los
 *     nombres de Futaba para seis piezas; T6 · A3, una pregunta por caja;
 *   · quien falla dos veces no lee el texto que se revela;
 *   · T6 · A3: las cajas «Se crea», «Se usa», «Se corrige»; la fecha, solo
 *     en la T.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
let desplazado = [];
w.scrollBy = (o) => { desplazado.push(o.top); };
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { decidir } = await import("./b5-capa3.mjs");
const { FAE } = await import("../../theme.js");
const { asomarBajoLaFigura } = await import("../../components/mecanicas/libros/tema6/FiguraPegada.jsx");

const T5A1 = await import("../../data/contabilidadT5Pieza1.js");
const T5A2 = await import("../../data/contabilidadT5Pieza2.js");
const T6A1 = await import("../../data/contabilidadT6Pieza1.js");
const T6A2 = await import("../../data/contabilidadT6Pieza2.js");
const T6A3 = await import("../../data/contabilidadT6Pieza3.js");
const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const zonaDe = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const malasDe = (opciones, correcta) => opciones.filter((o) => o.id !== correcta).map((o) => o.id);
/* Lo que hay en la figura: [id de la entrada, texto, ¿última?]. */
const entradas = (caja) => [...caja.querySelectorAll("[data-figura-capa3] [data-entrada]")].map((e) => [e.dataset.entrada, e.textContent, e.dataset.ultima === "si"]);

const FIGURAS = [
  { nombre: "T5 · A1", figura: "t5-a1", Componente: await C("tema5/DosPaquetes"), consigna: T5A1.CONSIGNA_CAPA_3,
    cajas: T5A1.PAQUETES.map((p) => ({ id: p.id, correcta: p.correcta, opciones: T5A1.OPCIONES_CAPA_3 })) },
  { nombre: "T5 · A2", figura: "t5-a2", Componente: await C("tema5/DosVentas"), consigna: T5A2.CONSIGNA_CAPA_3_T5_A2,
    cajas: T5A2.VENTAS_T5_A2.map((v) => ({ id: v.id, correcta: v.correcta, opciones: T5A2.OPCIONES_CAPA_3_T5_A2 })) },
  { nombre: "T6 · A1", figura: "t6-a1", Componente: await C("tema6/SeisHechos"), consigna: T6A1.CONSIGNA_CAPA_3_T6,
    cajas: T6A1.HECHOS_T6.map((x) => ({ id: x.id, correcta: x.correcta, opciones: T6A1.OPCIONES_CAPA_3_T6 })) },
  { nombre: "T6 · A2", figura: "t6-a2", Componente: await C("tema6/DosMetodos"), consigna: T6A2.CONSIGNA_CAPA_3_T6_A2,
    cajas: T6A2.METODOS_T6_A2.map((m) => ({ id: m.id, correcta: m.correcta, opciones: T6A2.OPCIONES_CAPA_3_T6_A2 })) },
];

/* Lo que entra en la figura al cerrarse cada caja, con lo correcto (los textos de §2b). */
const ENTRA = {
  "T5 · A1": { a: [["a", "Paquete A"]], b: [["b", "Paquete B"]] },
  "T5 · A2": { "venta-a": [["venta-a", "Costó $650 cada unoVenta A"]], "venta-b": [["venta-b", "Costó $1.150 cada unoVenta B"]] },
  "T6 · A1": Object.fromEntries(T6A1.HECHOS_T6.map((x) => [x.id, [[x.id, x.corto]]])),
  "T6 · A2": {
    "anulacion-directa": [["anulacion-directa-cierre", "Nada"], ["anulacion-directa-castigo", "Gasto"]],
    provisiones: [["provisiones-cierre", "Gasto"], ["provisiones-castigo", "Provisión"]],
  },
};
const INICIAL = { "T5 · A2": [["venta-a-compra", "Costó $650 cada unoVenta A", false], ["venta-b-compra", "Costó $1.150 cada unoVenta B", false]] };

test("★★★ §2b: los textos nuevos de la figura, literales (para Shoko)", () => {
  assert.deepEqual(T5A1.FIGURA_CAPA_3, { temporal: "Temporal", noTemporal: "No temporal" });
  assert.deepEqual(T6A1.HECHOS_T6.map((x) => x.corto), ["Venta a crédito", "Pago", "Cheque devuelto", "Devolución", "Descuento", "Venta de contado"]);
  assert.equal(T6A1.FIGURA_CAPA_3_T6.sinMovimiento, "Sin movimiento:");
  assert.equal(T6A1.FIGURA_CAPA_3_T6.cuenta, "Cuentas por cobrar – clientes");
  assert.deepEqual(T6A2.FIGURA_CAPA_3_T6_A2.filas, { "anulacion-directa": { cierre: "Nada", castigo: "Gasto" }, provisiones: { cierre: "Gasto", castigo: "Provisión" } });
  assert.deepEqual(T6A2.FIGURA_CAPA_3_T6_A2.columnas.map((c) => c.texto), ["Al cerrar el periodo", "Al castigar"]);
  /* T5 · A2 (decisión del 15-oct): solo las cifras de las cajas que se responden, ninguna del ejemplo del libro, y el pie del escenario simulado. */
  const F = T5A2.FIGURA_CAPA_3_T5_A2;
  assert.equal(F.cuenta, "Inversiones – títulos");
  assert.deepEqual(F.ventas, T5A2.VENTAS_T5_A2.map((v) => ({ id: v.id, nombre: v.nombre, costo: v.cifras[0] })));
  assert.deepEqual(F.ventas.map((v) => v.costo), ["Costó $650 cada uno", "Costó $1.150 cada uno"]);
  assert.equal(F.pie, "Escenario simulado");
});

for (const p of FIGURAS) {
  test(`★★★ ${p.nombre} · §2b: la figura va entre la consigna y las cajas, pegable (fondo opaco); empieza sin entradas de las cajas`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    const figura = caja.querySelector("[data-figura-capa3]");
    assert.ok(figura.querySelector(`[data-figura="${p.figura}"]`));
    const consigna = [...caja.querySelectorAll("p")].find((x) => x.textContent === p.consigna);
    assert.ok(consigna.compareDocumentPosition(figura) & w.Node.DOCUMENT_POSITION_FOLLOWING, "después de la consigna");
    assert.ok(figura.compareDocumentPosition(zonaDe(caja, p.cajas[0].id)) & w.Node.DOCUMENT_POSITION_FOLLOWING, "antes de las cajas");
    assert.equal(figura.dataset.pegada, "no", "en su sitio mientras no sube del tope");
    assert.equal(figura.style.background, rgb(FAE.bg), "fondo opaco");
    assert.deepEqual(entradas(caja), INICIAL[p.nombre] ?? []);
    desmontar();
  });

  test(`★★★ ${p.nombre} · §2b: al primer error la figura espera; al segundo, entra lo CORRECTO y queda resaltado hasta la decisión siguiente`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    const esperadas = [...(INICIAL[p.nombre] ?? []).map(([id, t]) => [id, t])];
    for (const x of p.cajas) {
      const [mala1, mala2] = malasDe(x.opciones, x.correcta);
      const antes = entradas(caja);
      await decidir(tocar, zonaDe(caja, x.id), mala1);
      assert.deepEqual(entradas(caja), antes, `${x.id}: con la pista, nada entra`);
      await decidir(tocar, zonaDe(caja, x.id), mala2);
      esperadas.push(...ENTRA[p.nombre][x.id]);
      const ahora = entradas(caja);
      assert.deepEqual(ahora.map(([id, t]) => [id, t]).sort(), [...esperadas].sort(), `${x.id}: entra lo correcto, aunque falló dos veces`);
      const nuevas = ENTRA[p.nombre][x.id].map(([id]) => id);
      for (const [id, , ultima] of ahora) assert.equal(ultima, nuevas.includes(id), `${id}: solo lo último va resaltado`);
      const ultima = caja.querySelector(`[data-entrada="${nuevas[0]}"]`);
      assert.equal(ultima.style.border, `2px solid ${rgb(FAE.node)}`);
      assert.equal(ultima.style.background, rgb(FAE.navy));
      assert.equal(ultima.style.padding, "1px 4px", "1 px menos de relleno: nada se mueve");
      for (const e of caja.querySelectorAll("[data-entrada]")) assert.ok(Number.parseFloat(e.style.fontSize) >= 12, "letra mínima");
    }
    desmontar();
  });
}

test("★★★ T5 · A1 · §2b: cada paquete entra en su cajón (A en «Temporal», B en «No temporal»), aunque se falle", async () => {
  const p = FIGURAS[0];
  const { caja, desmontar } = await montar(h(p.Componente));
  for (const x of p.cajas) { const [m1, m2] = malasDe(x.opciones, x.correcta); await decidir(tocar, zonaDe(caja, x.id), m1); await decidir(tocar, zonaDe(caja, x.id), m2); }
  const cajon = (id) => caja.querySelector(`[data-cajon="${id}"]`);
  assert.equal(cajon("temporal").firstElementChild.textContent, "Temporal");
  assert.equal(cajon("no-temporal").firstElementChild.textContent, "No temporal");
  assert.deepEqual([...cajon("temporal").querySelectorAll("[data-entrada]")].map((e) => e.textContent), ["Paquete A"]);
  assert.deepEqual([...cajon("no-temporal").querySelectorAll("[data-entrada]")].map((e) => e.textContent), ["Paquete B"]);
  desmontar();
});

test("★★★ T5 · A2 · §2b: cada compra en el DEBE por lo que costó; al cerrarse su caja, la venta la saca por el mismo costo en el HABER; sin cifras del ejemplo del libro y con el pie «Escenario simulado»", async () => {
  const p = FIGURAS[1];
  const { caja, desmontar } = await montar(h(p.Componente));
  const figura = caja.querySelector('[data-figura="t5-a2"]');
  const col = (lado) => [...figura.querySelectorAll(`[data-columna="${lado}"] [data-entrada]`)].map((e) => e.textContent);
  assert.equal(figura.firstElementChild.textContent, "Inversiones – títulos");
  assert.deepEqual(col("debe"), ["Costó $650 cada unoVenta A", "Costó $1.150 cada unoVenta B"]);
  assert.deepEqual(col("haber"), []);
  assert.equal(figura.querySelector("[data-pie]").textContent, "Escenario simulado");
  assert.ok(!/2\.000\.000|1\.500\.000|500\.000|agosto|noviembre|mayo/.test(figura.textContent), "nada del ejemplo del libro");
  await decidir(tocar, zonaDe(caja, "venta-b"), "perdida");
  assert.deepEqual(col("haber"), ["Costó $1.150 cada unoVenta B"], "sale por lo que costó");
  await decidir(tocar, zonaDe(caja, "venta-a"), "ganancia");
  assert.deepEqual(col("haber"), ["Costó $1.150 cada unoVenta B", "Costó $650 cada unoVenta A"]);
  assert.deepEqual(col("debe"), ["Costó $650 cada unoVenta A", "Costó $1.150 cada unoVenta B"], "el DEBE no cambia");
  desmontar();
});

test("★★★ T6 · A1 · §2b: sube al DEBE, baja al HABER y «No cambia» debajo, tras «Sin movimiento:»", async () => {
  const p = FIGURAS[2];
  const { caja, desmontar } = await montar(h(p.Componente));
  for (const x of p.cajas) await decidir(tocar, zonaDe(caja, x.id), x.correcta);
  const figura = caja.querySelector('[data-figura="t6-a1"]');
  assert.equal(figura.firstElementChild.textContent, "Cuentas por cobrar – clientes");
  const col = (lado) => [...figura.querySelectorAll(`[data-columna="${lado}"] [data-entrada]`)].map((e) => e.textContent);
  assert.deepEqual(col("debe"), ["Venta a crédito", "Cheque devuelto"]);
  assert.deepEqual(col("haber"), ["Pago", "Devolución", "Descuento"]);
  assert.deepEqual([...figura.querySelectorAll("[data-columna] > p:first-child")].map((x) => x.textContent), ["DEBE", "HABER"]);
  assert.equal(figura.querySelector("[data-sin-movimiento]").textContent, "Sin movimiento:Venta de contado");
  desmontar();
});

test("★★★ T6 · A2 · §2b: la rejilla «Anulación directa» y «Provisiones» × «Al cerrar el periodo» y «Al castigar»", async () => {
  const p = FIGURAS[3];
  const { caja, desmontar } = await montar(h(p.Componente));
  const t = caja.querySelector('[data-figura="t6-a2"] table');
  assert.deepEqual([...t.querySelectorAll('th[scope="col"]')].map((x) => x.textContent), ["Al cerrar el periodo", "Al castigar"]);
  assert.deepEqual([...t.querySelectorAll('th[scope="row"]')].map((x) => x.textContent), ["Anulación directa", "Provisiones"]);
  const fila = (id) => [...t.querySelectorAll(`[data-fila="${id}"] td`)].map((x) => x.textContent);
  assert.deepEqual([fila("anulacion-directa"), fila("provisiones")], [["", ""], ["", ""]]);
  await decidir(tocar, zonaDe(caja, "provisiones"), "cierre");
  assert.deepEqual([fila("anulacion-directa"), fila("provisiones")], [["", ""], ["Gasto", "Provisión"]]);
  await decidir(tocar, zonaDe(caja, "anulacion-directa"), "dia-castigo");
  assert.deepEqual([fila("anulacion-directa"), fila("provisiones")], [["Nada", "Gasto"], ["Gasto", "Provisión"]]);
  desmontar();
});

/* ═══════════ §3 · NADA DOS VECES ═══════════ */

const NOMBRES = [
  ["T5 · A1", "tema5/DosPaquetes", "¿Puede ser temporal?"],
  ["T5 · A2", "tema5/DosVentas", "¿Dejó ganancia o pérdida?"],
  ["T6 · A1", "tema6/SeisHechos", "¿Qué pasa con lo que deben los clientes?"],
  ["T6 · A2", "tema6/DosMetodos", "¿Cuándo aparece el gasto?"],
  ["T6 · A4", "tema6/TresCasos", "¿Cuánto se revive?"],
  ["T6 · A5", "tema6/CuatroGrupos", "¿Qué porcentaje le toca?"],
];
for (const [nombre, ruta, pregunta] of NOMBRES) {
  test(`★★★ ${nombre} · §3: la pregunta «${pregunta}» se ve mientras falta decidir; al decidir sale, y sigue siendo el nombre del grupo de opciones`, async () => {
    const { caja, desmontar } = await montar(h(await C(ruta)));
    const zona = caja.querySelector("[data-hecho]");
    await tocar(zona.querySelector("button[aria-expanded]"));
    const grupo = () => zona.querySelector("[role='group']");
    const nombreDe = () => document.getElementById(grupo().getAttribute("aria-labelledby"));
    assert.equal(nombreDe().textContent, pregunta);
    assert.ok(nombreDe().hasAttribute("data-pregunta"), "a la vista");
    const correcta = [...zona.querySelectorAll("[data-opcion]")].length;
    assert.ok(correcta >= 2);
    /* Decide con la primera opción hasta cerrarse (acierto o segundo error). */
    for (let k = 0; k < 2 && zona.dataset.decidida === "no"; k++) {
      const libre = [...zona.querySelectorAll("[data-opcion]")].find((b) => !b.hasAttribute("aria-disabled"));
      await tocar(libre);
    }
    assert.equal(zona.dataset.decidida, "si");
    assert.equal(zona.querySelector("[data-pregunta]"), null, "la pregunta sale de la pantalla");
    assert.equal(nombreDe().textContent, pregunta, "el grupo conserva su nombre");
    assert.ok(nombreDe().hasAttribute("data-pregunta-oculta"), "en la copia oculta");
    assert.deepEqual([nombreDe().style.position, nombreDe().style.width, nombreDe().style.overflow], ["absolute", "1px", "hidden"], "oculta a la vista, no al lector");
    assert.equal(zona.querySelectorAll("[data-opcion]").length, 1, "queda solo la opción elegida");
    assert.ok(zona.querySelector("[data-opcion] svg[data-icono]"), "con su marca ✓ o ✕");
    desmontar();
  });
}

test("★★★ T6 · A3 · B5: las cajas se llaman «Se crea», «Se usa» y «Se corrige»; la fecha, solo en las filas de la T; cada caja conserva su propia pregunta", async () => {
  const { caja, desmontar } = await montar(h(await C("tema6/CuentaT")));
  assert.deepEqual(T6A3.MOMENTOS_T6_A3.map((m) => m.caja), ["Se crea", "Se usa", "Se corrige"]);
  for (const m of T6A3.MOMENTOS_T6_A3) {
    const zona = zonaDe(caja, m.id);
    assert.equal(zona.querySelector("button[aria-expanded] > span").textContent, m.caja);
    assert.ok(!zona.textContent.includes(m.nombre), "sin la fecha en la caja");
    await tocar(zona.querySelector("button[aria-expanded]"));
    assert.equal(zona.querySelector("[data-pregunta]").textContent, m.pregunta, "su propia pregunta, a la vista");
    await tocar(zona.querySelector(`[data-opcion="${m.correcta}"]`));
    assert.equal(zona.querySelector("[data-pregunta]"), null);
    assert.equal(zona.querySelector("[data-pregunta-oculta]").textContent, m.pregunta);
    assert.ok(caja.querySelector("[data-cuenta-t]").textContent.includes(m.nombre), "la fecha, en la T");
  }
  desmontar();
});

test("★★★ B5 de Futaba: quien falla dos veces lee la devolución de su opción y ve la figura, pero NO el texto que se revela; quien acierta, sí", async () => {
  const p = FIGURAS[2];
  const { caja, desmontar } = await montar(h(p.Componente));
  const [x, y] = T6A1.HECHOS_T6;
  const [m1, m2] = malasDe(T6A1.OPCIONES_CAPA_3_T6, x.correcta);
  await decidir(tocar, zonaDe(caja, x.id), m1);
  await decidir(tocar, zonaDe(caja, x.id), m2);
  const zx = zonaDe(caja, x.id);
  assert.equal(zx.querySelector("[data-devolucion]").textContent, typeof x.falla === "string" ? x.falla : x.falla[m2]);
  assert.ok(!zx.textContent.includes(x.revela), "sin el texto que se revela");
  assert.equal(zx.querySelector("[data-pie]").textContent, x.pie, "la fuente se queda");
  assert.ok(caja.querySelector(`[data-figura-capa3] [data-entrada="${x.id}"]`), "y la figura con lo correcto");
  await decidir(tocar, zonaDe(caja, y.id), y.correcta);
  assert.ok(zonaDe(caja, y.id).textContent.includes(y.revela), "quien acierta lee el texto");
  assert.equal(zonaDe(caja, y.id).querySelector("[data-devolucion]"), null);
  desmontar();
});

test("★★★ T6 · A1 · la devolución de la venta a crédito al segundo error: el texto aprobado", async () => {
  const x = T6A1.HECHOS_T6.find((c) => c.id === "venta-credito");
  assert.equal(x.falla, "Aunque diga “crédito”, el cliente queda debiendo el arreglo: sube.");
  const { caja, desmontar } = await montar(h(FIGURAS[2].Componente));
  const [m1, m2] = malasDe(T6A1.OPCIONES_CAPA_3_T6, x.correcta);
  await decidir(tocar, zonaDe(caja, x.id), m1);
  await decidir(tocar, zonaDe(caja, x.id), m2);
  assert.equal(zonaDe(caja, x.id).querySelector("[data-devolucion]").textContent, x.falla);
  desmontar();
});

/* ═══════════ EL DESPLAZAMIENTO AL DECIDIR (§2b) ═══════════ */

const rect = (top, bottom) => ({ getBoundingClientRect: () => ({ top, bottom, height: bottom - top }) });
test("★★ §2b: al decidir, se baja lo justo para ver la devolución entera; si eso tapara la opción con la figura pegada, manda la opción", () => {
  Object.defineProperty(w, "innerHeight", { value: 568, configurable: true });
  document.documentElement.style.setProperty("--act-tope", "56px");
  try {
    /* Figura de 169 bajo una cabecera de 56: la opción tiene que quedar por debajo de 56 + 169 + 8 = 233. */
    desplazado = [];
    asomarBajoLaFigura(rect(0, 169), rect(300, 344), rect(344, 600), true);
    assert.deepEqual(desplazado, [600 - (568 - 8)], "baja lo que falta para ver la devolución (40)");
    desplazado = [];
    asomarBajoLaFigura(rect(0, 169), rect(260, 304), rect(304, 700), true);
    assert.deepEqual(desplazado, [260 - 233], "no cabe todo: la opción queda justo bajo la figura");
    desplazado = [];
    asomarBajoLaFigura(rect(0, 169), rect(300, 344), rect(344, 500), true);
    assert.deepEqual(desplazado, [], "ya se ve todo: no se mueve");
  } finally {
    document.documentElement.style.removeProperty("--act-tope");
  }
});
