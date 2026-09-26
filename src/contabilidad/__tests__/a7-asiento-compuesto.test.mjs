import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A7 · EL ASIENTO COMPUESTO.
 *
 * Dos cosas se rompen aquí sin hacer ruido.
 *
 * La primera es el SORTEO. Solo dos de los cinco asientos permiten fundir dos
 * activos en una sola cuenta, que es la segunda confusión del objetivo. Un
 * sorteo libre de tres sobre cinco los deja fuera a los dos uno de cada diez
 * intentos, y en esos la actividad no mide lo que dice medir. Por eso va
 * estratificado, y por eso hay una prueba que lo enumera.
 *
 * La segunda es la PRIORIDAD. Fundir dos cuentas hace que el asiento CUADRE
 * —10.000 al debe contra 10.000 al haber— y que falte una cuenta. Si se
 * atendiera primero «faltan cuentas», el estudiante leería un diagnóstico
 * cierto pero peor: «te falta una» en vez de «fundiste dos».
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

const ElAsientoCompuestoNuevo = (await import("../../components/mecanicas/libros/ElAsientoCompuestoNuevo.jsx")).default;
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const {
  ASIENTOS, POR_PARTIDA, CON_FUSION_POSIBLE, sortearEstratificado, estanteDe,
  detectarFusion, evaluar, notaDelAsiento, puntuar, pesoDeCadaAsiento, CUARTOS, textoDeItem,
} = await import("../asientoCompuesto.js");
const {
  ITEMS, ERROR_A, ERROR_B, ERROR_C_POR_ITEM, ERROR_D,
} = await import("../../data/contabilidadAsientoCompuesto.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const completo = (a) => a.cuentas.map((c) => ({ cuenta: c.cuenta, lado: c.lado, valor: c.valor }));

function montarVista() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(ElAsientoCompuestoNuevo, {
    Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {},
  })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const sacar = (caja, cuenta, lado) => tocar(caja.querySelector(`[data-sacar="${cuenta}:${lado}"]`));
const campoDe = (caja, cuenta) => caja.querySelector(`[data-en-mesa="${cuenta}"] input`);
const escribir = (caja, cuenta, texto) => act(() => {
  const i = campoDe(caja, cuenta);
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  setter.call(i, texto);
  i.dispatchEvent(new w.Event("input", { bubbles: true }));
});
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => new RegExp(texto, "i").test(b.textContent));
const asientoEnPantalla = (caja) => {
  const texto = caja.querySelector("[data-enunciado]").textContent;
  return ASIENTOS.find((a) => a.texto === texto);
};
/* Solo saca lo que no esté ya en la mesa: si no, busca un botón que ya no existe. */
const armarBien = (caja, a) => {
  for (const c of a.cuentas) {
    if (!caja.querySelector(`[data-en-mesa="${c.cuenta}"]`)) sacar(caja, c.cuenta, c.lado);
    escribir(caja, c.cuenta, String(c.valor));
  }
};

/* ═══════════════════ EL BANCO ═══════════════════ */

test("★★ los cinco cuadran, y salen del asiento del capítulo", () => {
  assert.equal(ASIENTOS.length, 5);
  for (const a of ASIENTOS) {
    assert.equal(a.totalDebe, a.totalHaber, `${a.id}: el asiento del capítulo no cuadra`);
    assert.ok(a.cuentas.length >= 3, `${a.id}: no es compuesto`);
  }
  assert.deepEqual(
    ASIENTOS.map((a) => a.totalDebe),
    [10000, 4800, 2500, 1500000, 3000000],
    "las cifras de los cinco ya no son las del capítulo",
  );
});

