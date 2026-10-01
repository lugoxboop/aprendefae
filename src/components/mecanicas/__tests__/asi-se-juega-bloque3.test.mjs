import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUES 3, 4 Y 5 (T1-6 y las siete del Tema 2).
 *
 * Las mismas garantías que los bloques 1 y 2: la demo es el componente real y
 * NO guarda nada; los ejemplos no son del banco; sale la primera vez, no la
 * segunda, y «¿Cómo se juega?» la reabre. Y además: las consignas nuevas del
 * Tema 2 se ven fijas arriba, y los pendientes de T1-1.
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
const JuegoConTutorial = (await import("../libros/JuegoConTutorial.jsx")).default;
const EnCualEstadoAparece = (await import("../libros/tema1/EnCualEstadoAparece.jsx")).default;
const DesdeDondePreguntan = (await import("../libros/tema1/DesdeDondePreguntan.jsx")).default;
const T2 = await import("../libros/actividades.jsx");
const { MarcoLibros } = await import("../bloques/marcos.jsx");
const B3 = await import("../../../data/asiSeJuegaBloque3.js");
const { ASI_SE_JUEGA: ASI_TODAS } = await import("../../../data/asiSeJuega.js");
const { CONSIGNA_TEMA2 } = await import("../../../data/contabilidadConsignas.js");
const { T1_6, CONCEPTOS, ZONA_FUERA } = await import("../../../data/contabilidadTema1.js");
const { CUENTAS, tipoDeCuenta } = await import("../../../data/contabilidad.js");
const { IZQUIERDA_O_DERECHA } = await import("../../../data/contabilidadActividades.js");
const { ITEMS: ITEMS_DEBITA } = await import("../../../data/contabilidadDebitaOAcredita.js");
const { CUENTAS: CUENTAS_SALDO } = await import("../../../contabilidad/saldoDeLaCuenta.js");
const { ASIENTOS: SIMPLES } = await import("../../../contabilidad/armaElAsiento.js");
const { ASIENTOS: COMPUESTOS } = await import("../../../contabilidad/asientoCompuesto.js");
const { BALANCES } = await import("../../../contabilidad/armaElBalance.js");
const contabilidadCuadro = await import("../../../data/contabilidadCuadro.js");

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
const esperar = async (cond, ms = 6000) => {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error("no llegó a tiempo");
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  }
};
const contarEscrituras = () => {
  const original = w.Storage.prototype.setItem;
  const escritas = [];
  w.Storage.prototype.setItem = function (k, v) { escritas.push(k); return original.call(this, k, v); };
  return { escritas, soltar: () => { w.Storage.prototype.setItem = original; } };
};

/* Las ocho, con el componente que monta cada vista. */
const JUEGOS = {
  [T1_6.id]: { id: T1_6.id, Mecanica: EnCualEstadoAparece, titulo: T1_6.subtema },
  "cu-izquierda-o-derecha": { id: "cu-izquierda-o-derecha", Mecanica: T2.IzquierdaODerecha },
  "cu-de-que-familia": { id: "cu-de-que-familia", Mecanica: T2.DeQueFamilia },
  "cu-cuadro-dinamicas": { id: "cu-cuadro-dinamicas", Mecanica: T2.CuadroDinamicas },
  "cu-debita-o-acredita": { id: "cu-debita-o-acredita", Mecanica: T2.DebitaOAcredita },
  "cu-saldo-de-la-cuenta": { id: "cu-saldo-de-la-cuenta", Mecanica: T2.ElSaldoDeLaCuenta },
  "cu-arma-el-asiento": { id: "cu-arma-el-asiento", Mecanica: T2.ArmaElAsiento },
  "cu-asiento-compuesto": { id: "cu-asiento-compuesto", Mecanica: T2.ElAsientoCompuesto },
};
const IDS = Object.keys(JUEGOS);
const TEMA2 = IDS.filter((id) => id.startsWith("cu-"));
const tutorial = (id, usuarioId = "u-prueba") => React.createElement(JuegoConTutorial, {
  juego: JUEGOS[id], usuarioId, onCompletar: () => {},
  ...(id === T1_6.id ? { Marco: MarcoLibros, acento: "#E9C46A", rotulo: "PRUEBA" } : { tituloVisible: false }),
});
const pantalla = (id) => React.createElement(AsiSeJuega, {
  asi: ASI_TODAS[id], Mecanica: JUEGOS[id].Mecanica, onSiguiente: () => {}, escala: 0.05,
});

