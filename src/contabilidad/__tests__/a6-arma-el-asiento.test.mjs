import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A6 · ARMA EL ASIENTO.
 *
 * Aquí lo que se rompe en silencio son las TRES SEÑALES. Cada una dice
 * exactamente una cosa, y las tres se encienden siempre al confirmar. Si
 * alguna apareciera solo cuando el estudiante falla, su sola presencia sería
 * el veredicto: dejaría de leerse lo que dice para leerse si está.
 *
 * Y lo segundo, el anclaje que NO está. En dos transacciones el enunciado
 * nombra el computador y Equipo de computación no se mueve. Si esa cuenta
 * recibiera línea por aparecer escrita, la señal pasaría a significar «el
 * enunciado la nombra», que es justo la confusión que la actividad ataca.
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

const ElAsientoSimple = (await import("../../components/mecanicas/libros/ElAsientoSimple.jsx")).default;
const { partirPorFrases } = await import("../../components/mecanicas/libros/ElAsientoSimple.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  ASIENTOS, POR_PARTIDA, UNIVERSO, CUANTAS_EN_BANCO, PAREJA,
  bancoDe, evaluar, decideEntreCajaYBancos, claveEnElTexto,
  puntuar, decisionesDe, pesoDeCadaDecision, textoDeItem,
} = await import("../armaElAsiento.js");
const {
  ITEMS, ITEM_RETIRADO, ANCLAJES, ERROR_MISMO_LADO, ERROR_LADOS_INVERTIDOS,
  COLETILLA_COMPUTADOR, COLETILLA_CAJA_BANCOS,
} = await import("../../data/contabilidadArmaElAsiento.js");
const { DEBE, HABER, CRECE_POR, tipoDeCuenta } = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { FAE } = await import("../../theme.js");

const contrario = (l) => (l === DEBE ? HABER : DEBE);

function montarVista() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(ElAsientoSimple, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const ficha = (caja, texto) => [...caja.querySelectorAll("[data-ficha]")].find((f) => f.getAttribute("data-ficha") === texto);
const hueco = (caja, i) => caja.querySelector(`[data-cuenta-t="${i}"] [data-destino="nombre:${i}"]`);
const columna = (caja, i, lado) => caja.querySelector(`[data-cuenta-t="${i}"] [data-columna="${lado}"]`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));
const asientoEnPantalla = (caja) => {
  const texto = caja.querySelector("[data-enunciado]").textContent;
  return ASIENTOS.find((a) => a.texto === texto);
};
/** Nombra las dos cuentas y pone cada valor en el lado pedido. */
function armar(caja, pares) {
  pares.forEach(([cuenta], i) => {
    tocar(ficha(caja, cuenta));
    tocar(hueco(caja, i));
  });
  pares.forEach(([, lado], i) => {
    tocar(caja.querySelector(`[data-ficha-valor="${i}"] [data-ficha]`));
    tocar(columna(caja, i, lado));
  });
}

/* ═══════════════════ EL BANCO ═══════════════════ */

test("★★ son once, y el ítem de los $1.000 con asiento de $2.000 ya no está", () => {
  assert.equal(ASIENTOS.length, 11);
  assert.equal(ITEMS.length, 11);
  assert.ok(!ITEMS.some((i) => i.id === "cu6-01"), "el ítem retirado sigue en el banco");
  assert.ok(ITEM_RETIRADO["cu6-01"], "se perdió el rastro del retirado");
  /* Y su enunciado se sigue traduciendo para el panel docente. */
  assert.ok(textoDeItem("cu6-01"), "el retirado dejó de traducirse");
});

test("★★ los once son asientos SIMPLES: una cuenta a cada lado", () => {
  for (const a of ASIENTOS) {
    assert.equal(a.cuentas.filter((c) => c.lado === DEBE).length, 1, `${a.id}: más de una al debe`);
    assert.equal(a.cuentas.filter((c) => c.lado === HABER).length, 1, `${a.id}: más de una al haber`);
    const [d] = a.cuentas.filter((c) => c.lado === DEBE);
    const [h] = a.cuentas.filter((c) => c.lado === HABER);
    assert.equal(d.valor, h.valor, `${a.id}: el asiento del capítulo no cuadra`);
  }
});

test("★★ cada anclaje existe literalmente en su enunciado", () => {
  for (const a of ASIENTOS) {
    for (const c of a.cuentas) {
      assert.ok(c.ancla, `${a.id}: «${c.cuenta}» se mueve y no tiene anclaje`);
      assert.ok(
        a.texto.includes(c.ancla),
        `${a.id}: «${c.ancla}» no está en «${a.texto}»`,
      );
    }
  }
});

