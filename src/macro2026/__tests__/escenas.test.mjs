/*
 * Macro 2026 · rediseño con la lista de 5 (spec de Gen 24-nov, §1): las
 * escenas. Cada pieza publicada tiene escena; tu papel ≤ 15 palabras;
 * contexto ≤ 30; mini contexto ≤ 12; la mascota existe; dos piezas seguidas
 * del mismo tema no repiten hora + lado; el texto de la franja queda en
 * contraste AA sobre los cuatro degradados. Y montadas: la escena completa
 * con la mascota a 180 px y la compacta a 120 px con su mini contexto.
 * Lote 1: T1. Lote 2: T2 (despacho) y T3 (hacienda). T4 y T5 entran en el
 * lote 3 (la prueba «todo» lo dice).
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
const { CORAL, INK, INK_2, contraste } = await import("../comun/colores-da.js");
const { MASCOTAS, INTERACCIONES } = await import("../comun/mascotas.jsx");
const { HORAS, TEMAS_ESCENA, ALTO_ESCENA, ALTO_COMPACTO } = await import("../comun/Escenario.jsx");
const { ETAPAS_H6 } = await import("../comun/modelo-da.js");
const T1 = await import("../demanda-agregada/textos.js");
const { PIEZAS_T1, PUBLICADAS_T1 } = await import("../demanda-agregada/catalogo.js");
const T2 = await import("../politica-economica/textos.js");
const { PIEZAS_T2, PUBLICADAS_T2 } = await import("../politica-economica/catalogo.js");
const T3 = await import("../politica-fiscal/textos.js");
const { PIEZAS_T3, PUBLICADAS_T3 } = await import("../politica-fiscal/catalogo.js");

/* Palabra = token con una letra o una cifra («%», «−» sueltos no cuentan). */
const palabras = (t) => t.trim().split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
/* Los mini contextos reales de cada ronda, por el campo que nombra `porRonda.texto`
   (los que vienen de un banco se miden todos). */
const CAMPOS = {
  suceso: () => T1.BANCO_H3.map((s) => s.suceso),
  titular: () => T1.BANCO_H4.map((x) => x.titular),
  contexto: () => ETAPAS_H6.map((x) => x.contexto),
  grupo: () => T2.BANCO_H2.map((g) => g.nombre),
  lectura: () => [T2.ENTRADA_H5, ...T2.PASOS_H5.flatMap((p) => p.opciones.map((o) => o.narracion))],
  pregunta: () => T3.DOCUMENTOS_H3.map((d) => d.pregunta),
  consigna: () => T3.H5.retos.map((r) => r.consigna),
};
function minis(id, e) {
  const r = e.porRonda;
  if (!r) return [];
  if (r.todas) return [r.todas];
  if (r.texto) return CAMPOS[r.texto]();
  return Object.values(r);
}

const TEMAS = [
  { nombre: "T1", tema: "plaza", piezas: PIEZAS_T1, publicadas: PUBLICADAS_T1, textos: T1, carpeta: "demanda-agregada", modulos: {
    "da26-a1-carrito": "A1Carrito", "da26-a2-vaso-renta": "A2VasoRenta", "da26-a3-columpio-tasa": "A3ColumpioTasa",
    "da26-a4-no-miran-renta": "A4NoMiranRenta", "da26-a5-bisagra-ascensor": "A5BisagraAscensor", "da26-a6-eco-multiplicador": "A6EcoMultiplicador",
    "da26-h1-llena-carrito": "H1LlenaCarrito", "da26-h2-arma-formula": "H2ArmaFormula", "da26-h3-gira-o-sube": "H3GiraOSube",
    "da26-h4-empresario": "H4Empresario", "da26-h5-libreta": "H5Libreta", "da26-h6-meta": "H6Meta",
  } },
  { nombre: "T2", tema: "despacho", piezas: PIEZAS_T2, publicadas: PUBLICADAS_T2, textos: T2, carpeta: "politica-economica", modulos: {
    "pe26-a1-mecanico": "A1Mecanico", "pe26-a2-fiebre": "A2Fiebre", "pe26-a3-problema-resuelto": "A3ProblemaResuelto",
    "pe26-a4-perillas": "A4Perillas", "pe26-a5-escalera": "A5Escalera", "pe26-h1-seis-cajones": "H1SeisCajones",
    "pe26-h2-grupo-logico": "H2GrupoLogico", "pe26-h3-cables": "H3Cables", "pe26-h4-expediente": "H4Expediente", "pe26-h5-dos-fiebres": "H5DosFiebres",
  } },
  { nombre: "T3", tema: "hacienda", piezas: PIEZAS_T3, publicadas: PUBLICADAS_T3, textos: T3, carpeta: "politica-fiscal", modulos: {
    "pf26-a1-lupa": "A1Lupa", "pf26-a2-buzones": "A2Buzones", "pf26-a3-cajeros": "A3Cajeros", "pf26-a4-tanque": "A4Tanque",
    "pf26-a5-balanza": "A5Balanza", "pf26-h1-moneda": "H1Moneda", "pf26-h2-cajero": "H2Cajero", "pf26-h3-factura": "H3Factura",
    "pf26-h4-expande": "H4Expande", "pf26-h5-montanas": "H5Montanas", "pf26-h6-memo": "H6Memo",
  } },
];

