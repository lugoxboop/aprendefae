import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";
import { SUBJECTS, HACER } from "../../data/subjects.js";
import { OBJETIVOS_NEAR } from "./objetivosNear.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE O (Mello) · el `objetivo` de cada Hacer de T5 y T7.
 *
 *   · cada Hacer publicado de T5 y T7 lleva en sus datos un `objetivo` de una
 *     sola oración. Las de la Célula C son las de Near
 *     (paquetes/lote-o-objetivos.md, leído por objetivosNear.mjs), letra por
 *     letra; `b5-t5-a2` (Célula B) y `t7-1-que-control-falta` conservan el
 *     suyo.
 *   · el encabezado de cada Hacer de la Célula C (hacerT7.jsx →
 *     EncabezadoHacer, y la escalera de H7) pinta el objetivo con el mismo
 *     marcado que H7 (`[data-encabezado] > p[data-objetivo]`, antes de la
 *     consigna) cuando existe; sin objetivo, nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = "../../data/";
const datosDe = {
  "b5-t5-a1": [`${D}contabilidadT5Act1.js`, "T5_ACT1"],
  "t5-temporal-o-largo-plazo": [`${D}contabilidadT5_n1.js`, "N1"],
  "t5-revision-que-falta": [`${D}contabilidadT5_n3.js`, "N3"],
  "t5-el-interes-del-periodo": [`${D}contabilidadT5_n4.js`, "N4"],
  "t5-gano-o-perdio": [`${D}contabilidadT5_n5.js`, "N5"],
  "t5-a-que-cuenta-va": [`${D}contabilidadT5_n7.js`, "N7"],
  "b5-t5-a2": [`${D}contabilidadT5Act2.js`, "T5_ACT2"],
  "t7-1-que-cuenta-se-mueve": [`${D}contabilidadT7_1_h1.js`, "H1"],
  "t7-1-arma-la-factura": [`${D}contabilidadT7_1_h2.js`, "H2"],
  "t7-1-cuanto-vale-lo-que-sobro": [`${D}contabilidadT7_1_h3.js`, "H3"],
  "t7-1-cierra-el-mes": [`${D}contabilidadT7_1_h4.js`, "H4"],
  "t7-1-costo-o-gasto": [`${D}contabilidadT7_1_h5.js`, "H5"],
  "t7-1-devolucion-dos-libros": [`${D}contabilidadT7_1_h6.js`, "H6"],
  "t7-1-que-control-falta": [`${D}contabilidadT7_1_h7.js`, "H7"],
  "t7-2-dos-asientos": [`${D}contabilidadT7_2_h2.js`, "H2"],
  "t7-2-llena-el-kardex": [`${D}contabilidadT7_2_h3.js`, "H3"],
  "t7-2-flete-y-devolucion": [`${D}contabilidadT7_2_h5.js`, "H5"],
  "t7-3-descuento-en-factura": [`${D}contabilidadT7_3_h1.js`, "H1"],
  "t7-3-cadena-de-descuentos": [`${D}contabilidadT7_3_h2.js`, "H2"],
  "t7-3-pago-a-tiempo": [`${D}contabilidadT7_3_h4.js`, "H4"],
  "t7-3-ajuste-por-conteo": [`${D}contabilidadT7_3_h5.js`, "H5"],
  "t7-3-costo-o-vnr": [`${D}contabilidadT7_3_h7.js`, "H7"],
};

/* Los Hacer publicados de T5 y T7, del catálogo. */
const TEMAS = ["activos-financieros", "inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2"];
const publicados = Object.values(SUBJECTS).flatMap((s) => s.topics ?? [])
  .filter((t) => TEMAS.includes(t.id))
  .flatMap((t) => (t.actividades ?? []).filter((a) => a.clasificacion?.tipo === HACER).map((a) => a.id));

const datos = {};
for (const [id, [ruta, nombre]] of Object.entries(datosDe)) datos[id] = (await import(ruta))[nombre];
/*
 * Los objetivos tal como vienen en los datos, copiados ANTES de que la parte
 * montada ponga el de prueba en N3 (con Node 24 las pruebas de datos pueden
 * correr mientras ese cambio está puesto).
 */
const objetivoDe = Object.fromEntries(Object.entries(datos).map(([id, d]) => [id, d.objetivo]));

