/*
 * Macro 2026 · el Repaso Diario («la ronda del economista», diseño de Gen
 * 24-nov). Mide, con cientos de semillas, lo que la lista de 5 exige a cada
 * consulta (rol ≤ 15, contexto ≤ 30, consigna ≤ 12, retro ≤ 15 palabras),
 * que cada respuesta correcta lo sea de verdad, que la ronda traiga los cinco
 * temas sin repetir consulta, y que cada mecánica montada acepte su respuesta.
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
const { conSemilla } = await import("../comun/azar.js");
const { MASCOTAS } = await import("../comun/mascotas.jsx");
const { PLANTILLAS, TEMAS_REPASO, generarConsulta, plantilla } = await import("../repaso/plantillas.js");
const { armarRonda, CONSULTAS_POR_RONDA, POOL_MACRO } = await import("../repaso/ronda.js");
const { default: RepasoMacro } = await import("../repaso/RepasoMacro.jsx");
const CATALOGOS = await Promise.all([
  import("../demanda-agregada/catalogo.js"), import("../politica-economica/catalogo.js"),
  import("../politica-fiscal/catalogo.js"), import("../politica-monetaria/catalogo.js"), import("../politica-cambiaria/catalogo.js"),
]);
const PUBLICADAS = CATALOGOS.flatMap((m) => Object.entries(m).filter(([k]) => k.startsWith("PUBLICADAS_")).flatMap(([, v]) => v));

const palabras = (t) => t.trim().split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
const SEMILLAS = Array.from({ length: 150 }, (_, k) => k + 1);
const todas = () => PLANTILLAS.flatMap((pl) => SEMILLAS.map((s) => generarConsulta(pl, conSemilla(s))));

/* Todas las retros que puede ver el estudiante en una consulta. */
function retros(c) {
  if (c.mecanica === "calcular") {
    const vs = [];
    for (let v = c.min; v <= c.max + 1e-9; v += c.paso) vs.push(Math.round(v * 100) / 100);
    return vs.map((v) => c.evaluar(v).retro);
  }
  if (c.mecanica === "bandejas") return c.fichas.flatMap((f) => c.bandejas.map((b) => f.retro(b.id)));
  if (c.mecanica === "ordenar") return c.fichas.map((f) => f.retro);
  return c.opciones.map((o) => o.retro);
}

test("lista de 5: rol ≤ 15, contexto ≤ 30, consigna ≤ 12 y retro ≤ 15 palabras, con 150 semillas", () => {
  for (const c of todas()) {
    assert.ok(palabras(c.escena.rol) <= 15, `${c.id} rol: ${c.escena.rol}`);
    assert.ok(palabras(c.escena.contexto) <= 30, `${c.id} contexto: ${c.escena.contexto}`);
    assert.ok(palabras(c.consigna) <= 12, `${c.id} consigna: ${c.consigna}`);
    for (const r of retros(c)) {
      assert.ok(r && palabras(r) <= 15, `${c.id} retro (${palabras(r ?? "")}): ${r}`);
    }
  }
});

test("cada consulta tiene mascota real, fondo de su tema y subtema", () => {
  const ESCENA = Object.fromEntries(TEMAS_REPASO.map((t) => [t.id, t.escena]));
  for (const c of todas()) {
    const m = c.escena.mascota;
    assert.ok(MASCOTAS[m.id] && MASCOTAS[m.id].poses[m.pose], `${c.id}: ${m.id}/${m.pose}`);
    assert.equal(c.escena.tema, ESCENA[c.tema], c.id);
    assert.ok(c.subtemas.length > 0, c.id);
  }
});

