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
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const CON_CUENTA = { usuario: { id: "u-prueba" } };

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

/* El aviso de FP tal como lo emite otorgarFP a partir de la fila guardada. */
const avisoDe = (registro, actividadId = "x") => (registro
  ? { fp: registro.fp_awarded, repetida: (registro.repeat_index ?? 0) > 0, actividadId, materiaId: "contabilidad", pctGuardado: registro.correct_pct ?? null }
  : null);

/** La pantalla con una partida ya registrada y validada, como la deja una vista. */
function pantallaCon(partida, { texto = null, celebrando = false, onVolver = () => {}, onRepetir = () => {}, limpiar = () => {} } = {}) {
  const completa = { id: 1, actividadId: "x", listo: true, valida: true, aviso: avisoDe(partida.registro), ...partida };
  const valor = { activa: true, partida: completa, celebrando, limpiar, onVolver };
  return h(ContextoResumen.Provider, { value: valor }, h(PantallaResumen, { texto, onRepetir }));
}

const valor = (caja, dato) => caja.querySelector(`[data-cifra="${dato}"] [data-valor]`)?.textContent ?? null;
const RETROCESO = /bajaste|retroced|descend|perdiste|bajó|caíste|puestos? menos/i;
const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;
const TEAL_O_AMBAR = /#2a9d8f|rgb\(42,\s*157,\s*143\)|#e9c46a|rgb\(233,\s*196,\s*106\)/i;

/* ═══════════════════ EL INTERRUPTOR ═══════════════════ */

test("★★★ interruptor por materia: encendido en Contabilidad y Macroeconomía, apagado por defecto", () => {
  assert.equal(R.pantallaResumenEncendida("contabilidad"), true);
  /* Reencendida en su propio PR. Regla con Levi: si algo se ve mal en Macro, se apaga. */
  assert.equal(R.pantallaResumenEncendida("macroeconomia"), true);
  assert.equal(R.pantallaResumenEncendida("pensamiento-estrategico"), false, "una materia que no está en la lista debe quedar apagada");
  assert.equal(R.pantallaResumenEncendida("inventada"), false);
  assert.equal(R.usaPantallaResumen("macroeconomia", "cual-componente"), true);
  /* Una línea por materia: apagarla es poner su línea en false. */
  const fuente = readFileSync(new URL("../../../hacer/pantallaResumen.js", import.meta.url), "utf8");
  assert.match(fuente, /^  macroeconomia: true,$/m);
  assert.match(fuente, /^  contabilidad: true,$/m);
  assert.equal(R.usaPantallaResumen("contabilidad", "cu-cuadro-dinamicas"), true);
  assert.equal(R.usaPantallaResumen("contabilidad", "t1-desde-donde-preguntan"), true);
});

test("★★ las seis actividades con panel propio no cambian, aunque su materia esté encendida", () => {
  assert.deepEqual([...R.CON_PANEL_PROPIO].sort(), [
    "ciclo-completo", "comite-nova", "memorama-banco-central", "memorama-corazon", "memorama-tesoreria", "memorama-tesoro",
  ]);
  assert.equal(R.usaPantallaResumen("contabilidad", "ciclo-completo"), false);
});

/* ═══════════════════ CON EL INTERRUPTOR APAGADO, IGUAL QUE ANTES ═══════════════════ */

/* Lo que pinta el recuadro de siempre, tal como estaba antes de esta rama. */
const recuadro = (pct, texto) => h(Cierre, { pct, onReiniciar: () => {}, textoReiniciar: "Otra tanda" }, h("p", null, texto));

function VistaMacro({ hijo }) {
  const [, , celebrando] = useRecompensa();
  const resumen = useResumenDePartida("macroeconomia", celebrando);
  return h(ContextoResumen.Provider, { value: resumen.contexto("cual-componente", () => {}) }, hijo);
}

/*
 * Cambia la línea de Macroeconomía solo durante una prueba y la deja como
 * estaba. Encendida, se prueba el código que vuelve el día que se reencienda;
 * apagada, que el cierre es el de siempre.
 */
const conMacro = async (encendida, fn) => {
  const antes = R.PANTALLA_RESUMEN.macroeconomia;
  R.PANTALLA_RESUMEN.macroeconomia = encendida;
  try { return await fn(); } finally { R.PANTALLA_RESUMEN.macroeconomia = antes; }
};
const conMacroApagada = (fn) => conMacro(false, fn);
const conMacroEncendida = (fn) => conMacro(true, fn);

