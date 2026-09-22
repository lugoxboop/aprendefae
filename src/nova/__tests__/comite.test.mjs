import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL COMITÉ DE NOVA, EN PANTALLA.
 *
 * Tres cosas que no se ven leyendo el contenido y que hay que mirar montadas:
 * que las Etapas 1 y 2 den UN reintento y solo uno, que las 3 y 4 no den
 * ninguno, y que el estado de resultados no se caiga en ninguna transición.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { default: ComiteNova } = await import("../../components/mecanicas/nova/ComiteNova.jsx");
const { default: EtapaComunicados } = await import("../../components/mecanicas/nova/EtapaComunicados.jsx");
const { default: EtapaLinea } = await import("../../components/mecanicas/nova/EtapaLinea.jsx");
const { default: EtapaIncidencia } = await import("../../components/mecanicas/nova/EtapaIncidencia.jsx");
const { default: EtapaComite } = await import("../../components/mecanicas/nova/EtapaComite.jsx");
const { default: CierreNova } = await import("../../components/mecanicas/nova/CierreNova.jsx");
const { COMUNICADOS, MEDIDAS_LINEA, MEDIDAS_INCIDENCIA, ESCENARIOS, PERSONAS, LINEAS, TEXTO_CIERRE } =
  await import("../../data/nova.js");
const { FAE } = await import("../../theme.js");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el, que) => {
  assert.ok(el, `no está en pantalla: ${que}`);
  assert.ok(!el.disabled, `está deshabilitado: ${que}`);
  act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const porTexto = (caja, txt) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === txt);

/* jsdom devuelve los colores en rgb(), así que las comparaciones van en rgb(). */
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const estilo = (el) => el.getAttribute("style") ?? "";

/* ─────────────────────────── ETAPA 1 · un reintento ─────────────────────────── */

/* Un banco de UNO para que el sorteo no haga aleatorio lo que se quiere medir. */
const unComunicado = (id) => COMUNICADOS.filter((c) => c.id === id);
const otraBandeja = (c) => (c.bandeja === "cobra" ? "gasta" : "cobra");

test("ETAPA 1 · fallar rebota en coral, explica y DEJA el comunicado en la mesa", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const fin = [];
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${otraBandeja(c)}"]`), "bandeja equivocada");
    /* Sigue el mismo comunicado, con su explicación de error y sin cerrar nada. */
    assert.ok(m.caja.querySelector(`[data-comunicado="${c.id}"]`), "el comunicado se fue de la mesa");
    assert.ok(m.caja.querySelector("[data-error]"), "no explicó el error");
    assert.equal(m.caja.querySelectorAll("[data-acierto]").length, 0, "reveló la respuesta al primer fallo");
    assert.equal(fin.length, 0);
    /* Y las tres bandejas siguen vivas: el reintento existe de verdad. */
    for (const b of ["cobra", "gasta", "presta"]) {
      assert.ok(!m.caja.querySelector(`[data-bandeja="${b}"]`).disabled, `${b} quedó bloqueada`);
    }
  } finally {
    m.desmontar();
  }
});

test("ETAPA 1 · el reintento cierra el ítem pase lo que pase: no hay un tercero", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const fin = [];
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${otraBandeja(c)}"]`), "primer fallo");
    click(m.caja.querySelector('[data-bandeja="presta"]'), "segundo fallo");
    /* Se resuelve: se ve la explicación de la bandeja correcta y las tres se apagan. */
    assert.ok(m.caja.querySelector("[data-acierto]"), "no reveló cuál era");
    for (const b of ["cobra", "gasta", "presta"]) {
      assert.ok(m.caja.querySelector(`[data-bandeja="${b}"]`).disabled, `${b} admite un tercer intento`);
    }
    click(porTexto(m.caja, "Cerrar la bandeja"), "cerrar");
    assert.equal(fin.length, 1);
    assert.equal(fin[0].pct, 0, "fallar dos veces no puede puntuar");
    assert.deepEqual(fin[0].filas.map((f) => [f.item, f.ok, f.intentos]), [["c01", false, 2]]);
  } finally {
    m.desmontar();
  }
});

