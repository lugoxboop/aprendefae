import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES VERBOS, DENTRO DE LAS SEIS ACTIVIDADES REDISEÑADAS.
 *
 * Lo que aquí se vigila no es la aritmética —cada actividad ya tiene la suya—
 * sino LO QUE SE VE Y CUÁNDO. Y el «cuándo» es la mitad del asunto: una
 * balanza dibujada antes de responder en «¿Cuadra o no cuadra?» contesta la
 * pregunta en la pantalla, y la actividad deja de medir nada sin que ninguna
 * prueba de puntaje se entere.
 *
 * Por eso casi todas estas pruebas montan la actividad, miran ANTES de
 * responder, responden, y vuelven a mirar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const SaldoDeLaCuenta = (await import("../../components/mecanicas/libros/SaldoDeLaCuenta.jsx")).default;
const ArmaElAsiento = (await import("../../components/mecanicas/libros/ArmaElAsiento.jsx")).default;
const SimpleOCompuesto = (await import("../../components/mecanicas/libros/SimpleOCompuesto.jsx")).default;
const CuadraONoCuadra = (await import("../../components/mecanicas/libros/CuadraONoCuadra.jsx")).default;
const ElAsientoCompuesto = (await import("../../components/mecanicas/libros/ElAsientoCompuesto.jsx")).default;
const LaMayorizacion = (await import("../../components/mecanicas/libros/LaMayorizacion.jsx")).default;
const { NUMEROS } = await import("../../components/mecanicas/libros/SimpleOCompuesto.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { GRADOS_MINIMOS, inclinacionDe, gradosDe } = await import("../balanza.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

function montar(Mecanica) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Mecanica, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const porTexto = (caja, txt) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === txt);
const contiene = (caja, txt) => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(txt));
const escribir = (input, valor) => {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  act(() => {
    set.call(input, String(valor));
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};
const grados = (caja) => {
  const b = caja.querySelector("[data-balanza]");
  return b ? Number(b.getAttribute("data-balanza")) : null;
};

/* ═══════════════ CU-5 · COLUMNAS DE VALOR ═══════════════ */

test("★ CU-5 dibuja los movimientos como columnas de valor, proporcionales", () => {
  const { caja, desmontar } = montar(SaldoDeLaCuenta);
  try {
    const fichas = [...caja.querySelectorAll("[data-ficha]")];
    assert.ok(fichas.length > 0, "la cuenta no trae fichas de valor");

    const altos = fichas.map((f) => ({ valor: Number(f.getAttribute("data-ficha")), alto: Number.parseFloat(f.style.height) }));
    /* Donde hay dos valores distintos, la más grande mide más. Y donde valen
       lo mismo, miden lo mismo: eso es lo que «proporcional» quiere decir. */
    for (const a of altos) {
      for (const b of altos) {
        if (a.valor > b.valor) assert.ok(a.alto > b.alto, `${a.valor} no mide más que ${b.valor}`);
        if (a.valor === b.valor) assert.ok(Math.abs(a.alto - b.alto) < 0.01);
      }
    }
  } finally { desmontar(); }
});

test("★ CU-5 NO cancela hasta que se responde: el saldo no puede estar dibujado antes", () => {
  /*
   * Si las columnas se comieran entre sí desde el principio, lo que quedara
   * en pie sería la respuesta, y la pregunta «¿cuánto es el saldo?» se
   * contestaría midiendo con el ojo.
   */
  const { caja, desmontar } = montar(SaldoDeLaCuenta);
  try {
    const comido = () => [...caja.querySelectorAll("[data-ficha]")]
      .reduce((s, f) => s + Number.parseFloat(f.getAttribute("data-consumido")), 0);
    assert.equal(comido(), 0, "la cancelación se adelantó a la respuesta");

    /* Se responde cualquier cosa y ahora sí tiene que haber mordido algo —en
       una cuenta que tenga los dos movimientos. */
    const input = caja.querySelector("input");
    escribir(input, 1);
    tocar(porTexto(caja, "Debe"));
    tocar(porTexto(caja, "Responder"));
    const dosLados = [...caja.querySelectorAll("[data-columna]")]
      .every((c) => c.querySelectorAll("[data-ficha]").length > 0);
    if (dosLados) assert.ok(comido() > 0, "al corregir no se canceló nada");
  } finally { desmontar(); }
});

/* ═══════════════ CU-6 · LA BALANZA DEL ASIENTO SIMPLE ═══════════════ */

test("★ CU-6 no enseña la balanza antes de responder, y la nivela al acertar el reparto", () => {
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    assert.equal(grados(caja), null, "la balanza salió antes de responder");

    /* Dos cuentas cualesquiera, una a cada lado: el reparto de todo asiento simple. */
    const paleta = [...caja.querySelectorAll("button")].filter((b) => /^[A-ZÁÉÍÓÚ]/.test(b.textContent.trim()) && !b.disabled);
    tocar(paleta[0]);
    tocar(paleta.find((b) => b.textContent.trim() !== paleta[0].textContent.trim()));
    const lados = [...caja.querySelectorAll("[data-fila-asiento]")];
    tocar(porTexto(lados[0], "Debe"));
    tocar(porTexto(lados[1], "Haber"));
    tocar(porTexto(caja, "Responder"));

    assert.equal(grados(caja), 0, "una cuenta a cada lado y la balanza salió torcida");
  } finally { desmontar(); }
});

test("★ CU-6: las dos cuentas del mismo lado tumban la balanza del todo", () => {
  const { caja, desmontar } = montar(ArmaElAsiento);
  try {
    const paleta = [...caja.querySelectorAll("button")].filter((b) => /^[A-ZÁÉÍÓÚ]/.test(b.textContent.trim()) && !b.disabled);
    tocar(paleta[0]);
    tocar(paleta.find((b) => b.textContent.trim() !== paleta[0].textContent.trim()));
    const lados = [...caja.querySelectorAll("[data-fila-asiento]")];
    tocar(porTexto(lados[0], "Debe"));
    tocar(porTexto(lados[1], "Debe"));
    tocar(porTexto(caja, "Responder"));

    const g = grados(caja);
    assert.ok(g !== null && Math.abs(g) > GRADOS_MINIMOS, `la balanza salió en ${g}°`);
    assert.equal(caja.querySelector("[data-nivelada]").getAttribute("data-nivelada"), "no");
  } finally { desmontar(); }
});

/* ═══════════════ CU-7 · LAS CUENTAS EN BLANCO ═══════════════ */

test("★ CU-7 pregunta cuántas cuentas ABRIENDO cuentas, no tocando un dígito", () => {
  const { caja, desmontar } = montar(SimpleOCompuesto);
  try {
    const ranuras = [...caja.querySelectorAll("[data-cuenta-en-blanco]")];
    assert.equal(ranuras.length, Math.max(...NUMEROS), "no hay una ranura por cuenta posible");
    assert.deepEqual(ranuras.map((r) => r.getAttribute("data-abierta")), ranuras.map(() => "no"),
      "alguna cuenta viene abierta de fábrica");

    /* Las que el banco nunca pide no se pueden tocar: un asiento de una sola
       cuenta no existe, y ofrecerlo enseñaría que sí. */
    for (const r of ranuras) {
      const n = Number(r.getAttribute("data-cuenta-en-blanco"));
      assert.equal(r.disabled, !NUMEROS.includes(n), `la ranura ${n} no respeta el banco`);
    }

    /* Elegir «3» abre tres, no una. */
    const tres = ranuras.find((r) => r.getAttribute("data-cuenta-en-blanco") === "3");
    tocar(tres);
    const abiertas = [...caja.querySelectorAll('[data-cuenta-en-blanco][data-abierta="si"]')];
    assert.equal(abiertas.length, 3, "abrir tres cuentas no abrió tres");
    assert.deepEqual(abiertas.map((r) => r.getAttribute("data-cuenta-en-blanco")), ["1", "2", "3"]);
  } finally { desmontar(); }
});

test("★ CU-7: las cuentas van EN BLANCO — aquí no se pregunta cuáles son", () => {
  const { caja, desmontar } = montar(SimpleOCompuesto);
  try {
    for (const r of caja.querySelectorAll("[data-cuenta-en-blanco]")) {
      const texto = r.textContent.replace(/\s+/g, "");
      assert.match(texto, /^\d$/, `la ranura trae texto de más: «${texto}»`);
    }
  } finally { desmontar(); }
});

/* ═══════════════ CU-8 · LA BALANZA QUE NO PUEDE ADELANTARSE ═══════════════ */

test("★ CU-8 NO dibuja la balanza antes del juicio: sería contestar la pregunta", () => {
  const { caja, desmontar } = montar(CuadraONoCuadra);
  try {
    assert.equal(grados(caja), null, "la balanza salió antes de que el estudiante juzgue");
    /* Y los totales tampoco, que es la regla que ya tenía la actividad. */
    assert.ok(!/TOTAL/i.test(caja.textContent), "los totales se adelantaron");

    tocar(porTexto(caja, "Cuadra"));
    tocar(porTexto(caja, "Responder"));
    assert.notEqual(grados(caja), null, "al corregir no apareció la balanza");
  } finally { desmontar(); }
});

test("★ CU-8: la inclinación es PROPORCIONAL, no un «torcido» fijo", () => {
  /*
   * La balanza se alimenta de inclinacionDe, que divide por el mayor de los
   * dos lados. Un descuadre pequeño en un asiento grande se ve apenas — y eso
   * también es contenido: el tamaño del error importa.
   */
  const pequeno = gradosDe(inclinacionDe(5050, 5000));
  const grande = gradosDe(inclinacionDe(1000, 100));
  assert.ok(Math.abs(pequeno) < Math.abs(grande), "los dos descuadres se ven igual");
  assert.equal(gradosDe(inclinacionDe(5000, 5000)), 0);
});

/* ═══════════════ CU-10 · LA BALANZA COMO EL ESTUDIANTE LA DEJÓ ═══════════════ */

test("★ CU-10 entra inclinada si el asiento del estudiante no cuadraba", () => {
  const { caja, desmontar } = montar(ElAsientoCompuesto);
  try {
    assert.equal(grados(caja), null, "la balanza salió antes de responder");

    const paleta = [...caja.querySelectorAll("button")].filter((b) => /^[A-ZÁÉÍÓÚ]/.test(b.textContent.trim()) && !b.disabled);
    tocar(paleta[0]);
    tocar(paleta.find((b) => b.textContent.trim() !== paleta[0].textContent.trim()));
    const filas = [...caja.querySelectorAll("[data-fila-asiento]")];
    tocar(porTexto(filas[0], "Debe"));
    tocar(porTexto(filas[1], "Haber"));
    escribir(filas[0].querySelector("input"), 1000);
    escribir(filas[1].querySelector("input"), 400);
    tocar(porTexto(caja, "Responder"));

    const g = grados(caja);
    assert.ok(g !== null, "al corregir no apareció la balanza");
    assert.ok(g > 0, `1.000 contra 400 y la balanza salió en ${g}°: debería caer al debe`);
    /* Los dos platillos llevan las cifras DEL ESTUDIANTE, no las correctas. */
    assert.ok(caja.textContent.includes("$1.000") && caja.textContent.includes("$400"),
      "los platillos no pesan lo que el estudiante puso");
    /* Y el descuadre se dice, para quien no puede ver la inclinación. */
    const dicho = caja.querySelector("[data-balanza]").getAttribute("aria-label");
    assert.ok(dicho.includes("$600"), `la balanza no dice el descuadre: «${dicho}»`);
  } finally { desmontar(); }
});

/* ═══════════════ CU-11 · LA MARCA DE MAYORIZADO ═══════════════ */

test("★ CU-11 marca el renglón mayorizado y NO lo quita del diario", () => {
  /*
   * El capítulo prohíbe alterar un asiento registrado. La marca es la columna
   * de referencia de un diario de verdad: dice «este ya está allá» sin tocar
   * el renglón.
   */
  const { caja, desmontar } = montar(LaMayorizacion);
  try {
    const renglones = () => [...caja.querySelectorAll("[data-marca]")];
    const antes = renglones().map((m) => m.parentElement.textContent.replace(/[✓·]/g, ""));
    assert.ok(antes.length > 0, "el diario no trae renglones");
    assert.deepEqual(renglones().map((m) => m.getAttribute("data-marca")), antes.map(() => "no"),
      "algún renglón viene marcado antes de mayorizarlo");

    /* Se mayoriza el primero: cualquier cuenta y cualquier lado sirven, la
       marca dice que YA SE HIZO, no que se hiciera bien. */
    const cuentas = [...caja.querySelectorAll("button")].filter((b) => /^[A-ZÁÉÍÓÚ]/.test(b.textContent.trim()) && !b.disabled);
    tocar(cuentas[0]);
    tocar(porTexto(caja, "Debe"));
    tocar(porTexto(caja, "Responder"));

    const despues = renglones().map((m) => m.parentElement.textContent.replace(/[✓·]/g, ""));
    assert.deepEqual(despues, antes, "mayorizar cambió o se llevó renglones del diario");
    assert.equal(renglones().filter((m) => m.getAttribute("data-marca") === "si").length, 1,
      "se marcó un número distinto de uno");
  } finally { desmontar(); }
});

/* ═══════════════ LA REGLA DE SIEMPRE ═══════════════ */

test("★ ninguna de las seis pinta coral antes de que alguien se equivoque", () => {
  for (const [nombre, Mecanica] of [
    ["CU-5", SaldoDeLaCuenta], ["CU-6", ArmaElAsiento], ["CU-7", SimpleOCompuesto],
    ["CU-8", CuadraONoCuadra], ["CU-10", ElAsientoCompuesto], ["CU-11", LaMayorizacion],
  ]) {
    const { caja, desmontar } = montar(Mecanica);
    try {
      assert.ok(!CORAL.test(caja.innerHTML), `${nombre} pinta coral sin que nadie haya fallado`);
    } finally { desmontar(); }
  }
});
