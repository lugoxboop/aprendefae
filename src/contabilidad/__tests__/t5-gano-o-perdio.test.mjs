import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMelloN5, FILA_PLEGADA_N5 } from "./correccionesMelloN5.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 «¿Ganó o perdió?» v2 (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v2 de Near con la corrección
 *     N5-1 de Mello encima (correccionesMelloN5.mjs), en los dos sentidos:
 *     nada del paquete falta en los datos y nada de los datos falta en el
 *     paquete; la opcional de Mello (105.000 en el ítem 7) no se aplica
 *   · las cifras salen de las acciones, el precio y las dos ventas, y son
 *     las del registro de T5, salvo 4.860.000, que es del libro, solo
 *     reconoce un error y nunca sale en pantalla
 *   · la escalera (C2): 1.er error, la pista o el error reconocido; 2.º, la
 *     respuesta con su porqué; solo suma el primer intento; diez unidades; el
 *     porcentaje es aciertos / 10; el detalle guarda el primer intento
 *   · Ganó o Perdió va con la casilla y se califica junto con ella
 *   · la figura crece con cada ítem cerrado, nunca antes (E8), y pliega el
 *     asiento 1 mientras se arma el 2 (N5-1)
 *   · «Vale el primer intento» en el distintivo, no en la consigna
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0113; en T5
 *     justo después de N4; la vista lo abre; el panel docente lee cada unidad
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT5_n5.js");
const L = await import("../t5N5.js");
const A = await import("../armaLaLinea.js");
const { barajar } = await import("../../utils/barajar.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: GanoOPerdio } = await import("../../components/mecanicas/libros/t5/GanoOPerdio.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V2 = conCorreccionesDeMelloN5(leer("orquestador/conocimiento/paquetes/t5-n5-gano-o-perdio-v2.md"));
const REGISTRO = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
const MIGRACION = leer("supabase/migrations/0113_t5_gano_o_perdio.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const cita = (celda) => { const c = citas(celda); assert.equal(c.length, 1, celda); return c[0]; };
const miles = (v) => pesos(v).slice(1);
const it = (id) => D.ITEMS_N5.find((x) => x.id === id);
const C = D.CIFRAS_N5;
const NOMBRE_RES = { gano: "Ganó", perdio: "Perdió" };

/* La primera tabla después de `marcador`, sin cabecera ni separador: [[celda, …], …]. */
function tablaTras(marcador) {
  const desde = V2.indexOf(marcador);
  assert.ok(desde >= 0, `no está en el paquete: ${marcador}`);
  const lineas = V2.slice(desde).split("\n");
  const ini = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(ini + 2)) { if (!l.startsWith("|")) break; filas.push(l.replace(/^\| | \|$/g, "").split(" | ")); }
  return filas;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cabecera, enunciado, consigna, distintivo y pie: los de la v2, letra por letra", () => {
  assert.ok(V2.includes(`# T5 · N5 «${D.N5.nombre}» · versión 2`));
  assert.ok(V2.includes(`id \`${D.N5_ID}\``));
  assert.ok(V2.includes("Migración **0113**"));
  assert.ok(V2.includes("Pasa de 11 a **10 aciertos**"));
  const campos = Object.fromEntries(tablaTras("## Enunciado y figura").map(([k, v]) => [k, cita(v)]));
  assert.deepEqual(campos, { enunciado: D.N5.enunciado[0], consigna: D.N5.consigna, distintivo: D.N5.distintivo });
  assert.equal(D.N5.enunciado.length, 1);
  assert.ok(V2.includes(`**Pie de todos los ítems:** «${D.N5.pie}».`));
  /* C5: la regla del intento no va en la consigna ni en el enunciado. */
  for (const x of [D.N5.consigna, ...D.N5.enunciado]) assert.doesNotMatch(x, /intento/i);
  assert.ok(V2.includes(`**La figura: «${D.FIGURA_N5.titulo}».**`));
});

