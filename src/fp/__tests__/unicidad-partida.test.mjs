/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA PARTIDA NO REGISTRA EL MISMO ÍTEM DOS VECES — jugándolas de verdad.
 *
 * detalle-ids.test.mjs comprueba que los ids del BANCO sean únicos. Eso no dice
 * nada de si una PARTIDA puede emitir el mismo id dos veces, y en producción lo
 * hizo: `diagnostico-en-vivo` registró `t3a` en los órdenes 2 y 3 de la misma
 * partida porque un titular ya cerrado seguía aceptando toques unos
 * milisegundos. Los ids eran únicos; la partida no.
 *
 * Esa diferencia solo se ve JUGANDO, así que esto monta cada actividad
 * instrumentada en un DOM de mentira (jsdom) y la juega con un "mono": toca
 * lo que se puede tocar al azar, hace correr los temporizadores a saltos y
 * dispara los finales de animación de los que dependen algunas actividades.
 * Cada vez que la actividad avisa de que terminó, se mira su detalle: ningún
 * ítem puede salir dos veces.
 *
 * ═══════════ LAS DOS FORMAS DE TOCAR A DESTIEMPO ═══════════
 *
 *   · RÁFAGAS: varios toques seguidos sin dejar correr el reloj. Cada toque va
 *     en su propio act(), porque en un navegador React pinta entre dos toques
 *     —son eventos de prioridad alta—. Es el hueco del fallo de producción: un
 *     temporizador de 260 ms que no había llegado.
 *
 *   · CARRERAS: un temporizador o un final de animación y un toque DENTRO DEL
 *     MISMO act(), sin pintado en medio. Es lo que pasa en un navegador cuando
 *     un evento de prioridad normal —animationend, un setTimeout— llega y el
 *     toque entra antes de que React haya pintado su efecto. Así se cazan
 *     `corriente-cruzada` y `camara-presion`, que las ráfagas no veían.
 *
 * EL AZAR TIENE SEMILLA, el del mono y el de la actividad: un fallo se
 * reproduce con la misma semilla.
 *
 * UNA ACTIVIDAD QUE EL MONO NO CONSIGUE TERMINAR HACE FALLAR LA PRUEBA. Si no,
 * esta prueba podría dejar de jugar una actividad —por un botón renombrado,
 * por un paso nuevo— y seguir en verde sin haberla probado.
 *
 * Y una prueba dirigida, con la secuencia exacta del fallo conocido, para que
 * no dependa de que el mono la encuentre. Eran tres; las otras dos eran de
 * Macroeconomía y salieron con la materia (0258).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

/* ─────────────── un navegador de mentira, ANTES de cargar React ─────────────── */

/* Callada: jsdom avisa de lo que no implementa (scrollTo…) y aquí no aporta. */
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  virtualConsole: new VirtualConsole(),
});
const w = dom.window;

const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = Observador;
w.IntersectionObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
/* Los fotogramas van por el reloj simulado: así también los controla la prueba. */
w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);

for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w),
  matchMedia: w.matchMedia, ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/*
 * El reloj de las actividades —los setTimeout que las hacen avanzar— lo mueve
 * la prueba. El planificador de React usa setImmediate, que no se toca.
 */
