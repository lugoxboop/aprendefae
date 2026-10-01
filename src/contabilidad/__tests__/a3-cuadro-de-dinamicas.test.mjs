import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A3 · EL CUADRO DE DINÁMICAS.
 *
 * Lo que aquí se rompe en silencio es que el cuadro diga una cosa y el resto
 * del tema otra. Doce casillas tecleadas a mano se pueden contradecir con
 * CRECE_POR sin que nada avise, y entonces la actividad que RESUME el capítulo
 * sería la única que lo enseña mal.
 *
 * Y el segundo riesgo es el final: si las seis filas no se parten en los dos
 * bloques correctos, el cierre —«no son seis reglas, son dos»— queda
 * desmentido por el dibujo que lo acompaña.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const CuadroDeDinamicas = (await import("../../components/mecanicas/libros/CuadroDeDinamicas.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  FILAS, FILAS_AGRUPADAS, FILAS_A_RESOLVER, FILA_BASE, BLOQUES, MAS, MENOS, signoDe, evaluarCelda, puntuar, pesoDeCadaFila,
} = await import("../cuadroDinamicas.js");
const {
  ACIERTO_POR_FAMILIA, ERRORES, PATRON_POR_FAMILIA, TEXTO_DE_AGRUPACION,
  CONTRAPARTIDA_DEL_INGRESO, ORDEN_DEL_LIBRO,
} = await import("../../data/contabilidadCuadro.js");
const {
  ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO, DEBE, HABER, CRECE_POR,
} = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const CORAL = /#e76f51|rgb\(231,\s*111,\s*81\)|rgba\(231,\s*111,\s*81/i;

/*
 * ═══════════ EL CUADRO DE LA FICHA, COPIADO A MANO ═══════════
 *
 * Esto es lo único de este archivo que está transcrito, y está a propósito:
 * es la p. 87 tal como la escribió la ficha. El código NO lo lee —lo deduce de
 * CRECE_POR— así que comparar las dos cosas es comparar dos fuentes distintas.
 * Si alguien tocara la regla del capítulo, esta prueba lo diría.
 */
const CUADRO_DE_LA_FICHA = [
  [ACTIVO, "+", "−"],
  [PASIVO, "−", "+"],
  [PATRIMONIO, "−", "+"],
  [INGRESO, "−", "+"],
  [GASTO, "+", "−"],
  [COSTO, "+", "−"],
];
const BLOQUES_DE_LA_FICHA = [[ACTIVO, GASTO, COSTO], [PASIVO, PATRIMONIO, INGRESO]];

function montar(extra = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(CuadroDeDinamicas, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {}, ...extra,
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const ficha = (caja, signo) => [...caja.querySelectorAll("[data-ficha]")].find((f) => f.getAttribute("data-ficha") === signo);
const celda = (caja, tipo, lado) => caja.querySelector(`[data-fila="${tipo}"] [data-celda="${lado}"]`);
const signoEn = (caja, tipo, lado) => celda(caja, tipo, lado)?.querySelector("[data-signo]")?.getAttribute("data-signo") ?? null;
const triangulosDe = (caja, tipo) => [...caja.querySelectorAll(`[data-fila="${tipo}"] [data-triangulo]`)].map((x) => x.getAttribute("data-triangulo"));
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));
const contrario = (s) => (s === MAS ? MENOS : MAS);
const ordenEnPantalla = (caja) => [...caja.querySelectorAll("[data-fila]")]
  .map((f) => ({ tipo: f.getAttribute("data-fila"), top: parseFloat(f.style.top) }))
  .sort((a, b) => a.top - b.top)
  .map((f) => f.tipo);

/** Contesta la fila que esté activa, bien o mal, y avanza a la siguiente. */
function contestar(caja, fila, bien) {
  tocar(ficha(caja, bien ? fila.debito : contrario(fila.debito)));
}

/* ═══════════════════ LAS DOCE CASILLAS ═══════════════════ */

test("★★ el cuadro entero sale de CRECE_POR y coincide con la p. 87", () => {
  for (const [tipo, debito, credito] of CUADRO_DE_LA_FICHA) {
    const f = FILAS.find((x) => x.tipo === tipo);
    assert.ok(f, `falta la fila de ${tipo}`);
    assert.equal(f.debito, debito, `la casilla de débito de ${tipo}`);
    assert.equal(f.credito, credito, `la casilla de crédito de ${tipo}`);
  }
  assert.equal(FILAS.length, CUADRO_DE_LA_FICHA.length);
});

test("★★ las dos columnas NUNCA pueden decir lo mismo: el espejo es estructural", () => {
  for (const f of FILAS) {
    assert.notEqual(f.debito, f.credito, `${f.nombre} dice lo mismo en las dos columnas`);
    assert.equal(signoDe(f.tipo, DEBE), f.debito);
    assert.equal(signoDe(f.tipo, HABER), f.credito);
  }
});

test("★ el signo del débito es «+» exactamente para las familias que crecen por el debe", () => {
  for (const f of FILAS) {
    assert.equal(f.debito === MAS, CRECE_POR[f.tipo] === DEBE, `${f.nombre}`);
  }
});

test("★ las filas salen en el orden del libro, no en el agrupado", () => {
  assert.deepEqual(FILAS.map((f) => f.tipo), ORDEN_DEL_LIBRO);
  assert.notDeepEqual(FILAS.map((f) => f.tipo), FILAS_AGRUPADAS.map((f) => f.tipo));
});

/* ═══════════════════ LA AGRUPACIÓN, QUE ES LA LECCIÓN ═══════════════════ */

test("★★ los dos bloques son los de la ficha, y salen de preguntarle a la regla", () => {
  assert.deepEqual(BLOQUES.map((b) => b.filas.map((f) => f.tipo)), BLOQUES_DE_LA_FICHA);
  for (const b of BLOQUES) {
    for (const f of b.filas) assert.equal(CRECE_POR[f.tipo], b.lado, `${f.nombre} está en el bloque equivocado`);
  }
});

test("★ la agrupación no pierde ni repite ninguna fila", () => {
  assert.deepEqual([...FILAS_AGRUPADAS.map((f) => f.tipo)].sort(), [...ORDEN_DEL_LIBRO].sort());
  assert.equal(new Set(FILAS_AGRUPADAS.map((f) => f.tipo)).size, FILAS.length);
});

/* ═══════════════════ LAS DEVOLUCIONES ═══════════════════ */

test("★★ ninguna familia se queda sin explicación al fallarla", () => {
  for (const f of FILAS) {
    const r = evaluarCelda(f, contrario(f.debito));
    assert.equal(r.ok, false);
    assert.ok(r.texto && r.texto.trim().length > 20, `${f.nombre} falla sin texto`);
    assert.ok(r.texto.startsWith("❌"), `${f.nombre} no marca el error`);
    assert.ok(["ecuacion", "contrapartida"].includes(r.escena), `${f.nombre} no trae escena`);
  }
});

test("★ acertar devuelve la razón de ESA fila, y las seis son distintas", () => {
  const vistos = new Set();
  for (const f of FILAS) {
    const r = evaluarCelda(f, f.debito);
    assert.equal(r.ok, true);
    assert.equal(r.texto, ACIERTO_POR_FAMILIA[f.tipo]);
    assert.ok(r.texto.startsWith("✅"));
    vistos.add(r.texto);
  }
  assert.equal(vistos.size, FILAS.length);
});

test("★ el patrón C resalta el término de la fila fallada, no uno fijo", () => {
  const pasivo = FILAS.find((f) => f.tipo === PASIVO);
  const patrimonio = FILAS.find((f) => f.tipo === PATRIMONIO);
  const a = evaluarCelda(pasivo, contrario(pasivo.debito));
  const b = evaluarCelda(patrimonio, contrario(patrimonio.debito));
  assert.equal(a.texto, b.texto, "los dos comparten la explicación");
  assert.equal(a.resaltar, PASIVO);
  assert.equal(b.resaltar, PATRIMONIO);
  assert.notEqual(a.resaltar, b.resaltar, "pero no pueden resaltar lo mismo");
});

test("★ el patrón B resalta el patrimonio aunque la fila fallada sea gasto o costo", () => {
  for (const tipo of [GASTO, COSTO]) {
    const f = FILAS.find((x) => x.tipo === tipo);
    const r = evaluarCelda(f, contrario(f.debito));
    assert.equal(PATRON_POR_FAMILIA[tipo], "B");
    assert.equal(r.resaltar, PATRIMONIO, `${f.nombre} debería señalar el patrimonio`);
    assert.equal(r.flechaAbajo, true);
  }
});

test("★ solo los errores llevan coral; ningún acierto lo menciona", () => {
  for (const texto of Object.values(ACIERTO_POR_FAMILIA)) assert.ok(!texto.includes("❌"));
  for (const e of Object.values(ERRORES)) assert.ok(e.texto.startsWith("❌"));
});

/* ═══════════════════ EL PUNTAJE ═══════════════════ */

test("cada fila pesa lo mismo y el reintento vale la mitad", () => {
  assert.equal(pesoDeCadaFila(FILAS.length).toFixed(2), (100 / 6).toFixed(2));
  assert.equal(puntuar(FILAS.map((f) => ({ id: f.id, primeroOk: true }))), 100);
  assert.equal(puntuar(FILAS.map((f) => ({ id: f.id, primeroOk: false, segundoOk: true }))), 50);
  assert.equal(puntuar(FILAS.map((f) => ({ id: f.id, primeroOk: false, segundoOk: false }))), 0);
});

/* ═══════════════════ EL PANEL DOCENTE ═══════════════════ */

test("★ el panel lee los ids nuevos y no pierde los doce del banco anterior", () => {
  for (const f of FILAS) {
    const e = etiquetaDeItem("cu-cuadro-dinamicas", f.id);
    assert.ok(e && e.includes(f.nombre), `${f.id} sin etiqueta legible`);
  }
  /* Un id del banco de doce combinaciones, que ya jugaron estudiantes. */
  const viejo = etiquetaDeItem("cu-cuadro-dinamicas", "cu3-activo-haber");
  assert.ok(viejo && viejo.length > 0 && viejo !== "cu3-activo-haber", "se perdió un id histórico");
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

/* En la actividad, la fila de Activos viene puesta: se juegan las otras cinco. */
const JUGABLES = FILAS_A_RESOLVER;

test("★★ un error NO escribe el signo, ni en el débito ni en el espejo", () => {
  const { caja, desmontar } = montar();
  const primera = JUGABLES[0];
  assert.equal(signoEn(caja, primera.tipo, DEBE), null);

  contestar(caja, primera, false);

  assert.equal(signoEn(caja, primera.tipo, DEBE), null, "se escribió el signo equivocado");
  assert.equal(signoEn(caja, primera.tipo, HABER), null, "el espejo se llenó tras un fallo");
  assert.ok(caja.querySelector("[data-fallo]"), "falta el aviso de que no se escribió nada");
  desmontar();
});

test("★★ al acertar, el espejo se llena con el signo CONTRARIO", () => {
  const { caja, desmontar } = montar();
  const primera = JUGABLES[0];
  contestar(caja, primera, true);

  const debe = signoEn(caja, primera.tipo, DEBE);
  const haber = signoEn(caja, primera.tipo, HABER);
  assert.equal(debe, primera.debito);
  assert.ok(haber, "el espejo no se llenó");
  assert.notEqual(haber, debe, "el espejo copió el mismo signo");
  assert.equal(haber, primera.credito);
  desmontar();
});

test("★★ el ▲ no está antes de responder, ni tras fallar, y luego señala una sola columna", () => {
  const { caja, desmontar } = montar();
  const primera = JUGABLES[0];
  assert.deepEqual(triangulosDe(caja, primera.tipo), [], "el ▲ estaba puesto antes de responder");

  contestar(caja, primera, false);
  assert.deepEqual(triangulosDe(caja, primera.tipo), [], "el ▲ apareció al fallar y regala la respuesta");

  contestar(caja, primera, true);
  assert.deepEqual(triangulosDe(caja, primera.tipo), [CRECE_POR[primera.tipo]]);
  desmontar();
});

test("★ la casilla fallada queda marcada en coral y sigue vacía", () => {
  const { caja, desmontar } = montar();
  const primera = JUGABLES[0];
  contestar(caja, primera, false);

  const c = celda(caja, primera.tipo, DEBE);
  assert.equal(c.getAttribute("data-fallada"), "si");
  assert.match(c.style.border, CORAL, "la casilla fallada no está en coral");
  assert.equal(Boolean(c.querySelector("[data-signo]")), false, "la casilla fallada tiene un signo escrito");
  desmontar();
});

test("★ cada patrón de error enseña SU escena debajo del cuadro", () => {
  /* Ingresos → el asiento con las dos cuentas; el resto → la ecuación. */
  const casos = [
    [INGRESO, "contrapartida", null],
    [GASTO, "ecuacion", PATRIMONIO],
    [PASIVO, "ecuacion", PASIVO],
    [ACTIVO, "ecuacion", ACTIVO],
  ];
  for (const [tipo, escena, resaltado] of casos) {
    /* La fila de Activos solo se juega en la demo: en la actividad ya viene puesta. */
    const { caja, desmontar } = montar(tipo === FILA_BASE ? { modoDemo: true } : {});
    /* Se llega hasta esa fila acertando las anteriores. */
    for (const f of JUGABLES) {
      if (f.tipo === tipo || tipo === FILA_BASE) break;
      contestar(caja, f, true);
      tocar(boton(caja, "Siguiente fila"));
    }
    const f = FILAS.find((x) => x.tipo === tipo);
    contestar(caja, f, false);

    const vista = caja.querySelector(`[data-escena="${escena}"]`);
    assert.ok(vista, `${tipo} no enseñó la escena ${escena}`);
    if (resaltado) {
      const chip = caja.querySelector("[data-chip]");
      assert.ok(chip, `${tipo} no resaltó ningún término`);
      assert.equal(chip.getAttribute("data-termino"), resaltado);
    } else {
      assert.ok(vista.textContent.includes(CONTRAPARTIDA_DEL_INGRESO.debe));
      assert.ok(vista.textContent.includes(CONTRAPARTIDA_DEL_INGRESO.haber));
    }
    desmontar();
  }
});

test("★ la flecha hacia abajo solo acompaña al patrón de gastos y costos", () => {
  const conFlecha = (tipo) => {
    const { caja, desmontar } = montar();
    for (const f of JUGABLES) {
      if (f.tipo === tipo) break;
      contestar(caja, f, true);
      tocar(boton(caja, "Siguiente fila"));
    }
    contestar(caja, JUGABLES.find((x) => x.tipo === tipo), false);
    const hay = Boolean(caja.querySelector('[data-flecha="abajo"]'));
    desmontar();
    return hay;
  };
  assert.equal(conFlecha(GASTO), true);
  assert.equal(conFlecha(PASIVO), false);
});

test("★★ al completar las seis, el cuadro se parte en los dos bloques", () => {
  const { caja, desmontar } = montar();
  assert.deepEqual(ordenEnPantalla(caja), ORDEN_DEL_LIBRO, "no arranca en el orden del libro");
  /*
   * Booleano y no el nodo: si esto falla, `assert` intenta imprimir el
   * elemento entero y el mensaje se vuelve ilegible —y tarda medio minuto—.
   */
  assert.equal(Boolean(caja.querySelector("[data-agrupacion]")), false, "el cierre estaba escrito antes de tiempo");

  for (let k = 0; k < JUGABLES.length; k += 1) {
    contestar(caja, JUGABLES[k], true);
    tocar(boton(caja, k + 1 === JUGABLES.length ? "Ver el cuadro completo" : "Siguiente fila"));
  }

  assert.deepEqual(ordenEnPantalla(caja), BLOQUES_DE_LA_FICHA.flat(), "las filas no se reordenaron");
  assert.equal(caja.querySelector("[data-cuadro]").getAttribute("data-agrupado"), "si");
  assert.ok(caja.textContent.includes(TEXTO_DE_AGRUPACION));
  desmontar();
});

test("★ los dos bloques quedan separados por un hueco real, no solo por el texto", () => {
  const { caja, desmontar } = montar();
  const juntas = [...caja.querySelectorAll("[data-fila]")].map((f) => parseFloat(f.style.top)).sort((a, b) => a - b);
  const pasoNormal = juntas[1] - juntas[0];

  for (let k = 0; k < JUGABLES.length; k += 1) {
    contestar(caja, JUGABLES[k], true);
    tocar(boton(caja, k + 1 === JUGABLES.length ? "Ver el cuadro completo" : "Siguiente fila"));
  }

  const tops = [...caja.querySelectorAll("[data-fila]")].map((f) => parseFloat(f.style.top)).sort((a, b) => a - b);
  const corte = BLOQUES[0].filas.length;
  assert.ok(
    tops[corte] - tops[corte - 1] > pasoNormal,
    "entre el último del primer bloque y el primero del segundo no se abrió hueco",
  );
  desmontar();
});

test("★ el reintento acierta y vale la mitad; el cuadro queda igual de completo", () => {
  const { caja, desmontar } = montar();
  const primera = JUGABLES[0];
  contestar(caja, primera, false);
  assert.equal(signoEn(caja, primera.tipo, DEBE), null);
  contestar(caja, primera, true);
  assert.equal(signoEn(caja, primera.tipo, DEBE), primera.debito);
  assert.equal(signoEn(caja, primera.tipo, HABER), primera.credito);
  desmontar();
});

test("★ las flechas izquierda y derecha mueven entre las dos fichas", () => {
  const { caja, desmontar } = montar();
  const mas = ficha(caja, MAS);
  const menos = ficha(caja, MENOS);
  assert.ok(mas && menos, "faltan las fichas");
  act(() => mas.focus());
  act(() => { mas.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); });
  assert.equal(document.activeElement, menos, "la flecha no movió el foco");
  act(() => { menos.dispatchEvent(new w.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })); });
  assert.equal(document.activeElement, mas);
  desmontar();
});