test("★★★ con su línea en false, el cierre de Macroeconomía es idéntico al de antes", () => conMacroApagada(() => {
  const sin = montar(recuadro(67, "4 de 6 bien clasificados."));
  const con = montar(h(AuthContext.Provider, { value: CON_CUENTA }, h(VistaMacro, { hijo: recuadro(67, "4 de 6 bien clasificados.") })));
  try {
    assert.equal(con.caja.innerHTML, sin.caja.innerHTML, "el recuadro de Macro cambió");
    assert.ok(sin.caja.textContent.includes("RESULTADO"));
    assert.ok(sin.caja.textContent.includes("67%"));
    assert.ok([...sin.caja.querySelectorAll("button")].some((b) => b.textContent === "Otra tanda"));
    assert.equal(con.caja.querySelector("[data-pantalla-resumen]"), null);
  } finally { sin.desmontar(); con.desmontar(); }
}));

test("★★★ con su línea en false, registrar llama al servidor una sola vez y devuelve lo mismo", () => conMacroApagada(async () => {
  let resumen = null;
  function Arnes() { resumen = useResumenDePartida("macroeconomia", false); return null; }
  const m = montar(h(AuthContext.Provider, { value: CON_CUENTA }, h(Arnes)));
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
    assert.equal(resumen.contexto("cual-componente", () => {}).partida, null, "guardó una partida para la pantalla");
  } finally { m.desmontar(); }
}));

test("★★★ el aviso de FP: sale si nadie lo reclama, si la partida cae a la salvaguarda y en los paneles propios", () => {
  const m = montar(h(AvisoFP));
  try {
    /* Ninguna partida anunciada: el aviso de siempre. */
    act(() => emitirFP({ fp: 25, repetida: false, actividadId: "electrocardiograma", materiaId: "macroeconomia" }));
    assert.ok(m.caja.textContent.includes("+25 FP"));
  } finally { m.desmontar(); }

  const c = montar(h(AvisoFP));
  const base = { actividadId: "cu-cuadro-dinamicas", formato: R.FORMATO.X_DE_N, pct: 80, detalle: filas(4, 1), conCuenta: true };
  try {
    /* Una partida válida: el aviso lo calla la pantalla. */
    const soltar = R.anunciarPartida("cu-cuadro-dinamicas", base);
    act(() => emitirFP({ fp: 25, repetida: false, actividadId: "cu-cuadro-dinamicas", materiaId: "contabilidad" }));
    soltar();
    assert.equal(c.caja.textContent, "", "salió el aviso con la pantalla de resumen");
    /* Un aviso con puntos que no valen: la salvaguarda devuelve el aviso de siempre. */
    const soltar2 = R.anunciarPartida("cu-cuadro-dinamicas", base);
    act(() => emitirFP({ fp: -3, repetida: false, actividadId: "cu-cuadro-dinamicas", materiaId: "contabilidad" }));
    soltar2();
    assert.ok(c.caja.textContent.includes("FP") || c.caja.textContent.length > 0, "la salvaguarda se quedó sin aviso");
    /* Un panel propio, aunque su materia esté encendida. */
    act(() => emitirFP({ fp: 90, repetida: false, actividadId: "ciclo-completo", materiaId: "contabilidad" }));
    assert.ok(c.caja.textContent.includes("+90 FP"), "el desafío con panel propio perdió su aviso");
  } finally { c.desmontar(); }
});

