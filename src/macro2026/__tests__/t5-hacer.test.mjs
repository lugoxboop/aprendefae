/*
 * Macro 2026 · T5: las seis Hacer montadas de verdad (jsdom). Se juega como
 * el estudiante, con tocar-tocar y teclado, que es lo mismo que usan el
 * lector de pantalla y las asas; el arrastre lo mide el video. Se comprueba:
 * - la retro de ESA respuesta;
 * - el coral solo en el error;
 * - el sorteo;
 * - el puntaje;
 * - los subtemas de cada ítem;
 * - el FP y la migración 0274.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const { CORAL } = await import("../comun/colores-da.js");
const { CSS_DA } = await import("../comun/ui.jsx");
const T = await import("../politica-cambiaria/textos.js");
const { HACER_T5 } = await import("../politica-cambiaria/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "pc26-h1-quien-aprecia": "H1QuienAprecia", "pc26-h2-empuja-curva": "H2EmpujaCurva", "pc26-h3-aguja": "H3Aguja",
  "pc26-h4-a-quien-sirve": "H4AQuienSirve", "pc26-h5-donde-ahorro": "H5DondeAhorro", "pc26-h6-correa": "H6Correa",
};
const modulo = (id) => import(`../politica-cambiaria/${MODULOS[id]}.jsx`);
const cargar = async (id) => (await modulo(id)).default;
const palabras = (t) => t.trim().split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
const esperar = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

async function montar(Componente, props = {}) {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(Componente, props)); });
  const q = (s) => el.querySelector(s);
  const clic = async (sel) => {
    await act(async () => {
      const b = typeof sel === "string" ? q(sel) : sel;
      assert.ok(b, `no está ${sel}`);
      b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    });
  };
  const tecla = async (sel, key) => {
    await act(async () => { q(sel).dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); });
  };
  return { el, q, clic, tecla, desmontar: () => act(async () => raiz.unmount()) };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const alto = (fig) => Number(fig.querySelector("img").getAttribute("height"));

test("las 6 Hacer montan, con su consigna (≤ 12 palabras) y figura, y sin coral antes de cualquier error", async () => {
  assert.equal(HACER_T5.length, 6);
  for (const p of HACER_T5) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(3) });
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.equal(m.q("[data-consigna]").textContent, T.CONSIGNAS[p.id], `${p.id}: consigna`);
    assert.ok(palabras(T.CONSIGNAS[p.id]) <= 12, `${p.id}: consigna ≤ 12`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("todas las reglas de estilo con coral de las Hacer T5 son de error", async () => {
  const hojas = [CSS_DA];
  for (const p of HACER_T5) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(1) });
    m.el.querySelectorAll("style").forEach((s) => hojas.push(s.textContent));
    await m.desmontar();
  }
  for (const hoja of hojas) {
    for (const regla of hoja.split("}")) {
      if (!regla.toLowerCase().includes(CORAL.toLowerCase())) continue;
      assert.ok(/data-estado="mal"/.test(regla.split("{")[0]), `coral fuera de error: ${regla.split("{")[0].trim()}`);
    }
  }
});

test("sorteo: H1 5 de 6, H2 6 de 8, H3 4 de 6, H4 6 de 8, H6 6 de 8; y cambia con la semilla", async () => {
  const casos = [
    ["pc26-h1-quien-aprecia", "prepararH1", T.BANCO_H1, 6, 5],
    ["pc26-h2-empuja-curva", "prepararH2", T.BANCO_H2, 8, 6],
    ["pc26-h3-aguja", "prepararH3", T.BANCO_H3, 6, 4],
    ["pc26-h4-a-quien-sirve", "prepararH4", T.BANCO_H4, 8, 6],
    ["pc26-h6-correa", "prepararH6", T.BANCO_H6, 8, 6],
  ];
  for (const [id, fn, banco, total, partida] of casos) {
    const preparar = (await modulo(id))[fn];
    assert.equal(banco.length, total, `${id}: banco`);
    const x = preparar(conSemilla(5));
    assert.equal(x.length, partida, `${id}: partida`);
    assert.equal(new Set(x.map((e) => e.id)).size, partida, `${id}: sin repetir`);
    const ids = [1, 2, 3, 4, 5, 6].map((s) => preparar(conSemilla(s)).map((e) => e.id).join(","));
    assert.ok(new Set(ids).size > 1, `${id}: el sorteo no cambia`);
  }
});

test("los subtemas de cada ítem son de su pieza en el catálogo", () => {
  const de = (id) => new Set(HACER_T5.find((p) => p.id === id).subtemas);
  const revisa = (id, items) => { for (const it of items) { assert.ok(it.subtemas?.length, `${id}/${it.id}`); for (const s of it.subtemas) assert.ok(de(id).has(s) && T.SUBTEMAS[s], `${id}/${it.id}: ${s}`); } };
  revisa("pc26-h1-quien-aprecia", T.BANCO_H1);
  revisa("pc26-h2-empuja-curva", T.BANCO_H2);
  revisa("pc26-h3-aguja", T.BANCO_H3);
  revisa("pc26-h4-a-quien-sirve", T.BANCO_H4);
  revisa("pc26-h5-donde-ahorro", T.CASOS_H5.flatMap((c) => c.decisiones));
  revisa("pc26-h6-correa", T.BANCO_H6);
});

test("H1: la balanza va de a a b; cada moneda errada en coral con SU retro (con las cifras); puntaje = monedas bien / 10", async () => {
  const { prepararH1 } = await modulo("pc26-h1-quien-aprecia");
  const items = prepararH1(conSemilla(4));
  let res = null;
  const m = await montar(await cargar("pc26-h1-quien-aprecia"), { rng: conSemilla(4), onTerminar: (r) => { res = r; } });
  for (let n = 0; n < items.length; n += 1) {
    const q = items[n];
    assert.equal(m.q("[data-item]").dataset.item, q.id);
    await esperar(500);
    assert.equal(Number(m.q("[data-balanza]").dataset.tc), q.b, `${q.id}: la balanza llega a b`);
    assert.equal(m.q("[data-revisar]").disabled, true);
    const peso = n === 0 ? (q.correctas.peso === "aprecia" ? "deprecia" : "aprecia") : q.correctas.peso;
    await m.clic(`[data-moneda="peso"] [data-opcion="${peso}"]`);
    await m.clic(`[data-moneda="dolar"] [data-opcion="${q.correctas.dolar}"]`);
    await m.clic("[data-revisar]");
    if (n === 0) {
      assert.equal(m.q(`[data-moneda="peso"] [data-opcion="${peso}"]`).dataset.estado, "mal");
      assert.ok(m.q('[data-retro-moneda="peso"]').textContent.startsWith("De "), "la retro lleva las cifras");
      assert.equal(m.q('[data-retro-moneda="dolar"]'), null);
      assert.ok(m.q('[data-moneda="dolar"]').textContent.includes("✓"));
    } else {
      assert.ok(!tieneCoral(sinEstilos(m.el)), `${q.id}: todo bien, sin coral`);
    }
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 10);
  assert.ok(res.detalle.every((d) => /^q\d-(peso|dolar)$/.test(d.item)));
  assert.equal(res.pct, 90);
  await m.desmontar();
});

test("H2: se empuja la curva con el teclado; curva y dirección, cada una con su retro; revelar mueve la correcta y muestra la causa; puntaje / 12", async () => {
  const { prepararH2 } = await modulo("pc26-h2-empuja-curva");
  const sucesos = prepararH2(conSemilla(2));
  let res = null;
  const m = await montar(await cargar("pc26-h2-empuja-curva"), { rng: conSemilla(2), onTerminar: (r) => { res = r; } });
  for (let n = 0; n < sucesos.length; n += 1) {
    const s = sucesos[n];
    assert.equal(m.q("[data-suceso]").dataset.suceso, s.id);
    assert.equal(m.q("[data-revelar]").disabled, true, "sin empujar no se revela");
    /* Ronda 0: la curva equivocada; ronda 1: la curva bien, la dirección mal. */
    const curva = n === 0 ? (s.curva === "oferta" ? "demanda" : "oferta") : s.curva;
    const dir = n === 1 ? (s.direccion === "derecha" ? "izquierda" : "derecha") : s.direccion;
    await m.tecla(`[data-asa="${curva}"]`, dir === "derecha" ? "ArrowRight" : "ArrowLeft");
    assert.equal(m.q("[data-figura]").dataset.respuesta, `${curva}-${dir}`);
    await m.clic("[data-revelar]");
    const r = (await modulo("pc26-h2-empuja-curva")).reveladoH2(s);
    assert.equal(Number(m.q("[data-grafica-divisas]").dataset.so), r.so);
    assert.equal(Number(m.q("[data-grafica-divisas]").dataset.sd), r.sd);
    assert.ok(m.q(`[data-causa="${s.id}"]`), "la causa aparece al revelar");
    if (n === 0) {
      assert.equal(m.q("[data-retro-curva]").textContent, s.retroCurva);
      assert.ok(m.q("[data-tc-revelado]"));
    } else if (n === 1) {
      assert.equal(m.q("[data-retro-curva]"), null);
      assert.equal(m.q("[data-retro-direccion]").textContent, s.retroDireccion);
    } else {
      assert.ok(!tieneCoral(sinEstilos(m.el)), `${s.id}: bien, sin coral`);
    }
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 12);
  const bien = res.detalle.filter((d) => d.ok).length;
  assert.equal(res.pct, Math.round((bien / 12) * 100));
  assert.equal(bien, 10, "ronda 0 falla la curva y ronda 1 la dirección");
  await m.desmontar();
});

