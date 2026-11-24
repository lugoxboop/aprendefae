/*
 * Macro 2026 · T4 Política monetaria: las Aprender montadas de verdad
 * (jsdom). Cada pantalla lleva su texto exacto y ≤ 20 palabras; la figura va
 * con data-figura; el coral solo aparece en el estado de error; lo que
 * bloquea «Siguiente» se resuelve como lo haría el estudiante. Las mascotas
 * (nunca personas) van donde las puso la construcción, a 120 px o más.
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
const T = await import("../politica-monetaria/textos.js");
const { PIEZAS_T4 } = await import("../politica-monetaria/catalogo.js");
const { REZAGO_MS } = await import("../politica-monetaria/A7Termostato.jsx");

const MODULOS = {
  "pm26-a1-billetera": "A1Billetera", "pm26-a2-ventanilla": "A2Ventanilla", "pm26-a3-cascada": "A3Cascada",
  "pm26-a4-cajas": "A4Cajas", "pm26-a5-precio-dinero": "A5PrecioDinero", "pm26-a6-palancas": "A6Palancas",
  "pm26-a7-termostato": "A7Termostato",
};
const cargar = async (id) => (await import(`../politica-monetaria/${MODULOS[id]}.jsx`)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const esperar = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

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
  const deslizar = async (id, v) => {
    await act(async () => {
      const r = el.querySelector(`#da26-${id}`);
      assert.ok(r, `no está el deslizador ${id}`);
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(r, String(v));
      r.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
  };
  const q = (s) => el.querySelector(s);
  return { el, q, clic, deslizar, desmontar: () => act(async () => raiz.unmount()) };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const APRENDER_T4 = PIEZAS_T4.filter((p) => p.tipo === "aprender");
const todas = async (m, sel) => { for (const b of [...m.el.querySelectorAll(sel)]) await m.clic(b); };

/* Lo que hace el estudiante en cada pantalla que espera algo. */
const RESOLVER = {
  "pm26-a1-billetera": async (m, k) => {
    if (k === 0) await m.clic("[data-billetera]");
    if (k === 1) await todas(m, "[data-cosa]");
    if (k === 3) await m.clic("[data-bolso]");
  },
  "pm26-a2-ventanilla": async (m, k) => {
    if (k === 1) { await m.clic('[data-activo="dolar"]'); await m.clic("[data-ventanilla]"); }
    if (k === 2) await m.clic("[data-ventanilla]");
    if (k === 3) await m.clic("[data-vende]");
  },
  "pm26-a3-cascada": async (m, k) => {
    if (k === 2) for (let i = 0; i < 2; i += 1) await m.clic("[data-prestamo]");
    if (k === 3) await m.clic("[data-toda]");
  },
  "pm26-a4-cajas": async (m, k) => {
    if (k === 2) await m.clic("[data-cuasi]");
    if (k === 4) await todas(m, "[data-tocar-cifra]");
  },
  "pm26-a5-precio-dinero": async (m, k) => {
    if (k === 2) await m.deslizar("ingreso", T.MODELO_DINERO.Ymax);
    if (k === 4) await m.deslizar("oferta", T.MODELO_DINERO.Mmax);
    if (k === 5) await m.clic("[data-precios]");
  },
  "pm26-a6-palancas": async (m, k) => {
    if (k === 2) await todas(m, "[data-nombre-palanca]");
    if (k === 3 || k === 4) for (const p of T.PALANCAS) await m.clic(`[data-palanca="${p.id}"] [data-pos="${k === 3 ? "baja" : "sube"}"]`);
    if (k === 5) await m.clic('[data-palanca="tasa"] [data-pos="sube"]');
    if (k === 6) for (const b of [...m.el.querySelectorAll("[data-impacto]")].slice(0, 3)) await m.clic(b);
  },
  "pm26-a7-termostato": async (m, k) => {
    if (k === 0) { await m.clic("[data-subir-aire]"); await esperar(REZAGO_MS + 100); }
    if (k === 2) for (const a of [2018, 2020, 2022, 2024]) await m.deslizar("anio", a);
  },
};

