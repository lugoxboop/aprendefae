/*
 * Macro 2026 · T3: las piezas montadas de verdad (jsdom). Cada pantalla de
 * Aprender lleva su texto exacto y ≤ 20 palabras; la figura va con
 * data-figura; el coral solo aparece en el estado de error; lo que bloquea
 * «Siguiente» se resuelve como lo haría el estudiante.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now() + 10000), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { CORAL } = await import("../comun/colores-da.js");
const { BASE, modelo, produccion, fmtEntero } = await import("../comun/modelo-da.js");
const T = await import("../politica-fiscal/textos.js");
const { PIEZAS_T3 } = await import("../politica-fiscal/catalogo.js");

const MODULOS = {
  "pf26-a1-lupa": "A1Lupa", "pf26-a2-buzones": "A2Buzones", "pf26-a3-cajeros": "A3Cajeros",
  "pf26-a4-tanque": "A4Tanque", "pf26-a5-balanza": "A5Balanza",
};
const cargar = async (id) => (await import(`../politica-fiscal/${MODULOS[id]}.jsx`)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;

async function montar(Componente, props = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  /* Rediseño (escenas): las Hacer abren con la tarjeta de inicio; se pasa como el estudiante. */
  const empezar = el.querySelector("[data-empezar]");
  if (empezar) await act(async () => { empezar.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  const clic = async (sel) => {
    await act(async () => {
      const b = typeof sel === "string" ? el.querySelector(sel) : sel;
      assert.ok(b, `no está ${sel}`);
      b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    });
  };
  const q = (s) => el.querySelector(s);
  return { el, q, desmontar: () => act(async () => raiz.unmount()), clic };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const APRENDER_T3 = PIEZAS_T3.filter((p) => p.tipo === "aprender");

/* Lo que hace el estudiante en cada pantalla que espera algo. */
const RESOLVER = {
  "pf26-a2-buzones": async (m, k) => { const t = [null, "impuesto", "tasa", "contribucion"][k]; if (t) await m.clic(`[data-buzon="${t}"]`); },
  "pf26-a4-tanque": async (m, k) => {
    const d = [null, "funcionamiento", "inversion", "servicio"][k];
    if (d) await m.clic(`[data-desague="${d}"]`);
    if (k === 4) await m.clic('[data-boquilla="interna"]');
  },
  "pf26-a5-balanza": async (m, k) => {
    if (k === 1 || k === 2) {
      const plato = k === 1 ? "expansiva" : "contraccionista";
      for (const f of [...m.el.querySelectorAll("[data-ficha]")].map((b) => b.dataset.ficha)) {
        await m.clic(`[data-ficha="${f}"]`);
        await m.clic(`[data-plato="${plato}"]`);
      }
    }
    if (k === 4) await m.clic('[data-plato="expansiva"]');
  },
};

test("las Aprender de T3 montan, con figura, y sin coral", async () => {
  for (const p of APRENDER_T3) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {} });
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("Aprender T3: cada pantalla pinta su texto exacto y ≤ 20 palabras (medido en el DOM), y se llega a Terminar", async () => {
  for (const p of APRENDER_T3) {
    const textos = T.APRENDER[p.id];
    let terminado = false;
    const m = await montar(await cargar(p.id), { onTerminar: () => { terminado = true; } });
    for (let k = 0; k < textos.length; k += 1) {
      const leido = m.q("[data-texto-pantalla]").textContent;
      assert.equal(leido, textos[k], `${p.id} P${k + 1}`);
      assert.ok(palabras(leido) <= 20, `${p.id} P${k + 1}`);
      await RESOLVER[p.id]?.(m, k);
      assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id} P${k + 1}: coral sin error`);
      assert.equal(m.q("[data-siguiente]").disabled, false, `${p.id} P${k + 1}: se puede seguir`);
      await m.clic("[data-siguiente]");
    }
    assert.ok(terminado, `${p.id}: Terminar llama a onTerminar`);
    await m.desmontar();
  }
});

test("A1: cada cara abre su lente; de P2 a P6 el lente abre en la cara de la pantalla", async () => {
  const m = await montar(await cargar("pf26-a1-lupa"), {});
  assert.equal(m.q("[data-lupa]").dataset.cara, "");
  for (const c of T.CARAS_A1) {
    await m.clic(`[data-cara="${c.id}"]`);
    assert.equal(m.q("[data-lupa]").dataset.cara, c.id);
  }
  assert.ok(m.q("[data-impactos]").textContent.includes("La balanza fiscal"));
  for (const c of ["naturaleza", "mercado", "objetivos", "instrumentos", "medidas"]) {
    await m.clic("[data-siguiente]");
    assert.equal(m.q("[data-lupa]").dataset.cara, c);
  }
  await m.desmontar();
});

test("A2: «Siguiente» espera la moneda en el buzón de la pantalla, y cada buzón da su consecuencia", async () => {
  const m = await montar(await cargar("pf26-a2-buzones"), {});
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-siguiente]").disabled, true);
  await m.clic('[data-buzon="tasa"]');
  assert.equal(m.q("[data-escena]").dataset.escena, "tasa");
  assert.ok(m.q("[data-escena]").textContent.includes(T.A2.ticket));
  assert.equal(m.q("[data-siguiente]").disabled, true, "la tasa no abre la pantalla del impuesto");
  await m.clic('[data-buzon="impuesto"]');
  assert.ok(m.q("[data-escena]").textContent.includes(T.A2.pozo));
  assert.equal(m.q("[data-siguiente]").disabled, false);
  await m.clic('[data-buzon="contribucion"]');
  assert.ok(m.q("[data-escena]").textContent.includes(T.A2.anden));
  await m.desmontar();
});

test("A3: el directo cobra 1, 2, 4; el indirecto cobra igual; las fichas van a su cajero; la declaración da el saldo", async () => {
  const m = await montar(await cargar("pf26-a3-cajeros"), {});
  const cobros = () => [...m.el.querySelectorAll("[data-cobro]")].map((b) => b.dataset.cobro);
  for (const b of T.A3.billeteras) await m.clic(`[data-billetera="${b.id}"]`);
  assert.deepEqual(cobros(), ["1", "2", "4"]);
  assert.ok(m.q('[data-cajero="directo"]'));
  await m.clic("[data-siguiente]");
  assert.deepEqual(cobros(), ["", "", ""], "la pantalla nueva empieza sin cobros");
  for (const b of T.A3.billeteras) await m.clic(`[data-billetera="${b.id}"]`);
  assert.equal(new Set(cobros()).size, 1);
  assert.ok(m.q('[data-cajero="indirecto"]'));
  await m.clic("[data-siguiente]");
  for (const f of T.A3.fichas) await m.clic(`button[data-ficha="${f.id}"]`);
  for (const f of T.A3.fichas) assert.ok(m.q(`[data-columna="${f.tipo}"] [data-ficha="${f.id}"]`), f.id);
  assert.equal(m.el.querySelectorAll("button[data-ficha]").length, 0);
  await m.clic("[data-siguiente]");
  for (let k = 0; k < 12; k += 1) await m.clic("[data-pasar-mes]");
  assert.equal(m.q("[data-pasar-mes]").disabled, true);
  assert.equal(m.q("[data-saldo]").dataset.saldo, String(T.A3.impuestoDelAno - 12 * T.A3.retencionMes));
  assert.ok(m.q("[data-declaracion]").textContent.includes(T.A3.saldo));
  await m.clic("[data-siguiente]");
  for (const n of T.A3.niveles) {
    await m.clic(`[data-capa="${n.id}"]`);
    assert.deepEqual([...m.q("[data-cobra]").children].map((c) => c.textContent), n.impuestos, n.id);
  }
  await m.desmontar();
});

test("A4: los desagües bajan el nivel; la manguera espera el tanque vacío; las montañas suman 1.194", async () => {
  const m = await montar(await cargar("pf26-a4-tanque"), {});
  const nivel = () => Number(m.q("[data-nivel]").dataset.nivel);
  assert.equal(nivel(), 60);
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-siguiente]").disabled, true);
  await m.clic('[data-desague="funcionamiento"]');
  assert.equal(nivel(), 40);
  assert.deepEqual([...m.el.querySelectorAll("[data-destino-gasto]")].map((d) => d.textContent), ["Nómina", "Insumos", "Servicios"]);
  await m.clic("[data-siguiente]");
  await m.clic('[data-desague="inversion"]');
  await m.clic("[data-siguiente]");
  await m.clic('[data-desague="servicio"]');
  assert.ok(m.q("[data-destinos]").textContent.includes("Intereses y abonos"));
  await m.clic("[data-siguiente]");
  assert.equal(nivel(), 0);
  assert.equal(m.q('[data-boquilla="externa"]').disabled, false, "vacío: la manguera se habilita");
  assert.equal(m.q("[data-siguiente]").disabled, true);
  await m.clic('[data-boquilla="externa"]');
  assert.equal(nivel(), 30);
  assert.equal(m.q('[data-montana="externa"]').dataset.valor, "22");
  await m.clic("[data-siguiente]");
  assert.equal(m.q('[data-montana="interna"]').dataset.valor, "840");
  assert.equal(m.q('[data-montana="externa"]').dataset.valor, "354");
  assert.ok(m.q("[data-suma]").textContent.includes("1.194"));
  assert.equal(m.q("[data-billon]").textContent, T.A4.billon);
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-saldo]") && m.q("[data-cubeta]"));
  await m.desmontar();
});

test("A4: sin abrir el desagüe no se avanza; con agua en el tanque la manguera sigue cerrada", async () => {
  const m = await montar(await cargar("pf26-a4-tanque"), {});
  await act(async () => {
    const r = m.q("#da26-tributos");
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(r, "100");
    r.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(m.q("[data-nivel]").dataset.nivel, "100");
  for (let k = 0; k < 3; k += 1) await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-pieza]").dataset.pantalla, "2");
  for (const d of ["funcionamiento", "inversion", "servicio"]) {
    await m.clic(`[data-desague="${d}"]`);
    await m.clic("[data-siguiente]");
  }
  assert.equal(m.q("[data-pieza]").dataset.pantalla, "5");
  assert.equal(m.q("[data-nivel]").dataset.nivel, "40");
  assert.equal(m.q('[data-boquilla="interna"]').disabled, true);
  assert.equal(m.q("[data-siguiente]").disabled, true);
  await m.desmontar();
});

test("A5: las fichas mueven Y₀ como el modelo de T1; la reforma cae en el contraccionista; cuatro impactos", async () => {
  const m = await montar(await cargar("pf26-a5-balanza"), {});
  await m.clic('[data-perilla="t"]');
  assert.equal(m.q("[data-nombre-perilla]").textContent, T.A5.perillas.t);
  await m.clic("[data-siguiente]");
  const globo = () => Number(m.q("[data-globo]").dataset.globo);
  assert.equal(globo(), Math.round(produccion(BASE)));
  await m.clic('[data-ficha="masG"]');
  await m.clic('[data-plato="expansiva"]');
  assert.equal(globo(), Math.round(produccion(modelo({ G: BASE.G + 50 }))));
  assert.ok(Number(m.q("[data-balanza]").dataset.inclinacion) < 0, "el plato expansivo baja");
  assert.equal(m.q('[data-plato="contraccionista"]').disabled, true);
  await m.clic('[data-ficha="masTR"]');
  await m.clic('[data-plato="expansiva"]');
  await m.clic('[data-ficha="menosT"]');
  await m.clic('[data-plato="expansiva"]');
  assert.equal(globo(), Math.round(produccion(modelo({ G: 250, TR: 100, t: 0.2 }))));
  await m.clic("[data-siguiente]");
  for (const f of ["menosG", "menosTR", "masT"]) { await m.clic(`[data-ficha="${f}"]`); await m.clic('[data-plato="contraccionista"]'); }
  assert.ok(globo() < produccion(BASE));
  assert.ok(Number(m.q("[data-balanza]").dataset.inclinacion) > 0);
  await m.clic("[data-siguiente]");
  const m0 = Number(m.q("[data-multiplicador]").dataset.multiplicador);
  await act(async () => {
    const r = m.q("#da26-t");
    const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
    set.call(r, "10");
    r.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.ok(Number(m.q("[data-multiplicador]").dataset.multiplicador) > m0, "menos t, multiplicador mayor");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-siguiente]").disabled, true);
  assert.ok(m.q('[data-ficha="reforma"]').textContent.includes(T.A5.reforma.rotulo));
  await m.clic('[data-ficha="reforma"]');
  await m.clic('[data-plato="expansiva"]');
  assert.ok(m.q("[data-reforma-cayo]"), "cae aunque se suelte en el otro plato");
  assert.ok(Number(m.q("[data-balanza]").dataset.inclinacion) > 0, "inclina hacia el contraccionista");
  assert.equal(globo(), Math.round(produccion(modelo({ t: 0.3 }))));
  await m.clic("[data-siguiente]");
  for (const i of T.A5.impactos) {
    await m.clic(`[data-impacto="${i.id}"]`);
    assert.equal(m.q("[data-texto-impacto]").textContent, i.texto);
    if (i.personaje) {
      /* El hueco de la mascota (Mateo: sin personajes humanos). */
      assert.equal(m.q("[data-escenario] [data-mascota-rol]").dataset.mascotaRol, i.personaje);
    } else {
      assert.equal(m.q(`[data-objeto-impacto="${i.id}"] img`).getAttribute("alt"), i.nombre);
    }
  }
  assert.ok(fmtEntero(1194) === "1.194");
  await m.desmontar();
});