test("★★ cada anclaje existe literalmente en su enunciado, y no se pisan", () => {
  for (const a of ASIENTOS) {
    const marcas = a.cuentas.map((c) => {
      assert.ok(c.ancla, `${a.id}: «${c.cuenta}» sin anclaje`);
      const k = a.texto.indexOf(c.ancla);
      assert.ok(k >= 0, `${a.id}: «${c.ancla}» no está en «${a.texto}»`);
      return { k, n: c.ancla.length, cuenta: c.cuenta };
    }).sort((x, y) => x.k - y.k);
    for (let i = 1; i < marcas.length; i += 1) {
      assert.ok(
        marcas[i - 1].k + marcas[i - 1].n <= marcas[i].k,
        `${a.id}: los anclajes de ${marcas[i - 1].cuenta} y ${marcas[i].cuenta} se pisan`,
      );
    }
  }
});

test("★★ lo que el banco declara sobre «dos por lado» coincide con el asiento real", () => {
  for (const item of ITEMS) {
    const a = ASIENTOS.find((x) => x.id === item.id);
    assert.equal(a.dosPorLado, item.conDosPorLado, `${item.id}: el banco dice otra cosa que el asiento`);
  }
});

test("★★ solo dos asientos permiten fundir dos cuentas DEL DEBE, y son esos dos", () => {
  const deducidos = ASIENTOS
    .filter((a) => a.cuentas.filter((c) => c.lado === DEBE).length > 1)
    .map((a) => a.id);
  assert.deepEqual(deducidos, ["cu10-01", "cu10-05"]);
  assert.deepEqual(CON_FUSION_POSIBLE, deducidos);
  /* Y cada uno tiene su explicación propia escrita. */
  for (const id of CON_FUSION_POSIBLE) assert.ok(ERROR_C_POR_ITEM[id], `${id} sin texto de fusión`);
});

/* ═══════════════════ EL SORTEO ═══════════════════ */

test("★★★ NINGÚN sorteo se queda sin un asiento donde fundir dos cuentas", () => {
  /*
   * Enumerado sobre 400 sorteos: si el estratificado se rompiera y pasara a
   * ser libre, la probabilidad de quedarse sin ninguno es 1/10, así que en
   * 400 vueltas aparecería decenas de veces. No es un muestreo de cortesía.
   */
  for (let k = 0; k < 400; k += 1) {
    const sorteo = sortearEstratificado(barajar);
    assert.equal(sorteo.length, POR_PARTIDA, `vuelta ${k}: no salieron tres`);
    assert.equal(new Set(sorteo.map((a) => a.id)).size, POR_PARTIDA, `vuelta ${k}: uno repetido`);
    assert.ok(
      sorteo.some((a) => CON_FUSION_POSIBLE.includes(a.id)),
      `vuelta ${k}: ningún asiento permite fundir dos cuentas`,
    );
  }
});

/*
 * OJO: la primera versión solo exigía «más de una tanda distinta», y un
 * mutante que devolvía siempre los mismos tres del resto —variando solo cuál
 * de los dos con fusión entraba— le daba DOS tandas y pasaba. Lo que hay que
 * exigir es que los CINCO puedan salir: si uno no sale nunca, el estudiante
 * no lo verá jamás por mucho que esté en el banco.
 */
test("★★ en muchos sorteos salen los cinco asientos, no siempre los mismos", () => {
  const veces = new Map(ASIENTOS.map((a) => [a.id, 0]));
  const tandas = new Set();
  for (let k = 0; k < 300; k += 1) {
    const sorteo = sortearEstratificado(barajar);
    tandas.add(sorteo.map((a) => a.id).sort().join("+"));
    for (const a of sorteo) veces.set(a.id, veces.get(a.id) + 1);
  }
  for (const [id, n] of veces) assert.ok(n > 0, `${id} no salió ni una vez en 300 sorteos`);
  assert.ok(tandas.size >= 4, `solo salieron ${tandas.size} tandas distintas`);
});

test("★ el estante trae las cuentas del asiento y señuelos del mismo capítulo", () => {
  for (const a of ASIENTOS) {
    const e = estanteDe(a);
    for (const c of a.cuentas) assert.ok(e.includes(c.cuenta), `${a.id}: falta ${c.cuenta}`);
    assert.ok(e.length > a.cuentas.length, `${a.id}: el estante no tiene señuelos`);
    assert.equal(new Set(e).size, e.length, `${a.id}: un nombre repetido`);
  }
});

