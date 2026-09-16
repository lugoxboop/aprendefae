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
 * Y tres pruebas dirigidas, con la secuencia exacta de cada fallo conocido,
 * para que no dependan de que el mono los encuentre.
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
 * `archivo#Nombre` para las que viven como export con nombre: los quince de la
 * 0030 comparten seis mecánicas y cada actividad es un export de
 * bloques/cimientos.jsx o bloques/avanzados.jsx.
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
  ["diagnostico-en-vivo", "DiagnosticoEnVivo.jsx", 2],
  ["arma-grupo-logico", "ArmaGrupoLogico.jsx", 2],
  ["quien-gana-quien-pierde", "QuienGanaQuienPierde.jsx", 2],
  ["corriente-titulares", "CorrienteTitulares.jsx", 2],
  ["explica-la-politica", "ExplicaLaPolitica.jsx", 2],
  ["simulador-de-crisis", "SimuladorDeCrisis.jsx", 2],
  ["constructor-mapa-causal", "MapaCausal.jsx", 1],
  ["asedio-estrategico", "AsedioEstrategico.jsx", 2],
  ["electrocardiograma", "corazon/Electrocardiograma.jsx", 2],
  ["termometro-reacciones", "corazon/Termometro.jsx", 2],
  ["banco-transfusiones", "corazon/BancoTransfusiones.jsx", 2],
  ["biopsia-economica", "corazon/Biopsia.jsx", 2],
  ["triage-emergencias", "corazon/Triage.jsx", 2],
  ["cirugia-reconstruccion", "corazon/Cirugia.jsx", 2],
  ["sala-monitores", "corazon/SalaMonitores.jsx", 2],
  ["clasificador-tesoro", "tesoreria/ClasificadorTesoro.jsx", 2],
  ["directos-indirectos", "tesoreria/DirectosIndirectos.jsx", 2],
  ["flujo-de-caja", "tesoreria/FlujoDeCaja.jsx", 2],
  ["agujero-fiscal", "tesoreria/AgujeroFiscal.jsx", 2],
  ["expansiva-contractiva", "tesoreria/ExpansivaContractiva.jsx", 2],
  ["disena-presupuesto", "tesoreria/DisenaPresupuesto.jsx", 2],
  ["deficit-vs-deuda", "tesoreria/DeficitVsDeuda.jsx", 2],
  ["memorama-tesoro", "bloques/cimientos.jsx#MemoramaTesoro", 2],
  ["memorama-corazon", "bloques/cimientos.jsx#MemoramaCorazon", 2],
  ["memorama-tesoreria", "bloques/cimientos.jsx#MemoramaTesoreria", 2],
  ["que-rama-es", "bloques/cimientos.jsx#QueRamaEs", 2],
  ["cual-componente", "bloques/cimientos.jsx#CualComponente", 2],
  ["cobra-gasta-o-pide", "bloques/cimientos.jsx#CobraGastaOPide", 2],
  ["se-acerca-o-se-aleja", "bloques/avanzados.jsx#SeAcerca", 2],
  ["expediente-gabinete", "bloques/avanzados.jsx#ExpedienteGabinete", 2],
  ["consejo-ministros", "bloques/avanzados.jsx#ConsejoMinistros", 2],
  ["quien-beneficia-auge", "bloques/avanzados.jsx#QuienBeneficiaAuge", 2],
  ["quien-afecta-ajuste", "bloques/avanzados.jsx#QuienAfectaAjuste", 2],
  ["explica-paciente", "bloques/avanzados.jsx#ExplicaPaciente", 2],
  ["explica-contribuyente", "bloques/avanzados.jsx#ExplicaContribuyente", 2],
  ["sala-espera-llena", "bloques/avanzados.jsx#SalaEsperaLlena", 2],
  ["comite-presupuesto", "bloques/avanzados.jsx#ComitePresupuesto", 2],
  /* Política Monetaria (0031) */
  ["memorama-banco-central", "maquinas/actividades.jsx#MemoramaBancoCentral", 2],
  ["quien-decide-esto", "maquinas/actividades.jsx#QuienDecideEsto", 2],
  ["volante-de-la-tasa", "maquinas/actividades.jsx#VolanteDeLaTasa", 2],
  ["caja-de-herramientas", "maquinas/actividades.jsx#CajaDeHerramientas", 2],
  ["a-quien-le-pega-la-tasa", "maquinas/actividades.jsx#AQuienLePegaLaTasa", 2],
  ["cadena-de-transmision", "maquinas/actividades.jsx#CadenaDeTransmision", 2],
  ["explicaselo-a-un-deudor", "maquinas/actividades.jsx#ExplicaseloADeudor", 2],
  ["corriente-de-decisiones", "maquinas/actividades.jsx#CorrienteDeDecisiones", 2],
  ["el-rezago", "maquinas/actividades.jsx#ElRezago", 2],
  ["dilema-banquero-central", "maquinas/actividades.jsx#DilemaBanqueroCentral", 2],
  ["duelo-de-instrumentos", "maquinas/actividades.jsx#DueloDeInstrumentos", 2],
  ["disena-respuesta-monetaria", "maquinas/actividades.jsx#DisenaRespuestaMonetaria", 2],
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
test("diagnostico-en-vivo: un titular cerrado no acepta más toques, ni le hereda intentos al siguiente", async () => {
  const { default: Diagnostico } = await import(MECANICAS + "DiagnosticoEnVivo.jsx");
  const { PROBLEMAS, sortearTitulares } = await import("../../data/juegosPolitica.js");
  /* Todos los titulares del banco, sacados del propio sorteo: cada uno por su texto. */
  const banco = new Map();
  for (let k = 0; k < 400; k++) for (const t of sortearTitulares()) banco.set(t.texto, t);

  let detalle = null;
  const { caja, desmontar } = await montar(Diagnostico, { onCompletar: (_p, _ms, d) => { detalle = d; } }, 2026);
  const titularEnPantalla = () => {
    const texto = [...banco.keys()].find((t) => caja.textContent.includes(t));
    return texto ? banco.get(texto) : null;
  };
  const boton = (problemaId) => {
    const p = PROBLEMAS.find((x) => x.id === problemaId);
    return caja.querySelector(`button[aria-label="Clasificar como ${p.nombre}"]`);
  };
  const otroQue = (problemaId, salvo = null) => PROBLEMAS.find((x) => x.id !== problemaId && x.id !== salvo).id;

  try {
    const vistos = [];
    for (let n = 0; n < 8; n++) {
      const t = titularEnPantalla();
      assert.ok(t, `no hay titular en pantalla en la vuelta ${n + 1}`);
      vistos.push(t.id);

      if (n === 0) {
        /* Dos fallos —se cierra— y el correcto antes de que avance: el fallo de producción. */
        click(boton(otroQue(t.problema)));
        click(boton(otroQue(t.problema, otroQue(t.problema))));
        const correcto = boton(t.problema);
        if (!correcto.disabled) click(correcto);
      } else if (n === 1) {
        /* Dos fallos —se cierra— y un TERCER fallo antes de que avance: la variante de intentos. */
        const a = otroQue(t.problema);
        const b = otroQue(t.problema, a);
        click(boton(a));
        click(boton(b));
        if (!boton(a).disabled) click(boton(a));
      } else {
        /* El resto, a la primera. */
        click(boton(t.problema));
      }
      dejarCorrer();
    }

    assert.equal(new Set(vistos).size, 8, `salieron titulares repetidos o se saltó alguno: ${vistos.join(", ")}`);

    /* Etapa 2: cualquier respuesta cierra la partida. */
    click([...caja.querySelectorAll("button")].find((b) => b.getAttribute("aria-label")?.includes("brecha")));
    await act(async () => {});

    assert.ok(detalle, "la partida no llegó a registrarse");
    const titulares = detalle.filter((f) => f.item !== "brecha");
    assert.deepEqual(repetidos(detalle), [], "ítems repetidos en el detalle");
    assert.equal(titulares.length, 8, "tienen que registrarse los ocho titulares, uno por fila");
    assert.deepEqual(titulares.map((f) => f.item), vistos, "el detalle tiene que seguir el orden en que se vieron");
    assert.deepEqual(
      { ok: titulares[0].ok, intentos: titulares[0].intentos },
      { ok: false, intentos: 2 },
      "el primer titular se cerró con dos fallos: el toque de después no lo convierte en acierto",
    );
    assert.deepEqual(
      { ok: titulares[2].ok, intentos: titulares[2].intentos },
      { ok: true, intentos: 1 },
      "el tercer titular se acertó a la primera: no puede heredar el intento del toque de más del segundo",
    );
  } finally {
    desmontar();
  }
});

