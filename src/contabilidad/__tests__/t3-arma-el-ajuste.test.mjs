import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTS. 4 Y 5 — «Arma el ajuste acumulado» y «Arma el ajuste
 * diferido» (paquete de Levi).
 *
 *   · cada ítem: las cuentas, los lados y el valor, contra la TABLA DE
 *     CONTROL de Levi (una segunda fuente, escrita aquí a mano)
 *   · el tipo de error de cada equivocación (A a D)
 *   · act. 5: el valor se compara exacto, y el error B usa el texto que toca
 *     según el monto sea dado o calculado
 *   · SALVAGUARDA: todo ítem con valor dado lo tiene escrito en el hecho
 *   · textos de Gen (hechos 4 y 5 de la act. 5, los de Levi); tutoriales
 *   · ni «adelantado», ni «devengaron», ni «corrió», ni «Interés por cobrar»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A4 = await import("../../data/contabilidadTema3Act4.js");
const A5 = await import("../../data/contabilidadTema3Act5.js");
const A6 = await import("../../data/contabilidadTema3Act6.js");
const L = await import("../armaElAjuste.js");
const { pesos, DEBE, HABER } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { ArmaElAjusteAcumulado, ArmaElAjusteDiferido } = await import("../../components/mecanicas/libros/tema3/ArmaElAjuste.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { REGLAS } = await import("../../docente/etiquetasItem.js");
const { default: AsiSeJuega } = await import("../../components/mecanicas/libros/AsiSeJuega.jsx");

/* Los módulos de datos ya están importados arriba; aquí se buscan por nombre de archivo. */
const MODULOS = {
  "contabilidadTema3Act4.js": A4, "contabilidadTema3Act5.js": A5, "contabilidadTema3Act6.js": A6,
  "contabilidadTema3Act1.js": await import("../../data/contabilidadTema3Act1.js"),
  "contabilidadTema3Act2.js": await import("../../data/contabilidadTema3Act2.js"),
  "contabilidadTema3.js": await import("../../data/contabilidadTema3.js"),
  "contabilidadTema3Pieza3.js": await import("../../data/contabilidadTema3Pieza3.js"),
  "contabilidadTema3Pieza4.js": await import("../../data/contabilidadTema3Pieza4.js"),
};
function await_(m) {
  assert.ok(MODULOS[m], `falta importar ${m} en la salvaguarda`);
  return MODULOS[m];
}


const Marco = ({ children }) => h("div", null, children);
const montar = async (Comp, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Comp, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => { assert.ok(el, "no está el elemento"); await act(async () => { el.click(); }); };
const escribir = async (el, texto) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(el, texto);
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};
const q = (caja, sel) => caja.querySelector(sel);
const textosRetro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);

/* Arma el asiento en pantalla: nombres, (valores), lados y confirmar. */
const armar = async (caja, [c0, l0, v0], [c1, l1, v1]) => {
  await clic(q(caja, `[data-nombre="${c0}"]`)); await clic(q(caja, '[data-destino="nombre:0"]'));
  await clic(q(caja, `[data-nombre="${c1}"]`)); await clic(q(caja, '[data-destino="nombre:1"]'));
  if (v0 !== undefined) await escribir(q(caja, '[data-campo-valor="0"]'), String(v0));
  if (v1 !== undefined) await escribir(q(caja, '[data-campo-valor="1"]'), String(v1));
  await clic(q(caja, '[data-ficha-valor="0"]')); await clic(q(caja, `[data-destino="0:${l0}"]`));
  await clic(q(caja, '[data-ficha-valor="1"]')); await clic(q(caja, `[data-destino="1:${l1}"]`));
  await clic(q(caja, "[data-confirmar]"));
};

/* ═══════════════════ LA TABLA DE CONTROL DE LEVI (segunda fuente) ═══════════════════ */