test("la respuesta esperada es correcta y es la única que da ✓", () => {
  for (const c of todas()) {
    if (c.mecanica === "calcular") {
      assert.ok(c.correcta >= c.min && c.correcta <= c.max, `${c.id}: ${c.correcta} fuera de rango`);
      assert.ok(Math.abs(Math.round((c.correcta - c.min) / c.paso) * c.paso + c.min - c.correcta) < 1e-6, `${c.id}: ${c.correcta} no cae en un paso`);
      assert.equal(c.evaluar(c.correcta).ok, true, c.id);
      assert.equal(c.evaluar(c.min === c.correcta ? c.max : c.min).ok, false, c.id);
    } else if (c.mecanica === "bandejas") {
      assert.equal(new Set(c.fichas.map((f) => f.id)).size, c.fichas.length, `${c.id}: fichas repetidas`);
      for (const f of c.fichas) assert.ok(c.bandejas.some((b) => b.id === f.correcta), `${c.id}/${f.id}`);
    } else if (c.mecanica === "ordenar") {
      assert.deepEqual(c.fichas.map((f) => f.orden), c.fichas.map((_, k) => k));
      assert.ok(c.revuelta.some((f, k) => f.orden !== k), `${c.id}: salió ya ordenada`);
    } else {
      assert.equal(c.opciones.filter((o) => o.id === c.correcta).length, 1, c.id);
      assert.equal(new Set(c.opciones.map((o) => o.texto ?? o.nombre)).size, c.opciones.length, `${c.id}: opciones repetidas`);
    }
  }
  /* Números a mano, contra la ficha. */
  const mult = generarConsulta(plantilla("rd-da-multiplicador"), conSemilla(3));
  assert.ok(Math.abs(mult.correcta - mult.datos.dG / (1 - mult.datos.ronda)) < 1e-6);
  const real = generarConsulta(plantilla("rd-pc-real"), conSemilla(9));
  assert.equal(real.correcta, real.datos.px - real.datos.pn + real.datos.tcn);
  const fact = generarConsulta(plantilla("rd-pf-factura"), conSemilla(4));
  assert.equal(fact.total, Math.round(fact.base * 1.19));
});

test("los datos cambian entre intentos", () => {
  for (const pl of PLANTILLAS) {
    const firmas = new Set(SEMILLAS.slice(0, 40).map((s) => JSON.stringify(generarConsulta(pl, conSemilla(s)), (k, v) => (typeof v === "function" ? undefined : v))));
    assert.ok(firmas.size >= 3, `${pl.id}: solo ${firmas.size} variantes`);
  }
});

test("variedad: la selección múltiple es como mucho 1 de cada 5 plantillas", () => {
  const opciones = PLANTILLAS.filter((pl) => generarConsulta(pl, conSemilla(1)).mecanica === "factura").length;
  assert.ok(opciones / PLANTILLAS.length <= 0.2, `${opciones} de ${PLANTILLAS.length}`);
  assert.ok(new Set(PLANTILLAS.map((pl) => generarConsulta(pl, conSemilla(1)).mecanica)).size >= 6);
});

test("cada plantilla nace de una Hacer publicada y el pool tiene claves únicas", () => {
  for (const pl of PLANTILLAS) assert.ok(PUBLICADAS.includes(pl.actividad), `${pl.id}: ${pl.actividad}`);
  assert.equal(new Set(POOL_MACRO.map((x) => x.clave)).size, POOL_MACRO.length);
});

test("la ronda: diez consultas distintas, los cinco temas, de menos a más", () => {
  for (const s of SEMILLAS) {
    const r = armarRonda({ rng: conSemilla(s) });
    assert.equal(r.length, CONSULTAS_POR_RONDA);
    assert.equal(new Set(r.map((c) => c.id)).size, r.length);
    for (const t of TEMAS_REPASO) assert.ok(r.some((c) => c.tema === t.id), `semilla ${s}: falta ${t.id}`);
    const media = (xs) => xs.reduce((a, c) => a + c.nivel, 0) / xs.length;
    assert.ok(media(r.slice(0, 3)) < media(r.slice(-3)), `semilla ${s}: no va de menos a más`);
    if (r.some((c) => c.nivel === 3)) assert.ok(r.slice(-3).some((c) => c.nivel === 3), `semilla ${s}: el cierre no es el más difícil`);
    const seguidos = r.filter((c, k) => k > 0 && c.tema === r[k - 1].tema).length;
    assert.ok(seguidos <= 1, `semilla ${s}: ${seguidos} temas seguidos`);
    const mismoJuego = r.filter((c, k) => k > 0 && c.mecanica === r[k - 1].mecanica).length;
    assert.ok(mismoJuego <= 2, `semilla ${s}: ${mismoJuego} mecánicas seguidas`);
  }
});

