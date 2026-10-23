import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-5 · LA ECUACIÓN EN MOVIMIENTO
 *
 * Las ocho transacciones en orden, desde cero hasta 465.000.
 *
 * Lo que se rompe callado aquí es LA PRIORIDAD A > C > B. Los tres errores se
 * solapan: mover la parte quieta casi siempre descuadra también los dos lados,
 * y unas cifras equivocadas pueden cuadrar perfectamente. Si el orden se
 * invierte, el estudiante recibe la explicación fina con la ecuación rota, o
 * se le corrige la cifra cuando el problema era que había movido algo que no
 * se movía.
 *
 * Y LOS TOTALES SE ACUMULAN, no se transcriben: salen de sumar los efectos de
 * los asientos, los mismos que usa T1-4.
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

const LaEcuacionEnMovimiento = (await import("../../components/mecanicas/libros/tema1/LaEcuacionEnMovimiento.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  totalesTras, parteQuieta, enModoCorto, evaluarT1_5, efectoDe,
  movimientoT1_5, evaluarTorresT1_5, opcionesTotalT1_5, altoDeTorre, sinEmoji, hechoDeItem,
} = await import("../tema1.js");
const {
  TRANSACCIONES_CAP2, T1_5, PARTES, ERROR_T1_5, DESDE_EL_CORTO, TORRES_T1_5, ACIERTO_T1_5_FINAL,
} = await import("../../data/contabilidadTema1.js");
const { ACTIVO, PASIVO, PATRIMONIO, pesos } = await import("../../data/contabilidad.js");
const { FAE } = await import("../../theme.js");

let completado = null;
const montar = () => {
  completado = null;
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(LaEcuacionEnMovimiento, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar,
    onCompletar: (pct, ms, detalle) => { completado = { pct, detalle }; },
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(texto));
const mov = (k) => movimientoT1_5(totalesTras(k), TRANSACCIONES_CAP2[k]);
/* El total elegido para una parte: el correcto, o el de restar donde había que sumar (o al revés). */
const totalPara = (m, p, bien) => (bien ? m.despues[p] : m.antes[p] - m.signos[p] * m.monto);
const elegirTotal = (caja, p, v) => tocar(caja.querySelector(`[data-opcion-total="${p}:${v}"]`));
/* Las dos decisiones del hecho k: cada una bien, o mal a propósito. */
const decidir = (caja, k, { quieta = true, signos = true } = {}) => {
  const m = mov(k);
  tocar(caja.querySelector(`[data-parte="${quieta ? m.quieta : m.mueven[0]}"]`));
  for (const p of m.mueven) elegirTotal(caja, p, totalPara(m, p, signos));
};
const totalDe = (caja, lado) => caja.querySelector(`[data-total="${lado}"]`).textContent;
const altoDe = (caja, parte) => Number(caja.querySelector(`[data-tramo="${parte}"]`).dataset.alto);

/*
 * ═══════════ «INCLUDES» DE UNA CONSTANTE VACÍA NO COMPRUEBA NADA ═══════════
 *
 * `texto.includes(ROTULO)` pasa siempre si ROTULO es la cadena vacía, así que
 * vaciar el rótulo en los datos no rompía ninguna prueba y la pantalla se
 * quedaba sin él. Sobrevivieron tres mutantes por esto. Esta ayuda exige
 * primero que la constante diga algo.
 */
const contiene = (texto, cadena, que) => {
  assert.ok(cadena && cadena.length > 3, `${que}: el texto del archivo de contenido se quedó vacío`);
  assert.ok(texto.includes(cadena), `${que}: no sale en pantalla`);
};
const CORAL = /#e76f51|rgba?\(\s*231,\s*111,\s*81/i;


/* ═══════════════════ LOS TOTALES ═══════════════════ */

test("★★★ el recorrido arranca en cero y cierra en 465.000 = 465.000", () => {
  const cero = totalesTras(0);
  for (const p of PARTES) assert.equal(cero[p.id], 0, `${p.id}: la empresa no arranca en cero`);
  const fin = totalesTras(TRANSACCIONES_CAP2.length);
  assert.equal(fin[ACTIVO], 465000);
  assert.equal(fin[PASIVO] + fin[PATRIMONIO], 465000);
});

test("★★ los totales se acumulan de verdad: cada paso es el anterior más su efecto", () => {
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const antes = totalesTras(k);
    const ahora = totalesTras(k + 1);
    const e = efectoDe(TRANSACCIONES_CAP2[k]);
    for (const p of PARTES) {
      assert.equal(ahora[p.id], antes[p.id] + e.valores[p.id],
        `hecho ${k + 1}, ${p.id}: el total no es el anterior más el efecto`);
    }
    assert.equal(ahora[ACTIVO], ahora[PASIVO] + ahora[PATRIMONIO], `hecho ${k + 1}: no cuadra`);
  }
});

test("★★ cada hecho deja exactamente una parte quieta", () => {
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const quieta = parteQuieta(k);
    assert.equal(totalesTras(k)[quieta], totalesTras(k + 1)[quieta]);
  }
});

