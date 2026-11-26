/*
 * Macro 2026 · T3: las seis Hacer montadas de verdad (jsdom). Se juega como
 * el estudiante, con tocar-tocar, que es lo mismo que usan el teclado y el
 * lector de pantalla; el arrastre lo mide el video. Se comprueba:
 * - la retro de ESE destino;
 * - el coral solo en el error;
 * - el sorteo;
 * - el puntaje al primer intento;
 * - los subtemas de cada ítem;
 * - el FP y la migración 0272.
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
const T = await import("../politica-fiscal/textos.js");
const { sumable, pesos } = await import("../politica-fiscal/H3Factura.jsx");
const { HACER_T3 } = await import("../politica-fiscal/catalogo.js");
const { partidaDePrevia } = await import("../VistaPrevia.jsx");

const MODULOS = {
  "pf26-h1-moneda": "H1Moneda", "pf26-h2-cajero": "H2Cajero", "pf26-h3-factura": "H3Factura",
  "pf26-h5-montanas": "H5Montanas", "pf26-h4-expande": "H4Expande", "pf26-h6-memo": "H6Memo",
};
const modulo = (id) => import(`../politica-fiscal/${MODULOS[id]}.jsx`);
const cargar = async (id) => (await modulo(id)).default;
const palabras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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
  return { el, q, clic, desmontar: () => act(async () => raiz.unmount()) };
}

const sinEstilos = (el) => el.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
const tieneCoral = (html) => html.toLowerCase().includes(CORAL.toLowerCase()) || /data-estado="mal"/.test(html);
const SUBTEMAS = new Set(HACER_T3.flatMap((p) => p.subtemas));

test("las 6 Hacer montan, con su consigna (≤ 12 palabras) y figura, y sin coral antes de cualquier error", async () => {
  assert.equal(HACER_T3.length, 6);
  for (const p of HACER_T3) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(3) });
    assert.ok(m.q("[data-figura]"), `${p.id}: data-figura`);
    assert.equal(m.q("[data-consigna]").textContent, T.CONSIGNAS[p.id], `${p.id}: consigna`);
    assert.ok(palabras(T.CONSIGNAS[p.id]) <= 12, `${p.id}: consigna ≤ 12`);
    assert.ok(!tieneCoral(sinEstilos(m.el)), `${p.id}: coral sin error`);
    await m.desmontar();
  }
  for (const r of T.H5.retos) assert.ok(palabras(r.consigna) <= 12, `H5 ${r.id}: ≤ 12`);
});

test("todas las reglas de estilo con coral de las Hacer T3 son de error", async () => {
  const hojas = [CSS_DA];
  for (const p of HACER_T3) {
    const m = await montar(await cargar(p.id), { onTerminar: () => {}, rng: conSemilla(1) });
    m.el.querySelectorAll("style").forEach((s) => hojas.push(s.textContent));
    await m.desmontar();
  }
  for (const hoja of hojas) {
    for (const regla of hoja.split("}")) {
      if (!regla.toLowerCase().includes(CORAL.toLowerCase())) continue;
      assert.ok(/data-estado="mal"|marca-mal/.test(regla.split("{")[0]), `coral fuera de error: ${regla.split("{")[0].trim()}`);
    }
  }
});

test("sorteo: H1 8 de 11, H2 8 de 12, H3 3 de 4, H4 8 de 10, H6 4 de 5; y cambia con la semilla", async () => {
  const casos = [
    ["pf26-h1-moneda", "prepararH1", T.BANCO_H1, 11, 8],
    ["pf26-h2-cajero", "prepararH2", T.BANCO_H2, 12, 8],
    ["pf26-h3-factura", "prepararH3", T.DOCUMENTOS_H3, 4, 3],
    ["pf26-h4-expande", "prepararH4", T.BANCO_H4, 10, 8],
    ["pf26-h6-memo", "prepararH6", T.BANCO_H6, 5, 4],
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
  /* H6 baraja además las frases de cada memo; cada memo tiene exactamente una falsa. */
  for (const memo of T.BANCO_H6) assert.equal(memo.frases.filter((f) => f.falsa).length, 1, memo.id);
});