test("H2: el inversionista nunca va con la tableta, y el deudor solo como quien paga su deuda", () => {
  for (const s of T.BANCO_H2) {
    if (s.causa.mascota === "inversionista") assert.notEqual(s.causa.pose, "tableta", s.id);
    if (s.causa.mascota === "deudor-externo") assert.equal(s.id, "deuda");
  }
});

/* Lleva la aguja con el teclado desde «sin marcar» hasta v (pasos de 0,5). */
async function aguja(m, v) {
  if (v === 0) { await m.tecla("[data-dial]", "ArrowRight"); await m.tecla("[data-dial]", "ArrowLeft"); return; }
  const k = v > 0 ? "ArrowRight" : "ArrowLeft";
  for (let i = 0; i < Math.abs(v) / 0.5; i += 1) await m.tecla("[data-dial]", k);
}

test("H3: la aguja empieza vacía; signo invertido, olvido del nominal y otro error tienen su retro; el exportador; puntaje / 8", async () => {
  const { prepararH3 } = await modulo("pc26-h3-aguja");
  const rondas = prepararH3(conSemilla(7));
  let res = null;
  const m = await montar(await cargar("pc26-h3-aguja"), { rng: conSemilla(7), onTerminar: (r) => { res = r; } });
  assert.ok(m.q('[data-mascota-rol="exportadora-flores"]') && alto(m.q('[data-mascota-rol="exportadora-flores"]')) >= 120);
  for (let n = 0; n < rondas.length; n += 1) {
    const r = rondas[n];
    assert.equal(m.q("[data-ronda]").dataset.ronda, r.id);
    assert.equal(m.q("[data-dial]").dataset.valor, "", "sin aguja al empezar");
    /* El dial va de −6 a +6: un error que se sale queda en el tope (y es «otro»). */
    const tope = (v) => Math.max(-6, Math.min(6, v));
    const valor = tope(n === 0 ? r.aqui - r.afuera + r.nominal : n === 1 ? r.afuera - r.aqui : r.delta);
    await aguja(m, valor);
    assert.equal(Number(m.q("[data-dial]").dataset.valor), valor);
    const exp = n === 2 ? Object.keys(T.H3.opciones).find((x) => x !== r.exportador) : r.exportador;
    await m.clic(`[data-exportador="${exp}"]`);
    await m.clic("[data-revisar]");
    const juicio = m.q("[data-figura]").dataset.juicio;
    if (n === 0) {
      assert.equal(juicio, T.juzgarAguja(r, valor));
      if (juicio === "signo") assert.equal(m.q('[data-retro-aguja="signo"]').textContent, T.H3.retroSigno);
      assert.ok(m.q("[data-fantasma-aguja]"), "la aguja correcta, punteada");
    }
    if (n === 1 && juicio === "nominal") assert.equal(m.q('[data-retro-aguja="nominal"]').textContent, T.H3.retroNominal);
    if (n === 2) {
      assert.equal(juicio, "bien");
      assert.equal(m.q(`[data-exportador="${exp}"]`).dataset.estado, "mal");
      assert.equal(m.q("[data-retro-exportador]").textContent, T.H3.retroExportador[r.exportador]);
    }
    if (n === 3) assert.ok(!tieneCoral(sinEstilos(m.el)));
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 8);
  const tope = (v) => Math.max(-6, Math.min(6, v));
  const malAguja = rondas.slice(0, 2).filter((r, k) => T.juzgarAguja(r, tope(k === 0 ? r.aqui - r.afuera + r.nominal : r.afuera - r.aqui)) !== "bien").length;
  assert.equal(res.pct, Math.round(((8 - malAguja - 1) / 8) * 100));
  await m.desmontar();
});