/* Una sola oración: termina en punto y no tiene otro fin de oración dentro (un . ! ? seguido de espacio y mayúscula). */
function unaOracion(x) {
  if (typeof x !== "string") return false;
  const t = x.trim();
  if (t !== x || !t.endsWith(".") || t.endsWith("..")) return false;
  return !/[.!?…]\s+[¿¡«"]?[A-ZÁÉÍÓÚÑ]/.test(t.slice(0, -1));
}

test("★★★ los Hacer publicados de T5 y T7 son 22 y cada uno tiene sus datos", () => {
  assert.equal(publicados.length, 22, publicados.join(", "));
  assert.deepEqual([...publicados].sort(), Object.keys(datosDe).sort());
  for (const id of publicados) assert.equal(datos[id].id, id, `los datos de ${id}`);
});

test("★★ unaOracion: una sola oración terminada en punto", () => {
  assert.ok(unaOracion("Relacionar cada riesgo de la bodega con el control que el libro propone."));
  assert.ok(unaOracion("Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas."));
  assert.ok(!unaOracion("Sin punto final"));
  assert.ok(!unaOracion("Una oración. Otra oración."));
  assert.ok(!unaOracion("¿Una pregunta? Otra cosa."));
  assert.ok(!unaOracion(undefined));
  assert.ok(!unaOracion(""));
});

test("★★★ cada Hacer de T5 y T7 tiene `objetivo` de una sola oración", () => {
  const faltan = publicados.filter((id) => !unaOracion(objetivoDe[id]));
  assert.deepEqual(faltan, [], `faltan ${faltan.length} de ${publicados.length}: ${faltan.join(", ")}`);
});

/* Los de la tabla de Near que no son de la Célula C: b5-t5-a2 conserva el suyo (hoy coincide). */
const AJENOS = ["b5-t5-a2"];

test("★★★ los 19 Hacer de la Célula C de la tabla de Near llevan su objetivo letra por letra", () => {
  const deC = Object.keys(OBJETIVOS_NEAR).filter((id) => !AJENOS.includes(id));
  assert.equal(deC.length, 19);
  for (const id of deC) {
    assert.ok(publicados.includes(id), `${id}: está publicado`);
    assert.equal(objetivoDe[id], OBJETIVOS_NEAR[id], `${id}: el objetivo de Near`);
  }
  /* Los publicados fuera de la tabla son los que ya tenían el suyo. */
  assert.deepEqual(publicados.filter((id) => !(id in OBJETIVOS_NEAR)).sort(), ["b5-t5-a1", "t7-1-que-control-falta"]);
});

test("★ b5-t5-a2 (Célula B) conserva su objetivo; hoy es el mismo de la tabla de Near", () => {
  assert.equal(objetivoDe["b5-t5-a2"], "Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas.");
  assert.equal(objetivoDe["b5-t5-a2"], OBJETIVOS_NEAR["b5-t5-a2"]);
});

/* ═══════════ EL ENCABEZADO, MONTADO ═══════════ */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
w.cancelAnimationFrame = (n) => clearTimeout(n);
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

const PRUEBA = "Oración de prueba para el encabezado.";
const L = "../../components/mecanicas/libros/";

/*
 * La escalera (RevisionQueFalta) arma sus datos al cargar el módulo: el
 * objetivo de prueba de N3 se pone ANTES de importarla. H7 de T7-1 ya trae el
 * suyo.
 */
const N3_ANTES = datos["t5-revision-que-falta"].objetivo;
datos["t5-revision-que-falta"].objetivo = PRUEBA;
const RevisionQueFalta = (await import(`${L}t5/RevisionQueFalta.jsx`)).default;
if (N3_ANTES === undefined) delete datos["t5-revision-que-falta"].objetivo; else datos["t5-revision-que-falta"].objetivo = N3_ANTES;

/* Los Hacer de la Célula C que leen el objetivo de sus datos al pintar: [id, componente]. */
const celulaC = [
  ["t5-temporal-o-largo-plazo", "t5/TemporalOLargoPlazo.jsx"],
  ["t5-el-interes-del-periodo", "t5/ElInteresDelPeriodo.jsx"],
  ["t5-gano-o-perdio", "t5/GanoOPerdio.jsx"],
  ["t5-a-que-cuenta-va", "t5/AQueCuentaVa.jsx"],
  ["t7-1-que-cuenta-se-mueve", "t7/QueCuentaSeMueve.jsx"],
  ["t7-1-arma-la-factura", "t7/ArmaLaFactura.jsx"],
  ["t7-1-cuanto-vale-lo-que-sobro", "t7/CuantoValeLoQueSobro.jsx"],
  ["t7-1-cierra-el-mes", "t7/CierraElMes.jsx"],
  ["t7-1-costo-o-gasto", "t7/CostoOGasto.jsx"],
  ["t7-1-devolucion-dos-libros", "t7/DevolucionDosLibros.jsx"],
  ["t7-2-dos-asientos", "t7/ArmaLosDosAsientos.jsx"],
  ["t7-2-llena-el-kardex", "t7/LlenaElKardex.jsx"],
  ["t7-2-flete-y-devolucion", "t7/FleteYDevolucion.jsx"],
  ["t7-3-descuento-en-factura", "t7/DescuentoEnFactura.jsx"],
  ["t7-3-cadena-de-descuentos", "t7/CadenaDeDescuentos.jsx"],
  ["t7-3-pago-a-tiempo", "t7/PagoATiempo.jsx"],
  ["t7-3-ajuste-por-conteo", "t7/AjustePorConteo.jsx"],
  ["t7-3-costo-o-vnr", "t7/CostoOValorNeto.jsx"],
];
const componentes = {};
for (const [id, ruta] of celulaC) componentes[id] = (await import(`${L}${ruta}`)).default;
componentes["t5-revision-que-falta"] = RevisionQueFalta;
componentes["t7-1-que-control-falta"] = (await import(`${L}t7/QueControlFalta.jsx`)).default;

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
async function encabezadoDe(Componente) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Componente, { Marco, onCompletar: () => {}, onComoSeJuega: () => {} })); });
  const enc = caja.querySelectorAll("[data-encabezado]");
  const r = {
    cuantos: enc.length,
    objetivos: [...caja.querySelectorAll("[data-objetivo]")].map((p) => ({
      texto: p.textContent, padre: p.parentElement === enc[0], primero: enc[0]?.firstElementChild === p,
      consignaDespues: p.nextElementSibling?.hasAttribute("data-consigna") ?? false,
    })),
  };
  act(() => raiz.unmount());
  caja.remove();
  return r;
}

