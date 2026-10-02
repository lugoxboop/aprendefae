import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN.
 *
 * Lo que no se puede romper en silencio:
 *   · con el interruptor apagado, Macroeconomía cierra exactamente como antes
 *   · las cifras salen de lo que quedó guardado, no de lo que la mecánica cree
 *   · una repetición dice 0 y lo explica
 *   · nunca hay texto de retroceso, ni «Con error» ni «Repasa»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({
  matches: q.includes("reduce") ? reducido : false,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
  scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const h = React.createElement;

const R = await import("../../../hacer/pantallaResumen.js");
const { default: PantallaResumen, ContextoResumen, useResumenDePartida } = await import("../PantallaResumen.jsx");
const { Cierre } = await import("../../mecanicas/corazon/juego.jsx");
const { default: AvisoFP } = await import("../AvisoFP.jsx");
const { emitirFP } = await import("../../../fp/aviso.js");
const { useRecompensa } = await import("../RecompensaCierre.jsx");
const { clasificacionDe } = await import("../../../data/subjects.js");
const T2 = await import("../../mecanicas/libros/actividades.jsx");
const { FILAS_A_RESOLVER } = await import("../../../contabilidad/cuadroDinamicas.js");

const montar = (elemento) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, raiz, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const esperar = async (cond, ms = 4000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error("no llegó a tiempo");
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
};

const CLAS_EVALUATIVA = { tipo: "hacer", modalidad: "evaluativa", dificultad: "medio" };
const CLAS_EXPLORATORIA = { tipo: "hacer", modalidad: "exploratoria", dificultad: "facil" };
const filas = (bien, mal) => [
  ...Array.from({ length: bien }, (_, k) => ({ item: `b${k}`, ok: true, intentos: 1 })),
  ...Array.from({ length: mal }, (_, k) => ({ item: `m${k}`, ok: false, intentos: 1, respuesta: "x" })),
];
const fila = (fp, repeat = 0, pct = 50) => ({ id: 1, fp_awarded: fp, repeat_index: repeat, correct_pct: pct });

/** La pantalla con una partida ya registrada, como la deja una vista. */
function pantallaCon(partida, { texto = null, celebrando = false, onVolver = () => {}, onRepetir = () => {}, limpiar = () => {} } = {}) {
  const valor = { activa: true, partida: { id: 1, actividadId: "x", listo: true, ...partida }, celebrando, limpiar, onVolver };
  return h(ContextoResumen.Provider, { value: valor }, h(PantallaResumen, { texto, onRepetir }));
}

const valor = (caja, dato) => caja.querySelector(`[data-cifra="${dato}"] [data-valor]`)?.textContent ?? null;
const RETROCESO = /bajaste|retroced|descend|perdiste|bajó|caíste|puestos? menos/i;
const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;
const TEAL_O_AMBAR = /#2a9d8f|rgb\(42,\s*157,\s*143\)|#e9c46a|rgb\(233,\s*196,\s*106\)/i;

/* ═══════════════════ EL INTERRUPTOR ═══════════════════ */

test("★★★ interruptor por materia: encendido solo en Contabilidad, apagado por defecto", () => {
  assert.equal(R.pantallaResumenEncendida("contabilidad"), true);
  assert.equal(R.pantallaResumenEncendida("macroeconomia"), false);
  assert.equal(R.pantallaResumenEncendida("pensamiento-estrategico"), false, "una materia que no está en la lista debe quedar apagada");
  assert.equal(R.pantallaResumenEncendida("inventada"), false);
  assert.equal(R.usaPantallaResumen("macroeconomia", "cual-componente"), false);
  assert.equal(R.usaPantallaResumen("contabilidad", "cu-cuadro-dinamicas"), true);
  assert.equal(R.usaPantallaResumen("contabilidad", "t1-desde-donde-preguntan"), true);
});

test("★★ las seis actividades con panel propio no cambian, aunque su materia esté encendida", () => {
  assert.deepEqual([...R.CON_PANEL_PROPIO].sort(), [
    "ciclo-completo", "comite-nova", "memorama-banco-central", "memorama-corazon", "memorama-tesoreria", "memorama-tesoro",
  ]);
  assert.equal(R.usaPantallaResumen("contabilidad", "ciclo-completo"), false);
});

/* ═══════════════════ MACRO, IGUAL QUE HOY ═══════════════════ */

/* Lo que pinta el recuadro de siempre, tal como estaba antes de esta rama. */
const recuadro = (pct, texto) => h(Cierre, { pct, onReiniciar: () => {}, textoReiniciar: "Otra tanda" }, h("p", null, texto));

function VistaMacro({ hijo }) {
  const [, , celebrando] = useRecompensa();
  const resumen = useResumenDePartida("macroeconomia", celebrando);
  return h(ContextoResumen.Provider, { value: resumen.contexto("cual-componente", () => {}) }, hijo);
}

test("★★★ con el interruptor apagado, el cierre de Macroeconomía es idéntico al de hoy", () => {
  const sin = montar(recuadro(67, "4 de 6 bien clasificados."));
  const con = montar(h(VistaMacro, { hijo: recuadro(67, "4 de 6 bien clasificados.") }));
  try {
    assert.equal(con.caja.innerHTML, sin.caja.innerHTML, "el recuadro de Macro cambió");
    assert.ok(sin.caja.textContent.includes("RESULTADO"));
    assert.ok(sin.caja.textContent.includes("67%"));
    assert.ok([...sin.caja.querySelectorAll("button")].some((b) => b.textContent === "Otra tanda"));
    assert.equal(con.caja.querySelector("[data-pantalla-resumen]"), null);
  } finally { sin.desmontar(); con.desmontar(); }
});

test("★★★ con el interruptor apagado, registrar llama al servidor una sola vez y devuelve lo mismo", async () => {
  let resumen = null;
  function Arnes() { resumen = useResumenDePartida("macroeconomia", false); return null; }
  const m = montar(h(Arnes));
  try {
    let llamadas = 0;
    const devuelto = { ok: true, fp: 10, repetida: false, registro: fila(10) };
    let r;
    await act(async () => {
      r = await resumen.registrar({ actividadId: "cual-componente", clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(6, 0) }, async () => { llamadas += 1; return devuelto; });
    });
    assert.equal(llamadas, 1);
    assert.equal(r, devuelto);
    assert.equal(resumen.contexto("cual-componente", () => {}).activa, false);
    assert.equal(resumen.contexto("cual-componente", () => {}).partida, null, "Macro guardó una partida para la pantalla");
  } finally { m.desmontar(); }
});

test("★★★ el aviso de FP sigue saliendo en Macro y en los paneles propios; en Contabilidad lo dice la pantalla", () => {
  const m = montar(h(AvisoFP));
  try {
    act(() => emitirFP({ fp: 25, repetida: false, actividadId: "electrocardiograma", materiaId: "macroeconomia" }));
    assert.ok(m.caja.textContent.includes("+25 FP"), "Macro perdió su aviso de FP");
  } finally { m.desmontar(); }

  const c = montar(h(AvisoFP));
  try {
    act(() => emitirFP({ fp: 25, repetida: false, actividadId: "cu-cuadro-dinamicas", materiaId: "contabilidad" }));
    assert.equal(c.caja.textContent, "", "salió el aviso de FP con la pantalla de resumen encendida");
    act(() => emitirFP({ fp: 90, repetida: false, actividadId: "ciclo-completo", materiaId: "contabilidad" }));
    assert.ok(c.caja.textContent.includes("+90 FP"), "el desafío con panel propio perdió su aviso");
  } finally { c.desmontar(); }
});

/* ═══════════════════ LAS CIFRAS, DE LO GUARDADO ═══════════════════ */

test("★★★ «bien a la primera» cuenta las filas como las guarda el servidor, y los FP son los de la fila guardada", () => {
  /* Un ítem repetido (gana la primera aparición) y uno inservible (sin ok). */
  const detalle = [
    { item: "a", ok: true }, { item: "b", ok: false }, { item: "a", ok: false },
    { item: "c", ok: true }, { item: "", ok: true }, { item: "d" }, { item: "e", ok: false },
  ];
  assert.deepEqual(R.conteoGuardado(detalle), { bien: 2, n: 4 });

  /* El porcentaje que dice la mecánica (99) no manda: mandan el detalle y la fila. */
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 99, detalle, registro: fila(37, 0, 50) }));
  try {
    assert.equal(valor(m.caja, "bien"), "2 de 4");
    assert.equal(valor(m.caja, "puntos"), "37");
    assert.equal(m.caja.querySelector("[data-lector]").textContent, "Resultado: 2 de 4 bien a la primera, 37 puntos ganados.");
  } finally { m.desmontar(); }
});