test("★★ los dos anclajes de un ítem no se pisan entre sí", () => {
  for (const a of ASIENTOS) {
    const [x, y] = a.cuentas.map((c) => ({ k: a.texto.indexOf(c.ancla), n: c.ancla.length }));
    const [primero, segundo] = x.k <= y.k ? [x, y] : [y, x];
    assert.ok(
      primero.k + primero.n <= segundo.k,
      `${a.id}: los dos anclajes se solapan y el chip se rompería`,
    );
  }
});

test("★★ en las dos transacciones del computador ya comprado, esa cuenta NO ancla", () => {
  const casos = ["cu6-07", "cu6-11"];
  for (const id of casos) {
    const a = ASIENTOS.find((x) => x.id === id);
    assert.ok(/computador/i.test(a.texto), `${id}: el enunciado ya no nombra el computador`);
    assert.ok(
      !a.cuentas.some((c) => c.cuenta === "Equipo de computación"),
      `${id}: esa cuenta se mueve y el caso deja de existir`,
    );
    assert.equal(a.anclajes["Equipo de computación"], undefined, `${id}: le dieron anclaje`);
  }
});

test("★ ningún anclaje sobra: solo las cuentas que se mueven tienen línea", () => {
  for (const a of ASIENTOS) {
    const conAncla = Object.keys(a.anclajes);
    const seMueven = a.cuentas.map((c) => c.cuenta);
    assert.deepEqual([...conAncla].sort(), [...seMueven].sort(), `${a.id}`);
  }
});

/* ═══════════════════ LOS SEÑUELOS ═══════════════════ */

test("★★ la pareja de Caja/Bancos entra SOLO donde el enunciado la distingue", () => {
  for (const a of ASIENTOS) {
    const correctas = a.cuentas.map((c) => c.cuenta);
    const pareja = correctas.map((c) => PAREJA[c]).find((p) => p && !correctas.includes(p));
    if (!pareja) continue;
    const banco = bancoDe(a);
    const decide = decideEntreCajaYBancos(a.texto);
    assert.equal(
      banco.includes(pareja), Boolean(decide),
      `${a.id}: «${pareja}» ${decide ? "tiene que ofrecerse" : "no puede ofrecerse"}`,
    );
  }
});

test("★ el reparto de la pareja es el de la ficha, ítem por ítem", () => {
  const CON_PAREJA = ["cu6-03", "cu6-09", "cu6-11"];
  const SIN_PAREJA = ["cu6-02", "cu6-04", "cu6-07"];
  for (const id of CON_PAREJA) {
    const a = ASIENTOS.find((x) => x.id === id);
    assert.ok(decideEntreCajaYBancos(a.texto), `${id}: el enunciado perdió su palabra clave`);
  }
  for (const id of SIN_PAREJA) {
    const a = ASIENTOS.find((x) => x.id === id);
    assert.equal(decideEntreCajaYBancos(a.texto), null, `${id}: apareció una palabra clave`);
  }
});

test("★★ el banco siempre trae las dos correctas, y nada inventado", () => {
  for (const a of ASIENTOS) {
    const banco = bancoDe(a);
    assert.equal(banco.length, CUANTAS_EN_BANCO, `${a.id}: el banco no tiene seis`);
    assert.equal(new Set(banco).size, banco.length, `${a.id}: hay un nombre repetido`);
    for (const c of a.cuentas) assert.ok(banco.includes(c.cuenta), `${a.id}: falta ${c.cuenta}`);
    for (const c of banco) assert.ok(UNIVERSO.includes(c), `${a.id}: «${c}» no es del capítulo`);
  }
});

/* ═══════════════════ LAS TRES SEÑALES, EN LA LÓGICA ═══════════════════ */

