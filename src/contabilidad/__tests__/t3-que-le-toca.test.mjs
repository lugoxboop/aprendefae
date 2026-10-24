import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 6 — «¿Qué le toca a este periodo?» (paquete de Levi).
 *
 *   · para cada ítem: el mes correcto del corte (10, 5, 7, 1 y 1) y las dos
 *     cifras exactas
 *   · el orden de evaluación A → acierto → C → D → B, con un caso de cada uno
 *   · corte mal y cifras bien: solo el corte se marca como error
 *   · el corte va de 1 a N−1; el seguro tiene 60 meses y se rotula por años
 *   · campos: punto de miles automático, sin decimales, máximo 7 dígitos
 *   · teclado: flechas 1 mes, Re Pág / Av Pág 12
 *   · la barra con el vocabulario de la pieza 3, según el tipo del ítem
 *   · textos de Gen, textuales; tutorial de la panadería
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const A6 = await import("../../data/contabilidadTema3Act6.js");
const L = await import("../queLeToca.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { default: QueLeToca } = await import("../../components/mecanicas/libros/tema3/QueLeToca.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { REGLAS } = await import("../../docente/etiquetasItem.js");

const { ITEMS_ACT6, CASO_A, CASO_B, CASO_C, CASO_D, ERROR_POR_CASO, PAGO, COBRO } = A6;
const Marco = ({ children }) => h("div", null, children);
const porId = (id) => ITEMS_ACT6.find((x) => x.id === id);

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(QueLeToca, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => { await act(async () => { el.click(); }); };
const escribir = async (el, texto) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(el, texto);
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};
const tecla = async (el, key) => { await act(async () => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); }); };
const textosRetro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const comprobar = (caja) => caja.querySelector("[data-comprobar]");

/* Juega el ítem en pantalla: pone el corte con el teclado y escribe las dos cifras. */
const jugar = async (caja, { corte, alPeriodo, queda }) => {
  const asa = caja.querySelector("[data-asa]");
  await tecla(asa, "Home");
  for (let k = 1; k < corte; k++) await tecla(asa, "ArrowRight");
  await escribir(caja.querySelector('[data-campo="alPeriodo"]'), String(alPeriodo));
  await escribir(caja.querySelector('[data-campo="queda"]'), String(queda));
  await clic(comprobar(caja));
};

/* ═══════════════════ EL BANCO ═══════════════════ */

test("★★★ para cada ítem: el mes correcto del corte (10, 5, 7, 1 y 1) y las dos cifras exactas", () => {
  const esperado = [
    ["t3a6-seguro", 10, "Diciembre", 80000, 400000, PAGO],
    ["t3a6-equipos", 5, "Diciembre", 900000, 180000, PAGO],
    ["t3a6-arriendo", 7, "Diciembre", 1120000, 800000, COBRO],
    ["t3a6-san-calixto", 1, "Junio", 5000, 10000, PAGO],
    ["t3a6-costa", 1, "Junio", 5000, 10000, COBRO],
  ];
  assert.deepEqual(ITEMS_ACT6.map((x) => x.id), esperado.map((e) => e[0]));
  for (const [id, corte, mes, alPeriodo, queda, tipo] of esperado) {
    const it = porId(id);
    assert.equal(it.corte, corte, id);
    assert.equal(L.mesLargoDelCorte(it, it.corte), mes, id);
    assert.equal(it.alPeriodo, alPeriodo, id);
    assert.equal(it.queda, queda, id);
    assert.equal(it.tipo, tipo, id);
    /* El reparto de Gen: el total entre los meses, por los meses que pasaron. */
    assert.equal(it.total / it.meses * it.corte, it.alPeriodo, `${id}: reparto`);
    assert.equal(it.alPeriodo + it.queda, it.total, `${id}: suma`);
    assert.ok(L.evaluarAct6(it, it).ok, `${id}: su propia respuesta`);
  }
  /* El ítem 3 no da el total: 12 × $160.000. */
  assert.equal(porId("t3a6-arriendo").total, 1920000);
});