/*
 * Cada ítem lleva los subtemas que Gen le da en §2; casi siempre son los de su
 * pieza, salvo en H6, donde el memo 3 es de deuda y el 5 de instrumentos (§2 H6).
 */
const EXTRA = { "pf26-h6-memo": ["pf-deuda-casos", "pf-instrumentos"] };
test("los subtemas de cada ítem son de su pieza en el catálogo (o la excepción de §2)", () => {
  const de = (id) => new Set([...HACER_T3.find((p) => p.id === id).subtemas, ...(EXTRA[id] ?? [])]);
  const revisa = (id, items) => { for (const it of items) { assert.ok(it.subtemas?.length, `${id}/${it.id}`); for (const s of it.subtemas) assert.ok(de(id).has(s), `${id}/${it.id}: ${s}`); } };
  revisa("pf26-h1-moneda", T.BANCO_H1);
  revisa("pf26-h2-cajero", T.BANCO_H2);
  revisa("pf26-h3-factura", T.DOCUMENTOS_H3.flatMap((d) => d.lineas));
  revisa("pf26-h5-montanas", T.H5.retos);
  revisa("pf26-h4-expande", T.BANCO_H4);
  revisa("pf26-h6-memo", T.BANCO_H6);
  for (const s of SUBTEMAS) assert.match(s, /^p[ef]-/);
});

test("H1: el buzón equivocado da la retro de ESE buzón y coral 300 ms; dos fallos y entra sola; puntaje / 8", async () => {
  const C = await cargar("pf26-h1-moneda");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(9) });
  for (let k = 0; k < 8; k += 1) {
    const t = T.BANCO_H1.find((e) => e.id === m.q("[data-moneda]").dataset.moneda);
    if (k === 0) {
      const malos = ["impuesto", "tasa", "contribucion"].filter((b) => b !== t.correcta);
      await m.clic(`[data-buzon="${malos[0]}"]`);
      assert.ok(m.el.textContent.includes(t.retro[malos[0]]), "retro de ese buzón");
      assert.equal(m.q("[data-moneda]").dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.q("[data-moneda]").dataset.estado, undefined, "el coral dura 300 ms");
      await m.clic(`[data-buzon="${malos[1]}"]`);
      assert.ok(m.el.textContent.includes(t.retro[malos[1]]));
      assert.ok(m.q("[data-pago-echado]"), "al segundo fallo la moneda entra sola");
      assert.equal(m.q("[data-escena]").dataset.escena, t.correcta);
    } else {
      await m.clic(`[data-buzon="${t.correcta}"]`);
      assert.equal(m.q("[data-escena]").dataset.escena, t.correcta);
    }
    await m.clic("[data-siguiente]");
  }
  assert.ok(res, "terminó");
  assert.equal(res.detalle.length, 8);
  assert.equal(res.pct, Math.round((7 / 8) * 100));
  assert.ok(res.detalle.every((d) => d.subtemas.length));
  await m.desmontar();
});

test("H2: el cajero equivocado da la retro y coral; las flechas del teclado eligen; puntaje / 8", async () => {
  const C = await cargar("pf26-h2-cajero");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(2) });
  for (let k = 0; k < 8; k += 1) {
    const t = T.BANCO_H2.find((e) => e.id === m.q("[data-tarjeta]").dataset.tarjeta);
    const otro = t.correcta === "directo" ? "indirecto" : "directo";
    if (k === 0) {
      await m.clic(`[data-cajero="${otro}"]`);
      assert.ok(m.el.textContent.includes(t.retro));
      assert.equal(m.q("[data-tarjeta]").dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.q("[data-tarjeta]").dataset.estado, undefined);
    }
    if (k === 1) {
      await act(async () => {
        m.q("[data-tarjeta]").dispatchEvent(new w.KeyboardEvent("keydown", { key: t.correcta === "directo" ? "ArrowLeft" : "ArrowRight", bubbles: true }));
      });
    } else {
      await m.clic(`[data-cajero="${t.correcta}"]`);
    }
    assert.equal(m.q(`[data-cajero="${t.correcta}"]`).dataset.recibe, "1");
    assert.ok(m.q("[data-recibida]"));
    await m.clic("[data-siguiente]");
  }
  assert.ok(res);
  assert.equal(res.detalle.length, 8);
  assert.equal(res.pct, Math.round((7 / 8) * 100));
  await m.desmontar();
});

