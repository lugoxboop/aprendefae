import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES VERBOS, DIBUJADOS.
 *
 * La aritmética de la cancelación y de la balanza ya tienen sus pruebas
 * aparte. Estas miran lo otro: que el DIBUJO diga lo que la aritmética
 * calcula. Es donde se cuela la clase de error que no rompe nada — el saldo
 * correcto sobre una ficha que se ve entera, la balanza recta en un asiento
 * torcido— y que solo se ve mirando el DOM o la pantalla.
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

const { CuentaDeValor, Balanza, Ficha, PISO_FICHA } = await import("../../components/mecanicas/libros/verbos.jsx");
const { DEBE, HABER, mayorConSaldos, LAVADO_DE_AUTOS, CALEJA } = await import("../../data/contabilidad.js");
const { CAJA_DEL_CAPITULO } = await import("../../data/contabilidadActividades.js");
const { ALTO_COLUMNA, alturaDe, referenciaDe } = await import("../cancelacion.js");
const { GRADOS_MAXIMOS } = await import("../balanza.js");
const { FAE } = await import("../../theme.js");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;
const fichas = (...valores) => valores.map((valor) => ({ valor }));
const alturaPx = (el) => Number.parseFloat(el.style.height);

/* ═══════════════ VERBO 2 · LAS COLUMNAS DE VALOR ═══════════════ */

test("★ la altura de cada ficha es PROPORCIONAL a su monto, en la pantalla", () => {
  /*
   * La aritmética ya está probada; esto comprueba que llega al estilo. Una
   * `alturaDe` correcta que no se aplique dejaría todas las fichas iguales y
   * el verbo dejaría de enseñar nada.
   */
  const m = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: fichas(1000, 500), creditos: fichas(150),
  }));
  try {
    const todas = [...m.caja.querySelectorAll("[data-ficha]")];
    assert.equal(todas.length, 3);
    const alto = Object.fromEntries(todas.map((f) => [f.dataset.ficha, alturaPx(f)]));
    /* La referencia es 1.500: la de 1.000 son dos tercios del alto. */
    assert.ok(Math.abs(alto["1000"] - (ALTO_COLUMNA * 2) / 3) < 0.5, `1.000 mide ${alto["1000"]}`);
    assert.ok(Math.abs(alto["500"] - ALTO_COLUMNA / 3) < 0.5, `500 mide ${alto["500"]}`);
    assert.ok(Math.abs(alto["150"] - ALTO_COLUMNA / 10) < 0.5, `150 mide ${alto["150"]}`);
    /* Y la de 1.000 es de verdad mucho más alta que la de 150. */
    assert.ok(alto["1000"] > alto["150"] * 6, "las alturas no distinguen los montos");
  } finally { m.desmontar(); }
});

test("★ NINGUNA ficha del capítulo toca el piso: la proporción es exacta donde importa", () => {
  /*
   * Un piso de altura rompe la proporcionalidad, así que el que hay está puesto
   * por debajo de todo lo que existe: la ficha más baja de los dos casos son
   * los $10.000 de la Caja de Caleja contra una referencia de $300.000, y miden
   * 4,9 px contra un piso de 4.
   *
   * Esta prueba lo recorre entero. Si mañana entra un caso con una proporción
   * más extrema, falla aquí y obliga a decidir a conciencia —bajar el piso o
   * aceptar que esa ficha deja de ser proporcional— en vez de que el dibujo
   * mienta en silencio.
   */
  const cuentas = [
    ...mayorConSaldos(LAVADO_DE_AUTOS.transacciones),
    ...mayorConSaldos(CALEJA.transacciones),
    CAJA_DEL_CAPITULO,
  ];
  let masBaja = Infinity;
  for (const c of cuentas) {
    const referencia = referenciaDe(c.debitos, c.creditos);
    for (const f of [...c.debitos, ...c.creditos]) {
      masBaja = Math.min(masBaja, alturaDe(f.valor, referencia));
    }
  }
  assert.ok(masBaja > PISO_FICHA,
    `la ficha más baja mide ${masBaja.toFixed(2)} px y el piso está en ${PISO_FICHA}: ya no es proporcional`);
});

test("una ficha demasiado corta para su cifra la calla, pero la sigue anunciando", () => {
  /*
   * Estirar la ficha para que quepa el texto sería romper la proporción por
   * comodidad tipográfica. Se calla el texto y se deja el anuncio: lo que se
   * pierde es el hueco, no el dato.
   */
  const m = montar(React.createElement(Ficha, { valor: 10000, lado: DEBE, alto: 5 }));
  try {
    const f = m.caja.querySelector("[data-ficha]");
    assert.equal(f.style.height, "5px", "la ficha se estiró para que cupiera el texto");
    assert.equal(f.textContent.trim(), "", "una ficha de 5 px no puede llevar una cifra dentro");
    assert.equal(f.getAttribute("aria-label"), "$10.000 al debe", "pero se sigue anunciando");
  } finally { m.desmontar(); }
});

