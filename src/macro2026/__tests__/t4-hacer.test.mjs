/*
 * Macro 2026 · T4: las seis Hacer montadas de verdad (jsdom). Se juega como
 * el estudiante, con tocar-tocar y teclado, que es lo mismo que usan el
 * lector de pantalla y las asas; el arrastre lo mide el video. Se comprueba:
 * - la retro de ESA respuesta;
 * - el coral solo en el error;
 * - el sorteo;
 * - el puntaje;
 * - los subtemas de cada ítem;
 * - el FP y la migración 0273.
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
const T = await import("../politica-monetaria/textos.js");
const { HACER_T4 } = await import("../politica-monetaria/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "pm26-h1-entra-sale": "H1EntraSale", "pm26-h2-cascada-meta": "H2CascadaMeta", "pm26-h3-cajas": "H3Cajas",
  "pm26-h4-mueve-tasa": "H4MueveTasa", "pm26-h6-domino": "H6Domino", "pm26-h5-junta": "H5Junta",
};
const modulo = (id) => import(`../politica-monetaria/${MODULOS[id]}.jsx`);
const cargar = async (id) => (await modulo(id)).default;
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
  const deslizar = async (id, v) => {
    await act(async () => {
      const r = q(`#da26-${id}`);
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(r, String(v));
      r.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
  };
  return { el, q, clic, tecla, deslizar, desmontar: () => act(async () => raiz.unmount()) };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);

test("las 6 Hacer montan, con su consigna (≤ 12 palabras) y figura, y sin coral antes de cualquier error", async () => {
  assert.equal(HACER_T4.length, 6);
  for (const p of HACER_T4) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(3) });
    if (p.id === "pm26-h5-junta") {
      /* Rediseño lote 3: el aviso es el contexto de la tarjeta de inicio (escenas.test.mjs);
         en la ronda, la autoridad va en la franja con el timón. */
      assert.equal(m.q('[data-escenario] [data-mascota-rol="autoridad-economica"]').dataset.pose, "timon");
    }
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.equal(m.q("[data-consigna]").textContent, T.CONSIGNAS[p.id], `${p.id}: consigna`);
    assert.ok(palabras(T.CONSIGNAS[p.id]) <= 12, `${p.id}: consigna ≤ 12`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
});