const TABLA_4 = [
  ["Servicios del Caribe", 125000, "Gasto salarios", "Salarios por pagar", "Basado en el libro, p. 172"],
  ["Servicios del Caribe", 36000, "Gasto interés", "Intereses por pagar", "Basado en el libro, p. 172"],
  ["Mónica Galindo", 210000, "Gasto salarios", "Salarios por pagar", "Basado en el libro, p. 173"],
  ["Servicios del Caribe", 240000, "Intereses por cobrar", "Ingresos por intereses", "Basado en el libro, p. 172"],
  ["Mónica Galindo", 600000, "Servicios por cobrar", "Ingresos por servicios", "Basado en el libro, p. 173"],
  ["San Calixto", 2500, "Gasto alquiler", "Alquiler por pagar", "Libro, p. 140"],
  ["San Miguel", 2500, "Servicios por cobrar", "Ingresos por servicios", "Libro, p. 142"],
];
const TABLA_5 = [
  ["Mónica Galindo", "31 de diciembre", 80000, false, "Gasto seguros", "Seguros pagados por anticipado", "Basado en el libro, p. 173"],
  ["Mónica Galindo", "31 de diciembre", 900000, false, "Gasto alquiler", "Alquiler pagado por anticipado", "Basado en el libro, p. 173"],
  ["Mónica Galindo", "31 de diciembre", 1120000, false, "Arriendos recibidos por anticipado", "Ingresos por arriendos", "Basado en el libro, p. 173"],
  ["Mónica Galindo", "31 de diciembre", 386000, true, "Servicios recibidos por anticipado", "Ingresos por servicios", "Basado en el libro, p. 173"],
  ["Servicios del Caribe", "31 de marzo", 120000, true, "Servicios recibidos por anticipado", "Ingresos por servicios", "Basado en el libro, p. 172"],
  ["San Calixto", "30 de junio", 5000, false, "Gastos arriendos", "Arriendos pagados por anticipado", "Libro, p. 144"],
  ["Arriendos de la Costa", "30 de junio", 5000, false, "Arriendos recibidos por anticipado", "Ingresos por arriendos", "Libro, p. 146"],
];

test("★★★ act. 4: cada ítem con las cuentas, los lados, el valor y el pie de la tabla de Levi", () => {
  assert.equal(A4.ITEMS_ACT4.length, 7);
  A4.ITEMS_ACT4.forEach((it, k) => {
    const [empresa, valor, debe, haber, pie] = TABLA_4[k];
    assert.deepEqual([it.empresa, it.valor, it.debe, it.haber, it.pie], [empresa, valor, debe, haber, pie], it.id);
    assert.deepEqual(L.cuentasDe(it, A4.TIPOS_ACT4).map((c) => [c.cuenta, c.lado]), [[debe, DEBE], [haber, HABER]]);
    assert.ok(L.evaluarAct4(it, [{ cuenta: debe, lado: DEBE }, { cuenta: haber, lado: HABER }]).ok, it.id);
  });
});

test("★★★ act. 5: cada ítem con las cuentas, los lados, el valor, el cierre y el pie de la tabla de Levi", () => {
  assert.equal(A5.ITEMS_ACT5.length, 7);
  A5.ITEMS_ACT5.forEach((it, k) => {
    const [empresa, cierre, valor, dado, debe, haber, pie] = TABLA_5[k];
    assert.deepEqual([it.empresa, it.valor, it.dado, it.debe, it.haber, it.pie], [empresa, valor, dado, debe, haber, pie], it.id);
    assert.ok(it.hecho.includes(`cierra el ${cierre}`), `${it.id}: el cierre`);
    /* Los que se calculan: el total entre los meses, por los que ya pasaron. */
    if (!it.dado) assert.equal(it.reparto.total / it.reparto.meses * it.reparto.de, it.valor, `${it.id}: reparto`);
    assert.ok(L.evaluarAct5(it, [{ cuenta: debe, lado: DEBE, valor }, { cuenta: haber, lado: HABER, valor }]).ok, it.id);
  });
});