/* Lo que el paquete dice de cada casilla: la correcta, la pista, los errores con nombre y el acierto. */
function casillaDelPaquete(cabecera) {
  const linea = V2.split("\n").find((l) => l.startsWith(cabecera));
  assert.ok(linea, cabecera);
  const m = linea.match(/\(correcta: (?:(Ganó|Perdió), )?\$([\d.]+)[;)]/);
  const filas = tablaTras(cabecera);
  const de = (k) => filas.filter(([c]) => c === k).map(([, v]) => cita(v));
  return {
    resultado: m[1] ?? null, correcta: m[2], pregunta: de("pregunta"), pista: de("pista"), acierto: de("acierto"),
    errores: filas.filter(([c]) => c.startsWith("si ")).map(([c, v]) => [c, cita(v)]),
    campos: filas.map(([c]) => c),
  };
}
const CASILLAS = [["**Ítem 1 · casilla de cifra**", "lo-que-recibe"], ["**Ítem 2 · casilla de cifra**", "lo-que-costaron"],
  ["**Ítem 3 · Ganó o Perdió, y casilla de cifra**", "gano-o-perdio-1"], ["**Ítem 7 · Ganó o Perdió, y casilla de cifra**", "gano-o-perdio-2"]];
const rotuloDe = (d) => (d.resultado ? `si elige ${NOMBRE_RES[d.resultado]} y escribe ${miles(d.valor)}` : `si escribe ${miles(d.valor)}`);

test("★★★ las cuatro casillas (ítems 1, 2, 3 y 7): pregunta, correcta, Ganó o Perdió, pista, errores con nombre y acierto, en los dos sentidos", () => {
  assert.deepEqual(D.ITEMS_N5.filter((x) => x.tipo === "cifra").map((x) => x.id), CASILLAS.map(([, id]) => id));
  for (const [cabecera, id] of CASILLAS) {
    const p = casillaDelPaquete(cabecera);
    const x = it(id);
    assert.deepEqual([x.pregunta], p.pregunta, id);
    assert.equal(miles(x.correcta), p.correcta, id);
    assert.equal(x.resultado ? NOMBRE_RES[x.resultado] : null, p.resultado, id);
    assert.deepEqual([x.pista], p.pista, id);
    assert.deepEqual([x.acierto], p.acierto, id);
    /* Cada error con nombre del paquete está en los datos, y ningún dato sobra. */
    assert.deepEqual(x.distractores.map((d) => [rotuloDe(d), d.retro]), p.errores, id);
    assert.deepEqual(p.campos.filter((c) => !c.startsWith("si ")), ["pregunta", "pista", "acierto"], id);
  }
});

const ASIENTOS = [["**Ítems 4 a 6 · Arma la línea.**", "asiento-con-ganancia"], ["**Ítems 8 a 10 · Arma la línea.**", "asiento-con-perdida"]];

test("★★★ los dos asientos: consigna, y por línea monto, cuenta, lado, dos distractores, pista y respuesta, en el orden del paquete", () => {
  const consigna = cita(V2.split("\n").find((l) => l.startsWith(ASIENTOS[0][0])));
  assert.ok(V2.includes(`${ASIENTOS[1][0]} La consigna es la misma del primer asiento, en otra pantalla.`));
  assert.deepEqual(D.ITEMS_N5.filter((x) => x.tipo === "asiento").map((x) => x.id), ASIENTOS.map(([, id]) => id));
  const lado = { debe: "Debe", haber: "Haber" };
  for (const [cabecera, id] of ASIENTOS) {
    const x = it(id);
    assert.equal(x.pregunta, consigna, id);
    const filas = tablaTras(cabecera);
    assert.deepEqual(x.lineas.map((l) => [pesos(l.valor), `${l.cuenta} · ${lado[l.lado]}`, l.distractores.join(" · "), l.pista, l.retro]),
      filas.map(([monto, correcta, malas, pista, resp]) => [monto, correcta, malas, cita(pista), cita(resp)]), id);
    /* Cuadra. */
    const suma = (s) => x.lineas.filter((l) => l.lado === s).reduce((a, l) => a + l.valor, 0);
    assert.equal(suma("debe"), suma("haber"), id);
  }
});