/* ═══════════════════ LA PRIORIDAD A > C > B ═══════════════════ */

test("★★★ descuadrar gana a todo: A antes que C y que B", () => {
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const real = totalesTras(k + 1);
    const antes = totalesTras(k);
    const quieta = parteQuieta(k);

    /*
     * Descuadra Y además mueve la quieta: los dos errores a la vez. Tiene que
     * salir la A. Con la ecuación rota, discutir de cuál parte no se movía es
     * corregir el detalle antes que el desastre.
     */
    const mal = { ...real, [quieta]: antes[quieta] + 7000 };
    const r = evaluarT1_5(k, mal);
    assert.equal(r.patron, "A", `hecho ${k + 1}: con los dos errores no salió la A`);
    assert.ok(r.texto.includes(pesos(7000)), `hecho ${k + 1}: la A no dice cuánto falta`);
  }
});

test("★★★ si cuadra pero movió la parte quieta, es C y no B", () => {
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const real = totalesTras(k + 1);
    const antes = totalesTras(k);
    const quieta = parteQuieta(k);
    /*
     * Se mueve la quieta y se compensa en el otro lado para que la ecuación
     * siga cuadrando. Es el caso que separa la C de la B: cuadra, pero el
     * rastro de lo de atrás se perdió.
     */
    const mal = { ...real };
    mal[quieta] += 5000;
    if (quieta === ACTIVO) mal[PASIVO] += 5000;
    else mal[ACTIVO] += 5000;

    assert.equal(mal[ACTIVO], mal[PASIVO] + mal[PATRIMONIO], `hecho ${k + 1}: el montaje no cuadra`);
    const r = evaluarT1_5(k, mal);
    assert.equal(r.patron, "C", `hecho ${k + 1}: cuadrando y moviendo la quieta no salió la C`);
    assert.equal(r.texto, ERROR_T1_5.C);
    assert.deepEqual(r.resaltar, [quieta], `hecho ${k + 1}: la C no señala la parte quieta`);
  }
});

test("★★★ si cuadra y respeta la quieta pero las cifras no son las del hecho, es B", () => {
  /*
   * El `continue` de abajo salta los montajes que no cuadran. Si algún día los
   * saltara todos, la prueba pasaría sin comprobar nada — así que se cuentan.
   */
  let comprobados = 0;
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const real = totalesTras(k + 1);
    const quieta = parteQuieta(k);
    /* Se mueven las DOS que sí cambian, en la misma cantidad, para que cuadre. */
    const mueven = PARTES.map((p) => p.id).filter((p) => p !== quieta);
    const mal = { ...real };
    for (const p of mueven) mal[p] += 3000;
    /* Si las dos que se mueven están del mismo lado, esto descuadraría. */
    if (mal[ACTIVO] !== mal[PASIVO] + mal[PATRIMONIO]) continue;

    const r = evaluarT1_5(k, mal);
    assert.equal(r.patron, "B", `hecho ${k + 1}: cuadrando y con la quieta bien no salió la B`);
    assert.equal(r.texto, ERROR_T1_5.B);
    comprobados += 1;
  }
  assert.equal(comprobados, TRANSACCIONES_CAP2.length,
    `solo se comprobaron ${comprobados} hechos de ${TRANSACCIONES_CAP2.length}`);
});

test("★★ la A dice cuánto falta, calculado, no estimado", () => {
  const k = 0;
  const real = totalesTras(1);
  for (const hueco of [1000, 25000, 130000]) {
    const r = evaluarT1_5(k, { ...real, [PASIVO]: real[PASIVO] - hueco });
    assert.equal(r.patron, "A");
    assert.equal(r.hueco, hueco, "el hueco no es el que de verdad falta");
    assert.ok(r.texto.includes(pesos(hueco)), `la A no dice ${pesos(hueco)}`);
    assert.ok(!r.texto.includes("{Z}"), "la A conserva el hueco sin rellenar");
  }
});

