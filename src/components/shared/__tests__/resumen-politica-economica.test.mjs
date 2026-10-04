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
    alTerminar(pct);
    resumen.registrar({ actividadId, clasificacion, pct: d.pct, detalle: d.detalle }, async () => {
      const repetida = d.repetida ?? false;
      emitirFP({ fp: repetida ? 0 : 12, repetida, actividadId, materiaId: "macroeconomia", pctGuardado: d.registro?.correct_pct ?? null });
      return { ok: true, fp: 12, repetida: false, registro: d.registro };
    });
  };
  return h("div", null,
    h(AvisoFP),
    h(ContextoResumen.Provider, { value: resumen.contexto(actividadId, () => {}) },
      h(Componente, { onCompletar: completar })));
}

/**
 * Juega hasta que la actividad entrega su resultado; deja la caja montada en
 * el cierre. `conP`: solo vale una partida con P ≥ 1 (una P de 0 cae, a
 * propósito, al cierre de siempre).
 */
async function jugarHastaElCierre(id, archivo, alterar, { conP = false } = {}) {
  const Componente = (await import(MECANICAS + archivo)).default;
  for (let semilla = 1; semilla <= 40; semilla++) {
    const azar = mulberry32(semilla);
    const aleatorioOriginal = Math.random;
    Math.random = mulberry32(semilla * 7919 + 17);
    const caja = document.createElement("div");
    document.body.appendChild(caja);
    const raiz = createRoot(caja);
    let terminada = false;
    let pctPartida = null;
    const desmontar = () => { act(() => raiz.unmount()); caja.remove(); Math.random = aleatorioOriginal; };
    await act(async () => {
      raiz.render(h(AuthContext.Provider, { value: CON_CUENTA },
        h(Vista, { Componente, actividadId: id, alterar, alTerminar: (p) => { terminada = true; pctPartida = p; } })));
    });
    for (let k = 0; k < 2500 && !terminada; k++) {
      const r = azar();
      if (r < 0.6) act(() => { const l = tocables(caja); if (l.length) tocar(l[Math.floor(azar() * l.length)], azar); });
      else if (r < 0.9) act(() => { mock.timers.tick(Math.floor(azar() * 1200)); });
      else act(() => terminarAnimaciones(caja));
      if (k % 20 === 0) await act(async () => {});
    }
    if (!terminada || (conP && !(pctPartida >= 1))) { desmontar(); continue; }
    /* Sin tocar nada más: que corran los relojes del cierre y se resuelva el registro. */
    for (let k = 0; k < 10; k++) {
      act(() => { mock.timers.tick(500); });
      await act(async () => { await new Promise((r) => setImmediate(r)); });
    }
    return { caja, desmontar, pct: pctPartida };
  }
  assert.fail(`el mono no terminó ${id} en 40 semillas${conP ? " con P ≥ 1" : ""}: la prueba no la está jugando`);
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
    const { caja, desmontar } = await jugarHastaElCierre(id, archivo, valida, { conP: true });
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
  const { caja, desmontar } = await jugarHastaElCierre("diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", valida, { conP: true });
  try {
    assert.ok(caja.querySelector("[data-pantalla-resumen]"));
    assert.ok(caja.querySelector("[aria-label^='Etapa 2: ']"), "se perdió el veredicto de la etapa 2");
    assert.ok(BRECHAS.some((b) => caja.textContent.includes(b.feedback)), "se perdió el texto de la etapa 2");
  } finally { desmontar(); }
});

test("★★★ Explica la política: el detalle frase por frase sigue, y el resumen va después de él", async () => {
  const { caja, desmontar } = await jugarHastaElCierre("explica-la-politica", "ExplicaLaPolitica.jsx", valida, { conP: true });
  try {
    const pantalla = caja.querySelector("[data-pantalla-resumen]");
    const detalle = [...caja.querySelectorAll("p")].find((p) => p.textContent === "FRASE POR FRASE");
    assert.ok(pantalla && detalle, "falta la pantalla o el detalle");
    assert.ok(detalle.compareDocumentPosition(pantalla) & w.Node.DOCUMENT_POSITION_FOLLOWING, "el resumen no va debajo del detalle");
    assert.equal(caja.querySelectorAll("[aria-label^='Frase ']").length, 4, "no están las cuatro frases");
  } finally { desmontar(); }
});

/* Las cifras de resultado de la pantalla: «Resultado:» o «Bien a la primera:». */
const cifrasDeResultado = (caja) => caja.querySelectorAll("[data-pantalla-resumen] [data-cifra='resultado'], [data-pantalla-resumen] [data-cifra='bien']").length;
const textoPantalla = (caja) => {
  const p = caja.querySelector("[data-pantalla-resumen]").cloneNode(true);
  p.querySelectorAll("style, [data-recuadro]").forEach((x) => x.remove());
  return p.textContent;
};

/*
 * ═══════════ UNA SOLA CIFRA DE RESULTADO (Levi) ═══════════
 *
 * Si el cierre propio ya enseña su resultado, la pantalla no enseña ningún
 * porcentaje ni «X de N»: solo los puntos. Si no lo enseña, la tarjeta de la
 * pantalla es la única cifra.
 */
const ENSENA_SU_RESULTADO = new Set(["diagnostico-en-vivo", "corriente-titulares", "explica-la-politica", "quien-gana-quien-pierde"]);