/* ═══════════════════ LOS TEXTOS DE GEN ═══════════════════ */

test("★★ las catorce actividades tienen «Así se juega»", () => {
  assert.deepEqual(Object.keys(B3.ASI_SE_JUEGA_BLOQUE3).sort(), [...IDS].sort());
  assert.equal(Object.keys(ASI_TODAS).length, 14);
});

test("★★ consignas: T1-6 cambia (la ficha no se toca) y las siete del Tema 2 son nuevas", () => {
  assert.equal(T1_6.consigna, "Toca el informe donde va la ficha. Si es el primero, toca también en qué parte.");
  assert.deepEqual(CONSIGNA_TEMA2, {
    "cu-izquierda-o-derecha": "Lee si la cuenta sube o baja. Lleva la ficha al lado que corresponde.",
    "cu-de-que-familia": "Arrastra cada cuenta a su sección del informe.",
    "cu-cuadro-dinamicas": "Toca el signo y ponlo en la casilla de débito de cada fila.",
    "cu-debita-o-acredita": "Lee la transacción. Lleva la ficha al lado de la cuenta que te preguntan.",
    "cu-saldo-de-la-cuenta": "Escribe el saldo de la cuenta. Luego toca de qué lado va.",
    "cu-arma-el-asiento": "Pon un nombre en cada cuenta. Luego pon cada valor en su lado.",
    "cu-asiento-compuesto": "Saca las cuentas que se mueven. Ponlas en su columna y escribe cada valor.",
  });
  for (const id of IDS) {
    const consigna = id === T1_6.id ? T1_6.consigna : CONSIGNA_TEMA2[id];
    assert.equal(ASI_TODAS[id].consigna, consigna, `${id}: la pantalla no usa la consigna de la actividad`);
    assert.equal(ASI_TODAS[id].pasos.length, 3, id);
    assert.ok(!ASI_TODAS[id].alt.startsWith("Ejemplo"), `${id}: el alt trae «Ejemplo» y la pantalla lo duplicaría`);
  }
  /* La línea que estaba pendiente de revisión ya no existe. */
  assert.equal(contabilidadCuadro.INSTRUCCION, undefined);
});

test("★★ los pasos de Gen, palabra por palabra", () => {
  const pasos = Object.fromEntries(IDS.map((id) => [id, ASI_TODAS[id].pasos]));
  assert.deepEqual(pasos[T1_6.id], ["Lee la ficha que está en la mano.", "Toca el informe donde va esa ficha.", "Toca la parte y confirma con Colocar la ficha."]);
  assert.deepEqual(pasos["cu-izquierda-o-derecha"], ["Lee si esa cuenta sube o baja.", "Arrastra la ficha al debe o al haber.", "Mira el ▲ que sale después de responder."]);
  assert.deepEqual(pasos["cu-de-que-familia"], ["Lee el nombre de la cuenta.", "Pregúntate si lo tiene, lo debe, o es de los dueños.", "Arrastra la cuenta a esa sección."]);
  assert.deepEqual(pasos["cu-cuadro-dinamicas"], ["Mira qué familia de cuentas dice la fila.", "Toca más o menos y ponlo en la casilla de débito.", "La casilla de crédito se llena sola, al revés."]);
  assert.deepEqual(pasos["cu-debita-o-acredita"], ["Lee la transacción completa.", "Fíjate en cuál de las dos cuentas te preguntan.", "Arrastra la ficha al debe o al haber de esa cuenta."]);
  assert.deepEqual(pasos["cu-saldo-de-la-cuenta"], ["Suma cada columna de la cuenta por separado.", "Escribe la diferencia entre las dos sumas.", "Toca el lado de la columna que sumó más."]);
  assert.deepEqual(pasos["cu-arma-el-asiento"], ["Lee la transacción y busca las dos cuentas.", "Toca un nombre y después la cuenta donde va.", "Toca el valor y después el lado de su cuenta."]);
  assert.deepEqual(pasos["cu-asiento-compuesto"], ["Lee la transacción y cuenta cuántas cuentas se mueven.", "Saca cada cuenta al debe o al haber con los botones.", "Escribe cada valor y mira que la diferencia quede en cero."]);
});

/* ═══════════════════ LOS EJEMPLOS NO SON DEL BANCO, Y LAS CUENTAS EXISTEN ═══════════════════ */