test("★★ acertar los tres es acertar, y no trae devolución escrita", () => {
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    const r = evaluarT1_5(k, totalesTras(k + 1));
    assert.equal(r.ok, true, `hecho ${k + 1}: lo correcto no acierta`);
    assert.equal(r.texto, null, "acertar trae una frase y la comprobación ya está en el pie");
  }
});

/* ═══════════════════ EL MODO CORTO ═══════════════════ */

test("★★ el modo corto empieza en el quinto hecho, ni antes ni después", () => {
  assert.equal(DESDE_EL_CORTO, 5);
  for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
    assert.equal(enModoCorto(k), k + 1 >= 5, `hecho ${k + 1}`);
  }
});

/* ═══════════════════ LAS DOS TORRES (P2 de Mai) ═══════════════════ */

test("★★★ ya no hay casillas de cifra, ni pie que compara mientras se escribe, ni historial", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelectorAll("input").length, 0, "quedó un CampoCifra");
    assert.equal(caja.querySelector("[data-pie]"), null, "quedó el pie que daba la respuesta (R10)");
    assert.equal(caja.querySelector("[data-historial]"), null);
    assert.ok(caja.querySelector('[data-torres][role="img"]'), "no están las torres");
  } finally { desmontar(); }
});

test("★★★ la escala es fija: $475.000 miden 150 px en los ocho hechos", () => {
  assert.equal(altoDeTorre(475000), 150);
  assert.equal(altoDeTorre(0), 0);
  /* Lo honesto de la ficha: $10.000 mueven 3,2 px. */
  assert.equal(altoDeTorre(10000).toFixed(1), "3.2");
});

test("★★★ cada hecho mueve dos partes por el mismo monto y deja una quieta, y las torres siguen la tabla de Mai", () => {
  const TABLA = [
    [300000, 0, 300000], [325000, 25000, 300000], [375000, 75000, 300000], [365000, 65000, 300000],
    [465000, 65000, 400000], [415000, 65000, 350000], [475000, 125000, 350000], [465000, 115000, 350000],
  ];
  for (let k = 0; k < 8; k += 1) {
    const m = mov(k);
    assert.equal(m.mueven.length, 2);
    assert.equal(m.quieta, parteQuieta(k), `hecho ${k + 1}: la quieta`);
    assert.deepEqual([m.despues[ACTIVO], m.despues[PASIVO], m.despues[PATRIMONIO]], TABLA[k], `hecho ${k + 1}`);
  }
});

test("★★★ R10: antes de «Anotar» las torres no se mueven; al anotar van a los totales correctos", () => {
  const { caja, desmontar } = montar();
  try {
    decidir(caja, 0);
    decidir(caja, 0); /* tocar de nuevo no cambia nada: la parte ya está decidida */
    assert.equal(totalDe(caja, "izquierda"), "$0", "las torres se movieron antes de anotar");
    assert.equal(altoDe(caja, ACTIVO), 0);
    tocar(boton(caja, TORRES_T1_5.anotar));
    assert.equal(totalDe(caja, "izquierda"), "$300.000");
    assert.equal(totalDe(caja, "derecha"), "$300.000");
    assert.equal(altoDe(caja, ACTIVO).toFixed(2), altoDeTorre(300000).toFixed(2));
  } finally { desmontar(); }
});