test("★★★ con `objetivo`, cada Hacer de la Célula C lo pinta arriba de la consigna, en su encabezado; sin él, nada", async () => {
  assert.equal(Object.keys(componentes).length, 20);
  for (const [id, Componente] of Object.entries(componentes)) {
    const dato = datos[id];
    const antes = dato.objetivo;
    const fija = id === "t5-revision-que-falta" || id === "t7-1-que-control-falta";
    const esperado = id === "t7-1-que-control-falta" ? antes : PRUEBA;
    try {
      if (!fija) dato.objetivo = PRUEBA;
      const con = await encabezadoDe(Componente);
      assert.equal(con.cuantos, 1, `${id}: un encabezado`);
      assert.deepEqual(con.objetivos, [{ texto: esperado, padre: true, primero: true, consignaDespues: true }], `${id}: con objetivo`);
      if (fija) continue;
      delete dato.objetivo;
      const sin = await encabezadoDe(Componente);
      assert.equal(sin.cuantos, 1, `${id}: un encabezado`);
      assert.deepEqual(sin.objetivos, [], `${id}: sin objetivo no sale nada`);
      dato.objetivo = "";
      assert.deepEqual((await encabezadoDe(Componente)).objetivos, [], `${id}: objetivo vacío no sale nada`);
    } finally {
      if (antes === undefined) delete dato.objetivo; else dato.objetivo = antes;
    }
  }
});

test("★★ EncabezadoHacer: el mismo marcado que H7 (Encabezado), sin texto propio", async () => {
  const { EncabezadoHacer } = await import(`${L}t7/hacerT7.jsx`);
  const { Encabezado } = await import(`${L}tema1/encabezado.jsx`);
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = (C, p) => renderToStaticMarkup(h(C, p));
  assert.equal(html(EncabezadoHacer, { objetivo: PRUEBA, consigna: "Consigna." }), html(Encabezado, { objetivo: PRUEBA, consigna: "Consigna." }));
  assert.equal(html(EncabezadoHacer, { consigna: "Consigna." }), html(Encabezado, { consigna: "Consigna." }));
  assert.equal(html(EncabezadoHacer, { objetivo: undefined, consigna: "Consigna." }), html(Encabezado, { consigna: "Consigna." }));
  assert.ok(!html(EncabezadoHacer, { consigna: "Consigna." }).includes("data-objetivo"));
});