test("★ las dos fichas son botones de verdad, con su nombre dicho", () => {
  const { caja, desmontar } = montar();
  for (const s of [MAS, MENOS]) {
    const f = ficha(caja, s);
    assert.equal(f.tagName, "BUTTON");
    assert.ok((f.getAttribute("aria-label") ?? "").length > 10, `la ficha ${s} no se anuncia`);
  }
  desmontar();
});

/* ═══════════════════ LA FILA BASE (Levi) ═══════════════════ */

test("★★★ la fila base de Activos viene puesta, marcada, y no se puede cambiar", () => {
  const { caja, desmontar } = montar();
  const base = FILAS.find((f) => f.tipo === FILA_BASE);
  assert.equal(FILA_BASE, ACTIVO);
  const fila = caja.querySelector(`[data-fila="${ACTIVO}"]`);
  assert.equal(fila.getAttribute("data-fila-base"), "si");
  assert.equal(fila.querySelector("[data-marca-fila-base]")?.textContent, "fila base");
  assert.equal(signoEn(caja, ACTIVO, DEBE), base.debito);
  assert.equal(signoEn(caja, ACTIVO, HABER), base.credito);
  assert.equal(signoEn(caja, ACTIVO, DEBE), MAS);
  assert.equal(signoEn(caja, ACTIVO, HABER), MENOS);
  /* Sus casillas no son botones: no hay forma de tocarlas. */
  assert.equal(caja.querySelectorAll(`[data-fila="${ACTIVO}"] button`).length, 0, "la fila base se puede tocar");
  assert.equal(celda(caja, ACTIVO, DEBE).getAttribute("data-destino"), null);
  /* Arranca en la segunda fila (Pasivos), y las fichas no cambian Activos. */
  contestar(caja, JUGABLES[0], false);
  assert.equal(signoEn(caja, ACTIVO, DEBE), MAS, "un toque cambió la fila base");
  desmontar();
});