test("★★★ el modelo corre también en el error, y el fantasma sale solo en la torre que difiere", () => {
  const { caja, desmontar } = montar();
  try {
    decidir(caja, 0);
    tocar(boton(caja, TORRES_T1_5.anotar));
    tocar(boton(caja, TORRES_T1_5.siguiente));
    /* Hecho 2: entra un computador a crédito (+25.000 activo, +25.000 pasivo). Las dos al revés. */
    decidir(caja, 1, { signos: false });
    tocar(boton(caja, TORRES_T1_5.anotar));
    const real = totalesTras(2);
    assert.equal(totalDe(caja, "izquierda"), pesos(real[ACTIVO]), "en el error las torres no fueron a lo correcto");
    assert.equal(totalDe(caja, "derecha"), pesos(real[PASIVO] + real[PATRIMONIO]));
    assert.ok(caja.querySelector('[data-fantasma="izquierda"]'));
    assert.ok(caja.querySelector('[data-fantasma="derecha"]'));
    /* B: dan igual (las dos bajaron) pero no son las cifras del hecho. */
    assert.equal(caja.querySelector("[data-texto-retro]").textContent, sinEmoji(ERROR_T1_5.B));
  } finally { desmontar(); }
  /* Solo una torre distinta: el fantasma solo ahí. */
  const m = mov(1);
  const r = evaluarTorresT1_5(m, m.quieta, { [ACTIVO]: m.despues[ACTIVO], [PASIVO]: m.antes[PASIVO] - m.monto });
  assert.deepEqual(r.fantasma, { izquierda: false, derecha: true });
  assert.equal(r.patron, "A");
  assert.equal(r.texto, ERROR_T1_5.A.replace("{Z}", pesos(50000)));
});

test("★★★ la primera decisión se marca al instante, y la segunda va siempre sobre las dos que de verdad se mueven", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(caja.querySelector("[data-pregunta]").textContent, TORRES_T1_5.preguntaQuieta);
    assert.equal(caja.querySelectorAll("[data-totales]").length, 0, "los totales salieron antes de decidir la quieta");
    const m = mov(0);
    tocar(caja.querySelector(`[data-parte="${m.mueven[0]}"]`)); /* mal: esa sí se mueve */
    assert.equal(caja.querySelector(`[data-parte="${m.mueven[0]}"] [data-pastilla]`).dataset.pastilla, "tachada");
    const iba = caja.querySelector(`[data-parte="${m.quieta}"] [data-pastilla]`);
    assert.equal(iba.dataset.pastilla, "revelada");
    assert.equal(iba.textContent, `Iba aquí: ${TORRES_T1_5.quedaIgual}`);
    assert.equal(caja.querySelector("[data-pregunta]").textContent, TORRES_T1_5.preguntaDireccion);
    assert.deepEqual([...caja.querySelectorAll("[data-totales]")].map((g) => g.dataset.totales).sort(), [...m.mueven].sort(),
      "la segunda decisión no va sobre las dos que se mueven");
    for (const p of m.mueven) elegirTotal(caja, p, m.despues[p]);
    tocar(boton(caja, TORRES_T1_5.anotar));
    assert.equal(caja.querySelector("[data-texto-retro]").textContent, sinEmoji(ERROR_T1_5.C));
  } finally { desmontar(); }
  /* Acertada, la pastilla dice «Correcto: se queda igual». */
  const dos = montar();
  try {
    tocar(dos.caja.querySelector(`[data-parte="${mov(0).quieta}"]`));
    assert.equal(dos.caja.querySelector(`[data-parte="${mov(0).quieta}"] [data-pastilla]`).textContent, `Correcto: ${TORRES_T1_5.quedaIgual}`);
  } finally { dos.desmontar(); }
});

test("★★ «Anotar» no se puede tocar sin las dos decisiones", () => {
  const { caja, desmontar } = montar();
  try {
    const anotar = () => boton(caja, TORRES_T1_5.anotar);
    assert.equal(anotar().disabled, true);
    const m = mov(0);
    tocar(caja.querySelector(`[data-parte="${m.quieta}"]`));
    assert.equal(anotar().disabled, true);
    elegirTotal(caja, m.mueven[0], m.despues[m.mueven[0]]);
    assert.equal(anotar().disabled, true, "se puede anotar con un solo total");
    elegirTotal(caja, m.mueven[1], m.despues[m.mueven[1]]);
    assert.equal(anotar().disabled, false);
  } finally { desmontar(); }
});