test("★★★ la figura: el título, cada fila y cuándo sale, y la fila plegada de N5-1, letra por letra", () => {
  const filas = tablaTras("**La figura:");
  const unidades = L.unidadesN5();
  /* «Después del ítem k» es la unidad k: los ítems del paquete se cuentan como las unidades. */
  const tras = (cuando) => {
    if (cuando === "Desde el inicio") return null;
    const m = cuando.match(/^Después del ítem (\d+)$/);
    if (m) return unidades[Number(m[1]) - 1];
    return { "Después del asiento 1": "asiento-con-ganancia", "Después del asiento 2": "asiento-con-perdida" }[cuando];
  };
  const F = D.FIGURA_N5.filas;
  const plegada = filas.find(([c]) => c.startsWith("Mientras"));
  assert.ok(plegada, "la fila de N5-1");
  assert.equal(plegada[1], FILA_PLEGADA_N5);
  const conPlegada = F.filter((f) => f.plegada);
  assert.deepEqual(conPlegada.map((f) => [f.asiento, f.plegada, f.plegadaDurante]), [["asiento-con-ganancia", cita(plegada[1]), "asiento-con-perdida"]]);
  const resto = filas.filter((f) => f !== plegada);
  assert.equal(F.length, resto.length);
  for (const [k, [cuando, texto]] of resto.entries()) {
    const f = F[k];
    assert.equal(f.tras, tras(cuando), cuando);
    if (f.asiento) {
      /* «el asiento armado, con sus sumas: 2.970.000 = 2.970.000»: el asiento de su ítem, que suma eso. */
      const suma = it(f.asiento).lineas.filter((l) => l.lado === "debe").reduce((a, l) => a + l.valor, 0);
      assert.match(texto, new RegExp(`con sus sumas: ${miles(suma).replace(/\./g, "\\.")} = ${miles(suma).replace(/\./g, "\\.")}$`), cuando);
      assert.equal(f.tras, f.asiento);
    } else assert.equal(f.texto, texto, cuando);
  }
});

test("★★★ las pistas: 20 palabras o menos, sin la cifra ni la cuenta correctas; ninguna retro de línea nombra la cuenta de otra línea", () => {
  const palabras = (t) => t.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x)).length;
  const cuentas = new Set(D.ITEMS_N5.flatMap((x) => (x.lineas ?? []).flatMap((l) => [l.cuenta, ...l.distractores])));
  for (const x of D.ITEMS_N5) {
    if (x.tipo === "cifra") {
      assert.ok(palabras(x.pista) <= 20, x.id);
      assert.ok(!x.pista.includes(miles(x.correcta)), x.id);
      continue;
    }
    for (const l of x.lineas) {
      assert.ok(palabras(l.pista) <= 20, `${x.id}:${l.id}`);
      for (const c of cuentas) assert.ok(!l.pista.includes(c), `${x.id}:${l.id} nombra ${c}`);
      /* La respuesta de una línea habla de su cuenta y de ninguna otra: no regala otra línea. */
      for (const o of x.lineas.filter((y) => y !== l)) assert.ok(!l.retro.includes(o.cuenta), `${x.id}:${l.id} nombra ${o.cuenta}`);
      assert.equal(new Set([l.cuenta, ...l.distractores]).size, 3, `${x.id}:${l.id}`);
    }
  }
});