test("H3: la línea abre cinco fichas debajo; el error da la retro del par y deja reintentar; puntaje = primeras / líneas", async () => {
  const C = await cargar("pf26-h3-factura");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(4) });
  let lineas = 0;
  for (let d = 0; d < 3; d += 1) {
    const doc = T.DOCUMENTOS_H3.find((x) => x.id === m.q("[data-documento]").dataset.documento);
    /* Corrección 25-nov: cada documento trae a su cliente y su pregunta a la escena compacta. */
    assert.ok(m.q(`[data-escenario] [data-mascota-rol='${doc.cliente.id}']`), "el cliente del documento en la escena");
    assert.equal(m.q("[data-pregunta]").textContent, `${T.H3.cliente}${doc.pregunta}`);
    for (const b of T.BUZONES_H3) assert.equal(m.q(`[data-buzon="${b.id}"]`).dataset.lineas, "0", "buzones vacíos al empezar");
    for (const [i, l] of doc.lineas.entries()) {
      lineas += 1;
      await m.clic(`[data-linea="${l.id}"]`);
      assert.equal(m.el.querySelectorAll("[data-ficha]").length, 5);
      if (d === 0 && i === 0) {
        const mal = T.FICHAS_H3.find((f) => f.id !== l.clave).id;
        await m.clic(`[data-ficha="${mal}"]`);
        assert.ok(m.el.textContent.includes(T.RETRO_H3[l.clave][mal]), "retro del par");
        assert.equal(m.q(`[data-linea="${l.id}"]`).dataset.estado, "mal");
        assert.equal(m.el.querySelectorAll("[data-ficha]").length, 5, "queda abierta");
        await act(async () => { await espera(350); });
        assert.equal(m.q(`[data-linea="${l.id}"]`).dataset.estado, undefined);
      }
      await m.clic(`[data-ficha="${l.clave}"]`);
      assert.equal(m.q(`[data-linea="${l.id}"]`).dataset.hecha, "1");
    }
    for (const b of T.BUZONES_H3) {
      const n = doc.lineas.filter((l) => b.claves.includes(l.clave)).length;
      assert.equal(m.q(`[data-buzon="${b.id}"]`).dataset.lineas, String(n), `cada tributo cae en su buzón (${b.id})`);
    }
    if (sumable(doc)) {
      const tributos = doc.lineas.filter((l) => l.clave !== "no").reduce((a, l) => a + pesos(l.monto), 0);
      assert.equal(m.q("[data-sumados]").dataset.sumados, String(tributos), "la suma de tributos en pesos");
    }
    await m.clic("[data-siguiente]");
  }
  assert.ok(res);
  assert.equal(res.detalle.length, lineas);
  assert.equal(res.pct, Math.round(((lineas - 1) / lineas) * 100));
  await m.desmontar();
});

