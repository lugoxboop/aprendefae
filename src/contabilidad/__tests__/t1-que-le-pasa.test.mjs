import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-4 · ¿QUÉ LE PASA A CADA UNO?
 *
 * Tres cosas se rompen aquí sin hacer ruido.
 *
 * La primera son LAS OCHO TRANSACCIONES. El repo tiene seis de Caleja y el
 * capítulo 2 tiene ocho. Las dos listas conviven a propósito: las seis cierran
 * en 415.000 y las ocho en 465.000, y cuatro actividades del Tema 2 están
 * calibradas a la primera cifra. Las ocho se arman extendiendo las seis, y
 * aquí se comprueba que siguen siendo un prefijo y que la ecuación cierra.
 *
 * La segunda es EL EFECTO. Sale de la partida doble, no de una tabla escrita a
 * mano. Si alguien la transcribiera, tocar un asiento dejaría las dos verdades
 * diciendo cosas distintas sin que nada fallara.
 *
 * La tercera es LA PRIORIDAD A > B. Quien marca «uno sube y el otro baja» cree
 * que la ecuación es un balancín, y esa creencia se le corrige aunque además
 * haya movido la parte quieta.
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

const QueLePasaACadaUno = (await import("../../components/mecanicas/libros/tema1/QueLePasaACadaUno.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  efectoDe, casoDe, CASOS_T1_4, sortearT1_4, evaluarT1_4,
} = await import("../tema1.js");
const {
  TRANSACCIONES_CAP2, T1_4, PARTES, CONTROLES, SUBE, BAJA, IGUAL,
  ERROR_A_T1_4, ERROR_B_T1_4, ACIERTO_T1_4,
} = await import("../../data/contabilidadTema1.js");
const { CALEJA, ACTIVO, PASIVO, PATRIMONIO } = await import("../../data/contabilidad.js");
const { APRENDER } = await import("../../data/subjects.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const montar = () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(QueLePasaACadaUno, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const hechoEnPantalla = (caja) => caja.querySelector("[data-hecho]").getAttribute("data-hecho");
const marcar = (caja, parte, control) => tocar(caja.querySelector(`[data-control="${parte}-${control}"]`));
/* Un solo «Anotar» para las dos decisiones (lote 4, Shoko): si no se eligió caso, se elige el primero. */
const anotar = (caja) => {
  if (!caja.querySelector('[data-caso][aria-pressed="true"]')) tocar(caja.querySelector("[data-caso]"));
  tocar([...caja.querySelectorAll("button")].find((b) => b.textContent === "Anotar"));
};

/* ═══════════════════ LAS OCHO TRANSACCIONES ═══════════════════ */

test("★★★ las seis del Tema 2 siguen siendo un prefijo de las ocho, y no se tocan", () => {
  assert.equal(CALEJA.transacciones.length, 6, "la lista del Tema 2 cambió de tamaño");
  assert.equal(TRANSACCIONES_CAP2.length, 8);
  for (const [i, t] of CALEJA.transacciones.entries()) {
    assert.equal(TRANSACCIONES_CAP2[i], t, `la transacción ${i + 1} dejó de ser la misma`);
  }
  assert.equal(new Set(TRANSACCIONES_CAP2.map((t) => t.id)).size, 8, "hay dos transacciones con el mismo id");
});

/*
 * ═══════════ LAS DOS CIFRAS DEL CASO, CADA UNA EN SU SITIO ═══════════
 *
 * 415.000 tras la sexta —la foto de A2 y del capítulo 3— y 465.000 tras la
 * octava, que es donde cierra el capítulo 2. Las dos se calculan sumando los
 * asientos, no se escriben: si alguien retoca una cifra, esto falla.
 */
test("★★★ la ecuación cierra en cada paso, y las dos fotos dan 415.000 y 465.000", () => {
  const acum = { [ACTIVO]: 0, [PASIVO]: 0, [PATRIMONIO]: 0 };
  const foto = [];
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    for (const k of Object.keys(acum)) acum[k] += e.valores[k];
    assert.equal(acum[ACTIVO], acum[PASIVO] + acum[PATRIMONIO], `${t.id}: la ecuación dejó de cuadrar`);
    foto.push(acum[ACTIVO]);
  }
  assert.equal(foto[5], 415000, "tras la sexta ya no da lo que dice el balance de A2");
  assert.equal(foto[7], 465000, "tras la octava ya no da lo que cierra el capítulo 2");
});

test("★★ cada hecho mueve exactamente dos partes y deja una quieta", () => {
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    const quietas = PARTES.filter((p) => e[p.id] === IGUAL);
    assert.equal(quietas.length, 1, `${t.id}: se quedan quietas ${quietas.length} partes, no una`);
  }
});