mock.timers.enable({ apis: ["setTimeout", "setInterval"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

/* React avisa por consola de cosas propias de este montaje; no son fallos de la actividad. */
const errorOriginal = console.error;
console.error = (...a) => {
  const t = String(a[0] ?? "");
  if (/not wrapped in act|act\(\.\.\.\)|ReactDOMTestUtils|Not implemented/i.test(t)) return;
  errorOriginal(...a);
};

/* ──────────────────────────────── el azar ──────────────────────────────── */

const mulberry32 = (semilla) => () => {
  let a = (semilla = (semilla + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
};

/* ─────────────────────────── las actividades ─────────────────────────── */

const MECANICAS = "../../components/mecanicas/";

/*
 * [id del catálogo, archivo, en qué argumento de onCompletar llega el detalle].
 * Son todas las que mandan detalle —tablero-decisiones no manda—, con la firma
 * con la que las monta su vista.
 *
 * `archivo#Nombre` para las que viven como export con nombre (así vivían los
 * quince de la 0030 de Macro, retirados en la 0258).
 */
const ACTIVIDADES = [
  ["camara-presion", "CamaraPresion.jsx", 3],
  ["radar-profundidad", "RadarProfundidad.jsx", 2],
  ["expediente-rescate", "ExpedienteRescate.jsx", 2],
  ["tribunal-profundidad", "TribunalProfundidad.jsx", 2],
  ["arquitecto-profundidades", "ArquitectoProfundidades.jsx", 2],
  ["transmision-superficie", "TransmisionSuperficie.jsx", 2],
  ["corriente-cruzada", "CorrienteCruzada.jsx", 2],
  ["proyecto-arca", "arca/ProyectoArca.jsx", 2],
  ["constructor-mapa-causal", "MapaCausal.jsx", 1],
  ["asedio-estrategico", "AsedioEstrategico.jsx", 2],
  /*
   * Las 45 de Macroeconomía que estaban aquí (Política Económica, Demanda
   * Agregada, Política Fiscal y Política Monetaria) salieron con la materia el
   * 22-nov-2026 (0258): sus mecánicas ya no existen y no hay nada que jugar.
   */
];

/*
 * Los finales de animación que una actividad escucha —el titular que cruza la
 * línea de archivo, por ejemplo— se sacan de su propio código: así una
 * animación nueva entra sola en la prueba. Un onAnimationEnd que no mira el
 * nombre acepta cualquiera, y para él se manda uno genérico.
 */
const FIN_GENERICO = "fin-de-animacion";
const animacionesDe = (archivo) => {
  const fuente = readFileSync(fileURLToPath(new URL(MECANICAS + archivo, import.meta.url)), "utf8");
  const nombres = new Set([...fuente.matchAll(/animationName\s*===\s*["']([^"']+)["']/g)].map((m) => m[1]));
  if (/onAnimationEnd=\{\(\)\s*=>/.test(fuente)) nombres.add(FIN_GENERICO);
  return [...nombres];
};

/* ──────────────────────────────── el mono ──────────────────────────────── */

const tocables = (raiz) =>
  [...raiz.querySelectorAll("button, [role='button'], [style*='cursor: pointer'], input[type='range'], select, textarea, input[type='text']")]
    .filter((el) => !el.disabled && !el.closest("a"));

const valorNativo = (el, v) => {
  const proto = el.tagName === "TEXTAREA" ? w.HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? w.HTMLSelectElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
};

const tocar = (el, azar) => {
  if (el.tagName === "INPUT" && el.type === "range") {
    const min = Number(el.min || 0), max = Number(el.max || 100), paso = Number(el.step || 1);
    valorNativo(el, String(min + Math.round((azar() * (max - min)) / paso) * paso));
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
    el.dispatchEvent(new w.Event("change", { bubbles: true }));
  } else if (el.tagName === "SELECT") {
    const ops = [...el.options];
    if (ops.length) valorNativo(el, ops[Math.floor(azar() * ops.length)].value);
    el.dispatchEvent(new w.Event("change", { bubbles: true }));
  } else if (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.type === "text")) {
    valorNativo(el, "Una respuesta escrita por el mono de la prueba, con más de veinte palabras para que ninguna actividad la rechace por corta y siga su camino.");
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  } else {
    el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  }
};

const finDeAnimacion = (el, nombre) => {
  const ev = new w.Event("animationend", { bubbles: true });
  Object.defineProperty(ev, "animationName", { value: nombre });
  el.dispatchEvent(ev);
};

/* Se dispara en CADA elemento: el que escucha lo recibe de sí mismo una vez. */
const terminarAnimaciones = (raiz, nombres) => {
  for (const nombre of nombres) for (const el of raiz.querySelectorAll("*")) finDeAnimacion(el, nombre);
};

const tocarAlAzar = (caja, azar) => {
  const lista = tocables(caja);
  if (lista.length) tocar(lista[Math.floor(azar() * lista.length)], azar);
};

/**
 * Juega una actividad con una semilla. Devuelve el detalle de cada partida que
 * terminó —puede terminar más de una: tras la primera, "otra ronda" es un
 * botón más para el mono—.
 */
async function jugar(Componente, posDetalle, animaciones, semilla, { pasos = 1600, maxPartidas = 2 } = {}) {
  const azar = mulberry32(semilla);
  const aleatorioOriginal = Math.random;
  Math.random = mulberry32(semilla * 7919 + 17);
  const partidas = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const onCompletar = (...args) => partidas.push(args[posDetalle] ?? null);

  try {
    await act(async () => { raiz.render(React.createElement(Componente, { onCompletar })); });
    for (let k = 0; k < pasos && partidas.length < maxPartidas; k++) {
      const r = azar();
      if (r < 0.5) {
        /* RÁFAGA: de uno a tres toques seguidos, sin dejar correr el reloj entre ellos. */
        const n = 1 + Math.floor(azar() * 3);
        for (let j = 0; j < n; j++) act(() => tocarAlAzar(caja, azar));
      } else if (r < 0.84) {
        act(() => { mock.timers.tick(Math.floor(azar() * 1200)); });
      } else if (r < 0.94) {
        /* CARRERA: un temporizador o un final de animación y un toque, sin pintado en medio. */
        act(() => {
          if (animaciones.length && azar() < 0.5) terminarAnimaciones(caja, animaciones);
          else mock.timers.tick(Math.floor(azar() * 1200));
          tocarAlAzar(caja, azar);
        });
      } else if (animaciones.length) {
        act(() => terminarAnimaciones(caja, animaciones));
      }
      /* Las promesas pendientes: el Arca, por ejemplo, avisa después de guardar. */
      if (k % 20 === 0) await act(async () => {});
    }
    await act(async () => {});
  } finally {
    act(() => raiz.unmount());
    caja.remove();
    Math.random = aleatorioOriginal;
  }
  return partidas;
}

/* El mismo recorte que hace el servidor: lo que para él es el mismo ítem. */
const claveServidor = (item) => String(item ?? "").trim().slice(0, 120);

const repetidos = (filas) => {
  const vistos = new Set();
  const rep = new Set();
  for (const f of filas ?? []) {
    const k = claveServidor(f?.item);
    if (vistos.has(k)) rep.add(k);
    vistos.add(k);
  }
  return [...rep];
};

/* ──────────────────────────────── las pruebas ──────────────────────────────── */

const SEMILLAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const [id, archivo, posDetalle] of ACTIVIDADES) {
  test(`${id}: ninguna partida registra el mismo ítem dos veces`, async () => {
    const [ruta, nombre = "default"] = archivo.split("#");
    const Componente = (await import(MECANICAS + ruta))[nombre];
    assert.equal(typeof Componente, "function", `${ruta} no exporta ${nombre}`);
    const animaciones = animacionesDe(ruta);
    let terminadas = 0;
    const fallos = [];

    for (const semilla of SEMILLAS) {
      const partidas = await jugar(Componente, posDetalle, animaciones, semilla);
      partidas.forEach((filas, n) => {
        terminadas++;
        const rep = repetidos(filas);
        if (rep.length) fallos.push(`semilla ${semilla}, partida ${n + 1}: ${rep.join(", ")} (${(filas ?? []).length} filas)`);
      });
    }

    assert.ok(
      terminadas > 0,
      `El mono no terminó ninguna partida de ${id} en ${SEMILLAS.length} semillas: la prueba no la está jugando. Mira qué paso nuevo necesita.`,
    );
    assert.deepEqual(fallos, [], `${id} registró ítems repetidos en una misma partida:\n  ${fallos.join("\n  ")}`);
  });
}

/* ───────────────────────── ayudas de las dirigidas ───────────────────────── */

async function montar(Componente, props, semilla) {
  const aleatorioOriginal = Math.random;
  Math.random = mulberry32(semilla);
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(React.createElement(Componente, props)); });
  return {
    caja,
    desmontar: () => { act(() => raiz.unmount()); caja.remove(); Math.random = aleatorioOriginal; },
  };
}
const click = (el) => {
  assert.ok(el, "no está el botón que la prueba quiere tocar");
  act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const dejarCorrer = (ms = 1000) => act(() => { mock.timers.tick(ms); });

/*
 * ═══════════ DIRIGIDA: EL FALLO DE PRODUCCIÓN DE diagnostico-en-vivo ═══════════
 *
 * La secuencia exacta: fallar dos veces un titular —se cierra— y, antes de que
 * pase al siguiente, tocar el problema correcto. Antes del arreglo eso daba el
 * mismo titular dos veces (ok:false/2 y ok:true/1) y un titular que nunca
 * salía. Y la variante sin duplicado: tras cerrarse, un toque de más FALLIDO
 * dejaba `intentos` en 1 para el siguiente, y acertarlo a la primera se
 * registraba como ok:false, intentos:2.
 */
/*
 * Aquí había dos pruebas dirigidas más, la de `diagnostico-en-vivo` (el
 * fallo de producción que dio origen a esta prueba) y la de
 * `corriente-titulares`. Salieron el 22-nov-2026 con Macroeconomía (0258):
 * sus mecánicas ya no existen.
 */

test("corriente-cruzada: una frase que se va y un toque sin pintado en medio cuentan una sola vez", async () => {
  const { default: Cruzada } = await import(MECANICAS + "CorrienteCruzada.jsx");
  const { CORRIENTE } = await import("../../data/icebergActividades.js");

  let detalle = null;
  const { caja, desmontar } = await montar(Cruzada, { onCompletar: (_p, _ms, d) => { detalle = d; } }, 99);
  try {
    const vistos = [];
    for (let n = 0; n < CORRIENTE.length && !detalle; n++) {
      const frase = CORRIENTE.find((x) => caja.textContent.includes(x.texto));
      assert.ok(frase, `no hay frase en la corriente en la vuelta ${n + 1}`);
      vistos.push(frase.id);
      const pieza = caja.querySelector(".fae-cc-pieza");
      const red = [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === frase.nivel);
      act(() => {
        finDeAnimacion(pieza, "fae-cc-arrastre");
        red.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      });
      dejarCorrer(500);
    }
    await act(async () => {});

    assert.ok(detalle, "la corriente no terminó");
    assert.deepEqual(repetidos(detalle), [], "ítems repetidos en el detalle");
    assert.equal(new Set(vistos).size, CORRIENTE.length, "se saltó alguna frase");
    assert.deepEqual(detalle.map((f) => f.item), vistos, "una fila por frase, en el orden en que salieron");
    assert.ok(detalle.every((f) => !f.ok && f.respuesta === null), "gana lo que llegó primero: la frase ya se había ido");
  } finally {
    desmontar();
  }
});