test("★★ el arco cierra cuando los totales coinciden, y da igual si acertó", () => {
  for (const a of ASIENTOS) {
    const [d] = a.cuentas.filter((c) => c.lado === DEBE);
    const [h] = a.cuentas.filter((c) => c.lado === HABER);

    const bien = evaluar(a, [{ cuenta: d.cuenta, lado: DEBE }, { cuenta: h.cuenta, lado: HABER }]);
    assert.equal(bien.perfecto, true, `${a.id}`);
    assert.equal(bien.cuadra, true, `${a.id}: el asiento correcto no cuadra`);

    /* Invertidos: está mal Y cuadra. Las dos cosas a la vez, a propósito. */
    const alReves = evaluar(a, [{ cuenta: d.cuenta, lado: HABER }, { cuenta: h.cuenta, lado: DEBE }]);
    assert.equal(alReves.perfecto, false, `${a.id}`);
    assert.equal(alReves.cuadra, true, `${a.id}: invertir los lados tiene que seguir cuadrando`);
    assert.equal(alReves.texto, ERROR_LADOS_INVERTIDOS);
  }
});

/*
 * ═══════════ LA FICHA VALE LO MISMO CAIGA DONDE CAIGA ═══════════
 *
 * Salió mirándolo en el navegador: al elegir una cuenta que no participa, la
 * ficha mostraba $0 — un importe que la transacción no dice en ninguna parte,
 * escrito en pantalla como si lo dijera. Y de rebote el asiento no podía
 * cuadrar nunca con una cuenta de más, cuando la ficha dice que ahí el arco
 * puede cerrar igual: también es verdad que los totales coinciden.
 */
test("★★ con una cuenta que no participa, el valor sigue siendo el del asiento y el arco puede cerrar", () => {
  const a = ASIENTOS.find((x) => x.id === "cu6-07");
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  assert.ok(a.valor > 0, "el asiento no declara su importe");
  assert.equal(a.valor, d.valor, "el importe del asiento no es el de sus cuentas");

  const r = evaluar(a, [
    { cuenta: d.cuenta, lado: DEBE },
    { cuenta: "Equipo de computación", lado: HABER },
  ]);
  assert.equal(r.patron, "B", "el diagnóstico tiene que ser la cuenta que no se mueve");
  assert.equal(r.totalDebe, a.valor);
  assert.equal(r.totalHaber, a.valor, "la cuenta ajena no aportó su valor");
  assert.equal(r.cuadra, true, "el arco tiene que poder cerrar: los totales sí coinciden");
});

test("★★ con las dos fichas del mismo lado NO hay arco, y manda ese diagnóstico", () => {
  for (const a of ASIENTOS) {
    const [d] = a.cuentas.filter((c) => c.lado === DEBE);
    const [h] = a.cuentas.filter((c) => c.lado === HABER);
    const r = evaluar(a, [{ cuenta: d.cuenta, lado: DEBE }, { cuenta: h.cuenta, lado: DEBE }]);
    assert.equal(r.patron, "C", `${a.id}`);
    assert.equal(r.texto, ERROR_MISMO_LADO);
    assert.equal(r.cuadra, false, `${a.id}: cuadró con las dos del mismo lado`);
  }
});

test("★★ la cuenta que no se mueve se queda sin línea, y el texto la nombra", () => {
  const a = ASIENTOS.find((x) => x.id === "cu6-07");
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const r = evaluar(a, [
    { cuenta: d.cuenta, lado: DEBE },
    { cuenta: "Equipo de computación", lado: HABER },
  ]);
  assert.equal(r.patron, "B");
  assert.equal(r.sinAncla, "Equipo de computación");
  assert.ok(r.texto.includes("Equipo de computación"));
  assert.ok(r.texto.includes(COLETILLA_COMPUTADOR), "falta la coletilla del computador ya comprado");
  assert.equal(r.frases.length, 1, "la cuenta suelta no puede traer frase");
});

test("★ confundir Caja con Bancos añade la explicación de las dos", () => {
  const a = ASIENTOS.find((x) => x.id === "cu6-03");
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const r = evaluar(a, [{ cuenta: d.cuenta, lado: DEBE }, { cuenta: "Bancos", lado: HABER }]);
  assert.equal(r.patron, "B");
  assert.ok(r.texto.includes(COLETILLA_CAJA_BANCOS));
  assert.equal(r.palabraClave, claveEnElTexto(a.texto));
  assert.ok(a.texto.includes(r.palabraClave), "la palabra clave no está en el enunciado");
});

test("★★ el ▲ y la flecha salen de la regla, no de una tabla", () => {
  for (const a of ASIENTOS) {
    for (const c of a.cuentas) {
      assert.equal(c.creceP, CRECE_POR[tipoDeCuenta(c.cuenta)], `${a.id}/${c.cuenta}`);
      assert.equal(c.sube, c.creceP === c.lado, `${a.id}/${c.cuenta}: la flecha no concuerda`);
    }
  }
});