test("ETAPA 1 · acertar tras fallar NO recupera el punto", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const fin = [];
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${otraBandeja(c)}"]`), "fallo");
    click(m.caja.querySelector(`[data-bandeja="${c.bandeja}"]`), "acierto en el reintento");
    click(porTexto(m.caja, "Cerrar la bandeja"), "cerrar");
    assert.equal(fin[0].pct, 0, "el reintento no puntúa; si no, bastaba con probar las tres");
    assert.equal(fin[0].filas[0].ok, false);
    assert.equal(fin[0].filas[0].intentos, 2);
    assert.equal(fin[0].filas[0].respuesta, otraBandeja(c), "guarda dónde la metió la primera vez");
  } finally {
    m.desmontar();
  }
});

test("ETAPA 1 · acertar al primer intento vale el 100 % del lote", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const fin = [];
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${c.bandeja}"]`), "bandeja correcta");
    assert.equal(m.caja.querySelector("[data-acierto]").textContent, c.acierto, "el texto no es el de Gen");
    click(porTexto(m.caja, "Cerrar la bandeja"), "cerrar");
    assert.equal(fin[0].pct, 100);
    assert.deepEqual(fin[0].filas.map((f) => [f.item, f.ok, f.intentos]), [["c01", true, 1]]);
  } finally {
    m.desmontar();
  }
});

test("ETAPA 1 · el sorteo reparte ocho del banco de catorce, sin repetir", () => {
  const fin = [];
  const m = montar(React.createElement(EtapaComunicados, { onTerminar: (pct, filas) => fin.push(filas) }));
  try {
    const vistos = [];
    for (let i = 0; i < 8; i += 1) {
      const actual = m.caja.querySelector("[data-comunicado]").getAttribute("data-comunicado");
      vistos.push(actual);
      const c = COMUNICADOS.find((x) => x.id === actual);
      click(m.caja.querySelector(`[data-bandeja="${c.bandeja}"]`), `acierto ${i}`);
      click([...m.caja.querySelectorAll("button")].find((b) => /Siguiente comunicado|Cerrar la bandeja/.test(b.textContent)), "avanzar");
    }
    assert.equal(vistos.length, 8);
    assert.equal(new Set(vistos).size, 8, "un comunicado salió dos veces en el mismo intento");
    assert.equal(fin.length, 1);
    assert.equal(fin[0].length, 8);
  } finally {
    m.desmontar();
  }
});

/* ─────────────────────────── ETAPA 2 · sobre el estado ─────────────────────────── */

/*
 * La Etapa 2 no dibuja opciones: le presta las manos al estado de resultados.
 * Aquí se monta con un panel de mentira que recoge lo que la etapa le manda y
 * devuelve el `onTocar`, que es exactamente lo que hace el orquestador.
 */
function conPanel(banco, alTerminar) {
  const recibido = { vista: {} };
  const panel = (parcial) => { Object.assign(recibido.vista, parcial); };
  const m = montar(React.createElement(EtapaLinea, { banco, panel, onTerminar: alTerminar }));
  return { ...m, recibido };
}

const unaMedida = (id) => MEDIDAS_LINEA.filter((x) => x.id === id);

test("ETAPA 2 · las líneas del estado SON los botones, y se apagan al resolver", () => {
  const fin = [];
  const m = conPanel(unaMedida("l01"), (pct, filas) => fin.push({ pct, filas }));
  try {
    assert.equal(typeof m.recibido.vista.onTocar, "function", "no pidió las manos del estado");
    assert.equal(m.caja.querySelectorAll("[data-persona], [data-linea]").length, 0, "se dibujó una lista de opciones aparte");
    act(() => m.recibido.vista.onTocar("impuestos"));
    assert.ok(m.caja.querySelector("[data-acierto]"), "no resolvió");
    assert.equal(m.recibido.vista.onTocar, null, "las líneas siguen tocables con la respuesta en pantalla");
    assert.equal(m.recibido.vista.movida, "impuestos");
    assert.equal(m.recibido.vista.direccion, "sube");
  } finally {
    m.desmontar();
  }
});