/* ═══════════════════ LA FUSIÓN ═══════════════════ */

test("★★ fundir dos cuentas del debe se detecta por la aritmética exacta", () => {
  for (const id of CON_FUSION_POSIBLE) {
    const a = ASIENTOS.find((x) => x.id === id);
    const [c1, c2] = a.cuentas.filter((c) => c.lado === DEBE);
    const puestas = [
      { cuenta: c1.cuenta, lado: DEBE, valor: c1.valor + c2.valor },
      ...a.cuentas.filter((c) => c.lado === HABER).map((c) => ({ cuenta: c.cuenta, lado: HABER, valor: c.valor })),
    ];
    const f = detectarFusion(a, puestas);
    assert.ok(f, `${id}: no se detectó la fusión`);
    assert.equal(f.cuenta, c1.cuenta);
    assert.deepEqual([...f.funde].sort(), [c1.cuenta, c2.cuenta].sort());

    const r = evaluar(a, puestas);
    assert.equal(r.patron, "C", `${id}: no ganó el diagnóstico de la fusión`);
    assert.equal(r.texto, ERROR_C_POR_ITEM[id]);
    assert.equal(r.cierra, true, `${id}: fundir tiene que hacer que CUADRE, y por eso C manda`);
  }
});

/*
 * ═══════════ LOS DOS BORDES DE LA REGLA ARITMÉTICA ═══════════
 *
 * La fusión se dispara cuando UNA cuenta puesta vale EXACTAMENTE la suma de
 * dos correctas del debe y EXACTAMENTE UNA de esas dos está ausente. Las dos
 * pruebas de abajo son los dos bordes, y las dos salieron de mutantes que
 * sobrevivieron a todo lo demás.
 */
test("★★ con las DOS cuentas presentes no hay fusión: el fallo es otro", () => {
  const a = ASIENTOS.find((x) => x.id === "cu10-01");
  const [c1, c2] = a.cuentas.filter((c) => c.lado === DEBE);
  /* c1 escrita con la suma de las dos, pero c2 también está en la mesa. */
  const puestas = completo(a).map((p) => (p.cuenta === c1.cuenta ? { ...p, valor: c1.valor + c2.valor } : p));
  const r = evaluar(a, puestas);
  assert.equal(r.fusion, null, "se llamó fusión a algo que no lo es: las dos cuentas están");
  assert.equal(r.patron, "D", "con todas las cuentas puestas, lo que falla es la aritmética");
});

test("★★ un valor que NO es la suma exacta no es una fusión", () => {
  const a = ASIENTOS.find((x) => x.id === "cu10-01");
  const [c1, c2] = a.cuentas.filter((c) => c.lado === DEBE);
  const puestas = [
    { cuenta: c1.cuenta, lado: DEBE, valor: c1.valor + c2.valor - 1 },
    ...a.cuentas.filter((c) => c.lado === HABER).map((c) => ({ cuenta: c.cuenta, lado: HABER, valor: c.valor })),
  ];
  const r = evaluar(a, puestas);
  assert.equal(r.fusion, null, "una cifra parecida no puede pasar por fusión");
  assert.equal(r.patron, "A", "falta una cuenta, y eso es lo que hay que decirle");
});

test("★★ la cuenta fundida recibe DOS anclajes: esa es la señal", () => {
  const a = ASIENTOS.find((x) => x.id === "cu10-01");
  const [c1, c2] = a.cuentas.filter((c) => c.lado === DEBE);
  const r = evaluar(a, [
    { cuenta: c1.cuenta, lado: DEBE, valor: c1.valor + c2.valor },
    ...a.cuentas.filter((c) => c.lado === HABER).map((c) => ({ cuenta: c.cuenta, lado: HABER, valor: c.valor })),
  ]);
  assert.deepEqual(r.anclasDe(c1.cuenta), [a.anclajes[c1.cuenta], a.anclajes[c2.cuenta]]);
  /* Y una cuenta normal, una sola. */
  const otra = a.cuentas.find((c) => c.lado === HABER);
  assert.deepEqual(r.anclasDe(otra.cuenta), [a.anclajes[otra.cuenta]]);
});