test("las Aprender de T4 montan, con figura, y sin coral", async () => {
  assert.equal(APRENDER_T4.length, 7);
  for (const p of APRENDER_T4) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {} });
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("Aprender T4: cada pantalla pinta su texto exacto y ≤ 20 palabras (medido en el DOM), y se llega a Terminar", async () => {
  for (const p of APRENDER_T4) {
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

test("las pantallas que esperan algo no dejan seguir sin hacerlo", async () => {
  const bloqueadas = {
    "pm26-a1-billetera": [0, 1, 3], "pm26-a2-ventanilla": [1, 2, 3], "pm26-a3-cascada": [2, 3],
    "pm26-a4-cajas": [2, 4], "pm26-a5-precio-dinero": [2, 4, 5], "pm26-a6-palancas": [2, 3, 4, 5, 6], "pm26-a7-termostato": [0, 2],
  };
  for (const [id, pasos] of Object.entries(bloqueadas)) {
    const m = await montar(await cargar(id), {});
    for (let k = 0; k <= Math.max(...pasos); k += 1) {
      if (pasos.includes(k)) assert.equal(m.q("[data-siguiente]").disabled, true, `${id} P${k + 1} bloquea`);
      await RESOLVER[id]?.(m, k);
      await m.clic("[data-siguiente]");
    }
    await m.desmontar();
  }
});

test("A1: cada cosa dice de dónde sale; el crédito se aparta con «préstamo»; el bolso y las tres conexiones", async () => {
  const m = await montar(await cargar("pm26-a1-billetera"), {});
  await m.clic("[data-billetera]");
  await m.clic("[data-siguiente]");
  for (const o of T.A1.objetos) {
    await m.clic(`[data-cosa="${o.id}"]`);
    assert.equal(m.q("[data-origen]").dataset.origen, o.id);
    assert.ok(m.q("[data-origen]").textContent.includes(o.origen), o.id);
  }
  await m.clic("[data-siguiente]");
  assert.equal(m.q('[data-cosa="credito"]').dataset.aparte, "1");
  assert.equal(m.q("[data-rotulo-prestamo]").textContent, T.A1.prestamo);
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-etiqueta-bolso]"), null);
  await m.clic("[data-bolso]");
  assert.equal(m.q("[data-etiqueta-bolso]").textContent, T.A1.bolso);
  await m.clic("[data-siguiente]");
  assert.deepEqual([...m.el.querySelectorAll("[data-conexion]")].map((c) => c.dataset.conexion), T.A1.conexiones.map((c) => c.id));
  await m.desmontar();
});

test("A2: el panda autoridad con el grifo (180 px); el dólar sube la BM; el pagaré también; vender la baja", async () => {
  const m = await montar(await cargar("pm26-a2-ventanilla"), {});
  const panda = m.q('[data-mascota-rol="autoridad-economica"]');
  assert.ok(panda, "P1: el panda autoridad");
  assert.equal(panda.dataset.pose, "grifo");
  assert.ok(Number(panda.querySelector("img").getAttribute("height")) >= 180, "protagoniza: 180 px");
  await m.clic("[data-siguiente]");
  const escena = m.q('[data-escena-mascotas="viajero-banco-central"]');
  assert.ok(escena, "P2: la escena del viajero");
  assert.ok(Number(escena.getAttribute("height")) >= 120);
  const bm = () => Number(m.q("[data-contador-bm]").dataset.contadorBm);
  const b0 = bm();
  await m.clic('[data-activo="dolar"]');
  await m.clic("[data-ventanilla]");
  assert.equal(bm(), b0 + T.A2.paso);
  await m.clic("[data-siguiente]");
  await m.clic("[data-ventanilla]");
  assert.equal(bm(), b0 + 2 * T.A2.paso);
  await m.clic("[data-siguiente]");
  await m.clic("[data-vende]");
  assert.equal(bm(), b0 + T.A2.paso);
  await m.desmontar();
});

test("A3: la cadena 1.000 → 900 → 810; toda la cascada ≈ 10.000; con encaje 20 % da 5.000", async () => {
  const m = await montar(await cargar("pm26-a3-cascada"), {});
  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  await m.clic("[data-prestamo]");
  await m.clic("[data-prestamo]");
  assert.ok(m.q("[data-cadena]").textContent.includes("1.000"));
  assert.ok(m.q("[data-cadena]").textContent.includes("900"));
  assert.ok(m.q("[data-cadena]").textContent.includes("810"));
  await m.clic("[data-siguiente]");
  await m.clic("[data-toda]");
  assert.equal(m.q("[data-contador-depositos]").dataset.contadorDepositos, "10000");
  await m.clic("[data-siguiente]");
  await m.deslizar("encaje", 20);
  assert.equal(m.q("[data-contador-depositos]").dataset.contadorDepositos, "5000");
  await m.desmontar();
});

test("A4: las cajas se anidan M1 ⊂ M2 ⊂ M3; las cuatro cifras de la d. 41; la lista de liquidez", async () => {
  const m = await montar(await cargar("pm26-a4-cajas"), {});
  assert.ok(m.q("[data-boveda]"));
  await m.clic("[data-siguiente]");
  assert.ok(m.q('[data-caja="m1"]'));
  await m.clic("[data-siguiente]");
  assert.ok(m.q('[data-caja="m2"] [data-caja="m1"]'), "M1 va dentro de M2");
  await m.clic("[data-cuasi]");
  assert.equal(m.q("[data-definicion-cuasi]").textContent, T.A4.defCuasi);
  await m.clic("[data-siguiente]");
  assert.ok(m.q('[data-caja="m3"] [data-caja="m2"] [data-caja="m1"]'));
  await m.clic("[data-siguiente]");
  for (const [id, n] of Object.entries(T.A4.cifras)) {
    await m.clic(`[data-tocar-cifra="${id}"]`);
    assert.equal(m.q("[data-cifra]").dataset.cifra, id);
    assert.ok(m.q("[data-cifra]").textContent.startsWith(`${id.toUpperCase()}: `) && m.q("[data-cifra]").textContent.endsWith("billones"), `${id}: ${n}`);
  }
  const lado = (id) => parseFloat(m.q(`[data-cuadro="${id}"]`).style.width);
  assert.ok(lado("bm") < lado("m1") && lado("m1") < lado("m2") && lado("m2") < lado("m3"), "el área crece con la cifra");
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-lista-liquidez]") && m.q("[data-mas-liquido]"));
  await m.desmontar();
});

test("A5: la tasa del cruce sigue el modelo; más ingreso la sube; más dinero la baja; los precios bajan la oferta real", async () => {
  const { tasaEquilibrio, MODELO_DINERO: D } = T;
  const m = await montar(await cargar("pm26-a5-precio-dinero"), {});
  const tasa = () => Number(m.q("[data-tasa]").dataset.tasa);
  for (let k = 0; k < 2; k += 1) await m.clic("[data-siguiente]");
  const i0 = tasa();
  assert.ok(Math.abs(i0 - tasaEquilibrio(D)) < 0.01, `${i0}`);
  await m.deslizar("ingreso", D.Ymax);
  assert.ok(tasa() > i0, "más ingreso, tasa mayor");
  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  const i1 = tasa();
  await m.deslizar("oferta", D.Mmax);
  assert.ok(tasa() < i1, "más dinero, tasa menor");
  await m.clic("[data-siguiente]");
  const i2 = tasa();
  await m.clic("[data-precios]");
  assert.ok(tasa() > i2, "precios mayores, menos dinero real, tasa mayor");
  await m.desmontar();
});

test("A6: el panda con el timón (120 px); el letrero dice expansiva o contraccionista; la tasa mueve la DA; nueve impactos alrededor de la escena", async () => {
  const m = await montar(await cargar("pm26-a6-palancas"), {});
  for (let k = 0; k < 2; k += 1) await m.clic("[data-siguiente]");
  const panda = m.q('[data-mascota-rol="autoridad-economica"]');
  assert.ok(panda, "P3: el panda autoridad");
  assert.equal(panda.dataset.pose, "timon");
  assert.ok(Number(panda.querySelector("img").getAttribute("height")) >= 120);
  await todas(m, "[data-nombre-palanca]");
  await m.clic("[data-siguiente]");
  for (const p of T.PALANCAS) await m.clic(`[data-palanca="${p.id}"] [data-pos="baja"]`);
  assert.equal(m.q("[data-letrero]").dataset.letrero, "expansiva");
  await m.clic("[data-siguiente]");
  for (const p of T.PALANCAS) await m.clic(`[data-palanca="${p.id}"] [data-pos="sube"]`);
  assert.equal(m.q("[data-letrero]").dataset.letrero, "contraccionista");
  await m.clic("[data-siguiente]");
  const y0 = Number(m.q("[data-y-da]").dataset.yDa);
  await m.clic('[data-palanca="tasa"] [data-pos="sube"]');
  const ySube = Number(m.q("[data-y-da]").dataset.yDa);
  await m.clic('[data-palanca="tasa"] [data-pos="baja"]');
  const yBaja = Number(m.q("[data-y-da]").dataset.yDa);
  assert.ok(ySube < y0 && y0 < yBaja, `${ySube} < ${y0} < ${yBaja}`);
  await m.clic("[data-siguiente]");
  assert.equal(m.el.querySelectorAll("[data-impacto]").length, 9);
  assert.ok(m.q('[data-escena-mascotas="autoridad-empresario"]'), "P7: la escena autoridad-empresario");
  for (const x of T.A6.impactos) {
    await m.clic(`[data-impacto="${x.id}"]`);
    assert.equal(m.q("[data-impacto-nombre]").textContent, x.nombre);
  }
  await m.desmontar();
});

test("A7: el aire tarda (rezago) en bajar el mercurio; la serie 2016–2026; el 2021–2023 resaltado", async () => {
  const m = await montar(await cargar("pm26-a7-termostato"), {});
  assert.equal(m.q("[data-siguiente]").disabled, true);
  await m.clic("[data-subir-aire]");
  assert.equal(m.q("[data-siguiente]").disabled, true, "el mercurio aún no baja");
  await esperar(REZAGO_MS + 100);
  assert.equal(m.q("[data-siguiente]").disabled, false);
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-banda]"));
  await m.clic("[data-siguiente]");
  assert.equal(T.SERIE_A7.length, 11);
  assert.equal(T.SERIE_A7[0].tasa, null, "2016 sin lectura de tasa");
  for (const a of [2019, 2021, 2023]) await m.deslizar("anio", a);
  assert.equal(m.q("[data-cifras-anio]").dataset.cifrasAnio, "2023");
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-resalte]"));
  assert.equal(m.q("#da26-anio").min, "2021");
  await m.desmontar();
});

test("las Aprender de T4 nunca usan fotos de personas", async () => {
  for (const p of APRENDER_T4) {
    const src = (await import("node:fs")).readFileSync(`src/macro2026/politica-monetaria/${MODULOS[p.id]}.jsx`, "utf8");
    assert.ok(!src.includes("FotoPersonaje"), p.id);
  }
});