test("★★★ cuentas del canon con raya –; venta por el costo; nada interno sale en pantalla", () => {
  const cuentas = new Set(D.ITEMS_N5.flatMap((x) => (x.lineas ?? []).map((l) => l.cuenta)));
  assert.deepEqual([...cuentas].sort(), ["Caja", "Gastos financieros – pérdida en venta de títulos", "Ingresos financieros – ganancia en venta de títulos", "Inversiones – títulos"]);
  assert.equal(it("asiento-con-ganancia").lineas.find((l) => l.id === "inversiones").valor, C.costo1);
  assert.equal(it("asiento-con-perdida").lineas.find((l) => l.id === "inversiones").valor, C.costo2);
  const visibles = [D.N5.consigna, ...D.N5.enunciado, D.N5.distintivo, D.FIGURA_N5.titulo, ...D.FIGURA_N5.filas.map((f) => f.texto ?? f.plegada ?? ""),
    ...D.ITEMS_N5.flatMap((x) => [x.pregunta, x.pista ?? "", x.acierto ?? "", ...(x.distractores ?? []).map((d) => d.retro ?? d), ...(x.lineas ?? []).flatMap((l) => [l.cuenta, l.pista, l.retro])])].join("\n");
  assert.doesNotMatch(visibles, /Ingreso financieros|Gasto financieros|dividendo/i);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "INFLESZ", "C5-", "hueco", "PENDIENTE"]) assert.ok(!visibles.includes(interno), interno);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ las cifras salen del cálculo y son las del registro de T5; 4.860.000 es la única que no, y nunca sale en pantalla", () => {
  assert.deepEqual(D.calcularN5(), {
    inversion: 4_590_000, quedan: 350, recibe1: 2_970_000, costo1: 2_805_000, ganancia: 165_000,
    recibe2: 1_540_000, costo2: 1_785_000, perdida: 245_000, lasQueQuedan: 1_890_000, lasNovecientas: 4_860_000,
  });
  const reg = new Set(REGISTRO.construidas.filter((r) => r.pieza === D.N5_ID).map((r) => r.cifra));
  const fuera = Object.entries(D.CIFRAS_N5).filter(([, v]) => !reg.has(v));
  assert.deepEqual(fuera, [["lasNovecientas", 4_860_000]]);
  for (const v of [D.ACCIONES_N5, D.PRECIO_N5, D.VENTA1_N5.acciones, D.VENTA1_N5.precio, D.VENTA2_N5.precio]) assert.ok(reg.has(v), String(v));
  /* 4.860.000: del libro (Mello, v1 y v2); solo reconoce el error del ítem 1. */
  assert.ok(V2.includes("$4.860.000 está en el OCR, pero nunca sale en pantalla"));
  const visibles = JSON.stringify([D.N5, D.FIGURA_N5, D.ITEMS_N5.map((x) => ({ ...x, distractores: x.distractores?.map((d) => d.retro) }))]);
  assert.ok(!visibles.includes("4.860.000") && !visibles.includes("4860000"));
  assert.deepEqual(D.ITEMS_N5.flatMap((x) => (x.distractores ?? []).filter((d) => d.valor === C.lasNovecientas).map(() => x.id)), ["lo-que-recibe"]);
});

/* ═══════════ 3 · LA ESCALERA, SIN REACT ═══════════ */

test("★★★ la escalera de una casilla: el error reconocido o la pista; luego la respuesta con su porqué", () => {
  const x = it("lo-que-recibe");
  assert.deepEqual(L.evaluarN5(x, C.recibe1, 1), { ok: true, cerrado: true, textos: [x.acierto], correcta: C.recibe1, textoCorrecta: "$2.970.000" });
  assert.deepEqual(L.evaluarN5(x, C.lasNovecientas, 1).textos, [x.distractores[0].retro]);
  assert.deepEqual(L.evaluarN5(x, 123, 1), { ok: false, cerrado: false, textos: [x.pista], correcta: C.recibe1, textoCorrecta: "$2.970.000" });
  assert.deepEqual(L.evaluarN5(x, C.lasQueQuedan, 2), { ok: false, cerrado: true, textos: ["La respuesta es $2.970.000.", "550 × $5.400 = $2.970.000."], correcta: C.recibe1, textoCorrecta: "$2.970.000" });
});

test("★★★ Ganó o Perdió: se califica con la casilla; cada combinación de errores tiene su texto; la opcional (105.000) no está", () => {
  const i3 = it("gano-o-perdio-1");
  const e3 = (resultado, valor, f = 1) => L.evaluarN5(i3, { resultado, valor }, f);
  assert.equal(e3("gano", C.ganancia).ok, true);
  assert.deepEqual(e3("perdio", C.ganancia).textos, ["La cifra está bien, pero recibió más de lo que le costaron."]);
  assert.deepEqual(e3("gano", C.recibe1).textos, ["Eso es lo que recibió, no lo que ganó o perdió."]);
  assert.deepEqual(e3("perdio", C.recibe1).textos, ["Eso es lo que recibió, no lo que ganó o perdió."]);
  assert.deepEqual(e3("gano", 1).textos, [i3.pista]);
  assert.deepEqual(e3("perdio", C.ganancia, 2).textos, ["La respuesta es $165.000.", "$2.970.000 − $2.805.000 = $165.000. Ganó."]);
  const i7 = it("gano-o-perdio-2");
  const e7 = (resultado, valor) => L.evaluarN5(i7, { resultado, valor }, 1);
  assert.equal(e7("perdio", C.perdida).ok, true);
  assert.deepEqual(e7("gano", C.perdida).textos, ["La cifra está bien, pero recibió menos de lo que le costaron."]);
  assert.deepEqual(e7("perdio", C.recibe2).textos, ["Eso es lo que recibe. Falta compararlo con lo que le costaron."]);
  assert.deepEqual(e7("gano", C.costo2).textos, ["Eso es lo que le costaron. Falta compararlo con lo que recibe."]);
  /* Opcional de Mello, no aplicada: 105.000 cae en la pista. */
  assert.deepEqual(e7("perdio", 105_000).textos, [i7.pista]);
  assert.equal(L.respuestaN5(i7, { resultado: "gano", valor: 245000 }), "gano|245000");
  assert.equal(L.respuestaN5(it("lo-que-recibe"), 5), 5);
});