test("★★★ una fusión en el HABER no dispara C: ahí es otro error", () => {
  /*
   * En el haber de este banco, dos cuentas del mismo lado son «un activo
   * pagado de dos formas». Fundirlas no es «fundiste dos activos»: es «no
   * dividiste el pago». Decirle lo primero sería describirle algo que no hizo.
   */
  const a = ASIENTOS.find((x) => x.id === "cu10-03");
  const enElHaber = a.cuentas.filter((c) => c.lado === HABER);
  assert.equal(enElHaber.length, 2, "el caso dejó de existir en este asiento");
  const [d] = a.cuentas.filter((c) => c.lado === DEBE);
  const r = evaluar(a, [
    { cuenta: d.cuenta, lado: DEBE, valor: d.valor },
    { cuenta: enElHaber[0].cuenta, lado: HABER, valor: enElHaber[0].valor + enElHaber[1].valor },
  ]);
  assert.equal(r.fusion, null, "se detectó una fusión donde no aplica");
  assert.equal(r.patron, "A", "el diagnóstico tiene que ser que faltan cuentas");
  assert.equal(r.texto, ERROR_A);
});

/* ═══════════════════ LA PRIORIDAD ═══════════════════ */

test("★★ C manda sobre B, A y D; B sobre A; A sobre D", () => {
  const a = ASIENTOS.find((x) => x.id === "cu10-02");
  const bien = completo(a);

  assert.equal(evaluar(a, bien).patron, null, "el asiento correcto da error");

  /* B: una cuenta que no participa. */
  const conAjena = [...bien, { cuenta: "Terrenos", lado: DEBE, valor: 1 }];
  const rb = evaluar(a, conAjena);
  assert.equal(rb.patron, "B");
  assert.equal(rb.texto, ERROR_B.replace("{cuenta}", "Terrenos"));
  assert.equal(rb.sinAncla, "Terrenos");

  /* A: falta una cuenta. */
  assert.equal(evaluar(a, bien.slice(0, 2)).patron, "A");

  /* D: están todas y la aritmética falla. */
  const malaCuenta = bien.map((p, i) => (i === 1 ? { ...p, valor: p.valor + 100 } : p));
  const rd = evaluar(a, malaCuenta);
  assert.equal(rd.patron, "D");
  assert.ok(rd.texto.startsWith("❌ Debe "));
  assert.ok(!/\{/.test(rd.texto), "quedó un hueco sin llenar");
});

test("★ los cuatro textos de error son distintos entre sí", () => {
  const textos = new Set([ERROR_A, ERROR_B, ERROR_D, ...Object.values(ERROR_C_POR_ITEM)]);
  assert.equal(textos.size, 5, "dos errores comparten explicación");
  for (const x of textos) assert.ok(x.startsWith("❌"), `«${x.slice(0, 20)}…» no marca el error`);
});

test("★ acertar no lleva coral, y los tres con texto propio lo tienen", () => {
  for (const a of ASIENTOS) {
    const r = evaluar(a, completo(a));
    assert.equal(r.perfecto, true, `${a.id}`);
    assert.ok(r.texto.startsWith("✅"), `${a.id}: el acierto no se marca`);
    assert.ok(!/\{/.test(r.texto), `${a.id}: quedó un hueco sin llenar`);
  }
});

/* ═══════════════════ EL CONECTOR Y EL PUNTAJE ═══════════════════ */

test("★★ el conector cierra solo cuando las dos sumas coinciden", () => {
  for (const a of ASIENTOS) {
    assert.equal(evaluar(a, completo(a)).cierra, true, `${a.id}: el correcto no cierra`);
    const cojo = completo(a).slice(0, -1);
    const r = evaluar(a, cojo);
    assert.equal(r.cierra, false, `${a.id}: cerró con una cuenta menos`);
    assert.ok(r.diferencia > 0, `${a.id}: la diferencia no se ve`);
    /* Y la diferencia es justo lo que falta por registrar. */
    const falta = a.cuentas.find((c) => !cojo.some((p) => p.cuenta === c.cuenta));
    assert.equal(r.diferencia, falta.valor, `${a.id}: la diferencia no es lo que falta`);
  }
});

test("cada asiento vale un tercio, y dentro va en cuatro cuartas partes", () => {
  assert.equal(POR_PARTIDA, 3);
  assert.equal(pesoDeCadaAsiento(3).toFixed(2), (100 / 3).toFixed(2));
  assert.equal(CUARTOS.length, 4);
  const a = ASIENTOS[0];
  assert.equal(notaDelAsiento(evaluar(a, completo(a))), 1);
  assert.equal(puntuar([1, 1, 1], 3), 100);
  assert.equal(puntuar([0.5, 0.5, 0.5], 3), 50);
  assert.equal(puntuar([0, 0, 0], 3), 0);
});

test("★ una nota parcial no es ni cero ni uno", () => {
  const a = ASIENTOS.find((x) => x.id === "cu10-02");
  const malValor = completo(a).map((p, i) => (i === 1 ? { ...p, valor: p.valor + 100 } : p));
  const n = notaDelAsiento(evaluar(a, malValor));
  assert.ok(n > 0 && n < 1, `con las cuentas bien y un valor mal la nota fue ${n}`);
});

test("★ el panel lee los cinco", () => {
  for (const a of ASIENTOS) {
    const e = etiquetaDeItem("cu-asiento-compuesto", a.id);
    assert.ok(e && a.texto.startsWith(e.replace(/…$/, "")), `${a.id}: ${e}`);
  }
  assert.equal(textoDeItem("cu10-99"), null);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★ la mesa son DOS columnas, y una cuenta nueva no mueve a las puestas", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  assert.ok(a, "no se pudo leer la transacción");
  assert.equal(caja.querySelectorAll("[data-colector]").length, 2, "no hay dos colectores");

  const orden = [];
  for (const c of a.cuentas) {
    sacar(caja, c.cuenta, c.lado);
    const enMesa = [...caja.querySelectorAll("[data-en-mesa]")].map((x) => x.getAttribute("data-en-mesa"));
    /* Lo que ya estaba sigue donde estaba, en el mismo orden. */
    assert.deepEqual(enMesa.slice(0, orden.length), orden, "al añadir una cuenta se movieron las puestas");
    orden.push(c.cuenta);
    /* Y sigue habiendo exactamente dos columnas. */
    assert.equal(caja.querySelectorAll("[data-colector]").length, 2, "la mesa dejó de tener dos columnas");
  }
  assert.equal(orden.length, a.cuentas.length);
  desmontar();
});

test("★★ cada cuenta entra en la columna que el estudiante eligió", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const c = a.cuentas[0];
  /* A propósito en la columna contraria: la mesa obedece, no corrige. */
  const contraria = c.lado === DEBE ? HABER : DEBE;
  sacar(caja, c.cuenta, contraria);
  assert.equal(
    caja.querySelector(`[data-en-mesa="${c.cuenta}"]`).getAttribute("data-lado"),
    contraria,
    "la mesa colocó la cuenta donde le pareció",
  );
  desmontar();
});

test("★★ el colector cuenta lo que hay en su columna, y el conector se abre y cierra", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  assert.equal(caja.querySelector("[data-conector]").getAttribute("data-conector"), "abierto");

  for (const c of a.cuentas) {
    sacar(caja, c.cuenta, c.lado);
    escribir(caja, c.cuenta, String(c.valor));
  }
  assert.equal(caja.querySelector("[data-conector]").getAttribute("data-conector"), "cerrado");
  assert.equal(caja.querySelector('[data-total="debe"]').textContent, caja.querySelector('[data-total="haber"]').textContent);
  desmontar();
});

