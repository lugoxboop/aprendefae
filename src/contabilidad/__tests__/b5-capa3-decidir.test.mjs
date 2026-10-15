import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPA 3 DE LAS SIETE DE APRENDER (T5 · A1-A2, T6 · A1-A5) — decidir antes de
 * revelar (hoja 6 de Mai, entrega 2 de Futaba). Lo común a las siete:
 *   · cerrada, como antes; abierta, la pregunta de la caja y las opciones en
 *     el orden de Futaba, en un grupo etiquetado por la pregunta, con el
 *     chevrón girado (no desaparece);
 *   · antes de decidir no se revela nada;
 *   · un intento: la correcta con el resalte (borde 2 nodo, relleno navy y
 *     1 px menos de relleno), la elegida mala tachada y entera, las demás al
 *     0,5; aria-disabled (no disabled) y aria-pressed en la elegida;
 *   · si falló, la devolución de Futaba y después el texto de siempre; si
 *     acertó, el texto directo;
 *   · el final, solo con todas decididas; fila o columna por pieza;
 *   · con movimiento reducido, sin transiciones ni animaciones.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") && reducido, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
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
const { pegarPorcentaje } = await import("../t6Pieza5.js");

const T5A1 = await import("../../data/contabilidadT5Pieza1.js");
const T5A2 = await import("../../data/contabilidadT5Pieza2.js");
const T6A1 = await import("../../data/contabilidadT6Pieza1.js");
const T6A2 = await import("../../data/contabilidadT6Pieza2.js");
const T6A3 = await import("../../data/contabilidadT6Pieza3.js");
const T6A4 = await import("../../data/contabilidadT6Pieza4.js");
const T6A5 = await import("../../data/contabilidadT6Pieza5.js");
const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;

/* Cada pieza: su componente, su consigna, su forma y sus cajas con la decisión, tal como las da Futaba. */
const PIEZAS = [
  { nombre: "T5 · A1", Componente: await C("tema5/DosPaquetes"), consigna: T5A1.CONSIGNA_CAPA_3, forma: "columna",
    cajas: T5A1.PAQUETES.map((p) => ({ ...p, pregunta: T5A1.PREGUNTA_CAPA_3, opciones: T5A1.OPCIONES_CAPA_3 })), final: T5A1.FINAL_CAPA_3.join("") },
  { nombre: "T5 · A2", Componente: await C("tema5/DosVentas"), consigna: T5A2.CONSIGNA_CAPA_3_T5_A2, forma: "fila",
    cajas: T5A2.VENTAS_T5_A2.map((v) => ({ ...v, pregunta: T5A2.PREGUNTA_CAPA_3_T5_A2, opciones: T5A2.OPCIONES_CAPA_3_T5_A2, falla: T5A2.FALLA_CAPA_3_T5_A2 })), final: T5A2.FINAL_CAPA_3_T5_A2.texto },
  { nombre: "T6 · A1", Componente: await C("tema6/SeisHechos"), consigna: T6A1.CONSIGNA_CAPA_3_T6, forma: "fila",
    cajas: T6A1.HECHOS_T6.map((x) => ({ ...x, pregunta: T6A1.PREGUNTA_CAPA_3_T6, opciones: T6A1.OPCIONES_CAPA_3_T6 })), final: T6A1.FINAL_CAPA_3_T6.texto },
  { nombre: "T6 · A2", Componente: await C("tema6/DosMetodos"), consigna: T6A2.CONSIGNA_CAPA_3_T6_A2, forma: "columna",
    cajas: T6A2.METODOS_T6_A2.map((m) => ({ ...m, pregunta: T6A2.PREGUNTA_CAPA_3_T6_A2, opciones: T6A2.OPCIONES_CAPA_3_T6_A2 })), final: T6A2.FINAL_CAPA_3_T6_A2.texto },
  { nombre: "T6 · A3", Componente: await C("tema6/CuentaT"), consigna: T6A3.CONSIGNA_CAPA_3_T6_A3, forma: "columna", enOrden: true,
    cajas: T6A3.MOMENTOS_T6_A3, final: T6A3.FINAL_CAPA_3_T6_A3.texto },
  { nombre: "T6 · A4", Componente: await C("tema6/TresCasos"), consigna: T6A4.CONSIGNA_CAPA_3_T6_A4, forma: "fila",
    cajas: T6A4.CASOS_T6_A4.map((c) => ({ ...c, pregunta: T6A4.PREGUNTA_CAPA_3_T6_A4, opciones: T6A4.OPCIONES_CAPA_3_T6_A4 })), final: T6A4.FINAL_CAPA_3_T6_A4.texto },
  { nombre: "T6 · A5", Componente: await C("tema6/CuatroGrupos"), consigna: T6A5.CONSIGNA_CAPA_3_T6_A5, forma: "fila", pegar: pegarPorcentaje,
    cajas: T6A5.GRUPOS_T6_A5.map((g) => ({ ...g, revela: pegarPorcentaje(g.revela), pregunta: T6A5.PREGUNTA_CAPA_3_T6_A5 })), final: T6A5.FINAL_CAPA_3_T6_A5.texto },
];

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
/* Lo que se lee bajo las opciones, sin el pie. */
const revelado = (zona) => [...zona.querySelectorAll("[data-revela] p:not([data-pie])")].map((p) => p.textContent);
const falloDe = (x, o) => (typeof x.falla === "string" ? x.falla : x.falla[o]);
const finalLeido = (caja) => [...caja.querySelectorAll("[data-final] p:not([data-pie])")].map((p) => p.textContent).join("");
const pegar = (p, t) => (p.pegar ? p.pegar(t) : t);

