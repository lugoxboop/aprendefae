/*
 * Macro 2026 · T5 Política cambiaria: las Aprender montadas de verdad
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
const T = await import("../politica-cambiaria/textos.js");
const { PIEZAS_T5 } = await import("../politica-cambiaria/catalogo.js");

const MODULOS = {
  "pc26-a1-balanza": "A1Balanza", "pc26-a2-subasta": "A2Subasta", "pc26-a3-nominal-real": "A3NominalReal",
  "pc26-a4-banano": "A4Banano", "pc26-a5-tuberias": "A5Tuberias", "pc26-a6-imanes": "A6Imanes",
  "pc26-a7-correa": "A7Correa",
};
const cargar = async (id) => (await import(`../politica-cambiaria/${MODULOS[id]}.jsx`)).default;
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

/* Palabra = token con al menos una letra o cifra, como en t5-textos-y-bancos. */
const palabrasT5 = (t) => t.trim().split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const APRENDER_T5 = PIEZAS_T5.filter((p) => p.tipo === "aprender");
const todas = async (m, sel) => { for (const b of [...m.el.querySelectorAll(sel)]) await m.clic(b); };
const alto = (fig) => Number((fig.tagName === "IMG" ? fig : fig.querySelector("img")).getAttribute("height"));

/* Lo que hace el estudiante en cada pantalla que espera algo. */
const RESOLVER = {
  "pc26-a1-balanza": async (m, k) => {
    if (k === 0) await todas(m, "[data-noticia]");
    if (k === 2) await m.deslizar("tc", T.A1.deprecia);
    if (k === 3) await m.deslizar("tc", T.A1.aprecia);
  },
  "pc26-a2-subasta": async (m, k) => {
    if (k === 0) await todas(m, "[data-quien]");
    if (k === 2) await m.clic("[data-llegan]");
    if (k === 3) await m.clic("[data-importamos]");
  },
  "pc26-a3-nominal-real": async (m, k) => {
    if (k === 2) { await m.deslizar("a3-afuera", 3); await m.deslizar("a3-aqui", 5); await m.deslizar("a3-nominal", 4); }
    if (k === 4) { await m.clic('[data-zona-boton="devaluacion"]'); await m.clic('[data-zona-boton="revaluacion"]'); }
  },
  "pc26-a4-banano": async (m, k) => {
    if (k === 3) await m.clic('[data-apuesta="no"]');
  },
  "pc26-a5-tuberias": async (m, k) => {
    if (k === 1) await m.clic('[data-tubo="corriente"]');
    if (k === 2) await m.clic('[data-tubo="capital"]');
    if (k === 3) await m.clic("[data-trimestre]");
  },
  "pc26-a6-imanes": async (m, k) => {
    if (k === 1) await m.deslizar("tasa-aqui", 12);
    if (k === 2) await m.clic("[data-riesgo]");
    if (k === 4) await m.clic('[data-apuesta="aqui"]');
  },
  "pc26-a7-correa": async (m, k) => {
    if (k === 2) { await m.clic('[data-balde="compra"]'); await m.clic('[data-balde="vende"]'); }
    if (k === 7) await m.clic("[data-sucia]");
  },
};