test("★★ con una cuenta de menos el conector queda abierto y la diferencia es lo que falta", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const falta = a.cuentas[a.cuentas.length - 1];
  for (const c of a.cuentas.slice(0, -1)) {
    sacar(caja, c.cuenta, c.lado);
    escribir(caja, c.cuenta, String(c.valor));
  }
  assert.equal(caja.querySelector("[data-conector]").getAttribute("data-conector"), "abierto");
  assert.equal(caja.querySelector("[data-diferencia]").getAttribute("data-diferencia"), String(falta.valor));
  desmontar();
});

test("★★ antes de confirmar no hay ▲ ni anclajes, con la mesa ya llena", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  armarBien(caja, a);
  assert.equal(boton(caja, "Confirmar asiento").disabled, false, "el asiento no quedó completo");
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, 0, "el ▲ se adelantó");
  assert.equal(caja.querySelectorAll("[data-flecha]").length, 0, "la flecha se adelantó");
  assert.equal(caja.querySelectorAll("[data-frase]").length, 0, "el enunciado se resaltó antes de tiempo");
  desmontar();
});

test("★★ al confirmar aparecen los ▲ y los chips del enunciado, uno por cuenta", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  armarBien(caja, a);
  tocar(boton(caja, "Confirmar asiento"));
  assert.equal(caja.querySelectorAll("[data-triangulo]").length, a.cuentas.length, "faltan ▲");
  assert.equal(caja.querySelectorAll("[data-flecha]").length, a.cuentas.length, "faltan flechas");
  assert.equal(caja.querySelectorAll("[data-frase]").length, a.cuentas.length, "faltan chips");
  desmontar();
});