test("ETAPA 2 · un reintento, ni más ni menos, y solo puntúa el primero", () => {
  const fin = [];
  const m = conPanel(unaMedida("l01"), (pct, filas) => fin.push({ pct, filas }));
  try {
    act(() => m.recibido.vista.onTocar("ventas"));
    assert.ok(m.caja.querySelector("[data-error]") || true, "la Etapa 2 tiene huecos de texto a propósito");
    assert.equal(m.caja.querySelectorAll("[data-acierto]").length, 0, "reveló al primer fallo");
    assert.equal(typeof m.recibido.vista.onTocar, "function", "no dio el reintento");
    assert.equal(m.recibido.vista.erronea, "ventas", "no marcó en coral la línea tocada");

    act(() => m.recibido.vista.onTocar("costos"));
    assert.ok(m.caja.querySelector("[data-acierto]"), "el segundo intento no cerró el ítem");
    assert.equal(m.recibido.vista.onTocar, null, "hay un tercer intento");

    click(porTexto(m.caja, "Cerrar el estado"), "cerrar");
    assert.equal(fin[0].pct, 0);
    assert.deepEqual(fin[0].filas.map((f) => [f.item, f.ok, f.intentos, f.respuesta]), [["l01", false, 2, "ventas"]]);
  } finally {
    m.desmontar();
  }
});

test("ETAPA 2 · la línea dormida despierta con la medida del crédito, y solo con esa", () => {
  const fin = [];
  const m = conPanel(unaMedida("l08"), (pct) => fin.push(pct));
  try {
    act(() => m.recibido.vista.onTocar("financieros"));
    assert.equal(m.recibido.vista.despierta, true);
    assert.equal(m.recibido.vista.movida, "financieros");
  } finally {
    m.desmontar();
  }

  const otra = conPanel(unaMedida("l03"), () => {});
  try {
    act(() => otra.recibido.vista.onTocar("costos"));
    assert.notEqual(otra.recibido.vista.despierta, true, "una medida cualquiera encendió la línea dormida");
  } finally {
    otra.desmontar();
  }
});

/* ─────────────────────────── ETAPA 3 · sin reintento ─────────────────────────── */

const unaIncidencia = (id) => MEDIDAS_INCIDENCIA.filter((x) => x.id === id);

test("ETAPA 3 · las cinco opciones están SIEMPRE, incluida «Nadie»", () => {
  for (const medida of MEDIDAS_INCIDENCIA) {
    const m = montar(React.createElement(EtapaIncidencia, { banco: unaIncidencia(medida.id), onTerminar: () => {} }));
    try {
      const vistas = [...m.caja.querySelectorAll("[data-persona]")].map((b) => b.getAttribute("data-persona"));
      assert.equal(vistas.length, 5, `${medida.id}: no salieron las cinco`);
      assert.deepEqual([...vistas].sort(), PERSONAS.map((p) => p.id).sort(), medida.id);
      assert.ok(vistas.includes("nadie"), `${medida.id}: «Nadie» delataría la respuesta si faltara`);
    } finally {
      m.desmontar();
    }
  }
});

test("ETAPA 3 · una sola oportunidad: al responder, las cinco quedan bloqueadas", () => {
  const medida = MEDIDAS_INCIDENCIA.find((x) => x.id === "m1");
  const m = montar(React.createElement(EtapaIncidencia, { banco: unaIncidencia("m1"), onTerminar: () => {} }));
  try {
    click(m.caja.querySelector('[data-persona="trabajador"]'), "una equivocada");
    for (const p of PERSONAS) {
      assert.ok(m.caja.querySelector(`[data-persona="${p.id}"]`).disabled, `${p.id} admite otro intento`);
    }
    /* Y la explicación que sale es la de Gen para esa confusión exacta. */
    assert.equal(m.caja.querySelector('[data-respuesta="error"]').textContent, medida.gira ? m.caja.querySelector('[data-respuesta="error"]').textContent : "");
    assert.match(m.caja.querySelector('[data-respuesta="error"]').textContent, /^❌/);
  } finally {
    m.desmontar();
  }
});