test("★★★ los ocho hechos en orden, un solo intento, y el registro guarda dos decisiones por hecho", () => {
  const { caja, desmontar } = montar();
  try {
    for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
      assert.equal(caja.querySelector("[data-hecho]").getAttribute("data-hecho"), TRANSACCIONES_CAP2[k].id);
      assert.equal(caja.querySelector("[data-contador]").textContent, `Hecho ${k + 1} de 8`);
      /* El hecho 3 con la quieta mal: no hay reintento, se sigue. */
      decidir(caja, k, { quieta: k !== 2 });
      tocar(boton(caja, TORRES_T1_5.anotar));
      assert.equal(boton(caja, TORRES_T1_5.anotar), undefined, "quedó un reintento");
      if (k === 7) assert.equal(caja.querySelector("[data-texto-retro]").textContent, sinEmoji(ACIERTO_T1_5_FINAL));
      tocar(boton(caja, k === 7 ? TORRES_T1_5.verResultado : TORRES_T1_5.siguiente));
    }
    assert.ok(caja.querySelector("[data-final]").textContent.includes(pesos(465000)));
    assert.ok(!/[✅❌]/u.test(caja.textContent), "se pintó un emoji");
  } finally { desmontar(); }
  assert.ok(completado, "no se llamó a onCompletar");
  assert.equal(completado.detalle.length, 16);
  assert.ok(completado.detalle.every((d) => d.intentos === 1));
  assert.deepEqual(completado.detalle.slice(4, 6).map((d) => [d.item, d.ok]), [["cal-3:quieta", false], ["cal-3:direccion", true]]);
  /* 7 hechos enteros y medio del tercero: 7,5 de 8. */
  assert.equal(completado.pct, (7.5 / 8) * 100);
  /* El panel docente lee los dos ítems como el hecho. */
  assert.equal(hechoDeItem("cal-3:quieta"), TRANSACCIONES_CAP2[2].texto);
  assert.equal(hechoDeItem("cal-3"), TRANSACCIONES_CAP2[2].texto);
});

test("★★ sin emoji al pintar, y los textos publicados no se tocan", () => {
  for (const t of Object.values(ERROR_T1_5)) {
    assert.ok(/^❌ /u.test(t), "el texto publicado cambió");
    assert.ok(!/[✅❌]/u.test(sinEmoji(t)));
  }
  assert.ok(ACIERTO_T1_5_FINAL.startsWith("✅ "));
  assert.equal(sinEmoji(ACIERTO_T1_5_FINAL), ACIERTO_T1_5_FINAL.slice(2));
});

test("★★★ la decisión 2 es el total nuevo: anterior más el monto, anterior menos el monto, o el monto solo", () => {
  /* Hecho 2: entra un computador a crédito por 25.000; el activo venía de 300.000. */
  const m = mov(1);
  assert.deepEqual(opcionesTotalT1_5(m, ACTIVO), [25000, 275000, 325000]);
  /* Total anterior en cero: el monto solo ES el total nuevo, así que van dos y no se repite ninguna. */
  assert.deepEqual(opcionesTotalT1_5(m, PASIVO), [-25000, 25000]);
  for (let k = 0; k < 8; k += 1) {
    const mk = mov(k);
    for (const p of mk.mueven) {
      const ops = opcionesTotalT1_5(mk, p);
      assert.ok(ops.includes(mk.despues[p]), `hecho ${k + 1}, ${p}: la correcta no está entre las opciones`);
      assert.equal(new Set(ops).size, ops.length);
      assert.deepEqual(ops, [...ops].sort((a, b) => a - b), "las opciones no van de menor a mayor");
    }
  }
  const { caja, desmontar } = montar();
  try {
    decidir(caja, 0);
    tocar(boton(caja, TORRES_T1_5.anotar));
    tocar(boton(caja, TORRES_T1_5.siguiente));
    tocar(caja.querySelector(`[data-parte="${m.quieta}"]`));
    assert.equal(caja.querySelector("[data-pregunta]").textContent, TORRES_T1_5.preguntaDireccion);
    /* El monto solo, en vez del total: «Iba aquí: $325.000». */
    elegirTotal(caja, ACTIVO, 25000);
    elegirTotal(caja, PASIVO, 25000);
    tocar(boton(caja, TORRES_T1_5.anotar));
    const iba = caja.querySelector(`[data-opcion-total="${ACTIVO}:325000"] [data-pastilla]`);
    assert.equal(iba.textContent, "Iba aquí: $325.000");
    assert.equal(caja.querySelector(`[data-opcion-total="${ACTIVO}:25000"] [data-pastilla]`).dataset.pastilla, "tachada");
  } finally { desmontar(); }
});

test("★★ la pregunta 1 lleva el «no» en negrilla, no en mayúsculas", () => {
  const { caja, desmontar } = montar();
  try {
    assert.ok(!/NO/.test(caja.querySelector("[data-pregunta]").textContent));
    assert.equal(caja.querySelector("[data-pregunta] [data-negrilla]").textContent, "no");
  } finally { desmontar(); }
});