test("★★★ los textos de Gen, textuales (y los hechos 4 y 5 de la act. 5 fijados por Levi)", () => {
  assert.equal(A4.ACT4_T3.consigna, "Lee el hecho. Pon un nombre en cada cuenta y el valor en su lado.");
  assert.deepEqual(A4.PASOS_ACT4, ["Pregúntate si lo que falta anotar es un gasto o un ingreso.", "Toca un nombre y después la cuenta donde va.", "Toca el valor y después el lado de su cuenta."]);
  assert.deepEqual(A4.ITEMS_ACT4.map((x) => x.hecho), [
    "Salarios acumulados por pagar a marzo 31",
    "Intereses pendientes de pago a marzo 31",
    "Salarios acumulados por pagar a diciembre 31",
    "Una inversión generó intereses en marzo que no se han recibido",
    "Tres meses de mantenimiento a Rojo y Negro, sin cobrar",
    "Cinco días de máquina alquilada, sin pagar",
    "Cinco días de máquina prestada, sin cobrar",
  ]);
  assert.deepEqual(A4.ITEMS_ACT4.map((x) => x.acierto), [
    "Los salarios ya se causaron: el trabajo está hecho. Falta la plata, y eso es una deuda.",
    "El interés ya se causó. Todavía no se paga, así que queda como deuda.",
    "Mismo caso, otra empresa y otro monto. El trabajo ya se hizo y la plata sale después.",
    "El interés ya se causó a favor de la empresa. Falta cobrarlo, y eso queda como algo por cobrar.",
    "El servicio ya se prestó tres meses. El ingreso es suyo aunque Rojo y Negro no haya pagado.",
    "Cinco días de uso ya causaron el gasto. La deuda con San Miguel queda pendiente.",
    "El mismo hecho del otro lado. El ingreso ya es suyo y falta cobrarlo.",
  ]);
  assert.equal(A5.ACT5_T3.consigna, "Lee el hecho. Arma el asiento y escribe el valor del periodo.");
  assert.deepEqual(A5.PASOS_ACT5, ["Mira cuánto se pagó o se recibió y por cuántos meses.", "Calcula cuánto le toca a este periodo.", "Pon un nombre en cada cuenta y escribe el valor."]);
  assert.deepEqual(A5.ITEMS_ACT5.map((x) => x.hecho), [
    "Mónica Galindo cierra el 31 de diciembre. Seguro de cinco años por $480.000, comprado el 1 de marzo",
    "Mónica Galindo cierra el 31 de diciembre. Alquiler de equipos: $1.080.000 por seis meses, desde el 1 de agosto",
    "Mónica Galindo cierra el 31 de diciembre. Arriendo recibido por un año a $160.000 al mes, desde el 1 de junio",
    "Mónica Galindo cierra el 31 de diciembre. El 10 de septiembre recibió $830.000 por servicios que prestaría después. Al cierre ya se causaron $386.000 de ese valor.",
    "Servicios del Caribe cierra el 31 de marzo. El 15 de marzo recibió $500.000 por servicios futuros. Al cierre ya se causaron $120.000 de ese valor.",
    "San Calixto cierra el 30 de junio. Arriendo de $15.000 por tres meses, pagado el 1 de junio",
    "Arriendos de la Costa cierra el 30 de junio. Arriendo de $15.000 por tres meses, recibido el 1 de junio",
  ]);
  assert.equal(A5.ITEMS_ACT5[3].acierto, "Ya se causaron $386.000: esa parte deja de ser lo recibido por anticipado y pasa a ser ingreso.");
  assert.equal(A5.ITEMS_ACT5[4].acierto, "Ya se causaron $120.000: esa parte deja de ser lo recibido por anticipado y pasa a ser ingreso.");
  assert.deepEqual(A4.ERRORES_ACT4, {
    A: "Las dos cuentas son las correctas, pero quedaron al revés. Mira el ▲ de cada una.",
    B: "Esa cuenta no se mueve en este hecho. Un gasto que falta por pagar toca un gasto y una deuda.",
    C: "Esa cuenta no se mueve en este hecho. Un ingreso que falta por cobrar toca algo por cobrar y un ingreso.",
    D: "Las dos fichas quedaron del mismo lado. El asiento pone una en el debe y otra en el haber.",
  });
  assert.deepEqual(A5.ERRORES_ACT5, {
    A: "Las dos cuentas son las correctas, pero quedaron al revés. Mira el ▲ de cada una.",
    B_CALCULA: "Ese valor no es el del periodo. Divide el total entre los meses y multiplica por los que ya pasaron.",
    B_DADO: "El libro da el valor del periodo: ya está en el hecho. Escríbelo tal cual.",
    C: "Esa cuenta no se mueve. Un pago por anticipado toca un gasto y lo que quedaba pagado.",
    D: "Esa cuenta no se mueve. Un cobro por anticipado toca lo que quedaba por cumplir y un ingreso.",
  });
});

/* ═══════════════════ LA SALVAGUARDA (Levi) ═══════════════════ */