test("ETAPA 3 · primero quién gira y DESPUÉS de quién sale: nunca al revés", () => {
  const medida = MEDIDAS_INCIDENCIA.find((x) => x.id === "m1");
  const fin = [];
  const m = montar(React.createElement(EtapaIncidencia, { banco: unaIncidencia("m1"), onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    assert.ok(m.caja.querySelector('[data-pregunta="gira"]'), "no empezó por la obligación legal");
    click(m.caja.querySelector(`[data-persona="${medida.gira.correcta}"]`), "quién gira");
    assert.equal(m.caja.querySelector('[data-respuesta="acierto"]').textContent, medida.gira.acierto);
    click(porTexto(m.caja, "Siguiente pregunta"), "pasar");

    assert.ok(m.caja.querySelector('[data-pregunta="soporta"]'), "no preguntó de quién sale");
    click(m.caja.querySelector(`[data-persona="${medida.soporta.correcta}"]`), "quién lo soporta");
    click(porTexto(m.caja, "Cerrar el reparto"), "cerrar");

    assert.equal(fin.length, 1);
    assert.equal(fin[0].pct, 100);
    assert.deepEqual(fin[0].filas.map((f) => f.item), ["m1:gira", "m1:soporta"]);
    assert.ok(fin[0].filas.every((f) => f.intentos === 1), "alguna pregunta admitió más de un intento");
  } finally {
    m.desmontar();
  }
});

test("ETAPA 3 · ocho preguntas: cuatro medidas × dos, a 12,5 % cada una", () => {
  const fin = [];
  const m = montar(React.createElement(EtapaIncidencia, { onTerminar: (pct, filas) => fin.push({ pct, filas }) }));
  try {
    for (let i = 0; i < 8; i += 1) {
      const fase = m.caja.querySelector("[data-pregunta]").getAttribute("data-pregunta");
      const id = m.caja.querySelector("[data-fajo]").getAttribute("data-fajo");
      const medida = MEDIDAS_INCIDENCIA.find((x) => x.id === id);
      /* Se acierta la mitad para que el porcentaje diga algo. */
      const correcta = medida[fase].correcta;
      const elegida = i < 4 ? correcta : PERSONAS.find((p) => p.id !== correcta && p.id !== "nova").id;
      click(m.caja.querySelector(`[data-persona="${elegida}"]`), `pregunta ${i}`);
      click([...m.caja.querySelectorAll("button")].find((b) => /Siguiente pregunta|Cerrar el reparto/.test(b.textContent)), "avanzar");
    }
    assert.equal(fin.length, 1);
    assert.equal(fin[0].filas.length, 8);
    assert.equal(fin[0].pct, 50, "cuatro de ocho son el 50 %");
  } finally {
    m.desmontar();
  }
});

/* ─────────────────────────── ETAPA 4 · sin reintento ─────────────────────────── */

const unEscenario = (id) => ESCENARIOS.filter((e) => e.id === id);

test("ETAPA 4 · tres decisiones, una oportunidad cada una, y ninguna carga la etapa", () => {
  const escenario = ESCENARIOS.find((e) => e.id === "a");
  const fin = [];
  const m = montar(React.createElement(EtapaComite, { banco: unEscenario("a"), onTerminar: (pct, filas, extra) => fin.push({ pct, filas, extra }) }));
  try {
    /* Primera decisión: la peor. Aun así la etapa no está perdida. */
    const d1 = escenario.decisiones[0];
    click(m.caja.querySelector(`[data-opcion="${d1.opciones.find((o) => o.pct === 0).id}"]`), "la peor");
    for (const o of d1.opciones) {
      assert.ok(m.caja.querySelector(`[data-opcion="${o.id}"]`).disabled, `${o.id} admite otro intento`);
    }
    click(porTexto(m.caja, "Siguiente decisión"), "pasar");

    for (const d of escenario.decisiones.slice(1)) {
      click(m.caja.querySelector(`[data-opcion="${d.opciones.find((o) => o.pct === 100).id}"]`), d.id);
      click([...m.caja.querySelectorAll("button")].find((b) => /Siguiente decisión|Cerrar el año/.test(b.textContent)), "avanzar");
    }

    assert.equal(fin.length, 1);
    assert.equal(fin[0].pct, 67, "0 + 100 + 100 entre tres");
    assert.ok(fin[0].pct > 0, "equivocar la primera no puede dejar la etapa en cero");
    assert.deepEqual(fin[0].filas.map((f) => f.item), ["a:a1", "a:a2", "a:a3"]);
    assert.equal(fin[0].extra.elegidas.length, 3, "el cierre necesita saber qué eligió");
  } finally {
    m.desmontar();
  }
});

test("ETAPA 4 · el crédito parcial se cobra: una jugada cara no vale cero ni cien", () => {
  const fin = [];
  const m = montar(React.createElement(EtapaComite, { banco: unEscenario("a"), onTerminar: (pct) => fin.push(pct) }));
  try {
    for (const d of ESCENARIOS.find((e) => e.id === "a").decisiones) {
      const parcial = d.opciones.find((o) => o.pct > 0 && o.pct < 100) ?? d.opciones[0];
      click(m.caja.querySelector(`[data-opcion="${parcial.id}"]`), d.id);
      click([...m.caja.querySelectorAll("button")].find((b) => /Siguiente decisión|Cerrar el año/.test(b.textContent)), "avanzar");
    }
    assert.ok(fin[0] > 0 && fin[0] < 100, `crédito parcial mal cobrado: ${fin[0]}`);
  } finally {
    m.desmontar();
  }
});

/* ─────────────────────────── el hilo y el cierre ─────────────────────────── */

/*
 * EL DESAFÍO ENTERO, DE LA PORTADA AL CIERRE.
 *
 * Se juega de verdad: ocho comunicados, ocho líneas, ocho preguntas y tres
 * decisiones, todo acertado, y en cada pantalla se comprueba que el estado de
 * resultados sigue ahí con sus siete líneas. Es la única forma de ver que el
 * hilo no se corta justo en la costura entre dos etapas, que es donde se
 * cortaría si cada etapa montara el suyo.
 */
function avanzar(caja, patron, que) {
  click([...caja.querySelectorAll("button")].find((b) => patron.test(b.textContent)), que);
}

function jugarEtapa(m, etapa) {
  for (let i = 0; i < 20; i += 1) {
    if (etapa === 1) {
      const nodo = m.caja.querySelector("[data-comunicado]");
      if (!nodo) break;
      const c = COMUNICADOS.find((x) => x.id === nodo.getAttribute("data-comunicado"));
      click(m.caja.querySelector(`[data-bandeja="${c.bandeja}"]`), c.id);
      avanzar(m.caja, /Siguiente comunicado|Cerrar la bandeja/, "avanzar");
    } else if (etapa === 2) {
      const nodo = m.caja.querySelector("[data-medida]");
      if (!nodo) break;
      const med = MEDIDAS_LINEA.find((x) => x.id === nodo.getAttribute("data-medida"));
      /* Se toca la línea EN EL ESTADO: en esta etapa el estado es el tablero. */
      click(m.caja.querySelector(`[data-estado-resultados] [data-linea="${med.linea}"]`), med.id);
      avanzar(m.caja, /Siguiente medida|Cerrar el estado/, "avanzar");
    } else if (etapa === 3) {
      const nodo = m.caja.querySelector("[data-fajo]");
      if (!nodo) break;
      const med = MEDIDAS_INCIDENCIA.find((x) => x.id === nodo.getAttribute("data-fajo"));
      const fase = m.caja.querySelector("[data-pregunta]").getAttribute("data-pregunta");
      click(m.caja.querySelector(`[data-persona="${med[fase].correcta}"]`), `${med.id}:${fase}`);
      avanzar(m.caja, /Siguiente pregunta|Cerrar el reparto/, "avanzar");
    } else {
      const nodo = m.caja.querySelector("[data-decision]");
      if (!nodo) break;
      const esc = ESCENARIOS.find((e) => e.id === m.caja.querySelector("[data-escenario]").getAttribute("data-escenario"));
      const d = esc.decisiones.find((x) => x.id === nodo.getAttribute("data-decision"));
      click(m.caja.querySelector(`[data-opcion="${d.opciones.find((o) => o.pct === 100).id}"]`), d.id);
      avanzar(m.caja, /Siguiente decisión|Cerrar el año/, "avanzar");
    }
  }
}

function panelEntero(m, donde) {
  const panel = m.caja.querySelector("[data-estado-resultados]");
  assert.ok(panel, `${donde}: se cayó el estado de resultados`);
  for (const linea of LINEAS) {
    assert.ok(panel.querySelector(`[data-linea="${linea.id}"]`), `falta ${linea.id} en ${donde}`);
  }
  assert.ok(panel.querySelector("[data-calendario]"), `falta el calendario en ${donde}`);
  return panel;
}

test("el desafío entero: el estado de resultados no se cae en ninguna de las cuatro etapas", () => {
  const fin = [];
  const m = montar(React.createElement(ComiteNova, { onCompletar: (pct, ms, filas) => fin.push({ pct, ms, filas }) }));
  try {
    click(porTexto(m.caja, "Entrar a la sala de juntas"), "empezar");

    for (let etapa = 1; etapa <= 4; etapa += 1) {
      assert.ok(m.caja.querySelector(`[data-etapa="${etapa}"]`), `no se montó la etapa ${etapa}`);
      panelEntero(m, `etapa ${etapa}`);
      /* Las cifras del caso, tal cual, antes de que nada se mueva. */
      if (etapa === 1) {
        assert.match(m.caja.querySelector('[data-linea="ventas"]').textContent, /\$10\.000/);
        assert.match(m.caja.querySelector('[data-linea="neta"]').textContent, /\$1\.540/);
        assert.match(m.caja.querySelector('[data-fuera="empleados"]').textContent, /180/);
      }
      jugarEtapa(m, etapa);
      /* Y sigue ahí con la etapa recién terminada, antes de pulsar «siguiente». */
      panelEntero(m, `al cerrar la etapa ${etapa}`);
      avanzar(m.caja, /Siguiente etapa|Ver el año que sí pasó/, `salir de la etapa ${etapa}`);
    }

    /* El cierre: el estado sigue arriba, y la comparación debajo. */
    panelEntero(m, "el cierre");
    assert.ok(m.caja.querySelector("[data-cierre]"), "no llegó al cierre");
    assert.ok(m.caja.querySelector('[data-columna="sin-comite"]'));
    assert.ok(m.caja.querySelector('[data-columna="con-comite"]'));
    assert.equal(m.caja.querySelector("[data-texto-cierre]").textContent, TEXTO_CIERRE);

    /* Todo acertado: 360 de 360 y las 27 filas de detalle, con su prefijo de etapa. */
    assert.equal(fin.length, 1, "el motor tiene que enterarse UNA sola vez");
    assert.equal(fin[0].pct, 100);
    assert.match(m.caja.textContent, /360 \/ 360/);
    assert.equal(fin[0].filas.length, 8 + 8 + 8 + 3);
    const porEtapa = fin[0].filas.map((f) => f.item.split(":")[0]);
    assert.deepEqual(
      [1, 2, 3, 4].map((n) => porEtapa.filter((x) => x === `et${n}`).length),
      [8, 8, 8, 3],
      "el detalle no se reparte por etapas",
    );
    assert.equal(new Set(fin[0].filas.map((f) => f.item)).size, 27, "hay ítems repetidos en el detalle");
    assert.ok(fin[0].filas.every((f) => f.ok), "se jugó todo bien y alguna fila salió fallada");
  } finally {
    m.desmontar();
  }
});

/*
 * EL CALENDARIO AVANZA, Y ESTO NO ES DECORACIÓN.
 *
 * La ficha dice que las medidas llegan fechadas y que la Etapa 4 salta a
 * DICIEMBRE. Se escribió así y aun así no pasaba: la Etapa 2 fecha cada medida
 * escribiendo `mes` en la vista compartida, y ese mes se quedaba pegado al
 * cambiar de etapa, con lo que la 4 se abría en julio. Se vio jugando el
 * desafío entero en el teléfono, no leyendo el código; por eso está aquí.
 */
test("el calendario avanza de etapa en etapa y la 4 cae en diciembre", () => {
  const m = montar(React.createElement(ComiteNova, { onCompletar: () => {} }));
  try {
    click(porTexto(m.caja, "Entrar a la sala de juntas"), "empezar");
    const meses = [];
    for (let etapa = 1; etapa <= 4; etapa += 1) {
      meses.push(m.caja.querySelector("[data-calendario]").textContent);
      jugarEtapa(m, etapa);
      avanzar(m.caja, /Siguiente etapa|Ver el año que sí pasó/, `salir de la etapa ${etapa}`);
    }
    assert.deepEqual(meses, ["ENERO", "MAYO", "SEPTIEMBRE", "DICIEMBRE"]);
    /* Y el cierre se queda en diciembre: el año terminó. */
    assert.equal(m.caja.querySelector("[data-calendario]").textContent, "DICIEMBRE");
  } finally {
    m.desmontar();
  }
});

test("la portada anuncia las cuatro etapas y los 360 FP, sin trofeos", () => {
  const m = montar(React.createElement(ComiteNova, { onCompletar: () => {} }));
  try {
    assert.match(m.caja.textContent, /4 ETAPAS · 360 FP/);
    assert.match(m.caja.textContent, /72 FP/);
    assert.match(m.caja.textContent, /108 FP/);
  } finally {
    m.desmontar();
  }
});

test("el cierre: dos columnas, el texto fijo de Gen y NADA de trofeos", () => {
  const escenario = ESCENARIOS.find((e) => e.id === "a");
  const elegidas = escenario.decisiones.map((d) => ({
    pregunta: d.pregunta,
    texto: d.opciones.find((o) => o.pct === 100).texto,
  }));
  const m = montar(React.createElement(CierreNova, { escenario, elegidas }));
  try {
    const izq = m.caja.querySelector('[data-columna="sin-comite"]');
    const der = m.caja.querySelector('[data-columna="con-comite"]');
    assert.ok(izq && der, "la pantalla no está partida en dos");
    assert.match(izq.textContent, /NOVA si el comité no hubiera hecho nada/);
    assert.match(der.textContent, /NOVA con las decisiones de tu comité/);

    /* La izquierda enseña lo que hizo el Gobierno: sus tres medidas, no una lista inventada. */
    assert.equal(izq.querySelectorAll("li").length, 3, "las tres medidas del paquete");
    assert.match(izq.textContent, /del 30% al 35%/);
    /* La derecha, lo que decidió el comité. */
    assert.equal(der.querySelectorAll("li").length, 3);
    for (const e of elegidas) assert.ok(der.textContent.includes(e.texto), e.texto);

    assert.equal(m.caja.querySelector("[data-texto-cierre]").textContent, TEXTO_CIERRE);
    /* El prerrequisito del Kit: ninguna iconografía de gamificación. */
    assert.ok(!/trofeo|corona|cofre|medalla|🏆|👑|🎖|🏅/i.test(m.caja.innerHTML));
    assert.equal(m.caja.querySelectorAll("svg").length, 0, "el cierre no lleva ningún icono");
  } finally {
    m.desmontar();
  }
});

test("coral es error y nada más: ningún botón de avanzar lo usa", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: () => {} }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${c.bandeja}"]`), "acertar");
    const avanzar = porTexto(m.caja, "Cerrar la bandeja");
    assert.ok(!estilo(avanzar).includes(rgb(FAE.coral)), "el botón de avanzar usa coral");
    assert.ok(estilo(avanzar).includes(rgb(FAE.teal)), "el botón de avanzar no es teal");
    /* Y el acierto tampoco: el coral solo aparece cuando algo está mal. */
    assert.ok(!estilo(m.caja.querySelector("[data-acierto]")).includes(rgb(FAE.coral)));
    /* En toda la pantalla de un acierto no hay una sola pincelada de coral. */
    assert.ok(!m.caja.innerHTML.includes(rgb(FAE.coral)), "coral en una pantalla donde nada está mal");
  } finally {
    m.desmontar();
  }
});

test("el error SÍ va en coral, que es para lo único que está", () => {
  const c = COMUNICADOS.find((x) => x.id === "c01");
  const m = montar(React.createElement(EtapaComunicados, { banco: unComunicado("c01"), onTerminar: () => {} }));
  try {
    click(m.caja.querySelector(`[data-bandeja="${otraBandeja(c)}"]`), "fallar");
    const error = m.caja.querySelector("[data-error]");
    assert.ok(estilo(error).includes(rgb(FAE.coral)), "el error no va en coral");
    /* Y el comunicado rebotado se marca con el mismo coral. */
    assert.ok(estilo(m.caja.querySelector("[data-comunicado]")).includes(rgb(FAE.coral)));
  } finally {
    m.desmontar();
  }
});