test("H3: en r5 el signo invertido (+8) se queda en el tope del dial y aun así da la retro del signo", async () => {
  const { prepararH3 } = await modulo("pc26-h3-aguja");
  /* Se busca una semilla que arranque en r5 (no depende de un número fijo). */
  let semilla = 1;
  while (prepararH3(conSemilla(semilla))[0].id !== "r5") semilla += 1;
  const r5 = T.BANCO_H3.find((r) => r.id === "r5");
  const m = await montar(await cargar("pc26-h3-aguja"), { rng: conSemilla(semilla), onTerminar: () => {} });
  assert.equal(m.q("[data-ronda]").dataset.ronda, "r5");
  for (let i = 0; i < 20; i += 1) await m.tecla("[data-dial]", "ArrowRight");
  assert.equal(Number(m.q("[data-dial]").dataset.valor), T.TOPE_DIAL, "la aguja se queda en el tope");
  await m.clic(`[data-exportador="${r5.exportador}"]`);
  await m.clic("[data-revisar]");
  assert.equal(m.q("[data-figura]").dataset.juicio, "signo");
  assert.equal(m.q('[data-retro-aguja="signo"]').textContent, T.H3.retroSigno);
  await m.desmontar();
});

test("H4: la exportadora (recibe-billete) y la importadora (paga-billete) a 120 px; el lado equivocado da coral y la retro; reintentar no suma; puntaje / 6", async () => {
  const { prepararH4 } = await modulo("pc26-h4-a-quien-sirve");
  const noticias = prepararH4(conSemilla(8));
  let res = null;
  const m = await montar(await cargar("pc26-h4-a-quien-sirve"), { rng: conSemilla(8), onTerminar: (r) => { res = r; } });
  const exp = m.q('[data-lado="exportadora"] [data-mascota-rol]');
  const imp = m.q('[data-lado="importadora"] [data-mascota-rol]');
  assert.deepEqual([exp.dataset.mascotaRol, exp.dataset.pose], ["exportadora-flores", "recibe-billete"]);
  assert.deepEqual([imp.dataset.mascotaRol, imp.dataset.pose], ["importadora-celulares", "paga-billete"]);
  assert.ok(alto(exp) >= 120 && alto(imp) >= 120);
  for (let n = 0; n < noticias.length; n += 1) {
    const x = noticias[n];
    assert.equal(m.q("[data-noticia]").dataset.noticia, x.id);
    assert.equal(m.q("[data-siguiente]").disabled, true);
    if (n === 0) {
      const otro = x.gana === "exportadora" ? "importadora" : "exportadora";
      await m.clic(`[data-lado="${otro}"]`);
      assert.equal(m.q("[data-panuelo]").dataset.estado, "mal");
      assert.equal(m.q("[data-retro]").textContent, x.retro);
      assert.equal(m.q("[data-siguiente]").disabled, true);
      await m.clic(`[data-lado="${x.gana}"]`);
    } else if (n === 1) {
      await m.tecla("[data-panuelo]", x.gana === "exportadora" ? "ArrowLeft" : "ArrowRight");
    } else {
      await m.clic(`[data-lado="${x.gana}"]`);
    }
    assert.equal(m.q("[data-figura]").dataset.gano, x.gana);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${x.id}: al acertar se va el coral`);
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 6);
  assert.equal(res.pct, Math.round((5 / 6) * 100));
  await m.desmontar();
});

test("H5: seis decisiones fijas, cada una con su consigna; las barras muestran los pesos; la retro del error; el cierre de cada caso; puntaje / 6", async () => {
  const { resultadoH5 } = await modulo("pc26-h5-donde-ahorro");
  const decisiones = T.CASOS_H5.flatMap((c) => c.decisiones);
  let res = null;
  const m = await montar(await cargar("pc26-h5-donde-ahorro"), { onTerminar: (r) => { res = r; } });
  for (let k = 0; k < decisiones.length; k += 1) {
    const d = decisiones[k];
    assert.equal(m.q("[data-consigna]").textContent, d.consigna, `${d.id}: la consigna de la decisión`);
    assert.equal(m.q("[data-figura]").dataset.decision, d.id);
    assert.equal(m.q("[data-caso]").dataset.caso, d.caso);
    const inv = m.q('[data-mascota-rol="inversionista"]');
    assert.equal(inv.dataset.pose, d.caso === "ahorro" ? "monedas" : "ladrillo");
    assert.ok(alto(inv) >= 120);
    assert.equal(m.q('[data-barra="aqui"]').dataset.valor, "", "las barras se ven al decidir");
    const eleccion = k === 2 ? (d.correcta === "aqui" ? "afuera" : "aqui") : d.correcta;
    await m.clic(`[data-eleccion="${eleccion}"]`);
    const r = resultadoH5(d);
    assert.equal(m.q('[data-barra="aqui"]').dataset.valor, r.aqui.toFixed(1));
    assert.equal(m.q('[data-barra="afuera"]').dataset.valor, r.afuera.toFixed(1));
    if (k === 2) {
      assert.equal(m.q(`[data-eleccion="${eleccion}"]`).dataset.estado, "mal");
      assert.equal(m.q(`[data-retro-decision="${d.id}"]`).textContent, d.retro);
    } else {
      assert.ok(!tieneCoral(sinEstilos(m.el)), d.id);
    }
    const ultima = k === 2 || k === 5;
    assert.equal(Boolean(m.q("[data-cierre-caso]")), ultima, `${d.id}: cierre del caso`);
    if (ultima) assert.equal(m.q("[data-cierre-caso]").textContent, T.CASOS_H5.find((c) => c.id === d.caso).cierre);
    assert.equal(m.q("[data-siguiente]").textContent, k === 5 ? T.H5.terminar : ultima ? T.H5.siguienteCaso : T.H5.siguiente);
    await m.clic("[data-siguiente]");
  }
  assert.deepEqual(res.detalle.map((x) => x.item), decisiones.map((d) => d.id));
  assert.equal(res.pct, Math.round((5 / 6) * 100));
  await m.desmontar();
});

test("H6: cuatro correas en miniatura; la correa equivocada da coral y la retro del par; acertar reproduce la correa; puntaje del primer intento / 6", async () => {
  const { prepararH6 } = await modulo("pc26-h6-correa");
  const hechos = prepararH6(conSemilla(9));
  let res = null;
  const m = await montar(await cargar("pc26-h6-correa"), { rng: conSemilla(9), onTerminar: (r) => { res = r; } });
  assert.deepEqual([...m.el.querySelectorAll("[data-correa-destino]")].map((b) => b.dataset.correaDestino), T.REGIMENES.map((r) => r.id));
  assert.equal(m.el.querySelectorAll("[data-correa-destino] [data-correa]").length, 4);
  for (let n = 0; n < hechos.length; n += 1) {
    const x = hechos[n];
    assert.equal(m.q("[data-ficha]").dataset.ficha, x.id);
    if (n === 0) {
      const otro = T.REGIMENES.find((r) => r.id !== x.regimen).id;
      await m.clic("[data-ficha]");
      await m.clic(`[data-correa-destino="${otro}"]`);
      assert.equal(m.q("[data-ficha]").dataset.estado, "mal");
      assert.equal(m.q("[data-retro]").textContent, T.RETRO_H6[x.regimen][otro]);
      assert.equal(m.q("[data-siguiente]").disabled, true);
      await esperar(350);
    }
    await m.clic("[data-ficha]");
    await m.clic(`[data-correa-destino="${x.regimen}"]`);
    assert.ok(m.q("[data-ficha-puesta]"));
    assert.equal(m.q(`[data-correa-destino="${x.regimen}"]`).dataset.entro, "1");
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${x.id}: al acertar se va el coral`);
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 6);
  assert.equal(res.pct, Math.round((5 / 6) * 100));
  await m.desmontar();
});