test("H5: cinco retos; el que falla da su retro, se reintenta y ya no suma; puntaje / 5", async () => {
  const C = await cargar("pf26-h5-montanas");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(1) });
  const [division, acreedores, papel, cubeta, cables] = T.H5.retos;
  /* 1 · división: primero corta (falla), luego 840. */
  const mover = async (v) => act(async () => {
    const r = m.q("#da26-h5-division");
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(r, String(v));
    r.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  await mover(500);
  await m.clic("[data-comprobar]");
  assert.ok(m.el.textContent.includes(division.retroBajo));
  await mover(840);
  await m.clic("[data-comprobar]");
  assert.equal(m.q('[data-montana="interna"]').dataset.valor, "840");
  await m.clic("[data-siguiente]");
  /* 2 · acreedores, todos bien. */
  for (const b of acreedores.banderas) {
    await m.clic(`[data-bandera="${b.id}"]`);
    await m.clic(`[data-destino-montana="${b.correcta}"]`);
  }
  assert.equal(m.q("[data-siguiente]").disabled, false);
  await m.clic("[data-siguiente]");
  /* 3 · papel. */
  await m.clic(`[data-papel="${papel.correcta}"]`);
  await m.clic("[data-siguiente]");
  /* 4 · cubeta: el destino equivocado da su retro y coral. */
  const mal = cubeta.destinos.find((d) => d.id !== cubeta.correcta).id;
  await m.clic("[data-cubeta]");
  await m.clic(`[data-destino-cubeta="${mal}"]`);
  assert.ok(m.el.textContent.includes(cubeta.retro));
  assert.equal(m.q("[data-cubeta]").dataset.estado, "mal");
  await m.clic("[data-cubeta]");
  await m.clic(`[data-destino-cubeta="${cubeta.correcta}"]`);
  await m.clic("[data-siguiente]");
  /* 5 · cables. */
  for (const c of ["interna", "externa"]) {
    await m.clic(`[data-cable="${c}"]`);
    await m.clic(`[data-toma="${cables.correcta[c]}"]`);
  }
  await m.clic("[data-siguiente]");
  assert.ok(res);
  assert.deepEqual(res.detalle.map((d) => [d.item, d.ok]), [["division", false], ["acreedores", true], ["papel", true], ["cubeta", false], ["cables", true]]);
  assert.equal(res.pct, 60);
  await m.desmontar();
});

test("H4: dos criterios por medida, cada uno con su retro; revelar mueve la balanza y, si entra por t, la lupa; puntaje / 16", async () => {
  const C = await cargar("pf26-h4-expande");
  const { modeloDe } = await modulo("pf26-h4-expande");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(6) });
  for (let k = 0; k < 8; k += 1) {
    const x = T.BANCO_H4.find((e) => e.id === m.q("[data-medida]").dataset.medida);
    assert.equal(m.q("[data-revelar]").disabled, true);
    const plato = k === 0 ? (x.plato === "expansiva" ? "contraccionista" : "expansiva") : x.plato;
    await m.clic("[data-medida]");
    await m.clic(`[data-destino="${plato}"]`);
    assert.equal(m.q("[data-plato-elegido]").dataset.platoElegido, plato);
    await m.clic(`[data-entrada="${x.entrada}"]`);
    await m.clic("[data-revelar]");
    if (k === 0) {
      assert.ok(m.q("[data-retro-plato]"), "retro del plato");
      assert.ok(m.el.textContent.includes(x.retroPlato));
      assert.ok(!m.q("[data-retro-entrada]"), "la entrada estaba bien");
    }
    assert.equal(Boolean(m.q("[data-multiplicador]")), x.termino === "t", `${x.id}: lupa solo con t`);
    assert.ok(modeloDe(x), x.id);
    await m.clic("[data-siguiente]");
  }
  assert.ok(res);
  assert.equal(res.detalle.length, 16);
  assert.equal(res.pct, Math.round((15 / 16) * 100));
  await m.desmontar();
});

test("H4: lo que revela es el modelo de T1: expansiva sube Y, contraccionista la baja", async () => {
  const { modeloDe } = await modulo("pf26-h4-expande");
  const { modelo, produccion } = await import("../comun/modelo-da.js");
  const Y0 = produccion(modelo());
  for (const x of T.BANCO_H4) {
    const Y = produccion(modeloDe(x));
    assert.ok(x.plato === "expansiva" ? Y > Y0 : Y < Y0, x.id);
  }
});