test("★★★ ningún ejemplo de los bloques 3-5 está en su banco", () => {
  const no = (lista, ej, campo) => assert.ok(!lista.some((x) => x.id === ej.id || (campo && x[campo] === ej[campo])), `${ej.id} está en el banco`);
  no(CONCEPTOS, B3.EJEMPLO_T1_6, "nombre");
  no(IZQUIERDA_O_DERECHA.items, B3.EJEMPLO_IZQUIERDA, "enunciado");
  no(BALANCES.flatMap((b) => b.cuentas), B3.EJEMPLO_FAMILIA, "cuenta");
  no(ITEMS_DEBITA, B3.EJEMPLO_DEBITA, "enunciado");
  no(CUENTAS_SALDO, B3.EJEMPLO_SALDO, null);
  no(SIMPLES, B3.EJEMPLO_ASIENTO_SIMPLE.a, "texto");
  no(COMPUESTOS, B3.EJEMPLO_ASIENTO_COMPUESTO.a, "texto");
});

test("★★ las cuentas que Gen pidió confirmar están en el catálogo, con su familia", () => {
  assert.equal(tipoDeCuenta("Muebles y enseres"), "activo");
  assert.equal(tipoDeCuenta("Cuentas por pagar"), "pasivo");
  assert.equal(tipoDeCuenta("Inventario"), "activo");
  for (const c of B3.EJEMPLO_ASIENTO_SIMPLE.banco) assert.ok(CUENTAS[c], `«${c}» no está en el catálogo`);
});

/* ═══════════════════ PRIMERA VEZ, SEGUNDA VEZ, Y «¿CÓMO SE JUEGA?» ═══════════════════ */

for (const id of IDS) {
  test(`★★★ ${id}: sale la primera vez, no la segunda, y «¿Cómo se juega?» bajo la consigna la reabre`, () => {
    w.localStorage.clear();
    const uno = montar(tutorial(id));
    try {
      assert.ok(uno.caja.querySelector(`[data-asi-se-juega="${id}"]`), "la primera vez no salió");
      assert.equal(uno.caja.querySelector("[data-partida]").hidden, true);
    } finally { uno.desmontar(); }
    const dos = montar(tutorial(id));
    try {
      assert.equal(dos.caja.querySelector("[data-asi-se-juega]"), null, "salió otra vez");
      const consigna = dos.caja.querySelector("[data-encabezado] [data-consigna]");
      assert.equal(consigna?.textContent, ASI_TODAS[id].consigna, "la consigna no se ve arriba");
      const ayuda = dos.caja.querySelector("[data-encabezado] [data-como-se-juega]");
      assert.ok(ayuda, "no está «¿Cómo se juega?» bajo la consigna");
      tocar(ayuda);
      assert.ok(dos.caja.querySelector(`[data-asi-se-juega="${id}"]`), "«¿Cómo se juega?» no la abrió");
    } finally { dos.desmontar(); }
  });
}

test("★★ en el Tema 2 la pantalla no repite el nombre que ya está encima (queda para el lector)", () => {
  w.localStorage.clear();
  const { caja, desmontar } = montar(tutorial("cu-arma-el-asiento"));
  try {
    const h2 = caja.querySelector("[data-asi-se-juega] h2");
    assert.equal(h2.textContent, "Arma el Asiento");
    assert.equal(h2.style.position, "absolute", "el título se ve dos veces");
  } finally { desmontar(); }
});

/* ═══════════════════ LA DEMO NO GUARDA NADA, Y TERMINA DONDE DEBE ═══════════════════ */

const ACIERTO = {
  [T1_6.id]: "Va en el primer informe, en lo que tiene. El horno es de la panadería y le dura años.",
  "cu-izquierda-o-derecha": "Debe. Muebles y enseres es un activo, y los activos crecen por la izquierda.",
  "cu-de-que-familia": "Activo. El horno es algo que la panadería tiene.",
  "cu-cuadro-dinamicas": "Los activos crecen por el debe. Es la fila base: de aquí salen todas las demás.",
  "cu-debita-o-acredita": "Se acredita. La deuda con el proveedor nace, y los pasivos crecen por el haber.",
  "cu-saldo-de-la-cuenta": "$700.000. Movimiento débito $1.000.000 menos movimiento crédito $300.000.",
  "cu-arma-el-asiento": "Asiento correcto",
  "cu-asiento-compuesto": "Tres cuentas, y lo que cuadra son los totales: $3.000.000 al debe contra $3.000.000 al haber. Un activo entra y dos cosas lo pagan.",
};