test("★★ el efecto se deduce del asiento: una cuenta que no sea de las tres se cae", () => {
  assert.throws(() => efectoDe({ asiento: { debe: [["Gastos por salarios", 10]], haber: [["Caja", 10]] } }),
    /no es activo, pasivo ni patrimonio/);
});

/* ═══════════════════ LOS CUATRO CASOS ═══════════════════ */

test("★★ los cuatro casos del libro están, y cada hecho cae en el suyo", () => {
  assert.equal(CASOS_T1_4.length, 4, `hay ${CASOS_T1_4.length} casos, no cuatro`);
  const porCaso = {};
  for (const t of TRANSACCIONES_CAP2) (porCaso[casoDe(t)] ??= []).push(t.id);
  /*
   * Los grupos no van escritos a mano: se comprueba la REGLA que los define.
   * Si se mueve el pasivo es una deuda; si no, un aporte. Y el sentido lo
   * marca el activo.
   */
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    const [tipo, sentido] = casoDe(t).split("-");
    assert.equal(tipo, e[PASIVO] !== IGUAL ? "deuda" : "aporte", `${t.id}: el tipo no sale del asiento`);
    assert.equal(sentido, e[ACTIVO], `${t.id}: el sentido no sale del activo`);
    /* Y una deuda no mueve el patrimonio, ni un aporte el pasivo. */
    if (tipo === "deuda") assert.equal(e[PATRIMONIO], IGUAL, `${t.id}: una deuda movió el patrimonio`);
    else assert.equal(e[PASIVO], IGUAL, `${t.id}: un aporte movió el pasivo`);
  }
  /* Y las cuatro explicaciones A existen, una por caso. */
  for (const c of CASOS_T1_4) {
    assert.ok(ERROR_A_T1_4[c], `falta la explicación A del caso «${c}»`);
  }
  assert.equal(Object.keys(ERROR_A_T1_4).length, 4, "sobra o falta una explicación A");
  assert.equal(new Set(Object.values(ERROR_A_T1_4)).size, 4, "dos casos comparten explicación");
});

/*
 * ═══════════ LA EXPLICACIÓN A CUENTA LO QUE PASÓ DE VERDAD ═══════════
 *
 * Es la parte fácil de romper: las cuatro variantes empiezan igual y solo se
 * distinguen por el final. Esto comprueba que la del caso que sube habla de
 * subir y la del que baja, de bajar; y que la de aporte niega la deuda.
 */
test("★★ cada variante de la A dice el sentido y el tipo de su caso", () => {
  for (const [caso, texto] of Object.entries(ERROR_A_T1_4)) {
    const [tipo, sentido] = caso.split("-");
    const enMinusculas = texto.toLowerCase();
    assert.ok(enMinusculas.includes(sentido === SUBE ? "subir juntos" : "bajar juntos"),
      `${caso}: el texto no dice hacia dónde van los dos`);
    assert.ok(enMinusculas.includes("deuda"), `${caso}: el texto no menciona la deuda`);
    /* La de aporte la niega; la de deuda la afirma. */
    assert.equal(enMinusculas.includes("no hay ninguna deuda"), tipo === "aporte",
      `${caso}: la deuda se afirma o se niega al revés`);
  }
});

/* ═══════════════════ EL SORTEO ═══════════════════ */

test("★★ seis de ocho, y los cuatro casos entran siempre", () => {
  for (let i = 0; i < 300; i += 1) {
    const tanda = sortearT1_4(barajar);
    assert.equal(tanda.length, 6);
    assert.equal(new Set(tanda.map((t) => t.id)).size, 6, "una transacción salió dos veces");
    const casos = new Set(tanda.map(casoDe));
    assert.equal(casos.size, 4, `faltó un caso: salieron ${[...casos].join(", ")}`);
  }
});