test("lo fallado ayer vuelve hoy", () => {
  const ayer = new Date(Date.now() - 86400000).toISOString();
  const historial = new Map(PLANTILLAS.map((pl) => [pl.id, { ultimoEn: ayer, ultimoOk: true, veces: 1 }]));
  historial.set("rd-pc-real", { ultimoEn: ayer, ultimoOk: false, veces: 1 });
  for (const s of SEMILLAS.slice(0, 30)) assert.ok(armarRonda({ historial, rng: conSemilla(s) }).some((c) => c.id === "rd-pc-real"));
});

/* ─── Montado: cada mecánica acepta su respuesta correcta ─── */
async function montar(el) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = createRoot(div);
  await act(async () => { root.render(el); });
  return { div, root };
}
const clic = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

async function responderBien(div, c) {
  const q = (s) => div.querySelector(s);
  if (c.mecanica === "curva" || c.mecanica === "factura") return clic(q(`[data-opcion="${c.correcta}"]`));
  if (c.mecanica === "pareja") return clic(q(`[data-cliente="${c.correcta}"]`));
  if (c.mecanica === "bandejas") {
    for (const f of c.fichas) await clic(q(`[data-bandeja="${f.correcta}"]`));
    return clic(q("[data-responder]"));
  }
  if (c.mecanica === "ordenar") {
    for (const f of c.fichas) await clic(q(`[data-pieza="${f.id}"]`));
    return clic(q("[data-responder]"));
  }
  /* calcular: el deslizador nativo o los botones ± de la aguja. */
  if (c.figura === "dial") {
    const pasos = Math.round(Math.abs(c.correcta) / c.paso);
    const boton = q(`[aria-label="${c.correcta >= 0 ? "Subir" : "Bajar"} medio punto"]`);
    for (let k = 0; k < pasos; k += 1) await clic(boton);
    if (pasos === 0) { await clic(q('[aria-label="Subir medio punto"]')); await clic(q('[aria-label="Bajar medio punto"]')); }
  } else {
    const input = q('input[type="range"]');
    const fijar = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
    await act(async () => { fijar.call(input, String(c.correcta)); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
  }
  return clic(q("[data-responder]"));
}

test("montada: una ronda entera respondida bien da 10 de 10 y avisa con el detalle", async () => {
  for (const s of [2, 7, 11]) {
    const consultas = armarRonda({ rng: conSemilla(s) });
    let fin = null;
    const { div, root } = await montar(h(RepasoMacro, { consultas, conPortada: false, onTerminar: (pct, ms, detalle) => { fin = { pct, detalle }; } }));
    for (const c of consultas) {
      assert.ok(div.querySelector(`[data-consulta="${c.id}"] [data-escenario]`), `${c.id}: sin escena`);
      assert.ok(div.querySelector('[data-mascota-rol]'), `${c.id}: sin mascota`);
      await responderBien(div, c);
      assert.equal(div.querySelector('[data-retro][data-estado="mal"]'), null, `${c.id} (semilla ${s}) quedó mal: ${div.querySelector('[data-retro]')?.textContent}`);
      await clic(div.querySelector("[data-siguiente]"));
    }
    assert.equal(fin.pct, 100);
    assert.equal(fin.detalle.length, 10);
    assert.ok(fin.detalle.every((d) => d.ok && d.subtemas.length));
    assert.equal(div.querySelector("[data-balance-repaso]").getAttribute("data-aciertos"), "10");
    await act(async () => root.unmount());
  }
});

test("montada: una respuesta mala muestra su retro propia en coral", async () => {
  const consultas = armarRonda({ rng: conSemilla(5) });
  const c = consultas.find((x) => x.mecanica === "bandejas");
  const { div, root } = await montar(h(RepasoMacro, { consultas: [c], conPortada: false }));
  for (const f of c.fichas) await clic(div.querySelector(`[data-bandeja="${c.bandejas.find((b) => b.id !== f.correcta).id}"]`));
  await clic(div.querySelector("[data-responder]"));
  const malas = div.querySelectorAll('[data-retro-ficha][data-estado="mal"]');
  assert.equal(malas.length, c.fichas.length);
  assert.ok(div.querySelector('[data-res="mal"]'));
  await act(async () => root.unmount());
});