test("★★ sin fila guardada (sin cuenta, o si la escritura falló) no se ganó nada: dice 0", () => {
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: null }));
  try {
    assert.equal(valor(m.caja, "puntos"), "0");
    assert.equal(m.caja.querySelector("[data-nota-repeticion]"), null);
  } finally { m.desmontar(); }
});

test("★★★ una repetición muestra 0, la nota en #A8B6C8 y «Repaso completado.»", () => {
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(0, 2, 100) }));
  try {
    assert.equal(m.caja.querySelector("h3").textContent, "Repaso completado.");
    assert.equal(valor(m.caja, "puntos"), "0");
    const nota = m.caja.querySelector("[data-nota-repeticion]");
    assert.equal(nota?.textContent, "Estos puntos ya los tenías de antes.");
    assert.match(nota.style.color, /#a8b6c8|rgb\(168,\s*182,\s*200\)/i);
    assert.equal(m.caja.querySelector("[data-lector]").textContent, "Resultado: 5 de 5 bien a la primera, 0 puntos ganados, sin puntos nuevos.");
  } finally { m.desmontar(); }
});

/* ═══════════════════ TÍTULOS, RECUADRO Y FORMAS ═══════════════════ */

test("★★ el título y el mensaje por franja: ≥80 %, 50–79 %, <50 %", () => {
  const casos = [
    [filas(4, 1), "Esto ya lo manejas.", "La mayoría te salió a la primera. Puedes seguir."],
    [filas(5, 0), "Esto ya lo manejas.", "La mayoría te salió a la primera. Puedes seguir."],
    [filas(3, 2), "Vas bien. Falta afinar algo.", "La mitad o más te salió bien. Repetirla te ayuda a afinar."],
    [filas(1, 1), "Vas bien. Falta afinar algo.", "La mitad o más te salió bien. Repetirla te ayuda a afinar."],
    [filas(2, 3), "Esto necesita otra vuelta.", "Menos de la mitad te salió a la primera. Repetirla es la mejor forma de afianzarla."],
    [filas(0, 5), "Esto necesita otra vuelta.", "Menos de la mitad te salió a la primera. Repetirla es la mejor forma de afianzarla."],
  ];
  for (const [detalle, titulo, mensaje] of casos) {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 0, detalle, registro: fila(10) }));
    try {
      assert.equal(m.caja.querySelector("h3").textContent, titulo);
      assert.equal(m.caja.querySelector("[data-recuadro]").textContent, mensaje, "sin texto propio, va el mensaje por franja");
    } finally { m.desmontar(); }
  }
});