test("las Aprender de T5 montan, con figura, y sin coral", async () => {
  assert.equal(APRENDER_T5.length, 7);
  for (const p of APRENDER_T5) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {} });
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("Aprender T5: cada pantalla pinta su texto exacto y ≤ 20 palabras (medido en el DOM), y se llega a Terminar", async () => {
  for (const p of APRENDER_T5) {
    const textos = T.APRENDER[p.id];
    let terminado = false;
    const m = await montar(await cargar(p.id), { onTerminar: () => { terminado = true; } });
    for (let k = 0; k < textos.length; k += 1) {
      const leido = m.q("[data-texto-pantalla]").textContent;
      assert.equal(leido, textos[k], `${p.id} P${k + 1}`);
      assert.ok(palabrasT5(leido) <= 20, `${p.id} P${k + 1}`);
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
    "pc26-a1-balanza": [0, 2, 3], "pc26-a2-subasta": [0, 2, 3], "pc26-a3-nominal-real": [2, 4],
    "pc26-a4-banano": [3], "pc26-a5-tuberias": [1, 2, 3], "pc26-a6-imanes": [1, 2, 4], "pc26-a7-correa": [2, 7],
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

test("A1: las noticias mueven la balanza; tc ↑ deprecia el peso y tc ↓ lo aprecia; las dos caras con la escena exportadora-importadora", async () => {
  const m = await montar(await cargar("pc26-a1-balanza"), {});
  assert.equal(m.el.querySelectorAll("[data-noticia]").length, 4);
  assert.equal(m.q("[data-balanza]").dataset.tc, String(T.A1.base));
  await todas(m, "[data-noticia]");
  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  await m.deslizar("tc", T.A1.deprecia);
  assert.equal(m.q("[data-balanza]").dataset.tc, String(T.A1.deprecia));
  assert.ok(m.el.textContent.includes(T.A1.pesoDeprecia) && m.el.textContent.includes(T.A1.dolarAprecia));
  await m.clic("[data-siguiente]");
  await m.deslizar("tc", T.A1.aprecia);
  assert.ok(m.el.textContent.includes(T.A1.pesoAprecia) && m.el.textContent.includes(T.A1.dolarDeprecia));
  await m.clic("[data-siguiente]");
  const escena = m.q('[data-escena-mascotas="exportadora-importadora"]');
  assert.ok(escena, "P5: la escena exportadora-importadora");
  assert.ok(alto(escena) >= 120);
  assert.equal(m.el.querySelectorAll("[data-espejo]").length, 2);
  await m.desmontar();
});

test("A2: seis mascotas con su rol (120 px o más); llegan dólares y el tc baja; se importa más y el tc sube", async () => {
  const m = await montar(await cargar("pc26-a2-subasta"), {});
  const quienes = [...m.el.querySelectorAll("[data-quien]")];
  assert.equal(quienes.length, 6);
  for (const b of quienes) {
    const fig = b.querySelector("[data-mascota-rol]");
    assert.ok(fig, `${b.dataset.quien}: mascota`);
    assert.ok(alto(fig) >= 120, `${b.dataset.quien}: 120 px`);
    assert.notEqual(fig.dataset.pose, "tableta");
  }
  assert.equal(m.el.querySelectorAll('[data-fila="oferta"] [data-quien]').length, 3);
  assert.equal(m.el.querySelectorAll('[data-fila="demanda"] [data-quien]').length, 3);
  await todas(m, "[data-quien]");
  for (const b of quienes) assert.ok(b.querySelector("[data-dice]").dataset.dice, b.dataset.quien);
  await m.clic("[data-siguiente]");
  const tc = () => Number(m.q("[data-grafica-divisas]").dataset.tc);
  assert.equal(tc(), 4000);
  await m.clic("[data-siguiente]");
  await m.clic("[data-llegan]");
  assert.ok(tc() < 4000, "más oferta, dólar más barato");
  assert.ok(m.q('[data-llega="inversionista"] [data-mascota-rol="inversionista"]'));
  await m.clic("[data-siguiente]");
  assert.equal(tc(), 4000);
  await m.clic("[data-importamos]");
  assert.ok(tc() > 4000, "más demanda, dólar más caro");
  await m.desmontar();
});

test("A3: la aguja sigue el atajo; P5 la exportadora gana con devaluación real; P6 el ITCR", async () => {
  const m = await montar(await cargar("pc26-a3-nominal-real"), {});
  for (let k = 0; k < 2; k += 1) await m.clic("[data-siguiente]");
  await m.deslizar("a3-afuera", 3);
  await m.deslizar("a3-aqui", 5);
  await m.deslizar("a3-nominal", 4);
  assert.equal(Number(m.q("[data-dial]").dataset.valor), T.deltaTcr({ afuera: 3, aqui: 5, nominal: 4 }));
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-formula]"));
  await m.clic("[data-siguiente]");
  await m.clic('[data-zona-boton="devaluacion"]');
  assert.equal(m.q("[data-exportador]").textContent, T.A3.gana);
  assert.equal(m.q('[data-mascota-rol="exportadora-flores"]').dataset.pose, "recibe-billete");
  await m.clic('[data-zona-boton="revaluacion"]');
  assert.equal(m.q("[data-exportador]").textContent, T.A3.pierde);
  await m.clic("[data-siguiente]");
  const v = { afuera: 3, aqui: 5, nominal: 4 };
  assert.equal(m.q("[data-itcr]").dataset.itcr, T.itcr(v).toFixed(3));
  await m.desmontar();
});

test("A4: el banano a USD 670; con 1,5 % no le compra (693,10 > 680,05); «sí» es error con la retro de Gen; con 5 % vuelve", async () => {
  const m = await montar(await cargar("pc26-a4-banano"), {});
  assert.ok(m.q("[data-costo]").textContent.includes("2.127.250"));
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-necesario]").dataset.necesario, "670.00");
  for (let k = 0; k < 2; k += 1) await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-necesario]"), null, "la etiqueta se ve al apostar");
  await m.clic('[data-apuesta="si"]');
  assert.ok(tieneCoral(sinEstilos(m.el)), "«sí» es el error");
  assert.equal(m.q("[data-retro-apuesta]").textContent, T.A4.retroSi);
  assert.equal(m.q("[data-necesario]").dataset.necesario, "693.10");
  assert.equal(m.q("[data-mercado]").dataset.mercado, "680.05");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-necesario]").dataset.necesario, "670.00");
  assert.ok(m.q("[data-sube-5]"));
  await m.clic("[data-siguiente]");
  assert.equal(m.el.querySelectorAll("[data-marca]").length, 2);
  await m.desmontar();
  const n = await montar(await cargar("pc26-a4-banano"), {});
  for (let k = 0; k < 3; k += 1) await n.clic("[data-siguiente]");
  await n.clic('[data-apuesta="no"]');
  assert.ok(!tieneCoral(sinEstilos(n.el)));
  assert.equal(n.q("[data-retro-apuesta]").textContent, T.A4.retroNo);
  await n.desmontar();
});