test("todas las reglas de estilo con coral de las Hacer T4 son de error", async () => {
  const hojas = [CSS_DA];
  for (const p of HACER_T4) {
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

test("sorteo: H1 6 de 9, H3 7 de 9, H4 5 de 7, H6 2 de 3 revueltas, H5 las 3 barajadas; y cambia con la semilla", async () => {
  const casos = [
    ["pm26-h1-entra-sale", "prepararH1", T.BANCO_H1, 9, 6],
    ["pm26-h3-cajas", "prepararH3", T.BANCO_H3, 9, 7],
    ["pm26-h4-mueve-tasa", "prepararH4", T.BANCO_H4, 7, 5],
    ["pm26-h6-domino", "prepararH6", T.BANCO_H6, 3, 2],
    ["pm26-h5-junta", "prepararH5", T.RONDAS_H5, 3, 3],
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
  const { prepararH6, primeraFuera } = await modulo("pm26-h6-domino");
  for (let s = 1; s <= 40; s += 1) for (const c of prepararH6(conSemilla(s))) assert.notEqual(primeraFuera(c.revuelta), -1, `semilla ${s}: ya ordenada`);
});

/*
 * Cada ítem lleva los subtemas que Gen le da en §2. En H6 cada cadena lleva
 * los suyos (la del encaje es de instrumentos y creación secundaria), y el
 * catálogo de H6 los recoge todos (construccion-t4.md, decisión 2).
 */
test("los subtemas de cada ítem son de su pieza en el catálogo", () => {
  const de = (id) => new Set(HACER_T4.find((p) => p.id === id).subtemas);
  const revisa = (id, items) => { for (const it of items) { assert.ok(it.subtemas?.length, `${id}/${it.id}`); for (const s of it.subtemas) assert.ok(de(id).has(s) && T.SUBTEMAS[s], `${id}/${it.id}: ${s}`); } };
  revisa("pm26-h1-entra-sale", T.BANCO_H1);
  revisa("pm26-h2-cascada-meta", T.ETAPAS_H2);
  revisa("pm26-h3-cajas", T.BANCO_H3);
  revisa("pm26-h4-mueve-tasa", T.BANCO_H4);
  revisa("pm26-h6-domino", T.BANCO_H6);
  revisa("pm26-h5-junta", T.RONDAS_H5);
});

const vecesHasta = (f) => T.ORDEN_FLECHAS.indexOf(f) + 1;

test("H1: cada medidor errado se pinta coral con SU retro; los bien llevan ✓; puntaje = medidores bien / 18", async () => {
  let res = null;
  const { prepararH1 } = await modulo("pm26-h1-entra-sale");
  const ops = prepararH1(conSemilla(7));
  const m = await montar(await cargar("pm26-h1-entra-sale"), { rng: conSemilla(7), onTerminar: (r) => { res = r; } });
  for (let n = 0; n < ops.length; n += 1) {
    const op = ops[n];
    assert.equal(m.q("[data-operacion]").dataset.operacion, op.id);
    assert.equal(m.q("[data-revelar]").disabled, true, "sin las tres flechas no se revela");
    /* En la primera operación se yerra a propósito el medidor de la BM. */
    for (const med of T.MEDIDORES_H1) {
      let meta = op.correctas[med.id];
      if (n === 0 && med.id === "bm") meta = T.ORDEN_FLECHAS.find((f) => f !== meta);
      for (let k = 0; k < vecesHasta(meta); k += 1) await m.clic(`[data-flecha="${med.id}"]`);
    }
    assert.ok(!tieneCoral(sinEstilos(m.el)));
    await m.clic("[data-revelar]");
    if (n === 0) {
      assert.equal(m.q('[data-medidor="bm"]').dataset.estado, "mal");
      assert.equal(m.q('[data-retro-medidor="bm"]').textContent, op.retro.bm);
      assert.equal(m.el.querySelectorAll("[data-retro-medidor]").length, 1);
      assert.equal(m.q('[data-medidor="m2"]').dataset.estado, "bien");
    } else {
      assert.ok(!tieneCoral(sinEstilos(m.el)), `${op.id}: todo bien, sin coral`);
    }
    assert.equal(m.q("[data-flecha]").disabled, true);
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 18);
  assert.equal(res.pct, Math.round((17 / 18) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.length));
  await m.desmontar();
});

test("H2: arriba o abajo de la meta da su retro; dos fallos, la pista; tres, el deslizador va solo a la solución; cierre y puntaje / 3", async () => {
  const { juzgarH2 } = await modulo("pm26-h2-cascada-meta");
  const [e1, e2, e3] = T.ETAPAS_H2;
  assert.equal(juzgarH2(e1, 10), "arriba");
  assert.equal(juzgarH2(e1, 30), "abajo");
  assert.equal(juzgarH2(e1, 20), "bien");
  let res = null;
  const m = await montar(await cargar("pm26-h2-cascada-meta"), { onTerminar: (r) => { res = r; } });
  assert.equal(m.q("[data-meta]").dataset.meta, String(e1.meta));
  await m.deslizar("encaje-h2", e1.solucion);
  assert.equal(m.q("[data-total]").dataset.total, String(e1.meta));
  await m.clic("[data-fijar]");
  assert.ok(!tieneCoral(sinEstilos(m.el)), "bien a la primera: sin coral");
  await m.clic("[data-siguiente]");
  /* Etapa 2: tres fallos. */
  await m.deslizar("encaje-h2", 30);
  await m.clic("[data-fijar]");
  assert.ok(m.el.textContent.includes(e2.retroAbajo));
  assert.equal(m.q("[data-pista]"), null);
  await m.deslizar("encaje-h2", 5);
  await m.clic("[data-fijar]");
  assert.ok(m.el.textContent.includes(e2.retroArriba));
  assert.equal(m.q("[data-pista]").textContent, e2.pista);
  await m.deslizar("encaje-h2", 20);
  await m.clic("[data-fijar]");
  await esperar(800);
  assert.equal(m.q("#da26-encaje-h2").value, String(e2.solucion), "va sola a la solución");
  assert.equal(m.q("#da26-encaje-h2").disabled, true);
  await m.clic("[data-siguiente]");
  await m.deslizar("encaje-h2", e3.solucion);
  await m.clic("[data-fijar]");
  await m.clic("[data-siguiente]");
  assert.ok(m.q("[data-cierre-h2]").textContent.includes(T.H2.cierre));
  assert.equal(res, null, "el cierre espera a Terminar");
  await m.clic("[data-siguiente]");
  assert.deepEqual(res.detalle.map((d) => d.ok), [true, false, true]);
  assert.equal(res.pct, 67);
  await m.desmontar();
});

test("H3: cada ficha a su caja; la caja equivocada da la retro de ESA caja y coral; reintentar no suma; puntaje / 7", async () => {
  let res = null;
  const { prepararH3 } = await modulo("pm26-h3-cajas");
  const fichas = prepararH3(conSemilla(4));
  const m = await montar(await cargar("pm26-h3-cajas"), { rng: conSemilla(4), onTerminar: (r) => { res = r; } });
  const caja = (id) => (id === "bm" || id === "no" ? `[aria-label="Llevar a ${T.CAJAS_H3.find((c) => c.id === id).nombre}"]` : `[data-caja="${id}"]`);
  for (let n = 0; n < fichas.length; n += 1) {
    const f = fichas[n];
    assert.equal(m.q("[data-ficha]").dataset.ficha, f.id);
    if (n === 0) {
      const otra = T.CAJAS_H3.find((c) => c.id !== f.correcta).id;
      await m.clic(`[data-ficha="${f.id}"]`);
      await m.clic(caja(otra));
      assert.ok(m.el.textContent.includes(f.retro[otra]), "la retro de esa caja");
      assert.equal(m.q("[data-ficha]").dataset.estado, "mal");
      await esperar(350);
      assert.equal(m.q("[data-ficha]").dataset.estado, undefined, "el coral dura 300 ms");
      assert.equal(m.q("[data-siguiente]").disabled, true);
    }
    await m.clic(`[data-ficha="${f.id}"]`);
    await m.clic(caja(f.correcta));
    assert.ok(m.q("[data-ficha-puesta]"));
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 7);
  assert.equal(res.pct, Math.round((6 / 7) * 100));
  await m.desmontar();
});

test("H4: la curva que más se mueve es la respuesta; curva y dirección, cada una con su retro; revelar mueve la correcta; puntaje / 10", async () => {
  const { leerRespuesta, revelado, prepararH4 } = await modulo("pm26-h4-mueve-tasa");
  assert.equal(leerRespuesta(2, 3), null, "menos del umbral no cuenta");
  assert.deepEqual(leerRespuesta(10, -3), { curva: "oferta", direccion: "derecha" });
  assert.deepEqual(leerRespuesta(2, -8), { curva: "demanda", direccion: "izquierda" });
  for (const s of T.BANCO_H4) {
    const r = revelado(s);
    const i = T.tasaEquilibrio({ ...T.MODELO_DINERO, ...r });
    assert.equal(i > T.tasaEquilibrio(T.MODELO_DINERO) ? "sube" : "baja", s.tasa, `${s.id}: la tasa que dice el modelo`);
  }
  let res = null;
  const sucesos = prepararH4(conSemilla(2));
  const m = await montar(await cargar("pm26-h4-mueve-tasa"), { rng: conSemilla(2), onTerminar: (r) => { res = r; } });
  for (let n = 0; n < sucesos.length; n += 1) {
    const s = sucesos[n];
    assert.equal(m.q("[data-suceso]").dataset.suceso, s.id);
    assert.equal(m.q("[data-revelar]").disabled, true);
    /* El primero se mueve la otra curva, en la dirección contraria. */
    const curva = n === 0 ? (s.curva === "oferta" ? "demanda" : "oferta") : s.curva;
    const dir = n === 0 ? (s.direccion === "derecha" ? "izquierda" : "derecha") : s.direccion;
    await m.tecla(`[data-asa="${curva}"]`, dir === "derecha" ? "ArrowRight" : "ArrowLeft");
    assert.equal(m.q("[data-figura]").dataset.respuesta, `${curva}-${dir}`);
    await m.clic("[data-revelar]");
    if (n === 0) {
      assert.equal(m.q("[data-retro-curva]").textContent, s.retroCurva);
      assert.equal(m.q("[data-retro-direccion]").textContent, s.retroDireccion);
      assert.ok(m.q("[data-tasa-revelada]"));
    } else {
      assert.equal(m.q("[data-retro-curva]"), null);
      assert.ok(!tieneCoral(sinEstilos(m.el)));
    }
    assert.equal(m.q("[data-asa]"), null, "revelado: las asas se van");
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 10);
  assert.equal(res.pct, 80);
  await m.desmontar();
});

/* Ordena con intercambios tocando dos fichas, como el estudiante. */
async function ordenar(m, cadena) {
  const ordenDe = (id) => cadena.fichas.find((f) => f.id === id).orden;
  for (let i = 0; i < cadena.fichas.length; i += 1) {
    const ids = [...m.el.querySelectorAll("[data-ficha]")].map((b) => b.dataset.ficha);
    const j = ids.findIndex((id) => ordenDe(id) === i);
    if (j === i) continue;
    await m.clic(`[data-pos="${i}"]`);
    await m.clic(`[data-pos="${j}"]`);
  }
}

test("H6: la cadena revuelta se detiene en la primera ficha fuera de lugar (coral + su retro); ordenada, caen todas; puntaje del primer empujón", async () => {
  const { prepararH6, primeraFuera, CAIDA_MS } = await modulo("pm26-h6-domino");
  const cadenas = prepararH6(conSemilla(9));
  let res = null;
  const m = await montar(await cargar("pm26-h6-domino"), { rng: conSemilla(9), onTerminar: (r) => { res = r; } });
  /* Primera cadena: empuja revuelta. */
  const c0 = cadenas[0];
  const fuera = primeraFuera(c0.revuelta);
  const bienAlPrimero = c0.revuelta.filter((f, i) => f.orden === i).length;
  await m.clic("[data-empujar]");
  await esperar((fuera + 2) * CAIDA_MS);
  const parada = m.q(`[data-pos="${fuera}"]`);
  assert.equal(parada.dataset.estado, "mal");
  assert.ok(m.el.textContent.includes(c0.revuelta[fuera].retro), "la retro de la ficha fuera de lugar");
  assert.equal(m.el.querySelectorAll('[data-cae="1"]').length, fuera, "caen las de antes");
  await ordenar(m, c0);
  assert.ok(!tieneCoral(sinEstilos(m.el)), "al cambiar el orden se quita el coral");
  await m.clic("[data-empujar]");
  await esperar((c0.fichas.length + 2) * CAIDA_MS);
  assert.equal(m.el.querySelectorAll('[data-cae="1"]').length, c0.fichas.length);
  await m.clic("[data-siguiente]");
  /* Segunda cadena: ordenada a la primera. */
  await ordenar(m, cadenas[1]);
  await m.clic("[data-empujar]");
  await esperar((cadenas[1].fichas.length + 2) * CAIDA_MS);
  assert.ok(!tieneCoral(sinEstilos(m.el)));
  await m.clic("[data-siguiente]");
  const total = c0.fichas.length + cadenas[1].fichas.length;
  assert.equal(res.detalle.length, total, "solo cuenta el primer empujón");
  assert.equal(res.pct, Math.round(((bienAlPrimero + cadenas[1].fichas.length) / total) * 100));
  await m.desmontar();
});

test("H5: palanca errada en coral con su retro, las bien con ✓; todo bien y el termómetro va a la banda tras el rezago; puntaje / 9", async () => {
  const { prepararH5, REZAGO_H5_MS } = await modulo("pm26-h5-junta");
  const rondas = prepararH5(conSemilla(6));
  let res = null;
  const m = await montar(await cargar("pm26-h5-junta"), { rng: conSemilla(6), onTerminar: (r) => { res = r; } });
  for (let n = 0; n < rondas.length; n += 1) {
    const r = rondas[n];
    assert.equal(m.q("[data-ronda]").dataset.ronda, r.id);
    assert.equal(m.q("[data-lectura]").textContent, r.lectura);
    assert.equal(m.q("[data-decidir]").disabled, true);
    for (const p of T.PALANCAS) {
      let x = r.correctas[p.id];
      if (n === 0 && p.id === "encaje") x = T.ORDEN_POSICIONES.find((y) => y !== x);
      await m.clic(`[data-palanca="${p.id}"] [data-pos="${x}"]`);
    }
    await m.clic("[data-decidir]");
    if (n === 0) {
      assert.equal(m.q('[data-palanca="encaje"]').dataset.estado, "mal");
      assert.equal(m.q('[data-retro-palanca="encaje"]').textContent, r.retro.encaje);
      assert.ok(m.q('[data-palanca="tasa"] [data-palanca-bien]'));
    } else {
      assert.ok(!tieneCoral(sinEstilos(m.el)));
      assert.equal(m.el.querySelectorAll("[data-palanca-bien]").length, 3);
      await esperar(REZAGO_H5_MS + 100);
    }
    assert.equal(m.q('[data-palanca="tasa"] [data-pos="sube"]').disabled, true);
    await m.clic("[data-siguiente]");
  }
  assert.equal(res.detalle.length, 9);
  assert.equal(res.pct, Math.round((8 / 9) * 100));
  await m.desmontar();
});

test("cierre: los FP de una partida perfecta son los de la especificación (25, 10 × 3, 25, 25, 25, 50)", () => {
  const esperado = {
    "pm26-h1-entra-sale": 25, "pm26-h2-cascada-meta": 30, "pm26-h3-cajas": 25,
    "pm26-h4-mueve-tasa": 25, "pm26-h6-domino": 25, "pm26-h5-junta": 50,
  };
  for (const p of HACER_T4) {
    const partida = partidaDePrevia(p, { pct: 100, detalle: [{ item: "x", ok: true }], duracionMs: 10 * 60 * 1000 });
    assert.equal(partida.aviso.fp, esperado[p.id], p.id);
  }
});

/* ─── La migración de las 6 Hacer ─── */
const { filasDeCatalogo, revisar } = await import("../../../scripts/guardian-migraciones.mjs");
const RUTA_0273 = "supabase/migrations/0273_pm26_t4_politica_monetaria.sql";

test("migración 0273: las 6 Hacer con la clasificación del catálogo, y el guardián no la reprocharía", () => {
  const sql = readFileSync(RUTA_0273, "utf8");
  const filas = filasDeCatalogo(sql);
  assert.equal(filas.length, 6);
  const cliente = new Map(HACER_T4.map((a) => [a.id, {
    activity_id: a.id, subject_id: "macroeconomia", topic_id: "politica-monetaria",
    modalidad: a.clasificacion.modalidad, dificultad: a.clasificacion.dificultad, fp_base: a.clasificacion.fpBase,
  }]));
  for (const f of filas) {
    const a = HACER_T4.find((x) => x.id === f.activity_id);
    assert.ok(a, f.activity_id);
    assert.equal(f.etapas, a.clasificacion.etapas ?? 1, f.activity_id);
    assert.equal(f.fp_base, a.clasificacion.fpBase, f.activity_id);
  }
  assert.deepEqual(revisar([{ nombre: "0273_pm26_t4_politica_monetaria.sql", sql }], cliente), []);
  /* La que tiene etapas va en etapas_test.sql. */
  const etapas = readFileSync("supabase/tests/etapas_test.sql", "utf8");
  for (const a of HACER_T4.filter((x) => x.clasificacion.etapas > 1)) assert.ok(etapas.includes(a.id), a.id);
});
