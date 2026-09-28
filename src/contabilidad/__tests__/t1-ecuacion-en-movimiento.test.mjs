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
} = await import("../tema1.js");
const {
  TRANSACCIONES_CAP2, T1_5, PARTES, ERROR_T1_5, DESDE_EL_CORTO, PIE_T1_5, HISTORIAL_T1_5,
} = await import("../../data/contabilidadTema1.js");
const { ACTIVO, PASIVO, PATRIMONIO, pesos } = await import("../../data/contabilidad.js");
const { FAE } = await import("../../theme.js");

const montar = () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(LaEcuacionEnMovimiento, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const escribir = (caja, parte, valor) => {
  const campo = caja.querySelector(`[data-casilla="${parte}"] input`);
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
    setter.call(campo, String(valor));
    campo.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(texto));

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

/* Escribe los tres totales; en modo corto, solo los que tienen casilla. */
const anotar = (caja, valores) => {
  for (const p of PARTES) {
    if (caja.querySelector(`[data-casilla="${p.id}"] input`)) escribir(caja, p.id, valores[p.id]);
  }
};

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

test("★★★ en modo corto no se puede escribir la parte quieta, y se arrastra sola", () => {
  const { caja, desmontar } = montar();
  try {
    /* Los cuatro primeros: las tres casillas se escriben. */
    for (let k = 0; k < 4; k += 1) {
      assert.equal(caja.querySelectorAll("[data-casilla] input").length, 3, `hecho ${k + 1}: no hay tres casillas`);
      assert.equal(caja.querySelectorAll("[data-arrastrado]").length, 0, `hecho ${k + 1}: algo se arrastró antes de tiempo`);
      anotar(caja, totalesTras(k + 1));
      tocar(boton(caja, "Anotar"));
      tocar(boton(caja, "Siguiente hecho"));
    }
    /* Del quinto en adelante, la quieta se arrastra. */
    const quieta = parteQuieta(4);
    assert.equal(caja.querySelectorAll("[data-casilla] input").length, 2, "el quinto no entró en modo corto");
    const arrastrada = caja.querySelector(`[data-arrastrado="${quieta}"]`);
    assert.ok(arrastrada, "la parte quieta no se arrastra");
    assert.ok(arrastrada.textContent.includes(pesos(totalesTras(4)[quieta])),
      "la arrastrada no enseña el total que venía de antes");
    contiene(arrastrada.textContent, PIE_T1_5.arrastrado,
      "la arrastrada no dice por qué está ahí: se lee como un dato del enunciado");
  } finally { desmontar(); }
});

/* ═══════════════════ EL PIE Y EL HISTORIAL ═══════════════════ */

test("★★★ el pie comprueba mientras se escribe, sin esperar a enviar", () => {
  const { caja, desmontar } = montar();
  try {
    const pie = () => caja.querySelector("[data-pie]");
    assert.equal(pie().getAttribute("data-cuadra"), "incompleto", "el pie opina sin tener las tres cifras");

    const real = totalesTras(1);
    anotar(caja, { ...real, [PASIVO]: real[PASIVO] + 4000 });
    assert.equal(pie().getAttribute("data-cuadra"), "no", "el pie no avisa de que no cuadra");
    contiene(caja.querySelector("[data-veredicto]").textContent, PIE_T1_5.noCuadra, "el veredicto");
    /*
     * Y el aviso va en coral EN EL PIE, no en cualquier parte de la pantalla:
     * un mutante que quitaba el borde del pie sobrevivía porque quedaba coral
     * en otro sitio.
     */
    assert.ok(CORAL.test(pie().getAttribute("style") ?? ""), "el pie no se marca en coral al no cuadrar");
    /* Y no hace falta haber enviado nada. */
    assert.equal(caja.querySelectorAll("[data-era]").length, 0, "se reveló algo sin enviar");

    anotar(caja, real);
    assert.equal(pie().getAttribute("data-cuadra"), "si", "el pie no reconoce que cuadra");
    contiene(caja.querySelector("[data-veredicto]").textContent, PIE_T1_5.cuadra, "el veredicto");
    assert.ok(!CORAL.test(pie().getAttribute("style") ?? ""), "el pie sigue en coral aunque cuadre");
  } finally { desmontar(); }
});

test("★★★ el historial va abierto desde el primer hecho anotado", () => {
  const { caja, desmontar } = montar();
  try {
    const hist = () => caja.querySelector("[data-historial]");
    assert.ok(hist(), "no hay historial");
    /*
     * Abierto quiere decir que NO está detrás de un botón ni dentro de un
     * details plegado. Lo de atrás es el dato con el que se calcula lo de
     * adelante.
     */
    assert.equal(hist().tagName, "DIV", "el historial se volvió plegable");
    assert.equal(hist().hidden, false);
    contiene(hist().textContent, HISTORIAL_T1_5.vacio, "el historial vacío");

    /*
     * Se avanzan DOS hechos, no uno. Tras el primero los tres totales son
     * 300.000, 0 y 300.000: comprobar que la fila «desglosa los dos lados»
     * contra esas cifras no comprueba nada, porque el activo y el patrimonio
     * son el mismo número. Sobrevivió un mutante que borraba el desglose.
     * Tras el segundo son 325.000, 25.000 y 300.000: tres cifras distintas.
     */
    for (let k = 0; k < 2; k += 1) {
      anotar(caja, totalesTras(k + 1));
      tocar(boton(caja, "Anotar"));
      tocar(boton(caja, "Siguiente hecho"));
    }

    const fila = caja.querySelector(`[data-fila-historial="${TRANSACCIONES_CAP2[1].id}"]`);
    assert.ok(fila, "el hecho anotado no entró al historial");
    const t = totalesTras(2);
    assert.equal(new Set([t[ACTIVO], t[PASIVO], t[PATRIMONIO]]).size, 3,
      "las tres cifras de este paso ya no son distintas: la prueba dejó de comprobar el desglose");
    for (const p of PARTES) {
      assert.ok(fila.textContent.includes(pesos(t[p.id])),
        `la fila no trae ${p.idea}: el historial dejó de desglosar los dos lados`);
    }
  } finally { desmontar(); }
});

test("★★ los ocho hechos van en orden, y son los ocho", () => {
  const { caja, desmontar } = montar();
  try {
    for (let k = 0; k < TRANSACCIONES_CAP2.length; k += 1) {
      assert.equal(caja.querySelector("[data-hecho]").getAttribute("data-hecho"), TRANSACCIONES_CAP2[k].id,
        `la posición ${k + 1} no trae el hecho ${k + 1}`);
      anotar(caja, totalesTras(k + 1));
      tocar(boton(caja, "Anotar"));
      tocar(boton(caja, k + 1 === TRANSACCIONES_CAP2.length ? "Ver el resultado" : "Siguiente hecho"));
    }
    assert.ok(caja.querySelector("[data-final]"), "no se llega al cierre");
    assert.ok(caja.querySelector("[data-final]").textContent.includes(pesos(465000)),
      "el cierre no enseña los 465.000");
  } finally { desmontar(); }
});

test("★★ no se puede anotar con una casilla vacía", () => {
  const { caja, desmontar } = montar();
  try {
    assert.equal(boton(caja, "Escribe los totales").disabled, true);
    escribir(caja, ACTIVO, 300000);
    assert.equal(boton(caja, "Escribe los totales").disabled, true, "se puede anotar con una sola cifra");
    escribir(caja, PASIVO, 0);
    escribir(caja, PATRIMONIO, 300000);
    assert.equal(boton(caja, "Anotar").disabled, false);
  } finally { desmontar(); }
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
    const real = totalesTras(1);
    anotar(caja, { ...real, [PASIVO]: real[PASIVO] + 4000 });
    assert.ok(CORAL.test(contenido()), "no cuadrar no se marca en coral");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

test("★★★ T1-5 NO está publicada, ni por el catálogo ni por el registro de la vista", async () => {
  const { SUBJECTS } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");
  assert.ok(!tema.actividades.some((a) => a.id === T1_5.id), "T1-5 entró al catálogo");
  assert.ok(!JUEGOS.some((j) => j.id === T1_5.id), "T1-5 se abre escribiendo el hash");
});

test("difícil, 50 FP y los ocho hechos", () => {
  assert.equal(T1_5.dificultad, "dificil");
  assert.equal(T1_5.fpBase, 50);
  assert.equal(T1_5.porPartida, TRANSACCIONES_CAP2.length);
});