test("★★★ SALVAGUARDA: todo ítem con valor dado tiene ese valor escrito en el texto del hecho", () => {
  /*
   * Recorre todos los bancos de datos del Tema 3: cualquier ítem marcado
   * `dado` —el estudiante escribe un valor que el libro da— tiene que traer
   * esa cifra en su hecho, tal como se escribe. Así no vuelve a pasar que
   * el hecho anuncie el valor y no lo diga.
   */
  const dir = new URL("../../data/", import.meta.url);
  const modulos = readdirSync(dir).filter((f) => /^contabilidadTema3.*\.js$/.test(f));
  const bancos = [];
  for (const m of modulos) {
    const mod = await_(m);
    for (const [nombre, v] of Object.entries(mod)) {
      if (Array.isArray(v) && v.some((x) => x && typeof x === "object" && "hecho" in x)) bancos.push([`${m} · ${nombre}`, v]);
      else if (v && typeof v === "object" && "hecho" in v) bancos.push([`${m} · ${nombre}`, [v]]);
    }
  }
  assert.ok(bancos.length >= 6, "no encontró los bancos");
  let dados = 0;
  for (const [donde, items] of bancos) {
    for (const it of items.filter((x) => x.dado === true)) {
      dados += 1;
      assert.ok(it.hecho.includes(pesos(it.valor)), `${donde} · ${it.id}: el valor dado ${pesos(it.valor)} no está en el hecho`);
    }
  }
  assert.equal(dados, 2, "los dos ítems con monto dado de la act. 5");
  /* Y los que se calculan traen en el hecho lo necesario para calcular: el total (o lo de cada mes). */
  for (const it of [...A5.ITEMS_ACT5, A5.EJEMPLO_ACT5].filter((x) => !x.dado)) {
    const mensual = it.reparto.total / it.reparto.meses;
    assert.ok(it.hecho.includes(pesos(it.reparto.total)) || it.hecho.includes(pesos(mensual)), `${it.id}: falta el total`);
  }
});
test("★★ en la act. 4 el valor dado va en la ficha, a la vista", async () => {
  for (const it of A4.ITEMS_ACT4.slice(0, 2)) {
    const m = await montar(ArmaElAjusteAcumulado, { items: [it] });
    try {
      await clic(q(m.caja, `[data-nombre="${it.debe}"]`)); await clic(q(m.caja, '[data-destino="nombre:0"]'));
      await clic(q(m.caja, `[data-nombre="${it.haber}"]`)); await clic(q(m.caja, '[data-destino="nombre:1"]'));
      assert.equal(q(m.caja, '[data-ficha-valor="0"]').textContent, pesos(it.valor));
    } finally { m.desmontar(); }
  }
});

/* ═══════════════════ LOS ERRORES ═══════════════════ */

test("★★★ act. 4: el tipo de error de cada equivocación (A a D) y su prioridad", () => {
  const gasto = A4.ITEMS_ACT4[0];
  const ingreso = A4.ITEMS_ACT4[3];
  const ev = (it, a, b) => L.evaluarAct4(it, [a, b]);
  /* A: las dos correctas, al revés. */
  assert.equal(ev(gasto, { cuenta: gasto.debe, lado: HABER }, { cuenta: gasto.haber, lado: DEBE }).caso, "A");
  /* B: cuenta errada en un gasto; C: en un ingreso. */
  assert.equal(ev(gasto, { cuenta: gasto.debe, lado: DEBE }, { cuenta: "Ingresos por servicios", lado: HABER }).caso, "B");
  assert.equal(ev(ingreso, { cuenta: "Gasto salarios", lado: DEBE }, { cuenta: ingreso.haber, lado: HABER }).caso, "C");
  /* D: las dos fichas del mismo lado, y manda sobre una cuenta errada. */
  assert.equal(ev(gasto, { cuenta: gasto.debe, lado: DEBE }, { cuenta: gasto.haber, lado: DEBE }).caso, "D");
  assert.equal(ev(gasto, { cuenta: gasto.debe, lado: DEBE }, { cuenta: "Ingresos por servicios", lado: DEBE }).caso, "D");
  /* Con error, primero el caso y después el acierto del ítem. */
  const r = ev(gasto, { cuenta: gasto.debe, lado: HABER }, { cuenta: gasto.haber, lado: DEBE });
  assert.deepEqual(r.textos, [A4.ERRORES_ACT4.A, gasto.acierto]);
  assert.equal(r.cuadra, true, "al revés también cuadra: el arco cierra");
  assert.equal(ev(gasto, { cuenta: gasto.debe, lado: DEBE }, { cuenta: gasto.haber, lado: DEBE }).cuadra, false);
});