test("cada pieza publicada de T1, T2 y T3 tiene escena, con tema, hora, lado y mascota que existen", () => {
  for (const { tema, publicadas, textos } of TEMAS) {
    for (const id of publicadas) {
      const e = textos.ESCENAS[id];
      assert.ok(e, `${id}: escena`);
      assert.equal(e.tema, tema, id);
      assert.ok(TEMAS_ESCENA[e.tema] && HORAS[e.hora] && ["izq", "der"].includes(e.lado), id);
      if (e.escena) assert.ok(INTERACCIONES[e.escena], `${id}: escena ${e.escena}`);
      else {
        assert.ok(MASCOTAS[e.mascota?.id], `${id}: mascota ${e.mascota?.id}`);
        assert.ok(MASCOTAS[e.mascota.id].poses[e.mascota.pose], `${id}: pose ${e.mascota.pose}`);
      }
    }
    assert.deepEqual(Object.keys(textos.ESCENAS).sort(), [...publicadas].sort(), "ni de más ni de menos");
  }
});

test("textos: tu papel ≤ 15 palabras, contexto ≤ 30, mini contexto ≤ 12, consigna ≤ 12", () => {
  for (const { piezas, textos } of TEMAS) {
    for (const p of piezas) {
      const e = textos.ESCENAS[p.id];
      assert.ok(palabras(e.rol) <= 15, `${p.id}: rol ${palabras(e.rol)}`);
      assert.ok(palabras(e.contexto) <= 30, `${p.id}: contexto ${palabras(e.contexto)}`);
      if (p.tipo === "hacer") {
        assert.ok(palabras(textos.CONSIGNAS[p.id]) <= 12, `${p.id}: consigna`);
        const m = minis(p.id, e);
        assert.ok(m.length > 0, `${p.id}: las Hacer llevan mini contexto por ronda`);
        for (const t of m) assert.ok(palabras(t) <= 12, `${p.id}: mini «${t}» ${palabras(t)}`);
        if (e.porRonda.etiqueta) assert.ok(palabras(e.porRonda.etiqueta) <= 4, `${p.id}: etiqueta corta`);
      }
    }
  }
});

test("dos piezas seguidas del mismo tema no repiten hora + lado", () => {
  for (const { piezas, textos } of TEMAS) {
    for (let k = 1; k < piezas.length; k += 1) {
      const a = textos.ESCENAS[piezas[k - 1].id], b = textos.ESCENAS[piezas[k].id];
      if (a.tema !== b.tema) continue;
      assert.ok(a.hora !== b.hora || a.lado !== b.lado, `${piezas[k - 1].id} → ${piezas[k].id}`);
    }
  }
});

test("la analista con la gráfica que sube solo va en da26-a5, donde la DA sí crece con la renta", () => {
  for (const { textos } of TEMAS) {
    for (const [id, e] of Object.entries(textos.ESCENAS)) {
      if (e.mascota?.id === "analista" && e.mascota.pose === "grafica") assert.equal(id, "da26-a5-bisagra-ascensor");
    }
  }
});

test("contraste AA: el texto, el rótulo y el acento de la franja sobre las dos puntas de los cuatro degradados", () => {
  for (const [hora, puntas] of Object.entries(HORAS)) {
    for (const c of puntas) {
      assert.ok(contraste(INK, c) >= 4.5, `${hora} ${c}: texto ${contraste(INK, c).toFixed(2)}`);
      assert.ok(contraste(INK_2, c) >= 4.5, `${hora} ${c}: rótulo ${contraste(INK_2, c).toFixed(2)}`);
      for (const [tema, t] of Object.entries(TEMAS_ESCENA)) {
        assert.ok(contraste(t.acento, c) >= 4.5, `${hora} ${c}: acento ${tema} ${contraste(t.acento, c).toFixed(2)}`);
      }
    }
  }
  for (const t of Object.values(TEMAS_ESCENA)) assert.notEqual(t.acento.toLowerCase(), CORAL.toLowerCase());
});