test("★★ el recuadro lleva el texto de cierre propio de la actividad cuando lo tiene", () => {
  const texto = h("p", null, "3 de 5 al primer intento. Cada fila valía 20.00 %.");
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 60, detalle: filas(3, 2), registro: fila(15) }, { texto }));
  try {
    assert.equal(m.caja.querySelector("[data-recuadro]").textContent, "3 de 5 al primer intento. Cada fila valía 20.00 %.");
  } finally { m.desmontar(); }
});

test("★★ exploratoria: «Recorrido terminado.», solo la cifra de puntos, centrada", () => {
  const m = montar(pantallaCon({ clasificacion: CLAS_EXPLORATORIA, pct: 100, detalle: filas(3, 0), registro: fila(10) }));
  try {
    assert.equal(m.caja.querySelector("h3").textContent, "Recorrido terminado.");
    assert.equal(m.caja.querySelector('[data-cifra="bien"]'), null);
    assert.equal(m.caja.querySelector('[data-cifra="puntos"]').style.textAlign, "center");
    assert.equal(m.caja.querySelector("[data-recuadro]").textContent, "Aquí no se califica. Puedes volver cuando quieras.");
    assert.equal(m.caja.querySelector("[data-lector]").textContent, "Recorrido terminado, 10 puntos ganados.");
  } finally { m.desmontar(); }
});