test("★★★ act. 5: errores A a D; el valor se compara exacto; B según sea dado o calculado", () => {
  const pago = A5.ITEMS_ACT5[0];
  const cobro = A5.ITEMS_ACT5[2];
  const dado = A5.ITEMS_ACT5[3];
  const ev = (it, a, b) => L.evaluarAct5(it, [a, b]);
  const bien = (it, v0 = it.valor, v1 = it.valor) => [{ cuenta: it.debe, lado: DEBE, valor: v0 }, { cuenta: it.haber, lado: HABER, valor: v1 }];
  assert.equal(ev(pago, { cuenta: pago.debe, lado: HABER, valor: 80000 }, { cuenta: pago.haber, lado: DEBE, valor: 80000 }).caso, "A");
  assert.equal(ev(pago, { cuenta: pago.debe, lado: DEBE, valor: 80000 }, { cuenta: "Ingresos por arriendos", lado: HABER, valor: 80000 }).caso, "C");
  assert.equal(ev(cobro, { cuenta: "Gasto seguros", lado: DEBE, valor: 1120000 }, { cuenta: cobro.haber, lado: HABER, valor: 1120000 }).caso, "D");
  /* Exacto: un peso de más es B. */
  const b1 = L.evaluarAct5(pago, bien(pago, 80001, 80001));
  assert.equal(b1.caso, "B");
  assert.deepEqual(b1.textos, ["Ese valor no es el del periodo. Divide el total entre los meses y multiplica por los que ya pasaron."]);
  /* B en un ítem con monto dado: el texto de Levi, y después el acierto. */
  const b2 = L.evaluarAct5(dado, bien(dado, 830000, 830000));
  assert.equal(b2.caso, "B");
  assert.deepEqual(b2.textos, ["El libro da el valor del periodo: ya está en el hecho. Escríbelo tal cual.", dado.acierto]);
  /* Un solo monto mal: B, y el arco queda abierto porque no coinciden. */
  const b3 = L.evaluarAct5(pago, bien(pago, 80000, 8000));
  assert.equal(b3.caso, "B");
  assert.equal(b3.cuadra, false);
  assert.deepEqual(b3.valoresOk, [true, false]);
  /* La cuenta errada manda sobre el valor. */
  assert.equal(ev(pago, { cuenta: pago.debe, lado: DEBE, valor: 1 }, { cuenta: "Ingresos por arriendos", lado: HABER, valor: 1 }).caso, "C");
  assert.equal(L.evaluarAct5(pago, bien(pago)).cuadra, true);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★★ act. 4 en pantalla: nombres, fichas y lados; al confirmar, las tres señales y el texto", async () => {
  const it = A4.ITEMS_ACT4[0];
  const m = await montar(ArmaElAjusteAcumulado, { items: [it] });
  try {
    assert.equal(q(m.caja, "[data-confirmar]").disabled, true);
    assert.equal(m.caja.querySelectorAll("[data-banco] [data-nombre]").length, 6);
    await armar(m.caja, [it.debe, DEBE], [it.haber, HABER]);
    assert.equal(q(m.caja, "[data-panel]").dataset.panel, "acierto");
    assert.deepEqual(textosRetro(m.caja), [it.acierto]);
    assert.equal(q(m.caja, "[data-arco]").dataset.arco, "cerrado");
    assert.ok(q(m.caja, '[data-cuenta-t="0"] [data-triangulo="debe"]'));
    assert.ok(q(m.caja, '[data-cuenta-t="1"] [data-triangulo="haber"]'));
    assert.deepEqual([...m.caja.querySelectorAll("[data-frase]")].map((x) => x.textContent), ["Salarios acumulados", "por pagar"]);
  } finally { m.desmontar(); }
});