/*
 * ═══════════ DIRIGIDA: corriente-titulares Y SU VENTANA DE 240 ms ═══════════
 *
 * Lo mismo con otra forma. Una carta cerrada por dos fallos sigue en la cinta
 * 240 ms: un toque equivocado en ese hueco le dejaba el reintento a la carta
 * SIGUIENTE —que salía con un solo intento y se registraba ok:false,
 * intentos:2 aunque se acertara a la primera—, y uno correcto sumaba un
 * acierto que el detalle no tenía.
 */
test("corriente-titulares: una carta cerrada no le deja el reintento a la siguiente, ni suma aciertos", async () => {
  const { default: Corriente } = await import(MECANICAS + "CorrienteTitulares.jsx");
  const { CATEGORIAS, BANCO_CORRIENTE } = await import("../../data/juegosPolitica2.js");

  let fin = null;
  const { caja, desmontar } = await montar(Corriente, { onCompletar: (pct, _ms, d) => { fin = { pct, d }; } }, 77);
  const cartaEnPantalla = () => BANCO_CORRIENTE.find((x) => caja.textContent.includes(x.texto));
  const boton = (catId) => {
    const c = CATEGORIAS.find((x) => x.id === catId);
    return caja.querySelector(`button[aria-label="Clasificar como ${c.nombre}"]`);
  };
  const otras = (catId) => CATEGORIAS.filter((x) => x.id !== catId).map((x) => x.id);

  try {
    click([...caja.querySelectorAll("button")].find((b) => b.textContent.includes("Encender")));
    for (let n = 0; n < 40 && !fin; n++) {
      const carta = cartaEnPantalla();
      assert.ok(carta, `no hay carta en la cinta en la vuelta ${n + 1}`);
      const [a, b] = otras(carta.categoria);
      if (n === 0) {
        /* Se cierra por dos fallos, y un tercero en el hueco. */
        click(boton(a));
        click(boton(b));
        if (!boton(a).disabled) click(boton(a));
      } else if (n === 2) {
        /* Se cierra por dos fallos, y el correcto en el hueco: no puede sumar. */
        click(boton(a));
        click(boton(b));
        if (!boton(carta.categoria).disabled) click(boton(carta.categoria));
      } else {
        click(boton(carta.categoria));
      }
      dejarCorrer();
    }
    await act(async () => {});

    assert.ok(fin, "la tanda no terminó");
    const filas = fin.d;
    assert.deepEqual(repetidos(filas), [], "ítems repetidos en el detalle");
    assert.deepEqual(
      { ok: filas[1].ok, intentos: filas[1].intentos, respuesta: filas[1].respuesta },
      { ok: true, intentos: 1, respuesta: null },
      "la segunda carta se acertó a la primera: no puede heredar el reintento de la primera",
    );
    assert.deepEqual({ ok: filas[2].ok, intentos: filas[2].intentos }, { ok: false, intentos: 2 }, "la tercera se cerró con dos fallos");
    assert.equal(
      fin.pct,
      Math.round((filas.filter((f) => f.ok).length * 100) / filas.length),
      "el porcentaje tiene que salir de las mismas cartas que el detalle: un toque tardío no suma",
    );
  } finally {
    desmontar();
  }
});

/*
 * ═══════════ DIRIGIDA: corriente-cruzada, LA FRASE QUE SE VA CON UN TOQUE ENCIMA ═══════════
 *
 * La frase sale por el borde (animationend) y el toque en la red llega antes
 * del pintado: los dos resolvían la MISMA frase. Dos filas, el índice
 * avanzaba dos y la frase siguiente no salía nunca. Gana lo que llegó primero.
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
