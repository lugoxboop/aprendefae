import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";


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

const { default: QueSeDebita } = await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const D = await import("../../data/contabilidadT6Act4.js");
const { FAE } = await import("../../theme.js");

const IDS = ["qd-01", "qd-02", "qd-03", "qd-04", "qd-05", "qd-06", "qd-07", "qd-08", "qd-09", "qd-10"];
const hecho = (id) => D.HECHOS_T6_ACT4.find((x) => x.id === id);

const montar = async (items, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => {
    raiz.render(h(QueSeDebita, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, items, ...props }));
  });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"]`).closest("button");
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

/*
 * EL ASIENTO MÍNIMO DE b5-t6-a4 (hoja 4 de Mai, calidad): DEBE y HABER bajo
 * el hecho; la correcta entra al DEBE y el HABER se llena con lo que se
 * acredita; una incorrecta que se acredita en el hecho se pasa al HABER; una
 * que no está en el asiento se va.
 */
const A = await import("../../components/mecanicas/libros/tema6/AsientoMinimo.jsx");
const espera = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
const ranura = (caja, lado) => caja.querySelector(`[data-ranura="${lado}"]`);
const visible = (caja, lado) => {
  const c = ranura(caja, lado).querySelector("[data-cuenta]");
  return c ? [c.dataset.cuenta, c.dataset.propia] : null;
};

test("★★★ antes de elegir: la ranura del DEBE encendida y las dos vacías; las dos reservan el alto del nombre más largo", async () => {
  const { caja, desmontar } = await montar([hecho("qd-02")]);
  const asiento = caja.querySelector("[data-asiento-minimo]");
  assert.ok(asiento.compareDocumentPosition(caja.querySelector('[data-opcion]')) & 4, "entre el hecho y las opciones");
  assert.ok(ranura(caja, "debe").hasAttribute("data-encendida"));
  assert.ok(!ranura(caja, "haber").hasAttribute("data-encendida"));
  assert.deepEqual([visible(caja, "debe"), visible(caja, "haber")], [null, null]);
  for (const lado of ["debe", "haber"]) {
    const reservas = [...ranura(caja, lado).querySelectorAll('[aria-hidden="true"]')].map((p) => p.textContent);
    assert.ok(reservas.includes(D.OPCIONES_T6_ACT4.find((o) => o.id === D.A_GASTO).nombre), `${lado}: reserva el gasto`);
    assert.ok(reservas.includes("Ingresos por ventas") && reservas.includes("Bancos"), `${lado}: y las contrapartidas`);
  }
  desmontar();
});

test("★★★ la correcta: entra al DEBE (texto principal) y el HABER se llena con lo que se acredita (secundario)", async () => {
  const { caja, desmontar } = await montar([hecho("qd-02")]);
  await tocar(opcion(caja, D.A_CAJA));
  assert.deepEqual(visible(caja, "debe"), ["Caja", "si"]);
  assert.deepEqual(visible(caja, "haber"), ["Cuentas por cobrar – clientes", "no"]);
  assert.equal(caja.querySelector("[data-asiento-minimo] [data-anuncio]").textContent, "Debe: Caja. Haber: Cuentas por cobrar – clientes.");
  desmontar();
});

test("★★★ una incorrecta que en el hecho se acredita: entra al DEBE y a los 500 ms se pasa al HABER; la correcta entra al DEBE", async () => {
  const { caja, desmontar } = await montar([hecho("qd-02")]);
  await tocar(opcion(caja, D.A_CLIENTES));
  assert.deepEqual(visible(caja, "debe"), ["Cuentas por cobrar – clientes", "si"], "primero, en el DEBE");
  assert.equal(visible(caja, "haber"), null);
  await espera(560);
  assert.deepEqual(visible(caja, "haber"), ["Cuentas por cobrar – clientes", "si"], "se pasó al HABER, en texto principal");
  assert.deepEqual(visible(caja, "debe"), ["Caja", "no"], "la correcta, en el DEBE, en secundario");
  desmontar();
});

test("★★★ una incorrecta que no está en el asiento: entra al DEBE y se va; quedan la correcta y la contrapartida", async () => {
  const { caja, desmontar } = await montar([hecho("qd-02")]);
  await tocar(opcion(caja, D.A_GASTO));
  assert.deepEqual(visible(caja, "debe"), [D.OPCIONES_T6_ACT4.find((o) => o.id === D.A_GASTO).nombre, "si"]);
  assert.match(ranura(caja, "debe").querySelector("[data-cuenta]").style.animation, /b5-se-va/);
  await espera(560);
  assert.deepEqual(visible(caja, "debe"), ["Caja", "no"]);
  assert.deepEqual(visible(caja, "haber"), ["Cuentas por cobrar – clientes", "no"]);
  desmontar();
});

test("★★ en cada hecho, solo la cuenta que se acredita se pasa al HABER (E3 al ajustar y E4 al revivir: la provisión)", () => {
  for (const h of D.HECHOS_T6_ACT4) {
    for (const o of D.OPCIONES_T6_ACT4) {
      const a = A.asientoDe(h, o.id, "final");
      const esperado = o.id === h.respuesta ? "correcta" : o.nombre === D.SE_ACREDITA_T6_ACT4[h.id] ? "al-haber" : "fuera";
      assert.equal(a.caso, esperado, `${h.id} · ${o.id}`);
      assert.equal(a.debe.nombre, D.OPCIONES_T6_ACT4.find((x) => x.id === h.respuesta).nombre, `${h.id}: en el DEBE, siempre la correcta`);
    }
  }
  assert.equal(A.asientoDe(hecho("qd-08"), D.A_PROVISION, "final").caso, "al-haber");
  assert.equal(A.asientoDe(hecho("qd-09"), D.A_PROVISION, "final").caso, "al-haber");
  /* Ninguna contrapartida es la cuenta que se debita. */
  for (const h of [...D.HECHOS_T6_ACT4, D.EJEMPLO_T6_ACT4]) assert.notEqual(D.SE_ACREDITA_T6_ACT4[h.id], D.OPCIONES_T6_ACT4.find((x) => x.id === h.respuesta).nombre, h.id);
});