for (const p of PIEZAS) {
  test(`★★★ ${p.nombre}: la consigna nueva; cerrada, sin pregunta; abierta, la pregunta y las opciones en el orden de Futaba, con el chevrón girado y nada revelado`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    assert.equal(caja.querySelector("p").textContent, p.consigna);
    assert.equal(caja.querySelectorAll("[data-decide]").length, 0, "cerradas, sin pregunta");
    for (const x of p.enOrden ? p.cajas.slice(0, 1) : p.cajas) {
      const zona = zonaDe(caja, x.id);
      const boton = zona.querySelector("button[aria-expanded]");
      assert.equal(boton.querySelector("[data-chevron]").style.transform, "none");
      await tocar(boton);
      assert.equal(boton.getAttribute("aria-expanded"), "true");
      assert.equal(boton.querySelector("[data-chevron]").style.transform, "rotate(180deg)", "el chevrón se queda y gira");
      const pregunta = zona.querySelector("[data-pregunta]");
      assert.equal(pregunta.textContent, x.pregunta);
      assert.equal(pregunta.style.fontFamily, "Sora, sans-serif");
      assert.equal(pregunta.style.fontSize, "13px");
      assert.equal(pregunta.style.fontWeight, "600");
      const grupo = zona.querySelector("[role='group']");
      assert.equal(grupo.getAttribute("aria-labelledby"), pregunta.id);
      assert.equal(grupo.dataset.opciones, p.forma);
      assert.equal(grupo.style.flexDirection, p.forma === "fila" ? "row" : "column");
      assert.equal(grupo.style.gap, p.forma === "fila" ? "4px" : "6px");
      const botones = [...grupo.querySelectorAll("[data-opcion]")];
      assert.deepEqual(botones.map((b) => b.textContent), x.opciones.map((o) => pegar(p, o.texto)), "en el orden de Futaba, sin barajar");
      for (const b of botones) {
        assert.equal(b.style.minHeight, "44px");
        assert.equal(b.style.fontSize, "12.5px");
        assert.equal(b.style.padding, p.forma === "fila" ? "10px 3px" : "10px 12px");
        assert.equal(b.getAttribute("aria-pressed"), "false");
        assert.equal(b.hasAttribute("disabled"), false);
      }
      assert.deepEqual(revelado(zona), [], "antes de decidir no se revela nada");
      assert.equal(zona.querySelector("[data-pie]"), null);
    }
    desmontar();
  });

  test(`★★★ ${p.nombre}: con error, la correcta resaltada sin moverse, la elegida tachada, las demás al 0,5; la devolución de Futaba y después el texto de siempre; el final, solo con todas decididas`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    for (const [k, x] of p.cajas.entries()) {
      const mala = x.opciones.find((o) => o.id !== x.correcta).id;
      const zona = zonaDe(caja, x.id);
      assert.ok(zona, `${x.id} a la vista`);
      await decidir(tocar, zona, mala);
      const por = Object.fromEntries([...zona.querySelectorAll("[data-opcion]")].map((b) => [b.dataset.opcion, b]));
      const correcta = por[x.correcta];
      assert.equal(correcta.style.border, `2px solid ${rgb(FAE.node)}`);
      assert.equal(correcta.style.background, rgb(FAE.navy));
      assert.equal(correcta.style.padding, p.forma === "fila" ? "9px 2px" : "9px 11px", "1 px menos de relleno: nada se mueve");
      assert.equal(correcta.style.fontWeight, "400", "sin cambiar de peso");
      assert.equal(por[mala].style.textDecoration, "line-through");
      assert.equal(por[mala].style.opacity, "1");
      assert.equal(por[mala].getAttribute("aria-pressed"), "true");
      for (const [id, b] of Object.entries(por)) {
        if (id !== x.correcta && id !== mala) assert.equal(b.style.opacity, "0.5", `${id}, apagada`);
        assert.equal(b.getAttribute("aria-disabled"), "true");
        assert.equal(b.hasAttribute("disabled"), false, "aria-disabled, no disabled: el foco no se pierde");
      }
      const devolucion = zona.querySelector("[data-devolucion]");
      assert.equal(devolucion.style.borderLeft, `3px solid ${rgb("#B8C4D4")}`);
      assert.equal(devolucion.style.fontSize, "13px");
      assert.deepEqual(revelado(zona), [pegar(p, falloDe(x, mala)), x.revela], "primero la devolución y después el texto");
      /* Un solo intento: tocar otra no cambia nada. */
      await tocar(correcta);
      assert.equal(por[mala].getAttribute("aria-pressed"), "true");
      assert.equal(finalLeido(caja), k < p.cajas.length - 1 ? "" : p.final, `final tras la caja ${k + 1}`);
    }
    desmontar();
  });

  test(`★★★ ${p.nombre}: al acertar, el texto sale directo, sin devolución`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    for (const x of p.cajas) {
      const zona = zonaDe(caja, x.id);
      await decidir(tocar, zona, x.correcta);
      assert.equal(zona.querySelector("[data-devolucion]"), null);
      assert.deepEqual(revelado(zona), [x.revela]);
      assert.equal(zona.querySelector(`[data-opcion="${x.correcta}"]`).getAttribute("aria-pressed"), "true");
      assert.ok([...zona.querySelectorAll("[data-opcion]")].every((b) => b.style.textDecoration === "none"));
    }
    assert.equal(finalLeido(caja), p.final);
    desmontar();
  });
}