test("★ al cancelar, la ficha grande queda MORDIDA A MEDIAS en el DOM", () => {
  /*
   * El corazón del verbo. Los 150 del haber se comen el 15 % de la ficha de
   * 1.000: ni entera ni desaparecida. Si el dibujo solo supiera tapar fichas
   * completas, esto se cae.
   */
  const m = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: fichas(1000, 500), creditos: fichas(150), cancelar: true,
  }));
  try {
    const porValor = Object.fromEntries(
      [...m.caja.querySelectorAll("[data-ficha]")].map((f) => [f.dataset.ficha, f]));
    assert.equal(porValor["1000"].dataset.consumido, "0.15", "la de 1.000 tiene que quedar mordida al 15 %");
    assert.equal(porValor["500"].dataset.consumido, "0", "la de 500 no se toca");
    assert.equal(porValor["150"].dataset.consumido, "1", "la columna menor se va entera");
    /* Y la mordida se dibuja: una tapa con la altura de lo comido. */
    const tapa = porValor["1000"].querySelector("[data-comido]");
    assert.ok(tapa, "la ficha mordida no enseña la mordida");
    assert.equal(tapa.style.height, "15%");
    /* La mordida a medias lleva su borde punteado; la entera, no. */
    assert.match(tapa.style.borderTop, /dashed/, "la mordida a medias se marca");
    assert.doesNotMatch(porValor["150"].querySelector("[data-comido]").style.borderTop ?? "", /dashed/);
    /*
     * Y SE COME DESDE ABAJO. Pegada arriba, la mordida se vería igual de
     * grande y estaría enseñando lo contrario: que la cancelación se lleva lo
     * último que se registró en vez de lo primero.
     */
    assert.equal(tapa.style.bottom, "0px", "la mordida no arranca desde abajo");
    assert.equal(tapa.style.top, "", "la mordida quedó anclada arriba");
  } finally { m.desmontar(); }
});

test("★ lo que queda en pie se anuncia como saldo, del lado que pesó más", () => {
  const m = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: fichas(1000, 500), creditos: fichas(150), cancelar: true,
  }));
  try {
    const saldo = m.caja.querySelector("[data-saldo]");
    assert.ok(saldo, "no se anuncia el saldo");
    assert.equal(saldo.dataset.saldo, "1350");
    assert.equal(saldo.style.justifyContent, "flex-start", "el saldo al debe se pinta a la izquierda");
    assert.match(saldo.textContent, /\$1\.350/);
  } finally { m.desmontar(); }
});

test("★ un saldo al haber se pinta a la derecha, y uno de cero no se pinta", () => {
  const derecha = montar(React.createElement(CuentaDeValor, {
    cuenta: "Cuentas por pagar", debitos: fichas(250), creditos: fichas(4000), cancelar: true,
  }));
  try {
    const saldo = derecha.caja.querySelector("[data-saldo]");
    assert.equal(saldo.dataset.saldo, "3750");
    assert.equal(saldo.style.justifyContent, "flex-end");
  } finally { derecha.desmontar(); }

  const empate = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: fichas(500), creditos: fichas(500), cancelar: true,
  }));
  try {
    assert.equal(empate.caja.querySelector("[data-saldo]"), null,
      "un saldo cero no tiene lado y no se puede pintar en ninguno");
  } finally { empate.desmontar(); }
});

test("sin cancelar, ninguna ficha se ve comida", () => {
  const m = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: fichas(1000, 500), creditos: fichas(150),
  }));
  try {
    for (const f of m.caja.querySelectorAll("[data-ficha]")) {
      assert.equal(f.dataset.consumido, "0", "se canceló sin que nadie lo pidiera");
      assert.equal(f.querySelector("[data-comido]"), null);
    }
    assert.equal(m.caja.querySelector("[data-saldo]"), null, "el saldo sale al cancelar, no antes");
  } finally { m.desmontar(); }
});

test("los dos lados pueden recibir fichas, y se ofrecen como destinos", () => {
  const m = montar(React.createElement(CuentaDeValor, {
    cuenta: "Caja", debitos: [], creditos: [], destinos: true, tomada: 500,
  }));
  try {
    const destinos = [...m.caja.querySelectorAll("[data-destino]")].map((d) => d.dataset.destino);
    assert.deepEqual(destinos, [DEBE, HABER]);
    for (const d of m.caja.querySelectorAll("[data-destino]")) {
      assert.equal(d.tagName, "BUTTON", "un destino tiene que poder tocarse con el teclado");
      assert.ok(d.getAttribute("aria-label"), "y anunciarse a quien no lo ve");
    }
  } finally { m.desmontar(); }
});

