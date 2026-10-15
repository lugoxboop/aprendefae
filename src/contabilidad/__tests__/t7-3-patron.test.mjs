import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · EL «PATRÓN T7-3» DE WATARI (Célula C).
 *
 *   · los renglones: signo, nombre y cifra; el signo en palabras para el
 *     lector de pantalla; raya y negrita solo en el resultado; «12 %» sin
 *     partir; la cifra larga que baja a su línea
 *   · la franja de plazos: una marca por condición, el pago solo cuando se
 *     da, y la lista para el lector de pantalla
 *   · la franja de la NIC 2: nota fija, pegada arriba (sticky)
 *   · el CSS es el de Watari: sus medidas y la consulta del proyector
 *   · A1: la cuenta de la factura de San Calixto, con las cifras del libro,
 *     va con el texto que ya las da, antes de la pregunta
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

const { Renglones, Plazos, FranjaNIC2, CSS_T73_PATRON, sinPartir } = await import("../../components/mecanicas/libros/t7/PatronT7_3.jsx");
const { default: PantallasT7_3 } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const A1 = await import("../../data/contabilidadT7_3.js");

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
const filasDe = (fig) => [...fig.querySelectorAll("[data-renglon]")].map((r) => ({
  op: r.querySelector(".rg-op").textContent,
  oye: r.querySelector(".rg-rot").textContent,
  v: r.querySelector(".rg-v").textContent,
  res: r.classList.contains("rg-res"),
  fuerte: r.classList.contains("rg-fuerte"),
}));

test("★★★ renglones: signo, nombre y cifra; el signo en palabras; raya solo en el resultado", async () => {
  const m = await montar(h(Renglones, {
    titulo: "Cadena", nota: "La suma da 19 %.",
    filas: [
      { rot: "Precio de lista", v: 2_750_000 },
      { op: "−", rot: "Descuento 10 %", v: 275_000 },
      { op: "×", rot: "Factor", v: "0,8208", apila: true },
      { op: "=", rot: "Saldo", v: 2_475_000, res: true },
      { rot: "Parte del precio", v: "17,92 %", fuerte: true, marca: "el menor" },
    ],
  }));
  try {
    const fig = m.caja.querySelector("figure[data-renglones]");
    assert.equal(fig.getAttribute("role"), "table");
    assert.equal(fig.getAttribute("aria-label"), "Cadena");
    assert.equal(fig.querySelector("figcaption").textContent, "Cadena");
    assert.ok(fig.parentElement.classList.contains("t73pt"), "cada figura en su caja .t73pt");
    assert.deepEqual(filasDe(fig), [
      { op: "", oye: "Precio de lista", v: "2.750.000", res: false, fuerte: false },
      { op: "−", oye: "menos Descuento 10\u00a0%", v: "275.000", res: false, fuerte: false },
      { op: "×", oye: "por Factor", v: "0,8208", res: false, fuerte: false },
      { op: "=", oye: "igual a Saldo", v: "2.475.000", res: true, fuerte: false },
      { op: "", oye: "Parte del precio el menor", v: "17,92\u00a0%", res: false, fuerte: true },
    ]);
    /* El signo visible no se lee: lo dice la palabra. */
    for (const op of fig.querySelectorAll(".rg-op")) assert.equal(op.getAttribute("aria-hidden"), "true");
    assert.ok(fig.querySelectorAll("[data-renglon]")[2].classList.contains("rg-apila"));
    assert.equal(fig.querySelector(".rg-nota").textContent, "La suma da 19\u00a0%.");
    assert.equal(fig.classList.contains("rg-nuevo"), false);
  } finally {
    m.desmontar();
  }
  assert.equal(sinPartir("4 % y 12 %"), "4\u00a0% y 12\u00a0%");
});

test("★★★ la franja de plazos: una marca por condición y el pago solo cuando se da", async () => {
  const condiciones = [{ cond: "8 %" }, { cond: "10/10", dia: 10, lleva: "10 %" }, { cond: "4/20", dia: 20, lleva: "4 %" }, { cond: "n/30", dia: 30, lleva: "sin descuento" }];
  const sin = await montar(h(Plazos, { venta: "3 oct", condiciones }));
  try {
    const f = sin.caja.querySelector("[data-plazos]");
    assert.equal(f.querySelector("figcaption").textContent, "Condiciones 8\u00a0%, 10/10, 4/20, n/30");
    assert.equal(f.querySelectorAll(".pz-tick").length, 4);
    assert.equal(f.querySelectorAll("[data-pago], .pz-mark").length, 0);
    assert.deepEqual([...f.querySelectorAll(".pz-et b")].map((b) => b.textContent), ["Venta", "10 días", "20 días", "30 días:"]);
    assert.deepEqual([...f.querySelectorAll("ul.sr li")].map((x) => x.textContent), ["Venta: 3 oct", "A los 10 días: 10\u00a0%", "A los 20 días: 4\u00a0%", "A los 30 días: sin descuento"]);
    assert.equal(f.querySelector(".pz-fin").style.left, "100%");
  } finally {
    sin.desmontar();
  }
  const con = await montar(h(Plazos, { venta: "3 oct", condiciones, pago: { dia: 20, fecha: "23 oct" }, nuevo: true }));
  try {
    const f = con.caja.querySelector("[data-plazos]");
    assert.equal(f.querySelector("[data-pago]").textContent, "Pago · 23 oct");
    assert.equal(f.querySelector(".pz-mark").style.left, `${(20 / 30) * 100}%`);
    assert.ok(f.querySelector(".pz-mark").classList.contains("rg-nuevo"));
    assert.equal([...f.querySelectorAll("ul.sr li")].at(-1).textContent, "Pago: 23 oct, a los 20 días");
  } finally {
    con.desmontar();
  }
});