test("H6: tocar una verdadera da su retro y la marca correcta; la falsa se tacha y escribe la corrección; puntaje / 4", async () => {
  const C = await cargar("pf26-h6-memo");
  let res = null;
  const m = await montar(C, { onTerminar: (r) => { res = r; }, rng: conSemilla(8) });
  assert.ok(m.el.textContent.includes(T.H6.empresa) && m.el.textContent.includes(T.H6.firma));
  for (let k = 0; k < 4; k += 1) {
    const memo = T.BANCO_H6.find((x) => x.id === m.q("[data-memo]").dataset.memo);
    const falsa = memo.frases.find((f) => f.falsa);
    if (k === 0) {
      const buena = memo.frases.find((f) => !f.falsa);
      await m.clic(`[data-frase="${buena.id}"]`);
      assert.ok(m.el.textContent.includes(buena.retro));
      assert.equal(m.q(`[data-frase="${buena.id}"]`).dataset.estado, "mal");
      await act(async () => { await espera(350); });
      assert.equal(m.q(`[data-frase="${buena.id}"]`).dataset.estado, "bien");
      assert.equal(m.q("[data-siguiente]").disabled, true);
    }
    await m.clic(`[data-frase="${falsa.id}"]`);
    await act(async () => { await espera(750); });
    assert.equal(m.q("[data-correccion]").getAttribute("aria-label"), memo.correccion);
    assert.equal(m.q(`[data-frase="${falsa.id}"] [data-tachada]`).dataset.tachada, "1");
    await m.clic("[data-siguiente]");
  }
  assert.ok(res);
  assert.equal(res.detalle.length, 4);
  assert.equal(res.pct, 75);
  await m.desmontar();
});

test("cierre: los FP de una partida perfecta son los de la especificación (10, 10, 25 × 3, 25, 25, 50)", () => {
  const esperado = {
    "pf26-h1-moneda": 10, "pf26-h2-cajero": 10, "pf26-h3-factura": 75,
    "pf26-h5-montanas": 25, "pf26-h4-expande": 25, "pf26-h6-memo": 50,
  };
  for (const p of HACER_T3) {
    const partida = partidaDePrevia(p, { pct: 100, detalle: [{ item: "x", ok: true }], duracionMs: 10 * 60 * 1000 });
    assert.equal(partida.aviso.fp, esperado[p.id], p.id);
  }
});

/* ─── La migración de las 6 Hacer ─── */
const { filasDeCatalogo, revisar } = await import("../../../scripts/guardian-migraciones.mjs");
const RUTA_0272 = ["supabase/migrations", "supabase/macro2026-pendientes"]
  .map((d) => `${d}/0272_pf26_t3_politica_fiscal.sql`)
  .find((r) => { try { readFileSync(r); return true; } catch { return false; } });

test("migración 0272: las 6 Hacer con la clasificación del catálogo, y el guardián no la reprocharía", () => {
  const sql = readFileSync(RUTA_0272, "utf8");
  const filas = filasDeCatalogo(sql);
  assert.equal(filas.length, 6);
  const cliente = new Map(HACER_T3.map((a) => [a.id, {
    activity_id: a.id, subject_id: "macroeconomia", topic_id: "politica-fiscal",
    modalidad: a.clasificacion.modalidad, dificultad: a.clasificacion.dificultad, fp_base: a.clasificacion.fpBase,
  }]));
  for (const f of filas) {
    const a = HACER_T3.find((x) => x.id === f.activity_id);
    assert.ok(a, f.activity_id);
    assert.equal(f.etapas, a.clasificacion.etapas ?? 1, f.activity_id);
    assert.equal(f.fp_base, a.clasificacion.fpBase, f.activity_id);
  }
  assert.deepEqual(revisar([{ nombre: "0272_pf26_t3_politica_fiscal.sql", sql }], cliente), []);
});