test("★ en cada asiento simple una cuenta sube y la otra no siempre: eso se deduce", () => {
  /* No se afirma el reparto: se afirma que sale de la regla y no de un campo. */
  for (const a of ASIENTOS) {
    for (const c of a.cuentas) {
      const esperado = CRECE_POR[tipoDeCuenta(c.cuenta)] === c.lado;
      assert.equal(c.sube, esperado, `${a.id}/${c.cuenta}`);
    }
  }
});

/* ═══════════════════ PUNTAJE Y PANEL ═══════════════════ */

test("veinticuatro decisiones por partida, y el reintento vale la mitad", () => {
  assert.equal(POR_PARTIDA, 6);
  assert.equal(decisionesDe(POR_PARTIDA), 24);
  assert.equal(pesoDeCadaDecision(POR_PARTIDA).toFixed(2), (100 / 24).toFixed(2));
  const v = Array.from({ length: 24 }, (_, k) => ({ id: k }));
  assert.equal(puntuar(v.map((x) => ({ ...x, primeroOk: true })), 6), 100);
  assert.equal(puntuar(v.map((x) => ({ ...x, primeroOk: false, segundoOk: true })), 6), 50);
  assert.equal(puntuar(v.map((x) => ({ ...x, primeroOk: false, segundoOk: false })), 6), 0);
});

test("★ el panel lee los once y también el que salió del banco", () => {
  for (const a of ASIENTOS) {
    const e = etiquetaDeItem("cu-arma-el-asiento", a.id);
    /* El panel recorta las etiquetas largas; lo que importa es que sea ESTA. */
    assert.ok(e && a.texto.startsWith(e.replace(/…$/, "")), `${a.id}: ${e}`);
  }
  assert.ok(etiquetaDeItem("cu-arma-el-asiento", "cu6-01"), "se perdió el retirado");
  assert.equal(etiquetaDeItem("cu-arma-el-asiento", "cu6-99"), null);
});

/* ═══════════════════ EL TEXTO MARCADO ═══════════════════ */

test("★★ marcar frases no cambia ni una letra del enunciado", () => {
  for (const a of ASIENTOS) {
    const frases = Object.values(a.anclajes);
    const trozos = partirPorFrases(a.texto, frases);
    assert.equal(trozos.map((x) => x.texto).join(""), a.texto, `${a.id}: el texto salió distinto`);
    const marcadas = trozos.filter((x) => x.frase).map((x) => x.frase);
    assert.equal(new Set(marcadas).size, frases.length, `${a.id}: no se marcaron las dos frases`);
  }
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

/*
 * ═══════════ EL ASIENTO YA ARMADO, Y TODAVÍA SIN CONFIRMAR ═══════════
 *
 * OJO: la primera versión de esta prueba miraba la mesa VACÍA, y con la mesa
 * vacía no hay ninguna cuenta que pueda tener ▲ — así que un mutante que lo
 * dibujaba siempre sobrevivía a ella sin despeinarse. El momento que importa
 * es este: las dos cuentas puestas, los dos valores colocados, y el botón sin
 * tocar. Si alguna señal se adelanta, ahí se ve.
 */
test("★★ con el asiento armado y sin confirmar no hay NINGUNA de las tres señales", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  assert.ok(a, "no se pudo leer la transacción");

  /* Primero con la mesa vacía. */
  assert.equal(caja.querySelectorAll("[data-triangulo], [data-flecha]").length, 0, "el ▲ estaba puesto");
  assert.equal(Boolean(caja.querySelector("[data-arco]")), false, "el arco estaba trazado");
  assert.equal(caja.querySelectorAll("[data-frase]").length, 0, "el enunciado ya venía resaltado");

  /* Y ahora con todo puesto, que es donde el ▲ sí podría adelantarse. */
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const [h] = a.cuentas.filter((c) => c.lado === HABER);
  armar(caja, [[d.cuenta, DEBE], [h.cuenta, HABER]]);
  assert.equal(boton(caja, "Confirmar asiento").disabled, false, "el asiento no quedó completo");
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, 0, "el ▲ se adelantó al confirmar");
  assert.equal(caja.querySelectorAll("[data-flecha]").length, 0, "la flecha se adelantó al confirmar");
  assert.equal(Boolean(caja.querySelector("[data-arco]")), false, "el arco se adelantó al confirmar");
  assert.equal(caja.querySelectorAll("[data-frase]").length, 0, "el enunciado se resaltó antes de tiempo");
  desmontar();
});