test("★★★ la franja de la NIC 2: una nota, pegada arriba, con el CSS de Watari", async () => {
  const m = await montar(h(FranjaNIC2, { texto: "Frase." }));
  try {
    const p = m.caja.querySelector("[data-aviso]");
    assert.equal(p.getAttribute("role"), "note");
    assert.equal(p.textContent, "Frase.");
  } finally {
    m.desmontar();
  }
  const regla = CSS_T73_PATRON.match(/\.t73pt-nic2 \{([^}]*)\}/)[1];
  assert.match(regla, /position: sticky; top: var\(--act-tope, 0px\)/);
  assert.match(regla, /border-left: 3px solid/);
  /* Las medidas de Watari: columna del signo 14 px y 6 de espacio en el teléfono; 22 y 10 en el proyector, con 560 px de caja. */
  assert.match(CSS_T73_PATRON, /\.t73pt \.rg-f \{ display: grid; grid-template-columns: 14px minmax\(0, 1fr\) auto; column-gap: 6px;/);
  assert.match(CSS_T73_PATRON, /@container t73pt \(min-width: 560px\) \{[\s\S]*grid-template-columns: 22px minmax\(0, 1fr\) auto; column-gap: 10px;/);
  assert.match(CSS_T73_PATRON, /\.t73pt \.rg-nuevo \{ animation: rg-aparece \.12s ease-out; \}/);
  assert.match(CSS_T73_PATRON, /@media \(prefers-reduced-motion: reduce\) \{ \.t73pt \.rg-nuevo \{ animation: none; \} \}/);
  /* Ni coral, ni teal, ni ámbar: aquí no hay error, ni debe, ni haber. */
  assert.doesNotMatch(CSS_T73_PATRON, /#E76F51|#2A9D8F|#E9C46A/i);
});

test("★★★ A1: la cuenta de la factura de San Calixto va con su texto, antes de la pregunta", async () => {
  const P = A1.PIEZA_EL_DESCUENTO_COMERCIAL;
  const ej = P.pantallas.find((p) => p.id === "ejemplo");
  const C = A1.H1_LIBRO;
  assert.equal(C.lista - C.descuento, C.factura);
  assert.equal(ej.figuras.length, 1);
  const m = await montar(h(PantallasT7_3, { pieza: P, rotulo: "R" }));
  try {
    const c = m.caja;
    for (let k = 0; k < 10 && c.querySelector("[data-pantalla]").dataset.pantalla !== "ejemplo"; k++) {
      const op = c.querySelector("[data-opcion]");
      if (op) {
        const p = P.pantallas.find((x) => x.id === c.querySelector("[data-pantalla]").dataset.pantalla);
        await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
        await tocar(c.querySelector('[data-boton="confirmar"]'));
      }
      await tocar(c.querySelector('[data-boton="seguir"], [data-boton="empezar"]'));
    }
    const fig = c.querySelector("figure[data-renglones]");
    assert.ok(fig, "la pantalla del ejemplo trae su cuenta");
    assert.equal(fig.querySelector("figcaption").textContent, "Factura de San Calixto");
    assert.deepEqual(filasDe(fig).map((f) => [f.op, f.oye, f.v, f.res]), [
      ["", "Precio de lista", "4.200.000", false],
      ["−", "menos Descuento comercial 15\u00a0%", "630.000", false],
      ["=", "igual a Valor a facturar", "3.570.000", true],
    ]);
    /* Va después de los textos que dan las cifras y antes de la pregunta. */
    const ultimoDespues = [...c.querySelectorAll("[data-texto]")].find((x) => x.textContent === ej.despues.at(-1));
    assert.ok(ultimoDespues.compareDocumentPosition(fig) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(fig.compareDocumentPosition(c.querySelector("[data-pregunta]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    /* Una sola: con el acierto no se repite. */
    await tocar(c.querySelector('[data-opcion="factura"]'));
    await tocar(c.querySelector('[data-boton="confirmar"]'));
    assert.equal(c.querySelectorAll("figure[data-renglones]").length, 1);
    /* El CSS del patrón está en la hoja de la pieza. */
    assert.ok(c.querySelector("style").textContent.includes(".t73pt .rg-f {"));
  } finally {
    m.desmontar();
  }
});

test("★★★ los rótulos de las figuras son los de Watari, marcados como pendientes de revisión", () => {
  const R = A1.ROTULOS_PATRON;
  assert.deepEqual([R.factura("X"), R.precioLista, R.descuentoComercial(15), R.valorFacturar], ["Factura de X", "Precio de lista", "Descuento comercial 15 %", "Valor a facturar"]);
  const fuente = readFileSync(new URL("../../data/contabilidadT7_3.js", import.meta.url), "utf8");
  assert.match(fuente, /\[ESCRITO POR CLAUDE — PENDIENTE DE\s+\* REVISIÓN\]/);
});