test("★★★ los textos de Gen, textuales: consigna, pasos, hechos, pies, aciertos y errores", () => {
  assert.equal(A6.ACT6_T3.consigna, "Lee el hecho. Marca el corte y escribe las dos cifras.");
  assert.deepEqual(A6.PASOS_ACT6, [
    "Mira cuánto se pagó o se recibió y por cuántos meses.",
    "Marca el corte en el mes en que cierra la empresa.",
    "Escribe cuánto le toca al periodo y cuánto queda.",
  ]);
  assert.deepEqual(ITEMS_ACT6.map((x) => [x.empresa, x.hecho, x.pie, x.acierto]), [
    ["Mónica Galindo", "Seguro de cinco años por $480.000, comprado el 1 de marzo. Cierra el 31 de diciembre.", "Basado en el libro, p. 173", "Pasaron 10 de 60 meses. Al periodo le toca $80.000 y quedan $400.000 de seguro por usar."],
    ["Mónica Galindo", "Alquiler de equipos por $1.080.000, pagado el 1 de agosto por seis meses. Cierra el 31 de diciembre.", "Basado en el libro, p. 173", "Pasaron 5 de 6 meses. Al periodo le toca $900.000 y queda un mes sin usar."],
    ["Mónica Galindo", "Arriendo recibido por un año a $160.000 al mes, desde el 1 de junio. Cierra el 31 de diciembre.", "Basado en el libro, p. 173", "Pasaron 7 de 12 meses. Al periodo le toca $1.120.000 y quedan $800.000 por cumplir."],
    ["San Calixto", "Arriendo de $15.000 pagado el 1 de junio por tres meses. Cierra el 30 de junio.", "Libro, pp. 143-144", "Pasó 1 de 3 meses. Al periodo le toca $5.000 y quedan $10.000 de local por usar."],
    ["Arriendos de la Costa", "Arriendo de $15.000 recibido el 1 de junio por tres meses. Cierra el 30 de junio.", "Libro, p. 146", "Pasó 1 de 3 meses. Al periodo le toca $5.000 y quedan $10.000 por cumplir."],
  ]);
  assert.deepEqual(ERROR_POR_CASO, {
    A: "El corte no está en el mes del cierre. Mira la fecha en que la empresa cierra sus libros.",
    B: "Las dos cifras suman bien, pero no son las del hecho. Divide el total entre los meses.",
    C: "Esa es la cifra que queda, no la del periodo. Van en el otro orden.",
    D: "Las dos cifras no suman el total. Lo que le toca al periodo más lo que queda da el total.",
  });
});

/* ═══════════════════ LA EVALUACIÓN ═══════════════════ */

test("★★★ el orden A → acierto → C → D → B, con un caso de cada uno", () => {
  const sc = porId("t3a6-san-calixto");
  const caso = (corte, alPeriodo, queda) => L.evaluarAct6(sc, { corte, alPeriodo, queda });
  /* A: el corte está mal (y gana a todo lo demás, aun con las cifras al revés). */
  assert.equal(caso(2, 9999, 1).caso, CASO_A);
  assert.equal(caso(2, 10000, 5000).caso, CASO_A);
  /* Acierto. */
  const ok = caso(1, 5000, 10000);
  assert.equal(ok.ok, true);
  assert.equal(ok.caso, null);
  assert.deepEqual(ok.textos, [sc.acierto]);
  /* C: las dos cifras intercambiadas. */
  assert.equal(caso(1, 10000, 5000).caso, CASO_C);
  /* D: no suman el total. */
  assert.equal(caso(1, 5000, 9000).caso, CASO_D);
  /* B: suman el total, pero no son las del hecho. */
  assert.equal(caso(1, 7500, 7500).caso, CASO_B);
  /* Con error, primero el caso y después el acierto del ítem. */
  for (const [r, c] of [[caso(2, 1, 1), CASO_A], [caso(1, 10000, 5000), CASO_C], [caso(1, 1, 1), CASO_D], [caso(1, 7500, 7500), CASO_B]]) {
    assert.equal(r.ok, false);
    assert.deepEqual(r.textos, [ERROR_POR_CASO[c], sc.acierto]);
  }
});