test("★★ sin detalle (El tablero de decisiones): «Resultado: P %» en lugar de X de N", () => {
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 60, detalle: null, registro: fila(30, 0, 60) }));
  try {
    assert.equal(m.caja.querySelector('[data-cifra="bien"]'), null);
    assert.equal(m.caja.querySelector('[data-cifra="resultado"] p').textContent, "Resultado:");
    assert.equal(valor(m.caja, "resultado"), "60 %");
    assert.equal(m.caja.querySelector("h3").textContent, "Vas bien. Falta afinar algo.");
  } finally { m.desmontar(); }
});

test("★★ botones: «Volver al camino» y «Repetir» con su nota; cada uno hace lo suyo", () => {
  let volvio = 0; let repitio = 0; let limpio = 0;
  const m = montar(pantallaCon(
    { clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) },
    { onVolver: () => { volvio += 1; }, onRepetir: () => { repitio += 1; }, limpiar: () => { limpio += 1; } },
  ));
  try {
    const volver = m.caja.querySelector("[data-volver]");
    const repetir = m.caja.querySelector("[data-repetir]");
    assert.equal(volver.textContent, "Volver al camino");
    assert.equal(repetir.textContent, "Repetir");
    const nota = m.caja.querySelector("[data-nota-repetir]");
    assert.equal(nota.textContent, "Repetir no suma puntos nuevos.");
    assert.match(nota.style.color, /#a8b6c8|rgb\(168,\s*182,\s*200\)/i);
    tocar(repetir);
    assert.equal(repitio, 1); assert.equal(limpio, 1);
    tocar(volver);
    assert.equal(volvio, 1);
  } finally { m.desmontar(); }
});

test("★★ las cifras cuentan desde 0, y con movimiento reducido salen ya quietas", async () => {
  reducido = false;
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(8, 0), registro: fila(50) }));
  try {
    assert.equal(valor(m.caja, "puntos"), "0", "no arrancó en 0");
    await esperar(() => valor(m.caja, "puntos") === "50");
    assert.equal(valor(m.caja, "bien"), "8 de 8");
  } finally { m.desmontar(); reducido = true; }
  const q = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(8, 0), registro: fila(50) }));
  try { assert.equal(valor(q.caja, "puntos"), "50"); } finally { q.desmontar(); }
});

test("★★ espera a que termine la celebración, y mientras se guarda no inventa cifras", () => {
  const a = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }, { celebrando: true }));
  try { assert.equal(a.caja.innerHTML, "", "salió encima de la celebración"); } finally { a.desmontar(); }
  const b = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: null, listo: false }));
  try {
    assert.equal(b.caja.querySelector("[data-pantalla-resumen]"), null);
    assert.ok(b.caja.querySelector("[data-resumen-esperando]"));
  } finally { b.desmontar(); }
});

/* ═══════════════════ LO QUE NUNCA APARECE ═══════════════════ */

test("★★★ nunca aparece texto de retroceso, en ningún caso", () => {
  const variantes = [
    { clasificacion: CLAS_EVALUATIVA, detalle: filas(0, 6), registro: fila(25) },
    { clasificacion: CLAS_EVALUATIVA, detalle: filas(3, 3), registro: fila(0, 4) },
    { clasificacion: CLAS_EVALUATIVA, detalle: null, pct: 10, registro: fila(25, 0, 10) },
    { clasificacion: CLAS_EXPLORATORIA, detalle: filas(2, 0), registro: fila(0, 1) },
    { clasificacion: CLAS_EVALUATIVA, detalle: filas(5, 0), registro: null },
  ];
  for (const v of variantes) {
    const m = montar(pantallaCon(v));
    try {
      const todo = m.caja.textContent + m.caja.querySelector("[data-lector]").textContent;
      assert.doesNotMatch(todo, RETROCESO);
    } finally { m.desmontar(); }
  }
  for (const archivo of ["../PantallaResumen.jsx", "../../../hacer/pantallaResumen.js"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /bajaste|retrocediste|perdiste|descendiste/i, archivo);
  }
});