test("★★ la escalera es general: sin pista ni error reconocido, un solo intento como antes", () => {
  const sinPista = { correcta: 10, acierto: "Así es: 5 + 5 = 10.", distractores: [] };
  assert.deepEqual(A.evaluarCifraConEscalera(sinPista, 7, 1), { ok: false, cerrado: true, textos: ["La respuesta es $10.", "5 + 5 = 10."], correcta: 10, textoCorrecta: "$10" });
  assert.equal(A.lineaConPista({ pista: "p" }, 1), true);
  assert.equal(A.lineaConPista({ pista: "p" }, 2), false);
  assert.equal(A.lineaConPista({}, 1), false);
});

/* ═══════════ 4 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararN5((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(GanoOPerdio, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};

test("★★★ la tanda entera: escalera, figura que crece, N5-1, foco, primer intento y diez unidades", async () => {
  const m = await montar();
  const q = (sel) => m.caja.querySelector(sel);
  const textos = (sel) => [...m.caja.querySelectorAll(sel)].map((x) => x.textContent);
  const figura = () => q("[data-figura-n5]").textContent;
  const filas = () => [...m.caja.querySelectorAll("[data-figura-n5] [data-fila]")].map((x) => x.dataset.fila);
  const retro = () => textos("[data-retro] [data-texto-retro]");
  const enMensaje = () => document.activeElement === q("[data-mensaje-escalera]");
  const comprobar = () => tocar(boton(m.caja, "Comprobar"));
  const siguiente = (ultimo = false) => tocar(boton(m.caja, ultimo ? D.BOTON_N5.verResumen : D.BOTON_N5.siguiente));
  const pregunta = () => q("[data-pregunta]").textContent;
  try {
    /* Arriba: consigna, enunciado, figura con la compra, distintivo. */
    assert.ok(m.caja.textContent.includes(D.N5.consigna));
    assert.ok(m.caja.textContent.includes(D.N5.enunciado[0]));
    assert.deepEqual(textos("[data-un-intento]"), ["Vale el primer intento"]);
    assert.equal(q("[data-titulo-figura]").textContent, "La inversión de Acacia");
    assert.deepEqual(filas(), ["compra"]);

    /* ÍTEM 1 · 1.er intento 4.860.000 (reconocido), 2.º la buena. */
    assert.equal(pregunta(), it("lo-que-recibe").pregunta);
    assert.equal(q("[data-item] [data-pie]").textContent, D.N5.pie);
    assert.equal(boton(m.caja, "Comprobar").disabled, true);
    await escribir(m.caja, "lo-que-recibe", "4860000");
    await comprobar();
    assert.deepEqual(retro(), ["Ese cálculo usa las 900. Pero de esas, Acacia solo vendió 550."]);
    assert.ok(enMensaje(), "el foco va al mensaje");
    assert.equal(q('[data-campo-cifra="lo-que-recibe"]').readOnly, false, "se puede volver a intentar");
    assert.equal(boton(m.caja, D.BOTON_N5.siguiente), undefined);
    assert.deepEqual(filas(), ["compra"], "E8: nada antes de cerrar el ítem");
    assert.ok(!figura().includes("2.970.000"));
    await escribir(m.caja, "lo-que-recibe", "2970000");
    await comprobar();
    assert.deepEqual(retro(), [it("lo-que-recibe").acierto]);
    assert.ok(enMensaje());
    assert.equal(q('[data-campo-cifra="lo-que-recibe"]').readOnly, true);
    assert.deepEqual(filas(), ["compra", "venta-1"]);
    await siguiente();

    /* ÍTEM 2 · al primer intento. */
    assert.equal(pregunta(), it("lo-que-costaron").pregunta);
    assert.ok(!figura().includes("2.805.000"));
    await escribir(m.caja, "lo-que-costaron", "2805000");
    await comprobar();
    assert.deepEqual(retro(), [it("lo-que-costaron").acierto]);
    assert.deepEqual(filas(), ["compra", "venta-1", "costo-1"]);
    /* E8: lo recibido y el costo, uno junto al otro, sin la resta. */
    assert.ok(figura().includes("$2.970.000") && figura().includes("$2.805.000") && !figura().includes("165.000"));
    await siguiente();

    /* ÍTEM 3 · Perdió y 165.000 (reconocido); luego Perdió y 1 → la respuesta. */
    assert.equal(pregunta(), it("gano-o-perdio-1").pregunta);
    await escribir(m.caja, "gano-o-perdio-1", "165000");
    assert.equal(boton(m.caja, "Comprobar").disabled, true, "falta Ganó o Perdió");
    assert.deepEqual(textos("[data-resultado]"), ["Ganó", "Perdió"]);
    await tocar(q('[data-resultado="perdio"]'));
    assert.equal(q('[data-resultado="perdio"]').getAttribute("aria-pressed"), "true");
    await comprobar();
    assert.deepEqual(retro(), ["La cifra está bien, pero recibió más de lo que le costaron."]);
    assert.ok(enMensaje());
    assert.ok(!filas().includes("resultado-1"));
    await escribir(m.caja, "gano-o-perdio-1", "1");
    await comprobar();
    assert.deepEqual(retro(), ["La respuesta es $165.000.", "$2.970.000 − $2.805.000 = $165.000. Ganó."]);
    assert.ok(enMensaje());
    /* Cerrado: la buena con ✓, la elegida mal con ✗; nada de teal ni ámbar. */
    assert.ok(q('[data-resultado="gano"]').textContent.startsWith("✓"));
    assert.ok(q('[data-resultado="perdio"]').textContent.startsWith("✗"));
    assert.equal(q('[data-resultado="gano"]').disabled, true);
    assert.deepEqual(filas(), ["compra", "venta-1", "costo-1", "resultado-1"]);
    await siguiente();

    /* ASIENTO 1 · 1.ª vuelta: Caja mal (Inversiones), Inversiones bien, Ganancia mal (lado). */
    const x1 = it("asiento-con-ganancia");
    assert.equal(pregunta(), x1.pregunta);
    const fila = (id) => q(`[data-linea-cuenta="${id}"]`);
    const armar = async (id, cuenta, lado) => {
      await tocar([...fila(id).querySelectorAll("[data-ficha-cuenta]")].find((b) => b.dataset.fichaCuenta === cuenta));
      await tocar([...fila(id).querySelectorAll("button")].find((b) => b.textContent === lado));
    };
    for (const l of x1.lineas) {
      assert.deepEqual([...fila(l.id).querySelectorAll("[data-ficha-cuenta]")].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores]);
      assert.equal(fila(l.id).querySelector("[data-valor]").textContent, pesos(l.valor), "el monto viene dado");
    }
    await armar("caja", "Inversiones – títulos", "Debe");
    await armar("inversiones", "Inversiones – títulos", "Haber");
    await armar("ganancia", "Ingresos financieros – ganancia en venta de títulos", "Debe");
    assert.equal(q("[data-asiento-completo]"), null);
    await comprobar();
    const estado = (id) => fila(id).dataset.estado;
    assert.deepEqual(x1.lineas.map((l) => estado(l.id)), ["pista", "bien", "pista"]);
    assert.deepEqual(textos('[data-linea-cuenta="caja"] [data-texto-retro]'), [x1.lineas[0].pista]);
    assert.deepEqual(textos('[data-linea-cuenta="inversiones"] [data-texto-retro]'), []);
    assert.deepEqual(textos('[data-linea-cuenta="ganancia"] [data-texto-retro]'), [x1.lineas[2].pista]);
    assert.deepEqual(textos("[data-era]"), [], "la pista no da la respuesta");
    assert.ok(document.activeElement === q('[data-linea-cuenta="caja"] [data-panel]'), "el foco, al primer mensaje");
    /* La que vuelve a armarse se vacía; la buena queda con ✓ y bloqueada. */
    assert.equal(fila("caja").querySelector('[aria-pressed="true"]'), null);
    assert.ok(fila("inversiones").querySelector('[data-ficha-cuenta="Inversiones – títulos"]').textContent.startsWith("✓"));
    assert.equal(fila("inversiones").querySelector('[data-ficha-cuenta="Caja"]').disabled, true);
    assert.equal(boton(m.caja, "Comprobar").disabled, true);
    assert.ok(!filas().includes("asiento-1"));
    /* 2.ª vuelta: Caja bien, Ganancia otra vez mal → «Era: …» y su porqué. */
    await armar("caja", "Caja", "Debe");
    await armar("ganancia", "Gastos financieros – pérdida en venta de títulos", "Haber");
    await comprobar();
    assert.deepEqual(x1.lineas.map((l) => estado(l.id)), ["bien", "bien", "respuesta"]);
    assert.deepEqual(textos('[data-linea-cuenta="ganancia"] [data-era]'), ["Era: Ingresos financieros – ganancia en venta de títulos, al haber."]);
    assert.deepEqual(textos('[data-linea-cuenta="ganancia"] [data-texto-retro]'), [x1.lineas[2].retro]);
    assert.deepEqual(textos('[data-linea-cuenta="caja"] [data-texto-retro]'), []);
    assert.ok(document.activeElement === q('[data-linea-cuenta="ganancia"] [data-panel]'), "el foco");
    assert.ok(q("[data-asiento-completo]").textContent.includes("$2.970.000"));
    assert.equal(boton(m.caja, "Comprobar"), undefined);
    assert.deepEqual(filas(), ["compra", "venta-1", "costo-1", "resultado-1", "asiento-1"]);
    assert.ok(q('[data-figura-n5] [data-fila="asiento-1"] [data-asiento]'));
    await siguiente();

    /* ÍTEM 7 · al primer intento; la figura todavía no tiene la segunda venta. */
    assert.equal(pregunta(), it("gano-o-perdio-2").pregunta);
    for (const v of ["1.540.000", "1.785.000", "245.000"]) assert.ok(!figura().includes(v), v);
    assert.ok(q('[data-figura-n5] [data-fila="asiento-1"] [data-asiento]'), "el asiento 1 se ve fuera del asiento 2");
    await tocar(q('[data-resultado="perdio"]'));
    await escribir(m.caja, "gano-o-perdio-2", "245000");
    await comprobar();
    assert.deepEqual(retro(), [it("gano-o-perdio-2").acierto]);
    assert.ok(q('[data-resultado="perdio"]').textContent.startsWith("✓"));
    assert.ok(filas().includes("venta-2"));
    await siguiente();

    /* ASIENTO 2 · N5-1: mientras se arma, el asiento 1 va plegado; las filas de la venta, visibles. */
    const x2 = it("asiento-con-perdida");
    assert.equal(pregunta(), x2.pregunta);
    const a1 = () => q('[data-figura-n5] [data-fila="asiento-1"]');
    assert.equal(a1().textContent, "10 jul · asiento armado ✓");
    assert.ok(a1().hasAttribute("data-plegada"));
    assert.equal(a1().querySelector("[data-asiento]"), null, "sin sus líneas");
    assert.equal(q("[data-figura-n5]").querySelectorAll("[data-asiento]").length, 0);
    assert.deepEqual(filas(), ["compra", "venta-1", "costo-1", "resultado-1", "asiento-1", "venta-2"]);
    for (const l of x2.lineas) await armar(l.id, l.cuenta, l.lado === "debe" ? "Debe" : "Haber");
    await comprobar();
    assert.deepEqual(x2.lineas.map((l) => estado(l.id)), ["bien", "bien", "bien"]);
    assert.ok(document.activeElement === q("[data-asiento-completo]"), "todo bien: el foco al asiento completo");
    /* Al terminar, se despliega y llega el asiento 2. */
    assert.ok(!a1().hasAttribute("data-plegada"));
    assert.ok(a1().querySelector("[data-asiento]"));
    assert.deepEqual(filas(), ["compra", "venta-1", "costo-1", "resultado-1", "asiento-1", "venta-2", "asiento-2"]);
    assert.ok(q('[data-figura-n5] [data-fila="asiento-2"]').textContent.includes("$1.785.000"));
    await siguiente(true);

    /* Solo el primer intento suma: 1 ✗, 2 ✓, 3 ✗, caja ✗, inversiones ✓, ganancia ✗, 7 ✓ y las tres del asiento 2 ✓. */
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det.map((d) => d.item), L.unidadesN5());
    assert.deepEqual(det.map((d) => d.ok), [false, true, false, false, true, false, true, true, true, true]);
    assert.deepEqual(det.filter((d) => !d.ok).map((d) => [d.item, d.respuesta]), [
      ["lo-que-recibe", 4_860_000], ["gano-o-perdio-1", "perdio|165000"],
      ["asiento-con-ganancia:caja", "Inversiones – títulos|debe"], ["asiento-con-ganancia:ganancia", "Ingresos financieros – ganancia en venta de títulos|debe"],
    ]);
    assert.equal(L.TOTAL_N5, 10);
    assert.equal(pct, 60);
    assert.equal(q("[data-resumen]").textContent, D.resumenN5(6, 10));
  } finally {
    m.desmontar();
  }
});