test("★★★ la fila base no cuenta en el puntaje: se puntúan las otras cinco", () => {
  assert.equal(JUGABLES.length, 5);
  assert.ok(!JUGABLES.some((f) => f.tipo === FILA_BASE));
  let recibido = null;
  const { caja, desmontar } = montar({ onCompletar: (pct, ms, detalle) => { recibido = { pct, detalle }; } });
  /* Las cinco bien al primer intento: 100 %, no 5/6. */
  for (let k = 0; k < JUGABLES.length; k += 1) {
    contestar(caja, JUGABLES[k], true);
    tocar(boton(caja, k + 1 === JUGABLES.length ? "Ver el cuadro completo" : "Siguiente fila"));
  }
  tocar(boton(caja, "Ver el resultado"));
  assert.equal(recibido.pct, 100);
  assert.equal(recibido.detalle.length, 5);
  assert.ok(!recibido.detalle.some((d) => d.item === `cu3-fila-${FILA_BASE}`), "la fila base entró al detalle");
  assert.ok(caja.textContent.includes("5 de 5 al primer intento"), "el cierre no cuenta sobre cinco");
  desmontar();
});

test("★★ con un fallo en una de las cinco, cada fila pesa 20 %", () => {
  let pct = null;
  const { caja, desmontar } = montar({ onCompletar: (p) => { pct = p; } });
  for (let k = 0; k < JUGABLES.length; k += 1) {
    if (k === 0) contestar(caja, JUGABLES[k], false);
    contestar(caja, JUGABLES[k], true);
    tocar(boton(caja, k + 1 === JUGABLES.length ? "Ver el cuadro completo" : "Siguiente fila"));
  }
  tocar(boton(caja, "Ver el resultado"));
  assert.equal(pct, (4 + 0.5) / 5 * 100);
  desmontar();
});

test("★★ la demo de «Así se juega» sigue mostrando Activos: arranca vacía y sin marca de fila base", () => {
  const { caja, desmontar } = montar({ modoDemo: true });
  assert.equal(signoEn(caja, ACTIVO, DEBE), null);
  assert.equal(caja.querySelector("[data-marca-fila-base]"), null);
  contestar(caja, FILAS[0], true);
  assert.equal(signoEn(caja, ACTIVO, DEBE), MAS);
  desmontar();
});

test("★ las columnas dicen DEBE / HABER", () => {
  const { caja, desmontar } = montar();
  assert.equal(caja.querySelector(`[data-columna="${DEBE}"]`).textContent, "DEBE");
  assert.equal(caja.querySelector(`[data-columna="${HABER}"]`).textContent, "HABER");
  desmontar();
});