test("★★★ en el componente no queda ningún «Con error» ni «Repasa»", () => {
  for (const archivo of ["../PantallaResumen.jsx", "../../../hacer/pantallaResumen.js"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /con error/i, archivo);
    assert.doesNotMatch(fuente, /repasa/i, archivo);
  }
});

test("★★ estilo: sin coral, cifras en blanco (ni verde azulado ni ámbar), sin trofeos ni confeti", () => {
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 40, detalle: filas(2, 3), registro: fila(25) }));
  try {
    assert.doesNotMatch(m.caja.innerHTML, CORAL);
    for (const v of m.caja.querySelectorAll("[data-valor]")) {
      assert.match(v.style.color, /#f8f9fa|rgb\(248,\s*249,\s*250\)/i);
      assert.doesNotMatch(v.style.color, TEAL_O_AMBAR);
      assert.equal(v.style.fontSize, "36px");
      assert.equal(v.style.fontWeight, "700");
      assert.match(v.style.fontFamily, /Sora/);
    }
    assert.doesNotMatch(m.caja.textContent, /🏆|👑|💎|🎉|🎊|trofeo|corona|cofre|gema|confeti/i);
  } finally { m.desmontar(); }
});

/* ═══════════════════ DE PUNTA A PUNTA, CON UNA ACTIVIDAD DE VERDAD ═══════════════════ */

/*
 * Lo que hace la vista de Contabilidad, con el servidor sustituido por una
 * respuesta fija: la pantalla se arma con el detalle real de la partida y la
 * fila que «devolvió» registrar_fp. Nada aquí escribe en ningún sitio.
 */
function VistaContabilidad({ respuesta, onRegistro }) {
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida("contabilidad", celebrando);
  const clas = clasificacionDe("contabilidad", "cuentas-debe-haber", "cu-cuadro-dinamicas");
  const completar = async (pct, ms, detalle) => {
    celebrar(clas.dificultad, "cu-cuadro-dinamicas");
    await resumen.registrar({ actividadId: "cu-cuadro-dinamicas", clasificacion: clas, pct, detalle }, async () => {
      onRegistro?.({ pct, detalle });
      return respuesta;
    });
  };
  return h("div", null, recompensa,
    h(ContextoResumen.Provider, { value: resumen.contexto("cu-cuadro-dinamicas", () => {}) },
      h(T2.CuadroDinamicas, { onCompletar: completar })));
}

test("★★★ El Cuadro, de punta a punta: la celebración, luego la pantalla con lo guardado y su texto propio", async () => {
  let enviado = null;
  const respuesta = { ok: true, fp: 20, repetida: false, registro: fila(20, 0, 80) };
  const m = montar(h(VistaContabilidad, { respuesta, onRegistro: (x) => { enviado = x; } }));
  try {
    const boton = (t) => [...m.caja.querySelectorAll("button")].find((b) => new RegExp(t).test(b.textContent));
    FILAS_A_RESOLVER.forEach((f, k) => {
      /* La primera fila, mal a la primera y bien al segundo intento. */
      if (k === 0) tocar([...m.caja.querySelectorAll("[data-ficha]")].find((x) => x.getAttribute("data-ficha") !== f.debito));
      tocar([...m.caja.querySelectorAll("[data-ficha]")].find((x) => x.getAttribute("data-ficha") === f.debito));
      tocar(boton(k + 1 === FILAS_A_RESOLVER.length ? "Ver el cuadro completo" : "Siguiente fila"));
    });
    tocar(boton("Ver el resultado"));
    /* Mientras suena la celebración, ni el recuadro viejo ni la pantalla. */
    assert.equal(m.caja.querySelector("[data-pantalla-resumen]"), null);
    assert.ok(!m.caja.textContent.includes("RESULTADO"), "salió el recuadro de resultado de antes");
    await esperar(() => m.caja.querySelector("[data-pantalla-resumen]"), 6000);
    assert.equal(valor(m.caja, "bien"), `4 de 5`);
    assert.equal(R.conteoGuardado(enviado.detalle).n, 5);
    assert.equal(valor(m.caja, "puntos"), "20");
    assert.equal(m.caja.querySelector("[data-pantalla-resumen] h3").textContent, "Esto ya lo manejas.");
    assert.ok(m.caja.querySelector("[data-recuadro]").textContent.includes("4 de 5 al primer intento"), "falta el texto de cierre propio");
    assert.ok(m.caja.querySelector("[data-repetir]"));
    /* «Repetir» vuelve a empezar la actividad, sin pantalla. */
    tocar(m.caja.querySelector("[data-repetir]"));
    assert.equal(m.caja.querySelector("[data-pantalla-resumen]"), null);
    assert.ok(m.caja.querySelector("[data-fila]"), "Repetir no volvió a la actividad");
  } finally { m.desmontar(); }
});