test("★★★ act. 4 en pantalla: el error D deja el arco abierto y muestra caso + acierto", async () => {
  const it = A4.ITEMS_ACT4[5];
  const m = await montar(ArmaElAjusteAcumulado, { items: [it] });
  try {
    await armar(m.caja, [it.debe, DEBE], [it.haber, DEBE]);
    assert.equal(q(m.caja, "[data-panel]").dataset.caso, "D");
    assert.equal(q(m.caja, "[data-arco]").dataset.arco, "abierto");
    assert.deepEqual(textosRetro(m.caja), [A4.ERRORES_ACT4.D, it.acierto]);
  } finally { m.desmontar(); }
});

test("★★★ act. 5 en pantalla: campo con punto de miles, «$1.120.000» cabe, un lado por cuenta, B del dado", async () => {
  const it = A5.ITEMS_ACT5[2];
  const m = await montar(ArmaElAjusteDiferido, { items: [it] });
  try {
    await clic(q(m.caja, `[data-nombre="${it.debe}"]`)); await clic(q(m.caja, '[data-destino="nombre:0"]'));
    await clic(q(m.caja, `[data-nombre="${it.haber}"]`)); await clic(q(m.caja, '[data-destino="nombre:1"]'));
    await escribir(q(m.caja, '[data-campo-valor="0"]'), "1120000");
    assert.equal(q(m.caja, '[data-campo-valor="0"]').value, "1.120.000");
    await escribir(q(m.caja, '[data-campo-valor="1"]'), "1120000");
    await clic(q(m.caja, '[data-ficha-valor="0"]')); await clic(q(m.caja, '[data-destino="0:debe"]'));
    /* La otra cuenta no puede ocupar el debe: ya lo tiene la primera. */
    await clic(q(m.caja, '[data-ficha-valor="1"]'));
    assert.equal(q(m.caja, '[data-destino="1:debe"]'), null);
    assert.ok(q(m.caja, '[data-destino="1:haber"]'));
    await clic(q(m.caja, '[data-destino="1:haber"]'));
    assert.equal(q(m.caja, '[data-cuenta-t="0"] [data-valor="debe"]').textContent, "$1.120.000");
    await clic(q(m.caja, "[data-confirmar]"));
    assert.equal(q(m.caja, "[data-panel]").dataset.panel, "acierto");
    /* Gen no trajo acierto para este ítem: el panel no inventa texto. */
    assert.deepEqual(textosRetro(m.caja), []);
    assert.equal(q(m.caja, "[data-arco]").dataset.arco, "cerrado");
  } finally { m.desmontar(); }
  const d = A5.ITEMS_ACT5[4];
  const n = await montar(ArmaElAjusteDiferido, { items: [d] });
  try {
    await armar(n.caja, [d.debe, DEBE, 500000], [d.haber, HABER, 500000]);
    assert.equal(q(n.caja, "[data-panel]").dataset.caso, "B");
    assert.deepEqual(textosRetro(n.caja), [A5.ERRORES_ACT5.B_DADO, d.acierto]);
    assert.equal(q(n.caja, '[data-campo-valor="0"]').getAttribute("aria-invalid"), "true");
  } finally { n.desmontar(); }
});

test("★★ la tanda de la act. 4: siete ítems, «Siguiente ítem» y al final «Ver mi resumen»", async () => {
  let fin = null;
  const m = await montar(ArmaElAjusteAcumulado, { onCompletar: (pct, ms, detalle) => { fin = { pct, detalle }; } });
  try {
    for (const [k, it] of A4.ITEMS_ACT4.entries()) {
      const lados = k === 0 ? [HABER, DEBE] : [DEBE, HABER];
      await armar(m.caja, [it.debe, lados[0]], [it.haber, lados[1]]);
      const boton = [...m.caja.querySelectorAll("button")].find((b) => /Siguiente ítem|Ver mi resumen/.test(b.textContent));
      assert.equal(boton.textContent, k === 6 ? "Ver mi resumen" : "Siguiente ítem");
      await clic(boton);
    }
    assert.equal(Math.round(fin.pct), Math.round((6 / 7) * 100));
    assert.equal(fin.detalle[0].respuesta, "A");
  } finally { m.desmontar(); }
});

/* ═══════════════════ LOS TUTORIALES ═══════════════════ */