test("★★ y las dos libres de verdad varían: no sale siempre la misma tanda", () => {
  const vistas = new Set();
  for (let i = 0; i < 300; i += 1) {
    vistas.add(sortearT1_4(barajar).map((t) => t.id).sort().join("|"));
  }
  assert.ok(vistas.size > 1, "el sorteo devuelve siempre las mismas seis");
});

/*
 * ═══════════ Y EL ORDEN TAMBIÉN SE BARAJA ═══════════
 *
 * Estratificar sin barajar después deja las cuatro elegidas siempre delante y
 * siempre en el mismo orden de casos: primero el aporte que sube, después la
 * deuda que sube, y así. El conjunto de seis varía —por eso la prueba de
 * arriba pasaba igual—, pero el estudiante que juega dos tandas ve la misma
 * secuencia de casos y aprende el orden en vez del criterio.
 */
test("★★ el orden de los casos también varía de una tanda a otra", () => {
  const ordenes = new Set();
  for (let i = 0; i < 300; i += 1) {
    ordenes.add(sortearT1_4(barajar).map(casoDe).join(">"));
  }
  assert.ok(ordenes.size > 4,
    `solo salen ${ordenes.size} secuencias de casos distintas: el sorteo no baraja el orden`);
});

/* ═══════════════════ LA PRIORIDAD A > B ═══════════════════ */

/* Marca las dos que se mueven en sentidos contrarios, y la quieta como toque. */
const balancin = (t, quietaTambien) => {
  const e = efectoDe(t);
  const mueven = PARTES.filter((p) => e[p.id] !== IGUAL).map((p) => p.id);
  const quieta = PARTES.find((p) => e[p.id] === IGUAL).id;
  return {
    [mueven[0]]: SUBE, [mueven[1]]: BAJA,
    [quieta]: quietaTambien ? SUBE : IGUAL,
  };
};

test("★★★ el balancín gana a la parte quieta: A antes que B", () => {
  for (const t of TRANSACCIONES_CAP2) {
    /* Solo el balancín. */
    const soloA = evaluarT1_4(t, balancin(t, false));
    assert.equal(soloA.patron, "A", `${t.id}: el balancín no dio A`);
    assert.equal(soloA.texto, ERROR_A_T1_4[casoDe(t)], `${t.id}: dio la A de otro caso`);

    /*
     * Balancín Y además la quieta movida: los dos errores a la vez. Tiene que
     * salir la A igual. Si saliera la B, se le corregiría lo accesorio y se le
     * dejaría intacta la creencia de que la ecuación es un balancín.
     */
    const losDos = evaluarT1_4(t, balancin(t, true));
    assert.equal(losDos.patron, "A", `${t.id}: con los dos errores ganó la B`);
    assert.equal(losDos.texto, ERROR_A_T1_4[casoDe(t)], `${t.id}: con los dos errores dio otro texto`);
  }
});

test("★★ mover solo la parte quieta da B, y señala esa parte", () => {
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    const quieta = PARTES.find((p) => e[p.id] === IGUAL).id;
    const marcado = Object.fromEntries(PARTES.map((p) => [p.id, e[p.id]]));
    marcado[quieta] = SUBE;
    const r = evaluarT1_4(t, marcado);
    assert.equal(r.patron, "B", `${t.id}: mover la quieta no dio B`);
    assert.equal(r.texto, ERROR_B_T1_4);
    assert.deepEqual(r.resaltar, [quieta], `${t.id}: la B no señala la parte quieta`);
  }
});

test("★★ acertar las tres es acertar, y trae la devolución de ese hecho", () => {
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    const r = evaluarT1_4(t, Object.fromEntries(PARTES.map((p) => [p.id, e[p.id]])));
    assert.equal(r.ok, true, `${t.id}: marcar lo correcto no acierta`);
    assert.equal(r.texto, ACIERTO_T1_4[t.id]);
    assert.ok(r.texto.startsWith("✅"));
  }
  assert.equal(new Set(Object.values(ACIERTO_T1_4)).size, 8, "dos hechos comparten devolución");
});

/*
 * El acierto dice hacia dónde se movieron las dos, y tiene que coincidir con
 * lo que las barras hacen. Un texto que diga «suben los dos» sobre un hecho
 * donde bajan es justo la clase de desajuste que no rompe nada.
 */