test("★★★ corte mal y cifras bien: solo el corte se marca como error", async () => {
  const seguro = porId("t3a6-seguro");
  const r = L.evaluarAct6(seguro, { corte: 9, alPeriodo: 80000, queda: 400000 });
  assert.equal(r.caso, CASO_A);
  assert.equal(r.corteOk, false);
  assert.deepEqual(r.campos, { alPeriodo: true, queda: true });
  /* En pantalla: los campos quedan como acierto, el corte y su asa en coral, y el correcto aparece fantasma. */
  const m = await montar({ items: [seguro] });
  try {
    await jugar(m.caja, { corte: 9, alPeriodo: 80000, queda: 400000 });
    assert.equal(m.caja.querySelector('[data-campo-caja="alPeriodo"]').dataset.estadoCampo, "acierto");
    assert.equal(m.caja.querySelector('[data-campo-caja="queda"]').dataset.estadoCampo, "acierto");
    assert.equal(m.caja.querySelectorAll('[data-insignia="visto"]').length, 2);
    assert.equal(m.caja.querySelector("[data-valor-correcto]"), null);
    assert.ok(m.caja.querySelector("[data-linea-correcta]"), "falta el corte correcto fantasma");
    /* Una sola bandera visible: la del corte puesto (Levi). */
    assert.equal(m.caja.querySelector("[data-bandera-correcta]"), null);
    assert.equal(m.caja.querySelectorAll("[data-barra] [data-bandera]").length, 1);
    assert.equal(m.caja.querySelector("[data-bandera]").textContent, "Cierre · Nov · año 1");
    assert.equal(m.caja.querySelector("[data-panel]").dataset.caso, "A");
    assert.deepEqual(textosRetro(m.caja), [ERROR_POR_CASO.A, seguro.acierto]);
  } finally { m.desmontar(); }
});

test("★★★ error en una cifra: borde coral, × y el valor correcto en una ficha", async () => {
  const eq = porId("t3a6-equipos");
  const m = await montar({ items: [eq] });
  try {
    await jugar(m.caja, { corte: 5, alPeriodo: 180000, queda: 900000 });
    assert.equal(m.caja.querySelector("[data-panel]").dataset.caso, "C");
    assert.equal(m.caja.querySelectorAll('[data-insignia="equis"]').length, 2);
    assert.deepEqual([...m.caja.querySelectorAll("[data-valor-correcto]")].map((x) => x.textContent), ["$900.000", "$180.000"]);
    assert.equal(m.caja.querySelector("[data-linea-correcta]"), null, "el corte estaba bien");
  } finally { m.desmontar(); }
});

/* ═══════════════════ EL CORTE ═══════════════════ */

test("★★★ el corte va de 1 a N−1 meses", () => {
  for (const it of ITEMS_ACT6) {
    assert.deepEqual(L.rangoCorte(it), { min: 1, max: it.meses - 1 });
    assert.equal(L.acotar(it, 0), 1);
    assert.equal(L.acotar(it, it.meses), it.meses - 1);
    assert.equal(L.acotar(it, -5), 1);
    assert.equal(L.acotar(it, 99), it.meses - 1);
  }
});

test("★★★ teclado: flechas 1 mes, Re Pág / Av Pág 12, Inicio y Fin", async () => {
  const seguro = porId("t3a6-seguro");
  assert.equal(L.corteConTecla(seguro, null, "ArrowRight"), 1);
  assert.equal(L.corteConTecla(seguro, 10, "ArrowRight"), 11);
  assert.equal(L.corteConTecla(seguro, 10, "ArrowLeft"), 9);
  assert.equal(L.corteConTecla(seguro, 10, "PageUp"), 22);
  assert.equal(L.corteConTecla(seguro, 22, "PageDown"), 10);
  assert.equal(L.corteConTecla(seguro, 5, "PageDown"), 1);
  assert.equal(L.corteConTecla(seguro, 55, "PageUp"), 59);
  assert.equal(L.corteConTecla(seguro, 30, "Home"), 1);
  assert.equal(L.corteConTecla(seguro, 30, "End"), 59);
  assert.equal(L.corteConTecla(seguro, 30, "a"), null);
  /* En pantalla, sobre el slider. */
  const m = await montar({ items: [seguro] });
  try {
    const asa = m.caja.querySelector('[role="slider"]');
    assert.equal(asa.getAttribute("aria-valuemin"), "1");
    assert.equal(asa.getAttribute("aria-valuemax"), "59");
    await tecla(asa, "PageUp");
    assert.equal(asa.getAttribute("aria-valuenow"), "12");
    await tecla(asa, "ArrowLeft"); await tecla(asa, "ArrowLeft");
    assert.equal(asa.getAttribute("aria-valuenow"), "10");
    assert.equal(asa.getAttribute("aria-valuetext"), "Cierre al final de diciembre del año 1");
    assert.equal(m.caja.querySelector("[data-bandera]").textContent, "Cierre · Dic · año 1");
  } finally { m.desmontar(); }
});