/* ═══════════════ VERBO 3 · LA BALANZA ═══════════════ */

test("★ la balanza recta se declara nivelada y la torcida no", () => {
  const recta = montar(React.createElement(Balanza, { inclinacion: 0 }));
  try {
    const b = recta.caja.querySelector("[data-balanza]");
    assert.equal(b.dataset.balanza, "0");
    assert.equal(b.dataset.nivelada, "si");
    assert.match(b.getAttribute("aria-label"), /nivelada/);
  } finally { recta.desmontar(); }

  const torcida = montar(React.createElement(Balanza, { inclinacion: 0.4 }));
  try {
    const b = torcida.caja.querySelector("[data-balanza]");
    assert.notEqual(b.dataset.balanza, "0");
    assert.equal(b.dataset.nivelada, "no");
    assert.match(b.getAttribute("aria-label"), /inclinada/);
  } finally { torcida.desmontar(); }
});

test("★ el platillo que pesa más es el que BAJA en la pantalla", () => {
  /*
   * Es el sentido del verbo entero. Si la viga girara al revés, el dibujo
   * diría que pesa el lado contrario y nada fallaría: el número seguiría bien.
   */
  const pesaDebe = montar(React.createElement(Balanza, { inclinacion: 1 }));
  try {
    const izq = pesaDebe.caja.querySelector('[data-platillo="izquierda"]');
    const der = pesaDebe.caja.querySelector('[data-platillo="derecha"]');
    assert.ok(Number.parseFloat(izq.style.top) > Number.parseFloat(der.style.top),
      "pesa el debe: el platillo izquierdo tiene que quedar MÁS ABAJO");
  } finally { pesaDebe.desmontar(); }

  const pesaHaber = montar(React.createElement(Balanza, { inclinacion: -1 }));
  try {
    const izq = pesaHaber.caja.querySelector('[data-platillo="izquierda"]');
    const der = pesaHaber.caja.querySelector('[data-platillo="derecha"]');
    assert.ok(Number.parseFloat(der.style.top) > Number.parseFloat(izq.style.top),
      "pesa el haber: el platillo derecho tiene que quedar más abajo");
  } finally { pesaHaber.desmontar(); }
});

test("la viga gira lo que dice el ángulo, y nunca más del tope", () => {
  for (const [inclinacion, esperado] of [[0, 0], [1, GRADOS_MAXIMOS], [-1, -GRADOS_MAXIMOS], [5, GRADOS_MAXIMOS]]) {
    const m = montar(React.createElement(Balanza, { inclinacion }));
    try {
      assert.equal(Number(m.caja.querySelector("[data-balanza]").dataset.balanza), esperado, `con ${inclinacion}`);
    } finally { m.desmontar(); }
  }
});

/* ═══════════════ LA REGLA DEL CORAL ═══════════════ */

test("★ ni un coral en los tres verbos: una balanza torcida no es un error", () => {
  /*
   * La regla del sitio, y aquí importa especialmente: un saldo al haber, una
   * balanza inclinada o una ficha consumida son estados normales de la
   * contabilidad. Pintarlos de coral le diría al estudiante que se equivocó
   * cuando no se ha equivocado en nada.
   */
  const pantallas = [
    React.createElement(CuentaDeValor, { cuenta: "Caja", debitos: fichas(1000), creditos: fichas(150), cancelar: true }),
    React.createElement(CuentaDeValor, { cuenta: "Cuentas por pagar", debitos: fichas(1), creditos: fichas(4000), cancelar: true }),
    React.createElement(Balanza, { inclinacion: -1 }),
    React.createElement(Balanza, { inclinacion: 0 }),
    React.createElement(Ficha, { valor: 500, lado: HABER, consumido: 0.5 }),
  ];
  for (const pantalla of pantallas) {
    const m = montar(pantalla);
    try {
      assert.doesNotMatch(m.caja.innerHTML, CORAL, "apareció coral donde no hay ningún error");
    } finally { m.desmontar(); }
  }
  assert.match(FAE.coral, CORAL, "la prueba solo vale si el coral del tema es el que se busca");
});

test("una ficha suelta se anuncia con su valor y su lado", () => {
  const m = montar(React.createElement(Ficha, { valor: 2500, lado: HABER }));
  try {
    const f = m.caja.querySelector("[data-ficha]");
    assert.equal(f.getAttribute("aria-label"), "$2.500 al haber");
    assert.match(f.textContent, /\$2\.500/);
  } finally { m.desmontar(); }
});