test("★★★ el texto del acierto dice el mismo sentido que el asiento", () => {
  for (const t of TRANSACCIONES_CAP2) {
    const e = efectoDe(t);
    const sentido = e[ACTIVO];
    const texto = ACIERTO_T1_4[t.id].toLowerCase();
    const diceSube = texto.includes("sube") || texto.includes("suben");
    const diceBaja = texto.includes("baja") || texto.includes("bajan");
    assert.equal(diceSube, sentido === SUBE, `${t.id}: el texto dice subir y el asiento dice ${sentido}`);
    assert.equal(diceBaja, sentido === BAJA, `${t.id}: el texto dice bajar y el asiento dice ${sentido}`);
  }
});

/*
 * ═══════════ Y DICE EL MISMO TIPO ═══════════
 *
 * Un hecho de deuda habla de una deuda o de un préstamo; uno de aporte, de los
 * socios o los dueños. Cruzarlos es la clase de cosa que no rompe nada: la
 * ecuación sigue cuadrando, las barras siguen moviéndose bien, y el texto le
 * cuenta al estudiante una historia que el asiento no dice.
 *
 * Salió de un mutante que sobrevivió: cambié la séptima para que moviera el
 * patrimonio en vez del pasivo y todo siguió pasando, con su devolución
 * hablando de un proveedor al que ya no se le debía nada.
 */
test("★★★ el texto del acierto habla de deuda o de socios según lo que mueva el asiento", () => {
  const DEUDA = /deuda|préstamo/;
  const SOCIOS = /socios|dueños/;
  for (const t of TRANSACCIONES_CAP2) {
    const esDeuda = casoDe(t).startsWith("deuda");
    const texto = ACIERTO_T1_4[t.id].toLowerCase();
    assert.equal(DEUDA.test(texto), esDeuda,
      `${t.id}: el caso es «${casoDe(t)}» y el texto ${DEUDA.test(texto) ? "habla" : "no habla"} de deuda`);
    assert.equal(SOCIOS.test(texto), !esDeuda,
      `${t.id}: el caso es «${casoDe(t)}» y el texto ${SOCIOS.test(texto) ? "habla" : "no habla"} de los socios`);
  }
});

test("★★ si a un hecho le falta su devolución, evaluar se cae", () => {
  const inventado = {
    id: "no-existe",
    asiento: { debe: [["Caja", 10]], haber: [["Aportes sociales", 10]] },
  };
  assert.throws(() => evaluarT1_4(inventado, { activo: SUBE, pasivo: IGUAL, patrimonio: SUBE }),
    /no tiene devolución/);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★ las tres partes salen con su idea y con su término del libro", () => {
  const { caja, desmontar } = montar();
  try {
    for (const p of PARTES) {
      /* Lote 4: cada parte es una columna (barra, rótulo y controles). */
      const fila = caja.querySelector(`[data-parte="${p.id}"]`);
      assert.ok(fila, `falta la fila de ${p.id}`);
      assert.ok(fila.textContent.includes(p.idea), `${p.id}: falta la idea simple`);
      assert.ok(fila.textContent.includes(p.termino), `${p.id}: falta el término del libro`);
      /*
       * El término va como rótulo aparte, NUNCA metido dentro de la frase de
       * la idea. Se comprueba que son dos nodos distintos.
       */
      assert.ok(p.termino.length > 0, `${p.id}: el término del libro se quedó vacío`);
      assert.ok(p.idea.length > 0, `${p.id}: la idea simple se quedó vacía`);
      /*
       * Y la idea NO contiene el término. Meterlo entre paréntesis dentro de la
       * frase —«Lo que debe (Pasivo)»— deja el texto igual de completo en
       * pantalla y rompe la regla: el término tiene que ser un rótulo aparte,
       * más pequeño, no una coletilla de la idea. Sobrevivió un mutante que
       * hacía exactamente eso.
       */
      assert.ok(!p.idea.includes(p.termino),
        `${p.id}: el término «${p.termino}» está metido dentro de la idea «${p.idea}»`);
      const rotulo = fila.querySelector(`[data-termino="${p.termino}"]`);
      assert.ok(rotulo, `${p.id}: el término no es un rótulo propio`);
      assert.equal(rotulo.textContent, p.termino, `${p.id}: el rótulo trae algo más que el término`);
    }
  } finally { desmontar(); }
});