/* ═══════════════════ LA FIGURA FACETADA (Xeno, con las correcciones de Levi) ═══════════════════ */

const FF = await import("../FiguraFacetada.jsx");
const figura = (caja) => caja.querySelector("[data-figura-facetada]");
const PROHIBIDOS = /#2a9d8f|#52c4b0|#e9c46a|rgb\(42,\s*157,\s*143\)|rgb\(82,\s*196,\s*176\)|rgb\(233,\s*196,\s*106\)|FAE\.teal|FAE\.ambar|\bambar\b|ámbar/i;

test("★★★ qué figura toca: perfecto rica; otra primera vez con puntos sobria; repetición, ninguna", () => {
  const caso = (detalle, registro, clasificacion = CLAS_EVALUATIVA) => R.resumenDe({ clasificacion, pct: 0, detalle, registro }).figura;
  assert.equal(caso(filas(5, 0), fila(25)), "rica");
  assert.equal(caso(filas(4, 1), fila(25)), "sobria");
  assert.equal(caso(filas(1, 4), fila(13)), "sobria", "menos del 50 % con puntos también lleva marco sobrio");
  assert.equal(caso(filas(3, 0), fila(10), CLAS_EXPLORATORIA), "sobria", "las exploratorias van siempre con el sobrio");
  assert.equal(caso(filas(5, 0), fila(0, 1)), null, "una repetición no lleva figura");
  assert.equal(caso(filas(5, 0), null), null, "sin puntos ganados no hay figura");
  assert.equal(caso(null, fila(50, 0, 100)), "rica", "sin detalle, perfecto es el 100 %");
});

test("★★★ sin puntos nuevos no hay figura en pantalla", () => {
  for (const registro of [fila(0, 1, 100), fila(0, 3, 40), null]) {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro }));
    try {
      assert.ok(m.caja.querySelector("[data-pantalla-resumen]"));
      assert.equal(figura(m.caja), null, `salió una figura con ${JSON.stringify(registro)}`);
    } finally { m.desmontar(); }
  }
});

test("★★ rica: el marco Élite de las medallas con su pulso; sobria: el Intermedio, sin pulso; las dos aria-hidden", async () => {
  const { LADOS } = await import("../Medalla.jsx");
  reducido = false;
  try {
    const a = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
    try {
      const f = figura(a.caja);
      assert.equal(f.getAttribute("data-figura-facetada"), "rica");
      assert.equal(f.getAttribute("aria-hidden"), "true");
      assert.equal(f.querySelectorAll("[data-faceta]").length, LADOS.elite, "la rica no usa el marco Élite");
      assert.ok(f.querySelector("[data-reticulado]"), "falta el anillo reticulado del Élite");
      const destello = f.querySelector("[data-destello]");
      assert.ok(destello, "el perfecto no tiene pulso");
      /* Una sola pasada de 1,5 s, sin bucle. */
      assert.match(destello.style.animation, /1500ms/);
      assert.doesNotMatch(destello.style.animation + f.innerHTML, /infinite/);
    } finally { a.desmontar(); }
    const b = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 60, detalle: filas(3, 2), registro: fila(15) }));
    try {
      const f = figura(b.caja);
      assert.equal(f.getAttribute("data-figura-facetada"), "sobria");
      assert.equal(f.getAttribute("aria-hidden"), "true");
      assert.equal(f.querySelectorAll("[data-faceta]").length, LADOS.intermedio, "la sobria no usa el marco Intermedio");
      assert.ok(LADOS.intermedio < LADOS.elite, "la sobria debe tener menos facetas");
      assert.equal(f.querySelector("[data-reticulado]"), null);
      assert.equal(f.querySelector("[data-destello]"), null, "el sobrio no debe pulsar");
    } finally { b.desmontar(); }
  } finally { reducido = true; }
});