test("★ no se puede confirmar con la mesa a medias", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  assert.equal(boton(caja, "Confirmar asiento").disabled, true, "se podía confirmar con la mesa vacía");
  sacar(caja, a.cuentas[0].cuenta, a.cuentas[0].lado);
  assert.equal(boton(caja, "Confirmar asiento").disabled, true, "se podía confirmar con una cuenta");
  armarBien(caja, a);
  assert.equal(boton(caja, "Confirmar asiento").disabled, false);
  desmontar();
});

test("★ una cuenta se puede devolver al estante", () => {
  const { caja, desmontar } = montarVista();
  const a = asientoEnPantalla(caja);
  const c = a.cuentas[0];
  sacar(caja, c.cuenta, c.lado);
  assert.ok(caja.querySelector(`[data-en-mesa="${c.cuenta}"]`));
  tocar(caja.querySelector(`[data-devolver="${c.cuenta}"]`));
  assert.equal(Boolean(caja.querySelector(`[data-en-mesa="${c.cuenta}"]`)), false, "no volvió al estante");
  assert.ok(caja.querySelector(`[data-sacar="${c.cuenta}:${c.lado}"]`), "no se puede volver a sacar");
  desmontar();
});

test("★ se juegan tres asientos y ninguno se repite", () => {
  const { caja, desmontar } = montarVista();
  const vistos = [];
  for (let k = 0; k < POR_PARTIDA; k += 1) {
    const a = asientoEnPantalla(caja);
    assert.ok(a, `no se pudo leer el asiento ${k + 1}`);
    vistos.push(a.id);
    armarBien(caja, a);
    tocar(boton(caja, "Confirmar asiento"));
    tocar(boton(caja, k + 1 === POR_PARTIDA ? "Ver el resultado" : "Siguiente asiento"));
  }
  assert.equal(new Set(vistos).size, POR_PARTIDA, "un asiento salió dos veces");
  assert.ok(vistos.some((id) => CON_FUSION_POSIBLE.includes(id)), "la tanda no trajo ninguno con fusión posible");
  desmontar();
});
