import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUE 2 (T1-1, T1-2, T1-5).
 *
 * Las mismas garantías que el bloque 1: la demo es el componente real y NO
 * guarda nada; los ejemplos no son del banco; sale la primera vez, no la
 * segunda, y «¿Cómo se juega?» la reabre. Y además: T1-1 ya no tiene vacío.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let movimientoReducido = false;
w.matchMedia = (q) => ({
  matches: q.includes("reduce") ? movimientoReducido : false,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
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

const AsiSeJuega = (await import("../libros/AsiSeJuega.jsx")).default;
const DesdeDondePreguntan = (await import("../libros/tema1/DesdeDondePreguntan.jsx")).default;
const QueEntroYQueSalio = (await import("../libros/tema1/QueEntroYQueSalio.jsx")).default;
const LaEcuacionEnMovimiento = (await import("../libros/tema1/LaEcuacionEnMovimiento.jsx")).default;
const { MarcoLibros } = await import("../bloques/marcos.jsx");
const { JUEGOS, JuegoConTutorial } = await import("../../IntroContabilidadView.jsx");
const {
  ASI_SE_JUEGA_BLOQUE2, EJEMPLO_T1_1, EJEMPLO_T1_2, EJEMPLO_T1_5,
} = await import("../../../data/asiSeJuegaBloque2.js");
const { ASI_SE_JUEGA: ASI_TODAS } = await import("../../../data/asiSeJuega.js");
const {
  T1_1, T1_2, T1_5, USUARIOS_T1_1, EMPRESAS, TRANSACCIONES_CAP2, ROTULO_ZONA, ZONA_FUERA, ZONA_DENTRO, CLASES,
} = await import("../../../data/contabilidadTema1.js");
const { evaluarT1_1, evaluarT1_2, evaluarT1_5 } = await import("../../../contabilidad/tema1.js");

const llamadasARed = [];
globalThis.fetch = async (...args) => { llamadasARed.push(args); throw new Error("sin red en las pruebas"); };

const montar = (elemento) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const esperar = async (cond, ms = 5000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error("no llegó a tiempo");
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
};
const juegoDe = (id) => JUEGOS.find((j) => j.id === id);
const MECANICA = {
  [T1_1.id]: DesdeDondePreguntan, [T1_2.id]: QueEntroYQueSalio, [T1_5.id]: LaEcuacionEnMovimiento,
};
const IDS = [T1_1.id, T1_2.id, T1_5.id];
const contarEscrituras = () => {
  const original = w.Storage.prototype.setItem;
  const escritas = [];
  w.Storage.prototype.setItem = function (k, v) { escritas.push(k); return original.call(this, k, v); };
  return { escritas, soltar: () => { w.Storage.prototype.setItem = original; } };
};
const pantalla = (id, extra = {}) => React.createElement(AsiSeJuega, {
  asi: ASI_TODAS[id], Mecanica: MECANICA[id], onSiguiente: () => {}, escala: 0.05, ...extra,
});
const tutorial = (id, usuarioId = "u-prueba") => React.createElement(JuegoConTutorial, {
  juego: juegoDe(id), usuarioId, Marco: MarcoLibros, acento: "#E9C46A", rotulo: "PRUEBA", onCompletar: () => {},
});

/* ═══════════════════ LOS TEXTOS DE LEVI ═══════════════════ */

test("★★ el bloque 2 son T1-1, T1-2 y T1-5, con la consigna de cada actividad y sus tres pasos", () => {
  assert.deepEqual(Object.keys(ASI_SE_JUEGA_BLOQUE2).sort(), [...IDS].sort());
  for (const id of IDS) assert.equal(ASI_TODAS[id], ASI_SE_JUEGA_BLOQUE2[id], `${id} no está en el índice`);
  const datos = { [T1_1.id]: T1_1, [T1_2.id]: T1_2, [T1_5.id]: T1_5 };
  for (const id of IDS) {
    assert.equal(ASI_TODAS[id].consigna, datos[id].consigna, `${id}: la consigna no es la de la actividad`);
    assert.equal(ASI_TODAS[id].titulo, datos[id].nombre);
  }
  assert.equal(T1_1.consigna, "Lee la pregunta. Luego toca si esa persona está adentro o afuera de la empresa.");
  assert.deepEqual(ASI_TODAS[T1_1.id].pasos, [
    "Lee la pregunta y piensa quién la haría.", "Toca ADENTRO o AFUERA.",
  ]);
  /* La mano ya no toca la pregunta: solo AFUERA. */
  assert.deepEqual(ASI_TODAS[T1_1.id].guion.toques.map((t) => t.en), [`[data-zona="${ZONA_FUERA}"]`]);
  /* Los nombres de las zonas, tal como salen en pantalla. */
  assert.equal(ROTULO_ZONA[ZONA_FUERA], "AFUERA");
  assert.equal(ROTULO_ZONA[ZONA_DENTRO], "ADENTRO");
  assert.deepEqual(ASI_TODAS[T1_2.id].pasos, [
    "Mira el cuadro de lo que entra.", "Mira el cuadro de lo que sale.", "Toca la clase de empresa que es.",
  ]);
  assert.deepEqual(ASI_TODAS[T1_5.id].pasos, [
    "Lee el hecho de la panadería.", "Escribe los tres totales, aunque alguno no cambie.", "Toca Anotar.",
  ]);
  assert.equal(ASI_TODAS[T1_5.id].alt,
    "la panadería compró un horno a crédito por $200.000. Al empezar tenía $500.000, debía $0 y lo de los dueños era $500.000. Se escriben $700.000 en «Lo que tiene», $200.000 en «Lo que debe» y $500.000 en «Lo que es de los dueños», y se toca «Anotar». El pie dice: «Los dos lados dan igual: $700.000.»");
  assert.ok(ASI_TODAS[T1_5.id].guion.duracion <= 10000, "la demo de T1-5 pasa de 10 s");
  assert.equal(ASI_TODAS[T1_5.id].guion.toques.at(-1).texto, "Anotar", "la demo de T1-5 no termina tocando «Anotar»");
  assert.equal(ASI_TODAS[T1_1.id].alt,
    "se toca la pregunta del cliente de la panadería y luego la zona AFUERA. La pregunta se ubica con el rótulo «Clientes» y la flecha de vuelta no se enciende.");
});

test("★★★ T1-1: ya no está la pregunta de vacío", () => {
  assert.equal(T1_1.pregunta, undefined);
  const { caja, desmontar } = montar(React.createElement(DesdeDondePreguntan, { Marco: MarcoLibros, onCompletar: () => {} }));
  try {
    assert.ok(!caja.textContent.toLowerCase().includes("quién pregunta esto"), "volvió la pregunta de vacío");
    assert.equal(caja.querySelectorAll("[data-rotulo-seccion]").length, 0, "hay rótulo de sección antes de responder");
  } finally { desmontar(); }
});

test("★★ T1-2: la pregunta de vacío se queda", () => {
  const { caja, desmontar } = montar(React.createElement(QueEntroYQueSalio, { Marco: MarcoLibros, onCompletar: () => {} }));
  try {
    assert.equal(caja.querySelector("[data-rotulo-seccion]").textContent, T1_2.pregunta.toUpperCase());
  } finally { desmontar(); }
});

/* ═══════════════════ LOS EJEMPLOS NO SON DEL BANCO ═══════════════════ */

test("★★★ ningún ejemplo del bloque 2 está en el banco", () => {
  assert.ok(!USUARIOS_T1_1.some((u) => u.id === EJEMPLO_T1_1.id || u.pregunta === EJEMPLO_T1_1.pregunta), "la pregunta del cliente está en el banco de T1-1");
  assert.ok(!EMPRESAS.some((e) => e.id === EJEMPLO_T1_2.id || e.empresa === EJEMPLO_T1_2.empresa), "la panadería está en el banco de T1-2");
  assert.ok(!TRANSACCIONES_CAP2.some((t) => t.id === EJEMPLO_T1_5.hecho.id || t.texto === EJEMPLO_T1_5.hecho.texto), "el horno está en el recorrido de T1-5");
  for (const id of [EJEMPLO_T1_1.id, EJEMPLO_T1_2.id, EJEMPLO_T1_5.hecho.id]) assert.ok(id.startsWith("demo-"), id);
});

test("★★ los ejemplos se resuelven con la lógica de verdad, con los aciertos de Levi", () => {
  const t1 = evaluarT1_1(EJEMPLO_T1_1, ZONA_FUERA);
  assert.equal(t1.ok, true);
  assert.equal(t1.texto, "✅ Afuera. Le compra a la panadería, pero no es parte de ella.");
  assert.equal(t1.enciendeTrazo, false, "la flecha de vuelta se encendería");
  const t2 = evaluarT1_2(EJEMPLO_T1_2, "industrial");
  assert.equal(t2.ok, true);
  assert.equal(t2.texto, "✅ Industrial. Entró harina. Salió pan. No es lo mismo: adentro lo cambiaron.");
  const t5 = evaluarT1_5(0, { activo: 700000, pasivo: 200000, patrimonio: 500000 }, EJEMPLO_T1_5);
  assert.equal(t5.ok, true);
  /* Y la lógica sigue viendo sus errores con el ejemplo: mover la parte quieta es C. */
  assert.equal(evaluarT1_5(0, { activo: 700000, pasivo: 0, patrimonio: 700000 }, EJEMPLO_T1_5).patron, "C");
  /* Sin ejemplo, el primer hecho del recorrido sigue partiendo de cero. */
  assert.notEqual(evaluarT1_5(0, { activo: 700000, pasivo: 200000, patrimonio: 500000 }).ok, true);
});

/* ═══════════════════ PRIMERA VEZ, SEGUNDA VEZ, Y «¿CÓMO SE JUEGA?» ═══════════════════ */

for (const id of IDS) {
  test(`★★★ ${id}: sale la primera vez, no la segunda, y «¿Cómo se juega?» la trae de vuelta`, () => {
    w.localStorage.clear();
    const uno = montar(tutorial(id));
    try {
      assert.ok(uno.caja.querySelector(`[data-asi-se-juega="${id}"]`), "la primera vez no salió");
      assert.equal(uno.caja.querySelector("[data-partida]").hidden, true);
    } finally { uno.desmontar(); }
    const dos = montar(tutorial(id));
    try {
      assert.equal(dos.caja.querySelector("[data-asi-se-juega]"), null, "salió otra vez");
      const ayuda = dos.caja.querySelector("[data-encabezado] [data-como-se-juega]");
      assert.ok(ayuda, "no está «¿Cómo se juega?» bajo la consigna");
      tocar(ayuda);
      assert.ok(dos.caja.querySelector(`[data-asi-se-juega="${id}"]`), "«¿Cómo se juega?» no la abrió");
    } finally { dos.desmontar(); }
  });
}

/* ═══════════════════ LA DEMO NO GUARDA NADA, Y ENSEÑA LO QUE DEBE ═══════════════════ */

for (const id of IDS) {
  test(`★★★ ${id}: la demo corre con el componente real, «Siguiente» espera, y no guarda nada`, async () => {
    w.localStorage.clear();
    const conteo = contarEscrituras();
    const redAntes = llamadasARed.length;
    const { caja, desmontar } = montar(pantalla(id));
    try {
      const sig = () => caja.querySelector("[data-asj-siguiente] button");
      const escenario = () => caja.querySelector("[data-asj-escenario]");
      assert.equal(sig().disabled, true);
      assert.equal(sig().textContent, "Mira el ejemplo");
      assert.equal(caja.querySelector("figure figcaption").textContent, `Ejemplo: ${ASI_TODAS[id].alt}`);
      assert.equal(caja.querySelectorAll("[inert]").length, 1);
      await esperar(() => !sig().disabled);
      assert.equal(sig().textContent, "Siguiente");

      /* Solo la zona de juego: ni encabezado, ni avance, ni botón de seguir. */
      assert.equal(escenario().querySelector("[data-encabezado]"), null);
      assert.equal(escenario().querySelector("[data-nodo]"), null);
      for (const texto of ["Siguiente pregunta", "Siguiente empresa", "Siguiente hecho", "Ver el resultado"]) {
        assert.ok(![...escenario().querySelectorAll("button")].some((b) => b.textContent.trim() === texto), `la demo ofrece «${texto}»`);
      }

      if (id === T1_1.id) {
        const asentada = escenario().querySelector(`[data-zona="${ZONA_FUERA}"] [data-asentada]`);
        assert.ok(asentada, "la pregunta no se asentó en AFUERA");
        assert.equal(asentada.textContent, "Clientes");
        assert.equal(escenario().querySelector("[data-anillo]").querySelector("[data-rotulo-trazo]"), null);
        assert.equal(escenario().querySelector("[data-rotulo-trazo]"), null, "se encendió la flecha de vuelta");
        assert.ok(escenario().querySelector('[role="status"]').textContent.includes("Le compra a la panadería, pero no es parte de ella."));
      }
      if (id === T1_2.id) {
        assert.equal(escenario().querySelector("[data-empresa]").textContent, "Una panadería");
        assert.equal(escenario().querySelectorAll("[data-clase]").length, CLASES.length, "no están las cinco clases");
        assert.equal(escenario().querySelector('[data-clase="industrial"]').dataset.marcada, "si");
        assert.equal(escenario().querySelector('[data-clase="industrial"]').textContent, "Industrial o de manufactura");
        assert.ok(escenario().querySelector('[role="status"]').textContent.includes("Entró harina. Salió pan."));
      }
      if (id === T1_5.id) {
        const valor = (p) => escenario().querySelector(`[data-casilla="${p}"] input`).value;
        assert.deepEqual([valor("activo"), valor("pasivo"), valor("patrimonio")], ["700.000", "200.000", "500.000"]);
        assert.equal(escenario().querySelector("[data-pie]").dataset.cuadra, "si");
        assert.equal(escenario().querySelector("[data-veredicto]").textContent, "Los dos lados dan igual: $700.000.");
        assert.equal(escenario().querySelector('[data-fila-historial="inicio"]').textContent, "Al empezar: $500.000 = $0 + $500.000");
        /* Tocó «Anotar»: la fila nueva está en «Lo que llevas». */
        assert.equal(escenario().querySelector(`[data-fila-historial="${EJEMPLO_T1_5.hecho.id}"]`)?.textContent,
          "Hecho 1: $700.000 = $200.000 + $500.000");
        assert.equal(escenario().querySelector("[data-barra]"), null, "T1-5 no tiene barras");
      }
    } finally {
      desmontar();
      conteo.soltar();
    }
    assert.deepEqual(conteo.escritas, [], "la demo escribió en el navegador");
    assert.equal(llamadasARed.length, redAntes, "la demo llamó a la red");
  });
}

test("★★★ en modo demo, responder no llama a onCompletar en ninguna de las tres", async () => {
  let llamadas = 0;
  const onCompletar = () => { llamadas += 1; };
  const t1 = montar(React.createElement(DesdeDondePreguntan, { Marco: MarcoLibros, modoDemo: true, items: [EJEMPLO_T1_1], onCompletar }));
  try { tocar(t1.caja.querySelector(`[data-zona="${ZONA_FUERA}"]`)); } finally { t1.desmontar(); }
  const t2 = montar(React.createElement(QueEntroYQueSalio, { Marco: MarcoLibros, modoDemo: true, items: [EJEMPLO_T1_2], onCompletar }));
  try { tocar(t2.caja.querySelector('[data-clase="industrial"]')); } finally { t2.desmontar(); }
  assert.equal(llamadas, 0);
});

test("★★ «Pausar» también para la escritura de T1-5, tecla por tecla, y «Seguir» la retoma", async () => {
  const { caja, desmontar } = montar(pantalla(T1_5.id, { escala: 1 }));
  try {
    const campo = () => caja.querySelector('[data-asj-escenario] [data-casilla="activo"] input');
    await esperar(() => campo().value.length > 0 && campo().value.length < 7, 4000);
    tocar(caja.querySelector("[data-asj-control]"));
    const quieto = campo().value;
    await act(async () => { await new Promise((r) => setTimeout(r, 600)); });
    assert.equal(campo().value, quieto, "en pausa siguió escribiendo");
    tocar(caja.querySelector("[data-asj-control]"));
    await esperar(() => campo().value === "700.000", 3000);
  } finally { desmontar(); }
});