test("★★★ los dos tutoriales: el componente de siempre con las panaderías de Gen; el guion las resuelve", async () => {
  const casos = [
    ["t3-ajuste-acumulado", ArmaElAjusteAcumulado, A4.EJEMPLO_ACT4, A4.ALT_TUTORIAL_ACT4, A4.PASOS_ACT4,
      "Una panadería. Debe $300.000 de luz de diciembre y la factura llega en enero.",
      "El servicio ya se consumió en diciembre. La factura llega después, así que queda como deuda."],
    ["t3-ajuste-diferido", ArmaElAjusteDiferido, A5.EJEMPLO_ACT5, A5.ALT_TUTORIAL_ACT5, A5.PASOS_ACT5,
      "Una panadería cierra el 31 de diciembre. Pagó $1.200.000 por un año de seguro el 1 de julio.",
      "De doce meses ya pasaron seis. Al periodo le toca la mitad: $600.000."],
  ];
  for (const [id, Comp, ej, alt, pasos, hecho, resolucion] of casos) {
    const asi = ASI_SE_JUEGA[id];
    assert.ok(asi, `${id}: no hay «Así se juega»`);
    assert.deepEqual(asi.pasos, pasos);
    assert.equal(`Ejemplo: ${asi.alt}`, alt);
    assert.equal(ej.hecho, hecho);
    assert.equal(ej.acierto, resolucion);
    const m = await montar(Comp, { items: [ej], modoDemo: true });
    try {
      for (const t of asi.guion.toques) {
        const el = q(m.caja, t.en);
        assert.ok(el && !el.disabled, `${id}: ${t.en} no está o está apagado`);
        if (t.escribe) await escribir(el, t.escribe);
        else await clic(el);
      }
      assert.deepEqual(textosRetro(m.caja), [resolucion], id);
      assert.equal(q(m.caja, "[data-arco]").dataset.arco, "cerrado");
    } finally { m.desmontar(); }
  }
  assert.equal(`Ejemplo: ${ASI_SE_JUEGA["t3-ajuste-acumulado"].alt}`, "Ejemplo: se pone Gasto servicios públicos en la cuenta del debe y Servicios públicos por pagar en la del haber, con $300.000 en cada lado.");
  assert.equal(`Ejemplo: ${ASI_SE_JUEGA["t3-ajuste-diferido"].alt}`, "Ejemplo: se pone Gasto seguros en la cuenta del debe. Seguros pagados por anticipado va en la del haber. Se escribe $600.000.");
});

/* ═══════════════════ DATOS SANOS ═══════════════════ */

test("★★ los anclajes son trozos literales del hecho, y los señuelos salen del mismo banco", () => {
  for (const it of [...A4.ITEMS_ACT4, A4.EJEMPLO_ACT4, ...A5.ITEMS_ACT5, A5.EJEMPLO_ACT5]) {
    for (const cuenta of [it.debe, it.haber]) assert.ok(it.hecho.includes(it.anclajes[cuenta]), `${it.id} · ${cuenta}`);
  }
  for (const [items, tipos] of [[A4.ITEMS_ACT4, A4.TIPOS_ACT4], [A5.ITEMS_ACT5, A5.TIPOS_ACT5]]) {
    const universo = L.universoDe(items);
    for (const it of items) {
      const banco = L.bancoDe(it, universo);
      assert.equal(banco.length, 6);
      assert.ok(banco.includes(it.debe) && banco.includes(it.haber));
      for (const c of banco) assert.ok(universo.includes(c) && tipos[c], c);
    }
  }
});

/* ═══════════════════ EL REGISTRO ═══════════════════ */