test("★★★ el aviso de FP de Macro se ve igual que antes de añadir `pctGuardado`", () => {
  const pintar = (datos) => {
    const m = montar(h(AvisoFP));
    try {
      act(() => emitirFP(datos));
      return m.caja.innerHTML;
    } finally { m.desmontar(); }
  };
  for (const [fp, repetida] of [[25, false], [0, true], [0, false]]) {
    /* Lo que emitía otorgarFP antes de este cambio, y lo que emite ahora. */
    const antes = { fp, repetida, actividadId: "diagnostico-en-vivo", materiaId: "macroeconomia" };
    const ahora = { ...antes, pctGuardado: 90 };
    const htmlAntes = pintar(antes);
    assert.ok(htmlAntes.length > 0, "no salió el aviso");
    assert.equal(pintar(ahora), htmlAntes, `el aviso cambió (fp ${fp}, repetida ${repetida})`);
  }
  /* otorgarFP solo añade ese campo al aviso: los de siempre siguen, con los mismos nombres. */
  const fuente = readFileSync(new URL("../../../fp/otorgarFP.js", import.meta.url), "utf8");
  assert.match(fuente, /emitirFP\(\{ fp, repetida, actividadId, materiaId, pctGuardado \}\)/);
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
    /*
     * 44 PX DE ALTO LOS DOS, Y MEDÍAN 43 Y 41.
     *
     * Esta pantalla cierra toda actividad que la use, así que un blanco de
     * toque corto aquí se multiplica por el catálogo entero. Lo reportaron
     * dos células por separado —C midió 39 en «Otra vez» y E «menos de 44» en
     * «Jugar otra vez»— y las dos tenían razón: el botón que se arregló a las
     * 11:48 era el de `Cierre` (corazon/juego.jsx), no estos.
     *
     * Se comprueba el `minHeight` declarado y no el alto medido, porque en
     * JSDOM nada tiene alto. El alto de verdad lo mide
     * scripts/blanco-de-toque.mjs en la página. Lo que esta prueba impide es
     * que alguien lo quite sin darse cuenta.
     */
    for (const [nombre, boton] of [["volver", volver], ["repetir", repetir]]) {
      assert.equal(boton.style.minHeight, "44px", `${nombre}: el blanco de toque baja de 44 px (kit.md)`);
    }
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

/*
 * ═══════════ NINGÚN CONTADOR TERMINA EN UN VALOR DISTINTO DEL REAL (Levi) ═══════════
 *
 * Las tres cifras que cuentan —puntos, «X de N» y «P %»— en las tres
 * condiciones en que un contador puede quedarse a medias: la pestaña oculta,
 * el movimiento reducido y una animación trabada (los fotogramas no llegan).
 * El caso de Macro: Diagnóstico repetido, 90 % en el lector y «0 %» en la
 * tarjeta.
 */
const CONDICIONES = {
  "pestaña oculta": {
    poner: () => { reducido = false; Object.defineProperty(w.document, "visibilityState", { value: "hidden", configurable: true }); },
    quitar: () => { delete w.document.visibilityState; },
  },
  "movimiento reducido": { poner: () => { reducido = true; }, quitar: () => {} },
  "animación trabada": {
    poner: () => { reducido = false; globalThis.requestAnimationFrame = () => 0; w.requestAnimationFrame = globalThis.requestAnimationFrame; },
    quitar: () => { globalThis.requestAnimationFrame = RAF_REAL; w.requestAnimationFrame = RAF_REAL; },
  },
};
const RAF_REAL = globalThis.requestAnimationFrame;
const CIFRAS = [
  ["X de N y puntos", { clasificacion: CLAS_EVALUATIVA, pct: 80, detalle: filas(4, 1), registro: fila(25, 0, 80) }, { bien: "4 de 5", puntos: "25" }],
  ["P % y puntos", { clasificacion: CLAS_EVALUATIVA, formato: R.FORMATO.PORCENTAJE, pct: 90, detalle: null, registro: fila(13, 0, 90) }, { resultado: "90 %", puntos: "13" }],
  ["P % repetida (el caso de Macro)", { clasificacion: CLAS_EVALUATIVA, formato: R.FORMATO.PORCENTAJE, pct: 90, detalle: null, registro: fila(0, 1, 90) }, { resultado: "90 %", puntos: "0" }],
];

for (const [condicion, { poner, quitar }] of Object.entries(CONDICIONES)) {
  for (const [nombre, partida, esperado] of CIFRAS) {
    test(`★★★ contadores con ${condicion}: ${nombre} terminan en su valor real`, async () => {
      poner();
      try {
        const m = montar(pantallaCon(partida));
        try {
          await esperar(() => Object.entries(esperado).every(([dato, v]) => valor(m.caja, dato) === v), 1500);
          /* Y se quedan ahí. */
          await new Promise((r) => setTimeout(r, 900));
          for (const [dato, v] of Object.entries(esperado)) assert.equal(valor(m.caja, dato), v, `${dato} no terminó en ${v}`);
        } finally { m.desmontar(); }
      } finally { quitar(); reducido = true; }
    });
  }
}

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
function VistaContabilidad({ respuesta, onRegistro, aviso = undefined }) {
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida("contabilidad", celebrando);
  const clas = clasificacionDe("contabilidad", "cuentas-debe-haber", "cu-cuadro-dinamicas");
  const completar = async (pct, ms, detalle) => {
    celebrar(clas.dificultad, "cu-cuadro-dinamicas");
    await resumen.registrar({ actividadId: "cu-cuadro-dinamicas", clasificacion: clas, pct, detalle }, async () => {
      onRegistro?.({ pct, detalle });
      /* Lo que hace otorgarFP al volver del servidor: emitir el aviso. */
      const datos = aviso !== undefined ? aviso : { fp: respuesta.fp, repetida: respuesta.repetida, actividadId: "cu-cuadro-dinamicas", materiaId: "contabilidad" };
      if (respuesta.ok && datos) emitirFP(datos);
      return respuesta;
    });
  };
  return h("div", null, recompensa,
    h(ContextoResumen.Provider, { value: resumen.contexto("cu-cuadro-dinamicas", () => {}) },
      h(T2.CuadroDinamicas, { onCompletar: completar })));
}
const vistaContabilidad = (props, auth = CON_CUENTA) => h(AuthContext.Provider, { value: auth }, h(VistaContabilidad, props));

test("★★★ El Cuadro, de punta a punta: la celebración, luego la pantalla con lo guardado y su texto propio", async () => {
  let enviado = null;
  const respuesta = { ok: true, fp: 20, repetida: false, registro: fila(20, 0, 80) };
  const m = montar(vistaContabilidad({ respuesta, onRegistro: (x) => { enviado = x; } }));
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
  const caso = (detalle, registro, clasificacion = CLAS_EVALUATIVA) => R.resumenDe({ clasificacion, pct: registro?.correct_pct ?? 0, detalle, registro, aviso: avisoDe(registro), formato: detalle ? undefined : R.FORMATO.PORCENTAJE }).figura;
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

test("★★ rica: 12 facetas («Avanzado») con su pulso; sobria: 6 («Base»), sin pulso; 48 px, aria-hidden", async () => {
  const { LADOS } = await import("../Medalla.jsx");
  reducido = false;
  try {
    const a = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
    try {
      const f = figura(a.caja);
      assert.equal(f.getAttribute("data-figura-facetada"), "rica");
      assert.equal(f.getAttribute("aria-hidden"), "true");
      assert.equal(f.querySelectorAll("[data-faceta]").length, LADOS.avanzado, "la rica no tiene las 12 facetas del Avanzado");
      assert.equal(f.getAttribute("width"), "48");
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
      assert.equal(f.querySelectorAll("[data-faceta]").length, LADOS.base, "la sobria no tiene las 6 facetas del Base");
      assert.equal(f.querySelector("[data-destello]"), null, "el sobrio no debe pulsar");
    } finally { b.desmontar(); }
  } finally { reducido = true; }
});

test("★★★ para que no se lea como medalla: sin contorno, sin nada dentro, un tono, 30–45 %, fuera de la escala de medallas", () => {
  assert.equal(FF.TAMANO, 48);
  for (const tam of [96, 56, 36, 24]) assert.notEqual(FF.TAMANO, tam, "48 px, fuera de la escala de las medallas");
  assert.deepEqual(FF.OPACIDAD_REPOSO, { rica: 0.45, sobria: 0.3 });
  for (const [detalle, registro] of [[filas(5, 0), fila(25)], [filas(3, 2), fila(15)]]) {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 0, detalle, registro }));
    try {
      const f = figura(m.caja);
      /* Ni marco ni anillo: ningún polígono con trazo, ningún círculo, rectángulo ni trazado de contorno. */
      for (const pol of f.querySelectorAll("polygon")) assert.equal(pol.getAttribute("stroke"), "none", "una faceta lleva trazo en el perímetro");
      assert.equal(f.querySelectorAll("circle[stroke], rect, path").length, 0, "hay un contorno o un marco");
      /* Vacía: ni número ni icono. */
      assert.equal(f.querySelectorAll("text, use, image").length, 0);
      assert.ok(Number(f.getAttribute("data-reposo")) <= 0.45, "en reposo nunca a opacidad completa");
    } finally { m.desmontar(); }
  }
});

test("★★★ la figura se queda en un hueco propio, junto al título: fuera de las tarjetas y sin texto en su hueco", () => {
  reducido = false;
  try {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
    try {
      const f = figura(m.caja);
      const hueco = f.closest("[data-hueco-figura]");
      assert.ok(hueco, "la figura no está en su hueco");
      assert.equal(f.closest("[data-cifra]"), null, "la figura no puede ir dentro ni detrás de una tarjeta");
      const sinEstilo = hueco.cloneNode(true);
      sinEstilo.querySelectorAll("style").forEach((x) => x.remove());
      assert.equal(sinEstilo.textContent.trim(), "", "hay texto en el hueco de la figura");
      assert.equal(hueco.style.width, "48px");
      assert.equal(hueco.getAttribute("aria-hidden"), "true");
      assert.equal(hueco.parentElement.querySelector("h3")?.id, "fae-resumen-titulo", "no está en la fila del título");
      for (const t of m.caja.querySelectorAll("[data-tarjeta]")) {
        const alfa = Number(t.style.background.match(/[\d.]+/g)?.[3] ?? 1);
        assert.ok(alfa >= 0.92, `fondo de tarjeta con opacidad ${alfa}`);
      }
    } finally { m.desmontar(); }
  } finally { reducido = true; }
});

test("★★★ la figura se queda: pasado 1,5 s sigue en pantalla, y su último fotograma es el reposo", async () => {
  reducido = false;
  try {
    const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 60, detalle: filas(3, 2), registro: fila(15) }));
    try {
      const cuerpo = figura(m.caja).querySelector(".fae-ff-cuerpo");
      /* «both»: al terminar se queda en el 100 %, que es la opacidad de reposo. */
      assert.match(cuerpo.style.animation, /1500ms .* both/);
      assert.match(figura(m.caja).innerHTML, /100% \{ opacity: var\(--fae-ff-reposo\)/);
      assert.equal(figura(m.caja).style.getPropertyValue("--fae-ff-reposo"), "0.3");
      await new Promise((r) => setTimeout(r, FF.DURACION + 300));
      assert.ok(figura(m.caja), "la figura se fue: debe quedarse");
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

test("★★ con movimiento reducido: la figura aparece ya en reposo, sin crecer ni pulsar, y se queda", async () => {
  reducido = true;
  const m = montar(pantallaCon({ clasificacion: CLAS_EVALUATIVA, pct: 100, detalle: filas(5, 0), registro: fila(25) }));
  try {
    const f = figura(m.caja);
    assert.equal(f.getAttribute("data-reducido"), "si");
    assert.equal(f.querySelector("[data-destello]"), null, "con movimiento reducido no hay pulso");
    const cuerpo = f.querySelector(".fae-ff-cuerpo");
    assert.equal(cuerpo.style.animation, "", "con movimiento reducido no se anima");
    assert.equal(cuerpo.style.opacity, "0.45", "debe aparecer directamente con la opacidad de reposo del perfecto");
    await new Promise((r) => setTimeout(r, FF.DURACION + 300));
    assert.ok(figura(m.caja), "con movimiento reducido también se queda");
  } finally { m.desmontar(); }
});

test("★★ T1-4: la línea del 16.67 % ahora dice cuántos hechos hay y que valen lo mismo", () => {
  const fuente = readFileSync(new URL("../../mecanicas/libros/tema1/QueLePasaACadaUno.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, /Cada hecho valía/);
  assert.match(fuente, /Cada uno de los \{cuantas\} hechos vale lo mismo en tu resultado\./);
});

/* ═══════════════════ MACROECONOMÍA: LA SALVAGUARDA Y LA FUENTE DE LOS PUNTOS (Levi) ═══════════════════ */

const { SUBJECTS, HACER } = await import("../../../data/subjects.js");

/*
 * Una actividad mínima: al tocar «Terminar» entrega lo que se le dé y pinta el
 * Cierre compartido, como cualquier mecánica. La vista es la de siempre: la
 * celebración, el hook y el registro, con el servidor sustituido.
 */
function MecanicaDePrueba({ onCompletar, pct, detalle }) {
  const [fin, setFin] = React.useState(false);
  if (fin) return h(Cierre, { pct: Math.round(Number(pct) || 0), onReiniciar: () => setFin(false), textoReiniciar: "Otra tanda" }, h("p", null, "Texto propio."));
  return h("button", { type: "button", "data-terminar": true, onClick: () => { setFin(true); onCompletar(pct, 1000, detalle); } }, "Terminar");
}
function VistaPrueba({ materia, actividadId, clasificacion, pct, detalle, respuesta, aviso }) {
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(materia, celebrando);
  const completar = (p, ms, d) => {
    celebrar("facil", actividadId);
    resumen.registrar({ actividadId, clasificacion, pct: p, detalle: d }, async () => {
      if (aviso) emitirFP({ actividadId, materiaId: materia, pctGuardado: respuesta?.registro?.correct_pct ?? null, ...aviso });
      return respuesta;
    });
  };
  return h("div", null, recompensa, h(AvisoFP),
    h(ContextoResumen.Provider, { value: resumen.contexto(actividadId, () => {}) },
      h(MecanicaDePrueba, { onCompletar: completar, pct, detalle })));
}
async function jugarPrueba({ materia = "macroeconomia", actividadId = "cual-componente", clasificacion = CLAS_EVALUATIVA, pct = 80, detalle = filas(4, 1), respuesta = { ok: true, fp: 8, repetida: false, registro: fila(8, 0, 80) }, aviso = { fp: 8, repetida: false }, auth = CON_CUENTA }) {
  const m = montar(h(AuthContext.Provider, { value: auth }, h(VistaPrueba, { materia, actividadId, clasificacion, pct, detalle, respuesta, aviso })));
  await act(async () => { m.caja.querySelector("[data-terminar]").dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await new Promise((r) => setTimeout(r, 0)); });
  /* Se espera a que acabe la celebración de Fácil (1,5 s) y a que algo se decida. */
  await esperar(() => !m.caja.querySelector(".fae-rc") && (m.caja.querySelector("[data-pantalla-resumen]") || m.caja.textContent.includes("RESULTADO")), 6000);
  return m;
}
const esCierreDeSiempre = (caja) => caja.textContent.includes("RESULTADO") && !caja.querySelector("[data-pantalla-resumen]")
  && [...caja.querySelectorAll("button")].some((b) => b.textContent === "Otra tanda");

test("★★★ salvaguarda: cada caso cae al cierre de siempre, con su recuadro y su aviso de FP", () => conMacroEncendida(async () => {
  const casos = [
    ["N = 0 (sin filas)", { detalle: [] }],
    ["X falta (sin detalle en un X de N)", { detalle: null }],
    ["detalle inservible", { detalle: [{ item: "", ok: true }, { item: "a" }] }],
    ["FP falta (no llegó el aviso)", { aviso: null }],
    ["FP no es un número", { aviso: { fp: "8", repetida: false } }],
    ["FP negativo", { aviso: { fp: -1, repetida: false } }],
    ["FP NaN", { aviso: { fp: Number.NaN, repetida: false } }],
    ["repetición que no es sí/no", { aviso: { fp: 0, repetida: "si" } }],
    ["P fuera de 0–100", { actividadId: "tablero-decisiones", detalle: null, pct: 140, respuesta: { ok: true, fp: 10, repetida: false, registro: null } }],
    ["P no es un número", { actividadId: "tablero-decisiones", detalle: null, pct: Number.NaN, respuesta: { ok: true, fp: 10, repetida: false, registro: null } }],
    ["sin cuenta", { auth: { usuario: null }, aviso: null, respuesta: { ok: false, motivo: "sin-sesion" } }],
  ];
  for (const [nombre, caso] of casos) {
    const m = await jugarPrueba(caso);
    try {
      assert.ok(esCierreDeSiempre(m.caja), `${nombre}: no salió el cierre de siempre`);
      if (caso.aviso !== null && !nombre.startsWith("sin cuenta")) {
        /* El aviso sale tal cual salía antes (o no sale, si antes tampoco salía). */
        const fp = (caso.aviso ?? { fp: 8 }).fp;
        if (typeof fp === "number" && fp > 0) assert.ok(m.caja.textContent.includes(`+${fp} FP`), `${nombre}: se perdió el aviso de FP`);
      }
    } finally { m.desmontar(); }
  }
  /* X > N: el conteo no lo produce nunca, pero la regla está. */
  assert.equal(R.cifrasValidas(5, 4), false);
  assert.equal(R.cifrasValidas(-1, 4), false);
  assert.equal(R.cifrasValidas(1.5, 4), false);
  assert.equal(R.cifrasValidas(0, 0), false);
  assert.equal(R.cifrasValidas(4, 4), true);
  /* Y con todo en regla, sale la pantalla y no el aviso. */
  const bien = await jugarPrueba({});
  try {
    assert.ok(bien.caja.querySelector("[data-pantalla-resumen]"), "con datos válidos no salió la pantalla");
    assert.ok(!bien.caja.textContent.includes("+8 FP"), "salieron la pantalla y el aviso a la vez");
  } finally { bien.desmontar(); }
}));

test("★★★ la salvaguarda vale también para Contabilidad", async () => {
  const m = await jugarPrueba({ materia: "contabilidad", actividadId: "cu-debita-o-acredita", detalle: [] });
  try { assert.ok(esCierreDeSiempre(m.caja)); } finally { m.desmontar(); }
});

test("★★★ los puntos de la pantalla son siempre los del aviso de FP, y la repetición, su marca", () => conMacroEncendida(async () => {
  for (const [fp, repetida] of [[8, false], [37, false], [0, true], [90, false]]) {
    /* La fila guardada dice otra cosa a propósito: la pantalla no la lee para los puntos. */
    const m = await jugarPrueba({ aviso: { fp, repetida }, respuesta: { ok: true, fp: 999, repetida: !repetida, registro: fila(999, repetida ? 0 : 5, 80) } });
    try {
      assert.ok(m.caja.querySelector("[data-pantalla-resumen]"), `fp ${fp}: no salió la pantalla`);
      assert.equal(valor(m.caja, "puntos"), String(fp), "los puntos no son los del aviso");
      assert.equal(m.caja.querySelector("[data-pantalla-resumen]").getAttribute("data-repeticion"), repetida ? "si" : "no");
    } finally { m.desmontar(); }
  }
}));

test("★★★ ninguna de las 55 actividades de Macroeconomía queda sin formato", () => {
  const ids = SUBJECTS.macroeconomia.topics.flatMap((t) => (t.actividades ?? t.activities ?? [])
    .filter((a) => a.clasificacion?.tipo === HACER).map((a) => a.id));
  assert.equal(ids.length, 55, `hay ${ids.length} actividades de Hacer en Macro`);
  const validos = new Set(Object.values(R.FORMATO));
  for (const id of ids) {
    assert.ok(validos.has(R.FORMATO_MACRO[id]), `${id} no tiene formato`);
    assert.equal(R.formatoDe(id), R.FORMATO_MACRO[id]);
  }
  assert.deepEqual(Object.keys(R.FORMATO_MACRO).sort(), [...ids].sort(), "hay formatos para actividades que no existen");
  /* Los cinco paneles propios de Macro, como tales. */
  for (const id of ["memorama-corazon", "memorama-tesoro", "memorama-tesoreria", "memorama-banco-central", "comite-nova"]) {
    assert.equal(R.FORMATO_MACRO[id], R.FORMATO.PANEL_PROPIO, id);
  }
  assert.equal(R.FORMATO_MACRO["tablero-decisiones"], R.FORMATO.PORCENTAJE);
});

test("★★★ las 6 actividades con panel propio no cambian: sin pantalla, sin partida y con su aviso", async () => {
  for (const id of R.CON_PANEL_PROPIO) {
    assert.equal(R.usaPantallaResumen("macroeconomia", id), false, id);
    assert.equal(R.usaPantallaResumen("contabilidad", id), false, id);
  }
  /* Su registro pasa tal cual, y el aviso sale como siempre. */
  let resumen = null;
  function Arnes() { resumen = useResumenDePartida("macroeconomia", false); return h(AvisoFP); }
  const m = montar(h(AuthContext.Provider, { value: CON_CUENTA }, h(Arnes)));
  try {
    await act(async () => {
      await resumen.registrar({ actividadId: "memorama-corazon", clasificacion: CLAS_EXPLORATORIA, pct: 100, detalle: filas(4, 0) }, async () => {
        emitirFP({ fp: 10, repetida: false, actividadId: "memorama-corazon", materiaId: "macroeconomia" });
        return { ok: true, fp: 10 };
      });
    });
    assert.equal(resumen.contexto("memorama-corazon", () => {}).activa, false);
    assert.equal(resumen.contexto("memorama-corazon", () => {}).partida, null);
    assert.ok(m.caja.textContent.includes("+10 FP"));
  } finally { m.desmontar(); }
  /* Ninguno de sus cierres pasa por la pantalla: no usan el envoltorio. */
  for (const archivo of ["../../mecanicas/bloques/Memorama.jsx", "../../mecanicas/libros/ciclo/ElCicloCompleto.jsx"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /CierreConResumen/, archivo);
  }
});