test("★★ no se puede anotar hasta marcar las tres y elegir el caso (un solo «Anotar», Shoko)", () => {
  const { caja, desmontar } = montar();
  try {
    const boton = () => [...caja.querySelectorAll("button")].find((b) => /^Marca las tres|^Anotar$/.test(b.textContent));
    assert.equal(boton().disabled, true, "se puede anotar sin marcar nada");
    marcar(caja, PARTES[0].id, SUBE);
    marcar(caja, PARTES[1].id, SUBE);
    marcar(caja, PARTES[2].id, IGUAL);
    assert.equal(boton().disabled, true, "se puede anotar sin elegir el caso");
    tocar(caja.querySelector("[data-caso]"));
    assert.equal(boton().disabled, false, "con las tres y el caso sigue sin poder anotarse");
    assert.equal(boton().textContent, "Anotar");
  } finally { desmontar(); }
});

/*
 * ═══════════ LA BARRA QUIETA NO SE MUEVE, PERO HACE ALGO ═══════════
 *
 * «Queda igual» es una respuesta, no la ausencia de una. Si la barra quieta no
 * hiciera nada al revelar, no habría forma de distinguirla de una que todavía
 * no ha contestado. Late, y NO cambia de alto.
 */
test("★★★ al revelar, la barra que no se mueve conserva su alto y late", () => {
  const { caja, desmontar } = montar();
  try {
    const t = TRANSACCIONES_CAP2.find((x) => x.id === hechoEnPantalla(caja));
    const e = efectoDe(t);
    const quieta = PARTES.find((p) => e[p.id] === IGUAL).id;
    const altoAntes = caja.querySelector(`[data-barra="${quieta}"]`).getAttribute("data-alto");

    for (const p of PARTES) marcar(caja, p.id, e[p.id]);
    anotar(caja);

    const barra = caja.querySelector(`[data-barra="${quieta}"]`);
    assert.equal(barra.getAttribute("data-alto"), altoAntes, "la barra quieta cambió de alto");
    /* Un solo pulso de opacidad (C5: nada en bucle). */
    assert.ok(barra.className.includes("fae-t14-pulso"), "la barra quieta no da su pulso: no se distingue de una sin responder");

    /* Y las otras dos sí se movieron. */
    for (const p of PARTES.filter((x) => x.id !== quieta)) {
      const otra = caja.querySelector(`[data-barra="${p.id}"]`);
      assert.notEqual(otra.getAttribute("data-alto"), altoAntes, `${p.id}: la barra no se movió`);
      assert.equal(caja.querySelector(`[data-parte="${p.id}"]`).getAttribute("data-revelado"), e[p.id]);
    }
  } finally { desmontar(); }
});

test("★★★ un intento: al fallar, las barras van a lo correcto y la mal movida deja su fantasma", () => {
  const { caja, desmontar } = montar();
  try {
    const t = TRANSACCIONES_CAP2.find((x) => x.id === hechoEnPantalla(caja));
    const e = efectoDe(t);
    const marcado = balancin(t, false);
    for (const p of PARTES) marcar(caja, p.id, marcado[p.id]);
    anotar(caja);

    for (const p of PARTES) {
      assert.equal(caja.querySelector(`[data-parte="${p.id}"]`).dataset.revelado, e[p.id], `${p.id}: la barra no fue a lo correcto`);
      const fantasma = caja.querySelector(`[data-fantasma="${p.id}"]`);
      const difiere = marcado[p.id] !== e[p.id];
      assert.equal(Boolean(fantasma), difiere, `${p.id}: el fantasma ${difiere ? "falta" : "sobra"}`);
      /* C2 por fila: lo que pasó en acierto; lo marcado mal, fantasma. */
      assert.equal(caja.querySelector(`[data-control="${p.id}-${e[p.id]}"]`).dataset.estado, "acierto");
      if (difiere) assert.equal(caja.querySelector(`[data-control="${p.id}-${marcado[p.id]}"]`).dataset.estado, "fantasma");
    }
    assert.ok([...caja.querySelectorAll("[data-control]")].every((b) => b.disabled), "hay reintento");
    assert.equal(caja.querySelector("[data-fallo]"), null);
    assert.ok(!caja.querySelector("[data-devolucion]").textContent.includes("❌"));
  } finally { desmontar(); }
});