test("★★ al confirmar ACERTANDO aparecen las tres señales", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const [h] = a.cuentas.filter((c) => c.lado === HABER);
  armar(caja, [[d.cuenta, DEBE], [h.cuenta, HABER]]);
  tocar(boton(caja, "Confirmar asiento"));

  assert.equal(caja.querySelector("[data-arco]").getAttribute("data-arco"), "cerrado");
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, 2, "faltan los ▲");
  assert.equal(caja.querySelectorAll("[data-flecha]").length, 2, "faltan las flechas");
  assert.equal(caja.querySelectorAll("[data-frase]").length, 2, "faltan los chips del enunciado");
  desmontar();
});

test("★★ al confirmar FALLANDO aparecen las tres igual: la señal no es el veredicto", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const [h] = a.cuentas.filter((c) => c.lado === HABER);
  /* Lados invertidos: está mal, y aun así cuadra y las dos cuentas se mueven. */
  armar(caja, [[d.cuenta, HABER], [h.cuenta, DEBE]]);
  tocar(boton(caja, "Confirmar asiento"));

  assert.equal(caja.querySelector("[data-arco]").getAttribute("data-arco"), "cerrado",
    "el arco no se trazó en un error que sí cuadra");
  assert.equal(caja.querySelectorAll("[data-flecha]").length, 2, "faltan las flechas en el error");
  assert.equal(caja.querySelectorAll("[data-frase]").length, 2, "faltan los chips en el error");
  desmontar();
});

test("★★ con las dos fichas del mismo lado el arco queda ABIERTO", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const [h] = a.cuentas.filter((c) => c.lado === HABER);
  armar(caja, [[d.cuenta, DEBE], [h.cuenta, DEBE]]);
  tocar(boton(caja, "Confirmar asiento"));
  assert.equal(caja.querySelector("[data-arco]").getAttribute("data-arco"), "abierto");
  assert.ok(caja.textContent.includes("Las dos fichas quedaron del mismo lado"));
  desmontar();
});

test("★ el nombre ya puesto sigue siendo un botón, deshabilitado", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  tocar(ficha(caja, d.cuenta));
  tocar(hueco(caja, 0));
  const f = ficha(caja, d.cuenta);
  assert.equal(f.tagName, "BUTTON", "dejó de ser botón y un lector oiría texto suelto");
  assert.equal(f.disabled, true, "se puede volver a tomar un nombre ya puesto");
  desmontar();
});

test("★ el botón de confirmar no se activa hasta que el asiento está completo", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const [h] = a.cuentas.filter((c) => c.lado === HABER);
  assert.equal(boton(caja, "Confirmar asiento").disabled, true, "se podía confirmar en blanco");
  tocar(ficha(caja, d.cuenta)); tocar(hueco(caja, 0));
  tocar(ficha(caja, h.cuenta)); tocar(hueco(caja, 1));
  assert.equal(boton(caja, "Confirmar asiento").disabled, true, "se podía confirmar sin lados");

  /* Con un solo valor puesto tampoco: el asiento sigue a medias. */
  tocar(caja.querySelector('[data-ficha-valor="0"] [data-ficha]'));
  tocar(columna(caja, 0, DEBE));
  assert.equal(boton(caja, "Confirmar asiento").disabled, true, "se podía confirmar con medio asiento");

  tocar(caja.querySelector('[data-ficha-valor="1"] [data-ficha]'));
  tocar(columna(caja, 1, HABER));
  assert.equal(boton(caja, "Confirmar asiento").disabled, false);
  desmontar();
});

test("★ se juegan seis de las once y ninguna se repite", () => {
  const { caja, desmontar } = montarVista();
  const vistos = [];
  for (let k = 0; k < POR_PARTIDA; k += 1) {
    const a = asientoEnPantalla(caja);
    assert.ok(a, `no se pudo leer la transacción ${k + 1}`);
    vistos.push(a.id);
    const [d] = a.cuentas.filter((c) => c.lado === DEBE);
    const [h] = a.cuentas.filter((c) => c.lado === HABER);
    armar(caja, [[d.cuenta, DEBE], [h.cuenta, HABER]]);
    tocar(boton(caja, "Confirmar asiento"));
    tocar(boton(caja, k + 1 === POR_PARTIDA ? "Ver el resultado" : "Siguiente transacción"));
  }
  assert.equal(new Set(vistos).size, POR_PARTIDA, "una transacción salió dos veces");
  desmontar();
});