test("A5: cada tubería se toca en su pantalla; el pájaro se va al pasar el trimestre; la ecuación; el saldo mueve el tanque", async () => {
  const m = await montar(await cargar("pc26-a5-tuberias"), {});
  assert.equal(m.q('[data-tubo="corriente"]').disabled, true);
  await m.clic("[data-siguiente]");
  assert.equal(m.q('[data-tubo="capital"]').disabled, true);
  await m.clic('[data-tubo="corriente"]');
  assert.equal(m.q("[data-carga]").dataset.carga, "corriente");
  await m.clic("[data-siguiente]");
  await m.clic('[data-tubo="capital"]');
  assert.equal(m.q("[data-carga]").dataset.carga, "capital");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-pajaro]").dataset.seFue, "0");
  assert.ok(m.q("[data-arbol]"));
  await m.clic("[data-trimestre]");
  assert.equal(m.q("[data-pajaro]").dataset.seFue, "1");
  await m.clic("[data-siguiente]");
  assert.deepEqual([...m.el.querySelectorAll("[data-termino]")].map((t) => t.dataset.termino), ["X", "M", "F"]);
  await m.clic("[data-siguiente]");
  const nivel = () => Number(m.q("[data-tanque]").dataset.tanque);
  await m.clic('[data-saldo="positivo"]');
  const alto1 = nivel();
  await m.clic('[data-saldo="negativo"]');
  assert.ok(alto1 > nivel(), "saldo positivo sube las reservas");
  await m.desmontar();
});