for (const id of IDS) {
  test(`★★★ ${id}: la demo llega a su acierto con el componente real, «Siguiente» espera, y no guarda nada`, async () => {
    w.localStorage.clear();
    const conteo = contarEscrituras();
    const redAntes = llamadasARed.length;
    const { caja, desmontar } = montar(pantalla(id));
    try {
      const sig = () => caja.querySelector("[data-asj-siguiente] button");
      const escenario = () => caja.querySelector("[data-asj-escenario]");
      assert.equal(sig().disabled, true);
      assert.equal(caja.querySelector("figure figcaption").textContent, `Ejemplo: ${ASI_TODAS[id].alt}`);
      assert.equal(caja.querySelectorAll("[inert]").length, 1);
      await esperar(() => !sig().disabled, 8000);
      await esperar(() => escenario().querySelector('[role="status"]'));
      const retro = [...escenario().querySelectorAll('[role="status"]')].map((x) => x.textContent).join(" ");
      assert.ok(retro.includes(ACIERTO[id]), `${id}: la demo no terminó en su acierto («${retro}»)`);
      assert.ok(retro.startsWith("Correcto"), `${id}: la demo terminó en un error`);
      /* Solo la zona de juego: ni consigna, ni avance, ni botón de seguir. */
      assert.equal(escenario().querySelector("[data-encabezado]"), null);
      assert.equal(escenario().querySelector("[data-nodo]"), null);
      for (const texto of ["Siguiente registro", "Siguiente cuenta", "Siguiente fila", "Siguiente transacción", "Siguiente asiento", "Siguiente ficha", "Ver el resultado", "Ver resultado"]) {
        assert.ok(![...escenario().querySelectorAll("button")].some((b) => b.textContent.trim() === texto), `la demo ofrece «${texto}»`);
      }
    } finally {
      desmontar();
      conteo.soltar();
    }
    assert.deepEqual(conteo.escritas, [], "la demo escribió en el navegador");
    assert.equal(llamadasARed.length, redAntes, "la demo llamó a la red");
  });
}

test("★★★ en modo demo, responder no llama a onCompletar (Tema 2)", () => {
  let llamadas = 0;
  const onCompletar = () => { llamadas += 1; };
  const a = montar(React.createElement(T2.IzquierdaODerecha, { modoDemo: true, items: [B3.EJEMPLO_IZQUIERDA], onCompletar }));
  try { tocar(a.caja.querySelector('[data-destino="debe"]')); } finally { a.desmontar(); }
  const b = montar(React.createElement(T2.DebitaOAcredita, { modoDemo: true, items: [B3.EJEMPLO_DEBITA], onCompletar }));
  try { tocar(b.caja.querySelector('[data-destino="haber"]')); } finally { b.desmontar(); }
  assert.equal(llamadas, 0);
});

/* ═══════════════════ LOS PENDIENTES DE T1-1 ═══════════════════ */

test("★★ T1-1: «DÓNDE QUEDÓ» con tilde, y los puntos 1 a 4 atenuados en el borde con el texto en #A8B6C8", async () => {
  const { EJEMPLO_T1_1 } = await import("../../../data/asiSeJuegaBloque2.js");
  const { caja, desmontar } = montar(React.createElement(DesdeDondePreguntan, {
    Marco: MarcoLibros, onCompletar: () => {}, items: [EJEMPLO_T1_1],
  }));
  try {
    for (const n of [1, 2, 3, 4]) {
      const est = caja.querySelector(`[data-estacion="${n}"]`);
      assert.equal(est.style.opacity, "", `punto ${n}: la fila entera lleva opacidad`);
      assert.equal(est.querySelector("[data-nombre-estacion]").style.color, "rgb(168, 182, 200)", `punto ${n}: el nombre no es #A8B6C8`);
      assert.equal(est.querySelector("span").style.color, "rgb(168, 182, 200)", `punto ${n}: el número no es #A8B6C8`);
    }
    tocar(caja.querySelector(`[data-zona="${ZONA_FUERA}"]`));
    assert.equal(caja.querySelector("[data-rotulo-seccion]").textContent, "DÓNDE QUEDÓ");
  } finally { desmontar(); }
});