/* ─── Montadas ─── */
async function montar(T, id) {
  const C = (await import(`../${T.carpeta}/${T.modulos[id]}.jsx`)).default;
  const el = document.createElement("div");
  document.body.appendChild(el);
  const raiz = createRoot(el);
  await act(async () => { raiz.render(h(C, { onTerminar: () => {}, rng: conSemilla(2) })); });
  const clic = async (sel) => { await act(async () => { el.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return { el, q: (s) => el.querySelector(s), clic, desmontar: () => act(async () => raiz.unmount()) };
}
/* Comparaciones con === null: un nodo de jsdom en el diff de assert agota la memoria. */
const altoMascota = (esc) => Number(esc.querySelector("img").getAttribute("height"));

for (const T of TEMAS) test(`Aprender ${T.nombre}: escena completa arriba en P1 (mascota 180 px, tu papel y contexto antes del texto); P2 sin escena`, async () => {
  for (const p of T.piezas.filter((x) => x.tipo === "aprender")) {
    const e = T.textos.ESCENAS[p.id];
    const m = await montar(T, p.id);
    try {
    const esc = m.q("[data-escenario]");
    assert.ok(esc, `${p.id}: escena`);
    assert.equal(esc.dataset.compacto, "0");
    assert.equal(esc.dataset.tema, T.tema);
    assert.equal(altoMascota(esc), ALTO_ESCENA, `${p.id}: mascota protagonista a 180`);
    assert.equal(m.q("[data-papel]").textContent, `TU PAPEL${e.rol}`);
    assert.equal(m.q("[data-contexto-escena]").textContent, e.contexto);
    /* La escena va antes de la figura y del texto de la pantalla. */
    const orden = esc.compareDocumentPosition(m.q("[data-texto-pantalla]"));
    assert.ok(orden & w.Node.DOCUMENT_POSITION_FOLLOWING, `${p.id}: la escena va antes`);
    assert.ok(!/data-estado="mal"/.test(esc.outerHTML) && !esc.outerHTML.toLowerCase().includes(CORAL.toLowerCase()));
    /* A6 pide tocar antes de seguir: su P2 la cubre la prueba de t1-piezas. */
    if (!m.q("[data-siguiente]").disabled) {
      await m.clic("[data-siguiente]");
      assert.equal(m.q("[data-escenario]") === null, true, `${p.id}: P2 sin escena`);
    }
    } finally { await m.desmontar(); }
  }
});

for (const T of TEMAS) test(`Hacer ${T.nombre}: tarjeta de inicio con la escena completa (180 px) y la consigna; cada ronda, escena compacta (120 px) con su mini contexto`, async () => {
  for (const p of T.piezas.filter((x) => x.tipo === "hacer")) {
    const e = T.textos.ESCENAS[p.id];
    const m = await montar(T, p.id);
    try {
    assert.ok(m.q("[data-inicio-hacer]"), `${p.id}: tarjeta de inicio`);
    assert.equal(m.q("[data-escenario]").dataset.compacto, "0");
    assert.equal(altoMascota(m.q("[data-escenario]")), ALTO_ESCENA);
    assert.equal(m.q("[data-contexto-escena]").textContent, e.contexto);
    if (T.textos.CONSIGNAS[p.id]) assert.equal(m.q("[data-consigna]").textContent, T.textos.CONSIGNAS[p.id]);
    assert.equal(m.q("[data-figura]") === null, true, "la ronda empieza al tocar Empezar");
    await m.clic("[data-empezar]");
    const esc = m.q("[data-escenario]");
    assert.equal(esc.dataset.compacto, "1");
    assert.equal(altoMascota(esc), ALTO_COMPACTO, `${p.id}: compacta a 120`);
    assert.equal(m.q("[data-papel]") === null, true, "la compacta no repite tu papel");
    const mini = m.q("[data-contexto-escena]").textContent;
    assert.ok(minis(p.id, e).some((t) => mini.endsWith(t)), `${p.id}: mini «${mini}»`);
    if (e.porRonda.etiqueta) assert.ok(mini.startsWith(e.porRonda.etiqueta));
    assert.ok(m.q("[data-figura]"), `${p.id}: la ronda`);
    } finally { await m.desmontar(); }
  }
});

test("pe26-h5: la autoridad lleva el timón con la tasa (fiebre 1) y el grifo con el gasto (fiebre 2)", async () => {
  const T = TEMAS[1];
  const m = await montar(T, "pe26-h5-dos-fiebres");
  try {
    await m.clic("[data-empezar]");
    const pose = () => m.q("[data-escenario] [data-mascota-rol]").getAttribute("data-pose");
    assert.equal(pose(), "timon");
    assert.equal(m.q("[data-contexto-escena]").textContent, T2.ENTRADA_H5);
    await m.clic('[data-opcion="tasa-subir"]');
    assert.equal(pose(), "grifo");
    assert.equal(m.q("[data-contexto-escena]").textContent, T2.PASOS_H5[0].opciones[0].narracion);
  } finally { await m.desmontar(); }
});

test("T4 y T5 llevan escena (lote 3 del rediseño)", { todo: "lote 3: T4 + T5" }, () => {
  assert.fail("pendiente");
});