test("★★★ T6 · A3: cada momento aparece cuando se DECIDE el anterior, no cuando se abre", async () => {
  const p = PIEZAS.find((x) => x.enOrden);
  const { caja, desmontar } = await montar(h(p.Componente));
  for (const [k, x] of p.cajas.entries()) {
    assert.equal(caja.querySelectorAll("[data-hecho]").length, k + 1, `antes del momento ${k + 1}`);
    await tocar(zonaDe(caja, x.id).querySelector("button[aria-expanded]"));
    assert.equal(caja.querySelectorAll("[data-hecho]").length, k + 1, "abierto sin decidir: el siguiente no aparece");
    await tocar(zonaDe(caja, x.id).querySelector(`[data-opcion="${x.correcta}"]`));
  }
  desmontar();
});

test("★★ movimiento: con reducido, sin transición ni animación; sin reducido, el chevrón gira en 200 ms, las apagadas en 200 ms y lo que aparece en 240 ms", async () => {
  const p = PIEZAS[2];
  const x = p.cajas[0];
  for (const r of [true, false]) {
    reducido = r;
    const { caja, desmontar } = await montar(h(p.Componente));
    const zona = zonaDe(caja, x.id);
    await decidir(tocar, zona, p.cajas[0].opciones.find((o) => o.id !== x.correcta).id);
    const chevron = zona.querySelector("[data-chevron]");
    const opcion = zona.querySelector("[data-opcion]");
    const animadas = [zona.querySelector("[data-decide]"), zona.querySelector("[data-devolucion]")];
    if (r) {
      assert.equal(chevron.style.transition, "none");
      assert.equal(opcion.style.transition, "none");
      for (const n of animadas) assert.equal(n.className, "");
    } else {
      assert.match(chevron.style.transition, /transform 200ms/);
      assert.match(opcion.style.transition, /opacity 200ms/);
      for (const n of animadas) assert.equal(n.className, "b5-decide-aparece");
      assert.match(zona.querySelector("style").textContent, /animation: b5-decide-aparece 240ms/);
    }
    desmontar();
  }
  reducido = true;
});