test("★★ en el camino: la 4 detrás de «¿Cuándo se causa?» y la 5 delante de «¿Qué le toca…?»; catálogo, reglas y migración", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  const i = (id) => ids.indexOf(id);
  assert.ok(i("t3-ajuste-acumulado") > i("t3-a3-lo-que-ya-paso"));
  assert.ok(i("t3-ajuste-acumulado") > i("t3-cuando-se-causa"));
  assert.ok(i("t3-ajuste-diferido") > i("t3-a4-lo-que-ya-se-pago"));
  assert.ok(i("t3-ajuste-diferido") < i("t3-que-le-toca"));
  const hacer = tema.actividades.filter((a) => a.clasificacion.tipo === HACER).map((a) => a.id);
  assert.deepEqual(hacer, ["t3-ingreso-o-cobro", "t3-cuando-se-causa", "t3-ajuste-acumulado", "t3-ajuste-diferido", "t3-que-le-toca"]);
  assert.deepEqual(tema.actividades[i("t3-ajuste-acumulado")].clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.deepEqual(tema.actividades[i("t3-ajuste-diferido")].clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.deepEqual(JUEGOS.map((j) => j.id), hacer);
  assert.equal(REGLAS["t3-ajuste-acumulado"]("t3a4-maquina-san-miguel"), "San Miguel · Cinco días de máquina prestada, sin cobrar");
  assert.equal(REGLAS["t3-ajuste-diferido"]("t3a5-servicios-caribe"), `Servicios del Caribe · ${A5.ITEMS_ACT5[4].hecho}`);
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  assert.match(sql, /\('t3-ajuste-acumulado',\s*'contabilidad',\s*'ingresos-gastos-y-caja',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(sql, /\('t3-ajuste-diferido',\s*'contabilidad',\s*'ingresos-gastos-y-caja',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
});

test("★★★ grep: ni «adelantado», ni «devengaron», ni «corrió», ni «Interés por cobrar»; #B8C4D4 nunca es texto", () => {
  const archivos = [
    "../../data/contabilidadTema3Act4.js", "../../data/contabilidadTema3Act5.js", "../armaElAjuste.js",
    "../../components/mecanicas/libros/tema3/ArmaElAjuste.jsx", "../../data/asiSeJuegaTema3.js",
  ];
  for (const a of archivos) {
    const fuente = readFileSync(new URL(a, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /adelantad|devengaron|corri[óo]|Inter[ée]s por cobrar/iu, a);
    assert.doesNotMatch(fuente, /\bcolor:\s*(COLOR\.neutro|NEUTRO|["']#B8C4D4)/i, `${a}: #B8C4D4 como texto`);
  }
});

/* ═══════════════════ REGRESIÓN: TOQUES MÁS RÁPIDOS QUE EL PINTADO ═══════════════════ */

test("★★★ dos toques seguidos antes de que se pinte: cada cuenta recibe el nombre que se tocó", async () => {
  const it = A4.ITEMS_ACT4[0];
  const m = await montar(ArmaElAjusteAcumulado, { items: [it] });
  try {
    await clic(q(m.caja, `[data-nombre="${it.debe}"]`));
    const destino0 = q(m.caja, '[data-destino="nombre:0"]');
    const destino1 = q(m.caja, '[data-destino="nombre:1"]');
    const chipHaber = q(m.caja, `[data-nombre="${it.haber}"]`);
    /* Los tres toques en el mismo turno, sobre lo que ya estaba pintado. */
    await act(async () => { destino0.click(); chipHaber.click(); destino1.click(); });
    assert.deepEqual([...m.caja.querySelectorAll("[data-nombre-puesto]")].map((x) => x.textContent), [it.debe, it.haber]);
  } finally { m.desmontar(); }
});

test("★★★ los dos tutoriales con movimiento reducido: el último cuadro deja el asiento correcto", async () => {
  REDUCIDO = true;
  try {
    for (const [id, Comp] of [["t3-ajuste-acumulado", ArmaElAjusteAcumulado], ["t3-ajuste-diferido", ArmaElAjusteDiferido]]) {
      const asi = ASI_SE_JUEGA[id];
      const caja = document.createElement("div");
      document.body.appendChild(caja);
      const raiz = createRoot(caja);
      await act(async () => { raiz.render(h(AsiSeJuega, { asi, Mecanica: Comp, onSiguiente: () => {} })); });
      try {
        for (let k = 0; k < 2; k++) {
          const boton = [...caja.querySelectorAll("button")].find((b) => b.textContent === "Siguiente cuadro");
          await clic(boton);
          for (let n = 0; n < 30; n++) await act(async () => { await new Promise((ok) => setTimeout(ok, 60)); });
        }
        assert.deepEqual([...caja.querySelectorAll("[data-nombre-puesto]")].map((x) => x.textContent), [asi.demo.items[0].debe, asi.demo.items[0].haber], id);
        assert.deepEqual(textosRetro(caja), [asi.demo.items[0].acierto], id);
        assert.equal(q(caja, "[data-arco]").dataset.arco, "cerrado", id);
      } finally { act(() => raiz.unmount()); caja.remove(); }
    }
  } finally { REDUCIDO = false; }
});