test("★★★ la decisión 2: los cuatro casos de la p. 35, con las barras quietas hasta «Anotar», y el caso pegado a las barras", () => {
  for (const acertar of [true, false]) {
    const { caja, desmontar } = montar();
    try {
      const t = TRANSACCIONES_CAP2.find((x) => x.id === hechoEnPantalla(caja));
      const e = efectoDe(t);
      const casos = () => [...caja.querySelectorAll("[data-caso]")];
      assert.deepEqual(casos().map((b) => b.querySelector("span").textContent), [
        "Aumento en activo y en pasivo", "Aumento en activo y en patrimonio",
        "Disminución en activo y en pasivo", "Disminución en activo y en patrimonio",
      ]);
      /* Se elige antes de anotar, con las barras quietas: si se movieran antes, el caso se leería en la pantalla. */
      assert.ok(casos().every((b) => !b.disabled), "la decisión 2 no se puede tomar antes de anotar");
      for (const p of PARTES) marcar(caja, p.id, e[p.id]);
      const bueno = casoDe(t);
      const elegido = acertar ? bueno : casos().map((b) => b.dataset.caso).find((x) => x !== bueno);
      tocar(caja.querySelector(`[data-caso="${elegido}"]`));
      assert.equal(caja.querySelectorAll("[data-parte][data-revelado]").length, 0, "las barras se movieron antes de anotar");
      assert.equal(caja.querySelector("[data-renglon-caso]").textContent, "", "el caso se veredicta antes de anotar");
      anotar(caja);
      assert.equal(caja.querySelectorAll("[data-parte][data-revelado]").length, 3, "las barras no se movieron al anotar");
      const renglon = caja.querySelector("[data-renglon-caso]");
      assert.equal(renglon.querySelector("[data-caso-elegido]").dataset.casoElegido, elegido);
      assert.equal(caja.querySelector(`[data-caso="${bueno}"]`).dataset.estado, "acierto");
      const nombre = caja.querySelector(`[data-caso="${bueno}"] span`).textContent;
      /* El renglón resume el resultado de las barras sin nombrar el caso (Shoko, #535 b). */
      assert.equal(renglon.textContent, "Correcto: así quedan las tres partes");
      assert.ok(!renglon.textContent.includes(nombre), "el renglón nombra el caso: la decisión 2 queda regalada");
      if (!acertar) assert.equal(caja.querySelector(`[data-caso="${elegido}"]`).dataset.estado, "fantasma");
      assert.ok(casos().every((b) => b.disabled), "la decisión 2 tiene reintento");
      assert.ok([...caja.querySelectorAll("button")].some((b) => /Siguiente hecho|Ver el resultado/.test(b.textContent)));
    } finally { desmontar(); }
  }
});

/* ═══════════════════ EL VOCABULARIO PROHIBIDO ═══════════════════ */

const TEAL_O_AMBAR = /#2a9d8f|#e9c46a|rgba?\(\s*42,\s*157,\s*143|rgba?\(\s*233,\s*196,\s*106/i;

test("★★★ nada del Tema 2 entra en el contenido de la actividad", () => {
  const { caja, desmontar } = montar();
  try {
    const contenido = caja.querySelector("[data-contenido]");
    assert.ok(contenido, "falta la caja de contenido");
    /*
     * Los rótulos de sección son interfaz de marca —van en el acento de la
     * materia, como los encabezados del resto del sitio—, así que se apartan
     * antes de mirar. Es la misma regla que en T1-1 y T1-2.
     */
    const copia = contenido.cloneNode(true);
    assert.ok(copia.querySelectorAll("*").length > 5, "no queda nada que mirar");
    assert.ok(!copia.textContent.includes("▲"), "se coló el ▲, que aquí no significa nada todavía");
    assert.ok(!TEAL_O_AMBAR.test(copia.innerHTML),
      "entró teal o ámbar en el contenido: aquí no significan debe y haber todavía");
    assert.equal(copia.querySelectorAll("[data-arco], [data-balanza], [data-saldo], [data-ancla], [data-colector]").length, 0,
      "entró una pieza del vocabulario del Tema 2");
    /* Y el signo de subir es la flecha, no el triángulo. */
    assert.equal(CONTROLES.find((c) => c.id === SUBE).signo, "↑");
    assert.ok(!CONTROLES.some((c) => c.signo === "▲"), "un control usa el triángulo");
  } finally { desmontar(); }
});

