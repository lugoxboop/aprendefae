import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-5 «Septiembre en permanente» (Célula E) — las pruebas que pide
 * Kamogawa (decisiones 2, 3, 4 y 5), cada una rota a propósito una vez:
 *
 *   · cada texto, literal en el paquete e5-r5-5-v1 (v1.3)
 *   · el kárdex sale de las reglas de t7_2Kardex.js: cada cifra del paquete
 *     se compara con el cálculo; nada escrito a mano
 *   · las claves, los valores equivocados con su texto, la genérica, «Y hay
 *     más por revisar.» y la prioridad de cada pantalla
 *   · la coma que se pone sola y su red (un unitario < 100 no se califica)
 *   · la pantalla 4 acepta de 12.994.030 a 12.994.070
 *   · FP: 10 por acierto, los mismos que el servidor; puertas y migración
 *   · E1: todo texto del paquete llega al DOM (con «YA REGISTRADO»)
 *   · B5: ninguna frase dos veces en una pantalla, con la pista abierta
 *   · E8: ninguna cifra que se califica está en el DOM antes de revisar su
 *     pantalla (la única excepción, la fila del 10 en la 3: v1.3, decisión 5)
 *   · INFLESZ ≥ 65 en textos de 10 palabras o más; B4 con los de comun.jsx
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /reduced-motion/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const P = await import("../../data/repasoCap5Permanente.js");
const T = await import("../../data/repasoCap5PermanenteTextos.js");
const J = await import("../../data/repasoCap5PermanenteJuego.js");
const { kardex, PROMEDIO, cifraK } = await import("../t7_2Kardex.js");
const { ESTADOS } = await import("../../components/repasoCap5/comun.jsx");
const { Permanente, leerUnitario, pintarUnitario } = await import("../../components/repasoCap5/Permanente.jsx");
const { JUEGOS_REPASO_CAP5 } = await import("../../components/RepasoCapitulo5View.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { inflesz, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { calcularFP } = await import("../../fp/motor.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-5-v1.md");
const PLANO = PAQUETE.replace(/\s+/g, " ");
const p = (id) => T.pantalla(id);
const RP = T.ROTULOS_PERMANENTE;
const { CMV, CAJA, COMPRAS, CLIENTES, DEVOLUCIONES, INGRESOS, INVENTARIO } = T;
/* El orden de la rejilla de la pantalla 3, fijo en las pruebas (en la partida se baraja). */
const ORDEN = [9000, 2219.28, 2185, 2215.83];

const montados = new Set();
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  const desmontar = () => {
    if (!montados.has(desmontar)) return;
    montados.delete(desmontar);
    act(() => raiz.unmount());
    caja.remove();
  };
  montados.add(desmontar);
  return { caja, desmontar };
};
afterEach(() => { for (const d of [...montados]) d(); });
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, texto) => {
  assert.ok(input, "no está el campo");
  const fijar = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { fijar.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const $ = (caja, s) => caja.querySelector(s);
const anadir = async (caja, { lado, cuenta, valor }) => {
  await tocar($(caja, `[data-anadir="${lado}"]`));
  await tocar(document.querySelector(`[data-hoja-renglon] [data-cuenta="${cuenta}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), String(valor));
  await tocar(document.querySelector("[data-hoja-renglon] [data-listo]"));
};
const d = (cuenta, valor) => ({ lado: "debe", cuenta, valor });
const hb = (cuenta, valor) => ({ lado: "haber", cuenta, valor });
let n = 0;
const conId = (rs) => rs.map((r) => ({ ...r, id: `t${n++}` }));
/* El unitario se escribe en dígitos: los dos últimos son los centavos. */
const digitos = (x) => String(Math.round(x * 100));

/* Las cinco pantallas, como las juega el estudiante. */
const JUGAR = {
  p1: async (caja, { destino = "compra", unitario = 2300 } = {}) => {
    await tocar($(caja, `[data-eleccion="${destino}"]`));
    await escribir($(caja, "[data-campo=unitario]"), digitos(unitario));
    await tocar($(caja, "[data-revisar]"));
  },
  p2: async (caja, { promedio = 2219.28, costo = 13315680, renglones = p("p2").asiento.correctos[0] } = {}) => {
    await escribir($(caja, "[data-campo=promedio]"), digitos(promedio));
    await escribir($(caja, "[data-campo=costo]"), String(costo));
    await tocar($(caja, "[data-revisar-valores]"));
    for (const r of renglones) await anadir(caja, r);
    await tocar($(caja, "[data-revisar-asiento]"));
  },
  p3: async (caja, { unitario = 2219.28, renglones = p("p3").asiento.correctos[0] } = {}) => {
    await tocar($(caja, `[data-eleccion="${unitario}"]`));
    for (const r of renglones) await anadir(caja, r);
    await tocar($(caja, "[data-revisar-asiento]"));
  },
  p4: async (caja, { promedio = 2130.17, costo = 12994061 } = {}) => {
    await escribir($(caja, "[data-campo=promedio]"), digitos(promedio));
    await escribir($(caja, "[data-campo=costo]"), String(costo));
    await tocar($(caja, "[data-revisar]"));
  },
  p5: async (caja, { opcion = "a" } = {}) => {
    await tocar($(caja, "[data-fila-del-diez]"));
    await tocar($(caja, `[data-opcion="${opcion}"] button`));
  },
};
const IDS = ["p1", "p2", "p3", "p4", "p5"];
const abrir = (id) => montar(h(Permanente, { pasoInicial: IDS.indexOf(id), ordenP3: ORDEN }));
/* Todo lo que hay en el DOM: el texto y los atributos (una cifra en una etiqueta accesible también cuenta). */
const todoElDom = (raiz) => [raiz.textContent, ...[...raiz.querySelectorAll("*")].flatMap((el) => [...el.attributes].map((a) => a.value)), ...[...raiz.querySelectorAll("input")].map((i) => i.value)].join(" ¦ ");

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDePantalla(x) {
  const dev = x.devoluciones ?? {};
  const devs = Object.values(dev).flatMap((v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.map((y) => y.texto) : Object.values(v)));
  const asiento = x.asiento ? [...Object.values(x.asiento.cruzado), ...Object.values(x.asiento.cuentaMal)] : [];
  const opciones = x.opciones ? x.opciones.flatMap((o) => [o.texto, o.retro].filter(Boolean)) : [];
  return [x.enunciado, ...devs, ...asiento, ...opciones, x.generica, x.acierto, x.pista];
}
function textosDelEstudiante() {
  const t = [
    T.R5_5.objetivo, T.ENTRADA_PERMANENTE.apertura, T.ENTRADA_PERMANENTE.instruccion,
    ...T.DATOS_DEL_LIBRO_PERMANENTE.flatMap((g) => g.frases), ...T.DATOS_DECLARADOS_PERMANENTE.datos,
    ...T.PANTALLAS.flatMap(textosDePantalla),
    ...Object.values(T.DETALLES),
    T.AVISO_COMA, T.COMUNES_PERMANENTE.hayMas, T.COMUNES_PERMANENTE.cuentaNoPrevista,
    ...P.EQUIVOCADAS.p3.botones.slice(1).map(T.lineaHabriaSido),
  ];
  return [...new Set(t)];
}
/* Los rótulos fijos de la lista de la v1 que E1 busca (v1.3: sin «Periódico», «Permanente», «A COSTO» ni «A PRECIO DE VENTA»; con «YA REGISTRADO»). */
const ROTULOS_E1 = [
  RP.cant, RP.cUnit, RP.total, RP.entrada, RP.salida, RP.saldo, RP.declarado, RP.aLaCompra, RP.alGasto, RP.costoUnitario, RP.costoTotal,
  RP.nuevoPromedio, RP.costoDeLas, RP.inventario, RP.unidades, RP.valorBarra, RP.vendidoEnElMes, RP.periodico, RP.permanente, RP.verSuCosto,
  RP.comaSola, RP.yaRegistrado,
];

test("★★★ cada texto del estudiante está entero en el paquete, y los rótulos en la lista del diseño (guarda: 72 textos, 22 rótulos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 72);
  /* La línea de lo que habría sido: el paquete da el texto y la cifra por separado. */
  const fuera = textos.filter((x) => !PLANO.includes(x) && !(x.startsWith("Así quedaba con tu valor: ") && PLANO.includes(`«Así quedaba con tu valor: N»`) && PLANO.includes(x.split(": ")[1])));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  assert.equal(ROTULOS_E1.length, 22);
  const lista = /Rótulos fijos de interfaz, ya decididos: ([^\n]+)/.exec(PAQUETE)[1];
  for (const r of ROTULOS_E1.filter((x) => x !== RP.yaRegistrado)) assert.ok(lista.includes(r), r);
  assert.ok(PLANO.includes(`«${RP.yaRegistrado}»`));
  /* La hoja de las pantallas 2 y 3: siete cuentas en su orden literal. */
  assert.ok(PLANO.includes(`Hoja de cuentas (pantallas 2 y 3), en este orden: ${T.HOJA_PERMANENTE.join(" · ")}.`));
  /* Los enunciados: ≤ 120; el de la 3, ≤ 60 (v1.1). Los detalles de fila, ≤ 20. */
  for (const x of T.PANTALLAS) assert.ok(x.enunciado.length <= (x.id === "p3" ? 60 : 120), x.id);
  for (const x of Object.values(T.DETALLES)) assert.ok(x.length <= 20, x);
  assert.ok(T.lineaHabriaSido(9000).length - ": 2.354.820".length <= 24);
});

/* ═══════════ LAS CIFRAS ═══════════ */

test("★★★ el kárdex sale de las reglas de t7_2Kardex.js y cada cifra del paquete coincide con el cálculo (guarda: 32 cifras)", () => {
  /* Las mismas reglas que t7_2: donde t7_2 sabe hacerlo (compras y ventas al promedio), da lo mismo. */
  const tramo1 = kardex(Object.assign([P.INICIAL.unidades, P.INICIAL.costo], { fecha: 1 }), [{ fecha: 2, compra: [5000, 2300] }], PROMEDIO);
  assert.deepEqual(tramo1[1].saldo[0], [6950, 2215.83, 15400000]);
  assert.deepEqual(P.mostrada(P.fila("c2").saldo), tramo1[1].saldo[0]);
  const desde15 = P.fila("d15").saldo;
  const tramo2 = kardex(Object.assign([desde15[0], desde15[2] / desde15[0]], { fecha: 15 }), [{ fecha: 25, compra: [7750, 2125] }, { fecha: 28, venta: 6100 }], PROMEDIO);
  assert.deepEqual(P.mostrada(P.fila("c25").saldo), tramo2[1].saldo[0]);
  assert.deepEqual(P.mostrada(P.fila("v28").mov), tramo2[2].salida[0]);
  assert.deepEqual(P.mostrada(P.fila("v28").saldo), tramo2[2].saldo[0]);
  /* Cada cifra que escribe el paquete, contra el cálculo. */
  const u = P.unitarioEnLibro;
  const e = P.EQUIVOCADAS;
  const cifras = [
    [u(P.CLAVES.p1.unitario), "$2.300,00"], [u(e.p1.precioDeFactura), "$2.185,00"], [u(e.p1.listaMasFlete), "$2.415,00"], [u(e.p1.promedioDeBodega), "$2.215,83"],
    [u(P.CLAVES.p2.promedio), "$2.219,28"], [cifraK(P.CLAVES.p2.costo), "$13.315.680"], [u(e.p2.promedioViejo), "$2.215,83"],
    [cifraK(e.p2.todoElSaldo), "$13.870.500"], [cifraK(e.p2.loCobrado[0]), "$54.000.000"], [cifraK(e.p2.loCobrado[1]), "$60.000.000"],
    [cifraK(P.CLAVES.p3.total), "$443.856"], [cifraK(P.INGRESO_P2), "$54.000.000"], [cifraK(P.INGRESO_P3), "$1.800.000"],
    [cifraK(P.fila("c25").mov[2]), "$16.468.750"], [u(P.CLAVES.p4.promedio), "$2.130,17"], [cifraK(P.CLAVES.p4.costo), "$12.994.061"],
    [cifraK(P.TOLERANCIA_P4.desde), "$12.994.030"], [cifraK(P.TOLERANCIA_P4.hasta), "$12.994.070"], [cifraK(P.costoConPromedioMostrado), "$12.994.037"],
    [u(e.p4.promedioViejo), "$2.219,28"], [u(e.p4.loteNuevo), "$2.125,00"], [u(e.p4.sinPesar), "$2.172,14"], [cifraK(e.p4.todoElSaldo), "$17.467.426"],
    [cifraK(e.p4.conPromedioViejo), "$13.537.608"], [cifraK(e.p4.loCobrado[0]), "$56.120.000"], [cifraK(e.p4.loCobrado[1]), "$61.000.000"],
    [cifraK(P.VENDIDO_PERIODICO), "$25.788.363"], [u(P.FRANJA_DEL_10.periodico), "$2.167,09"], [u(P.FRANJA_DEL_10.permanente), "$2.219,28"],
    [cifraK(P.habriaSido(9000)), "2.354.820"], [cifraK(P.habriaSido(2215.83)), "997.986"], [cifraK(P.habriaSido(2185)), "991.820"],
  ];
  assert.equal(cifras.length, 32);
  for (const [calculada, escrita] of cifras) {
    assert.equal(calculada, escrita.replace("$", ""), escrita);
    assert.ok(PLANO.includes(escrita), `${escrita} no está en el paquete`);
  }
  /* Lo que el paquete pide en palabras: el periódico exacto termina en ,5 y se muestra con Math.round; la diferencia, «unos $77.500». */
  assert.equal(P.PROMEDIO_PERIODICO * 11900, 25788362.5);
  assert.equal(P.VENDIDO_PERMANENTE, 25865885);
  assert.ok(PLANO.includes("PERMANENTE · 25.865.885"));
  assert.equal(Math.round((P.VENDIDO_PERMANENTE - P.VENDIDO_PERIODICO) / 500) * 500, 77500);
  assert.ok(p("p5").enunciado.includes("unos $77.500"));
  /* La entrada del 25, como la escribe el paquete. */
  assert.ok(PLANO.includes(`${cifraK(P.fila("c25").mov[0])} unidades a $${cifraK(P.fila("c25").mov[1])}, por $${cifraK(P.fila("c25").mov[2])}`));
});

/* ═══════════ LA CALIFICACIÓN ═══════════ */

test("★★★ pantalla 1: la clave, cada valor previsto con su texto, la genérica y la prioridad (decisión → costo)", () => {
  const x = p("p1");
  assert.deepEqual(J.evaluarP1({ destino: "compra", unitario: 2300 }), { ok: true, textos: [x.acierto], estados: { destino: "ok", unitario: "ok" } });
  for (const dv of x.devoluciones.unitario) for (const v of dv.valores) assert.deepEqual(J.evaluarP1({ destino: "compra", unitario: v }).textos, [dv.texto], String(v));
  assert.deepEqual(J.evaluarP1({ destino: "compra", unitario: 2301 }).textos, [x.generica]);
  assert.deepEqual(J.evaluarP1({ destino: "gasto", unitario: 2300 }).textos, [x.devoluciones.alGasto]);
  assert.deepEqual(J.evaluarP1({ destino: "gasto", unitario: 2185 }).textos, [x.devoluciones.alGasto, T.COMUNES_PERMANENTE.hayMas]);
});

test("★★★ pantalla 2: promedio → costo → asiento; los tres asientos equivocados del paquete y la genérica de cuenta", () => {
  const x = p("p2");
  const bien = conId(x.asiento.correctos[0]);
  assert.equal(J.evaluarP2({ promedio: 2219.28, costo: 13315680, renglones: bien }).ok, true);
  const [dvViejo, dvLote, dvVenta] = x.devoluciones.promedio;
  for (const [v, dv] of [[2215.83, dvViejo], [2000, dvLote], [2185, dvLote], [2300, dvLote], [9000, dvVenta], [10000, dvVenta]]) {
    assert.deepEqual(J.evaluarP2({ promedio: v, costo: 13315680, renglones: bien }).textos, [dv.texto], String(v));
  }
  for (const dv of x.devoluciones.costo) for (const v of dv.valores) assert.deepEqual(J.evaluarP2({ promedio: 2219.28, costo: v, renglones: bien }).textos, [dv.texto], String(v));
  /* La prioridad: el promedio va primero, y con más errores, «Y hay más por revisar.». */
  assert.deepEqual(J.evaluarP2({ promedio: 2215.83, costo: 13870500, renglones: bien }).textos, [dvViejo.texto, T.COMUNES_PERMANENTE.hayMas]);
  assert.deepEqual(J.evaluarP2({ promedio: 1, costo: 1, renglones: bien }).textos, [x.generica]);
  /* El asiento. */
  const c = 13315680;
  const asiento = (rs) => J.evaluarP2({ promedio: 2219.28, costo: c, renglones: conId(rs) });
  assert.deepEqual(asiento([hb(CMV, c), d(INVENTARIO, c)]).textos, [x.asiento.cruzado[CMV]]);
  assert.deepEqual(asiento([d(CMV, c), hb(CAJA, c)]).textos, [x.asiento.cuentaMal[CAJA]], "una cuenta en lugar de otra es un error, no dos");
  assert.deepEqual(asiento([d(CMV, c), hb(INGRESOS, c)]).textos, [x.asiento.cuentaMal[INGRESOS]]);
  assert.deepEqual(asiento([d(CMV, c), hb(COMPRAS, c)]).textos, [x.asiento.cuentaMal[COMPRAS]]);
  assert.deepEqual(asiento([d(CMV, c), hb(DEVOLUCIONES, c)]).textos, [T.COMUNES_PERMANENTE.cuentaNoPrevista]);
  assert.deepEqual(asiento([d(CMV, 13870500), hb(INVENTARIO, 13870500)]).textos, [x.devoluciones.costo[0].texto]);
  assert.deepEqual(asiento([d(CMV, 1), hb(INVENTARIO, 1)]).textos, [x.generica]);
  assert.equal(x.asiento.cruzado[CMV], "La mercancía sale de la bodega, así que Inventario baja por el haber. El costo va al debe.");
});

test("★★★ pantalla 3: valor → asiento; cada botón con su texto y los asientos equivocados", () => {
  const x = p("p3");
  const bien = conId(x.asiento.correctos[0]);
  assert.equal(J.evaluarP3({ unitario: 2219.28, renglones: bien }).ok, true);
  for (const v of [9000, 2215.83, 2185]) assert.deepEqual(J.evaluarP3({ unitario: v, renglones: bien }).textos, [x.devoluciones.valor[v]], String(v));
  const t = 443856;
  const asiento = (rs) => J.evaluarP3({ unitario: 2219.28, renglones: conId(rs) }).textos;
  assert.deepEqual(asiento([hb(INVENTARIO, t), d(CMV, t)]), [x.asiento.cruzado[INVENTARIO]]);
  assert.deepEqual(asiento([d(INVENTARIO, t), hb(DEVOLUCIONES, t)]), [x.asiento.cuentaMal[DEVOLUCIONES]]);
  assert.deepEqual(asiento([d(INVENTARIO, t), hb(CLIENTES, t)]), [x.asiento.cuentaMal[CLIENTES]]);
  assert.deepEqual(asiento([d(INVENTARIO, t), hb(CAJA, t)]), [T.COMUNES_PERMANENTE.cuentaNoPrevista]);
  assert.deepEqual(asiento([d(INVENTARIO, 1), hb(CMV, 1)]), [x.generica]);
  assert.deepEqual(J.evaluarP3({ unitario: 9000, renglones: conId([hb(INVENTARIO, t), d(CMV, t)]) }).textos, [x.devoluciones.valor[9000], T.COMUNES_PERMANENTE.hayMas]);
});

test("★★★ pantalla 4: el costo vale de 12.994.030 a 12.994.070 (decisión 3); promedio → costo; cada valor previsto", () => {
  const x = p("p4");
  for (const c of [12994030, 12994037, 12994061, 12994070]) assert.equal(J.evaluarP4({ promedio: 2130.17, costo: c }).ok, true, String(c));
  for (const c of [12994029, 12994071]) assert.equal(J.evaluarP4({ promedio: 2130.17, costo: c }).ok, false, String(c));
  for (const dv of x.devoluciones.promedio) for (const v of dv.valores) assert.deepEqual(J.evaluarP4({ promedio: v, costo: 12994061 }).textos, [dv.texto], String(v));
  for (const dv of x.devoluciones.costo) for (const v of dv.valores) assert.deepEqual(J.evaluarP4({ promedio: 2130.17, costo: v }).textos, [dv.texto], String(v));
  assert.deepEqual(J.evaluarP4({ promedio: 2125, costo: 13537608 }).textos, [x.devoluciones.promedio[1].texto, T.COMUNES_PERMANENTE.hayMas]);
  assert.deepEqual(J.evaluarP4({ promedio: 2130.17, costo: 5 }).textos, [x.generica]);
  /* Comparado como número a dos decimales: 2.130,17 y 2130.170 son lo mismo. */
  assert.equal(J.evaluarP4({ promedio: 2130.170000001, costo: 12994061 }).ok, true);
});

test("★★★ pantalla 5: la clave es a; b, c y d con su devolución; la pregunta no se muestra aparte (B5)", async () => {
  const x = p("p5");
  assert.deepEqual(J.evaluarP5("a").textos, [x.acierto]);
  for (const o of x.opciones.filter((y) => !y.correcta)) assert.deepEqual(J.evaluarP5(o.id).textos, [o.retro, x.generica], o.id);
  const { caja } = await abrir("p5");
  assert.equal(caja.textContent.includes(x.pregunta), false);
});

/* ═══════════ LOS CAMPOS ═══════════ */

test("★★★ la coma se pone sola: 2, 2, 1, 9, 2, 8 → 0,02 … 2.219,28; lo pegado pierde lo que no es dígito", async () => {
  const pasos = ["2", "22", "221", "2219", "22192", "221928"].map((x) => pintarUnitario(leerUnitario(x)));
  assert.deepEqual(pasos, ["0,02", "0,22", "2,21", "22,19", "221,92", "2.219,28"]);
  assert.equal(leerUnitario("2.219,28"), 2219.28);
  assert.equal(leerUnitario("$ 2,300.00"), 2300);
  assert.equal(leerUnitario(""), null);
  /* En la pantalla: el campo escrito dígito a dígito. */
  const { caja } = await abrir("p1");
  await tocar($(caja, "[data-eleccion=compra]"));
  const campo = $(caja, "[data-campo=unitario]");
  assert.equal(campo.getAttribute("inputmode"), "numeric");
  assert.equal(campo.getAttribute("placeholder"), "0,00");
  let texto = "";
  const vistos = [];
  for (const dgt of "221928") { texto = campo.value + dgt; await escribir(campo, texto); vistos.push(campo.value); }
  assert.deepEqual(vistos, ["0,02", "0,22", "2,21", "22,19", "221,92", "2.219,28"]);
  /* «La coma se pone sola.», una sola vez en la pieza: debajo del campo de la pantalla 1 (v1.1). */
  assert.equal($(caja, "[data-coma-sola]").textContent, RP.comaSola);
});

test("★★★ la red de la coma (v1.3, decisión 3): un unitario < 100 no se califica, sale el aviso y la calificación sigue siendo una", async () => {
  assert.equal(J.faltaLaComa(23), true);
  assert.equal(J.faltaLaComa(99.99), true);
  assert.equal(J.faltaLaComa(100), false);
  assert.equal(J.faltaLaComa(null), false);
  for (const id of ["p1", "p2", "p4"]) {
    const filas = [];
    const { caja } = await montar(h(Permanente, { pasoInicial: IDS.indexOf(id), onCompletar: () => {}, ordenP3: ORDEN }));
    if (id === "p1") await tocar($(caja, "[data-eleccion=compra]"));
    const campo = id === "p1" ? "[data-campo=unitario]" : "[data-campo=promedio]";
    await escribir($(caja, campo), "2300");
    if (id !== "p1") await escribir($(caja, "[data-campo=costo]"), "1");
    await tocar($(caja, id === "p2" ? "[data-revisar-valores]" : "[data-revisar]"));
    assert.equal($(caja, "[data-aviso-coma]")?.textContent, T.AVISO_COMA, id);
    assert.equal($(caja, "[data-devolucion]").dataset.devolucion, "vacia", `${id}: no califica`);
    assert.equal(Boolean($(caja, "[data-veredicto]")), false, `${id}: ningún campo toma estado`);
    /* El aviso no revela la clave. */
    for (const c of ["2.300", "2.219,28", "2.130,17"]) assert.equal($(caja, "[data-aviso-coma]").textContent.includes(c), false);
    /* Al corregir se va. */
    await escribir($(caja, campo), "230000");
    assert.equal(Boolean($(caja, "[data-aviso-coma]")), false, id);
    filas.push(id);
  }
});

/* ═══════════ FP, PUERTAS Y MIGRACIÓN ═══════════ */

test("★★★ FP: 10 por acierto, sin mitades, los mismos que el servidor (0017)", () => {
  const delServidor = (pct) => { const r = Math.max(50, Math.min(100, Math.round(pct))); return Math.floor((50 * r + 50) / 100); };
  const fps = [];
  for (let k = 0; k <= 5; k++) {
    const pct = J.puntuarR5_5(k);
    assert.equal(Number.isInteger(pct), true);
    assert.equal(Number.isInteger(50 * pct / 100), true, `${k} de 5: mitad de FP`);
    /* 300 s: por encima del tiempo mínimo de difícil, el factor de tiempo es 1. */
    const { fp } = calcularFP({ dificultad: T.R5_5.dificultad, modalidad: T.R5_5.modalidad, aciertos: pct / 100, duracionMs: 300_000 });
    assert.equal(fp, delServidor(pct), `${k} de 5`);
    fps.push(fp);
  }
  assert.deepEqual(fps, [25, 25, 25, 30, 40, 50]);
});

test("★★★ catálogo, registro de la vista, etiqueta y migración 0254 dicen lo mismo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "repaso-capitulo-5");
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1", "r5-2", "r5-3", "r5-4", "r5-5"]);
  const a = actividadesDeTipo(tema, HACER).find((x) => x.id === "r5-5");
  assert.equal(a.nombre, T.R5_5.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-5").Mecanica, Permanente);
  assert.ok(hayReglaPara("r5-5"));
  assert.equal(etiquetaDeItem("r5-5", "p4"), "Pantalla 4 · Llega el lote barato y sale la del 28");
  assert.equal(new Set(IDS.map((id) => etiquetaDeItem("r5-5", id))).size, 5);
  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => /^\d{4}_/.test(f) && leer(`supabase/migrations/${f}`).includes("'r5-5'"));
  assert.deepEqual(migraciones, ["0254_r5_5_septiembre_en_permanente.sql"]);
  const sql = leer(`supabase/migrations/${migraciones[0]}`);
  assert.match(sql, /\('r5-5', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'dificil', 50, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i);
  assert.match(sql, /--\s+delete from public\.actividad_catalogo where activity_id = 'r5-5';/);
});

/* ═══════════ E8 · NADA QUE SE CALIFICA A LA VISTA ANTES DE TIEMPO ═══════════ */

/* Lo que pide calcular cada pantalla (y lo que lo delata por resta: el saldo del 28). */
const CALIFICADAS = {
  p1: [P.unitarioEnLibro(P.CLAVES.p1.unitario), cifraK(P.fila("c2").mov[2])],
  p2: [P.unitarioEnLibro(P.CLAVES.p2.promedio), cifraK(P.CLAVES.p2.costo)],
  p3: [cifraK(P.CLAVES.p3.total)],
  p4: [P.unitarioEnLibro(P.CLAVES.p4.promedio), cifraK(P.CLAVES.p4.costo), cifraK(Math.round(P.fila("v28").saldo[2]))],
};
const pendientesDesde = (id) => IDS.slice(IDS.indexOf(id)).filter((x) => CALIFICADAS[x]);
const asegurarTapadas = (caja, ids, estado, excepto = []) => {
  const todo = todoElDom(caja);
  for (const x of ids) for (const c of CALIFICADAS[x]) {
    if (excepto.includes(c)) continue;
    assert.equal(todo.includes(c), false, `${estado}: «${c}» (de ${x}) está en el DOM antes de revisar`);
  }
};

test("★★★ E8 · ninguna cifra que se califica está en el DOM antes de revisar su pantalla (filas plegadas, barra, contorno y franja incluidas)", async () => {
  /* Pantalla 1: antes del toque, con el campo abierto, y después de revisar (lo de la 2 y la 4 sigue tapado). */
  let m = await abrir("p1");
  asegurarTapadas(m.caja, pendientesDesde("p1"), "p1 antes");
  await tocar($(m.caja, "[data-eleccion=gasto]"));
  asegurarTapadas(m.caja, pendientesDesde("p1"), "p1 con el campo");
  await tocar($(m.caja, "[data-ver-pista]"));
  asegurarTapadas(m.caja, pendientesDesde("p1"), "p1 con la pista");
  await escribir($(m.caja, "[data-campo=unitario]"), "218500");
  await tocar($(m.caja, "[data-revisar]"));
  asegurarTapadas(m.caja, pendientesDesde("p2"), "p1 revisada");
  assert.equal(m.caja.querySelectorAll("[data-fila=d8] [data-tapada]").length, 1, "el saldo unitario del 8 sigue tapado");
  m.desmontar();
  /* Pantalla 2: antes de revisar los valores. */
  m = await abrir("p2");
  asegurarTapadas(m.caja, pendientesDesde("p2"), "p2 antes");
  m.desmontar();
  /* Pantalla 3: antes del toque. La excepción escrita (v1.3, decisión 5): la fila del 10 sigue mostrando 2.219,28. */
  m = await abrir("p3");
  asegurarTapadas(m.caja, pendientesDesde("p3"), "p3 antes");
  assert.equal($(m.caja, "[data-fila=v10]").textContent.includes("2.219,28"), true);
  assert.equal($(m.caja, "[data-asiento-del-costo]"), null, "el armador aparece solo después del valor");
  m.desmontar();
  /* Pantalla 4: antes de revisar, con la pista. */
  m = await abrir("p4");
  await tocar($(m.caja, "[data-ver-pista]"));
  asegurarTapadas(m.caja, pendientesDesde("p4"), "p4 antes");
  m.desmontar();
  /* Pantalla 5: las opciones no están antes del toque; la franja del 10 sale al tocar. */
  m = await abrir("p5");
  assert.equal($(m.caja, "[data-opciones]"), null);
  assert.equal(m.caja.textContent.includes("2.167,09"), false);
  await tocar($(m.caja, "[data-fila-del-diez]"));
  assert.ok($(m.caja, "[data-franja-del-diez]").textContent.includes("2.167,09"));
  assert.equal(m.caja.querySelectorAll("[data-opcion]").length, 4);
});

test("★★★ E8 · al revisar se destapan los valores correctos y la celda tapada no tiene texto ni borde (v1.3, decisión 6)", async () => {
  const { caja } = await abrir("p2");
  const tapadas = [...caja.querySelectorAll("[data-tapada]")];
  assert.equal(tapadas.length, 5);
  for (const t of tapadas) {
    assert.equal(t.textContent, "");
    assert.equal(t.getAttribute("aria-label"), RP.pendiente);
    assert.equal(t.style.border, "");
    assert.equal(t.style.background, "rgb(14, 27, 46)");
  }
  /* Valores equivocados: los campos toman su estado y el kárdex muestra los correctos («no hay "Era X"»). */
  await escribir($(caja, "[data-campo=promedio]"), "221583");
  await escribir($(caja, "[data-campo=costo]"), "13870500");
  await tocar($(caja, "[data-revisar-valores]"));
  assert.equal(caja.querySelectorAll("[data-tapada]").length, 0);
  assert.deepEqual([...caja.querySelectorAll("[data-fila=v10] [data-renglon-k=mov] [data-celda]")].map((c) => c.textContent), ["6.000", "2.219,28", "13.315.680"]);
  assert.deepEqual([...caja.querySelectorAll("[data-campo-bloque] [data-veredicto]")].map((x) => x.textContent), ["No es este valor", "No es este valor"]);
  assert.equal($(caja, "[data-barra-cifra=unidades]").textContent, "250 u");
});

/* ═══════════ LA PANTALLA 3: EL VALOR Y LO QUE HABRÍA SIDO ═══════════ */

test("★★★ pantalla 3: con un valor equivocado, la fila se corrige, «Era esta» en 2.219,28, el contorno y la línea con la cifra", async () => {
  for (const v of [9000, 2215.83, 2185]) {
    const { caja, desmontar } = await abrir("p3");
    assert.deepEqual([...caja.querySelectorAll("[data-eleccion]")].map((b) => b.dataset.eleccion), ORDEN.map(String));
    await tocar($(caja, `[data-eleccion="${v}"]`));
    assert.equal($(caja, `[data-eleccion="${v}"]`).dataset.estado, "mal");
    assert.equal($(caja, "[data-eleccion=\"2219.28\"]").dataset.estado, "revelada");
    assert.deepEqual([...caja.querySelectorAll("[data-fila=d15] [data-renglon-k=mov] [data-celda]")].map((c) => c.textContent), ["200", "2.219,28", "443.856"]);
    assert.equal($(caja, "[data-linea-habria]").textContent, T.lineaHabriaSido(v));
    assert.ok($(caja, "[data-contorno]"));
    assert.equal($(caja, "[data-barra-cifra=valor]").textContent, "998.676");
    assert.ok($(caja, "[data-asiento-del-costo]"));
    desmontar();
  }
  const { caja } = await abrir("p3");
  await tocar($(caja, "[data-eleccion=\"2219.28\"]"));
  assert.equal($(caja, "[data-eleccion=\"2219.28\"]").dataset.estado, "ok");
  assert.equal($(caja, "[data-contorno]"), null);
  assert.equal($(caja, "[data-linea-habria]"), null);
  /* El asiento del ingreso, de solo lectura con «YA REGISTRADO», encima del armador (v1.3, decisión 2). */
  const ya = $(caja, "[data-armador=ya-registrado]");
  assert.ok(ya.textContent.startsWith(RP.yaRegistrado));
  assert.ok(ya.textContent.includes(DEVOLUCIONES) && ya.textContent.includes("1.800.000"));
  assert.equal(ya.querySelector("button"), null);
});

test("★★ la rejilla de la pantalla 3 se baraja por intento y tiene siempre las cuatro cifras del paquete", async () => {
  const vistos = new Set();
  for (let k = 0; k < 12; k++) {
    const { caja, desmontar } = await montar(h(Permanente, { pasoInicial: 2 }));
    const orden = [...caja.querySelectorAll("[data-eleccion]")].map((b) => b.dataset.eleccion);
    assert.deepEqual([...orden].sort(), P.EQUIVOCADAS.p3.botones.map(String).sort());
    vistos.add(orden.join());
    desmontar();
  }
  assert.ok(vistos.size > 1, "doce intentos con el mismo orden: no se baraja");
});

/* ═══════════ E1 · TODO LO DEL PAQUETE LLEGA A LA PANTALLA ═══════════ */

const CAMINOS = {
  p1: [
    {}, { destino: "gasto" }, { unitario: 2185 }, { unitario: 2415 }, { unitario: 2215.83 }, { unitario: 2301 },
  ],
  p2: [
    {}, { promedio: 2215.83 }, { promedio: 2000 }, { promedio: 9000 }, { costo: 13870500 }, { costo: 54000000 }, { promedio: 1234, costo: 2 },
    { renglones: [hb(CMV, 13315680), d(INVENTARIO, 13315680)] }, { renglones: [d(CMV, 13315680), hb(CAJA, 13315680)] },
    { renglones: [d(CMV, 13315680), hb(COMPRAS, 13315680)] }, { renglones: [d(CMV, 13315680), hb(DEVOLUCIONES, 13315680)] },
    { promedio: 2215.83, costo: 13870500 },
  ],
  p3: [
    {}, { unitario: 9000 }, { unitario: 2215.83 }, { unitario: 2185 },
    { renglones: [hb(INVENTARIO, 443856), d(CMV, 443856)] }, { renglones: [d(INVENTARIO, 443856), hb(DEVOLUCIONES, 443856)] },
    { renglones: [d(INVENTARIO, 443856), hb(CLIENTES, 443856)] }, { renglones: [d(INVENTARIO, 1), hb(CMV, 1)] },
  ],
  p4: [
    {}, { promedio: 2219.28 }, { promedio: 2125 }, { promedio: 2172.14 }, { costo: 17467426 }, { costo: 13537608 }, { costo: 56120000 }, { costo: 5 },
  ],
  p5: [{ opcion: "a" }, { opcion: "b" }, { opcion: "c" }, { opcion: "d" }],
};

async function vistasDeTodo() {
  const vistas = [];
  const entrada = await montar(h(Permanente, {}));
  vistas.push(entrada.caja.textContent);
  entrada.desmontar();
  let caminos = 0;
  for (const id of IDS) {
    for (const c of CAMINOS[id]) {
      const { caja, desmontar } = await abrir(id);
      if (!caminos || c === CAMINOS[id][0]) { await tocar($(caja, "[data-ver-pista]")); vistas.push(caja.textContent); }
      if (id === "p1" && c === CAMINOS.p1[0]) {
        await tocar($(caja, "[data-eleccion=compra]"));
        await escribir($(caja, "[data-campo=unitario]"), "2300");
        await tocar($(caja, "[data-revisar]"));
        vistas.push(caja.textContent);
        await escribir($(caja, "[data-campo=unitario]"), "");
        await tocar($(caja, "[data-eleccion=compra]"));
        await escribir($(caja, "[data-campo=unitario]"), "230000");
        await tocar($(caja, "[data-revisar]"));
      } else {
        await JUGAR[id](caja, c);
      }
      vistas.push(caja.textContent);
      caminos++;
      desmontar();
    }
  }
  /* El cierre: el kárdex entero. */
  const final = await montar(h(Permanente, { pasoInicial: 4 }));
  await JUGAR.p5(final.caja);
  await tocar($(final.caja, "[data-siguiente]"));
  vistas.push(final.caja.textContent);
  final.desmontar();
  return { vistas, caminos };
}

test("★★★ E1 · cada texto del paquete y cada rótulo fijo salen en la pantalla en algún estado (guarda: 72 textos, 22 rótulos, 38 caminos)", async () => {
  const { vistas, caminos } = await vistasDeTodo();
  const todo = vistas.join("\n");
  const faltan = [...textosDelEstudiante(), ...ROTULOS_E1].filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, [], `no salen en pantalla: ${faltan.join(" | ")}`);
  assert.equal(caminos, 38, "no jugó los caminos que dice jugar");
  /* Lo retirado en la v1.3 no sale. */
  for (const t of ["A COSTO", "A PRECIO DE VENTA", p("p5").pregunta]) assert.equal(todo.includes(t), false, t);
});

/* ═══════════ B5 · NINGUNA FRASE DOS VECES EN LA MISMA PANTALLA ═══════════ */

test("★★ B5 · ninguna frase sale dos veces en la misma pantalla, contando la pista abierta (los nombres de cuenta no cuentan)", async () => {
  const cuentas = new Set(T.HOJA_PERMANENTE);
  const repetidas = (raiz) => {
    const hojas = [...raiz.querySelectorAll("p, span, button, h3, li, div, label")].filter((el) => !el.children.length).map((el) => el.textContent.trim())
      .filter((t) => t.split(/\s+/).length >= 3 && !cuentas.has(t));
    return hojas.filter((t, k) => hojas.indexOf(t) !== k);
  };
  let estados = 0;
  const entrada = await montar(h(Permanente, {}));
  assert.deepEqual(repetidas(entrada.caja), [], "entrada");
  entrada.desmontar();
  estados++;
  for (const id of IDS) {
    for (const c of CAMINOS[id]) {
      const { caja, desmontar } = await abrir(id);
      await tocar($(caja, "[data-ver-pista]"));
      assert.deepEqual(repetidas(caja), [], `${id} antes, con la pista`);
      await JUGAR[id](caja, c);
      assert.deepEqual(repetidas(caja), [], `${id} ${JSON.stringify(c)}`);
      estados += 2;
      desmontar();
    }
  }
  assert.equal(estados, 77);
});

/* ═══════════ LA PARTIDA ENTERA ═══════════ */

test("★★★ se juega entera: cinco pantallas, una calificación cada una, el detalle y el kárdex cerrado encima del Cierre", async () => {
  let fin = null;
  const { caja } = await montar(h(Permanente, { onCompletar: (pct, ms, detalle) => { fin = { pct, detalle }; }, ordenP3: ORDEN }));
  await tocar($(caja, "[data-empezar]"));
  for (const id of IDS) {
    assert.equal($(caja, "[data-progreso]").textContent, RP.progreso(IDS.indexOf(id) + 1, 5));
    assert.equal($(caja, "[data-enunciado]").textContent, p(id).enunciado);
    if (id === "p2") await tocar($(caja, "[data-ver-pista]"));
    /* La 3 y la 5, con error. */
    await JUGAR[id](caja, id === "p3" ? { unitario: 2215.83 } : id === "p5" ? { opcion: "d" } : {});
    await tocar($(caja, "[data-siguiente]"));
  }
  assert.ok($(caja, "[data-cierre] [data-kardex-cerrado]"));
  assert.deepEqual([...caja.querySelectorAll("[data-kardex-cerrado] [data-fila]")].map((f) => f.dataset.modo), ["plegada", "plegada", "plegada", "plegada", "plegada", "plegada", "abierta"]);
  assert.equal(fin.pct, 60);
  assert.deepEqual(fin.detalle.map((x) => [x.item, x.ok, x.intentos, x.orden, x.pista]), [
    ["p1", true, 1, 1, false], ["p2", true, 1, 2, true], ["p3", false, 1, 3, false], ["p4", true, 1, 4, false], ["p5", false, 1, 5, false],
  ]);
  assert.equal(fin.detalle[2].respuesta.startsWith("2215.83 · "), true);
  assert.equal(fin.detalle[4].respuesta, "d");
  for (const x of fin.detalle) assert.ok(x.respuesta === null || x.respuesta.length <= J.LARGO_RESPUESTA);
});

/* ═══════════ B4 E INFLESZ ═══════════ */

test("★★ B4 · los estados de r5-5 son los de comun.jsx: neutro con palabra en el acierto, coral en el error, discontinuo en lo revelado", async () => {
  const fuente = leer("src/components/repasoCap5/Permanente.jsx");
  assert.doesNotMatch(fuente, /teal|#2A9D8F/i);
  assert.match(fuente, /import \{[^}]*\bESTADOS\b[^}]*\} from "\.\/comun\.jsx"/);
  const borde = (b) => { const e = document.createElement("div"); e.style.border = b; return e.style.border; };
  const { caja } = await abrir("p1");
  await tocar($(caja, "[data-eleccion=gasto]"));
  assert.equal($(caja, "[data-eleccion=gasto]").style.border, borde(ESTADOS.mal.border));
  assert.equal($(caja, "[data-eleccion=compra]").style.border, borde(ESTADOS.revelada.border));
  assert.deepEqual([...caja.querySelectorAll("[data-eleccion]")].map((b) => b.textContent), [`${RP.aLaCompra}Era esta`, `${RP.alGasto}Incorrecta`]);
  await escribir($(caja, "[data-campo=unitario]"), "230000");
  await tocar($(caja, "[data-revisar]"));
  assert.equal($(caja, "[data-campo=unitario]").style.border, borde(ESTADOS.ok.border));
  assert.equal($(caja, "[data-campo-bloque=unitario] [data-veredicto]").textContent, "Correcto");
});

/* v1.4: la opción b se reescribió (88,4): la prueba vuelve a cubrir todo, sin excepción. */
test("★★★ todo texto de 10 palabras o más pasa 65 con inflesz.js (guarda: 56 medidos)", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], `letra que la herramienta no sabe contar: ${t}`);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 56, "no midió los textos que dice medir");
  assert.deepEqual(bajos, []);
});

/* ═══════════ E12 · LA CLAVE NO SE DELATA POR SU FORMA ═══════════ */

/*
 * v1.4 (Kamogawa, «dos fugas»): en cada pantalla de opciones o botones, la
 * clave no puede ser la única con una forma distinta: centavos distintos de
 * ,00, una unidad ($, %, u, días, meses, años) o un largo fuera de ±15 % del
 * promedio. Se mira lo que el estudiante lee en el botón o la opción.
 */
const FORMAS = {
  centavos: (t) => /,\d\d\b/.test(t) && !/,00\b/.test(t),
  unidad: (t) => /\$|%|\bu\b|\bdías?\b|\bmeses?\b|\baños?\b/.test(t),
};
const delata = (textos, k) => {
  const fuera = [];
  for (const [nombre, f] of Object.entries(FORMAS)) {
    const v = textos.map(f);
    if (v.filter((x) => x === v[k]).length === 1) fuera.push(nombre);
  }
  const media = textos.reduce((a, t) => a + t.length, 0) / textos.length;
  const largo = textos.map((t) => Math.abs(t.length - media) > 0.15 * media);
  if (largo[k] && largo.filter(Boolean).length === 1) fuera.push("largo");
  return fuera;
};
const PANTALLAS_CON_ELECCION = () => [
  { id: "p1", textos: [RP.aLaCompra, RP.alGasto], clave: 0 },
  { id: "p3", textos: p("p3").botones.map(P.unitarioEnLibro), clave: p("p3").botones.indexOf(p("p3").clave.unitario) },
  { id: "p5", textos: p("p5").opciones.map((o) => o.texto), clave: p("p5").opciones.findIndex((o) => o.correcta) },
];

test("★★★ E12 · en cada pantalla de opciones o botones, la clave no es la única con otra forma (centavos, unidad o largo ±15 %) (guarda: 3 pantallas)", () => {
  const pantallas = PANTALLAS_CON_ELECCION();
  assert.equal(pantallas.length, 3);
  for (const x of pantallas) {
    assert.ok(x.clave >= 0, x.id);
    assert.deepEqual(delata(x.textos, x.clave), [], `${x.id}: la clave se delata por ${delata(x.textos, x.clave).join(", ")} · ${x.textos.join(" | ")}`);
  }
  /* La regla atrapa lo que había: con 10.000, la clave era la única con centavos. */
  assert.deepEqual(delata(["2.219,28", "9.000,00", "10.000,00", "2.185,00"], 0), ["centavos"]);
  const veinte = "x".repeat(20);
  assert.deepEqual(delata([veinte, veinte, veinte, veinte, "x".repeat(30)], 4), ["largo"]);
  /* Los cuatro botones de la 3, en el orden de Kamogawa, y 2.215,83 sale del kárdex. */
  assert.deepEqual(p("p3").botones.map(P.unitarioEnLibro), ["2.219,28", "2.215,83", "2.185,00", "9.000,00"]);
  assert.equal(p("p3").botones[1], Math.round(P.fila("c2").saldo[1] * 100) / 100);
});