test("cierre: los FP de una partida perfecta son los de la especificación (10, 25, 50, 25, 50, 25)", () => {
  const esperado = {
    "pc26-h1-quien-aprecia": 10, "pc26-h2-empuja-curva": 25, "pc26-h3-aguja": 50,
    "pc26-h4-a-quien-sirve": 25, "pc26-h5-donde-ahorro": 50, "pc26-h6-correa": 25,
  };
  for (const p of HACER_T5) {
    const partida = partidaDePrevia(p, { pct: 100, detalle: [{ item: "x", ok: true }], duracionMs: 10 * 60 * 1000 });
    assert.equal(partida.aviso.fp, esperado[p.id], p.id);
  }
});

/* ─── La migración de las 6 Hacer ─── */
const { filasDeCatalogo, revisar } = await import("../../../scripts/guardian-migraciones.mjs");
const RUTA_0274 = "supabase/migrations/0274_pc26_t5_politica_cambiaria.sql";

test("migración 0274: las 6 Hacer con la clasificación del catálogo, y el guardián no la reprocharía", () => {
  const sql = readFileSync(RUTA_0274, "utf8");
  const filas = filasDeCatalogo(sql);
  assert.equal(filas.length, 6);
  const cliente = new Map(HACER_T5.map((a) => [a.id, {
    activity_id: a.id, subject_id: "macroeconomia", topic_id: "politica-cambiaria",
    modalidad: a.clasificacion.modalidad, dificultad: a.clasificacion.dificultad, fp_base: a.clasificacion.fpBase,
  }]));
  for (const f of filas) {
    const a = HACER_T5.find((x) => x.id === f.activity_id);
    assert.ok(a, f.activity_id);
    assert.equal(f.etapas, 1, f.activity_id);
    assert.equal(f.fp_base, a.clasificacion.fpBase, f.activity_id);
    assert.equal(f.topic_id, "politica-cambiaria", f.activity_id);
  }
  assert.deepEqual(revisar([{ nombre: "0274_pc26_t5_politica_cambiaria.sql", sql }], cliente), []);
});