for (const [id, archivo] of LAS_SIETE) {
  test(`★★★ ${id}: una sola cifra de resultado (${ENSENA_SU_RESULTADO.has(id) ? "la del cierre propio" : "la de la pantalla"})`, async () => {
    const { caja, desmontar } = await jugarHastaElCierre(id, archivo, valida, { conP: true });
    try {
      assert.ok(caja.querySelector("[data-pantalla-resumen]"), "no salió la pantalla");
      if (ENSENA_SU_RESULTADO.has(id)) {
        assert.equal(cifrasDeResultado(caja), 0, "la pantalla repite el resultado");
        assert.doesNotMatch(textoPantalla(caja), /%| de \d/, "la pantalla enseña otro porcentaje o «X de N»");
        assert.doesNotMatch(caja.querySelector("[data-lector]").textContent, /Resultado/, "el lector repite el resultado");
      } else {
        assert.equal(cifrasDeResultado(caja), 1, "la pantalla debe llevar la única cifra de resultado");
      }
    } finally { desmontar(); }
  });
}

/*
 * ═══════════ EL CASO VISTO EN MACRO ═══════════
 *
 * Diagnóstico en vivo REPETIDO: la partida da 90 % (o la P que sea) y la
 * pantalla mostró «Resultado: 0 %». Ahora: el resultado es el del cierre
 * propio y la pantalla solo dice los puntos, 0, con su nota.
 */
const fila = (pct, repetida) => ({ id: 1, fp_awarded: repetida ? 0 : 12, repeat_index: repetida ? 1 : 0, correct_pct: pct });

test("★★★ caso de Macro: Diagnóstico en vivo repetido — su resultado, ningún otro porcentaje, 0 puntos con su nota", async () => {
  const { caja, desmontar, pct } = await jugarHastaElCierre("diagnostico-en-vivo", "DiagnosticoEnVivo.jsx",
    ({ pct: p, detalle }) => ({ pct: p, detalle, repetida: true, registro: fila(Math.round(p), true) }), { conP: true });
  try {
    const pantalla = caja.querySelector("[data-pantalla-resumen]");
    assert.ok(pantalla, "no salió la pantalla");
    assert.equal(pantalla.getAttribute("data-repeticion"), "si");
    /* El resultado: el del cierre propio, el de la partida. */
    assert.ok(caja.textContent.includes(`${Math.round(pct)}%`), "no está el resultado del cierre propio");
    /* Ningún otro porcentaje. */
    assert.equal(cifrasDeResultado(caja), 0);
    assert.doesNotMatch(textoPantalla(caja), /%/);
    assert.ok(!/0\s?%/.test(textoPantalla(caja)), "apareció «0 %»");
    /* Los puntos en 0 con su nota. */
    assert.equal(pantalla.querySelector("[data-cifra='puntos'] [data-valor]").textContent, "0");
    assert.ok(pantalla.querySelector("[data-nota-repeticion]"), "falta la nota de la repetición");
    assert.equal(pantalla.querySelector("[data-lector]").textContent, "0 puntos ganados, sin puntos nuevos.");
  } finally { desmontar(); }
});

for (const [nombre, alterar] of [
  ["el servidor guardó 0 para una partida de P ≥ 1", ({ pct, detalle }) => ({ pct, detalle, repetida: true, registro: fila(0, true) })],
  ["el servidor guardó otra P", ({ pct, detalle }) => ({ pct, detalle, repetida: true, registro: fila(Math.round(pct) === 50 ? 51 : 50, true) })],
  ["el servidor no devolvió la P", ({ pct, detalle }) => ({ pct, detalle, repetida: true, registro: null })],
]) {
  test(`★★★ repetición en «Resultado: P %» sin P confiable (${nombre}): cierre de siempre, sin línea de resultado, con su aviso`, async () => {
    const { caja, desmontar } = await jugarHastaElCierre("diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", alterar, { conP: true });
    try {
      assert.ok(!caja.querySelector("[data-pantalla-resumen]"), "salió la pantalla sin una P confiable");
      assert.ok(!/Resultado:\s*0\s*%/.test(caja.textContent), "apareció «Resultado: 0 %»");
      assert.ok(botones(caja).includes("Otra ronda"), "no está su cierre de siempre");
      assert.ok(caja.querySelector("[role='status']")?.textContent.includes("Ya completada"), "se perdió el aviso de la repetición");
    } finally { desmontar(); }
  });
}

test("★★★ una P de 0 nunca se enseña como resultado, ni la primera vez ni en la repetición", () => {
  for (const repetida of [false, true]) {
    const aviso = { fp: repetida ? 0 : 12, repetida, actividadId: "arma-grupo-logico", materiaId: "macroeconomia", pctGuardado: 0 };
    const partida = { formato: R.FORMATO.PORCENTAJE, pct: 0, detalle: null, conCuenta: true, aviso };
    assert.equal(R.decidir(partida).valida, false, `repetida=${repetida}`);
    assert.equal(R.porcentajeConfiable(partida), null);
  }
  /* Y una P de 1 o más, guardada y coincidente, sí. */
  assert.equal(R.porcentajeConfiable({ pct: 90, aviso: { pctGuardado: 90 } }), 90);
  assert.equal(R.porcentajeConfiable({ pct: 62.5, aviso: { pctGuardado: 63 } }), 63);
});