test("★★ la figura vive detrás de la tarjeta «Puntos ganados», que tiene fondo sólido (≥92 %)", () => {
  reducido = false;
  try {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
    try {
      const f = figura(m.caja);
      assert.equal(f.closest("[data-cifra]")?.getAttribute("data-cifra"), "puntos", "la figura no está en la tarjeta de puntos");
      assert.equal(m.caja.querySelector('[data-cifra="bien"] [data-figura-facetada]'), null, "nunca detrás de «Bien a la primera»");
      for (const t of m.caja.querySelectorAll("[data-tarjeta]")) {
        const alfa = Number(t.style.background.match(/[\d.]+/g)?.[3] ?? 1);
        assert.ok(alfa >= 0.92, `fondo de tarjeta con opacidad ${alfa}`);
      }
      assert.equal(FF.TAMANO, 260);
      assert.equal(FF.DURACION, 1500);
    } finally { m.desmontar(); }
  } finally { reducido = true; }
});

test("★★★ en el componente de la figura no aparecen los colores prohibidos", () => {
  const fuente = readFileSync(new URL("../FiguraFacetada.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, PROHIBIDOS);
  assert.match(fuente, /#B8C4D4/);
  reducido = false;
  try {
    for (const [detalle, registro] of [[filas(5, 0), fila(25)], [filas(3, 2), fila(15)]]) {
      const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 0, detalle, registro }));
      try { assert.doesNotMatch(figura(m.caja).outerHTML, PROHIBIDOS); } finally { m.desmontar(); }
    }
  } finally { reducido = true; }
});

test("★★★ los botones responden mientras la figura está en pantalla", () => {
  reducido = false;
  let volvio = 0; let repitio = 0;
  try {
    const m = montar(pantallaCon(
      { clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) },
      { onVolver: () => { volvio += 1; }, onRepetir: () => { repitio += 1; } },
    ));
    try {
      assert.ok(figura(m.caja), "la figura no estaba");
      /* La capa no toma el puntero y va detrás del contenido. */
      assert.match(FF.default.toString() + readFileSync(new URL("../FiguraFacetada.jsx", import.meta.url), "utf8"), /pointer-events:\s*none/);
      tocar(m.caja.querySelector("[data-repetir]"));
      tocar(m.caja.querySelector("[data-volver]"));
      assert.equal(repitio, 1);
      assert.equal(volvio, 1);
      assert.ok(figura(m.caja), "la figura debía seguir en pantalla durante los clics");
    } finally { m.desmontar(); }
  } finally { reducido = true; }
});

test("★★ con movimiento reducido: la figura aparece quieta, sin pulso, 1,5 s, y desaparece", async () => {
  reducido = true;
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
  try {
    const f = figura(m.caja);
    assert.equal(f.getAttribute("data-reducido"), "si");
    assert.equal(f.querySelector("[data-destello]"), null, "con movimiento reducido no hay pulso");
    assert.equal(f.style.animation, "", "con movimiento reducido no se anima");
    await new Promise((r) => setTimeout(r, FF.REDUCIDO_MS - 300));
    assert.ok(figura(m.caja), "se fue antes de 1,5 s");
    await esperar(() => figura(m.caja) === null, 1500);
  } finally { m.desmontar(); }
});

test("★★ T1-4: la línea del 16.67 % ahora dice cuántos hechos hay y que valen lo mismo", () => {
  const fuente = readFileSync(new URL("../../mecanicas/libros/tema1/QueLePasaACadaUno.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, /Cada hecho valía/);
  assert.match(fuente, /Cada uno de los \{cuantas\} hechos vale lo mismo en tu resultado\./);
});