test("★★★ el seguro tiene 60 meses y se rotula por años; los demás, por el ancho de la celda", () => {
  const seguro = porId("t3a6-seguro");
  for (const ancho of [275, 220]) {
    const r = L.rotulosDeBarra(seguro, ancho);
    assert.equal(r.porAnios, true);
    assert.deepEqual(r.etiquetas.map((e) => e.texto), ["Año 1", "Año 2", "Año 3", "Año 4", "Año 5"]);
    assert.deepEqual(r.marcas.map((x) => [x.en, x.gruesa]), [[12, true], [24, true], [36, true], [48, true]]);
    assert.equal(L.tocableDirecto(seguro, ancho), false);
  }
  /* Equipos: celdas de 45,8 / 36,7 px → 3 letras, cada mes. Toque directo solo a 375. */
  const eq = porId("t3a6-equipos");
  assert.deepEqual(L.rotulosDeBarra(eq, 275).etiquetas.map((e) => e.texto), ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene"]);
  assert.deepEqual(L.rotulosDeBarra(eq, 220).etiquetas.map((e) => e.texto), ["Ago", "Sep", "Oct", "Nov", "Dic", "Ene"]);
  assert.equal(L.tocableDirecto(eq, 275), true);
  assert.equal(L.tocableDirecto(eq, 220), false);
  /* Arriendo: < 30 px y 12 meses → 3 letras cada 3 meses. */
  assert.deepEqual(L.rotulosDeBarra(porId("t3a6-arriendo"), 275).etiquetas.map((e) => e.texto), ["Jun", "Sep", "Dic", "Mar"]);
  assert.equal(L.rotulosDeBarra(porId("t3a6-arriendo"), 275).marcas.length, 11);
  /* San Calixto: ≥ 56 px → nombre completo. */
  assert.deepEqual(L.rotulosDeBarra(porId("t3a6-san-calixto"), 275).etiquetas.map((e) => e.texto), ["Junio", "Julio", "Agosto"]);
  assert.equal(L.tocableDirecto(porId("t3a6-san-calixto"), 220), true);
});

/* ═══════════════════ LOS CAMPOS ═══════════════════ */

test("★★★ campos: punto de miles automático, sin decimales, máximo 7 dígitos", () => {
  assert.equal(L.formatearCampo("1120000"), "1.120.000");
  assert.equal(L.formatearCampo("80000"), "80.000");
  assert.equal(L.formatearCampo("5000"), "5.000");
  assert.equal(L.formatearCampo("999"), "999");
  assert.equal(L.formatearCampo("12345678"), "1.234.567", "máximo 7 dígitos");
  assert.equal(L.formatearCampo("12,5"), "125", "sin decimales");
  assert.equal(L.formatearCampo("1.000.000"), "1.000.000");
  assert.equal(L.formatearCampo("00012"), "12");
  assert.equal(L.formatearCampo("abc"), "");
  assert.equal(L.valorDeCampo("1.120.000"), 1120000);
  assert.equal(L.valorDeCampo(""), null);
});

test("★★★ en pantalla: bloqueados hasta que haya corte; el formato se aplica al escribir; «Comprobar» con todo", async () => {
  const sc = porId("t3a6-san-calixto");
  const m = await montar({ items: [sc] });
  try {
    const campo = m.caja.querySelector('[data-campo="alPeriodo"]');
    assert.equal(campo.getAttribute("aria-disabled"), "true");
    assert.equal(campo.readOnly, true);
    assert.equal(m.caja.querySelector("[data-pista]").textContent, "Marca el corte en el mes en que cierra la empresa.");
    assert.equal(comprobar(m.caja).disabled, true);
    assert.equal(m.caja.querySelector('[data-paso-corte="antes"]').disabled, true);
    await clic(m.caja.querySelector('[data-paso-corte="despues"]'));
    assert.equal(m.caja.querySelector("[data-asa]").getAttribute("aria-valuenow"), "1");
    assert.equal(m.caja.querySelector("[data-bandera]").textContent, "Cierre · Jun");
    assert.equal(campo.readOnly, false);
    assert.equal(m.caja.querySelector("[data-pista]").textContent, "Escribe cuánto le toca al periodo y cuánto queda.");
    /* San Calixto tiene 3 meses: el corte no pasa de 2. */
    await clic(m.caja.querySelector('[data-paso-corte="despues"]'));
    assert.equal(m.caja.querySelector('[data-paso-corte="despues"]').disabled, true);
    await clic(m.caja.querySelector('[data-paso-corte="antes"]'));
    await escribir(campo, "5000");
    assert.equal(campo.value, "5.000");
    assert.equal(comprobar(m.caja).disabled, true);
    await escribir(m.caja.querySelector('[data-campo="queda"]'), "10000");
    assert.equal(comprobar(m.caja).disabled, false);
    await clic(comprobar(m.caja));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.deepEqual(textosRetro(m.caja), [sc.acierto]);
    assert.equal(m.caja.querySelector("[data-comprobar]"), null);
  } finally { m.desmontar(); }
});

test("★★ el toque directo: solo con celdas de 44 px o más, y pone el corte al final de la celda", async () => {
  const sc = porId("t3a6-san-calixto");
  const m = await montar({ items: [sc] });
  try {
    const celdas = m.caja.querySelectorAll("[data-celda]");
    assert.equal(celdas.length, 3);
    await clic(celdas[1]);
    assert.equal(m.caja.querySelector("[data-asa]").getAttribute("aria-valuenow"), "2");
    /* La última celda acaba en el borde: el corte se queda en N−1. */
    await clic(celdas[2]);
    assert.equal(m.caja.querySelector("[data-asa]").getAttribute("aria-valuenow"), "2");
  } finally { m.desmontar(); }
  const s = await montar({ items: [porId("t3a6-seguro")] });
  try { assert.equal(s.caja.querySelectorAll("[data-celda]").length, 0, "el seguro no se toca por celda"); } finally { s.desmontar(); }
});

/* ═══════════════════ LA BARRA (Levi) ═══════════════════ */

test("★★★ la barra con el vocabulario de la pieza 3: fantasma al periodo; «Queda» sólido o discontinuo según el tipo", async () => {
  for (const [id, borde, fondo] of [["t3a6-san-calixto", "solid", true], ["t3a6-costa", "dashed", false]]) {
    const m = await montar({ items: [porId(id)] });
    try {
      await clic(m.caja.querySelector('[data-paso-corte="despues"]'));
      const periodo = m.caja.querySelector('[data-lado="al-periodo"]');
      const queda = m.caja.querySelector('[data-lado="queda"]');
      assert.match(periodo.style.border, /dashed/);
      assert.match(periodo.style.border, /rgb\(140, 155, 176\)|#8C9BB0/i);
      assert.match(queda.style.border, new RegExp(borde));
      assert.match(queda.style.border, /rgb\(184, 196, 212\)|#B8C4D4/i);
      assert.equal(/184, 196, 212|B8C4D4/i.test(queda.style.background), fondo, `${id}: relleno`);
      /* El cuadrito de cada campo copia el estilo de su lado. */
      assert.equal(m.caja.querySelector('[data-cuadrito="alPeriodo"]').style.border, periodo.style.border);
      assert.equal(m.caja.querySelector('[data-cuadrito="queda"]').style.border, queda.style.border);
      assert.equal(m.caja.querySelector('[data-cuadrito="queda"]').style.background, queda.style.background);
    } finally { m.desmontar(); }
  }
});

/* ═══════════════════ LA TANDA ═══════════════════ */

test("★★ la tanda entera: cinco ítems, uno de cada caso, «Siguiente ítem» y al final «Ver mi resumen»", async () => {
  let fin = null;
  const m = await montar({ onCompletar: (pct, ms, detalle) => { fin = { pct, detalle }; } });
  try {
    const jugadas = [
      { corte: 10, alPeriodo: 80000, queda: 400000 },
      { corte: 4, alPeriodo: 900000, queda: 180000 },
      { corte: 7, alPeriodo: 800000, queda: 1120000 },
      { corte: 1, alPeriodo: 5000, queda: 9000 },
      { corte: 1, alPeriodo: 7500, queda: 7500 },
    ];
    for (const [k, j] of jugadas.entries()) {
      await jugar(m.caja, j);
      const boton = [...m.caja.querySelectorAll("button")].find((b) => /Siguiente ítem|Ver mi resumen/.test(b.textContent));
      assert.equal(boton.textContent, k === 4 ? "Ver mi resumen" : "Siguiente ítem");
      await clic(boton);
    }
    assert.equal(fin.pct, 20);
    assert.deepEqual(fin.detalle.map((d) => d.respuesta), [null, "A", "C", "D", "B"]);
  } finally { m.desmontar(); }
});

/* ═══════════════════ EL TUTORIAL ═══════════════════ */

test("★★★ el tutorial: el componente de siempre con la panadería de Gen; el guion la resuelve", async () => {
  const asi = ASI_SE_JUEGA["t3-que-le-toca"];
  assert.ok(asi, "no hay «Así se juega»");
  assert.equal(asi.titulo, "¿Qué le toca a este periodo?");
  assert.deepEqual(asi.pasos, A6.PASOS_ACT6);
  assert.equal(`Ejemplo: ${asi.alt}`, "Ejemplo: el corte queda en diciembre. Se escribe $300.000 para el periodo y $600.000 para lo que queda.");
  const ej = asi.demo.items[0];
  assert.equal(ej.hecho, "Una panadería cierra el 31 de diciembre. Pagó $900.000 el 1 de octubre por nueve meses de bodega.");
  assert.equal(ej.acierto, "Pasaron 3 de 9 meses. Al periodo le toca $300.000 y quedan $600.000 de bodega por usar.");
  assert.equal(L.mesLargoDelCorte(ej, ej.corte), "Diciembre");
  assert.ok(!ITEMS_ACT6.some((x) => x.id === ej.id), "el ejemplo está fuera del banco");
  assert.equal(L.banderaDelCorte(ej, ej.corte), "Cierre · Dic", "el tutorial (9 meses) va sin año");
  /* El guion, a mano: cada toque sobre el componente en modo demo. */
  const m = await montar({ items: [ej], modoDemo: true });
  try {
    assert.equal(m.caja.querySelector("[data-pie]"), null);
    for (const t of asi.guion.toques) {
      const el = m.caja.querySelector(t.en);
      assert.ok(el, `no está ${t.en}`);
      if (t.senala) continue;
      if (t.escribe) await escribir(el, t.escribe);
      else await clic(el);
    }
    assert.equal(m.caja.querySelector("[data-bandera]").textContent, "Cierre · Dic");
    assert.equal(m.caja.querySelector('[data-campo="alPeriodo"]').value, "300.000");
    assert.deepEqual(textosRetro(m.caja), [ej.acierto]);
    /* El cuadro del gesto (reducido): con los cuatro primeros toques, el corte ya está en diciembre. */
    assert.equal(asi.cuadros.gesto, 4);
  } finally { m.desmontar(); }
});

/* ═══════════════════ EL REGISTRO ═══════════════════ */

test("★★ va después de la pieza «Lo que ya se pagó…» en el camino; Análisis · 50 FP; regla docente y fila en el catálogo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  assert.ok(ids.indexOf("t3-que-le-toca") > ids.indexOf("t3-a4-lo-que-ya-se-pago"));
  assert.deepEqual(tema.actividades.find((a) => a.id === "t3-que-le-toca").clasificacion,
    { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.ok(JUEGOS.some((j) => j.id === "t3-que-le-toca" && j.Mecanica === QueLeToca));
  assert.equal(REGLAS["t3-que-le-toca"]("t3a6-costa"), "Arriendos de la Costa · Arriendo de $15.000 recibido el 1 de junio por tres meses. Cierra el 30 de junio.");
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  assert.match(sql, /\('t3-que-le-toca',\s*'contabilidad',\s*'ingresos-gastos-y-caja',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
});

test("★★★ colores: ni verde azulado ni ámbar; #B8C4D4 nunca es color de texto", () => {
  const archivos = [
    "../../components/mecanicas/libros/tema3/QueLeToca.jsx", "../queLeToca.js", "../../data/contabilidadTema3Act6.js",
  ];
  for (const a of archivos) {
    const fuente = readFileSync(new URL(a, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /#2a9d8f|#52c4b0|#e9c46a|FAE\.(teal|ambar)|TONO_ROTULO|COLOR_LADO/i, `${a}: teal o ámbar`);
    assert.doesNotMatch(fuente, /\bcolor:\s*(COLOR\.neutro|["']#B8C4D4)/i, `${a}: #B8C4D4 como texto`);
  }
});

/* ═══════════════════ ARREGLO: EL AÑO DEL CORTE (Levi) ═══════════════════ */

test("★★★ seguro: los cortes 10, 22, 34 y 46 dicen «Dic · año 1» a «Dic · año 4», y solo el 10 es correcto", async () => {
  const seguro = porId("t3a6-seguro");
  const esperado = { 10: 1, 22: 2, 34: 3, 46: 4 };
  for (const [k, anio] of Object.entries(esperado).map(([k, a]) => [Number(k), a])) {
    assert.equal(L.banderaDelCorte(seguro, k), `Cierre · Dic · año ${anio}`);
    assert.equal(L.valorDelCorte(seguro, k), `Cierre al final de diciembre del año ${anio}`);
    const r = L.evaluarAct6(seguro, { corte: k, alPeriodo: 80000, queda: 400000 });
    assert.equal(r.ok, k === 10, `corte ${k}`);
    if (k !== 10) assert.equal(r.caso, CASO_A);
  }
  /* En pantalla, con el teclado: la bandera y el slider dicen lo mismo. */
  const m = await montar({ items: [seguro] });
  try {
    const asa = m.caja.querySelector("[data-asa]");
    await tecla(asa, "Home");
    for (let i = 1; i < 10; i++) await tecla(asa, "ArrowRight");
    for (const anio of [1, 2, 3, 4]) {
      assert.equal(asa.getAttribute("aria-valuenow"), String(10 + 12 * (anio - 1)));
      assert.equal(m.caja.querySelector("[data-bandera]").textContent, `Cierre · Dic · año ${anio}`);
      assert.equal(asa.getAttribute("aria-valuetext"), `Cierre al final de diciembre del año ${anio}`);
      await tecla(asa, "PageUp");
    }
  } finally { m.desmontar(); }
});

test("★★★ seguro: la etiqueta coincide siempre con la posición del corte", () => {
  const seguro = porId("t3a6-seguro");
  for (const ancho of [297, 242]) {
    for (let k = 1; k < seguro.meses; k++) {
      /* La posición donde se dibuja el corte vuelve al mismo corte… */
      assert.equal(L.corteEnX(seguro, (k / seguro.meses) * ancho, ancho), k);
      /* …y la etiqueta nombra el mes y el año del eje que terminan ahí. */
      const mes = A6.MESES_CORTOS[(seguro.inicio + k - 1) % 12];
      const anio = Math.floor((k - 1) / 12) + 1;
      assert.equal(L.banderaDelCorte(seguro, k), `Cierre · ${mes} · año ${anio}`, `corte ${k}`);
      /* El año de la etiqueta es el tramo «Año n» del eje que contiene el corte. */
      const tramo = L.rotulosDeBarra(seguro, ancho).etiquetas.find((e) => k > e.desde && k <= e.hasta);
      assert.equal(tramo.texto, `Año ${anio}`, `corte ${k}`);
    }
  }
});

test("★★ regresión: los ítems 2 a 5 y el tutorial siguen con su etiqueta sin año", () => {
  for (const it of [...ITEMS_ACT6.slice(1), A6.EJEMPLO_PANADERIA_ACT6]) {
    assert.ok(it.meses <= 12, it.id);
    for (let k = 1; k < it.meses; k++) {
      assert.doesNotMatch(L.banderaDelCorte(it, k), /año/, `${it.id} · ${k}`);
      assert.doesNotMatch(L.valorDelCorte(it, k), /año/, `${it.id} · ${k}`);
    }
  }
  assert.equal(L.banderaDelCorte(porId("t3a6-equipos"), 5), "Cierre · Dic");
  assert.equal(L.banderaDelCorte(porId("t3a6-arriendo"), 7), "Cierre · Dic");
  assert.equal(L.banderaDelCorte(porId("t3a6-san-calixto"), 1), "Cierre · Jun");
  assert.equal(L.banderaDelCorte(porId("t3a6-costa"), 1), "Cierre · Jun");
  assert.equal(L.valorDelCorte(porId("t3a6-equipos"), 5), "Cierre al final de diciembre");
});