test("A6: la tasa atrae; el riesgo espanta; el inversionista apuesta con «monedas» (nunca «tableta»); con devaluación afuera rinde $698,9", async () => {
  const m = await montar(await cargar("pc26-a6-imanes"), {});
  await m.clic("[data-siguiente]");
  await m.deslizar("tasa-aqui", 12);
  assert.ok(Number(m.q("[data-imanes]").dataset.atraccion) < 0, "va hacia Colombia");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-nube]"), null);
  await m.clic("[data-riesgo]");
  assert.ok(m.q("[data-nube]"));
  for (let k = 0; k < 2; k += 1) await m.clic("[data-siguiente]");
  const inv = m.q('[data-mascota-rol="inversionista"]');
  assert.equal(inv.dataset.pose, "monedas");
  assert.ok(alto(inv) >= 120);
  assert.equal(m.q('[data-barra="aqui"]').dataset.valor, "");
  await m.clic('[data-apuesta="aqui"]');
  assert.equal(m.q('[data-barra="aqui"]').dataset.valor, "654.0");
  assert.equal(m.q('[data-barra="afuera"]').dataset.valor, "624.0");
  await m.clic("[data-siguiente]");
  assert.equal(m.q('[data-barra="afuera"]').dataset.valor, "698.9");
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-regla]").textContent.includes("16,5 %"));
  await m.desmontar();
  const n = await montar(await cargar("pc26-a6-imanes"), {});
  for (let k = 0; k < 4; k += 1) { await RESOLVER["pc26-a6-imanes"](n, k); await n.clic("[data-siguiente]"); }
  await n.clic('[data-apuesta="afuera"]');
  assert.ok(tieneCoral(sinEstilos(n.el)), "«afuera» es el error en P5");
  assert.equal(n.q("[data-retro-apuesta]").textContent, T.A6.retroAfuera);
  await n.desmontar();
});

test("A7: el panda con su carpeta (180 px); los baldes mueven tc y reservas; perro y dueño; las cuatro correas; flotación sucia", async () => {
  const m = await montar(await cargar("pc26-a7-correa"), {});
  const panda = m.q('[data-mascota-rol="autoridad-economica"]');
  assert.equal(panda.dataset.pose, "carpeta");
  assert.ok(alto(panda) >= 180, "protagoniza: 180 px");
  assert.equal(m.el.querySelectorAll("[data-meta]").length, 2);
  await m.clic("[data-siguiente]");
  assert.equal(m.q('[data-balde="compra"]').disabled, true);
  await m.clic("[data-siguiente]");
  const tc = () => Number(m.q("[data-tc-a7]").dataset.tcA7);
  const res = () => Number(m.q("[data-reservas]").dataset.reservas);
  const [t0, r0] = [tc(), res()];
  await m.clic('[data-balde="compra"]');
  assert.ok(tc() > t0 && res() > r0, "comprar sube el dólar y las reservas");
  await m.clic('[data-balde="vende"]');
  await m.clic('[data-balde="vende"]');
  assert.ok(tc() < t0 && res() < r0, "vender hace lo contrario");
  await m.clic("[data-siguiente]");
  const escena = m.q('[data-escena-mascotas="viajero-banco-central"]');
  assert.ok(escena && alto(escena) >= 180, "P4: la escena viajero-banco-central");
  assert.ok(m.q("[data-rol-perro]") && m.q("[data-rol-dueno]"));
  for (const [reg, marca] of [["fijo", "[data-poste]"], ["banda", "[data-techo-piso]"], ["gota", "[data-rampa]"], ["flexible", null]]) {
    await m.clic("[data-siguiente]");
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    assert.equal(m.q("[data-correa]").dataset.correa, reg);
    assert.ok(m.q("[data-perro]"), `${reg}: el perro`);
    if (marca) assert.ok(m.q(marca), `${reg}: ${marca}`);
    assert.ok(m.q("[data-otra-vez]"));
  }
  assert.equal(m.q("[data-correa]").dataset.jala, "0");
  await m.clic("[data-sucia]");
  assert.equal(m.q("[data-correa]").dataset.jala, "1", "el dueño jala a veces");
  await m.clic("[data-siguiente]");
  assert.deepEqual([...m.el.querySelectorAll("[data-instrumento]")].map((x) => x.dataset.instrumento), ["controles", "diferenciales"]);
  await m.desmontar();
});

test("T5 nunca usa fotos de personas ni la pose «tableta»; el deudor solo va donde no se juzga si le va bien o mal", async () => {
  const { readdirSync, readFileSync } = await import("node:fs");
  const dir = "src/macro2026/politica-cambiaria";
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".jsx") || x.endsWith(".js"))) {
    const src = readFileSync(`${dir}/${f}`, "utf8");
    assert.ok(!src.includes("FotoPersonaje"), f);
    assert.ok(!/pose[=:]\s*["{]?\s*"?tableta/.test(src), `${f}: tableta`);
    if (/^(H4|H5|A6)/.test(f)) assert.ok(!src.includes("deudor"), `${f}: el deudor no va donde se juzga si gana o pierde`);
  }
});