test("★★ el coral solo aparece cuando hay error", () => {
  const { caja, desmontar } = montar();
  try {
    const CORAL = /#e76f51|rgba?\(\s*231,\s*111,\s*81/i;
    assert.ok(!CORAL.test(caja.querySelector("[data-contenido]").innerHTML),
      "hay coral en pantalla sin que nadie se haya equivocado");
    const t = TRANSACCIONES_CAP2.find((x) => x.id === hechoEnPantalla(caja));
    for (const p of PARTES) marcar(caja, p.id, balancin(t, false)[p.id]);
    anotar(caja);
    assert.ok(CORAL.test(caja.querySelector("[data-contenido]").innerHTML), "el error no se marca en coral");
  } finally { desmontar(); }
});

/* ═══════════════════ EL CATÁLOGO ═══════════════════ */

/*
 * ═══════════ LAS DOS PUERTAS TIENEN QUE DECIR LO MISMO ═══════════
 *
 * Una actividad se abre por dos sitios: el catálogo, que dibuja el camino, y
 * el registro de la vista, que dice qué componente pinta cada id. Lo que está
 * en el registro y no en el catálogo se puede abrir escribiendo el hash, y al
 * terminarla llama a registrar FP con una clasificación que no existe. Lo que
 * está en el catálogo y no en el registro sale en el camino y no abre nada.
 *
 * Esta prueba vigiló durante cuatro commits que T1-4 estuviera fuera de las
 * dos; ahora vigila que esté en las dos. La regla no cambió: las dos listas
 * dicen lo mismo.
 */
test("★★★ T1-4 está en el catálogo y en el registro de la vista, con la misma clasificación", async () => {
  const { SUBJECTS } = await import("../../data/subjects.js");
  const { JUEGOS } = await import("../../components/IntroContabilidadView.jsx");
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === "introduccion-contabilidad");

  const enCatalogo = tema.actividades.find((a) => a.id === T1_4.id);
  assert.ok(enCatalogo, "T1-4 no está en el catálogo");
  assert.equal(enCatalogo.clasificacion.dificultad, T1_4.dificultad, "la dificultad del catálogo no es la del banco");
  assert.equal(enCatalogo.clasificacion.fpBase, T1_4.fpBase, "los FP del catálogo no son los del banco");
  assert.ok(JUEGOS.some((j) => j.id === T1_4.id), "T1-4 sale en el camino y no la abre nadie");

  /* Y en general: ninguna de las dos listas tiene nada que la otra no tenga. */
  const deHacer = tema.actividades.filter((a) => a.clasificacion.tipo !== APRENDER).map((a) => a.id);
  assert.deepEqual([...JUEGOS.map((j) => j.id)].sort(), [...deHacer].sort(),
    "el catálogo y el registro de la vista dejaron de decir lo mismo");
});

test("dificultad media y 25 FP, seis hechos por partida", () => {
  assert.equal(T1_4.dificultad, "medio");
  assert.equal(T1_4.fpBase, 25);
  assert.equal(T1_4.porPartida, 6);
});

test("★★ al anotar con las barras fuera de la pantalla: sube a ellas y se mueven al llegar (como t1-5)", async () => {
  const { MS_SUBIR_T1_4 } = await import("../../components/mecanicas/libros/tema1/QueLePasaACadaUno.jsx");
  const proto = w.Element.prototype;
  const rectOriginal = proto.getBoundingClientRect;
  const subidas = [];
  proto.getBoundingClientRect = function () {
    if (this.matches?.("[data-escenario]")) return { top: -154, bottom: 180, left: 0, right: 300, width: 300, height: 334 };
    return rectOriginal.call(this);
  };
  proto.scrollIntoView = function (o) { subidas.push(o); };
  const { caja, desmontar } = montar();
  try {
    const t = TRANSACCIONES_CAP2.find((x) => x.id === hechoEnPantalla(caja));
    const e = efectoDe(t);
    for (const p of PARTES) marcar(caja, p.id, e[p.id]);
    anotar(caja);
    assert.equal(subidas.length, 1, "no subió a las barras");
    assert.equal(caja.querySelectorAll("[data-parte][data-revelado]").length, 0, "las barras se movieron antes de estar a la vista");
    await act(async () => { await new Promise((r) => setTimeout(r, MS_SUBIR_T1_4 + 60)); });
    assert.equal(caja.querySelectorAll("[data-parte][data-revelado]").length, 3);
  } finally {
    desmontar();
    proto.getBoundingClientRect = rectOriginal;
    delete proto.scrollIntoView;
  }
});