test("★★ las líneas y su banco de cuentas se barajan; las casillas no", () => {
  const vistos = new Set();
  for (let i = 0; i < 40; i++) vistos.add(JSON.stringify(L.prepararN5(barajar).map((x) => [x.orden, x.lineas?.map((l) => l.banco)])));
  assert.ok(vistos.size > 1);
  for (const x of L.prepararN5(barajar)) {
    if (x.tipo === "cifra") assert.equal(x, it(x.id));
    else for (const l of x.lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores].sort());
  }
});

/* ═══════════ 5 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 justo después de N4, seguida de N6 y del cierre de B (decisión de corte, punto 6): evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N5_ID).nombre, D.N5.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.N5_ID), ids.indexOf("t5-el-interes-del-periodo") + 1);
  /* Después de N5 van N6 (posición 9) y el cierre de B (11); N7 (10) llega en su PR. */
  assert.deepEqual(ids.slice(ids.indexOf(D.N5_ID)), [D.N5_ID, "t5-a2-lo-que-el-ejemplo-no-trae", "b5-t5-a2"]);
});

test("★★★ la vista abre lo que el catálogo ofrece", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N5_ID).Mecanica, GanoOPerdio);
});

test("★★★ la 0113: la que da la decisión de corte, aditiva y repetible, sin correr; cuenta 10 aciertos", () => {
  assert.match(MIGRACION, /\('t5-gano-o-perdio',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  assert.match(MIGRACION, /\(10 posibles desde la v2\)/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-gano-o-perdio';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N5_ID)), ["0113_t5_gano_o_perdio.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0113")), ["0113_t5_gano_o_perdio.sql"]);
});

test("★★★ el panel docente: cada una de las diez unidades tiene etiqueta, leída de los datos, y ninguna se repite", () => {
  const ids = L.unidadesN5();
  assert.deepEqual(ids, ["lo-que-recibe", "lo-que-costaron", "gano-o-perdio-1", "asiento-con-ganancia:caja", "asiento-con-ganancia:inversiones",
    "asiento-con-ganancia:ganancia", "gano-o-perdio-2", "asiento-con-perdida:caja", "asiento-con-perdida:perdida", "asiento-con-perdida:inversiones"]);
  for (const id of ids) {
    const e = etiquetaDeItem(D.N5_ID, id);
    assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
    assert.equal(e, recortar(L.unidadDeN5(id)), id);
  }
  assert.equal(new Set(ids.map((id) => L.unidadDeN5(id))).size, 10);
  assert.equal(L.unidadDeN5("asiento-con-ganancia"), null);
  assert.equal(L.unidadDeN5("no-existe"), null);
});
