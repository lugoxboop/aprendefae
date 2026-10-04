import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS 7 DE POLÍTICA ECONÓMICA CON LA PANTALLA DE RESUMEN.
 *
 * Tienen cierre propio y quedaron conectadas con la condición de Levi:
 *   · el cierre propio se conserva completo: si es un texto corto va dentro
 *     del recuadro; si trae más (listas, diagnóstico por ítem) va entero y el
 *     resumen debajo
 *   · Diagnóstico en vivo dice «Resultado: P %», con el porcentaje guardado
 *   · si la partida cae a la salvaguarda, sale su cierre de siempre y su aviso
 *     de FP
 *
 * Cada prueba juega la actividad real hasta el final —con un mono con semilla,
 * el mismo de unicidad-partida— dentro de la misma vista que la monta en la
 * app, con el servidor sustituido. Nada toca puntos, progreso ni ranking.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = Observador;
w.IntersectionObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
w.scrollTo = () => {};
w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
  scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/* El reloj de las actividades lo mueve la prueba; el planificador de React usa setImmediate. */
mock.timers.enable({ apis: ["setTimeout", "setInterval"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const h = React.createElement;

const errorOriginal = console.error;
console.error = (...a) => {
  if (/not wrapped in act|act\(\.\.\.\)|ReactDOMTestUtils|Not implemented/i.test(String(a[0] ?? ""))) return;
  errorOriginal(...a);
};

const R = await import("../../../hacer/pantallaResumen.js");
const { ContextoResumen, useResumenDePartida } = await import("../PantallaResumen.jsx");
const { default: AvisoFP } = await import("../AvisoFP.jsx");
const { emitirFP } = await import("../../../fp/aviso.js");
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { clasificacionDe } = await import("../../../data/subjects.js");

/*
 * Macroeconomía tiene su línea en false (apagada por la regla con Levi). Aquí
 * se enciende solo para este proceso de prueba: el cableado de las 7 se sigue
 * probando para el día que se reencienda. No cambia nada en la app.
 */
R.PANTALLA_RESUMEN.macroeconomia = true;

const MECANICAS = "../../mecanicas/";
const CON_CUENTA = { usuario: { id: "u-prueba" } };

/*
 * [id, archivo, el botón de «otra vez» de su cierre de siempre, cómo es su
 * cierre propio]. `completo` = trae más que un texto y va entero, con el
 * resumen debajo; `texto` = un texto corto que va en el recuadro.
 */
const LAS_SIETE = [
  ["diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", "Otra ronda", "completo"],
  ["arma-grupo-logico", "ArmaGrupoLogico.jsx", "Otra cadena", "texto"],
  ["quien-gana-quien-pierde", "QuienGanaQuienPierde.jsx", "Otra vuelta", "texto"],
  ["corriente-titulares", "CorrienteTitulares.jsx", "Otra tanda", "completo"],
  ["explica-la-politica", "ExplicaLaPolitica.jsx", "Otro caso", "completo"],
  ["tablero-decisiones", "TableroDeDecisiones.jsx", "Probar otra combinación", "texto"],
  ["simulador-de-crisis", "SimuladorDeCrisis.jsx", "Otra crisis", "texto"],
];

/* ──────────────────────────────── el mono ──────────────────────────────── */

const mulberry32 = (semilla) => () => {
  let a = (semilla = (semilla + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
};
const tocables = (raiz) =>
  [...raiz.querySelectorAll("button, [role='button'], [style*='cursor: pointer'], input[type='range']")]
    .filter((el) => !el.disabled && !el.closest("[role='status']"));
const valorNativo = (el, v) => Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(el, v);
const tocar = (el, azar) => {
  if (el.tagName === "INPUT" && el.type === "range") {
    const min = Number(el.min || 0), max = Number(el.max || 100), paso = Number(el.step || 1);
    valorNativo(el, String(min + Math.round((azar() * (max - min)) / paso) * paso));
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
    el.dispatchEvent(new w.Event("change", { bubbles: true }));
  } else {
    el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  }
};
const terminarAnimaciones = (raiz) => {
  for (const el of raiz.querySelectorAll("*")) {
    const ev = new w.Event("animationend", { bubbles: true });
    Object.defineProperty(ev, "animationName", { value: "fin-de-animacion" });
    el.dispatchEvent(ev);
  }
};

/* ─────────────────────────────── la vista ─────────────────────────────── */

/*
 * Como PoliticaEconomicaView: el hook de la pantalla, el aviso de FP montado
 * en la raíz y la mecánica dentro del contexto. `alterar` estropea lo que la
 * partida entrega, para llevarla a la salvaguarda.
 */
function Vista({ Componente, actividadId, alterar, alTerminar }) {
  const resumen = useResumenDePartida("macroeconomia", false);
  const clasificacion = clasificacionDe("macroeconomia", "politica-economica", actividadId);
  const completar = (pct, ms, detalle) => {
    const d = alterar({ pct, detalle });
    alTerminar();
    resumen.registrar({ actividadId, clasificacion, pct: d.pct, detalle: d.detalle }, async () => {
      emitirFP({ fp: 12, repetida: false, actividadId, materiaId: "macroeconomia" });
      return { ok: true, fp: 12, repetida: false, registro: d.registro };
    });
  };
  return h("div", null,
    h(AvisoFP),
    h(ContextoResumen.Provider, { value: resumen.contexto(actividadId, () => {}) },
      h(Componente, { onCompletar: completar })));
}

/** Juega hasta que la actividad entrega su resultado; deja la caja montada en el cierre. */
async function jugarHastaElCierre(id, archivo, alterar) {
  const Componente = (await import(MECANICAS + archivo)).default;
  for (let semilla = 1; semilla <= 16; semilla++) {
    const azar = mulberry32(semilla);
    const aleatorioOriginal = Math.random;
    Math.random = mulberry32(semilla * 7919 + 17);
    const caja = document.createElement("div");
    document.body.appendChild(caja);
    const raiz = createRoot(caja);
    let terminada = false;
    const desmontar = () => { act(() => raiz.unmount()); caja.remove(); Math.random = aleatorioOriginal; };
    await act(async () => {
      raiz.render(h(AuthContext.Provider, { value: CON_CUENTA },
        h(Vista, { Componente, actividadId: id, alterar, alTerminar: () => { terminada = true; } })));
    });
    for (let k = 0; k < 2500 && !terminada; k++) {
      const r = azar();
      if (r < 0.6) act(() => { const l = tocables(caja); if (l.length) tocar(l[Math.floor(azar() * l.length)], azar); });
      else if (r < 0.9) act(() => { mock.timers.tick(Math.floor(azar() * 1200)); });
      else act(() => terminarAnimaciones(caja));
      if (k % 20 === 0) await act(async () => {});
    }
    if (!terminada) { desmontar(); continue; }
    /* Sin tocar nada más: que corran los relojes del cierre y se resuelva el registro. */
    for (let k = 0; k < 10; k++) {
      act(() => { mock.timers.tick(500); });
      await act(async () => { await new Promise((r) => setImmediate(r)); });
    }
    return { caja, desmontar };
  }
  assert.fail(`el mono no terminó ${id} en 16 semillas: la prueba no la está jugando`);
}

/* Nunca se pasa un nodo a assert: al fallar, formatear un nodo de jsdom no termina. */
const botones = (caja) => [...caja.querySelectorAll("button")].map((b) => b.textContent.trim());

/* La salvaguarda, según el formato: N = 0 en un X de N; P fuera de 0–100 en un porcentaje. */
const aLaSalvaguarda = (id) => ({ pct, detalle }) => (R.formatoDe(id) === R.FORMATO.X_DE_N
  ? { pct, detalle: [], registro: { id: 1, fp_awarded: 12, repeat_index: 0, correct_pct: pct } }
  : { pct: 140, detalle, registro: null });
const valida = ({ pct, detalle }) => ({ pct, detalle, registro: { id: 1, fp_awarded: 12, repeat_index: 0, correct_pct: pct } });

/* ─────────────────────────────── las pruebas ─────────────────────────────── */

for (const [id, archivo, otraVez] of LAS_SIETE) {
  test(`★★★ ${id}: si cae en la salvaguarda, sale su cierre de siempre con su aviso de FP`, async () => {
    const { caja, desmontar } = await jugarHastaElCierre(id, archivo, aLaSalvaguarda(id));
    try {
      assert.ok(!caja.querySelector("[data-pantalla-resumen]"), "salió la pantalla de resumen");
      assert.ok(botones(caja).includes(otraVez), `no está «${otraVez}» de su cierre de siempre`);
      assert.match(caja.textContent, /\d+%/, "no está el porcentaje de su cierre de siempre");
      assert.ok(caja.querySelector("[role='status']")?.textContent.includes("+12 FP"), "se perdió el aviso de FP");
    } finally { desmontar(); }
  });
}

for (const [id, archivo, otraVez, forma] of LAS_SIETE) {
  test(`★★★ ${id}: con la pantalla, su cierre propio se conserva (${forma === "completo" ? "entero, el resumen debajo" : "su texto en el recuadro"})`, async () => {
    const { caja, desmontar } = await jugarHastaElCierre(id, archivo, valida);
    try {
      const pantalla = caja.querySelector("[data-pantalla-resumen]");
      assert.ok(pantalla, "no salió la pantalla");
      assert.ok(!caja.querySelector("[role='status']")?.textContent.includes("+12 FP"), "salieron la pantalla y el aviso a la vez");
      if (forma === "completo") {
        /* Todo lo de siempre sigue ahí, incluido su botón, y la pantalla va después. */
        assert.ok(botones(caja).includes(otraVez), `se quitó «${otraVez}»`);
        const suBoton = [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === otraVez);
        assert.ok(suBoton.compareDocumentPosition(pantalla) & w.Node.DOCUMENT_POSITION_FOLLOWING, "el resumen no va debajo del cierre");
        assert.ok(!pantalla.querySelector("[data-recuadro]"), "el texto propio ya está arriba: sin recuadro repetido");
      } else {
        const recuadro = pantalla.querySelector("[data-recuadro]");
        assert.ok(recuadro && recuadro.textContent.trim().length > 20, "el recuadro no lleva el texto de cierre propio");
        assert.ok(!Object.values(R.MENSAJE).includes(recuadro.textContent.trim()), "va el mensaje genérico en vez del suyo");
      }
    } finally { desmontar(); }
  });
}

test("★★★ Diagnóstico en vivo: lo que no cabe en el recuadro sigue en pantalla (el veredicto de la etapa 2 y los fallos)", async () => {
  const { BRECHAS } = await import("../../../data/juegosPolitica.js");
  const { caja, desmontar } = await jugarHastaElCierre("diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", valida);
  try {
    assert.ok(caja.querySelector("[data-pantalla-resumen]"));
    assert.ok(caja.querySelector("[aria-label^='Etapa 2: ']"), "se perdió el veredicto de la etapa 2");
    assert.ok(BRECHAS.some((b) => caja.textContent.includes(b.feedback)), "se perdió el texto de la etapa 2");
  } finally { desmontar(); }
});

test("★★★ Explica la política: el detalle frase por frase sigue, y el resumen va después de él", async () => {
  const { caja, desmontar } = await jugarHastaElCierre("explica-la-politica", "ExplicaLaPolitica.jsx", valida);
  try {
    const pantalla = caja.querySelector("[data-pantalla-resumen]");
    const detalle = [...caja.querySelectorAll("p")].find((p) => p.textContent === "FRASE POR FRASE");
    assert.ok(pantalla && detalle, "falta la pantalla o el detalle");
    assert.ok(detalle.compareDocumentPosition(pantalla) & w.Node.DOCUMENT_POSITION_FOLLOWING, "el resumen no va debajo del detalle");
    assert.equal(caja.querySelectorAll("[aria-label^='Frase ']").length, 4, "no están las cuatro frases");
  } finally { desmontar(); }
});

test("★★★ Diagnóstico en vivo: «Resultado: P %» con el porcentaje guardado, no «X de N»", async () => {
  assert.equal(R.formatoDe("diagnostico-en-vivo"), R.FORMATO.PORCENTAJE);
  /* La fila guardada dice 70 aunque la partida diga otra cosa: manda lo guardado. */
  const guardado = ({ pct, detalle }) => ({ pct, detalle, registro: { id: 1, fp_awarded: 12, repeat_index: 0, correct_pct: 70 } });
  const { caja, desmontar } = await jugarHastaElCierre("diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", guardado);
  try {
    const pantalla = caja.querySelector("[data-pantalla-resumen]");
    assert.ok(pantalla);
    assert.ok(pantalla.querySelector("[data-cifra='resultado']"), "no está «Resultado:»");
    assert.ok(!pantalla.querySelector("[data-cifra='bien']"), "sigue diciendo «Bien a la primera: X de N»");
    assert.match(pantalla.querySelector("[data-lector]").textContent, /^Resultado: 70 %/);
  } finally { desmontar(); }
});