test("★★★ el id, el fpBase y la forma del registro no cambian (decisión de Sakuta sobre el puntaje)", () => {
  assert.equal(T1_5.id, "t1-la-ecuacion-en-movimiento");
  assert.equal(T1_5.fpBase, 50);
  const { caja, desmontar } = montar();
  try {
    for (let k = 0; k < 8; k += 1) {
      decidir(caja, k);
      tocar(boton(caja, TORRES_T1_5.anotar));
      tocar(boton(caja, k === 7 ? TORRES_T1_5.verResultado : TORRES_T1_5.siguiente));
    }
  } finally { desmontar(); }
  /* onCompletar(pct, ms, detalle): la misma firma que llega a registrarActividadCompletada, y cada fila con las claves de siempre. */
  assert.equal(completado.pct, 100);
  for (const d of completado.detalle) {
    assert.deepEqual(Object.keys(d).sort(), ["intentos", "item", "ok", "orden", "respuesta"]);
    assert.equal(typeof d.item, "string");
  }
  assert.deepEqual(completado.detalle.map((d) => d.orden), completado.detalle.map((_, k) => k + 1));
});

/* ═══════════════════ EL VOCABULARIO Y EL CORAL ═══════════════════ */

test("★★★ nada del Tema 2 entra en el contenido", () => {
  const { caja, desmontar } = montar();
  try {
    const copia = caja.querySelector("[data-contenido]").cloneNode(true);
    for (const rot of copia.querySelectorAll("[data-rotulo-seccion]")) rot.remove();
    assert.ok(copia.querySelectorAll("*").length > 5);
    assert.ok(!copia.textContent.includes("▲"), "se coló el ▲");
    const TEAL = /#52C4B0|#2a9d8f|rgba?\(\s*82,\s*196,\s*176|rgba?\(\s*42,\s*157,\s*143/i;
    const AMBAR = /#E9C46A|rgba?\(\s*233,\s*196,\s*106/i;
    assert.ok(!TEAL.test(copia.innerHTML), "se coló el teal de «debe»");
    assert.ok(!AMBAR.test(copia.innerHTML), "se coló el ámbar de «haber»");
    assert.equal(copia.querySelectorAll("[data-arco], [data-balanza], [data-saldo], [data-ancla], [data-colector]").length, 0);
  } finally { desmontar(); }
});

test("★★ el coral solo sale cuando algo está mal", () => {
  const { caja, desmontar } = montar();
  try {
    const contenido = () => caja.querySelector("[data-contenido]").innerHTML;
    assert.ok(!CORAL.test(contenido()), "hay coral antes de que nadie se equivoque");
    decidir(caja, 0);
    tocar(boton(caja, TORRES_T1_5.anotar));
    assert.ok(!CORAL.test(contenido()), "un acierto se marca en coral");
    tocar(boton(caja, TORRES_T1_5.siguiente));
    decidir(caja, 1, { quieta: false });
    assert.ok(CORAL.test(contenido()), "tocar la parte que se mueve no se marca en coral");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

/*
 * Las dos puertas —el catálogo, que dibuja el camino, y el registro de la
 * vista, que dice qué componente pinta cada id— tienen que decir lo mismo. Lo
 * que solo está en el registro se abre por el hash y registra FP de una
 * clasificación que no existe; lo que solo está en el catálogo sale en el
 * camino y no abre nada.
 *
 * Esta prueba vigilaba que T1-5 estuviera fuera de las dos mientras faltaban
 * las piezas del Aprender. Ahora vigila que esté en las dos.
 */
test("★★★ T1-5 está en las dos puertas, con la misma clasificación", async () => {
  const { SUBJECTS } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  const enCatalogo = tema.actividades.find((a) => a.id === T1_5.id);
  assert.ok(enCatalogo, "T1-5 no está en el catálogo");
  assert.equal(enCatalogo.clasificacion.dificultad, T1_5.dificultad);
  assert.equal(enCatalogo.clasificacion.fpBase, T1_5.fpBase);
  assert.ok(JUEGOS.some((j) => j.id === T1_5.id), "T1-5 sale en el camino y no la abre nadie");
});

test("difícil, 50 FP y los ocho hechos", () => {
  assert.equal(T1_5.dificultad, "dificil");
  assert.equal(T1_5.fpBase, 50);
  assert.equal(T1_5.porPartida, TRANSACCIONES_CAP2.length);
});
